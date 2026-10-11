/**
 * Everything that touches the page: rendering the board, the input handling,
 * the clock and the persistence. The rules live in engine.js.
 */

import { Board, randomSeed } from './engine.js';
import { LAYOUTS, getLayout } from './layouts.js';
import { faceSvg, FACES } from './tiles.js';
import * as store from './storage.js';
import { sfx, setEnabled as setSoundEnabled, unlock as unlockAudio } from './audio.js';

/* Base geometry. Everything is laid out at this size and then scaled to fit. */
const TW = 52;
const TH = 70;
const DX = 8; // how far each layer shifts right
const DY = 10; // ...and up

const el = (id) => document.getElementById(id);

const dom = {
  board: el('board'),
  inner: el('board-inner'),
  note: el('board-hint'),
  live: el('live'),
  layoutSelect: el('layout-select'),
  tiles: el('stat-tiles'),
  pairs: el('stat-pairs'),
  moves: el('stat-moves'),
  time: el('stat-time'),
  score: el('stat-score'),
  best: el('stat-best'),
  seed: el('stat-seed'),
  dlgEnd: el('dlg-end'),
  endTitle: el('end-title'),
  endBody: el('end-body'),
  endStats: el('end-stats'),
  endActions: el('end-actions'),
  dlgHelp: el('dlg-help'),
  gallery: el('tile-gallery'),
};

const state = {
  board: null,
  layoutId: store.load('layout', 'turtle'),
  nodes: [],
  selected: null,
  moves: 0,
  score: 0,
  hints: 0,
  shuffles: 0,
  startedAt: null,
  elapsed: 0,
  ticker: null,
  lastMatchAt: 0,
  focusId: 0,
  ended: false,
};

/* ================================================================= rendering */

function tileGeometry(slots) {
  const zMax = Math.max(...slots.map((s) => s.z));
  const minX = Math.min(...slots.map((s) => s.x));
  const minY = Math.min(...slots.map((s) => s.y));
  const maxX = Math.max(...slots.map((s) => s.x));
  const maxY = Math.max(...slots.map((s) => s.y));
  return {
    zMax,
    minX,
    minY,
    width: (maxX - minX + 1) * TW + zMax * DX,
    height: (maxY - minY + 1) * TH + zMax * DY,
  };
}

function placeTile(node, tile, g) {
  const left = (tile.x - g.minX) * TW + tile.z * DX;
  const top = (tile.y - g.minY) * TH + (g.zMax - tile.z) * DY;
  node.style.left = `${left}px`;
  node.style.top = `${top}px`;
  node.style.zIndex = String(
    Math.round((tile.z + 1) * 100000 + (tile.y + 4) * 200 + (tile.x + 4) * 4),
  );
  node.dataset.cx = String(left + TW / 2);
  node.dataset.cy = String(top + TH / 2);
}

function renderBoard() {
  const board = state.board;
  const g = tileGeometry(board.layout.slots);
  state.geometry = g;

  dom.inner.textContent = '';
  dom.inner.style.width = `${g.width}px`;
  dom.inner.style.height = `${g.height}px`;

  const frag = document.createDocumentFragment();
  state.nodes = board.tiles.map((tile) => {
    const node = document.createElement('button');
    node.type = 'button';
    node.className = 'tile';
    node.dataset.id = String(tile.id);
    node.tabIndex = -1;
    node.innerHTML = `<span class="tile__side"></span><span class="tile__face">${faceSvg(tile.face)}</span>`;
    placeTile(node, tile, g);
    frag.appendChild(node);
    return node;
  });
  dom.inner.appendChild(frag);
  dom.board.classList.add('dim-blocked');
  fitBoard();
}

/** Repaint the face of one tile — only needed after a shuffle. */
function repaintFace(id) {
  const tile = state.board.tiles[id];
  state.nodes[id].querySelector('.tile__face').innerHTML = faceSvg(tile.face);
}

function fitBoard() {
  const g = state.geometry;
  if (!g) return;
  const rect = dom.board.getBoundingClientRect();
  const padding = 24;
  const availW = Math.max(120, rect.width - padding);
  const availH = Math.max(120, rect.height - padding);
  const scale = Math.min(availW / g.width, availH / g.height, 1.5);
  dom.inner.style.transform = `translate(-50%, -50%) scale(${scale.toFixed(4)})`;
}

/* ============================================================ board updates */

function refreshTiles() {
  const board = state.board;
  for (let i = 0; i < state.nodes.length; i++) {
    const node = state.nodes[i];
    const present = board.present[i] === 1;
    node.classList.toggle('gone', !present);
    if (!present) {
      node.tabIndex = -1;
      node.setAttribute('aria-hidden', 'true');
      continue;
    }
    node.removeAttribute('aria-hidden');
    const free = board.isFree(i);
    node.classList.toggle('free', free);
    node.classList.toggle('blocked', !free);
    node.setAttribute('aria-label', `${board.tiles[i].label} — ${free ? 'free' : 'blocked'}`);
    node.tabIndex = i === state.focusId ? 0 : -1;
  }
  if (state.board.present[state.focusId] !== 1) moveFocusToSomething();
}

function moveFocusToSomething() {
  const free = state.board.freeIds();
  const next = free[0] ?? state.board.tiles.findIndex((_, i) => state.board.present[i] === 1);
  if (next >= 0 && next !== undefined) {
    state.focusId = next;
    state.nodes[next].tabIndex = 0;
  }
}

function refreshStats() {
  const board = state.board;
  dom.tiles.textContent = String(board.remaining);
  dom.pairs.textContent = String(board.availablePairCount());
  dom.moves.textContent = String(state.moves);
  dom.score.textContent = String(state.score);
  const best = store.bestFor(state.layoutId);
  dom.best.textContent = best ? formatTime(best.seconds) : '—';
  dom.seed.textContent = board.seed;
}

function formatTime(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

/* ===================================================================== clock */

function startClock() {
  if (state.ticker || state.ended) return;
  state.startedAt = Date.now() - state.elapsed * 1000;
  state.ticker = setInterval(() => {
    state.elapsed = (Date.now() - state.startedAt) / 1000;
    dom.time.textContent = formatTime(state.elapsed);
  }, 500);
}

function stopClock() {
  if (state.ticker) {
    clearInterval(state.ticker);
    state.ticker = null;
    state.elapsed = (Date.now() - state.startedAt) / 1000;
  }
}

/* ===================================================================== notes */

let noteTimer = null;
function note(text, ms = 2600) {
  dom.note.textContent = text;
  dom.note.classList.add('show');
  clearTimeout(noteTimer);
  noteTimer = setTimeout(() => dom.note.classList.remove('show'), ms);
}

function announce(text) {
  dom.live.textContent = text;
}

/* ====================================================================== play */

function select(id) {
  clearSelection();
  state.selected = id;
  state.nodes[id].classList.add('selected');
}

function clearSelection() {
  if (state.selected !== null) state.nodes[state.selected].classList.remove('selected');
  state.selected = null;
}

function reject(id, message) {
  const node = state.nodes[id];
  node.classList.remove('nope');
  // Restart the animation rather than letting a repeat click do nothing.
  void node.offsetWidth;
  node.classList.add('nope');
  setTimeout(() => node.classList.remove('nope'), 340);
  sfx.reject();
  if (message) note(message);
}

function onTileActivate(id) {
  if (state.ended) return;
  unlockAudio();

  if (state.selected === id) {
    clearSelection();
    sfx.select();
    return;
  }

  const board = state.board;
  if (!board.isFree(id)) {
    reject(id, 'That tile is covered or hemmed in on both sides.');
    return;
  }

  if (state.selected !== null && board.matches(state.selected, id)) {
    takePair(state.selected, id);
    return;
  }

  if (state.selected !== null && !board.matches(state.selected, id)) {
    // Not a pair: treat it as picking the new tile up, which is what players expect.
    select(id);
    sfx.select();
    return;
  }

  select(id);
  sfx.select();
}

function takePair(a, b) {
  const board = state.board;
  const label = board.tiles[a].label;
  if (!board.remove(a, b)) {
    reject(b, 'Those two cannot go yet.');
    return;
  }
  clearSelection();
  startClock();

  state.moves += 1;
  const now = Date.now();
  const gap = state.lastMatchAt ? (now - state.lastMatchAt) / 1000 : 99;
  const bonus = Math.max(0, Math.round(60 - gap * 10));
  state.score += 100 + bonus;
  state.lastMatchAt = now;

  state.nodes[a].classList.add('matched');
  state.nodes[b].classList.add('matched');
  sfx.match();

  refreshTiles();
  refreshStats();
  announce(`${label} pair taken. ${board.remaining} tiles left.`);
  checkEnd();
}

function checkEnd() {
  const board = state.board;
  if (board.won) {
    stopClock();
    state.ended = true;
    sfx.win();
    const seconds = Math.round(state.elapsed);
    // Worth about a fifth of a clean game under fifteen minutes, nothing after.
    const timeBonus = Math.max(0, Math.round((900 - seconds) * 3));
    state.score += timeBonus;
    const isBest = store.recordWin(state.layoutId, seconds, state.moves);
    store.bumpStat('wins');
    refreshStats();
    showEnd({
      title: 'Board cleared',
      body: isBest
        ? 'A new best time on this board.'
        : 'All 144 tiles gone. Nicely ordered.',
      stats: [
        ['Time', formatTime(seconds)],
        ['Moves', String(state.moves)],
        ['Score', String(state.score)],
        ['Time bonus', `+${timeBonus}`],
      ],
      actions: [
        ['again', 'New deal', true],
        ['same', 'Replay this deal', false],
      ],
    });
    return;
  }

  if (board.availableMoves().length === 0) {
    stopClock();
    sfx.stuck();
    store.bumpStat('stuck');
    const canShuffle = board.canReshuffle();
    const canUndo = board.history.length > 0;
    showEnd({
      title: 'No moves left',
      body: canShuffle
        ? 'Every remaining tile is either covered or has nothing to pair with. ' +
          'Shuffling redeals what is left into an arrangement that can still be finished.'
        : 'Every remaining tile is either covered or has nothing to pair with, and with ' +
          'this few left there is no arrangement to shuffle into. Stepping back a move is ' +
          'the only way on from here.',
      stats: [
        ['Tiles left', String(board.remaining)],
        ['Moves', String(state.moves)],
        ['Time', formatTime(state.elapsed)],
      ],
      actions: [
        ...(canShuffle ? [['shuffle', 'Shuffle and carry on', true]] : []),
        ...(canUndo ? [['undo', 'Undo last move', !canShuffle]] : []),
        ['again', 'New deal', false],
        ['close', 'Keep looking', false],
      ],
    });
  }
}

function showEnd({ title, body, stats, actions }) {
  dom.endTitle.textContent = title;
  dom.endBody.textContent = body;
  dom.endStats.innerHTML = stats
    .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`)
    .join('');
  dom.endActions.innerHTML = '';
  for (const [value, label, primary] of actions) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = primary ? 'btn btn-primary' : 'btn';
    btn.textContent = label;
    btn.addEventListener('click', () => dom.dlgEnd.close(value));
    dom.endActions.appendChild(btn);
  }
  dom.dlgEnd.showModal();
}

dom.dlgEnd.addEventListener('close', () => {
  const value = dom.dlgEnd.returnValue;
  if (value === 'again') newGame({ seed: randomSeed() });
  else if (value === 'same') newGame({ seed: state.board.seed });
  else if (value === 'shuffle') doShuffle();
  else if (value === 'undo') doUndo();
  dom.dlgEnd.returnValue = '';
});

/* ================================================================== actions */

function doUndo() {
  const last = state.board.undo();
  if (!last) {
    note('Nothing to undo yet.');
    return;
  }
  state.ended = false;
  clearSelection();
  state.nodes[last[0]].classList.remove('matched');
  state.nodes[last[1]].classList.remove('matched');
  state.moves = Math.max(0, state.moves - 1);
  state.score = Math.max(0, state.score - 120);
  state.lastMatchAt = 0;
  sfx.undo();
  refreshTiles();
  refreshStats();
  announce('Move undone.');
}

function doHint() {
  const moves = state.board.availableMoves();
  if (!moves.length) {
    note('There is no legal pair on the board.');
    sfx.reject();
    return;
  }
  const [a, b] = moves[Math.floor(Math.random() * moves.length)];
  state.hints += 1;
  state.score = Math.max(0, state.score - 30);
  for (const id of [a, b]) {
    const node = state.nodes[id];
    node.classList.remove('hinted');
    void node.offsetWidth;
    node.classList.add('hinted');
    setTimeout(() => node.classList.remove('hinted'), 3200);
  }
  refreshStats();
  note(`${moves.length} pair${moves.length === 1 ? '' : 's'} available right now.`);
  announce(`Hint: ${state.board.tiles[a].label}.`);
}

function doShuffle() {
  const board = state.board;
  const ok = board.reshuffle(`${board.seed}!${state.shuffles}!${Date.now()}`);
  if (!ok) {
    note('The tiles left cannot be rearranged.');
    sfx.reject();
    return;
  }
  state.shuffles += 1;
  state.score = Math.max(0, state.score - 150);
  state.ended = false;
  clearSelection();
  for (let i = 0; i < state.nodes.length; i++) {
    if (board.present[i]) repaintFace(i);
    state.nodes[i].classList.remove('matched');
  }
  store.bumpStat('shuffles');
  refreshTiles();
  refreshStats();
  startClock();
  note('Redealt. The rest of the board is solvable again.');
  announce('Tiles reshuffled.');
  checkEnd();
}

function newGame({ layoutId = state.layoutId, seed = randomSeed() } = {}) {
  // A deal link pasted into an open tab arrives while the end-of-game dialog is
  // still up; it describes a board that no longer exists.
  if (dom.dlgEnd.open) dom.dlgEnd.close('');
  stopClock();
  const layout = getLayout(layoutId);
  state.layoutId = layout.id;
  state.board = new Board(layout, seed);
  state.selected = null;
  state.moves = 0;
  state.score = 0;
  state.hints = 0;
  state.shuffles = 0;
  state.elapsed = 0;
  state.lastMatchAt = 0;
  state.focusId = 0;
  state.ended = false;

  dom.time.textContent = '0:00';
  dom.layoutSelect.value = layout.id;
  store.save('layout', layout.id);
  store.bumpStat('games');

  renderBoard();
  moveFocusToSomething();
  refreshTiles();
  refreshStats();
  writeUrl();
  note(`${layout.name} — ${layout.blurb}`, 4200);
  announce(`New ${layout.name} board dealt. 144 tiles.`);
}

/* ====================================================================== url */

function writeUrl() {
  const hash = `#board=${state.layoutId}&deal=${state.board.seed}`;
  if (location.hash !== hash) history.replaceState(null, '', hash);
}

function readUrl() {
  const params = new URLSearchParams(location.hash.replace(/^#/, ''));
  const layoutId = params.get('board');
  const seed = params.get('deal');
  return {
    layoutId: LAYOUTS.some((l) => l.id === layoutId) ? layoutId : null,
    seed: seed && /^[A-Za-z0-9#!_-]{1,40}$/.test(seed) ? seed : null,
  };
}

async function copyDeal() {
  const url = `${location.origin}${location.pathname}#board=${state.layoutId}&deal=${state.board.seed}`;
  try {
    await navigator.clipboard.writeText(url);
    note('Link to this exact deal copied.');
  } catch {
    note(`Deal ${state.board.seed} on ${getLayout(state.layoutId).name}.`);
  }
}

/* ================================================================= keyboard */

/** Move focus to the nearest tile in a direction, in the board's own pixels. */
function moveFocus(dx, dy) {
  const from = state.nodes[state.focusId];
  const fx = Number(from.dataset.cx);
  const fy = Number(from.dataset.cy);
  let best = null;
  let bestCost = Infinity;
  for (let i = 0; i < state.nodes.length; i++) {
    if (!state.board.present[i] || i === state.focusId) continue;
    const node = state.nodes[i];
    const ax = Number(node.dataset.cx) - fx;
    const ay = Number(node.dataset.cy) - fy;
    const along = ax * dx + ay * dy;
    if (along <= 1) continue;
    const across = Math.abs(ax * dy - ay * dx);
    const cost = along + across * 3;
    if (cost < bestCost) {
      bestCost = cost;
      best = i;
    }
  }
  if (best === null) return;
  state.nodes[state.focusId].tabIndex = -1;
  state.focusId = best;
  state.nodes[best].tabIndex = 0;
  state.nodes[best].focus();
}

const ARROWS = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

document.addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const tag = e.target.tagName;
  const inField = tag === 'SELECT' || tag === 'INPUT' || tag === 'TEXTAREA';
  const dialogOpen = dom.dlgEnd.open || dom.dlgHelp.open;

  if (ARROWS[e.key] && !inField && !dialogOpen && e.target.closest?.('.tile')) {
    e.preventDefault();
    moveFocus(...ARROWS[e.key]);
    return;
  }

  if (e.key === 'Escape' && !dialogOpen) {
    clearSelection();
    return;
  }
  if (inField || dialogOpen) return;

  const key = e.key.toLowerCase();
  if (key === 'h') { e.preventDefault(); doHint(); }
  else if (key === 'z') { e.preventDefault(); doUndo(); }
  else if (key === 's') { e.preventDefault(); doShuffle(); }
  else if (key === 'n') { e.preventDefault(); newGame({ seed: randomSeed() }); }
  else if (key === '?' || key === '/') { e.preventDefault(); dom.dlgHelp.showModal(); }
});

/* ==================================================================== wiring */

function buildLayoutSelect() {
  dom.layoutSelect.innerHTML = LAYOUTS.map(
    (l) => `<option value="${l.id}">${l.name} — ${l.difficulty}</option>`,
  ).join('');
}

function buildGallery() {
  dom.gallery.innerHTML = FACES.map(
    (face) => `<div class="gallery-tile">${faceSvg(face)}</div>`,
  ).join('');
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#14211c' : '#e9ddc7');
  store.save('theme', theme);
}

function init() {
  buildLayoutSelect();
  buildGallery();

  const prefersLight = window.matchMedia?.('(prefers-color-scheme: light)').matches;
  applyTheme(store.load('theme', prefersLight ? 'light' : 'dark'));

  const soundOn = store.load('sound', true);
  setSoundEnabled(soundOn);
  el('btn-sound').setAttribute('aria-pressed', String(soundOn));

  dom.inner.addEventListener('click', (e) => {
    const node = e.target.closest?.('.tile');
    if (!node || node.classList.contains('gone')) return;
    const id = Number(node.dataset.id);
    state.nodes[state.focusId].tabIndex = -1;
    state.focusId = id;
    node.tabIndex = 0;
    onTileActivate(id);
  });

  el('btn-new').addEventListener('click', () => newGame({ seed: randomSeed() }));
  el('btn-undo').addEventListener('click', doUndo);
  el('btn-hint').addEventListener('click', doHint);
  el('btn-shuffle').addEventListener('click', doShuffle);
  el('btn-help').addEventListener('click', () => dom.dlgHelp.showModal());
  dom.seed.addEventListener('click', copyDeal);

  el('btn-sound').addEventListener('click', (e) => {
    const btn = e.currentTarget;
    const on = btn.getAttribute('aria-pressed') !== 'true';
    btn.setAttribute('aria-pressed', String(on));
    setSoundEnabled(on);
    store.save('sound', on);
    if (on) { unlockAudio(); sfx.select(); }
  });

  el('btn-theme').addEventListener('click', () => {
    applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  });

  dom.layoutSelect.addEventListener('change', (e) => {
    newGame({ layoutId: e.target.value, seed: randomSeed() });
  });

  window.addEventListener('hashchange', () => {
    const next = readUrl();
    if (!next.seed) return;
    if (next.seed === state.board.seed && (next.layoutId || state.layoutId) === state.layoutId) return;
    newGame({ layoutId: next.layoutId || state.layoutId, seed: next.seed });
  });

  window.addEventListener('resize', fitBoard);
  if (window.ResizeObserver) new ResizeObserver(fitBoard).observe(dom.board);
  window.addEventListener('pointerdown', unlockAudio, { once: true });

  const fromUrl = readUrl();
  newGame({
    layoutId: fromUrl.layoutId || state.layoutId,
    seed: fromUrl.seed || randomSeed(),
  });
}

init();
