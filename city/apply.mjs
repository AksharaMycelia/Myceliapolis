#!/usr/bin/env node
// Writes the doors of city/topology.mjs into the checked-in rooms.
//
//   node city/apply.mjs            write into the repository root
//   node city/apply.mjs site       write into a built tree
//   node city/apply.mjs --check    change nothing; fail if anything is stale
//
// It only ever touches the marked blocks, md/index.md, city/topology.json
// and the door fields of manifest.json. Authored text is left alone.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CITY, HEAD, doorsHtml, doorsMd, manifestDoors, atlasMd, room } from './doors.mjs';

const args = process.argv.slice(2), check = args.includes('--check');
const root = join(dirname(fileURLToPath(import.meta.url)), '..', args.find(a => !a.startsWith('--')) || '.');
const stale = [];

function put(path, make) {
  const full = join(root, path);
  if (!existsSync(full)) return;
  const raw = readFileSync(full, 'utf8'), crlf = raw.includes('\r\n');
  let next = make(raw.replace(/\r\n/g, '\n'));
  if (crlf) next = next.replace(/\n/g, '\r\n');
  if (next === raw) return;
  if (check) stale.push(path); else writeFileSync(full, next);
}
function create(path, text) {
  const full = join(root, path);
  if (existsSync(full)) return put(path, () => text);
  if (check) stale.push(path); else writeFileSync(full, text);
}

const H = [/\n?<!-- city:head -->[\s\S]*?<!-- \/city:head -->/, /\n?<!-- city:doors -->[\s\S]*?<!-- \/city:doors -->/];
const M = /\n*---\n<!-- city:doors -->[\s\S]*?<!-- \/city:doors -->\n*$/;

for (const r of CITY.rooms) {
  const file = r.url === '/404' ? '404.html' : r.url.slice(1) + 'index.html';
  put(file, text => {
    const bare = text.replace(H[0], '').replace(H[1], '');
    const nav = doorsHtml(r.id, bare);
    if (!nav || !bare.includes('</head>') || !bare.includes('</body>')) return bare;
    return bare
      .replace('</head>', `<!-- city:head -->${HEAD}<!-- /city:head -->\n</head>`)
      .replace(/\n?<\/body>/, `\n<!-- city:doors -->${nav}<!-- /city:doors -->\n</body>`);
  });
  if (r.md && r.md !== '/md/index.md') put(r.md.slice(1), text =>
    text.replace(M, '').replace(/\s*$/, '') + `\n\n---\n<!-- city:doors -->\n${doorsMd(r.id)}\n<!-- /city:doors -->\n`);
}

create('md/index.md', atlasMd());
create('city/topology.json', JSON.stringify(CITY, null, 2) + '\n');

put('manifest.json', text => {
  const m = JSON.parse(text), end = text.endsWith('\n') ? '\n' : '';
  const out = {};
  for (const [k, v] of Object.entries(m)) {
    if (['schema', 'topology', 'doors_note', 'groups'].includes(k)) continue;
    if (k === 'rooms') Object.assign(out, { schema: CITY.schema, topology: '/city/topology.json', doors_note: CITY.note, groups: CITY.groups });
    out[k] = v;
  }
  for (const r of out.rooms) {
    const here = room(r.id); if (!here) continue;
    r.group = here.group; r.doors = manifestDoors(r.id);
  }
  return JSON.stringify(out, null, 2) + end;
});

if (check && stale.length) { console.error('stale, run node city/apply.mjs:\n  ' + stale.join('\n  ')); process.exit(1); }
console.log(check ? 'doors: up to date' : 'doors: written into ' + root);
