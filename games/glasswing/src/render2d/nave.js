import {css,P} from './color.js';
import {TAU,clamp,lerp,ease,WAX,glowAt,ivoryRing,cyanGather,cyanEdge,flame,limb,blob,linear,radial,hash} from './monster-kit.js';
import {MONSTERS} from '../data/monsters.js';

// The Rendering Nave's wax family, drawn procedurally. Local units: feet at (0,0), +x forward, -y up.

function drips(g,e,x0,x1,y,len,frame,col){
 for(let i=0;i<5;i++){
  const h=hash(e.id*31+i),dx=lerp(x0,x1,(i+.5)/5)+(h-.5)*.05,l=len*(.4+h*.8)+Math.sin(frame*.02+i)*.02;
  g.fillStyle=col;g.beginPath();g.moveTo(dx-.035,y);g.quadraticCurveTo(dx-.04,y+l*.7,dx,y+l);g.quadraticCurveTo(dx+.04,y+l*.7,dx+.035,y);g.fill();
 }
}

export function drawWickBearer(g,e,frame,k,ph,fl){
 const C=fl?{wax:P.ivory,waxShade:P.ivory,waxDark:P.ivory,soot:P.ivory}:WAX,a=e.ai,act=e.act;
 const tellK=a==='telegraph'?k:0,atk=a==='attack'?k:0,dead=e.dead;
 // Pose: lean, crouch, arm targets.
 let lean=.12,crouch=0,hand=[.32,-.62],hand2=[-.18,-.66],flameS=e.lit?1:0;
 if(a==='ignite')flameS=ease(k);
 if(a==='telegraph'&&(act==='swipe'||act==='swipe2')){lean=-.1*tellK;hand=[lerp(.32,-.35,ease(tellK)),lerp(-.62,-1.75,ease(tellK))];crouch=.08*tellK;}
 if(a==='attack'&&(act==='swipe'||act==='swipe2')){const t=ease(atk);lean=.35;hand=[lerp(-.35,1.05,t),lerp(-1.75,-.45,t)];hand2=[.1,-.9];}
 if(a==='telegraph'&&act==='lunge'){lean=-.25*tellK;crouch=.22*tellK;flameS=1+1.2*tellK;hand=[-.2,-.5];hand2=[-.35,-.55];}
 if(a==='attack'&&act==='lunge'){lean=.75;crouch=.12;hand=[.75,-.95];hand2=[.6,-.8];flameS=1.6;}
 if(a==='telegraph'&&act==='flare'){crouch=.1*tellK;flameS=1+1.5*tellK;hand=[.25,-1.2];hand2=[-.25,-1.2];}
 if(a==='attack'&&act==='flare'){flameS=2.4;hand=[.6,-1.4];hand2=[-.5,-1.4];lean=-.15;}
 if(a==='recover'&&act==='lunge')flameS=0;
 if(e.clip==='hit'){lean=-.3;hand=[-.1,-.8];}
 if(dead){const t=clamp((frame-e.defeatedFrame)/40);g.translate(0,0);g.scale(1+t*.6,1-t*.85);flameS=0;}
 const hip=-.55+crouch,sh=[Math.sin(lean)*.7,hip-Math.cos(lean)*.7];
 // Legs (distance-driven gait).
 const st=Math.sin(ph),lift=Math.max(0,Math.cos(ph))*.09;
 limb(g,-.06,hip,-.14-st*.16,-Math.max(0,-Math.cos(ph))*.09*0,.3,.3,-1,.09,C.waxDark);
 limb(g,.06,hip,.14+st*.16,-lift,.3,.3,-1,.1,C.waxShade);
 // Back arm.
 limb(g,sh[0]-.06,sh[1]+.08,hand2[0],hand2[1],.42,.4,1,.07,C.waxDark);
 // Torso: a melted candle column with drips.
 const gr=fl?P.ivory:linear(g,-.25,0,.25,0,[[0,C.waxRim||C.wax],[.45,C.wax],[1,C.waxShade]]);
 g.fillStyle=gr;g.strokeStyle=P.outline;g.lineWidth=.045;
 g.beginPath();g.moveTo(-.2,hip+.05);
 g.bezierCurveTo(-.26,hip-.25,sh[0]-.3,sh[1]+.2,sh[0]-.2,sh[1]);
 g.quadraticCurveTo(sh[0],sh[1]-.12,sh[0]+.2,sh[1]+.02);
 g.bezierCurveTo(sh[0]+.26,sh[1]+.25,.24,hip-.2,.19,hip+.05);g.closePath();g.fill();g.stroke();
 if(!fl)drips(g,e,sh[0]-.2,sh[0]+.2,sh[1]+.05,.32,frame,css(WAX.waxShade,.95));
 // Rib-like rings of older wax.
 g.strokeStyle=css(C.waxDark,.5);g.lineWidth=.025;
 for(let i=1;i<4;i++){const t=i/4,yy=lerp(hip,sh[1],t),xx=lerp(0,sh[0],t);g.beginPath();g.moveTo(xx-.2,yy);g.quadraticCurveTo(xx,yy+.05,xx+.2,yy-.01);g.stroke();}
 // Head: a sagging wax knob with sockets; the wick on top.
 const hx=sh[0]+.1,hy=sh[1]-.16;
 blob(g,hx,hy,.19,.17,fl?P.ivory:radial(g,hx-.05,hy-.05,.25,[[0,WAX.waxRim],[1,WAX.waxShade]]));
 g.fillStyle=css(WAX.soot,.95);g.beginPath();g.ellipse(hx+.08,hy+.01,.045,.03,0,0,TAU);g.fill();g.beginPath();g.ellipse(hx-.02,hy+.02,.04,.028,0,0,TAU);g.fill();
 const wx=hx+.02,wy=hy-.16;
 g.strokeStyle=WAX.soot;g.lineWidth=.035;g.beginPath();g.moveTo(hx,hy-.13);g.quadraticCurveTo(hx+.05,wy+.02,wx,wy);g.stroke();
 // Front arm with wax claws.
 const el=limb(g,sh[0]+.08,sh[1]+.1,hand[0],hand[1],.45,.42,1,.08,C.wax);
 g.strokeStyle=P.outline;g.lineWidth=.03;
 for(let i=-1;i<=1;i++){const an=Math.atan2(hand[1]-el[1],hand[0]-el[0])+i*.35;g.beginPath();g.moveTo(hand[0],hand[1]);g.lineTo(hand[0]+Math.cos(an)*.2,hand[1]+Math.sin(an)*.2);g.stroke();}
 // Light: the wick's cyan flame, an amber ember while guttered (the weak point), eyes.
 if(flameS>0){
  if(a==='attack'&&act==='lunge'){g.save();g.translate(wx,wy);g.rotate(-1.2);flame(g,0,0,.42*flameS,.1*flameS,frame,P.cyan,P.cyanHot,e.id);g.restore();}
  else flame(g,wx,wy,.32*flameS,.08*Math.min(1.6,flameS),frame,P.cyan,P.cyanHot,e.id);
  glowAt(g,P.cyan,hx+.06,hy+.01,.12,.9);
 }
 if(e.exposed>0||a==='recover'&&act==='lunge'){glowAt(g,P.amber,wx,wy,.35+.05*Math.sin(frame*.4),.95);glowAt(g,P.amberHot,wx,wy,.12,1);
  g.strokeStyle=css(P.ash,.35);g.lineWidth=.02;for(let i=0;i<3;i++){const t=(frame*.02+i/3)%1;g.beginPath();g.moveTo(wx,wy-t*.6);g.quadraticCurveTo(wx+Math.sin(t*6+i)*.1,wy-t*.6-.1,wx,wy-t*.6-.18);g.stroke();}}
 // Cues: an ivory ring on the swiping claw, cyan gathering for the lunge and the flare.
 if(a==='telegraph'&&(act==='swipe'||act==='swipe2'))ivoryRing(g,hand[0],hand[1],tellK,frame,.8);
 if(a==='telegraph'&&(act==='lunge'||act==='flare'))cyanGather(g,wx,wy-.1,tellK,frame,1);
 if(a==='attack'&&(act==='swipe'||act==='swipe2')){
  const t=ease(atk),o=g.globalCompositeOperation;g.globalCompositeOperation='lighter';
  for(const [w,c,al] of [[.2,P.bone,.25],[.08,P.ivory,.6]]){g.strokeStyle=css(c,al);g.lineWidth=w;g.beginPath();g.arc(sh[0],sh[1]+.1,.85,-2.2,-2.2+t*2.6);g.stroke();}
  g.globalCompositeOperation=o;
 }
 if(a==='attack'&&act==='flare'){
  // Full size from the first active frame (the sim's burst is): the ring is the hitbox edge.
  const m=MONSTERS['wick-bearer'].moves.flare,r=m.radius*(.88+.12*ease(atk));
  glowAt(g,P.cyan,0,-m.height,r*1.5,.9*(1-atk*.5));
  cyanEdge(g,0,-m.height,r,.9*(1-atk*.6));
 }
 if(a==='attack'&&act==='lunge'){g.globalCompositeOperation='lighter';g.strokeStyle=css(P.cyan,.35);g.lineWidth=.5;g.beginPath();g.moveTo(-.2,-.8);g.lineTo(-1.6,-.85);g.stroke();g.globalCompositeOperation='source-over';}
}

export function drawDripCenser(g,e,frame,k,ph,fl){
 const a=e.ai,act=e.act,tellK=a==='telegraph'?k:0,dead=e.dead;
 let tilt=Math.sin(frame*.05+e.id)*.03,bob=0;
 if(a==='telegraph'&&(act==='lob'||act==='volley'))tilt=-.42*ease(tellK);
 if(a==='attack'&&e.clip==='throw')tilt=lerp(-.42,.5,ease(k));
 if(a==='telegraph'&&act==='spill')tilt=.55*ease(tellK);
 if(a==='attack'&&act==='spill')tilt=.75;
 if(e.clip==='hit')tilt=-.25;
 if(dead){const t=clamp((frame-e.defeatedFrame)/40);g.scale(1+t*.3,1-t*.7);}
 const by=-.95+Math.abs(Math.sin(ph))*-.04+bob;
 // Four stilt legs (front pair bright, back pair dark), stepping by distance.
 for(const [ox,off,col] of [[-.18,Math.PI,WAX.sootLight],[.18,0,WAX.sootLight],[-.3,Math.PI*.5,WAX.bronzeLight],[.3,Math.PI*1.5,WAX.bronzeLight]]){
  const st=Math.sin(ph+off),lift=Math.max(0,Math.cos(ph+off))*.08;
  limb(g,ox*.6,by+.25,ox*1.6+st*.14,-lift,.42,.42,ox<0?1:-1,.055,fl?P.ivory:col);
 }
 g.save();g.translate(0,by);g.rotate(tilt);
 // The pot: soot-dark bronze, a crust of ivory wax spilling over its lip, molten cyan inside.
 blob(g,0,0,.46,.4,fl?P.ivory:radial(g,-.15,-.15,.6,[[0,WAX.bronzeLight],[.6,WAX.bronze],[1,WAX.soot]]),P.outline,.05);
 g.strokeStyle=css(WAX.bronzeLight,.6);g.lineWidth=.03;g.beginPath();g.ellipse(0,.02,.4,.12,0,0,Math.PI);g.stroke();
 const rim=-.34;
 blob(g,0,rim,.3,.09,fl?P.ivory:WAX.wax,P.outline,.04);
 if(!fl)drips(g,e,-.26,.26,rim+.05,.22,frame,css(WAX.wax,.95));
 const heat=a==='telegraph'&&act!=='spill'?tellK:a==='attack'&&e.clip==='throw'?1-k:0;
 blob(g,0,rim-.01,.24,.06,css(P.cyanDeep,.95),null);
 glowAt(g,P.cyan,0,rim-.04,.3+.5*heat,.55+.45*heat);
 // Bubbles rising off the molten wax while it heats.
 if(heat>0)for(let i=0;i<4;i++){const t=(frame*.04+i*.25)%1,bx=(hash(e.id+i)-.5)*.3;blob(g,bx,rim-.05-t*.35*heat,.03+.02*(1-t),.03+.02*(1-t),css(P.cyanHot,.8*(1-t)),null);}
 // A small hooded face in the pot's side, its eye cyan.
 blob(g,.3,-.08,.12,.14,fl?P.ivory:WAX.waxShade,P.outline,.03);
 glowAt(g,P.cyan,.33,-.1,.08,.95);
 if(a==='telegraph'&&act==='spill')ivoryRing(g,.32,rim,tellK,frame,.9);
 if(a==='telegraph'&&act!=='spill')cyanGather(g,0,rim-.1,tellK,frame,.8);
 g.restore();
 if(a==='attack'&&act==='spill'){
  // The spill: a sheet of hot ivory wax tipping out in front.
  const t=ease(k),o=g.globalCompositeOperation;g.globalCompositeOperation='lighter';
  g.fillStyle=css(P.ivory,.55*(1-t*.4));g.beginPath();g.moveTo(.3,-1.2);g.quadraticCurveTo(1.1,-1.1,1.4,-.05);g.lineTo(.7,-.05);g.quadraticCurveTo(.6,-.7,.25,-1);g.closePath();g.fill();
  g.globalCompositeOperation=o;
 }
}

// Hazards: wax blobs in flight (with their shadow on the landing spot) and the crust they harden into.
export function drawWax(g,mon,frame,alpha,layer){
 if(layer==='back'){
  for(const u of mon.puddles){
   const B=MONSTERS[u.kind].blob,set=u.age<=B.set,hard=!set&&u.age<=B.set+B.hard,t=set?u.age/B.set:hard?(u.age-B.set)/B.hard:(u.age-B.set-B.hard)/B.crumble;
   const x=u.x,y=-u.y,w=B.half;
   if(set){
    // Soft wax spreading (harmless): warm ivory, flattening out.
    blob(g,x,y-.03,w*lerp(.4,1,ease(t)),.08,css(WAX.waxRim,.9),P.outline,.025);
    glowAt(g,'#fff6e4',x,y-.05,w*.9,.35);
   }else if(hard){
    // The crust: crystalline cyan-white spikes (harmful), glinting.
    blob(g,x,y-.03,w,.07,css(WAX.waxShade,1),P.outline,.025);
    for(let i=0;i<6;i++){
     const h=hash(u.x*97+i|0),sx=x-w+.12+(w*2-.24)*(i+.5)/6,sh=.18+h*.2;
     g.fillStyle=css(i%2?P.cyanHot:WAX.waxRim,1);g.strokeStyle=P.outline;g.lineWidth=.02;
     g.beginPath();g.moveTo(sx-.07,y-.04);g.lineTo(sx+(h-.5)*.06,y-.04-sh);g.lineTo(sx+.07,y-.04);g.closePath();g.fill();g.stroke();
    }
    glowAt(g,P.cyan,x,y-.15,w*1.1,.35+.15*Math.sin(frame*.3+u.x));
    if(t>.85&&Math.floor(frame/4)%2)glowAt(g,P.cyanHot,x,y-.15,w*.6,.4);
   }else{
    g.globalAlpha=1-t;blob(g,x,y-.02,w*(1-t*.3),.05,css(P.ash,.8),null);g.globalAlpha=1;
   }
  }
  return;
 }
 for(const b of mon.blobs){
  const B=MONSTERS[b.kind].blob,x=b.px+(b.x-b.px)*alpha,y=b.py+(b.y-b.py)*alpha,k=b.age/B.flight;
  // The shadow on the landing spot grows and darkens as the blob comes down.
  g.fillStyle=css('#05030a',.25+.45*k);g.beginPath();g.ellipse(b.tx,-b.ty+.02,B.half*(.5+.5*k),.07,0,0,TAU);g.fill();
  glowAt(g,P.cyan,b.tx,-b.ty,B.half*(.6+.5*k),.12+.25*k);
  g.strokeStyle=css(P.cyan,.35);g.lineWidth=.06;g.beginPath();g.moveTo(x-b.vx*3,-(y-b.vy*3+.05));g.lineTo(x,-y);g.stroke();
  blob(g,x,-y,B.radius,B.radius*.9,radial(g,x-.08,-y-.08,B.radius*1.2,[[0,P.cyanHot],[.5,WAX.waxRim],[1,WAX.waxShade]]),P.outline,.03);
  glowAt(g,P.cyan,x,-y,B.radius*2.6,.6);
 }
}
