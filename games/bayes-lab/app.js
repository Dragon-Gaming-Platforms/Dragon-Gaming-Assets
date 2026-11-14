(() => {
  "use strict";

  // Two classic Bayesian problems side by side.
  //
  // 1. A diagnostic test: prior × likelihood / evidence, with the arithmetic
  //    shown as a 10,000-person tree so the answer is not a magic number.
  // 2. A coin with unknown bias: a Beta(a, b) posterior updated flip by flip,
  //    drawn as a density with a 95% credible interval.

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");

  const W = canvas.width || 880;
  const H = canvas.height || 680;

  const TX = 40;
  const TY = 60;
  const TW = 380;
  const TH = 236;

  const CX = 452;
  const CY = 60;
  const CW = 388;
  const CH = 236;

  const GRID_X = 40;
  const GRID_Y = 348;
  const GRID_W = 380;
  const GRID_H = 232;

  const DX = 452;
  const DY = 378;
  const DW = 388;
  const DH = 216;

  const state = {
    prev: 0.01,
    sens: 0.99,
    fpr: 0.05,
    reps: 1,
    heads: 0,
    flips: 0,
    bias: 0.5,
    priorStrength: 2,
    seed: 8675309,
    rng: null,
    history: [],
    frame: 0,
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

  const state2 = () => state;

  /* ----------------------------------------------------------- the test */

  function posteriorProbability() {
    // Repeated independent positives: odds multiply.
    let prior = state.prev;
    for (let i = 0; i < state.reps; i++) {
      const numerator = prior * state.sens;
      const denominator = numerator + (1 - prior) * state.fpr;
      prior = denominator > 0 ? numerator / denominator : 0;
    }
    return prior;
  }

  function singlePositive() {
    const numerator = state.prev * state.sens;
    const denominator = numerator + (1 - state.prev) * state.fpr;
    return denominator > 0 ? numerator / denominator : 0;
  }

  function oddsString() {
    const p = posteriorProbability();
    if (p <= 0) return "—";
    if (p >= 1) return "1 : 0";
    const against = (1 - p) / p;
    return against >= 1 ? `1 : ${against.toFixed(against < 10 ? 2 : 0)}` : `${(p / (1 - p)).toFixed(1)} : 1`;
  }

  /* ----------------------------------------------------------- the coin */

  // A zero-strength prior would make Beta(0, 0), which has no density, so the
  // parameters never drop below a half (the Jeffreys prior).
  function alpha() {
    return Math.max(0.5, state.heads + state.priorStrength / 2);
  }
  function beta() {
    return Math.max(0.5, state.flips - state.heads + state.priorStrength / 2);
  }

  function betaPdf(x, a, b) {
    // Normalised Beta density on (0, 1) via logs, for plotting only.
    if (x <= 0 || x >= 1) return 0;
    const logB =
      lgamma(a) + lgamma(b) - lgamma(a + b);
    const logPdf = (a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x) - logB;
    return Math.exp(logPdf);
  }

  function lgamma(z) {
    // Lanczos approximation (g = 7).
    const g = 7;
    const c = [
      0.99999999999980993, 676.5203681218851, -1259.1392167224028,
      771.32342877765313, -176.61502916214059, 12.507343278686905,
      -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
    ];
    if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - lgamma(1 - z);
    z -= 1;
    let x = c[0];
    for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
    const t = z + g + 0.5;
    return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
  }

  function credibleInterval() {
    // Numeric integration of the posterior on a 0.002 grid.
    const a = alpha();
    const b = beta();
    const steps = 500;
    const densities = [];
    let total = 0;
    for (let i = 1; i < steps; i++) {
      const x = i / steps;
      const d = betaPdf(x, a, b);
      densities.push([x, d]);
      total += d;
    }
    if (!total) return [0, 1];
    let acc = 0;
    let lo = 0;
    let hi = 1;
    let foundLo = false;
    for (const [x, d] of densities) {
      acc += d;
      if (!foundLo && acc >= total * 0.025) {
        lo = x;
        foundLo = true;
      }
      if (acc >= total * 0.975) {
        hi = x;
        break;
      }
    }
    return [lo, hi];
  }

  function posteriorMean() {
    const a = alpha();
    const b = beta();
    return a / (a + b);
  }

  function flip(n) {
    for (let i = 0; i < n; i++) {
      state.flips++;
      if (state.rng() < state.bias) state.heads++;
    }
    if (state.history.length && state.flips - state.history[state.history.length - 1][0] < 2) {
      // Only one point per couple of flips keeps the log-scale trace readable.
      state.history[state.history.length - 1] = [state.flips, posteriorMean()];
    } else {
      state.history.push([state.flips, posteriorMean()]);
    }
    if (state.history.length > 700) state.history.splice(0, state.history.length - 700);
    updateReadouts();
    updateStatus();
  }

  function resetCoin(seed) {
    state.seed = seed !== undefined ? seed : (state.seed * 1664525 + 1013904223) >>> 0;
    state.rng = seeded(state.seed);
    state.heads = 0;
    state.flips = 0;
    state.history = [[0, 0.5]];
    updateReadouts();
    updateStatus();
  }

  /* ------------------------------------------------------------- readouts */

  function pct(p, digits) {
    return (100 * p).toFixed(digits === undefined ? 1 : digits) + "%";
  }

  function setStatus(text, kind) {
    const box = el("status");
    box.textContent = text;
    box.className = "status" + (kind ? " " + kind : "");
  }

  function updateReadouts() {
    const post = posteriorProbability();
    const single = singlePositive();
    el("post-read").textContent = pct(post, post < 0.01 ? 2 : 1);
    el("post-hud").textContent = `P(disease | +${state.reps > 1 ? " × " + state.reps : ""}) = ${pct(post, 1)}`;
    el("ppv-read").textContent = pct(single, single < 0.01 ? 2 : 1);
    el("odds-read").textContent = oddsString();
    el("heads-read").textContent = `${state.heads} / ${state.flips}`;
    el("mean-read").textContent = posteriorMean().toFixed(3);
    const [lo, hi] = credibleInterval();
    el("ci-read").textContent = `${lo.toFixed(2)}–${hi.toFixed(2)}`;
    el("flips-hud").textContent = state.flips + " flips";
    const m = posteriorMean();
    el("mode-hud").textContent = "posterior mean " + m.toFixed(2);
    el("prev-out").textContent = pct(state.prev, state.prev < 0.01 ? 2 : 1);
    el("sens-out").textContent = pct(state.sens, 1);
    el("fpr-out").textContent = pct(state.fpr, 1);
    el("reps-out").textContent = String(state.reps);
    el("bias-out").textContent = state.bias.toFixed(2);
    el("priorout-out").textContent = String(state.priorStrength);
  }

  function updateStatus() {
    const post = posteriorProbability();
    const single = singlePositive();
    if (state.reps === 1) {
      if (post < 0.02) {
        setStatus(
          `A positive test at ${pct(state.prev, 2)} prevalence means P(disease) = ${pct(
            post,
            2
          )}. Almost every positive comes from the much larger healthy group, not from the sick one.`,
          "idle"
        );
      } else if (post < 0.5) {
        setStatus(
          `P(disease | +) = ${pct(post, 1)}. The test helps — the prior was ${pct(
            state.prev,
            1
          )} — but a positive is still more likely a false alarm than not.`,
          "idle"
        );
      } else {
        setStatus(`P(disease | +) = ${pct(post, 1)}. Here the test genuinely settles it, because the prior was not tiny.`, "good");
      }
      return;
    }
    setStatus(
      `${state.reps} positives in a row: ${pct(single, 1)} after one, ${pct(
        post,
        1
      )} after ${state.reps}. Independent evidence multiplies the odds, which is why retesting is so much stronger than a better test.`,
      "good"
    );
  }

  /* -------------------------------------------------------------- drawing */

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#05070c";
    ctx.fillRect(0, 0, W, H);

    drawBayesBox();
    drawPosteriorCurve();
    drawTree();
    drawCoinTrace();

    ctx.fillStyle = "#6d7893";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("prior × likelihood ÷ evidence — computed live, not looked up", 40, H - 14);
    ctx.textAlign = "right";
    ctx.fillText(`flips ${state.flips} · prior strength ${state.priorStrength}`, W - 40, H - 14);
    ctx.textAlign = "left";
  }

  function drawBayesBox() {
    const post = posteriorProbability();
    ctx.fillStyle = "#0a0f18";
    ctx.fillRect(TX, TY, TW, TH);
    ctx.strokeStyle = "#222c40";
    ctx.strokeRect(TX + 0.5, TY + 0.5, TW - 1, TH - 1);

    ctx.fillStyle = "#8b96b0";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("diagnostic test · Bayes' rule", TX + 16, TY + 22);

    ctx.fillStyle = "#7ba7ff";
    ctx.font = "700 42px 'Inter', system-ui, sans-serif";
    ctx.fillText(pct(post, post < 0.01 ? 2 : 1), TX + 16, TY + 74);

    ctx.fillStyle = "#8b96b0";
    ctx.font = "12px 'Inter', system-ui, sans-serif";
    ctx.fillText("chance the patient is actually ill after a positive test", TX + 16, TY + 96);

    // Bar: prior vs posterior.
    const barY = TY + 118;
    const barW = TW - 32;
    ctx.fillStyle = "#131b28";
    ctx.fillRect(TX + 16, barY, barW, 14);
    ctx.fillStyle = "#3b4a6b";
    ctx.fillRect(TX + 16, barY, Math.max(2, barW * state.prev), 14);
    ctx.fillStyle = "#7ba7ff";
    ctx.fillRect(TX + 16, barY, Math.max(2, barW * post), 14);
    ctx.strokeStyle = "#0a0f18";
    ctx.strokeRect(TX + 16.5, barY + 0.5, barW - 1, 13);

    ctx.fillStyle = "#6d7893";
    ctx.font = "10.5px ui-monospace, Menlo, monospace";
    ctx.fillText(`prior ${pct(state.prev, 2)}`, TX + 16, barY + 30);
    ctx.textAlign = "right";
    ctx.fillStyle = "#9db8ff";
    ctx.fillText(`posterior ${pct(post, 2)}`, TX + TW - 16, barY + 30);
    ctx.textAlign = "left";

    const lines = [
      `sensitivity ${pct(state.sens, 1)} · false positives ${pct(state.fpr, 1)}`,
      `odds after ${state.reps} positive${state.reps > 1 ? "s" : ""}: ${oddsString()}`,
    ];
    ctx.fillStyle = "#7d88a3";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    lines.forEach((line, i) => ctx.fillText(line, TX + 16, TY + 176 + i * 18));
  }

  function drawPosteriorCurve() {
    ctx.fillStyle = "#0a0f18";
    ctx.fillRect(CX, CY, CW, CH);
    ctx.strokeStyle = "#222c40";
    ctx.strokeRect(CX + 0.5, CY + 0.5, CW - 1, CH - 1);

    ctx.fillStyle = "#8b96b0";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("posterior density over the coin's bias", CX + 14, CY + 20);

    const a = alpha();
    const b = beta();
    const pad = 10;
    const x0 = CX + pad;
    const y0 = CY + 34;
    const w = CW - pad * 2;
    const h = CH - 66;

    let peak = 0;
    const samples = [];
    for (let i = 0; i <= 240; i++) {
      const x = i / 240;
      const d = betaPdf(Math.min(0.999, Math.max(0.001, x)), a, b);
      samples.push([x, d]);
      if (d > peak) peak = d;
    }
    peak = peak || 1;

    const [lo, hi] = credibleInterval();

    // 95% interval shading.
    ctx.fillStyle = "rgba(123, 167, 255, 0.14)";
    const ix = (x) => x0 + x * w;
    ctx.fillRect(ix(lo), y0, Math.max(1, ix(hi) - ix(lo)), h);

    // Curve.
    ctx.strokeStyle = "#7ba7ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    samples.forEach(([x, d], i) => {
      const px = ix(x);
      const py = y0 + h - (d / peak) * (h - 6);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();

    // Truth marker.
    ctx.strokeStyle = "#ffd27a";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(ix(state.bias), y0);
    ctx.lineTo(ix(state.bias), y0 + h);
    ctx.stroke();
    ctx.setLineDash([]);

    // Axes.
    ctx.fillStyle = "#5d6883";
    ctx.font = "10px ui-monospace, Menlo, monospace";
    ctx.textAlign = "center";
    for (let i = 0; i <= 4; i++) {
      const v = i / 4;
      ctx.fillText(v.toFixed(2), ix(v), y0 + h + 14);
    }
    ctx.textAlign = "left";
    ctx.fillStyle = "#7d88a3";
    ctx.fillText(`Beta(${a.toFixed(1)}, ${b.toFixed(1)}) · 95% credible ${lo.toFixed(2)}–${hi.toFixed(2)}`, x0, y0 + h + 30);
  }

  function drawTree() {
    ctx.fillStyle = "#0a0f18";
    ctx.fillRect(GRID_X, GRID_Y, GRID_W, GRID_H);
    ctx.strokeStyle = "#222c40";
    ctx.strokeRect(GRID_X + 0.5, GRID_Y + 0.5, GRID_W - 1, GRID_H - 1);

    ctx.fillStyle = "#8b96b0";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("10,000 people, drawn to scale", GRID_X + 14, GRID_Y + 20);

    const total = 10000;
    const sick = Math.round(total * state.prev);
    const well = total - sick;
    const truePos = Math.round(sick * state.sens);
    const falsePos = Math.round(well * state.fpr);

    // Dot field, coloured by outcome.
    const cols = 50;
    const rowsN = 20;
    const pitch = (GRID_W - 28) / cols;
    const dotR = Math.max(1.1, pitch * 0.34);
    const areaH = GRID_H - 100;
    let index = 0;
    for (let r = 0; r < rowsN; r++) {
      for (let c = 0; c < cols; c++) {
        if (index >= total) break;
        const px = GRID_X + 14 + c * pitch + pitch / 2;
        const py = GRID_Y + 38 + (r / (rowsN - 1)) * (areaH - pitch);
        let colour = "#1a2233";
        if (index < truePos) colour = "#7ba7ff";
        else if (index < sick) colour = "#33415d";
        else if (index < sick + falsePos) colour = "#ff7ab0";
        index++;
        ctx.fillStyle = colour;
        ctx.beginPath();
        ctx.arc(px, py, dotR, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const legendY = GRID_Y + GRID_H - 18;
    ctx.font = "10.5px ui-monospace, Menlo, monospace";
    ctx.font = "10px ui-monospace, Menlo, monospace";
    ctx.fillStyle = "#7ba7ff";
    ctx.fillText(`■ ${truePos} true pos`, GRID_X + 14, legendY);
    ctx.fillStyle = "#ff7ab0";
    ctx.fillText(`■ ${falsePos} false alarms`, GRID_X + 126, legendY);
    ctx.fillStyle = "#5d6883";
    ctx.fillText(`■ ${sick} ill`, GRID_X + 296, legendY);
  }

  function drawCoinTrace() {
    ctx.fillStyle = "#0a0f18";
    ctx.fillRect(DX, DY, DW, DH);
    ctx.strokeStyle = "#222c40";
    ctx.strokeRect(DX + 0.5, DY + 0.5, DW - 1, DH - 1);

    ctx.fillStyle = "#8b96b0";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("posterior mean after each flip", DX + 14, DY + 18);

    const pad = 26;
    const x0 = DX + pad;
    const y0 = DY + 30;
    const w = DW - pad - 14;
    const h = DH - 52;

    ctx.strokeStyle = "#1a2233";
    for (let i = 0; i <= 4; i++) {
      const y = y0 + (i / 4) * h;
      ctx.beginPath();
      ctx.moveTo(x0, y + 0.5);
      ctx.lineTo(x0 + w, y + 0.5);
      ctx.stroke();
      ctx.fillStyle = "#5d6883";
      ctx.font = "9.5px ui-monospace, Menlo, monospace";
      ctx.textAlign = "right";
      ctx.fillText((1 - i / 4).toFixed(2), x0 - 6, y + 3);
    }

    ctx.strokeStyle = "#ffd27a";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    const truthY = y0 + (1 - state.bias) * h;
    ctx.moveTo(x0, truthY);
    ctx.lineTo(x0 + w, truthY);
    ctx.stroke();
    ctx.setLineDash([]);

    if (state.history.length > 1) {
      const maxN = Math.max(10, state.history[state.history.length - 1][0]);
      ctx.strokeStyle = "#7ba7ff";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      state.history.forEach(([n, mean], i) => {
        const px = x0 + (Math.log10(Math.max(1, n)) / Math.log10(Math.max(10, maxN))) * w;
        const py = y0 + (1 - mean) * h;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
    }

    ctx.fillStyle = "#5d6883";
    ctx.font = "9.5px ui-monospace, Menlo, monospace";
    ctx.textAlign = "center";
    ctx.fillText("log₁₀ flips", x0 + w / 2, DY + DH - 8);
    ctx.textAlign = "left";
  }

  /* ---------------------------------------------------------------- input */

  function bind(id, key, transform) {
    el(id).addEventListener("input", (evt) => {
      state[key] = transform(Number(evt.target.value));
      updateReadouts();
      updateStatus();
    });
  }

  bind("prev", "prev", (v) => Math.max(0.001, Math.min(0.5, v)));
  bind("sens", "sens", (v) => Math.max(0.05, Math.min(0.9999, v)));
  bind("fpr", "fpr", (v) => Math.max(0.001, Math.min(0.5, v)));
  bind("reps", "reps", (v) => Math.max(1, Math.min(4, Math.round(v))));
  bind("bias", "bias", (v) => Math.max(0.02, Math.min(0.98, v)));
  bind("prior", "priorStrength", (v) => {
    state.priorStrength = Math.max(0, Math.round(v));
    state.history = [[0, posteriorMean()]];
  });

  el("flip").addEventListener("click", () => flip(1));
  el("flip10").addEventListener("click", () => flip(10));
  el("flip100").addEventListener("click", () => flip(100));

  document.addEventListener("keydown", (evt) => {
    const key = evt.key;
    if (key === " ") {
      evt.preventDefault();
      flip(1);
    } else if (key === "h" || key === "H") flip(10);
    else if (key === "r" || key === "R") {
      resetCoin();
    }
  });

  /* ------------------------------------------------------------- main loop */

  function loop() {
    state.frame++;
    draw();
    requestAnimationFrame(loop);
  }

  window.__lab = {
    state,
    posteriorProbability,
    singlePositive,
    oddsString,
    flip,
    resetCoin,
    alpha,
    beta,
    betaPdf,
    credibleInterval,
    posteriorMean,
    updateReadouts,
    updateStatus,
  };

  resetCoin(8675309);
  updateReadouts();
  updateStatus();
  draw();
  requestAnimationFrame(loop);
})();
