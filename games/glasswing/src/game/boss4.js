import {emitSound} from '../core/sound.js';
import {entity} from '../core/entity.js';
import {random} from '../core/rng.js';
import {physics,overlap} from '../core/physics.js';
import {hurt,fire,emit} from '../core/combat.js';
import {BOSS4 as B} from '../data/boss4.js';
import {TIERS} from '../data/rules.js';
import {F} from '../data/feel.js';
import {spawnEnemy} from './enemies/wild.js';
import {depth,glassMultiplier} from './moults.js';
import {gainEmber} from './possession.js';
import {EMBER,POSSESSION} from '../data/forms.js';
import {chrysalisHurt,chrysalisParried} from './chrysalis.js';
import {fair,FAIR} from './fair.js';
import {tallowHurt,tallowParried} from './tallowgrave.js';
import {antiphonHurt} from './antiphon.js';
import {anchoriteHurt,anchoriteParried} from './anchorite.js';
import {cordyceaHurt,cordyceaParried} from './cordycea.js';
import {exuvialHurt,exuvialParried} from './exuvial.js';
import {chrysalis5Hurt,chrysalis5Parried} from './chrysalis5.js';

// Rules-v4 Old Glasswing: weighted seeded chains, tell tiers, armour outside earned openings,
// a 10% cap per opening, active phase transitions and its own Glass (desperation) at 0 HP.
const box={x:0,y:0,w:0,h:0};
const roll=(s,[a,b])=>a+Math.floor(random(s)*(b-a+1));
const tier=e=>e.glass?3:e.phase-1;
const face=(e,t)=>{e.facing=t.x<e.x?-1:1;};
const hitsTaken=s=>{let n=0;for(const p of s.players)n+=p.hits||0;return n;};

export function spawnBoss4(s){
 const e=entity(s.nextId++,'brawler',B.spawnX,B.spawnY,2,s.config.difficulty);
 const hp=Math.round(B.hp*(s.config.mode==='coop'?B.coopHP:1)*TIERS[s.config.difficulty].hp);
 Object.assign(e,{
  boss:true,v4:true,phase:1,hp,maxMask:hp,mask:hp,eye:'#19B8A6',w:e.w*F.bossSize,h:e.h*F.bossSize,
  ai:'enter',aiTimer:B.entrance,aiFrames:B.entrance,action:null,unparryable:false,pattern:null,step:0,
  history:[],seen:[],used:[],open:0,openDamage:0,riposte:false,chip:hp*B.chipCap,chipTimer:B.chipWindow,
  chainHits:0,sinceOpen:1,lastParry:-B.parryGap,far:0,still:0,desperate:0,falls:[],revealed:false,
  attempt:s.bossAttempts||0,stats:{frames:0,threat:0,openings:0,maxOpen:0,start:s.frame}
 });
 s.enemies.push(e);s.bossStarted=true;s.checkpoint=B.door;emitSound(s,'boss-roar');
 return e;
}

function neutral(s,e){
 e.vx=0;e.action=null;e.unparryable=false;
 if(e.glass&&e.desperate<=0){e.ai='spent';e.clip='maskbreak';emitSound(s,'mask-crack3');return;}
 e.ai='neutral';e.aiTimer=e.aiFrames=roll(s,B.neutral[tier(e)]);
}
function allowed(e,id){
 const h=e.history,n=h.length;
 // Never the same chain three times running, never the same pair twice in a row.
 return !(h[n-1]===id&&h[n-2]===id)&&!(n>=3&&h[n-3]===h[n-1]&&h[n-2]===id);
}
function choose(s,e,t){
 const list=B.patterns[tier(e)],dist=Math.abs(t.x-e.x);
 let pick=null;
 if(!t.grounded&&t.y>e.y+B.antiAir.height&&dist<B.antiAir.range)pick=list.find(p=>p.air);
 else if(e.far>=B.antiRange.frames)pick=list.find(p=>p.range);
 else if(e.still>=B.antiTurtle)pick=list.find(p=>p.turtle);
 if(pick&&!allowed(e,pick.id))pick=null;
 if(!pick){
  let total=0;
  for(const p of list)if(p.w&&allowed(e,p.id)&&!(p.once&&e.used.includes(p.id)))total+=p.w;
  let r=random(s)*total;
  for(const p of list){
   if(!p.w||!allowed(e,p.id)||p.once&&e.used.includes(p.id))continue;
   r-=p.w;if(r<0){pick=p;break;}
  }
  pick=pick||list[0];
 }
 if(pick.once)e.used.push(pick.id);
 if(pick.range)e.far=0;
 if(pick.turtle)e.still=0;
 e.history.push(pick.id);if(e.history.length>3)e.history.shift();
 e.pattern=pick;e.step=0;e.chainHits=hitsTaken(s);
 tell(s,e,t);
}
function tell(s,e,t){
 const id=e.pattern.m[e.step],m=B.moves[id],tr=tier(e),tight=TIERS[s.config.difficulty].tight;
 let tells=B.tells[tr<3?Math.min(2,tr+tight):3];
 // Teach every move slowly the first time it appears (Glass teaches at the test tier).
 if(tr<3&&!e.seen.includes(id)){tells=B.tells[tight];e.seen.push(id);}
 let frames=roll(s,tells);
 if(e.step>0)frames=Math.max(B.minTell,Math.round(frames*B.link));
 frames=Math.round(frames*TIERS[s.config.difficulty].tell);
 face(e,t);
 e.ai='telegraph';e.aiTimer=e.aiFrames=frames;e.action=id;e.clip='telegraph';e.vx=0;
 e.unparryable=!(m.parry||m.ivory);
 emitSound(s,'enemy-telegraph');
}
function wave(s,e,dir,m){
 const orb=fire(s,e,false,true);
 if(!orb)return;
 orb.x=e.x+dir*e.w/2;orb.y=m.waveY;orb.radius=m.waveRadius;orb.range=m.waveRange;orb.vx=dir*m.waveSpeed;
 orb.unparryable=true;orb.damage=m.damage;
}
function strikeStart(s,e,t){
 const id=e.action,m=B.moves[id];
 e.ai='attack';e.aiTimer=e.aiFrames=m.active;e.hitIds.length=0;e.clip=id;
 if(id==='slam'){wave(s,e,1,m);wave(s,e,-1,m);emit(s,e.x,1,0xffc77c,18);s.shake=F.shakeFrames*2;}
 else if(id==='lunge'){e.vy=m.leap;}
 else if(id==='summon'){
  for(let i=0;i<m.count;i++){
   const x=Math.max(B.arenaLeft+1,Math.min(s.level.width-1,e.x-e.facing*(m.offset+i*m.spacing)));
   spawnEnemy(s,{kind:'skimmer',x,y:m.y,delay:i*m.delay}).minion=true;
  }
  emitSound(s,'boss-roar');
 }
}
function strike(s,e,m){
 const f=e.facing;
 box.x=e.x+f*(m.x0+m.x1)/2;box.w=m.x1-m.x0;box.y=e.y+m.y0;box.h=m.y1-m.y0;
 for(const p of s.players){
  if(p.dead||e.hitIds.includes(p.id)||!overlap(box,p))continue;
  // Desperation strikes cost 2 masks, like signature moves.
  const result=hurt(s,p,e,e.glass?Math.max(B.despDamage,m.damage):m.damage,{stop:F.swordStop,unparryable:!m.parry,impactX:e.x});
  if(result!=='immune')e.hitIds.push(p.id);
  if(e.ai!=='attack')return;
 }
}
function strikeTick(s,e,t){
 const id=e.action,m=B.moves[id],f=e.facing,age=m.active-e.aiTimer;
 if(id==='sweep'){e.vx=f*m.step;strike(s,e,m);}
 else if(id==='slam')strike(s,e,m);
 else if(id==='barrage'&&age%m.interval===0){
  const orb=fire(s,e,false,true);
  if(orb){orb.y=m.lanes[Math.floor(random(s)*m.lanes.length)];orb.vx=f*m.speed;orb.ivory=true;orb.damage=m.damage;}
 }else if(id==='rush'){
  e.vx=f*m.speed;strike(s,e,m);
  if(e.x<=B.arenaLeft+e.w/2+.05&&f<0||e.x>=s.level.width-e.w/2-.05&&f>0){e.aiTimer=1;s.shake=F.shakeFrames*2;emit(s,e.x+f*e.w/2,2,0xf1ece2,16);}
 }else if(id==='lunge'){e.vx=f*m.drift;strike(s,e,m);}
 if(e.ai!=='attack')return;
 if(--e.aiTimer<=0){
  e.vx=0;e.step++;
  if(e.step<e.pattern.m.length){tell(s,e,t);return;}
  e.ai='recover';e.aiTimer=e.aiFrames=m.after;e.clip='idle';e.action=null;
 }
}
function openUp(s,e,frames,riposte){
 e.ai='open';e.aiTimer=e.aiFrames=e.open=frames;e.openDamage=0;e.riposte=riposte;e.sinceOpen=0;
 e.vx=0;e.clip='hit';e.action=null;e.unparryable=false;e.stats.openings++;
 emit(s,e.x,e.y+e.h*.55,0xffb347,12);
}
function closeOpening(s,e){
 e.stats.maxOpen=Math.max(e.stats.maxOpen,e.openDamage/e.maxMask);
 e.open=0;e.riposte=false;neutral(s,e);
}
export function bossParried(s,e,player){
 if(e.chrysalis5)return chrysalis5Parried(s,e,player);
 if(e.chrysalis)return chrysalisParried(s,e,player);
 if(e.tallow)return tallowParried(s,e,player);
 if(e.anchorite)return anchoriteParried(s,e,player);
 if(e.cordycea)return cordyceaParried(s,e,player);
 if(e.exuvial)return exuvialParried(s,e,player);
 if(e.dead||e.ai!=='attack')return;
 if(e.glass){defeat(s,e,player);return;}
 // A parry stuns at most once per gap; inside the gap it only deflects and the chain goes on.
 if(s.frame-e.lastParry>=B.parryGap){e.vx=0;e.hitIds.length=0;e.lastParry=s.frame;openUp(s,e,roll(s,B.parryStun),true);}
}
function defeat(s,e,source){
 e.hp=0;e.mask=0;e.dead=true;e.defeatedFrame=s.frame;e.clip='beaten';e.vx=0;e.vy=0;e.ai='spent';
 if(source&&source.team!==2&&source.kills!==undefined)source.kills++;
 emit(s,e.x,e.y+2,0xffb347,24);emitSound(s,'enemy-beaten');
}
function transition(s,e){
 e.open=0;e.riposte=false;e.phase++;e.ai='transition';e.aiTimer=e.aiFrames=B.transition;e.clip='summon';e.action=null;e.vx=0;
 s.shake=F.shakeFrames*3;emit(s,e.x,e.y+e.h,0xf1ece2,24);emitSound(s,'boss-roar');
}
function desperation(s,e){
 e.open=0;e.riposte=false;e.glass=true;e.desperate=B.desperation;e.hp=0;e.mask=0;
 e.ai='stagger';e.aiTimer=e.aiFrames=B.recoil;e.clip='maskbreak';e.action=null;e.vx=0;
 s.hitStop=F.swordStop;emit(s,e.x,e.y+e.h*.8,0xf1ece2,24);emitSound(s,'mask-shatter');
}
// Damage rules on the boss: amber openings take full damage up to the cap, ivory armour takes chip
// under a global cap, and enter/transition/desperation clank.
export function bossHurt(s,e,source,damage,projectile){
 if(e.chrysalis5)return chrysalis5Hurt(s,e,source,damage,projectile);
 if(e.chrysalis)return chrysalisHurt(s,e,source,damage,projectile);
 if(e.tallow)return tallowHurt(s,e,source,damage,projectile);
 if(e.antiphon)return antiphonHurt(s,e,source,damage,projectile);
 if(e.anchorite)return anchoriteHurt(s,e,source,damage,projectile);
 if(e.cordycea)return cordyceaHurt(s,e,source,damage,projectile);
 if(e.exuvial)return exuvialHurt(s,e,source,damage,projectile);
 // The spent boss falls to the first hit; hurt() then credits the defeat.
 if(e.ai==='spent'){e.hp=0;e.mask=0;e.dead=true;emit(s,e.x,e.y+2,0xffb347,24);return 'hit';}
 const clank=e.ai==='enter'||e.ai==='transition'||e.glass;
 if(projectile?.reflected&&(e.ai==='telegraph'||e.ai==='attack')){
  e.ai='stagger';e.aiTimer=e.aiFrames=B.reflectStagger;e.clip='hit';e.action=null;e.vx=0;
 }
 let take=0;
 const amber=!clank&&e.ai==='open';
 if(amber){
  let d=damage*(projectile?B.orb:1);
  if(e.riposte){d*=B.riposte;e.riposte=false;}
  take=Math.min(d,Math.max(0,e.maxMask*B.cap-e.openDamage));
  // Rules-v4 possession: one burst removes at most 12% of max HP; the opening cap still applies.
  if(source.form&&source.formBudget>=0)take=Math.min(take,source.formBudget);
  e.openDamage+=take;
  if(source.forms)gainEmber(s,source,EMBER.hit);
 }else if(!clank){
  const raw=source.glass&&source.upgrades?damage/glassMultiplier(source):damage;
  if(source.form&&source.formBudget>=0){
   // During a burst the chip cap rises to 3% per 5 s (e.formChip holds the extra 2%), inside the same budget.
   take=Math.min(raw*B.chip*(projectile?B.orb:1),e.chip+(e.formChip||0),source.formBudget);
   const base=Math.min(take,e.chip);e.chip-=base;if(take>base)e.formChip-=take-base;
  }else{take=Math.min(raw*B.chip*(projectile?B.orb:1),e.chip);e.chip-=take;}
 }
 if(source.form&&source.formBudget>=0)source.formBudget=Math.max(0,source.formBudget-take);
 const floor=e.phase<3?e.maxMask*B.thresholds[e.phase-1]:0;
 e.hp=Math.max(floor,e.hp-take);e.mask=e.hp;e.flash=F.flash;
 s.hitStop=Math.max(s.hitStop,amber?F.swordStop:F.hitStop);
 emit(s,source.x+(e.x-source.x)*.5,(source.y||e.y)+1,amber?0xffb347:clank?0x7fe8ff:0xf1ece2,amber?8:4);
 if(amber)s.shake=F.shakeFrames;
 if(clank){emitSound(s,'block');return 'hit';}
 if(e.hp<=floor){if(e.phase<3)transition(s,e);else desperation(s,e);}
 else if(amber&&e.openDamage>=e.maxMask*B.cap-1e-9){emit(s,e.x,e.y+e.h*.55,0x5c5650,10);closeOpening(s,e);if(source.forms)gainEmber(s,source,EMBER.cap);}
 return 'hit';
}
function falls(s,e,t){
 const d=B.debris;
 if(e.ai==='transition'&&e.aiTimer%d.every===0&&e.aiTimer>d.warn){
  const x=Math.max(B.arenaLeft+.5,Math.min(s.level.width-.5,t.x+d.spread[e.aiTimer/d.every%d.spread.length|0]));
  e.falls.push({x,t:d.warn});
 }
 for(let i=e.falls.length-1;i>=0;i--){
  const f=e.falls[i];
  if(f.t%6===0)emit(s,f.x,d.y-.4,0xf1ece2,2);
  if(--f.t>0)continue;
  e.falls.splice(i,1);
  const orb=fire(s,e,false,true);
  if(orb){orb.x=f.x;orb.y=d.y;orb.vx=0;orb.vy=d.speed;orb.radius=d.radius;orb.range=99;orb.unparryable=true;}
 }
}

export function bossTick4(s,e){
 if(e.dead)return;
 let t=null;
 for(const p of s.players)if(!p.dead){t=p;break;}
 if(!t)return;
 e.stun=0;
 if(e.inv>0)e.inv--;
 if(e.flash>0)e.flash--;
 if(--e.chipTimer<=0){e.chipTimer=B.chipWindow;e.chip=e.maxMask*B.chipCap;if(e.formChip!==undefined)e.formChip=e.maxMask*(POSSESSION.chipCap-B.chipCap);}
 // The fight stays in the arena behind the boss door.
 for(const p of s.players)if(p.x<B.arenaLeft){p.x=B.arenaLeft;if(p.vx<0)p.vx=0;}
 const dist=Math.abs(t.x-e.x);
 e.far=dist>B.antiRange.distance?e.far+1:0;
 e.still=t.blocking||t.grounded&&Math.abs(t.vx)<.01?e.still+1:0;
 e.revealed=false;for(const p of s.players)if(depth(p,'horns-lantern'))e.revealed=true;
 if(e.glass&&e.desperate>0)e.desperate--;
 e.stats.frames++;
 if(e.ai==='telegraph'||e.ai==='attack'||e.ai==='transition'||e.glass&&e.ai!=='spent')e.stats.threat++;
 falls(s,e,t);
 if(e.ai==='enter'){e.clip='idle';if(--e.aiTimer<=0)neutral(s,e);}
 else if(e.ai==='neutral'){
  face(e,t);e.clip=e.glass?'glassidle':'idle';
  e.vx=dist>4?e.facing*B.walk*(e.glass?2:1):0;
  if(e.glass&&e.desperate<=0)neutral(s,e);
  else if(--e.aiTimer<=0)choose(s,e,t);
 }else if(e.ai==='telegraph'){
  e.clip='telegraph';
  if(e.aiTimer>e.aiFrames/2)face(e,t);
  if(--e.aiTimer<=0)strikeStart(s,e,t);
 }else if(e.ai==='attack')strikeTick(s,e,t);
 else if(e.ai==='recover'){
  e.clip='idle';
  if(--e.aiTimer<=0){
   if(e.pattern.open&&!e.glass&&e.sinceOpen>=1&&hitsTaken(s)===e.chainHits)openUp(s,e,B.open[e.phase-1],false);
   else{e.sinceOpen++;neutral(s,e);}
  }
 }else if(e.ai==='open'){e.clip='hit';e.open=e.aiTimer;if(--e.aiTimer<=0)closeOpening(s,e);}
 else if(e.ai==='stagger'){if(--e.aiTimer<=0)neutral(s,e);}
 else if(e.ai==='transition'){
  // The roar is the tell: the floor shock follows it, then debris falls on the hunter.
  e.clip=e.aiTimer>B.transition-B.roar?'telegraph':'summon';
  if(e.aiTimer===B.transition-B.roar){wave(s,e,1,B.moves.slam);wave(s,e,-1,B.moves.slam);s.shake=F.shakeFrames*2;}
  if(--e.aiTimer<=0)neutral(s,e);
 }
 else if(e.ai==='spent'){e.clip='maskbreak';e.vx=0;}
 if(e.glass&&e.ai!=='spent'&&!(fair(s)&&e.desperate>B.desperation-FAIR.despGrace))for(const p of s.players){
  if(!p.dead&&Math.abs(p.x-e.x)<e.w/2+p.w/2&&p.y<e.y+e.h&&p.y+p.h>e.y)hurt(s,p,e,B.contact,{unparryable:true});
 }
 physics(e,s.level);
 if(e.x<B.arenaLeft+e.w/2)e.x=B.arenaLeft+e.w/2;
}
