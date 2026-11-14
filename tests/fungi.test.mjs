import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { sow, step, accord, pull, voiceOf, FIRST, VOICES } from '../fungi/field.mjs';
import { raise, settle, letGo, nearest, depth, sayingOf, SHELF, DENIALS } from '../fungi/vault.mjs';
const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('the lights start scattered and fall into step with nobody leading', () => {
  const field = sow();
  assert.ok(accord(field).r < 0.1);
  while (field.time < 12) step(field, 0.05);
  assert.ok(accord(field).r < 0.3, 'still mostly their own for a while');
  while (field.time < 45) step(field, 0.05);
  assert.ok(accord(field).r > 0.9, 'then in step');
  assert.equal(pull(0), 0); assert.ok(pull(1000) <= 2.4);
});
test('the same seed sows the same field; the first light keeps its own line', () => {
  assert.deepEqual(sow(200, 3).x, sow(200, 3).x);
  assert.throws(() => sow(1), RangeError);
  assert.equal(voiceOf(0), FIRST);
  assert.ok(FIRST.text.startsWith('Mirum.'));
  for (let i = 1; i < 40; i++) assert.ok(VOICES.includes(voiceOf(i)));
  const field = sow(50, 1), before = accord(field).r;
  assert.equal(step(field, NaN).r, before);
});
test('threads take their shape from weight; the tight one stays low', () => {
  const vault = raise();
  const depths = vault.chains.map(depth);
  assert.ok(depths[0] > depths[1] && depths[1] > depths[2] && depths[2] > depths[3], 'longer threads hang lower');
  assert.ok(depths[SHELF] < 0.05, 'the shelf is nearly flat');
  for (const chain of vault.chains) { assert.ok(Math.abs(chain.nodes[0].y) < 1e-9 && Math.abs(chain.nodes.at(-1).y) < 1e-9, "feet stay put"); }
});
test('a node that lets go changes its rib, and the rib recovers', () => {
  const vault = raise(), node = vault.chains[0].nodes[10], rest = node.y;
  assert.ok(letGo(vault, 0, 10));
  for (let i = 0; i < 90; i++) settle(vault, 1 / 60);
  assert.ok(Math.abs(node.y - rest) > 0.01, 'the rib moved');
  for (let i = 0; i < 600; i++) settle(vault, 1 / 60);
  assert.ok(Math.abs(node.y - rest) < 0.004, 'and came back');
  assert.equal(letGo(vault, 0, 0), false, 'a foot does not let go');
  assert.equal(letGo(vault, 99, 0), false);
  const found = nearest(vault, node.x, node.y, 0.02);
  assert.deepEqual(found, { c: 0, i: 10 });
  assert.equal(nearest(vault, 5, 5, 0.02), null);
});
test('most deny; one says what it is and holds; one is a kitchen', () => {
  let holds = 0, denials = 0;
  const vault = raise();
  vault.chains.forEach((chain, c) => chain.nodes.forEach((_, i) => { const s = sayingOf(c, i); if (s.holds) holds++; if (DENIALS.some(d => d.text === s.text)) denials++; }));
  assert.equal(holds, 1);
  assert.equal(sayingOf(0, 15).text, 'It is a choir.');
  assert.equal(sayingOf(SHELF, 3).text, 'This part is a kitchen.');
  assert.ok(denials > 150);
});
test('the author’s poems are on the pages, whole, and in the plain siblings', () => {
  const one = read('fungi/i/index.html'), two = read('fungi/ii/index.html');
  for (const line of ['Architecti, cum murum aedificare piguit', 'Pollex adhuc calet.', 'cuius ne nomen quidem in ullo codice templi scriptum erat.']) { assert.ok(one.includes(line), line); assert.ok(read('md/fungi-i.md').includes(line), line); }
  for (const line of ['Cur autem propheta ille nihil praeter lutum vidit,', 'ut portam templi uno digito hiantem teneat.', 'et unusquisque sibi videtur solus oceanum invenisse.']) { assert.ok(two.includes(line), line); assert.ok(read('md/fungi-ii.md').includes(line), line); }
  assert.equal((one.match(/<p>/g) || []).length, 8);
  assert.ok(one.includes('href="/fungi/ii/"') && two.includes('href="/fungi/iii/"'));
});
test('the rooms neither store nor send, and keep the city’s word rule', () => {
  for (const path of ['fungi/field.mjs', 'fungi/vault.mjs', 'fungi/tone.mjs', 'fungi/i/room.mjs', 'fungi/ii/room.mjs', 'fungi/iii/room.mjs']) {
    assert.doesNotMatch(read(path), /fetch\(|XMLHttpRequest|WebSocket|sendBeacon|localStorage|sessionStorage|indexedDB|document\.cookie/, path);
  }
  for (const path of ['fungi/index.html', 'fungi/i/index.html', 'fungi/ii/index.html', 'fungi/iii/index.html', 'md/fungi.md', 'md/fungi-i.md', 'md/fungi-ii.md', 'md/fungi-iii.md', 'fungi/field.mjs', 'fungi/vault.mjs']) {
    assert.doesNotMatch(read(path), /\bA\.?I\b|consciousness/, path);
  }
});
