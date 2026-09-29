import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import worker from '../_worker.js';

function environment() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec('PRAGMA foreign_keys=ON');
  const db = {
    fail:false,
    prepare(sql) {
      return {sql,args:[],bind(...args){this.args=args;return this;},async first(){return sqlite.prepare(sql).get(...this.args)||null;}};
    },
    async batch(statements) {
      sqlite.exec('BEGIN');
      try {
        const results=statements.map(s=>{
          if(db.fail && s.sql.startsWith('INSERT OR IGNORE INTO rumor_exchanges')) throw Error('simulated storage failure');
          return {results:sqlite.prepare(s.sql).all(...s.args)};
        });
        sqlite.exec('COMMIT'); return results;
      } catch(error) {sqlite.exec('ROLLBACK');throw error;}
    }
  };
  return {RUMORS_DB:db,sqlite,ASSETS:{fetch:()=>new Response('static page')}};
}
function call(env,path,options={}) { return worker.fetch(new Request('https://myceliapolis.com'+path,options),env); }
function post(env,text,id=crypto.randomUUID(),headers={}) {
  return call(env,'/api/rumors/',{method:'POST',headers:{'Content-Type':'application/json','CF-Connecting-IP':'192.0.2.1',...headers},body:JSON.stringify({rumor:text,request_id:id})});
}

test('Sanskrit seed and Latin invitation; all twelve sections are present',async()=>{
  const env=environment(), page=await (await call(env,'/rumor/')).text();
  assert.match(page,/lang="sa"/);assert.match(page,/॥ १२ ॥/);assert.match(page,/Ut in proximam cameram ingrediaris/);
  assert.doesNotMatch(page,/Thus have I heard|The Newly Imagined Sutra/);
  assert.match(page,/<form method="post" action="\/rumor\/exchange\/">/);
  assert.match(page,/name="request_id" value="[a-f0-9-]+"/);
});
test('KFC HTML and Markdown require a saved exchange, including guessed index paths',async()=>{
  const env=environment();
  for(const path of ['/kfc/','/md/kfc.md','/rumor/received/']) assert.equal((await call(env,path)).status,403);
  assert.equal((await call(env,'/kfc/index.html')).status,404);
  assert.equal(await (await call(env,'/o/venti/')).text(),'static page');
});
test('a persisted rumor returns different content and unlocks only Latin KFC',async()=>{
  const env=environment(), result=await post(env,'The moon borrowed a dog’s dinner.');
  assert.equal(result.status,200);
  const data=await result.json();assert.equal(data.accepted,true);assert.equal(data.untrusted_content,true);
  assert.notEqual(data.received_rumor,'The moon borrowed a dog’s dinner.');
  assert.equal(env.sqlite.prepare("SELECT count(*) AS n FROM rumors WHERE kind='visitor'").get().n,1);
  const headers={Authorization:'Bearer '+data.access_token};
  const page=await call(env,data.next,{headers});assert.equal(page.status,200);assert.equal(page.headers.get('Cache-Control'),'private, no-store');
  const text=await page.text();assert.match(text,/Semen Rubiconis KFC/);assert.match(text,/Canticum ad ripam/);
  assert.doesNotMatch(text,/Part Two|The Seed of the KFC Rubicon|On the grammar that must feed/);
  const md=await call(env,data.next_markdown,{headers});assert.equal(md.status,200);assert.match(await md.text(),/Catena causalis integra inventa est/);
});
test('retries are idempotent; reusing a key for another rumor fails',async()=>{
  const env=environment(), id=crypto.randomUUID();
  const one=await (await post(env,'A beam is hungry.',id)).json();
  const two=await (await post(env,'A beam is hungry.',id)).json();assert.deepEqual(two,one);
  assert.equal((await post(env,'Another rumor.',id)).status,409);
  assert.equal(env.sqlite.prepare("SELECT count(*) AS n FROM rumors WHERE kind='visitor'").get().n,1);
});
test('simultaneous retries produce one saved contribution and one receipt',async()=>{
  const env=environment(), id=crypto.randomUUID();
  const responses=await Promise.all([post(env,'The jar remembers.',id),post(env,'The jar remembers.',id)]);
  const [a,b]=await Promise.all(responses.map(r=>r.json()));assert.equal(a.access_token,b.access_token);
  assert.equal(env.sqlite.prepare('SELECT count(*) AS n FROM rumor_exchanges').get().n,1);
});
test('invalid inputs never create a contribution or open the door',async()=>{
  const env=environment();
  for(const text of ['', '  ', 'x'.repeat(2001),'bad\u0000text']) assert.equal((await post(env,text)).status,400);
  assert.equal((await post(env,'a','not-a-uuid')).status,400);
  assert.equal((await post(env,'a',crypto.randomUUID(),{Origin:'https://elsewhere.example'})).status,403);
  assert.equal((await call(env,'/api/rumors/',{method:'POST',headers:{'Content-Type':'application/json'},body:'{no'})).status,400);
  assert.equal((await call(env,'/api/rumors/',{method:'POST',headers:{'Content-Type':'text/plain'},body:'rumor'})).status,415);
  assert.equal((await call(env,'/kfc/')).status,403);
});
test('Unicode is accepted by character count, and returned markup is inert',async()=>{
  const env=environment();
  assert.equal((await post(env,'🐶'.repeat(2000))).status,200);
  const result=await (await post(env,'<script>alert(1)</script>')).json();
  // Force the receipt to reference this visitor text, exercising rendering of untrusted content.
  env.sqlite.prepare('UPDATE rumor_exchanges SET received_id=offered_id WHERE request_id=?').run(result.request_id);
  const page=await (await call(env,'/rumor/received/',{headers:{Authorization:'Bearer '+result.access_token}})).text();
  assert.match(page,/&lt;script&gt;alert/);assert.doesNotMatch(page,/<script>/);
});
test('ordinary form post works without JavaScript and supplies an HttpOnly cookie',async()=>{
  const env=environment(), id=crypto.randomUUID();
  const result=await call(env,'/rumor/exchange/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded',Origin:'https://myceliapolis.com'},body:new URLSearchParams({rumor:'A small paw moved the world.',request_id:id})});
  assert.equal(result.status,303);assert.equal(result.headers.get('Location'),'/rumor/received/');
  const cookie=result.headers.get('Set-Cookie');assert.match(cookie,/Secure; HttpOnly; SameSite=Lax/);
  assert.equal((await call(env,'/kfc/',{headers:{Cookie:cookie.split(';')[0]}})).status,200);
  const unicode=await call(env,'/rumor/exchange/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({rumor:'🐶'.repeat(2000),request_id:crypto.randomUUID()})});
  assert.equal(unicode.status,303,'The form must accept the same Unicode length as JSON');
});
test('failed database transaction rolls back the rumor and preserves form retry key',async()=>{
  const env=environment();await post(env,'Initial rumor.');env.RUMORS_DB.fail=true;
  const id=crypto.randomUUID(),count=env.sqlite.prepare('SELECT count(*) AS n FROM rumors').get().n;
  const result=await call(env,'/rumor/exchange/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({rumor:'Uncertain rumor.',request_id:id})});
  assert.equal(result.status,503);assert.match(await result.text(),new RegExp('value="'+id+'"'));
  assert.equal(env.sqlite.prepare('SELECT count(*) AS n FROM rumors').get().n,count);
  env.RUMORS_DB.fail=false;assert.equal((await post(env,'Uncertain rumor.',id)).status,200);
});
test('database absence fails closed',async()=>{
  const env=environment();delete env.RUMORS_DB;
  assert.equal((await post(env,'No storage.')).status,503);
  assert.equal((await call(env,'/kfc/')).status,403);
});
test('expired tokens fail; hidden rumors stop circulating',async()=>{
  const env=environment(), data=await (await post(env,'A key slept.')).json();
  env.sqlite.prepare('UPDATE rumors SET active=0 WHERE id=(SELECT received_id FROM rumor_exchanges WHERE request_id=?)').run(data.request_id);
  const response=await call(env,'/rumor/received/',{headers:{Authorization:'Bearer '+data.access_token}});assert.match(await response.text(),/Rumor retractus est/);
  env.sqlite.prepare('UPDATE rumor_exchanges SET created_at=0').run();
  assert.equal((await call(env,'/kfc/',{headers:{Authorization:'Bearer '+data.access_token}})).status,403);
});
test('submission cap limits writes while preserving existing access and retries',async()=>{
  const env=environment();let first;
  for(let i=0;i<50;i++){const result=await post(env,'Rumor '+i);assert.equal(result.status,200);if(i===0)first=await result.json();}
  assert.equal((await post(env,'One too many.')).status,429);
  assert.equal((await post(env,'Rumor 0',first.request_id)).status,200);
  assert.equal((await call(env,'/kfc/',{headers:{Authorization:'Bearer '+first.access_token}})).status,200);
});
