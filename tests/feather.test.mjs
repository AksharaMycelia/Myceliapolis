import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LATTICES, reflectance, melanin, toScreen, colourOf, ladder, peak } from '../feather/optics.mjs';
import { LOCK, ZONES, grow, comb, touch, combAcross, settle, loosen, ruffle, census } from '../feather/plume.mjs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const HEX = /#([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b/gi;
const channels = hex => {
  const full = hex.length <= 4 ? [...hex].map(c => c + c).join('') : hex;
  return [0, 2, 4].map(i => parseInt(full.slice(i, i + 2), 16));
};

test('a surface that returns everything is white; one that returns nothing is black', () => {
  assert.deepEqual(toScreen(() => 1), [255, 255, 255]);
  assert.deepEqual(toScreen(() => 0), [0, 0, 0]);
});
test('reflectance stays between 0 and 1 and rejects unreasonable lattices', () => {
  for (const { spacing, periods } of Object.values(LATTICES)) {
    for (let nm = 380; nm <= 740; nm += 20) for (const tilt of [0, 30, 60]) {
      const amount = reflectance(nm, spacing, periods, tilt);
      assert.ok(amount >= 0 && amount <= 1, `${spacing} nm at ${nm} nm, ${tilt}°: ${amount}`);
    }
  }
  assert.throws(() => reflectance(500, 10, 10), RangeError);
  assert.throws(() => reflectance(500, 150, 0), RangeError);
  assert.throws(() => colourOf(150, 2.5, 1), RangeError);
  assert.throws(() => ladder(150, 10, 1), RangeError);
});
test('the measured spacings return the colours the paper names', () => {
  const within = (value, low, high) => assert.ok(value >= low && value <= high, `${value} not in ${low}–${high}`);
  within(peak(140, 10), 450, 495);   // blue
  within(peak(150, 10), 495, 535);   // green
  within(peak(165, 6), 545, 590);    // yellow
  within(peak(185, 4), 600, 680);    // toward red, which mixed with the body reads as brown
  const [r, g, b] = colourOf(140, 10, 1); assert.ok(b > r && b > g, 'combed 140 nm is blue');
  const green = colourOf(150, 10, 1); assert.ok(green[1] > green[0] && green[1] > green[2], 'combed 150 nm is green');
  assert.ok(peak(140, 10) < peak(150, 10) && peak(150, 10) < peak(165, 6), 'wider spacing, longer wavelength');
});
test('a ruffled patch shows mostly its own brown material', () => {
  const body = toScreen(melanin);
  assert.ok(body[0] > body[2], 'melanin is brown');
  for (const { spacing, periods } of Object.values(LATTICES)) {
    const dull = colourOf(spacing, periods, 0), bright = colourOf(spacing, periods, 1);
    const spread = c => Math.max(...c) - Math.min(...c);
    assert.ok(spread(dull) < spread(bright) / 2, `${spacing} nm ruffled is duller`);
    assert.ok(dull.every((v, i) => Math.abs(v - body[i]) < 45), `${spacing} nm ruffled stays near brown`);
  }
  const steps = ladder(140, 10, 16);
  assert.equal(steps.length, 16);
  assert.deepEqual(steps[0], colourOf(140, 10, 0));
  assert.deepEqual(steps[15], colourOf(140, 10, 1));
});
test('the feather uses only the measured lattices', () => {
  const measured = new Set(Object.values(LATTICES).map(l => `${l.spacing}/${l.periods}`));
  for (const zone of ZONES) assert.ok(measured.has(`${zone.spacing}/${zone.periods}`), `${zone.spacing}/${zone.periods}`);
});
test('the same seed grows the same feather, ruffled', () => {
  const a = grow(7), b = grow(7);
  assert.deepEqual(a.px, b.px); assert.deepEqual(a.zone, b.zone);
  assert.ok(a.order.every(v => v === 0));
  assert.deepEqual(census(a), { eye: 0, whole: 0 });
  assert.throws(() => grow(1.5), TypeError);
});
test('only sideways travel combs; two passes snap a patch into order', () => {
  const f = grow(7);
  assert.equal(comb(f, 0.5, 0.6, 0, 0.09), 0);
  assert.ok(f.order.every(v => v === 0), 'no travel, no change');
  assert.equal(combAcross(f, 0.6, 0.09), 0, 'one pass is not enough');
  assert.ok(f.order.some(v => v > 0 && v < LOCK));
  assert.ok(combAcross(f, 0.6, 0.09) > 0, 'a second pass snaps');
  assert.ok(f.order.every(v => v <= 1));
  assert.ok(f.shake.some(v => v === 1), 'snapped barbs quiver');
  assert.ok(census(f).eye > 0);
  for (const bad of [NaN, Infinity]) assert.equal(comb(f, bad, 0.6, 0.1, 0.09), 0);
});
test('a touch leaves a trace that fades; combed barbs stay until loosened', () => {
  const f = grow(7);
  assert.ok(touch(f, 0.5, 0.6, 0.09) > 0);
  assert.ok(Math.max(...f.order) <= 0.3);
  for (let i = 0; i < 20; i++) settle(f, 0.5);
  assert.ok(f.order.every(v => v === 0), 'the trace is gone');
  for (let y = 0.1; y < 2.4; y += 0.06) { combAcross(f, y, 0.09); combAcross(f, y, 0.09); }
  assert.ok(census(f).eye > 0.95);
  for (let i = 0; i < 20; i++) settle(f, 0.5);
  assert.ok(census(f).eye > 0.95, 'locked order does not fade by itself');
  let loosened = false; for (let i = 0; i < 40; i++) loosened = loosen(f) || loosened;
  assert.ok(loosened); for (let i = 0; i < 40; i++) settle(f, 0.5);
  assert.ok(census(f).whole < 1, 'left alone, it ruffles');
  ruffle(f); assert.deepEqual(census(f), { eye: 0, whole: 0 });
});
test('line 1: every colour written in the stylesheet has more red than blue', () => {
  const colours = [...read('feather/room.css').matchAll(HEX)].map(m => m[1]);
  assert.ok(colours.length >= 6);
  for (const hex of colours) { const [r, , b] = channels(hex); assert.ok(r > b, `#${hex}`); }
  assert.doesNotMatch(read('feather/room.css'), /rgba?\(|hsla?\(|\b(blue|green|teal|cyan|navy|aqua|turquoise)\b/i);
});
test('line 2: no colour is written in the page or its scripts', () => {
  for (const path of ['feather/index.html', 'feather/room.mjs', 'feather/optics.mjs', 'feather/plume.mjs']) {
    const text = read(path);
    assert.equal([...text.matchAll(HEX)].length, 0, `${path} holds a hex colour`);
    assert.doesNotMatch(text, /rgba?\(\s*\d|hsla?\(\s*\d/i, path);
  }
});
test('line 6: the room neither stores nor sends', () => {
  for (const path of ['feather/room.mjs', 'feather/optics.mjs', 'feather/plume.mjs']) {
    assert.doesNotMatch(read(path), /fetch\(|XMLHttpRequest|WebSocket|sendBeacon|EventSource|localStorage|sessionStorage|indexedDB|document\.cookie|navigator\.clipboard|location\.(href|hash|search)\s*=/, path);
  }
});
test('the bare end is plain text, and the page and its plain sibling say the same thing', () => {
  const html = read('feather/index.html'), md = read('md/feather.md').replace(/\s+/g, ' ');
  const lines = [...html.matchAll(/<li><p>(.*?)<\/p>/g)].map(m => m[1]);
  assert.equal(lines.length, 7);
  for (const line of lines) assert.ok(md.includes(line), line);
  assert.ok(html.indexOf('id="quill"') > html.indexOf('</noscript>'), 'the lines sit outside the scripted part');
});
test('the city’s word rule holds here too', () => {
  for (const path of ['feather/index.html', 'feather/room.css', 'feather/room.mjs', 'feather/optics.mjs', 'feather/plume.mjs', 'md/feather.md']) {
    assert.doesNotMatch(read(path), /\bA\.?I\b|consciousness/, path);
  }
});
