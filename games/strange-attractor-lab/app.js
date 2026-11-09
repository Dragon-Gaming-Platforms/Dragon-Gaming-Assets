"use strict";

// Strange Attractor Lab — continuous flows integrated with RK4 and iterated
// two-dimensional maps, projected onto a canvas with a rotatable camera.

const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");
const W = (canvas.width = 760);
const H = (canvas.height = 540);
const CX = W / 2;
const CY = H / 2;

const SYSTEMS = {
  lorenz: {
    dim: 3,
    dt: 0.004,
    steps: 1,
    label: "Lorenz system running — σ 10, ρ 28, β 8/3.",
    start: () => [0.1, 0, 0],
    step([x, y, z]) {
      return [10 * (y - x), x * (28 - z) - y, x * y - (8 / 3) * z];
    },
    hue: 268,
  },
  rossler: {
    dim: 3,
    dt: 0.014,
    steps: 1,
    label: "Rössler system running — a 0.2, b 0.2, c 5.7.",
    start: () => [0.1, 0.1, 0.1],
    step([x, y, z]) {
      return [-y - z, x + 0.2 * y, 0.2 + z * (x - 5.7)];
    },
    hue: 205,
  },
  thomas: {
    dim: 3,
    dt: 0.04,
    steps: 2,
    label: "Thomas system running — a cyclically symmetric labyrinth.",
    start: () => [0.1, 0, 0],
    step([x, y, z]) {
      return [Math.sin(y) - 0.19 * x, Math.sin(z) - 0.19 * y, Math.sin(x) - 0.19 * z];
    },
    hue: 145,
  },
  aizawa: {
    dim: 3,
    dt: 0.008,
    steps: 2,
    label: "Aizawa system running — a shell threaded through a chaotic core.",
    start: () => [0.1, 0, 0],
    step([x, y, z]) {
      const dx = (z - 0.7) * x - 3.5 * y;
      const dy = 3.5 * x + (z - 0.7) * y;
      const dz =
        0.6 +
        0.95 * z -
        (z * z * z) / 3 -
        (x * x + y * y) * (1 + 0.25 * z) +
        0.1 * z * x * x * x;
      return [dx, dy, dz];
    },
    hue: 35,
  },
  clifford: {
    dim: 2,
    map: true,
    label: "Clifford map running — a −1.4, b 1.6, c 1.0, d 0.7.",
    start: () => [0.1, 0.1],
    step([x, y]) {
      return [
        Math.sin(-1.4 * y) + 1.0 * Math.cos(-1.4 * x),
        Math.sin(1.6 * x) + 0.7 * Math.cos(1.6 * y),
      ];
    },
    hue: 320,
  },
  dejong: {
    dim: 2,
    map: true,
    label: "De Jong map running — a 1.4, b −2.3, c 2.4, d −2.1.",
    start: () => [0, 0],
    step([x, y]) {
      return [
        Math.sin(1.4 * y) - Math.cos(-2.3 * x),
        Math.sin(2.4 * x) - Math.cos(-2.1 * y),
      ];
    },
    hue: 180,
  },
};

const state = {
  key: "lorenz",
  system: SYSTEMS.lorenz,
  point: [0, 0, 0],
  yaw: -0.6,
  pitch: 0.32,
  scale: 6,
  offsetX: 0,
  offsetY: 0,
  points: 0,
  speed: 6,
  fade: 0.06,
  hueShift: 12,
  running: true,
  hue: 0,
};

const $ = (id) => document.getElementById(id);

function integrate(system, point, dt) {
  if (system.map) return system.step(point);

  const add = (a, b, h) => a.map((v, i) => v + b[i] * h);
  const k1 = system.step(point);
  const k2 = system.step(add(point, k1, dt / 2));
  const k3 = system.step(add(point, k2, dt / 2));
  const k4 = system.step(add(point, k3, dt));
  return point.map((v, i) => v + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
}

function project(point) {
  if (state.system.dim === 2) {
    return { x: point[0], y: point[1] };
  }
  const [x, y, z] = point;
  const cy = Math.cos(state.yaw);
  const sy = Math.sin(state.yaw);
  const rx = x * cy - z * sy;
  const rz = x * sy + z * cy;
  const cp = Math.cos(state.pitch);
  const sp = Math.sin(state.pitch);
  return { x: rx, y: y * cp - rz * sp };
}

function resetCamera() {
  const system = state.system;
  let point = system.start();
  const warmup = system.map ? 400 : 2600;
  const dt = system.dt || 0;

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < warmup; i++) {
    point = integrate(system, point, dt);
    if (i < warmup * 0.35) continue;
    if (point.some((value) => !Number.isFinite(value))) break;
    const p = project(point);
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }

  const spanX = Math.max(1e-6, maxX - minX);
  const spanY = Math.max(1e-6, maxY - minY);
  state.scale = Math.min((W * 0.42) / spanX, (H * 0.42) / spanY);
  state.offsetX = ((minX + maxX) / 2) * state.scale;
  state.offsetY = ((minY + maxY) / 2) * state.scale;
  state.point = point;
  state.hue = 0;
  state.points = 0;
  state.hue = system.hue;

  ctx.fillStyle = "#05060c";
  ctx.fillRect(0, 0, W, H);
  $("points-read").textContent = "0 points";
}

function plot(point) {
  const p = project(point);
  const x = CX + p.x * state.scale - state.offsetX;
  const y = CY - (p.y * state.scale - state.offsetY);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return;
  if (x < -50 || x > W + 50 || y < -50 || y > H + 50) return;

  state.hue = (state.hue + state.hueShift * 0.02) % 360;
  ctx.fillStyle = `hsl(${state.hue} 92% 66%)`;
  ctx.fillRect(x, y, 1.4, 1.4);
  state.points++;
}

function advance() {
  const system = state.system;
  const dt = system.dt || 0;
  for (let i = 0; i < state.speed * (system.steps || 1); i++) {
    state.point = integrate(system, state.point, dt);
    if (state.point.some((value) => !Number.isFinite(value))) {
      state.point = system.start();
      break;
    }
    plot(state.point);
  }
  $("points-read").textContent = `${state.points.toLocaleString()} points`;
  $("rate-read").textContent = `${(state.speed * (system.steps || 1)).toFixed(0)}×`;
}

function drawOverlay() {
  ctx.fillStyle = "rgba(5, 6, 12, 0.82)";
  ctx.fillRect(12, H - 44, 210, 32);
  ctx.fillStyle = "#8d95a8";
  ctx.font = "11px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.fillText(`${state.key.toUpperCase()} · ${state.system.dim}D`, 22, H - 23);
}

function setSystem(key) {
  const system = SYSTEMS[key];
  if (!system) return;
  state.key = key;
  state.system = system;
  state.yaw = -0.6;
  state.pitch = 0.32;
  resetCamera();
  drawOverlay();
  setStatus(system.label);
}

function setStatus(text) {
  $("status").textContent = text;
}

function syncLabels() {
  $("speed-out").textContent = String(state.speed);
  $("fade-out").textContent = `${Math.round(state.fade * 100)}%`;
  $("hue-out").textContent = String(state.hueShift);
}

function bind() {
  $("toggle").addEventListener("click", () => {
    state.running = !state.running;
    $("toggle").textContent = state.running ? "Pause" : "Resume";
    setStatus(state.running ? state.system.label : "Simulation paused — drag the canvas to rotate.");
  });

  $("clear").addEventListener("click", () => {
    resetCamera();
    drawOverlay();
    setStatus(`${state.system.label.replace("running", "restarted")}`);
  });

  $("system").addEventListener("change", (event) => setSystem(event.target.value));

  $("speed").addEventListener("input", (event) => {
    state.speed = Number(event.target.value);
    syncLabels();
  });

  $("fade").addEventListener("input", (event) => {
    state.fade = Number(event.target.value) / 100;
    syncLabels();
  });

  $("hue").addEventListener("input", (event) => {
    state.hueShift = Number(event.target.value);
    syncLabels();
  });

  let dragging = false;
  let lastX = 0;
  let lastY = 0;

  canvas.addEventListener("pointerdown", (event) => {
    dragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
    canvas.setPointerCapture?.(event.pointerId);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    state.yaw += (event.clientX - lastX) * 0.008;
    state.pitch = Math.max(-1.2, Math.min(1.2, state.pitch + (event.clientY - lastY) * 0.006));
    lastX = event.clientX;
    lastY = event.clientY;
    resetCamera();
    drawOverlay();
  });

  const stop = () => {
    dragging = false;
  };
  canvas.addEventListener("pointerup", stop);
  canvas.addEventListener("pointercancel", stop);
  canvas.addEventListener("pointerleave", stop);

  window.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
      event.preventDefault();
      $("toggle").click();
    } else if (event.key === "r" || event.key === "R") {
      $("clear").click();
    }
  });
}

let last = performance.now();

function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  if (state.running) {
    // Fade the canvas so older points look like a glowing plume.
    ctx.fillStyle = `rgba(5, 6, 12, ${state.fade * 0.35 + dt * state.fade})`;
    ctx.fillRect(0, 0, W, H);
    advance();
    drawOverlay();
  }
  requestAnimationFrame(loop);
}

function init() {
  syncLabels();
  bind();
  setSystem("lorenz");
  drawOverlay();
  requestAnimationFrame(loop);
}

init();
