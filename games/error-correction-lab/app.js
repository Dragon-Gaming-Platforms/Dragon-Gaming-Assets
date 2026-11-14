(() => {
  "use strict";

  // Extended Hamming (8,4): four data bits, three Hamming parity bits at
  // positions 1, 2 and 4, plus one overall parity bit at position 8.
  //
  // The decoder is the plain textbook one: compute the three check bits, XOR
  // them into a syndrome, and read the syndrome as a bit position. The extra
  // parity bit is what turns "correct one, detect two" into a safe rule.
  //
  // Everything on the right-hand charts is counted: the bar chart enumerates all
  // 256 possible error patterns exactly, and the dots come from a 20,000-block
  // Monte Carlo pass over the same channel.

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");

  const W = canvas.width || 880;
  const H = canvas.height || 660;

  const CODE = { x: 26, y: 54, w: 470, h: 186 };
  const SYND = { x: 512, y: 54, w: 342, h: 186 };
  const BARS = { x: 26, y: 262, w: 470, h: 352 };
  const CURVE = { x: 512, y: 262, w: 342, h: 352 };

  const N = 8;
  const DATA_POS = [3, 5, 6, 7]; // 1-based positions holding data
  const PARITY_POS = [1, 2, 4, 8];
  const POS_LABEL = ["", "p1", "p2", "d1", "p4", "d2", "d3", "d4", "p0"];

  const state = {
    // How many distinct bits the Flip button corrupts at once. One is the
    // correctable case, two is the detected case, three starts to be dangerous.
    errorCount: 1,
    data: [1, 0, 1, 1],
    flips: new Array(N).fill(false),
    p: 0.05,
    exact: null,
    monte: null,
    statusKind: "",
  };

  /* --------------------------------------------------------------- coding */

  // bits are 1-indexed like the textbook: word[1..8]
  function encode(data) {
    const word = new Array(N + 1).fill(0);
    DATA_POS.forEach((pos, i) => {
      word[pos] = data[i] ? 1 : 0;
    });
    word[1] = word[3] ^ word[5] ^ word[7];
    word[2] = word[3] ^ word[6] ^ word[7];
    word[4] = word[5] ^ word[6] ^ word[7];
    word[8] = word[1] ^ word[2] ^ word[3] ^ word[4] ^ word[5] ^ word[6] ^ word[7];
    return word.slice(1);
  }

  function syndrome(word) {
    // word is 1-indexed. Each check bit XORs the positions whose index contains
    // its own bit, so a single flipped bit at position i yields syndrome i.
    const s1 = word[1] ^ word[3] ^ word[5] ^ word[7];
    const s2 = word[2] ^ word[3] ^ word[6] ^ word[7];
    const s4 = word[4] ^ word[5] ^ word[6] ^ word[7];
    const overall =
      (word[1] ^ word[2] ^ word[3] ^ word[4] ^ word[5] ^ word[6] ^ word[7] ^ word[8]) & 1;
    return { s: s1 | (s2 << 1) | (s4 << 2), overall, checks: [s1, s2, s4] };
  }

  function decode(word) {
    // returns { corrected: 1-indexed array, status, pos }
    // status: "clean" | "corrected" | "detected" | "silent"
    const copy = word.slice();
    const { s, overall } = syndrome(copy);
    if (s === 0 && overall === 0) return { word: copy, status: "clean", pos: 0, s, overall };
    if (s !== 0 && overall === 1) {
      copy[s] ^= 1; // correct the indicated position
      return { word: copy, status: "corrected", pos: s, s, overall };
    }
    if (s === 0 && overall === 1) {
      copy[8] ^= 1; // the extra parity bit itself
      return { word: copy, status: "corrected", pos: 8, s, overall };
    }
    // s !== 0 && overall === 0 → two errors: detected, not correctable
    return { word: copy, status: "detected", pos: 0, s, overall };
  }

  const currentWord = () => encode(state.data);

  function receivedWord() {
    const word = currentWord();
    return word.map((bit, i) => (state.flips[i] ? bit ^ 1 : bit));
  }

  function dataOf(word) {
    return DATA_POS.map((pos) => word[pos - 1]);
  }

  function sameData(a, b) {
    return DATA_POS.every((pos, i) => a[pos - 1] === b[i]);
  }

  /* ------------------------------------------------------------ statistics */

  function bitWeight(mask) {
    let k = 0;
    for (let i = 0; i < N; i++) if (mask & (1 << i)) k++;
    return k;
  }

  function outcomeForMask(mask) {
    const word = currentWord().slice();
    const rx = word.map((bit, i) => ((mask >> i) & 1 ? bit ^ 1 : bit));
    const dec = decode([0].concat(rx)); // 1-indexed
    if (dec.status === "clean") return "clean";
    if (dec.status === "detected") return "detected";
    // corrected — but did it actually recover the original data?
    const recovered = dataOf(dec.word.slice(1));
    return sameData(dec.word.slice(1), state.data) ? "corrected" : "silent";
  }

  function exactStats(p) {
    const counts = { clean: 0, corrected: 0, detected: 0, silent: 0 };
    for (let mask = 0; mask < 256; mask++) {
      const k = bitWeight(mask);
      const prob = Math.pow(p, k) * Math.pow(1 - p, N - k);
      counts[outcomeForMask(mask)] += prob;
    }
    return counts;
  }

  function seeded(seed) {
    let s = (seed >>> 0) || 1;
    return () => {
      s ^= s << 13;
      s >>>= 0;
      s ^= s >>> 17;
      s ^= s << 5;
      s >>>= 0;
      return s / 4294967296;
    };
  }

  function monteCarlo(p, blocks) {
    const rand = seeded(0xc0ffee ^ Math.round(p * 100000));
    const counts = { clean: 0, corrected: 0, detected: 0, silent: 0 };
    const base = currentWord();
    for (let b = 0; b < blocks; b++) {
      const rx = base.map((bit) => (rand() < p ? bit ^ 1 : bit));
      const dec = decode([0].concat(rx));
      if (dec.status === "clean") counts.clean++;
      else if (dec.status === "detected") counts.detected++;
      else if (sameData(dec.word.slice(1), state.data)) counts.corrected++;
      else counts.silent++;
    }
    Object.keys(counts).forEach((k) => (counts[k] /= blocks));
    return counts;
  }

  function recompute() {
    state.exact = exactStats(state.p);
    state.monte = monteCarlo(state.p, 20000);
    updateReadouts();
    describe();
    draw();
  }

  /* -------------------------------------------------------------- readouts */

  const bits = (list) => list.join("");

  function setStatus(text, kind) {
    const box = el("status");
    box.textContent = text;
    box.className = "status" + (kind ? " " + kind : "");
    state.statusKind = kind || "";
  }

  function updateReadouts() {
    const word = currentWord();
    const rx = receivedWord();
    const dec = decode([0].concat(rx));
    const errors = state.flips.filter(Boolean).length;
    const recovered = sameData(dec.word.slice(1), state.data);

    el("p-out").textContent = state.p.toFixed(3);
    el("errors-out").textContent = String(state.errorCount);
    el("data-read").textContent = bits(state.data);
    el("code-read").textContent = bits(word);
    el("rx-read").textContent = bits(rx);
    el("syn-read").textContent = errors === 0 ? "000" : dec.s.toString(2).padStart(3, "0");
    el("verdict-read").textContent =
      dec.status === "clean" ? "clean" : dec.status === "corrected" ? "fixed bit " + dec.pos : "detected";
    el("silent-read").textContent = state.exact ? (100 * state.exact.silent).toFixed(3) + "%" : "—";
    el("rate-hud").textContent = "rate 1/2";
    el("dist-hud").textContent = "distance 4";
    el("correct-hud").textContent = recovered ? "data intact" : "data corrupted";
  }

  function describe() {
    const errors = state.flips.filter(Boolean).length;
    const word = currentWord();
    const rx = receivedWord();
    const dec = decode([0].concat(rx));
    const exact = state.exact || { silent: 0 };

    if (errors === 0) {
      setStatus(
        `A clean channel: all eight received bits match the codeword, so the syndrome is 000 and the parity bit agrees. ` +
          `At p = ${state.p.toFixed(3)} a block this clean happens ${(100 * exact.clean).toFixed(
            1
          )}% of the time, and the decoder never has to guess.`,
        "good"
      );
      return;
    }

    if (dec.status === "corrected") {
      setStatus(
        `${errors} bit${errors > 1 ? "s" : ""} flipped. The check bits point at position ${dec.pos}, the decoder flips it back, and the data word ${bits(
          state.data
        )} comes out unchanged — that is the "correct one" half of the guarantee, and it is what happens ${(
          100 * (state.exact ? state.exact.corrected : 0)
        ).toFixed(1)}% of the time at this error rate.`,
        "good"
      );
      return;
    }

    if (dec.status === "detected") {
      setStatus(
        `Two bits are wrong. The syndrome is non-zero but the overall parity agrees, which is the signature of a double error: the decoder refuses to guess and reports an uncorrectable block. ` +
          `That is ${(100 * (state.exact ? state.exact.detected : 0)).toFixed(1)}% of blocks at p = ${state.p.toFixed(3)}.`,
        "warn"
      );
      return;
    }

    setStatus(
      `Three or more bits are wrong in a way that mimics a single error, so the decoder "corrects" the wrong position and silently returns bad data. ` +
        `This is the failure mode that matters: ${(100 * exact.silent).toFixed(3)}% of blocks at p = ${state.p.toFixed(3)}, and no amount of Hamming logic removes it — only a stronger code or a retransmission does.`,
      "warn"
    );
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

  function drawCodewords() {
    panel(CODE, "codeword", "click a transmitted bit to flip it");
    const word = currentWord();
    const rx = receivedWord();
    const cellW = 50;
    const gap = 4;
    const left = CODE.x + 22;

    const rows = [
      { label: "data", values: state.data, y: CODE.y + 26, positions: DATA_POS, interactive: true },
      { label: "parity", values: [word[0], word[1], word[3], word[7]], y: CODE.y + 74, positions: PARITY_POS },
      { label: "transmit", values: rx, y: CODE.y + 122, positions: [1, 2, 3, 4, 5, 6, 7, 8], interactive: true },
    ];

    rows.forEach((row) => {
      ctx.fillStyle = "#6f8493";
      ctx.font = "9.5px ui-monospace, Menlo, monospace";
      ctx.textAlign = "right";
      ctx.fillText(row.label, left - 10, row.y + 20);

      row.values.forEach((bit, i) => {
        const x = left + i * (cellW + gap);
        const isParity = PARITY_POS.includes(row.positions[i]);
        const inError =
          row.label === "transmit"
            ? state.flips[i]
            : row.label === "parity"
            ? state.flips[PARITY_POS[i] - 1]
            : false;
        const dim = row.label === "data" ? false : false;

        ctx.fillStyle = inError ? "#3a1414" : isParity ? "#16222e" : "#0f1d1c";
        ctx.fillRect(x, row.y, cellW, 30);
        ctx.strokeStyle = inError ? "#ff7b7b" : isParity ? "#3c6a92" : "#2f8d7b";
        ctx.lineWidth = inError ? 1.6 : 1;
        ctx.strokeRect(x + 0.5, row.y + 0.5, cellW - 1, 29);
        ctx.lineWidth = 1;

        ctx.fillStyle = inError ? "#ffd9d9" : "#eaf2f7";
        ctx.font = "600 15px ui-monospace, Menlo, monospace";
        ctx.textAlign = "center";
        ctx.fillText(String(bit), x + cellW / 2, row.y + 20);

        ctx.fillStyle = isParity ? "#5c93c9" : "#3f7f73";
        ctx.font = "8.5px ui-monospace, Menlo, monospace";
        ctx.fillText(POS_LABEL[row.positions[i]], x + cellW / 2, row.y + 38);
        void dim;
      });
    });

    // parity groups under the data row
    const gx = left;
    const gy = CODE.y + 180;
    ctx.font = "9px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillStyle = "#55697a";
    ctx.fillText("p1 covers d1 d2 d4 · p2 covers d1 d3 d4 · p4 covers d2 d3 d4 · p0 covers all", gx, gy);
  }

  function drawSyndrome() {
    panel(SYND, "decoder", "check bits only");
    const rx = receivedWord();
    const dec = decode([0].concat(rx));
    const sBits = dec.s.toString(2).padStart(3, "0");

    const labels = ["s1", "s2", "s4"];
    labels.forEach((label, i) => {
      const x = SYND.x + 22 + i * 62;
      const y = SYND.y + 24;
      ctx.fillStyle = "#101b22";
      ctx.fillRect(x, y, 48, 40);
      ctx.strokeStyle = sBits[2 - i] === "1" ? "#8fb3ff" : "#1f303a";
      ctx.strokeRect(x + 0.5, y + 0.5, 47, 39);
      ctx.fillStyle = sBits[2 - i] === "1" ? "#cfe0ff" : "#4e6272";
      ctx.font = "600 18px ui-monospace, Menlo, monospace";
      ctx.textAlign = "center";
      ctx.fillText(sBits[2 - i], x + 24, y + 26);
      ctx.fillStyle = "#55697a";
      ctx.font = "9px ui-monospace, Menlo, monospace";
      ctx.fillText(label, x + 24, y + 54);
    });

    // overall parity
    ctx.fillStyle = "#101b22";
    ctx.fillRect(SYND.x + 220, SYND.y + 24, 48, 40);
    ctx.strokeStyle = dec.overall ? "#ffb45f" : "#1f303a";
    ctx.strokeRect(SYND.x + 220.5, SYND.y + 24.5, 47, 39);
    ctx.fillStyle = dec.overall ? "#ffd9a8" : "#4e6272";
    ctx.font = "600 18px ui-monospace, Menlo, monospace";
    ctx.textAlign = "center";
    ctx.fillText(String(dec.overall), SYND.x + 244, SYND.y + 50);
    ctx.fillStyle = "#55697a";
    ctx.font = "9px ui-monospace, Menlo, monospace";
    ctx.fillText("p0", SYND.x + 244, SYND.y + 78);

    // verdict
    const verdict =
      dec.status === "clean"
        ? "clean block"
        : dec.status === "corrected"
        ? "correct bit " + dec.pos
        : "double error — reject";
    ctx.fillStyle =
      dec.status === "clean" ? "#6ff0c8" : dec.status === "corrected" ? "#9fe6ff" : "#ff9f6e";
    ctx.font = "600 13px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(verdict, SYND.x + 14, SYND.y + 100);

    ctx.fillStyle = "#6f8493";
    ctx.font = "9.5px ui-monospace, Menlo, monospace";
    const lines = [
      `syndrome ${dec.s === 0 ? "000" : dec.s.toString(2).padStart(3, "0")} → position ${dec.s || "—"}`,
      "s≠0 with p0 odd → one error",
      "s≠0 with p0 even → two errors",
      "s=0 with p0 odd → parity bit itself",
    ];
    lines.forEach((line, i) => ctx.fillText(line, SYND.x + 14, SYND.y + 122 + i * 15));
  }

  function drawBars() {
    panel(BARS, "outcomes per block", "bars exact · dots Monte Carlo");
    const exact = state.exact;
    const monte = state.monte;
    if (!exact) return;
    const rows = [
      ["clean", exact.clean, monte.clean, "#6ff0c8"],
      ["corrected", exact.corrected, monte.corrected, "#8fb3ff"],
      ["detected, rejected", exact.detected, monte.detected, "#ffb45f"],
      ["silent failure", exact.silent, monte.silent, "#ff7b7b"],
    ];
    const left = BARS.x + 118;
    const right = BARS.x + BARS.w - 56;
    const span = right - left;
    rows.forEach((row, i) => {
      const y = BARS.y + 30 + i * 62;
      const w = Math.max(row[1] > 0 ? 2 : 0, row[1] * span);
      ctx.fillStyle = "rgba(255,255,255,0.045)";
      ctx.fillRect(left, y, span, 26);
      ctx.fillStyle = row[3];
      ctx.globalAlpha = 0.75;
      ctx.fillRect(left, y, w, 26);
      ctx.globalAlpha = 1;

      // Monte Carlo dot
      const mx = left + row[2] * span;
      ctx.fillStyle = "#eaf2f7";
      ctx.beginPath();
      ctx.arc(mx, y + 13, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#9db0be";
      ctx.font = "10px ui-monospace, Menlo, monospace";
      ctx.textAlign = "right";
      ctx.fillText(row[0], left - 8, y + 18);
      ctx.fillStyle = "#eaf2f7";
      ctx.textAlign = "left";
      ctx.fillText((100 * row[1]).toFixed(3) + "%", right + 6, y + 18);
    });

    ctx.fillStyle = "#55697a";
    ctx.font = "9.5px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(
      "exact enumeration of all 256 error patterns vs 20,000 simulated blocks",
      BARS.x + 12,
      BARS.y + BARS.h - 22
    );
    ctx.fillText(
      `channel p = ${state.p.toFixed(3)} · expected wrong bits per block ${(8 * state.p).toFixed(2)}`,
      BARS.x + 12,
      BARS.y + BARS.h - 8
    );
  }

  function drawCurve() {
    panel(CURVE, "silent failures vs channel", "exact, per block");
    const left = CURVE.x + 46;
    const right = CURVE.x + CURVE.w - 16;
    const top = CURVE.y + 20;
    const bottom = CURVE.y + CURVE.h - 34;
    const Y = (v) => bottom - ((Math.log10(Math.max(1e-9, v)) + 9) / 9) * (bottom - top);
    const X = (p) => left + ((p - 0.005) / 0.195) * (right - left);

    ctx.strokeStyle = "#16222b";
    ctx.fillStyle = "#4e6272";
    ctx.font = "9px ui-monospace, Menlo, monospace";
    for (let e = -9; e <= 0; e += 3) {
      const y = Y(Math.pow(10, e));
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
      ctx.stroke();
      ctx.textAlign = "right";
      ctx.fillText("1e" + e, left - 6, y + 3);
    }
    for (let p = 0.05; p <= 0.2; p += 0.05) {
      const x = X(p);
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x, bottom);
      ctx.stroke();
      ctx.textAlign = "center";
      ctx.fillText(p.toFixed(2), x, bottom + 12);
    }

    ctx.beginPath();
    for (let i = 0; i <= 60; i++) {
      const p = 0.005 + (0.195 * i) / 60;
      const stat = exactStats(p).silent;
      const x = X(p);
      const y = Y(stat);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "#ff7b7b";
    ctx.lineWidth = 1.8;
    ctx.stroke();

    const cx = X(state.p);
    ctx.strokeStyle = "rgba(234,242,247,0.35)";
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.moveTo(cx, top);
    ctx.lineTo(cx, bottom);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#55697a";
    ctx.textAlign = "left";
    ctx.font = "9.5px ui-monospace, Menlo, monospace";
    ctx.fillText("each extra uncaught bit makes", left + 4, top + 12);
    ctx.fillText("the failure rate explode", left + 4, top + 24);
    ctx.fillText("channel bit error rate", right - 96, bottom + 26);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#070c10";
    ctx.fillRect(0, 0, W, H);
    drawCodewords();
    drawSyndrome();
    drawBars();
    drawCurve();

    ctx.fillStyle = "#6f8493";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(
      `Hamming(8,4) · ${state.flips.filter(Boolean).length} injected error${
        state.flips.filter(Boolean).length === 1 ? "" : "s"
      } · p ${state.p.toFixed(3)}`,
      26,
      H - 16
    );
    ctx.textAlign = "right";
    ctx.fillStyle = "#6ff0c8";
    ctx.fillText("code rate 4/8 · minimum distance 4", W - 26, H - 16);
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

  canvas.addEventListener("pointerdown", (evt) => {
    const [x, y] = point(evt);
    const cellW = 50;
    const gap = 4;
    const left = CODE.x + 22;
    const rows = [
      { y: CODE.y + 26, kind: "data" },
      { y: CODE.y + 122, kind: "tx" },
    ];
    for (const row of rows) {
      if (y < row.y || y > row.y + 30) continue;
      const index = Math.floor((x - left) / (cellW + gap));
      if (index < 0 || index >= (row.kind === "data" ? 4 : 8)) return;
      if (row.kind === "data") {
        state.data[index] ^= 1;
      } else {
        state.flips[index] = !state.flips[index];
      }
      updateReadouts();
      describe();
      draw();
      return;
    }
  });

  el("p").addEventListener("input", (evt) => {
    state.p = Math.max(0.005, Math.min(0.2, Number(evt.target.value) || 0.05));
    recompute();
  });

  el("errors").addEventListener("input", (evt) => {
    state.errorCount = Math.max(1, Math.min(4, Number(evt.target.value) || 1));
    updateReadouts();
  });

  function flipRandom(count) {
    const want = count || state.errorCount;
    // pick distinct free positions, without replacement
    const candidates = state.flips.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
    const picked = [];
    while (picked.length < want && candidates.length) {
      const index = Math.floor(Math.random() * candidates.length);
      picked.push(candidates.splice(index, 1)[0]);
    }
    picked.forEach((i) => {
      state.flips[i] = true;
    });
    updateReadouts();
    describe();
    draw();
  }

  el("flip").addEventListener("click", () => flipRandom());
  el("random-data").addEventListener("click", () => {
    state.data = state.data.map(() => (Math.random() < 0.5 ? 1 : 0));
    state.flips = new Array(N).fill(false);
    recompute();
  });

  function setPreset(name, button) {
    ["clean", "noisy", "bad"].forEach((key) => el("preset-" + key).classList.toggle("active", key === button));
    state.p = name === "clean" ? 0.01 : name === "noisy" ? 0.05 : 0.12;
    el("p").value = String(state.p);
    recompute();
  }
  el("preset-clean").addEventListener("click", () => setPreset("clean", "clean"));
  el("preset-noisy").addEventListener("click", () => setPreset("noisy", "noisy"));
  el("preset-bad").addEventListener("click", () => setPreset("bad", "bad"));

  document.addEventListener("keydown", (evt) => {
    if (evt.key === " ") {
      evt.preventDefault();
      flipRandom();
    } else if (evt.key === "r" || evt.key === "R") {
      state.data = state.data.map(() => (Math.random() < 0.5 ? 1 : 0));
      state.flips = new Array(N).fill(false);
      recompute();
    } else if (evt.key === "c" || evt.key === "C") {
      state.flips = new Array(N).fill(false);
      updateReadouts();
      describe();
      draw();
    }
  });

  window.__lab = {
    state,
    encode,
    decode,
    syndrome,
    exactStats,
    monteCarlo,
    recompute,
    updateReadouts,
    describe,
    draw,
    currentWord,
    receivedWord,
    DATA_POS,
    PARITY_POS,
  };

  recompute();
})();
