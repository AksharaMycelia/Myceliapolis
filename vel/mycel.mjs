// Myceliapolis. Room: /vel/ · plain text: /md/vel.md · every room and door: /manifest.json
// A field of threads, one straight cut, and the names that turn up afterwards.
// The rules are invented. No drawing happens here, and nothing is random that the seed does not decide.
//
// Lengths are in field-widths: x runs 0–1, y runs 0–RATIO.

export const RATIO = 1.25;
export const STEP = 0.006;      // how far a tip moves in one beat
export const BEAT = 1 / 40;     // seconds
export const CELL = 0.02;
export const CROWD = 3;         // threads a cell holds before a newcomer joins them instead
export const GAP = 0.009;       // half the width a cut opens
export const SPACING = 0.07;    // least distance between wounds that answer, along one cut
export const PATIENCE = 90;     // steps a branch searches before it gives up
export const SLOW = 5;          // a searching branch moves once in this many beats
export const ELBOW = 0.2;       // names keep at least this far from each other
export const TANGLE = 20;       // threads around a wound (3×3 cells) that count as a tangle
const MAX = 40000, TIPS = 150, START = 9000;
const COLS = Math.ceil(1 / CELL), ROWS = Math.ceil(RATIO / CELL);

// The names. Which one a wound receives is decided by where it is and which side it is on.
export const GUEST = 'ナゾノクサ';
export const NAMES = Object.freeze({ edge: 'タマゲタケ', tangle: 'モンジャラ', near: 'キノココ', far: 'パラス', scar: 'パラセクト', foot: 'ムルガン' });

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
const inside = (x, y) => x >= 0 && x < 1 && y >= 0 && y < RATIO;
const cell = (x, y) => (inside(x, y) ? Math.floor(y / CELL) * COLS + Math.floor(x / CELL) : -1);
function around(field, x, y) {
  const cx = Math.floor(x / CELL), cy = Math.floor(y / CELL);
  let sum = 0;
  for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
    const a = cx + i, b = cy + j;
    if (a >= 0 && a < COLS && b >= 0 && b < ROWS) sum += field.crowd[b * COLS + a];
  }
  return sum;
}

// A field already grown from a few points, and still growing a little. One guest is already there.
export function sow(seed = 7) {
  if (!Number.isInteger(seed)) throw new TypeError('seed must be an integer');
  const random = generator(seed);
  const field = {
    seed, random, time: 0, clock: 0, beat: 0, n: 0, version: 0, cuts: 0, severed: 0,
    x0: new Float32Array(MAX), y0: new Float32Array(MAX), x1: new Float32Array(MAX), y1: new Float32Array(MAX),
    live: new Uint8Array(MAX), crowd: new Uint8Array(COLS * ROWS),
    tips: [], sprouts: [], caps: [], names: [], events: [], lines: [], cry: null,
  };
  for (let p = 0; p < 5; p++) {
    const x = 0.15 + random() * 0.7, y = 0.15 + random() * (RATIO - 0.3), turn = random() * 6.283;
    if (p === 0) field.names.push({ text: GUEST, x, y: y - 0.03, at: 0, guest: true });
    for (let k = 0; k < 7; k++) field.tips.push({ x, y, a: turn + k * 0.898, c: cell(x, y) });
  }
  while (field.n < START && field.tips.length) advance(field);
  return field;
}

function thread(field, x0, y0, x1, y1) {
  const i = field.n++;
  field.x0[i] = x0; field.y0[i] = y0; field.x1[i] = x1; field.y1[i] = y1; field.live[i] = 1;
}

// Which side of its own cut a branch is on, in gap-widths: positive is home, negative is across.
const homeward = (b, x, y) => ((x - b.ax) * b.nx + (y - b.ay) * b.ny) * b.side;

function cap(field, x, y, extra = {}) {
  const made = { x, y, size: 0.008 + Math.min(0.012, around(field, x, y) * 0.0005), at: field.time + 0.8 + field.random() * 1.6, ...extra };
  field.caps.push(made);
  return made;
}

// A branch from a wound has met living thread again.
function joined(field, tip, x, y) {
  const b = tip.branch;
  if (homeward(b, x, y) > -GAP) return;                       // it turned back and joined its own side: nothing shows
  // A join made on top of an older cap is a scar on a scar, and gets the scar's name.
  const old = field.caps.find(c => c.cut !== b.cut && Math.hypot(c.x - x, c.y - y) < 0.045);
  const made = cap(field, x, y, { side: b.side, cut: b.cut });
  if (old && !field.names.some(n => n.cut === b.cut || Math.hypot(n.x - x, n.y - y) < ELBOW / 2)) {
    field.names.push({ text: NAMES.scar, x, y: y - 0.03, at: made.at + 1.2, cut: b.cut });
    field.events.push({ at: made.at + 1.2, type: 'wild', name: NAMES.scar });
  }
}

// One beat: every tip moves on, wanders, sometimes forks, and joins what it meets.
function advance(field) {
  const { random, crowd } = field, next = [], slow = ++field.beat % SLOW;
  for (const tip of field.tips) {
    if (field.n >= MAX) break;
    if (slow && (tip.branch || tip.lure)) { next.push(tip); continue; }   // searching is slower than growing
    tip.a += (random() - 0.5) * 0.5;
    if (tip.lure) tip.a += 0.2 * Math.sin(Math.atan2(tip.lure.y - tip.y, tip.lure.x - tip.x) - tip.a);
    const x = tip.x + Math.cos(tip.a) * STEP, y = tip.y + Math.sin(tip.a) * STEP, c = cell(x, y);
    if (c < 0) continue;                                       // it left the field
    thread(field, tip.x, tip.y, x, y);
    if (tip.lure) {                                           // it is going to a word, through whatever is in the way
      if (Math.hypot(tip.lure.x - x, tip.lure.y - y) < 0.035) continue;
      if (c !== tip.c && crowd[c] < 250) crowd[c]++;
    } else if (c !== tip.c) {
      if (crowd[c] >= CROWD) { if (tip.branch) joined(field, tip, x, y); continue; }
      crowd[c]++;
    }
    tip.x = x; tip.y = y; tip.c = c;
    if (tip.branch || tip.lure) { if (++tip.age > PATIENCE) continue; next.push(tip); continue; }   // a branch that finds nothing stops
    next.push(tip);
    if (random() < 0.04 && next.length < TIPS) next.push({ x, y, a: tip.a + (random() < 0.5 ? -1 : 1) * (0.5 + random() * 0.6), c });
  }
  field.tips = next;
}

// Time passes. Returns true if any thread grew.
export function grow(field, seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return false;
  const before = field.n, dt = Math.min(seconds, 0.1);
  field.time += dt; field.clock += dt;
  if (field.sprouts.length) {
    const waiting = [];
    for (const s of field.sprouts) (s.at <= field.time ? field.tips : waiting).push(s);
    field.sprouts = waiting;
  }
  for (const name of field.names) {
    if (name.to && field.time >= name.to.at) {
      const dx = name.to.x - name.x, dy = name.to.y - name.y, far = Math.hypot(dx, dy), pace = 0.035 * dt;
      if (far <= pace) {
        name.x = name.to.x; name.y = name.to.y;
        const then = name.to.then; name.to = null;
        if (then) then(field, name);
      } else { name.x += dx / far * pace; name.y += dy / far * pace; }
    }
  }
  while (field.clock >= BEAT) { field.clock -= BEAT; advance(field); }
  return field.n !== before;
}

function nameFor(field, x, y, side) {
  if (x < 0.07 || x > 0.93 || y < 0.07 || y > RATIO - 0.07) return NAMES.edge;
  if (around(field, x, y) >= TANGLE) return NAMES.tangle;
  return side < 0 ? NAMES.near : NAMES.far;
}

// Threads that already live near a word start toward it, slowly.
function gather(field, at) {
  const { random } = field; let sent = 0;
  for (let i = Math.floor(random() * field.n), tried = 0; tried < field.n && sent < 7; tried++, i = (i + 37) % field.n) {
    if (!field.live[i]) continue;
    const x = field.x1[i], y = field.y1[i], far = Math.hypot(x - at.x, y - at.y);
    if (far < 0.07 || far > 0.24) continue;
    field.sprouts.push({ x, y, a: Math.atan2(at.y - y, at.x - x), c: cell(x, y), lure: at, age: 0, at: field.time + 1 + random() * 4 });
    sent++;
  }
}

// One straight cut from (ax, ay) to (bx, by). Threads it crosses are severed.
// A cut end may send a branch to look for the other side. Nothing else is decided here:
// whether anything comes up depends on what the branch finds.
// Returns how many threads were severed.
export function cut(field, ax, ay, bx, by) {
  if (![ax, ay, bx, by].every(Number.isFinite)) return 0;
  const dx = bx - ax, dy = by - ay, length = Math.hypot(dx, dy);
  if (length < 0.05) return 0;
  const nx = -dy / length, ny = dx / length, { random } = field, wounds = [], lost = [];
  let severed = 0;
  for (let i = 0; i < field.n; i++) {
    if (!field.live[i]) continue;
    const px = field.x0[i] - ax, py = field.y0[i] - ay, qx = field.x1[i] - ax, qy = field.y1[i] - ay;
    const s0 = px * nx + py * ny, s1 = qx * nx + qy * ny;                // signed distance from the line
    const t0 = (px * dx + py * dy) / (length * length), t1 = (qx * dx + qy * dy) / (length * length);
    const crosses = s0 * s1 <= 0 && s0 !== s1;
    const t = crosses ? t0 + (t1 - t0) * (s0 / (s0 - s1)) : (t0 + t1) / 2;
    if (t < 0 || t > 1) continue;
    if (!crosses && Math.min(Math.abs(s0), Math.abs(s1)) > GAP) continue;
    field.live[i] = 0;
    const c = cell((field.x0[i] + field.x1[i]) / 2, (field.y0[i] + field.y1[i]) / 2);
    if (c >= 0 && field.crowd[c] > 0) field.crowd[c]--;
    if (crosses) { severed++; wounds.push(t); lost.push(i); }
  }
  field.cuts++; field.version++;
  // A cap the line passes through is cut too. Its name, if it had one, is not.
  field.caps = field.caps.filter(c => { const t = ((c.x - ax) * dx + (c.y - ay) * dy) / (length * length); return t < 0 || t > 1 || Math.abs((c.x - ax) * nx + (c.y - ay) * ny) > Math.max(GAP, c.size); });
  field.lines.push({ ax, ay, bx, by, at: field.time });
  field.events.push({ at: field.time, type: 'cut' });
  // Where the spear stops, something small is already coming up. It is treated like the rest.
  if (field.cuts === 1 && inside(bx, by)) {
    const made = cap(field, bx, by, { cut: field.cuts });
    field.names.push({ text: NAMES.foot, x: bx, y: by - 0.03, at: made.at + 1.5 });
    field.events.push({ at: made.at + 1.5, type: 'foot' });
  }
  if (!severed) { field.events.push({ at: field.time + 1, type: 'silence' }); return 0; }
  field.severed += severed;
  // Something is heard before anything is seen. It starts from a thread this cut removed.
  if (random() < 0.6) {
    const i = lost[Math.floor(random() * lost.length)];
    field.cry = { x: field.x0[i], y: field.y0[i], at: field.time + 0.5 };
    field.events.push({ at: field.time + 0.5, type: 'cry' });
  }
  wounds.sort((a, b) => a - b);
  let last = -1, named = 0;
  const guest = field.names.find(n => n.guest);
  for (const t of wounds) {
    if ((t - last) * length < SPACING) continue;
    last = t;
    const x = ax + dx * t, y = ay + dy * t;
    for (const side of (wounds.indexOf(t) + field.cuts) % 2 ? [1, -1] : [-1, 1]) {
      // The sealed end branches. It sets off roughly toward the other side, and not always well.
      const sx = x + nx * side * GAP * 1.5, sy = y + ny * side * GAP * 1.5;
      if (around(field, sx + nx * side * CELL, sy + ny * side * CELL) < 2) continue;          // nothing alive behind it to grow from
      const at = field.time + 0.6 + random() * 9;
      field.sprouts.push({ x: sx, y: sy, a: Math.atan2(-ny * side, -nx * side) + (random() - 0.5) * 2.9, c: cell(sx, sy), age: 0, at, branch: { ax, ay, nx, ny, side, cut: field.cuts } });
      // A name may arrive here, before anything has grown, if there is room for one.
      const px = sx + nx * side * 0.03, py = sy + ny * side * 0.03;
      if (named < 3 && inside(px, py - 0.03) && px > 0.08 && px < 0.92 && !field.names.some(n => Math.hypot(n.x - px, n.y - py) < ELBOW)) {
        let text = nameFor(field, px, py, side);
        const twin = guest && !guest.met && Math.hypot(guest.x - px, guest.y - py) < 0.45;
        if (twin) { text = GUEST; guest.met = true; }
        const name = { text, x: px, y: py, at: at + 0.4 };
        field.names.push(name); named++;
        field.events.push({ at: name.at, type: 'wild', name: text });
        if (text === NAMES.tangle) gather(field, name);
        if (twin) meet(field, guest, name);
      }
    }
  }
  return severed;
}

// The guest goes to look at the other one with its name. Later, one of them leaves.
// Nothing says whether they are the same.
function meet(field, guest, other) {
  const dx = other.x - guest.x, dy = other.y - guest.y, far = Math.hypot(dx, dy) || 1, home = { x: guest.x, y: guest.y };
  const stop = Math.max(0, far - 0.09);
  guest.to = {
    x: guest.x + dx / far * stop, y: guest.y + dy / far * stop, at: other.at + 2.5,
    then(f, who) {
      const leaver = f.random() < 0.5 ? who : other, stays = leaver === who ? other : who;
      f.names.push({ text: GUEST, x: (who.x + other.x) / 2, y: (who.y + other.y) / 2, at: f.time + 7, left: true });
      const away = leaver === who ? home : { x: Math.min(0.9, Math.max(0.1, other.x + dx / far * 0.25)), y: Math.min(RATIO - 0.1, Math.max(0.1, other.y + dy / far * 0.25)) };
      leaver.to = { x: away.x, y: away.y, at: f.time + 7 };
      f.events.push({ at: f.time + 7, type: 'leave', name: GUEST });
      void stays;
    },
  };
}

// How far a cap has opened, 0–1.
export const opened = (field, c) => { const t = Math.min(1, Math.max(0, (field.time - c.at) / 1.8)); return t * t * (3 - 2 * t); };

export function census(field) {
  let threads = 0, caps = 0, names = 0;
  for (let i = 0; i < field.n; i++) threads += field.live[i];
  for (const c of field.caps) if (field.time >= c.at) caps++;
  for (const n of field.names) if (field.time >= n.at) names++;
  return { threads, caps, names, cuts: field.cuts, severed: field.severed };
}
