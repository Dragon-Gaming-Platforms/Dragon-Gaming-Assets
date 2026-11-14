(() => {
  "use strict";

  // Gradient descent on four classic landscapes, with four optimizers starting
  // from the same point. The gradients are analytic, and the readout checks
  // them against central differences so the pretty curves cannot lie.

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");

  const W = canvas.width || 860;
  const H = canvas.height || 660;

  const MAP_X = 26;
  const MAP_Y = 62;
  const MAP_W = 596;
  const MAP_H = 560;

  const CURVE_X = 640;
  const CURVE_Y = 62;
  const CURVE_W = 196;
  const CURVE_H = 210;

  const TABLE_Y = 292;
  const TABLE_H = 152;

  const LANDSCAPES = {
    himmel: {
      name: "Himmelblau",
      x: [-5, 5],
      y: [-5, 5],
      start: [-2.4, 2.6],
      f: (x, y) => Math.pow(x * x + y - 11, 2) + Math.pow(x + y * y - 7, 2),
      grad: (x, y) => {
        const a = x * x + y - 11;
        const b = x + y * y - 7;
        return [4 * x * a + 2 * b, 2 * a + 4 * y * b];
      },
      minima: [
        [3, 2],
        [-2.805118, 3.131312],
        [-3.779310, -3.283186],
        [3.584428, -1.848126],
      ],
    },
    rosen: {
      name: "Rosenbrock",
      x: [-2, 2],
      y: [-1, 3],
      start: [-1.4, 1.8],
      f: (x, y) => Math.pow(1 - x, 2) + 100 * Math.pow(y - x * x, 2),
      grad: (x, y) => {
        const t = y - x * x;
        return [-2 * (1 - x) - 400 * x * t, 200 * t];
      },
      minima: [[1, 1]],
    },
    bowl: {
      name: "Bowl",
      x: [-2, 2],
      y: [-2, 2],
      start: [-1.6, 1.4],
      f: (x, y) => 0.5 * (x * x + 22 * y * y),
      grad: (x, y) => [x, 22 * y],
      minima: [[0, 0]],
    },
    ripple: {
      name: "Ripples",
      x: [-6, 6],
      y: [-6, 6],
      start: [-4.2, 3.6],
      f: (x, y) => {
        const r = Math.sqrt(x * x + y * y);
        return 0.08 * r * r + 1.6 * (1 + Math.cos(3.2 * r)) + 0.25 * Math.sin(2 * x) * Math.cos(2 * y);
      },
      grad: (x, y) => {
        const r = Math.max(1e-6, Math.sqrt(x * x + y * y));
        const dr = 0.16 * r - 1.6 * 3.2 * Math.sin(3.2 * r);
        const base = [dr * (x / r), dr * (y / r)];
        base[0] += 0.5 * Math.cos(2 * x) * Math.cos(2 * y);
        base[1] -= 0.5 * Math.sin(2 * x) * Math.sin(2 * y);
        return base;
      },
      // The ripples have no tidy closed-form minima, so they are found by
      // multi-start descent the first time this landscape is opened.
      numericMinima: true,
      minima: [],
    },
  };

  const OPTIMIZERS = [
    { key: "sgd", label: "SGD", colour: "#8b93a8" },
    { key: "momentum", label: "Momentum", colour: "#5fc7ff" },
    { key: "rmsprop", label: "RMSProp", colour: "#ffcf7a" },
    { key: "adam", label: "Adam", colour: "#7cf0b4" },
  ];

  const state = {
    landscape: "himmel",
    lrLog: -2,
    speed: 3,
    trails: true,
    running: true,
    iter: 0,
    start: [-2.4, 2.6],
    agents: [],
    history: [],
    gradError: 0,
    backdrop: null,
    frame: 0,
  };

  /* ------------------------------------------------------------- landscape */

  function land() {
    return LANDSCAPES[state.landscape];
  }

  function lr() {
    return Math.pow(10, state.lrLog);
  }

  function ensureMinima() {
    const L = land();
    if (!L.numericMinima || L.minima.length) return L.minima;
    const found = [];
    let seed = 12345;
    const rand = () => {
      seed = (seed * 1103515245 + 12345) >>> 0;
      return seed / 4294967296;
    };
    for (let trial = 0; trial < 80; trial++) {
      let x = L.x[0] + rand() * (L.x[1] - L.x[0]);
      let y = L.y[0] + rand() * (L.y[1] - L.y[0]);
      for (let i = 0; i < 900; i++) {
        const g = L.grad(x, y);
        const step = 0.02 / (1 + i / 200);
        x -= step * g[0];
        y -= step * g[1];
        if (Math.hypot(g[0], g[1]) < 1e-4) break;
      }
      const value = L.f(x, y);
      if (!isFinite(value)) continue;
      const dupe = found.some((m) => Math.hypot(m[0] - x, m[1] - y) < 0.25);
      if (!dupe && Math.hypot(L.grad(x, y)[0], L.grad(x, y)[1]) < 0.05) found.push([x, y]);
    }
    L.minima = found;
    return found;
  }

  function gradientCheck() {
    const L = land();
    let worst = 0;
    const probes = [
      [0.37, -0.62],
      [-1.13, 0.44],
      [0.82, 0.91],
      [-0.55, -1.27],
    ];
    for (const [x, y] of probes) {
      const g = L.grad(x, y);
      const h = 1e-6;
      const fd = [
        (L.f(x + h, y) - L.f(x - h, y)) / (2 * h),
        (L.f(x, y + h) - L.f(x, y - h)) / (2 * h),
      ];
      const scale = Math.max(1, Math.abs(g[0]), Math.abs(g[1]), Math.abs(fd[0]), Math.abs(fd[1]));
      worst = Math.max(worst, Math.abs(g[0] - fd[0]) / scale, Math.abs(g[1] - fd[1]) / scale);
    }
    state.gradError = worst;
    return worst;
  }

  function initAgents() {
    state.iter = 0;
    state.history = [];
    state.agents = OPTIMIZERS.map((o) => ({
      ...o,
      pos: [state.start[0], state.start[1]],
      velocity: [0, 0],
      second: [0, 0],
      m: [0, 0],
      v: [0, 0],
      loss: land().f(state.start[0], state.start[1]),
      lost: false,
      path: [[state.start[0], state.start[1]]],
    }));
    const L = land();
    state.agents.forEach((a) => {
      a.loss = L.f(a.pos[0], a.pos[1]);
    });
    state.history.push(state.agents.map((a) => a.loss));
    updateReadouts();
  }

  function stepOnce() {
    const L = land();
    const rate = lr();
    const t = state.iter + 1;

    for (const agent of state.agents) {
      if (agent.lost) continue;
      const [x, y] = agent.pos;
      const g = L.grad(x, y);
      let dx = 0;
      let dy = 0;

      if (agent.key === "sgd") {
        dx = -rate * g[0];
        dy = -rate * g[1];
      } else if (agent.key === "momentum") {
        agent.velocity[0] = 0.9 * agent.velocity[0] - rate * g[0];
        agent.velocity[1] = 0.9 * agent.velocity[1] - rate * g[1];
        dx = agent.velocity[0];
        dy = agent.velocity[1];
      } else if (agent.key === "rmsprop") {
        agent.second[0] = 0.9 * agent.second[0] + 0.1 * g[0] * g[0];
        agent.second[1] = 0.9 * agent.second[1] + 0.1 * g[1] * g[1];
        dx = (-rate * g[0]) / (Math.sqrt(agent.second[0]) + 1e-8);
        dy = (-rate * g[1]) / (Math.sqrt(agent.second[1]) + 1e-8);
      } else {
        agent.m[0] = 0.9 * agent.m[0] + 0.1 * g[0];
        agent.m[1] = 0.9 * agent.m[1] + 0.1 * g[1];
        agent.v[0] = 0.999 * agent.v[0] + 0.001 * g[0] * g[0];
        agent.v[1] = 0.999 * agent.v[1] + 0.001 * g[1] * g[1];
        const mHat0 = agent.m[0] / (1 - Math.pow(0.9, t));
        const mHat1 = agent.m[1] / (1 - Math.pow(0.9, t));
        const vHat0 = agent.v[0] / (1 - Math.pow(0.999, t));
        const vHat1 = agent.v[1] / (1 - Math.pow(0.999, t));
        dx = (-rate * mHat0) / (Math.sqrt(vHat0) + 1e-8);
        dy = (-rate * mHat1) / (Math.sqrt(vHat1) + 1e-8);
      }

      agent.pos = [x + dx, y + dy];
      const [nx, ny] = agent.pos;
      if (!isFinite(nx) || !isFinite(ny) || Math.abs(nx) > 60 || Math.abs(ny) > 60) {
        agent.lost = true;
        agent.loss = Infinity;
        continue;
      }
      agent.loss = L.f(nx, ny);
      agent.path.push([nx, ny]);
      if (agent.path.length > 900) agent.path.shift();
    }

    state.iter++;
    state.history.push(state.agents.map((a) => (a.lost ? Infinity : a.loss)));
    if (state.history.length > 1200) state.history.shift();
  }

  /* ------------------------------------------------------------- readouts */

  function bestAgent() {
    let best = null;
    for (const a of state.agents) {
      if (a.lost) continue;
      if (!best || a.loss < best.loss) best = a;
    }
    return best;
  }

  function nearestMinimum() {
    const L = land();
    ensureMinima();
    let best = null;
    for (const m of L.minima) {
      for (const a of state.agents) {
        if (a.lost) continue;
        const d = Math.hypot(a.pos[0] - m[0], a.pos[1] - m[1]);
        if (!best || d < best.d) best = { d, m, agent: a.key };
      }
    }
    return best;
  }

  function fmtLoss(v) {
    if (!isFinite(v)) return "diverged";
    if (v >= 1e5) return v.toExponential(1);
    if (v >= 100) return v.toFixed(0);
    if (v >= 0.01) return v.toFixed(3);
    return v.toExponential(2);
  }

  function setStatus(text, kind) {
    const box = el("status");
    box.textContent = text;
    box.className = "status" + (kind ? " " + kind : "");
  }

  function updateReadouts() {
    const best = bestAgent();
    el("iter-read").textContent = String(state.iter);
    el("iter-hud").textContent = state.iter + " steps";
    el("loss-read").textContent = best ? fmtLoss(best.loss) : "—";
    el("best-hud").textContent = "best loss " + (best ? fmtLoss(best.loss) : "—");
    el("state-hud").textContent = state.running ? "running" : "paused";
    for (const a of state.agents) {
      const id = { sgd: "sgd-read", momentum: "mom-read", rmsprop: "rms-read", adam: "adam-read" }[a.key];
      el(id).textContent = fmtLoss(a.loss);
    }
    el("grad-read").textContent = state.gradError < 1e-6 ? "exact" : state.gradError.toExponential(1);
    const near = nearestMinimum();
    el("min-read").textContent = near ? near.d.toFixed(2) + " away" : "—";
    el("lr-out").textContent = lr().toFixed(3);
    el("speed-out").textContent = String(state.speed);
    describe();
  }

  function describe() {
    if (!state.agents.length) return;
    const best = bestAgent();
    const sgd = state.agents[0];
    const adam = state.agents[3];
    const lost = state.agents.filter((a) => a.lost).length;
    if (lost) {
      setStatus(
        `${lost} optimizer${lost > 1 ? "s" : ""} diverged at a learning rate of ${lr().toFixed(
          3
        )}. Momentum and Adam tolerate large steps better, but nothing is immune.`,
        "warn"
      );
      return;
    }
    if (state.iter === 0) {
      setStatus("Four optimizers at the same start. Watch Adam's step size adapt while plain SGD crawls along the ravine floor.", "idle");
      return;
    }
    const near = nearestMinimum();
    const ratio = adam.loss > 0 ? sgd.loss / adam.loss : Infinity;
    setStatus(
      `Step ${state.iter} on ${land().name}: SGD ${fmtLoss(sgd.loss)}, Adam ${fmtLoss(adam.loss)}${
        isFinite(ratio) && ratio > 1 ? ` (${ratio.toFixed(1)}× better)` : ""
      }. Closest known minimum is ${near ? near.d.toFixed(2) : "?"} away.`,
      "good"
    );
  }

  /* -------------------------------------------------------------- drawing */

  function worldToScreen(x, y) {
    const L = land();
    return [
      MAP_X + ((x - L.x[0]) / (L.x[1] - L.x[0])) * MAP_W,
      MAP_Y + ((L.y[1] - y) / (L.y[1] - L.y[0])) * MAP_H,
    ];
  }

  function screenToWorld(sx, sy) {
    const L = land();
    const x = L.x[0] + ((sx - MAP_X) / MAP_W) * (L.x[1] - L.x[0]);
    const y = L.y[1] - ((sy - MAP_Y) / MAP_H) * (L.y[1] - L.y[0]);
    return [x, y];
  }

  function buildBackdrop() {
    // Rasterise the landscape once per landscape switch at modest resolution
    // and scale it up. Heights are quantised into contour bands so the shape of
    // the surface reads at a glance instead of dissolving into a gradient.
    const N = 150;
    const off = document.createElement("canvas");
    off.width = N;
    off.height = N;
    const octx = off.getContext("2d");
    const L = land();

    const logs = new Float32Array(N * N);
    const sorted = [];
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const x = L.x[0] + (i / (N - 1)) * (L.x[1] - L.x[0]);
        // Canvas rows run down, world y runs up.
        const y = L.y[1] - (j / (N - 1)) * (L.y[1] - L.y[0]);
        const v = Math.log10(L.f(x, y) + 0.25);
        logs[j * N + i] = v;
        sorted.push(v);
      }
    }
    sorted.sort((a, b) => a - b);
    const floor = sorted[Math.floor(sorted.length * 0.02)];
    const ceil = sorted[Math.floor(sorted.length * 0.985)];
    const span = Math.max(0.35, ceil - floor);
    const bands = 18;

    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        let t = (logs[j * N + i] - floor) / span;
        t = Math.max(0, Math.min(1, t));
        const band = Math.floor(t * bands) / bands;
        // Teal lowlands → slate → violet slopes → warm ridges.
        const stops = [
          [18, 52, 66],
          [24, 84, 96],
          [44, 74, 128],
          [96, 70, 150],
          [162, 92, 140],
          [214, 146, 116],
        ];
        const pos = band * (stops.length - 1);
        const i0 = Math.min(stops.length - 2, Math.floor(pos));
        const f = pos - i0;
        const c0 = stops[i0];
        const c1 = stops[i0 + 1];
        const r = Math.round(c0[0] + (c1[0] - c0[0]) * f);
        const g = Math.round(c0[1] + (c1[1] - c0[1]) * f);
        const b = Math.round(c0[2] + (c1[2] - c0[2]) * f);
        octx.fillStyle = `rgb(${r},${g},${b})`;
        octx.fillRect(i, j, 1, 1);
      }
    }
    state.backdrop = off;
    state.backdropRange = [floor, floor + span];
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#07060b";
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "#9a93ad";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(`${land().name} · ${land().x[0]}…${land().x[1]} × ${land().y[0]}…${land().y[1]}`, MAP_X, 34);

    if (state.backdrop) {
      ctx.globalAlpha = 0.92;
      ctx.drawImage(state.backdrop, MAP_X, MAP_Y, MAP_W, MAP_H);
      ctx.globalAlpha = 1;
    }
    ctx.strokeStyle = "rgba(198, 166, 255, 0.28)";
    ctx.strokeRect(MAP_X + 0.5, MAP_Y + 0.5, MAP_W - 1, MAP_H - 1);

    ctx.save();
    ctx.beginPath();
    ctx.rect(MAP_X, MAP_Y, MAP_W, MAP_H);
    ctx.clip();
    drawMinima();
    drawTrails();
    ctx.restore();
    drawLossCurve();
    drawTable();
    drawRules();

    ctx.fillStyle = "#6f6a83";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(`learning rate ${lr().toFixed(4)} · ${state.iter} steps · click the map to move the start`, MAP_X, H - 12);
    ctx.textAlign = "right";
    ctx.fillStyle = state.running ? "#7cf0b4" : "#ffcf7a";
    ctx.fillText(state.running ? "running" : "paused", W - 26, H - 12);
    ctx.textAlign = "left";
  }

  function drawMinima() {
    const L = land();
    ensureMinima();
    for (const m of L.minima) {
      const [sx, sy] = worldToScreen(m[0], m[1]);
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.fill();
      ctx.strokeStyle = "rgba(10, 8, 16, 0.8)";
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
  }

  function drawTrails() {
    for (const agent of state.agents) {
      if (state.trails && agent.path.length > 1) {
        ctx.strokeStyle = agent.colour;
        ctx.globalAlpha = 0.75;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        agent.path.forEach(([x, y], i) => {
          const [sx, sy] = worldToScreen(x, y);
          if (i === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        });
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      if (!agent.lost) {
        const [sx, sy] = worldToScreen(agent.pos[0], agent.pos[1]);
        ctx.beginPath();
        ctx.arc(sx, sy, 5.5, 0, Math.PI * 2);
        ctx.fillStyle = agent.colour;
        ctx.fill();
        ctx.strokeStyle = "#0a0810";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }

  function drawLossCurve() {
    ctx.fillStyle = "#0d0b14";
    ctx.fillRect(CURVE_X, CURVE_Y, CURVE_W, CURVE_H);
    ctx.strokeStyle = "#262436";
    ctx.strokeRect(CURVE_X + 0.5, CURVE_Y + 0.5, CURVE_W - 1, CURVE_H - 1);

    ctx.fillStyle = "#9a93ad";
    ctx.font = "10.5px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("loss vs step (log scale)", CURVE_X + 12, CURVE_Y + 16);

    if (state.history.length < 2) {
      ctx.fillStyle = "#5b5670";
      ctx.font = "11px 'Inter', system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Press Run to start descending.", CURVE_X + CURVE_W / 2, CURVE_Y + CURVE_H / 2);
      ctx.textAlign = "left";
      return;
    }

    let minV = Infinity;
    let maxV = -Infinity;
    for (const row of state.history) {
      for (const v of row) {
        if (!isFinite(v)) continue;
        const lv = Math.log10(Math.max(1e-7, v));
        if (lv < minV) minV = lv;
        if (lv > maxV) maxV = lv;
      }
    }
    if (!isFinite(minV)) return;
    if (maxV - minV < 0.4) maxV = minV + 0.4;

    const x0 = CURVE_X + 30;
    const y0 = CURVE_Y + 26;
    const w = CURVE_W - 44;
    const h = CURVE_H - 46;
    const xOf = (i) => x0 + (i / Math.max(1, state.history.length - 1)) * w;
    const yOf = (v) => {
      const lv = Math.log10(Math.max(1e-7, v));
      return y0 + h - ((lv - minV) / (maxV - minV)) * h;
    };

    ctx.strokeStyle = "#1d1b29";
    ctx.font = "9px ui-monospace, Menlo, monospace";
    for (let k = 0; k <= 3; k++) {
      const y = y0 + (k / 3) * h;
      ctx.beginPath();
      ctx.moveTo(x0, y + 0.5);
      ctx.lineTo(x0 + w, y + 0.5);
      ctx.stroke();
      ctx.fillStyle = "#5b5670";
      ctx.textAlign = "right";
      ctx.fillText("1e" + (maxV - (k / 3) * (maxV - minV)).toFixed(0), x0 - 5, y + 3);
    }

    OPTIMIZERS.forEach((o, index) => {
      ctx.strokeStyle = o.colour;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      let started = false;
      state.history.forEach((row, i) => {
        const v = row[index];
        if (!isFinite(v)) {
          started = false;
          return;
        }
        const px = xOf(i);
        const py = yOf(v);
        if (!started) {
          ctx.moveTo(px, py);
          started = true;
        } else ctx.lineTo(px, py);
      });
      ctx.stroke();
    });
    ctx.textAlign = "left";
  }

  function drawTable() {
    ctx.fillStyle = "#0d0b14";
    ctx.fillRect(CURVE_X, TABLE_Y, CURVE_W, TABLE_H);
    ctx.strokeStyle = "#262436";
    ctx.strokeRect(CURVE_X + 0.5, TABLE_Y + 0.5, CURVE_W - 1, TABLE_H - 1);

    ctx.fillStyle = "#9a93ad";
    ctx.font = "10.5px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("current loss", CURVE_X + 12, TABLE_Y + 18);

    OPTIMIZERS.forEach((o, index) => {
      const agent = state.agents[index];
      const y = TABLE_Y + 40 + index * 20;
      ctx.fillStyle = o.colour;
      ctx.fillRect(CURVE_X + 12, y - 7, 8, 8);
      ctx.fillStyle = "#cfcae2";
      ctx.font = "11px 'Inter', system-ui, sans-serif";
      ctx.fillText(o.label, CURVE_X + 28, y);
      ctx.textAlign = "right";
      ctx.fillStyle = agent.lost ? "#ff8fa3" : "#f0eefb";
      ctx.font = "600 11px ui-monospace, Menlo, monospace";
      ctx.fillText(fmtLoss(agent.loss), CURVE_X + CURVE_W - 12, y);
      ctx.textAlign = "left";
    });

    const near = nearestMinimum();
    ctx.fillStyle = "#6f6a83";
    ctx.font = "10px ui-monospace, Menlo, monospace";
    ctx.fillText(
      near ? `closest minimum ${near.d.toFixed(3)} away` : "no minimum located",
      CURVE_X + 12,
      TABLE_Y + TABLE_H - 12
    );
  }

  function drawRules() {
    const x = CURVE_X;
    const y = TABLE_Y + TABLE_H + 14;
    const w = CURVE_W;
    const h = 168;
    ctx.fillStyle = "#0d0b14";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#262436";
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);

    ctx.fillStyle = "#9a93ad";
    ctx.font = "10.5px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("update rules", x + 12, y + 18);

    const rules = [
      ["SGD", "θ ← θ − η·g"],
      ["Momentum", "v ← 0.9v − η·g"],
      ["RMSProp", "s ← 0.9s + 0.1g²"],
      ["Adam", "m, v with bias"],
    ];
    rules.forEach((row, i) => {
      const ly = y + 40 + i * 26;
      ctx.fillStyle = OPTIMIZERS[i].colour;
      ctx.fillRect(x + 12, ly - 7, 6, 6);
      ctx.fillStyle = "#cfcae2";
      ctx.font = "10px 'Inter', system-ui, sans-serif";
      ctx.fillText(row[0], x + 24, ly);
      ctx.fillStyle = "#7f7a94";
      ctx.font = "9.5px ui-monospace, Menlo, monospace";
      ctx.fillText(row[1], x + 24, ly + 10);
    });

    ctx.fillStyle = "#5f5a72";
    ctx.font = "9px ui-monospace, Menlo, monospace";
    ctx.fillText(`gradient check error ${state.gradError.toExponential(1)}`, x + 12, y + h - 8);
    ctx.textAlign = "left";
  }

  /* ---------------------------------------------------------------- input */

  function setLandscape(key) {
    state.landscape = key;
    ["himmel", "rosen", "bowl", "ripple"].forEach((id) => el("land-" + id).classList.toggle("active", id === key));
    state.start = land().start.slice();
    state.backdrop = null;
    ensureMinima();
    buildBackdrop();
    gradientCheck();
    initAgents();
  }

  el("land-himmel").addEventListener("click", () => setLandscape("himmel"));
  el("land-rosen").addEventListener("click", () => setLandscape("rosen"));
  el("land-bowl").addEventListener("click", () => setLandscape("bowl"));
  el("land-ripple").addEventListener("click", () => setLandscape("ripple"));

  el("lr").addEventListener("input", (evt) => {
    state.lrLog = Math.max(-4, Math.min(0.3, Number(evt.target.value)));
    initAgents();
  });
  el("speed").addEventListener("input", (evt) => {
    state.speed = Math.max(1, Math.round(Number(evt.target.value) || 1));
    updateReadouts();
  });
  el("trails").addEventListener("change", (evt) => {
    state.trails = !!evt.target.checked;
  });

  el("toggle").addEventListener("click", () => {
    state.running = !state.running;
    el("toggle").textContent = state.running ? "Pause" : "Run";
    updateReadouts();
  });
  el("step").addEventListener("click", () => {
    stepOnce();
    updateReadouts();
  });
  el("restart").addEventListener("click", () => {
    initAgents();
  });
  el("stuck").addEventListener("click", () => {
    const L = land();
    state.start = [
      L.x[0] + Math.random() * (L.x[1] - L.x[0]),
      L.y[0] + Math.random() * (L.y[1] - L.y[0]),
    ];
    initAgents();
  });

  canvas.addEventListener("click", (evt) => {
    const rect = canvas.getBoundingClientRect ? canvas.getBoundingClientRect() : { left: 0, top: 0, width: W, height: H };
    const sx = (evt.clientX - rect.left) * (W / (rect.width || W));
    const sy = (evt.clientY - rect.top) * (H / (rect.height || H));
    if (sx < MAP_X || sy < MAP_Y || sx > MAP_X + MAP_W || sy > MAP_Y + MAP_H) return;
    state.start = screenToWorld(sx, sy);
    initAgents();
  });

  document.addEventListener("keydown", (evt) => {
    const key = evt.key;
    if (key === " ") {
      evt.preventDefault();
      state.running = !state.running;
      el("toggle").textContent = state.running ? "Pause" : "Run";
      updateReadouts();
    } else if (key === "r" || key === "R") initAgents();
    else if (key === "n" || key === "N") {
      stepOnce();
      updateReadouts();
    } else if (key === "x" || key === "X") el("stuck").dispatch("click");
  });

  /* ------------------------------------------------------------- main loop */

  function loop() {
    state.frame++;
    if (state.running) {
      for (let i = 0; i < state.speed; i++) stepOnce();
      updateReadouts();
    }
    draw();
    requestAnimationFrame(loop);
  }

  window.__lab = {
    state,
    LANDSCAPES,
    OPTIMIZERS,
    lr,
    land,
    initAgents,
    stepOnce,
    gradientCheck,
    buildBackdrop,
    setLandscape,
    updateReadouts,
    worldToScreen,
    screenToWorld,
    nearestMinimum,
    bestAgent,
  };

  buildBackdrop();
  gradientCheck();
  ensureMinima();
  initAgents();
  draw();
  requestAnimationFrame(loop);
})();
