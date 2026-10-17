/**
 * CYBERVOID: OVERDRIVE - Procedural Audio Engine
 * Pure Web Audio API - Zero External Assets Required
 */
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.masterVolume = 0.8;
        this.sfxVolume = 0.85;
        this.musicVolume = 0.45;

        // Load saved preferences if available
        this.loadSettings();

        this.masterGain = null;
        this.sfxGain = null;
        this.musicGain = null;

        // Procedural music state
        this.musicRunning = false;
        this.musicTimer = null;
        this.currentStep = 0;
        this.bpm = 124;
        this.scale = [38, 41, 43, 45, 48, 50, 53, 55]; // D Minor pentatonic / dorian notes (MIDI numbers)
        this.rootFreq = 73.42; // D2
        this.musicIntensity = 1; // 1: normal, 2: heavy combat, 3: boss
        this.bassFilter = null;

        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();

            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);

            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
            this.sfxGain.connect(this.masterGain);

            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
            this.musicGain.connect(this.masterGain);

            this.initialized = true;
            this.startMusic();
        } catch (e) {
            console.warn('Web Audio not available or blocked:', e);
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    loadSettings() {
        try {
            const raw = localStorage.getItem('cybervoid_audio_settings');
            if (raw) {
                const cfg = JSON.parse(raw);
                if (typeof cfg.master === 'number') this.masterVolume = cfg.master;
                if (typeof cfg.sfx === 'number') this.sfxVolume = cfg.sfx;
                if (typeof cfg.music === 'number') this.musicVolume = cfg.music;
                if (typeof cfg.muted === 'boolean') this.isMuted = cfg.muted;
            }
        } catch (e) {}
    }

    saveSettings() {
        try {
            localStorage.setItem('cybervoid_audio_settings', JSON.stringify({
                master: this.masterVolume,
                sfx: this.sfxVolume,
                music: this.musicVolume,
                muted: this.isMuted
            }));
        } catch (e) {}
    }

    setMasterVolume(val) {
        this.masterVolume = Math.max(0, Math.min(1, parseFloat(val)));
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime, 0.05);
        }
        this.saveSettings();
    }

    setSfxVolume(val) {
        this.sfxVolume = Math.max(0, Math.min(1, parseFloat(val)));
        if (this.sfxGain && this.ctx) {
            this.sfxGain.gain.setTargetAtTime(this.sfxVolume, this.ctx.currentTime, 0.05);
        }
        this.saveSettings();
    }

    setMusicVolume(val) {
        this.musicVolume = Math.max(0, Math.min(1, parseFloat(val)));
        if (this.musicGain && this.ctx) {
            this.musicGain.gain.setTargetAtTime(this.musicVolume, this.ctx.currentTime, 0.05);
        }
        this.saveSettings();
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime, 0.05);
        }
        this.saveSettings();
        return this.isMuted;
    }

    playVictoryFanfare() {
        if (!this.ctx || this.isMuted) return;
        this.resume();
        const t = this.ctx.currentTime;

        // Ascending euphoric cyber synth fanfare (D - F - A - C - D - F - A - high D)
        const notes = [293.66, 369.99, 440.00, 587.33, 739.99, 880.00, 1174.66];
        notes.forEach((freq, idx) => {
            const time = t + idx * 0.12;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, time);

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(3200, time);

            gain.gain.setValueAtTime(0.24, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.45);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(time);
            osc.stop(time + 0.45);
        });

        // Sub bass explosion
        const sub = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(140, t);
        sub.frequency.exponentialRampToValueAtTime(35, t + 1.2);
        subGain.gain.setValueAtTime(0.6, t);
        subGain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
        sub.connect(subGain);
        subGain.connect(this.sfxGain);
        sub.start(t);
        sub.stop(t + 1.2);
    }

    // Helper: create white noise buffer
    createNoiseBuffer(duration = 0.5) {
        if (!this.ctx) return null;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        return buffer;
    }

    // === SFX METHODS ===

    playShoot(weaponType = 'pistol') {
        if (!this.ctx || this.isMuted) return;
        this.resume();
        const t = this.ctx.currentTime;

        switch (weaponType) {
            case 'pistol': {
                // Crisp laser blast
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(680, t);
                osc.frequency.exponentialRampToValueAtTime(110, t + 0.12);

                gain.gain.setValueAtTime(0.28, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

                osc.connect(gain);
                gain.connect(this.sfxGain);

                osc.start(t);
                osc.stop(t + 0.12);
                break;
            }

            case 'shotgun': {
                // Heavy explosive spread with noise burst
                const noise = this.ctx.createBufferSource();
                noise.buffer = this.createNoiseBuffer(0.25);
                const filter = this.ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(1200, t);
                filter.frequency.exponentialRampToValueAtTime(180, t + 0.22);

                const nGain = this.ctx.createGain();
                nGain.gain.setValueAtTime(0.45, t);
                nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

                noise.connect(filter);
                filter.connect(nGain);
                nGain.connect(this.sfxGain);

                // Sub bass punch
                const osc = this.ctx.createOscillator();
                const oscGain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(160, t);
                osc.frequency.exponentialRampToValueAtTime(40, t + 0.18);
                oscGain.gain.setValueAtTime(0.5, t);
                oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

                osc.connect(oscGain);
                oscGain.connect(this.sfxGain);

                noise.start(t);
                osc.start(t);
                osc.stop(t + 0.22);
                break;
            }

            case 'railgun': {
                // Electric crack + high piercing laser
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(1400, t);
                osc.frequency.exponentialRampToValueAtTime(220, t + 0.35);

                const filter = this.ctx.createBiquadFilter();
                filter.type = 'bandpass';
                filter.frequency.setValueAtTime(1800, t);
                filter.Q.value = 4;

                gain.gain.setValueAtTime(0.4, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

                osc.connect(filter);
                filter.connect(gain);
                gain.connect(this.sfxGain);

                osc.start(t);
                osc.stop(t + 0.35);
                break;
            }

            case 'missile': {
                // Rocket ignition whoosh
                const noise = this.ctx.createBufferSource();
                noise.buffer = this.createNoiseBuffer(0.2);
                const filter = this.ctx.createBiquadFilter();
                filter.type = 'bandpass';
                filter.frequency.setValueAtTime(300, t);
                filter.frequency.linearRampToValueAtTime(800, t + 0.18);

                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(0.35, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

                noise.connect(filter);
                filter.connect(gain);
                gain.connect(this.sfxGain);
                noise.start(t);
                break;
            }

            case 'tesla': {
                // Electric arc sizzle
                const osc1 = this.ctx.createOscillator();
                const osc2 = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc1.type = 'sawtooth';
                osc2.type = 'square';
                osc1.frequency.setValueAtTime(420 + Math.random() * 80, t);
                osc2.frequency.setValueAtTime(840 + Math.random() * 120, t);

                gain.gain.setValueAtTime(0.25, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);

                osc1.connect(gain);
                osc2.connect(gain);
                gain.connect(this.sfxGain);

                osc1.start(t);
                osc2.start(t);
                osc1.stop(t + 0.14);
                osc2.stop(t + 0.14);
                break;
            }

            case 'flamer': {
                // Hissing flame burst
                const noise = this.ctx.createBufferSource();
                noise.buffer = this.createNoiseBuffer(0.12);
                const filter = this.ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(900, t);

                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(0.15, t);
                gain.gain.linearRampToValueAtTime(0.01, t + 0.12);

                noise.connect(filter);
                filter.connect(gain);
                gain.connect(this.sfxGain);
                noise.start(t);
                break;
            }

            case 'vortex': {
                // Gravitational warble
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(140, t);
                osc.frequency.exponentialRampToValueAtTime(480, t + 0.25);

                gain.gain.setValueAtTime(0.35, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

                osc.connect(gain);
                gain.connect(this.sfxGain);
                osc.start(t);
                osc.stop(t + 0.25);
                break;
            }
        }
    }

    playHitMarker(isCrit = false) {
        if (!this.ctx || this.isMuted) return;
        this.resume();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = isCrit ? 'triangle' : 'sine';
        const freq = isCrit ? 1200 : 880;
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, t + 0.05);

        gain.gain.setValueAtTime(isCrit ? 0.25 : 0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.05);
    }

    playExplosion(large = false) {
        if (!this.ctx || this.isMuted) return;
        this.resume();
        const t = this.ctx.currentTime;
        const dur = large ? 0.6 : 0.3;

        // Noise boom
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(dur);
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(large ? 600 : 900, t);
        filter.frequency.exponentialRampToValueAtTime(40, t + dur);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(large ? 0.6 : 0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        // Sub thud
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(large ? 120 : 160, t);
        osc.frequency.exponentialRampToValueAtTime(25, t + dur * 0.7);

        oscGain.gain.setValueAtTime(large ? 0.7 : 0.4, t);
        oscGain.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.7);

        osc.connect(oscGain);
        oscGain.connect(this.sfxGain);

        noise.start(t);
        osc.start(t);
        osc.stop(t + dur);
    }

    playDash() {
        if (!this.ctx || this.isMuted) return;
        this.resume();
        const t = this.ctx.currentTime;

        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(0.2);
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400, t);
        filter.frequency.exponentialRampToValueAtTime(300, t + 0.18);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        noise.start(t);
    }

    playPlayerHit() {
        if (!this.ctx || this.isMuted) return;
        this.resume();
        const t = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, t);
        osc.frequency.linearRampToValueAtTime(40, t + 0.2);

        gain.gain.setValueAtTime(0.45, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.2);
    }

    playShieldHit() {
        if (!this.ctx || this.isMuted) return;
        this.resume();
        const t = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(750, t);
        osc.frequency.exponentialRampToValueAtTime(450, t + 0.15);

        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.15);
    }

    playShieldBreak() {
        if (!this.ctx || this.isMuted) return;
        this.resume();
        const t = this.ctx.currentTime;

        // Crystalline shatter
        [600, 920, 1400, 1850].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.6, t + 0.25 + idx * 0.05);

            gain.gain.setValueAtTime(0.2, t + idx * 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25 + idx * 0.05);

            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t + idx * 0.02);
            osc.stop(t + 0.35);
        });
    }

    playGemPickup(combo = 1) {
        if (!this.ctx || this.isMuted) return;
        this.resume();
        const t = this.ctx.currentTime;

        const pitchMult = Math.min(2.5, 1 + (combo - 1) * 0.08);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        const base = 587.33 * pitchMult; // D5
        osc.frequency.setValueAtTime(base, t);
        osc.frequency.exponentialRampToValueAtTime(base * 1.5, t + 0.08);

        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.08);
    }

    playLevelUp() {
        if (!this.ctx || this.isMuted) return;
        this.resume();
        const t = this.ctx.currentTime;

        const notes = [440, 554.37, 659.25, 880]; // A major arpeggio
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t + i * 0.08);

            gain.gain.setValueAtTime(0.28, t + i * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.35);

            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t + i * 0.08);
            osc.stop(t + i * 0.08 + 0.35);
        });
    }

    playActiveReloadTick() {
        if (!this.ctx || this.isMuted) return;
        this.resume();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(700, t);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.04);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.04);
    }

    playActiveReloadSuccess() {
        if (!this.ctx || this.isMuted) return;
        this.resume();
        const t = this.ctx.currentTime;
        [880, 1320, 1760].forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t + i * 0.04);
            gain.gain.setValueAtTime(0.25, t + i * 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.04 + 0.18);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(t + i * 0.04);
            osc.stop(t + i * 0.04 + 0.18);
        });
    }

    playBossAlert() {
        if (!this.ctx || this.isMuted) return;
        this.resume();
        const t = this.ctx.currentTime;

        // Ominous cyber alarm
        [0, 0.4, 0.8].forEach(offset => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, t + offset);
            osc.frequency.linearRampToValueAtTime(140, t + offset + 0.3);

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, t + offset);

            gain.gain.setValueAtTime(0.4, t + offset);
            gain.gain.exponentialRampToValueAtTime(0.01, t + offset + 0.35);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(t + offset);
            osc.stop(t + offset + 0.35);
        });
    }

    playEmpBlast() {
        if (!this.ctx || this.isMuted) return;
        this.resume();
        const t = this.ctx.currentTime;

        // Massive electric shockwave + lowpass sweep
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1200, t);
        osc.frequency.exponentialRampToValueAtTime(30, t + 0.8);

        gain.gain.setValueAtTime(0.7, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.8);
    }

    // === PROCEDURAL SYNTHWAVE MUSIC GENERATOR ===

    setCombatIntensity(level) {
        this.musicIntensity = level; // 1: calm/normal, 2: swarm/heavy, 3: boss
        if (this.musicIntensity === 3) {
            this.bpm = 132;
        } else if (this.musicIntensity === 2) {
            this.bpm = 126;
        } else {
            this.bpm = 120;
        }
    }

    startMusic() {
        if (this.musicRunning || !this.ctx) return;
        this.musicRunning = true;
        this.currentStep = 0;
        this.scheduleMusicStep();
    }

    stopMusic() {
        this.musicRunning = false;
        if (this.musicTimer) {
            clearTimeout(this.musicTimer);
            this.musicTimer = null;
        }
    }

    scheduleMusicStep() {
        if (!this.musicRunning || !this.ctx) return;

        const secondsPerBeat = 60.0 / this.bpm;
        const stepTime = secondsPerBeat / 4; // 16th notes
        const now = this.ctx.currentTime;

        this.renderStep(this.currentStep, now);

        this.currentStep = (this.currentStep + 1) % 64; // 4-bar loop

        this.musicTimer = setTimeout(() => {
            this.scheduleMusicStep();
        }, stepTime * 1000);
    }

    renderStep(step, time) {
        if (this.isMuted) return;

        const beat = Math.floor(step / 4);
        const subStep = step % 4;

        // 1. Kick Drum (On beats 0, 1, 2, 3 in 4/4)
        if (subStep === 0) {
            this.triggerKick(time);
        }

        // 2. Snare / Clap (On beats 1 and 3)
        if (subStep === 0 && (beat % 4 === 1 || beat % 4 === 3)) {
            this.triggerSnare(time);
        }

        // 3. Hi-Hat (Every 16th note with velocity variation)
        const hatVelocity = subStep === 2 ? 0.08 : 0.04;
        if (this.musicIntensity >= 2 || subStep % 2 === 0) {
            this.triggerHiHat(time, hatVelocity);
        }

        // 4. Rolling Cyber Synth Bass (Every 16th note, sidechained/pumping)
        this.triggerBass(step, time);

        // 5. Synth Arp / Lead (Plays in heavy combat or boss fights)
        if (this.musicIntensity >= 2 && step % 2 === 0) {
            this.triggerArp(step, time);
        }
    }

    triggerKick(time) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(140, time);
        osc.frequency.exponentialRampToValueAtTime(32, time + 0.12);

        gain.gain.setValueAtTime(0.5, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start(time);
        osc.stop(time + 0.12);
    }

    triggerSnare(time) {
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(0.15);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1000, time);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.25, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);
        noise.start(time);
    }

    triggerHiHat(time, volume) {
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(0.04);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(7000, time);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(volume, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);
        noise.start(time);
    }

    triggerBass(step, time) {
        // D minor rolling 16th bassline: D, F, G, C patterns
        const bar = Math.floor(step / 16);
        let noteFreq = 73.42; // D2
        if (bar === 2) noteFreq = 65.41; // C2
        if (bar === 3) noteFreq = 87.31; // F2

        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(noteFreq, time);

        // Filter cutoff opens more during high intensity
        const cutoff = this.musicIntensity === 3 ? 1800 : (this.musicIntensity === 2 ? 1100 : 650);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(cutoff, time);
        filter.frequency.exponentialRampToValueAtTime(cutoff * 0.4, time + 0.1);
        filter.Q.value = 4;

        // Sidechain pump simulation (duck on downbeat kick)
        const isKickStep = (step % 4 === 0);
        const targetVol = isKickStep ? 0.12 : 0.22;
        gain.gain.setValueAtTime(targetVol, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        osc.start(time);
        osc.stop(time + 0.11);
    }

    triggerArp(step, time) {
        // Hypnotic synth arpeggiator
        const arpNotes = [293.66, 349.23, 440.00, 523.25, 587.33, 698.46]; // D4, F4, A4, C5, D5, F5
        const noteIndex = (step * 3) % arpNotes.length;
        const freq = arpNotes[noteIndex];

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.12, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start(time);
        osc.stop(time + 0.12);
    }
}

// Global audio singleton
window.audio = new SoundEngine();
