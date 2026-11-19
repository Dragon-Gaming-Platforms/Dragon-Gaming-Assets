(() => {
  "use strict";

  // Projectile motion with quadratic air drag. The shell obeys
  //   x'' = -k * vx * |v|,   y'' = -g - k * vy * |v|
  // integrated with RK4 at 240 Hz. With k = 0 the flight is the textbook
  // parabola: range = v0^2 sin(2θ)/g, apex = (v0 sinθ)^2/(2g),
  // time = 2 v0 sinθ / g.

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");

  const W = canvas.width || 880;
  const H = canvas.height || 660;

  const STAGE = { x: 26, y: 50, w: 828, h: 560 };
  const GROUND_Y = STAGE.y + STAGE.h - 30;
  const CANNON_X = STAGE.x + 60;

  const PLANETS = {
    earth: { label: "Earth", g: 9.8 },
    mars: { label: "Mars", g: 3.7 },
    moon: { label: "Moon", g: 1.6 },
    jupiter: { label: "Jupiter", g: 24.8 },
  };

  const state = {
    v0: 35,
    angle: 45,
    drag: 0,
    planet: "earth",
    g: 9.8,
    flying: false,
    showTrail: true,
    shell: null, // {x, y, vx, vy, t}
    flight: [], // recorded points
    result: null, // last simulate() result
    scale: 1, // px per metre, fit to stage
  };

  /* -------------------------------------------------------------- physics core */

  function accel(x, y, vx, vy, k, g) {
    const sp = Math.hypot(vx, vy);
    return [-k * vx * sp, -g - k * vy * sp];
  }

  function rk4Step(s, dt, k, g) {
    const a1 = accel(s.x, s.y, s.vx, s.vy, k, g);
    const vx2 = s.vx + 0.5 * dt * a1[0];
    const vy2 = s.vy + 0.5 * dt * a1[1];
    const a2 = accel(s.x, s.y, vx2, vy2, k, g);
    const vx3 = s.vx + 0.5 * dt * a2[0];
    const vy3 = s.vy + 0.5 * dt * a2[1];
    const a3 = accel(s.x, s.y, vx3, vy3, k, g);
    const vx4 = s.vx + dt * a3[0];
    const vy4 = s.vy + dt * a3[1];
    const a4 = accel(s.x, s.y, vx4, vy4, k, g);
    s.x += (dt / 6) * (s.vx + 2 * vx2 + 2 * vx3 + vx4);
    s.y += (dt / 6) * (s.vy + 2 * vy2 + 2 * vy3 + vy4);
    s.vx += (dt / 6) * (a1[0] + 2 * a2[0] + 2 * a3[0] + a4[0]);
    s.vy += (dt / 6) * (a1[1] + 2 * a2[1] + 2 * a3[1] + a4[1]);
    s.t += dt;
  }

  function simulate(v0, angleDeg, k, g) {
    const th = (angleDeg * Math.PI) / 180;
    const s = { x: 0, y: 0, vx: v0 * Math.cos(th), vy: v0 * Math.sin(th), t: 0 };
    const dt = 1 / 240;
    const points = [{ x: 0, y: 0 }];
    let apex = 0;
    let guard = 0;
    while (s.y >= 0 || s.t === 0) {
      rk4Step(s, dt, k, g);
      if (s.y < 0) break;
      apex = Math.max(apex, s.y);
      points.push({ x: s.x, y: s.y });
      guard++;
      if (guard > 240 * 120) break; // 120 s safety cap
    }
    const impact = Math.hypot(s.vx, s.vy);
    return { range: s.x, apex, time: s.t, impact, points };
  }

  function noDragRange(v0, angleDeg, g) {
    const th = (angleDeg * Math.PI) / 180;
    return (v0 * v0 * Math.sin(2 * th)) / g;
  }

  function noDragApex(v0, angleDeg, g) {
    const th = (angleDeg * Math.PI) / 180;
    const vy = v0 * Math.sin(th);
    return (vy * vy) / (2 * g);
  }

  function noDragTime(v0, angleDeg, g) {
    const th = (angleDeg * Math.PI) / 180;
    return (2 * v0 * Math.sin(th)) / g;
  }

  function optimalAngle(v0, k, g) {
    // scan for the drag-aware optimum (always <= 45°)
    let best = 45;
    let bestR = -1;
    for (let a = 10; a <= 60; a += 1) {
      const r = simulate(v0, a, k, g).range;
      if (r > bestR) { bestR = r; best = a; }
    }
    return best;
  }

  /* ------------------------------------------------------------------- drawing */

  function fitScale() {
    const r = state.result ? state.result.range : noDragRange(state.v0, state.angle, state.g);
    const a = state.result ? state.result.apex : noDragApex(state.v0, state.angle, state.g);
    const sx = STAGE.w / Math.max(10, r * 1.15);
    const sy = STAGE.h / Math.max(10, a * 1.25);
    state.scale = Math.min(sx, sy);
  }

  function toPx(x, y) {
    return [CANNON_X + x * state.scale, GROUND_Y - y * state.scale];
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#070907";
    ctx.fillRect(STAGE.x, STAGE.y, STAGE.w, STAGE.h);

    // ground
    ctx.strokeStyle = "#3a4a3f";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(STAGE.x, GROUND_Y);
    ctx.lineTo(STAGE.x + STAGE.w, GROUND_Y);
    ctx.stroke();

    // distance gridlines every 50 m
    ctx.strokeStyle = "rgba(130,150,169,0.12)";
    ctx.lineWidth = 1;
    ctx.fillStyle = "#74868f";
    ctx.font = "10px ui-monospace, Menlo, monospace";
    ctx.textAlign = "center";
    for (let d = 50; d * state.scale < STAGE.w; d += 50) {
      const [gx] = toPx(d, 0);
      ctx.beginPath();
      ctx.moveTo(gx, GROUND_Y);
      ctx.lineTo(gx, GROUND_Y - 6);
      ctx.stroke();
      ctx.fillText(d + "m", gx, GROUND_Y + 16);
    }

    // no-drag prediction (dashed)
    const pred = simulate(state.v0, state.angle, 0, state.g);
    ctx.strokeStyle = "rgba(124,196,255,0.65)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    pred.points.forEach((p, i) => {
      const [x, y] = toPx(p.x, p.y);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // real flight trace
    if (state.showTrail && state.flight.length > 1) {
      ctx.strokeStyle = "#9be15d";
      ctx.lineWidth = 2;
      ctx.beginPath();
      state.flight.forEach((p, i) => {
        const [x, y] = toPx(p.x, p.y);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // landing flag
    const land = state.result ? state.result.range : pred.range;
    const [fx] = toPx(land, 0);
    ctx.strokeStyle = "#ff8fa3";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(fx, GROUND_Y);
    ctx.lineTo(fx, GROUND_Y - 26);
    ctx.stroke();
    ctx.fillStyle = "#ff8fa3";
    ctx.beginPath();
    ctx.moveTo(fx, GROUND_Y - 26);
    ctx.lineTo(fx + 14, GROUND_Y - 21);
    ctx.lineTo(fx, GROUND_Y - 16);
    ctx.closePath();
    ctx.fill();

    // cannon
    const th = (state.angle * Math.PI) / 180;
    ctx.strokeStyle = "#ffb45f";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(CANNON_X, GROUND_Y);
    ctx.lineTo(CANNON_X + Math.cos(th) * 34, GROUND_Y - Math.sin(th) * 34);
    ctx.stroke();
    ctx.fillStyle = "#ffb45f";
    ctx.beginPath();
    ctx.arc(CANNON_X, GROUND_Y, 9, 0, Math.PI * 2);
    ctx.fill();

    // shell in flight
    if (state.shell) {
      const [sx, sy] = toPx(state.shell.x, state.shell.y);
      ctx.fillStyle = "#f3ffe0";
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#93a48f";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(
      "v0=" + state.v0 + " m/s  θ=" + state.angle + "°  k=" + state.drag.toFixed(2) + "  g=" + state.g + " m/s² (" + PLANETS[state.planet].label + ")",
      STAGE.x + 8,
      STAGE.y + 16
    );
  }

  /* ------------------------------------------------------------------ readouts */

  function updateReadouts() {
    const res = state.result || simulate(state.v0, state.angle, state.drag, state.g);
    const nd = noDragRange(state.v0, state.angle, state.g);
    const loss = nd > 0 ? ((nd - res.range) / nd) * 100 : 0;

    el("v0-out").textContent = state.v0 + " m/s";
    el("angle-out").textContent = state.angle + "°";
    el("drag-out").textContent = state.drag.toFixed(2);

    el("range-hud").textContent = "range " + res.range.toFixed(0) + " m";
    el("apex-hud").textContent = "apex " + res.apex.toFixed(0) + " m";
    el("time-hud").textContent = "flight " + res.time.toFixed(1) + " s";

    el("range-read").textContent = res.range.toFixed(1) + " m";
    el("apex-read").textContent = res.apex.toFixed(1) + " m";
    el("time-read").textContent = res.time.toFixed(2) + " s";
    el("impact-read").textContent = res.impact.toFixed(1) + " m/s";
    el("nodrag-read").textContent = nd.toFixed(1) + " m";
    el("loss-read").textContent = loss.toFixed(1) + "%";
  }

  function describe() {
    const res = state.result || simulate(state.v0, state.angle, state.drag, state.g);
    const nd = noDragRange(state.v0, state.angle, state.g);
    let msg;
    if (state.drag === 0) {
      msg = "No drag: the flight is a perfect parabola. Range " + res.range.toFixed(0) + " m at " + state.angle + "° — 45° is optimal, and the formula v₀²·sin(2θ)/g matches the simulation exactly.";
    } else {
      const opt = optimalAngle(state.v0, state.drag, state.g);
      const loss = ((nd - res.range) / nd) * 100;
      msg = "Drag costs " + loss.toFixed(1) + "% of the range (" + res.range.toFixed(0) + " m vs " + nd.toFixed(0) + " m). The drag-aware optimum angle is " + opt + "°, not 45° — the shell should leave flatter to spend less time fighting air.";
    }
    if (state.planet !== "earth") {
      msg += " On " + PLANETS[state.planet].label + " (g=" + state.g + " m/s²) the same cannon flies " + (res.range / Math.max(1, simulate(state.v0, state.angle, state.drag, 9.8).range)).toFixed(2) + "× farther than on Earth.";
    }
    el("status").textContent = msg;
  }

  /* -------------------------------------------------------------------- wiring */

  function setPlanet(name) {
    const p = PLANETS[name];
    if (!p) return;
    state.planet = name;
    state.g = p.g;
    ["earth", "mars", "moon", "jupiter"].forEach((kk) => {
      el("preset-" + kk).classList.toggle("active", kk === name);
    });
    state.result = simulate(state.v0, state.angle, state.drag, state.g);
    fitScale();
    updateReadouts();
    describe();
    draw();
  }

  function launch() {
    const th = (state.angle * Math.PI) / 180;
    state.shell = { x: 0, y: 0, vx: state.v0 * Math.cos(th), vy: state.v0 * Math.sin(th), t: 0 };
    state.flight = [{ x: 0, y: 0 }];
    state.flying = true;
    state.result = simulate(state.v0, state.angle, state.drag, state.g);
    fitScale();
    updateReadouts();
    describe();
    draw();
  }

  function reset() {
    state.shell = null;
    state.flight = [];
    state.flying = false;
    state.result = simulate(state.v0, state.angle, state.drag, state.g);
    fitScale();
    updateReadouts();
    describe();
    draw();
  }

  el("v0").addEventListener("input", (evt) => {
    state.v0 = Math.max(10, Math.min(60, Number(evt.target.value) || 35));
    state.result = simulate(state.v0, state.angle, state.drag, state.g);
    fitScale();
    updateReadouts();
    describe();
    draw();
  });
  el("angle").addEventListener("input", (evt) => {
    state.angle = Math.max(5, Math.min(85, Number(evt.target.value) || 45));
    state.result = simulate(state.v0, state.angle, state.drag, state.g);
    fitScale();
    updateReadouts();
    describe();
    draw();
  });
  el("drag").addEventListener("input", (evt) => {
    state.drag = Math.max(0, Math.min(0.05, Number(evt.target.value) || 0));
    state.result = simulate(state.v0, state.angle, state.drag, state.g);
    fitScale();
    updateReadouts();
    describe();
    draw();
  });

  el("preset-earth").addEventListener("click", () => setPlanet("earth"));
  el("preset-mars").addEventListener("click", () => setPlanet("mars"));
  el("preset-moon").addEventListener("click", () => setPlanet("moon"));
  el("preset-jupiter").addEventListener("click", () => setPlanet("jupiter"));

  el("btn-launch").addEventListener("click", launch);
  el("btn-reset").addEventListener("click", reset);
  el("toggle-trail").addEventListener("click", () => {
    state.showTrail = !state.showTrail;
    el("toggle-trail").classList.toggle("active", state.showTrail);
    draw();
  });

  function point(evt) {
    const r = canvas.getBoundingClientRect();
    return [evt.clientX - r.left, evt.clientY - r.top];
  }

  canvas.addEventListener("pointerdown", (evt) => {
    const [x, y] = point(evt);
    const dx = x - CANNON_X;
    const dy = GROUND_Y - y;
    if (dx > 0 && dy > 0) {
      state.angle = Math.max(5, Math.min(85, Math.round((Math.atan2(dy, dx) * 180) / Math.PI)));
      el("angle").value = String(state.angle);
      state.result = simulate(state.v0, state.angle, state.drag, state.g);
      fitScale();
      updateReadouts();
      describe();
      draw();
    }
  });

  document.addEventListener("keydown", (evt) => {
    if (evt.key === "1") setPlanet("earth");
    else if (evt.key === "2") setPlanet("mars");
    else if (evt.key === "3") setPlanet("moon");
    else if (evt.key === "4") setPlanet("jupiter");
    else if (evt.key === " ") {
      evt.preventDefault();
      launch();
    } else if (evt.key === "r" || evt.key === "R") reset();
  });

  let last = 0;
  function frame(nowMs) {
    const dt = last ? (nowMs - last) / 1000 : 0.016;
    last = nowMs;
    if (state.flying && state.shell) {
      const steps = Math.max(1, Math.ceil(dt / (1 / 240)));
      const h = dt / steps;
      for (let i = 0; i < steps; i++) rk4Step(state.shell, h, state.drag, state.g);
      if (state.shell.y < 0) {
        state.shell.y = 0;
        state.flying = false;
        state.shell = null;
      } else {
        state.flight.push({ x: state.shell.x, y: state.shell.y });
      }
      draw();
    }
    requestAnimationFrame(frame);
  }

  window.__lab = {
    state,
    PLANETS,
    simulate,
    noDragRange,
    noDragApex,
    noDragTime,
    optimalAngle,
    rk4Step,
    setPlanet,
    launch,
    reset,
    updateReadouts,
    describe,
    draw,
  };

  reset();
  requestAnimationFrame(frame);
})();
