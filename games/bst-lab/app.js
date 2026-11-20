(() => {
  "use strict";

  // AVL tree: a binary search tree that rebalances with rotations after
  // every insert/delete so |balance factor| <= 1 at every node.
  // BF = height(left) - height(right). Height bound: h <= 1.44 * log2(n+2).

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");

  const W = canvas.width || 880;
  const H = canvas.height || 660;

  const STAGE = { x: 26, y: 50, w: 828, h: 560 };

  const state = {
    root: null,
    n: 10,
    range: 100,
    preset: "random",
    rotations: 0,
    searchPath: [],
    searchKey: null,
    showBF: true,
    seed: 31337,
  };

  /* ------------------------------------------------------------------- random */

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ------------------------------------------------------------------ avl core */

  function node(key) {
    return { key, left: null, right: null, h: 1 };
  }

  function height(n) {
    return n ? n.h : 0;
  }

  function balanceFactor(n) {
    return n ? height(n.left) - height(n.right) : 0;
  }

  function update(n) {
    if (n) n.h = 1 + Math.max(height(n.left), height(n.right));
  }

  function rotateRight(y) {
    const x = y.left;
    const t = x.right;
    x.right = y;
    y.left = t;
    update(y);
    update(x);
    state.rotations++;
    return x;
  }

  function rotateLeft(x) {
    const y = x.right;
    const t = y.left;
    y.left = x;
    x.right = t;
    update(x);
    update(y);
    state.rotations++;
    return y;
  }

  function rebalance(n) {
    update(n);
    const bf = balanceFactor(n);
    if (bf > 1) {
      if (balanceFactor(n.left) < 0) n.left = rotateLeft(n.left);
      return rotateRight(n);
    }
    if (bf < -1) {
      if (balanceFactor(n.right) > 0) n.right = rotateRight(n.right);
      return rotateLeft(n);
    }
    return n;
  }

  function insert(n, key) {
    if (!n) return node(key);
    if (key < n.key) n.left = insert(n.left, key);
    else if (key > n.key) n.right = insert(n.right, key);
    return rebalance(n);
  }

  function minNode(n) {
    while (n.left) n = n.left;
    return n;
  }

  function remove(n, key) {
    if (!n) return null;
    if (key < n.key) n.left = remove(n.left, key);
    else if (key > n.key) n.right = remove(n.right, key);
    else {
      if (!n.left) return n.right;
      if (!n.right) return n.left;
      const succ = minNode(n.right);
      n.key = succ.key;
      n.right = remove(n.right, succ.key);
    }
    return rebalance(n);
  }

  function search(n, key, path) {
    path = path || [];
    if (!n) return { found: false, comparisons: path.length, path };
    path.push(n.key);
    if (key === n.key) return { found: true, comparisons: path.length, path };
    if (key < n.key) return search(n.left, key, path);
    return search(n.right, key, path);
  }

  function inorder(n, out) {
    out = out || [];
    if (!n) return out;
    inorder(n.left, out);
    out.push(n.key);
    inorder(n.right, out);
    return out;
  }

  function count(n) {
    if (!n) return 0;
    return 1 + count(n.left) + count(n.right);
  }

  function maxBF(n) {
    if (!n) return 0;
    return Math.max(Math.abs(balanceFactor(n)), maxBF(n.left), maxBF(n.right));
  }

  /* ------------------------------------------------------------------- drawing */

  function layout(n, depth, x0, x1, positions) {
    if (!n) return;
    const mid = (x0 + x1) / 2;
    positions.push({ key: n.key, x: mid, y: STAGE.y + 40 + depth * 52, bf: balanceFactor(n), depth });
    layout(n.left, depth + 1, x0, mid, positions);
    layout(n.right, depth + 1, mid, x1, positions);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#070907";
    ctx.fillRect(STAGE.x, STAGE.y, STAGE.w, STAGE.h);

    if (!state.root) {
      ctx.fillStyle = "#93a48f";
      ctx.font = "13px ui-monospace, Menlo, monospace";
      ctx.textAlign = "center";
      ctx.fillText("empty tree — Insert to add nodes", STAGE.x + STAGE.w / 2, STAGE.y + STAGE.h / 2);
      return;
    }

    const positions = [];
    layout(state.root, 0, STAGE.x + 20, STAGE.x + STAGE.w - 20, positions);
    const byKey = new Map(positions.map((p) => [p.key, p]));

    // edges
    ctx.strokeStyle = "rgba(130,150,169,0.4)";
    ctx.lineWidth = 1.5;
    (function edges(n) {
      if (!n) return;
      const p = byKey.get(n.key);
      if (n.left) {
        const c = byKey.get(n.left.key);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(c.x, c.y);
        ctx.stroke();
        edges(n.left);
      }
      if (n.right) {
        const c = byKey.get(n.right.key);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(c.x, c.y);
        ctx.stroke();
        edges(n.right);
      }
    })(state.root);

    // nodes
    positions.forEach((p) => {
      const onPath = state.searchPath.includes(p.key);
      ctx.fillStyle = onPath ? "#ffb45f" : "#16222a";
      ctx.strokeStyle = onPath ? "#ffb45f" : "#5f8d2f";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = onPath ? "#0a0805" : "#eef5ea";
      ctx.font = "bold 12px ui-monospace, Menlo, monospace";
      ctx.textAlign = "center";
      ctx.fillText(String(p.key), p.x, p.y + 4);
      if (state.showBF) {
        ctx.fillStyle = "#93a48f";
        ctx.font = "9px ui-monospace, Menlo, monospace";
        ctx.fillText("BF " + (p.bf > 0 ? "+" : "") + p.bf, p.x, p.y + 30);
      }
    });
  }

  /* ------------------------------------------------------------------ readouts */

  function updateReadouts() {
    const h = height(state.root);
    const n = count(state.root);
    const bf = state.root ? balanceFactor(state.root) : 0;
    const order = inorder(state.root);
    const res = state.searchKey !== null ? search(state.root, state.searchKey) : null;

    el("n-out").textContent = String(state.n);
    el("range-out").textContent = String(state.range);

    el("height-hud").textContent = "height " + h;
    el("nodes-hud").textContent = "nodes " + n;
    el("bf-hud").textContent = "root BF " + (bf > 0 ? "+" : "") + bf;

    el("height-read").textContent = String(h);
    el("nodes-read").textContent = String(n);
    el("bf-read").textContent = (bf > 0 ? "+" : "") + bf;
    el("rot-read").textContent = String(state.rotations);
    el("search-read").textContent = res ? (res.found ? res.comparisons + " ✓" : res.comparisons + " ✗") : "—";
    el("inorder-read").textContent = order.length > 12 ? order.slice(0, 12).join(",") + "…" : order.join(",");
  }

  function describe() {
    const h = height(state.root);
    const n = count(state.root);
    const bound = 1.44 * Math.log2(n + 2);
    let msg;
    if (n === 0) {
      msg = "Empty tree. Insert to add nodes — try Sorted to watch rotations fight the degeneration.";
    } else if (state.preset === "sorted" || state.preset === "reverse") {
      msg = n + " sorted inserts: a plain BST would be a linked list of height " + n + ". The AVL tree rotated " + state.rotations + " times and kept the height at " + h + " (bound " + bound.toFixed(1) + ").";
    } else {
      msg = n + " nodes, height " + h + " (AVL bound " + bound.toFixed(1) + "). Every node has |BF| ≤ 1, so search costs at most " + h + " comparisons.";
    }
    el("status").textContent = msg;
  }

  /* -------------------------------------------------------------------- wiring */

  function insertRandom() {
    const rng = mulberry32(state.seed);
    for (let i = 0; i < state.n; i++) {
      const key = 1 + Math.floor(rng() * state.range);
      state.root = insert(state.root, key);
    }
    state.seed = (state.seed * 1103515245 + 12345) >>> 0;
    state.searchPath = [];
    state.searchKey = null;
    updateReadouts();
    describe();
    draw();
  }

  function insertSorted() {
    const step = Math.max(1, Math.floor(state.range / state.n));
    for (let i = 0; i < state.n; i++) {
      state.root = insert(state.root, 1 + i * step);
    }
    state.searchPath = [];
    state.searchKey = null;
    updateReadouts();
    describe();
    draw();
  }

  function insertReverse() {
    const step = Math.max(1, Math.floor(state.range / state.n));
    for (let i = state.n - 1; i >= 0; i--) {
      state.root = insert(state.root, 1 + i * step);
    }
    state.searchPath = [];
    state.searchKey = null;
    updateReadouts();
    describe();
    draw();
  }

  function setPreset(name) {
    state.preset = name;
    state.root = null;
    state.rotations = 0;
    ["random", "sorted", "reverse"].forEach((kk) => {
      el("preset-" + kk).classList.toggle("active", kk === name);
    });
    if (name === "random") insertRandom();
    else if (name === "sorted") insertSorted();
    else insertReverse();
  }

  el("n").addEventListener("input", (evt) => {
    state.n = Math.max(1, Math.min(30, Number(evt.target.value) || 10));
    updateReadouts();
    describe();
    draw();
  });
  el("range").addEventListener("input", (evt) => {
    state.range = Math.max(20, Math.min(500, Number(evt.target.value) || 100));
    updateReadouts();
    describe();
    draw();
  });

  el("preset-random").addEventListener("click", () => setPreset("random"));
  el("preset-sorted").addEventListener("click", () => setPreset("sorted"));
  el("preset-reverse").addEventListener("click", () => setPreset("reverse"));

  el("btn-insert").addEventListener("click", () => {
    if (state.preset === "sorted") insertSorted();
    else if (state.preset === "reverse") insertReverse();
    else insertRandom();
  });
  el("btn-delete").addEventListener("click", () => {
    const order = inorder(state.root);
    if (!order.length) return;
    const key = order[Math.floor(order.length / 2)];
    state.root = remove(state.root, key);
    state.searchPath = [];
    state.searchKey = null;
    updateReadouts();
    describe();
    draw();
  });
  el("btn-clear").addEventListener("click", () => {
    state.root = null;
    state.rotations = 0;
    state.searchPath = [];
    state.searchKey = null;
    updateReadouts();
    describe();
    draw();
  });
  el("btn-search").addEventListener("click", () => {
    const order = inorder(state.root);
    if (!order.length) return;
    state.searchKey = order[Math.floor(order.length / 2)];
    const res = search(state.root, state.searchKey);
    state.searchPath = res.path;
    updateReadouts();
    describe();
    draw();
  });
  el("toggle-bf").addEventListener("click", () => {
    state.showBF = !state.showBF;
    el("toggle-bf").classList.toggle("active", state.showBF);
    draw();
  });

  document.addEventListener("keydown", (evt) => {
    if (evt.key === "1") setPreset("random");
    else if (evt.key === "2") setPreset("sorted");
    else if (evt.key === "3") setPreset("reverse");
    else if (evt.key === "i" || evt.key === "I") el("btn-insert").click();
    else if (evt.key === "d" || evt.key === "D") el("btn-delete").click();
    else if (evt.key === "s" || evt.key === "S") el("btn-search").click();
    else if (evt.key === "c" || evt.key === "C") el("btn-clear").click();
  });

  window.__lab = {
    state,
    insert,
    remove,
    search,
    inorder,
    count,
    height,
    balanceFactor,
    maxBF,
    setPreset,
    updateReadouts,
    describe,
    draw,
  };

  setPreset("random");
})();
