(() => {
  "use strict";

  // An event-driven M/M/1 queue. Arrivals are Poisson (exponential gaps at
  // rate lambda) and service times are exponential at rate mu. The simulation
  // keeps exact time integrals of queue length and busy-ness, so the run-time
  // averages can be compared directly with the closed-form M/M/1 results
  // instead of being eyeballed from the animation.

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");

  const W = canvas.width || 880;
  const H = canvas.height || 600;

  const LANE_Y = 66;
  const LANE_H = 150;
  const SPARK_Y = 250;
  const SPARK_H = 84;
  const CHART_X = 86;
  const CHART_Y = 386;
  const CHART_W = W - CHART_X - 46;
  const CHART_H = 150;
  const WQ_MAX = 10;

  const state = {
    lambda: 0.6,
    mu: 1.0,
    speed: 0.2,
    running: true,
    seed: 987654321,
    rng: null,
    clock: 0,
    nextArrival: 0,
    nextDeparture: Infinity,
    busy: false,
    server: null,
    queue: [],
    arrivals: 0,
    served: 0,
    areaQ: 0,
    areaSys: 0,
    busyArea: 0,
    totalWait: 0,
    totalSystem: 0,
    statStart: 0,
    hist: [],
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
    state.clock = 0;
    state.areaQ = 0;
    state.areaSys = 0;
    state.busyArea = 0;
    state.totalWait = 0;
    state.totalSystem = 0;
    state.arrivals = 0;
    state.served = 0;
    state.queue = [];
    state.busy = false;
    state.server = null;
    state.nextDeparture = Infinity;
    state.nextArrival = exponential(state.lambda);
    state.statStart = 0;
    state.hist = [[0, 0]];
    updateReadouts();
    updateStatus();
  }

  function exponential(rate) {
    const r = Math.max(1e-12, 1 - state.rng());
    return -Math.log(r) / Math.max(0.02, rate);
  }

  function resetStats() {
    state.areaQ = 0;
    state.areaSys = 0;
    state.busyArea = 0;
    state.totalWait = 0;
    state.totalSystem = 0;
    state.served = 0;
    state.arrivals = 0;
    state.statStart = state.clock;
  }

  /* ------------------------------------------------------------ mechanics */

  function accumulate(dt) {
    if (dt <= 0) return;
    const inSystem = state.queue.length + (state.busy ? 1 : 0);
    state.areaQ += state.queue.length * dt;
    state.areaSys += inSystem * dt;
    state.busyArea += (state.busy ? 1 : 0) * dt;
  }

  function arrival() {
    state.arrivals++;
    if (!state.busy) {
      const dur = exponential(state.mu);
      state.busy = true;
      state.server = { arrival: state.clock, start: state.clock, dur };
      state.nextDeparture = state.clock + dur;
    } else {
      state.queue.push(state.clock);
    }
    state.nextArrival = state.clock + exponential(state.lambda);
  }

  function departure() {
    state.busy = false;
    if (state.server) {
      state.totalWait += state.server.start - state.server.arrival;
      state.totalSystem += state.clock - state.server.arrival;
    }
    state.served++;
    if (state.queue.length) {
      const queuedAt = state.queue.shift();
      const dur = exponential(state.mu);
      state.busy = true;
      state.server = { arrival: queuedAt, start: state.clock, dur };
      state.nextDeparture = state.clock + dur;
    } else {
      state.server = null;
      state.nextDeparture = Infinity;
    }
  }

  function advance(duration) {
    const target = state.clock + duration;
    let guard = 0;
    while (state.clock < target) {
      const nextDeparture = state.busy ? state.nextDeparture : Infinity;
      const nextEvent = Math.min(state.nextArrival, nextDeparture);
      if (nextEvent > target) {
        accumulate(target - state.clock);
        state.clock = target;
        break;
      }
      accumulate(nextEvent - state.clock);
      state.clock = nextEvent;
      if (state.nextArrival <= nextDeparture) arrival();
      else departure();
      if (++guard > 400000) break;
    }

    state.hist.push([state.clock, state.queue.length]);
    while (state.hist.length && state.hist[0][0] < state.clock - 60) state.hist.shift();
    if (state.hist.length > 900) state.hist.shift();
    updateReadouts();
  }

  /* --------------------------------------------------------------- maths */

  function stats() {
    const elapsed = Math.max(1e-9, state.clock - state.statStart);
    const rho = state.lambda / state.mu;
    const unstable = state.lambda >= state.mu;
    const theoryWq = unstable ? Infinity : rho / (state.mu * (1 - rho));
    const theoryLq = unstable ? Infinity : (rho * rho) / (1 - rho);
    const observedWq = state.served > 0 ? state.totalWait / state.served : 0;
    const observedW = state.served > 0 ? state.totalSystem / state.served : 0;
    return {
      elapsed,
      rho,
      rhoObserved: state.busyArea / elapsed,
      lq: state.areaQ / elapsed,
      l: state.areaSys / elapsed,
      wq: observedWq,
      w: observedW,
      theoryWq,
      theoryLq,
      little: state.lambda * observedW,
      served: state.served,
      arrivals: state.arrivals,
      unstable,
      queue: state.queue.length,
      busy: state.busy,
    };
  }

  /* ------------------------------------------------------------- readouts */

  function fmt(value, digits) {
    if (!isFinite(value)) return "∞";
    if (Math.abs(value) >= 100) return value.toFixed(0);
    return value.toFixed(digits === undefined ? 2 : digits);
  }

  function setStatus(text, kind) {
    const box = el("status");
    box.textContent = text;
    box.className = "status" + (kind ? " " + kind : "");
  }

  function updateReadouts() {
    const s = stats();
    el("rho-read").textContent = fmt(s.rhoObserved, 2);
    el("lq-read").textContent = fmt(s.lq, 2);
    el("wq-read").textContent = fmt(s.wq, 2);
    el("theory-read").textContent = fmt(s.theoryWq, 2);
    el("little-read").textContent = `${fmt(s.l, 2)} = ${fmt(s.little, 2)}`;
    el("qlen-read").textContent = String(s.queue);
    el("served-read").textContent = String(s.served);
    el("time-read").textContent = fmt(state.clock, 0);
    el("rho-hud").textContent = "ρ = " + fmt(s.rho, 2);
    el("wq-hud").textContent = "Wq = " + fmt(s.wq, 2);
    el("served-hud").textContent = s.served + " served";
  }

  function updateStatus() {
    const s = stats();
    if (s.unstable) {
      setStatus(
        `λ = ${state.lambda.toFixed(2)} ≥ μ = ${state.mu.toFixed(2)}. The server cannot keep up and the queue grows without bound — waiting time is infinite in theory.`,
        "warn"
      );
      return;
    }
    if (s.rho > 0.88) {
      setStatus(
        `ρ = ${s.rho.toFixed(2)}. Measured Wq ${fmt(s.wq, 2)} against a predicted ${fmt(s.theoryWq, 2)} — near saturation the wait is dominated by rare long queues.`,
        "warn"
      );
      return;
    }
    setStatus(
      `ρ = ${s.rho.toFixed(2)}: measured Wq ${fmt(s.wq, 2)} vs theory ${fmt(s.theoryWq, 2)}, measured Lq ${fmt(s.lq, 2)} vs theory ${fmt(
        s.theoryLq,
        2
      )}. Little's check L = ${fmt(s.l, 2)} against λW = ${fmt(s.little, 2)}.`,
      "idle"
    );
  }

  /* -------------------------------------------------------------- drawing */

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#080c12";
    ctx.fillRect(0, 0, W, H);

    drawLane();
    drawSpark();
    drawChart();

    ctx.fillStyle = "#8296a8";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(`λ ${state.lambda.toFixed(2)} arrivals / unit · μ ${state.mu.toFixed(2)} services / unit`, 26, 30);
    ctx.textAlign = "right";
    ctx.fillStyle = state.running ? "#7ee0a8" : "#ffc35c";
    ctx.fillText(state.running ? "running" : "paused", W - 30, 30);
    ctx.textAlign = "left";
  }

  function drawLane() {
    const y = LANE_Y;
    const h = LANE_H;
    ctx.fillStyle = "#0c1219";
    ctx.strokeStyle = "#243342";
    ctx.lineWidth = 1;
    ctx.fillRect(24, y, W - 48, h);
    ctx.strokeRect(24.5, y + 0.5, W - 49, h - 1);

    // Arrival side
    ctx.fillStyle = "#ffc35c";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("arrivals", 40, y + 22);
    ctx.strokeStyle = "#6c5525";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, y + h / 2);
    ctx.lineTo(94, y + h / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(94, y + h / 2);
    ctx.lineTo(86, y + h / 2 - 5);
    ctx.lineTo(86, y + h / 2 + 5);
    ctx.closePath();
    ctx.fillStyle = "#ffc35c";
    ctx.fill();

    // Waiting customers
    const startX = 112;
    const dotY = y + h / 2 + 16;
    const maxDots = 24;
    const shown = Math.min(state.queue.length, maxDots);
    ctx.fillStyle = "#8fa3b5";
    ctx.fillText("waiting line", startX, y + 22);
    for (let i = 0; i < shown; i++) {
      const waited = state.clock - state.queue[i];
      const heat = Math.min(1, waited / 6);
      const r = Math.round(255);
      const g = Math.round(195 - heat * 90);
      const b = Math.round(92 - heat * 30);
      ctx.beginPath();
      ctx.arc(startX + 10 + i * 17, dotY, 6, 0, Math.PI * 2);
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fill();
    }
    if (state.queue.length > maxDots) {
      ctx.fillStyle = "#ffc35c";
      ctx.fillText(`+${state.queue.length - maxDots}`, startX + 10 + maxDots * 17, dotY + 4);
    }
    if (!state.queue.length) {
      ctx.fillStyle = "#4d5f70";
      ctx.fillText("empty", startX + 10, dotY + 4);
    }

    // Server
    const sx = 604;
    const sy = y + 30;
    const sw = 120;
    const sh = h - 58;
    ctx.fillStyle = "#101a26";
    ctx.strokeStyle = state.busy ? "#ff6b86" : "#2b3b4c";
    ctx.lineWidth = 2;
    ctx.fillRect(sx, sy, sw, sh);
    ctx.strokeRect(sx, sy, sw, sh);

    if (state.busy && state.server) {
      const progress = Math.min(1, (state.clock - state.server.start) / Math.max(1e-6, state.server.dur));
      ctx.fillStyle = "rgba(255, 107, 134, 0.25)";
      ctx.fillRect(sx + 3, sy + 3, (sw - 6) * progress, sh - 6);
      ctx.fillStyle = "#ffd3dc";
      ctx.textAlign = "center";
      ctx.fillText("in service", sx + sw / 2, sy + sh / 2 - 4);
      ctx.fillStyle = "#ff9cb0";
      ctx.fillText(Math.round(progress * 100) + "%", sx + sw / 2, sy + sh / 2 + 14);
      ctx.textAlign = "left";
    } else {
      ctx.fillStyle = "#5a6c7e";
      ctx.textAlign = "center";
      ctx.fillText("idle", sx + sw / 2, sy + sh / 2 + 4);
      ctx.textAlign = "left";
    }

    ctx.fillStyle = "#8fa3b5";
    ctx.fillText("server μ", sx, sy - 10);

    // Departures
    ctx.strokeStyle = "#3d6a52";
    ctx.beginPath();
    ctx.moveTo(sx + sw + 12, y + h / 2);
    ctx.lineTo(W - 46, y + h / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(W - 46, y + h / 2);
    ctx.lineTo(W - 54, y + h / 2 - 5);
    ctx.lineTo(W - 54, y + h / 2 + 5);
    ctx.closePath();
    ctx.fillStyle = "#7ee0a8";
    ctx.fill();
    ctx.fillStyle = "#8fa3b5";
    ctx.fillText("done", W - 96, y + h / 2 - 10);
  }

  function drawSpark() {
    ctx.fillStyle = "#8093a5";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("queue length, last 60 time units", 26, SPARK_Y - 8);

    const x0 = 26;
    const width = W - 52;
    ctx.fillStyle = "#0c1219";
    ctx.fillRect(x0, SPARK_Y, width, SPARK_H);
    ctx.strokeStyle = "#243342";
    ctx.strokeRect(x0 + 0.5, SPARK_Y + 0.5, width - 1, SPARK_H - 1);

    if (state.hist.length < 2) return;
    let peak = 1;
    for (const [, q] of state.hist) if (q > peak) peak = q;
    const tEnd = state.clock;
    const tStart = tEnd - 60;
    const xOf = (t) => x0 + ((t - tStart) / 60) * width;
    const yOf = (q) => SPARK_Y + SPARK_H - (q / (peak * 1.15)) * (SPARK_H - 8);

    ctx.strokeStyle = "#ffc35c";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    let started = false;
    for (const [t, q] of state.hist) {
      if (t < tStart) continue;
      const x = xOf(t);
      const y = yOf(q);
      if (!started) {
        ctx.moveTo(x, y);
        started = true;
      } else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.fillStyle = "#5d7183";
    ctx.fillText("peak " + peak, x0 + width - 70, SPARK_Y + 14);
  }

  function drawChart() {
    ctx.fillStyle = "#8093a5";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("waiting time vs utilisation — M/M/1", CHART_X, CHART_Y - 26);

    ctx.fillStyle = "#0c1219";
    ctx.fillRect(CHART_X, CHART_Y, CHART_W, CHART_H);
    ctx.strokeStyle = "#243342";
    ctx.strokeRect(CHART_X + 0.5, CHART_Y + 0.5, CHART_W - 1, CHART_H - 1);

    const xOf = (rho) => CHART_X + rho * CHART_W;
    const yOf = (wq) => CHART_Y + CHART_H - (Math.min(wq, WQ_MAX) / WQ_MAX) * (CHART_H - 12);

    // Grid
    ctx.strokeStyle = "#1a2634";
    ctx.font = "10px ui-monospace, Menlo, monospace";
    for (let i = 0; i <= 5; i++) {
      const y = CHART_Y + CHART_H - (i / 5) * (CHART_H - 12);
      ctx.beginPath();
      ctx.moveTo(CHART_X, y + 0.5);
      ctx.lineTo(CHART_X + CHART_W, y + 0.5);
      ctx.stroke();
      ctx.fillStyle = "#6b8092";
      ctx.textAlign = "right";
      ctx.fillText(String((i * WQ_MAX) / 5), CHART_X - 8, y + 3);
    }
    for (let i = 0; i <= 5; i++) {
      const rho = i / 5;
      const x = xOf(rho);
      ctx.strokeStyle = "#1a2634";
      ctx.beginPath();
      ctx.moveTo(x + 0.5, CHART_Y);
      ctx.lineTo(x + 0.5, CHART_Y + CHART_H);
      ctx.stroke();
      ctx.fillStyle = "#6b8092";
      ctx.textAlign = "center";
      ctx.fillText(rho.toFixed(1), x, CHART_Y + CHART_H + 16);
    }
    ctx.fillStyle = "#8093a5";
    ctx.fillText("ρ = λ / μ", CHART_X + CHART_W / 2, CHART_Y + CHART_H + 34);

    // Theory curve.
    ctx.strokeStyle = "#5fb8ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    let begun = false;
    for (let i = 0; i <= 98; i++) {
      const rho = i / 100;
      const wq = rho / (state.mu * (1 - rho));
      if (wq > WQ_MAX) {
        if (begun) {
          const x = xOf(rho);
          ctx.lineTo(x, yOf(WQ_MAX));
        }
        break;
      }
      const x = xOf(rho);
      const y = yOf(wq);
      if (!begun) {
        ctx.moveTo(x, y);
        begun = true;
      } else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Current utilisation marker and measured wait.
    const s = stats();
    if (s.rho < 1) {
      const x = xOf(s.rho);
      ctx.strokeStyle = "rgba(255, 195, 92, 0.4)";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(x, CHART_Y);
      ctx.lineTo(x, CHART_Y + CHART_H);
      ctx.stroke();
      ctx.setLineDash([]);

      if (s.served > 0) {
        const y = yOf(s.wq);
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.strokeStyle = "#080c12";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // Theory readout near the curve.
    ctx.fillStyle = "#5fb8ff";
    ctx.textAlign = "left";
    ctx.font = "10px ui-monospace, Menlo, monospace";
    const label = isFinite(s.theoryWq) ? `theory ${fmt(s.theoryWq, 2)}` : "theory ∞";
    ctx.fillText(label, CHART_X + 12, CHART_Y + 16);
    ctx.fillStyle = "#ffc35c";
    ctx.fillText(`measured ${fmt(s.wq, 2)}`, CHART_X + 12, CHART_Y + 30);
  }

  /* ---------------------------------------------------------------- input */

  function setRate(which, value) {
    if (which === "lambda") {
      state.lambda = Math.min(1.2, Math.max(0.05, value));
      el("lambda").value = String(state.lambda);
      el("lambda-out").textContent = state.lambda.toFixed(2);
    } else {
      state.mu = Math.min(2, Math.max(0.2, value));
      el("mu").value = String(state.mu);
      el("mu-out").textContent = state.mu.toFixed(2);
    }
    reset(state.seed);
  }

  el("lambda").addEventListener("input", (evt) => setRate("lambda", Number(evt.target.value)));
  el("mu").addEventListener("input", (evt) => setRate("mu", Number(evt.target.value)));
  el("speed").addEventListener("input", (evt) => {
    state.speed = Math.max(0.02, Number(evt.target.value) || 0.02);
    el("speed-out").textContent = state.speed.toFixed(2);
  });

  el("toggle").addEventListener("click", () => {
    state.running = !state.running;
    el("toggle").textContent = state.running ? "Pause" : "Run";
    updateStatus();
  });

  function burnIn(amount) {
    const wasRunning = state.running;
    state.running = false;
    advance(amount);
    // Keep what the run measured: 500 time units is long enough that the
    // empty-start transient no longer dominates the averages.
    state.hist = [[state.clock, state.queue.length]];
    state.running = wasRunning;
    updateReadouts();
    updateStatus();
  }

  el("burn").addEventListener("click", () => burnIn(500));
  el("reset").addEventListener("click", () => reset());

  function preset(lambda, name) {
    setRate("lambda", lambda);
    setStatus(
      name === "light"
        ? `Light load: λ = 0.30. The server idles, waits are short and the queue rarely passes two.`
        : name === "busy"
          ? `Busy: λ = 0.80. Same server, but Wq = 0.8 / (1 − 0.8) = 4 service times.`
          : `Edge of stability: λ = 0.93. Theory says Wq ≈ 13.3 — the queue becomes a different animal.`,
      name === "critical" ? "warn" : "idle"
    );
  }

  el("light").addEventListener("click", () => preset(0.3, "light"));
  el("busy").addEventListener("click", () => preset(0.8, "busy"));
  el("critical").addEventListener("click", () => preset(0.93, "critical"));

  document.addEventListener("keydown", (evt) => {
    const key = evt.key;
    if (key === " ") {
      evt.preventDefault();
      state.running = !state.running;
      el("toggle").textContent = state.running ? "Pause" : "Run";
      updateStatus();
    } else if (key === "r" || key === "R") {
      reset();
    } else if (key === "b" || key === "B") {
      burnIn(500);
    }
  });

  /* ------------------------------------------------------------- main loop */

  function loop() {
    state.frame++;
    if (state.running) {
      advance(state.speed);
      updateReadouts();
      if (state.frame % 12 === 0 && state.clock > 5) updateStatus();
    }
    draw();
    requestAnimationFrame(loop);
  }

  window.__lab = {
    state,
    advance,
    reset,
    resetStats,
    stats,
    burnIn,
    setRate,
    preset,
  };

  reset(987654321);
  draw();
  requestAnimationFrame(loop);
})();
