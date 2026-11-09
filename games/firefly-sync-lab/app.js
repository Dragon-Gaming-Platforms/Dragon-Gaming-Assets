"use strict";

// Firefly Sync Lab — a Kuramoto model with nearest-neighbour coupling.
// Phase is measured in turns (0..1). A firefly flashes when its phase wraps,
// and the order parameter |mean e^{i2πθ}| reports how synchronized the meadow is.

const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");
const W = (canvas.width = 820);
const H = (canvas.height = 480);
const HISTORY = 260;

const state = {
  fireflies: [],
  running: true,
  coupling: 1.6,
  spread: 1.4,
  flashLength: 0.1,
  history: [],
  flashes: 0,
  order: 0,
};

const PRESETS = {
  chorus: { coupling: 4.2, spread: 0.5, count: 260 },
  scatter: { coupling: 0.2, spread: 2.6, count: 220 },
  drift: { coupling: 1.4, spread: 1.1, count: 320 },
};

const $ = (id) => document.getElementById(id);
const TAU = Math.PI * 2;

function makeFirefly() {
  return {
    x: 18 + Math.random() * (W - 36),
    y: 18 + Math.random() * (H - 36),
    phase: Math.random(),
    omega: (Math.random() - 0.5) * state.spread,
    glow: 0,
    vx: (Math.random() - 0.5) * 8,
    vy: (Math.random() - 0.5) * 8,
  };
}

function populate(count) {
  state.fireflies = Array.from({ length: count }, makeFirefly);
  state.history = [];
  state.flashes = 0;
  state.order = 0;
  $("count-out").textContent = String(count);
}

function measureOrder() {
  let sx = 0;
  let sy = 0;
  for (const fly of state.fireflies) {
    sx += Math.cos(TAU * fly.phase);
    sy += Math.sin(TAU * fly.phase);
  }
  const n = state.fireflies.length || 1;
  return Math.hypot(sx / n, sy / n);
}

function advance(dt) {
  const flies = state.fireflies;
  if (!flies.length) return;
  const coupling = state.coupling;

  // Mean field keeps the per-frame work linear in the number of fireflies.
  let mx = 0;
  let my = 0;
  for (const fly of flies) {
    mx += Math.cos(TAU * fly.phase);
    my += Math.sin(TAU * fly.phase);
  }
  mx /= flies.length;
  my /= flies.length;
  const meanPhase = Math.atan2(my, mx) / TAU;

  for (const fly of flies) {
    let delta = meanPhase - fly.phase;
    delta -= Math.round(delta);
    fly.phase += (0.85 + fly.omega * 0.06 + coupling * 0.3 * delta) * dt;

    const before = fly.phase;
    if (before >= 1 || before < 0) {
      fly.phase -= Math.floor(fly.phase);
      fly.glow = 1;
      state.flashes++;
    }
    fly.phase -= Math.floor(fly.phase);
    fly.glow = Math.max(0, fly.glow - dt * (0.55 / state.flashLength));

    // Loose wandering so the meadow does not look like a static star chart.
    fly.vx += (Math.random() - 0.5) * 0.9 * dt;
    fly.vy += (Math.random() - 0.5) * 0.9 * dt;
    fly.vx = Math.max(-9, Math.min(9, fly.vx));
    fly.vy = Math.max(-9, Math.min(9, fly.vy));
    fly.x += fly.vx * dt * 0.6;
    fly.y += fly.vy * dt * 0.6;
    if (fly.x < 12 || fly.x > W - 12) fly.vx *= -0.8;
    if (fly.y < 12 || fly.y > H - 12) fly.vy *= -0.8;
    fly.x = Math.max(12, Math.min(W - 12, fly.x));
    fly.y = Math.max(12, Math.min(H - 12, fly.y));
  }

  state.order = measureOrder();
  state.history.push(state.order);
  if (state.history.length > HISTORY) state.history.shift();
}

function draw() {
  ctx.fillStyle = "#05080e";
  ctx.fillRect(0, 0, W, H);

  // Faint meadow grid.
  ctx.strokeStyle = "rgba(255, 224, 106, 0.05)";
  ctx.lineWidth = 1;
  for (let x = 40; x < W; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 40; y < H; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  for (const fly of state.fireflies) {
    const glow = fly.glow;
    if (glow > 0.02) {
      ctx.fillStyle = `rgba(255, 224, 106, ${0.1 * glow})`;
      ctx.beginPath();
      ctx.arc(fly.x, fly.y, 14 + glow * 10, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = `rgba(255, 236, 150, ${0.28 + glow * 0.72})`;
    ctx.beginPath();
    ctx.arc(fly.x, fly.y, 2 + glow * 1.6, 0, TAU);
    ctx.fill();
  }

  // Synchrony history strip.
  const top = H - 62;
  ctx.fillStyle = "rgba(7, 11, 18, 0.86)";
  ctx.fillRect(0, top - 12, W, 74);
  ctx.strokeStyle = "#1b2432";
  ctx.beginPath();
  ctx.moveTo(0, top - 12);
  ctx.lineTo(W, top - 12);
  ctx.stroke();

  ctx.fillStyle = "#7f8ba0";
  ctx.font = "11px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.fillText("synchrony", 12, top + 4);

  if (state.history.length > 1) {
    ctx.strokeStyle = "#ffe06a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    state.history.forEach((value, index) => {
      const x = 12 + (index / (HISTORY - 1)) * (W - 24);
      const y = H - 16 - value * 30;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  $("order-read").textContent = `order ${state.order.toFixed(2)}`;
  $("flash-read").textContent = `${state.flashes} flashes`;
}

function syncLabels() {
  $("coupling-out").textContent = state.coupling.toFixed(2);
  $("spread-out").textContent = state.spread.toFixed(2);
  $("flash-out").textContent = state.flashLength.toFixed(2);
}

function setStatus(text) {
  $("status").textContent = text;
}

function applyPreset(name) {
  const preset = PRESETS[name];
  if (!preset) return;
  state.coupling = preset.coupling;
  state.spread = preset.spread;
  $("coupling").value = String(preset.coupling);
  $("spread").value = String(preset.spread);
  syncLabels();
  populate(preset.count);
  $("count").value = String(preset.count);
  setStatus(`${name[0].toUpperCase()}${name.slice(1)} preset loaded.`);
}

function bind() {
  $("toggle").addEventListener("click", () => {
    state.running = !state.running;
    $("toggle").textContent = state.running ? "Pause" : "Resume";
    setStatus(state.running ? "Meadow running." : "Meadow paused.");
  });

  $("reset").addEventListener("click", () => {
    populate(state.fireflies.length);
    setStatus("Phases re-scattered.");
  });

  $("count").addEventListener("input", (event) => {
    const count = Number(event.target.value);
    populate(count);
    setStatus(`${count} fireflies in the meadow.`);
  });

  $("coupling").addEventListener("input", (event) => {
    state.coupling = Number(event.target.value);
    syncLabels();
    setStatus(`Coupling ${state.coupling.toFixed(2)} — ${state.coupling > 2.5 ? "chorus weather" : "loose chatter"}.`);
  });

  $("spread").addEventListener("input", (event) => {
    state.spread = Number(event.target.value);
    for (const fly of state.fireflies) fly.omega = (Math.random() - 0.5) * state.spread;
    syncLabels();
    setStatus(`Natural frequency spread ${state.spread.toFixed(2)}.`);
  });

  $("flash").addEventListener("input", (event) => {
    state.flashLength = Number(event.target.value);
    syncLabels();
  });

  document.querySelectorAll(".preset").forEach((button) => {
    button.addEventListener("click", () => applyPreset(button.dataset.preset));
  });

  canvas.addEventListener("pointerdown", (event) => {
    const rect = canvas.getBoundingClientRect();
    const cx = ((event.clientX - rect.left) / rect.width) * W;
    const cy = ((event.clientY - rect.top) / rect.height) * H;
    let startled = 0;
    for (const fly of state.fireflies) {
      if (Math.hypot(fly.x - cx, fly.y - cy) < 110) {
        fly.phase = (fly.phase + 0.5) % 1;
        fly.glow = 0.7;
        startled++;
      }
    }
    draw();
    setStatus(`${startled} fireflies startled out of phase.`);
  });

  window.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
      event.preventDefault();
      $("toggle").click();
    } else if (event.key === "r" || event.key === "R") {
      populate(state.fireflies.length);
      setStatus("Phases re-scattered.");
    }
  });
}

let last = performance.now();

function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (state.running) {
    advance(dt);
    draw();
  }
  requestAnimationFrame(loop);
}

function init() {
  syncLabels();
  bind();
  populate(220);
  draw();
  requestAnimationFrame(loop);
}

init();
