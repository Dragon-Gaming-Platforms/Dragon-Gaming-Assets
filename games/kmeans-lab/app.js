(() => {
  "use strict";

  // K-means (Lloyd's algorithm) lab. Points come from Gaussian blobs (or
  // rings, which defeat k-means). Each iteration assigns every point to its
  // nearest centre, then moves each centre to its cluster mean. Inertia
  // (sum of squared distances) is tracked and must fall monotonically.

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");

  const W = canvas.width || 880;
  const H = canvas.height || 660;

  const STAGE = { x: 26, y: 50, w: 828, h: 560 };

  const PALETTE = ["#9be15d", "#7cc4ff", "#ffb45f", "#d59bff", "#ff8fa3", "#6ff0c8", "#ffd166", "#8fb3ff"];

  const PRESETS = {
    blobs2: { label: "2 blobs", k: 2, blobs: [[0.3, 0.35], [0.7, 0.65]] },
    blobs3: { label: "3 blobs", k: 3, blobs: [[0.25, 0.3], [0.72, 0.28], [0.5, 0.72]] },
    blobs4: { label: "4 blobs", k: 4, blobs: [[0.22, 0.25], [0.75, 0.22], [0.25, 0.75], [0.72, 0.72]] },
    rings: { label: "Rings", k: 2, rings: true },
  };

  const state = {
    k: 3,
    n: 300,
    spread: 0.1,
    preset: "blobs3",
    points: [], // {x, y}
    centers: [], // {x, y}
    assign: [], // cluster index per point
    iterations: 0,
    inertia: 0,
    converged: false,
    seed: 777,
    drag: -1,
    statusKind: "",
  };

  /* ------------------------------------------------------------------- random */

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function gauss(rng) {
    // Box-Muller
    let u = 0, v = 0;
    while (u === 0) u = rng();
    while (v === 0) v = rng();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  function genPoints() {
    const rng = mulberry32(state.seed);
    const p = PRESETS[state.preset] || PRESETS.blobs3;
    const pts = [];
    if (p.rings) {
      for (let i = 0; i < state.n; i++) {
        if (i % 2 === 0) {
          // inner disc
          const r = 0.12 * Math.sqrt(rng());
          const a = rng() * 2 * Math.PI;
          pts.push({ x: 0.5 + r * Math.cos(a), y: 0.5 + r * Math.sin(a) });
        } else {
          // outer ring
          const r = 0.3 + gauss(rng) * 0.03;
          const a = rng() * 2 * Math.PI;
          pts.push({ x: 0.5 + r * Math.cos(a), y: 0.5 + r * Math.sin(a) });
        }
      }
    } else {
      for (let i = 0; i < state.n; i++) {
        const b = p.blobs[i % p.blobs.length];
        pts.push({
          x: Math.max(0.02, Math.min(0.98, b[0] + gauss(rng) * state.spread)),
          y: Math.max(0.02, Math.min(0.98, b[1] + gauss(rng) * state.spread)),
        });
      }
    }
    return pts;
  }

  function initCenters() {
    // k-means++ seeding
    const rng = mulberry32(state.seed ^ 0x5eed);
    const centers = [];
    const first = state.points[Math.floor(rng() * state.points.length)];
    centers.push({ x: first.x, y: first.y });
    while (centers.length < state.k) {
      const dists = state.points.map((pt) => {
        let best = Infinity;
        for (const c of centers) best = Math.min(best, (pt.x - c.x) ** 2 + (pt.y - c.y) ** 2);
        return best;
      });
      const total = dists.reduce((s, d) => s + d, 0);
      let r = rng() * total;
      let idx = 0;
      for (let i = 0; i < dists.length; i++) {
        r -= dists[i];
        if (r <= 0) { idx = i; break; }
      }
      centers.push({ x: state.points[idx].x, y: state.points[idx].y });
    }
    return centers;
  }

  /* ------------------------------------------------------------------ k-means */

  function assignAll() {
    let inertia = 0;
    state.assign = state.points.map((pt) => {
      let best = 0;
      let bestD = Infinity;
      state.centers.forEach((c, ci) => {
        const d = (pt.x - c.x) ** 2 + (pt.y - c.y) ** 2;
        if (d < bestD) { bestD = d; best = ci; }
      });
      inertia += bestD;
      return best;
    });
    state.inertia = inertia;
  }

  function stepOnce() {
    assignAll();
    const sums = state.centers.map(() => ({ x: 0, y: 0, n: 0 }));
    state.points.forEach((pt, i) => {
      const s = sums[state.assign[i]];
      s.x += pt.x; s.y += pt.y; s.n++;
    });
    let moved = 0;
    state.centers = state.centers.map((c, ci) => {
      const s = sums[ci];
      if (s.n === 0) return c; // empty cluster: leave in place
      const nx = s.x / s.n;
      const ny = s.y / s.n;
      moved = Math.max(moved, Math.hypot(nx - c.x, ny - c.y));
      return { x: nx, y: ny };
    });
    state.iterations++;
    assignAll();
    state.converged = moved < 1e-6;
    return moved;
  }

  function runToConvergence() {
    let guard = 0;
    while (!state.converged && guard < 100) {
      stepOnce();
      guard++;
    }
  }

  function clusterSizes() {
    const sizes = new Array(state.k).fill(0);
    state.assign.forEach((a) => { sizes[a]++; });
    return sizes;
  }

  function reset() {
    state.points = genPoints();
    state.centers = initCenters();
    state.iterations = 0;
    state.converged = false;
    assignAll();
  }

  /* ------------------------------------------------------------------- drawing */

  function toPx(x, y) {
    return [STAGE.x + x * STAGE.w, STAGE.y + y * STAGE.h];
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#070907";
    ctx.fillRect(STAGE.x, STAGE.y, STAGE.w, STAGE.h);

    // assignment lines (every 3rd point to reduce clutter)
    ctx.strokeStyle = "rgba(155,225,93,0.18)";
    ctx.lineWidth = 1;
    state.points.forEach((pt, i) => {
      if (i % 3 !== 0) return;
      const c = state.centers[state.assign[i]];
      if (!c) return;
      const [x1, y1] = toPx(pt.x, pt.y);
      const [x2, y2] = toPx(c.x, c.y);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });

    // points
    state.points.forEach((pt, i) => {
      const [x, y] = toPx(pt.x, pt.y);
      ctx.fillStyle = PALETTE[state.assign[i] % PALETTE.length];
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // centres as X
    state.centers.forEach((c, ci) => {
      const [x, y] = toPx(c.x, c.y);
      ctx.strokeStyle = PALETTE[ci % PALETTE.length];
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - 9, y - 9);
      ctx.lineTo(x + 9, y + 9);
      ctx.moveTo(x + 9, y - 9);
      ctx.lineTo(x - 9, y + 9);
      ctx.stroke();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.stroke();
    });

    ctx.fillStyle = "#93a48f";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("k=" + state.k + "  n=" + state.n + "  inertia=" + state.inertia.toFixed(3), STAGE.x + 8, STAGE.y + 16);
  }

  /* ------------------------------------------------------------------ readouts */

  function updateReadouts() {
    const sizes = clusterSizes();
    const empty = sizes.filter((s) => s === 0).length;
    const meanDist = state.points.length ? Math.sqrt(state.inertia / state.points.length) : 0;

    el("k-out").textContent = String(state.k);
    el("n-out").textContent = String(state.n);
    el("spread-out").textContent = state.spread.toFixed(2);

    el("inertia-hud").textContent = "inertia " + state.inertia.toFixed(3);
    el("iter-hud").textContent = "iteration " + state.iterations;
    el("conv-hud").textContent = state.converged ? "converged" : "running";

    el("inertia-read").textContent = state.inertia.toFixed(3);
    el("iter-read").textContent = String(state.iterations);
    el("sizes-read").textContent = sizes.join(", ");
    el("conv-read").textContent = state.converged ? "yes" : "no";
    el("empty-read").textContent = String(empty);
    el("dist-read").textContent = meanDist.toFixed(3);
  }

  function describe() {
    const sizes = clusterSizes();
    const empty = sizes.filter((s) => s === 0).length;
    let msg;
    if (state.preset === "rings") {
      msg = "Rings defeat k-means: the true centres (disc mean and ring mean) coincide at the middle, so k-means splits the whole mass into two halves instead. Inertia " + state.inertia.toFixed(3) + " after " + state.iterations + " iterations.";
    } else if (empty > 0) {
      msg = empty + " cluster(s) went empty — their centres sit still. K-means++ seeding usually avoids this; Reset re-seeds.";
    } else if (state.converged) {
      msg = "Converged after " + state.iterations + " iterations: inertia " + state.inertia.toFixed(3) + ", sizes " + sizes.join("/") + ". Lloyd's algorithm always decreases inertia, but only to a local optimum.";
    } else {
      msg = "Iteration " + state.iterations + ": inertia " + state.inertia.toFixed(3) + ". Step or Run to keep going — each step reassigns points, then moves centres to the means.";
    }
    el("status").textContent = msg;
  }

  /* -------------------------------------------------------------------- wiring */

  function setPreset(name) {
    const p = PRESETS[name];
    if (!p) return;
    state.preset = name;
    state.k = p.k;
    state.seed = 777 + name.length * 31;
    el("k").value = String(p.k);
    ["blobs2", "blobs3", "blobs4", "rings"].forEach((kk) => {
      el("preset-" + kk).classList.toggle("active", kk === name);
    });
    reset();
    updateReadouts();
    describe();
    draw();
  }

  function clearPresets() {
    state.preset = "";
    ["blobs2", "blobs3", "blobs4", "rings"].forEach((kk) => el("preset-" + kk).classList.remove("active"));
  }

  el("k").addEventListener("input", (evt) => {
    state.k = Math.max(2, Math.min(8, Number(evt.target.value) || 3));
    clearPresets();
    reset();
    updateReadouts();
    describe();
    draw();
  });
  el("n").addEventListener("input", (evt) => {
    state.n = Math.max(100, Math.min(600, Number(evt.target.value) || 300));
    clearPresets();
    reset();
    updateReadouts();
    describe();
    draw();
  });
  el("spread").addEventListener("input", (evt) => {
    state.spread = Math.max(0.04, Math.min(0.25, Number(evt.target.value) || 0.1));
    clearPresets();
    reset();
    updateReadouts();
    describe();
    draw();
  });

  el("preset-blobs2").addEventListener("click", () => setPreset("blobs2"));
  el("preset-blobs3").addEventListener("click", () => setPreset("blobs3"));
  el("preset-blobs4").addEventListener("click", () => setPreset("blobs4"));
  el("preset-rings").addEventListener("click", () => setPreset("rings"));

  el("btn-step").addEventListener("click", () => {
    stepOnce();
    updateReadouts();
    describe();
    draw();
  });
  el("btn-run").addEventListener("click", () => {
    runToConvergence();
    updateReadouts();
    describe();
    draw();
  });
  el("btn-reset").addEventListener("click", () => {
    state.seed = (state.seed * 1103515245 + 12345) >>> 0;
    reset();
    updateReadouts();
    describe();
    draw();
  });

  function point(evt) {
    const r = canvas.getBoundingClientRect();
    return [evt.clientX - r.left, evt.clientY - r.top];
  }

  canvas.addEventListener("pointerdown", (evt) => {
    const [x, y] = point(evt);
    let best = -1;
    let bestD = 16;
    state.centers.forEach((c, ci) => {
      const [cx, cy] = toPx(c.x, c.y);
      const d = Math.hypot(x - cx, y - cy);
      if (d < bestD) { bestD = d; best = ci; }
    });
    if (best >= 0) state.drag = best;
  });
  canvas.addEventListener("pointermove", (evt) => {
    if (state.drag < 0) return;
    const [x, y] = point(evt);
    state.centers[state.drag] = {
      x: Math.max(0, Math.min(1, (x - STAGE.x) / STAGE.w)),
      y: Math.max(0, Math.min(1, (y - STAGE.y) / STAGE.h)),
    };
    state.converged = false;
    assignAll();
    updateReadouts();
    describe();
    draw();
  });
  canvas.addEventListener("pointerup", () => { state.drag = -1; });

  document.addEventListener("keydown", (evt) => {
    if (evt.key === "1") setPreset("blobs2");
    else if (evt.key === "2") setPreset("blobs3");
    else if (evt.key === "3") setPreset("blobs4");
    else if (evt.key === "4") setPreset("rings");
    else if (evt.key === "s" || evt.key === "S") el("btn-step").click();
    else if (evt.key === "g" || evt.key === "G") el("btn-run").click();
    else if (evt.key === "r" || evt.key === "R") el("btn-reset").click();
  });

  window.__lab = {
    state,
    PRESETS,
    genPoints,
    initCenters,
    assignAll,
    stepOnce,
    runToConvergence,
    clusterSizes,
    reset,
    setPreset,
    updateReadouts,
    describe,
    draw,
  };

  reset();
  updateReadouts();
  describe();
  draw();
})();
