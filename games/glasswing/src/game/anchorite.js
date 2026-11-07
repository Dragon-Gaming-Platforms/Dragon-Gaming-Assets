import {emitSound} from '../core/sound.js';
import {entity} from '../core/entity.js';
import {random} from '../core/rng.js';
import {solid,tile,overlap} from '../core/physics.js';
import {hurt,emit} from '../core/combat.js';
import {ANCHORITE as A} from '../data/anchorite.js';
import {TIERS} from '../data/rules.js';
import {F} from '../data/feel.js';
import {glassMultiplier} from './moults.js';
import {gainEmber} from './possession.js';
import {EMBER,POSSESSION} from '../data/forms.js';
import {sinQ} from './chrysalis.js';

// Rules-v4 The Hourglass Anchorite: whenever its upper bulb runs empty it turns the whole Reliquary Drum over (a grid
// remap of the square room, the hunter and the hazards; the renderer eases the 24f turn). Sand pours toward the new
// down and buries the side the hunter landed on; a turn survived unhit and clear of that side brings the amber lower
// bulb down to the floor (the big opening). A parried Sand Lash jams the leg and bares an amber joint (about 3%).
const M=A.moves,N=A.n,X0=A.x0,[HX,HY]=A.hub,L=X0+1,R=X0+N-1;
const cosQ=a=>sinQ(90000-Math.abs(a));
const roll=(s,[a,b])=>a+Math.floor(random(s)*(b-a+1));
const tier=e=>e.glass?3:e.phase-1;
const hitsOf=s=>{let n=0;for(const p of s.players)n+=p.hits||0;return n;};
const clampX=(x,m=.6)=>Math.max(L+m,Math.min(R-m,x));
const box={x:0,y:0,w:0,h:0};

// The drum's own layout at rotation 0: a solid ring and two one-way ledges (half-turn symmetric).
function local(u,v){
 if(u===0||v===0||u===N-1||v===N-1)return 1;
 for(const l of A.ledges)if(v===l.v&&u>=l.u0&&u<=l.u1)return 2;
 return 0;
}
export function turnCell(u,v,q){for(let i=0;i<q;i++){const t=u;u=N-1-v;v=t;}return [u,v];}
// A point (drum units, y up) after q quarter turns counter-clockwise about the drum's centre.
export function turnPoint(X,Y,q){for(let i=0;i<q;i++){const t=X;X=N-Y;Y=t;}return [X,Y];}
function paint(level,rot,open){
 for(let v=0;v<N;v++)for(let u=0;u<N;u++){const [x,y]=turnCell(u,v,rot);level.grid[y][X0+x]=local(u,v);}
 if(open)for(let y=A.door[0];y<=A.door[1];y++)level.grid[y][X0]=0;
}
// The Reliquary Drum over the Nest's boss end; idempotent so a retry restores it (rotation 0, door open, no sand).
export function drum(level){
 while(level.grid.length<N)level.grid.push(Array(level.width).fill(0));
 for(const row of level.grid)while(row.length<A.width)row.push(1);
 level.width=A.width;
 // The view may centre the drum however wide the screen (a phone in landscape with its touch controls is ~3.8:1):
 // the camera's level bound is symmetric about the drum's centre (render only; nothing simulates past its walls).
 level.viewWidth=2*(X0+N/2);
 paint(level,0,true);
 level.secrets=(level.secrets||[]).filter(d=>d.x<X0||d.x>=X0+N);
 level.drum=true;
 return level;
}
// The standing surface at x: the first open row above the floor, the sand bed and any set drift.
export function surfaceAt(level,x){
 const c=Math.floor(x);let y=1;
 while(y<N-1&&solid(tile(level,c,y)))y++;
 return y;
}
const onFloor=(s,p)=>p.grounded&&p.y<=surfaceAt(s.level,p.x)+.05;

export function spawnAnchorite(s){
 const e=entity(s.nextId++,'brawler',HX,A.body.y,2,s.config.difficulty);
 const hp=Math.round(A.hp*(s.config.mode==='coop'?A.coopHP:1)*TIERS[s.config.difficulty].hp),long=!s.config.introSeen&&!s.bossAttempts;
 Object.assign(e,{
  boss:true,v4:true,anchorite:true,card:'anchorite',phase:1,hp,maxMask:hp,mask:hp,eye:'#19B8A6',
  ai:'enter',aiTimer:long?A.intro:A.entrance,aiFrames:long?A.intro:A.entrance,intro:long,sealed:false,
  rot:0,turnQ:2,sand:A.period[0],sandMax:A.period[0],conv:random(s)<.5?-1:1,convT:A.conveyor.every[1],convWarn:0,
  act:null,queue:[],history:[],seen:[],gap:0,leg:1,
  open:0,openKind:'',openDamage:0,openCap:A.cap,openSide:0,bulbX:HX,
  sinceOpen:A.opening.gap,jams:0,sinceJam:A.jam.gap,landT:-1,turnHits:0,trans:false,clear:0,
  drift:null,pits:[],sink:[0,0],bed:0,ribs:[],cages:[],despTurn:0,formTurn:false,
  chip:hp*A.chipCap,chipTimer:A.chipWindow,far:0,still:0,desperate:0,despMax:A.desperation,
  attempt:s.bossAttempts||0,stats:{frames:0,threat:0,openings:0,maxOpen:0,minWarn:999,turns:0,jams:0,bulbs:0,by:{},start:s.frame}
 });
 body(e);
 s.enemies.push(e);s.bossStarted=true;s.checkpoint=A.checkpoint;emitSound(s,'boss-roar');
 return e;
}
// The hurtbox: the ivory carapace at the hub (chip), or the amber part an opening bares.
function body(e){e.x=HX;e.y=A.body.y;e.w=A.body.w;e.h=A.body.h;}

// Every boss hit goes through here, with how long its tell had been showing (the fairness audit reads minWarn).
function strike(s,e,p,damage,warned,opts,why){
 const r=hurt(s,p,e,damage,opts);
 if(r==='hit'||r==='block'||r==='parry')e.stats.minWarn=Math.min(e.stats.minWarn,warned);
 if(r==='hit')e.stats.by[why]=(e.stats.by[why]||0)+1;
 return r;
}
function bury(s,e,p,top,warned,why){
 // Buried: a mask, and the sand shoves the hunter out on top.
 strike(s,e,p,1,warned,{unparryable:true,impactX:p.x},why);
 if(top!==undefined&&p.y<top){p.y=p.py=top;}
 p.vy=Math.max(p.vy,A.bury.shove);p.grounded=false;emit(s,p.x,p.y,0xffb347,8);
}

function allowed(e,id){
 const h=e.history,n=h.length;
 return !(h[n-1]===id&&h[n-2]===id)&&!(n>=3&&h[n-3]===h[n-1]&&h[n-2]===id);
}
function choose(s,e,t){
 const list=A.patterns[tier(e)];
 let pick=null;
 // Range is answered by the Sand Pour (by ribs in P1), turtling by a Reliquary Drop on the spot.
 if(e.far>=A.antiRange.frames)pick=list.find(p=>p.m[0]===(e.phase>1?'pour':'ribs'));
 else if(e.still>=A.antiTurtle)pick=list.find(p=>p.m[0]==='drop')||list.find(p=>p.m[0]==='lash');
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
 e.gap=pick.m.length?0:roll(s,A.neutral[tier(e)])*2;
}
function tellFrames(s,e,id){
 const tr=tier(e),tight=TIERS[s.config.difficulty].tight;
 let tells=A.tells[tr<3?Math.min(2,tr+tight):3];
 if(tr<3&&!e.seen.includes(id)){tells=A.tells[tight];e.seen.push(id);}
 return Math.round(roll(s,tells)*TIERS[s.config.difficulty].tell);
}
function start(s,e,t,id){
 const frames=tellFrames(s,e,id);
 e.act={id,stage:'tell',t:frames,frames,x:clampX(t.x),y:1,start:s.frame,hit:[]};
 const a=e.act;
 if(id==='lash'){e.leg=-e.leg;a.leg=e.leg;a.y=t.grounded?t.y:surfaceAt(s.level,a.x);}
 else if(id==='ribs'){a.side=t.x<HX?1:-1;a.n=M.ribs.count[tier(e)];}
 else if(id==='drop'){
  const n=M.drop.count[tier(e)];
  for(let i=0;i<n;i++){const x=clampX(t.x+(i?(i%2?1:-1)*M.drop.spread*Math.ceil(i/2):0),.7);e.cages.push({x,y:0,vy:0,warn:frames+i*M.drop.stagger,born:s.frame,falling:false});}
 }else if(id==='pour'){a.ang=(t.x<HX?1:-1)*M.pour.from;a.om=-Math.sign(a.ang)*M.pour.speed;}
 emitSound(s,'enemy-telegraph');
}
function endAct(s,e){e.act=null;if(!e.queue.length)e.gap=roll(s,A.neutral[tier(e)]);else e.gap=A.neutral[tier(e)][0]>>1;}
// The Sand Pour: a ray of cyan-lit sand from the hub, ending at the drum's inner walls or floor.
export function beam(e,ang){
 const dx=sinQ(ang)/4096,dy=-cosQ(ang)/4096;
 let len=99;
 if(dx>1e-9)len=Math.min(len,(R-HX)/dx);else if(dx<-1e-9)len=Math.min(len,(L-HX)/dx);
 if(dy<-1e-9)len=Math.min(len,(HY-1-e.bed)/-dy);
 return {dx,dy,len};
}
function actTick(s,e,t){
 const a=e.act;
 if(a.stage==='tell'){
  if(a.id==='lash'&&a.t>a.frames*M.lash.lock){a.x=clampX(t.x);a.y=t.grounded?t.y:surfaceAt(s.level,a.x);}
  if(--a.t>0)return;
  if(a.id==='lash'){a.stage='strike';a.t=0;}
  else if(a.id==='ribs'){a.stage='spawn';a.t=0;}
  else if(a.id==='pour'){a.stage='sweep';emitSound(s,'rush');}
  else endAct(s,e);
  return;
 }
 if(a.id==='lash'){
  if(a.stage==='strike'){
   // The foreleg stabs along a radius; it lands on frame 4 and stays a hitbox for 3 frames.
   a.t++;
   if(a.t===M.lash.hit){s.shake=F.shakeFrames;emit(s,a.x,a.y,0xf1ece2,10);emitSound(s,'land');}
   if(a.t>=M.lash.hit&&a.t<M.lash.hit+M.lash.active){
    box.x=a.x;box.y=a.y;box.w=M.lash.w;box.h=M.lash.h;
    for(const p of s.players)if(!p.dead&&!a.hit.includes(p.id)&&overlap(box,p)){
     const r=strike(s,e,p,e.glass?A.despDamage:1,a.frames+a.t,{stop:F.swordStop,impactX:HX},'lash');
     if(r!=='immune')a.hit.push(p.id);
     if(e.dead||e.act!==a||a.stage!=='strike')return;
    }
   }
   if(a.t>=M.lash.hit+M.lash.active){a.stage='hold';a.t=M.lash.hold;}
  }else if(--a.t<=0)endAct(s,e);
  return;
 }
 if(a.id==='ribs'){
  // Bone ribs sheathed in cyan come out of the far wall at irregular gaps and run the floor.
  if(--a.t>0)return;
  const x=a.side<0?L+.3:R-.3,y=surfaceAt(s.level,x);
  // A rib never comes out of the wall straight into a hunter standing against it (it would hit with no travel to
  // read): that rib of the volley stays in the wall.
  let blocked=false;for(const p of s.players)if(!p.dead&&Math.abs(p.x-x)<p.w/2+M.ribs.w/2+.35&&p.y<y+M.ribs.h)blocked=true;
  if(!blocked){e.ribs.push({x,dir:-a.side,y,born:a.start});emit(s,x,1.3,0x7fe8ff,6);}
  if(--a.n<=0)endAct(s,e);else a.t=roll(s,M.ribs.gap[tier(e)]);
  return;
 }
 if(a.id==='pour'){
  a.ang+=a.om;
  const b=beam(e,a.ang),w=M.pour.width;
  for(const p of s.players){
   if(p.dead||a.hit.includes(p.id))continue;
   for(const k of [.2,.55,.9]){
    const px=p.x-HX,py=p.y+p.h*k-HY,along=px*b.dx+py*b.dy;
    if(along<M.pour.neck||along>b.len+.2)continue;
    const off=Math.abs(px*b.dy-py*b.dx);
    if(off<w+p.w/2){if(strike(s,e,p,1,s.frame-a.start,{unparryable:true,impactX:HX},'pour')!=='immune')a.hit.push(p.id);break;}
   }
  }
  if(Math.abs(a.ang)>M.pour.from)endAct(s,e);
 }
}
function moves(s,e,t){
 if(e.act){actTick(s,e,t);return;}
 if(e.gap>0){e.gap--;return;}
 if(e.queue.length){start(s,e,t,e.queue.shift());return;}
 choose(s,e,t);
}

function hazards(s,e){
 const lv=s.level;
 for(let i=e.ribs.length-1;i>=0;i--){
  const r=e.ribs[i];r.x+=r.dir*M.ribs.speed;
  // A rib shatters against the wall or a step of set sand.
  if(r.x<L+.1||r.x>R-.1||surfaceAt(lv,r.x+r.dir*M.ribs.w/2)>r.y){e.ribs.splice(i,1);emit(s,r.x,r.y+.5,0x7fe8ff,6);continue;}
  r.y=surfaceAt(lv,r.x);
  box.x=r.x;box.y=r.y;box.w=M.ribs.w;box.h=M.ribs.h;
  for(const p of s.players)if(!p.dead&&overlap(box,p))strike(s,e,p,1,s.frame-r.born,{unparryable:true,impactX:r.x-r.dir},'rib');
 }
 for(let i=e.cages.length-1;i>=0;i--){
  const c=e.cages[i],m=M.drop;
  if(!c.falling){if(c.warn%6===0)emit(s,c.x,N-1.2,0xf1ece2,2);if(--c.warn<=0){c.falling=true;c.y=N-1-m.size;}continue;}
  c.vy=Math.max(-m.max,c.vy-m.g);c.y+=c.vy;
  box.x=c.x;box.y=c.y;box.w=m.size;box.h=m.size;
  for(const p of s.players)if(!p.dead&&overlap(box,p))strike(s,e,p,1,s.frame-c.born,{unparryable:true,impactX:c.x},'cage');
  const floor=surfaceAt(lv,c.x);
  if(c.y<=floor){e.cages.splice(i,1);emit(s,c.x,floor+.3,0xf1ece2,12);emit(s,c.x,floor+.5,0x7fe8ff,6);s.shake=F.shakeFrames;emitSound(s,'mask-crack1');}
 }
 // Quicksand pits (P2 on): a hunter who stands in one sinks and is buried.
 for(let i=0;i<s.players.length&&i<2;i++){
  const p=s.players[i];
  let inPit=false;
  if(!p.dead&&onFloor(s,p))for(const pit of e.pits)if(p.x+p.w/2>pit.x0&&p.x-p.w/2<pit.x1)inPit=true;
  e.sink[i]=inPit?e.sink[i]+1:Math.max(0,e.sink[i]-2);
  if(e.sink[i]>=A.sink.frames){e.sink[i]=0;bury(s,e,p,undefined,A.sink.frames,'pit');}
 }
 // The drift on the burying side grows for 4 s, then sets into sand: whoever still stands there is buried.
 const d=e.drift;
 if(d){
  d.t++;
  if(!d.set&&d.t>=A.bury.frames){
   d.set=true;
   const x0=d.side<0?L:HX,x1=d.side<0?HX:R;
   for(let x=x0;x<x1;x++){const y=surfaceAt(lv,x);if(y<N-2&&!lv.grid[y][x]){lv.grid[y][x]=1;d.cells.push([x,y]);}}
   // The set sand fills the quicksand under it: no pit is left hidden beneath the drift (it would swallow a hunter
   // standing on the new step with nothing drawn there).
   for(let i=e.pits.length-1;i>=0;i--)if(e.pits[i].x1>x0&&e.pits[i].x0<x1)e.pits.splice(i,1);
   s.levelRevision++;emitSound(s,'land');
   for(const p of s.players){
    if(p.dead)continue;
    for(const [x,y] of d.cells)if(p.x+p.w/2>x&&p.x-p.w/2<x+1&&p.y<y+1&&p.y+p.h>y){bury(s,e,p,y+1,A.bury.frames,'drift');break;}
   }
  }
  if(d.set&&d.t>=A.bury.frames+A.bury.life)clearDrift(s,e);
 }
}
function clearDrift(s,e){
 const d=e.drift;if(!d)return;
 for(const [x,y] of d.cells)if(s.level.grid[y][x]===1)s.level.grid[y][x]=0;
 if(d.cells.length)s.levelRevision++;
 e.drift=null;
}
function conveyor(s,e){
 if(e.glass||e.ai==='warn'||e.ai==='turn')return;
 if(e.phase>=2){
  // The belt reverses; the sand in the bulb flows backwards 24f before.
  if(e.convWarn>0){if(--e.convWarn===0){e.conv=-e.conv;emitSound(s,'enemy-telegraph');}}
  else if(--e.convT<=0){e.convWarn=A.conveyor.warn;e.convT=roll(s,A.conveyor.every);}
 }
 const v=e.conv*A.conveyor.speed;
 for(const p of s.players){
  if(p.dead||p.dodge>0||!onFloor(s,p))continue;
  const x=Math.max(L+p.w/2+.01,Math.min(R-p.w/2-.01,p.x+v)),c=Math.floor(x+Math.sign(v)*p.w/2);
  if(!solid(tile(s.level,c,Math.floor(p.y+.05))))p.x=x;
 }
}

function startWarn(s,e,q){
 e.ai='warn';e.aiTimer=e.aiFrames=Math.round(roll(s,A.tells[tier(e)<3?tier(e):3].map((v,i)=>i?v+6:v))*TIERS[s.config.difficulty].tell);
 e.turnQ=q;e.act=null;e.queue.length=0;e.turnHits=hitsOf(s);e.landT=-1;
 emitSound(s,'enemy-telegraph');s.shake=F.shakeFrames;
}
function turnKind(s,e){
 if(e.glass)return A.despTurns[e.despTurn++%A.despTurns.length];
 if(e.phase===1)return 2;
 const r=random(s);return r<.4?1:r<.8?3:2;
}
// The turn lands: the room, the hunters (rotated about the drum's centre, then a fall) and the sand all remap.
function rotate(s,e){
 clearDrift(s,e);e.pits.length=0;e.ribs.length=0;e.cages.length=0;
 e.rot=(e.rot+e.turnQ)%4;
 paint(s.level,e.rot,false);
 if(e.phase===3&&!e.glass)e.bed=Math.min(A.bedMax,e.bed+1);
 for(let y=1;y<=e.bed;y++)for(let x=L;x<R;x++)s.level.grid[y][x]=1;
 for(const p of s.players){
  if(p.dead)continue;
  const [X,Y]=turnPoint(p.x-X0,p.y+p.h/2,e.turnQ);
  p.x=Math.max(L+p.w/2+.02,Math.min(R-p.w/2-.02,X0+X));
  p.y=Math.max(1+e.bed,Math.min(N-1-p.h-.02,Y-p.h/2));
  p.px=p.x;p.py=p.y;p.vx=0;p.vy=0;p.knockback=0;p.knockFrames=0;p.grounded=false;p.blocking=false;
 }
 s.levelRevision++;e.stats.turns++;e.sink[0]=e.sink[1]=0;
 s.shake=F.shakeFrames*3;emit(s,HX,HY,0xffb347,16);emitSound(s,'mask-shatter');
}
// The sand pours toward the new down onto the side the hunter landed on; tumbling reliquaries follow.
function startDrift(s,e,t){
 const side=t.x<HX?-1:t.x>HX?1:random(s)<.5?-1:1;
 e.drift={side,t:0,set:false,cells:[]};e.clear=-side;
 if(e.phase>=2){
  const w=A.sink.w,a=clampX(HX+side*(1.2+random(s)*3.4),w/2+.2),b=e.clear<0?L+.1:R-.1-w;
  e.pits.push({x0:a-w/2,x1:a+w/2},{x0:b,x1:b+w});
 }
 const warn=tellFrames(s,e,'cage');
 for(const x of [t.x,HX+side*.3])e.cages.push({x:clampX(x,.7),y:0,vy:0,warn,born:s.frame,falling:false});
}
function openUp(s,e,kind,frames,cap,x,y,w,h){
 e.ai='open';e.aiTimer=e.aiFrames=e.open=frames;e.openKind=kind;e.openDamage=0;e.openCap=cap;
 e.act=null;e.queue.length=0;e.stats.openings++;
 e.x=x;e.y=y;e.w=w;e.h=h;
 emit(s,x,y+h*.5,0xffb347,14);emitSound(s,'block');
}
function closeOpening(s,e){
 e.stats.maxOpen=Math.max(e.stats.maxOpen,e.openDamage/e.maxMask);
 e.open=0;body(e);e.ai='fight';e.gap=roll(s,A.neutral[tier(e)]);
 if(e.openKind==='bulb'){s.shake=F.shakeFrames;emit(s,e.bulbX,surfaceAt(s.level,e.bulbX)+1,0xf1ece2,10);}
}
function openBulb(s,e){
 const o=A.opening,x=clampX(HX+e.clear*o.reach,o.w/2+.1);
 e.bulbX=x;e.openSide=e.clear;e.sinceOpen=0;e.stats.bulbs++;e.landT=-1;
 openUp(s,e,'bulb',o.bulb[e.phase-1],A.cap,x,surfaceAt(s.level,x),o.w,o.h);
 s.shake=F.shakeFrames*2;emitSound(s,'land');
}
export function anchoriteParried(s,e,p){
 const a=e.act;
 if(e.dead||!a||a.id!=='lash'||a.stage!=='strike')return;
 if(e.glass){defeat(s,e,p);return;}
 emit(s,a.x,a.y+1.2,0xffffff,12);
 // A parried Sand Lash jams the foreleg in the floor: its amber joint is bare (at most twice per turn cycle).
 if(e.ai==='fight'&&e.jams<A.jam.max&&e.sinceJam>=A.jam.gap){
  e.jams++;e.sinceJam=0;e.stats.jams++;e.jamX=a.x;e.jamY=a.y;e.jamLeg=a.leg;
  const j=A.jam,x=a.x+(HX-a.x)*.15;
  openUp(s,e,'jam',j.frames,A.jamCap,x,a.y,j.w,j.h);
 }else{a.stage='after';a.t=M.lash.after;}
}
// source: the parrying hunter is credited here; a killing hit is credited by hurt() itself (source null).
function defeat(s,e,source){
 e.hp=0;e.mask=0;e.dead=true;e.defeatedFrame=s.frame;e.clip='beaten';e.vx=0;e.vy=0;e.ai='spent';e.act=null;
 if(source&&source.team!==2&&source.kills!==undefined)source.kills++;
 s.hitStop=F.glassStop*2;s.shake=F.shakeFrames*4;
 emit(s,e.x,e.y+1,0xffb347,30);emit(s,HX,HY,0x7fe8ff,12);emitSound(s,'enemy-beaten');
}
function transition(s,e){
 e.stats['p'+e.phase]=e.stats.frames;e.open=0;e.phase++;e.ai='transition';e.aiTimer=e.aiFrames=A.transition;e.act=null;e.queue.length=0;e.trans=true;body(e);
 s.shake=F.shakeFrames*3;emit(s,HX,HY,0xf1ece2,24);emitSound(s,'boss-roar');
 // An active transition: reliquaries rain while the hourglass cracks, then the room turns at once.
 const t=s.players.find(p=>!p.dead)||s.players[0],warn=A.transition+10;
 for(const x of [t.x,t.x+2.6,t.x-2.6])e.cages.push({x:clampX(x,.7),y:0,vy:0,warn,born:s.frame,falling:false});
}
function desperation(s,e){
 e.stats.p3=e.stats.frames;e.open=0;e.glass=true;e.desperate=A.desperation;e.hp=0;e.mask=0;e.act=null;e.queue.length=0;
 e.ai='fight';e.sandMax=A.period[3];e.sand=A.despOpen;e.gap=A.despOpen+A.neutral[3][0];body(e);clearDrift(s,e);e.pits.length=0;
 s.hitStop=F.swordStop;s.shake=F.shakeFrames*3;emit(s,HX,HY-1,0x7fe8ff,24);emit(s,HX,HY-1,0xffb347,24);emitSound(s,'mask-shatter');
}
// Damage rules: a bared bulb or joint is amber (x2.5 up to its cap); the ivory carapace takes capped chip; the
// entrance, the warning, the turn, the transitions and the desperation clank (the axle is cyan).
export function anchoriteHurt(s,e,source,damage,projectile){
 if(e.ai==='spent'){defeat(s,e,null);return 'hit';}
 const clank=e.ai==='enter'||e.ai==='warn'||e.ai==='turn'||e.ai==='transition'||e.glass;
 let take=0;
 const amber=!clank&&e.ai==='open';
 if(amber){
  const d=damage*A.amber*(projectile?.5:1);
  take=Math.min(d,Math.max(0,e.maxMask*e.openCap-e.openDamage));
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
 else if(amber&&e.openDamage>=e.maxMask*e.openCap-1e-9){emit(s,e.x,e.y+e.h*.55,0x5c5650,10);closeOpening(s,e);if(source.forms)gainEmber(s,source,EMBER.cap);}
 return 'hit';
}

function enter(s,e){
 if(!e.sealed){
  // The hunter walks in from the Nest; the door shuts behind the last one.
  for(const p of s.players)if(!p.dead&&p.x<L+p.w/2+.05)return;
  for(let y=A.door[0];y<=A.door[1];y++)s.level.grid[y][X0]=1;
  s.levelRevision++;e.sealed=true;s.shake=F.shakeFrames*2;emit(s,X0+.5,2,0xf1ece2,12);emitSound(s,'mask-shatter');
 }
 if(--e.aiTimer<=0){e.ai='fight';e.gap=roll(s,A.neutral[0]);}
}

export function anchoriteTick(s,e){
 if(e.dead)return;
 let t=null;
 for(const p of s.players)if(!p.dead){t=p;break;}
 if(!t)return;
 e.stun=0;e.vx=0;e.vy=0;
 if(e.inv>0)e.inv--;
 if(e.flash>0)e.flash--;
 if(--e.chipTimer<=0){e.chipTimer=A.chipWindow;e.chip=e.maxMask*A.chipCap;if(e.formChip!==undefined)e.formChip=e.maxMask*(POSSESSION.chipCap-A.chipCap);}
 e.stats.frames++;
 if(e.ai==='enter'){enter(s,e);return;}
 e.sinceOpen++;e.sinceJam++;
 if(e.glass&&e.desperate>0)e.desperate--;
 e.far=Math.abs(t.x-HX)>A.antiRange.distance?e.far+1:0;
 e.still=t.blocking||t.grounded&&Math.abs(t.vx)<.01?e.still+1:0;
 // The anti-form answer: a taken form turns the room early.
 const form=s.players.some(p=>p.form);
 if(form&&!e.formTurn){e.formTurn=true;if(e.ai==='fight'&&e.sand>A.formTurn)e.sand=A.formTurn;}else if(!form)e.formTurn=false;
 conveyor(s,e);
 hazards(s,e);
 // The axle turns into a contact hazard in desperation.
 if(e.glass&&e.ai!=='spent'){
  box.x=HX;box.y=HY-A.axle.h/2;box.w=A.axle.w;box.h=A.axle.h;
  for(const p of s.players)if(!p.dead&&overlap(box,p))strike(s,e,p,A.despDamage,999,{unparryable:true,impactX:HX},'axle');
 }
 if(e.landT>=0){
  e.landT++;
  if(!e.drift&&!e.glass&&(t.grounded||e.landT>=40))startDrift(s,e,t);
  // The big opening: the turn was survived unhit, and the hunter stands clear of the burying side.
  if(e.drift&&!e.trans&&!e.glass&&e.landT>=A.opening.from&&(e.ai==='fight'||e.ai==='land')&&e.sinceOpen>=A.opening.gap&&
   hitsOf(s)===e.turnHits&&onFloor(s,t)&&(t.x-HX)*e.clear>A.opening.side)openBulb(s,e);
  else if(e.landT>A.opening.to)e.landT=-1;
 }
 if(e.ai==='fight'){
  if(e.glass&&e.desperate<=0&&!e.act){
   // The bulb is spent: the tick drops from the axle; the first hit ends it.
   e.ai='spent';e.act=null;e.x=HX;e.y=surfaceAt(s.level,HX);e.w=3.2;e.h=2.6;s.shake=F.shakeFrames*3;emitSound(s,'mask-crack3');
  }else if(--e.sand<=0&&!e.act){startWarn(s,e,turnKind(s,e));}
  else moves(s,e,t);
 }else if(e.ai==='warn'){
  if(--e.aiTimer<=0){
   e.ai='turn';e.aiTimer=e.aiFrames=A.turn;e.ribs.length=0;e.cages.length=0;clearDrift(s,e);e.pits.length=0;
   emitSound(s,'rush');
  }
 }else if(e.ai==='turn'){
  if(--e.aiTimer<=0){
   rotate(s,e);
   e.ai='land';e.aiTimer=A.land;e.landT=0;e.jams=0;
   e.sand=e.sandMax=A.period[e.glass?3:e.phase-1];
  }
 }else if(e.ai==='land'){
  if(--e.aiTimer<=0){e.ai='fight';e.trans=false;e.gap=roll(s,A.neutral[tier(e)]);}
 }else if(e.ai==='open'){
  e.open=e.aiTimer;
  if(--e.aiTimer<=0)closeOpening(s,e);
 }else if(e.ai==='transition'){
  if(--e.aiTimer<=0)startWarn(s,e,e.phase===2?2:random(s)<.5?1:3);
 }
 e.clip=e.ai==='spent'?'maskbreak':e.ai==='open'?'hit':e.act?.stage==='tell'?'telegraph':'idle';
 if(e.act||e.ribs.length||e.cages.length||e.ai==='warn'||e.ai==='turn'||e.ai==='transition'||e.glass||e.drift&&!e.drift.set||e.pits.length)e.stats.threat++;
}
