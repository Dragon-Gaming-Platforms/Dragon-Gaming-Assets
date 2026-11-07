// Mend and Mask Ember cues on the hunter (render only; reads the simulation, never writes it).
// The channel: an amber sigil closes around the feet while motes spiral into the mask; the heal: a burst and a
// mended mask rising; a break: the sigil snaps into grey shards; a fizzle: a dry grey ring. The ring filling up:
// a one-time amber flare. Several masks held: the transform wheel around the hunter.
import {glow} from './surface.js';
import {css,P} from './color.js';
import {MEND as M} from '../data/mend.js';
import {POSSESSION} from '../data/forms.js';

const TAU=Math.PI*2,FLARE=40;
const full=new WeakMap();
// The crested mask silhouette (the HUD's clip-path), centred, height h.
function maskPath(g,x,y,h){
 const w=h*.8,pts=[[0,-.5],[.5,-.28],[.42,.2],[0,.5],[-.42,.2],[-.5,-.28]];
 g.beginPath();
 pts.forEach(([a,b],i)=>i?g.lineTo(x+a*w,y+b*h):g.moveTo(x+a*w,y+b*h));
 g.closePath();
}
function spark(g,sp,x,y,r,a){if(!sp||a<=0)return;g.globalAlpha=Math.min(1,a);g.drawImage(sp,x-r,y-r,r*2,r*2);}

// A: the anchors the view just placed for this hunter (x, y at the feet, head socket when known).
export function drawMend(g,e,A,frame){
 if(e.dead||e.team===2)return;
 const x=A.x,y=-A.y,h=e.h||1.7,head=A.head?[A.head[0],-A.head[1]]:[x,y-h*.85];
 g.save();g.globalCompositeOperation='lighter';
 const amber=glow(P.amber),hot=glow(P.amberHot);
 if(e.mend>0){
  const k=Math.min(1,e.mend/M.channel),late=e.mend>M.pulses[2];
  // The sigil at the feet closes clockwise as the channel runs; it turns ivory for the last stretch.
  g.save();g.translate(x,y-.02);g.scale(1,.32);
  g.strokeStyle=css(P.amber,.25);g.lineWidth=.12;g.beginPath();g.arc(0,0,.95,0,TAU);g.stroke();
  g.strokeStyle=css(late?P.ivory:P.amberHot,.9);g.lineWidth=.16;g.beginPath();g.arc(0,0,.95,-Math.PI/2,-Math.PI/2+TAU*k);g.stroke();
  g.restore();
  // Motes spiral in from the sigil to the mask.
  for(let i=0;i<12;i++){
   const ph=(frame*.035+i/12)%1,r=1.2*(1-ph),a=i/12*TAU+ph*4,px=x+(head[0]-x)*ph+Math.cos(a)*r,py=y-.1+(head[1]-y+.1)*ph+Math.sin(a)*r*.35;
   spark(g,i%3?amber:hot,px,py,.16+.1*(1-ph),.45+.55*ph);
   g.fillStyle=css(P.amberHot,.5+.5*ph);g.fillRect(px-.03,py-.03,.06,.06);
  }
  // The mask gathers light.
  spark(g,amber,head[0],head[1],.35+.45*k,.35+.45*k);
  if(late)spark(g,hot,head[0],head[1],.3+.2*Math.sin(frame*.6),.8);
  g.strokeStyle=css(P.amberHot,.35+.4*k);g.lineWidth=.035;maskPath(g,head[0],head[1],.42+.12*k);g.stroke();
 }
 if(e.mendFlash>0){
  const q=1-e.mendFlash/M.flash,a=1-q;
  g.strokeStyle=css(P.amberHot,.9*a);g.lineWidth=.12*a+.02;g.beginPath();g.arc(x,y-h*.55,.4+q*1.9,0,TAU);g.stroke();
  g.strokeStyle=css(P.ivory,.7*a);g.lineWidth=.05;g.beginPath();g.arc(x,y-h*.55,.25+q*1.3,0,TAU);g.stroke();
  // A pillar of light, then the mended mask rising over the head.
  g.fillStyle=css(P.amber,.22*a);g.fillRect(x-.18*(1+q),y-h*1.6,.36*(1+q),h*1.6);
  const my=head[1]-.45-q*.7;
  spark(g,hot,x,my,.55,.9*a);
  g.fillStyle=css(P.amberHot,.95*a);maskPath(g,x,my,.38);g.fill();
  g.strokeStyle=css(P.ivory,a);g.lineWidth=.03;g.stroke();
 }
 g.globalCompositeOperation='source-over';
 if(e.mendBreak>0){
  // The channel snaps: the sigil breaks into four grey arcs and shards fly off the mask.
  const q=1-e.mendBreak/M.broken,a=1-q;
  g.save();g.translate(x,y-.02);g.scale(1,.32);g.strokeStyle=css(P.ash,.85*a);g.lineWidth=.16;
  for(let i=0;i<4;i++){const c=i/4*TAU+.3,r=.95+q*.9;g.beginPath();g.arc(Math.cos(c)*q*.5,Math.sin(c)*q*.5,r,c,c+TAU/4-.5);g.stroke();}
  g.restore();
  g.strokeStyle=css(P.ash,.9*a);g.lineWidth=.07;
  for(let i=0;i<7;i++){
   const ang=i/7*TAU+.4,r0=.3+q*1.3,px=head[0]+Math.cos(ang)*r0,py=head[1]+Math.sin(ang)*r0*.7+q*q*1.2;
   g.beginPath();g.moveTo(px,py);g.lineTo(px+Math.cos(ang)*.3,py+Math.sin(ang)*.18);g.stroke();
  }
 }
 if(e.mendFail>0){
  const q=1-e.mendFail/M.fail;
  g.strokeStyle=css(P.ash,.7*(1-q));g.lineWidth=.04;g.beginPath();g.arc(head[0],head[1],.45-q*.25,0,TAU);g.stroke();
 }
 // The ring just filled: one amber flare that rises off the hunter (the HUD ring keeps glowing after it).
 if(e.emberMax){
  const f=full.get(e),now=e.ember>=e.emberMax&&!e.form&&!e.formShift;
  if(now&&!f?.on)full.set(e,{on:true,at:frame});else if(!now&&f?.on)f.on=false;
  const g0=full.get(e),age=g0?.on?frame-g0.at:FLARE;
  if(age>=0&&age<FLARE){
   const q=age/FLARE,a=1-q;g.globalCompositeOperation='lighter';
   g.strokeStyle=css(P.amber,.9*a);g.lineWidth=.14*a+.02;g.beginPath();g.arc(x,y-h*.6,.5+q*2.4,0,TAU);g.stroke();
   for(const side of [-1,1]){g.strokeStyle=css(P.amberHot,.85*a);g.lineWidth=.07;g.beginPath();g.arc(head[0]+side*.15,head[1]-.2-q*.6,.32+q*.2,side<0?Math.PI*.9:-Math.PI*.4,side<0?Math.PI*1.4:Math.PI*.1);g.stroke();}
   spark(g,amber,head[0],head[1],.6+q*.8,.8*a);
  }
 }
 g.globalCompositeOperation='lighter';
 // The transform wheel: every owned mask on an arc over the hunter; the shown one burns amber (dim until the ring is full).
 if(e.forms?.length>1&&e.formHold>=POSSESSION.hold&&!e.form&&!e.formShift){
  // An arc over the head, first mask on the left: Right steps right, Left steps left.
  const n=e.forms.length,ready=e.ember>=e.emberMax,cx=x,cy=Math.min(head[1],y-h*.8)+.2,R=1.5+.1*n,a0=-Math.PI+.45,a1=-.45;
  g.globalCompositeOperation='source-over';
  g.strokeStyle=css(P.ink,.6);g.lineWidth=1;g.beginPath();g.arc(cx,cy,R,a0-.25,a1+.25);g.stroke();
  g.strokeStyle=css(P.bone,.4);g.lineWidth=.03;g.beginPath();g.arc(cx,cy,R,a0-.25,a1+.25);g.stroke();
  for(let i=0;i<n;i++){
   const ang=a0+(a1-a0)*i/(n-1),px=cx+Math.cos(ang)*R,py=cy+Math.sin(ang)*R,pick=i===e.formPick;
   g.globalCompositeOperation='lighter';
   if(pick)spark(g,ready?amber:glow(P.ash),px,py,.6,.9);
   g.globalCompositeOperation='source-over';
   g.fillStyle=pick?css(ready?P.amberHot:P.bone,.95):css(P.boneShade,.55);maskPath(g,px,py,pick?.62:.42);g.fill();
   g.strokeStyle=css(P.outline,.9);g.lineWidth=.03;g.stroke();
  }
 }
 g.globalAlpha=1;g.globalCompositeOperation='source-over';g.restore();
}
