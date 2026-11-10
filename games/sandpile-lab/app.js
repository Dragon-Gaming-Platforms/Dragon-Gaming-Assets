(() => {
  "use strict";

  // Abelian sandpile on a square lattice: every cell holds 0–3 grains; the
  // fourth grain topples one unit to each of the four neighbours. Open edges
  // let grains fall off the table, which is what lets the pile reach a
  // self-organised critical slope.

  const CELL = 4;
  const COLS = 190;
  const ROWS = 120;
  const GRID_H = ROWS * CELL;
  const W = COLS * CELL;
  const H = 560;
  const CHART_H = H - GRID_H;
  const THRESHOLD = 4;

  const PALETTES = {
    sand: ["#100a04", "#6d4a1f", "#b57c33", "#f2c56c"],
    dusk: ["#080810", "#33254f", "#5f448c", "#b18be4"],
    ice: ["#04101a", "#123a52", "#2f7391", "#a6e3ff"],
  };

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");
  const canvasW = canvas.width || W;
  const canvasH = canvas.height || H;

  const state = {
    heights: new Int32Array(COLS * ROWS),
    activity: new Uint8Array(COLS * ROWS),
    grains: 0,
    topples: 0,
    maxAvalanche: 0,
    big: 0,
    last: 0,
    history: [],
    running: true,
    rate: 2,
    source: "center",
    palette: "sand",
    showChart: true,
    drop: { x: COLS >> 1, y: ROWS >> 1 },
    frame: 0,
    lastTime: 0,
    accumulator: 0,
    off: null,
    offCtx: null,
    image: null,
    pendingStatus: 0,
  };

  /* ------------------------------------------------------------- simulation */

  const stack = new Int32Array(COLS * ROWS * 8);
  let stackTop = 0;

  function toppleFrom(index) {
    if (state.heights[index] < THRESHOLD) return 0;
    stackTop = 0;
    stack[stackTop++] = index;
    let toppled = 0;
    let guard = 0;

    while (stackTop > 0) {
      if (guard++ > 4e6) break;
      const i = stack[--stackTop];
      const height = state.heights[i];
      if (height < THRESHOLD) continue;

      const share = (height / THRESHOLD) | 0;
      state.heights[i] = height - share * THRESHOLD;
      toppled += share;

      const x = i % COLS;
      const left = x === 0 ? -1 : i - 1;
      const right = x === COLS - 1 ? -1 : i + 1;
      const up = i < COLS ? -1 : i - COLS;
      const down = i >= COLS * (ROWS - 1) ? -1 : i + COLS;

      if (left >= 0) {
        state.heights[left] += share;
        if (state.heights[left] >= THRESHOLD) stack[stackTop++] = left;
      }
      if (right >= 0) {
        state.heights[right] += share;
        if (state.heights[right] >= THRESHOLD) stack[stackTop++] = right;
      }
      if (up >= 0) {
        state.heights[up] += share;
        if (state.heights[up] >= THRESHOLD) stack[stackTop++] = up;
      }
      if (down >= 0) {
        state.heights[down] += share;
        if (state.heights[down] >= THRESHOLD) stack[stackTop++] = down;
      }

      state.activity[i] = 255;
      if (left >= 0) state.activity[left] = Math.max(state.activity[left], 180);
      if (right >= 0) state.activity[right] = Math.max(state.activity[right], 180);
      if (up >= 0) state.activity[up] = Math.max(state.activity[up], 180);
      if (down >= 0) state.activity[down] = Math.max(state.activity[down], 180);
    }

    return toppled;
  }

  function chooseSource() {
    if (state.source === "random") {
      return (Math.random() * COLS * ROWS) | 0;
    }
    if (state.source === "edge") {
      return (ROWS >> 2) * COLS + 8;
    }
    return state.drop.y * COLS + state.drop.x;
  }

  function dropGrain() {
    const index = chooseSource();
    state.heights[index] += 1;
    state.grains += 1;
    const toppled = toppleFrom(index);
    if (toppled > 0) {
      state.topples += toppled;
      state.last = toppled;
      if (toppled > state.maxAvalanche) state.maxAvalanche = toppled;
      if (toppled >= 100) state.big += 1;
      state.history.push(toppled);
      if (state.history.length > 96) state.history.shift();
    }
  }

  /* ---------------------------------------------------------------- drawing */

  function ensureBuffer() {
    if (state.offCtx) return true;
    try {
      const off = document.createElement("canvas");
      off.width = COLS;
      off.height = ROWS;
      const octx = typeof off.getContext === "function" ? off.getContext("2d") : null;
      if (!octx || typeof octx.createImageData !== "function") return false;
      state.off = off;
      state.offCtx = octx;
      state.image = octx.createImageData(COLS, ROWS);
      return true;
    } catch (error) {
      return false;
    }
  }

  function parseHex(hex) {
    return [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16),
    ];
  }

  function drawPile() {
    const colours = PALETTES[state.palette].map(parseHex);

    if (ensureBuffer()) {
      const data = state.image.data;
      for (let i = 0; i < state.heights.length; i++) {
        const shade = colours[Math.min(3, state.heights[i])];
        const glow = state.activity[i];
        const p = i * 4;
        if (glow > 0) {
          const mix = glow / 255;
          data[p] = shade[0] + (255 - shade[0]) * mix * 0.75;
          data[p + 1] = shade[1] + (248 - shade[1]) * mix * 0.75;
          data[p + 2] = shade[2] + (220 - shade[2]) * mix * 0.75;
        } else {
          data[p] = shade[0];
          data[p + 1] = shade[1];
          data[p + 2] = shade[2];
        }
        data[p + 3] = 255;
      }
      state.offCtx.putImageData(state.image, 0, 0);
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(state.off, 0, 0, canvasW, GRID_H);
      ctx.restore();
    } else {
      const cell = canvasW / COLS;
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const i = y * COLS + x;
          ctx.fillStyle = colours[Math.min(3, state.heights[i])];
          ctx.fillRect(x * cell, y * cell, cell + 0.5, cell + 0.5);
        }
      }
    }

    // Mark the source.
    const sx = (state.drop.x + 0.5) * CELL;
    const sy = (state.drop.y + 0.5) * CELL;
    ctx.strokeStyle = "rgba(255, 240, 210, 0.5)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(sx, sy, 9, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawChart() {
    const y0 = GRID_H;
    ctx.fillStyle = "#0d0a06";
    ctx.fillRect(0, y0, canvasW, CHART_H);
    ctx.strokeStyle = "#2a2116";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y0 + 0.5);
    ctx.lineTo(canvasW, y0 + 0.5);
    ctx.stroke();

    if (!state.showChart) return;

    const pad = 26;
    const plotW = canvasW - pad * 2;
    const plotH = CHART_H - 30;
    const values = state.history.slice(-Math.floor(plotW / 6));
    const peak = Math.max(10, ...values);

    ctx.fillStyle = "#7d6a51";
    ctx.font = "10.5px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(`avalanche size (log) · peak ${peak.toLocaleString("en-US")} cells`, pad, y0 + 16);

    if (!values.length) {
      ctx.fillStyle = "#5c4d3a";
      ctx.fillText("no avalanche yet — the pile is still filling", pad, y0 + 44);
      return;
    }

    const barW = plotW / Math.max(values.length, 1);
    for (let i = 0; i < values.length; i++) {
      const height = (Math.log1p(values[i]) / Math.log1p(peak)) * plotH;
      const x = pad + i * barW;
      const y = y0 + CHART_H - 12 - height;
      const intensity = 0.35 + 0.65 * (values[i] / peak);
      ctx.fillStyle = `rgba(240, 178, 90, ${intensity.toFixed(2)})`;
      ctx.fillRect(x, y, Math.max(1.5, barW - 1), height);
    }

    ctx.strokeStyle = "rgba(240, 178, 90, 0.25)";
    ctx.beginPath();
    ctx.moveTo(pad, y0 + CHART_H - 12);
    ctx.lineTo(pad + plotW, y0 + CHART_H - 12);
    ctx.stroke();
  }

  function draw() {
    ctx.fillStyle = "#070503";
    ctx.fillRect(0, 0, canvasW, canvasH);
    drawPile();
    drawChart();
  }

  /* ---------------------------------------------------------------- readouts */

  function format(n) {
    return n.toLocaleString("en-US");
  }

  function updateReadouts() {
    el("grains-read").textContent = `${format(state.grains)} grains`;
    el("topples-read").textContent = `${format(state.topples)} topplings`;
    el("last-read").textContent = `last: ${state.last ? format(state.last) : "—"}`;
    el("count-read").textContent = format(state.grains);
    el("cells-read").textContent = format(state.topples);
    el("max-read").textContent = state.maxAvalanche ? format(state.maxAvalanche) : "—";
    el("big-read").textContent = format(state.big);
  }

  function statusLine() {
    if (state.grains === 0) return "Empty table. Grains are dropping at the centre.";
    const slope = state.maxAvalanche; // measured in topplings
    let flavour;
    if (state.grains < 400) flavour = "The pile is still filling in — avalanches are small and local.";
    else if (state.grains < 3000) flavour = "The slope is steepening; each grain now triggers a flurry.";
    else if (state.big < 3) flavour = "Approaching criticality — most grains land and stay put.";
    else flavour = "Critical: a single grain can set off a system-wide avalanche.";
    return `${format(state.grains)} grains · ${format(state.topples)} topplings · largest avalanche ${format(slope)} topplings (${state.big} over 100). ${flavour}`;
  }

  function setStatus(text) {
    el("status").textContent = text;
  }

  function refreshStatus() {
    setStatus(statusLine());
    updateReadouts();
  }

  /* ------------------------------------------------------------------- loop */

  function step(dt) {
    const perSecond = state.rate * 60;
    state.accumulator += (dt / 1000) * perSecond;
    let guard = 0;
    while (state.accumulator >= 1 && guard < 200) {
      state.accumulator -= 1;
      dropGrain();
      guard++;
    }
    if (guard >= 200) state.accumulator = 0;

    for (let i = 0; i < state.activity.length; i++) {
      if (state.activity[i] > 0) state.activity[i] = Math.max(0, state.activity[i] - 14);
    }
    state.frame += 1;
    if (state.frame % 8 === 0) refreshStatus();
  }

  function frame(timestamp) {
    if (!state.lastTime) state.lastTime = timestamp;
    const dt = Math.max(0, Math.min(120, timestamp - state.lastTime));
    state.lastTime = timestamp;

    if (state.running) step(dt);

    draw();
    requestAnimationFrame(frame);
  }

  /* ----------------------------------------------------------------- wiring */

  function reset() {
    state.heights.fill(0);
    state.activity.fill(0);
    state.grains = 0;
    state.topples = 0;
    state.maxAvalanche = 0;
    state.big = 0;
    state.last = 0;
    state.history = [];
    state.frame = 0;
    state.accumulator = 0;
    state.drop = { x: COLS >> 1, y: ROWS >> 1 };
    refreshStatus();
    draw();
  }

  function setRunning(running) {
    state.running = running;
    el("toggle").textContent = running ? "Pause" : "Run";
    setStatus(running ? statusLine() : `Paused with ${format(state.grains)} grains on the table.`);
  }

  el("toggle").addEventListener("click", () => setRunning(!state.running));
  el("reset").addEventListener("click", reset);
  el("drop").addEventListener("click", () => {
    for (let i = 0; i < 100; i++) dropGrain();
    refreshStatus();
    draw();
  });

  el("rate").addEventListener("input", () => {
    state.rate = Number(el("rate").value);
    el("rate-out").textContent = String(state.rate);
  });

  el("source").addEventListener("change", () => {
    state.source = el("source").value;
    setStatus(
      state.source === "random"
        ? "Grains now land on a random cell each time."
        : state.source === "edge"
          ? "Grains now land near the left edge — the pile grows a slope."
          : "Grains now land at the marked source."
    );
  });

  el("palette").addEventListener("change", () => {
    state.palette = el("palette").value;
    draw();
  });

  el("chart").addEventListener("change", () => {
    state.showChart = el("chart").checked;
    draw();
  });

  canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / (rect.width || canvasW)) * canvasW;
    const y = ((event.clientY - rect.top) / (rect.height || canvasH)) * canvasH;
    if (y > GRID_H) return;
    state.drop = {
      x: Math.max(2, Math.min(COLS - 3, Math.round(x / CELL))),
      y: Math.max(2, Math.min(ROWS - 3, Math.round(y / CELL))),
    };
    state.source = "center";
    el("source").value = "center";
    setStatus(`Source moved to cell ${state.drop.x}, ${state.drop.y}.`);
    draw();
  });

  document.addEventListener("keydown", (event) => {
    const tag = (event.target && event.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (event.code === "Space") {
      event.preventDefault();
      setRunning(!state.running);
    } else if (event.key === "r" || event.key === "R") {
      reset();
    } else if (event.key === "c" || event.key === "C") {
      state.drop = { x: COLS >> 1, y: ROWS >> 1 };
      state.source = "center";
      el("source").value = "center";
      setStatus("Source re-centred.");
      draw();
    }
  });

  state.rate = Number(el("rate").value) || state.rate;
  el("rate-out").textContent = String(state.rate);
  state.source = el("source").value || state.source;
  state.palette = el("palette").value || state.palette;
  state.showChart = el("chart").checked;
  refreshStatus();
  draw();
  requestAnimationFrame(frame);
})();
