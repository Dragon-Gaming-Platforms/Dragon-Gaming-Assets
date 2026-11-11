(() => {
  "use strict";

  // A small colour toolkit: HSL harmonies, WCAG 2.1 contrast maths and
  // Brettel-style dichromacy simulations. Everything is computed locally from
  // first principles, so the readouts are checkable by hand.

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");

  const W = canvas.width || 880;
  const H = canvas.height || 620;

  const PX = 26;
  const PY = 64;
  const PW = 410;
  const PH = 300;

  const QX = 452;
  const QY = 64;
  const QW = 402;
  const QH = 150;

  const MX = 26;
  const MY = 386;
  const MW = 410;
  const MH = 208;

  const CX = 452;
  const CY = 386;
  const CW = 402;
  const CH = 208;

  const HARMONIES = {
    complementary: { label: "complementary", offsets: [0, 180] },
    analogous: { label: "analogous", offsets: [-30, 0, 30] },
    triadic: { label: "triadic", offsets: [0, 120, 240] },
    tetradic: { label: "tetradic", offsets: [0, 90, 180, 270] },
    split: { label: "split complementary", offsets: [0, 150, 210] },
  };

  const CVD = {
    none: null,
    protan: [
      [0.567, 0.433, 0.0],
      [0.558, 0.442, 0.0],
      [0.0, 0.242, 0.758],
    ],
    deutan: [
      [0.625, 0.375, 0.0],
      [0.7, 0.3, 0.0],
      [0.0, 0.3, 0.7],
    ],
    tritan: [
      [0.95, 0.05, 0.0],
      [0.0, 0.433, 0.567],
      [0.0, 0.475, 0.525],
    ],
  };

  const CVD_LABEL = { none: "normal vision", protan: "protanopia", deutan: "deuteranopia", tritan: "tritanopia" };

  const state = {
    h: 210,
    s: 70,
    l: 55,
    harmony: "triadic",
    cvd: "none",
    fg: "#f4efe6",
    bg: "#0b0e14",
    frame: 0,
  };

  /* ---------------------------------------------------------- colour maths */

  function hexToRgb(hex) {
    let value = String(hex).trim().replace("#", "");
    if (value.length === 3) value = value.split("").map((c) => c + c).join("");
    if (!/^[0-9a-fA-F]{6}$/.test(value)) return { r: 0, g: 0, b: 0 };
    return {
      r: parseInt(value.slice(0, 2), 16),
      g: parseInt(value.slice(2, 4), 16),
      b: parseInt(value.slice(4, 6), 16),
    };
  }

  function rgbToHex(rgb) {
    const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
    return (
      "#" +
      [rgb.r, rgb.g, rgb.b]
        .map((v) => clamp(v).toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase()
    );
  }

  function channel(v) {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }

  function luminance(hex) {
    const { r, g, b } = hexToRgb(hex);
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  }

  function contrast(hexA, hexB) {
    const a = luminance(hexA);
    const b = luminance(hexB);
    const hi = Math.max(a, b);
    const lo = Math.min(a, b);
    return (hi + 0.05) / (lo + 0.05);
  }

  function hslToHex(h, s, l) {
    const hh = ((h % 360) + 360) % 360;
    const ss = Math.max(0, Math.min(100, s)) / 100;
    const ll = Math.max(0, Math.min(100, l)) / 100;
    const c = (1 - Math.abs(2 * ll - 1)) * ss;
    const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
    const m = ll - c / 2;
    let r = 0;
    let g = 0;
    let b = 0;
    if (hh < 60) [r, g, b] = [c, x, 0];
    else if (hh < 120) [r, g, b] = [x, c, 0];
    else if (hh < 180) [r, g, b] = [0, c, x];
    else if (hh < 240) [r, g, b] = [0, x, c];
    else if (hh < 300) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];
    return rgbToHex({ r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 });
  }

  function harmonyHues(h, mode) {
    const harmony = HARMONIES[mode] || HARMONIES.triadic;
    return harmony.offsets.map((offset) => (((h + offset) % 360) + 360) % 360);
  }

  function simulateCvd(hex, type) {
    const matrix = CVD[type];
    if (!matrix) return hex.toUpperCase();
    const { r, g, b } = hexToRgb(hex);
    const out = matrix.map((row) => row[0] * r + row[1] * g + row[2] * b);
    return rgbToHex({ r: out[0], g: out[1], b: out[2] });
  }

  function gradeOf(ratio) {
    return {
      normal: ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : "Fail",
      large: ratio >= 4.5 ? "AAA" : ratio >= 3 ? "AA" : "Fail",
    };
  }

  function palette() {
    return harmonyHues(state.h, state.harmony).map((hue) => hslToHex(hue, state.s, state.l));
  }

  /* ------------------------------------------------------------- readouts */

  function setStatus(text, kind) {
    const box = el("status");
    box.textContent = text;
    box.className = "status" + (kind ? " " + kind : "");
  }

  function refresh() {
    const ratio = contrast(state.fg, state.bg);
    const grade = gradeOf(ratio);
    const base = hslToHex(state.h, state.s, state.l);
    const lf = luminance(state.fg);
    const lb = luminance(state.bg);
    const hues = harmonyHues(state.h, state.harmony);

    el("ratio-read").textContent = ratio.toFixed(2);
    el("ratio-hud").textContent = ratio.toFixed(1) + " : 1";
    el("grade-read").textContent = grade.normal;
    el("grade-hud").textContent = grade.normal === "Fail" ? "fails AA" : grade.normal;
    el("fg-read").textContent = state.fg.toUpperCase();
    el("bg-read").textContent = state.bg.toUpperCase();
    el("luma-read").textContent = lf.toFixed(2) + " / " + lb.toFixed(2);
    el("base-read").textContent = base.toUpperCase();
    el("base-hud").textContent = base.toUpperCase();

    el("fg").value = state.fg;
    el("bg").value = state.bg;

    if (ratio >= 7) {
      setStatus(
        `${ratio.toFixed(1)} : 1 — AAA for body text. This pair survives small sizes, thin fonts and tired eyes.`,
        "good"
      );
    } else if (ratio >= 4.5) {
      setStatus(`${ratio.toFixed(1)} : 1 — AA for body text, and AAA only for large headings.`, "good");
    } else if (ratio >= 3) {
      setStatus(`${ratio.toFixed(1)} : 1 — large text only. Fine for a 24px heading, too weak for a paragraph.`, "warn");
    } else {
      setStatus(`${ratio.toFixed(1)} : 1 — fails every WCAG text level. Use it for decoration, not words.`, "warn");
    }

    // Warn when two palette entries collapse under the chosen simulation.
    const sims = palette().map((c) => simulateCvd(c, state.cvd));
    let closest = Infinity;
    for (let i = 0; i < sims.length; i++) {
      for (let j = i + 1; j < sims.length; j++) {
        const a = hexToRgb(sims[i]);
        const b = hexToRgb(sims[j]);
        closest = Math.min(closest, Math.hypot(a.r - b.r, a.g - b.g, a.b - b.b));
      }
    }
    const fgSim = hexToRgb(simulateCvd(state.fg, state.cvd));
    const bgSim = hexToRgb(simulateCvd(state.bg, state.cvd));
    const pairDistance = Math.hypot(fgSim.r - bgSim.r, fgSim.g - bgSim.g, fgSim.b - bgSim.b);
    if (state.cvd !== "none" && (closest < 60 || pairDistance < 60)) {
      setStatus(
        `${ratio.toFixed(1)} : 1 for text, but under ${CVD_LABEL[state.cvd]} ${
          pairDistance < 60 ? "the text and background" : "two palette swatches"
        } converge. Do not rely on hue alone here.`,
        "warn"
      );
    }
    return { ratio, grade, hues, base };
  }

  /* -------------------------------------------------------------- drawing */

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#0b0d12";
    ctx.fillRect(0, 0, W, H);

    drawPreview();
    drawPalette();
    drawMeter();
    drawCvd();

    ctx.fillStyle = "#6f7686";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("WCAG 2.1 relative luminance · sRGB", PX, H - 14);
    ctx.textAlign = "right";
    ctx.fillText("click swatch = text · shift-click = background", W - 26, H - 14);
    ctx.textAlign = "left";
  }

  function drawPreview() {
    ctx.fillStyle = state.bg;
    ctx.fillRect(PX, PY, PW, PH);
    ctx.strokeStyle = "rgba(255,255,255,0.10)";
    ctx.lineWidth = 1;
    ctx.strokeRect(PX + 0.5, PY + 0.5, PW - 1, PH - 1);

    ctx.save();
    ctx.beginPath();
    ctx.rect(PX, PY, PW, PH);
    ctx.clip();

    ctx.fillStyle = state.fg;
    ctx.textAlign = "left";
    ctx.font = "700 88px 'Inter', system-ui, sans-serif";
    ctx.fillText("Aa", PX + 26, PY + 116);

    ctx.font = "600 21px 'Inter', system-ui, sans-serif";
    ctx.fillText("Contrast is a promise.", PX + 28, PY + 164);

    ctx.globalAlpha = 0.92;
    ctx.font = "13px 'Inter', system-ui, sans-serif";
    ctx.fillText("Body text has to hold up at 13 pixels,", PX + 28, PY + 194);
    ctx.fillText("on a phone, in daylight, at arm's length.", PX + 28, PY + 214);
    ctx.globalAlpha = 0.62;
    ctx.font = "11px 'Inter', system-ui, sans-serif";
    ctx.fillText("Small print still has to survive.", PX + 28, PY + 252);
    ctx.globalAlpha = 1;

    ctx.fillStyle = state.fg;
    ctx.globalAlpha = 0.5;
    ctx.font = "10px ui-monospace, Menlo, monospace";
    ctx.textAlign = "right";
    ctx.fillText("live preview", PX + PW - 14, PY + 20);
    ctx.globalAlpha = 1;
    ctx.restore();
    ctx.textAlign = "left";
  }

  function drawPalette() {
    const swatches = palette();
    const harmony = HARMONIES[state.harmony];

    ctx.fillStyle = "#0f1119";
    ctx.fillRect(QX, QY, QW, 176);
    ctx.strokeStyle = "#262a36";
    ctx.strokeRect(QX + 0.5, QY + 0.5, QW - 1, 175);

    ctx.fillStyle = "#8d94a4";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(`palette · ${harmony.label} · base hue ${Math.round(state.h)}°`, QX + 14, QY + 20);

    const gap = 10;
    const width = (QW - 28 - gap * (swatches.length - 1)) / swatches.length;
    const height = 92;

    swatches.forEach((hex, i) => {
      const x = QX + 14 + i * (width + gap);
      const y = QY + 34;
      ctx.fillStyle = hex;
      ctx.fillRect(x, y, width, height);

      const isFg = hex.toUpperCase() === state.fg.toUpperCase();
      const isBg = hex.toUpperCase() === state.bg.toUpperCase();
      ctx.lineWidth = isFg ? 3 : 1;
      ctx.strokeStyle = isFg ? "#ffffff" : "rgba(255,255,255,0.16)";
      ctx.strokeRect(x + 1.5, y + 1.5, width - 3, height - 3);
      if (isBg) {
        ctx.setLineDash([4, 3]);
        ctx.strokeStyle = "#ffd166";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x + 5.5, y + 5.5, width - 11, height - 11);
        ctx.setLineDash([]);
      }

      ctx.fillStyle = "#8d94a4";
      ctx.font = "10.5px ui-monospace, Menlo, monospace";
      ctx.fillText(hex.toUpperCase(), x, y + height + 16);

      const against = contrast(hex, state.bg);
      const tag = isFg ? "TEXT" : isBg ? "BG" : against >= 4.5 ? "AA" : against >= 3 ? "AA·L" : "low";
      ctx.fillStyle = isFg ? "#ffffff" : isBg ? "#ffd166" : against >= 4.5 ? "#7df0b9" : against >= 3 ? "#ffd166" : "#ff8fa3";
      ctx.fillText(tag + " " + against.toFixed(1) + ":1", x, y + height + 32);
    });

    ctx.fillStyle = "#5d6675";
    ctx.font = "10px 'Inter', system-ui, sans-serif";
    ctx.fillText("each swatch is scored as text against the current background", QX + 14, QY + 170);
  }

  function drawMeter() {
    const ratio = contrast(state.fg, state.bg);
    const grade = gradeOf(ratio);

    ctx.fillStyle = "#0f1119";
    ctx.fillRect(MX, MY, MW, MH);
    ctx.strokeStyle = "#262a36";
    ctx.strokeRect(MX + 0.5, MY + 0.5, MW - 1, MH - 1);

    ctx.fillStyle = "#8d94a4";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("contrast ratio", MX + 18, MY + 24);

    ctx.fillStyle = "#ffd166";
    ctx.font = "700 46px 'Inter', system-ui, sans-serif";
    ctx.fillText(ratio.toFixed(2), MX + 18, MY + 76);
    const numberWidth = ctx.measureText ? ctx.measureText(ratio.toFixed(2)).width : 90;
    ctx.fillStyle = "#7c8494";
    ctx.font = "16px ui-monospace, Menlo, monospace";
    ctx.fillText(": 1", MX + 22 + numberWidth, MY + 76);

    const rows = [
      { label: "normal text", need: "AA 4.5 · AAA 7", value: grade.normal },
      { label: "large text", need: "AA 3 · AAA 4.5", value: grade.large },
    ];
    rows.forEach((row, i) => {
      const y = MY + 104 + i * 30;
      ctx.fillStyle = "#9aa1b1";
      ctx.font = "11.5px 'Inter', system-ui, sans-serif";
      ctx.fillText(row.label, MX + 18, y);
      ctx.fillStyle = "#616a7a";
      ctx.fillText(row.need, MX + 104, y);
      const pass = row.value !== "Fail";
      ctx.fillStyle = pass ? "rgba(91, 224, 161, 0.16)" : "rgba(255, 107, 134, 0.16)";
      ctx.fillRect(MX + MW - 92, y - 14, 74, 21);
      ctx.strokeStyle = pass ? "#3f8f70" : "#8a3548";
      ctx.strokeRect(MX + MW - 91.5, y - 13.5, 73, 20);
      ctx.fillStyle = pass ? "#7df0b9" : "#ff8fa3";
      ctx.font = "600 11px ui-monospace, Menlo, monospace";
      ctx.textAlign = "center";
      ctx.fillText(row.value.toUpperCase(), MX + MW - 55, y + 1);
      ctx.textAlign = "left";
    });

    // Luminance bars.
    const bars = [
      { label: "text", hex: state.fg, value: luminance(state.fg) },
      { label: "bg", hex: state.bg, value: luminance(state.bg) },
    ];
    bars.forEach((bar, i) => {
      const y = MY + 166 + i * 20;
      ctx.fillStyle = "#6f7888";
      ctx.font = "10px ui-monospace, Menlo, monospace";
      ctx.fillText(bar.label, MX + 18, y + 3);
      ctx.fillStyle = "#1a1e28";
      ctx.fillRect(MX + 50, y - 6, MW - 140, 10);
      ctx.fillStyle = bar.hex;
      ctx.fillRect(MX + 50, y - 6, Math.max(2, (MW - 140) * bar.value), 10);
      ctx.fillStyle = "#8d94a4";
      ctx.fillText(bar.value.toFixed(3), MX + MW - 78, y + 3);
    });
  }

  function drawCvd() {
    const swatches = palette().map((hex) => simulateCvd(hex, state.cvd));
    ctx.fillStyle = "#0f1119";
    ctx.fillRect(CX, CY, CW, CH);
    ctx.strokeStyle = "#262a36";
    ctx.strokeRect(CX + 0.5, CY + 0.5, CW - 1, CH - 1);

    ctx.fillStyle = "#8d94a4";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("simulated colour vision · " + CVD_LABEL[state.cvd], CX + 18, CY + 24);

    const gap = 10;
    const width = (CW - 36 - gap * (swatches.length - 1)) / swatches.length;
    swatches.forEach((hex, i) => {
      const x = CX + 18 + i * (width + gap);
      const y = CY + 38;
      ctx.fillStyle = hex;
      ctx.fillRect(x, y, width, 92);
      ctx.strokeStyle = "rgba(255,255,255,0.14)";
      ctx.strokeRect(x + 0.5, y + 0.5, width - 1, 91);
      ctx.fillStyle = "#8d94a4";
      ctx.font = "10px ui-monospace, Menlo, monospace";
      ctx.fillText(hex.toUpperCase(), x, y + 108);
    });

    ctx.fillStyle = "#666f7f";
    ctx.font = "10.5px 'Inter', system-ui, sans-serif";
    ctx.fillText("Approximate dichromacy matrices — a check, not a diagnosis.", CX + 18, CY + CH - 16);
  }

  /* ---------------------------------------------------------------- input */

  function setFg(hex) {
    state.fg = hex.toUpperCase();
    refresh();
  }

  function setBg(hex) {
    state.bg = hex.toUpperCase();
    refresh();
  }

  function setHarmony(mode) {
    state.harmony = mode;
    ["comp", "analog", "triad", "tetrad", "split"].forEach((id) => el(id).classList.remove("active"));
    const map = { complementary: "comp", analogous: "analog", triadic: "triad", tetradic: "tetrad", split: "split" };
    el(map[mode]).classList.add("active");
    refresh();
  }

  function setCvd(mode) {
    state.cvd = mode;
    ["none", "protan", "deutan", "tritan"].forEach((id) => el("cvd-" + id).classList.remove("active"));
    el("cvd-" + mode).classList.add("active");
    refresh();
  }

  function syncSliders() {
    el("hue").value = String(state.h);
    el("sat").value = String(state.s);
    el("light").value = String(state.l);
    el("hue-out").textContent = Math.round(state.h) + "°";
    el("sat-out").textContent = Math.round(state.s) + "%";
    el("light-out").textContent = Math.round(state.l) + "%";
  }

  el("hue").addEventListener("input", (evt) => {
    state.h = Number(evt.target.value) || 0;
    syncSliders();
    state.fg = hslToHex(state.h, state.s, state.l);
    refresh();
  });
  el("sat").addEventListener("input", (evt) => {
    state.s = Number(evt.target.value) || 0;
    syncSliders();
    state.fg = hslToHex(state.h, state.s, state.l);
    refresh();
  });
  el("light").addEventListener("input", (evt) => {
    state.l = Number(evt.target.value) || 0;
    syncSliders();
    state.fg = hslToHex(state.h, state.s, state.l);
    refresh();
  });

  el("comp").addEventListener("click", () => setHarmony("complementary"));
  el("analog").addEventListener("click", () => setHarmony("analogous"));
  el("triad").addEventListener("click", () => setHarmony("triadic"));
  el("tetrad").addEventListener("click", () => setHarmony("tetradic"));
  el("split").addEventListener("click", () => setHarmony("split"));

  el("cvd-none").addEventListener("click", () => setCvd("none"));
  el("cvd-protan").addEventListener("click", () => setCvd("protan"));
  el("cvd-deutan").addEventListener("click", () => setCvd("deutan"));
  el("cvd-tritan").addEventListener("click", () => setCvd("tritan"));

  el("fg").addEventListener("input", (evt) => setFg(evt.target.value));
  el("bg").addEventListener("input", (evt) => setBg(evt.target.value));

  el("swap").addEventListener("click", () => {
    const old = state.fg;
    state.fg = state.bg;
    state.bg = old;
    refresh();
  });

  function randomize() {
    state.h = Math.floor(Math.random() * 360);
    state.s = 55 + Math.floor(Math.random() * 40);
    state.l = 45 + Math.floor(Math.random() * 25);
    syncSliders();
    state.bg = hslToHex((state.h + 200) % 360, 28, 8);
    state.fg = hslToHex(state.h, state.s, state.l);
    refresh();
  }

  el("random").addEventListener("click", randomize);

  function theme(name) {
    if (name === "night") {
      state.h = 210;
      state.s = 65;
      state.l = 60;
      state.bg = "#070910";
      state.fg = "#f2ede2";
    } else if (name === "paper") {
      state.h = 32;
      state.s = 42;
      state.l = 34;
      state.bg = "#fbf6ec";
      state.fg = "#1d1a16";
    } else {
      state.h = 18;
      state.s = 82;
      state.l = 62;
      state.bg = "#1a0f18";
      state.fg = "#ffd0a1";
    }
    syncSliders();
    refresh();
  }

  el("night").addEventListener("click", () => theme("night"));
  el("paper").addEventListener("click", () => theme("paper"));
  el("sunset").addEventListener("click", () => theme("sunset"));

  canvas.addEventListener("click", (evt) => {
    const rect = canvas.getBoundingClientRect ? canvas.getBoundingClientRect() : { left: 0, top: 0, width: W, height: H };
    const sx = (evt.clientX - rect.left) * (W / (rect.width || W));
    const sy = (evt.clientY - rect.top) * (H / (rect.height || H));
    if (sx < QX || sy < QY + 34 || sy > QY + 152) return;
    const swatches = palette();
    const gap = 10;
    const width = (QW - 28 - gap * (swatches.length - 1)) / swatches.length;
    for (let i = 0; i < swatches.length; i++) {
      const x = QX + 14 + i * (width + gap);
      if (sx >= x && sx <= x + width) {
        if (evt.shiftKey) setBg(swatches[i]);
        else setFg(swatches[i]);
        return;
      }
    }
  });

  document.addEventListener("keydown", (evt) => {
    const key = evt.key;
    const map = { "1": "complementary", "2": "analogous", "3": "triadic", "4": "tetradic", "5": "split" };
    if (map[key]) setHarmony(map[key]);
    else if (key === "s" || key === "S") {
      const old = state.fg;
      state.fg = state.bg;
      state.bg = old;
      refresh();
    } else if (key === "r" || key === "R") {
      randomize();
    }
  });

  /* ------------------------------------------------------------- main loop */

  function loop() {
    state.frame++;
    draw();
    requestAnimationFrame(loop);
  }

  window.__lab = {
    state,
    hexToRgb,
    rgbToHex,
    luminance,
    contrast,
    hslToHex,
    harmonyHues,
    simulateCvd,
    gradeOf,
    palette,
    setFg,
    setBg,
    setHarmony,
    setCvd,
    theme,
    refresh,
  };

  syncSliders();
  refresh();
  draw();
  requestAnimationFrame(loop);
})();
