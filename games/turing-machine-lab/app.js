(() => {
  "use strict";

  const BLANK = "_";
  const MAX_TAPE = 4000;
  const MAX_STEPS = 4000;

  const PROGRAMS = {
    increment: {
      name: "Binary +1",
      start: "A",
      tape: "1011",
      note: "Scan right to the blank, then carry left — binary increment by hand.",
      rules: {
        A: { 0: "0 R A", 1: "1 R A", _: "_ L B" },
        B: { 0: "1 N H", 1: "0 L B", _: "1 N H" },
      },
    },
    beaver: {
      name: "Busy beaver (3-state)",
      start: "A",
      tape: "",
      note: "Three states, two symbols, and the longest run the table allows before halting.",
      rules: {
        A: { _: "1 R B", 1: "1 R H" },
        B: { _: "_ R C", 1: "1 R B" },
        C: { _: "1 L C", 1: "1 L A" },
      },
    },
    complement: {
      name: "Binary complement",
      start: "A",
      tape: "10110",
      note: "Flip every bit until the blank, then stop.",
      rules: {
        A: { 0: "1 R A", 1: "0 R A", _: "_ L H" },
      },
    },
    custom: {
      name: "Custom rules",
      start: "A",
      tape: "101",
      note: "Your own table. Rules are state → symbol → \"write move next\".",
      rules: {
        A: { 0: "1 R A", 1: "0 L A", _: "_ N H" },
      },
    },
  };

  const canvas = document.getElementById("scene");
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;
  const CW = 46;
  const STRIP_Y = 132;
  const STRIP_H = 76;

  const el = (id) => document.getElementById(id);

  const state = {
    rules: {},
    startState: "A",
    tape: new Map(),
    head: 0,
    startCell: 0,
    machine: "A",
    steps: 0,
    running: false,
    halted: false,
    visited: new Set(),
    written: new Map(),
    lastMove: "R",
    animHead: 0,
    accumulator: 0,
    lastTime: 0,
    source: "increment",
    verdict: "ready",
  };

  /* ---------------------------------------------------------------- rules */

  function parseRules(source) {
    if (!source || typeof source !== "object" || Array.isArray(source)) {
      throw new Error("Rules must be a JSON object keyed by state.");
    }
    const parsed = {};
    for (const [name, row] of Object.entries(source)) {
      if (!row || typeof row !== "object") throw new Error(`State ${name} needs a symbol table.`);
      parsed[name] = {};
      for (const [symbol, value] of Object.entries(row)) {
        if (symbol.length !== 1) throw new Error(`Symbol "${symbol}" must be one character.`);
        let write;
        let move;
        let next;
        if (typeof value === "string") {
          const parts = value.trim().split(/\s+/);
          if (parts.length !== 3) throw new Error(`${name}/${symbol} needs "write move next".`);
          [write, move, next] = parts;
        } else if (value && typeof value === "object") {
          write = value.write;
          move = value.move;
          next = value.next;
        } else {
          throw new Error(`${name}/${symbol} must be a string or an object.`);
        }
        if (!write || write.length !== 1) throw new Error(`${name}/${symbol} writes one symbol.`);
        const direction = String(move).toUpperCase();
        if (!["L", "R", "N"].includes(direction)) {
          throw new Error(`${name}/${symbol} moves L, R or N.`);
        }
        if (!next || typeof next !== "string") throw new Error(`${name}/${symbol} needs a next state.`);
        parsed[name][symbol] = { write, move: direction, next };
      }
    }
    if (!Object.keys(parsed).length) throw new Error("The rule table is empty.");
    return parsed;
  }

  function serialiseRules(rules) {
    const out = {};
    for (const [name, row] of Object.entries(rules)) {
      out[name] = {};
      for (const [symbol, rule] of Object.entries(row)) {
        out[name][symbol] = `${rule.write} ${rule.move} ${rule.next}`;
      }
    }
    return out;
  }

  /* ---------------------------------------------------------------- tape */

  function readSymbol(index) {
    return state.tape.get(index) || BLANK;
  }

  function writeSymbol(index, symbol) {
    if (symbol === BLANK) {
      state.tape.delete(index);
      return;
    }
    state.tape.set(index, symbol);
  }

  function tapeBounds() {
    if (!state.tape.size) return { lo: 0, hi: 0 };
    let lo = Infinity;
    let hi = -Infinity;
    for (const key of state.tape.keys()) {
      if (key < lo) lo = key;
      if (key > hi) hi = key;
    }
    return { lo, hi };
  }

  function tapeString() {
    const { lo, hi } = tapeBounds();
    let out = "";
    for (let i = lo; i <= hi; i++) out += readSymbol(i);
    return out;
  }

  function tapeSummary() {
    const text = tapeString();
    const ones = (text.match(/1/g) || []).length;
    const zeros = (text.match(/0/g) || []).length;
    const trimmed = text.replace(/^_+|_+$/g, "");
    let value = "";
    if (trimmed && trimmed.length <= 24 && /^[01]+$/.test(trimmed)) {
      value = ` = ${parseInt(trimmed, 2)} in decimal`;
    }
    return { text: trimmed || "blank", ones, zeros, value };
  }

  function loadTape(raw, startCell) {
    state.tape = new Map();
    state.startCell = Math.max(0, Math.min(60, Number(startCell) || 0));
    const clean = String(raw || "").replace(/[^01_]/g, "");
    for (let i = 0; i < clean.length && i < MAX_TAPE; i++) {
      if (clean[i] !== BLANK) state.tape.set(state.startCell + i, clean[i]);
    }
    state.head = state.startCell;
    state.animHead = state.startCell;
    state.visited = new Set([state.head]);
    state.written = new Map();
  }

  /* ---------------------------------------------------------------- machine */

  function resetMachine(reloadRules) {
    const program = PROGRAMS[state.source] || PROGRAMS.increment;
    if (reloadRules) {
      state.rules = parseRules(program.rules);
      state.startState = program.start;
      el("rules-json").value = JSON.stringify(serialiseRules(program.rules), null, 2);
    }
    state.machine = state.startState;
    state.steps = 0;
    state.halted = false;
    state.running = false;
    state.accumulator = 0;
    state.lastMove = "R";
    state.verdict = "ready";
    loadTape(el("tape-input").value, el("start-cell").value);
    el("toggle").textContent = "Run";
    updateHud();
    setStatus(`${program.name} ready at cell ${state.startCell}. Tape is ${cleanTapeLabel()}.`);
  }

  function cleanTapeLabel() {
    return tapeString().replace(/^_+|_+$/g, "") || "blank";
  }

  function stepOnce() {
    if (state.halted) return false;
    if (state.steps >= MAX_STEPS) {
      halt(`Step budget of ${MAX_STEPS.toLocaleString("en-US")} spent.`);
      return false;
    }
    const symbol = readSymbol(state.head);
    const row = state.rules[state.machine];
    const rule = row ? row[symbol] : undefined;
    if (!rule) {
      halt(undefined, `No rule for state ${state.machine} reading "${symbol}".`);
      return false;
    }

    if (rule.write !== symbol) {
      writeSymbol(state.head, rule.write);
      state.written.set(state.head, rule.write);
    }
    state.lastMove = rule.move;
    const previous = state.head;
    if (rule.move === "L") state.head -= 1;
    else if (rule.move === "R") state.head += 1;
    state.steps += 1;
    state.machine = rule.next;
    state.visited.add(state.head);
    state.visited.add(previous);

    if (rule.next === "H" || !state.rules[rule.next]) {
      halt();
      return true;
    }
    updateHud();
    return true;
  }

  function halt(reason, detail) {
    state.halted = true;
    state.running = false;
    state.verdict = "halted";
    el("toggle").textContent = "Run";
    const summary = tapeSummary();
    const tail = `Tape reads ${summary.text}${summary.value}; ${summary.ones} one${summary.ones === 1 ? "" : "s"} written.`;
    setStatus(
      reason || detail
        ? `Stopped after ${stepWord()} — ${detail || reason} ${tail}`
        : `Halted after ${stepWord()} in state ${state.machine}. ${tail}`
    );
    updateHud();
  }

  function stepWord() {
    return `${state.steps} step${state.steps === 1 ? "" : "s"}`;
  }

  function updateHud() {
    el("state-read").textContent = state.halted ? `state ${state.machine} (halted)` : `state ${state.machine}`;
    el("step-read").textContent = stepWord();
    el("verdict-read").textContent = state.halted
      ? "halted"
      : state.running
        ? "running"
        : state.steps
          ? "paused"
          : "ready";
    el("verdict-read").style.color = state.halted ? "#f6ad55" : "#4fd1c5";
  }

  function setStatus(text) {
    el("status").textContent = text;
  }

  /* ---------------------------------------------------------------- drawing */

  function roundRect(x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  function drawBackground() {
    ctx.fillStyle = "#070a0e";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(79, 209, 197, 0.06)";
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 46) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += 46) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(W, y + 0.5);
      ctx.stroke();
    }
  }

  function drawStrip() {
    const centre = W / 2;
    const headX = state.animHead;
    const minIndex = Math.floor(headX) - 10;
    const maxIndex = Math.ceil(headX) + 10;

    for (let index = minIndex; index <= maxIndex; index++) {
      const x = centre + (index - headX) * CW;
      const isHead = index === state.head;
      const symbol = readSymbol(index);
      const touched = state.written.has(index);
      const seen = state.visited.has(index);

      ctx.save();
      if (isHead) {
        ctx.shadowColor = "rgba(79, 209, 197, 0.55)";
        ctx.shadowBlur = 22;
        ctx.fillStyle = "#123c3b";
      } else if (touched) {
        ctx.fillStyle = "#241d10";
      } else if (seen) {
        ctx.fillStyle = "#121c26";
      } else {
        ctx.fillStyle = "#0c1219";
      }
      roundRect(x + 3, STRIP_Y, CW - 6, STRIP_H, 8);
      ctx.fill();
      ctx.restore();

      ctx.lineWidth = isHead ? 2 : 1;
      ctx.strokeStyle = isHead
        ? "#4fd1c5"
        : touched
          ? "#a97b31"
          : seen
            ? "#2c3d4e"
            : "#1a2532";
      roundRect(x + 3, STRIP_Y, CW - 6, STRIP_H, 8);
      ctx.stroke();

      if (x > -CW && x < W + CW) {
        ctx.fillStyle = symbol === BLANK ? "#40566b" : isHead ? "#e6fff9" : "#cfe0ef";
        ctx.font = `${symbol === BLANK ? "italic " : ""}600 ${symbol === BLANK ? 18 : 26}px ui-monospace, Menlo, monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(symbol === BLANK ? "·" : symbol, x + CW / 2, STRIP_Y + STRIP_H / 2 + 1);
      }
    }

    const headCellX = centre;
    ctx.fillStyle = "#4fd1c5";
    ctx.beginPath();
    ctx.moveTo(headCellX - 7, STRIP_Y - 12);
    ctx.lineTo(headCellX + 7, STRIP_Y - 12);
    ctx.lineTo(headCellX, STRIP_Y - 2);
    ctx.closePath();
    ctx.fill();
  }

  function drawStateBadge() {
    const text = state.halted ? `${state.machine} · halt` : `${state.machine}`;
    ctx.font = '600 15px ui-monospace, Menlo, monospace';
    const width = Math.max(64, ctx.measureText(text).width + 34);
    const x = W / 2 - width / 2;
    const y = 34;
    ctx.fillStyle = state.halted ? "rgba(246, 173, 85, 0.16)" : "rgba(79, 209, 197, 0.14)";
    roundRect(x, y, width, 38, 12);
    ctx.fill();
    ctx.strokeStyle = state.halted ? "#f6ad55" : "#2f7d77";
    ctx.lineWidth = 1.5;
    roundRect(x, y, width, 38, 12);
    ctx.stroke();
    ctx.fillStyle = state.halted ? "#ffd7a1" : "#bff7f0";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = '600 15px ui-monospace, Menlo, monospace';
    ctx.fillText(text, W / 2, y + 20);
  }

  function drawMoveArrow() {
    if (!state.steps || state.halted) return;
    const dir = state.lastMove === "L" ? -1 : state.lastMove === "R" ? 1 : 0;
    if (!dir) return;
    const y = STRIP_Y + STRIP_H + 34;
    ctx.strokeStyle = "rgba(79, 209, 197, 0.75)";
    ctx.lineWidth = 2;
    const x0 = W / 2 - dir * 26;
    const x1 = W / 2 + dir * 26;
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(x1, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.lineTo(x1 - dir * 9, y - 6);
    ctx.lineTo(x1 - dir * 9, y + 6);
    ctx.closePath();
    ctx.fillStyle = "rgba(79, 209, 197, 0.9)";
    ctx.fill();
    ctx.fillStyle = "#6f8fa6";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "center";
    ctx.fillText(`head ${state.head}`, W / 2, y + 26);
  }

  function drawFooter() {
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#4d6479";
    ctx.font = "12px ui-monospace, Menlo, monospace";
    ctx.fillText(`tape window · cell ${Math.floor(state.animHead)}`, 22, H - 20);
    ctx.textAlign = "right";
    ctx.fillStyle = "#7d94a9";
    ctx.fillText(
      `${state.steps}/${MAX_STEPS} steps · ${state.halted ? "halted" : state.running ? "running" : "idle"}`,
      W - 22,
      H - 20
    );
    ctx.textAlign = "left";
  }

  function draw() {
    drawBackground();
    drawStateBadge();
    drawStrip();
    drawMoveArrow();
    drawFooter();
  }

  /* ---------------------------------------------------------------- loop */

  function frame(timestamp) {
    if (!state.lastTime) state.lastTime = timestamp;
    const dt = Math.max(0, Math.min(80, timestamp - state.lastTime));
    state.lastTime = timestamp;

    const target = state.head;
    if (Math.abs(state.animHead - target) < 0.002) state.animHead = target;
    else state.animHead += (target - state.animHead) * 0.28;

    if (state.running) {
      state.accumulator += (dt / 1000) * Number(el("speed").value || 8);
      let guard = 0;
      while (state.accumulator >= 1 && state.running && guard < 64) {
        state.accumulator -= 1;
        stepOnce();
        guard++;
      }
    }

    draw();
    requestAnimationFrame(frame);
  }

  /* ---------------------------------------------------------------- wiring */

  function toggleRun() {
    if (state.halted) {
      resetMachine(false);
      return;
    }
    state.running = !state.running;
    state.accumulator = 0;
    el("toggle").textContent = state.running ? "Pause" : "Run";
    updateHud();
    if (state.running) {
      setStatus(
        `Running ${PROGRAMS[state.source].name} at ${el("speed").value} steps per second.`
      );
    } else {
      setStatus(`Paused after ${stepWord()} in state ${state.machine} at cell ${state.head}.`);
    }
  }

  function loadFromInputs() {
    const program = PROGRAMS[state.source];
    if (state.source !== "custom") {
      state.rules = parseRules(program.rules);
      state.startState = program.start;
    }
    state.machine = program.start;
    state.steps = 0;
    state.halted = false;
    state.running = false;
    state.lastMove = "R";
    state.verdict = "ready";
    loadTape(el("tape-input").value, el("start-cell").value);
    el("toggle").textContent = "Run";
    updateHud();
    setStatus(`Tape loaded at cell ${state.startCell}: ${cleanTapeLabel()}.`);
    draw();
  }

  function applyRules() {
    let parsed;
    try {
      parsed = parseRules(JSON.parse(el("rules-json").value));
    } catch (error) {
      setStatus(`Rule table rejected — ${error.message}`);
      return;
    }
    state.rules = parsed;
    state.source = "custom";
    el("program").value = "custom";
    state.startState = Object.keys(parsed)[0];
    state.machine = state.startState;
    state.steps = 0;
    state.halted = false;
    state.running = false;
    el("toggle").textContent = "Run";
    loadTape(el("tape-input").value, el("start-cell").value);
    el("rules-json").value = JSON.stringify(serialiseRules(parsed), null, 2);
    updateHud();
    setStatus(`Custom table accepted — ${Object.keys(parsed).length} state(s), starting in ${state.startState}.`);
    draw();
  }

  el("program").addEventListener("change", () => {
    const key = el("program").value;
    state.source = key;
    const program = PROGRAMS[key];
    el("tape-input").value = program.tape;
    el("start-cell").value = "0";
    resetMachine(true);
    setStatus(`${program.name} loaded. ${program.note}`);
  });

  el("load").addEventListener("click", loadFromInputs);
  el("apply").addEventListener("click", applyRules);
  el("toggle").addEventListener("click", toggleRun);

  el("step").addEventListener("click", () => {
    if (state.running) toggleRun();
    if (state.halted) return;
    stepOnce();
    draw();
  });

  el("reset").addEventListener("click", () => {
    resetMachine(false);
    draw();
  });

  el("speed").addEventListener("input", () => {
    el("speed-out").textContent = el("speed").value;
  });

  el("tape-input").addEventListener("keydown", (event) => {
    if (event.key === "Enter") loadFromInputs();
  });

  document.addEventListener("keydown", (event) => {
    const tag = (event.target && event.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (event.code === "Space") {
      event.preventDefault();
      toggleRun();
    } else if (event.key === "s" || event.key === "S") {
      stepOnce();
      draw();
    } else if (event.key === "r" || event.key === "R") {
      resetMachine(false);
      draw();
    }
  });

  state.source = el("program").value;
  el("speed").value = "8";
  el("speed-out").textContent = "8";
  el("tape-input").value = PROGRAMS[state.source].tape;
  resetMachine(true);
  requestAnimationFrame(frame);
})();
