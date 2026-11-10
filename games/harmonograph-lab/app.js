"use strict";

// Harmonograph Lab — a drawing machine built from four damped pendulums.
// x(t) = A1·sin(f1·t + p1)·e^(-d1·t) + A2·sin(f2·t + p2)·e^(-d2·t)
// and the same form on y. The curve is sampled and stroked incrementally.

const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");
const W = (canvas.width = 720);
const H = (canvas.height = 600);
const CX = W / 2;
const CY = H / 2;
const MAX_SAMPLES = 26000;

const PRESETS = {
  classic: {
    fx: [3, 2], fy: [3, 2], px: [0, Math.PI / 2], py: [Math.PI / 2, 0],
    damping: 0.006, label: "Classic 3:2 · 3:2 figure drawing.",
  },
  butterfly: {
    fx: [5, 4], fy: [3, 4], px: [0, Math.PI / 3], py: [Math.PI / 5, 0],
    damping: 0.009, label: "Butterfly 5:4 · 3:4 figure drawing.",
  },
  web: {
    fx: [7, 6], fy: [6, 5], px: [0, Math.PI / 7], py: [Math.PI / 3, 0],
    damping: 0.004, label: "Web 7:6 · 6:5 figure drawing.",
  },
  rose: {
    fx: [4, 3], fy: [4, 3], px: [Math.PI / 4, 0], py: [0, Math.PI / 4],
    damping: 0.005, label: "Rose 4:3 · 4:3 figure drawing.",
  },
  orbit: {
    fx: [2, 1], fy: [3, 1], px: [0, 0.4], py: [Math.PI / 2, 0],
    damping: 0.003, label: "Orbit 2:1 · 3:1 figure drawing.",
  },
  chaos: {
    fx: [13, 11], fy: [12, 10], px: [0, 1.1], py: [0.7, 0],
    damping: 0.002, label: "Beat 13:11 · 12:10 figure drawing.",
  },
};

const state = {
  preset: "classic",
  fx: [3, 2],
  fy: [3, 2],
  px: [0, Math.PI / 2],
  py: [Math.PI / 2, 0],
  damping: 0.006,
  speed: 1,
  weight: 1.2,
  fadeTail: false,
  running: true,
  t: 0,
  samples: 0,
  points: [],
  energy: 1,
  done: false,
};

const $ = (id) => document.getElementById(id);

function sample(t) {
  const decay = Math.exp(-state.damping * t * 12);
  const x =
    Math.sin(state.fx[0] * t + state.px[0]) * 0.58 +
    Math.sin(state.fx[1] * t + state.px[1]) * 0.42;
  const y =
    Math.sin(state.fy[0] * t + state.py[0]) * 0.58 +
    Math.sin(state.fy[1] * t + state.py[1]) * 0.42;
  return {
    x: CX + x * (W * 0.44) * decay,
    y: CY + y * (H * 0.42) * decay,
    energy: decay,
  };
}

function beginDrawing() {
  state.t = 0;
  state.samples = 0;
  state.points = [];
  state.energy = 1;
  state.done = false;
  ctx.fillStyle = "#07050d";
  ctx.fillRect(0, 0, W, H);
  drawGrid();
  updateHud();
  setStatus(PRESETS[state.preset].label);
}

function drawGrid() {
  ctx.strokeStyle = "rgba(255, 169, 212, 0.045)";
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
}

function step() {
  // Advance time in small increments so the curve stays smooth at any speed.
  const stepSize = 0.0016 * state.speed * 6;
  const point = sample(state.t);
  state.points.push(point);
  state.t += stepSize;
  state.samples = state.points.length;
  state.energy = point.energy;

  if (state.fadeTail) {
    // Repaint the whole figure with a slightly lower alpha to build a glow.
    ctx.fillStyle = "rgba(7, 5, 13, 0.035)";
    ctx.fillRect(0, 0, W, H);
  }

  if (state.points.length > 1) {
    const previous = state.points[state.points.length - 2];
    const hue = 320 - (point.energy * 90);
    ctx.strokeStyle = `hsla(${hue}, 92%, 74%, ${0.32 + point.energy * 0.6})`;
    ctx.lineWidth = state.weight;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(previous.x, previous.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  }

  if (state.points.length > MAX_SAMPLES || state.energy < 0.004) {
    state.running = false;
    state.done = true;
    $("toggle").textContent = "Resume";
    setStatus(`${PRESETS[state.preset].label.replace("drawing.", "complete.")} ${format(state.samples)} samples.`);
  }
  updateHud();
}

function format(value) {
  return value.toLocaleString("en-US");
}

function updateHud() {
  $("samples-read").textContent = `${format(state.samples)} samples`;
  $("ratio-read").textContent = `${state.fx[0]}:${state.fx[1]} · ${state.fy[0]}:${state.fy[1]}`;
}

function applyPreset(name) {
  const preset = PRESETS[name];
  if (!preset) return;
  state.preset = name;
  state.fx = [...preset.fx];
  state.fy = [...preset.fy];
  state.px = [...preset.px];
  state.py = [...preset.py];
  state.damping = preset.damping;
  $("damping").value = String(Math.round(preset.damping * 1000));
  syncLabels();
  beginDrawing();
  state.running = true;
  $("toggle").textContent = "Pause";
}

function setStatus(text) {
  $("status").textContent = text;
}

function syncLabels() {
  $("damping-out").textContent = `${(state.damping * 100).toFixed(1)}%`;
  $("speed-out").textContent = `${state.speed.toFixed(1)}×`;
  $("weight-out").textContent = state.weight.toFixed(1);
}

function bind() {
  $("toggle").addEventListener("click", () => {
    if (state.done) {
      beginDrawing();
      state.running = true;
      $("toggle").textContent = "Pause";
      setStatus(PRESETS[state.preset].label);
      return;
    }
    state.running = !state.running;
    $("toggle").textContent = state.running ? "Pause" : "Resume";
    setStatus(state.running ? "Tracing." : "Paused mid-stroke.");
  });

  $("restart").addEventListener("click", () => {
    beginDrawing();
    state.running = true;
    $("toggle").textContent = "Pause";
  });

  $("damping").addEventListener("input", (event) => {
    state.damping = Number(event.target.value) / 1000;
    syncLabels();
    beginDrawing();
    state.running = true;
    $("toggle").textContent = "Pause";
  });

  $("speed").addEventListener("input", (event) => {
    state.speed = Number(event.target.value);
    syncLabels();
  });

  $("weight").addEventListener("input", (event) => {
    state.weight = Number(event.target.value);
    syncLabels();
  });

  $("fade").addEventListener("change", (event) => {
    state.fadeTail = event.target.checked;
  });

  document.querySelectorAll(".preset").forEach((button) => {
    button.addEventListener("click", () => applyPreset(button.dataset.preset));
  });

  canvas.addEventListener("pointerdown", (event) => {
    const rect = canvas.getBoundingClientRect();
    // Nudge the phase of the second y-pendulum based on where you clicked.
    state.py[1] = ((event.clientX - rect.left) / rect.width) * Math.PI * 2;
    state.px[1] = ((event.clientY - rect.top) / rect.height) * Math.PI * 2;
    beginDrawing();
    state.running = true;
    $("toggle").textContent = "Pause";
    setStatus("Phases retuned from your click — redrawing.");
  });

  window.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
      event.preventDefault();
      $("toggle").click();
    } else if (event.key === "r" || event.key === "R") {
      beginDrawing();
      state.running = true;
      $("toggle").textContent = "Pause";
    } else if (event.key === "s" || event.key === "S") {
      savePng();
    }
  });
}

function savePng() {
  if (typeof canvas.toDataURL !== "function") return;
  try {
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `harmonograph-${state.preset}.png`;
    link.click();
    setStatus("Saved the current figure as a PNG.");
  } catch (error) {
    setStatus("Could not export this canvas in the current browser.");
  }
}

let last = performance.now();

function loop(now) {
  const dt = now - last;
  last = now;
  if (state.running) {
    // Smooth sampling independent of frame time, bounded for slow devices.
    const strokes = Math.max(1, Math.min(40, Math.round(dt * 0.9)));
    for (let i = 0; i < strokes; i++) step();
  }
  requestAnimationFrame(loop);
}

function init() {
  syncLabels();
  bind();
  applyPreset("classic");
  requestAnimationFrame(loop);
}

init();
