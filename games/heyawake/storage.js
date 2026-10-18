// Local storage is optional; blocked storage must not prevent play.
const DragonHeyawakeStorage = {
  getItem(key) { try { return localStorage.getItem(key); } catch { return null; } },
  setItem(key, value) { try { localStorage.setItem(key, value); } catch {} }
};
