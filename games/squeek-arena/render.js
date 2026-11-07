import { WIDTH, HEIGHT, FLOOR, PRESETS, MOVES } from './engine.js';
const surfaces = new WeakMap();
const images = new Map();
const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
function ellipse(c, x, y, rx, ry, fill) { c.fillStyle = fill; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill(); }
function rect(c, x, y, w, h, fill, radius = 0) { c.fillStyle = fill; c.beginPath(); c.roundRect(x, y, w, h, radius); c.fill(); }
function line(c, x, y, xx, yy, color, width = 3) { c.strokeStyle = color; c.lineWidth = width; c.beginPath(); c.moveTo(x, y); c.lineTo(xx, yy); c.stroke(); }
function imageFor(source) {
  if (!source) return null;
  if (!images.has(source)) { const image = new Image(); image.src = source; images.set(source, image); if (images.size > 12) images.delete(images.keys().next().value); }
  return images.get(source);
}
export function drawHamster(c, profile, x, y, scale = 1, facing = 1, pose = {}) {
  c.save(); c.translate(x, y); c.scale(scale * facing, scale);
  const clock = pose.clock || 0;
  const bob = reduced ? 0 : Math.sin(clock * (pose.action === 'walk' ? 15 : 3)) * (pose.action === 'walk' ? 5 : 2);
  const move = MOVES[pose.action];
  const elapsed = move ? move.startup + move.active + move.recovery - pose.actionTime : 0;
  const extension = move ? Math.sin(Math.min(1, elapsed / (move.startup + move.active)) * Math.PI) : 0;
  const punching = ['punch','heavyPunch','lowPunch','airPunch'].includes(pose.action);
  const kicking = ['kick','lightKick','airKick','sweep'].includes(pose.action);
  const rising = pose.action === 'uppercut';
  const special = ['special','super'].includes(pose.action) && pose.actionTime > 0;
  const hurt = pose.action === 'hurt';
  c.translate(0, -bob);
  if (pose.down > 0) { c.translate(0,-30); c.rotate(-1.15); }
  else if (pose.crouching || ['sweep','lowPunch'].includes(pose.action)) c.scale(1.1,.70);
  else if (pose.y > 5) c.rotate(kicking ? -.20 : .10);
  if (pose.action === 'dash') { c.rotate(.15); c.translate(12,0); }
  if (hurt) c.rotate(-.1);
  if (profile.cosmetic === 'mint-aura') {
    c.shadowColor = '#b8ffc3'; c.shadowBlur = 25;
    c.strokeStyle = '#b8ffc3aa'; c.lineWidth = 3; c.beginPath(); c.ellipse(0, -80, 100, 110, 0, 0, Math.PI * 2); c.stroke(); c.shadowBlur = 0;
  }
  const image = imageFor(profile.portrait);
  if (image?.complete && image.naturalWidth) {
    const ratio = Math.min(200 / image.naturalWidth, 210 / image.naturalHeight);
    c.drawImage(image, -image.naturalWidth * ratio / 2, -image.naturalHeight * ratio, image.naturalWidth * ratio, image.naturalHeight * ratio);
  } else {
    const stride=pose.action==='walk'?Math.sin(clock*16)*17:pose.y>8?18:0;
    line(c,-20,-42,-30+stride,-12,profile.fur,20);line(c,19,-43,34-stride,-10,profile.fur,20);
    ellipse(c,-30+stride,-6,23,12,'#302333');ellipse(c,34-stride,-6,23,12,'#302333');
    rect(c,-49+stride,-12,38,10,profile.accent,4);rect(c,15-stride,-12,38,10,profile.accent,4);
    if (kicking) { c.save(); c.rotate(pose.action==='sweep'?.05:pose.action==='airKick'?-.6:-.3); const reach=60+extension*70;line(c,13,-35,reach,-34,profile.fur,25);ellipse(c,reach+9,-32,26,17,profile.accent);rect(c,reach-4,-43,36,9,'#fff2cf',4);c.restore(); }
    const body = c.createLinearGradient(-60, -160, 70, 0); body.addColorStop(0, '#f9ddb0'); body.addColorStop(.35, profile.fur); body.addColorStop(1, '#86604f');
    ellipse(c, 0, -73, 53, 64, '#332337'); ellipse(c, 0, -77, 49, 60, body);
    ellipse(c, -38, -153, 27, 30, '#332337'); ellipse(c, 38, -153, 27, 30, '#332337');
    ellipse(c, -38, -153, 23, 25, profile.fur); ellipse(c, 38, -153, 23, 25, profile.fur);
    ellipse(c, -38, -151, 13, 16, '#e898a2'); ellipse(c, 38, -151, 13, 16, '#e898a2');
    ellipse(c, 0, -115, 60, 54, body);
    ellipse(c, 0, -47, 40, 39, '#ffe9cc');
    ellipse(c, -23, -107, 7, 10, '#241d32'); ellipse(c, 24, -107, 7, 10, '#241d32');
    ellipse(c, -21, -110, 2.5, 3, '#fff'); ellipse(c, 26, -110, 2.5, 3, '#fff');
    ellipse(c, -34, -91, 13, 8, '#e89691'); ellipse(c, 35, -91, 13, 8, '#e89691');
    ellipse(c, 0, -91, 8, 5, '#86515a'); line(c, 0, -86, 0, -79, '#86515a', 2);
    c.strokeStyle = '#86515a'; c.lineWidth = 2; c.beginPath(); c.arc(-5, -79, 5, 0, Math.PI); c.arc(5, -79, 5, 0, Math.PI); c.stroke();
    rect(c, -59, -135, 118, 13, profile.accent, 5); rect(c, 44, -132, 34, 9, profile.accent, 3);
    rect(c, -47, -25, 94, 12, profile.accent, 4); rect(c, -8, -27, 18, 17, '#fff3ce', 3);
  }
  const armX = rising ? 35 : punching ? 55+extension*(pose.action==='heavyPunch'?87:65) : pose.action==='throw'?90:pose.block?32:56;
  const armY = rising ? -185 : punching ? pose.action==='lowPunch'?-48:-93 : pose.block?-118:-70;
  line(c, 40, -65, armX, armY, profile.fur, 22);
  ellipse(c, armX, armY, 26, 24, '#34233e'); ellipse(c, armX, armY - 2, 23, 21, profile.accent);
  ellipse(c, armX - 6, armY - 10, 8, 5, '#ffffff70');
  ellipse(c, -50, -60, 22, 22, '#34233e'); ellipse(c, -50, -62, 19, 19, profile.accent);
  if (move && extension>.3 && ['kick','heavyPunch','uppercut','airKick'].includes(pose.action)) {c.strokeStyle=profile.accent+'aa';c.lineWidth=7;c.beginPath();c.arc(45,-70,88,-1.4,1.0);c.stroke();}
  if (profile.cosmetic === 'crown') {
    c.fillStyle = '#ffe085'; c.beginPath(); c.moveTo(-30, -173); c.lineTo(-36, -207); c.lineTo(-13, -191); c.lineTo(0, -215); c.lineTo(14, -191); c.lineTo(36, -207); c.lineTo(29, -173); c.closePath(); c.fill();
  }
  if (special) { c.shadowColor = profile.accent; c.shadowBlur = 25; ellipse(c, 88, -74, 27, 27, profile.accent); c.shadowBlur = 0; }
  if (pose.block) { c.strokeStyle = '#b7d9ffb0'; c.lineWidth = 4; c.beginPath(); c.arc(5, -78, 91, -1.2, 1.2); c.stroke(); }
  c.restore();
}
function stage(c, time) {
  const sky = c.createLinearGradient(0, 0, 0, HEIGHT); sky.addColorStop(0, '#302239'); sky.addColorStop(.6, '#80546f'); sky.addColorStop(1, '#342b49');
  rect(c, 0, 0, WIDTH, HEIGHT, sky);
  const sun = c.createRadialGradient(600, 200, 10, 600, 200, 260); sun.addColorStop(0, '#f4b9a1'); sun.addColorStop(.58, '#e29a9f'); sun.addColorStop(1, '#b4829800');
  ellipse(c, 600, 200, 265, 265, sun); ellipse(c, 600, 200, 130, 130, '#f4bba9');
  for (let i = 0; i < 8; i++) rect(c, 460, 175 + i * 21, 280, 5 + i * 1.5, '#ad789044');
  c.fillStyle = '#4e425f'; c.beginPath(); c.moveTo(0, 325); c.lineTo(180, 180); c.lineTo(370, 350); c.lineTo(575, 255); c.lineTo(780, 365); c.lineTo(1030, 180); c.lineTo(1200, 330); c.lineTo(1200, 540); c.lineTo(0, 540); c.fill();
  for (let i = 0; i < 16; i++) {
    const x = i * 83 - 20, h = 30 + (i * 47 % 90);
    rect(c, x, 400 - h, 60, h, '#302e4b');
    for (let y = 415 - h; y < 390; y += 21) for (let xx = x + 10; xx < x + 50; xx += 19) rect(c, xx, y, 7, 9, '#e9c3a34c');
  }
  // Original lantern gate and little arcade storefronts.
  rect(c, 176, 145, 22, 350, '#382b43'); rect(c, 1002, 145, 22, 350, '#382b43');
  rect(c, 137, 140, 926, 24, '#2a233c', 7); rect(c, 161, 166, 878, 9, '#d1948e', 4);
  rect(c, 483, 140, 234, 75, '#27253b', 8); rect(c, 490, 147, 220, 61, '#4d3b51', 5);
  c.font = '900 29px monospace'; c.textAlign = 'center'; c.fillStyle = '#ffdbb5'; c.fillText('SQUEEK FIGHT CLUB', 600, 186);
  for (const x of [230, 970]) {
    line(c, x, 170, x, 220, '#e1b5ac', 3);
    const light = c.createRadialGradient(x, 258, 5, x, 258, 90); light.addColorStop(0, '#ffb98d45'); light.addColorStop(1, '#ffb98d00'); ellipse(c, x, 258, 90, 90, light);
    rect(c, x - 27, 222, 54, 73, '#f3b197', 20);
    for (let yy = 236; yy < 290; yy += 12) line(c, x - 23, yy, x + 23, yy, '#b96e74', 2);
    rect(c, x - 18, 215, 36, 8, '#312940', 2); rect(c, x - 18, 293, 36, 8, '#312940', 2);
  }
  const floor = c.createLinearGradient(0, 442, 0, HEIGHT); floor.addColorStop(0, '#6c5874'); floor.addColorStop(1, '#27273e');
  rect(c, 0, 443, WIDTH, HEIGHT - 443, floor);
  rect(c, 0, 443, WIDTH, 9, '#d1a7a2');
  for (let x = -WIDTH; x < WIDTH * 2; x += 160) line(c, 600 + (x - 600) * .45, 452, x, HEIGHT, '#a4849230', 2);
  for (const y of [480, 530, 610]) line(c, 0, y, WIDTH, y, '#c3a6a735', 2);
  c.save(); c.translate(600, 546); c.scale(1, .24); c.strokeStyle = '#e0c3b05c'; c.lineWidth = 4; c.beginPath(); c.arc(0, 0, 245, 0, Math.PI * 2); c.stroke(); c.font = '900 70px sans-serif'; c.fillStyle = '#e0c3b033'; c.fillText('SQUEEK', 0, 22); c.restore();
  if (!reduced) for (let i = 0; i < 12; i++) {
    const x = (i * 137 + time * 15) % 1260 - 30, y = (i * 59 + time * 8) % 380;
    c.save(); c.translate(x, y); c.rotate(time + i); ellipse(c, 0, 0, 5, 2, '#eac3c488'); c.restore();
  }
  rect(c, 0, HEIGHT - 30, WIDTH, 30, '#242238'); c.font = '11px monospace'; c.fillStyle = '#d3bdcd'; c.textAlign = 'left'; c.fillText('THE LANTERN DOJO', 25, HEIGHT - 11); c.textAlign = 'right'; c.fillText('ORIGINAL HAMSTER ARENA / 001', WIDTH - 25, HEIGHT - 11);
}
export function drawArena(canvas, state, profiles = PRESETS, clock = 0, options = {}) {
  if (!surfaces.has(canvas)) {const surface=document.createElement('canvas');surface.width=600;surface.height=325;surfaces.set(canvas,surface);}
  const surface=surfaces.get(canvas),c=surface.getContext('2d');
  if (!c) return;
  c.setTransform(.5,0,0,.5,0,0);
  c.clearRect(0, 0, WIDTH, HEIGHT); stage(c, clock);
  c.save();if(!reduced&&state?.shake)c.translate(Math.round(Math.sin(clock*140)*state.shake),0);
  const fighters = state?.fighters || [{ x: 350, y: 0, facing: 1 }, { x: 850, y: 0, facing: -1 }];
  for (let i = 0; i < 2; i++) {
    const f = fighters[i], profile = profiles[i] || PRESETS[i];
    ellipse(c, f.x, FLOOR + 3, Math.max(25, 82 - f.y * .1), 16, '#1c19354f');
    drawHamster(c, profile, f.x, FLOOR - f.y, 1.16, f.facing, { ...f, clock });
  }
  for (const p of state?.projectiles || []) {
    c.save(); c.shadowColor = profiles[p.owner].accent; c.shadowBlur = 25;
    ellipse(c, p.x, FLOOR - p.y, p.super?63:37, p.super?43:27, profiles[p.owner].accent); ellipse(c, p.x + p.dir * 8, FLOOR - p.y - 5, p.super?40:20, p.super?28:15, '#fff4d3');
    c.restore();
  }
  for (const e of state?.effects || []) {
    c.save(); c.translate(e.x, FLOOR - e.y); c.globalAlpha = Math.min(1, e.life * 6);
    c.strokeStyle = e.blocked ? '#b9deff' : '#fff0b0'; c.lineWidth = 4;
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; line(c, Math.cos(a) * 13, Math.sin(a) * 13, Math.cos(a) * 44, Math.sin(a) * 44, c.strokeStyle, 4); }
    c.font = '900 25px monospace'; c.fillStyle = e.blocked ? '#d3e9ff' : '#fff1c2'; c.textAlign = 'center'; c.fillText(e.blocked ? 'BLOCK' : `${e.kind||'HIT'} −${e.damage}`, 0, -45); c.restore();
  }
  c.restore();
  if (options.label) { c.font = '900 58px monospace'; c.textAlign = 'center'; c.fillStyle = '#781e35'; c.fillText(options.label, 603, 292); c.fillStyle = '#fff29a'; c.fillText(options.label, 600, 286); }
  const target=canvas.getContext('2d');target.imageSmoothingEnabled=false;target.clearRect(0,0,WIDTH,HEIGHT);target.drawImage(surface,0,0,WIDTH,HEIGHT);
}
