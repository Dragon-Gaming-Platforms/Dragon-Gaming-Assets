(() => {
  "use strict";

  // Everything below uses the machine's own IEEE-754 arithmetic. The bit strips
  // are read straight out of a DataView, so what you see is the encoding the CPU
  // actually produced for the current value.

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");

  const W = canvas.width || 880;
  const H = canvas.height || 660;

  const SUM_BOX = { x: 26, y: 286, w: 400, h: 300 };
  const CAN_BOX = { x: 454, y: 286, w: 400, h: 300 };

  const state = {
    value: 0.1,
    termsExp: 40,
    xExp: 6,
    sums: null,
    cancel: null,
    statusKind: "",
  };

  /* ------------------------------------------------------------- bit tools */

  const buf32 = new ArrayBuffer(4);
  const buf64 = new ArrayBuffer(8);
  const view32 = new DataView(buf32);
  const view64 = new DataView(buf64);

  function bits32(v) {
    view32.setFloat32(0, v, false);
    return view32.getUint32(0, false).toString(2).padStart(32, "0");
  }

  function bits64(v) {
    view64.setFloat64(0, v, false);
    return view64.getBigUint64(0, false).toString(2).padStart(64, "0");
  }

  function nextUp(v, single) {
    if (!isFinite(v)) return v;
    if (v === 0) return single ? Math.pow(2, -149) : Math.pow(2, -1074);
    if (single) {
      view32.setFloat32(0, v, false);
      let bits = view32.getUint32(0, false);
      bits += v > 0 ? 1 : -1;
      view32.setUint32(0, bits >>> 0, false);
      return view32.getFloat32(0, false);
    }
    view64.setFloat64(0, v, false);
    let bits = view64.getBigUint64(0, false);
    bits += v > 0 ? 1n : -1n;
    view64.setBigUint64(0, bits & 0xffffffffffffffffn, false);
    return view64.getFloat64(0, false);
  }

  function nextDown(v, single) {
    if (!isFinite(v)) return v;
    if (v === 0) return single ? -Math.pow(2, -149) : -Math.pow(2, -1074);
    if (single) {
      view32.setFloat32(0, v, false);
      let bits = view32.getUint32(0, false);
      bits += v > 0 ? -1 : 1;
      view32.setUint32(0, bits >>> 0, false);
      return view32.getFloat32(0, false);
    }
    view64.setFloat64(0, v, false);
    let bits = view64.getBigUint64(0, false);
    bits += v > 0 ? -1n : 1n;
    view64.setBigUint64(0, bits & 0xffffffffffffffffn, false);
    return view64.getFloat64(0, false);
  }

  const ulp = (v, single) => nextUp(v, single) - v;

  function sciLong(v) {
    if (v === 0) return "0";
    return Number(v.toPrecision(12)).toString();
  }

  function rulerLabel(v) {
    if (v === 0) return "0";
    if (Math.abs(v) >= 1e6 || Math.abs(v) < 1e-4) return v.toPrecision(17);
    return v.toPrecision(9);
  }

  function sci(v) {
    if (v === 0) return "0";
    if (Math.abs(v) >= 1e5 || Math.abs(v) < 1e-3) return v.toExponential(3);
    return String(Number(v.toPrecision(8)));
  }

  /* ---------------------------------------------------------- summation */

  const TERM = 0.1;

  function summation(limit) {
    const checkpoints = [];
    for (let e = 3; e <= 6; e += 0.1) checkpoints.push(Math.round(Math.pow(10, e)));
    const marks = checkpoints.filter((n) => n <= limit);
    if (marks[marks.length - 1] !== limit) marks.push(limit);

    let naive = 0;
    let kahan = 0;
    let comp = 0;
    let single = 0;
    let mark = 0;
    const naiveCurve = [];
    const kahanCurve = [];
    const singleCurve = [];
    const xs = [];

    const record = (n) => {
      xs.push(n);
      naiveCurve.push(Math.abs(naive - n * TERM));
      kahanCurve.push(Math.abs(kahan - n * TERM));
      singleCurve.push(Math.abs(single - n * TERM));
    };

    for (let i = 0; i < limit; i++) {
      naive += TERM;
      const y = TERM - comp;
      const t = kahan + y;
      comp = t - kahan - y;
      kahan = t;
      single = Math.fround(single + Math.fround(TERM));
      if (mark < marks.length && i + 1 === marks[mark]) {
        record(marks[mark]);
        mark++;
      }
    }
    return { limit, naive, kahan, single, xs, naiveCurve, kahanCurve, singleCurve };
  }

  /* ------------------------------------------------------- cancellation */

  function cancellation() {
    const xs = [];
    const errs = [];
    for (let e = 2; e <= 9.001; e += 0.1) {
      const x = Math.pow(10, e);
      const naiveValue = Math.sqrt(x * x + 1) - x;
      const stable = 1 / (Math.sqrt(x * x + 1) + x);
      const rel = stable === 0 ? 0 : Math.abs(naiveValue - stable) / stable;
      xs.push(x);
      errs.push(rel === 0 ? 1e-17 : rel);
    }
    return { xs, errs };
  }

  function currentTermCount() {
    return Math.round(Math.pow(10, 3 + state.termsExp / 20));
  }

  /* ------------------------------------------------------------- readouts */

  function setStatus(text, kind) {
    const box = el("status");
    box.textContent = text;
    box.className = "status" + (kind ? " " + kind : "");
    state.statusKind = kind || "";
  }

  function updateReadouts() {
    const v = state.value;
    const u64 = ulp(v, false);
    const u32 = ulp(v, true);
    el("value-out").textContent = sci(v);
    const nTerms = currentTermCount();
    el("terms-out").textContent =
      nTerms >= 1e6 ? nTerms / 1e6 + "M" : nTerms >= 1000 ? Math.round(nTerms / 1000) + "k" : String(nTerms);
    el("x-out").textContent = "1e" + state.xExp.toFixed(1);
    el("ulp64-read").textContent = sci(u64);
    el("ulp32-read").textContent = sci(u32);
    el("ulp-hud").textContent = "ulp32 " + sci(u32);

    const s = state.sums;
    if (s) {
      const n = currentTermCount();
      const naiveErr = Math.abs(s.naive - n * TERM);
      const kahanErr = Math.abs(s.kahan - n * TERM);
      const singleErr = Math.abs(s.single - n * TERM);
      el("naive-read").textContent = sci(s.naive);
      el("kahan-read").textContent = sci(s.kahan);
      el("f32-read").textContent = sci(s.single);
      el("err-hud").textContent = "naive err " + sci(naiveErr);
      state.current = { naiveErr, kahanErr, singleErr };
    }

    const c = state.cancel;
    if (c) {
      const x = Math.pow(10, state.xExp);
      const naiveValue = Math.sqrt(x * x + 1) - x;
      const stable = 1 / (Math.sqrt(x * x + 1) + x);
      const rel = stable === 0 ? 0 : Math.abs(naiveValue - stable) / stable;
      el("cancel-read").textContent = rel === 0 ? "< 1e-16" : rel.toExponential(1);
      state.cancelCurrent = { x, naiveValue, stable, rel };
    }
    el("mode-hud").textContent = v === Math.fround(v) ? "exact in float32" : "needs float64";
  }

  function describe() {
    const v = state.value;
    const u32 = ulp(v, true);
    const u64 = ulp(v, false);
    const f32 = Math.fround(v);
    const lost = f32 === v;

    const n = currentTermCount();
    const errs = state.current || { naiveErr: 0, kahanErr: 0, singleErr: 0 };
    const digits = errs.naiveErr > 0 ? Math.max(0, Math.floor(-Math.log10(errs.naiveErr))) : 17;

    const cancel = state.cancelCurrent || { rel: 0, x: 1 };
    const cancelText =
      cancel.rel > 0.01
        ? `At x = 1e${state.xExp.toFixed(1)}, sqrt(x²+1) − x loses everything: the naive answer is ${sci(
            cancel.naiveValue
          )} against a true ${sci(cancel.stable)}.`
        : `At x = 1e${state.xExp.toFixed(1)} the cancellation is mild (relative error ${cancel.rel.toExponential(
            1
          )}).`;

    setStatus(
      `${sci(v)} ${lost ? "is exactly representable" : "is not exactly representable"} in float32: the nearest float32 is ${sciLong(
        f32
      )}, and the gap between neighbouring numbers there is ${sci(u32)} (float64: ${sci(u64)}). ` +
        `Adding ${TERM} ${n.toLocaleString("en-US")} times, the naive loop drifts by ${sci(
          errs.naiveErr
        )} (about ${digits} good digits), Kahan by ${sci(errs.kahanErr)}, and float32 by ${sci(
          errs.singleErr
        )}. ${cancelText}`,
      "good"
    );
  }

  /* --------------------------------------------------------------- charts */

  function chartFrame(box, title, xLabel, yLabel) {
    ctx.fillStyle = "rgba(9, 14, 18, 0.82)";
    ctx.fillRect(box.x, box.y, box.w, box.h);
    ctx.strokeStyle = "#1d2a33";
    ctx.lineWidth = 1;
    ctx.strokeRect(box.x + 0.5, box.y + 0.5, box.w - 1, box.h - 1);
    ctx.fillStyle = "#7e94a3";
    ctx.font = "10px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(title, box.x + 10, box.y - 8);
    ctx.fillStyle = "#55697a";
    ctx.textAlign = "right";
    ctx.fillText(xLabel, box.x + box.w - 10, box.y - 8);
    ctx.textAlign = "left";
    ctx.fillText(yLabel, box.x + 10, box.y + 14);
  }

  function drawSumChart() {
    chartFrame(SUM_BOX, "adding 0.1 a million times — absolute error", "terms (log)", "error");
    if (!(state.curve || state.sums)) return;
    const left = SUM_BOX.x + 44;
    const right = SUM_BOX.x + SUM_BOX.w - 12;
    const top = SUM_BOX.y + 24;
    const bottom = SUM_BOX.y + SUM_BOX.h - 28;
    const X = (n) => left + ((Math.log10(n) - 3) / 3) * (right - left);
    const Y = (e) => bottom - ((Math.log10(Math.max(1e-17, e)) + 17) / 18) * (bottom - top);

    // grid
    ctx.strokeStyle = "#16222b";
    ctx.fillStyle = "#4e6272";
    ctx.font = "9.5px ui-monospace, Menlo, monospace";
    for (let e = 3; e <= 6; e++) {
      const x = X(Math.pow(10, e));
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x, bottom);
      ctx.stroke();
      ctx.textAlign = "center";
      ctx.fillText("1e" + e, x, bottom + 12);
    }
    for (let e = -17; e <= 1; e += 6) {
      const y = Y(Math.pow(10, e));
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
      ctx.stroke();
      ctx.textAlign = "right";
      ctx.fillText("1e" + e, left - 6, y + 3);
    }

    const s = state.curve || state.sums;
    const line = (curve, colour, width) => {
      ctx.beginPath();
      curve.forEach((err, i) => {
        const x = X(s.xs[i]);
        const y = Y(err);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = colour;
      ctx.lineWidth = width;
      ctx.stroke();
    };
    line(s.singleCurve, "#8fb3ff", 1.4);
    line(s.naiveCurve, "#ffb45f", 1.8);
    line(s.kahanCurve, "#6ff0c8", 1.8);

    // current point marker
    const n = currentTermCount();
    const mx = X(n);
    ctx.strokeStyle = "rgba(234, 242, 247, 0.35)";
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.moveTo(mx, top);
    ctx.lineTo(mx, bottom);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#6ff0c8";
    ctx.font = "9.5px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("Kahan stays at machine epsilon", left + 8, bottom - 10);
  }

  function drawCancelChart() {
    chartFrame(CAN_BOX, "sqrt(x² + 1) − x — relative error", "x (log)", "rel. error");
    const c = state.cancel;
    if (!c) return;
    const left = CAN_BOX.x + 46;
    const right = CAN_BOX.x + CAN_BOX.w - 12;
    const top = CAN_BOX.y + 24;
    const bottom = CAN_BOX.y + CAN_BOX.h - 28;
    const X = (x) => left + ((Math.log10(x) - 2) / 7) * (right - left);
    const Y = (e) => bottom - ((Math.log10(Math.max(1e-18, e)) + 18) / 19) * (bottom - top);

    ctx.strokeStyle = "#16222b";
    ctx.fillStyle = "#4e6272";
    ctx.font = "9.5px ui-monospace, Menlo, monospace";
    for (let e = 2; e <= 9; e++) {
      const x = X(Math.pow(10, e));
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x, bottom);
      ctx.stroke();
      ctx.textAlign = "center";
      ctx.fillText("1e" + e, x, bottom + 12);
    }
    for (let e = -18; e <= 0; e += 6) {
      const y = Y(Math.pow(10, e));
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
      ctx.stroke();
      ctx.textAlign = "right";
      ctx.fillText("1e" + e, left - 6, y + 3);
    }

    ctx.beginPath();
    c.errs.forEach((err, i) => {
      const x = X(c.xs[i]);
      const y = Y(err);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = "#ffb45f";
    ctx.lineWidth = 1.8;
    ctx.stroke();

    const cx = X(Math.pow(10, state.xExp));
    ctx.strokeStyle = "rgba(234, 242, 247, 0.35)";
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.moveTo(cx, top);
    ctx.lineTo(cx, bottom);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#55697a";
    ctx.textAlign = "left";
    ctx.fillText("the +1 is rounded away, then x cancels x", left + 8, top + 14);
  }

  /* ---------------------------------------------------------------- strips */

  function drawBits(bits, x, y, cell, boxColour, label, exponentBits) {
    ctx.font = "10px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillStyle = "#7e94a3";
    ctx.fillText(label, x, y - 7);

    for (let i = 0; i < bits.length; i++) {
      const bit = bits[i];
      const isSign = i === 0;
      const isExp = i >= 1 && i <= exponentBits;
      const cx = x + i * cell;
      const colour = isSign ? "#ffcf7a" : isExp ? "#5c93c9" : boxColour;
      ctx.fillStyle = bit === "1" ? colour : "#14202a";
      ctx.fillRect(cx, y, cell - 1, 24);
      ctx.fillStyle = bit === "1" ? "#07100f" : "#3d5162";
      ctx.font = (cell > 14 ? "10px" : "7.5px") + " ui-monospace, Menlo, monospace";
      ctx.textAlign = "center";
      if (cell > 14 || bit === "1") ctx.fillText(bit, cx + (cell - 1) / 2, y + 16);
    }
    ctx.textAlign = "left";
  }

  function drawStrips() {
    const v = state.value;
    const b32 = bits32(v);
    const b64 = bits64(v);

    drawBits(b32, 42, 46, 23, "#6ff0c8", "float32 · 1 sign · 8 exponent · 23 mantissa", 8);
    drawBits(b64, 42, 104, 11.4, "#6ff0c8", "float64 · 1 sign · 11 exponent · 52 mantissa", 11);

    // ruler
    const y = 196;
    const left = 60;
    const right = 820;
    ctx.strokeStyle = "#243641";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
    ctx.stroke();

    const marks = [
      { v: nextDown(nextDown(v, true), true), tag: "−2u" },
      { v: nextDown(v, true), tag: "−u" },
      { v, tag: "v" },
      { v: nextUp(v, true), tag: "+u" },
      { v: nextUp(nextUp(v, true), true), tag: "+2u" },
    ];
    marks.forEach((mark, i) => {
      const x = left + ((right - left) * i) / (marks.length - 1);
      ctx.strokeStyle = mark.tag === "v" ? "#6ff0c8" : "#3a5566";
      ctx.beginPath();
      ctx.moveTo(x, y - 9);
      ctx.lineTo(x, y + 9);
      ctx.stroke();
      const align = i === 0 ? "left" : i === marks.length - 1 ? "right" : "center";
      ctx.fillStyle = mark.tag === "v" ? "#6ff0c8" : "#8ea3b3";
      ctx.font = "10px ui-monospace, Menlo, monospace";
      ctx.textAlign = align;
      ctx.fillText(mark.tag, x, y - 16);
      ctx.fillStyle = "#55697a";
      ctx.font = "9px ui-monospace, Menlo, monospace";
      ctx.fillText(rulerLabel(mark.v), x, y + 22);
    });

    ctx.fillStyle = "#7e94a3";
    ctx.textAlign = "left";
    ctx.font = "10px ui-monospace, Menlo, monospace";
    ctx.fillText(
      `float32 neighbours of ${sci(v)} · gap ${sci(ulp(v, true))} · float64 gap ${sci(ulp(v, false))}`,
      left,
      y + 44
    );
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#070c10";
    ctx.fillRect(0, 0, W, H);
    drawStrips();
    drawSumChart();
    drawCancelChart();

    ctx.fillStyle = "#6f8493";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(
      `value ${sci(state.value)} · ${currentTermCount().toLocaleString("en-US")} additions · x = 1e${state.xExp.toFixed(
        1
      )}`,
      26,
      H - 18
    );
    ctx.textAlign = "right";
    ctx.fillStyle = "#6ff0c8";
    ctx.fillText("IEEE-754, measured", W - 26, H - 18);
    ctx.textAlign = "left";
  }

  /* -------------------------------------------------------------- controls */

  function recompute() {
    state.sums = summation(currentTermCount());
    state.cancel = cancellation();
    if (!state.curve) state.curve = summation(1000000);
    updateReadouts();
    describe();
    draw();
  }

  function setValue(v, button) {
    state.value = v;
    ["tenth", "third", "pi", "big"].forEach((key) => {
      const node = el("preset-" + key);
      if (node) node.classList.toggle("active", key === button);
    });
    el("value-out").textContent = sci(v);
    updateReadouts();
    describe();
    draw();
  }

  el("value").addEventListener("input", (evt) => {
    setValue(Math.max(0.1, Math.min(4, Number(evt.target.value) || 0.1)), null);
  });
  el("terms").addEventListener("input", (evt) => {
    state.termsExp = Math.max(0, Math.min(60, Number(evt.target.value) || 0));
    recompute();
  });
  el("x").addEventListener("input", (evt) => {
    state.xExp = Math.max(2, Math.min(9, Number(evt.target.value) || 6));
    updateReadouts();
    describe();
    draw();
  });

  el("preset-tenth").addEventListener("click", () => setValue(0.1, "tenth"));
  el("preset-third").addEventListener("click", () => setValue(1 / 3, "third"));
  el("preset-pi").addEventListener("click", () => setValue(Math.PI, "pi"));
  el("preset-big").addEventListener("click", () => setValue(1e16, "big"));

  document.addEventListener("keydown", (evt) => {
    const map = { "1": ["tenth", 0.1], "2": ["third", 1 / 3], "3": ["pi", Math.PI], "4": ["big", 1e16] };
    const hit = map[evt.key];
    if (hit) setValue(hit[1], hit[0]);
  });

  window.__lab = {
    state,
    bits32,
    bits64,
    nextUp,
    nextDown,
    ulp,
    summation,
    cancellation,
    currentTermCount,
    sci,
    sciLong,
    rulerLabel,
    setValue,
    recompute,
    updateReadouts,
    describe,
    draw,
  };

  recompute();
})();
