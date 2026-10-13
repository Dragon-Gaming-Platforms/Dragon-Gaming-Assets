(() => {
  'use strict';

  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const dropsEl = document.getElementById('drops');
  const bestEl = document.getElementById('best');
  const messageEl = document.getElementById('message');

  const W = canvas.width, H = canvas.height;
  const BEST_KEY = 'plinko-best';
  const ROWS = 9, PR = 6, CHIP_R = 9;
  const PEG_GAP = W / (ROWS + 1);
  const SLOT_H = 60;

  const pegs = [];
  for (let r = 1; r <= ROWS; r++) {
    const count = r + 1;
    const span = (count - 1) * PEG_GAP;
    const x0 = (W - span) / 2;
    for (let i = 0; i < count; i++) pegs.push({ x: x0 + i * PEG_GAP, y: 60 + r * 42 });
  }

  let chips, score, drops, slots;

  function init() {
    chips = [];
    score = 0; drops = 0;
    slots = Array.from({ length: ROWS + 1 }, (_, i) => {
      const d = Math.abs(i - ROWS / 2);
      return d === 0 ? 100 : d === 1 ? 40 : d === 2 ? 15 : d === 3 ? 5 : 2;
    });
    scoreEl.textContent = '0';
    dropsEl.textContent = '0';
    bestEl.textContent = String(localStorage.getItem(BEST_KEY) || 0);
    messageEl.textContent = 'Click anywhere to drop a chip.';
  }

  function dropChip(x) {
    chips.push({ x: Math.max(CHIP_R, Math.min(W - CHIP_R, x)), y: 20, vx: (Math.random() - 0.5) * 0.6, vy: 0 });
    drops++;
    dropsEl.textContent = String(drops);
  }

  function update() {
    const g = 0.18;
    for (let i = chips.length - 1; i >= 0; i--) {
      const c = chips[i];
      c.vy += g; c.x += c.vx; c.y += c.vy;
      for (const p of pegs) {
        const dx = c.x - p.x, dy = c.y - p.y;
        const d = Math.hypot(dx, dy);
        if (d < PR + CHIP_R) {
          const nx = dx / (d || 1), ny = dy / (d || 1);
          c.x = p.x + nx * (PR + CHIP_R);
          c.y = p.y + ny * (PR + CHIP_R);
          const dot = c.vx * nx + c.vy * ny;
          c.vx = (c.vx - 2 * dot * nx) * 0.7 + (Math.random() - 0.5) * 0.8;
          c.vy = Math.abs(c.vy) * 0.35;
        }
      }
      if (c.x < CHIP_R) { c.x = CHIP_R; c.vx = Math.abs(c.vx) * 0.6; }
      if (c.x > W - CHIP_R) { c.x = W - CHIP_R; c.vx = -Math.abs(c.vx) * 0.6; }
      if (c.y > H - SLOT_H) {
        const slot = Math.max(0, Math.min(slots.length - 1, Math.floor(c.x / (W / slots.length))));
        score += slots[slot];
        scoreEl.textContent = String(score);
        chips.splice(i, 1);
      }
    }
    if (chips.length === 0 && drops > 0) {
      if (score > Number(localStorage.getItem(BEST_KEY) || 0)) {
        localStorage.setItem(BEST_KEY, String(score)); bestEl.textContent = String(score);
      }
    }
  }

  function draw() {
    const grd = ctx.createLinearGradient(0, 0, 0, H);
    grd.addColorStop(0, '#141a3a'); grd.addColorStop(1, '#0a0c1d');
    ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);
    pegs.forEach(p => {
      ctx.save();
      ctx.shadowBlur = 8; ctx.shadowColor = '#4cc9f0';
      ctx.fillStyle = '#9fd6ff';
      ctx.beginPath(); ctx.arc(p.x, p.y, PR, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });
    const sw = W / slots.length;
    slots.forEach((s, i) => {
      const x = i * sw;
      ctx.fillStyle = i % 2 ? 'rgba(128,237,153,0.12)' : 'rgba(76,201,240,0.12)';
      ctx.fillRect(x, H - SLOT_H, sw - 1, SLOT_H);
      ctx.fillStyle = '#eef1ff';
      ctx.font = '700 18px system-ui'; ctx.textAlign = 'center';
      ctx.fillText('+' + s, x + sw / 2, H - SLOT_H / 2 + 6);
    });
    chips.forEach(c => {
      ctx.save();
      ctx.shadowBlur = 12; ctx.shadowColor = '#ffd166';
      ctx.fillStyle = '#ffd166';
      ctx.beginPath(); ctx.arc(c.x, c.y, CHIP_R, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    dropChip((e.clientX - rect.left) * (W / rect.width));
  });

  init();
  requestAnimationFrame(loop);
})();
