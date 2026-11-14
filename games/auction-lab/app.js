(() => {
  "use strict";

  // Three auction formats over the same independent private values.
  //
  //   first price — sealed bids, highest bid wins and pays its own bid.
  //                 The symmetric equilibrium with values U[0,100] is
  //                 b(v) = v (n-1)/n; the shading slider scales that guess.
  //   second price— highest bid wins and pays the second-highest bid. Bidding
  //                 your value is weakly dominant, so shading is ignored.
  //   English     — an ascending clock; with independent values it ends at the
  //                 second-highest value, exactly like Vickrey.
  //
  // Revenue is averaged over thousands of draws and compared with the analytic
  // expectation, so the equivalence theorem is demonstrated and not asserted.

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");

  const W = canvas.width || 880;
  const H = canvas.height || 660;

  const BARS = { x: 26, y: 58, w: 500, h: 250 };
  const CARD = { x: 540, y: 58, w: 314, h: 250 };
  const CHART = { x: 26, y: 352, w: 500, h: 262 };
  const TABLE = { x: 540, y: 352, w: 314, h: 262 };

  const COLOURS = { first: "#6ff0c8", second: "#8fb3ff", clock: "#d59bff" };
  const FORMATS = {
    first: { name: "First price", note: "pay your bid" },
    second: { name: "Second price", note: "pay the runner-up" },
    clock: { name: "English clock", note: "stops at the second value" },
  };

  const state = {
    bidders: 5,
    shade: 100,
    reserve: 0,
    format: "first",
    values: [],
    drawn: 0,
    sample: null,
    averages: { first: 0, second: 0, clock: 0 },
    statusKind: "",
  };

  /* ---------------------------------------------------------------- random */

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

  function drawValues(n) {
    const rand = seeded(((state.drawn + 1) * 2654435761) >>> 0);
    const values = [];
    for (let i = 0; i < n; i++) values.push(Math.round(rand() * 100));
    return values;
  }

  /* ----------------------------------------------------------- the formats */

  // First-price equilibrium bid for value v with n bidders and values U[0,100].
  function equilibriumBid(v, n) {
    return (v * (n - 1)) / n;
  }

  function firstPriceBid(v, n) {
    const eq = equilibriumBid(v, n);
    return eq * (state.shade / 100);
  }

  function runAuction(values, format) {
    const n = values.length;
    const reserve = state.reserve;
    const bids = values.map((v) => (format === "first" ? firstPriceBid(v, n) : v));
    const order = values
      .map((v, i) => ({ v, i, bid: bids[i] }))
      .sort((a, b) => b.bid - a.bid || b.v - a.v);
    const top = order[0];
    const second = order[1] || { bid: reserve, v: 0 };

    let price;
    if (format === "first") price = top.bid;
    else if (format === "second") price = Math.max(reserve, second.bid);
    else price = Math.max(reserve, second.v);

    // A reserve above the winning bid means the seller keeps the lot.
    if (top.bid < reserve || (format !== "first" && top.v < reserve)) {
      return { sold: false, price: 0, winner: -1, bids, revenue: 0, value: 0 };
    }

    return {
      sold: true,
      price,
      winner: top.i,
      winningBid: top.bid,
      bids,
      revenue: price,
      value: top.v,
    };
  }

  function simulate(n, format, trials) {
    // Averages over independent draws; the seed depends on the format so the
    // three formats see the same value profiles and the comparison is paired.
    const rand = seeded(0x5eed1234);
    let total = 0;
    let sold = 0;
    for (let t = 0; t < trials; t++) {
      const values = [];
      for (let i = 0; i < n; i++) values.push(rand() * 100);
      const result = runAuction(values, format);
      if (result.sold) {
        total += result.revenue;
        sold++;
      }
    }
    return { mean: sold ? total / trials : 0, sold: sold / trials };
  }

  // Analytic expected revenue for U[0,100] values with no reserve:
  //   E[second-highest value] = 100 (n-1)/(n+1)
  // and the first-price equilibrium collects exactly the same in expectation.
  function theoryRevenue(n) {
    return (100 * (n - 1)) / (n + 1);
  }

  function recompute(reseed) {
    if (reseed) {
      state.drawn++;
      state.values = drawValues(state.bidders);
    }
    state.sample = runAuction(state.values, state.format);
    updateReadouts();
    describe();
    draw();
  }

  function runSample() {
    const trials = 2000;
    ["first", "second", "clock"].forEach((format) => {
      state.averages[format] = simulate(state.bidders, format, trials).mean;
    });
    state.trials = trials;
    updateReadouts();
    describe();
    draw();
  }

  /* -------------------------------------------------------------- readouts */

  function setStatus(text, kind) {
    const box = el("status");
    box.textContent = text;
    box.className = "status" + (kind ? " " + kind : "");
    state.statusKind = kind || "";
  }

  function updateReadouts() {
    const sample = state.sample;
    const theory = theoryRevenue(state.bidders);
    el("bidders-out").textContent = String(state.bidders);
    el("shade-out").textContent =
      state.shade === 100 ? "equilibrium" : state.shade === 0 ? "bid value" : state.shade + "% of it";
    el("reserve-out").textContent = String(state.reserve);

    el("value-read").textContent = sample.winner >= 0 ? String(sample.value) : "—";
    el("bid-read").textContent = sample.winner >= 0 ? sample.winningBid.toFixed(1) : "—";
    el("price-read").textContent = sample.sold ? sample.price.toFixed(1) : "passed in";
    el("surplus-read").textContent = sample.sold
      ? (sample.value - sample.price).toFixed(1)
      : "—";
    el("mean-read").textContent = state.trials
      ? state.averages[state.format].toFixed(2)
      : "run 2,000";
    el("theory-read").textContent = theory.toFixed(2);

    el("winner-hud").textContent =
      sample.winner >= 0 ? "winner bidder " + (sample.winner + 1) : "no sale";
    el("price-hud").textContent = sample.sold ? "price " + sample.price.toFixed(1) : "passed in";
    el("revenue-hud").textContent = state.trials
      ? "mean " + state.averages[state.format].toFixed(2)
      : "revenue —";
  }

  function describe() {
    const sample = state.sample;
    const n = state.bidders;
    const format = FORMATS[state.format];
    const theory = theoryRevenue(n);

    if (!sample.sold) {
      setStatus(
        `Nobody clears the ${state.reserve} reserve, so the lot goes unsold. The reserve raises revenue per sale but lowers the chance of a sale — ` +
          `with ${n} bidders and values uniform on 0–100 the probability that the top value clears it is about ${(
            100 *
            (1 - Math.pow(state.reserve / 100, n))
          ).toFixed(0)}%.`,
        "warn"
      );
      return;
    }

    let note;
    if (state.format === "first") {
      note =
        state.shade === 100
          ? `Shading is at the symmetric equilibrium b(v) = v·(n−1)/n, which with ${n} bidders means bidding ${(
              (100 * (n - 1)) / n
            ).toFixed(0)}% of value.`
          : `Bids are scaled to ${state.shade}% of the equilibrium amount, so the seller collects ${
              sample.price.toFixed(1)
            } where the equilibrium would have collected ${equilibriumBid(sample.value, n).toFixed(1)}.`;
    } else if (state.format === "second") {
      note = "Bidding your value is weakly dominant here, so the shading slider does not move the price at all.";
    } else {
      note = "The clock rises past every value except the top one and stops at the runner-up's value, which is the same number Vickrey would charge.";
    }

    const measure = state.trials
      ? ` Over ${state.trials.toLocaleString("en-US")} auctions the mean revenue is ${state.averages[
          state.format
        ].toFixed(2)} against the theoretical ${theory.toFixed(2)}.`
      : "";

    setStatus(
      `Bidder ${sample.winner + 1} wins with a value of ${sample.value} and pays ${sample.price.toFixed(
        1
      )}, keeping a surplus of ${(sample.value - sample.price).toFixed(1)}. ${note}${measure}`,
      "good"
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

  function drawBars() {
    panel(BARS, "one auction", FORMATS[state.format].name.toLowerCase());
    const n = state.values.length;
    const left = BARS.x + 40;
    const right = BARS.x + BARS.w - 18;
    const top = BARS.y + 26;
    const bottom = BARS.y + BARS.h - 34;
    const slot = (right - left) / n;
    const barW = Math.min(30, slot * 0.5);
    const Y = (v) => bottom - (v / 100) * (bottom - top);

    ctx.strokeStyle = "#16222b";
    ctx.fillStyle = "#4e6272";
    ctx.font = "9px ui-monospace, Menlo, monospace";
    for (let v = 0; v <= 100; v += 25) {
      const y = Y(v);
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
      ctx.stroke();
      ctx.textAlign = "right";
      ctx.fillText(String(v), left - 6, y + 3);
    }

    state.values.forEach((value, i) => {
      const cx = left + slot * i + slot / 2;
      const bid =
        state.format === "first" ? firstPriceBid(value, n) : state.format === "second" ? value : value;
      const colour = COLOURS[state.format];
      const winner = state.sample && state.sample.winner === i;

      // value column (pale)
      ctx.fillStyle = "rgba(255,180,95,0.28)";
      ctx.fillRect(cx - barW, Y(value), barW, Y(0) - Y(value));
      // bid column (bright)
      ctx.fillStyle = colour;
      ctx.globalAlpha = winner ? 0.95 : 0.55;
      ctx.fillRect(cx, Y(bid), barW, Y(0) - Y(bid));
      ctx.globalAlpha = 1;

      if (winner) {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.4;
        ctx.strokeRect(cx - barW - 2, Y(value) - 2, barW * 2 + 4, Y(0) - Y(value) + 4);
        ctx.lineWidth = 1;
      }

      ctx.fillStyle = winner ? "#ffffff" : "#6f8493";
      ctx.font = "9.5px ui-monospace, Menlo, monospace";
      ctx.textAlign = "center";
      ctx.fillText("B" + (i + 1), cx, bottom + 14);
      ctx.fillStyle = "#93a8b7";
      ctx.font = "8.5px ui-monospace, Menlo, monospace";
      ctx.fillText(String(value), cx - barW / 2, bottom + 26);
      ctx.fillStyle = colour;
      ctx.fillText(bid.toFixed(0), cx + barW / 2, bottom + 26);
    });

    // reserve line
    if (state.reserve > 0) {
      const y = Y(state.reserve);
      ctx.strokeStyle = "#ff7b7b";
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#ff9f9f";
      ctx.font = "9px ui-monospace, Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("reserve " + state.reserve, left + 4, y - 5);
    }
  }

  function drawCard() {
    panel(CARD, "this auction", state.format === "first" ? "pays own bid" : "pays the runner-up");
    const s = state.sample;
    const rows = [
      ["bidders", String(state.bidders)],
      ["format", FORMATS[state.format].name],
      ["winner", s.winner >= 0 ? "B" + (s.winner + 1) : "none"],
      ["value", s.winner >= 0 ? String(s.value) : "—"],
      ["winning bid", s.winner >= 0 ? s.winningBid.toFixed(1) : "—"],
      ["price", s.sold ? s.price.toFixed(1) : "passed in"],
      ["surplus", s.sold ? (s.value - s.price).toFixed(1) : "—"],
      ["seller revenue", s.sold ? s.price.toFixed(1) : "0"],
    ];
    rows.forEach((row, i) => {
      const y = CARD.y + 26 + i * 26;
      ctx.fillStyle = "#6f8493";
      ctx.font = "9.5px ui-monospace, Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText(row[0], CARD.x + 12, y);
      ctx.fillStyle = "#e2eef4";
      ctx.textAlign = "right";
      ctx.fillText(row[1], CARD.x + CARD.w - 12, y);
    });
  }

  function drawChart() {
    panel(CHART, "mean revenue by format", state.trials ? state.trials + " auctions" : "press Run 2,000");
    const left = CHART.x + 44;
    const right = CHART.x + CHART.w - 20;
    const top = CHART.y + 24;
    const bottom = CHART.y + CHART.h - 46;
    const max = 100;
    const Y = (v) => bottom - (v / max) * (bottom - top);
    const theory = theoryRevenue(state.bidders);

    ctx.strokeStyle = "#16222b";
    ctx.fillStyle = "#4e6272";
    ctx.font = "9px ui-monospace, Menlo, monospace";
    for (let v = 0; v <= 100; v += 25) {
      const y = Y(v);
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
      ctx.stroke();
      ctx.textAlign = "right";
      ctx.fillText(String(v), left - 6, y + 3);
    }

    const keys = ["first", "second", "clock"];
    const width = (right - left) / keys.length;
    const live = state.trials;
    keys.forEach((key, i) => {
      const value = live ? state.averages[key] : 0;
      const cx = left + width * i + width / 2;
      const w = Math.min(70, width * 0.55);
      if (live) {
        ctx.fillStyle = COLOURS[key];
        ctx.globalAlpha = state.format === key ? 0.9 : 0.5;
        ctx.fillRect(cx - w / 2, Y(value), w, Y(0) - Y(value));
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#eaf2f7";
        ctx.font = "10px ui-monospace, Menlo, monospace";
        ctx.textAlign = "center";
        ctx.fillText(value.toFixed(1), cx, Y(value) - 6);
      }
      ctx.fillStyle = "#7e93a2";
      ctx.font = "9.5px ui-monospace, Menlo, monospace";
      ctx.textAlign = "center";
      ctx.fillText(FORMATS[key].name, cx, bottom + 14);
      ctx.fillStyle = "#55697a";
      ctx.font = "8.5px ui-monospace, Menlo, monospace";
      ctx.fillText(FORMATS[key].note, cx, bottom + 26);
    });

    // theory line
    const ty = Y(theory);
    ctx.strokeStyle = "#ffcf7a";
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.moveTo(left, ty);
    ctx.lineTo(right, ty);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#ffcf7a";
    ctx.font = "9px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("dashed line: theory " + theory.toFixed(1) + " per sale", left + 4, top + 10);
  }

  function drawTable() {
    panel(TABLE, "revenue vs bidders", "measured, 2,000 each");
    const left = TABLE.x + 36;
    const right = TABLE.x + TABLE.w - 14;
    const top = TABLE.y + 24;
    const bottom = TABLE.y + TABLE.h - 30;
    const X = (n) => left + ((n - 2) / 10) * (right - left);
    const Y = (v) => bottom - (v / 100) * (bottom - top);

    ctx.strokeStyle = "#16222b";
    ctx.fillStyle = "#4e6272";
    ctx.font = "8.5px ui-monospace, Menlo, monospace";
    for (let v = 0; v <= 100; v += 25) {
      const y = Y(v);
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
      ctx.stroke();
      ctx.textAlign = "right";
      ctx.fillText(String(v), left - 5, y + 3);
    }
    for (let n = 2; n <= 12; n += 2) {
      const x = X(n);
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x, bottom);
      ctx.stroke();
      ctx.textAlign = "center";
      ctx.fillText(String(n), x, bottom + 12);
    }

    // theory curve
    ctx.beginPath();
    for (let n = 2; n <= 12; n += 0.25) {
      const x = X(n);
      const y = Y(theoryRevenue(n));
      if (n === 2) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "#ffcf7a";
    ctx.setLineDash([5, 4]);
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineWidth = 1;

    // Measured points for each format. The three curves coincide by revenue
    // equivalence, so they are drawn as lines with different dash patterns and
    // different marker sizes rather than solid strokes that would hide each
    // other.
    if (state.lastCurve) {
      const style = {
        first: { dash: [], size: 2.6 },
        second: { dash: [5, 3], size: 3.4 },
        clock: { dash: [1.5, 3], size: 4.2 },
      };
      Object.keys(COLOURS).forEach((key) => {
        const curve = state.lastCurve[key];
        if (!curve) return;
        ctx.beginPath();
        curve.forEach((point, i) => {
          const x = X(point.n);
          const y = Y(point.mean);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = COLOURS[key];
        ctx.lineWidth = 1.5;
        ctx.setLineDash(style[key].dash);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.lineWidth = 1;
        curve.forEach((point) => {
          ctx.beginPath();
          ctx.arc(X(point.n), Y(point.mean), style[key].size, 0, Math.PI * 2);
          ctx.fillStyle = COLOURS[key];
          ctx.fill();
        });
      });
    }

    // legend for the three measured curves
    const legend = [
      ["first", "first"],
      ["second", "second"],
      ["clock", "clock"],
    ];
    let lx = left + 2;
    ctx.font = "8.5px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    legend.forEach(([key, label]) => {
      ctx.fillStyle = COLOURS[key];
      ctx.beginPath();
      ctx.arc(lx, top + 6, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#6f8493";
      ctx.fillText(label, lx + 6, top + 9);
      lx += ctx.measureText(label).width + 24;
    });
  }

  function buildCurves() {
    const curve = { first: [], second: [], clock: [] };
    for (let n = 2; n <= 12; n++) {
      Object.keys(curve).forEach((format) => {
        const saved = state.bidders;
        state.bidders = n;
        const mean = simulate(n, format, 400).mean;
        state.bidders = saved;
        curve[format].push({ n, mean });
      });
    }
    state.lastCurve = curve;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#070c10";
    ctx.fillRect(0, 0, W, H);
    drawBars();
    drawCard();
    drawChart();
    drawTable();

    ctx.fillStyle = "#6f8493";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(
      `${state.bidders} bidders · ${FORMATS[state.format].name.toLowerCase()} · reserve ${state.reserve} · shading ${state.shade}%`,
      26,
      H - 16
    );
    ctx.textAlign = "right";
    ctx.fillStyle = "#6ff0c8";
    ctx.fillText("independent private values, U[0,100]", W - 26, H - 16);
    ctx.textAlign = "left";
  }

  /* -------------------------------------------------------------- controls */

  function setFormat(format) {
    state.format = format;
    ["first", "second", "clock"].forEach((key) =>
      el("rule-" + key).classList.toggle("active", key === format)
    );
    state.sample = runAuction(state.values, state.format);
    updateReadouts();
    describe();
    draw();
  }

  const point = (evt) => {
    const rect = canvas.getBoundingClientRect();
    return [
      (evt.clientX - rect.left) * (W / (rect.width || W)),
      (evt.clientY - rect.top) * (H / (rect.height || H)),
    ];
  };

  // Drag a value bar to change that bidder's private value.
  let dragging = -1;
  canvas.addEventListener("pointerdown", (evt) => {
    const [x, y] = point(evt);
    const left = BARS.x + 40;
    const right = BARS.x + BARS.w - 18;
    const top = BARS.y + 26;
    const bottom = BARS.y + BARS.h - 34;
    if (x < left || x > right || y < top || y > bottom) return;
    const slot = (right - left) / state.values.length;
    dragging = Math.floor((x - left) / slot);
    const value = Math.max(0, Math.min(100, Math.round(((bottom - y) / (bottom - top)) * 100)));
    state.values[dragging] = value;
    state.sample = runAuction(state.values, state.format);
    updateReadouts();
    describe();
    draw();
  });
  canvas.addEventListener("pointermove", (evt) => {
    if (dragging < 0) return;
    const [x, y] = point(evt);
    const top = BARS.y + 26;
    const bottom = BARS.y + BARS.h - 34;
    const value = Math.max(0, Math.min(100, Math.round(((bottom - y) / (bottom - top)) * 100)));
    state.values[dragging] = value;
    state.sample = runAuction(state.values, state.format);
    updateReadouts();
    describe();
    draw();
  });
  canvas.addEventListener("pointerup", () => {
    dragging = -1;
  });

  el("bidders").addEventListener("input", (evt) => {
    state.bidders = Math.max(2, Math.min(12, Number(evt.target.value) || 5));
    state.values = drawValues(state.bidders);
    state.trials = 0;
    buildCurves();
    recompute(false);
  });
  el("shade").addEventListener("input", (evt) => {
    state.shade = Math.max(0, Math.min(100, Number(evt.target.value) || 0));
    state.trials = 0;
    recompute(false);
  });
  el("reserve").addEventListener("input", (evt) => {
    state.reserve = Math.max(0, Math.min(60, Number(evt.target.value) || 0));
    state.trials = 0;
    recompute(false);
  });

  el("rule-first").addEventListener("click", () => setFormat("first"));
  el("rule-second").addEventListener("click", () => setFormat("second"));
  el("rule-clock").addEventListener("click", () => setFormat("clock"));
  el("redraw").addEventListener("click", () => recompute(true));
  el("run").addEventListener("click", runSample);

  document.addEventListener("keydown", (evt) => {
    if (evt.key === " ") {
      evt.preventDefault();
      recompute(true);
    } else if (evt.key === "r" || evt.key === "R") runSample();
    else if (evt.key === "1") setFormat("first");
    else if (evt.key === "2") setFormat("second");
    else if (evt.key === "3") setFormat("clock");
  });

  window.__lab = {
    state,
    FORMATS,
    drawValues,
    equilibriumBid,
    firstPriceBid,
    runAuction,
    simulate,
    theoryRevenue,
    buildCurves,
    recompute,
    runSample,
    setFormat,
    updateReadouts,
    describe,
    draw,
  };

  state.values = drawValues(state.bidders);
  buildCurves();
  recompute(false);
})();
