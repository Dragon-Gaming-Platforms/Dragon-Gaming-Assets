"use strict";

// Traffic Flow Lab — Nagel-Schreckenberg traffic on a single-lane ring.
// Each tick every car (1) speeds up, (2) brakes for the car ahead,
// (3) randomly slows with probability p, and (4) advances.

const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");
const W = (canvas.width = 880);
const H = (canvas.height = 420);

const ROAD_Y = 150;
const LANE_H = 78;
const HISTORY = 220;

const state = {
  length: 160,
  cells: [],
  speeds: [],
  running: true,
  density: 0.28,
  brake: 0.15,
  limit: 5,
  speed: 2,
  step: 0,
  history: [],
  flow: 0,
};

const $ = (id) => document.getElementById(id);

function totalCars() {
  return state.cells.reduce((sum, car) => sum + (car ? 1 : 0), 0);
}

function seed() {
  const n = Math.max(5, Math.round(state.length * state.density));
  state.cells = new Array(state.length).fill(false);
  const slots = [];
  for (let i = 0; i < state.length; i++) slots.push(i);
  for (let i = slots.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [slots[i], slots[j]] = [slots[j], slots[i]];
  }
  for (let i = 0; i < n; i++) state.cells[slots[i]] = true;
  state.speeds = new Array(state.length).fill(0).map(() => Math.floor(Math.random() * state.limit));
  state.step = 0;
  state.history = [];
  state.flow = 0;
  draw();
  report("Ring road reseeded.");
}

function advance() {
  const len = state.length;
  const limit = state.limit;
  const next = new Array(len).fill(false);
  const nextSpeeds = new Array(len).fill(0);

  for (let i = 0; i < len; i++) {
    if (!state.cells[i]) continue;
    let speed = Math.min(state.speeds[i] + 1, limit);

    let gap = 1;
    while (gap < len && !state.cells[(i + gap) % len]) gap++;
    speed = Math.min(speed, Math.max(0, gap - 1));

    if (Math.random() < state.brake) speed = Math.max(0, speed - 1);

    const target = (i + speed) % len;
    next[target] = true;
    nextSpeeds[target] = speed;
  }

  state.cells = next;
  state.speeds = nextSpeeds;
  state.step++;

  const cars = totalCars();
  const moving = state.speeds.reduce((sum, s, i) => sum + (state.cells[i] ? s : 0), 0);
  const avg = cars ? moving / cars : 0;
  state.flow = avg / limit;
  state.history.push(state.flow);
  if (state.history.length > HISTORY) state.history.shift();
  return { cars, avg };
}

function roundRect(x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  // Asphalt band with lane markings.
  ctx.fillStyle = "#0d131c";
  roundRect(28, ROAD_Y, W - 56, LANE_H, 18);
  ctx.fill();
  ctx.strokeStyle = "#22303f";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Ring seam hint, so the road reads as a loop.
  ctx.setLineDash([6, 8]);
  ctx.strokeStyle = "rgba(255, 179, 92, 0.28)";
  ctx.beginPath();
  ctx.moveTo(28, ROAD_Y - 14);
  ctx.lineTo(W - 28, ROAD_Y - 14);
  ctx.stroke();
  ctx.setLineDash([]);

  const cellW = (W - 84) / state.length;
  for (let i = 0; i < state.length; i++) {
    if (!state.cells[i]) continue;
    const speed = state.speeds[i];
    const hue = 38 - Math.min(38, speed * 6);
    ctx.fillStyle = `hsl(${hue} 92% ${52 + Math.min(16, speed * 2)}%)`;
    roundRect(42 + i * cellW, ROAD_Y + 18, Math.max(2.5, cellW - 1.2), LANE_H - 36, 3);
    ctx.fill();
  }

  // Flow chart.
  const chartTop = ROAD_Y + LANE_H + 46;
  const chartH = 96;
  ctx.strokeStyle = "#1b2634";
  ctx.strokeRect(28, chartTop, W - 56, chartH);
  ctx.fillStyle = "#7d8ca2";
  ctx.font = "11px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.fillText("normalized flow", 36, chartTop - 8);

  if (state.history.length > 1) {
    ctx.strokeStyle = "#ffb35c";
    ctx.lineWidth = 2;
    ctx.beginPath();
    state.history.forEach((value, index) => {
      const x = 30 + (index / (HISTORY - 1)) * (W - 60);
      const y = chartTop + chartH - 6 - value * (chartH - 12);
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  // Legend.
  ctx.fillStyle = "#6f7d92";
  ctx.font = "11px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.fillText("cold = slow car · hot = fast car · ring wraps at the right edge", 30, chartTop + chartH + 26);

  $("clock-read").textContent = `step ${state.step}`;
  $("flow-read").textContent = `flow ${state.flow.toFixed(2)}`;
}

function report(message) {
  const cars = totalCars();
  const moving = state.speeds.reduce((sum, s, i) => sum + (state.cells[i] ? s : 0), 0);
  const avg = cars ? moving / cars : 0;
  const stopped = state.speeds.reduce((sum, s, i) => sum + (state.cells[i] && s === 0 ? 1 : 0), 0);

  $("cars-read").textContent = String(cars);
  $("avg-read").textContent = avg.toFixed(2);
  $("stopped-read").textContent = String(stopped);
  $("status").textContent = message || `Step ${state.step}: ${cars} cars, ${Math.round((avg / state.limit) * 100)}% of the speed limit.`;
}

function syncLabels() {
  $("density-out").textContent = state.density.toFixed(2);
  $("brake-out").textContent = state.brake.toFixed(2);
  $("limit-out").textContent = String(state.limit);
  $("speed-out").textContent = `${state.speed}×`;
}

function bind() {
  $("toggle").addEventListener("click", () => {
    state.running = !state.running;
    $("toggle").textContent = state.running ? "Pause" : "Resume";
    report(state.running ? "Traffic flowing." : "Traffic held — step manually or resume.");
  });

  $("step").addEventListener("click", () => {
    advance();
    draw();
    report();
  });

  $("reset").addEventListener("click", seed);

  $("density").addEventListener("input", (event) => {
    state.density = Number(event.target.value);
    syncLabels();
    seed();
    report(`Density set to ${Math.round(state.density * 100)}%.`);
  });

  $("brake").addEventListener("input", (event) => {
    state.brake = Number(event.target.value);
    syncLabels();
    report(`Random braking at ${Math.round(state.brake * 100)}%.`);
  });

  $("limit").addEventListener("input", (event) => {
    state.limit = Number(event.target.value);
    state.speeds = state.speeds.map((s) => Math.min(s, state.limit));
    syncLabels();
    report(`Speed limit set to ${state.limit} cells per tick.`);
  });

  $("speed").addEventListener("input", (event) => {
    state.speed = Number(event.target.value);
    syncLabels();
  });

  window.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
      event.preventDefault();
      $("toggle").click();
    } else if (event.key === "s" || event.key === "S") {
      advance();
      draw();
      report();
    } else if (event.key === "r" || event.key === "R") {
      seed();
    }
  });
}

let accumulator = 0;
let last = performance.now();

function loop(now) {
  const dt = Math.min(200, now - last);
  last = now;

  if (state.running && state.speed > 0) {
    accumulator += dt * state.speed * 0.012;
    let guard = 0;
    while (accumulator >= 1 && guard++ < 8) {
      advance();
      accumulator -= 1;
    }
    if (guard) {
      draw();
      report();
    }
  }
  requestAnimationFrame(loop);
}

function init() {
  syncLabels();
  bind();
  seed();
  report("Ring road seeded at 28% density.");
  requestAnimationFrame(loop);
}

init();
