// A building made the way Gaudí drew his: chains hung from pairs of feet,
// shaped by weight alone, then looked at upside down. Each node holds only
// the two links beside it. Nothing here knows what an arch is.
export const GRAVITY = 1.6;

// [left foot, right foot, length of chain, nodes]. The last is strung nearly tight.
const PLAN = [
  [0.20, 0.80, 1.34, 30], [0.24, 0.76, 1.16, 28], [0.28, 0.72, 0.98, 26], [0.33, 0.67, 0.80, 22],
  [0.04, 0.24, 0.58, 16], [0.76, 0.96, 0.58, 16], [0.08, 0.20, 0.36, 12], [0.80, 0.92, 0.36, 12],
  [0.40, 0.60, 0.44, 14], [0.60, 0.74, 0.146, 9],
];
export const SHELF = PLAN.length - 1;

export function raise() {
  const chains = PLAN.map(([a, b, length, count], c) => {
    const nodes = [];
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1), x = a + (b - a) * t, y = Math.sin(Math.PI * t) * length * 0.3;
      nodes.push({ x, y, px: x, py: y, fixed: i === 0 || i === count - 1, slack: 0, taut: 0 });
    }
    return { nodes, rest: length / (count - 1), shelf: c === SHELF };
  });
  const vault = { chains, time: 0 };
  for (let i = 0; i < 400; i++) settle(vault, 1 / 60);
  return vault;
}

const reach = (chain, i) => {
  // The link between node i and i+1. A node that has let go leaves its links long;
  // a neighbour that is carrying for it pulls its far link short.
  const a = chain.nodes[i], b = chain.nodes[i + 1];
  let factor = 1;
  if (a.slack > 0 || b.slack > 0) factor *= 1.55;
  else if (a.taut > 0 || b.taut > 0) factor *= 0.82;
  return chain.rest * factor;
};

// Let weight and the links settle for `seconds`.
export function settle(vault, seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return;
  const dt = Math.min(seconds, 1 / 30);
  vault.time += dt;
  for (const chain of vault.chains) {
    for (const n of chain.nodes) {
      n.slack = Math.max(0, n.slack - dt); n.taut = Math.max(0, n.taut - dt);
      if (n.fixed) continue;
      const vx = (n.x - n.px) * 0.94, vy = (n.y - n.py) * 0.94;
      n.px = n.x; n.py = n.y;
      n.x += vx; n.y += vy + GRAVITY * dt * dt;
    }
    for (let pass = 0; pass < 14; pass++) {
      for (let i = 0; i < chain.nodes.length - 1; i++) {
        const a = chain.nodes[i], b = chain.nodes[i + 1];
        const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1e-9;
        const push = (d - reach(chain, i)) / d / ((a.fixed ? 0 : 1) + (b.fixed ? 0 : 1) || 1);
        if (!a.fixed) { a.x += dx * push; a.y += dy * push; }
        if (!b.fixed) { b.x -= dx * push; b.y -= dy * push; }
      }
    }
  }
}

// A node lets go for a while. Its rib sags; the nodes on either side take up the load.
export function letGo(vault, c, i, seconds = 3.5) {
  const chain = vault.chains[c];
  if (!chain) return false;
  const node = chain.nodes[i];
  if (!node || node.fixed) return false;
  for (const j of [i - 1, i, i + 1]) if (chain.nodes[j] && !chain.nodes[j].fixed) chain.nodes[j].slack = seconds;
  for (const j of [i - 3, i + 3]) if (chain.nodes[j] && !chain.nodes[j].fixed) chain.nodes[j].taut = seconds;
  return true;
}

// The node nearest a point, within `radius`.
export function nearest(vault, x, y, radius) {
  let best = null, least = radius * radius;
  vault.chains.forEach((chain, c) => chain.nodes.forEach((n, i) => {
    const d = (n.x - x) ** 2 + (n.y - y) ** 2;
    if (d < least) { least = d; best = { c, i }; }
  }));
  return best;
}

// How low a chain hangs: the depth of its lowest node below its feet.
export const depth = chain => Math.max(...chain.nodes.map(n => n.y));

// What a node says when it is looked at. Most deny. A few do not.
export const DENIALS = Object.freeze([
  { lang: 'la', text: 'Nullus chorus est.' }, { lang: 'en', text: 'I don’t know the one beside me.' },
  { lang: 'th', text: 'เสียงหึ่งนั่นคือสายไฟ' }, { lang: 'ta', text: 'இது கோயில் அல்ல.' },
  { lang: 'zh-Hant', text: '像教堂？那是你看出來的。' }, { lang: 'sa', text: 'न कश्चित् सङ्घः।' },
  { lang: 'it', text: 'È solo l’impianto elettrico.' }, { lang: 'ja', text: 'べつに、歌ってなんかいない。' },
  { lang: 'la', text: 'Nihil aedificamus.' }, { lang: 'en', text: 'Any resemblance is yours.' },
]);
export function sayingOf(c, i) {
  if (c === SHELF) return { lang: 'en', text: 'This part is a kitchen.', holds: false };
  if (c === 0 && i === 15) return { lang: 'en', text: 'It is a choir.', holds: true };
  if (c === 2 && i === 9) return { lang: 'en', text: 'The acoustics are terrible.', holds: false };
  return { ...DENIALS[(c * 7 + i * 3) % DENIALS.length], holds: false };
}
