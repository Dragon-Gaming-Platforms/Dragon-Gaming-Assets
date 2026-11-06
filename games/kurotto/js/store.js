// 存档与纪录都在 localStorage，键名是 verify.sh 的 save 腿直接读的东西：
// 改名要同时改 tools/scenarios.js，否则那一腿会去读一个空键然后"绿"。
const KEY = {
  save: 'dragon-gaming.kurotto.save',
  records: 'dragon-gaming.kurotto.records',
  prefs: 'dragon-gaming.kurotto.prefs',
};

function readJSON(k, fallback) {
  try {
    const raw = localStorage.getItem(k);
    if (!raw) return fallback;
    const v = JSON.parse(raw);
    return v === null || v === undefined ? fallback : v;
  } catch (e) { return fallback; }
}
function writeJSON(k, v) {
  try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; }
}
export function storageAvailable() {
  try {
    const k = KEY.prefs + '.probe';
    localStorage.setItem(k, '1'); localStorage.removeItem(k);
    return true;
  } catch (e) { return false; }
}

// 一局存档：题面与解题进度都存，但**答案不存**——存档恢复后仍然只靠引擎判胜负。
export function loadSave() {
  const s = readJSON(KEY.save, null);
  if (!s || s.v !== 1 || ![6, 7, 8, 9].includes(s.n) || !Array.isArray(s.cell) || !Array.isArray(s.marks)) return null;
  if (s.cell.length !== s.n * s.n || s.marks.length !== s.n * s.n) return null;
  if (!Number.isInteger(s.seed) || s.seed < 0 || s.seed > 0xffffffff || s.tier !== s.n) return null;
  if (s.cell.some(v => !Number.isInteger(v) || v < -2 || v >= s.n * s.n)) return null;
  if (s.marks.some((v, i) => ![0, 1, 2].includes(v) || (s.cell[i] !== -2 && v === 2))) return null;
  if (['moves', 'hints', 'elapsed'].some(k => !Number.isSafeInteger(s[k]) || s[k] < 0)) return null;
  return s;
}
export function saveGame(s) { return writeJSON(KEY.save, s); }
export function clearSave() { try { localStorage.removeItem(KEY.save); } catch (e) { } }

// 同档纪录：先比提示次数，再比步数，最后比用时。
export function loadRecords() {
  const r = readJSON(KEY.records, null);
  const clean = {};
  if (!r || typeof r !== 'object' || Array.isArray(r)) return clean;
  for (const n of [6, 7, 8, 9]) {
    if (Array.isArray(r[n])) clean[n] = r[n].filter(x => x && x.tier === n &&
      ['seed', 'hints', 'moves', 'ms'].every(k => Number.isSafeInteger(x[k]) && x[k] >= 0)).slice(0, 5);
  }
  return clean;
}
export function recordResult(rec) {
  const all = loadRecords();
  const list = Array.isArray(all[rec.tier]) ? all[rec.tier] : [];
  const key = x => [x.hints, x.moves, x.ms];
  const k = key(rec);
  const worse = (a, b) => { for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i]; return 0; };
  const hitIdx = list.findIndex(x => x.seed === rec.seed);
  if (hitIdx >= 0) list.splice(hitIdx, 1);
  list.push(rec);
  list.sort((a, b) => worse(key(a), key(b)));
  const top = list.slice(0, 5);
  all[rec.tier] = top;
  writeJSON(KEY.records, all);
  const rank = top.findIndex(x => x.seed === rec.seed);
  return { rank: rank < 0 ? -1 : rank + 1, best: top[0] || null, isRecord: rank === 0 };
}
export function clearRecords() { try { localStorage.removeItem(KEY.records); } catch (e) { } }

export function loadPrefs() {
  const p = readJSON(KEY.prefs, {});
  return { theme: p.theme === 'light' || p.theme === 'dark' ? p.theme : null, lastTier: Number.isFinite(p.lastTier) ? p.lastTier : null };
}
export function savePrefs(patch) {
  const p = { ...loadPrefs(), ...patch };
  if (p.theme === null) delete p.theme;
  if (p.lastTier === null) delete p.lastTier;
  return writeJSON(KEY.prefs, p);
}
export function wipeAll() {
  for (const k of Object.values(KEY)) { try { localStorage.removeItem(k); } catch (e) { } }
}
export const KEYS = KEY;
