(() => {
  "use strict";

  // Three heuristics for the travelling salesman problem on the same point set.
  //
  //   nearest neighbour  — greedy construction, usually 15-25% above optimal
  //   2-opt              — deterministic local search that removes crossing edges
  //   simulated annealing— 2-opt moves accepted with probability exp(−Δ/T)
  //
  // The panel also builds a minimum spanning tree over the cities. Any tour is
  // a spanning structure, so MST weight is a genuine lower bound on the optimal
  // tour, which makes the reported gap meaningful rather than decorative.

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");

  const W = canvas.width || 880;
  const H = canvas.height || 660;
  const PAD = 34;
  // The top strip holds the history sparkline, the bottom strip the footer, so
  // cities live only between these two lines.
  const TOP = 78;
  const BOT = H - 30;

  const state = {
    cities: [],
    greedyTour: [],
    twoTour: [],
    saTour: [],
    bestTour: [],
    greedyLen: 0,
    twoLen: 0,
    saLen: 0,
    bestLen: 0,
    mstLen: 0,
    temperature: 0.4,
    startTemp: 0.4,
    cooling: 0.97,
    sweeps: 0,
    moves: 0,
    running: true,
    seed: 24680,
    history: [],
    drag: -1,
    layout: "grid",
    edgeScale: 100,
    frame: 0,
    statusKind: "",
  };

  function seeded(seed) {
    let s = (seed >>> 0) || 1;
    return () => {
      s ^= s << 13;
      s >>>= 0;
      s ^= s >>> 17;
      s ^= s << 5;
      s >>>= 0;
      return s / 4294967296;
    };
  }

  /* ------------------------------------------------------------- geometry */

  function dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function tourLength(tour, cities) {
    const list = cities || state.cities;
    if (list.length < 2 || tour.length !== list.length) return 0;
    let total = 0;
    for (let i = 0; i < tour.length; i++) {
      total += dist(list[tour[i]], list[tour[(i + 1) % tour.length]]);
    }
    return total;
  }

  function nearestNeighbour(start) {
    const n = state.cities.length;
    if (!n) return [];
    const used = new Uint8Array(n);
    const tour = [start];
    used[start] = 1;
    for (let step = 1; step < n; step++) {
      const last = state.cities[tour[tour.length - 1]];
      let best = -1;
      let bestD = Infinity;
      for (let i = 0; i < n; i++) {
        if (used[i]) continue;
        const d = dist(last, state.cities[i]);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }
      used[best] = 1;
      tour.push(best);
    }
    return tour;
  }

  function twoOptOnce(tour) {
    // Returns an improved tour plus the number of improving moves applied.
    const n = tour.length;
    let moves = 0;
    let improved = true;
    let current = tour.slice();
    let guard = 0;

    while (improved && guard < 40) {
      improved = false;
      guard++;
      for (let i = 0; i < n - 1; i++) {
        for (let j = i + 2; j < n; j++) {
          if (i === 0 && j === n - 1) continue;
          const a = current[i];
          const b = current[i + 1];
          const c = current[j];
          const d = current[(j + 1) % n];
          const before = dist(state.cities[a], state.cities[b]) + dist(state.cities[c], state.cities[d]);
          const after = dist(state.cities[a], state.cities[c]) + dist(state.cities[b], state.cities[d]);
          if (after + 1e-9 < before) {
            reverseSegment(current, i + 1, j);
            improved = true;
            moves++;
          }
        }
      }
    }
    return { tour: current, moves };
  }

  function reverseSegment(tour, i, j) {
    while (i < j) {
      const tmp = tour[i];
      tour[i] = tour[j];
      tour[j] = tmp;
      i++;
      j--;
    }
  }

  function mstLowerBound() {
    // Prim's algorithm over the complete graph. Every tour is a spanning
    // structure, so the MST weight cannot exceed the optimal tour length.
    const n = state.cities.length;
    if (n < 2) return 0;
    const inTree = new Uint8Array(n);
    const best = new Float64Array(n).fill(Infinity);
    best[0] = 0;
    let total = 0;
    for (let iter = 0; iter < n; iter++) {
      let pick = -1;
      for (let i = 0; i < n; i++) {
        if (!inTree[i] && (pick === -1 || best[i] < best[pick])) pick = i;
      }
      inTree[pick] = 1;
      total += best[pick];
      for (let i = 0; i < n; i++) {
        if (inTree[i]) continue;
        const d = dist(state.cities[pick], state.cities[i]);
        if (d < best[i]) best[i] = d;
      }
    }
    return total;
  }

  /* ------------------------------------------------------------ the search */

  function annealSweep() {
    // One sweep is O(n²) candidate 2-opt moves; accepted moves may increase the
    // tour length when the temperature is high.
    const n = state.saTour.length;
    if (n < 4) return;
    // Temperature is kept in units of the mean tour edge (edgeScale), so the
    // slider means the same thing whether the map holds 8 cities or 80.
    const T = Math.max(1e-6, state.temperature * state.edgeScale);
    let accepted = 0;

    for (let trial = 0; trial < n * 2; trial++) {
      const i = Math.floor(Math.random() * (n - 2));
      const j = i + 2 + Math.floor(Math.random() * (n - i - 3));
      if (j >= n) continue;
      const a = state.saTour[i];
      const b = state.saTour[i + 1];
      const c = state.saTour[j];
      const d = state.saTour[(j + 1) % n];
      const before = dist(state.cities[a], state.cities[b]) + dist(state.cities[c], state.cities[d]);
      const after = dist(state.cities[a], state.cities[c]) + dist(state.cities[b], state.cities[d]);
      const delta = after - before;
      if (delta < 0 || Math.random() < Math.exp(-delta / T)) {
        reverseSegment(state.saTour, i + 1, j);
        accepted++;
      }
    }

    state.sweeps++;
    state.temperature = Math.max(1e-5, state.temperature * state.cooling);
    state.saLen = tourLength(state.saTour);
    if (state.saLen < state.bestLen) {
      state.bestLen = state.saLen;
      state.bestTour = state.saTour.slice();
    }
    state.history.push(Math.min(state.saLen, state.bestLen));
    if (state.history.length > 400) state.history.shift();
    if (accepted) state.moves += accepted;
  }

  function buildAll() {
    const n = state.cities.length;
    if (!n) {
      resetTours();
      return;
    }

    state.greedyTour = nearestNeighbour(0);
    state.greedyLen = tourLength(state.greedyTour);

    const improved = twoOptOnce(state.greedyTour);
    state.twoTour = improved.tour;
    state.twoLen = tourLength(state.twoTour);
    state.twoMoves = improved.moves;

    // Annealing starts from the 2-opt tour: in practice it is used to polish a
    // local optimum, and starting from greedy would just re-derive the mess
    // that 2-opt already cleaned up.
    state.saTour = state.twoTour.slice();
    state.saLen = state.twoLen;
    state.bestTour = state.saTour.slice();
    state.bestLen = state.saLen;
    state.edgeScale = Math.max(1, state.greedyLen / n);
    state.temperature = state.startTemp;
    state.sweeps = 0;
    state.moves = improved.moves;
    state.history = [state.bestLen];
    state.bestLen = Math.min(state.twoLen, state.saLen);
    state.bestTour = state.twoLen <= state.saLen ? state.twoTour.slice() : state.saTour.slice();
    state.mstLen = mstLowerBound();
    updateReadouts();
    describe();
  }

  function resetTours() {
    state.greedyTour = [];
    state.twoTour = [];
    state.saTour = [];
    state.bestTour = [];
    state.greedyLen = 0;
    state.twoLen = 0;
    state.saLen = 0;
    state.bestLen = 0;
    state.mstLen = 0;
    state.history = [];
    updateReadouts();
  }

  /* ---------------------------------------------------------- city layouts */

  function scatterCities(count, mode) {
    const rand = seeded((state.seed = (state.seed * 1664525 + 1013904223) >>> 0));
    const cities = [];
    const left = PAD + 14;
    const right = W - PAD - 14;
    const top = TOP + 10;
    const bottom = BOT - 10;

    if (mode === "cluster") {
      const centres = [];
      for (let c = 0; c < 4; c++) {
        centres.push({
          x: left + rand() * (right - left),
          y: top + rand() * (bottom - top),
        });
      }
      for (let i = 0; i < count; i++) {
        const centre = centres[i % centres.length];
        const angle = rand() * Math.PI * 2;
        const radius = 18 + rand() * 52;
        cities.push({
          x: Math.max(left, Math.min(right, centre.x + Math.cos(angle) * radius)),
          y: Math.max(top, Math.min(bottom, centre.y + Math.sin(angle) * radius)),
        });
      }
    } else if (mode === "grid") {
      // A jittered lattice: structured enough that the crossing structure of
      // the tours is easy to see, random enough to avoid a trivial answer.
      const cols = Math.max(2, Math.ceil(Math.sqrt((count * W) / H)));
      const rows = Math.ceil(count / cols);
      const cw = (right - left) / Math.max(1, cols - 1);
      const ch = (bottom - top) / Math.max(1, rows - 1);
      for (let i = 0; i < count; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        cities.push({
          x: left + col * cw + (rand() - 0.5) * cw * 0.35,
          y: top + row * ch + (rand() - 0.5) * ch * 0.35,
        });
      }
    } else {
      for (let i = 0; i < count; i++) {
        cities.push({
          x: left + rand() * (right - left),
          y: top + rand() * (bottom - top),
        });
      }
    }

    state.cities = cities;
    buildAll();
  }

  /* ------------------------------------------------------------- readouts */

  function fmt(v) {
    return v ? v.toFixed(1) : "—";
  }

  function gapPercent() {
    if (!state.bestLen || !state.mstLen) return null;
    return (100 * (state.bestLen - state.mstLen)) / state.bestLen;
  }

  function setStatus(text, kind) {
    const box = el("status");
    box.textContent = text;
    box.className = "status" + (kind ? " " + kind : "");
    state.statusKind = kind || "";
  }

  function updateReadouts() {
    el("greedy-read").textContent = fmt(state.greedyLen);
    el("two-read").textContent = fmt(state.twoLen);
    el("sa-read").textContent = fmt(state.saLen);
    el("bound-read").textContent = fmt(state.mstLen);
    const gap = gapPercent();
    el("gap-read").textContent = gap === null ? "—" : gap.toFixed(1) + "%";
    el("sweep-read").textContent = String(state.sweeps);
    el("t-read").textContent = (state.temperature * state.edgeScale).toFixed(1);
    el("moves-read").textContent = String(state.moves);
    el("best-hud").textContent = "best " + fmt(state.bestLen);
    el("gap-hud").textContent = gap === null ? "gap —" : "gap " + gap.toFixed(1) + "%";
    el("cities-hud").textContent = state.cities.length + " cities";
    el("temp-out").textContent = state.startTemp.toFixed(2);
    el("cool-out").textContent = state.cooling.toFixed(3);
    el("count-out").textContent = String(state.cities.length);
  }

  function describe() {
    const n = state.cities.length;
    if (!n) {
      setStatus("No cities yet. Click the map to place some, or press S to scatter a seeded set.", "idle");
      return;
    }
    if (n < 5) {
      setStatus("Place at least five cities — with fewer, almost every tour is already optimal.", "idle");
      return;
    }
    const gap = gapPercent();
    const saBetter = state.bestLen < state.greedyLen - 0.5;
    setStatus(
      `Nearest neighbour ${fmt(state.greedyLen)} → 2-opt ${fmt(state.twoLen)} → annealing ${fmt(
        state.saLen
      )}. Best tour ${fmt(state.bestLen)}, MST bound ${fmt(state.mstLen)}, so it is within ${
        gap === null ? "?" : gap.toFixed(1)
      }% of a provable floor.${saBetter ? " Annealing found a shorter tour than 2-opt alone." : ""}`,
      "good"
    );
  }

  /* -------------------------------------------------------------- drawing */

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#070c10";
    ctx.fillRect(0, 0, W, H);

    // Faint grid so distances feel spatial.
    ctx.strokeStyle = "rgba(120, 160, 180, 0.06)";
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 44) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += 44) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(W, y + 0.5);
      ctx.stroke();
    }

    if (state.cities.length > 1) {
      strokeTour(state.greedyTour, "#5c6c7a", 1.1, [4, 6]);
      strokeTour(state.twoTour, "#ffb45f", 1.2, [7, 4]);
      strokeTour(state.bestTour, "#6ff0c8", 2.2, []);
      drawCities();
    } else {
      drawCities();
      ctx.fillStyle = "#5f7482";
      ctx.font = "13px 'Inter', system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Click to place cities", W / 2, H / 2);
      ctx.textAlign = "left";
    }

    drawHistory();

    ctx.fillStyle = "#6f8493";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(
      `${state.cities.length} cities · temperature ${(state.temperature * state.edgeScale).toFixed(1)} u · sweep ${state.sweeps}`,
      PAD,
      H - 14
    );
    ctx.textAlign = "right";
    ctx.fillStyle = state.running ? "#6ff0c8" : "#ffcf7a";
    ctx.fillText(state.running ? "annealing" : "paused", W - PAD, H - 14);
    ctx.textAlign = "left";
  }

  function strokeTour(tour, colour, width, dash) {
    if (tour.length < 2) return;
    ctx.strokeStyle = colour;
    ctx.lineWidth = width;
    ctx.setLineDash(dash);
    ctx.beginPath();
    tour.forEach((idx, i) => {
      const city = state.cities[idx];
      if (i === 0) ctx.moveTo(city.x, city.y);
      else ctx.lineTo(city.x, city.y);
    });
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawCities() {
    state.cities.forEach((city, i) => {
      ctx.beginPath();
      ctx.arc(city.x, city.y, i === 0 ? 6 : 4, 0, Math.PI * 2);
      ctx.fillStyle = i === 0 ? "#ffcf7a" : "#eaf2f7";
      ctx.fill();
      ctx.strokeStyle = "#070c10";
      ctx.lineWidth = 1.4;
      ctx.stroke();
    });
  }

  function drawHistory() {
    const w = 168;
    const h = 62;
    const x = W - w - 20;
    const y = 10;
    ctx.fillStyle = "rgba(10, 16, 20, 0.86)";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#22303a";
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);

    ctx.fillStyle = "#7c94a2";
    ctx.font = "9.5px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("best tour per sweep", x + 8, y + 14);

    if (state.history.length > 2) {
      let lo = Infinity;
      let hi = -Infinity;
      for (const v of state.history) {
        lo = Math.min(lo, v);
        hi = Math.max(hi, v);
      }
      if (hi - lo < 1e-6) hi = lo + 1;
      ctx.strokeStyle = "#6ff0c8";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      state.history.forEach((v, i) => {
        const px = x + 8 + (i / (state.history.length - 1)) * (w - 16);
        const py = y + h - 12 - ((hi - v) / (hi - lo)) * (h - 32);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.fillStyle = "#5f7482";
      ctx.fillText(lo.toFixed(0), x + 8, y + h - 3);
      ctx.textAlign = "right";
      ctx.fillText(hi.toFixed(0), x + w - 8, y + h - 3);
      ctx.textAlign = "left";
    }
  }

  /* ---------------------------------------------------------------- input */

  function pickCity(x, y) {
    let best = -1;
    let bestD = 14;
    state.cities.forEach((city, i) => {
      const d = Math.hypot(city.x - x, city.y - y);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    return best;
  }

  function canvasPoint(evt) {
    const rect = canvas.getBoundingClientRect ? canvas.getBoundingClientRect() : { left: 0, top: 0, width: W, height: H };
    return [
      (evt.clientX - rect.left) * (W / (rect.width || W)),
      (evt.clientY - rect.top) * (H / (rect.height || H)),
    ];
  }

  canvas.addEventListener("pointerdown", (evt) => {
    const [x, y] = canvasPoint(evt);
    state.drag = pickCity(x, y);
    if (state.drag >= 0) return;
    if (state.cities.length >= 120) return;
    state.cities.push({ x, y });
    state.seed = 1;
    buildAll();
  });

  canvas.addEventListener("pointermove", (evt) => {
    if (state.drag < 0) return;
    const [x, y] = canvasPoint(evt);
    state.cities[state.drag] = {
      x: Math.max(PAD, Math.min(W - PAD, x)),
      y: Math.max(TOP, Math.min(BOT, y)),
    };
    if (state.frame % 6 === 0) buildAll();
  });

  canvas.addEventListener("pointerup", () => {
    if (state.drag >= 0) {
      state.drag = -1;
      buildAll();
    }
  });
  canvas.addEventListener("pointerleave", () => {
    if (state.drag >= 0) {
      state.drag = -1;
      buildAll();
    }
  });

  function sliderCount() {
    return Math.max(5, Math.min(80, Number(el("count").value) || 24));
  }

  el("count").addEventListener("input", (evt) => {
    scatterCities(sliderCount(), state.layout || "grid");
  });

  el("temp").addEventListener("input", (evt) => {
    state.startTemp = Math.max(0.05, Math.min(1.5, Number(evt.target.value) || 0.4));
    state.temperature = state.startTemp;
    updateReadouts();
  });
  el("cool").addEventListener("input", (evt) => {
    state.cooling = Math.max(0.9, Math.min(0.999, Number(evt.target.value) || 0.97));
    updateReadouts();
  });

  el("toggle").addEventListener("click", () => {
    state.running = !state.running;
    el("toggle").textContent = state.running ? "Pause" : "Run";
  });

  el("run").addEventListener("click", () => buildAll());
  function setLayout(mode, button) {
    state.layout = mode;
    ["grid", "scatter", "cluster"].forEach((id) => el(id).classList.toggle("active", id === button));
    scatterCities(sliderCount(), mode);
  }

  el("grid").addEventListener("click", () => setLayout("grid", "grid"));
  el("scatter").addEventListener("click", () => setLayout("scatter", "scatter"));
  el("cluster").addEventListener("click", () => setLayout("cluster", "cluster"));
  el("clear").addEventListener("click", () => {
    state.cities = [];
    resetTours();
    describe();
  });

  document.addEventListener("keydown", (evt) => {
    const key = evt.key;
    if (key === " ") {
      evt.preventDefault();
      state.running = !state.running;
      el("toggle").textContent = state.running ? "Pause" : "Run";
    } else if (key === "r" || key === "R") buildAll();
    else if (key === "s" || key === "S") {
      scatterCities(sliderCount(), "scatter");
    }
  });

  /* ------------------------------------------------------------- main loop */

  function loop() {
    state.frame++;
    if (state.running && state.cities.length >= 4) {
      annealSweep();
      updateReadouts();
      if (state.frame % 20 === 0) describe();
    }
    draw();
    requestAnimationFrame(loop);
  }

  window.__lab = {
    state,
    tourLength,
    nearestNeighbour,
    twoOptOnce,
    mstLowerBound,
    annealSweep,
    buildAll,
    scatterCities,
    updateReadouts,
    gapPercent,
    dist,
  };

  scatterCities(sliderCount(), "grid");
  draw();
  requestAnimationFrame(loop);
})();
