// Host adaptation: fail-safe, game-scoped browser storage.
const memory = new Map();
let backend = null;
try { backend = window.localStorage; } catch { /* embedded/private storage may be denied */ }
const gameStorage = {
  getItem(key) {
    if (memory.has(key)) return memory.get(key);
    try { return backend?.getItem(key) ?? null; } catch { return null; }
  },
  setItem(key, value) {
    memory.set(key, String(value));
    try { backend?.setItem(key, String(value)); } catch { /* keep playing in memory */ }
  },
};
