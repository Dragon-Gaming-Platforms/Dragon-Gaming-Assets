import {emitSound} from '../core/sound.js';
import {B,edge} from '../core/input.js';
import {overlap,solid,tile,physics} from '../core/physics.js';
import {hurt,emit} from '../core/combat.js';
import {F} from '../data/feel.js';
import {BLOOM,BLOOM_ID} from '../data/crowned-bloom.js';
import {POSSESSION as P} from '../data/forms.js';
import {formDamage,endForm} from './possession.js';
import {movement} from './player.js';

// Rules-v5 possession form: THE CROWNED BLOOM (Cordycea's mask; BOSS-DESIGN boss 3b). Four verbs: Sow (stalks erupt
// under enemies 30f later and stand as bounce caps), Bloom Pillar (a stalk lifts you and strikes its column), Spore Nova
// (an amber ring all around) and Mycelial Call (sink, run under the mat, surface; two amber husks rise and fight).
// possession.js owns the shift, the burst clock, the 3-hit shell and the boss limits; possession5.js dispatches here.
// All state lives in e.bloom, created on the first worn frame and removed with the form, so runs that never wear it
// carry none of it. No RNG is drawn; enemies are scanned in list order.
export {BLOOM_ID};
const M=BLOOM.moves,S=M.sow,PL=M.pillar,N=M.nova,C=M.call,HK=C.husk;
const box={x:0,y:0,w:0,h:0};
const hitOpts={stop:0,knock:0,impactX:0};
const fresh=()=>({move:null,stage:'',f:0,dir:1,pillarCd:0,novaCd:0,callCd:0,ids:[],base:0,from:0,top:0,radius:0,
 stalks:[],ledges:[],husks:[],last:0});
const live=(e,t)=>t.team!==e.team&&!t.dead;
const platform=t=>solid(t)||t===2||t===3;

// The floor under (x, y): the first solid or one-way tile top at or below y, within `scan` tiles; null over a pit.
export function floorAt(level,x,y,scan=PL.scan){
 const tx=Math.floor(x);
 for(let ty=Math.ceil(y-.01)-1;ty>=Math.max(0,Math.ceil(y-.01)-1-scan);ty--)if(platform(tile(level,tx,ty)))return ty+1;
 return null;
}
function hit(s,e,t,damage,m,impactX,launch=0,stun=0){
 hitOpts.stop=m.stop??2;hitOpts.knock=m.knock??.5;hitOpts.impactX=impactX;
 const result=hurt(s,t,e,formDamage(e,damage),hitOpts);
 if(result==='hit'&&!t.boss&&!t.dead){if(launch)t.vy=launch;if(stun)t.stun=Math.max(t.stun||0,stun);}
 return result;
}
// One strike of an absolute box against every target not yet struck by this move (ids), crushing brittle walls.
function strikeBox(s,e,targets,ids,damage,m,impactX,launch,stun){
 let landed=false;
 for(const t of targets){
  if(!live(e,t)||ids.includes(t.id)||!overlap(box,t))continue;
  if(hit(s,e,t,damage,m,impactX,launch,stun)!=='immune'){ids.push(t.id);landed=true;}
 }
 for(let y=Math.max(0,Math.floor(box.y));y<Math.min(s.level.grid.length,Math.ceil(box.y+box.h));y++)
  for(let x=Math.max(0,Math.floor(box.x-box.w/2));x<Math.min(s.level.width,Math.ceil(box.x+box.w/2));x++)
   if(s.level.grid[y][x]===4){s.level.grid[y][x]=0;s.levelRevision++;emit(s,x+.5,y+.5,0xa9d68a);}
 return landed;
}
const rel=(e,b)=>{const f=e.facing;box.x=e.x+f*(b.x0+b.x1)/2;box.w=b.x1-b.x0;box.y=e.y+b.y0;box.h=b.y1-b.y0;return box;};
const abs=(x0,x1,y0,y1)=>{box.x=(x0+x1)/2;box.w=x1-x0;box.y=y0;box.h=y1-y0;return box;};

// The form takes the standard 3-hit shell: a 1-mask hit costs a plate and 2 s of the burst, never a flinch.
export function bloomHurt(s,e){
 e.hits=(e.hits||0)+1;e.formShell--;e.inv=P.shellInv;e.flash=F.flash;
 if(s.config.hall!=='trial')e.formTimer-=P.shellCost;
 s.hitStop=Math.max(s.hitStop,F.hitStop);emit(s,e.x,e.y+e.h*.7,0xf1ece2,10);emitSound(s,'block');
 if(e.formShell<=0||e.formTimer<=0)endForm(s,e,'shell');
 return 'hit';
}

// Sow: spores land under the nearest enemies ahead that a stalk can reach (one pending spore per enemy); with none,
// one lands 3 tiles ahead, so the Bloom can grow its own footholds (never as an extra stalk on a sown enemy).
function sow(s,e,h,targets){
 const pending=new Set();for(const k of h.stalks)if(k.st===0&&k.id>=0)pending.add(k.id);
 const picks=[];let seen=false;
 for(const t of targets){
  if(!live(e,t))continue;
  const dx=t.x-e.x;
  if(dx*e.facing<-S.behind||Math.abs(dx)>S.range)continue;
  seen=true;if(pending.has(t.id))continue;
  const base=floorAt(s.level,t.x,t.y+.5);
  if(base===null||t.y>base+S.stalk.h-.2)continue;
  picks.push({t,d:Math.abs(dx),base});
 }
 picks.sort((a,b)=>a.d-b.d);
 const plant=(x,y,id)=>{h.stalks.push({x,y,id,st:0,t:S.delay,ids:[]});emit(s,x,y+.1,0xffb347,4);};
 for(let i=0;i<Math.min(S.seeds,picks.length);i++)plant(picks[i].t.x,picks[i].base,picks[i].t.id);
 if(!seen){
  const x=Math.max(1,Math.min(s.level.width-1,e.x+e.facing*3)),y=floorAt(s.level,x,e.y+.5);
  if(y!==null)plant(x,y,-1);
 }
 // At most `max` spores and stalks stand at once: the oldest rots first.
 let n=0;for(const k of h.stalks)if(k.st<3)n++;
 for(let i=0;i<h.stalks.length&&n>S.max;i++){
  const k=h.stalks[i];if(k.st>=3)continue;
  n--;if(k.st===0)h.stalks.splice(i--,1);else{k.st=3;k.t=S.cap.rot;}
 }
 emitSound(s,'blast-fire');
}
function begin(s,e,h,id,input){
 h.move=id;h.f=0;h.ids.length=0;e.attackId++;e.hitIds.length=0;
 if(id==='sow')h.stage='rake';
 else if(id==='pillar'){h.stage='swell';h.pillarCd=PL.cooldown;emitSound(s,'enemy-telegraph');}
 else if(id==='nova'){h.stage='gather';h.novaCd=N.cooldown;h.radius=0;}
 else if(id==='call'){
  const axis=Number(!!(input&B.right))-Number(!!(input&B.left));
  h.stage='sink';h.callCd=C.cooldown;h.dir=axis||e.facing;h.from=e.x;h.dive=0;emitSound(s,'dodge');emit(s,e.x,e.y+.2,0xffb347,8);
 }
}
const done=h=>{h.move=null;h.stage='';h.f=0;};

function rake(s,e,h,targets){
 e.vx*=F.friction;physics(e,s.level);e.clip='rake';
 if(h.f===S.startup)sow(s,e,h,targets);
 if(h.f>=S.startup&&h.f<S.startup+S.active){rel(e,S.box);if(strikeBox(s,e,targets,h.ids,S.damage,S,e.x))emit(s,e.x+e.facing*2,e.y+1.4,0xffb347,6);}
 if(++h.f>=S.total)done(h);
}
// Bloom Pillar: the stalk grows from the level's floor under you to `height` tiles above it, never into a ceiling.
// Below its top (on the ground, or in a jump) it lifts you there and its cap stays as a ledge. Already at or above it
// (on its own ledge, high in a bounce) it only strikes while you fall, and over a pit (no floor within `scan`) a short
// stalk claws up `air` tiles to your feet. It never grows from its own ledges, so pillars cannot stack the form up out
// of a room. The column strikes once per target while it grows.
function pillar(s,e,h,targets){
 if(h.stage==='swell'){
  e.vx*=F.friction;physics(e,s.level);e.clip='pillar-swell';
  if(++h.f<PL.swell)return;
  const floor=floorAt(s.level,e.x,e.y+.01);
  h.base=floor===null?e.y-PL.air:floor;h.from=e.y;
  let top=floor===null?e.y:h.base+PL.height;
  const x0=Math.floor(e.x-e.w/2+F.collisionSkin),x1=Math.floor(e.x+e.w/2-F.collisionSkin);
  for(let y=Math.floor(e.y+e.h);y<=Math.floor(top+e.h);y++){
   let wall=false;for(let x=x0;x<=x1;x++)if(solid(tile(s.level,x,y)))wall=true;
   if(wall){top=Math.min(top,y-e.h-F.collisionSkin);break;}
  }
  h.lift=top>e.y+1e-6;h.top=h.lift?top:Math.max(h.base,Math.min(e.y,top));h.stage='rise';h.f=0;
  s.shake=F.shakeFrames*2;emit(s,e.x,h.base+.1,0xffb347,18);emitSound(s,'land');
  return;
 }
 const k=Math.min(1,(h.f+1)/PL.grow),q=k*k*(3-2*k),w=PL.w/2;
 if(h.lift){
  e.vx=0;e.vy=0;e.y=h.from+(h.top-h.from)*q;e.grounded=false;e.clip='pillar';
  // The stalk's column, from its foot to above your head at its live height.
  abs(e.x-w,e.x+w,h.base,e.y+e.h+PL.box.y1);
 }else{
  // No lift: the form keeps its fall while the stalk grows under it, its column up to its cap or your feet.
  e.vx*=F.friction;physics(e,s.level);e.clip='pillar';
  abs(e.x-w,e.x+w,h.base,Math.max(h.base+(h.top-h.base)*q,e.y+PL.box.y1));
 }
 if(strikeBox(s,e,targets,h.ids,PL.damage,PL,e.x,PL.launch,PL.stun))emit(s,e.x,box.y+box.h+.6,0xffb347,8);
 if(++h.f>=PL.grow){
  if(h.lift){h.ledges.push({x:e.x,base:h.base,top:h.top,w:PL.w,life:PL.hold,max:PL.hold});e.vy=0;e.grounded=true;e.coyote=F.coyote;}
  done(h);
 }
}
function nova(s,e,h,targets){
 e.vx*=F.friction;physics(e,s.level);e.clip=h.f<N.startup?'nova-gather':'nova';
 if(h.f===N.startup){s.shake=F.shakeFrames*2;emit(s,e.x,e.y+e.h*.5,0xffb347,24);emitSound(s,'blast-hit');}
 if(h.f>=N.startup&&h.f<N.startup+N.active){
  h.radius=N.box.r*(h.f-N.startup+1)/N.active;
  const cx=e.x,cy=e.y+e.h*.5;
  for(const t of targets){
   if(!live(e,t)||h.ids.includes(t.id))continue;
   const nx=Math.max(t.x-t.w/2,Math.min(cx,t.x+t.w/2)),ny=Math.max(t.y,Math.min(cy,t.y+t.h)),dx=nx-cx,dy=ny-cy;
   if(dx*dx+dy*dy>h.radius*h.radius)continue;
   if(hit(s,e,t,N.damage,N,cx,0,N.stun)!=='immune')h.ids.push(t.id);
  }
 }
 if(++h.f>=N.total)done(h);
}
// Mycelial Call: untouchable only while sunk and tunnelling (sink + tunnel, 24f per 75f, the Moth Rush's share); the
// air dive to the mat is not, and a dive that finds no mat within `dive` frames (a pit) ends the call. The tunnel
// surfaces at a ledge's edge rather than run out over a pit. Surfacing strikes around you and raises the husks.
function call(s,e,h,targets){
 if(h.stage==='sink'){
  // Called in the air, the Bloom first dives straight down to the mat, then sinks into it.
  if(!e.grounded){
   if(h.dive>=C.dive){done(h);return;}
   h.dive++;e.vx*=F.friction;e.vy=Math.min(e.vy,C.diveSpeed);physics(e,s.level);e.clip='sink';if(e.grounded){h.from=e.x;e.inv=Math.max(e.inv,2);}return;
  }
  e.inv=Math.max(e.inv,2);
  e.vx*=F.friction;physics(e,s.level);e.clip='sink';
  if(++h.f>=C.sink){h.stage='tunnel';h.f=0;}
  return;
 }
 if(h.stage==='tunnel'){
  e.inv=Math.max(e.inv,2);
  const brink=floorAt(s.level,e.x+h.dir*(e.w/2+C.speed),e.y+.01,1)===null;
  e.vx=brink?0:h.dir*C.speed;e.facing=h.dir;physics(e,s.level);e.clip='tunnel';
  if(++h.f>=C.tunnel||!e.vx){
   h.stage='rise';h.f=0;e.vx=0;
   s.shake=F.shakeFrames;emit(s,e.x,e.y+.2,0xffb347,16);emitSound(s,'punch3');
   raiseHusks(s,e,h);
  }
  return;
 }
 e.vx*=F.friction;physics(e,s.level);e.clip='surface';
 if(h.f<4){rel(e,C.box);strikeBox(s,e,targets,h.ids,C.damage,C,e.x,.2,20);}
 if(++h.f>=C.rise)done(h);
}
// The risen: out of the nearest fallen minor enemies (the dead the mask wears), else where you went in and came out.
function raiseHusks(s,e,h){
 const spots=[];
 for(const t of s.enemies){
  if(!t.dead||t.boss||t.team===e.team||Math.abs(t.x-e.x)>HK.corpse)continue;
  const y=floorAt(s.level,t.x,t.y+.5);if(y!==null)spots.push({x:t.x,y,d:Math.abs(t.x-e.x),from:t.id});
 }
 spots.sort((a,b)=>a.d-b.d);
 for(const x of [h.from,e.x+h.dir*1.6]){
  const y=floorAt(s.level,x,e.y+1.5);
  spots.push({x,y:y??e.y,d:99,from:-1});
 }
 for(let i=0;i<HK.count;i++){
  const p=spots[i];
  h.husks.push({x:p.x,y:p.y,dir:h.dir,life:HK.life,cd:HK.tell,tell:0,f:0,from:p.from,ids:[]});
  emit(s,p.x,p.y+.3,0xffb347,10);
 }
 // Never more than the count at once: a new call replaces the oldest.
 while(h.husks.length>HK.count)h.husks.shift();
}

// Spores, stalks, caps, ledges and the risen husks: in e.bloom, drawn by render2d/crowned-bloom.js.
function garden(s,e,h,targets){
 for(let i=h.stalks.length-1;i>=0;i--){
  const k=h.stalks[i];
  if(k.st===0){
   // The spore creeps under the mat after its enemy (at most `track` tiles a frame), so the stalk erupts under it.
   const t=k.id>=0?targets.find(x=>x.id===k.id&&!x.dead):null;
   if(t){
    const nx=k.x+Math.max(-S.track,Math.min(S.track,t.x-k.x)),ny=floorAt(s.level,nx,k.y+.5,2);
    if(ny!==null&&Math.abs(ny-k.y)<.01)k.x=nx;
   }
   if(--k.t<=0){k.st=1;k.t=S.stalk.erupt;emitSound(s,'land');emit(s,k.x,k.y+.4,0xffb347,10);}}
  else if(k.st===1){
   abs(k.x-S.stalk.w/2,k.x+S.stalk.w/2,k.y,k.y+S.stalk.h);
   strikeBox(s,e,targets,k.ids,S.stalk.damage,S.stalk,k.x,S.stalk.launch,S.stalk.stun);
   if(--k.t<=0){k.st=2;k.t=S.cap.life;}
  }else if(k.st===2){if(--k.t<=0){k.st=3;k.t=S.cap.rot;}}
  else if(--k.t<=0)h.stalks.splice(i,1);
 }
 for(let i=h.ledges.length-1;i>=0;i--)if(--h.ledges[i].life<=-S.cap.rot)h.ledges.splice(i,1);
 for(let i=h.husks.length-1;i>=0;i--){
  const a=h.husks[i];a.f++;
  if(--a.life<=0){emit(s,a.x,a.y+.6,0xf1ece2,6);h.husks.splice(i,1);continue;}
  if(a.tell>0){
   if(--a.tell===0){
    a.ids.length=0;
    abs(a.dir>0?a.x:a.x-HK.reach,a.dir>0?a.x+HK.reach:a.x,a.y,a.y+HK.h);
    if(strikeBox(s,e,targets,a.ids,HK.damage,HK,a.x))emit(s,a.x+a.dir*HK.reach*.6,a.y+1.2,0xffb347,5);
    a.cd=HK.every;
   }
   continue;
  }
  if(a.cd>0)a.cd--;
  let t=null,d=Infinity;
  for(const x of targets){
   if(!live(e,x))continue;
   const dx=Math.abs(x.x-a.x);
   if(dx<=HK.see&&dx<d&&x.y<a.y+3&&x.y+x.h>a.y-.5){t=x;d=dx;}
  }
  if(!t)continue;
  a.dir=t.x>=a.x?1:-1;
  if(d>HK.reach*.7+t.w/2){
   const nx=a.x+a.dir*HK.speed;
   if(!solid(tile(s.level,Math.floor(nx+a.dir*HK.w/2),Math.floor(a.y+.5)))&&floorAt(s.level,nx,a.y+.2,1)!==null)a.x=nx;
  }else if(a.cd<=0)a.tell=HK.tell;
 }
}
// Terrain you build: land on a stalk cap and it springs you up (hold Down to drop through); a Bloom Pillar's cap is a
// ledge to stand on until it rots. Only the wearer uses them, so the level's tiles and every boss's sockets are untouched.
function terrain(e,h,input,lastY){
 if(e.vy>0)return;
 const feet=(x,w)=>Math.abs(e.x-x)<w/2+e.w*.3;
 for(const l of h.ledges){
  if(l.life<=0||!feet(l.x,l.w)||lastY<l.top-F.landTolerance||e.y>l.top+.001)continue;
  if(input&B.down&&!e.grounded)continue;
  e.y=l.top;e.vy=0;e.grounded=true;e.coyote=F.coyote;return;
 }
 if(input&B.down)return;
 for(const k of h.stalks){
  const top=k.y+S.stalk.h;
  if(k.st!==2||!feet(k.x,S.cap.w)||lastY<top-F.landTolerance||e.y>top+.001)continue;
  e.y=top;e.vy=Math.sqrt(2*F.gravity*S.cap.bounce)+F.gravity/2;e.grounded=false;e.jumps=1;e.clip='bounce';k.t=Math.max(1,k.t-30);
  return 'bounce';
 }
}

// One worn frame of the Crowned Bloom, after possession.js's burst clock and boss-limit checks.
export function bloomTick(s,e,input,targets){
 const h=e.bloom||(e.bloom=fresh());
 if(h.pillarCd>0)h.pillarCd--;
 if(h.novaCd>0)h.novaCd--;
 if(h.callCd>0)h.callCd--;
 e.blocking=false;e.dodge=0;e.charge=0;e.move=null;
 const lastY=e.y;
 if(!h.move){
  // A move starts facing the held direction, so the form can turn and strike on the same frame.
  const axis=Number(!!(input&B.right))-Number(!!(input&B.left));
  if(axis&&(input&(B.attack|B.sword|B.blast|B.dodge|B.possess)&~e.prev))e.facing=axis;
  // The Call needs a mat to sink into: over a pit (no floor within the pillar's scan) it never dives you into it.
  if(edge(input,e.prev,B.dodge)&&!h.callCd&&(e.grounded||floorAt(s.level,e.x,e.y+.01)!==null))begin(s,e,h,'call',input);
  else if((edge(input,e.prev,B.blast)||edge(input,e.prev,B.possess))&&!h.novaCd)begin(s,e,h,'nova',input);
  else if(edge(input,e.prev,B.sword)&&!h.pillarCd)begin(s,e,h,'pillar',input);
  else if(edge(input,e.prev,B.attack))begin(s,e,h,'sow',input);
 }
 if(h.move==='sow')rake(s,e,h,targets);
 else if(h.move==='pillar')pillar(s,e,h,targets);
 else if(h.move==='nova')nova(s,e,h,targets);
 else if(h.move==='call')call(s,e,h,targets);
 else movement(e,input,s.level,BLOOM);
 if(!e.bloom)return;
 if(h.move!=='pillar'||h.stage!=='rise'){if(terrain(e,h,input,lastY)==='bounce'){emit(s,e.x,e.y,0xffb347,8);emitSound(s,'dodge');}}
 garden(s,e,h,targets);
}
