// localStorage can throw or silently return nothing (private windows, blocked
// site data). Keep an in-memory mirror so a swallowed write is never
// contradicted by the next read.
const mirror = new Map();

export function load(key, fallback) {
  if (mirror.has(key)) return mirror.get(key);
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    const value = JSON.parse(raw);
    mirror.set(key, value);
    return value;
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  mirror.set(key, value);
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Kept in the mirror only; this session stays self-consistent.
  }
}
