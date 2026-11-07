export const WIDTH = 1200;
export const HEIGHT = 650;
export const FLOOR = 508;
export const INPUT_KEYS = ['left', 'right', 'jump', 'block', 'punch', 'kick', 'special'];
export const STYLES = [
  { name: 'Cân bằng', speed: 275, damage: 9 },
  { name: 'Nhanh nhẹn', speed: 315, damage: 8 },
  { name: 'Sức mạnh', speed: 240, damage: 10 }
];
export const PRESETS = [
  { name: 'MOCHI', fur: '#dfac72', accent: '#ffb94a', style: 0, portrait: '' },
  { name: 'NIMBUS', fur: '#d5dee7', accent: '#a9c9ff', style: 1, portrait: '' },
  { name: 'EMBER', fur: '#9470b8', accent: '#f4a5c1', style: 2, portrait: '' }
];
export const SHOP_ITEMS = [
  { id: 'mint-aura', name: 'Hào quang bạc hà', price: 80, description: 'Một vòng sáng xanh theo từng bước chân.', icon: '✧' },
  { id: 'crown', name: 'Vương miện tí hon', price: 160, description: 'Một chiếc vương miện vừa vặn đôi tai hamster.', icon: '♛' }
];
export const emptyInput = () => Object.fromEntries(INPUT_KEYS.map(k => [k, false]));
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
export function cleanProfile(value = {}) {
  const color = (v, fallback) => /^#[0-9a-f]{6}$/i.test(v || '') ? v : fallback;
  const portrait = typeof value.portrait === 'string' && value.portrait.length <= 160000 && /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value.portrait) ? value.portrait : '';
  return { name: String(value.name || 'HAMSTER').replace(/[<>\u0000-\u001f]/g, '').trim().slice(0, 18) || 'HAMSTER',
    fur: color(value.fur, PRESETS[0].fur), accent: color(value.accent, PRESETS[0].accent),
    style: [0, 1, 2].includes(value.style) ? value.style : 0, portrait,
    cosmetic: SHOP_ITEMS.some(item => item.id === value.cosmetic) ? value.cosmetic : 'none' };
}
export function cleanInput(value) { return Object.fromEntries(INPUT_KEYS.map(k => [k, value?.[k] === true])); }
function fighter(profile, index) {
  return { x: index ? 840 : 360, y: 0, vy: 0, hp: 100, meter: 35, facing: index ? -1 : 1,
    action: 'idle', actionTime: 0, cooldown: 0, stun: 0, combo: 0, comboTimer: 0,
    attackId: 0, hit: false, block: false, knockback: 0, ...STYLES[profile.style] };
}
export function createMatch(profiles = PRESETS.slice(0, 2), options = {}) {
  const clean = profiles.map(cleanProfile);
  return { profiles: clean, fighters: clean.map(fighter), phase: 'countdown', phaseTime: 2.6, round: 1,
    time: 90, wins: [0, 0], winner: null, roundWinner: null, projectiles: [], effects: [], tick: 0,
    nextAttack: 1, difficulty: options.difficulty || 'normal', training: Boolean(options.training) };
}
export function aiInput(match) {
  const self = match.fighters[1], rival = match.fighters[0], out = emptyInput();
  const distance = Math.abs(self.x - rival.x);
  const phase = match.tick % (match.difficulty === 'easy' ? 105 : match.difficulty === 'hard' ? 42 : 65);
  const reaction = match.difficulty === 'easy' ? 25 : match.difficulty === 'hard' ? 6 : 14;
  if (phase < reaction) return out;
  if (distance > 115) out[self.x < rival.x ? 'right' : 'left'] = true;
  if (rival.actionTime > 0 && distance < 165 && match.tick % 100 > (match.difficulty === 'hard' ? 15 : 60)) out.block = true;
  if (distance < 140 && !out.block) out[match.tick % 120 < 70 ? 'punch' : 'kick'] = true;
  if (distance > 210 && distance < 650 && self.meter >= 35 && phase > 35) out.special = true;
  if (match.difficulty !== 'easy' && match.projectiles.some(p => p.owner === 0 && Math.abs(p.x - self.x) < 220)) out.jump = true;
  return out;
}
function attack(match, f, kind) {
  f.action = kind; f.actionTime = kind === 'special' ? .58 : kind === 'kick' ? .48 : .32;
  f.cooldown = f.actionTime + .1; f.hit = false; f.attackId = match.nextAttack++;
  if (kind === 'punch') { f.combo = f.comboTimer > 0 ? f.combo % 3 + 1 : 1; f.comboTimer = 1.0; }
  if (kind === 'special') {
    f.meter -= 35;
    match.projectiles.push({ id: f.attackId, owner: match.fighters.indexOf(f), x: f.x + f.facing * 65, y: f.y + 68, dir: f.facing, life: 1.8 });
  }
}
function hit(match, attacker, defender, damage, direction, special = false) {
  const blocked = defender.block && defender.y < 8 && defender.facing === -direction;
  const dealt = blocked ? Math.max(1, Math.round(damage * .16)) : damage;
  defender.hp = Math.max(0, defender.hp - dealt);
  defender.stun = blocked ? .09 : special ? .34 : .22;
  defender.knockback = direction * (blocked ? 95 : special ? 420 : 210);
  if (!blocked) { defender.action = 'hurt'; defender.actionTime = .22; }
  attacker.meter = clamp(attacker.meter + (blocked ? 2 : 7), 0, 100);
  defender.meter = clamp(defender.meter + (blocked ? 3 : 5), 0, 100);
  match.effects.push({ id: match.nextAttack++, x: defender.x - direction * 35, y: defender.y + 80, life: .28, blocked, damage: dealt });
}
function endRound(match) {
  const [a, b] = match.fighters;
  match.roundWinner = a.hp === b.hp ? -1 : a.hp > b.hp ? 0 : 1;
  if (match.roundWinner >= 0) match.wins[match.roundWinner]++;
  match.phase = match.wins.some(n => n >= 2) ? 'finished' : 'roundEnd';
  match.winner = match.phase === 'finished' ? (match.wins[0] === match.wins[1] ? -1 : match.wins[0] > match.wins[1] ? 0 : 1) : null;
  match.phaseTime = 2.6;
}
// Deterministic fixed-step combat. Online clients submit buttons only; the server owns state.
export function stepMatch(match, rawInputs = [], dt = 1 / 60) {
  dt = clamp(Number.isFinite(dt) ? dt : 0, 0, .05);
  if (match.phase === 'finished' || match.phase === 'disconnected') return match;
  match.tick++;
  match.effects = match.effects.filter(e => (e.life -= dt) > 0);
  if (match.phase !== 'fight') {
    match.phaseTime -= dt;
    if (match.phaseTime <= 0) {
      if (match.phase === 'roundEnd') {
        match.round++; match.fighters = match.profiles.map(fighter); match.projectiles = []; match.time = 90;
        match.phase = 'countdown'; match.phaseTime = 2.6;
      } else match.phase = 'fight';
    }
    return match;
  }
  match.time = Math.max(0, match.time - dt);
  const inputs = rawInputs.map(cleanInput);
  for (let i = 0; i < 2; i++) {
    const f = match.fighters[i], other = match.fighters[1 - i], input = inputs[i] || emptyInput();
    f.facing = f.x <= other.x ? 1 : -1;
    f.cooldown = Math.max(0, f.cooldown - dt); f.stun = Math.max(0, f.stun - dt);
    f.actionTime = Math.max(0, f.actionTime - dt); f.comboTimer = Math.max(0, f.comboTimer - dt);
    f.block = input.block && f.stun <= 0 && f.actionTime <= 0 && f.y === 0;
    if (f.actionTime <= 0) f.action = f.block ? 'block' : 'idle';
    if (f.stun <= 0) {
      if (input.jump && f.y === 0 && !f.actionTime && !f.block) f.vy = 650;
      const move = Number(input.right) - Number(input.left);
      if (!f.actionTime && !f.block) { f.x += move * f.speed * dt; if (move) f.action = 'walk'; }
      if (f.cooldown <= 0 && !f.block) {
        if (input.special && f.meter >= 35 && f.y < 10) attack(match, f, 'special');
        else if (input.kick) attack(match, f, 'kick');
        else if (input.punch) attack(match, f, 'punch');
      }
    }
    f.x = clamp(f.x + f.knockback * dt, 70, WIDTH - 70);
    f.knockback *= Math.exp(-9 * dt);
    f.vy -= 1700 * dt; f.y = Math.max(0, f.y + f.vy * dt); if (!f.y) f.vy = 0;
    f.meter = clamp(f.meter + dt * 1.8, 0, 100);
  }
  const [a, b] = match.fighters;
  if (Math.abs(a.x - b.x) < 86 && Math.abs(a.y - b.y) < 110) {
    const push = (86 - Math.abs(a.x - b.x)) / 2, dir = a.x <= b.x ? 1 : -1;
    a.x = clamp(a.x - dir * push, 70, WIDTH - 70); b.x = clamp(b.x + dir * push, 70, WIDTH - 70);
  }
  const hits = [];
  for (let i = 0; i < 2; i++) {
    const f = match.fighters[i], other = match.fighters[1 - i];
    if (!f.hit && ['punch', 'kick'].includes(f.action) && f.actionTime > .06 && f.actionTime < (f.action === 'punch' ? .22 : .32) &&
        Math.abs(f.x - other.x) < (f.action === 'kick' ? 166 : 133) && Math.abs(f.y - other.y) < 92) {
      hits.push([f, other, f.damage + (f.action === 'kick' ? 5 : f.combo === 3 ? 7 : 0), f.facing]); f.hit = true;
    }
  }
  for (const args of hits) hit(match, ...args);
  match.projectiles = match.projectiles.filter(p => {
    p.x += p.dir * 650 * dt; p.life -= dt;
    const enemy = match.fighters[1 - p.owner];
    if (Math.abs(p.x - enemy.x) < 62 && Math.abs(p.y - (enemy.y + 65)) < 70) { hit(match, match.fighters[p.owner], enemy, 21, p.dir, true); return false; }
    return p.life > 0 && p.x > -50 && p.x < WIDTH + 50;
  });
  if (!match.training && (a.hp <= 0 || b.hp <= 0 || match.time <= 0)) endRound(match);
  if (match.training) { match.time = 90; if (b.hp < 10) b.hp = 100; }
  return match;
}
export function publicState(match) { const { profiles, ...state } = match; return state; }
