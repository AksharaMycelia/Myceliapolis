// The room: draws the feather and listens for a comb.
// Nothing here is stored or sent. There are no colour values in this file;
// the material colours come from room.css and the rest from optics.mjs.
import { ladder } from './optics.mjs';
import { RATIO, SHAFT_TOP, VANE_END, QUILL_END, ZONES, grow, comb, touch, combAcross, settle, loosen, ruffle, census } from './plume.mjs';

const STEPS = 16;
const wrap = document.getElementById('plume');
const canvas = document.getElementById('feather');
const state = document.getElementById('state');
const again = document.getElementById('ruffle');
const context = canvas.getContext('2d');
const still = matchMedia('(prefers-reduced-motion: reduce)');
const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const material = { horn: css('--horn'), deep: css('--horn-deep'), spine: css('--spine'), mark: css('--gold') };

const plume = grow(7);
const shades = ZONES.map(zone => ladder(zone.spacing, zone.periods, STEPS).map(([r, g, b]) => `rgb(${r} ${g} ${b})`));

let scale = 1, dirty = true, frame = 0, last = null, cursor = 0.6, focused = false, previous = performance.now();
const radius = () => Math.max(0.085, 30 / (canvas.clientWidth || 320));

function resize() {
  const width = wrap.clientWidth;
  if (!width) return;
  const ratio = Math.min(2, devicePixelRatio || 1);
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(width * RATIO * ratio);
  scale = canvas.width;
  dirty = true; request();
}

function shaft() {
  const top = SHAFT_TOP - 0.01, nib = QUILL_END + 0.075;
  const fill = context.createLinearGradient(0, top, 0, nib);
  fill.addColorStop(0, material.deep); fill.addColorStop(0.7, material.horn); fill.addColorStop(1, material.horn);
  context.fillStyle = fill;
  context.beginPath();
  context.moveTo(0.5, top);
  context.lineTo(0.5055, VANE_END);
  context.lineTo(0.5085, QUILL_END);
  context.lineTo(0.5, nib);
  context.lineTo(0.4915, QUILL_END);
  context.lineTo(0.4945, VANE_END);
  context.closePath();
  context.fill();
  // The slit of the nib.
  context.strokeStyle = material.spine; context.lineWidth = 0.0016;
  context.beginPath(); context.moveTo(0.5, QUILL_END + 0.008); context.lineTo(0.5, nib - 0.004); context.stroke();
}

function draw(now) {
  const { barbs, px, py, tx, ty, order, shake, zone, width, grain } = plume;
  const hair = 0.8 / (canvas.clientWidth || 320);
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.setTransform(scale, 0, 0, scale, 0, 0);
  context.lineCap = 'butt';
  const spines = new Path2D();
  for (const barb of barbs) {
    let x0 = px[barb.start], y0 = py[barb.start];
    spines.moveTo(x0, y0);
    for (let k = 0; k < barb.count; k++) {
      const s = barb.segment + k, p = barb.start + k + 1;
      const value = Math.min(1, order[s]);
      const loose = 1 - value;
      let x1 = px[p] + tx[p] * loose, y1 = py[p] + ty[p] * loose;
      if (shake[s] > 0) { const quiver = Math.sin(now / 14 + k * 1.7) * shake[s] * 0.004; x1 += quiver * barb.side; y1 += quiver; }
      context.strokeStyle = shades[zone[s]][Math.max(0, Math.round(value * (STEPS - 1)) - (value >= 1 ? grain[s] : 0))];
      context.lineWidth = Math.max(hair, width[s] * (0.3 + 0.7 * value));
      context.beginPath(); context.moveTo(x0, y0); context.lineTo(x1, y1); context.stroke();
      spines.lineTo(x1, y1);
      x0 = x1; y0 = y1;
    }
  }
  context.globalAlpha = 0.5; context.strokeStyle = material.spine; context.lineWidth = 0.0011;
  context.stroke(spines); context.globalAlpha = 1;
  shaft();
  if (focused) {
    context.strokeStyle = material.mark; context.lineWidth = 0.004;
    context.beginPath();
    context.moveTo(0.01, cursor); context.lineTo(0.05, cursor);
    context.moveTo(0.95, cursor); context.lineTo(0.99, cursor);
    context.stroke();
  }
}

function report() {
  const { eye, whole } = census(plume);
  again.hidden = whole === 0;
  canvas.dataset.eye = eye.toFixed(2);
  const words = eye >= 0.97 ? 'The eye is combed.' : eye >= 0.5 ? 'Most of the eye is combed.' : whole > 0 ? 'Some of it is combed.' : 'Ruffled.';
  if (state.textContent !== words) state.textContent = words;
}

function tick(now) {
  frame = 0;
  const seconds = Math.min(0.1, (now - previous) / 1000); previous = now;
  let quivering = false;
  for (let i = 0; i < plume.shake.length; i++) {
    if (plume.shake[i] > 0) { plume.shake[i] = still.matches ? 0 : Math.max(0, plume.shake[i] - seconds / 0.32); quivering = true; }
  }
  if (dirty || quivering) { draw(now); dirty = false; }
  if (quivering) request();
}
function request() { if (!frame && !document.hidden) { previous = performance.now(); frame = requestAnimationFrame(tick); } }
function changed() { dirty = true; report(); request(); }

function place(event) {
  const box = canvas.getBoundingClientRect();
  return { x: (event.clientX - box.left) / box.width, y: (event.clientY - box.top) / box.width };
}

canvas.addEventListener('pointerdown', event => {
  last = place(event);
  if (touch(plume, last.x, last.y, radius())) changed();
});
canvas.addEventListener('pointermove', event => {
  if (event.pointerType !== 'mouse' && !last) return;
  const moves = event.getCoalescedEvents ? event.getCoalescedEvents() : [];
  let any = false;
  for (const move of moves.length ? moves : [event]) {
    const here = place(move);
    if (last) {
      const dx = here.x - last.x, dy = here.y - last.y;
      // Barbs grow sideways from the shaft, so only sideways travel is combing.
      if (Math.abs(dx) > Math.abs(dy) * 0.6) { comb(plume, here.x, here.y, dx, radius()); any = true; }
    }
    last = here;
  }
  if (any) changed();
});
for (const name of ['pointerup', 'pointercancel', 'pointerleave']) canvas.addEventListener(name, () => { last = null; });

canvas.addEventListener('keydown', event => {
  const step = event.shiftKey ? 0.2 : 0.05;
  if (event.key === 'ArrowUp') cursor = Math.max(0.05, cursor - step);
  else if (event.key === 'ArrowDown') cursor = Math.min(VANE_END, cursor + step);
  else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === ' ' || event.key === 'Enter') combAcross(plume, cursor, radius());
  else return;
  event.preventDefault();
  changed();
});
canvas.addEventListener('focus', () => { focused = true; dirty = true; request(); });
canvas.addEventListener('blur', () => { focused = false; dirty = true; request(); });

again.addEventListener('click', () => { ruffle(plume); changed(); canvas.focus({ preventScroll: true }); });

// Time passes only while the room is open and in view.
let clock = 0, beats = 0;
function time() {
  if (document.hidden) return;
  let moved = settle(plume, 0.5);
  if (++beats % 12 === 0) moved = loosen(plume) || moved;
  if (moved) changed();
}
function watch() { clearInterval(clock); if (!document.hidden) { clock = setInterval(time, 500); dirty = true; request(); } }
document.addEventListener('visibilitychange', watch);

new ResizeObserver(resize).observe(wrap);
wrap.hidden = false;
resize(); report(); watch();
