import {emitSound} from '../core/sound.js';
import {entity} from '../core/entity.js';
import {random} from '../core/rng.js';
import {hurt,fire,emit} from '../core/combat.js';
import {TALLOW as C} from '../data/tallowgrave.js';
import {TIERS} from '../data/rules.js';
import {F} from '../data/feel.js';
import {glassMultiplier} from './moults.js';
import {gainEmber} from './possession.js';
import {EMBER,POSSESSION} from '../data/forms.js';

// Rules-v4 Tallowgrave, the Renderer: solid shadow from a light you can move. P1 it works behind the membrane and only
// its shadow (projected from the spear's light: near 8x and slow, mid 5x, far 3x and fast) and the real spear reach you;
// a parried Tear-Through jams the spear (amber wrist, the light shoves). P2 it steps through and hangs a second lamp; P3 it
// burns and the corpse columns throw the shadows. Every shadow is an x-interval with a creep-in of at least 20f.
const M=C.moves,L=C.arenaLeft,R=C.right;
const roll=(s,[a,b])=>a+Math.floor(random(s)*(b-a+1));
const tier=e=>e.glass?3:e.phase-1;
const clamp=(x,a,b)=>x<a?a:x>b?b:x;
const SHADOW={palm:1,rake:1,grasp:1,snuff:1,pulse:1};
const inside=(p,x0,x1,y0,y1)=>p.x+p.w/2>x0&&p.x-p.w/2<x1&&p.y<y1&&p.y+p.h>y0;

// The Rendering Nave: the Nest's boss arena raised to 12 rows and cleared (wax pews come and go); idempotent for retries.
export function nave(level){
 const w=level.width;
 while(level.grid.length<C.rows)level.grid.push(Array(w).fill(0));
 for(let y=1;y<level.grid.length;y++)for(let x=Math.floor(L);x<Math.min(w,R);x++)level.grid[y][x]=0;
 level.nave=true;level.arena='rendering-nave';
 return level;
}

export function spawnTallow(s){
 const e=entity(s.nextId++,'brawler',C.mid,C.parked,2,s.config.difficulty);
 const hp=Math.round(C.hp*(s.config.mode==='coop'?C.coopHP:1)*TIERS[s.config.difficulty].hp),long=!s.config.introSeen&&!s.bossAttempts;
 const p=s.players.find(q=>!q.dead)||s.players[0],bx=clamp(p.x+6,L+4,R-3);
 Object.assign(e,{
  boss:true,v4:true,tallow:true,name:'tallowgrave',phase:1,hp,maxMask:hp,mask:hp,eye:'#62F0FF',w:.1,h:.1,
  ai:'enter',aiTimer:long?C.intro:C.entrance,aiFrames:long?C.intro:C.entrance,intro:long,
  bx,by:1,pbx:bx,pby:1,facing:-1,behind:true,veil:1,burn:0,pyre:false,
  light:{x:bx-C.light.reach,y:C.light.y,tier:C.light.prefer,hold:0},lamp:null,
  act:null,queue:[],history:[],seen:[],gap:0,walked:0,
  open:0,openKind:'',openDamage:0,openMax:0,riposte:false,sinceOpen:C.openGap-240,sinceSmall:C.smallGap,sinceFlare:C.flareGap,steps:0,
  chip:hp*C.chipCap,chipTimer:C.chipWindow,far:0,still:0,desperate:0,despMax:C.desperation,tt:0,
  shades:[],tears:[],pools:[],trails:[],falls:[],
  attempt:s.bossAttempts||0,stats:{frames:0,threat:0,openings:0,maxOpen:0,jams:0,gutters:0,flares:0,stuns:0,minTell:99,minShadow:99,start:s.frame}
 });
 hurtbox(e);
 s.enemies.push(e);s.bossStarted=true;s.checkpoint=C.door;emitSound(s,'boss-roar');
 return e;
}

// The light the shadows come from: P1 the spear tip behind the veil; P2 the spear and the vault lamp; P3 the burning body.
const lightK=e=>C.light.k[e.light.tier];
function aimLight(e){
 const l=e.light;l.x=e.bx+e.facing*C.light.reach;l.y=e.behind?C.light.y:e.by+5.4;
}
// Where hits can land: behind the veil only the thrust spear (ivory) or its jammed wrist (amber); in the plane, the wax
// body (ivory) or, while open, the wick-heart (amber). Hitboxes never follow the art.
function hurtbox(e){
 const a=e.act;
 if(e.behind){
  if(a?.id==='tear'&&(a.stage==='jam'||a.stage==='stun')){e.x=a.x+a.dir*.85;e.w=2.9;e.y=a.y-.8;e.h=1.6;return;}
  if(a?.id==='tear'&&(a.stage==='out'||a.stage==='hold')){const tip=a.x+a.dir*a.len;e.x=(a.x+tip)/2;e.w=Math.max(.2,a.len);e.y=a.y-C.moves.tear.r;e.h=C.moves.tear.r*2;return;}
  e.x=e.bx;e.y=C.parked;e.w=.1;e.h=.1;return;
 }
 if(e.open>0&&!e.glass){e.x=e.bx;e.w=C.heart.w;e.y=e.by+C.heart.y0;e.h=C.heart.y1-C.heart.y0;return;}
 e.x=e.bx;e.y=e.by;
 if(e.glass){e.w=C.core.w;e.h=e.act?.id==='race'&&e.act.stage==='active'?C.core.race:C.core.h;}
 else{e.w=C.body.w;e.h=C.body.h;}
}

// Shadows: an x-interval (and a height band) that sharpens over t frames, then strikes for `a` frames.
function shade(e,src,x0,x1,y0,y1,T,active,extra){
 const sh={src,x0:clamp(x0,L,R),x1:clamp(x1,L,R),y0,y1,t:T,T:Math.max(C.minShadow,T),a:active,vx:0,hit:[],...extra};
 sh.t=sh.T;e.shades.push(sh);return sh;
}
function strike(s,e,p,d,T,shadow,opts){
 const r=hurt(s,p,e,e.glass?Math.max(d,C.despDamage):d,opts);
 if(r==='hit'){if(shadow)e.stats.minShadow=Math.min(e.stats.minShadow,T);else e.stats.minTell=Math.min(e.stats.minTell,T);}
 return r;
}
function shadesTick(s,e,t){
 for(let i=e.shades.length-1;i>=0;i--){
  const h=e.shades[i];
  if(h.t>0){
   // The palm follows the hunter for its first frames, then locks (a lit lane always remains: it is at most 6 tiles wide).
   if(h.track&&h.T-h.t<h.track){const half=(h.x1-h.x0)/2,c=clamp(t.x,L+half,R-half);h.x0=c-half;h.x1=c+half;}
   if(--h.t===0){if(h.src!=='rake')s.shake=Math.max(s.shake,F.shakeFrames);emitSound(s,h.src==='rake'?'rush':'land');}
   continue;
  }
  if(h.vx){h.x0+=h.vx;h.x1+=h.vx;}
  for(const p of s.players)if(!p.dead&&!h.hit.includes(p.id)&&inside(p,h.x0,h.x1,h.y0,h.y1)){
   const r=strike(s,e,p,1,h.T,true,{unparryable:true,impactX:(h.x0+h.x1)/2});
   if(r!=='immune')h.hit.push(p.id);
  }
  if(h.vx?h.vx>0&&h.x0>R||h.vx<0&&h.x1<L:--h.a<=0)e.shades.splice(i,1);
 }
}
function hazards(s,e,t){
 shadesTick(s,e,t);
 for(let i=e.falls.length-1;i>=0;i--){
  const f=e.falls[i];
  if(f.t%6===0)emit(s,f.x,C.falls.y-.4,0xffc77c,2);
  if(--f.t>0)continue;
  e.falls.splice(i,1);
  const orb=fire(s,e,false,true);
  if(orb){orb.x=f.x;orb.y=C.falls.y;orb.vx=0;orb.vy=C.falls.speed;orb.radius=C.falls.radius;orb.range=99;orb.unparryable=true;orb.damage=1;}
 }
 // Wax pools slow a hunter who walks through them, then cool into low pews (one-way platforms) and melt away.
 const P=M.pour;
 for(let i=e.pools.length-1;i>=0;i--){
  const o=e.pools[i];o.t--;
  if(!o.hard){
   for(const p of s.players)if(!p.dead&&p.grounded&&p.y<1.2&&p.x+p.w/2>o.x0&&p.x-p.w/2<o.x1)p.x=p.px+(p.x-p.px)*P.slow;
   if(o.t<=0){o.hard=true;o.t=P.hard;setPew(s,o,2);emit(s,(o.x0+o.x1)/2,2,0xf1ece2,6);}
  }else if(o.t<=0){setPew(s,o,0);e.pools.splice(i,1);}
 }
 for(let i=e.trails.length-1;i>=0;i--){
  const o=e.trails[i];
  for(const p of s.players)if(!p.dead&&p.grounded&&p.y<1.2&&p.x+p.w/2>o.x0&&p.x-p.w/2<o.x1)p.x=p.px+(p.x-p.px)*M.stride.slow;
  if(--o.t<=0)e.trails.splice(i,1);
 }
 for(let i=e.tears.length-1;i>=0;i--)if(--e.tears[i].t<=0)e.tears.splice(i,1);
}
function setPew(s,o,v){
 for(let x=Math.ceil(o.x0);x<Math.floor(o.x1);x++)if(x>=Math.floor(L)&&x<R)s.level.grid[1][x]=v;
 s.levelRevision++;
}

function allowed(e,id){
 const h=e.history,n=h.length;
 return !(h[n-1]===id&&h[n-2]===id)&&!(n>=3&&h[n-3]===h[n-1]&&h[n-2]===id);
}
function choose(s,e,t){
 const list=C.patterns[tier(e)],due=e.sinceOpen>=C.openGap-60||e.sinceSmall>=C.smallGap;
 let pick=null;
 // Range and turtling are answered under the hunter: a palm (P1), a grasp (P2), a pulse (P3).
 if(e.far>=C.antiRange.frames||e.still>=C.antiTurtle)pick=list.find(p=>p.m[0]==='palm'||p.m[0]==='grasp'||p.m[0]==='pulse');
 if(pick&&!allowed(e,pick.id))pick=null;
 if(!pick){
  // Desperation opens with races and pulses: the parryable thrust (its only way out) waits despOpen frames.
  const late=!e.glass||C.desperation-e.desperate>=C.despOpen;
  let total=0;const w=p=>p.w*(p.open?due?3:C.idleOpen:1)*(late||!p.m.includes('sweep')?1:0);
  for(const p of list)if(allowed(e,p.id))total+=w(p);
  let r=random(s)*total;
  for(const p of list){if(!allowed(e,p.id))continue;r-=w(p);if(r<0){pick=p;break;}}
  pick=pick||list[0];
 }
 e.far=0;e.still=0;
 e.history.push(pick.id);if(e.history.length>3)e.history.shift();
 e.queue=[...pick.m];
}
function tellFrames(s,e,id){
 const tr=tier(e),d=TIERS[s.config.difficulty];
 let tells=C.tells[tr<3?Math.min(2,tr+d.tight):3];
 if(tr<3&&!e.seen.includes(id)){tells=C.tells[d.tight];e.seen.push(id);}
 let f=roll(s,tells);
 // Shadows read by the light: P1 the light's tier sets the tempo, P2 it runs 4f quicker, P3 and later only the floor of 20f.
 if(SHADOW[id])f=Math.max(C.minShadow,tr===0?roll(s,C.light.tells[e.light.tier]):tr===1?roll(s,C.light.tells[e.light.tier])-4:f);
 if(id==='grasp')f=Math.max(f,M.grasp.creep);
 if(id==='race')f=Math.max(f,M.race.crouch);
 return Math.max(SHADOW[id]?C.minShadow:12,Math.round(f*d.tell));
}
function face(e,t){e.facing=t.x<e.bx?-1:1;}
function start(s,e,t,id){
 const T=tellFrames(s,e,id),k=lightK(e);
 const a=e.act={id,stage:'tell',t:T,T,x:t.x,dir:1,y:0,len:0,hit:[]};
 if(!e.behind&&id!=='race')face(e,t);
 aimLight(e);
 emitSound(s,'enemy-telegraph');
 if(id==='palm'){
  // A hand shadow swells over the hunter and sharpens; its width is the hand x the light's magnification.
  const half=Math.min(M.palm.hand*k,R-L-4)/2,c=clamp(t.x,L+half,R-half);
  a.sh=shade(e,'palm',c-half,c+half,1,M.palm.top,T,M.palm.active,{track:Math.min(M.palm.track,T>>2)});
 }else if(id==='rake'){
  // Five finger shadows gather at the wall on the boss's side, then sweep the floor: jump each one.
  const tr=e.light.tier,dir=e.bx<t.x?1:-1,wd=M.rake.width[tr],v=M.rake.speed[tr];
  for(let i=0;i<M.rake.fingers;i++){
   const x0=dir>0?L-wd-i*M.rake.pitch:R+i*M.rake.pitch;
   const sh=shade(e,'rake',x0,x0+wd,1,1+M.rake.h,T,0,{vx:dir*v,i});
   // A finger exists outside the clamp: restore its true span (it enters from beyond the wall).
   sh.x0=x0;sh.x1=x0+wd;
  }
  a.dir=dir;
 }else if(id==='tear'){
  // The real spear tears through the membrane beside the hunter (low or mid lane), ivory flash ring: parryable.
  let dir=t.x>=e.bx?1:-1,x=t.x-dir*M.tear.reach;
  if(x<L+.6||x>R-.6){dir=-dir;x=t.x-dir*M.tear.reach;}
  a.x=clamp(x,L+.6,R-.6);a.dir=dir;a.y=M.tear.lanes[Math.floor(random(s)*M.tear.lanes.length)];
  e.tears.push({x:a.x,y:a.y,t:480});
 }else if(id==='pour'){
  a.x=clamp(t.x,L+1.4,R-1.4);
  if(e.behind)e.tears.push({x:a.x,y:M.pour.y-1,t:480});
 }else if(id==='grasp'){
  // Two lights: safe only where both reach. The band sits between them, never farther than 3.2 tiles from the hunter,
  // and moves with the spear's light while the shadows creep in.
  const g=M.grasp,lamp=e.lamp?e.lamp.x:C.mid,mid=(e.light.x+lamp)/2,c=clamp(clamp(mid,t.x-g.lead,t.x+g.lead),L+g.band/2+.4,R-g.band/2-.4);
  a.band=[c-g.band/2,c+g.band/2];a.drift=e.facing*g.drift;
  a.l=shade(e,'grasp',L,a.band[0],1,9,T,g.active);a.r=shade(e,'grasp',a.band[1],R,1,9,T,g.active);
 }else if(id==='snuff'){
  // It smothers one light: the shadow of its body falls on the far side of the light that stays lit.
  const lamp=e.lamp?.x??C.mid,side=t.x<e.bx?-1:1,lampSide=lamp<e.bx?-1:1;
  a.which=side===lampSide?'lamp':'spear';
  const away=a.which==='lamp'?-e.facing:-lampSide,src=a.which==='lamp'?e.light.x:lamp;
  const edge=e.bx+away*C.body.w/2,len=clamp(1.1*Math.abs(e.bx-src)+1.4,M.snuff.min,M.snuff.len);
  a.dirSnuff=away;
  a.sh=away>0?shade(e,'snuff',edge,edge+len,1,7.5,T,M.snuff.active):shade(e,'snuff',edge-len,edge,1,7.5,T,M.snuff.active);
 }else if(id==='sweep'){
  const list=C.chains[tier(e)];a.chain=[...list[Math.floor(random(s)*list.length)]];a.sub=a.chain.shift();
 }else if(id==='pulse'){
  // The pyre flares; every corpse column throws a bar of shadow away from it. It stands still while they sharpen.
  a.bars=[];
  for(const x of C.columns){
   const d=x-e.bx,ad=Math.abs(d);if(ad<C.column.near)continue;
   const sd=d<0?-1:1,len=clamp(C.column.slope*ad+.5,C.column.min,C.column.max),x0=x+sd*C.column.w/2,x1=x0+sd*len;
   a.bars.push(shade(e,'pulse',Math.min(x0,x1),Math.max(x0,x1),1,1+C.column.h+.6,T,M.pulse.active));
  }
 }else if(id==='race'){
  // The wick-core crouches, a cyan streak marks its lane, then it races through the hunter to the far wall.
  a.dir=t.x>=e.bx?1:-1;if(e.bx+a.dir*3>R-1||e.bx+a.dir*3<L+1)a.dir=-a.dir;a.end=a.dir>0?R-1:L+1;
 }
}
function endAct(s,e){
 e.act=null;
 e.gap=e.queue.length?C.neutral[tier(e)][0]>>1:roll(s,C.neutral[tier(e)]);
}
function sweepBox(e,b){
 const f=e.facing,x0=e.bx+f*b.x0,x1=e.bx+f*b.x1;
 return [Math.min(x0,x1),Math.max(x0,x1),e.by+b.y0,e.by+b.y1];
}
function actTick(s,e,t){
 const a=e.act;
 if(a.stage==='tell'){
  if(a.id==='sweep'&&a.t>a.T/2)face(e,t);
  if(a.id==='grasp'&&a.drift){
   if(a.band[0]+a.drift<L+.4||a.band[1]+a.drift>R-.4)a.drift=0;
   else{a.band[0]+=a.drift;a.band[1]+=a.drift;a.l.x1=a.band[0];a.r.x0=a.band[1];}
  }
  if(--a.t>0)return;
  if(a.id==='tear'){a.stage='out';a.t=M.tear.out;emitSound(s,'rush');}
  else if(a.id==='pour'){a.stage='active';a.t=M.pour.stream;emitSound(s,'blast-fire');}
  else if(a.id==='sweep'){a.stage='active';a.t=M.sweep.active;a.hit.length=0;emitSound(s,a.sub==='thrust'?'rush':'sword-swing');}
  else if(a.id==='race'){a.stage='active';a.t=120;a.hit.length=0;emitSound(s,'rush');emit(s,e.bx,1.5,0x7fe8ff,12);}
  else if(a.id==='rake'){a.stage='active';a.t=600;}
  else{a.stage='active';a.t=a.id==='snuff'?M.snuff.active+M.snuff.relight:M.pulse.active;if(a.id==='palm'||a.id==='grasp')a.t=M.palm.active;}
  return;
 }
 if(a.id==='tear'){
  const m=M.tear;
  if(a.stage==='out'){a.len=m.length*(m.out-a.t+1)/m.out;tearHit(s,e,a);if(a.stage!=='out')return;if(--a.t<=0){a.stage='hold';a.t=m.hold;}}
  else if(a.stage==='hold'){tearHit(s,e,a);if(a.stage!=='hold')return;if(--a.t<=0){a.stage='back';a.t=m.back;}}
  else if(a.stage==='back'){a.len=m.length*a.t/m.back;if(--a.t<=0)endAct(s,e);}
  return;
 }
 if(a.id==='pour'){
  if(a.stage==='active'){
   for(const p of s.players)if(!p.dead&&!a.hit.includes(p.id)&&inside(p,a.x-.45,a.x+.45,1,M.pour.y)){if(strike(s,e,p,1,a.T,false,{unparryable:true,impactX:a.x})!=='immune')a.hit.push(p.id);}
   if(--a.t<=0){
    e.pools.push({x0:a.x-M.pour.half,x1:a.x+M.pour.half,t:M.pour.pool,hard:false});emit(s,a.x,1.2,0xf1ece2,8);
    a.stage='after';a.t=10;
   }
  }else if(--a.t<=0)endAct(s,e);
  return;
 }
 if(a.id==='sweep'){
  const m=M.sweep,b=m[a.sub];
  if(a.stage==='active'){
   if(a.sub==='thrust')e.bx=clamp(e.bx+e.facing*m.lunge,L+C.body.w/2,R-C.body.w/2);
   const [x0,x1,y0,y1]=sweepBox(e,b),ivory=a.sub==='thrust';
   for(const p of s.players){
    if(p.dead||a.hit.includes(p.id)||!inside(p,x0,x1,y0,y1))continue;
    const r=strike(s,e,p,1,a.T,false,{stop:F.swordStop,unparryable:!ivory,impactX:e.bx});
    if(r!=='immune')a.hit.push(p.id);
    if(e.act!==a)return;
   }
   if(--a.t<=0){a.stage='after';a.t=m.after;}
  }else if(--a.t<=0){
   if(a.chain.length){a.sub=a.chain.shift();a.stage='tell';a.t=a.T=tellFrames(s,e,'sweep-'+a.sub);a.hit.length=0;emitSound(s,'enemy-telegraph');}
   else endAct(s,e);
  }
  return;
 }
 if(a.id==='race'){
  const m=M.race;
  if(a.stage==='active'){
   e.bx+=a.dir*m.speed;
   for(const p of s.players)if(!p.dead&&!a.hit.includes(p.id)&&inside(p,e.bx-C.core.w/2,e.bx+C.core.w/2,e.by,e.by+C.core.race)){
    if(strike(s,e,p,C.despDamage,a.T,false,{unparryable:true,impactX:e.bx})!=='immune')a.hit.push(p.id);
   }
   if(a.dir>0?e.bx>=a.end:e.bx<=a.end){e.bx=a.end;a.stage='after';a.t=m.after;s.shake=F.shakeFrames*2;emit(s,e.bx+a.dir*.7,1.5,0x7fe8ff,12);}
  }else if(--a.t<=0)endAct(s,e);
  return;
 }
 if(a.id==='rake'){if(!e.shades.some(h=>h.src==='rake')||--a.t<=0)endAct(s,e);return;}
 if(--a.t<=0)endAct(s,e);
}
function tearHit(s,e,a){
 const tip=a.x+a.dir*a.len,x0=Math.min(a.x,tip),x1=Math.max(a.x,tip),r=M.tear.r;
 for(const p of s.players){
  if(p.dead||a.hit.includes(p.id)||!inside(p,x0,x1,a.y-r,a.y+r))continue;
  const res=strike(s,e,p,1,a.T,false,{stop:F.swordStop,impactX:a.x});
  if(res!=='immune')a.hit.push(p.id);
  if(a.stage!=='out'&&a.stage!=='hold')return;
 }
}

function openUp(s,e,kind,frames){
 e.open=e.openMax=frames;e.openKind=kind;e.openDamage=0;e.stats.openings++;
 if(kind==='jam'||kind==='gutter'){e.sinceOpen=0;e.stats[kind==='jam'?'jams':'gutters']++;}
 else if(kind==='flare'){e.sinceFlare=0;e.stats.flares++;}
 else{e.sinceSmall=0;e.riposte=true;e.stats.stuns++;}
 if(!e.behind){e.ai='open';e.act=null;e.queue.length=0;}
 hurtbox(e);
 emit(s,e.x,e.y+e.h*.5,0xffb347,14);emitSound(s,'block');
}
function closeOpening(s,e){
 e.stats.maxOpen=Math.max(e.stats.maxOpen,e.openDamage/e.maxMask);
 e.open=0;e.riposte=false;
 if(e.behind){if(e.act?.id==='tear'){e.act.stage='back';e.act.t=M.tear.back;}}
 else{e.ai='fight';e.gap=roll(s,C.neutral[tier(e)]);}
 hurtbox(e);
}
// A parry: P1 a Tear-Through jams (12 s apart) or recoils with a short stun (10 s apart); P2-P3 the thrust ender
// gutters the flame (the wick-heart opens) or stuns; in desperation a parried thrust ends it.
export function tallowParried(s,e,p){
 const a=e.act;
 if(e.dead||!a)return;
 const tear=a.id==='tear'&&(a.stage==='out'||a.stage==='hold'),thrust=a.id==='sweep'&&a.sub==='thrust'&&a.stage==='active';
 if(!tear&&!thrust)return;
 if(!a.hit.includes(p.id))a.hit.push(p.id);
 if(e.glass){defeat(s,e,p);return;}
 if(tear){
  // Jammed in the guard, the spear drags its wrist through the silk right up to the hunter (the amber stitches).
  const jam=e.sinceOpen>=C.openGap,stun=!jam&&e.sinceSmall>=C.smallGap;
  if(jam||stun){a.x=clamp(p.x-a.dir*(p.w/2+1.7),L+.6,R-.6);a.len=2.4;e.tears.push({x:a.x,y:a.y,t:480});}
  if(jam){a.stage='jam';openUp(s,e,'jam',C.jam);}
  else if(stun){a.stage='stun';openUp(s,e,'stun',roll(s,C.stun));}
  else{a.stage='back';a.t=M.tear.back;}
  return;
 }
 if(e.sinceOpen>=C.openGap)openUp(s,e,'gutter',C.gutter);
 else if(e.sinceSmall>=C.smallGap)openUp(s,e,'stun',roll(s,C.stun));
 else{a.chain.length=0;a.stage='after';a.t=M.sweep.after;}
}
// The kill: nothing it threw can still land (no retry stolen from a won fight), and the run waits `dying` frames for the
// melt, the dark candles and the larva (run.js reads e.dying) before the win card.
function snuffed(s,e){
 e.act=null;e.queue.length=0;e.shades.length=0;e.falls.length=0;e.dying=C.dying;
 for(const o of s.projectiles)if(o.active&&o.owner===e.id)o.active=false;
}
function defeat(s,e,source){
 e.hp=0;e.mask=0;e.dead=true;e.defeatedFrame=s.frame;e.clip='beaten';e.vx=0;e.vy=0;e.ai='spent';snuffed(s,e);
 if(source&&source.team!==2&&source.kills!==undefined)source.kills++;
 s.shake=F.shakeFrames*4;s.hitStop=Math.max(s.hitStop,F.glassStop*2);
 emit(s,e.bx,e.by+1.5,0xffb347,30);emitSound(s,'enemy-beaten');
}
function transition(s,e){
 e.open=0;e.riposte=false;e.phase++;e.ai='transition';e.aiTimer=e.aiFrames=C.transition;e.tt=0;
 e.act=null;e.queue.length=0;
 for(const h of e.shades)if(h.t>0)h.t=h.T=Math.max(h.t,C.minShadow);
 s.shake=F.shakeFrames*3;emit(s,e.bx,e.by+3,0xf1ece2,24);emitSound(s,'boss-roar');
 hurtbox(e);
}
function desperation(s,e){
 e.open=0;e.riposte=false;e.glass=true;e.desperate=C.desperation;e.hp=0;e.mask=0;e.act=null;e.queue.length=0;
 e.ai='fight';e.gap=C.neutral[3][0];e.shades.length=0;
 s.hitStop=F.swordStop;s.shake=F.shakeFrames*3;emit(s,e.bx,e.by+3,0xf1ece2,24);emitSound(s,'mask-shatter');
 hurtbox(e);
}
// Damage: the open wrist or wick-heart is amber (x2, riposte x1.5, 10% cap); wax is ivory chip under 1% per 5 s; the
// entrance, transitions and the desperation clank. In P1 a strike on the jammed wrist also shoves the light one tier.
export function tallowHurt(s,e,source,damage,projectile){
 if(e.ai==='spent'){e.hp=0;e.mask=0;e.dead=true;e.defeatedFrame=s.frame;snuffed(s,e);emit(s,e.bx,e.by+1.5,0xffb347,30);s.shake=F.shakeFrames*4;return 'hit';}
 const clank=e.ai==='enter'||e.ai==='transition'||e.glass;
 let take=0;
 const amber=!clank&&e.open>0;
 if(amber){
  let d=damage*(e.openKind==='stun'?C.stunAmber:C.amber)*(projectile?C.orb:1);
  if(e.riposte){d*=C.riposte;e.riposte=false;}
  take=Math.min(d,Math.max(0,e.maxMask*C.cap-e.openDamage));
  if(source.form&&source.formBudget>=0)take=Math.min(take,source.formBudget);
  e.openDamage+=take;
  if(source.forms)gainEmber(s,source,EMBER.hit);
  if(e.behind&&!projectile&&e.openKind==='jam'){
   const l=e.light;l.tier=clamp(l.tier+(source.move==='downsword'?-1:1),0,2);l.hold=C.light.hold;
  }
 }else if(!clank&&!projectile){
  const raw=source.glass&&source.upgrades?damage/glassMultiplier(source):damage;
  if(source.form&&source.formBudget>=0){
   take=Math.min(raw*C.chip,e.chip+(e.formChip||0),source.formBudget);
   const base=Math.min(take,e.chip);e.chip-=base;if(take>base)e.formChip-=take-base;
  }else{take=Math.min(raw*C.chip,e.chip);e.chip-=take;}
 }
 if(source.form&&source.formBudget>=0)source.formBudget=Math.max(0,source.formBudget-take);
 const floor=e.phase<3?e.maxMask*C.thresholds[e.phase-1]:0;
 e.hp=Math.max(floor,e.hp-take);e.mask=e.hp;e.flash=F.flash;
 s.hitStop=Math.max(s.hitStop,amber?F.swordStop:F.hitStop);
 emit(s,source.x+(e.x-source.x)*.5,(source.y||e.y)+1,amber?0xffb347:clank?0x7fe8ff:0xf1ece2,amber?10:4);
 if(amber)s.shake=F.shakeFrames;
 if(clank){emitSound(s,'block');return 'hit';}
 if(e.hp<=floor){if(e.phase<3)transition(s,e);else desperation(s,e);}
 else if(amber&&e.openDamage>=e.maxMask*C.cap-1e-9){emit(s,e.x,e.y+e.h*.5,0x5c5650,10);closeOpening(s,e);if(source.forms)gainEmber(s,source,EMBER.cap);}
 return 'hit';
}

function moves(s,e,t){
 if(e.act){actTick(s,e,t);return;}
 if(e.gap>0){
  e.gap--;
  // In the plane it closes distance in short steps (never more than 40f of approach).
  if(!e.behind&&!e.glass&&Math.abs(t.x-e.bx)>5&&e.walked<C.walkMax){e.walked++;face(e,t);e.bx=clamp(e.bx+e.facing*C.walk,L+C.body.w/2,R-C.body.w/2);}
  return;
 }
 e.walked=0;
 if(e.queue.length){start(s,e,t,e.queue.shift());return;}
 choose(s,e,t);
}
// P3 stride: two heavy steps toward the hunter leave burning wax; before every third step the body flares (heart open).
function strideTick(s,e,t){
 const a=e.act,m=M.stride;
 if(a?.id!=='stride')return false;
 if(a.stage==='tell'){if(--a.t<=0){a.stage='active';a.t=m.frames;a.n=0;}return true;}
 e.bx=clamp(e.bx+e.facing*m.speed,L+C.body.w/2,R-C.body.w/2);
 if(--a.t<=0){
  e.steps++;a.n++;s.shake=Math.max(s.shake,F.shakeFrames);emitSound(s,'land');emit(s,e.bx,1,0x7fe8ff,6);
  e.trails.push({x0:e.bx-m.half,x1:e.bx+m.half,t:m.trail});
  if(e.steps%C.flareSteps===0&&e.sinceFlare>=C.flareGap&&!e.glass){openUp(s,e,'flare',C.flare);return true;}
  if(a.n>=m.steps-1)endAct(s,e);else{a.t=m.frames;face(e,t);}
 }
 return true;
}

function transitionTick(s,e,t){
 const n=++e.tt;
 if(e.phase===2){
  // The spear sets the membrane alight: burning tatters fall in three lanes, then the Renderer steps through.
  e.burn=Math.min(1,n/60);
  if(n===20||n===55||n===90)for(const d of C.falls.lanes)e.falls.push({x:clamp(t.x+d,L+.5,R-.5),t:C.falls.warn});
  if(n===110){
   e.behind=false;e.veil=0;e.by=1;face(e,t);
   e.lamp={x:e.bx<C.mid?R-3.5:L+3.5,y:9.6,lit:1};
   s.shake=F.shakeFrames*3;emit(s,e.bx,3,0xf1ece2,24);emitSound(s,'boss-roar');
  }
 }else{
  // It sets itself on fire: the flame climbs the spear, a cyan ring runs both ways along the floor, burning drips fall.
  if(n===40){
   e.pyre=true;e.light.tier=1;s.shake=F.shakeFrames*3;emit(s,e.bx,e.by+5,0x7fe8ff,24);emitSound(s,'boss-roar');
   for(const dir of [1,-1]){
    const orb=fire(s,e,false,true);
    if(orb){orb.x=e.bx+dir*1.4;orb.y=C.wave.y;orb.radius=C.wave.radius;orb.range=C.wave.range;orb.vx=dir*C.wave.speed;orb.unparryable=true;orb.damage=1;}
   }
  }
  if(n===70||n===105)e.falls.push({x:clamp(t.x,L+.5,R-.5),t:C.falls.warn});
 }
 if(--e.aiTimer<=0){e.ai='fight';e.gap=roll(s,C.neutral[e.phase-1]);e.seen.length=0;}
}

export function tallowTick(s,e){
 if(e.dead){if(e.dying>0)e.dying--;return;}
 let t=null;
 for(const p of s.players)if(!p.dead){t=p;break;}
 if(!t)return;
 e.pbx=e.bx;e.pby=e.by;
 e.stun=0;e.vx=0;e.vy=0;
 if(e.inv>0)e.inv--;
 if(e.flash>0)e.flash--;
 if(--e.chipTimer<=0){e.chipTimer=C.chipWindow;e.chip=e.maxMask*C.chipCap;if(e.formChip!==undefined)e.formChip=e.maxMask*(POSSESSION.chipCap-C.chipCap);}
 for(const p of s.players)if(p.x<L){p.x=L;if(p.vx<0)p.vx=0;}
 e.far=Math.abs(t.x-e.bx)>C.antiRange.distance?e.far+1:0;
 e.still=t.blocking||t.grounded&&Math.abs(t.vx)<.01?e.still+1:0;
 e.sinceOpen++;e.sinceSmall++;e.sinceFlare++;
 if(e.glass&&e.desperate>0)e.desperate--;
 // The light drifts back to the Renderer's preferred tier 3 s after a shove.
 if(e.light.hold>0&&--e.light.hold===0)e.light.tier=C.light.prefer;
 e.stats.frames++;
 hazards(s,e,t);
 if(e.ai==='enter'){
  // Behind the backlit membrane its shadow rises while the name and cry show (in full once, then short).
  if(--e.aiTimer<=0){e.ai='fight';e.gap=roll(s,C.neutral[0]);}
 }else if(e.ai==='fight'){
  // Behind the veil it paces after the hunter (it is only a shadow there).
  if(e.behind&&!e.act&&!e.open)e.bx=clamp(e.bx+clamp(t.x+(t.x<C.mid?4:-4)-e.bx,-.03,.03),L+3,R-3);
  if(e.glass&&e.desperate<=0&&!e.act){e.ai='spent';e.clip='maskbreak';e.shades.length=0;emitSound(s,'mask-crack3');}
  else if(e.open>0){if(--e.open<=0)closeOpening(s,e);}
  else if(!strideTick(s,e,t))moves(s,e,t);
 }else if(e.ai==='open'){if(--e.open<=0)closeOpening(s,e);}
 else if(e.ai==='transition')transitionTick(s,e,t);
 aimLight(e);
 // Desperation: the wick-core burns whatever it touches.
 if(e.glass&&e.ai==='fight'&&C.desperation-e.desperate>=C.contactGrace)for(const p of s.players)if(!p.dead&&inside(p,e.bx-C.core.w/2,e.bx+C.core.w/2,e.by,e.by+C.core.h)&&e.act?.id!=='race')hurt(s,p,e,C.contact,{unparryable:true,impactX:e.bx});
 hurtbox(e);
 const a=e.act;
 e.clip=e.ai==='open'||e.open?'hit':e.ai==='transition'?'summon':e.ai==='spent'?'maskbreak':a?(a.stage==='tell'?'telegraph':'sweep'):e.glass?'glassidle':'idle';
 if(a||e.ai==='transition'||e.shades.length||e.falls.length||e.glass&&e.ai!=='spent')e.stats.threat++;
}
