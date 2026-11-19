(() => {
  "use strict";

  // Bloom filter lab. Membership is decided by k hash functions (double
  // hashing: h_i = h1 + i*h2, Kirsch-Mitzenmacher) over an m-bit array.
  // The measured false-positive rate is checked against the theory
  // (1 - e^(-kn/m))^k, and the optimal k = (m/n)*ln2 is reported.

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");

  const W = canvas.width || 880;
  const H = canvas.height || 660;

  const STAGE = { x: 26, y: 50, w: 828, h: 500 };
  const INFO = { x: 26, y: 576, w: 828, h: 58 };

  const PRESETS = {
    small: { label: "Small", m: 1000, k: 3, n: 100 },
    medium: { label: "Medium", m: 5000, k: 5, n: 500 },
    large: { label: "Large", m: 10000, k: 7, n: 1000 },
    optimal: { label: "Optimal", m: 4800, k: 7, n: 500 },
  };

  const state = {
    m: 5000,
    k: 5,
    n: 500,
    bits: new Uint8Array(5000),
    members: new Set(),
    preset: "medium",
    lastQuery: null, // {word, bits:[], result}
    measuredFpr: 0,
    seed: 12345,
  };

  /* ------------------------------------------------------------------ hashing */

  function hash32(str, seed) {
    // FNV-1a 32-bit with a seed
    let h = 0x811c9dc5 ^ seed;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
  }

  function hashPositions(word, m, k) {
    const h1 = hash32(word, 0x9e3779b9);
    // mask to 31 bits so h2 stays positive (| 1 would sign-extend to int32)
    const h2 = (hash32(word, 0x85ebca6b) & 0x7fffffff) | 1; // odd, for full coverage
    const out = [];
    for (let i = 0; i < k; i++) out.push((h1 + i * h2) % m);
    return out;
  }

  function insertWord(word) {
    const pos = hashPositions(word, state.m, state.k);
    for (const p of pos) state.bits[p] = 1;
    state.members.add(word);
  }

  function queryWord(word) {
    const pos = hashPositions(word, state.m, state.k);
    return { pos, member: pos.every((p) => state.bits[p] === 1) };
  }

  function theoryFpr(m, k, n) {
    return Math.pow(1 - Math.exp((-k * n) / m), k);
  }

  function optimalK(m, n) {
    return (m / n) * Math.LN2;
  }

  /* -------------------------------------------------------------- word supply */

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const SYL = ["ba", "lo", "mi", "ta", "ro", "sen", "ku", "di", "fe", "go", "ha", "in", "jo", "ka", "lu", "me", "no", "pi", "qu", "ra", "so", "tu", "ve", "wo", "xi", "yo", "za", "an", "er", "is", "on", "un"];

  function makeWord(rng) {
    const parts = 2 + Math.floor(rng() * 3);
    let w = "";
    for (let i = 0; i < parts; i++) w += SYL[Math.floor(rng() * SYL.length)];
    return w;
  }

  function rebuild() {
    state.bits = new Uint8Array(state.m);
    state.members = new Set();
    state.lastQuery = null;
    const rng = mulberry32(state.seed);
    let guard = 0;
    while (state.members.size < state.n && guard < state.n * 20) {
      insertWord(makeWord(rng));
      guard++;
    }
    // measured FPR over 1000 non-members
    const rng2 = mulberry32(state.seed ^ 0xdead);
    let fp = 0;
    let tested = 0;
    guard = 0;
    while (tested < 1000 && guard < 20000) {
      const w = makeWord(rng2);
      guard++;
      if (state.members.has(w)) continue;
      tested++;
      if (queryWord(w).member) fp++;
    }
    state.measuredFpr = tested ? fp / tested : 0;
  }

  /* ------------------------------------------------------------------- drawing */

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#050807";
    ctx.fillRect(STAGE.x, STAGE.y, STAGE.w, STAGE.h);

    const m = state.m;
    const cols = Math.ceil(Math.sqrt(m * (STAGE.w / STAGE.h)));
    const rows = Math.ceil(m / cols);
    const cw = STAGE.w / cols;
    const ch = STAGE.h / rows;
    const pad = Math.max(0.5, Math.min(cw, ch) * 0.18);

    const querySet = new Set(state.lastQuery ? state.lastQuery.pos : []);
    for (let idx = 0; idx < m; idx++) {
      const c = idx % cols;
      const r = Math.floor(idx / cols);
      const x = STAGE.x + c * cw + pad;
      const y = STAGE.y + r * ch + pad;
      const w = cw - pad * 2;
      const h = ch - pad * 2;
      if (querySet.has(idx)) ctx.fillStyle = "#ffb45f";
      else if (state.bits[idx]) ctx.fillStyle = "#6ff0a8";
      else ctx.fillStyle = "#1c2b21";
      ctx.fillRect(x, y, w, h);
    }

    // info strip
    ctx.fillStyle = "#0a1014";
    ctx.fillRect(INFO.x, INFO.y, INFO.w, INFO.h);
    ctx.strokeStyle = "#223028";
    ctx.strokeRect(INFO.x, INFO.y, INFO.w, INFO.h);
    ctx.fillStyle = "#8aa392";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    const setCount = state.bits.reduce((s, b) => s + b, 0);
    const occ = setCount / state.m;
    const theory = theoryFpr(state.m, state.k, state.n);
    ctx.fillText(
      "m=" + state.m + "  k=" + state.k + "  n=" + state.n +
      "  set=" + setCount + "  occupancy=" + (occ * 100).toFixed(1) + "%" +
      "  measured FPR=" + (state.measuredFpr * 100).toFixed(2) + "%" +
      "  theory=" + (theory * 100).toFixed(2) + "%" +
      "  optimal k=" + optimalK(state.m, state.n).toFixed(1),
      INFO.x + 10, INFO.y + 24
    );
    if (state.lastQuery) {
      ctx.fillStyle = state.lastQuery.result ? "#ffb45f" : "#6ff0a8";
      ctx.fillText(
        "query '" + state.lastQuery.word + "' -> " +
        (state.lastQuery.result ? "MAYBE (false positive!)" : "no") +
        "  bits: " + state.lastQuery.pos.join(", "),
        INFO.x + 10, INFO.y + 44
      );
    } else {
      ctx.fillStyle = "#8aa392";
      ctx.fillText("no query yet — press Query random", INFO.x + 10, INFO.y + 44);
    }
  }

  /* ------------------------------------------------------------------ readouts */

  function updateReadouts() {
    const setCount = state.bits.reduce((s, b) => s + b, 0);
    const occ = setCount / state.m;
    const theory = theoryFpr(state.m, state.k, state.n);

    el("m-out").textContent = String(state.m);
    el("k-out").textContent = String(state.k);
    el("n-out").textContent = String(state.n);

    el("occ-hud").textContent = "occupancy " + (occ * 100).toFixed(1) + "%";
    el("fpr-hud").textContent = "false-positive " + (state.measuredFpr * 100).toFixed(2) + "%";
    el("theory-hud").textContent = "theory " + (theory * 100).toFixed(2) + "%";

    el("set-read").textContent = String(setCount);
    el("occ-read").textContent = (occ * 100).toFixed(1) + "%";
    el("fpr-read").textContent = (state.measuredFpr * 100).toFixed(2) + "%";
    el("theory-read").textContent = (theory * 100).toFixed(2) + "%";
    el("optk-read").textContent = optimalK(state.m, state.n).toFixed(1);
    el("query-read").textContent = state.lastQuery
      ? (state.lastQuery.result ? "maybe (FP)" : "no")
      : "—";
  }

  function describe() {
    const theory = theoryFpr(state.m, state.k, state.n);
    const opt = optimalK(state.m, state.n);
    const diff = Math.abs(state.measuredFpr - theory);
    let msg;
    if (diff < 0.01) {
      msg = "Measured FPR " + (state.measuredFpr * 100).toFixed(2) + "% matches theory " + (theory * 100).toFixed(2) + "% — the (1 − e^(−kn/m))^k model holds. Optimal k here is " + opt.toFixed(1) + "; you are using " + state.k + ".";
    } else if (state.k < opt - 1) {
      msg = "Too few hashes: k=" + state.k + " but optimal is " + opt.toFixed(1) + ". Each item sets too few bits, so strangers slip through. Theory FPR is " + (theory * 100).toFixed(2) + "%.";
    } else if (state.k > opt + 1) {
      msg = "Too many hashes: k=" + state.k + " but optimal is " + opt.toFixed(1) + ". Extra hashes just set more bits and raise the false-positive rate. Theory FPR is " + (theory * 100).toFixed(2) + "%.";
    } else {
      msg = "k=" + state.k + " is near the optimal " + opt.toFixed(1) + " for m/n = " + (state.m / state.n).toFixed(1) + " bits per item. Theory FPR " + (theory * 100).toFixed(2) + "%, measured " + (state.measuredFpr * 100).toFixed(2) + "%.";
    }
    el("status").textContent = msg;
  }

  /* -------------------------------------------------------------------- wiring */

  function setPreset(name) {
    const p = PRESETS[name];
    if (!p) return;
    state.preset = name;
    state.m = p.m;
    state.k = p.k;
    state.n = p.n;
    state.seed = 12345 + state.m + state.k * 100 + state.n;
    el("m").value = String(p.m);
    el("k").value = String(p.k);
    el("n").value = String(p.n);
    ["small", "medium", "large", "optimal"].forEach((kk) => {
      el("preset-" + kk).classList.toggle("active", kk === name);
    });
    rebuild();
    updateReadouts();
    describe();
    draw();
  }

  function clearPresets() {
    state.preset = "";
    ["small", "medium", "large", "optimal"].forEach((kk) => el("preset-" + kk).classList.remove("active"));
  }

  el("m").addEventListener("input", (evt) => {
    state.m = Math.max(500, Math.min(10000, Number(evt.target.value) || 5000));
    state.seed = 12345 + state.m + state.k * 100 + state.n;
    clearPresets();
    rebuild();
    updateReadouts();
    describe();
    draw();
  });
  el("k").addEventListener("input", (evt) => {
    state.k = Math.max(1, Math.min(10, Number(evt.target.value) || 5));
    state.seed = 12345 + state.m + state.k * 100 + state.n;
    clearPresets();
    rebuild();
    updateReadouts();
    describe();
    draw();
  });
  el("n").addEventListener("input", (evt) => {
    state.n = Math.max(50, Math.min(2000, Number(evt.target.value) || 500));
    state.seed = 12345 + state.m + state.k * 100 + state.n;
    clearPresets();
    rebuild();
    updateReadouts();
    describe();
    draw();
  });

  el("preset-small").addEventListener("click", () => setPreset("small"));
  el("preset-medium").addEventListener("click", () => setPreset("medium"));
  el("preset-large").addEventListener("click", () => setPreset("large"));
  el("preset-optimal").addEventListener("click", () => setPreset("optimal"));

  el("btn-insert").addEventListener("click", () => {
    state.seed = (state.seed * 1103515245 + 12345) >>> 0;
    rebuild();
    updateReadouts();
    describe();
    draw();
  });
  el("btn-query").addEventListener("click", () => {
    const rng = mulberry32((state.seed ^ 0xbeef) + state.members.size);
    let w = makeWord(rng);
    let guard = 0;
    while (state.members.has(w) && guard < 100) { w = makeWord(rng); guard++; }
    const q = queryWord(w);
    state.lastQuery = { word: w, pos: q.pos, result: q.member };
    updateReadouts();
    describe();
    draw();
  });
  el("btn-reset").addEventListener("click", () => {
    state.seed = 12345;
    rebuild();
    updateReadouts();
    describe();
    draw();
  });

  document.addEventListener("keydown", (evt) => {
    if (evt.key === "1") setPreset("small");
    else if (evt.key === "2") setPreset("medium");
    else if (evt.key === "3") setPreset("large");
    else if (evt.key === "4") setPreset("optimal");
    else if (evt.key === "i" || evt.key === "I") el("btn-insert").click();
    else if (evt.key === "q" || evt.key === "Q") el("btn-query").click();
    else if (evt.key === "r" || evt.key === "R") el("btn-reset").click();
  });

  window.__lab = {
    state,
    PRESETS,
    hash32,
    hashPositions,
    insertWord,
    queryWord,
    theoryFpr,
    optimalK,
    rebuild,
    setPreset,
    updateReadouts,
    describe,
    draw,
  };

  rebuild();
  updateReadouts();
  describe();
  draw();
})();
