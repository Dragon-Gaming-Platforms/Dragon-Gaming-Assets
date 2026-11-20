(() => {
  "use strict";

  // RC charging circuit. The capacitor voltage and current obey
  //   Vc(t) = V0 (1 - e^(-t/RC)),   Ic(t) = (V0/R) e^(-t/RC)
  // with time constant τ = RC. Charge Q = C·Vc, energy = ½·C·Vc².

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");

  const W = canvas.width || 880;
  const H = canvas.height || 660;

  const STAGE = { x: 26, y: 50, w: 828, h: 560 };
  const CIRCUIT = { x: STAGE.x + 60, y: STAGE.y + 40, w: STAGE.w - 120, h: 200 };
  const PLOT = { x: STAGE.x + 50, y: STAGE.y + 300, w: STAGE.w - 100, h: 230 };

  const PRESETS = {
    fast: { label: "Fast", r: 100, c: 100, v0: 9 },
    medium: { label: "Medium", r: 1000, c: 1000, v0: 9 },
    slow: { label: "Slow", r: 5000, c: 5000, v0: 12 },
    huge: { label: "Huge", r: 10000, c: 10000, v0: 24 },
  };

  const state = {
    r: 1000,
    c: 1000, // µF
    v0: 9,
    preset: "medium",
    t: 0,
    mode: "charge", // "charge" | "discharge"
    running: false,
    showCurves: true,
  };

  /* -------------------------------------------------------------- circuit maths */

  function timeConstant(R, Cfarad) {
    return R * Cfarad;
  }

  function chargeVoltage(t, R, Cfarad, V0) {
    const tau = R * Cfarad;
    return V0 * (1 - Math.exp(-t / tau));
  }

  function chargeCurrent(t, R, Cfarad, V0) {
    const tau = R * Cfarad;
    return (V0 / R) * Math.exp(-t / tau);
  }

  function dischargeVoltage(t, R, Cfarad, Vstart) {
    const tau = R * Cfarad;
    return Vstart * Math.exp(-t / tau);
  }

  function chargeAt(Cfarad, V) {
    return Cfarad * V;
  }

  function capacitorEnergy(Cfarad, V) {
    return 0.5 * Cfarad * V * V;
  }

  function currentValues() {
    const Cfarad = state.c * 1e-6;
    if (state.mode === "charge") {
      return {
        vc: chargeVoltage(state.t, state.r, Cfarad, state.v0),
        ic: chargeCurrent(state.t, state.r, Cfarad, state.v0),
      };
    }
    const vStart = state.v0;
    const vc = dischargeVoltage(state.t, state.r, Cfarad, vStart);
    const tau = state.r * Cfarad;
    return { vc, ic: -(vc / state.r) };
  }

  /* ------------------------------------------------------------------- drawing */

  function drawCircuit() {
    const { x, y, w, h } = CIRCUIT;
    ctx.strokeStyle = "#8296a9";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // battery (left side)
    ctx.strokeStyle = "#ffb45f";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y + h / 2 - 20);
    ctx.lineTo(x, y + h / 2 + 20);
    ctx.stroke();
    ctx.fillStyle = "#ffb45f";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "center";
    ctx.fillText(state.v0.toFixed(1) + "V", x + 24, y + h / 2 + 4);

    // resistor (top side)
    ctx.strokeStyle = "#7cc4ff";
    ctx.lineWidth = 2;
    const rx = x + w / 2 - 50;
    ctx.strokeRect(rx, y - 8, 100, 16);
    ctx.fillStyle = "#7cc4ff";
    ctx.fillText(state.r + "Ω", x + w / 2, y - 14);

    // capacitor (right side)
    ctx.strokeStyle = "#9be15d";
    ctx.lineWidth = 2;
    const cx = x + w;
    ctx.beginPath();
    ctx.moveTo(cx, y + h / 2 - 22);
    ctx.lineTo(cx, y + h / 2 - 6);
    ctx.moveTo(cx, y + h / 2 + 6);
    ctx.lineTo(cx, y + h / 2 + 22);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 14, y + h / 2 - 6);
    ctx.lineTo(cx + 14, y + h / 2 - 6);
    ctx.moveTo(cx - 14, y + h / 2 + 6);
    ctx.lineTo(cx + 14, y + h / 2 + 6);
    ctx.stroke();
    ctx.fillStyle = "#9be15d";
    ctx.fillText(state.c + "µF", cx - 30, y + h / 2 + 4);

    // current direction arrow (top)
    const { ic } = currentValues();
    ctx.fillStyle = ic >= 0 ? "#7cc4ff" : "#ff8fa3";
    const ax = x + w / 2 + (ic >= 0 ? 70 : -70);
    ctx.beginPath();
    ctx.moveTo(ax, y + h / 2);
    ctx.lineTo(ax + (ic >= 0 ? 12 : -12), y + h / 2 - 5);
    ctx.lineTo(ax + (ic >= 0 ? 12 : -12), y + h / 2 + 5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#93a48f";
    ctx.fillText("I", ax + (ic >= 0 ? 6 : -6), y + h / 2 - 10);
  }

  function drawPlot() {
    const { x, y, w, h } = PLOT;
    ctx.fillStyle = "#070907";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#26302a";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);

    const Cfarad = state.c * 1e-6;
    const tau = state.r * Cfarad;
    const tMax = Math.max(5 * tau, state.t * 1.1, 0.01);
    const vMax = state.v0;
    const iMax = state.v0 / state.r;

    // supply line
    ctx.strokeStyle = "rgba(255,180,95,0.6)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.moveTo(x, y + h - (state.v0 / vMax) * h);
    ctx.lineTo(x + w, y + h - (state.v0 / vMax) * h);
    ctx.stroke();
    ctx.setLineDash([]);

    if (state.showCurves) {
      // Vc curve
      ctx.strokeStyle = "#9be15d";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= 200; i++) {
        const t = (i / 200) * tMax;
        const vc = state.mode === "charge" ? chargeVoltage(t, state.r, Cfarad, state.v0) : dischargeVoltage(t, state.r, Cfarad, state.v0);
        const px = x + (t / tMax) * w;
        const py = y + h - (vc / vMax) * h;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Ic curve (scaled to its own max)
      ctx.strokeStyle = "#7cc4ff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= 200; i++) {
        const t = (i / 200) * tMax;
        const ic = state.mode === "charge" ? chargeCurrent(t, state.r, Cfarad, state.v0) : -(dischargeVoltage(t, state.r, Cfarad, state.v0) / state.r);
        const px = x + (t / tMax) * w;
        const py = y + h - (Math.abs(ic) / iMax) * h;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    // tau marker
    const tx = x + (tau / tMax) * w;
    ctx.strokeStyle = "rgba(130,150,169,0.4)";
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.moveTo(tx, y);
    ctx.lineTo(tx, y + h);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#93a48f";
    ctx.font = "10px ui-monospace, Menlo, monospace";
    ctx.textAlign = "center";
    ctx.fillText("τ", tx, y + h + 14);
    ctx.fillText("0", x, y + h + 14);
    ctx.fillText(tMax.toFixed(tMax < 1 ? 2 : 1) + "s", x + w, y + h + 14);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#070907";
    ctx.fillRect(STAGE.x, STAGE.y, STAGE.w, STAGE.h);
    drawCircuit();
    drawPlot();
  }

  /* ------------------------------------------------------------------ readouts */

  function updateReadouts() {
    const Cfarad = state.c * 1e-6;
    const tau = state.r * Cfarad;
    const { vc, ic } = currentValues();

    el("r-out").textContent = state.r + " Ω";
    el("c-out").textContent = state.c + " µF";
    el("v0-out").textContent = state.v0.toFixed(1) + " V";

    el("tau-hud").textContent = "τ " + tau.toFixed(tau < 0.1 ? 3 : 2) + " s";
    el("vc-hud").textContent = "V_c " + vc.toFixed(2) + " V";
    el("ic-hud").textContent = "I_c " + (ic * 1000).toFixed(1) + " mA";

    el("tau-read").textContent = tau.toFixed(tau < 0.1 ? 3 : 2) + " s";
    el("vc-read").textContent = vc.toFixed(2) + " V";
    el("ic-read").textContent = (ic * 1000).toFixed(1) + " mA";
    el("q-read").textContent = (chargeAt(Cfarad, vc) * 1000).toFixed(2) + " mC";
    el("e-read").textContent = (capacitorEnergy(Cfarad, vc) * 1000).toFixed(2) + " mJ";
    el("t-read").textContent = state.t.toFixed(2) + " s";
  }

  function describe() {
    const Cfarad = state.c * 1e-6;
    const tau = state.r * Cfarad;
    const { vc } = currentValues();
    const frac = vc / state.v0;
    let msg;
    if (state.mode === "discharge") {
      msg = "Discharging through the resistor: V_c decays as e^(−t/τ) with τ = " + tau.toFixed(2) + " s. The stored energy leaves as heat in the resistor.";
    } else if (frac < 0.5) {
      msg = "Charging: V_c = " + vc.toFixed(2) + " V (" + (frac * 100).toFixed(0) + "% of supply). At t = τ (" + tau.toFixed(2) + " s) it reaches 63%; at 5τ, 99%.";
    } else if (frac < 0.99) {
      msg = "Nearly full: V_c = " + vc.toFixed(2) + " V (" + (frac * 100).toFixed(1) + "%). The current has decayed to " + (Math.exp(-state.t / tau) * 100).toFixed(1) + "% of its start — the capacitor is choking the flow.";
    } else {
      msg = "Full: V_c ≈ V₀ = " + state.v0.toFixed(1) + " V and the current is ~0. A charged capacitor blocks DC — the loop is effectively open.";
    }
    el("status").textContent = msg;
  }

  /* -------------------------------------------------------------------- wiring */

  function setPreset(name) {
    const p = PRESETS[name];
    if (!p) return;
    state.preset = name;
    state.r = p.r;
    state.c = p.c;
    state.v0 = p.v0;
    el("r").value = String(p.r);
    el("c").value = String(p.c);
    el("v0").value = String(p.v0);
    ["fast", "medium", "slow", "huge"].forEach((kk) => {
      el("preset-" + kk).classList.toggle("active", kk === name);
    });
    state.t = 0;
    state.mode = "charge";
    state.running = true;
    updateReadouts();
    describe();
    draw();
  }

  function clearPresets() {
    state.preset = "";
    ["fast", "medium", "slow", "huge"].forEach((kk) => el("preset-" + kk).classList.remove("active"));
  }

  el("r").addEventListener("input", (evt) => {
    state.r = Math.max(100, Math.min(10000, Number(evt.target.value) || 1000));
    clearPresets();
    updateReadouts();
    describe();
    draw();
  });
  el("c").addEventListener("input", (evt) => {
    state.c = Math.max(100, Math.min(10000, Number(evt.target.value) || 1000));
    clearPresets();
    updateReadouts();
    describe();
    draw();
  });
  el("v0").addEventListener("input", (evt) => {
    state.v0 = Math.max(1, Math.min(24, Number(evt.target.value) || 9));
    clearPresets();
    updateReadouts();
    describe();
    draw();
  });

  el("preset-fast").addEventListener("click", () => setPreset("fast"));
  el("preset-medium").addEventListener("click", () => setPreset("medium"));
  el("preset-slow").addEventListener("click", () => setPreset("slow"));
  el("preset-huge").addEventListener("click", () => setPreset("huge"));

  el("btn-charge").addEventListener("click", () => {
    state.mode = "charge";
    state.t = 0;
    state.running = true;
    updateReadouts();
    describe();
    draw();
  });
  el("btn-discharge").addEventListener("click", () => {
    state.mode = "discharge";
    state.t = 0;
    state.running = true;
    updateReadouts();
    describe();
    draw();
  });
  el("toggle-curves").addEventListener("click", () => {
    state.showCurves = !state.showCurves;
    el("toggle-curves").classList.toggle("active", state.showCurves);
    draw();
  });

  document.addEventListener("keydown", (evt) => {
    if (evt.key === "1") setPreset("fast");
    else if (evt.key === "2") setPreset("medium");
    else if (evt.key === "3") setPreset("slow");
    else if (evt.key === "4") setPreset("huge");
    else if (evt.key === " ") {
      evt.preventDefault();
      el("btn-charge").click();
    } else if (evt.key === "d" || evt.key === "D") el("btn-discharge").click();
  });

  let last = 0;
  function frame(nowMs) {
    const dt = last ? (nowMs - last) / 1000 : 0.016;
    last = nowMs;
    if (state.running) {
      state.t += dt;
      const Cfarad = state.c * 1e-6;
      const tau = state.r * Cfarad;
      if (state.t > 8 * tau) state.running = false;
      updateReadouts();
      describe();
      draw();
    }
    requestAnimationFrame(frame);
  }

  window.__lab = {
    state,
    PRESETS,
    timeConstant,
    chargeVoltage,
    chargeCurrent,
    dischargeVoltage,
    chargeAt,
    capacitorEnergy,
    setPreset,
    updateReadouts,
    describe,
    draw,
  };

  state.running = true;
  updateReadouts();
  describe();
  draw();
  requestAnimationFrame(frame);
})();
