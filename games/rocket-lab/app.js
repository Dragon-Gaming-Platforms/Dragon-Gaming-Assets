(() => {
  "use strict";

  // Tsiolkovsky rocket equation: dv = ve * ln(m0 / mf).
  // Mass ratio R = m0/mf. Propellant fraction = 1 - 1/R.
  // Milestones: LEO 9.4 km/s, Mars transfer 12 km/s, escape 16 km/s.

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");

  const W = canvas.width || 880;
  const H = canvas.height || 660;

  const STAGE = { x: 26, y: 50, w: 828, h: 560 };
  const ROCKET = { x: STAGE.x + STAGE.w / 2, y: STAGE.y + STAGE.h - 80 };
  const BUDGET = { x: STAGE.x + 40, y: STAGE.y + 380, w: STAGE.w - 80, h: 40 };

  const MILESTONES = [
    { name: "LEO", dv: 9.4 },
    { name: "Mars", dv: 12 },
    { name: "Escape", dv: 16 },
  ];

  const PRESETS = {
    chemical: { label: "Chemical", ve: 3.0, ratio: 10, payload: 10 },
    nuclear: { label: "Nuclear", ve: 9.0, ratio: 4, payload: 10 },
    ion: { label: "Ion", ve: 30, ratio: 1.5, payload: 5 },
    staged: { label: "Staged", ve: 3.5, ratio: 20, payload: 10 },
  };

  const state = {
    ve: 3.0,
    ratio: 10,
    payload: 10,
    preset: "chemical",
    flying: false,
    burn: 0, // 0..1 burn progress
  };

  /* -------------------------------------------------------------- rocket maths */

  function deltaV(ve, m0, mf) {
    return ve * Math.log(m0 / mf);
  }

  function massRatio(dv, ve) {
    return Math.exp(dv / ve);
  }

  function propellantFraction(dv, ve) {
    return 1 - Math.exp(-dv / ve);
  }

  function currentDeltaV() {
    return deltaV(state.ve, state.ratio, 1);
  }

  function finalMass() {
    return state.payload;
  }

  function initialMass() {
    return state.payload * state.ratio;
  }

  /* ------------------------------------------------------------------- drawing */

  function drawRocket() {
    const x = ROCKET.x;
    const y = ROCKET.y - state.burn * 180;
    // body
    ctx.fillStyle = "#ffb45f";
    ctx.beginPath();
    ctx.moveTo(x, y - 50);
    ctx.lineTo(x + 14, y - 20);
    ctx.lineTo(x + 14, y + 30);
    ctx.lineTo(x - 14, y + 30);
    ctx.lineTo(x - 14, y - 20);
    ctx.closePath();
    ctx.fill();
    // window
    ctx.fillStyle = "#0a0805";
    ctx.beginPath();
    ctx.arc(x, y - 28, 5, 0, Math.PI * 2);
    ctx.fill();
    // fins
    ctx.fillStyle = "#d98a3d";
    ctx.beginPath();
    ctx.moveTo(x - 14, y + 10);
    ctx.lineTo(x - 24, y + 34);
    ctx.lineTo(x - 14, y + 34);
    ctx.closePath();
    ctx.moveTo(x + 14, y + 10);
    ctx.lineTo(x + 24, y + 34);
    ctx.lineTo(x + 14, y + 34);
    ctx.closePath();
    ctx.fill();
    // flame
    if (state.flying || state.burn > 0) {
      const fl = 20 + Math.sin(state.burn * 40) * 6;
      ctx.fillStyle = "#ff8fa3";
      ctx.beginPath();
      ctx.moveTo(x - 8, y + 34);
      ctx.lineTo(x, y + 34 + fl);
      ctx.lineTo(x + 8, y + 34);
      ctx.closePath();
      ctx.fill();
    }
    // ground
    ctx.strokeStyle = "#3a4a3f";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(STAGE.x + 40, ROCKET.y + 40);
    ctx.lineTo(STAGE.x + STAGE.w - 40, ROCKET.y + 40);
    ctx.stroke();
  }

  function drawBudget() {
    const dv = currentDeltaV();
    const maxDv = 20;
    const frac = Math.min(1, dv / maxDv);
    ctx.strokeStyle = "#26302a";
    ctx.lineWidth = 1;
    ctx.strokeRect(BUDGET.x, BUDGET.y, BUDGET.w, BUDGET.h);
    ctx.fillStyle = "#9be15d";
    ctx.fillRect(BUDGET.x, BUDGET.y, frac * BUDGET.w, BUDGET.h);
    // milestones
    MILESTONES.forEach((ms) => {
      const mx = BUDGET.x + (ms.dv / maxDv) * BUDGET.w;
      ctx.strokeStyle = "#7cc4ff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(mx, BUDGET.y - 6);
      ctx.lineTo(mx, BUDGET.y + BUDGET.h + 6);
      ctx.stroke();
      ctx.fillStyle = "#7cc4ff";
      ctx.font = "10px ui-monospace, Menlo, monospace";
      ctx.textAlign = "center";
      ctx.fillText(ms.name + " " + ms.dv, mx, BUDGET.y + BUDGET.h + 20);
    });
    ctx.fillStyle = "#eef5ea";
    ctx.font = "bold 12px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("Δv = " + dv.toFixed(2) + " km/s", BUDGET.x, BUDGET.y - 10);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#070907";
    ctx.fillRect(STAGE.x, STAGE.y, STAGE.w, STAGE.h);
    drawRocket();
    drawBudget();
    ctx.fillStyle = "#93a48f";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(
      "vₑ=" + state.ve.toFixed(1) + " km/s  m₀/m_f=" + state.ratio.toFixed(1) + "  payload=" + state.payload + " t",
      STAGE.x + 8,
      STAGE.y + 16
    );
  }

  /* ------------------------------------------------------------------ readouts */

  function updateReadouts() {
    const dv = currentDeltaV();
    const propFrac = propellantFraction(dv, state.ve);
    const m0 = initialMass();
    const mf = finalMass();

    el("ve-out").textContent = state.ve.toFixed(1) + " km/s";
    el("ratio-out").textContent = state.ratio.toFixed(1);
    el("payload-out").textContent = state.payload + " t";

    el("dv-hud").textContent = "Δv " + dv.toFixed(2) + " km/s";
    el("ratio-hud").textContent = "ratio " + state.ratio.toFixed(1);
    el("prop-hud").textContent = "propellant " + (propFrac * 100).toFixed(1) + "%";

    el("dv-read").textContent = dv.toFixed(2) + " km/s";
    el("ratio-read").textContent = state.ratio.toFixed(1);
    el("prop-read").textContent = (propFrac * 100).toFixed(1) + "%";
    el("final-read").textContent = mf.toFixed(1) + " t";
    el("leo-read").textContent = dv >= 9.4 ? "✓" : "✗";
    el("esc-read").textContent = dv >= 16 ? "✓" : "✗";
  }

  function describe() {
    const dv = currentDeltaV();
    const need = massRatio(9.4, state.ve);
    let msg;
    if (dv >= 16) {
      msg = "Δv = " + dv.toFixed(2) + " km/s: escape velocity reached. The rocket leaves Earth orbit entirely — no more burns needed.";
    } else if (dv >= 12) {
      msg = "Δv = " + dv.toFixed(2) + " km/s: enough for a Mars transfer. The rocket can leave Earth orbit and cruise to another planet.";
    } else if (dv >= 9.4) {
      msg = "Δv = " + dv.toFixed(2) + " km/s: LEO reached. The rocket is in orbit — but with no margin for plane changes or deorbit burns.";
    } else {
      msg = "Δv = " + dv.toFixed(2) + " km/s: short of LEO (9.4). This engine needs a mass ratio of " + need.toFixed(1) + " to get there — " + (need > 20 ? "more than any single stage can carry, which is why real rockets stage." : "achievable with staging.");
    }
    el("status").textContent = msg;
  }

  /* -------------------------------------------------------------------- wiring */

  function setPreset(name) {
    const p = PRESETS[name];
    if (!p) return;
    state.preset = name;
    state.ve = p.ve;
    state.ratio = p.ratio;
    state.payload = p.payload;
    el("ve").value = String(p.ve);
    el("ratio").value = String(p.ratio);
    el("payload").value = String(p.payload);
    ["chemical", "nuclear", "ion", "staged"].forEach((kk) => {
      el("preset-" + kk).classList.toggle("active", kk === name);
    });
    state.burn = 0;
    state.flying = false;
    updateReadouts();
    describe();
    draw();
  }

  function clearPresets() {
    state.preset = "";
    ["chemical", "nuclear", "ion", "staged"].forEach((kk) => el("preset-" + kk).classList.remove("active"));
  }

  el("ve").addEventListener("input", (evt) => {
    state.ve = Math.max(1, Math.min(40, Number(evt.target.value) || 3));
    clearPresets();
    updateReadouts();
    describe();
    draw();
  });
  el("ratio").addEventListener("input", (evt) => {
    state.ratio = Math.max(1.5, Math.min(30, Number(evt.target.value) || 10));
    clearPresets();
    updateReadouts();
    describe();
    draw();
  });
  el("payload").addEventListener("input", (evt) => {
    state.payload = Math.max(1, Math.min(100, Number(evt.target.value) || 10));
    clearPresets();
    updateReadouts();
    describe();
    draw();
  });

  el("preset-chemical").addEventListener("click", () => setPreset("chemical"));
  el("preset-nuclear").addEventListener("click", () => setPreset("nuclear"));
  el("preset-ion").addEventListener("click", () => setPreset("ion"));
  el("preset-staged").addEventListener("click", () => setPreset("staged"));

  el("btn-launch").addEventListener("click", () => {
    state.flying = true;
    state.burn = 0;
  });
  el("btn-reset").addEventListener("click", () => {
    state.flying = false;
    state.burn = 0;
    updateReadouts();
    describe();
    draw();
  });

  document.addEventListener("keydown", (evt) => {
    if (evt.key === "1") setPreset("chemical");
    else if (evt.key === "2") setPreset("nuclear");
    else if (evt.key === "3") setPreset("ion");
    else if (evt.key === "4") setPreset("staged");
    else if (evt.key === " ") {
      evt.preventDefault();
      el("btn-launch").click();
    } else if (evt.key === "r" || evt.key === "R") el("btn-reset").click();
  });

  let last = 0;
  function frame(nowMs) {
    const dt = last ? (nowMs - last) / 1000 : 0.016;
    last = nowMs;
    if (state.flying) {
      state.burn = Math.min(1, state.burn + dt / 3);
      if (state.burn >= 1) state.flying = false;
      draw();
    }
    requestAnimationFrame(frame);
  }

  window.__lab = {
    state,
    PRESETS,
    MILESTONES,
    deltaV,
    massRatio,
    propellantFraction,
    setPreset,
    updateReadouts,
    describe,
    draw,
  };

  setPreset("chemical");
  requestAnimationFrame(frame);
})();
