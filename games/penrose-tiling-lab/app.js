"use strict";

// Penrose Tiling Lab — a pentagrid construction of the rhombus tiling.
//
// Five families of equally spaced parallel lines are drawn across the plane.
// Every intersection of two lines from different families becomes a vertex,
// and four such intersections that belong to two adjacent lines of each of
// two families bound one rhombus. The result is an aperiodic Penrose tiling:
// thick (72°) and thin (36°) rhombi in the golden ratio.

const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d", { alpha: false });
const W = (canvas.width = 760);
const H = (canvas.height = 600);
const CX = W / 2;
const CY = H / 2;
const TAU = Math.PI * 2;
const PHI = (1 + Math.sqrt(5)) / 2;

const PALETTES = {
  ink: {
    background: "#0a0a07",
    thick: ["#e8c778", "#d9a94f", "#f0d79b"],
    thin: ["#3b3b2a", "#4a4a34", "#2f2f21"],
    seam: "rgba(255, 214, 130, 0.22)",
  },
  sunset: {
    background: "#150a12",
    thick: ["#ff9a5c", "#f2703f", "#ffbe84"],
    thin: ["#431d3a", "#532449", "#39182f"],
    seam: "rgba(255, 170, 140, 0.22)",
  },
  emerald: {
    background: "#04120f",
    thick: ["#6fe0b0", "#43b78c", "#9bf2cc"],
    thin: ["#10352c", "#15473a", "#0c2a24"],
    seam: "rgba(140, 240, 200, 0.2)",
  },
  frost: {
    background: "#070c14",
    thick: ["#9fd0ff", "#6ba7e6", "#c9e6ff"],
    thin: ["#1a2b44", "#22374f", "#142436"],
    seam: "rgba(170, 210, 255, 0.22)",
  },
};

const FAMILY_COLOURS = ["#ff9a5c", "#ffd27a", "#9bf2cc", "#8fb8ff", "#d3a3ff"];

const state = {
  patch: 6,
  rotation: 0,
  zoom: 1,
  palette: "ink",
  outline: true,
  colourByFamily: false,
  origin: { x: 0, y: 0 },
  tiles: [],
  thick: 0,
  thin: 0,
  scale: 60,
  viewRotation: 0,
};

const $ = (id) => document.getElementById(id);

function fract(value) {
  return value - Math.floor(value);
}

function familyAngle(j) {
  // The grid itself stays fixed; rotation is applied to the view only.
  return (TAU * j) / 5;
}

// Irrational-looking offsets keep the grid generic, so no three lines meet.
function familyOffset(j) {
  return fract((j + 1) * (PHI - 1) + 0.137 + state.origin.x * 0.0173 + state.origin.y * 0.0119);
}

function lineNormal(j) {
  const angle = familyAngle(j);
  return { x: Math.cos(angle), y: Math.sin(angle) };
}

// Solve P · n_i = c_i and P · n_j = c_j for the intersection point P.
function intersect(i, ci, j, cj) {
  const a = lineNormal(i);
  const b = lineNormal(j);
  const det = a.x * b.y - a.y * b.x;
  if (Math.abs(det) < 1e-9) return null;
  return {
    x: (ci * b.y - cj * a.y) / det,
    y: (a.x * cj - b.x * ci) / det,
  };
}

function cellVertex(k) {
  // Dual vertex of a pentagrid cell: sum of (level + offset) along each normal.
  let x = 0;
  let y = 0;
  for (let j = 0; j < 5; j++) {
    const level = k[j] + familyOffset(j);
    const normal = lineNormal(j);
    x += level * normal.x;
    y += level * normal.y;
  }
  return { x, y };
}

function cellAt(x, y) {
  const k = new Array(5);
  for (let j = 0; j < 5; j++) {
    const normal = lineNormal(j);
    k[j] = Math.floor(x * normal.x + y * normal.y - familyOffset(j));
  }
  return k;
}

function buildTiles() {
  // Sample a generous index window, then keep only crossings inside a disc.
  // A disc smaller than every pair's sampled parallelogram gives unbiased
  // counts, which is what exposes the golden-ratio mix.
  const n = state.patch * 2;
  const radius = n * 0.5;
  const tiles = [];
  let thick = 0;
  let thin = 0;
  const eps = 1e-4;

  for (let i = 0; i < 5; i++) {
    for (let j = i + 1; j < 5; j++) {
      const gap = Math.min(j - i, 5 - (j - i));
      const isThick = gap === 1;
      const offI = familyOffset(i);
      const offJ = familyOffset(j);
      const ni = lineNormal(i);
      const nj = lineNormal(j);

      for (let k = -n; k <= n; k++) {
        for (let l = -n; l <= n; l++) {
          const crossing = intersect(i, k + offI, j, l + offJ);
          if (!crossing) continue;
          if (Math.hypot(crossing.x, crossing.y) > radius) continue;

          // The four cells around a crossing become the four dual vertices of
          // one rhombus. Sampling just off the crossing identifies them.
          const corners = [];
          for (const si of [-1, 1]) {
            for (const sj of [-1, 1]) {
              const px = crossing.x + eps * (si * ni.x + sj * nj.x);
              const py = crossing.y + eps * (si * ni.y + sj * nj.y);
              const vertex = cellVertex(cellAt(px, py));
              if (!corners.some((c) => Math.abs(c.x - vertex.x) < 1e-9 && Math.abs(c.y - vertex.y) < 1e-9)) {
                corners.push(vertex);
              }
            }
          }
          if (corners.length !== 4) continue;
          if (!corners.every((c) => Math.hypot(c.x, c.y) < radius * 1.35)) continue;

          let cx = 0;
          let cy = 0;
          for (const corner of corners) {
            cx += corner.x;
            cy += corner.y;
          }
          cx /= 4;
          cy /= 4;
          corners.sort((a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx));

          tiles.push({
            points: corners,
            thick: isThick,
            family: i,
            shade: (((k * 7 + l * 13 + i * 5 + j * 3) % 3) + 3) % 3,
            sort: (((i * 31 + j * 17 + k * 3 + l * 5) % 997) + 997) % 997,
          });
          if (isThick) thick++;
          else thin++;
        }
      }
    }
  }

  state.tiles = tiles;
  state.thick = thick;
  state.thin = thin;
  state.radius = radius;
}

function fitScale() {
  const radius = Math.max(1e-6, state.radius || 1);
  state.scale = (Math.min(W, H) * 0.47 * state.zoom) / radius;
  state.midX = 0;
  state.midY = 0;
}

function project(point) {
  const cos = Math.cos(state.viewRotation);
  const sin = Math.sin(state.viewRotation);
  const dx = point.x - (state.midX || 0);
  const dy = point.y - (state.midY || 0);
  return {
    x: CX + (dx * cos - dy * sin) * state.scale,
    y: CY + (dx * sin + dy * cos) * state.scale,
  };
}

function draw() {
  const palette = PALETTES[state.palette] || PALETTES.ink;
  ctx.fillStyle = palette.background;
  ctx.fillRect(0, 0, W, H);

  if (!state.tiles.length) return;

  const ordered = state.tiles.slice().sort((a, b) => a.sort - b.sort);
  for (const tile of ordered) {
    const projected = tile.points.map(project);
    ctx.beginPath();
    ctx.moveTo(projected[0].x, projected[0].y);
    for (let i = 1; i < projected.length; i++) ctx.lineTo(projected[i].x, projected[i].y);
    ctx.closePath();

    if (state.colourByFamily) {
      ctx.fillStyle = FAMILY_COLOURS[tile.family];
      ctx.globalAlpha = tile.thick ? 0.85 : 0.45;
    } else {
      const shades = tile.thick ? palette.thick : palette.thin;
      ctx.fillStyle = shades[tile.shade % shades.length];
      ctx.globalAlpha = 1;
    }
    ctx.fill();
    ctx.globalAlpha = 1;

    if (state.outline) {
      ctx.strokeStyle = palette.seam;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  // Small legend showing thick versus thin rhombi.
  ctx.fillStyle = "rgba(10, 10, 7, 0.72)";
  ctx.fillRect(12, H - 52, 250, 40);
  ctx.fillStyle = palette.thick[0];
  ctx.beginPath();
  ctx.moveTo(24, H - 32);
  ctx.lineTo(44, H - 38);
  ctx.lineTo(58, H - 26);
  ctx.lineTo(38, H - 20);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = palette.thin[1];
  ctx.beginPath();
  ctx.moveTo(72, H - 34);
  ctx.lineTo(96, H - 36);
  ctx.lineTo(104, H - 24);
  ctx.lineTo(80, H - 22);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#b7b19a";
  ctx.font = "11px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.fillText("thick 72°", 116, H - 27);
  ctx.fillText("thin 36°", 186, H - 27);
}

function rebuild(message) {
  buildTiles();
  fitScale();
  draw();
  const total = state.thick + state.thin;
  const ratio = state.thin ? state.thick / state.thin : 0;
  $("tiles-read").textContent = `${total.toLocaleString("en-US")} rhombi`;
  $("ratio-read").textContent = `thick/thin ${ratio.toFixed(3)} · φ 1.618`;
  if (message !== false) {
    setStatus(
      message ||
        `${total.toLocaleString("en-US")} rhombi — ${state.thick.toLocaleString("en-US")} thick, ${state.thin.toLocaleString("en-US")} thin; thick/thin ${ratio.toFixed(3)} against φ = ${PHI.toFixed(3)} — the boundary of the patch keeps a little sampling noise.`
    );
  }
}

function setStatus(text) {
  $("status").textContent = text;
}

function syncLabels() {
  $("patch-out").textContent = String(state.patch);
  $("rotation-out").textContent = `${Math.round(((state.rotation % 360) + 360) % 360)}°`;
  $("zoom-out").textContent = `${state.zoom.toFixed(2)}×`;
}

function bind() {
  $("shuffle").addEventListener("click", () => {
    state.origin = {
      x: state.origin.x + 0.618,
      y: state.origin.y + 0.382,
    };
    rebuild("Grid shifted — a new patch of the same aperiodic tiling.");
  });

  $("reset").addEventListener("click", () => {
    state.origin = { x: 0, y: 0 };
    state.rotation = 0;
    state.viewRotation = 0;
    state.zoom = 1;
    $("rotation").value = "0";
    $("zoom").value = "1";
    syncLabels();
    rebuild("Grid reset to the reference patch.");
  });

  $("patch").addEventListener("input", (event) => {
    state.patch = Number(event.target.value);
    syncLabels();
    rebuild();
  });

  $("rotation").addEventListener("input", (event) => {
    state.rotation = Number(event.target.value);
    state.viewRotation = state.rotation * (Math.PI / 180);
    syncLabels();
    draw();
    setStatus(`View rotated ${Math.round(state.rotation)}° — the tiling itself is unchanged.`);
  });

  $("zoom").addEventListener("input", (event) => {
    state.zoom = Number(event.target.value);
    syncLabels();
    fitScale();
    draw();
    setStatus(`Zoom ${state.zoom.toFixed(2)}×.`);
  });

  $("palette").addEventListener("change", (event) => {
    state.palette = event.target.value;
    draw();
    setStatus(`Palette: ${event.target.value}.`);
  });

  $("outline").addEventListener("change", (event) => {
    state.outline = event.target.checked;
    draw();
  });

  $("colourByFamily").addEventListener("change", (event) => {
    state.colourByFamily = event.target.checked;
    draw();
    setStatus(event.target.checked ? "Colours now trace the five pentagrid families." : "Colours follow thick and thin rhombi.");
  });

  canvas.addEventListener("pointerdown", (event) => {
    const rect = canvas.getBoundingClientRect();
    state.origin = {
      x: ((event.clientX - rect.left) / rect.width) * 4 - 2,
      y: ((event.clientY - rect.top) / rect.height) * 4 - 2,
    };
    rebuild("Grid origin moved to your click.");
  });

  window.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
      event.preventDefault();
      $("shuffle").click();
    } else if (event.key === "r" || event.key === "R") {
      $("reset").click();
    }
  });
}

function init() {
  state.patch = Number($("patch").value) || state.patch;
  state.rotation = Number($("rotation").value) || 0;
  state.viewRotation = state.rotation * (Math.PI / 180);
  state.zoom = Number($("zoom").value) || 1;
  state.palette = $("palette").value || state.palette;
  state.outline = Boolean($("outline").checked);
  state.colourByFamily = Boolean($("colourByFamily").checked);
  state.origin = { x: 0, y: 0 };
  syncLabels();
  bind();
  rebuild();
}

init();
