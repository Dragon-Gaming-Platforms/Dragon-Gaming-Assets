(() => {
  "use strict";

  // Split-step Fourier solution of the 1D Schrödinger equation (ħ = m = 1).
  // The kinetic operator is diagonal in momentum space, the potential is
  // diagonal in position space, and Strang splitting keeps the norm stable.

  const N = 1024;
  const L = 200;
  const DX = L / N;
  const DT = 0.008;
  const X0 = -34;
  const SIGMA = 7;
  const BARRIER_CENTRE = 6;

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");
  const W = canvas.width || 820;
  const H = canvas.height || 420;

  const state = {
    re: new Float64Array(N),
    im: new Float64Array(N),
    V: new Float64Array(N),
    kx: new Float64Array(N),
    mask: new Float64Array(N),
    cosTable: new Float64Array(N / 2),
    sinTable: new Float64Array(N / 2),
    energy: 0.5,
    height: 1,
    width: 3,
    speed: 10,
    running: true,
    time: 0,
    lost: 0,
    peak: 1,
    initialPeak: 1,
    left: 0,
    right: 0,
    transmitted: 0,
    reflected: 0,
    absorbedLeft: 0,
    absorbedRight: 0,
    frame: 0,
    lastTime: 0,
  };

  /* ------------------------------------------------------------------- FFT */

  const bitReverse = new Uint16Array(N);
  (function buildBitReverse() {
    const bits = Math.log2(N) | 0;
    for (let i = 0; i < N; i++) {
      let value = i;
      let reversed = 0;
      for (let b = 0; b < bits; b++) {
        reversed = (reversed << 1) | (value & 1);
        value >>= 1;
      }
      bitReverse[i] = reversed;
    }
  })();

  function fft(re, im, inverse) {
    for (let i = 0; i < N; i++) {
      const j = bitReverse[i];
      if (j > i) {
        let t = re[i];
        re[i] = re[j];
        re[j] = t;
        t = im[i];
        im[i] = im[j];
        im[j] = t;
      }
    }

    for (let len = 2; len <= N; len <<= 1) {
      const half = len >> 1;
      const angle = ((inverse ? 2 : -2) * Math.PI) / len;
      const wr = Math.cos(angle);
      const wi = Math.sin(angle);
      for (let start = 0; start < N; start += len) {
        let cr = 1;
        let ci = 0;
        for (let k = 0; k < half; k++) {
          const i0 = start + k;
          const i1 = i0 + half;
          const ur = re[i0];
          const ui = im[i0];
          const vr = re[i1] * cr - im[i1] * ci;
          const vi = re[i1] * ci + im[i1] * cr;
          re[i0] = ur + vr;
          im[i0] = ui + vi;
          re[i1] = ur - vr;
          im[i1] = ui - vi;
          const nextR = cr * wr - ci * wi;
          ci = cr * wi + ci * wr;
          cr = nextR;
        }
      }
    }

    if (inverse) {
      for (let i = 0; i < N; i++) {
        re[i] /= N;
        im[i] /= N;
      }
    }
  }

  /* --------------------------------------------------------------- physics */

  function rotate(index, phase) {
    const c = Math.cos(phase);
    const s = Math.sin(phase);
    const r = state.re[index];
    const i = state.im[index];
    state.re[index] = r * c - i * s;
    state.im[index] = r * s + i * c;
  }

  function buildGrid() {
    for (let j = 0; j < N; j++) {
      const k = j < N / 2 ? j : j - N;
      state.kx[j] = (2 * Math.PI * k) / L;

      // Absorbing sponge at both ends so the periodic FFT does not wrap.
      const x = -L / 2 + j * DX;
      const edge = Math.abs(x) - (L / 2 - 14);
      state.mask[j] = edge > 0 ? Math.exp(-3 * (edge / 14) * (edge / 14)) : 1;
    }
  }

  function buildPotential() {
    const left = BARRIER_CENTRE - state.width / 2;
    const right = BARRIER_CENTRE + state.width / 2;
    for (let j = 0; j < N; j++) {
      const x = -L / 2 + j * DX;
      state.V[j] = x >= left && x <= right ? state.height : 0;
    }
    state.barrierLeft = left;
    state.barrierRight = right;
  }

  function launch() {
    buildPotential();
    const k0 = Math.sqrt(2 * state.energy);
    let norm = 0;
    for (let j = 0; j < N; j++) {
      const x = -L / 2 + j * DX;
      const envelope = Math.exp(-((x - X0) * (x - X0)) / (2 * SIGMA * SIGMA));
      state.re[j] = envelope * Math.cos(k0 * x);
      state.im[j] = envelope * Math.sin(k0 * x);
      norm += envelope * envelope;
    }
    norm *= DX;
    const scale = 1 / Math.sqrt(norm);
    for (let j = 0; j < N; j++) {
      state.re[j] *= scale;
      state.im[j] *= scale;
    }

    state.time = 0;
    state.lost = 0;
    state.peak = 0;
    for (let j = 0; j < N; j++) {
      const p = state.re[j] * state.re[j] + state.im[j] * state.im[j];
      if (p > state.peak) state.peak = p;
    }
    state.initialPeak = state.peak;
    state.left = 0;
    state.right = 0;
    state.transmitted = 0;
    state.reflected = 0;
    state.absorbedLeft = 0;
    state.absorbedRight = 0;
    state.frame = 0;
    state.running = true;
    el("toggle").textContent = "Pause";
    measure();
    updateReadouts();
  }

  function stepOnce() {
    for (let j = 0; j < N; j++) {
      if (state.V[j] !== 0) rotate(j, -state.V[j] * DT * 0.5);
    }

    fft(state.re, state.im, false);
    for (let j = 0; j < N; j++) rotate(j, -0.5 * state.kx[j] * state.kx[j] * DT);
    fft(state.re, state.im, true);

    for (let j = 0; j < N; j++) {
      if (state.V[j] !== 0) rotate(j, -state.V[j] * DT * 0.5);
    }

    for (let j = 0; j < N; j++) {
      const m = state.mask[j];
      if (m < 1) {
        const density = state.re[j] * state.re[j] + state.im[j] * state.im[j];
        const lost = density * (1 - m * m) * DX;
        if (j < N / 2) state.absorbedLeft += lost;
        else state.absorbedRight += lost;
        state.lost += lost;
        state.re[j] *= m;
        state.im[j] *= m;
      }
    }

    state.time += DT;
  }

  function measure() {
    const left = state.barrierLeft;
    const right = state.barrierRight;
    let pLeft = 0;
    let pRight = 0;
    let pAll = 0;
    for (let j = 0; j < N; j++) {
      const p = (state.re[j] * state.re[j] + state.im[j] * state.im[j]) * DX;
      pAll += p;
      const x = -L / 2 + j * DX;
      if (x < left) pLeft += p;
      else if (x > right) pRight += p;
    }
    state.left = pLeft;
    state.right = pRight;
    state.total = pAll;
    // Everything that has left the barrier region, whether it is still in
    // flight or already soaked up by the absorbing edges.
    state.transmitted = Math.min(1, pRight + state.absorbedRight);
    state.reflected = Math.min(1, pLeft + state.absorbedLeft);
  }

  // Plane-wave transmission through a rectangular barrier.
  function barrierTransmission(E, V, a) {
    if (Math.abs(E - V) < 1e-6) return 1 / (1 + (V * V * a * a) / 4);
    if (E < V) {
      const kappa = Math.sqrt(2 * (V - E));
      const sinh = Math.sinh(kappa * a);
      return 1 / (1 + (V * V * sinh * sinh) / (4 * E * (V - E)));
    }
    const k2 = Math.sqrt(2 * (E - V));
    const sin = Math.sin(k2 * a);
    return 1 / (1 + (V * V * sin * sin) / (4 * E * (E - V)));
  }

  // The packet is not a plane wave: it carries a Gaussian spread in energy.
  // Average the barrier formula over that spread for an honest prediction.
  function analyticTransmission() {
    const V = state.height;
    const a = state.width;
    const k0 = Math.sqrt(2 * state.energy);
    const samples = 600;
    const top = 6;
    let weighted = 0;
    let total = 0;
    for (let i = 0; i < samples; i++) {
      const E = ((i + 0.5) * top) / samples;
      const k = Math.sqrt(2 * E);
      const weight = Math.exp(-SIGMA * SIGMA * (k - k0) * (k - k0)) / Math.max(k, 1e-6);
      weighted += weight * barrierTransmission(E, V, a);
      total += weight;
    }
    return total > 0 ? weighted / total : 0;
  }

  /* --------------------------------------------------------------- drawing */

  function draw() {
    ctx.fillStyle = "#03050b";
    ctx.fillRect(0, 0, W, H);

    const baseY = H * 0.78;
    const plotH = H * 0.6;

    // Ground line and tick labels.
    ctx.strokeStyle = "rgba(87, 216, 255, 0.18)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, baseY + 0.5);
    ctx.lineTo(W, baseY + 0.5);
    ctx.stroke();

    // Potential barrier.
    const bl = ((-L / 2 + state.barrierLeft) / L) * W;
    const br = ((-L / 2 + state.barrierRight) / L) * W;
    const bTop = baseY - (state.height / 2.2) * plotH;
    ctx.fillStyle = "rgba(242, 180, 92, 0.16)";
    ctx.fillRect(bl, bTop, Math.max(2, br - bl), baseY - bTop);
    ctx.strokeStyle = "rgba(242, 180, 92, 0.75)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bl + 0.5, bTop + 0.5, Math.max(1, br - bl - 1), baseY - bTop - 1);
    ctx.fillStyle = "#c9964a";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "center";
    ctx.fillText(`V₀ ${state.height.toFixed(2)}`, (bl + br) / 2, bTop - 8);

    // |ψ|² filled curve.
    let peakNow = 1e-9;
    for (let j = 0; j < N; j++) {
      const p = state.re[j] * state.re[j] + state.im[j] * state.im[j];
      if (p > peakNow) peakNow = p;
    }
    state.peak = Math.max(peakNow, state.initialPeak * 0.18);
    const scale = (plotH * 0.92) / state.peak;

    const gradient = ctx.createLinearGradient(0, baseY - plotH, 0, baseY);
    gradient.addColorStop(0, "rgba(87, 216, 255, 0.85)");
    gradient.addColorStop(1, "rgba(87, 216, 255, 0.08)");

    ctx.beginPath();
    ctx.moveTo(0, baseY);
    for (let j = 0; j < N; j++) {
      const x = (j / (N - 1)) * W;
      const p = (state.re[j] * state.re[j] + state.im[j] * state.im[j]) * scale;
      ctx.lineTo(x, baseY - Math.min(plotH, p));
    }
    ctx.lineTo(W, baseY);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    for (let j = 0; j < N; j++) {
      const x = (j / (N - 1)) * W;
      const p = (state.re[j] * state.re[j] + state.im[j] * state.im[j]) * scale;
      if (j === 0) ctx.moveTo(x, baseY - Math.min(plotH, p));
      else ctx.lineTo(x, baseY - Math.min(plotH, p));
    }
    ctx.strokeStyle = "#9be9ff";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Phase ribbon.
    for (let j = 0; j < N; j += 1) {
      const x = (j / (N - 1)) * W;
      const density = state.re[j] * state.re[j] + state.im[j] * state.im[j];
      if (density < state.peak * 0.004) continue;
      const phase = Math.atan2(state.im[j], state.re[j]);
      const hue = ((phase + Math.PI) / (Math.PI * 2)) * 360;
      ctx.fillStyle = `hsla(${hue.toFixed(0)}, 85%, 58%, 0.85)`;
      ctx.fillRect(x, baseY + 4, Math.max(1, W / N + 0.6), 6);
    }

    // Region labels.
    ctx.fillStyle = "rgba(135, 152, 181, 0.8)";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("reflected region", 14, baseY + 30);
    ctx.textAlign = "right";
    ctx.fillText("transmitted region", W - 14, baseY + 30);
    ctx.textAlign = "left";
    ctx.fillStyle = "#5f7392";
    ctx.fillText(`t = ${state.time.toFixed(1)}`, 14, 22);
    ctx.textAlign = "right";
    ctx.fillText(`E = ${state.energy.toFixed(2)}   E/V₀ = ${(state.energy / state.height).toFixed(2)}`, W - 14, 22);
    ctx.textAlign = "left";
  }

  /* -------------------------------------------------------------- readouts */

  function updateReadouts() {
    const t = state.transmitted * 100;
    const r = state.reflected * 100;
    const a = analyticTransmission() * 100;
    el("time-read").textContent = `t ${state.time.toFixed(1)}`;
    el("trans-read").textContent = `T ${t.toFixed(1)}%`;
    el("norm-read").textContent = `in field ${((state.total || 0) * 100).toFixed(0)}%`;
    el("t-read").textContent = `${t.toFixed(1)}%`;
    el("r-read").textContent = `${r.toFixed(1)}%`;
    el("analytic-read").textContent = `${a.toFixed(1)}%`;
    el("ratio-read").textContent = (state.energy / state.height).toFixed(2);
    el("energy-out").textContent = state.energy.toFixed(2);
    el("height-out").textContent = state.height.toFixed(2);
    el("width-out").textContent = state.width.toFixed(1);
    el("speed-out").textContent = String(state.speed);
  }

  function statusLine() {
    const t = state.transmitted * 100;
    const a = analyticTransmission() * 100;
    const ratio = state.energy / state.height;
    if (state.time < 12) {
      return `Packet approaching the wall at E/V₀ = ${ratio.toFixed(2)}. Packet-averaged prediction: ${a.toFixed(1)}% transmission.`;
    }
    if (ratio < 1) {
      const kappa = Math.sqrt(2 * (state.height - state.energy));
      return `Below the barrier: κa = ${(kappa * state.width).toFixed(2)}, so ${t.toFixed(1)}% has tunnelled through (packet-averaged prediction ${a.toFixed(1)}%).`;
    }
    return `Above the barrier: ${t.toFixed(1)}% passes, ${(state.reflected * 100).toFixed(1)}% reflects — the classical answer would be 100% through.`;
  }

  function setStatus(text) {
    el("status").textContent = text;
  }

  /* ------------------------------------------------------------------ loop */

  function frame(timestamp) {
    if (!state.lastTime) state.lastTime = timestamp;
    const dt = Math.max(0, Math.min(60, timestamp - state.lastTime));
    state.lastTime = timestamp;

    if (state.running) {
      const steps = state.speed;
      for (let i = 0; i < steps; i++) stepOnce();
      state.frame += 1;
      if (state.frame % 6 === 0) {
        measure();
        updateReadouts();
        setStatus(statusLine());

        // Once the packet has drained into the absorbing edges, stop cleanly.
        if (state.total < 0.05 && state.time > 10) {
          state.running = false;
          el("toggle").textContent = "Run";
          setStatus(
            `Run finished at t = ${state.time.toFixed(1)}: ${(state.transmitted * 100).toFixed(1)}% transmitted, ${(state.reflected * 100).toFixed(1)}% reflected. Reset relaunches the packet.`
          );
        }
      }
    }

    draw();
    requestAnimationFrame(frame);
  }

  /* ---------------------------------------------------------------- wiring */

  function syncFromInputs() {
    state.energy = Number(el("energy").value);
    state.height = Number(el("height").value);
    state.width = Number(el("width").value);
    state.speed = Number(el("speed").value);
    updateReadouts();
  }

  function relaunch(message) {
    launch();
    setStatus(message || `New packet: E = ${state.energy.toFixed(2)}, barrier ${state.height.toFixed(2)} × ${state.width.toFixed(1)}.`);
    draw();
  }

  el("toggle").addEventListener("click", () => {
    state.running = !state.running;
    el("toggle").textContent = state.running ? "Pause" : "Run";
    setStatus(state.running ? statusLine() : `Paused at t = ${state.time.toFixed(1)}. Press Run to continue.`);
  });

  el("reset").addEventListener("click", () => {
    syncFromInputs();
    relaunch("Packet relaunched from the left.");
  });

  ["energy", "height", "width"].forEach((id) => {
    el(id).addEventListener("input", () => {
      syncFromInputs();
      relaunch();
    });
  });

  el("speed").addEventListener("input", () => {
    state.speed = Number(el("speed").value);
    el("speed-out").textContent = String(state.speed);
  });

  el("preset").addEventListener("change", () => {
    const preset = el("preset").value;
    if (preset === "over") {
      el("energy").value = "1.60";
      el("height").value = "1.00";
      el("width").value = "3.0";
    } else if (preset === "thin") {
      el("energy").value = "0.30";
      el("height").value = "1.00";
      el("width").value = "0.8";
    } else if (preset === "broad") {
      el("energy").value = "0.90";
      el("height").value = "1.00";
      el("width") .value = "5.5";
    } else {
      el("energy").value = "0.50";
      el("height").value = "1.00";
      el("width").value = "3.0";
    }
    syncFromInputs();
    relaunch();
  });

  document.addEventListener("keydown", (event) => {
    const tag = (event.target && event.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (event.code === "Space") {
      event.preventDefault();
      el("toggle").click();
    } else if (event.key === "r" || event.key === "R") {
      el("reset").click();
    }
  });

  buildGrid();
  syncFromInputs();
  launch();
  setStatus(statusLine());
  draw();
  requestAnimationFrame(frame);
})();
