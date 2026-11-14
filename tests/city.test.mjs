// The doors: one list, and everything that is written from it.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';
import worker from '../_worker.js';
import { CITY, room, doorsOf, anchor, atlasHtml, atlasMd, doorsMd } from '../city/doors.mjs';

const root = new URL('..', import.meta.url).pathname;
const read = path => readFileSync(root + path, 'utf8');
function environment() {
  const sqlite = new DatabaseSync(':memory:');
  const db = { prepare(sql) { return { sql, args: [], bind(...a) { this.args = a; return this; }, async first() { return sqlite.prepare(sql).get(...this.args) || null; } }; },
    async batch(list) { return list.map(s => ({ results: sqlite.prepare(s.sql).all(...s.args) })); } };
  return { RUMORS_DB: db, ASSETS: { fetch: () => new Response('asset') } };
}
const get = async path => { const r = await worker.fetch(new Request('https://myceliapolis.com' + path), environment()); return { status: r.status, text: await r.text() }; };
const fileOf = r => r.url === '/404' ? '404.html' : r.url.slice(1) + 'index.html';
const served = ['/after/', '/conservatory/', '/chronicle/', '/chair/', '/atlas/', '/rumor/', '/kfc/'];

test('rooms are unique and every door joins two of them', () => {
  const ids = CITY.rooms.map(r => r.id), urls = CITY.rooms.map(r => r.url);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(new Set(urls).size, urls.length);
  for (const d of CITY.doors) { assert.ok(room(d.from), d.from); assert.ok(room(d.to), d.to); assert.notEqual(d.from, d.to); }
  for (const r of CITY.rooms) if (r.on) assert.ok(room(r.on), r.id);
});

test('no room is a dead end', () => {
  for (const r of CITY.rooms) if (r.id !== 'quarter/atlas') assert.ok(doorsOf(r.id).some(d => !d.access), r.id);
});

test('the parts of the city are joined by doors that pass through neither the front page nor the atlas', () => {
  const skip = new Set(['surface/1', 'quarter/atlas', 'city/lost']);
  const seen = new Set(['surface/2']), queue = ['surface/2'];
  while (queue.length) for (const d of doorsOf(queue.shift())) if (!d.access && !skip.has(d.to) && !seen.has(d.to)) { seen.add(d.to); queue.push(d.to); }
  for (const g of CITY.groups) assert.ok(CITY.rooms.some(r => r.group === g.id && seen.has(r.id)), g.id);
  for (const id of ['workshop/machines', 'workshop/feather-breeze', 'tavern/rumor', 'quarter/conservatory', 'quarter/chair', 'switchboard/fungi-i', 'switchboard/fungi-ii', 'switchboard/fungi-iii']) assert.ok(seen.has(id), id);
});

test('the checked-in rooms carry the doors of the current list', () => {
  execFileSync('node', [root + 'city/apply.mjs', '--check']);
});

test('every static room names the map, and every door it has is a real address', () => {
  for (const r of CITY.rooms) {
    if (served.includes(r.url)) continue;
    assert.ok(existsSync(root + fileOf(r)), r.url);
    const page = read(fileOf(r));
    assert.ok(page.includes(`href="/atlas/#${anchor(r.id)}"`), r.url);
    assert.equal(page.match(/<!-- city:doors -->/g).length, 1, r.url);
    for (const d of doorsOf(r.id)) if (!d.access) assert.ok(page.includes(`href="${room(d.to).url}"`), `${r.url} → ${room(d.to).url}`);
  }
});

test('served rooms carry their doors too', async () => {
  for (const id of ['quarter/threshold', 'quarter/conservatory', 'quarter/chronicle', 'quarter/chair', 'tavern/rumor']) {
    const r = room(id), page = await get(r.url);
    assert.equal(page.status, 200, r.url);
    assert.ok(page.text.includes(`href="/atlas/#${anchor(id)}"`), r.url);
    for (const d of doorsOf(id)) if (!d.access) assert.ok(page.text.includes(`href="${room(d.to).url}"`), `${r.url} → ${room(d.to).url}`);
    const text = await get(r.md);
    assert.equal(text.status, 200, r.md);
    assert.ok(text.text.includes(doorsMd(id)), r.md);
  }
});

test('the room behind the tavern stays shut, says so, and offers a way back', async () => {
  for (const path of ['/kfc/', '/md/kfc.md']) {
    const page = await get(path);
    assert.equal(page.status, 403);
    assert.ok(!page.text.includes('De grammatica'));
    assert.ok(page.text.includes('/rumor/'));
  }
  assert.ok(!read('city/topology.json').includes('De grammatica'));
});

test('every plain-text room ends with the same doors as the list', () => {
  for (const r of CITY.rooms) {
    if (!r.md || r.md === '/md/index.md' || !existsSync(root + r.md.slice(1))) continue;
    const text = read(r.md.slice(1)).replace(/\r\n/g, '\n');
    assert.ok(text.endsWith(`<!-- city:doors -->\n${doorsMd(r.id)}\n<!-- /city:doors -->\n`), r.md);
  }
});

test('the atlas, the text atlas and the manifest agree', async () => {
  const html = (await get('/atlas/')).text, text = (await get('/md/atlas.md')).text;
  assert.ok(html.includes(atlasHtml()));
  assert.ok(!html.includes('Room IV'));
  assert.equal(text, atlasMd());
  assert.equal(read('md/index.md').replace(/\r\n/g, '\n'), atlasMd());
  const manifest = JSON.parse(read('manifest.json'));
  for (const r of CITY.rooms.filter(r => r.listed !== false)) {
    assert.ok(html.includes(`id="${anchor(r.id)}"`) && html.includes(`href="${r.url}"`), r.id);
    assert.ok(text.includes(`(${r.md || r.url})`), r.id);
    const listed = manifest.rooms.find(m => m.id === r.id);
    assert.ok(listed, r.id);
    assert.equal(listed.url, r.url);
    assert.deepEqual(listed.doors.map(d => d.to), doorsOf(r.id).map(d => d.to));
  }
  for (const m of manifest.rooms) assert.ok(room(m.id), m.id);
});

test('the six puzzles are untouched: three answers each, and the list does not say which', () => {
  const redirects = read('_redirects');
  for (const s of CITY.sequences.filter(s => s.choice)) {
    assert.equal(s.choice.endpoints.length, 3);
    for (const e of s.choice.endpoints) assert.ok(redirects.includes(e + '  '), e);
    assert.ok(!doorsOf(s.choice.at).some(d => room(d.to).role === 'opera'));
  }
});

test('the list keeps to the city’s own rules of speech', () => {
  const words = JSON.stringify(CITY) + atlasMd() + atlasHtml();
  assert.ok(!/\bAI\b|consciousness/i.test(words));
  assert.ok(!/disprove|real answer|enlighten|unlock/i.test(words));
});
