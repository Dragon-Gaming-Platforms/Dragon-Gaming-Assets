import {emitSound} from '../../core/sound.js';
import {emit} from '../../core/combat.js';
import {WILD as W} from '../../data/enemies.js';
import {data,tell,attack,recover,neutral,near,face,strike,solidBelow,hop} from './monster-kit.js';
import {MON} from '../../data/monsters.js';

// The Scale Mere's mirror family: the Mirror Skater (dash-and-strike across the floor, parryable) and the Scale Diver
// (submerges, swims under the ice, rises in an uppercut telegraphed by ripples). Data: src/data/mere.js.

function mirrorSkater(s,e,p){
 const d=data(e),M=d.moves,dx=p.x-e.x,dist=Math.abs(dx);
 if(e.ai==='idle'){
  face(e,p);e.clip='move';
  // It skates: velocity eases toward a target speed, keeping its distance and strafing inside the band.
  if(e.gap%40===0)e.strafe=-e.strafe;
  // Cornered (a wall or the arena lock behind it), it closes in instead of backing off.
  const lo=s.lock?s.lock.left:1,hi=s.lock?s.lock.right:s.level.width-1,cornered=-e.facing<0?e.x<lo+.8:e.x>hi-.8;
  const want=dist<d.keep[0]&&!cornered?-e.facing*d.speed:dist>d.keep[1]||cornered&&dist>=M.cut.range?e.facing*d.speed:e.strafe*d.speed*.5;
  e.vx+=Math.max(-d.accel,Math.min(d.accel,want-e.vx));
  if(e.gap>0){e.gap--;return;}
  if(e.perch>=MON.perch.wait){hop(s,e);return;}
  if(dist<M.cut.range&&near(p,e))tell(s,e,'cut',M.cut.tell,p);
  else if(dist>=M.skate.range[0]&&dist<=M.skate.range[1]&&near(p,e,1.2)){
   tell(s,e,'skate',M.skate.tell,p);e.dash=Math.min(dist+M.skate.over,M.skate.max);
  }
 }else if(e.ai==='telegraph'){
  e.vx*=.7;e.clip='telegraph';
  if(--e.aiTimer<=0){
   const m=M[e.act];
   attack(e,e.act==='skate'?Math.min(m.active,Math.ceil(e.dash/m.speed)):m.active);
   if(e.act==='skate'){e.dashX=e.x;emitSound(s,'dodge');}
  }
 }else if(e.ai==='attack'){
  const m=M[e.act];e.clip=e.act;
  if(e.act==='skate'){
   // A wall ends the dash early.
   if(e.aiTimer<e.aiFrames&&Math.abs(e.x-e.dashX)<m.speed*.3)e.aiTimer=1;
   e.dashX=e.x;e.vx=e.facing*m.speed;
  }else e.vx=e.facing*.02;
  strike(s,e,m.box,m);
  if(--e.aiTimer<=0){recover(e,m.after);if(e.act==='skate')e.vx=e.facing*m.speed*.5;}
 }else{
  e.vx*=e.act==='skate'?.93:W.friction;e.clip=e.act==='skate'?'skid':'idle';
  if(--e.aiTimer<=0)neutral(s,e);
 }
}

function scaleDiver(s,e,p){
 const d=data(e),M=d.moves,dx=p.x-e.x,dist=Math.abs(dx);
 if(e.hidden)e.inv=2;
 if(e.ai==='idle'){
  face(e,p);e.clip='move';
  e.vx=dist>1.1?e.facing*d.speed:0;
  if(e.gap>0){e.gap--;return;}
  if(dist<M.slap.range&&near(p,e))tell(s,e,'slap',M.slap.tell,p);
  // It also dives for a hunter perched on a ledge above (the column reaches the ledges).
  else if((dist>=M.rise.range[0]&&dist<=M.rise.range[1]||e.perch>=MON.perch.wait)&&e.grounded&&solidBelow(s.level,e.x,e.y)){
   e.ai='sink';e.aiTimer=e.aiFrames=d.sink;e.vx=0;emitSound(s,'enemy-telegraph');
  }
 }else if(e.ai==='sink'){
  // It slips under the ice: hittable for the first frames, then gone (only its wake shows).
  e.vx=0;e.clip='sink';
  if(e.aiTimer===d.sink-8){e.hidden=true;e.inv=2;emit(s,e.x,e.y+.1,0x62f0ff,6);}
  if(--e.aiTimer<=0){e.ai='swim';e.aiTimer=e.aiFrames=d.swimMax;}
 }else if(e.ai==='swim'){
  e.clip='swim';face(e,p);
  const ahead=e.x+e.facing*(e.w/2+.1);
  e.vx=Math.abs(dx)>.25&&solidBelow(s.level,ahead,e.y)?e.facing*d.swim:0;
  if(--e.aiTimer<=0||Math.abs(dx)<=.25||!e.vx){
   // The spot is locked: cyan ripples ring it for the whole tell; walking out of it is the answer.
   tell(s,e,'rise',M.rise.tell,null);e.riseX=e.x;e.riseY=e.y;
  }
 }else if(e.ai==='telegraph'){
  e.vx=0;e.clip=e.act==='rise'?'ripple':'telegraph';
  if(--e.aiTimer<=0){
   attack(e,M[e.act].active);
   if(e.act==='rise'){e.hidden=false;e.inv=0;e.vy=M.rise.leap;emit(s,e.riseX,e.riseY+.2,0x62f0ff,12);emitSound(s,'enemy-beaten');}
  }
 }else if(e.ai==='attack'){
  const m=M[e.act];e.clip=e.act;
  if(e.act==='rise'){e.vx=0;strike(s,e,m.box,m,{x:e.riseX,y:e.riseY});}
  else{e.vx=e.facing*.02;strike(s,e,m.box,m);}
  if(--e.aiTimer<=0){recover(e,m.after);if(m.exposed)e.exposed=m.exposed;}
 }else{
  e.vx*=W.friction;e.clip=e.act==='rise'?'beached':'idle';
  if(--e.aiTimer<=0)neutral(s,e);
 }
}

export const MERE_TICKS={'mirror-skater':mirrorSkater,'scale-diver':scaleDiver};
export function mereInit(e){
 if(e.kind==='mirror-skater'){e.strafe=1;e.dash=0;e.dashX=0;}
 else{e.hidden=false;e.riseX=0;e.riseY=0;}
}
