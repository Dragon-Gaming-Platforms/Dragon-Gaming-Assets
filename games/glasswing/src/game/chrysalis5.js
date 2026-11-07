import {emitSound} from '../core/sound.js';
import {entity} from '../core/entity.js';
import {hashSeed} from '../core/rng.js';
import {overlap} from '../core/physics.js';
import {hurt,fire,emit} from '../core/combat.js';
import {CHRYSALIS5 as C} from '../data/chrysalis5.js';
import {TIERS} from '../data/rules.js';
import {F} from '../data/feel.js';
import {depth,glassMultiplier} from './moults.js';
import {gainEmber} from './possession.js';
import {EMBER,POSSESSION} from '../data/forms.js';

// The Unborn Chrysalis, finished (config.boss 'chrysalis5'). A copy of src/game/chrysalis.js (left untouched so the M5
// digests stay identical) with the rest of BOSS-DESIGN boss 1: three twisting rim lips, each with its own shove window;
// Shed Husks in P2; a telegraphed Half-Shell Clap (plain, delayed, double) and Cord Lash from the apex of the unborn's
// cord swing in P3; a clean pump that shortens the next apex wait; the Unfold attempt; e.revealed. Its own random stream
// (hashSeed(seed+':chrysalis5:'+attempt)): it never draws from s.rng.
const M=C.moves,cx=C.anchor[0],ay=C.anchor[1];
// Integer sine (Bhaskara I) of millidegrees, x4096: the same on every engine.
export function sinQ(a){
 const d=Math.abs(a)%360000,h=d>180000?d-180000:d,p=h*(180000-h),v=Math.floor(4*p*4096/(40500000000-p));
 return (a<0)!==(d>180000)?-v:v;
}
export const cosQ=a=>sinQ(90000-Math.abs(a));
function isqrt(n){let r=Math.floor(Math.sqrt(n));while(r*r>n)r--;while((r+1)*(r+1)<=n)r++;return r;}
// Twice the potential energy at an angle, in the integrator's units (57296 millidegrees per radian).
const pot2=a=>Math.floor(2*C.gravity*57296*(4096-cosQ(a))/4096);
const E2=C.rungs.map(pot2);
export function asinQ(v){let lo=0,hi=90000;const t=Math.abs(v);while(lo<hi){const m=(lo+hi+1)>>1;if(sinQ(m)<=t)lo=m;else hi=m-1;}return v<0?-lo:lo;}
function rnd(e){let x=e.rs;x^=x<<13;x^=x>>>17;x^=x<<5;e.rs=x>>>0;return e.rs/4294967296;}
const roll=(e,[a,b])=>a+Math.floor(rnd(e)*(b-a+1));
const tier=e=>e.glass?3:e.phase-1;
const minRung=e=>e.phase===3?1:0;
const CLAPS=['clap','clapd','clap2'];
const APEX_MOVES=['clap','clapd','clap2','lash'];
export const dmgOf=e=>e.glass?C.despDamage:1;
// A hunter channelling a Mend (the M1 Mend package names it; any of these fields counts).
export const mending=p=>!p.dead&&((typeof p.mend==='number'&&p.mend>0)||p.mending===true||p.mending>0||p.mendTimer>0);

// The Gullet: a taller shaft (16 rows) over the Nest arena, two mid ledges; idempotent so a retry restores it.
export function gullet5(level){
 const w=level.width;
 while(level.grid.length<C.rows)level.grid.push(Array(w).fill(0));
 for(let y=1;y<level.grid.length;y++)for(let x=Math.floor(C.arenaLeft);x<Math.min(w,C.right);x++)level.grid[y][x]=0;
 for(const l of C.ledges)for(let x=l.x0;x<l.x1;x++)level.grid[l.row][x]=2;
 level.gullet5=true;
 return level;
}
function collapse(s,e){
 const l=C.ledges[0],b=C.broken;
 for(let x=l.x0;x<l.x1;x++){s.level.grid[l.row][x]=0;emit(s,x+.5,l.row+.5,0xf1ece2,6);}
 for(let x=b.x0;x<b.x1;x++)s.level.grid[b.row][x]=2;
 s.levelRevision++;e.collapsed=true;emitSound(s,'mask-shatter');
}
const impact=(s,e,k,x=e.x,y=e.y+e.h*.5)=>{e.impact={k,f:s.frame,x,y};};

export function spawnChrysalis5(s){
 const e=entity(s.nextId++,'brawler',cx,ay,2,s.config.difficulty);
 const hp=Math.round(C.hp*(s.config.mode==='coop'?C.coopHP:1)*TIERS[s.config.difficulty].hp),long=!s.config.introSeen&&!s.bossAttempts;
 Object.assign(e,{
  boss:true,v4:true,chrysalis5:true,bossId:'chrysalis5',phase:1,hp,maxMask:hp,mask:hp,eye:'#19B8A6',w:C.shell.w,h:C.shell.h,
  ai:'enter',aiTimer:long?C.intro:C.entrance,aiFrames:long?C.intro:C.entrance,intro:long,
  rs:hashSeed(s.config.seed+':chrysalis5:'+(s.bossAttempts||0)),
  ang:C.rungs[0],om:0,rung:0,cord:C.cord,bx:cx,by:ay-C.cord,idle:0,lip:0,lipHot:false,lipIdx:0,apexN:0,twist:99,sinceBottom:0,grace:0,
  pumps:0,clean:false,shoved:false,act:null,queue:[],history:[],seen:[],gap:0,frozen:false,strike:'',strikeIdx:-1,
  open:0,openDamage:0,openKind:'',openSide:0,sinceOpen:C.openGap,sinceClap:C.clapGap,riposte:false,
  chip:hp*C.chipCap,chipTimer:C.chipWindow,far:0,still:0,desperate:0,despMax:C.desperation,revealed:false,
  falls:[],globs:[],strands:[],wires:[],husks:[],lash:null,reel:null,hang:null,frayed:false,cut:false,collapsed:false,spin:0,impact:null,
  attempt:s.bossAttempts||0,stats:{frames:0,threat:0,openings:0,maxOpen:0,shoves:0,deflects:0,clean:0,claps:0,start:s.frame}
 });
 place(e);
 s.enemies.push(e);s.bossStarted=true;s.checkpoint=C.door;emitSound(s,'boss-roar');
 return e;
}
function place(e){
 const sn=sinQ(e.ang),cs=cosQ(e.ang);
 e.bx=cx+e.cord*sn/4096;e.by=ay-e.cord*cs/4096;
 e.x=e.bx;e.y=e.by-e.h/2;
 // Re-hung from the floor (a cracked Drop-Reel cut short by a phase change): the body eases back onto its cord.
 if(e.hang){const h=e.hang,q=1-(--h.t)/h.n;e.x=h.x+(e.x-h.x)*q;e.y=h.y+(e.y-h.y)*q;if(h.t<=0)e.hang=null;}
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
// Signed frames from the bottom of the swing: negative while it still descends toward it, positive after it passed.
export function bottomTime(e){
 if(e.ang===0||(e.bx-cx)*e.om>0)return e.sinceBottom;
 const c={ang:e.ang,om:e.om,rung:e.rung};
 for(let n=1;n<=120;n++){if(step(c)&1)return -n;ease(c);}
 return -999;
}
// The lip that leads this pass: the brow in P1 (and for the unborn), then whichever the twist brought round.
export const lipOf=e=>C.lips[e.phase===2&&!e.cut?e.lipIdx:0];
// The lip that will lead after k more apexes (what the twisting shell will show next).
export function lipAfter(e,k){
 if(e.phase!==2||e.cut)return C.lips[0];
 let i=e.lipIdx;for(let j=1;j<=k;j++)if((e.apexN+j)%2===0)i=(i+1)%3;
 return C.lips[i];
}

function bottomPass(s,e){
 e.sinceBottom=0;
 // A missed pass leaves the pump chain; only a decay, a damp or a hit breaks it.
 if(e.shoved)e.idle=0;else if(++e.idle>=C.decay&&e.rung>minRung(e)&&e.rung<C.wallRung){e.rung--;e.idle=0;e.pumps=0;}
 e.shoved=false;
 if(e.rung<minRung(e))e.rung=minRung(e);
 // Over-pumped (or self-pumped): the shell will slam the wall at the coming apex; dust trickles before.
 if(e.rung>=C.wallRung&&e.om*e.om>=E2[C.wallRung]*.85){
  const n=ahead(e),side=Math.sign(e.om),wx=side<0?C.arenaLeft:C.right;
  for(let i=0;i<M.wall.falls;i++)e.falls.push({x:wx-side*(.6+rnd(e)*(M.wall.third-1)),t:n+M.wall.warn-8+i*5});
  emitSound(s,'enemy-telegraph');
 }
}
function ledgeHunter(s,side){
 for(const p of s.players)if(!p.dead&&p.grounded&&p.y>=2.9&&(side<0?p.x<C.ledges[0].x1+.2:p.x>C.ledges[1].x0-.2))return true;
 return false;
}
const gapNeed=e=>e.clean?C.cleanGap:C.openGap;
function apex(s,e){
 e.hitIds.length=0;
 const side=Math.sign(e.ang);
 // P2: the shell twists a third of a turn at every second apex, so each lip leads one full swing (both ways), then the next.
 if(e.phase===2&&!e.cut&&e.ai==='swing'&&++e.apexN%2===0){e.lipIdx=(e.lipIdx+1)%3;e.twist=0;}
 if(e.rung>=C.wallRung&&Math.abs(e.ang)>=C.rungs[C.wallRung]-3000){wallStrike(s,e,side);return;}
 // A camp answer (C.fair5.camp) pumps on the far side, so the slam lands on the camped wall.
 if(e.act?.id==='wall'&&e.act.stage==='pump'&&!(e.act.toward&&side===e.act.toward)){e.rung=C.wallRung;e.act.stage='swing';emitSound(s,'enemy-telegraph');return;}
 if(e.act?.id==='wall'&&e.act.stage==='swing')endAct(s,e);
 if(e.rung===C.ledgeRung&&e.sinceOpen>=gapNeed(e)&&!e.glass&&ledgeHunter(s,side))openUp(s,e,'apex',C.apexOpen[e.phase-1],side);
}
function wallStrike(s,e,side){
 const wx=side<0?C.arenaLeft:C.right;
 s.shake=F.shakeFrames*3;emitSound(s,'boss-roar');emit(s,wx,e.by,0xf1ece2,20);impact(s,e,'wall',wx,e.by);
 for(const p of s.players)if(!p.dead&&Math.abs(p.x-wx)<M.wall.shock)hurt(s,p,e,1,{unparryable:true,impactX:wx});
 if(e.ai==='transition'&&side<0&&!e.collapsed)collapse(s,e);
 // A swing the hunter over-pumped into the wall spends any clean pump (the shell's own Wall Strike does not).
 if(e.act?.id!=='wall'){e.clean=false;e.pumps=0;}
 e.rung=e.ai==='transition'?C.wallRung:1;
 if(e.act?.id==='wall')endAct(s,e);
}

function openUp(s,e,kind,frames,side){
 e.ai='open';e.aiTimer=e.aiFrames=e.open=frames;e.openKind=kind;e.openSide=side;e.openDamage=0;e.om=0;e.frozen=false;
 // A skill opening (a parried clap, a cracked reel) runs on its own 10 s clock and leaves the pump and seam wait alone.
 if(kind==='clap'||kind==='crack')e.sinceClap=0;else{e.sinceOpen=0;if(e.clean)e.stats.clean++;e.clean=false;e.pumps=0;}
 // The amber seam (or the soft form) is a hurtbox wider than the shell: hitboxes never follow the art.
 e.w=(e.cut?C.creature.w:C.shell.w)+C.reach*2;
 e.act=null;e.queue.length=0;e.lip=0;e.lipHot=false;e.unparryable=false;e.clip='hit';e.stats.openings++;
 emit(s,e.x+side*e.w/4,e.y+e.h*.55,0xffb347,14);emitSound(s,'block');impact(s,e,'open');
}
function closeOpening(s,e){
 e.stats.maxOpen=Math.max(e.stats.maxOpen,e.openDamage/e.maxMask);
 e.open=0;e.riposte=false;e.w=e.cut?C.creature.w:C.shell.w;e.clip='idle';e.grace=C.closeGrace;
 e.gap=roll(e,C.neutral[tier(e)]);
 if(e.openKind==='crack'){e.ai='reel';e.reel.stage='rise';e.reel.t=e.reel.frames=30;return;}
 e.ai='swing';
 // After an apex opening the shell violently damps itself back to rest.
 if(e.openKind==='apex'){e.rung=minRung(e);emit(s,e.x,e.y+e.h,0xf1ece2,12);s.shake=F.shakeFrames;}
 energize(e);
}
// Every guarded strike of this boss lands here: a husk, a clap, or the swinging body (a shove at the right moment).
export function chrysalis5Parried(s,e,p){
 if(e.dead)return;
 if(e.strike==='husk'){const h=e.husks[e.strikeIdx];if(h){h.dead=true;emit(s,h.x,h.y,0xffffff,10);}impact(s,e,'husk',h?.x,h?.y);return;}
 if(e.strike==='clap'){
  if(e.glass){defeat(s,e,p);return;}
  const a=e.act;a.parried=(a.parried||0)+1;e.stats.claps++;impact(s,e,'clap');
  // The last clap of the act, parried, exposes the soft form (at most once every 10 s).
  if((a.id!=='clap2'||a.n===2)&&e.sinceClap>=C.clapGap)openUp(s,e,'clap',C.clapOpen,0);
  return;
 }
 if(e.ai!=='swing')return;
 if(e.glass){defeat(s,e,p);return;}
 if(e.shoved)return;
 const lip=lipOf(e),tb=bottomTime(e);
 // Outside the leading lip's window a parry only deflects the shell: the guard holds, the swing goes on.
 if(tb<lip.lo||tb>lip.hi){e.stats.deflects++;emit(s,p.x+p.facing*.5,p.y+1.2,0xf1ece2,6);impact(s,e,'deflect',p.x+p.facing*.5,p.y+1.2);return;}
 const travel=Math.sign(e.om)||p.facing,pump=p.facing===travel;
 e.rung=pump?Math.min(C.wallRung,e.rung+1):Math.max(minRung(e),e.rung-1);
 e.shoved=true;e.idle=0;e.stats.shoves++;
 if(pump){
  e.pumps++;
  // A clean pump: every shove from rest with the swing, no damp, decay or hit between. The amber answers with a chime;
  // the next wait is shorter (an over-pump into the wall loses it).
  if(e.rung===C.ledgeRung&&e.pumps>=C.ledgeRung-minRung(e)&&!e.clean){e.clean=true;emitSound(s,'altar-chime');emit(s,e.x,e.y+e.h*.5,0xffb347,10);}
 }else{
  e.pumps=0;
  // Taming a Wall Strike (damping its self-pumped swing down to the ledge) counts as clean work too.
  if(e.act?.id==='wall'&&e.rung===C.ledgeRung&&!e.clean){e.clean=true;emitSound(s,'altar-chime');emit(s,e.x,e.y+e.h*.5,0xffb347,10);}
 }
 emit(s,e.x-travel*e.w/2,e.y+1,0xffffff,12);impact(s,e,'shove',e.x-travel*e.w/2,e.y+1);
}
function defeat(s,e,source){
 e.hp=0;e.mask=0;e.dead=true;e.defeatedFrame=s.frame;e.clip='beaten';e.vx=0;e.vy=0;e.ai='spent';e.act=null;e.frozen=false;
 if(source&&source.team!==2&&source.kills!==undefined)source.kills++;
 emit(s,e.x,e.y+2,0xffb347,30);emitSound(s,'enemy-beaten');impact(s,e,'defeat');
}
function transition(s,e){
 e.open=0;e.riposte=false;e.phase++;e.ai='transition';e.aiTimer=e.aiFrames=C.transition;e.clip='summon';
 e.act=null;e.queue.length=0;e.w=e.cut?C.creature.w:C.shell.w;e.lip=0;e.lipHot=false;e.frozen=false;e.pumps=0;e.clean=false;
 // A new phase owes the hunter its first opening sooner: the shortened wait runs from the start of the transition.
 e.sinceOpen=Math.max(e.sinceOpen,C.openGap-C.cleanGap);
 s.shake=F.shakeFrames*3;emit(s,e.x,e.y+e.h,0xf1ece2,24);emitSound(s,'boss-roar');impact(s,e,'phase');
 // P2: the cord frays and the shell swings itself to the walls until the left ledge comes down.
 if(e.phase===2){
  e.frayed=true;e.rung=C.wallRung;e.spin=1;e.lipIdx=0;e.apexN=0;
  // From a cracked Drop-Reel the shell lies on the floor: hang it back on its cord from there (no jump to the old swing),
  // harmless while it lifts off the hunter who was punching it.
  if(e.reel){e.ang=Math.max(-C.rungs[1],Math.min(C.rungs[1],asinQ(Math.round((e.x-cx)/e.cord*4096))));e.om=0;e.hang={x:e.x,y:e.y,t:C.rehang,n:C.rehang};e.grace=C.rehang;e.reel=null;}
 }
 // P3: the cord snaps and the shell falls.
 else{e.reel={stage:'snap',t:0,x:e.x,y:e.y};e.om=0;}
}
function desperation(s,e){
 e.open=0;e.riposte=false;e.glass=true;e.desperate=C.desperation;e.hp=0;e.mask=0;e.act=null;e.queue.length=0;e.frozen=false;
 e.ai='swing';e.rung=1;e.w=C.creature.w;e.gap=C.neutral[3][0];energize(e);
 s.hitStop=F.swordStop;emit(s,e.x,e.y+e.h*.8,0xf1ece2,24);emitSound(s,'mask-shatter');impact(s,e,'unfold');
}
// Damage rules (as the M5 Chrysalis): the open seam (or soft form) is amber, x2 up to the 10% cap; the ivory shell takes
// capped chip; the entrance, transitions and the desperation clank.
export function chrysalis5Hurt(s,e,source,damage,projectile){
 if(e.ai==='spent'){e.hp=0;e.mask=0;e.dead=true;e.defeatedFrame=s.frame;emit(s,e.x,e.y+2,0xffb347,30);impact(s,e,'defeat');return 'hit';}
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
 if(amber){s.shake=F.shakeFrames;impact(s,e,'amber',source.x+(e.x-source.x)*.5,(source.y||e.y)+1);}
 if(clank){emitSound(s,'block');return 'hit';}
 if(e.hp<=floor){if(e.phase<3)transition(s,e);else desperation(s,e);}
 else if(amber&&e.openDamage>=e.maxMask*C.cap-1e-9){emit(s,e.x,e.y+e.h*.55,0x5c5650,10);closeOpening(s,e);impact(s,e,'cap');if(source.forms)gainEmber(s,source,EMBER.cap);}
 return 'hit';
}

// Strikes route their parries through e.strike, so a guarded husk or clap never counts as a shove.
function strike(s,p,e,kind,damage,opts,idx=-1){
 e.strike=kind;e.strikeIdx=idx;
 const r=hurt(s,p,e,damage,opts);
 e.strike='';e.strikeIdx=-1;
 if(r==='hit')e.pumps=0;
 return r;
}
// The painted shell (render2d/chrysalis5.js halfPath, two cubic halves hung from the cord's end): its half-width, as a
// share of shell.w, at each tenth of its height from the top down. Plain arithmetic, so the same on every engine.
const PROFILE=(()=>{
 const pts=[];for(let i=0;i<=64;i++){const t=i/64,u=1-t;pts.push([3*u*u*t*.12+3*u*t*t*.82+t*t*t,3*u*u*t*.62+3*u*t*t*.6+t*t*t*.12]);}
 const out=[];for(let k=0;k<=10;k++){const y=k/10;for(let i=1;i<pts.length;i++){const [y0,x0]=pts[i-1],[y1,x1]=pts[i];if(y<=y1){out.push(x0+(x1-x0)*(y-y0)/(y1-y0||1));break;}}}
 return out;
})();
const widthAt=(f)=>{const k=Math.min(9,Math.floor(f*10)),q=f*10-k;return PROFILE[k]+(PROFILE[k+1]-PROFILE[k])*q;};
const RECT=[[-.5,0],[0,0],[.5,0],[-.5,.25],[.5,.25],[-.5,.5],[0,.5],[.5,.5],[-.5,.75],[.5,.75],[-.5,1],[0,1],[.5,1]];
// Does the hanging shell (box x,y,w,h, cord angle ang) meet the rectangle r? The drawn shell is an egg hung from the top
// of its box and turned with the cord. Points of the rectangle in the egg, or of the egg's rim in the rectangle.
export function shellMeets(x,y,w,h,ang,r){
 const sn=sinQ(ang)/4096,cs=cosQ(ang)/4096,top=y+h;
 for(const [fx,fy] of RECT){
  const dx=r.x+fx*r.w-x,dy=r.y+fy*r.h-top,v=dx*sn-dy*cs,u=dx*cs+dy*sn;
  if(v>=0&&v<=h&&Math.abs(u)<=w*widthAt(v/h))return true;
 }
 for(let k=0;k<=10;k++)for(const sd of [-1,1]){
  const v=h*k/10,u=sd*w*PROFILE[k],px=x+u*cs+v*sn,py=top+u*sn-v*cs;
  if(Math.abs(px-r.x)<=r.w/2&&py>=r.y&&py<=r.y+r.h)return true;
 }
 return false;
}
// The swinging shell strikes only where its box and its drawing meet (QA: the upright box's corners stood up to ~0.7
// tiles past the painted egg at the hunter's height, an invisible hit; where the egg overflows the box it stays harmless,
// so the ledge and lip-window geometry is unchanged). The unborn (P3) keeps its box.
export function shellClip(e,p,out){
 const x0=Math.max(e.x-e.w/2,p.x-p.w/2),x1=Math.min(e.x+e.w/2,p.x+p.w/2),y0=Math.max(e.y,p.y),y1=Math.min(e.y+e.h,p.y+p.h);
 out.x=(x0+x1)/2;out.w=x1-x0;out.y=y0;out.h=y1-y0;return out;
}
const clip={x:0,y:0,w:0,h:0};
const touches=(e,p)=>overlap(e,p)&&(e.cut||shellMeets(e.x,e.y,e.w,e.h,e.ang,shellClip(e,p,clip)));
// The swinging body: one hit per hunter per half-swing. Any facing can guard it, so a hunter can shove with the swing.
function sweep(s,e){
 for(const p of s.players){
  if(p.dead||e.hitIds.includes(p.id)||!touches(e,p))continue;
  const r=strike(s,p,e,'body',dmgOf(e),{stop:F.swordStop,impactX:p.blocking?p.x+p.facing:e.x});
  if(r!=='immune')e.hitIds.push(p.id);
  if(e.dead||e.ai!=='swing'&&e.ai!=='transition')return;
 }
}
function allowed(e,id){
 const h=e.history,n=h.length;
 return !(h[n-1]===id&&h[n-2]===id)&&!(n>=3&&h[n-3]===h[n-1]&&h[n-2]===id);
}
function choose(s,e,t){
 const tr=tier(e),list=C.patterns[tr];
 let pick=null;
 // A Mend is answered at once (still with the full tell); range by spit (P1-P2) or the lash (P3); turtling by spit or the flail.
 // Rules v5: a hunter camped out of the swing's reach is answered first, with a Wall Strike on the camped wall.
 if(e.camp>=C.fair5.camp.frames[tr]){e.camp=0;e.campSide=Math.sign(t.x-cx)||1;pick={id:'reach',m:['wall']};}
 else if(s.players.some(mending))pick={id:'mend',m:[C.mendReply[tr]]};
 else if(e.far>=C.antiRange.frames)pick=list.find(p=>p.m[0]==='gum'||p.m[0]==='lash');
 else if(e.still>=C.antiTurtle)pick=list.find(p=>p.m[0]==='gum'||p.m[0]==='flail');
 if(pick&&pick.id!=='mend'&&pick.id!=='reach'&&!allowed(e,pick.id))pick=null;
 if(!pick){
  let total=0;for(const p of list)if(allowed(e,p.id))total+=p.w;
  let r=rnd(e)*total;
  for(const p of list){if(!allowed(e,p.id))continue;r-=p.w;if(r<0){pick=p;break;}}
  pick=pick||list[0];
 }
 e.far=0;e.still=0;
 e.history.push(pick.id);if(e.history.length>3)e.history.shift();
 e.queue=[...pick.m];
 e.gap=pick.m.length?0:roll(e,C.neutral[tr])*2;
}
function tellFrames(s,e,id){
 const tr=tier(e),tight=TIERS[s.config.difficulty].tight;
 let tells=C.tells[tr<3?Math.min(2,tr+tight):3];
 // A move's first appearance always uses the teach tier (Glass: the test tier).
 if(tr<3&&!e.seen.includes(id)){tells=C.tells[tight];e.seen.push(id);}
 return Math.round(roll(e,tells)*TIERS[s.config.difficulty].tell);
}
function start(s,e,t,id){
 const frames=tellFrames(s,e,id);
 // Apex moves wait for the top of the swing, hang there, then tell; husks peel first, then drop at the next apex.
 const stage=id==='wall'?'pump':id==='reel'||APEX_MOVES.includes(id)?'wait':'tell';
 e.act={id,stage,t:id==='reel'?0:frames,frames,x:t.x,n:1,parried:0,hold:id==='clapd'?roll(e,M.clap.delay):0};
 e.unparryable=id!=='husks'&&!CLAPS.includes(id);
 if(id==='wall'&&e.campSide){e.act.toward=e.campSide;e.campSide=0;}
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
function endAct(s,e){
 if(e.frozen){e.frozen=false;energize(e);}
 e.act=null;e.unparryable=false;
 e.gap=!e.queue.length?roll(e,C.neutral[tier(e)]):C.neutral[tier(e)][0]>>1;
}
// The clap box: both halves meet around the unborn's chest, from just under its feet to above its middle.
export function clapBox(e,out={x:0,y:0,w:0,h:0}){
 const k=M.clap;out.w=k.reach*2;out.x=e.x;out.y=e.y-k.below;out.h=e.h*k.above+k.below;return out;
}
const cbox={x:0,y:0,w:0,h:0};
const inBox=(b,p)=>p.x+p.w/2>b.x-b.w/2&&p.x-p.w/2<b.x+b.w/2&&p.y<b.y+b.h&&p.y+p.h>b.y;
function actTick(s,e,t,ev){
 const a=e.act;
 if(a.stage==='pump'||a.stage==='swing'||a.id==='reel'&&a.stage==='wait')return;
 if(a.stage==='wait'){
  // Hang at the apex: the pendulum freezes there while the halves (or the stump) wind up.
  if(ev&2){e.frozen=true;e.om=0;e.hitIds.length=0;a.stage='tell';a.t=a.frames;a.side=Math.sign(e.ang)||1;emitSound(s,'enemy-telegraph');}
  return;
 }
 if(a.stage==='drop'){
  if(ev&2){
   const k=M.husks,side=Math.sign(e.ang)||1;
   for(let i=0;i<k.count;i++)e.husks.push({x:e.bx-side*(.4-i*k.spread),y:e.y+k.radius,vx:-side*(k.speed-i*k.slow),vy:0,r:k.radius,t:k.life,delay:0,landed:false,settle:0,dead:false,spin:0});
   emitSound(s,'mask-crack1');emit(s,e.bx,e.y+.5,0xf1ece2,10);endAct(s,e);
  }
  return;
 }
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
  else if(a.id==='husks'){a.stage='drop';}
  else if(a.id==='flail'){a.stage='active';a.t=M.flail.active;emit(s,e.x,e.y+e.h*.5,0x7fe8ff,16);emitSound(s,'rush');}
  else if(a.id==='clapd'&&a.hold>0){a.stage='hold';a.t=a.hold;emitSound(s,'sword-swing');}
  else if(CLAPS.includes(a.id)){a.stage='active';a.t=M.clap.active;a.hit=[];}
  else if(a.id==='lash'){a.stage='active';a.t=M.lash.active;a.dir=-a.side;a.x0=e.x;emitSound(s,'sword-swing');}
  return;
 }
 if(a.stage==='hold'){if(--a.t<=0){a.stage='active';a.t=M.clap.active;a.hit=[];}return;}
 if(a.stage==='active'){
  if(a.id==='flail'){
   // Wing Flail: crumpled wings beat out cyan scale dust around the creature (never parryable).
   const r=M.flail.radius,mx=e.x,my=e.y+e.h*.5;
   for(const p of s.players){
    const dx=Math.max(Math.abs(p.x-mx)-p.w/2,0),dy=my<p.y?p.y-my:my>p.y+p.h?my-(p.y+p.h):0;
    if(!p.dead&&dx*dx+dy*dy<r*r)strike(s,p,e,'flail',dmgOf(e),{unparryable:true,impactX:mx});
   }
   if(--a.t<=0){a.stage='after';a.t=M.flail.after;}
   return;
  }
  if(CLAPS.includes(a.id)){
   // Half-Shell Clap: ivory, parryable. The halves meet on the first active frame and stay shut for the rest.
   if(a.t===M.clap.active){s.shake=Math.max(s.shake,F.shakeFrames);emitSound(s,'punch3');emit(s,e.x,e.y+e.h*.4,0xf1ece2,12);}
   clapBox(e,cbox);
   for(const p of s.players){
    if(p.dead||a.hit.includes(p.id)||!inBox(cbox,p))continue;
    const r=strike(s,p,e,'clap',dmgOf(e),{stop:F.swordStop,impactX:e.x});
    if(e.dead||e.ai!=='swing')return;
    if(r!=='immune')a.hit.push(p.id);
   }
   if(--a.t<=0){
    if(a.id==='clap2'&&a.n===1){a.n=2;a.stage='tell';a.t=a.frames=M.clap.twin;emitSound(s,'enemy-telegraph');}
    else{a.stage='after';a.t=M.clap.after;}
   }
   return;
  }
  if(a.id==='lash'){
   // Cord Lash: the gum tip races along the floor from under the hanging unborn toward the middle; jump it.
   const k=M.lash,q=1-(a.t-1)/k.active,tip=a.x0+a.dir*k.reach*q;a.tip=tip;
   for(const p of s.players)if(!p.dead&&p.y<1+k.height&&Math.abs(p.x-tip)<k.tip+p.w/2)strike(s,p,e,'lash',dmgOf(e),{unparryable:true,impactX:tip});
   if(--a.t<=0){a.stage='after';a.t=k.after;s.shake=Math.max(s.shake,F.shakeFrames);emit(s,tip,1.2,0x7fe8ff,10);emitSound(s,'land');}
   return;
  }
 }
 if(a.stage==='after'&&--a.t<=0)endAct(s,e);
}
function moves(s,e,t,ev){
 if(e.act){actTick(s,e,t,ev);return;}
 if(e.gap>0){e.gap--;return;}
 if(e.queue.length){start(s,e,t,e.queue.shift());return;}
 choose(s,e,t);
}

// Drop-Reel: the cord creaks, the shell rises out of view, its shadow sways after the hunter, it drops and bounces.
// A dodge inside the last 12f of the fall, close by, cracks it open for 56f (on the 10 s skill clock it shares with the clap).
function reelTick(s,e,t){
 const r=e.reel,k=M.reel;
 r.t--;
 if(r.stage==='creak'){e.clip='telegraph';e.x=r.x+(r.t%4<2?.04:-.04);if(r.t<=0){r.stage='lift';r.t=r.frames=k.lift;}}
 else if(r.stage==='lift'){const q=1-r.t/r.frames;e.y=r.y+(k.top+3-r.y)*q*q;e.x=r.x;if(r.t<=0){r.stage='sway';r.t=r.frames=k.sway;}}
 else if(r.stage==='sway'){r.x+=Math.max(-k.shadow,Math.min(k.shadow,t.x-r.x));r.x=Math.max(cx-6,Math.min(cx+6,r.x));e.x=r.x;if(r.t<=0){r.stage='fall';r.t=r.frames=k.fall;r.dodged=false;}}
 else if(r.stage==='fall'){
  const q=1-r.t/r.frames;e.y=k.top-(k.top-1)*q*q;
  for(const p of s.players)if(!p.dead&&p.dodge>0&&r.t<C.dodgeLate&&Math.abs(p.x-e.x)<e.w/2+1.6)r.dodged=true;
  if(r.t<=0){
   e.y=1;s.shake=F.shakeFrames*3;emit(s,e.x,1,0xf1ece2,24);emitSound(s,'land');impact(s,e,'reel',e.x,1);
   for(const p of s.players)if(!p.dead&&overlap(e,p))hurt(s,p,e,1,{unparryable:true,impactX:e.x});
   r.stage='bounce';r.t=r.frames=k.bounce;
  }
 }else if(r.stage==='bounce'){
  const q=1-r.t/r.frames;e.y=1+4*1.1*q*(1-q);
  if(r.t<=0){e.y=1;if(r.dodged&&e.sinceClap>=C.clapGap&&!e.glass)openUp(s,e,'crack',C.crack,0);else{r.stage='settle';r.t=r.frames=k.settle;}}
 }else if(r.stage==='settle'){if(r.t<=0){r.stage='rise';r.t=r.frames=30;}}
 else if(r.stage==='rise'){
  if(r.t===r.frames-1){r.ang=Math.max(-C.rungs[1],Math.min(C.rungs[1],asinQ(Math.round((e.x-cx)/e.cord*4096))));r.x=e.x;r.y=e.y;}
  const sn=sinQ(r.ang),q=1-r.t/r.frames,tx=cx+e.cord*sn/4096,ty=ay-e.cord*cosQ(r.ang)/4096-e.h/2;
  e.x=r.x+(tx-r.x)*q;e.y=r.y+(ty-r.y)*q;
  if(r.t<=0){e.ang=r.ang;e.om=0;e.rung=Math.abs(r.ang)>C.rungs[0]?1:minRung(e);e.ai='swing';e.reel=null;place(e);energize(e);e.hitIds.length=0;e.gap=roll(e,C.neutral[tier(e)]);}
 }
}
// P3 transition: the snapped shell falls and splits; the unborn crawls out and takes the cord stump.
function snapTick(s,e){
 const r=e.reel,T=C.transition;r.t++;
 if(r.t<=30){const q=r.t/30;e.y=r.y+(1-r.y)*q*q;}
 if(r.t===30){
  e.cut=true;e.y=1;e.w=C.creature.w;e.h=C.creature.h;s.shake=F.shakeFrames*3;emit(s,e.x,1.5,0xf1ece2,30);emitSound(s,'mask-shatter');impact(s,e,'split',e.x,1.5);
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
 if(--e.aiTimer<=0){e.ang=0;e.om=0;e.rung=1;e.reel=null;place(e);energize(e);e.ai='swing';e.hitIds.length=0;e.gap=roll(e,C.neutral[2]);}
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
 // Shed Husks: they fall from the shell, then roll down the slope of the swing until a wall breaks them.

 const k=M.husks;
 for(let i=e.husks.length-1;i>=0;i--){
  const h=e.husks[i];
  if(h.delay>0){h.delay--;continue;}
  // An empty husk is harmless while it falls and wobbles where it landed; only the rolling husk strikes.
  if(!h.landed){h.vy-=.03;h.y+=h.vy;if(h.y<=1+h.r){h.y=1+h.r;h.vy=0;h.landed=true;h.settle=k.settle;emit(s,h.x,1,0xf1ece2,6);emitSound(s,'land');}continue;}
  if(h.settle>0){h.settle--;continue;}
  h.x+=h.vx;h.spin+=h.vx/h.r;
  if(!h.dead)for(const p of s.players){
   if(p.dead)continue;
   const dx=Math.max(Math.abs(p.x-h.x)-p.w/2,0),dy=h.y<p.y?p.y-h.y:h.y>p.y+p.h?h.y-(p.y+p.h):0;
   if(dx*dx+dy*dy<h.r*h.r){const r=strike(s,p,e,'husk',1,{impactX:h.x},i);if(r!=='immune')h.dead=true;break;}
  }
  if(h.dead||h.x<C.arenaLeft+h.r||h.x>C.right-h.r||--h.t<=0){emit(s,h.x,h.y,0xf1ece2,10);if(!h.dead)emitSound(s,'mask-crack2');e.husks.splice(i,1);}
 }
}

export function chrysalis5Tick(s,e){
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
 e.still=t.blocking||t.grounded&&Math.abs(t.vx)<.01?e.still+1:0;
 if(s.config.rulesVersion>=5)e.camp=e.ai!=='open'&&e.ai!=='enter'&&Math.abs(t.x-cx)>C.fair5.camp.dist?(e.camp||0)+1:0;
 // Lantern Crescents (horns-lantern) make the weak points shine.
 e.revealed=false;for(const p of s.players)if(depth(p,'horns-lantern'))e.revealed=true;
 e.sinceOpen++;e.sinceClap++;e.sinceBottom++;if(e.twist<99)e.twist++;
 if(e.glass&&e.desperate>0)e.desperate--;
 e.stats.frames++;
 hazards(s,e);
 if(e.ai==='enter'){
  e.clip='idle';
  // The cocoon lowers into the Gullet while its name and cry show (in full once, then short).
  const q=e.aiTimer/e.aiFrames;place(e);e.y+=9*q*q;
  if(--e.aiTimer<=0){e.ai='swing';place(e);e.gap=roll(e,C.neutral[0]);}
 }else if(e.ai==='swing'||e.ai==='transition'&&e.phase===2){
  let ev=0;
  // P2 transition: the shell must swing itself to the left wall. Re-hung at rest near the bottom (a cracked Drop-Reel cut
  // by the phase change), gravity rounds to nothing there and ease() keeps a zero speed, so it would hang forever:
  // start it toward the middle and let ease() lift it to the wall rung.
  if(e.ai==='transition'&&!e.om&&!e.hang&&!e.frozen&&Math.trunc(C.gravity*sinQ(e.ang)/4096)===0)e.om=-Math.sign(e.ang)||-1;
  if(!e.frozen){ev=step(e);ease(e);place(e);}
  if(ev&1)bottomPass(s,e);
  if(ev&2)apex(s,e);
  if(e.ai==='swing'&&!e.frozen&&!e.shoved){
   // The lip cue: the leading rim lip shows ivory as its window nears and flashes inside it (the side a shove pumps).
   const lip=lipOf(e),tb=bottomTime(e);
   e.lip=tb>=lip.lo-12&&tb<=lip.hi?Math.sign(e.om)||1:0;e.lipHot=tb>=lip.lo&&tb<=lip.hi;
  }else{e.lip=0;e.lipHot=false;}
  if(e.grace>0)e.grace--;
  else if(!e.frozen&&(e.ai==='swing'||e.ai==='transition'))sweep(s,e);
  if(e.ai==='swing'){
   if(e.glass&&e.desperate<=0){e.ai='spent';e.frozen=false;e.om=0;e.ang=0;place(e);e.y=1;e.clip='maskbreak';e.act=null;emitSound(s,'mask-crack3');impact(s,e,'spent');}
   else moves(s,e,t,ev);
   // A pumped swing is the hunter's work: the reel waits for a rest rung and gives up after two apexes.
   if(e.act?.id==='reel'&&e.act.stage==='wait'&&ev&2&&e.rung>=C.ledgeRung&&++e.act.t>2)endAct(s,e);
   else if(e.act?.id==='reel'&&e.act.stage==='wait'&&ev&2&&e.rung<C.ledgeRung){
    e.act=null;e.ai='reel';const f=tellFrames(s,e,'reel');e.reel={stage:'creak',t:f,frames:f,x:e.x,y:e.y};e.om=0;
   }
  }else if(--e.aiTimer<=0&&e.collapsed&&ev&1){e.ai='swing';e.rung=1;e.spin=0;e.gap=roll(e,C.neutral[1]);}
 }else if(e.ai==='open'){
  e.clip='hit';e.open=e.aiTimer;
  if(--e.aiTimer<=0)closeOpening(s,e);
 }else if(e.ai==='reel')reelTick(s,e,t);
 else if(e.ai==='transition')snapTick(s,e);
 else if(e.ai==='spent'){e.clip='maskbreak';}
 e.clip=e.ai==='swing'?(e.glass?'glassidle':e.act&&e.act.stage!=='swing'&&e.act.stage!=='pump'&&e.act.stage!=='wait'&&e.act.stage!=='drop'?(e.act.stage==='tell'||e.act.stage==='hold'?'telegraph':'sweep'):'idle'):e.clip;
 if(e.ai==='transition'||e.ai==='reel'&&e.reel.stage!=='settle'||e.act||e.husks.length||e.glass&&e.ai!=='spent'||Math.abs(t.x-e.x)<e.w/2+2.5&&e.ai==='swing')e.stats.threat++;
}
