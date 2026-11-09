// GRAVE DANGER - an Arcade Phantasm game.
// A necromancer in a graveyard, alone at first. Every monster that dies may rise from the ground as a skeleton on your
// side, and your skeletons swarm the nearest threat on their own. The waves grow, and so does your horde. Between waves
// a shop upgrades the army; every fifth wave a boss comes, and a fallen boss joins you as a giant skeleton.
// WASD / arrows to move; you cast on your own (hold the mouse to aim); hold Space to rally. P pause, M mute.
(function () {
  "use strict";
  var canvas = document.getElementById("game");
  var ctx = canvas.getContext("2d");
  var splash = document.getElementById("splash");
  var HASH = location.hash, SHOT = HASH === "#shot" || HASH === "#shop";

  var C = { navy: "#001725", deep: "#005184", blue: "#007ab7", sky: "#34a9e3", pink: "#f088e9", acid: "#39ff6a",
            black: "#020611", white: "#ffffff", bone: "#e6eef5" };
  function sfx(name, a) { if (!SHOT && window.Sfx) Sfx[name](a); }

  // ---- the world: about 1600 x 900 (900 x 1600 upright on a phone), scaled to fit the window ----
  var W = 1600, H = 900, scale = 1, ox = 0, oy = 0, dpr = 1, cw = 0, ch = 0;
  var graves = [], stars = [];
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cw = window.innerWidth; ch = window.innerHeight;
    canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr);
    var aspect = cw / ch;
    if (aspect >= 1) { H = 900; W = Math.round(Math.min(1600, Math.max(1100, H * aspect))); }
    else { W = 900; H = Math.round(Math.min(1600, Math.max(1100, W / aspect))); }
    scale = Math.min(cw / W, ch / H);
    ox = (cw - W * scale) / 2; oy = (ch - H * scale) / 2;
    graves = [];                              // the graveyard's headstones (scenery only)
    var seed = 7;
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    for (var i = 0; i < 46; i++) graves.push({ x: 40 + rnd() * (W - 80), y: 40 + rnd() * (H - 80), k: Math.floor(rnd() * 3), s: 0.8 + rnd() * 0.5 });
    stars = [];
    for (var j = 0; j < 120; j++) stars.push({ x: Math.random() * cw, y: Math.random() * ch, r: Math.random() * 1.3 + 0.3, t: Math.random() * 6.3, s: 0.5 + Math.random() * 2 });
  }

  // ---- spatial hash: every unit in a grid of cells, so finding neighbours stays cheap with hundreds of units ----
  var CELL = 56, gcols = 1, grows = 1, grid = [];
  function gridBuild() {
    gcols = Math.ceil(W / CELL) + 1; grows = Math.ceil(H / CELL) + 1;
    var n = gcols * grows;
    if (grid.length !== n) { grid = []; for (var i = 0; i < n; i++) grid.push([]); }
    else for (var k = 0; k < n; k++) grid[k].length = 0;
    for (var u = 0; u < units.length; u++) {
      var o = units[u];
      if (o.dead) continue;
      grid[cellX(o.x) + cellY(o.y) * gcols].push(o);
    }
  }
  function cellX(x) { return Math.max(0, Math.min(gcols - 1, Math.floor(x / CELL))); }
  function cellY(y) { return Math.max(0, Math.min(grows - 1, Math.floor(y / CELL))); }
  // the nearest live unit of a team within r of (x, y), or null
  function nearest(x, y, r, team) {
    var m = r + 48, x0 = cellX(x - m), x1 = cellX(x + m), y0 = cellY(y - m), y1 = cellY(y + m), best = null, bd = r * r;
    for (var cy = y0; cy <= y1; cy++) for (var cx = x0; cx <= x1; cx++) {
      var cell = grid[cx + cy * gcols];
      for (var i = 0; i < cell.length; i++) {
        var o = cell[i];
        if (o.team !== team || o.dead) continue;
        var dx = o.x - x, dy = o.y - y, d = dx * dx + dy * dy - o.r * o.r;
        if (d < bd) { bd = d; best = o; }
      }
    }
    return best;
  }
  function each(x, y, r, fn) {
    var x0 = cellX(x - r), x1 = cellX(x + r), y0 = cellY(y - r), y1 = cellY(y + r);
    for (var cy = y0; cy <= y1; cy++) for (var cx = x0; cx <= x1; cx++) {
      var cell = grid[cx + cy * gcols];
      for (var i = 0; i < cell.length; i++) fn(cell[i]);
    }
  }

  // ---- what fights ----
  var KINDS = {
    // the monsters
    ghoul:    { team: 1, r: 9,  hp: 30,  spd: 64,  dmg: 7,  cd: 0.9, pts: 10,  souls: 1,  name: "Ghoul" },
    hound:    { team: 1, r: 8,  hp: 18,  spd: 135, dmg: 5,  cd: 0.6, pts: 12,  souls: 1,  name: "Hellhound" },
    brute:    { team: 1, r: 15, hp: 120, spd: 44,  dmg: 18, cd: 1.2, pts: 40,  souls: 4,  name: "Brute" },
    cultist:  { team: 1, r: 9,  hp: 26,  spd: 56,  dmg: 7,  cd: 1.8, pts: 25,  souls: 2,  range: 260, name: "Cultist" },
    imp:      { team: 1, r: 6,  hp: 10,  spd: 125, dmg: 4,  cd: 0.6, pts: 4,   souls: 0.4, name: "Imp" },
    colossus: { team: 1, r: 46, hp: 2600, spd: 34, dmg: 30, cd: 1.4, pts: 2000, souls: 45, boss: true, name: "THE BONE COLOSSUS" },
    queen:    { team: 1, r: 34, hp: 2100, spd: 58, dmg: 22, cd: 1.0, pts: 2000, souls: 45, boss: true, name: "THE SWARM QUEEN" },
    knight:   { team: 1, r: 28, hp: 2800, spd: 74, dmg: 26, cd: 1.0, pts: 2000, souls: 45, boss: true, name: "THE CURSED KNIGHT" },
    // your dead
    warrior:  { team: 0, r: 8,  hp: 40,  spd: 120, dmg: 9,  cd: 0.7 },
    archer:   { team: 0, r: 8,  hp: 28,  spd: 115, dmg: 8,  cd: 1.1, range: 230 },
    hulk:     { team: 0, r: 13, hp: 130, spd: 95,  dmg: 18, cd: 1.0 },
    giant:    { team: 0, r: 30, hp: 900, spd: 90,  dmg: 42, cd: 1.1 }
  };
  var BOSSES = ["colossus", "queen", "knight"];

  // ---- the shop ----
  var SHOP = [
    { id: "bones",   name: "SHARPER BONES",       desc: "+20% army damage",                      base: 12, max: 12 },
    { id: "cap",     name: "BIGGER FORMATIONS",   desc: "+12 army cap, wider ranks",             base: 10, max: 20, grow: 1.3 },
    { id: "raise",   name: "GRAVE CALLING",       desc: "+8% chance the dead rise for you",       base: 14, max: 6 },
    { id: "archers", name: "SKELETON ARCHERS",    desc: "+15% of the risen come back with bows",  base: 16, max: 4 },
    { id: "boom",    name: "EXPLODING SKELETONS", desc: "fallen skeletons burst in green fire",   base: 20, max: 5 },
    { id: "marrow",  name: "THICK MARROW",        desc: "+25% skeleton health",                  base: 12, max: 10 },
    { id: "ward",    name: "GRAVE WARD",          desc: "+25 max health, fully healed",          base: 10, max: 10 },
    { id: "mend",    name: "DARK MENDING",        desc: "heal 50 now (any number of times)",     base: 6,  max: 99, flat: true }
  ];
  function price(it) { return it.flat ? it.base : Math.round(it.base * Math.pow(it.grow || 1.45, lv[it.id])); }

  var units, proj, sparks, risers, rings, popups, spawnQueue, lv;
  var player, wave, score, souls, best = parseInt(localStorage.getItem("graveDangerBest") || "0", 10);
  var state = "splash", started = false, time = 0, spawnTimer, clearTimer, banner, bannerSub, bannerTime, shake, overTime, newBest;
  var shopSel = 0, shopRects = [], nextRect = null, boss = null, rally = false, allyCount = 0, kills = 0;
  var keys = {}, mouse = { x: 0, y: 0, down: false, right: false };

  function stat(name) {
    switch (name) {
      case "dmg": return 1 + 0.2 * lv.bones;
      case "cap": return 30 + 12 * lv.cap;
      case "raise": return Math.min(1, 0.55 + 0.08 * lv.raise);
      case "archers": return 0.15 * lv.archers;
      case "hp": return 1 + 0.25 * lv.marrow;
      case "maxhp": return 100 + 25 * lv.ward;
      case "spread": return 1 + 0.06 * lv.cap;
    }
  }

  function reset() {
    units = []; proj = []; sparks = []; risers = []; rings = []; popups = []; spawnQueue = [];
    lv = {}; SHOP.forEach(function (it) { lv[it.id] = 0; });
    player = { x: W / 2, y: H / 2, r: 12, hp: 100, vx: 0, vy: 0, cd: 0, hit: 0, walk: 0, aim: 0 };
    wave = 0; score = 0; souls = 0; shake = 0; boss = null; newBest = false; kills = 0;
    for (var i = 0; i < 4; i++) spawnUnit("warrior", W / 2 + Math.cos(i * 1.57) * 40, H / 2 + Math.sin(i * 1.57) * 40);
    state = "play";
    nextWave();
  }

  function spawnUnit(kind, x, y) {
    var K = KINDS[kind], ally = K.team === 0, hm = 1, dm = 1;
    if (!ally) {
      hm = 1 + 0.13 * (wave - 1); dm = 1 + 0.05 * (wave - 1);
      if (K.boss) hm = 1 + 0.7 * Math.floor((wave - 1) / 15);
    } else hm = stat("hp");
    var u = { kind: kind, team: K.team, x: x, y: y, vx: 0, vy: 0, r: K.r, hp: K.hp * hm, max: K.hp * hm, dmg: K.dmg * dm,
              spd: K.spd * (ally ? 1 : Math.min(1.5, 1 + wave * 0.015)), cd: Math.random() * K.cd, target: null,
              retarget: Math.random() * 0.3, t: Math.random() * 10, hit: 0, dead: false, boss: !!K.boss, special: 3 };
    units.push(u);
    return u;
  }

  function nextWave() {
    wave++;
    var n = wave, list = [], count = 10 + n * 6;
    var bossWave = n % 5 === 0;
    if (bossWave) count = Math.round(count * 0.5);
    for (var i = 0; i < count; i++) {
      var r = Math.random(), k = "ghoul";
      if (n >= 2 && r < 0.25 + Math.min(0.15, n * 0.01)) k = "hound";
      else if (n >= 3 && r < 0.45) k = "cultist";
      else if (n >= 4 && r < 0.45 + Math.min(0.2, n * 0.015)) k = "brute";
      list.push(k);
    }
    if (n === 2) list.splice(0, 0, "hound", "hound", "hound");
    if (n === 3) list.splice(0, 0, "cultist", "cultist");
    if (n === 4) list.splice(0, 0, "brute");
    spawnQueue = list;
    spawnTimer = 1.5;
    clearTimer = 0;
    banner = "WAVE " + n;
    bannerSub = ({ 2: "Hellhounds - fast and many", 3: "Cultists - they curse from afar", 4: "Brutes - big bodies, big bones" })[n] || "";
    if (bossWave) {
      var bk = BOSSES[(n / 5 - 1) % 3], side = Math.random() < 0.5;
      boss = spawnUnit(bk, side ? -40 : W + 40, H / 2);
      banner = KINDS[bk].name; bannerSub = "WAVE " + n + " - bring it down and it serves you";
      shake = 20;
      sfx("roar");
    } else sfx("wave");
    bannerTime = 3;
  }

  function edgePoint() {
    var s = Math.floor(Math.random() * 4);
    if (s === 0) return [-10, Math.random() * H];
    if (s === 1) return [W + 10, Math.random() * H];
    if (s === 2) return [Math.random() * W, -10];
    return [Math.random() * W, H + 10];
  }

  // ---- particles, rings, popups ----
  function burst(x, y, n, speed, cols, life) {
    for (var i = 0; i < n && sparks.length < 1400; i++) {
      var a = Math.random() * 6.283, v = speed * (0.2 + Math.random() * 0.8), l = (life || 0.6) * (0.5 + Math.random() * 0.7);
      sparks.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: l, max: l, c: cols[Math.floor(Math.random() * cols.length)] });
    }
  }
  function ring(x, y, r, col, life) { rings.push({ x: x, y: y, r: r, col: col, life: life || 0.4, max: life || 0.4 }); }
  function popup(x, y, text, col, size) { if (popups.length < 40) popups.push({ x: x, y: y, text: text, col: col, size: size || 16, life: 1.2 }); }

  // ---- damage and death ----
  function damage(u, d) {
    if (u.dead) return;
    u.hp -= d; u.hit = 0.1;
    if (u.hp <= 0) u.dead = true;
  }
  function hurtPlayer(d) {
    if (state !== "play") return;
    player.hp -= d; player.hit = 0.2; shake = Math.min(16, shake + d * 0.5);
    sfx("hurt");
    if (player.hp <= 0) {
      player.hp = 0;
      state = "over"; overTime = 0;
      burst(player.x, player.y, 160, 380, [C.acid, C.white, C.pink], 1.2);
      if (score > best && !SHOT) { best = score; newBest = true; localStorage.setItem("graveDangerBest", String(best)); }
      sfx("over");
    }
  }
  function explode(x, y, r, d) {
    ring(x, y, r, C.acid, 0.35);
    burst(x, y, 24, r * 4, [C.acid, C.white], 0.5);
    each(x, y, r + 20, function (o) {
      if (o.team === 1 && !o.dead && (o.x - x) * (o.x - x) + (o.y - y) * (o.y - y) < (r + o.r) * (r + o.r)) damage(o, d);
    });
    sfx("boom");
  }

  function onDeath(u) {
    var K = KINDS[u.kind];
    if (u.team === 1) {
      kills++;
      score += K.pts * wave;
      souls += K.souls;
      burst(u.x, u.y, u.boss ? 120 : 10 + u.r, u.boss ? 320 : 150, [C.pink, C.pink, C.white, C.deep], u.boss ? 1.4 : 0.6);
      sfx("die");
      if (u.boss) {
        boss = null; shake = 30;
        popup(u.x, u.y - 50, K.name.replace("THE ", "") + " JOINS YOU", C.acid, 26);
        risers.push({ x: u.x, y: u.y, t: 0, kind: "giant", big: true });
        ring(u.x, u.y, 160, C.pink, 0.8);
        return;
      }
      var room = stat("cap") - allyCount - risers.length;
      var chance = stat("raise") * (u.kind === "imp" ? 0.35 : 1);
      if (room > 0 && Math.random() < chance) {
        var kind = u.kind === "brute" ? "hulk" : (u.kind === "cultist" || Math.random() < stat("archers")) ? "archer" : "warrior";
        if (u.kind === "cultist" && lv.archers === 0 && Math.random() < 0.5) kind = "warrior";
        risers.push({ x: u.x, y: u.y, t: 0, kind: kind });
      }
    } else {
      burst(u.x, u.y, 12, 140, [C.bone, C.bone, C.acid], 0.5);
      if (lv.boom > 0) explode(u.x, u.y, 44 + lv.boom * 10, 14 + lv.boom * 12);
      else sfx("clack");
    }
  }

  // ---- formation: ranks of rings around the necromancer ----
  var slots = [], slotSpread = 0;
  function buildSlots(n) {
    var sp = stat("spread");
    if (slots.length >= n && slotSpread === sp) return;
    slots = []; slotSpread = sp;
    for (var k = 0; slots.length < Math.max(n, 40); k++) {
      var R = (48 + k * 23) * sp, cap = Math.max(6, Math.floor(6.283 * R / 21));
      for (var i = 0; i < cap; i++) slots.push({ R: R, a: i / cap * 6.283 + k * 0.4 });
    }
  }

  // ---- the frame ----
  function update(dt) {
    time += dt;
    updateFx(dt);
    if (state !== "play") { if (state === "over") overTime += dt; return; }

    // the necromancer
    var mx = 0, my = 0;
    if (keys.a || keys.arrowleft) mx--;
    if (keys.d || keys.arrowright) mx++;
    if (keys.w || keys.arrowup) my--;
    if (keys.s || keys.arrowdown) my++;
    if (stick) { mx = stick.dx; my = stick.dy; }
    var ml = Math.hypot(mx, my); if (ml > 1) { mx /= ml; my /= ml; }
    player.vx += (mx * 215 - player.vx) * Math.min(1, dt * 12);
    player.vy += (my * 215 - player.vy) * Math.min(1, dt * 12);
    player.x = Math.max(16, Math.min(W - 16, player.x + player.vx * dt));
    player.y = Math.max(16, Math.min(H - 16, player.y + player.vy * dt));
    player.walk += Math.hypot(player.vx, player.vy) * dt;
    if (player.hit > 0) player.hit -= dt;
    player.hp = Math.min(stat("maxhp"), player.hp + dt * 0.8);
    rally = !!(keys[" "] || keys.shift || mouse.right || rallyTouch);

    // spawning
    spawnTimer -= dt;
    if (spawnQueue.length && spawnTimer <= 0) {
      var group = 2 + Math.floor(Math.random() * (2 + wave * 0.5)), p = edgePoint();
      for (var g = 0; g < group && spawnQueue.length; g++) spawnUnit(spawnQueue.shift(), p[0] + (Math.random() - 0.5) * 60, p[1] + (Math.random() - 0.5) * 60);
      spawnTimer = Math.max(0.45, 1.5 - wave * 0.06);
    }

    gridBuild();
    allyCount = 0;
    var enemiesLeft = 0, i;
    for (i = 0; i < units.length; i++) { if (units[i].team === 0) allyCount++; else enemiesLeft++; }
    buildSlots(allyCount);

    // the necromancer casts on his own: at the nearest monster, or where the mouse holds
    player.cd -= dt;
    if (player.cd <= 0) {
      var tx = null, ty = null;
      if (mouse.down) { var w = toWorld(mouse.x, mouse.y); tx = w.x; ty = w.y; }
      else { var tg = nearest(player.x, player.y, 420, 1); if (tg) { tx = tg.x; ty = tg.y; } }
      if (tx !== null) {
        var a = Math.atan2(ty - player.y, tx - player.x);
        player.aim = a;
        proj.push({ x: player.x + Math.cos(a) * 14, y: player.y + Math.sin(a) * 14, vx: Math.cos(a) * 560, vy: Math.sin(a) * 560,
                    team: 0, dmg: 22 + wave * 1.5, life: 0.9, kind: "bolt", r: 6 });
        player.cd = 0.38;
        sfx("cast");
      }
    }

    var slotI = 0, rot = time * 0.15;
    for (i = 0; i < units.length; i++) {
      var u = units[i];
      if (u.dead) continue;
      var K = KINDS[u.kind];
      u.t += dt; u.cd -= dt; u.retarget -= dt; if (u.hit > 0) u.hit -= dt;
      var gx, gy, sp = u.spd, tgt = u.target;
      if (tgt && (tgt.dead || tgt === player && u.team === 0)) tgt = u.target = null;

      if (u.team === 0) {
        // your skeletons: swarm the nearest threat near you, otherwise hold the ranks
        var slot = slots[slotI++];
        if (u.retarget <= 0) {
          u.retarget = 0.25 + Math.random() * 0.15;
          var reach = u.kind === "archer" ? 300 : u.kind === "giant" ? 340 : 240;
          var t2 = rally ? null : nearest(u.x, u.y, reach, 1);
          if (t2 && Math.hypot(t2.x - player.x, t2.y - player.y) > 430) t2 = null;     // stay on the leash
          u.target = tgt = t2;
        }
        if (rally) tgt = u.target = null;
        if (tgt) { gx = tgt.x; gy = tgt.y; }
        else { gx = player.x + Math.cos(slot.a + rot) * slot.R; gy = player.y + Math.sin(slot.a + rot) * slot.R; sp *= rally ? 1.6 : 1.2; }
      } else {
        // the monsters: the nearest skeleton in their way, else the necromancer
        if (u.retarget <= 0) {
          u.retarget = 0.35 + Math.random() * 0.2;
          var near = nearest(u.x, u.y, u.boss ? 120 : K.range ? 200 : 70, 0);
          u.target = tgt = near;
        }
        if (!tgt) tgt = player;
        gx = tgt.x; gy = tgt.y;
        if (u.boss) bossThink(u, dt);
      }

      var dx = gx - u.x, dy = gy - u.y, d = Math.hypot(dx, dy) || 1;
      var tr = tgt ? (tgt.r || 12) : 0;
      var range = K.range ? K.range : u.r + tr + 4;
      var stop = tgt ? (K.range ? K.range * 0.8 : u.r + tr) : 2;
      var want = d > stop ? 1 : 0;
      if (!tgt) want = Math.min(1, d / 30);
      if (u.charging > 0) { u.charging -= dt; }
      else {
        u.vx += (dx / d * sp * want - u.vx) * Math.min(1, dt * 8);
        u.vy += (dy / d * sp * want - u.vy) * Math.min(1, dt * 8);
      }
      u.x += u.vx * dt; u.y += u.vy * dt;
      if (u.team === 0 || u.x > 0 && u.x < W && u.y > 0 && u.y < H) {
        u.x = Math.max(u.r, Math.min(W - u.r, u.x)); u.y = Math.max(u.r, Math.min(H - u.r, u.y));
      }

      // attacks
      if (tgt && u.cd <= 0 && d < range + 2) {
        u.cd = K.cd * (0.85 + Math.random() * 0.3);
        var dm = u.dmg * (u.team === 0 ? stat("dmg") : 1);
        if (K.range) {
          var spd = u.team === 0 ? 430 : 230;
          proj.push({ x: u.x, y: u.y, vx: dx / d * spd, vy: dy / d * spd, team: u.team, dmg: dm, life: 1.4,
                      kind: u.team === 0 ? "arrow" : "curse", r: 4 });
          sfx(u.team === 0 ? "twang" : "cast");
        } else if (u.kind === "giant") {
          explode2(tgt.x, tgt.y, 46, dm);
        } else {
          if (tgt === player) hurtPlayer(dm); else damage(tgt, dm);
          if (Math.random() < 0.3) burst(tgt.x, tgt.y, 3, 90, u.team === 0 ? [C.bone] : [C.pink]);
          sfx("clack");
        }
      }
    }

    // keep bodies from piling up: a soft push apart, through the hash
    for (i = 0; i < units.length; i++) {
      var o = units[i];
      if (o.dead) continue;
      each(o.x, o.y, o.r + 30, function (b) {
        if (b === o || b.dead) return;
        var ddx = o.x - b.x, ddy = o.y - b.y, rr = o.r + b.r;
        if (ddx > rr || ddx < -rr || ddy > rr || ddy < -rr) return;
        var dd = Math.sqrt(ddx * ddx + ddy * ddy) || 0.01;
        if (dd < rr) {
          var k = (rr - dd) / dd * (b.r * b.r / (o.r * o.r + b.r * b.r)) * 0.8;
          o.x += ddx * k; o.y += ddy * k;
        }
      });
    }

    updateProjectiles(dt);

    // the risen climb out
    for (i = risers.length - 1; i >= 0; i--) {
      var rs = risers[i];
      rs.t += dt;
      if (Math.random() < 0.4) burst(rs.x, rs.y, 1, 40, [C.acid], 0.5);
      if (rs.t >= (rs.big ? 1.6 : 0.9)) {
        var nu = spawnUnit(rs.kind, rs.x, rs.y);
        ring(rs.x, rs.y, rs.big ? 120 : 26, C.acid, 0.5);
        burst(rs.x, rs.y, rs.big ? 80 : 12, rs.big ? 260 : 110, [C.acid, C.bone], 0.6);
        if (rs.big) { nu.hp = nu.max = KINDS.giant.hp * stat("hp") * (1 + wave * 0.05); shake = 14; }
        risers.splice(i, 1);
        sfx("rise");
      }
    }

    // the dead fall
    var alive = [];
    for (i = 0; i < units.length; i++) { if (units[i].dead) onDeath(units[i]); else alive.push(units[i]); }
    units = alive;

    // wave cleared: on to the shop
    if (!spawnQueue.length && !units.some(function (x) { return x.team === 1; })) {
      clearTimer += dt;
      if (clearTimer > 1.6 && !risers.length) {
        var bonus = 5 + wave * 2;
        souls += bonus;
        score += wave * 250;
        sfx("clear");
        openShop(bonus);
      }
    }
  }

  function explode2(x, y, r, d) {         // a giant's stomp
    ring(x, y, r, C.bone, 0.3);
    each(x, y, r + 30, function (o) {
      if (o.team === 1 && !o.dead && Math.hypot(o.x - x, o.y - y) < r + o.r) damage(o, d);
    });
    shake = Math.min(10, shake + 2);
    sfx("slam");
  }

  // the bosses' tricks
  function bossThink(b, dt) {
    b.special -= dt;
    if (b.kind === "colossus") {
      if (b.special < 0.8 && !b.winding) { b.winding = true; }
      if (b.special <= 0) {                    // a ground slam that flattens everything near
        b.special = 3.6; b.winding = false;
        ring(b.x, b.y, 150, C.pink, 0.6);
        burst(b.x, b.y, 50, 300, [C.pink, C.deep, C.white]);
        each(b.x, b.y, 180, function (o) { if (o.team === 0 && Math.hypot(o.x - b.x, o.y - b.y) < 150 + o.r) damage(o, 40); });
        if (Math.hypot(player.x - b.x, player.y - b.y) < 150 + player.r) hurtPlayer(22);
        shake = 22; sfx("slam");
      }
    } else if (b.kind === "queen") {
      if (b.special <= 0) {                    // she lays a brood of imps
        b.special = 2.6;
        var n = 5 + Math.floor(wave / 5);
        for (var i = 0; i < n; i++) { var a = i / n * 6.283; spawnUnit("imp", b.x + Math.cos(a) * 40, b.y + Math.sin(a) * 40); }
        ring(b.x, b.y, 70, C.pink, 0.4);
      }
    } else if (b.kind === "knight") {
      if (b.special < 0.7 && !b.winding) { b.winding = true; b.aimX = player.x; b.aimY = player.y; }
      if (b.special <= 0) {                    // a charge straight through the ranks
        b.special = 3.4; b.winding = false;
        var dx = b.aimX - b.x, dy = b.aimY - b.y, d = Math.hypot(dx, dy) || 1;
        b.vx = dx / d * 520; b.vy = dy / d * 520; b.charging = 0.75;
        sfx("roar");
      }
      if (b.charging > 0) {
        each(b.x, b.y, 60, function (o) { if (o.team === 0 && Math.hypot(o.x - b.x, o.y - b.y) < b.r + o.r) damage(o, 30 * dt * 10); });
        if (Math.hypot(player.x - b.x, player.y - b.y) < b.r + player.r) hurtPlayer(30 * dt * 3);
        if (Math.random() < 0.6) burst(b.x, b.y, 2, 80, [C.sky, C.pink]);
      }
    }
  }

  function updateProjectiles(dt) {
    for (var i = proj.length - 1; i >= 0; i--) {
      var p = proj[i];
      p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
      var hit = null;
      if (p.team === 1) {
        if (Math.hypot(p.x - player.x, p.y - player.y) < player.r + p.r) { hurtPlayer(p.dmg); hit = player; }
        else hit = nearest(p.x, p.y, p.r + 2, 0);
      } else hit = nearest(p.x, p.y, p.r + 2, 1);
      if (hit && hit !== player) damage(hit, p.dmg);
      if (hit || p.life <= 0 || p.x < -40 || p.y < -40 || p.x > W + 40 || p.y > H + 40) {
        if (hit) burst(p.x, p.y, p.kind === "bolt" ? 10 : 4, 120, p.kind === "curse" ? [C.pink] : p.kind === "bolt" ? [C.acid, C.white] : [C.bone]);
        proj.splice(i, 1);
      }
    }
  }

  function updateFx(dt) {
    var drag = Math.exp(-3 * dt);
    for (var s = sparks.length - 1; s >= 0; s--) {
      var p = sparks[s];
      p.life -= dt; if (p.life <= 0) { sparks[s] = sparks[sparks.length - 1]; sparks.pop(); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= drag; p.vy *= drag;
    }
    for (var r = rings.length - 1; r >= 0; r--) { rings[r].life -= dt; if (rings[r].life <= 0) rings.splice(r, 1); }
    for (var q = popups.length - 1; q >= 0; q--) { popups[q].life -= dt; popups[q].y -= 26 * dt; if (popups[q].life <= 0) popups.splice(q, 1); }
    shake = Math.max(0, shake - dt * 40);
    if (bannerTime > 0) bannerTime -= dt;
  }

  // ---- the shop ----
  function openShop(bonus) {
    state = "shop"; shopSel = 0;
    units.forEach(function (u) { if (u.team === 0) u.hp = u.max; });
    proj = [];
    shopNote = "WAVE " + wave + " SURVIVED  ·  +" + bonus + " SOULS";
  }
  var shopNote = "";
  function buy(i) {
    var it = SHOP[i];
    if (!it) return;
    shopSel = i;
    var cost = price(it);
    if (lv[it.id] >= it.max || souls < cost || (it.id === "mend" && player.hp >= stat("maxhp"))) { sfx("nope"); return; }
    souls -= cost;
    lv[it.id]++;
    if (it.id === "ward") player.hp = stat("maxhp");
    if (it.id === "mend") player.hp = Math.min(stat("maxhp"), player.hp + 50);
    if (it.id === "marrow") units.forEach(function (u) { if (u.team === 0) { var k = stat("hp") / (1 + 0.25 * (lv.marrow - 1)); u.max *= k; u.hp = u.max; } });
    sfx("buy");
  }
  function leaveShop() { if (state !== "shop") return; state = "play"; nextWave(); }

  // ---- drawing ----
  function toWorld(sx, sy) { return { x: (sx - ox) / scale, y: (sy - oy) / scale }; }
  function glow(col, blur) { ctx.shadowColor = col; ctx.shadowBlur = blur; }

  function drawBackdrop() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.shadowBlur = 0;
    ctx.fillStyle = C.black; ctx.fillRect(0, 0, cw, ch);
    ctx.fillStyle = C.white;
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      ctx.globalAlpha = 0.25 + 0.6 * Math.abs(Math.sin(s.t + time * s.s));
      ctx.fillRect(s.x, s.y, s.r, s.r);
    }
    ctx.globalAlpha = 1;
  }

  function drawGround() {
    ctx.fillStyle = C.navy; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(0, 81, 132, 0.25)";                 // patches of dead grass
    for (var x = 0; x < W; x += 50) for (var y = (x / 50 % 2) * 25; y < H; y += 50) ctx.fillRect(x, y, 3, 3);
    for (var g = 0; g < graves.length; g++) {                  // headstones
      var s = graves[g], sx = s.x, sy = s.y, k = s.s;
      ctx.fillStyle = "rgba(0, 81, 132, 0.55)";
      if (s.k === 0) { ctx.beginPath(); ctx.arc(sx, sy - 6 * k, 9 * k, Math.PI, 0); ctx.lineTo(sx + 9 * k, sy + 8 * k); ctx.lineTo(sx - 9 * k, sy + 8 * k); ctx.fill(); }
      else if (s.k === 1) { ctx.fillRect(sx - 2.5 * k, sy - 14 * k, 5 * k, 22 * k); ctx.fillRect(sx - 8 * k, sy - 8 * k, 16 * k, 5 * k); }
      else { ctx.fillRect(sx - 10 * k, sy - 4 * k, 20 * k, 12 * k); }
      ctx.fillStyle = "rgba(2, 6, 17, 0.5)"; ctx.fillRect(sx - 9 * k, sy + 8 * k, 18 * k, 3 * k);
    }
    glow(C.acid, 14); ctx.strokeStyle = "rgba(57, 255, 106, 0.4)"; ctx.lineWidth = 3;
    ctx.strokeRect(-2, -2, W + 4, H + 4);
    ctx.shadowBlur = 0;
  }

  function drawSkeleton(u) {
    var x = u.x, y = u.y, r = u.r, bob = Math.sin(u.t * 10) * (Math.abs(u.vx) + Math.abs(u.vy) > 10 ? 1.2 : 0.2);
    var bone = u.hit > 0 ? C.pink : C.bone;
    if (u.kind === "giant") {
      glow(C.acid, 22);
      ctx.fillStyle = bone;
      ctx.beginPath(); ctx.arc(x, y + bob, r, 0, 6.283); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = C.black;
      ctx.beginPath(); ctx.arc(x - r * 0.35, y - r * 0.1 + bob, r * 0.22, 0, 6.283); ctx.arc(x + r * 0.35, y - r * 0.1 + bob, r * 0.22, 0, 6.283); ctx.fill();
      for (var t = -2; t <= 2; t++) ctx.fillRect(x + t * r * 0.15 - 2, y + r * 0.4 + bob, 3, r * 0.25);
      ctx.fillStyle = C.acid;
      ctx.fillRect(x - r * 0.4, y - r * 0.15 + bob, 5, 5); ctx.fillRect(x + r * 0.3, y - r * 0.15 + bob, 5, 5);
      ctx.strokeStyle = C.acid; ctx.lineWidth = 3;                 // a crown of green fire
      ctx.beginPath();
      for (var c = 0; c < 5; c++) { var a = Math.PI + 0.3 + c * 0.6; ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r + bob); ctx.lineTo(x + Math.cos(a) * (r + 10 + Math.sin(time * 9 + c) * 3), y + Math.sin(a) * (r + 10) + bob); }
      ctx.stroke();
      return;
    }
    ctx.fillStyle = bone;
    ctx.fillRect(x - r * 0.6, y + r * 0.3 + bob, r * 1.2, r * 0.9);             // ribs
    ctx.beginPath(); ctx.arc(x, y - r * 0.15 + bob, r * 0.85, 0, 6.283); ctx.fill();   // skull
    ctx.fillStyle = C.acid;
    ctx.fillRect(x - r * 0.45, y - r * 0.3 + bob, r * 0.3, r * 0.3); ctx.fillRect(x + r * 0.15, y - r * 0.3 + bob, r * 0.3, r * 0.3);
    if (u.kind === "archer") {
      ctx.strokeStyle = C.sky; ctx.lineWidth = 1.5;
      var aa = u.target ? Math.atan2(u.target.y - y, u.target.x - x) : 0;
      ctx.beginPath(); ctx.arc(x, y, r + 3, aa - 0.9, aa + 0.9); ctx.stroke();
    } else {
      ctx.strokeStyle = u.kind === "hulk" ? C.acid : C.white; ctx.lineWidth = u.kind === "hulk" ? 3 : 1.5;
      var sw = Math.sin(u.t * 12) * 0.6 + (u.target ? Math.atan2(u.target.y - y, u.target.x - x) : 0.8);
      ctx.beginPath(); ctx.moveTo(x + Math.cos(sw) * r * 0.6, y + Math.sin(sw) * r * 0.6); ctx.lineTo(x + Math.cos(sw) * (r + 7), y + Math.sin(sw) * (r + 7)); ctx.stroke();
    }
  }

  function drawMonster(u) {
    var x = u.x, y = u.y, r = u.r, hit = u.hit > 0, t = u.t;
    var face = Math.atan2(u.vy, u.vx);
    if (u.kind === "ghoul") {
      ctx.fillStyle = hit ? C.white : C.pink;
      ctx.beginPath(); ctx.arc(x, y + Math.sin(t * 8), r, 0, 6.283); ctx.fill();
      ctx.fillStyle = C.black;
      ctx.fillRect(x - 4, y - 3, 3, 3); ctx.fillRect(x + 1, y - 3, 3, 3); ctx.fillRect(x - 3, y + 3, 6, 2);
    } else if (u.kind === "hound") {
      ctx.fillStyle = hit ? C.white : C.sky;
      ctx.beginPath(); ctx.ellipse(x, y, r * 1.5, r * 0.8, face, 0, 6.283); ctx.fill();
      ctx.fillStyle = C.pink;
      ctx.beginPath(); ctx.arc(x + Math.cos(face) * r, y + Math.sin(face) * r, 2.5, 0, 6.283); ctx.fill();
    } else if (u.kind === "brute") {
      ctx.fillStyle = hit ? C.white : C.blue;
      ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
      ctx.strokeStyle = C.pink; ctx.lineWidth = 3; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - r * 0.7, y - r * 0.6); ctx.lineTo(x - r, y - r * 1.3); ctx.moveTo(x + r * 0.7, y - r * 0.6); ctx.lineTo(x + r, y - r * 1.3); ctx.stroke();
      ctx.fillStyle = C.pink; ctx.fillRect(x - 6, y - 3, 4, 4); ctx.fillRect(x + 2, y - 3, 4, 4);
    } else if (u.kind === "cultist") {
      ctx.fillStyle = hit ? C.white : C.deep;
      ctx.beginPath(); ctx.moveTo(x, y - r * 1.4); ctx.lineTo(x + r, y + r); ctx.lineTo(x - r, y + r); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = C.pink; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = C.pink; ctx.fillRect(x - 3, y - 2, 2, 2); ctx.fillRect(x + 1, y - 2, 2, 2);
    } else if (u.kind === "imp") {
      ctx.fillStyle = hit ? C.white : C.pink;
      var f = Math.sin(t * 25) * 4;
      ctx.beginPath(); ctx.moveTo(x - r - 5, y - f); ctx.lineTo(x, y); ctx.lineTo(x + r + 5, y - f); ctx.lineTo(x, y + 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x, y, r * 0.8, 0, 6.283); ctx.fill();
    } else drawBoss(u);
  }

  function drawBoss(b) {
    var x = b.x, y = b.y, r = b.r, hit = b.hit > 0, t = b.t;
    glow(C.pink, 26);
    if (b.kind === "colossus") {
      if (b.winding) { ctx.strokeStyle = "rgba(240, 136, 233, 0.6)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 150 * (1 - b.special / 0.8), 0, 6.283); ctx.stroke(); }
      ctx.fillStyle = hit ? C.white : C.blue;
      ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = C.bone; ctx.lineWidth = 6;                   // bones bound round it
      for (var i = 0; i < 8; i++) { var a = i * 0.785 + t * 0.3; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.5); ctx.lineTo(x + Math.cos(a) * (r + 12), y + Math.sin(a) * (r + 12)); ctx.stroke(); }
      ctx.fillStyle = C.bone; ctx.beginPath(); ctx.arc(x, y, r * 0.5, 0, 6.283); ctx.fill();
      ctx.fillStyle = C.pink; ctx.fillRect(x - 12, y - 6, 8, 8); ctx.fillRect(x + 4, y - 6, 8, 8);
    } else if (b.kind === "queen") {
      ctx.fillStyle = hit ? C.white : C.pink;
      ctx.beginPath(); ctx.ellipse(x, y, r, r * 1.25, 0, 0, 6.283); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = C.deep;
      for (var s = 0; s < 6; s++) ctx.fillRect(x - r * 0.7, y - r * 0.6 + s * r * 0.25, r * 1.4, 3);
      ctx.fillStyle = C.black; ctx.beginPath(); ctx.arc(x, y - r * 0.9, r * 0.45, 0, 6.283); ctx.fill();
      ctx.fillStyle = C.acid;
      for (var e = 0; e < 4; e++) ctx.fillRect(x - 10 + e * 6, y - r * 0.95, 3, 3);
      ctx.strokeStyle = C.pink; ctx.lineWidth = 3;
      for (var w = -1; w <= 1; w += 2) { ctx.beginPath(); ctx.ellipse(x + w * r * 0.9, y - r * 0.3, r * 0.8, r * 0.35, w * (0.5 + Math.sin(t * 30) * 0.2), 0, 6.283); ctx.stroke(); }
    } else {
      if (b.winding) { ctx.strokeStyle = "rgba(240, 136, 233, 0.5)"; ctx.lineWidth = 2; ctx.setLineDash([8, 8]); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(b.aimX, b.aimY); ctx.stroke(); ctx.setLineDash([]); }
      ctx.fillStyle = hit ? C.white : C.deep;
      ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
      ctx.strokeStyle = C.sky; ctx.lineWidth = 4; ctx.stroke();
      ctx.shadowBlur = 0;
      var a2 = Math.atan2(player.y - y, player.x - x);
      ctx.strokeStyle = C.white; ctx.lineWidth = 6;                   // the cursed blade
      ctx.beginPath(); ctx.moveTo(x + Math.cos(a2 + 0.8) * r, y + Math.sin(a2 + 0.8) * r); ctx.lineTo(x + Math.cos(a2 + 0.3) * (r + 34), y + Math.sin(a2 + 0.3) * (r + 34)); ctx.stroke();
      ctx.fillStyle = C.black; ctx.fillRect(x - r * 0.6, y - 5, r * 1.2, 10);
      ctx.fillStyle = C.pink; ctx.fillRect(x - 10, y - 2, 6, 4); ctx.fillRect(x + 4, y - 2, 6, 4);
    }
    ctx.shadowBlur = 0;
  }

  function drawPlayer() {
    if (state === "over") return;
    var x = player.x, y = player.y, sway = Math.sin(player.walk / 12) * 2;
    if (rally) { ctx.strokeStyle = "rgba(57, 255, 106, 0.5)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 40 + Math.sin(time * 10) * 4, 0, 6.283); ctx.stroke(); }
    glow(C.acid, 20);
    ctx.fillStyle = player.hit > 0 ? C.pink : C.black; ctx.strokeStyle = C.acid; ctx.lineWidth = 2.5;
    ctx.beginPath();                                           // the robe
    ctx.moveTo(x, y - 18); ctx.quadraticCurveTo(x + 14, y - 6, x + 13 + sway * 0.3, y + 14);
    ctx.lineTo(x - 13 + sway * 0.3, y + 14); ctx.quadraticCurveTo(x - 14, y - 6, x, y - 18); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.acid;
    ctx.fillRect(x - 5, y - 6, 3, 3); ctx.fillRect(x + 2, y - 6, 3, 3);
    var a = player.aim;                                        // the staff and its skull
    ctx.strokeStyle = C.sky; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x + 10, y + 12); ctx.lineTo(x + 14, y - 22); ctx.stroke();
    ctx.fillStyle = C.bone; ctx.beginPath(); ctx.arc(x + 14, y - 25, 5, 0, 6.283); ctx.fill();
    ctx.fillStyle = C.acid; ctx.beginPath(); ctx.arc(x + 14 + Math.cos(a) * 2, y - 25 + Math.sin(a) * 2, 2, 0, 6.283); ctx.fill();
    ctx.shadowBlur = 0;
  }

  function drawWorld() {
    var sx = (Math.random() - 0.5) * shake, sy = (Math.random() - 0.5) * shake;
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * (ox + sx), dpr * (oy + sy));
    drawGround();
    for (var r = 0; r < risers.length; r++) {                 // graves opening
      var rs = risers[r], k = Math.min(1, rs.t / (rs.big ? 1.6 : 0.9)), s = rs.big ? 3 : 1;
      ctx.fillStyle = C.black;
      ctx.beginPath(); ctx.ellipse(rs.x, rs.y + 4 * s, 12 * s, 6 * s, 0, 0, 6.283); ctx.fill();
      ctx.fillStyle = C.bone;
      ctx.fillRect(rs.x - 5 * s, rs.y + 4 * s - 14 * s * k, 3 * s, 14 * s * k);
      ctx.fillRect(rs.x + 2 * s, rs.y + 4 * s - 10 * s * k, 3 * s, 10 * s * k);
      if (k > 0.5) { ctx.beginPath(); ctx.arc(rs.x, rs.y + 4 * s - 16 * s * k, 5 * s * (k - 0.5) * 2, 0, 6.283); ctx.fill(); }
    }
    var i, u;
    for (i = 0; i < units.length; i++) { u = units[i]; if (u.team === 1 && !u.boss) drawMonster(u); }
    for (i = 0; i < units.length; i++) { u = units[i]; if (u.team === 0) drawSkeleton(u); }
    for (i = 0; i < units.length; i++) { u = units[i]; if (u.boss) drawBoss(u); }
    ctx.shadowBlur = 0;
    for (i = 0; i < proj.length; i++) {
      var p = proj[i];
      if (p.kind === "arrow") {
        ctx.strokeStyle = C.bone; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 0.025, p.y - p.vy * 0.025); ctx.stroke();
      } else {
        glow(p.kind === "bolt" ? C.acid : C.pink, 14);
        ctx.fillStyle = p.kind === "bolt" ? C.acid : C.pink;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.kind === "bolt" ? 5 : 4, 0, 6.283); ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
    drawPlayer();
    for (i = 0; i < rings.length; i++) {
      var g = rings[i], kk = g.life / g.max;
      ctx.globalAlpha = kk; ctx.strokeStyle = g.col; ctx.lineWidth = 4 * kk + 1;
      ctx.beginPath(); ctx.arc(g.x, g.y, g.r * (1.1 - kk * 0.6), 0, 6.283); ctx.stroke();
    }
    for (i = 0; i < sparks.length; i++) {
      var sp = sparks[i], q = sp.life / sp.max;
      ctx.globalAlpha = q; ctx.fillStyle = sp.c;
      ctx.fillRect(sp.x - 1.5, sp.y - 1.5, 1 + 2.5 * q, 1 + 2.5 * q);
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = "center";
    for (i = 0; i < popups.length; i++) {
      var pp = popups[i];
      ctx.globalAlpha = Math.min(1, pp.life * 2);
      ctx.font = "bold " + pp.size + "px 'Arial Black', Arial, sans-serif";
      ctx.fillStyle = C.black; ctx.fillText(pp.text, pp.x + 2, pp.y + 2);
      ctx.fillStyle = pp.col; ctx.fillText(pp.text, pp.x, pp.y);
    }
    ctx.globalAlpha = 1;
  }

  function bar(x, y, w, h, k, col) {
    ctx.fillStyle = C.navy; ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
    ctx.fillStyle = col; ctx.fillRect(x, y, w * Math.max(0, Math.min(1, k)), h);
  }

  function drawHud() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var small = cw < 640, f = small ? 15 : 21;
    ctx.textAlign = "left"; ctx.textBaseline = "top";
    ctx.font = "bold " + f + "px 'Arial Black', Arial, sans-serif";
    ctx.fillStyle = C.pink; ctx.fillText(String(score), 14, 12);
    ctx.font = "bold " + (f - 7) + "px Arial, sans-serif";
    ctx.fillStyle = C.sky; ctx.fillText("WAVE " + wave + "   BEST " + Math.max(best, score), 14, 16 + f);
    var hw = small ? 120 : 200;
    bar(14, 34 + f * 1.4, hw, 10, player.hp / stat("maxhp"), player.hp < 30 ? C.pink : C.acid);
    ctx.fillStyle = C.white; ctx.font = "bold 11px Arial, sans-serif";
    ctx.fillText("HEALTH " + Math.ceil(player.hp) + "/" + stat("maxhp"), 18 + hw, 33 + f * 1.4);
    ctx.textAlign = "right";
    ctx.font = "bold " + (small ? 22 : 34) + "px 'Arial Black', Arial, sans-serif";
    ctx.fillStyle = C.acid; ctx.fillText("ARMY " + allyCount, cw - 14, 10);
    ctx.font = "bold " + (small ? 11 : 14) + "px Arial, sans-serif";
    ctx.fillStyle = C.bone; ctx.fillText("CAP " + stat("cap") + "   RISE " + Math.round(stat("raise") * 100) + "%   SOULS " + Math.floor(souls), cw - 14, small ? 36 : 48);
    if (boss && !boss.dead) {
      var bw = Math.min(520, cw * 0.5);
      ctx.textAlign = "center";
      ctx.fillStyle = C.pink; ctx.font = "bold 13px Arial, sans-serif";
      ctx.fillText(KINDS[boss.kind].name, cw / 2, small ? 70 : 14);
      bar((cw - bw) / 2, small ? 88 : 32, bw, 10, boss.hp / boss.max, C.pink);
    }
    if (Sfx.isMuted()) { ctx.textAlign = "left"; ctx.fillStyle = "#8aa4b8"; ctx.font = "bold 11px Arial, sans-serif"; ctx.fillText("MUTED (M)", 14, ch - 22); }
    if (!touchOn && !small && state === "play") {
      ctx.textAlign = "right"; ctx.fillStyle = "#8aa4b8"; ctx.font = "12px Arial, sans-serif";
      ctx.fillText(rally ? "RALLYING" : "hold Space to rally", cw - 14, ch - 22);
    }
    if (bannerTime > 0 && state === "play") {
      var a = Math.min(1, bannerTime, (3 - bannerTime) * 4);
      ctx.globalAlpha = a; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = "bold " + (small ? 30 : 70) + "px 'Arial Black', Arial, sans-serif";
      glow(boss ? C.pink : C.acid, 26); ctx.fillStyle = boss ? C.pink : C.acid; ctx.fillText(banner, cw / 2, ch * 0.3);
      ctx.shadowBlur = 0;
      if (bannerSub) { ctx.font = "bold " + (small ? 13 : 20) + "px Arial, sans-serif"; ctx.fillStyle = C.bone; ctx.fillText(bannerSub, cw / 2, ch * 0.3 + (small ? 30 : 56)); }
      ctx.globalAlpha = 1;
    }
    if (touchOn && state === "play") drawTouch();
    ctx.textBaseline = "middle"; ctx.textAlign = "center";
    if (state === "shop") drawShop();
    if (state === "paused" || state === "over") {
      ctx.fillStyle = "rgba(2, 6, 17, 0.7)"; ctx.fillRect(0, 0, cw, ch);
      ctx.font = "bold " + (small ? 36 : 76) + "px 'Arial Black', Arial, sans-serif";
      glow(C.acid, 28); ctx.fillStyle = state === "over" ? C.pink : C.acid;
      ctx.fillText(state === "over" ? "YOU JOIN THE DEAD" : "PAUSED", cw / 2, ch / 2 - 40);
      ctx.shadowBlur = 0;
      ctx.font = "bold " + (small ? 15 : 22) + "px Arial, sans-serif"; ctx.fillStyle = C.white;
      if (state === "over") {
        ctx.fillText("Score " + score + "   ·   Wave " + wave + "   ·   " + kills + " slain", cw / 2, ch / 2 + 20);
        ctx.fillStyle = newBest ? C.acid : C.sky; ctx.fillText(newBest ? "NEW BEST!" : "Best " + best, cw / 2, ch / 2 + 54);
        if (overTime > 1) { ctx.fillStyle = C.pink; ctx.fillText(touchOn ? "Tap to rise again" : "Space, Enter or click to rise again", cw / 2, ch / 2 + 98); }
      } else ctx.fillText(touchOn ? "Tap to carry on" : "P to carry on", cw / 2, ch / 2 + 20);
    }
    ctx.textBaseline = "alphabetic";
  }

  function drawShop() {
    ctx.fillStyle = "rgba(2, 6, 17, 0.86)"; ctx.fillRect(0, 0, cw, ch);
    var small = cw < 700, cols = small ? 2 : 4, gap = 12;
    var cardW = Math.min(240, (cw - 40 - gap * (cols - 1)) / cols), cardH = small ? 104 : 128;
    var rows = Math.ceil(SHOP.length / cols), totalW = cols * cardW + (cols - 1) * gap, totalH = rows * cardH + (rows - 1) * gap;
    var x0 = (cw - totalW) / 2, y0 = Math.max(small ? 120 : 150, (ch - totalH) / 2 + 10);
    ctx.font = "bold " + (small ? 28 : 54) + "px 'Arial Black', Arial, sans-serif";
    glow(C.acid, 24); ctx.fillStyle = C.acid; ctx.fillText("THE BONE MERCHANT", cw / 2, y0 - (small ? 82 : 104));
    ctx.shadowBlur = 0;
    ctx.font = "bold " + (small ? 12 : 16) + "px Arial, sans-serif"; ctx.fillStyle = C.bone;
    ctx.fillText(shopNote, cw / 2, y0 - (small ? 52 : 62));
    ctx.fillStyle = C.pink; ctx.font = "bold " + (small ? 16 : 22) + "px Arial, sans-serif";
    ctx.fillText(Math.floor(souls) + " SOULS   ·   ARMY " + allyCount + "/" + stat("cap") + "   ·   HEALTH " + Math.ceil(player.hp) + "/" + stat("maxhp"), cw / 2, y0 - (small ? 28 : 30));
    shopRects = [];
    for (var i = 0; i < SHOP.length; i++) {
      var it = SHOP[i], cx = x0 + (i % cols) * (cardW + gap), cy = y0 + Math.floor(i / cols) * (cardH + gap);
      var maxed = lv[it.id] >= it.max, cost = price(it), afford = souls >= cost && !maxed;
      shopRects.push([cx, cy, cardW, cardH]);
      ctx.fillStyle = i === shopSel ? C.deep : C.navy; ctx.fillRect(cx, cy, cardW, cardH);
      ctx.strokeStyle = i === shopSel ? C.acid : afford ? C.sky : "#24384a"; ctx.lineWidth = i === shopSel ? 3 : 2;
      ctx.strokeRect(cx, cy, cardW, cardH);
      ctx.textAlign = "left";
      ctx.fillStyle = "#8aa4b8"; ctx.font = "bold 12px Arial, sans-serif"; ctx.fillText(String(i + 1), cx + 10, cy + 16);
      ctx.fillStyle = afford ? C.white : "#8aa4b8"; ctx.font = "bold " + (small ? 12 : 15) + "px 'Arial Black', Arial, sans-serif";
      ctx.fillText(it.name, cx + 26, cy + 16);
      ctx.font = (small ? 11 : 13) + "px Arial, sans-serif"; ctx.fillStyle = C.sky;
      wrap(it.desc, cx + 10, cy + (small ? 40 : 46), cardW - 20, small ? 14 : 17);
      ctx.fillStyle = C.acid;
      if (!it.flat) for (var p = 0; p < Math.min(it.max, 12); p++) { ctx.globalAlpha = p < lv[it.id] ? 1 : 0.2; ctx.fillRect(cx + 10 + p * ((cardW - 20) / Math.min(it.max, 12)), cy + cardH - 34, (cardW - 20) / Math.min(it.max, 12) - 3, 5); }
      ctx.globalAlpha = 1;
      ctx.font = "bold " + (small ? 13 : 16) + "px Arial, sans-serif";
      ctx.fillStyle = maxed ? C.acid : afford ? C.pink : "#5d6f80";
      ctx.fillText(maxed ? "MAXED" : cost + " SOULS", cx + 10, cy + cardH - 14);
      ctx.textAlign = "center";
    }
    var by = y0 + totalH + 24, bw2 = Math.min(320, cw - 40);
    nextRect = [(cw - bw2) / 2, by, bw2, 48];
    ctx.fillStyle = C.acid; ctx.fillRect(nextRect[0], nextRect[1], nextRect[2], nextRect[3]);
    ctx.fillStyle = C.black; ctx.font = "bold 20px 'Arial Black', Arial, sans-serif";
    ctx.fillText("RISE: WAVE " + (wave + 1) + (((wave + 1) % 5 === 0) ? " (BOSS)" : ""), cw / 2, by + 25);
    if (!small) { ctx.fillStyle = "#8aa4b8"; ctx.font = "13px Arial, sans-serif"; ctx.fillText("1-8 or click to buy  ·  arrows + Enter  ·  Space for the next wave", cw / 2, by + 72); }
  }
  function wrap(text, x, y, w, lh) {
    var words = text.split(" "), line = "";
    for (var i = 0; i < words.length; i++) {
      var test = line ? line + " " + words[i] : words[i];
      if (ctx.measureText(test).width > w && line) { ctx.fillText(line, x, y); line = words[i]; y += lh; }
      else line = test;
    }
    ctx.fillText(line, x, y);
  }

  // touch: a floating stick on the left; RALLY bottom right; pause and mute up top
  var touchOn = false, stick = null, rallyTouch = false, rallyId = null;
  function rallyBtn() { return [cw - 100, ch - 100, 70]; }
  function drawTouch() {
    ctx.lineWidth = 3;
    var bx = stick ? stick.ox : 90, by = stick ? stick.oy : ch - 110;
    ctx.globalAlpha = stick ? 0.6 : 0.25; ctx.strokeStyle = C.acid;
    ctx.beginPath(); ctx.arc(bx, by, 56, 0, 6.283); ctx.stroke();
    ctx.fillStyle = C.acid; ctx.beginPath(); ctx.arc(bx + (stick ? stick.dx * 50 : 0), by + (stick ? stick.dy * 50 : 0), 22, 0, 6.283); ctx.fill();
    var rb = rallyBtn();
    ctx.globalAlpha = rallyTouch ? 0.8 : 0.35; ctx.strokeStyle = C.bone;
    ctx.beginPath(); ctx.arc(rb[0], rb[1], rb[2] - 20, 0, 6.283); ctx.stroke();
    ctx.fillStyle = C.bone; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = "bold 14px Arial, sans-serif";
    ctx.fillText("RALLY", rb[0], rb[1]);
    ctx.globalAlpha = 0.6; ctx.font = "bold 16px Arial, sans-serif";
    ctx.fillText("II", cw / 2 - 26, ch - 24); ctx.fillText(Sfx.isMuted() ? "x" : "♪", cw / 2 + 26, ch - 24);
    ctx.globalAlpha = 1;
  }

  var lastT = 0;
  function frame(now) {
    var dt = Math.min(0.05, lastT ? (now - lastT) / 1000 : 0.016);
    lastT = now;
    if (started) update(dt); else time += dt;
    drawBackdrop();
    if (started) { drawWorld(); drawHud(); }
    requestAnimationFrame(frame);
  }

  // ---- controls ----
  function start() {
    if (started) return;
    started = true;
    splash.classList.add("gone");
    reset();
  }
  function restart() { if (state === "over" && overTime > 1) reset(); }
  function togglePause() { if (state === "play") state = "paused"; else if (state === "paused") state = "play"; }
  function shopClick(x, y) {
    for (var i = 0; i < shopRects.length; i++) {
      var r = shopRects[i];
      if (x >= r[0] && x <= r[0] + r[2] && y >= r[1] && y <= r[1] + r[3]) { buy(i); return; }
    }
    if (nextRect && x >= nextRect[0] && x <= nextRect[0] + nextRect[2] && y >= nextRect[1] && y <= nextRect[1] + nextRect[3]) leaveShop();
  }

  document.addEventListener("keydown", function (e) {
    var k = e.key.toLowerCase();
    if (!started) { start(); e.preventDefault(); return; }
    if (state === "shop") {
      if (k >= "1" && k <= "8") buy(parseInt(k, 10) - 1);
      else if (k === "arrowright" || k === "d") shopSel = (shopSel + 1) % SHOP.length;
      else if (k === "arrowleft" || k === "a") shopSel = (shopSel + SHOP.length - 1) % SHOP.length;
      else if (k === "arrowdown" || k === "s") shopSel = (shopSel + 4) % SHOP.length;
      else if (k === "arrowup" || k === "w") shopSel = (shopSel + 4) % SHOP.length;
      else if (k === "enter" || k === "b") buy(shopSel);
      else if (k === " " || k === "n") leaveShop();
      else if (k === "m") Sfx.toggleMute();
      e.preventDefault();
      return;
    }
    if (k === "p" || k === "escape") togglePause();
    else if (k === "m") Sfx.toggleMute();
    else if ((k === " " || k === "enter") && state === "over") restart();
    keys[k] = true;
    if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].indexOf(k) >= 0) e.preventDefault();
  });
  document.addEventListener("keyup", function (e) { keys[e.key.toLowerCase()] = false; });
  window.addEventListener("blur", function () { keys = {}; mouse.down = mouse.right = false; if (state === "play") state = "paused"; });
  splash.addEventListener("click", start);
  canvas.addEventListener("mousemove", function (e) { mouse.x = e.clientX; mouse.y = e.clientY; });
  canvas.addEventListener("mousedown", function (e) {
    touchOn = false;
    mouse.x = e.clientX; mouse.y = e.clientY;
    if (state === "shop") { if (e.button === 0) shopClick(e.clientX, e.clientY); return; }
    if (state === "over") { restart(); return; }
    if (state === "paused") { togglePause(); return; }
    if (e.button === 0) mouse.down = true; else if (e.button === 2) mouse.right = true;
  });
  document.addEventListener("mouseup", function (e) { if (e.button === 0) mouse.down = false; else if (e.button === 2) mouse.right = false; });
  canvas.addEventListener("contextmenu", function (e) { e.preventDefault(); });

  canvas.addEventListener("touchstart", function (e) {
    e.preventDefault();
    touchOn = true;
    if (!started) { start(); return; }
    var t0 = e.changedTouches[0];
    if (state === "shop") { shopClick(t0.clientX, t0.clientY); return; }
    if (state === "over") { restart(); return; }
    if (state === "paused") { togglePause(); return; }
    for (var i = 0; i < e.changedTouches.length; i++) {
      var t = e.changedTouches[i], rb = rallyBtn();
      if (t.clientY > ch - 50 && Math.abs(t.clientX - cw / 2) < 60) { if (t.clientX < cw / 2) togglePause(); else Sfx.toggleMute(); continue; }
      if (Math.hypot(t.clientX - rb[0], t.clientY - rb[1]) < rb[2]) { rallyTouch = true; rallyId = t.identifier; continue; }
      if (!stick && t.clientX < cw * 0.65) stick = { id: t.identifier, ox: t.clientX, oy: t.clientY, dx: 0, dy: 0 };
    }
  }, { passive: false });
  canvas.addEventListener("touchmove", function (e) {
    e.preventDefault();
    for (var i = 0; i < e.changedTouches.length; i++) {
      var t = e.changedTouches[i];
      if (stick && stick.id === t.identifier) {
        var dx = (t.clientX - stick.ox) / 56, dy = (t.clientY - stick.oy) / 56, m = Math.hypot(dx, dy);
        if (m > 1) { dx /= m; dy /= m; }
        stick.dx = dx; stick.dy = dy;
      }
    }
  }, { passive: false });
  function touchEnd(e) {
    for (var i = 0; i < e.changedTouches.length; i++) {
      var id = e.changedTouches[i].identifier;
      if (stick && stick.id === id) stick = null;
      if (rallyId === id) { rallyTouch = false; rallyId = null; }
    }
  }
  canvas.addEventListener("touchend", touchEnd);
  canvas.addEventListener("touchcancel", touchEnd);
  window.addEventListener("resize", function () {
    resize();
    if (player) { player.x = Math.min(player.x, W - 16); player.y = Math.min(player.y, H - 16); }
  });

  // a small window for tests: read the state, or fill the field with units to measure the frame rate
  window.GraveDanger = {
    info: function () { return { state: state, score: score, wave: wave, army: allyCount, units: units && units.length, souls: Math.floor(souls), hp: player && Math.round(player.hp) }; },
    stress: function (n) {
      for (var i = 0; i < n; i++) {
        spawnUnit("warrior", player.x + (Math.random() - 0.5) * 300, player.y + (Math.random() - 0.5) * 300);
        var p = edgePoint(); spawnUnit(Math.random() < 0.7 ? "ghoul" : "hound", p[0], p[1]);
      }
      lv.cap = 30;
    }
  };

  resize();
  if (SHOT) {                       // for README screenshots: a big battle on a boss wave, or the shop
    splash.style.display = "none";
    started = true;
    reset();
    lv.bones = 3; lv.cap = 9; lv.raise = 3; lv.archers = 2; lv.boom = 1; lv.marrow = 2; lv.ward = 2;
    player.hp = 140;
    units = [];
    wave = 9; nextWave(); bannerTime = 0;
    spawnQueue = [];
    player.x = W * 0.45; player.y = H * 0.55;
    for (var i = 0; i < 115; i++) {
      var a = Math.random() * 6.283, d = 40 + Math.sqrt(Math.random()) * 210;
      spawnUnit(Math.random() < 0.3 ? "archer" : Math.random() < 0.1 ? "hulk" : "warrior", player.x + Math.cos(a) * d * 1.3, player.y + Math.sin(a) * d);
    }
    spawnUnit("giant", player.x - 150, player.y - 120);
    boss.x = W * 0.7; boss.y = H * 0.4; boss.hp = boss.max * 0.58;
    for (var j = 0; j < 70; j++) {
      var b = Math.random() * 6.283, dd = 60 + Math.random() * 260;
      spawnUnit(["ghoul", "hound", "cultist", "brute", "imp", "imp"][j % 6], boss.x + Math.cos(b) * dd * 0.8, boss.y + Math.sin(b) * dd);
    }
    score = 412350; souls = 186; kills = 1240;
    for (var s = 0; s < 110; s++) update(1 / 60);
    for (var rr = 0; rr < 4; rr++) risers.push({ x: W * (0.5 + rr * 0.06), y: H * 0.3 + rr * 20, t: 0.2 + rr * 0.15, kind: "warrior" });
    if (HASH === "#shop") { souls = 74; openShop(25); shopSel = 3; }
    bannerTime = 0; shake = 0;
    drawBackdrop(); drawWorld(); drawHud();
    return;
  }
  requestAnimationFrame(frame);
})();
