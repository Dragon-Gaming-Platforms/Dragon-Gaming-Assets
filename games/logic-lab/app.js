(() => {
  "use strict";

  // Boolean logic lab: seven gates plus half/full adders, with truth
  // tables and a live gate diagram.

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");

  const W = canvas.width || 880;
  const H = canvas.height || 660;

  const STAGE = { x: 26, y: 50, w: 828, h: 560 };
  const GATE_BOX = { x: STAGE.x + 220, y: STAGE.y + 60, w: 300, h: 180 };
  const TABLE = { x: STAGE.x + 60, y: STAGE.y + 300, w: STAGE.w - 120, h: 220 };

  const GATES = ["AND", "OR", "XOR", "NAND", "NOR", "XNOR", "HALF", "FULL"];

  const state = {
    gate: "AND",
    a: 0,
    b: 0,
    c: 0,
  };

  /* --------------------------------------------------------------- logic core */

  function gate(type, a, b) {
    switch (type) {
      case "AND": return a & b;
      case "OR": return a | b;
      case "XOR": return a ^ b;
      case "NAND": return (a & b) ^ 1;
      case "NOR": return (a | b) ^ 1;
      case "XNOR": return (a ^ b) ^ 1;
      default: return 0;
    }
  }

  function truthTable(type) {
    const rows = [];
    for (let a = 0; a <= 1; a++) {
      for (let b = 0; b <= 1; b++) {
        rows.push({ a, b, out: gate(type, a, b) });
      }
    }
    return rows;
  }

  function halfAdder(a, b) {
    return { sum: a ^ b, carry: a & b };
  }

  function fullAdder(a, b, cin) {
    const sum = a ^ b ^ cin;
    const carry = (a & b) | (cin & (a ^ b));
    return { sum, carry };
  }

  function evaluate() {
    if (state.gate === "HALF") {
      const r = halfAdder(state.a, state.b);
      return { out: r.sum, carry: r.carry };
    }
    if (state.gate === "FULL") {
      const r = fullAdder(state.a, state.b, state.c);
      return { out: r.sum, carry: r.carry };
    }
    return { out: gate(state.gate, state.a, state.b), carry: null };
  }

  function gateLabel() {
    if (state.gate === "HALF") return "Half adder";
    if (state.gate === "FULL") return "Full adder";
    return state.gate;
  }

  /* ------------------------------------------------------------------- drawing */

  function wire(x1, y1, x2, y2, level) {
    ctx.strokeStyle = level ? "#9be15d" : "#3a4a3f";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  function drawGate() {
    const { x, y, w, h } = GATE_BOX;
    const midY = y + h / 2;
    const { out, carry } = evaluate();

    // input wires
    wire(x - 120, midY - 40, x, midY - 40, state.a);
    wire(x - 120, midY + 40, x, midY + 40, state.b);
    if (state.gate === "FULL") wire(x - 120, midY + 80, x, midY + 80, state.c);

    // input labels
    ctx.fillStyle = "#eef5ea";
    ctx.font = "bold 14px ui-monospace, Menlo, monospace";
    ctx.textAlign = "right";
    ctx.fillText("A=" + state.a, x - 126, midY - 36);
    ctx.fillText("B=" + state.b, x - 126, midY + 44);
    if (state.gate === "FULL") ctx.fillText("C=" + state.c, x - 126, midY + 84);

    // gate body
    ctx.fillStyle = "#16222a";
    ctx.strokeStyle = "#5f8d2f";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#eef5ea";
    ctx.font = "bold 20px ui-monospace, Menlo, monospace";
    ctx.textAlign = "center";
    ctx.fillText(gateLabel(), x + w / 2, midY - 4);
    ctx.font = "12px ui-monospace, Menlo, monospace";
    ctx.fillStyle = "#93a48f";
    ctx.fillText("out = " + out, x + w / 2, midY + 20);
    if (carry !== null) ctx.fillText("carry = " + carry, x + w / 2, midY + 40);

    // output wire
    wire(x + w, midY, x + w + 120, midY, out);
    ctx.fillStyle = "#eef5ea";
    ctx.font = "bold 14px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("OUT=" + out, x + w + 126, midY + 5);
    if (carry !== null) {
      wire(x + w, midY + 60, x + w + 120, midY + 60, carry);
      ctx.fillText("CARRY=" + carry, x + w + 126, midY + 65);
    }
  }

  function drawTable() {
    const { x, y, w, h } = TABLE;
    ctx.fillStyle = "#0a1014";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#26302a";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);

    const isAdder = state.gate === "HALF" || state.gate === "FULL";
    const cols = isAdder ? (state.gate === "FULL" ? ["A", "B", "C", "SUM", "CARRY"] : ["A", "B", "SUM", "CARRY"]) : ["A", "B", "OUT"];
    const rows = isAdder ? 8 : 4;
    const cw = w / cols.length;
    const rh = h / (rows + 1);

    ctx.font = "bold 12px ui-monospace, Menlo, monospace";
    ctx.textAlign = "center";
    cols.forEach((c, i) => {
      ctx.fillStyle = "#93a48f";
      ctx.fillText(c, x + i * cw + cw / 2, y + rh * 0.7);
    });

    for (let r = 0; r < rows; r++) {
      const a = (r >> 2) & 1;
      const b = (r >> 1) & 1;
      const c = r & 1;
      let vals;
      if (state.gate === "FULL") {
        const f = fullAdder(a, b, c);
        vals = [a, b, c, f.sum, f.carry];
      } else if (state.gate === "HALF") {
        const f = halfAdder(a, b);
        vals = [a, b, f.sum, f.carry];
      } else {
        vals = [a, b, gate(state.gate, a, b)];
      }
      const active = a === state.a && b === state.b && (state.gate !== "FULL" || c === state.c);
      vals.forEach((v, i) => {
        ctx.fillStyle = active ? "#e4ffd7" : v ? "#9be15d" : "#74868f";
        ctx.font = (active ? "bold " : "") + "13px ui-monospace, Menlo, monospace";
        ctx.fillText(String(v), x + i * cw + cw / 2, y + rh * (r + 1.7));
      });
      if (active) {
        ctx.strokeStyle = "#5f8d2f";
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 2, y + rh * (r + 1) + 2, w - 4, rh - 4);
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#070907";
    ctx.fillRect(STAGE.x, STAGE.y, STAGE.w, STAGE.h);
    drawGate();
    drawTable();
  }

  /* ------------------------------------------------------------------ readouts */

  function updateReadouts() {
    const { out, carry } = evaluate();
    el("btn-a").textContent = "A = " + state.a;
    el("btn-b").textContent = "B = " + state.b;
    el("btn-c").textContent = "C = " + state.c;

    el("out-hud").textContent = "output " + out;
    el("gate-hud").textContent = "gate " + gateLabel();
    el("rows-hud").textContent = "rows " + (state.gate === "FULL" ? 8 : 4);

    el("gate-read").textContent = gateLabel();
    el("a-read").textContent = String(state.a);
    el("b-read").textContent = String(state.b);
    el("c-read").textContent = state.gate === "FULL" ? String(state.c) : "—";
    el("out-read").textContent = String(out);
    el("carry-read").textContent = carry === null ? "—" : String(carry);
  }

  function describe() {
    const { out, carry } = evaluate();
    let msg;
    if (state.gate === "AND") msg = "AND is 1 only when both inputs are 1. It is the only gate that needs agreement.";
    else if (state.gate === "OR") msg = "OR is 1 when either input is 1. It is the gate of inclusion — one is enough.";
    else if (state.gate === "XOR") msg = "XOR is 1 when the inputs differ. It is addition without the carry — the heart of every adder.";
    else if (state.gate === "NAND") msg = "NAND is AND followed by NOT. It is functionally complete: every other gate can be built from NANDs alone.";
    else if (state.gate === "NOR") msg = "NOR is OR followed by NOT. Like NAND, it is functionally complete on its own.";
    else if (state.gate === "XNOR") msg = "XNOR is 1 when the inputs match — the equality gate. It is XOR inverted.";
    else if (state.gate === "HALF") msg = "Half adder: sum = A XOR B, carry = A AND B. It adds two bits but cannot take a carry-in — that is what the full adder adds.";
    else msg = "Full adder: sum = A XOR B XOR C, carry = majority(A, B, C). Chain these and you get binary addition — the CPU's arithmetic unit.";
    el("status").textContent = msg;
  }

  /* -------------------------------------------------------------------- wiring */

  function setGate(name) {
    if (!GATES.includes(name)) return;
    state.gate = name;
    ["and", "or", "xor", "nand", "nor", "xnor", "half", "full"].forEach((kk) => {
      el("preset-" + kk).classList.toggle("active", kk.toUpperCase() === name || (kk === "half" && name === "HALF") || (kk === "full" && name === "FULL"));
    });
    updateReadouts();
    describe();
    draw();
  }

  el("btn-a").addEventListener("click", () => { state.a ^= 1; updateReadouts(); describe(); draw(); });
  el("btn-b").addEventListener("click", () => { state.b ^= 1; updateReadouts(); describe(); draw(); });
  el("btn-c").addEventListener("click", () => { state.c ^= 1; updateReadouts(); describe(); draw(); });

  el("preset-and").addEventListener("click", () => setGate("AND"));
  el("preset-or").addEventListener("click", () => setGate("OR"));
  el("preset-xor").addEventListener("click", () => setGate("XOR"));
  el("preset-nand").addEventListener("click", () => setGate("NAND"));
  el("preset-nor").addEventListener("click", () => setGate("NOR"));
  el("preset-xnor").addEventListener("click", () => setGate("XNOR"));
  el("preset-half").addEventListener("click", () => setGate("HALF"));
  el("preset-full").addEventListener("click", () => setGate("FULL"));

  document.addEventListener("keydown", (evt) => {
    const map = { "1": "AND", "2": "OR", "3": "XOR", "4": "NAND", "5": "NOR", "6": "XNOR", "7": "HALF", "8": "FULL" };
    if (map[evt.key]) setGate(map[evt.key]);
    else if (evt.key === "a" || evt.key === "A") el("btn-a").click();
    else if (evt.key === "b" || evt.key === "B") el("btn-b").click();
    else if (evt.key === "c" || evt.key === "C") el("btn-c").click();
  });

  window.__lab = {
    state,
    GATES,
    gate,
    truthTable,
    halfAdder,
    fullAdder,
    evaluate,
    setGate,
    updateReadouts,
    describe,
    draw,
  };

  updateReadouts();
  describe();
  draw();
})();
