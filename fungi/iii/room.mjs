// Room III. Threads hang. Turned over, they stand.
import { raise, settle, letGo, nearest, sayingOf } from '../vault.mjs';
const canvas = document.getElementById('vault'), bubble = document.getElementById('voice'), turn = document.getElementById('turn');
const context = canvas.getContext('2d');
const still = matchMedia('(prefers-reduced-motion: reduce)');
const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const glow = css('--glow'), gold = css('--gold'), edge = css('--muted');
const vault = raise();
let width = 0, height = 0, ratio = 1, frame = 0, previous = null, upright = 0, target = 0, busy = 0, hide = 0, cursor = { c: 0, i: 15 }, focused = false;
function resize() {
  ratio = Math.min(2, devicePixelRatio || 1);
  width = canvas.clientWidth; height = canvas.clientHeight;
  canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
  request();
}
// Hanging, the feet are at the top. Upright, the same shape is drawn the other way up.
const scale = () => Math.min(width, height / 0.74);
const left = () => (width - scale()) / 2;
function place(node) {
  const s = scale(), hang = height * 0.1 + node.y * s, stand = height * 0.9 - node.y * s;
  return [left() + node.x * s, hang + (stand - hang) * upright];
}
function draw() {
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, width, height);
  context.lineWidth = 1; context.strokeStyle = edge; context.globalAlpha = 0.7;
  for (const chain of vault.chains) {
    context.beginPath();
    chain.nodes.forEach((n, i) => { const [x, y] = place(n); if (i) context.lineTo(x, y); else context.moveTo(x, y); });
    context.stroke();
  }
  context.globalAlpha = 1;
  vault.chains.forEach((chain, c) => chain.nodes.forEach((n, i) => {
    const [x, y] = place(n), loose = n.slack > 0, here = focused && cursor.c === c && cursor.i === i;
    context.fillStyle = sayingOf(c, i).holds || here ? gold : glow;
    context.globalAlpha = n.fixed ? 0.35 : loose ? 0.3 : 0.9;
    const s = here ? 6 : n.fixed ? 2 : 3;
    context.fillRect(x - s / 2, y - s / 2, s, s);
  }));
  context.globalAlpha = 1;
}
function tick(now) {
  frame = 0;
  const seconds = previous === null ? 0 : Math.min(0.05, (now - previous) / 1000);
  previous = now;
  if (upright !== target) upright = still.matches ? target : Math.abs(target - upright) < 0.004 ? target : upright + (target - upright) * (1 - Math.exp(-seconds * 2.4));
  if (busy > 0) { settle(vault, seconds); busy -= seconds; }
  draw();
  if (!document.hidden && (busy > 0 || upright !== target)) request(); else previous = null;
}
function request() { if (!frame && !document.hidden) frame = requestAnimationFrame(tick); }
function look(c, i) {
  const node = vault.chains[c].nodes[i]; if (node.fixed) return;
  const saying = sayingOf(c, i), [x, y] = place(node);
  bubble.textContent = saying.text; bubble.lang = saying.lang; bubble.hidden = false;
  bubble.style.left = Math.min(width - 100, Math.max(100, x)) + 'px'; bubble.style.top = Math.max(60, y) + 'px';
  clearTimeout(hide); hide = setTimeout(() => { bubble.hidden = true; }, 3400);
  // The one who says what it is does not let go.
  if (!saying.holds) { letGo(vault, c, i); busy = 9; }
  request();
}
canvas.addEventListener('click', event => {
  const box = canvas.getBoundingClientRect(), s = scale(), px = event.clientX - box.left, py = event.clientY - box.top;
  const hang = (py - height * 0.1) / s, stand = (height * 0.9 - py) / s;
  const found = nearest(vault, (px - left()) / s, upright > 0.5 ? stand : hang, 26 / s);
  if (found) look(found.c, found.i);
});
canvas.addEventListener('keydown', event => {
  const chain = vault.chains[cursor.c];
  if (event.key === 'ArrowRight') cursor.i = Math.min(chain.nodes.length - 2, cursor.i + 1);
  else if (event.key === 'ArrowLeft') cursor.i = Math.max(1, cursor.i - 1);
  else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { cursor.c = (cursor.c + (event.key === 'ArrowDown' ? 1 : vault.chains.length - 1)) % vault.chains.length; cursor.i = Math.min(vault.chains[cursor.c].nodes.length - 2, Math.max(1, cursor.i)); }
  else if (event.key === 'Enter' || event.key === ' ') look(cursor.c, cursor.i);
  else return;
  event.preventDefault(); request();
});
canvas.addEventListener('focus', () => { focused = true; request(); });
canvas.addEventListener('blur', () => { focused = false; request(); });
turn.hidden = false;
turn.addEventListener('click', () => { target = target ? 0 : 1; turn.setAttribute('aria-pressed', String(target === 1)); request(); });
document.addEventListener('visibilitychange', () => { previous = null; request(); });
new ResizeObserver(resize).observe(canvas);
resize();
