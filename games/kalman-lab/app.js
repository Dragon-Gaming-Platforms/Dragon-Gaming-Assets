(() => {
  "use strict";

  // Two filters, one sensor.
  //
  //   Kalman   — closed-form Gaussian update for a 1-D random walk
  //   particles— 200 weighted samples propagated through the same model
  //
  // Because the truth really is a random walk with the same process noise the
  // filters assume, the normalised innovation squared (NIS) should hover around
  // 1. If it drifts, the filter's own uncertainty claim is wrong, which is the
  // interesting failure mode to look at.

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");

  const W = canvas.width || 880;
  const H = canvas.height || 660;
  const N = 260; // samples on screen

  const PLOT = { x: 64, y: 48, w: 780, h: 384 };
  const INNO = { x: 64, y: 470, w: 780, h: 132 };
  const POS_MIN = 0;
  const POS_MAX = 100;

  const state = {
    q: 0.5,
    r: 6,
    particles: 200,
    truth: 50,
    kf: { x: 50, p: 6 },
    pf: { x: [], w: [], mean: 50, sigma: Math.sqrt(6) },
    history: [],
    innovations: [],
    nis: [],
    kfErr: [],
    pfErr: [],
    outliers: [],
    running: true,
    jump: 0, // per-step manoeuvre probability
    step: 0,
    view: [20, 80],
    frame: 0,
    seed: 12345,
  };

  /* ---------------------------------------------------------------- random */

  let spare = null;
  function gauss() {
    if (spare !== null) {
      const v = spare;
      spare = null;
      return v;
    }
    let u = 0;
    let v = 0;
    let s = 0;
    do {
      u = Math.random() * 2 - 1;
      v = Math.random() * 2 - 1;
      s = u * u + v * v;
    } while (s === 0 || s >= 1);
    const m = Math.sqrt((-2 * Math.log(s)) / s);
    spare = v * m;
    return u * m;
  }

  /* ------------------------------------------------------------- filtering */

  function initParticles() {
    const list = [];
    const spread = Math.sqrt(state.r);
    for (let i = 0; i < state.particles; i++) {
      list.push(state.kf.x + gauss() * spread);
    }
    state.pf.x = list;
    state.pf.w = new Array(state.particles).fill(1 / state.particles);
    measureParticles();
  }

  function measureParticles() {
    const xs = state.pf.x;
    const ws = state.pf.w;
    let mean = 0;
    for (let i = 0; i < xs.length; i++) mean += xs[i] * ws[i];
    let varSum = 0;
    for (let i = 0; i < xs.length; i++) {
      const d = xs[i] - mean;
      varSum += d * d * ws[i];
    }
    state.pf.mean = mean;
    state.pf.sigma = Math.sqrt(Math.max(0, varSum));
  }

  function kalmanStep(measurement) {
    const q = state.q;
    const r = state.r;
    // predict: random walk, variance grows by q
    state.kf.p += q;
    // update
    const s = state.kf.p + r;
    const k = state.kf.p / s;
    const v = measurement - state.kf.x;
    state.kf.x += k * v;
    state.kf.p = (1 - k) * state.kf.p;
    return { v, s };
  }

  function particleStep(measurement) {
    const q = state.q;
    const r = state.r;
    const sd = Math.sqrt(q);
    const xs = state.pf.x;
    const ws = state.pf.w;
    let sum = 0;
    for (let i = 0; i < xs.length; i++) {
      xs[i] += gauss() * sd;
      const d = measurement - xs[i];
      const w = Math.exp(-(d * d) / (2 * r)) + 1e-300;
      ws[i] *= w;
      sum += ws[i];
    }
    if (!(sum > 0) || !isFinite(sum)) {
      // total weight collapse — re-seed from the measurement
      for (let i = 0; i < xs.length; i++) {
        xs[i] = measurement + gauss() * Math.sqrt(r);
        ws[i] = 1 / xs.length;
      }
      measureParticles();
      return;
    }
    for (let i = 0; i < xs.length; i++) ws[i] /= sum;

    let ess = 0;
    for (let i = 0; i < ws.length; i++) ess += ws[i] * ws[i];
    ess = 1 / ess;

    measureParticles();

    if (ess < xs.length * 0.5) {
      // systematic resampling, then flatten the weights
      const picks = [];
      const step = 1 / xs.length;
      let u = Math.random() * step;
      let acc = 0;
      let idx = 0;
      for (let i = 0; i < xs.length; i++) {
        while (u > acc + ws[idx] && idx < xs.length - 1) {
          acc += ws[idx];
          idx++;
        }
        picks.push(xs[idx]);
        u += step;
      }
      state.pf.x = picks;
      state.pf.w = new Array(xs.length).fill(step);
      measureParticles();
    }
    state.pf.ess = ess;
  }

  function sample() {
    // ground truth: exactly the random walk the filters assume
    state.truth += gauss() * Math.sqrt(state.q);
    if (state.jump > 0 && Math.random() < state.jump) {
      state.truth += (Math.random() < 0.5 ? -1 : 1) * (9 + Math.random() * 12);
    }
    state.truth = Math.max(POS_MIN + 6, Math.min(POS_MAX - 6, state.truth));

    let measurement = state.truth + gauss() * Math.sqrt(state.r);
    if (state.outliers.length) {
      measurement = state.outliers.shift();
    }
    measurement = Math.max(POS_MIN - 8, Math.min(POS_MAX + 8, measurement));

    const { v, s } = kalmanStep(measurement);
    particleStep(measurement);

    state.step++;
    state.history.push({
      truth: state.truth,
      meas: measurement,
      kf: state.kf.x,
      kfSigma: Math.sqrt(state.kf.p),
      pf: state.pf.mean,
      pfSigma: state.pf.sigma,
    });
    if (state.history.length > N) state.history.shift();

    state.innovations.push({ v, gate: 2 * Math.sqrt(s) });
    if (state.innovations.length > N) state.innovations.shift();

    state.nis.push((v * v) / s);
    if (state.nis.length > 400) state.nis.shift();
    state.kfErr.push(Math.pow(state.kf.x - state.truth, 2));
    state.pfErr.push(Math.pow(state.pf.mean - state.truth, 2));
    if (state.kfErr.length > 200) state.kfErr.shift();
    if (state.pfErr.length > 200) state.pfErr.shift();
  }

  function rmse(list) {
    if (!list.length) return 0;
    return Math.sqrt(list.reduce((a, b) => a + b, 0) / list.length);
  }

  function nisAverage() {
    if (!state.nis.length) return 1;
    return state.nis.reduce((a, b) => a + b, 0) / state.nis.length;
  }

  function resetFilters() {
    state.kf = { x: state.truth, p: state.r };
    state.pf.ess = state.particles;
    initParticles();
    state.history = [];
    state.innovations = [];
    state.nis = [];
    state.kfErr = [];
    state.pfErr = [];
    state.outliers = [];
    state.step = 0;
    updateReadouts();
    describe();
  }

  /* ---------------------------------------------------------------- labels */

  function round(v, places = 1) {
    return isFinite(v) ? v.toFixed(places) : "—";
  }

  function fix(v) {
    return isFinite(v) ? v.toFixed(2) : "—";
  }

  function setStatus(text, kind) {
    const box = el("status");
    box.textContent = text;
    box.className = "status" + (kind ? " " + kind : "");
    state.statusKind = kind || "";
  }

  function updateReadouts() {
    el("kf-read").textContent = round(state.kf.x, 1);
    el("kf-sigma").textContent = fix(Math.sqrt(state.kf.p));
    el("truth-read").textContent = round(state.truth, 1);
    el("kf-err").textContent = round(Math.abs(state.kf.x - state.truth), 1);
    el("pf-read").textContent = round(state.pf.mean, 1);
    el("pf-sigma").textContent = fix(state.pf.sigma);
    el("kf-rmse").textContent = round(rmse(state.kfErr), 2);
    el("pf-rmse").textContent = round(rmse(state.pfErr), 2);
    el("q-out").textContent = fix(state.q);
    el("r-out").textContent = round(state.r, 1);
    el("n-out").textContent = String(state.particles);
    el("kf-hud").textContent = "σ " + fix(Math.sqrt(state.kf.p));
    el("nis-hud").textContent = "NIS " + round(nisAverage(), 2);
    el("step-hud").textContent = "step " + state.step;
  }

  function describe() {
    const na = nisAverage();
    const kfR = rmse(state.kfErr);
    const pfR = rmse(state.pfErr);
    if (state.step < 12) {
      setStatus(
        "Grey is the truth, orange dots are what the sensor reports, and the two filters see nothing else. Watch how the bands narrow once the filters settle, and how a single outlier pulls them off track.",
        "idle"
      );
      return;
    }
    let verdict;
    if (na > 1.7) {
      verdict = `NIS averages ${na.toFixed(2)} — the filter thinks it knows more than it does (bands too tight for this sensor).`;
    } else if (na < 0.55) {
      verdict = `NIS averages ${na.toFixed(2)} — the bands are wider than they need to be, so the filter is being timid.`;
    } else {
      verdict = `NIS averages ${na.toFixed(2)}, close to the ideal of 1.00, so the uncertainty bands are honest.`;
    }
    const who = kfR <= pfR ? "The Kalman filter" : "The particle cloud";
    setStatus(
      `${verdict} Kalman RMSE ${kfR.toFixed(2)} against the particle cloud's ${pfR.toFixed(
        2
      )}. ${who} is tracking tighter here. Particle σ is ${state.pf.sigma.toFixed(2)} with q=${state.q.toFixed(
        2
      )} and r=${state.r.toFixed(1)}.`,
      "good"
    );
  }

  /* ---------------------------------------------------------------- drawing */

  const px = (i) => PLOT.x + (PLOT.w * (i + 1)) / N;
  const py = (v) => PLOT.y + PLOT.h - (PLOT.h * (v - state.view[0])) / (state.view[1] - state.view[0]);

  function viewTarget() {
    const h = state.history;
    if (!h.length) return [20, 80];
    let lo = Infinity;
    let hi = -Infinity;
    for (const row of h) {
      lo = Math.min(lo, row.meas, row.truth, row.kf - 2 * row.kfSigma, row.pf - 2 * row.pfSigma);
      hi = Math.max(hi, row.meas, row.truth, row.kf + 2 * row.kfSigma, row.pf + 2 * row.pfSigma);
    }
    const span = Math.max(22, hi - lo + 4);
    const mid = (hi + lo) / 2;
    return [mid - span / 2, mid + span / 2];
  }

  function easeView() {
    const target = viewTarget();
    state.view[0] += (target[0] - state.view[0]) * 0.12;
    state.view[1] += (target[1] - state.view[1]) * 0.12;
  }

  function plotFrame() {
    ctx.fillStyle = "rgba(9, 14, 18, 0.9)";
    ctx.fillRect(PLOT.x, PLOT.y, PLOT.w, PLOT.h);
    ctx.strokeStyle = "#1b2831";
    ctx.lineWidth = 1;
    const lo = state.view[0];
    const hi = state.view[1];
    const rawStep = (hi - lo) / 4;
    const step = [1, 2, 5, 10, 20, 25, 50, 100].find((c) => c >= rawStep) || 100;
    const first = Math.ceil(lo / step) * step;
    for (let v = first; v <= hi; v += step) {
      const y = Math.round(py(v)) + 0.5;
      ctx.beginPath();
      ctx.moveTo(PLOT.x, y);
      ctx.lineTo(PLOT.x + PLOT.w, y);
      ctx.stroke();
      ctx.fillStyle = "#5f7484";
      ctx.font = "10px ui-monospace, Menlo, monospace";
      ctx.textAlign = "right";
      ctx.fillText(String(v), PLOT.x - 8, y + 3);
    }
    ctx.strokeStyle = "#273843";
    ctx.strokeRect(PLOT.x + 0.5, PLOT.y + 0.5, PLOT.w - 1, PLOT.h - 1);

    ctx.fillStyle = "#5f7484";
    ctx.textAlign = "left";
    ctx.font = "10px ui-monospace, Menlo, monospace";
    ctx.fillText("position", PLOT.x, PLOT.y - 10);
    ctx.textAlign = "right";
    ctx.fillText("time →", PLOT.x + PLOT.w, PLOT.y - 10);
  }

  function band(key, sigmaKey, colour) {
    const h = state.history;
    if (h.length < 2) return;
    const start = N - h.length;
    ctx.beginPath();
    h.forEach((row, i) => {
      const x = px(start + i);
      const y = py(row[key] + 2 * row[sigmaKey]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    for (let i = h.length - 1; i >= 0; i--) {
      const row = h[i];
      ctx.lineTo(px(start + i), py(row[key] - 2 * row[sigmaKey]));
    }
    ctx.closePath();
    ctx.fillStyle = colour;
    ctx.fill();
  }

  function series(key, colour, width, dash) {
    const h = state.history;
    if (h.length < 2) return;
    const start = N - h.length;
    ctx.beginPath();
    h.forEach((row, i) => {
      const x = px(start + i);
      const y = py(row[key]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = colour;
    ctx.lineWidth = width;
    ctx.setLineDash(dash || []);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawInnovations() {
    ctx.fillStyle = "rgba(9, 14, 18, 0.9)";
    ctx.fillRect(INNO.x, INNO.y, INNO.w, INNO.h);
    ctx.strokeStyle = "#273843";
    ctx.lineWidth = 1;
    ctx.strokeRect(INNO.x + 0.5, INNO.y + 0.5, INNO.w - 1, INNO.h - 1);

    const mid = INNO.y + INNO.h / 2;
    ctx.strokeStyle = "#1b2831";
    ctx.beginPath();
    ctx.moveTo(INNO.x, mid);
    ctx.lineTo(INNO.x + INNO.w, mid);
    ctx.stroke();

    const list = state.innovations;
    if (list.length < 2) return;
    const start = N - list.length;
    const scale = INNO.h / 2 / 8; // ±8 units fills the strip

    // ±2σ gate
    ctx.strokeStyle = "rgba(255, 159, 110, 0.45)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    list.forEach((row, i) => {
      const x = INNO.x + (INNO.w * (start + i + 1)) / N;
      const y = mid - row.gate * scale;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.beginPath();
    list.forEach((row, i) => {
      const x = INNO.x + (INNO.w * (start + i + 1)) / N;
      const y = mid + row.gate * scale;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    list.forEach((row, i) => {
      const x = INNO.x + (INNO.w * (start + i + 1)) / N;
      const y = mid - Math.max(-8, Math.min(8, row.v)) * scale;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = "#8fb3ff";
    ctx.lineWidth = 1.3;
    ctx.stroke();

  }

  function draw() {
    easeView();
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#070c10";
    ctx.fillRect(0, 0, W, H);

    plotFrame();
    band("pf", "pfSigma", "rgba(143, 179, 255, 0.10)");
    band("kf", "kfSigma", "rgba(111, 240, 200, 0.13)");

    // measurements
    const h = state.history;
    const start = N - h.length;
    ctx.fillStyle = "rgba(255, 159, 110, 0.85)";
    h.forEach((row, i) => {
      ctx.beginPath();
      ctx.arc(px(start + i), py(row.meas), 2.4, 0, Math.PI * 2);
      ctx.fill();
    });

    // The truth gets a soft halo so it stays visible underneath the estimates
    // that are chasing it.
    ctx.globalAlpha = 0.22;
    series("truth", "#dfe9ef", 6, []);
    ctx.globalAlpha = 1;
    series("truth", "#dfe9ef", 1.2, []);
    series("pf", "#8fb3ff", 1.4, [3, 3]);
    series("kf", "#6ff0c8", 2, []);

    drawInnovations();

    ctx.fillStyle = "#5f7484";
    ctx.font = "10px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("innovation y − x̂   dashed: ±2σ gate", INNO.x, INNO.y - 8);

    ctx.fillStyle = "#6f8493";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(
      `q ${state.q.toFixed(2)} · r ${state.r.toFixed(1)} · ${state.particles} particles · ESS ${Math.round(
        state.pf.ess || state.particles
      )}`,
      PLOT.x,
      H - 16
    );
    ctx.textAlign = "right";
    ctx.fillStyle = state.running ? "#6ff0c8" : "#ffcf7a";
    ctx.fillText(state.running ? "filtering" : "paused", W - PLOT.x, H - 16);
    ctx.textAlign = "left";
  }

  /* ------------------------------------------------------------- controls */

  function setPreset(name) {
    const buttons = { calm: "preset-calm", noisy: "preset-noisy", jumpy: "preset-jumpy" };
    Object.keys(buttons).forEach((key) => {
      el(buttons[key]).classList.toggle("active", key === name);
    });
    if (name === "calm") {
      state.q = 0.12;
      state.r = 2;
      state.jump = 0;
    } else if (name === "noisy") {
      state.q = 0.5;
      state.r = 6;
      state.jump = 0;
    } else {
      state.q = 0.5;
      state.r = 6;
      state.jump = 0.03;
    }
    el("q").value = String(state.q);
    el("r").value = String(state.r);
    resetFilters();
    updateReadouts();
    draw();
  }

  const point = (evt) => {
    const rect = canvas.getBoundingClientRect();
    return [
      (evt.clientX - rect.left) * (W / (rect.width || W)),
      (evt.clientY - rect.top) * (H / (rect.height || H)),
    ];
  };

  canvas.addEventListener("pointerdown", (evt) => {
    const [x, y] = point(evt);
    if (x < PLOT.x || x > PLOT.x + PLOT.w || y < PLOT.y || y > PLOT.y + PLOT.h) return;
    const value = POS_MIN + ((PLOT.y + PLOT.h - y) / PLOT.h) * (POS_MAX - POS_MIN);
    state.outliers.push(Math.max(POS_MIN - 8, Math.min(POS_MAX + 8, value)));
  });

  function triggerOutlier() {
    state.outliers.push(state.truth + (Math.random() < 0.5 ? -1 : 1) * (5 + Math.random() * 4) * Math.sqrt(state.r));
  }

  el("q").addEventListener("input", (evt) => {
    state.q = Math.max(0.02, Math.min(4, Number(evt.target.value) || 0.5));
    updateReadouts();
  });
  el("r").addEventListener("input", (evt) => {
    state.r = Math.max(0.5, Math.min(40, Number(evt.target.value) || 6));
    updateReadouts();
  });
  el("n").addEventListener("input", (evt) => {
    state.particles = Math.max(30, Math.min(400, Math.round((Number(evt.target.value) || 200) / 10) * 10));
    initParticles();
    updateReadouts();
  });

  el("toggle").addEventListener("click", () => {
    state.running = !state.running;
    el("toggle").textContent = state.running ? "Pause" : "Run";
  });
  el("reset").addEventListener("click", () => {
    state.truth = 50;
    resetFilters();
    draw();
  });
  el("spike").addEventListener("click", triggerOutlier);

  el("preset-calm").addEventListener("click", () => setPreset("calm"));
  el("preset-noisy").addEventListener("click", () => setPreset("noisy"));
  el("preset-jumpy").addEventListener("click", () => setPreset("jumpy"));

  document.addEventListener("keydown", (evt) => {
    const key = evt.key;
    if (key === " ") {
      evt.preventDefault();
      state.running = !state.running;
      el("toggle").textContent = state.running ? "Pause" : "Run";
    } else if (key === "r" || key === "R") {
      state.truth = 50;
      resetFilters();
    } else if (key === "o" || key === "O") {
      triggerOutlier();
    }
  });

  window.__lab = {
    state,
    sample,
    kalmanStep,
    particleStep,
    rmse,
    nisAverage,
    resetFilters,
    initParticles,
    measureParticles,
    setPreset,
    triggerOutlier,
    updateReadouts,
    describe,
    px,
    py,
  };

  resetFilters();
  // burn in a little so the first frame already shows two tracking lines
  for (let i = 0; i < 60; i++) sample();
  updateReadouts();
  describe();
  draw();

  function loop() {
    state.frame++;
    if (state.running) {
      sample();
      updateReadouts();
      if (state.step % 10 === 0) describe();
    }
    draw();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
