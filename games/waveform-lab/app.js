(() => {
  'use strict';

  const els = Object.fromEntries([
    'waveform', 'gain', 'frequency', 'attack', 'decay', 'sustain', 'release',
    'cutoff', 'duration', 'scope', 'keyboard', 'wave-chip', 'frequency-readout',
    'gain-value', 'tuning-value', 'attack-value', 'decay-value', 'sustain-value',
    'release-value', 'cutoff-value', 'duration-value', 'status',
  ].map((id) => [id, document.getElementById(id)]));
  const scopeContext = els.scope.getContext('2d');
  const audio = { context: null, voices: new Map(), pending: new Map(), desired: new Set() };
  let previewTimer = 0;
  let previewGeneration = 0;
  const keyMap = new Map([
    ['a', 60], ['w', 61], ['s', 62], ['e', 63], ['d', 64], ['f', 65],
    ['t', 66], ['g', 67], ['y', 68], ['h', 69], ['u', 70], ['j', 71], ['k', 72],
  ]);
  const activeButtons = new Map();
  const noteNames = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];

  function readState() {
    return {
      waveform: els.waveform.value,
      gain: Number(els.gain.value),
      frequency: Number(els.frequency.value),
      attack: Number(els.attack.value),
      decay: Number(els.decay.value),
      sustain: Number(els.sustain.value),
      release: Number(els.release.value),
      cutoff: Number(els.cutoff.value),
      duration: Number(els.duration.value),
    };
  }

  function midiFrequency(midi) { return 440 * Math.pow(2, (midi - 69) / 12); }
  function midiLabel(midi) { return `${noteNames[midi % 12]}${Math.floor(midi / 12) - 1}`; }

  function makeKeyboard() {
    for (let midi = 60; midi <= 72; midi += 1) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `key ${[1, 3, 6, 8, 10].includes(midi % 12) ? 'black' : 'white'}`;
      button.textContent = midiLabel(midi);
      button.setAttribute('aria-label', `Play ${midiLabel(midi)}`);
      button.dataset.midi = String(midi);
      button.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        button.setPointerCapture(event.pointerId);
        startNote(`pointer-${event.pointerId}`, midiFrequency(midi), midi);
        button.classList.add('active');
        activeButtons.set(`pointer-${event.pointerId}`, button);
      });
      const release = (event) => stopNote(`pointer-${event.pointerId}`);
      button.addEventListener('pointerup', release);
      button.addEventListener('pointercancel', release);
      button.addEventListener('lostpointercapture', release);
      els.keyboard.appendChild(button);
    }
  }

  async function ensureAudio() {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) throw new Error('Web Audio is not available in this browser. WAV export still works.');
    if (!audio.context) audio.context = new Context();
    if (audio.context.state === 'suspended') await audio.context.resume();
    return audio.context;
  }

  function startNote(id, frequency, midi = null) {
    audio.desired.add(id);
    if (audio.voices.has(id)) return Promise.resolve(true);
    if (audio.pending.has(id)) return audio.pending.get(id);
    const operation = (async () => {
      try {
        const context = await ensureAudio();
        if (!audio.desired.has(id) || audio.voices.has(id)) return false;
        const patch = readState();
        const osc = context.createOscillator();
        const filter = context.createBiquadFilter();
        const volume = context.createGain();
        osc.type = patch.waveform;
        osc.frequency.setValueAtTime(frequency, context.currentTime);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(patch.cutoff, context.currentTime);
        filter.Q.setValueAtTime(0.7, context.currentTime);
        const now = context.currentTime;
        const peak = patch.gain;
        const attack = Math.max(0.005, patch.attack);
        const decay = Math.max(0.005, patch.decay);
        volume.gain.setValueAtTime(0, now);
        volume.gain.linearRampToValueAtTime(peak, now + attack);
        volume.gain.linearRampToValueAtTime(peak * patch.sustain, now + attack + decay);
        osc.connect(filter).connect(volume).connect(context.destination);
        osc.start(now);
        audio.voices.set(id, { osc, volume, midi });
        if (midi !== null) {
          els.frequency.value = String(Math.min(1046.5, Math.max(65.41, frequency)));
          updateLabels();
        }
        return true;
      } catch (error) {
        els.status.textContent = error.message;
        stopNote(id);
        return false;
      }
    })();
    audio.pending.set(id, operation);
    const cleanup = () => {
      if (audio.pending.get(id) === operation) audio.pending.delete(id);
    };
    operation.then(cleanup, cleanup);
    return operation;
  }

  function stopNote(id) {
    audio.desired.delete(id);
    const voice = audio.voices.get(id);
    if (voice) {
      const context = audio.context;
      const now = context.currentTime;
      const param = voice.volume.gain;
      const release = readState().release;
      if (typeof param.cancelAndHoldAtTime === 'function') {
        param.cancelAndHoldAtTime(now);
      } else {
        const value = param.value;
        param.cancelScheduledValues(now);
        param.setValueAtTime(value, now);
      }
      param.linearRampToValueAtTime(0, now + release);
      try { voice.osc.stop(now + release + 0.03); } catch (_error) { /* already stopped */ }
      audio.voices.delete(id);
    }
    const button = activeButtons.get(id);
    if (button) button.classList.remove('active');
    activeButtons.delete(id);
  }

  function stopAll() {
    for (const id of [...audio.desired]) stopNote(id);
    for (const id of [...audio.voices.keys()]) stopNote(id);
    document.querySelectorAll('.key.active').forEach((button) => button.classList.remove('active'));
    activeButtons.clear();
  }

  function drawScope() {
    const { width, height } = els.scope;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = els.scope.getBoundingClientRect();
    const backingW = Math.max(1, Math.round(rect.width * dpr));
    const backingH = Math.max(1, Math.round(rect.height * dpr));
    if (width !== backingW || height !== backingH) { els.scope.width = backingW; els.scope.height = backingH; }
    const w = els.scope.width;
    const h = els.scope.height;
    scopeContext.fillStyle = '#080b11';
    scopeContext.fillRect(0, 0, w, h);
    scopeContext.strokeStyle = '#273145';
    scopeContext.lineWidth = 1;
    for (let i = 1; i < 8; i += 1) {
      const x = Math.round(w * i / 8);
      scopeContext.beginPath(); scopeContext.moveTo(x, 0); scopeContext.lineTo(x, h); scopeContext.stroke();
    }
    scopeContext.beginPath(); scopeContext.moveTo(0, h / 2); scopeContext.lineTo(w, h / 2); scopeContext.stroke();
    const waveform = els.waveform.value;
    scopeContext.strokeStyle = '#9fe8d6';
    scopeContext.lineWidth = Math.max(2, dpr * 1.5);
    scopeContext.shadowColor = '#66e0cc88';
    scopeContext.shadowBlur = 12 * dpr;
    scopeContext.beginPath();
    for (let x = 0; x < w; x += 1) {
      const phase = x / Math.max(1, w - 1);
      const value = sampleWave(waveform, phase);
      const y = h / 2 - value * h * 0.37;
      if (x === 0) scopeContext.moveTo(x, y); else scopeContext.lineTo(x, y);
    }
    scopeContext.stroke();
    scopeContext.shadowBlur = 0;
  }

  function sampleWave(type, phase) {
    if (type === 'sine') return Math.sin(phase * Math.PI * 2);
    if (type === 'triangle') return 1 - 4 * Math.abs(Math.round(phase - 0.25) - (phase - 0.25));
    if (type === 'sawtooth') return 2 * (phase - Math.floor(phase + 0.5));
    return Math.sin(phase * Math.PI * 2) >= 0 ? 1 : -1;
  }

  function updateLabels() {
    const patch = readState();
    const midi = Math.round(69 + 12 * Math.log2(patch.frequency / 440));
    els['wave-chip'].textContent = patch.waveform.toUpperCase();
    els['frequency-readout'].textContent = `${midiLabel(midi)} · ${patch.frequency.toFixed(2)} Hz`;
    els['gain-value'].textContent = patch.gain.toFixed(2);
    els['tuning-value'].textContent = `${patch.frequency.toFixed(2)} Hz`;
    els['attack-value'].textContent = `${patch.attack.toFixed(3)} s`;
    els['decay-value'].textContent = `${patch.decay.toFixed(3)} s`;
    els['sustain-value'].textContent = patch.sustain.toFixed(2);
    els['release-value'].textContent = `${patch.release.toFixed(2)} s`;
    els['cutoff-value'].textContent = patch.cutoff >= 1000 ? `${(patch.cutoff / 1000).toFixed(1)} kHz` : `${Math.round(patch.cutoff)} Hz`;
    els['duration-value'].textContent = `${patch.duration.toFixed(1)} s`;
    drawScope();
  }

  function renderWav() {
    const patch = readState();
    const sampleRate = 44100;
    const totalSeconds = patch.duration + patch.release;
    const sampleCount = Math.ceil(totalSeconds * sampleRate);
    const bytes = new ArrayBuffer(44 + sampleCount * 2);
    const view = new DataView(bytes);
    const writeText = (offset, text) => { for (let i = 0; i < text.length; i += 1) view.setUint8(offset + i, text.charCodeAt(i)); };
    writeText(0, 'RIFF'); view.setUint32(4, 36 + sampleCount * 2, true); writeText(8, 'WAVE');
    writeText(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true);
    view.setUint16(22, 1, true); view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true); view.setUint16(34, 16, true); writeText(36, 'data'); view.setUint32(40, sampleCount * 2, true);
    const alpha = 1 - Math.exp(-2 * Math.PI * Math.min(patch.cutoff, sampleRate * 0.45) / sampleRate);
    const envelopeAt = (noteTime) => {
      if (noteTime < patch.attack) return noteTime / patch.attack;
      if (noteTime < patch.attack + patch.decay) return 1 - (1 - patch.sustain) * ((noteTime - patch.attack) / patch.decay);
      return patch.sustain;
    };
    const gateLevel = envelopeAt(patch.duration);
    let filtered = 0;
    for (let i = 0; i < sampleCount; i += 1) {
      const time = i / sampleRate;
      const phase = (patch.frequency * time) % 1;
      const envelope = time < patch.duration
        ? envelopeAt(time)
        : gateLevel * Math.max(0, 1 - (time - patch.duration) / patch.release);
      const raw = sampleWave(patch.waveform, phase) * patch.gain * envelope;
      filtered += alpha * (raw - filtered);
      const sample = Math.max(-1, Math.min(1, Math.tanh(filtered * 1.35)));
      view.setInt16(44 + i * 2, sample < 0 ? sample * 32768 : sample * 32767, true);
    }
    download(new Blob([bytes], { type: 'audio/wav' }), `waveform-lab-${patch.waveform}.wav`);
    els.status.textContent = `Exported ${(totalSeconds).toFixed(2)} seconds of 44.1 kHz mono WAV locally.`;
  }

  function download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = filename; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  makeKeyboard();
  updateLabels();
  window.addEventListener('resize', drawScope, { passive: true });
  for (const control of [els.waveform, els.gain, els.frequency, els.attack, els.decay, els.sustain, els.release, els.cutoff, els.duration]) {
    control.addEventListener('input', updateLabels);
  }
  document.getElementById('play').addEventListener('click', async () => {
    const id = 'preview';
    const generation = ++previewGeneration;
    window.clearTimeout(previewTimer);
    stopNote(id);
    await startNote(id, readState().frequency);
    if (generation !== previewGeneration || !audio.voices.has(id)) return;
    const duration = readState().duration;
    previewTimer = window.setTimeout(() => {
      if (generation === previewGeneration) stopNote(id);
    }, duration * 1000);
    els.status.textContent = 'Playing the selected patch.';
  });
  document.getElementById('stop').addEventListener('click', () => {
    previewGeneration += 1;
    window.clearTimeout(previewTimer);
    stopAll();
    els.status.textContent = 'All notes released.';
  });
  document.getElementById('export').addEventListener('click', renderWav);

  window.addEventListener('keydown', (event) => {
    if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
    const target = event.target;
    if (target && target.matches('input, select, textarea, button')) return;
    const midi = keyMap.get(event.key.toLowerCase());
    if (midi === undefined) return;
    event.preventDefault();
    const id = `key-${event.key.toLowerCase()}`;
    startNote(id, midiFrequency(midi), midi);
    const button = els.keyboard.querySelector(`[data-midi="${midi}"]`);
    if (button) { button.classList.add('active'); activeButtons.set(id, button); }
  });
  window.addEventListener('keyup', (event) => {
    const id = `key-${event.key.toLowerCase()}`;
    stopNote(id);
  });
  window.addEventListener('blur', stopAll);
})();
