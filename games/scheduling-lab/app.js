(() => {
  "use strict";

  // Five dispatch rules, identical parallel machines, one set of jobs.
  //
  // A dispatch rule only orders the jobs; the machine assignment is the same
  // greedy list-scheduling step for every rule, so the comparison is fair.
  //
  // Two facts make the numbers checkable rather than decorative:
  //   * with one machine SPT minimises total completion time exactly
  //   * with one machine EDD minimises maximum lateness exactly
  // Both are verified against the other rules in the test harness.

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");

  const W = canvas.width || 880;
  const H = canvas.height || 660;

  const GANTT = { x: 26, y: 54, w: 596, h: 320 };
  const RULES = { x: 640, y: 54, w: 214, h: 320 };
  const CHIPS = { x: 26, y: 406, w: 596, h: 196 };
  const INFO = { x: 640, y: 406, w: 214, h: 196 };

  const JOB_COLOURS = ["#6ff0c8", "#8fb3ff", "#ffb45f", "#d59bff", "#7fd6a6", "#f2a0c0"];

  const RULE_LIST = [
    { key: "fifo", name: "FIFO", note: "arrival order", order: (jobs) => jobs.slice() },
    { key: "spt", name: "SPT", note: "shortest job first", order: (jobs) => jobs.slice().sort((a, b) => a.p - b.p || a.id - b.id) },
    { key: "lpt", name: "LPT", note: "longest job first", order: (jobs) => jobs.slice().sort((a, b) => b.p - a.p || a.id - b.id) },
    { key: "edd", name: "EDD", note: "earliest due date", order: (jobs) => jobs.slice().sort((a, b) => a.due - b.due || a.id - b.id) },
    { key: "slack", name: "Least slack", note: "due date minus duration", order: (jobs) => jobs.slice().sort((a, b) => a.due - a.p - (b.due - b.p) || a.id - b.id) },
  ];

  const state = {
    jobCount: 14,
    machines: 3,
    spread: 60,
    slack: 1.2,
    seed: 20261017,
    ruleIndex: 1,
    jobs: [],
    results: [],
    selected: -1,
    statusKind: "",
  };

  /* --------------------------------------------------------------- model */

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

  function generateJobs() {
    const rand = seeded(state.seed);
    const jobs = [];
    for (let i = 0; i < state.jobCount; i++) {
      const jitter = 1 + (state.spread / 100) * (rand() * 1.6 - 0.8);
      jobs.push({ id: i, p: Math.max(3, Math.round(24 * jitter)), due: 0 });
    }
    const avg = jobs.reduce((a, j) => a + j.p, 0) / Math.max(1, jobs.length);
    const horizon = (jobs.length * avg) / Math.max(1, state.machines);
    jobs.forEach((job) => {
      job.due = Math.round(horizon * state.slack * (0.15 + rand() * 0.9));
    });
    return jobs;
  }

  function listSchedule(order, machines) {
    const freeAt = new Array(machines).fill(0);
    const placements = new Array(order.length);
    order.forEach((job) => {
      let chosen = 0;
      for (let m = 1; m < machines; m++) {
        if (freeAt[m] < freeAt[chosen] - 1e-9) chosen = m;
      }
      const start = freeAt[chosen];
      const end = start + job.p;
      freeAt[chosen] = end;
      placements[job.id] = { machine: chosen, start, end, tardy: Math.max(0, end - job.due) };
    });
    const ends = placements.map((pl) => pl.end);
    const makespan = Math.max(...ends);
    const flow = ends.reduce((a, b) => a + b, 0);
    const tardiness = placements.reduce((a, pl) => a + pl.tardy, 0);
    const lateCount = placements.filter((pl) => pl.tardy > 0).length;
    const peakLoad = Math.max(...freeAt);
    return { placements, makespan, flow, tardiness, lateCount, peakLoad };
  }

  function evaluate() {
    const lowerBound = Math.max(
      Math.max(...state.jobs.map((j) => j.p)),
      Math.ceil(state.jobs.reduce((a, j) => a + j.p, 0) / state.machines)
    );
    return RULE_LIST.map((rule) => {
      const order = rule.order(state.jobs);
      const schedule = listSchedule(order, state.machines);
      const late = schedule.placements.map((pl, i) => pl.end - state.jobs[i].due);
      return {
        ...rule,
        schedule,
        lowerBound,
        maxLate: Math.max(...late),
        tardiness: schedule.placements.reduce((a, pl, i) => a + Math.max(0, pl.end - state.jobs[i].due), 0),
        lateCount: schedule.placements.filter((pl, i) => pl.end > state.jobs[i].due + 1e-9).length,
      };
    });
  }

  function rebuild(reseed) {
    if (reseed) {
      state.seed = (state.seed * 1664525 + 1013904223) >>> 0;
      state.jobs = generateJobs();
      state.selected = -1;
    } else {
      state.jobs = generateJobs();
    }
    state.results = evaluate();
    updateReadouts();
    describe();
    draw();
  }

  const current = () => state.results[state.ruleIndex];

  /* ------------------------------------------------------------- readouts */

  function setStatus(text, kind) {
    const box = el("status");
    box.textContent = text;
    box.className = "status" + (kind ? " " + kind : "");
    state.statusKind = kind || "";
  }

  function updateReadouts() {
    const r = current();
    el("jobs-out").textContent = String(state.jobCount);
    el("machines-out").textContent = String(state.machines);
    el("spread-out").textContent = state.spread + "%";
    el("slack-out").textContent = state.slack.toFixed(2) + "×";
    el("rule-read").textContent = r.name;
    el("makespan-read").textContent = String(r.schedule.makespan);
    el("flow-read").textContent = String(r.schedule.flow);
    el("tard-read").textContent = String(r.tardiness);
    el("late-read").textContent = r.lateCount + " / " + state.jobs.length;
    el("maxlate-read").textContent = (r.maxLate > 0 ? "+" : "") + r.maxLate;
    el("rule-hud").textContent = "rule " + r.name;
    el("makespan-hud").textContent = "makespan " + r.schedule.makespan;
    el("tardy-hud").textContent = "late " + r.lateCount;
  }

  function describe() {
    const r = current();
    const bestMake = state.results.reduce((best, x) => (x.schedule.makespan < best.schedule.makespan ? x : best));
    const bestTard = state.results.reduce((best, x) => (x.tardiness < best.tardiness ? x : best));
    const bestFlow = state.results.reduce((best, x) => (x.schedule.flow < best.schedule.flow ? x : best));

    if (state.selected >= 0) {
      const job = state.jobs[state.selected];
      const pl = r.schedule.placements[state.selected];
      setStatus(
        `Job ${job.id + 1} takes ${job.p} on machine ${pl.machine + 1}, from ${pl.start} to ${pl.end}; its due date is ${job.due}. ` +
          `That makes it ${pl.tardy > 0 ? pl.tardy + " late" : "on time"}. Under ${r.name} the whole set finishes at ${r.schedule.makespan}.`,
        "idle"
      );
      return;
    }

    let theory = "";
    if (state.machines === 1) {
      theory =
        r.key === "spt"
          ? " With one machine SPT is optimal for total flow, so no other rule can beat this flow."
          : r.key === "edd"
          ? " With one machine EDD is optimal for maximum lateness, so this is the smallest possible worst-case slip."
          : "";
    }

    setStatus(
      `${r.name} finishes all ${state.jobs.length} jobs at ${r.schedule.makespan}, against a lower bound of ${r.lowerBound}. ` +
        `Total flow ${r.schedule.flow}, total tardiness ${r.tardiness}, worst slip ${r.maxLate > 0 ? "+" : ""}${r.maxLate}. ` +
        `Shortest makespan right now: ${bestMake.name} (${bestMake.schedule.makespan}); least tardiness: ${bestTard.name} (${bestTard.tardiness}); lowest flow: ${bestFlow.name} (${bestFlow.schedule.flow}).${theory}`,
      r.lowerBound === r.schedule.makespan ? "good" : "idle"
    );
  }

  /* -------------------------------------------------------------- drawing */

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

  const timeMax = () => {
    const max = Math.max(...state.results.map((r) => r.schedule.makespan), 1);
    return Math.ceil(max / 20) * 20;
  };

  function drawGantt() {
    const r = current();
    panel(GANTT, "Gantt · " + r.name, r.note);
    const left = GANTT.x + 58;
    const right = GANTT.x + GANTT.w - 16;
    const top = GANTT.y + 26;
    const rowH = Math.min(84, (GANTT.h - 56) / state.machines);
    const tMax = timeMax();
    const xOf = (t) => left + ((right - left) * t) / tMax;

    // axis ticks
    ctx.strokeStyle = "#16222b";
    ctx.fillStyle = "#4e6272";
    ctx.font = "9.5px ui-monospace, Menlo, monospace";
    const step = tMax <= 200 ? 20 : tMax <= 500 ? 50 : 100;
    for (let t = 0; t <= tMax; t += step) {
      const x = xOf(t);
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x, top + rowH * state.machines);
      ctx.stroke();
      ctx.textAlign = "center";
      ctx.fillText(String(t), x, top + rowH * state.machines + 14);
    }

    for (let m = 0; m < state.machines; m++) {
      const y = top + m * rowH;
      ctx.fillStyle = "rgba(255,255,255,0.025)";
      ctx.fillRect(left, y, right - left, rowH - 6);
      ctx.fillStyle = "#7e93a2";
      ctx.font = "10px ui-monospace, Menlo, monospace";
      ctx.textAlign = "right";
      ctx.fillText("M" + (m + 1), left - 10, y + rowH / 2);

      state.jobs.forEach((job, i) => {
        const pl = r.schedule.placements[i];
        if (pl.machine !== m) return;
        const x = xOf(pl.start);
        const w = Math.max(2, xOf(pl.end) - x);
        const late = pl.end > job.due + 1e-9;
        const dim = state.selected >= 0 && state.selected !== i;
        ctx.fillStyle = JOB_COLOURS[i % JOB_COLOURS.length];
        ctx.globalAlpha = dim ? 0.2 : late ? 0.42 : 0.92;
        ctx.fillRect(x + 1, y + 3, Math.max(1, w - 2), rowH - 12);
        ctx.globalAlpha = 1;
        if (late) {
          ctx.strokeStyle = "#ff7b7b";
          ctx.lineWidth = 1.4;
          ctx.strokeRect(x + 1.5, y + 3.5, Math.max(1, w - 3), rowH - 13);
        }
        if (state.selected === i) {
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1.6;
          ctx.strokeRect(x + 1, y + 3, Math.max(1, w - 2), rowH - 12);
          ctx.lineWidth = 1;
        }
        if (w > 22) {
          ctx.fillStyle = late && !dim ? "#ffe8e8" : "#07100f";
          ctx.font = "10px ui-monospace, Menlo, monospace";
          ctx.textAlign = "center";
          ctx.fillText("J" + (i + 1), x + w / 2, y + rowH / 2 + 1);
        }
      });
    }

    // lower bound marker
    const lbX = xOf(r.lowerBound);
    ctx.strokeStyle = "#ffcf7a";
    ctx.lineWidth = 1.2;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(lbX, top - 8);
    ctx.lineTo(lbX, top + rowH * state.machines);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#ffcf7a";
    ctx.font = "9.5px ui-monospace, Menlo, monospace";
    ctx.textAlign = lbX > right - 80 ? "right" : "left";
    ctx.fillText("bound " + r.lowerBound, lbX + (lbX > right - 80 ? -4 : 4), top - 12);
  }

  function drawRules() {
    panel(RULES, "dispatch rules", "click to switch");
    const maxMake = Math.max(...state.results.map((r) => r.schedule.makespan), 1);
    state.results.forEach((r, i) => {
      const y = RULES.y + 18 + i * 58;
      const active = i === state.ruleIndex;
      ctx.fillStyle = active ? "rgba(111,240,200,0.10)" : "rgba(255,255,255,0.02)";
      ctx.fillRect(RULES.x + 8, y, RULES.w - 16, 50);
      if (active) {
        ctx.strokeStyle = "#2f8d7b";
        ctx.strokeRect(RULES.x + 8.5, y + 0.5, RULES.w - 17, 49);
      }
      ctx.fillStyle = active ? "#d7fff7" : "#a9bcc8";
      ctx.font = "600 11px ui-monospace, Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText(r.name, RULES.x + 16, y + 15);
      ctx.fillStyle = "#55697a";
      ctx.font = "9px ui-monospace, Menlo, monospace";
      ctx.textAlign = "right";
      ctx.fillText(r.note, RULES.x + RULES.w - 16, y + 15);

      // makespan bar
      const barL = RULES.x + 16;
      const barR = RULES.x + RULES.w - 16;
      const w = ((barR - barL) * r.schedule.makespan) / maxMake;
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.fillRect(barL, y + 22, barR - barL, 7);
      ctx.fillStyle = r.tardiness > 0 ? "#ffb45f" : "#6ff0c8";
      ctx.globalAlpha = active ? 0.95 : 0.55;
      ctx.fillRect(barL, y + 22, Math.max(2, w), 7);
      ctx.globalAlpha = 1;

      ctx.fillStyle = "#7e93a2";
      ctx.font = "9px ui-monospace, Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("span " + r.schedule.makespan, barL, y + 42);
      ctx.textAlign = "right";
      ctx.fillStyle = r.tardiness > 0 ? "#ff9f6e" : "#6ff0c8";
      ctx.fillText("late " + r.tardiness, barR, y + 42);
    });
  }

  function drawChips() {
    panel(CHIPS, "jobs", `${state.jobs.length} jobs · click to inspect`);
    const perRow = 6;
    const cw = (CHIPS.w - 24) / perRow;
    const ch = 30;
    const r = current();
    state.jobs.forEach((job, i) => {
      const col = i % perRow;
      const row = Math.floor(i / perRow);
      const x = CHIPS.x + 12 + col * cw;
      const y = CHIPS.y + 12 + row * ch;
      if (y > CHIPS.y + CHIPS.h - 56) return;
      const pl = r.schedule.placements[i];
      const late = pl.end > job.due + 1e-9;
      const active = state.selected === i;
      ctx.fillStyle = active ? "rgba(111,240,200,0.12)" : "#0d161c";
      ctx.fillRect(x, y, cw - 8, ch - 6);
      ctx.strokeStyle = active ? "#6ff0c8" : late ? "#7a3b3b" : "#1f303a";
      ctx.strokeRect(x + 0.5, y + 0.5, cw - 9, ch - 7);
      ctx.fillStyle = JOB_COLOURS[i % JOB_COLOURS.length];
      ctx.fillRect(x + 1, y + 1, 4, ch - 8);
      ctx.fillStyle = "#eaf2f7";
      ctx.font = "9.5px ui-monospace, Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("J" + (i + 1) + "  p" + job.p, x + 9, y + 12);
      ctx.fillStyle = "#6f8493";
      ctx.font = "9px ui-monospace, Menlo, monospace";
      ctx.fillText("due " + job.due, x + 9, y + 21);
      ctx.textAlign = "right";
      ctx.fillStyle = late ? "#ff9f6e" : "#6ff0c8";
      ctx.fillText(late ? "+" + (pl.end - job.due) : "ok", x + cw - 13, y + 21);
    });
  }

  function drawInfo() {
    panel(INFO, "at a glance", "");
    const r = current();
    const lines = [
      ["machines", String(state.machines)],
      ["jobs", String(state.jobs.length)],
      ["work", String(state.jobs.reduce((a, j) => a + j.p, 0))],
      ["lower bound", String(r.lowerBound)],
      ["makespan", String(r.schedule.makespan)],
      ["gap to bound", r.schedule.makespan > 0 ? ((100 * (r.schedule.makespan - r.lowerBound)) / r.schedule.makespan).toFixed(0) + "%" : "—"],
      ["total flow", String(r.schedule.flow)],
      ["mean flow", (r.schedule.flow / state.jobs.length).toFixed(1)],
      ["late jobs", r.lateCount + "/" + state.jobs.length],
      ["worst slip", (r.maxLate > 0 ? "+" : "") + r.maxLate],
    ];
    lines.forEach((row, i) => {
      const y = INFO.y + 20 + i * 16.4;
      ctx.fillStyle = "#6f8493";
      ctx.font = "9.5px ui-monospace, Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText(row[0], INFO.x + 12, y);
      ctx.fillStyle = "#d6e4ec";
      ctx.textAlign = "right";
      ctx.fillText(row[1], INFO.x + INFO.w - 12, y);
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#070c10";
    ctx.fillRect(0, 0, W, H);
    if (!state.results.length) return;
    drawGantt();
    drawRules();
    drawChips();
    drawInfo();

    ctx.fillStyle = "#6f8493";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(
      `${state.jobs.length} jobs · ${state.machines} machine${state.machines > 1 ? "s" : ""} · spread ${state.spread}% · slack ${state.slack.toFixed(2)}×`,
      26,
      H - 16
    );
    ctx.textAlign = "right";
    ctx.fillStyle = "#6ff0c8";
    ctx.fillText("identical machines, list scheduling", W - 26, H - 16);
    ctx.textAlign = "left";
  }

  /* ------------------------------------------------------------- controls */

  function setRule(index) {
    state.ruleIndex = (index + RULE_LIST.length) % RULE_LIST.length;
    updateReadouts();
    describe();
    draw();
  }

  function applyPreset(name, button) {
    ["balanced", "tight", "single"].forEach((key) =>
      el("preset-" + key).classList.toggle("active", key === button)
    );
    if (name === "balanced") {
      state.jobCount = 14;
      state.machines = 3;
      state.spread = 60;
      state.slack = 1.2;
      state.ruleIndex = 1;
    } else if (name === "tight") {
      state.jobCount = 18;
      state.machines = 2;
      state.spread = 80;
      state.slack = 0.8;
      state.ruleIndex = 3;
    } else {
      state.jobCount = 10;
      state.machines = 1;
      state.spread = 55;
      state.slack = 1.0;
      state.ruleIndex = 1;
    }
    el("jobs").value = String(state.jobCount);
    el("machines").value = String(state.machines);
    el("spread").value = String(state.spread);
    el("slack").value = String(state.slack);
    rebuild(true);
  }

  const point = (evt) => {
    const rect = canvas.getBoundingClientRect();
    return [
      (evt.clientX - rect.left) * (W / (rect.width || W)),
      (evt.clientY - rect.top) * (H / (rect.height || H)),
    ];
  };

  canvas.addEventListener("pointerdown", (evt) => {
    const [x, y] = point(evt);
    // rule list
    if (x >= RULES.x && x <= RULES.x + RULES.w && y >= RULES.y + 10 && y <= RULES.y + 10 + 5 * 58) {
      const index = Math.floor((y - (RULES.y + 10)) / 58);
      if (index >= 0 && index < state.results.length) setRule(index);
      return;
    }
    // gantt blocks
    const left = GANTT.x + 58;
    const right = GANTT.x + GANTT.w - 16;
    const top = GANTT.y + 26;
    const rowH = Math.min(84, (GANTT.h - 56) / state.machines);
    const tMax = timeMax();
    if (x >= left && x <= right && y >= top && y <= top + rowH * state.machines) {
      const machine = Math.floor((y - top) / rowH);
      const t = ((x - left) / (right - left)) * tMax;
      const r = current();
      const hit = state.jobs.findIndex((job, i) => {
        const pl = r.schedule.placements[i];
        return pl.machine === machine && t >= pl.start && t <= pl.end;
      });
      state.selected = hit;
      updateReadouts();
      describe();
      draw();
      return;
    }
    // chips
    const perRow = 6;
    const cw = (CHIPS.w - 24) / perRow;
    if (x >= CHIPS.x + 12 && x <= CHIPS.x + CHIPS.w - 12 && y >= CHIPS.y + 12 && y <= CHIPS.y + CHIPS.h - 30) {
      const col = Math.floor((x - (CHIPS.x + 12)) / cw);
      const row = Math.floor((y - (CHIPS.y + 12)) / 30);
      const index = row * perRow + col;
      if (index >= 0 && index < state.jobs.length) {
        state.selected = state.selected === index ? -1 : index;
        updateReadouts();
        describe();
        draw();
      }
    }
  });

  el("jobs").addEventListener("input", (evt) => {
    state.jobCount = Math.max(4, Math.min(24, Number(evt.target.value) || 14));
    rebuild(false);
  });
  el("machines").addEventListener("input", (evt) => {
    state.machines = Math.max(1, Math.min(4, Number(evt.target.value) || 3));
    rebuild(false);
  });
  el("spread").addEventListener("input", (evt) => {
    state.spread = Math.max(0, Math.min(100, Number(evt.target.value) || 0));
    rebuild(false);
  });
  el("slack").addEventListener("input", (evt) => {
    state.slack = Math.max(0.7, Math.min(1.8, Number(evt.target.value) || 1.2));
    rebuild(false);
  });

  el("preset-balanced").addEventListener("click", () => applyPreset("balanced", "balanced"));
  el("preset-tight").addEventListener("click", () => applyPreset("tight", "tight"));
  el("preset-single").addEventListener("click", () => applyPreset("single", "single"));
  el("reshuffle").addEventListener("click", () => rebuild(true));
  el("rule").addEventListener("click", () => setRule(state.ruleIndex + 1));

  document.addEventListener("keydown", (evt) => {
    if (evt.key === " ") {
      evt.preventDefault();
      setRule(state.ruleIndex + 1);
    } else if (evt.key === "r" || evt.key === "R") {
      rebuild(true);
    } else if (/^[1-5]$/.test(evt.key)) {
      setRule(Number(evt.key) - 1);
    }
  });

  window.__lab = {
    state,
    RULE_LIST,
    generateJobs,
    listSchedule,
    evaluate,
    rebuild,
    setRule,
    applyPreset,
    describe,
    updateReadouts,
    draw,
    current,
  };

  rebuild(true);
})();
