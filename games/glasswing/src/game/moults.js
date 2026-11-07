import {emitSound} from '../core/sound.js';
import {random} from '../core/rng.js';
import {overlap,solid,tile} from '../core/physics.js';
import {hurt,heal,emit} from '../core/combat.js';
import {F} from '../data/feel.js';
import {KINDS} from '../data/kinds.js';
import {UPGRADE_VALUES as U} from '../data/upgrades.js';
import {MOULTS,MOULT_IDS,AFFINITY,MV,XP,xpNext} from '../data/moults.js';
import {draftCards5} from './moults5.js';

// Rules-v4 only: every helper is reached through a player that carries a moults list.
export const baseId=id=>id.endsWith('-deep')?id.slice(0,-5):id;
export const depth=(e,id)=>!e.moults?0:e.moults.includes(id+'-deep')?2:e.moults.includes(id)?1:0;
export const mv=(e,id,key)=>{const d=depth(e,id);return d?MV[key][d-1]:0;};
export const validMoult=id=>typeof id==='string'&&Object.hasOwn(MOULTS,baseId(id));

export function initProgress(p,moults=[]){
 Object.assign(p,{level:1,xp:0,xpNext:xpNext(1),drafts:0,moults:[],emberHits:0,patient:0,goreIds:[],cling:0});
 for(const id of moults)if(validMoult(id)&&!p.moults.some(m=>MOULTS[baseId(m)]===MOULTS[baseId(id)]))p.moults.push(id);
}

// Raw bonuses share one cap; Glass is a mode multiplier, applied separately.
export function damageBonus(e,stat){
 let bonus=mv(e,'horns-lantern','lantern');
 if((stat==='punch'||stat==='kick')&&e.upgrades.includes('heavyFists'))bonus+=U.heavyFists/KINDS[e.kind][stat];
 return Math.min(MV.damageCap,bonus);
}
export function glassMultiplier(e){
 return Math.max(e.upgrades.includes('glassHeart')?U.glassHeart:F.glassMultiplier,mv(e,'sigil-kiln','kiln'));
}

export function gainXP(s,p,target){
 if(p.level===undefined||target.minion||target.boss||s.hall)return;
 p.xp+=target.elite?XP.elite:XP.wild;
 while(p.xp>=p.xpNext){p.xp-=p.xpNext;p.level++;p.xpNext=xpNext(p.level);p.drafts++;emitSound(s,'altar-chime');}
 if(depth(p,'sigil-patient')&&++p.patient>=mv(p,'sigil-patient','patientKills')){
  p.patient=0;if(!p.glass&&p.mask<p.maxMask){heal(p,1);emit(s,p.x,p.y+p.h,0xffb347,6);}
 }
}

// Moults a player may still be offered: an unowned branch in an empty slot, or a deepening.
export function draftPool(p){
 const pool=[];
 for(const id of MOULT_IDS){
  const owned=p.moults.find(m=>MOULTS[baseId(m)]===MOULTS[id]);
  if(!owned||owned===id)pool.push(id);
 }
 return pool;
}
// Three seeded cards: one from the kind's affinity, one new slot, one wildcard (a deepening when possible).
export function draftCards(rng,p){
 const pool=draftPool(p),cards=[],kinds=[];
 const pick=(list,kind)=>{
  const open=list.filter(id=>!cards.includes(id));
  if(open.length){cards.push(open[Math.floor(random(rng)*open.length)]);kinds.push(kind);}
 };
 pick(pool.filter(id=>AFFINITY[p.kind].includes(id)),'affinity');
 pick(pool.filter(id=>!p.moults.includes(id)),'any');
 pick(pool.filter(id=>p.moults.includes(id)),'wild');
 while(cards.length<XP.cards&&pool.some(id=>!cards.includes(id)))pick(pool,'wild');
 return {cards,kinds};
}
export function startDraft(s){
 for(let i=0;i<s.players.length;i++){
  const p=s.players[i];
  if(!(p.drafts>0)||p.dead)continue;
  const {cards,kinds}=(s.config.moults5?draftCards5:draftCards)(s.moultRng,p);
  if(!cards.length){p.drafts=0;continue;}
  s.draft={player:i,cards,kinds,delay:XP.draftDelay,level:p.level-p.drafts+1};s.draftId++;
  s.phase='moult';emitSound(s,'altar-chime');
  return true;
 }
 return false;
}
export function chooseMoult(s,index){
 const d=s.draft,p=s.players[d.player],id=d.cards[index];
 if(!id)return;
 const at=p.moults.indexOf(id);
 if(at>=0)p.moults[at]=id+'-deep';else p.moults.push(id);
 p.drafts--;s.draft=null;s.phase='playing';
 emit(s,p.x,p.y+p.h*.7,0xffb347,14);emitSound(s,'shard-pickup');
}

const wall=(e,dir,level)=>{
 const x=dir>0?e.x+e.w/2+.06:e.x-e.w/2-.06;
 if(x<=0||x>=(level.width||F.defaultLevelWidth))return true;
 for(let y=Math.floor(e.y+.1);y<=Math.floor(e.y+e.h-.1);y++)if(solid(tile(level,Math.floor(x),y)))return true;
 return false;
};
// Hook Claws: hold toward a wall in the air to cling; jump kicks off it. Returns true on a wall jump.
export function wallTick(e,axis,level,jumpSpeed){
 e.cling=!e.grounded&&axis&&e.vy<=.1&&wall(e,axis,level)?axis:0;
 if(!e.cling)return false;
 if(e.jumpBuffer){
  e.vy=jumpSpeed;e.knockback=-e.cling*mv(e,'arms-hook','hookPush');e.knockFrames=MV.hookFrames;
  e.facing=-e.cling;e.jumps=1;e.jumpBuffer=0;e.cling=0;e.clip='jump';
  return true;
 }
 e.vy=Math.max(e.vy,-mv(e,'arms-hook','hookSlide'));e.glide=Math.max(e.glide,1);
 return false;
}

const box={x:0,y:0,w:0,h:0};
// Ram Crescents: the dash breaks breakable tiles and gores each enemy it passes once.
export function dashTick(s,e,targets){
 if(!depth(e,'horns-ram'))return;
 const ahead=Math.floor(e.x+e.facing*(e.w/2+.3));
 for(let y=Math.floor(e.y+.05);y<=Math.floor(e.y+e.h-.05);y++){
  if(s.level.grid[y]?.[ahead]===4){s.level.grid[y][ahead]=0;s.levelRevision++;emit(s,ahead+.5,y+.5,0xa9d68a);}
 }
 box.x=e.x+e.facing*.3;box.y=e.y;box.w=e.w+.6;box.h=e.h;
 for(const t of targets){
  if(t.team===e.team||t.dead||e.goreIds.includes(t.id)||!overlap(box,t))continue;
  e.goreIds.push(t.id);
  if(hurt(s,t,e,mv(e,'horns-ram','gore'),{stop:F.swordStop})==='hit'&&!t.boss)t.stun=Math.max(t.stun,mv(e,'horns-ram','goreStun'));
 }
}
export function dashEnd(s,e){
 const inv=mv(e,'back-rook','rookInv');
 if(inv){e.inv=Math.max(e.inv,inv);emit(s,e.x,e.y+e.h*.6,0x2a1c33,6);}
}
// Root Tail: land while holding down after a real fall to slam the ground.
export function rootSlam(s,e,targets){
 const r=mv(e,'tail-root','rootRadius');
 emit(s,e.x,e.y+.1,0xffb347,10);emitSound(s,'land');s.shake=F.shakeFrames;
 for(const t of targets){
  if(t.team===e.team||t.dead||Math.abs(t.x-e.x)>r+t.w/2||t.y>e.y+1.2)continue;
  if(hurt(s,t,e,mv(e,'tail-root','rootDamage'),{stop:F.swordStop,impactX:e.x})==='hit'&&!t.boss){
   t.vy=F.kickLaunch;t.stun=Math.max(t.stun,mv(e,'tail-root','rootStun'));
  }
 }
}
// Ember Bracers: every third (deep: second) melee hit throws an amber spark.
export function emberHit(s,e){
 const every=mv(e,'arms-ember','emberEvery');
 if(!every||++e.emberHits<every)return;
 e.emberHits=0;
 for(const p of s.projectiles){
  if(p.active)continue;
  Object.assign(p,{active:true,x:e.x+e.facing*F.orbForward,y:e.y+e.h*F.orbHeight,vx:e.facing*MV.emberSpeed,vy:0,
   radius:F.orbRadius*.8,damage:mv(e,'arms-ember','emberDamage'),team:e.team,owner:e.id,life:F.orbLifetime,
   range:MV.emberRange,travel:0,pierce:0,color:'#FFB347',unparryable:false,ivory:false,reflected:false});
  if(!p.hitIds)p.hitIds=[];
  p.hitIds.length=0;emitSound(s,'blast-fire');
  return;
 }
}
