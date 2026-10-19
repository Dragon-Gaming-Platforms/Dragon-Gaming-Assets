// Optional persistence: caller catches write failures and can report a volatile session.
const memory = new Map();
let backend = null;
try { backend = window.localStorage; } catch { /* storage may be denied in an iframe */ }
export const storage = {
  getItem(key) {
    if (memory.has(key)) return memory.get(key);
    try { return backend?.getItem(key) ?? null; } catch { return null; }
  },
  setItem(key, value) {
    memory.set(key, String(value));
    if (!backend) throw new Error('Persistent storage unavailable');
    backend.setItem(key, String(value));
  },
  removeItem(key) {
    memory.delete(key);
    if (!backend) throw new Error('Persistent storage unavailable');
    backend.removeItem(key);
  },
};
