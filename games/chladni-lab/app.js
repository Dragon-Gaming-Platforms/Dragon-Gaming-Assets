(() => {
  "use strict";

  // Chladni plate: a square membrane vibrating in mode (n, m). The standing
  // wave is sin(nπu)·sin(mπv) with u, v in [0, 1]. Sand grains jitter
  // proportionally to |amplitude| and lose their jitter near the nodal lines,
  // so thousands of simple random kicks are enough to draw the pattern.

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");
  const SIZE = canvas.width || 700;
  const HGT = canvas.height || 620;
  const PLATE = Math.min(SIZE - 60, HGT - 110);
  const PLATE_X = (SIZE - PLATE) / 2;
  const PLATE_Y = 44;

  const SIDE = 420;
  const BUCKETS = 6;

  const state = {
    n: 3,
    m: 5,
    shake: 1,
    field: 0,
    grainTarget: 6000,
    overlay: true,
    running: true,
    grains: [],
    basins: null,
    settled: 0,
    nodes: 0,
    frequency: 0,
    frame: 0,
    lastTime: 0,
    shakePhase: 0,
    presetIndex: 0,
    lastFieldKey: "",
  };

  const PRESETS = [
    [1, 2],
    [1, 3],
    [2, 3],
    [2, 5],
    [3, 4],
    [3, 5],
    [4, 5],
    [4, 7],
    [5, 8],
    [2, 7],
  ];

  /* ----------------------------------------------------------- the field */

  function amplitude(u, v) {
    return Math.sin(state.n * Math.PI * u) * Math.sin(state.m * Math.PI * v);
  }

  function buildBasins() {
    // For every plate cell work out the nearest nodal line and how strongly
    // that cell vibrates; both are reused by every grain.
    const basins = new Float32Array(SIDE * SIDE * 2);
    let nodeCells = 0;

    for (let y = 0; y < SIDE; y++) {
      const v = (y + 0.5) / SIDE;
      for (let x = 0; x < SIDE; x++) {
        const u = (x + 0.5) / SIDE;
        const amp = Math.abs(amplitude(u, v));
        const index = (y * SIDE + x) * 2;
        basins[index] = amp < 0.06 ? 1 : 0;
        // Pick a retreat direction pointing at the nearer nodal line.
        const du = Math.cos(state.n * Math.PI * u) * Math.sin(state.m * Math.PI * v);
        const dv = Math.sin(state.n * Math.PI * u) * Math.cos(state.m * Math.PI * v);
        const len = Math.hypot(du, dv) || 1;
        // Gradient points uphill; sand slides downhill towards the node.
        basins[index + 1] = amp < 0.06 ? 1 : 0.35 + Math.atan2(-dv / len, -du / len) / (Math.PI * 2);
        if (amp < 0.06) nodeCells++;
      }
    }

    state.basins = basins;
    state.nodes = nodeCells / SIDE / SIDE;
  }

  /* ---------------------------------------------------------------- grains */

  function spawnGrain(index) {
    return {
      x: Math.random() * 1,
      y: Math.random() * 1,
      phase: Math.random() * Math.PI * 2,
      stuck: false,
      tone: index % 7,
    };
  }

  function fillGrains(count) {
    const grains = state.grains;
    while (grains.length < count) grains.push(spawnGrain(grains.length));
    if (grains.length > count) grains.length = count;
    el("grains-out").textContent = count.toLocaleString("en-US");
  }

  function sprinkle() {
    for (const grain of state.grains) {
      grain.x = Math.random();
      grain.y = Math.random();
      grain.stuck = false;
    }
    state.settled = 0;
    el("settled-read").textContent = "0%";
  }

  function scatterEvenly() {
    const grains = state.grains;
    for (let i = 0; i < grains.length; i++) {
      grains[i].x = ((i % 100) + 0.5) / 100;
      grains[i].y = (Math.floor(i / 100) + 0.5) / Math.max(1, Math.ceil(grains.length / 100));
      grains[i].y = Math.min(1, grains[i].y);
      grains[i].stuck = false;
    }
  }

  function stepGrains() {
    const grains = state.grains;
    const shake = state.shake;
    let settled = 0;

    for (const grain of grains) {
      const amp = Math.abs(amplitude(grain.x, grain.y));

      if (amp < 0.05) {
        // Sitting on a nodal line: very little shake reaches it here.
        grain.stuck = true;
        settled++;
        continue;
      }
      grain.stuck = false;

      // Kicks proportional to the local vibration, with a bias downhill.
      const kick = amp * 0.0032 * shake;
      grain.x += (Math.random() - 0.5) * kick * 2;
      grain.y += (Math.random() - 0.5) * kick * 2;

      // Pull towards the nearest nodal line, measured by finite differences.
      const dx =
        Math.abs(amplitude(grain.x + 0.004, grain.y)) -
        Math.abs(amplitude(grain.x - 0.004, grain.y));
      const dy =
        Math.abs(amplitude(grain.x, grain.y + 0.004)) -
        Math.abs(amplitude(grain.x, grain.y - 0.004));
      const pull = 0.00016 * shake;
      if (dx > 0) grain.x -= pull;
      else if (dx < 0) grain.x += pull;
      if (dy > 0) grain.y -= pull;
      else if (dy < 0) grain.y += pull;

      if (grain.x < 0) grain.x = 0;
      if (grain.x > 1) grain.x = 1;
      if (grain.y < 0) grain.y = 0;
      if (grain.y > 1) grain.y = 1;
    }

    state.settled = grains.length ? settled / grains.length : 0;
  }

  /* --------------------------------------------------------------- drawing */

  function drawPlate() {
    ctx.fillStyle = "#05060a";
    ctx.fillRect(0, 0, SIZE, HGT);

    // Plate surface with a soft metallic gradient.
    const gradient = ctx.createLinearGradient(PLATE_X, PLATE_Y, PLATE_X + PLATE, PLATE_Y + PLATE);
    gradient.addColorStop(0, "#141821");
    gradient.addColorStop(0.5, "#101520");
    gradient.addColorStop(1, "#0b0f17");
    ctx.fillStyle = gradient;
    ctx.fillRect(PLATE_X, PLATE_Y, PLATE, PLATE);
    ctx.strokeStyle = "#2e3542";
    ctx.lineWidth = 2;
    ctx.strokeRect(PLATE_X + 1, PLATE_Y + 1, PLATE - 2, PLATE - 2);

    if (state.field) {
      // Heat map of |amplitude|, only redrawn when the mode changes.
      const key = `${state.n}-${state.m}-${state.field}`;
      if (key !== state.lastFieldKey) {
        const img = ctx.createImageData
          ? ctx.createImageData(Math.floor(PLATE), Math.floor(PLATE))
          : null;
        if (img) {
          const pw = img.width;
          const ph = img.height;
          for (let y = 0; y < ph; y++) {
            const v = y / ph;
            for (let x = 0; x < pw; x++) {
              const amp = Math.abs(amplitude(x / pw, v));
              const p = (y * pw + x) * 4;
              img.data[p] = Math.round(20 + amp * 200);
              img.data[p + 1] = Math.round(16 + amp * 120);
              img.data[p + 2] = Math.round(40 + amp * 60);
              img.data[p + 3] = 255;
            }
          }
          if (ctx.putImageData) {
            try {
              ctx.putImageData(img, Math.round(PLATE_X), Math.round(PLATE_Y));
            } catch (error) {
              state.lastFieldKey = key;
            }
          }
        }
        state.lastFieldKey = key;
      }
    }

    if (state.overlay) {
      // Nodal lines: the two families of straight lines nπu and mπv.
      ctx.strokeStyle = "rgba(179, 156, 255, 0.35)";
      ctx.lineWidth = 1;
      for (let i = 1; i < state.n; i++) {
        const x = PLATE_X + (i / state.n) * PLATE;
        ctx.beginPath();
        ctx.moveTo(x, PLATE_Y);
        ctx.lineTo(x, PLATE_Y + PLATE);
        ctx.stroke();
      }
      for (let j = 1; j < state.m; j++) {
        const y = PLATE_Y + (j / state.m) * PLATE;
        ctx.beginPath();
        ctx.moveTo(PLATE_X, y);
        ctx.lineTo(PLATE_X + PLATE, y);
        ctx.stroke();
      }
    }
  }

  function drawGrains() {
    const tones = ["#f6e7c8", "#eed9b2", "#e6c99c", "#dbbb8a", "#f9f0dc", "#e9d0aa", "#dfc39a"];
    const buckets = tones.map(() => []);
    for (const grain of state.grains) {
      const x = PLATE_X + grain.x * PLATE;
      const y = PLATE_Y + (1 - grain.y) * PLATE;
      if (x < PLATE_X || x > PLATE_X + PLATE || y < PLATE_Y || y > PLATE_Y + PLATE) continue;
      buckets[grain.tone % buckets.length].push(x, y);
    }
    for (let i = 0; i < buckets.length; i++) {
      const bucket = buckets[i];
      if (!bucket.length) continue;
      ctx.fillStyle = tones[i];
      for (let k = 0; k < bucket.length; k += 2) {
        ctx.fillRect(bucket[k], bucket[k + 1], 1.4, 1.4);
      }
    }
  }

  function drawCaption() {
    ctx.fillStyle = "rgba(139, 146, 158, 0.9)";
    ctx.font = "12px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(`mode (${state.n}, ${state.m})`, PLATE_X, PLATE_Y - 16);
    ctx.textAlign = "right";
    ctx.fillText(
      `${Math.round(state.settled * 100)}% of grains on nodes`,
      PLATE_X + PLATE,
      PLATE_Y - 16
    );
    ctx.textAlign = "left";
  }

  function draw() {
    drawPlate();
    drawGrains();
    drawCaption();
  }

  /* -------------------------------------------------------------- readouts */

  function frequency() {
    const n = state.n;
    const m = state.m;
    return 0.5 * Math.sqrt(n * n + m * m);
  }

  function updateReadouts() {
    el("mode-read").textContent = `n = ${state.n} · m = ${state.m}`;
    el("nodes-read").textContent = `${(state.nodes * 100).toFixed(1)}% are nodes`;
    el("freq-read").textContent = `f ∝ ${frequency().toFixed(2)}`;
    el("node-n-out").textContent = String(state.n);
    el("node-m-out").textContent = String(state.m);
    el("shake-out").textContent = state.shake.toFixed(1);
    el("grains-out").textContent = state.grains.length.toLocaleString("en-US");
    el("count-read").textContent = state.grains.length.toLocaleString("en-US");
    el("settled-read").textContent = `${Math.round(state.settled * 100)}%`;
    el("nodes2-read").textContent = `${(state.nodes * 100).toFixed(1)}%`;
    el("freq2-read").textContent = frequency().toFixed(2);
  }

  function setStatus(text) {
    el("status").textContent = text;
  }

  function statusLine() {
    const settled = Math.round(state.settled * 100);
    const symmetry = state.n === state.m ? "a perfectly symmetric cross pattern" : "an asymmetric lattice of lines";
    const grade =
      settled > 55
        ? "The sand has found the nodal lines and is piling up there."
        : settled > 20
          ? "Grains are migrating towards the quiet lines."
          : "Sand is still being thrown around; give it time or increase the shake.";
    return `Mode (${state.n}, ${state.m}) forms ${symmetry} · ${settled}% settled · relative frequency ${frequency().toFixed(2)}. ${grade}`;
  }

  /* ------------------------------------------------------------------ loop */

  function frame(timestamp) {
    if (!state.lastTime) state.lastTime = timestamp;
    const dt = Math.max(0, Math.min(80, timestamp - state.lastTime));
    state.lastTime = timestamp;

    if (state.running) {
      state.shakePhase += dt;
      stepGrains();
      state.frame += 1;
      if (state.frame % 10 === 0) {
        updateReadouts();
        setStatus(statusLine());
      }
    }

    draw();
    requestAnimationFrame(frame);
  }

  /* ---------------------------------------------------------------- wiring */

  function setMode(n, m) {
    state.n = Math.max(1, Math.min(9, n));
    state.m = Math.max(1, Math.min(9, m));
    el("nodeN").value = String(state.n);
    el("nodeM").value = String(state.m);
    buildBasins();
    sprinkle();
    updateReadouts();
    setStatus(statusLine());
    draw();
  }

  function setRunning(running) {
    state.running = running;
    el("toggle").textContent = running ? "Pause" : "Run";
    setStatus(running ? statusLine() : `Plate still at mode (${state.n}, ${state.m}). ${statusLine()}`);
  }

  el("toggle").addEventListener("click", () => setRunning(!state.running));
  el("sprinkle").addEventListener("click", () => {
    sprinkle();
    updateReadouts();
    setStatus("Fresh layer of sand across the plate.");
  });
  el("clear").addEventListener("click", () => {
    state.grains = [];
    state.settled = 0;
    updateReadouts();
    draw();
    setStatus("Plate wiped clean. Use Sprinkle sand to add a new layer.");
  });
  el("coarse").addEventListener("click", () => {
    setMode(Math.max(1, state.n - 1), Math.max(1, state.m - 1));
  });
  el("fine").addEventListener("click", () => {
    setMode(Math.min(9, state.n + 1), Math.min(9, state.m + 1));
  });
  el("preset").addEventListener("click", () => {
    const [n, m] = PRESETS[state.presetIndex % PRESETS.length];
    state.presetIndex = (state.presetIndex + 1) % PRESETS.length;
    setMode(n, m);
    setStatus(`Mode (${n}, ${m}) — ${statusLine()}`);
  });

  el("nodeN").addEventListener("input", () => {
    setMode(Number(el("nodeN").value), state.m);
  });
  el("nodeM").addEventListener("input", () => {
    setMode(state.n, Number(el("nodeM").value));
  });

  el("shake").addEventListener("input", () => {
    state.shake = Number(el("shake").value);
    updateReadouts();
  });

  el("field").addEventListener("change", () => {
    state.field = el("field").checked ? 1 : 0;
    state.lastFieldKey = "";
    draw();
  });

  el("grains").addEventListener("input", () => {
    state.grainTarget = Number(el("grains").value);
    fillGrains(state.grainTarget);
    updateReadouts();
  });

  el("overlay").addEventListener("change", () => {
    state.overlay = el("overlay").checked;
    draw();
  });

  function saveImage() {
    if (typeof canvas.toDataURL !== "function") return;
    try {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `chladni-${state.n}-${state.m}.png`;
      link.click();
      setStatus(`Saved mode (${state.n}, ${state.m}) as a PNG.`);
    } catch (error) {
      setStatus("Saving is blocked in this browser.");
    }
  }

  document.addEventListener("keydown", (event) => {
    const tag = (event.target && event.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (event.code === "Space") {
      event.preventDefault();
      setRunning(!state.running);
    } else if (event.key === "r" || event.key === "R") {
      sprinkle();
    } else if (event.key === "n" || event.key === "N") {
      el("preset").click();
    } else if (event.key === "s" || event.key === "S") {
      saveImage();
    }
  });

  state.n = Number(el("nodeN").value) || state.n;
  state.m = Number(el("nodeM").value) || state.m;
  state.shake = Number(el("shake").value) || state.shake;
  state.field = el("field").checked ? 1 : 0;
  state.grainTarget = Number(el("grains").value) || state.grainTarget;
  state.overlay = el("overlay").checked;

  fillGrains(state.grainTarget);
  scatterEvenly();
  buildBasins();
  updateReadouts();
  setStatus(`Plate still at mode (${state.n}, ${state.m}). Press Run to shake it.`);
  draw();
  requestAnimationFrame(frame);
})();
