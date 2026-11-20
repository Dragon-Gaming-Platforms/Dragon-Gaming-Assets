(() => {
  "use strict";

  // Spherical mirror lab. Mirror equation: 1/f = 1/do + 1/di.
  // Magnification m = -di/do. f > 0 concave, f < 0 convex, f = Infinity plane.
  // di > 0: real image in front of the mirror. di < 0: virtual, behind.

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");

  const W = canvas.width || 880;
  const H = canvas.height || 660;

  const STAGE = { x: 26, y: 50, w: 828, h: 560 };
  const MIRROR_X = STAGE.x + STAGE.w - 120;
  const AXIS_Y = STAGE.y + STAGE.h / 2;
  const SCALE = 0.55; // px per mm

  const PRESETS = {
    concave: { label: "Concave", f: 100, do: 250, ho: 60 },
    convex: { label: "Convex", f: -100, do: 250, ho: 60 },
    plane: { label: "Plane", f: 0, do: 200, ho: 60 },
  };

  const state = {
    f: 100,
    do: 250,
    ho: 60,
    preset: "concave",
    showRays: true,
    drag: false,
  };

  /* -------------------------------------------------------------- mirror maths */

  function imageDistance(f, dObj) {
    if (f === 0) return -dObj; // plane mirror: virtual, same distance behind
    const denom = 1 / f - 1 / dObj;
    if (denom === 0) return Infinity;
    return 1 / denom;
  }

  function magnification(f, dObj) {
    const di = imageDistance(f, dObj);
    if (!isFinite(di)) return Infinity;
    return -di / dObj;
  }

  function imageType(f, dObj) {
    const di = imageDistance(f, dObj);
    if (!isFinite(di)) return "at infinity";
    return di > 0 ? "real" : "virtual";
  }

  function orientation(f, dObj) {
    const m = magnification(f, dObj);
    if (!isFinite(m)) return "—";
    return m < 0 ? "inverted" : "upright";
  }

  /* ------------------------------------------------------------------- drawing */

  function toPx(d, h) {
    return [MIRROR_X - d * SCALE, AXIS_Y - h * SCALE];
  }

  function drawMirror() {
    // mirror arc (curvature from f: R = 2f)
    ctx.strokeStyle = "#8296a9";
    ctx.lineWidth = 3;
    ctx.beginPath();
    if (state.f === 0) {
      ctx.moveTo(MIRROR_X, AXIS_Y - 160);
      ctx.lineTo(MIRROR_X, AXIS_Y + 160);
    } else {
      const R = 2 * state.f * SCALE;
      const sag = 30;
      ctx.arc(MIRROR_X + R - sag * Math.sign(state.f), AXIS_Y, Math.abs(R), Math.PI / 2 - Math.asin(160 / Math.abs(R)), Math.PI / 2 + Math.asin(160 / Math.abs(R)));
    }
    ctx.stroke();
    // hatch behind mirror
    ctx.strokeStyle = "rgba(130,150,169,0.4)";
    ctx.lineWidth = 1;
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(MIRROR_X + 4, AXIS_Y + i * 40);
      ctx.lineTo(MIRROR_X + 14, AXIS_Y + i * 40 + 10);
      ctx.stroke();
    }
  }

  function drawArrow(d, h, color, dashed) {
    const [bx, by] = toPx(d, 0);
    const [tx, ty] = toPx(d, h);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    if (dashed) ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(tx, ty);
    ctx.stroke();
    ctx.setLineDash([]);
    // arrowhead
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx - 5, ty + 10);
    ctx.lineTo(tx + 5, ty + 10);
    ctx.closePath();
    ctx.fill();
  }

  function drawRays(di) {
    const [ox, oy] = toPx(state.do, state.ho);
    const [ix, iy] = toPx(di, magnification(state.f, state.do) * state.ho);
    const real = di > 0;
    ctx.strokeStyle = "rgba(255,180,95,0.7)";
    ctx.lineWidth = 1.5;

    // ray 1: parallel to axis, then through focal point
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(MIRROR_X, oy);
    if (state.f !== 0) {
      const [fx, fy] = toPx(state.f, 0);
      ctx.lineTo(real ? ix : fx + (fx - ix), real ? iy : fy);
    }
    ctx.stroke();

    // ray 2: through centre of curvature (R = 2f), reflects on itself
    if (state.f !== 0) {
      const [cx2] = toPx(2 * state.f, 0);
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(cx2, AXIS_Y);
      ctx.stroke();
    }

    // ray 3: through focal point, then parallel
    if (state.f !== 0) {
      const [fx, fy] = toPx(state.f, 0);
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(fx, fy);
      ctx.lineTo(real ? ix : fx + (fx - ix), real ? iy : fy);
      ctx.stroke();
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#070907";
    ctx.fillRect(STAGE.x, STAGE.y, STAGE.w, STAGE.h);

    // axis
    ctx.strokeStyle = "rgba(130,150,169,0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(STAGE.x, AXIS_Y);
    ctx.lineTo(STAGE.x + STAGE.w, AXIS_Y);
    ctx.stroke();

    drawMirror();

    // focal point marker
    if (state.f !== 0) {
      const [fx] = toPx(state.f, 0);
      ctx.fillStyle = "#ffb45f";
      ctx.beginPath();
      ctx.arc(fx, AXIS_Y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = "10px ui-monospace, Menlo, monospace";
      ctx.textAlign = "center";
      ctx.fillText("F", fx, AXIS_Y + 18);
    }

    const di = imageDistance(state.f, state.do);
    const m = magnification(state.f, state.do);
    const real = isFinite(di) && di > 0;

    if (state.showRays && isFinite(di)) drawRays(di);

    // object (blue)
    drawArrow(state.do, state.ho, "#7cc4ff", false);
    // image (teal, dashed if virtual)
    if (isFinite(di)) drawArrow(di, m * state.ho, "#6ff0c8", !real);

    ctx.fillStyle = "#93a48f";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(
      "f=" + (state.f === 0 ? "∞ (plane)" : state.f + " mm") + "  dₒ=" + state.do + " mm  dᵢ=" + (isFinite(di) ? di.toFixed(0) + " mm" : "∞"),
      STAGE.x + 8,
      STAGE.y + 16
    );
  }

  /* ------------------------------------------------------------------ readouts */

  function updateReadouts() {
    const di = imageDistance(state.f, state.do);
    const m = magnification(state.f, state.do);

    el("f-out").textContent = state.f === 0 ? "∞ (plane)" : state.f + " mm";
    el("do-out").textContent = state.do + " mm";
    el("ho-out").textContent = state.ho + " mm";

    el("di-hud").textContent = "dᵢ " + (isFinite(di) ? di.toFixed(0) + " mm" : "∞");
    el("mag-hud").textContent = "m " + (isFinite(m) ? m.toFixed(2) : "∞");
    el("type-hud").textContent = "type " + imageType(state.f, state.do);

    el("di-read").textContent = isFinite(di) ? di.toFixed(1) + " mm" : "∞";
    el("mag-read").textContent = isFinite(m) ? m.toFixed(3) : "∞";
    el("hi-read").textContent = isFinite(m) ? (m * state.ho).toFixed(1) + " mm" : "∞";
    el("type-read").textContent = imageType(state.f, state.do);
    el("orient-read").textContent = orientation(state.f, state.do);
    el("check-read").textContent = state.f === 0 ? "plane" : (isFinite(di) ? (1 / state.do + 1 / di).toFixed(4) : "—");
  }

  function describe() {
    const di = imageDistance(state.f, state.do);
    const m = magnification(state.f, state.do);
    let msg;
    if (state.f === 0) {
      msg = "Plane mirror: the image is virtual, upright and the same size, as far behind the mirror as the object is in front. dᵢ = −dₒ, m = +1.";
    } else if (state.f < 0) {
      msg = "Convex mirror: always a virtual, upright, reduced image behind the mirror — no matter where the object is. That is why car mirrors use them: a wider view.";
    } else if (!isFinite(di)) {
      msg = "Object at the focal point: the reflected rays are parallel and the image forms at infinity. Move the object slightly and the image swings wildly.";
    } else if (di > 0) {
      msg = "Real image at dᵢ = " + di.toFixed(0) + " mm, magnification " + m.toFixed(2) + " (" + orientation(state.f, state.do) + "). Light actually converges there — you could project it on a screen.";
    } else {
      msg = "Virtual image at dᵢ = " + di.toFixed(0) + " mm (behind the mirror), magnification " + m.toFixed(2) + " (" + orientation(state.f, state.do) + "). The reflected rays only appear to meet there.";
    }
    el("status").textContent = msg;
  }

  /* -------------------------------------------------------------------- wiring */

  function setPreset(name) {
    const p = PRESETS[name];
    if (!p) return;
    state.preset = name;
    state.f = p.f;
    state.do = p.do;
    state.ho = p.ho;
    el("f").value = String(p.f);
    el("do").value = String(p.do);
    el("ho").value = String(p.ho);
    ["concave", "convex", "plane"].forEach((kk) => {
      el("preset-" + kk).classList.toggle("active", kk === name);
    });
    updateReadouts();
    describe();
    draw();
  }

  function clearPresets() {
    state.preset = "";
    ["concave", "convex", "plane"].forEach((kk) => el("preset-" + kk).classList.remove("active"));
  }

  el("f").addEventListener("input", (evt) => {
    let v = Number(evt.target.value) || 0;
    if (v > -10 && v < 10) v = 0; // snap near zero to plane
    state.f = Math.max(-200, Math.min(200, v));
    clearPresets();
    updateReadouts();
    describe();
    draw();
  });
  el("do").addEventListener("input", (evt) => {
    state.do = Math.max(20, Math.min(500, Number(evt.target.value) || 250));
    clearPresets();
    updateReadouts();
    describe();
    draw();
  });
  el("ho").addEventListener("input", (evt) => {
    state.ho = Math.max(10, Math.min(120, Number(evt.target.value) || 60));
    clearPresets();
    updateReadouts();
    describe();
    draw();
  });

  el("preset-concave").addEventListener("click", () => setPreset("concave"));
  el("preset-convex").addEventListener("click", () => setPreset("convex"));
  el("preset-plane").addEventListener("click", () => setPreset("plane"));

  el("toggle-rays").addEventListener("click", () => {
    state.showRays = !state.showRays;
    el("toggle-rays").classList.toggle("active", state.showRays);
    draw();
  });

  function point(evt) {
    const r = canvas.getBoundingClientRect();
    return [evt.clientX - r.left, evt.clientY - r.top];
  }

  canvas.addEventListener("pointerdown", (evt) => {
    const [x, y] = point(evt);
    const [ox, oy] = toPx(state.do, state.ho);
    if (Math.hypot(x - ox, y - oy) < 30) state.drag = true;
  });
  canvas.addEventListener("pointermove", (evt) => {
    if (!state.drag) return;
    const [x, y] = point(evt);
    state.do = Math.max(20, Math.min(500, Math.round((MIRROR_X - x) / SCALE)));
    state.ho = Math.max(10, Math.min(120, Math.round((AXIS_Y - y) / SCALE)));
    el("do").value = String(state.do);
    el("ho").value = String(state.ho);
    clearPresets();
    updateReadouts();
    describe();
    draw();
  });
  canvas.addEventListener("pointerup", () => { state.drag = false; });

  document.addEventListener("keydown", (evt) => {
    if (evt.key === "1") setPreset("concave");
    else if (evt.key === "2") setPreset("convex");
    else if (evt.key === "3") setPreset("plane");
  });

  window.__lab = {
    state,
    PRESETS,
    imageDistance,
    magnification,
    imageType,
    orientation,
    setPreset,
    updateReadouts,
    describe,
    draw,
  };

  setPreset("concave");
})();
