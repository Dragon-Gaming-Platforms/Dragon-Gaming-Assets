(() => {
  "use strict";

  // Least-squares regression lab. Points come from y = slopeT*x + intT + noise
  // (Gaussian, σ = noise). The fit minimises Σ(y - (a + b x))²:
  //   b = Σ(x-x̄)(y-ȳ) / Σ(x-x̄)²,   a = ȳ - b·x̄
  // R² = 1 - SSres/SStot, r = correlation.

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");

  const W = canvas.width || 880;
  const H = canvas.height || 660;

  const STAGE = { x: 26, y: 50, w: 828, h: 560 };
  const X_MIN = -5, X_MAX = 5, Y_MIN = -8, Y_MAX = 8;

  const PRESETS = {
    clean: { label: "Clean", slopeT: 1.5, intT: 0.5, noise: 0.1, n: 20 },
    noisy: { label: "Noisy", slopeT: 1.5, intT: 0.5, noise: 1.2, n: 30 },
    outlier: { label: "Outlier", slopeT: 1.0, intT: 0.0, noise: 0.3, n: 20, outlier: true },
    flat: { label: "Flat", slopeT: 0.0, intT: 1.0, noise: 0.4, n: 25 },
  };

  const state = {
    slopeT: 1.5,
    intT: 0.5,
    noise: 0.5,
    n: 20,
    preset: "",
    points: [], // {x, y}
    showResid: true,
    seed: 2024,
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
    let u = 0, v = 0;
    while (u === 0) u = rng();
    while (v === 0) v = rng();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  /* -------------------------------------------------------------- regression */

  function leastSquares(points) {
    const n = points.length;
    if (n < 2) return { slope: 0, intercept: 0, r2: 0, rmse: 0, r: 0 };
    const mx = points.reduce((s, p) => s + p.x, 0) / n;
    const my = points.reduce((s, p) => s + p.y, 0) / n;
    let sxy = 0, sxx = 0, syy = 0;
    points.forEach((p) => {
      sxy += (p.x - mx) * (p.y - my);
      sxx += (p.x - mx) ** 2;
      syy += (p.y - my) ** 2;
    });
    const slope = sxx === 0 ? 0 : sxy / sxx;
    const intercept = my - slope * mx;
    let ssRes = 0;
    points.forEach((p) => {
      const e = p.y - (slope * p.x + intercept);
      ssRes += e * e;
    });
    const ssTot = syy;
    const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot;
    const r = sxx === 0 || syy === 0 ? 0 : sxy / Math.sqrt(sxx * syy);
    return { slope, intercept, r2, rmse: Math.sqrt(ssRes / n), r };
  }

  function predict(fit, x) {
    return fit.slope * x + fit.intercept;
  }

  function genPoints() {
    const rng = mulberry32(state.seed);
    const pts = [];
    for (let i = 0; i < state.n; i++) {
      const x = X_MIN + rng() * (X_MAX - X_MIN);
      const y = state.slopeT * x + state.intT + gauss(rng) * state.noise;
      pts.push({ x, y: Math.max(Y_MIN, Math.min(Y_MAX, y)) });
    }
    if (state.preset === "outlier" && pts.length > 4) {
      // one wild point far from the line
      pts[pts.length - 1] = { x: 4.2, y: -6.5 };
    }
    return pts;
  }

  /* ------------------------------------------------------------------- drawing */

  function toPx(x, y) {
    return [
      STAGE.x + ((x - X_MIN) / (X_MAX - X_MIN)) * STAGE.w,
      STAGE.y + STAGE.h - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * STAGE.h,
    ];
  }

  function fromPx(px, py) {
    return [
      X_MIN + ((px - STAGE.x) / STAGE.w) * (X_MAX - X_MIN),
      Y_MIN + ((STAGE.y + STAGE.h - py) / STAGE.h) * (Y_MAX - Y_MIN),
    ];
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#070907";
    ctx.fillRect(STAGE.x, STAGE.y, STAGE.w, STAGE.h);

    // axes
    ctx.strokeStyle = "rgba(130,150,169,0.25)";
    ctx.lineWidth = 1;
    const [ox, oy] = toPx(0, 0);
    ctx.beginPath();
    ctx.moveTo(STAGE.x, oy);
    ctx.lineTo(STAGE.x + STAGE.w, oy);
    ctx.moveTo(ox, STAGE.y);
    ctx.lineTo(ox, STAGE.y + STAGE.h);
    ctx.stroke();

    const fit = leastSquares(state.points);

    // true line (dashed)
    ctx.strokeStyle = "rgba(124,196,255,0.6)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    const [tx1, ty1] = toPx(X_MIN, state.slopeT * X_MIN + state.intT);
    const [tx2, ty2] = toPx(X_MAX, state.slopeT * X_MAX + state.intT);
    ctx.moveTo(tx1, ty1);
    ctx.lineTo(tx2, ty2);
    ctx.stroke();
    ctx.setLineDash([]);

    // residuals
    if (state.showResid && state.points.length >= 2) {
      ctx.strokeStyle = "rgba(255,180,95,0.45)";
      ctx.lineWidth = 1;
      state.points.forEach((p) => {
        const [x1, y1] = toPx(p.x, p.y);
        const [x2, y2] = toPx(p.x, predict(fit, p.x));
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });
    }

    // fit line
    if (state.points.length >= 2) {
      ctx.strokeStyle = "#9be15d";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      const [fx1, fy1] = toPx(X_MIN, predict(fit, X_MIN));
      const [fx2, fy2] = toPx(X_MAX, predict(fit, X_MAX));
      ctx.moveTo(fx1, fy1);
      ctx.lineTo(fx2, fy2);
      ctx.stroke();
    }

    // points
    state.points.forEach((p) => {
      const [x, y] = toPx(p.x, p.y);
      ctx.fillStyle = "#6ff0c8";
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = "#93a48f";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(
      "fit: y = " + fit.slope.toFixed(2) + "x + " + fit.intercept.toFixed(2) + "   true: y = " + state.slopeT.toFixed(2) + "x + " + state.intT.toFixed(2),
      STAGE.x + 8,
      STAGE.y + 16
    );
  }

  /* ------------------------------------------------------------------ readouts */

  function updateReadouts() {
    const fit = leastSquares(state.points);
    el("slopeT-out").textContent = state.slopeT.toFixed(2);
    el("intT-out").textContent = state.intT.toFixed(2);
    el("noise-out").textContent = state.noise.toFixed(2);
    el("n-out").textContent = String(state.n);

    el("slope-hud").textContent = "slope " + fit.slope.toFixed(2);
    el("r2-hud").textContent = "R² " + fit.r2.toFixed(3);
    el("rmse-hud").textContent = "RMSE " + fit.rmse.toFixed(2);

    el("slope-read").textContent = fit.slope.toFixed(3);
    el("int-read").textContent = fit.intercept.toFixed(3);
    el("r2-read").textContent = fit.r2.toFixed(3);
    el("rmse-read").textContent = fit.rmse.toFixed(3);
    el("r-read").textContent = fit.r.toFixed(3);
    el("n-read").textContent = String(state.points.length);
  }

  function describe() {
    const fit = leastSquares(state.points);
    let msg;
    if (state.points.length < 2) {
      msg = "Add at least two points — click the canvas or Regenerate. The fit needs data to work with.";
    } else if (state.preset === "outlier") {
      msg = "One outlier at (4.2, −6.5) drags the line and tanks R² to " + fit.r2.toFixed(2) + ". Least squares minimises squared errors, so big errors pull hard — that is its weakness.";
    } else if (fit.r2 > 0.95) {
      msg = "R² = " + fit.r2.toFixed(3) + ": the line explains almost all the scatter. Fitted slope " + fit.slope.toFixed(2) + " vs true " + state.slopeT.toFixed(2) + ".";
    } else if (fit.r2 > 0.6) {
      msg = "R² = " + fit.r2.toFixed(3) + ": the line explains most of the scatter, but noise (σ=" + state.noise.toFixed(2) + ") leaves residuals. The slope still lands near the truth.";
    } else {
      msg = "R² = " + fit.r2.toFixed(3) + ": the line explains little — either the noise is huge or there is no real relationship. Correlation r = " + fit.r.toFixed(2) + ".";
    }
    el("status").textContent = msg;
  }

  /* -------------------------------------------------------------------- wiring */

  function setPreset(name) {
    const p = PRESETS[name];
    if (!p) return;
    state.preset = name;
    state.slopeT = p.slopeT;
    state.intT = p.intT;
    state.noise = p.noise;
    state.n = p.n;
    el("slopeT").value = String(p.slopeT);
    el("intT").value = String(p.intT);
    el("noise").value = String(p.noise);
    el("n").value = String(p.n);
    ["clean", "noisy", "outlier", "flat"].forEach((kk) => {
      el("preset-" + kk).classList.toggle("active", kk === name);
    });
    state.points = genPoints();
    updateReadouts();
    describe();
    draw();
  }

  function clearPresets() {
    state.preset = "";
    ["clean", "noisy", "outlier", "flat"].forEach((kk) => el("preset-" + kk).classList.remove("active"));
  }

  el("slopeT").addEventListener("input", (evt) => {
    state.slopeT = Math.max(-3, Math.min(3, Number(evt.target.value) || 0));
    clearPresets();
    updateReadouts();
    describe();
    draw();
  });
  el("intT").addEventListener("input", (evt) => {
    state.intT = Math.max(-3, Math.min(3, Number(evt.target.value) || 0));
    clearPresets();
    updateReadouts();
    describe();
    draw();
  });
  el("noise").addEventListener("input", (evt) => {
    state.noise = Math.max(0, Math.min(2, Number(evt.target.value) || 0));
    clearPresets();
    updateReadouts();
    describe();
    draw();
  });
  el("n").addEventListener("input", (evt) => {
    state.n = Math.max(5, Math.min(60, Number(evt.target.value) || 20));
    clearPresets();
    updateReadouts();
    describe();
    draw();
  });

  el("preset-clean").addEventListener("click", () => setPreset("clean"));
  el("preset-noisy").addEventListener("click", () => setPreset("noisy"));
  el("preset-outlier").addEventListener("click", () => setPreset("outlier"));
  el("preset-flat").addEventListener("click", () => setPreset("flat"));

  el("btn-regen").addEventListener("click", () => {
    state.seed = (state.seed * 1103515245 + 12345) >>> 0;
    state.points = genPoints();
    updateReadouts();
    describe();
    draw();
  });
  el("btn-clear").addEventListener("click", () => {
    state.points = [];
    updateReadouts();
    describe();
    draw();
  });
  el("toggle-resid").addEventListener("click", () => {
    state.showResid = !state.showResid;
    el("toggle-resid").classList.toggle("active", state.showResid);
    draw();
  });

  function point(evt) {
    const r = canvas.getBoundingClientRect();
    return [evt.clientX - r.left, evt.clientY - r.top];
  }

  canvas.addEventListener("pointerdown", (evt) => {
    const [x, y] = point(evt);
    const [dx, dy] = fromPx(x, y);
    if (dx >= X_MIN && dx <= X_MAX && dy >= Y_MIN && dy <= Y_MAX) {
      state.points.push({ x: dx, y: dy });
      clearPresets();
      updateReadouts();
      describe();
      draw();
    }
  });

  document.addEventListener("keydown", (evt) => {
    if (evt.key === "1") setPreset("clean");
    else if (evt.key === "2") setPreset("noisy");
    else if (evt.key === "3") setPreset("outlier");
    else if (evt.key === "4") setPreset("flat");
    else if (evt.key === "r" || evt.key === "R") el("btn-regen").click();
    else if (evt.key === "c" || evt.key === "C") el("btn-clear").click();
  });

  window.__lab = {
    state,
    PRESETS,
    leastSquares,
    predict,
    genPoints,
    setPreset,
    updateReadouts,
    describe,
    draw,
  };

  state.points = genPoints();
  updateReadouts();
  describe();
  draw();
})();
