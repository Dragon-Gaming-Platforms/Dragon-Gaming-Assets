(() => {
  "use strict";

  // Flow Field Studio: a seeded value-noise vector field steers thousands of
  // particles. Each frame every particle reads the angle under it, takes one
  // step and leaves a short stroke, so the image is painted by the field.

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");
  const W = canvas.width || 820;
  const H = canvas.height || 560;

  const PALETTES = {
    aurora: ["#2ee6c8", "#4fb8ff", "#8f7dff", "#d17dff", "#ff8fd0"],
    ember: ["#ffcf6b", "#ff9d4d", "#ff6b3d", "#f0432f", "#c92d55"],
    tide: ["#9fe8ff", "#5bb8e6", "#3d7fd0", "#315ba8", "#2d3f7a"],
    graphite: ["#f2f5f9", "#c3ccd8", "#8d99a8", "#5f6b7a", "#3d4652"],
  };

  const BUCKETS = 5;

  const state = {
    seed: 7,
    count: 1400,
    scale: 1.8,
    warp: 1.4,
    speed: 1.6,
    fade: 0.035,
    palette: "aurora",
    drift: true,
    running: true,
    time: 0,
    particles: [],
    pointer: { x: 0, y: 0, active: false },
    frame: 0,
    lastTime: 0,
    fps: 60,
    fpsFrames: 0,
    fpsTimer: 0,
  };

  /* ------------------------------------------------------------------ noise */

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function random() {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hash2(ix, iy) {
    let h = Math.imul(ix, 374761393) + Math.imul(iy, 668265263) + Math.imul(state.seed, 1274126177);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }

  function smooth(t) {
    return t * t * (3 - 2 * t);
  }

  function noise2(x, y) {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = smooth(x - ix);
    const fy = smooth(y - iy);
    const a = hash2(ix, iy);
    const b = hash2(ix + 1, iy);
    const c = hash2(ix, iy + 1);
    const d = hash2(ix + 1, iy + 1);
    const top = a + (b - a) * fx;
    const bottom = c + (d - c) * fx;
    return top + (bottom - top) * fy;
  }

  function fbm(x, y) {
    let value = 0;
    let amplitude = 0.55;
    let frequency = 1;
    let total = 0;
    for (let o = 0; o < 3; o++) {
      value += noise2(x * frequency, y * frequency) * amplitude;
      total += amplitude;
      frequency *= 2.1;
      amplitude *= 0.5;
    }
    return value / total;
  }

  function angleAt(x, y) {
    const k = 0.0042 * state.scale;
    const drift = state.drift ? state.time * 0.05 : 0;
    const n = fbm(x * k + drift, y * k - drift * 0.6);
    let angle = n * Math.PI * 2 * state.warp;

    if (state.pointer.active) {
      const dx = x - state.pointer.x;
      const dy = y - state.pointer.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 170) {
        const pull = (1 - dist / 170) ** 2;
        angle += pull * 2.6;
      }
    }
    return angle;
  }

  /* ------------------------------------------------------------- particles */

  function respawn(p, random) {
    p.x = random() * W;
    p.y = random() * H;
    p.age = 0;
    p.life = 180 + random() * 520;
    return p;
  }

  function setCount(count) {
    const random = mulberry32(state.seed + 99);
    state.count = count;
    while (state.particles.length < count) {
      state.particles.push(respawn({ x: 0, y: 0, age: 0, life: 0 }, random));
    }
    if (state.particles.length > count) state.particles.length = count;
    el("count-out").textContent = String(count);
    el("particles-read").textContent = `${count.toLocaleString("en-US")} particles`;
  }

  function reseed() {
    state.seed = 1 + Math.floor(Math.random() * 9999);
    el("seed-read").textContent = `seed ${state.seed}`;
    const random = mulberry32(state.seed);
    for (const p of state.particles) respawn(p, random);
    clearPaint();
    setStatus(`New field seeded at ${state.seed}. Same rules, entirely different painting.`);
  }

  /* --------------------------------------------------------------- drawing */

  function clearPaint() {
    ctx.fillStyle = "#04050a";
    ctx.fillRect(0, 0, W, H);
  }

  function step(dt) {
    state.time += dt / 1000;
    state.frame += 1;

    // Fade the previous frame so trails decay.
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = `rgba(4, 5, 10, ${state.fade})`;
    ctx.fillRect(0, 0, W, H);

    const colours = PALETTES[state.palette] || PALETTES.aurora;
    const random = mulberry32(state.seed + state.frame);
    const segments = [[], [], [], [], []];
    const stepLength = state.speed * 2.4;

    for (const p of state.particles) {
      const angle = angleAt(p.x, p.y);
      const normalised = ((angle / (Math.PI * 2)) % 1 + 1) % 1;
      const bucket = Math.min(BUCKETS - 1, Math.floor(normalised * BUCKETS));
      const vx = Math.cos(angle) * state.speed;
      const vy = Math.sin(angle) * state.speed;

      const lane = segments[bucket];
      lane.push(p.x, p.y, p.x + vx * 2.4, p.y + vy * 2.4);

      p.x += vx;
      p.y += vy;
      p.age += 1;
      if (p.age > p.life || p.x < -12 || p.x > W + 12 || p.y < -12 || p.y > H + 12) {
        respawn(p, random);
      }
    }

    ctx.globalCompositeOperation = "lighter";
    ctx.lineWidth = Math.min(2, 0.75 + stepLength * 0.2);
    ctx.lineCap = "round";
    ctx.globalAlpha = 0.2;
    for (let b = 0; b < BUCKETS; b++) {
      const lane = segments[b];
      if (!lane.length) continue;
      ctx.strokeStyle = colours[Math.min(colours.length - 1, b)];
      ctx.beginPath();
      for (let i = 0; i < lane.length; i += 4) {
        ctx.moveTo(lane[i], lane[i + 1]);
        ctx.lineTo(lane[i + 2], lane[i + 3]);
      }
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  function updateHud() {
    el("seed-read").textContent = `seed ${state.seed}`;
    el("fps-read").textContent = `${Math.round(state.fps)} fps`;
    el("count-out").textContent = String(state.count);
    el("scale-out").textContent = state.scale.toFixed(1);
    el("warp-out").textContent = state.warp.toFixed(1);
    el("speed-out").textContent = state.speed.toFixed(1);
    el("fade-out").textContent = state.fade.toFixed(3);
  }

  function setStatus(text) {
    el("status").textContent = text;
  }

  function statusLine() {
    const article = /^[aeiou]/.test(state.palette) ? "an" : "a";
    return `${state.count.toLocaleString("en-US")} particles tracing ${article} ${state.palette} field · scale ${state.scale.toFixed(1)} · turbulence ${state.warp.toFixed(1)}x · ${state.drift ? "drifting" : "frozen"} field.`;
  }

  /* ------------------------------------------------------------------ loop */

  function loop(timestamp) {
    if (!state.lastTime) state.lastTime = timestamp;
    const dt = Math.max(0, Math.min(80, timestamp - state.lastTime));
    state.lastTime = timestamp;

    state.fpsFrames += 1;
    state.fpsTimer += dt;
    if (state.fpsTimer > 500) {
      state.fps = (state.fpsFrames * 1000) / state.fpsTimer;
      state.fpsFrames = 0;
      state.fpsTimer = 0;
      updateHud();
    }

    if (state.running) {
      step(dt);
      if (state.frame % 90 === 0) setStatus(statusLine());
    }

    requestAnimationFrame(loop);
  }

  /* ---------------------------------------------------------------- wiring */

  function setRunning(running) {
    state.running = running;
    state.lastTime = 0;
    el("toggle").textContent = running ? "Pause" : "Run";
    setStatus(running ? statusLine() : "Paused — the field is frozen mid-stroke.");
  }

  el("toggle").addEventListener("click", () => setRunning(!state.running));
  el("reseed").addEventListener("click", reseed);
  el("clear").addEventListener("click", () => {
    clearPaint();
    setStatus("Canvas cleared; the particles are already laying down a new layer.");
  });

  el("count").addEventListener("input", () => setCount(Number(el("count").value)));
  el("scale").addEventListener("input", () => {
    state.scale = Number(el("scale").value);
    updateHud();
  });
  el("warp").addEventListener("input", () => {
    state.warp = Number(el("warp").value);
    updateHud();
  });
  el("speed").addEventListener("input", () => {
    state.speed = Number(el("speed").value);
    updateHud();
  });
  el("fade").addEventListener("input", () => {
    state.fade = Number(el("fade").value);
    updateHud();
  });
  el("palette").addEventListener("change", () => {
    state.palette = el("palette").value;
    setStatus(`Palette switched to ${state.palette}.`);
  });
  el("drift").addEventListener("change", () => {
    state.drift = el("drift").checked;
  });

  function pointer(event) {
    const rect = canvas.getBoundingClientRect();
    state.pointer.x = ((event.clientX - rect.left) / (rect.width || W)) * W;
    state.pointer.y = ((event.clientY - rect.top) / (rect.height || H)) * H;
  }

  canvas.addEventListener("pointerdown", (event) => {
    pointer(event);
    state.pointer.active = true;
    setStatus("Stirring the field around the pointer.");
  });
  canvas.addEventListener("pointermove", (event) => {
    if (state.pointer.active) pointer(event);
  });
  canvas.addEventListener("pointerup", () => {
    state.pointer.active = false;
  });
  canvas.addEventListener("pointerleave", () => {
    state.pointer.active = false;
  });

  function saveImage() {
    if (typeof canvas.toDataURL !== "function") return;
    try {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `flow-field-${state.seed}.png`;
      link.click();
      setStatus(`Saved a PNG of seed ${state.seed}.`);
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
      reseed();
    } else if (event.key === "c" || event.key === "C") {
      clearPaint();
    } else if (event.key === "s" || event.key === "S") {
      saveImage();
    }
  });

  el("count").value = String(state.count);
  el("scale").value = String(state.scale);
  el("warp").value = String(state.warp);
  el("speed").value = String(state.speed);
  el("fade").value = String(state.fade);
  el("palette").value = state.palette;

  clearPaint();
  setCount(state.count);
  updateHud();
  setStatus("Field seeded. Drag on the canvas to stir the flow.");
  requestAnimationFrame(loop);
})();
