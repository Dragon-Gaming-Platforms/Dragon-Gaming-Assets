// Render-only squash and stretch for heroes: a stretch on takeoff (smaller on air jumps) and a
// squash on landing scaled by the fall speed, both eased back. Scales are around the feet, so the
// hitbox and the ground contact never move. Driven by grounded/jump changes seen at sim frames.
export const SQUASH={
 takeoff:{x:.9,y:1.12,frames:8},
 airJump:.6,// share of the takeoff stretch for a double jump
 land:{x:1.16,y:.84,frames:9,peak:.18},
 fall:[.12,.6],// tiles/tick: no squash below, full squash above
};
const clamp=v=>v<0?0:v>1?1:v;
const ONE=[1,1];

export class Squash{
 constructor(){this.m=new WeakMap();this.out=[1,1];}
 at(e,frame,alpha){
  if(e.dead||e.showcase)return ONE;
  let s=this.m.get(e);
  if(!s){s={g:!!e.grounded,j:e.jumps||0,vy:e.vy||0,f:frame,kind:null,start:0,amp:0};this.m.set(e,s);}
  if(frame!==s.f){
   if(e.grounded&&!s.g){const [a,b]=SQUASH.fall;s.kind='land';s.start=frame;s.amp=clamp((-s.vy-a)/(b-a));}
   else if(!e.grounded&&(e.jumps||0)>s.j&&e.vy>0){s.kind='takeoff';s.start=frame;s.amp=s.g?1:SQUASH.airJump;}
   s.g=!!e.grounded;s.j=e.jumps||0;s.vy=e.vy||0;s.f=frame;
  }
  if(!s.kind||s.amp<=0)return ONE;
  const S=SQUASH[s.kind],t=(frame-s.start+alpha)/S.frames;
  if(t>=1){s.kind=null;return ONE;}
  // Landing hits its widest pose quickly then settles; takeoff starts at full stretch.
  const w=s.kind==='land'?(t<S.peak?t/S.peak:(1-(t-S.peak)/(1-S.peak))**2):(1-t)**2;
  const out=this.out;out[0]=1+(S.x-1)*w*s.amp;out[1]=1+(S.y-1)*w*s.amp;
  return out;
 }
}
