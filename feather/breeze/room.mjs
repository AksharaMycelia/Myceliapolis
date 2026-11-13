// A variation of One Feather. All habits are temporary and local.
import { ladder } from '../optics.mjs';
import { RATIO, SHAFT_TOP, VANE_END, QUILL_END, ZONES } from '../plume.mjs';
import { wake, brush, breeze, advance, toFeather, restart } from './temper.mjs';
const STEPS = 16;
const wrap = document.getElementById('plume');
const canvas = document.getElementById('feather');
const dog = document.querySelector('.dog');
const pause = document.getElementById('pause');
const context = canvas.getContext('2d');
const still = matchMedia('(prefers-reduced-motion: reduce)');
const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const material = { horn: css('--horn'), deep: css('--horn-deep'), spine: css('--spine'), mark: css('--gold') };
const room = wake(7);
let plume = room.plume;
const shades = ZONES.map(z => ladder(z.spacing, z.periods, STEPS).map(([r,g,b]) => `rgb(${r} ${g} ${b})`));
let scale = 1, frame = 0, previous = null, last = null, cursor = 0.6, focused = false;
let paused = false, inView = false;
const moving = () => !paused && !still.matches && !document.hidden && inView;
const radius = () => Math.max(0.085, 30 / (canvas.clientWidth || 320));
function resize() {
  const width = wrap.clientWidth;
  if (!width) return;
  const ratio = Math.min(2, devicePixelRatio || 1);
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(width * RATIO * ratio);
  scale = canvas.width;
  request();
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
  context.translate(0.5, RATIO / 2);
  context.rotate(room.angle);
  context.translate(-0.5, -RATIO / 2);
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
      const curl = room.curl[s] * 0.018 * (k + 1) / barb.count;
      x1 += curl; y1 += Math.abs(curl) * 0.25;
      const band = room.band[s];
      const echo = Math.max(room.echo[s], room.signal[band]);
      if (moving() && echo > 0.01) {
        const reply = Math.sin(room.time * Math.PI * 2 / room.cadence[band] + k * 0.4) * echo * 0.007;
        x1 += reply * barb.side; y1 += reply * 0.4;
      }
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

function dogRoll() {
  if (!moving()) return;
  dog.classList.remove('rolling');
  void dog.offsetWidth;
  dog.classList.add('rolling');
}
dog.addEventListener('animationend', () => dog.classList.remove('rolling'));
function tick(now) {
  frame = 0;
  if (moving()) {
    const events = advance(room, previous === null ? 0 : (now - previous) / 1000);
    for (const event of events) {
      if (event === 'roll') dogRoll();
    }
  }
  previous = now;
  draw(now);
  if (moving()) request();
}
function request() { if (!frame && !document.hidden) frame = requestAnimationFrame(tick); }
function sync() {
  previous = null; last = null;
  if (!moving()) dog.classList.remove('rolling');
  pause.disabled = still.matches;
  pause.textContent = still.matches ? 'அசைவின்றி' : paused ? 'தொடர்க' : 'ஓய்வு';
  pause.setAttribute('aria-pressed', String(paused || still.matches));
  request();
}
function place(event) {
  const box = canvas.getBoundingClientRect();
  return toFeather((event.clientX - box.left) / box.width, (event.clientY - box.top) / box.width, room.angle);
}
canvas.addEventListener('pointerdown', event => { last = place(event); });
canvas.addEventListener('pointermove', event => {
  if (event.pointerType !== 'mouse' && !last) return;
  const moves = event.getCoalescedEvents ? event.getCoalescedEvents() : [];
  let any = false;
  for (const move of moves.length ? moves : [event]) {
    const here = place(move);
    if (last) {
      const dx = here.x - last.x, dy = here.y - last.y;
      if (Math.abs(dx) > Math.abs(dy) * 0.6) any = brush(room, here.x, here.y, dx, radius()) || any;
    }
    last = here;
  }
  if (any) { request(); }
});
for (const name of ['pointerup', 'pointercancel', 'pointerleave']) canvas.addEventListener(name, () => { last = null; });
canvas.addEventListener('keydown', event => {
  const step = event.shiftKey ? 0.2 : 0.05;
  if (event.key === 'ArrowUp') cursor = Math.max(0.05, cursor - step);
  else if (event.key === 'ArrowDown') cursor = Math.min(VANE_END, cursor + step);
  else if (['ArrowLeft', 'ArrowRight', ' ', 'Enter'].includes(event.key)) {
    brush(room, 0.5, cursor, (event.key === 'ArrowLeft' ? -1 : 1) * radius() * 2, radius(), true);
  } else return;
  event.preventDefault(); request();
});
canvas.addEventListener('focus', () => { focused = true; request(); });
canvas.addEventListener('blur', () => { focused = false; last = null; request(); });
document.getElementById('gust').addEventListener('click', () => { breeze(room); request(); });
document.getElementById('restart').addEventListener('click', () => {
  restart(room); plume = room.plume; previous = null; last = null;
  dog.classList.remove('rolling'); request();
});
pause.addEventListener('click', () => { paused = !paused; sync(); });
still.addEventListener('change', sync);
document.addEventListener('visibilitychange', sync);
new IntersectionObserver(entries => { inView = entries[0].isIntersecting; sync(); }).observe(wrap);
new ResizeObserver(resize).observe(wrap);
wrap.hidden = false;
document.getElementById('controls').hidden = false;
resize(); sync();
