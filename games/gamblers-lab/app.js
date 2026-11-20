(() => {
  "use strict";

  // Gambler's ruin: random walk on {0, ..., N} starting at i, absorbing at
  // 0 (ruin) and N (goal), win probability p per step.
  // Ruin probability: (q/p)^i / (1 + (q/p)^N) ... in closed form:
  //   P(ruin) = (1 - (q/p)^i) / (1 - (q/p)^N)   for p != 0.5
  //   P(ruin) = 1 - i/N                          for p = 0.5
  // Expected duration: i(N-i) for p = 0.5; (i - N*P(ruin))/(q-p) otherwise.

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");

  const W = canvas.width || 880;
  const H = canvas.height || 660;

  const STAGE = { x: 26, y: 50, w: 828, h: 560 };

  const PRESETS = {
    fair: { label: "Fair", i: 50, n: 100, p: 0.5 },
    unfair: { label: "Unfair", i: 50, n: 100, p: 0.4 },
    favorable: { label: "Favorable", i: 50, n: 100, p: 0.6 },
    longshot: { label: "Long shot", i: 10, n: 100, p: 0.5 },
  };

  const state = {
    i: 50,
    n: 100,
    p: 0.5,
    preset: "fair",
    walks: [],
    simRuin: null,
    simDur: null,
    seed: 555,
  };

  /* -------------------------------------------------------------- ruin maths */

  function ruinProbability(i, N, p) {
    if (i <= 0) return 1;
    if (i >= N) return 0;
    if (Math.abs(p - 0.5) < 1e-12) return 1 - i / N;
    const q = 1 - p;
    const ratio = q / p;
    const goal = (1 - Math.pow(ratio, i)) / (1 - Math.pow(ratio, N));
    return 1 - goal;
  }

  function expectedDuration(i, N, p) {
    if (Math.abs(p - 0.5) < 1e-12) return i * (N - i);
    const q = 1 - p;
    return (i - N * ruinProbability(i, N, p)) / (q - p);
  }

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function simulateWalk(i, N, p, rng) {
    let x = i;
    const path = [x];
    let steps = 0;
    while (x > 0 && x < N) {
      x += rng() < p ? 1 : -1;
      steps++;
      if (path.length < 500) path.push(x);
      if (steps > 100000) break;
    }
    return { outcome: x >= N ? "goal" : "ruin", steps, path };
  }

  /* ------------------------------------------------------------------- drawing */

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#070907";
    ctx.fillRect(STAGE.x, STAGE.y, STAGE.w, STAGE.h);

    const plot = { x: STAGE.x + 40, y: STAGE.y + 30, w: STAGE.w - 80, h: STAGE.h - 70 };
    const Y = (v) => plot.y + plot.h - (v / state.n) * plot.h;

    // goal / ruin lines
    ctx.strokeStyle = "#7cc4ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(plot.x, Y(state.n));
    ctx.lineTo(plot.x + plot.w, Y(state.n));
    ctx.stroke();
    ctx.strokeStyle = "#ff8fa3";
    ctx.beginPath();
    ctx.moveTo(plot.x, Y(0));
    ctx.lineTo(plot.x + plot.w, Y(0));
    ctx.stroke();

    // start line
    ctx.strokeStyle = "rgba(238,245,234,0.4)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(plot.x, Y(state.i));
    ctx.lineTo(plot.x + plot.w, Y(state.i));
    ctx.stroke();
    ctx.setLineDash([]);

    // walks
    ctx.strokeStyle = "rgba(155,225,93,0.3)";
    ctx.lineWidth = 1;
    state.walks.forEach((w) => {
      ctx.beginPath();
      const n = w.path.length;
      w.path.forEach((v, k) => {
        const px = plot.x + (k / Math.max(1, n - 1)) * plot.w;
        if (k === 0) ctx.moveTo(px, Y(v));
        else ctx.lineTo(px, Y(v));
      });
      ctx.stroke();
    });

    ctx.fillStyle = "#93a48f";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(
      "i=" + state.i + "  N=" + state.n + "  p=" + state.p.toFixed(2) + "  walks=" + state.walks.length,
      STAGE.x + 8,
      STAGE.y + 16
    );
    ctx.fillText("goal N", plot.x + plot.w - 50, Y(state.n) - 6);
    ctx.fillText("ruin 0", plot.x + plot.w - 50, Y(0) + 14);
  }

  /* ------------------------------------------------------------------ readouts */

  function updateReadouts() {
    const theory = ruinProbability(state.i, state.n, state.p);
    const dur = expectedDuration(state.i, state.n, state.p);
    const goals = state.walks.filter((w) => w.outcome === "goal").length;

    el("i-out").textContent = String(state.i);
    el("n-out").textContent = String(state.n);
    el("p-out").textContent = state.p.toFixed(2);

    el("ruin-hud").textContent = "ruin " + (theory * 100).toFixed(1) + "%";
    el("dur-hud").textContent = "duration " + dur.toFixed(0);
    el("sim-hud").textContent = "simulated " + (state.simRuin === null ? "—" : (state.simRuin * 100).toFixed(1) + "%");

    el("ruin-read").textContent = (theory * 100).toFixed(1) + "%";
    el("sim-read").textContent = state.simRuin === null ? "—" : (state.simRuin * 100).toFixed(1) + "%";
    el("dur-read").textContent = dur.toFixed(0);
    el("simdur-read").textContent = state.simDur === null ? "—" : state.simDur.toFixed(0);
    el("walks-read").textContent = String(state.walks.length);
    el("goals-read").textContent = String(goals);
  }

  function describe() {
    const theory = ruinProbability(state.i, state.n, state.p);
    let msg;
    if (Math.abs(state.p - 0.5) < 1e-12) {
      msg = "Fair game: ruin probability is exactly 1 − i/N = " + (theory * 100).toFixed(0) + "%. The walk is a martingale — no strategy can beat it, and the absorbing walls make the end certain.";
    } else if (state.p < 0.5) {
      msg = "Unfair (p=" + state.p.toFixed(2) + "): ruin probability is " + (theory * 100).toFixed(1) + "% — a " + ((0.5 - state.p) * 200).toFixed(0) + "% house edge compounds brutally. The formula (q/p)ⁱ punishes every round.";
    } else {
      msg = "Favorable (p=" + state.p.toFixed(2) + "): ruin probability drops to " + (theory * 100).toFixed(1) + "%. A small edge, held long enough, wins — the same mathematics, reversed.";
    }
    el("status").textContent = msg;
  }

  /* -------------------------------------------------------------------- wiring */

  function simulate() {
    const rng = mulberry32(state.seed);
    state.walks = [];
    let ruins = 0;
    let totalSteps = 0;
    for (let k = 0; k < 50; k++) {
      const w = simulateWalk(state.i, state.n, state.p, rng);
      state.walks.push(w);
      if (w.outcome === "ruin") ruins++;
      totalSteps += w.steps;
    }
    state.simRuin = ruins / state.walks.length;
    state.simDur = totalSteps / state.walks.length;
    state.seed = (state.seed * 1103515245 + 12345) >>> 0;
    updateReadouts();
    describe();
    draw();
  }

  function setPreset(name) {
    const p = PRESETS[name];
    if (!p) return;
    state.preset = name;
    state.i = p.i;
    state.n = p.n;
    state.p = p.p;
    el("i").value = String(p.i);
    el("n").value = String(p.n);
    el("p").value = String(p.p);
    ["fair", "unfair", "favorable", "longshot"].forEach((kk) => {
      el("preset-" + kk).classList.toggle("active", kk === name);
    });
    simulate();
  }

  function clearPresets() {
    state.preset = "";
    ["fair", "unfair", "favorable", "longshot"].forEach((kk) => el("preset-" + kk).classList.remove("active"));
  }

  el("i").addEventListener("input", (evt) => {
    state.i = Math.max(5, Math.min(95, Number(evt.target.value) || 50));
    clearPresets();
    simulate();
  });
  el("n").addEventListener("input", (evt) => {
    state.n = Math.max(20, Math.min(200, Number(evt.target.value) || 100));
    clearPresets();
    simulate();
  });
  el("p").addEventListener("input", (evt) => {
    state.p = Math.max(0.3, Math.min(0.7, Number(evt.target.value) || 0.5));
    clearPresets();
    simulate();
  });

  el("preset-fair").addEventListener("click", () => setPreset("fair"));
  el("preset-unfair").addEventListener("click", () => setPreset("unfair"));
  el("preset-favorable").addEventListener("click", () => setPreset("favorable"));
  el("preset-longshot").addEventListener("click", () => setPreset("longshot"));

  el("btn-sim").addEventListener("click", simulate);
  el("btn-reset").addEventListener("click", () => {
    state.walks = [];
    state.simRuin = null;
    state.simDur = null;
    updateReadouts();
    describe();
    draw();
  });

  document.addEventListener("keydown", (evt) => {
    if (evt.key === "1") setPreset("fair");
    else if (evt.key === "2") setPreset("unfair");
    else if (evt.key === "3") setPreset("favorable");
    else if (evt.key === "4") setPreset("longshot");
    else if (evt.key === " ") {
      evt.preventDefault();
      simulate();
    } else if (evt.key === "r" || evt.key === "R") el("btn-reset").click();
  });

  window.__lab = {
    state,
    PRESETS,
    ruinProbability,
    expectedDuration,
    simulateWalk,
    setPreset,
    simulate,
    updateReadouts,
    describe,
    draw,
  };

  simulate();
})();
