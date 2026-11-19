(() => {
  "use strict";

  // Central limit theorem lab. Roll n dice with f faces, sum them, repeat.
  // One die is uniform; the sum of n dice tends to Normal(mu, sigma) with
  //   mu = n*(f+1)/2,  sigma^2 = n*(f^2-1)/12.

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");

  const W = canvas.width || 880;
  const H = canvas.height || 660;

  const STAGE = { x: 26, y: 50, w: 828, h: 560 };

  const PRESETS = {
    d6: { label: "d6", faces: 6 },
    d4: { label: "d4", faces: 4 },
    d20: { label: "d20", faces: 20 },
  };

  const state = {
    n: 5,
    samples: 2000,
    faces: 6,
    preset: "d6",
    sums: [],
    seed: 999,
    showNormal: true,
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

  /* ------------------------------------------------------------------ clt core */

  function dieMean(faces) {
    return (faces + 1) / 2;
  }

  function dieVariance(faces) {
    return (faces * faces - 1) / 12;
  }

  function sumMean(n, faces) {
    return n * dieMean(faces);
  }

  function sumVariance(n, faces) {
    return n * dieVariance(faces);
  }

  function normalPdf(x, mu, sigma) {
    const z = (x - mu) / sigma;
    return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
  }

  function rollSums(n, faces, samples, rng) {
    const out = [];
    for (let s = 0; s < samples; s++) {
      let total = 0;
      for (let d = 0; d < n; d++) total += 1 + Math.floor(rng() * faces);
      out.push(total);
    }
    return out;
  }

  function sampleStats(sums) {
    const n = sums.length;
    if (n === 0) return { mean: 0, sd: 0, skew: 0 };
    const mean = sums.reduce((a, b) => a + b, 0) / n;
    let m2 = 0, m3 = 0;
    sums.forEach((s) => {
      const d = s - mean;
      m2 += d * d;
      m3 += d * d * d;
    });
    m2 /= n;
    m3 /= n;
    const sd = Math.sqrt(m2);
    const skew = sd === 0 ? 0 : m3 / Math.pow(sd, 3);
    return { mean, sd, skew };
  }

  function histogram(sums, min, max) {
    const bins = new Array(max - min + 1).fill(0);
    sums.forEach((s) => {
      if (s >= min && s <= max) bins[s - min]++;
    });
    return bins;
  }

  /* ------------------------------------------------------------------- drawing */

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#070907";
    ctx.fillRect(STAGE.x, STAGE.y, STAGE.w, STAGE.h);

    const min = state.n;
    const max = state.n * state.faces;
    const bins = histogram(state.sums, min, max);
    const maxCount = Math.max(1, ...bins);
    const plot = { x: STAGE.x + 30, y: STAGE.y + 30, w: STAGE.w - 60, h: STAGE.h - 90 };
    const bw = plot.w / bins.length;

    // bars
    bins.forEach((c, i) => {
      const bh = (c / maxCount) * plot.h;
      ctx.fillStyle = "#9be15d";
      ctx.fillRect(plot.x + i * bw + 1, plot.y + plot.h - bh, bw - 2, bh);
    });

    // normal curve (scaled to histogram peak)
    if (state.showNormal) {
      const mu = sumMean(state.n, state.faces);
      const sigma = Math.sqrt(sumVariance(state.n, state.faces));
      const peak = normalPdf(mu, mu, sigma) * state.samples;
      const scaleY = plot.h / Math.max(1, peak);
      ctx.strokeStyle = "#7cc4ff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = min; x <= max; x += 0.25) {
        const px = plot.x + ((x - min) / (max - min)) * plot.w;
        const py = plot.y + plot.h - normalPdf(x, mu, sigma) * state.samples * scaleY;
        if (x === min) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    // sample mean marker
    const stats = sampleStats(state.sums);
    if (state.sums.length) {
      const mx = plot.x + ((stats.mean - min) / (max - min)) * plot.w;
      ctx.strokeStyle = "#ffb45f";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(mx, plot.y);
      ctx.lineTo(mx, plot.y + plot.h);
      ctx.stroke();
    }

    // axes labels
    ctx.fillStyle = "#93a48f";
    ctx.font = "10px ui-monospace, Menlo, monospace";
    ctx.textAlign = "center";
    ctx.fillText(String(min), plot.x, plot.y + plot.h + 16);
    ctx.fillText(String(max), plot.x + plot.w, plot.y + plot.h + 16);
    ctx.textAlign = "left";
    ctx.fillText(
      "sum of " + state.n + "d" + state.faces + "  (" + state.samples + " rolls)",
      STAGE.x + 8,
      STAGE.y + 16
    );
  }

  /* ------------------------------------------------------------------ readouts */

  function updateReadouts() {
    const stats = sampleStats(state.sums);
    const tmu = sumMean(state.n, state.faces);
    const tsd = Math.sqrt(sumVariance(state.n, state.faces));

    el("n-out").textContent = String(state.n);
    el("samples-out").textContent = String(state.samples);

    el("mean-hud").textContent = "mean " + stats.mean.toFixed(2);
    el("sd-hud").textContent = "sd " + stats.sd.toFixed(2);
    el("n-hud").textContent = "dice " + state.n + "d" + state.faces;

    el("mean-read").textContent = stats.mean.toFixed(2);
    el("tmean-read").textContent = tmu.toFixed(2);
    el("sd-read").textContent = stats.sd.toFixed(2);
    el("tsd-read").textContent = tsd.toFixed(2);
    el("skew-read").textContent = stats.skew.toFixed(3);
    el("samples-read").textContent = String(state.sums.length);
  }

  function describe() {
    const stats = sampleStats(state.sums);
    const tmu = sumMean(state.n, state.faces);
    const tsd = Math.sqrt(sumVariance(state.n, state.faces));
    let msg;
    if (state.n === 1) {
      msg = "One die: perfectly flat. Every face is equally likely, so the histogram is a rectangle — the opposite of a bell curve.";
    } else if (state.n === 2) {
      msg = "Two dice: a triangle. The middle sums (7 on a d6 pair) can be made two ways, the extremes only one — counting the ways is the whole trick.";
    } else if (state.n < 6) {
      msg = "The bell is forming: sample mean " + stats.mean.toFixed(2) + " vs theory " + tmu.toFixed(2) + ", sd " + stats.sd.toFixed(2) + " vs " + tsd.toFixed(2) + ". Skewness " + stats.skew.toFixed(2) + " and falling.";
    } else {
      msg = "Nearly perfect: sample mean " + stats.mean.toFixed(2) + " (theory " + tmu.toFixed(2) + "), sd " + stats.sd.toFixed(2) + " (theory " + tsd.toFixed(2) + "). The sum of independent dice is normal — the central limit theorem.";
    }
    el("status").textContent = msg;
  }

  /* -------------------------------------------------------------------- wiring */

  function roll() {
    const rng = mulberry32(state.seed);
    state.sums = rollSums(state.n, state.faces, state.samples, rng);
    state.seed = (state.seed * 1103515245 + 12345) >>> 0;
    updateReadouts();
    describe();
    draw();
  }

  function setPreset(name) {
    const p = PRESETS[name];
    if (!p) return;
    state.preset = name;
    state.faces = p.faces;
    ["d6", "d4", "d20"].forEach((kk) => {
      el("preset-" + kk).classList.toggle("active", kk === name);
    });
    roll();
  }

  el("n").addEventListener("input", (evt) => {
    state.n = Math.max(1, Math.min(20, Number(evt.target.value) || 5));
    roll();
  });
  el("samples").addEventListener("input", (evt) => {
    state.samples = Math.max(200, Math.min(5000, Number(evt.target.value) || 2000));
    roll();
  });

  el("preset-d6").addEventListener("click", () => setPreset("d6"));
  el("preset-d4").addEventListener("click", () => setPreset("d4"));
  el("preset-d20").addEventListener("click", () => setPreset("d20"));

  el("btn-roll").addEventListener("click", roll);
  el("toggle-normal").addEventListener("click", () => {
    state.showNormal = !state.showNormal;
    el("toggle-normal").classList.toggle("active", state.showNormal);
    draw();
  });

  document.addEventListener("keydown", (evt) => {
    if (evt.key === "1") setPreset("d6");
    else if (evt.key === "2") setPreset("d4");
    else if (evt.key === "3") setPreset("d20");
    else if (evt.key === " ") {
      evt.preventDefault();
      roll();
    }
  });

  window.__lab = {
    state,
    PRESETS,
    dieMean,
    dieVariance,
    sumMean,
    sumVariance,
    normalPdf,
    rollSums,
    sampleStats,
    histogram,
    setPreset,
    roll,
    updateReadouts,
    describe,
    draw,
  };

  roll();
})();
