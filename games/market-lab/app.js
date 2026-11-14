(() => {
  "use strict";

  // Linear supply and demand with exact geometry. Everything is analytic:
  //   demand  P = a − b·Q
  //   supply  P = c + b·Q        (same slope, so the algebra stays readable)
  // The lab computes equilibrium, price controls, a unit tax and a
  // single-price monopoly from the same two curves, then shades the surpluses.

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");

  const W = canvas.width || 860;
  const H = canvas.height || 680;

  const PLOT_X = 76;
  const PLOT_Y = 52;
  const PLOT_W = 520;
  const PLOT_H = 452;

  const INFO_X = 620;
  const INFO_Y = 52;
  const INFO_W = 208;
  const INFO_H = 452;

  const QMAX = 110;
  const PMAX = 165;

  const state = {
    a: 100,
    c: 0,
    b: 1,
    mode: "none",
    control: 0,
    pin: 50,
    frame: 0,
  };

  /* --------------------------------------------------------------- maths */

  function freeEquilibrium() {
    // a − b·Q = c + b·Q  →  Q = (a − c) / (2b)
    const q = (state.a - state.c) / (2 * state.b);
    return { q, p: state.a - state.b * q };
  }

  function taxCase(t) {
    const eq = freeEquilibrium();
    const q = Math.max(0, eq.q - t / (2 * state.b));
    const pBuyer = state.a - state.b * q;
    const pSeller = pBuyer - t;
    return { q, pBuyer, pSeller, t };
  }

  function monopolyCase() {
    // Demand P = a − bQ, cost MC = c + bQ. Revenue P·Q = aQ − bQ²,
    // marginal revenue a − 2bQ. Setting MR = MC gives Q = (a − c)/(4b).
    const q = Math.max(0, (state.a - state.c) / (4 * state.b));
    const price = state.a - state.b * q;
    return { q, price, mc: state.c + state.b * q };
  }

  function controlCase() {
    const eq = freeEquilibrium();
    const pin = state.pin;
    const qd = Math.max(0, (state.a - pin) / state.b);
    const qs = Math.max(0, (pin - state.c) / state.b);
    const kind = pin > eq.p + 0.01 ? "floor" : pin < eq.p - 0.01 ? "ceiling" : "none";
    // With a control in place the traded quantity is the short side.
    return { kind, price: pin, qd, qs, q: Math.min(qd, qs) };
  }

  function surplus(q, pricePaid, priceReceived) {
    // Triangle areas against the curves, clipped at the traded quantity.
    const demAt = (x) => state.a - state.b * x;
    const supAt = (x) => state.c + state.b * x;
    const cs = Math.max(0, 0.5 * (demAt(0) - pricePaid + (demAt(q) - pricePaid)) * q);
    const ps = Math.max(0, 0.5 * (priceReceived - supAt(0) + (priceReceived - supAt(q))) * q);
    return { cs, ps };
  }

  function scenario() {
    const eq = freeEquilibrium();
    const maxWelfare = surplus(eq.q, eq.p, eq.p);
    const base = {
      eq,
      price: eq.p,
      qty: eq.q,
      cs: maxWelfare.cs,
      ps: maxWelfare.ps,
      dwl: 0,
      revenue: 0,
      label: "free market",
      wedge: null,
    };

    if (state.mode === "tax" && state.control > 0) {
      const t = taxCase(state.control);
      const s = surplus(t.q, t.pBuyer, t.pSeller);
      const revenue = t.q * t.t;
      const total = s.cs + s.ps + revenue;
      return {
        ...base,
        price: t.pBuyer,
        sellerPrice: t.pSeller,
        qty: t.q,
        cs: s.cs,
        ps: s.ps,
        revenue,
        dwl: Math.max(0, maxWelfare.cs + maxWelfare.ps - total),
        label: "unit tax",
        wedge: { from: t.pSeller, to: t.pBuyer },
      };
    }

    if (state.mode === "price") {
      const c = controlCase();
      const traded = c.q;
      const paid = c.price;
      const s = surplus(traded, paid, paid);
      const total = s.cs + s.ps;
      return {
        ...base,
        price: c.price,
        qty: traded,
        cs: s.cs,
        ps: s.ps,
        dwl: Math.max(0, maxWelfare.cs + maxWelfare.ps - total),
        label: c.kind === "floor" ? "price floor" : "price ceiling",
        wedge: { from: paid, to: paid },
      };
    }

    if (state.mode === "monopoly") {
      const m = monopolyCase();
      // The seller keeps everything between the price and its cost curve, so
      // producer surplus is the profit rectangle plus the triangle above MC.
      const s = surplus(m.q, m.price, m.price);
      const total = s.cs + s.ps;
      return {
        ...base,
        price: m.price,
        qty: m.q,
        cs: s.cs,
        ps: s.ps,
        dwl: Math.max(0, maxWelfare.cs + maxWelfare.ps - total),
        label: "monopoly",
        wedge: { from: m.mc, to: m.price },
      };
    }

    return base;
  }

  function elasticity(sc) {
    // Point elasticity of demand at the observed price and quantity.
    if (!sc.qty) return Infinity;
    return (sc.price / sc.qty) / state.b;
  }

  /* ------------------------------------------------------------ readouts */

  function money(v) {
    return Math.round(v).toLocaleString("en-US");
  }

  function setStatus(text, kind) {
    const box = el("status");
    box.textContent = text;
    box.className = "status" + (kind ? " " + kind : "");
  }

  function updateReadouts() {
    const sc = scenario();
    el("price-read").textContent = money(sc.price);
    el("qty-read").textContent = money(sc.qty);
    el("cs-read").textContent = money(sc.cs);
    el("ps-read").textContent = money(sc.ps);
    el("dwl-read").textContent = money(sc.dwl);
    el("rev-read").textContent = money(sc.revenue || 0);
    const e = elasticity(sc);
    el("elast-read").textContent = isFinite(e) ? e.toFixed(2) : "∞";
    const welfare = sc.cs + sc.ps + (sc.revenue || 0);
    el("wel-read").textContent = money(welfare);
    el("p-hud").textContent = "P* = " + money(sc.eq.p);
    el("q-hud").textContent = "Q* = " + money(sc.eq.q);
    el("welfare-hud").textContent = "welfare " + money(welfare);
    el("a-out").textContent = String(state.a);
    el("c-out").textContent = String(state.c);
    el("slope-out").textContent = state.b.toFixed(2);
    el("ctrl-out").textContent = String(state.control);
    el("pin-out").textContent = state.mode === "price" ? String(state.pin) : "P*";
    return sc;
  }

  function describe() {
    const sc = scenario();
    const welfare = sc.cs + sc.ps + (sc.revenue || 0);
    if (sc.label === "free market") {
      setStatus(
        `Free market: P = ${money(sc.price)}, Q = ${money(
          sc.qty
        )}, no deadweight loss. Consumer surplus ${money(sc.cs)}, producer surplus ${money(sc.ps)}.`,
        "idle"
      );
      return;
    }
    if (sc.label === "unit tax") {
      setStatus(
        `A ${state.control}-unit tax drives the buyer price to ${money(sc.price)} and the seller keeps ${money(
          sc.sellerPrice
        )}. Quantity falls to ${money(sc.qty)}, revenue is ${money(sc.revenue)}, and ${money(
          sc.dwl
        )} of surplus disappears — trades that would have helped both sides now do not happen.`,
        "warn"
      );
      return;
    }
    if (sc.label === "price floor") {
      setStatus(
        `Price floor at ${money(sc.price)}: demand falls to ${money(sc.qty)}, supply would be ${money(
          controlCase().qs
        )}. The surplus above the floor is unsold, and ${money(sc.dwl)} of welfare is lost.`,
        "warn"
      );
      return;
    }
    if (sc.label === "price ceiling") {
      setStatus(
        `Price ceiling at ${money(sc.price)}: sellers offer only ${money(sc.qty)}, so the market clears at the short side and ${money(
          sc.dwl
        )} of surplus is destroyed.`,
        "warn"
      );
      return;
    }
    if (sc.label === "monopoly") {
      setStatus(
        `A single seller restricts output to ${money(sc.qty)} and charges ${money(sc.price)} — above the ${money(
          freeEquilibrium().p
        )} the market would clear at. Welfare ${money(welfare)} against ${money(
          surplus(freeEquilibrium().q, freeEquilibrium().p, freeEquilibrium().p).cs +
            surplus(freeEquilibrium().q, freeEquilibrium().p, freeEquilibrium().p).ps
        )} under competition.`,
        "warn"
      );
      return;
    }
    setStatus("Adjust the curves or pick an intervention to see its effect on price, quantity and surplus.", "idle");
  }

  /* -------------------------------------------------------------- drawing */

  function px(q) {
    return PLOT_X + (q / QMAX) * PLOT_W;
  }

  function py(p) {
    return PLOT_Y + PLOT_H - (Math.max(0, Math.min(PMAX, p)) / PMAX) * PLOT_H;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#060a0b";
    ctx.fillRect(0, 0, W, H);

    drawGrid();
    drawSurpluses();
    drawCurves();
    drawInfo();

    ctx.fillStyle = "#6f8688";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(`demand P = ${state.a} − ${state.b.toFixed(1)}Q · supply P = ${state.c} + ${state.b.toFixed(1)}Q`, 24, H - 16);
    ctx.textAlign = "right";
    ctx.fillText("areas computed from the curves, not drawn by eye", W - 24, H - 16);
    ctx.textAlign = "left";
  }

  function drawGrid() {
    ctx.fillStyle = "#080d0e";
    ctx.fillRect(PLOT_X, PLOT_Y, PLOT_W, PLOT_H);

    ctx.strokeStyle = "#1b2729";
    ctx.lineWidth = 1;
    for (let p = 0; p <= PMAX; p += 25) {
      const y = py(p);
      ctx.beginPath();
      ctx.moveTo(PLOT_X, y + 0.5);
      ctx.lineTo(PLOT_X + PLOT_W, y + 0.5);
      ctx.stroke();
      ctx.fillStyle = "#5f7779";
      ctx.font = "10px ui-monospace, Menlo, monospace";
      ctx.textAlign = "right";
      ctx.fillText(String(p), PLOT_X - 8, y + 3);
    }
    for (let q = 0; q <= QMAX; q += 20) {
      const x = px(q);
      ctx.beginPath();
      ctx.moveTo(x + 0.5, PLOT_Y);
      ctx.lineTo(x + 0.5, PLOT_Y + PLOT_H);
      ctx.stroke();
      ctx.fillStyle = "#5f7779";
      ctx.textAlign = "center";
      ctx.fillText(String(q), x, PLOT_Y + PLOT_H + 16);
    }

    ctx.fillStyle = "#7d9597";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "center";
    ctx.fillText("quantity", PLOT_X + PLOT_W / 2, PLOT_Y + PLOT_H + 36);
    ctx.save();
    ctx.translate(24, PLOT_Y + PLOT_H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("price", 0, 0);
    ctx.restore();
    ctx.textAlign = "left";
  }

  function drawSurpluses() {
    const sc = scenario();
    const q = sc.qty;
    if (q <= 0) return;

    const pAt = (qq) => state.a - state.b * qq;
    const sAt = (qq) => state.c + state.b * qq;

    // Consumer surplus: above the price line, below demand.
    ctx.fillStyle = "rgba(95, 184, 255, 0.22)";
    ctx.beginPath();
    ctx.moveTo(px(0), py(pAt(0)));
    ctx.lineTo(px(q), py(pAt(q)));
    ctx.lineTo(px(q), py(sc.price));
    ctx.lineTo(px(0), py(sc.price));
    ctx.closePath();
    ctx.fill();

    // Producer surplus: below the price line, above supply.
    const sellerPrice = sc.sellerPrice !== undefined ? sc.sellerPrice : sc.price;
    ctx.fillStyle = "rgba(255, 207, 122, 0.22)";
    ctx.beginPath();
    ctx.moveTo(px(0), py(sellerPrice));
    ctx.lineTo(px(q), py(sellerPrice));
    ctx.lineTo(px(q), py(sAt(q)));
    ctx.lineTo(px(0), py(sAt(0)));
    ctx.closePath();
    ctx.fill();

    // Tax revenue rectangle.
    if (sc.revenue > 0) {
      ctx.fillStyle = "rgba(178, 141, 255, 0.26)";
      ctx.fillRect(px(0), py(sc.wedge.to), px(q), py(sc.wedge.from) - py(sc.wedge.to));
    }

    // Deadweight loss: the triangle between the curves beyond the traded quantity.
    const eq = freeEquilibrium();
    if (sc.dwl > 0.5 && q < eq.q) {
      ctx.fillStyle = "rgba(255, 107, 134, 0.32)";
      ctx.beginPath();
      ctx.moveTo(px(q), py(pAt(q)));
      ctx.lineTo(px(eq.q), py(eq.p));
      ctx.lineTo(px(q), py(sAt(q)));
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 107, 134, 0.7)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
  }

  function drawCurves() {
    const sc = scenario();
    const eq = freeEquilibrium();

    // Demand.
    ctx.strokeStyle = "#5fb8ff";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(px(0), py(state.a));
    ctx.lineTo(px(QMAX), py(Math.max(0, state.a - state.b * QMAX)));
    ctx.stroke();

    // Supply.
    ctx.strokeStyle = "#ffcf7a";
    ctx.beginPath();
    ctx.moveTo(px(0), py(state.c));
    ctx.lineTo(px(QMAX), py(state.c + state.b * QMAX));
    ctx.stroke();

    // Equilibrium marker.
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "rgba(236, 244, 244, 0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px(0), py(eq.p));
    ctx.lineTo(px(eq.q), py(eq.p));
    ctx.lineTo(px(eq.q), py(0));
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.arc(px(eq.q), py(eq.p), 4.5, 0, Math.PI * 2);
    ctx.fillStyle = "#ecf4f4";
    ctx.fill();

    // Intervention price line.
    if (state.mode === "price" || state.mode === "tax" || state.mode === "monopoly") {
      ctx.strokeStyle = "#7ee0c4";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(px(0), py(sc.price));
      ctx.lineTo(px(sc.qty), py(sc.price));
      ctx.stroke();
      ctx.fillStyle = "#9df3dd";
      ctx.font = "10.5px ui-monospace, Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText(money(sc.price), px(sc.qty) + 6, py(sc.price) + 3);

      if (state.mode === "monopoly") {
        // The seller's cost at the restricted quantity is the floor of its surplus.
        ctx.strokeStyle = "#b28dff";
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(px(0), py(monopolyCase().mc));
        ctx.lineTo(px(sc.qty), py(monopolyCase().mc));
        ctx.stroke();
        ctx.setLineDash([]);
      }
      if (sc.sellerPrice !== undefined) {
        ctx.strokeStyle = "#b28dff";
        ctx.beginPath();
        ctx.moveTo(px(0), py(sc.sellerPrice));
        ctx.lineTo(px(sc.qty), py(sc.sellerPrice));
        ctx.stroke();
        ctx.fillStyle = "#c8b0ff";
        ctx.fillText(money(sc.sellerPrice), px(sc.qty) + 6, py(sc.sellerPrice) + 3);
      }
    }

    // Monopoly: mark MR and the restricted quantity.
    if (state.mode === "monopoly") {
      ctx.strokeStyle = "rgba(178, 141, 255, 0.75)";
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(px(0), py(state.a));
      ctx.lineTo(px(QMAX), py(Math.max(0, state.a - 2 * state.b * QMAX)));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#b28dff";
      ctx.font = "10.5px ui-monospace, Menlo, monospace";
      ctx.fillText("marginal revenue", px(46), py(state.a - 2 * state.b * 46) + 16);
    }

    // Labels, kept clear of the curves themselves.
    ctx.fillStyle = "#5fb8ff";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.fillText("demand", px(8), py(state.a - state.b * 8) - 10);
    ctx.fillStyle = "#ffcf7a";
    ctx.fillText("supply", px(84), py(state.c + state.b * 84) - 10);
  }

  function drawInfo() {
    const sc = scenario();
    const eq = freeEquilibrium();
    const welfare = sc.cs + sc.ps + (sc.revenue || 0);

    ctx.fillStyle = "#0b1112";
    ctx.fillRect(INFO_X, INFO_Y, INFO_W, INFO_H);
    ctx.strokeStyle = "#243033";
    ctx.strokeRect(INFO_X + 0.5, INFO_Y + 0.5, INFO_W - 1, INFO_H - 1);

    ctx.fillStyle = "#8ba1a3";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("surplus accounting", INFO_X + 14, INFO_Y + 22);

    const rows = [
      ["price", money(sc.price)],
      ["quantity", money(sc.qty)],
      ["consumer", money(sc.cs)],
      ["producer", money(sc.ps)],
      ["tax revenue", money(sc.revenue || 0)],
      ["deadweight", money(sc.dwl)],
      ["welfare", money(welfare)],
    ];
    rows.forEach((row, i) => {
      const y = INFO_Y + 52 + i * 26;
      ctx.fillStyle = "#7f9597";
      ctx.font = "11px 'Inter', system-ui, sans-serif";
      ctx.fillText(row[0], INFO_X + 14, y);
      ctx.fillStyle = i === 5 && sc.dwl > 0.5 ? "#ff9cae" : i === 6 ? "#9df3dd" : "#e8f2f2";
      ctx.font = "600 12px ui-monospace, Menlo, monospace";
      ctx.textAlign = "right";
      ctx.fillText(row[1], INFO_X + INFO_W - 14, y);
      ctx.textAlign = "left";
    });

    // Welfare bar.
    const barY = INFO_Y + 250;
    const barW = INFO_W - 28;
    const total = Math.max(1, sc.cs + sc.ps + (sc.revenue || 0) + sc.dwl);
    const segments = [
      { v: sc.cs, c: "#5fb8ff" },
      { v: sc.ps, c: "#ffcf7a" },
      { v: sc.revenue || 0, c: "#b28dff" },
      { v: sc.dwl, c: "#ff6b86" },
    ];
    let cursor = INFO_X + 14;
    for (const seg of segments) {
      const w = (seg.v / total) * barW;
      if (w <= 0) continue;
      ctx.fillStyle = seg.c;
      ctx.fillRect(cursor, barY, Math.max(1, w), 16);
      cursor += w;
    }
    ctx.strokeStyle = "#0b1112";
    ctx.strokeRect(INFO_X + 14.5, barY + 0.5, barW - 1, 15);

    ctx.fillStyle = "#6f8688";
    ctx.font = "10px ui-monospace, Menlo, monospace";
    ctx.fillText("share of potential welfare", INFO_X + 14, barY + 32);

    const freeWelfare =
      surplus(eq.q, eq.p, eq.p).cs + surplus(eq.q, eq.p, eq.p).ps;
    ctx.fillStyle = "#7f9597";
    ctx.font = "11px 'Inter', system-ui, sans-serif";
    wrap(`Free-market welfare would be ${money(freeWelfare)}; this arrangement delivers ${money(welfare)}.`, INFO_X + 14, barY + 62, INFO_W - 28, 15);

    ctx.fillStyle = "#6f8688";
    ctx.font = "10.5px ui-monospace, Menlo, monospace";
    ctx.fillText("elasticity at the traded point", INFO_X + 14, INFO_Y + INFO_H - 52);
    ctx.fillStyle = "#9df3dd";
    ctx.font = "600 15px ui-monospace, Menlo, monospace";
    const e = elasticity(sc);
    ctx.fillText(isFinite(e) ? e.toFixed(2) : "∞", INFO_X + 14, INFO_Y + INFO_H - 30);
  }

  function wrap(text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    let line = "";
    let cursor = y;
    for (const word of words) {
      const test = line ? line + " " + word : word;
      const width = ctx.measureText ? ctx.measureText(test).width : test.length * 5.4;
      if (width > maxWidth && line) {
        ctx.fillText(line, x, cursor);
        line = word;
        cursor += lineHeight;
      } else line = test;
    }
    if (line) ctx.fillText(line, x, cursor);
  }

  /* ---------------------------------------------------------------- input */

  function setMode(mode) {
    state.mode = mode;
    ["none", "price", "tax", "monopoly"].forEach((key) => el("mode-" + key).classList.toggle("active", key === mode));
    if (mode === "price" && state.pin === 50) {
      // Start the control somewhere interesting: below equilibrium.
      state.pin = Math.round(freeEquilibrium().p * 0.6);
      el("pin").value = String(state.pin);
    }
    updateReadouts();
    describe();
  }

  el("mode-none").addEventListener("click", () => setMode("none"));
  el("mode-price").addEventListener("click", () => setMode("price"));
  el("mode-tax").addEventListener("click", () => setMode("tax"));
  el("mode-monopoly").addEventListener("click", () => setMode("monopoly"));

  el("a").addEventListener("input", (evt) => {
    state.a = Number(evt.target.value) || 100;
    updateReadouts();
    describe();
  });
  el("c").addEventListener("input", (evt) => {
    state.c = Math.max(-40, Math.min(state.a - 10, Number(evt.target.value) || 0));
    updateReadouts();
    describe();
  });
  el("slope").addEventListener("input", (evt) => {
    state.b = Math.max(0.05, Number(evt.target.value) || 1);
    updateReadouts();
    describe();
  });
  el("ctrl").addEventListener("input", (evt) => {
    state.control = Math.max(0, Number(evt.target.value) || 0);
    updateReadouts();
    describe();
  });
  el("pin").addEventListener("input", (evt) => {
    state.pin = Math.max(0, Number(evt.target.value) || 0);
    if (state.mode !== "price") setMode("price");
    else {
      updateReadouts();
      describe();
    }
  });

  el("reset").addEventListener("click", () => {
    state.a = 100;
    state.c = 0;
    state.b = 1;
    state.control = 0;
    state.pin = 50;
    el("a").value = "100";
    el("c").value = "0";
    el("slope").value = "1";
    el("ctrl").value = "0";
    el("pin").value = "50";
    setMode("none");
    setStatus("Free market: price 50, quantity 50, no deadweight loss. Every mutually beneficial trade happens.", "idle");
  });

  el("shock").addEventListener("click", () => {
    state.a = Math.min(160, state.a + 25);
    el("a").value = String(state.a);
    updateReadouts();
    describe();
    setStatus(
      `Demand shifted out to an intercept of ${state.a}: buyers now clear at ${money(
        freeEquilibrium().p
      )} and ${money(freeEquilibrium().q)} units. Both surpluses grew — nothing was destroyed, it moved.`,
      "good"
    );
  });

  document.addEventListener("keydown", (evt) => {
    const key = evt.key;
    if (key === " ") {
      evt.preventDefault();
      const order = ["none", "price", "tax", "monopoly"];
      setMode(order[(order.indexOf(state.mode) + 1) % order.length]);
    } else if (key === "r" || key === "R") {
      el("reset").dispatch("click");
    } else if (key === "s" || key === "S") {
      el("shock").dispatch("click");
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
    freeEquilibrium,
    taxCase,
    monopolyCase,
    controlCase,
    surplus,
    scenario,
    elasticity,
    setMode,
    updateReadouts,
    describe,
  };

  updateReadouts();
  describe();
  draw();
  requestAnimationFrame(loop);
})();
