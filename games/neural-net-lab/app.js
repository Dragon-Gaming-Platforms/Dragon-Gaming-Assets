(() => {
  "use strict";

  // A hand-written two-hidden-layer perceptron trained with full-batch
  // gradient descent on binary cross-entropy. No libraries: forward pass,
  // backpropagation and the decision-boundary sampling are all inline.

  const MAXH = 32;
  const GRID = 46;
  const POINTS = 240;

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");
  const W = canvas.width || 820;
  const HGT = canvas.height || 560;

  const state = {
    dataset: "circle",
    hidden: 16,
    lr: 0.3,
    noise: 0.08,
    activation: "tanh",
    epoch: 0,
    loss: Math.log(2),
    accuracy: 0.5,
    running: false,
    history: [],
    points: [],
    frame: 0,
    lastTime: 0,
    boundary: new Float32Array(GRID * GRID),
  };

  let W1;
  let b1;
  let W2;
  let b2;
  let W3;
  let b3;
  let gW1;
  let gb1;
  let gW2;
  let gb2;
  let gW3;
  let gb3;

  const z1 = new Float64Array(MAXH);
  const a1 = new Float64Array(MAXH);
  const z2 = new Float64Array(MAXH);
  const a2 = new Float64Array(MAXH);
  const dz1 = new Float64Array(MAXH);
  const dz2 = new Float64Array(MAXH);
  const dA2 = new Float64Array(MAXH);
  let zOut = 0;

  /* ------------------------------------------------------------ maths */

  function act(z) {
    if (state.activation === "relu") return z > 0 ? z : 0;
    if (state.activation === "sine") return Math.sin(z);
    return Math.tanh(z);
  }

  function actDeriv(z, a) {
    if (state.activation === "relu") return z > 0 ? 1 : 0;
    if (state.activation === "sine") return Math.cos(z);
    return 1 - a * a;
  }

  function sigmoid(z) {
    if (z >= 0) return 1 / (1 + Math.exp(-z));
    const e = Math.exp(z);
    return e / (1 + e);
  }

  function forward(x, y) {
    const h = state.hidden;
    for (let i = 0; i < h; i++) {
      z1[i] = W1[i * 2] * x + W1[i * 2 + 1] * y + b1[i];
      a1[i] = act(z1[i]);
    }
    for (let i = 0; i < h; i++) {
      let sum = b2[i];
      const row = i * h;
      for (let j = 0; j < h; j++) sum += W2[row + j] * a1[j];
      z2[i] = sum;
      a2[i] = act(sum);
    }
    let sum = b3;
    for (let i = 0; i < h; i++) sum += W3[i] * a2[i];
    zOut = sum;
    return sigmoid(sum);
  }

  /* ---------------------------------------------------------- network */

  function randomNormal() {
    let u = 0;
    let v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  function initNetwork() {
    const h = state.hidden;
    const s1 = Math.sqrt(1 / 2);
    const s2 = Math.sqrt(1 / h);
    const s3 = Math.sqrt(1 / h);

    W1 = new Float64Array(h * 2).map(() => randomNormal() * s1);
    b1 = new Float64Array(h);
    W2 = new Float64Array(h * h).map(() => randomNormal() * s2);
    b2 = new Float64Array(h);
    W3 = new Float64Array(h).map(() => randomNormal() * s3);
    b3 = 0;

    gW1 = new Float64Array(h * 2);
    gb1 = new Float64Array(h);
    gW2 = new Float64Array(h * h);
    gb2 = new Float64Array(h);
    gW3 = new Float64Array(h);
    gb3 = 0;
  }

  function paramCount() {
    const h = state.hidden;
    return h * 2 + h + h * h + h + h + 1;
  }

  /* ---------------------------------------------------------- datasets */

  function makeData() {
    const pts = [];
    const noise = state.noise;
    const push = (x, y, label) => {
      const jitterX = x + (Math.random() - 0.5) * 0.06;
      const jitterY = y + (Math.random() - 0.5) * 0.06;
      let final = label;
      if (Math.random() < noise) final = 1 - final;
      pts.push({
        x: Math.max(-1, Math.min(1, jitterX)),
        y: Math.max(-1, Math.min(1, jitterY)),
        label: final,
      });
    };

    const half = POINTS / 2;
    if (state.dataset === "circle") {
      for (let i = 0; i < half; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 0.34 * Math.sqrt(Math.random());
        push(Math.cos(angle) * r, Math.sin(angle) * r, 1);
      }
      for (let i = 0; i < half; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 0.58 + Math.random() * 0.3;
        push(Math.cos(angle) * r, Math.sin(angle) * r, 0);
      }
    } else if (state.dataset === "moons") {
      for (let i = 0; i < half; i++) {
        const t = Math.random() * Math.PI;
        push(Math.cos(t) * 0.62 - 0.28, Math.sin(t) * 0.62 - 0.12, 0);
      }
      for (let i = 0; i < half; i++) {
        const t = Math.random() * Math.PI;
        push(-Math.cos(t) * 0.62 + 0.28, -Math.sin(t) * 0.62 + 0.12, 1);
      }
    } else if (state.dataset === "xor") {
      for (let i = 0; i < POINTS; i++) {
        const x = (Math.random() * 2 - 1) * 0.92;
        const y = (Math.random() * 2 - 1) * 0.92;
        push(x, y, x * y > 0 ? 1 : 0);
      }
    } else {
      for (let i = 0; i < half; i++) {
        const t = (i / half) * Math.PI * 3.1 + 0.35;
        const r = 0.1 + 0.13 * t;
        push(Math.cos(t) * r, Math.sin(t) * r, 0);
        push(Math.cos(t + Math.PI) * r, Math.sin(t + Math.PI) * r, 1);
      }
    }
    return pts;
  }

  /* ----------------------------------------------------------- training */

  function trainEpoch() {
    const h = state.hidden;
    gW1.fill(0);
    gb1.fill(0);
    gW2.fill(0);
    gb2.fill(0);
    gW3.fill(0);
    gb3 = 0;

    let loss = 0;
    let correct = 0;
    const n = state.points.length;

    for (const point of state.points) {
      const out = forward(point.x, point.y);
      const p = Math.max(1e-7, Math.min(1 - 1e-7, out));
      loss -= point.label * Math.log(p) + (1 - point.label) * Math.log(1 - p);
      if ((out > 0.5 ? 1 : 0) === point.label) correct++;

      const dOut = out - point.label;
      for (let i = 0; i < h; i++) {
        gW3[i] += dOut * a2[i];
        dA2[i] = dOut * W3[i];
        dz2[i] = dA2[i] * actDeriv(z2[i], a2[i]);
        gb2[i] += dz2[i];
        const row = i * h;
        for (let j = 0; j < h; j++) gW2[row + j] += dz2[i] * a1[j];
      }
      gb3 += dOut;
      for (let j = 0; j < h; j++) {
        let sum = 0;
        for (let i = 0; i < h; i++) sum += dz2[i] * W2[i * h + j];
        dz1[j] = sum * actDeriv(z1[j], a1[j]);
        gb1[j] += dz1[j];
        gW1[j * 2] += dz1[j] * point.x;
        gW1[j * 2 + 1] += dz1[j] * point.y;
      }
    }

    const rate = state.lr / n;
    for (let i = 0; i < h * 2; i++) W1[i] -= rate * gW1[i];
    for (let i = 0; i < h; i++) b1[i] -= rate * gb1[i];
    for (let i = 0; i < h * h; i++) W2[i] -= rate * gW2[i];
    for (let i = 0; i < h; i++) b2[i] -= rate * gb2[i];
    for (let i = 0; i < h; i++) W3[i] -= rate * gW3[i];
    b3 -= rate * gb3;

    state.epoch += 1;
    state.loss = loss / n;
    state.accuracy = correct / n;
    state.history.push(state.loss);
    if (state.history.length > 400) state.history.shift();
  }

  function sampleBoundary() {
    const n = GRID;
    for (let gy = 0; gy < n; gy++) {
      for (let gx = 0; gx < n; gx++) {
        const x = ((gx + 0.5) / n) * 2 - 1;
        const y = ((gy + 0.5) / n) * 2 - 1;
        state.boundary[gy * n + gx] = forward(x, y);
      }
    }
  }

  /* ------------------------------------------------------------ drawing */

  function draw() {
    ctx.fillStyle = "#05060a";
    ctx.fillRect(0, 0, W, HGT);

    const size = Math.min(HGT - 90, 460);
    const x0 = 40;
    const y0 = (HGT - size) / 2;

    const toX = (x) => x0 + ((x + 1) / 2) * size;
    const toY = (y) => y0 + ((y + 1) / 2) * size;

    // Decision field.
    const cell = size / GRID;
    for (let gy = 0; gy < GRID; gy++) {
      for (let gx = 0; gx < GRID; gx++) {
        const p = state.boundary[gy * GRID + gx];
        const blend = Math.max(0, Math.min(1, p));
        const r = Math.round(40 + blend * (255 - 40));
        const g = Math.round(80 + blend * (165 - 80));
        const b = Math.round(190 + blend * (82 - 190));
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.30)`;
        ctx.fillRect(x0 + gx * cell, y0 + gy * cell, cell + 0.5, cell + 0.5);
      }
    }

    // Grid and frame.
    ctx.strokeStyle = "rgba(140, 148, 168, 0.16)";
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const px = x0 + (size * i) / 4;
      const py = y0 + (size * i) / 4;
      ctx.beginPath();
      ctx.moveTo(px, y0);
      ctx.lineTo(px, y0 + size);
      ctx.moveTo(x0, py);
      ctx.lineTo(x0 + size, py);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(143, 125, 255, 0.5)";
    ctx.strokeRect(x0 + 0.5, y0 + 0.5, size, size);

    // Training points.
    for (const point of state.points) {
      ctx.beginPath();
      ctx.arc(toX(point.x), toY(point.y), 3.1, 0, Math.PI * 2);
      ctx.fillStyle = point.label === 1 ? "#ffb066" : "#6fbcff";
      ctx.fill();
      ctx.strokeStyle = "rgba(6, 8, 12, 0.85)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Loss chart.
    const chartX = x0 + size + 40;
    const chartW = W - chartX - 30;
    const chartY = 76;
    const chartH = 150;

    ctx.fillStyle = "#080a10";
    ctx.fillRect(chartX, chartY, chartW, chartH);
    ctx.strokeStyle = "#1c2230";
    ctx.strokeRect(chartX + 0.5, chartY + 0.5, chartW, chartH);

    if (state.history.length > 1) {
      const maxLoss = Math.max(0.75, ...state.history);
      ctx.beginPath();
      state.history.forEach((value, index) => {
        const px = chartX + (index / (state.history.length - 1)) * chartW;
        const py = chartY + chartH - (value / maxLoss) * chartH;
        if (index === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.strokeStyle = "#8f7dff";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.fillStyle = "#7f88a0";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText("training loss", chartX, chartY - 10);
    ctx.textAlign = "right";
    ctx.fillText(state.loss.toFixed(3), chartX + chartW, chartY - 10);

    ctx.textAlign = "left";
    ctx.fillStyle = "#9aa3ba";
    ctx.font = "12px ui-monospace, Menlo, monospace";
    ctx.fillText(`epoch ${state.epoch}`, chartX, chartY + chartH + 34);
    ctx.fillText(`${(state.accuracy * 100).toFixed(1)}% correct`, chartX, chartY + chartH + 56);

    ctx.fillStyle = "#6b7488";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.fillText(`${state.hidden}×${state.hidden} · ${state.activation} · lr ${state.lr.toFixed(2)}`, chartX, chartY + chartH + 82);
    ctx.fillText(`${state.points.length} points`, chartX, chartY + chartH + 102);

    // Legend.
    ctx.fillStyle = "#ffb066";
    ctx.beginPath();
    ctx.arc(x0 + 6, y0 + size + 26, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#8c94a8";
    ctx.fillText("class B", x0 + 16, y0 + size + 30);
    ctx.fillStyle = "#6fbcff";
    ctx.beginPath();
    ctx.arc(x0 + 82, y0 + size + 26, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#8c94a8";
    ctx.fillText("class A", x0 + 92, y0 + size + 30);
  }

  /* ----------------------------------------------------------- readouts */

  function updateReadouts() {
    el("epoch-read").textContent = `epoch ${state.epoch}`;
    el("loss-read").textContent = `loss ${state.loss.toFixed(3)}`;
    el("acc-read").textContent = `${(state.accuracy * 100).toFixed(1)}% accurate`;
    el("count-read").textContent = String(state.epoch);
    el("loss2-read").textContent = state.loss.toFixed(3);
    el("acc2-read").textContent = `${(state.accuracy * 100).toFixed(0)}%`;
    el("params-read").textContent = paramCount().toLocaleString("en-US");
    el("hidden-out").textContent = String(state.hidden);
    el("lr-out").textContent = state.lr.toFixed(2);
    el("noise-out").textContent = state.noise.toFixed(2);
  }

  function statusLine() {
    const acc = state.accuracy * 100;
    let verdict;
    if (state.epoch < 5) verdict = "Weights are still close to random — the boundary is nearly a straight line.";
    else if (acc < 60) verdict = "Barely better than guessing; the network needs more epochs or a larger learning rate.";
    else if (acc < 80) verdict = "The boundary is starting to bend in the right places.";
    else if (acc < 94) verdict = "Most points are on the correct side now.";
    else verdict = "Nearly all points classified — the shaded field follows the shape of the data.";
    return `Epoch ${state.epoch} · loss ${state.loss.toFixed(3)} · ${acc.toFixed(1)}% correct. ${verdict}`;
  }

  function setStatus(text) {
    el("status").textContent = text;
  }

  function refresh() {
    updateReadouts();
    setStatus(statusLine());
  }

  /* --------------------------------------------------------------- loop */

  function frame(timestamp) {
    if (!state.lastTime) state.lastTime = timestamp;
    const dt = Math.max(0, Math.min(80, timestamp - state.lastTime));
    state.lastTime = timestamp;

    if (state.running) {
      trainEpoch();
      trainEpoch();
      state.frame += 1;
      if (state.frame % 3 === 0) sampleBoundary();
      if (state.frame % 6 === 0) refresh();
    }

    draw();
    requestAnimationFrame(frame);
  }

  /* ------------------------------------------------------------- wiring */

  function reset(message) {
    state.epoch = 0;
    state.loss = Math.log(2);
    state.accuracy = 0.5;
    state.history = [];
    state.points = makeData();
    initNetwork();
    sampleBoundary();
    state.frame = 0;
    updateReadouts();
    setStatus(message || `Fresh ${state.dataset} data and new random weights. Press Run.`);
    draw();
  }

  function setRunning(running) {
    state.running = running;
    state.lastTime = 0;
    el("toggle").textContent = running ? "Pause" : "Run";
    setStatus(running ? statusLine() : `Paused at epoch ${state.epoch}. ${statusLine()}`);
  }

  el("toggle").addEventListener("click", () => setRunning(!state.running));

  el("step").addEventListener("click", () => {
    trainEpoch();
    sampleBoundary();
    refresh();
    draw();
  });

  el("reset").addEventListener("click", () => reset());

  el("dataset").addEventListener("change", () => {
    state.dataset = el("dataset").value;
    reset(`Dataset switched to ${state.dataset}. New data, new weights.`);
    setRunning(true);
    setStatus(statusLine());
  });

  el("hidden").addEventListener("input", () => {
    state.hidden = Number(el("hidden").value);
    reset(`Hidden layer resized to ${state.hidden} units — the network restarts from scratch.`);
    setRunning(true);
  });

  el("lr").addEventListener("input", () => {
    state.lr = Number(el("lr").value) / 100;
    updateReadouts();
  });

  el("noise").addEventListener("input", () => {
    state.noise = Number(el("noise").value);
    updateReadouts();
    setStatus(`Label noise ${(state.noise * 100).toFixed(0)}% — press New run to regenerate the data.`);
  });

  el("activation").addEventListener("change", () => {
    state.activation = el("activation").value;
    reset(`Activation switched to ${state.activation}. New weights.`);
    setRunning(true);
  });

  document.addEventListener("keydown", (event) => {
    const tag = (event.target && event.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (event.code === "Space") {
      event.preventDefault();
      setRunning(!state.running);
    } else if (event.key === "s" || event.key === "S") {
      el("step").click();
    } else if (event.key === "r" || event.key === "R") {
      reset();
    }
  });

  el("dataset").value = state.dataset;
  el("hidden").value = String(state.hidden);
  el("lr").value = String(Math.round(state.lr * 100));
  el("noise").value = String(state.noise);
  el("activation").value = state.activation;

  reset("Weights randomised. Press Run or Epoch to train.");
  requestAnimationFrame(frame);
})();
