(() => {
  "use strict";

  // Four graph searches over the same weighted grid. The grid is small enough
  // that a full search is instantaneous, so the "animation" simply replays the
  // order in which each algorithm settled its nodes. That keeps the comparison
  // honest: the numbers are the real search results, not a slowed-down fake.

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");

  const W = canvas.width || 800;
  const H = canvas.height || 600;
  const COLS = 38;
  const ROWS = 26;
  const CELL = 20;
  const X0 = 20;
  const Y0 = 58;

  const PLAIN = 0;
  const SAND = 1;
  const WATER = 2;
  const WALL = 3;

  const COST = [1, 3, 8, 0];
  const TERRAIN = { wall: WALL, sand: SAND, water: WATER, plain: PLAIN };
  const TERRAIN_COLOR = ["#22323f", "#7d6531", "#24557f", "#070b0f"];

  const ALGOS = {
    bfs: { name: "BFS", color: "#4de2c0", note: "fewest steps, ignores terrain cost" },
    dijkstra: { name: "Dijkstra", color: "#57a8ff", note: "cheapest route, expands evenly" },
    astar: { name: "A*", color: "#ffd166", note: "cheapest route, steered by the goal" },
    greedy: { name: "Greedy", color: "#ff7ac6", note: "fast but not guaranteed optimal" },
  };

  const DIRS = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  const state = {
    grid: new Uint8Array(COLS * ROWS),
    start: 13 * COLS + 2,
    goal: 13 * COLS + 35,
    algo: "astar",
    brush: "wall",
    speed: 6,
    revealed: 0,
    result: null,
    running: true,
    hover: -1,
    painting: false,
    frame: 0,
  };

  const node = (x, y) => y * COLS + x;
  const cx = (n) => n % COLS;
  const cy = (n) => Math.floor(n / COLS);

  function seeded(seed) {
    let s = seed >>> 0 || 1;
    return () => {
      s ^= s << 13;
      s >>>= 0;
      s ^= s >>> 17;
      s ^= s << 5;
      s >>>= 0;
      return s / 4294967296;
    };
  }

  /* --------------------------------------------------------- the searches */

  class Heap {
    constructor() {
      this.items = [];
    }
    get size() {
      return this.items.length;
    }
    push(p, g, n) {
      const items = this.items;
      items.push({ p, g, n });
      let i = items.length - 1;
      while (i > 0) {
        const parent = (i - 1) >> 1;
        if (less(items[i], items[parent])) {
          const tmp = items[i];
          items[i] = items[parent];
          items[parent] = tmp;
          i = parent;
        } else break;
      }
    }
    pop() {
      const items = this.items;
      const top = items[0];
      const last = items.pop();
      if (items.length) {
        items[0] = last;
        let i = 0;
        for (;;) {
          const l = i * 2 + 1;
          const r = l + 1;
          let best = i;
          if (l < items.length && less(items[l], items[best])) best = l;
          if (r < items.length && less(items[r], items[best])) best = r;
          if (best === i) break;
          const tmp = items[i];
          items[i] = items[best];
          items[best] = tmp;
          i = best;
        }
      }
      return top;
    }
  }

  function less(a, b) {
    // Equal f-scores are broken towards the node reached by more travel: it
    // keeps A* from fanning out across an open grid of equally good routes.
    return a.p < b.p || (a.p === b.p && a.g > b.g) || (a.p === b.p && a.g === b.g && a.n < b.n);
  }

  function heuristic(n, goal) {
    return Math.abs(cx(n) - cx(goal)) + Math.abs(cy(n) - cy(goal));
  }

  function search(grid, start, goal, algo) {
    const t0 = performance.now();
    const total = COLS * ROWS;
    const gScore = new Float64Array(total).fill(Infinity);
    const prev = new Int32Array(total).fill(-1);
    const settled = new Uint8Array(total);
    const order = [];
    let peak = 0;
    let found = false;

    if (algo === "bfs") {
      const queue = new Int32Array(total);
      let head = 0;
      let tail = 0;
      queue[tail++] = start;
      settled[start] = 1;
      gScore[start] = 0;
      while (head < tail) {
        const n = queue[head++];
        order.push(n);
        if (n === goal) {
          found = true;
          break;
        }
        const x = cx(n);
        const y = cy(n);
        for (let d = 0; d < DIRS.length; d++) {
          const nx = x + DIRS[d][0];
          const ny = y + DIRS[d][1];
          if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) continue;
          const nb = node(nx, ny);
          if (settled[nb] || grid[nb] === WALL) continue;
          settled[nb] = 1;
          prev[nb] = n;
          gScore[nb] = gScore[n] + 1;
          queue[tail++] = nb;
        }
        if (tail - head > peak) peak = tail - head;
      }
    } else {
      const heap = new Heap();
      gScore[start] = 0;
      heap.push(algo === "dijkstra" ? 0 : heuristic(start, goal), 0, start);
      while (heap.size) {
        const top = heap.pop();
        const n = top.n;
        if (settled[n]) continue;
        settled[n] = 1;
        order.push(n);
        if (n === goal) {
          found = true;
          break;
        }
        const x = cx(n);
        const y = cy(n);
        for (let d = 0; d < DIRS.length; d++) {
          const nx = x + DIRS[d][0];
          const ny = y + DIRS[d][1];
          if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) continue;
          const nb = node(nx, ny);
          if (settled[nb] || grid[nb] === WALL) continue;
          const tentative = gScore[n] + COST[grid[nb]];
          if (tentative < gScore[nb]) {
            gScore[nb] = tentative;
            prev[nb] = n;
            const h = heuristic(nb, goal);
            const priority = algo === "dijkstra" ? tentative : algo === "greedy" ? h : tentative + h;
            heap.push(priority, tentative, nb);
          }
        }
        if (heap.size > peak) peak = heap.size;
      }
    }

    const path = [];
    let cost = 0;
    if (found) {
      let cursor = goal;
      while (cursor !== -1) {
        path.push(cursor);
        cursor = prev[cursor];
      }
      path.reverse();
      for (let i = 1; i < path.length; i++) cost += COST[grid[path[i]]];
    }

    return {
      algo,
      order,
      path,
      cost,
      found,
      visited: order.length,
      peak,
      ms: performance.now() - t0,
    };
  }

  /* ------------------------------------------------------------- painting */

  function runSearch() {
    state.result = search(state.grid, state.start, state.goal, state.algo);
    state.revealed = 0;
    state.running = true;
    syncHud();
    updateReadouts();
  }

  function paint(n, brush) {
    if (n < 0 || n >= COLS * ROWS) return;
    if (n === state.start || n === state.goal) {
      if (brush !== "start" && brush !== "goal") return;
    }
    if (brush === "start") {
      if (n === state.goal) return;
      state.grid[n] = PLAIN;
      state.start = n;
    } else if (brush === "goal") {
      if (n === state.start) return;
      state.grid[n] = PLAIN;
      state.goal = n;
    } else {
      state.grid[n] = TERRAIN[brush];
    }
    runSearch();
  }

  function seedTerrain() {
    // Soft terrain blobs with a lake sitting on the direct corridor, so the
    // first run already contains the classic disagreement: BFS takes the short
    // line straight through the water, while Dijkstra and A* walk around it.
    state.grid.fill(PLAIN);
    const blobs = [
      { x: 11, y: 6, rx: 6.5, ry: 3.4, t: SAND },
      { x: 27, y: 5, rx: 4.4, ry: 2.6, t: WATER },
      { x: 19, y: 13, rx: 4.2, ry: 4.4, t: WATER },
      { x: 25, y: 20, rx: 6, ry: 2.8, t: SAND },
      { x: 33, y: 18, rx: 3.4, ry: 2.6, t: WATER },
    ];
    for (const blob of blobs) {
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const dx = (x - blob.x) / blob.rx;
          const dy = (y - blob.y) / blob.ry;
          if (dx * dx + dy * dy <= 1) state.grid[node(x, y)] = blob.t;
        }
      }
    }
    state.start = 13 * COLS + 2;
    state.goal = 13 * COLS + 35;
  }

  function clearGrid() {
    state.grid.fill(PLAIN);
    state.start = 13 * COLS + 2;
    state.goal = 13 * COLS + 35;
    runSearch();
    setStatus("Flat ground. Every algorithm finds the same straight route here — add terrain to change that.", "idle");
  }

  function buildMaze() {
    const rand = seeded(0x5eed ^ (state.frame + 1) * 2654435761);
    state.grid.fill(WALL);
    const oddCols = Math.floor((COLS - 1) / 2);
    const oddRows = Math.floor((ROWS - 1) / 2);
    const visited = new Uint8Array(oddCols * oddRows);
    const stack = [[0, 0]];
    visited[0] = 1;
    state.grid[node(1, 1)] = PLAIN;
    while (stack.length) {
      const [gx, gy] = stack[stack.length - 1];
      const options = [];
      for (let d = 0; d < DIRS.length; d++) {
        const nx = gx + DIRS[d][0];
        const ny = gy + DIRS[d][1];
        if (nx < 0 || ny < 0 || nx >= oddCols || ny >= oddRows) continue;
        if (visited[ny * oddCols + nx]) continue;
        options.push([nx, ny, DIRS[d][0], DIRS[d][1]]);
      }
      if (!options.length) {
        stack.pop();
        continue;
      }
      const pick = options[Math.floor(rand() * options.length)];
      const [nx, ny, dx, dy] = pick;
      visited[ny * oddCols + nx] = 1;
      state.grid[node(1 + gx * 2 + dx, 1 + gy * 2 + dy)] = PLAIN;
      state.grid[node(1 + nx * 2, 1 + ny * 2)] = PLAIN;
      stack.push([nx, ny]);
    }
    for (let i = 0; i < 90; i++) {
      const x = 1 + Math.floor(rand() * (COLS - 2));
      const y = 1 + Math.floor(rand() * (ROWS - 2));
      state.grid[node(x, y)] = PLAIN;
    }
    state.start = node(1, 1);
    // Maze cells live on odd coordinates, so the far corner is the last carved
    // cell rather than the literal grid corner.
    state.goal = node(1 + (oddCols - 1) * 2, 1 + (oddRows - 1) * 2);
    state.grid[state.start] = PLAIN;
    state.grid[state.goal] = PLAIN;
    runSearch();
    setStatus("Random maze carved. BFS and Dijkstra will explore very differently from A*.", "idle");
  }

  /* ------------------------------------------------------------- readouts */

  const ALGO_LABEL = { bfs: "BFS", dijkstra: "Dijkstra", astar: "A*", greedy: "Greedy" };

  function setStatus(text, kind) {
    const box = el("status");
    box.textContent = text;
    box.className = "status" + (kind ? " " + kind : "");
  }

  function syncHud() {
    el("algo-hud").textContent = ALGO_LABEL[state.algo];
  }

  function updateReadouts() {
    const r = state.result;
    if (!r) return;
    const shown = Math.min(state.revealed, r.order.length);
    el("visited-read").textContent = shown.toLocaleString("en-US");
    el("visited-hud").textContent = shown + " cells";
    el("path-read").textContent = r.found ? String(r.path.length) : "—";
    el("cost-read").textContent = r.found ? String(r.cost) : "—";
    el("cost-hud").textContent = "cost " + (r.found ? r.cost : "—");
    el("frontier-read").textContent = r.peak.toLocaleString("en-US");
    el("time-read").textContent = r.ms.toFixed(1) + " ms";
    el("eff-read").textContent = r.found ? (r.visited / Math.max(1, r.path.length)).toFixed(1) + " : 1" : "—";
  }

  function finishStatus() {
    const r = state.result;
    const label = ALGO_LABEL[r.algo];
    if (!r.found) {
      setStatus(
        `${label} exhausted all ${r.order.length} reachable cells and never touched the goal. Something is walled off.`,
        "warn"
      );
      return;
    }
    setStatus(
      `${label}: ${r.visited} cells expanded, route of ${r.path.length - 1} steps costing ${r.cost}, in ${r.ms.toFixed(2)} ms — ${ALGOS[r.algo].note}.`,
      "good"
    );
  }

  /* -------------------------------------------------------------- drawing */

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#04070a";
    ctx.fillRect(0, 0, W, H);

    const r = state.result;
    const revealed = r ? Math.min(state.revealed, r.order.length) : 0;
    const color = ALGOS[state.algo].color;

    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const n = node(x, y);
        const px = X0 + x * CELL;
        const py = Y0 + y * CELL;
        ctx.fillStyle = TERRAIN_COLOR[state.grid[n]];
        ctx.fillRect(px, py, CELL, CELL);
      }
    }

    // The settled set, faded from the search origin outwards.
    if (r) {
      for (let i = 0; i < revealed; i++) {
        const n = r.order[i];
        const px = X0 + cx(n) * CELL;
        const py = Y0 + cy(n) * CELL;
        const t = revealed > 1 ? i / (revealed - 1) : 0;
        ctx.globalAlpha = 0.5 - t * 0.34;
        ctx.fillStyle = color;
        ctx.fillRect(px + 1, py + 1, CELL - 2, CELL - 2);
        ctx.globalAlpha = 1;
      }
    }

    // Grid lines, drawn once over the terrain.
    ctx.strokeStyle = "rgba(140, 185, 215, 0.13)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= COLS; x++) {
      ctx.moveTo(X0 + x * CELL + 0.5, Y0);
      ctx.lineTo(X0 + x * CELL + 0.5, Y0 + ROWS * CELL);
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.moveTo(X0, Y0 + y * CELL + 0.5);
      ctx.lineTo(X0 + COLS * CELL, Y0 + y * CELL + 0.5);
    }
    ctx.stroke();

    ctx.strokeStyle = "rgba(120, 160, 190, 0.35)";
    ctx.strokeRect(X0 - 0.5, Y0 - 0.5, COLS * CELL + 1, ROWS * CELL + 1);

    // Walls get an edge so a maze reads clearly.
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (state.grid[node(x, y)] !== WALL) continue;
        ctx.strokeStyle = "#1b2a36";
        ctx.strokeRect(X0 + x * CELL + 1.5, Y0 + y * CELL + 1.5, CELL - 3, CELL - 3);
      }
    }

    // The route itself.
    if (r && r.found && revealed >= r.order.length) {
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
      ctx.lineWidth = 8;
      tracePath(r.path);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      tracePath(r.path);
    }

    marker(state.start, "#63e6a4", "S");
    marker(state.goal, "#ff6f9c", "G");

    ctx.fillStyle = "#7d93a3";
    ctx.font = "12px ui-monospace, Menlo, monospace";
    ctx.fillText(`${COLS} × ${ROWS} grid · cell cost plain 1 · sand 3 · water 8`, X0, Y0 - 16);
    ctx.fillStyle = color;
    ctx.textAlign = "right";
    ctx.fillText(ALGO_LABEL[state.algo] + " search", W - X0, Y0 - 16);
    ctx.textAlign = "left";
  }

  function tracePath(path) {
    ctx.beginPath();
    for (let i = 0; i < path.length; i++) {
      const px = X0 + cx(path[i]) * CELL + CELL / 2;
      const py = Y0 + cy(path[i]) * CELL + CELL / 2;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  function marker(n, color, label) {
    const px = X0 + cx(n) * CELL + CELL / 2;
    const py = Y0 + cy(n) * CELL + CELL / 2;
    ctx.beginPath();
    ctx.arc(px, py, CELL * 0.38, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.fillStyle = "#04110c";
    ctx.font = "bold 10px ui-monospace, Menlo, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, px, py + 0.5);
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
  }

  /* ---------------------------------------------------------------- input */

  function pick(evt) {
    const rect = canvas.getBoundingClientRect ? canvas.getBoundingClientRect() : { left: 0, top: 0, width: W, height: H };
    const sx = (evt.clientX - rect.left) * (W / (rect.width || W));
    const sy = (evt.clientY - rect.top) * (H / (rect.height || H));
    const x = Math.floor((sx - X0) / CELL);
    const y = Math.floor((sy - Y0) / CELL);
    if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return -1;
    return node(x, y);
  }

  canvas.addEventListener("pointerdown", (evt) => {
    state.painting = true;
    const n = pick(evt);
    if (n >= 0) {
      paint(n, state.brush);
      draw();
    }
  });
  canvas.addEventListener("pointermove", (evt) => {
    const n = pick(evt);
    state.hover = n;
    if (state.painting && n >= 0) {
      paint(n, state.brush);
      draw();
    }
  });
  canvas.addEventListener("pointerup", () => {
    state.painting = false;
  });
  canvas.addEventListener("pointerleave", () => {
    state.painting = false;
    state.hover = -1;
  });

  const algoButtons = ["bfs", "dijkstra", "astar", "greedy"];
  algoButtons.forEach((key) => {
    el("algo-" + key).addEventListener("click", () => setAlgo(key));
  });

  function setAlgo(key) {
    state.algo = key;
    algoButtons.forEach((k) => el("algo-" + k).classList.toggle("active", k === key));
    syncHud();
    runSearch();
  }

  const brushButtons = ["wall", "sand", "water", "plain", "start", "goal"];
  brushButtons.forEach((key) => {
    el("b-" + key).addEventListener("click", () => {
      state.brush = key;
      brushButtons.forEach((k) => el("b-" + k).classList.toggle("active", k === key));
      setStatus(`Brush set to ${key}. Drag on the map to paint; the search restarts after every stroke.`, "idle");
    });
  });

  el("speed").addEventListener("input", (evt) => {
    state.speed = Math.max(1, Number(evt.target.value) || 1);
    el("speed-out").textContent = String(state.speed);
  });

  el("run").addEventListener("click", () => {
    runSearch();
  });
  el("maze").addEventListener("click", buildMaze);
  el("clear").addEventListener("click", clearGrid);

  document.addEventListener("keydown", (evt) => {
    const key = evt.key;
    if (key === " ") {
      evt.preventDefault();
      runSearch();
    } else if (key === "m" || key === "M") {
      buildMaze();
    } else if (key === "c" || key === "C") {
      clearGrid();
    } else if (key >= "1" && key <= "4") {
      setAlgo(algoButtons[Number(key) - 1]);
    }
  });

  /* ------------------------------------------------------------- main loop */

  let last = 0;

  function loop(now) {
    const dt = last ? Math.min(100, now - last) : 16;
    last = now;
    state.frame++;

    if (state.result) {
      const total = state.result.order.length;
      if (state.revealed < total) {
        const before = state.revealed;
        state.revealed = Math.min(total, state.revealed + Math.max(1, Math.round((state.speed * dt) / 16)));
        if (before < total) {
          updateReadouts();
        }
        if (state.revealed >= total) finishStatus();
      }
      updateReadouts();
    }

    draw();
    requestAnimationFrame(loop);
  }

  window.__lab = {
    state,
    buildMaze,
    clearGrid,
    paint,
    runSearch,
    setAlgo,
    search,
    node,
    COLS,
    ROWS,
    COST,
    WALL,
    SAND,
    WATER,
    PLAIN,
  };

  seedTerrain();
  runSearch();
  draw();
  requestAnimationFrame(loop);
})();
