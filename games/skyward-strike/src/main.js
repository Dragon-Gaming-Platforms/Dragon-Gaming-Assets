// Bootstrap: wires the simulation to a canvas, the keyboard and the DOM.
import { Game } from './game.js';
import { Renderer } from './render.js';
import { createInput } from './input.js';
import { Audio } from './audio.js';
import { makeRng } from './rng.js';
import { load, save } from './storage.js';

const STEP = 1 / 120;
const MAX_STEPS = 16;
const HS_KEY = 'skyward-strike:highscore';
const MUTE_KEY = 'skyward-strike:muted';

const canvas = document.getElementById('game');
const overlay = document.getElementById('overlay');
const panel = document.getElementById('panel');
const muteBtn = document.getElementById('mute');

const rng = makeRng((Date.now() ^ 0x5bf03635) >>> 0);
const game = new Game({ rng: makeRng((Date.now() * 2654435761) >>> 0) });
const renderer = new Renderer(canvas, rng);
const audio = new Audio(load(MUTE_KEY, false) === true);

let highScore = load(HS_KEY, 0) || 0;
let newRecord = false;
let renderedState = null;
let last = 0;
let acc = 0;

renderer.resize();

const input = createInput(canvas, game, {
  onPause: () => act(() => game.togglePause()),
  onMute: () => act(toggleMute),
  onConfirm: () => act(confirmAction),
  onAnyInput: () => audio.unlock(),
  mapPoint: (x, y) => renderer.clientToField(x, y),
});

function act(fn) {
  fn();
  // Push to the DOM from the handler that changed the state; the frame loop is
  // throttled exactly when some of these transitions happen.
  syncUI();
}

function confirmAction() {
  if (game.state === 'title' || game.state === 'over') {
    newRecord = false;
    game.start();
    resetClock();
  } else if (game.state === 'paused') {
    game.resume();
    resetClock();
  }
}

function toggleMute() {
  audio.setMuted(!audio.muted);
  save(MUTE_KEY, audio.muted);
  muteBtn.textContent = audio.muted ? 'Sound off' : 'Sound on';
  muteBtn.setAttribute('aria-pressed', String(audio.muted));
}

/** The timestamp baseline and the accumulator are one piece of state. */
function resetClock() {
  last = 0;
  acc = 0;
}

// ---------------------------------------------------------------------------

const PANELS = {
  title: () => `
    <h1>Skyward&nbsp;Strike</h1>
    <p class="tag">Fly. Shoot. Survive the waves.</p>
    <dl class="keys">
      <dt>Move</dt><dd>Arrows / WASD / drag</dd>
      <dt>Fire</dt><dd>Space or Z (hold)</dd>
      <dt>Bomb</dt><dd>X or B</dd>
      <dt>Pause</dt><dd>P or Esc</dd>
    </dl>
    <p class="touch">On a touchscreen: drag anywhere to fly — the guns fire themselves.</p>
    <button class="cta" data-action="confirm" type="button">Take off</button>
    <p class="best">${highScore > 0 ? `Best ${highScore.toLocaleString()}` : 'No score yet'}</p>
  `,
  paused: () => `
    <h2 class="calm">Paused</h2>
    <button class="cta" data-action="confirm" type="button">Resume</button>
    <p class="tag">P or Esc to resume</p>
  `,
  over: () => `
    <h2>Shot down</h2>
    <p class="score">${game.score.toLocaleString()}</p>
    <dl class="keys">
      <dt>Wave reached</dt><dd>${game.wave}</dd>
      <dt>Best chain</dt><dd>${game.bestStreak}</dd>
      <dt>Enemies downed</dt><dd>${game.kills}</dd>
    </dl>
    ${newRecord ? '<p class="record">New record!</p>' : `<p class="best">Best ${highScore.toLocaleString()}</p>`}
    <button class="cta" data-action="confirm" type="button">Fly again</button>
  `,
};

function syncUI() {
  const state = game.state;
  const show = state !== 'playing';
  if (state !== renderedState) {
    renderedState = state;
    if (show) {
      panel.innerHTML = PANELS[state]();
      overlay.hidden = false;
      const cta = panel.querySelector('.cta');
      if (cta) cta.focus({ preventScroll: true });
    } else {
      overlay.hidden = true;
      panel.innerHTML = '';
    }
  }
  document.body.dataset.state = state;
}

panel.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action="confirm"]');
  if (!btn) return;
  audio.unlock();
  btn.blur();
  act(confirmAction);
});

muteBtn.addEventListener('click', () => {
  audio.unlock();
  act(toggleMute);
});
muteBtn.textContent = audio.muted ? 'Sound off' : 'Sound on';
muteBtn.setAttribute('aria-pressed', String(audio.muted));

// ---------------------------------------------------------------------------

function handleEvents() {
  for (const ev of game.drainEvents()) {
    audio.play(ev);
    if (ev.type === 'gameover') {
      if (ev.score > highScore) {
        highScore = ev.score;
        newRecord = true;
        save(HS_KEY, highScore);
      }
      input.releaseAll();
    }
  }
}

function frame(now) {
  requestAnimationFrame(frame);

  if (!last) last = now;
  let dt = (now - last) / 1000;
  last = now;
  if (!Number.isFinite(dt) || dt < 0) dt = 0;
  dt = Math.min(dt, 0.25);

  acc += dt;
  let steps = 0;
  while (acc >= STEP && steps < MAX_STEPS) {
    game.update(STEP);
    acc -= STEP;
    steps += 1;
  }
  if (acc > STEP) acc = 0; // drop a backlog instead of spiralling

  handleEvents();
  if (game.state !== renderedState) syncUI();
  renderer.draw(game, Math.min(dt, 1 / 20));
}

// Paint and populate the DOM eagerly rather than on the first animation frame:
// a backgrounded tab never delivers one, and the page would sit empty with
// every handler alive and doing nothing visible.
syncUI();
renderer.draw(game, 0);
requestAnimationFrame(frame);

// ---------------------------------------------------------------------------

const ro = new ResizeObserver(() => renderer.resize());
ro.observe(canvas);
window.addEventListener('resize', () => renderer.resize());

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    input.releaseAll();
    act(() => game.pause());
  } else {
    resetClock();
  }
});
