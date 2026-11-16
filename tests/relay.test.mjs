import test from 'node:test';
import assert from 'node:assert/strict';
import { blueprint, preset, step, readHash } from '../machines/engine.mjs';
import { arrive, fromHash, readArrival, choose, advance, differences, carry } from '../relay/relay.mjs';

const blank = () => ({ v: 1, size: 32, tick: 0, cells: '.'.repeat(1024), creatures: [{ id: 1, x: 16, y: 16, dir: 0, rule: 'LR' }] });

test('arrival and the two continuations own their data', () => {
  const input = preset('neighbors'), before = blueprint(input), s = arrive(input);
  s.changed.cells[0] = 1; s.changed.creatures[0].rule = 'SS';
  assert.deepEqual(blueprint(input), before);
  assert.deepEqual(blueprint(s.arrival), before);
  assert.deepEqual(blueprint(s.untouched), before);
});

test('one changed turn has a concrete, reproducible consequence', () => {
  const s = arrive(blank()); choose(s, { type: 'rule', id: 1, rule: 'RR' }); advance(s);
  assert.deepEqual(s.untouched.creatures[0], { id: 1, x: 15, y: 16, dir: 3, rule: 'LR' });
  assert.deepEqual(s.changed.creatures[0], { id: 1, x: 17, y: 16, dir: 1, rule: 'RR' });
  assert.deepEqual(differences(s), { tiles: [], positions: 1 });
  advance(s); assert.deepEqual(differences(s).tiles, [527, 529]);
});

test('a wall beside an arriving creature affects only its continuation', () => {
  const s = arrive(blank()); choose(s, { type: 'tile', x: 15, y: 16, value: 8 }); advance(s);
  assert.equal(s.changed.creatures[0].x, 16); assert.equal(s.changed.creatures[0].dir, 1);
  assert.equal(s.untouched.creatures[0].x, 15);
  assert.equal(s.arrival.cells[527], 0);
});

test('replacement edits rewind both worlds and do not accumulate', () => {
  const s = arrive(blank()); choose(s, { type: 'rule', id: 1, rule: 'RR' }); advance(s, 100);
  choose(s, { type: 'tile', x: 0, y: 0, value: 1 });
  assert.equal(s.elapsed, 0); assert.equal(s.changed.tick, 0);
  assert.equal(s.changed.creatures[0].rule, 'LR');
  assert.deepEqual(blueprint(s.untouched), blank());
  assert.deepEqual(differences(s), { tiles: [0], positions: 0 });
});

test('invalid or identical edits leave an existing run intact', () => {
  const s = arrive(blank()); advance(s, 7); const before = carry(s);
  for (const e of [null, {type:'rule', id:9, rule:'LR'}, {type:'rule', id:1, rule:'LR'},
    {type:'rule', id:1, rule:'<script>'}, {type:'tile', x:16, y:16, value:8},
    {type:'tile', x:0, y:0, value:0}, {type:'tile', x:0, y:0, value:7},
    {type:'tile', x:NaN, y:0, value:1}, {type:'tile', x:32, y:0, value:1}]) {
    assert.throws(() => choose(s, e)); assert.equal(carry(s), before); assert.equal(s.elapsed, 7);
  }
});

test('both clocks stop at the engine limit and reject invalid advances atomically', () => {
  const input = blank(); input.tick = 1e9 - 2; const s = arrive(input);
  advance(s, 64); assert.equal(s.elapsed, 2);
  assert.equal(s.untouched.tick, 1e9); assert.equal(s.changed.tick, 1e9);
  for (const count of [-1, NaN, .1, 10001]) assert.throws(() => advance(s, count));
  advance(s); assert.equal(s.elapsed, 2);
});

test('the outgoing link becomes the next exact arrival, with no lineage fiction', () => {
  const s = arrive(); choose(s, { type:'rule', id:s.arrival.creatures[0].id, rule:'SS' }); advance(s, 128);
  const next = fromHash(carry(s));
  assert.deepEqual(blueprint(next.arrival), blueprint(s.changed));
  assert.equal(next.elapsed, 0); assert.equal(next.edit, null);
  const machine = readHash(carry(s)); step(machine, 90); advance(next, 90);
  assert.deepEqual(blueprint(next.changed), blueprint(machine));
  assert.deepEqual(differences(next), { tiles: [], positions: 0 });
});

test('raw fragments, full links and blueprints all carry the same world', () => {
  const s = arrive(); advance(s, 23);
  for (const text of [carry(s), 'https://myceliapolis.com/machines/' + carry(s), JSON.stringify(blueprint(s.changed))]) {
    assert.deepEqual(blueprint(readArrival(text).arrival), blueprint(s.changed));
  }
});

test('malformed and oversized arrivals cannot silently become a seed', () => {
  for (const text of ['', 'javascript:alert(1)', 'https://example.com/', '#world=%zz', '#world=%7B%7D', 'x'.repeat(24001), '{"v":999}']) assert.throws(() => readArrival(text));
  const bad = blank(); bad.creatures[0].x = 32; assert.throws(() => arrive(bad));
});

test('an untouched or empty world is a valid handoff', () => {
  const s = arrive(); advance(s, 200); assert.deepEqual(differences(s), { tiles: [], positions: 0 });
  const empty = blank(); empty.creatures = []; const next = arrive(empty);
  choose(next, { type:'tile', x:0, y:0, value:8 });
  assert.deepEqual(blueprint(fromHash(carry(next)).arrival), blueprint(next.changed));
});
