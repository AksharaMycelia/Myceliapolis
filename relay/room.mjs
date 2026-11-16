import { SIZE, WALL, blueprint, snapshotHash } from '../machines/engine.mjs';
import { arrive, fromHash, readArrival, choose, advance, differences, carry } from './relay.mjs';

const $ = id => document.getElementById(id);
const left = $('untouched'), right = $('changed');
const css = getComputedStyle(document.documentElement);
const color = name => css.getPropertyValue(name).trim();
const palette = [color('--blank'), ...Array.from({ length: 7 }, (_, i) => color('--s' + (i + 1))), color('--wall')];
const ink = color('--ink'), paper = color('--paper'), accent = color('--accent');
const media = matchMedia('(prefers-reduced-motion: reduce)');
let session, running = false, remaining = 0, frameId = 0, previous = 0, budget = 0;
let cursor = { x: 16, y: 16 };

function say(text, error = false) {
  $('notice').textContent = text;
  $('notice').classList.toggle('error', error);
}
function invalidateParcel() { $('parcel').hidden = true; $('world-link').value = ''; }
function pause() {
  running = false; remaining = 0; cancelAnimationFrame(frameId);
  $('run').textContent = 'Let 64 steps pass';
}
function draw(canvas, world, marks) {
  const ctx = canvas.getContext('2d'), unit = canvas.width / SIZE;
  ctx.fillStyle = paper; ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < world.cells.length; i++) {
    const x = (i % SIZE) * unit, y = Math.floor(i / SIZE) * unit, state = world.cells[i];
    ctx.fillStyle = palette[state]; ctx.fillRect(x + 1, y + 1, unit - 2, unit - 2);
    if (state === WALL) {
      ctx.strokeStyle = paper; ctx.lineWidth = 1.5; ctx.beginPath();
      ctx.moveTo(x + unit * .3, y + unit * .7); ctx.lineTo(x + unit * .7, y + unit * .3); ctx.stroke();
    }
  }
  ctx.strokeStyle = accent; ctx.lineWidth = 2;
  for (const i of marks) ctx.strokeRect((i % SIZE) * unit + 2, Math.floor(i / SIZE) * unit + 2, unit - 4, unit - 4);
  for (const c of world.creatures) {
    ctx.save(); ctx.translate((c.x + .5) * unit, (c.y + .5) * unit); ctx.rotate(c.dir * Math.PI / 2);
    ctx.fillStyle = ink; ctx.strokeStyle = paper; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, -unit * .48); ctx.lineTo(unit * .38, unit * .38); ctx.lineTo(0, unit * .18); ctx.lineTo(-unit * .38, unit * .38); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  }
  if (canvas === right && document.activeElement === right) {
    ctx.strokeStyle = ink; ctx.lineWidth = 2;
    ctx.strokeRect(cursor.x * unit, cursor.y * unit, unit, unit);
  }
}
const tileName = state => state === WALL ? 'wall' : 'state ' + state;
function readout() {
  const delta = differences(session), marks = $('show-difference').checked ? delta.tiles : [];
  draw(left, session.untouched, marks); draw(right, session.changed, marks);
  $('elapsed').textContent = session.elapsed.toLocaleString('en');
  $('comparison').textContent = `${delta.tiles.length} tile${delta.tiles.length === 1 ? '' : 's'} differ · ${delta.positions} creature${delta.positions === 1 ? '' : 's'} differ in position or direction.`;
  $('column').value = cursor.x; $('row').value = cursor.y;
  const at = cursor.y * SIZE + cursor.x;
  $('tile-info').textContent = `Tile ${cursor.x}, ${cursor.y}: arrived as ${tileName(session.arrival.cells[at])}; now ${tileName(session.changed.cells[at])} on the right.`;
  const e = session.edit;
  $('edit-description').textContent = !e ? 'No edit.' : e.type === 'rule' ? `Creature ${e.id}: ${session.arrival.creatures.find(c => c.id === e.id).rule} → ${e.rule}.` : `Tile ${e.x}, ${e.y}: ${tileName(session.arrival.cells[e.y * SIZE + e.x])} → ${tileName(e.value)}.`;
  $('undo').disabled = !e;
  $('run').disabled = $('step').disabled = session.changed.tick >= 1e9 || session.changed.creatures.length === 0;
  $('to-machines').href = '/machines/' + snapshotHash(session.changed);
}
function ruleForSelection() {
  const c = session.arrival.creatures.find(c => c.id === Number($('creature').value));
  $('rule').value = c?.rule ?? '';
}
function openSession(next, origin) {
  pause(); session = next; invalidateParcel();
  $('arrival-error').hidden = true; $('work').hidden = false;
  $('origin').textContent = origin;
  $('arrival-tick').textContent = 'ARRIVAL / STEP ' + session.arrival.tick;
  $('creature').replaceChildren();
  for (const c of session.arrival.creatures) {
    const option = document.createElement('option'); option.value = c.id; option.textContent = `Creature ${c.id} · ${c.rule}`; $('creature').append(option);
  }
  const empty = session.arrival.creatures.length === 0;
  $('creature').disabled = $('rule').disabled = $('apply-rule').disabled = empty;
  ruleForSelection(); readout();
  say(empty ? 'No creatures arrived. You can change a tile, carry it onward, or add a creature in Small Machines.' : 'Change a rule or a tile. Or let both worlds run as they arrived.');
}
function loadHash() {
  if (location.hash === '#work' && session && !$('work').hidden) return;
  try {
    if (!location.hash || location.hash === '#work') openSession(arrive(), 'An authored seed. No previous visitor is implied.');
    else openSession(fromHash(location.hash), 'A world from this link. Its earlier history is not recorded.');
  } catch (error) {
    pause(); $('work').hidden = true; $('arrival-error').hidden = false; $('error-message').textContent = error.message;
  }
}
function edit(e) {
  try { choose(session, e); pause(); invalidateParcel(); readout(); say('One change made. Both worlds are back at arrival.'); }
  catch (error) { readout(); say(error.message, true); }
}
function changeTile(x, y) {
  // Keep the last valid cursor when a numeric field is empty or out of bounds.
  if (![x, y].every(n => Number.isInteger(n) && n >= 0 && n < SIZE)) { say('Columns and rows run from 0 to 31.', true); return; }
  cursor = { x, y }; edit({ type: 'tile', x, y, value: Number($('tool').value) });
}
$('skip').addEventListener('click', event => {
  if (!$('work').hidden) { event.preventDefault(); $('work').focus(); }
});
for (const id of ['rule-form', 'tile-form', 'blueprint']) $(id).addEventListener('focusin', () => {
  if (running) { pause(); say('Paused for your edit.'); }
});
$('rule-form').addEventListener('submit', event => {
  event.preventDefault(); edit({ type: 'rule', id: Number($('creature').value), rule: $('rule').value.trim().toUpperCase() });
});
$('creature').addEventListener('change', ruleForSelection);
$('tile-form').addEventListener('submit', event => {
  event.preventDefault(); changeTile($('column').valueAsNumber, $('row').valueAsNumber);
});
right.addEventListener('click', event => {
  const r = right.getBoundingClientRect();
  const x = Math.min(31, Math.max(0, Math.floor((event.clientX - r.left) / r.width * SIZE)));
  const y = Math.min(31, Math.max(0, Math.floor((event.clientY - r.top) / r.height * SIZE)));
  right.focus({ preventScroll: true }); changeTile(x, y);
});
right.addEventListener('keydown', event => {
  const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
  if (d) { event.preventDefault(); cursor = { x: (cursor.x + d[0] + SIZE) % SIZE, y: (cursor.y + d[1] + SIZE) % SIZE }; readout(); }
  else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); changeTile(cursor.x, cursor.y); }
});
right.addEventListener('focus', () => session && readout());
right.addEventListener('blur', () => session && readout());
$('show-difference').addEventListener('change', readout);

function tick(now) {
  if (!running) return;
  budget += Math.min(100, Math.max(0, now - previous)) * .032; previous = now;
  const count = Math.min(remaining, Math.floor(budget));
  if (count) { advance(session, count); budget -= count; remaining -= count; readout(); }
  if (remaining <= 0 || session.changed.tick >= 1e9) { pause(); readout(); say('Both worlds have paused. You can carry the right-hand world onward.'); }
  else frameId = requestAnimationFrame(tick);
}
$('run').addEventListener('click', () => {
  if (running) { pause(); say('Paused.'); return; }
  invalidateParcel();
  if (media.matches) { advance(session, 64); readout(); say('Advanced both worlds by up to 64 steps, without animation.'); return; }
  running = true; remaining = 64; budget = 0; previous = performance.now();
  $('run').textContent = 'Pause'; say('Both worlds are running.'); frameId = requestAnimationFrame(tick);
});
$('step').addEventListener('click', () => { pause(); invalidateParcel(); advance(session); readout(); say('Both worlds advanced one step.'); });
$('rewind').addEventListener('click', () => {
  pause(); const e = session.edit; session = arrive(session.arrival); if (e) choose(session, e);
  invalidateParcel(); readout(); say('Back at arrival. Your edit is kept.');
});
$('undo').addEventListener('click', () => { pause(); session = arrive(session.arrival); invalidateParcel(); ruleForSelection(); readout(); say('Your change is removed. Both worlds are as they arrived.'); });
document.addEventListener('visibilitychange', () => { if (document.hidden && running) { pause(); say('Paused while this tab is hidden.'); } });
media.addEventListener('change', () => { if (running) { pause(); say('Paused after the motion preference changed.'); } });

$('carry').addEventListener('click', () => {
  pause(); const url = location.origin + '/relay/' + carry(session);
  $('world-link').value = url; $('open-world').href = url; $('parcel').hidden = false;
  say('The link is ready. It contains the right-hand world at this moment.');
});
$('copy').addEventListener('click', async () => {
  const url = $('world-link').value;
  if (!url) return;
  try { await navigator.clipboard.writeText(url); if ($('world-link').value === url) say('World link copied. Nothing has been posted.'); }
  catch { if ($('world-link').value === url) { $('world-link').focus(); $('world-link').select(); say('Copy the selected link to carry this world.'); } }
});
$('read').addEventListener('click', () => {
  pause(); $('blueprint').value = JSON.stringify(blueprint(session.changed), null, 2);
  $('blueprint-notice').textContent = `Right-hand world at step ${session.changed.tick}.`;
});
$('load').addEventListener('click', () => {
  try { const next = readArrival($('blueprint').value); openSession(next, 'An imported world. Its earlier history is not recorded.'); $('blueprint-notice').textContent = 'World loaded. Both copies are paused.'; }
  catch (error) { $('blueprint-notice').textContent = error.message; }
});
$('use-seed').addEventListener('click', () => {
  history.replaceState(null, '', location.pathname); openSession(arrive(), 'An authored seed. No previous visitor is implied.');
});
window.addEventListener('hashchange', loadHash);
loadHash();
