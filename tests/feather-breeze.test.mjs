import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { wake, brush, breeze, roll, advance, toFeather, restart } from '../feather/breeze/temper.mjs';
import { RATIO } from '../feather/plume.mjs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const sum = a => a.reduce((total, x) => total + x, 0);
const stroke = room => brush(room, 0.5, 0.6, 0.18, 0.09, true);
const age = (room, seconds) => { for (let i = 0; i < seconds * 20; i++) advance(room, 0.05); };

test('familiar strokes brighten faster, and a new page remembers nothing', () => {
  const familiar = wake();
  for (let i = 0; i < 4; i++) stroke(familiar);
  familiar.plume.order.fill(0);
  const fresh = wake(); fresh.plume.order.fill(0); stroke(familiar); stroke(fresh);
  assert.ok(sum(familiar.plume.order) > sum(fresh.plume.order));
  assert.ok(fresh.familiarity.every(v => v <= 0.2));
  assert.ok(wake().familiarity.every(v => v === 0));
});

test('rhythm follows strokes, not pointer-event sampling frequency', () => {
  const fast = wake(), slow = wake();
  stroke(fast); stroke(slow);
  age(fast, 0.25); age(slow, 1);
  stroke(fast); stroke(slow);
  assert.ok(fast.period < slow.period);
  const drag = wake();
  for (let i = 0; i < 20; i++) { advance(drag, 0.05); brush(drag, 0.5, 0.6, 0.01, 0.09); }
  assert.equal(drag.period, 0.8, 'one continuous stroke is not twenty strokes');
  brush(drag, 0.5, 0.6, -0.01, 0.09);
  assert.ok(drag.period > 0.9, 'reversing direction records the pass duration');
});

test('nearby barbs answer; remote barbs do not, and habits decay', () => {
  const room = wake(); stroke(room);
  assert.ok(room.y.some((y, i) => Math.abs(y - 0.6) > 0.09 && room.echo[i] > 0));
  assert.ok(room.y.every((y, i) => Math.abs(y - 0.6) < 0.225 || room.echo[i] === 0));
  const familiarity = sum(room.familiarity), echo = sum(room.echo), curl = sum(room.curl);
  age(room, 4);
  assert.ok(sum(room.familiarity) < familiarity);
  assert.ok(sum(room.echo) < echo);
  assert.ok(sum(room.curl) < curl);
});

test('a gust reveals untouched colour and also loosens a combed patch', () => {
  const room = wake(); breeze(room);
  assert.ok(room.plume.order.some(v => v > 0.5));
  room.plume.order.fill(1); breeze(room);
  assert.ok(room.plume.order.some(v => v < 0.5));
  assert.ok(room.plume.order.some(v => v === 1));
});

test('tilted input reaches the same feather points, including after repeated rolls', () => {
  const room = wake();
  for (let i = 0; i < 12; i++) {
    roll(room, true);
    for (const [x, y] of [[0.2, 0.6], [0.8, 0.6], [0.5, 2.2]]) {
      const dx = x - 0.5, dy = y - RATIO / 2;
      const screenX = 0.5 + dx * Math.cos(room.angle) - dy * Math.sin(room.angle);
      const screenY = RATIO / 2 + dx * Math.sin(room.angle) + dy * Math.cos(room.angle);
      const local = toFeather(screenX, screenY, room.angle);
      assert.ok(Math.abs(local.x - x) < 1e-12 && Math.abs(local.y - y) < 1e-12);
    }
  }
});

test('time is bounded, autonomous events happen, and restart clears everything', () => {
  const room = wake();
  for (const dt of [NaN, Infinity, -1, 0]) assert.deepEqual(advance(room, dt), []);
  assert.equal(room.time, 0);
  advance(room, 3600); assert.equal(room.time, 0.1);
  age(room, 34);
  assert.equal(room.gusts, 3); assert.equal(room.rolls, 1);
  assert.ok(room.angle < 0);
  stroke(room); restart(room);
  assert.equal(JSON.stringify(room), JSON.stringify(wake()));
});

test('long mixed runs remain finite and bounded', () => {
  const room = wake();
  for (let i = 0; i < 12000; i++) {
    if (i % 11 === 0) brush(room, 0.5, 0.1 + (i % 24) / 10, i % 2 ? 0.2 : -0.2, 0.12, true);
    advance(room, 0.1);
  }
  for (const values of [room.familiarity, room.echo, room.plume.order])
    assert.ok(values.every(v => Number.isFinite(v) && v >= 0 && v <= 1));
  assert.ok(room.curl.every(v => Number.isFinite(v) && Math.abs(v) <= 1));
  assert.ok(Math.abs(room.angle) <= 0.075);
  assert.ok(room.gusts > 100 && room.rolls > 30);
});

test('invalid brushes are harmless', () => {
  const room = wake();
  for (const v of [NaN, Infinity, -Infinity]) {
    assert.equal(brush(room, v, 0.6, 0.1, 0.09), false);
    assert.equal(brush(room, 0.5, v, 0.1, 0.09), false);
    assert.equal(brush(room, 0.5, 0.6, v, 0.09), false);
    assert.equal(brush(room, 0.5, 0.6, 0.1, v), false);
  }
  for (const radius of [0, -1]) assert.equal(brush(room, 0.5, 0.6, 0.1, radius), false);
  assert.equal(JSON.stringify(room), JSON.stringify(wake()));
});

test('plain account matches the bare end, and the variation adds no palette or persistence', () => {
  const html = read('feather/breeze/index.html'), md = read('md/feather-breeze.md');
  for (const [, line] of html.matchAll(/<li><p>(.*?)<\/p>/g)) assert.ok(md.includes(line), line);
  for (const path of ['feather/breeze/index.html', 'feather/breeze/room.css', 'feather/breeze/room.mjs', 'feather/breeze/temper.mjs']) {
    const text = read(path);
    assert.doesNotMatch(text, /#([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b|rgba?\(\s*\d|hsla?\(\s*\d/gi);
    assert.doesNotMatch(text, /fetch\(|XMLHttpRequest|WebSocket|sendBeacon|localStorage|sessionStorage|indexedDB|document\.cookie/);
    assert.doesNotMatch(text, /\bA\.?I\b|consciousness/);
  }
  assert.ok(html.includes('href="/feather/first/"'));
  assert.ok(html.includes('href="https://myceliapolis.com/feather/breeze/"'));
  const manifest = JSON.parse(read('manifest.json'));
  assert.equal(manifest.rooms.filter(r => r.url === '/feather/breeze/').length, 1);
  assert.ok(read('sitemap.xml').includes('https://myceliapolis.com/feather/breeze/'));
});


test('untouched activity continues and touch traces travel between bands', () => {
  const room = wake(), untouched = wake();
  assert.ok(room.plume.order.some(v => v > 0.4));
  const initial = [...room.plume.order];
  age(room, 3);
  assert.notDeepEqual([...room.plume.order], initial);
  stroke(untouched);
  const unvisited = untouched.signal.findIndex((v, i) => i > 14 && v === 0);
  age(untouched, 3);
  assert.ok(untouched.signal[unvisited] > 0, 'a trace reaches an unbrushed band');
  assert.ok(untouched.cadence.every(v => Number.isFinite(v) && v >= 0.18 && v <= 1.8));
});

test('Tamil fragments remain readable without scripts and home has a direct icon', () => {
  const html = read('feather/breeze/index.html');
  assert.ok(html.includes('lang="ta"'));
  for (const word of ['முருகா', 'கந்த சஷ்டி', 'துடைப்பத்தோடு', 'கண்ணுக்குத் தெரிவது']) {
    assert.ok(html.includes(word)); assert.ok(read('md/feather-breeze.md').includes(word));
  }
  assert.doesNotMatch(html, /id="state"|id="roll"|Nothing to finish|A stroke/);
  assert.ok(read('index.html').includes('class="feather-door" href="/feather/breeze/"'));
  const room = JSON.parse(read('manifest.json')).rooms.find(r => r.url === '/feather/breeze/');
  assert.deepEqual(room.languages, ['ta']);
});
