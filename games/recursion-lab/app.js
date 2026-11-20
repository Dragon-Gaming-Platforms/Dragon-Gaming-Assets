(() => {
  "use strict";

  // Recursion lab: Tower of Hanoi, Fibonacci call tree, factorial chain.
  // Each demo is precomputed as a list of steps; Step/Run walk through them.

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");

  const W = canvas.width || 880;
  const H = canvas.height || 660;

  const STAGE = { x: 26, y: 50, w: 828, h: 560 };

  const state = {
    demo: "hanoi",
    n: 4,
    fibn: 10,
    step: 0,
    steps: [], // precomputed animation frames
    calls: 0,
    depth: 0,
    result: null,
  };

  /* -------------------------------------------------------------- recursion */

  function hanoiMoves(n) {
    return Math.pow(2, n) - 1;
  }

  function hanoiSolution(n) {
    const moves = [];
    (function solve(k, from, to, aux) {
      if (k === 0) return;
      solve(k - 1, from, aux, to);
      moves.push({ disk: k, from, to });
      solve(k - 1, aux, to, from);
    })(n, 0, 2, 1);
    return moves;
  }

  function fib(n) {
    if (n <= 1) return n;
    let a = 0, b = 1;
    for (let i = 2; i <= n; i++) {
      const t = a + b;
      a = b; b = t;
    }
    return b;
  }

  function fibCallCount(n) {
    return 2 * fib(n + 1) - 1;
  }

  function fibTree(n) {
    // returns the call tree as nested {n, left, right}
    if (n <= 1) return { n, left: null, right: null };
    return { n, left: fibTree(n - 1), right: fibTree(n - 2) };
  }

  function factorial(n) {
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  }

  function countCalls(tree) {
    if (!tree) return 0;
    return 1 + countCalls(tree.left) + countCalls(tree.right);
  }

  function treeDepth(tree) {
    if (!tree) return 0;
    return 1 + Math.max(treeDepth(tree.left), treeDepth(tree.right));
  }

  /* ------------------------------------------------------------- step builders */

  function buildHanoi() {
    const moves = hanoiSolution(state.n);
    const pegs = [[], [], []];
    for (let d = state.n; d >= 1; d--) pegs[0].push(d);
    const frames = [{ pegs: pegs.map((p) => [...p]), calls: 0 }];
    moves.forEach((mv, i) => {
      const disk = pegs[mv.from].pop();
      pegs[mv.to].push(disk);
      frames.push({ pegs: pegs.map((p) => [...p]), calls: i + 1, move: mv });
    });
    return { frames, calls: moves.length, depth: state.n, result: "tower moved", optimal: hanoiMoves(state.n) };
  }

  function buildFib() {
    const tree = fibTree(state.fibn);
    const calls = countCalls(tree);
    const depth = treeDepth(tree);
    // flatten the tree into a list of nodes for drawing (cap for display)
    const nodes = [];
    (function walk(t, x, y, w) {
      if (!t || nodes.length > 500) return;
      nodes.push({ n: t.n, x, y });
      if (t.left) walk(t.left, x - w / 2, y + 40, w / 2);
      if (t.right) walk(t.right, x + w / 2, y + 40, w / 2);
    })(tree, 0, 0, 400);
    return { frames: [{ nodes, calls: 0 }], calls, depth, result: "fib(" + state.fibn + ") = " + fib(state.fibn), optimal: fibCallCount(state.fibn) };
  }

  function buildFact() {
    const chain = [];
    for (let i = state.n; i >= 0; i--) chain.push(i);
    return { frames: [{ chain, calls: 0 }], calls: state.n + 1, depth: state.n + 1, result: state.n + "! = " + factorial(state.n), optimal: state.n + 1 };
  }

  function build() {
    if (state.demo === "hanoi") return buildHanoi();
    if (state.demo === "fib") return buildFib();
    return buildFact();
  }

  /* ------------------------------------------------------------------- drawing */

  function drawHanoi(frame) {
    const pegX = [STAGE.x + 140, STAGE.x + STAGE.w / 2, STAGE.x + STAGE.w - 140];
    const baseY = STAGE.y + STAGE.h - 60;
    // pegs
    ctx.strokeStyle = "#7cc4ff";
    ctx.lineWidth = 3;
    pegX.forEach((x) => {
      ctx.beginPath();
      ctx.moveTo(x, baseY - 260);
      ctx.lineTo(x, baseY);
      ctx.stroke();
    });
    ctx.strokeStyle = "#3a4a3f";
    ctx.beginPath();
    ctx.moveTo(STAGE.x + 40, baseY);
    ctx.lineTo(STAGE.x + STAGE.w - 40, baseY);
    ctx.stroke();
    // disks
    const colors = ["#9be15d", "#7cc4ff", "#ffb45f", "#d59bff", "#ff8fa3", "#6ff0c8", "#ffd166", "#8fb3ff"];
    frame.pegs.forEach((peg, pi) => {
      peg.forEach((disk, di) => {
        const w = 30 + disk * 22;
        ctx.fillStyle = colors[(disk - 1) % colors.length];
        ctx.fillRect(pegX[pi] - w / 2, baseY - (di + 1) * 22, w, 18);
      });
    });
    ctx.fillStyle = "#93a48f";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "center";
    ctx.fillText("move " + frame.calls + " / " + hanoiMoves(state.n), STAGE.x + STAGE.w / 2, STAGE.y + 20);
  }

  function drawFib(frame) {
    if (!frame.nodes) return;
    const cx = STAGE.x + STAGE.w / 2;
    const cy = STAGE.y + 40;
    const scale = Math.min(1, (STAGE.w - 60) / 800);
    frame.nodes.forEach((nd) => {
      const x = cx + nd.x * scale;
      const y = cy + nd.y;
      ctx.fillStyle = "#9be15d";
      ctx.beginPath();
      ctx.arc(x, y, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#0a0805";
      ctx.font = "bold 9px ui-monospace, Menlo, monospace";
      ctx.textAlign = "center";
      ctx.fillText(String(nd.n), x, y + 3);
    });
    ctx.fillStyle = "#93a48f";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "center";
    ctx.fillText("fib(" + state.fibn + ") call tree (" + frame.nodes.length + " nodes shown)", cx, STAGE.y + 20);
  }

  function drawFact(frame) {
    if (!frame.chain) return;
    const cx = STAGE.x + STAGE.w / 2;
    const cy = STAGE.y + 60;
    frame.chain.forEach((v, i) => {
      const x = cx + (i - frame.chain.length / 2) * 70;
      const y = cy + i * 46;
      ctx.strokeStyle = "#5f8d2f";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#eef5ea";
      ctx.font = "bold 13px ui-monospace, Menlo, monospace";
      ctx.textAlign = "center";
      ctx.fillText(String(v), x, y + 4);
      if (i < frame.chain.length - 1) {
        ctx.strokeStyle = "rgba(130,150,169,0.5)";
        ctx.beginPath();
        ctx.moveTo(x, y + 20);
        ctx.lineTo(x, y + 26);
        ctx.stroke();
      }
    });
    ctx.fillStyle = "#93a48f";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "center";
    ctx.fillText("factorial call chain", cx, STAGE.y + 20);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#070907";
    ctx.fillRect(STAGE.x, STAGE.y, STAGE.w, STAGE.h);
    const frame = state.steps[Math.min(state.step, state.steps.length - 1)];
    if (!frame) return;
    if (state.demo === "hanoi") drawHanoi(frame);
    else if (state.demo === "fib") drawFib(frame);
    else drawFact(frame);
  }

  /* ------------------------------------------------------------------ readouts */

  function updateReadouts() {
    const built = build();
    const done = state.step >= built.frames.length - 1;
    el("n-out").textContent = String(state.n);
    el("fibn-out").textContent = String(state.fibn);

    el("calls-hud").textContent = "calls " + built.calls;
    el("depth-hud").textContent = "depth " + built.depth;
    el("moves-hud").textContent = "moves " + (state.demo === "hanoi" ? built.calls : "—");

    el("calls-read").textContent = String(built.calls);
    el("depth-read").textContent = String(built.depth);
    el("moves-read").textContent = state.demo === "hanoi" ? String(built.calls) : "—";
    el("result-read").textContent = done ? built.result : "…";
    el("opt-read").textContent = String(built.optimal);
    el("prog-read").textContent = built.frames.length <= 1 ? "done" : Math.min(100, Math.round((state.step / (built.frames.length - 1)) * 100)) + "%";
  }

  function describe() {
    let msg;
    if (state.demo === "hanoi") {
      msg = "Hanoi needs exactly 2ⁿ − 1 = " + hanoiMoves(state.n) + " moves for " + state.n + " disks. The recursion proves it: move n−1 disks out of the way, move the largest, move n−1 again. No shortcut exists.";
    } else if (state.demo === "fib") {
      msg = "Naive fib(" + state.fibn + ") makes " + fibCallCount(state.fibn) + " calls to compute " + fib(state.fibn) + " — it recomputes the same subproblems over and over. Memoisation would cut this to " + (state.fibn + 1) + " calls.";
    } else {
      msg = "Factorial is linear recursion: " + state.n + "! calls itself " + (state.n + 1) + " times, each call one smaller, until it hits the base case 0! = 1 and unwinds.";
    }
    el("status").textContent = msg;
  }

  /* -------------------------------------------------------------------- wiring */

  function setDemo(name) {
    state.demo = name;
    state.step = 0;
    ["hanoi", "fib", "fact"].forEach((kk) => {
      el("preset-" + kk).classList.toggle("active", kk === name);
    });
    const built = build();
    state.steps = built.frames;
    updateReadouts();
    describe();
    draw();
  }

  el("n").addEventListener("input", (evt) => {
    state.n = Math.max(3, Math.min(8, Number(evt.target.value) || 4));
    setDemo(state.demo);
  });
  el("fibn").addEventListener("input", (evt) => {
    state.fibn = Math.max(5, Math.min(20, Number(evt.target.value) || 10));
    setDemo(state.demo);
  });

  el("preset-hanoi").addEventListener("click", () => setDemo("hanoi"));
  el("preset-fib").addEventListener("click", () => setDemo("fib"));
  el("preset-fact").addEventListener("click", () => setDemo("fact"));

  el("btn-step").addEventListener("click", () => {
    state.step = Math.min(state.steps.length - 1, state.step + 1);
    updateReadouts();
    describe();
    draw();
  });
  el("btn-run").addEventListener("click", () => {
    state.step = state.steps.length - 1;
    updateReadouts();
    describe();
    draw();
  });
  el("btn-reset").addEventListener("click", () => setDemo(state.demo));

  document.addEventListener("keydown", (evt) => {
    if (evt.key === "1") setDemo("hanoi");
    else if (evt.key === "2") setDemo("fib");
    else if (evt.key === "3") setDemo("fact");
    else if (evt.key === " ") {
      evt.preventDefault();
      el("btn-step").click();
    } else if (evt.key === "g" || evt.key === "G") el("btn-run").click();
    else if (evt.key === "r" || evt.key === "R") el("btn-reset").click();
  });

  window.__lab = {
    state,
    hanoiMoves,
    hanoiSolution,
    fib,
    fibCallCount,
    fibTree,
    factorial,
    countCalls,
    treeDepth,
    setDemo,
    updateReadouts,
    describe,
    draw,
  };

  setDemo("hanoi");
})();
