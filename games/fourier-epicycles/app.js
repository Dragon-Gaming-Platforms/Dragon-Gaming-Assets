"use strict";

// Fourier Epicycles Lab — a drawn closed curve becomes a chain of rotating
// vectors. The discrete Fourier transform gives each vector a frequency,
// amplitude and phase; summing the largest ones rebuilds the outline.

const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");
const W = (canvas.width = 720);
const H = (canvas.height = 560);
const CX = W / 2;
const CY = H / 2;
const N = 128;
const TAU = Math.PI * 2;

const state = {
  points: [],
  terms: [],
  selected: [],
  harmonics: 48,
  speed: 1,
  running: true,
  showCircles: true,
  progress: 0,
  trail: [],
  error: 0,
};

const $ = (id) => document.getElementById(id);

function resample(raw, count = N) {
  if (raw.length < 2) return [];
  const lengths = [0];
  let total = 0;
  for (let i = 1; i < raw.length; i++) {
    total += Math.hypot(raw[i].x - raw[i - 1].x, raw[i].y - raw[i - 1].y);
    lengths.push(total);
  }
  if (total === 0) return [];

  const out = [];
  let cursor = 0;
  for (let i = 0; i < count; i++) {
    const target = (i / count) * total;
    while (cursor < lengths.length - 1 && lengths[cursor + 1] < target) cursor++;
    const a = raw[cursor];
    const b = raw[Math.min(cursor + 1, raw.length - 1)];
    const span = lengths[Math.min(cursor + 1, lengths.length - 1)] - lengths[cursor];
    const t = span > 0 ? (target - lengths[cursor]) / span : 0;
    out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
  }
  return out;
}

function polygon(points) {
  const raw = [];
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    const steps = 16;
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      raw.push({ x: a[0] + (b[0] - a[0]) * t, y: a[1] + (b[1] - a[1]) * t });
    }
  }
  return resample(raw);
}

const PRESETS = {
  triangle: () => {
    const pts = [];
    for (let i = 0; i < 3; i++) {
      const a = -Math.PI / 2 + (i / 3) * TAU;
      pts.push([Math.cos(a) * 185, Math.sin(a) * 185]);
    }
    return polygon(pts);
  },
  square: () => {
    const pts = [];
    for (let i = 0; i < 4; i++) {
      const a = Math.PI / 4 + (i / 4) * TAU;
      pts.push([Math.cos(a) * 168, Math.sin(a) * 168]);
    }
    return polygon(pts);
  },
  star: () => {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i / 10) * TAU;
      const r = i % 2 === 0 ? 185 : 74;
      pts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    return polygon(pts);
  },
  heart: () => {
    const raw = [];
    for (let i = 0; i < 320; i++) {
      const t = (i / 320) * TAU;
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      raw.push({ x: x * 11, y: y * 11 });
    }
    return resample(raw);
  },
};

// Discrete Fourier transform over the complex samples z = x + iy.
function analyse(points) {
  const count = points.length;
  const cx = points.reduce((sum, p) => sum + p.x, 0) / count;
  const cy = points.reduce((sum, p) => sum + p.y, 0) / count;

  const terms = [];
  for (let k = 0; k < count; k++) {
    const freq = k <= count / 2 ? k : k - count;
    let re = 0;
    let im = 0;
    for (let n = 0; n < count; n++) {
      const angle = (-TAU * k * n) / count;
      const px = points[n].x - cx;
      const py = points[n].y - cy;
      re += px * Math.cos(angle) - py * Math.sin(angle);
      im += px * Math.sin(angle) + py * Math.cos(angle);
    }
    re /= count;
    im /= count;
    terms.push({ freq, amp: Math.hypot(re, im), phase: Math.atan2(im, re) });
  }
  terms.sort((a, b) => b.amp - a.amp);
  return { terms, cx, cy };
}

function reconstruct(terms, progress) {
  let x = 0;
  let y = 0;
  for (const term of terms) {
    const angle = TAU * term.freq * progress + term.phase;
    x += Math.cos(angle) * term.amp;
    y += Math.sin(angle) * term.amp;
  }
  return { x, y };
}

function measureError(terms) {
  const samples = 96;
  const count = state.points.length;
  const cx = state.centreX || 0;
  const cy = state.centreY || 0;
  let sum = 0;
  let scale = 1;
  for (let i = 0; i < samples; i++) {
    const progress = i / samples;
    const point = reconstruct(terms, progress);
    const target = state.points[Math.round(progress * count) % count];
    sum += Math.hypot(point.x - (target.x - cx), point.y - (target.y - cy));
    scale = Math.max(scale, Math.hypot(target.x - cx, target.y - cy));
  }
  return sum / samples / scale;
}

function rebuild() {
  if (!state.points.length) return;
  const { terms, cx, cy } = analyse(state.points);
  state.centreX = cx;
  state.centreY = cy;
  state.terms = terms;
  state.selected = terms.slice(0, Math.min(state.harmonics, terms.length));
  state.error = measureError(state.selected);
  state.trail = [];
  state.progress = 0;

  $("terms-read").textContent = `${state.selected.length} terms`;
  $("error-read").textContent = `error ${state.error.toFixed(3)}`;
}

function loadPreset(name) {
  const build = PRESETS[name];
  if (!build) return;
  state.points = build();
  state.name = name;
  rebuild();
  setStatus(`${name[0].toUpperCase()}${name.slice(1)} preset loaded — ${state.selected.length} harmonics.`);
}

function setStatus(text) {
  $("status").textContent = text;
}

function draw() {
  ctx.fillStyle = "#05080e";
  ctx.fillRect(0, 0, W, H);

  // faint polar grid
  ctx.strokeStyle = "rgba(138, 215, 255, 0.06)";
  ctx.lineWidth = 1;
  for (let r = 80; r < 260; r += 60) {
    ctx.beginPath();
    ctx.arc(CX, CY, r, 0, TAU);
    ctx.stroke();
  }

  // target outline
  if (state.points.length) {
    ctx.strokeStyle = "rgba(138, 215, 255, 0.22)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    state.points.forEach((p, i) => {
      const x = CX + (p.x - state.centreX);
      const y = CY + (p.y - state.centreY);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.stroke();
  }

  // epicycle chain
  let x = CX;
  let y = CY;
  if (state.selected.length) {
    for (const term of state.selected) {
      const angle = TAU * term.freq * state.progress + term.phase;
      const nx = x + Math.cos(angle) * term.amp;
      const ny = y + Math.sin(angle) * term.amp;
      if (state.showCircles && term.amp > 1.2) {
        ctx.strokeStyle = `rgba(138, 215, 255, ${Math.min(0.28, 0.02 + term.amp / 360)})`;
        ctx.beginPath();
        ctx.arc(x, y, term.amp, 0, TAU);
        ctx.stroke();
        ctx.strokeStyle = `rgba(255, 210, 120, ${Math.min(0.5, 0.08 + term.amp / 200)})`;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(nx, ny);
        ctx.stroke();
      }
      x = nx;
      y = ny;
    }
  }

  // traced path
  if (state.trail.length > 1) {
    ctx.strokeStyle = "#ffd278";
    ctx.lineWidth = 2;
    ctx.beginPath();
    state.trail.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
  }

  ctx.fillStyle = "#ffe6ac";
  ctx.beginPath();
  ctx.arc(x, y, 3.2, 0, TAU);
  ctx.fill();

  ctx.fillStyle = "#7f8ba0";
  ctx.font = "11px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.fillText(`harmonics ${state.selected.length} / ${state.terms.length}`, 14, H - 14);
  ctx.fillText(`residual ${(state.error * 100).toFixed(1)}%`, 14, H - 30);
}

function syncLabels() {
  $("harmonics-out").textContent = String(state.harmonics);
  $("speed-out").textContent = `${state.speed.toFixed(1)}×`;
}

function bind() {
  $("toggle").addEventListener("click", () => {
    state.running = !state.running;
    $("toggle").textContent = state.running ? "Pause" : "Resume";
    setStatus(state.running ? "Reconstruction running." : "Reconstruction paused.");
  });

  $("clear").addEventListener("click", () => {
    state.points = [];
    state.terms = [];
    state.selected = [];
    state.trail = [];
    state.progress = 0;
    state.error = 0;
    $("terms-read").textContent = "0 terms";
    $("error-read").textContent = "error 0.000";
    draw();
    setStatus("Canvas cleared — drag to draw a closed curve.");
  });

  $("harmonics").addEventListener("input", (event) => {
    state.harmonics = Number(event.target.value);
    syncLabels();
    rebuild();
    draw();
    setStatus(`${state.harmonics} harmonics — residual ${(state.error * 100).toFixed(1)}%.`);
  });

  $("speed").addEventListener("input", (event) => {
    state.speed = Number(event.target.value);
    syncLabels();
  });

  $("circles").addEventListener("change", (event) => {
    state.showCircles = event.target.checked;
  });

  document.querySelectorAll(".preset").forEach((button) => {
    button.addEventListener("click", () => loadPreset(button.dataset.preset));
  });

  let drawing = false;
  let raw = [];
  canvas.addEventListener("pointerdown", (event) => {
    drawing = true;
    raw = [];
    const rect = canvas.getBoundingClientRect();
    raw.push({
      x: ((event.clientX - rect.left) / rect.width) * W - CX,
      y: ((event.clientY - rect.top) / rect.height) * H - CY,
    });
    canvas.setPointerCapture?.(event.pointerId);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!drawing) return;
    const rect = canvas.getBoundingClientRect();
    raw.push({
      x: ((event.clientX - rect.left) / rect.width) * W - CX,
      y: ((event.clientY - rect.top) / rect.height) * H - CY,
    });
  });

  const finish = () => {
    if (!drawing) return;
    drawing = false;
    if (raw.length < 8) {
      setStatus("That stroke was too short — draw a longer closed shape.");
      return;
    }
    // Close the loop, then resample to a fixed number of points.
    raw.push({ ...raw[0] });
    const points = resample(raw);
    if (points.length < 8) return;
    state.points = points;
    rebuild();
    draw();
    setStatus(`Custom curve loaded — ${state.selected.length} harmonics, residual ${(state.error * 100).toFixed(1)}%.`);
  };

  canvas.addEventListener("pointerup", finish);
  canvas.addEventListener("pointercancel", finish);
  canvas.addEventListener("pointerleave", finish);

  window.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
      event.preventDefault();
      $("toggle").click();
    } else if (event.key === "c" || event.key === "C") {
      $("clear").click();
    }
  });
}

let last = performance.now();

function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  if (state.running && state.selected.length) {
    state.progress = (state.progress + dt * 0.22 * state.speed) % 1;
    const tip = reconstruct(state.selected, state.progress);
    state.trail.push({ x: CX + tip.x, y: CY + tip.y });
    if (state.trail.length > 900) state.trail.shift();

    // Restart the traced outline once the cycle completes.
    if (state.progress < 0.01 && state.trail.length > 40) state.trail = [];
    draw();
  }
  requestAnimationFrame(loop);
}

function init() {
  syncLabels();
  bind();

  state.centreX = 0;
  state.centreY = 0;
  loadPreset("triangle");
  draw();
  requestAnimationFrame(loop);
}

init();
