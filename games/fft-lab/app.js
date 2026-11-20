(() => {
  "use strict";

  // DFT lab. The signal is a sum of harmonics 1..4 sampled at N points over
  // one period. The DFT X[k] = Σ_n x[n] e^(-2πi kn/N) gives the spectrum.
  // Parseval: Σ x[n]² = (1/N) Σ |X[k]|².

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");

  const W = canvas.width || 880;
  const H = canvas.height || 660;

  const STAGE = { x: 26, y: 50, w: 828, h: 560 };
  const SIGNAL = { x: STAGE.x + 30, y: STAGE.y + 30, w: STAGE.w - 60, h: 200 };
  const SPECTRUM = { x: STAGE.x + 30, y: STAGE.y + 290, w: STAGE.w - 60, h: 220 };
  const N = 64;
  const FS = 64; // samples per second (one period = 1 s)

  const PRESETS = {
    sine: { label: "Sine", amps: [1, 0, 0, 0] },
    square: { label: "Square", amps: [1, 0, 0.333, 0] },
    saw: { label: "Saw", amps: [1, 0.5, 0.333, 0.25] },
    chord: { label: "Chord", amps: [1, 0.8, 0.6, 0.4] },
  };

  const state = {
    amps: [1, 0, 0, 0],
    preset: "sine",
    logScale: false,
    showPhase: false,
  };

  /* ------------------------------------------------------------------ dft core */

  function buildSignal(amps) {
    const x = new Array(N).fill(0);
    for (let n = 0; n < N; n++) {
      const t = n / N;
      for (let k = 0; k < amps.length; k++) {
        x[n] += amps[k] * Math.sin(2 * Math.PI * (k + 1) * t);
      }
    }
    return x;
  }

  function dft(x) {
    const n = x.length;
    const X = [];
    for (let k = 0; k < n; k++) {
      let re = 0, im = 0;
      for (let t = 0; t < n; t++) {
        const a = (-2 * Math.PI * k * t) / n;
        re += x[t] * Math.cos(a);
        im += x[t] * Math.sin(a);
      }
      X.push({ re, im });
    }
    return X;
  }

  function magnitudes(X) {
    return X.map((c) => Math.hypot(c.re, c.im));
  }

  function phases(X) {
    return X.map((c) => Math.atan2(c.im, c.re));
  }

  function parseval(x, X) {
    const e1 = x.reduce((s, v) => s + v * v, 0);
    const e2 = X.reduce((s, c) => s + (c.re * c.re + c.im * c.im), 0) / x.length;
    return { time: e1, freq: e2, ratio: e1 === 0 ? 1 : e2 / e1 };
  }

  function dominantBin(X) {
    const mags = magnitudes(X);
    let best = 0;
    let bestM = -1;
    // bins above N/2 are mirror images of bins below (real signal)
    const half = Math.floor(mags.length / 2);
    for (let k = 1; k <= half; k++) {
      if (mags[k] > bestM) { bestM = mags[k]; best = k; }
    }
    return { bin: best, mag: bestM };
  }

  /* ------------------------------------------------------------------- drawing */

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#070907";
    ctx.fillRect(STAGE.x, STAGE.y, STAGE.w, STAGE.h);

    const x = buildSignal(state.amps);
    const X = dft(x);
    const mags = magnitudes(X);

    // signal
    const midY = SIGNAL.y + SIGNAL.h / 2;
    ctx.strokeStyle = "rgba(130,150,169,0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(SIGNAL.x, midY);
    ctx.lineTo(SIGNAL.x + SIGNAL.w, midY);
    ctx.stroke();
    ctx.strokeStyle = "#9be15d";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= N; i++) {
      const v = x[i % N];
      const px = SIGNAL.x + (i / N) * SIGNAL.w;
      const py = midY - v * (SIGNAL.h / 2 - 10);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.fillStyle = "#93a48f";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("time signal (one period, repeated)", SIGNAL.x, SIGNAL.y - 8);

    // spectrum (bins 0..N/2)
    const half = N / 2;
    const maxMag = Math.max(1e-9, ...mags.slice(0, half + 1));
    const bw = SPECTRUM.w / (half + 1);
    const phs = phases(X);
    for (let k = 0; k <= half; k++) {
      const m = mags[k];
      let frac;
      if (state.logScale) frac = Math.log10(1 + m) / Math.log10(1 + maxMag);
      else frac = m / maxMag;
      const bh = frac * SPECTRUM.h;
      ctx.fillStyle = state.showPhase ? "#d59bff" : "#7cc4ff";
      ctx.fillRect(SPECTRUM.x + k * bw + 1, SPECTRUM.y + SPECTRUM.h - bh, bw - 2, bh);
      if (state.showPhase) {
        // phase tick at the top of each bar
        ctx.fillStyle = "#eef5ea";
        const px = SPECTRUM.x + k * bw + bw / 2;
        ctx.fillRect(px - 1, SPECTRUM.y + SPECTRUM.h - bh - 4, 2, 4);
      }
    }
    ctx.fillStyle = "#93a48f";
    ctx.textAlign = "left";
    ctx.fillText(
      state.showPhase ? "magnitude spectrum + phase ticks" : "magnitude spectrum (bins 0–" + half + ")",
      SPECTRUM.x,
      SPECTRUM.y - 8
    );
    ctx.textAlign = "center";
    ctx.fillText("0", SPECTRUM.x + 4, SPECTRUM.y + SPECTRUM.h + 14);
    ctx.fillText(String(half), SPECTRUM.x + SPECTRUM.w - 4, SPECTRUM.y + SPECTRUM.h + 14);
  }

  /* ------------------------------------------------------------------ readouts */

  function updateReadouts() {
    const x = buildSignal(state.amps);
    const X = dft(x);
    const dom = dominantBin(X);
    const pv = parseval(x, X);

    el("a1-out").textContent = state.amps[0].toFixed(2);
    el("a2-out").textContent = state.amps[1].toFixed(2);
    el("a3-out").textContent = state.amps[2].toFixed(2);
    el("a4-out").textContent = state.amps[3].toFixed(2);

    el("peak-hud").textContent = "peak bin " + dom.bin;
    el("bins-hud").textContent = "bins " + N;
    el("parseval-hud").textContent = "Parseval " + pv.ratio.toFixed(4);

    el("peak-read").textContent = String(dom.bin);
    el("peakmag-read").textContent = dom.mag.toFixed(1);
    el("energy-read").textContent = pv.time.toFixed(1);
    el("parseval-read").textContent = pv.ratio.toFixed(4);
    el("fs-read").textContent = FS + " Hz";
    el("bins-read").textContent = String(N);
  }

  function describe() {
    const x = buildSignal(state.amps);
    const X = dft(x);
    const dom = dominantBin(X);
    const mags = magnitudes(X);
    let msg;
    if (state.preset === "sine") {
      msg = "One sine, one bar: bin " + dom.bin + " carries everything (magnitude " + dom.mag.toFixed(1) + "). The DFT is a bank of matched filters — each bin asks how much of its frequency is present.";
    } else if (state.preset === "square") {
      msg = "Square wave: odd harmonics 1, 3, 5… with amplitudes 1, ⅓, ⅕… — the even bins stay empty. That is why a square wave sounds hollow: its spectrum has holes.";
    } else if (state.preset === "saw") {
      msg = "Sawtooth: every harmonic present, amplitudes falling as 1, ½, ⅓, ¼… — the richest spectrum of the four, and the brightest sound.";
    } else {
      msg = "Chord: four harmonics at once, so four bars light up. The DFT separates what the ear hears as a single blended tone.";
    }
    el("status").textContent = msg;
  }

  /* -------------------------------------------------------------------- wiring */

  function setPreset(name) {
    const p = PRESETS[name];
    if (!p) return;
    state.preset = name;
    state.amps = [...p.amps];
    ["a1", "a2", "a3", "a4"].forEach((id, i) => { el(id).value = String(p.amps[i]); });
    ["sine", "square", "saw", "chord"].forEach((kk) => {
      el("preset-" + kk).classList.toggle("active", kk === name);
    });
    updateReadouts();
    describe();
    draw();
  }

  function clearPresets() {
    state.preset = "";
    ["sine", "square", "saw", "chord"].forEach((kk) => el("preset-" + kk).classList.remove("active"));
  }

  ["a1", "a2", "a3", "a4"].forEach((id, i) => {
    el(id).addEventListener("input", (evt) => {
      state.amps[i] = Math.max(0, Math.min(2, Number(evt.target.value) || 0));
      clearPresets();
      updateReadouts();
      describe();
      draw();
    });
  });

  el("preset-sine").addEventListener("click", () => setPreset("sine"));
  el("preset-square").addEventListener("click", () => setPreset("square"));
  el("preset-saw").addEventListener("click", () => setPreset("saw"));
  el("preset-chord").addEventListener("click", () => setPreset("chord"));

  el("toggle-log").addEventListener("click", () => {
    state.logScale = !state.logScale;
    el("toggle-log").classList.toggle("active", state.logScale);
    draw();
  });
  el("toggle-phase").addEventListener("click", () => {
    state.showPhase = !state.showPhase;
    el("toggle-phase").classList.toggle("active", state.showPhase);
    draw();
  });

  document.addEventListener("keydown", (evt) => {
    if (evt.key === "1") setPreset("sine");
    else if (evt.key === "2") setPreset("square");
    else if (evt.key === "3") setPreset("saw");
    else if (evt.key === "4") setPreset("chord");
    else if (evt.key === "l" || evt.key === "L") el("toggle-log").click();
    else if (evt.key === "p" || evt.key === "P") el("toggle-phase").click();
  });

  window.__lab = {
    state,
    PRESETS,
    N,
    buildSignal,
    dft,
    magnitudes,
    phases,
    parseval,
    dominantBin,
    setPreset,
    updateReadouts,
    describe,
    draw,
  };

  setPreset("sine");
})();
