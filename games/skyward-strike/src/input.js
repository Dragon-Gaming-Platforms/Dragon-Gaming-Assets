// Keyboard + pointer input. Movement keys are captured (preventDefault) so the
// page never scrolls, and so Space/Enter cannot also activate a focused button
// on the same key press.
import { FIELD } from './balance.js';

const MOVE_KEYS = new Set([
  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
  'KeyA', 'KeyD', 'KeyW', 'KeyS',
]);
const ACTION_KEYS = new Set(['Space', 'KeyX', 'KeyZ', 'KeyB', 'Enter', 'KeyP', 'Escape', 'KeyM']);

// The finger sits below the plane so it is never covered by the hand.
const TOUCH_LIFT = 52;

export function createInput(canvas, game, handlers = {}) {
  const mapPoint = handlers.mapPoint
    || ((x, y) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((x - rect.left) / Math.max(1, rect.width)) * FIELD.W,
        y: ((y - rect.top) / Math.max(1, rect.height)) * FIELD.H,
      };
    });

  const held = new Set();
  const state = game.input;

  function syncKeys() {
    state.left = held.has('ArrowLeft') || held.has('KeyA');
    state.right = held.has('ArrowRight') || held.has('KeyD');
    state.up = held.has('ArrowUp') || held.has('KeyW');
    state.down = held.has('ArrowDown') || held.has('KeyS');
    state.fire = held.has('Space') || held.has('KeyZ') || pointerDown;
    state.bomb = held.has('KeyX') || held.has('KeyB');
  }

  function onKeyDown(e) {
    if (e.repeat) {
      if (MOVE_KEYS.has(e.code) || ACTION_KEYS.has(e.code)) e.preventDefault();
      return;
    }
    if (MOVE_KEYS.has(e.code) || ACTION_KEYS.has(e.code)) {
      e.preventDefault();
      // Keyboard takes over from pointer steering.
      if (MOVE_KEYS.has(e.code)) game.pointer = null;
    }
    held.add(e.code);
    syncKeys();

    if (e.code === 'KeyP' || e.code === 'Escape') handlers.onPause?.();
    if (e.code === 'KeyM') handlers.onMute?.();
    if (e.code === 'Enter' || e.code === 'Space') handlers.onConfirm?.();
    handlers.onAnyInput?.();
  }

  function onKeyUp(e) {
    if (MOVE_KEYS.has(e.code) || ACTION_KEYS.has(e.code)) e.preventDefault();
    held.delete(e.code);
    syncKeys();
  }

  let pointerDown = false;
  let activePointer = null;

  function toField(ev) {
    const p = mapPoint(ev.clientX, ev.clientY);
    return { x: p.x, y: p.y - TOUCH_LIFT };
  }

  function onPointerDown(ev) {
    if (activePointer !== null) return;
    activePointer = ev.pointerId;
    pointerDown = true;
    canvas.setPointerCapture?.(ev.pointerId);
    game.pointer = toField(ev);
    syncKeys();
    handlers.onAnyInput?.();
    handlers.onConfirm?.();
    ev.preventDefault();
  }

  function onPointerMove(ev) {
    if (ev.pointerId !== activePointer) return;
    game.pointer = toField(ev);
    ev.preventDefault();
  }

  function onPointerUp(ev) {
    if (ev.pointerId !== activePointer) return;
    activePointer = null;
    pointerDown = false;
    game.pointer = null;
    syncKeys();
  }

  window.addEventListener('keydown', onKeyDown, { passive: false });
  window.addEventListener('keyup', onKeyUp, { passive: false });
  window.addEventListener('blur', () => {
    held.clear();
    activePointer = null;
    pointerDown = false;
    game.pointer = null;
    syncKeys();
  });
  canvas.addEventListener('pointerdown', onPointerDown, { passive: false });
  canvas.addEventListener('pointermove', onPointerMove, { passive: false });
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  return {
    releaseAll() {
      held.clear();
      pointerDown = false;
      activePointer = null;
      game.pointer = null;
      syncKeys();
    },
  };
}
