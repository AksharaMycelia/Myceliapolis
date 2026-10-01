import { SIZE, WALL, MAX_CREATURES, validRule, readBlueprint, blueprint, clone, step, preset, snapshotHash, readHash } from './engine.mjs';

const $ = id => document.getElementById(id);
const canvas = $('board'), ctx = canvas.getContext('2d');
const colors = ['#14282e', '#dcb875', '#579f9c', '#d67e6e', '#7986b5', '#b8c988', '#b28ca9', '#b4d3d6'];
const creatureColors = ['#ffe2a2', '#7aeee0', '#ffad9a', '#c3c2ff', '#d8e9aa', '#ffbfed', '#b4e4ff', '#ffffff'];
const names = { neighbors: 'Four neighbors', solitary: 'One wanderer', courtyards: 'Courtyards', empty: 'Empty streets' };
const turnNames = { L: 'Left', R: 'Right', S: 'Straight', U: 'Turn back' };
let world = preset(), initial = clone(world), selected = 1, tool = 'inspect', pendingRule = 'RLLR';
let running = false, frameId = 0, lastTime = 0, accumulated = 0, lastReadout = 0;
let cursor = { x: 16, y: 16 }, stroke = null, undo = [];
let currentName = 'Four neighbors', currentPreset = 'neighbors';

function say(text, error = false) {
  $('notice').textContent = text;
  $('notice').classList.toggle('error', error);
}
function checkpoint() {
  undo.push({ world: clone(world), initial: clone(initial), selected, name: currentName, preset: currentPreset });
  if (undo.length > 12) undo.shift();
}
function edited() {
  initial = clone(world);
  currentName = 'Your experiment'; currentPreset = '';
  refresh();
}
function setRunning(value) {
  running = value && world.creatures.length > 0 && world.tick < 1e9;
  $('play').textContent = running ? 'Ⅱ Pause' : '▶ Run';
  $('run-state').textContent = running ? 'Running' : 'Paused';
  if (running) { lastTime = performance.now(); accumulated = 0; cancelAnimationFrame(frameId); frameId = requestAnimationFrame(frame); }
  else { cancelAnimationFrame(frameId); updateReadouts(); draw(); }
}
function frame(now) {
  if (!running) return;
  accumulated += Math.min(250, now - lastTime) * Number($('speed').value) / 1000;
  lastTime = now;
  const count = Math.floor(accumulated);
  if (count) { step(world, count); accumulated -= count; draw(); }
  if (now - lastReadout > 160) { updateReadouts(); lastReadout = now; }
  if (world.tick >= 1e9) { setRunning(false); say('This world has reached its step limit. Load a starting place to begin again.'); return; }
  frameId = requestAnimationFrame(frame);
}
function updateReadouts() {
  $('tick').textContent = world.tick.toLocaleString('en');
  $('census').textContent = `${world.creatures.length} creature${world.creatures.length === 1 ? '' : 's'}`;
}
function setCursor(x, y) {
  cursor = { x, y }; $('column').value = x; $('row').value = y;
  const state = world.cells[y * SIZE + x];
  const occupants = world.creatures.filter(c => c.x === x && c.y === y).map(c => c.id);
  $('tile-info').textContent = `Tile ${x}, ${y} · ${state === WALL ? 'wall' : 'state ' + state}${occupants.length ? ' · creature ' + occupants.join(', ') : ''}`;
}
function draw() {
  const w = canvas.width, unit = w / SIZE;
  ctx.clearRect(0, 0, w, w); ctx.fillStyle = '#102127'; ctx.fillRect(0, 0, w, w);
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) {
    const s = world.cells[y * SIZE + x], px = x * unit, py = y * unit;
    ctx.fillStyle = s === WALL ? '#66818b' : colors[s];
    const pad = s === WALL ? unit * .12 : unit * .085;
    ctx.fillRect(px + pad, py + pad, unit - pad * 2, unit - pad * 2);
    if (s === WALL) {
      ctx.strokeStyle = '#263e48'; ctx.lineWidth = Math.max(1, unit * .07);
      ctx.beginPath(); ctx.moveTo(px + unit * .3, py + unit * .7); ctx.lineTo(px + unit * .7, py + unit * .3); ctx.stroke();
    } else if (s > 0) {
      ctx.fillStyle = '#f4e8c233'; ctx.fillRect(px + unit * .25, py + unit * .25, unit * .5, Math.max(1, unit * .07));
    }
  }
  for (const c of world.creatures) {
    const cx = (c.x + .5) * unit, cy = (c.y + .5) * unit;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(c.dir * Math.PI / 2);
    if (c.id === selected) {
      ctx.strokeStyle = '#fff8de'; ctx.lineWidth = Math.max(1, unit * .06);
      ctx.beginPath(); ctx.arc(0, 0, unit * .62, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.shadowColor = creatureColors[c.id - 1]; ctx.shadowBlur = unit * .75;
    ctx.fillStyle = creatureColors[c.id - 1]; ctx.strokeStyle = '#0a151b'; ctx.lineWidth = Math.max(1, unit * .1);
    ctx.beginPath(); ctx.moveTo(0, -unit * .5); ctx.lineTo(unit * .35, unit * .36); ctx.lineTo(0, unit * .2); ctx.lineTo(-unit * .35, unit * .36); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  if (document.activeElement === canvas || stroke) {
    ctx.strokeStyle = '#fff3d5'; ctx.lineWidth = Math.max(1.5, unit * .08);
    ctx.strokeRect(cursor.x * unit + 1, cursor.y * unit + 1, unit - 2, unit - 2);
  }
}
function drawRules(rule) {
  $('rule-strip').replaceChildren();
  [...rule].forEach((letter, i) => {
    const card = document.createElement('div'); card.className = 'rule-card';
    card.style.setProperty('--state-color', colors[i]);
    card.setAttribute('aria-label', `Tile state ${i}: ${turnNames[letter]}`);
    const state = document.createElement('span'); state.textContent = i;
    const action = document.createElement('strong'); action.textContent = letter;
    card.append(state, action); $('rule-strip').append(card);
  });
}
function refresh() {
  if (!world.creatures.some(c => c.id === selected)) selected = world.creatures[0]?.id ?? null;
  $('world-name').textContent = currentName;
  $('creatures').replaceChildren();
  for (const c of world.creatures) {
    const button = document.createElement('button'); button.type = 'button'; button.textContent = c.id;
    button.style.setProperty('--creature-color', creatureColors[c.id - 1]);
    button.setAttribute('aria-label', `Creature ${c.id}, program ${c.rule}`);
    button.setAttribute('aria-pressed', String(c.id === selected));
    button.addEventListener('click', () => { selected = c.id; refresh(); say(`Creature ${c.id} selected. Change its program below.`); });
    $('creatures').append(button);
  }
  if (!world.creatures.length) { const text = document.createElement('p'); text.className = 'small'; text.textContent = 'No creatures yet. Place the first one.'; $('creatures').append(text); }
  const chosen = world.creatures.find(c => c.id === selected);
  $('program').value = chosen?.rule ?? pendingRule;
  drawRules($('program').value);
  $('add').disabled = world.creatures.length >= MAX_CREATURES;
  $('remove').disabled = !chosen;
  $('play').disabled = !world.creatures.length;
  $('undo').disabled = !undo.length;
  document.querySelectorAll('[data-preset]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.preset === currentPreset)));
  updateReadouts(); setCursor(cursor.x, cursor.y); draw();
}
function setTool(next) {
  tool = next; canvas.dataset.tool = tool;
  document.querySelectorAll('[data-tool]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.tool === tool)));
  $('add').setAttribute('aria-pressed', String(tool === 'add'));
  $('tool-help').textContent = {
    inspect: 'Click a creature to select it, or a tile to read its state.',
    wall: 'Draw a wall. Creatures turn around when they reach it.',
    light: 'Paint state 1 into the streets. A different tile changes a creature’s next turn.',
    erase: 'Return tiles to state 0. Creatures stay where they are.',
    add: 'Choose an open tile for a new creature using the program above.'
  }[tool];
}
function act(x, y, remember = true) {
  setCursor(x, y);
  const at = y * SIZE + x, occupant = world.creatures.find(c => c.x === x && c.y === y);
  if (tool === 'inspect') {
    if (occupant) { selected = occupant.id; refresh(); }
    draw(); say($('tile-info').textContent); return;
  }
  if (tool === 'wall' && occupant) { say('That tile holds a creature. Place the wall beside it.'); return; }
  if (tool === 'add') {
    if (world.cells[at] === WALL || occupant) { say('Choose an empty tile for this creature.'); return; }
    if (world.creatures.length >= MAX_CREATURES) { say('Eight creatures is the limit for this world.'); return; }
    const rule = $('program').value.trim().toUpperCase();
    if (!validRule(rule)) { say('Use 2–8 letters: L, R, S, or U.', true); return; }
    setRunning(false); if (remember) checkpoint();
    const id = Array.from({ length: 8 }, (_, i) => i + 1).find(id => !world.creatures.some(c => c.id === id));
    world.creatures.push({ id, x, y, dir: 0, rule }); selected = id; pendingRule = rule;
    setTool('inspect'); edited(); say(`Creature ${id} has arrived with program ${rule}. Choose Run.`); return;
  }
  const value = { wall: WALL, light: 1, erase: 0 }[tool];
  if (world.cells[at] === value) return;
  setRunning(false); if (remember) checkpoint();
  world.cells[at] = value; edited(); say('Street changed. Choose Run to see what follows.');
}
function point(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: Math.max(0, Math.min(31, Math.floor((event.clientX - rect.left) / rect.width * SIZE))), y: Math.max(0, Math.min(31, Math.floor((event.clientY - rect.top) / rect.height * SIZE))) };
}
canvas.addEventListener('pointerdown', event => {
  if (event.button !== 0) return;
  const p = point(event); canvas.focus({ preventScroll: true });
  const drawing = ['wall', 'light', 'erase'].includes(tool);
  if (drawing) { setRunning(false); checkpoint(); }
  stroke = { x: p.x, y: p.y, drawing };
  canvas.setPointerCapture(event.pointerId); act(p.x, p.y, !drawing);
});
canvas.addEventListener('pointermove', event => {
  if (!stroke?.drawing) return;
  const p = point(event);
  let x = stroke.x, y = stroke.y;
  const distanceX = Math.abs(p.x - x), distanceY = Math.abs(p.y - y);
  const signX = x < p.x ? 1 : -1, signY = y < p.y ? 1 : -1;
  let error = distanceX - distanceY;
  while (x !== p.x || y !== p.y) {
    const twice = 2 * error;
    if (twice > -distanceY) { error -= distanceY; x += signX; }
    if (twice < distanceX) { error += distanceX; y += signY; }
    act(x, y, false);
  }
  stroke.x = p.x; stroke.y = p.y;
});
for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) canvas.addEventListener(event, () => { stroke = null; draw(); });
canvas.addEventListener('keydown', event => {
  const offsets = { ArrowUp: [0, -1], ArrowRight: [1, 0], ArrowDown: [0, 1], ArrowLeft: [-1, 0] };
  if (offsets[event.key]) {
    event.preventDefault(); const [x, y] = offsets[event.key];
    setCursor((cursor.x + x + SIZE) % SIZE, (cursor.y + y + SIZE) % SIZE); draw(); say($('tile-info').textContent);
  } else if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); act(cursor.x, cursor.y); }
});
canvas.addEventListener('focus', draw); canvas.addEventListener('blur', draw);
document.querySelectorAll('[data-tool]').forEach(b => b.addEventListener('click', () => setTool(b.dataset.tool)));
$('add').addEventListener('click', () => { setTool('add'); say('Choose a tile in the world, or use Column and Row.'); });
$('coordinate-form').addEventListener('submit', event => { event.preventDefault(); act(Number($('column').value), Number($('row').value)); });
$('program-form').addEventListener('submit', event => {
  event.preventDefault(); const rule = $('program').value.trim().toUpperCase();
  if (!validRule(rule)) { say('Use 2–8 letters: L, R, S, or U.', true); return; }
  const chosen = world.creatures.find(c => c.id === selected);
  if (chosen) { setRunning(false); checkpoint(); chosen.rule = rule; edited(); say(`Creature ${chosen.id} now follows ${rule}.`); }
  else { pendingRule = rule; drawRules(rule); setTool('add'); say('Program ready. Choose a tile to place the first creature.'); }
});
$('remove').addEventListener('click', () => {
  if (selected === null) return; setRunning(false); checkpoint();
  world.creatures = world.creatures.filter(c => c.id !== selected); edited(); say('Creature removed. Its trail remains.');
});
$('play').addEventListener('click', () => { setRunning(!running); say(running ? 'The creatures are following their rules.' : 'Paused. Inspect or change the streets.'); });
$('step').addEventListener('click', () => { setRunning(false); step(world); refresh(); say('Advanced one step.'); });
$('jump').addEventListener('click', () => { setRunning(false); step(world, 100); refresh(); say('Advanced 100 steps.'); });
$('restart').addEventListener('click', () => { setRunning(false); checkpoint(); world = clone(initial); refresh(); say('Returned to the last starting point.'); });
$('undo').addEventListener('click', () => {
  if (!undo.length) return; setRunning(false); const previous = undo.pop();
  world = previous.world; initial = previous.initial; selected = previous.selected; currentName = previous.name; currentPreset = previous.preset;
  refresh(); say('The previous edit has been restored.');
});
function loadWorld(next, name, key = '') {
  setRunning(false); checkpoint(); world = next; initial = clone(world); currentName = name; currentPreset = key;
  selected = world.creatures[0]?.id ?? null; setTool('inspect'); refresh();
}
document.querySelectorAll('[data-preset]').forEach(b => b.addEventListener('click', () => {
  loadWorld(preset(b.dataset.preset), names[b.dataset.preset], b.dataset.preset); say('Example loaded and paused. Choose Run, or change a rule.');
}));
$('share').addEventListener('click', async () => {
  setRunning(false);
  const url = location.origin + location.pathname + snapshotHash(world);
  $('share-url').value = url;
  history.replaceState(null, '', url);
  try { await navigator.clipboard.writeText(url); $('share-fallback').hidden = true; say('World link copied. It opens an independent copy of this exact moment.'); }
  catch { $('share-fallback').hidden = false; $('share-url').focus(); $('share-url').select(); say('Your world link is ready below. Copy it to share this moment.'); }
});
function exportWorld() { $('blueprint').value = JSON.stringify(blueprint(world), null, 2); $('blueprint-notice').textContent = `Snapshot of step ${world.tick}.`; $('blueprint-notice').classList.remove('error'); }
$('blueprint-details').addEventListener('toggle', () => { if ($('blueprint-details').open && !$('blueprint').value) exportWorld(); });
$('export').addEventListener('click', exportWorld);
$('import').addEventListener('click', () => {
  try { const next = readBlueprint($('blueprint').value); loadWorld(next, 'Imported world'); $('blueprint-notice').textContent = 'Blueprint loaded. The world is paused.'; $('blueprint-notice').classList.remove('error'); say('Blueprint loaded. Choose Run.'); }
  catch (error) { $('blueprint-notice').textContent = error.message; $('blueprint-notice').classList.add('error'); }
});
document.addEventListener('visibilitychange', () => { if (document.hidden && running) { setRunning(false); say('Paused while you were away. Choose Run when you return.'); } });
window.addEventListener('hashchange', () => {
  if (!location.hash.startsWith('#world=')) return;
  try { loadWorld(readHash(location.hash), 'A shared world'); say('Shared snapshot opened. Your changes will make an independent world.'); }
  catch (error) { say(error.message, true); }
});
if (location.hash.startsWith('#world=')) {
  try { world = readHash(location.hash); initial = clone(world); currentName = 'A shared world'; currentPreset = ''; say('Shared snapshot opened and paused.'); }
  catch (error) { say(error.message + ' The default example is still available.', true); }
}
$('playground').hidden = false; setTool('inspect'); refresh();
new ResizeObserver(() => {
  const width = Math.max(320, Math.round(canvas.getBoundingClientRect().width * Math.min(devicePixelRatio || 1, 2)));
  canvas.width = width; canvas.height = width; draw();
}).observe(canvas);
