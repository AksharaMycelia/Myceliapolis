// いあいぎり: a field of threads, one straight cut, and the names that turn up afterwards.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { RATIO, GUEST, NAMES, sow, grow, cut, opened, census } from '../vel/mycel.mjs';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const wait = (field, seconds) => { for (let i = 0; i < seconds * 10; i++) grow(field, 0.1); };
const known = new Set([GUEST, ...Object.values(NAMES)]);

test('the field is alive before anyone arrives, and one guest is already in it', () => {
  const a = sow(7), b = sow(7);
  assert.equal(a.n, b.n);
  assert.deepEqual(Array.from(a.x1.subarray(0, 200)), Array.from(b.x1.subarray(0, 200)));
  assert.ok(census(a).threads > 5000);
  assert.ok(a.tips.length > 0);
  assert.deepEqual(a.names.map(n => n.text), [GUEST]);
  assert.equal(a.caps.length, 0);
  const before = a.n; wait(a, 3);
  assert.ok(a.n > before);
});

test('a straight line severs what it crosses; a line too short to be one does nothing', () => {
  const field = sow(7), before = census(field).threads;
  assert.equal(cut(field, 0.5, 0.5, 0.51, 0.5), 0);
  assert.equal(cut(field, NaN, 0, 1, 1), 0);
  assert.equal(field.cuts, 0);
  const severed = cut(field, 0.1, 0.2, 0.9, 1.0);
  assert.ok(severed > 20);
  const lost = before - census(field).threads;
  assert.ok(lost >= severed && lost < before * 0.12);
});

test('the cut decides no caps: they come only where a branch finds the other side, and not every branch does', () => {
  const field = sow(7);
  cut(field, 0.1, 0.2, 0.9, 1.0);
  const branches = field.sprouts.filter(s => s.branch).length;
  assert.ok(branches > 8);
  assert.equal(field.caps.length, 1);                       // only the one at the spear's end
  wait(field, 45);
  const grown = field.caps.filter(c => c.side);
  assert.ok(grown.length > 3 && grown.length < branches);
  assert.ok(grown.some(c => c.side < 0) && grown.some(c => c.side > 0));
  assert.ok(field.caps.every(c => opened(field, c) === 1));
  assert.equal(field.tips.filter(t => t.branch).length, 0);
});

test('names are few, come from the list, and some stand where nothing grew', () => {
  for (const seed of [7, 8, 9, 10]) {
    const field = sow(seed);
    cut(field, 0.1, 0.2, 0.9, 1.0);
    const atOnce = field.names.length;
    assert.ok(atOnce >= 2 && atOnce <= 6, `seed ${seed}: ${atOnce}`);
    wait(field, 45);
    for (const n of field.names) assert.ok(known.has(n.text), n.text);
    assert.ok(field.caps.length > field.names.length);       // most growth is never named
  }
  const field = sow(7); cut(field, 0.1, 0.2, 0.9, 1.0); wait(field, 45);
  const bare = field.names.filter(n => !n.guest && !field.caps.some(c => Math.hypot(c.x - n.x, c.y - n.y) < 0.05));
  assert.ok(bare.length > 0);
});

test('where the first spear stops, one more small thing grows, at the same speed as the rest', () => {
  const field = sow(7);
  cut(field, 0.1, 0.2, 0.9, 1.0);
  const foot = field.caps[0];
  assert.deepEqual([foot.x, foot.y], [0.9, 1.0]);
  assert.ok(field.names.some(n => n.text === NAMES.foot));
  wait(field, 45);
  assert.ok(foot.size <= Math.max(...field.caps.map(c => c.size)));
  assert.equal(opened(field, foot), 1);
  cut(field, 0.85, 0.1, 0.3, 1.1); wait(field, 45);
  assert.equal(field.names.filter(n => n.text === NAMES.foot).length, 1);
});

test('a second line cuts what the first one grew, and that is named differently', () => {
  let scars = 0;
  for (const seed of [7, 8, 9, 10]) {
    const field = sow(seed);
    cut(field, 0.1, 0.2, 0.9, 1.0); wait(field, 45);
    assert.ok(!field.names.some(n => n.text === NAMES.scar));
    cut(field, 0.85, 0.1, 0.3, 1.1); wait(field, 45);
    scars += field.names.filter(n => n.text === NAMES.scar).length;
  }
  assert.ok(scars > 0);
});

test('a cap the line passes through is cut; its name stays', () => {
  const field = sow(7);
  cut(field, 0.1, 0.2, 0.9, 1.0); wait(field, 45);
  assert.ok(field.caps.some(c => c.x === 0.9 && c.y === 1.0));
  cut(field, 0.8, 1.0, 1.0, 1.0);
  assert.ok(!field.caps.some(c => c.x === 0.9 && c.y === 1.0));
  assert.ok(field.names.some(n => n.text === NAMES.foot));
});

test('the guest goes to look at the other one with its name; later one leaves and the name stays', () => {
  const field = sow(7);
  cut(field, 0.1, 0.2, 0.9, 1.0);
  assert.equal(field.names.filter(n => n.text === GUEST).length, 2);
  wait(field, 90);
  assert.equal(field.names.filter(n => n.text === GUEST).length, 3);
  assert.ok(field.events.some(e => e.type === 'leave'));
});

test('the room keeps its colours in the stylesheet and the feather, and sends nothing', () => {
  for (const file of ['vel/room.mjs', 'vel/mycel.mjs']) {
    const code = read(file);
    assert.ok(!/#[0-9a-f]{3,8}\b|rgb\(\s*\d|hsl\(/i.test(code), file);
    assert.ok(!/fetch\(|localStorage|sessionStorage|cookie|XMLHttpRequest|sendBeacon/.test(code), file);
  }
  const page = read('vel/index.html');
  assert.ok(!/<style|style="|<script(?![^>]*src=)/.test(page));
  assert.ok(!/\bAI\b|consciousness/i.test(page + read('md/vel.md')));
  assert.ok(read('_headers').includes('/vel/*'));
  assert.ok(RATIO > 1);
});
