import {css,P} from './color.js';
import {TAU,clamp,lerp,ease,SCALE,glowAt,ivoryRing,cyanGather,limb,blob,linear,radial,hash} from './monster-kit.js';
import {MONSTERS} from '../data/monsters.js';

// The Scale Mere's mirror family, drawn procedurally. Local units: feet at (0,0), +x forward, -y up.

// Mirror Skater: a silver strider on six hair-thin legs, each foot dimpling the scale-ice.
export function drawMirrorSkater(g,e,frame,k,ph,fl){
 const a=e.ai,act=e.act,tellK=a==='telegraph'?k:0,dash=a==='attack'&&act==='skate',skid=a==='recover'&&act==='skate';
 let crouch=0,lean=0,rise=0,blade=-.15;
 if(a==='telegraph'&&act==='skate'){crouch=.25*ease(tellK);lean=-.12*tellK;blade=-.15-1.1*ease(tellK);}
 if(dash){crouch=.3;lean=.15;blade=.25;}
 if(a==='telegraph'&&act==='cut'){crouch=.18*tellK;blade=.9*ease(tellK);}
 if(a==='attack'&&act==='cut'){rise=.25*Math.sin(k*Math.PI);blade=lerp(.9,-2.2,ease(k));}
 if(skid){crouch=.15;lean=-.25;}
 if(e.dead){const t=clamp((frame-e.defeatedFrame)/40);g.globalAlpha*=1-t*.5;crouch=.4*t;}
 const by=-.55+crouch-rise,bx=0;
 // Afterimages while dashing: the mirror body copied behind it.
 if(dash&&!fl)for(let i=3;i>=1;i--){g.globalAlpha*=.6;body(g,e,bx-i*.45,by,lean,frame,true,blade);g.globalAlpha/=.6;}
 // Legs: three pairs splayed wide; feet keep their spot (distance-driven) except in a dash or skid, where they glide.
 const glide=dash||skid;
 for(let i=0;i<3;i++){
  const off=i*2.1,st=glide?0:Math.sin(ph+off)*.12,lift=glide?0:Math.max(0,Math.cos(ph+off))*.07;
  const fx=[-1.05,-.15,.75][i]+st,col=fl?P.ivory:i===1?SCALE.silverShade:SCALE.silver;
  limb(g,bx+[-.2,0,.2][i],by+.05,fx,-lift,.55,.55,-1,.035,col);
  limb(g,bx+[-.25,-.05,.15][i],by+.08,fx-.3,-lift,.5,.5,-1,.03,fl?P.ivory:SCALE.silverDark);
  if(!glide){g.strokeStyle=css(P.cyan,.25);g.lineWidth=.015;g.beginPath();g.ellipse(fx,.01,.12,.03,0,0,TAU);g.stroke();}
 }
 body(g,e,bx,by,lean,frame,fl,blade);
 if(a==='telegraph')ivoryRing(g,bx+.55,by-.05,tellK,frame,.85);
 if(dash){
  g.globalCompositeOperation='lighter';g.strokeStyle=css(SCALE.gleam,.5);g.lineWidth=.05;
  g.beginPath();g.moveTo(bx-1.8,-.04);g.lineTo(bx+.5,-.04);g.stroke();g.globalCompositeOperation='source-over';
 }
 if(skid)for(let i=0;i<5;i++){const t=(frame*.07+i/5)%1;blob(g,.4+t*.5,-.05-t*.25+t*t*.3,.03,.03,css(P.cyanHot,.6*(1-t)),null);}
 if(a==='attack'&&act==='cut'){
  g.globalCompositeOperation='lighter';
  for(const [w,c,al] of [[.18,SCALE.silver,.3],[.06,P.ivory,.75]]){g.strokeStyle=css(c,al);g.lineWidth=w;g.beginPath();g.arc(bx+.3,by,.9,-.3,-.3-ease(k)*2.2,true);g.stroke();}
  g.globalCompositeOperation='source-over';
 }
}
function body(g,e,x,y,lean,frame,fl,blade){
 g.save();g.translate(x,y);g.rotate(lean);
 // Mirror carapace: a long silver drop with a bright specular streak and a dark reflected horizon.
 const gr=fl?P.ivory:linear(g,0,-.22,0,.18,[[0,SCALE.gleam],[.25,SCALE.silver],[.55,SCALE.silverDark],[.7,SCALE.silverShade],[1,SCALE.deep]]);
 g.fillStyle=gr;g.strokeStyle=P.outline;g.lineWidth=.04;
 g.beginPath();g.moveTo(-.6,0);g.bezierCurveTo(-.45,-.25,.35,-.26,.62,-.04);g.bezierCurveTo(.4,.16,-.4,.15,-.6,0);g.closePath();g.fill();g.stroke();
 if(!fl){g.strokeStyle=css(SCALE.gleam,.85);g.lineWidth=.025;g.beginPath();g.moveTo(-.35,-.14);g.quadraticCurveTo(0,-.21,.35,-.13);g.stroke();
  const sweep=(frame*.03+e.id*.1)%2-.5;if(sweep<1){glowAt(g,'#ffffff',lerp(-.4,.5,sweep),-.12,.12,.5);}}
 // Head and the two blade forelegs.
 blob(g,.62,-.06,.11,.09,fl?P.ivory:SCALE.silverShade,P.outline,.03);
 glowAt(g,P.cyan,.68,-.09,.07,1);
 g.strokeStyle=fl?P.ivory:SCALE.silver;g.lineWidth=.05;g.lineCap='round';
 const bl=(o)=>{const an=blade+o;g.beginPath();g.moveTo(.55,-.02);g.lineTo(.55+Math.cos(an)*.55,-.02+Math.sin(an)*.55);g.stroke();};
 bl(0);g.strokeStyle=fl?P.ivory:SCALE.silverShade;bl(.25);
 g.restore();
}

// Scale Diver: a hunched, scaled fish-thing with a fin crest; amber gills when beached.
export function drawScaleDiver(g,e,frame,k,ph,fl){
 const a=e.ai,act=e.act,tellK=a==='telegraph'?k:0;
 if(e.hidden&&!e.dead){wake(g,e,frame,k);return;}
 let sink=0,lean=.15,tilt=0,mouth=0,arm=[.4,-.55];
 if(a==='sink'){sink=clamp(1-e.aiTimer/e.aiFrames)*1.4;}
 if(a==='telegraph'&&act==='slap'){lean=-.15*tellK;arm=[lerp(.4,-.25,ease(tellK)),lerp(-.55,-1.15,ease(tellK))];}
 if(a==='attack'&&act==='slap'){lean=.4;arm=[lerp(-.25,.95,ease(k)),lerp(-1.15,-.5,ease(k))];}
 if(a==='attack'&&act==='rise'){lean=-.2;mouth=1;tilt=-.25;}
 const beached=a==='recover'&&act==='rise';
 if(beached){tilt=1.35;lean=0;}
 if(e.clip==='hit')lean=-.3;
 if(e.dead){const t=clamp((frame-e.defeatedFrame)/40);tilt=1.4*t;}
 g.save();
 if(sink>0){g.beginPath();g.rect(-2,-4,4,4);g.clip();g.translate(0,sink);}
 if(tilt){g.translate(0,-.25);g.rotate(tilt);g.translate(0,.25);}
 // Stubby legs.
 const st=Math.sin(ph)*.12;
 if(!beached){limb(g,-.12,-.42,-.18-st,0,.24,.24,-1,.11,fl?P.ivory:SCALE.plum);limb(g,.1,-.42,.16+st,-Math.max(0,Math.cos(ph))*.07,.24,.24,-1,.12,fl?P.ivory:SCALE.plumLight);}
 g.save();g.translate(0,-.75);g.rotate(lean);
 // Body: plum flesh under overlapping silver scales, a ragged fin crest along the back.
 g.fillStyle=fl?P.ivory:SCALE.silverShade;g.strokeStyle=P.outline;g.lineWidth=.035;
 g.beginPath();g.moveTo(-.4,.3);for(let i=0;i<6;i++){const t=i/5;g.lineTo(lerp(-.4,.25,t)+(i%2?.04:-.04),-.38-.35*Math.sin(t*Math.PI)-(i%2?.08:0));}g.lineTo(.3,-.2);g.closePath();g.fill();g.stroke();
 const gr=fl?P.ivory:radial(g,.05,-.15,.7,[[0,SCALE.plumLight],[1,SCALE.plum]]);
 g.fillStyle=gr;g.beginPath();g.ellipse(0,0,.42,.45,0,0,TAU);g.fill();g.stroke();
 if(!fl){
  for(let r=0;r<4;r++)for(let c=0;c<4;c++){
   const sx=-.3+c*.17+(r%2)*.08,sy=-.3+r*.17;if(sx*sx/0.17+sy*sy/0.2>1)continue;
   g.fillStyle=css(hash(e.id*7+r*4+c)>.7?SCALE.gleam:SCALE.silver,.9);g.strokeStyle=css(SCALE.silverDark,.9);g.lineWidth=.015;
   g.beginPath();g.arc(sx,sy,.085,0,Math.PI);g.fill();g.stroke();
  }
 }
 // Wide mouth and the head front; the gill slits (amber while exposed).
 g.fillStyle=fl?P.ivory:SCALE.silver;g.beginPath();g.ellipse(.33,-.2,.17,.15,0,0,TAU);g.fill();g.strokeStyle=P.outline;g.stroke();
 g.fillStyle=P.ink;g.beginPath();g.ellipse(.42,-.13,.1,.03+.08*mouth,.2,0,TAU);g.fill();
 glowAt(g,P.cyan,.38,-.28,.08,1);
 const open=e.exposed>0||beached;
 g.strokeStyle=open?css(P.amberHot,.95):css(SCALE.deep,.9);g.lineWidth=.03;
 for(let i=0;i<3;i++){g.beginPath();g.moveTo(.12-i*.08,-.18);g.quadraticCurveTo(.08-i*.08,-.05,.12-i*.08,.06);g.stroke();}
 if(open){glowAt(g,P.amber,.04,-.06,.38+.05*Math.sin(frame*.35),.9);}
 g.restore();
 // The slapping fin-arm.
 const sh=[.15,-.85];limb(g,sh[0],sh[1],arm[0],arm[1],.28,.3,1,.1,fl?P.ivory:SCALE.silverShade);
 g.fillStyle=fl?P.ivory:SCALE.silver;g.beginPath();g.ellipse(arm[0],arm[1],.16,.07,Math.atan2(arm[1]-sh[1],arm[0]-sh[0]),0,TAU);g.fill();g.strokeStyle=P.outline;g.lineWidth=.03;g.stroke();
 if(a==='telegraph'&&act==='slap')ivoryRing(g,arm[0],arm[1],tellK,frame,.8);
 if(a==='attack'&&act==='slap'){g.globalCompositeOperation='lighter';g.strokeStyle=css(P.ivory,.6);g.lineWidth=.07;g.beginPath();g.arc(.15,-.85,.75,-2,-2+ease(k)*2.4);g.stroke();g.globalCompositeOperation='source-over';}
 g.restore();
 // The rise: a column of cyan spray thrown up from the hole.
 if(a==='attack'&&act==='rise'){
  // Anchored at the hole and as tall as the sim's column (the diver itself leaps up through it).
  const t=ease(k),o=g.globalCompositeOperation,box=MONSTERS[e.kind].moves.rise.box,H=box.h,base=e.y-e.riseY,w=box.w/2;
  g.globalCompositeOperation='lighter';
  g.fillStyle=linear(g,0,base,0,base-H,[[0,css(P.cyan,.55)],[.75,css(P.cyanHot,.3)],[1,css(P.cyan,.05)]]);
  g.beginPath();g.moveTo(-w,base);g.lineTo(-w*.65,base-H);g.lineTo(w*.65,base-H);g.lineTo(w,base);g.closePath();g.fill();
  for(let i=0;i<8;i++){const h=hash(e.id*13+i),hx=(h-.5)*1.3,hy=base-(.3+t*(H-.4))*(.5+h*.6);blob(g,hx,hy,.05,.05,css(P.cyanHot,.8*(1-t)),null);}
  g.globalCompositeOperation=o;
 }
 if(a==='sink'){for(let i=0;i<3;i++){const r=.3+((frame*.04+i/3)%1)*.8;g.strokeStyle=css(P.cyan,.6*(1-r/1.1));g.lineWidth=.03;g.beginPath();g.ellipse(0,0,r,r*.22,0,0,TAU);g.stroke();}}
}
// Hidden: only the wake shows on the ice (a dorsal fin tip and spreading ripples), or the locked spot's ripples (the tell).
function wake(g,e,frame,k){
 const tellK=e.ai==='telegraph'?k:0;
 if(e.ai==='telegraph'){
  for(let i=0;i<4;i++){
   const t=((frame*(.03+.05*tellK)+i/4)%1),r=.25+t*(.6+.5*tellK);
   g.strokeStyle=css(i%2?P.cyanHot:P.cyan,(.35+.6*tellK)*(1-t));g.lineWidth=.03+.03*tellK;g.beginPath();g.ellipse(0,-.01,r,r*.2,0,0,TAU);g.stroke();
  }
  glowAt(g,P.cyan,0,-.05,.5+.6*tellK,.35+.55*tellK);
  if(tellK>.7&&Math.floor(frame/3)%2)glowAt(g,P.cyanHot,0,-.05,.4,.5);
  return;
 }
 g.fillStyle=css(SCALE.silver,.9);g.strokeStyle=P.outline;g.lineWidth=.025;
 g.beginPath();g.moveTo(-.18,0);g.quadraticCurveTo(-.05,-.22,.12,-.26);g.lineTo(.18,0);g.closePath();g.fill();g.stroke();
 for(let i=0;i<3;i++){const t=(frame*.05+i/3)%1;g.strokeStyle=css(P.cyan,.5*(1-t));g.lineWidth=.025;g.beginPath();g.moveTo(-.2-t*.9,-.01);g.quadraticCurveTo(-.3-t*.9,-.05-t*.05,-.45-t*.9,-.01);g.stroke();}
 glowAt(g,P.cyan,0,-.05,.3,.3);
}
