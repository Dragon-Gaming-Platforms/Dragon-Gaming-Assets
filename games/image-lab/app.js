(() => {
  "use strict";

  // Image convolution lab. A generated test pattern (gradient + shapes +
  // noise) is filtered by a 3x3 or 5x5 kernel. Kernels that sum to 1
  // preserve brightness; kernels that sum to 0 keep only edges.

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");

  const W = canvas.width || 880;
  const H = canvas.height || 660;

  const STAGE = { x: 26, y: 50, w: 828, h: 560 };
  const IMG_W = 64, IMG_H = 64;

  const KERNELS = {
    blur: {
      label: "Blur",
      k3: [1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9],
      k5: [1/25, 1/25, 1/25, 1/25, 1/25, 1/25, 1/25, 1/25, 1/25, 1/25, 1/25, 1/25, 1/25, 1/25, 1/25, 1/25, 1/25, 1/25, 1/25, 1/25, 1/25, 1/25, 1/25, 1/25, 1/25],
    },
    sharpen: {
      label: "Sharpen",
      k3: [0, -1, 0, -1, 5, -1, 0, -1, 0],
      k5: [0, 0, -1, 0, 0, 0, -1, -1, -1, 0, -1, -1, 9, -1, -1, 0, -1, -1, -1, 0, 0, 0, -1, 0, 0],
    },
    edge: {
      label: "Edge",
      k3: [-1, -1, -1, -1, 8, -1, -1, -1, -1],
      k5: [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 24, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    },
    emboss: {
      label: "Emboss",
      k3: [-2, -1, 0, -1, 0, 1, 0, 1, 2],
      k5: [-2, -1, 0, -1, -2, -1, -1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, -1, -1, -2, -1, 0, -1, -2],
    },
  };

  const state = {
    kernel: "blur",
    ksize: 3,
    strength: 1,
    showOrig: true,
    showKernel: true,
    seed: 777,
    original: null,
    filtered: null,
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

  /* ------------------------------------------------------------- image core */

  function genPattern(seed) {
    const rng = mulberry32(seed);
    const img = new Array(IMG_W * IMG_H).fill(0);
    for (let y = 0; y < IMG_H; y++) {
      for (let x = 0; x < IMG_W; x++) {
        const i = y * IMG_W + x;
        let v = (x / IMG_W) * 120 + (y / IMG_H) * 60; // gradient
        const dx = x - 20, dy = y - 20;
        if (dx * dx + dy * dy < 100) v = 230; // bright disc
        if (x > 40 && x < 56 && y > 40 && y < 56) v = 30; // dark square
        v += (rng() - 0.5) * 30; // noise
        img[i] = Math.max(0, Math.min(255, v));
      }
    }
    return img;
  }

  function getKernel(name, size, strength) {
    const def = KERNELS[name];
    const base = size === 3 ? def.k3 : def.k5;
    const sum = base.reduce((a, b) => a + b, 0);
    // strength blends toward identity: k' = identity + strength*(k - identity)
    const center = Math.floor(base.length / 2);
    return base.map((v, i) => {
      const id = i === center ? 1 : 0;
      const blended = id + strength * (v - id);
      return sum === 1 ? blended : blended;
    });
  }

  function convolve(img, kernel, size) {
    const half = Math.floor(size / 2);
    const out = new Array(IMG_W * IMG_H).fill(0);
    for (let y = 0; y < IMG_H; y++) {
      for (let x = 0; x < IMG_W; x++) {
        let acc = 0;
        for (let ky = 0; ky < size; ky++) {
          for (let kx = 0; kx < size; kx++) {
            const sx = Math.max(0, Math.min(IMG_W - 1, x + kx - half));
            const sy = Math.max(0, Math.min(IMG_H - 1, y + ky - half));
            acc += img[sy * IMG_W + sx] * kernel[ky * size + kx];
          }
        }
        out[y * IMG_W + x] = Math.max(0, Math.min(255, acc));
      }
    }
    return out;
  }

  function meanBrightness(img) {
    return img.reduce((s, v) => s + v, 0) / img.length;
  }

  function variance(img) {
    const m = meanBrightness(img);
    return img.reduce((s, v) => s + (v - m) * (v - m), 0) / img.length;
  }

  function edgeEnergy(img) {
    // mean absolute Laplacian
    let e = 0;
    for (let y = 1; y < IMG_H - 1; y++) {
      for (let x = 1; x < IMG_W - 1; x++) {
        const i = y * IMG_W + x;
        const lap = 4 * img[i] - img[i - 1] - img[i + 1] - img[i - IMG_W] - img[i + IMG_W];
        e += Math.abs(lap);
      }
    }
    return e / ((IMG_W - 2) * (IMG_H - 2));
  }

  function kernelSum(kernel) {
    return kernel.reduce((a, b) => a + b, 0);
  }

  /* ------------------------------------------------------------------- drawing */

  function drawImage(img, ox, oy, scale) {
    for (let y = 0; y < IMG_H; y++) {
      for (let x = 0; x < IMG_W; x++) {
        const v = Math.round(img[y * IMG_W + x]);
        ctx.fillStyle = "rgb(" + v + "," + v + "," + v + ")";
        ctx.fillRect(ox + x * scale, oy + y * scale, scale, scale);
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#070907";
    ctx.fillRect(STAGE.x, STAGE.y, STAGE.w, STAGE.h);

    const scale = 5;
    const imgSize = IMG_W * scale;
    const oy = STAGE.y + 30;

    if (state.showOrig) {
      drawImage(state.original, STAGE.x + 30, oy, scale);
      ctx.fillStyle = "#93a48f";
      ctx.font = "11px ui-monospace, Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("original", STAGE.x + 30, oy - 8);
    }

    const fx = state.showOrig ? STAGE.x + 30 + imgSize + 40 : STAGE.x + 30;
    drawImage(state.filtered, fx, oy, scale);
    ctx.fillStyle = "#93a48f";
    ctx.fillText(KERNELS[state.kernel].label + " (" + state.ksize + "×" + state.ksize + ")", fx, oy - 8);

    // kernel grid
    if (state.showKernel) {
      const kernel = getKernel(state.kernel, state.ksize, state.strength);
      const cell = 34;
      const kx = STAGE.x + 30;
      const ky = oy + imgSize + 30;
      ctx.fillStyle = "#93a48f";
      ctx.fillText("kernel (sum " + kernelSum(kernel).toFixed(2) + "):", kx, ky - 8);
      for (let y = 0; y < state.ksize; y++) {
        for (let x = 0; x < state.ksize; x++) {
          const v = kernel[y * state.ksize + x];
          const t = Math.max(-1, Math.min(1, v / 5));
          ctx.fillStyle = t >= 0 ? "rgba(155,225,93," + (0.1 + Math.abs(t) * 0.8) + ")" : "rgba(255,143,163," + (0.1 + Math.abs(t) * 0.8) + ")";
          ctx.fillRect(kx + x * cell, ky + y * cell, cell - 2, cell - 2);
          ctx.fillStyle = "#eef5ea";
          ctx.font = "10px ui-monospace, Menlo, monospace";
          ctx.textAlign = "center";
          ctx.fillText(v.toFixed(1), kx + x * cell + cell / 2, ky + y * cell + cell / 2 + 3);
        }
      }
    }
  }

  /* ------------------------------------------------------------------ readouts */

  function updateReadouts() {
    const kernel = getKernel(state.kernel, state.ksize, state.strength);
    el("ksize-out").textContent = state.ksize + "×" + state.ksize;
    el("strength-out").textContent = state.strength.toFixed(2);

    el("mean-hud").textContent = "mean " + meanBrightness(state.filtered).toFixed(1);
    el("edge-hud").textContent = "edge energy " + edgeEnergy(state.filtered).toFixed(1);
    el("ksum-hud").textContent = "kernel Σ " + kernelSum(kernel).toFixed(2);

    el("mean-read").textContent = meanBrightness(state.filtered).toFixed(1);
    el("edge-read").textContent = edgeEnergy(state.filtered).toFixed(1);
    el("ksum-read").textContent = kernelSum(kernel).toFixed(2);
    el("var-read").textContent = variance(state.filtered).toFixed(0);
    el("kernel-read").textContent = KERNELS[state.kernel].label;
    el("size-read").textContent = state.ksize + "×" + state.ksize;
  }

  function describe() {
    const kernel = getKernel(state.kernel, state.ksize, state.strength);
    const sum = kernelSum(kernel);
    let msg;
    if (state.kernel === "blur") {
      msg = "Blur averages each pixel with its neighbours (kernel sums to 1, so brightness is preserved). Variance falls from " + variance(state.original).toFixed(0) + " to " + variance(state.filtered).toFixed(0) + " — detail is averaged away.";
    } else if (state.kernel === "sharpen") {
      msg = "Sharpen boosts the centre weight and subtracts the neighbours. Edges get crisper; noise gets amplified too. Kernel sums to 1, so flat areas are untouched.";
    } else if (state.kernel === "edge") {
      msg = "Edge detection: the kernel sums to 0, so flat areas cancel to black and only boundaries survive. Edge energy " + edgeEnergy(state.filtered).toFixed(1) + " vs " + edgeEnergy(state.original).toFixed(1) + " in the original.";
    } else {
      msg = "Emboss: a directional derivative. It turns the image into a relief — light from the top-left, shadow to the bottom-right. Kernel sums to 0, so the mean drops to mid-grey.";
    }
    el("status").textContent = msg;
  }

  /* -------------------------------------------------------------------- wiring */

  function refilter() {
    const kernel = getKernel(state.kernel, state.ksize, state.strength);
    state.filtered = convolve(state.original, kernel, state.ksize);
    updateReadouts();
    describe();
    draw();
  }

  function setPreset(name) {
    state.kernel = name;
    ["blur", "sharpen", "edge", "emboss"].forEach((kk) => {
      el("preset-" + kk).classList.toggle("active", kk === name);
    });
    refilter();
  }

  el("ksize").addEventListener("input", (evt) => {
    state.ksize = Number(evt.target.value) === 5 ? 5 : 3;
    refilter();
  });
  el("strength").addEventListener("input", (evt) => {
    state.strength = Math.max(0.2, Math.min(3, Number(evt.target.value) || 1));
    refilter();
  });

  el("preset-blur").addEventListener("click", () => setPreset("blur"));
  el("preset-sharpen").addEventListener("click", () => setPreset("sharpen"));
  el("preset-edge").addEventListener("click", () => setPreset("edge"));
  el("preset-emboss").addEventListener("click", () => setPreset("emboss"));

  el("toggle-orig").addEventListener("click", () => {
    state.showOrig = !state.showOrig;
    el("toggle-orig").classList.toggle("active", state.showOrig);
    draw();
  });
  el("toggle-kernel").addEventListener("click", () => {
    state.showKernel = !state.showKernel;
    el("toggle-kernel").classList.toggle("active", state.showKernel);
    draw();
  });

  document.addEventListener("keydown", (evt) => {
    if (evt.key === "1") setPreset("blur");
    else if (evt.key === "2") setPreset("sharpen");
    else if (evt.key === "3") setPreset("edge");
    else if (evt.key === "4") setPreset("emboss");
    else if (evt.key === "o" || evt.key === "O") el("toggle-orig").click();
    else if (evt.key === "k" || evt.key === "K") el("toggle-kernel").click();
  });

  window.__lab = {
    state,
    KERNELS,
    genPattern,
    getKernel,
    convolve,
    meanBrightness,
    variance,
    edgeEnergy,
    kernelSum,
    setPreset,
    refilter,
    updateReadouts,
    describe,
    draw,
  };

  state.original = genPattern(state.seed);
  refilter();
})();
