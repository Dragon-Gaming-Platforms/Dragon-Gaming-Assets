(() => {
  "use strict";

  // Diffusion Lab: many independent random walkers, with the mean squared
  // displacement measured against time. Brownian motion gives ⟨r²⟩ ∝ t
  // (log-log slope 1); a steady drift adds a ballistic term and pushes the
  // slope towards 2.

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");
  const W = canvas.width || 800;
  const H = canvas.height || 520;

  const CHART_W = 210;
  const CHART_H = 132;
  const CHART_X = W - CHART_W - 22;
  const CHART_Y = 22;

  const state = {
    walkers: [],
    count: 900,
    stepLength: 3,
    drift: 0,
    walk: "brownian",
    preset: "pure",
    trails: true,
    running: true,
    origin: { x: W / 2, y: H / 2 },
    time: 0,
    msd: 0,
    rms: 0,
    slope: null,
    history: [],
    frame: 0,
    lastTime: 0,
    accumulator: 0,
    lifetime: 0,
  };

  /* --------------------------------------------------------------- walkers */

  function spawn(index) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 4;
    return {
      x: state.origin.x + Math.cos(angle) * radius,
      y: state.origin.y + Math.sin(angle) * radius,
      px: state.origin.x,
      py: state.origin.y,
      heading: Math.random() * Math.PI * 2,
      tint: (index * 37) % 100 / 100,
    };
  }

  function setCount(count) {
    const target = Math.max(50, Math.min(3000, count));
    while (state.walkers.length < target) state.walkers.push(spawn(state.walkers.length));
    if (state.walkers.length > target) state.walkers.length = target;
    state.count = target;
    el("count-out").textContent = String(target);
  }

  function reset() {
    state.walkers = [];
    setCount(state.count);
    state.time = 0;
    state.msd = 0;
    state.rms = 0;
    state.slope = null;
    state.history = [];
    state.frame = 0;
    ctx.fillStyle = "#04070b";
    ctx.fillRect(0, 0, W, H);
    updateReadouts();
    setStatus("Walkers released from the centre. Press Run to start the clock.");
    draw();
  }

  function levyStep() {
    // Pareto-distributed step length with a heavy tail (alpha = 1.5).
    const u = Math.random();
    const length = Math.pow(1 - u, -1 / 1.5);
    return Math.min(70, length);
  }

  function move(walker) {
    let angle;
    let length;

    if (state.walk === "levy") {
      angle = Math.random() * Math.PI * 2;
      length = state.stepLength * levyStep() * 0.6;
    } else if (state.walk === "persistent") {
      angle = walker.heading + (Math.random() - 0.5) * 0.12;
      walker.heading = angle;
      length = state.stepLength;
    } else {
      angle = Math.random() * Math.PI * 2;
      walker.heading = angle;
      length = state.stepLength;
    }

    const dx = Math.cos(angle) * length + state.drift * state.stepLength;
    const dy = Math.sin(angle) * length;

    walker.px = walker.x;
    walker.py = walker.y;
    walker.x += dx;
    walker.y += dy;

    // Reflecting edges keep everyone in the same arena; the label says so.
    if (walker.x < 6 || walker.x > W - 6) {
      walker.x = Math.max(6, Math.min(W - 6, walker.x));
      walker.heading = Math.PI - walker.heading;
    }
    if (walker.y < 6 || walker.y > H - 6) {
      walker.y = Math.max(6, Math.min(H - 6, walker.y));
      walker.heading = -walker.heading;
    }
  }

  function tick() {
    const walkers = state.walkers;
    for (let i = 0; i < walkers.length; i++) move(walkers[i]);
    state.time += 1;

    let sum = 0;
    for (let i = 0; i < walkers.length; i++) {
      const dx = walkers[i].x - state.origin.x;
      const dy = walkers[i].y - state.origin.y;
      sum += dx * dx + dy * dy;
    }
    state.msd = sum / walkers.length;
    state.rms = Math.sqrt(state.msd);

    if (state.time === 1 || state.time % 5 === 0) {
      state.history.push({ t: state.time, msd: state.msd });
      if (state.history.length > 400) state.history.shift();
      fitSlope();
    }
  }

  function fitSlope() {
    const points = state.history.filter((p) => p.t >= 4 && p.msd > 1e-6);
    if (points.length < 8) {
      state.slope = null;
      return;
    }
    // Use the first two thirds so wall saturation does not bend the fit.
    const use = points.slice(0, Math.max(8, Math.floor((points.length * 2) / 3)));
    let sx = 0;
    let sy = 0;
    let sxx = 0;
    let sxy = 0;
    for (const p of use) {
      const x = Math.log(p.t);
      const y = Math.log(p.msd);
      sx += x;
      sy += y;
      sxx += x * x;
      sxy += x * y;
    }
    const n = use.length;
    const denom = n * sxx - sx * sx;
    state.slope = Math.abs(denom) < 1e-9 ? null : (n * sxy - sx * sy) / denom;
  }

  /* --------------------------------------------------------------- drawing */

  function trailColour(tint) {
    const r = Math.round(70 + tint * 120);
    const g = Math.round(190 - tint * 60);
    const b = Math.round(255 - tint * 40);
    return `rgba(${r}, ${g}, ${b}, 0.5)`;
  }

  function drawWalkers() {
    if (state.trails) {
      ctx.lineWidth = 1;
      ctx.lineCap = "round";
      for (const walker of state.walkers) {
        ctx.strokeStyle = trailColour(walker.tint);
        ctx.beginPath();
        ctx.moveTo(walker.px, walker.py);
        ctx.lineTo(walker.x, walker.y);
        ctx.stroke();
      }
    }
  }

  function drawDots() {
    ctx.fillStyle = "rgba(210, 245, 255, 0.85)";
    for (const walker of state.walkers) {
      ctx.fillRect(walker.x - 0.7, walker.y - 0.7, 1.4, 1.4);
    }
  }

  function drawOrigin() {
    const { x, y } = state.origin;
    ctx.strokeStyle = "rgba(255, 180, 92, 0.6)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 10, y);
    ctx.lineTo(x + 10, y);
    ctx.moveTo(x, y - 10);
    ctx.lineTo(x, y + 10);
    ctx.stroke();
  }

  function idealSlope() {
    return state.walk === "persistent" ? 2 : 1;
  }

  function drawChart() {
    ctx.fillStyle = "rgba(8, 13, 19, 0.92)";
    ctx.fillRect(CHART_X, CHART_Y, CHART_W, CHART_H);
    ctx.strokeStyle = "#1e2a36";
    ctx.lineWidth = 1;
    ctx.strokeRect(CHART_X + 0.5, CHART_Y + 0.5, CHART_W, CHART_H);

    const pad = 26;
    const plotW = CHART_W - pad - 10;
    const plotH = CHART_H - 34;

    ctx.fillStyle = "#7f93a4";
    ctx.font = "10px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("⟨r²⟩ vs t (log-log)", CHART_X + 8, CHART_Y + 14);

    const points = state.history.filter((p) => p.msd > 1e-6);
    if (points.length < 3) {
      ctx.fillStyle = "#4d5f70";
      ctx.fillText("waiting for data…", CHART_X + 10, CHART_Y + 60);
      return;
    }

    const tMax = Math.max(10, Math.log(points[points.length - 1].t));
    const mMax = Math.max(1, Math.log(points[points.length - 1].msd));
    const tMin = Math.log(2);

    const toX = (t) => CHART_X + pad + ((Math.log(t) - tMin) / Math.max(1e-6, tMax - tMin)) * plotW;
    const toY = (m) => CHART_Y + CHART_H - 22 - (Math.log(m) / mMax) * plotH;

    ctx.strokeStyle = "rgba(95, 208, 255, 0.85)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    points.forEach((p, i) => {
      const x = toX(p.t);
      const y = toY(p.msd);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    if (points.length > 10) {
      // Dashed guide at the slope this walk type should approach.
      const target = idealSlope();
      const first = points[0];
      const last = points[points.length - 1];
      const x0 = toX(first.t);
      const y0 = toY(first.msd);
      const x1 = toX(last.t);
      const dLogT = ((x1 - x0) / plotW) * (tMax - tMin);
      const dLogM = target * dLogT;
      const y1 = y0 - (dLogM / mMax) * plotH;
      ctx.strokeStyle = "rgba(255, 180, 92, 0.32)";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, Math.max(CHART_Y + 18, Math.min(CHART_Y + CHART_H - 22, y1)));
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.fillStyle = "#6d8093";
    ctx.textAlign = "right";
    ctx.fillText(`t ${Math.round(state.time)}`, CHART_X + CHART_W - 8, CHART_Y + CHART_H - 6);
    ctx.textAlign = "left";
  }

  function draw() {
    if (state.trails) {
      // Fade the accumulated paths very slightly so the cloud stays legible.
      ctx.fillStyle = "rgba(4, 7, 11, 0.06)";
      ctx.fillRect(0, 0, W, H);
    } else {
      ctx.fillStyle = "#04070b";
      ctx.fillRect(0, 0, W, H);
    }

    drawWalkers();
    drawDots();
    drawOrigin();

    ctx.fillStyle = "rgba(133, 152, 170, 0.85)";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(`${state.count.toLocaleString("en-US")} walkers · ${state.walk}`, 22, 30);
    ctx.fillText(`step ${state.stepLength.toFixed(1)} px · drift ${state.drift.toFixed(2)}`, 22, 48);

    drawChart();
  }

  /* -------------------------------------------------------------- readouts */

  function updateReadouts() {
    el("msd-read").textContent = `MSD ${Math.round(state.msd).toLocaleString("en-US")} px²`;
    el("slope-read").textContent = state.slope === null ? "slope —" : `slope ${state.slope.toFixed(2)}`;
    el("time-read").textContent = `t ${Math.round(state.time)}`;
    el("msd2-read").textContent = Math.round(state.msd).toLocaleString("en-US");
    el("rms-read").textContent = `${state.rms.toFixed(1)} px`;
    el("slope2-read").textContent = state.slope === null ? "—" : state.slope.toFixed(2);

    if (state.time > 20 && state.msd > 0) {
      const d = state.msd / (4 * state.time);
      el("d-read").textContent = d.toFixed(2);
    } else {
      el("d-read").textContent = "—";
    }

    el("count-out").textContent = String(state.count);
    el("step-out").textContent = state.stepLength.toFixed(1);
    el("drift-out").textContent = state.drift.toFixed(2);
  }

  function setStatus(text) {
    el("status").textContent = text;
  }

  function statusLine() {
    const slope = state.slope === null ? "not enough data" : state.slope.toFixed(2);
    const msg =
      state.walk === "brownian"
        ? "Brownian steps have no memory, so ⟨r²⟩ grows linearly with time."
        : state.walk === "persistent"
          ? "Persistent walkers keep their heading, so the motion is ballistic and the slope tends to 2."
          : "Lévy flights mix short hops with rare long jumps. The cloud spreads several times faster for the same elapsed time, though a finite arena clips the longest jumps and pulls the long-run slope back towards 1.";
    return `t ${Math.round(state.time)} · ⟨r²⟩ ${Math.round(state.msd).toLocaleString("en-US")} px² · fitted slope ${slope} (guide ${idealSlope()}). ${msg}`;
  }

  /* ------------------------------------------------------------------ loop */

  function frame(timestamp) {
    if (!state.lastTime) state.lastTime = timestamp;
    const dt = Math.max(0, Math.min(80, timestamp - state.lastTime));
    state.lastTime = timestamp;

    if (state.running) {
      // Fixed 30 ticks per second regardless of frame rate.
      state.accumulator += dt;
      let guard = 0;
      while (state.accumulator >= 33 && guard < 6) {
        state.accumulator -= 33;
        tick();
        guard++;
      }
      state.frame += 1;
      if (state.frame % 8 === 0) {
        updateReadouts();
        setStatus(statusLine());
      }
    }

    draw();
    requestAnimationFrame(frame);
  }

  /* ---------------------------------------------------------------- wiring */

  function setRunning(running) {
    state.running = running;
    state.accumulator = 0;
    el("toggle").textContent = running ? "Pause" : "Run";
    setStatus(running ? statusLine() : `Paused at t ${Math.round(state.time)} with ⟨r²⟩ = ${Math.round(state.msd).toLocaleString("en-US")} px².`);
  }

  el("toggle").addEventListener("click", () => setRunning(!state.running));
  el("reset").addEventListener("click", reset);

  el("count").addEventListener("input", () => {
    setCount(Number(el("count").value));
    updateReadouts();
  });

  el("step").addEventListener("input", () => {
    state.stepLength = Number(el("step").value);
    updateReadouts();
  });

  el("drift").addEventListener("input", () => {
    state.drift = Number(el("drift").value);
    updateReadouts();
  });

  el("walk").addEventListener("change", () => {
    state.walk = el("walk").value;
    reset();
    setStatus(`${state.walk} walk selected — reset the clock and released fresh walkers.`);
  });

  el("preset").addEventListener("change", () => {
    const preset = el("preset").value;
    state.preset = preset;
    if (preset === "wind") {
      el("walk").value = "brownian";
      el("step").value = "3";
      el("drift").value = "0.55";
    } else if (preset === "levy") {
      el("walk").value = "levy";
      el("step").value = "4";
      el("drift").value = "0";
    } else if (preset === "herd") {
      el("walk").value = "persistent";
      el("step").value = "3";
      el("drift").value = "0";
    } else {
      el("walk").value = "brownian";
      el("step").value = "3";
      el("drift").value = "0";
    }
    state.walk = el("walk").value;
    state.stepLength = Number(el("step").value);
    state.drift = Number(el("drift").value);
    reset();
    updateReadouts();
    draw();
  });

  el("trails").addEventListener("change", () => {
    state.trails = el("trails").checked;
    ctx.fillStyle = "#04070b";
    ctx.fillRect(0, 0, W, H);
    draw();
  });

  canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / (rect.width || W)) * W;
    const y = ((event.clientY - rect.top) / (rect.height || H)) * H;
    state.origin = { x: Math.max(20, Math.min(W - 20, x)), y: Math.max(20, Math.min(H - 20, y)) };
    reset();
    setStatus("Release point moved — all walkers restarted from the new origin.");
  });

  document.addEventListener("keydown", (event) => {
    const tag = (event.target && event.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (event.code === "Space") {
      event.preventDefault();
      setRunning(!state.running);
    } else if (event.key === "r" || event.key === "R") {
      reset();
    } else if (event.key === "c" || event.key === "C") {
      ctx.fillStyle = "#04070b";
      ctx.fillRect(0, 0, W, H);
      draw();
    }
  });

  // Adopt whatever the markup says, so deep links and restored form state work.
  state.count = Number(el("count").value) || state.count;
  state.stepLength = Number(el("step").value) || state.stepLength;
  state.drift = Number(el("drift").value) || 0;
  state.walk = el("walk").value || state.walk;
  state.preset = el("preset").value || state.preset;
  state.trails = el("trails").checked;
  el("count-out").textContent = String(state.count);
  el("step-out").textContent = state.stepLength.toFixed(1);
  el("drift-out").textContent = state.drift.toFixed(2);

  setCount(state.count);
  setRunning(true);
  updateReadouts();
  setStatus("Walkers released from the centre. The clock is running.");
  draw();
  requestAnimationFrame(frame);
})();
