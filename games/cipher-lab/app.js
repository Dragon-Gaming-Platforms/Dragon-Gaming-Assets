(() => {
  "use strict";

  // Four classical ciphers plus two attacks. Everything operates on the letters
  // of the input and preserves everything else, so punctuation survives a
  // round trip. The attacks are real: chi-squared scoring for simple
  // substitutions and index-of-coincidence key-length detection for Vigenère.

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");

  const W = canvas.width || 860;
  const H = canvas.height || 700;

  const HIST_X = 36;
  const HIST_Y = 382;
  const HIST_W = 788;
  const HIST_H = 268;

  const SAMPLE =
    "Cryptography begins with a confession: any message that can be scrambled by " +
    "rules can be unscrambled by the same rules. Caesar shifted every letter three " +
    "places and believed the courier was the weak point, which it was. Vigenere " +
    "added a repeating word and bought three hundred years of false confidence. " +
    "Every classical cipher leaks something, usually the shape of the language " +
    "underneath, and frequency analysis is simply the habit of noticing.";

  const ENGLISH = [
    0.08167, 0.01492, 0.02782, 0.04253, 0.12702, 0.02228, 0.02015, 0.06094,
    0.06966, 0.00153, 0.00772, 0.04025, 0.02406, 0.06749, 0.07507, 0.01929,
    0.00095, 0.05987, 0.06327, 0.09056, 0.02758, 0.00978, 0.0236, 0.0015,
    0.01974, 0.00074,
  ];

  const CIPHERS = {
    caesar: { name: "Caesar", shift: true },
    vigenere: { name: "Vigenère", shift: false },
    atbash: { name: "Atbash", shift: false },
    railfence: { name: "Rail fence", shift: false },
  };

  const state = {
    cipher: "caesar",
    key: 3,
    wordKey: "",
    useWordKey: false,
    plain: SAMPLE,
    cipherText: "",
    output: "",
    lastAction: "none",
    recoveredKey: null,
    keyLength: null,
    chi: null,
    frame: 0,
  };

  const ALPHA = "abcdefghijklmnopqrstuvwxyz";

  // Twelve preset Vigenère keywords. A constant letter key would collapse into
  // a Caesar cipher, which would make the cracker look cleverer than it is.
  const VIGENERE_KEYS = [
    "lemon", "cobalt", "harbor", "violet", "meridian", "quartz",
    "ember", "falcon", "glacier", "island", "jigsaw", "kestrel",
  ];

  function lettersOnly(text) {
    return text.toLowerCase().replace(/[^a-z]/g, "");
  }

  /* --------------------------------------------------------------- ciphers */

  function caesar(text, shift) {
    return text.replace(/[a-z]/gi, (ch) => {
      const upper = ch === ch.toUpperCase();
      const idx = ALPHA.indexOf(ch.toLowerCase());
      const out = ALPHA[(idx + ((shift % 26) + 26)) % 26];
      return upper ? out.toUpperCase() : out;
    });
  }

  function vigenere(text, key, decrypt) {
    if (!key.length) return text;
    let k = 0;
    return text.replace(/[a-z]/gi, (ch) => {
      const upper = ch === ch.toUpperCase();
      const idx = ALPHA.indexOf(ch.toLowerCase());
      const shift = ALPHA.indexOf(key[k % key.length]);
      k++;
      const out = ALPHA[(idx + (decrypt ? -shift : shift) + 26) % 26];
      return upper ? out.toUpperCase() : out;
    });
  }

  function atbash(text) {
    return text.replace(/[a-z]/gi, (ch) => {
      const upper = ch === ch.toUpperCase();
      const idx = ALPHA.indexOf(ch.toLowerCase());
      const out = ALPHA[25 - idx];
      return upper ? out.toUpperCase() : out;
    });
  }

  function railFence(text, rails, decrypt) {
    if (rails < 2) return text;
    const chars = text.split("");
    const n = chars.length;
    const pattern = [];
    let rail = 0;
    let dir = 1;
    for (let i = 0; i < n; i++) {
      pattern.push(rail);
      if (rail + dir < 0 || rail + dir >= rails) dir = -dir;
      rail += dir;
    }

    const rows = Array.from({ length: rails }, () => []);
    if (!decrypt) {
      for (let i = 0; i < n; i++) rows[pattern[i]].push(chars[i]);
      return rows.flat().join("");
    }

    // Count how many characters belong to each rail, then fill in order.
    const counts = new Array(rails).fill(0);
    for (const r of pattern) counts[r]++;
    let cursor = 0;
    for (let r = 0; r < rails; r++) {
      rows[r] = chars.slice(cursor, cursor + counts[r]);
      cursor += counts[r];
    }
    const indices = new Array(rails).fill(0);
    const out = [];
    for (let i = 0; i < n; i++) {
      const r = pattern[i];
      out.push(rows[r][indices[r]++]);
    }
    return out.join("");
  }

  function keyString() {
    if (state.cipher === "vigenere") {
      const word = lettersOnly(state.wordKey);
      if (state.useWordKey && word.length) return word;
      return VIGENERE_KEYS[(state.key - 1) % VIGENERE_KEYS.length];
    }
    if (state.cipher === "railfence") return String(railCount());
    if (state.cipher === "atbash") return "fixed";
    return ALPHA[(state.key - 1) % 26];
  }

  function railCount() {
    return Math.max(2, Math.min(9, state.key));
  }

  function apply(text, mode) {
    const decrypt = mode === "decrypt";
    if (state.cipher === "caesar") return caesar(text, decrypt ? -state.key : state.key);
    if (state.cipher === "vigenere") return vigenere(text, keyString(), decrypt);
    if (state.cipher === "atbash") return atbash(text);
    // The fence reorders characters, spaces included, which would scramble the
    // word boundaries beyond recovery. Working on letters only keeps it honest.
    const letters = text.replace(/[^a-z]/gi, "");
    return railFence(letters, railCount(), decrypt);
  }

  /* ---------------------------------------------------------------- attacks */

  function indexOfCoincidence(text) {
    const letters = lettersOnly(text);
    if (letters.length < 2) return 0;
    const counts = new Array(26).fill(0);
    for (const ch of letters) counts[ALPHA.indexOf(ch)]++;
    let sum = 0;
    for (const c of counts) sum += c * (c - 1);
    return sum / (letters.length * (letters.length - 1));
  }

  function chiSquared(text) {
    const letters = lettersOnly(text);
    if (!letters.length) return Infinity;
    const counts = new Array(26).fill(0);
    for (const ch of letters) counts[ALPHA.indexOf(ch)]++;
    let chi = 0;
    for (let i = 0; i < 26; i++) {
      const expected = ENGLISH[i] * letters.length;
      const diff = counts[i] - expected;
      chi += (diff * diff) / Math.max(1e-9, expected);
    }
    return chi;
  }

  function bestCaesarShift(text) {
    let best = { shift: 0, chi: Infinity };
    for (let s = 0; s < 26; s++) {
      const chi = chiSquared(caesar(text, -s));
      if (chi < best.chi) best = { shift: s, chi };
    }
    return best;
  }

  function coincidenceAt(letters, k) {
    // Fraction of positions where a letter repeats k places later. For the true
    // key length this climbs towards English's 0.066; otherwise it stays near
    // the flat 0.038 of a uniform alphabet.
    let hits = 0;
    let total = 0;
    for (let i = 0; i + k < letters.length; i++) {
      if (letters[i] === letters[i + k]) hits++;
      total++;
    }
    return total ? hits / total : 0;
  }

  function averageIC(letters, len) {
    let total = 0;
    let counted = 0;
    for (let offset = 0; offset < len; offset++) {
      const counts = new Array(26).fill(0);
      let n = 0;
      for (let i = offset; i < letters.length; i += len) {
        counts[ALPHA.indexOf(letters[i])]++;
        n++;
      }
      if (n < 2) continue;
      let sum = 0;
      for (const c of counts) sum += c * (c - 1);
      total += sum / (n * (n - 1));
      counted++;
    }
    return counted ? total / counted : 0;
  }

  function keyLengthGuess(text, maxLen) {
    const letters = lettersOnly(text);
    const scores = [];
    for (let len = 1; len <= maxLen; len++) {
      scores.push({ len, ic: averageIC(letters, len), coinc: coincidenceAt(letters, len) });
    }

    // Coincidence alone can be fooled by repetitive plaintext, so every
    // candidate length is cracked and the decryption is scored against English
    // letter frequencies. The lowest chi-squared wins; ties go to the shorter key.
    let best = null;
    for (const score of scores) {
      const cracked = crackVigenere(text, score.len);
      const chi = chiSquared(cracked.key ? vigenere(text, cracked.key, true) : text);
      const candidate = { ...score, chi, key: cracked.key };
      if (!best || chi < best.chi - 1e-9) best = candidate;
    }
    return { best, scores, bestCoinc: best ? best.coinc : 0 };
  }

  function crackVigenere(text, len) {
    const letters = lettersOnly(text);
    let key = "";
    let totalChi = 0;
    for (let offset = 0; offset < len; offset++) {
      const column = [];
      for (let i = offset; i < letters.length; i += len) column.push(letters[i]);
      const joined = column.join("");
      const best = bestCaesarShift(joined);
      key += ALPHA[best.shift];
      totalChi += best.chi;
    }
    return { key, chi: totalChi };
  }

  /* ---------------------------------------------------------------- actions */

  function setStatus(text, kind) {
    const box = el("status");
    box.textContent = text;
    box.className = "status" + (kind ? " " + kind : "");
  }

  function entropyOf(text) {
    const letters = lettersOnly(text);
    if (!letters.length) return 0;
    const counts = {};
    for (const ch of letters) counts[ch] = (counts[ch] || 0) + 1;
    let h = 0;
    for (const key in counts) {
      const p = counts[key] / letters.length;
      h -= p * Math.log2(p);
    }
    return h;
  }

  function updateReadouts() {
    const letters = lettersOnly(state.cipherText || state.plain);
    el("ic-read").textContent = indexOfCoincidence(letters).toFixed(3);
    el("klen-read").textContent = state.keyLength ? String(state.keyLength) : "—";
    el("keyguess-read").textContent = state.recoveredKey || "—";
    el("chi-read").textContent = state.chi === null ? "—" : state.chi.toFixed(0);
    el("score-read").textContent = String(letters.length);
    el("ent-read").textContent = entropyOf(letters).toFixed(2);
    el("key-out").textContent =
      state.cipher === "vigenere" ? keyString() : String(state.key);
    el("mode-hud").textContent = CIPHERS[state.cipher].name;
    el("len-hud").textContent = letters.length + " chars";
    el("key-hud").textContent = "key " + (state.recoveredKey || keyString());
    el("chars-out").textContent = String((el("input").value || "").length);
  }

  function encrypt() {
    state.plain = el("input").value;
    state.cipherText = apply(state.plain, "encrypt");
    el("output").value = state.cipherText;
    state.lastAction = "encrypt";
    state.recoveredKey = null;
    state.keyLength = null;
    state.chi = null;
    updateReadouts();
    setStatus(
      `${CIPHERS[state.cipher].name} with key ${keyString()}. Ciphertext has an index of coincidence of ${indexOfCoincidence(
        state.cipherText
      ).toFixed(3)}; English sits near 0.066, so a flat value means the letters have been smeared.`,
      "idle"
    );
  }

  function decrypt() {
    // Decrypt whatever is on screen: the ciphertext if we just encrypted,
    // otherwise the text in the input box.
    const source = state.lastAction === "encrypt" && el("output").value ? el("output").value : el("input").value;
    const plain = apply(source, "decrypt");
    el("output").value = plain;
    state.plain = plain;
    state.lastAction = "decrypt";
    updateReadouts();
    setStatus(`${CIPHERS[state.cipher].name} decrypted with key ${keyString()}. The output above is the plaintext.`, "idle");
  }

  function breakCipher() {
    // Attack the ciphertext that is actually on screen; fall back to the input
    // box when nothing has been encrypted yet.
    const output = el("output").value;
    const text = state.lastAction === "encrypt" && output ? output : el("input").value;
    const letters = lettersOnly(text);
    if (letters.length < 40) {
      setStatus("Give the attack at least 40 letters — statistics need something to chew on.", "warn");
      return;
    }

    if (state.cipher === "caesar" || state.cipher === "atbash") {
      const best = bestCaesarShift(text);
      const recovered = ALPHA[best.shift];
      const plain = caesar(text, -best.shift);
      el("output").value = plain;
      state.recoveredKey = recovered;
      state.chi = best.chi;
      state.keyLength = 1;
      updateReadouts();
      setStatus(
        `All 26 shifts scored; ${recovered} (shift ${best.shift}) wins with χ² = ${best.chi.toFixed(
          0
        )}. Legend: about 40 letters is enough for a Caesar to fall.`,
        "good"
      );
      return;
    }

    if (state.cipher === "vigenere") {
      const guess = keyLengthGuess(text, Math.max(2, Math.min(12, Math.floor(letters.length / 25))));
      state.keyLength = guess.best.len;
      state.recoveredKey = guess.best.key;
      state.chi = guess.best.chi;
      el("output").value = vigenere(text, guess.best.key, true);
      const cracked = guess.best;
      updateReadouts();
      setStatus(
        `Key length ${cracked.len} (repeat rate ${cracked.coinc.toFixed(
          3
        )} against a flat 0.038), recovered key “${cracked.key}” at χ² = ${cracked.chi.toFixed(
          0
        )}. Each column is a separate Caesar cipher — split them and each one falls to frequency analysis.`,
        "good"
      );
      return;
    }

    setStatus(
      "A rail fence destroys the letter order, not the letters: the histogram still looks like English, so frequency analysis has nothing to grab. Here you have to guess the rail count.",
      "warn"
    );
  }

  /* -------------------------------------------------------------- drawing */

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#060a0a";
    ctx.fillRect(0, 0, W, H);

    drawHeaderCards();
    drawHistogram();
    drawKeyStrip();

    ctx.fillStyle = "#6f8688";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("letters only; punctuation and spacing pass through untouched", 36, H - 14);
    ctx.textAlign = "right";
    ctx.fillText(
      state.cipher === "atbash"
        ? "Atbash · no key"
        : state.cipher === "railfence"
          ? `Rail fence · ${railCount()} rails`
          : `${CIPHERS[state.cipher].name} · key ${keyString()}`,
      W - 36,
      H - 14
    );
    ctx.textAlign = "left";
  }

  function drawHeaderCards() {
    const cards = [
      { label: "plaintext", value: state.lastAction === "decrypt" ? el("input").value : state.plain, colour: "#c8dedb" },
      { label: "ciphertext", value: state.cipherText || "—", colour: "#7ee8c8" },
    ];
    cards.forEach((card, i) => {
      const x = 36;
      const y = 34 + i * 122;
      const w = 788;
      const h = 104;
      ctx.fillStyle = "#0b1211";
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = "#263335";
      ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);

      ctx.fillStyle = "#728b88";
      ctx.font = "10.5px ui-monospace, Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText(card.label.toUpperCase(), x + 14, y + 18);

      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.clip();
      ctx.fillStyle = card.colour;
      ctx.font = "12.5px ui-monospace, Menlo, monospace";
      wrap(String(card.value || "").slice(0, 260), x + 14, y + 40, w - 28, 17);
      ctx.restore();
    });
    ctx.textAlign = "left";
  }

  function drawHistogram() {
    const text = state.cipherText || state.plain;
    const letters = lettersOnly(text);

    ctx.fillStyle = "#0b1211";
    ctx.fillRect(HIST_X, HIST_Y, HIST_W, HIST_H);
    ctx.strokeStyle = "#263335";
    ctx.strokeRect(HIST_X + 0.5, HIST_Y + 0.5, HIST_W - 1, HIST_H - 1);

    ctx.fillStyle = "#8aa0a0";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("letter frequency", HIST_X + 16, HIST_Y + 22);
    ctx.fillStyle = "#6f8688";
    ctx.fillText(`IC ${indexOfCoincidence(letters).toFixed(3)} · English 0.066`, HIST_X + 150, HIST_Y + 22);

    const counts = new Array(26).fill(0);
    for (const ch of letters) counts[ALPHA.indexOf(ch)]++;
    const total = Math.max(1, letters.length);
    const peak = Math.max(0.13, ...counts.map((c) => c / total));

    const x0 = HIST_X + 22;
    const y0 = HIST_Y + 44;
    const w = HIST_W - 44;
    const h = HIST_H - 96;
    const bw = w / 26;

    for (let i = 0; i < 26; i++) {
      const x = x0 + i * bw;
      const freq = counts[i] / total;

      // English baseline as a thin bar behind.
      const eh = (ENGLISH[i] / peak) * h;
      ctx.fillStyle = "rgba(120, 145, 148, 0.28)";
      ctx.fillRect(x + 3, y0 + h - eh, bw - 6, eh);

      const bh = (freq / peak) * h;
      ctx.fillStyle = state.recoveredKey ? "#ffcf7a" : "#7ee8c8";
      ctx.fillRect(x + 6, y0 + h - bh, bw - 12, bh);

      ctx.fillStyle = "#728b88";
      ctx.font = "10px ui-monospace, Menlo, monospace";
      ctx.textAlign = "center";
      ctx.fillText(ALPHA[i], x + bw / 2, y0 + h + 16);
      if (freq > 0.005) {
        ctx.fillStyle = "#5f7476";
        ctx.font = "9px ui-monospace, Menlo, monospace";
        ctx.fillText((freq * 100).toFixed(0), x + bw / 2, y0 + h + 30);
      }
    }

    ctx.fillStyle = "#6f8688";
    ctx.font = "10px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("bars: this text · grey: English", x0, HIST_Y + HIST_H - 12);
    ctx.textAlign = "right";
    ctx.fillText(`entropy ${entropyOf(letters).toFixed(2)} bits`, HIST_X + HIST_W - 16, HIST_Y + HIST_H - 12);
    ctx.textAlign = "left";
  }

  function drawKeyStrip() {
    const text = state.cipherText || "";
    const letters = lettersOnly(text).slice(0, 64);
    if (!letters.length) return;

    const y = 286;
    const x0 = 36;
    const key = keyString();
    const rails = railCount();

    // For the fence the useful annotation is which rail each letter sits on.
    const railOf = (i) => {
      if (state.cipher !== "railfence") return 0;
      const period = 2 * rails - 2;
      const pos = i % period;
      return pos < rails ? pos : period - pos;
    };

    ctx.fillStyle = "#728b88";
    ctx.font = "10.5px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(
      state.cipher === "railfence" ? `ciphertext letters → rail (of ${rails})` : "ciphertext letters → shift applied",
      x0,
      y - 6
    );

    const cw = Math.min(18, 780 / Math.max(1, letters.length));
    for (let i = 0; i < letters.length; i++) {
      const x = x0 + i * cw;
      let shift = 0;
      if (state.cipher === "caesar") shift = state.key;
      else if (state.cipher === "vigenere") shift = ALPHA.indexOf(key[i % key.length]);
      else if (state.cipher === "atbash") shift = 25 - ALPHA.indexOf(letters[i]);
      else if (state.cipher === "railfence") shift = railOf(i);

      const maxShift = state.cipher === "railfence" ? Math.max(1, rails - 1) : 26;
      ctx.fillStyle = `rgba(126, 232, 200, ${0.12 + Math.min(0.7, shift / maxShift)})`;
      ctx.fillRect(x, y, cw - 2, 18);
      ctx.fillStyle = "#9fb6b3";
      ctx.font = "10px ui-monospace, Menlo, monospace";
      ctx.textAlign = "center";
      ctx.fillText(letters[i], x + (cw - 2) / 2, y + 13);
      if (cw > 12) {
        ctx.fillStyle = "#5f7476";
        ctx.font = "8.5px ui-monospace, Menlo, monospace";
        ctx.fillText(String(shift), x + (cw - 2) / 2, y + 29);
      }
    }
    ctx.textAlign = "left";
  }

  function wrap(text, x, y, maxWidth, lineHeight) {
    const value = String(text);
    let line = "";
    let cursor = y;
    for (const word of value.split(" ")) {
      const test = line ? line + " " + word : word;
      const width = ctx.measureText ? ctx.measureText(test).width : test.length * 6;
      if (width > maxWidth && line) {
        ctx.fillText(line, x, cursor);
        line = word;
        cursor += lineHeight;
      } else line = test;
    }
    if (line) ctx.fillText(line, x, cursor);
  }

  /* ---------------------------------------------------------------- input */

  function setCipher(name) {
    state.cipher = name;
    ["caesar", "vigenere", "atbash", "railfence"].forEach((id) => el("c-" + id).classList.toggle("active", id === name));
    state.recoveredKey = null;
    state.keyLength = null;
    state.chi = null;
    updateReadouts();
    setStatus(
      name === "atbash"
        ? "Atbash is a fixed substitution: a↔z, b↔y. No key at all, and no security either."
        : name === "railfence"
          ? "The rail fence writes the message in a zigzag and reads row by row. The letters are untouched — only their order changes."
          : `${CIPHERS[name].name} selected. Encrypt to see what leaks.`,
      "idle"
    );
  }

  el("c-caesar").addEventListener("click", () => setCipher("caesar"));
  el("c-vigenere").addEventListener("click", () => setCipher("vigenere"));
  el("c-atbash").addEventListener("click", () => setCipher("atbash"));
  el("c-railfence").addEventListener("click", () => setCipher("railfence"));

  el("key").addEventListener("input", (evt) => {
    state.key = Math.max(1, Math.min(12, Number(evt.target.value) || 1));
    updateReadouts();
  });

  el("autokey").addEventListener("change", (evt) => {
    state.useWordKey = !!evt.target.checked;
    updateReadouts();
  });

  el("input").addEventListener("input", () => {
    updateReadouts();
  });

  el("encrypt").addEventListener("click", encrypt);
  el("decrypt").addEventListener("click", decrypt);
  el("crack").addEventListener("click", breakCipher);

  el("sample").addEventListener("click", () => {
    el("input").value = SAMPLE;
    state.plain = el("input").value;
    state.cipherText = "";
    state.recoveredKey = null;
    state.keyLength = null;
    state.chi = null;
    updateReadouts();
    setStatus(`Sample loaded — ${lettersOnly(SAMPLE).length} letters, enough for the statistics to bite.`, "idle");
  });

  document.addEventListener("keydown", (evt) => {
    const target = evt.target && evt.target.id;
    if (target === "input" || target === "output") return;
    const key = evt.key.toLowerCase();
    if (key === "e") encrypt();
    else if (key === "d") decrypt();
    else if (key === "b") breakCipher();
    else if (key === "r") el("sample").dispatch("click");
  });

  /* ------------------------------------------------------------- main loop */

  function loop() {
    state.frame++;
    draw();
    requestAnimationFrame(loop);
  }

  window.__lab = {
    state,
    caesar,
    vigenere,
    atbash,
    railFence,
    apply,
    indexOfCoincidence,
    chiSquared,
    bestCaesarShift,
    keyLengthGuess,
    averageIC,
    coincidenceAt,
    crackVigenere,
    encrypt,
    decrypt,
    breakCipher,
    setCipher,
    entropyOf,
    SAMPLE,
    ENGLISH,
    VIGENERE_KEYS,
  };

  updateReadouts();
  draw();
  requestAnimationFrame(loop);
})();
