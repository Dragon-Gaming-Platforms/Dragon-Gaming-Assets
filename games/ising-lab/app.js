(() => {
  "use strict";

  const CRITICAL = 2 / Math.log(1 + Math.sqrt(2)); // ≈ 2.2692
  const SPIN_UP = [246, 173, 85];
  const SPIN_DOWN = [79, 127, 240];

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");
  const W = canvas.width || 820;
  const H = canvas.height || 440;

  const state = {
    L: 96,
    spins: null,
    T: CRITICAL,
    sweeps: 0,
    energy: 0,
    magnet: 0,
    accepted: 0,
    proposals: 1,
    running: false,
    mode: "fixed",
    history: [],
    sumM: 0,
    sumM2: 0,
    samples: 0,
    lastTime: 0,
    frameAccumulator: 0,
    off: null,
    offCtx: null,
    image: null,
  };

  /* -------------------------------------------------------------- lattice */

  function makeLattice(L) {
    state.L = L;
    state.spins = new Int8Array(L * L);
    // Start mostly ordered with a dusting of down spins: cooling keeps it
    // ordered, heating melts it, and near Tc the droplets grow into domains.
    for (let i = 0; i < state.spins.length; i++) {
      state.spins[i] = Math.random() < 0.88 ? 1 : -1;
    }
    state.sweeps = 0;
    state.history = [];
    state.sumM = 0;
    state.sumM2 = 0;
    state.samples = 0;
    state.accepted = 0;
    state.proposals = 1;
    state.energy = totalEnergy();
    state.magnet = magnetisation();
    state.off = null;
    state.offCtx = null;
    state.image = null;
    try {
      const off = document.createElement("canvas");
      off.width = L;
      off.height = L;
      const octx = typeof off.getContext === "function" ? off.getContext("2d") : null;
      if (octx && typeof octx.createImageData === "function") {
        state.off = off;
        state.offCtx = octx;
        state.image = octx.createImageData(L, L);
      }
    } catch (error) {
      state.off = null;
      state.offCtx = null;
    }
  }

  function neighbourSum(index) {
    const L = state.L;
    const spins = state.spins;
    const x = index % L;
    const y = (index - x) / L;
    const left = x === 0 ? index + L - 1 : index - 1;
    const right = x === L - 1 ? index - L + 1 : index + 1;
    const up = y === 0 ? index + (L - 1) * L : index - L;
    const down = y === L - 1 ? index - (L - 1) * L : index + L;
    return spins[left] + spins[right] + spins[up] + spins[down];
  }

  function totalEnergy() {
    const L = state.L;
    const spins = state.spins;
    let sum = 0;
    for (let y = 0; y < L; y++) {
      for (let x = 0; x < L; x++) {
        const i = y * L + x;
        const right = x === L - 1 ? i - L + 1 : i + 1;
        const down = y === L - 1 ? i - (L - 1) * L : i + L;
        sum += spins[i] * (spins[right] + spins[down]);
      }
    }
    return -sum;
  }

  function magnetisation() {
    const spins = state.spins;
    let sum = 0;
    for (let i = 0; i < spins.length; i++) sum += spins[i];
    return sum / spins.length;
  }

  /* --------------------------------------------------------------- sweeps */

  function sweep() {
    const spins = state.spins;
    const N = spins.length;
    const T = Math.max(0.05, state.T);
    let accepted = 0;

    for (let n = 0; n < N; n++) {
      const index = (Math.random() * N) | 0;
      const spin = spins[index];
      const bonds = neighbourSum(index);
      const delta = 2 * spin * bonds;
      if (delta <= 0 || Math.random() < Math.exp(-delta / T)) {
        spins[index] = -spin;
        accepted++;
      }
    }

    state.proposals = N;
    state.accepted = accepted;
    state.sweeps += 1;
    state.energy = totalEnergy();
    state.magnet = magnetisation();
    state.history.push(Math.abs(state.magnet));
    if (state.history.length > 600) state.history.shift();

    if (state.sweeps > 4) {
      state.sumM += state.magnet;
      state.sumM2 += state.magnet * state.magnet;
      state.samples += 1;
    }

    if (state.mode === "sweepUp") {
      state.T = Math.min(3.9, state.T + 0.02);
      el("temperature").value = state.T.toFixed(2);
      if (state.T >= 3.9) {
        state.mode = "fixed";
        state.running = false;
        el("toggle").textContent = "Run";
        setStatus(`Sweep finished at T ${state.T.toFixed(2)} — the lattice has lost its memory.`);
      }
    }

    updateReadouts();
  }

  /* -------------------------------------------------------------- readouts */

  function susceptibility() {
    if (state.samples < 2) return 0;
    const mean = state.sumM / state.samples;
    const variance = Math.max(0, state.sumM2 / state.samples - mean * mean);
    return (state.spins.length / Math.max(0.05, state.T)) * variance;
  }

  function updateReadouts() {
    el("temp-read").textContent = `T ${state.T.toFixed(2)}`;
    el("temp-out").textContent = state.T.toFixed(2);
    el("sweep-read").textContent = `${state.sweeps} sweep${state.sweeps === 1 ? "" : "s"}`;
    el("magnet-read").textContent = `|M| ${Math.abs(state.magnet).toFixed(3)}`;
    el("energy-read").textContent = (state.energy / state.spins.length).toFixed(3);
    el("chi-read").textContent = formatChi(susceptibility());
    el("accept-read").textContent = `${Math.round((100 * state.accepted) / state.proposals)}%`;
    el("count-read").textContent = state.spins.length.toLocaleString("en-US");
  }

  function formatChi(value) {
    if (!isFinite(value)) return "—";
    if (value >= 1000) return value.toExponential(1);
    return value.toFixed(2);
  }

  function setStatus(text) {
    el("status").textContent = text;
  }

  function describe() {
    const T = state.T;
    if (T < 1.5) return "Deep in the ordered phase — one domain is swallowing the rest.";
    if (T < 2.1) return "Below criticality: domains stay large and flip slowly.";
    if (T < 2.45) return "Near the critical point — fluctuations appear at every length scale.";
    if (T < 3.0) return "Above criticality: order decays and patches flip freely.";
    return "Hot and noisy: each spin barely notices its neighbours.";
  }

  function refreshStatus() {
    const text = `T ${state.T.toFixed(2)}${Math.abs(state.T - CRITICAL) < 0.02 ? " (critical)" : ""} · sweep ${state.sweeps} · |M| ${Math.abs(state.magnet).toFixed(3)}. ${describe()}`;
    setStatus(text);
  }

  /* --------------------------------------------------------------- drawing */

  function spinColour(spin, index) {
    const jitter = ((index * 2654435761) % 1000) / 1000 - 0.5;
    const base = spin > 0 ? SPIN_UP : SPIN_DOWN;
    const lift = 1 + jitter * 0.16;
    return [
      Math.max(0, Math.min(255, Math.round(base[0] * lift))),
      Math.max(0, Math.min(255, Math.round(base[1] * lift))),
      Math.max(0, Math.min(255, Math.round(base[2] * lift))),
    ];
  }

  function drawLattice(size, x0, y0) {
    const L = state.L;
    const spins = state.spins;
    if (state.offCtx && state.image) {
      const data = state.image.data;
      for (let i = 0; i < spins.length; i++) {
        const [r, g, b] = spinColour(spins[i], i);
        const p = i * 4;
        data[p] = r;
        data[p + 1] = g;
        data[p + 2] = b;
        data[p + 3] = 255;
      }
      state.offCtx.putImageData(state.image, 0, 0);
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(state.off, x0, y0, size, size);
      ctx.restore();
    } else {
      const cell = size / L;
      for (let y = 0; y < L; y++) {
        for (let x = 0; x < L; x++) {
          const i = y * L + x;
          const [r, g, b] = spinColour(spins[i], i);
          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
          ctx.fillRect(x0 + x * cell, y0 + y * cell, cell + 0.5, cell + 0.5);
        }
      }
    }

    ctx.strokeStyle = "rgba(90, 209, 199, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x0 - 1, y0 - 1, size + 2, size + 2);

    ctx.fillStyle = "#55708a";
    ctx.font = "10.5px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(`T = ${state.T.toFixed(2)}`, x0, y0 - 10);
    ctx.textAlign = "right";
    ctx.fillText(`${L} × ${L}`, x0 + size, y0 - 10);
    ctx.textAlign = "left";
  }

  function drawLegend(x0, y0) {
    const items = [
      { colour: "rgb(246, 173, 85)", label: "spin up (+1)" },
      { colour: "rgb(79, 127, 240)", label: "spin down (−1)" },
    ];
    ctx.font = "11px ui-monospace, Menlo, monospace";
    items.forEach((item, index) => {
      const y = y0 + index * 20;
      ctx.fillStyle = item.colour;
      ctx.fillRect(x0, y - 9, 12, 12);
      ctx.fillStyle = "#7d94a9";
      ctx.textAlign = "left";
      ctx.fillText(item.label, x0 + 20, y + 1);
    });
  }

  function drawHistory(x0, y0, width, height) {
    ctx.fillStyle = "#080d13";
    ctx.fillRect(x0, y0, width, height);
    ctx.strokeStyle = "#1b2836";
    ctx.lineWidth = 1;
    ctx.strokeRect(x0 + 0.5, y0 + 0.5, width, height);

    for (let i = 1; i < 4; i++) {
      const y = y0 + (height * i) / 4;
      ctx.beginPath();
      ctx.moveTo(x0, y);
      ctx.lineTo(x0 + width, y);
      ctx.stroke();
    }

    const values = state.history.slice(-Math.floor(width / 2));
    ctx.beginPath();
    values.forEach((value, index) => {
      const x = x0 + (index / Math.max(1, values.length - 1)) * width;
      const y = y0 + height - value * height;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = "#5ad1c7";
    ctx.lineWidth = 2;
    ctx.stroke();

    if (values.length > 1) {
      const gradient = ctx.createLinearGradient(0, y0, 0, y0 + height);
      gradient.addColorStop(0, "rgba(90, 209, 199, 0.22)");
      gradient.addColorStop(1, "rgba(90, 209, 199, 0)");
      ctx.lineTo(x0 + width, y0 + height);
      ctx.lineTo(x0, y0 + height);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    ctx.fillStyle = "#7d94a9";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("magnetisation |M| vs sweep", x0, y0 - 10);
    ctx.textAlign = "right";
    ctx.fillText("1.0", x0 - 6, y0 + 10);
    ctx.fillText("0.0", x0 - 6, y0 + height);
    ctx.textAlign = "left";
  }

  function drawGauge(x0, y0, width) {
    const minT = 0.4;
    const maxT = 4.0;
    const gradient = ctx.createLinearGradient(x0, 0, x0 + width, 0);
    gradient.addColorStop(0, "#3f6fe0");
    gradient.addColorStop(0.45, "#8d6fe0");
    gradient.addColorStop(1, "#f6ad55");
    ctx.fillStyle = gradient;
    ctx.fillRect(x0, y0, width, 6);

    const markerX = x0 + ((state.T - minT) / (maxT - minT)) * width;
    ctx.fillStyle = "#eaf6ff";
    ctx.beginPath();
    ctx.moveTo(markerX, y0 - 6);
    ctx.lineTo(markerX - 6, y0 - 15);
    ctx.lineTo(markerX + 6, y0 - 15);
    ctx.closePath();
    ctx.fill();

    const tcX = x0 + ((CRITICAL - minT) / (maxT - minT)) * width;
    ctx.strokeStyle = "rgba(234, 246, 255, 0.5)";
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(tcX, y0 - 2);
    ctx.lineTo(tcX, y0 + 18);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#6f8398";
    ctx.font = "10px ui-monospace, Menlo, monospace";
    ctx.textAlign = "center";
    ctx.fillText("Tc", tcX, y0 + 30);
    ctx.textAlign = "left";
    ctx.fillText("cold", x0, y0 + 30);
    ctx.textAlign = "right";
    ctx.fillText("hot", x0 + width, y0 + 30);
    ctx.textAlign = "left";
  }

  function draw() {
    ctx.fillStyle = "#05080c";
    ctx.fillRect(0, 0, W, H);

    const size = Math.min(H - 60, 360);
    const x0 = 22;
    const y0 = (H - size) / 2 + 8;
    drawLattice(size, x0, y0);
    drawLegend(x0, y0 + size + 22);

    const chartX = x0 + size + 40;
    const chartW = W - chartX - 30;
    drawHistory(chartX, 56, chartW, 150);
    drawGauge(chartX, 236, chartW);

    ctx.fillStyle = "#55708a";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(
      `sweep ${state.sweeps} · accepted ${Math.round((100 * state.accepted) / state.proposals)}%`,
      chartX,
      286
    );
    ctx.fillStyle = "#3d5368";
    ctx.fillText("one sweep = one flip attempt per spin", chartX, 304);
    ctx.textAlign = "left";
  }

  /* ---------------------------------------------------------------- wiring */

  function resetLattice(message) {
    makeLattice(Number(el("size").value || 96));
    updateReadouts();
    setStatus(message || `Fresh random lattice at T ${state.T.toFixed(2)}. ${describe()}`);
    draw();
  }

  function setTemperature(value, mode) {
    state.T = Math.max(0.4, Math.min(4, value));
    el("temperature").value = state.T.toFixed(2);
    state.mode = mode || "fixed";
    updateReadouts();
    refreshStatus();
  }

  function toggleRun() {
    state.running = !state.running;
    el("toggle").textContent = state.running ? "Pause" : "Run";
    state.frameAccumulator = 0;
    if (state.running) {
      if (state.sweeps === 0) setStatus(`Running at T ${state.T.toFixed(2)} — one sweep per frame. ${describe()}`);
      else refreshStatus();
    } else {
      refreshStatus();
    }
  }

  function frame(timestamp) {
    if (!state.lastTime) state.lastTime = timestamp;
    const dt = Math.max(0, Math.min(100, timestamp - state.lastTime));
    state.lastTime = timestamp;

    if (state.running) {
      state.frameAccumulator += dt;
      let guard = 0;
      while (state.frameAccumulator >= 40 && guard < 3) {
        sweep();
        state.frameAccumulator -= 40;
        guard++;
      }
      if (guard) refreshStatus();
    }

    draw();
    requestAnimationFrame(frame);
  }

  el("toggle").addEventListener("click", toggleRun);
  el("sweep").addEventListener("click", () => {
    sweep();
    refreshStatus();
    draw();
  });
  el("reset").addEventListener("click", () => {
    state.running = false;
    el("toggle").textContent = "Run";
    resetLattice();
  });

  el("temperature").addEventListener("input", () => {
    setTemperature(Number(el("temperature").value), "fixed");
    draw();
  });

  el("preset").addEventListener("change", () => {
    const preset = el("preset").value;
    if (preset === "critical") setTemperature(CRITICAL, "fixed");
    else if (preset === "ordered") setTemperature(1.2, "fixed");
    else if (preset === "hot") setTemperature(3.4, "fixed");
    else if (preset === "sweepUp") {
      state.mode = "sweepUp";
      setTemperature(Math.min(state.T, 1.4), "sweepUp");
      resetLattice(`Quench to T ${state.T.toFixed(2)}, then warming slowly as the sweeps run.`);
      state.running = true;
      el("toggle").textContent = "Pause";
    }
    refreshStatus();
    draw();
  });

  el("size").addEventListener("change", () => {
    state.running = false;
    el("toggle").textContent = "Run";
    const L = Number(el("size").value || 96);
    resetLattice(`Lattice resized to ${L} × ${L}.`);
  });

  document.addEventListener("keydown", (event) => {
    const tag = (event.target && event.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (event.code === "Space") {
      event.preventDefault();
      toggleRun();
    } else if (event.key === "s" || event.key === "S") {
      sweep();
      refreshStatus();
      draw();
    } else if (event.key === "r" || event.key === "R") {
      state.running = false;
      el("toggle").textContent = "Run";
      resetLattice();
    }
  });

  el("temperature").value = CRITICAL.toFixed(2);
  el("preset").value = "critical";
  resetLattice("Ready at the critical temperature. Press Run or Sweep.");
  requestAnimationFrame(frame);
})();
