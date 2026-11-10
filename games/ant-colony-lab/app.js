(() => {
  "use strict";

  const CELL = 4;
  const SPEED = 2.6;
  const LOOK = 28;
  const MAX_PHEROMONE = 12;
  const TRAIL_COLOURS = [
    [12, 38, 28],
    [24, 96, 66],
    [64, 186, 128],
    [150, 244, 190],
  ];

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");
  const W = canvas.width || 820;
  const H = canvas.height || 520;
  const COLS = Math.ceil(W / CELL);
  const ROWS = Math.ceil(H / CELL);

  const state = {
    field: new Float32Array(COLS * ROWS),
    ants: [],
    nest: { x: 68, y: H / 2 },
    food: { x: W - 86, y: H / 2 },
    collected: 0,
    trips: 0,
    bestTrip: null,
    running: true,
    deposit: 1,
    evap: 0.99,
    showField: true,
    frame: 0,
    coverage: 0,
    lastTime: 0,
    off: null,
    offCtx: null,
    image: null,
    pulse: 0,
  };

  /* ---------------------------------------------------------------- field */

  function indexAt(x, y) {
    const cx = Math.max(0, Math.min(COLS - 1, (x / CELL) | 0));
    const cy = Math.max(0, Math.min(ROWS - 1, (y / CELL) | 0));
    return cy * COLS + cx;
  }

  function sample(x, y) {
    return state.field[indexAt(x, y)];
  }

  function deposit(x, y, amount) {
    const i = indexAt(x, y);
    state.field[i] = Math.min(MAX_PHEROMONE, state.field[i] + amount);
  }

  function foodScent(x, y) {
    const dx = x - state.food.x;
    const dy = y - state.food.y;
    return 2.6 * Math.exp(-Math.hypot(dx, dy) / 200);
  }

  function attractant(x, y) {
    return sample(x, y) + foodScent(x, y);
  }

  function evaporate() {
    const field = state.field;
    const factor = state.evap;
    let covered = 0;
    for (let i = 0; i < field.length; i++) {
      const value = field[i] * factor;
      field[i] = value < 0.002 ? 0 : value;
      if (field[i] > 0.12) covered++;
    }
    state.coverage = covered / field.length;
  }

  /* ----------------------------------------------------------------- ants */

  function spawnAnt() {
    const angle = (Math.random() - 0.5) * 1.5;
    return {
      x: state.nest.x + (Math.random() - 0.5) * 10,
      y: state.nest.y + (Math.random() - 0.5) * 10,
      a: angle,
      mode: "search",
      tripStart: state.frame,
    };
  }

  function fillAnts(count) {
    state.ants.length = 0;
    for (let i = 0; i < count; i++) state.ants.push(spawnAnt());
  }

  function turnToward(current, target, rate) {
    let delta = target - current;
    while (delta > Math.PI) delta -= Math.PI * 2;
    while (delta < -Math.PI) delta += Math.PI * 2;
    return current + delta * rate;
  }

  function steering(ant) {
    let best = ant.a;
    let bestScore = -1;
    for (const offset of [-0.8, -0.3, 0, 0.3, 0.8]) {
      const angle = ant.a + offset;
      const px = ant.x + Math.cos(angle) * LOOK;
      const py = ant.y + Math.sin(angle) * LOOK;
      const score = attractant(px, py) + Math.random() * 0.05;
      if (score > bestScore) {
        bestScore = score;
        best = angle;
      }
    }
    return best;
  }

  function stepAnt(ant) {
    const nest = state.nest;
    const food = state.food;

    if (ant.mode === "return") {
      const home = Math.atan2(nest.y - ant.y, nest.x - ant.x);
      ant.a = turnToward(ant.a, home, 0.32) + (Math.random() - 0.5) * 0.28;
      deposit(ant.x, ant.y, 0.85 * state.deposit);
      deposit(ant.x + 4, ant.y, 0.3 * state.deposit);
      deposit(ant.x - 4, ant.y, 0.3 * state.deposit);
      deposit(ant.x, ant.y + 4, 0.3 * state.deposit);
      deposit(ant.x, ant.y - 4, 0.3 * state.deposit);
      if (Math.hypot(ant.x - nest.x, ant.y - nest.y) < 14) {
        ant.mode = "search";
        ant.a = (Math.random() - 0.5) * 1.4;
        const trip = state.frame - ant.tripStart;
        if (!state.bestTrip || trip < state.bestTrip) state.bestTrip = trip;
        state.collected += 1;
        state.trips += 1;
      }
    } else {
      ant.a = steering(ant) + (Math.random() - 0.5) * 0.42;
      if (Math.random() < 0.35) deposit(ant.x, ant.y, 0.12 * state.deposit);
      if (Math.hypot(ant.x - food.x, ant.y - food.y) < 15) {
        ant.mode = "return";
        ant.tripStart = state.frame;
      }
    }

    ant.x += Math.cos(ant.a) * SPEED;
    ant.y += Math.sin(ant.a) * SPEED;

    if (ant.x < 3) {
      ant.x = 3;
      ant.a = Math.PI - ant.a;
    } else if (ant.x > W - 3) {
      ant.x = W - 3;
      ant.a = Math.PI - ant.a;
    }
    if (ant.y < 3) {
      ant.y = 3;
      ant.a = -ant.a;
    } else if (ant.y > H - 3) {
      ant.y = H - 3;
      ant.a = -ant.a;
    }
  }

  /* -------------------------------------------------------------- readouts */

  function carrying() {
    let count = 0;
    for (const ant of state.ants) if (ant.mode === "return") count++;
    return count;
  }

  function updateHud() {
    el("trips-read").textContent = `${state.trips} trip${state.trips === 1 ? "" : "s"}`;
    el("carrying-read").textContent = `${carrying()} carrying`;
    el("food-read").textContent = `${state.collected} delivered`;
    el("count-read").textContent = String(state.ants.length);
    el("coverage-read").textContent = `${(state.coverage * 100).toFixed(1)}%`;
    el("best-read").textContent =
      state.bestTrip === null ? "—" : `${(state.bestTrip / 60).toFixed(1)}s`;
    el("left-read").textContent = "∞";
    el("ants-out").textContent = String(state.ants.length);
    el("deposit-out").textContent = state.deposit.toFixed(1);
    el("evap-out").textContent = `${(100 * (1 - state.evap)).toFixed(1)}%`;
  }

  function statusLine() {
    const carry = carrying();
    let flavour;
    if (state.trips === 0) flavour = "Scouts are fanning out — the first finder will start a trail.";
    else if (state.trips < 8) flavour = "The first trail is forming as finders head home.";
    else if (state.trips < 40) flavour = "Traffic is concentrating: the colony is choosing a route.";
    else if (state.coverage > 0.22) flavour = "The whole field smells of ants — the trail is smearing.";
    else flavour = "A stable highway now carries most of the traffic.";
    return `${state.trips} deliver${state.trips === 1 ? "y" : "ies"} · ${carry} carrying · trail covers ${(state.coverage * 100).toFixed(1)}% of the field. ${flavour}`;
  }

  function setStatus(text) {
    el("status").textContent = text;
  }

  /* --------------------------------------------------------------- drawing */

  function drawField() {
    if (!state.offCtx || !state.image) return;
    const data = state.image.data;
    const field = state.field;
    const fog = 0.72;
    for (let i = 0; i < field.length; i++) {
      const value = Math.min(1, field[i] / 2.6);
      const shade = TRAIL_COLOURS[Math.min(3, Math.floor(value * 4))];
      const tint = Math.max(0, value - 0.25) * 0.6;
      const p = i * 4;
      data[p] = Math.round(shade[0] * fog + 150 * tint);
      data[p + 1] = Math.round(shade[1] * fog + 90 * tint);
      data[p + 2] = Math.round(shade[2] * fog + 120 * tint);
      data[p + 3] = value > 0.01 ? 255 : 0;
    }
    state.offCtx.putImageData(state.image, 0, 0);
    ctx.save();
    ctx.globalAlpha = 0.92;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(state.off, 0, 0, W, H);
    ctx.restore();
  }

  function drawNest() {
    const { x, y } = state.nest;
    const gradient = ctx.createRadialGradient(x, y, 4, x, y, 42);
    gradient.addColorStop(0, "rgba(124, 227, 164, 0.35)");
    gradient.addColorStop(1, "rgba(124, 227, 164, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, 42, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(124, 227, 164, 0.85)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#7ce3a4";
    ctx.font = "600 11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "center";
    ctx.fillText("NEST", x, y + 32);
  }

  function drawFood() {
    const { x, y } = state.food;
    const pulse = 1 + Math.sin(state.pulse / 20) * 0.08;
    const gradient = ctx.createRadialGradient(x, y, 3, x, y, 34 * pulse);
    gradient.addColorStop(0, "rgba(246, 198, 91, 0.55)");
    gradient.addColorStop(1, "rgba(246, 198, 91, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, 34 * pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#f6c65b";
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 240, 200, 0.85)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#f6c65b";
    ctx.font = "600 11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "center";
    ctx.fillText("FOOD", x, y + 28);
  }

  function drawAnts() {
    for (const ant of state.ants) {
      if (ant.mode === "return") {
        ctx.fillStyle = "#ffd98a";
        ctx.beginPath();
        ctx.arc(ant.x, ant.y, 2.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#f6c65b";
        ctx.beginPath();
        ctx.arc(
          ant.x - Math.cos(ant.a) * 3,
          ant.y - Math.sin(ant.a) * 3,
          1.5,
          0,
          Math.PI * 2
        );
        ctx.fill();
      } else {
        ctx.fillStyle = "rgba(214, 255, 232, 0.9)";
        ctx.beginPath();
        ctx.arc(ant.x, ant.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function draw() {
    ctx.fillStyle = "#050a08";
    ctx.fillRect(0, 0, W, H);

    if (state.showField) drawField();

    ctx.fillStyle = "rgba(124, 227, 164, 0.05)";
    for (let i = 0; i < 8; i++) {
      ctx.fillRect(0, (i * H) / 8, W, 1);
    }

    drawNest();
    drawFood();
    drawAnts();

    ctx.fillStyle = "rgba(190, 224, 205, 0.55)";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(`frame ${state.frame}`, 16, H - 16);
    ctx.textAlign = "right";
    ctx.fillText(
      state.running ? `${state.ants.length} foragers · running` : `${state.ants.length} foragers · paused`,
      W - 16,
      H - 16
    );
  }

  /* ---------------------------------------------------------------- wiring */

  function setRunning(running) {
    state.running = running;
    el("toggle").textContent = running ? "Pause" : "Run";
    setStatus(running ? statusLine() : `Paused at frame ${state.frame}. ${statusLine()}`);
  }

  function scatter() {
    fillAnts(state.ants.length);
    setStatus("Scouts scattered from the nest — the fan starts again.");
  }

  function applyPreset(name) {
    if (name === "swarm") {
      el("ants").value = "260";
      el("deposit").value = "1.4";
      el("evaporation").value = "0.8";
    } else if (name === "volatile") {
      el("ants").value = "140";
      el("deposit").value = "1.6";
      el("evaporation").value = "4";
    } else if (name === "sparse") {
      el("ants").value = "30";
      el("deposit").value = "1";
      el("evaporation").value = "1";
    } else {
      el("ants").value = "90";
      el("deposit").value = "1";
      el("evaporation").value = "1";
    }
    syncSettings();
    state.field.fill(0);
    state.coverage = 0;
    state.trips = 0;
    state.collected = 0;
    state.bestTrip = null;
    fillAnts(Number(el("ants").value));
    updateHud();
    setStatus(`Preset "${name}" loaded — ${state.ants.length} foragers.`);
  }

  function syncSettings() {
    state.deposit = Number(el("deposit").value);
    state.evap = 1 - Number(el("evaporation").value) / 100;
    updateHud();
  }

  function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / (rect.width || W);
    const scaleY = H / (rect.height || H);
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }

  /* ------------------------------------------------------------------ loop */

  function frame(timestamp) {
    if (!state.lastTime) state.lastTime = timestamp;
    const dt = Math.max(0, Math.min(80, timestamp - state.lastTime));
    state.lastTime = timestamp;
    state.pulse += 1;

    if (state.running) {
      evaporate();
      for (const ant of state.ants) stepAnt(ant);
      state.frame += 1;
      if (state.frame % 12 === 0) {
        updateHud();
        setStatus(statusLine());
      }
    }

    draw();
    requestAnimationFrame(frame);
  }

  el("toggle").addEventListener("click", () => setRunning(!state.running));
  el("scatter").addEventListener("click", scatter);
  el("clear").addEventListener("click", () => {
    state.field.fill(0);
    state.coverage = 0;
    updateHud();
    setStatus("Pheromone field cleared — the colony has to rediscover the route.");
  });

  el("ants").addEventListener("input", () => {
    const target = Number(el("ants").value);
    while (state.ants.length < target) state.ants.push(spawnAnt());
    while (state.ants.length > target && state.ants.length > 0) state.ants.pop();
    updateHud();
  });

  el("deposit").addEventListener("input", syncSettings);
  el("evaporation").addEventListener("input", syncSettings);

  el("show-field").addEventListener("change", () => {
    state.showField = el("show-field").checked;
  });

  el("preset").addEventListener("change", () => applyPreset(el("preset").value));

  canvas.addEventListener("click", (event) => {
    const point = canvasPoint(event);
    state.food.x = Math.max(60, Math.min(W - 60, point.x));
    state.food.y = Math.max(60, Math.min(H - 60, point.y));
    for (let i = 0; i < state.field.length; i++) state.field[i] *= 0.4;
    setStatus(`Food moved to ${Math.round(state.food.x)}, ${Math.round(state.food.y)} — the old highway fades and a new one is cut.`);
    draw();
  });

  document.addEventListener("keydown", (event) => {
    const tag = (event.target && event.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (event.code === "Space") {
      event.preventDefault();
      setRunning(!state.running);
    } else if (event.key === "s" || event.key === "S") {
      scatter();
    } else if (event.key === "c" || event.key === "C") {
      state.field.fill(0);
      state.coverage = 0;
      updateHud();
      setStatus("Pheromone field cleared — the colony has to rediscover the route.");
    }
  });

  try {
    const off = document.createElement("canvas");
    off.width = COLS;
    off.height = ROWS;
    const octx = typeof off.getContext === "function" ? off.getContext("2d") : null;
    if (octx && typeof octx.createImageData === "function") {
      state.off = off;
      state.offCtx = octx;
      state.image = octx.createImageData(COLS, ROWS);
    }
  } catch (error) {
    state.off = null;
    state.offCtx = null;
  }

  el("ants").value = "90";
  el("preset").value = "classic";
  syncSettings();
  fillAnts(90);
  updateHud();
  draw();
  requestAnimationFrame(frame);
})();
