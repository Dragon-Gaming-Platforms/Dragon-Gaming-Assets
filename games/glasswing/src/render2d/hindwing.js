import {css,P} from './color.js';
import {TAU,clamp,lerp,ease,FUNGUS,glowAt,ivoryRing,cyanGather,cyanEdge,limb,blob,linear,radial,hash} from './monster-kit.js';
import {MONSTERS} from '../data/monsters.js';

// The Hindwing's sand-and-fungus family, drawn procedurally. Local units: feet at (0,0), +x forward, -y up.

// Sporeling: a puffball cap on moth-membrane wings, cyan gills underneath; it swells before it bursts.
export function drawSporeling(g,e,frame,k,fl){
 const a=e.ai,tellK=a==='telegraph'?k:0,t=frame+e.id*17;
 let s=1+.55*ease(tellK);if(a==='recover')s=.8;if(a==='attack')s=1.5-.6*k;
 if(e.dead){const d=clamp((frame-e.defeatedFrame)/24);glowAt(g,P.amber,0,-.25,.3+d*.6,1-d);blob(g,0,-.25,.12*(1-d),.12*(1-d),css(P.amberHot,1-d),null);return;}
 const cy=-.25+Math.sin(t*.12)*.04;
 // Wings: two translucent membranes beating.
 const fl2=Math.sin(t*.9)*.6;
 for(const side of [-1,1]){
  g.save();g.translate(-.02,cy-.05);g.rotate(side*(.9+fl2*.5)-Math.PI/2);
  g.fillStyle=css(fl?P.ivory:FUNGUS.cap,.35);g.strokeStyle=css(FUNGUS.capShade,.7);g.lineWidth=.015;
  g.beginPath();g.ellipse(0,-.2,.08,.2,0,0,TAU);g.fill();g.stroke();g.restore();
 }
 g.save();g.translate(0,cy);g.scale(s,s);
 // Gills: cyan, glowing harder as it swells.
 g.fillStyle=css(P.cyanDeep,.95);g.beginPath();g.ellipse(0,.04,.17,.07,0,0,Math.PI);g.fill();
 glowAt(g,P.cyan,0,.05,.18+.35*tellK,.45+.5*tellK);
 // Cap with pale spots.
 g.fillStyle=fl?P.ivory:radial(g,-.06,-.1,.28,[[0,'#fff6e4'],[.5,FUNGUS.cap],[1,FUNGUS.capShade]]);g.strokeStyle=P.outline;g.lineWidth=.03;
 g.beginPath();g.moveTo(-.2,.04);g.bezierCurveTo(-.22,-.2,.22,-.2,.2,.04);g.quadraticCurveTo(0,.09,-.2,.04);g.fill();g.stroke();
 if(!fl)for(let i=0;i<3;i++){const h=hash(e.id*5+i);blob(g,-.12+i*.11,-.09-h*.05,.025+h*.015,.02,css(FUNGUS.capShade,.8),null);}
 g.restore();
 if(a==='telegraph')cyanGather(g,0,cy,tellK,frame,.7);
 if(a==='attack'){
  // The puff: a short cyan cloud the size of its hitbox.
  const r=MONSTERS.sporeling.moves.puff.radius*(.88+.12*ease(k));
  glowAt(g,P.cyan,0,cy,r*1.3,.75*(1-k*.6));
  cyanEdge(g,0,cy,r,.8*(1-k*.6));
  for(let i=0;i<10;i++){const an=i/10*TAU+hash(e.id+i)*.6,rr=r*(.7+.3*ease(k))*(.6+hash(e.id*3+i)*.4);blob(g,Math.cos(an)*rr,cy+Math.sin(an)*rr,.09*(1-k*.5),.09*(1-k*.5),css(P.cyanHot,.55*(1-k)),null);}
 }
}

// Cordyceps Husk and the Husk Sovereign: a corpse under ivory chitin, cordyceps stalks out of its back (cyan tips),
// an amber core where the plates are gone. size scales the drawing to the body (the Sovereign adds antlers, a bloom).
export function drawHusk(g,e,frame,k,ph,fl,sov=false){
 const a=e.ai,act=e.act,tellK=a==='telegraph'?k:0,S=e.h/1.8,armour=!!e.armour,p2=sov&&e.phase===2;
 const C=fl?{chitin:P.ivory,chitinShade:P.ivory,chitinDark:P.ivory,flesh:P.ivory,fleshLight:P.ivory}:FUNGUS;
 let lean=.18,club=[.35,-.7],club2=[-.2,-.75],crouch=0,head=0;
 const slamT=a==='telegraph'&&(act==='slam'||act==='slam2'||act==='triple'),slamA=a==='attack'&&(act==='slam'||act==='slam2'||act==='triple');
 if(slamT){lean=-.2*ease(tellK);club=[lerp(.35,-.15,ease(tellK)),lerp(-.7,-2.05,ease(tellK))];crouch=.06*tellK;}
 if(slamA){lean=.5;club=[lerp(-.15,1.05,ease(clamp(k*2))),lerp(-2.05,-.1,ease(clamp(k*2)))];crouch=.12;}
 if(a==='telegraph'&&(act==='vent'||act==='bloom')){crouch=.12*tellK;lean=.05;head=-.2*tellK;}
 if(a==='telegraph'&&act==='charge'){lean=.55*ease(tellK);crouch=.15*tellK;head=.4*tellK;club=[.2,-.5];club2=[-.4,-.6];}
 if(a==='attack'&&act==='charge'){lean=.7;head=.45;crouch=.1;club=[.1,-.45];club2=[-.5,-.6];}
 if(e.clip==='stuck'){lean=.75;head=.5;}
 if(e.clip==='roar'){lean=-.35;head=-.6;club=[.6,-1.6];club2=[-.6,-1.6];}
 if(a==='telegraph'&&act==='brood'){lean=-.1;head=-.3;}
 if(e.clip==='hit'){lean=-.25;}
 if(e.dead){const t=clamp((frame-e.defeatedFrame)/40);g.scale(1,1-t*.6);lean=.9*t;}
 g.save();g.scale(S,S);
 const hip=-.85+crouch,sh=[Math.sin(lean)*.72,hip-Math.cos(lean)*.72];
 // Legs, heavy, stepping by distance.
 const st=Math.sin(ph)*.14,lift=Math.max(0,Math.cos(ph))*.07;
 limb(g,-.12,hip,-.2-st,0,.45,.45,-1,.16,C.fleshLight);
 limb(g,.12,hip,.2+st,-lift,.45,.45,-1,.17,C.flesh);
 g.fillStyle=C.chitinShade;g.strokeStyle=P.outline;g.lineWidth=.03;
 for(const x of [-.2-st,.2+st]){g.beginPath();g.ellipse(x*.5,hip+.35,.12,.08,0,0,TAU);g.fill();g.stroke();}
 // Back arm.
 limb(g,sh[0]-.15,sh[1]+.1,club2[0],club2[1],.45,.45,1,.13,C.fleshLight);
 // Cordyceps stalks from the back, cyan tips that swell before a vent.
 const vent=a==='telegraph'&&(act==='vent'||act==='bloom')?tellK:a==='attack'&&(act==='vent'||act==='bloom')?1:0;
 const stalks=sov?7:4;
 for(let i=0;i<stalks;i++){
  const h=hash(e.id*11+i),bx=lerp(sh[0]-.3,lerp(0,sh[0],.4)-.3,h),by=lerp(sh[1]+.05,hip-.1,h*.8),len=(.5+h*.5)*(sov?1.3:1)*(1+.2*vent),an=-2.2-h*.9+Math.sin(frame*.03+i)*.06;
  const tx=bx+Math.cos(an)*len,ty=by+Math.sin(an)*len;
  g.strokeStyle=fl?P.ivory:FUNGUS.stalk;g.lineWidth=.05;g.lineCap='round';g.beginPath();g.moveTo(bx,by);g.quadraticCurveTo(bx+Math.cos(an+.4)*len*.5,by+Math.sin(an+.4)*len*.5,tx,ty);g.stroke();
  blob(g,tx,ty,.06+.04*vent,.05+.04*vent,fl?P.ivory:css(P.cyan,.9),P.outline,.015);glowAt(g,P.cyan,tx,ty,.15+.35*vent,.5+.5*vent);
 }
 // Torso: dead aubergine flesh; ivory plates over it while armoured; the amber core when they are gone.
 g.fillStyle=fl?P.ivory:radial(g,sh[0]*.5,(hip+sh[1])/2,.7,[[0,FUNGUS.fleshLight],[1,FUNGUS.flesh]]);g.strokeStyle=P.outline;g.lineWidth=.045;
 g.beginPath();g.moveTo(-.28,hip+.05);g.bezierCurveTo(-.4,hip-.4,sh[0]-.42,sh[1]+.1,sh[0]-.15,sh[1]-.05);g.quadraticCurveTo(sh[0]+.15,sh[1]-.1,sh[0]+.3,sh[1]+.1);g.bezierCurveTo(sh[0]+.35,sh[1]+.4,.32,hip-.2,.26,hip+.05);g.closePath();g.fill();g.stroke();
 const mid=[lerp(0,sh[0],.5),lerp(hip,sh[1],.5)];
 if(armour){
  for(let i=0;i<3;i++){
   const t=(i+.5)/3,px=lerp(0,sh[0],t),py=lerp(hip,sh[1],t);
   g.fillStyle=fl?P.ivory:linear(g,px-.3,py,px+.3,py,[[0,C.chitinShade],[.4,C.chitin],[1,C.chitinDark]]);g.strokeStyle=P.outline;g.lineWidth=.035;
   g.beginPath();g.moveTo(px-.33,py+.1);g.quadraticCurveTo(px,py-.2,px+.33,py+.08);g.quadraticCurveTo(px,py+.02,px-.33,py+.1);g.fill();g.stroke();
  }
  // Sovereign's P1 plates crack as heavy hits land.
  if(sov&&e.heavyHits>0){g.strokeStyle=css(P.amberHot,.8);g.lineWidth=.02;g.beginPath();g.moveTo(mid[0]-.1,mid[1]-.2);g.lineTo(mid[0]+.05,mid[1]);g.lineTo(mid[0]-.05,mid[1]+.15);g.stroke();}
 }else{
  // The open core: amber light in a torn rib cage.
  const pulse=.85+.15*Math.sin(frame*.25);
  glowAt(g,P.amber,mid[0],mid[1],(sov?.55:.42)*pulse,1);glowAt(g,P.amberHot,mid[0],mid[1],.16,1);
  g.strokeStyle=fl?P.ivory:C.chitinDark;g.lineWidth=.035;
  for(let i=-1;i<=1;i++){g.beginPath();g.moveTo(mid[0]-.25,mid[1]+i*.13);g.quadraticCurveTo(mid[0],mid[1]+i*.13-.08,mid[0]+.25,mid[1]+i*.13);g.stroke();}
 }
 if(p2&&!fl)for(let i=0;i<5;i++){const h=hash(e.id*3+i),cx=lerp(-.3,sh[0]+.2,h),cy=lerp(hip,sh[1],hash(i*9+e.id));blob(g,cx,cy,.07,.045,css(P.cyan,.85),P.outline,.012);glowAt(g,P.cyan,cx,cy,.14,.5);}
 // Head: a skull mostly swallowed by fungus; the Sovereign wears a crown of pale antler-stalks.
 g.save();g.translate(sh[0]+.08,sh[1]-.12);g.rotate(head);
 blob(g,0,0,.2,.18,fl?P.ivory:C.chitin,P.outline,.035);
 g.fillStyle=P.ink;g.beginPath();g.ellipse(.09,.02,.05,.04,0,0,TAU);g.fill();
 glowAt(g,P.cyan,.1,.01,.08,1);
 if(sov){
  const horn=a==='telegraph'&&act==='charge'?tellK:a==='attack'&&act==='charge'?1:0;
  g.strokeStyle=fl?P.ivory:FUNGUS.stalk;g.lineWidth=.06;g.lineCap='round';
  for(const [ox,an,len] of [[.05,-1.2,.55],[-.08,-1.7,.6],[.12,-.6,.45]]){
   const x1=ox+Math.cos(an)*len,y1=Math.sin(an)*len;g.beginPath();g.moveTo(ox,-.1);g.quadraticCurveTo(ox+Math.cos(an+.5)*len*.5,Math.sin(an+.5)*len*.5-.1,x1,y1-.1);g.stroke();
   g.lineWidth=.035;g.beginPath();g.moveTo(lerp(ox,x1,.6),lerp(-.1,y1-.1,.6));g.lineTo(lerp(ox,x1,.6)+.15,lerp(-.1,y1-.1,.6)-.12);g.stroke();g.lineWidth=.06;
   glowAt(g,P.cyan,x1,y1-.1,.12+.3*horn,.4+.6*horn);
  }
 }else{g.strokeStyle=fl?P.ivory:FUNGUS.stalk;g.lineWidth=.04;g.beginPath();g.moveTo(0,-.15);g.quadraticCurveTo(-.05,-.4,.08,-.55);g.stroke();blob(g,.08,-.56,.05,.04,css(P.cyan,.9),null);}
 g.restore();
 // Front arm: a fungal club (ivory chitin over it while armoured).
 const el=limb(g,sh[0]+.1,sh[1]+.12,club[0],club[1],.48,.46,1,.15,C.flesh);
 blob(g,club[0],club[1],.2,.17,fl?P.ivory:armour?C.chitin:FUNGUS.cap,P.outline,.035);
 if(!armour&&!fl)glowAt(g,P.cyan,club[0],club[1],.18,.45);
 if(slamT)ivoryRing(g,club[0],club[1],tellK,frame,1);
 if(slamA&&k<.5){g.globalCompositeOperation='lighter';g.strokeStyle=css(P.ivory,.6);g.lineWidth=.12;g.beginPath();g.arc(sh[0],sh[1],.95,-1.9,-1.9+ease(k*2)*2.2);g.stroke();g.globalCompositeOperation='source-over';}
 g.restore();
 if(slamA&&k>.35&&k<.9){const r=(sov?1.6:1)*(k-.35)*3;g.strokeStyle=css(P.bone,.6*(1-k));g.lineWidth=.06;g.beginPath();g.ellipse(e.facing?(sov?1.2:.7):0,0,r,r*.15,0,0,TAU);g.stroke();}
 // The vent's centre: mid-body, or above the crown when it vents up at a hunter on a ledge (the sim's e.up).
 const vy=e.up?-(e.h+(MONSTERS[e.kind].moves.vent.up||0)):-e.h*.5;
 if(a==='telegraph'&&(act==='vent'||act==='bloom')){
  cyanGather(g,0,vy,tellK,frame,sov?1.6:1.1);
  // Rising spore threads from the crown show where an upward vent will burst.
  if(e.up)for(let i=0;i<5;i++){const t=(frame*.04+i/5)%1;blob(g,(hash(e.id+i)-.5)*.8,lerp(-e.h*.8,vy,t),.05,.05,css(P.cyanHot,.7*tellK*(1-t)),null);}
 }
 if(a==='attack'&&(act==='vent'||act==='bloom')){
  // Full size from the first active frame, as the sim's burst is; the ring marks its edge.
  const m=MONSTERS[e.kind].moves[act],r=m.radius*(.88+.12*ease(k)),cy=act==='vent'&&e.up?vy:-e.h*.45;
  glowAt(g,P.cyan,0,cy,r*1.35,.8*(1-k*.5));
  cyanEdge(g,0,cy,r,.85*(1-k*.6));
  for(let i=0;i<14;i++){const an=i/14*TAU+hash(e.id+i)*.4,rr=r*(.5+.5*hash(e.id*7+i));blob(g,Math.cos(an)*rr,cy+Math.sin(an)*rr,.12*(1-k*.6),.1*(1-k*.6),css(P.cyanHot,.5*(1-k)),null);}
 }
 if(a==='telegraph'&&act==='charge')cyanGather(g,.5*S,-e.h*.85,tellK,frame,1);
 if(a==='attack'&&act==='charge'){
  // Speed streaks: tapered wedges trailing the body, fading to nothing, each flickering on its own phase.
  g.globalCompositeOperation='lighter';
  for(let i=0;i<4;i++){
   const yy=-e.h*(.25+i*.17),len=1.4+.9*hash(i*7+(frame>>2)),w=.07+.03*(i&1),x0=-.3;
   g.fillStyle=linear(g,x0,0,x0-len,0,[[0,css(P.cyan,.45)],[1,css(P.cyan,0)]]);
   g.beginPath();g.moveTo(x0,yy-w);g.lineTo(x0-len,yy);g.lineTo(x0,yy+w);g.closePath();g.fill();
  }
  g.globalCompositeOperation='source-over';
 }
 // The brood is no strike, so it never shows the parry ring: three cyan buds swell on its back.
 if(a==='telegraph'&&act==='brood')for(let i=0;i<3;i++)cyanGather(g,-.3*S+(i-1)*.35*S,-e.h*(.72+.08*(i%2)),tellK,frame,.45);
 if(e.clip==='roar'){const r=1+((frame*.08)%1)*2.5;g.strokeStyle=css(P.cyan,.5*(1-((frame*.08)%1)));g.lineWidth=.08;g.beginPath();g.arc(0,-e.h*.6,r,0,TAU);g.stroke();}
}

// The Sovereign's bar (render only): ivory while plated, amber once bloomed.
export function drawBar(g,e,x,y){
 const w=1.8,h=.09,f=clamp(e.hp/e.maxHp),bx=x-w/2,by=-(y+e.h+.55);
 g.fillStyle=css(P.ink,.75);g.fillRect(bx-.04,by-.04,w+.08,h+.08);
 g.fillStyle=e.phase===2?P.amber:P.bone;g.fillRect(bx,by,w*f,h);
 g.strokeStyle=css(P.ash,.6);g.lineWidth=.02;g.strokeRect(bx-.04,by-.04,w+.08,h+.08);
 if(e.phase===1){const m=MONSTERS['husk-sovereign'].bloomAt;g.fillStyle=css(P.amber,.9);g.fillRect(bx+w*m-.01,by-.06,.02,h+.12);}
}

// The bloom's floor shock: a running cyan crack (jump it).
export function drawShocks(g,mon,frame,alpha){
 for(const k of mon.shocks){
  const x=k.px+(k.x-k.px)*alpha,y=-k.y,S=MONSTERS[k.kind].shock;
  glowAt(g,P.cyan,x,y-.2,.7,.8);
  g.fillStyle=css(P.cyanHot,.9);g.beginPath();g.moveTo(x-.3,y);g.lineTo(x+k.dir*.15,y-S.height);g.lineTo(x+k.dir*.35,y);g.closePath();g.fill();
  g.strokeStyle=css(P.cyan,.6);g.lineWidth=.04;g.beginPath();g.moveTo(x-k.dir*1.2,y-.02);for(let i=0;i<5;i++)g.lineTo(x-k.dir*(1.2-i*.25),y-.02-((i%2)?.06:0));g.stroke();
 }
}
