(() => {
  'use strict';

  const WIDTH = 200;
  const HEIGHT = 140;
  const COUNT = WIDTH * HEIGHT;
  const MAX_SOURCES = 8;
  const TWO_PI = Math.PI * 2;
  const PRESETS = {
    double: { wavelength: 30, phase: 0, sources: [[0.38, 0.5, 0], [0.62, 0.5, 0]] },
    'out-of-phase': { wavelength: 30, phase: 180, sources: [[0.38, 0.5, 0], [0.62, 0.5, 0]] },
    array: { wavelength: 26, phase: 0, sources: [[0.24, 0.5, 0], [0.37, 0.5, 0], [0.5, 0.5, 0], [0.63, 0.5, 0], [0.76, 0.5, 0]] },
    ring: { wavelength: 25, phase: 0, sources: Array.from({ length: 6 }, (_, index) => {
      const angle = index / 6 * TWO_PI;
      return [0.5 + Math.cos(angle) * 0.18, 0.5 + Math.sin(angle) * 0.25, 0];
    }) },
    single: { wavelength: 34, phase: 0, sources: [[0.5, 0.5, 0]] },
  };
  const PALETTES = {
    tide: { label: 'Tidepool diverging map', colors: [[51, 104, 174], [8, 19, 28], [55, 194, 164]] },
    ember: { label: 'Ember diverging map', colors: [[227, 104, 64], [25, 14, 22], [255, 211, 122]] },
    orchid: { label: 'Orchid diverging map', colors: [[130, 103, 208], [17, 15, 32], [234, 123, 183]] },
    mono: { label: 'Monochrome diverging map', colors: [[143, 174, 202], [7, 15, 22], [238, 249, 247]] },
  };
  const $ = (id) => document.getElementById(id);
  const els = {
    canvas: $('field'), preset: $('preset'), wavelength: $('wavelength'), phase: $('phase'), speed: $('speed'), palette: $('palette'),
    wavelengthValue: $('wavelength-value'), phaseValue: $('phase-value'), speedValue: $('speed-value'), paletteLabel: $('palette-label'),
    run: $('play'), step: $('step'), reset: $('reset'), runState: $('run-state'), status: $('status'),
    sourceCount: $('source-count'), nodeShare: $('node-share'), contrast: $('contrast'),
  };
  const ctx = els.canvas.getContext('2d', { alpha: false });
  if (!ctx) { els.status.textContent = 'Canvas drawing is not available in this browser.'; return; }
  ctx.imageSmoothingEnabled = false;
  const image = ctx.createImageData(WIDTH, HEIGHT);
  let sources = [];
  let running = false;
  let animationId = 0;
  let dragSource = -1;
  let phaseTime = 0;
  let lastFrame = 0;
  let lastDraw = 0;
  let currentPreset = 'double';

  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

  function mix(a, b, amount) {
    return [
      Math.round(a[0] + (b[0] - a[0]) * amount),
      Math.round(a[1] + (b[1] - a[1]) * amount),
      Math.round(a[2] + (b[2] - a[2]) * amount),
    ];
  }

  const PALETTE_LUTS = Object.fromEntries(Object.entries(PALETTES).map(([key, palette]) => {
    const table = new Uint8Array(256 * 3);
    for (let index = 0; index < 256; index += 1) {
      const value = index / 255 * 2 - 1;
      const color = value < 0
        ? mix(palette.colors[0], palette.colors[1], value + 1)
        : mix(palette.colors[1], palette.colors[2], value);
      table.set(color, index * 3);
    }
    return [key, table];
  }));

  function updateLabels() {
    els.wavelengthValue.textContent = `${els.wavelength.value} px`;
    els.phaseValue.textContent = `${Number(els.phase.value)}°`;
    els.speedValue.textContent = `${Number(els.speed.value).toFixed(1)}×`;
    els.paletteLabel.textContent = (PALETTES[els.palette.value] || PALETTES.tide).label;
  }

  function loadPreset({ announce = true } = {}) {
    currentPreset = PRESETS[els.preset.value] ? els.preset.value : 'double';
    const preset = PRESETS[currentPreset];
    els.wavelength.value = String(preset.wavelength);
    els.phase.value = String(preset.phase);
    sources = preset.sources.map(([u, v, phase]) => ({ x: u * (WIDTH - 1), y: v * (HEIGHT - 1), phase }));
    phaseTime = 0;
    lastFrame = 0;
    lastDraw = 0;
    updateLabels();
    drawField();
    if (announce) setStatus(`${presetLabel(currentPreset)} loaded. Run it or adjust the controls.`);
  }

  function presetLabel(key) {
    return ({ double: 'Double source', 'out-of-phase': 'Out of phase', array: 'Five-emitter array', ring: 'Circular ring', single: 'Single emitter' })[key] || 'Wave preset';
  }

  function drawField() {
    const wavelength = Number(els.wavelength.value);
    const phaseOffset = Number(els.phase.value) * Math.PI / 180;
    const palette = PALETTE_LUTS[els.palette.value] || PALETTE_LUTS.tide;
    const pixels = image.data;
    let nodeCount = 0;
    let contrastSum = 0;
    for (let y = 0; y < HEIGHT; y += 1) {
      for (let x = 0; x < WIDTH; x += 1) {
        let amplitude = 0;
        if (sources.length) {
          for (let sourceIndex = 0; sourceIndex < sources.length; sourceIndex += 1) {
            const source = sources[sourceIndex];
            const dx = x - source.x;
            const dy = y - source.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const attenuation = 1 / Math.pow(1 + distance / 50, 0.24);
            const phase = (TWO_PI * distance / wavelength) - phaseTime + source.phase + (sourceIndex % 2 ? phaseOffset : 0);
            amplitude += Math.cos(phase) * attenuation;
          }
          amplitude = clamp(amplitude / sources.length, -1, 1);
        }
        if (Math.abs(amplitude) < 0.055) nodeCount += 1;
        contrastSum += Math.abs(amplitude);
        const tableOffset = Math.round((amplitude + 1) * 0.5 * 255) * 3;
        const pixelOffset = (y * WIDTH + x) * 4;
        pixels[pixelOffset] = palette[tableOffset];
        pixels[pixelOffset + 1] = palette[tableOffset + 1];
        pixels[pixelOffset + 2] = palette[tableOffset + 2];
        pixels[pixelOffset + 3] = 255;
      }
    }
    ctx.putImageData(image, 0, 0);
    drawSources();
    els.sourceCount.textContent = `${sources.length} / ${MAX_SOURCES}`;
    els.nodeShare.textContent = `${Math.round(nodeCount / COUNT * 100)}%`;
    els.contrast.textContent = `${Math.round(contrastSum / COUNT * 100)}%`;
    els.runState.textContent = running ? 'RUNNING' : 'PAUSED';
    els.run.textContent = running ? 'Ⅱ Pause waves' : '▶ Run waves';
    els.step.disabled = running;
  }

  function drawSources() {
    ctx.save();
    ctx.font = '8px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    sources.forEach((source, index) => {
      ctx.beginPath();
      ctx.arc(source.x, source.y, 4.2, 0, TWO_PI);
      ctx.fillStyle = index % 2 ? '#ffd18a' : '#d8fff3';
      ctx.fill();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = '#07131b';
      ctx.stroke();
      ctx.fillStyle = '#effaf5';
      ctx.fillText(`S${index + 1}`, source.x, source.y - 9);
    });
    ctx.restore();
  }

  function setStatus(message) { els.status.textContent = message; }

  function stepPhase() {
    phaseTime = (phaseTime + 0.35) % TWO_PI;
    drawField();
  }

  function tick(timestamp) {
    animationId = 0;
    if (!running) return;
    if (lastFrame) phaseTime += Math.min(0.05, (timestamp - lastFrame) / 1000) * Number(els.speed.value) * 4;
    lastFrame = timestamp;
    if (!lastDraw || timestamp - lastDraw >= 33) {
      drawField();
      lastDraw = timestamp;
    }
    animationId = window.requestAnimationFrame(tick);
  }

  function setRunning(value) {
    running = Boolean(value);
    if (running) {
      lastFrame = 0;
      lastDraw = 0;
      if (!animationId) animationId = window.requestAnimationFrame(tick);
    }
    drawField();
    setStatus(running ? 'Waves are traveling. Drag a source or tune wavelength and phase while they run.' : 'Paused. Step the phase or compare a different source arrangement.');
  }

  function pointerPosition(event) {
    const rect = els.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    return {
      x: clamp((event.clientX - rect.left) / rect.width * WIDTH, 0, WIDTH - 1),
      y: clamp((event.clientY - rect.top) / rect.height * HEIGHT, 0, HEIGHT - 1),
    };
  }

  function nearestSource(point) {
    let nearest = -1;
    let best = 12 * 12;
    sources.forEach((source, index) => {
      const dx = point.x - source.x;
      const dy = point.y - source.y;
      const distance = dx * dx + dy * dy;
      if (distance < best) { best = distance; nearest = index; }
    });
    return nearest;
  }

  els.run.addEventListener('click', () => setRunning(!running));
  els.step.addEventListener('click', () => {
    if (running) return;
    stepPhase();
    setStatus('Advanced one phase step.');
  });
  els.reset.addEventListener('click', () => loadPreset());
  els.preset.addEventListener('change', () => loadPreset());
  els.palette.addEventListener('change', () => { updateLabels(); drawField(); });
  [els.wavelength, els.phase].forEach((input) => input.addEventListener('input', () => { updateLabels(); drawField(); }));
  els.speed.addEventListener('input', updateLabels);
  els.canvas.addEventListener('pointerdown', (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    const point = pointerPosition(event);
    if (!point) return;
    event.preventDefault();
    if (typeof els.canvas.setPointerCapture === 'function' && event.pointerId !== undefined) els.canvas.setPointerCapture(event.pointerId);
    const hit = nearestSource(point);
    if (event.shiftKey && hit >= 0) {
      sources.splice(hit, 1);
      dragSource = -1;
      drawField();
      setStatus(sources.length ? 'Emitter removed. Add or move sources to reshape the field.' : 'All emitters removed. Click the field to add a new one.');
      return;
    }
    if (hit >= 0) {
      dragSource = hit;
      setStatus(`Dragging emitter S${hit + 1}.`);
      return;
    }
    if (sources.length >= MAX_SOURCES) { setStatus('The field supports up to eight emitters. Shift-click one to remove it.'); return; }
    sources.push({ x: point.x, y: point.y, phase: 0 });
    dragSource = sources.length - 1;
    drawField();
    setStatus(`Emitter S${sources.length} added. Drag it into place or add another.`);
  });
  els.canvas.addEventListener('pointermove', (event) => {
    if (dragSource < 0) return;
    const point = pointerPosition(event);
    if (!point) return;
    event.preventDefault();
    sources[dragSource].x = point.x;
    sources[dragSource].y = point.y;
    drawField();
  });
  const endDrag = () => { dragSource = -1; };
  els.canvas.addEventListener('pointerup', endDrag);
  els.canvas.addEventListener('pointercancel', endDrag);
  els.canvas.addEventListener('lostpointercapture', endDrag);
  document.addEventListener('keydown', (event) => {
    if (event.code !== 'Space') return;
    const tag = event.target && event.target.tagName;
    if (tag && ['INPUT', 'SELECT', 'BUTTON', 'TEXTAREA'].includes(tag)) return;
    event.preventDefault();
    setRunning(!running);
  });

  els.preset.value = currentPreset;
  updateLabels();
  loadPreset({ announce: false });
})();
