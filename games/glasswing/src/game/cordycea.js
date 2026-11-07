import {emitSound} from '../core/sound.js';
import {entity} from '../core/entity.js';
import {random} from '../core/rng.js';
import {overlap} from '../core/physics.js';
import {hurt,fire,emit} from '../core/combat.js';
import {CORDYCEA as C} from '../data/cordycea.js';
import {TIERS} from '../data/rules.js';
import {F} from '../data/feel.js';
import {glassMultiplier} from './moults.js';
import {gainEmber} from './possession.js';
import {EMBER,POSSESSION} from '../data/forms.js';

// Rules-v4 Cordycea, Who Wears the Dead: a fungal crown over the Mycelial Garden. Every Spore Sow swells fixed sockets
// (at least 24f), erupts them (cyan, never parryable), leaves 2-tile caps (one-way platforms, pogo caps) and rots them.
// The crown is out of jump reach: after every 2 sows it breathes, its gills amber, reachable from the high caps it grew.
// A parried Corpse Slam droops it (P1); three risen destroyed within 4 s make it recoil (P3). Each opening caps at 9%.
const M=C.moves,cx=C.cx,K=C.crown;
const roll=(s,[a,b])=>a+Math.floor(random(s)*(b-a+1));
const tier=e=>e.glass?3:e.phase-1;
const box={x:0,y:0,w:0,h:0};
const set=(x0,x1,y0,y1)=>{box.x=(x0+x1)/2;box.w=x1-x0;box.y=y0;box.h=y1-y0;return box;};
const clamp=x=>Math.max(C.arenaLeft+.4,Math.min(C.right-.4,x));

// The Mycelial Garden: a 14-row grove over the Nest's arena; idempotent, so a retry clears every grown cap.
export function garden(level){
 const w=level.width;
 while(level.grid.length<C.rows)level.grid.push(Array(w).fill(0));
 for(let y=1;y<level.grid.length;y++)for(let x=Math.floor(C.arenaLeft);x<Math.min(w,C.right);x++)level.grid[y][x]=0;
 // The Nest's secrets: its arena mask (a full heal) would float in the open grove, and its fragment past the veil would glow
 // through the wall on a wide view the hunter can never leave. The Garden has none.
 if(level.secrets)level.secrets=[];
 // Render hint only (the simulation never reads it): the view may frame past the Nest's end so the crown sits centred,
 // never pinned under a phone's right-hand buttons; the renderer closes that side with a mycelium wall.
 level.garden=true;level.viewWidth=C.right+30;
 return level;
}
function capTiles(s,k,v){const so=C.sockets[k];for(let x=so.x0;x<so.x0+2;x++)s.level.grid[so.row][x]=v;s.levelRevision++;}

export function spawnCordycea(s){
 garden(s.level);s.levelRevision++;
 const e=entity(s.nextId++,'brawler',cx,K.base[0],2,s.config.difficulty);
 const hp=Math.round(C.hp*(s.config.mode==='coop'?C.coopHP:1)*TIERS[s.config.difficulty].hp),long=!s.config.introSeen&&!s.bossAttempts;
 Object.assign(e,{
  boss:true,v4:true,cordycea:true,crown:true,bossName:'cordycea',phase:1,hp,maxMask:hp,mask:hp,eye:'#62F0FF',w:K.w,h:K.h,
  ai:'enter',aiTimer:long?C.intro:C.entrance,aiFrames:long?C.intro:C.entrance,intro:long,base:K.base[0],dir:1,
  act:null,queue:[],history:[],seen:[],gap:0,sockets:C.sockets.map(()=>({st:0,t:0,f:0})),sows:0,
  open:0,openDamage:0,openKind:'',sinceOpen:C.between,sinceBreath:C.breathGap-120,sinceDroop:C.droopGap,sinceRecoil:C.recoilGap,
  chip:hp*C.chipCap,chipTimer:C.chipWindow,far:0,still:0,desperate:0,despMax:C.desperation,
  lashes:[],snares:[],walls:[],puffs:[],rain:[],kills:[],raised:[],
  attempt:s.bossAttempts||0,stats:{frames:0,threat:0,openings:0,maxOpen:0,kinds:{},minTell:999,hits:0,start:s.frame}
 });
 e.y=e.base+6;e.py=e.y;
 s.enemies.push(e);s.bossStarted=true;s.checkpoint=C.door;emitSound(s,'boss-roar');
 return e;
}
// A risen dead moth (P1: the pilgrim corpse, a puppet whose hits chip the crown; P3: husks that can be destroyed).
function raise(s,e,x,husk){
 const k=husk?C.risen:C.corpse,r=entity(s.nextId++,'brawler',clamp(x),1,2,s.config.difficulty);
 Object.assign(r,{boss:true,v4:true,cordycea:true,risen:true,husk,crownId:e.id,w:k.w,h:k.h,hp:husk?k.hp:1,maxMask:k.hp,mask:k.hp,
  eye:'#62F0FF',ai:'rise',aiTimer:k.rise,aiFrames:k.rise,gap:roll(s,k.gap),tell:0,facing:1});
 e.raised=e.raised.filter(x=>!x.dead);e.raised.push(r);s.enemies.push(r);emit(s,r.x,1.2,0x62f0ff,10);emitSound(s,'enemy-telegraph');
 return r;
}

function strike(s,e,p,d,tell,kind,impactX){
 const r=hurt(s,p,e,d,{unparryable:true,impactX,stop:F.swordStop});
 if(r==='hit'){e.stats.hits++;e.stats.minTell=Math.min(e.stats.minTell,tell);e.stats.kinds[kind]=(e.stats.kinds[kind]||0)+1;}
 return r;
}
const dmg=e=>e.glass?C.despDamage:1;

function tellFrames(s,e,id){
 const tr=tier(e),tight=TIERS[s.config.difficulty].tight;
 let tells=C.tells[tr<3?Math.min(2,tr+tight):3];
 if(tr<3&&!e.seen.includes(id)){tells=C.tells[tight];e.seen.push(id);}
 return Math.round(roll(s,tells)*TIERS[s.config.difficulty].tell);
}
function allowed(e,id){
 const h=e.history,n=h.length;
 return !(h[n-1]===id&&h[n-2]===id)&&!(n>=3&&h[n-3]===h[n-1]&&h[n-2]===id);
}
function choose(s,e,t){
 const list=C.patterns[tier(e)];
 let pick=null;
 // Range is answered by a spore volley (a lash in P1).
 // The garden breathes on schedule: an overdue breath forces the next pattern to a sow.
 if(!e.glass&&e.sinceBreath>=C.breathGap+180)pick={id:'sow',m:['sow']};
 else if(e.far>=C.antiRange.frames){pick=e.phase===1&&!e.glass?{id:'lash',m:['lash']}:{id:'volley',m:['volley']};}
 if(!pick){
  let total=0;for(const p of list)if(allowed(e,p.id))total+=p.w;
  let r=random(s)*total;
  for(const p of list){if(!allowed(e,p.id))continue;r-=p.w;if(r<0){pick=p;break;}}
  pick=pick||list[0];
 }
 e.far=0;
 e.history.push(pick.id);if(e.history.length>3)e.history.shift();
 e.queue=[...pick.m];
 e.gap=pick.m.length?0:roll(s,C.neutral[tier(e)])*2;
}
function sow(s,e,t,frames){
 const free=[];for(let k=0;k<C.sockets.length;k++)if(!e.sockets[k].st)free.push(k);
 const [a,b]=C.sowCount[tier(e)];let n=Math.min(free.length,a+Math.floor(random(s)*(b-a+1)));
 const pick=[];
 // Never boxed in: around the hunter only one floor stalk may swell or stand erupting at a time.
 const zone=k=>!C.sockets[k].wall&&t.x>C.sockets[k].x0-2.8&&t.x<C.sockets[k].x0+4.8;
 let busy=e.sockets.some((so,k)=>(so.st===1||so.st===2)&&zone(k));
 // The garden always offers a way up: unless a high cap grows or stands (a rotting one will be gone by the breath), one of
 // the two grows (the one nearer the hunter, else the other), and the boxing-in rule never drops it.
 const high=[2,5],up=high.some(k=>e.sockets[k].st>0&&e.sockets[k].st<4),near=t.x<cx?2:5;
 if(!up)for(const k of [near,7-near])if(!e.sockets[k].st&&!(busy&&zone(k))){pick.push(k);free.splice(free.indexOf(k),1);n--;if(zone(k))busy=true;break;}
 const forced=pick.length;
 while(n-->0&&free.length)pick.push(free.splice(Math.floor(random(s)*free.length),1)[0]);
 for(let i=forced;i<pick.length;i++)if(zone(pick[i])){if(busy)pick.splice(i--,1);else busy=true;}
 const swell=Math.max(C.swellMin,frames+8);
 pick.forEach((k,i)=>{const so=e.sockets[k];so.st=1;so.t=so.f=swell+i*6;so.tell=so.f;});
 return swell+(pick.length-1)*6;
}
function start(s,e,t,id){
 const floor=M[id]?.minTell||0,frames=Math.max(floor,tellFrames(s,e,id));
 e.act={id,stage:'tell',t:frames,frames,x:t.x,lane:0};
 emitSound(s,'enemy-telegraph');
 if(id==='sow'){e.act.t=e.act.frames=sow(s,e,t,frames)+C.erupt;}
 else if(id==='lash'){
  // Two lanes: low (jump it) and high (stay on the floor); a hunter on a low cap is read as high.
  const onLow=t.grounded&&t.y>2.5&&t.y<3.5,slam=e.raised.some(r=>!r.dead&&(r.ai==='tell'||r.ai==='active'));e.act.lane=random(s)<.45||onLow||slam?1:0;
  e.lashes.push({lane:e.act.lane,warn:frames,t:frames+M.lash.active,tell:frames});
 }else if(id==='bloom'){
  const dir=t.x<cx?-1:1;e.walls.push({x:dir<0?C.right-.5:C.arenaLeft+.5,dir,warn:frames,tell:frames,hit:[]});
 }else if(id==='puff'){for(const c of e.puffs)c.t=Math.min(c.t,30);e.puffs.push({x:clamp(t.x),warn:frames,t:frames+M.puff.grow+M.puff.life,tell:frames,grow:0});}
}
function endAct(s,e){e.act=null;e.gap=e.queue.length?C.neutral[tier(e)][0]>>1:roll(s,C.neutral[tier(e)]);}
function actTick(s,e,t){
 const a=e.act;
 if(--a.t>0)return;
 if(a.id==='sow'){
  e.sows++;endAct(s,e);
  if(e.sows>=(e.phase>1?1:2)&&e.sinceBreath>=C.breathGap&&e.sinceOpen>=C.between&&!e.glass){e.ai='inhale';e.aiTimer=e.aiFrames=C.inhale;e.queue.length=0;emitSound(s,'enemy-telegraph');}
 }else if(a.id==='volley'){
  const v=M.volley;
  for(let i=0;i<v.count;i++){
   const orb=fire(s,e,false,true);if(!orb)break;
   const x0=e.x+(i-1)*.8,y0=e.y-.2,dx=t.x-x0,dy=t.y+t.h*.5-y0,d=Math.sqrt(dx*dx+dy*dy)||1,sp=v.speed*(1-i*.12);
   orb.x=x0;orb.y=y0;orb.vx=dx/d*sp;orb.vy=dy/d*sp;orb.radius=v.radius;orb.range=99;orb.unparryable=true;orb.damage=dmg(e);orb.tell=a.frames;
  }
  emitSound(s,'blast-fire');endAct(s,e);
 }else endAct(s,e);
}
function moves(s,e,t){
 if(e.act){actTick(s,e,t);return;}
 if(e.gap>0){e.gap--;return;}
 // One ground hazard at a time: a rolling Bloom Wall lets only a lash through; a spore cloud holds back walls and clouds.
 const q=e.queue[0]||'';if(e.walls.length&&q!=='lash'||e.puffs.length&&(q==='bloom'||q==='puff'))return;
 if(e.queue.length){start(s,e,t,e.queue.shift());return;}
 choose(s,e,t);
}

function openUp(s,e,kind,frames){
 e.ai='open';e.aiTimer=e.aiFrames=e.open=frames;e.openKind=kind;e.openDamage=0;e.sinceOpen=0;e.act=null;e.queue.length=0;for(const c of e.puffs)c.t=Math.min(c.t,20);
 if(kind==='breath'){e.sinceBreath=0;e.sows=0;}else if(kind==='droop')e.sinceDroop=0;else e.sinceRecoil=0;
 e.stats.openings++;e.stats[kind]=(e.stats[kind]||0)+1;
 emit(s,e.x,e.y,0xffb347,16);emitSound(s,'block');
}
function closeOpening(s,e){
 e.stats.maxOpen=Math.max(e.stats.maxOpen,e.openDamage/e.maxMask);
 e.open=0;e.ai='idle';e.openKind='';e.gap=roll(s,C.neutral[tier(e)]);
}
// Where the crown's box sits: closed under its cap base, the gills hanging lower when open, drooped or recoiled low.
function crownTarget(e){
 if(e.ai==='spent'||e.ai==='dying')return K.spent;
 if(e.ai==='open')return e.openKind==='droop'?K.droop:e.openKind==='recoil'?K.recoil:e.base-K.open.drop;
 if(e.ai==='enter')return e.base+6*e.aiTimer/e.aiFrames;
 return e.base;
}
function crownBox(e){
 const open=e.ai==='open'||e.ai==='spent'||e.ai==='dying',ty=crownTarget(e);
 e.y+=Math.max(-.35,Math.min(.35,ty-e.y));
 e.w=open?K.open.w:K.w;e.h=K.h+(open&&e.openKind==='breath'?K.open.drop:0);
}

export function cordyceaParried(s,r,p){
 if(!r.risen||r.dead||r.ai!=='active')return;
 const e=crownOf(s,r);if(!e)return;
 r.ai='stun';r.aiTimer=r.aiFrames=(r.husk?C.risen:C.corpse).stun;r.hitIds.length=0;
 emit(s,r.x+r.facing*.8,r.y+r.h*.7,0xffffff,12);
 // The last fruiting ends on a parried slam; in P1 a parried Corpse Slam droops the crown (at most every 10 s).
 if(e.ai==='dying')return;
 if(e.glass&&e.ai!=='spent'){defeat(s,e,p);return;}
 if(!r.husk&&e.phase===1&&e.ai==='idle'&&e.sinceDroop>=C.droopGap&&e.sinceOpen>=C.between)openUp(s,e,'droop',C.droop);
}
const crownOf=(s,r)=>{for(const e of s.enemies)if(e.id===r.crownId)return e.dead?null:e;return null;};
// The killing blow stills the garden at once (every hazard, spore and risen is gone, the caps rot): the crown blooms amber
// for C.dying frames, then it is dead and the fight is won.
function defeat(s,e,source){
 e.hp=0;e.mask=0;e.defeatedFrame=s.frame;e.clip='beaten';e.ai='dying';e.aiTimer=e.aiFrames=C.dying;e.open=0;e.openKind='';e.desperate=0;
 e.act=null;e.queue.length=0;e.lashes.length=0;e.snares.length=0;e.walls.length=0;e.puffs.length=0;e.rain.length=0;
 e.sockets.forEach((so,k)=>{if(so.st===1||so.st===2){so.st=0;capTiles(s,k,0);}else if(so.st===3){so.st=4;so.t=so.f=C.rot;}});
 for(const o of s.projectiles)if(o.active&&o.owner===e.id)o.active=false;
 if(source&&source.team!==2&&source.kills!==undefined)source.kills++;
 for(const r of e.raised)if(!r.dead){r.dead=true;r.defeatedFrame=s.frame;r.clip='beaten';}
 s.hitStop=Math.max(s.hitStop,F.swordStop*2);s.shake=F.shakeFrames*4;
 emit(s,e.x,e.y+1,0xffb347,30);emitSound(s,'enemy-beaten');
}
function transition(s,e){
 e.open=0;e.openKind='';e.phase++;e.ai='transition';e.aiTimer=e.aiFrames=C.transition;e.act=null;e.queue.length=0;e.sows=0;
 e.base=K.base[e.phase-1];
 s.shake=F.shakeFrames*3;emit(s,e.x,e.y,0xf1ece2,24);emitSound(s,'boss-roar');
 const t=s.players.find(p=>!p.dead)||e;
 if(e.phase===2){
  // The corpse collapses while a Bloom Wall rolls in from the far side.
  for(const r of e.raised)if(!r.dead&&!r.husk){r.ai='fall';r.aiTimer=r.aiFrames=40;}
  e.walls.push({x:t.x<cx?C.right-.5:C.arenaLeft+.5,dir:t.x<cx?-1:1,warn:40,tell:40,hit:[]});
 }else{
  // The garden rots at once and spores rain where the hunter stands.
  e.sockets.forEach(so=>{if(so.st===3){so.st=4;so.t=so.f=C.rot;}});
  for(let i=0;i<4;i++)e.rain.push({x:clamp(t.x+(i-1.5)*2.4),t:M.rain.warn+i*18});
 }
}
function desperation(s,e){
 e.open=0;e.openKind='';e.glass=true;e.desperate=C.desperation;e.hp=0;e.mask=0;e.act=null;e.queue.length=0;
 e.ai='idle';e.base=K.base[2]+.3;e.gap=C.neutral[3][0];
 s.hitStop=F.swordStop;s.shake=F.shakeFrames*3;emit(s,e.x,e.y,0xf1ece2,24);emitSound(s,'mask-shatter');
}
function chipCrown(s,e,source,raw,projectile){
 let take;
 if(source.form&&source.formBudget>=0){
  take=Math.min(raw*C.chip*(projectile?.5:1),e.chip+(e.formChip||0),source.formBudget);
  const base=Math.min(take,e.chip);e.chip-=base;if(take>base)e.formChip-=take-base;
 }else{take=Math.min(raw*C.chip*(projectile?.5:1),e.chip);e.chip-=take;}
 return take;
}
function apply(s,e,source,take,amber){
 if(source.form&&source.formBudget>=0)source.formBudget=Math.max(0,source.formBudget-take);
 // The last sliver (under 3%) is not worth another opening: it falls straight to the last fruiting.
 const floor=e.phase<3?e.maxMask*C.thresholds[e.phase-1]:e.hp-take<=e.maxMask*.03?e.hp:0;
 e.hp=Math.max(floor,e.hp-take);e.mask=e.hp;e.flash=F.flash;
 if(e.hp<=floor){if(e.phase<3)transition(s,e);else desperation(s,e);}
 else if(amber&&e.openDamage>=e.maxMask*C.cap-1e-9){emit(s,e.x,e.y,0x5c5650,10);closeOpening(s,e);if(source.forms)gainEmber(s,source,EMBER.cap);}
}
// Damage rules: the open gills (or the drooped/recoiled crown) are amber, x4.2 up to the 9% cap, melee and pogo only: the
// gills swallow shots and spit them back as cyan spores. The cap skin and the P1 corpse take capped chip; husks have HP.
export function cordyceaHurt(s,t,source,damage,projectile){
 if(t.risen){
  const e=crownOf(s,t);
  if(!e||t.ai==='rise'||t.ai==='fall'||e.ai==='enter'||e.ai==='transition'&&!t.husk){emit(s,t.x,t.y+t.h*.6,0x7fe8ff,4);emitSound(s,'block');return 'hit';}
  t.flash=F.flash;s.hitStop=Math.max(s.hitStop,F.hitStop);
  emit(s,source.x+(t.x-source.x)*.5,(source.y||t.y)+1,0xf1ece2,5);
  if(!t.husk){
   if(e.glass||e.ai==='spent')return 'hit';
   const raw=source.glass&&source.upgrades?damage/glassMultiplier(source):damage;
   apply(s,e,source,chipCrown(s,e,source,raw,projectile),false);return 'hit';
  }
  t.hp-=damage;t.mask=Math.max(0,t.hp);
  if(t.hp<=0){
   t.dead=true;t.mask=0;emit(s,t.x,t.y+t.h*.5,0x62f0ff,16);
   e.kills.push(s.frame);while(e.kills.length&&s.frame-e.kills[0]>C.killWindow)e.kills.shift();
   if(e.kills.length>=C.kills&&e.phase===3&&!e.glass&&e.ai==='idle'&&e.sinceRecoil>=C.recoilGap&&e.sinceOpen>=C.between){e.kills.length=0;openUp(s,e,'recoil',C.recoil);}
  }
  return 'hit';
 }
 const e=t;
 // The spent crown falls to the first hit (the defeat credits it); the dying bloom takes no more.
 if(e.ai==='spent'){defeat(s,e,source);return 'hit';}
 if(e.ai==='dying')return 'hit';
 const clank=e.ai==='enter'||e.ai==='transition'||e.glass;
 if(projectile&&!clank){
  // Swallowed, and spat back as a cyan spore at the shooter.
  const orb=fire(s,e,false,true);
  if(orb){const x0=projectile.x,y0=projectile.y,dx=source.x-x0,dy=(source.y||1)+.8-y0,d=Math.sqrt(dx*dx+dy*dy)||1;
   orb.x=x0;orb.y=y0;orb.vx=dx/d*M.volley.speed;orb.vy=dy/d*M.volley.speed;orb.radius=M.volley.radius;orb.range=99;orb.unparryable=true;orb.damage=1;orb.tell=20;}
  emit(s,projectile.x,projectile.y,0x62f0ff,6);emitSound(s,'block');return 'hit';
 }
 let take=0;
 const amber=!clank&&e.ai==='open';
 if(amber){
  take=Math.min(damage*C.amber,Math.max(0,e.maxMask*C.cap-e.openDamage));
  if(source.form&&source.formBudget>=0)take=Math.min(take,source.formBudget);
  e.openDamage+=take;
  if(source.forms)gainEmber(s,source,EMBER.hit);
 }else if(!clank){
  const raw=source.glass&&source.upgrades?damage/glassMultiplier(source):damage;
  take=chipCrown(s,e,source,raw,false);
 }
 s.hitStop=Math.max(s.hitStop,amber?F.swordStop:F.hitStop);
 emit(s,source.x+(e.x-source.x)*.5,(source.y||e.y)+1,amber?0xffb347:clank?0x7fe8ff:0xf1ece2,amber?10:4);
 if(amber)s.shake=F.shakeFrames;
 if(clank){emitSound(s,'block');return 'hit';}
 apply(s,e,source,take,amber);
 return 'hit';
}

// Sockets: swell (the cap shimmers cyan), erupt (the stalk is a cyan hazard), solid (a cap to stand and pogo on), rot.
function socketsTick(s,e,t){
 for(let k=0;k<C.sockets.length;k++){
  const so=e.sockets[k],d=C.sockets[k];
  if(!so.st)continue;
  if(so.st===2){
   const hz=d.wall?set(d.x0-.1,d.x0+2.1,d.row-.3,d.row+1.3):set(d.x0+.15,d.x0+1.85,1,d.row+1);
   for(const p of s.players)if(!p.dead&&overlap(hz,p))strike(s,e,p,dmg(e),so.tell,'stalk',d.x0+1);
  }
  if(--so.t>0)continue;
  if(so.st===1){
   so.st=2;so.t=so.f=C.erupt;capTiles(s,k,2);emit(s,d.x0+1,d.row+1,0x62f0ff,8);emitSound(s,'land');
   // P3 and the last fruiting: the dead rise where the spores land.
   if((e.phase===3||e.glass)&&!d.wall&&e.raised.filter(r=>!r.dead&&r.husk).length<C.risen.max&&random(s)<.6)raise(s,e,d.x0+1,true);
  }else if(so.st===2){so.st=3;so.t=so.f=C.solid[e.glass?2:e.phase-1];}
  else if(so.st===3){so.st=4;so.t=so.f=C.rot;}
  else{so.st=0;capTiles(s,k,0);emit(s,d.x0+1,d.row+1,0x6d5c48,6);}
 }
}
// Downsword on a cap (or a Bloom Wall's crest) bounces like a pogo on an enemy, and gives the air jumps back.
function pogoCaps(s,e){
 for(const p of s.players){
  if(p.dead||p.move!=='downsword'||p.moveFrame<6||p.moveFrame>=12||p.capPogo===p.attackId||p.vy>0)continue;
  const hb=set(p.x-.33,p.x+.33,p.y-1,p.y+.4);let hit=false;
  for(let k=0;k<C.sockets.length&&!hit;k++){const so=e.sockets[k],d=C.sockets[k];if((so.st===3||so.st===4)&&overlap(hb,set(d.x0,d.x0+2,d.row+.5,d.row+1)))hit=true;}
  for(const w of e.walls)if(!hit&&w.warn<=0&&overlap(hb,set(w.x-.5,w.x+.5,1+M.bloom.h-.4,1+M.bloom.h)))hit=true;
  if(!hit)continue;
  p.capPogo=p.attackId;p.vy=F.pogoSpeed;p.jumps=0;emit(s,p.x,p.y-.3,0xa9d68a,6);emitSound(s,'pogo');
 }
}
const inBox=(p,x0,x1,y0,y1)=>p.x+p.w/2>x0&&p.x-p.w/2<x1&&p.y<y1&&p.y+p.h>y0;
function hazards(s,e,t){
 for(let i=e.lashes.length-1;i>=0;i--){
  const l=e.lashes[i],[y0,y1]=M.lash.lanes[l.lane];
  if(l.warn>0)l.warn--;
  else for(const p of s.players)if(!p.dead&&inBox(p,C.arenaLeft,C.right,y0,y1))strike(s,e,p,dmg(e),l.tell,'lash',e.x);
  if(l.warn===0&&l.t===M.lash.active){s.shake=F.shakeFrames;emitSound(s,'rush');}
  if(--l.t<=0)e.lashes.splice(i,1);
 }
 for(let i=e.snares.length-1;i>=0;i--){
  const n=e.snares[i],k=M.snare;
  if(n.warn>0){n.warn--;if(!n.warn){emit(s,n.x,n.y+.3,0x62f0ff,8);emitSound(s,'land');}}
  else for(const p of s.players)if(!p.dead&&inBox(p,n.x-k.w/2,n.x+k.w/2,n.y,n.y+k.h))strike(s,e,p,dmg(e),k.swell,'snare',n.x);
  if(--n.t<=0)e.snares.splice(i,1);
 }
 for(let i=e.walls.length-1;i>=0;i--){
  const w=e.walls[i],b=M.bloom;
  if(w.warn>0){w.warn--;continue;}
  w.x+=w.dir*b.speed;
  for(const p of s.players)if(!p.dead&&!w.hit.includes(p.id)&&inBox(p,w.x-b.w/2,w.x+b.w/2,1,1+b.h)){if(strike(s,e,p,dmg(e),w.tell,'bloom',w.x-w.dir)!=='immune')w.hit.push(p.id);}
  if(s.frame%4===0)emit(s,w.x,1.2,0x62f0ff,2);
  if(w.x<C.arenaLeft||w.x>C.right)e.walls.splice(i,1);
 }
 for(let i=e.puffs.length-1;i>=0;i--){
  const c=e.puffs[i],k=M.puff;
  if(c.warn>0)c.warn--;
  else{
   c.grow=Math.min(1,c.grow+1/k.grow);const hw=k.w/2*c.grow;
   for(const p of s.players)if(!p.dead&&inBox(p,c.x-hw,c.x+hw,1,1+k.h*c.grow))strike(s,e,p,dmg(e),c.tell,'puff',c.x);
  }
  if(--c.t<=0)e.puffs.splice(i,1);
 }
 for(let i=e.rain.length-1;i>=0;i--){
  const r=e.rain[i];
  if(--r.t>0)continue;
  e.rain.splice(i,1);
  const orb=fire(s,e,false,true);
  if(orb){orb.x=r.x;orb.y=M.rain.y;orb.vx=0;orb.vy=M.rain.speed;orb.radius=M.rain.radius;orb.range=99;orb.unparryable=true;orb.damage=dmg(e);orb.tell=M.rain.warn;}
 }
}
// The risen: walk at the hunter, a parryable slam (the ivory flash ring on its arms), a long recovery.
function risenTick(s,e,r,t){
 if(r.dead)return;
 const k=r.husk?C.risen:C.corpse;
 if(r.flash>0)r.flash--;
 if(r.ai==='rise'){r.clip='summon';if(--r.aiTimer<=0){r.ai='walk';r.gap=roll(s,k.gap)>>1;}return;}
 if(r.ai==='fall'){r.clip='beaten';if(--r.aiTimer<=0){r.dead=true;r.defeatedFrame=s.frame;emit(s,r.x,1.5,0xf1ece2,16);}return;}
 if(r.ai==='stun'){r.clip='hit';if(--r.aiTimer<=0){r.ai='walk';r.gap=roll(s,k.gap);}return;}
 if(e.ai==='enter'||e.ai==='spent'){r.clip='idle';return;}
 const dx=t.x-r.x;
 if(r.ai==='walk'){
  r.facing=dx<0?-1:1;r.clip='move';
  if(Math.abs(dx)>k.range-.4)r.x=clamp(r.x+r.facing*k.speed*(e.glass?1.4:1));else r.clip='idle';
  if(r.gap>0)r.gap--;
  else if(Math.abs(dx)<k.range&&t.y<1+k.y1&&!e.lashes.some(l=>l.lane===0)){r.ai='tell';r.tell=tellFrames(s,e,r.husk?'husk':'corpse');r.aiTimer=r.aiFrames=r.tell;r.hitIds.length=0;emitSound(s,'enemy-telegraph');}
 }else if(r.ai==='tell'){r.clip='telegraph';if(--r.aiTimer<=0){r.ai='active';r.aiTimer=r.aiFrames=k.active;s.shake=F.shakeFrames;emitSound(s,'rush');}}
 else if(r.ai==='active'){
  r.clip='slam';
  const x0=r.x+r.facing*k.x0,x1=r.x+r.facing*k.x1,hb=set(Math.min(x0,x1),Math.max(x0,x1),1,1+k.y1);
  for(const p of s.players){
   if(p.dead||r.hitIds.includes(p.id)||!overlap(hb,p))continue;
   const res=hurt(s,p,r,dmg(e),{impactX:r.x,stop:F.swordStop});
   if(res!=='immune')r.hitIds.push(p.id);
   if(res==='hit'){e.stats.hits++;e.stats.minTell=Math.min(e.stats.minTell,r.tell);e.stats.kinds.slam=(e.stats.kinds.slam||0)+1;}
   if(r.ai!=='active')return;
  }
  if(--r.aiTimer<=0){r.ai='after';r.aiTimer=r.aiFrames=k.after;emit(s,r.x+r.facing*1.6,1.1,0xf1ece2,10);}
 }else if(r.ai==='after'){r.clip='idle';if(--r.aiTimer<=0){r.ai='walk';r.gap=roll(s,k.gap);}}
}

export function cordyceaTick(s,e){
 if(e.dead||!e.crown)return;
 let t=null;
 for(const p of s.players)if(!p.dead){t=p;break;}
 if(!t)return;
 e.stun=0;e.vx=0;e.vy=0;
 if(e.inv>0)e.inv--;
 if(e.flash>0)e.flash--;
 if(--e.chipTimer<=0){e.chipTimer=C.chipWindow;e.chip=e.maxMask*C.chipCap;if(e.formChip!==undefined)e.formChip=e.maxMask*(POSSESSION.chipCap-C.chipCap);}
 for(const p of s.players)if(p.x<C.arenaLeft){p.x=C.arenaLeft;if(p.vx<0)p.vx=0;}
 if(e.ai==='dying'){
  socketsTick(s,e,t);crownBox(e);
  if(--e.aiTimer<=0){e.dead=true;emitSound(s,'mask-shatter');}
  return;
 }
 e.far=Math.abs(t.x-e.x)>C.antiRange.distance?e.far+1:0;
 e.still=t.blocking||t.grounded&&Math.abs(t.vx)<.01?e.still+1:0;
 e.sinceOpen++;e.sinceBreath++;e.sinceDroop++;e.sinceRecoil++;
 if(e.glass&&e.desperate>0)e.desperate--;
 e.stats.frames++;
 socketsTick(s,e,t);pogoCaps(s,e);hazards(s,e,t);
 for(const r of e.raised)risenTick(s,e,r,t);
 if(e.ai==='enter'){
  if(--e.aiTimer<=0){e.ai='idle';e.gap=roll(s,C.neutral[0]);raise(s,e,t.x<cx?C.right-3:C.arenaLeft+3,false);}
 }else if(e.ai==='idle'){
  if(e.glass){
   // The last fruiting: the crown tears free and drags along the ceiling, spraying spores; then it falls, spent.
   e.x+=e.dir*.05;if(e.x>C.right-5.5||e.x<C.arenaLeft+5.5)e.dir=-e.dir;
   if(e.desperate%40===0)e.rain.push({x:clamp(t.x+(random(s)-.5)*3),t:M.rain.warn});
   if(e.desperate<C.desperation-40&&e.y>e.base-.2)for(const p of s.players)if(!p.dead&&overlap(e,p))strike(s,e,p,C.contact,999,'contact',e.x);
   if(e.desperate<=0){e.ai='spent';e.act=null;e.queue.length=0;e.lashes.length=0;e.puffs.length=0;e.snares.length=0;e.rain.length=0;emitSound(s,'mask-crack3');}
   else moves(s,e,t);
  }else moves(s,e,t);
  // Roots: a hunter who stands still (or guards) for a second is snared from below (a 30f swell).
  if(e.ai==='idle'&&e.still>=C.antiTurtle&&!e.snares.length&&!e.walls.length&&!e.puffs.length){e.snares.push({x:t.x,y:t.grounded?t.y:1,warn:M.snare.swell,t:M.snare.swell+M.snare.active});e.still=0;emitSound(s,'enemy-telegraph');}
 }else if(e.ai==='inhale'){if(--e.aiTimer<=0)openUp(s,e,'breath',C.breath[e.phase-1]);}
 else if(e.ai==='open'){e.open=e.aiTimer;if(--e.aiTimer<=0)closeOpening(s,e);}
 else if(e.ai==='transition'){if(--e.aiTimer<=0){e.ai='idle';e.gap=roll(s,C.neutral[tier(e)]);}}
 crownBox(e);
 e.clip=e.ai==='open'||e.ai==='spent'?'hit':e.act?'telegraph':'idle';
 if(e.ai==='transition'||e.act||e.glass&&e.ai!=='spent'||e.lashes.length||e.walls.length||e.puffs.length||e.snares.length||e.raised.some(r=>!r.dead&&(r.ai==='tell'||r.ai==='active'))||e.sockets.some(so=>so.st===1||so.st===2))e.stats.threat++;
}
