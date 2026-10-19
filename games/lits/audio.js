/**
 * ZenLITS Procedural Web Audio Synthesizer (木組み Kigumi & Bonshō)
 * Pure Web Audio API - zero external sound files.
 * Generates traditional Japanese timber joinery acoustics:
 * - Hinoki wood chisel tap
 * - Soft bamboo floor dot tick
 * - Wood planing slide resonance
 * - Harmonic Koto chord on valid tetromino placement
 * - Resonant bronze temple bell (Bonshō 梵鐘) at 108 Hz fundamental
 */

class ZenAudio {
  constructor() {
    this.ctx = null;
    this.muted = gameStorage.getItem('dragon-gaming.lits.muted') === 'true';
    this.masterGain = null;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.45, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
  }

  ensureContext() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    gameStorage.setItem('dragon-gaming.lits.muted', String(this.muted));
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(this.muted ? 0 : 0.45, now + 0.05);
    }
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  /**
   * Crisp chisel tap on timber block placement
   */
  playChisel() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const subOsc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.07);

    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(210, now);
    subOsc.frequency.exponentialRampToValueAtTime(55, now + 0.07);

    gain.gain.setValueAtTime(0.32, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    subOsc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    subOsc.start(now);
    osc.stop(now + 0.09);
    subOsc.stop(now + 0.09);
  }

  /**
   * Smooth bamboo tick for unshaded dot
   */
  playDot() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(720, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.04);

    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  /**
   * Subtle wooden slide on undo/reset
   */
  playUndo() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(95, now + 0.06);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  /**
   * Harmonic Koto chord when a chamber's tetromino is validated without conflict
   */
  playChime() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Japanese Insen pentatonic scale (A4, Bb4, D5, E5, G5)
    const notes = [440, 466.16, 587.33, 659.25, 783.99];
    const freq = notes[Math.floor(Math.random() * notes.length)];

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, now);
    filter.frequency.exponentialRampToValueAtTime(320, now + 0.55);

    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.58);
  }

  /**
   * Resonant bronze Buddhist temple bell (Bonshō 梵鐘)
   * Fundamental ~108 Hz with sacred overtones and long decaying resonance
   */
  playVictory() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const partials = [
      { ratio: 1.0, gain: 0.36, decay: 3.0 },
      { ratio: 1.98, gain: 0.22, decay: 2.5 },
      { ratio: 2.94, gain: 0.16, decay: 2.0 },
      { ratio: 4.18, gain: 0.11, decay: 1.6 },
      { ratio: 5.42, gain: 0.07, decay: 1.2 }
    ];

    const fundamental = 108.0;

    partials.forEach(p => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(fundamental * p.ratio, now);

      gain.gain.setValueAtTime(p.gain, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + p.decay);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + p.decay + 0.05);
    });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ZenAudio;
}
if (typeof window !== 'undefined') {
  window.ZenAudio = ZenAudio;
}
