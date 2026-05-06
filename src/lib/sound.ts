let ctx: AudioContext | null = null;
type AudioWindow = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

function getCtx() {
  const AudioContextCtor = window.AudioContext || (window as AudioWindow).webkitAudioContext;
  if (!AudioContextCtor) throw new Error('Web Audio API is not available.');
  if (!ctx) ctx = new AudioContextCtor();
  return ctx;
}

export function tick() {
  try {
    const c = getCtx();
    const o = c.createOscillator();
    const g = c.createGain();
    o.frequency.value = 800;
    o.type = 'sine';
    g.gain.value = 0.04;
    o.connect(g).connect(c.destination);
    o.start();
    o.stop(c.currentTime + 0.05);
  } catch {
    return;
  }
}

export function chime() {
  try {
    const c = getCtx();
    const notes = [261.63, 329.63, 392.0];
    notes.forEach((f, i) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.frequency.value = f;
      o.type = 'sine';
      const t = c.currentTime + i * 0.18;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.08, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      o.connect(g).connect(c.destination);
      o.start(t);
      o.stop(t + 0.55);
    });
  } catch {
    return;
  }
}
