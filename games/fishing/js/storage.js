// Save data lives in memory and is written through to localStorage.
// Storage can throw on every access (private mode, blocked cookies, opaque
// origins), so a failed write must never make the running session read back a
// stale value -- the in-memory copy stays the source of truth.

const KEY = 'deep-blue-save-v1';

const BLANK = {
  coins: 0,
  upgrades: { rod: 0, line: 0, reel: 0, bait: 0 },
  dex: {},          // id -> { count, bestLen, bestValue }
  totalCaught: 0,
  totalEarned: 0,
  escapes: 0,
  seenIntro: false,
};

export const save = structuredClone(BLANK);
export let persistent = true;   // false once a write has provably failed

function seed() {
  let raw = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    persistent = false;
    return;
  }
  if (raw == null) return;      // absent, not zero -- keep the blank defaults
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return;                     // corrupt save: start fresh rather than crash
  }
  if (!parsed || typeof parsed !== 'object') return;

  if (typeof parsed.coins === 'number') save.coins = parsed.coins;
  if (typeof parsed.totalCaught === 'number') save.totalCaught = parsed.totalCaught;
  if (typeof parsed.totalEarned === 'number') save.totalEarned = parsed.totalEarned;
  if (typeof parsed.escapes === 'number') save.escapes = parsed.escapes;
  save.seenIntro = parsed.seenIntro === true;
  if (parsed.upgrades && typeof parsed.upgrades === 'object') {
    for (const k of Object.keys(save.upgrades)) {
      const v = parsed.upgrades[k];
      if (typeof v === 'number' && v >= 0 && v <= 4) save.upgrades[k] = Math.floor(v);
    }
  }
  if (parsed.dex && typeof parsed.dex === 'object') {
    for (const [id, rec] of Object.entries(parsed.dex)) {
      if (!rec || typeof rec !== 'object') continue;
      save.dex[id] = {
        count: Number(rec.count) || 0,
        bestLen: Number(rec.bestLen) || 0,
        bestValue: Number(rec.bestValue) || 0,
      };
    }
  }
}

export function flush() {
  try {
    localStorage.setItem(KEY, JSON.stringify(save));
  } catch {
    persistent = false;         // the session keeps running off the field above
  }
}

export function resetSave() {
  Object.assign(save, structuredClone(BLANK));
  flush();
}

seed();
