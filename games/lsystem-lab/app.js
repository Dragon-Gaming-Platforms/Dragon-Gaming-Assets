(() => {
  "use strict";

  // L-systems: an axiom string rewritten by parallel rules, then drawn by a
  // turtle. F = step forward, + / - = turn, [ / ] = push / pop the stack.

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");

  const W = canvas.width || 880;
  const H = canvas.height || 660;

  const STAGE = { x: 26, y: 50, w: 828, h: 560 };

  const PRESETS = {
    koch: {
      label: "Koch",
      axiom: "F",
      rules: { F: "F+F--F+F" },
      angle: 60,
      iter: 4,
      dim: Math.log(4) / Math.log(3),
      ruleText: "F → F+F--F+F",
    },
    dragon: {
      label: "Dragon",
      axiom: "FX",
      rules: { X: "X+YF+", Y: "-FX-Y" },
      angle: 90,
      iter: 10,
      dim: 2,
      ruleText: "X → X+YF+, Y → −FX−Y",
    },
    plant: {
      label: "Plant",
      axiom: "X",
      rules: { X: "F[+X][-X]FX", F: "FF" },
      angle: 25,
      iter: 5,
      dim: 1.5,
      ruleText: "X → F[+X][−X]FX, F → FF",
    },
    sierpinski: {
      label: "Sierpinski",
      axiom: "F--F--F",
      rules: { F: "F--F--F" },
      angle: 60,
      iter: 5,
      dim: Math.log(3) / Math.log(2),
      ruleText: "F → F--F--F",
    },
  };

  const state = {
    preset: "koch",
    iter: 4,
    angle: 60,
    string: "",
  };

  /* --------------------------------------------------------------- l-system */

  function expand(axiom, rules, n) {
    let s = axiom;
    for (let i = 0; i < n; i++) {
      let next = "";
      for (const ch of s) next += rules[ch] !== undefined ? rules[ch] : ch;
      s = next;
      if (s.length > 200000) break; // safety cap
    }
    return s;
  }

  function turtleSegments(str, angleDeg, step) {
    const segs = [];
    let x = 0, y = 0, heading = -Math.PI / 2; // start pointing up
    const stack = [];
    const turn = (angleDeg * Math.PI) / 180;
    for (const ch of str) {
      if (ch === "F") {
        const nx = x + Math.cos(heading) * step;
        const ny = y + Math.sin(heading) * step;
        segs.push([x, y, nx, ny]);
        x = nx; y = ny;
      } else if (ch === "+") heading += turn;
      else if (ch === "-") heading -= turn;
      else if (ch === "[") stack.push([x, y, heading]);
      else if (ch === "]") {
        const s = stack.pop();
        if (s) { x = s[0]; y = s[1]; heading = s[2]; }
      }
    }
    return segs;
  }

  function countSegments(str) {
    let n = 0;
    for (const ch of str) if (ch === "F") n++;
    return n;
  }

  /* ------------------------------------------------------------------- drawing */

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#070907";
    ctx.fillRect(STAGE.x, STAGE.y, STAGE.w, STAGE.h);

    const p = PRESETS[state.preset];
    const segs = turtleSegments(state.string, state.angle, 1);
    if (!segs.length) return;

    // fit to stage
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    segs.forEach(([x1, y1, x2, y2]) => {
      minX = Math.min(minX, x1, x2); maxX = Math.max(maxX, x1, x2);
      minY = Math.min(minY, y1, y2); maxY = Math.max(maxY, y1, y2);
    });
    const bw = Math.max(1, maxX - minX);
    const bh = Math.max(1, maxY - minY);
    const scale = Math.min((STAGE.w - 40) / bw, (STAGE.h - 40) / bh);
    const ox = STAGE.x + (STAGE.w - bw * scale) / 2 - minX * scale;
    const oy = STAGE.y + (STAGE.h - bh * scale) / 2 - minY * scale;

    ctx.strokeStyle = "#9be15d";
    ctx.lineWidth = Math.max(1, Math.min(3, scale / 8));
    ctx.beginPath();
    segs.forEach(([x1, y1, x2, y2]) => {
      ctx.moveTo(ox + x1 * scale, oy + y1 * scale);
      ctx.lineTo(ox + x2 * scale, oy + y2 * scale);
    });
    ctx.stroke();

    ctx.fillStyle = "#93a48f";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(
      p.label + "  iter=" + state.iter + "  angle=" + state.angle + "°  " + p.ruleText,
      STAGE.x + 8,
      STAGE.y + 16
    );
  }

  /* ------------------------------------------------------------------ readouts */

  function updateReadouts() {
    const p = PRESETS[state.preset];
    const segs = countSegments(state.string);

    el("iter-out").textContent = String(state.iter);
    el("angle-out").textContent = state.angle + "°";

    el("len-hud").textContent = "string " + state.string.length;
    el("seg-hud").textContent = "segments " + segs;
    el("dim-hud").textContent = "dimension " + p.dim.toFixed(2);

    el("len-read").textContent = String(state.string.length);
    el("seg-read").textContent = String(segs);
    el("tot-read").textContent = segs + " units";
    el("dim-read").textContent = p.dim.toFixed(3);
    el("iter-read").textContent = String(state.iter);
    el("rule-read").textContent = p.ruleText;
  }

  function describe() {
    const p = PRESETS[state.preset];
    const segs = countSegments(state.string);
    let msg;
    if (state.preset === "koch") {
      msg = "Koch: each segment becomes 4 segments at ⅓ the length, so the dimension is log(4)/log(3) ≈ 1.26 — between a line and a plane. " + segs + " segments at iteration " + state.iter + ".";
    } else if (state.preset === "dragon") {
      msg = "Dragon curve: the paper-folding curve. Each iteration doubles the segments (" + segs + " now) and the curve fills the plane without ever crossing itself.";
    } else if (state.preset === "plant") {
      msg = "Plant: the brackets branch the turtle, so the string grows a fern. " + segs + " segments — the branching is why the stack exists.";
    } else {
      msg = "Sierpinski triangle: dimension log(3)/log(2) ≈ 1.58. The curve traces the triangle's edges, leaving holes at every scale.";
    }
    el("status").textContent = msg;
  }

  /* -------------------------------------------------------------------- wiring */

  function rebuild() {
    const p = PRESETS[state.preset];
    state.string = expand(p.axiom, p.rules, state.iter);
    updateReadouts();
    describe();
    draw();
  }

  function setPreset(name) {
    const p = PRESETS[name];
    if (!p) return;
    state.preset = name;
    state.iter = p.iter;
    state.angle = p.angle;
    el("iter").value = String(p.iter);
    el("angle").value = String(p.angle);
    ["koch", "dragon", "plant", "sierpinski"].forEach((kk) => {
      el("preset-" + kk).classList.toggle("active", kk === name);
    });
    rebuild();
  }

  el("iter").addEventListener("input", (evt) => {
    state.iter = Math.max(1, Math.min(8, Number(evt.target.value) || 4));
    rebuild();
  });
  el("angle").addEventListener("input", (evt) => {
    state.angle = Math.max(10, Math.min(180, Number(evt.target.value) || 90));
    rebuild();
  });

  el("preset-koch").addEventListener("click", () => setPreset("koch"));
  el("preset-dragon").addEventListener("click", () => setPreset("dragon"));
  el("preset-plant").addEventListener("click", () => setPreset("plant"));
  el("preset-sierpinski").addEventListener("click", () => setPreset("sierpinski"));

  el("btn-grow").addEventListener("click", () => {
    state.iter = Math.min(12, state.iter + 1);
    el("iter").value = String(state.iter);
    rebuild();
  });
  el("btn-reset").addEventListener("click", () => setPreset(state.preset));

  document.addEventListener("keydown", (evt) => {
    if (evt.key === "1") setPreset("koch");
    else if (evt.key === "2") setPreset("dragon");
    else if (evt.key === "3") setPreset("plant");
    else if (evt.key === "4") setPreset("sierpinski");
    else if (evt.key === " ") {
      evt.preventDefault();
      el("btn-grow").click();
    } else if (evt.key === "r" || evt.key === "R") el("btn-reset").click();
  });

  window.__lab = {
    state,
    PRESETS,
    expand,
    turtleSegments,
    countSegments,
    setPreset,
    rebuild,
    updateReadouts,
    describe,
    draw,
  };

  setPreset("koch");
})();
