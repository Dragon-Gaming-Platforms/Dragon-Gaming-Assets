(() => {
  "use strict";

  // Thin-lens ray optics. Image distance from the lens equation
  // 1/f = 1/s_o + 1/s_i, magnification m = -s_i/s_o. The three principal
  // rays (parallel-then-focal, focal-then-parallel, through-centre) are
  // drawn solid to the lens and beyond; for a virtual image their backward
  // extensions are dashed to the virtual tip.

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");

  const W = canvas.width || 880;
  const H = canvas.height || 660;

  const STAGE = { x: 26, y: 50, w: 828, h: 560 };

  const PRESETS = {
    converging: { label: "Converging", f: 100, so: 250, ho: 80 },
    diverging: { label: "Diverging", f: -100, so: 250, ho: 80 },
    telephoto: { label: "Telephoto", f: 200, so: 320, ho: 90 },
    closeup: { label: "Close-up", f: 60, so: 90, ho: 60 },
  };

  const state = {
    f: 100,
    so: 250,
    ho: 80,
    showRays: true,
    showFocal: true,
    preset: "converging",
    drag: false,
    statusKind: "",
  };

  /* ---------------------------------------------------------------- lens maths */

  function imageDistance(f, so) {
    if (f === 0) return Infinity;
    const inv = 1 / f - 1 / so;
    if (Math.abs(inv) < 1e-9) return Infinity;
    return 1 / inv;
  }

  function magnification(f, so) {
    const si = imageDistance(f, so);
    if (!isFinite(si)) return 0;
    return -si / so;
  }

  function imageType(f, so) {
    const si = imageDistance(f, so);
    if (!isFinite(si)) return "at infinity";
    const m = magnification(f, so);
    const real = si > 0;
    const inverted = m < 0;
    const mag = Math.abs(m) > 1.01 ? "magnified" : Math.abs(m) < 0.99 ? "diminished" : "same size";
    return (real ? "real" : "virtual") + ", " + (inverted ? "inverted" : "upright") + ", " + mag;
  }

  function objectSide(f, so) {
    const af = Math.abs(f);
    if (so < af) return "inside f";
    if (Math.abs(so - af) < 1) return "at f";
    if (so < 2 * af) return "between f and 2f";
    if (Math.abs(so - 2 * af) < 1) return "at 2f";
    return "beyond 2f";
  }

  /* ------------------------------------------------------------------- drawing */

  function lensX() { return STAGE.x + STAGE.w / 2; }
  function axisY() { return STAGE.y + STAGE.h / 2; }

  function drawArrow(x1, y1, x2, y2, color, width) {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width || 2.5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const s = 9;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - s * Math.cos(ang - 0.42), y2 - s * Math.sin(ang - 0.42));
    ctx.lineTo(x2 - s * Math.cos(ang + 0.42), y2 - s * Math.sin(ang + 0.42));
    ctx.closePath();
    ctx.fill();
  }

  function drawLens(lx, ay) {
    const half = 170;
    const converging = state.f > 0;
    ctx.strokeStyle = "#c79bff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lx, ay - half);
    ctx.lineTo(lx, ay + half);
    ctx.stroke();
    // arrowheads: outward for converging, inward for diverging
    const dir = converging ? 1 : -1;
    ctx.fillStyle = "#c79bff";
    const tri = (x, y, d) => {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 7, y - d * 12);
      ctx.lineTo(x + 7, y - d * 12);
      ctx.closePath();
      ctx.fill();
    };
    tri(lx, ay - half, dir);
    tri(lx, ay + half, -dir);
  }

  function drawRay(x1, y1, x2, y2, dashed) {
    ctx.strokeStyle = dashed ? "#ff8fa3" : "#ffd166";
    ctx.lineWidth = 1.4;
    ctx.setLineDash(dashed ? [5, 5] : []);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#070510";
    ctx.fillRect(STAGE.x, STAGE.y, STAGE.w, STAGE.h);

    const lx = lensX();
    const ay = axisY();
    const f = state.f;
    const so = state.so;
    const ho = state.ho;
    const objX = lx - so;
    const tipX = objX;
    const tipY = ay - ho;

    // optical axis
    ctx.strokeStyle = "rgba(199,155,255,0.35)";
    ctx.lineWidth = 1;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(STAGE.x + 8, ay);
    ctx.lineTo(STAGE.x + STAGE.w - 8, ay);
    ctx.stroke();
    ctx.setLineDash([]);

    // focal points
    if (state.showFocal && f !== 0) {
      ctx.fillStyle = "#c79bff";
      ctx.font = "11px ui-monospace, Menlo, monospace";
      ctx.textAlign = "center";
      [lx + f, lx - f].forEach((fx) => {
        ctx.beginPath();
        ctx.arc(fx, ay, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillText("F", fx, ay + 18);
      });
      ctx.fillText("lens", lx, ay + 18);
    }

    // object
    drawArrow(objX, ay, tipX, tipY, "#7cc4ff", 3);

    // image
    const si = imageDistance(f, so);
    const m = magnification(f, so);
    const hi = m * ho;
    const imgX = lx + si;
    const imgTipY = ay - hi;
    const hasImage = isFinite(si) && f !== 0;
    if (hasImage) {
      drawArrow(imgX, ay, imgX, imgTipY, "#6ff0c8", 3);
    }

    // principal rays
    if (state.showRays && f !== 0) {
      const L = 1200;
      const norm = (dx, dy) => {
        const l = Math.hypot(dx, dy) || 1;
        return [dx / l, dy / l];
      };
      const F1 = [lx - f, ay]; // near focal
      const F2 = [lx + f, ay]; // far focal

      // R1: parallel -> far focal
      const B1 = [lx, tipY];
      let d1 = f > 0 ? norm(F2[0] - B1[0], F2[1] - B1[1]) : norm(B1[0] - F2[0], B1[1] - F2[1]);
      drawRay(tipX, tipY, B1[0], B1[1], false);
      drawRay(B1[0], B1[1], B1[0] + d1[0] * L, B1[1] + d1[1] * L, false);

      // R2: through near focal -> parallel
      // B2 = intersection of line tip->F1 with x = lx
      const denom = F1[0] - tipX;
      let B2;
      if (Math.abs(denom) < 1e-9) B2 = [lx, tipY];
      else {
        const t = (lx - tipX) / denom;
        B2 = [lx, tipY + t * (F1[1] - tipY)];
      }
      drawRay(tipX, tipY, B2[0], B2[1], false);
      drawRay(B2[0], B2[1], B2[0] + L, B2[1], false);

      // R3: through centre
      const d3 = norm(lx - tipX, ay - tipY);
      drawRay(tipX, tipY, lx, ay, false);
      drawRay(lx, ay, lx + d3[0] * L, ay + d3[1] * L, false);

      // virtual extensions
      if (hasImage && si < 0) {
        [B1, B2, [lx, ay]].forEach((B) => {
          drawRay(B[0], B[1], imgX, imgTipY, true);
        });
      }
    }

    // lens on top
    drawLens(lx, ay);

    // labels
    ctx.fillStyle = "#9a8fb0";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("object", objX - 20, ay + 30);
    if (hasImage) ctx.fillText("image", imgX - 16, ay + 30);
    ctx.fillText("sₒ=" + so + "px", objX - 24, STAGE.y + 16);
    if (hasImage) ctx.fillText("sᵢ=" + Math.round(si) + "px", imgX - 24, STAGE.y + 16);
  }

  /* ------------------------------------------------------------------ readouts */

  function updateReadouts() {
    const si = imageDistance(state.f, state.so);
    const m = magnification(state.f, state.so);
    const hi = m * state.ho;

    el("f-out").textContent = (state.f > 0 ? "+" : "") + state.f + " px";
    el("so-out").textContent = state.so + " px";
    el("ho-out").textContent = state.ho + " px";

    el("si-hud").textContent = "sᵢ " + (isFinite(si) ? Math.round(si) + " px" : "∞");
    el("mag-hud").textContent = "m " + m.toFixed(2);
    el("type-hud").textContent = imageType(state.f, state.so);

    el("si-read").textContent = isFinite(si) ? Math.round(si) + " px" : "∞";
    el("mag-read").textContent = m.toFixed(2);
    el("hi-read").textContent = Math.round(hi) + " px";
    el("type-read").textContent = imageType(state.f, state.so);
    el("side-read").textContent = objectSide(state.f, state.so);
    // 1/f check: 1/so + 1/si should equal 1/f
    if (isFinite(si) && state.f !== 0) {
      const lhs = 1 / state.so + 1 / si;
      const rhs = 1 / state.f;
      el("check-read").textContent = lhs.toFixed(4) + " = " + rhs.toFixed(4) + (Math.abs(lhs - rhs) < 1e-9 ? " ✓" : "");
    } else {
      el("check-read").textContent = "—";
    }
  }

  function describe() {
    const si = imageDistance(state.f, state.so);
    const side = objectSide(state.f, state.so);
    let msg;
    if (state.f === 0) {
      msg = "f = 0: no lens power — rays pass through undeflected and there is no image. Slide f away from zero.";
    } else if (!isFinite(si)) {
      msg = "Object at the focal point: the image forms at infinity (rays exit parallel). Move the object a little either way.";
    } else if (state.f < 0) {
      msg = "Diverging lens: the image is always virtual, upright and diminished, on the same side as the object — no matter where you put it. sᵢ = " + Math.round(si) + " px.";
    } else if (si < 0) {
      msg = "Object inside the focal length (" + side + "): the image is virtual, upright and magnified — the magnifying-glass regime. sᵢ = " + Math.round(si) + " px (same side as object).";
    } else {
      const m = magnification(state.f, state.so);
      msg = "Real image at sᵢ = " + Math.round(si) + " px, magnification " + m.toFixed(2) + " (" + (m < 0 ? "inverted" : "upright") + "). Object is " + side + ".";
    }
    el("status").textContent = msg;
  }

  /* -------------------------------------------------------------------- wiring */

  function setPreset(name) {
    const p = PRESETS[name];
    if (!p) return;
    state.preset = name;
    state.f = p.f;
    state.so = p.so;
    state.ho = p.ho;
    el("f").value = String(p.f);
    el("so").value = String(p.so);
    el("ho").value = String(p.ho);
    ["converging", "diverging", "telephoto", "closeup"].forEach((k) => {
      el("preset-" + k).classList.toggle("active", k === name);
    });
    updateReadouts();
    describe();
    draw();
  }

  function clearPresets() {
    state.preset = "";
    ["converging", "diverging", "telephoto", "closeup"].forEach((k) => el("preset-" + k).classList.remove("active"));
  }

  el("f").addEventListener("input", (evt) => {
    state.f = Math.max(-200, Math.min(200, Number(evt.target.value) || 0));
    clearPresets();
    updateReadouts();
    describe();
    draw();
  });
  el("so").addEventListener("input", (evt) => {
    state.so = Math.max(60, Math.min(380, Number(evt.target.value) || 250));
    clearPresets();
    updateReadouts();
    describe();
    draw();
  });
  el("ho").addEventListener("input", (evt) => {
    state.ho = Math.max(30, Math.min(140, Number(evt.target.value) || 80));
    clearPresets();
    updateReadouts();
    describe();
    draw();
  });

  el("preset-converging").addEventListener("click", () => setPreset("converging"));
  el("preset-diverging").addEventListener("click", () => setPreset("diverging"));
  el("preset-telephoto").addEventListener("click", () => setPreset("telephoto"));
  el("preset-closeup").addEventListener("click", () => setPreset("closeup"));

  el("toggle-rays").addEventListener("click", () => {
    state.showRays = !state.showRays;
    el("toggle-rays").classList.toggle("active", state.showRays);
    draw();
  });
  el("toggle-focal").addEventListener("click", () => {
    state.showFocal = !state.showFocal;
    el("toggle-focal").classList.toggle("active", state.showFocal);
    draw();
  });

  function point(evt) {
    const r = canvas.getBoundingClientRect();
    return [evt.clientX - r.left, evt.clientY - r.top];
  }

  canvas.addEventListener("pointerdown", (evt) => {
    const [x, y] = point(evt);
    const lx = lensX();
    const ay = axisY();
    const tipX = lx - state.so;
    const tipY = ay - state.ho;
    if (Math.hypot(x - tipX, y - tipY) < 18) {
      state.drag = true;
    }
  });
  canvas.addEventListener("pointermove", (evt) => {
    if (!state.drag) return;
    const [x, y] = point(evt);
    const lx = lensX();
    const ay = axisY();
    state.so = Math.max(60, Math.min(380, Math.round(lx - x)));
    state.ho = Math.max(30, Math.min(140, Math.round(ay - y)));
    el("so").value = String(state.so);
    el("ho").value = String(state.ho);
    clearPresets();
    updateReadouts();
    describe();
    draw();
  });
  canvas.addEventListener("pointerup", () => { state.drag = false; });

  document.addEventListener("keydown", (evt) => {
    if (evt.key === "1") setPreset("converging");
    else if (evt.key === "2") setPreset("diverging");
    else if (evt.key === "3") setPreset("telephoto");
    else if (evt.key === "4") setPreset("closeup");
    else if (evt.key === "r" || evt.key === "R") el("toggle-rays").click();
    else if (evt.key === "f" || evt.key === "F") el("toggle-focal").click();
  });

  window.__lab = {
    state,
    PRESETS,
    imageDistance,
    magnification,
    imageType,
    objectSide,
    setPreset,
    updateReadouts,
    describe,
    draw,
  };

  updateReadouts();
  describe();
  draw();
})();
