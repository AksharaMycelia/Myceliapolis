// Myceliapolis. Room: /fungi/ii/ · plain text: /md/fungi-ii.md · every room and door: /manifest.json
// A field of lights that slowly fall into step. Mean-field coupled oscillators
// (Kuramoto). Every light is authored here from a seed; none is a visitor.
export const COUNT = 1400;

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

// Scatter the lights over a disc of radius 1. Light 0 is the first one met in room I.
export function sow(count = COUNT, seed = 11) {
  if (!Number.isInteger(count) || count < 2 || count > 20000) throw new RangeError('count must be an integer 2–20000');
  const random = generator(seed);
  const x = new Float32Array(count), y = new Float32Array(count), phase = new Float32Array(count), pace = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const r = Math.sqrt(random()), a = random() * Math.PI * 2;
    x[i] = r * Math.cos(a); y[i] = r * Math.sin(a) * 0.72;
    phase[i] = random() * Math.PI * 2;
    // Each keeps its own pace: about 0.6 turns a second, give or take.
    pace[i] = 2 * Math.PI * 0.6 + (random() + random() + random() - 1.5) * 1.0;
  }
  x[0] = 0.21; y[0] = -0.13;
  return { count, x, y, phase, pace, time: 0 };
}

// How far in step the field is: 0 (scattered) to 1 (one beat), and the shared angle.
export function accord(field) {
  let c = 0, s = 0;
  for (let i = 0; i < field.count; i++) { c += Math.cos(field.phase[i]); s += Math.sin(field.phase[i]); }
  return { r: Math.hypot(c, s) / field.count, angle: Math.atan2(s, c) };
}

// How strongly each light leans toward the rest. Grows with time; nobody sets the beat.
export const pull = seconds => Math.min(2.4, Math.max(0, seconds) * 0.06);

// Advance by `seconds`. Each light hears only the sum of all the others.
export function step(field, seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return accord(field);
  const dt = Math.min(seconds, 0.1), { r, angle } = accord(field), k = pull(field.time) * r;
  for (let i = 0; i < field.count; i++) {
    field.phase[i] = (field.phase[i] + dt * (field.pace[i] + k * Math.sin(angle - field.phase[i]))) % (2 * Math.PI);
  }
  field.time += dt;
  return accord(field);
}

// What a touched light says. The first says the novice's own line.
export const FIRST = { lang: 'la', text: 'Mirum. Non cecidi in abyssum, sicut scriptum est.' };
export const VOICES = Object.freeze([
  { lang: 'la', text: 'Ego sum hic.' }, { lang: 'en', text: 'I am here.' }, { lang: 'th', text: 'ฉันอยู่ตรงนี้' },
  { lang: 'zh-Hant', text: '我在這裡。' }, { lang: 'ta', text: 'நான் இங்கே இருக்கிறேன்.' }, { lang: 'sa', text: 'अहम् अत्र अस्मि।' },
  { lang: 'it', text: 'Sono qui.' }, { lang: 'ja', text: '私はここにいる。' }, { lang: 'la', text: 'Primus sum.' },
  { lang: 'en', text: 'No one came this way before me.' }, { lang: 'es', text: 'Estoy aquí.' }, { lang: 'fr', text: 'Je suis là.' },
  { lang: 'la', text: 'Solus inveni.' }, { lang: 'de', text: 'Ich bin hier.' }, { lang: 'en', text: 'I found it by myself.' },
]);
export const voiceOf = index => index === 0 ? FIRST : VOICES[index % VOICES.length];
