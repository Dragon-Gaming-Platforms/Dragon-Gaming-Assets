(() => {
  'use strict';

  const WIDTH = 180;
  const HEIGHT = 128;
  const LENGTH = WIDTH * HEIGHT;
  const DIFFUSION_A = 1;
  const DIFFUSION_B = 0.5;
  const STEP_SIZE = 1;
  const PRESETS = {
    spots: { feed: 0.0350, kill: 0.0620, seeds: [[0.24, 0.30], [0.50, 0.50], [0.75, 0.68], [0.27, 0.76], [0.78, 0.25]] },
    mitosis: { feed: 0.0367, kill: 0.0649, seeds: [[0.50, 0.50], [0.30, 0.34], [0.70, 0.66], [0.70, 0.34], [0.30, 0.66]] },
    coral: { feed: 0.0545, kill: 0.0620, seeds: [[0.50, 0.50], [0.25, 0.25], [0.75, 0.75], [0.75, 0.25], [0.25, 0.75]] },
    maze: { feed: 0.0290, kill: 0.0570, seeds: [[0.22, 0.28], [0.50, 0.50], [0.78, 0.72], [0.24, 0.78], [0.76, 0.25]] },
    waves: { feed: 0.0140, kill: 0.0540, seeds: [[0.50, 0.50], [0.22, 0.50], [0.78, 0.50], [0.50, 0.24], [0.50, 0.76]] },
  };
  const PALETTES = {
    tide: { label: 'Tidepool palette', colors: [[7, 18, 30], [23, 139, 145], [164, 238, 194]] },
    ember: { label: 'Ember palette', colors: [[22, 8, 18], [188, 45, 42], [255, 211, 117]] },
    moss: { label: 'Moss palette', colors: [[7, 20, 16], [49, 124, 66], [210, 231, 139]] },
    mono: { label: 'Monochrome palette', colors: [[8, 13, 21], [85, 127, 157], [239, 249, 248]] },
  };
  const $ = (id) => document.getElementById(id);
  const els = {
    canvas: $('field'),
    preset: $('preset'),
    feed: $('feed'),
    feedValue: $('feed-value'),
    kill: $('kill'),
    killValue: $('kill-value'),
    speed: $('speed'),
    speedValue: $('speed-value'),
    palette: $('palette'),
    paletteLabel: $('palette-label'),
    run: $('play'),
    step: $('step'),
    reset: $('reset'),
    runState: $('run-state'),
    status: $('status'),
    stepCount: $('step-count'),
    density: $('density'),
    seedCount: $('seed-count'),
  };
  const context = els.canvas.getContext('2d', { alpha: false });
  if (!context) {
    els.status.textContent = 'Canvas drawing is not available in this browser.';
    return;
  }
  const image = context.createImageData(WIDTH, HEIGHT);
  context.imageSmoothingEnabled = false;
  let chemicalA = new Float32Array(LENGTH);
  let chemicalB = new Float32Array(LENGTH);
  let nextA = new Float32Array(LENGTH);
  let nextB = new Float32Array(LENGTH);
  let running = false;
  let pointerDown = false;
  let steps = 0;
  let seeds = 0;
  let animationId = 0;
  let currentPreset = 'spots';

  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

  function setStatus(message) { els.status.textContent = message; }

  function updateControls() {
    els.feedValue.textContent = Number(els.feed.value).toFixed(4);
    els.killValue.textContent = Number(els.kill.value).toFixed(4);
    els.speedValue.textContent = `${els.speed.value}×`;
    const palette = PALETTES[els.palette.value] || PALETTES.tide;
    els.paletteLabel.textContent = palette.label;
  }

  function resetField({ announce = true } = {}) {
    chemicalA.fill(1);
    chemicalB.fill(0);
    steps = 0;
    seeds = 0;
    const recipe = PRESETS[currentPreset] || PRESETS.spots;
    recipe.seeds.forEach(([x, y], index) => {
      const cx = Math.round(x * (WIDTH - 1));
      const cy = Math.round(y * (HEIGHT - 1));
      stamp(cx, cy, false, 4 + (index % 2));
      seeds += 1;
    });
    drawField();
    if (announce) setStatus(`${labelForPreset(currentPreset)} pattern reset. Drag to seed new structures or adjust the chemistry.`);
  }

  function labelForPreset(key) {
    const labels = { spots: 'Spots & islands', mitosis: 'Mitosis', coral: 'Coral branches', maze: 'Maze channels', waves: 'Traveling waves' };
    return labels[key] || 'Reaction';
  }

  function stamp(centerX, centerY, erase, radius = 5) {
    const r2 = radius * radius;
    for (let dy = -radius; dy <= radius; dy += 1) {
      for (let dx = -radius; dx <= radius; dx += 1) {
        const distance2 = dx * dx + dy * dy;
        if (distance2 > r2) continue;
        const x = (centerX + dx + WIDTH) % WIDTH;
        const y = (centerY + dy + HEIGHT) % HEIGHT;
        const index = y * WIDTH + x;
        if (erase) {
          chemicalA[index] = 1;
          chemicalB[index] = 0;
        } else {
          const strength = 0.68 + 0.28 * (1 - distance2 / r2);
          chemicalA[index] = Math.min(chemicalA[index], 1 - strength * 0.78);
          chemicalB[index] = Math.max(chemicalB[index], strength);
        }
      }
    }
  }

  function seedFromPointer(event) {
    const rect = els.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = clamp(Math.floor((event.clientX - rect.left) / rect.width * WIDTH), 0, WIDTH - 1);
    const y = clamp(Math.floor((event.clientY - rect.top) / rect.height * HEIGHT), 0, HEIGHT - 1);
    stamp(x, y, event.shiftKey, event.shiftKey ? 7 : 5);
    if (!event.shiftKey) seeds += 1;
    drawField();
    setStatus(event.shiftKey ? 'A patch was rinsed back to reagent A.' : 'Reagent B seeded. Run the field to see what grows around it.');
  }

  function simulationStep() {
    const feed = Number(els.feed.value);
    const kill = Number(els.kill.value);
    for (let y = 0; y < HEIGHT; y += 1) {
      const up = (y + HEIGHT - 1) % HEIGHT;
      const down = (y + 1) % HEIGHT;
      const row = y * WIDTH;
      const rowUp = up * WIDTH;
      const rowDown = down * WIDTH;
      for (let x = 0; x < WIDTH; x += 1) {
        const left = (x + WIDTH - 1) % WIDTH;
        const right = (x + 1) % WIDTH;
        const index = row + x;
        const a = chemicalA[index];
        const b = chemicalB[index];
        const lapA = -a
          + 0.2 * (chemicalA[row + left] + chemicalA[row + right] + chemicalA[rowUp + x] + chemicalA[rowDown + x])
          + 0.05 * (chemicalA[rowUp + left] + chemicalA[rowUp + right] + chemicalA[rowDown + left] + chemicalA[rowDown + right]);
        const lapB = -b
          + 0.2 * (chemicalB[row + left] + chemicalB[row + right] + chemicalB[rowUp + x] + chemicalB[rowDown + x])
          + 0.05 * (chemicalB[rowUp + left] + chemicalB[rowUp + right] + chemicalB[rowDown + left] + chemicalB[rowDown + right]);
        const reaction = a * b * b;
        nextA[index] = clamp(a + (DIFFUSION_A * lapA - reaction + feed * (1 - a)) * STEP_SIZE, 0, 1);
        nextB[index] = clamp(b + (DIFFUSION_B * lapB + reaction - (kill + feed) * b) * STEP_SIZE, 0, 1);
      }
    }
    [chemicalA, nextA] = [nextA, chemicalA];
    [chemicalB, nextB] = [nextB, chemicalB];
    steps += 1;
  }

  function mix(first, second, amount) {
    return [
      Math.round(first[0] + (second[0] - first[0]) * amount),
      Math.round(first[1] + (second[1] - first[1]) * amount),
      Math.round(first[2] + (second[2] - first[2]) * amount),
    ];
  }

  const PALETTE_LUTS = Object.fromEntries(Object.entries(PALETTES).map(([key, palette]) => {
    const lookup = new Uint8Array(256 * 3);
    for (let index = 0; index < 256; index += 1) {
      const concentration = index / 255;
      const color = concentration < 0.52
        ? mix(palette.colors[0], palette.colors[1], concentration / 0.52)
        : mix(palette.colors[1], palette.colors[2], (concentration - 0.52) / 0.48);
      lookup.set(color, index * 3);
    }
    return [key, lookup];
  }));

  function drawField() {
    const colors = PALETTE_LUTS[els.palette.value] || PALETTE_LUTS.tide;
    const pixels = image.data;
    let densitySum = 0;
    for (let index = 0; index < LENGTH; index += 1) {
      const b = chemicalB[index];
      const a = chemicalA[index];
      const concentration = clamp(Math.pow(b * 1.45 + (1 - a) * 0.18, 0.84), 0, 1);
      const colorOffset = Math.round(concentration * 255) * 3;
      const offset = index * 4;
      pixels[offset] = colors[colorOffset];
      pixels[offset + 1] = colors[colorOffset + 1];
      pixels[offset + 2] = colors[colorOffset + 2];
      pixels[offset + 3] = 255;
      if (index % 16 === 0) densitySum += b;
    }
    context.putImageData(image, 0, 0);
    const sampleCount = Math.ceil(LENGTH / 16);
    els.stepCount.textContent = String(steps).padStart(6, '0');
    els.density.textContent = `${Math.round(densitySum / sampleCount * 100)}%`;
    els.seedCount.textContent = String(seeds);
    els.runState.textContent = running ? 'RUNNING' : 'PAUSED';
    els.run.textContent = running ? 'Ⅱ Pause field' : '▶ Run field';
    els.step.disabled = running;
  }

  function animationFrame() {
    animationId = 0;
    if (!running) return;
    const speed = Number(els.speed.value);
    for (let count = 0; count < speed; count += 1) simulationStep();
    drawField();
    animationId = window.requestAnimationFrame(animationFrame);
  }

  function setRunning(value) {
    running = Boolean(value);
    if (running && !animationId) animationId = window.requestAnimationFrame(animationFrame);
    drawField();
    setStatus(running ? 'The reaction is running. Drag to seed; shift-drag to erase a patch.' : 'Paused. Adjust a parameter, seed a new patch, or step once.');
  }

  function applyPreset() {
    currentPreset = PRESETS[els.preset.value] ? els.preset.value : 'spots';
    const recipe = PRESETS[currentPreset];
    els.feed.value = recipe.feed.toFixed(4);
    els.kill.value = recipe.kill.toFixed(4);
    updateControls();
    resetField({ announce: false });
    setStatus(`${labelForPreset(currentPreset)} loaded. Run it, then experiment with feed and kill rates.`);
  }

  els.run.addEventListener('click', () => setRunning(!running));
  els.step.addEventListener('click', () => {
    if (running) return;
    simulationStep();
    drawField();
    setStatus('Advanced one reaction step.');
  });
  els.reset.addEventListener('click', () => resetField());
  els.preset.addEventListener('change', applyPreset);
  els.palette.addEventListener('change', () => { updateControls(); drawField(); });
  [els.feed, els.kill].forEach((input) => input.addEventListener('input', () => { updateControls(); }));
  els.speed.addEventListener('input', updateControls);
  els.canvas.addEventListener('pointerdown', (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    event.preventDefault();
    pointerDown = true;
    if (typeof els.canvas.setPointerCapture === 'function' && event.pointerId !== undefined) els.canvas.setPointerCapture(event.pointerId);
    seedFromPointer(event);
  });
  els.canvas.addEventListener('pointermove', (event) => {
    if (!pointerDown) return;
    event.preventDefault();
    seedFromPointer(event);
  });
  const endPointer = () => { pointerDown = false; };
  els.canvas.addEventListener('pointerup', endPointer);
  els.canvas.addEventListener('pointercancel', endPointer);
  els.canvas.addEventListener('lostpointercapture', endPointer);
  document.addEventListener('keydown', (event) => {
    if (event.code !== 'Space') return;
    const tag = event.target && event.target.tagName;
    if (tag && ['INPUT', 'SELECT', 'BUTTON', 'TEXTAREA'].includes(tag)) return;
    event.preventDefault();
    setRunning(!running);
  });

  els.preset.value = currentPreset;
  updateControls();
  resetField({ announce: false });
})();
