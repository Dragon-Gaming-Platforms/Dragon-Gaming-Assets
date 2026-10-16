// Bootstrap: canvas sizing, the frame loop, and the single input funnel.

import { game, input, update, startGame } from './game.js';
import { createScene } from './scene.js';
import { drawHud, HUD } from './hud.js';
import { save } from './storage.js';
import * as ui from './ui.js';
import { unlock } from './audio.js';

const stage = document.getElementById('stage');
const sceneCanvas = document.getElementById('scene');
const hudCanvas = document.getElementById('hudLayer');

const gl = sceneCanvas.getContext('webgl2', {
  alpha: false,
  antialias: true,
  depth: true,
  // The drawing buffer is discarded once the compositor takes it, so without
  // this a screenshot of a caught fish comes back blank.
  preserveDrawingBuffer: true,
  powerPreference: 'high-performance',
});

if (!gl) {
  document.getElementById('mTitle').hidden = true;
  document.getElementById('noWebgl').hidden = false;
} else {
  boot();
}

function boot() {
  const hudCtx = hudCanvas.getContext('2d');
  let scene;
  try {
    scene = createScene(gl);
  } catch (err) {
    document.getElementById('mTitle').hidden = true;
    document.getElementById('noWebgl').hidden = false;
    document.getElementById('noWebglDetail').textContent = String(err.message || err);
    return;
  }

  /* ----------------------------------------------------------------- sizing */

  let vw = 960, vh = 600;

  function resize() {
    const rect = stage.getBoundingClientRect();
    // A hidden or collapsed pane measures 0x0; scaling from that cannot be
    // recovered, so hold the last good size until the box comes back.
    if (rect.width < 2 || rect.height < 2) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(2, Math.round(rect.width * dpr));
    const h = Math.max(2, Math.round(rect.height * dpr));
    if (sceneCanvas.width !== w || sceneCanvas.height !== h) {
      sceneCanvas.width = w;
      sceneCanvas.height = h;
    }
    vw = w; vh = h;

    const hw = Math.max(2, Math.round(rect.width * dpr));
    const hh = Math.max(2, Math.round(rect.height * dpr));
    if (hudCanvas.width !== hw || hudCanvas.height !== hh) {
      hudCanvas.width = hw;
      hudCanvas.height = hh;
    }
    hudCtx.setTransform(hw / HUD.w, 0, 0, hh / HUD.h, 0, 0);
  }

  window.addEventListener('resize', resize);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', resize);

  /* ------------------------------------------------------------------ input */

  const keysDown = new Set();

  function pressStart() {
    if (ui.modalOpen()) return;
    unlock();
    if (!input.hold) input.pressed = true;
    input.hold = true;
  }

  function pressEnd() {
    input.hold = false;
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { ui.close(); return; }
    if (e.repeat) return;
    const k = e.key.toLowerCase();

    // On the splash, the same key that casts also starts the game -- and then
    // stops, so the press does not also charge a cast.
    if (!document.getElementById('mTitle').hidden) {
      if (k === ' ' || k === 'enter') {
        e.preventDefault();
        document.getElementById('btnStart').click();
      }
      return;
    }
    if (ui.modalOpen()) return;

    if (k === ' ' || k === 'enter') {
      e.preventDefault();
      keysDown.add('hold');
      pressStart();
    } else if (k === 'arrowleft' || k === 'a') {
      e.preventDefault();
      keysDown.add('left');
    } else if (k === 'arrowright' || k === 'd') {
      e.preventDefault();
      keysDown.add('right');
    } else if (k === 's') {
      ui.open('mShop');
    } else if (k === 'f') {
      ui.open('mDex');
    } else if (k === 'h' || k === '?') {
      ui.toggleHelp();
    }
  });

  window.addEventListener('keyup', (e) => {
    const k = e.key.toLowerCase();
    if (k === ' ' || k === 'enter') { keysDown.delete('hold'); pressEnd(); }
    if (k === 'arrowleft' || k === 'a') keysDown.delete('left');
    if (k === 'arrowright' || k === 'd') keysDown.delete('right');
  });

  window.addEventListener('blur', () => {
    keysDown.clear();
    pressEnd();
    input.steer = 0;
    input.pointerX = null;
  });

  // Pointer: press-and-hold reels in, a horizontal drag steers instead. The two
  // never fight, because the drag cancels the hold as soon as it is recognised.
  let pointerId = null;
  let dragFrom = null;
  let dragging = false;

  stage.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button')) return;
    if (ui.modalOpen()) return;
    pointerId = e.pointerId;
    dragFrom = { x: e.clientX, y: e.clientY };
    dragging = false;
    try { stage.setPointerCapture(e.pointerId); } catch { /* no active pointer */ }
    pressStart();
  });

  stage.addEventListener('pointermove', (e) => {
    if (e.pointerId !== pointerId || !dragFrom) return;
    if (!dragging && Math.abs(e.clientX - dragFrom.x) > 14) {
      dragging = true;
      pressEnd();                       // this gesture is a steer, not a hold
    }
    if (dragging) {
      const r = stage.getBoundingClientRect();
      input.pointerX = ((e.clientX - dragFrom.x) / Math.max(1, r.width)) * 3;
    }
  });

  function endPointer(e) {
    if (pointerId !== null && e.pointerId !== pointerId) return;
    pointerId = null;
    dragFrom = null;
    dragging = false;
    input.pointerX = null;
    pressEnd();
  }

  stage.addEventListener('pointerup', endPointer);
  stage.addEventListener('pointercancel', endPointer);
  window.addEventListener('pointerup', endPointer);

  // On-screen steering buttons for touch devices. They are only up while the
  // hook is sinking -- the rest of the time they would just cover the scene.
  const coarse = matchMedia('(pointer: coarse)').matches;
  const touchPad = document.getElementById('touchPad');

  for (const [id, dir] of [['tLeft', -1], ['tRight', 1]]) {
    const b = document.getElementById(id);
    const on = (e) => { e.preventDefault(); e.stopPropagation(); keysDown.add(dir < 0 ? 'left' : 'right'); };
    const off = () => keysDown.delete(dir < 0 ? 'left' : 'right');
    b.addEventListener('pointerdown', on);
    b.addEventListener('pointerup', off);
    b.addEventListener('pointerleave', off);
    b.addEventListener('pointercancel', off);
  }

  /* ------------------------------------------------------------------- loop */

  let last = performance.now();
  let shownResult = false;

  function step(dt) {
    input.steer = (keysDown.has('right') ? 1 : 0) - (keysDown.has('left') ? 1 : 0);
    // A panel pauses the simulation, so nobody loses a fish to the Fishdex.
    if (!ui.modalOpen()) update(dt);
    resize();
    scene.render(dt, vw, vh);
    drawHud(hudCtx, scene);
    ui.syncHUD(dt);

    const wantPad = coarse && game.phase === 'sinking';
    if (touchPad.hidden === wantPad) touchPad.hidden = !wantPad;

    const isResult = game.phase === 'result';
    if (isResult !== shownResult) {
      shownResult = isResult;
      isResult ? ui.showResult(game.result) : ui.hideResult();
    }
  }

  function frame(now) {
    // rAF is not a clock: hidden tabs, low-power modes and occluded windows
    // throttle or stop it entirely. Everything is driven by elapsed seconds,
    // and the step is clamped so a long stall cannot teleport the simulation.
    let dt = (now - last) / 1000;
    last = now;
    if (!(dt > 0)) dt = 1 / 60;
    step(Math.min(dt, 0.05));
    requestAnimationFrame(frame);
  }

  document.addEventListener('visibilitychange', () => {
    // Restarting an idle loop without resetting the stamp would hand the first
    // frame the whole pause as its delta.
    if (!document.hidden) last = performance.now();
    else { keysDown.clear(); pressEnd(); }
  });

  /* ------------------------------------------------------------------- boot */

  ui.initUI({ onStart: () => startGame() });
  resize();
  requestAnimationFrame(frame);

  // Returning players skip the splash.
  if (save.seenIntro) {
    document.getElementById('btnStart').textContent = 'Back to the water';
  }
}
