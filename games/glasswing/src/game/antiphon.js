import {emitSound} from '../core/sound.js';
import {entity} from '../core/entity.js';
import {random} from '../core/rng.js';
import {hurt,emit} from '../core/combat.js';
import {ANTIPHON as A} from '../data/antiphon.js';
import {TIERS} from '../data/rules.js';
import {F} from '../data/feel.js';
import {glassMultiplier} from './moults.js';
import {gainEmber} from './possession.js';
import {EMBER,POSSESSION} from '../data/forms.js';

// Rules-v4 The Drowned Antiphon: a misted husk kneels on the Scale Mere and its reflection is the truth. Every strike is
// telegraphed on the reflected saint (which arms are real, which carry the ivory ring); the husk above raises them all.
// Openings: a real limb striking under a hunter's ice hole sticks (amber joints, 48f); a parried ivory Hymn Wave shatters
// the veil (70f); from P2 a parried ivory ender or Drowning Hold exposes the arm's joints (70f). Armour takes capped chip.
const M=A.moves;
const roll=(s,[a,b])=>a+Math.floor(random(s)*(b-a+1));
const tier=e=>e.glass?3:e.phase-1;
const clampX=(x,m=.6)=>Math.max(A.arenaLeft+m,Math.min(A.right-m,x));
const column=(p,x,half,top)=>!p.dead&&Math.abs(p.x-x)<half+p.w/2&&p.y<top;

// The Scale Mere: the Nest's boss arena becomes one open causeway of scale-ice at the waterline (idempotent).
export function mere(level){
 for(let y=1;y<level.grid.length;y++)for(let x=Math.floor(A.arenaLeft);x<Math.min(level.width,A.right);x++)level.grid[y][x]=0;
 for(let x=Math.floor(A.arenaLeft);x<Math.min(level.width,A.right);x++)level.grid[0][x]=1;
 level.secrets=(level.secrets||[]).filter(d=>d.x<A.arenaLeft);level.mere=true;
 return level;
}

export function spawnAntiphon(s){
 const e=entity(s.nextId++,'brawler',A.spawn,1,2,s.config.difficulty);
 const hp=Math.round(A.hp*(s.config.mode==='coop'?A.coopHP:1)*TIERS[s.config.difficulty].hp),long=!s.config.introSeen&&!s.bossAttempts;
 Object.assign(e,{
  boss:true,v4:true,antiphon:true,card:'antiphon',phase:1,hp,maxMask:hp,mask:hp,eye:'#19B8A6',facing:-1,
  hx:A.spawn,hpx:A.spawn,ai:'enter',aiTimer:long?A.intro:A.entrance,aiFrames:long?A.intro:A.entrance,intro:long,
  act:null,queue:[],history:[],seen:[],gap:0,open:0,openDamage:0,openKind:'',ox:0,sinceOpen:A.bigGap,riposte:false,
  chip:hp*A.chipCap,chipTimer:A.chipWindow,far:0,still:0,desperate:0,despMax:A.desperation,despStart:0,
  holes:[],waves:[],shards:[],cracked:{},hymns:0,ripple:0,side:1,trans:0,tilt:null,sing:0,song:null,
  attempt:s.bossAttempts||0,stats:{frames:0,threat:0,openings:0,maxOpen:0,minTell:999,hits:0,by:{},start:s.frame}
 });
 body(e);
 s.enemies.push(e);s.bossStarted=true;s.checkpoint=A.door;emitSound(s,'boss-roar');
 return e;
}
// Outside openings the hurtbox is the husk's ivory robe.
function body(e){e.x=e.hx;e.y=1;e.w=A.husk.w;e.h=A.husk.h;}

// Every boss hit goes through here: it records how long that threat had been telegraphed (the fairness audit).
function strike(s,e,p,damage,since,impactX,parry,exact,src=e.act?.id||'?'){
 const r=hurt(s,p,e,e.glass&&!exact?Math.max(damage,A.despDamage):damage,{unparryable:!parry,impactX,stop:F.swordStop});
 if(r==='hit'){const n=s.frame-since,b=e.stats.by;e.stats.hits++;e.stats.minTell=Math.min(e.stats.minTell,n);b[src]=b[src]?{hits:b[src].hits+1,tell:Math.min(b[src].tell,n)}:{hits:1,tell:n};}
 return r;
}
function tellFrames(s,e,id){
 const tr=tier(e),tight=TIERS[s.config.difficulty].tight;
 let tells=A.tells[tr<3?Math.min(2,tr+tight):3];
 if(tr<3&&!e.seen.includes(id)){tells=A.tells[tight];e.seen.push(id);}
 return Math.max(A.minTell,Math.round(roll(s,tells)*TIERS[s.config.difficulty].tell));
}
function allowed(e,id){
 const h=e.history,n=h.length;
 return !(h[n-1]===id&&h[n-2]===id)&&!(n>=3&&h[n-3]===h[n-1]&&h[n-2]===id);
}
function choose(s,e){
 const list=A.patterns[tier(e)];
 let pick=null;
 // Range is answered by the Choir Lunge (P1: the grasp, which rises under the hunter anywhere); turtling by the hands.
 if(e.far>=A.antiRange.frames)pick=list.find(p=>p.range)||list.find(p=>p.m[0]==='grasp');
 else if(e.still>=A.antiTurtle)pick=list.find(p=>p.m[0]==='hands');
 if(pick&&!allowed(e,pick.id))pick=null;
 if(!pick){
  let total=0;for(const p of list)if(allowed(e,p.id))total+=p.w;
  let r=random(s)*total;
  for(const p of list){if(!allowed(e,p.id)||!p.w)continue;r-=p.w;if(r<0){pick=p;break;}}
  pick=pick||list[0];
 }
 e.far=0;e.still=0;
 e.history.push(pick.id);if(e.history.length>3)e.history.shift();
 e.queue=[...pick.m];
}
function neutral(s,e,short){e.act=null;e.ai='neutral';body(e);e.gap=short?A.neutral[tier(e)][0]>>1:roll(s,A.neutral[tier(e)]);}
function endAct(s,e){neutral(s,e,e.queue.length>0);}

// Six-Hand Antiphon: six lanes around the hunter; 2-4 are real and strike on their own beats; the last may carry the
// ivory ring. One of the two lanes flanking the hunter is always fake.
function layHands(s,e,a,t){
 const k=M.hands,span=k.spacing*k.lanes,base=Math.max(A.arenaLeft+.15,Math.min(A.right-.15-span,t.x-span/2));
 const [lo,hi]=k.real[tier(e)],n=lo+Math.floor(random(s)*(hi-lo+1)),order=[0,1,2,3,4,5];
 for(let i=5;i>0;i--){const j=Math.floor(random(s)*(i+1)),v=order[i];order[i]=order[j];order[j]=v;}
 a.arms=[];
 for(let i=0;i<k.lanes;i++)a.arms.push({x:base+k.spacing*(i+.5),real:false,at:0,ivory:false,hit:[]});
 for(let i=0;i<n;i++)a.arms[order[i]].real=true;
 const near=[0,1,2,3,4,5].sort((i,j)=>Math.abs(a.arms[i].x-t.x)-Math.abs(a.arms[j].x-t.x)||i-j);
 if(near.slice(0,2).every(i=>a.arms[i].real)){a.arms[near[1]].real=false;a.arms[near.slice(2).find(i=>!a.arms[i].real)].real=true;}
 const beat=k.beats[tier(e)];let b=0,last=null;
 for(const i of order)if(a.arms[i].real){a.arms[i].at=a.frames+beat*b++;last=a.arms[i];}
 last.ivory=e.glass||e.phase>=2&&random(s)<.5;
 a.end=last.at+k.active+k.after;
}
function aim(a,x){const o=M.grasp.offset;a.xs[0]=clampX(x-o);a.xs[1]=clampX(x);a.xs[2]=clampX(x+o);}
// Will the P3 flood reach a hunter at x within h frames (this tilt, or the next one, which leans the other way)? Counted
// from one lane inside the full-tilt flood line, so a hunter one step from the water counts too.
export function floodsAt(e,x,h){
 const T=A.tilt,g=e.tilt;if(!g)return false;
 const d=x-A.mid,near=T.flood/T.slope-M.hands.spacing;
 return g.t<T.warn+T.ramp+T.hold+T.back&&g.t+h>T.warn&&d*g.dir>near||g.t+h>T.every+T.warn&&-d*g.dir>near;
}
function start(s,e,t,id){
 if(id==='ripple'){e.ripple=M.ripple.frames;return;}
 // Rules v5: six lanes whose gaps are narrower than a hunter, laid while the mere floods (or is about to flood) the
 // hunter's side, wall the dry causeway off behind real arms (QA: an oracle pinned at the flooded wall). The saint
 // answers with the fan instead, whose gap already leans to the high side.
 if(id==='hands'&&s.config.rulesVersion>=5&&floodsAt(e,t.x,M.hands.flood))id='fan';
 const T=tellFrames(s,e,id),a={id,stage:'tell',t:0,frames:T,since:s.frame,x:t.x,hit:[]};
 e.act=a;e.ai='act';emitSound(s,'enemy-telegraph');
 if(id==='hands')layHands(s,e,a,t);
 else if(id==='grasp'){a.real=Math.floor(random(s)*3);a.xs=[0,0,0];aim(a,t.x);a.end=T+M.grasp.active+M.grasp.after;}
 else if(id==='fan'){
  // The gap lies near the hunter; while the line tilts it lies on the high side, never in the flood.
  const lean=e.tilt&&e.tilt.q>0?-e.tilt.dir:0,off=lean?lean*(.6+random(s)*(M.fan.near-.6)):(random(s)*2-1)*M.fan.near;
  a.gx=clampX(t.x+off,M.fan.gap/2+.2);a.end=T+M.fan.active+M.fan.after;
 }
 else if(id==='hold'){a.lift=T;a.frames=T+M.hold.lift;a.x=clampX(t.x);a.end=a.frames+M.hold.active+M.hold.after;}
 else if(id==='lunge'){a.dir=Math.sign(t.x-e.hx)||-e.facing;e.facing=a.dir;a.end=T+120;}
 else if(id==='hymn'){a.ivory=++e.hymns%M.hymn.every===0;a.end=T+M.hymn.after;}
}
function waves(s,e,ivory,since){for(const dir of [-1,1])e.waves.push({x:e.hx+dir*M.hymn.start,dir,ivory,since,hit:[],back:false});emitSound(s,'blast-fire');}
// A real limb that struck under an ice hole sticks in it: its amber joints are within reach (at most every 8 s).
function caught(s,e,x){
 if(e.glass||e.sinceOpen<A.smallGap)return false;
 for(const h of e.holes)if(Math.abs(h.x-x)<A.holes.catch){h.t=0;openUp(s,e,'limb',A.limbOpen,h.x);return true;}
 return false;
}
function actTick(s,e,t){
 const a=e.act;a.t++;
 if(a.id==='hands'){
  const k=M.hands;
  for(const arm of a.arms){
   if(!arm.real||a.t<arm.at||a.t>arm.at+k.active)continue;
   if(a.t===arm.at){emit(s,arm.x,1.1,arm.ivory?0xffffff:0x7fe8ff,8);s.shake=Math.max(s.shake,F.shakeFrames);emitSound(s,'sword-hit');}
   if(a.t===arm.at+k.active){if(caught(s,e,arm.x))return;continue;}
   for(const p of s.players){
    if(arm.hit.includes(p.id)||!column(p,arm.x,k.half,k.top))continue;
    const r=strike(s,e,p,1,a.since,arm.x,arm.ivory);
    if(r!=='immune')arm.hit.push(p.id);
    if(r==='parry'&&arm.ivory){parried(s,e,p,arm.x);return;}
   }
  }
 }else if(a.id==='grasp'){
  const k=M.grasp;
  if(a.t<a.frames-k.lock)aim(a,t.x);
  const x=a.xs[a.real];
  if(a.t===a.frames){emit(s,x,1,0x7fe8ff,10);emitSound(s,'rush');}
  if(a.t>=a.frames&&a.t<a.frames+k.active)for(const p of s.players)if(!a.hit.includes(p.id)&&column(p,x,k.half,k.top)&&strike(s,e,p,1,a.since,x,false)!=='immune')a.hit.push(p.id);
  if(a.t===a.frames+k.active&&caught(s,e,x))return;
 }else if(a.id==='fan'){
  const k=M.fan;
  if(a.t===a.frames){s.shake=Math.max(s.shake,F.shakeFrames*2);emitSound(s,'rush');}
  if(a.t>=a.frames&&a.t<a.frames+k.active)for(const p of s.players){
   if(p.dead||a.hit.includes(p.id)||p.y>=k.top||Math.abs(p.x-a.gx)+p.w/2<=k.gap/2)continue;
   if(strike(s,e,p,1,a.since,p.x,false)!=='immune')a.hit.push(p.id);
  }
 }else if(a.id==='hold'){
  const k=M.hold;
  // The hand tracks the hunter until the 24f ivory lift flash, then closes where it is.
  if(a.t<a.lift)a.x=clampX(a.x+Math.max(-.09,Math.min(.09,t.x-a.x)));
  if(a.t===a.lift)emitSound(s,'enemy-telegraph');
  if(a.t>=a.frames&&a.t<a.frames+k.active)for(const p of s.players){
   if(a.hit.includes(p.id)||!column(p,a.x,k.half,k.top))continue;
   const r=strike(s,e,p,k.damage,a.since,a.x,true);
   if(r!=='immune')a.hit.push(p.id);
   if(r==='parry'){parried(s,e,p,a.x);return;}
  }
 }else if(a.id==='lunge'){
  const k=M.lunge;
  // The robe's hurtbox sinks with the drawn dive (only the crown skims above the ice).
  const u=Math.max(0,Math.min(1,a.stage!=='after'?a.t/a.frames:(a.end-a.t)/k.after));
  if(a.t===a.frames){a.tx=clampX(t.x+a.dir*k.past,1.6);a.dir=Math.sign(a.tx-e.hx)||a.dir;e.facing=a.dir;emitSound(s,'rush');}
  if(a.t>=a.frames&&a.stage!=='after'){
   e.hx+=Math.max(-k.speed,Math.min(k.speed,a.tx-e.hx));body(e);
   for(const p of s.players)if(!a.hit.includes(p.id)&&column(p,e.hx,k.w/2,k.top)&&strike(s,e,p,1,a.since,e.hx,false)!=='immune')a.hit.push(p.id);
   if(Math.abs(a.tx-e.hx)<1e-6){a.stage='after';a.end=a.t+k.after;s.shake=F.shakeFrames;emit(s,e.hx,1,0x7fe8ff,10);}
  }
  e.h=Math.max(1,A.husk.h-4.65*u*u*(3-2*u));
 }else if(a.id==='hymn'&&a.t===a.frames)waves(s,e,a.ivory,a.since);
 if(a.t>=a.end)endAct(s,e);
}

function openUp(s,e,kind,frames,x){
 e.ai='open';e.aiTimer=e.aiFrames=e.open=frames;e.openKind=kind;e.ox=x;e.openDamage=0;e.sinceOpen=0;
 e.act=null;e.queue.length=0;e.stats.openings++;
 if(kind==='veil'){e.x=e.hx;e.y=1;e.w=A.husk.w+.8;e.h=A.husk.h;}
 else{const b=kind==='limb'?A.limb:A.joint;e.x=x;e.y=kind==='limb'?A.limb.y:.4;e.w=b.w;e.h=b.h;}
 emit(s,e.x,e.y+e.h*.5,0xffb347,16);emitSound(s,'block');s.shake=Math.max(s.shake,F.shakeFrames);
}
function closeOpening(s,e){
 e.stats.maxOpen=Math.max(e.stats.maxOpen,e.openDamage/e.maxMask);
 e.open=0;e.riposte=false;neutral(s,e);
}
function stagger(s,e){e.act=null;e.queue.length=0;e.ai='stagger';e.aiTimer=e.aiFrames=A.stagger;body(e);}
function parried(s,e,p,x){
 if(e.glass){defeat(s,e,p);return;}
 emit(s,x,1.5,0xffffff,14);
 if(e.phase>=2&&e.sinceOpen>=A.bigGap)openUp(s,e,'joint',A.jointOpen,x);else stagger(s,e);
}
// The ivory hymn wave, parried back into the husk, shatters its scale-veil (or only staggers it inside the gap).
function veil(s,e){
 if(e.ai==='enter'||e.ai==='transition'||e.ai==='fuse'||e.ai==='spent'||e.ai==='open'||e.glass)return;
 emit(s,e.hx,4,0xffffff,18);
 if(e.sinceOpen>=A.bigGap)openUp(s,e,'veil',A.veilOpen,e.hx);else stagger(s,e);
}
// Parries are read from hurt()'s result where each strike lands; the shared boss hook has nothing to add.
export function antiphonParried(){}
function defeat(s,e,source){
 e.hp=0;e.mask=0;e.dead=true;e.defeatedFrame=s.frame;e.clip='beaten';e.vx=0;e.vy=0;e.ai='spent';
 if(source&&source.team!==2&&source.kills!==undefined)source.kills++;
 emit(s,e.hx,3,0xffb347,30);emitSound(s,'enemy-beaten');s.shake=F.shakeFrames*3;
}
function transition(s,e){
 e.open=0;e.riposte=false;e.phase++;e.ai='transition';e.aiTimer=e.aiFrames=A.transition;e.trans=0;
 e.act=null;e.queue.length=0;body(e);
 s.shake=F.shakeFrames*3;emit(s,e.hx,4,0xf1ece2,24);emitSound(s,'boss-roar');
}
function desperation(s,e){
 e.open=0;e.riposte=false;e.glass=true;e.desperate=A.desperation;e.hp=0;e.mask=0;e.act=null;e.queue.length=0;
 e.ai='fuse';e.aiTimer=e.aiFrames=A.fuse;e.despStart=s.frame;e.song=null;body(e);
 s.hitStop=F.swordStop;emit(s,e.hx,3,0xf1ece2,24);emitSound(s,'mask-shatter');
}
// P1 -> P2: a grasp rises while the ice shatters and the hunter falls into the reflection (render-only flip; the
// physics never changes). P2 -> P3: the line starts to tilt while two cyan hymns run out.
function transTick(s,e,t){
 const k=++e.trans,sh=A.shards;
 if(e.phase===2){
  if(k===1){const a={id:'grasp',stage:'tell',t:0,frames:40,since:s.frame,x:t.x,hit:[],real:1,xs:[0,0,0],end:1e9};aim(a,t.x);e.act=a;}
  if(k===64){s.shake=F.shakeFrames*3;e.holes.length=0;emitSound(s,'mask-shatter');for(let i=0;i<6;i++)emit(s,A.arenaLeft+2+i*3.2,1,0xf1ece2,4);}
  // The shards fall once the world has finished turning over (the turn squashes the picture from 64 to 112).
  if(k===112||k===124||k===136||k===148)e.shards.push({x:clampX(t.x+[-1.4,1.2,0,-.6][(k-112)/12]),t:sh.warn,y:sh.top,since:s.frame});
 }else{
  // Two cyan hymns, each sung on the husk for the hymn's tell first , the second after the turn.
  for(const at of A.transSongs){if(k===at-M.sing.tell)emitSound(s,'enemy-telegraph');if(k===at)waves(s,e,false,s.frame-M.sing.tell);}
  if(k===40)e.tilt={t:0,dir:t.x<A.mid?-1:1,q:0,since:s.frame};
 }
 if(k===88)e.side=-e.side;
 if(e.act){const a=e.act;a.t++;const x=a.xs[1];if(a.t<20)aim(a,t.x);
  if(a.t>=a.frames&&a.t<a.frames+M.grasp.active)for(const p of s.players)if(!a.hit.includes(p.id)&&column(p,x,M.grasp.half,M.grasp.top)&&strike(s,e,p,1,a.since,x,false)!=='immune')a.hit.push(p.id);
  if(a.t===a.frames)emit(s,x,1,0x7fe8ff,10);
  if(a.t>a.frames+M.grasp.active+8)e.act=null;}
 if(--e.aiTimer<=0){e.trans=0;neutral(s,e);if(e.phase===3)e.sing=roll(s,M.sing.gap)>>1;}
}

// Damage: the open joint, limb or face is amber (x2 up to the 10% cap); the ivory robe takes capped chip; the misted
// husk clanks while it rises, turns over, fuses or despairs.
export function antiphonHurt(s,e,source,damage,projectile){
 if(e.ai==='spent'){e.hp=0;e.mask=0;e.dead=true;e.defeatedFrame=s.frame;emit(s,e.hx,3,0xffb347,30);s.shake=F.shakeFrames*3;return 'hit';}
 const clank=e.ai==='enter'||e.ai==='transition'||e.ai==='fuse'||e.glass;
 let take=0;
 const amber=!clank&&e.ai==='open';
 if(amber){
  const d=damage*A.amber*(projectile?.5:1);
  take=Math.min(d,Math.max(0,e.maxMask*A.cap-e.openDamage));
  if(source.form&&source.formBudget>=0)take=Math.min(take,source.formBudget);
  e.openDamage+=take;
  if(source.forms)gainEmber(s,source,EMBER.hit);
 }else if(!clank){
  const raw=source.glass&&source.upgrades?damage/glassMultiplier(source):damage;
  if(source.form&&source.formBudget>=0){
   take=Math.min(raw*A.chip*(projectile?.5:1),e.chip+(e.formChip||0),source.formBudget);
   const base=Math.min(take,e.chip);e.chip-=base;if(take>base)e.formChip-=take-base;
  }else{take=Math.min(raw*A.chip*(projectile?.5:1),e.chip);e.chip-=take;}
 }
 if(source.form&&source.formBudget>=0)source.formBudget=Math.max(0,source.formBudget-take);
 const floor=e.phase<3?e.maxMask*A.thresholds[e.phase-1]:0;
 e.hp=Math.max(floor,e.hp-take);e.mask=e.hp;e.flash=F.flash;
 s.hitStop=Math.max(s.hitStop,amber?F.swordStop:F.hitStop);
 emit(s,source.x+(e.x-source.x)*.5,(source.y||e.y)+1,amber?0xffb347:clank?0x7fe8ff:0xf1ece2,amber?10:4);
 if(amber)s.shake=F.shakeFrames;
 if(clank){emitSound(s,'block');return 'hit';}
 if(e.hp<=floor){if(e.phase<3)transition(s,e);else desperation(s,e);}
 else if(amber&&e.openDamage>=e.maxMask*A.cap-1e-9){emit(s,e.x,e.y+e.h*.5,0x5c5650,10);closeOpening(s,e);if(source.forms)gainEmber(s,source,EMBER.cap);}
 return 'hit';
}

function hazards(s,e,t){
 // Ice holes: a down-slam landing on the causeway cracks one (at most three; each refreezes after 3 s).
 const H=A.holes;
 for(const p of s.players){
  if(p.dead||!p.grounded||p.move!=='downsword'&&p.move!=='divekick'||e.cracked[p.id]===p.attackId||p.x<A.arenaLeft+.5)continue;
  e.cracked[p.id]=p.attackId;
  if(e.holes.length<H.max&&!e.holes.some(h=>Math.abs(h.x-p.x)<H.space)){e.holes.push({x:p.x,t:H.life});emit(s,p.x,1,0xcfe9f2,10);emitSound(s,'mask-crack1');s.shake=Math.max(s.shake,F.shakeFrames);}
 }
 for(let i=e.holes.length-1;i>=0;i--)if(--e.holes[i].t<=0&&!(e.ai==='open'&&e.openKind==='limb'&&e.ox===e.holes[i].x))e.holes.splice(i,1);
 const W=M.hymn;
 for(let i=e.waves.length-1;i>=0;i--){
  const w=e.waves[i];w.x+=w.dir*W.speed*(w.back?1.25:1);
  if(w.back){if(Math.abs(w.x-e.hx)<A.husk.w/2){e.waves.splice(i,1);veil(s,e);}else if(w.x<A.arenaLeft||w.x>A.right)e.waves.splice(i,1);continue;}
  if(w.x<A.arenaLeft-.3||w.x>A.right+.3){e.waves.splice(i,1);continue;}
  for(const p of s.players){
   if(w.hit.includes(p.id)||!column(p,w.x,W.radius,W.top))continue;
   const r=strike(s,e,p,1,w.since,w.x,w.ivory,false,'wave');
   if(r==='parry'&&w.ivory){w.back=true;w.dir=-w.dir;w.hit.length=0;emit(s,w.x,1.3,0xffffff,10);break;}
   if(r==='block'){e.waves.splice(i,1);break;}
   if(r!=='immune')w.hit.push(p.id);
  }
 }
 const S=A.shards;
 for(let i=e.shards.length-1;i>=0;i--){
  const f=e.shards[i];
  if(f.t>0){f.t--;continue;}
  f.y-=S.speed;
  for(const p of s.players)if(!p.dead&&Math.abs(p.x-f.x)<p.w/2+S.radius&&f.y-S.radius<p.y+p.h&&f.y+S.radius>p.y)strike(s,e,p,1,f.since,f.x,false,false,'shard');
  if(f.y<=1){e.shards.splice(i,1);emit(s,f.x,1,0xcfe9f2,6);}
 }
 // P3: the waterline rocks; where it stands over the causeway the mere floods (cyan; a jump clears it).
 const T=A.tilt,g=e.tilt;
 // Spent, the mere calms: the line eases back level and floods no more.
 if(g&&e.ai==='spent'){g.q=Math.max(0,g.q-.05);if(!g.q)e.tilt=null;}
 else if(g){
  g.t++;const a=T.warn,b=a+T.ramp,c=b+T.hold,d=c+T.back;
  g.q=g.t<a?T.lean*g.t/a:g.t<b?T.lean+(1-T.lean)*((g.t-a)/T.ramp)*((g.t-a)/T.ramp)*(3-2*(g.t-a)/T.ramp):g.t<c?1:g.t<d?1-(g.t-c)/T.back:0;
  if(g.q>0)for(const p of s.players)if(!p.dead&&p.grounded&&p.y<1.05&&g.q*T.slope*(p.x-A.mid)*g.dir>T.flood)strike(s,e,p,1,g.since,p.x,false,false,'flood');
  if(g.t>=T.every&&e.ai!=='transition'){g.t=0;g.dir=-g.dir;g.since=s.frame;}
 }
 // P3: the husk sings its own hymns over the saint's strikes (both halves attack at once).
 if(e.phase===3&&!e.glass&&e.ai!=='transition'&&e.ai!=='open'){
  if(e.song){if(++e.song.t>=M.sing.tell){waves(s,e,e.song.ivory,e.song.since);e.song=null;e.sing=roll(s,M.sing.gap);}}
  else if(--e.sing<=0){e.song={t:0,ivory:++e.hymns%M.hymn.every===0,since:s.frame};emitSound(s,'enemy-telegraph');}
 }
}

export function antiphonTick(s,e){
 if(e.dead)return;
 let t=null;
 for(const p of s.players)if(!p.dead){t=p;break;}
 if(!t)return;
 e.stun=0;e.vx=0;e.vy=0;e.hpx=e.hx;
 if(e.inv>0)e.inv--;
 if(e.flash>0)e.flash--;
 if(e.ripple>0)e.ripple--;
 if(--e.chipTimer<=0){e.chipTimer=A.chipWindow;e.chip=e.maxMask*A.chipCap;if(e.formChip!==undefined)e.formChip=e.maxMask*(POSSESSION.chipCap-A.chipCap);}
 for(const p of s.players)if(p.x<A.arenaLeft){p.x=A.arenaLeft;if(p.vx<0)p.vx=0;}
 e.far=Math.abs(t.x-e.hx)>A.antiRange.distance?e.far+1:0;
 e.still=t.blocking||t.grounded&&Math.abs(t.vx)<.01?e.still+1:0;
 e.sinceOpen++;
 if(e.glass&&e.desperate>0)e.desperate--;
 e.stats.frames++;
 hazards(s,e,t);
 if(e.dead)return;
 if(e.ai==='enter'){if(--e.aiTimer<=0)neutral(s,e);}
 else if(e.ai==='neutral'){
  if(!e.act)e.facing=t.x<e.hx?-1:1;
  if(e.glass&&e.desperate<=0){e.ai='spent';e.clip='maskbreak';e.waves.length=0;emitSound(s,'mask-crack3');}
  else if(e.gap>0)e.gap--;
  else if(e.queue.length)start(s,e,t,e.queue.shift());
  else choose(s,e);
 }else if(e.ai==='act')actTick(s,e,t);
 else if(e.ai==='open'){e.open=e.aiTimer;if(--e.aiTimer<=0)closeOpening(s,e);}
 else if(e.ai==='stagger'){if(--e.aiTimer<=0)neutral(s,e);}
 else if(e.ai==='transition')transTick(s,e,t);
 else if(e.ai==='fuse'){if(--e.aiTimer<=0)neutral(s,e);}
 // Desperation: husk and reflection fused cross the line; their body burns on contact.
 if(e.glass&&e.ai!=='fuse'&&e.ai!=='spent'&&!e.dead&&!(e.act?.id==='lunge'&&e.act.t>=e.act.frames))for(const p of s.players)if(column(p,e.hx,1.1,3.6))strike(s,e,p,A.contact,e.despStart,e.hx,false,true,'contact');
 e.clip=e.ai==='spent'?'maskbreak':e.ai==='open'?'hit':e.act?(e.act.t<e.act.frames?'telegraph':'sweep'):e.glass?'glassidle':'idle';
 if(e.act||e.ai==='transition'||e.waves.length||e.shards.length||e.tilt&&e.tilt.q>0||e.glass&&e.ai!=='spent')e.stats.threat++;
}
