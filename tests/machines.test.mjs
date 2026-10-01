import test from 'node:test';
import assert from 'node:assert/strict';
import { SIZE, WALL, readBlueprint, blueprint, clone, step, preset, snapshotHash, readHash } from '../machines/engine.mjs';
const creature = (extra = {}) => ({ id: 1, x: 16, y: 16, dir: 0, rule: 'RL', ...extra });
const world = (creatures = [creature()]) => readBlueprint({ v: 1, creatures });

test('a creature reads, turns, paints, and moves in that order', () => {
  const w = world(); step(w);
  assert.deepEqual(w.creatures[0], creature({ x: 17, dir: 1 }));
  assert.equal(w.cells[16 * SIZE + 16], 1); assert.equal(w.tick, 1);
  // A lit starting tile chooses the second instruction and returns to state 0.
  const lit = world(); lit.cells[16 * SIZE + 16] = 1; step(lit);
  assert.deepEqual(lit.creatures[0], creature({ x: 15, dir: 3 }));
  assert.equal(lit.cells[16 * SIZE + 16], 0);
});
test('walls reverse motion without entering a wall, edges wrap', () => {
  const w = world(); w.cells[16 * SIZE + 17] = WALL; step(w);
  assert.deepEqual(w.creatures[0], creature({ dir: 3 }));
  const edge = world([creature({ x: 31 })]); step(edge);
  assert.equal(edge.creatures[0].x, 0);
});
test('neighbors see one another’s paint in listed order', () => {
  const w = world([creature(), creature({ id: 2 })]); step(w);
  assert.equal(w.creatures[0].x, 17); assert.equal(w.creatures[1].x, 15);
  assert.equal(w.cells[16 * SIZE + 16], 0);
});
test('program length determines interpretation of other creatures’ trails', () => {
  const w = world(); w.cells[16 * SIZE + 16] = 7; step(w);
  assert.equal(w.creatures[0].x, 15); assert.equal(w.cells[16 * SIZE + 16], 0);
});
test('shared snapshots reproduce exactly, including future behavior', () => {
  for (const name of ['neighbors', 'solitary', 'courtyards', 'empty']) {
    const original = preset(name); step(original, 700);
    const shared = readHash(snapshotHash(original));
    assert.deepEqual(blueprint(original), blueprint(shared));
    step(original, 200); for (let n = 0; n < 200; n++) step(shared);
    assert.deepEqual(blueprint(original), blueprint(shared));
    const independent = clone(shared); independent.cells[0] = 5;
    assert.notEqual(independent.cells, shared.cells);
  }
});
test('untrusted blueprints reject invalid rules, coordinates, IDs and oversized input', () => {
  for (const changed of [{ rule: 'alert(1)' }, { rule: 'R' }, { rule: 'R'.repeat(9) }, { x: 32 }, { y: -1 }, { dir: 4 }, { id: 9 }, { x: 1.5 }]) {
    assert.throws(() => world([creature(changed)]));
  }
  assert.throws(() => world([creature(), creature()]));
  assert.throws(() => readBlueprint({ v: 1, tick: Infinity, creatures: [] }));
  assert.throws(() => readBlueprint({ v: 1, cells: '<script>', creatures: [] }));
  assert.throws(() => readBlueprint(' '.repeat(8193)));
  assert.throws(() => readHash('#world=%ZZ'));
  assert.throws(() => readHash('#wrong=x'));
  assert.throws(() => step(world(), -1)); assert.throws(() => step(world(), 10001));
  assert.throws(() => readBlueprint({ ...blueprint(world()), cells: '#'.repeat(1024) }));
});
test('long runs preserve all board and creature invariants', () => {
  for (const name of ['neighbors', 'solitary', 'courtyards']) {
    const w = preset(name); step(w, 10000);
    assert.doesNotThrow(() => readBlueprint(blueprint(w)));
    assert.ok(w.creatures.every(c => w.cells[c.y * SIZE + c.x] !== WALL));
  }
});
