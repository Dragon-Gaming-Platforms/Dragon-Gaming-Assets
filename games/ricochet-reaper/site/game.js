// RICOCHET REAPER - an Arcade Phantasm game.
// A hooded reaper in an arena. The scythe fires a laser that bounces off the walls and the pillars; the charge is
// limited and every kill sends souls flying back to refill it. Chain kills to raise the multiplier, bank shots off the
// walls for more. WASD + mouse, or arrows + Q/E + Space, or twin sticks on a phone. P pause, M mute.
(function () {
  "use strict";
  var canvas = document.getElementById("game");
  var ctx = canvas.getContext("2d");
  var splash = document.getElementById("splash");
  var SHOT = location.hash === "#shot";

  var C = { navy: "#001725", deep: "#005184", blue: "#007ab7", sky: "#34a9e3", pink: "#f088e9", acid: "#39ff6a",
            black: "#020611", white: "#ffffff" };

  // ---- the world: an arena about 1280 x 720 (720 x 1280 on a phone held upright), scaled to fit the window ----
  var W = 1280, H = 720, scale = 1, ox = 0, oy = 0, dpr = 1, cw = 0, ch = 0;
  var stars = [];
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cw = window.innerWidth; ch = window.innerHeight;
    canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr);
    var aspect = cw / ch;
    if (aspect >= 1) { H = 720; W = Math.round(Math.min(1280, Math.max(860, H * aspect))); }
    else { W = 720; H = Math.round(Math.min(1280, Math.max(860, W / aspect))); }
    scale = Math.min(cw / W, ch / H);
    ox = (cw - W * scale) / 2; oy = (ch - H * scale) / 2;
    stars = [];
    for (var i = 0; i < 140; i++) stars.push({ x: Math.random() * cw, y: Math.random() * ch, r: Math.random() * 1.4 + 0.3,
                                                t: Math.random() * 6.3, s: 0.5 + Math.random() * 2 });
    if (pillarsFrac) placePillars();
  }

  // ---- pillars: a few layouts, changing every two waves (x, y as fractions of the arena; w, h in pixels) ----
  var LAYOUTS = [
    [[0.3, 0.5, 38, 150], [0.7, 0.5, 38, 150]],
    [[0.25, 0.3, 110, 34], [0.75, 0.3, 110, 34], [0.25, 0.7, 110, 34], [0.75, 0.7, 110, 34]],
    [[0.5, 0.2, 220, 30], [0.5, 0.8, 220, 30], [0.18, 0.5, 30, 170], [0.82, 0.5, 30, 170]],
    [[0.5, 0.26, 56, 56], [0.5, 0.74, 56, 56], [0.3, 0.5, 56, 56], [0.7, 0.5, 56, 56]],
    [[0.36, 0.36, 44, 44], [0.64, 0.64, 44, 44], [0.64, 0.36, 44, 44], [0.36, 0.64, 44, 44], [0.12, 0.5, 26, 120], [0.88, 0.5, 26, 120]]
  ];
  var pillarsFrac = null, pillars = [];
  function placePillars() {
    var portrait = H > W;
    pillars = pillarsFrac.map(function (p) {
      var fx = portrait ? p[1] : p[0], fy = portrait ? p[0] : p[1], w = portrait ? p[3] : p[2], h = portrait ? p[2] : p[3];
      return { x: fx * W - w / 2, y: fy * H - h / 2, w: w, h: h };
    });
  }
  function setLayout(n) { pillarsFrac = LAYOUTS[n % LAYOUTS.length]; placePillars(); }

  // push a circle out of the pillars and keep it in the arena
  function collide(o, r) {
    for (var i = 0; i < pillars.length; i++) {
      var p = pillars[i];
      var nx = Math.max(p.x, Math.min(o.x, p.x + p.w)), ny = Math.max(p.y, Math.min(o.y, p.y + p.h));
      var dx = o.x - nx, dy = o.y - ny, d2 = dx * dx + dy * dy;
      if (d2 < r * r) {
        if (d2 === 0) {                     // centre inside: out by the nearest side
          var l = o.x - p.x, rr = p.x + p.w - o.x, t = o.y - p.y, b = p.y + p.h - o.y, m = Math.min(l, rr, t, b);
          if (m === l) o.x = p.x - r; else if (m === rr) o.x = p.x + p.w + r; else if (m === t) o.y = p.y - r; else o.y = p.y + p.h + r;
        } else {
          var d = Math.sqrt(d2);
          o.x = nx + dx / d * r; o.y = ny + dy / d * r;
        }
      }
    }
    o.x = Math.max(r, Math.min(W - r, o.x));
    o.y = Math.max(r, Math.min(H - r, o.y));
  }

  // ---- the ricochet: a ray bouncing off the arena walls and the pillars ----
  function cast(px, py, dx, dy, bounces, maxLen) {
    var segs = [], total = 0;
    for (var b = 0; b <= bounces; b++) {
      if (Math.abs(dx) < 1e-9) dx = 1e-9;
      if (Math.abs(dy) < 1e-9) dy = 1e-9;
      var best = Infinity, nx = 0;
      var tx = dx > 0 ? (W - px) / dx : -px / dx, ty = dy > 0 ? (H - py) / dy : -py / dy;
      if (tx < ty) { best = tx; nx = 1; } else { best = ty; nx = 0; }
      for (var i = 0; i < pillars.length; i++) {
        var p = pillars[i];
        var x1 = (p.x - px) / dx, x2 = (p.x + p.w - px) / dx, y1 = (p.y - py) / dy, y2 = (p.y + p.h - py) / dy;
        var xn = Math.min(x1, x2), yn = Math.min(y1, y2);
        var tmin = Math.max(xn, yn), tmax = Math.min(Math.max(x1, x2), Math.max(y1, y2));
        if (tmax >= tmin && tmin > 1e-3 && tmin < best) { best = tmin; nx = xn > yn ? 1 : 0; }
      }
      var len = Math.min(best, maxLen - total);
      segs.push({ x: px, y: py, dx: dx, dy: dy, len: len, bounce: b });
      total += len;
      if (total >= maxLen - 0.5) break;
      px += dx * best; py += dy * best;
      if (nx) dx = -dx; else dy = -dy;
      px += dx * 0.05; py += dy * 0.05;
    }
    return segs;
  }

  // ---- enemies ----
  var TYPES = {
    ghoul:    { r: 14, hp: 1, speed: 72,  pts: 100, souls: 2, col: C.acid },
    bat:      { r: 10, hp: 1, speed: 175, pts: 150, souls: 2, col: C.sky },
    splitter: { r: 23, hp: 2, speed: 50,  pts: 200, souls: 3, col: C.acid },
    mini:     { r: 10, hp: 1, speed: 120, pts: 60,  souls: 1, col: C.acid },
    knight:   { r: 18, hp: 1, speed: 58,  pts: 300, souls: 4, col: C.sky },
    witch:    { r: 15, hp: 1, speed: 90,  pts: 250, souls: 3, col: C.pink }
  };
  var INTRO = {
    2: "BATS - fast, hungry, never alone",
    3: "SPLITTERS - kill one, face two",
    4: "SHIELD KNIGHTS - hit them from behind, or bank a shot off a wall",
    5: "WITCHES - they curse back; your laser burns their curses away"
  };

  var player, enemies, bullets, souls, beams, sparks, popups, rifts, spawnQueue;
  var score, best = parseInt(localStorage.getItem("ricochetReaperBest") || "0", 10), wave, mult, chainTime, chainMax;
  var charge, cooldown, state = "splash", started = false, waveTimer, spawnTimer, banner, bannerTime, shake, overTime, newBest;
  var aim = 0, mouse = { x: 0, y: 0, on: false, down: false }, keys = {}, lastAimKey = -9, time = 0;
  var MAX_CHARGE = 100, SHOT_COST = 5, BOUNCES = 3, BEAM_LEN = 2600;

  function reset() {
    player = { x: W / 2, y: H / 2, r: 14, vx: 0, vy: 0, lives: 3, inv: 0, walk: 0 };
    enemies = []; bullets = []; souls = []; beams = []; sparks = []; popups = []; rifts = []; spawnQueue = [];
    score = 0; wave = 0; mult = 1; chainTime = 0; chainMax = 2.6; charge = MAX_CHARGE; cooldown = 0;
    shake = 0; newBest = false;
    setLayout(0);
    nextWave();
    state = "play";
  }

  function nextWave() {
    wave++;
    var layout = Math.floor((wave - 1) / 2);
    if (wave > 1 && layout !== Math.floor((wave - 2) / 2)) {
      setLayout(layout);
      collide(player, player.r);
      for (var i = 0; i < 30; i++) burst(Math.random() * W, Math.random() * H, 2, 120, [C.sky, C.deep]);
    }
    var count = 6 + wave * 4, list = [];
    for (var k = 0; k < count; k++) {
      var pool = [["ghoul", 5]];
      if (wave >= 2) pool.push(["bat", 2.5 + wave * 0.25]);
      if (wave >= 3) pool.push(["splitter", 1.6 + wave * 0.1]);
      if (wave >= 4) pool.push(["knight", 1.2 + wave * 0.12]);
      if (wave >= 5) pool.push(["witch", 1 + wave * 0.08]);
      if (wave === 2 && k < 4) { list.push("bat"); continue; }        // the new type shows up early in its wave
      if (wave === 3 && k < 2) { list.push("splitter"); continue; }
      if (wave === 4 && k < 3) { list.push("knight"); continue; }
      if (wave === 5 && k < 2) { list.push("witch"); continue; }
      var sum = 0, j; for (j = 0; j < pool.length; j++) sum += pool[j][1];
      var r = Math.random() * sum;
      for (j = 0; j < pool.length; j++) { r -= pool[j][1]; if (r <= 0) break; }
      list.push(pool[Math.min(j, pool.length - 1)][0]);
    }
    spawnQueue = list;
    spawnTimer = 1.2;
    banner = "WAVE " + wave; bannerTime = 2.6;
    bannerSub = INTRO[wave] || (wave % 5 === 0 ? "They smell the souls on you" : "");
    if (!SHOT && window.Sfx) Sfx.wave();
  }
  var bannerSub = "";

  function speedScale() { return Math.min(1.9, 1 + (wave - 1) * 0.05); }

  function openRift(type) {
    var x, y, tries = 0;
    do {
      var side = Math.floor(Math.random() * 4);
      if (side === 0) { x = 30; y = 30 + Math.random() * (H - 60); }
      else if (side === 1) { x = W - 30; y = 30 + Math.random() * (H - 60); }
      else if (side === 2) { x = 30 + Math.random() * (W - 60); y = 30; }
      else { x = 30 + Math.random() * (W - 60); y = H - 30; }
      tries++;
    } while (tries < 20 && Math.hypot(x - player.x, y - player.y) < 280);
    rifts.push({ x: x, y: y, t: 0.75, type: type });
  }

  function makeEnemy(type, x, y) {
    var T = TYPES[type];
    var e = { type: type, x: x, y: y, r: T.r, hp: T.hp + (type === "splitter" && wave >= 9 ? 1 : 0), vx: 0, vy: 0,
              face: Math.atan2(player.y - y, player.x - x), t: Math.random() * 10, fire: 1.5 + Math.random() * 1.5,
              hit: 0, orbit: Math.random() < 0.5 ? 1 : -1 };
    enemies.push(e);
    return e;
  }

  // ---- particles, souls and score popups ----
  function burst(x, y, n, speed, cols) {
    for (var i = 0; i < n && sparks.length < 900; i++) {
      var a = Math.random() * 6.283, v = speed * (0.2 + Math.random() * 0.8), life = 0.35 + Math.random() * 0.45;
      sparks.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: life, max: life,
                    c: cols[Math.floor(Math.random() * cols.length)] });
    }
  }
  function popup(x, y, text, col, size) { popups.push({ x: x, y: y, text: text, col: col, size: size || 18, life: 1.1 }); }

  function kill(e, bounce, killsThisShot) {
    var T = TYPES[e.type];
    mult = Math.min(50, mult + (bounce > 0 ? 2 : 1));
    chainTime = chainMax;
    var pts = T.pts * mult * (1 + bounce);
    score += pts;
    popup(e.x, e.y - e.r, "+" + pts + (bounce >= 2 ? "  BANK x" + (bounce + 1) : bounce === 1 ? "  RICOCHET" : ""),
          bounce ? C.pink : C.white, bounce ? 20 : 16);
    burst(e.x, e.y, 26 + e.r, 260, [T.col, T.col, C.white, C.pink]);
    var n = T.souls + bounce;
    for (var i = 0; i < n; i++) {
      var a = Math.random() * 6.283, v = 120 + Math.random() * 160;
      souls.push({ x: e.x, y: e.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, val: 3 });
    }
    if (e.type === "splitter") {
      for (var s = 0; s < 3; s++) {
        var m = makeEnemy("mini", e.x, e.y), aa = s * 2.094 + Math.random();
        m.vx = Math.cos(aa) * 260; m.vy = Math.sin(aa) * 260; m.hit = 0.25;
      }
    }
    shake = Math.min(14, shake + 3 + bounce * 2);
    if (!SHOT && window.Sfx) Sfx.kill(mult);
  }

  // ---- firing ----
  function fire() {
    if (cooldown > 0) return;
    if (charge < SHOT_COST) { cooldown = 0.25; if (window.Sfx && !SHOT) Sfx.empty(); popup(player.x, player.y - 30, "NO CHARGE", C.pink, 14); return; }
    charge -= SHOT_COST;
    cooldown = 0.19;
    var dx = Math.cos(aim), dy = Math.sin(aim);
    var sx = player.x + dx * 20, sy = player.y + dy * 20;
    var segs = cast(sx, sy, dx, dy, BOUNCES, BEAM_LEN), done = {}, kills = 0, hits = [];
    for (var i = 0; i < segs.length; i++) {
      var s = segs[i], found = [];
      for (var j = 0; j < enemies.length; j++) {
        var e = enemies[j];
        if (done[j] || e.dead || e.hit > 0.2) continue;
        var fx = e.x - s.x, fy = e.y - s.y, t = fx * s.dx + fy * s.dy;
        if (t < -e.r || t > s.len + e.r) continue;
        if (Math.abs(fx * s.dy - fy * s.dx) < e.r + 5) found.push({ e: e, j: j, t: t });
      }
      found.sort(function (a, b) { return a.t - b.t; });
      var blocked = false;
      for (var f = 0; f < found.length; f++) {
        var h = found[f], en = h.e;
        done[h.j] = true;
        if (en.type === "knight" && s.bounce === 0 && (s.dx * Math.cos(en.face) + s.dy * Math.sin(en.face)) < -0.25) {
          s.len = Math.max(0, h.t - en.r);                       // a direct shot into the shield: stopped dead
          burst(s.x + s.dx * s.len, s.y + s.dy * s.len, 18, 220, [C.white, C.sky]);
          if (window.Sfx && !SHOT) Sfx.shield();
          popup(en.x, en.y - 26, "BLOCKED", C.sky, 14);
          blocked = true; break;
        }
        en.hp--; en.hit = 0.12;
        if (en.hp <= 0) { en.dead = true; kills++; hits.push([en, s.bounce]); }
        else burst(en.x, en.y, 10, 160, [C.white, TYPES[en.type].col]);
      }
      for (var bI = 0; bI < bullets.length; bI++) {             // the laser burns curses out of the air
        var bl = bullets[bI], bx = bl.x - s.x, by = bl.y - s.y, bt = bx * s.dx + by * s.dy;
        if (bt > 0 && bt < s.len && Math.abs(bx * s.dy - by * s.dx) < 10) { bl.dead = true; burst(bl.x, bl.y, 8, 120, [C.acid]); }
      }
      if (blocked) { segs.length = i + 1; break; }
      if (i < segs.length - 1) burst(s.x + s.dx * s.len, s.y + s.dy * s.len, 6, 140, [C.pink, C.white]);
    }
    hits.forEach(function (h) { kill(h[0], h[1], kills); });
    if (kills >= 2) {
      var names = ["", "", "DOUBLE", "TRIPLE", "QUAD", "PENTA"];
      var bonus = kills * kills * 50 * mult;
      score += bonus;
      popup(player.x, player.y - 46, (names[kills] || kills + "-HIT") + " REAP  +" + bonus, C.acid, 22);
    }
    enemies = enemies.filter(function (e) { return !e.dead; });
    beams.push({ segs: segs, life: 0.22 });
    if (window.Sfx && !SHOT) Sfx.shoot(segs.length - 1);
  }

  function hurtPlayer() {
    if (player.inv > 0) return;
    player.lives--;
    player.inv = 2;
    shake = 22;
    burst(player.x, player.y, 60, 300, [C.pink, C.white, C.sky]);
    for (var i = 0; i < enemies.length; i++) {                // a shockwave pushes the nearest ones back
      var e = enemies[i], dx = e.x - player.x, dy = e.y - player.y, d = Math.hypot(dx, dy) || 1;
      if (d < 170) { e.vx += dx / d * 520; e.vy += dy / d * 520; }
    }
    bullets = [];
    if (mult > 1 && window.Sfx && !SHOT) Sfx.chainLost();
    mult = 1; chainTime = 0;
    if (window.Sfx && !SHOT) Sfx.hurt();
    if (player.lives <= 0) {
      state = "over"; overTime = 0;
      burst(player.x, player.y, 140, 420, [C.pink, C.white, C.sky, C.acid]);
      if (score > best && !SHOT) { best = score; newBest = true; localStorage.setItem("ricochetReaperBest", String(best)); }
      if (window.Sfx && !SHOT) Sfx.over();
    }
  }

  // ---- input ----
  var touch = { on: false, move: null, aim: null };
  function toWorld(sx, sy) { return { x: (sx - ox) / scale, y: (sy - oy) / scale }; }

  function update(dt) {
    time += dt;
    if (state !== "play") {
      if (state === "over") overTime += dt;
      updateFx(dt);
      return;
    }
    // movement
    var mx = 0, my = 0;
    if (keys.a || keys.arrowleft) mx--;
    if (keys.d || keys.arrowright) mx++;
    if (keys.w || keys.arrowup) my--;
    if (keys.s || keys.arrowdown) my++;
    if (touch.move) { mx = touch.move.dx; my = touch.move.dy; }
    var ml = Math.hypot(mx, my);
    if (ml > 1) { mx /= ml; my /= ml; }
    var spd = 270;
    player.vx += (mx * spd - player.vx) * Math.min(1, dt * 14);
    player.vy += (my * spd - player.vy) * Math.min(1, dt * 14);
    player.x += player.vx * dt; player.y += player.vy * dt;
    player.walk += Math.hypot(player.vx, player.vy) * dt;
    collide(player, player.r);
    if (player.inv > 0) player.inv -= dt;

    // aim: the mouse, the right stick, Q/E, or else the way you're walking
    var turning = (keys.q || keys.z ? -1 : 0) + (keys.e || keys.x ? 1 : 0);
    if (turning) { aim += turning * 2.6 * dt; lastAimKey = time; mouse.on = false; }
    if (touch.aim) aim = Math.atan2(touch.aim.dy, touch.aim.dx);
    else if (mouse.on) { var w = toWorld(mouse.x, mouse.y); aim = Math.atan2(w.y - player.y, w.x - player.x); }
    else if (ml > 0.2 && time - lastAimKey > 1.2) {
      var want = Math.atan2(my, mx), diff = Math.atan2(Math.sin(want - aim), Math.cos(want - aim));
      aim += diff * Math.min(1, dt * 10);
    }

    cooldown -= dt;
    var firing = mouse.down || keys[" "] || keys.j || keys.k || (touch.aim && touch.aim.m > 0.45);
    if (firing) fire();
    charge = Math.min(MAX_CHARGE, charge + dt * (charge < SHOT_COST ? 4 : 1.2));   // a slow trickle so you're never stuck

    // the chain
    if (chainTime > 0) {
      chainTime -= dt;
      if (chainTime <= 0) { if (mult >= 5 && window.Sfx && !SHOT) Sfx.chainLost(); mult = 1; }
    }

    // spawning
    spawnTimer -= dt;
    if (spawnQueue.length && spawnTimer <= 0) {
      var group = 1 + Math.floor(Math.random() * Math.min(4, 1 + wave / 3));
      for (var g = 0; g < group && spawnQueue.length; g++) openRift(spawnQueue.shift());
      spawnTimer = Math.max(0.35, 1.5 - wave * 0.07) * (0.6 + Math.random() * 0.8);
    }
    for (var r = rifts.length - 1; r >= 0; r--) {
      rifts[r].t -= dt;
      if (rifts[r].t <= 0) {
        var rf = rifts[r], e = makeEnemy(rf.type, rf.x, rf.y);
        if (rf.type === "bat") { for (var bb = 0; bb < 1; bb++) makeEnemy("bat", rf.x + 14, rf.y + 10); }
        burst(rf.x, rf.y, 16, 160, [C.pink, C.deep]);
        rifts.splice(r, 1);
      }
    }

    updateEnemies(dt);
    updateFx(dt);

    if (!spawnQueue.length && !rifts.length && !enemies.length) {
      score += wave * 500;
      popup(player.x, player.y - 60, "WAVE CLEAR  +" + wave * 500, C.acid, 24);
      if (wave % 5 === 0 && player.lives < 5) { player.lives++; popup(player.x, player.y - 86, "+1 LIFE", C.pink, 22); }
      if (window.Sfx && !SHOT) Sfx.clear();
      nextWave();
    }
  }

  function updateEnemies(dt) {
    var ss = speedScale();
    for (var i = 0; i < enemies.length; i++) {
      var e = enemies[i], T = TYPES[e.type];
      e.t += dt; if (e.hit > 0) e.hit -= dt;
      var dx = player.x - e.x, dy = player.y - e.y, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
      var tx = 0, ty = 0, sp = T.speed * ss;
      if (e.type === "bat") {                                  // swoops in on a wobble
        var wob = Math.sin(e.t * 7) * 0.9;
        tx = ux - uy * wob; ty = uy + ux * wob;
      } else if (e.type === "witch") {                         // keeps her distance and circles
        var want = d > 330 ? 1 : d < 240 ? -1 : 0;
        tx = ux * want - uy * e.orbit * 0.8; ty = uy * want + ux * e.orbit * 0.8;
        e.fire -= dt;
        if (e.fire <= 0 && d < 700) {
          e.fire = Math.max(1.1, 2.8 - wave * 0.08) * (0.8 + Math.random() * 0.4);
          var bs = 190 + wave * 6;
          bullets.push({ x: e.x + ux * 18, y: e.y + uy * 18, vx: ux * bs, vy: uy * bs, life: 6 });
          if (window.Sfx && !SHOT) Sfx.spit();
        }
      } else if (e.type === "knight") {                        // the shield turns to face you, slowly
        var fd = Math.atan2(dy, dx), df = Math.atan2(Math.sin(fd - e.face), Math.cos(fd - e.face));
        e.face += Math.max(-1.6 * dt, Math.min(1.6 * dt, df));
        tx = Math.cos(e.face); ty = Math.sin(e.face);
      } else { tx = ux; ty = uy; }
      if (e.type !== "knight") e.face = Math.atan2(dy, dx);
      var tl = Math.hypot(tx, ty) || 1;
      e.vx += (tx / tl * sp - e.vx) * Math.min(1, dt * 3);
      e.vy += (ty / tl * sp - e.vy) * Math.min(1, dt * 3);
      e.x += e.vx * dt; e.y += e.vy * dt;
      collide(e, e.r);
      if (d < e.r + player.r - 2) hurtPlayer();
    }
    // keep them from stacking: a light push apart
    for (var a = 0; a < enemies.length; a++) {
      for (var b = a + 1; b < enemies.length; b++) {
        var A = enemies[a], B = enemies[b], ddx = B.x - A.x, ddy = B.y - A.y, rr = A.r + B.r;
        if (Math.abs(ddx) > rr || Math.abs(ddy) > rr) continue;
        var dd = Math.hypot(ddx, ddy) || 0.01;
        if (dd < rr) { var push = (rr - dd) / 2 / dd; A.x -= ddx * push; A.y -= ddy * push; B.x += ddx * push; B.y += ddy * push; }
      }
    }
    for (var k = bullets.length - 1; k >= 0; k--) {
      var bl = bullets[k];
      bl.x += bl.vx * dt; bl.y += bl.vy * dt; bl.life -= dt;
      var inPillar = pillars.some(function (p) { return bl.x > p.x && bl.x < p.x + p.w && bl.y > p.y && bl.y < p.y + p.h; });
      if (bl.dead || bl.life <= 0 || inPillar || bl.x < 0 || bl.y < 0 || bl.x > W || bl.y > H) {
        if (!bl.dead) burst(bl.x, bl.y, 6, 90, [C.acid]);
        bullets.splice(k, 1); continue;
      }
      if (Math.hypot(bl.x - player.x, bl.y - player.y) < player.r + 6) { bullets.splice(k, 1); hurtPlayer(); }
    }
  }

  function updateFx(dt) {
    for (var i = beams.length - 1; i >= 0; i--) { beams[i].life -= dt; if (beams[i].life <= 0) beams.splice(i, 1); }
    var drag = Math.exp(-3 * dt);
    for (var s = sparks.length - 1; s >= 0; s--) {
      var p = sparks[s];
      p.life -= dt; if (p.life <= 0) { sparks.splice(s, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= drag; p.vy *= drag;
    }
    for (var q = popups.length - 1; q >= 0; q--) { popups[q].life -= dt; popups[q].y -= 30 * dt; if (popups[q].life <= 0) popups.splice(q, 1); }
    for (var k = souls.length - 1; k >= 0; k--) {                // souls scatter, then home in on the reaper
      var o = souls[k];
      o.t += dt;
      var dx = player.x - o.x, dy = player.y - o.y, d = Math.hypot(dx, dy) || 1;
      if (o.t > 0.3) { var pull = 1600 + o.t * 1500; o.vx += dx / d * pull * dt; o.vy += dy / d * pull * dt; }
      var od = Math.exp(-(o.t > 0.3 ? 4 : 2) * dt);
      o.vx *= od; o.vy *= od;
      o.x += o.vx * dt; o.y += o.vy * dt;
      if (state === "play" && d < player.r + 8 && o.t > 0.3) {
        charge = Math.min(MAX_CHARGE, charge + o.val);
        souls.splice(k, 1);
        if (window.Sfx && !SHOT) Sfx.soul();
      } else if (state !== "play" && o.t > 3) souls.splice(k, 1);
    }
    shake = Math.max(0, shake - dt * 40);
    if (bannerTime > 0) bannerTime -= dt;
  }

  // ---- drawing ----
  function glow(col, blur) { ctx.shadowColor = col; ctx.shadowBlur = blur; }

  function drawBackdrop() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.shadowBlur = 0;
    ctx.fillStyle = C.black;
    ctx.fillRect(0, 0, cw, ch);
    ctx.fillStyle = C.white;
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      ctx.globalAlpha = 0.25 + 0.6 * Math.abs(Math.sin(s.t + time * s.s));
      ctx.fillRect(s.x, s.y, s.r, s.r);
    }
    ctx.globalAlpha = 1;
  }

  function drawArena() {
    ctx.fillStyle = "rgba(0, 23, 37, 0.88)";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(0, 81, 132, 0.45)";               // the floor grid
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (var x = 40; x < W; x += 40) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
    for (var y = 40; y < H; y += 40) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.stroke();
    ctx.strokeStyle = "rgba(240, 136, 233, 0.12)";             // a summoning circle in the middle
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(W / 2, H / 2, Math.min(W, H) * 0.28, 0, 6.283); ctx.stroke();
    ctx.beginPath();
    for (var k = 0; k < 5; k++) {
      var a = -Math.PI / 2 + k * 4 * Math.PI / 5, R = Math.min(W, H) * 0.28;
      ctx[k ? "lineTo" : "moveTo"](W / 2 + Math.cos(a) * R, H / 2 + Math.sin(a) * R);
    }
    ctx.closePath(); ctx.stroke();
    glow(C.sky, 18);                                           // the walls the laser bounces off
    ctx.strokeStyle = C.sky; ctx.lineWidth = 5;
    ctx.strokeRect(-2, -2, W + 4, H + 4);
    for (var i = 0; i < pillars.length; i++) {
      var p = pillars[i];
      ctx.fillStyle = C.deep;
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.strokeStyle = C.sky; ctx.lineWidth = 3;
      ctx.strokeRect(p.x, p.y, p.w, p.h);
    }
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(52, 169, 227, 0.35)";
    for (var j = 0; j < pillars.length; j++) {                  // little runes on the pillars
      var q = pillars[j];
      ctx.fillRect(q.x + q.w / 2 - 2, q.y + q.h / 2 - 8, 4, 16);
      ctx.fillRect(q.x + q.w / 2 - 8, q.y + q.h / 2 - 2, 16, 4);
    }
  }

  function drawPreview() {
    if (state !== "play") return;
    var dx = Math.cos(aim), dy = Math.sin(aim);
    var segs = cast(player.x + dx * 20, player.y + dy * 20, dx, dy, 2, 1500);
    ctx.setLineDash([6, 10]);
    ctx.lineDashOffset = -time * 40;
    for (var i = 0; i < segs.length; i++) {
      var s = segs[i], len = i === 2 ? Math.min(s.len, 140) : s.len;
      ctx.strokeStyle = i === 0 ? "rgba(240, 136, 233, 0.32)" : i === 1 ? "rgba(240, 136, 233, 0.2)" : "rgba(240, 136, 233, 0.1)";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x + s.dx * len, s.y + s.dy * len); ctx.stroke();
      if (i < segs.length - 1) {
        ctx.setLineDash([]);
        ctx.strokeStyle = "rgba(240, 136, 233, 0.45)";
        ctx.beginPath(); ctx.arc(s.x + s.dx * s.len, s.y + s.dy * s.len, 6, 0, 6.283); ctx.stroke();
        ctx.setLineDash([6, 10]);
      }
    }
    ctx.setLineDash([]);
  }

  function drawEnemy(e) {
    var T = TYPES[e.type], col = e.hit > 0 ? C.white : T.col, t = e.t;
    ctx.save();
    ctx.translate(e.x, e.y);
    glow(col, 14);
    ctx.fillStyle = col; ctx.strokeStyle = col;
    if (e.type === "ghoul" || e.type === "mini") {
      var bob = Math.sin(t * 9) * 2;
      ctx.beginPath(); ctx.arc(0, bob, e.r, 0, 6.283); ctx.fill();
      ctx.lineWidth = 3;                                       // reaching arms
      ctx.rotate(e.face);
      ctx.beginPath(); ctx.moveTo(4, -e.r + 3); ctx.lineTo(e.r + 7, -e.r + 4 + Math.sin(t * 9) * 3);
      ctx.moveTo(4, e.r - 3); ctx.lineTo(e.r + 7, e.r - 4 - Math.sin(t * 9) * 3); ctx.stroke();
      ctx.rotate(-e.face);
      ctx.shadowBlur = 0; ctx.fillStyle = C.black;
      ctx.beginPath(); ctx.arc(-e.r * 0.35, -2 + bob, e.r * 0.22, 0, 6.283); ctx.arc(e.r * 0.35, -2 + bob, e.r * 0.22, 0, 6.283); ctx.fill();
      ctx.fillRect(-e.r * 0.3, e.r * 0.35 + bob, e.r * 0.6, 2);
    } else if (e.type === "bat") {
      var flap = Math.sin(t * 22) * 0.7;
      ctx.rotate(e.face);
      ctx.beginPath();
      ctx.moveTo(8, 0); ctx.lineTo(-4, -4); ctx.lineTo(-8, -18 * Math.cos(flap)); ctx.lineTo(-2, -2);
      ctx.lineTo(-8, 18 * Math.cos(flap)); ctx.lineTo(-4, 4); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.arc(2, 0, 6, 0, 6.283); ctx.fill();
      ctx.shadowBlur = 0; ctx.fillStyle = C.pink;
      ctx.fillRect(4, -3, 2, 2); ctx.fillRect(4, 1, 2, 2);
    } else if (e.type === "splitter") {
      ctx.beginPath();
      for (var k = 0; k <= 16; k++) {
        var a = k / 16 * 6.283, rr = e.r * (1 + 0.1 * Math.sin(a * 3 + t * 6));
        ctx[k ? "lineTo" : "moveTo"](Math.cos(a) * rr, Math.sin(a) * rr);
      }
      ctx.closePath();
      ctx.globalAlpha = 0.45; ctx.fill(); ctx.globalAlpha = 1;
      ctx.lineWidth = 3; ctx.stroke();
      ctx.shadowBlur = 0; ctx.fillStyle = C.pink;
      ctx.beginPath(); ctx.arc(-7, -3, 4, 0, 6.283); ctx.arc(7, -3, 4, 0, 6.283); ctx.arc(0, 8, 3, 0, 6.283); ctx.fill();
    } else if (e.type === "knight") {
      ctx.rotate(e.face);
      ctx.fillStyle = e.hit > 0 ? C.white : C.blue;
      ctx.beginPath(); ctx.arc(0, 0, e.r, 0, 6.283); ctx.fill();
      ctx.strokeStyle = C.white; ctx.lineWidth = 6;              // the shield, facing you
      glow(C.white, 16);
      ctx.beginPath(); ctx.arc(0, 0, e.r + 7, -1.2, 1.2); ctx.stroke();
      ctx.shadowBlur = 0; ctx.fillStyle = C.black;
      ctx.fillRect(4, -7, 6, 3); ctx.fillRect(4, 4, 6, 3);
      ctx.fillStyle = C.pink;                                    // the weak spot on the back
      ctx.beginPath(); ctx.arc(-e.r + 4, 0, 4, 0, 6.283); ctx.fill();
    } else if (e.type === "witch") {
      ctx.rotate(Math.sin(t * 3) * 0.2);
      ctx.beginPath(); ctx.moveTo(0, -e.r - 10); ctx.lineTo(e.r, e.r * 0.6); ctx.lineTo(-e.r, e.r * 0.6); ctx.closePath(); ctx.fill();
      ctx.shadowBlur = 0; ctx.fillStyle = C.black;
      ctx.beginPath(); ctx.arc(0, 2, 7, 0, 6.283); ctx.fill();
      ctx.fillStyle = C.acid;
      var px = Math.cos(e.face) * 3, py = Math.sin(e.face) * 3;
      ctx.beginPath(); ctx.arc(px, 2 + py, 3, 0, 6.283); ctx.fill();
      if (e.fire < 0.5) { glow(C.acid, 20); ctx.strokeStyle = C.acid; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, e.r + 8 - e.fire * 10, 0, 6.283); ctx.stroke(); }
    }
    ctx.restore();
    ctx.shadowBlur = 0;
  }

  function drawPlayer() {
    if (state === "over") return;
    if (player.inv > 0 && Math.floor(player.inv * 12) % 2 === 0) return;
    ctx.save();
    ctx.translate(player.x, player.y);
    var sway = Math.sin(player.walk / 14) * 0.12;
    ctx.save();                                                  // the scythe along the aim
    ctx.rotate(aim);
    glow(C.pink, 16);
    ctx.strokeStyle = "#8aa4b8"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-14, 6); ctx.lineTo(24, 6); ctx.stroke();
    ctx.strokeStyle = C.pink; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(14, 6 - 18, 18, 0.35, 1.55); ctx.stroke();
    ctx.fillStyle = cooldown > 0.08 ? C.white : C.pink;
    ctx.beginPath(); ctx.arc(24, 6, 3.5, 0, 6.283); ctx.fill();
    ctx.restore();
    ctx.rotate(sway);                                            // the hooded cloak
    glow(C.sky, 14);
    ctx.fillStyle = C.black; ctx.strokeStyle = C.sky; ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, -20); ctx.quadraticCurveTo(16, -8, 15, 15);
    ctx.lineTo(8, 12); ctx.lineTo(3, 17); ctx.lineTo(-3, 12); ctx.lineTo(-9, 17); ctx.lineTo(-15, 15);
    ctx.quadraticCurveTo(-16, -8, 0, -20); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 0; ctx.fillStyle = "#000000";
    ctx.beginPath(); ctx.ellipse(0, -4, 8, 9, 0, 0, 6.283); ctx.fill();
    glow(C.pink, 12); ctx.fillStyle = C.pink;
    var lx = Math.cos(aim) * 2, ly = Math.sin(aim) * 2;
    ctx.fillRect(-5 + lx, -6 + ly, 3, 3); ctx.fillRect(2 + lx, -6 + ly, 3, 3);
    ctx.restore();
    ctx.shadowBlur = 0;
  }

  function drawBeams() {
    for (var i = 0; i < beams.length; i++) {
      var b = beams[i], k = b.life / 0.22;
      for (var pass = 0; pass < 2; pass++) {
        ctx.globalAlpha = k;
        glow(C.pink, pass ? 0 : 24);
        ctx.strokeStyle = pass ? C.white : C.pink;
        ctx.lineWidth = (pass ? 2 : 7) * (0.5 + k * 0.5);
        ctx.lineCap = "round";
        ctx.beginPath();
        for (var j = 0; j < b.segs.length; j++) {
          var s = b.segs[j];
          if (j === 0) ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x + s.dx * s.len, s.y + s.dy * s.len);
        }
        ctx.stroke();
      }
      ctx.fillStyle = C.white;
      for (var m = 0; m < b.segs.length - 1; m++) {
        var e = b.segs[m];
        ctx.beginPath(); ctx.arc(e.x + e.dx * e.len, e.y + e.dy * e.len, 8 * k, 0, 6.283); ctx.fill();
      }
    }
    ctx.globalAlpha = 1; ctx.shadowBlur = 0; ctx.lineCap = "butt";
  }

  function drawWorld() {
    var sx = (Math.random() - 0.5) * shake, sy = (Math.random() - 0.5) * shake;
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * (ox + sx), dpr * (oy + sy));
    drawArena();
    for (var r = 0; r < rifts.length; r++) {                   // where they'll come through
      var rf = rifts[r], k = 1 - rf.t / 0.75;
      glow(C.pink, 20); ctx.strokeStyle = C.pink; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(rf.x, rf.y, 6 + 18 * k, 4 + 10 * k, time * 3, 0, 6.283); ctx.stroke();
    }
    ctx.shadowBlur = 0;
    drawPreview();
    for (var i = 0; i < enemies.length; i++) drawEnemy(enemies[i]);
    glow(C.acid, 16); ctx.fillStyle = C.acid;                    // witches' curses
    for (var b = 0; b < bullets.length; b++) {
      ctx.beginPath(); ctx.arc(bullets[b].x, bullets[b].y, 6 + Math.sin(time * 20 + b) * 1.5, 0, 6.283); ctx.fill();
    }
    ctx.shadowBlur = 0;
    drawPlayer();
    drawBeams();
    glow(C.sky, 12); ctx.fillStyle = "#bfe8ff";                  // souls flying home
    for (var s = 0; s < souls.length; s++) {
      var o = souls[s];
      ctx.beginPath(); ctx.arc(o.x, o.y, 3.5, 0, 6.283); ctx.fill();
      ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.arc(o.x - o.vx * 0.02, o.y - o.vy * 0.02, 2.5, 0, 6.283); ctx.fill(); ctx.globalAlpha = 1;
    }
    for (var p = 0; p < sparks.length; p++) {
      var sp = sparks[p], kk = sp.life / sp.max;
      ctx.globalAlpha = kk; ctx.fillStyle = sp.c;
      ctx.fillRect(sp.x - 1.5, sp.y - 1.5, 1 + 3 * kk, 1 + 3 * kk);
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    ctx.textAlign = "center";
    for (var q = 0; q < popups.length; q++) {
      var pp = popups[q];
      ctx.globalAlpha = Math.min(1, pp.life * 2);
      ctx.font = "bold " + pp.size + "px 'Arial Black', Arial, sans-serif";
      ctx.fillStyle = C.black; ctx.fillText(pp.text, pp.x + 2, pp.y + 2);
      ctx.fillStyle = pp.col; ctx.fillText(pp.text, pp.x, pp.y);
    }
    ctx.globalAlpha = 1;
  }

  function drawHud() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var small = cw < 640, f = small ? 14 : 20;
    ctx.textAlign = "left"; ctx.textBaseline = "top";
    ctx.font = "bold " + f + "px 'Arial Black', Arial, sans-serif";
    ctx.fillStyle = C.pink; ctx.fillText(String(score), 14, 12);
    ctx.font = "bold " + (f - 6) + "px Arial, sans-serif";
    ctx.fillStyle = C.sky; ctx.fillText("WAVE " + wave + "   BEST " + Math.max(best, score), 14, 14 + f);
    for (var i = 0; i < player.lives; i++) {                   // lives: little hoods
      var x = 22 + i * 24, y = 26 + f * 2;
      ctx.fillStyle = C.pink;
      ctx.beginPath(); ctx.moveTo(x, y - 9); ctx.quadraticCurveTo(x + 9, y - 3, x + 8, y + 8); ctx.lineTo(x - 8, y + 8);
      ctx.quadraticCurveTo(x - 9, y - 3, x, y - 9); ctx.fill();
      ctx.fillStyle = C.black; ctx.fillRect(x - 4, y - 2, 8, 6);
    }
    // the multiplier, big, with its chain timer
    if (mult > 1) {
      var big = small ? 40 : 72 + Math.min(40, mult * 2);
      ctx.textAlign = "right";
      ctx.font = "bold " + big + "px 'Arial Black', Arial, sans-serif";
      glow(C.pink, 24); ctx.fillStyle = C.pink;
      ctx.fillText("x" + mult, cw - 16, 6);
      ctx.shadowBlur = 0;
      var bw = small ? 90 : 160;
      ctx.fillStyle = C.deep; ctx.fillRect(cw - 16 - bw, 10 + big, bw, 6);
      ctx.fillStyle = C.acid; ctx.fillRect(cw - 16 - bw, 10 + big, bw * Math.max(0, chainTime / chainMax), 6);
      ctx.font = "bold 11px Arial, sans-serif"; ctx.fillStyle = C.sky;
      ctx.fillText("CHAIN", cw - 20 - bw, 7 + big);
    }
    // the charge bar
    var cbw = Math.min(420, cw * 0.6), cx = (cw - cbw) / 2, cy = ch - (touch.on ? 34 : 30);
    ctx.fillStyle = C.navy; ctx.fillRect(cx - 3, cy - 3, cbw + 6, 16);
    var low = charge < SHOT_COST * 2;
    glow(low ? C.pink : C.sky, 12);
    ctx.fillStyle = low && Math.floor(time * 6) % 2 ? C.pink : C.sky;
    ctx.fillRect(cx, cy, cbw * charge / MAX_CHARGE, 10);
    ctx.shadowBlur = 0;
    ctx.textAlign = "center"; ctx.font = "bold 11px Arial, sans-serif"; ctx.fillStyle = C.white;
    ctx.fillText(low ? "SCYTHE EMPTY - REAP TO RECHARGE" : "SCYTHE CHARGE", cw / 2, cy - 15);
    if (Sfx.isMuted()) { ctx.textAlign = "left"; ctx.fillStyle = "#8aa4b8"; ctx.fillText("MUTED (M)", 14, ch - 22); }

    if (bannerTime > 0 && state === "play") {
      var a = Math.min(1, bannerTime, (2.6 - bannerTime) * 4);
      ctx.globalAlpha = a; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = "bold " + (small ? 44 : 80) + "px 'Arial Black', Arial, sans-serif";
      glow(C.sky, 26); ctx.fillStyle = C.sky; ctx.fillText(banner, cw / 2, ch * 0.32);
      ctx.shadowBlur = 0;
      if (bannerSub) { ctx.font = "bold " + (small ? 14 : 20) + "px Arial, sans-serif"; ctx.fillStyle = C.acid; ctx.fillText(bannerSub, cw / 2, ch * 0.32 + (small ? 38 : 60)); }
      ctx.globalAlpha = 1;
    }
    if (touch.on) drawTouch();
    if (state === "paused" || state === "over") {
      ctx.fillStyle = "rgba(2, 6, 17, 0.66)"; ctx.fillRect(0, 0, cw, ch);
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = "bold " + (small ? 40 : 76) + "px 'Arial Black', Arial, sans-serif";
      glow(C.pink, 28); ctx.fillStyle = C.pink;
      ctx.fillText(state === "over" ? "THE REAPER FALLS" : "PAUSED", cw / 2, ch / 2 - 40);
      ctx.shadowBlur = 0;
      ctx.font = "bold " + (small ? 16 : 22) + "px Arial, sans-serif"; ctx.fillStyle = C.white;
      if (state === "over") {
        ctx.fillText("Score " + score + "   ·   Wave " + wave, cw / 2, ch / 2 + 20);
        ctx.fillStyle = newBest ? C.acid : C.sky;
        ctx.fillText(newBest ? "NEW BEST!" : "Best " + best, cw / 2, ch / 2 + 54);
        if (overTime > 1) { ctx.fillStyle = C.pink; ctx.fillText(touch.on ? "Tap to rise again" : "Space, Enter or click to rise again", cw / 2, ch / 2 + 98); }
      } else ctx.fillText(touch.on ? "Tap to carry on" : "P to carry on", cw / 2, ch / 2 + 20);
    }
    ctx.textBaseline = "alphabetic";
  }

  function drawTouch() {
    ctx.lineWidth = 3;
    [["move", C.sky], ["aim", C.pink]].forEach(function (s) {
      var st = touch[s[0]];
      var bx = st ? st.ox : (s[0] === "move" ? 90 : cw - 90), by = st ? st.oy : ch - 110;
      ctx.globalAlpha = st ? 0.6 : 0.22;
      ctx.strokeStyle = s[1];
      ctx.beginPath(); ctx.arc(bx, by, 56, 0, 6.283); ctx.stroke();
      ctx.fillStyle = s[1];
      ctx.beginPath(); ctx.arc(bx + (st ? st.dx * 50 : 0), by + (st ? st.dy * 50 : 0), 22, 0, 6.283); ctx.fill();
    });
    ctx.globalAlpha = 0.6; ctx.fillStyle = C.white; ctx.textAlign = "center"; ctx.font = "bold 16px Arial, sans-serif";
    ctx.fillText("II", cw / 2 - 26, 30); ctx.fillText(Sfx.isMuted() ? "x" : "♪", cw / 2 + 26, 30);
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
  function togglePause() {
    if (state === "play") state = "paused"; else if (state === "paused") state = "play";
  }

  document.addEventListener("keydown", function (e) {
    var k = e.key.toLowerCase();
    if (!started) { start(); e.preventDefault(); return; }
    if (k === "p" || k === "escape") togglePause();
    else if (k === "m") Sfx.toggleMute();
    else if ((k === " " || k === "enter") && state === "over") restart();
    keys[k] = true;
    if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].indexOf(k) >= 0) e.preventDefault();
  });
  document.addEventListener("keyup", function (e) { keys[e.key.toLowerCase()] = false; });
  window.addEventListener("blur", function () { keys = {}; mouse.down = false; if (state === "play") state = "paused"; });
  splash.addEventListener("click", start);
  canvas.addEventListener("mousemove", function (e) { mouse.x = e.clientX; mouse.y = e.clientY; mouse.on = true; touch.on = false; });
  canvas.addEventListener("mousedown", function (e) {
    if (e.button !== 0) return;
    mouse.down = true; mouse.on = true; mouse.x = e.clientX; mouse.y = e.clientY;
    if (state === "over") restart(); else if (state === "paused") togglePause();
  });
  document.addEventListener("mouseup", function () { mouse.down = false; });
  canvas.addEventListener("contextmenu", function (e) { e.preventDefault(); });

  // twin sticks: the left half of the screen moves, the right half aims and fires
  function stickFor(t) {
    return { id: t.identifier, ox: t.clientX, oy: t.clientY, dx: 0, dy: 0, m: 0 };
  }
  canvas.addEventListener("touchstart", function (e) {
    e.preventDefault();
    touch.on = true; mouse.on = false; mouse.down = false;
    if (!started) { start(); return; }
    if (state === "over") { restart(); return; }
    if (state === "paused") { togglePause(); return; }
    for (var i = 0; i < e.changedTouches.length; i++) {
      var t = e.changedTouches[i];
      if (t.clientY < 56 && Math.abs(t.clientX - cw / 2) < 60) {
        if (t.clientX < cw / 2) togglePause(); else Sfx.toggleMute();
        continue;
      }
      if (t.clientX < cw / 2 && !touch.move) touch.move = stickFor(t);
      else if (t.clientX >= cw / 2 && !touch.aim) touch.aim = stickFor(t);
    }
  }, { passive: false });
  canvas.addEventListener("touchmove", function (e) {
    e.preventDefault();
    for (var i = 0; i < e.changedTouches.length; i++) {
      var t = e.changedTouches[i];
      ["move", "aim"].forEach(function (n) {
        var s = touch[n];
        if (!s || s.id !== t.identifier) return;
        var dx = (t.clientX - s.ox) / 56, dy = (t.clientY - s.oy) / 56, m = Math.hypot(dx, dy);
        if (m > 1) { dx /= m; dy /= m; m = 1; }
        s.dx = dx; s.dy = dy; s.m = m;
        if (n === "aim" && m < 0.15) touch.aim.dx = touch.aim.dy = 0;
      });
    }
  }, { passive: false });
  function touchEnd(e) {
    for (var i = 0; i < e.changedTouches.length; i++) {
      var id = e.changedTouches[i].identifier;
      if (touch.move && touch.move.id === id) touch.move = null;
      if (touch.aim && touch.aim.id === id) touch.aim = null;
    }
  }
  canvas.addEventListener("touchend", touchEnd);
  canvas.addEventListener("touchcancel", touchEnd);
  window.addEventListener("resize", function () {
    resize();
    if (player) { collide(player, player.r); enemies.forEach(function (e) { collide(e, e.r); }); }
  });

  // a small window for tests: read the state, nothing more
  window.RicochetReaper = { info: function () { return { state: state, score: score, wave: wave, mult: mult, charge: charge, lives: player && player.lives, enemies: enemies && enemies.length }; } };

  resize();
  if (SHOT) {                       // for README screenshots: a mid-battle moment on wave 6, frozen
    splash.style.display = "none";
    started = true;
    reset();
    wave = 5; nextWave(); bannerTime = 0;
    spawnQueue = [];
    player.x = W * 0.42; player.y = H * 0.62;
    var spots = [["ghoul", 0.12, 0.2], ["ghoul", 0.2, 0.85], ["bat", 0.86, 0.15], ["bat", 0.9, 0.22], ["bat", 0.62, 0.9],
                 ["splitter", 0.82, 0.78], ["knight", 0.58, 0.32], ["witch", 0.9, 0.5], ["mini", 0.3, 0.12], ["mini", 0.34, 0.16],
                 ["ghoul", 0.05, 0.55], ["knight", 0.14, 0.42], ["ghoul", 0.72, 0.12]];
    spots.forEach(function (s) { var e = makeEnemy(s[0], s[1] * W, s[2] * H); e.t = Math.random() * 5; });
    enemies.forEach(function (e) { e.face = Math.atan2(player.y - e.y, player.x - e.x); });
    bullets.push({ x: W * 0.75, y: H * 0.52, vx: -100, vy: 10, life: 4 });
    // a bank shot: aim so the beam ricochets off the top wall into a ghoul
    var target = makeEnemy("ghoul", W * 0.7, H * 0.25), mirrorY = -target.y;
    aim = Math.atan2(mirrorY - player.y, target.x - player.x);
    mult = 11; chainTime = 1.8; score = 186350; charge = 62;
    fire();
    for (var i = 0; i < 20; i++) { var a = Math.random() * 6.3; souls.push({ x: player.x + Math.cos(a) * (60 + i * 9), y: player.y + Math.sin(a) * (60 + i * 9), vx: 0, vy: 0, t: 0.1, val: 3 }); }
    updateFx(0.03);
    beams[0].life = 0.22;
    aim += 0.5;
    rifts.push({ x: 30, y: H * 0.3, t: 0.3, type: "bat" });
    drawBackdrop(); drawWorld(); shake = 0; drawBackdrop(); drawWorld(); drawHud();
    return;
  }
  requestAnimationFrame(frame);
})();
