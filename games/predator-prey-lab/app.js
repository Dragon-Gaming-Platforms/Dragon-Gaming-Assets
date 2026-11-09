"use strict";

// Predator & Prey Lab — an agent-based ecosystem on a wrapping meadow.
// Grass regrows, rabbits convert grass into offspring, foxes convert rabbits
// into offspring. Energy budgets make the population cycle emerge on its own.

const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");
const W = (canvas.width = 760);
const H = (canvas.height = 540);

const FIELD_H = 430;
const GRASS = 16;
const GCOLS = Math.ceil(W / GRASS);
const GROWS = Math.ceil(FIELD_H / GRASS);
const HISTORY = 260;
const SEED = 20261017;

const state = {
  rabbits: [],
  foxes: [],
  grass: new Uint8Array(GCOLS * GROWS),
  grassRate: 0.02,
  startRabbits: 120,
  startFoxes: 12,
  speed: 2,
  running: true,
  ticks: 0,
  history: [],
  rng: mulberry32(SEED),
};

const $ = (id) => document.getElementById(id);

function mulberry32(seed) {
  let a = seed >>> 0;
  return function random() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rand(min, max) {
  return min + state.rng() * (max - min);
}

function grassIndex(x, y) {
  const gx = Math.min(GCOLS - 1, Math.max(0, Math.floor(x / GRASS)));
  const gy = Math.min(GROWS - 1, Math.max(0, Math.floor(y / GRASS)));
  return gy * GCOLS + gx;
}

function seedGrass() {
  state.grass.fill(0);
  for (let i = 0; i < state.grass.length; i++) {
    if (state.rng() < 0.55) state.grass[i] = 1;
  }
}

function wrap(value, max) {
  if (value < 0) return value + max;
  if (value >= max) return value - max;
  return value;
}

function spawnRabbit(x, y, energy) {
  return {
    x: x ?? rand(20, W - 20),
    y: y ?? rand(20, FIELD_H - 20),
    energy: energy ?? rand(18, 30),
    cooldown: 0,
  };
}

function spawnFox(x, y, energy) {
  return {
    x: x ?? rand(20, W - 20),
    y: y ?? rand(20, FIELD_H - 20),
    energy: energy ?? rand(30, 48),
    cooldown: 0,
  };
}

function reset() {
  state.rng = mulberry32(SEED);
  seedGrass();
  state.rabbits = [];
  state.foxes = [];
  state.ticks = 0;
  state.history = [];
  for (let i = 0; i < state.startRabbits; i++) state.rabbits.push(spawnRabbit());
  for (let i = 0; i < state.startFoxes; i++) state.foxes.push(spawnFox());
  draw();
  report("Meadow reseeded.");
}

function nearestRabbit(fox) {
  let best = null;
  let bestDist = 70 * 70;
  for (const rabbit of state.rabbits) {
    let dx = rabbit.x - fox.x;
    let dy = rabbit.y - fox.y;
    if (dx > W / 2) dx -= W;
    if (dx < -W / 2) dx += W;
    if (dy > FIELD_H / 2) dy -= FIELD_H;
    if (dy < -FIELD_H / 2) dy += FIELD_H;
    const dist = dx * dx + dy * dy;
    if (dist < bestDist) {
      bestDist = dist;
      best = rabbit;
    }
  }
  return best;
}

function nearestGrass(rabbit) {
  const gx = Math.floor(rabbit.x / GRASS);
  const gy = Math.floor(rabbit.y / GRASS);
  let best = null;
  let bestDist = 16;
  for (let dy = -3; dy <= 3; dy++) {
    for (let dx = -3; dx <= 3; dx++) {
      const cx = (gx + dx + GCOLS) % GCOLS;
      const cy = gy + dy;
      if (cy < 0 || cy >= GROWS) continue;
      if (!state.grass[cy * GCOLS + cx]) continue;
      const dist = dx * dx + dy * dy;
      if (dist < bestDist) {
        bestDist = dist;
        best = { gx: cx, gy: cy, x: cx * GRASS + GRASS / 2, y: cy * GRASS + GRASS / 2 };
      }
    }
  }
  return best;
}

function tick() {
  state.ticks++;

  // Grass regrows into empty cells.
  for (let i = 0; i < state.grass.length; i++) {
    if (!state.grass[i] && state.rng() < state.grassRate) state.grass[i] = 1;
  }

  // Rabbits: graze, wander, breed, starve.
  const rabbits = [];
  const rabbitPopulation = state.rabbits.length;
  let rabbitBirths = 0;
  for (const rabbit of state.rabbits) {
    const target = nearestGrass(rabbit);
    if (target) {
      const dx = target.x - rabbit.x;
      const dy = target.y - rabbit.y;
      const dist = Math.hypot(dx, dy) || 1;
      rabbit.x += (dx / dist) * 2.1;
      rabbit.y += (dy / dist) * 2.1;
      if (dist < 7 && rabbit.energy < 46) {
        state.grass[target.gy * GCOLS + target.gx] = 0;
        rabbit.energy += 9;
      }
    } else {
      rabbit.x = wrap(rabbit.x + rand(-1.8, 1.8), W);
      rabbit.y = wrap(rabbit.y + rand(-1.8, 1.8), FIELD_H);
    }

    rabbit.energy -= 0.45;
    rabbit.cooldown = Math.max(0, rabbit.cooldown - 1);

    if (rabbit.energy > 44 && rabbit.cooldown === 0 && rabbitBirths < 6 && rabbitPopulation + rabbitBirths < 420) {
      rabbit.energy -= 16;
      rabbit.cooldown = 14;
      rabbitBirths++;
      rabbits.push(spawnRabbit(rabbit.x + rand(-7, 7), rabbit.y + rand(-7, 7), 16));
    }

    if (rabbit.energy > 0) rabbits.push(rabbit);
    else {
      const idx = grassIndex(rabbit.x, rabbit.y);
      if (!state.grass[idx] && state.rng() < 0.25) state.grass[idx] = 1;
    }
  }
  state.rabbits = rabbits;

  // Foxes: hunt rabbits, wander, breed, starve.
  const foxes = [];
  const eaten = new Set();
  const foxPopulation = state.foxes.length;
  let foxBirths = 0;
  for (const fox of state.foxes) {
    const prey = nearestRabbit(fox);
    if (prey && !eaten.has(prey)) {
      const dx = prey.x - fox.x;
      const dy = prey.y - fox.y;
      const dist = Math.hypot(dx, dy) || 1;
      fox.x = wrap(fox.x + (dx / dist) * 2.15, W);
      fox.y = wrap(fox.y + (dy / dist) * 2.15, FIELD_H);
      if (dist < 8 && state.rng() < 0.22) {
        eaten.add(prey);
        fox.energy += 26;
      }
    } else {
      fox.x = wrap(fox.x + rand(-2, 2), W);
      fox.y = wrap(fox.y + rand(-2, 2), FIELD_H);
    }

    fox.energy -= 0.75;
    fox.cooldown = Math.max(0, fox.cooldown - 1);

    if (fox.energy > 108 && fox.cooldown === 0 && foxBirths < 2 && foxPopulation + foxBirths < 80) {
      fox.energy -= 44;
      fox.cooldown = 160;
      foxBirths++;
      foxes.push(spawnFox(fox.x + rand(-9, 9), fox.y + rand(-9, 9), 28));
    }

    if (fox.energy > 0) foxes.push(fox);
  }
  state.foxes = foxes;
  state.rabbits = state.rabbits.filter((rabbit) => !eaten.has(rabbit));

  state.history.push({ rabbits: state.rabbits.length, foxes: state.foxes.length });
  if (state.history.length > HISTORY) state.history.shift();
}

function grassCoverage() {
  let green = 0;
  for (let i = 0; i < state.grass.length; i++) if (state.grass[i]) green++;
  return green / state.grass.length;
}

function draw() {
  ctx.fillStyle = "#060b07";
  ctx.fillRect(0, 0, W, H);

  // Meadow cells.
  for (let gy = 0; gy < GROWS; gy++) {
    for (let gx = 0; gx < GCOLS; gx++) {
      if (!state.grass[gy * GCOLS + gx]) continue;
      ctx.fillStyle = "rgba(99, 168, 68, 0.34)";
      ctx.fillRect(gx * GRASS + 3, gy * GRASS + 3, GRASS - 6, GRASS - 6);
    }
  }

  // Rabbits.
  ctx.fillStyle = "#e8f0d8";
  for (const rabbit of state.rabbits) {
    ctx.beginPath();
    ctx.arc(rabbit.x, rabbit.y, 2.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Foxes.
  ctx.fillStyle = "#ff8a5c";
  for (const fox of state.foxes) {
    ctx.beginPath();
    ctx.arc(fox.x, fox.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  drawChart();
}

function drawChart() {
  const top = FIELD_H + 14;
  const height = H - top - 16;
  ctx.fillStyle = "rgba(8, 14, 10, 0.9)";
  ctx.fillRect(0, top - 8, W, H - top + 8);
  ctx.strokeStyle = "#1c2a20";
  ctx.beginPath();
  ctx.moveTo(0, top - 8);
  ctx.lineTo(W, top - 8);
  ctx.stroke();

  ctx.fillStyle = "#7f9180";
  ctx.font = "11px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.fillText("populations", 12, top + 8);

  if (state.history.length < 2) return;

  const max = state.history.reduce((m, point) => Math.max(m, point.rabbits, point.foxes), 10);
  const plot = (key, color) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    state.history.forEach((point, index) => {
      const x = 12 + (index / (HISTORY - 1)) * (W - 24);
      const y = H - 14 - (point[key] / max) * (height - 22);
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  };
  plot("rabbits", "#e8f0d8");
  plot("foxes", "#ff8a5c");

  ctx.fillStyle = "#6f8270";
  ctx.fillText(`peak ${max}`, W - 78, top + 8);
}

function report(message) {
  $("rabbits-read").textContent = `${state.rabbits.length} rabbits`;
  $("foxes-read").textContent = `${state.foxes.length} foxes`;
  $("grass-read").textContent = `${Math.round(grassCoverage() * 100)}% grass`;
  if (message) {
    $("status").textContent = message;
  } else if (state.rabbits.length === 0 && state.foxes.length === 0) {
    $("status").textContent = "The meadow is empty — reseed to start another run.";
  } else if (state.foxes.length === 0) {
    $("status").textContent = "No foxes left; the rabbit population is unbounded.";
  } else if (state.rabbits.length === 0) {
    $("status").textContent = "No rabbits left; the foxes are starving out.";
  } else {
    $("status").textContent = `Tick ${state.ticks}: ${state.rabbits.length} rabbits, ${state.foxes.length} foxes.`;
  }
}

function syncLabels() {
  $("grass-out").textContent = `${(state.grassRate * 100).toFixed(1)}%`;
  $("start-rabbits-out").textContent = String(state.startRabbits);
  $("start-foxes-out").textContent = String(state.startFoxes);
  $("speed-out").textContent = String(state.speed);
}

function bind() {
  $("toggle").addEventListener("click", () => {
    state.running = !state.running;
    $("toggle").textContent = state.running ? "Pause" : "Resume";
    $("status").textContent = state.running ? "Ecosystem running." : "Ecosystem paused.";
  });

  $("reset").addEventListener("click", reset);

  $("grass").addEventListener("input", (event) => {
    state.grassRate = Number(event.target.value) / 1000;
    syncLabels();
    $("status").textContent = `Grass regrowth ${(state.grassRate * 100).toFixed(1)}% per tick.`;
  });

  $("start-rabbits").addEventListener("input", (event) => {
    state.startRabbits = Number(event.target.value);
    syncLabels();
    $("status").textContent = `Next reseed starts with ${state.startRabbits} rabbits.`;
  });

  $("start-foxes").addEventListener("input", (event) => {
    state.startFoxes = Number(event.target.value);
    syncLabels();
    $("status").textContent = `Next reseed starts with ${state.startFoxes} foxes.`;
  });

  $("speed").addEventListener("input", (event) => {
    state.speed = Number(event.target.value);
    syncLabels();
  });

  canvas.addEventListener("pointerdown", (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * W;
    const y = ((event.clientY - rect.top) / rect.height) * H;
    if (y > FIELD_H) return;
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        if (dx * dx + dy * dy > 10) continue;
        const gx = Math.floor(x / GRASS) + dx;
        const gy = Math.floor(y / GRASS) + dy;
        if (gx < 0 || gy < 0 || gx >= GCOLS || gy >= GROWS) continue;
        state.grass[gy * GCOLS + gx] = 1;
      }
    }
    draw();
    $("status").textContent = "Grass patch sown.";
  });

  window.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
      event.preventDefault();
      $("toggle").click();
    } else if (event.key === "r" || event.key === "R") {
      reset();
    }
  });
}

let last = performance.now();

function loop(now) {
  const dt = now - last;
  last = now;
  if (state.running && dt > 0) {
    for (let i = 0; i < state.speed; i++) tick();
    draw();
    report();
  }
  requestAnimationFrame(loop);
}

function init() {
  syncLabels();
  bind();
  reset();
  requestAnimationFrame(loop);
}

init();
