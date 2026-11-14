(() => {
  "use strict";

  // Three coders, one text, and an honest audit of every bit each one emits.
  //
  //   run-length — literal + Elias-gamma length for each run
  //   Huffman    — optimal prefix code, plus the header needed to describe it
  //   LZ78       — (dictionary index, next literal) tokens, decoder rebuilds the rest
  //
  // Shannon entropy is reported as a floor: it is the per-symbol cost that no
  // context-free code can undercut, which makes the three bars mean something.

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");

  const W = canvas.width || 880;
  const H = canvas.height || 660;

  const SAMPLES = {
    english:
      "A compressor never creates information, it only removes the redundancy a writer left behind. " +
      "English holds roughly one bit of surprise per letter because the letters are not independent: " +
      "after the letter q the next symbol is almost always u, and the word the recurs so often that " +
      "its cost shrinks to a few bits. A good coder learns those habits, a great one learns them per context.",
    repeat:
      "abababab-abababab-abababab-abababab|" +
      "cdcdcdcd-cdcdcdcd-cdcdcdcd-cdcdcdcd|" +
      "abababab-abababab-abababab-abababab|" +
      "efefefef-efefefef-efefefef-efefefef",
    dna:
      "GATTACAGATTACAGGCTAACGTTAGCATCGGATCCGATTACAGGCATTAACGGTACCGATTACAGGCTAACGTTAGCATCGGATCC" +
      "GGCATTAACGGTACCGATTACAGGCATTAACGGTACCGGCTAACGTTAGCATCGGATCCGATTACAGGCATTAACGGTACCGAATTCC",
    random: "",
  };

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

  function randomText(count) {
    const rand = seeded(97531);
    const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789 .,-";
    let out = "";
    for (let i = 0; i < count; i++) out += alphabet[Math.floor(rand() * alphabet.length)];
    return out;
  }
  SAMPLES.random = randomText(360);

  const state = {
    preset: "english",
    base: SAMPLES.english,
    repeat: 1,
    noise: 0,
    text: "",
    result: null,
    statusKind: "",
  };

  /* ------------------------------------------------------------ the coders */

  function entropyOf(text) {
    const freq = new Map();
    for (const ch of text) freq.set(ch, (freq.get(ch) || 0) + 1);
    const n = [...text].length;
    if (!n) return 0;
    let bits = 0;
    for (const count of freq.values()) {
      const p = count / n;
      bits -= p * Math.log2(p);
    }
    return bits * n; // total bits for this text
  }

  function gammaBits(value) {
    const v = Math.max(1, Math.floor(value));
    return 2 * Math.floor(Math.log2(v)) + 1;
  }

  function rle(text) {
    const chars = [...text];
    const runs = [];
    for (let i = 0; i < chars.length; i++) {
      if (i > 0 && chars[i] === chars[i - 1]) runs[runs.length - 1].length++;
      else runs.push({ ch: chars[i], length: 1 });
    }
    const bits = runs.reduce((sum, r) => sum + 8 + gammaBits(r.length), 0);
    return { runs, bits };
  }

  function huffman(text) {
    const freq = new Map();
    for (const ch of text) freq.set(ch, (freq.get(ch) || 0) + 1);
    const nodes = [...freq.entries()].map(([ch, count]) => ({ ch, count, left: null, right: null }));
    if (!nodes.length) return { bits: 0, root: null, codes: {}, used: 0 };

    // deterministic tie-break: by frequency, then symbol
    const cmp = (a, b) => a.count - b.count || String(a.ch).localeCompare(String(b.ch));
    let pool = nodes.slice().sort(cmp);
    while (pool.length > 1) {
      const left = pool.shift();
      const right = pool.shift();
      const parent = { ch: null, count: left.count + right.count, left, right };
      pool.push(parent);
      pool.sort(cmp);
    }
    const root = pool[0];
    const codes = {};
    let payload = 0;
    (function walk(node, prefix, depth) {
      if (!node.left && !node.right) {
        codes[node.ch] = prefix || "0";
        payload += node.count * (prefix ? prefix.length : 1);
        return;
      }
      walk(node.left, prefix + "0", depth + 1);
      walk(node.right, prefix + "1", depth + 1);
    })(root, "", 0);

    const used = freq.size;
    // Header: symbol table size, then (8-bit symbol, 4-bit code length) per entry.
    const header = 16 + used * 12;
    return { bits: payload + header, payload, header, root, codes, used };
  }

  function lz78(text) {
    const chars = [...text];
    const dict = new Map(); // phrase -> index (1-based)
    const tokens = [];
    let bits = 0;
    let i = 0;
    while (i < chars.length) {
      let current = "";
      let index = 0;
      let j = i;
      while (j < chars.length) {
        const candidate = current + chars[j];
        if (!dict.has(candidate)) break;
        current = candidate;
        index = dict.get(candidate);
        j++;
      }
      const next = j < chars.length ? chars[j] : "";
      const dictSize = dict.size;
      const indexBits = Math.max(1, Math.ceil(Math.log2(dictSize + 1)));
      tokens.push({ index, ch: next, prefix: current, bits: indexBits + 8 });
      bits += indexBits + 8;
      if (next) {
        dict.set(current + next, dict.size + 1);
        i = j + 1;
      } else {
        i = j;
      }
    }
    return { tokens, bits, dictSize: dict.size };
  }

  function analyse(text) {
    const chars = [...text];
    const n = chars.length;
    const entropy = entropyOf(text);
    const h = huffman(text);
    const l = lz78(text);
    const r = rle(text);
    return {
      chars: n,
      alphabet: new Set(chars).size,
      raw: 8 * n,
      entropy,
      huffman: h,
      lz78: l,
      rle: r,
      best: Math.min(h.bits, l.bits, r.bits),
    };
  }

  function ratio(bits) {
    const raw = state.result ? state.result.raw : 0;
    if (!raw) return 0;
    return raw / bits;
  }

  /* -------------------------------------------------------------- corpora */

  function buildText() {
    let base = state.base;
    if (!base) base = "";
    let text = base.repeat(state.repeat);
    if (state.noise > 0 && text) {
      const rand = seeded(state.noise * 7919 + state.repeat * 131 + 17);
      const alphabet = [...new Set(base)].filter((c) => c !== " " && c !== "\n");
      const chars = [...text];
      for (let i = 0; i < chars.length; i++) {
        if (rand() < state.noise / 100) {
          chars[i] = alphabet[Math.floor(rand() * alphabet.length)] || chars[i];
        }
      }
      text = chars.join("");
    }
    return text;
  }

  function setPreset(name) {
    state.preset = name;
    state.base = SAMPLES[name];
    ["english", "repeat", "dna", "random"].forEach((key) => {
      el("preset-" + key).classList.toggle("active", key === name);
    });
    el("repeat").value = String(state.repeat);
    el("input").value = state.base;
    rebuild();
  }

  function rebuild() {
    state.text = el("input").value;
    state.result = analyse(state.text);
    updateReadouts();
    describe();
    draw();
  }

  /* ------------------------------------------------------------- readouts */

  function fmt(bits) {
    if (!bits) return "0";
    if (bits >= 100000) return (bits / 1000).toFixed(0) + "k";
    return String(Math.round(bits));
  }

  function setStatus(text, kind) {
    const box = el("status");
    box.textContent = text;
    box.className = "status" + (kind ? " " + kind : "");
    state.statusKind = kind || "";
  }

  function updateReadouts() {
    const r = state.result;
    if (!r) return;
    el("raw-read").textContent = fmt(r.raw);
    el("ent-read").textContent = fmt(r.entropy);
    el("huff-read").textContent = fmt(r.huffman.bits);
    el("lz-read").textContent = fmt(r.lz78.bits);
    el("rle-read").textContent = fmt(r.rle.bits);
    el("bpc-read").textContent = r.chars ? (r.best / r.chars).toFixed(2) : "—";
    el("repeat-out").textContent = state.repeat + "×";
    el("noise-out").textContent = state.noise + "%";
    const bestName =
      r.best === r.huffman.bits ? "Huffman" : r.best === r.lz78.bits ? "LZ78" : "run-length";
    const gain = r.best ? r.raw / r.best : 0;
    el("best-hud").textContent = "best " + bestName;
    el("ratio-hud").textContent = "ratio " + gain.toFixed(2) + "×";
    el("size-hud").textContent = fmt(r.best) + " bits";
  }

  function describe() {
    const r = state.result;
    if (!r || !r.chars) {
      setStatus("The text box is empty — pick a corpus or type something to compress.", "idle");
      return;
    }
    const names = [
      ["Huffman", r.huffman.bits],
      ["LZ78", r.lz78.bits],
      ["run-length", r.rle.bits],
    ].sort((a, b) => a[1] - b[1]);
    const [winner, bits] = names[0];
    const floor = r.entropy;
    const gap = floor > 0 ? (100 * (bits - floor)) / bits : 0;
    const huffPerChar = r.huffman.payload / r.chars;

    let note;
    if (winner === "LZ78") {
      note = `LZ78 is winning because the text repeats phrases: ${r.lz78.tokens.length} tokens rebuilt ${
        r.lz78.dictSize
      } dictionary entries.`;
    } else if (winner === "Huffman") {
      const margin = (r.lz78.bits - bits) / bits;
      note =
        margin < 0.3
          ? `Huffman edges LZ78 by ${Math.round(r.lz78.bits - bits)} bits: one or two symbols dominate, so they cost about a bit each, while every new LZ78 phrase still pays an 8-bit literal.`
          : `Huffman is winning at ${huffPerChar.toFixed(
              2
            )} bits per character of payload, so the symbol distribution is skewed but the text rarely repeats.`;
    } else {
      note = "Run-length is winning because the same symbol repeats for long stretches — the only thing a run coder understands.";
    }

    setStatus(
      `${winner} takes ${Math.round(bits)} bits (${(r.raw / bits).toFixed(2)}× smaller than 8-bit raw). ` +
        `The entropy floor is ${Math.round(floor)} bits, so ${winner} sits ${gap.toFixed(0)}% above the best any context-free code could do. ${note}`,
      "good"
    );
  }

  /* ------------------------------------------------------------- rendering */

  const BARS = { x: 26, y: 48, w: 356, h: 258 };
  const TREE = { x: 402, y: 48, w: 452, h: 268 };
  const TABLE = { x: 26, y: 336, w: 356, h: 268 };
  const TOKENS = { x: 402, y: 336, w: 452, h: 268 };

  function panelBox(box, title) {
    ctx.fillStyle = "rgba(9, 14, 18, 0.82)";
    ctx.fillRect(box.x, box.y, box.w, box.h);
    ctx.strokeStyle = "#1d2a33";
    ctx.lineWidth = 1;
    ctx.strokeRect(box.x + 0.5, box.y + 0.5, box.w - 1, box.h - 1);
    ctx.fillStyle = "#7e94a3";
    ctx.font = "10px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(title, box.x + 10, box.y - 8);
  }

  function drawBars() {
    panelBox(BARS, "bits on the wire");
    const r = state.result;
    if (!r || !r.chars) return;
    const rows = [
      ["raw 8-bit", r.raw, "#7d8c9c"],
      ["Huffman", r.huffman.bits, "#6ff0c8"],
      ["LZ78", r.lz78.bits, "#8fb3ff"],
      ["run-length", r.rle.bits, "#ffb45f"],
    ];
    const max = Math.max(r.raw, 1);
    const left = BARS.x + 84;
    const right = BARS.x + BARS.w - 54;
    const span = right - left;
    const top = BARS.y + 24;
    rows.forEach((row, i) => {
      const y = top + i * 44;
      const w = Math.max(2, (row[1] / max) * span);
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.fillRect(left, y, span, 20);
      ctx.fillStyle = row[2];
      ctx.globalAlpha = 0.82;
      ctx.fillRect(left, y, w, 20);
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#9db0be";
      ctx.font = "10.5px ui-monospace, Menlo, monospace";
      ctx.textAlign = "right";
      ctx.fillText(row[0], left - 8, y + 14);
      ctx.fillStyle = "#eaf2f7";
      ctx.textAlign = "left";
      ctx.fillText(Math.round(row[1]).toLocaleString("en-US"), left + w + 6, y + 14);
    });

    // entropy floor marker
    const ex = left + (r.entropy / max) * span;
    ctx.strokeStyle = "#ffcf7a";
    ctx.lineWidth = 1.4;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(ex, top - 8);
    ctx.lineTo(ex, top + rows.length * 44 - 20);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#ffcf7a";
    ctx.font = "10px ui-monospace, Menlo, monospace";
    ctx.textAlign = ex > BARS.x + BARS.w - 90 ? "right" : "left";
    ctx.fillText("entropy floor", ex + (ex > BARS.x + BARS.w - 90 ? -6 : 6), top - 12);

    ctx.fillStyle = "#5f7484";
    ctx.textAlign = "left";
    ctx.font = "10px ui-monospace, Menlo, monospace";
    ctx.fillText(
      `${r.chars} chars · ${r.alphabet} symbols · ${(r.best / r.chars).toFixed(2)} bits/char best`,
      BARS.x + 10,
      BARS.y + BARS.h - 12
    );
  }

  function leafList(root) {
    const out = [];
    (function walk(node, depth) {
      if (!node) return;
      if (!node.left && !node.right) {
        out.push({ ch: node.ch, count: node.count, depth });
        return;
      }
      walk(node.left, depth + 1);
      walk(node.right, depth + 1);
    })(root, 0);
    return out;
  }

  function drawTree() {
    panelBox(TREE, "Huffman tree");
    const r = state.result;
    if (!r || !r.huffman.root) return;
    const root = r.huffman.root;
    const leaves = leafList(root);
    let cursor = 0;

    // in-order x positions, internal nodes average their children
    (function place(node) {
      if (!node.left && !node.right) {
        node._x = cursor++;
        return node._x;
      }
      const a = place(node.left);
      const b = place(node.right);
      node._x = (a + b) / 2;
      return node._x;
    })(root);

    let maxDepth = 1;
    (function depth(node, d) {
      maxDepth = Math.max(maxDepth, d);
      if (node.left) depth(node.left, d + 1);
      if (node.right) depth(node.right, d + 1);
    })(root, 0);

    const padL = TREE.x + 18;
    const padR = TREE.x + TREE.w - 18;
    const top = TREE.y + 22;
    const bottom = TREE.y + TREE.h - 46;
    const spanX = leafList(root).length > 1 ? cursor - 1 : 1;
    const sx = (node) => padL + ((padR - padL) * node._x) / spanX;
    const sy = (d) => top + ((bottom - top) * d) / Math.max(1, maxDepth);

    // Elbow edges: drop half way, run across, drop again. Far easier to read
    // than diagonal spaghetti once the tree has thirty leaves.
    ctx.strokeStyle = "#2f5a52";
    ctx.lineWidth = 1;
    (function edges(node, d) {
      if (!node.left) return;
      const mid = (sy(d) + sy(d + 1)) / 2;
      [node.left, node.right].forEach((child) => {
        ctx.beginPath();
        ctx.moveTo(sx(node), sy(d));
        ctx.lineTo(sx(node), mid);
        ctx.lineTo(sx(child), mid);
        ctx.lineTo(sx(child), sy(d + 1));
        ctx.stroke();
        edges(child, d + 1);
      });
    })(root, 0);

    // leaves
    const many = leaves.length > 26;
    (function drawLeaves(node, d) {
      if (!node.left && !node.right) {
        const x = sx(node);
        const y = sy(d);
        const hot = node.count > r.chars * 0.06;
        ctx.beginPath();
        ctx.arc(x, y, hot ? 4 : 3, 0, Math.PI * 2);
        ctx.fillStyle = hot ? "#6ff0c8" : "#3f7f73";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, 1.6, 0, Math.PI * 2);
        ctx.fillStyle = "#2f5a52";
        ctx.fill();
        if (!many || hot) {
          ctx.fillStyle = "#c7d8e2";
          ctx.font = "10px ui-monospace, Menlo, monospace";
          ctx.textAlign = "center";
          const label = node.ch === " " ? "·" : node.ch === "\n" ? "⏎" : node.ch;
          ctx.fillText(label, x, y - 6);
        }
        return;
      }
      drawLeaves(node.left, d + 1);
      drawLeaves(node.right, d + 1);
    })(root, 0);

    ctx.fillStyle = "#5f7484";
    ctx.font = "10px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(
      `depth ${maxDepth} · payload ${Math.round(r.huffman.payload)} bits + header ${
        r.huffman.header
      } · dot size = frequency`,
      TREE.x + 10,
      TREE.y + TREE.h - 12
    );
  }

  function drawTable() {
    panelBox(TABLE, "Huffman code table");
    const r = state.result;
    if (!r || !r.huffman.root) return;
    const entries = [...new Set([...state.text])]
      .map((ch) => ({ ch, code: r.huffman.codes[ch] || "0" }))
      .sort((a, b) => a.code.length - b.code.length || a.code.localeCompare(b.code))
      .slice(0, 34);

    const colW = (TABLE.w - 24) / 2;
    entries.forEach((entry, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = TABLE.x + 10 + col * colW;
      const y = TABLE.y + 22 + row * 13.4;
      ctx.font = "10.5px ui-monospace, Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillStyle = "#9db0be";
      const label = entry.ch === " " ? "·" : entry.ch === "\n" ? "⏎" : entry.ch;
      ctx.fillText(label, x, y);
      ctx.fillStyle = "#6ff0c8";
      ctx.fillText(entry.code, x + 18, y);
      ctx.fillStyle = "#55697a";
      ctx.fillText(entry.code.length + "b", x + 78, y);
    });

    ctx.fillStyle = "#5f7484";
    ctx.font = "10px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(
      entries.length < new Set([...state.text]).size
        ? `showing ${entries.length} of ${new Set([...state.text]).size} symbols`
        : `${entries.length} symbols in the header`,
      TABLE.x + 10,
      TABLE.y + TABLE.h - 12
    );
  }

  function drawTokens() {
    panelBox(TOKENS, "LZ78 tokens");
    const r = state.result;
    if (!r) return;
    const tokens = r.lz78.tokens.slice(0, 40);
    const perRow = 4;
    const cw = (TOKENS.w - 24) / perRow;
    const ch = 34;
    tokens.forEach((token, i) => {
      const col = i % perRow;
      const row = Math.floor(i / perRow);
      const x = TOKENS.x + 12 + col * cw;
      const y = TOKENS.y + 16 + row * ch;
      if (y > TOKENS.y + TOKENS.h - 58) return;
      ctx.fillStyle = "#0d161c";
      ctx.fillRect(x, y, cw - 8, ch - 8);
      ctx.strokeStyle = "#1f303a";
      ctx.strokeRect(x + 0.5, y + 0.5, cw - 9, ch - 9);
      const phrase = (token.prefix || "") + (token.ch || "");
      const shown = phrase.length > 9 ? phrase.slice(0, 8) + "…" : phrase;
      ctx.fillStyle = "#eaf2f7";
      ctx.font = "10.5px ui-monospace, Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText(shown.replace(/ /g, "·"), x + 6, y + 15);
      ctx.fillStyle = "#8fb3ff";
      ctx.font = "9px ui-monospace, Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("#" + token.index, x + 6, y + 23);
      ctx.fillStyle = "#55697a";
      ctx.textAlign = "right";
      ctx.fillText(token.bits + "b", x + cw - 14, y + 23);
      ctx.textAlign = "left";
    });
    ctx.fillStyle = "#5f7484";
    ctx.font = "10px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(
      `${r.lz78.tokens.length} tokens (index → literal) · ${r.lz78.dictSize} phrases · ${Math.round(
        r.lz78.bits
      )} bits`,
      TOKENS.x + 10,
      TOKENS.y + TOKENS.h - 10
    );
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#070c10";
    ctx.fillRect(0, 0, W, H);
    drawBars();
    drawTree();
    drawTable();
    drawTokens();

    ctx.fillStyle = "#6f8493";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(
      `${state.preset} · ${state.repeat}× · ${state.noise}% corrupted · ${state.result ? state.result.chars : 0} chars`,
      26,
      H - 18
    );
    ctx.textAlign = "right";
    ctx.fillStyle = "#6ff0c8";
    ctx.fillText("headers counted", W - 26, H - 18);
    ctx.textAlign = "left";
  }

  /* -------------------------------------------------------------- controls */

  el("input").addEventListener("input", () => {
    state.preset = "custom";
    ["english", "repeat", "dna", "random"].forEach((key) =>
      el("preset-" + key).classList.remove("active")
    );
    state.base = el("input").value;
    rebuild();
  });

  el("repeat").addEventListener("input", (evt) => {
    state.repeat = Math.max(1, Math.min(6, Number(evt.target.value) || 1));
    el("input").value = buildText();
    rebuild();
  });
  el("noise").addEventListener("input", (evt) => {
    state.noise = Math.max(0, Math.min(40, Number(evt.target.value) || 0));
    el("input").value = buildText();
    rebuild();
  });

  ["english", "repeat", "dna", "random"].forEach((key) => {
    el("preset-" + key).addEventListener("click", () => setPreset(key));
  });

  document.addEventListener("keydown", (evt) => {
    const map = { "1": "english", "2": "repeat", "3": "dna", "4": "random" };
    if (map[evt.key]) setPreset(map[evt.key]);
  });

  window.__lab = {
    state,
    SAMPLES,
    analyse,
    huffman,
    lz78,
    rle,
    entropyOf,
    gammaBits,
    buildText,
    setPreset,
    rebuild,
    updateReadouts,
    describe,
    draw,
  };

  el("input").value = SAMPLES.english;
  rebuild();

  function loop() {
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
