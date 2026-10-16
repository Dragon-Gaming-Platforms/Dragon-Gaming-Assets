// The 2D overlay canvas that sits on top of the WebGL scene: depth ruler, cast
// meter, strike marker, the reeling panel and toasts. Everything here is
// screen-space; world positions arrive already projected.

import { REEL, TIERS, CAST } from './config.js';
import { game } from './game.js';

export const HUD = { w: 960, h: 600 };

const proj = new Float32Array(3);

export function drawHud(ctx, scene) {
  ctx.clearRect(0, 0, HUD.w, HUD.h);
  if (game.phase === 'title') return;

  if (game.submerged && game.phase !== 'result') drawDepthRuler(ctx);
  if (game.phase === 'aiming') drawPowerMeter(ctx);
  if (game.phase === 'bite') drawBiteMarker(ctx, scene);
  if (game.phase === 'reeling') drawReelPanel(ctx);
  drawToasts(ctx);
  if (game.flashUntil > game.t) {
    ctx.fillStyle = `rgba(255,255,255,${Math.min(0.85, (game.flashUntil - game.t) * 1.6)})`;
    ctx.fillRect(0, 0, HUD.w, HUD.h);
  }
}

/* -------------------------------------------------------------- depth ruler */

function drawDepthRuler(ctx) {
  const x = 34, top = 96, bot = HUD.h - 92;
  const span = Math.max(12, game.seabed);
  const yFor = (d) => top + (d / span) * (bot - top);

  ctx.save();
  ctx.fillStyle = 'rgba(6,14,26,0.42)';
  roundRect(ctx, x - 13, top - 10, 26, bot - top + 20, 13);
  ctx.fill();

  ctx.font = '600 10px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.textAlign = 'center';
  const step = span > 60 ? 20 : span > 30 ? 10 : 5;
  for (let d = 0; d <= span; d += step) {
    const y = yFor(d);
    ctx.fillStyle = 'rgba(200,224,255,0.75)';
    ctx.fillRect(x - 8, y, 16, 1.3);
    if (d > 0) {
      ctx.fillStyle = 'rgba(190,216,246,0.55)';
      ctx.fillText(String(d), x, y - 4);
    }
  }

  // How far this line can reach, and where the hook actually is.
  const limit = yFor(Math.min(span, game.maxDepth));
  ctx.fillStyle = 'rgba(255,120,110,0.9)';
  ctx.fillRect(x - 13, limit - 1, 26, 2);

  const hy = yFor(Math.min(span, Math.max(0, game.depth)));
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.moveTo(x + 15, hy);
  ctx.lineTo(x + 24, hy - 5.5);
  ctx.lineTo(x + 24, hy + 5.5);
  ctx.closePath();
  ctx.fill();
  ctx.textAlign = 'left';
  ctx.font = '700 12px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillText(`${game.depth.toFixed(1)} m`, x + 28, hy + 4);

  ctx.textAlign = 'center';
  ctx.font = '600 9px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(150,178,210,0.6)';
  ctx.fillText('BED', x, bot + 14);
  ctx.restore();
}

/* --------------------------------------------------------------- cast meter */

function drawPowerMeter(ctx) {
  const w = 250, h = 17, x = HUD.w / 2 - w / 2, y = HUD.h - 76;
  ctx.save();
  ctx.fillStyle = 'rgba(6,14,26,0.6)';
  roundRect(ctx, x - 5, y - 5, w + 10, h + 10, 12);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  roundRect(ctx, x, y, w, h, 8);
  ctx.fill();
  const g = ctx.createLinearGradient(x, 0, x + w, 0);
  g.addColorStop(0, '#5ad1a0');
  g.addColorStop(0.55, '#ffd166');
  g.addColorStop(1, '#ff6b5e');
  ctx.fillStyle = g;
  roundRect(ctx, x, y, Math.max(3, w * game.power), h, 8);
  ctx.fill();

  ctx.fillStyle = 'rgba(226,240,255,0.9)';
  ctx.font = '700 11px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CAST POWER', HUD.w / 2, y - 11);
  ctx.font = '600 10px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(190,216,246,0.65)';
  const reach = Math.round(CAST.minRange + (CAST.maxRange - CAST.minRange) * game.power);
  const bed = Math.round(CAST.minSeabed + (CAST.maxSeabed - CAST.minSeabed) * Math.pow(game.power, 1.15));
  ctx.fillText(`${reach} m out  ·  ${bed} m deep`, HUD.w / 2, y + h + 15);
  ctx.restore();
}

/* -------------------------------------------------------------- bite marker */

function drawBiteMarker(ctx, scene) {
  scene.project(proj, game.hook);
  if (proj[2] < -0.5) return;
  const x = proj[0] * HUD.w;
  const y = proj[1] * HUD.h - 52;
  const k = 1 + Math.sin(game.t * 22) * 0.12;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  ctx.fillStyle = '#ffdd57';
  roundRect(ctx, -17, -25, 34, 29, 9);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-8, 2); ctx.lineTo(0, 17); ctx.lineTo(7, 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#20160a';
  ctx.font = '900 23px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('!', 0, -2);
  ctx.restore();

  const p = Math.max(0, game.biteTimer / CAST.biteWindow);
  ctx.fillStyle = 'rgba(8,16,28,0.55)';
  roundRect(ctx, x - 32, y + 26, 64, 6, 3);
  ctx.fill();
  ctx.fillStyle = p > 0.4 ? '#5ad1a0' : '#ff6b5e';
  roundRect(ctx, x - 32, y + 26, 64 * p, 6, 3);
  ctx.fill();
}

/* --------------------------------------------------------------- reel panel */

// A small flat glyph of whatever is on the line. The 3D mesh is busy at this
// size, and the panel needs a shape that reads at 40 pixels.
function fishGlyph(ctx, sp, size) {
  const [top, belly] = sp.skin;
  const s = size / 60;
  ctx.save();
  ctx.scale(s, s);
  ctx.fillStyle = top;
  switch (sp.shape) {
    case 'squid':
      ctx.beginPath();
      ctx.moveTo(-30, 0); ctx.quadraticCurveTo(-6, -16, 14, -8);
      ctx.quadraticCurveTo(26, 0, 14, 8); ctx.quadraticCurveTo(-6, 16, -30, 0);
      ctx.fill();
      ctx.strokeStyle = belly; ctx.lineWidth = 3;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath(); ctx.moveTo(16, i * 3);
        ctx.quadraticCurveTo(30, i * 6, 42, i * 4); ctx.stroke();
      }
      break;
    case 'jelly':
      ctx.beginPath(); ctx.ellipse(0, -4, 20, 16, 0, Math.PI, 0); ctx.fill();
      ctx.strokeStyle = belly; ctx.lineWidth = 2.5;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath(); ctx.moveTo(i * 7, -4);
        ctx.quadraticCurveTo(i * 9, 12, i * 6, 26); ctx.stroke();
      }
      break;
    case 'manta':
      ctx.beginPath();
      ctx.moveTo(22, 0); ctx.quadraticCurveTo(4, -26, -30, -10);
      ctx.quadraticCurveTo(-12, 0, -30, 10); ctx.quadraticCurveTo(4, 26, 22, 0);
      ctx.fill();
      break;
    case 'puffer':
      ctx.beginPath(); ctx.arc(0, 0, 20, 0, 6.283); ctx.fill();
      ctx.strokeStyle = belly; ctx.lineWidth = 2.4;
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * 6.283;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 19, Math.sin(a) * 19);
        ctx.lineTo(Math.cos(a) * 27, Math.sin(a) * 27);
        ctx.stroke();
      }
      break;
    case 'chest':
      ctx.fillRect(-22, -4, 44, 22);
      ctx.beginPath(); ctx.ellipse(0, -4, 22, 14, 0, Math.PI, 0); ctx.fill();
      ctx.fillStyle = belly; ctx.fillRect(-22, -7, 44, 5);
      break;
    case 'boot':
      ctx.beginPath();
      ctx.moveTo(-12, -22); ctx.lineTo(6, -22); ctx.lineTo(8, 8);
      ctx.lineTo(24, 10); ctx.lineTo(26, 22); ctx.lineTo(-14, 22);
      ctx.closePath(); ctx.fill();
      break;
    case 'can':
      ctx.fillRect(-11, -17, 22, 34);
      ctx.fillStyle = belly;
      ctx.beginPath(); ctx.ellipse(0, -17, 11, 4, 0, 0, 6.283); ctx.fill();
      break;
    case 'kelp':
      ctx.strokeStyle = top; ctx.lineWidth = 5;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath(); ctx.moveTo(i * 7, 24);
        ctx.quadraticCurveTo(i * 15, 0, i * 8, -26); ctx.stroke();
      }
      break;
    default: {
      ctx.beginPath();
      ctx.moveTo(30, 0); ctx.quadraticCurveTo(10, -17, -12, -9);
      ctx.quadraticCurveTo(-24, 0, -12, 9); ctx.quadraticCurveTo(10, 17, 30, 0);
      ctx.fill();
      ctx.fillStyle = belly;
      ctx.beginPath();
      ctx.moveTo(26, 2); ctx.quadraticCurveTo(8, 13, -10, 8);
      ctx.quadraticCurveTo(4, 6, 26, 2); ctx.fill();
      ctx.fillStyle = top;
      ctx.beginPath();
      ctx.moveTo(-14, 0); ctx.lineTo(-32, -13); ctx.lineTo(-32, 13);
      ctx.closePath(); ctx.fill();
      if (sp.shape === 'bill') {
        ctx.beginPath();
        ctx.moveTo(28, -1); ctx.lineTo(54, -3); ctx.lineTo(28, 3);
        ctx.closePath(); ctx.fill();
      }
      ctx.fillStyle = '#fdfdff';
      ctx.beginPath(); ctx.arc(17, -4, 3.4, 0, 6.283); ctx.fill();
      ctx.fillStyle = '#10131a';
      ctx.beginPath(); ctx.arc(18, -4, 1.9, 0, 6.283); ctx.fill();
    }
  }
  ctx.restore();
}

function drawReelPanel(ctx) {
  const r = game.reel;
  const f = game.target;
  if (!r || !f) return;
  const x = HUD.w - 116, y = (HUD.h - REEL.trackH) / 2;

  ctx.save();
  ctx.fillStyle = 'rgba(6,14,26,0.72)';
  roundRect(ctx, x - 18, y - 46, 108, REEL.trackH + 92, 16);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  roundRect(ctx, x, y, 46, REEL.trackH, 23);
  ctx.fill();

  const on = r.onTarget;
  ctx.fillStyle = on ? 'rgba(90,209,160,0.5)' : 'rgba(120,170,220,0.26)';
  roundRect(ctx, x + 3, y + r.barY, 40, r.barH, 20);
  ctx.fill();
  ctx.strokeStyle = on ? '#7cf0be' : 'rgba(160,200,240,0.55)';
  ctx.lineWidth = 2;
  roundRect(ctx, x + 3, y + r.barY, 40, r.barH, 20);
  ctx.stroke();

  ctx.save();
  ctx.translate(x + 23, y + r.fishY);
  ctx.scale(-1, 1);
  fishGlyph(ctx, f.sp, 52);
  ctx.restore();

  const px = x + 58, pw = 12;
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  roundRect(ctx, px, y, pw, REEL.trackH, 6);
  ctx.fill();
  const ph = REEL.trackH * r.progress;
  const g = ctx.createLinearGradient(0, y + REEL.trackH, 0, y);
  g.addColorStop(0, '#ff6b5e');
  g.addColorStop(0.5, '#ffd166');
  g.addColorStop(1, '#5ad1a0');
  ctx.fillStyle = g;
  roundRect(ctx, px, y + REEL.trackH - ph, pw, ph, 6);
  ctx.fill();

  if (r.emptyFor > 0.05) {
    const a = 0.25 + 0.5 * Math.abs(Math.sin(game.t * 14));
    ctx.strokeStyle = `rgba(255,90,80,${a})`;
    ctx.lineWidth = 3;
    roundRect(ctx, x - 4, y - 4, 54, REEL.trackH + 8, 27);
    ctx.stroke();
  }

  const cx = x + 36;
  ctx.fillStyle = 'rgba(226,240,255,0.92)';
  ctx.font = '700 11px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(f.sp.name.toUpperCase(), cx, y - 26);
  ctx.fillStyle = TIERS[f.sp.tier].color;
  ctx.font = '700 10px system-ui, sans-serif';
  ctx.fillText(`${f.len} cm`, cx, y - 12);
  ctx.fillStyle = 'rgba(200,220,244,0.7)';
  ctx.font = '600 10px system-ui, sans-serif';
  ctx.fillText(`${Math.round(r.progress * 100)}%`, cx, y + REEL.trackH + 20);
  ctx.restore();
}

/* ------------------------------------------------------------------- toasts */

function drawToasts(ctx) {
  if (!game.toasts.length) return;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '700 15px system-ui, sans-serif';
  game.toasts.forEach((t, i) => {
    const age = game.t - t.born;
    const a = Math.min(1, age * 4) * Math.min(1, (t.die - game.t) * 2.2);
    ctx.globalAlpha = Math.max(0, a);
    ctx.fillStyle = t.kind === 'bad' ? '#ff8f86' : t.kind === 'good' ? '#7cf0be' : '#dbe8f8';
    ctx.fillText(t.text, HUD.w / 2, 132 + i * 24 - age * 10);
  });
  ctx.restore();
}

export function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
