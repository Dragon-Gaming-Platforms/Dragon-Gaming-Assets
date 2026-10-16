// DOM overlay: HUD, shop, Fishdex, catch card, help.
// Canvas drawing lives in render.js; this file never touches the canvas.

import { SPECIES, UPGRADES, TIERS, STATS } from './config.js';
import { save, flush, persistent, resetSave } from './storage.js';
import { game, isNight, toast } from './game.js';
import { sfx, setMuted, isMuted, unlock } from './audio.js';

const $ = (id) => document.getElementById(id);

const el = {};
let openId = null;
let hintTimer = 0;
let lastHint = '';
const shown = { coins: -1, caught: -1, night: null, afford: null };

export function initUI({ onStart }) {
  for (const id of [
    'coinVal', 'caughtVal', 'clockVal', 'clockIco', 'hint', 'catchCard',
    'catchKicker', 'catchName', 'catchTier', 'catchFacts', 'shopCoins',
    'upgradeList', 'dexList', 'dexCount', 'dexStats', 'storageWarn',
    'btnShop', 'btnDex', 'btnSound', 'btnHelp', 'btnStart', 'btnReset', 'touchPad',
  ]) el[id] = $(id);

  if (!persistent) el.storageWarn.hidden = false;

  el.btnStart.addEventListener('click', () => {
    unlock();
    close();
    $('mTitle').hidden = true;
    save.seenIntro = true;
    flush();
    el.btnStart.blur();
    onStart();
  });

  el.btnShop.addEventListener('click', () => open('mShop'));
  el.btnDex.addEventListener('click', () => open('mDex'));
  el.btnHelp.addEventListener('click', () => open('mHelp'));
  el.btnSound.addEventListener('click', () => {
    unlock();
    setMuted(!isMuted());
    el.btnSound.textContent = isMuted() ? '🔇' : '🔊';
  });

  el.btnReset.addEventListener('click', () => {
    if (!window.confirm('Erase all coins, upgrades and Fishdex entries?')) return;
    resetSave();
    renderShop();
    renderDex();
    shown.coins = -1;
    shown.caught = -1;
    close();
    toast('Progress erased', 'bad');
  });

  for (const b of document.querySelectorAll('[data-close]')) {
    b.addEventListener('click', () => close());
  }

  // Click the backdrop (but not the sheet) to dismiss.
  for (const m of document.querySelectorAll('.modal')) {
    m.addEventListener('pointerdown', (e) => {
      if (e.target === m && m.id !== 'mTitle') close();
    });
  }

  renderShop();
  renderDex();
}

/* ------------------------------------------------------------------ modals */

export function open(id) {
  if (openId) $(openId).hidden = true;
  openId = id;
  $(id).hidden = false;
  if (id === 'mShop') renderShop();
  if (id === 'mDex') renderDex();
}

export function close() {
  if (!openId) return;
  $(openId).hidden = true;
  openId = null;
  // Focus must not stay on a control inside the closed sheet, or the next
  // Space press activates it again instead of casting.
  document.activeElement?.blur?.();
}

export function modalOpen() {
  return openId !== null || !$('mTitle').hidden;
}

export function toggleHelp() {
  openId === 'mHelp' ? close() : open('mHelp');
}

/* --------------------------------------------------------------------- HUD */

export function syncHUD(dt) {
  if (save.coins !== shown.coins) {
    shown.coins = save.coins;
    el.coinVal.textContent = save.coins.toLocaleString();
    el.shopCoins.textContent = save.coins.toLocaleString();
    if (openId === 'mShop') renderShop();
  }
  if (save.totalCaught !== shown.caught) {
    shown.caught = save.totalCaught;
    el.caughtVal.textContent = save.totalCaught.toLocaleString();
  }
  const night = isNight();
  if (night !== shown.night) {
    shown.night = night;
    el.clockIco.textContent = night ? '🌙' : '☀️';
    el.clockVal.textContent = night ? 'Night' : 'Day';
  }
  const afford = UPGRADES.some((u) => {
    const lv = save.upgrades[u.id];
    return lv < 4 && save.coins >= u.price[lv + 1];
  });
  if (afford !== shown.afford) {
    shown.afford = afford;
    el.btnShop.classList.toggle('nudge', afford);
  }

  // Hints fade themselves out so they never sit on screen forever.
  if (game.hint !== lastHint) {
    lastHint = game.hint;
    if (game.hint) {
      el.hint.textContent = game.hint;
      el.hint.classList.add('show');
      hintTimer = 3.4;
    } else {
      el.hint.classList.remove('show');
    }
  } else if (hintTimer > 0) {
    hintTimer -= dt;
    if (hintTimer <= 0) el.hint.classList.remove('show');
  }
}

/* -------------------------------------------------------------- catch card */

export function showResult(r) {
  const card = el.catchCard;
  if (r.kind === 'caught') {
    const tier = TIERS[r.sp.tier];
    el.catchKicker.textContent = r.sp.tier === 'junk' ? 'Fished out' : 'Landed!';
    el.catchName.textContent = r.sp.name;
    el.catchTier.textContent = tier.label;
    el.catchTier.style.color = tier.color;
    el.catchTier.hidden = false;
    const badges = [];
    if (r.isNew) badges.push('NEW SPECIES');
    if (r.isRecord && !r.isNew) badges.push('PERSONAL BEST');
    el.catchFacts.innerHTML = `
      ${badges.length ? `<div class="card-badges" style="grid-column:1/-1">${badges.map((b) => `<span class="badge">${b}</span>`).join('')}</div>` : ''}
      <div><dt>Length</dt><dd>${r.len} cm</dd></div>
      <div><dt>Sold for</dt><dd>🪙 ${r.value}</dd></div>
      <div><dt>Depth</dt><dd>${r.depth} m</dd></div>
      <div><dt>Caught</dt><dd>${save.dex[r.sp.id].count}</dd></div>`;
  } else {
    el.catchKicker.textContent = 'Got away';
    el.catchName.textContent = r.why === 'snap' ? 'The line snapped!' : 'It slipped the hook';
    el.catchTier.hidden = true;
    el.catchFacts.innerHTML = r.sp
      ? `<div style="grid-column:1/-1"><dt>That was a</dt><dd style="color:${TIERS[r.sp.tier].color}">${r.sp.name}</dd></div>`
      : '';
  }
  card.hidden = false;
}

export function hideResult() {
  el.catchCard.hidden = true;
}

/* -------------------------------------------------------------------- shop */

function buy(u) {
  const lv = save.upgrades[u.id];
  if (lv >= 4) return;
  const price = u.price[lv + 1];
  if (save.coins < price) { sfx.deny(); return; }
  save.coins -= price;
  save.upgrades[u.id] = lv + 1;
  flush();
  sfx.buy();
  shown.coins = -1;
  renderShop();
  toast(`${u.levels[lv + 1]} equipped`, 'good');
}

function renderShop() {
  if (!el.upgradeList) return;
  el.upgradeList.replaceChildren();
  el.shopCoins.textContent = save.coins.toLocaleString();

  for (const u of UPGRADES) {
    const lv = save.upgrades[u.id];
    const maxed = lv >= 4;
    const price = maxed ? 0 : u.price[lv + 1];

    const row = document.createElement('div');
    row.className = 'upg';
    row.innerHTML = `
      <div class="upg-ico">${u.icon}</div>
      <div class="upg-body">
        <div class="upg-name"><span>${u.name}</span><span class="upg-lv">${u.levels[lv]}</span></div>
        <p class="upg-blurb">${u.blurb}</p>
        <div class="pips">
          ${[0, 1, 2, 3, 4].map((i) => `<span class="pip${i <= lv ? ' on' : ''}"></span>`).join('')}
          <span class="pip-eff">${u.effect(lv)}</span>
        </div>
      </div>`;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'buy' + (maxed ? ' maxed' : '');
    btn.textContent = maxed ? 'MAX' : `🪙 ${price.toLocaleString()}`;
    btn.disabled = maxed || save.coins < price;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();   // the sheet must not see this as a backdrop click
      buy(u);
    });
    row.append(btn);
    el.upgradeList.append(row);
  }
}

/* ----------------------------------------------------------------- fishdex */

function renderDex() {
  if (!el.dexList) return;
  el.dexList.replaceChildren();
  let found = 0;

  for (const sp of SPECIES) {
    const rec = save.dex[sp.id];
    const cell = document.createElement('div');
    const tier = TIERS[sp.tier];
    cell.className = 'dex-cell' + (rec ? '' : ' unknown');
    cell.style.setProperty('--tier', tier.color);
    const band = `${Math.round(sp.band[0])}–${Math.round(sp.band[1])} m`;
    if (rec) {
      found++;
      cell.innerHTML = `
        <div class="dex-name" style="color:${tier.color}">${sp.name}</div>
        <div class="dex-meta">
          <b>${rec.count}</b> caught · best <b>${rec.bestLen} cm</b><br>
          ${band}${sp.night ? ' · <span class="dex-night">night</span>' : ''}
        </div>`;
    } else {
      cell.innerHTML = `
        <div class="dex-name">? ? ?</div>
        <div class="dex-meta">${tier.label}<br>${band}${sp.night ? ' · <span class="dex-night">night</span>' : ''}</div>`;
    }
    el.dexList.append(cell);
  }

  el.dexCount.textContent = `${found} / ${SPECIES.length}`;
  const best = Object.entries(save.dex).reduce(
    (acc, [id, r]) => (r.bestValue > acc.v ? { v: r.bestValue, id } : acc),
    { v: 0, id: null },
  );
  const bestName = best.id ? SPECIES.find((s) => s.id === best.id).name : '—';
  el.dexStats.innerHTML = `
    <span>Caught <b>${save.totalCaught}</b></span>
    <span>Escaped <b>${save.escapes}</b></span>
    <span>Earned <b>🪙 ${save.totalEarned.toLocaleString()}</b></span>
    <span>Best sale <b>${bestName}</b>${best.v ? ` (🪙 ${best.v})` : ''}</span>
    <span>Reach <b>${STATS.maxDepth[save.upgrades.line]} m</b></span>`;
}

export { renderShop, renderDex };
