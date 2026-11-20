(() => {
  "use strict";

  // Mandelbrot set by escape time: iterate z -> z^2 + c from z = 0.
  // If |z| > 2 the orbit escapes to infinity (once |z| > 2, it can never
  // come back). Points that never escape within maxIter are in the set.

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");

  const W = canvas.width || 880;
  const H = canvas.height || 660;

  const STAGE = { x: 26, y: 50, w: 828, h: 560 };

  const PRESETS = {
    full: { label: "Full set", cx: -0.6, cy: 0, zoom: 1 },
    seahorse: { label: "Seahorse", cx: -0.743643887, cy: 0.131825963, zoom: 12 },
    elephant: { label: "Elephant", cx: 0.285, cy: 0.01, zoom: 8 },
    spiral: { label: "Spiral", cx: -0.745, cy: 0.113, zoom: 20 },
  };

  const state = {
    cx: -0.6,
    cy: 0,
    zoom: 1,
    maxIter: 80,
    preset: "full",
    cursor: { x: -0.6, y: 0 },
    drag: null,
  };

  const BASE_W = 3.2; // complex-plane width at zoom 1

  /* ------------------------------------------------------------- mandelbrot */

  function escapeTime(cx, cy, maxIter) {
    let zx = 0, zy = 0;
    for (let i = 0; i < maxIter; i++) {
      const nx = zx * zx - zy * zy + cx;
      const ny = 2 * zx * zy + cy;
      zx = nx; zy = ny;
      if (zx * zx + zy * zy > 4) return i;
    }
    return maxIter;
  }

  function inSet(cx, cy, maxIter) {
    return escapeTime(cx, cy, maxIter) >= maxIter;
  }

  function smoothValue(cx, cy, maxIter) {
    // continuous escape value via the log-log formula
    let zx = 0, zy = 0;
    for (let i = 0; i < maxIter; i++) {
      const nx = zx * zx - zy * zy + cx;
      const ny = 2 * zx * zy + cy;
      zx = nx; zy = ny;
      const r2 = zx * zx + zy * zy;
      if (r2 > 4) {
        const logZn = Math.log(r2) / 2;
        const nu = Math.log(logZn / Math.log(2)) / Math.log(2);
        return i + 1 - nu;
      }
    }
    return maxIter;
  }

  function viewWidth() {
    return BASE_W / state.zoom;
  }

  function toComplex(px, py) {
    const w = viewWidth();
    const h = (w * STAGE.h) / STAGE.w;
    return [
      state.cx - w / 2 + ((px - STAGE.x) / STAGE.w) * w,
      state.cy + h / 2 - ((py - STAGE.y) / STAGE.h) * h,
    ];
  }

  /* ------------------------------------------------------------------- drawing */

  function colorFor(iters, maxIter) {
    if (iters >= maxIter) return "rgb(5,5,8)";
    const t = iters / maxIter;
    // green -> teal -> blue -> purple banding
    const r = Math.round(155 * (1 - t) + 60 * t);
    const g = Math.round(225 * (1 - t) + 120 * t);
    const b = Math.round(93 * (1 - t) + 255 * t);
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#050508";
    ctx.fillRect(STAGE.x, STAGE.y, STAGE.w, STAGE.h);

    const w = viewWidth();
    const h = (w * STAGE.h) / STAGE.w;
    const step = Math.max(2, Math.floor(w * 400));
    for (let py = STAGE.y; py < STAGE.y + STAGE.h; py += step) {
      for (let px = STAGE.x; px < STAGE.x + STAGE.w; px += step) {
        const [cx, cy] = toComplex(px, py);
        const it = escapeTime(cx, cy, state.maxIter);
        ctx.fillStyle = colorFor(it, state.maxIter);
        ctx.fillRect(px, py, step, step);
      }
    }

    // cursor crosshair
    const [ccx, ccy] = toComplex(state.cursor.x, state.cursor.y);
    ctx.strokeStyle = "#ffb45f";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ccx - 8, ccy);
    ctx.lineTo(ccx + 8, ccy);
    ctx.moveTo(ccx, ccy - 8);
    ctx.lineTo(ccx, ccy + 8);
    ctx.stroke();

    ctx.fillStyle = "#93a48f";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(
      "center " + state.cx.toFixed(6) + " + " + state.cy.toFixed(6) + "i   zoom " + state.zoom.toFixed(1) + "×",
      STAGE.x + 8,
      STAGE.y + 16
    );
  }

  /* ------------------------------------------------------------------ readouts */

  function updateReadouts() {
    const it = escapeTime(state.cursor.x, state.cursor.y, state.maxIter);
    const inS = it >= state.maxIter;

    el("maxiter-out").textContent = String(state.maxIter);
    el("zoom-out").textContent = state.zoom.toFixed(1) + "×";

    el("c-hud").textContent = "c " + state.cursor.x.toFixed(4) + " + " + state.cursor.y.toFixed(4) + "i";
    el("iter-hud").textContent = "iters " + it;
    el("zoom-hud").textContent = "zoom " + state.zoom.toFixed(1) + "×";

    el("c-read").textContent = state.cursor.x.toFixed(4) + " + " + state.cursor.y.toFixed(4) + "i";
    el("iter-read").textContent = String(it);
    el("set-read").textContent = inS ? "yes" : "no";
    el("zoom-read").textContent = state.zoom.toFixed(1) + "×";
    el("center-read").textContent = state.cx.toFixed(4) + "," + state.cy.toFixed(4);
    el("width-read").textContent = viewWidth().toFixed(4);
  }

  function describe() {
    const it = escapeTime(state.cursor.x, state.cursor.y, state.maxIter);
    const inS = it >= state.maxIter;
    let msg;
    if (inS) {
      msg = "c = " + state.cursor.x.toFixed(4) + " + " + state.cursor.y.toFixed(4) + "i is in the set: the orbit of z → z² + c never escapes. The boundary is where the interesting structure lives.";
    } else {
      msg = "c = " + state.cursor.x.toFixed(4) + " + " + state.cursor.y.toFixed(4) + "i escapes after " + it + " iterations. The colour bands are level curves of the escape time — smooth near the boundary, coarse far away.";
    }
    el("status").textContent = msg;
  }

  /* -------------------------------------------------------------------- wiring */

  function setPreset(name) {
    const p = PRESETS[name];
    if (!p) return;
    state.preset = name;
    state.cx = p.cx;
    state.cy = p.cy;
    state.zoom = p.zoom;
    state.cursor = { x: p.cx, y: p.cy };
    el("zoom").value = String(p.zoom);
    ["full", "seahorse", "elephant", "spiral"].forEach((kk) => {
      el("preset-" + kk).classList.toggle("active", kk === name);
    });
    updateReadouts();
    describe();
    draw();
  }

  function clearPresets() {
    state.preset = "";
    ["full", "seahorse", "elephant", "spiral"].forEach((kk) => el("preset-" + kk).classList.remove("active"));
  }

  el("maxiter").addEventListener("input", (evt) => {
    state.maxIter = Math.max(20, Math.min(300, Number(evt.target.value) || 80));
    updateReadouts();
    describe();
    draw();
  });
  el("zoom").addEventListener("input", (evt) => {
    state.zoom = Math.max(1, Math.min(50, Number(evt.target.value) || 1));
    clearPresets();
    updateReadouts();
    describe();
    draw();
  });

  el("preset-full").addEventListener("click", () => setPreset("full"));
  el("preset-seahorse").addEventListener("click", () => setPreset("seahorse"));
  el("preset-elephant").addEventListener("click", () => setPreset("elephant"));
  el("preset-spiral").addEventListener("click", () => setPreset("spiral"));

  el("btn-zoomin").addEventListener("click", () => {
    state.zoom = Math.min(50, state.zoom * 1.5);
    el("zoom").value = String(state.zoom);
    clearPresets();
    updateReadouts();
    describe();
    draw();
  });
  el("btn-zoomout").addEventListener("click", () => {
    state.zoom = Math.max(1, state.zoom / 1.5);
    el("zoom").value = String(state.zoom);
    clearPresets();
    updateReadouts();
    describe();
    draw();
  });
  el("btn-reset").addEventListener("click", () => setPreset("full"));

  function point(evt) {
    const r = canvas.getBoundingClientRect();
    return [evt.clientX - r.left, evt.clientY - r.top];
  }

  canvas.addEventListener("pointerdown", (evt) => {
    const [x, y] = point(evt);
    state.drag = { x, y, cx: state.cx, cy: state.cy };
  });
  canvas.addEventListener("pointermove", (evt) => {
    const [x, y] = point(evt);
    const [ccx, ccy] = toComplex(x, y);
    state.cursor = { x: ccx, y: ccy };
    if (state.drag) {
      const w = viewWidth();
      const h = (w * STAGE.h) / STAGE.w;
      state.cx = state.drag.cx - ((x - state.drag.x) / STAGE.w) * w;
      state.cy = state.drag.cy + ((y - state.drag.y) / STAGE.h) * h;
      clearPresets();
    }
    updateReadouts();
    describe();
    draw();
  });
  canvas.addEventListener("pointerup", () => { state.drag = null; });
  canvas.addEventListener("wheel", (evt) => {
    evt.preventDefault();
    const factor = evt.deltaY < 0 ? 1.2 : 1 / 1.2;
    state.zoom = Math.max(1, Math.min(50, state.zoom * factor));
    el("zoom").value = String(state.zoom);
    clearPresets();
    updateReadouts();
    describe();
    draw();
  });

  document.addEventListener("keydown", (evt) => {
    if (evt.key === "1") setPreset("full");
    else if (evt.key === "2") setPreset("seahorse");
    else if (evt.key === "3") setPreset("elephant");
    else if (evt.key === "4") setPreset("spiral");
    else if (evt.key === "+" || evt.key === "=") el("btn-zoomin").click();
    else if (evt.key === "-" || evt.key === "_") el("btn-zoomout").click();
    else if (evt.key === "r" || evt.key === "R") el("btn-reset").click();
  });

  window.__lab = {
    state,
    PRESETS,
    escapeTime,
    inSet,
    smoothValue,
    viewWidth,
    toComplex,
    setPreset,
    updateReadouts,
    describe,
    draw,
  };

  setPreset("full");
})();
