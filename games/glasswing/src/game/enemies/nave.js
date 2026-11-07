import {emitSound} from '../../core/sound.js';
import {emit} from '../../core/combat.js';
import {WILD as W} from '../../data/enemies.js';
import {data,tell,attack,recover,neutral,near,face,strike,burst,chance,groundAt,hop} from './monster-kit.js';
import {MON} from '../../data/monsters.js';

// The Rendering Nave's wax family: the Wick-Bearer (melee, lights up) and the Drip Censer (lobbed wax that hardens into
// brief floor hazards). Data: src/data/nave.js. Positions in tiles, frames at 60 Hz.

function wickBearer(s,e,p){
 const d=data(e),M=d.moves,dx=p.x-e.x,dist=Math.abs(dx);
 if(!e.lit){
  // Dormant: it shuffles round where it stood until it notices a hunter, then lights its wick (harmless, 30f).
  if(e.ai==='ignite'){e.vx=0;e.clip='ignite';if(--e.aiTimer<=0){e.lit=true;emit(s,e.x,e.y+e.h+.1,0x62f0ff,6);neutral(s,e);}return;}
  e.clip='move';if(Math.abs(e.x-e.homeX)>1.5)e.facing=e.x>e.homeX?-1:1;e.vx=e.facing*d.dormant;
  if(dist<d.notice&&near(p,e,3.5)){face(e,p);e.ai='ignite';e.aiTimer=e.aiFrames=d.ignite;emitSound(s,'enemy-telegraph');}
  return;
 }
 if(e.ai==='idle'){
  face(e,p);e.clip='move';
  e.vx=dist>d.spacing+.15?e.facing*d.speed:dist<d.spacing-.35?-e.facing*d.speed*.6:0;
  if(e.gap>0){e.gap--;return;}
  // A hunter perched on a ledge above: it hops up after it.
  if(e.perch>=MON.perch.wait){hop(s,e);return;}
  if(dist<M.swipe.range&&near(p,e))tell(s,e,'swipe',M.swipe.tell,p);
  else if(dist>=M.lunge.range[0]&&dist<=M.lunge.range[1]&&near(p,e,2.5))tell(s,e,'lunge',M.lunge.tell,p);
 }else if(e.ai==='telegraph'){
  e.vx=0;e.clip='telegraph';
  if(--e.aiTimer<=0)attack(e,M[e.act].active);
 }else if(e.ai==='attack'){
  const m=M[e.act];e.clip=e.act;
  e.vx=e.facing*(m.speed||m.step||0);
  if(m.radius)burst(s,e,e.x,e.y+m.height,m.radius,m);else strike(s,e,m.box,m);
  if(--e.aiTimer<=0){
   // A swipe may carry into a second beat (its own 18f ivory tell).
   if(e.act==='swipe'&&dist<M.swipe2.range&&chance(s,d.chain))tell(s,e,'swipe2',M.swipe2.tell,p);
   else{recover(e,m.after);if(m.exposed)e.exposed=m.exposed;}
  }
 }else{
  e.vx*=W.friction;e.clip=e.act==='lunge'?'gutter':'idle';
  if(--e.aiTimer<=0)neutral(s,e);
 }
}

function dripCenser(s,e,p){
 const d=data(e),M=d.moves,dx=p.x-e.x,dist=Math.abs(dx);
 if(e.ai==='idle'){
  face(e,p);e.clip='move';
  e.vx=dist<d.retreat?-e.facing*d.speed:dist>d.approach?e.facing*d.speed:0;
  if(e.gap>0){e.gap--;return;}
  if(dist<M.spill.range&&near(p,e))tell(s,e,'spill',M.spill.tell,p);
  else if(dist>=M.lob.range[0]&&dist<=M.lob.range[1]){
   e.lobs++;
   if(e.lobs%M.volley.every===0&&dist>=M.volley.range[0])tell(s,e,'volley',M.volley.tell,p);
   else tell(s,e,'lob',M.lob.tell,p);
  }
 }else if(e.ai==='telegraph'){
  e.vx=0;e.clip='telegraph';
  if(--e.aiTimer<=0){
   if(e.act==='spill'){attack(e,M.spill.active);return;}
   // The throw: each blob is aimed at where the hunter stands now and shows its landing spot for its whole flight.
   const m=M[e.act];face(e,p);
   for(let i=0;i<m.count;i++)lob(s,e,p.x+(i-(m.count-1)/2)*m.spread,p.y);
   emitSound(s,'blast-fire');attack(e,6);
  }
 }else if(e.ai==='attack'){
  e.clip=e.act==='spill'?'spill':'throw';e.vx=0;
  if(e.act==='spill')strike(s,e,M.spill.box,M.spill);
  if(--e.aiTimer<=0)recover(e,e.act==='spill'?M.spill.after:30);
 }else{
  e.vx*=W.friction;e.clip='idle';
  if(--e.aiTimer<=0)neutral(s,e);
 }
}
// A wax blob on an exact discrete arc: after flight ticks it is at (tx, the ground under tx).
function lob(s,e,tx,ty){
 const b=data(e).blob,lv=s.level;
 tx=Math.max(1.2,Math.min(lv.width-1.2,tx));
 const x=e.x+e.facing*.3,y=e.y+b.lift,gy=groundAt(lv,tx,ty+.5),T=b.flight;
 s.mon.blobs.push({x,y,px:x,py:y,vx:(tx-x)/T,vy:(gy-y)/T+b.gravity*(T+1)/2,tx,ty:gy,age:0,owner:e.id,told:e.aiFrames,kind:e.kind});
}

export const NAVE_TICKS={'wick-bearer':wickBearer,'drip-censer':dripCenser};
// Per-kind fields, created only on these monsters.
export function naveInit(e){
 if(e.kind==='wick-bearer'){e.lit=false;e.ai='dormant';}
 else e.lobs=0;
}
