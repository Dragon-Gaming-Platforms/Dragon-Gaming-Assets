(() => {
  "use strict";

  // Driven mass-spring-damper: m*x'' + c*x' + k*x = F0*sin(w*t), integrated
  // with semi-implicit Euler at 480 Hz substeps. Readouts come from the
  // closed-form steady state: X = F0 / sqrt((k - m w^2)^2 + (c w)^2),
  // phase lag phi = atan2(c w, k - m w^2).

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");

  const W = canvas.width || 880;
  const H = canvas.height || 660;

  const STAGE = { x: 26, y: 50, w: 828, h: 280 };
  const TRACE = { x: 26, y: 360, w: 828, h: 270 };

  const PRESETS = {
    undamped: { label: "Undamped", m: 1, k: 40, c: 0, freq: 0.6, amp: 5 },
    under: { label: "Underdamped", m: 1, k: 40, c: 1, freq: 1, amp: 5 },
    critical: { label: "Critical", m: 1, k: 40, c: 12.6, freq: 1, amp: 5 },
    over: { label: "Overdamped", m: 1, k: 40, c: 20, freq: 1, amp: 5 },
    resonant: { label: "Resonant", m: 1, k: 40, c: 0.5, freq: 1.01, amp: 5 },
  };

  const state = {
    m: 1,
    k: 40,
    c: 12.6,
    freq: 1,
    amp: 5,
    playing: true,
    preset: "critical",
    x: 0,
    v: 0,
    t: 0,
    hist: [], // {t, x, f}
    maxSeen: 0.5,
  };

  /* -------------------------------------------------------------- spring maths */

  function naturalFreq(m, k) {
    return Math.sqrt(k / m); // rad/s
  }

  function dampingRatio(m, k, c) {
    return c / (2 * Math.sqrt(k * m));
  }

  function steadyAmplitude(m, k, c, F0, w) {
    const denom = Math.sqrt(Math.pow(k - m * w * w, 2) + Math.pow(c * w, 2));
    return denom === 0 ? Infinity : F0 / denom;
  }

  function phaseLag(m, k, c, w) {
    return Math.atan2(c * w, k - m * w * w);
  }

  function energy(m, k, x, v) {
    return 0.5 * m * v * v + 0.5 * k * x * x;
  }

  function step(dt) {
    // semi-implicit Euler with substeps for stability
    const sub = Math.max(1, Math.ceil(dt / (1 / 480)));
    const h = dt / sub;
    const w = 2 * Math.PI * state.freq;
    for (let s = 0; s < sub; s++) {
      const F = state.amp * Math.sin(w * state.t);
      const a = (F - state.c * state.v - state.k * state.x) / state.m;
      state.v += a * h;
      state.x += state.v * h;
      state.t += h;
    }
    state.maxSeen = Math.max(state.maxSeen, Math.abs(state.x));
  }

  /* ------------------------------------------------------------------- drawing */

  function drawSpring() {
    const wallX = STAGE.x + 40;
    const restLen = 320;
    const pxPerM = 70;
    const massW = 64;
    const massH = 90;
    const midY = STAGE.y + STAGE.h / 2;
    const massX = wallX + restLen + state.x * pxPerM;

    // wall
    ctx.fillStyle = "#3a332a";
    ctx.fillRect(STAGE.x + 20, STAGE.y + 20, 20, STAGE.h - 40);
    ctx.fillStyle = "#8296a9";
    ctx.font = "10px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("wall", STAGE.x + 20, STAGE.y + STAGE.h - 8);

    // spring coil (zigzag)
    ctx.strokeStyle = "#ffb45f";
    ctx.lineWidth = 2;
    ctx.beginPath();
    const coils = 10;
    const top = midY - 26;
    const bot = midY + 26;
    ctx.moveTo(wallX + 20, midY);
    for (let i = 1; i <= coils; i++) {
      const px = wallX + 20 + ((massX - (wallX + 20)) * i) / coils;
      ctx.lineTo(px, i % 2 === 0 ? midY : top);
    }
    ctx.lineTo(massX, midY);
    ctx.stroke();

    // mass block
    ctx.fillStyle = "#ffb45f";
    ctx.fillRect(massX, midY - massH / 2, massW, massH);
    ctx.fillStyle = "#0a0805";
    ctx.font = "bold 12px ui-monospace, Menlo, monospace";
    ctx.textAlign = "center";
    ctx.fillText("m", massX + massW / 2, midY + 4);
    ctx.fillStyle = "#8296a9";
    ctx.textAlign = "left";
    ctx.fillText("x = " + state.x.toFixed(2) + " m", massX + massW + 10, midY + 4);

    // equilibrium marker
    ctx.strokeStyle = "rgba(130,150,169,0.4)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(wallX + 20 + restLen, STAGE.y + 10);
    ctx.lineTo(wallX + 20 + restLen, STAGE.y + STAGE.h - 10);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawTrace() {
    ctx.fillStyle = "#070a08";
    ctx.fillRect(TRACE.x, TRACE.y, TRACE.w, TRACE.h);
    const midY = TRACE.y + TRACE.h / 2;
    const scale = (TRACE.h / 2 - 14) / Math.max(0.5, state.maxSeen * 1.15);

    // zero line
    ctx.strokeStyle = "rgba(130,150,169,0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(TRACE.x, midY);
    ctx.lineTo(TRACE.x + TRACE.w, midY);
    ctx.stroke();

    if (state.hist.length < 2) return;
    const t0 = state.hist[0].t;
    const t1 = state.hist[state.hist.length - 1].t;
    const span = Math.max(0.1, t1 - t0);
    const X = (t) => TRACE.x + ((t - t0) / span) * TRACE.w;

    // drive force (faint)
    ctx.strokeStyle = "rgba(124,196,255,0.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    state.hist.forEach((p, i) => {
      const y = midY - (p.f / Math.max(1, state.amp)) * (TRACE.h / 2 - 14) * 0.6;
      if (i === 0) ctx.moveTo(X(p.t), y);
      else ctx.lineTo(X(p.t), y);
    });
    ctx.stroke();

    // displacement
    ctx.strokeStyle = "#6ff0c8";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    state.hist.forEach((p, i) => {
      const y = midY - p.x * scale;
      if (i === 0) ctx.moveTo(X(p.t), y);
      else ctx.lineTo(X(p.t), y);
    });
    ctx.stroke();

    ctx.fillStyle = "#8296a9";
    ctx.font = "10px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("displacement (teal) + drive force (blue), last " + span.toFixed(1) + " s", TRACE.x + 6, TRACE.y + 14);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#0a0805";
    ctx.fillRect(STAGE.x, STAGE.y, STAGE.w, STAGE.h);
    drawSpring();
    drawTrace();
  }

  /* ------------------------------------------------------------------ readouts */

  function updateReadouts() {
    const wn = naturalFreq(state.m, state.k);
    const fn = wn / (2 * Math.PI);
    const zeta = dampingRatio(state.m, state.k, state.c);
    const w = 2 * Math.PI * state.freq;
    const X = steadyAmplitude(state.m, state.k, state.c, state.amp, w);
    const phi = phaseLag(state.m, state.k, state.c, w);

    el("m-out").textContent = state.m.toFixed(1) + " kg";
    el("k-out").textContent = state.k + " N/m";
    el("c-out").textContent = state.c.toFixed(1) + " N·s/m";
    el("freq-out").textContent = state.freq.toFixed(2) + " Hz";
    el("amp-out").textContent = state.amp.toFixed(1) + " N";

    el("wn-hud").textContent = "ωₙ " + wn.toFixed(2) + " rad/s";
    el("zeta-hud").textContent = "ζ " + zeta.toFixed(2);
    el("amp-hud").textContent = "amp " + (isFinite(X) ? X.toFixed(2) + " m" : "∞");

    el("wn-read").textContent = wn.toFixed(2) + " rad/s";
    el("fn-read").textContent = fn.toFixed(2) + " Hz";
    el("zeta-read").textContent = zeta.toFixed(2);
    el("steady-read").textContent = isFinite(X) ? X.toFixed(2) + " m" : "∞";
    el("phase-read").textContent = ((phi * 180) / Math.PI).toFixed(0) + "°";
    el("x-read").textContent = state.x.toFixed(2) + " m";
    el("v-read").textContent = state.v.toFixed(2) + " m/s";
    el("energy-read").textContent = energy(state.m, state.k, state.x, state.v).toFixed(1) + " J";
  }

  function describe() {
    const wn = naturalFreq(state.m, state.k);
    const fn = wn / (2 * Math.PI);
    const zeta = dampingRatio(state.m, state.k, state.c);
    const ratio = state.freq / fn;
    let regime;
    if (state.c === 0) regime = "undamped";
    else if (zeta < 0.95) regime = "underdamped (ζ=" + zeta.toFixed(2) + ")";
    else if (zeta < 1.05) regime = "critically damped (ζ≈1)";
    else regime = "overdamped (ζ=" + zeta.toFixed(2) + ")";
    let msg;
    if (Math.abs(ratio - 1) < 0.05 && state.c > 0) {
      const X = steadyAmplitude(state.m, state.k, state.c, state.amp, 2 * Math.PI * state.freq);
      msg = "Resonance: drive " + state.freq.toFixed(2) + " Hz ≈ natural " + fn.toFixed(2) + " Hz. Steady amplitude " + X.toFixed(2) + " m — damping is the only thing capping it. System is " + regime + ".";
    } else if (state.c === 0) {
      msg = "Undamped: energy never leaves, so the free oscillation persists forever and the driven response beats against it. Natural frequency " + fn.toFixed(2) + " Hz.";
    } else {
      msg = "System is " + regime + ". Drive is at " + ratio.toFixed(2) + "× the natural frequency; steady amplitude " + steadyAmplitude(state.m, state.k, state.c, state.amp, 2 * Math.PI * state.freq).toFixed(2) + " m with " + ((phaseLag(state.m, state.k, state.c, 2 * Math.PI * state.freq) * 180) / Math.PI).toFixed(0) + "° phase lag.";
    }
    el("status").textContent = msg;
  }

  /* -------------------------------------------------------------------- wiring */

  function setPreset(name) {
    const p = PRESETS[name];
    if (!p) return;
    state.preset = name;
    state.m = p.m;
    state.k = p.k;
    state.c = p.c;
    state.freq = p.freq;
    state.amp = p.amp;
    state.x = 0;
    state.v = 0;
    state.t = 0;
    state.hist = [];
    state.maxSeen = 0.5;
    el("m").value = String(p.m);
    el("k").value = String(p.k);
    el("c").value = String(p.c);
    el("freq").value = String(p.freq);
    el("amp").value = String(p.amp);
    ["undamped", "under", "critical", "over", "resonant"].forEach((kk) => {
      el("preset-" + kk).classList.toggle("active", kk === name);
    });
    updateReadouts();
    describe();
    draw();
  }

  function clearPresets() {
    state.preset = "";
    ["undamped", "under", "critical", "over", "resonant"].forEach((kk) => el("preset-" + kk).classList.remove("active"));
  }

  el("m").addEventListener("input", (evt) => {
    state.m = Math.max(0.5, Math.min(5, Number(evt.target.value) || 1));
    clearPresets();
    updateReadouts();
    describe();
    draw();
  });
  el("k").addEventListener("input", (evt) => {
    state.k = Math.max(10, Math.min(200, Number(evt.target.value) || 40));
    clearPresets();
    updateReadouts();
    describe();
    draw();
  });
  el("c").addEventListener("input", (evt) => {
    state.c = Math.max(0, Math.min(20, Number(evt.target.value) || 0));
    clearPresets();
    updateReadouts();
    describe();
    draw();
  });
  el("freq").addEventListener("input", (evt) => {
    state.freq = Math.max(0.2, Math.min(5, Number(evt.target.value) || 1));
    clearPresets();
    updateReadouts();
    describe();
    draw();
  });
  el("amp").addEventListener("input", (evt) => {
    state.amp = Math.max(0, Math.min(20, Number(evt.target.value) || 0));
    clearPresets();
    updateReadouts();
    describe();
    draw();
  });

  el("preset-undamped").addEventListener("click", () => setPreset("undamped"));
  el("preset-under").addEventListener("click", () => setPreset("under"));
  el("preset-critical").addEventListener("click", () => setPreset("critical"));
  el("preset-over").addEventListener("click", () => setPreset("over"));
  el("preset-resonant").addEventListener("click", () => setPreset("resonant"));

  el("toggle-play").addEventListener("click", () => {
    state.playing = !state.playing;
    el("toggle-play").textContent = state.playing ? "Pause" : "Play";
    el("toggle-play").classList.toggle("active", state.playing);
  });
  el("btn-kick").addEventListener("click", () => {
    state.v += 3;
  });
  el("btn-reset").addEventListener("click", () => {
    state.x = 0;
    state.v = 0;
    state.t = 0;
    state.hist = [];
    state.maxSeen = 0.5;
    updateReadouts();
    describe();
    draw();
  });

  document.addEventListener("keydown", (evt) => {
    if (evt.key === "1") setPreset("undamped");
    else if (evt.key === "2") setPreset("under");
    else if (evt.key === "3") setPreset("critical");
    else if (evt.key === "4") setPreset("over");
    else if (evt.key === "5") setPreset("resonant");
    else if (evt.key === " ") {
      evt.preventDefault();
      el("toggle-play").click();
    } else if (evt.key === "k" || evt.key === "K") el("btn-kick").click();
    else if (evt.key === "r" || evt.key === "R") el("btn-reset").click();
  });

  let last = 0;
  function frame(nowMs) {
    const dt = last ? (nowMs - last) / 1000 : 0.016;
    last = nowMs;
    if (state.playing) {
      step(Math.min(dt, 0.05));
      const w = 2 * Math.PI * state.freq;
      state.hist.push({ t: state.t, x: state.x, f: state.amp * Math.sin(w * state.t) });
      // keep ~10 s of history
      while (state.hist.length > 2 && state.hist[0].t < state.t - 10) state.hist.shift();
      updateReadouts();
      draw();
    }
    requestAnimationFrame(frame);
  }

  window.__lab = {
    state,
    PRESETS,
    naturalFreq,
    dampingRatio,
    steadyAmplitude,
    phaseLag,
    energy,
    step,
    setPreset,
    updateReadouts,
    describe,
    draw,
  };

  updateReadouts();
  describe();
  draw();
  requestAnimationFrame(frame);
})();
