// சேவல்: a ring of yards, and a cry passed west from one to the next.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { YARDS, WILLING, hour, mood, clock, west, nearest, ring, crow, pass } from '../rooster/ring.mjs';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const at = (h, m = 0) => Date.UTC(2026, 10, 16, h, m);
const run = (state, ms, seconds = 40) => { const out = []; for (let i = 0; i < seconds * 10; i++) out.push(...pass(state, 0.1, ms)); return out; };

test('the yards run east to west, with open water where the ring closes', () => {
  for (let i = 1; i < YARDS.length; i++) assert.ok(YARDS[i].offset < YARDS[i - 1].offset);
  assert.ok(!YARDS[0].cry && !YARDS.at(-1).cry);
  assert.equal(west(YARDS.length - 1), 0);
  assert.equal(new Set(YARDS.filter(y => y.cry).map(y => y.cry)).size, YARDS.length - 2);
});

test('each yard keeps its own real hour', () => {
  const thai = YARDS[nearest(7)], tamil = YARDS[nearest(5.5)];
  assert.equal(thai.lang, 'th');
  assert.equal(clock(hour(thai, at(22, 45))), '05:45');
  assert.equal(clock(hour(tamil, at(0, 15))), '05:45');
  assert.equal(mood(5.75), 'dawn'); assert.equal(mood(4), 'stirring'); assert.equal(mood(12), 'day'); assert.equal(mood(23), 'night');
  assert.ok(YARDS[nearest(-10)].cry && YARDS[nearest(12)].cry);
});

test('where it is dawn, a yard crows without being asked', () => {
  const state = ring(1), ms = at(22, 45), thai = nearest(7);
  const unasked = run(state, ms).filter(e => e.type === 'crow' && !e.mine);
  assert.ok(unasked.some(e => e.index === thai));
});

test('a yard before its own dawn always answers; open water never does', () => {
  assert.equal(WILLING.stirring, 1);
  const ms = at(22, 45), thai = nearest(7), tamil = west(thai);     // 05:45 in one, 04:15 in the next
  assert.equal(mood(hour(YARDS[tamil], ms)), 'stirring');
  for (let seed = 1; seed <= 20; seed++) {
    const state = ring(seed); state.next = Infinity;
    crow(state, thai, true);
    assert.ok(run(state, ms, 3).some(e => e.type === 'crow' && e.index === tamil && e.mine));
  }
  const state = ring(1);
  assert.equal(crow(state, 0), false);
  assert.equal(crow(state, 99), false);
});

test('no cry has been seen to cross the water', () => {
  for (let seed = 1; seed <= 60; seed++) for (const h of [0, 6, 12, 18]) {
    const state = ring(seed); state.next = Infinity;
    const from = 1 + seed % (YARDS.length - 2);
    crow(state, from, true);
    const events = run(state, at(h), 30);
    assert.ok(!events.some(e => e.type === 'home'));
    assert.ok(events.every(e => e.type !== 'crow' || e.index > from));
    assert.equal(state.cries.length, 0);
  }
});

test('the room reads the clock and nothing else, and sends nothing', () => {
  for (const file of ['rooster/room.mjs', 'rooster/ring.mjs']) {
    const code = read(file);
    assert.ok(!/#[0-9a-f]{3,8}\b|rgb\(\s*\d|hsl\(/i.test(code), file);
    assert.ok(!/fetch\(|localStorage|sessionStorage|cookie|XMLHttpRequest|sendBeacon|geolocation|navigator\./.test(code), file);
  }
  const page = read('rooster/index.html');
  assert.ok(!/<style|style="|<script(?![^>]*src=)/.test(page));
  assert.ok(!/\bAI\b|consciousness/i.test(page + read('md/rooster.md')));
  assert.ok(read('_headers').includes('/rooster/*'));
  for (const yard of YARDS) if (yard.cry) assert.ok(read('md/rooster.md').includes(yard.cry), yard.cry);
});
