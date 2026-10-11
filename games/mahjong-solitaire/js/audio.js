/**
 * Small Web Audio synth for the click, match, error and win cues.
 *
 * Two things this guards against: a context created before any gesture starts
 * suspended, and a suspended context freezes `currentTime`, so nothing that
 * derives timing from it can be trusted until `state === 'running'`.
 */

let ctx = null;
let master = null;
let enabled = true;

function ensure() {
  if (!ctx) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0.22;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx.state === 'running' ? ctx : null;
}

export function setEnabled(on) {
  enabled = on;
}

export function isEnabled() {
  return enabled;
}

/** Called from the first real pointer/key event so the context can start. */
export function unlock() {
  if (!enabled) return;
  ensure();
}

function tone({ freq, dur = 0.12, type = 'sine', gain = 1, delay = 0, slide = 0 }) {
  const c = ensure();
  if (!c) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g);
  g.connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export const sfx = {
  select() {
    if (!enabled) return;
    tone({ freq: 620, dur: 0.07, type: 'triangle', gain: 0.5 });
  },
  match() {
    if (!enabled) return;
    tone({ freq: 740, dur: 0.1, type: 'triangle', gain: 0.6 });
    tone({ freq: 1108, dur: 0.16, type: 'triangle', gain: 0.45, delay: 0.06 });
  },
  reject() {
    if (!enabled) return;
    tone({ freq: 190, dur: 0.14, type: 'sawtooth', gain: 0.25, slide: -70 });
  },
  undo() {
    if (!enabled) return;
    tone({ freq: 420, dur: 0.1, type: 'sine', gain: 0.4, slide: -120 });
  },
  win() {
    if (!enabled) return;
    [523, 659, 784, 1047].forEach((f, i) => {
      tone({ freq: f, dur: 0.26, type: 'triangle', gain: 0.5, delay: i * 0.11 });
    });
  },
  stuck() {
    if (!enabled) return;
    [392, 330, 262].forEach((f, i) => {
      tone({ freq: f, dur: 0.22, type: 'sine', gain: 0.4, delay: i * 0.13 });
    });
  },
};
