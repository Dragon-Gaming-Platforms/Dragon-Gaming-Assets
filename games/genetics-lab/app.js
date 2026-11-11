(() => {
  "use strict";

  // Wright-Fisher drift with selection and mutation. Each replicate is N
  // haploid breeders that each generation are replaced by N offspring sampled
  // from the current allele frequencies. Sampling exactly N Bernoulli trials
  // is slower than a binomial approximation but keeps the mechanics visible and
  // the behaviour exact, including the absorbing states p = 0 and p = 1.

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");

  const W = canvas.width || 880;
  const H = canvas.height || 580;

  const X0 = 66;
  const Y0 = 52;
  const PW = W - X0 - 42;
  const PH = 352;
  const INSET_Y = Y0 + PH + 46;
  const INSET_H = 84;
  const WINDOW = 600;

  const COLORS = [
    "#7a5ce0", "#4fd1c5", "#ff8a5c", "#5aa9ff", "#ff6fb5",
    "#c2e85c", "#b28dff", "#43c6ac", "#ffb347", "#6fe3ff",
    "#ff5f7e", "#9adf6b", "#d48cff", "#5ce0a1", "#ffd166",
    "#7fb2ff", "#ff9ad5", "#8ce0c8", "#d6a35c", "#a7a4ff",
    "#63d2ff", "#ff7a7a", "#b8f06a", "#e0a0ff",
  ];

  const state = {
    N: 60,
    s: 0,
    mu: 0.001,
    reps: 10,
    speed: 3,
    gen: 0,
    running: true,
    seed: 20261017,
    rng: null,
    lines: [],
    p0: 0.5,
    hetHist: [],
    view: { start: 0, end: WINDOW },
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

  function reset(seed) {
    state.seed = seed !== undefined ? seed : (state.seed * 1664525 + 1013904223) >>> 0;
    state.rng = seeded(state.seed);
    state.gen = 0;
    state.lines = [];
    for (let i = 0; i < state.reps; i++) {
      state.lines.push({
        p: state.p0,
        color: COLORS[i % COLORS.length],
        points: [[0, state.p0]],
        fixed: null,
        fixedGen: null,
      });
    }
    state.hetHist = [[0, heterozygosity(), expectedHet(0)]];
    state.view = { start: 0, end: WINDOW };
    updateReadouts();
    updateStatus();
  }

  function heterozygosity() {
    if (!state.lines.length) return 0;
    let sum = 0;
    for (const line of state.lines) sum += 2 * line.p * (1 - line.p);
    return sum / state.lines.length;
  }

  function expectedHet(gen) {
    // Drift alone: H(t) = H(0) (1 - 1/N)^t.
    const h0 = 2 * state.p0 * (1 - state.p0);
    return h0 * Math.pow(1 - 1 / state.N, gen);
  }

  function meanFreq() {
    if (!state.lines.length) return 0;
    let sum = 0;
    for (const line of state.lines) sum += line.p;
    return sum / state.lines.length;
  }

  /* ----------------------------------------------------------- simulation */

  function oneGeneration() {
    const N = state.N;
    const s = state.s;
    const mu = state.mu;
    const rand = state.rng;

    for (const line of state.lines) {
      // Without mutation a fixed line is genuinely absorbing; with mutation it
      // can be re-seeded at rate mu, so fixed lines keep participating.
      if (line.fixed && mu === 0) continue;
      let p = line.p;

      if (s !== 0) {
        const wA = 1 + s;
        const denom = p * wA + (1 - p);
        p = denom > 0 ? (p * wA) / denom : p;
      }
      if (mu > 0) p = p * (1 - mu) + (1 - p) * mu;

      let count = 0;
      for (let i = 0; i < N; i++) if (rand() < p) count++;
      line.p = count / N;

      if (line.p <= 0) {
        line.p = 0;
        line.fixed = "a";
        line.fixedGen = state.gen + 1;
      } else if (line.p >= 1) {
        line.p = 1;
        line.fixed = "A";
        line.fixedGen = state.gen + 1;
      } else if (line.fixed) {
        line.fixed = null;
        line.fixedGen = null;
      }
      line.points.push([state.gen + 1, line.p]);
    }

    state.gen++;
    if (state.gen % 2 === 0) {
      state.hetHist.push([state.gen, heterozygosity(), expectedHet(state.gen)]);
      if (state.hetHist.length > 4000) state.hetHist.shift();
    }
    if (state.gen > 5000) state.running = false;
  }

  function advance(gens) {
    for (let i = 0; i < gens; i++) {
      oneGeneration();
      if (!state.running && gens > 0 && state.gen >= 5000) break;
    }
    updateReadouts();
    updateStatus();
  }

  /* ------------------------------------------------------------- readouts */

  function setStatus(text, kind) {
    const box = el("status");
    box.textContent = text;
    box.className = "status" + (kind ? " " + kind : "");
  }

  function updateReadouts() {
    const mean = meanFreq();
    const het = heterozygosity();
    const exp = expectedHet(state.gen);
    let fixedA = 0;
    let fixeda = 0;
    for (const line of state.lines) {
      if (line.fixed === "A") fixedA++;
      else if (line.fixed === "a") fixeda++;
    }

    el("gen-read").textContent = state.gen.toLocaleString("en-US");
    el("gen-hud").textContent = "gen " + state.gen;
    el("mean-read").textContent = mean.toFixed(3);
    el("mean-hud").textContent = "p̄ = " + mean.toFixed(3);
    el("het-read").textContent = het.toFixed(3);
    el("exp-read").textContent = exp.toFixed(3);
    el("fixedA-read").textContent = String(fixedA);
    el("fixeda-read").textContent = String(fixeda);
    el("fixed-hud").textContent = fixedA + fixeda + " fixed";
  }

  function updateStatus() {
    const mean = meanFreq();
    const het = heterozygosity();
    const exp = expectedHet(state.gen);
    let fixed = 0;
    for (const line of state.lines) if (line.fixed) fixed++;
    if (state.gen === 0) {
      setStatus(
        `${state.lines.length} replicates at p = 0.5, N = ${state.N}. Every generation resamples ${state.N} alleles — the variance of that sample is the whole story.`,
        "idle"
      );
      return;
    }
    if (fixed === state.lines.length) {
      setStatus(
        `All ${fixed} replicates have fixed by generation ${state.gen}. No amount of waiting brings variation back without mutation.`,
        "good"
      );
      return;
    }
    const direction = mean > 0.55 ? "rising" : mean < 0.45 ? "falling" : "still straddling 0.5";
    setStatus(
      `Generation ${state.gen}: mean p = ${mean.toFixed(3)} (${direction}), ${fixed} of ${state.lines.length} replicates fixed. Heterozygosity ${het.toFixed(
        3
      )} against ${exp.toFixed(3)} expected from drift alone.`,
      "idle"
    );
  }

  /* -------------------------------------------------------------- drawing */

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#0a0711";
    ctx.fillRect(0, 0, W, H);

    // Scroll the time axis once the run passes the visible window.
    const view = state.view;
    if (state.gen > view.end) {
      view.end = state.gen + 30;
      view.start = view.end - WINDOW;
    }

    const xOf = (g) => X0 + ((g - view.start) / (view.end - view.start)) * PW;
    const yOf = (f) => Y0 + (1 - f) * PH;

    // Plot frame and grid.
    ctx.fillStyle = "#0c0815";
    ctx.fillRect(X0, Y0, PW, PH);
    ctx.strokeStyle = "#241c38";
    ctx.lineWidth = 1;
    ctx.font = "11px ui-monospace, Menlo, monospace";
    for (let i = 0; i <= 4; i++) {
      const f = i / 4;
      const y = yOf(f);
      ctx.beginPath();
      ctx.moveTo(X0, y + 0.5);
      ctx.lineTo(X0 + PW, y + 0.5);
      ctx.stroke();
      ctx.fillStyle = "#8a7fa6";
      ctx.textAlign = "right";
      ctx.fillText(f.toFixed(2), X0 - 10, y + 4);
    }

    const span = view.end - view.start;
    const step = span <= 700 ? 100 : span <= 1600 ? 250 : 500;
    const firstTick = Math.ceil(view.start / step) * step;
    for (let g = firstTick; g <= view.end; g += step) {
      const x = xOf(g);
      ctx.strokeStyle = "#1e1730";
      ctx.beginPath();
      ctx.moveTo(x + 0.5, Y0);
      ctx.lineTo(x + 0.5, Y0 + PH);
      ctx.stroke();
      ctx.fillStyle = "#7c7295";
      ctx.textAlign = "center";
      ctx.fillText(String(g), x, Y0 + PH + 20);
    }

    ctx.save();
    ctx.translate(20, Y0 + PH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = "#8a7fa6";
    ctx.textAlign = "center";
    ctx.fillText("allele frequency", 0, 0);
    ctx.restore();

    ctx.textAlign = "center";
    ctx.fillStyle = "#8a7fa6";
    ctx.fillText("generation", X0 + PW / 2, Y0 + PH + 40);

    ctx.textAlign = "left";
    ctx.fillStyle = "#b7a9d6";
    ctx.fillText("p = 1  fixed A", X0 + 10, Y0 + 16);
    ctx.fillText("p = 0  fixed a", X0 + 10, Y0 + PH - 8);

    // Replicate trajectories.
    ctx.lineWidth = 1.4;
    for (const line of state.lines) {
      ctx.strokeStyle = line.color;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      let started = false;
      for (const [g, f] of line.points) {
        if (g < view.start - 1) continue;
        const x = xOf(g);
        const y = yOf(f);
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else ctx.lineTo(x, y);
      }
      if (line.fixed && line.fixedGen !== null) {
        ctx.lineTo(X0 + PW, yOf(line.p));
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(xOf(line.fixedGen), yOf(line.p), 3.4, 0, Math.PI * 2);
        ctx.fillStyle = "#5be0b0";
        ctx.fill();
      } else {
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // Mean trajectory, recomputed on the fly from the live frequencies.
    ctx.strokeStyle = "#f4ecff";
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    let meanStarted = false;
    const nPoints = state.lines.length ? state.lines[0].points.length : 0;
    for (let i = 0; i < nPoints; i++) {
      const g = state.lines[0].points[i][0];
      if (g < view.start - 1) continue;
      let sum = 0;
      for (const line of state.lines) {
        const pt = line.points[Math.min(i, line.points.length - 1)];
        sum += pt[1];
      }
      const y = yOf(sum / state.lines.length);
      if (!meanStarted) {
        ctx.moveTo(xOf(g), y);
        meanStarted = true;
      } else ctx.lineTo(xOf(g), y);
    }
    ctx.stroke();

    drawHetInset(xOf);

    // Footnote strip.
    let fixedA = 0;
    let fixeda = 0;
    for (const line of state.lines) {
      if (line.fixed === "A") fixedA++;
      else if (line.fixed === "a") fixeda++;
    }
    ctx.fillStyle = "#8f84aa";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(
      `N ${state.N} · s ${state.s >= 0 ? "+" : ""}${state.s.toFixed(2)} · μ ${state.mu.toFixed(4)} · ${state.lines.length} replicates · fixed A ${fixedA} / a ${fixeda}`,
      X0,
      H - 14
    );
    ctx.textAlign = "right";
    ctx.fillStyle = state.running ? "#5be0b0" : "#ffb347";
    ctx.fillText(state.running ? "running" : "paused", W - 42, H - 14);
    ctx.textAlign = "left";
  }

  function drawHetInset(xOf) {
    const yOf = (h) => INSET_Y + INSET_H - (h / 0.5) * INSET_H;

    ctx.fillStyle = "#0c0815";
    ctx.fillRect(X0, INSET_Y, PW, INSET_H);
    ctx.strokeStyle = "#241c38";
    ctx.lineWidth = 1;
    ctx.strokeRect(X0 - 0.5, INSET_Y - 0.5, PW + 1, INSET_H + 1);

    ctx.strokeStyle = "#241c38";
    for (const h of [0, 0.25, 0.5]) {
      const y = yOf(h);
      ctx.beginPath();
      ctx.moveTo(X0, y + 0.5);
      ctx.lineTo(X0 + PW, y + 0.5);
      ctx.stroke();
      ctx.fillStyle = "#7c7295";
      ctx.font = "10px ui-monospace, Menlo, monospace";
      ctx.textAlign = "right";
      ctx.fillText(h.toFixed(2), X0 - 8, y + 3);
    }

    ctx.fillStyle = "#9c90b8";
    ctx.textAlign = "left";
    ctx.font = "10px ui-monospace, Menlo, monospace";
    ctx.fillText("heterozygosity 2p(1−p)", X0 + 8, INSET_Y + 13);

    // Expected decay, dashed.
    ctx.strokeStyle = "#ff7ad9";
    ctx.setLineDash([5, 4]);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    let started = false;
    for (const [g, , exp] of state.hetHist) {
      if (g < state.view.start - 1) continue;
      const x = xOf(g);
      const y = yOf(Math.min(0.5, exp));
      if (!started) {
        ctx.moveTo(x, y);
        started = true;
      } else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Observed heterozygosity.
    ctx.strokeStyle = "#c9a2ff";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    started = false;
    for (const [g, obs] of state.hetHist) {
      if (g < state.view.start - 1) continue;
      const x = xOf(g);
      const y = yOf(Math.min(0.5, obs));
      if (!started) {
        ctx.moveTo(x, y);
        started = true;
      } else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  /* ---------------------------------------------------------------- input */

  el("N").addEventListener("input", (evt) => {
    state.N = Math.max(2, Number(evt.target.value) || 2);
    el("N-out").textContent = String(state.N);
    reset();
  });
  el("sel").addEventListener("input", (evt) => {
    state.s = Number(evt.target.value) || 0;
    el("sel-out").textContent = (state.s >= 0 ? "+" : "") + state.s.toFixed(2);
    reset();
  });
  el("mut").addEventListener("input", (evt) => {
    state.mu = Number(evt.target.value) || 0;
    el("mut-out").textContent = state.mu.toFixed(4);
    reset();
  });
  el("reps").addEventListener("input", (evt) => {
    state.reps = Math.max(1, Number(evt.target.value) || 1);
    el("reps-out").textContent = String(state.reps);
    reset();
  });
  el("speed").addEventListener("input", (evt) => {
    state.speed = Math.max(1, Number(evt.target.value) || 1);
    el("speed-out").textContent = String(state.speed);
  });

  el("toggle").addEventListener("click", () => {
    state.running = !state.running;
    el("toggle").textContent = state.running ? "Pause" : "Run";
    updateStatus();
  });
  el("step").addEventListener("click", () => advance(100));
  el("reset").addEventListener("click", () => reset());

  function preset(name) {
    if (name === "neutral") {
      setParam("N", 60);
      setParam("sel", 0);
      setParam("mut", 0.001);
    } else if (name === "strong") {
      setParam("N", 40);
      setParam("sel", 0.12);
      setParam("mut", 0.0002);
    } else if (name === "balance") {
      setParam("N", 30);
      setParam("sel", 0);
      setParam("mut", 0.01);
    }
    reset();
    setStatus(
      name === "strong"
        ? `Selection s = +0.12 against N = 40. Even a real advantage is a coin flip when the population is this small.`
        : name === "balance"
          ? `Mutation μ = 0.01 keeps re-seeding lost alleles, so nothing stays frozen at 0 or 1 — the replicate mean keeps wandering instead.`
          : `Back to neutral: no selection, weak mutation, N = 60. Pure drift from here.`,
      "idle"
    );
  }

  function setParam(control, value) {
    const slider = el(control);
    slider.value = String(value);
    slider.dispatch("input");
  }

  el("neutral").addEventListener("click", () => preset("neutral"));
  el("strong").addEventListener("click", () => preset("strong"));
  el("balance").addEventListener("click", () => preset("balance"));

  document.addEventListener("keydown", (evt) => {
    const key = evt.key;
    if (key === " ") {
      evt.preventDefault();
      state.running = !state.running;
      el("toggle").textContent = state.running ? "Pause" : "Run";
      updateStatus();
    } else if (key === "r" || key === "R") {
      reset();
    } else if (key === "s" || key === "S") {
      advance(100);
    }
  });

  /* ------------------------------------------------------------- main loop */

  function loop() {
    state.frame++;
    if (state.running) advance(state.speed);
    draw();
    requestAnimationFrame(loop);
  }

  window.__lab = {
    state,
    advance,
    reset,
    oneGeneration,
    meanFreq,
    heterozygosity,
    expectedHet,
    preset,
  };

  reset(20261017);
  draw();
  requestAnimationFrame(loop);
})();
