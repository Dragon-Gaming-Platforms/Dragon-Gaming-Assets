(() => {
  "use strict";

  // Regular {p, q} tilings of the hyperbolic plane inside the Poincaré disc.
  //
  // One regular p-gon is built with its centre at the origin: its vertices sit
  // at radius tanh(r/2) where cosh r = cot(π/p)·cot(π/q), which is exactly the
  // condition for the interior angle to be 2π/q. The tiling is then generated
  // by reflecting that polygon across its own (hyperbolic) sides: reflection in
  // a geodesic is inversion in the circle that is orthogonal to the unit disc
  // and passes through the two endpoints of the edge. Everything is a Möbius
  // isometry, so tiles stay congruent.

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");
  const SIZE = canvas.width || 680;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const R_PIX = SIZE * 0.47;

  const PALETTES = {
    lagoon: ["#0b4f5c", "#0f6d7a", "#15909a", "#22b4b4", "#4fd6c0", "#a6f2e0"],
    orchid: ["#402a6b", "#5b3a92", "#754cba", "#9166d8", "#b48cf0", "#dcc4ff"],
    moss: ["#2a4f2a", "#386a33", "#4a8740", "#63a650", "#8cc86e", "#c3e8a6"],
    paper: ["#7d6f5b", "#93846c", "#ab9b80", "#c4b496", "#dfd2b7", "#f7efe0"],
  };

  const state = {
    p: 4,
    q: 5,
    depth: 6,
    spin: 0.05,
    zoom: 1,
    rotation: 0,
    palette: "lagoon",
    outline: true,
    fade: true,
    running: true,
    tiles: [],
    bands: [],
    vertexRadius: 0,
    angle: 0,
    lastTime: 0,
    cache: null,
    cacheStamp: ""
  };

  /* ------------------------------------------------------------- geometry */

  function orthoCircle(a, b) {
    // Circle orthogonal to the unit circle through a and b: |O|² = r² + 1.
    const det = a[0] * b[1] - a[1] * b[0];
    if (Math.abs(det) < 1e-9) return null;
    const k1 = (a[0] * a[0] + a[1] * a[1] + 1) / 2;
    const k2 = (b[0] * b[0] + b[1] * b[1] + 1) / 2;
    const ox = (k1 * b[1] - k2 * a[1]) / det;
    const oy = (a[0] * k2 - b[0] * k1) / det;
    const r2 = ox * ox + oy * oy - 1;
    if (r2 <= 1e-12) return null;
    return { x: ox, y: oy, r: Math.sqrt(r2) };
  }

  function reflectPoint(z, circle) {
    if (!circle) return z;
    const dx = z[0] - circle.x;
    const dy = z[1] - circle.y;
    const d2 = dx * dx + dy * dy;
    if (d2 < 1e-14) return z;
    const f = (circle.r * circle.r) / d2;
    return [circle.x + dx * f, circle.y + dy * f];
  }

  function reflectTile(tile, sideIndex) {
    const a = tile.v[sideIndex];
    const b = tile.v[(sideIndex + 1) % tile.v.length];
    const circle = orthoCircle(a, b);
    if (!circle) {
      // Edge through the origin: mirror across the line it spans.
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      const nx = (b[0] - a[0]) / len;
      const ny = (b[1] - a[1]) / len;
      const mirror = (z) => {
        const t = z[0] * nx + z[1] * ny;
        return [2 * t * nx - z[0], 2 * t * ny - z[1]];
      };
      return {
        c: mirror(tile.c),
        v: tile.v.map(mirror),
      };
    }
    return {
      c: reflectPoint(tile.c, circle),
      v: tile.v.map((vertex) => reflectPoint(vertex, circle)),
    };
  }

  function buildTile() {
    const p = state.p;
    const q = state.q;
    const angle = (2 * Math.PI) / q;
    const cot = (x) => Math.cos(x) / Math.sin(x);
    const coshR = cot(Math.PI / p) * cot(Math.PI / q);
    const r = Math.acosh(Math.max(1.0000001, coshR));
    const radial = Math.tanh(r / 2);

    const vertices = [];
    for (let k = 0; k < p; k++) {
      const theta = (2 * Math.PI * k) / p - Math.PI / 2;
      vertices.push([Math.cos(theta) * radial, Math.sin(theta) * radial]);
    }
    return { centre: [0, 0], vertices, radial, angle };
  }

  /* --------------------------------------------------------------- tiling */

  function buildTiling() {
    const { centre, vertices, radial, angle } = buildTile();
    const base = { c: centre, v: vertices };
    const keyOf = (c) => `${Math.round(c[0] * 2e4)},${Math.round(c[1] * 2e4)}`;

    const seen = new Map();
    const tiles = [];
    const queue = [{ tile: base, ring: 0 }];
    const limit = 9000;

    while (queue.length && tiles.length < limit) {
      const { tile, ring } = queue.shift();
      const id = keyOf(tile.c);
      if (seen.has(id)) continue;
      seen.set(id, ring);
      tiles.push(tile);
      if (ring >= state.depth + 1) continue;

      for (let s = 0; s < state.p; s++) {
        const neighbour = reflectTile(tile, s);
        if (Math.hypot(neighbour.c[0], neighbour.c[1]) >= 1) continue;
        if (seen.has(keyOf(neighbour.c))) continue;
        queue.push({ tile: neighbour, ring: ring + 1 });
      }
    }

    state.tiles = tiles;
    state.capped = tiles.length >= limit;
    state.vertexRadius = radial;
    state.angle = angle;
    buildBands();
    void angle;
  }

  // Flatten every tile into a screen-space path in disc coordinates once, so
  // the spin and zoom can be applied as a canvas transform each frame.
  function buildBands() {
    const bands = [];
    const colours = PALETTES[state.palette] || PALETTES.lagoon;
    for (let i = 0; i < colours.length; i++) bands.push([]);

    for (const tile of state.tiles) {
      const radius = Math.hypot(tile.c[0], tile.c[1]);
      const points = [];
      for (let k = 0; k < tile.v.length; k++) {
        const a = tile.v[k];
        const b = tile.v[(k + 1) % tile.v.length];
        addArc(points, a, b, k === 0);
      }
      if (points.length < 3) continue;
      const band = Math.min(colours.length - 1, Math.floor(radius * (colours.length + 1)));
      bands[band].push({ points, radius });
    }
    state.bands = bands;
  }

  function addArc(out, a, b, includeFirst) {
    const circle = orthoCircle(a, b);
    const push = (x, y) => {
      const n = out.length;
      if (n >= 2 && Math.abs(out[n - 2] - x) < 1e-6 && Math.abs(out[n - 1] - y) < 1e-6) return;
      out.push(x, y);
    };

    if (!circle) {
      if (includeFirst) push(a[0], a[1]);
      push(b[0], b[1]);
      return;
    }

    let start = Math.atan2(a[1] - circle.y, a[0] - circle.x);
    let end = Math.atan2(b[1] - circle.y, b[0] - circle.x);
    let delta = end - start;
    while (delta > Math.PI) delta -= Math.PI * 2;
    while (delta < -Math.PI) delta += Math.PI * 2;

    // Choose the arc that stays inside the unit disc.
    const midAngle = start + delta / 2;
    const midX = circle.x + circle.r * Math.cos(midAngle);
    const midY = circle.y + circle.r * Math.sin(midAngle);
    if (Math.hypot(midX, midY) > 1) delta -= Math.sign(delta) * Math.PI * 2;

    // Sample finely enough that long arcs stay smooth near the rim.
    const steps = Math.max(6, Math.min(64, Math.ceil(Math.abs(delta) * 14)));
    if (includeFirst) push(a[0], a[1]);
    for (let i = 1; i <= steps; i++) {
      const t = start + (delta * i) / steps;
      push(circle.x + circle.r * Math.cos(t), circle.y + circle.r * Math.sin(t));
    }
  }

  /* -------------------------------------------------------------- drawing */

  const CACHE_SIZE = 1200;
  const CACHE_R = CACHE_SIZE * 0.47;

  function renderCache() {
    if (state.bands.length === 0) return;
    if (!state.cache) {
      const off = document.createElement("canvas");
      off.width = CACHE_SIZE;
      off.height = CACHE_SIZE;
      state.cache = off;
    }
    const cctx = state.cache.getContext("2d");
    if (!cctx) return;
    if (typeof cctx.setTransform === "function") cctx.setTransform(1, 0, 0, 1, 0, 0);
    cctx.clearRect(0, 0, CACHE_SIZE, CACHE_SIZE);

    const colours = PALETTES[state.palette] || PALETTES.lagoon;
    const cx = CACHE_SIZE / 2;

    if (typeof cctx.save === "function") {
      cctx.save();
      cctx.beginPath();
      cctx.arc(cx, cx, CACHE_R, 0, Math.PI * 2);
      cctx.clip();
    }
    cctx.setTransform(CACHE_R, 0, 0, CACHE_R, cx, cx);

    for (let b = 0; b < state.bands.length; b++) {
      const band = state.bands[b];
      if (!band.length) continue;
      const alpha = state.fade ? Math.max(0.34, 1 - b * 0.12) : 1;
      cctx.beginPath();
      for (const tile of band) {
        const pts = tile.points;
        cctx.moveTo(pts[0], pts[1]);
        for (let i = 2; i < pts.length; i += 2) cctx.lineTo(pts[i], pts[i + 1]);
        cctx.closePath();
      }
      cctx.globalAlpha = alpha;
      cctx.fillStyle = colours[b];
      cctx.fill();
      if (state.outline) {
        cctx.globalAlpha = Math.min(1, alpha + 0.15);
        cctx.strokeStyle = "rgba(3, 8, 10, 0.5)";
        cctx.lineWidth = 0.6 / 40;
        cctx.stroke();
      }
    }

    cctx.globalAlpha = 1;
    if (typeof cctx.restore === "function") cctx.restore();
    cctx.setTransform(1, 0, 0, 1, 0, 0);
    state.cacheStamp = `${state.p},${state.q},${state.depth},${state.palette},${state.outline},${state.fade}`;
  }

  function draw() {
    if (state.bands.length && state.cacheStamp !== `${state.p},${state.q},${state.depth},${state.palette},${state.outline},${state.fade}`) {
      renderCache();
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#03080a";
    ctx.fillRect(0, 0, SIZE, SIZE);

    const glow = ctx.createRadialGradient(CX, CY, R_PIX * 0.15, CX, CY, R_PIX * 1.05);
    glow.addColorStop(0, "rgba(79, 214, 192, 0.10)");
    glow.addColorStop(1, "rgba(3, 8, 10, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(CX, CY, R_PIX * 1.05, 0, Math.PI * 2);
    ctx.fill();

    if (state.cache) {
      const scale = (R_PIX * state.zoom) / CACHE_R;
      const cos = Math.cos(state.rotation);
      const sin = Math.sin(state.rotation);
      ctx.save();
      ctx.translate(CX, CY);
      ctx.rotate(state.rotation);
      void cos;
      void sin;
      ctx.scale(scale, scale);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(state.cache, -CACHE_SIZE / 2, -CACHE_SIZE / 2);
      ctx.restore();
    }

    ctx.strokeStyle = "rgba(79, 214, 192, 0.55)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(CX, CY, R_PIX * state.zoom, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "rgba(135, 160, 166, 0.9)";
    ctx.font = "12px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(`{${state.p}, ${state.q}}`, 18, 26);
    ctx.textAlign = "right";
    ctx.fillText(`${state.tiles.length.toLocaleString("en-US")} tiles`, SIZE - 18, 26);
    ctx.textAlign = "left";
  }

  /* ------------------------------------------------------------- readouts */

  function updateReadouts() {
    const degrees = (state.angle * 180) / Math.PI;
    el("schlafli-read").textContent = `{${state.p}, ${state.q}}`;
    el("tiles-read").textContent = `${state.tiles.length.toLocaleString("en-US")} tiles`;
    el("angle-read").textContent = `${degrees.toFixed(1)}° corners`;
    el("depth-out").textContent = String(state.depth);
    el("spin-out").textContent = state.spin.toFixed(2);
    el("zoom-out").textContent = `${state.zoom.toFixed(2)}×`;
  }

  function statusLine() {
    const degrees = (state.angle * 180) / Math.PI;
    const vertexR = state.vertexRadius;
    const cap = state.capped ? " (tile cap reached — lower the depth to see the complete patch)" : "";
    return `{${state.p}, ${state.q}} · ${degrees.toFixed(1)}° interior angles so ${state.q} tiles meet at every corner · ${state.tiles.length.toLocaleString("en-US")} tiles out to depth ${state.depth}${cap} · vertex radius ${vertexR.toFixed(3)} in disc units.`;
  }

  function setStatus(text) {
    el("status").textContent = text;
  }

  /* ----------------------------------------------------------------- loop */

  function frame(timestamp) {
    if (!state.lastTime) state.lastTime = timestamp;
    const dt = Math.max(0, Math.min(80, timestamp - state.lastTime));
    state.lastTime = timestamp;

    if (state.running && state.spin > 0) {
      state.rotation += (dt / 1000) * state.spin;
    }

    draw();
    requestAnimationFrame(frame);
  }

  /* --------------------------------------------------------------- wiring */

  function rebuild(message) {
    buildTiling();
    updateReadouts();
    setStatus(message || statusLine());
    draw();
  }

  function applyTiling(value) {
    const parts = String(value).split(",");
    state.p = Math.max(3, Math.min(9, Number(parts[0]) || 4));
    state.q = Math.max(3, Math.min(9, Number(parts[1]) || 5));
    state.rotation = 0;
    rebuild();
  }

  el("tiling").addEventListener("change", () => applyTiling(el("tiling").value));

  el("depth").addEventListener("input", () => {
    state.depth = Number(el("depth").value);
    rebuild();
  });

  el("spin").addEventListener("input", () => {
    state.spin = Number(el("spin").value);
    updateReadouts();
    setStatus(state.spin === 0 ? "Spin stopped — drag the disc to rotate it by hand." : statusLine());
  });

  el("zoom").addEventListener("input", () => {
    state.zoom = Number(el("zoom").value);
    updateReadouts();
    draw();
  });

  el("palette").addEventListener("change", () => {
    state.palette = el("palette").value;
    buildBands();
    draw();
    setStatus(`Palette switched to ${state.palette}.`);
  });

  el("outline").addEventListener("change", () => {
    state.outline = el("outline").checked;
    draw();
  });

  el("fade").addEventListener("change", () => {
    state.fade = el("fade").checked;
    draw();
  });

  el("toggle").addEventListener("click", () => {
    state.running = !state.running;
    el("toggle").textContent = state.running ? "Pause" : "Run";
    setStatus(state.running ? statusLine() : "Spin paused — the tiling is still there, just still.");
  });

  el("reset").addEventListener("click", () => {
    state.rotation = 0;
    state.zoom = 1;
    el("zoom").value = "1";
    updateReadouts();
    draw();
    setStatus("View reset. Every tile you can see sits inside the same disc.");
  });

  let dragging = false;
  let lastX = 0;
  canvas.addEventListener("pointerdown", (event) => {
    dragging = true;
    lastX = event.clientX || 0;
    canvas.style && (canvas.style.cursor = "grabbing");
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const dx = (event.clientX || 0) - lastX;
    lastX = event.clientX || 0;
    state.rotation += dx * 0.006;
    draw();
  });
  canvas.addEventListener("pointerup", () => {
    dragging = false;
    canvas.style && (canvas.style.cursor = "grab");
  });
  canvas.addEventListener("pointerleave", () => {
    dragging = false;
  });
  canvas.addEventListener("wheel", (event) => {
    if (typeof event.preventDefault === "function") event.preventDefault();
    const delta = event.deltaY || 0;
    state.zoom = Math.max(0.35, Math.min(1, state.zoom * (delta > 0 ? 0.94 : 1.06)));
    el("zoom").value = state.zoom.toFixed(2);
    updateReadouts();
    draw();
  });

  document.addEventListener("keydown", (event) => {
    const tag = (event.target && event.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (event.code === "Space") {
      event.preventDefault();
      el("toggle").click();
    } else if (event.key === "r" || event.key === "R") {
      el("reset").click();
    }
  });

  el("tiling").value = "4,5";
  el("depth").value = "6";
  el("spin").value = "0.05";
  el("zoom").value = "1";
  el("palette").value = "lagoon";
  applyTiling("4,5");
  requestAnimationFrame(frame);
})();
