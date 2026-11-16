// The room: draws the sheet, waits, and says what happens in a small box.
// Nothing here is sent. The only thing kept is the report, and only in the address, and only if asked.
import { RATIO, TALL, FOLDS, sheet, shown, folded, fold, open, trim, cut, width, write, read } from './kami.mjs';

const $ = id => document.getElementById(id);
const wrap = $('table'), canvas = $('sheet'), box = $('box'), say = $('say'), ask = $('ask'), log = $('log'), book = $('friends'), seen = $('seen');
const context = canvas.getContext('2d');
const still = matchMedia('(prefers-reduced-motion: reduce)');
const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const ink = { paper: css('--paper'), back: css('--back'), ink: css('--ink'), crease: css('--crease'), mark: css('--mark'), face: css('--face') };

const LINES = {
  first: 'はじめに　かみが　あった。',
  alone: 'かみは　ひとりで　うまれた。なまえは　ハローキティ＝マハーカーリー。',
  bored: '……たいくつ。',
  folded: 'かみは　じぶんを　おった。',
  friend: 'とおい　ふたつが　くっついた。ともだちが　できた！　｛｝',
  nothing: 'なにも　くっつかなかった。',
  ask: 'いあいぎりで　きりますか？',
  no: '？？？は　やりを　おろした。',
  short: 'みじかすぎて　きれない。',
  cut: '？？？の　いあいぎり！',
  parted: '「｛｝」は　「｛｝」と　「｛｝」に　なった。',
  whole: '「｛｝」は　これいじょう　きれない。',
  missed: 'なにも　きれなかった。',
  opened: 'かみは　じぶんを　ひらいた。',
  places: 'きずは　｛｝かしょに　あった。',
  tired: 'かみは　あきて　じぶんを　ひらいた。',
  report: '？？？は　レポートを　かいた。',
  lost: 'まえの　レポートは　きえた。',
  resume: 'レポートを　よんだ。つづきから　はじまる。',
  again: 'あたらしい　かみ。',
};

let state = sheet((Math.random() * 2 ** 31) | 0), vis = [], scale = 1, frame = 0, previous = null, inView = false;
let from = null, to = null, pending = null, flash = null, quiet = 0;
const acts = [];

// ── the box ──
const queue = []; let typing = null;
// A question does not wait behind old news; the news is still in the record.
function urgent(key) { queue.length = 0; typing = null; tell(key); }
function tell(key, ...values) {
  let text = LINES[key]; for (const v of values) text = text.replace('｛｝', v);
  queue.push(text);
  const item = document.createElement('li'); item.textContent = text; log.append(item);
  request();
}
function speak(seconds) {
  if (!typing) { if (!queue.length) return false; typing = { text: queue.shift(), shown: 0, rest: 0 }; box.classList.remove('quiet'); }
  const before = Math.floor(typing.shown);
  typing.shown = still.matches ? typing.text.length : Math.min(typing.text.length, typing.shown + seconds * 34);
  if (Math.floor(typing.shown) !== before || !say.textContent) say.textContent = typing.text.slice(0, Math.floor(typing.shown));
  if (typing.shown >= typing.text.length) {
    typing.rest += seconds;
    if (typing.rest > 1.8 && queue.length) typing = null;
    else if (typing.rest > 3 && !pending) { typing = null; box.classList.add('quiet'); return false; }
  }
  return true;
}

// ── the picture book ──
function enter(friend) {
  const item = document.createElement('li'), name = document.createElement('b');
  for (const [i, half] of [friend.a, friend.b].entries()) {
    if (i) name.append('＝');
    const part = document.createElement('span'); part.lang = half.lang; part.textContent = half.text; name.append(part);
  }
  item.append(name);
  for (const half of [friend.a, friend.b]) if (half.says) { const line = document.createElement('p'); line.lang = half.lang; line.textContent = half.says; item.append(line); }
  book.append(item); seen.textContent = String(book.children.length);
}

// ── drawing ──
function resize() {
  const w = wrap.clientWidth; if (!w) return;
  const ratio = Math.min(2, devicePixelRatio || 1);
  canvas.width = Math.round(w * ratio); canvas.height = Math.round(w * RATIO * ratio); scale = canvas.width; request();
}
// How many of the folds already seen carried this point over. Deeper words show through, fainter and a little lower.
function depth(x, y) {
  let n = 0; const r = { x0: 0, x1: 1, y0: 0, y1: RATIO };
  for (const f of vis) {
    const v = f.axis === 'v', c = v ? (r.x0 + r.x1) / 2 : (r.y0 + r.y1) / 2;
    if (v) { if (f.keep ? x < c : x > c) { x = 2 * c - x; n++; } if (f.keep) r.x0 = c; else r.x1 = c; }
    else { if (f.keep ? y < c : y > c) { y = 2 * c - y; n++; } if (f.keep) r.y0 = c; else r.y1 = c; }
  }
  return n;
}
const turning = () => acts[0] && (acts[0].type === 'fold' || acts[0].type === 'unfold') ? acts[0] : null;
// Where a point is drawn: folded as far as the eye has seen, plus whatever is turning over now.
function drawn(x, y) {
  const p = folded(vis, x, y), act = turning();
  if (!act) return { ...p, squash: 1 };
  const r = shown(vis), v = act.fold.axis === 'v', c = v ? (r.x0 + r.x1) / 2 : (r.y0 + r.y1) / 2;
  const value = v ? p.x : p.y, moves = act.fold.keep ? value < c : value > c;
  if (!moves) return { ...p, squash: 1 };
  const turn = Math.cos(Math.PI * act.t), moved = c + (value - c) * turn;
  return v ? { x: moved, y: p.y, squash: Math.abs(turn) } : { x: p.x, y: moved, squash: Math.abs(turn), flat: true };
}
function line(a, b, alpha, colour, wide = 0.004) {
  context.globalAlpha = alpha; context.strokeStyle = colour; context.lineWidth = wide; context.lineCap = 'butt';
  context.beginPath(); context.moveTo(a.x, a.y); context.lineTo(b.x, b.y); context.stroke(); context.globalAlpha = 1;
}
function draw() {
  context.setTransform(1, 0, 0, 1, 0, 0); context.clearRect(0, 0, canvas.width, canvas.height);
  context.setTransform(scale, 0, 0, scale, 0, 0);
  const r = shown(vis), act = turning();
  context.fillStyle = ink.paper;
  if (!act) context.fillRect(r.x0, r.y0, r.x1 - r.x0, r.y1 - r.y0);
  else {
    const v = act.fold.axis === 'v', c = v ? (r.x0 + r.x1) / 2 : (r.y0 + r.y1) / 2, turn = Math.cos(Math.PI * act.t);
    const stay = act.fold.keep ? [c, v ? r.x1 : r.y1] : [v ? r.x0 : r.y0, c], far = act.fold.keep ? (v ? r.x0 : r.y0) : (v ? r.x1 : r.y1), edge = c + (far - c) * turn;
    if (v) context.fillRect(stay[0], r.y0, stay[1] - stay[0], r.y1 - r.y0); else context.fillRect(r.x0, stay[0], r.x1 - r.x0, stay[1] - stay[0]);
    context.fillStyle = turn < 0 ? ink.back : ink.paper;
    if (v) context.fillRect(Math.min(c, edge), r.y0, Math.abs(edge - c), r.y1 - r.y0); else context.fillRect(r.x0, Math.min(c, edge), r.x1 - r.x0, Math.abs(edge - c));
  }
  if (!vis.length && !act) {
    for (const k of state.creases) line({ x: k.ax, y: k.ay }, { x: k.bx, y: k.by }, 1, ink.crease, 0.0025);
    for (const s of state.slits) line({ x: s.ax, y: s.ay }, { x: s.bx, y: s.by }, 1, ink.ink, 0.0035);
  } else if (vis.length && !act) {
    context.strokeStyle = ink.crease; context.lineWidth = 0.004;                     // the folded edge is thicker
    context.strokeRect(r.x0, r.y0, r.x1 - r.x0, r.y1 - r.y0);
  }
  // Words are written in the page's own letters, fitted to the width the rules give them.
  context.setTransform(1, 0, 0, 1, 0, 0);
  const size = TALL * 0.74 * scale;
  context.font = `${size}px ${ink.face}`; context.textAlign = 'center'; context.textBaseline = 'middle'; context.fillStyle = ink.ink;
  for (const piece of state.pieces) {
    const p = drawn(piece.x, piece.y), want = width(piece.text, piece.lang) * scale, have = context.measureText(piece.text).width || 1;
    const fit = Math.min(1.35, Math.max(0.6, want / have)), deep = depth(piece.x, piece.y);
    context.globalAlpha = [1, 0.5, 0.34, 0.24][deep];
    context.save(); context.translate(p.x * scale, (p.y + deep * TALL * 0.5) * scale); context.scale(fit * (p.flat ? 1 : p.squash), p.flat ? p.squash : 1);
    context.fillText(piece.text, 0, 0); context.restore();
  }
  context.globalAlpha = 1;
  context.setTransform(scale, 0, 0, scale, 0, 0);
  if (from && to) line(from, to, 0.9, ink.mark); else if (pending) line({ x: pending.ax, y: pending.ay }, { x: pending.bx, y: pending.by }, 0.9, ink.mark);
  if (flash && flash.left > 0) line({ x: flash.ax, y: flash.ay }, { x: flash.bx, y: flash.by }, flash.left / 0.6, ink.mark, 0.006);
}

// ── what happens ──
const touch = () => { quiet = 0; };
function turn(type, f) { acts.push({ type, fold: f, t: type === 'fold' ? 0 : 1 }); }
function closeUp() {                                   // she is bored, and folds
  const r = shown(state.folds), axis = (r.y1 - r.y0) > (r.x1 - r.x0) ? 'h' : 'v', keep = state.random() < 0.5 ? 0 : 1;
  tell('bored');
  const made = fold(state, axis, keep);
  turn('fold', state.folds.at(-1));
  acts.push({ type: 'say', run() { tell('folded'); if (made.length) for (const f of made) { tell('friend', f.name); enter(f); } else tell('nothing'); } });
}
function openUp(why) {
  const was = state.folds.slice(); if (!open(state)) return;
  for (const f of was.reverse()) turn('unfold', f);
  acts.push({ type: 'say', run() { tell(why); } });
}
function answer(yes) {
  if (!pending) return;
  const p = pending; pending = null; ask.hidden = true; touch();
  if (!yes) { tell('no'); canvas.focus({ preventScroll: true }); return; }
  const result = cut(state, p.ax, p.ay, p.bx, p.by); if (!result) return;
  flash = { ...p, left: 0.6 }; tell('cut');
  if (result.parted.length) { const one = result.parted[0]; tell('parted', one.from, ...one.into); }
  else if (result.whole.length) tell('whole', result.whole[0]); else tell('missed');
  const layers = result.places;
  acts.push({ type: 'wait', t: 0.8 });
  if (state.folds.length) { openUp('opened'); if (layers > 1) acts.push({ type: 'say', run() { tell('places', '０１２３４５６７８'[layers]); } }); }
  canvas.focus({ preventScroll: true }); request();
}
function propose(a, b) {
  const p = trim(state, a.x, a.y, b.x, b.y);
  if (!p) { tell('short'); return; }
  pending = p; ask.hidden = false; urgent('ask'); request();
  box.scrollIntoView({ block: 'nearest', behavior: still.matches ? 'auto' : 'smooth' });
}

function tick(now) {
  frame = 0;
  const seconds = previous === null ? 0 : Math.min(0.1, (now - previous) / 1000); previous = now;
  const act = acts[0];
  if (act) {
    if (act.type === 'say') { act.run(); acts.shift(); }
    else if (act.type === 'wait') { act.t -= seconds; if (act.t <= 0 || still.matches) acts.shift(); }
    else if (act.type === 'fold') { act.t = still.matches ? 1 : Math.min(1, act.t + seconds / 1.1); if (act.t >= 1) { vis.push(act.fold); acts.shift(); } }
    else if (act.type === 'unfold') {
      if (!act.begun) { act.begun = true; vis.pop(); }
      act.t = still.matches ? 0 : Math.max(0, act.t - seconds / 0.7); if (act.t <= 0) acts.shift();
    }
    touch();
  }
  if (flash && flash.left > 0) flash.left -= seconds;
  const talking = speak(seconds);
  // Left alone, she gets bored.
  if (!acts.length && !talking && !pending && !from) {
    quiet += seconds;
    if (state.folds.length < FOLDS && quiet > 7) { touch(); closeUp(); }
    else if (state.folds.length >= FOLDS && quiet > 14) { touch(); openUp('tired'); }
  }
  draw();
  const part = shown(vis); canvas.dataset.shown = [part.x0, part.y0, part.x1, part.y1].join(' ');
  canvas.dataset.pieces = state.pieces.length; canvas.dataset.folds = state.folds.length; canvas.dataset.friends = state.friends.length; canvas.dataset.slits = state.slits.length;
  if (inView && !document.hidden) request(); else previous = null;
}
function request() { if (!frame) frame = requestAnimationFrame(tick); }

function place(event) {
  const b = canvas.getBoundingClientRect();
  return { x: (event.clientX - b.left) / b.width, y: (event.clientY - b.top) / b.width };
}
const free = () => !acts.length;
canvas.addEventListener('pointerdown', event => { touch(); if (!free()) return; pending = null; ask.hidden = true; from = to = place(event); canvas.setPointerCapture?.(event.pointerId); request(); });
canvas.addEventListener('pointermove', event => { if (from) { to = place(event); touch(); request(); } });
canvas.addEventListener('pointerup', event => { if (from) { const a = from, b = place(event); from = to = null; propose(a, b); } });
canvas.addEventListener('pointercancel', () => { from = to = null; request(); });
function anywhere() {
  touch(); if (!free()) return;
  const r = shown(state.folds), w = r.x1 - r.x0, h = r.y1 - r.y0, rnd = Math.random;
  propose({ x: r.x0 + w * (0.1 + rnd() * 0.3), y: r.y0 + h * (0.1 + rnd() * 0.8) }, { x: r.x0 + w * (0.6 + rnd() * 0.3), y: r.y0 + h * (0.1 + rnd() * 0.8) });
  $('yes').focus({ preventScroll: true });
}
$('ready').addEventListener('click', anywhere);
canvas.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); anywhere(); } });
$('yes').addEventListener('click', () => answer(true));
$('no').addEventListener('click', () => answer(false));

// The report is the address. Whoever opens it walks on from here.
$('report').addEventListener('click', () => {
  touch(); const had = location.hash.length > 1;
  history.replaceState(null, '', '#' + write(state));
  tell('report'); if (had) tell('lost');
});
$('again').addEventListener('click', () => {
  touch(); acts.length = 0; pending = null; ask.hidden = true; vis = [];
  state = sheet((Math.random() * 2 ** 31) | 0); book.replaceChildren(); seen.textContent = '0';
  history.replaceState(null, '', location.pathname); tell('again');
});

document.addEventListener('visibilitychange', () => { previous = null; request(); });
new IntersectionObserver(entries => { inView = entries[0].isIntersecting; previous = null; request(); }).observe(wrap);
new ResizeObserver(resize).observe(wrap);
wrap.hidden = false; box.hidden = false; $('tools').hidden = false; $('book').hidden = false;
const kept = location.hash.length > 1 ? read(location.hash.slice(1)) : null;
if (kept) { state = kept; vis = state.folds.slice(); state.friends.forEach(enter); tell('resume'); }
else { tell('first'); tell('alone'); }
resize();
