// /relay/ · /md/relay.md. Two continuations of the same arrival.
// World links use the existing Small Machines format; no visitor history is claimed.
import { SIZE, WALL, blueprint, clone, preset, readBlueprint, readHash, snapshotHash, step, validRule } from '../machines/engine.mjs';

export function arrive(world = preset('neighbors')) {
  const arrival = readBlueprint(world.cells instanceof Uint8Array ? blueprint(world) : world);
  return { arrival, untouched: clone(arrival), changed: clone(arrival), edit: null, elapsed: 0 };
}

export function fromHash(hash) { return arrive(readHash(hash)); }

export function readArrival(text) {
  if (typeof text !== 'string' || text.length > 24000) throw Error('This parcel is too large.');
  text = text.trim();
  if (text.startsWith('{')) return arrive(readBlueprint(text));
  if (text.startsWith('#world=')) return fromHash(text);
  let url;
  try { url = new URL(text); } catch { throw Error('Paste a world link or a world blueprint.'); }
  if (!['https:', 'http:'].includes(url.protocol)) throw Error('Use an http or https world link.');
  return fromHash(url.hash);
}

// An edit is always relative to arrival, never to a moving or previously edited world.
// Validate a candidate completely before replacing either continuation.
export function choose(session, edit) {
  const candidate = clone(session.arrival);
  let saved;
  if (edit?.type === 'rule') {
    const creature = candidate.creatures.find(c => c.id === edit.id);
    if (!creature) throw Error('Choose a creature that arrived in this world.');
    if (!validRule(edit.rule)) throw Error('Use 2–8 turns: L, R, S, or U.');
    if (creature.rule === edit.rule) throw Error('That is already its rule. Try a different turn.');
    creature.rule = edit.rule;
    saved = { type: 'rule', id: creature.id, rule: creature.rule };
  } else if (edit?.type === 'tile') {
    if (![edit.x, edit.y].every(n => Number.isInteger(n) && n >= 0 && n < SIZE)) throw Error('Columns and rows run from 0 to 31.');
    if (![0, 1, WALL].includes(edit.value)) throw Error('Choose light, wall, or clear.');
    const at = edit.y * SIZE + edit.x;
    if (candidate.cells[at] === edit.value) throw Error('That tile already looks like this. Choose another tile or tool.');
    if (edit.value === WALL && candidate.creatures.some(c => c.x === edit.x && c.y === edit.y)) throw Error('A creature arrived on that tile. Put the wall beside it.');
    candidate.cells[at] = edit.value;
    saved = { type: 'tile', x: edit.x, y: edit.y, value: edit.value };
  } else throw Error('Change one rule or one tile.');
  session.untouched = clone(session.arrival);
  session.changed = candidate;
  session.edit = saved;
  session.elapsed = 0;
  return session;
}

export function advance(session, count = 1) {
  // The engine validates the count before mutating. Both clocks have the same limit.
  const before = session.changed.tick;
  step(session.changed, count);
  step(session.untouched, count);
  session.elapsed += session.changed.tick - before;
  return session;
}

export function differences(session) {
  const tiles = [];
  session.changed.cells.forEach((value, i) => { if (value !== session.untouched.cells[i]) tiles.push(i); });
  const positions = session.changed.creatures.filter((c, i) => {
    const other = session.untouched.creatures[i];
    return c.x !== other.x || c.y !== other.y || c.dir !== other.dir;
  }).length;
  return { tiles, positions };
}

export function carry(session) { return snapshotHash(session.changed); }
