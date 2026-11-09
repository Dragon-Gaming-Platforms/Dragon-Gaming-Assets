"use strict";

// Elementary Automata Lab — Wolfram-style one-dimensional cellular automata.
// A rule number is just an 8-bit lookup table: three neighbour bits index the
// table, and the resulting bit becomes the cell's next state.

const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d", { alpha: false });
const W = (canvas.width = 760);
const H = (canvas.height = 540);

const COLS = 380;
const ROWS = 270;
const CELL = 2;

const state = {
  rule: 30,
  row: new Uint8Array(COLS),
  rowIndex: 0,
  live: 0,
  totalLive: 0,
  running: true,
  speed: 2,
  seed: "single",
  wrap: true,
};

const field = document.createElement("canvas");
field.width = COLS;
field.height = ROWS;
const fctx = field.getContext("2d", { alpha: false });
const image = fctx.createImageData(COLS, ROWS);

const $ = (id) => document.getElementById(id);

function ruleTable(rule) {
  const table = new Uint8Array(8);
  for (let i = 0; i < 8; i++) table[i] = (rule >> i) & 1;
  return table;
}

function clearBuffer() {
  const data = image.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 5;
    data[i + 1] = 6;
    data[i + 2] = 12;
    data[i + 3] = 255;
  }
  state.rowIndex = 0;
  state.live = 0;
  state.totalLive = 0;
}

function seedRow() {
  state.row.fill(0);
  if (state.seed === "random") {
    for (let i = 0; i < COLS; i++) state.row[i] = Math.random() < 0.5 ? 1 : 0;
  } else if (state.seed === "pair") {
    state.row[(COLS / 2) | 0] = 1;
    state.row[((COLS / 2) | 0) + 4] = 1;
  } else {
    state.row[(COLS / 2) | 0] = 1;
  }
}

function paintRow(values) {
  const data = image.data;
  let y = state.rowIndex;
  if (y >= ROWS) {
    // Scroll the whole field up by one generation.
    data.copyWithin(0, COLS * 4);
    y = ROWS - 1;
    state.rowIndex = y;
  }
  let live = 0;
  for (let x = 0; x < COLS; x++) {
    const on = values[x] === 1;
    if (on) live++;
    const p = (y * COLS + x) * 4;
    if (on) {
      // Warm rule-30 gold with a faint vertical gradient by age.
      const age = y / ROWS;
      data[p] = 255;
      data[p + 1] = 190 + Math.round(40 * age);
      data[p + 2] = 90 + Math.round(90 * age);
    } else {
      data[p] = 5;
      data[p + 1] = 6;
      data[p + 2] = 12;
    }
    data[p + 3] = 255;
  }
  state.live = live;
  state.totalLive += live;
  state.rowIndex = y + 1;
}

function commit() {
  fctx.putImageData(image, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(field, 0, 0, W, H);
  drawFrame();
  $("live-read").textContent = `${state.live} live`;
  $("rule-read").textContent = `rule ${state.rule}`;
}

function drawFrame() {
  ctx.strokeStyle = "rgba(255, 209, 102, 0.12)";
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, W - 1, H - 1);
}

function nextRow() {
  const table = ruleTable(state.rule);
  const current = state.row;
  const next = new Uint8Array(COLS);
  for (let x = 0; x < COLS; x++) {
    const left = state.wrap ? current[(x - 1 + COLS) % COLS] : x > 0 ? current[x - 1] : 0;
    const centre = current[x];
    const right = state.wrap ? current[(x + 1) % COLS] : x < COLS - 1 ? current[x + 1] : 0;
    next[x] = table[(left << 2) | (centre << 1) | right];
  }
  state.row = next;
  paintRow(next);
}

function advance(rows = 1) {
  for (let i = 0; i < rows; i++) nextRow();
  commit();
}

function restart() {
  clearBuffer();
  seedRow();
  state.rowIndex = 0;
  paintRow(state.row);
  commit();
  setStatus(`Rule ${state.rule} from ${state.seed} seed.`);
}

function setRule(rule) {
  state.rule = Math.max(0, Math.min(255, rule));
  $("rule").value = String(state.rule);
  $("rule-out").textContent = String(state.rule);
  const bits = state.rule.toString(2).padStart(8, "0");
  $("bits").textContent = `${state.rule} = ${bits}₂ · ${[
    "111",
    "110",
    "101",
    "100",
    "011",
    "010",
    "001",
    "000",
  ]
    .map((pattern, i) => `${pattern}→${(state.rule >> (7 - i)) & 1}`)
    .join(" ")}`;
  restart();
}

function setStatus(text) {
  $("status").textContent = text;
}

function syncLabels() {
  $("rule-out").textContent = String(state.rule);
  $("speed-out").textContent = String(state.speed);
}

function bind() {
  $("toggle").addEventListener("click", () => {
    state.running = !state.running;
    $("toggle").textContent = state.running ? "Pause" : "Resume";
    setStatus(state.running ? `Rule ${state.rule} running.` : "Simulation paused.");
  });

  $("step").addEventListener("click", () => {
    advance(1);
    setStatus(`Stepped to generation ${state.rowIndex - 1}.`);
  });

  $("reset").addEventListener("click", restart);

  $("rule").addEventListener("input", (event) => setRule(Number(event.target.value)));

  $("speed").addEventListener("input", (event) => {
    state.speed = Number(event.target.value);
    syncLabels();
  });

  $("seed").addEventListener("change", (event) => {
    state.seed = event.target.value;
    restart();
  });

  $("wrap").addEventListener("change", (event) => {
    state.wrap = event.target.checked;
    setStatus(state.wrap ? "Edges wrap around." : "Edges use fixed empty cells.");
  });

  document.querySelectorAll(".preset").forEach((button) => {
    button.addEventListener("click", () => {
      setRule(Number(button.dataset.rule));
      setStatus(`Preset rule ${state.rule} loaded.`);
    });
  });

  window.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
      event.preventDefault();
      $("toggle").click();
    } else if (event.key === "s" || event.key === "S") {
      advance(1);
    } else if (event.key === "r" || event.key === "R") {
      restart();
    }
  });
}

let last = performance.now();
let accumulator = 0;

function loop(now) {
  const dt = Math.min(120, now - last);
  last = now;
  if (state.running) {
    accumulator += dt;
    let rows = 0;
    while (accumulator > 90 && rows < state.speed * 3) {
      nextRow();
      rows++;
      accumulator -= 90;
    }
    if (rows) commit();
  }
  requestAnimationFrame(loop);
}

function init() {
  syncLabels();
  bind();
  clearBuffer();
  setRule(30);
  requestAnimationFrame(loop);
}

init();
