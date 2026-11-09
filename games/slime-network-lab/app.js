"use strict";

// Slime Network Lab — a physarum-inspired transport network.
// Each agent samples the trail field with three sensors, turns toward the
// strongest reading, steps forward, and deposits scent. Scent diffuses and
// decays, so frequently used routes become the visible network.

const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d", { alpha: false });
const W = (canvas.width = 720);
const H = (canvas.height = 480);
const CELLS = W * H;

const trail = new Float32Array(CELLS);
const scratch = new Float32Array(CELLS);
const image = ctx.createImageData(W, H);

const state = {
  agents: [],
  running: true,
  sensorAngle: 34,
  turnAngle: 28,
  decay: 0.04,
  speed: 1,
};

const PRESETS = {
  network: { sensorAngle: 34, turnAngle: 28, decay: 0.04, count: 1400 },
  coral: { sensorAngle: 60, turnAngle: 55, decay: 0.07, count: 2200 },
  veins: { sensorAngle: 20, turnAngle: 14, decay: 0.02, count: 1800 },
};

const $ = (id) => document.getElementById(id);

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function createAgent() {
  return { x: Math.random() * W, y: Math.random() * H, a: Math.random() * Math.PI * 2 };
}

function fillAgents(count) {
  state.agents = Array.from({ length: count }, createAgent);
}

function reset() {
  trail.fill(0);
  fillAgents(state.agents.length || 1400);
  draw();
  setStatus("Field cleared — networks regrow from scratch.");
}

function index(x, y) {
  const cx = x | 0;
  const cy = y | 0;
  if (cx < 0 || cy < 0 || cx >= W || cy >= H) return -1;
  return cy * W + cx;
}

function sense(agent, angleOffset) {
  const a = agent.a + angleOffset;
  const sx = agent.x + Math.cos(a) * 9;
  const sy = agent.y + Math.sin(a) * 9;
  const i = index(sx, sy);
  return i === -1 ? -1 : trail[i];
}

function stepAgent(agent) {
  const sensor = (state.sensorAngle * Math.PI) / 180;
  const turn = (state.turnAngle * Math.PI) / 180;
  const ahead = sense(agent, 0);
  const left = sense(agent, -sensor);
  const right = sense(agent, sensor);

  if (left > ahead && left > right) agent.a -= turn;
  else if (right > ahead && right > left) agent.a += turn;
  else if (ahead < left + right) agent.a += (Math.random() - 0.5) * turn;

  agent.x += Math.cos(agent.a) * 1.15;
  agent.y += Math.sin(agent.a) * 1.15;

  if (agent.x < 0) agent.x += W;
  if (agent.y < 0) agent.y += H;
  if (agent.x >= W) agent.x -= W;
  if (agent.y >= H) agent.y -= H;

  const i = index(agent.x, agent.y);
  if (i !== -1) trail[i] = Math.min(1, trail[i] + 0.22);
}

function diffuse() {
  // Four-neighbour blur followed by decay; edges sample themselves.
  for (let y = 0; y < H; y++) {
    const row = y * W;
    for (let x = 0; x < W; x++) {
      const i = row + x;
      const l = x > 0 ? i - 1 : i;
      const r = x < W - 1 ? i + 1 : i;
      const u = y > 0 ? i - W : i;
      const d = y < H - 1 ? i + W : i;
      scratch[i] = (trail[i] * 0.5 + (trail[l] + trail[r] + trail[u] + trail[d]) * 0.125) * (1 - state.decay);
    }
  }
  trail.set(scratch);
}

function coverage() {
  let lit = 0;
  for (let i = 0; i < CELLS; i += 7) if (trail[i] > 0.06) lit++;
  return lit / (CELLS / 7);
}

function draw() {
  const data = image.data;
  for (let i = 0; i < CELLS; i++) {
    const v = Math.min(1, trail[i]);
    const p = i * 4;
    data[p] = 8 + v * 60;
    data[p + 1] = 14 + v * 190;
    data[p + 2] = 20 + v * 140;
    data[p + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
  ctx.strokeStyle = "rgba(125, 226, 163, 0.18)";
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, W - 1, H - 1);
}

function tick() {
  const steps = 1 + state.speed;
  for (let s = 0; s < steps; s++) {
    for (const agent of state.agents) stepAgent(agent);
    diffuse();
  }
  draw();
  $("coverage-read").textContent = `${Math.round(coverage() * 100)}% covered`;
}

function setStatus(text) {
  $("status").textContent = text;
}

function applyPreset(name) {
  const preset = PRESETS[name];
  if (!preset) return;
  Object.assign(state, {
    sensorAngle: preset.sensorAngle,
    turnAngle: preset.turnAngle,
    decay: preset.decay,
  });
  $("sensor").value = String(preset.sensorAngle);
  $("turn").value = String(preset.turnAngle);
  $("decay").value = String(Math.round(preset.decay * 100));
  syncLabels();
  trail.fill(0);
  fillAgents(preset.count);
  $("agents").value = String(preset.count);
  $("agents-read").textContent = `${preset.count} agents`;
  setStatus(`${name[0].toUpperCase()}${name.slice(1)} preset running.`);
}

function syncLabels() {
  $("sensor-out").textContent = `${Math.round(state.sensorAngle)}°`;
  $("turn-out").textContent = `${Math.round(state.turnAngle)}°`;
  $("decay-out").textContent = `${Math.round(state.decay * 100)}%`;
  $("speed-out").textContent = `${state.speed.toFixed(1)}×`;
}

function bind() {
  $("toggle").addEventListener("click", () => {
    state.running = !state.running;
    $("toggle").textContent = state.running ? "Pause" : "Resume";
    setStatus(state.running ? "Simulation running." : "Simulation paused — change a parameter, then resume.");
  });

  $("reset").addEventListener("click", reset);

  $("agents").addEventListener("input", (event) => {
    const count = Number(event.target.value);
    fillAgents(count);
    $("agents-out").textContent = String(count);
    $("agents-read").textContent = `${count} agents`;
    setStatus(`Population set to ${count} agents.`);
  });

  $("sensor").addEventListener("input", (event) => {
    state.sensorAngle = Number(event.target.value);
    syncLabels();
  });

  $("turn").addEventListener("input", (event) => {
    state.turnAngle = Number(event.target.value);
    syncLabels();
  });

  $("decay").addEventListener("input", (event) => {
    state.decay = Number(event.target.value) / 100;
    syncLabels();
  });

  $("speed").addEventListener("input", (event) => {
    state.speed = Number(event.target.value);
    syncLabels();
  });

  document.querySelectorAll(".preset").forEach((button) => {
    button.addEventListener("click", () => applyPreset(button.dataset.preset));
  });

  canvas.addEventListener("pointerdown", (event) => {
    const rect = canvas.getBoundingClientRect();
    const cx = ((event.clientX - rect.left) / rect.width) * W;
    const cy = ((event.clientY - rect.top) / rect.height) * H;
    for (let i = 0; i < 1200; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * 26;
      const px = (cx + Math.cos(a) * r) | 0;
      const py = (cy + Math.sin(a) * r) | 0;
      const idx = index(px, py);
      if (idx !== -1) trail[idx] = 1;
    }
    draw();
    setStatus("Food cluster placed — nearby foragers will converge.");
  });

  window.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
      event.preventDefault();
      $("toggle").click();
    }
    if (event.key === "r" || event.key === "R") reset();
  });
}

let last = performance.now();
let frames = 0;
let lastStat = last;

function loop(now) {
  const dt = now - last;
  last = now;
  if (state.running && dt < 120) tick();

  frames++;
  if (now - lastStat > 1000) {
    lastStat = now;
    frames = 0;
  }
  requestAnimationFrame(loop);
}

function init() {
  fillAgents(1400);
  syncLabels();
  $("agents-read").textContent = "1400 agents";
  $("coverage-read").textContent = "0% covered";
  setStatus("Network preset running.");
  bind();
  draw();
  requestAnimationFrame(loop);
}

init();
