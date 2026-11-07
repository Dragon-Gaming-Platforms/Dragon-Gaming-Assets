// Previous positions for simulation objects that carry only x/y (projectiles, effects, drops,
// Chrysalis globs), kept on the renderer side so they glide between 60 Hz ticks like the
// characters. Never writes to the simulation.
const JUMP=1.5;// tiles in one step: a pooled object was reused, start over instead of streaking

export class Trail{
 constructor(){this.m=new WeakMap();this.out=[0,0];}
 // frame: simulation frame; frozen: positions hold (hit-stop, still phases), keep the last blend span.
 at(o,alpha,frame,frozen=false){
  let s=this.m.get(o);
  if(!s||frame-s.f>2||Math.abs(o.x-s.x)>JUMP||Math.abs(o.y-s.y)>JUMP){
   // New (or reused) object: back-project one step of its velocity so it leaves the hand, not ahead of it.
   if(!s){s={};this.m.set(o,s);}
   s.x=o.x;s.y=o.y;s.px=o.x-(o.vx||0);s.py=o.y-(o.vy||0);s.f=frame;
  }else if(frame!==s.f){
   if(!frozen){s.px=s.x;s.py=s.y;s.x=o.x;s.y=o.y;}
   s.f=frame;
  }
  const out=this.out;out[0]=s.px+(s.x-s.px)*alpha;out[1]=s.py+(s.y-s.py)*alpha;
  return out;
 }
}
