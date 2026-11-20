(() => {
  "use strict";

  // Filled Julia set for a fixed c: iterate z -> z^2 + c from each starting
  // point z0. Points whose orbit never escapes form the filled set.
  // The Julia set is connected iff c is in the Mandelbrot set.

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");

  const W = canvas.width || 880;
  const H = canvas.height || 660;

  const STAGE = { x: 26, y: 50, w: 828, h: 560 };
  const VIEW = 3.0; // complex-plane width shown

  const PRESETS = {
    rabbit: { label: "Rabbit", cr: -0.123, ci: 0.745 },
    siegel: { label: "Siegel", cr: -0.39, ci: 0.607 },
    spiral: { label: "Spiral", cr: -0.8, ci: 0.156 },
    dendrite: { label: "Dendrite", cr: -1, ci: 0 },
  };

  const state = {
    cr: -0.123,
    ci: 0.745,
    maxIter: 80,
    preset: "rabbit",
    cursor: { x: 0, y: 0 },
  };

  /* --------------------------------------------------------------- julia core */

  function juliaEscape(zx, zy, cx, cy, maxIter) {
    for (let i = 0; i < maxIter; i++) {
      const nx = zx * zx - zy * zy + cx;
      const ny = 2 * zx * zy + cy;
      zx = nx; zy = ny;
      if (zx * zx + zy * zy > 4) return i;
    }
    return maxIter;
  }

  function inJuliaSet(zx, zy, cx, cy, maxIter) {
    return juliaEscape(zx, zy, cx, cy, maxIter) >= maxIter;
  }

  function smoothJulia(zx, zy, cx, cy, maxIter) {
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

  function isConnected(cx, cy) {
    // c in the Mandelbrot set <=> Julia set connected (approx: orbit of 0
    // bounded). Reuse the escape test with z0 = 0.
    return juliaEscape(0, 0, cx, cy, 200) >= 200;
  }

  function toComplex(px, py) {
    const h = (VIEW * STAGE.h) / STAGE.w;
    return [
      -VIEW / 2 + ((px - STAGE.x) / STAGE.w) * VIEW,
      h / 2 - ((py - STAGE.y) / STAGE.h) * h,
    ];
  }

  /* ------------------------------------------------------------------- drawing */

  function colorFor(iters, maxIter) {
    if (iters >= maxIter) return "rgb(5,5,8)";
    const t = iters / maxIter;
    const r = Math.round(155 * (1 - t) + 60 * t);
    const g = Math.round(225 * (1 - t) + 120 * t);
    const b = Math.round(93 * (1 - t) + 255 * t);
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#050508";
    ctx.fillRect(STAGE.x, STAGE.y, STAGE.w, STAGE.h);

    const step = 3;
    for (let py = STAGE.y; py < STAGE.y + STAGE.h; py += step) {
      for (let px = STAGE.x; px < STAGE.x + STAGE.w; px += step) {
        const [zx, zy] = toComplex(px, py);
        const it = juliaEscape(zx, zy, state.cr, state.ci, state.maxIter);
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
      "c = " + state.cr.toFixed(3) + " + " + state.ci.toFixed(3) + "i",
      STAGE.x + 8,
      STAGE.y + 16
    );
  }

  /* ------------------------------------------------------------------ readouts */

  function updateReadouts() {
    const it = juliaEscape(state.cursor.x, state.cursor.y, state.cr, state.ci, state.maxIter);
    const inS = it >= state.maxIter;

    el("cr-out").textContent = state.cr.toFixed(3);
    el("ci-out").textContent = state.ci.toFixed(3);
    el("maxiter-out").textContent = String(state.maxIter);

    el("c-hud").textContent = "c " + state.cr.toFixed(3) + " + " + state.ci.toFixed(3) + "i";
    el("z-hud").textContent = "z₀ " + state.cursor.x.toFixed(3) + " + " + state.cursor.y.toFixed(3) + "i";
    el("iter-hud").textContent = "iters " + it;

    el("c-read").textContent = state.cr.toFixed(3) + " + " + state.ci.toFixed(3) + "i";
    el("z-read").textContent = state.cursor.x.toFixed(3) + " + " + state.cursor.y.toFixed(3) + "i";
    el("iter-read").textContent = String(it);
    el("set-read").textContent = inS ? "yes" : "no";
    el("conn-read").textContent = isConnected(state.cr, state.ci) ? "yes" : "no";
    el("maxiter-read").textContent = String(state.maxIter);
  }

  function describe() {
    const it = juliaEscape(state.cursor.x, state.cursor.y, state.cr, state.ci, state.maxIter);
    const inS = it >= state.maxIter;
    const conn = isConnected(state.cr, state.ci);
    let msg;
    if (state.preset === "rabbit") {
      msg = "The Rabbit: c = −0.123 + 0.745i is inside the Mandelbrot set, so the Julia set is connected — a main body with two ears. The cursor z₀ " + (inS ? "is in the filled set." : "escapes after " + it + " iterations.");
    } else if (state.preset === "dendrite") {
      msg = "The Dendrite: c = −1 sits on the Mandelbrot boundary. The filled set has no interior — just a tree of arcs. Every point is on the boundary.";
    } else if (!conn) {
      msg = "c is outside the Mandelbrot set, so the Julia set is totally disconnected — a Cantor dust of infinitely many pieces. The cursor z₀ " + (inS ? "is in the dust." : "escapes after " + it + " iterations.");
    } else {
      msg = "Connected Julia set for c = " + state.cr.toFixed(3) + " + " + state.ci.toFixed(3) + "i. The cursor z₀ " + (inS ? "is in the filled set." : "escapes after " + it + " iterations.");
    }
    el("status").textContent = msg;
  }

  /* -------------------------------------------------------------------- wiring */

  function setPreset(name) {
    const p = PRESETS[name];
    if (!p) return;
    state.preset = name;
    state.cr = p.cr;
    state.ci = p.ci;
    el("cr").value = String(p.cr);
    el("ci").value = String(p.ci);
    ["rabbit", "siegel", "spiral", "dendrite"].forEach((kk) => {
      el("preset-" + kk).classList.toggle("active", kk === name);
    });
    updateReadouts();
    describe();
    draw();
  }

  function clearPresets() {
    state.preset = "";
    ["rabbit", "siegel", "spiral", "dendrite"].forEach((kk) => el("preset-" + kk).classList.remove("active"));
  }

  el("cr").addEventListener("input", (evt) => {
    state.cr = Math.max(-2, Math.min(2, Number(evt.target.value) || 0));
    clearPresets();
    updateReadouts();
    describe();
    draw();
  });
  el("ci").addEventListener("input", (evt) => {
    state.ci = Math.max(-2, Math.min(2, Number(evt.target.value) || 0));
    clearPresets();
    updateReadouts();
    describe();
    draw();
  });
  el("maxiter").addEventListener("input", (evt) => {
    state.maxIter = Math.max(20, Math.min(300, Number(evt.target.value) || 80));
    updateReadouts();
    describe();
    draw();
  });

  el("preset-rabbit").addEventListener("click", () => setPreset("rabbit"));
  el("preset-siegel").addEventListener("click", () => setPreset("siegel"));
  el("preset-spiral").addEventListener("click", () => setPreset("spiral"));
  el("preset-dendrite").addEventListener("click", () => setPreset("dendrite"));

  el("btn-reset").addEventListener("click", () => setPreset("rabbit"));

  function point(evt) {
    const r = canvas.getBoundingClientRect();
    return [evt.clientX - r.left, evt.clientY - r.top];
  }

  canvas.addEventListener("pointermove", (evt) => {
    const [x, y] = point(evt);
    const [zx, zy] = toComplex(x, y);
    state.cursor = { x: zx, y: zy };
    updateReadouts();
    describe();
    draw();
  });

  document.addEventListener("keydown", (evt) => {
    if (evt.key === "1") setPreset("rabbit");
    else if (evt.key === "2") setPreset("siegel");
    else if (evt.key === "3") setPreset("spiral");
    else if (evt.key === "4") setPreset("dendrite");
    else if (evt.key === "r" || evt.key === "R") el("btn-reset").click();
  });

  window.__lab = {
    state,
    PRESETS,
    juliaEscape,
    inJuliaSet,
    smoothJulia,
    isConnected,
    toComplex,
    setPreset,
    updateReadouts,
    describe,
    draw,
  };

  setPreset("rabbit");
})();
