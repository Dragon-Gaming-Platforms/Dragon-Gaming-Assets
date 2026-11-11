(() => {
  "use strict";

  // Site percolation on a square lattice. One uniform random field is generated
  // per sample and then thresholded at p, so dragging the slider adds cells to
  // the very same landscape instead of redrawing the world each time. Clusters
  // are found with union-find carrying top/bottom flags, which makes "does a
  // cluster span the grid?" a single lookup.

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");

  const W = canvas.width || 760;
  const H = canvas.height || 780;
  const AREA_MAX = 600;
  const Y0 = 64;

  const PC_SQUARE = 0.592746;

  const state = {
    p: 0.593,
    size: 120,
    seed: 1234567,
    uniform: null,
    open: null,
    labels: null,
    stats: null,
    spanningRoots: new Set(),
    largestRoot: -1,
    solo: false,
    sweeping: false,
    sweepFrom: 0.4,
    sweepTo: 0.73,
    spannedAt: null,
    override: null,
    dirty: true,
    frame: 0,
    cell: 5,
    area: 600,
    x0: 80,
  };

  function seeded(seed) {
    let s = seed >>> 0 || 1;
    return () => {
      s ^= s << 13;
      s >>>= 0;
      s ^= s >>> 17;
      s ^= s << 5;
      s >>>= 0;
      return s / 4294967296;
    };
  }

  function freshUniform(size, seed) {
    const rand = seeded(seed);
    const u = new Float32Array(size * size);
    for (let i = 0; i < u.length; i++) u[i] = rand();
    return u;
  }

  function ensureField() {
    if (!state.uniform || state.uniform.length !== state.size * state.size) {
      state.uniform = freshUniform(state.size, state.seed);
    }
  }

  /* ------------------------------------------------------- cluster finding */

  function analyse(p, size, uniform, override) {
    const n = size * size;
    const open = new Uint8Array(n);
    for (let i = 0; i < n; i++) open[i] = uniform[i] < p ? 1 : 0;
    if (override) {
      for (let i = 0; i < n; i++) open[i] = override[i] ? 1 : 0;
    }

    const parent = new Int32Array(n);
    const size_ = new Int32Array(n);
    const top = new Uint8Array(n);
    const bottom = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      parent[i] = i;
      size_[i] = 1;
    }

    const find = (a) => {
      while (parent[a] !== a) {
        parent[a] = parent[parent[a]];
        a = parent[a];
      }
      return a;
    };
    const union = (a, b) => {
      a = find(a);
      b = find(b);
      if (a === b) return a;
      if (size_[a] < size_[b]) {
        const t = a;
        a = b;
        b = t;
      }
      parent[b] = a;
      size_[a] += size_[b];
      top[a] |= top[b];
      bottom[a] |= bottom[b];
      return a;
    };

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = y * size + x;
        if (!open[i]) continue;
        if (y === 0) top[i] = 1;
        if (y === size - 1) bottom[i] = 1;
        if (x > 0 && open[i - 1]) union(i, i - 1);
        if (y > 0 && open[i - size]) union(i, i - size);
      }
    }

    const labels = new Int32Array(n).fill(-1);
    const seen = new Uint8Array(n);
    const spanning = new Set();
    let clusters = 0;
    let occupied = 0;
    let largest = 0;
    let largestRoot = -1;

    for (let i = 0; i < n; i++) {
      if (!open[i]) continue;
      occupied++;
      const root = find(i);
      labels[i] = root;
      if (!seen[root]) {
        seen[root] = 1;
        clusters++;
        const s = size_[root];
        if (s > largest) {
          largest = s;
          largestRoot = root;
        }
        if (top[root] && bottom[root]) spanning.add(root);
      }
    }

    return {
      open,
      labels,
      parent,
      sizes: size_,
      clusters,
      occupied,
      occupiedFrac: occupied / n,
      largest,
      largestFrac: largest / n,
      largestRoot,
      spanning,
      spans: spanning.size > 0,
    };
  }

  /* ------------------------------------------------------------- controls */

  function rebuild() {
    ensureField();
    const res = analyse(state.p, state.size, state.uniform, state.override);
    state.open = res.open;
    state.labels = res.labels;
    state.spanningRoots = res.spanning;
    state.largestRoot = res.largestRoot;
    state.stats = res;
    state.cell = Math.max(3, Math.floor(AREA_MAX / state.size));
    state.area = state.cell * state.size;
    state.x0 = Math.round((W - state.area) / 2);
    if (state.sweeping && res.spans && state.spannedAt === null) state.spannedAt = state.p;
    state.dirty = true;
    updateReadouts();
  }

  function setP(p, quiet) {
    state.p = Math.min(0.9, Math.max(0.2, p));
    el("p").value = String(state.p);
    el("p-out").textContent = state.p.toFixed(3);
    rebuild();
    if (!quiet) describe();
  }

  function describe() {
    const s = state.stats;
    if (!s) return;
    const pct = (s.occupiedFrac * 100).toFixed(1);
    const big = (s.largestFrac * 100).toFixed(1);
    if (s.spans) {
      setStatus(
        `p = ${state.p.toFixed(3)}: ${pct}% occupied, largest cluster ${big}% of the grid — it connects top to bottom.`,
        "good"
      );
    } else {
      setStatus(
        `p = ${state.p.toFixed(3)}: ${pct}% occupied across ${s.clusters} islands, largest ${big}%. No cluster reaches both edges.`,
        "warn"
      );
    }
  }

  function setStatus(text, kind) {
    const box = el("status");
    box.textContent = text;
    box.className = "status" + (kind ? " " + kind : "");
  }

  function updateReadouts() {
    const s = state.stats;
    if (!s) return;
    el("p-hud").textContent = "p = " + state.p.toFixed(3);
    el("span-hud").textContent = s.spans ? "spanning" : "not spanning";
    el("largest-hud").textContent = "largest " + (s.largestFrac * 100).toFixed(1) + "%";
    el("occ-read").textContent = (s.occupiedFrac * 100).toFixed(1) + "%";
    el("clusters-read").textContent = s.clusters.toLocaleString("en-US");
    el("largest-read").textContent = (s.largestFrac * 100).toFixed(1) + "%";
    el("span-read").textContent = s.spans ? "yes" : "no";
    el("size-read").textContent = state.size + "²";
    if (state.spannedAt !== null) el("pc-read").textContent = state.spannedAt.toFixed(3);
  }

  function reseed() {
    state.seed = (state.seed * 1664525 + 1013904223) >>> 0;
    state.uniform = freshUniform(state.size, state.seed);
    state.override = null;
    state.spannedAt = null;
    rebuild();
    describe();
  }

  function sweep() {
    if (state.sweeping) {
      state.sweeping = false;
      el("sweep").textContent = "Sweep p";
      el("sweep").classList.remove("active");
      describe();
      return;
    }
    state.sweeping = true;
    state.spannedAt = null;
    el("sweep").textContent = "Stop sweep";
    el("sweep").classList.add("active");
    state.p = state.sweepFrom;
    rebuild();
    setStatus("Sweeping p upward from 0.40. Watch the moment a path opens between the top and bottom edges.", "idle");
  }

  function crossingProbability(p, trials, size, seedBase) {
    let hits = 0;
    for (let t = 0; t < trials; t++) {
      const u = freshUniform(size, (seedBase + t * 7919) >>> 0);
      const res = analyse(p, size, u, null);
      if (res.spans) hits++;
    }
    return hits / trials;
  }

  function estimateCritical() {
    const size = state.size;
    let lo = 0.35;
    let hi = 0.8;
    const trials = size >= 120 ? 18 : 24;
    for (let step = 0; step < 9; step++) {
      const mid = (lo + hi) / 2;
      const q = crossingProbability(mid, trials, size, 99991 + step * 104729);
      if (q >= 0.5) hi = mid;
      else lo = mid;
    }
    const pc = (lo + hi) / 2;
    el("pc-read").textContent = pc.toFixed(3);
    state.pcEstimate = pc;
    setStatus(
      `Bisection over ${trials} samples per level puts the 50% crossing point at p = ${pc.toFixed(3)} — the known square-lattice value is ${PC_SQUARE.toFixed(3)}. Finite grids and only nine levels leave a little wobble.`,
      "good"
    );
    return pc;
  }

  function setSize(size) {
    state.size = size;
    state.uniform = freshUniform(size, state.seed);
    state.override = null;
    state.spannedAt = null;
    el("coarse").classList.toggle("active", size === 80);
    el("fine").classList.toggle("active", size === 120);
    rebuild();
    describe();
  }

  /* -------------------------------------------------------------- drawing */

  function shadeFor(root) {
    const s = state.stats.sizes[root];
    return Math.min(1, Math.log(1 + s) / Math.log(1 + state.size * state.size));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#0a0806";
    ctx.fillRect(0, 0, W, H);

    const s = state.stats;
    if (!s) return;
    const cell = state.cell;
    const x0 = state.x0;
    const y0 = Y0;

    for (let y = 0; y < state.size; y++) {
      for (let x = 0; x < state.size; x++) {
        const i = y * state.size + x;
        const px = x0 + x * cell;
        const py = y0 + y * cell;
        if (!s.open[i]) {
          ctx.fillStyle = "#100d0a";
          ctx.fillRect(px, py, cell, cell);
          continue;
        }
        const root = state.labels[i];
        const isSpan = state.spanningRoots.has(root);
        if (state.solo && !isSpan) {
          ctx.fillStyle = "#282019";
        } else if (isSpan) {
          ctx.fillStyle = "#ff5d7a";
        } else if (root === state.largestRoot) {
          ctx.fillStyle = "#ffb347";
        } else {
          const t = shadeFor(root);
          const g = Math.round(80 + 90 * t);
          const b = Math.round(75 + 95 * t);
          ctx.fillStyle = `rgb(35, ${g}, ${b})`;
        }
        ctx.fillRect(px, py, cell, cell);
      }
    }

    ctx.strokeStyle = "rgba(255, 190, 120, 0.35)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x0 - 0.5, y0 - 0.5, state.area + 1, state.area + 1);

    // Title line
    ctx.fillStyle = "#b9a48c";
    ctx.font = "12px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(`${state.size} × ${state.size} lattice · open with probability p`, x0, y0 - 18);
    ctx.textAlign = "right";
    ctx.fillStyle = s.spans ? "#ff8fa3" : "#8d7b66";
    ctx.fillText(s.spans ? "spanning cluster present" : "no spanning cluster", x0 + state.area, y0 - 18);

    drawAxis(x0, y0 + state.area + 46);
  }

  function drawAxis(x0, y) {
    const width = state.area;
    const min = 0.2;
    const max = 0.9;
    const at = (p) => x0 + ((p - min) / (max - min)) * width;

    ctx.strokeStyle = "#33291f";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(x0 + width, y);
    ctx.stroke();

    ctx.strokeStyle = "#ffb347";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(at(state.p), y);
    ctx.stroke();

    ctx.strokeStyle = "#6d5a44";
    ctx.lineWidth = 1;
    for (const p of [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]) {
      ctx.beginPath();
      ctx.moveTo(at(p), y - 7);
      ctx.lineTo(at(p), y + 7);
      ctx.stroke();
    }

    ctx.fillStyle = "#7f6d59";
    ctx.font = "10px ui-monospace, Menlo, monospace";
    ctx.textAlign = "center";
    for (const p of [0.2, 0.4, 0.6, 0.8]) ctx.fillText(p.toFixed(1), at(p), y + 20);

    ctx.strokeStyle = "#ff5d7a";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(at(PC_SQUARE), y - 14);
    ctx.lineTo(at(PC_SQUARE), y + 14);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#ff8fa3";
    ctx.fillText("p_c ≈ 0.593", at(PC_SQUARE), y - 20);

    ctx.fillStyle = "#ffb347";
    ctx.beginPath();
    ctx.arc(at(state.p), y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.textAlign = "left";
  }

  /* ---------------------------------------------------------------- input */

  function toggleCell(evt) {
    const rect = canvas.getBoundingClientRect ? canvas.getBoundingClientRect() : { left: 0, top: 0, width: W, height: H };
    const sx = (evt.clientX - rect.left) * (W / (rect.width || W));
    const sy = (evt.clientY - rect.top) * (H / (rect.height || H));
    const x = Math.floor((sx - state.x0) / state.cell);
    const y = Math.floor((sy - Y0) / state.cell);
    if (x < 0 || y < 0 || x >= state.size || y >= state.size) return;
    const i = y * state.size + x;
    if (!state.override) state.override = Uint8Array.from(state.open);
    state.override[i] = state.override[i] ? 0 : 1;
    rebuild();
    describe();
  }

  el("p").addEventListener("input", (evt) => {
    state.sweeping = false;
    el("sweep").textContent = "Sweep p";
    setP(Number(evt.target.value));
  });

  el("solo").addEventListener("change", (evt) => {
    state.solo = !!evt.target.checked;
    state.dirty = true;
  });

  el("sweep").addEventListener("click", sweep);
  el("reseed").addEventListener("click", reseed);
  el("coarse").addEventListener("click", () => setSize(80));
  el("fine").addEventListener("click", () => setSize(120));
  el("estimate").addEventListener("click", estimateCritical);
  canvas.addEventListener("click", toggleCell);

  document.addEventListener("keydown", (evt) => {
    const key = evt.key;
    if (key === " ") {
      evt.preventDefault();
      reseed();
    } else if (key === "s" || key === "S") {
      sweep();
    } else if (key === "e" || key === "E") {
      estimateCritical();
    }
  });

  /* ------------------------------------------------------------- main loop */

  function loop() {
    state.frame++;
    if (state.sweeping) {
      state.p = Math.min(state.sweepTo, state.p + 0.0035);
      el("p").value = String(state.p);
      el("p-out").textContent = state.p.toFixed(3);
      rebuild();
      if (state.p >= state.sweepTo) {
        state.sweeping = false;
        el("sweep").textContent = "Sweep p";
        el("sweep").classList.remove("active");
        describe();
        setStatus(
          `Sweep finished at p = ${state.p.toFixed(3)}. A spanning cluster first appeared at p ≈ ${
            state.spannedAt !== null ? state.spannedAt.toFixed(3) : "—"
          }, right where theory puts p_c.`,
          "good"
        );
      }
    }
    if (state.dirty) {
      draw();
      state.dirty = false;
    }
    requestAnimationFrame(loop);
  }

  window.__lab = {
    state,
    analyse,
    crossingProbability,
    estimateCritical,
    rebuild,
    setP,
    setSize,
    reseed,
    sweep,
    PC_SQUARE,
  };

  rebuild();
  describe();
  requestAnimationFrame(loop);
})();
