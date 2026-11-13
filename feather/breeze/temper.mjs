// Invented habits, shared measured colours. Memory lasts only in this object.
import { grow, RATIO } from '../plume.mjs';

const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
export function wake(seed = 7) {
  const plume = grow(seed), n = plume.order.length;
  const x = new Float32Array(n), y = new Float32Array(n);
  for (const b of plume.barbs) for (let k = 0; k < b.count; k++) {
    const s = b.segment + k, p = b.start + k;
    x[s] = (plume.px[p] + plume.px[p + 1]) / 2;
    y[s] = (plume.py[p] + plume.py[p + 1]) / 2;
  }
  const bands = 36;
  const band = Uint8Array.from(y, v => Math.min(bands - 1, Math.floor(Math.max(0, v) / 2.5 * bands)));
  const phase = Float64Array.from({ length: bands }, (_, i) => i * 0.65 + Math.sin(i * 0.4));
  const cadence = new Float64Array(bands).fill(0.8);
  for (let s = 0; s < n; s++) plume.order[s] = 0.06 + 0.48 * Math.max(0, Math.sin(phase[band[s]])) ** 8;
  return { plume, x, y, band, phase, cadence, signal: new Float64Array(bands), familiarity: new Float32Array(n), echo: new Float32Array(n),
    curl: new Float32Array(n), time: 0, lastStroke: -10, lastInput: -10, lastDirection: 0, period: 0.8,
    gusts: 0, rolls: 0, angle: 0, targetAngle: 0, nextGust: 9, nextRoll: 32 };
}

// A full keyboard pass and a pointer sample use the same weighted response.
// Pointer gain is proportional to distance, not the number of delivered events.
export function brush(room, x, y, travel, radius, across = false) {
  if (![x, y, travel, radius].every(Number.isFinite) || radius <= 0 || !travel) return false;
  const amount = Math.min(1, Math.abs(travel) / (2 * radius));
  const gap = room.time - room.lastStroke;
  // Count reversals or separated passes, not pointer sample frequency.
  const direction = Math.sign(travel);
  const newStroke = across || direction !== room.lastDirection || room.time - room.lastInput > 0.16;
  if (newStroke && gap >= 0.12) {
    if (room.lastStroke >= 0) room.period = clamp(gap, 0.18, 1.8);
    room.lastStroke = room.time;
  }
  room.lastDirection = direction; room.lastInput = room.time;
  let hit = false;
  for (let s = 0; s < room.y.length; s++) {
    const dy = room.y[s] - y;
    const d2 = dy * dy + (across ? 0 : (room.x[s] - x) ** 2);
    if (d2 < radius * radius) {
      const weight = (1 - d2 / (radius * radius)) ** 2;
      room.plume.order[s] = clamp(room.plume.order[s] + amount * weight * (0.48 + room.familiarity[s] * 0.55));
      room.familiarity[s] = clamp(room.familiarity[s] + amount * weight * 0.2);
      hit = true;
    }
    // A nearby band answers, rather than moving the whole feather at once.
    if (Math.abs(dy) < radius * 2.5) {
      const weight = 1 - Math.abs(dy) / (radius * 2.5);
      room.echo[s] = clamp(room.echo[s] + amount * weight * 0.55);
      room.curl[s] = clamp(room.curl[s] + Math.sign(travel) * amount * weight * 0.12, -1, 1);
    }
  }
  if (hit) for (let b = 0; b < room.signal.length; b++) {
    const weight = Math.max(0, 1 - Math.abs((b + 0.5) * 2.5 / room.signal.length - y) / (radius * 2));
    room.signal[b] = clamp(room.signal[b] + amount * weight * 0.5);
    if (weight > 0) room.cadence[b] += weight * amount * (room.period - room.cadence[b]);
  }
  return hit;
}

export function breeze(room) {
  const middle = 0.45 + (room.gusts * 0.47) % 1.5;
  room.gusts++;
  for (let s = 0; s < room.y.length; s++) {
    const weight = Math.max(0, 1 - Math.abs(room.y[s] - middle) / 0.7);
    // One side aligns; the other loosens. Even an untouched feather shows colour.
    const direction = (room.x[s] < 0.5) === (room.gusts % 2 === 1) ? 1 : -1;
    room.plume.order[s] = clamp(room.plume.order[s] + direction * weight * 0.7);
    room.echo[s] = Math.max(room.echo[s], weight * 0.6);
    room.curl[s] = clamp(room.curl[s] + direction * weight * 0.3, -1, 1);
  }
}

export function roll(room, instant = false) {
  room.rolls++;
  room.targetAngle = room.rolls % 2 ? -0.075 : 0.065;
  if (instant) room.angle = room.targetAngle;
  for (let s = 0; s < room.y.length; s++) room.echo[s] = Math.max(room.echo[s], 0.4);
}

// Call only while visible and awake. Bounded dt prevents catch-up after sleep.
export function advance(room, seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return [];
  const dt = Math.min(seconds, 0.1), events = [];
  room.time += dt;
  const signal = room.signal.slice(), phase = room.phase.slice(), cadence = room.cadence.slice();
  for (let b = 0; b < signal.length; b++) {
    const prev = (b + signal.length - 1) % signal.length, next = (b + 1) % signal.length;
    room.signal[b] = clamp(signal[b] + dt * (1.8 * (signal[prev] - signal[b]) - 0.22 * signal[b]));
    room.cadence[b] = clamp(cadence[b] + dt * (1.8 * signal[prev] * (cadence[prev] - cadence[b]) + 0.015 * (0.8 - cadence[b])), 0.18, 1.8);
    room.phase[b] = (phase[b] + dt * (0.3 + 0.12 * Math.sin(phase[prev] - phase[b]) + 0.07 * Math.sin(phase[next] - phase[b]))) % (2 * Math.PI);
  }
  room.angle += (room.targetAngle - room.angle) * (1 - Math.exp(-dt * 3));
  for (let s = 0; s < room.y.length; s++) {
    room.familiarity[s] *= Math.exp(-dt / 80);
    room.echo[s] *= Math.exp(-dt / 2.2);
    room.curl[s] *= Math.exp(-dt / 9);
    const b = room.band[s];
    const ambient = 0.06 + 0.48 * Math.max(0, Math.sin(room.phase[b])) ** 8;
    room.plume.order[s] = clamp(room.plume.order[s] + dt * (0.08 * (ambient - room.plume.order[s]) + 0.14 * room.signal[b]));
  }
  if (room.time >= room.nextGust) { breeze(room); room.nextGust += 11; events.push('breeze'); }
  if (room.time >= room.nextRoll) { roll(room); room.nextRoll += 37; events.push('roll'); }
  return events;
}

// Renderer and pointer input are exact inverses, including the persistent tilt.
export function toFeather(x, y, angle) {
  const dx = x - 0.5, dy = y - RATIO / 2, c = Math.cos(angle), s = Math.sin(angle);
  return { x: 0.5 + dx * c + dy * s, y: RATIO / 2 - dx * s + dy * c };
}

export function restart(room) {
  const fresh = wake(room.plume.seed);
  Object.assign(room, fresh);
}
