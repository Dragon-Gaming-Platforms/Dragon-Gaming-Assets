(() => {
  "use strict";

  // Word-level Markov chain. The corpus is original prose written for this
  // lab. Training counts, for every context of `order` words, how often each
  // word follows it. Generation samples the next word from the (temperature-
  // adjusted) distribution. The heatmap shows the order-1 transition matrix.

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");

  const W = canvas.width || 880;
  const H = canvas.height || 660;

  const STAGE = { x: 26, y: 50, w: 828, h: 560 };

  const CORPUS = [
    "the morning train crossed the valley while mist still clung to the river and the fields below glowed green in the first light of day",
    "a good soup begins with patience and ends with salt and the cook tastes it twice before the guests arrive at the table",
    "the garden needs water in the dry weeks and the tomatoes ripen slowly under a sky that rarely clouds over the hill",
    "when the wind rises over the harbour the boats knock against the pier and the gulls cry above the dark water",
    "she kept the old letters in a wooden box beneath the stairs and read them again each winter when the nights grew long",
    "the market opens at dawn and the farmers arrange their cheese and bread and flowers along the narrow stone street",
    "he repaired the clock with a bent pin and a drop of oil and it ticked again as if nothing had ever been wrong",
    "the library smelled of paper and dust and the librarian knew every reader by name and by the books they borrowed",
    "a mountain path climbs through pine forest to a lake where the water is cold enough to make the swimmers gasp",
    "the band practised in the hall every thursday and the drummer always arrived late with rain on his coat",
    "they planted the orchard in spring and waited three years for the first apples to sweeten on the branch",
    "the lighthouse keeper logged the weather each night and watched the beam sweep across the black sea",
    "good bread needs a warm oven and a patient hand and the dough must rest before the baker shapes it into loaves",
    "the river floods in march and the old bridge holds while the water rushes brown beneath its stone arches",
    "she taught the children to count the stars and name the planets and find the north star above the roof",
    "the workshop floor was covered in shavings and the carpenter swept them into a pile before lunch",
    "a letter from his brother arrived after ten years and the news inside was both welcome and strange",
    "the bees worked the clover all summer and the honey jars lined the shelf by autumn in neat rows",
    "he walked the coast road at dusk and the tide came in over the rocks where the crabs had hidden",
    "the choir sang in the stone church and the sound rolled down the valley to the houses below",
    "winter sealed the pond with ice and the children skated in circles until their toes went numb",
    "the astronomer pointed the telescope at jupiter and the moons lined up like beads on a wire",
    "she baked a cake for the harvest fair and the judges praised the crumbs and the jam between the layers",
    "the ferry crossed the strait twice a day and the captain knew every passenger by face and by name",
    "a good map shows the roads and the rivers and the hills but it cannot show the weather of the road ahead",
    "the potter shaped the clay on the wheel and the vase rose slowly under his wet and steady hands",
    "they mended the nets by lamplight and talked of the fish they had caught and the fish they had lost",
    "the rain drummed on the tin roof all night and by morning the lane ran like a small brown river",
    "he tuned the piano in the school hall and the children listened for the notes that rang true",
    "the forest path was muddy after the storm and the mushrooms pushed up through the leaf litter overnight",
  ].join(" ");

  const state = {
    order: 1,
    temp: 1,
    len: 40,
    seed: 1234,
    showHeat: true,
    model: null, // {counts: Map ctx->Map word->n, vocab: [], contexts: []}
    generated: [],
    logProb: 0,
  };

  /* ------------------------------------------------------------------- random */

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* --------------------------------------------------------------- markov core */

  function tokenize(text) {
    return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
  }

  function buildModel(tokens, order) {
    const counts = new Map();
    const vocabSet = new Set(tokens);
    for (let i = 0; i + order < tokens.length; i++) {
      const ctx = tokens.slice(i, i + order).join(" ");
      const next = tokens[i + order];
      if (!counts.has(ctx)) counts.set(ctx, new Map());
      const m = counts.get(ctx);
      m.set(next, (m.get(next) || 0) + 1);
    }
    return {
      counts,
      vocab: [...vocabSet].sort(),
      contexts: [...counts.keys()].sort(),
      order,
      tokens,
    };
  }

  function probabilities(countMap, temp) {
    // temperature-adjusted distribution: p^(1/T) renormalised
    const entries = [...countMap.entries()];
    const total = entries.reduce((s, [, c]) => s + c, 0);
    const inv = 1 / temp;
    const weights = entries.map(([w, c]) => [w, Math.pow(c / total, inv)]);
    const wsum = weights.reduce((s, [, w]) => s + w, 0);
    return weights.map(([w, wt]) => [w, wt / wsum]);
  }

  function sampleNext(model, context, rng, temp) {
    const countMap = model.counts.get(context);
    if (!countMap) return null;
    const probs = probabilities(countMap, temp);
    let r = rng();
    for (const [w, p] of probs) {
      r -= p;
      if (r <= 0) return { word: w, prob: p };
    }
    const last = probs[probs.length - 1];
    return { word: last[0], prob: last[1] };
  }

  function generate(model, length, rng, temp) {
    const out = [];
    let logP = 0;
    // start from a random context
    let ctxWords = model.contexts[Math.floor(rng() * model.contexts.length)].split(" ");
    out.push(...ctxWords);
    let guard = 0;
    while (out.length < length && guard < length * 20) {
      guard++;
      const ctx = out.slice(-model.order).join(" ");
      const pick = sampleNext(model, ctx, rng, temp);
      if (!pick) {
        // dead end: restart from a random context
        ctxWords = model.contexts[Math.floor(rng() * model.contexts.length)].split(" ");
        out.push(...ctxWords);
        continue;
      }
      out.push(pick.word);
      logP += Math.log(Math.max(1e-12, pick.prob));
    }
    return { words: out.slice(0, length), logProb: out.length ? logP / out.length : 0 };
  }

  function transitionMatrix(model) {
    // order-1 matrix over the most frequent 24 words for the heatmap
    const freq = new Map();
    model.tokens.forEach((w) => freq.set(w, (freq.get(w) || 0) + 1));
    const top = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 24).map(([w]) => w);
    const idx = new Map(top.map((w, i) => [w, i]));
    const mat = top.map(() => new Array(top.length).fill(0));
    for (let i = 0; i + 1 < model.tokens.length; i++) {
      const a = idx.get(model.tokens[i]);
      const b = idx.get(model.tokens[i + 1]);
      if (a !== undefined && b !== undefined) mat[a][b]++;
    }
    // row-normalise
    mat.forEach((row) => {
      const s = row.reduce((a, b) => a + b, 0) || 1;
      for (let j = 0; j < row.length; j++) row[j] /= s;
    });
    return { words: top, mat };
  }

  /* ------------------------------------------------------------------- drawing */

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#070907";
    ctx.fillRect(STAGE.x, STAGE.y, STAGE.w, STAGE.h);

    if (state.showHeat && state.model) {
      const { words, mat } = transitionMatrix(state.model);
      const n = words.length;
      const cell = Math.min(20, (STAGE.w - 90) / n);
      const ox = STAGE.x + 80;
      const oy = STAGE.y + 30;
      ctx.font = "9px ui-monospace, Menlo, monospace";
      ctx.textAlign = "right";
      for (let i = 0; i < n; i++) {
        ctx.fillStyle = "#93a48f";
        ctx.fillText(words[i], ox - 6, oy + i * cell + cell * 0.7);
      }
      ctx.textAlign = "center";
      for (let j = 0; j < n; j++) {
        ctx.save();
        ctx.translate(ox + j * cell + cell / 2, oy + n * cell + 8);
        ctx.rotate(-Math.PI / 4);
        ctx.fillStyle = "#93a48f";
        ctx.fillText(words[j], 0, 0);
        ctx.restore();
      }
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          const p = mat[i][j];
          const g = Math.round(30 + p * 200);
          ctx.fillStyle = "rgb(" + Math.round(p * 155) + "," + g + "," + Math.round(p * 93) + ")";
          ctx.fillRect(ox + j * cell, oy + i * cell, cell - 1, cell - 1);
        }
      }
      ctx.fillStyle = "#93a48f";
      ctx.textAlign = "left";
      ctx.fillText("transition matrix (top " + n + " words, order 1)", STAGE.x + 8, STAGE.y + 16);
    }

    // generated text block
    const ty = state.showHeat ? STAGE.y + 30 + 24 * 20 + 40 : STAGE.y + 30;
    ctx.fillStyle = "#eef5ea";
    ctx.font = "13px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    const text = state.generated.join(" ");
    const maxW = STAGE.w - 20;
    const words = text.split(" ");
    let line = "";
    let ly = ty;
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, STAGE.x + 10, ly);
        ly += 18;
        line = w;
      } else line = test;
    }
    if (line) ctx.fillText(line, STAGE.x + 10, ly);
    ctx.fillStyle = "#93a48f";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.fillText("generated (" + state.generated.length + " words, order " + state.order + ", T=" + state.temp.toFixed(2) + ")", STAGE.x + 8, ty - 14);
  }

  /* ------------------------------------------------------------------ readouts */

  function updateReadouts() {
    const model = state.model;
    if (!model) return;
    let transitions = 0;
    model.counts.forEach((m) => m.forEach((c) => { transitions += c; }));

    el("order-out").textContent = String(state.order);
    el("temp-out").textContent = state.temp.toFixed(2);
    el("len-out").textContent = String(state.len);

    el("vocab-hud").textContent = "vocab " + model.vocab.length;
    el("trans-hud").textContent = "transitions " + transitions;
    el("order-hud").textContent = "order " + state.order;

    el("vocab-read").textContent = String(model.vocab.length);
    el("ctx-read").textContent = String(model.contexts.length);
    el("trans-read").textContent = String(transitions);
    el("logp-read").textContent = state.logProb.toFixed(2);
    el("uniq-read").textContent = String(new Set(state.generated).size);
    el("rep-read").textContent = String(state.generated.length - new Set(state.generated).size);
  }

  function describe() {
    let msg;
    if (state.order === 1) {
      msg = "Order 1 remembers one word, so it rambles — the grammar is local, the meaning is not. Average log-probability " + state.logProb.toFixed(2) + " per word.";
    } else if (state.order === 2) {
      msg = "Order 2 remembers phrases, so the text reads more like the corpus. It still invents — the chain just has a longer memory.";
    } else {
      msg = "Order 3 remembers whole phrases. The text gets fluent but starts copying the corpus verbatim — with a small corpus, long memory means memorisation.";
    }
    if (state.temp > 1.3) msg += " Temperature " + state.temp.toFixed(2) + " flattens the distribution: wilder, stranger text.";
    else if (state.temp < 0.8) msg += " Temperature " + state.temp.toFixed(2) + " sharpens the distribution: safer, more predictable text.";
    el("status").textContent = msg;
  }

  /* -------------------------------------------------------------------- wiring */

  function train() {
    const tokens = tokenize(CORPUS);
    state.model = buildModel(tokens, state.order);
    doGenerate();
  }

  function doGenerate() {
    const rng = mulberry32(state.seed);
    const res = generate(state.model, state.len, rng, state.temp);
    state.generated = res.words;
    state.logProb = res.logProb;
    updateReadouts();
    describe();
    draw();
  }

  function setOrder(n) {
    state.order = Math.max(1, Math.min(3, n));
    el("order").value = String(state.order);
    ["order1", "order2", "order3"].forEach((kk) => {
      el("preset-" + kk).classList.toggle("active", "order" + state.order === kk);
    });
    train();
  }

  el("order").addEventListener("input", (evt) => {
    setOrder(Number(evt.target.value) || 1);
  });
  el("temp").addEventListener("input", (evt) => {
    state.temp = Math.max(0.5, Math.min(2, Number(evt.target.value) || 1));
    doGenerate();
  });
  el("len").addEventListener("input", (evt) => {
    state.len = Math.max(10, Math.min(100, Number(evt.target.value) || 40));
    doGenerate();
  });

  el("preset-order1").addEventListener("click", () => setOrder(1));
  el("preset-order2").addEventListener("click", () => setOrder(2));
  el("preset-order3").addEventListener("click", () => setOrder(3));

  el("btn-generate").addEventListener("click", () => {
    state.seed = (state.seed * 1103515245 + 12345) >>> 0;
    doGenerate();
  });
  el("btn-retrain").addEventListener("click", () => {
    state.seed = (state.seed * 1103515245 + 12345) >>> 0;
    train();
  });
  el("toggle-heat").addEventListener("click", () => {
    state.showHeat = !state.showHeat;
    el("toggle-heat").classList.toggle("active", state.showHeat);
    draw();
  });

  document.addEventListener("keydown", (evt) => {
    if (evt.key === "1") setOrder(1);
    else if (evt.key === "2") setOrder(2);
    else if (evt.key === "3") setOrder(3);
    else if (evt.key === "g" || evt.key === "G") el("btn-generate").click();
    else if (evt.key === "r" || evt.key === "R") el("btn-retrain").click();
  });

  window.__lab = {
    state,
    CORPUS,
    tokenize,
    buildModel,
    probabilities,
    sampleNext,
    generate,
    transitionMatrix,
    setOrder,
    train,
    doGenerate,
    updateReadouts,
    describe,
    draw,
  };

  train();
})();
