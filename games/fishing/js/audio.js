// Tiny WebAudio blips -- no assets, no network, nothing to load.
// The context stays suspended until the first user gesture, which is what
// browsers require anyway.

let ctx = null;
let master = null;
let muted = false;

function ensure() {
  if (ctx) return ctx;
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  try {
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.22;
    master.connect(ctx.destination);
  } catch {
    ctx = null;
  }
  return ctx;
}

export function unlock() {
  const c = ensure();
  if (c && c.state === 'suspended') c.resume().catch(() => {});
}

export function setMuted(v) {
  muted = v;
  if (master) master.gain.value = v ? 0 : 0.22;
}

export function isMuted() {
  return muted;
}

function tone({ freq = 440, to = null, dur = 0.14, type = 'sine', gain = 1, delay = 0 }) {
  const c = ensure();
  if (!c || muted) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (to != null) osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function noise({ dur = 0.25, gain = 0.5, delay = 0, cutoff = 1200 }) {
  const c = ensure();
  if (!c || muted) return;
  const t0 = c.currentTime + delay;
  const frames = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, frames, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  const src = c.createBufferSource();
  src.buffer = buf;
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = cutoff;
  const g = c.createGain();
  g.gain.value = gain;
  src.connect(lp).connect(g).connect(master);
  src.start(t0);
}

export const sfx = {
  cast:    () => { tone({ freq: 900, to: 380, dur: 0.18, type: 'triangle', gain: 0.35 }); },
  splash:  () => { noise({ dur: 0.32, gain: 0.45, cutoff: 900 }); tone({ freq: 220, to: 120, dur: 0.2, type: 'sine', gain: 0.25 }); },
  bite:    () => { tone({ freq: 660, dur: 0.08, type: 'square', gain: 0.3 }); tone({ freq: 880, dur: 0.1, type: 'square', gain: 0.3, delay: 0.1 }); },
  hook:    () => { tone({ freq: 300, to: 720, dur: 0.16, type: 'sawtooth', gain: 0.3 }); },
  tick:    () => { tone({ freq: 520, dur: 0.04, type: 'square', gain: 0.12 }); },
  reel:    () => { tone({ freq: 180, dur: 0.05, type: 'sawtooth', gain: 0.08 }); },
  caught:  () => { [523, 659, 784, 1046].forEach((f, i) => tone({ freq: f, dur: 0.16, type: 'triangle', gain: 0.32, delay: i * 0.075 })); },
  jackpot: () => { [523, 659, 784, 1046, 1318].forEach((f, i) => tone({ freq: f, dur: 0.3, type: 'triangle', gain: 0.34, delay: i * 0.09 })); },
  escape:  () => { tone({ freq: 400, to: 130, dur: 0.4, type: 'sawtooth', gain: 0.3 }); },
  buy:     () => { tone({ freq: 700, dur: 0.09, type: 'square', gain: 0.25 }); tone({ freq: 1050, dur: 0.14, type: 'square', gain: 0.25, delay: 0.09 }); },
  deny:    () => { tone({ freq: 200, to: 150, dur: 0.18, type: 'square', gain: 0.25 }); },
};
