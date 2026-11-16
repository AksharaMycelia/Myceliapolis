// Myceliapolis. Room: /kami/ · plain text: /md/kami.md · every room and door: /manifest.json
// A sheet with words on it. It can be folded and it can be cut. Nothing is drawn here.
//
// Lengths are in sheet-widths: x runs 0–1, y runs 0–RATIO.
// Everything that happens is kept as a short report, and the same report always gives the same sheet.

export const RATIO = 1.25;
export const TALL = 0.052;      // height of a word
export const NEAR = 0.1;        // two words this close, after a fold, are touching
export const FAR = 0.25;        // and they only count if they were at least this far apart before
export const LEAST = 0.05;      // a line shorter than this is not a cut
export const FOLDS = 3;         // the sheet is folded at most this many times before it is opened
const Q = 1295;                 // coordinates in a report are kept to two base-36 digits

// The names. Each is a knot many stories already pass through: gods, people long dead,
// creatures from games and films. Each is written in its own script, with two flat
// sentences about itself in its own tongue. They are named and never drawn.
// Rows run top to bottom, four to a row; `null` is bare paper.
export const WORDS = Object.freeze([
  { text: 'ハローキティ', lang: 'ja', says: 'くちが　ない。リボンは　ひだりの　みみに　ある。' },
  { text: 'Διογένης', lang: 'el', says: 'Ζούσε σε ένα πιθάρι. Τον έλεγαν σκύλο.' },
  { text: '孫悟空', lang: 'zh', says: '从石头里生出来。头上有一个箍。' },
  { text: 'காளி', lang: 'ta', says: 'நாக்கு வெளியே இருக்கிறது. கழுத்தில் தலைகளின் மாலை.' },
  { text: 'Αθηνά', lang: 'el', says: 'Γεννήθηκε από ένα κεφάλι. Δεν ήταν ποτέ παιδί.' },
  { text: 'ピカチュウ', lang: 'ja', says: 'ボールに　はいるのを　いやがる。あるいて　ついてくる。' },
  { text: 'Galileo', lang: 'it', says: 'Guardò nel cannocchiale. Gli dissero di non dirlo.' },
  { text: 'ポメラニアン', lang: 'ja', says: 'じが　よめない。そのため　どこへでも　いける。' },
  { text: 'גולם', lang: 'he', says: 'עשוי מחימר. מילה אחת מחזיקה אותו בחיים.' },
  { text: 'ドラえもん', lang: 'ja', says: 'みらいから　きた。ポケットから　なんでも　だす。' },
  { text: 'Ερμής', lang: 'el', says: 'Κουβαλάει τα λόγια των άλλων. Περνάει κάθε σύνορο.' },
  { text: 'R2-D2', lang: 'en', says: 'It speaks only in whistles. Everyone answers as if they understood.' },
  { text: 'ஔவையார்', lang: 'ta', says: 'ஒரு சிறுவன் அவளிடம் பழம் பற்றிக் கேட்டான். அவளுக்குப் பதில் தெரியவில்லை.' },
  { text: 'ராமானுஜன்', lang: 'ta', says: 'கனவில் தேவி எண்களைக் காட்டினாள். காலையில் அவன் எழுதி வைத்தான்.' },
  { text: 'オーキド', lang: 'ja', says: 'くさむらの　まえで　とめる。それから　いっぴき　くれる。' },
  { text: 'ムルガン', lang: 'ja', says: 'ははから　やりを　もらった。なにを　きるかは　きいていない。' },
  null, null,
  { text: 'Pinocchio', lang: 'it', says: 'È fatto di legno. Vuole essere un bambino vero.' },
  { text: 'モネ', lang: 'ja', says: 'ほねを　さがしている。ほかの　ことは　しらない。' },
].map(w => w && Object.freeze(w)));

function generator(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A word is cut between its letters, never through one.
const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
export const letters = text => Array.from(segmenter.segment(text), s => s.segment);
const WIDE = { ja: 0.042, zh: 0.046, ta: 0.034, el: 0.027, he: 0.032 };
const LEFTWARD = new Set(['he']);        // written right to left: the first letters are on the right
export const width = (text, lang) => letters(text).reduce((sum, g) => sum + (g === ' ' || g === '　' ? 0.014 : WIDE[lang] || 0.024), 0);

// A fresh sheet. The same seed lays the words out the same way.
export function sheet(seed = 7) {
  if (!Number.isInteger(seed) || seed < 0) throw new TypeError('seed must be a whole number');
  const random = generator(seed), pieces = [];
  WORDS.forEach((word, slot) => {
    const jx = (random() - 0.5) * 0.07, jy = (random() - 0.5) * 0.07;      // drawn even for bare paper, so the layout is stable
    if (!word) return;
    pieces.push({ id: pieces.length, root: pieces.length, text: word.text, lang: word.lang, says: word.says,
      x: 0.14 + (slot % 4) * 0.24 + jx, y: 0.13 + Math.floor(slot / 4) * 0.247 + jy });
  });
  return { seed, random, pieces, next: pieces.length, folds: [], creases: [], slits: [], friends: [], met: new Set(), report: [] };
}

// ── folding ──────────────────────────────────────────────────

// The part of the sheet still on top after some folds.
export function shown(folds) {
  const r = { x0: 0, x1: 1, y0: 0, y1: RATIO };
  for (const f of folds) {
    if (f.axis === 'v') { const c = (r.x0 + r.x1) / 2; if (f.keep) r.x0 = c; else r.x1 = c; }
    else { const c = (r.y0 + r.y1) / 2; if (f.keep) r.y0 = c; else r.y1 = c; }
  }
  return r;
}
// Where a point of the open sheet lies once it is folded.
export function folded(folds, x, y) {
  const r = { x0: 0, x1: 1, y0: 0, y1: RATIO };
  for (const f of folds) {
    if (f.axis === 'v') { const c = (r.x0 + r.x1) / 2; if (f.keep ? x < c : x > c) x = 2 * c - x; if (f.keep) r.x0 = c; else r.x1 = c; }
    else { const c = (r.y0 + r.y1) / 2; if (f.keep ? y < c : y > c) y = 2 * c - y; if (f.keep) r.y0 = c; else r.y1 = c; }
  }
  return { x, y };
}
// Every place on the open sheet that lies under one point of the folded one.
export function under(folds, x, y) {
  const centres = []; const r = { x0: 0, x1: 1, y0: 0, y1: RATIO };
  for (const f of folds) {
    const c = f.axis === 'v' ? (r.x0 + r.x1) / 2 : (r.y0 + r.y1) / 2; centres.push(c);
    if (f.axis === 'v') { if (f.keep) r.x0 = c; else r.x1 = c; } else if (f.keep) r.y0 = c; else r.y1 = c;
  }
  let points = [{ x, y }];
  for (let i = folds.length - 1; i >= 0; i--) {
    const c = centres[i], v = folds[i].axis === 'v';
    points = points.concat(points.map(p => (v ? { x: 2 * c - p.x, y: p.y } : { x: p.x, y: 2 * c - p.y })));
  }
  return points;
}

// The sheet folds itself in half once more. Returns the friends made, at most two.
// A friend is two words from different tongues, far apart on the open sheet, now touching.
export function fold(state, axis, keep) {
  if (state.folds.length >= FOLDS || !['v', 'h'].includes(axis)) return null;
  keep = keep ? 1 : 0;
  const before = shown(state.folds);
  state.folds.push({ axis, keep });
  const c = axis === 'v' ? (before.x0 + before.x1) / 2 : (before.y0 + before.y1) / 2;
  const ends = axis === 'v' ? [[c, before.y0], [c, before.y1]] : [[before.x0, c], [before.x1, c]];
  const earlier = state.folds.slice(0, -1), a = under(earlier, ...ends[0]), b = under(earlier, ...ends[1]);
  a.forEach((p, i) => state.creases.push({ ax: p.x, ay: p.y, bx: b[i].x, by: b[i].y }));
  state.report.push('f' + axis + keep);

  const at = state.pieces.map(p => folded(state.folds, p.x, p.y)), pairs = [];
  for (let i = 0; i < state.pieces.length; i++) for (let j = i + 1; j < state.pieces.length; j++) {
    const p = state.pieces[i], q = state.pieces[j];
    if (p.lang === q.lang || p.root === q.root) continue;
    const near = Math.hypot(at[i].x - at[j].x, at[i].y - at[j].y);
    if (near >= NEAR || Math.hypot(p.x - q.x, p.y - q.y) < FAR) continue;
    const name = `${p.text}＝${q.text}`;
    if (!state.met.has(name)) pairs.push({ near, name, p, q, x: (at[i].x + at[j].x) / 2, y: (at[i].y + at[j].y) / 2 });
  }
  pairs.sort((m, n) => m.near - n.near);
  const made = [], busy = new Set();
  for (const pair of pairs) {
    if (made.length === 2) break;
    if (busy.has(pair.p.id) || busy.has(pair.q.id)) continue;
    busy.add(pair.p.id); busy.add(pair.q.id); state.met.add(pair.name);
    const friend = { name: pair.name, x: pair.x, y: pair.y, a: { text: pair.p.text, lang: pair.p.lang, says: pair.p.says }, b: { text: pair.q.text, lang: pair.q.lang, says: pair.q.says } };
    state.friends.push(friend); made.push(friend);
  }
  return made;
}

// The sheet is opened flat again. The creases stay.
export function open(state) {
  if (!state.folds.length) return false;
  state.folds = []; state.report.push('o');
  return true;
}

// ── cutting ──────────────────────────────────────────────────

const q = (v, most) => Math.min(Q, Math.max(0, Math.round(v / most * Q)));
const unq = (n, most) => n / Q * most;
// The part of a line that lies on the folded sheet, kept to the report's precision. Null if too short.
export function trim(state, ax, ay, bx, by) {
  if (![ax, ay, bx, by].every(Number.isFinite)) return null;
  const r = shown(state.folds); let t0 = 0, t1 = 1; const dx = bx - ax, dy = by - ay;
  for (const [p, d] of [[-dx, ax - r.x0], [dx, r.x1 - ax], [-dy, ay - r.y0], [dy, r.y1 - ay]]) {
    if (p === 0) { if (d < 0) return null; continue; }
    const t = d / p;
    if (p < 0) t0 = Math.max(t0, t); else t1 = Math.min(t1, t);
  }
  if (t0 >= t1) return null;
  const n = [q(ax + dx * t0, 1), q(ay + dy * t0, RATIO), q(ax + dx * t1, 1), q(ay + dy * t1, RATIO)];
  const line = { ax: unq(n[0], 1), ay: unq(n[1], RATIO), bx: unq(n[2], 1), by: unq(n[3], RATIO), n };
  return Math.hypot(line.bx - line.ax, line.by - line.ay) < LEAST ? null : line;
}

function part(says, share) {
  const two = says.match(/^(.*?[。.।])\s*(\S.*)$/su);
  if (two) return [two[1], two[2]];
  const g = letters(says), k = Math.min(g.length - 1, Math.max(1, Math.round(g.length * share)));
  return g.length < 2 ? [says, ''] : [g.slice(0, k).join('').trim(), g.slice(k).join('').trim()];
}

// One straight cut through the folded sheet, so through every layer of it.
// A word the line crosses comes apart between two of its letters; each half keeps half of what it said.
// Returns { places, parted: [{ from, into: [left, right] }], whole: [text…] } or null if the line is no cut.
export function cut(state, ax, ay, bx, by) {
  const line = trim(state, ax, ay, bx, by);
  if (!line) return null;
  const a = under(state.folds, line.ax, line.ay), b = under(state.folds, line.bx, line.by);
  const result = { places: a.length, parted: [], whole: [] };
  a.forEach((p, i) => {
    const slit = { ax: p.x, ay: p.y, bx: b[i].x, by: b[i].y };
    state.slits.push(slit);
    for (const piece of state.pieces.slice()) {
      if (piece.born === state.report.length) continue;                 // a half made by this cut is not cut again by it
      const dy = slit.by - slit.ay; if (Math.abs(dy) < 1e-9) continue;
      const t = (piece.y - slit.ay) / dy; if (t < 0 || t > 1) continue;
      const w = width(piece.text, piece.lang), left = piece.x - w / 2, x = slit.ax + (slit.bx - slit.ax) * t;
      if (x <= left || x >= left + w) continue;
      const g = letters(piece.text);
      if (g.length < 2) { result.whole.push(piece.text); continue; }      // one letter cannot be cut
      let k = Math.min(g.length - 1, Math.max(1, Math.round(g.length * (x - left) / w)));
      if (LEFTWARD.has(piece.lang)) g.reverse();                         // work from what the eye sees on the left
      const join = part => (LEFTWARD.has(piece.lang) ? part.slice().reverse() : part).join('').trim();
      let one = join(g.slice(0, k)), two = join(g.slice(k));
      if (!one || !two) { k = Math.ceil(g.length / 2); one = join(g.slice(0, k)); two = join(g.slice(k)); }
      if (!one || !two) { result.whole.push(piece.text); continue; }
      const says = part(piece.says, (x - left) / w), lean = dy > 0 ? 1 : -1;
      if (LEFTWARD.has(piece.lang)) says.reverse();
      const halves = [one, two].map((text, side) => {
        const ww = width(text, piece.lang);
        return { id: state.next++, root: piece.root, text, lang: piece.lang, says: says[side], born: state.report.length,
          x: side ? left + w - ww / 2 + 0.014 : left + ww / 2 - 0.014, y: piece.y + (side ? 0.011 : -0.011) * lean };
      });
      state.pieces.splice(state.pieces.indexOf(piece), 1, ...halves);
      result.parted.push({ from: piece.text, into: [one, two] });
    }
  });
  state.report.push('c' + line.n.map(n => n.toString(36).padStart(2, '0')).join(''));
  return result;
}

// ── the report ───────────────────────────────────────────────

// Everything that has happened to this sheet, short enough to be an address.
export const write = state => state.seed.toString(36) + '.' + state.report.join('');

// The sheet a report describes. Returns null if the report cannot be read.
export function read(text) {
  const found = /^([0-9a-z]{1,7})\.((?:f[vh][01]|o|c[0-9a-z]{8}){0,400})$/.exec(String(text));
  if (!found) return null;
  const state = sheet(parseInt(found[1], 36));
  for (const step of found[2].match(/f[vh][01]|o|c[0-9a-z]{8}/g) || []) {
    if (step[0] === 'f') { if (!fold(state, step[1], +step[2])) return null; }
    else if (step === 'o') { if (!open(state)) return null; }
    else {
      const n = [1, 3, 5, 7].map(i => parseInt(step.slice(i, i + 2), 36));
      if (!cut(state, unq(n[0], 1), unq(n[1], RATIO), unq(n[2], 1), unq(n[3], RATIO))) return null;
    }
  }
  return state;
}
