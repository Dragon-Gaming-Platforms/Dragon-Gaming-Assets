(() => {
  "use strict";

  // Four candidates, five rules. Every number on screen comes from the chosen
  // voter profile: first choices, pairwise counts, IRV transfers, Borda points
  // and top-two approval. The presets are real profiles, not hand-picked totals.

  const el = (id) => document.getElementById(id);
  const canvas = el("scene");
  const ctx = canvas.getContext("2d");

  const W = canvas.width || 880;
  const H = canvas.height || 660;

  const NAMES = ["Alice", "Bob", "Cleo", "Dev"];
  const TAGS = ["A", "B", "C", "D"];
  const COLOURS = ["#6ff0c8", "#8fb3ff", "#ffb45f", "#d59bff"];

  // 0 = Alice, 1 = Bob, 2 = Cleo, 3 = Dev
  const PRESETS = {
    spoiler: {
      label: "Spoiler",
      blocs: [
        { weight: 34, ranking: [0, 1, 2, 3] },
        { weight: 33, ranking: [1, 0, 2, 3] },
        { weight: 33, ranking: [2, 1, 0, 3] },
      ],
    },
    cycle: {
      label: "Cycle",
      blocs: [
        { weight: 40, ranking: [0, 1, 2, 3] },
        { weight: 35, ranking: [1, 2, 0, 3] },
        { weight: 25, ranking: [2, 0, 1, 3] },
      ],
    },
    borda: {
      label: "Borda push",
      blocs: [
        { weight: 40, ranking: [0, 1, 2, 3] },
        { weight: 35, ranking: [1, 2, 3, 0] },
        { weight: 25, ranking: [2, 1, 3, 0] },
      ],
    },
    consensus: {
      label: "Consensus",
      blocs: [
        { weight: 55, ranking: [0, 1, 2, 3] },
        { weight: 25, ranking: [1, 0, 3, 2] },
        { weight: 20, ranking: [2, 0, 3, 1] },
      ],
    },
  };

  const state = {
    preset: "spoiler",
    thirdShare: 33,
    voters: 1000,
    selected: 0,
    blocs: [],
    result: null,
    statusKind: "",
  };

  /* ------------------------------------------------------------- the maths */

  function buildBlocs() {
    const base = PRESETS[state.preset].blocs;
    const w3 = state.thirdShare;
    const rest = 100 - w3;
    const baseRest = base[0].weight + base[1].weight;
    const weights = base.slice(0, 2).map((b) => (b.weight / baseRest) * rest);
    weights.push(w3);

    const counts = weights.map((w) => Math.round((w / 100) * state.voters));
    counts[2] = state.voters - counts[0] - counts[1];
    return base.map((bloc, i) => ({
      count: Math.max(0, counts[i]),
      ranking: bloc.ranking.slice(),
      weight: weights[i],
    }));
  }

  function firstChoices(blocs) {
    const totals = NAMES.map(() => 0);
    blocs.forEach((bloc) => {
      if (bloc.ranking.length) totals[bloc.ranking[0]] += bloc.count;
    });
    return totals;
  }

  function pairwise(blocs) {
    const matrix = NAMES.map(() => NAMES.map(() => 0));
    blocs.forEach((bloc) => {
      for (let i = 0; i < bloc.ranking.length; i++) {
        for (let j = i + 1; j < bloc.ranking.length; j++) {
          matrix[bloc.ranking[i]][bloc.ranking[j]] += bloc.count;
        }
      }
    });
    return matrix;
  }

  function plurality(blocs) {
    const totals = firstChoices(blocs);
    const best = Math.max(...totals);
    return { totals, winner: totals.indexOf(best), tie: totals.filter((t) => t === best).length > 1 };
  }

  function irv(blocs) {
    // Start from candidates who actually have a first-choice vote: a candidate
    // on zero cannot win and would only add a pointless elimination round.
    let alive = NAMES.map((_, i) => i).filter((i) => firstChoices(blocs)[i] > 0);
    const rounds = [];
    let winner = null;

    while (alive.length > 1) {
      const totals = NAMES.map(() => 0);
      blocs.forEach((bloc) => {
        const pick = bloc.ranking.find((c) => alive.includes(c));
        if (pick !== undefined) totals[pick] += bloc.count;
      });
      const best = Math.max(...alive.map((i) => totals[i]));
      if (alive.filter((i) => totals[i] === best).length > 1 && alive.length === 2) {
        rounds.push({ totals, eliminated: null });
        winner = alive.find((i) => totals[i] === best);
        break;
      }
      if (alive.filter((i) => totals[i] === best).length === 1 && best > blocs.reduce((a, b) => a + b.count, 0) / 2) {
        rounds.push({ totals, eliminated: null });
        winner = alive.find((i) => totals[i] === best);
        break;
      }
      // eliminate the weakest: fewest votes, then later name alphabetically
      const weakest = alive
        .filter((i) => i !== undefined)
        .sort((a, b) => totals[a] - totals[b] || NAMES[b].localeCompare(NAMES[a]))[0];
      rounds.push({ totals, eliminated: weakest });
      alive = alive.filter((i) => i !== weakest);
      if (alive.length === 1) winner = alive[0];
    }
    if (winner === null && alive.length === 1) winner = alive[0];
    return { rounds, winner };
  }

  function borda(blocs) {
    const scores = NAMES.map(() => 0);
    blocs.forEach((bloc) => {
      bloc.ranking.forEach((candidate, place) => {
        scores[candidate] += bloc.count * (NAMES.length - place);
      });
    });
    const best = Math.max(...scores);
    const order = NAMES.map((_, i) => i).sort((a, b) => scores[b] - scores[a]);
    return { scores, order, winner: order[0] };
  }

  function approval(blocs) {
    // Approval is not in a ranked ballot, so the rule is stated: each voter
    // approves their top two preferences.
    const totals = NAMES.map(() => 0);
    blocs.forEach((bloc) => {
      bloc.ranking.slice(0, 2).forEach((candidate) => {
        totals[candidate] += bloc.count;
      });
    });
    const best = Math.max(...totals);
    return { totals, winner: totals.indexOf(best) };
  }

  function condorcet(matrix, blocs) {
    const total = blocs.reduce((a, b) => a + b.count, 0);
    const beats = NAMES.map((_, i) => NAMES.map((_, j) => matrix[i][j] > matrix[j][i]));
    const winner = NAMES.map((_, i) => i).find((i) =>
      NAMES.every((_, j) => j === i || beats[i][j])
    );
    // find a three-way cycle for the explanation
    let cycle = null;
    for (let a = 0; a < NAMES.length && !cycle; a++) {
      for (let b = 0; b < NAMES.length && !cycle; b++) {
        for (let c = 0; c < NAMES.length && !cycle; c++) {
          if (a !== b && b !== c && a !== c && beats[a][b] && beats[b][c] && beats[c][a]) {
            cycle = [a, b, c];
          }
        }
      }
    }
    const leaders = NAMES.map((_, i) => i)
      .filter((i) => beats[i].filter(Boolean).length >= NAMES.length - 2)
      .sort((a, b) => beats[b].filter(Boolean).length - beats[a].filter(Boolean).length);
    return { winner: winner === undefined ? null : winner, cycle, leaders, beats, total };
  }

  function compute() {
    const blocs = buildBlocs();
    const matrix = pairwise(blocs);
    return {
      blocs,
      plurality: plurality(blocs),
      irv: irv(blocs),
      borda: borda(blocs),
      approval: approval(blocs),
      condorcet: condorcet(matrix, blocs),
      matrix,
      total: blocs.reduce((a, b) => a + b.count, 0),
    };
  }

  function rebuild() {
    state.blocs = buildBlocs();
    state.result = compute();
    updateReadouts();
    describe();
    draw();
  }

  /* ------------------------------------------------------------- readouts */

  function name(i) {
    return i === null || i === undefined ? "—" : NAMES[i];
  }

  function setStatus(text, kind) {
    const box = el("status");
    box.textContent = text;
    box.className = "status" + (kind ? " " + kind : "");
    state.statusKind = kind || "";
  }

  function updateReadouts() {
    const r = state.result;
    if (!r) return;
    el("share-out").textContent = state.thirdShare + "%";
    el("voters-out").textContent = state.result.total.toLocaleString("en-US");
    el("plurality-read").textContent = name(r.plurality.winner);
    el("irv-read").textContent = name(r.irv.winner);
    el("borda-read").textContent = name(r.borda.winner);
    el("approval-read").textContent = name(r.approval.winner);
    el("condorcet-read").textContent = r.condorcet.winner === null ? "cycle" : name(r.condorcet.winner);

    const winners = new Set([
      r.plurality.winner,
      r.irv.winner,
      r.borda.winner,
      r.approval.winner,
      r.condorcet.winner,
    ]);
    if (r.condorcet.winner === null) winners.delete(null);
    el("agree-read").textContent = winners.size === 1 ? "unanimous" : winners.size + " answers";

    el("plurality-hud").textContent = "plurality " + name(r.plurality.winner);
    el("irv-hud").textContent = "IRV " + name(r.irv.winner);
    el("condorcet-hud").textContent =
      "Condorcet " + (r.condorcet.winner === null ? "none" : name(r.condorcet.winner));
  }

  function describe() {
    const r = state.result;
    const winners = [r.plurality, r.irv, r.borda, r.approval].map((m) => m.winner);
    const unique = [...new Set(winners)];

    if (r.condorcet.winner === null && r.condorcet.cycle) {
      const [a, b, c] = r.condorcet.cycle;
      setStatus(
        `No Condorcet winner: ${NAMES[a]} beats ${NAMES[b]}, ${NAMES[b]} beats ${NAMES[c]}, and ${NAMES[c]} beats ${NAMES[a]}. ` +
          `Plurality says ${name(r.plurality.winner)}, IRV says ${name(r.irv.winner)} and Borda says ${name(
            r.borda.winner
          )}. A majority rule that needs a single ranking simply has no answer here.`,
        "warn"
      );
      return;
    }

    if (unique.length === 1) {
      setStatus(
        `All four ranked rules agree on ${name(unique[0])}, and Condorcet ${
          r.condorcet.winner === unique[0] ? "agrees too" : "disagrees"
        }. Change the third bloc's share and watch the agreement break.`,
        "good"
      );
      return;
    }

    const spoiler =
      r.plurality.winner !== r.irv.winner
        ? ` Plurality elects ${name(r.plurality.winner)} on first preferences alone, but after transfers IRV lands on ${name(
            r.irv.winner
          )}.`
        : "";
    setStatus(
      `The same ${r.total.toLocaleString("en-US")} voters produce ${unique.length} different winners: ${unique
        .map(name)
        .join(", ")}.${spoiler} Borda puts ${NAMES[r.borda.order[0]]} first with ${
        r.borda.scores[r.borda.order[0]]
      } points against ${r.borda.scores[r.borda.order[1]]} for ${
        NAMES[r.borda.order[1]]
      }, and approval (top two) favours ${name(r.approval.winner)}.`,
      "warn"
    );
  }

  /* -------------------------------------------------------------- drawing */

  const BAR_BOX = { x: 26, y: 62, w: 384, h: 216 };
  const MATRIX_BOX = { x: 448, y: 62, w: 406, h: 216 };
  const IRV_BOX = { x: 26, y: 300, w: 384, h: 310 };
  const RULE_BOX = { x: 448, y: 300, w: 406, h: 310 };

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
    const r = state.result;
    panel(BAR_BOX, "first choices", `${r.total} voters`);
    const totals = r.plurality.totals;
    const max = Math.max(...totals, 1);
    const left = BAR_BOX.x + 62;
    const right = BAR_BOX.x + BAR_BOX.w - 46;
    const span = right - left;
    totals.forEach((count, i) => {
      const y = BAR_BOX.y + 24 + i * 40;
      const w = (count / max) * span;
      ctx.fillStyle = "rgba(255,255,255,0.04)";
      ctx.fillRect(left, y, span, 24);
      ctx.fillStyle = COLOURS[i];
      ctx.globalAlpha = state.selected === i ? 0.95 : 0.55;
      ctx.fillRect(left, y, Math.max(2, w), 24);
      ctx.globalAlpha = 1;
      if (state.selected === i) {
        ctx.strokeStyle = COLOURS[i];
        ctx.strokeRect(left - 3.5, y - 3.5, span + 7, 31);
      }
      ctx.fillStyle = "#c7d8e2";
      ctx.font = "11px ui-monospace, Menlo, monospace";
      ctx.textAlign = "right";
      ctx.fillText(TAGS[i] + " " + NAMES[i], left - 8, y + 16);
      ctx.fillStyle = "#eaf2f7";
      ctx.textAlign = "left";
      ctx.font = "11px ui-monospace, Menlo, monospace";
      ctx.fillText(count + " · " + ((100 * count) / r.total).toFixed(0) + "%", left + w + 6, y + 16);
    });
  }

  function drawMatrix() {
    const r = state.result;
    panel(MATRIX_BOX, "pairwise preferences", "row beats column");
    const cellW = 62;
    const cellH = 36;
    const top = MATRIX_BOX.y + 32;
    const left = MATRIX_BOX.x + 44;

    ctx.font = "10px ui-monospace, Menlo, monospace";
    ctx.textAlign = "center";
    TAGS.forEach((tag, i) => {
      ctx.fillStyle = COLOURS[i];
      ctx.fillText(tag, left + cellW * i + cellW / 2, top - 6);
      ctx.textAlign = "right";
      ctx.fillText(tag, left - 8, top + cellH * i + cellH / 2 + 4);
      ctx.textAlign = "center";
    });

    NAMES.forEach((_, row) => {
      NAMES.forEach((__, col) => {
        const x = left + cellW * col;
        const y = top + cellH * row;
        const cell = cellW;
        if (row === col) {
          ctx.fillStyle = "#0d161c";
          ctx.fillRect(x + 2, y + 2, cellW - 4, cellH - 4);
          return;
        }
        const wins = r.matrix[row][col];
        const losses = r.matrix[col][row];
        const won = wins > losses;
        ctx.fillStyle = won ? "rgba(111, 240, 200, 0.16)" : "rgba(255, 159, 110, 0.13)";
        ctx.fillRect(x + 2, y + 2, cellW - 4, cellH - 4);
        if (row === state.selected) {
          ctx.strokeStyle = COLOURS[row];
          ctx.lineWidth = 1.2;
          ctx.strokeRect(x + 2.5, y + 2.5, cellW - 5, cellH - 5);
          ctx.lineWidth = 1;
        }
        ctx.fillStyle = won ? "#bff7e6" : "#f6c6a8";
        ctx.font = "10.5px ui-monospace, Menlo, monospace";
        ctx.textAlign = "center";
        ctx.fillText(wins + "–" + losses, x + cellW / 2, y + cellH / 2 + 4);
      });
    });

    ctx.fillStyle = "#55697a";
    ctx.textAlign = "left";
    ctx.font = "9.5px ui-monospace, Menlo, monospace";
    ctx.fillText(
      r.condorcet.winner === null
        ? "no candidate wins every head-to-head"
        : `${NAMES[r.condorcet.winner]} wins every head-to-head`,
      MATRIX_BOX.x + 12,
      MATRIX_BOX.y + MATRIX_BOX.h - 10
    );
  }

  function drawIrv() {
    const r = state.result;
    panel(IRV_BOX, "instant runoff", "lowest out, votes transfer");
    const rounds = r.irv.rounds;
    const left = IRV_BOX.x + 52;
    const span = IRV_BOX.w - 130;

    let y = IRV_BOX.y + 22;
    rounds.forEach((round, ri) => {
      const aliveCount = NAMES.filter((_, i) => round.totals[i] > 0).length;
      const rowH = aliveCount > 2 ? 17 : 21;
      ctx.fillStyle = "#7e93a2";
      ctx.font = "9.5px ui-monospace, Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText("round " + (ri + 1), IRV_BOX.x + 10, y);
      if (round.eliminated !== null) {
        ctx.fillStyle = "#ffb45f";
        ctx.textAlign = "right";
        ctx.fillText(`out: ${TAGS[round.eliminated]} (${round.totals[round.eliminated]})`, IRV_BOX.x + IRV_BOX.w - 10, y);
      }
      y += 10;

      const max = Math.max(...round.totals, 1);
      const order = NAMES.map((_, i) => i)
        .filter((i) => round.totals[i] > 0)
        .sort((a, b) => round.totals[b] - round.totals[a]);

      order.forEach((i) => {
        const dead = round.eliminated === i;
        const w = Math.max(1, (round.totals[i] / max) * span);
        ctx.fillStyle = COLOURS[i];
        ctx.globalAlpha = dead ? 0.22 : 0.72;
        ctx.fillRect(left, y - 8, w, 10);
        ctx.globalAlpha = 1;
        ctx.fillStyle = dead ? "#6b7d89" : "#c7d8e2";
        ctx.font = "9.5px ui-monospace, Menlo, monospace";
        ctx.textAlign = "right";
        ctx.fillText((dead ? "✕ " : "") + TAGS[i], left - 8, y);
        ctx.textAlign = "left";
        ctx.fillStyle = dead ? "#6b7d89" : "#93a8b7";
        ctx.fillText(String(round.totals[i]), left + w + 6, y);
        y += rowH;
      });
      y += 10;
    });

    const last = rounds[rounds.length - 1];
    const majority = Math.floor(r.total / 2) + 1;
    ctx.fillStyle = "#55697a";
    ctx.font = "9.5px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(`a majority is ${majority} of ${r.total}; the last round decides`, IRV_BOX.x + 10, IRV_BOX.y + IRV_BOX.h - 46);
    if (last && r.irv.winner !== null) {
      const share = (100 * last.totals[r.irv.winner]) / r.total;
      ctx.fillText(
        `transfers stop when ${NAMES[r.irv.winner]} passes 50% — ${last.totals[r.irv.winner]} votes, ${share.toFixed(
          0
        )}%`,
        IRV_BOX.x + 10,
        IRV_BOX.y + IRV_BOX.h - 30
      );
    }

    ctx.fillStyle = "#6ff0c8";
    ctx.font = "10px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(
      "winner " + (r.irv.winner === null ? "—" : NAMES[r.irv.winner]),
      IRV_BOX.x + 10,
      IRV_BOX.y + IRV_BOX.h - 12
    );
  }

  function drawRules() {
    const r = state.result;
    panel(RULE_BOX, "same voters, five rules", "winner");
    const rows = [
      ["plurality", name(r.plurality.winner), `${r.plurality.totals[r.plurality.winner]} first-choice votes`],
      ["Borda", name(r.borda.winner), `${r.borda.scores[r.borda.winner]} points`],
      ["approval (top 2)", name(r.approval.winner), `${r.approval.totals[r.approval.winner]} approvals`],
      [
        "Condorcet",
        r.condorcet.winner === null ? "no winner" : name(r.condorcet.winner),
        r.condorcet.winner === null ? "head-to-head cycle" : "beats everyone",
      ],
      ["instant runoff", name(r.irv.winner), `${r.irv.rounds.length - 1} elimination${r.irv.rounds.length === 2 ? "" : "s"}`],
    ];

    rows.forEach((row, i) => {
      const y = RULE_BOX.y + 20 + i * 51;
      ctx.fillStyle = "#0d161c";
      ctx.fillRect(RULE_BOX.x + 10, y, RULE_BOX.w - 20, 38);
      ctx.fillStyle = "#7e93a2";
      ctx.font = "10.5px ui-monospace, Menlo, monospace";
      ctx.textAlign = "left";
      ctx.fillText(row[0], RULE_BOX.x + 18, y + 15);
      ctx.fillStyle = "#eaf2f7";
      ctx.font = "600 13px ui-monospace, Menlo, monospace";
      ctx.fillText(row[1], RULE_BOX.x + 18, y + 31);
      ctx.fillStyle = "#55697a";
      ctx.font = "9.5px ui-monospace, Menlo, monospace";
      ctx.textAlign = "right";
      ctx.fillText(row[2], RULE_BOX.x + RULE_BOX.w - 18, y + 23);
    });

    ctx.textAlign = "left";
    ctx.fillStyle = "#55697a";
    ctx.font = "9.5px ui-monospace, Menlo, monospace";
    ctx.fillText(
      "approval counts each voter's top two; Borda awards 4-3-2-1",
      RULE_BOX.x + 12,
      RULE_BOX.y + RULE_BOX.h - 10
    );
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#070c10";
    ctx.fillRect(0, 0, W, H);
    if (!state.result) return;
    drawBars();
    drawMatrix();
    drawIrv();
    drawRules();

    ctx.fillStyle = "#6f8493";
    ctx.font = "11px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    ctx.fillText(
      `${PRESETS[state.preset].label} profile · third bloc ${state.thirdShare}% · ${state.result.total} voters`,
      26,
      H - 18
    );
    ctx.textAlign = "right";
    ctx.fillStyle = "#6ff0c8";
    ctx.fillText(NAMES[state.selected] + " highlighted", W - 26, H - 18);
    ctx.textAlign = "left";
  }

  /* ------------------------------------------------------------- controls */

  function setPreset(key) {
    state.preset = key;
    ["spoiler", "cycle", "borda", "consensus"].forEach((name) =>
      el("preset-" + name).classList.toggle("active", name === key)
    );
    state.selected = PRESETS[key].blocs[0].ranking[0];
    state.thirdShare = PRESETS[key].blocs[2].weight;
    el("share").value = String(state.thirdShare);
    rebuild();
  }

  el("preset-spoiler").addEventListener("click", () => setPreset("spoiler"));
  el("preset-cycle").addEventListener("click", () => setPreset("cycle"));
  el("preset-borda").addEventListener("click", () => setPreset("borda"));
  el("preset-consensus").addEventListener("click", () => setPreset("consensus"));

  el("share").addEventListener("input", (evt) => {
    state.thirdShare = Math.max(10, Math.min(50, Number(evt.target.value) || 33));
    rebuild();
  });
  el("voters").addEventListener("input", (evt) => {
    state.voters = Math.max(100, Math.min(2000, Number(evt.target.value) || 1000));
    rebuild();
  });

  const point = (evt) => {
    const rect = canvas.getBoundingClientRect();
    return [
      (evt.clientX - rect.left) * (W / (rect.width || W)),
      (evt.clientY - rect.top) * (H / (rect.height || H)),
    ];
  };

  canvas.addEventListener("pointerdown", (evt) => {
    const [x, y] = point(evt);
    if (x < BAR_BOX.x || x > BAR_BOX.x + BAR_BOX.w) return;
    if (y < BAR_BOX.y + 18 || y > BAR_BOX.y + 24 + 4 * 40) return;
    const row = Math.floor((y - (BAR_BOX.y + 24)) / 40);
    if (row >= 0 && row < NAMES.length) {
      state.selected = row;
      draw();
      updateReadouts();
    }
  });

  document.addEventListener("keydown", (evt) => {
    const map = { "1": "spoiler", "2": "cycle", "3": "borda", "4": "consensus" };
    if (map[evt.key]) setPreset(map[evt.key]);
  });

  window.__lab = {
    state,
    PRESETS,
    NAMES,
    buildBlocs,
    firstChoices,
    pairwise,
    plurality,
    irv,
    borda,
    approval,
    condorcet,
    compute,
    setPreset,
    rebuild,
    updateReadouts,
    describe,
    draw,
  };

  setPreset("spoiler");
})();
