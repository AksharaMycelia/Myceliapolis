// かみ: a sheet of words that can be folded and cut.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { RATIO, NEAR, FAR, FOLDS, WORDS, letters, sheet, shown, folded, under, fold, open, trim, cut, write, read } from '../kami/kami.mjs';

const text = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const close = (a, b) => Math.abs(a - b) < 1e-9;

test('the same seed lays out the same sheet, every word in its own tongue', () => {
  const a = sheet(5), b = sheet(5);
  assert.deepEqual(a.pieces, b.pieces);
  assert.equal(a.pieces.length, WORDS.filter(Boolean).length);
  assert.ok(new Set(a.pieces.map(p => p.lang)).size >= 7);
  for (const p of a.pieces) assert.ok(p.x > 0.05 && p.x < 0.95 && p.y > 0.05 && p.y < RATIO - 0.05, p.text);
  assert.notDeepEqual(sheet(6).pieces.map(p => p.x), a.pieces.map(p => p.x));
});

test('a fold lays one half on the other; every point under a spot folds back to that spot', () => {
  const folds = [{ axis: 'h', keep: 0 }, { axis: 'v', keep: 1 }, { axis: 'h', keep: 1 }];
  const r = shown(folds);
  assert.ok(close(r.x1 - r.x0, 0.5) && close(r.y1 - r.y0, RATIO / 4));
  const x = r.x0 + 0.1, y = r.y0 + 0.07, places = under(folds, x, y);
  assert.equal(places.length, 8);
  assert.equal(new Set(places.map(p => p.x.toFixed(6) + ',' + p.y.toFixed(6))).size, 8);
  for (const p of places) { const back = folded(folds, p.x, p.y); assert.ok(close(back.x, x) && close(back.y, y)); }
});

test('friends are two words from different tongues, far apart before, touching after; never the same pair twice', () => {
  let total = 0;
  for (let seed = 1; seed <= 30; seed++) {
    const s = sheet(seed), start = s.pieces.map(p => ({ ...p }));
    for (const [axis, keep] of [['h', seed % 2], ['v', 1], ['h', 0]]) {
      const made = fold(s, axis, keep);
      assert.ok(made.length <= 2);
      for (const f of made) {
        const p = start.find(w => w.text === f.a.text), q = start.find(w => w.text === f.b.text);
        assert.notEqual(f.a.lang, f.b.lang);
        assert.ok(Math.hypot(p.x - q.x, p.y - q.y) >= FAR);
        const a = folded(s.folds, p.x, p.y), b = folded(s.folds, q.x, q.y);
        assert.ok(Math.hypot(a.x - b.x, a.y - b.y) < NEAR);
        assert.equal(f.name, `${f.a.text}＝${f.b.text}`);
      }
      total += made.length;
    }
    assert.equal(new Set(s.friends.map(f => f.name)).size, s.friends.length);
    assert.equal(fold(s, 'v', 0), null);                         // no fourth fold
    assert.equal(s.folds.length, FOLDS);
  }
  assert.ok(total > 60);
});

test('one cut through a folded sheet is found in every layer when it is opened', () => {
  const s = sheet(3);
  fold(s, 'h', 0); fold(s, 'v', 0);
  const r = shown(s.folds), result = cut(s, r.x0 + 0.02, r.y0 + 0.02, r.x1 - 0.02, r.y1 - 0.02);
  assert.equal(result.places, 4);
  assert.equal(s.slits.length, 4);
  assert.ok(result.parted.length >= 2);
  assert.ok(open(s));
  assert.equal(s.folds.length, 0);
  assert.equal(s.creases.length, 3);                             // one crease, then that fold's crease seen twice
  assert.equal(cut(s, 0.5, 0.5, 0.51, 0.5), null);               // too short to be a cut
  assert.equal(trim(s, 2, 2, 3, 3), null);                       // off the sheet
});

test('a word comes apart between its letters, never through one, and nothing is lost', () => {
  for (let seed = 1; seed <= 25; seed++) {
    const s = sheet(seed), before = s.pieces.map(p => p.text.replace(/\s/g, '')).join('');
    cut(s, 0.02, 0.05, 0.98, RATIO - 0.05); cut(s, 0.98, 0.05, 0.02, RATIO - 0.05); cut(s, 0.3, 0.02, 0.33, RATIO - 0.02);
    const after = s.pieces.map(p => p.text.replace(/\s/g, ''));
    assert.equal(letters(after.join('')).sort().join(''), letters(before).sort().join(''));
    for (const p of s.pieces) { assert.ok(p.text.length > 0); assert.equal(p.text, p.text.normalize()); }
    assert.ok(s.pieces.length > WORDS.filter(Boolean).length);
  }
  const s = sheet(1), tamil = s.pieces.find(p => p.text === 'ராமானுஜன்');
  cut(s, tamil.x - 0.01, tamil.y - 0.1, tamil.x + 0.01, tamil.y + 0.1);
  const halves = s.pieces.filter(p => p.root === tamil.root);
  assert.equal(halves.length, 2);
  assert.equal(halves.map(h => h.text).join(''), 'ராமானுஜன்');
  assert.deepEqual(halves.map(h => h.says), ['கனவில் தேவி எண்களைக் காட்டினாள்.', 'காலையில் அவன் எழுதி வைத்தான்.']);
  const t = sheet(1), clay = t.pieces.find(p => p.text === 'גולם');           // written right to left
  cut(t, clay.x - 0.02, clay.y - 0.1, clay.x - 0.019, clay.y + 0.1);
  const parts = t.pieces.filter(p => p.root === clay.root).sort((m, n) => m.x - n.x);
  assert.equal(parts.length, 2);
  assert.equal(parts[1].text + parts[0].text, 'גולם');                      // the right-hand half holds the first letters
});

test('a single letter cannot be cut', () => {
  const s = sheet(1), word = s.pieces.find(p => p.text === 'モネ');
  for (let i = 0; i < 6; i++) for (const p of s.pieces.filter(p => p.root === word.root)) cut(s, p.x, p.y - 0.06, p.x + 0.001, p.y + 0.06);
  const left = s.pieces.filter(p => p.root === word.root);
  assert.deepEqual(left.map(p => p.text).sort(), ['ネ', 'モ']);
});

test('halves can become friends with other halves', () => {
  let seen = false;
  for (let seed = 1; seed <= 40 && !seen; seed++) {
    const s = sheet(seed); fold(s, 'h', 0); fold(s, 'v', 0);
    const r = shown(s.folds); cut(s, r.x0 + 0.02, r.y0 + 0.02, r.x1 - 0.02, r.y1 - 0.02); open(s);
    const whole = new Set(WORDS.filter(Boolean).map(w => w.text));
    for (const [axis, keep] of [['h', 1], ['v', 1], ['h', 0]]) for (const f of fold(s, axis, keep)) if (!whole.has(f.a.text) || !whole.has(f.b.text)) seen = true;
  }
  assert.ok(seen);
});

test('the report is short, and whoever reads it gets the same sheet', () => {
  const s = sheet(123456);
  fold(s, 'h', 1); fold(s, 'v', 0);
  const r = shown(s.folds); cut(s, r.x0 + 0.03, r.y0 + 0.2, r.x1 - 0.03, r.y1 - 0.1);
  open(s); fold(s, 'h', 0); cut(s, 0.1, 0.1, 0.9, 0.5);
  const report = write(s), again = read(report);
  assert.match(report, /^[0-9a-z.]+$/);
  assert.ok(report.length < 60);
  assert.deepEqual(again.pieces, s.pieces);
  assert.deepEqual(again.slits, s.slits);
  assert.deepEqual(again.friends.map(f => f.name), s.friends.map(f => f.name));
  assert.deepEqual(again.folds, s.folds);
  assert.equal(write(again), report);
  for (const bad of ['', 'x', '1.zz', '1.fv0fv0fv0fv0', '1.o', '1.c0000000000', '1.<script>', '1.fq0']) assert.equal(read(bad), null, bad);
});

test('the room keeps its colours in the stylesheet, draws no one, and sends nothing', () => {
  for (const file of ['kami/room.mjs', 'kami/kami.mjs']) {
    const code = text(file);
    assert.ok(!/#[0-9a-f]{3,8}\b|rgb\(\s*\d|hsl\(/i.test(code), file);
    assert.ok(!/fetch\(|localStorage|sessionStorage|cookie|XMLHttpRequest|sendBeacon|drawImage|new Image/.test(code), file);
  }
  const page = text('kami/index.html');
  assert.ok(!/<style|style="|<script(?![^>]*src=)|<img|<svg/.test(page));
  assert.ok(!/\bAI\b|consciousness/i.test(page + text('md/kami.md')));
  assert.ok(text('_headers').includes('/kami/*'));
  for (const w of WORDS) if (w) assert.ok(text('md/kami.md').includes(w.text), w.text);
});
