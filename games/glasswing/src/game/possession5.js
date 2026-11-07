import {emitSound} from '../core/sound.js';
import {B,edge} from '../core/input.js';
import {overlap,solid,tile,physics} from '../core/physics.js';
import {hurt,emit} from '../core/combat.js';
import {F} from '../data/feel.js';
import {FORMS5,huskRules} from '../data/forms5.js';
import {formDamage,endForm} from './possession.js';
import {POSSESSION as P} from '../data/forms.js';
import {movement} from './player.js';
import {bossParried} from './boss4.js';
import * as tallowForm from './form-tallowgrave.js';
import * as antiphonForm from './antiphon-form.js';
import * as anchoriteForm from './form-anchorite.js';
import * as bloomForm from './crowned-bloom.js';

// v5 forms with their own module, by form id: {tick, hurt, reset, blocked?} (its state lives in its own field on the
// hunter). Built on first use through the module namespaces (the modules import possession.js, which imports this
// file). A v5 form not listed here is the Husk.
let sims=null;
const SIMS=()=>sims||(sims={
 'tallowgrave-form':tallowForm.TALLOW_FORM,
 'antiphon-form':{tick:antiphonForm.tick,hurt:antiphonForm.formHurt,reset:antiphonForm.reset},
 'anchorite-form':{tick:anchoriteForm.tickAnchorite,hurt:anchoriteForm.hurtAnchorite,reset:anchoriteForm.resetAnchorite},
 'crowned-bloom':{tick:bloomForm.bloomTick,hurt:bloomForm.bloomHurt,reset:e=>{delete e.bloom;}}
});
const simOf=id=>SIMS()[id];

// Rules-v5 possession forms (M1-D): the Chrysalis Husk's four moves, its gum, shocks and debris, and Shell Shut's block.
// possession.js still owns the shift (become), the burst clock, the 3-hit shell and the boss limits (once per phase, the
// 12% budget, thresholds); its formTick dispatches here after those checks. All Husk state lives in e.husk, created on the
// first worn frame and removed when the form ends, so runs that never wear a v5 form carry none of it. No RNG is drawn.

// The gate (data/forms5.js): rules v5, or (until M1-A lands rules v5) a rules-4 run with the config key husk:true.
export {huskRules};
// v5 forms with their own module (tick, formHurt, reset); a form not listed here is the Husk.
const OWN={'antiphon-form':antiphonForm};

const box={x:0,y:0,w:0,h:0};
// Gum Spit uses projectile damage rules on bosses (half on the Chrysalis's amber); never retained, never parried
// (minor enemies cannot guard and v5 forms are not allowed in versus).
const gumHit={projectile:{reflected:false,unparryable:true,ivory:false,vx:0,hitIds:[]},stop:2,knock:0,impactX:0};
const hitOpts={stop:0,knock:0,impactX:0};
const bodies=new Map();
// The Lariat wind-up walks at a fraction of the form's speed.
const windBody=f=>{let b=bodies.get(f);if(!b){b={...f,speed:f.speed*f.moves.lariat.windSpeed};bodies.set(f,b);}return b;};

const fresh=()=>({move:null,stage:'',f:0,wind:0,power:0,spin:0,blocked:0,boss:0,lastBlock:-99,wallCd:0,gumCd:0,shutCd:0,crack:0,
 shocks:[],debris:[],globs:[]});
// The form ends (time, threshold, shell, death, respawn): its pending gum, shocks and debris go with it.
export function resetForm5(e){delete e.husk;const all=SIMS();for(const id in all)all[id].reset(e);}

// Shell Shut: while the shell is closed, every hit is blocked, cyan (unparryable) strikes and projectiles included.
// Called from combat.js hurt() before any guard or damage rule; true means the hit was absorbed.
export function formBlocked(s,target,source,opts){
 const own=simOf(target.form);if(own)return own.blocked?own.blocked(s,target,source,opts):false;
 const h=target.husk;
 if(!h||!FORMS5[target.form]||h.move!=='shut'||h.stage!=='shut')return false;
 // Strikes and shots only: the world's own costs (the Hall's fall, a sourceless hurt) still land on the shell.
 if(!opts?.projectile&&source?.id===undefined)return false;
 if(h.blocked<99)h.blocked++;
 if(source?.boss&&!source.dead)h.boss=source.id;
 // A sustained hit (the Wing Flail touches every frame) clanks once, then holds quietly.
 if(s.frame-h.lastBlock>=FORMS5[target.form].moves.shut.quiet){
  s.hitStop=Math.max(s.hitStop,F.hitStop);emitSound(s,'block');
  const x=opts?.impactX??source?.x??target.x;
  emit(s,target.x+Math.sign(x-target.x||target.facing)*target.w*.5,target.y+target.h*.55,opts?.unparryable||opts?.projectile?.unparryable?0x7fe8ff:0xf1ece2,10);
 }
 h.lastBlock=s.frame;
 return true;
}

// The Husk's shell takes half damage: a 1-mask hit cracks it, the second crack costs a plate (and half the burst cost
// each), so its 3 plates hold 6 hits; no flinch. A 2-mask strike still breaks the form (combat.js), as on every form.
export function formHurt5(s,e){
 const own=simOf(e.form);if(own)return own.hurt(s,e);
 const h=e.husk||(e.husk=fresh());
 e.hits=(e.hits||0)+1;e.inv=P.shellInv;e.flash=F.flash;
 h.crack=(h.crack||0)+1;
 if(h.crack>=2){h.crack=0;e.formShell--;}
 if(s.config.hall!=='trial')e.formTimer-=P.shellCost/2;
 s.hitStop=Math.max(s.hitStop,F.hitStop);emit(s,e.x,e.y+e.h*.7,0xf1ece2,10);emitSound(s,'block');
 if(e.formShell<=0||e.formTimer<=0)endForm(s,e,'shell');
 return 'hit';
}
function strike5(s,e,b,targets,damage,m,extra){
 const f=e.facing;
 box.x=e.x+f*(b.x0+b.x1)/2;box.w=b.x1-b.x0;box.y=e.y+b.y0;box.h=b.y1-b.y0;
 let landed=false;
 for(const t of targets){
  if(t.team===e.team||t.dead||e.hitIds.includes(t.id)||!overlap(box,t))continue;
  hitOpts.stop=m.stop;hitOpts.knock=m.knock;hitOpts.impactX=e.x;
  const result=hurt(s,t,e,damage,hitOpts);
  if(result!=='immune'){e.hitIds.push(t.id);landed=true;}
  if(result==='hit'&&!t.boss&&!t.dead){
   if(m.launch)t.vy=m.launch;
   if(extra)t.stun=Math.max(t.stun,extra);
  }
 }
 // Like every form, the Husk crushes the brittle walls it strikes.
 for(let y=Math.max(0,Math.floor(box.y));y<Math.min(s.level.grid.length,Math.ceil(box.y+box.h));y++)
  for(let x=Math.max(0,Math.floor(box.x-box.w/2));x<Math.min(s.level.width,Math.ceil(box.x+box.w/2));x++)
   if(s.level.grid[y][x]===4){s.level.grid[y][x]=0;s.levelRevision++;emit(s,x+.5,y+.5,0xa9d68a);}
 return landed;
}
function begin(s,e,h,id,m){
 h.move=id;h.f=0;e.attackId++;e.hitIds.length=0;
 if(id==='lariat'){h.stage='wind';h.wind=0;h.power=0;h.spin=0;}
 else if(id==='wall'){
  h.stage=e.grounded?'rise':'plunge';h.wallCd=m.cooldown;
  if(e.grounded){e.vy=m.leap;e.grounded=false;}
  emitSound(s,'dodge');
 }else if(id==='gum'){h.stage='spit';h.gumCd=m.cooldown;}
 else if(id==='shut'){h.stage='shut';h.blocked=0;h.boss=0;emitSound(s,'block');emit(s,e.x,e.y+e.h*.6,0xf1ece2,10);}
}
const done=h=>{h.move=null;h.stage='';h.f=0;};

function lariat(s,e,f,h,m,input,targets){
 if(h.stage==='wind'){
  if(input&B.attack){
   if(h.wind<m.wind)h.wind++;
   movement(e,input,s.level,windBody(f));e.clip='wind';
   return;
  }
  // Released: the spin, carrying the run and the wind-up as momentum.
  h.stage='spin';h.f=0;h.power=h.wind/m.wind;
  const cap=f.speed/F.hz+m.carry;
  e.vx=Math.max(-cap,Math.min(cap,e.vx+e.facing*m.carry*h.power));
  emitSound(s,'sword-swing');
 }
 const active=h.f>=m.startup&&h.f<m.startup+m.active;
 if(h.f>=m.startup+m.active)e.vx*=F.friction;
 physics(e,s.level);
 if(active&&strike5(s,e,m.box,targets,formDamage(e,m.damage+m.windDamage*h.power),m,0))emit(s,e.x,e.y+e.h*.5,0xffb347,6);
 // The spinning shell swats enemy shots out of the air inside its ring; cyan ones pass (only Shell Shut stops cyan).
 if(active)for(const o of s.projectiles){
  if(!o.active||o.team===e.team||o.unparryable||Math.abs(o.x-e.x)>m.box.x1+o.radius||o.y<e.y+m.box.y0||o.y>e.y+m.box.y1)continue;
  o.active=false;emit(s,o.x,o.y,0xffb347,5);emitSound(s,'blast-hit');
 }
 h.spin=Math.min(1,h.f/(m.startup+m.active));e.clip='spin';
 if(++h.f>=m.total)done(h);
}
function wall(s,e,f,h,m,targets){
 if(h.stage==='rise'){
  e.vx=e.facing*m.drift;physics(e,s.level);e.clip='leap';
  if(++h.f>=m.rise||e.vy<=0){h.stage='plunge';h.f=0;}
  return;
 }
 if(h.stage==='plunge'){
  e.vx=e.facing*m.drift;e.vy=m.plunge;physics(e,s.level);e.clip='plunge';
  if(!e.grounded){if(++h.f>=m.fall)done(h);return;}
  // The slam: a body strike, a shock along the floor both ways, and debris shaken down onto the enemies near you.
  e.vx=0;strike5(s,e,m.box,targets,formDamage(e,m.damage),m,m.stun);
  for(const dir of [1,-1])h.shocks.push({x:e.x+dir*e.w/2,y:e.y,dir,travel:0,ids:[]});
  let n=0;
  for(const t of targets){
   if(n>=m.debris.count)break;
   if(t.team===e.team||t.dead||Math.abs(t.x-e.x)>m.debris.range)continue;
   h.debris.push({x:t.x,y:Math.max(e.y,t.y)+t.h+m.debris.height,ids:[]});n++;
  }
  s.shake=F.shakeFrames*2;emit(s,e.x,e.y+.1,0xffb347,18);emitSound(s,'land');
  h.stage='recover';h.f=0;e.clip='slam';
  return;
 }
 e.vx*=F.friction;physics(e,s.level);e.clip='slam';
 if(++h.f>=m.recover)done(h);
}
function gum(s,e,h,m){
 e.vx*=F.friction;physics(e,s.level);e.clip='spit';
 if(h.f===m.startup){
  h.globs.push({x:e.x+e.facing*e.w/2,y:e.y+e.h*m.box.y,vx:e.facing*m.speed,travel:0});
  emitSound(s,'blast-fire');
 }
 if(++h.f>=m.total)done(h);
}
function shut(s,e,h,m,input,targets){
 if(h.stage==='shut'){
  e.vx*=F.friction;physics(e,s.level);e.clip='shut';
  if(++h.f<m.min||input&B.dodge&&h.f<m.hold)return;
  // The shell springs open: the counter-shove, harder for every hit it held.
  h.stage='counter';h.f=0;h.shutCd=m.cooldown;e.attackId++;e.hitIds.length=0;
  s.shake=F.shakeFrames;emit(s,e.x,e.y+e.h*.5,0xffb347,16);emitSound(s,'punch3');
  // A blocked boss strike still in progress is answered like a parry (the Old Glasswing opens, the cocoon is shoved).
  // Never in desperation: there a parry is the killing blow, and that one stays the hunter's own timing.
  const boss=h.boss?s.enemies.find(t=>t.id===h.boss):null;
  if(boss&&!boss.dead&&!boss.glass&&Math.abs(boss.x-e.x)<m.box.x1+boss.w/2)bossParried(s,boss,e);
  return;
 }
 e.vx*=F.friction;physics(e,s.level);e.clip='counter';
 if(h.f<m.counter)strike5(s,e,m.box,targets,formDamage(e,m.damage+m.bonus*Math.min(h.blocked,m.bonusMax)),m,m.stun);
 if(++h.f>=m.total)done(h);
}

// Gum on a struck target: minor enemies are rooted in amber (e.rootT; the stun holds them until the v5 AI reads the
// root itself); bosskit bosses (e.kit) are slowed 30% for 2 s (e.slowT, e.slow); the v4 bosses only take the damage.
export function stick(t,G=FORMS5['chrysalis-husk'].moves.gum){
 if(!t.boss){t.rootT=G.root;t.stun=Math.max(t.stun||0,G.root);t.vx=0;t.knockFrames=0;}
 else if(t.kit){t.slowT=G.slowFrames;t.slow=G.slow;}
}
// Gum globs, floor shocks and debris (in e.husk, drawn by render2d/husk.js); roots and boss slows count down.
function hazards(s,e,f,h,targets){
 const M=f.moves,G=M.gum,W=M.wall;
 for(let i=h.globs.length-1;i>=0;i--){
  const g=h.globs[i];g.x+=g.vx;g.travel+=Math.abs(g.vx);
  let gone=solid(tile(s.level,Math.floor(g.x),Math.floor(g.y)))||g.travel>G.range;
  if(!gone)for(const t of targets){
   if(t.team===e.team||t.dead||Math.abs(g.x-t.x)>t.w/2+G.box.r||g.y+G.box.r<t.y||g.y-G.box.r>t.y+t.h)continue;
   gumHit.impactX=g.x-g.vx;
   const result=hurt(s,t,e,formDamage(e,G.damage),gumHit);
   if(result==='immune')continue;
   if(result==='hit'&&!t.dead)stick(t,G);
   emit(s,g.x,g.y,0xffb347,6);emitSound(s,'blast-hit');gone=true;break;
  }
  if(gone){if(g.travel<=G.range)emit(s,g.x,g.y,0xffb347,4);h.globs.splice(i,1);}
 }
 for(let i=h.shocks.length-1;i>=0;i--){
  const k=h.shocks[i],w=W.shock;k.x+=k.dir*w.speed;k.travel+=w.speed;
  // The shock runs along the floor: a wall stops it, and so does the edge of a gap (no floor tile under it).
  const under=tile(s.level,Math.floor(k.x),Math.floor(k.y-.5));
  if(k.travel>w.range||solid(tile(s.level,Math.floor(k.x),Math.floor(k.y+.5)))||!solid(under)&&under!==2&&under!==3){h.shocks.splice(i,1);continue;}
  for(const t of targets){
   if(t.team===e.team||t.dead||k.ids.includes(t.id)||Math.abs(t.x-k.x)>t.w/2+w.radius||t.y>k.y+w.h||t.y+t.h<k.y)continue;
   hitOpts.stop=2;hitOpts.knock=.6;hitOpts.impactX=k.x-k.dir;
   if(hurt(s,t,e,formDamage(e,w.damage),hitOpts)!=='immune')k.ids.push(t.id);
  }
 }
 for(let i=h.debris.length-1;i>=0;i--){
  const d=h.debris[i],w=W.debris;d.y+=w.speed;
  if(solid(tile(s.level,Math.floor(d.x),Math.floor(d.y)))||d.y<-2){emit(s,d.x,d.y+.3,0xf1ece2,4);h.debris.splice(i,1);continue;}
  for(const t of targets){
   if(t.team===e.team||t.dead||d.ids.includes(t.id)||Math.abs(t.x-d.x)>t.w/2+w.radius||d.y-w.radius>t.y+t.h||d.y+w.radius<t.y)continue;
   hitOpts.stop=2;hitOpts.knock=.4;hitOpts.impactX=d.x;
   if(hurt(s,t,e,formDamage(e,w.damage),hitOpts)!=='immune')d.ids.push(t.id);
  }
 }
 // Roots and slows count down once per frame, by the first hunter wearing a Husk (two in co-op never double it).
 if(s.players.find(q=>q.husk)===e)for(const t of s.enemies){if(t.rootT>0)t.rootT--;if(t.slowT>0)t.slowT--;}
}

// One worn frame of a v5 form, after possession.js's burst clock and boss-limit checks.
export function tick5(s,e,input,targets){
 const own=simOf(e.form);if(own)return own.tick(s,e,input,targets);
 const f=FORMS5[e.form],M=f.moves,h=e.husk||(e.husk=fresh());
 if(h.wallCd>0)h.wallCd--;
 if(h.gumCd>0)h.gumCd--;
 if(h.shutCd>0)h.shutCd--;
 e.blocking=false;e.dodge=0;e.charge=0;e.move=null;
 if(!h.move){
  // A move starts facing the held direction, so the form can turn and strike on the same frame.
  const axis=Number(!!(input&B.right))-Number(!!(input&B.left));
  if(axis&&(input&(B.attack|B.sword|B.blast|B.dodge|B.possess)&~e.prev))e.facing=axis;
  if(edge(input,e.prev,B.dodge)&&!h.shutCd)begin(s,e,h,'shut',M.shut);
  else if((edge(input,e.prev,B.blast)||edge(input,e.prev,B.possess))&&!h.gumCd)begin(s,e,h,'gum',M.gum);
  else if(edge(input,e.prev,B.sword)&&!h.wallCd)begin(s,e,h,'wall',M.wall);
  else if(edge(input,e.prev,B.attack))begin(s,e,h,'lariat',M.lariat);
 }
 if(h.move==='lariat')lariat(s,e,f,h,M.lariat,input,targets);
 else if(h.move==='wall')wall(s,e,f,h,M.wall,targets);
 else if(h.move==='gum')gum(s,e,h,M.gum);
 else if(h.move==='shut')shut(s,e,h,M.shut,input,targets);
 else movement(e,input,s.level,f);
 // A move can end the form (a strike that crosses a boss threshold is checked next frame by possession.js).
 if(e.husk)hazards(s,e,f,h,targets);
}
