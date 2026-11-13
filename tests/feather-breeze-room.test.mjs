// Browser wiring without a rendering engine. Visual/touch QA remains separate.
import test from 'node:test';
import assert from 'node:assert/strict';

test('room controls, keyboard, visibility and reduced motion work together', async () => {
  const saved = new Map(), frames = new Map(); let id = 0, viewport, now = 0, rotations = [];
  const install = (name, value) => { saved.set(name, Object.getOwnPropertyDescriptor(globalThis, name)); Object.defineProperty(globalThis, name, { configurable: true, value }); };
  const element = () => {
    const listeners = new Map(), attributes = new Map(), classes = new Set();
    return { clientWidth: 400, hidden: true, textContent: '', offsetWidth: 160,
      classList: { add: c => classes.add(c), remove: c => classes.delete(c) },
      addEventListener: (name, fn) => listeners.set(name, fn),
      emit: (name, event = {}) => listeners.get(name)?.(event),
      setAttribute: (name, value) => attributes.set(name, value), attributes,
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 400 }),
    };
  };
  const elements = Object.fromEntries(['plume', 'feather', 'state', 'pause', 'gust', 'roll', 'restart', 'controls', 'dog'].map(n => [n, element()]));
  const gradient = { addColorStop() {} };
  const context = new Proxy({ createLinearGradient: () => gradient, rotate: a => rotations.push(a) }, { get: (o, key) => o[key] ?? (() => {}) });
  elements.feather.getContext = () => context;
  const media = Object.assign(element(), { matches: false });
  const doc = Object.assign(element(), { hidden: false, getElementById: id => elements[id], querySelector: () => elements.dog, documentElement: {} });
  try {
    install('document', doc); install('matchMedia', () => media);
    install('getComputedStyle', () => ({ getPropertyValue: () => '' }));
    install('devicePixelRatio', 1); install('Path2D', class { moveTo() {} lineTo() {} });
    install('requestAnimationFrame', fn => { frames.set(++id, fn); return id; });
    install('ResizeObserver', class { observe() {} });
    install('IntersectionObserver', class { constructor(fn) { viewport = fn; } observe() {} });
    await import('../feather/breeze/room.mjs');
    const tick = (ms = 16) => { now += ms; const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn(now)); };
    const key = k => elements.feather.emit('keydown', { key: k, preventDefault() {}, shiftKey: false });
    assert.equal(elements.plume.hidden, false); assert.equal(elements.controls.hidden, false);
    viewport([{ isIntersecting: true }]); tick();
    assert.equal(frames.size, 1, 'one animation loop');
    key('ArrowRight'); tick(); assert.equal(frames.size, 1);
    elements.gust.emit('click'); tick();
    for (let i = 0; i < 340; i++) tick(100);
    assert.ok(rotations.at(-1) < 0, 'the dog rolls autonomously');
    elements.pause.emit('click'); tick();
    assert.equal(frames.size, 0, 'rest stops automatic frames');
    assert.equal(elements.pause.attributes.get('aria-pressed'), 'true');
    key('ArrowLeft'); tick(); assert.equal(frames.size, 0);
    elements.pause.emit('click'); tick(); assert.equal(frames.size, 1);
    doc.hidden = true; doc.emit('visibilitychange'); tick(60000);
    assert.equal(frames.size, 0);
    doc.hidden = false; doc.emit('visibilitychange'); tick(60000);
    assert.ok(rotations.at(-1) < 0, 'no hidden-time roll catch-up');
    viewport([{ isIntersecting: false }]); tick(); assert.equal(frames.size, 0);
    viewport([{ isIntersecting: true }]); tick(); assert.equal(frames.size, 1);
    media.matches = true; media.emit('change'); tick(); assert.equal(frames.size, 0);
    assert.equal(elements.pause.disabled, true);
    elements.gust.emit('click'); tick(); assert.equal(frames.size, 0);
    elements.restart.emit('click'); tick(); assert.equal(rotations.at(-1), 0);
    assert.equal(elements.pause.textContent, 'அசைவின்றி');
    media.matches = false; media.emit('change'); tick(); assert.equal(frames.size, 1);
  } finally {
    for (const [name, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor); else delete globalThis[name];
    }
  }
});
