// The shape and state of one feather. No drawing happens here.
//
// Lengths are in feather-widths: x runs 0–1 across, y runs 0–RATIO from the
// tip down to the bare end. Every segment of every barb has an `order` from
// 0 (ruffled) to 1 (combed). Reaching LOCK snaps a segment to 1.

export const RATIO = 3.3;
export const EYE = Object.freeze({ x: 0.5, y: 0.6 });
export const SHAFT_TOP = 0.44;
export const VANE_END = 2.42;
export const QUILL_END = 3.2;
export const LOCK = 0.8;
export const PASS_GAIN = 0.55;     // order gained when a comb passes fully over a point
export const TOUCH_GAIN = 0.12;    // order gained by a touch that does not move sideways
export const FADE = 0.06;          // order lost per second by a segment that never locked

// Rings of the eye, from the centre outward, then the loose barbs beyond it.
// Each names a lattice in optics.mjs. The feather decides these, not the visitor.
export const ZONES = Object.freeze([
  Object.freeze({ name: 'blue', spacing: 140, periods: 10, reach: 0.1 }),
  Object.freeze({ name: 'green', spacing: 150, periods: 10, reach: 0.182 }),
  Object.freeze({ name: 'brown', spacing: 185, periods: 4, reach: 0.282 }),
  Object.freeze({ name: 'yellow', spacing: 165, periods: 6, reach: 0.335 }),
  Object.freeze({ name: 'green', spacing: 150, periods: 10, reach: Infinity }),
  Object.freeze({ name: 'yellow', spacing: 165, periods: 6, reach: Infinity }),
]);
const EYE_ZONES = 4;

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

const smooth = t => { const v = Math.min(1, Math.max(0, t)); return v * v * (3 - 2 * v); };
const radians = degrees => degrees * Math.PI / 180;

function zoneAt(x, y, along, random) {
  // The rings have soft edges: neighbouring barbules do not all change at once.
  const distance = Math.hypot((x - EYE.x) / 0.94, (y - EYE.y) / 1.06) + (random() - 0.5) * 0.02;
  for (let zone = 0; zone < EYE_ZONES; zone++) if (distance < ZONES[zone].reach) return zone;
  // Beyond the eye the loose barbs are green, with yellow toward their ends.
  return along > 0.8 + random() * 0.12 ? 5 : 4;
}

// Build a ruffled feather. The same seed always gives the same feather.
export function grow(seed = 7) {
  if (!Number.isInteger(seed)) throw new TypeError('seed must be an integer');
  const random = generator(seed);
  const attachments = [];
  for (let y = SHAFT_TOP; y < 1.24; y += 0.0135) attachments.push(y);
  for (let y = 1.24, gap = 0.02; y < VANE_END; y += gap, gap = Math.min(0.062, gap * 1.07)) attachments.push(y);

  const barbs = [];
  const px = [], py = [], tx = [], ty = [];
  const zone = [], width = [], grain = [];
  let clump = 0;
  for (const side of [-1, 1]) {
    const first = barbs.length;
    for (let n = 0; n < attachments.length; n++) {
      const at = attachments[n];
      const t = (at - SHAFT_TOP) / (VANE_END - SHAFT_TOP);
      const dense = at < 1.24;
      const lean = 5 + 61 * smooth(t / 0.3) + (dense ? 0 : 4);
      const curl = dense ? 16 + 10 * smooth(t / 0.3) : 30;
      const length = dense
        ? 0.4 + 0.2 * smooth(t / 0.24)
        : 0.56 - 0.36 * smooth((at - 1.24) / (VANE_END - 1.24));
      const count = Math.max(6, Math.round(length / 0.03));
      const step = length / count;
      // Neighbouring barbs ruffle together, in clumps, each with its own small difference.
      if (n % 5 === 0) clump = (random() * 2 - 1) * 0.085;
      const sway = clump + (random() * 2 - 1) * 0.02;
      const phase = random() * 6.283;
      const shrink = 0.05 + random() * 0.13;
      const start = px.length, segment = zone.length;
      let x = 0.5 + side * 0.003, y = at;
      for (let k = 0; k <= count; k++) {
        const along = k / count;
        const angle = radians(lean - curl * along ** 1.2);
        const ux = side * Math.sin(angle), uy = -Math.cos(angle);
        if (k > 0) { x += ux * step; y += uy * step; }
        px.push(x); py.push(y);
        const reach = along ** 1.15 * (1 + 0.45 * Math.sin(phase + 5 * along));
        tx.push(-uy * sway * reach - ux * shrink * length * along);
        ty.push(ux * sway * reach - uy * shrink * length * along);
        if (k < count) {
          zone.push(zoneAt(x + ux * step / 2, y + uy * step / 2, along, random)); width.push(0);
          // Even combed, some patches lean a little more than others: one step short of full order.
          grain.push(random() < 0.3 ? 1 : 0);
        }
      }
      barbs.push({ side, at, start, segment, count });
    }
    // A combed segment is as wide as the distance to the next barb, so combed barbs close up.
    for (let b = first; b < barbs.length; b++) {
      const barb = barbs[b];
      const next = barbs[b + 1 < barbs.length ? b + 1 : b - 1];
      for (let k = 0; k < barb.count; k++) {
        const j = Math.min(next.count, Math.round((k + 0.5) / barb.count * next.count));
        const gap = Math.hypot(
          (px[barb.start + k] + px[barb.start + k + 1]) / 2 - px[next.start + j],
          (py[barb.start + k] + py[barb.start + k + 1]) / 2 - py[next.start + j]);
        width[barb.segment + k] = Math.min(0.0105, Math.max(0.0035, gap * 0.92));
      }
    }
  }
  return {
    seed, barbs,
    px: Float32Array.from(px), py: Float32Array.from(py),
    tx: Float32Array.from(tx), ty: Float32Array.from(ty),
    zone: Uint8Array.from(zone), width: Float32Array.from(width), grain: Uint8Array.from(grain),
    order: new Float32Array(zone.length), shake: new Float32Array(zone.length),
    random,
  };
}

function near(plume, x, y, radius, visit) {
  const r2 = radius * radius;
  for (const barb of plume.barbs) {
    for (let k = 0; k < barb.count; k++) {
      const p = barb.start + k;
      const dx = (plume.px[p] + plume.px[p + 1]) / 2 - x;
      const dy = (plume.py[p] + plume.py[p + 1]) / 2 - y;
      const d2 = dx * dx + dy * dy;
      if (d2 < r2) visit(barb.segment + k, (1 - d2 / r2) ** 2);
    }
  }
}

function raise(plume, segment, amount) {
  if (plume.order[segment] >= 1) return 0;
  const value = plume.order[segment] + amount;
  if (value < LOCK) { plume.order[segment] = value; return 0; }
  plume.order[segment] = 1; plume.shake[segment] = 1;
  return 1;
}

const finite = (...values) => values.every(Number.isFinite);

// A comb at (x, y) moves sideways by `travel`. Only sideways travel combs.
// Returns how many segments snapped into order.
export function comb(plume, x, y, travel, radius) {
  if (!finite(x, y, travel, radius) || radius <= 0) return 0;
  const amount = PASS_GAIN * Math.min(1, Math.abs(travel) / (2 * radius)) * 2;
  if (amount === 0) return 0;
  let snapped = 0;
  near(plume, x, y, radius, (segment, weight) => { snapped += raise(plume, segment, amount * weight); });
  return snapped;
}

// A touch that goes nowhere leaves a little order behind, which fades.
export function touch(plume, x, y, radius) {
  if (!finite(x, y, radius) || radius <= 0) return 0;
  let changed = 0;
  near(plume, x, y, radius, (segment, weight) => {
    if (plume.order[segment] < 0.3) { plume.order[segment] = Math.min(0.3, plume.order[segment] + TOUCH_GAIN * weight); changed++; }
  });
  return changed;
}

// One pass of a comb across the whole width at height y.
export function combAcross(plume, y, radius) {
  let snapped = 0;
  for (let x = 0; x <= 1; x += radius / 2) snapped += comb(plume, x, y, radius / 2, radius);
  return snapped;
}

// Time passes. Order that never locked fades. Returns true if anything changed.
export function settle(plume, seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return false;
  let changed = false;
  const loss = FADE * Math.min(seconds, 5);
  for (let i = 0; i < plume.order.length; i++) {
    const value = plume.order[i];
    if (value > 0 && value < 1) { plume.order[i] = Math.max(0, value - loss); changed = true; }
  }
  return changed;
}

// Left alone, a feather ruffles: the outer part of one barb comes loose.
export function loosen(plume) {
  const barb = plume.barbs[Math.floor(plume.random() * plume.barbs.length)];
  const from = Math.floor(plume.random() * barb.count);
  let changed = false;
  for (let k = from; k < barb.count; k++) {
    if (plume.order[barb.segment + k] >= 1) { plume.order[barb.segment + k] = LOCK - 0.02; changed = true; }
  }
  return changed;
}

export function ruffle(plume) { plume.order.fill(0); plume.shake.fill(0); }

// How much is combed: shares, 0–1, of the eye and of the whole feather.
export function census(plume) {
  let eye = 0, eyeCombed = 0, combed = 0;
  for (let i = 0; i < plume.order.length; i++) {
    const done = plume.order[i] >= 1;
    if (done) combed++;
    if (plume.zone[i] < EYE_ZONES) { eye++; if (done) eyeCombed++; }
  }
  return { eye: eyeCombed / eye, whole: combed / plume.order.length };
}
