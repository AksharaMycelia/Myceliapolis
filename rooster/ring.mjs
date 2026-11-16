// Myceliapolis. Room: /rooster/ · plain text: /md/rooster.md · every room and door: /manifest.json
// A ring of yards around the earth, and a cry that is passed from one to the next.
// The hours are real. Whether a yard answers is invented. Nothing is drawn here.

// East to west. `offset` is hours from UTC. A yard without a cry is open water.
export const YARDS = Object.freeze([
  { offset: 12 },
  { offset: 9, cry: 'コケコッコー', lang: 'ja' },
  { offset: 8, cry: '喔喔喔', lang: 'zh' },
  { offset: 7, cry: 'เอ้กอีเอ้กเอ้ก', lang: 'th' },
  { offset: 5.5, cry: 'கொக்கரக்கோ', lang: 'ta' },
  { offset: 3.5, cry: 'قوقولی قوقو', lang: 'fa' },
  { offset: 3, cry: 'кукареку', lang: 'ru' },
  { offset: 2, cry: 'κικιρίκου', lang: 'el' },
  { offset: 1, cry: 'kikeriki', lang: 'de' },
  { offset: 0, cry: 'gaggalagó', lang: 'is' },
  { offset: -3, cry: 'cocoricó', lang: 'pt' },
  { offset: -5, cry: 'quiquiriquí', lang: 'es' },
  { offset: -8, cry: 'cock-a-doodle-doo', lang: 'en' },
  { offset: -10 },
].map(Object.freeze));

export const PACE = 0.9;        // seconds for a cry to reach the next yard
// How readily a yard takes up a cry it hears, by its own hour.
export const WILLING = Object.freeze({ dawn: 1, stirring: 1, day: 0.45, night: 0.15 });

// The hour in a yard, 0–24, at a moment given in milliseconds since 1970.
export const hour = (yard, ms) => (((ms / 3600000 + yard.offset) % 24) + 24) % 24;
export const mood = h => (h >= 5 && h < 7 ? 'dawn' : h >= 3 && h < 5 ? 'stirring' : h >= 7 && h < 19 ? 'day' : 'night');
export const clock = h => `${String(Math.floor(h)).padStart(2, '0')}:${String(Math.floor(h % 1 * 60)).padStart(2, '0')}`;
export const west = index => (index + 1) % YARDS.length;

// The yard whose hour is nearest to a visitor's own. Open water is not offered.
export function nearest(offset) {
  let best = -1, gap = Infinity;
  YARDS.forEach((yard, index) => {
    if (!yard.cry) return;
    const d = Math.abs(((yard.offset - offset + 36) % 24) - 12);
    if (d < gap) { gap = d; best = index; }
  });
  return best;
}

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

export function ring(seed = 7) {
  if (!Number.isInteger(seed)) throw new TypeError('seed must be an integer');
  return { random: generator(seed), time: 0, cries: [], next: 2 };
}

// A yard crows, whoever asked. Open water cannot.
export function crow(state, index, mine = false) {
  if (!YARDS[index]?.cry) return false;
  state.cries.push({ at: index, due: state.time + PACE, from: index, mine });
  return true;
}

// Time passes. `ms` is the real moment. Returns what happened, in order:
//   { type: 'crow', index, mine }   a yard cried
//   { type: 'sea', index }          a cry went out over water and was not answered
//   { type: 'quiet', index }        a yard heard and did not take it up
//   { type: 'home', index }         a cry came all the way round to where it began
export function pass(state, seconds, ms) {
  if (!Number.isFinite(seconds) || seconds <= 0) return [];
  state.time += Math.min(seconds, 0.5);
  const events = [];
  // Where it is dawn, nobody has to ask.
  if (state.time >= state.next) {
    state.next = state.time + 5 + state.random() * 5;
    const dawn = YARDS.map((yard, index) => (yard.cry && mood(hour(yard, ms)) === 'dawn' ? index : -1)).filter(i => i >= 0);
    if (dawn.length) { const index = dawn[Math.floor(state.random() * dawn.length)]; crow(state, index); events.push({ type: 'crow', index, mine: false }); }
  }
  const going = [];
  for (const cry of state.cries) {
    if (cry.due > state.time) { going.push(cry); continue; }
    const index = west(cry.at), yard = YARDS[index];
    if (index === cry.from) { events.push({ type: 'home', index, mine: cry.mine }); continue; }
    if (!yard.cry) { events.push({ type: 'sea', index }); continue; }
    if (state.random() >= WILLING[mood(hour(yard, ms))]) { events.push({ type: 'quiet', index }); continue; }
    events.push({ type: 'crow', index, mine: cry.mine });
    going.push({ ...cry, at: index, due: state.time + PACE });
  }
  state.cries = going;
  return events;
}
