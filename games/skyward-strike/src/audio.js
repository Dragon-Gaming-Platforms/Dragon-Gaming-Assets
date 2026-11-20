// Tiny WebAudio synth. No files to load, so nothing to wait for.
export class Audio {
  constructor(muted = false) {
    this.ctx = null;
    this.muted = muted;
    this.master = null;
  }

  /** Must be called from a user gesture the first time. */
  unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.25;
      this.master.connect(this.ctx.destination);
    } catch {
      this.ctx = null;
    }
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.master) this.master.gain.value = muted ? 0 : 0.25;
  }

  tone({ freq = 440, to = freq, dur = 0.12, type = 'square', gain = 0.3, delay = 0 }) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (to !== freq) osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  noise({ dur = 0.3, gain = 0.4, cutoff = 900, delay = 0 }) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + delay;
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cutoff, t0);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filter).connect(g).connect(this.master);
    src.start(t0);
  }

  play(event) {
    switch (event.type) {
      case 'shoot':
        this.tone({ freq: 880, to: 520, dur: 0.05, type: 'square', gain: 0.08 });
        break;
      case 'hit':
        this.tone({ freq: 1400, to: 900, dur: 0.03, type: 'triangle', gain: 0.06 });
        break;
      case 'explode':
        this.noise({ dur: 0.26, gain: 0.3, cutoff: 1300 });
        break;
      case 'bossDown':
        this.noise({ dur: 1.1, gain: 0.5, cutoff: 900 });
        this.tone({ freq: 180, to: 40, dur: 0.9, type: 'sawtooth', gain: 0.25 });
        break;
      case 'playerHit':
        this.tone({ freq: 320, to: 70, dur: 0.45, type: 'sawtooth', gain: 0.3 });
        this.noise({ dur: 0.4, gain: 0.35, cutoff: 700 });
        break;
      case 'powerup':
        this.tone({ freq: 620, to: 1250, dur: 0.16, type: 'triangle', gain: 0.22 });
        this.tone({ freq: 930, to: 1560, dur: 0.14, type: 'triangle', gain: 0.14, delay: 0.07 });
        break;
      case 'bomb':
        this.noise({ dur: 0.8, gain: 0.5, cutoff: 500 });
        this.tone({ freq: 90, to: 30, dur: 0.7, type: 'sine', gain: 0.35 });
        break;
      case 'wave':
        this.tone({ freq: 520, to: 780, dur: 0.18, type: 'square', gain: 0.12 });
        break;
      case 'bossIncoming':
        this.tone({ freq: 220, to: 220, dur: 0.22, type: 'sawtooth', gain: 0.2 });
        this.tone({ freq: 180, to: 180, dur: 0.22, type: 'sawtooth', gain: 0.2, delay: 0.3 });
        this.tone({ freq: 150, to: 150, dur: 0.4, type: 'sawtooth', gain: 0.22, delay: 0.6 });
        break;
      case 'gameover':
        this.tone({ freq: 440, to: 110, dur: 1.2, type: 'sawtooth', gain: 0.25 });
        break;
      default:
        break;
    }
  }
}
