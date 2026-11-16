// The room: a list of yards, east at the top. Touch one and it crows.
// Nothing here is stored or sent. The only thing read from the visitor is the clock.
import { YARDS, hour, mood, clock, nearest, ring, crow, pass } from './ring.mjs';

const list = document.getElementById('yards');
const still = matchMedia('(prefers-reduced-motion: reduce)');
const state = ring((Date.now() >>> 0) | 0);
const here = nearest(-new Date().getTimezoneOffset() / 60);
const rows = YARDS.map((yard, index) => {
  const item = document.createElement('li');
  const time = document.createElement('time');
  if (yard.cry) {
    const button = document.createElement('button');
    button.type = 'button'; button.lang = yard.lang; button.textContent = yard.cry;
    button.addEventListener('click', () => { if (crow(state, index, true)) { cry(index, true); request(); } });
    item.append(time, button);
  } else {
    const water = document.createElement('span');
    water.textContent = '〜'; water.setAttribute('aria-hidden', 'true');
    item.append(time, water); item.classList.add('sea');
  }
  if (index === here) item.classList.add('here');
  list.append(item);
  return { item, time };
});

function hours() {
  const now = Date.now();
  rows.forEach(({ item, time }, index) => {
    const h = hour(YARDS[index], now), text = clock(h);
    if (time.textContent !== text) time.textContent = text;
    if (item.dataset.mood !== mood(h)) item.dataset.mood = mood(h);
  });
}
function flash(index, name) {
  const { item } = rows[index];
  item.classList.remove('crowing', 'mine', 'ripple', 'heard');
  void item.offsetWidth;                       // so the same row can show again at once
  item.classList.add(...name);
}
const cry = (index, mine) => flash(index, mine ? ['crowing', 'mine'] : ['crowing']);

let frame = 0, previous = null;
function tick(now) {
  frame = 0;
  const seconds = previous === null ? 0 : (now - previous) / 1000; previous = now;
  for (const event of pass(state, seconds, Date.now())) {
    if (event.type === 'crow') cry(event.index, event.mine);
    else if (event.type === 'sea') flash(event.index, ['ripple']);
    else if (event.type === 'quiet') flash(event.index, ['heard']);
    else if (event.type === 'home') flash(event.index, ['crowing', 'mine']);
  }
  hours();
  if (!document.hidden) request(); else previous = null;
}
function request() { if (!frame) frame = requestAnimationFrame(tick); }
document.addEventListener('visibilitychange', () => { previous = null; request(); });
document.documentElement.classList.toggle('still', still.matches);
list.hidden = false; hours(); request();
