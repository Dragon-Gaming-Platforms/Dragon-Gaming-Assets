// Game simulation. Deliberately free of DOM, canvas and timers so that the
// whole thing can be stepped from a test with a synthetic controller.
import { FIELD, clamp, waveConfig, comboMultiplier, scoreFor, dropChance } from './balance.js';
import { makeRng, pick, range } from './rng.js';
import {
  PLAYER, BULLET_SPEED, WEAPON_LEVELS, MAX_WEAPON,
  ENEMY_TYPES, enemyTypesFor, makeEnemy, makeBoss, updateBoss,
  POWERUPS, rollPowerup,
} from './entities.js';

export const COMBO_WINDOW = 4.0;
const WAVE_BREAK = 2.2;
const POWERUP_FALL = 105;
const START_LIVES = 3;
const START_BOMBS = 2;
const START_WEAPON = 2;
const MIN_WEAPON = 2;

export class Game {
  constructor(options = {}) {
    this.rng = options.rng || makeRng((Date.now() ^ 0x9e3779b9) >>> 0);
    this.events = [];
    this.state = 'title';
    this.reset();
  }

  reset() {
    this.time = 0;
    this.score = 0;
    this.wave = 1;
    this.waveSpawned = 0;
    this.waveBreakUntil = 0;
    this.nextSpawn = 0;
    this.config = waveConfig(1);
    this.streak = 0;
    this.comboExpires = 0;
    this.bestStreak = 0;
    this.kills = 0;
    this.shake = 0;
    this.flash = 0;
    this.gameOverAt = 0;

    this.player = {
      x: FIELD.W / 2,
      y: FIELD.H - 110,
      radius: PLAYER.radius,
      lives: START_LIVES,
      bombs: START_BOMBS,
      weapon: START_WEAPON,
      invuln: PLAYER.spawnInvuln,
      shield: 0,
      rapid: 0,
      nextShot: 0,
      roll: 0,
      alive: true,
    };

    this.bullets = [];
    this.enemyBullets = [];
    this.enemies = [];
    this.powerups = [];
    this.particles = [];
    this.floaters = [];
    this.boss = null;

    // Reset the input record in place. The input layer holds a reference to
    // this object, so replacing it on restart would silently disconnect the
    // controls from the simulation.
    this.input = this.input || {};
    Object.assign(this.input, {
      left: false, right: false, up: false, down: false, fire: false, bomb: false,
    });
    this.pointer = null; // { x, y } when steering by mouse/touch
    this._bombLatch = false;
  }

  start() {
    this.reset();
    this.state = 'playing';
    this.emit('start');
  }

  emit(type, data) {
    this.events.push(data ? { type, ...data } : { type });
    if (this.events.length > 64) this.events.splice(0, this.events.length - 64);
  }

  drainEvents() {
    const out = this.events;
    this.events = [];
    return out;
  }

  get comboMultiplier() {
    return comboMultiplier(this.streak);
  }

  // -------------------------------------------------------------------------

  update(dt) {
    if (!Number.isFinite(dt) || dt <= 0) return;
    if (this.state === 'playing') this.time += dt;
    // Retire expiring things unconditionally, before any gameplay guard: a
    // sweep placed behind one stops running exactly when the screen is idle.
    this.retire();
    if (this.state !== 'playing') return;

    this.shake = Math.max(0, this.shake - dt * 3.2);
    this.flash = Math.max(0, this.flash - dt * 3.6);

    if (this.streak > 0 && this.time >= this.comboExpires) this.streak = 0;

    this.updatePlayer(dt);
    this.updateBullets(dt);
    this.updateEnemies(dt);
    this.updateEnemyBullets(dt);
    this.updatePowerups(dt);
    this.updateParticles(dt);
    this.collide();
    this.updateWave(dt);
  }

  retire() {
    const t = this.time;
    const p = this.particles;
    let w = 0;
    for (let i = 0; i < p.length; i++) if (p[i].die > t) p[w++] = p[i];
    p.length = w;

    const f = this.floaters;
    w = 0;
    for (let i = 0; i < f.length; i++) if (f[i].die > t) f[w++] = f[i];
    f.length = w;
  }

  // -------------------------------------------------------------------------

  updatePlayer(dt) {
    const p = this.player;
    p.invuln = Math.max(0, p.invuln - dt);
    p.shield = Math.max(0, p.shield - dt);
    p.rapid = Math.max(0, p.rapid - dt);

    let dx = 0;
    let dy = 0;
    if (this.pointer) {
      // Pointer steering: ease towards the cursor/finger.
      const tx = clamp(this.pointer.x, 16, FIELD.W - 16);
      const ty = clamp(this.pointer.y, 40, FIELD.H - 16);
      const ex = tx - p.x;
      const ey = ty - p.y;
      const dist = Math.hypot(ex, ey);
      if (dist > 1) {
        const step = Math.min(dist, PLAYER.speed * 1.35 * dt);
        p.x += (ex / dist) * step;
        p.y += (ey / dist) * step;
      }
      dx = clamp(ex / 40, -1, 1);
    } else {
      if (this.input.left) dx -= 1;
      if (this.input.right) dx += 1;
      if (this.input.up) dy -= 1;
      if (this.input.down) dy += 1;
      if (dx && dy) {
        const inv = Math.SQRT1_2;
        dx *= inv;
        dy *= inv;
      }
      p.x += dx * PLAYER.speed * dt;
      p.y += dy * PLAYER.speed * dt;
    }

    p.x = clamp(p.x, 16, FIELD.W - 16);
    p.y = clamp(p.y, 40, FIELD.H - 16);
    p.roll += (dx - p.roll) * Math.min(1, dt * 9);

    if (this.input.fire && this.time >= p.nextShot) this.shoot();

    if (this.input.bomb && !this._bombLatch) this.useBomb();
    this._bombLatch = this.input.bomb;

    // Engine trail.
    if (this.rng() < 0.26) {
      this.particles.push({
        x: p.x + range(this.rng, -2, 2),
        y: p.y + 13,
        vx: range(this.rng, -10, 10),
        vy: range(this.rng, 150, 240),
        r: range(this.rng, 0.8, 1.9),
        color: this.rng() < 0.45 ? '#ffd166' : '#7fe3ff',
        born: this.time,
        die: this.time + 0.2,
        fade: true,
      });
    }
  }

  shoot() {
    const p = this.player;
    const interval = p.rapid > 0 ? PLAYER.rapidFireInterval : PLAYER.baseFireInterval;
    p.nextShot = this.time + interval;
    const barrels = WEAPON_LEVELS[p.weapon - 1];
    for (const b of barrels) {
      this.bullets.push({
        x: p.x + b.x,
        y: p.y - 12,
        vx: Math.sin(b.a) * BULLET_SPEED,
        vy: -Math.cos(b.a) * BULLET_SPEED,
        r: 3.2,
        damage: 1,
      });
    }
    this.emit('shoot');
  }

  useBomb() {
    const p = this.player;
    if (p.bombs <= 0 || !p.alive) return;
    p.bombs -= 1;
    this.flash = 1;
    this.shake = 1.4;
    this.enemyBullets.length = 0;
    for (const e of this.enemies) this.damageEnemy(e, 6, false);
    if (this.boss) this.damageEnemy(this.boss, 14, false);
    this.emit('bomb');
  }

  // -------------------------------------------------------------------------

  updateBullets(dt) {
    const out = [];
    for (const b of this.bullets) {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.y > -20 && b.y < FIELD.H + 20 && b.x > -20 && b.x < FIELD.W + 20) out.push(b);
    }
    this.bullets = out;
  }

  updateEnemyBullets(dt) {
    const out = [];
    for (const b of this.enemyBullets) {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.spin = (b.spin || 0) + dt * 6;
      if (b.y > -30 && b.y < FIELD.H + 30 && b.x > -30 && b.x < FIELD.W + 30) out.push(b);
    }
    this.enemyBullets = out;
  }

  enemyContext() {
    return {
      time: this.time,
      rng: this.rng,
      player: this.player,
      fireScale: this.config.fireScale,
      speedScale: this.config.speedScale,
      fireEnemyBullet: (x, y, vx, vy, color) => {
        this.enemyBullets.push({ x, y, vx, vy, r: 5, color: color || '#ff9db0', spin: 0 });
      },
    };
  }

  updateEnemies(dt) {
    const ctx = this.enemyContext();
    const alive = [];
    for (const e of this.enemies) {
      ENEMY_TYPES[e.kind].update(e, ctx, dt);
      e.hitFlash = Math.max(0, e.hitFlash - dt * 5);
      e.roll = Math.sin(this.time * 3 + e.x * 0.05) * 0.25;
      if (e.y > FIELD.H + 50 || e.x < -70 || e.x > FIELD.W + 70) {
        // Letting an enemy leave is a lapse: it breaks the combo.
        if (e.y > FIELD.H + 50) this.breakCombo();
        continue;
      }
      alive.push(e);
    }
    this.enemies = alive;

    if (this.boss) {
      updateBoss(this.boss, ctx, dt);
      this.boss.hitFlash = Math.max(0, this.boss.hitFlash - dt * 5);
    }
  }

  updatePowerups(dt) {
    const out = [];
    for (const u of this.powerups) {
      u.y += POWERUP_FALL * dt;
      u.bob = (u.bob || 0) + dt * 4;
      if (u.y < FIELD.H + 30) out.push(u);
    }
    this.powerups = out;
  }

  updateParticles(dt) {
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 1 - Math.min(1, dt * 1.6);
      p.vy *= 1 - Math.min(1, dt * 1.6);
    }
    for (const f of this.floaters) f.y -= 34 * dt;
  }

  // -------------------------------------------------------------------------

  collide() {
    const p = this.player;

    // Player bullets vs enemies.
    const liveBullets = [];
    outer: for (const b of this.bullets) {
      const targets = this.boss ? this.enemies.concat(this.boss) : this.enemies;
      for (const e of targets) {
        if (e.dead) continue;
        const rr = e.radius + b.r;
        if ((b.x - e.x) ** 2 + (b.y - e.y) ** 2 <= rr * rr) {
          this.damageEnemy(e, b.damage, true);
          this.spark(b.x, b.y, e.color);
          continue outer;
        }
      }
      liveBullets.push(b);
    }
    this.bullets = liveBullets;
    this.enemies = this.enemies.filter((e) => !e.dead);
    if (this.boss && this.boss.dead) this.boss = null;

    if (!p.alive) return;
    const vulnerable = p.invuln <= 0 && p.shield <= 0;

    // Enemy bullets vs player.
    const liveEnemyBullets = [];
    for (const b of this.enemyBullets) {
      const rr = p.radius + b.r;
      if ((b.x - p.x) ** 2 + (b.y - p.y) ** 2 <= rr * rr) {
        if (vulnerable) {
          this.hurtPlayer();
          continue;
        }
        if (p.shield > 0) {
          this.spark(b.x, b.y, '#6fd8ff');
          continue;
        }
      }
      liveEnemyBullets.push(b);
    }
    this.enemyBullets = liveEnemyBullets;

    // Ramming.
    const rammers = this.boss ? this.enemies.concat(this.boss) : this.enemies;
    for (const e of rammers) {
      const rr = p.radius + e.radius - 3;
      if ((p.x - e.x) ** 2 + (p.y - e.y) ** 2 <= rr * rr) {
        if (p.shield > 0) {
          this.damageEnemy(e, 2, true);
          this.spark(p.x, p.y, '#6fd8ff');
        } else if (p.invuln <= 0) {
          this.damageEnemy(e, 2, true);
          this.hurtPlayer();
        }
        break;
      }
    }
    this.enemies = this.enemies.filter((e) => !e.dead);
    if (this.boss && this.boss.dead) this.boss = null;

    // Power-up pickup.
    const remaining = [];
    for (const u of this.powerups) {
      if ((p.x - u.x) ** 2 + (p.y - u.y) ** 2 <= (p.radius + 16) ** 2) {
        this.applyPowerup(u.kind);
        continue;
      }
      remaining.push(u);
    }
    this.powerups = remaining;
  }

  damageEnemy(e, amount, fromPlayer) {
    if (e.dead) return;
    e.hp -= amount;
    e.hitFlash = 1;
    if (e.hp > 0) return;
    e.dead = true;

    if (fromPlayer) {
      this.streak += 1;
      this.comboExpires = this.time + COMBO_WINDOW;
      if (this.streak > this.bestStreak) this.bestStreak = this.streak;
    }
    this.kills += 1;

    const gained = scoreFor(e.value, fromPlayer ? this.streak : 0);
    this.score += gained;
    this.floaters.push({
      x: e.x, y: e.y, text: `+${gained}`,
      color: this.streak > 4 ? '#ffd166' : '#ffffff',
      die: this.time + 0.85,
    });

    this.explode(e.x, e.y, e.color, e.kind === 'boss' ? 54 : 18);
    this.shake = Math.min(1.6, this.shake + (e.kind === 'boss' ? 1.6 : 0.24));
    this.emit(e.kind === 'boss' ? 'bossDown' : 'explode');

    if (e.kind !== 'boss') {
      if (this.rng() < dropChance(this.wave)) this.dropPowerup(e.x, e.y, rollPowerup(this.rng));
    } else {
      // A downed boss is generous.
      this.dropPowerup(e.x - 34, e.y, 'spread');
      this.dropPowerup(e.x + 34, e.y, 'bomb');
      if (this.player.lives < 5) this.dropPowerup(e.x, e.y + 26, 'life');
    }
  }

  dropPowerup(x, y, kind) {
    this.powerups.push({ x: clamp(x, 20, FIELD.W - 20), y, kind, color: POWERUPS[kind].color, bob: 0 });
  }

  applyPowerup(kind) {
    const p = this.player;
    let text = '';
    if (kind === 'spread') {
      if (p.weapon < MAX_WEAPON) {
        p.weapon += 1;
        text = `WEAPON ${p.weapon}`;
      } else {
        this.score += scoreFor(500, this.streak);
        text = '+BONUS';
      }
    } else if (kind === 'rapid') {
      p.rapid = Math.min(14, p.rapid + 8);
      text = 'RAPID FIRE';
    } else if (kind === 'shield') {
      p.shield = Math.min(14, p.shield + 7);
      text = 'SHIELD';
    } else if (kind === 'bomb') {
      p.bombs = Math.min(5, p.bombs + 1);
      text = 'BOMB';
    } else if (kind === 'life') {
      p.lives = Math.min(5, p.lives + 1);
      text = 'EXTRA LIFE';
    }
    this.floaters.push({ x: p.x, y: p.y - 26, text, color: POWERUPS[kind].color, die: this.time + 1.1 });
    this.emit('powerup', { kind });
  }

  breakCombo() {
    this.streak = 0;
  }

  hurtPlayer() {
    const p = this.player;
    if (!p.alive || p.invuln > 0) return;
    p.lives -= 1;
    p.invuln = PLAYER.spawnInvuln;
    p.weapon = Math.max(MIN_WEAPON, p.weapon - 1);
    p.rapid = 0;
    this.breakCombo();
    this.shake = 1.5;
    this.flash = 0.7;
    this.explode(p.x, p.y, '#ff6b81', 26);
    this.emit('playerHit');

    if (p.lives <= 0) {
      p.alive = false;
      this.state = 'over';
      this.gameOverAt = this.time;
      this.emit('gameover', { score: this.score, wave: this.wave });
    }
  }

  explode(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const a = this.rng() * Math.PI * 2;
      const sp = range(this.rng, 40, 300);
      this.particles.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        r: range(this.rng, 1.5, 4.2),
        color: this.rng() < 0.35 ? '#ffffff' : color,
        born: this.time,
        die: this.time + range(this.rng, 0.35, 0.8),
        fade: true,
      });
    }
  }

  spark(x, y, color) {
    for (let i = 0; i < 4; i++) {
      const a = this.rng() * Math.PI * 2;
      const sp = range(this.rng, 30, 130);
      this.particles.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        r: range(this.rng, 1, 2.2),
        color,
        born: this.time,
        die: this.time + 0.22,
        fade: true,
      });
    }
    this.emit('hit');
  }

  // -------------------------------------------------------------------------

  updateWave(dt) {
    const cfg = this.config;

    if (this.waveBreakUntil > 0) {
      if (this.time < this.waveBreakUntil) return;
      this.waveBreakUntil = 0;
      this.wave += 1;
      this.config = waveConfig(this.wave);
      this.waveSpawned = 0;
      this.nextSpawn = this.time + 0.6;
      this.emit(waveConfig(this.wave).boss ? 'bossIncoming' : 'wave', { wave: this.wave });
      this.floaters.push({
        x: FIELD.W / 2, y: FIELD.H / 2 - 40,
        text: waveConfig(this.wave).boss ? 'WARNING' : `WAVE ${this.wave}`,
        color: waveConfig(this.wave).boss ? '#ff6b81' : '#7fd1ff',
        die: this.time + 1.8,
        big: true,
      });
      return;
    }

    if (cfg.boss) {
      if (!this.boss && this.waveSpawned === 0) {
        if (this.time >= this.nextSpawn) {
          this.boss = makeBoss(this.wave, cfg.bossHp);
          this.waveSpawned = 1;
        }
        return;
      }
      if (!this.boss && this.waveSpawned === 1 && this.enemies.length === 0) {
        this.waveBreakUntil = this.time + WAVE_BREAK;
      }
      return;
    }

    if (this.waveSpawned < cfg.budget) {
      if (this.time >= this.nextSpawn) {
        this.spawnEnemy();
        this.waveSpawned += 1;
        this.nextSpawn = this.time + cfg.spawnInterval * range(this.rng, 0.8, 1.2);
      }
      return;
    }

    if (this.enemies.length === 0) this.waveBreakUntil = this.time + WAVE_BREAK;
  }

  spawnEnemy() {
    const kinds = enemyTypesFor(this.wave);
    const kind = pick(this.rng, kinds);
    const x = range(this.rng, 40, FIELD.W - 40);
    const e = makeEnemy(kind, x, -30, this.enemyContext(), this.config.hpBonus, this.config.speedScale);
    this.enemies.push(e);
  }

  // -------------------------------------------------------------------------

  pause() {
    if (this.state === 'playing') {
      this.state = 'paused';
      this.emit('pause');
    }
  }

  resume() {
    if (this.state === 'paused') {
      this.state = 'playing';
      this.emit('resume');
    }
  }

  togglePause() {
    if (this.state === 'playing') this.pause();
    else if (this.state === 'paused') this.resume();
  }
}
