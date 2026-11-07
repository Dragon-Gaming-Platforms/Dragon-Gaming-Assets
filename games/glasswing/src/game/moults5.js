import {emitSound} from '../core/sound.js';
import {random} from '../core/rng.js';
import {B,edge} from '../core/input.js';
import {overlap,physics,solid,tile} from '../core/physics.js';
import {hurt,emit} from '../core/combat.js';
import {F} from '../data/feel.js';
import {KINDS} from '../data/kinds.js';
import {XP} from '../data/moults.js';
import {VERBS,MOULTS5,MOULT5_IDS,AFFINITY5,VMV,SHARD} from '../data/moults5.js';
import {HUB} from '../data/hub.js';

// Verb moults (package moults5). Everything here is reached only through a player that carries `verbs`, which
// initVerbs creates only when config.moults5 is set: v1-4 runs, replays and digests never touch this file's state.
// The state is plain numbers; no draw from s.rng (the draft uses s.moultRng exactly like the v4 draft).
export const verbs5=s=>!!(s.config.moults5&&s.config.rulesVersion>=4&&s.config.mode!=='versus');
const base=id=>id.endsWith('-deep')?id.slice(0,-5):id;
export const depth5=(e,id)=>!e.moults?0:e.moults.includes(id+'-deep')?2:e.moults.includes(id)?1:0;
// [normal, deep] tables pick by depth; scalars are shared by both depths.
export const vmv=(e,id,key)=>{const d=depth5(e,id),v=VMV[key];return !d?0:Array.isArray(v)?v[d-1]:v;};
export const isVerb=id=>typeof id==='string'&&Object.hasOwn(VERBS,base(id));

export function initVerbs(p,moults=[]){
 for(const id of moults){
  if(!isVerb(id)||p.moults.some(m=>MOULTS5[base(m)]===MOULTS5[base(id)]))continue;
  p.moults.push(id);
 }
 p.verbs={mode:'',t:0,cd:0,cx:0,cy:0,cvx:0,cvy:0,ax:0,ay:0,ledge:0,foe:0,fid:0,snap:0,snapX:0,snapY:0,
  ring:0,ringX:0,ringY:0,ringR:0,spineCd:0,flare:0,fling:0,lastX:p.x,lastY:p.y,inv:0,at:0};
}

// The v4 draft over fifteen branches. The second card is a verb whose slot is still empty whenever one exists,
// so every level-up offers a new power until the body is full.
export function draftPool5(p){
 const pool=[];
 for(const id of MOULT5_IDS){
  const owned=p.moults.find(m=>MOULTS5[base(m)]===MOULTS5[id]);
  if(!owned||owned===id)pool.push(id);
 }
 return pool;
}
export function draftCards5(rng,p){
 const pool=draftPool5(p),cards=[],kinds=[];
 const pick=(list,kind)=>{
  const open=list.filter(id=>!cards.includes(id));
  if(!open.length)return false;
  cards.push(open[Math.floor(random(rng)*open.length)]);kinds.push(kind);return true;
 };
 pick(pool.filter(id=>AFFINITY5[p.kind].includes(id)),'affinity');
 if(!pick(pool.filter(id=>VERBS[id]&&!p.moults.includes(id)),'verb'))pick(pool.filter(id=>!p.moults.includes(id)),'any');
 pick(pool.filter(id=>p.moults.includes(id)),'wild');
 while(cards.length<XP.cards&&pool.some(id=>!cards.includes(id)))pick(pool,'wild');
 return {cards,kinds};
}

const freeMotion={gravity:false,drop:false};
const box={x:0,y:0,w:0,h:0};
const foe=(e,t)=>t.team!==e.team&&!t.dead;
// A wild foe hit by a verb loses its swing (its tell restarts after the stun): the verb's reward for timing.
function interrupt(t,stun){
 if(t.boss)return;
 t.stun=Math.max(t.stun,stun);
 if(t.ai==='telegraph'||t.ai==='attack'){t.ai='idle';t.aiTimer=VMV.interrupt;t.vx=0;}
}
function end(v){v.mode='';v.t=0;}
// In the Hub, Block in the air within reach of an amber knot is the Amber Thread's (src/game/hub.js attach, same test),
// so the Tether Claw never fires with it; a hunter the Thread cannot take (dodging, in a form, cooling down) keeps it.
function threadOwns(s,e){
 const w=s.world,L=s.level,T=HUB.thread;
 if(!w||w.fight||!w.echoes?.includes('thread')||!L.hub?.knots?.length||e.dodge||e.form||e.formShift||(e.threadCd||0)>1)return false;
 const hand=e.h*T.hand;
 return L.hub.knots.some(k=>{const dx=Math.round((e.x-k.x)*1000),dy=Math.round((k.y-e.y-hand)*1000);return dy>0&&dx*dx+dy*dy<(T.reach+1)**2;});
}

// Called by playerTick before the guard (rules v4 player with `verbs`). Returns true when the verb owns this tick.
export function verbTick(s,e,input,targets){
 const v=e.verbs;
 if(v.cd>0)v.cd--;
 if(v.spineCd>0)v.spineCd--;
 if(v.snap>0)v.snap--;
 if(v.ring>0)v.ring--;
 if(v.flare>0)v.flare--;
 if(v.fling>0)v.fling=e.inv>v.inv?0:v.fling-1;
 // A respawn or area change teleports the body, a new hit (fresh invulnerability) breaks any verb in progress, and
 // a verb never resumes after a long pause in the player's ticks (a possession form, a draft; hit-stops are shorter).
 if(v.mode&&(Math.abs(e.x-v.lastX)>2||Math.abs(e.y-v.lastY)>2||e.inv>v.inv||s.frame-v.at>VMV.stale))end(v);
 // Glass Spines: the first free tick after a perfect parry (hit-stop has passed).
 if(e.parryFlash===F.parryStop-1&&!v.spineCd&&depth5(e,'back-spines'))spines(s,e);
 // On the Amber Thread the cord owns the hunter: no verb starts or runs while it swings.
 if(e.swing){if(v.mode)end(v);v.lastX=e.x;v.lastY=e.y;v.inv=e.inv;v.at=s.frame;return false;}
 let used=false;
 if(v.mode==='claw')clawTick(s,e,input,targets);
 else if(v.mode==='zip')used=zipTick(s,e,input,targets);
 else if(v.mode==='windup'||v.mode==='ram')used=ramTick(s,e,targets);
 else if(v.mode==='hang'||v.mode==='drop')used=shellTick(s,e,targets);
 else if(!e.dodge)used=startVerb(s,e,input);
 v.lastX=e.x;v.lastY=e.y;v.inv=e.inv;v.at=s.frame;
 // A verb that owns the tick is never also a guard (Down + Dodge pressed while holding Block).
 if(used){e.prev=input;e.blocking=false;e.blockAge=F.blockInactiveAge;}
 return used;
}

function startVerb(s,e,input){
 const v=e.verbs,down=!!(input&B.down),dodge=edge(input,e.prev,B.dodge)&&e.dodgeCd===0;
 // Battering Brow: Down + Dodge on the ground. Ram and Shell Drop replace the dodge, so they share its cooldown
 // (a perfect parry refreshes it, as it does the dodge).
 if(dodge&&down&&e.grounded&&depth5(e,'horns-charge')){
  v.mode='windup';v.t=VMV.ramWindup;e.dodgeCd=vmv(e,'horns-charge','ramCd');
  e.move=null;e.charge=0;e.vx=0;e.clip='block';
  // Its own low thud: the enemy-telegraph cue stays reserved for threats.
  emitSound(s,'punch3');emit(s,e.x+e.facing*.4,e.y+e.h*.9,0xffb347,5);
  return true;
 }
 // Shell Drop: Down + Dodge in the air.
 if(dodge&&down&&!e.grounded&&depth5(e,'sigil-shell')){
  v.mode='hang';v.t=VMV.shellHang;e.dodgeCd=vmv(e,'sigil-shell','shellCd');
  e.move=null;e.charge=0;e.vy=0;e.clip='block';
  emitSound(s,'dodge');emit(s,e.x,e.y+e.h*.6,0xf1ece2,6);
  return true;
 }
 // Cricket Legs: Block held until the legs glow, then Jump.
 if(e.grounded&&e.blocking&&input&B.block&&edge(input,e.prev,B.jump)&&depth5(e,'legs-cricket')&&e.blockAge>=vmv(e,'legs-cricket','brace')){
  leap(s,e,input);return true;
 }
 // The first frame the leap is ready: a chime and an amber puff at the feet (readable without looking at the ring).
 if(e.grounded&&e.blocking&&input&B.block&&depth5(e,'legs-cricket')&&e.blockAge===vmv(e,'legs-cricket','brace')){
  emitSound(s,'pogo');emit(s,e.x,e.y+.15,0xffb347,6);
 }
 // Tether Claw: Block in the air (the guard only works on the ground) throws it up and ahead; with Down, down and ahead.
 if(!e.grounded&&edge(input,e.prev,B.block)&&!v.cd&&depth5(e,'arms-tether')&&!threadOwns(s,e)){
  v.mode='claw';v.t=vmv(e,'arms-tether','tetherReach');v.cd=vmv(e,'arms-tether','tetherCd');v.foe=0;
  v.cx=e.x+e.facing*(e.w/2+.1);v.cy=e.y+e.h*.6;v.cvx=e.facing*VMV.tetherSpeed;v.cvy=down?-VMV.tetherRise:VMV.tetherRise;
  emitSound(s,'sword-swing');
  return false;
 }
 return false;
}

function leap(s,e,input){
 const k=KINDS[e.kind],axis=Number(!!(input&B.right))-Number(!!(input&B.left));
 const jump=Math.sqrt(2*F.gravity*k.jump)+F.gravity/2;
 if(axis)e.facing=axis;
 e.vy=jump*vmv(e,'legs-cricket','leap');e.vx=axis*k.speed/F.hz;
 e.grounded=false;e.jumps=1;e.coyote=0;e.jumpBuffer=0;e.blocking=false;e.blockAge=F.blockInactiveAge;e.clip='jump';
 emitSound(s,'doublejump');emit(s,e.x,e.y,0xa9d68a,8);emit(s,e.x,e.y+.2,0xffb347,6);
 physics(e,s.level);
}

function clawTick(s,e,input,targets){
 const v=e.verbs,level=s.level;
 v.cx+=v.cvx;v.cy+=v.cvy;v.t--;
 const r=VMV.tetherHit;
 // A claw already inside terrain bites the terrain: it never reaches a foe through a wall.
 const walled=solid(tile(level,Math.floor(v.cx),Math.floor(v.cy)));
 for(const t of targets){
  if(walled)break;
  if(!foe(e,t)||Math.abs(v.cx-t.x)>t.w/2+r||v.cy<t.y-r||v.cy>t.y+t.h+r)continue;
  const dir=t.x>=e.x?1:-1;
  if(t.boss||t.eliteHits>0){
   // A heavy foe: the claw bites and pulls you in beside it (never into it: the pull ends without drift or fling).
   v.mode='zip';v.t=VMV.tetherZip;v.ax=t.x-dir*(t.w/2+e.w/2+.15);v.ay=Math.max(t.y,v.cy-e.h*.6);v.ledge=0;v.foe=1;v.fid=t.id;
   emitSound(s,'block');emit(s,v.cx,v.cy,0xffb347,6);
  }else{
   // A light foe: yanked to your feet, its swing broken.
   if(hurt(s,t,e,vmv(e,'arms-tether','yankDamage'),{stop:F.hitStop,knock:0,impactX:e.x})==='hit'&&!t.dead){
    t.knockback=-dir*Math.min(Math.max(0,Math.abs(t.x-e.x)-(t.w+e.w)/2-.3),VMV.yankMax);
    t.knockFrames=VMV.yankFrames;interrupt(t,vmv(e,'arms-tether','yankStun'));
   }
   v.snap=8;v.snapX=v.cx;v.snapY=v.cy;end(v);emitSound(s,'kick');
  }
  return;
 }
 const tx=Math.floor(v.cx);let ty=Math.floor(v.cy);
 // Thrown up and ahead, the claw also catches a lip it skims: a solid tile whose top is at most one tile under it.
 if(v.cvy>=0&&!solid(tile(level,tx,ty))&&solid(tile(level,tx,Math.floor(v.cy-VMV.tetherLip))))ty=Math.floor(v.cy-VMV.tetherLip);
 const dir=v.cvx>0?1:-1;
 if(solid(tile(level,tx,ty))&&v.cvy<0&&Math.floor(v.cy-v.cvy)>ty){
  // Thrown down onto a floor: the claw bites the ground ahead and pulls you down to it.
  v.mode='zip';v.t=VMV.tetherZip;v.ax=v.cx-dir*(e.w/2+.05);v.ay=ty+1;v.ledge=0;v.cy=ty+1;
  emitSound(s,'block');emit(s,v.cx,v.cy,0xf1ece2,6);
  return;
 }
 if(solid(tile(level,tx,ty))){
  // A wall or a ledge: zip to it; a free tile above means a ledge you vault onto.
  v.mode='zip';v.t=VMV.tetherZip;v.ax=dir>0?tx-e.w/2-.05:tx+1+e.w/2+.05;
  v.ledge=solid(tile(level,tx,ty+1))?0:1;
  // Beside a ledge the pull ends with the feet just under its top, so the hop lands on it.
  v.ay=v.ledge?ty+1-VMV.tetherLedge:v.cy-e.h*.6;
  v.cx=dir>0?tx:tx+1;if(v.ledge)v.cy=ty+1;
  emitSound(s,'block');emit(s,v.cx,v.cy,0xf1ece2,6);
  return;
 }
 if(v.t<=0||v.cx<0||v.cx>(level.width||F.defaultLevelWidth)||v.cy>level.grid.length+2){v.snap=6;v.snapX=v.cx;v.snapY=v.cy;end(v);}
}

function zipTick(s,e,input,targets){
 const v=e.verbs;
 // A pull to a foe follows it (the claw stays in its body), and lets go if it dies.
 if(v.foe){
  let t=null;for(const o of targets)if(o.id===v.fid&&!o.dead){t=o;break;}
  if(!t){zipEnd(e,0);return true;}
  const side=t.x>=e.x?1:-1;v.ax=t.x-side*(t.w/2+e.w/2+.15);v.cx=t.x-side*t.w*.3;
 }
 const dx=v.ax-e.x,dy=v.ay-e.y,m=Math.max(Math.abs(dx),Math.abs(dy));
 // Jump cancels the pull into an air jump (the tech: claw, pull, jump off at speed). A pull through terrain keeps its
 // sideways speed as a fling (a knockback-style push, so it stacks with the run speed); a pull to a foe never does.
 if(edge(input,e.prev,B.jump)){
  const vx=v.foe||v.t>=VMV.tetherZip?0:e.vx;zipEnd(e,dx);
  if(Math.abs(vx)>.05){e.knockback=Math.sign(vx)*VMV.tetherFling*Math.min(1,Math.abs(vx)/VMV.tetherPull[0]);e.knockFrames=v.fling=VMV.tetherFlingFrames;e.facing=Math.sign(vx);emit(s,e.x,e.y+e.h*.5,0xffb347,6);}
  return false;
 }
 if(m<=VMV.tetherStop||v.t--<=0){zipEnd(e,dx);return true;}
 const sp=Math.min(vmv(e,'arms-tether','tetherPull'),m),x=e.x,y=e.y;
 e.vx=dx/m*sp;e.vy=dy/m*sp;e.move=null;e.charge=0;e.clip='jump';
 physics(e,s.level,freeMotion);
 if(Math.abs(e.x-x)+Math.abs(e.y-y)<.02)zipEnd(e,dx);
 return true;
}
function zipEnd(e,dx){
 const v=e.verbs;
 e.vy=VMV.tetherHop*(v.ledge?1.25:1);e.vx=v.foe?0:(dx>=0?1:-1)*.1;e.jumps=Math.min(e.jumps,1);e.coyote=0;
 end(v);
}

function ramTick(s,e,targets){
 const v=e.verbs;
 if(v.mode==='windup'){
  e.vx=0;e.clip='block';physics(e,s.level);
  if(--v.t<=0){v.mode='ram';v.t=vmv(e,'horns-charge','ramFrames');emitSound(s,'dodge');}
  return true;
 }
 // Brittle walls ahead break; the first foe met takes the headbutt and the charge ends in a recoil.
 const ahead=Math.floor(e.x+e.facing*(e.w/2+.3));
 for(let y=Math.floor(e.y+.05);y<=Math.floor(e.y+e.h-.05);y++){
  if(s.level.grid[y]?.[ahead]===4){s.level.grid[y][ahead]=0;s.levelRevision++;emit(s,ahead+.5,y+.5,0xa9d68a);s.shake=F.shakeFrames;}
 }
 box.x=e.x+e.facing*.3;box.y=e.y+e.h*.3;box.w=e.w+.6;box.h=e.h*.7;
 for(const t of targets){
  if(!foe(e,t)||!overlap(box,t))continue;
  // Armour breaks first: an elite's guard hits are stripped so the full blow lands.
  const armour=!t.boss&&t.eliteHits>0;if(armour)t.eliteHits=0;
  const result=hurt(s,t,e,vmv(e,'horns-charge','ramDamage'),{stop:F.swordStop,knock:VMV.ramKnock,impactX:e.x});
  if(result==='immune')continue;
  if(result==='hit'&&!t.dead)interrupt(t,vmv(e,'horns-charge','ramStun'));
  if(armour)emit(s,t.x,t.y+t.h*.6,0xf1ece2,14);
  emit(s,e.x+e.facing*.5,e.y+e.h*.8,0xffb347,10);emitSound(s,'kick');s.shake=F.shakeFrames*2;
  e.vx=0;e.knockback=-e.facing*VMV.ramRecoil;e.knockFrames=F.knockFrames;end(v);
  return true;
 }
 e.vx=e.facing*VMV.ramSpeed;e.clip='punch3';
 const x=e.x;physics(e,s.level);
 if(--v.t<=0||Math.abs(e.x-x)<.01){
  if(Math.abs(e.x-x)<.01){s.shake=F.shakeFrames;emit(s,e.x+e.facing*.4,e.y+e.h*.7,0xf1ece2,6);emitSound(s,'block');}
  e.vx=e.facing*VMV.ramSpeed*.4;end(v);
 }
 return true;
}

function shellTick(s,e,targets){
 const v=e.verbs,level=s.level;
 if(v.mode==='hang'){
  e.vx*=.5;e.vy=0;e.clip='block';physics(e,level,freeMotion);
  if(--v.t<=0){v.mode='drop';v.t=VMV.shellMax;emit(s,e.x,e.y+e.h,0xffb347,6);}
  return true;
 }
 // Brittle floors under the shell break as it passes.
 for(const y of [Math.floor(e.y-.01),Math.floor(e.y-VMV.shellFall)]){
  for(let x=Math.floor(e.x-e.w/2+.05);x<=Math.floor(e.x+e.w/2-.05);x++)if(level.grid[y]?.[x]===4){level.grid[y][x]=0;s.levelRevision++;emit(s,x+.5,y+.5,0xa9d68a);}
 }
 e.vx=0;e.vy=-VMV.shellFall;e.clip='block';
 physics(e,level,freeMotion);
 let struck=e.grounded;
 if(!struck)for(const t of targets)if(foe(e,t)&&!t.inv&&overlap(e,t)){struck=true;break;}
 if(struck){quake(s,e,targets);return true;}
 if(--v.t<=0||e.y<-2)end(v);
 return true;
}
function quake(s,e,targets){
 const v=e.verbs,r=vmv(e,'sigil-shell','shellRadius');
 for(const t of targets){
  if(!foe(e,t)||Math.abs(t.x-e.x)>r+t.w/2||t.y>e.y+1.5||t.y+t.h<e.y-.5)continue;
  if(hurt(s,t,e,vmv(e,'sigil-shell','shellDamage'),{stop:F.swordStop,impactX:e.x})==='hit'&&!t.dead&&!t.boss){
   t.vy=F.kickLaunch*2;interrupt(t,vmv(e,'sigil-shell','shellStun'));
  }
 }
 v.ring=VMV.shellRing;v.ringX=e.x;v.ringY=e.y;v.ringR=r;
 e.vy=vmv(e,'sigil-shell','shellBounce');e.grounded=false;e.jumps=1;e.coyote=0;e.clip='jump';
 s.shake=F.shakeFrames*2;emit(s,e.x,e.y+.1,0xffb347,12);emit(s,e.x,e.y+.1,0xa9d68a,8);emitSound(s,'land');emitSound(s,'divekick');
 end(v);
}

// Glass Spines: a fan of glass shards from the back toward the parried attacker (the facing).
function spines(s,e){
 const v=e.verbs,n=vmv(e,'back-spines','spines');
 let fired=0;
 for(const p of s.projectiles){
  if(fired>=n)break;
  if(p.active)continue;
  Object.assign(p,{active:true,x:e.x+e.facing*.3,y:e.y+e.h*.62,vx:e.facing*VMV.spineSpeed,vy:(fired-(n-1)/2)*VMV.spineSpread,
   radius:.14,damage:vmv(e,'back-spines','spineDamage'),team:e.team,owner:e.id,life:F.orbLifetime,range:VMV.spineRange,travel:0,
   pierce:vmv(e,'back-spines','spinePierce'),color:SHARD,unparryable:false,ivory:false,reflected:false});
  if(!p.hitIds)p.hitIds=[];
  p.hitIds.length=0;fired++;
 }
 if(fired){v.spineCd=VMV.spineCd;v.flare=14;emitSound(s,'blast-fire');emit(s,e.x-e.facing*.2,e.y+e.h*.7,0xe8f6f2,10);}
}
