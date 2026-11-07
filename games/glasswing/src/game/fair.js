import {sinQ,asinQ} from './chrysalis.js';
import {CHRYSALIS as C} from '../data/chrysalis.js';

// Rules-v4 fairness fixes, only for configs that carry fair:true (configs without it keep every digest):
// - the swinging cocoon strikes with its drawn shape (three circles along its turned axis, inside the drawing),
//   not an upright box whose corners struck up to 3 tiles from the drawn shell at a wide swing;
// - only its leading side strikes: a shell swinging away (after an apex or a closing seam) never hits;
// - the Old Glasswing's desperation contact waits FAIR.despGrace frames after the mask breaks, so the blow that
//   breaks it is never answered by an untelegraphed body hit.
export const FAIR={
 // [depth from the shell's top, radius] in tiles, for the 3.2 x 5.4 shell (src/render2d/chrysalis.js half()).
 shell:[[1.25,1.1],[2.7,1.5],[4.15,1.2]],
 despGrace:30
};
export const fair=s=>s.config.fair===true&&s.config.rulesVersion>=4;
// Does the turned shell touch the hunter? ang in millidegrees (0 while it reels); the axis points away from the anchor.
export function shellHit(e,p,ang=e.ang){
 const sn=sinQ(ang)/4096,cs=sinQ(90000-Math.abs(ang))/4096,cy=e.y+e.h/2,k=e.h/C.shell.h;
 const x0=p.x-p.w/2,x1=p.x+p.w/2,y0=p.y,y1=p.y+p.h;
 for(const [u,r] of FAIR.shell){
  const d=(u-C.shell.h/2)*k,x=e.x+d*sn,y=cy-d*cs,R=r*k;
  const dx=x<x0?x0-x:x>x1?x-x1:0,dy=y<y0?y0-y:y>y1?y-y1:0;
  if(dx*dx+dy*dy<R*R)return true;
 }
 return false;
}
// The swing's body hit under fair: the drawn shape (the unborn keeps its box) on the side it travels toward.
export const swingHit=(e,p,box)=>(e.cut?box:shellHit(e,p))&&(p.x-e.x)*e.om>=0;
// A P2 transition that starts while the shell lies on the floor (a Drop-Reel crack or settle) hangs it back on the
// cord above where it lies, at rest there, instead of snapping it 3 tiles across to its angle before the reel.
export function unreel(e){
 if(!e.reel)return;
 const a=asinQ(Math.round((e.x-C.anchor[0])/e.cord*4096)),m=C.rungs[C.wallRung];
 e.reel=null;e.om=0;e.ang=Math.max(-m,Math.min(m,a));
 // Hung within a degree of the bottom, gravity rounds to nothing and ease() keeps a zero speed: the shell would hang
 // there forever (a frozen P2 transition, found by the hub fairness scan). Start it toward the middle; ease() lifts it
 // to the wall rung (the finished Chrysalis does the same in chrysalis5.js).
 if(!Math.trunc(C.gravity*sinQ(e.ang)/4096))e.om=-Math.sign(e.ang)||-1;
 // Hung at once (as chrysalis.js place()), so the hit-stop that follows already shows the box where it is drawn.
 e.bx=C.anchor[0]+e.cord*sinQ(e.ang)/4096;e.by=C.anchor[1]-e.cord*sinQ(90000-Math.abs(e.ang))/4096;e.x=e.bx;e.y=e.by-e.h/2;
}
