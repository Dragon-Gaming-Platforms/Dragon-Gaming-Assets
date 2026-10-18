(() => {
  'use strict';

  const defaults = {
    mode: 'mandelbrot',
    centerX: -0.5,
    centerY: 0,
    span: 2.8,
    iterations: 220,
    palette: 'ember',
    juliaX: -0.745,
    juliaY: 0.186,
  };
  const presets = {
    classic: { centerX: -0.5, centerY: 0, span: 2.8 },
    seahorse: { centerX: -0.745, centerY: 0.112, span: 0.52 },
    elephant: { centerX: 0.285, centerY: 0.008, span: 0.52 },
    spiral: { centerX: -0.7453, centerY: 0.186, span: 0.027 },
  };
  const paletteNames = new Set(['ember', 'ocean', 'orchid', 'mono']);
  const canvas = document.getElementById('fractal');
  const context = canvas.getContext('2d', { alpha: false });
  const worker = new Worker('renderer.js');
  const modeInput = document.getElementById('mode');
  const iterationInput = document.getElementById('iterations');
  const paletteInput = document.getElementById('palette');
  const juliaFields = document.getElementById('julia-fields');
  const juliaXInput = document.getElementById('julia-x');
  const juliaYInput = document.getElementById('julia-y');
  const presetSection = document.querySelector('.preset-section');
  const iterationValue = document.getElementById('iteration-value');
  const status = document.getElementById('status');
  const renderDot = document.getElementById('render-dot');
  const renderLabel = document.getElementById('render-label');
  const renderTime = document.getElementById('render-time');
  const progress = document.getElementById('progress');
  const coordinates = document.getElementById('coordinates');
  const cursorPosition = document.getElementById('cursor-position');
  const stageName = document.getElementById('stage-name');
  const backButton = document.getElementById('back');
  const shareFallback = document.getElementById('share-fallback');
  const shareUrlInput = document.getElementById('share-url');

  const state = { ...defaults };
  const history = [];
  let requestId = 0;
  let renderTimer = 0;
  let renderStartedAt = 0;
  let drag = null;
  let activePreset = 'classic';

  readShareLink();
  setControlsFromState();
  updateReadout();
  resizeCanvas();
  scheduleRender(0);

  modeInput.addEventListener('change', () => {
    pushHistory();
    state.mode = modeInput.value;
    if (state.mode === 'julia') {
      state.centerX = 0;
      state.centerY = 0;
      state.span = 3;
    } else {
      Object.assign(state, presets.classic);
    }
    markPreset(state.mode === 'mandelbrot' ? 'classic' : null);
    updateControls();
    scheduleRender(0);
  });

  document.querySelectorAll('[data-preset]').forEach((button) => {
    button.addEventListener('click', () => {
      const presetName = button.dataset.preset;
      if (!presets[presetName]) return;
      pushHistory();
      state.mode = 'mandelbrot';
      Object.assign(state, presets[presetName]);
      markPreset(presetName);
      updateControls();
      scheduleRender(0);
    });
  });

  iterationInput.addEventListener('input', () => {
    state.iterations = clampInt(iterationInput.value, 80, 800);
    iterationValue.value = String(state.iterations);
    iterationValue.textContent = String(state.iterations);
    scheduleRender(80);
  });

  paletteInput.addEventListener('change', () => {
    state.palette = paletteNames.has(paletteInput.value) ? paletteInput.value : 'ember';
    scheduleRender(0);
  });

  juliaXInput.addEventListener('input', () => {
    state.juliaX = finiteOr(juliaXInput.value, defaults.juliaX);
    scheduleRender(90);
  });
  juliaYInput.addEventListener('input', () => {
    state.juliaY = finiteOr(juliaYInput.value, defaults.juliaY);
    scheduleRender(90);
  });

  document.getElementById('zoom-in').addEventListener('click', () => zoomAtCenter(0.58));
  document.getElementById('zoom-out').addEventListener('click', () => zoomAtCenter(1.72));
  document.getElementById('reset').addEventListener('click', resetView);
  backButton.addEventListener('click', goBack);
  document.getElementById('share').addEventListener('click', shareView);

  canvas.addEventListener('pointerdown', (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    canvas.focus({ preventScroll: true });
    canvas.setPointerCapture(event.pointerId);
    drag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      centerX: state.centerX,
      centerY: state.centerY,
      span: state.span,
      mode: state.mode,
      juliaX: state.juliaX,
      juliaY: state.juliaY,
      iterations: state.iterations,
      palette: state.palette,
      moved: false,
    };
  });

  canvas.addEventListener('pointermove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const normalizedX = (event.clientX - rect.left) / rect.width;
    const normalizedY = (event.clientY - rect.top) / rect.height;
    const worldX = state.centerX + (normalizedX - 0.5) * state.span * (canvas.width / canvas.height);
    const worldY = state.centerY + (0.5 - normalizedY) * state.span;
    cursorPosition.textContent = `cursor ${formatNumber(worldX)}, ${formatNumber(worldY)}`;

    if (!drag || drag.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) drag.moved = true;
    if (!drag.moved) return;

    state.centerX = drag.centerX - (deltaX / rect.width) * drag.span * (canvas.width / canvas.height);
    state.centerY = drag.centerY + (deltaY / rect.height) * drag.span;
    markPreset(null);
    updateReadout();
    scheduleRender(100);
  });

  const finishPointer = (event) => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const finishedDrag = drag;
    drag = null;
    if (finishedDrag.moved) {
      pushHistory({
        mode: finishedDrag.mode,
        centerX: finishedDrag.centerX,
        centerY: finishedDrag.centerY,
        span: finishedDrag.span,
        iterations: finishedDrag.iterations,
        palette: finishedDrag.palette,
        juliaX: finishedDrag.juliaX,
        juliaY: finishedDrag.juliaY,
      });
      scheduleRender(0);
    } else {
      pushHistory();
      zoomAt(event.clientX, event.clientY, 0.58);
    }
  };
  canvas.addEventListener('pointerup', finishPointer);
  canvas.addEventListener('pointercancel', finishPointer);

  canvas.addEventListener('wheel', (event) => {
    event.preventDefault();
    pushHistory();
    zoomAt(event.clientX, event.clientY, event.deltaY < 0 ? 0.78 : 1.28);
  }, { passive: false });

  window.addEventListener('keydown', (event) => {
    const target = event.target;
    if (target && target !== canvas && target.matches('input, select, textarea, button')) return;
    const key = event.key.toLowerCase();
    if (key === 'r') {
      event.preventDefault();
      resetView();
    } else if (key === '+' || key === '=') {
      event.preventDefault();
      zoomAtCenter(0.58);
    } else if (key === '-' || key === '_') {
      event.preventDefault();
      zoomAtCenter(1.72);
    } else if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown'].includes(key)) {
      event.preventDefault();
      pushHistory();
      const step = state.span * 0.12;
      if (key === 'arrowleft') state.centerX -= step * (canvas.width / canvas.height);
      if (key === 'arrowright') state.centerX += step * (canvas.width / canvas.height);
      if (key === 'arrowup') state.centerY += step;
      if (key === 'arrowdown') state.centerY -= step;
      markPreset(null);
      scheduleRender(0);
    }
  });

  window.addEventListener('resize', resizeCanvas, { passive: true });
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(canvas.parentElement);
  }

  worker.addEventListener('message', (event) => {
    const message = event.data;
    if (message.requestId !== requestId) return;
    if (message.type === 'progress') {
      progress.value = message.progress;
      renderLabel.textContent = `${Math.round(message.progress * 100)}%`;
      return;
    }
    if (message.type === 'done') {
      const image = new ImageData(new Uint8ClampedArray(message.pixels), message.width, message.height);
      context.putImageData(image, 0, 0);
      progress.value = 1;
      renderDot.classList.remove('busy');
      renderLabel.textContent = 'Ready';
      const elapsed = Math.max(0, (performance.now() - renderStartedAt) / 1000);
      renderTime.textContent = `Rendered in ${elapsed.toFixed(2)} s · ${state.iterations} max iterations`;
      status.textContent = 'View rendered locally. Click, drag, scroll or use the controls to keep exploring.';
      updateReadout();
    }
  });

  worker.addEventListener('error', () => {
    renderDot.classList.remove('busy');
    renderLabel.textContent = 'Error';
    status.textContent = 'The renderer stopped unexpectedly. Reload this page to try again.';
  });

  function scheduleRender(delay) {
    window.clearTimeout(renderTimer);
    renderTimer = window.setTimeout(render, delay);
  }

  function render() {
    requestId += 1;
    worker.postMessage({ type: 'cancel' });
    renderStartedAt = performance.now();
    renderDot.classList.add('busy');
    renderLabel.textContent = 'Rendering';
    progress.value = 0;
    status.textContent = 'Rendering a new view in a background browser worker…';
    updateReadout();
    worker.postMessage({
      type: 'render',
      requestId,
      width: canvas.width,
      height: canvas.height,
      centerX: state.centerX,
      centerY: state.centerY,
      span: state.span,
      mode: state.mode,
      juliaX: state.juliaX,
      juliaY: state.juliaY,
      iterations: state.iterations,
      palette: state.palette,
    });
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width) return;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = Math.max(320, Math.min(1200, Math.round(rect.width * pixelRatio)));
    const height = Math.round(width * 5 / 8);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      scheduleRender(40);
    }
  }

  function zoomAt(clientX, clientY, factor) {
    const rect = canvas.getBoundingClientRect();
    const normalizedX = (clientX - rect.left) / rect.width - 0.5;
    const normalizedY = 0.5 - (clientY - rect.top) / rect.height;
    const aspect = canvas.width / canvas.height;
    const anchorX = state.centerX + normalizedX * state.span * aspect;
    const anchorY = state.centerY + normalizedY * state.span;
    state.span = clamp(state.span * factor, 1e-12, 8);
    state.centerX = anchorX - normalizedX * state.span * aspect;
    state.centerY = anchorY - normalizedY * state.span;
    markPreset(null);
    scheduleRender(0);
  }

  function zoomAtCenter(factor) {
    pushHistory();
    const rect = canvas.getBoundingClientRect();
    zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, factor);
  }

  function pushHistory(snapshot = state) {
    history.push({ ...snapshot });
    if (history.length > 80) history.shift();
    backButton.disabled = history.length === 0;
  }

  function goBack() {
    const previous = history.pop();
    if (!previous) return;
    Object.assign(state, previous);
    backButton.disabled = history.length === 0;
    markPreset(null);
    updateControls();
    scheduleRender(0);
  }

  function resetView() {
    Object.assign(state, defaults);
    history.length = 0;
    backButton.disabled = true;
    markPreset('classic');
    shareFallback.hidden = true;
    updateControls();
    scheduleRender(0);
  }

  function markPreset(name) {
    activePreset = name;
    document.querySelectorAll('[data-preset]').forEach((button) => {
      button.setAttribute('aria-pressed', button.dataset.preset === name ? 'true' : 'false');
    });
  }

  function setControlsFromState() {
    modeInput.value = state.mode;
    iterationInput.value = String(state.iterations);
    iterationValue.value = String(state.iterations);
    iterationValue.textContent = String(state.iterations);
    paletteInput.value = state.palette;
    juliaXInput.value = String(state.juliaX);
    juliaYInput.value = String(state.juliaY);
    juliaFields.hidden = state.mode !== 'julia';
    presetSection.hidden = state.mode === 'julia';
  }

  function updateControls() {
    setControlsFromState();
    updateReadout();
  }

  function updateReadout() {
    stageName.textContent = state.mode === 'julia' ? 'Julia set' : 'Mandelbrot set';
    coordinates.textContent = `center ${formatNumber(state.centerX)}, ${formatNumber(state.centerY)} · span ${formatNumber(state.span)}`;
  }

  async function shareView() {
    const url = new URL(window.location.href);
    const query = url.searchParams;
    query.set('mode', state.mode);
    query.set('x', state.centerX.toPrecision(12));
    query.set('y', state.centerY.toPrecision(12));
    query.set('span', state.span.toPrecision(12));
    query.set('iterations', String(state.iterations));
    query.set('palette', state.palette);
    query.set('jx', state.juliaX.toPrecision(8));
    query.set('jy', state.juliaY.toPrecision(8));
    const shareUrl = url.toString();
    shareUrlInput.value = shareUrl;
    shareFallback.hidden = false;
    try {
      await navigator.clipboard.writeText(shareUrl);
      status.textContent = 'Shareable view link copied. The link stores the view settings, not an image.';
    } catch (_error) {
      shareUrlInput.focus();
      shareUrlInput.select();
      status.textContent = 'Select and copy the share URL below. It stores the view settings, not an image.';
    }
  }

  function readShareLink() {
    const query = new URLSearchParams(window.location.search);
    const mode = query.get('mode');
    if (mode === 'mandelbrot' || mode === 'julia') state.mode = mode;
    state.centerX = queryNumber(query, 'x', defaults.centerX, -4, 4);
    state.centerY = queryNumber(query, 'y', defaults.centerY, -4, 4);
    state.span = queryNumber(query, 'span', defaults.span, 1e-12, 8);
    state.iterations = clampInt(query.get('iterations') ?? defaults.iterations, 80, 800);
    const palette = query.get('palette');
    state.palette = paletteNames.has(palette) ? palette : defaults.palette;
    state.juliaX = queryNumber(query, 'jx', defaults.juliaX, -2, 2);
    state.juliaY = queryNumber(query, 'jy', defaults.juliaY, -2, 2);
    if (state.mode === 'julia' && !query.has('x') && !query.has('y')) {
      state.centerX = 0;
      state.centerY = 0;
      state.span = 3;
    }
    if (state.mode === 'mandelbrot' && query.has('x')) markPreset(null);
  }

  function queryNumber(query, name, fallback, min, max) {
    const parsed = Number(query.get(name));
    return query.has(name) && Number.isFinite(parsed) ? clamp(parsed, min, max) : fallback;
  }

  function formatNumber(value) {
    if (!Number.isFinite(value)) return '0';
    if (Math.abs(value) >= 0.0001 && Math.abs(value) < 10000) return value.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
    return value.toExponential(3);
  }

  function finiteOr(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? clamp(parsed, -2, 2) : fallback;
  }

  function clampInt(value, min, max) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? Math.max(min, Math.min(max, parsed)) : min;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
})();
