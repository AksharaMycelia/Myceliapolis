// Exercise actual room event handlers with a small DOM harness.
// This checks wiring and state transitions, not browser layout or painting.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { blueprint, readHash, preset, snapshotHash } from '../machines/engine.mjs';

test('relay controls preserve arrivals, replace edits and hand off exact worlds', async () => {
  const saved = new Map(), frames = new Map(); let frame = 0, now = 0;
  const install = (name, value) => {
    saved.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, { configurable: true, value });
  };
  const element = () => {
    const listeners = new Map();
    return { value: '', textContent: '', hidden: false, checked: false, disabled: false, width:640, height:640, children: [],
      classList: { toggle() {} },
      addEventListener: (name, fn) => listeners.set(name, fn),
      emit: (name, event = {}) => listeners.get(name)?.({ preventDefault() {}, ...event }),
      replaceChildren() { this.children = []; this.value = ''; },
      append(child) { this.children.push(child); if (this.children.length === 1) this.value = String(child.value); },
      get valueAsNumber() { return this.value === '' ? NaN : Number(this.value); },
      focus() { doc.activeElement = this; }, select() { this.selected = true; },
      getBoundingClientRect: () => ({ left:0, top:0, width:640, height:640 }),
      getContext: () => new Proxy({}, {get: () => () => {}}),
    };
  };
  const html = readFileSync(new URL('../relay/index.html', import.meta.url), 'utf8');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  const els = Object.fromEntries(ids.map(id => [id, element()]));
  els.tool.value = '1';
  const media = Object.assign(element(), { matches: false });
  const doc = Object.assign(element(), { hidden:false, documentElement:{}, getElementById: id => {
    assert.ok(els[id], 'room requests an ID present in HTML: ' + id); return els[id];
  }, createElement: () => element() });
  const win = element();
  const loc = { hash: snapshotHash(preset('solitary')), origin:'https://myceliapolis.com', pathname:'/relay/' };
  const tick = (ms = 100) => { now += ms; const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn(now)); };
  const exported = () => { els.read.emit('click'); return JSON.parse(els.blueprint.value); };
  try {
    install('document',doc); install('window',win); install('location',loc);
    install('history',{replaceState() {loc.hash='';}});
    install('matchMedia',() => media); install('getComputedStyle',() => ({getPropertyValue:() => '#000'}));
    install('performance',{now:() => now}); install('requestAnimationFrame',fn => {frames.set(++frame,fn); return frame;});
    install('cancelAnimationFrame',id => frames.delete(id));
    install('navigator',{clipboard:{writeText:async () => {throw Error('unavailable');}}});
    await import('../relay/room.mjs');
    assert.equal(els.work.hidden,false); assert.equal(frames.size,0);
    assert.match(els.origin.textContent,/from this link/);
    const original = exported(); assert.equal(original.tick,480);
    let prevented=false; els.skip.emit('click',{preventDefault(){prevented=true;}});
    assert.ok(prevented); assert.equal(doc.activeElement,els.work);
    assert.deepEqual(exported(), original, 'skip preserves a received world');

    els.rule.value='SS'; els['rule-form'].emit('submit');
    els.step.emit('click'); assert.equal(els.elapsed.textContent,'1');
    els.carry.emit('click'); const handed = els['world-link'].value;
    assert.equal(els.parcel.hidden,false);
    assert.deepEqual(blueprint(readHash(new URL(handed).hash)),exported());
    await els.copy.emit('click'); assert.equal(els['world-link'].selected,true,'clipboard failure selects a usable link');
    els.step.emit('click'); assert.equal(els.parcel.hidden,true);

    els.rewind.emit('click'); assert.equal(els.elapsed.textContent,'0');
    assert.equal(exported().creatures[0].rule,'SS');
    els.undo.emit('click'); assert.deepEqual(exported(),original);
    els.column.value=''; els.row.value='2'; els['tile-form'].emit('submit');
    assert.match(els.notice.textContent,/Columns and rows/); assert.deepEqual(exported(),original);
    els.tool.value='8'; els.column.value='0'; els.row.value='0'; els['tile-form'].emit('submit');
    assert.equal(exported().cells[0],'#');
    els.changed.emit('keydown',{key:'ArrowRight'}); assert.equal(els.column.value,1);
    els.changed.emit('keydown',{key:'Enter'}); const replacement=exported();
    assert.equal(replacement.cells[0],original.cells[0]); assert.equal(replacement.cells[1],'#');

    els.run.emit('click'); assert.equal(frames.size,1); tick();
    assert.ok(Number(els.elapsed.textContent)>0);
    doc.hidden=true; doc.emit('visibilitychange'); assert.equal(frames.size,0);
    const paused=els.elapsed.textContent; tick(60000); assert.equal(els.elapsed.textContent,paused);
    doc.hidden=false; doc.emit('visibilitychange'); assert.equal(frames.size,0);
    els.run.emit('click'); els['tile-form'].emit('focusin'); assert.equal(frames.size,0);
    els.run.emit('click'); media.matches=true; media.emit('change'); assert.equal(frames.size,0);
    const before=Number(els.elapsed.textContent); els.run.emit('click');
    assert.equal(Number(els.elapsed.textContent),before+64); assert.equal(frames.size,0);
    media.matches=false; els.run.emit('click');
    for (let i=0;i<25;i++) tick();
    assert.equal(Number(els.elapsed.textContent),before+128); assert.equal(frames.size,0,'batch stops by itself');

    const beforeBad=exported(); els.blueprint.value='{bad'; els.load.emit('click');
    assert.deepEqual(exported(),beforeBad,'failed import preserves the active world');
    els.blueprint.value=handed; els.load.emit('click');
    assert.equal(els.elapsed.textContent,'0'); assert.equal(els.parcel.hidden,true);
    assert.deepEqual(exported(),blueprint(readHash(new URL(handed).hash)));
    loc.hash='#world=%zz'; win.emit('hashchange');
    assert.equal(els.work.hidden,true); assert.equal(els['arrival-error'].hidden,false);
    els['use-seed'].emit('click'); assert.equal(els.work.hidden,false); assert.equal(loc.hash,'');
    assert.match(els.origin.textContent,/authored seed/);
  } finally {
    for (const [name, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis,name,descriptor); else delete globalThis[name];
    }
  }
});
