import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import worker from '../_worker.js';

function room() {
  const sqlite = new DatabaseSync(':memory:');
  const db = {prepare(sql) {
    const statement = sqlite.prepare(sql);
    let args = [];
    return {
      bind(...values) { args = values; return this; },
      run() { return statement.run(...args); },
      first() { return statement.get(...args); }
    };
  }};
  return (key, body, query = '') => worker.fetch(new Request('https://example.org/api/bells/' + query, {
    method: body ? 'POST' : 'GET',
    headers: {'Content-Type':'application/json','X-Bell-Key':key},
    body: body && JSON.stringify(body)
  }), {RUMORS_DB:db});
}

test('two strangers keep the original pauses and only one fifth note wins', async () => {
  const visit = room();
  const [author, guest, late] = Array.from({length:3}, () => crypto.randomUUID());
  const notes = [[0,0],[3,440],[1,1600],[0,8100]];
  const first = await (await visit(author,{notes})).json();
  assert.deepEqual(await (await visit(author,{notes})).json(), first);
  assert.equal(await (await visit(author,undefined,'?listen')).json(),null);
  assert.deepEqual(await (await visit(guest,undefined,'?listen')).json(),first);
  const answer = {id:first.id, notes:[[0,40000]]};
  assert.equal((await visit(author,answer)).status,409);
  const results = await Promise.all([visit(guest,answer),visit(late,answer)]);
  assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);
  const winner = results[0].ok ? guest : late;
  assert.equal((await visit(winner,answer)).status,200);
  assert.deepEqual((await (await visit(author)).json()).notes,[...notes,[0,48100]]);
  assert.equal(await (await visit(late,undefined,'?listen')).json(),null);
});

test('out-of-range notes or time travel cannot enter the room', async () => {
  const visit = room(), key = crypto.randomUUID();
  for (const notes of [[[5,0],[1,0],[1,0],[1,0]],[[0,0],[1,9],[1,8],[1,10]],[[0,0],[1,0],[1,0],[1,120001]]])
    assert.equal((await visit(key,{notes})).status,400);
  assert.equal(await (await visit(key)).json(),null);
});
