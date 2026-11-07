import {emitSound} from '../core/sound.js';
import {entity} from '../core/entity.js';
import {random} from '../core/rng.js';
import {overlap} from '../core/physics.js';
import {hurt,fire,emit} from '../core/combat.js';
import {CHRYSALIS as C} from '../data/chrysalis.js';
import {TIERS} from '../data/rules.js';
import {F} from '../data/feel.js';
import {glassMultiplier} from './moults.js';
import {gainEmber} from './possession.js';
import {EMBER,POSSESSION} from '../data/forms.js';
import {mendReply,mendGap,mending} from './mend.js';
import {MEND_REPLY} from '../data/mend.js';
import {fair,swingHit,shellHit,unreel} from './fair.js';

// Rules-v4 Old Glasswing, the Unborn Chrysalis: a cocoon on a live integer pendulum. A parry at the bottom of the swing
// shoves it (with the swing: one rung up; against it: one rung down); at the ledge rung its amber seam faces out at the
// apex beside a hunter on that ledge (50-60f, at most every 12 s). Armour elsewhere takes capped chip, as the M3 boss.
const M=C.moves,cx=C.anchor[0],ay=C.anchor[1];
// Integer sine (Bhaskara I) of millidegrees, x4096: the same on every engine.
export function sinQ(a){
 const d=Math.abs(a)%360000,h=d>180000?d-180000:d,p=h*(180000-h),v=Math.floor(4*p*4096/(40500000000-p));
 return (a<0)!==(d>180000)?-v:v;
}
const cosQ=a=>sinQ(90000-Math.abs(a));
function isqrt(n){let r=Math.floor(Math.sqrt(n));while(r*r>n)r--;while((r+1)*(r+1)<=n)r++;return r;}
// Twice the potential energy at an angle, in the integrator's units (57296 millidegrees per radian).
const pot2=a=>Math.floor(2*C.gravity*57296*(4096-cosQ(a))/4096);
const E2=C.rungs.map(pot2);
export function asinQ(v){let lo=0,hi=90000;const t=Math.abs(v);while(lo<hi){const m=(lo+hi+1)>>1;if(sinQ(m)<=t)lo=m;else hi=m-1;}return v<0?-lo:lo;}
const roll=(s,[a,b])=>a+Math.floor(random(s)*(b-a+1));
const tier=e=>e.glass?3:e.phase-1;
const minRung=e=>e.phase===3?1:0;
const box={x:0,y:0,w:0,h:0};
// Rules v5 (the Hub, the Hall and every new run): the rules-4 fairness fixes (src/game/fair.js) are always on, and a Wing
// Flail never follows a Wing Flail before a dodge spent on the first is back (C.fair5). Rules-4 configs are unchanged.
export const chrysalisFair=s=>fair(s)||s.config.rulesVersion>=5;

// The Gullet: a taller shaft (16 rows) over the Nest arena, two mid ledges; idempotent so a retry restores it.
export function gullet(level){
 const w=level.width;
 while(level.grid.length<C.rows)level.grid.push(Array(w).fill(0));
 for(let y=1;y<level.grid.length;y++)for(let x=Math.floor(C.arenaLeft);x<Math.min(w,C.right);x++)level.grid[y][x]=0;
 for(const l of C.ledges)for(let x=l.x0;x<l.x1;x++)level.grid[l.row][x]=2;
 level.gullet=true;
 return level;
}
function collapse(s,e){
 const l=C.ledges[0],b=C.broken;
 for(let x=l.x0;x<l.x1;x++){s.level.grid[l.row][x]=0;emit(s,x+.5,l.row+.5,0xf1ece2,6);}
 for(let x=b.x0;x<b.x1;x++)s.level.grid[b.row][x]=2;
 s.levelRevision++;e.collapsed=true;emitSound(s,'mask-shatter');
}

export function spawnChrysalis(s){
 const e=entity(s.nextId++,'brawler',cx,ay,2,s.config.difficulty);
 const hp=Math.round(C.hp*(s.config.mode==='coop'?C.coopHP:1)*TIERS[s.config.difficulty].hp),long=!s.config.introSeen&&!s.bossAttempts;
 Object.assign(e,{
  boss:true,v4:true,chrysalis:true,phase:1,hp,maxMask:hp,mask:hp,eye:'#19B8A6',w:C.shell.w,h:C.shell.h,
  ai:'enter',aiTimer:long?C.intro:C.entrance,aiFrames:long?C.intro:C.entrance,intro:long,
  ang:C.rungs[0],om:0,rung:0,cord:C.cord,bx:cx,by:ay-C.cord,idle:0,lip:0,act:null,queue:[],history:[],seen:[],gap:0,
  open:0,openDamage:0,openKind:'',openSide:0,sinceOpen:C.openGap,sinceClap:C.clapGap,riposte:false,
  chip:hp*C.chipCap,chipTimer:C.chipWindow,far:0,still:0,desperate:0,despMax:C.desperation,revealed:false,
  falls:[],globs:[],strands:[],wires:[],reel:null,frayed:false,cut:false,collapsed:false,spin:0,
  attempt:s.bossAttempts||0,stats:{frames:0,threat:0,openings:0,maxOpen:0,shoves:0,start:s.frame}
 });
 place(e);
 s.enemies.push(e);s.bossStarted=true;s.checkpoint=C.door;emitSound(s,'boss-roar');
 return e;
}
function place(e){
 const sn=sinQ(e.ang),cs=cosQ(e.ang);
 e.bx=cx+e.cord*sn/4096;e.by=ay-e.cord*cs/4096;
 e.x=e.bx;e.y=e.by-e.h/2;
 if(e.om)e.facing=e.om<0?-1:1;
}
// One symplectic step; returns 1 when the bob crossed the bottom, 2 at an apex.
export function step(e){
 const a=e.ang,o=e.om;
 e.om-=Math.trunc(C.gravity*sinQ(e.ang)/4096);e.ang+=e.om;
 return (a!==0&&(a<0)!==(e.ang<0)||e.ang===0&&a!==0?1:0)|(o!==0&&(o<0)!==(e.om<0)||e.om===0&&o!==0?2:0);
}
// Speed for the current rung at the current angle (energy kept exact; a damp below the height reverses it).
function energize(e){
 const v=isqrt(Math.max(0,E2[e.rung]-pot2(e.ang))),d=e.om?Math.sign(e.om):-Math.sign(e.ang)||1;
 e.om=d*v;
}
// The swing eases toward its rung's energy (a shove, a self-pump or a decay never jerks it).
export function ease(e){
 const p=pot2(e.ang),c=e.om*e.om+p,t=E2[e.rung];
 // Above the rung's apex height it only falls: braking there would park the shell high on the wall.
 if(c===t||c>t&&p>=t)return;
 const v=isqrt(Math.max(0,c+Math.trunc((t-c)/8)-p));
 e.om=e.om<0?-v:e.om>0?v:0;
}
// Frames until the next apex, on a copy (the dust tell before a Wall Strike).
export function ahead(e){
 const c={ang:e.ang,om:e.om};let n=0;
 while(n<240){n++;if(step(c)&2)break;}
 return n;
}

function bottomPass(s,e){
 if(e.shoved)e.idle=0;else if(++e.idle>=C.decay&&e.rung>minRung(e)&&e.rung<C.wallRung){e.rung--;e.idle=0;}
 e.shoved=false;
 if(e.rung<minRung(e))e.rung=minRung(e);
 // Over-pumped (or self-pumped): the shell will slam the wall at the coming apex; dust trickles before.
 if(e.rung>=C.wallRung&&e.om*e.om>=E2[C.wallRung]*.85){
  const n=ahead(e),side=Math.sign(e.om),wx=side<0?C.arenaLeft:C.right;
  for(let i=0;i<M.wall.falls;i++)e.falls.push({x:wx-side*(.6+random(s)*(M.wall.third-1)),t:n+M.wall.warn-8+i*5});
  emitSound(s,'enemy-telegraph');
 }
}
function ledgeHunter(s,side){
 for(const p of s.players)if(!p.dead&&p.grounded&&p.y>=2.9&&(side<0?p.x<C.ledges[0].x1+.2:p.x>C.ledges[1].x0-.2))return true;
 return false;
}
function apex(s,e){
 e.hitIds.length=0;
 const side=Math.sign(e.ang);
 if(e.rung>=C.wallRung&&Math.abs(e.ang)>=C.rungs[C.wallRung]-3000){wallStrike(s,e,side);return;}
 // A rules-v5 reach (C.fair5.camp) pumps on the far side, so the slam lands on the camped wall.
 if(e.act?.id==='wall'&&e.act.stage==='pump'&&!(e.act.toward&&side===e.act.toward)){e.rung=C.wallRung;e.act.stage='swing';emitSound(s,'enemy-telegraph');return;}
 if(e.act?.id==='wall'&&e.act.stage==='swing')endAct(s,e);
 if(e.rung===C.ledgeRung&&e.sinceOpen>=C.openGap&&!e.glass&&ledgeHunter(s,side))openUp(s,e,'apex',C.apexOpen[e.phase-1],side);
}
function wallStrike(s,e,side){
 const wx=side<0?C.arenaLeft:C.right;
 s.shake=F.shakeFrames*3;emitSound(s,'boss-roar');emit(s,wx,e.by,0xf1ece2,20);
 for(const p of s.players)if(!p.dead&&Math.abs(p.x-wx)<M.wall.shock)hurt(s,p,e,1,{unparryable:true,impactX:wx});
 if(e.ai==='transition'&&side<0&&!e.collapsed)collapse(s,e);
 e.rung=e.ai==='transition'?C.wallRung:1;
 if(e.act?.id==='wall')endAct(s,e);
}

function openUp(s,e,kind,frames,side){
 e.ai='open';e.aiTimer=e.aiFrames=e.open=frames;e.openKind=kind;e.openSide=side;e.openDamage=0;e.om=0;
 if(kind==='clap')e.sinceClap=0;else e.sinceOpen=0;
 // The amber seam (or the soft form) is a hurtbox wider than the shell: hitboxes never follow the art.
 e.w=(e.cut?C.creature.w:C.shell.w)+C.reach*2;
 e.act=null;e.queue.length=0;e.lip=0;e.unparryable=false;e.clip='hit';e.stats.openings++;
 emit(s,e.x+side*e.w/4,e.y+e.h*.55,0xffb347,14);emitSound(s,'block');
}
function closeOpening(s,e){
 e.stats.maxOpen=Math.max(e.stats.maxOpen,e.openDamage/e.maxMask);
 e.open=0;e.riposte=false;e.w=e.cut?C.creature.w:C.shell.w;e.clip='idle';
 e.gap=roll(s,C.neutral[tier(e)]);
 if(e.openKind==='crack'){e.ai='reel';e.reel.stage='rise';e.reel.t=e.reel.frames=30;return;}
 e.ai='swing';
 // After an apex opening the shell violently damps itself back to rest.
 if(e.openKind==='apex'){e.rung=minRung(e);emit(s,e.x,e.y+e.h,0xf1ece2,12);s.shake=F.shakeFrames;}
 energize(e);
}
export function chrysalisParried(s,e,p){
 if(e.dead||e.ai!=='swing')return;
 if(e.glass){defeat(s,e,p);return;}
 // The shove: only at the bottom of the swing; with the travel pumps a rung, against it damps one.
 if(Math.abs(e.bx-cx)>C.bottom||e.shoved)return;
 const travel=Math.sign(e.om)||p.facing;
 e.rung=p.facing===travel?Math.min(C.wallRung,e.rung+1):Math.max(minRung(e),e.rung-1);
 e.shoved=true;e.idle=0;e.stats.shoves++;
 emit(s,e.x-travel*e.w/2,e.y+1,0xffffff,12);
 // P3: a parried Half-Shell Clap exposes the soft form (at most once every 10 s).
 if(e.phase===3&&e.sinceClap>=C.clapGap)openUp(s,e,'clap',C.clapOpen,0);
}
function defeat(s,e,source){
 e.hp=0;e.mask=0;e.dead=true;e.defeatedFrame=s.frame;e.clip='beaten';e.vx=0;e.vy=0;e.ai='spent';
 if(source&&source.team!==2&&source.kills!==undefined)source.kills++;
 emit(s,e.x,e.y+2,0xffb347,30);emitSound(s,'enemy-beaten');
}
function transition(s,e){
 e.open=0;e.riposte=false;e.phase++;e.ai='transition';e.aiTimer=e.aiFrames=C.transition;e.clip='summon';
 e.act=null;e.queue.length=0;e.w=e.cut?C.creature.w:C.shell.w;e.lip=0;
 s.shake=F.shakeFrames*3;emit(s,e.x,e.y+e.h,0xf1ece2,24);emitSound(s,'boss-roar');
 // P2: the cord frays and the shell swings itself to the walls until the left ledge comes down.
 if(e.phase===2){e.frayed=true;e.rung=C.wallRung;e.spin=1;if(chrysalisFair(s))unreel(e);}
 // P3: the cord snaps and the shell falls.
 else{e.reel={stage:'snap',t:0,x:e.x,y:e.y};e.om=0;}
}
function desperation(s,e){
 e.open=0;e.riposte=false;e.glass=true;e.desperate=C.desperation;e.hp=0;e.mask=0;e.act=null;e.queue.length=0;
 e.ai='swing';e.rung=1;e.w=C.creature.w;e.gap=C.neutral[3][0];energize(e);
 s.hitStop=F.swordStop;emit(s,e.x,e.y+e.h*.8,0xf1ece2,24);emitSound(s,'mask-shatter');
}
// Damage rules: the open seam (or soft form) is amber, x1.5 up to the 10% cap; the ivory shell takes capped chip;
// the entrance, transitions and the desperation clank.
export function chrysalisHurt(s,e,source,damage,projectile){
 if(e.ai==='spent'){e.hp=0;e.mask=0;e.dead=true;emit(s,e.x,e.y+2,0xffb347,30);return 'hit';}
 const clank=e.ai==='enter'||e.ai==='transition'||e.glass||e.ai==='reel'&&e.reel.stage!=='settle';
 let take=0;
 const amber=!clank&&e.ai==='open';
 if(amber){
  let d=damage*C.amber*(projectile?.5:1);
  take=Math.min(d,Math.max(0,e.maxMask*C.cap-e.openDamage));
  if(source.form&&source.formBudget>=0)take=Math.min(take,source.formBudget);
  e.openDamage+=take;
  if(source.forms)gainEmber(s,source,EMBER.hit);
 }else if(!clank){
  const raw=source.glass&&source.upgrades?damage/glassMultiplier(source):damage;
  if(source.form&&source.formBudget>=0){
   take=Math.min(raw*C.chip*(projectile?.5:1),e.chip+(e.formChip||0),source.formBudget);
   const base=Math.min(take,e.chip);e.chip-=base;if(take>base)e.formChip-=take-base;
  }else{take=Math.min(raw*C.chip*(projectile?.5:1),e.chip);e.chip-=take;}
 }
 if(source.form&&source.formBudget>=0)source.formBudget=Math.max(0,source.formBudget-take);
 const floor=e.phase<3?e.maxMask*C.thresholds[e.phase-1]:0;
 e.hp=Math.max(floor,e.hp-take);e.mask=e.hp;e.flash=F.flash;
 s.hitStop=Math.max(s.hitStop,amber?F.swordStop:F.hitStop);
 emit(s,source.x+(e.x-source.x)*.5,(source.y||e.y)+1,amber?0xffb347:clank?0x7fe8ff:0xf1ece2,amber?8:4);
 if(amber)s.shake=F.shakeFrames;
 if(clank){emitSound(s,'block');return 'hit';}
 if(e.hp<=floor){if(e.phase<3)transition(s,e);else desperation(s,e);}
 else if(amber&&e.openDamage>=e.maxMask*C.cap-1e-9){emit(s,e.x,e.y+e.h*.55,0x5c5650,10);closeOpening(s,e);if(source.forms)gainEmber(s,source,EMBER.cap);}
 return 'hit';
}

// The swinging body: one hit per hunter per half-swing. Any facing can guard it, so a hunter can shove with the swing.
function sweep(s,e){
 const d=e.glass?C.despDamage:1;
 for(const p of s.players){
  if(p.dead||e.hitIds.includes(p.id)||!(chrysalisFair(s)?swingHit(e,p,overlap(e,p)):overlap(e,p)))continue;
  const r=hurt(s,p,e,d,{stop:F.swordStop,impactX:p.blocking?p.x+p.facing:e.x});
  if(r!=='immune')e.hitIds.push(p.id);
  if(e.dead||e.ai!=='swing'&&e.ai!=='transition')return;
 }
}
function allowed(e,id){
 const h=e.history,n=h.length;
 return !(h[n-1]===id&&h[n-2]===id)&&!(n>=3&&h[n-3]===h[n-1]&&h[n-2]===id);
}
function choose(s,e,t){
 const list=C.patterns[tier(e)];
 let pick=null;
 // Rules v5: the unborn (P3 and its desperation) answers a hunter camped out of its reach with a Wall Strike on that
 // wall, so no corner waits the unfolding out (C.fair5.camp).
 if(e.camp>=C.fair5.camp.frames[e.glass?1:0]){
  e.camp=0;e.reach=Math.sign(t.x-cx)||1;e.history.push('reach');if(e.history.length>3)e.history.shift();
  e.queue=['wall'];e.gap=0;return;
 }
 // Range and turtling are answered by spit (P1-P2) or the flail (P3); a Mend by its reply (src/game/mend.js).
 const reply=mendReply(s,'chrysalis',tier(e));
 if(reply)pick=list.find(p=>p.id===reply)||null;
 else if(e.far>=C.antiRange.frames||e.still>=C.antiTurtle)pick=list.find(p=>p.m[0]==='gum'||p.m[0]==='flail');
 if(pick&&!allowed(e,pick.id))pick=null;
 if(!pick){
  let total=0;for(const p of list)if(allowed(e,p.id))total+=p.w;
  let r=random(s)*total;
  for(const p of list){if(!allowed(e,p.id))continue;r-=p.w;if(r<0){pick=p;break;}}
  pick=pick||list[0];
 }
 e.far=0;e.still=0;
 e.history.push(pick.id);if(e.history.length>3)e.history.shift();
 e.queue=[...pick.m];
 e.gap=pick.m.length?0:roll(s,C.neutral[tier(e)])*2;
}
function tellFrames(s,e,id){
 const tr=tier(e),tight=TIERS[s.config.difficulty].tight;
 let tells=C.tells[tr<3?Math.min(2,tr+tight):3];
 if(tr<3&&!e.seen.includes(id)){tells=C.tells[tight];e.seen.push(id);}
 return Math.round(roll(s,tells)*TIERS[s.config.difficulty].tell);
}
function start(s,e,t,id){
 let frames=tellFrames(s,e,id);
 // Rules v5: the burst of a second Wing Flail waits for the dodge (F.dodgeCooldown) spent under the first; the ring
 // simply stays up longer (a 'flail2' or the desperation frenzy otherwise came 44-50f after the last burst).
 if(id==='flail'&&chrysalisFair(s)){
  // Rules v5: the Wing Flail's ring stays up long enough to react to, then time a dodge through (C.fair5.flailTell).
  frames=Math.max(frames,roll(s,C.fair5.flailTell[e.glass?1:0]));
  if(e.flailAt!==undefined)frames=Math.max(frames,e.flailAt+C.fair5.flailSpacing-s.frame);
 }
 e.act={id,stage:id==='wall'?'pump':id==='reel'?'wait':'tell',t:id==='reel'?0:frames,frames,x:t.x};
 if(id==='wall'&&e.reach){e.act.toward=e.reach;e.reach=0;}
 e.unparryable=true;
 emitSound(s,'enemy-telegraph');
 // Corkscrew: the shell twists; its gum tripwires show faint for the whole tell, then set.
 if(id==='corkscrew'){
  const k=M.corkscrew,clamp=x=>Math.max(C.arenaLeft,Math.min(C.right,x));
  e.spin=1;
  // Two low threads either side of the hunter (jump them) and, on the floor, one overhead (no straight jump out).
  e.wires.push({x0:clamp(t.x+k.gap),x1:clamp(t.x+k.gap+k.length),y:k.low,t:k.life,warn:frames},
   {x0:clamp(t.x-k.gap-k.length),x1:clamp(t.x-k.gap),y:k.low,t:k.life,warn:frames});
  if(t.y<1.5)e.wires.push({x0:clamp(t.x-1.2),x1:clamp(t.x+1.2),y:k.high,t:k.life,warn:frames});
 }
}
function endAct(s,e){e.act=null;e.unparryable=false;if(!e.queue.length)e.gap=roll(s,C.neutral[tier(e)]);else e.gap=C.neutral[tier(e)][0]>>1;}
function actTick(s,e,t){
 const a=e.act;
 if(a.stage==='pump'||a.stage==='swing'||a.stage==='wait')return;
 if(a.stage==='tell'){
  a.x=a.t>a.frames/2?t.x:a.x;
  if(--a.t>0)return;
  if(a.id==='gum'){
   const g=M.gum,x0=e.x,y0=e.y+e.h*.45;
   for(let i=0;i<g.globs;i++){
    const tx=Math.max(C.arenaLeft+.5,Math.min(C.right-.5,a.x+(i-1)*g.spread)),T=g.flight+i*4;
    e.globs.push({x:x0,y:y0,vx:(tx-x0)/T,vy:(1-y0)/T+g.gravity*T/2,age:0});
   }
   emitSound(s,'blast-fire');endAct(s,e);
  }else if(a.id==='corkscrew'){e.spin=0;endAct(s,e);}
  else if(a.id==='flail'){a.stage='active';a.t=M.flail.active;if(chrysalisFair(s))e.flailAt=s.frame;emit(s,e.x,e.y+e.h*.5,0x7fe8ff,16);emitSound(s,'rush');}
  return;
 }
 if(a.stage==='active'){
  // Wing Flail: crumpled wings beat out cyan scale dust around the creature (never parryable).
  const r=M.flail.radius,mx=e.x,my=e.y+e.h*.5;
  for(const p of s.players){
   const dx=Math.max(Math.abs(p.x-mx)-p.w/2,0),dy=my<p.y?p.y-my:my>p.y+p.h?my-(p.y+p.h):0;
   if(!p.dead&&dx*dx+dy*dy<r*r)hurt(s,p,e,e.glass?C.despDamage:1,{unparryable:true,impactX:mx});
  }
  if(--a.t<=0){a.stage='after';a.t=M.flail.after;}
  return;
 }
 if(a.stage==='after'&&--a.t<=0)endAct(s,e);
}
function moves(s,e,t){
 if(e.act){actTick(s,e,t);return;}
 if(e.gap>0){e.gap=mendGap(s,'chrysalis',e.gap)-1;return;}
 if(e.queue.length){start(s,e,t,e.queue.shift());return;}
 choose(s,e,t);
}

// Drop-Reel: the cord creaks, the shell rises out of view, its shadow sways after the hunter, it drops and bounces.
// A dodge inside the last 12f of the fall, close by, cracks it open for 50f (at most every 12 s).
function reelTick(s,e,t){
 const r=e.reel,k=M.reel;
 r.t--;
 // Mend runs: a reel that creaks over a mending hunter hunts them across the whole Gullet (src/data/mend.js).
 if(r.stage==='creak'&&r.mend===undefined&&s.players.some(mending))r.mend=true;
 if(r.stage==='creak'){e.clip='telegraph';e.x=r.x+(r.t%4<2?.04:-.04);if(r.t<=0){r.stage='lift';r.t=r.frames=k.lift;}}
 else if(r.stage==='lift'){const q=1-r.t/r.frames;e.y=r.y+(k.top+3-r.y)*q*q;e.x=r.x;if(r.t<=0){r.stage='sway';r.t=r.frames=k.sway;}}
 else if(r.stage==='sway'){const h=r.mend?MEND_REPLY.chrysalis:null,sh=h?h.shadow:k.shadow,reach=h?h.reach:6;
  r.x+=Math.max(-sh,Math.min(sh,t.x-r.x));r.x=Math.max(cx-reach,Math.min(cx+reach,r.x));e.x=r.x;if(r.t<=0){r.stage='fall';r.t=r.frames=k.fall;r.dodged=false;}}
 else if(r.stage==='fall'){
  const q=1-r.t/r.frames;e.y=k.top-(k.top-1)*q*q;
  for(const p of s.players)if(!p.dead&&p.dodge>0&&r.t<C.dodgeLate&&Math.abs(p.x-e.x)<e.w/2+1.6)r.dodged=true;
  if(r.t<=0){
   e.y=1;s.shake=F.shakeFrames*3;emit(s,e.x,1,0xf1ece2,24);emitSound(s,'land');
   for(const p of s.players)if(!p.dead&&(chrysalisFair(s)?shellHit(e,p,0):overlap(e,p)))hurt(s,p,e,1,{unparryable:true,impactX:e.x});
   r.stage='bounce';r.t=r.frames=k.bounce;
  }
 }else if(r.stage==='bounce'){
  const q=1-r.t/r.frames;e.y=1+4*1.1*q*(1-q);
  if(r.t<=0){e.y=1;if(r.dodged&&e.sinceOpen>=C.openGap&&!e.glass)openUp(s,e,'crack',C.crack,0);else{r.stage='settle';r.t=r.frames=k.settle;}}
 }else if(r.stage==='settle'){if(r.t<=0){r.stage='rise';r.t=r.frames=30;}}
 else if(r.stage==='rise'){
  if(r.t===r.frames-1){r.ang=Math.max(-C.rungs[1],Math.min(C.rungs[1],asinQ(Math.round((e.x-cx)/e.cord*4096))));r.x=e.x;r.y=e.y;}
  const sn=sinQ(r.ang),q=1-r.t/r.frames,tx=cx+e.cord*sn/4096,ty=ay-e.cord*cosQ(r.ang)/4096-e.h/2;
  e.x=r.x+(tx-r.x)*q;e.y=r.y+(ty-r.y)*q;
  if(r.t<=0){e.ang=r.ang;e.om=0;e.rung=Math.abs(r.ang)>C.rungs[0]?1:minRung(e);e.ai='swing';e.reel=null;place(e);energize(e);e.hitIds.length=0;e.gap=roll(s,C.neutral[tier(e)]);}
 }
}
// P3 transition: the snapped shell falls and splits; the unborn crawls out and takes the cord stump.
function snapTick(s,e){
 const r=e.reel,T=C.transition;r.t++;
 if(r.t<=30){const q=r.t/30;e.y=r.y+(1-r.y)*q*q;}
 if(r.t===30){
  e.cut=true;e.y=1;e.w=C.creature.w;e.h=C.creature.h;s.shake=F.shakeFrames*3;emit(s,e.x,1.5,0xf1ece2,30);emitSound(s,'mask-shatter');
  for(const dir of [1,-1]){
   const orb=fire(s,e,false,true);
   if(orb){orb.x=e.x+dir*1.2;orb.y=C.wave.y;orb.radius=C.wave.radius;orb.range=C.wave.range;orb.vx=dir*C.wave.speed;orb.unparryable=true;orb.damage=1;}
  }
 }
 if(r.t>T-40){
  if(r.t===T-39){r.x=e.x;r.y0=e.y;}
  const q=(r.t-(T-40))/40,ty=ay-e.cord-e.h/2;
  e.x=r.x+(cx-r.x)*q;e.y=r.y0+(ty-r.y0)*q;
 }
 e.clip=r.t<30?'hit':r.t<T-40?'summon':'idle';
 if(--e.aiTimer<=0){e.ang=0;e.om=0;e.rung=1;e.reel=null;place(e);energize(e);e.ai='swing';e.hitIds.length=0;e.gap=roll(s,C.neutral[2]);}
}

const across=(w,x,y,p)=>y<w.y&&y+p.h>w.y&&x+p.w/2>w.x0&&x-p.w/2<w.x1;
function hazards(s,e){
 for(let i=e.falls.length-1;i>=0;i--){
  const f=e.falls[i];
  if(f.t<=M.wall.warn&&f.t%6===0)emit(s,f.x,C.debris.y-.4,0xf1ece2,2);
  if(--f.t>0)continue;
  e.falls.splice(i,1);
  const orb=fire(s,e,false,true);
  if(orb){orb.x=f.x;orb.y=C.debris.y;orb.vx=0;orb.vy=C.debris.speed;orb.radius=C.debris.radius;orb.range=99;orb.unparryable=true;orb.damage=1;}
 }
 const g=M.gum;
 for(let i=e.globs.length-1;i>=0;i--){
  const b=e.globs[i];b.x+=b.vx;b.y+=b.vy;b.vy-=g.gravity;b.age++;
  // The spit itself is harmless: the strands it lays are the hazard.
  if(b.y<=1){e.strands.push({x0:b.x-g.strand/2,x1:b.x+g.strand/2,t:g.life});emit(s,b.x,1,0x7fe8ff,4);e.globs.splice(i,1);}
 }
 // Gum strands on the floor slow a hunter who walks through them; a jump clears them.
 for(let i=e.strands.length-1;i>=0;i--){
  const st=e.strands[i];
  for(const p of s.players)if(!p.dead&&p.grounded&&p.y<1.2&&p.x+p.w/2>st.x0&&p.x-p.w/2<st.x1)p.x=p.px+(p.x-p.px)*g.slow;
  if(--st.t<=0)e.strands.splice(i,1);
 }
 for(let i=e.wires.length-1;i>=0;i--){
  const w=e.wires[i];
  if(w.warn>0)w.warn--;
  // A tripwire: it cuts whoever crosses into it (standing still inside one is safe; a jump clears a low one).
  else for(const p of s.players)if(!p.dead&&across(w,p.x,p.y,p)&&!across(w,p.px,p.py,p))hurt(s,p,e,1,{unparryable:true,impactX:p.px});
  if(--w.t<=0)e.wires.splice(i,1);
 }
}

export function chrysalisTick(s,e){
 if(e.dead)return;
 let t=null;
 for(const p of s.players)if(!p.dead){t=p;break;}
 if(!t)return;
 e.stun=0;e.vx=0;e.vy=0;
 if(e.inv>0)e.inv--;
 if(e.flash>0)e.flash--;
 if(--e.chipTimer<=0){e.chipTimer=C.chipWindow;e.chip=e.maxMask*C.chipCap;if(e.formChip!==undefined)e.formChip=e.maxMask*(POSSESSION.chipCap-C.chipCap);}
 for(const p of s.players)if(p.x<C.arenaLeft){p.x=C.arenaLeft;if(p.vx<0)p.vx=0;}
 e.far=Math.abs(t.x-e.x)>C.antiRange.distance?e.far+1:0;
 if(e.cut&&chrysalisFair(s))e.camp=e.ai==='swing'&&Math.abs(t.x-cx)>C.fair5.camp.dist?(e.camp||0)+1:0;
 e.still=t.blocking||t.grounded&&Math.abs(t.vx)<.01?e.still+1:0;
 e.sinceOpen++;e.sinceClap++;
 if(e.glass&&e.desperate>0)e.desperate--;
 e.stats.frames++;
 hazards(s,e);
 if(e.ai==='enter'){
  e.clip='idle';
  // The cocoon lowers into the Gullet while its name and cry show (in full once, then short).
  const q=e.aiTimer/e.aiFrames;place(e);e.y+=9*q*q;
  if(--e.aiTimer<=0){e.ai='swing';place(e);e.gap=roll(s,C.neutral[0]);}
 }else if(e.ai==='swing'||e.ai==='transition'&&e.phase===2){
  const ev=step(e);ease(e);place(e);
  if(ev&1)bottomPass(s,e);
  if(ev&2)apex(s,e);
  // The lip cue: the trailing rim lip flashes ivory as the shell nears the bottom (the side a shove pumps).
  e.lip=e.ai==='swing'&&!e.shoved&&(Math.abs(e.bx-cx)<C.bottom||Math.abs(e.bx-cx)<C.flash&&(e.bx-cx)*e.om<=0)?Math.sign(e.om):0;
  if(e.ai==='swing'||e.ai==='transition')sweep(s,e);
  if(e.ai==='swing'){
   if(e.glass&&e.desperate<=0){e.ai='spent';e.om=0;e.ang=0;place(e);e.y=1;e.clip='maskbreak';e.act=null;emitSound(s,'mask-crack3');}
   else moves(s,e,t);
   // A pumped swing is the hunter's work: the reel waits for a rest rung and gives up after two apexes.
   if(e.act?.id==='reel'&&e.act.stage==='wait'&&ev&2&&e.rung>=C.ledgeRung&&++e.act.t>2)endAct(s,e);
   else if(e.act?.id==='reel'&&e.act.stage==='wait'&&ev&2&&e.rung<C.ledgeRung){
    e.act=null;e.ai='reel';const f=tellFrames(s,e,'reel');e.reel={stage:'creak',t:f,frames:f,x:e.x,y:e.y};e.om=0;
   }
  }else if(--e.aiTimer<=0&&e.collapsed&&ev&1){e.ai='swing';e.rung=1;e.spin=0;e.gap=roll(s,C.neutral[1]);}
 }else if(e.ai==='open'){
  e.clip='hit';e.open=e.aiTimer;
  if(--e.aiTimer<=0)closeOpening(s,e);
 }else if(e.ai==='reel')reelTick(s,e,t);
 else if(e.ai==='transition')snapTick(s,e);
 else if(e.ai==='spent'){e.clip='maskbreak';}
 e.clip=e.ai==='swing'?(e.glass?'glassidle':e.act&&e.act.stage!=='swing'&&e.act.stage!=='pump'&&e.act.stage!=='wait'?(e.act.stage==='tell'?'telegraph':'sweep'):'idle'):e.clip;
 if(e.ai==='transition'||e.ai==='reel'&&e.reel.stage!=='settle'||e.act||e.glass&&e.ai!=='spent'||Math.abs(t.x-e.x)<e.w/2+2.5&&e.ai==='swing')e.stats.threat++;
}
