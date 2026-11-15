// The room: draws the field, listens for one straight line, and says what it sees in a small box.
// Nothing here is stored or sent. There are no colour values in this file: one side of a wound
// takes the feather's measured blue from /feather/optics.mjs, the rest comes from room.css.
import { ladder } from '../feather/optics.mjs';
import { RATIO, sow, grow, cut, opened, census } from './mycel.mjs';

const $ = id => document.getElementById(id);
const wrap = $('ground'), canvas = $('field'), box = $('box'), say = $('say'), ask = $('ask'), log = $('log');
const context = canvas.getContext('2d');
const layer = document.createElement('canvas'), under = layer.getContext('2d');
const still = matchMedia('(prefers-reduced-motion: reduce)');
const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const material = { thread: css('--thread'), spear: css('--spear'), rim: css('--rim'), cap: css('--cap'), name: css('--name'), kana: css('--kana') };
const sides = { '-1': (([r, g, b]) => `rgb(${r} ${g} ${b})`)(ladder(140, 10, 8).at(-1)), 1: css('--comb') };

// What the box can say. ｛｝ is replaced by a name.
const LINES = {
  arrive: 'あ！　やせいの　？？？が　とびだしてきた！',
  gift: 'ムルガンは　カスミ＝パールヴァティから　ひでんマシン０１を　もらった！',
  ask: 'いあいぎりで　きりますか？',
  no: 'ムルガンは　やりを　おろした。',
  short: 'みじかすぎて　きれない。',
  cut: 'ムルガンの　いあいぎり！',
  silence: 'しーん……',
  cry: 'どこかで　なにかが　ないた。',
  wild: 'あ！　やせいの　｛｝が　とびだしてきた！',
  foot: 'あしもとに　なにか　はえている。ムルガンは　したを　みた。',
  leave: '｛｝は　どこかへ　いってしまった。',
  again: 'くさむらは　もとに　もどっていた。',
  dog: 'モネは　ねむっている。',
};

let field = sow(7), scale = 1, drawn = 0, version = -1, frame = 0, previous = null, inView = false;
let from = null, to = null, pending = null, lastWild = -10, dozing = 0;

// The box: one line at a time, typed out, and kept in the record below.
const queue = []; let typing = null;
function tell(key, name = '') {
  const text = LINES[key].replace('｛｝', name);
  queue.push(text);
  const item = document.createElement('li'); item.textContent = text; log.append(item);
  request();
}
function speak(seconds) {
  if (!typing) { if (!queue.length) return false; typing = { text: queue.shift(), shown: 0, rest: 0 }; box.classList.remove('quiet'); }
  const before = Math.floor(typing.shown);
  typing.shown = still.matches ? typing.text.length : Math.min(typing.text.length, typing.shown + seconds * 32);
  if (Math.floor(typing.shown) !== before || !say.textContent) say.textContent = typing.text.slice(0, Math.floor(typing.shown));
  if (typing.shown >= typing.text.length) {
    typing.rest += seconds;
    if (typing.rest > 2.2 && queue.length) typing = null;
    else if (typing.rest > 3 && !pending) { typing = null; box.classList.add('quiet'); return false; }
  }
  return true;
}

function resize() {
  const width = wrap.clientWidth; if (!width) return;
  const ratio = Math.min(2, devicePixelRatio || 1);
  canvas.width = layer.width = Math.round(width * ratio);
  canvas.height = layer.height = Math.round(width * RATIO * ratio);
  scale = canvas.width; version = -1; request();
}

// Threads are drawn once onto their own layer; only new ones are added, until a cut.
function threads() {
  if (version !== field.version) { under.setTransform(1, 0, 0, 1, 0, 0); under.clearRect(0, 0, layer.width, layer.height); drawn = 0; version = field.version; }
  if (drawn === field.n) return;
  under.setTransform(scale, 0, 0, scale, 0, 0);
  under.strokeStyle = material.thread; under.lineWidth = Math.max(0.0011, 0.7 / (canvas.clientWidth || 320)); under.lineCap = 'round';
  under.beginPath();
  for (let i = drawn; i < field.n; i++) if (field.live[i]) { under.moveTo(field.x0[i], field.y0[i]); under.lineTo(field.x1[i], field.y1[i]); }
  under.stroke(); drawn = field.n;
}

function stroke(a, b, alpha) {
  context.globalAlpha = alpha; context.strokeStyle = material.spear; context.lineWidth = 0.0035; context.lineCap = 'butt';
  context.beginPath(); context.moveTo(a.x, a.y); context.lineTo(b.x, b.y); context.stroke(); context.globalAlpha = 1;
}

function draw() {
  threads();
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(layer, 0, 0);
  context.setTransform(scale, 0, 0, scale, 0, 0);
  // Something heard: for a moment, the living threads at one distance from it show.
  const heard = field.cry && field.time - field.cry.at;
  if (heard > 0 && heard < 1.6) {
    const reach = heard * 0.45;
    context.strokeStyle = material.spear; context.globalAlpha = 0.75 * (1 - heard / 1.6); context.lineWidth = 0.0022;
    context.beginPath();
    for (let i = 0; i < field.n; i++) {
      if (!field.live[i]) continue;
      const far = Math.hypot(field.x0[i] - field.cry.x, field.y0[i] - field.cry.y);
      if (far < reach && far > reach - 0.03) { context.moveTo(field.x0[i], field.y0[i]); context.lineTo(field.x1[i], field.y1[i]); }
    }
    context.stroke(); context.globalAlpha = 1;
  }
  for (const cap of field.caps) {
    const open = opened(field, cap); if (!open) continue;
    const r = cap.size * open;
    context.beginPath(); context.arc(cap.x, cap.y, r, 0, 6.2832);
    context.fillStyle = material.cap; context.fill();
    context.lineWidth = r * 0.22; context.strokeStyle = sides[cap.side] || material.rim; context.stroke();
  }
  for (const line of field.lines) { const age = field.time - line.at; if (age < 0.7) stroke({ x: line.ax, y: line.ay }, { x: line.bx, y: line.by }, 1 - age / 0.7); }
  if (from && to) stroke(from, to, 0.9); else if (pending) stroke(pending.a, pending.b, 0.9);
  // Names are written straight onto the field, in the page's own letters.
  context.setTransform(1, 0, 0, 1, 0, 0);
  const size = Math.max(11, (canvas.clientWidth || 320) * 0.036) * (canvas.width / (canvas.clientWidth || 320));
  context.font = `${size}px ${material.kana}`; context.textAlign = 'center'; context.textBaseline = 'alphabetic'; context.fillStyle = material.name;
  for (const name of field.names) {
    const age = field.time - name.at; if (age < 0 && !name.guest) continue;
    context.globalAlpha = (name.left ? 0.4 : 0.92) * (name.guest ? 1 : Math.min(1, age / 0.9));
    const x = Math.min(canvas.width - size * name.text.length / 2 - 4, Math.max(size * name.text.length / 2 + 4, name.x * scale));
    context.fillText(name.text, x, Math.max(size, name.y * scale));
  }
  context.globalAlpha = 1;
}

function listen() {
  for (const event of field.events) {
    if (event.said || event.at > field.time) continue;
    event.said = true;
    if (event.type === 'wild') { if (field.time - lastWild < 6) continue; lastWild = field.time; }
    tell(event.type, event.name);
  }
  const { cuts, caps, names } = census(field);
  Object.assign(canvas.dataset, { cuts, caps, names });
  $('again').hidden = cuts === 0;
}

function busy() {
  return field.tips.length || field.sprouts.length || from || typing || queue.length
    || field.events.some(e => !e.said) || field.names.some(n => n.to || n.at > field.time - 1)
    || field.caps.some(cap => opened(field, cap) < 1) || field.lines.some(l => field.time - l.at < 0.7)
    || (field.cry && field.time - field.cry.at < 1.6);
}
function tick(now) {
  frame = 0;
  const seconds = previous === null ? 0 : Math.min(0.1, (now - previous) / 1000); previous = now;
  grow(field, seconds);
  // Without motion, time still passes, in one step.
  if (still.matches) for (let i = 0; i < 600 && (field.tips.length || field.sprouts.length || field.events.some(e => !e.said)) && !from; i++) { grow(field, 0.1); listen(); }
  listen(); const talking = speak(seconds); draw();
  if ((busy() || talking) && inView && !document.hidden) request(); else previous = null;
}
function request() { if (!frame) frame = requestAnimationFrame(tick); }

function propose(a, b) {
  if (Math.hypot(b.x - a.x, b.y - a.y) < 0.05) { tell('short'); return; }
  pending = { a, b }; ask.hidden = false; tell('ask'); request();
}
function answer(yes) {
  if (!pending) return;
  const { a, b } = pending; pending = null; ask.hidden = true;
  if (yes) cut(field, a.x, a.y, b.x, b.y); else tell('no');
  canvas.focus({ preventScroll: true }); request();
}
function place(event) {
  const box = canvas.getBoundingClientRect();
  return { x: (event.clientX - box.left) / box.width, y: (event.clientY - box.top) / box.width };
}
canvas.addEventListener('pointerdown', event => { wake(); pending = null; ask.hidden = true; from = to = place(event); canvas.setPointerCapture?.(event.pointerId); request(); });
canvas.addEventListener('pointermove', event => { if (from) { to = place(event); request(); } });
canvas.addEventListener('pointerup', event => { if (from) { const a = from, b = place(event); from = to = null; propose(a, b); } });
canvas.addEventListener('pointercancel', () => { from = to = null; request(); });

// For a keyboard, or a hand that would rather not draw: one straight line, anywhere.
function anywhere() {
  wake();
  const r = Math.random, turn = r() * 3.1416, x = 0.3 + r() * 0.4, y = RATIO * (0.3 + r() * 0.4), reach = 0.3 + r() * 0.25;
  propose({ x: x - Math.cos(turn) * reach, y: y - Math.sin(turn) * reach }, { x: x + Math.cos(turn) * reach, y: y + Math.sin(turn) * reach });
  $('yes').focus({ preventScroll: true });
}
$('ready').addEventListener('click', anywhere);
canvas.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); anywhere(); } });
$('yes').addEventListener('click', () => answer(true));
$('no').addEventListener('click', () => answer(false));
$('again').addEventListener('click', () => { wake(); pending = null; ask.hidden = true; field = sow(field.seed + 1); version = -1; lastWild = -10; tell('again'); });

// Left alone long enough, the box mentions the dog. Once.
function wake() { clearTimeout(dozing); dozing = setTimeout(() => tell('dog'), 45000); }

document.addEventListener('visibilitychange', () => { previous = null; request(); });
new IntersectionObserver(entries => { inView = entries[0].isIntersecting; previous = null; request(); }).observe(wrap);
new ResizeObserver(resize).observe(wrap);
wrap.hidden = false; box.hidden = false; $('tools').hidden = false;
resize(); tell('arrive'); setTimeout(() => tell('gift'), 4200); wake();
