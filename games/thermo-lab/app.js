(() => {
  "use strict";

  // 1D heat equation dT/dt = alpha * d2T/dx2, explicit FTCS scheme.
  // Stability requires r = alpha*dt/dx^2 <= 0.5; we fix r = 0.4.
  // Boundary conditions: 0 = insulated (Neumann), 1 = fixed cold (Dirichlet 0),
  // 2 = fixed hot left / cold right (Dirichlet gradient).

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");

  const W = canvas.width || 880;
  const H = canvas.height || 660;

  const STAGE = { x: 26, y: 50, w: 828, h: 560 };
  const ROD = { x: STAGE.x + 40, y: STAGE.y + 80, w: STAGE.w - 80, h: 120 };
  const N = 100;
  const R = 0.4; // FTCS stability number

  const BC_NAMES = ["Insulated", "Fixed cold", "Hot/cold ends"];

  const PRESETS = {
    spot: { label: "Hot spot" },
    gradient: { label: "Gradient" },
    sine: { label: "Sine" },
    step: { label: "Step" },
  };

  const state = {
    alpha: 0.5,
    bc: 0,
    preset: "spot",
    T: new Array(N).fill(0),
    running: true,
    steps: 0,
  };

  /* --------------------------------------------------------------- heat core */

  function initialCondition(name) {
    const T = new Array(N).fill(0);
    for (let i = 0; i < N; i++) {
      const x = i / (N - 1);
      if (name === "spot") T[i] = Math.exp(-Math.pow((x - 0.5) / 0.08, 2));
      else if (name === "gradient") T[i] = 1 - x;
      else if (name === "sine") T[i] = 0.5 + 0.5 * Math.sin(2 * Math.PI * x);
      else if (name === "step") T[i] = x < 0.5 ? 1 : 0;
    }
    return T;
  }

  function heatStep(T, alpha, bc) {
    const next = new Array(N).fill(0);
    for (let i = 0; i < N; i++) {
      const left = i === 0 ? (bc === 0 ? T[1] : T[0]) : T[i - 1];
      const right = i === N - 1 ? (bc === 0 ? T[N - 2] : T[N - 1]) : T[i + 1];
      next[i] = T[i] + R * (left - 2 * T[i] + right);
    }
    if (bc === 1) { next[0] = 0; next[N - 1] = 0; }
    if (bc === 2) { next[0] = 1; next[N - 1] = 0; }
    return next;
  }

  function totalEnergy(T) {
    return T.reduce((s, v) => s + v, 0);
  }

  function meanTemp(T) {
    return totalEnergy(T) / T.length;
  }

  function isSteady(T) {
    const m = meanTemp(T);
    return T.every((v) => Math.abs(v - m) < 1e-3);
  }

  /* ------------------------------------------------------------------- drawing */

  function tempColor(t) {
    // blue (cold) -> green -> yellow -> red (hot), t in [0,1]
    const r = Math.round(255 * Math.max(0, t * 2 - 0.5));
    const g = Math.round(255 * (1 - Math.abs(t - 0.5) * 2));
    const b = Math.round(255 * Math.max(0, 1 - t * 2));
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#070907";
    ctx.fillRect(STAGE.x, STAGE.y, STAGE.w, STAGE.h);

    // rod heatmap
    const cw = ROD.w / N;
    for (let i = 0; i < N; i++) {
      ctx.fillStyle = tempColor(state.T[i]);
      ctx.fillRect(ROD.x + i * cw, ROD.y, cw + 1, ROD.h);
    }
    ctx.strokeStyle = "#26302a";
    ctx.lineWidth = 1;
    ctx.strokeRect(ROD.x, ROD.y, ROD.w, ROD.h);

    // profile line
    ctx.strokeStyle = "#eef5ea";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const px = ROD.x + (i / (N - 1)) * ROD.w;
      const py = ROD.y + ROD.h + 60 - state.T[i] * 50;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // mean line
    const m = meanTemp(state.T);
    ctx.strokeStyle = "rgba(124,196,255,0.6)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(ROD.x, ROD.y + ROD.h + 60 - m * 50);
    ctx.lineTo(ROD.x + ROD.w, ROD.y + ROD.h + 60 - m * 50);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#93a48f";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(
      "α=" + state.alpha.toFixed(2) + "  BC=" + BC_NAMES[state.bc] + "  steps=" + state.steps,
      STAGE.x + 8,
      STAGE.y + 16
    );
  }

  /* ------------------------------------------------------------------ readouts */

  function updateReadouts() {
    const tmax = Math.max(...state.T);
    const tmin = Math.min(...state.T);
    const e = totalEnergy(state.T);

    el("alpha-out").textContent = state.alpha.toFixed(2);
    el("bc-out").textContent = BC_NAMES[state.bc];

    el("tmax-hud").textContent = "max " + tmax.toFixed(3);
    el("tmin-hud").textContent = "min " + tmin.toFixed(3);
    el("energy-hud").textContent = "energy " + e.toFixed(1);

    el("tmax-read").textContent = tmax.toFixed(3);
    el("tmin-read").textContent = tmin.toFixed(3);
    el("tmean-read").textContent = meanTemp(state.T).toFixed(3);
    el("energy-read").textContent = e.toFixed(2);
    el("steady-read").textContent = isSteady(state.T) ? "yes" : "no";
    el("steps-read").textContent = String(state.steps);
  }

  function describe() {
    const e = totalEnergy(state.T);
    const m = meanTemp(state.T);
    let msg;
    if (state.bc === 0) {
      msg = "Insulated ends: total energy is conserved at " + e.toFixed(1) + ". The profile flattens toward the mean " + m.toFixed(3) + " — heat spreads but never leaves.";
    } else if (state.bc === 1) {
      msg = "Fixed cold ends: heat drains out through the boundaries. Total energy falls from " + e.toFixed(1) + " toward 0 — the rod cools completely.";
    } else {
      msg = "Hot/cold ends: the rod settles into a linear gradient from 1 to 0 — the steady state of the heat equation with Dirichlet boundaries.";
    }
    el("status").textContent = msg;
  }

  /* -------------------------------------------------------------------- wiring */

  function setPreset(name) {
    state.preset = name;
    state.T = initialCondition(name);
    state.steps = 0;
    ["spot", "gradient", "sine", "step"].forEach((kk) => {
      el("preset-" + kk).classList.toggle("active", kk === name);
    });
    updateReadouts();
    describe();
    draw();
  }

  el("alpha").addEventListener("input", (evt) => {
    state.alpha = Math.max(0.05, Math.min(1, Number(evt.target.value) || 0.5));
    updateReadouts();
    describe();
    draw();
  });
  el("bc").addEventListener("input", (evt) => {
    state.bc = Math.max(0, Math.min(2, Number(evt.target.value) || 0));
    updateReadouts();
    describe();
    draw();
  });

  el("preset-spot").addEventListener("click", () => setPreset("spot"));
  el("preset-gradient").addEventListener("click", () => setPreset("gradient"));
  el("preset-sine").addEventListener("click", () => setPreset("sine"));
  el("preset-step").addEventListener("click", () => setPreset("step"));

  el("btn-run").addEventListener("click", () => {
    state.running = !state.running;
    el("btn-run").textContent = state.running ? "Pause" : "Run";
    el("btn-run").classList.toggle("active", state.running);
  });
  el("btn-reset").addEventListener("click", () => setPreset(state.preset));

  document.addEventListener("keydown", (evt) => {
    if (evt.key === "1") setPreset("spot");
    else if (evt.key === "2") setPreset("gradient");
    else if (evt.key === "3") setPreset("sine");
    else if (evt.key === "4") setPreset("step");
    else if (evt.key === " ") {
      evt.preventDefault();
      el("btn-run").click();
    } else if (evt.key === "r" || evt.key === "R") el("btn-reset").click();
  });

  let last = 0;
  function frame(nowMs) {
    const dt = last ? (nowMs - last) / 1000 : 0.016;
    last = nowMs;
    if (state.running) {
      const steps = Math.max(1, Math.round(dt * 60));
      for (let i = 0; i < steps; i++) {
        state.T = heatStep(state.T, state.alpha, state.bc);
        state.steps++;
      }
      updateReadouts();
      draw();
    }
    requestAnimationFrame(frame);
  }

  window.__lab = {
    state,
    N,
    R,
    heatStep,
    initialCondition,
    totalEnergy,
    meanTemp,
    isSteady,
    setPreset,
    updateReadouts,
    describe,
    draw,
  };

  setPreset("spot");
  requestAnimationFrame(frame);
})();
