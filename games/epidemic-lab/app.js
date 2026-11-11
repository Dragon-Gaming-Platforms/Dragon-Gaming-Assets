(() => {
  "use strict";

  // Epidemic Lab: a stochastic SIR model on a 2D contact lattice. Every cell is
  // one person. Infectious people infect susceptible neighbours, recover after
  // an exponentially distributed infectious period, and wander between cells.
  // With R0 = contactRate × neighbours × period, the shape of the outbreak is
  // determined by a single number.

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");
  const W = canvas.width || 820;
  const H = canvas.height || 600;

  const CELL = 4;
  const COLS = 190;
  const ROWS = 105;
  const GRID_W = COLS * CELL;
  const GRID_H = ROWS * CELL;
  const GRID_X = 12;
  const GRID_Y = 40;

  const CHART_X = 12;
  const CHART_Y = GRID_Y + GRID_H + 22;
  const CHART_W = GRID_W;
  const CHART_H = H - CHART_Y - 16;

  const S = 0;
  const I = 1;
  const R = 2;
  const V = 3;

  const COLOURS = {
    [S]: [148, 168, 180],
    [I]: [255, 176, 84],
    [R]: [94, 209, 148],
    [V]: [52, 96, 84],
  };

  const state = {
    grid: new Uint8Array(COLS * ROWS),
    beta: 0.03,
    period: 40,
    movement: 0.4,
    vaccination: 0,
    running: true,
    time: 0,
    peak: 0,
    everInfected: 0,
    series: [],
    counts: { s: COLS * ROWS, i: 0, r: 0, v: 0 },
    frame: 0,
    lastTime: 0,
    accumulator: 0,
    preset: "flu",
  };

  /* --------------------------------------------------------------- helpers */

  function indexAt(x, y) {
    return y * COLS + x;
  }

  function neighbourIndex(i, direction) {
    const x = i % COLS;
    const y = (i - x) / COLS;
    if (direction === 0) return x === COLS - 1 ? i - COLS + 1 : i + 1;
    if (direction === 1) return y === ROWS - 1 ? i - (ROWS - 1) * COLS : i + COLS;
    if (direction === 2) return x === 0 ? i + COLS - 1 : i - 1;
    return y === 0 ? i + (ROWS - 1) * COLS : i - COLS;
  }

  function resetPopulation(keepCases) {
    const grid = state.grid;
    const vax = state.vaccination;
    for (let i = 0; i < grid.length; i++) {
      grid[i] = Math.random() < vax ? V : S;
    }
    const seeds = keepCases ? 20 : 10;
    let placed = 0;
    let guard = 0;
    while (placed < seeds && guard++ < 50000) {
      const index = (Math.random() * grid.length) | 0;
      if (grid[index] === S) {
        grid[index] = I;
        placed++;
      }
    }
    state.time = 0;
    state.peak = 0;
    state.everInfected = placed;
    state.series = [];
    state.frame = 0;
    recount();
    sampleSeries();
    updateReadouts();
    draw();
  }

  function recount() {
    const grid = state.grid;
    let s = 0;
    let i = 0;
    let r = 0;
    let v = 0;
    for (let k = 0; k < grid.length; k++) {
      const value = grid[k];
      if (value === S) s++;
      else if (value === I) i++;
      else if (value === R) r++;
      else v++;
    }
    state.counts = { s, i, r, v };
    if (i / grid.length > state.peak) state.peak = i / grid.length;
  }

  /* -------------------------------------------------------------- dynamics */

  function stepEpidemic() {
    const grid = state.grid;
    const beta = state.beta;
    const recoverChance = 1 / Math.max(1, state.period);
    const moveChance = state.movement;

    // Infection pass: collect new infections first so a person infected this
    // tick cannot infect anyone else until the next one.
    const newInfections = [];

    for (let i = 0; i < grid.length; i++) {
      if (grid[i] !== I) continue;

      for (let d = 0; d < 4; d++) {
        const j = neighbourIndex(i, d);
        if (grid[j] === S && Math.random() < beta) newInfections.push(j);
      }

      if (Math.random() < recoverChance) grid[i] = R;
    }

    for (const j of newInfections) {
      if (grid[j] === S) {
        grid[j] = I;
        state.everInfected += 1;
      }
    }

    // Movement: infectious people wander so the outbreak is not pinned to the
    // seed cluster. Swapping keeps the population fixed.
    if (moveChance > 0) {
      for (let i = 0; i < grid.length; i++) {
        if (grid[i] !== I) continue;
        if (Math.random() > moveChance) continue;
        const j = neighbourIndex(i, (Math.random() * 4) | 0);
        const other = grid[j];
        if (other === S || other === R || other === V) {
          grid[j] = I;
          grid[i] = other;
        }
      }
    }

    state.time += 1;
    if (state.time % 2 === 0) {
      recount();
      sampleSeries();
    }
  }

  function sampleSeries() {
    const n = state.grid.length;
    const { s, i, r, v } = state.counts;
    state.series.push({ t: state.time, s: s / n, i: i / n, r: (r + v) / n });
    if (state.series.length > 1200) state.series.shift();
  }

  /* ---------------------------------------------------------------- readouts */

  function r0() {
    return state.beta * 4 * state.period;
  }

  function herdThreshold() {
    const value = r0();
    return value <= 1 ? 0 : 1 - 1 / value;
  }

  function updateReadouts() {
    const n = state.grid.length;
    const { s, i, r, v } = state.counts;
    const sharing = `${((i / n) * 100).toFixed(1)}%`;
    el("infected-read").textContent = `${i.toLocaleString("en-US")} infected`;
    el("peak-read").textContent = `peak ${(state.peak * 100).toFixed(1)}% · now ${sharing}`;
    el("r0-read").textContent = `R₀ ${r0().toFixed(1)}`;
    el("s-read").textContent = `${((s / n) * 100).toFixed(0)}%`;
    el("i-read").textContent = `${((i / n) * 100).toFixed(1)}%`;
    el("r-read").textContent = `${(((r + v) / n) * 100).toFixed(0)}%`;
    el("ever-read").textContent = `${((state.everInfected / n) * 100).toFixed(1)}%`;
    el("beta-out").textContent = state.beta.toFixed(3);
    el("period-out").textContent = `${state.period} ticks`;
    el("move-out").textContent = state.movement.toFixed(2);
    el("vax-out").textContent = `${Math.round(state.vaccination * 100)}%`;
  }

  function statusLine() {
    const n = state.grid.length;
    const { i, r, v } = state.counts;
    const infectedShare = i / n;
    const removedShare = (r + v) / n;
    const value = r0();
    let phase;

    if (infectedShare === 0 && state.time === 0) {
      phase = "Population susceptible — no outbreak yet.";
    } else if (infectedShare === 0) {
      phase = `Outbreak over after ${state.time} ticks; ${((state.everInfected / n) * 100).toFixed(1)}% were infected at some point.`;
    } else if (state.time < 12) {
      phase = "Early days: a handful of cases deciding whether to take off.";
    } else if (state.peak - infectedShare < 0.002 && infectedShare > 0.005) {
      phase = "At or near the peak — each case is infecting about one other person.";
    } else if (infectedShare < state.peak * 0.6) {
      phase = "Declining: most contacts now hit people who are already immune.";
    } else {
      phase = "Rising: the outbreak is finding more susceptible people than it loses.";
    }

    const immunity = removedShare >= herdThreshold() && herdThreshold() > 0
      ? ` Herd threshold for R₀ ${value.toFixed(1)} is ${(herdThreshold() * 100).toFixed(0)}% — reached.`
      : ` Herd threshold for R₀ ${value.toFixed(1)} is ${(herdThreshold() * 100).toFixed(0)}%.`;

    return `Tick ${state.time} · ${infectedShare > 0 ? `${(infectedShare * 100).toFixed(1)}% infectious` : "no active cases"} · ${(removedShare * 100).toFixed(0)}% immune. ${phase}${immunity}`;
  }

  function setStatus(text) {
    el("status").textContent = text;
  }

  /* ----------------------------------------------------------------- drawing */

  function drawGrid() {
    const grid = state.grid;
    const cellSize = CELL;

    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const value = grid[y * COLS + x];
        const colour = COLOURS[value] || COLOURS[S];
        ctx.fillStyle = `rgb(${colour[0]}, ${colour[1]}, ${colour[2]})`;
        ctx.fillRect(GRID_X + x * cellSize, GRID_Y + y * cellSize, cellSize, cellSize);
      }
    }

    ctx.strokeStyle = "rgba(143, 178, 201, 0.28)";
    ctx.lineWidth = 1;
    ctx.strokeRect(GRID_X - 0.5, GRID_Y - 0.5, GRID_W + 1, GRID_H + 1);

    ctx.fillStyle = "#86999e";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(`${(COLS * ROWS).toLocaleString("en-US")} people · 4-neighbour contact lattice`, GRID_X, GRID_Y - 10);
    ctx.textAlign = "right";
    ctx.fillText(`tick ${state.time}`, GRID_X + GRID_W, GRID_Y - 10);
    ctx.textAlign = "left";
  }

  function drawChart() {
    ctx.fillStyle = "rgba(8, 13, 16, 0.95)";
    ctx.fillRect(CHART_X, CHART_Y, CHART_W, CHART_H);
    ctx.strokeStyle = "#1f2b30";
    ctx.lineWidth = 1;
    ctx.strokeRect(CHART_X + 0.5, CHART_Y + 0.5, CHART_W, CHART_H);

    const series = state.series;
    if (series.length < 2) return;

    const padL = 34;
    const padB = 16;
    const plotW = CHART_W - padL - 10;
    const plotH = CHART_H - padB - 14;

    for (let g = 1; g <= 3; g++) {
      const y = CHART_Y + 12 + plotH * (1 - g / 4);
      ctx.strokeStyle = "rgba(31, 43, 48, 0.9)";
      ctx.beginPath();
      ctx.moveTo(CHART_X + padL, y);
      ctx.lineTo(CHART_X + padL + plotW, y);
      ctx.stroke();
      ctx.fillStyle = "#5d7075";
      ctx.font = "9px ui-monospace, Menlo, monospace";
      ctx.textAlign = "right";
      ctx.fillText(`${g * 25}%`, CHART_X + padL - 5, y + 3);
    }

    const tMax = Math.max(60, series[series.length - 1].t);
    const toX = (t) => CHART_X + padL + (t / tMax) * plotW;
    const toY = (v) => CHART_Y + 12 + plotH * (1 - Math.min(1, v));

    const drawLine = (key, colour) => {
      ctx.beginPath();
      series.forEach((point, index) => {
        const x = toX(point.t);
        const y = toY(point[key]);
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = colour;
      ctx.lineWidth = 1.6;
      ctx.stroke();
    };

    drawLine("s", "rgba(143, 178, 201, 0.85)");
    drawLine("i", "rgba(255, 176, 84, 0.95)");
    drawLine("r", "rgba(94, 209, 148, 0.9)");

    // Herd-immunity guide.
    const threshold = herdThreshold();
    if (threshold > 0 && threshold < 1) {
      const y = toY(threshold);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(CHART_X + padL, y);
      ctx.lineTo(CHART_X + padL + plotW, y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.fillStyle = "#6f8388";
    ctx.font = "9px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("susceptible", CHART_X + padL + 6, CHART_Y + 12 + 10);
    ctx.fillStyle = "#ffb45c";
    ctx.fillText("infectious", CHART_X + padL + 80, CHART_Y + 12 + 10);
    ctx.fillStyle = "#6be3a4";
    ctx.fillText("immune", CHART_X + padL + 148, CHART_Y + 12 + 10);

    ctx.fillStyle = "#5d7075";
    ctx.textAlign = "right";
    ctx.fillText(`t ${Math.round(tMax)}`, CHART_X + CHART_W - 8, CHART_Y + CHART_H - 5);
    ctx.textAlign = "left";
  }

  function draw() {
    ctx.fillStyle = "#04080a";
    ctx.fillRect(0, 0, W, H);
    drawGrid();
    drawChart();
  }

  /* ------------------------------------------------------------------ loop */

  function frame(timestamp) {
    if (!state.lastTime) state.lastTime = timestamp;
    const dt = Math.max(0, Math.min(80, timestamp - state.lastTime));
    state.lastTime = timestamp;

    if (state.running) {
      state.accumulator += dt;
      let guard = 0;
      while (state.accumulator >= 50 && guard < 4) {
        state.accumulator -= 50;
        stepEpidemic();
        guard++;
      }
      state.frame += 1;
      if (state.frame % 6 === 0) {
        recount();
        updateReadouts();
        setStatus(statusLine());
      }
    }

    draw();
    requestAnimationFrame(frame);
  }

  /* ---------------------------------------------------------------- wiring */

  function setRunning(running) {
    state.running = running;
    state.accumulator = 0;
    el("toggle").textContent = running ? "Pause" : "Run";
    setStatus(running ? statusLine() : `Paused at tick ${state.time}. ${statusLine()}`);
  }

  function seedCases(count) {
    const grid = state.grid;
    let placed = 0;
    let guard = 0;
    while (placed < count && guard++ < 60000) {
      const index = (Math.random() * grid.length) | 0;
      if (grid[index] === S) {
        grid[index] = I;
        state.everInfected += 1;
        placed++;
      }
    }
    recount();
    updateReadouts();
    setStatus(`${placed} new cases seeded. ${statusLine()}`);
  }

  el("toggle").addEventListener("click", () => setRunning(!state.running));
  el("seed").addEventListener("click", () => seedCases(20));
  el("reset").addEventListener("click", () => {
    resetPopulation(false);
    setStatus(`Fresh population with ${Math.round(state.vaccination * 100)}% vaccinated. ${state.counts.i} cases seeded.`);
  });

  el("beta").addEventListener("input", () => {
    state.beta = Number(el("beta").value) / 1000;
    updateReadouts();
    setStatus(statusLine());
  });

  el("period").addEventListener("input", () => {
    state.period = Number(el("period").value);
    updateReadouts();
    setStatus(statusLine());
  });

  el("move").addEventListener("input", () => {
    state.movement = Number(el("move").value);
    updateReadouts();
  });

  el("vax").addEventListener("input", () => {
    state.vaccination = Number(el("vax").value) / 100;
    updateReadouts();
    setStatus(`Vaccination set to ${Math.round(state.vaccination * 100)}% — press Reset to apply it to the population.`);
  });

  el("preset").addEventListener("change", () => {
    const preset = el("preset").value;
    state.preset = preset;
    if (preset === "measles") {
      state.beta = 0.09;
      state.period = 45;
      state.movement = 0.6;
      state.vaccination = 0;
    } else if (preset === "lockdown") {
      state.beta = 0.05;
      state.period = 45;
      state.movement = 0.04;
      state.vaccination = 0;
    } else if (preset === "herd") {
      state.beta = 0.015;
      state.period = 40;
      state.movement = 0.4;
      state.vaccination = 0.6;
    } else if (preset === "wildfire") {
      state.beta = 0.12;
      state.period = 30;
      state.movement = 0.9;
      state.vaccination = 0;
    } else {
      state.beta = 0.01;
      state.period = 40;
      state.movement = 0.4;
      state.vaccination = 0;
    }

    el("beta").value = String(Math.round(state.beta * 1000));
    el("period").value = String(state.period);
    el("move").value = String(state.movement);
    el("vax").value = String(Math.round(state.vaccination * 100));
    resetPopulation(false);
    updateReadouts();
    setRunning(true);
    setStatus(`${preset} scenario loaded: R₀ ≈ ${r0().toFixed(1)}. ${statusLine()}`);
  });

  document.addEventListener("keydown", (event) => {
    const tag = (event.target && event.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (event.code === "Space") {
      event.preventDefault();
      setRunning(!state.running);
    } else if (event.key === "r" || event.key === "R") {
      resetPopulation(false);
    } else if (event.key === "i" || event.key === "I") {
      seedCases(20);
    }
  });

  // Adopt the markup defaults.
  state.beta = Number(el("beta").value) / 1000;
  state.period = Number(el("period").value);
  state.movement = Number(el("move").value);
  state.vaccination = Number(el("vax").value) / 100;
  state.preset = el("preset").value;

  resetPopulation(false);
  updateReadouts();
  setStatus("Population susceptible. The seed cases are deciding what happens next.");
  requestAnimationFrame(frame);
})();
