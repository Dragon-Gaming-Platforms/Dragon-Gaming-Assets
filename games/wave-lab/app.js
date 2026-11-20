(() => {
  "use strict";

  // Vibrating string with fixed ends, solved by modal superposition:
  //   y(x,t) = Σ_n A_n sin(nπx/L) cos(ω_n t) e^(-γt),  ω_n = nπc/L,  c = √(T/μ)
  // A pluck at x0 with a triangular initial shape gives
  //   A_n = (2h/(n²π²x0(1-x0/L))) · sin(nπx0/L)   (up to constants)
  // so modes with a node at the pluck point vanish.

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");

  const W = canvas.width || 880;
  const H = canvas.height || 660;

  const STAGE = { x: 26, y: 50, w: 828, h: 560 };
  const STRING = { x: STAGE.x + 40, y: STAGE.y + STAGE.h / 2, len: STAGE.w - 80 };
  const L = 0.65; // string length in metres
  const N_MODES = 12;
  const AMP = 0.06; // pluck amplitude in metres

  const PRESETS = {
    guitar: { label: "Guitar", tension: 100, mu: 0.01, pluck: 0.5, damp: 0.1 },
    violin: { label: "Violin", tension: 60, mu: 0.003, pluck: 0.4, damp: 0.15 },
    bass: { label: "Bass", tension: 150, mu: 0.04, pluck: 0.6, damp: 0.08 },
    harp: { label: "Harp", tension: 200, mu: 0.006, pluck: 0.33, damp: 0.05 },
  };

  const state = {
    tension: 100,
    mu: 0.01,
    pluck: 0.5,
    damp: 0.1,
    preset: "guitar",
    showModes: true,
    t: 0,
    playing: false,
    coeffs: [],
  };

  /* --------------------------------------------------------------- wave maths */

  function waveSpeed(T, mu) {
    return Math.sqrt(T / mu);
  }

  function harmonicFreq(n, c, len) {
    return (n * c) / (2 * len);
  }

  function pluckCoeffs(x0frac, nModes) {
    // triangular pluck at x0 = x0frac*L, height h:
    // A_n = (2h / (n^2 * pi^2 * x0frac * (1-x0frac))) * sin(n*pi*x0frac)
    const coeffs = [];
    const denom = Math.PI * Math.PI * x0frac * (1 - x0frac);
    for (let n = 1; n <= nModes; n++) {
      coeffs.push(((2 * AMP) / (n * n * denom)) * Math.sin(n * Math.PI * x0frac));
    }
    return coeffs;
  }

  function displacement(xfrac, t, coeffs, c, len, gamma) {
    let y = 0;
    const decay = Math.exp(-gamma * t);
    for (let n = 1; n <= coeffs.length; n++) {
      const w = (n * Math.PI * c) / len;
      y += coeffs[n - 1] * Math.sin(n * Math.PI * xfrac) * Math.cos(w * t) * decay;
    }
    return y;
  }

  function strongestMode(coeffs) {
    let best = 1;
    let bestA = -1;
    coeffs.forEach((a, i) => {
      if (Math.abs(a) > bestA) { bestA = Math.abs(a); best = i + 1; }
    });
    return best;
  }

  /* ------------------------------------------------------------------- drawing */

  function toPx(xfrac, y) {
    return [STRING.x + xfrac * STRING.len, STRING.y - y * 4000];
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#070907";
    ctx.fillRect(STAGE.x, STAGE.y, STAGE.w, STAGE.h);

    const c = waveSpeed(state.tension, state.mu);

    // mode shapes (first 3)
    if (state.showModes) {
      ctx.strokeStyle = "rgba(124,196,255,0.35)";
      ctx.lineWidth = 1;
      for (let n = 1; n <= 3; n++) {
        ctx.beginPath();
        for (let i = 0; i <= 100; i++) {
          const xf = i / 100;
          const y = Math.sin(n * Math.PI * xf) * 0.03;
          const [px, py] = toPx(xf, y);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
    }

    // string
    ctx.strokeStyle = "#9be15d";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i <= 200; i++) {
      const xf = i / 200;
      const y = state.playing ? displacement(xf, state.t, state.coeffs, c, L, state.damp) : 0;
      const [px, py] = toPx(xf, y);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // end supports
    ctx.fillStyle = "#3a332a";
    ctx.fillRect(STRING.x - 6, STRING.y - 20, 6, 40);
    ctx.fillRect(STRING.x + STRING.len, STRING.y - 20, 6, 40);

    // pluck point marker
    const [ppx] = toPx(state.pluck, 0);
    ctx.strokeStyle = "#ffb45f";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ppx, STRING.y - 30);
    ctx.lineTo(ppx, STRING.y + 30);
    ctx.stroke();
    ctx.fillStyle = "#ffb45f";
    ctx.font = "10px ui-monospace, Menlo, monospace";
    ctx.textAlign = "center";
    ctx.fillText("pluck " + state.pluck.toFixed(2) + "L", ppx, STRING.y + 48);

    ctx.fillStyle = "#93a48f";
    ctx.textAlign = "left";
    ctx.fillText(
      "c=" + c.toFixed(1) + " m/s  f₁=" + harmonicFreq(1, c, L).toFixed(1) + " Hz  t=" + state.t.toFixed(2) + " s",
      STAGE.x + 8,
      STAGE.y + 16
    );
  }

  /* ------------------------------------------------------------------ readouts */

  function updateReadouts() {
    const c = waveSpeed(state.tension, state.mu);
    const f1 = harmonicFreq(1, c, L);
    const coeffs = pluckCoeffs(state.pluck, N_MODES);

    el("tension-out").textContent = state.tension + " N";
    el("mu-out").textContent = state.mu.toFixed(3) + " kg/m";
    el("pluck-out").textContent = state.pluck.toFixed(2) + " L";
    el("damp-out").textContent = state.damp.toFixed(2) + " /s";

    el("f1-hud").textContent = "f₁ " + f1.toFixed(1) + " Hz";
    el("c-hud").textContent = "speed " + c.toFixed(1) + " m/s";
    el("modes-hud").textContent = "modes " + N_MODES;

    el("c-read").textContent = c.toFixed(1) + " m/s";
    el("f1-read").textContent = f1.toFixed(1) + " Hz";
    el("f2-read").textContent = harmonicFreq(2, c, L).toFixed(1) + " Hz";
    el("f3-read").textContent = harmonicFreq(3, c, L).toFixed(1) + " Hz";
    el("t1-read").textContent = (1 / f1).toFixed(3) + " s";
    el("strong-read").textContent = "n=" + strongestMode(coeffs);
  }

  function describe() {
    const coeffs = pluckCoeffs(state.pluck, N_MODES);
    const c = waveSpeed(state.tension, state.mu);
    const f1 = harmonicFreq(1, c, L);
    const strong = strongestMode(coeffs);
    let msg;
    if (Math.abs(state.pluck - 0.5) < 0.02) {
      msg = "Plucked at the centre: every even harmonic has a node there, so only odd harmonics (1, 3, 5…) sound. The tone is hollow — clarinet-like. f₁ = " + f1.toFixed(1) + " Hz.";
    } else if (Math.abs(state.pluck - 1 / 3) < 0.02 || Math.abs(state.pluck - 2 / 3) < 0.02) {
      msg = "Plucked at L/3: every third harmonic vanishes (3, 6, 9…). The missing harmonics are exactly the modes with a node at the pluck point. f₁ = " + f1.toFixed(1) + " Hz.";
    } else {
      msg = "Strongest mode is n=" + strong + " (" + harmonicFreq(strong, c, L).toFixed(1) + " Hz). The pluck position weights the harmonics — where you pluck decides the tone. f₁ = " + f1.toFixed(1) + " Hz.";
    }
    el("status").textContent = msg;
  }

  /* -------------------------------------------------------------------- wiring */

  function setPreset(name) {
    const p = PRESETS[name];
    if (!p) return;
    state.preset = name;
    state.tension = p.tension;
    state.mu = p.mu;
    state.pluck = p.pluck;
    state.damp = p.damp;
    el("tension").value = String(p.tension);
    el("mu").value = String(p.mu);
    el("pluck").value = String(p.pluck);
    el("damp").value = String(p.damp);
    ["guitar", "violin", "bass", "harp"].forEach((kk) => {
      el("preset-" + kk).classList.toggle("active", kk === name);
    });
    pluck();
  }

  function clearPresets() {
    state.preset = "";
    ["guitar", "violin", "bass", "harp"].forEach((kk) => el("preset-" + kk).classList.remove("active"));
  }

  function pluck() {
    state.coeffs = pluckCoeffs(state.pluck, N_MODES);
    state.t = 0;
    state.playing = true;
    updateReadouts();
    describe();
    draw();
  }

  el("tension").addEventListener("input", (evt) => {
    state.tension = Math.max(20, Math.min(400, Number(evt.target.value) || 100));
    clearPresets();
    updateReadouts();
    describe();
    draw();
  });
  el("mu").addEventListener("input", (evt) => {
    state.mu = Math.max(0.002, Math.min(0.05, Number(evt.target.value) || 0.01));
    clearPresets();
    updateReadouts();
    describe();
    draw();
  });
  el("pluck").addEventListener("input", (evt) => {
    state.pluck = Math.max(0.1, Math.min(0.9, Number(evt.target.value) || 0.5));
    clearPresets();
    updateReadouts();
    describe();
    draw();
  });
  el("damp").addEventListener("input", (evt) => {
    state.damp = Math.max(0, Math.min(1, Number(evt.target.value) || 0));
    clearPresets();
    updateReadouts();
    describe();
    draw();
  });

  el("preset-guitar").addEventListener("click", () => setPreset("guitar"));
  el("preset-violin").addEventListener("click", () => setPreset("violin"));
  el("preset-bass").addEventListener("click", () => setPreset("bass"));
  el("preset-harp").addEventListener("click", () => setPreset("harp"));

  el("btn-pluck").addEventListener("click", pluck);
  el("toggle-modes").addEventListener("click", () => {
    state.showModes = !state.showModes;
    el("toggle-modes").classList.toggle("active", state.showModes);
    draw();
  });

  function point(evt) {
    const r = canvas.getBoundingClientRect();
    return [evt.clientX - r.left, evt.clientY - r.top];
  }

  canvas.addEventListener("pointerdown", (evt) => {
    const [x] = point(evt);
    const xf = (x - STRING.x) / STRING.len;
    if (xf > 0.05 && xf < 0.95) {
      state.pluck = Math.max(0.1, Math.min(0.9, xf));
      el("pluck").value = String(state.pluck);
      clearPresets();
      updateReadouts();
      describe();
      draw();
    }
  });

  document.addEventListener("keydown", (evt) => {
    if (evt.key === "1") setPreset("guitar");
    else if (evt.key === "2") setPreset("violin");
    else if (evt.key === "3") setPreset("bass");
    else if (evt.key === "4") setPreset("harp");
    else if (evt.key === " ") {
      evt.preventDefault();
      pluck();
    }
  });

  let last = 0;
  function frame(nowMs) {
    const dt = last ? (nowMs - last) / 1000 : 0.016;
    last = nowMs;
    if (state.playing) {
      state.t += dt;
      if (state.t > 30) state.playing = false;
      draw();
    }
    requestAnimationFrame(frame);
  }

  window.__lab = {
    state,
    PRESETS,
    L,
    N_MODES,
    waveSpeed,
    harmonicFreq,
    pluckCoeffs,
    displacement,
    strongestMode,
    setPreset,
    pluck,
    updateReadouts,
    describe,
    draw,
  };

  pluck();
  requestAnimationFrame(frame);
})();
