// Myceliapolis. Room: /feather/breeze/ and /feather/first/ · plain text: /md/feather.md · every room and door: /manifest.json
// The optics of one feather.
//
// A barbule of a peacock's train holds a lattice of dark rods with gaps
// between them. This module treats that lattice as a stack of flat layers,
// works out how much of each wavelength the stack returns, and turns the
// result into a screen colour. It contains no colour values of its own.
//
// Spacings and layer counts: Zi et al., "Coloration strategies in peacock
// feathers", PNAS 100 (22), 12576–12578 (2003). doi:10.1073/pnas.2133313100
// The published crystal is two-dimensional. This is a one-dimensional
// approximation, and the two effective indices below were chosen by the
// builders so that the 140 nm lattice returns blue. See /md/feather.md.

export const ROD_INDEX = 1.85;      // melanin rods joined by keratin (effective)
export const GAP_INDEX = 1.50;      // air holes in keratin (effective)
export const ROD_SHARE = 0.55;      // share of each period taken by the rod layer
export const CORTEX_INDEX = 1.54;   // keratin beneath the lattice
export const TILT_LIMIT = 80;       // degrees; steeper barbules are ignored
export const ACCEPTANCE = 16;       // degrees; how far a barbule may lean and still face the eye
export const COMBED_SPREAD = 6;     // degrees; how much a combed patch still leans
export const RUFFLED_SPREAD = 75;   // degrees; how much a ruffled patch leans

// Measured lattices. `spacing` is the distance between rod layers, in nm,
// normal to the barbule surface. `periods` is the number of rod layers.
export const LATTICES = Object.freeze({
  blue:   Object.freeze({ spacing: 140, periods: 10 }),
  green:  Object.freeze({ spacing: 150, periods: 10 }),
  yellow: Object.freeze({ spacing: 165, periods: 6 }),
  brown:  Object.freeze({ spacing: 185, periods: 4 }),
});

const WAVELENGTHS = [];
for (let nm = 380; nm <= 740; nm += 5) WAVELENGTHS.push(nm);
export const SAMPLES = Object.freeze(WAVELENGTHS);

const clamp01 = value => Math.min(1, Math.max(0, value));

function check(spacing, periods) {
  if (!Number.isFinite(spacing) || spacing < 60 || spacing > 400) throw new RangeError('spacing must be 60–400 nm');
  if (!Number.isInteger(periods) || periods < 1 || periods > 40) throw new RangeError('periods must be an integer 1–40');
}

// Fraction of light of one wavelength returned by the lattice.
// `tilt` is the angle, in degrees, between the light and the barbule's normal.
export function reflectance(wavelength, spacing, periods, tilt = 0) {
  check(spacing, periods);
  if (!Number.isFinite(wavelength) || wavelength <= 0) throw new RangeError('wavelength must be positive');
  const sine = Math.sin(Math.min(Math.abs(tilt), 89) * Math.PI / 180);
  const layers = [[ROD_INDEX, spacing * ROD_SHARE], [GAP_INDEX, spacing * (1 - ROD_SHARE)]];
  // Characteristic matrix of the whole stack, kept as [[a, i·b], [i·c, d]].
  let a = 1, b = 0, c = 0, d = 1;
  for (let period = 0; period < periods; period++) {
    for (const [index, thickness] of layers) {
      const cosine = Math.sqrt(1 - (sine / index) ** 2);
      const phase = 2 * Math.PI * index * thickness * cosine / wavelength;
      const cos = Math.cos(phase), sin = Math.sin(phase);
      const na = a * cos - b * index * sin;
      const nb = a * sin / index + b * cos;
      const nc = c * cos + d * index * sin;
      const nd = d * cos - c * sin / index;
      a = na; b = nb; c = nc; d = nd;
    }
  }
  const realTop = a - d * CORTEX_INDEX, imagTop = b * CORTEX_INDEX - c;
  const realBottom = a + d * CORTEX_INDEX, imagBottom = b * CORTEX_INDEX + c;
  return (realTop ** 2 + imagTop ** 2) / (realBottom ** 2 + imagBottom ** 2);
}

// What the feather's own material returns with no lattice facing the eye:
// melanin in keratin, which takes most of the light and keeps a little red.
export function melanin(wavelength) {
  const t = clamp01((wavelength - 380) / 360);
  return 0.018 + 0.085 * t ** 1.6;
}

// The eye's response (CIE 1931 2° observer), in the fitted form of
// Wyman, Sloan & Shirley, JCGT 2 (2), 2013. These describe a viewer, not a paint.
const lobe = (x, centre, below, above) => Math.exp(-0.5 * ((x - centre) / (x < centre ? below : above)) ** 2);
export function observer(nm) {
  return [
    1.056 * lobe(nm, 599.8, 37.9, 31.0) + 0.362 * lobe(nm, 442.0, 16.0, 26.7) - 0.065 * lobe(nm, 501.1, 20.4, 26.2),
    0.821 * lobe(nm, 568.8, 46.9, 40.5) + 0.286 * lobe(nm, 530.9, 16.3, 31.1),
    1.217 * lobe(nm, 437.0, 11.8, 36.0) + 0.681 * lobe(nm, 459.0, 26.0, 13.8),
  ];
}

const WHITE = (() => {
  let x = 0, y = 0, z = 0;
  for (const nm of SAMPLES) { const [ox, oy, oz] = observer(nm); x += ox; y += oy; z += oz; }
  return [x, y, z];
})();

const encode = linear => {
  const v = clamp01(linear);
  return Math.round(255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055));
};

// Turn a spectrum (a function of wavelength returning 0–1) into [r, g, b], 0–255.
// A surface that returns everything comes out white.
export function toScreen(spectrum) {
  let x = 0, y = 0, z = 0;
  for (const nm of SAMPLES) {
    const amount = clamp01(spectrum(nm));
    const [ox, oy, oz] = observer(nm);
    x += amount * ox; y += amount * oy; z += amount * oz;
  }
  x = x / WHITE[0] * 0.9505; y = y / WHITE[1]; z = z / WHITE[2] * 1.089;
  let r = 3.2406 * x - 1.5372 * y - 0.4986 * z;
  let g = -0.9689 * x + 1.8758 * y + 0.0415 * z;
  let b = 0.0557 * x - 0.2040 * y + 1.0570 * z;
  // A colour outside the screen's range is pulled toward grey of the same brightness.
  const low = Math.min(r, g, b);
  if (low < 0) { const grey = clamp01(y); const k = grey / (grey - low); r = grey + (r - grey) * k; g = grey + (g - grey) * k; b = grey + (b - grey) * k; }
  return [encode(r), encode(g), encode(b)];
}

// How barbules lean, for a given order, and how much of each lean reaches the eye.
// `order` runs from 0 (barbules lying every which way) to 1 (all facing the eye).
// Leaning barbules send their light elsewhere, so a disordered patch shows
// mostly its own material. See the note on this in /md/feather.md: it is the
// part of this room that a real feather does not do.
function leaning(order) {
  // A barbule is curved like a crescent, so even a combed patch leans a little.
  const spread = COMBED_SPREAD + (1 - clamp01(order)) * (RUFFLED_SPREAD - COMBED_SPREAD);
  const weights = [];
  let total = 0;
  for (let tilt = 2; tilt <= TILT_LIMIT; tilt += 4) {
    // Barbules lean in every direction, so there are more ways to lean far than to lean a little.
    const share = tilt * Math.exp(-0.5 * (tilt / spread) ** 2);
    total += share;
    weights.push(share * Math.exp(-((tilt / ACCEPTANCE) ** 2)));
  }
  return weights.map(weight => weight / total);
}

// Reflectance of one lattice at every sampled wavelength and lean.
function survey(spacing, periods) {
  check(spacing, periods);
  return SAMPLES.map(nm => {
    const row = [];
    for (let tilt = 2; tilt <= TILT_LIMIT; tilt += 4) row.push(reflectance(nm, spacing, periods, tilt));
    return row;
  });
}

function seen(table, order) {
  const weights = leaning(order);
  return nm => {
    const row = table[Math.round((nm - SAMPLES[0]) / 5)];
    let structural = 0;
    for (let i = 0; i < weights.length; i++) structural += weights[i] * row[i];
    const body = melanin(nm);
    return body + (1 - body) * structural;
  };
}

// The spectrum a patch of barbules returns to the eye, as a function of
// wavelength. Defined at the sampled wavelengths (380–740 nm in steps of 5).
export function patch(spacing, periods, order = 1) {
  return seen(survey(spacing, periods), order);
}

// The screen colour of a patch: [r, g, b], each 0–255.
export function colourOf(spacing, periods, order = 1) {
  return toScreen(patch(spacing, periods, order));
}

// The colours of one lattice from ruffled to combed, in `steps` equal steps.
export function ladder(spacing, periods, steps = 16) {
  if (!Number.isInteger(steps) || steps < 2 || steps > 64) throw new RangeError('steps must be an integer 2–64');
  const table = survey(spacing, periods);
  return Array.from({ length: steps }, (_, i) => toScreen(seen(table, i / (steps - 1))));
}

// The wavelength, in nm, that a lattice returns most strongly when faced squarely.
export function peak(spacing, periods) {
  check(spacing, periods);
  let best = SAMPLES[0], most = -1;
  for (let nm = 380; nm <= 740; nm++) {
    const amount = reflectance(nm, spacing, periods, 0);
    if (amount > most) { most = amount; best = nm; }
  }
  return best;
}
