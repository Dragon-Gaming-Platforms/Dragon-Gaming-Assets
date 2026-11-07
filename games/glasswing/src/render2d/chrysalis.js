import {CHRYSALIS as C} from '../data/chrysalis.js';
import {css,P} from './color.js';
import {glow} from './surface.js';
import {Trail} from './trail.js';

const globTrail=new Trail();

// The Unborn Chrysalis, drawn procedurally in world units (y up, canvas y = -y): the pupal cord, the ivory cocoon
// (two halves, three rim lips, the amber seam), gum strands and tripwires. The P3 creature is drawn by the caller
// (sprite 'old-glasswing' or the procedural moth body); this draws the cord stump and the two shell halves it claps.
const TAU=Math.PI*2,[AX,AY]=C.anchor;
const lerp=(a,b,t)=>a+(b-a)*t;

function cord(g,x0,y0,x1,y1,frame,frayed,width=.34,bend=null){
 const mx=bend?bend[0]:(x0+x1)/2+Math.sin(frame*.03)*.08,my=bend?bend[1]:(y0+y1)/2;
 g.lineCap='round';
 g.strokeStyle=css(P.furDeep,1);g.lineWidth=width;g.beginPath();g.moveTo(x0,-y0);g.quadraticCurveTo(mx,-my,x1,-y1);g.stroke();
 g.strokeStyle=css(P.boneDark,.8);g.lineWidth=width*.35;
 for(let i=-1;i<=1;i+=2){g.beginPath();g.moveTo(x0+i*width*.25,-y0);g.quadraticCurveTo(mx+i*width*.3,-my,x1+i*width*.2,-y1);g.stroke();}
 if(frayed){
  // A fray: loose fibres splay out a third of the way down.
  const fx=lerp(x0,x1,.35),fy=lerp(y0,y1,.35);g.strokeStyle=css(P.boneShade,.85);g.lineWidth=.04;
  for(let i=0;i<7;i++){const a=i/7*TAU+frame*.01;g.beginPath();g.moveTo(fx,-fy);g.lineTo(fx+Math.cos(a)*.5,-fy+Math.sin(a)*.35+.2);g.stroke();}
 }
}
// One cocoon half (side -1 or 1) in local units: the shell hangs down from the cord at (0,0) along +y (canvas).
function half(g,side,w,h,open,flash){
 const gr=g.createLinearGradient(-w/2,0,w/2,0);
 gr.addColorStop(0,side<0?P.boneRim:P.boneShade);gr.addColorStop(.5,P.bone);gr.addColorStop(1,side<0?P.boneShade:P.boneDark);
 g.fillStyle=flash?P.ivory:gr;g.strokeStyle=css(P.outline,1);g.lineWidth=.06;
 g.beginPath();g.moveTo(side*open,0);
 g.bezierCurveTo(side*(w*.62+open),h*.12,side*(w*.6+open),h*.82,side*(w*.12+open),h);
 g.lineTo(side*open,h*.97);g.closePath();g.fill();g.stroke();
 // Growth rings and cracks in the ivory.
 g.strokeStyle=css(P.boneDark,.45);g.lineWidth=.03;
 for(let i=1;i<5;i++){const y=h*i/5;g.beginPath();g.moveTo(side*(open+.05),y);g.quadraticCurveTo(side*(w*.5+open),y+.12,side*(w*.55+open),y-.05);g.stroke();}
}
function lip(g,x,y,r,a,cue,frame){
 g.save();g.translate(x,y);g.rotate(a);
 g.fillStyle=css(P.bone,1);g.strokeStyle=css(P.outline,1);g.lineWidth=.05;
 g.beginPath();g.ellipse(0,0,r,r*.42,0,0,Math.PI);g.fill();g.stroke();
 if(cue>0){
  // The parryable cue: an ivory flash ring on the lip a shove would push.
  g.globalCompositeOperation='lighter';
  g.strokeStyle=css(P.ivory,.5+.5*cue);g.lineWidth=.07;g.beginPath();g.ellipse(0,0,r*1.35,r*.7,0,0,TAU);g.stroke();
  const sp=glow('#fff6e4');if(sp){g.globalAlpha=.7*cue;g.drawImage(sp,-r*1.6,-r*1.6,r*3.2,r*3.2);g.globalAlpha=1;}
  if(Math.floor(frame/4)%2){g.strokeStyle=css(P.ivory,.9);g.lineWidth=.03;g.beginPath();g.ellipse(0,0,r*1.7,r*.9,0,0,TAU);g.stroke();}
  g.globalCompositeOperation='source-over';
 }
 g.restore();
}
function seam(g,h,k,t,side){
 // The memory of the unborn god: amber always faintly inside; a split at the apex (or a crack) is the weak point.
 g.globalCompositeOperation='lighter';
 const sp=glow(P.amber);if(sp){const r=.6+k*1.1+.05*Math.sin(t*.2);g.globalAlpha=.25+.65*k;g.drawImage(sp,side*.55-r,h*.5-r,r*2,r*2);g.globalAlpha=1;}
 g.strokeStyle=css(P.amberHot,.3+.65*k);g.lineWidth=.05+.07*k;g.beginPath();
 g.moveTo(side*.55,h*.18);g.lineTo(side*.62,h*.34);g.lineTo(side*.5,h*.5);g.lineTo(side*.66,h*.66);g.lineTo(side*.55,h*.84);g.stroke();
 g.globalCompositeOperation='source-over';
}
// Gum Spit: the seam puckers and cyan gum swells on it through the tell (the globs it spits never hurt; the strands
// they lay slow whoever walks through them).
function gumCue(g,e,h,frame,side){
 const a=e.act;if(!a||a.id!=='gum'||a.stage!=='tell')return;
 const k=1-a.t/Math.max(1,a.frames),x=side*.6;
 g.globalCompositeOperation='lighter';
 const sp=glow(P.cyan);if(sp){const r=.4+.7*k;g.globalAlpha=.15+.25*k;g.drawImage(sp,x-r,h*.5-r,r*2,r*2);g.globalAlpha=1;}
 g.globalCompositeOperation='source-over';
 // Cyan on ivory must stay cyan: the swelling beads are drawn over the shell, not added to it.
 g.fillStyle=css(P.cyan,.9);g.strokeStyle=css(P.cyanDeep,1);g.lineWidth=.035;
 for(let i=0;i<3;i++){g.beginPath();g.arc(x+.06*Math.sin(frame*.4+i*2),h*(.36+.14*i),.07+.13*k*(1+.15*Math.sin(frame*.6+i)),0,TAU);g.fill();g.stroke();}
}

// Wall Strike: the cartilage wall the over-pumped shell will slam glows cyan where its shock runs (the near
// C.moves.wall.shock tiles, every height), brighter as the apex nears, so the strike reads before the dust falls.
function wallCue(g,e,frame){
 let n=99,side=0;
 for(const f of e.falls)if(f.t-(C.moves.wall.warn-8)<n){n=f.t-(C.moves.wall.warn-8);side=f.x<AX?-1:1;}
 // A shove that damps the swing after the dust started calls the strike off: the wall stops glowing.
 if(!side||n<-4||n>60||n>0&&e.rung<C.wallRung)return;
 const k=n<0?1+n/4:1-n/60,wx=side<0?C.arenaLeft:C.right,d=C.moves.wall.shock,x0=side<0?wx:wx-d;
 const gr=g.createLinearGradient(wx,0,wx-side*d,0);gr.addColorStop(0,css(P.cyan,.32*k));gr.addColorStop(1,css(P.cyan,0));
 g.globalCompositeOperation='lighter';g.fillStyle=gr;g.fillRect(x0,-C.rows,d,C.rows-1);
 g.strokeStyle=css(P.cyan,.3+.65*k);g.lineWidth=.07;g.beginPath();
 for(let y=1;y<C.rows;y+=.5)g.lineTo(wx-side*(.08+.1*Math.abs(Math.sin(y*3.1+frame*.2))),-y);
 g.stroke();g.globalCompositeOperation='source-over';
}
// Wing Flail: its true reach (a C.moves.flail.radius disc around the unborn) closes in cyan through the tell and
// bursts while it is active; cyan is never parryable.
function flailCue(g,e,x,y,frame){
 const a=e.act;if(!a||a.id!=='flail')return;
 const r=C.moves.flail.radius,cy=-(y+e.h*.5);
 g.globalCompositeOperation='lighter';
 if(a.stage==='tell'){
  // Readable from its first frame (a deep-cyan underline keeps it cyan on the bright vault and over ivory).
  const k=1-a.t/Math.max(1,a.frames);
  g.globalCompositeOperation='source-over';
  g.strokeStyle=css(P.cyanDeep,.55+.3*k);g.lineWidth=.1+.05*k;g.setLineDash?.([.3,.2]);g.lineDashOffset=frame*.05;
  g.beginPath();g.arc(x,cy,r,0,TAU);g.stroke();
  g.globalCompositeOperation='lighter';
  g.strokeStyle=css(P.cyan,.45+.5*k);g.lineWidth=.05+.05*k;g.beginPath();g.arc(x,cy,r,0,TAU);g.stroke();g.setLineDash?.([]);
  g.strokeStyle=css(P.cyan,.2+.3*k);g.lineWidth=.04;g.beginPath();g.arc(x,cy,r*(1.6-.6*k),0,TAU);g.stroke();
 }else if(a.stage==='active'){
  // The burst is cyan through and through: a white rim would read as the ivory (parry) ring.
  g.globalCompositeOperation='source-over';
  g.fillStyle=css(P.cyan,.24);g.beginPath();g.arc(x,cy,r,0,TAU);g.fill();
  g.strokeStyle=css(P.cyanDeep,.95);g.lineWidth=.16;g.beginPath();g.arc(x,cy,r,0,TAU);g.stroke();
  g.strokeStyle=css(P.cyan,1);g.lineWidth=.08;g.beginPath();g.arc(x,cy,r,0,TAU);g.stroke();
 }
 g.globalCompositeOperation='source-over';
}

// Drawn tilt (millidegrees) and cord-top x. The shell swings with the simulation's angle, but every state switch
// (reel in or out, a crack opening) restarts an ease (smoothstep over TILT.ticks) from the angle last drawn, so the
// 5-tile shell never snaps. A shell lying on the floor (open after a reel) stands upright instead of keeping the stale
// apex angle. Values are kept per simulation tick (frozen through hit-stop) and blended with the interpolation alpha.
export const TILT={jump:3000,cord:.3,ticks:10,floor:1.3};
const tilts=new WeakMap(),fall=t=>t>=1?0:1-t*t*(3-2*t);
export function tilt(e,frame,frozen){
 // The sim swings in 'swing', in the P2 transition (a Drop-Reel's reel can outlive it) and at an apex seam; a
 // Drop-Reel crack opens on the floor, upright.
 const swing=e.ai==='swing'||e.ai==='open'&&e.openKind!=='crack'||e.ai==='transition'&&e.phase===2,target=(swing?e.ang:0)||0;
 const cordX=AX+(e.ai==='reel'?(e.x-AX)*.5:0);
 let s=tilts.get(e);
 if(!s){s={f:frame,k:TILT.ticks,t:target,ct:cordX,j:0,cj:0,a:target,pa:target,c:cordX,pc:cordX,swing};tilts.set(e,s);return s;}
 if(frame!==s.f&&!frozen){
  const n=Math.max(1,Math.min(10,frame-s.f));
  // A smooth swing passes straight through; a jump bigger than any swing step becomes an offset that eases out.
  if(Math.abs(target-s.t)>TILT.jump*n||Math.abs(cordX-s.ct)>TILT.cord){s.j=s.a-target;s.cj=s.c-cordX;s.k=0;}else s.k+=n;
  const k=fall(s.k/TILT.ticks);
  s.pa=s.a;s.pc=s.c;s.t=target;s.ct=cordX;s.a=target+s.j*k;s.c=cordX+s.cj*k;
 }
 s.f=frame;s.swing=swing;return s;
}

export function drawChrysalisWorld(g,state,e,frame,alpha){
 const x=e.px+(e.x-e.px)*alpha,y=e.py+(e.y-e.py)*alpha,top=AY+8;
 // Gum on the floor, tripwires, globs in flight, dust where cartilage will fall.
 for(const st of e.strands){const a=Math.min(1,st.t/30);g.fillStyle=css(P.cyanDeep,.55*a);g.fillRect(st.x0,-1.08,st.x1-st.x0,.1);g.fillStyle=css(P.cyan,.6*a);for(let i=0;i<4;i++){const sx=lerp(st.x0,st.x1,(i+.5)/4);g.fillRect(sx-.03,-1.35,.06,.3);}}
 for(const w of e.wires){
  const set=w.warn<=0;g.strokeStyle=css(P.cyan,set?.9:.25+.2*Math.sin(frame*.5));g.lineWidth=set?.07:.03;
  g.setLineDash?.(set?[]:[.2,.15]);g.beginPath();g.moveTo(w.x0,-w.y);g.lineTo(w.x1,-w.y);g.stroke();g.setLineDash?.([]);
  if(set){g.globalCompositeOperation='lighter';g.strokeStyle=css(P.cyanHot,.35);g.lineWidth=.18;g.beginPath();g.moveTo(w.x0,-w.y);g.lineTo(w.x1,-w.y);g.stroke();g.globalCompositeOperation='source-over';}
 }
 const frozen=state.hitStop>0||state.phase!=='playing';
 for(const b of e.globs){const [x,y]=globTrail.at(b,alpha,frame,frozen);g.fillStyle=css(P.cyan,.9);g.beginPath();g.arc(x,-y,.18,0,TAU);g.fill();}
 for(const f of e.falls)if(f.t<=C.moves.wall.warn){g.fillStyle=css(P.ash,.12+.25*(1-f.t/C.moves.wall.warn));g.fillRect(f.x-.08,-C.debris.y,.16,C.debris.y-1);}
 // The Drop-Reel shadow sways on the floor while the shell hangs out of view.
 const r=e.reel;
 if(e.ai==='reel'&&r&&(r.stage==='lift'||r.stage==='sway'||r.stage==='fall')){
  const k=r.stage==='fall'?1-r.t/r.frames:r.stage==='sway'?.4:.2;
  g.fillStyle=css(P.ink,.35+.4*k);g.beginPath();g.ellipse(x,-1.02,e.w*(.4+.35*k),.16,0,0,TAU);g.fill();
 }
 if(e.cut){
  flailCue(g,e,x,y,frame);
  // P3: the cord stump from the vault to the unborn's grip, and the two shell halves it claps.
  if(!(e.ai==='transition'&&r&&r.t<C.transition-40)&&e.ai!=='spent')cord(g,AX,top,x,y+e.h*.95,frame,true,.26);
  const close=e.lip?Math.max(0,1-Math.abs(e.bx-AX)/C.flash):0,gap=lerp(1.5,.55,close);
  for(const side of [-1,1]){g.save();g.translate(x+side*gap,-(y+e.h*.45));g.scale(.55,.55);half(g,side,C.shell.w,C.shell.h*.7,0,e.flash>0&&!e.lip);if(e.lip&&side===-e.lip)lip(g,side*C.shell.w*.25,C.shell.h*.7,.45,0,close,frame);g.restore();}
  return;
 }
 const t=tilt(e,frame,frozen),ang=lerp(t.pa,t.a,alpha)/1000*Math.PI/180,h=e.h,w=e.w>C.shell.w?C.shell.w:e.w;
 // The shell turns about its centre, the simulation's bob, so the drawing covers the body that strikes; the cord
 // runs from its top through the anchor (the old pivot at the top of the box drew it up to 3 tiles off the hitbox).
 // The drawn tilt eases every state switch (tilt above), so the 5-tile shell never snaps.
 const hx=x-h/2*Math.sin(ang),hy=y+h/2+h/2*Math.cos(ang);
 wallCue(g,e,frame);
 cord(g,lerp(t.pc,t.c,alpha),top,hx,hy,frame,e.frayed,.34,t.swing?[AX,AY]:null);
 g.save();g.translate(hx,-hy);g.rotate(-ang);
 if(e.spin){const sc=Math.cos(frame*.25);g.scale(.55+.45*Math.abs(sc),1);}
 if(e.ai==='reel'&&r?.stage==='creak'){g.rotate(Math.sin(frame*1.3)*.03);}
 const open=e.ai==='open'?Math.min(1,e.open/10):0,side=e.openSide||1,split=open*.18;
 // Gum hangs from the shell; then the two halves, the seam between and the three rim lips.
 g.strokeStyle=css(P.cyan,.35);g.lineWidth=.03;
 for(let i=0;i<4;i++){const gx=(i-1.5)*.6;g.beginPath();g.moveTo(gx,h*.9);g.quadraticCurveTo(gx+.1,h+.4+.1*Math.sin(frame*.05+i),gx-.05,h+.7+.15*i);g.stroke();}
 // A struck shell flashes ivory, except while the ivory lip cue shows (the cue must stay readable on it).
 const flash=e.flash>0&&!e.lip;
 half(g,-1,w,h,side<0?split:0,flash);half(g,1,w,h,side>0?split:0,flash);
 const seamSide=e.ai==='open'?side:Math.sign(Math.sin(frame*.01))||1;
 seam(g,h,open,frame,seamSide);gumCue(g,e,h,frame,seamSide);
 const cue=e.lip?Math.max(.25,1-Math.abs(e.bx-AX)/C.flash):0;
 lip(g,-w*.42,h*.86,.42,.5,e.lip===1?cue:0,frame);lip(g,w*.42,h*.86,.42,-.5,e.lip===-1?cue:0,frame);lip(g,0,h*.99,.36,0,0,frame);
 g.restore();
}
// Desperation: the Gullet dims while the unborn tries to unfold.
export function dimFor(state){
 for(const e of state.enemies||[])if(e.chrysalis&&!e.dead&&e.glass&&e.ai!=='spent')return .35+.1*Math.sin((state.frame||0)*.1);
 return 0;
}
