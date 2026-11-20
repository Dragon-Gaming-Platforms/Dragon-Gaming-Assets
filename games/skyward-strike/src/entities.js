// Entity definitions and their movement/attack behaviour.
//
// Nothing here touches the DOM: an enemy is a plain object and its behaviour is
// a function of (entity, context, dt), so the whole cast can be simulated
// headlessly by the balance tests.
import { FIELD, clamp } from './balance.js';
import { range } from './rng.js';

export const PLAYER = {
  speed: 300,
  // A small hit point, danmaku style: the drawn plane is much larger than the
  // thing that can actually be shot.
  radius: 6,
  hitFlashTime: 0.35,
  spawnInvuln: 2.2,
  baseFireInterval: 0.145,
  rapidFireInterval: 0.082,
};

export const BULLET_SPEED = 660;

/** Weapon layout per level: barrel offsets and angles, in field units/radians. */
export const WEAPON_LEVELS = [
  [{ x: 0, a: 0 }],
  [{ x: -6, a: 0 }, { x: 6, a: 0 }],
  [{ x: -7, a: 0 }, { x: 7, a: 0 }, { x: -12, a: -0.19 }, { x: 12, a: 0.19 }],
  [{ x: 0, a: 0 }, { x: -8, a: 0 }, { x: 8, a: 0 }, { x: -14, a: -0.2 }, { x: 14, a: 0.2 }],
  [
    { x: 0, a: 0 }, { x: -8, a: 0 }, { x: 8, a: 0 },
    { x: -14, a: -0.17 }, { x: 14, a: 0.17 },
    { x: -18, a: -0.36 }, { x: 18, a: 0.36 },
  ],
];

export const MAX_WEAPON = WEAPON_LEVELS.length;

function aimAt(e, target, speed) {
  const dx = target.x - e.x;
  const dy = target.y - e.y;
  const len = Math.hypot(dx, dy) || 1;
  return { vx: (dx / len) * speed, vy: (dy / len) * speed };
}

export const ENEMY_TYPES = {
  // Cannon fodder: drifts straight down, never shoots.
  drone: {
    hp: 1, radius: 13, value: 100, color: '#7fd1ff', minWave: 1,
    init(e, ctx) {
      e.vx = range(ctx.rng, -26, 26);
      e.vy = range(ctx.rng, 92, 116);
    },
    update(e, ctx, dt) {
      e.x += e.vx * dt;
      e.y += e.vy * dt;
      if (e.x < 22 || e.x > FIELD.W - 22) e.vx *= -1;
    },
  },

  // Sweeps side to side and drops the occasional shot straight down.
  weaver: {
    hp: 2, radius: 14, value: 170, color: '#b28dff', minWave: 2,
    init(e, ctx) {
      e.baseX = e.x;
      e.amp = range(ctx.rng, 60, 116);
      e.freq = range(ctx.rng, 1.1, 1.8);
      e.phase = ctx.rng() * Math.PI * 2;
      e.vy = range(ctx.rng, 74, 94);
      e.nextShot = ctx.time + range(ctx.rng, 0.8, 2.2) / ctx.fireScale;
    },
    update(e, ctx, dt) {
      e.phase += e.freq * dt;
      e.x = clamp(e.baseX + Math.sin(e.phase) * e.amp, 20, FIELD.W - 20);
      e.y += e.vy * dt;
      if (ctx.time >= e.nextShot && e.y > 40) {
        ctx.fireEnemyBullet(e.x, e.y + 12, 0, 224, '#ff9ad2');
        e.nextShot = ctx.time + range(ctx.rng, 1.3, 2.6) / ctx.fireScale;
      }
    },
  },

  // Descends to a hover line, then puts aimed shots on the player.
  gunner: {
    hp: 3, radius: 16, value: 250, color: '#ffcf6b', minWave: 3,
    init(e, ctx) {
      e.holdY = range(ctx.rng, 110, 230);
      e.vy = 118;
      e.vx = range(ctx.rng, -40, 40);
      e.nextShot = ctx.time + range(ctx.rng, 1.0, 1.9) / ctx.fireScale;
    },
    update(e, ctx, dt) {
      if (e.y < e.holdY) {
        e.y += e.vy * dt;
      } else {
        e.x += e.vx * dt;
        if (e.x < 28 || e.x > FIELD.W - 28) e.vx *= -1;
        e.y += 9 * dt;
      }
      if (ctx.time >= e.nextShot) {
        const { vx, vy } = aimAt(e, ctx.player, 238);
        ctx.fireEnemyBullet(e.x, e.y + 10, vx, vy, '#ffd27a');
        e.nextShot = ctx.time + range(ctx.rng, 1.5, 2.6) / ctx.fireScale;
      }
    },
  },

  // Hangs at the top, locks on, then dives.
  rusher: {
    hp: 2, radius: 13, value: 220, color: '#ff7a6b', minWave: 4,
    init(e, ctx) {
      e.stage = 'aim';
      e.aimUntil = ctx.time + range(ctx.rng, 0.5, 1.0);
      e.vx = 0;
      e.vy = 60;
    },
    update(e, ctx, dt) {
      if (e.stage === 'aim') {
        e.y += e.vy * dt;
        if (ctx.time >= e.aimUntil) {
          const a = aimAt(e, ctx.player, 430 * ctx.speedScale);
          e.vx = a.vx;
          e.vy = a.vy;
          e.stage = 'dive';
        }
      } else {
        e.x += e.vx * dt;
        e.y += e.vy * dt;
      }
    },
  },

  // Slow, tanky, throws radial bursts.
  turret: {
    hp: 6, radius: 19, value: 380, color: '#8affb0', minWave: 7,
    init(e, ctx) {
      e.vy = 52;
      e.nextShot = ctx.time + 1.4 / ctx.fireScale;
      e.spin = ctx.rng() * Math.PI;
    },
    update(e, ctx, dt) {
      e.y += e.vy * dt;
      e.spin += 1.4 * dt;
      if (ctx.time >= e.nextShot && e.y > 50) {
        const n = 7;
        for (let i = 0; i < n; i++) {
          const a = e.spin + (i / n) * Math.PI * 2;
          ctx.fireEnemyBullet(e.x, e.y, Math.cos(a) * 172, Math.sin(a) * 172, '#9dffc0');
        }
        e.nextShot = ctx.time + range(ctx.rng, 2.0, 3.0) / ctx.fireScale;
      }
    },
  },
};

export function enemyTypesFor(wave) {
  return Object.keys(ENEMY_TYPES).filter((k) => wave >= ENEMY_TYPES[k].minWave);
}

export function makeEnemy(kind, x, y, ctx, hpBonus, speedScale) {
  const def = ENEMY_TYPES[kind];
  const e = {
    kind,
    x,
    y,
    vx: 0,
    vy: 0,
    radius: def.radius,
    hp: def.hp + hpBonus,
    maxHp: def.hp + hpBonus,
    value: def.value,
    color: def.color,
    hitFlash: 0,
    roll: 0,
    dead: false,
  };
  def.init(e, ctx);
  e.vy *= speedScale;
  return e;
}

// ---------------------------------------------------------------------------
// Boss

export const BOSS_PATTERNS = ['sweep', 'aimedBurst', 'spiral'];

export function makeBoss(wave, hp) {
  return {
    kind: 'boss',
    x: FIELD.W / 2,
    y: -120,
    radius: 46,
    hp,
    maxHp: hp,
    value: 2500 + wave * 250,
    color: '#ff5d73',
    hitFlash: 0,
    entering: true,
    dir: 1,
    phase: 0,
    pattern: 'sweep',
    patternIndex: 0,
    nextPattern: 0,
    nextShot: 0,
    spin: 0,
    dead: false,
  };
}

export function updateBoss(b, ctx, dt) {
  if (b.entering) {
    b.y += 74 * dt;
    if (b.y >= 118) {
      b.y = 118;
      b.entering = false;
      b.nextPattern = ctx.time + 4.5;
      b.nextShot = ctx.time + 0.7;
    }
    return;
  }

  // The boss gets faster and angrier as its health falls.
  const rage = 1 + (1 - b.hp / b.maxHp) * 0.75;
  b.x += b.dir * 84 * rage * dt;
  if (b.x < 74) { b.x = 74; b.dir = 1; }
  if (b.x > FIELD.W - 74) { b.x = FIELD.W - 74; b.dir = -1; }
  b.y = 118 + Math.sin(ctx.time * 1.3) * 16;
  b.spin += 1.1 * dt;

  if (ctx.time >= b.nextPattern) {
    b.patternIndex = (b.patternIndex + 1) % BOSS_PATTERNS.length;
    b.pattern = BOSS_PATTERNS[b.patternIndex];
    b.nextPattern = ctx.time + 5.0;
  }

  if (ctx.time < b.nextShot) return;
  // The boss only takes a fraction of the wave's fire-rate scaling: applying it
  // in full turns the spiral into an unreadable wall within a few waves.
  const scale = 1 + 0.35 * (ctx.fireScale - 1) + 0.45 * (rage - 1);

  if (b.pattern === 'sweep') {
    const spread = 5;
    for (let i = 0; i < spread; i++) {
      const a = Math.PI / 2 + (i - (spread - 1) / 2) * 0.24 + Math.sin(ctx.time) * 0.2;
      ctx.fireEnemyBullet(b.x, b.y + 30, Math.cos(a) * 230, Math.sin(a) * 230, '#ff9db0');
    }
    b.nextShot = ctx.time + 0.95 / scale;
  } else if (b.pattern === 'aimedBurst') {
    for (let i = -1; i <= 1; i++) {
      const dx = ctx.player.x - b.x;
      const dy = ctx.player.y - b.y;
      const base = Math.atan2(dy, dx);
      const a = base + i * 0.14;
      ctx.fireEnemyBullet(b.x, b.y + 26, Math.cos(a) * 280, Math.sin(a) * 280, '#ffd166');
    }
    b.nextShot = ctx.time + 0.78 / scale;
  } else {
    const arms = 3;
    for (let i = 0; i < arms; i++) {
      const a = b.spin * 2.0 + (i / arms) * Math.PI * 2;
      ctx.fireEnemyBullet(b.x, b.y + 10, Math.cos(a) * 168, Math.sin(a) * 168, '#c9a7ff');
    }
    b.nextShot = ctx.time + 0.3 / scale;
  }
}

// ---------------------------------------------------------------------------
// Power-ups

export const POWERUPS = {
  spread: { color: '#7dffb0', label: 'W', weight: 30 },
  rapid: { color: '#ffd166', label: 'R', weight: 22 },
  shield: { color: '#6fd8ff', label: 'S', weight: 20 },
  bomb: { color: '#ff8ad4', label: 'B', weight: 18 },
  life: { color: '#ff6b81', label: '+', weight: 10 },
};

export function rollPowerup(rng) {
  const keys = Object.keys(POWERUPS);
  const total = keys.reduce((s, k) => s + POWERUPS[k].weight, 0);
  let r = rng() * total;
  for (const k of keys) {
    r -= POWERUPS[k].weight;
    if (r <= 0) return k;
  }
  return keys[0];
}
