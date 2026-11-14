(() => {
  "use strict";

  // Three classic Monte Carlo estimators, all aimed at the same number.
  // The point of the lab is not that randomness "works" — it is the error
  // behaviour: every estimator is a sample mean, so its standard error falls
  // like 1/sqrt(N), and the reported z-score says whether the current run is
  // behaving normally.

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");

  const W = canvas.width || 880;
  const H = canvas.height || 690;

  const SQ = 292;
  const SX = 40;
  const SY = 64;

  const CX = 388;
  const CY = 64;
  const CW = 452;
  const CH = 200;

  const TX = 388;
  const TY = 278;
  const TW = 452;
  const TH = 196;

  const HX = 40;
  const HY = 492;
  const HW = 800;
  const HH = 128;

  const TRUE_PI = Math.PI;

  const EXPERIMENTS = {
    pi: {
      name: "darts",
      target: TRUE_PI,
      formula: "π ≈ 4 · inside / N",
      blurb: "Uniform points in the unit square. The quarter circle has area π/4, so the inside fraction estimates it.",
      exact: "p = π/4",
    },
    integral: {
      name: "integral",
      target: TRUE_PI,
      formula: "π = ∫₀¹ 4/(1+x²) dx",
      blurb: "Average the integrand at uniform x. The mean of f over [0, 1] is the integral, since the interval has width 1.",
      exact: "mean f = π",
    },
    buffon: {
      name: "needle",
      target: TRUE_PI,
      formula: "π ≈ 2L / (crossings / N)",
      blurb: "Throw a needle of length L at a floor with unit gaps. It crosses a line with probability 2L/π.",
      exact: "p = 2L/π",
    },
  };

  const state = {
    experiment: "pi",
    rate: 400,
    needle: 0.8,
    running: true,
    seed: 20261018,
    rng: null,
    n: 0,
    hits: 0,
    sumF: 0,
    sumF2: 0,
    dots: [],
    history: [],
    repeats: [],
    repeatStd: 0,
    repeatMean: 0,
    repeatTheory: 0,
    frame: 0,
    lastStatus: 0,
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

  function reset(seed) {
    state.seed = seed !== undefined ? seed : (state.seed * 1664525 + 1013904223) >>> 0;
    state.rng = seeded(state.seed);
    state.n = 0;
    state.hits = 0;
    state.sumF = 0;
    state.sumF2 = 0;
    state.dots = [];
    state.history = [];
    state.repeats = [];
    state.repeatStd = 0;
    state.repeatTheory = 0;
    updateReadouts();
    updateStatus(true);
  }

  /* ----------------------------------------------------------- estimators */

  function estimateOf(n, hits, sumF) {
    if (state.experiment === "integral") return n ? sumF / n : 0;
    if (state.experiment === "buffon") return hits ? (2 * state.needle * n) / hits : Infinity;
    return n ? (4 * hits) / n : 0;
  }

  function standardErrorOf(n, hits, sumF, sumF2) {
    if (n < 2) return Infinity;
    if (state.experiment === "integral") {
      const mean = sumF / n;
      const variance = Math.max(0, sumF2 / n - mean * mean);
      // The estimator is the mean, but its "value" is π, so errors are on the
      // same scale as the estimate itself.
      return Math.sqrt(variance / n);
    }
    const p = hits / n;
    if (state.experiment === "buffon") {
      const L = state.needle;
      if (p <= 0) return Infinity;
      // Delta method for π̂ = 2L/p.
      return (2 * L) / (p * p) * Math.sqrt((p * (1 - p)) / n);
    }
    // π̂ = 4p, so σ = 4·sqrt(p(1−p)/n).
    return 4 * Math.sqrt(Math.max(0, p * (1 - p)) / n);
  }

  function currentEstimate() {
    return estimateOf(state.n, state.hits, state.sumF);
  }

  function currentSigma() {
    return standardErrorOf(state.n, state.hits, state.sumF, state.sumF2);
  }

  function throwDarts(count) {
    const rand = state.rng;
    const exp = state.experiment;
    const L = state.needle;
    // Sample the convergence curve at a readable rate even when a whole
    // million-dart burst lands in a single call.
    const step = Math.max(200, Math.floor(count / 240));
    let nextSample = state.n + step;

    for (let i = 0; i < count; i++) {
      let hit = false;
      let px = 0;
      let py = 0;

      if (exp === "pi") {
        const x = rand();
        const y = rand();
        hit = x * x + y * y <= 1;
        px = x;
        py = y;
      } else if (exp === "integral") {
        const x = rand();
        const f = 4 / (1 + x * x);
        state.sumF += f;
        state.sumF2 += f * f;
        hit = f >= 2; // only used for colouring
        px = x;
        py = f / 4;
      } else {
        const y = rand();
        const theta = rand() * Math.PI;
        const half = (L / 2) * Math.sin(theta);
        // Crosses a gap boundary when the needle spans y = 0 or y = 1.
        hit = y - half < 0 || y + half > 1;
        px = rand();
        py = y;
        if (hit) state.sumF += 1;
      }

      state.n++;
      if (hit) state.hits++;
      state.dots.push({ x: px, y: py, hit });

      if (state.n >= nextSample) {
        nextSample += step;
        state.history.push({ n: state.n, est: currentEstimate(), sigma: currentSigma() });
        if (state.history.length > 700) state.history.splice(0, 220);
      }
    }

    if (state.dots.length > 3600) state.dots.splice(0, state.dots.length - 3600);

    if (!state.history.length) state.history.push({ n: state.n, est: currentEstimate(), sigma: currentSigma() });
  }

  /* ---------------------------------------------------------------- maths */

  function rmsRatio(trials, baseN) {
    // Throwing 10x the samples should shrink the RMS error by about sqrt(10).
    // Measure it directly instead of trusting the line on the chart.
    const rand = state.rng;
    const exp = state.experiment;
    const L = state.needle;
    const runs = [];

    function oneRun(n) {
      let hits = 0;
      let sum = 0;
      for (let i = 0; i < n; i++) {
        if (exp === "pi") {
          const x = rand();
          const y = rand();
          if (x * x + y * y <= 1) hits++;
        } else if (exp === "integral") {
          const x = rand();
          sum += 4 / (1 + x * x);
        } else {
          const y = rand();
          const half = (L / 2) * Math.sin(rand() * Math.PI);
          if (y - half < 0 || y + half > 1) hits++;
        }
      }
      if (exp === "integral") return sum / n;
      if (exp === "buffon") return hits ? (2 * L * n) / hits : NaN;
      return (4 * hits) / n;
    }

    for (let i = 0; i < trials; i++) {
      const small = oneRun(baseN);
      const large = oneRun(baseN * 10);
      if (isFinite(small) && isFinite(large)) runs.push([small, large]);
    }
    if (!runs.length) return NaN;
    const smallRms = Math.sqrt(runs.reduce((a, r) => a + Math.pow(r[0] - TRUE_PI, 2), 0) / runs.length);
    const largeRms = Math.sqrt(runs.reduce((a, r) => a + Math.pow(r[1] - TRUE_PI, 2), 0) / runs.length);
    state.scaleSmall = smallRms;
    state.scaleLarge = largeRms;
    state.scaleRatio = smallRms / Math.max(1e-9, largeRms);
    return state.scaleRatio;
  }

  function runRepeats(times, perRun) {
    const rand = state.rng;
    const exp = state.experiment;
    const L = state.needle;
    const results = [];

    for (let r = 0; r < times; r++) {
      let hits = 0;
      let sum = 0;
      let sum2 = 0;
      for (let i = 0; i < perRun; i++) {
        if (exp === "pi") {
          const x = rand();
          const y = rand();
          if (x * x + y * y <= 1) hits++;
        } else if (exp === "integral") {
          const x = rand();
          const f = 4 / (1 + x * x);
          sum += f;
          sum2 += f * f;
        } else {
          const y = rand();
          const half = (L / 2) * Math.sin(rand() * Math.PI);
          if (y - half < 0 || y + half > 1) hits++;
        }
      }
      let value;
      if (exp === "integral") value = sum / perRun;
      else if (exp === "buffon") value = hits ? (2 * L * perRun) / hits : 0;
      else value = (4 * hits) / perRun;
      results.push(value);
    }

    state.repeats = results;
    const mean = results.reduce((a, b) => a + b, 0) / results.length;
    state.repeatStd = Math.sqrt(results.reduce((a, b) => a + (b - mean) * (b - mean), 0) / Math.max(1, results.length - 1));
    state.repeatMean = mean;
    state.repeatTheory = standardErrorFor(perRun);
    updateReadouts();
    return { mean, std: state.repeatStd, theory: state.repeatTheory };
  }

  function standardErrorFor(n) {
    const L = state.needle;
    if (state.experiment === "integral") {
      // E[f²] − E[f]² for f = 4/(1+x²).
      // E[f] = π, E[f²] = ∫₀¹ 16/(1+x²)² dx = 16·(1/2)(π/4 + 1/2)... compute numerically.
      let sum = 0;
      const steps = 4000;
      for (let i = 0; i < steps; i++) {
        const x = (i + 0.5) / steps;
        const f = 4 / (1 + x * x);
        sum += f * f;
      }
      const meanSq = sum / steps;
      const variance = meanSq - TRUE_PI * TRUE_PI;
      return Math.sqrt(variance / n);
    }
    if (state.experiment === "buffon") {
      const p = (2 * L) / Math.PI;
      return ((2 * L) / (p * p)) * Math.sqrt((p * (1 - p)) / n);
    }
    const p = Math.PI / 4;
    return 4 * Math.sqrt((p * (1 - p)) / n);
  }

  /* ------------------------------------------------------------- readouts */

  function setStatus(text, kind) {
    const box = el("status");
    box.textContent = text;
    box.className = "status" + (kind ? " " + kind : "");
  }

  function fmtNum(value) {
    return Math.round(value).toLocaleString("en-US");
  }

  function updateReadouts() {
    const est = currentEstimate();
    const sigma = currentSigma();
    const err = Math.abs(est - TRUE_PI);
    el("n-read").textContent = fmtNum(state.n);
    el("n-hud").textContent = fmtNum(state.n) + " samples";
    el("est-read").textContent = state.n && isFinite(est) ? est.toFixed(4) : "—";
    el("est-hud").textContent = state.n && isFinite(est) ? "π ≈ " + est.toFixed(4) : "π ≈ —";
    el("true-read").textContent = "π = 3.14159";
    el("err-read").textContent = state.n ? (100 * err / TRUE_PI).toFixed(3) + "%" : "—";
    el("err-hud").textContent = state.n ? "error " + (100 * err / TRUE_PI).toFixed(2) + "%" : "error —";
    el("se-read").textContent = isFinite(sigma) ? sigma.toFixed(4) : "—";
    el("z-read").textContent = state.n > 30 && isFinite(sigma) && sigma > 0 ? (err / sigma).toFixed(2) + "σ" : "—";
    el("slope-read").textContent = state.scaleRatio ? state.scaleRatio.toFixed(2) : "—";
    el("rep-read").textContent = String(state.repeats.length);
    el("rate-out").textContent = fmtNum(state.rate);
    el("needle-out").textContent = state.needle.toFixed(2);
    el("needle-wrap").classList.toggle("hidden", state.experiment !== "buffon");
  }

  function updateStatus(force) {
    if (!force && state.frame - state.lastStatus < 12) return;
    state.lastStatus = state.frame;
    const est = currentEstimate();
    const sigma = currentSigma();
    const err = Math.abs(est - TRUE_PI);

    if (!state.n) {
      setStatus("Fresh run. Every dart is independent, so the only thing that improves is the count.", "idle");
      return;
    }
    if (!isFinite(est)) {
      setStatus("No needle has crossed a line yet, so 2L/(crossings/N) is undefined. Give it a few more throws.", "warn");
      return;
    }
    if (state.repeats.length) {
      const mean = state.repeatMean || 0;
      setStatus(
        `${state.repeats.length} independent runs at N = 2,000 each: mean ${mean.toFixed(
          3
        )}, spread ${state.repeatStd.toFixed(3)} against a predicted ${state.repeatTheory.toFixed(
          3
        )}. Repeating is the honest way to see the error bar.`,
        "good"
      );
      return;
    }

    const z = sigma > 0 ? err / sigma : 0;
    const mood = z > 2.5 ? "an unusually large gap" : "a gap well inside the noise";
    setStatus(
      `${fmtNum(state.n)} samples → ${est.toFixed(4)}, ${(100 * err / TRUE_PI).toFixed(
        2
      )}% off. Standard error is ${sigma.toFixed(4)}, so this is ${z.toFixed(1)}σ from the truth — ${mood}.`,
      z > 2.5 ? "warn" : "good"
    );
  }

  /* -------------------------------------------------------------- drawing */

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#050b0a";
    ctx.fillRect(0, 0, W, H);

    drawScatter();
    drawConvergence();
    drawHistogram();
    drawStats();

    ctx.fillStyle = "#6c8783";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("independent uniform draws · no cleverness, only counting", 44, H - 16);
    ctx.textAlign = "right";
    ctx.fillStyle = state.running ? "#5ef0c4" : "#ffcf7a";
    ctx.fillText(state.running ? "throwing" : "paused", W - 44, H - 16);
    ctx.textAlign = "left";
  }

  function drawScatter() {
    ctx.fillStyle = "#9fb8b3";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    const exp = EXPERIMENTS[state.experiment];
    ctx.fillText(exp.name + " · unit square", SX, SY - 14);

    ctx.fillStyle = "#0a1513";
    ctx.fillRect(SX, SY, SQ, SQ);
    ctx.strokeStyle = "#22352f";
    ctx.strokeRect(SX + 0.5, SY + 0.5, SQ - 1, SQ - 1);

    // Unit circle / integrand guide.
    ctx.strokeStyle = "rgba(94, 240, 196, 0.45)";
    ctx.lineWidth = 1.5;
    if (state.experiment === "integral") {
      ctx.beginPath();
      for (let i = 0; i <= 120; i++) {
        const x = i / 120;
        const f = 4 / (1 + x * x);
        const px = SX + x * SQ;
        const py = SY + SQ - (f / 4) * SQ;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.fillStyle = "rgba(94, 240, 196, 0.10)";
      ctx.fillRect(SX, SY, SQ, SQ);
    } else {
      ctx.beginPath();
      ctx.arc(SX, SY + SQ, SQ, -Math.PI / 2, 0);
      ctx.stroke();
      ctx.fillStyle = "rgba(94, 240, 196, 0.07)";
      ctx.beginPath();
      ctx.moveTo(SX, SY + SQ);
      ctx.arc(SX, SY + SQ, SQ, -Math.PI / 2, 0);
      ctx.closePath();
      ctx.fill();
    }

    // Buffon floor lines.
    if (state.experiment === "buffon") {
      ctx.strokeStyle = "rgba(255, 207, 122, 0.35)";
      ctx.setLineDash([6, 6]);
      for (let i = 0; i <= 4; i++) {
        const y = SY + (i * SQ) / 4;
        ctx.beginPath();
        ctx.moveTo(SX, y);
        ctx.lineTo(SX + SQ, y);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    for (const dot of state.dots) {
      const px = SX + dot.x * SQ;
      const py = SY + (1 - dot.y) * SQ;
      ctx.fillStyle = dot.hit ? "rgba(94, 240, 196, 0.85)" : "rgba(255, 122, 156, 0.65)";
      ctx.fillRect(px - 1.2, py - 1.2, 2.4, 2.4);
    }

    ctx.fillStyle = "#6c8783";
    ctx.font = "10.5px ui-monospace, Menlo, monospace";
    ctx.fillText(exp.formula, SX, SY + SQ + 20);
    ctx.fillText(exp.exact, SX + SQ - 74, SY + SQ + 20);
  }

  function drawConvergence() {
    const x0 = CX;
    const y0 = CY;
    ctx.fillStyle = "#9fb8b3";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("estimate vs sample count", x0, y0 - 14);

    ctx.fillStyle = "#0a1513";
    ctx.fillRect(x0, y0, CW, CH);
    ctx.strokeStyle = "#22352f";
    ctx.strokeRect(x0 + 0.5, y0 + 0.5, CW - 1, CH - 1);

    const pad = 34;
    const xOf = (n) => x0 + pad + ((Math.log10(Math.max(10, n)) - 1) / 5) * (CW - pad - 12);
    const yOf = (v) => y0 + CH / 2 - ((v - TRUE_PI) / 0.6) * ((CH - 26) / 2);

    // ±0.05 / ±0.02 guide lines.
    ctx.strokeStyle = "#243733";
    for (const delta of [-0.4, -0.2, 0, 0.2, 0.4]) {
      const y = yOf(TRUE_PI + delta);
      ctx.beginPath();
      ctx.moveTo(x0 + pad, y + 0.5);
      ctx.lineTo(x0 + CW - 12, y + 0.5);
      ctx.stroke();
      ctx.fillStyle = "#5f7a75";
      ctx.font = "9.5px ui-monospace, Menlo, monospace";
      ctx.textAlign = "right";
      ctx.fillText((TRUE_PI + delta).toFixed(2), x0 + pad - 6, y + 3);
    }
    for (const power of [1, 2, 3, 4, 5, 6]) {
      const x = xOf(Math.pow(10, power));
      ctx.strokeStyle = "#22332f";
      ctx.beginPath();
      ctx.moveTo(x + 0.5, y0 + 6);
      ctx.lineTo(x + 0.5, y0 + CH - 8);
      ctx.stroke();
      ctx.fillStyle = "#5f7a75";
      ctx.textAlign = "center";
      ctx.fillText(power === 6 ? "1M" : "1e" + power, x, y0 + CH + 14);
    }

    // Truth.
    ctx.strokeStyle = "#ffcf7a";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(x0 + pad, yOf(TRUE_PI) + 0.5);
    ctx.lineTo(x0 + CW - 12, yOf(TRUE_PI) + 0.5);
    ctx.stroke();

    // Error bars and the estimate line.
    if (state.history.length > 1) {
      ctx.fillStyle = "rgba(94, 240, 196, 0.22)";
      for (const p of state.history) {
        const x = xOf(p.n);
        const top = yOf(Math.min(TRUE_PI + 0.6, p.est + p.sigma));
        const bottom = yOf(Math.max(TRUE_PI - 0.6, p.est - p.sigma));
        ctx.fillRect(x - 1, top, 2, Math.max(1, bottom - top));
      }
      ctx.strokeStyle = "#5ef0c4";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      let started = false;
      for (const p of state.history) {
        const x = xOf(p.n);
        const y = yOf(p.est);
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }

  function drawHistogram() {
    ctx.fillStyle = "#9fb8b3";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("distribution of 200 independent estimates", HX, HY - 14);

    ctx.fillStyle = "#0a1513";
    ctx.fillRect(HX, HY, HW, HH);
    ctx.strokeStyle = "#22352f";
    ctx.strokeRect(HX + 0.5, HY + 0.5, HW - 1, HH - 1);

    if (!state.repeats.length) {
      ctx.fillStyle = "#54706b";
      ctx.font = "12px 'Inter', system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Press “200 repeats” to run the whole experiment 200 times.", HX + HW / 2, HY + HH / 2 + 4);
      ctx.textAlign = "left";
      return;
    }

    const results = state.repeats;
    const min = Math.min(...results);
    const max = Math.max(...results);
    const lo = Math.min(min, TRUE_PI - (max - min) * 0.15);
    const hi = Math.max(max, TRUE_PI + (max - min) * 0.15);
    const bins = 26;
    const counts = new Array(bins).fill(0);
    results.forEach((v) => {
      const idx = Math.min(bins - 1, Math.max(0, Math.floor(((v - lo) / (hi - lo)) * bins)));
      counts[idx]++;
    });
    const peak = Math.max(...counts);

    const xOf = (v) => HX + 10 + ((v - lo) / (hi - lo)) * (HW - 20);
    const barW = (HW - 20) / bins;

    for (let i = 0; i < bins; i++) {
      if (!counts[i]) continue;
      const h = (counts[i] / peak) * (HH - 42);
      ctx.fillStyle = "rgba(94, 240, 196, 0.55)";
      ctx.fillRect(HX + 10 + i * barW + 0.5, HY + HH - 22 - h, barW - 1, h);
    }

    ctx.strokeStyle = "#ffcf7a";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(xOf(TRUE_PI), HY + 8);
    ctx.lineTo(xOf(TRUE_PI), HY + HH - 20);
    ctx.stroke();

    ctx.fillStyle = "#7f9b96";
    ctx.font = "9.5px ui-monospace, Menlo, monospace";
    ctx.textAlign = "center";
    ctx.fillText(lo.toFixed(2), HX + 12, HY + HH - 6);
    ctx.fillText(TRUE_PI.toFixed(2), xOf(TRUE_PI), HY + HH - 6);
    ctx.fillText(hi.toFixed(2), HX + HW - 14, HY + HH - 6);
    ctx.textAlign = "left";
  }

  function drawStats() {
    ctx.fillStyle = "#0a1513";
    ctx.fillRect(TX, TY, TW, TH);
    ctx.strokeStyle = "#22352f";
    ctx.strokeRect(TX + 0.5, TY + 0.5, TW - 1, TH - 1);

    const exp = EXPERIMENTS[state.experiment];
    ctx.fillStyle = "#c8ded9";
    ctx.font = "600 12px 'Inter', system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(exp.name, TX + 16, TY + 24);

    ctx.fillStyle = "#87a29d";
    ctx.font = "11px 'Inter', system-ui, sans-serif";
    wrap(exp.blurb, TX + 16, TY + 44, TW - 32, 15);

    const rows = [
      ["samples", fmtNum(state.n)],
      ["estimate", state.n && isFinite(currentEstimate()) ? currentEstimate().toFixed(5) : "—"],
      ["standard error", isFinite(currentSigma()) ? currentSigma().toFixed(5) : "—"],
      ["10× samples", state.scaleRatio ? state.scaleRatio.toFixed(2) + "× smaller error" : "not measured"],
    ];
    rows.forEach((row, i) => {
      const y = TY + 96 + i * 22;
      ctx.fillStyle = "#7b9792";
      ctx.font = "11px ui-monospace, Menlo, monospace";
      ctx.fillText(row[0], TX + 16, y);
      ctx.fillStyle = "#e6f6f2";
      ctx.textAlign = "right";
      ctx.fillText(row[1], TX + TW - 16, y);
      ctx.textAlign = "left";
    });

    ctx.fillStyle = "#5f7a75";
    ctx.font = "10.5px 'Inter', system-ui, sans-serif";
    ctx.fillText("Ten times the samples should mean about a third of the error.", TX + 16, TY + TH - 14);
  }

  function wrap(text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    let line = "";
    let cursor = y;
    for (const word of words) {
      const test = line ? line + " " + word : word;
      const width = ctx.measureText ? ctx.measureText(test).width : test.length * 5.5;
      if (width > maxWidth && line) {
        ctx.fillText(line, x, cursor);
        line = word;
        cursor += lineHeight;
      } else line = test;
    }
    if (line) ctx.fillText(line, x, cursor);
  }

  /* ---------------------------------------------------------------- input */

  function setExperiment(name) {
    state.experiment = name;
    ["pi", "integral", "buffon"].forEach((key) => el("exp-" + key).classList.toggle("active", key === name));
    reset();
    setStatus(EXPERIMENTS[name].blurb, "idle");
  }

  el("exp-pi").addEventListener("click", () => setExperiment("pi"));
  el("exp-integral").addEventListener("click", () => setExperiment("integral"));
  el("exp-buffon").addEventListener("click", () => setExperiment("buffon"));

  el("rate").addEventListener("input", (evt) => {
    state.rate = Math.max(20, Number(evt.target.value) || 20);
    el("rate-out").textContent = String(state.rate);
  });

  el("needle").addEventListener("input", (evt) => {
    state.needle = Math.min(1, Math.max(0.1, Number(evt.target.value) || 0.1));
    el("needle-out").textContent = state.needle.toFixed(2);
    reset();
  });

  el("toggle").addEventListener("click", () => {
    state.running = !state.running;
    el("toggle").textContent = state.running ? "Pause" : "Run";
    updateStatus(true);
  });

  el("burst").addEventListener("click", () => {
    throwDarts(1000000);
    updateReadouts();
    updateStatus(true);
  });

  el("repeat").addEventListener("click", () => {
    const info = runRepeats(200, 2000);
    rmsRatio(24, 800);
    updateReadouts();
    setStatus(
      `200 independent estimates at N = 2,000: mean ${info.mean.toFixed(3)}, standard deviation ${info.std.toFixed(
        3
      )} against a predicted ${info.theory.toFixed(3)}. The theory holds even though no single run looks like it.`,
      "good"
    );
  });

  el("reset").addEventListener("click", () => reset());

  document.addEventListener("keydown", (evt) => {
    const key = evt.key;
    if (key === " ") {
      evt.preventDefault();
      state.running = !state.running;
      el("toggle").textContent = state.running ? "Pause" : "Run";
      updateStatus(true);
    } else if (key === "r" || key === "R") reset();
    else if (key === "b" || key === "B") {
      throwDarts(1000000);
      updateReadouts();
      updateStatus(true);
    }
  });

  /* ------------------------------------------------------------- main loop */

  function loop() {
    state.frame++;
    if (state.running) {
      throwDarts(state.rate);
      updateReadouts();
      updateStatus(false);
    }
    draw();
    requestAnimationFrame(loop);
  }

  window.__lab = {
    state,
    reset,
    throwDarts,
    runRepeats,
    currentEstimate,
    currentSigma,
    standardErrorFor,
    rmsRatio,
    updateReadouts,
    updateStatus,
    setExperiment,
    EXPERIMENTS,
    TRUE_PI,
  };

  reset(424242);
  draw();
  requestAnimationFrame(loop);
})();
