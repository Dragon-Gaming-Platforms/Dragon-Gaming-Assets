(() => {
  "use strict";

  // Iterated function system: each map is (a, b, c, d, e, f, weight) and
  // sends (x, y) to (a x + b y + e, c x + d y + f). Picking a map at random,
  // weighted by its probability, and plotting the orbit draws the attractor.

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");
  const W = canvas.width || 780;
  const H = canvas.height || 600;

  const PRESETS = {
    fern: {
      name: "Barnsley fern",
      maps: [
        [0, 0, 0, 0.16, 0, 0, 0.01],
        [0.85, 0.04, -0.04, 0.85, 0, 1.6, 0.85],
        [0.2, -0.26, 0.23, 0.22, 0, 1.6, 0.07],
        [-0.15, 0.28, 0.26, 0.24, 0, 0.44, 0.07],
      ],
      note: "Four maps: a stem, two frond generators and a single near-degenerate map for the base.",
      dim: 1.79,
    },
    leaf: {
      name: "Fern leaf",
      maps: [
        [0, 0, 0, 0.16, 0, 0, 0.1],
        [0.2, -0.26, 0.23, 0.22, 0, 1.6, 0.08],
        [0.85, 0.04, -0.04, 0.85, 0, 1.6, 0.7],
        [-0.15, 0.28, 0.26, 0.24, 0, 0.44, 0.12],
      ],
      note: "The same four generators with different weights: a fuller, bushier frond.",
      dim: 1.82,
    },
    sierpinski: {
      name: "Sierpiński triangle",
      maps: [
        [0.5, 0, 0, 0.5, 0, 0, 1],
        [0.5, 0, 0, 0.5, 0.5, 0, 1],
        [0.5, 0, 0, 0.5, 0.25, 0.433, 1],
      ],
      note: "Three half-size copies of itself, one at each corner. Hausdorff dimension log 3 / log 2.",
      dim: 1.585,
    },
    carpet: {
      name: "Sierpiński carpet",
      maps: [
        [1 / 3, 0, 0, 1 / 3, 0, 0, 1],
        [1 / 3, 0, 0, 1 / 3, 1 / 3, 0, 1],
        [1 / 3, 0, 0, 1 / 3, 2 / 3, 0, 1],
        [1 / 3, 0, 0, 1 / 3, 0, 1 / 3, 1],
        [1 / 3, 0, 0, 1 / 3, 2 / 3, 1 / 3, 1],
        [1 / 3, 0, 0, 1 / 3, 0, 2 / 3, 1],
        [1 / 3, 0, 0, 1 / 3, 1 / 3, 2 / 3, 1],
        [1 / 3, 0, 0, 1 / 3, 2 / 3, 2 / 3, 1],
      ],
      note: "Eight ninth-size copies with the centre removed. Dimension log 8 / log 3.",
      dim: 1.893,
    },
    dragon: {
      name: "Heighway dragon",
      maps: [
        [0.5, -0.5, 0.5, 0.5, 0, 0, 1],
        [-0.5, -0.5, 0.5, -0.5, 1, 0, 1],
      ],
      note: "Two half-size rotations. Folded from a strip of paper an unbounded number of times, it tiles the plane.",
      dim: 2,
    },
    spiral: {
      name: "Barspiral",
      maps: [
        [0.787879, -0.424242, 0.242424, 0.859848, 1.758647, 1.408065, 0.9],
        [-0.121212, 0.257576, 0.151515, 0.05303, -6.721654, 1.377236, 0.05],
        [0.181818, -0.136364, 0.090909, 0.181818, 6.086107, 1.568035, 0.05],
      ],
      note: "Three maps with wildly different scales: one big rotation and two tiny ones that scatter hooks around the rim.",
      dim: 1.9,
    },
  };

  const PALETTES = {
    snow: ["#e9f2ff", "#b9d4f2", "#8fb6e0", "#6c93c4", "#5a76a6"],
    ember: ["#ffd9a0", "#ffb066", "#ff8a4c", "#e0613a", "#a8432f"],
    cyan: ["#d8fbff", "#9beaf7", "#5fd0e8", "#3aa4c4", "#2c7d9c"],
    violet: ["#f0e2ff", "#d3b6f7", "#b18ae8", "#8f66cc", "#6d4da3"],
  };

  const state = {
    preset: "fern",
    maps: [],
    weights: [],
    cumulative: [],
    x: 0,
    y: 0,
    points: 0,
    speed: 4000,
    bias: 0,
    palette: "snow",
    colourByMap: true,
    fit: true,
    running: true,
    bounds: { minX: 0, maxX: 1, minY: 0, maxY: 1 },
    frame: 0,
    lastTime: 0,
    lastBias: 0,
    mapCounts: [],
    maxCount: 1,
  };

  /* --------------------------------------------------------------- geometry */

  function loadPreset(name) {
    const preset = PRESETS[name] || PRESETS.fern;
    state.preset = name;
    state.maps = preset.maps.map((m) => m.slice());
    rebuildWeights();
    state.x = 0;
    state.y = 0;
    state.points = 0;
    state.bounds = estimateBounds();
    state.mapCounts = state.maps.map(() => 0);
    state.maxCount = 1;
    ctx.fillStyle = "#04060a";
    ctx.fillRect(0, 0, W, H);
    updateReadouts();
    setStatus(`${preset.name} loaded. ${preset.note}`);
  }

  function rebuildWeights() {
    const maps = state.maps;
    const count = maps.length;
    const raw = maps.map((m, index) => {
      // Bias pushes probability towards low-index maps or high-index maps.
      const shift = state.bias * (count === 1 ? 0 : (1 - (2 * index) / (count - 1)));
      return Math.max(0.004, m[6] * Math.exp(shift * 1.1));
    });
    const total = raw.reduce((sum, value) => sum + value, 0) || 1;
    state.weights = raw.map((value) => value / total);
    state.cumulative = [];
    let running = 0;
    for (const weight of state.weights) {
      running += weight;
      state.cumulative.push(running);
    }
    state.cumulative[state.cumulative.length - 1] = 1;
  }

  function estimateBounds() {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    let x = 0;
    let y = 0;
    for (let i = 0; i < 12000; i++) {
      const index = pickMap();
      const map = state.maps[index];
      const nx = map[0] * x + map[1] * y + map[4];
      const ny = map[2] * x + map[3] * y + map[5];
      x = nx;
      y = ny;
      if (i < 400) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    if (!isFinite(minX) || minX === maxX || minY === maxY) {
      return { minX: -1, maxX: 1, minY: -1, maxY: 1 };
    }
    // Pad by 3% so the tips are not clipped.
    const padX = (maxX - minX) * 0.03;
    const padY = (maxY - minY) * 0.03;
    return {
      minX: minX - padX,
      maxX: maxX + padX,
      minY: minY - padY,
      maxY: maxY + padY,
    };
  }

  function pickMap() {
    const r = Math.random();
    const cumulative = state.cumulative;
    for (let i = 0; i < cumulative.length; i++) {
      if (r <= cumulative[i]) return i;
    }
    return cumulative.length - 1;
  }

  /* --------------------------------------------------------------- drawing */

  function transform() {
    const b = state.bounds;
    const spanX = Math.max(1e-6, b.maxX - b.minX);
    const spanY = Math.max(1e-6, b.maxY - b.minY);
    const scale = Math.min(W / spanX, H / spanY) * 0.94;
    return {
      scale,
      offsetX: (W - spanX * scale) / 2 - b.minX * scale,
      offsetY: (H - spanY * scale) / 2 + b.maxY * scale,
    };
  }

  function toScreen(x, y, view) {
    return [x * view.scale + view.offsetX, view.offsetY - y * view.scale];
  }

  function plotBatch(count) {
    const view = transform();
    const colours = PALETTES[state.palette] || PALETTES.snow;
    const maps = state.maps;
    const buckets = maps.map(() => []);

    for (let i = 0; i < count; i++) {
      const index = pickMap();
      const map = maps[index];
      const nx = map[0] * state.x + map[1] * state.y + map[4];
      const ny = map[2] * state.x + map[3] * state.y + map[5];
      state.x = nx;
      state.y = ny;
      state.mapCounts[index] += 1;
      if (state.points + i < 40) continue;

      const px = nx * view.scale + view.offsetX;
      const py = view.offsetY - ny * view.scale;
      if (px < -2 || px > W + 2 || py < -2 || py > H + 2) continue;
      buckets[index].push(px, py);
    }

    state.points += count;

    for (let index = 0; index < buckets.length; index++) {
      const bucket = buckets[index];
      if (!bucket.length) continue;
      ctx.fillStyle = state.colourByMap ? colours[index % colours.length] : colours[0];
      for (let i = 0; i < bucket.length; i += 2) {
        ctx.fillRect(bucket[i], bucket[i + 1], 1, 1);
      }
    }

    state.maxCount = Math.max(state.maxCount, ...state.mapCounts);
  }

  function drawHudOnCanvas() {
    const view = transform();
    ctx.fillStyle = "rgba(135, 148, 166, 0.75)";
    ctx.font = "10px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(`${state.points.toLocaleString("en-US")} points`, 12, H - 12);
    ctx.textAlign = "right";
    ctx.fillText(`${PRESETS[state.preset].name} · ${state.maps.length} maps`, W - 12, H - 12);
    ctx.textAlign = "left";
    void view;
  }

  /* ------------------------------------------------------------- readouts */

  function updateReadouts() {
    const preset = PRESETS[state.preset];
    el("points-read").textContent = `${state.points.toLocaleString("en-US")} points`;
    el("maps-read").textContent = `${state.maps.length} maps`;
    el("dim-read").textContent = `D ≈ ${preset.dim.toFixed(3)}`;
    el("count-read").textContent = state.points.toLocaleString("en-US");
    el("maps2-read").textContent = String(state.maps.length);
    el("speed-out").textContent = state.speed.toLocaleString("en-US");

    let maxScale = 0;
    for (const map of state.maps) {
      // Spectral norm of the linear part: an upper bound on the contraction.
      const a = map[0];
      const b = map[1];
      const c = map[2];
      const d = map[3];
      const s1 = a * a + b * b + c * c + d * d;
      const s2 = Math.sqrt((a * a + b * b - c * c - d * d) ** 2 + 4 * (a * c + b * d) ** 2);
      const norm = Math.sqrt((s1 + s2) / 2);
      if (norm > maxScale) maxScale = norm;
    }
    el("contract-read").textContent = maxScale.toFixed(3);

    const b = state.bounds;
    const radius = Math.max(b.maxX - b.minX, b.maxY - b.minY) / 2;
    el("radius-read").textContent = radius.toFixed(2);

    const biased = Math.abs(state.bias) > 0.05;
    el("bias-out").textContent = biased
      ? `${state.bias < 0 ? "early" : "late"} maps ×${Math.exp(Math.abs(state.bias) * 1.1).toFixed(1)}`
      : "balanced";
  }

  function setStatus(text) {
    el("status").textContent = text;
  }

  function statusLine() {
    const preset = PRESETS[state.preset];
    const shares = state.weights.map((w) => `${Math.round(w * 100)}%`).join(" / ");
    return `${preset.name}: ${state.points.toLocaleString("en-US")} points drawn, map weights ${shares}. ${preset.note}`;
  }

  /* ------------------------------------------------------------------ loop */

  function frame(timestamp) {
    if (!state.lastTime) state.lastTime = timestamp;
    const dt = Math.max(0, Math.min(80, timestamp - state.lastTime));
    state.lastTime = timestamp;

    if (state.running) {
      plotBatch(state.speed);
      state.frame += 1;
      if (state.frame % 10 === 0) {
        updateReadouts();
        setStatus(statusLine());
        drawHudOnCanvas();
      }
    }

    requestAnimationFrame(frame);
  }

  /* ---------------------------------------------------------------- wiring */

  function setRunning(running) {
    state.running = running;
    el("toggle").textContent = running ? "Pause" : "Run";
    setStatus(running ? statusLine() : `Paused with ${state.points.toLocaleString("en-US")} points on screen.`);
  }

  el("toggle").addEventListener("click", () => setRunning(!state.running));

  el("burst").addEventListener("click", () => {
    plotBatch(400000);
    updateReadouts();
    drawHudOnCanvas();
    setStatus(`Burst of 400,000 points done — ${state.points.toLocaleString("en-US")} total. ${statusLine()}`);
  });

  el("clear").addEventListener("click", () => {
    ctx.fillStyle = "#04060a";
    ctx.fillRect(0, 0, W, H);
    state.points = 0;
    state.mapCounts = state.maps.map(() => 0);
    updateReadouts();
    drawHudOnCanvas();
    setStatus("Canvas cleared; the orbit continues from where it was.");
  });

  el("preset").addEventListener("change", () => {
    loadPreset(el("preset").value);
    setRunning(true);
  });

  el("speed").addEventListener("input", () => {
    state.speed = Number(el("speed").value);
    updateReadouts();
  });

  el("bias").addEventListener("input", () => {
    state.bias = Number(el("bias").value);
    rebuildWeights();
    updateReadouts();
    setStatus(statusLine());
  });

  el("palette").addEventListener("change", () => {
    state.palette = el("palette").value;
    setStatus(`Palette switched to ${state.palette} — new points arrive in the new colours.`);
  });

  el("colourByMap").addEventListener("change", () => {
    state.colourByMap = el("colourByMap").checked;
  });

  el("fit").addEventListener("change", () => {
    state.fit = el("fit").checked;
    state.bounds = state.fit ? estimateBounds() : { minX: -2, maxX: 2, minY: -2, maxY: 2 };
    ctx.fillStyle = "#04060a";
    ctx.fillRect(0, 0, W, H);
    state.points = 0;
    updateReadouts();
  });

  function saveImage() {
    if (typeof canvas.toDataURL !== "function") return;
    try {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `ifs-${state.preset}.png`;
      link.click();
      setStatus("Saved this attractor as a PNG.");
    } catch (error) {
      setStatus("Saving is blocked in this browser.");
    }
  }

  document.addEventListener("keydown", (event) => {
    const tag = (event.target && event.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (event.code === "Space") {
      event.preventDefault();
      setRunning(!state.running);
    } else if (event.key === "r" || event.key === "R") {
      loadPreset(state.preset);
      setRunning(true);
    } else if (event.key === "c" || event.key === "C") {
      el("clear").click();
    } else if (event.key === "s" || event.key === "S") {
      saveImage();
    }
  });

  const name = el("preset").value || state.preset;
  state.speed = Number(el("speed").value) || state.speed;
  state.palette = el("palette").value || state.palette;
  state.colourByMap = el("colourByMap").checked;
  state.fit = el("fit").checked;
  loadPreset(PRESETS[name] ? name : "fern");
  requestAnimationFrame(frame);
})();
