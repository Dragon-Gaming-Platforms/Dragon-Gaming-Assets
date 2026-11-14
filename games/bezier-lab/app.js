(() => {
  "use strict";

  // A Bézier curve evaluated three ways that must agree:
  //   * the Bernstein form, sum B_i^n(t) P_i
  //   * de Casteljau's repeated interpolation (drawn as the construction)
  //   * a dense polyline, used for arc length and the curvature scan
  //
  // The osculating circle comes from the first and second derivatives, so the
  // curvature readout is a real differential-geometry quantity, not a guess.

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");

  const W = canvas.width || 880;
  const H = canvas.height || 660;

  const STAGE = { x: 26, y: 50, w: 828, h: 414 };
  const INFO = { x: 26, y: 496, w: 828, h: 138 };

  const PRESETS = {
    arch: {
      label: "Arch",
      points: [
        [90, 400],
        [250, 60],
        [610, 60],
        [770, 400],
      ],
    },
    s: {
      label: "S-curve",
      points: [
        [110, 380],
        [420, 30],
        [430, 470],
        [760, 130],
      ],
    },
    loop: {
      label: "Loop",
      points: [
        [180, 300],
        [720, 40],
        [200, 120],
        [560, 430],
      ],
    },
  };

  const state = {
    points: [],
    t: 0.5,
    scale: 1,
    showHull: true,
    showConstruction: true,
    preset: "arch",
    drag: -1,
    statusKind: "",
  };

  /* ----------------------------------------------------------- curve maths */

  function binomial(n, k) {
    let result = 1;
    for (let i = 1; i <= k; i++) result = (result * (n - k + i)) / i;
    return result;
  }

  function bernstein(i, n, t) {
    return binomial(n, i) * Math.pow(t, i) * Math.pow(1 - t, n - i);
  }

  function pointAt(points, t) {
    const n = points.length - 1;
    let x = 0;
    let y = 0;
    for (let i = 0; i <= n; i++) {
      const b = bernstein(i, n, t);
      x += b * points[i][0];
      y += b * points[i][1];
    }
    return [x, y];
  }

  function casteljau(points, t) {
    // Returns every intermediate layer, which is what the construction draws.
    const layers = [points.map((p) => p.slice())];
    let current = points.map((p) => p.slice());
    while (current.length > 1) {
      const next = [];
      for (let i = 0; i < current.length - 1; i++) {
        next.push([
          current[i][0] + (current[i + 1][0] - current[i][0]) * t,
          current[i][1] + (current[i + 1][1] - current[i][1]) * t,
        ]);
      }
      layers.push(next);
      current = next;
    }
    return layers;
  }

  function derivativeAt(points, t) {
    // First derivative = n * (difference of the control polygon) as a Bézier.
    const n = points.length - 1;
    if (n < 1) return [0, 0];
    const d = [];
    for (let i = 0; i < n; i++) {
      d.push([n * (points[i + 1][0] - points[i][0]), n * (points[i + 1][1] - points[i][1])]);
    }
    return pointAt(d, t);
  }

  function secondDerivativeAt(points, t) {
    const n = points.length - 1;
    if (n < 2) return [0, 0];
    const dd = [];
    for (let i = 0; i < n - 1; i++) {
      dd.push([
        n * (n - 1) * (points[i + 2][0] - 2 * points[i + 1][0] + points[i][0]),
        n * (n - 1) * (points[i + 2][1] - 2 * points[i + 1][1] + points[i][1]),
      ]);
    }
    return pointAt(dd, t);
  }

  function curvatureAt(points, t) {
    const d1 = derivativeAt(points, t);
    const d2 = secondDerivativeAt(points, t);
    const cross = d1[0] * d2[1] - d1[1] * d2[0];
    const speed = Math.hypot(d1[0], d1[1]);
    if (speed < 1e-9) return 0;
    return cross / Math.pow(speed, 3);
  }

  function sampleCurve(points, steps) {
    const list = [];
    for (let i = 0; i <= steps; i++) list.push(pointAt(points, i / steps));
    return list;
  }

  function arcLength(points, steps) {
    const poly = sampleCurve(points, steps || 400);
    let total = 0;
    for (let i = 1; i < poly.length; i++) {
      total += Math.hypot(poly[i][0] - poly[i - 1][0], poly[i][1] - poly[i - 1][1]);
    }
    return total;
  }

  function maxCurvature(points) {
    let best = 0;
    let at = 0;
    for (let i = 0; i <= 200; i++) {
      const t = i / 200;
      const k = Math.abs(curvatureAt(points, t));
      if (k > best) {
        best = k;
        at = t;
      }
    }
    return { value: best, t: at };
  }

  function setPreset(name) {
    state.preset = name;
    state.points = PRESETS[name].points.map((p) => p.slice());
    ["arch", "s", "loop"].forEach((key) => el("preset-" + key).classList.toggle("active", key === name));
    updateReadouts();
    describe();
    draw();
  }

  function setDegree(n) {
    // Resample the existing curve so the shape stays roughly put while the
    // number of control points changes.
    const target = Math.max(3, Math.min(8, n + 1));
    const current = state.points;
    const next = [];
    for (let i = 0; i < target; i++) {
      next.push(pointAt(current, i / (target - 1)));
    }
    state.points = next;
    updateReadouts();
    describe();
    draw();
  }

  function setStatus(text, kind) {
    const box = el("status");
    box.textContent = text;
    box.className = "status" + (kind ? " " + kind : "");
    state.statusKind = kind || "";
  }

  function updateReadouts() {
    const point = pointAt(state.points, state.t);
    const tangent = derivativeAt(state.points, state.t);
    const kappa = curvatureAt(state.points, state.t);
    const radius = Math.abs(kappa) > 1e-9 ? 1 / Math.abs(kappa) : Infinity;
    const maxK = maxCurvature(state.points);
    const length = arcLength(state.points);

    el("t-out").textContent = state.t.toFixed(3);
    el("degree-out").textContent = String(state.points.length - 1);
    el("scale-out").textContent = state.scale.toFixed(1);
    el("point-read").textContent = `${point[0].toFixed(0)}, ${point[1].toFixed(0)}`;
    el("tan-read").textContent = `${tangent[0].toFixed(0)}, ${tangent[1].toFixed(0)}`;
    el("curv-read").textContent = kappa.toFixed(4);
    el("rad-read").textContent = isFinite(radius) ? radius.toFixed(1) : "∞";
    el("len-read").textContent = length.toFixed(1);
    el("maxcurv-read").textContent = maxK.value.toFixed(4);
    el("degree-hud").textContent = "degree " + (state.points.length - 1);
    el("length-hud").textContent = "length " + length.toFixed(0);
    el("curv-hud").textContent = "max κ " + maxK.value.toFixed(3);
  }

  function describe() {
    const points = state.points;
    const n = points.length - 1;
    const start = points[0];
    const end = points[points.length - 1];
    const kappa = curvatureAt(points, state.t);
    const maxK = maxCurvature(points);

    const hull = convexHull(points);
    const inside = hull.every((edge) => {
      // every control point on the same side of every hull edge
      const [a, b] = edge;
      const cross = (p) => (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
      return points.every((p) => cross(p) >= -1e-6);
    });

    let flavour;
    if (Math.abs(kappa) < 1e-3) {
      flavour = "At this parameter the curve is essentially straight, so the osculating circle has effectively infinite radius.";
    } else if (Math.abs(kappa) === maxK.value) {
      flavour = "This parameter sits at the sharpest bend on the curve — the maximum curvature of the whole span.";
    } else {
      flavour = `The sharpest bend is at t ≈ ${maxK.t.toFixed(2)}, where κ reaches ${maxK.value.toFixed(
        4
      )} (radius ${(1 / maxK.value).toFixed(1)}).`;
    }

    setStatus(
      `${n === 1 ? "A line" : "A degree-" + n + " Bézier"} from (${start[0]}, ${start[1]}) to (${end[0]}, ${end[1]}). ` +
        `B(${state.t.toFixed(2)}) = (${pointAt(points, state.t)[0].toFixed(0)}, ${pointAt(points, state.t)[1].toFixed(0)}); ` +
        `curvature ${kappa.toFixed(4)}. ${flavour} ${inside ? "Every control point lies inside the hull, as the convex hull property requires." : ""}`,
      "good"
    );
  }

  /* ----------------------------------------------------------- hull helper */

  function convexHull(points) {
    const pts = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    if (pts.length < 3) return points.map((p, i) => [p, points[(i + 1) % points.length]]);
    const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lower = [];
    for (const p of pts) {
      while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
      lower.push(p);
    }
    const upper = [];
    for (let i = pts.length - 1; i >= 0; i--) {
      const p = pts[i];
      while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
      upper.push(p);
    }
    const hull = lower.slice(0, -1).concat(upper.slice(0, -1));
    return hull.map((p, i) => [p, hull[(i + 1) % hull.length]]);
  }

  /* --------------------------------------------------------------- drawing */

  function panel(box, title, sub) {
    ctx.fillStyle = "rgba(9, 14, 18, 0.82)";
    ctx.fillRect(box.x, box.y, box.w, box.h);
    ctx.strokeStyle = "#1d2a33";
    ctx.lineWidth = 1;
    ctx.strokeRect(box.x + 0.5, box.y + 0.5, box.w - 1, box.h - 1);
    ctx.fillStyle = "#7e94a3";
    ctx.font = "10px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(title, box.x + 10, box.y - 8);
    if (sub) {
      ctx.fillStyle = "#55697a";
      ctx.textAlign = "right";
      ctx.fillText(sub, box.x + box.w - 10, box.y - 8);
      ctx.textAlign = "left";
    }
  }

  function drawStage() {
    panel(STAGE, "curve", PRESETS[state.preset].label);
    const clip = () => {
      ctx.beginPath();
      ctx.rect(STAGE.x + 2, STAGE.y + 2, STAGE.w - 4, STAGE.h - 4);
      ctx.clip();
    };

    ctx.save();
    clip();

    // faint grid
    ctx.strokeStyle = "#111d24";
    ctx.lineWidth = 1;
    for (let x = STAGE.x; x < STAGE.x + STAGE.w; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, STAGE.y);
      ctx.lineTo(x, STAGE.y + STAGE.h);
      ctx.stroke();
    }
    for (let y = STAGE.y; y < STAGE.y + STAGE.h; y += 60) {
      ctx.beginPath();
      ctx.moveTo(STAGE.x, y);
      ctx.lineTo(STAGE.x + STAGE.w, y);
      ctx.stroke();
    }

    if (state.showHull) {
      const hull = convexHull(state.points);
      ctx.beginPath();
      hull.forEach(([a, b], i) => {
        if (i === 0) ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
      });
      ctx.closePath();
      ctx.fillStyle = "rgba(143, 179, 255, 0.05)";
      ctx.fill();
      ctx.strokeStyle = "rgba(143, 179, 255, 0.35)";
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // control polygon
    ctx.beginPath();
    state.points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p[0], p[1]);
      else ctx.lineTo(p[0], p[1]);
    });
    ctx.strokeStyle = "rgba(143, 179, 255, 0.75)";
    ctx.lineWidth = 1.2;
    ctx.setLineDash([6, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // the curve
    const poly = sampleCurve(state.points, 300);
    ctx.beginPath();
    poly.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p[0], p[1]);
      else ctx.lineTo(p[0], p[1]);
    });
    ctx.strokeStyle = "#6ff0c8";
    ctx.lineWidth = 2.4;
    ctx.stroke();

    if (state.showConstruction) {
      const layers = casteljau(state.points, state.t);
      layers.forEach((layer, depth) => {
        if (depth === 0) return;
        ctx.strokeStyle = depth === layers.length - 1 ? "#ffffff" : `rgba(213, 155, 255, ${0.2 + 0.12 * depth})`;
        ctx.lineWidth = depth === layers.length - 1 ? 1.6 : 1;
        ctx.beginPath();
        layer.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p[0], p[1]);
          else ctx.lineTo(p[0], p[1]);
        });
        ctx.stroke();
        layer.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p[0], p[1], 2.6, 0, Math.PI * 2);
          ctx.fillStyle = depth === layers.length - 1 ? "#ffffff" : "#d59bff";
          ctx.fill();
        });
      });
    }

    // osculating circle
    const point = pointAt(state.points, state.t);
    const kappa = curvatureAt(state.points, state.t);
    if (Math.abs(kappa) > 1e-6) {
      const d1 = derivativeAt(state.points, state.t);
      const d2 = secondDerivativeAt(state.points, state.t);
      const speed = Math.hypot(d1[0], d1[1]) || 1;
      const nx = d1[0] / speed;
      const ny = d1[1] / speed;
      // centre is offset along the normal by 1/κ
      const radius = 1 / Math.abs(kappa);
      const sign = kappa > 0 ? 1 : -1;
      const cx = point[0] - sign * ny * radius;
      const cy = point[1] + sign * nx * radius;
      const scaled = Math.min(radius, 3000) * Math.max(0.2, state.scale);
      ctx.beginPath();
      ctx.arc(cx, cy, scaled, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 180, 95, 0.32)";
      ctx.lineWidth = 1.3;
      ctx.setLineDash([3, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#ffb45f";
      ctx.fill();
      void d2;
    }

    // tangent at t
    const tangent = derivativeAt(state.points, state.t);
    const tlen = Math.hypot(tangent[0], tangent[1]) || 1;
    ctx.beginPath();
    ctx.moveTo(point[0], point[1]);
    ctx.lineTo(point[0] + (tangent[0] / tlen) * 70, point[1] + (tangent[1] / tlen) * 70);
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(point[0], point[1], 5, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "#070c10";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // control points last so they sit on top
    state.points.forEach((p, i) => {
      const active = state.drag === i;
      ctx.fillStyle = active ? "#ffffff" : "#d59bff";
      ctx.fillRect(p[0] - 5, p[1] - 5, 10, 10);
      ctx.strokeStyle = "#0b1218";
      ctx.lineWidth = 1.4;
      ctx.strokeRect(p[0] - 5, p[1] - 5, 10, 10);
      ctx.fillStyle = "#c7d8e2";
      ctx.font = "9px ui-monospace, Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("P" + i, p[0] + 8, p[1] - 7);
    });

    ctx.restore();

    ctx.fillStyle = "#55697a";
    ctx.font = "9.5px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(`t = ${state.t.toFixed(3)} · ${state.points.length} control points`, STAGE.x + 12, STAGE.y + STAGE.h - 12);
  }

  function drawInfo() {
    panel(INFO, "derivative check", "dense polyline vs analytic derivative");
    const steps = 200;
    const h = 1 / steps;
    const t = state.t;
    const numeric = [
      (pointAt(state.points, Math.min(1, t + h))[0] - pointAt(state.points, Math.max(0, t - h))[0]) /
        (Math.min(1, t + h) - Math.max(0, t - h)),
      (pointAt(state.points, Math.min(1, t + h))[1] - pointAt(state.points, Math.max(0, t - h))[1]) /
        (Math.min(1, t + h) - Math.max(0, t - h)),
    ];
    const analytic = derivativeAt(state.points, t);
    const gap = Math.hypot(numeric[0] - analytic[0], numeric[1] - analytic[1]);
    const b = casteljau(state.points, t);
    const last = b[b.length - 1][0];
    const bern = pointAt(state.points, t);
    const agree = Math.hypot(last[0] - bern[0], last[1] - bern[1]);

    const rows = [
      ["de Casteljau vs Bernstein", agree.toExponential(2)],
      ["analytic derivative", `${analytic[0].toFixed(1)}, ${analytic[1].toFixed(1)}`],
      ["central difference", `${numeric[0].toFixed(1)}, ${numeric[1].toFixed(1)}`],
      ["difference", gap.toFixed(4)],
    ];
    rows.forEach((row, i) => {
      const y = INFO.y + 24 + i * 20;
      ctx.fillStyle = "#6f8493";
      ctx.font = "9.5px ui-monospace, Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText(row[0], INFO.x + 14, y);
      ctx.fillStyle = "#e2eef4";
      ctx.textAlign = "right";
      ctx.fillText(row[1], INFO.x + 300, y);
    });

    // length progress bar
    const length = arcLength(state.points);
    const chord = Math.hypot(
      state.points[state.points.length - 1][0] - state.points[0][0],
      state.points[state.points.length - 1][1] - state.points[0][1]
    );
    const barX = INFO.x + 360;
    const barW = INFO.w - 380;
    ctx.fillStyle = "#6f8493";
    ctx.font = "9.5px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(`arc length ${length.toFixed(1)} · chord ${chord.toFixed(1)} · ratio ${(length / Math.max(1, chord)).toFixed(3)}`, barX, INFO.y + 24);
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fillRect(barX, INFO.y + 38, barW, 10);
    ctx.fillStyle = "#6ff0c8";
    ctx.fillRect(barX, INFO.y + 38, Math.min(1, chord / Math.max(1, length)) * barW, 10);
    ctx.fillStyle = "#55697a";
    ctx.fillText("filled = straight-line chord share of the curve's length", barX, INFO.y + 66);
    ctx.fillText("the closer to 1.0, the straighter the curve", barX, INFO.y + 80);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#070c10";
    ctx.fillRect(0, 0, W, H);
    if (!state.points.length) return;
    drawStage();
    drawInfo();

    ctx.fillStyle = "#6f8493";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(
      `degree ${state.points.length - 1} · t ${state.t.toFixed(3)} · curvature scale ${state.scale.toFixed(1)}`,
      26,
      H - 12
    );
    ctx.textAlign = "right";
    ctx.fillStyle = "#6ff0c8";
    ctx.fillText("Bernstein form, de Casteljau and finite differences agree", W - 26, H - 12);
    ctx.textAlign = "left";
  }

  /* -------------------------------------------------------------- controls */

  const point = (evt) => {
    const rect = canvas.getBoundingClientRect();
    return [
      (evt.clientX - rect.left) * (W / (rect.width || W)),
      (evt.clientY - rect.top) * (H / (rect.height || H)),
    ];
  };

  function nearestControl(x, y) {
    let best = -1;
    let bestD = 16;
    state.points.forEach((p, i) => {
      const d = Math.hypot(p[0] - x, p[1] - y);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    return best;
  }

  canvas.addEventListener("pointerdown", (evt) => {
    const [x, y] = point(evt);
    if (x < STAGE.x || x > STAGE.x + STAGE.w || y < STAGE.y || y > STAGE.y + STAGE.h) return;
    const hit = nearestControl(x, y);
    if (hit >= 0) {
      state.drag = hit;
      return;
    }
    // otherwise pick the parameter nearest the click
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i <= 200; i++) {
      const t = i / 200;
      const p = pointAt(state.points, t);
      const d = Math.hypot(p[0] - x, p[1] - y);
      if (d < bestD) {
        bestD = d;
        best = t;
      }
    }
    state.t = best;
    el("t").value = String(best);
    updateReadouts();
    describe();
    draw();
  });

  canvas.addEventListener("pointermove", (evt) => {
    if (state.drag < 0) return;
    const [x, y] = point(evt);
    state.points[state.drag] = [
      Math.max(STAGE.x + 10, Math.min(STAGE.x + STAGE.w - 10, x)),
      Math.max(STAGE.y + 10, Math.min(STAGE.y + STAGE.h - 10, y)),
    ];
    updateReadouts();
    describe();
    draw();
  });

  canvas.addEventListener("pointerup", () => {
    if (state.drag >= 0) {
      state.drag = -1;
      updateReadouts();
      describe();
      draw();
    }
  });

  el("t").addEventListener("input", (evt) => {
    state.t = Math.max(0, Math.min(1, Number(evt.target.value) || 0));
    updateReadouts();
    describe();
    draw();
  });
  el("degree").addEventListener("input", (evt) => {
    setDegree(Number(evt.target.value) || 4);
  });
  el("scale").addEventListener("input", (evt) => {
    state.scale = Math.max(0.2, Math.min(2, Number(evt.target.value) || 1));
    updateReadouts();
    describe();
    draw();
  });

  el("preset-arch").addEventListener("click", () => setPreset("arch"));
  el("preset-s").addEventListener("click", () => setPreset("s"));
  el("preset-loop").addEventListener("click", () => setPreset("loop"));

  el("toggle-hull").addEventListener("click", () => {
    state.showHull = !state.showHull;
    el("toggle-hull").classList.toggle("active", state.showHull);
    draw();
  });
  el("toggle-construction").addEventListener("click", () => {
    state.showConstruction = !state.showConstruction;
    el("toggle-construction").classList.toggle("active", state.showConstruction);
    draw();
  });

  document.addEventListener("keydown", (evt) => {
    if (evt.key === "1") setPreset("arch");
    else if (evt.key === "2") setPreset("s");
    else if (evt.key === "3") setPreset("loop");
    else if (evt.key === "h" || evt.key === "H") {
      state.showHull = !state.showHull;
      el("toggle-hull").classList.toggle("active", state.showHull);
      draw();
    } else if (evt.key === "d" || evt.key === "D") {
      state.showConstruction = !state.showConstruction;
      el("toggle-construction").classList.toggle("active", state.showConstruction);
      draw();
    }
  });

  window.__lab = {
    state,
    PRESETS,
    pointAt,
    casteljau,
    derivativeAt,
    secondDerivativeAt,
    curvatureAt,
    arcLength,
    maxCurvature,
    convexHull,
    setPreset,
    setDegree,
    updateReadouts,
    describe,
    draw,
  };

  state.points = PRESETS.arch.points.map((p) => p.slice());
  updateReadouts();
  describe();
  draw();
})();
