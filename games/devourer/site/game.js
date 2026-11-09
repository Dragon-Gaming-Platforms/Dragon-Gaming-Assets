// Devourer - an Arcade Phantasm game by Cursed Entertainment.
// You're a tiny black hole. Anything smaller than you, you can eat: it spirals in and you grow. Anything bigger than
// you (outlined in warning red) tears you apart. Bigger is slower and heavier, the camera pulls back as you grow, from
// rocks to whole planetary systems, and from the planets on, what you swallow trails behind you as a solid wall of
// debris you can't pass through. Hostile creatures hunt you; new cosmic forms unlock as you climb.
(function () {
  "use strict";
  var canvas = document.getElementById("game");
  var ctx = canvas.getContext("2d");
  var splash = document.getElementById("splash");

  var C = { navy: "#001725", deep: "#005184", blue: "#007ab7", sky: "#34a9e3", pink: "#f088e9",
            acid: "#39ff6a", black: "#020611", white: "#ffffff", warn: "#ff4d6d" };
  var SHOT = location.hash === "#shot";
  var TAU = Math.PI * 2;
  var EAT = 0.92;                         // you can eat anything up to this fraction of your own size

  var seed = 666;
  function seeded() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
  var rnd = SHOT ? seeded : Math.random;
  function rr(a, b) { return a + rnd() * (b - a); }
  function pick(l) { return l[Math.floor(rnd() * l.length)]; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function angDiff(a, b) { var d = (b - a) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; }

  var LEVELS = [
    { r: 0,     name: "THE BELT",        sub: "Eat the small rocks. Avoid anything outlined in red." },
    { r: 22,    name: "LOW ORBIT",       sub: "Satellites and comets" },
    { r: 70,    name: "MOONFALL",        sub: "The moons are yours" },
    { r: 220,   name: "PLANET EATER",    sub: "What you eat now follows you. You can't pass through it." },
    { r: 700,   name: "STARVING",        sub: "Swallow the stars" },
    { r: 2200,  name: "SYSTEM COLLAPSE", sub: "Whole planetary systems" },
    { r: 7000,  name: "THE LAST DARK",   sub: "Galaxies. Nothing is safe." }
  ];
  var FORMS = [
    { id: "singularity", name: "SINGULARITY", col: C.pink, spd: 9,  pull: 3.2, power: "pull",  pname: "PULL SURGE", cd: 7, unlock: 0,
      desc: "Balanced. Power: a pull surge." },
    { id: "quasar",      name: "QUASAR",      col: C.sky,  spd: 13, pull: 2.3, power: "dash",  pname: "DASH",       cd: 3.5, unlock: 1,
      desc: "Fast, weaker pull. Power: a dash." },
    { id: "maw",         name: "GREAT MAW",   col: C.acid, spd: 7,  pull: 5.5, power: "shock", pname: "SHOCKWAVE",  cd: 8, unlock: 2,
      desc: "Slow, huge pull. Power: a shockwave." },
    { id: "phantom",     name: "PHANTOM",     col: C.white, spd: 9.5, pull: 2.8, power: "phase", pname: "PHASE",    cd: 9, unlock: 3,
      desc: "Power: slip through your trail and hunters." }
  ];
  var PLANET_COLS = [[C.deep, C.sky], [C.pink, "#ffd1fb"], [C.blue, C.navy], ["#2f8f5b", C.acid], ["#8a5cc7", C.pink], ["#c27a4a", "#ffd9a8"], [C.sky, C.white]];
  var STAR_COLS = ["#fff3c4", "#ffe08a", "#cfe9ff", "#ffd1fb", "#ffffff"];

  var W = 0, H = 0, DPR = 1, zoom = 4, cam = { x: 0, y: 0 }, shake = 0;
  var hole, objs, falling, creatures, trail, path, parts, rings, texts, bgStars = [];
  var score, best = parseInt(localStorage.getItem("devourerBest") || "0", 10), newBest = false;
  var form = 0, level, lives, unlocked, elapsed, chaos, state, banner, banner2, spawnT, creatureT, showerT, flash, overT;
  var started = false, last = 0, keys = {}, pointer = { on: false, x: 0, y: 0 };

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.floor(W * DPR); canvas.height = Math.floor(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    bgStars = [];
    for (var i = 0; i < Math.floor(W * H / 2200); i++) {
      bgStars.push({ x: rnd() * W, y: rnd() * H, r: rr(0.4, 1.8), t: rnd() * TAU, d: rr(0.2, 1) });
    }
  }
  function targetZoom() { return Math.min(W, H) * 0.045 / hole.r; }
  function viewR() { return Math.sqrt(W * W + H * H) / 2 / zoom; }   // half the view's diagonal, in world units

  // ---------------------------------------------------------------- things to eat
  function kindFor(r) {
    if (r < 14) return rnd() < 0.85 ? "rock" : "comet";
    if (r < 45) return rnd() < 0.6 ? "satellite" : rnd() < 0.5 ? "comet" : "rock";
    if (r < 150) return "moon";
    if (r < 500) return "planet";
    if (r < 6000) return "star";
    return "galaxy";
  }

  function makeObj(x, y, r, kind, vx, vy) {
    var o = { x: x, y: y, vx: vx || 0, vy: vy || 0, r: r, kind: kind || kindFor(r), rot: rnd() * TAU, spin: rr(-1, 1),
              seed: rnd() * 1000, parent: null, orbR: 0, orbA: 0, orbW: 0, free: true };
    if (o.kind === "rock") {
      o.pts = [];
      var n = Math.floor(rr(7, 11));
      for (var i = 0; i < n; i++) o.pts.push(rr(0.7, 1.05));
      o.col = pick(["#6f8fa8", "#8aa1b3", "#56718a"]);
    } else if (o.kind === "moon") {
      o.col = pick(["#9fb0bf", "#b8c4cf", "#8796a3"]);
      o.craters = [];
      for (var c = 0; c < 6; c++) o.craters.push([rr(-0.6, 0.6), rr(-0.6, 0.6), rr(0.08, 0.22)]);
    } else if (o.kind === "planet") {
      var pc = pick(PLANET_COLS); o.col = pc[0]; o.col2 = pc[1]; o.ringed = rnd() < 0.35; o.tilt = rr(-0.5, 0.5);
    } else if (o.kind === "star") {
      o.col = pick(STAR_COLS);
    } else if (o.kind === "galaxy") {
      o.col = pick([C.pink, C.sky, C.white]); o.arms = Math.floor(rr(2, 4));
    } else if (o.kind === "satellite") {
      o.col = pick([C.white, "#cfe9ff"]);
    } else if (o.kind === "comet") {
      o.col = "#cfe9ff";
      var a = rnd() * TAU, v = rr(2, 4) * hole.r; o.vx = Math.cos(a) * v; o.vy = Math.sin(a) * v;
    }
    objs.push(o);
    return o;
  }

  // a star with planets (and moons) in orbit round it
  function makeSystem(x, y, starR) {
    var star = makeObj(x, y, starR, "star", rr(-0.2, 0.2) * hole.r, rr(-0.2, 0.2) * hole.r);
    var n = Math.floor(rr(3, 6)), orbit = starR * 2.2;
    for (var i = 0; i < n; i++) {
      orbit += starR * rr(0.9, 1.8);
      var pr = Math.min(starR * 0.45, hole.r * rr(0.25, 1.3) * (starR / (hole.r * 3)));
      var p = makeObj(x, y, pr, pr < 150 ? "moon" : "planet");
      if (p.kind === "moon" && pr > 45) { var pc = pick(PLANET_COLS); p.kind = "planet"; p.col = pc[0]; p.col2 = pc[1]; p.ringed = rnd() < 0.3; p.tilt = 0.3; }
      p.parent = star; p.orbR = orbit; p.orbA = rnd() * TAU; p.orbW = rr(0.15, 0.4) * (rnd() < 0.5 ? 1 : -1) / Math.sqrt(orbit / starR); p.free = false;
      if (rnd() < 0.45) {
        var m = makeObj(x, y, pr * rr(0.2, 0.35), "moon");
        m.parent = p; m.orbR = pr * rr(1.8, 2.6); m.orbA = rnd() * TAU; m.orbW = rr(0.8, 1.5); m.free = false;
      }
    }
    return star;
  }

  function freeFromOrbit(o) {           // knocked loose: keep the speed it had in orbit
    if (o.free) return;
    o.free = true;
    var p = o.parent;
    o.vx = (p ? p.vx : 0) - Math.sin(o.orbA) * o.orbR * o.orbW;
    o.vy = (p ? p.vy : 0) + Math.cos(o.orbA) * o.orbR * o.orbW;
    o.parent = null;
  }

  function spawnAround(minD, maxD, edibleBias) {
    var a = rnd() * TAU, d = rr(minD, maxD), x = hole.x + Math.cos(a) * d, y = hole.y + Math.sin(a) * d;
    var R = hole.r, r;
    if (rnd() < (edibleBias || 0.72)) r = R * 0.1 * Math.pow(8.5, Math.pow(rnd(), 1.25));   // 0.1 .. 0.85 of you, mostly small
    else r = R * 1.08 * Math.pow(2.4, rnd());   // bigger than you: deadly
    var v = rr(0, 0.5) * R, va = rnd() * TAU;
    return makeObj(x, y, r, null, Math.cos(va) * v, Math.sin(va) * v);
  }

  // ---------------------------------------------------------------- hunters
  function spawnCreature(kind) {
    var a = rnd() * TAU, d = viewR() * 1.15, R = hole.r;
    var cr = { kind: kind || pick(level >= 2 ? ["eel", "hound", "watcher"] : ["eel", "hound"]),
               x: hole.x + Math.cos(a) * d, y: hole.y + Math.sin(a) * d, vx: 0, vy: 0, a: a + Math.PI,
               r: R * (rnd() < 0.15 ? rr(0.55, 0.8) : rr(1.15, 1.6)), t: 0, life: 32 + chaos * 2, cd: rr(2, 4),
               dash: 0, tell: 0, stun: 0, body: [], hist: [], seed: rnd() * 100 };
    if (cr.kind === "watcher") cr.r *= 1.3;
    if (cr.kind === "eel") for (var i = 0; i < 9; i++) cr.body.push({ x: cr.x, y: cr.y });
    creatures.push(cr);
    sfx("creature");
    var n = cr.kind === "eel" ? "A VOID EEL" : cr.kind === "hound" ? "A COMET HOUND" : "A WATCHER";
    if (!banner || banner.t < 1) banner2 = { text: n + " HUNTS YOU", t: 2.2, c: C.acid };
  }

  // ---------------------------------------------------------------- setup
  function reset() {
    hole = { x: 0, y: 0, vx: 0, vy: 0, m: 64, r: 8, inv: 2.5, power: 0, active: 0, dashT: 0, phase: 0, aim: 0 };
    objs = []; falling = []; creatures = []; trail = []; path = []; parts = []; rings = []; texts = [];
    score = 0; level = 0; lives = 3; form = 0; unlocked = 1; elapsed = 0; chaos = 0; newBest = false;
    spawnT = 0; creatureT = 30; showerT = 50; flash = 0; overT = 0;
    zoom = targetZoom();
    cam.x = 0; cam.y = 0;
    var vr = viewR();
    for (var i = 0; i < 90; i++) spawnAround(hole.r * 4, vr * 1.6, 0.8);
    banner = { text: LEVELS[0].name, sub: LEVELS[0].sub, t: 4, c: C.pink };
    banner2 = null;
    state = "playing";
  }

  // ---------------------------------------------------------------- effects
  function burst(x, y, n, speed, cols, life, size) {   // speed and size in screen pixels; stored in world units
    for (var i = 0; i < n; i++) {
      var a = rnd() * TAU, v = speed * (0.2 + rnd() * 0.8) / zoom, l = (life || 0.7) * (0.5 + rnd() * 0.8);
      parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: l, max: l, c: pick(cols), s: (size || 2.5) / zoom });
    }
    if (parts.length > 1500) parts.splice(0, parts.length - 1500);
  }
  function ring(x, y, r, c, life) { rings.push({ x: x, y: y, r: r, c: c, life: life || 0.5, max: life || 0.5 }); }
  function sfx(n, a, b) { if (window.Sfx && !SHOT) Sfx[n](a, b); }

  // ---------------------------------------------------------------- eating, being torn
  function startEating(o, idx) {
    objs.splice(idx, 1);
    var dx = o.x - hole.x, dy = o.y - hole.y;
    falling.push({ o: o, a: Math.atan2(dy, dx), d: Math.max(Math.sqrt(dx * dx + dy * dy), hole.r * 0.9), t: 0 });
    // eat a star and its planets lose their hold; the whole system comes loose
    for (var i = 0; i < objs.length; i++) if (objs[i].parent === o) freeFromOrbit(objs[i]);
  }

  function swallow(f) {
    var o = f.o, k = o.r / hole.r;
    var gain = o.r * o.r * 0.5;
    hole.m += gain;
    score += Math.round(gain);
    burst(hole.x, hole.y, 4 + Math.floor(k * 16), 160 + k * 200, [FORMS[form].col, C.white, o.col || C.sky], 0.6, 2.5);
    if (k > 0.5) { ring(hole.x, hole.y, hole.r * 2.4, FORMS[form].col, 0.5); shake = Math.min(14, shake + k * 6); }
    sfx("gulp", clamp(k, 0, 1));
    // from the planets on, what you eat trails behind you
    if (level >= 3 && k > 0.28 && trail.length < trailMax()) {
      trail.push({ col: o.kind === "star" ? o.col : o.col || C.sky, col2: o.col2, kind: o.kind, spin: rr(-2, 2), rot: rnd() * TAU,
                   pts: [rr(0.7, 1), rr(0.7, 1), rr(0.7, 1), rr(0.7, 1), rr(0.7, 1), rr(0.7, 1), rr(0.7, 1)] });
    }
  }
  function trailMax() { return level < 3 ? 0 : Math.min(60, 8 + (level - 3) * 9 + Math.floor(chaos)); }

  function torn(fromX, fromY) {
    if (hole.inv > 0 || hole.phase > 0 || state !== "playing") return;
    lives--;
    sfx("hit");
    shake = 20; flash = 0.5;
    burst(hole.x, hole.y, 90, 420, [FORMS[form].col, C.white, C.warn], 1.2, 3.5);
    ring(hole.x, hole.y, hole.r * 6, C.warn, 0.8);
    var dx = hole.x - fromX, dy = hole.y - fromY, d = Math.sqrt(dx * dx + dy * dy) || 1;
    var sp = FORMS[form].spd * hole.r * 1.4;
    hole.vx = dx / d * sp; hole.vy = dy / d * sp;
    // torn: you lose a fifth of your mass and half your trail, scattered as things you can eat again
    hole.m *= 0.8;
    hole.r = Math.sqrt(hole.m);
    var shed = trail.splice(Math.floor(trail.length / 2));
    for (var i = 0; i < shed.length; i++) {
      var a = rnd() * TAU, v = hole.r * rr(1, 3);
      makeObj(hole.x + Math.cos(a) * hole.r * 3, hole.y + Math.sin(a) * hole.r * 3, hole.r * rr(0.3, 0.6), null, Math.cos(a) * v, Math.sin(a) * v);
    }
    hole.inv = 2.5;
    if (lives <= 0) gameOver();
  }

  function gameOver() {
    state = "over";
    overT = 0;
    sfx("over");
    sfx("hum", 0, false);
    burst(hole.x, hole.y, 200, 600, [FORMS[form].col, C.white, C.pink, C.sky], 2, 4);
    ring(hole.x, hole.y, hole.r * 12, C.pink, 1.4);
    if (score > best) { best = score; newBest = true; localStorage.setItem("devourerBest", String(best)); }
  }

  function levelUp() {
    level++;
    var L = LEVELS[Math.min(level, LEVELS.length - 1)];
    var name = level < LEVELS.length ? L.name : "THE LAST DARK " + (level - LEVELS.length + 2);
    banner = { text: name, sub: L.sub, t: 4, c: C.pink };
    sfx("level");
    ring(hole.x, hole.y, hole.r * 8, C.pink, 1);
    for (var f = 0; f < FORMS.length; f++) {
      if (FORMS[f].unlock === level && unlocked <= f) {
        unlocked = f + 1;
        banner2 = { text: "NEW FORM: " + FORMS[f].name + " (press " + (f + 1) + ")", t: 4.5, c: FORMS[f].col };
      }
    }
  }
  function nextLevelR() { return level + 1 < LEVELS.length ? LEVELS[level + 1].r : LEVELS[LEVELS.length - 1].r * Math.pow(3.2, level + 2 - LEVELS.length); }

  function usePower() {
    if (state !== "playing" || hole.power > 0) return;
    var F = FORMS[form];
    hole.power = F.cd;
    sfx("power", F.power);
    if (F.power === "pull") { hole.active = 2.5; ring(hole.x, hole.y, hole.r * F.pull * 2.2, C.pink, 0.8); }
    else if (F.power === "dash") {
      var a = hole.aim, sp = F.spd * hole.r * slowK() * 3.2;
      hole.vx = Math.cos(a) * sp; hole.vy = Math.sin(a) * sp; hole.dashT = 0.45;
      burst(hole.x, hole.y, 30, 300, [C.sky, C.white], 0.5);
    } else if (F.power === "shock") {
      ring(hole.x, hole.y, hole.r * 12, C.acid, 0.9);
      shake = Math.min(18, shake + 10);
      var reach = hole.r * 12;
      creatures.forEach(function (c) {
        var dx = c.x - hole.x, dy = c.y - hole.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
        if (d < reach) { c.vx = dx / d * hole.r * 30; c.vy = dy / d * hole.r * 30; c.stun = 2.5; c.dash = 0; c.tell = 0; }
      });
      objs.forEach(function (o) {
        if (o.r < hole.r * EAT) return;
        var dx = o.x - hole.x, dy = o.y - hole.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
        if (d < reach && !o.parent) { o.vx += dx / d * hole.r * 8; o.vy += dy / d * hole.r * 8; }
        if (o.kind === "spit" && d < reach) o.life = 0;
      });
    } else { hole.phase = 2.4; }
  }

  // ---------------------------------------------------------------- update
  function slowK() { return 1 / (1 + 0.3 * Math.log(Math.max(1, hole.r / 8))); }   // the bigger, the heavier

  function update(dt) {
    if (state === "over") { overT += dt; updateFx(dt); return; }
    if (state !== "playing") return;
    elapsed += dt;
    chaos = level * 1.2 + elapsed / 80;
    var F = FORMS[form], R = hole.r, slow = slowK();

    // input: arrows / WASD, or towards the mouse or finger
    var ix = 0, iy = 0;
    if (keys.arrowleft || keys.a) ix -= 1;
    if (keys.arrowright || keys.d) ix += 1;
    if (keys.arrowup || keys.w) iy -= 1;
    if (keys.arrowdown || keys.s) iy += 1;
    if (pointer.on) {
      var px = pointer.x - (W / 2 + (hole.x - cam.x) * zoom), py = pointer.y - (H / 2 + (hole.y - cam.y) * zoom);
      var pl = Math.sqrt(px * px + py * py);
      if (pl > 8) { var k = Math.min(1, pl / 120); ix = px / pl * k; iy = py / pl * k; }
    }
    var il = Math.sqrt(ix * ix + iy * iy);
    if (il > 1) { ix /= il; iy /= il; }
    if (il > 0.05) hole.aim = Math.atan2(iy, ix);
    var maxV = F.spd * R * slow, drag = 2.6 * slow;   // heavy holes answer slowly
    hole.dashT -= dt;
    if (hole.dashT <= 0) {
      hole.vx += (ix * maxV - hole.vx) * Math.min(1, drag * dt);
      hole.vy += (iy * maxV - hole.vy) * Math.min(1, drag * dt);
    }
    hole.x += hole.vx * dt; hole.y += hole.vy * dt;
    hole.inv = Math.max(0, hole.inv - dt); hole.power = Math.max(0, hole.power - dt);
    hole.active = Math.max(0, hole.active - dt); hole.phase = Math.max(0, hole.phase - dt);

    // the path you've flown, for the trail to follow
    var lp = path[path.length - 1];
    if (!lp || Math.abs(lp.x - hole.x) + Math.abs(lp.y - hole.y) > R * 0.2) path.push({ x: hole.x, y: hole.y });
    var need = (trail.length + 3) * R * 1.1 / (R * 0.2) + 10;
    if (path.length > need) path.splice(0, path.length - need);
    placeTrail();
    // your own trail is solid
    if (hole.phase <= 0) {
      for (var t = 1; t < trail.length; t++) {
        var sg = trail[t], dx = hole.x - sg.x, dy = hole.y - sg.y, min = R + sg.r * 0.9, d2 = dx * dx + dy * dy;
        if (d2 < min * min) {
          var d = Math.sqrt(d2) || 1, nx = dx / d, ny = dy / d, vn = hole.vx * nx + hole.vy * ny;
          hole.x = sg.x + nx * min; hole.y = sg.y + ny * min;
          if (vn < 0) { hole.vx -= nx * vn * 1.4; hole.vy -= ny * vn * 1.4; sfx("bump"); burst(sg.x + nx * sg.r, sg.y + ny * sg.r, 4, 120, [sg.col, C.white], 0.4); }
        }
      }
    }

    // gravity, eating, dying
    var pullR = R * F.pull * (hole.active > 0 ? 2.2 : 1), pullK = hole.active > 0 ? 2.5 : 1;
    for (var i = objs.length - 1; i >= 0; i--) {
      var o = objs[i];
      if (o.parent) {
        if (objs.indexOf(o.parent) < 0 && !isFalling(o.parent)) freeFromOrbit(o);
        else { o.orbA += o.orbW * dt; o.x = o.parent.x + Math.cos(o.orbA) * o.orbR; o.y = o.parent.y + Math.sin(o.orbA) * o.orbR; }
      }
      if (!o.parent) { o.x += o.vx * dt; o.y += o.vy * dt; }
      o.rot += o.spin * dt * 0.3;
      if (o.kind === "spit") { o.life -= dt; if (o.life <= 0) { burst(o.x, o.y, 10, 100, [C.acid], 0.5); objs.splice(i, 1); continue; } }
      var dx2 = o.x - hole.x, dy2 = o.y - hole.y, dist = Math.sqrt(dx2 * dx2 + dy2 * dy2);
      var edible = o.r < R * EAT && o.kind !== "spit";
      if (edible) {
        if (dist < pullR + o.r) {      // pulled in, harder the closer it is
          if (o.parent && dist < pullR * 0.8) freeFromOrbit(o);
          if (!o.parent) {
            var f = (1 - dist / (pullR + o.r)) * R * 14 * pullK * (1.2 - o.r / R);
            o.vx -= dx2 / (dist || 1) * f * dt; o.vy -= dy2 / (dist || 1) * f * dt;
            // a little swirl, so they curl in rather than fall straight
            o.vx += -dy2 / (dist || 1) * f * 0.35 * dt; o.vy += dx2 / (dist || 1) * f * 0.35 * dt;
          }
        }
        if (dist < R + o.r * 0.25) { startEating(o, i); continue; }
      } else if (dist < R * 0.8 + o.r * 0.9) {
        torn(o.x, o.y);
        if (state !== "playing") return;
      }
      if (dist > viewR() * 3 + o.r || (o.r * zoom < 0.25 && dist > viewR())) objs.splice(i, 1);
    }

    // eaten things spiral in, stretching as they go
    for (var fi = falling.length - 1; fi >= 0; fi--) {
      var fa = falling[fi];
      fa.t += dt;
      fa.d *= Math.pow(0.04, dt);
      fa.a += dt * (2 + 6 * R / Math.max(fa.d, R * 0.1));
      if (fa.d < R * 0.2 || fa.t > 1.4) { falling.splice(fi, 1); swallow(fa); }
    }

    updateCreatures(dt);

    // grow
    hole.r = Math.sqrt(hole.m);
    if (hole.r >= nextLevelR()) levelUp();

    // keep the space round you full, and make it worse as you go
    spawnT -= dt;
    if (spawnT <= 0) {
      spawnT = 0.15;
      var vr = viewR(), near = 0;
      for (var n = 0; n < objs.length; n++) if (Math.abs(objs[n].x - hole.x) < vr * 2 && Math.abs(objs[n].y - hole.y) < vr * 2) near++;
      var want = Math.min(170, 80 + chaos * 6);
      for (var s = 0; s < 4 && near < want; s++, near++) spawnAround(vr * 1.05, vr * 2, level === 0 ? 0.82 : 0.74 - Math.min(0.1, chaos * 0.01));
      if (level >= 3 && rnd() < 0.02 + chaos * 0.002) {          // planetary systems
        var big = level >= 5 && rnd() < 0.6 ? rr(0.5, 0.85) : rr(2, 3.6);
        var a = rnd() * TAU, d = vr * rr(1.6, 2.2);
        makeSystem(hole.x + Math.cos(a) * d, hole.y + Math.sin(a) * d, R * big);
      }
    }
    creatureT -= dt;
    var maxC = Math.min(7, 1 + Math.floor(chaos / 1.6));
    if (creatureT <= 0) {
      creatureT = Math.max(4, 18 - chaos * 1.5);
      if (creatures.length < maxC) spawnCreature();
    }
    showerT -= dt;
    if (showerT <= 0 && level >= 1) {   // a meteor shower: a burst of fast things crossing your path
      showerT = Math.max(10, 40 - chaos * 3);
      var sa = rnd() * TAU, vr2 = viewR(), cnt = 10 + Math.floor(chaos * 2);
      for (var m = 0; m < cnt; m++) {
        var off = rr(-1, 1) * vr2, bx = hole.x - Math.cos(sa) * vr2 * 1.2 - Math.sin(sa) * off, by = hole.y - Math.sin(sa) * vr2 * 1.2 + Math.cos(sa) * off;
        var spd = R * rr(5, 9), rad = rnd() < 0.75 ? R * rr(0.15, 0.5) : R * rr(1.1, 1.6);
        var ob = makeObj(bx - Math.cos(sa) * rr(0, vr2), by - Math.sin(sa) * rr(0, vr2), rad, rad < 14 ? "rock" : "comet", Math.cos(sa) * spd, Math.sin(sa) * spd);
        if (ob.kind === "comet") { ob.vx = Math.cos(sa) * spd; ob.vy = Math.sin(sa) * spd; }
      }
      banner2 = { text: "METEOR SHOWER", t: 2, c: C.sky };
    }

    sfx("hum", clamp(Math.log(hole.r / 8) / Math.log(4000), 0, 1), true);
    updateFx(dt);
  }

  function isFalling(o) { for (var i = 0; i < falling.length; i++) if (falling[i].o === o) return true; return false; }

  function placeTrail() {                // each piece sits further back along the path you flew
    var R = hole.r, gap = R * 1.1, want = gap * 1.3, acc = 0, idx = path.length - 1, px = hole.x, py = hole.y;
    for (var t = 0; t < trail.length; t++) {
      var seg = trail[t];
      seg.r = R * 0.5;
      while (idx >= 0) {
        var p = path[idx], dx = px - p.x, dy = py - p.y, d = Math.sqrt(dx * dx + dy * dy);
        if (acc + d >= want) { var k = (want - acc) / (d || 1); px -= dx * k; py -= dy * k; acc = 0; break; }
        acc += d; px = p.x; py = p.y; idx--;
      }
      seg.x = px; seg.y = py;
      want = gap;
    }
  }

  function updateCreatures(dt) {
    var R = hole.r, base = FORMS[0].spd * R * slowK();
    for (var i = creatures.length - 1; i >= 0; i--) {
      var c = creatures[i];
      c.t += dt; c.life -= dt; c.stun = Math.max(0, c.stun - dt);
      var dx = hole.x - c.x, dy = hole.y - c.y, d = Math.sqrt(dx * dx + dy * dy) || 1, want = Math.atan2(dy, dx);
      var leaving = c.life <= 0;
      if (leaving) want += Math.PI;
      var spd = 0, turn = 2.4;
      if (c.stun > 0) { c.vx *= 1 - 2 * dt; c.vy *= 1 - 2 * dt; }
      else if (c.kind === "eel") {       // a long serpent that never stops coming
        spd = base * (0.78 + chaos * 0.015);
        c.a += clamp(angDiff(c.a, want + Math.sin(c.t * 2) * 0.4), -turn * dt, turn * dt);
        c.vx = Math.cos(c.a) * spd; c.vy = Math.sin(c.a) * spd;
      } else if (c.kind === "hound") {   // circles at a distance, flares, then lunges
        if (c.dash > 0) { c.dash -= dt; }
        else if (c.tell > 0) { c.tell -= dt; c.vx *= 1 - 4 * dt; c.vy *= 1 - 4 * dt; if (c.tell <= 0) { c.dash = 0.9; c.vx = dx / d * base * 3; c.vy = dy / d * base * 3; } }
        else {
          var orbit = R * 7, side = d > orbit ? 0.7 : -0.4;
          var tx = dx / d * side - dy / d, ty = dy / d * side + dx / d;
          c.vx += (tx * base * 1.1 - c.vx) * 2 * dt; c.vy += (ty * base * 1.1 - c.vy) * 2 * dt;
          c.cd -= dt;
          if (c.cd <= 0 && !leaving) { c.tell = 0.7; c.cd = rr(2.5, 4.5) - Math.min(1.5, chaos * 0.1); }
        }
        if (leaving) { c.vx = -dx / d * base * 1.5; c.vy = -dy / d * base * 1.5; }
        c.a = Math.atan2(c.vy, c.vx);
      } else {                           // the watcher: an eye that keeps its distance and spits fire bigger than you
        var keep = R * 9, k2 = d > keep ? 0.5 : -0.3;
        c.vx += (dx / d * base * k2 - c.vx) * dt; c.vy += (dy / d * base * k2 - c.vy) * dt;
        if (leaving) { c.vx = -dx / d * base; c.vy = -dy / d * base; }
        c.cd -= dt;
        if (c.cd <= 0 && !leaving && d < viewR() * 1.2) {
          c.cd = Math.max(1.6, 3.4 - chaos * 0.12);
          var lead = d / (base * 1.6), ax = hole.x + hole.vx * lead * 0.5 - c.x, ay = hole.y + hole.vy * lead * 0.5 - c.y, al = Math.sqrt(ax * ax + ay * ay) || 1;
          var sp = makeObj(c.x + ax / al * c.r, c.y + ay / al * c.r, R * rr(0.95, 1.2), "spit", ax / al * base * 1.6, ay / al * base * 1.6);
          sp.life = 5; sp.col = C.acid;
          sfx("spit");
        }
      }
      c.x += c.vx * dt; c.y += c.vy * dt;
      if (c.kind === "eel") {
        c.hist.push({ x: c.x, y: c.y });
        if (c.hist.length > 200) c.hist.shift();
        for (var b = 0; b < c.body.length; b++) {
          var hp = c.hist[Math.max(0, c.hist.length - 1 - (b + 1) * 5)];
          c.body[b].x = hp.x; c.body[b].y = hp.y;
        }
      }
      if (leaving && d > viewR() * 2) { creatures.splice(i, 1); continue; }
      // the hunter is hunted: crash into your trail and it shatters into things you can eat
      var dead = false;
      for (var t = 0; t < trail.length && !dead; t++) {
        var sg = trail[t], tx2 = c.x - sg.x, ty2 = c.y - sg.y, rr2 = c.r * 0.7 + sg.r;
        if (tx2 * tx2 + ty2 * ty2 < rr2 * rr2) dead = true;
      }
      var bigger = c.r >= R * EAT;
      var touch = d < R * 0.8 + c.r * 0.8;
      if (!touch && c.kind === "eel") for (var bb = 0; bb < c.body.length; bb += 2) {
        var ex = hole.x - c.body[bb].x, ey = hole.y - c.body[bb].y, er = R * 0.8 + c.r * 0.55 * (1 - bb / 14);
        if (ex * ex + ey * ey < er * er) touch = true;
      }
      if (touch && !bigger) {            // a small one: eat it
        creatures.splice(i, 1);
        falling.push({ o: { r: c.r, kind: "creature", col: C.acid, x: c.x, y: c.y, rot: 0 }, a: Math.atan2(-dy, -dx), d: d, t: 0 });
        banner2 = { text: "HUNTER EATEN", t: 1.5, c: C.acid };
        continue;
      }
      if (touch && bigger && hole.phase <= 0) { torn(c.x, c.y); if (state !== "playing") return; }
      if (dead) {
        creatures.splice(i, 1);
        sfx("shatter");
        burst(c.x, c.y, 50, 350, [C.acid, C.white, C.pink], 1, 3);
        ring(c.x, c.y, c.r * 3, C.acid, 0.6);
        for (var q = 0; q < 5; q++) { var qa = rnd() * TAU; makeObj(c.x + Math.cos(qa) * c.r, c.y + Math.sin(qa) * c.r, R * rr(0.2, 0.45), "rock", Math.cos(qa) * R * 2, Math.sin(qa) * R * 2).col = C.acid; }
        banner2 = { text: "SHATTERED ON YOUR TRAIL", t: 1.8, c: C.acid };
      }
    }
  }

  function updateFx(dt) {
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      p.life -= dt;
      if (p.life <= 0) { parts.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 1 - 1.5 * dt; p.vy *= 1 - 1.5 * dt;
    }
    for (var j = rings.length - 1; j >= 0; j--) { rings[j].life -= dt; if (rings[j].life <= 0) rings.splice(j, 1); }
    if (banner) { banner.t -= dt; if (banner.t <= 0) banner = null; }
    if (banner2) { banner2.t -= dt; if (banner2.t <= 0) banner2 = null; }
    shake = Math.max(0, shake - 25 * dt);
    flash = Math.max(0, flash - dt);
    // the camera follows, and pulls back as you grow (smoothly, in log space)
    var tz = targetZoom();
    zoom = Math.exp(Math.log(zoom) + (Math.log(tz) - Math.log(zoom)) * Math.min(1, 1.6 * dt));
    var vr = viewR() * 0.12;
    var lx = hole.x + clamp(hole.vx * 0.25, -vr, vr), ly = hole.y + clamp(hole.vy * 0.25, -vr, vr);
    cam.x += (lx - cam.x) * Math.min(1, 4 * dt); cam.y += (ly - cam.y) * Math.min(1, 4 * dt);
  }

  // ---------------------------------------------------------------- drawing
  function glow(c, b) { ctx.shadowColor = c; ctx.shadowBlur = b; }
  function noGlow() { ctx.shadowBlur = 0; }
  function SX(x) { return (x - cam.x) * zoom + W / 2; }
  function SY(y) { return (y - cam.y) * zoom + H / 2; }

  var starDrift = { x: 0, y: 0 };
  function drawBack(now, dt) {
    ctx.fillStyle = C.black;
    ctx.fillRect(0, 0, W, H);
    var hx = W / 2, hy = H / 2, HR = 0;
    if (started && hole) { hx = SX(hole.x); hy = SY(hole.y); HR = hole.r * zoom; starDrift.x -= hole.vx * zoom * dt * 0.08; starDrift.y -= hole.vy * zoom * dt * 0.08; }
    else { starDrift.x -= dt * 6; HR = Math.min(W, H) * 0.05; }
    // the chaos: a slow vortex of faint arms that grows stronger as things get worse
    var ch = started && hole ? Math.min(1, chaos / 9) : 0.15;
    if (ch > 0.05) {
      ctx.save(); ctx.translate(hx, hy); ctx.rotate(now / 9000);
      ctx.lineWidth = 2;
      for (var a = 0; a < 6; a++) {
        ctx.strokeStyle = a % 2 ? C.deep : (a % 3 ? C.navy : "#3a1a3f");
        ctx.globalAlpha = 0.25 * ch + 0.1;
        ctx.beginPath();
        for (var s = 0; s < 40; s++) {
          var rr2 = 30 + s * s * Math.max(W, H) / 1400, aa = a / 6 * TAU + s * 0.18;
          if (s === 0) ctx.moveTo(Math.cos(aa) * rr2, Math.sin(aa) * rr2); else ctx.lineTo(Math.cos(aa) * rr2, Math.sin(aa) * rr2);
        }
        ctx.stroke();
      }
      ctx.restore(); ctx.globalAlpha = 1;
    }
    // the stars, bent round the hole like light round real ones
    ctx.fillStyle = C.white;
    var lens = HR * HR * 2.4;
    for (var i = 0; i < bgStars.length; i++) {
      var st = bgStars[i];
      var x = ((st.x + starDrift.x * st.d) % W + W) % W, y = ((st.y + starDrift.y * st.d) % H + H) % H;
      var dx = x - hx, dy = y - hy, d2 = dx * dx + dy * dy;
      if (d2 < HR * HR * 1.1) continue;
      if (d2 < lens * 25) { var k = 1 + lens / d2; x = hx + dx * k; y = hy + dy * k; }
      ctx.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(st.t + now / 1300));
      ctx.fillRect(x, y, st.r, st.r);
    }
    ctx.globalAlpha = 1;
  }

  function drawObj(o, now) {
    var x = SX(o.x), y = SY(o.y), r = o.r * zoom;
    var pad = o.kind === "galaxy" ? r * 1.4 : o.kind === "star" ? r * 1.6 : r * 2.2;
    if (r < 0.3 || x < -pad || x > W + pad || y < -pad || y > H + pad) return;
    var danger = o.r >= hole.r * EAT || o.kind === "spit";
    ctx.save();
    ctx.translate(x, y);
    if (o.kind === "rock") {
      ctx.rotate(o.rot);
      ctx.beginPath();
      for (var i = 0; i < o.pts.length; i++) { var a = i / o.pts.length * TAU; ctx[i ? "lineTo" : "moveTo"](Math.cos(a) * r * o.pts[i], Math.sin(a) * r * o.pts[i]); }
      ctx.closePath();
      ctx.fillStyle = "#14273a"; ctx.fill();
      ctx.strokeStyle = o.col; ctx.lineWidth = Math.max(1, r * 0.08); ctx.stroke();
    } else if (o.kind === "comet") {
      var va = Math.atan2(o.vy, o.vx);
      ctx.rotate(va);
      ctx.globalAlpha = 0.5; ctx.strokeStyle = C.sky; ctx.lineWidth = r * 1.2; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-r * 6, 0); ctx.stroke();
      ctx.globalAlpha = 0.3; ctx.lineWidth = r * 0.5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-r * 10, r * 0.6); ctx.stroke();
      ctx.globalAlpha = 1; ctx.fillStyle = o.col; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
    } else if (o.kind === "satellite") {
      ctx.rotate(o.rot * 3);
      ctx.fillStyle = C.blue; ctx.fillRect(-r * 1.4, -r * 0.35, r * 0.9, r * 0.7); ctx.fillRect(r * 0.5, -r * 0.35, r * 0.9, r * 0.7);
      ctx.strokeStyle = C.sky; ctx.lineWidth = 1; ctx.strokeRect(-r * 1.4, -r * 0.35, r * 0.9, r * 0.7); ctx.strokeRect(r * 0.5, -r * 0.35, r * 0.9, r * 0.7);
      ctx.fillStyle = o.col; ctx.fillRect(-r * 0.5, -r * 0.5, r, r);
      if (Math.floor(now / 400 + o.seed) % 2) { ctx.fillStyle = C.pink; ctx.fillRect(-r * 0.15, -r * 0.75, r * 0.3, r * 0.3); }
    } else if (o.kind === "moon" || o.kind === "planet") {
      if (o.ringed) { ctx.save(); ctx.rotate(o.tilt); ctx.scale(1, 0.3); ctx.strokeStyle = o.col2; ctx.globalAlpha = 0.7; ctx.lineWidth = r * 0.25; ctx.beginPath(); ctx.arc(0, 0, r * 1.7, Math.PI, TAU); ctx.stroke(); ctx.restore(); ctx.globalAlpha = 1; }
      ctx.fillStyle = o.col; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.clip();
      if (o.kind === "moon") {
        ctx.fillStyle = "rgba(2,6,17,0.25)";
        for (var c = 0; c < o.craters.length; c++) { ctx.beginPath(); ctx.arc(o.craters[c][0] * r, o.craters[c][1] * r, o.craters[c][2] * r, 0, TAU); ctx.fill(); }
      } else {
        ctx.rotate(o.tilt || 0);
        ctx.fillStyle = o.col2; ctx.globalAlpha = 0.45;
        for (var b = -2; b <= 2; b++) ctx.fillRect(-r, (b * 0.38 + Math.sin(o.seed + b) * 0.08) * r, r * 2, r * 0.14);
        ctx.globalAlpha = 1;
      }
      ctx.fillStyle = "rgba(2,6,17,0.55)";       // the night side
      ctx.beginPath(); ctx.arc(0, 0, r * 1.02, 0, TAU); ctx.arc(-r * 0.4, -r * 0.4, r * 1.1, 0, TAU, true); ctx.fill("evenodd");
      ctx.restore();
      if (o.ringed) { ctx.rotate(o.tilt); ctx.scale(1, 0.3); ctx.strokeStyle = o.col2; ctx.globalAlpha = 0.85; ctx.lineWidth = r * 0.25; ctx.beginPath(); ctx.arc(0, 0, r * 1.7, 0, Math.PI); ctx.stroke(); ctx.globalAlpha = 1; }
    } else if (o.kind === "star") {
      glow(o.col, Math.min(80, r * 0.8));
      ctx.fillStyle = o.col; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
      noGlow();
      ctx.strokeStyle = o.col; ctx.globalAlpha = 0.35; ctx.lineWidth = Math.max(1, r * 0.05);
      ctx.beginPath();
      for (var f = 0; f < 16; f++) { var fa = f / 16 * TAU + now / 3000, fl = r * (1.15 + 0.12 * Math.sin(now / 200 + f * 3)); ctx.moveTo(Math.cos(fa) * r, Math.sin(fa) * r); ctx.lineTo(Math.cos(fa) * fl, Math.sin(fa) * fl); }
      ctx.stroke(); ctx.globalAlpha = 1;
      ctx.fillStyle = C.white; ctx.globalAlpha = 0.6; ctx.beginPath(); ctx.arc(-r * 0.2, -r * 0.2, r * 0.45, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
    } else if (o.kind === "galaxy") {
      ctx.rotate(o.rot);
      ctx.fillStyle = o.col;
      for (var arm = 0; arm < o.arms; arm++) {
        for (var p = 0; p < 50; p++) {
          var t = p / 50, ga = arm / o.arms * TAU + t * 4, gr = t * r;
          ctx.globalAlpha = 0.9 - t * 0.7;
          ctx.fillRect(Math.cos(ga) * gr, Math.sin(ga) * gr, 1.5 + (1 - t) * 2.5, 1.5 + (1 - t) * 2.5);
        }
      }
      glow(C.white, 30); ctx.fillStyle = C.white; ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(0, 0, r * 0.12, 0, TAU); ctx.fill(); noGlow();
    } else if (o.kind === "spit") {
      glow(C.acid, 20); ctx.fillStyle = C.acid; ctx.globalAlpha = 0.85;
      ctx.beginPath(); ctx.arc(0, 0, r * (1 + 0.08 * Math.sin(now / 60)), 0, TAU); ctx.fill();
      ctx.fillStyle = C.black; ctx.beginPath(); ctx.arc(0, 0, r * 0.45, 0, TAU); ctx.fill(); noGlow(); ctx.globalAlpha = 1;
    }
    ctx.restore();
    if (danger) {                        // bigger than you: a pulsing warning outline
      var pr = o.kind === "galaxy" ? r * 1.05 : r + 3;
      ctx.save();
      ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.globalAlpha = 0.55 + 0.45 * Math.sin(now / 150);
      ctx.setLineDash([8, 6]); ctx.lineDashOffset = -now / 40;
      glow(C.warn, 8);
      ctx.beginPath(); ctx.arc(x, y, pr, 0, TAU); ctx.stroke();
      ctx.restore();
    }
  }

  function drawFalling(now) {            // spiralling in, stretched towards the hole
    for (var i = 0; i < falling.length; i++) {
      var f = falling[i], o = f.o;
      var x = SX(hole.x) + Math.cos(f.a) * f.d * zoom, y = SY(hole.y) + Math.sin(f.a) * f.d * zoom;
      var k = clamp(1 - f.t / 1.4, 0.1, 1), r = Math.max(1, o.r * zoom * k);
      ctx.save();
      ctx.translate(x, y); ctx.rotate(f.a);
      ctx.scale(1 + (1 - k) * 2.5, Math.max(0.15, k));
      ctx.globalAlpha = 0.4 + 0.6 * k;
      glow(o.col || C.sky, 12);
      ctx.fillStyle = o.kind === "star" ? o.col : o.col || C.sky;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
      ctx.restore();
    }
    noGlow(); ctx.globalAlpha = 1;
  }

  function drawTrail(now) {
    if (!trail.length) return;
    ctx.save();
    ctx.strokeStyle = FORMS[form].col; ctx.globalAlpha = 0.35; ctx.lineWidth = Math.max(1.5, hole.r * zoom * 0.15);
    ctx.setLineDash([4, 8]);
    ctx.beginPath(); ctx.moveTo(SX(hole.x), SY(hole.y));
    for (var i = 0; i < trail.length; i++) ctx.lineTo(SX(trail[i].x), SY(trail[i].y));
    ctx.stroke(); ctx.restore();
    for (var t = trail.length - 1; t >= 0; t--) {
      var s = trail[t], x = SX(s.x), y = SY(s.y), r = s.r * zoom;
      s.rot += s.spin * 0.016;
      ctx.save(); ctx.translate(x, y); ctx.rotate(s.rot);
      ctx.beginPath();
      for (var p = 0; p < s.pts.length; p++) { var a = p / s.pts.length * TAU; ctx[p ? "lineTo" : "moveTo"](Math.cos(a) * r * s.pts[p], Math.sin(a) * r * s.pts[p]); }
      ctx.closePath();
      ctx.fillStyle = "#14112a"; ctx.fill();
      glow(s.col, 10); ctx.strokeStyle = s.col; ctx.lineWidth = Math.max(1.5, r * 0.1); ctx.stroke(); noGlow();
      ctx.fillStyle = s.col; ctx.globalAlpha = 0.5;
      ctx.beginPath(); ctx.arc(0, 0, r * 0.3, 0, TAU); ctx.fill();
      ctx.restore();
    }
  }

  function drawCreature(c, now) {
    var x = SX(c.x), y = SY(c.y), r = c.r * zoom;
    if (x < -r * 30 || x > W + r * 30 || y < -r * 30 || y > H + r * 30) return;
    var bigger = c.r >= hole.r * EAT, col = c.stun > 0 ? C.sky : C.acid;
    ctx.save();
    ctx.globalAlpha = c.life < 0 ? Math.max(0.2, 1 + c.life / 4) : 1;
    ctx.lineCap = "round";
    if (c.kind === "eel") {
      for (var b = c.body.length - 1; b >= 0; b--) {
        var bx = SX(c.body[b].x), by = SY(c.body[b].y), br = r * 0.55 * (1 - b / 14);
        glow(col, 12); ctx.fillStyle = C.black; ctx.strokeStyle = col; ctx.lineWidth = Math.max(1.5, r * 0.08);
        ctx.beginPath(); ctx.arc(bx, by, br, 0, TAU); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(bx, by, br * 0.35, 0, TAU); ctx.fillStyle = col; ctx.globalAlpha *= 0.5; ctx.fill(); ctx.globalAlpha = c.life < 0 ? Math.max(0.2, 1 + c.life / 4) : 1;
      }
      ctx.translate(x, y); ctx.rotate(c.a);
      glow(col, 18); ctx.fillStyle = C.black; ctx.strokeStyle = col; ctx.lineWidth = Math.max(2, r * 0.1);
      ctx.beginPath(); ctx.moveTo(r, 0); ctx.lineTo(-r * 0.4, -r * 0.7); ctx.lineTo(-r * 0.7, 0); ctx.lineTo(-r * 0.4, r * 0.7); ctx.closePath(); ctx.fill(); ctx.stroke();
      var jaw = 0.3 + 0.25 * Math.sin(c.t * 8);
      ctx.beginPath(); ctx.moveTo(r * 0.9, 0); ctx.lineTo(r * 1.5, -r * jaw); ctx.moveTo(r * 0.9, 0); ctx.lineTo(r * 1.5, r * jaw); ctx.stroke();
      ctx.fillStyle = C.pink; ctx.beginPath(); ctx.arc(r * 0.2, -r * 0.25, r * 0.12, 0, TAU); ctx.arc(r * 0.2, r * 0.25, r * 0.12, 0, TAU); ctx.fill();
    } else if (c.kind === "hound") {
      ctx.translate(x, y); ctx.rotate(c.a);
      var tell = c.tell > 0;
      glow(tell ? C.white : col, tell ? 30 : 16);
      ctx.strokeStyle = tell ? C.white : col; ctx.lineWidth = Math.max(1.5, r * 0.08); ctx.globalAlpha *= 0.6;
      ctx.beginPath();
      for (var tl = 0; tl < 5; tl++) { ctx.moveTo(-r * 0.6, (tl - 2) * r * 0.2); ctx.quadraticCurveTo(-r * 2, (tl - 2) * r * 0.5 + Math.sin(c.t * 6 + tl) * r * 0.3, -r * 3.4, (tl - 2) * r * 0.7); }
      ctx.stroke(); ctx.globalAlpha = 1;
      ctx.fillStyle = C.black; ctx.lineWidth = Math.max(2, r * 0.1);
      ctx.beginPath(); ctx.moveTo(r * 1.2, 0); ctx.lineTo(r * 0.2, -r * 0.8); ctx.lineTo(-r * 0.8, -r * 0.5); ctx.lineTo(-r * 0.6, 0); ctx.lineTo(-r * 0.8, r * 0.5); ctx.lineTo(r * 0.2, r * 0.8); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = tell ? C.white : C.pink; ctx.beginPath(); ctx.arc(r * 0.45, -r * 0.25, r * 0.13, 0, TAU); ctx.arc(r * 0.45, r * 0.25, r * 0.13, 0, TAU); ctx.fill();
    } else {
      ctx.translate(x, y);
      glow(col, 20); ctx.strokeStyle = col; ctx.lineWidth = Math.max(1.5, r * 0.05);
      ctx.beginPath();
      for (var tn = 0; tn < 10; tn++) {
        var ta = tn / 10 * TAU + Math.sin(c.t + tn) * 0.2;
        ctx.moveTo(Math.cos(ta) * r, Math.sin(ta) * r);
        ctx.quadraticCurveTo(Math.cos(ta + 0.3) * r * 1.6, Math.sin(ta + 0.3) * r * 1.6, Math.cos(ta + Math.sin(c.t * 2 + tn) * 0.5) * r * 2.1, Math.sin(ta + Math.sin(c.t * 2 + tn) * 0.5) * r * 2.1);
      }
      ctx.stroke();
      ctx.fillStyle = C.black; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.stroke();
      var ea = Math.atan2(hole.y - c.y, hole.x - c.x);
      ctx.fillStyle = C.white; ctx.beginPath(); ctx.arc(Math.cos(ea) * r * 0.3, Math.sin(ea) * r * 0.3, r * 0.5, 0, TAU); ctx.fill();
      ctx.fillStyle = C.acid; ctx.beginPath(); ctx.arc(Math.cos(ea) * r * 0.45, Math.sin(ea) * r * 0.45, r * 0.26, 0, TAU); ctx.fill();
      ctx.fillStyle = C.black; ctx.beginPath(); ctx.ellipse(Math.cos(ea) * r * 0.5, Math.sin(ea) * r * 0.5, r * 0.06, r * 0.2, ea, 0, TAU); ctx.fill();
    }
    ctx.restore();
    noGlow();
    if (bigger) {
      ctx.save(); ctx.strokeStyle = C.warn; ctx.lineWidth = 2; ctx.globalAlpha = 0.5 + 0.5 * Math.sin(now / 120);
      ctx.setLineDash([6, 5]); ctx.lineDashOffset = now / 30;
      ctx.beginPath(); ctx.arc(x, y, r * (c.kind === "watcher" ? 1.25 : 1.3) + 4, 0, TAU); ctx.stroke(); ctx.restore();
    }
  }

  function drawHole(now) {
    var x = SX(hole.x), y = SY(hole.y), R = hole.r * zoom, F = FORMS[form], col = F.col;
    var blink = (hole.inv > 0 && Math.floor(now / 90) % 2) ? 0.45 : 1;
    ctx.save();
    ctx.translate(x, y);
    // the reach of your pull
    ctx.globalAlpha = hole.active > 0 ? 0.45 : 0.12; ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.setLineDash([3, 9]); ctx.lineDashOffset = now / 50;
    ctx.beginPath(); ctx.arc(0, 0, R * F.pull * (hole.active > 0 ? 2.2 : 1), 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    ctx.globalAlpha = blink * (hole.phase > 0 ? 0.45 : 1);
    var spin = now / 600 * (F.id === "quasar" ? 1.8 : 1);
    // the accretion disc, tilted, its far half first
    ctx.save(); ctx.rotate(-0.25); ctx.scale(1, 0.32);
    glow(col, 20);
    for (var i = 0; i < 9; i++) {
      var rr2 = R * (1.35 + i * 0.16), off = spin * (1.6 - i * 0.12) + i * 1.7;
      ctx.strokeStyle = i % 3 === 0 ? C.white : col; ctx.globalAlpha = blink * (0.8 - i * 0.07);
      ctx.lineWidth = R * (0.16 - i * 0.012);
      ctx.beginPath(); ctx.arc(0, 0, rr2, Math.PI + off % 1, TAU + off % 1 - 0.6); ctx.stroke();
    }
    ctx.restore();
    // the light of the far side, bent up over the top of the hole
    glow(col, 25); ctx.strokeStyle = col; ctx.globalAlpha = blink * 0.9; ctx.lineWidth = R * 0.14;
    ctx.beginPath(); ctx.ellipse(0, 0, R * 1.32, R * 1.18, -0.25, Math.PI * 1.02, Math.PI * 1.98); ctx.stroke();
    ctx.strokeStyle = C.white; ctx.lineWidth = Math.max(1, R * 0.04);
    ctx.beginPath(); ctx.arc(0, 0, R * 1.06, 0, TAU); ctx.stroke();
    noGlow();
    // the hole itself
    ctx.globalAlpha = 1;
    ctx.fillStyle = C.black; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fill();
    // swirling matter inside the photon ring
    ctx.strokeStyle = col; ctx.lineWidth = Math.max(1, R * 0.03);
    for (var s = 0; s < 3; s++) {
      ctx.globalAlpha = 0.25 * blink;
      ctx.beginPath(); ctx.arc(0, 0, R * (0.55 + s * 0.13), spin * (2 + s) + s * 2, spin * (2 + s) + s * 2 + 1.4); ctx.stroke();
    }
    // the near half of the disc, over the hole
    ctx.save(); ctx.rotate(-0.25); ctx.scale(1, 0.32);
    glow(col, 20);
    for (var j = 0; j < 9; j++) {
      var r3 = R * (1.35 + j * 0.16), off2 = spin * (1.6 - j * 0.12) + j * 1.7;
      ctx.strokeStyle = j % 3 === 0 ? C.white : col; ctx.globalAlpha = blink * (0.9 - j * 0.07);
      ctx.lineWidth = R * (0.16 - j * 0.012);
      ctx.beginPath(); ctx.arc(0, 0, r3, off2 % 1, Math.PI + off2 % 1 - 0.5); ctx.stroke();
    }
    ctx.restore();
    noGlow();
    if (hole.phase > 0) { ctx.globalAlpha = 0.6; ctx.strokeStyle = C.white; ctx.setLineDash([2, 6]); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, R * 2.6, 0, TAU); ctx.stroke(); }
    ctx.restore();
  }

  function drawFx() {
    ctx.globalCompositeOperation = "lighter";
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i], k = p.life / p.max, s = Math.max(0.6, p.s * zoom * k);
      ctx.globalAlpha = k; ctx.fillStyle = p.c;
      ctx.fillRect(SX(p.x) - s, SY(p.y) - s, s * 2, s * 2);
    }
    ctx.globalCompositeOperation = "source-over";
    for (var j = 0; j < rings.length; j++) {
      var g = rings[j], kk = g.life / g.max;
      ctx.globalAlpha = kk; ctx.strokeStyle = g.c; ctx.lineWidth = 3 * kk + 0.5; glow(g.c, 14);
      ctx.beginPath(); ctx.arc(SX(g.x), SY(g.y), g.r * zoom * (1 - kk * 0.85), 0, TAU); ctx.stroke();
    }
    noGlow(); ctx.globalAlpha = 1;
  }

  function fmt(n) { return n >= 1e9 ? (n / 1e9).toFixed(2) + "G" : n >= 1e6 ? (n / 1e6).toFixed(2) + "M" : n >= 1e4 ? (n / 1e3).toFixed(1) + "k" : String(n); }

  function drawHud(now) {
    var small = W < 600, F = FORMS[form];
    ctx.textAlign = "left";
    glow(C.pink, 10); ctx.fillStyle = C.pink; ctx.font = "bold " + (small ? 16 : 22) + "px Arial, sans-serif";
    ctx.fillText("MASS " + fmt(score), 14, 30); noGlow();
    ctx.fillStyle = "#c2c2c2"; ctx.font = (small ? 12 : 14) + "px Arial, sans-serif";
    ctx.fillText("BEST " + fmt(Math.max(best, score)), 14, 50);
    for (var l = 0; l < 3; l++) {         // lives: little holes
      ctx.strokeStyle = l < lives ? C.pink : "#3a4a5a"; ctx.fillStyle = C.black; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(22 + l * 22, 70, 7, 0, TAU); ctx.fill(); ctx.stroke();
    }
    // the scale you're at, and how far to the next
    var name = level < LEVELS.length ? LEVELS[level].name : "THE LAST DARK " + (level - LEVELS.length + 2);
    ctx.textAlign = "center"; ctx.font = "bold " + (small ? 13 : 17) + "px Arial, sans-serif"; ctx.fillStyle = C.sky;
    ctx.fillText(name, W / 2, small ? 96 : 26);
    var lo = LEVELS[Math.min(level, LEVELS.length - 1)].r, hi = nextLevelR();
    if (level >= LEVELS.length) lo = hi / 3.2;
    var prog = clamp((Math.log(hole.r) - Math.log(Math.max(1, lo || 8))) / (Math.log(hi) - Math.log(Math.max(1, lo || 8))), 0, 1);
    var bw = small ? 140 : 220, by = small ? 104 : 34;
    ctx.strokeStyle = C.deep; ctx.lineWidth = 1; ctx.strokeRect(W / 2 - bw / 2, by, bw, 6);
    ctx.fillStyle = C.sky; ctx.fillRect(W / 2 - bw / 2 + 1, by + 1, (bw - 2) * prog, 4);
    // form and power
    var fy = H - 22;
    ctx.textAlign = "left"; ctx.font = "bold " + (small ? 13 : 16) + "px Arial, sans-serif";
    glow(F.col, 10); ctx.fillStyle = F.col; ctx.fillText(F.name, 14, fy - 22); noGlow();
    var pk = 1 - hole.power / F.cd;
    ctx.strokeStyle = F.col; ctx.strokeRect(14, fy - 14, 150, 10);
    ctx.fillStyle = pk >= 1 ? F.col : C.deep; ctx.fillRect(15, fy - 13, 148 * pk, 8);
    ctx.font = "11px Arial, sans-serif"; ctx.fillStyle = "#c2c2c2";
    ctx.fillText((pk >= 1 ? "SPACE: " : "") + F.pname + (pk >= 1 ? "" : "  recharging"), 14, fy + 10);
    if (!small) {
      var fx = 190;
      for (var f = 0; f < FORMS.length; f++) {
        var ok = f < unlocked;
        ctx.fillStyle = f === form ? FORMS[f].col : ok ? "#8aa1b3" : "#33465a";
        ctx.fillText((f + 1) + " " + (ok ? FORMS[f].name : "LOCKED"), fx, fy + 10);
        fx += ctx.measureText((f + 1) + " " + (ok ? FORMS[f].name : "LOCKED")).width + 16;
      }
      ctx.textAlign = "right"; ctx.font = "13px Arial, sans-serif"; ctx.fillStyle = "#c2c2c2";
      ctx.fillText("Arrows/WASD or mouse move · Space power · Q/E form · P pause · M " + (window.Sfx && Sfx.isMuted() ? "unmute" : "mute"), W - 14, 24);
    }
    if (level >= 3) {
      ctx.textAlign = "right"; ctx.font = "bold 13px Arial, sans-serif"; ctx.fillStyle = C.pink;
      ctx.fillText("TRAIL " + trail.length + " / " + trailMax(), W - 14, small ? 110 : 46);
    }
    // arrows at the edge for hunters off screen
    for (var c = 0; c < creatures.length; c++) {
      var cr = creatures[c], dx = SX(cr.x) - W / 2, dy = SY(cr.y) - H / 2;
      if (Math.abs(dx) < W / 2 && Math.abs(dy) < H / 2) continue;
      var a = Math.atan2(dy, dx);
      ctx.save(); ctx.translate(clamp(W / 2 + Math.cos(a) * W, 18, W - 18), clamp(H / 2 + Math.sin(a) * H, 80, H - 60)); ctx.rotate(a);
      ctx.fillStyle = C.acid; ctx.globalAlpha = 0.5 + 0.5 * Math.sin(now / 120);
      ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(-6, -8); ctx.lineTo(-6, 8); ctx.fill(); ctx.restore();
    }
    ctx.globalAlpha = 1;
    function fit(text, size) {
      ctx.font = "bold " + size + "px 'Arial Black', Arial, sans-serif";
      var w = ctx.measureText(text).width;
      if (w > W - 24) ctx.font = "bold " + Math.floor(size * (W - 24) / w) + "px 'Arial Black', Arial, sans-serif";
    }
    if (banner) {
      ctx.globalAlpha = Math.min(1, banner.t); ctx.textAlign = "center";
      fit(banner.text, Math.min(48, W / 12));
      glow(banner.c, 22); ctx.fillStyle = banner.c; ctx.fillText(banner.text, W / 2, H * 0.24); noGlow();
      if (banner.sub) { ctx.font = (small ? 13 : 17) + "px Arial, sans-serif"; ctx.fillStyle = C.white; ctx.fillText(banner.sub, W / 2, H * 0.24 + 30); }
      ctx.globalAlpha = 1;
    }
    if (banner2) {
      ctx.globalAlpha = Math.min(1, banner2.t); ctx.textAlign = "center";
      fit(banner2.text, small ? 16 : 22);
      glow(banner2.c, 14); ctx.fillStyle = banner2.c; ctx.fillText(banner2.text, W / 2, H * 0.78); noGlow();
      ctx.globalAlpha = 1;
    }
  }

  function drawOverlay() {
    if (state === "paused" || (state === "over" && overT > 1.2)) {
      ctx.fillStyle = "rgba(2, 6, 17, 0.6)"; ctx.fillRect(0, 0, W, H);
      ctx.textAlign = "center"; glow(C.pink, 24); ctx.fillStyle = C.pink;
      ctx.font = "bold " + Math.min(72, W / 11) + "px 'Arial Black', Arial, sans-serif";
      ctx.fillText(state === "over" ? "COLLAPSED" : "PAUSED", W / 2, H / 2 - 20); noGlow();
      ctx.fillStyle = C.white; ctx.font = (W < 600 ? 14 : 20) + "px Arial, sans-serif";
      if (state === "over") {
        var name = level < LEVELS.length ? LEVELS[level].name : "THE LAST DARK";
        ctx.fillText("Mass " + fmt(score) + "  ·  " + name + (newBest ? "  ·  NEW BEST!" : "  ·  Best " + fmt(best)), W / 2, H / 2 + 24);
        ctx.fillStyle = C.sky; ctx.fillText("Space, R or tap to begin again", W / 2, H / 2 + 56);
      } else ctx.fillText("P to carry on", W / 2, H / 2 + 24);
    }
  }

  function draw(now, dt) {
    var chaosShake = started && hole && state === "playing" ? Math.min(3, Math.max(0, chaos - 5) * 0.4) : 0;
    var s = shake + chaosShake;
    ctx.save();
    if (s > 0) ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
    drawBack(now, dt);
    if (started && hole) {
      for (var i = 0; i < objs.length; i++) drawObj(objs[i], now);
      drawTrail(now);
      for (var c = 0; c < creatures.length; c++) drawCreature(creatures[c], now);
      drawFalling(now);
      if (state !== "over") drawHole(now);
      drawFx();
    } else {
      // behind the splash: a hole turning slowly in the middle
      hole = hole || { x: 0, y: 0, vx: 0, vy: 0, r: 8, inv: 0, phase: 0, active: 0 };
      zoom = Math.min(W, H) * (W > 900 ? 0.07 : 0.05) / 8;
      if (W > 900) { cam.x = -(W * 0.36) / zoom; cam.y = 0; }   // off to the right of the title
      else { cam.x = 0; cam.y = -(H * 0.4) / zoom; }             // under it, on a phone
      drawHole(now);
    }
    ctx.restore();
    if (started && objs) {
      // chaos flicker: pink and acid flashes as the universe comes apart
      if (state === "playing" && chaos > 4 && Math.random() < Math.min(0.05, (chaos - 4) * 0.006)) {
        ctx.fillStyle = Math.random() < 0.5 ? "rgba(240,136,233,0.08)" : "rgba(57,255,106,0.06)"; ctx.fillRect(0, 0, W, H);
      }
      if (flash > 0) { ctx.fillStyle = "rgba(255,77,109," + (flash * 0.5) + ")"; ctx.fillRect(0, 0, W, H); }
      drawHud(now);
      drawOverlay();
    }
  }

  // ---------------------------------------------------------------- input
  function start() {
    if (started) return;
    started = true;
    splash.classList.add("gone");
    document.body.classList.add("playing");
    reset();
  }
  splash.addEventListener("click", start);

  function setForm(f) {
    if (f < 0 || f >= unlocked || f === form || state !== "playing") return;
    form = f; sfx("form");
    ring(hole.x, hole.y, hole.r * 3, FORMS[f].col, 0.5);
    banner2 = { text: FORMS[f].name + ": " + FORMS[f].desc, t: 2.5, c: FORMS[f].col };
  }
  function togglePause() {
    if (state === "playing") { state = "paused"; sfx("hum", 0, false); }
    else if (state === "paused") state = "playing";
  }

  document.addEventListener("keydown", function (e) {
    var k = e.key.toLowerCase();
    if (!started) { start(); e.preventDefault(); return; }
    if (k === "p" || (k === "escape" && state === "paused")) togglePause();
    else if (k === "m") { if (window.Sfx) Sfx.toggleMute(); }
    else if (k === " " && state === "playing") usePower();
    else if ((k === " " || k === "r") && state === "over" && overT > 1.2) reset();
    else if (k === "q") setForm((form + unlocked - 1) % unlocked);
    else if (k === "e") setForm((form + 1) % unlocked);
    else if (k >= "1" && k <= "4") setForm(parseInt(k, 10) - 1);
    keys[k] = true;
    if (k.indexOf("arrow") === 0 || k === " ") e.preventDefault();
  });
  document.addEventListener("keyup", function (e) { keys[e.key.toLowerCase()] = false; });
  window.addEventListener("blur", function () { keys = {}; pointer.on = false; if (state === "playing") togglePause(); });

  // mouse: hold the button to move towards the pointer. touch: drag anywhere
  canvas.addEventListener("pointerdown", function (e) {
    if (!started) { start(); return; }
    if (state === "over" && overT > 1.2) { reset(); return; }
    pointer.on = true; pointer.x = e.clientX; pointer.y = e.clientY;
    if (e.pointerType === "touch") document.body.classList.add("touch");
  });
  canvas.addEventListener("pointermove", function (e) { if (pointer.on) { pointer.x = e.clientX; pointer.y = e.clientY; } });
  ["pointerup", "pointercancel", "pointerleave"].forEach(function (n) { canvas.addEventListener(n, function () { pointer.on = false; }); });
  document.addEventListener("touchstart", function () { document.body.classList.add("touch"); }, { passive: true, capture: true });
  function btn(id, fn) {
    document.getElementById(id).addEventListener("pointerdown", function (e) { e.preventDefault(); e.stopPropagation(); fn(); });
  }
  btn("tPower", function () { if (state === "over" && overT > 1.2) reset(); else usePower(); });
  btn("tForm", function () { setForm((form + 1) % unlocked); });
  btn("tPause", togglePause);

  // ---------------------------------------------------------------- run
  function loop(now) {
    var dt = last ? Math.min(0.033, (now - last) / 1000) : 0.016;
    last = now;
    if (started) update(dt);
    draw(now, dt);
    requestAnimationFrame(loop);
  }

  window.addEventListener("resize", resize);
  resize();

  window.devourer = { info: function () {
    return { started: started, state: state, score: score, r: hole && hole.r, level: level, lives: lives, objs: objs && objs.length,
             creatures: creatures && creatures.length, trail: trail && trail.length, form: form, unlocked: unlocked };
  }, grow: function (m) { hole.m = m; } };

  if (SHOT) {                            // for README screenshots: a planet eater mid-feast, trail out, hunted, then frozen
    splash.style.display = "none";
    start();
    level = 3; unlocked = 4; form = 0; elapsed = 160; lives = 2; score = 2841200; best = Math.max(best, 3920000);
    hole.m = 380 * 380; hole.r = 380; hole.inv = 0;
    zoom = targetZoom(); objs = [];
    banner = null;
    var R = 380, vr = viewR();
    for (var i0 = 0; i0 < 110; i0++) spawnAround(R * 3, vr * 1.4, 0.86);
    for (var t0 = 0; t0 < 12; t0++) trail.push({ col: pick([C.sky, "#9fb0bf", C.pink, "#ffe08a", C.blue, C.acid]), kind: "planet", spin: rr(-2, 2), rot: rnd() * TAU,
      pts: [rr(0.7, 1), rr(0.7, 1), rr(0.7, 1), rr(0.7, 1), rr(0.7, 1), rr(0.7, 1), rr(0.7, 1)] });
    // fly a long curve so the trail has a path to follow
    for (var f0 = 0; f0 < 360; f0++) {
      var aa = f0 / 360 * 4.2;
      keys = { arrowright: Math.cos(aa) > 0.3, arrowleft: Math.cos(aa) < -0.3, arrowdown: Math.sin(aa) > 0.3, arrowup: Math.sin(aa) < -0.3 };
      hole.inv = 5; lives = 2;
      update(1 / 60);
      if (f0 === 200) { makeSystem(hole.x + vr * 0.55, hole.y - vr * 0.35, R * 1.4); spawnCreature("eel"); creatures[creatures.length - 1].x = hole.x - vr * 0.5; creatures[creatures.length - 1].y = hole.y + vr * 0.3; }
      if (f0 === 300) { spawnCreature("watcher"); var w0 = creatures[creatures.length - 1]; w0.x = hole.x + vr * 0.6; w0.y = hole.y + vr * 0.35; }
    }
    keys = {};
    hole.inv = 0; banner = null; banner2 = { text: "A WATCHER HUNTS YOU", t: 1, c: C.acid };
    // a few things mid-spiral
    for (var q = 0; q < 4; q++) falling.push({ o: { r: R * rr(0.2, 0.4), kind: "moon", col: pick([C.sky, "#ffe08a", C.pink]) }, a: q * 1.6, d: R * rr(1.4, 2.6), t: rr(0.2, 0.8) });
    draw(performance.now(), 0);
    return;
  }
  requestAnimationFrame(loop);
})();
