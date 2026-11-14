(() => {
  "use strict";

  // A real open-addressing table with three probe sequences, plus chaining for
  // comparison. Keys are generated from an integer source and hashed with a
  // quality parameter, so a bad hash function genuinely produces clusters.
  //
  // Probe counts are measured during inserts and lookups and compared with the
  // classic uniform-hashing formulas for each scheme, which is what makes the
  // chart an experiment rather than an illustration.

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");

  const W = canvas.width || 880;
  const H = canvas.height || 660;

  const TABLE = { x: 26, y: 60, w: 596, h: 250 };
  const STATS = { x: 642, y: 60, w: 212, h: 250 };
  const CHART = { x: 26, y: 344, w: 402, h: 270 };
  const DIST = { x: 448, y: 344, w: 406, h: 270 };

  const SCHEMES = {
    linear: { name: "Linear probing", short: "linear", colour: "#6ff0c8" },
    quadratic: { name: "Quadratic probing", short: "quadratic", colour: "#8fb3ff" },
    double: { name: "Double hashing", short: "double", colour: "#d59bff" },
  };

  const state = {
    size: 97,
    target: 70,
    quality: 80,
    scheme: "linear",
    slots: [],
    chained: [],
    inserted: 0,
    nextKey: 1,
    hits: [],
    misses: 0,
    missCount: 0,
    collisions: 0,
    failed: 0,
    history: [],
    hover: -1,
    statusKind: "",
  };

  /* ---------------------------------------------------------------- hashing */

  // A deliberately adjustable hash. Each key is hashed either with the
  // Fibonacci multiplicative hash (close to ideal for a prime table) or with a
  // deliberately weak one that only ever lands in a handful of buckets. The
  // quality slider is the share of keys that get the good hash, so lowering it
  // really does inject clustering into the table.
  function hashValue(key) {
    const strong = ((key * 2654435761) >>> 0) % state.size;
    const mixedWeak = ((key * 1103515245 + 12345) >>> 0) % 11;
    const scaled = Math.floor((mixedWeak * state.size) / 11);
    const useStrong = ((key * 7919 + 13) >>> 0) % 100 < state.quality;
    return useStrong ? strong : scaled % state.size;
  }

  function secondHash(key) {
    return 1 + (key % Math.max(1, state.size - 2));
  }

  /* ---------------------------------------------------------------- probing */

  function probeSequence(key) {
    const h = hashValue(key);
    const sequence = [];
    if (state.scheme === "linear") {
      for (let i = 0; i < state.size; i++) sequence.push((h + i) % state.size);
    } else if (state.scheme === "quadratic") {
      // h, h+1, h+4, h+9, ... with triangular numbers so every slot is visited
      // when the table size is prime.
      for (let i = 0; i < state.size; i++) {
        sequence.push((h + ((i * (i + 1)) / 2 | 0)) % state.size);
      }
    } else {
      const step = secondHash(key);
      for (let i = 0; i < state.size; i++) sequence.push((h + i * step) % state.size);
    }
    return sequence;
  }

  function insert(key) {
    if (state.inserted >= state.size) {
      state.failed++;
      return { key, probes: state.size, slot: -1, ok: false };
    }
    const sequence = probeSequence(key);
    let probes = 0;
    for (const slot of sequence) {
      probes++;
      if (state.slots[slot] === null) {
        state.slots[slot] = key;
        state.inserted++;
        if (probes > 1) state.collisions++;
        state.hits.push(probes);
        return { key, probes, slot, ok: true };
      }
    }
    state.failed++;
    return { key, probes, slot: -1, ok: false };
  }

  function lookup(key) {
    const sequence = probeSequence(key);
    let probes = 0;
    for (const slot of sequence) {
      probes++;
      if (state.slots[slot] === null) return { found: false, probes };
      if (state.slots[slot] === key) return { found: true, probes, slot };
    }
    return { found: false, probes };
  }

  function buildChained() {
    const buckets = state.size;
    const chains = new Array(buckets).fill(0);
    for (let i = 0; i < state.inserted; i++) {
      const key = state.history[i];
      chains[hashValue(key)]++;
    }
    return chains;
  }

  function measureMisses() {
    // Average probe count over 200 absent keys, which is what a failed lookup
    // actually costs.
    let total = 0;
    const count = 200;
    for (let i = 0; i < count; i++) {
      const key = 100000 + i * 7 + 3;
      total += lookup(key).probes;
    }
    state.missAvg = total / count;
  }

  /* ------------------------------------------------------------ bookkeeping */

  function resetTable(keepHistory) {
    state.slots = new Array(state.size).fill(null);
    state.inserted = 0;
    state.collisions = 0;
    state.failed = 0;
    state.hits = [];
    state.missAvg = 0;
    if (!keepHistory) state.history = [];
    state.chained = new Array(state.size).fill(0);
  }

  function rebuild() {
    const keys = state.history.slice(0, state.target);
    resetTable(true);
    state.history = [];
    const wanted = keys.length ? keys : null;
    for (let i = 0; i < state.target; i++) {
      const key = wanted && wanted[i] !== undefined ? wanted[i] : 1000 + i * 37;
      const result = insert(key);
      if (result.ok) state.history.push(key);
    }
    state.chained = buildChained();
    measureMisses();
    updateReadouts();
    describe();
    draw();
  }

  function insertOne() {
    const key = 1000 + state.nextKey * 37 + state.nextKey * state.nextKey;
    state.nextKey++;
    const result = insert(key);
    if (result.ok) {
      state.history.push(key);
      state.chained = buildChained();
      measureMisses();
    }
    updateReadouts();
    describe();
    draw();
  }

  function clearTable() {
    state.nextKey = 1;
    resetTable(false);
    updateReadouts();
    describe();
    draw();
  }

  const alpha = () => state.inserted / state.size;

  function longestRun() {
    if (!state.inserted) return 0;
    let best = 0;
    let run = 0;
    for (let i = 0; i < state.size * 2; i++) {
      const slot = i % state.size;
      if (state.slots[slot] !== null) {
        run++;
        best = Math.max(best, run);
      } else {
        run = 0;
      }
      if (i >= state.size && run === 0) break;
    }
    return Math.min(best, state.size);
  }

  // Knuth's uniform-hashing formulas.
  function theoryHit(a) {
    if (state.scheme === "linear") return 0.5 * (1 + 1 / Math.max(1e-9, 1 - a));
    if (state.scheme === "quadratic") return 1 - Math.log(1 - a) / Math.max(1e-9, a);
    return -Math.log(1 - a) / Math.max(1e-9, a);
  }

  function theoryMiss(a) {
    if (state.scheme === "linear") return 0.5 * (1 + 1 / Math.pow(Math.max(1e-9, 1 - a), 2));
    if (state.scheme === "quadratic") return 1 / Math.max(1e-9, 1 - a) - a - Math.log(1 - a);
    return 1 / Math.max(1e-9, 1 - a);
  }

  const measuredHit = () =>
    state.hits.length ? state.hits.reduce((a, b) => a + b, 0) / state.hits.length : 0;

  /* -------------------------------------------------------------- readouts */

  function setStatus(text, kind) {
    const box = el("status");
    box.textContent = text;
    box.className = "status" + (kind ? " " + kind : "");
    state.statusKind = kind || "";
  }

  function updateReadouts() {
    const a = alpha();
    el("size-out").textContent = String(state.size);
    el("keys-out").textContent = String(state.inserted);
    el("quality-out").textContent =
      state.quality >= 95 ? "ideal" : state.quality >= 70 ? "good" : state.quality >= 40 ? "weak" : "bad";
    el("alpha-read").textContent = (100 * a).toFixed(0) + "%";
    el("coll-read").textContent = String(state.collisions);
    el("hit-read").textContent = measuredHit() ? measuredHit().toFixed(2) : "—";
    el("hit-theory").textContent = a > 0 ? theoryHit(a).toFixed(2) : "—";
    el("miss-read").textContent = state.missAvg ? state.missAvg.toFixed(2) : "—";
    el("miss-theory").textContent = a > 0 ? theoryMiss(a).toFixed(2) : "—";
    el("run-read").textContent = String(longestRun());
    el("fail-read").textContent = String(state.failed);
    el("load-hud").textContent = "load " + (100 * a).toFixed(0) + "%";
    el("probe-hud").textContent = "probes " + (measuredHit() ? measuredHit().toFixed(2) : "—");
    el("cluster-hud").textContent = "run " + longestRun();
  }

  function describe() {
    const a = alpha();
    if (!state.inserted) {
      setStatus(
        "The table is empty. Insert keys one at a time, or press Fill to load it to 80% and watch the probe counts climb.",
        "idle"
      );
      return;
    }
    const hit = measuredHit();
    const miss = state.missAvg;
    const th = theoryHit(a);
    const tm = theoryMiss(a);
    const run = longestRun();

    let verdict;
    if (hit > th * 1.6 && state.quality < 70) {
      verdict = `Measured ${hit.toFixed(2)} probes per hit against ${th.toFixed(
        2
      )} predicted — ${100 - state.quality}% of the keys land in only eleven buckets, so the clustering is the hash's fault, not the load factor's.`;
    } else if (a > 0.05 && hit > th * 2.2) {
      verdict = `Measured ${hit.toFixed(2)} probes per hit against ${th.toFixed(
        2
      )} predicted — the hash is weaker than uniform hashing, so the table is clustering.`;
    } else if (state.scheme === "linear" && run >= 8) {
      verdict = `The longest occupied run is ${run} slots. That is primary clustering: every key hashing into the run walks it to the end.`;
    } else {
      verdict = `Measured ${hit.toFixed(2)} probes per hit against ${th.toFixed(
        2
      )} predicted, and ${miss.toFixed(2)} per miss against ${tm.toFixed(2)}.`;
    }

    setStatus(
      `${verdict} Load factor ${(100 * a).toFixed(0)}% (${state.inserted}/${state.size}); ${state.collisions} inserts needed more than one probe${
        state.failed ? ` and ${state.failed} failed` : ""
      }. Longest run ${run}.`,
      hit <= th * 1.5 ? "good" : "warn"
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

  function drawTable() {
    const scheme = SCHEMES[state.scheme];
    panel(TABLE, scheme.name, `${state.inserted}/${state.size} slots`);
    const cols = state.size <= 100 ? 20 : 22;
    const rows = Math.ceil(state.size / cols);
    const cell = Math.min((TABLE.w - 24) / cols, (TABLE.h - 30) / rows) - 2;
    const left = TABLE.x + 14;
    const top = TABLE.y + 16;

    for (let i = 0; i < state.size; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = left + col * (cell + 2);
      const y = top + row * (cell + 2);
      const filled = state.slots[i] !== null;
      const hovered = state.hover === i;
      ctx.fillStyle = filled ? scheme.colour : "#101a21";
      ctx.globalAlpha = filled ? 0.78 : 1;
      ctx.fillRect(x, y, cell, cell);
      ctx.globalAlpha = 1;
      if (hovered) {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x + 0.5, y + 0.5, cell - 1, cell - 1);
        ctx.lineWidth = 1;
      }
    }

    ctx.fillStyle = "#55697a";
    ctx.font = "9.5px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(
      state.hover >= 0
        ? `slot ${state.hover} · ${state.slots[state.hover] === null ? "empty" : "key " + state.slots[state.hover]}`
        : `${state.size} slots · ${state.inserted} keys · hash quality ${state.quality}%`,
      TABLE.x + 14,
      TABLE.y + TABLE.h - 10
    );
  }

  function drawStats() {
    panel(STATS, "cost", "measured vs theory");
    const a = alpha();
    const rows = [
      ["load α", (100 * a).toFixed(0) + "%"],
      ["hits", measuredHit() ? measuredHit().toFixed(2) : "—"],
      ["theory hit", a > 0 ? theoryHit(a).toFixed(2) : "—"],
      ["misses", state.missAvg ? state.missAvg.toFixed(2) : "—"],
      ["theory miss", a > 0 ? theoryMiss(a).toFixed(2) : "—"],
      ["longest run", String(longestRun())],
      ["collisions", String(state.collisions)],
      ["failed", String(state.failed)],
    ];
    rows.forEach((row, i) => {
      const y = STATS.y + 24 + i * 26;
      ctx.fillStyle = "#6f8493";
      ctx.font = "9.5px ui-monospace, Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText(row[0], STATS.x + 12, y);
      ctx.fillStyle = "#e2eef4";
      ctx.textAlign = "right";
      ctx.fillText(row[1], STATS.x + STATS.w - 12, y);
    });
  }

  function drawChart() {
    panel(CHART, "probes per lookup vs load", "the knee");
    const left = CHART.x + 44;
    const right = CHART.x + CHART.w - 16;
    const top = CHART.y + 18;
    const bottom = CHART.y + CHART.h - 30;
    const X = (a) => left + a * (right - left);
    const Y = (v) => bottom - (Math.min(v, 20) / 20) * (bottom - top);

    ctx.strokeStyle = "#16222b";
    ctx.fillStyle = "#4e6272";
    ctx.font = "9px ui-monospace, Menlo, monospace";
    for (let v = 0; v <= 20; v += 5) {
      const y = Y(v);
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
      ctx.stroke();
      ctx.textAlign = "right";
      ctx.fillText(String(v), left - 6, y + 3);
    }
    for (let a = 0; a <= 1; a += 0.25) {
      const x = X(a);
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x, bottom);
      ctx.stroke();
      ctx.textAlign = "center";
      ctx.fillText(a.toFixed(2), x, bottom + 12);
    }

    const curve = (fn, colour, width) => {
      ctx.beginPath();
      for (let i = 0; i <= 60; i++) {
        const a = (i / 60) * 0.97;
        const x = X(a);
        const y = Y(fn(a));
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = colour;
      ctx.lineWidth = width;
      ctx.stroke();
    };

    const saved = state.scheme;
    curve((a) => 0.5 * (1 + 1 / (1 - a)), "#6ff0c8", 1.1);
    curve((a) => 1 - Math.log(1 - a) / a, "#8fb3ff", 1.1);
    curve((a) => -Math.log(1 - a) / a, "#d59bff", 1.1);
    void saved;

    // current point
    if (state.inserted) {
      const px = X(Math.min(0.98, alpha()));
      const py = Y(measuredHit());
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(px, bottom);
      ctx.lineTo(px, py);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.fillStyle = "#55697a";
    ctx.textAlign = "left";
    ctx.font = "9px ui-monospace, Menlo, monospace";
    ctx.fillText("linear", left + 8, top + 12);
    ctx.fillStyle = "#6ff0c8";
    ctx.fillRect(left + 44, top + 8, 10, 3);
    ctx.fillStyle = "#55697a";
    ctx.fillText("quadratic", left + 62, top + 12);
    ctx.fillStyle = "#8fb3ff";
    ctx.fillRect(left + 116, top + 8, 10, 3);
    ctx.fillStyle = "#55697a";
    ctx.fillText("double", left + 134, top + 12);
    ctx.fillStyle = "#d59bff";
    ctx.fillRect(left + 176, top + 8, 10, 3);
  }

  function drawDistribution() {
    panel(DIST, "chain lengths", "chaining, same keys");
    const chains = state.chained;
    if (!chains.length) return;
    const max = Math.max(1, ...chains);
    const left = DIST.x + 40;
    const right = DIST.x + DIST.w - 14;
    const top = DIST.y + 22;
    const bottom = DIST.y + DIST.h - 30;
    const barW = (right - left) / chains.length;

    for (let i = 0; i < chains.length; i++) {
      const h = ((bottom - top) * chains[i]) / max;
      ctx.fillStyle = chains[i] > 1 ? "#ffb45f" : "#2f5a52";
      ctx.globalAlpha = chains[i] ? 0.85 : 0.3;
      ctx.fillRect(left + i * barW, bottom - h, Math.max(1, barW - 1), h);
      ctx.globalAlpha = 1;
    }

    ctx.strokeStyle = "#1f303a";
    ctx.beginPath();
    ctx.moveTo(left, bottom);
    ctx.lineTo(right, bottom);
    ctx.stroke();

    ctx.fillStyle = "#6f8493";
    ctx.font = "9px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(`longest chain ${max}`, left, top - 6);
    ctx.textAlign = "right";
    ctx.fillText(`${chains.filter((c) => c > 1).length} shared buckets`, right, top - 6);
    ctx.textAlign = "left";
    ctx.fillText(`ideal chain length λ = ${(state.inserted / state.size).toFixed(2)}`, left, bottom + 16);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#070c10";
    ctx.fillRect(0, 0, W, H);
    drawTable();
    drawStats();
    drawChart();
    drawDistribution();

    ctx.fillStyle = "#6f8493";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(
      `${SCHEMES[state.scheme].short} probing · ${state.inserted} keys in ${state.size} slots · hash quality ${state.quality}%`,
      26,
      H - 16
    );
    ctx.textAlign = "right";
    ctx.fillStyle = "#6ff0c8";
    ctx.fillText("measured on this table", W - 26, H - 16);
    ctx.textAlign = "left";
  }

  /* -------------------------------------------------------------- controls */

  function setScheme(name) {
    state.scheme = name;
    ["linear", "quadratic", "double"].forEach((key) =>
      el("scheme-" + key).classList.toggle("active", key === name)
    );
    rebuild();
  }

  const point = (evt) => {
    const rect = canvas.getBoundingClientRect();
    return [
      (evt.clientX - rect.left) * (W / (rect.width || W)),
      (evt.clientY - rect.top) * (H / (rect.height || H)),
    ];
  };

  function slotAt(x, y) {
    const cols = state.size <= 100 ? 20 : 22;
    const rows = Math.ceil(state.size / cols);
    const cell = Math.min((TABLE.w - 24) / cols, (TABLE.h - 30) / rows) - 2;
    const left = TABLE.x + 14;
    const top = TABLE.y + 16;
    const col = Math.floor((x - left) / (cell + 2));
    const row = Math.floor((y - top) / (cell + 2));
    if (col < 0 || col >= cols || row < 0 || row >= rows) return -1;
    const index = row * cols + col;
    return index < state.size ? index : -1;
  }

  canvas.addEventListener("pointermove", (evt) => {
    const [x, y] = point(evt);
    const slot = slotAt(x, y);
    if (slot !== state.hover) {
      state.hover = slot;
      draw();
    }
  });
  canvas.addEventListener("pointerdown", (evt) => {
    const [x, y] = point(evt);
    const slot = slotAt(x, y);
    state.hover = slot;
    draw();
  });

  el("size").addEventListener("input", (evt) => {
    state.size = Math.max(31, Math.min(211, Math.round((Number(evt.target.value) || 97) / 2) * 2 + 1));
    rebuild();
  });
  el("keys").addEventListener("input", (evt) => {
    state.target = Math.max(0, Math.min(190, Number(evt.target.value) || 0));
    rebuild();
  });
  el("quality").addEventListener("input", (evt) => {
    state.quality = Math.max(0, Math.min(100, Number(evt.target.value) || 0));
    rebuild();
  });

  el("scheme-linear").addEventListener("click", () => setScheme("linear"));
  el("scheme-quadratic").addEventListener("click", () => setScheme("quadratic"));
  el("scheme-double").addEventListener("click", () => setScheme("double"));

  el("insert").addEventListener("click", insertOne);
  el("fill").addEventListener("click", () => {
    const want = Math.min(state.size - 1, Math.round(state.size * 0.8));
    state.target = want;
    el("keys").value = String(Math.min(190, want));
    rebuild();
  });
  el("clear").addEventListener("click", clearTable);

  document.addEventListener("keydown", (evt) => {
    if (evt.key === " ") {
      evt.preventDefault();
      insertOne();
    } else if (evt.key === "c" || evt.key === "C") clearTable();
    else if (evt.key === "1") setScheme("linear");
    else if (evt.key === "2") setScheme("quadratic");
    else if (evt.key === "3") setScheme("double");
  });

  window.__lab = {
    state,
    SCHEMES,
    hashValue,
    probeSequence,
    insert,
    lookup,
    rebuild,
    insertOne,
    clearTable,
    setScheme,
    longestRun,
    theoryHit,
    theoryMiss,
    measuredHit,
    alpha,
    updateReadouts,
    describe,
    draw,
  };

  rebuild();
})();
