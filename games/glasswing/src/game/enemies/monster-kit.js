import {emitSound} from '../../core/sound.js';
import {random} from '../../core/rng.js';
import {overlap,tile,solid} from '../../core/physics.js';
import {hurt} from '../../core/combat.js';
import {MONSTERS,MON} from '../../data/monsters.js';
import {TIERS} from '../../data/rules.js';

// Shared verbs of the spoke families (src/game/enemies/nave.js, mere.js, hindwing.js). State machine on every monster:
// idle (neutral, e.gap frames before the next choice) -> telegraph (e.act, e.aiTimer of e.aiFrames) -> attack -> recover.
// A strike only ever happens in attack, entered from a telegraph of at least MON.minTell frames: e.told keeps that length
// and every landed hit is audited in s.mon.audit (the test asserts its minimum).
const hit={x:0,y:0,w:0,h:0};
export const data=e=>MONSTERS[e.kind];
export const roll=(s,[a,b])=>a+Math.floor(random(s.mon)*(b-a+1));
export const chance=(s,p)=>random(s.mon)<p;
export function tellFor(s,frames){
 const t=TIERS[s.config.difficulty]||TIERS.normal;
 return Math.max(MON.minTell,Math.round(frames*t.tell*(s.config.difficulty==='hard'?MON.glassTell:1)));
}
export function tell(s,e,act,frames,p){
 if(p)e.facing=p.x<e.x?-1:1;
 e.ai='telegraph';e.act=act;e.aiTimer=e.aiFrames=tellFor(s,frames);e.poiseLeft=data(e).poise||0;
 e.vx=0;e.hitIds.length=0;e.clip='telegraph';emitSound(s,'enemy-telegraph');
}
export function attack(e,frames){e.told=e.aiFrames;e.ai='attack';e.aiTimer=e.aiFrames=frames;e.hitIds.length=0;}
export function recover(e,frames){e.ai='recover';e.aiTimer=e.aiFrames=frames;}
export function neutral(s,e,gap=data(e).gap){e.ai='idle';e.act=null;e.aiTimer=0;e.gap=roll(s,gap);}
// The perch answer of light bodies: a harmless hop (no strike) up to a hunter standing on a ledge above; monsterTick
// (monsters.js) plays the crouch and the jump.
export function hop(s,e){e.ai='hop';e.act=null;e.aiTimer=e.aiFrames=MON.perch.crouch;e.vx=0;e.perch=0;e.clip='crouch';emitSound(s,'enemy-telegraph');}
export const near=(p,e,dy=1.5)=>Math.abs(p.y-e.y)<dy;
export const face=(e,p)=>{e.facing=p.x<e.x?-1:1;};

export function audit(s,kind,told,act){
 const a=s.mon.audit;a.hits++;a.by[act]=(a.by[act]||0)+1;
 if(told<a.min)a.min=told;
 if(!(told>=a.kinds[kind]))a.kinds[kind]=told;
}
// A landed strike: cyan (parry:false) ignores the guard, ivory can be parried or blocked.
export function land(s,p,source,parry,told,kind=source.kind,damage=1,act=source.act||kind){
 const r=hurt(s,p,source,damage,{unparryable:!parry});
 if(r==='hit')audit(s,kind,told,act);
 return r;
}
// The strike rectangle in front of the body (box.x forward), or a fixed one (at.x, at.y) such as the diver's column.
export function strike(s,e,box,m,at=null){
 hit.x=at?at.x:e.x+e.facing*box.x;hit.y=(at?at.y:e.y)+box.y;hit.w=box.w;hit.h=box.h;
 for(const p of s.players){
  if(p.dead||e.hitIds.includes(p.id)||!overlap(hit,p))continue;
  e.hitIds.push(p.id);land(s,p,e,m.parry,e.told,e.kind,box.damage||m.damage||1);
 }
}
// A radial burst (spores, vents): the hunter's box within r of (cx, cy). Squared distances only.
export function inRadius(p,cx,cy,r){
 const qx=Math.max(p.x-p.w/2,Math.min(cx,p.x+p.w/2)),qy=Math.max(p.y,Math.min(cy,p.y+p.h));
 return (qx-cx)*(qx-cx)+(qy-cy)*(qy-cy)<=r*r;
}
export function burst(s,e,cx,cy,r,m){
 for(const p of s.players){
  if(p.dead||e.hitIds.includes(p.id)||!inRadius(p,cx,cy,r))continue;
  e.hitIds.push(p.id);land(s,p,e,m.parry,e.told,e.kind,m.damage||1);
 }
}
// The highest walkable surface (solid or one-way top) at or below y in column x; 1 (the floor) when none is found.
export function groundAt(level,x,y){
 const c=Math.floor(x);
 for(let r=Math.min(level.grid.length-1,Math.floor(y)-1);r>=0;r--){const t=tile(level,c,r);if(solid(t)||t===2)return r+1;}
 return 1;
}
export const solidBelow=(level,x,y)=>solid(tile(level,Math.floor(x),Math.floor(y+.01)-1));
// Heavy hits crack armour: a combo ender, kicks, the pogo, a charged blast, any possession form, or 4+ damage.
export function heavy(source,projectile,damage){
 if(projectile)return projectile.radius>.2||damage>=4;
 return !!(source.form||MON.heavy.includes(source.move)||damage>=4);
}
