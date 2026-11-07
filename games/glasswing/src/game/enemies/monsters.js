import {emitSound} from '../../core/sound.js';
import {entity,nearestLiving} from '../../core/entity.js';
import {physics,overlap} from '../../core/physics.js';
import {emit} from '../../core/combat.js';
import {hashSeed} from '../../core/rng.js';
import {MONSTERS,MON} from '../../data/monsters.js';
import {WILD as W} from '../../data/enemies.js';
import {F} from '../../data/feel.js';
import {data,neutral,land,heavy,tell,solidBelow} from './monster-kit.js';
import {NAVE_TICKS,naveInit} from './nave.js';
import {MERE_TICKS,mereInit} from './mere.js';
import {HINDWING_TICKS,hindwingInit,crack} from './hindwing.js';

// The spoke bestiary in the simulation. Levels spawn these kinds through spawnEnemy (src/game/enemies/wild.js), which
// routes here; their tick, damage rule and hazards live here and in the family files. Everything a monster needs is
// created on its own entity or in s.mon (made on the first monster spawn, with its own seeded stream), so a run that
// never meets one keeps every field, draw and digest it had.
const TICKS={...NAVE_TICKS,...MERE_TICKS,...HINDWING_TICKS};
const air={gravity:false},ground={gravity:true};
const hit={x:0,y:0,w:0,h:0};

export function monsterState(s){
 if(!s.mon)s.mon={rng:hashSeed(s.config.seed+':monsters'),area:s.area,blobs:[],puddles:[],shocks:[],audit:{hits:0,min:9999,kinds:{},by:{}}};
 return s.mon;
}

export function spawnMonster(s,spawn){
 monsterState(s);
 const d=MONSTERS[spawn.kind],count=d.count?Math.max(d.count[0],Math.min(d.count[1],spawn.count||1)):1;
 let first=null;
 for(let i=0;i<count;i++){
  const e=entity(s.nextId++,'brawler',spawn.x+(count>1?(i-(count-1)/2)*.7:0),spawn.y||W.spawnY,2,s.config.difficulty);
  const hp=d.hp*(s.config.mode==='coop'?F.coopHP:1)*(d.glass&&s.config.difficulty==='hard'?d.glass:1);
  Object.assign(e,{
   kind:spawn.kind,beast:true,family:d.family,w:d.body.w,h:d.body.h,hp,maxHp:hp,eye:'#8C8C94',eliteHits:0,
   elite:MON.xpElite.includes(spawn.kind),minion:!!spawn.mother||i>0,wave:spawn.wave,homeX:e.x,homeY:e.y,dropped:false,
   wait:(spawn.delay||0)+i*6,act:null,gap:0,told:0,poiseLeft:0,exposed:0,stunned:false,struck:0,struckT:0,v4:d.family!=='nave'&&spawn.kind!=='mirror-skater'
  });
  if(d.family==='nave')naveInit(e);
  else if(d.family==='mere')mereInit(e);
  else hindwingInit(s,e,{flock:first?first.flock:e.id,slot:i,of:count,mother:spawn.mother});
  s.enemies.push(e);
  if(!first)first=e;
 }
 return first;
}

export function monsterTick(s,e){
 const target=nearestLiving(s.players,e.x);
 if(!target||Math.abs(e.x-s.camera.x)>F.activation)return;
 const d=data(e),motion=d.flying?air:ground;
 if(e.inv>0)e.inv--;
 if(e.flash>0)e.flash--;
 if(e.exposed>0)e.exposed--;
 // Spawn delay: it rises out of the floor or drifts in, harmless.
 if(e.wait>0){e.wait--;e.clip='rise';e.vx=0;if(d.flying)e.vy=0;move(s,e,motion);return;}
 if(e.stun>0){
  if(!e.stunned)stagger(s,e);
  e.stun--;e.vx*=W.friction;if(d.flying)e.vy*=W.friction;e.clip='hit';
  move(s,e,motion);
  if(e.stun<=0){e.stunned=false;neutral(s,e);}
  return;
 }
 if(e.struckT>0&&--e.struckT===0)e.struck=0;
 // Mashing is answered: a burst of hits in a short window triggers the kind's counter (its own full tell).
 // The tell starts on this frame and the family tick waits for the next one, so it lasts its full length on screen.
 let fresh=false;
 if(d.counter&&e.struck>=d.counter.hits&&!e.hidden&&!e.bloomNext&&(e.ai==='idle'||e.ai==='recover'&&e.aiTimer<e.aiFrames/2)){
  e.struck=0;const move=e.phase===2&&d.counter.p2||d.counter.move;
  if(move==='sink'){if(e.grounded&&solidBelow(s.level,e.x,e.y)){e.ai='sink';e.aiTimer=e.aiFrames=d.sink;e.vx=0;fresh=true;}}
  else{tell(s,e,move,d.moves[move].tell,target);fresh=true;}
 }
 // A hunter standing on a ledge out of reach above: the family files answer once e.perch reaches MON.perch.wait.
 const P=MON.perch;
 e.perch=!d.flying&&!e.hidden&&e.ai==='idle'&&target.grounded&&target.y-e.y>=P.dy&&Math.abs(target.x-e.x)<P.dx?(e.perch||0)+1:0;
 if(e.ai==='hop'){hopTick(s,e,target);move(s,e,motion);return;}
 if(!fresh)TICKS[e.kind](s,e,target);
 // Watchdog: a monster left choosing nothing for 4 s walks at the hunter until a move fits (never a stalled arena).
 e.idleT=e.ai==='idle'&&!e.gap?(e.idleT||0)+1:0;
 if(e.idleT>240&&!d.flying)e.vx=(target.x<e.x?-1:1)*(d.speed||.03);
 // The Sovereign's brood (P2): three sporelings bud from its back and join the fight.
 if(e.brood>0){spawnMonster(s,{kind:'sporeling',x:e.x,y:e.y+e.h,count:e.brood,mother:e.id,wave:e.wave});e.brood=0;}
 move(s,e,motion);
}
// The hop started by hop() (monster-kit.js): the crouch, then one exact jump onto the hunter's ledge; it lands and
// resumes. A hop that lands nowhere higher (blocked, or the hunter left) simply ends.
function hopTick(s,e,p){
 const P=MON.perch;
 if(e.aiTimer>0){
  e.vx=0;e.clip='crouch';
  if(--e.aiTimer===0){
   // Exact launch: apex = the hunter's feet + lift (capped); horizontal speed spreads the gap over the flight.
   const rise=Math.min(P.max,Math.max(0,p.y-e.y)+P.lift),vy=Math.sqrt(2*F.gravity*rise),air=Math.ceil(vy/F.gravity)+Math.ceil(Math.sqrt(2*P.lift/F.gravity));
   e.vy=vy;e.vx=Math.max(-P.speed,Math.min(P.speed,(p.x-e.x)/air));e.facing=p.x<e.x?-1:1;e.grounded=false;
   emit(s,e.x,e.y+.1,0xf1ece2,6);emitSound(s,'jump');
  }
  return;
 }
 e.clip='leap';
 if(e.grounded&&e.vy<=0){e.vx=0;neutral(s,e);}
}
function move(s,e,motion){
 physics(e,s.level,motion);
 // A locked wave keeps its monsters inside the hunter's bounds: nothing kites or lobs from where it cannot be reached.
 if(s.lock&&e.wave===s.lock.wave)e.x=Math.max(s.lock.left,Math.min(s.lock.right,e.x));
 if(e.y<W.fallY){e.dead=true;e.defeatedFrame=s.frame;}
}
// Entering a stun (a parry, a moult's gore or root, a shock kick, or a broken poise): the move is cancelled.
function stagger(s,e){
 const d=data(e),parried=e.vulnerable;
 e.stunned=true;e.act=null;e.ai='stun';e.hitIds.length=0;
 if(e.hidden){e.hidden=false;e.inv=0;}
 if(e.up)e.up=false;
 if(d.stun)e.stun=Math.min(e.stun,d.stun);
 if(parried&&e.armour){
  if(e.kind==='husk-sovereign'){if(e.phase===1)e.bloomNext=true;}
  else crack(s,e,d.break);
 }
}

// Called by hurt() for every hit on a monster before the shared damage rule. Returns the damage to apply, or -1 for
// an armour clank (no damage, a short stop, the attacker recoils).
export function monsterHurt(s,e,source,damage,projectile){
 const d=data(e),hard=heavy(source,projectile,damage);
 if(d.counter){e.struck++;e.struckT=45;}
 if(e.armour){
  if(e.kind==='cordyceps-husk'){
   if(!hard){
    emit(s,e.x+(source.x<e.x?-.4:.4),e.y+e.h*.6,0xf1ece2,5);emitSound(s,'block');s.hitStop=Math.max(s.hitStop,MON.clank);
    if(!projectile){source.knockback=(source.x<e.x?-1:1)*.3;source.knockFrames=4;}
    return -1;
   }
   crack(s,e,d.break);
  }else{
   // The Sovereign's P1 plates: a third of the damage, and heavy hits count toward the bloom.
   if(hard&&++e.heavyHits>=d.heavy)e.bloomNext=true;
   if(!hard)damage*=d.plate;
  }
 }
 if(e.exposed>0)damage*=MON.exposed;
 // P1 holds at the bloom threshold: the rest of the HP is fought open.
 if(e.kind==='husk-sovereign'&&e.phase===1){
  const floor=Math.ceil(e.maxHp*d.bloomAt);
  if(e.hp-damage*(e.vulnerable?F.vulnerableDamage:1)<=floor){damage=Math.max(0,(e.hp-floor)/(e.vulnerable?F.vulnerableDamage:1));e.bloomNext=true;}
 }
 // Poise: enough hits during a tell break it (a short stagger); armoured and roaring bodies keep their tells.
 if(e.ai==='telegraph'&&e.poiseLeft>0&&!e.armour&&--e.poiseLeft===0)e.stun=Math.max(e.stun,d.stagger||16);
 return damage;
}

// Wax blobs, hardened puddles and the Sovereign's floor shock. Hazards hurt hunters only and never move a monster.
export function monstersTick(s){
 const m=s.mon;
 if(m.area!==s.area){m.area=s.area;m.blobs.length=0;m.puddles.length=0;m.shocks.length=0;}
 for(let i=m.blobs.length-1;i>=0;i--){
  const b=m.blobs[i],B=MONSTERS[b.kind].blob;
  b.px=b.x;b.py=b.y;b.age++;b.vy-=B.gravity;b.x+=b.vx;b.y+=b.vy;
  let gone=false;
  for(const p of s.players){
   if(p.dead||Math.abs(p.x-b.x)>p.w/2+B.radius||b.y+B.radius<p.y||b.y-B.radius>p.y+p.h)continue;
   const r=land(s,p,{x:b.x-b.vx,y:b.y,eye:'#8C8C94',team:2,kind:b.kind,act:'blob'},false,b.told+b.age,b.kind);
   if(r!=='immune'){gone=true;emit(s,b.x,b.y,0x62f0ff,6);break;}
  }
  if(!gone&&b.age>=MONSTERS[b.kind].blob.flight){
   m.puddles.push({x:b.tx,y:b.ty,age:0,told:b.told+b.age,kind:b.kind});emit(s,b.tx,b.ty+.1,0xf1ece2,6);emitSound(s,'blast-hit');gone=true;
  }
  if(gone)m.blobs.splice(i,1);
 }
 for(let i=m.puddles.length-1;i>=0;i--){
  const u=m.puddles[i],B=MONSTERS[u.kind].blob;u.age++;
  if(u.age>B.set+B.hard+B.crumble){m.puddles.splice(i,1);continue;}
  if(u.age<=B.set||u.age>B.set+B.hard)continue;
  hit.x=u.x;hit.y=u.y;hit.w=B.half*2;hit.h=B.height;
  for(const p of s.players)if(!p.dead&&overlap(hit,p))land(s,p,{x:u.x,y:u.y,eye:'#8C8C94',team:2,kind:u.kind,act:'crust'},false,u.told+u.age,u.kind);
 }
 for(let i=m.shocks.length-1;i>=0;i--){
  const k=m.shocks[i],S=MONSTERS[k.kind].shock;
  k.px=k.x;k.age++;k.x+=k.dir*S.speed;
  if(k.age>S.life||k.x<0||k.x>s.level.width){m.shocks.splice(i,1);continue;}
  hit.x=k.x;hit.y=k.y;hit.w=.6;hit.h=S.height;
  for(const p of s.players)if(!p.dead&&overlap(hit,p))land(s,p,{x:k.x-k.dir,y:k.y,eye:'#8C8C94',team:2,kind:k.kind,act:'shock'},false,k.told+k.age,k.kind);
 }
}
