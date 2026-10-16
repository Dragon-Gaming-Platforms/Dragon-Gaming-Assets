// Game state machine and simulation. Pure logic: no canvas, no WebGL, no DOM.
//
// World units are metres, the water surface is y = 0 and down is -y. Every
// lifetime and every increment is driven by wall-clock seconds, never by a
// frame count -- rAF is throttled to a standstill in a hidden tab, and a
// frame-counted effect would freeze on screen instead of expiring.

import {
  WORLD, DAY_LENGTH, NIGHT_FROM, NIGHT_TO,
  SPECIES, SPECIES_BY_ID, STATS, REEL, CAST, TOUGHNESS,
} from './config.js';
import { save, flush } from './storage.js';
import { sfx } from './audio.js';

export const ROD_TIP = [WORLD.rodTip.x, WORLD.rodTip.y, WORLD.rodTip.z];

export const input = {
  hold: false,        // button/finger currently down
  pressed: false,     // rising edge, consumed by the update step
  steer: 0,           // -1 .. 1 from the arrow keys
  pointerX: null,     // absolute drag steering in screen fraction, else null
};

export const game = {
  phase: 'title',
  t: 0,
  clock: DAY_LENGTH * 0.08,   // start mid-morning

  power: 0,
  powerDir: 1,
  castFrom: [0, 0, 0],
  castTo: [0, 0, 0],
  castT: 0,
  castDur: 0.9,
  seabed: 32,                 // metres of water under the current cast
  maxDepth: STATS.maxDepth[0],

  hook: [ROD_TIP[0], ROD_TIP[1], ROD_TIP[2]],
  bobber: [0, 0, 0],
  depth: 0,
  submerged: false,

  fishes: [],
  target: null,
  biteTimer: 0,
  lureTimer: 0,
  spawnTimer: 0,

  reel: null,
  result: null,
  trophy: null,
  hint: '',

  bubbles: [],
  splashes: [],
  toasts: [],
  flashUntil: 0,
  shakeUntil: 0,
};

/* ------------------------------------------------------------------ helpers */

const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
const dist3 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

function lvl(id) {
  return save.upgrades[id] | 0;
}

export function isNight(clock = game.clock) {
  const f = (clock / DAY_LENGTH) % 1;
  return f >= NIGHT_FROM && f < NIGHT_TO;
}

export function dayFraction() {
  return (game.clock / DAY_LENGTH) % 1;
}

// Length in metres for a specimen of `len` centimetres. Heavily compressed:
// a literal scale would put a 6 cm anchovy and a 5 m squid in the same shot.
export function modelLength(lenCm) {
  return 0.22 + Math.pow(lenCm, 0.62) * 0.055;
}

function candidates(depth, night) {
  const out = [];
  const boost = STATS.rarity[lvl('bait')];
  for (const sp of SPECIES) {
    if (depth < sp.band[0] || depth > sp.band[1]) continue;
    if (sp.night === true && !night) continue;
    if (sp.night === false && night) continue;
    const rank = sp.tier === 'junk' ? -1 : sp.tier === 'common' ? 0
      : sp.tier === 'uncommon' ? 1 : sp.tier === 'legendary' ? 3 : 2;
    out.push({ sp, w: sp.weight * Math.pow(boost, rank) });
  }
  return out;
}

function pickSpecies(depth, night = isNight(), swimmersOnly = false) {
  let list = candidates(depth, night);
  if (swimmersOnly) list = list.filter((c) => c.sp.speed > 0.4);
  if (!list.length) return SPECIES_BY_ID.anchovy;
  let total = 0;
  for (const c of list) total += c.w;
  let r = Math.random() * total;
  for (const c of list) {
    r -= c.w;
    if (r <= 0) return c.sp;
  }
  return list[list.length - 1].sp;
}

function rollLength(sp) {
  const [lo, hi] = sp.len;
  // Bell-ish roll, with an occasional trophy specimen.
  let r = (Math.random() + Math.random() + Math.random()) / 3;
  if (Math.random() < 0.08) r = 0.82 + Math.random() * 0.18;
  return Math.round((lo + (hi - lo) * r) * 10) / 10;
}

function valueOf(sp, len) {
  const [lo, hi] = sp.len;
  const n = hi > lo ? (len - lo) / (hi - lo) : 0.5;
  return Math.max(1, Math.round(sp.value * (0.45 + 0.9 * Math.pow(n, 1.4))));
}

export function toast(text, kind = 'info') {
  game.toasts.push({ text, kind, born: game.t, die: game.t + 2.6 });
  if (game.toasts.length > 3) game.toasts.splice(0, game.toasts.length - 3);
}

/* -------------------------------------------------------------- fish spawning */

function makeFish(sp, x, y, z) {
  const len = rollLength(sp);
  const yaw = Math.random() * Math.PI * 2;
  return {
    sp, len,
    p: [x, y, z],
    size: modelLength(len),
    yaw, pitch: 0, roll: 0,
    turn: rand(-0.3, 0.3),
    speed: sp.speed * rand(0.75, 1.25),
    phase: Math.random() * Math.PI * 2,
    bob: rand(0.25, 0.8),
    state: 'swim',
    curiosity: 0,
    grounded: sp.speed <= 0.4,
    born: game.t,
  };
}

function spawnAmbient() {
  const hook = game.hook;
  // Tight around the hook: it falls at 11 m/s, so anything spawned further out
  // is culled again before it ever reaches the frame.
  const top = Math.min(-0.6, hook[1] + 9);
  const bottom = Math.max(-game.seabed + 0.5, hook[1] - 9);
  if (bottom >= top) return;

  let y = rand(bottom, top);
  const sp = pickSpecies(-y);

  // Kelp, boots, cans and chests belong on the bottom, not adrift mid-water.
  if (sp.speed <= 0.4) {
    if (Math.random() < 0.55) return;                 // and they stay scarce
    if (game.fishes.reduce((n, f) => n + (f.grounded ? 1 : 0), 0) >= 5) return;
    const bedY = -game.seabed + rand(0.15, 0.5);
    if (-bedY < sp.band[0] || -bedY > sp.band[1]) return;
    if (Math.abs(bedY - hook[1]) > 14) return;
    // Kept near the line: scattered across the whole slab, a prop on the
    // bottom is decor the hook never meets.
    const f = makeFish(sp,
      hook[0] + rand(-9, 9),
      bedY,
      rand(-5, 5));
    f.speed = 0;
    f.bob = 0;
    f.pitch = 0;
    game.fishes.push(f);
    return;
  }

  // Everything else enters from one side of the slab -- except right after the
  // hook hits the water, when the slab is seeded in place so the first shot
  // underwater is not an empty blue room.
  const seeding = game.fishes.length < 14;
  const side = Math.random() < 0.5 ? -1 : 1;
  const f = makeFish(sp,
    hook[0] + (seeding ? rand(-1, 1) : side) * WORLD.halfWidth,
    y,
    rand(-WORLD.halfDepthZ, WORLD.halfDepthZ));
  if (!seeding) f.yaw = side > 0 ? Math.PI : 0;
  game.fishes.push(f);
}

function cullFish() {
  const hook = game.hook;
  game.fishes = game.fishes.filter((f) => {
    if (f === game.target) return true;
    if (Math.abs(f.p[0] - hook[0]) > WORLD.halfWidth * 1.6) return false;
    if (Math.abs(f.p[2]) > WORLD.halfDepthZ * 2.2) return false;
    // Tight: the hook falls at 11 m/s, and a generous window keeps the whole
    // shoal from 25 m higher up hanging in the scene long after the camera has
    // left it behind.
    return Math.abs(f.p[1] - hook[1]) < 15;
  });
}

/* ------------------------------------------------------------------- actions */

export function startGame() {
  game.phase = 'aiming';
  game.hint = 'Hold to charge, release to cast';
  resetToBoat();
}

function resetToBoat() {
  game.hook[0] = ROD_TIP[0];
  game.hook[1] = ROD_TIP[1];
  game.hook[2] = ROD_TIP[2];
  game.depth = 0;
  game.submerged = false;
  game.target = null;
  game.reel = null;
  game.power = 0;
  game.powerDir = 1;
  game.fishes.length = 0;
  game.bubbles.length = 0;
  game.trophy = null;
}

function beginCast(power) {
  const p = clamp(power, CAST.minPower, 1);
  game.power = p;
  game.seabed = lerp(CAST.minSeabed, CAST.maxSeabed, Math.pow(p, 1.15));
  game.maxDepth = Math.min(STATS.maxDepth[lvl('line')], game.seabed - 1.4);
  game.castFrom = [ROD_TIP[0], ROD_TIP[1], ROD_TIP[2]];
  game.castTo = [lerp(CAST.minRange, CAST.maxRange, p) + rand(-0.6, 0.6), 0, rand(-0.8, 0.8)];
  game.castT = 0;
  game.castDur = 0.55 + p * 0.5;
  game.phase = 'casting';
  game.hint = '';
  sfx.cast();
}

function enterWater() {
  game.hook[0] = game.castTo[0];
  game.hook[1] = -0.15;
  game.hook[2] = game.castTo[2];
  game.bobber = [game.hook[0], 0, game.hook[2]];
  game.submerged = true;
  game.phase = 'sinking';
  game.lureTimer = rand(2.2, 4.4) / STATS.biteSpeed[lvl('bait')];
  game.hint = 'Hold to reel up · ← → to steer';
  sfx.splash();
  for (let i = 0; i < 22; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = rand(0.6, 3.0);
    game.splashes.push({
      p: [game.hook[0], 0, game.hook[2]],
      v: [Math.cos(a) * s, rand(2.2, 5.4), Math.sin(a) * s],
      die: game.t + rand(0.5, 1.1),
      r: rand(0.04, 0.13),
    });
  }
}

function startBite(f) {
  game.target = f;
  f.state = 'biting';
  game.phase = 'bite';
  game.biteTimer = CAST.biteWindow;
  game.hint = 'Strike!';
  sfx.bite();
}

function startReeling() {
  const f = game.target;
  const sp = f.sp;
  const [lo, hi] = sp.len;
  const sizeN = hi > lo ? clamp((f.len - lo) / (hi - lo), 0, 1) : 0.5;
  const barH = STATS.barHeight[lvl('rod')];
  game.reel = {
    barH,
    barY: (REEL.trackH - barH) / 2,
    barV: 0,
    fishY: REEL.trackH * rand(0.3, 0.7),
    fishV: 0,
    fishTarget: REEL.trackH * 0.5,
    nextJump: 0,
    progress: 0.30,
    emptyFor: 0,
    elapsed: 0,
    sizeN,
    rate: STATS.reelRate[lvl('reel')] / (TOUGHNESS[sp.tier] || 1) * (0.72 + 0.28 * (1 - sizeN)),
    drain: REEL.drain * (0.85 + sp.dodge * 0.9),
    ticker: 0,
  };
  game.hookDepth = game.depth;
  f.state = 'hooked';
  game.phase = 'reeling';
  game.hint = 'Hold to raise the bar · keep it over the fish';
  sfx.hook();
  game.shakeUntil = game.t + 0.25;
}

function land() {
  const f = game.target;
  const sp = f.sp;
  const value = valueOf(sp, f.len);
  const rec = save.dex[sp.id] || (save.dex[sp.id] = { count: 0, bestLen: 0, bestValue: 0 });
  const isNew = rec.count === 0;
  const isRecord = f.len > rec.bestLen;
  rec.count += 1;
  rec.bestLen = Math.max(rec.bestLen, f.len);
  rec.bestValue = Math.max(rec.bestValue, value);
  save.coins += value;
  save.totalCaught += 1;
  save.totalEarned += value;
  flush();

  game.result = {
    kind: 'caught', sp, len: f.len, value, isNew, isRecord,
    depth: Math.round((game.hookDepth ?? game.depth) * 10) / 10,
    at: game.t,
  };
  game.phase = 'result';
  game.hint = '';
  // The catch stays in the world for the result shot -- the whole point of a
  // 3D fish is being able to look at the one you just landed.
  f.state = 'landed';
  f.p[0] = ROD_TIP[0] + 1.7;
  f.p[1] = 0.62;                 // clear of the water: it has been landed
  f.p[2] = 0.35;
  game.hook[0] = f.p[0];
  game.hook[1] = f.p[1] + f.size * 0.35;
  game.hook[2] = f.p[2];
  f.yaw = 2.5;
  f.pitch = 0;
  f.roll = 0;
  game.trophy = f;
  game.target = null;
  game.flashUntil = game.t + 0.2;
  if (sp.tier === 'legendary' || sp.tier === 'treasure') sfx.jackpot();
  else sfx.caught();
}

function loseFish(why = 'slip') {
  game.trophy = null;
  const sp = game.target ? game.target.sp : null;
  save.escapes += 1;
  flush();
  game.result = { kind: 'escaped', why, sp, at: game.t };
  game.phase = 'result';
  game.hint = '';
  if (game.target) game.target.state = 'flee';
  game.target = null;
  sfx.escape();
}

function dismissResult() {
  game.result = null;
  game.trophy = null;
  game.phase = 'aiming';
  game.hint = 'Hold to charge, release to cast';
  resetToBoat();
}

function reelInEarly() {
  game.phase = 'aiming';
  game.hint = 'Hold to charge, release to cast';
  resetToBoat();
}

/* -------------------------------------------------------------------- update */

export function update(dt) {
  game.t += dt;
  if (game.phase !== 'title') game.clock += dt;

  const pressed = input.pressed;
  input.pressed = false;

  switch (game.phase) {
    case 'title':
      break;

    case 'aiming': {
      if (input.hold) {
        game.power += CAST.chargeRate * game.powerDir * dt;
        if (game.power >= 1) { game.power = 1; game.powerDir = -1; }
        if (game.power <= 0) { game.power = 0; game.powerDir = 1; }
      } else if (game.power > 0) {
        beginCast(game.power);
      }
      break;
    }

    case 'casting': {
      game.castT += dt;
      const p = clamp(game.castT / game.castDur, 0, 1);
      const from = game.castFrom, to = game.castTo;
      game.hook[0] = lerp(from[0], to[0], p);
      game.hook[2] = lerp(from[2], to[2], p);
      game.hook[1] = lerp(from[1], to[1], p) + Math.sin(p * Math.PI) * (1.6 + game.power * 3.4);
      game.bobber = [game.hook[0], 0, game.hook[2]];
      if (p >= 1) enterWater();
      break;
    }

    case 'sinking': {
      const rising = input.hold;
      const vy = rising ? CAST.sinkSpeed * 1.35 : -CAST.sinkSpeed;
      game.hook[1] += vy * dt;

      let steer = input.steer;
      if (input.pointerX != null) steer = clamp(input.pointerX * 2.4, -1, 1);
      game.hook[0] = clamp(game.hook[0] + steer * CAST.steer * dt, 2.5, CAST.maxRange + 8);

      const floor = -game.maxDepth;
      if (game.hook[1] < floor) game.hook[1] = floor;
      if (game.hook[1] >= -0.12) { reelInEarly(); break; }

      game.depth = -game.hook[1];

      if (Math.random() < dt * 7) {
        game.bubbles.push({
          p: [game.hook[0] + rand(-0.06, 0.06), game.hook[1], game.hook[2] + rand(-0.06, 0.06)],
          r: rand(0.012, 0.035), vy: rand(0.9, 1.9), die: game.t + rand(1.4, 2.8),
        });
      }

      updateFish(dt, true);

      game.lureTimer -= dt;
      const busy = game.fishes.some((f) => f.state === 'approach' || f.state === 'biting');
      if (game.lureTimer <= 0 && !busy) {
        // A boot does not swim to the bait: junk is snagged on the bottom,
        // which is what makes dropping the line all the way down worth doing.
        const sp = pickSpecies(clamp(game.depth, 0, game.seabed), isNight(), true);
        const side = Math.random() < 0.5 ? -1 : 1;
        const f = makeFish(sp,
          game.hook[0] + side * rand(9, 15),
          game.hook[1] + rand(-2.5, 2.5),
          rand(-4, 4));
        f.state = 'approach';
        game.fishes.push(f);
        game.lureTimer = 4.5;
      }
      break;
    }

    case 'bite': {
      updateFish(dt, false);
      game.biteTimer -= dt;
      if (pressed) { startReeling(); break; }
      if (game.biteTimer <= 0) {
        if (game.target) { game.target.state = 'flee'; game.target.curiosity = -3; }
        game.target = null;
        game.phase = 'sinking';
        game.hint = 'It got away with the bait...';
        game.lureTimer = rand(2.2, 4.2) / STATS.biteSpeed[lvl('bait')];
        toast('Too slow!', 'bad');
      }
      break;
    }

    case 'reeling': {
      const r = game.reel;
      r.barV += (input.hold ? -REEL.lift : REEL.gravity) * dt;
      r.barV *= Math.pow(REEL.damping, dt * 60);
      r.barY += r.barV * dt;
      if (r.barY < 0) { r.barY = 0; r.barV *= -0.28; }
      const maxY = REEL.trackH - r.barH;
      if (r.barY > maxY) { r.barY = maxY; r.barV *= -0.28; }

      const sp = game.target.sp;
      r.nextJump -= dt;
      if (r.nextJump <= 0) {
        const spread = 0.22 + sp.dodge * 0.78;
        r.fishTarget = clamp(r.fishY + rand(-1, 1) * REEL.trackH * spread, 10, REEL.trackH - 10);
        r.nextJump = rand(0.35, 1.5) * (1.25 - sp.dodge);
      }
      const pull = 2.2 + sp.dodge * 4.4;
      r.fishV += (r.fishTarget - r.fishY) * pull * dt;
      r.fishV *= Math.pow(0.9, dt * 60);
      r.fishY = clamp(r.fishY + r.fishV * dt, 8, REEL.trackH - 8);

      const onTarget = r.fishY >= r.barY && r.fishY <= r.barY + r.barH;
      r.onTarget = onTarget;
      r.elapsed += dt;
      // The fish fights harder the closer it gets to the boat, and the longer
      // the fight runs -- otherwise a patient player wins every time.
      r.drainNow = r.drain * (1 + 0.85 * r.progress) * (1 + 0.9 * Math.min(2.5, r.elapsed / 6));
      if (onTarget) {
        r.progress += r.rate * dt;
        r.ticker -= dt;
        if (r.ticker <= 0) { sfx.reel(); r.ticker = 0.11; }
      } else {
        r.progress -= r.drainNow * dt;
      }

      if (r.progress <= 0) {
        r.progress = 0;
        r.emptyFor += dt;
      } else {
        r.emptyFor = Math.max(0, r.emptyFor - dt * REEL.graceRecover);
      }
      if (r.emptyFor >= REEL.escapeGrace) { loseFish(); break; }
      if (r.elapsed >= REEL.maxFight) { loseFish('snap'); break; }
      if (r.progress >= 1) { land(); break; }

      // The hooked fish is hauled up toward the rod tip as progress builds.
      const f = game.target;
      const k = Math.pow(r.progress, 1.1);
      f.p[1] = lerp(-game.hookDepth, -1.1, k);
      f.p[0] = lerp(f.p[0], lerp(game.castTo[0], ROD_TIP[0] + 2.4, k), Math.min(1, dt * 1.6));
      f.p[2] = lerp(f.p[2], Math.sin(game.t * 1.7) * 0.6, Math.min(1, dt * 1.6));
      f.yaw = Math.sin(game.t * 2.6) * 0.9 + Math.PI;
      f.pitch = clamp(0.5 + Math.sin(game.t * 3.3) * 0.5, -0.4, 1.1);
      f.roll = Math.sin(game.t * 4.1) * 0.5;
      f.phase += dt * 16;
      game.hook[0] = f.p[0] - Math.cos(f.yaw) * f.size * 0.5;
      game.hook[1] = f.p[1] + 0.05;
      game.hook[2] = f.p[2];
      game.depth = -game.hook[1];
      updateFish(dt, false);
      break;
    }

    case 'result': {
      if (pressed && game.t - game.result.at > 0.35) dismissResult();
      break;
    }
  }

  game.spawnTimer -= dt;
  if (game.spawnTimer <= 0 && game.submerged && game.phase !== 'result') {
    game.spawnTimer = game.fishes.length < 16 ? 0.04 : rand(0.25, 0.6);
    if (game.fishes.length < 26) spawnAmbient();
  }

  // Wall-clock lifetimes: a hidden tab stops delivering frames, and anything
  // retired by a frame counter would still be on screen when it comes back.
  const now = game.t;
  game.bubbles = game.bubbles.filter((b) => {
    b.p[1] += b.vy * dt;
    b.p[0] += Math.sin(now * 2.4 + b.p[1] * 1.7) * 0.25 * dt;
    return b.die > now && b.p[1] < -0.05;
  });
  game.splashes = game.splashes.filter((s) => {
    s.v[1] -= 11 * dt;
    s.p[0] += s.v[0] * dt;
    s.p[1] += s.v[1] * dt;
    s.p[2] += s.v[2] * dt;
    return s.die > now;
  });
  game.toasts = game.toasts.filter((t) => t.die > now);
  cullFish();
}

function updateFish(dt, canBite) {
  const hook = game.hook;
  let best = null, bestD = Infinity;
  // Only one fish moves in on the bait at a time; a crowd around the hook
  // reads as a shoal glitch rather than as a bite.
  let claimed = game.fishes.some((f) => f.state === 'approach' || f.state === 'biting');

  for (const f of game.fishes) {
    f.phase += dt * (5 + f.speed * 0.9);
    if (f.state === 'hooked') continue;

    if (f.state === 'landed') {
      // Turning slowly on the line so both flanks come round.
      f.yaw += dt * 0.85;
      f.roll = Math.sin(game.t * 1.6) * 0.22;
      f.pitch = Math.sin(game.t * 1.1) * 0.12;
      f.p[1] = 0.62 + Math.sin(game.t * 1.3) * 0.05;
      game.hook[1] = f.p[1] + f.size * 0.35;
      continue;
    }

    if (f.state === 'biting') {
      const back = f.size * 0.42;
      steerTo(f, [hook[0] + Math.cos(f.yaw) * back, hook[1], hook[2] - Math.sin(f.yaw) * back], dt, 9);
      continue;
    }

    if (f.state === 'flee') {
      advance(f, f.speed + 4.5, dt);
      f.pitch = lerp(f.pitch, 0.12, Math.min(1, dt * 2));
      continue;
    }

    if (f.state === 'approach') {
      // Give up if the bait has been dragged out of the water this fish lives in.
      const dep = -f.p[1];
      if (dep < f.sp.band[0] - 9 || dep > f.sp.band[1] + 9) {
        f.state = 'swim';
        f.curiosity = -3;
        continue;
      }
      const d = dist3(f.p, hook);
      steerTo(f, hook, dt, Math.max(2.6, f.speed * 1.5));
      if (d < bestD) { best = f; bestD = d; }
      continue;
    }

    if (f.grounded) {
      // Snagged rather than tempted: drag the hook over it and it comes up.
      if (canBite && !claimed && dist3(f.p, hook) < 2.4 + f.size * 0.8) {
        best = f;
        bestD = 0;
      }
      continue;
    }

    // Idle cruising: a slow random turn, a gentle bob, and a nudge back toward
    // the slab of water the camera is looking at.
    f.turn += rand(-1, 1) * dt * 1.4;
    f.turn = clamp(f.turn, -0.7, 0.7);
    const dx = f.p[0] - hook[0];
    if (Math.abs(dx) > WORLD.halfWidth * 0.85 || Math.abs(f.p[2]) > WORLD.halfDepthZ) {
      const want = Math.atan2(-(0 - f.p[2]), (hook[0] - f.p[0]));
      f.yaw += angleDelta(f.yaw, want) * Math.min(1, dt * 0.9);
      f.turn *= 0.5;
    } else {
      f.yaw += f.turn * dt;
    }
    f.roll = lerp(f.roll, -f.turn * 0.55, Math.min(1, dt * 2.5));
    f.pitch = lerp(f.pitch, Math.sin(f.phase * 0.22) * 0.12, Math.min(1, dt * 1.6));
    advance(f, f.speed, dt);
    f.p[1] = clamp(f.p[1], -game.seabed + f.size * 0.5, -0.5);

    if (!canBite) continue;
    const depth = game.depth;
    const inBand = depth >= f.sp.band[0] && depth <= f.sp.band[1];
    const d = dist3(f.p, hook);
    if (inBand && d < 17) {
      f.curiosity += dt * (1.55 - d / 26) * STATS.biteSpeed[lvl('bait')];
      if (f.curiosity > 1.05 && !claimed) {
        f.state = 'approach';
        f.curiosity = 0;
        claimed = true;
      }
    } else {
      f.curiosity = Math.max(-3, f.curiosity - dt * 0.5);
    }
  }

  if (canBite && best && bestD < 0.55 + best.size * 0.5) startBite(best);
}

function advance(f, speed, dt) {
  const cp = Math.cos(f.pitch);
  f.p[0] += Math.cos(f.yaw) * cp * speed * dt;
  f.p[1] += Math.sin(f.pitch) * speed * dt + Math.sin(f.phase * 0.5) * f.bob * dt;
  f.p[2] += -Math.sin(f.yaw) * cp * speed * dt;
}

function steerTo(f, goal, dt, speed) {
  const dx = goal[0] - f.p[0], dy = goal[1] - f.p[1], dz = goal[2] - f.p[2];
  const d = Math.hypot(dx, dy, dz) || 1;
  const wantYaw = Math.atan2(-dz, dx);
  const wantPitch = Math.asin(clamp(dy / d, -1, 1));
  f.yaw += angleDelta(f.yaw, wantYaw) * Math.min(1, dt * 5);
  f.pitch += (wantPitch - f.pitch) * Math.min(1, dt * 5);
  f.roll = lerp(f.roll, 0, Math.min(1, dt * 3));
  const step = Math.min(d, speed * dt);
  f.p[0] += (dx / d) * step;
  f.p[1] += (dy / d) * step;
  f.p[2] += (dz / d) * step;
}

function angleDelta(from, to) {
  let d = (to - from) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}
