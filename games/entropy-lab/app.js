(() => {
  "use strict";

  // Shannon entropy lab. Four outcomes with raw weights that normalise to
  // probabilities. H = -Σ p·log2(p) bits; Hmax = log2(4) = 2 bits;
  // KL(p || uniform) = log2(4) - H(p); perplexity = 2^H.

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");

  const W = canvas.width || 880;
  const H = canvas.height || 660;

  const STAGE = { x: 26, y: 50, w: 828, h: 560 };
  const LABELS = ["A", "B", "C", "D"];

  const PRESETS = {
    uniform: { label: "Uniform", raw: [25, 25, 25, 25] },
    biased: { label: "Biased", raw: [50, 25, 15, 10] },
    skewed: { label: "Skewed", raw: [70, 20, 7, 3] },
    deterministic: { label: "Certain", raw: [100, 0, 0, 0] },
  };

  const state = {
    raw: [25, 25, 25, 25],
    preset: "uniform",
    counts: [0, 0, 0, 0],
    flips: 0,
    seed: 4242,
  };

  /* --------------------------------------------------------------- entropy core */

  function normalize(raw) {
    const total = raw.reduce((s, v) => s + v, 0);
    if (total <= 0) return raw.map(() => 0);
    return raw.map((v) => v / total);
  }

  function shannonEntropy(probs) {
    let h = 0;
    for (const p of probs) {
      if (p > 0) h -= p * Math.log2(p);
    }
    return h;
  }

  function maxEntropy(n) {
    return Math.log2(n);
  }

  function klDivergence(p, q) {
    let d = 0;
    for (let i = 0; i < p.length; i++) {
      if (p[i] > 0 && q[i] > 0) d += p[i] * Math.log2(p[i] / q[i]);
    }
    return d;
  }

  function perplexity(h) {
    return Math.pow(2, h);
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

  function flip(probs, rng) {
    let r = rng();
    for (let i = 0; i < probs.length; i++) {
      r -= probs[i];
      if (r <= 0) return i;
    }
    return probs.length - 1;
  }

  /* ------------------------------------------------------------------- drawing */

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#070907";
    ctx.fillRect(STAGE.x, STAGE.y, STAGE.w, STAGE.h);

    const probs = normalize(state.raw);
    const barArea = { x: STAGE.x + 40, y: STAGE.y + 40, w: STAGE.w - 80, h: 300 };
    const n = probs.length;
    const bw = barArea.w / n;

    // uniform reference line
    const uniY = barArea.y + barArea.h - (1 / n) * barArea.h;
    ctx.strokeStyle = "#7cc4ff";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 5]);
    ctx.beginPath();
    ctx.moveTo(barArea.x, uniY);
    ctx.lineTo(barArea.x + barArea.w, uniY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#7cc4ff";
    ctx.font = "10px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("uniform = " + (1 / n).toFixed(2), barArea.x + barArea.w - 90, uniY - 6);

    // probability bars
    probs.forEach((p, i) => {
      const bh = p * barArea.h;
      const bx = barArea.x + i * bw + 14;
      ctx.fillStyle = "#9be15d";
      ctx.fillRect(bx, barArea.y + barArea.h - bh, bw - 28, bh);
      ctx.fillStyle = "#eef5ea";
      ctx.font = "bold 13px ui-monospace, Menlo, monospace";
      ctx.textAlign = "center";
      ctx.fillText(LABELS[i], bx + (bw - 28) / 2, barArea.y + barArea.h + 18);
      ctx.font = "11px ui-monospace, Menlo, monospace";
      ctx.fillStyle = "#93a48f";
      ctx.fillText(p.toFixed(2), bx + (bw - 28) / 2, barArea.y + barArea.h - bh - 6);
    });

    // entropy meter
    const h = shannonEntropy(probs);
    const hmax = maxEntropy(n);
    const meter = { x: STAGE.x + 40, y: STAGE.y + 400, w: STAGE.w - 80, h: 34 };
    ctx.strokeStyle = "#26302a";
    ctx.lineWidth = 1;
    ctx.strokeRect(meter.x, meter.y, meter.w, meter.h);
    ctx.fillStyle = "#ffb45f";
    ctx.fillRect(meter.x, meter.y, (h / hmax) * meter.w, meter.h);
    ctx.fillStyle = "#eef5ea";
    ctx.font = "12px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("H = " + h.toFixed(3) + " bits  (max " + hmax.toFixed(2) + ")", meter.x, meter.y + meter.h + 20);

    // sampled counts
    ctx.fillStyle = "#93a48f";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.fillText(
      "flips: " + state.flips + "   counts: " + state.counts.map((c, i) => LABELS[i] + "=" + c).join("  "),
      STAGE.x + 40,
      STAGE.y + 500
    );
  }

  /* ------------------------------------------------------------------ readouts */

  function updateReadouts() {
    const probs = normalize(state.raw);
    const h = shannonEntropy(probs);
    const hmax = maxEntropy(probs.length);
    const uni = probs.map(() => 1 / probs.length);
    const kl = klDivergence(probs, uni);

    el("pa-out").textContent = probs[0].toFixed(2);
    el("pb-out").textContent = probs[1].toFixed(2);
    el("pc-out").textContent = probs[2].toFixed(2);
    el("pd-out").textContent = probs[3].toFixed(2);

    el("entropy-hud").textContent = "entropy " + h.toFixed(3) + " bits";
    el("eff-hud").textContent = "efficiency " + ((h / hmax) * 100).toFixed(0) + "%";
    el("kl-hud").textContent = "KL " + kl.toFixed(3) + " bits";

    el("entropy-read").textContent = h.toFixed(3) + " bits";
    el("max-read").textContent = hmax.toFixed(2) + " bits";
    el("eff-read").textContent = ((h / hmax) * 100).toFixed(1) + "%";
    el("kl-read").textContent = kl.toFixed(3) + " bits";
    el("perp-read").textContent = perplexity(h).toFixed(2);
    el("counts-read").textContent = state.counts.join("/");
  }

  function describe() {
    const probs = normalize(state.raw);
    const h = shannonEntropy(probs);
    const hmax = maxEntropy(probs.length);
    const eff = h / hmax;
    let msg;
    if (h === 0) {
      msg = "Certain: one outcome has probability 1, so there is no surprise at all. H = 0 bits, and the KL divergence from uniform is maximal at " + hmax.toFixed(2) + " bits.";
    } else if (eff > 0.99) {
      msg = "Uniform: every outcome is equally likely, so each draw carries the maximum surprise. H = " + h.toFixed(2) + " bits — the most entropy four outcomes can hold.";
    } else if (eff > 0.7) {
      msg = "Mildly skewed: H = " + h.toFixed(3) + " bits (" + (eff * 100).toFixed(0) + "% of max). The distribution still surprises, just less than uniform.";
    } else {
      msg = "Heavily skewed: H = " + h.toFixed(3) + " bits (" + (eff * 100).toFixed(0) + "% of max). Most draws land on the likely outcome, so the surprise per draw is small.";
    }
    el("status").textContent = msg;
  }

  /* -------------------------------------------------------------------- wiring */

  function setPreset(name) {
    const p = PRESETS[name];
    if (!p) return;
    state.preset = name;
    state.raw = [...p.raw];
    ["pa", "pb", "pc", "pd"].forEach((id, i) => { el(id).value = String(p.raw[i]); });
    ["uniform", "biased", "skewed", "deterministic"].forEach((kk) => {
      el("preset-" + kk).classList.toggle("active", kk === name);
    });
    updateReadouts();
    describe();
    draw();
  }

  function clearPresets() {
    state.preset = "";
    ["uniform", "biased", "skewed", "deterministic"].forEach((kk) => el("preset-" + kk).classList.remove("active"));
  }

  ["pa", "pb", "pc", "pd"].forEach((id, i) => {
    el(id).addEventListener("input", (evt) => {
      state.raw[i] = Math.max(0, Math.min(100, Number(evt.target.value) || 0));
      clearPresets();
      updateReadouts();
      describe();
      draw();
    });
  });

  el("preset-uniform").addEventListener("click", () => setPreset("uniform"));
  el("preset-biased").addEventListener("click", () => setPreset("biased"));
  el("preset-skewed").addEventListener("click", () => setPreset("skewed"));
  el("preset-deterministic").addEventListener("click", () => setPreset("deterministic"));

  el("btn-flip").addEventListener("click", () => {
    const probs = normalize(state.raw);
    const rng = mulberry32(state.seed);
    for (let i = 0; i < 100; i++) {
      state.counts[flip(probs, rng)]++;
      state.flips++;
    }
    state.seed = (state.seed * 1103515245 + 12345) >>> 0;
    updateReadouts();
    describe();
    draw();
  });
  el("btn-reset").addEventListener("click", () => {
    state.counts = [0, 0, 0, 0];
    state.flips = 0;
    updateReadouts();
    describe();
    draw();
  });

  document.addEventListener("keydown", (evt) => {
    if (evt.key === "1") setPreset("uniform");
    else if (evt.key === "2") setPreset("biased");
    else if (evt.key === "3") setPreset("skewed");
    else if (evt.key === "4") setPreset("deterministic");
    else if (evt.key === "f" || evt.key === "F") el("btn-flip").click();
    else if (evt.key === "r" || evt.key === "R") el("btn-reset").click();
  });

  window.__lab = {
    state,
    PRESETS,
    normalize,
    shannonEntropy,
    maxEntropy,
    klDivergence,
    perplexity,
    flip,
    setPreset,
    updateReadouts,
    describe,
    draw,
  };

  updateReadouts();
  describe();
  draw();
})();
