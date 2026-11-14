// Room II. The view pulls back from one light to all of them.
import { sow, step, accord, voiceOf } from '../field.mjs';
import { voices } from '../tone.mjs';
const canvas = document.getElementById('field'), bubble = document.getElementById('voice'), rest = document.getElementById('rest');
const context = canvas.getContext('2d');
const still = matchMedia('(prefers-reduced-motion: reduce)');
const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const glow = css('--glow'), gold = css('--gold');
const field = sow();
// The held note of room I, the chord it belongs to, and the hum of the wiring.
const sound = voices(document.getElementById('sound'), [493.88, 261.63, 329.63, 392.0, 60]);
let width = 0, height = 0, ratio = 1, zoom = still.matches ? 1 : 46, frame = 0, previous = null, paused = false, opened = 0, hide = 0;
const awake = () => !paused && !document.hidden;
function resize() {
  ratio = Math.min(2, devicePixelRatio || 1);
  width = canvas.clientWidth; height = canvas.clientHeight;
  canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
  request();
}
// Where a light sits on the screen. The view is centred on the first light while close, on the field once far.
function place(i) {
  const span = Math.min(width, height * 1.35) * 0.47, near = Math.min(1, (zoom - 1) / 6);
  const cx = field.x[0] * near, cy = field.y[0] * near;
  return [width / 2 + (field.x[i] - cx) * span * zoom, height / 2 + (field.y[i] - cy) * span * zoom];
}
function draw() {
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, width, height);
  const size = Math.max(1.6, Math.min(5, 1.1 * Math.sqrt(zoom) + 0.9));
  for (let i = field.count - 1; i >= 0; i--) {
    const [x, y] = place(i);
    if (x < -8 || y < -8 || x > width + 8 || y > height + 8) continue;
    const lit = (1 + Math.cos(field.phase[i])) / 2;
    context.globalAlpha = 0.1 + 0.9 * lit ** 3;
    context.fillStyle = i === 0 ? gold : glow;
    const s = i === 0 ? size * 1.25 : size;
    context.fillRect(x - s / 2, y - s / 2, s, s);
  }
  context.globalAlpha = 1;
}
function tick(now) {
  frame = 0;
  if (awake() && !still.matches) {
    const seconds = previous === null ? 0 : Math.min(0.1, (now - previous) / 1000);
    opened += seconds;
    // Hold on the single light for a breath, then pull back.
    if (opened > 1.6 && zoom > 1) zoom = Math.max(1, zoom * Math.exp(-seconds * 0.62));
    const { r } = step(field, seconds);
    // Alone, the old note hangs. As the field falls into step it is drawn home and the chord gathers.
    sound.set([0.9 - 0.5 * r, r * 0.8, r * 0.6, r * 0.6, r * 0.5], [r > 0.7 ? 523.25 : 493.88]);
  }
  previous = now; draw();
  if (awake() && !still.matches) request();
}
function request() { if (!frame && !document.hidden) frame = requestAnimationFrame(tick); }
function say(i, x, y) {
  const voice = voiceOf(i);
  bubble.textContent = voice.text; bubble.lang = voice.lang; bubble.hidden = false;
  bubble.style.left = Math.min(width - 90, Math.max(90, x)) + 'px'; bubble.style.top = Math.max(60, y) + 'px';
  clearTimeout(hide); hide = setTimeout(() => { bubble.hidden = true; }, 3200);
}
function touch(px, py) {
  let best = -1, least = 22 * 22;
  for (let i = 0; i < field.count; i++) { const [x, y] = place(i), d = (x - px) ** 2 + (y - py) ** 2; if (d < least) { least = d; best = i; } }
  if (best >= 0) { const [x, y] = place(best); say(best, x, y); }
}
canvas.addEventListener('click', event => { const box = canvas.getBoundingClientRect(); touch(event.clientX - box.left, event.clientY - box.top); });
let cursor = 0;
canvas.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') cursor = (cursor + 1) % field.count;
  else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') cursor = (cursor + field.count - 1) % field.count;
  else if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault(); const [x, y] = place(cursor); say(cursor, x, y);
});
rest.hidden = still.matches;
rest.addEventListener('click', () => { paused = !paused; rest.setAttribute('aria-pressed', String(paused)); previous = null; if (paused) sound.set([0, 0, 0, 0, 0]); request(); });
document.addEventListener('visibilitychange', () => { previous = null; request(); });
new ResizeObserver(resize).observe(canvas);
if (still.matches) { for (let i = 0; i < 900; i++) step(field, 0.05); }
resize();
