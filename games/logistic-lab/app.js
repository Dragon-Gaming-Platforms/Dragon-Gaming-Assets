(() => {
  "use strict";

  // Logistic map: x_{n+1} = r * x_n * (1 - x_n). The bifurcation diagram
  // shows the long-run attractor for each r. Fixed point x* = 1 - 1/r
  // (stable for r < 3). Period-doubling at r = 3, 3.449..., 3.544...,
  // chaos beyond r ≈ 3.57. Lyapunov exponent λ = mean(ln|r(1-2x)|).

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");

  const W = canvas.width || 880;
  const H = canvas.height || 660;

  const STAGE = { x: 26, y: 50, w: 828, h: 560 };
  const DIAGRAM = { x: STAGE.x + 30, y: STAGE.y + 20, w: STAGE.w - 60, h: 330 };
  const SERIES = { x: STAGE.x + 30, y: STAGE.y + 390, w: STAGE.w - 60, h: 140 };
  const R_MIN = 2.5, R_MAX = 4.0;

  const PRESETS = {
    fixed: { label: "Fixed", r: 2.8 },
    period2: { label: "Period-2", r: 3.2 },
    period4: { label: "Period-4", r: 3.5 },
    chaos: { label: "Chaos", r: 3.9 },
  };

  const state = {
    r: 3.9,
    x0: 0.5,
    preset: "chaos",
    showSeries: true,
    x: 0.5,
    iter: 0,
    series: [],
  };

  /* -------------------------------------------------------------- logistic core */

  function logisticStep(x, r) {
    return r * x * (1 - x);
  }

  function fixedPoint(r) {
    return 1 - 1 / r;
  }

  function attractorPoints(r, x0, discard, samples) {
    let x = x0;
    for (let i = 0; i < discard; i++) x = logisticStep(x, r);
    const pts = [];
    for (let i = 0; i < samples; i++) {
      x = logisticStep(x, r);
      pts.push(x);
    }
    return pts;
  }

  function countPeriod(pts) {
    // cluster the attractor points: count distinct values (tolerance 1e-3)
    const sorted = [...pts].sort((a, b) => a - b);
    let count = 0;
    let last = -Infinity;
    for (const v of sorted) {
      if (v - last > 1e-3) count++;
      last = v;
    }
    return count;
  }

  function lyapunov(r, x0, n) {
    let x = x0;
    let sum = 0;
    for (let i = 0; i < 100; i++) x = logisticStep(x, r); // discard transient
    for (let i = 0; i < n; i++) {
      x = logisticStep(x, r);
      sum += Math.log(Math.abs(r * (1 - 2 * x)) + 1e-12);
    }
    return sum / n;
  }

  /* ------------------------------------------------------------------- drawing */

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#070907";
    ctx.fillRect(STAGE.x, STAGE.y, STAGE.w, STAGE.h);

    // bifurcation diagram
    ctx.fillStyle = "#9be15d";
    const cols = 400;
    for (let i = 0; i < cols; i++) {
      const r = R_MIN + ((R_MAX - R_MIN) * i) / cols;
      const pts = attractorPoints(r, 0.5, 200, 40);
      const px = DIAGRAM.x + (i / cols) * DIAGRAM.w;
      pts.forEach((v) => {
        const py = DIAGRAM.y + DIAGRAM.h - v * DIAGRAM.h;
        ctx.fillRect(px, py, 1.5, 1.5);
      });
    }

    // fixed-point curve
    ctx.strokeStyle = "rgba(124,196,255,0.6)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i <= cols; i++) {
      const r = R_MIN + ((R_MAX - R_MIN) * i) / cols;
      const px = DIAGRAM.x + (i / cols) * DIAGRAM.w;
      const py = DIAGRAM.y + DIAGRAM.h - fixedPoint(r) * DIAGRAM.h;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // current r marker
    const rx = DIAGRAM.x + ((state.r - R_MIN) / (R_MAX - R_MIN)) * DIAGRAM.w;
    ctx.strokeStyle = "#ffb45f";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(rx, DIAGRAM.y);
    ctx.lineTo(rx, DIAGRAM.y + DIAGRAM.h);
    ctx.stroke();

    ctx.fillStyle = "#93a48f";
    ctx.font = "10px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("r", DIAGRAM.x, DIAGRAM.y + DIAGRAM.h + 14);
    ctx.fillText("x", DIAGRAM.x - 14, DIAGRAM.y + 10);
    ctx.fillText("bifurcation diagram", DIAGRAM.x, DIAGRAM.y - 6);

    // time series
    if (state.showSeries && state.series.length > 1) {
      ctx.strokeStyle = "#ffb45f";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      state.series.forEach((v, i) => {
        const px = SERIES.x + (i / (state.series.length - 1)) * SERIES.w;
        const py = SERIES.y + SERIES.h - v * SERIES.h;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.fillStyle = "#93a48f";
      ctx.fillText("time series (last " + state.series.length + " iterates)", SERIES.x, SERIES.y - 6);
    }
  }

  /* ------------------------------------------------------------------ readouts */

  function updateReadouts() {
    const pts = attractorPoints(state.r, state.x0, 500, 200);
    const period = countPeriod(pts);
    const lam = lyapunov(state.r, state.x0, 500);

    el("r-out").textContent = state.r.toFixed(3);
    el("x0-out").textContent = state.x0.toFixed(2);

    el("r-hud").textContent = "r " + state.r.toFixed(3);
    el("period-hud").textContent = "period " + period;
    el("lyap-hud").textContent = "Lyapunov " + lam.toFixed(2);

    el("fixed-read").textContent = fixedPoint(state.r).toFixed(4);
    el("period-read").textContent = period > 20 ? "chaos" : String(period);
    el("lyap-read").textContent = lam.toFixed(3);
    el("pts-read").textContent = String(pts.length);
    el("x-read").textContent = state.x.toFixed(4);
    el("iter-read").textContent = String(state.iter);
  }

  function describe() {
    const pts = attractorPoints(state.r, state.x0, 500, 200);
    const period = countPeriod(pts);
    const lam = lyapunov(state.r, state.x0, 500);
    let msg;
    if (period === 1) {
      msg = "Fixed point: every iterate lands on x* = 1 − 1/r = " + fixedPoint(state.r).toFixed(3) + ". The population settles to a constant — boring, but stable.";
    } else if (period === 2) {
      msg = "Period 2: the population oscillates between two values forever. The fixed point lost stability at r = 3 and split in two.";
    } else if (period === 4) {
      msg = "Period 4: four values cycling. Each period-doubling (r ≈ 3, 3.449, 3.544…) doubles the cycle — the route to chaos.";
    } else {
      msg = "Chaos: the attractor is a cloud of " + period + " distinct values and the Lyapunov exponent is " + lam.toFixed(2) + " > 0 — nearby starts diverge exponentially. Deterministic, but unpredictable.";
    }
    el("status").textContent = msg;
  }

  /* -------------------------------------------------------------------- wiring */

  function setPreset(name) {
    const p = PRESETS[name];
    if (!p) return;
    state.preset = name;
    state.r = p.r;
    el("r").value = String(p.r);
    ["fixed", "period2", "period4", "chaos"].forEach((kk) => {
      el("preset-" + kk).classList.toggle("active", kk === name);
    });
    reset();
  }

  function clearPresets() {
    state.preset = "";
    ["fixed", "period2", "period4", "chaos"].forEach((kk) => el("preset-" + kk).classList.remove("active"));
  }

  function reset() {
    state.x = state.x0;
    state.iter = 0;
    state.series = [state.x];
    updateReadouts();
    describe();
    draw();
  }

  el("r").addEventListener("input", (evt) => {
    state.r = Math.max(R_MIN, Math.min(R_MAX, Number(evt.target.value) || 3.9));
    clearPresets();
    updateReadouts();
    describe();
    draw();
  });
  el("x0").addEventListener("input", (evt) => {
    state.x0 = Math.max(0.05, Math.min(0.95, Number(evt.target.value) || 0.5));
    reset();
  });

  el("preset-fixed").addEventListener("click", () => setPreset("fixed"));
  el("preset-period2").addEventListener("click", () => setPreset("period2"));
  el("preset-period4").addEventListener("click", () => setPreset("period4"));
  el("preset-chaos").addEventListener("click", () => setPreset("chaos"));

  el("toggle-series").addEventListener("click", () => {
    state.showSeries = !state.showSeries;
    el("toggle-series").classList.toggle("active", state.showSeries);
    draw();
  });
  el("btn-reset").addEventListener("click", reset);

  document.addEventListener("keydown", (evt) => {
    if (evt.key === "1") setPreset("fixed");
    else if (evt.key === "2") setPreset("period2");
    else if (evt.key === "3") setPreset("period4");
    else if (evt.key === "4") setPreset("chaos");
    else if (evt.key === "r" || evt.key === "R") reset();
  });

  let last = 0;
  function frame(nowMs) {
    const dt = last ? (nowMs - last) / 1000 : 0.016;
    last = nowMs;
    // advance the live orbit a few steps per frame
    for (let i = 0; i < 3; i++) {
      state.x = logisticStep(state.x, state.r);
      state.iter++;
      state.series.push(state.x);
    }
    if (state.series.length > 300) state.series.splice(0, state.series.length - 300);
    updateReadouts();
    draw();
    requestAnimationFrame(frame);
  }

  window.__lab = {
    state,
    PRESETS,
    logisticStep,
    fixedPoint,
    attractorPoints,
    countPeriod,
    lyapunov,
    setPreset,
    reset,
    updateReadouts,
    describe,
    draw,
  };

  reset();
  requestAnimationFrame(frame);
})();
