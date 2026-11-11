(() => {
  "use strict";

  // Magnetic pendulum: a bob on a string, swinging above a plane of magnets.
  //
  //   a = -gravity · p − damping · v + Σ strength · h · (mᵢ − p) / (|mᵢ − p|² + h²)^(3/2)
  //
  // The bob eventually settles over one magnet, but which one depends with
  // extraordinary sensitivity on where it was released: that is the fractal
  // basin map drawn on the right.

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");
  const W = canvas.width || 820;
  const H = canvas.height || 600;

  const ARENA = 300;
  const ARENA_X = 26;
  const ARENA_Y = (H - ARENA) / 2;

  const MAP = 460;
  const MAP_X = W - MAP - 26;
  const MAP_Y = (H - MAP) / 2;

  const DT = 0.012;
  const SUBSTEPS = 4;
  const MAGNET_HEIGHT = 0.42;

  const COLOURS = [
    "#ff8f6b",
    "#63d5ff",
    "#a8e86c",
    "#ffcf6a",
    "#c48bff",
    "#ff77bd",
  ];

  const state = {
    magnets: [],
    magnetCount: 3,
    strength: 1,
    damping: 0.2,
    gravity: 0.4,
    resolution: 110,
    basin: null,
    pending: [],
    filled: 0,
    boundary: 0,
    drops: 0,
    longestFlight: 0,
    lastMagnet: "—",
    running: true,
    bob: null,
    trail: [],
    frame: 0,
    lastTime: 0,
    mapDirty: true,
  };

  /* --------------------------------------------------------------- magnets */

  function layoutMagnets(count) {
    const magnets = [];
    const radius = 0.55;
    for (let i = 0; i < count; i++) {
      const angle = (2 * Math.PI * i) / count - Math.PI / 2;
      magnets.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        colour: COLOURS[i % COLOURS.length],
      });
    }
    state.magnets = magnets;
    state.magnetCount = count;
  }

  /* --------------------------------------------------------------- physics */

  function acceleration(x, y, vx, vy) {
    let ax = -state.gravity * x - state.damping * vx;
    let ay = -state.gravity * y - state.damping * vy;
    for (const magnet of state.magnets) {
      const dx = magnet.x - x;
      const dy = magnet.y - y;
      const d2 = dx * dx + dy * dy + MAGNET_HEIGHT * MAGNET_HEIGHT;
      const inv = state.strength / (d2 * Math.sqrt(d2));
      ax += dx * inv;
      ay += dy * inv;
    }
    return { ax, ay };
  }

  function nearestMagnet(x, y) {
    let index = -1;
    let dist = Infinity;
    for (let i = 0; i < state.magnets.length; i++) {
      const d = Math.hypot(x - state.magnets[i].x, y - state.magnets[i].y);
      if (d < dist) {
        dist = d;
        index = i;
      }
    }
    return { index, dist };
  }

  function simulate(x, y, maxSteps) {
    let vx = 0;
    let vy = 0;
    let cx = x;
    let cy = y;
    let steps = 0;

    while (steps < maxSteps) {
      // Symplectic Euler with a small fixed step keeps the trajectory stable.
      for (let s = 0; s < SUBSTEPS; s++) {
        const { ax, ay } = acceleration(cx, cy, vx, vy);
        vx += ax * DT;
        vy += ay * DT;
        cx += vx * DT;
        cy += vy * DT;
      }
      steps += 1;

      const speed = Math.hypot(vx, vy);
      if (speed < 0.02) {
        const near = nearestMagnet(cx, cy);
        if (near.dist < 0.22) return { magnet: near.index, steps, x: cx, y: cy };
        // Parked on a saddle: break the symmetry so the bob picks a side.
        cx += (Math.random() - 0.5) * 2e-3;
        cy += (Math.random() - 0.5) * 2e-3;
        vx += (Math.random() - 0.5) * 6e-3;
        vy += (Math.random() - 0.5) * 6e-3;
      }

      if (Math.hypot(cx, cy) > 2.4) {
        return { magnet: -1, steps, x: cx, y: cy };
      }
    }
    // Never settled within the budget: the bob is trapped in the well of the
    // closest magnet, so attribute it there rather than leaving a hole.
    return { magnet: nearestMagnet(cx, cy).index, steps, x: cx, y: cy };
  }

  /* ------------------------------------------------------------ basin map */

  function buildQueue() {
    const res = state.resolution;
    const pending = [];
    for (let row = 0; row < res; row++) {
      for (let col = 0; col < res; col++) {
        pending.push([col, row]);
      }
    }
    // Shuffle so the map fills in scattered specks rather than row by row.
    for (let i = pending.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      const tmp = pending[i];
      pending[i] = pending[j];
      pending[j] = tmp;
    }
    state.pending = pending;
    state.basin = new Int8Array(res * res).fill(-1);
    state.filled = 0;
    state.boundary = 0;
    state.mapDirty = true;
  }

  function processQueue(budget) {
    const res = state.resolution;
    let done = 0;
    while (state.pending.length && done < budget) {
      const [col, row] = state.pending.pop();
      const x = ((col + 0.5) / res) * 2 - 1;
      const y = ((row + 0.5) / res) * 2 - 1;
      if (x * x + y * y > 1) continue;
      const result = simulate(x, y, 1000);
      state.basin[row * res + col] = result.magnet;
      state.filled += 1;
      if (result.steps > state.longestFlight) state.longestFlight = result.steps;
      done++;
    }
  }

  function measureBoundary() {
    const res = state.resolution;
    const basin = state.basin;
    let edges = 0;
    let total = 0;
    for (let row = 0; row < res; row++) {
      for (let col = 0; col < res - 1; col++) {
        const a = basin[row * res + col];
        const b = basin[row * res + col + 1];
        if (a < 0 || b < 0) continue;
        total++;
        if (a !== b) edges++;
      }
    }
    state.boundary = total ? edges / total : 0;
  }

  /* --------------------------------------------------------------- drawing */

  function projectArena(x, y) {
    return [ARENA_X + ARENA / 2 + (x / 1.6) * (ARENA / 2), ARENA_Y + ARENA / 2 + (y / 1.6) * (ARENA / 2)];
  }

  function drawArena() {
    ctx.fillStyle = "#08080f";
    ctx.fillRect(ARENA_X - 8, ARENA_Y - 8, ARENA + 16, ARENA + 16);

    // Grid.
    ctx.strokeStyle = "rgba(139, 137, 163, 0.12)";
    ctx.lineWidth = 1;
    for (let i = 1; i < 8; i++) {
      const x = ARENA_X + (ARENA * i) / 8;
      const y = ARENA_Y + (ARENA * i) / 8;
      ctx.beginPath();
      ctx.moveTo(x, ARENA_Y);
      ctx.lineTo(x, ARENA_Y + ARENA);
      ctx.moveTo(ARENA_X, y);
      ctx.lineTo(ARENA_X + ARENA, y);
      ctx.stroke();
    }

    // Magnets with glow halos.
    for (const magnet of state.magnets) {
      const [mx, my] = projectArena(magnet.x, magnet.y);
      const glow = ctx.createRadialGradient(mx, my, 2, mx, my, 34);
      glow.addColorStop(0, magnet.colour);
      glow.addColorStop(0.25, `${magnet.colour}88`);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(mx, my, 34, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = magnet.colour;
      ctx.beginPath();
      ctx.arc(mx, my, 7, 0, Math.PI * 2);
      ctx.fill();
    }

    // Trail.
    if (state.trail.length > 1) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      state.trail.forEach((point, index) => {
        const [px, py] = projectArena(point.x, point.y);
        if (index === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
    }

    // Bob.
    if (state.bob) {
      const [bx, by] = projectArena(state.bob.x, state.bob.y);
      ctx.fillStyle = "#f4f1ff";
      ctx.beginPath();
      ctx.arc(bx, by, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(177, 140, 255, 0.7)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(bx, by, 10, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.strokeStyle = "rgba(139, 137, 163, 0.35)";
    ctx.strokeRect(ARENA_X + 0.5, ARENA_Y + 0.5, ARENA, ARENA);
    ctx.fillStyle = "#8b89a3";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("pendulum", ARENA_X, ARENA_Y - 12);
  }

  function drawBasin() {
    const res = state.resolution;
    const cell = MAP / res;

    ctx.fillStyle = "#06060b";
    ctx.fillRect(MAP_X, MAP_Y, MAP, MAP);

    ctx.save();
    ctx.beginPath();
    ctx.arc(MAP_X + MAP / 2, MAP_Y + MAP / 2, MAP / 2, 0, Math.PI * 2);
    ctx.clip();

    for (let row = 0; row < res; row++) {
      for (let col = 0; col < res; col++) {
        const magnet = state.basin[row * res + col];
        if (magnet < 0) continue;
        ctx.fillStyle = state.magnets[magnet] ? state.magnets[magnet].colour : "#26243a";
        ctx.fillRect(MAP_X + col * cell, MAP_Y + (res - 1 - row) * cell, cell + 0.6, cell + 0.6);
      }
    }
    ctx.restore();

    // Magnet markers.
    for (const magnet of state.magnets) {
      const mx = MAP_X + MAP / 2 + (magnet.x / 2) * MAP;
      const my = MAP_Y + MAP / 2 + (magnet.y / 2) * MAP;
      ctx.strokeStyle = "rgba(10, 10, 16, 0.9)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(mx, my, 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#0a0a10";
      ctx.beginPath();
      ctx.arc(mx, my, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = "rgba(177, 140, 255, 0.5)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(MAP_X + MAP / 2, MAP_Y + MAP / 2, MAP / 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#8b89a3";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("basins of attraction", MAP_X, MAP_Y - 12);
    ctx.textAlign = "right";
    ctx.fillText(`${Math.round((state.filled / (res * res)) * 100)}% mapped`, MAP_X + MAP, MAP_Y - 12);
    ctx.textAlign = "left";
  }

  function draw() {
    ctx.fillStyle = "#05050a";
    ctx.fillRect(0, 0, W, H);
    drawArena();
    drawBasin();

    ctx.fillStyle = "rgba(139, 137, 163, 0.7)";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "center";
    ctx.fillText(`bob drops: ${state.drops} · longest recorded flight ${state.longestFlight} steps · map ${Math.round((state.filled / (state.resolution * state.resolution)) * 100)}%`, W / 2, H - 16);
    ctx.textAlign = "left";
  }

  /* -------------------------------------------------------------- readouts */

  function updateReadouts() {
    const total = state.resolution * state.resolution;
    const filled = state.filled / total;
    el("drops-read").textContent = `${state.drops} drop${state.drops === 1 ? "" : "s"}`;
    el("chaos-read").textContent = `chaos ${(state.boundary * 100).toFixed(0)}%`;
    el("energy-read").textContent = state.bob ? `E ${energy().toFixed(2)}` : "E 0.00";
    el("filled-read").textContent = `${Math.round(filled * 100)}%`;
    el("boundary-read").textContent = `${(state.boundary * 100).toFixed(1)}%`;
    el("flight-read").textContent = String(state.longestFlight);
    el("last-read").textContent = state.lastMagnet;
    el("magnets-out").textContent = String(state.magnetCount);
    el("strength-out").textContent = state.strength.toFixed(2);
    el("damping-out").textContent = state.damping.toFixed(2);
    el("gravity-out").textContent = state.gravity.toFixed(2);
    el("res-out").textContent = String(state.resolution);
  }

  function energy() {
    const bob = state.bob;
    if (!bob) return 0;
    const kinetic = 0.5 * (bob.vx * bob.vx + bob.vy * bob.vy);
    const potential = 0.5 * state.gravity * (bob.x * bob.x + bob.y * bob.y);
    return kinetic + potential;
  }

  function setStatus(text) {
    el("status").textContent = text;
  }

  function statusLine() {
    const mapped = Math.round((state.filled / (state.resolution * state.resolution)) * 100);
    const branches = (state.boundary * 100).toFixed(1);
    const chaos =
      state.boundary > 0.18
        ? "The basins are finely interlaced — neighbouring release points end up on different magnets."
        : state.boundary > 0.07
          ? "The boundaries are ragged: a fractal edge between otherwise smooth regions."
          : "The basins are mostly smooth, with only thin borders of ambiguity.";
    return `${state.magnetCount} magnets at strength ${state.strength.toFixed(2)} · ${mapped}% of the map resolved · ${branches}% of neighbouring cells disagree. ${chaos}`;
  }

  /* ------------------------------------------------------------------ loop */

  function frame(timestamp) {
    if (!state.lastTime) state.lastTime = timestamp;
    const dt = Math.max(0, Math.min(80, timestamp - state.lastTime));
    state.lastTime = timestamp;

    if (state.running) {
      if (state.bob) stepFlight();

      // Fill in the basin map a slice at a time.
      if (state.pending.length) {
        processQueue(state.frame % 30 === 0 ? 40 : 14);
        if (state.frame % 25 === 0) measureBoundary();
        if (state.pending.length === 0) {
          measureBoundary();
          state.mapDirty = true;
          updateReadouts();
          setStatus(statusLine());
        }
      }

      state.frame += 1;
      if (state.frame % 12 === 0) {
        updateReadouts();
        const quiet = state.frame - (state.eventFrame || -999) > 200;
        if (state.frame % 60 === 0 && quiet && !state.bob) setStatus(statusLine());
      }
    }

    draw();
    requestAnimationFrame(frame);
  }

  function stepFlight() {
    const bob = state.bob;
    // One frame of flight is six micro-steps, so a settle takes about a second
    // of wall clock without the trajectory looking stepped.
    for (let s = 0; s < 6; s++) {
      const { ax, ay } = acceleration(bob.x, bob.y, bob.vx, bob.vy);
      bob.vx += ax * DT;
      bob.vy += ay * DT;
      bob.x += bob.vx * DT;
      bob.y += bob.vy * DT;
      bob.steps += 1;
    }

    state.trail.push({ x: bob.x, y: bob.y });
    if (state.trail.length > 420) state.trail.shift();

    const speed = Math.hypot(bob.vx, bob.vy);
    const radius = Math.hypot(bob.x, bob.y);

    if (speed < 0.02) {
      const near = nearestMagnet(bob.x, bob.y);
      if (near.dist < 0.24) {
        state.lastMagnet = `magnet ${near.index + 1}`;
        state.eventFrame = state.frame;
        setStatus(
          `The bob settled over magnet ${near.index + 1} after ${(bob.steps * DT).toFixed(1)} time units of flight. Release it a millimetre away and it may choose a different one.`
        );
        state.bob = null;
        updateReadouts();
        return;
      }
      // Balanced on a saddle: nudge it so it falls one way or the other.
      bob.x += (Math.random() - 0.5) * 2e-3;
      bob.y += (Math.random() - 0.5) * 2e-3;
      bob.vx += (Math.random() - 0.5) * 6e-3;
      bob.vy += (Math.random() - 0.5) * 6e-3;
    }

    if (radius > 2.4) {
      state.lastMagnet = "escaped";
      state.eventFrame = state.frame;
      setStatus("The bob flew off the plate — too much energy for the magnets to hold it.");
      state.bob = null;
      updateReadouts();
    }
  }

  /* ---------------------------------------------------------------- wiring */

  function dropBob(x, y) {
    const px = typeof x === "number" ? x : (Math.random() * 1.4 - 0.7);
    const py = typeof y === "number" ? y : (Math.random() * 1.4 - 0.7);
    state.bob = { x: px, y: py, vx: 0, vy: 0, steps: 0, magnet: -1 };
    state.eventFrame = state.frame;
    state.trail = [];
    state.drops += 1;
    updateReadouts();
    setStatus(
      `Bob released at (${px.toFixed(2)}, ${py.toFixed(2)}) with zero velocity. Watch which magnet wins.`
    );
  }

  function rebuildMap() {
    buildQueue();
    state.longestFlight = 0;
    state.filled = 0;
    state.boundary = 0;
    state.mapDirty = true;
    updateReadouts();
    setStatus("Basin map cleared — release points are being classified again.");
  }

  el("toggle").addEventListener("click", () => {
    state.running = !state.running;
    el("toggle").textContent = state.running ? "Pause" : "Run";
    setStatus(state.running ? statusLine() : "Paused. The bob holds its position and the map stops filling.");
  });

  el("drop").addEventListener("click", () => dropBob());
  el("reset").addEventListener("click", () => rebuildMap());

  el("magnets").addEventListener("input", () => {
    layoutMagnets(Number(el("magnets").value));
    rebuildMap();
    updateReadouts();
  });

  el("strength").addEventListener("input", () => {
    state.strength = Number(el("strength").value);
    rebuildMap();
    updateReadouts();
  });

  el("damping").addEventListener("input", () => {
    state.damping = Number(el("damping").value);
    rebuildMap();
    updateReadouts();
  });

  el("gravity").addEventListener("input", () => {
    state.gravity = Number(el("gravity").value);
    rebuildMap();
    updateReadouts();
  });

  el("res").addEventListener("input", () => {
    state.resolution = Number(el("res").value);
    rebuildMap();
    updateReadouts();
  });

  canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / (rect.width || W)) * W;
    const y = ((event.clientY - rect.top) / (rect.height || H)) * H;

    if (x >= ARENA_X && x <= ARENA_X + ARENA && y >= ARENA_Y && y <= ARENA_Y + ARENA) {
      const worldX = ((x - ARENA_X - ARENA / 2) / (ARENA / 2)) * 1.6;
      const worldY = ((y - ARENA_Y - ARENA / 2) / (ARENA / 2)) * 1.6;
      dropBob(worldX, worldY);
    } else if (x >= MAP_X && x <= MAP_X + MAP && y >= MAP_Y && y <= MAP_Y + MAP) {
      const res = state.resolution;
      const col = Math.floor(((x - MAP_X) / MAP) * res);
      const row = res - 1 - Math.floor(((y - MAP_Y) / MAP) * res);
      const magnet = state.basin[row * res + col];
      if (magnet >= 0) {
        setStatus(
          `That spot belongs to magnet ${magnet + 1}. Cells a single pixel away may belong to a different one — that is the fractal boundary.`
        );
      } else {
        setStatus("That spot is still being classified.");
      }
    }
  });

  document.addEventListener("keydown", (event) => {
    const tag = (event.target && event.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (event.code === "Space") {
      event.preventDefault();
      el("toggle").click();
    } else if (event.key === "d" || event.key === "D") {
      dropBob();
    } else if (event.key === "r" || event.key === "R") {
      rebuildMap();
    }
  });

  layoutMagnets(Number(el("magnets").value) || 3);
  state.strength = Number(el("strength").value) || state.strength;
  state.damping = Number(el("damping").value) || state.damping;
  state.gravity = Number(el("gravity").value) || state.gravity;
  state.resolution = Number(el("res").value) || state.resolution;

  rebuildMap();
  updateReadouts();
  dropBob(0.62, 0.3);
  setStatus("Three magnets, one bob. The map is filling in as release points are classified.");
  requestAnimationFrame(frame);
})();
