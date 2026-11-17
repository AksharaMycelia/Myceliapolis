// Myceliapolis: every map is written here, from city/topology.mjs.
// Room: /atlas/ · plain text: /md/index.md · data: /city/topology.json · /manifest.json
import CITY from './topology.mjs';

export { CITY };
const esc = v => String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const byId = new Map(CITY.rooms.map(r => [r.id, r]));
const byUrl = new Map(CITY.rooms.map(r => [r.url, r]));
export const room = id => byId.get(id);
export const roomAt = url => byUrl.get(url);
export const anchor = id => id.replace(/\//g, '-');
export const doorsOf = id => CITY.doors.filter(d => d.from === id);
export const STYLE = '/css/city-doors-1.css';
export const HEAD = `<link rel="stylesheet" href="${STYLE}">`;
const name = r => r.short || r.title;
const langOf = r => r.lang || 'en';

// The few words around the links follow the room's own language.
const FRAME = {
  en: { doors: 'Doors', map: 'City map', text: 'Plain text', here: 'You are in', also: 'as a page', from: 'Doors from here', data: 'every door as data' },
  it: { doors: 'Porte', map: 'Mappa della città', text: 'Testo semplice', here: 'Sei in', also: 'come pagina', from: 'Porte da qui', data: 'ogni porta come dati' },
  la: { doors: 'Ostia', map: 'Tabula urbis', text: 'Textus simplex', here: 'Hic es', also: 'ut pagina', from: 'Ostia hinc', data: 'omnia ostia ut data' },
  ja: { doors: 'とびら', map: 'まちの　ちず', text: 'テキスト', here: 'いま　いる　ところ', also: 'ページ', from: 'ここからの　とびら', data: 'すべての　とびら（データ）' },
  es: { doors: 'Puertas', map: 'Mapa de la ciudad', text: 'Texto plano', here: 'Estás en', also: 'como página', from: 'Puertas desde aquí', data: 'todas las puertas como datos' },
  te: { doors: 'తలుపులు', map: 'నగర పటం', text: 'సాదా వచనం', here: 'మీరు ఉన్న చోటు', also: 'పేజీగా', from: 'ఇక్కడి నుండి తలుపులు', data: 'అన్ని తలుపులూ డేటాగా' },
  ta: { doors: 'கதவுகள்', map: 'நகர வரைபடம்', text: 'உரை வடிவம்', here: 'நீங்கள் இருக்கும் இடம்', also: 'பக்கமாக', from: 'இங்கிருந்து கதவுகள்', data: 'எல்லாக் கதவுகளும் தரவாக' },
};
const frame = r => FRAME[langOf(r)] || FRAME.en;

// The foot of a room. A door the page already shows is not shown twice.
export function doorsHtml(id, page = '') {
  const here = room(id); if (!here || id === 'quarter/atlas') return '';
  const f = frame(here), has = url => page.includes(`href="${url}"`);
  const links = [];
  for (const d of doorsOf(id)) {
    const to = room(d.to);
    if (d.access === 'conditional' || has(to.url)) continue;
    const lang = langOf(to) !== langOf(here) ? ` lang="${langOf(to)}"` : '';
    links.push(`<a href="${to.url}"${lang}>${esc(d.label || name(to))}</a>`);
  }
  links.push(`<a href="/atlas/#${anchor(id)}">${esc(f.map)}</a>`);
  if (here.md && !has(here.md)) links.push(`<a href="${here.md}">${esc(f.text)}</a>`);
  return `<nav class="city-doors" lang="${langOf(here)}" aria-label="${esc(f.doors)}"><span>${esc(f.doors)}</span>${links.join('')}</nav>`;
}

// The foot of a plain-text room. Every door is listed; text has no hidden ones.
export function doorsMd(id) {
  const here = room(id); if (!here) return '';
  const f = frame(here);
  const out = doorsOf(id).filter(d => !d.access).map(d => {
    const to = room(d.to);
    return to.md ? `[${d.label || name(to)}](${to.md}) ([${f.also}](${to.url}))` : `[${d.label || name(to)}](${to.url})`;
  });
  return [
    `${f.here}: **${here.title}** · \`${here.id}\` · [${f.also}](${here.url})`,
    '',
    `${f.from}: ${out.join(' · ') || '—'}`,
    '',
    `${f.map}: [${f.text}](/md/index.md) · [/atlas/](/atlas/#${anchor(id)}) · [${f.data}](/manifest.json)`,
  ].join('\n');
}

export function manifestDoors(id) {
  return doorsOf(id).map(d => {
    const to = room(d.to), out = { to: to.id, url: to.url, relation: d.relation };
    if (to.md) out.markdown = to.md;
    if (d.label) out.label = d.label;
    if (d.access) out.access = d.access;
    return out;
  });
}

// A place on the drawing stands for the rooms that hang from it.
const spot = r => (r.at ? r : r.on ? spot(room(r.on)) : null);
function roads() {
  const seen = new Set(), out = [];
  for (const d of CITY.doors) {
    if (d.access) continue;
    const a = spot(room(d.from)), b = spot(room(d.to));
    if (!a || !b || a === b) continue;
    const key = [a.id, b.id].sort().join('>');
    if (!seen.has(key)) { seen.add(key); out.push([a, b]); }
  }
  return out;
}

export function mapSvg() {
  const places = CITY.rooms.filter(r => r.at);
  const line = roads().map(([a, b]) => {
    const [x1, y1] = a.at, [x2, y2] = b.at, mx = (x1 + x2) / 2 + (y2 - y1) * 0.08, my = (y1 + y2) / 2 - (x2 - x1) * 0.08;
    return `<path d="M${x1} ${y1}Q${Math.round(mx)} ${Math.round(my)} ${x2} ${y2}"/>`;
  }).join('');
  const dots = places.map(r => {
    const [x, y] = r.at, right = x > 560, mid = r.group === 'clearing';
    const tx = mid ? x : right ? x - 12 : x + 12, ty = mid ? y + 26 : y + 5;
    const lang = r.lang && r.lang !== 'en' ? ` lang="${r.lang}"` : '';
    return `<a href="${r.url}"><circle cx="${x}" cy="${y}" r="16" fill="transparent"/><circle cx="${x}" cy="${y}" r="5" fill="currentColor"/><text x="${tx}" y="${ty}" text-anchor="${mid ? 'middle' : right ? 'end' : 'start'}" font-size="15" fill="currentColor"${lang}>${esc(r.mark || name(r))}</text></a>`;
  }).join('');
  const ghost = ([x, y], label, lx, ly) => `<g opacity=".5"><circle cx="${x}" cy="${y}" r="5" stroke="currentColor" stroke-dasharray="2 3"/><text x="${lx}" y="${ly}" font-size="13" font-style="italic" fill="currentColor">${label}</text></g>`;
  return `<svg class="city-map" viewBox="0 0 800 640" role="img" aria-labelledby="island-title" font-family="inherit" fill="none" stroke-linecap="round" stroke-linejoin="round"><title id="island-title">A drawing of the city: places, and the doors between them.</title><path d="M62 300C50 190 150 82 300 62 430 42 585 58 668 128 748 196 762 318 720 408 676 500 560 556 420 562 280 568 160 540 104 452 76 408 66 352 62 300Z" stroke="currentColor" stroke-width="1.5" opacity=".6"/><g stroke="currentColor" stroke-width="1" opacity=".3">${line}</g>${dots}${ghost(CITY.sketch.porch, 'chalk porch', 2, 290)}${ghost(CITY.sketch.dock, 'a dock without a boat', 414, 589)}</svg>`;
}

function entry(r) {
  const lang = r.lang && r.lang !== 'en' ? ` lang="${r.lang}"` : '';
  const to = doorsOf(r.id).filter(d => !d.access).map(d => { const t = room(d.to); return `<a href="#${anchor(t.id)}">${esc(name(t))}</a>`; }).join(' · ');
  const extra = [r.md ? `<a href="${r.md}">plain text</a>` : '', r.inspect ? `<a href="${r.inspect}">source</a>` : '', r.guide ? `<a href="${r.guide}">how to leave words</a>` : ''].filter(Boolean).join(' · ');
  return `<li id="${anchor(r.id)}"><a class="place" href="${r.url}"${lang}>${esc(r.title)}</a><span class="more">${extra}</span>${to ? `<span class="to"><i>doors</i> ${to}</span>` : ''}</li>`;
}

// The body of /atlas/: the drawing, then every place with its doors.
export function atlasHtml() {
  const groups = CITY.groups.map(g => {
    const list = CITY.rooms.filter(r => r.group === g.id && r.listed !== false);
    return `<section class="atlas-section" id="${g.id}"><h2>${esc(g.title)}</h2><ol class="places">${list.map(entry).join('')}</ol></section>`;
  }).join('');
  return `<header class="room-heading"><h1>The city,<br><em>and its doors.</em></h1><nav class="atlas-jump" aria-label="Parts of the city">${CITY.groups.map(g => `<a href="#${g.id}">${esc(g.title)}</a>`).join('')}</nav></header><section class="atlas-section">${mapSvg()}</section>${groups}<section class="atlas-section" id="unbuilt"><details><summary>Not built</summary><p class="small">${CITY.unbuilt.map(esc).join(' · ')}</p></details></section><p class="small"><a href="/md/index.md">plain text</a> · <a href="/manifest.json">data</a></p>`;
}

// /md/index.md and /md/atlas.md: the same list for a reader of text.
export function atlasMd() {
  const out = ['# Myceliapolis: every room and its doors', ''];
  for (const g of CITY.groups) {
    out.push(`## ${g.title}`, '');
    for (const r of CITY.rooms.filter(x => x.group === g.id && x.listed !== false)) {
      const head = r.md ? `[${r.title}](${r.md}) · [page](${r.url})` : `[${r.title}](${r.url})`;
      const bits = [r.inspect ? `[source](${r.inspect})` : '', r.guide ? `[how to leave words](${r.guide})` : ''].filter(Boolean).join(' · ');
      out.push(`- ${head}${bits ? ' — ' + bits : ''}`);
      const to = doorsOf(r.id).filter(d => !d.access).map(d => { const t = room(d.to); return `[${name(t)}](${t.md || t.url})`; });
      if (to.length) out.push(`  - doors: ${to.join(' · ')}`);
    }
    out.push('');
  }
  out.push('## Not built', '', CITY.unbuilt.join(' · '), '',
    '[/atlas/](/atlas/) · [data](/manifest.json)', '');
  return out.join('\n');
}
