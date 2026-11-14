// Sound, only when asked for. A few sine voices; nothing recorded, nothing loaded.
export function voices(button, pitches) {
  let context = null, gains = [];
  const start = () => {
    context = new (window.AudioContext || window.webkitAudioContext)();
    gains = pitches.map(hz => {
      const osc = context.createOscillator(), gain = context.createGain();
      osc.type = 'sine'; osc.frequency.value = hz; gain.gain.value = 0;
      osc.connect(gain).connect(context.destination); osc.start();
      return { osc, gain };
    });
  };
  const on = () => button.getAttribute('aria-pressed') === 'true';
  button.hidden = false;
  button.addEventListener('click', () => {
    if (!context) start();
    const next = !on();
    button.setAttribute('aria-pressed', String(next));
    if (next) context.resume(); else { for (const { gain } of gains) gain.gain.setTargetAtTime(0, context.currentTime, 0.05); }
  });
  document.addEventListener('visibilitychange', () => { if (context && document.hidden) for (const { gain } of gains) gain.gain.setTargetAtTime(0, context.currentTime, 0.05); });
  return {
    on,
    // Set each voice's loudness (0–1 of a quiet ceiling) and, optionally, its pitch.
    set(levels, bends = []) {
      if (!context || !on() || document.hidden) return;
      gains.forEach(({ osc, gain }, i) => {
        gain.gain.setTargetAtTime(Math.max(0, Math.min(1, levels[i] || 0)) * 0.05, context.currentTime, 0.25);
        if (bends[i]) osc.frequency.setTargetAtTime(bends[i], context.currentTime, 0.4);
      });
    },
  };
}
