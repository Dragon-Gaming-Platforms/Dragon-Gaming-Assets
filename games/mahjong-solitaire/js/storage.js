/**
 * localStorage with an in-memory mirror.
 *
 * A write can fail — private windows, blocked site data, a full quota — and a
 * bare try/catch around it hides the failure but not the consequence: the next
 * read returns the old value and the page contradicts itself. Keeping the
 * authoritative copy in memory means a blocked browser loses persistence
 * between visits and nothing else.
 */

const PREFIX = 'mahjong:';
const memory = new Map();

function backing() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function load(key, fallback) {
  if (memory.has(key)) return memory.get(key);
  const store = backing();
  if (store) {
    try {
      const raw = store.getItem(PREFIX + key);
      if (raw !== null) {
        const value = JSON.parse(raw);
        memory.set(key, value);
        return value;
      }
    } catch {
      /* corrupt or unreadable — fall through to the default */
    }
  }
  memory.set(key, fallback);
  return fallback;
}

export function save(key, value) {
  memory.set(key, value);
  const store = backing();
  if (!store) return false;
  try {
    store.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/** Best (lowest) time in seconds per layout, with the move count that got it. */
export function bestFor(layoutId) {
  const all = load('best', {});
  return all[layoutId] || null;
}

export function recordWin(layoutId, seconds, moves) {
  const all = { ...load('best', {}) };
  const prev = all[layoutId];
  if (prev && prev.seconds <= seconds) return false;
  all[layoutId] = { seconds, moves, at: Date.now() };
  save('best', all);
  return true;
}

export function bumpStat(key, by = 1) {
  const stats = { ...load('stats', {}) };
  stats[key] = (stats[key] || 0) + by;
  save('stats', stats);
  return stats[key];
}

export function stats() {
  return load('stats', {});
}
