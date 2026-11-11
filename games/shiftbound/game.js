"use strict";
/*
 * SHIFTBOUND — a tiny two-world platformer for GitHub Game Off 2026 (theme: SHIFT).
 * Pure Canvas + vanilla JS, no dependencies.
 *
 * Core mechanic: press SHIFT (or Space / X) to shift between World A (azure)
 * and World B (ember). Platforms and hazards tagged with a world only exist
 * (solid / deadly) while that world is active; the other world's are ghosts.
 *
 * ASSET NOTE: final art for the player forms, goal portal and world
 * backgrounds is loaded from assets/ (see the asset-loading block below);
 * each draw call falls back to its original Canvas placeholder whenever
 * the image is unavailable. Platforms and spikes are still placeholders,
 * tagged with `ASSET:` comments; see ASSETS.md for the full inventory.
 */

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const W = canvas.width;   // 960
const H = canvas.height;  // 540

/* ------------------------------ asset loading ----------------------------- */
/*
 * Final art lives in assets/ (paths relative to index.html). Every draw
 * function checks imgReady() first and falls back to the original Canvas
 * placeholder drawing when an image is missing, still loading, or failed —
 * the game must never throw or go blank over art.
 */
function loadImage(src) {
  const img = new Image();
  img._ok = false;
  img.onload = () => { img._ok = true; };
  img.onerror = () => { img._ok = false; };
  img.src = src;
  return img;
}
const imgReady = (img) =>
  !!img && img._ok && img.complete && img.naturalWidth > 0;

const IMG = {
  playerA: loadImage("assets/player_a.png"), // World A form (cloud)
  playerB: loadImage("assets/player_b.png"), // World B form (flame)
  portal:  loadImage("assets/portal.png"),   // goal portal
  bgA:     loadImage("assets/bg_a.jpg"),     // World A background, 960x540
  bgB:     loadImage("assets/bg_b.jpg"),     // World B background, 960x540
};

/* ---------------------------------- input --------------------------------- */
const keys = {};
let shiftPressed = false; // edge-triggered

addEventListener("keydown", (e) => {
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space"].includes(e.code)) e.preventDefault();
  if (e.repeat) return;
  keys[e.code] = true;
  if (e.code === "ShiftLeft" || e.code === "ShiftRight" || e.code === "Space" || e.code === "KeyX") {
    shiftPressed = true;
  }
  if (e.code === "Enter") confirmPressed = true;
});
addEventListener("keyup", (e) => { keys[e.code] = false; });
let confirmPressed = false;

const leftDown  = () => keys["ArrowLeft"]  || keys["KeyA"];
const rightDown = () => keys["ArrowRight"] || keys["KeyD"];
const jumpDown  = () => keys["ArrowUp"]    || keys["KeyW"] || keys["KeyZ"];

/* --------------------------------- levels --------------------------------- */
/*
 * world: 0 = exists in both worlds, 1 = World A only, 2 = World B only.
 * Coordinates are pixels in the 960x540 playfield.
 */
const LEVELS = [
  {
    name: "1 · First Shift",
    spawn: { x: 60, y: 440 },
    goal:  { x: 872, y: 400 },
    platforms: [
      { x: 0,   y: 500, w: 300, h: 40, world: 0 },
      { x: 300, y: 500, w: 200, h: 40, world: 1 }, // A bridge over the pit
      { x: 500, y: 500, w: 200, h: 40, world: 2 }, // B bridge over the pit
      { x: 700, y: 500, w: 260, h: 40, world: 0 },
      { x: 380, y: 400, w: 110, h: 18, world: 1 },
      { x: 560, y: 320, w: 110, h: 18, world: 2 },
      { x: 760, y: 440, w: 150, h: 18, world: 0 },
    ],
    spikes: [],
  },
  {
    name: "2 · Leap of Faith",
    spawn: { x: 50, y: 440 },
    goal:  { x: 840, y: 196 },
    platforms: [
      { x: 0,   y: 500, w: 960, h: 40, world: 0 }, // full safety floor: every miss is just a walk back
      { x: 300, y: 440, w: 170, h: 18, world: 1 }, // A step (plain jump from the floor)
      { x: 400, y: 440, w: 170, h: 18, world: 2 }, // B step overlapping A at the same height: stand in the overlap, SHIFT, walk right — no air shifts anywhere in this level
      { x: 620, y: 380, w: 140, h: 18, world: 0 }, // neutral rest platform (plain jump)
      { x: 500, y: 320, w: 140, h: 18, world: 1 }, // A platform (plain jump up-left; SHIFT to A while standing on the neutral platform first)
      { x: 560, y: 320, w: 150, h: 18, world: 2 }, // B platform overlapping A: stand in the overlap, SHIFT, walk right
      { x: 750, y: 260, w: 150, h: 18, world: 0 }, // goal ledge (plain jump)
    ],
    spikes: [],
  },
  {
    name: "3 · Crossfire",
    spawn: { x: 50, y: 440 },
    goal:  { x: 886, y: 60 },
    platforms: [
      { x: 0,   y: 500, w: 170, h: 40, world: 0 },
      { x: 210, y: 440, w: 100, h: 18, world: 2 },
      { x: 350, y: 380, w: 100, h: 18, world: 1 },
      { x: 490, y: 320, w: 100, h: 18, world: 2 },
      { x: 350, y: 260, w: 100, h: 18, world: 1 },
      { x: 490, y: 200, w: 100, h: 18, world: 2 },
      { x: 650, y: 260, w: 110, h: 18, world: 1 },
      { x: 800, y: 190, w: 120, h: 18, world: 0 },
      { x: 840, y: 120, w: 100, h: 18, world: 2 },
      { x: 700, y: 500, w: 260, h: 40, world: 0 },
    ],
    spikes: [
      { x: 170, y: 482, w: 530, h: 18, world: 0 }, // long spike floor in the middle
      { x: 650, y: 242, w: 110, h: 18, world: 2 }, // spikes on top of the A platform (B world)
    ],
  },
];

/* ---------------------------------- state --------------------------------- */
const WORLD_STYLE = [
  null,
  { name: "AZURE", bg0: "#0d1b3e", bg1: "#123058", solid: "#3f8cff", ghost: "#3f8cff", accent: "#9fd0ff" },
  { name: "EMBER", bg0: "#33120a", bg1: "#571f0d", solid: "#ff8a3d", ghost: "#ff8a3d", accent: "#ffd3a1" },
];

let state = "title"; // title | play | win
let levelIndex = 0;
let world = 1;       // active world: 1 = A, 2 = B
let deaths = 0;
let startTime = 0;
let elapsedAtWin = 0;
let message = "";
let messageTimer = 0;
let shiftCooldown = 0;
let deniedFlash = 0;

const player = {
  x: 0, y: 0, w: 30, h: 38,
  vx: 0, vy: 0,
  onGround: false,
  coyote: 0,
  jumpBuffer: 0,
  face: 1,
};

function loadLevel(i) {
  const lv = LEVELS[i];
  player.x = lv.spawn.x;
  player.y = lv.spawn.y;
  player.vx = 0;
  player.vy = 0;
  player.airJumps = 0;
  player.jumpHeld = false;
  world = 1;
  shiftCooldown = 0;
}

function resetRun() {
  levelIndex = 0;
  deaths = 0;
  startTime = performance.now();
  loadLevel(0);
}

function startAt(i) {
  levelIndex = i;
  deaths = 0;
  startTime = performance.now();
  loadLevel(i);
}

function die() {
  deaths++;
  loadLevel(levelIndex);
  message = "Ouch. Shift and try again.";
  messageTimer = 90;
}

/* --------------------------------- physics -------------------------------- */
const GRAVITY = 0.6;
const MOVE = 0.7;
const MAX_RUN = 4.2;
const JUMP_VEL = -12.2;
const MAX_FALL = 15;

function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function activePlatforms() {
  return LEVELS[levelIndex].platforms.filter((p) => p.world === 0 || p.world === world);
}

function tryShift() {
  if (shiftCooldown > 0) return;
  const target = world === 1 ? 2 : 1;
  // Deny the shift if the player would end up inside a platform of the new world.
  const blocked = LEVELS[levelIndex].platforms.some(
    (p) => (p.world === 0 || p.world === target) && overlaps(player, p)
  );
  if (blocked) {
    deniedFlash = 12;
    return;
  }
  world = target;
  shiftCooldown = 10;
}

// Cap a jump's upward velocity so its apex stays inside the screen:
// from height player.y, rising vy^2 / (2*GRAVITY) px, keep 6px margin at top.
function capJump(vy) {
  const room = Math.max(0, player.y - 6);
  const maxUp = Math.sqrt(2 * GRAVITY * room);
  return Math.max(vy, -maxUp);
}

function update() {
  if (state !== "play") return;

  if (shiftPressed) tryShift();
  if (shiftCooldown > 0) shiftCooldown--;
  if (deniedFlash > 0) deniedFlash--;
  if (messageTimer > 0) messageTimer--;

  // horizontal movement
  if (leftDown())  { player.vx -= MOVE; player.face = -1; }
  if (rightDown()) { player.vx += MOVE; player.face = 1; }
  if (!leftDown() && !rightDown()) player.vx *= player.onGround ? 0.7 : 0.92;
  player.vx = Math.max(-MAX_RUN, Math.min(MAX_RUN, player.vx));

  // jumping (coyote time + input buffer, so it feels forgiving)
  // Chained jumps keep getting higher: each fresh press in mid-air jumps
  // again, 22% stronger than the previous jump, up to 5 jumps in a row —
  // so any step in the game can be climbed by chaining jumps.
  if (jumpDown() && !player.jumpHeld) player.jumpBuffer = 8; else if (player.jumpBuffer > 0) player.jumpBuffer--;
  player.jumpHeld = jumpDown();
  if (player.onGround) { player.coyote = 8; player.airJumps = 0; } else if (player.coyote > 0) player.coyote--;
  if (player.jumpBuffer > 0 && player.coyote > 0) {
    player.vy = capJump(JUMP_VEL);
    player.airJumps = 1;
    player.jumpBuffer = 0;
    player.coyote = 0;
  } else if (player.jumpBuffer > 0 && player.airJumps >= 1 && player.airJumps < 5) {
    player.airJumps++;
    player.vy = capJump(JUMP_VEL * (1 + 0.22 * (player.airJumps - 1)));
    player.jumpBuffer = 0;
  }

  player.vy = Math.min(MAX_FALL, player.vy + GRAVITY);

  const solids = activePlatforms();

  // move X, resolve collisions
  player.x += player.vx;
  for (const p of solids) {
    if (overlaps(player, p)) {
      if (player.vx > 0) player.x = p.x - player.w;
      else if (player.vx < 0) player.x = p.x + p.w;
      player.vx = 0;
    }
  }
  player.x = Math.max(0, Math.min(W - player.w, player.x));

  // move Y, resolve collisions
  player.y += player.vy;
  if (player.y < 0) { player.y = 0; if (player.vy < 0) player.vy = 0; } // never leave the top of the screen
  player.onGround = false;
  for (const p of solids) {
    if (overlaps(player, p)) {
      if (player.vy > 0) { player.y = p.y - player.h; player.onGround = true; }
      else if (player.vy < 0) { player.y = p.y + p.h; }
      player.vy = 0;
    }
  }

  // hazards of the active world (world 0 hazards exist in both)
  const lv = LEVELS[levelIndex];
  for (const s of lv.spikes) {
    if ((s.world === 0 || s.world === world) && overlaps(player, s)) { die(); return; }
  }

  // fell out of the world
  if (player.y > H + 60) { die(); return; }

  // goal
  const goalBox = { x: lv.goal.x, y: lv.goal.y, w: 44, h: 64 };
  if (overlaps(player, goalBox)) {
    if (levelIndex === LEVELS.length - 1) {
      elapsedAtWin = (performance.now() - startTime) / 1000;
      state = "win";
    } else {
      levelIndex++;
      loadLevel(levelIndex);
      message = LEVELS[levelIndex].name;
      messageTimer = 120;
    }
  }
}

/* ---------------------------------- drawing ------------------------------- */
function drawBackground() {
  // Final art: per-world background image (ASSETS.md #10/#11), exactly
  // 960x540 so it fills the playfield 1:1. Fallback: the original
  // gradient. Either way a faint layer of drifting shapes stays on top
  // for a subtle sense of motion.
  const st = WORLD_STYLE[world];
  const bg = world === 1 ? IMG.bgA : IMG.bgB;
  if (imgReady(bg)) {
    ctx.drawImage(bg, 0, 0, W, H);
  } else {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, st.bg0);
    g.addColorStop(1, st.bg1);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  ctx.globalAlpha = 0.12;
  ctx.fillStyle = st.accent;
  const t = performance.now() / 1000;
  for (let i = 0; i < 7; i++) {
    const x = ((i * 173 + t * (8 + i * 2)) % (W + 120)) - 60;
    const y = 60 + ((i * 89) % 380);
    ctx.beginPath();
    ctx.arc(x, y, 22 + (i % 3) * 14, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawPlatforms() {
  const st = WORLD_STYLE[world];
  for (const p of LEVELS[levelIndex].platforms) {
    if (p.world === 0) {
      ctx.fillStyle = "#8d99c9";
    } else if (p.world === world) {
      ctx.fillStyle = st.solid;
    } else {
      ctx.globalAlpha = 0.15; // inactive world: ghost only, not solid
      ctx.fillStyle = WORLD_STYLE[p.world].ghost;
    }
    // ASSET: platform tiles (neutral / A / B), tileable 48x48 — currently flat blocks.
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(p.x, p.y, p.w, 4);
    ctx.globalAlpha = 1;
  }
}

function drawSpikes() {
  for (const s of LEVELS[levelIndex].spikes) {
    const active = s.world === 0 || s.world === world;
    // ASSET: spike tiles, 30x18 each — currently triangles.
    ctx.fillStyle = s.world === 0 ? "#e8ecff" : WORLD_STYLE[s.world].solid;
    ctx.globalAlpha = active ? 1 : 0.15;
    const n = Math.max(1, Math.round(s.w / 30));
    const step = s.w / n;
    for (let i = 0; i < n; i++) {
      const x = s.x + i * step;
      ctx.beginPath();
      ctx.moveTo(x, s.y + s.h);
      ctx.lineTo(x + step / 2, s.y);
      ctx.lineTo(x + step, s.y + s.h);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

function drawGoal() {
  const lv = LEVELS[levelIndex];
  const cx = lv.goal.x + 22;
  const cy = lv.goal.y + 32;
  const pulse = 1 + Math.sin(performance.now() / 300) * 0.08;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(pulse, pulse);
  if (imgReady(IMG.portal)) {
    // Final art: portal sprite (ASSETS.md #9), drawn 84px tall at its
    // native aspect, centred on the goal. No text label over the art.
    const dh = 84;
    const dw = (dh * IMG.portal.naturalWidth) / IMG.portal.naturalHeight;
    ctx.drawImage(IMG.portal, -dw / 2, -dh / 2, dw, dh);
    ctx.restore();
    return;
  }
  // Placeholder fallback: glowing ring + label.
  ctx.strokeStyle = "#7dffb0";
  ctx.lineWidth = 5;
  ctx.shadowColor = "#7dffb0";
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.arc(0, 0, 24, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = "#d8ffe9";
  ctx.font = "bold 12px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("GOAL", cx, lv.goal.y - 8);
}

function drawPlayer() {
  const st = WORLD_STYLE[world];
  ctx.save();
  if (deniedFlash > 0) ctx.translate((Math.random() - 0.5) * 4, 0);
  const sprite = world === 1 ? IMG.playerA : IMG.playerB;
  if (imgReady(sprite)) {
    // Final art: player form per world (ASSETS.md #1/#2). Drawn ~52px
    // tall at native aspect, centred horizontally on the 30x38 hitbox
    // and bottom-aligned with it — head decoration may overflow the top.
    const dh = 52;
    const dw = (dh * sprite.naturalWidth) / sprite.naturalHeight;
    const dx = player.x + player.w / 2 - dw / 2;
    const dy = player.y + player.h - dh;
    ctx.drawImage(sprite, dx, dy, dw, dh);
  } else {
    // Placeholder fallback: rounded square whose palette flips with the
    // active world.
    ctx.fillStyle = st.solid;
    ctx.beginPath();
    ctx.roundRect(player.x, player.y, player.w, player.h, 7);
    ctx.fill();
    ctx.fillStyle = "#10142a";
    const eyeX = player.x + player.w / 2 + player.face * 6;
    ctx.beginPath();
    ctx.arc(eyeX, player.y + 15, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  if (deniedFlash > 0) {
    ctx.strokeStyle = "#ff5252";
    ctx.lineWidth = 4;
    const cx = player.x + player.w / 2;
    const cy = player.y - 16;
    ctx.beginPath();
    ctx.moveTo(cx - 7, cy - 7); ctx.lineTo(cx + 7, cy + 7);
    ctx.moveTo(cx + 7, cy - 7); ctx.lineTo(cx - 7, cy + 7);
    ctx.stroke();
  }
}

function drawHUD() {
  const st = WORLD_STYLE[world];
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(0, 0, W, 40);
  ctx.fillStyle = st.accent;
  ctx.font = "bold 17px system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(LEVELS[levelIndex].name, 16, 27);
  ctx.textAlign = "center";
  ctx.fillText("WORLD: " + st.name, W / 2, 27);
  ctx.textAlign = "right";
  ctx.fillStyle = "#cfd6ff";
  ctx.fillText("Deaths: " + deaths, W - 16, 27);

  if (messageTimer > 0 && message) {
    ctx.globalAlpha = Math.min(1, messageTimer / 40);
    ctx.font = "bold 22px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(message, W / 2, 84);
    ctx.globalAlpha = 1;
  }
}

function drawCentered(lines, titleSize) {
  ctx.fillStyle = "rgba(5,8,20,0.88)";
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = "center";
  lines.forEach((ln, i) => {
    ctx.font = (i === 0 ? "bold " + titleSize : "19px") + " system-ui, sans-serif";
    ctx.fillStyle = i === 0 ? "#ffffff" : "#b9c4f5";
    ctx.fillText(ln, W / 2, H / 2 - (lines.length / 2 - i) * 36);
  });
}

function drawTitle() {
  drawCentered([
    "S H I F T B O U N D",
    "Two worlds. One way through: the other side.",
    "",
    "Move  ← →      Jump  ↑      SHIFT worlds  Shift / Space",
    "Jump again in mid-air — every jump goes higher!",
    "Press ENTER to start — or 1 / 2 / 3 to pick a level",
  ], "44px");
}

function drawWin() {
  const secs = elapsedAtWin.toFixed(1);
  drawCentered([
    "YOU SHIFTED THROUGH!",
    "",
    "Time: " + secs + "s      Deaths: " + deaths,
    "",
    "Press ENTER to play again",
  ], "38px");
}

function draw() {
  drawBackground();
  drawPlatforms();
  drawSpikes();
  drawGoal();
  if (state === "play") {
    drawPlayer();
    drawHUD();
    if (levelIndex === 0) {
      // Level 1 bridge seam (x=500): shifting while grounded drops the player
      // into the pit — the intended move is to jump first, then shift mid-air.
      ctx.save();
      ctx.font = "600 17px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(255,255,255,0.88)";
      ctx.fillText("Jump, then SHIFT!", 500, 318);
      ctx.restore();
    }
    if (levelIndex === 1) {
      // Level 2: the A and B steps overlap — shift while standing, never mid-air.
      ctx.save();
      ctx.font = "600 17px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(255,255,255,0.88)";
      ctx.fillText("Stand on the overlap, then SHIFT!", 435, 404);
      ctx.restore();
    }
  }
  if (state === "title") drawTitle();
  if (state === "win") drawWin();
}

/* ---------------------------------- main loop ------------------------------ */
function frame() {
  if (state === "title" && (keys["Digit1"] || keys["Digit2"] || keys["Digit3"])) {
    const pick = keys["Digit1"] ? 0 : keys["Digit2"] ? 1 : 2;
    keys["Digit1"] = keys["Digit2"] = keys["Digit3"] = false;
    state = "play";
    startAt(pick);
  } else if (state === "title" && confirmPressed) {
    state = "play";
    resetRun();
  } else if (state === "win" && confirmPressed) {
    state = "play";
    resetRun();
  }
  if (state === "play" && keys["KeyR"]) {
    loadLevel(levelIndex);
    message = "Level restarted";
    messageTimer = 60;
    keys["KeyR"] = false;
  }
  update();
  draw();
  shiftPressed = false;
  confirmPressed = false;
  requestAnimationFrame(frame);
}

loadLevel(0);
requestAnimationFrame(frame);
