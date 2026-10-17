/* ============================================================
   sound.js — tiny Web Audio synth for game sound effects.
   No audio files: every sound is generated on the fly, so the
   game stays dependency-free and works offline.
   ============================================================ */

const Sound = {
  ctx: null,
  master: null,
  enabled: true,
  failed: false,

  load() {
    try {
      const saved = localStorage.getItem('hearts-sound');
      if (saved === 'off') this.enabled = false;
    } catch (e) { /* ignore */ }
  },

  save() {
    try { localStorage.setItem('hearts-sound', this.enabled ? 'on' : 'off'); } catch (e) { /* ignore */ }
  },

  // Lazily create/resume the AudioContext. Must be called from a user gesture
  // the first time (browser autoplay policy).
  ensure() {
    if (this.failed) return false;
    try {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) { this.failed = true; return false; }
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.9;
        this.master.connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return true;
    } catch (e) {
      this.failed = true;
      return false;
    }
  },

  setEnabled(on) {
    this.enabled = on;
    this.save();
    if (on) this.ensure();
  },
  toggle() { this.setEnabled(!this.enabled); return this.enabled; },

  // One tone with a quick attack/decay envelope.
  tone({ freq = 440, dur = 0.12, type = 'sine', gain = 0.15, when = 0, glideTo = null }) {
    const ctx = this.ctx;
    const t = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, glideTo), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + dur + 0.03);
  },

  play(name) {
    if (!this.enabled) return;
    if (!this.ensure()) return;
    try {
    switch (name) {
      case 'card':
        this.tone({ freq: 300, glideTo: 190, type: 'triangle', dur: 0.06, gain: 0.12 });
        break;
      case 'pass':
        this.tone({ freq: 200, glideTo: 380, type: 'triangle', dur: 0.10, gain: 0.10 });
        this.tone({ freq: 260, glideTo: 460, type: 'triangle', dur: 0.10, gain: 0.08, when: 0.06 });
        break;
      case 'trick':
        this.tone({ freq: 210, type: 'sine', dur: 0.13, gain: 0.10 });
        break;
      case 'points': // points landed on someone
        this.tone({ freq: 170, glideTo: 90, type: 'sine', dur: 0.22, gain: 0.16 });
        break;
      case 'moon': { // triumphant ascending arpeggio
        const notes = [523, 659, 784, 1046, 1318];
        notes.forEach((f, i) => this.tone({ freq: f, type: 'triangle', dur: 0.18, gain: 0.14, when: i * 0.10 }));
        break;
      }
      case 'win': {
        const notes = [523, 659, 784, 1046];
        notes.forEach((f, i) => this.tone({ freq: f, type: 'triangle', dur: 0.16, gain: 0.15, when: i * 0.11 }));
        // final chord
        [784, 1046, 1318].forEach(f => this.tone({ freq: f, type: 'sine', dur: 0.5, gain: 0.10, when: 0.46 }));
        break;
      }
      case 'lose':
        this.tone({ freq: 400, glideTo: 200, type: 'sawtooth', dur: 0.45, gain: 0.10 });
        break;
    }
    } catch (e) { /* never let audio break gameplay */ }
  },
};
