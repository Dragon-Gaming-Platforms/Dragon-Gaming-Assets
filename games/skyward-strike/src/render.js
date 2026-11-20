// All drawing. The renderer owns its own decorative state (stars, clouds) and
// never mutates the simulation.
import { FIELD } from './balance.js';
import { POWERUPS } from './entities.js';
import { COMBO_WINDOW } from './game.js';

const STAR_LAYERS = [
  { count: 46, speed: 16, size: 1.0, alpha: 0.35 },
  { count: 30, speed: 38, size: 1.5, alpha: 0.6 },
  { count: 16, speed: 72, size: 2.1, alpha: 0.9 },
];

export class Renderer {
  constructor(canvas, rng) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.rng = rng;
    this.scale = 1;
    this.view = { s: 1, ox: 0, oy: 0 };
    this.stars = [];
    this.clouds = [];
    this.build();
  }

  /** Idempotent: safe to call at start-up and from any imperative render path. */
  build() {
    if (this.stars.length) return;
    for (let li = 0; li < STAR_LAYERS.length; li++) {
      const layer = STAR_LAYERS[li];
      for (let i = 0; i < layer.count; i++) {
        this.stars.push({
          x: this.rng() * FIELD.W,
          y: this.rng() * FIELD.H,
          layer: li,
          tw: this.rng() * Math.PI * 2,
        });
      }
    }
    for (let i = 0; i < 9; i++) {
      const w = 150 + this.rng() * 230;
      const lobes = [];
      const n = 3 + Math.floor(this.rng() * 3);
      for (let j = 0; j < n; j++) {
        lobes.push({
          dx: (this.rng() - 0.5) * w * 0.8,
          dy: (this.rng() - 0.5) * 26,
          r: w * (0.16 + this.rng() * 0.2),
        });
      }
      this.clouds.push({
        x: this.rng() * FIELD.W,
        y: this.rng() * FIELD.H,
        w,
        speed: 8 + this.rng() * 20,
        alpha: 0.035 + this.rng() * 0.045,
        lobes,
      });
    }
  }

  /**
   * Size the backing store to the element's real pixels. A hidden or collapsed
   * stage measures 0, so every dimension is floored before anything is derived
   * from it.
   */
  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const cssW = Math.max(1, Math.round(rect.width));
    const cssH = Math.max(1, Math.round(rect.height));
    const w = Math.max(1, Math.round(cssW * dpr));
    const h = Math.max(1, Math.round(cssH * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    // Uniform scale with letterboxing: the field never stretches, whatever
    // shape the element ends up.
    const sc = Math.min(w / FIELD.W, h / FIELD.H);
    this.scale = sc;
    this.view = {
      s: sc,
      ox: (w - FIELD.W * sc) / 2,
      oy: (h - FIELD.H * sc) / 2,
      dpr,
    };
  }

  /** Map a pointer event's client coordinates into field space. */
  clientToField(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const cssW = Math.max(1, rect.width);
    const cssH = Math.max(1, rect.height);
    const sc = Math.min(cssW / FIELD.W, cssH / FIELD.H);
    const ox = (cssW - FIELD.W * sc) / 2;
    const oy = (cssH - FIELD.H * sc) / 2;
    return {
      x: (clientX - rect.left - ox) / sc,
      y: (clientY - rect.top - oy) / sc,
    };
  }

  draw(game, dt) {
    const ctx = this.ctx;
    this.build();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#04050c';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    const v = this.view;
    ctx.setTransform(v.s, 0, 0, v.s, v.ox, v.oy);

    const moving = game.state === 'playing';
    this.drawSky(ctx, game);
    this.drawClouds(ctx, moving ? dt : 0);
    this.drawStars(ctx, moving ? dt : 0, game.time);

    ctx.save();
    if (game.shake > 0.01) {
      const m = game.shake * 7;
      ctx.translate((this.rng() - 0.5) * m, (this.rng() - 0.5) * m);
    }

    this.drawPowerups(ctx, game);
    this.drawParticles(ctx, game);
    this.drawEnemies(ctx, game);
    if (game.boss) this.drawBoss(ctx, game.boss, game.time);
    this.drawEnemyBullets(ctx, game);
    this.drawBullets(ctx, game);
    if (game.player.alive) this.drawPlayer(ctx, game);
    this.drawFloaters(ctx, game);
    ctx.restore();

    this.drawVignette(ctx);

    if (game.flash > 0.01) {
      ctx.fillStyle = `rgba(255,255,255,${Math.min(0.75, game.flash * 0.6)})`;
      ctx.fillRect(0, 0, FIELD.W, FIELD.H);
    }

    this.drawHud(ctx, game);
  }

  // -------------------------------------------------------------------------

  drawVignette(ctx) {
    if (!this._vignette) {
      const g = ctx.createRadialGradient(
        FIELD.W / 2, FIELD.H / 2, FIELD.H * 0.28,
        FIELD.W / 2, FIELD.H / 2, FIELD.H * 0.72,
      );
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(0,0,0,0.42)');
      this._vignette = g;
    }
    ctx.fillStyle = this._vignette;
    ctx.fillRect(0, 0, FIELD.W, FIELD.H);
  }

  drawSky(ctx, game) {
    const t = game.wave % 8;
    const g = ctx.createLinearGradient(0, 0, 0, FIELD.H);
    const tints = [
      ['#05060f', '#131a3a'], ['#060814', '#1a1640'], ['#040a12', '#10314a'],
      ['#0a0512', '#3a1540'], ['#02060e', '#0d3b3f'], ['#0d0510', '#41183a'],
      ['#050810', '#1d2450'], ['#0a0608', '#432020'],
    ][t];
    g.addColorStop(0, tints[0]);
    g.addColorStop(1, tints[1]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, FIELD.W, FIELD.H);
  }

  drawStars(ctx, dt, time) {
    for (const st of this.stars) {
      const layer = STAR_LAYERS[st.layer];
      st.y += layer.speed * dt;
      if (st.y > FIELD.H) {
        st.y -= FIELD.H;
        st.x = this.rng() * FIELD.W;
      }
      const tw = 0.6 + 0.4 * Math.sin(time * 3 + st.tw);
      ctx.globalAlpha = layer.alpha * tw;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(st.x, st.y, layer.size, layer.size * 2.2);
    }
    ctx.globalAlpha = 1;
  }

  drawClouds(ctx, dt) {
    // Each lobe is a soft radial gradient, filled separately: the overlaps are
    // meant to compound into a denser core, which is what stops a band reading
    // as a flat grey slab.
    for (const c of this.clouds) {
      c.y += c.speed * dt;
      if (c.y - 60 > FIELD.H) {
        c.y = -60;
        c.x = this.rng() * FIELD.W;
      }
      for (const lobe of c.lobes) {
        const lx = c.x + lobe.dx;
        const ly = c.y + lobe.dy;
        const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, lobe.r);
        g.addColorStop(0, `rgba(150,185,255,${c.alpha})`);
        g.addColorStop(0.55, `rgba(150,185,255,${c.alpha * 0.55})`);
        g.addColorStop(1, 'rgba(150,185,255,0)');
        ctx.fillStyle = g;
        ctx.save();
        ctx.translate(lx, ly);
        ctx.scale(1, 0.42);
        ctx.beginPath();
        ctx.arc(0, 0, lobe.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  // -------------------------------------------------------------------------

  drawPlayer(ctx, game) {
    const p = game.player;
    const blink = p.invuln > 0 && Math.floor(p.invuln * 14) % 2 === 0;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.roll * 0.3);
    if (blink) ctx.globalAlpha = 0.35;

    // Engine flame (additive so it reads as light).
    ctx.globalCompositeOperation = 'lighter';
    const flame = 10 + Math.sin(game.time * 40) * 3;
    const fg = ctx.createLinearGradient(0, 10, 0, 10 + flame);
    fg.addColorStop(0, 'rgba(255,220,130,0.95)');
    fg.addColorStop(1, 'rgba(255,90,60,0)');
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.moveTo(-5, 10);
    ctx.lineTo(5, 10);
    ctx.lineTo(0, 10 + flame);
    ctx.closePath();
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    // A dark rim keeps the plane readable against a near-black sky.
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(6,10,22,0.9)';
    ctx.lineWidth = 3;

    // Wings.
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(19, 8);
    ctx.lineTo(7, 10);
    ctx.lineTo(0, 6);
    ctx.lineTo(-7, 10);
    ctx.lineTo(-19, 8);
    ctx.closePath();
    ctx.stroke();
    const wing = ctx.createLinearGradient(-19, 0, 19, 0);
    wing.addColorStop(0, '#b9c9ee');
    wing.addColorStop(0.5, '#eef4ff');
    wing.addColorStop(1, '#b9c9ee');
    ctx.fillStyle = wing;
    ctx.fill();

    // Tailplane.
    ctx.beginPath();
    ctx.moveTo(0, 6);
    ctx.lineTo(9, 14);
    ctx.lineTo(-9, 14);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = '#a8bce2';
    ctx.fill();

    // Fuselage.
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.quadraticCurveTo(5, -6, 5, 12);
    ctx.lineTo(-5, 12);
    ctx.quadraticCurveTo(-5, -6, 0, -18);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = '#f7faff';
    ctx.fill();

    // Nose flash, then the canopy below it — they must not overlap, or the
    // stripe simply paints the canopy out.
    ctx.fillStyle = '#ff6b81';
    ctx.beginPath();
    ctx.moveTo(0, -17);
    ctx.lineTo(2.2, -10);
    ctx.lineTo(-2.2, -10);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(0, -3, 3, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#2fc6f5';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-0.9, -4.5, 1.1, 2, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fill();

    ctx.restore();

    if (p.shield > 0) {
      const pulse = 0.55 + 0.25 * Math.sin(game.time * 8);
      const alpha = p.shield < 2 ? pulse * (0.4 + 0.6 * Math.abs(Math.sin(game.time * 18))) : pulse;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 24, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(111,216,255,${alpha})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = `rgba(111,216,255,${alpha * 0.12})`;
      ctx.fill();
    }
  }

  drawEnemies(ctx, game) {
    for (const e of game.enemies) {
      ctx.save();
      ctx.translate(e.x, e.y);
      ctx.rotate(e.roll || 0);
      // Mix towards white rather than replacing the colour: under sustained
      // fire a hard swap leaves a tanky enemy permanently white.
      const k = Math.min(0.85, e.hitFlash);
      const base = rgbOf(e.color);
      const body = css(whiten(base, k));
      const shade = css(whiten(darken(base, 0.55), k));
      SHAPES[e.kind](ctx, body, shade, e, game.time);
      ctx.restore();
      if (e.maxHp > 2) this.healthPip(ctx, e);
    }
  }

  healthPip(ctx, e) {
    const w = e.radius * 2;
    const frac = Math.max(0, e.hp / e.maxHp);
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(e.x - w / 2, e.y - e.radius - 8, w, 3);
    ctx.fillStyle = frac > 0.5 ? '#8affb0' : frac > 0.25 ? '#ffd166' : '#ff6b81';
    ctx.fillRect(e.x - w / 2, e.y - e.radius - 8, w * frac, 3);
  }

  drawBoss(ctx, b, time) {
    ctx.save();
    ctx.translate(b.x, b.y);
    const k = Math.min(0.5, b.hitFlash * 0.6);
    const body = css(whiten(rgbOf(b.color), k));
    const dark = css(whiten(rgbOf('#6b2438'), k));
    const mid = css(whiten(rgbOf('#8e2f49'), k));

    // Wing.
    poly(ctx, [[0, -16], [64, 4], [62, 14], [44, 26], [0, 16], [-44, 26], [-62, 14], [-64, 4]], dark);

    // Engine pods, glowing at the trailing edge.
    for (const sx of [-1, 1]) {
      poly(ctx, [[sx * 32, 22], [sx * 46, 18], [sx * 44, -14], [sx * 30, -10]], mid);
      engineGlow(ctx, sx * 38, -14, 12, '255,150,90', 0.8);
    }

    // Hull, nose down.
    poly(ctx, [[0, 46], [14, 26], [22, -6], [18, -34], [-18, -34], [-22, -6], [-14, 26]], body);

    // Twin tail fins.
    poly(ctx, [[14, -30], [30, -50], [20, -50], [8, -32]], dark);
    poly(ctx, [[-14, -30], [-30, -50], [-20, -50], [-8, -32]], dark);

    // Panel lines.
    ctx.strokeStyle = 'rgba(0,0,0,0.28)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-12, 20); ctx.lineTo(-14, -28);
    ctx.moveTo(12, 20); ctx.lineTo(14, -28);
    ctx.stroke();

    // Chin guns.
    ctx.fillStyle = dark;
    ctx.fillRect(-13, 24, 5, 16);
    ctx.fillRect(8, 24, 5, 16);

    // The core: the thing that is obviously worth shooting.
    const glow = 0.6 + 0.4 * Math.sin(time * 5);
    engineGlow(ctx, 0, 2, 26, '255,210,110', 0.55 * glow);
    ctx.beginPath();
    ctx.arc(0, 2, 13, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,205,105,${0.55 + glow * 0.45})`;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 2, 6.5, 0, Math.PI * 2);
    ctx.fillStyle = '#fff6d0';
    ctx.fill();
    ctx.restore();
  }

  drawBullets(ctx, game) {
    ctx.globalCompositeOperation = 'lighter';
    for (const b of game.bullets) {
      const g = ctx.createLinearGradient(b.x, b.y - 18, b.x, b.y + 8);
      g.addColorStop(0, 'rgba(110,210,255,0)');
      g.addColorStop(0.5, 'rgba(150,235,255,0.85)');
      g.addColorStop(1, 'rgba(60,150,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(b.x - 2.6, b.y - 18, 5.2, 26);
      ctx.beginPath();
      ctx.arc(b.x, b.y - 3, 4.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(120,225,255,0.55)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(b.x, b.y - 3, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  drawEnemyBullets(ctx, game) {
    for (const b of game.enemyBullets) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r + 2.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = b.color;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(b.x - 1.4, b.y - 1.4, b.r * 0.42, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fill();
    }
  }

  drawPowerups(ctx, game) {
    for (const u of game.powerups) {
      const bob = Math.sin(u.bob) * 3;
      ctx.save();
      ctx.translate(u.x, u.y + bob);
      ctx.rotate(Math.sin(u.bob * 0.5) * 0.18);
      ctx.beginPath();
      ctx.roundRect(-13, -13, 26, 26, 7);
      ctx.fillStyle = 'rgba(8,12,24,0.85)';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = u.color;
      ctx.stroke();
      ctx.fillStyle = u.color;
      ctx.font = 'bold 15px ui-monospace, Menlo, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(POWERUPS[u.kind].label, 0, 1);
      ctx.restore();
    }
  }

  drawParticles(ctx, game) {
    ctx.globalCompositeOperation = 'lighter';
    for (const p of game.particles) {
      const life = (p.die - game.time) / Math.max(0.0001, p.die - p.born);
      const a = Math.max(0, Math.min(1, life));
      ctx.globalAlpha = a;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * (0.4 + a * 0.6), 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  drawFloaters(ctx, game) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const f of game.floaters) {
      const a = Math.max(0, Math.min(1, (f.die - game.time) / 0.6));
      ctx.globalAlpha = a;
      ctx.font = f.big
        ? 'bold 34px ui-monospace, Menlo, monospace'
        : 'bold 14px ui-monospace, Menlo, monospace';
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(0,0,0,0.6)';
      ctx.strokeText(f.text, f.x, f.y);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;
  }

  // -------------------------------------------------------------------------

  drawHud(ctx, game) {
    const p = game.player;
    ctx.save();
    ctx.font = 'bold 15px ui-monospace, Menlo, monospace';
    ctx.textBaseline = 'top';

    ctx.fillStyle = 'rgba(4,8,18,0.55)';
    ctx.fillRect(0, 0, FIELD.W, 34);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(String(game.score).padStart(7, '0'), 10, 10);

    ctx.textAlign = 'center';
    ctx.fillStyle = game.config.boss ? '#ff8ea0' : '#7fd1ff';
    ctx.fillText(game.config.boss ? `BOSS ${game.wave}` : `WAVE ${game.wave}`, FIELD.W / 2, 10);

    // Lives as little planes.
    ctx.textAlign = 'right';
    for (let i = 0; i < p.lives; i++) {
      const x = FIELD.W - 14 - i * 16;
      ctx.beginPath();
      ctx.moveTo(x, 9);
      ctx.lineTo(x + 6, 21);
      ctx.lineTo(x, 18);
      ctx.lineTo(x - 6, 21);
      ctx.closePath();
      ctx.fillStyle = '#ff6b81';
      ctx.fill();
    }

    // Combo meter.
    if (game.streak > 1) {
      const left = Math.max(0, (game.comboExpires - game.time) / COMBO_WINDOW);
      const w = 120;
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.fillRect(10, 38, w, 5);
      ctx.fillStyle = '#ffd166';
      ctx.fillRect(10, 38, w * left, 5);
      ctx.textAlign = 'left';
      ctx.font = 'bold 13px ui-monospace, Menlo, monospace';
      ctx.fillStyle = '#ffd166';
      ctx.fillText(`x${game.comboMultiplier.toFixed(2)}  ${game.streak} CHAIN`, 10, 47);
    }

    // Bombs.
    ctx.textAlign = 'left';
    for (let i = 0; i < p.bombs; i++) {
      ctx.beginPath();
      ctx.arc(16 + i * 15, FIELD.H - 16, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ff8ad4';
      ctx.fill();
    }

    // Weapon / timers.
    ctx.textAlign = 'right';
    ctx.font = 'bold 12px ui-monospace, Menlo, monospace';
    ctx.fillStyle = '#9fb4dd';
    let line = `WPN ${p.weapon}`;
    if (p.rapid > 0) line += `  RAPID ${p.rapid.toFixed(0)}`;
    if (p.shield > 0) line += `  SHLD ${p.shield.toFixed(0)}`;
    ctx.fillText(line, FIELD.W - 10, FIELD.H - 22);

    // Boss health bar.
    if (game.boss && !game.boss.entering) {
      const b = game.boss;
      const w = FIELD.W - 60;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(30, 42, w, 8);
      const frac = Math.max(0, b.hp / b.maxHp);
      const g = ctx.createLinearGradient(30, 0, 30 + w, 0);
      g.addColorStop(0, '#ff6b81');
      g.addColorStop(1, '#ffd166');
      ctx.fillStyle = g;
      ctx.fillRect(30, 42, w * frac, 8);
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 1;
      ctx.strokeRect(30.5, 42.5, w - 1, 7);
    }

    ctx.restore();
  }
}

// ---------------------------------------------------------------------------
// Enemy silhouettes. Every craft is drawn nose-down, because that is the way
// they fly; the tail and engine glow sit at -y so the direction reads at a
// glance even when the sprite is 26 pixels across.

function rgbOf(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const darken = (rgb, f) => rgb.map((v) => Math.round(v * f));
const whiten = (rgb, a) => rgb.map((v) => Math.round(v + (255 - v) * a));
const css = (rgb) => `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;

function poly(ctx, pts, fill) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function engineGlow(ctx, x, y, r, rgb, alpha) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb},${alpha})`);
  g.addColorStop(0.6, `rgba(${rgb},${alpha * 0.3})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

const SHAPES = {
  // Light fighter: swept wing, single engine.
  drone(ctx, body, shade) {
    poly(ctx, [[0, 3], [17, -6], [14, -10], [0, -5], [-14, -10], [-17, -6]], shade);
    poly(ctx, [[0, -7], [9, -13], [-9, -13]], shade);
    poly(ctx, [[0, 14], [4, 2], [3, -12], [-3, -12], [-4, 2]], body);
    ctx.beginPath();
    ctx.ellipse(0, 3, 2.4, 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(20,30,60,0.8)';
    ctx.fill();
    engineGlow(ctx, 0, -12, 4.5, '120,220,255', 0.7);
  },

  // Twin-boom bomber: straight wing, two nacelles, twin tails.
  weaver(ctx, body, shade) {
    poly(ctx, [[0, 4], [18, 0], [18, -6], [0, -7], [-18, -6], [-18, 0]], shade);
    poly(ctx, [[11, -6], [15, -14], [7, -14]], shade);
    poly(ctx, [[-11, -6], [-15, -14], [-7, -14]], shade);
    poly(ctx, [[11, 4], [14, -4], [8, -4]], body);
    poly(ctx, [[-11, 4], [-14, -4], [-8, -4]], body);
    poly(ctx, [[0, 13], [5, 2], [4, -10], [-4, -10], [-5, 2]], body);
    ctx.beginPath();
    ctx.ellipse(0, 2, 2.6, 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(25,15,55,0.85)';
    ctx.fill();
    engineGlow(ctx, 11, -5, 4, '210,150,255', 0.65);
    engineGlow(ctx, -11, -5, 4, '210,150,255', 0.65);
  },

  // Gunship: heavy, broad wing, chin gun.
  gunner(ctx, body, shade) {
    poly(ctx, [[0, 5], [21, -2], [19, -9], [0, -6], [-19, -9], [-21, -2]], shade);
    poly(ctx, [[0, -8], [11, -15], [-11, -15]], shade);
    poly(ctx, [[0, 12], [7, 3], [6, -12], [-6, -12], [-7, 3]], body);
    ctx.fillStyle = 'rgba(60,40,0,0.8)';
    ctx.fillRect(-2.6, 4, 5.2, 13);
    ctx.beginPath();
    ctx.ellipse(0, 0, 3.2, 4.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(50,30,0,0.85)';
    ctx.fill();
    engineGlow(ctx, -7, -13, 4.5, '255,200,110', 0.65);
    engineGlow(ctx, 7, -13, 4.5, '255,200,110', 0.65);
  },

  // Interceptor: long delta, built to dive.
  rusher(ctx, body, shade) {
    poly(ctx, [[0, 2], [15, -12], [10, -14], [0, -6], [-10, -14], [-15, -12]], shade);
    poly(ctx, [[0, 17], [3.5, 0], [3, -13], [-3, -13], [-3.5, 0]], body);
    poly(ctx, [[0, -6], [2.5, -17], [-2.5, -17]], shade);
    ctx.beginPath();
    ctx.ellipse(0, 4, 2, 3.4, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(60,15,10,0.85)';
    ctx.fill();
    engineGlow(ctx, 0, -15, 5, '255,140,90', 0.75);
  },

  // Rotary gun platform: no wings, it hovers.
  turret(ctx, body, shade, e, time) {
    ctx.save();
    ctx.rotate(e.spin || 0);
    ctx.fillStyle = shade;
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.fillRect(-3, -21, 6, 11);
    }
    ctx.restore();
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fillStyle = body;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();
    const pulse = 0.55 + 0.45 * Math.sin(time * 6);
    ctx.beginPath();
    ctx.arc(0, 0, 6.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(10,60,35,${0.5 + pulse * 0.4})`;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(190,255,215,${pulse})`;
    ctx.fill();
  },
};
