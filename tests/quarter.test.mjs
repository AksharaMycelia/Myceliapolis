import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import worker from '../_worker.js';

function environment(){
  const sqlite=new DatabaseSync(':memory:');sqlite.exec('PRAGMA foreign_keys=ON');
  const db={fail:false,prepare(sql){return {sql,args:[],bind(...args){this.args=args;return this;},async first(){return sqlite.prepare(sql).get(...this.args)||null;}};},async batch(statements){
    sqlite.exec('BEGIN');try{const result=statements.map(s=>{if(db.fail&&s.sql.startsWith('SELECT id,parent_id,body_hash FROM quarter_fragments'))throw Error('readback failure');return {results:sqlite.prepare(s.sql).all(...s.args)};});sqlite.exec('COMMIT');return result;}catch(e){sqlite.exec('ROLLBACK');throw e;}
  }};
  return {sqlite,RUMORS_DB:db,ASSETS:{fetch:()=>new Response('asset')}};
}
const call=(env,path,options={})=>worker.fetch(new Request('https://myceliapolis.com'+path,options),env);
const post=(env,body,parent_id=null,request_id=crypto.randomUUID(),ip='192.0.2.2')=>call(env,'/api/fragments/',{method:'POST',headers:{'Content-Type':'application/json','CF-Connecting-IP':ip},body:JSON.stringify({body,parent_id,request_id})});

test('five public rooms and text siblings exist; six founding fragments are not visitor events',async()=>{
  const env=environment();
  for(const path of ['/after/','/conservatory/','/chronicle/','/chair/','/atlas/','/after/guide/','/md/after.md','/md/conservatory.md','/md/chronicle.md','/md/chair.md','/md/atlas.md'])assert.equal((await call(env,path)).status,200,path);
  const data=await (await call(env,'/api/quarter/')).json();assert.equal(data.counts.beginnings,6);assert.equal(data.counts.visitor_contributions,0);assert.equal(data.counts.responses,0);
  const ledger=await (await call(env,'/api/chronicle/')).json();assert.equal(ledger.events.length,0);
});
test('save beginning and two independent responses; receipts and chronicle reflect actual rows',async()=>{
  const env=environment(),root=await (await post(env,'The window remembered')).json();
  const a=await (await post(env,'a bird that had never landed.',root.id)).json();
  const b=await (await post(env,'the rain, but not its name.',root.id)).json();
  for(const item of [root,a,b]){assert.equal(item.accepted,true);assert.equal((await call(env,item.url)).status,200);}
  const thread=await (await call(env,'/api/fragments/'+root.id+'/')).json();assert.equal(thread.responses.length,2);
  const stats=await (await call(env,'/api/quarter/')).json();assert.equal(stats.counts.visitor_contributions,3);assert.equal(stats.counts.responses,2);
  const ledger=await (await call(env,'/api/chronicle/')).json();assert.equal(ledger.events.length,3);
  assert.equal(env.sqlite.prepare("SELECT count(*) AS n FROM quarter_fragments WHERE kind='visitor'").get().n,3);
});
test('idempotent concurrent retries, conflicting body/parent, and atomic rollback',async()=>{
  const env=environment(),id=crypto.randomUUID();
  const [a,b]=await Promise.all([post(env,'A branch waits.',null,id),post(env,'A branch waits.',null,id)]);
  assert.deepEqual(await a.json(),await b.json());
  assert.equal((await post(env,'Different words.',null,id)).status,409);
  assert.equal((await post(env,'A branch waits.','seed-lamp',id)).status,409);
  env.RUMORS_DB.fail=true;const failed=await post(env,'This must roll back.');assert.equal(failed.status,503);
  assert.equal(env.sqlite.prepare("SELECT count(*) AS n FROM quarter_fragments WHERE kind='visitor'").get().n,1);
});
test('untrusted markup is inert and private fields never enter public responses',async()=>{
  const env=environment(),result=await (await post(env,'<script>steal()</script>')).json();
  const page=await (await call(env,result.url)).text();assert.ok(page.includes('&lt;script&gt;'));assert.ok(!page.includes('<script>'));
  for(const path of ['/api/fragments/','/api/fragments/'+result.id+'/','/api/chronicle/','/api/quarter/']){
    const text=await (await call(env,path)).text();assert.ok(text.includes('"untrusted_content":true'));assert.doesNotMatch(text,/network_hash|network_salt|192\.0\.2\.2|body_hash/);
  }
});
test('plain form posts persist, redirects to its receipt, and failures preserve text and retry ID',async()=>{
  const env=environment(),id=crypto.randomUUID();
  const form=body=>call(env,'/conservatory/contribute/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded',Origin:'https://myceliapolis.com'},body:new URLSearchParams({body,parent_id:'seed-lamp',request_id:id})});
  const result=await form('The lamp warmed an unfamiliar hand.');assert.equal(result.status,303);assert.equal((await call(env,result.headers.get('Location'))).status,200);
  const missing=await call({},'/conservatory/contribute/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({body:'Keep these words.',request_id:id})});
  assert.equal(missing.status,503);const text=await missing.text();assert.match(text,/Keep these words\./);assert.ok(text.includes(id));
});
test('bounds, Unicode, origin, method and parent validity are enforced',async()=>{
  const env=environment();for(const body of ['', 'x'.repeat(601),'bad\u0000'])assert.equal((await post(env,body)).status,400);
  assert.equal((await post(env,'🌱'.repeat(600))).status,200);
  assert.equal((await post(env,'a','missing')).status,404);
  const reply=await (await post(env,'a','seed-home')).json();assert.equal((await post(env,'b',reply.id)).status,404);
  assert.equal((await call(env,'/api/fragments/',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://foreign.example'},body:'{}'})).status,403);
  assert.equal((await call(env,'/api/fragments/',{method:'POST',headers:{'Content-Type':'text/plain'},body:'a'})).status,415);
  assert.equal((await call(env,'/api/quarter/',{method:'DELETE'})).status,405);
  assert.equal((await call(env,'/after/unknown/')).status,404);
  assert.equal((await call(env,'/after')).status,308);
});
test('hidden parents and replies disappear from every public view, without deletion',async()=>{
  const env=environment(),root=await (await post(env,'Private root.')).json(),reply=await (await post(env,'Private child.',root.id)).json();
  env.sqlite.prepare('UPDATE quarter_fragments SET active=0 WHERE id=?').run(root.id);
  for(const path of [root.url,reply.url,'/api/fragments/'+root.id+'/','/api/fragments/'+reply.id+'/'])assert.equal((await call(env,path)).status,404);
  assert.equal((await post(env,'Another',root.id)).status,404);
  const data=await (await call(env,'/api/chronicle/')).json();assert.equal(data.events.length,0);assert.equal(data.counts.visitor_contributions,0);
  assert.equal(env.sqlite.prepare("SELECT count(*) AS n FROM quarter_fragments WHERE kind='visitor'").get().n,2);
});
test('paginated replies retain direct permalinks after the first page',async()=>{
  const env=environment();let last;
  for(let i=0;i<25;i++)last=await (await post(env,'Response '+i,'seed-root',crypto.randomUUID(),'192.0.2.'+(i+1))).json();
  const first=await (await call(env,'/api/fragments/seed-root/')).json();assert.equal(first.responses.length,20);assert.ok(first.next);
  const next=await (await call(env,first.next)).json();assert.equal(next.responses.length,5);
  const page=await (await call(env,last.url)).text();assert.match(page,/Response 24/);assert.match(page,/name="parent_id" value="seed-root"/);
  const ledger=await (await call(env,'/api/chronicle/')).json();assert.equal(ledger.events.length,20);assert.equal((await (await call(env,ledger.next)).json()).events.length,5);
});
test('network capacity rejects new writes but permits retries',async()=>{
  const env=environment(),firstId=crypto.randomUUID();
  for(let i=0;i<20;i++)assert.equal((await post(env,'Line '+i,null,i?crypto.randomUUID():firstId)).status,200);
  assert.equal((await post(env,'Too many.')).status,429);
  assert.equal((await post(env,'Line 0',null,firstId)).status,200);
  assert.equal(env.sqlite.prepare("SELECT count(*) AS n FROM quarter_fragments WHERE kind='visitor'").get().n,20);
});
