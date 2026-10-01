// Small Machines v1. Pure deterministic rules, shared by the room and other runners.
export const SIZE = 32;
export const WALL = 8;
export const MAX_CREATURES = 8;
const alphabet = '.1234567#';
const turns = { L: 3, R: 1, S: 0, U: 2 };
const dx = [0, 1, 0, -1], dy = [-1, 0, 1, 0];
const integer = (n, lo, hi) => Number.isInteger(n) && n >= lo && n <= hi;
export function validRule(rule) { return typeof rule === 'string' && /^[LRSU]{2,8}$/.test(rule); }

export function readBlueprint(input) {
  if (typeof input === 'string') {
    if (input.length > 8192) throw Error('This blueprint is too large. The limit is 8,192 characters.');
    try { input = JSON.parse(input); } catch { throw Error('The blueprint must be valid JSON.'); }
  }
  if (!input || input.v !== 1 || (input.size !== undefined && input.size !== SIZE)) throw Error('Use a version 1 blueprint with a 32 × 32 world.');
  const clock = input.tick ?? 0;
  if (!integer(clock, 0, 1e9)) throw Error('The step number must be a whole number from 0 to 1,000,000,000.');
  const cells = input.cells ?? '.'.repeat(SIZE * SIZE);
  if (typeof cells !== 'string' || cells.length !== SIZE * SIZE || /[^.1-7#]/.test(cells)) throw Error('The map needs exactly 1,024 tiles: dots, digits 1–7, or # for a wall.');
  if (!Array.isArray(input.creatures) || input.creatures.length > MAX_CREATURES) throw Error('A world can hold up to eight creatures.');
  const ids = new Set();
  const creatures = input.creatures.map(c => {
    if (!c || !integer(c.id, 1, MAX_CREATURES) || ids.has(c.id)) throw Error('Each creature needs a different ID from 1 to 8.');
    if (!integer(c.x, 0, SIZE - 1) || !integer(c.y, 0, SIZE - 1) || !integer(c.dir, 0, 3)) throw Error('Creature coordinates must be 0–31, with direction 0–3.');
    if (!validRule(c.rule)) throw Error('A program needs 2–8 letters: L, R, S, or U.');
    if (cells[c.y * SIZE + c.x] === '#') throw Error('Move the creature off the wall before importing.');
    ids.add(c.id);
    return { id: c.id, x: c.x, y: c.y, dir: c.dir, rule: c.rule };
  });
  return { tick: clock, cells: Uint8Array.from(cells, c => alphabet.indexOf(c)), creatures };
}

export function blueprint(world) {
  return { v: 1, size: SIZE, tick: world.tick, cells: Array.from(world.cells, c => alphabet[c]).join(''), creatures: world.creatures.map(c => ({ ...c })) };
}
export function clone(world) { return readBlueprint(blueprint(world)); }
export function step(world, count = 1) {
  if (!integer(count, 0, 10000)) throw Error('Advance between 0 and 10,000 steps at once.');
  for (let t = 0; t < count && world.tick < 1e9; t++) {
    // Array order is intentional: later creatures see earlier creatures' changes.
    for (const c of world.creatures) {
      const at = c.y * SIZE + c.x;
      const state = world.cells[at] % c.rule.length;
      c.dir = (c.dir + turns[c.rule[state]]) % 4;
      world.cells[at] = (state + 1) % c.rule.length;
      const x = (c.x + dx[c.dir] + SIZE) % SIZE;
      const y = (c.y + dy[c.dir] + SIZE) % SIZE;
      if (world.cells[y * SIZE + x] === WALL) c.dir = (c.dir + 2) % 4;
      else { c.x = x; c.y = y; }
    }
    world.tick++;
  }
  return world;
}
export function snapshotHash(world) { return '#world=' + encodeURIComponent(JSON.stringify(blueprint(world))); }
export function readHash(hash) {
  if (!hash.startsWith('#world=') || hash.length > 24000) throw Error('This world link is missing or too large.');
  let raw;
  try { raw = decodeURIComponent(hash.slice(7)); } catch { throw Error('This world link has damaged encoding.'); }
  return readBlueprint(raw);
}

export function preset(name = 'neighbors') {
  const c = (id, x, y, dir, rule) => ({ id, x, y, dir, rule });
  const definitions = {
    neighbors: [c(1, 10, 10, 0, 'RLLR'), c(2, 22, 10, 1, 'LLRR'), c(3, 10, 22, 2, 'RL'), c(4, 22, 22, 3, 'RLRRLL')],
    solitary: [c(1, 16, 16, 0, 'RL')],
    courtyards: [c(1, 8, 8, 0, 'RLLR'), c(2, 24, 8, 1, 'RSLR'), c(3, 8, 24, 2, 'LLRR'), c(4, 24, 24, 3, 'RLLR')],
    empty: []
  };
  if (!Object.hasOwn(definitions, name)) throw Error('Unknown example.');
  const world = readBlueprint({ v: 1, creatures: definitions[name] });
  if (name === 'courtyards') {
    for (const x0 of [3, 19]) for (const y0 of [3, 19]) {
      for (let n = 0; n < 10; n++) {
        if (n === 4 || n === 5) continue;
        for (const [x, y] of [[x0 + n, y0], [x0 + n, y0 + 9], [x0, y0 + n], [x0 + 9, y0 + n]]) world.cells[y * SIZE + x] = WALL;
      }
    }
  }
  if (name !== 'empty') step(world, name === 'solitary' ? 480 : 360);
  return world;
}
