import {emitSound} from '../../core/sound.js';
import {emit} from '../../core/combat.js';
import {WILD as W} from '../../data/enemies.js';
import {sinQ} from '../chrysalis.js';
import {data,tell,attack,recover,neutral,near,face,strike,burst,chance,roll} from './monster-kit.js';
import {MON} from '../../data/monsters.js';

// The Hindwing's sand-and-fungus family: the Sporeling swarm, the Cordyceps Husk and its mid-boss, the Husk Sovereign.
// Data: src/data/hindwing.js. Flock orbits use the integer sine (millidegrees, x4096), never Math.sin.
const cosQ=a=>sinQ(90000-Math.abs(a));
const clampV=(v,m)=>Math.max(-m,Math.min(m,v));

function sporeling(s,e,p){
 const d=data(e),m=d.moves.puff,dx=p.x-e.x,dy=p.y+1-e.y;
 if(e.ai==='idle'){
  e.clip='move';
  // Each member keeps its own slot on a slow ellipse round the hunter; the flock swirls as one.
  const a=(s.frame*d.turn+Math.floor(e.slot*360000/e.of))%360000,side=e.slot%2?-1:1;
  const tx=p.x+side*d.orbit[0]*cosQ(a)/4096,ty=p.y+d.height+d.orbit[1]*sinQ(a)/4096;
  e.vx=clampV((tx-e.x)*d.ease,d.max);e.vy=clampV((ty-e.y)*d.ease,d.max);e.facing=dx<0?-1:1;
  if(e.gap>0){e.gap--;return;}
  if(dx*dx+dy*dy<m.range*m.range&&tokens(s,e)<d.tokens)tell(s,e,'puff',m.tell,p);
 }else if(e.ai==='telegraph'){
  // It swells and drifts in: the cyan puff comes from where it ends up.
  e.clip='telegraph';e.vx=Math.sign(dx)*m.drift;e.vy=Math.sign(dy)*m.drift*.6;
  if(--e.aiTimer<=0){attack(e,m.active);emit(s,e.x,e.y+e.h/2,0x62f0ff,8);}
 }else if(e.ai==='attack'){
  e.clip='puff';e.vx=0;e.vy=0;burst(s,e,e.x,e.y+e.h/2,m.radius,m);
  if(--e.aiTimer<=0)recover(e,m.after);
 }else{
  e.clip='idle';e.vx=-Math.sign(dx)*.03;e.vy=.025;
  if(--e.aiTimer<=0)neutral(s,e);
 }
}
// Members of this flock already inflating or bursting.
function tokens(s,e){
 let n=0;
 for(const o of s.enemies)if(o.flock===e.flock&&!o.dead&&(o.ai==='telegraph'||o.ai==='attack'))n++;
 return n;
}

function cordycepsHusk(s,e,p){
 const d=data(e),M=d.moves,dx=p.x-e.x,dist=Math.abs(dx);
 if(e.ai==='idle'){
  face(e,p);e.clip='move';
  e.vx=dist>1.2?e.facing*(e.armour?d.speed:d.broken):0;
  e.close=dist<d.close&&near(p,e,2)?e.close+1:Math.max(0,e.close-2);
  if(e.gap>0){e.gap--;return;}
  // Anti-turtle vent beside it; for a hunter perched on a ledge above it the spores vent upward (e.up).
  if(e.close>=d.turtle||e.perch>=MON.perch.wait){e.up=e.close<d.turtle;tell(s,e,'vent',M.vent.tell,p);e.close=0;e.perch=0;}
  else if(dist<M.slam.range&&near(p,e))tell(s,e,'slam',e.armour?M.slam.tell:M.slam.broken,p);
 }else if(e.ai==='telegraph'){
  e.vx=0;e.clip='telegraph';
  if(--e.aiTimer<=0)attack(e,M[e.act].active);
 }else if(e.ai==='attack'){
  const m=M[e.act];e.clip=e.act;e.vx=0;
  if(e.act==='vent')burst(s,e,e.x,e.y+(e.up?e.h+m.up:e.h*.5),m.radius,m);else strike(s,e,m.box,m);
  if(--e.aiTimer<=0){recover(e,m.after);e.up=false;}
 }else{
  e.vx*=W.friction;e.clip='idle';
  if(--e.aiTimer<=0)neutral(s,e);
 }
}
// Armour cracks: plates fly, a stagger, and from now on the amber core takes full damage.
export function crack(s,e,frames){
 e.armour=false;e.stun=Math.max(e.stun,frames);
 emit(s,e.x,e.y+e.h*.6,0xf1ece2,16);emit(s,e.x,e.y+e.h*.5,0xffc77c,8);emitSound(s,'mask-shatter');
}

function huskSovereign(s,e,p){
 const d=data(e),M=d.moves,dx=p.x-e.x,dist=Math.abs(dx),p2=e.phase===2;
 if(e.broodCd>0)e.broodCd--;
 if(e.bloomNext&&e.ai!=='roar'){
  // The bloom: an untouchable 60f roar; at 24f a cyan shock rolls out along the floor both ways (jump it).
  e.bloomNext=false;e.ai='roar';e.act='roar';e.aiTimer=e.aiFrames=d.roar;e.vx=0;e.armour=false;emitSound(s,'boss-roar');
 }
 if(e.ai==='roar'){
  e.inv=2;e.clip='roar';
  if(e.aiFrames-e.aiTimer===d.shock.at){
   for(const dir of [-1,1])s.mon.shocks.push({x:e.x+dir*e.w/2,y:e.y,px:e.x,dir,age:0,owner:e.id,told:d.shock.at,kind:e.kind});
   emit(s,e.x,e.y+.3,0x62f0ff,14);
  }
  if(--e.aiTimer<=0){e.phase=2;e.inv=0;neutral(s,e,d.gap2);}
  return;
 }
 if(e.ai==='idle'){
  face(e,p);e.clip='move';
  e.vx=dist>1.8?e.facing*(p2?d.bloomed:d.speed):0;
  // Turtling beside it or perching on a ledge above it both build toward a vent (its anti-air).
  e.close=dist<d.close&&near(p,e,4)?e.close+1:Math.max(0,e.close-2);
  if(e.gap>0){e.gap--;return;}
  if(e.close>=d.turtle){e.close=0;p2?tell(s,e,'bloom',M.bloom.tell,p):tell(s,e,'vent',M.vent.tell,p);}
  else if(p2&&e.broodCd<=0&&broodAlive(s,e)===0){tell(s,e,'brood',M.brood.tell,p);}
  else if(dist<M.slam.range&&near(p,e,3)){
   if(p2){tell(s,e,'triple',M.triple.tell,p);e.chain=M.triple.chain.length;}
   else tell(s,e,'slam',M.slam.tell,p);
  }
  else if(dist>=M.charge.range[0]&&dist<=M.charge.range[1]&&near(p,e,2.5))tell(s,e,'charge',p2?M.charge.p2:M.charge.tell,p);
  else if(p2&&dist<4&&chance(s,.02))tell(s,e,'bloom',M.bloom.tell,p);
 }else if(e.ai==='telegraph'){
  e.vx=0;e.clip=e.act==='charge'?'horns':'telegraph';
  if(--e.aiTimer<=0){
   const m=M[e.act];
   if(e.act==='brood'){e.brood=m.count;e.broodCd=d.broodGap;recover(e,m.after);return;}
   attack(e,m.active);if(e.act==='charge')e.dashX=e.lastX=e.x;
  }
 }else if(e.ai==='attack'){
  const m=M[e.act];e.clip=e.act==='triple'&&e.chain===0?'slamlast':e.act;
  if(e.act==='charge'){
   // Into a wall: the horns stick (exposed); otherwise it runs out of floor or distance.
   const moved=Math.abs(e.x-e.lastX);e.lastX=e.x;
   if(e.aiTimer<e.aiFrames&&moved<m.speed*.3){emit(s,e.x+e.facing*e.w/2,e.y+e.h*.6,0xf1ece2,12);emitSound(s,'block');s.shake=6;recover(e,m.stuck);e.exposed=m.stuck;e.stuck=true;return;}
   if(Math.abs(e.x-e.dashX)>=m.max)e.aiTimer=1;
   e.vx=e.facing*m.speed;strike(s,e,m.box,m);
  }else if(e.act==='vent'||e.act==='bloom'){e.vx=0;burst(s,e,e.x,e.y+e.h*.45,m.radius,m);}
  else{e.vx=0;strike(s,e,e.act==='triple'&&e.chain===0?m.last:m.box,m);}
  if(--e.aiTimer<=0){
   if(e.act==='slam'&&dist<M.slam2.range&&chance(s,.4))tell(s,e,'slam2',M.slam2.tell,p);
   else if(e.act==='triple'&&e.chain>0){const t=M.triple.chain[M.triple.chain.length-e.chain];e.chain--;tell(s,e,'triple',t,p);}
   else{recover(e,m.after);e.stuck=false;}
  }
 }else{
  e.vx*=W.friction;e.clip=e.stuck?'stuck':'idle';
  if(--e.aiTimer<=0){e.stuck=false;neutral(s,e,p2?d.gap2:d.gap);}
 }
}
function broodAlive(s,e){let n=0;for(const o of s.enemies)if(o.mother===e.id&&!o.dead)n++;return n;}

export const HINDWING_TICKS={sporeling,'cordyceps-husk':cordycepsHusk,'husk-sovereign':huskSovereign};
export function hindwingInit(s,e,spawn){
 if(e.kind==='sporeling'){e.flock=spawn.flock;e.slot=spawn.slot;e.of=spawn.of;e.gap=roll(s,data(e).gap);if(spawn.mother)e.mother=spawn.mother;}
 else if(e.kind==='cordyceps-husk'){e.armour=true;e.close=0;e.up=false;}
 else{e.armour=true;e.close=0;e.phase=1;e.heavyHits=0;e.bloomNext=false;e.broodCd=0;e.brood=0;e.chain=0;e.dashX=0;e.lastX=0;e.stuck=false;}
}
