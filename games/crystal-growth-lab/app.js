"use strict";

// Crystal Growth Lab — diffusion-limited aggregation on a coarse grid.
// Walkers take random steps; when one lands beside the crystal it freezes
// in place with probability `stickiness`, otherwise it keeps wandering.

const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d", { alpha: false });
const W = (canvas.width = 720);
const H = (canvas.height = 540);

const CELL = 3;
const COLS = W / CELL;
const ROWS = H / CELL;
const CX = COLS / 2;
const CY = ROWS / 2;
const SPAWN_RADIUS = Math.min(CX, CY) * 0.96;

const SEED_LABELS = {
  point: "Single point",
  line: "Horizontal line",
  triple: "Three seeds",
};

const PALETTES = {
  ice: { hue: [188, 226], light: [58, 82], sat: 88, background: "#04090d" },
  copper: { hue: [18, 48], light: [52, 78], sat: 92, background: "#0b0705" },
  moss: { hue: [96, 152], light: [46, 74], sat: 74, background: "#050b06" },
};

const state = {
  grid: new Uint8Array(COLS * ROWS),
  shade: new Uint8Array(COLS * ROWS),
  walkers: [],
  mass: 0,
  running: true,
  stickiness: 1,
  targetWalkers: 260,
  speed: 3,
  seedShape: "point",
  palette: "ice",
  radius: SPAWN_RADIUS,
};

const buffer = document.createElement("canvas");
buffer.width = COLS;
buffer.height = ROWS;
const bctx = buffer.getContext("2d");
const frame = bctx.createImageData(COLS, ROWS);

const $ = (id) => document.getElementById(id);

function resetGrid() {
  state.grid.fill(0);
  state.shade.fill(0);
  state.mass = 0;
  state.radius = 22;

  const add = (x, y) => {
    const cx = Math.round(x);
    const cy = Math.round(y);
    if (cx < 0 || cy < 0 || cx >= COLS || cy >= ROWS) return;
    const i = cy * COLS + cx;
    if (state.grid[i]) return;
    state.grid[i] = 1;
    state.mass++;
  };

  if (state.seedShape === "line") {
    for (let x = CX - 42; x <= CX + 42; x++) add(x, CY);
  } else if (state.seedShape === "triple") {
    add(CX, CY);
    add(CX + 52, CY - 34);
    add(CX - 46, CY + 40);
  } else {
    add(CX, CY);
  }

  spawnWalkers(state.targetWalkers);
  paint();
  report("Crystal reset.");
}

function spawnWalkers(count) {
  state.walkers = [];
  for (let i = 0; i < count; i++) state.walkers.push(newWalker());
}

function newWalker() {
  for (let attempt = 0; attempt < 8; attempt++) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.min(SPAWN_RADIUS, state.radius + 1 + Math.random() * 3);
    const x = CX + Math.cos(angle) * r;
    const y = CY + Math.sin(angle) * r;
    if (!occupied(x, y)) return { x, y, age: 0 };
  }
  const angle = Math.random() * Math.PI * 2;
  return { x: CX + Math.cos(angle) * SPAWN_RADIUS, y: CY + Math.sin(angle) * SPAWN_RADIUS, age: 0 };
}

function occupied(x, y) {
  const cx = x | 0;
  const cy = y | 0;
  if (cx < 0 || cy < 0 || cx >= COLS || cy >= ROWS) return false;
  return state.grid[cy * COLS + cx] === 1;
}

function touching(x, y) {
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      if (occupied(x + dx, y + dy)) return true;
    }
  }
  return false;
}

function freeze(walker) {
  const x = walker.x | 0;
  const y = walker.y | 0;
  if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return;
  const i = y * COLS + x;
  if (state.grid[i]) return;
  state.grid[i] = 1;
  state.mass++;
  const dist = Math.hypot(x - CX, y - CY) / SPAWN_RADIUS;
  state.shade[i] = Math.max(0, Math.min(255, Math.round(dist * 255)));
  // Grow the spawn shell so new walkers start beyond the crystal edge.
  state.radius = Math.min(SPAWN_RADIUS, Math.max(state.radius, dist * SPAWN_RADIUS + 2));
}

function stepWalker(walker) {
  walker.age++;
  let dx = 0;
  let dy = 0;
  if (Math.random() < 0.42) {
    // Gentle inward bias keeps the growth rate watchable without erasing
    // the branching that makes diffusion-limited growth interesting.
    if (Math.abs(walker.x - CX) > Math.abs(walker.y - CY)) {
      dx = walker.x > CX ? -1 : 1;
    } else {
      dy = walker.y > CY ? -1 : 1;
    }
  } else {
    const dir = (Math.random() * 4) | 0;
    if (dir === 0) dx = 1;
    else if (dir === 1) dx = -1;
    else if (dir === 2) dy = 1;
    else dy = -1;
  }
  walker.x += dx;
  walker.y += dy;

  if (touching(walker.x, walker.y)) {
    if (Math.random() < state.stickiness) {
      freeze(walker);
      return newWalker();
    }
    // Bounce away so a sticky-but-unlucky walker does not hover on contact.
    walker.x -= (walker.x - CX) * 0.02;
    walker.y -= (walker.y - CY) * 0.02;
  }

  const dist = Math.hypot(walker.x - CX, walker.y - CY);
  if (dist > SPAWN_RADIUS * 1.3 || walker.age > 3000 || dist < 2) {
    return newWalker();
  }
  return walker;
}

function tick() {
  for (let s = 0; s < state.speed; s++) {
    for (let i = 0; i < state.walkers.length; i++) {
      state.walkers[i] = stepWalker(state.walkers[i]);
    }
  }
  paint();
  report();
}

function paint() {
  const palette = PALETTES[state.palette];
  const [h0, h1] = palette.hue;
  const [l0, l1] = palette.light;
  const data = frame.data;
  const [br, bg, bb] = [
    parseInt(palette.background.slice(1, 3), 16),
    parseInt(palette.background.slice(3, 5), 16),
    parseInt(palette.background.slice(5, 7), 16),
  ];

  for (let i = 0; i < state.grid.length; i++) {
    const p = i * 4;
    if (state.grid[i]) {
      const t = state.shade[i] / 255;
      const hue = h0 + (h1 - h0) * t;
      const light = l1 - (l1 - l0) * t;
      const [r, g, b] = hslToRgb(hue / 360, palette.sat / 100, light / 100);
      data[p] = r;
      data[p + 1] = g;
      data[p + 2] = b;
    } else {
      data[p] = br;
      data[p + 1] = bg;
      data[p + 2] = bb;
    }
    data[p + 3] = 255;
  }

  bctx.putImageData(frame, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(buffer, 0, 0, W, H);

  // Walker halo so the particles are visible against the dark field.
  ctx.fillStyle = "rgba(220, 255, 250, 0.55)";
  for (const walker of state.walkers) {
    ctx.fillRect(walker.x * CELL, walker.y * CELL, CELL, CELL);
  }
}

function hslToRgb(h, s, l) {
  const hue2rgb = (p, q, t) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  let r;
  let g;
  let b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function report(message) {
  $("mass-read").textContent = `${state.mass.toLocaleString()} cells`;
  $("walkers-read").textContent = `${state.walkers.length} walkers`;
  if (message) {
    $("status").textContent = message;
  } else {
    const coverage = ((state.mass / (COLS * ROWS)) * 100).toFixed(1);
    $("status").textContent = `${state.mass.toLocaleString()} cells frozen — ${coverage}% of the field.`;
  }
}

function syncLabels() {
  $("stick-out").textContent = `${Math.round(state.stickiness * 100)}%`;
  $("walkers-out").textContent = String(state.targetWalkers);
  $("speed-out").textContent = String(state.speed);
}

function bind() {
  $("toggle").addEventListener("click", () => {
    state.running = !state.running;
    $("toggle").textContent = state.running ? "Pause" : "Resume";
    $("status").textContent = state.running ? "Growth resumed." : "Growth paused.";
  });

  $("reset").addEventListener("click", () => resetGrid());

  $("stick").addEventListener("input", (event) => {
    state.stickiness = Number(event.target.value) / 100;
    syncLabels();
    $("status").textContent = `Stickiness ${Math.round(state.stickiness * 100)}% — ${state.stickiness < 0.5 ? "sparse branches" : "dense crystal"}.`;
  });

  $("walkers").addEventListener("input", (event) => {
    state.targetWalkers = Number(event.target.value);
    syncLabels();
    while (state.walkers.length < state.targetWalkers) state.walkers.push(newWalker());
    if (state.walkers.length > state.targetWalkers) {
      state.walkers.length = state.targetWalkers;
    }
    report();
  });

  $("speed").addEventListener("input", (event) => {
    state.speed = Number(event.target.value);
    syncLabels();
  });

  $("seed").addEventListener("change", (event) => {
    state.seedShape = event.target.value;
    resetGrid();
    $("status").textContent = `Seed shape: ${SEED_LABELS[state.seedShape] || state.seedShape}.`;
  });

  $("palette").addEventListener("change", (event) => {
    state.palette = event.target.value;
    paint();
    report();
  });

  window.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
      event.preventDefault();
      $("toggle").click();
    } else if (event.key === "r" || event.key === "R") {
      resetGrid();
    }
  });
}

let last = performance.now();

function loop(now) {
  const dt = now - last;
  last = now;
  if (state.running && dt > 0) tick();
  requestAnimationFrame(loop);
}

function init() {
  syncLabels();
  bind();
  resetGrid();
  report("Single seed at the centre, 260 walkers.");
  requestAnimationFrame(loop);
}

init();
