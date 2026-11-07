import {F} from '../data/feel.js';
import {CAMERA} from '../data/camera.js';

// Lowest visible world row: the ground slab stays readable and a fall never drags the view into the void.
export const GROUND=-.55;

const smooth=t=>t>=1?1:t*t*(3-2*t);

// Orthographic fit in tiles. Reused state; fitting allocates nothing.
// The horizontal follow is the View's own (the simulation's camera.x only gates enemy activation):
// look-ahead eases between facings, small gaps pull softly, and a critically damped spring in real
// time moves the view, so stops, turns and 120/144 Hz screens never step or whip the picture.
export class Framing{
 constructor(){this.x=9;this.y=5;this.h=0;this.w=0;this.lead=null;this.look=0;this.fx=9;this.vx=0;}
 // focus (optional): a box that must stay in view too (the Unborn Chrysalis in the taller Gullet).
 // dt: real seconds since the last update (0 while frozen: hit-stop, pause).
 update(players,camera,levelWidth,aspect,alpha=1,focus=null,dt=1/60){
  let left=Infinity,right=-Infinity,bottom=Infinity,top=-Infinity,sum=0,count=0,facing=players[0]?.facing||1;
  for(const p of players){
   const size=p.showcase?2.2:1,x=p.px+(p.x-p.px)*alpha,y=Math.max(1,p.py+(p.y-p.py)*alpha);
   left=Math.min(left,x-p.w*size/2);right=Math.max(right,x+p.w*size/2);
   bottom=Math.min(bottom,y);top=Math.max(top,y+p.h*size);
   if(!p.dead){if(!count)facing=p.facing;sum+=x;count++;}
  }
  if(!players.length){left=right=camera.x;bottom=1;top=3;}
  const lead=count?sum/count:(left+right)/2;
  if(focus){left=Math.min(left,focus.left);right=Math.max(right,focus.right);bottom=Math.min(bottom,focus.bottom);top=Math.max(top,focus.top);}
  aspect=aspect>0&&isFinite(aspect)?aspect:16/9;
  const ease=1-Math.pow(1-CAMERA.ease,Math.max(0,dt)*60);
  const baseWidth=Math.max(CAMERA.minWidth,F.cameraWidth*Math.min(1,aspect/CAMERA.portraitAspect));
  const wantedWidth=Math.max(baseWidth,right-left+CAMERA.padX*2),wantedHeight=top-bottom+CAMERA.padY*2;
  const required=Math.max(wantedWidth/aspect,wantedHeight);
  // Expand immediately to keep an aerial partner visible; shrink gently on landing.
  this.h=this.h<required?required:this.h+(required-this.h)*ease;
  const halfH=this.h/2,halfW=this.h*aspect/2,floor=(focus?.ground??GROUND)+halfH;
  const minY=top+CAMERA.padY-halfH,maxY=bottom-CAMERA.padY+halfH;
  this.y+=(Math.max(floor,(top+bottom)/2)-this.y)*ease;
  this.y=Math.max(floor,Math.min(maxY,Math.max(minY,this.y)));
  const minX=right+CAMERA.padX-halfW,maxX=left-CAMERA.padX+halfW;
  if(focus)this.lead=lead;
  let x=focus?this.x+((left+right)/2-this.x)*ease:this.follow(players.length?lead:camera.x,facing,dt);
  x=Math.min(maxX,Math.max(minX,x));
  x=levelWidth>=halfW*2?Math.max(halfW,Math.min(levelWidth-halfW,x)):levelWidth/2;
  // A bound held the view: drop the spring's speed into it so it never winds up behind a wall.
  if(x!==this.fx){if(Math.sign(this.vx)===Math.sign(this.fx-x))this.vx=0;this.fx=x;}
  this.x=x;this.w=this.h*aspect;
  return this;
 }
 follow(lead,facing,dt){
  const look=facing*F.cameraAhead;
  // First frame, respawn, area change or Hall teleport: cut instead of sweeping across the level.
  if(this.lead===null||Math.abs(lead-this.lead)>CAMERA.snap){this.lead=lead;this.look=look;this.fx=lead+look;this.vx=0;return this.fx;}
  this.lead=lead;
  if(!(dt>0))return this.fx;
  this.look+=(look-this.look)*(1-Math.exp(-dt/CAMERA.lookTime));
  const gap=lead+this.look-this.fx,goal=this.fx+gap*smooth(Math.abs(gap)/CAMERA.dead);
  // Critically damped spring (SmoothDamp): continuous velocity, no overshoot.
  const w=2/CAMERA.smoothTime,k=w*dt,decay=1/(1+k+.48*k*k+.235*k*k*k),change=this.fx-goal,temp=(this.vx+w*change)*dt;
  this.vx=(this.vx-w*temp)*decay;
  this.fx=goal+(change+temp)*decay;
  return this.fx;
 }
}
