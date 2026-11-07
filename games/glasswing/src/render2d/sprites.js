import {clipFor,frameIndex,whiteSheet} from './atlas.js';
import {surface} from './surface.js';
import {P} from './color.js';

// Draws one atlas frame with its pivot at the entity feet; sheets face right and are mirrored.
// Returns the frame record so callers can read sockets.
const state=new WeakMap();
// Locomotion follows the ground covered (odometer), so a planted foot stays where it landed.
// A clip's "travel" table gives the ground distance (atlas tiles) at the start of each drawing, the
// last entry being one full cycle; without one, a hero run spans its frames at RUN_PACE tiles/s.
// Distance counts along the facing (backing up plays the cycle backwards) from the drawn, interpolated
// x, divided by the draw scale. A locomotion clip with no motion shows idle (pushing a wall, waiting),
// except a charge (gallop), which holds its drawing on the frame it starts.
const RUN_PACE=5.5,STILL=.005;
export function spriteFrame(atlas,e,name,progress,frame,x=e.x,scale=1){
 let s=state.get(e);if(!s){s={clip:'',start:frame,attack:-1,dist:0,lastX:x,tick:frame,vPrev:0,odo:false,f:frame,v:0};state.set(e,s);}
 if(frame!==s.tick){s.vPrev=s.vNow;s.tick=frame;}s.vNow=e.vx||0;
 // A started double-jump flip plays to its last drawing while airborne (over the apex and into a glide).
 const dj=atlas.data.clips.doublejump;
 if(dj&&s.clip==='doublejump'&&(name==='jump'||name==='glide')&&!e.grounded&&!e.move&&(frame-s.start)*(dj.fps||8)/60<dj.frames.length){name='doublejump';progress=null;}
 let clipName=clipFor(atlas,name),clip=atlas.data.clips[clipName];
 const dx=x-s.lastX;s.lastX=x;
 if(Math.abs(dx)<1)s.dist+=dx*(e.facing<0?-1:1)/scale;
 const ticks=Math.max(0,Math.min(4,frame-s.f)),v=Math.abs(e.vx||0),braking=ticks>0&&v<s.v*.97;s.f=frame;if(ticks)s.v=v;
 let stride=progress==null?strideOf(clip,clipName,e):0;
 // A run held through a turnaround crosses |vx|<STILL for one tick: keep stepping, stand only from the second still tick.
 if(stride&&name!=='gallop'&&Math.abs(e.vx||0)<STILL&&!(e.clip==='run'&&Math.abs(s.vPrev)>=STILL)){clipName=clipFor(atlas,'idle');clip=atlas.data.clips[clipName];stride=0;}
 // A charge starts on its push-off drawing (both talons down), not wherever the lifetime odometer stands.
 if(stride&&name==='gallop'&&(s.clip!==clipName||!s.odo))s.dist=0;
 if(s.clip!==clipName||(e.move&&s.attack!==e.attackId)){
  // Starting from a stand, a run enters on its drawing closest to the idle pose ("enter"), not a leftover phase.
  if(stride&&clip.travel&&clip.enter!==undefined&&(s.clip==='idle'||s.clip==='glassidle'))s.dist=clip.travel[clip.enter];
  s.clip=clipName;s.start=frame;s.attack=e.attackId;
 }
 s.odo=!!stride;
 let index=stride?travelIndex(clip,s.dist+gaitPhase(e,stride),stride):frameIndex(clip,progress,frame-s.start+(clipName==='idle'?idlePhase(e,clip,progress):0));
 // A gallop bleeding off speed plays its stride on to touchdown instead of hanging on a flight drawing.
 if(stride&&name==='gallop'&&braking&&v<TAIL&&!planted(atlas,clip.frames[index])){
  s.dist+=ticks*TAIL_STEP*stride/clip.frames.length;index=travelIndex(clip,s.dist+gaitPhase(e,stride),stride);
 }
 return {clip:clipName,index,frame:clip.frames[index]};
}
// Gallop tail: braking below TAIL tiles/tick, a flight drawing advances TAIL_STEP extra drawings per tick until a foot is down.
const TAIL=.22,TAIL_STEP=1.2;
// Lowest opaque row of a trimmed drawing relative to the ground line (sheet px, negative = above the ground).
export function footLift(atlas,f){const d=atlas.data;return (f.oy??0)+(f.h??d.cell[1])-d.pivot[1];}
const planted=(atlas,f)=>footLift(atlas,f)>=-3;
// Wild monsters of a wave start walking on the same tick: a constant per-id odometer offset (golden-ratio
// spread over one stride) keeps them out of step. A constant shift leaves every planted foot planted.
const PHI=.6180339887;
export function gaitPhase(e,stride){return e.team===2&&!e.boss?((e.id*PHI)%1)*stride:0;}
// The same for their idle loop, in ticks (other time clips keep the clip clock); the skimmer's wing loop is left alone (its drawings
// differ too much to enter mid-cycle).
function idlePhase(e,clip,progress){return progress==null&&clip.loop!==false&&e.team===2&&!e.boss&&e.kind!=='skimmer'?Math.floor(((e.id*PHI)%1)*clip.frames.length*60/(clip.fps||8)):0;}
function strideOf(clip,name,e){
 if(clip.travel)return clip.travel[clip.travel.length-1];
 return name==='run'&&e.team!==2&&clip.fps?clip.frames.length/clip.fps*RUN_PACE:0;
}
// The drawing whose travel mark is nearest the odometer, so a planted foot's error is centred on its spot.
export function travelIndex(clip,dist,stride){
 const n=clip.frames.length,d=((dist%stride)+stride)%stride,t=clip.travel;
 if(!t)return Math.round(d/stride*n)%n;
 let lo=0,hi=n;while(hi-lo>1){const m=(lo+hi)>>1;if(t[m]<=d)lo=m;else hi=m;}
 return d-t[lo]>t[lo+1]-d?(lo+1)%n:lo;
}
// Trimmed frames store only their opaque rectangle (w, h at ox, oy inside the cell);
// union-cell sheets omit them and use the whole cell. sx/sy: squash and stretch around the feet.
export function drawSprite(g,atlas,f,x,y,dir,scale,flash=false,glowAlpha=1,sx=1,sy=1){
 const d=atlas.data,[cw,ch]=d.cell,[px,py]=d.pivot,s=scale/d.pxPerTile;
 const w=f.w??cw,h=f.h??ch,ox=(f.ox??0)-px,oy=(f.oy??0)-py;
 g.save();g.translate(x,-y);g.scale(dir*s*sx,s*sy);
 g.drawImage(flash?whiteSheet(atlas):atlas.image,f.x,f.y,w,h,ox,oy,w,h);
 // Trimmed glow lives in its own (smaller) sheet, only on frames that have light.
 const gl=d.glowScale?f.g:null;
 if(atlas.glow&&!flash&&glowAlpha>0&&(gl||!d.glowScale)){
  // globalAlpha above 1 is ignored by canvas, so a boost (glass mode) is a second additive pass.
  const a=g.globalAlpha;g.globalCompositeOperation='lighter';
  for(let k=glowAlpha;k>0;k--){
   g.globalAlpha=a*Math.min(1,k);
   if(gl)g.drawImage(atlas.glow,gl[0],gl[1],gl[2],gl[3],gl[4]-px,gl[5]-py,gl[2]/d.glowScale,gl[3]/d.glowScale);
   else g.drawImage(atlas.glow,f.x,f.y,cw,ch,-px,-py,cw,ch);
  }
  g.globalAlpha=a;g.globalCompositeOperation='source-over';
 }
 g.restore();
}
// Socket in world tiles (y up), or null when the frame does not define it.
export function socket(atlas,f,name,x,y,dir,scale,sx=1,sy=1){
 const v=f?.sockets?.[name];if(!v)return null;
 const d=atlas.data,s=scale/d.pxPerTile;
 return [x+dir*(v[0]-d.pivot[0])*s*sx,y-(v[1]-d.pivot[1])*s*sy];
}
// Rules-v4 possession: the boss sheet recoloured amber (hue and saturation only, so the shading stays).
const tints=new WeakMap();
function amberSheet(atlas){
 let c=tints.get(atlas);if(c!==undefined)return c;
 const img=atlas.image,g=(c=surface(img.width||1,img.height||1))?.getContext('2d');
 if(!g)c=null;else{g.drawImage(img,0,0);g.globalCompositeOperation='source-atop';g.fillStyle=P.amber;g.fillRect(0,0,c.width,c.height);}
 tints.set(atlas,c);return c;
}
export function drawTint(g,atlas,f,x,y,dir,scale,alpha=.75,sx=1,sy=1){
 const sheet=amberSheet(atlas);if(!sheet)return;
 const d=atlas.data,[cw,ch]=d.cell,[px,py]=d.pivot,s=scale/d.pxPerTile,a=g.globalAlpha;
 const w=f.w??cw,h=f.h??ch;
 g.save();g.translate(x,-y);g.scale(dir*s*sx,s*sy);g.globalAlpha=a*alpha;g.globalCompositeOperation='color';
 g.drawImage(sheet,f.x,f.y,w,h,(f.ox??0)-px,(f.oy??0)-py,w,h);
 g.globalCompositeOperation='source-over';g.globalAlpha=a;g.restore();
}
