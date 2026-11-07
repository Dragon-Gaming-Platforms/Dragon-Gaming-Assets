import {css,mix,P} from './color.js';
import {glow} from './surface.js';
import {spriteFrame,drawSprite,drawTint,socket} from './sprites.js';
import {drawMoults} from './overlays.js';
import {KINDS} from '../data/kinds.js';
import {MOVES} from '../data/moves.js';
import {formVisual,POSSESSION} from '../data/forms.js';
import {ANCHORITE_FORM as AF} from '../data/form-anchorite.js';
import {manifest} from '../ui/assets.js';
import {VISUALS as V} from '../data/visuals.js';

// Rules-v5 possession look: THE ANCHORITE. The Brute rig (its sheet, or the procedural hero) drawn 2.2x with a light
// amber wash, fused into a walking hourglass carapace: a bloated ivory tick abdomen pinched by a bronze waist collar,
// ivory pauldron plates, four bone tick-legs that walk with the body, two huge mantis foreleg-spears (aubergine fur
// over bone, ivory spear tips), the boss's hourglass strapped upright on its back with its glass and sand turned AMBER
// (the stolen light is yours now), and the crimson tribe cloth worn as a hermit's hood behind the crested mask. The
// mask and its crescent horns stay in front of the hood. Everything moving is driven by sim fields only (e.anch: the
// move, its frame, the beam's angle and length, graves and overturned foes). 0 bytes of art. World units, y up.
const TAU=Math.PI*2,ID='anchorite-form',M=AF.moves;
const clamp=(v,a=0,b=1)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,ease=t=>t<=0?0:t>=1?1:t*t*(3-2*t);
const BRUTE=KINDS.brawler.height;
const BRONZE='#6b4a2a',BRONZE_HI='#b8874a',BRONZE_DK='#2a1a10',SAND='#c79a55',SAND_DK='#7a5530',SAND_HI='#f0cf8a';
// The look a future FORM_LOOKS registry can take: the Brute sheet, tinted amber, scaled from its authored height.
export const ANCHORITE_LOOK={draw:drawAnchoriteForm,tint:'amber',sheetH:BRUTE,sheet:'brawler'};

function add(g,color,x,y,r,a=1){const sp=glow(color);if(!sp||r<=0||a<=0)return;g.globalCompositeOperation='lighter';g.globalAlpha=Math.min(1,a);g.drawImage(sp,x-r,-y-r,r*2,r*2);g.globalAlpha=1;g.globalCompositeOperation='source-over';}
// Two-bone reach (as the boss's legs): the knee of a limb from s to t, bending to `bend`.
function knee(sx,sy,tx,ty,a,b,bend){
 const dx=tx-sx,dy=ty-sy,l=Math.max(.01,Math.sqrt(dx*dx+dy*dy)),d=Math.max(.01,Math.min(a+b-.01,l)),k=(a*a-b*b+d*d)/(2*d),h=Math.sqrt(Math.max(0,a*a-k*k));
 const ux=dx/l,uy=dy/l;
 return [sx+ux*k-uy*h*bend,sy+uy*k+ux*h*bend];
}
function seg(g,x0,y0,x1,y1,w0,w1,fill,rim){
 const dx=x1-x0,dy=y1-y0,l=Math.max(.01,Math.sqrt(dx*dx+dy*dy)),nx=-dy/l,ny=dx/l;
 g.beginPath();g.moveTo(x0+nx*w0/2,-(y0+ny*w0/2));g.quadraticCurveTo((x0+x1)/2+nx*(w0+w1)*.4,-((y0+y1)/2+ny*(w0+w1)*.4),x1+nx*w1/2,-(y1+ny*w1/2));
 g.lineTo(x1-nx*w1/2,-(y1-ny*w1/2));g.quadraticCurveTo((x0+x1)/2-nx*(w0+w1)*.2,-((y0+y1)/2-ny*(w0+w1)*.2),x0-nx*w0/2,-(y0-ny*w0/2));g.closePath();
 g.fillStyle=fill;g.fill();g.strokeStyle=css(P.outline,1);g.lineWidth=.05;g.stroke();
 if(rim){g.strokeStyle=rim;g.lineWidth=Math.min(w0,w1)*.25;g.beginPath();g.moveTo(x0+nx*w0*.25,-(y0+ny*w0*.25));g.lineTo(lerp(x0,x1,.85)+nx*w1*.2,-(lerp(y0,y1,.85)+ny*w1*.2));g.stroke();}
}
// A foreleg-spear: purple feather-fur upper, ivory lower, an ivory spear tip with an amber edge; the elbow is a bone knob.
function spear(g,sx,sy,tx,ty,w,flash,hot,bend){
 const [kx,ky]=knee(sx,sy,tx,ty,2.3,2.4,bend);
 g.lineCap='round';g.lineJoin='round';
 seg(g,sx,sy,kx,ky,w*1.15,w*.8,flash?P.ivory:css(P.fur,1),css(P.furRim,.5));
 seg(g,kx,ky,tx,ty,w,w*.4,flash?P.ivory:css(P.boneShade,1),css(P.boneRim,.6));
 g.fillStyle=css(P.bone,1);g.beginPath();g.arc(kx,-ky,w*.6,0,TAU);g.fill();g.strokeStyle=css(P.outline,1);g.lineWidth=w*.18;g.stroke();
 // Amber lava cracks along the fur turned into the form's amber joints.
 g.strokeStyle=css(P.amberHot,.5+.5*hot);g.lineWidth=.035;g.beginPath();g.moveTo(lerp(sx,kx,.3),-lerp(sy,ky,.3));g.lineTo(lerp(sx,kx,.55)+.05,-(lerp(sy,ky,.55)-.04));g.lineTo(lerp(sx,kx,.75),-lerp(sy,ky,.75));g.stroke();
 const dx=tx-kx,dy=ty-ky,l=Math.max(.01,Math.sqrt(dx*dx+dy*dy)),ux=dx/l,uy=dy/l,len=.85;
 g.fillStyle=flash?P.ivory:css(P.bone,1);g.strokeStyle=css(P.outline,1);g.lineWidth=.045;
 g.beginPath();g.moveTo(tx+ux*len,-(ty+uy*len));g.lineTo(tx-uy*.26,-(ty+ux*.26));g.lineTo(tx-ux*.15,-(ty-uy*.15));g.lineTo(tx+uy*.26,-(ty-ux*.26));g.closePath();g.fill();g.stroke();
 g.globalCompositeOperation='lighter';g.strokeStyle=css(P.amber,.45+.55*hot);g.lineWidth=.05;
 g.beginPath();g.moveTo(tx-uy*.2,-(ty+ux*.2));g.lineTo(tx+ux*len*.95,-(ty+uy*len*.95));g.stroke();g.globalCompositeOperation='source-over';
 if(hot>0)add(g,P.amber,tx+ux*len*.6,ty+uy*len*.6,.5+.5*hot,.6*hot);
 return [tx+ux*len,ty+uy*len];
}
// The hourglass on the back: a bronze frame, two AMBER glass bulbs; the upper one's sand is the next Sand Pour.
function hourglass(g,x,y,h,w,top,tilt,flash,t,pouring){
 g.save();g.translate(x,-y);g.rotate(tilt);
 const bulb=dir=>{g.beginPath();g.moveTo(-.06,0);g.bezierCurveTo(-w*1.1,-dir*h*.25,-w,-dir*h*.95,0,-dir*h);g.bezierCurveTo(w,-dir*h*.95,w*1.1,-dir*h*.25,.06,0);g.closePath();};
 for(const dir of [1,-1]){bulb(dir);g.fillStyle=css(P.amberDeep,.28);g.fill();}
 g.save();bulb(1);g.clip();g.fillStyle=css(SAND,.95);const st=h*top*.92;g.fillRect(-w,-st,w*2,st);g.restore();
 g.save();bulb(-1);g.clip();g.fillStyle=css(mix(SAND,P.amber,.55),.95);const sl=h*Math.max(.15,1-top)*.9;g.fillRect(-w,h-sl,w*2,sl);g.restore();
 // The amber light of the glass: it is the hunter's now.
 add(g,P.amber,0,0,1.1*h+(pouring?.6:0),.55+(pouring?.35:0)+.08*Math.sin(t*.12));
 if(top>0&&top<1){g.strokeStyle=css(SAND_HI,.95);g.lineWidth=.04;g.beginPath();g.moveTo(0,0);g.lineTo(Math.sin(t*.3)*.015,h*.6);g.stroke();}
 for(const dir of [1,-1]){bulb(dir);g.strokeStyle=css(P.amberHot,.75);g.lineWidth=.045;g.stroke();g.strokeStyle=css(P.ivory,.3);g.lineWidth=.025;g.beginPath();g.arc(-w*.35,-dir*h*.55,w*.42,Math.PI*.9,Math.PI*1.4);g.stroke();}
 g.fillStyle=css(BRONZE,1);g.strokeStyle=css(P.outline,1);g.lineWidth=.04;
 for(const dir of [1,-1]){g.beginPath();g.ellipse(0,-dir*(h+.08),w*1.15,.13,0,0,TAU);g.fill();g.stroke();}
 g.strokeStyle=css(P.boneShade,1);g.lineWidth=.08;for(const sx of [-w*1.02,w*1.02]){g.beginPath();g.moveTo(sx,-(h+.04));g.lineTo(sx,h+.04);g.stroke();}
 if(flash){g.globalCompositeOperation='lighter';for(const dir of [1,-1]){bulb(dir);g.fillStyle=css(P.ivory,.4);g.fill();}g.globalCompositeOperation='source-over';}
 g.restore();
}
// A tick walking leg from the abdomen to the floor: distance-driven (the phase is the body's x), feet planted.
function tickLeg(g,hx,hy,fx,fy,lift,flash){
 const [kx,ky]=knee(hx,hy,fx,fy+lift,.95,1,-1);
 g.lineCap='round';
 g.strokeStyle=css(P.outline,1);g.lineWidth=.17;g.beginPath();g.moveTo(hx,-hy);g.lineTo(kx,-ky);g.lineTo(fx,-(fy+lift));g.stroke();
 g.strokeStyle=flash?P.ivory:css(P.boneShade,1);g.lineWidth=.11;g.beginPath();g.moveTo(hx,-hy);g.lineTo(kx,-ky);g.lineTo(fx,-(fy+lift));g.stroke();
 g.fillStyle=css(P.bone,1);g.beginPath();g.arc(kx,-ky,.08,0,TAU);g.fill();
}

// Where the foreleg tips are this frame (render only), from the move and its frame.
function tips(h,x,y,dir,S,t){
 const restN=[x+dir*1.9,y+.55+Math.sin(t*.07)*.05],restF=[x+dir*1.35,y+.9+Math.sin(t*.07+1)*.05];
 const L=M.lash,O=M.overturn,reach=x+dir*(L.box.x1-.85),mid=y+(L.box.y0+L.box.y1)/2;
 let near=restN,far=restF,hotN=0,hotF=0;
 if(h.move==='lash'){
  // Each stab: the leg cocks back over the startup, shoots out to the box's end, holds the active frames, returns.
  const stab=(at,rest,cock)=>{
   const f=h.f;
   if(f<at){const k=ease(clamp(f/at));return [[lerp(rest[0],x+dir*cock,k),lerp(rest[1],y+S*.62,k)],0];}
   const k=f<at+2?ease((f-at+1)/2):f<at+L.active+2?1:1-ease(clamp((f-at-L.active-2)/7));
   return [[lerp(x+dir*cock,reach,k),lerp(y+S*.62,mid,k)],k];
  };
  [near,hotN]=stab(L.stabs[0],restN,.4);[far,hotF]=stab(L.stabs[1],restF,.1);
 }else if(h.move==='overturn'){
  // Both legs lift over the crown, then drive the floor over: ahead and behind.
  if(h.f<O.startup){const k=ease(clamp(h.f/O.startup));near=[lerp(restN[0],x+dir*.9,k),lerp(restN[1],y+S*1.15,k)];far=[lerp(restF[0],x-dir*.6,k),lerp(restF[1],y+S*1.1,k)];hotN=hotF=k;}
  else{const k=clamp((h.f-O.startup)/(O.total-O.startup));near=[x+dir*2.6,y+.05+k*.4];far=[x-dir*2.2,y+.05+k*.4];hotN=hotF=1-k;}
 }else if(h.move==='pour'){
  // The forelegs brace on the floor while the bulb pours.
  near=[x+dir*2.2,y+.02];far=[x-dir*1.4,y+.02];
 }else if(h.move==='grave'){
  const k=ease(clamp(h.f/M.grave.startup));near=[lerp(restN[0],x+dir*2.8,k),lerp(restN[1],y+.3,k)];
 }
 return {near,far,hotN,hotF};
}

// drawAnchoriteForm(ctx, p, A): the carapace, hourglass, hood, legs and move effects around the drawn Brute rig.
// A: {x,y} feet (interpolated), dir, frame, layer ('behind' | 'front'; omitted draws both), S (drawn height in tiles).
export function drawAnchoriteForm(g,p,A={}){
 const h=p.anch||{},x=A.x??p.x,y=A.y??p.y,dir=A.dir??(p.facing<0?-1:1),t=A.frame??0,S=A.S||formVisual(ID,'brawler');
 const flash=p.flash>0,layer=A.layer,back=layer!=='front',front=layer!=='behind';
 const sx=x+dir*S*.1,sy=y+S*.68,{near,far,hotN,hotF}=tips(h,x,y,dir,S,t);
 const pouring=h.move==='pour'&&h.f>=M.pour.startup&&h.f<M.pour.startup+M.pour.frames;
 const top=h.move==='pour'?clamp(1-(h.f-M.pour.startup)/M.pour.frames):clamp(1-(h.pourCd||0)/M.pour.cooldown);
 const bob=Math.sin(t*.06)*.03,abdY=y+S*.3+bob;
 if(back){
  // The far foreleg-spear, behind everything.
  spear(g,sx-dir*.35,sy+.05,far[0],far[1],.24,flash,hotF,dir);
  // Four tick walking legs from the abdomen, distance-driven so the feet stay planted.
  const phase=(p.x||0)*2.1;
  for(let i=0;i<4;i++){
   const side=i<2?1:-1,ph=phase+i*Math.PI*.5,stride=Math.sin(ph)*.32,lift=Math.max(0,Math.cos(ph))*.18*(p.grounded===false?0:1);
   tickLeg(g,x-dir*(.15+.25*i),abdY,x+dir*(side*(.95+.2*(i%2))+stride),y,lift,flash);
  }
  // The hourglass carapace: a bloated aubergine abdomen under ivory plates, pinched by a bronze waist collar into the
  // ivory back-shell above it (the boss's hermit-tick carapace, two bulbs of an hourglass), behind the Brute.
  g.save();g.translate(x-dir*.5,-abdY);g.scale(dir,1);
  const fg=g.createRadialGradient(-.1,-.15,.1,0,0,1.3);fg.addColorStop(0,P.furLight);fg.addColorStop(.6,P.fur);fg.addColorStop(1,P.furDeep);
  g.fillStyle=flash?P.ivory:fg;g.strokeStyle=css(P.outline,1);g.lineWidth=.05;g.beginPath();g.ellipse(0,0,1.2,.85,0,0,TAU);g.fill();g.stroke();
  for(let i=0;i<3;i++){
   const r=1.1-i*.28,yy=-.12-i*.17,cg=g.createLinearGradient(-r,yy-r*.6,r,yy+r*.4);
   cg.addColorStop(0,P.boneRim);cg.addColorStop(.45,P.bone);cg.addColorStop(1,P.boneDark);
   g.fillStyle=flash?P.ivory:cg;g.beginPath();g.ellipse(-.1,yy,r,r*.6,0,Math.PI,TAU);g.closePath();g.fill();g.stroke();
  }
  g.strokeStyle=css(P.amberHot,.55+.25*Math.sin(t*.09));g.lineWidth=.045;g.beginPath();g.moveTo(-.75,-.25);g.lineTo(-.45,-.5);g.lineTo(-.55,-.72);g.moveTo(.35,-.3);g.lineTo(.15,-.62);g.stroke();
  // The upper bulb: the domed back-shell, growth rings and amber lava cracks.
  const up=S*.36,sg=g.createLinearGradient(-1.1,-up-1,1,-up+.6);sg.addColorStop(0,P.boneRim);sg.addColorStop(.4,P.bone);sg.addColorStop(1,P.boneDark);
  g.fillStyle=flash?P.ivory:sg;g.beginPath();g.ellipse(-.15,-up,1.05,1,0,0,TAU);g.fill();g.stroke();
  g.strokeStyle=css(P.boneDark,.5);g.lineWidth=.035;
  for(let i=1;i<4;i++){g.beginPath();g.ellipse(-.15,-up,1.05-i*.24,1-i*.22,0,Math.PI*.6,Math.PI*1.45);g.stroke();}
  g.strokeStyle=css(P.amberHot,.6+.3*Math.sin(t*.08));g.lineWidth=.05;g.beginPath();g.moveTo(-.95,-up+.2);g.lineTo(-.6,-up-.25);g.lineTo(-.75,-up-.55);g.lineTo(-.4,-up-.85);g.stroke();
  add(g,P.amber,-.7,up+.3,.7,.25);
  // The bronze waist collar where the two bulbs pinch.
  g.fillStyle=css(BRONZE,1);g.beginPath();g.ellipse(-.1,-up*.45,.95,.17,0,0,TAU);g.fill();g.stroke();
  g.fillStyle=css(BRONZE_HI,.8);g.fillRect(-.85,-up*.45-.04,1.5,.05);
  g.fillStyle=css(BRONZE_HI,1);for(const rx of [-.75,-.35,.05,.45]){g.beginPath();g.arc(rx,-up*.45,.05,0,TAU);g.fill();}
  g.restore();
  // The hermit's hood: crimson cloth hanging behind the crested mask, its point falling down the back.
  const hx=x+dir*S*.04,hy=y+S*.9;
  g.fillStyle=css(P.crimson,1);g.strokeStyle=css(P.crimsonDeep,1);g.lineWidth=.05;
  g.beginPath();g.moveTo(hx+dir*.55,-(hy-.55));g.quadraticCurveTo(hx+dir*.7,-(hy+.55),hx,-(hy+.62));
  g.quadraticCurveTo(hx-dir*.75,-(hy+.5),hx-dir*.95,-(hy-.25));
  g.quadraticCurveTo(hx-dir*(1.25+.06*Math.sin(t*.07)),-(hy-1.05),hx-dir*1.05,-(hy-1.45));
  g.lineTo(hx-dir*.55,-(hy-.85));g.quadraticCurveTo(hx-dir*.2,-(hy-.7),hx+dir*.55,-(hy-.55));g.closePath();g.fill();g.stroke();
  g.strokeStyle=css(P.crimsonLight,.6);g.lineWidth=.04;g.beginPath();g.moveTo(hx+dir*.45,-(hy+.25));g.quadraticCurveTo(hx-dir*.2,-(hy+.48),hx-dir*.8,-(hy-.2));g.stroke();
  // The hourglass strapped upright on the back (tipped toward the target while it pours).
  const tilt=pouring?dir*(.35+(h.ang||0)/1e5*.4):h.move==='grave'?dir*.5*ease(clamp(h.f/M.grave.startup)):0;
  hourglass(g,x-dir*M.pour.box.back,y+M.pour.box.y,.72,.46,top,tilt,flash,t,pouring);
 }
 if(!front)return;
 // Ivory pauldron plates over the near shoulder.
 g.save();g.translate(x+dir*S*.02,-(y+S*.72+bob));g.scale(dir,1);
 for(let i=0;i<2;i++){
  const r=.55-i*.14,yy=-i*.1,cg=g.createLinearGradient(-r,yy-r,r,yy+r*.5);cg.addColorStop(0,P.boneRim);cg.addColorStop(.5,P.bone);cg.addColorStop(1,P.boneDark);
  g.fillStyle=flash?P.ivory:cg;g.strokeStyle=css(P.outline,1);g.lineWidth=.04;g.beginPath();g.ellipse(.15,yy,r,r*.55,-.35,Math.PI*.95,TAU+.15);g.closePath();g.fill();g.stroke();
 }
 g.strokeStyle=css(P.amberHot,.5);g.lineWidth=.03;g.beginPath();g.moveTo(-.1,-.12);g.lineTo(.12,-.3);g.lineTo(.05,-.4);g.stroke();
 g.restore();
 // Crimson hood lappets falling over the chest on both sides of the mask (the face stays open).
 const hx=x+dir*S*.04,hy=y+S*.9;
 g.fillStyle=css(P.crimson,.95);g.strokeStyle=css(P.crimsonDeep,1);g.lineWidth=.035;
 g.beginPath();g.moveTo(hx+dir*.42,-(hy-.48));g.quadraticCurveTo(hx+dir*.62,-(hy-.95),hx+dir*.48+Math.sin(t*.08)*.04,-(hy-1.35));
 g.lineTo(hx+dir*.3,-(hy-1.3));g.quadraticCurveTo(hx+dir*.38,-(hy-.9),hx+dir*.22,-(hy-.55));g.closePath();g.fill();g.stroke();
 // The near foreleg-spear, in front of the body.
 const tip=spear(g,sx+dir*.1,sy,near[0],near[1],.28,flash,hotN,dir);
 // Sand Lash: the thrust leaves an amber streak along the spear line.
 if(h.move==='lash'){
  g.globalCompositeOperation='lighter';
  for(const [at,k] of [[M.lash.stabs[0],hotN],[M.lash.stabs[1],hotF]]){
   if(!(k>0)||h.f<at)continue;
   const ly=y+(M.lash.box.y0+M.lash.box.y1)/2+(at===M.lash.stabs[1]?.15:0);
   g.strokeStyle=css(P.amber,.55*k);g.lineWidth=.22*k;g.beginPath();g.moveTo(x+dir*.6,-ly);g.lineTo(x+dir*M.lash.box.x1,-ly);g.stroke();
   g.strokeStyle=css(P.amberHot,.8*k);g.lineWidth=.06;g.beginPath();g.moveTo(x+dir*1.5,-ly);g.lineTo(x+dir*(M.lash.box.x1+.1),-ly);g.stroke();
  }
  g.globalCompositeOperation='source-over';
  if(hotN>.9)add(g,P.amberHot,tip[0],tip[1],.55,.7);
 }
 // Overturn: the telegraph draws the turn (an amber arc over the crown), the slam a ring out to its 8-tile reach.
 if(h.move==='overturn'){
  const O=M.overturn;
  g.globalCompositeOperation='lighter';
  if(h.f<O.startup){
   const k=clamp(h.f/O.startup),r=1.6;
   g.strokeStyle=css(P.amberHot,.4+.5*k);g.lineWidth=.1;g.beginPath();g.arc(x,-(y+S*.6),r,-Math.PI/2-k*Math.PI*.9,-Math.PI/2+k*Math.PI*.9);g.stroke();
  }else{
   const k=clamp((h.f-O.startup)/14),r=O.radius*ease(k);
   g.strokeStyle=css(P.amber,.9*(1-k));g.lineWidth=.2*(1-k)+.04;g.beginPath();g.ellipse(x,-(y+.3),r,Math.min(O.height,r*.5),0,Math.PI,TAU);g.stroke();
   g.fillStyle=css(SAND,.4*(1-k));g.beginPath();g.ellipse(x,-y,r*.9,.25+.4*(1-k),0,Math.PI,TAU);g.fill();
  }
  g.globalCompositeOperation='source-over';
 }
 // Sand Pour: the amber beam out of the bulb's neck, as long as the sim's ray.
 if(pouring&&h.len>0){
  const a=(h.ang||0)/1000*Math.PI/180,dx=dir*Math.cos(a),dy=Math.sin(a),ox=x-dir*M.pour.box.back,oy=y+(h.lift??M.pour.box.y),ex=ox+dx*h.len,ey=oy+dy*h.len,r=M.pour.box.r;
  g.lineCap='round';g.globalCompositeOperation='lighter';
  g.strokeStyle=css(P.amberDeep,.45);g.lineWidth=r*3.2;g.beginPath();g.moveTo(ox,-oy);g.lineTo(ex,-ey);g.stroke();
  g.strokeStyle=css(P.amber,.8);g.lineWidth=r*1.9;g.stroke();
  g.strokeStyle=css(P.amberHot,.95);g.lineWidth=r*.7+.04*Math.sin(t*.8);g.stroke();
  g.globalCompositeOperation='source-over';
  g.fillStyle=css(SAND_HI,.9);
  for(let i=0;i<12;i++){const q=((t*.09+i/12)%1),px=ox+dx*h.len*q+(-dy)*Math.sin(i*2.3+t*.4)*r*.9,py=oy+dy*h.len*q+dx*Math.sin(i*2.3+t*.4)*r*.9;g.fillRect(px-.035,-py-.035,.07,.07);}
  add(g,P.amberHot,ex,ey,1.1,.8);add(g,P.amber,ox,oy,.8,.7);
 }
}

// World effects of a worn Anchorite: the Sand-Grave mounds, the stream pouring into them, foes turned over or buried.
export function drawAnchoriteFormWorld(g,state,p,alpha=1,frame=0){
 const h=p.anch;if(!h)return;
 const G=M.grave;
 for(const v of h.graves){
  const grow=ease(clamp((v.t+alpha)/G.set)),fade=clamp((G.set+G.life-v.t)/30),mid=(v.x0+v.x1)/2,w=v.x1-v.x0,ht=G.box.y1*.8*grow;
  if(v.t<G.set){
   // The pour from the bulb arcs down onto the grave's line.
   const ox=p.x-p.facing*M.pour.box.back,oy=p.y+M.pour.box.y;
   g.strokeStyle=css(SAND,.7);g.lineWidth=.14;g.beginPath();g.moveTo(ox,-oy);g.quadraticCurveTo(lerp(ox,mid,.5),-(oy+1),mid,-(v.y+ht));g.stroke();
   g.strokeStyle=css(SAND_HI,.6);g.lineWidth=.05;g.stroke();
  }
  g.globalAlpha=fade;
  const gr=g.createLinearGradient(0,-(v.y+ht),0,-v.y);gr.addColorStop(0,SAND_HI);gr.addColorStop(.3,SAND);gr.addColorStop(1,SAND_DK);
  g.fillStyle=gr;g.beginPath();g.moveTo(v.x0-.3,-v.y);
  for(let i=0;i<=10;i++){const xx=lerp(v.x0,v.x1,i/10),edge=Math.min(1,Math.min(i,10-i)/2.5);g.lineTo(xx,-(v.y+ht*(.35+.65*edge)+Math.sin(i*1.9+frame*.05)*.04*grow));}
  g.lineTo(v.x1+.3,-v.y);g.closePath();g.fill();
  if(v.t>=G.set){
   // Set: amber glints and the grave-line where the sand holds whatever it buried.
   for(let i=0;i<6;i++){const xx=v.x0+w*(i+.5)/6;add(g,P.amber,xx,v.y+ht*.7,.3,.35*(Math.floor(frame/5+i)%3?1:.4)*fade);}
   if(v.t<G.set+10){const k=(v.t-G.set)/10;g.strokeStyle=css(P.amberHot,.9*(1-k));g.lineWidth=.08;g.beginPath();g.ellipse(mid,-v.y,w/2+k*.8,G.box.y1*(1+k*.4),0,Math.PI,TAU);g.stroke();}
  }
  g.globalAlpha=1;
 }
 for(const q of h.flips){
  const e=(state.enemies||[]).find(x=>x.id===q.id);if(!e||e.dead)continue;
  const x=e.px+(e.x-e.px)*alpha,y=e.py+(e.y-e.py)*alpha,k=clamp(q.t/12);
  // Turned over: a spinning amber hourglass glyph upside down over it, a sand trail falling 'up'.
  g.save();g.translate(x,-(y+e.h+.55));g.rotate(Math.PI*k+frame*.05);
  g.strokeStyle=css(P.amberHot,.9);g.lineWidth=.06;g.beginPath();g.moveTo(-.22,-.28);g.lineTo(.22,-.28);g.lineTo(-.22,.28);g.lineTo(.22,.28);g.closePath();g.stroke();
  g.restore();
  g.fillStyle=css(SAND_HI,.8);for(let i=0;i<5;i++){const yy=y-((frame*.08+i*.2)%1)*1.2;g.fillRect(x+(i-2)*.12,-yy,.06,.09);}
  add(g,P.amber,x,y+e.h*.5,.9,.35);
 }
 // Overturn on a boss: its footing goes for 20 frames, drawn as a big amber hourglass turning over above it, a ring
 // round its body and sand shaken off its feet.
 const b=h.stagT>0?(state.enemies||[]).find(x=>x.id===h.stagId&&!x.dead):null;
 if(b){
  const k=clamp(1-(h.stagT-alpha)/M.overturn.stagger),x=b.px+(b.x-b.px)*alpha,y=b.py+(b.y-b.py)*alpha,top=y+b.h+.9;
  g.globalCompositeOperation='lighter';
  g.strokeStyle=css(P.amber,.9*(1-k));g.lineWidth=.16*(1-k)+.04;g.beginPath();g.ellipse(x,-(y+b.h*.5),b.w*.6+k*1.6,b.h*.55+k*1.2,0,0,TAU);g.stroke();
  g.save();g.translate(x,-top);g.rotate(Math.PI*ease(k));
  g.strokeStyle=css(P.amberHot,.95);g.lineWidth=.12;g.beginPath();g.moveTo(-.55,-.7);g.lineTo(.55,-.7);g.lineTo(-.55,.7);g.lineTo(.55,.7);g.closePath();g.stroke();
  g.restore();add(g,P.amber,x,top,1.2,.6*(1-k*.5));
  g.globalCompositeOperation='source-over';
  g.fillStyle=css(SAND_HI,.85*(1-k));for(let i=0;i<8;i++){const xx=x+(i-3.5)*b.w*.22,yy=y+.2-k*(.6+(i%3)*.3);g.fillRect(xx-.05,-yy-.05,.1,.1);}
 }
 for(const e of state.enemies||[]){
  if(!(e.buryT>0)||e.dead)continue;
  const k=clamp(e.buryT/G.bury),x=e.px+(e.x-e.px)*alpha,y=e.py+(e.y-e.py)*alpha,w=e.w/2+.25,ht=.2+e.h*.55*k;
  const gr=g.createLinearGradient(0,-(y+ht),0,-y);gr.addColorStop(0,SAND_HI);gr.addColorStop(.35,SAND);gr.addColorStop(1,SAND_DK);
  g.fillStyle=gr;g.beginPath();g.moveTo(x-w-.25,-y);g.quadraticCurveTo(x-w,-(y+ht*.9),x,-(y+ht));g.quadraticCurveTo(x+w,-(y+ht*.9),x+w+.25,-y);g.closePath();g.fill();
  add(g,P.amber,x,y+ht,.4,.4*k);
 }
}

// Brute clips for the Anchorite's sim state, as the hero rig names them (frame data stays authoritative).
function clip(e){
 const h=e.anch||{};
 if(h.move==='lash')return ['sword',clamp(h.f/M.lash.total)];
 if(h.move==='overturn')return h.f<M.overturn.startup?['charge',null]:['sword',.5+.5*clamp((h.f-M.overturn.startup)/(M.overturn.total-M.overturn.startup))];
 if(h.move==='grave')return ['blast',clamp(h.f/M.grave.total)];
 if(h.move==='pour')return ['blast',h.f<M.pour.startup?clamp(h.f/M.pour.startup)*.5:.5];
 const c=e.clip;
 return [c==='lash'||c==='pour'||c==='slam'||c==='telegraph'||!c?'idle':c,null];
}
const proxies=new WeakMap();
function proxyOf(e){let q=proxies.get(e);if(!q){q=Object.create(e);proxies.set(e,q);}return q;}
// The whole Anchorite for the View: behind layer, the amber Brute (sheet or procedural, 2.2x), front layer, world effects.
export function drawAnchoriteFormEntity(view,g,state,e,frame,alpha,load=true){
 const x=e.px+(e.x-e.px)*alpha,y=e.py+(e.y-e.py)*alpha,dir=e.facing<0?-1:1,S=formVisual(ID,'brawler'),k=S/BRUTE,A={x,y,dir,frame,S,layer:'behind'};
 if(!e.form){drawShift(view,g,e,frame,alpha,load,x,y,dir,S);return;}
 drawAnchoriteFormWorld(g,state,e,alpha,frame);
 // The hurt blink hides the body only; never during a move: the shape is the cue.
 if(e.inv&&!e.dead&&!e.anch?.move&&Math.floor(frame/V.blinkFrames)%2)return;
 drawAnchoriteForm(g,e,A);
 const MA=moultsOf(e),moults=!!e.moults?.length;
 if(moults&&MA.valid)drawMoults(g,e,MA,frame,'behind');
 const [name,progress]=clip(e),q=proxyOf(e),mv=MOVES[name];
 Object.assign(q,{form:null,formShift:0,formNext:null,kind:'brawler',emberMax:0,echoFlash:0,facing:dir,
  move:mv&&progress!==null?name:null,moveFrame:mv&&progress!==null?progress*mv.total*.999:0,clip:name});
 const entry=manifest.sprites?.brawler;
 if(load&&entry)view.atlas.load('brawler',entry);
 const atlas=view.atlas.get('brawler');
 if(atlas){
  q.h=e.h;q.w=e.w;
  const opts={sprite:(sx,sy,d,scale,n,pr,fl)=>{
   const f=spriteFrame(atlas,q,n,pr,frame,sx,k);
   drawSprite(g,atlas,f.frame,sx,sy,d,k,fl,1.4);
   // A light amber wash only: the purple fur and the crimson cloth stay readable through it.
   if(!fl)drawTint(g,atlas,f.frame,sx,sy,d,k,.18);
   if(moults)for(const n of SOCKETS)MA[n]=socket(atlas,f.frame,n,sx,sy,d,k)||guess(n,sx,sy,d,S);
   MA.dir=d;
  },anchors:null,low:!!view.mobile};
  view.chars.draw(g,q,frame,alpha,opts);
 }else{
  q.h=BRUTE;q.w=KINDS.brawler.width;
  g.save();g.translate(x,-y);g.scale(k,k);g.translate(-x,y);
  view.chars.draw(g,q,frame,alpha,{sprite:null,anchors:null,low:!!view.mobile});
  g.restore();
  if(moults)for(const n of SOCKETS)MA[n]=guess(n,x,y,dir,S);
  MA.dir=dir;
 }
 A.layer='front';drawAnchoriteForm(g,e,A);
 if(moults){MA.scale=k*.8;MA.valid=true;drawMoults(g,e,MA,frame,'front');}
}
const SOCKETS=['head','back','hand','chest','tail','legs'],anchorsByHunter=new WeakMap();
function moultsOf(e){let a=anchorsByHunter.get(e);if(!a){a={valid:false,scale:1,dir:1};anchorsByHunter.set(e,a);}return a;}
function guess(n,x,y,dir,S){
 const w=S*.4;
 return n==='head'?[x+dir*w*.1,y+S*.95]:n==='back'?[x-dir*w*.3,y+S*.72]:n==='hand'?[x+dir*w*.65,y+S*.5]:
  n==='chest'?[x+dir*w*.15,y+S*.62]:n==='legs'?[x+dir*w*.05,y+S*.03]:[x-dir*w*.45,y+S*.35];
}
const shifting=new WeakMap();
// The 20f transformation: the hunter's own body (its mask cracking) while the hourglass carapace grows around it and
// the sand in the amber bulb runs down.
function drawShift(view,g,e,frame,alpha,load,x,y,dir,S){
 let q=shifting.get(e);if(!q){q=Object.create(e);q.formNext=null;shifting.set(e,q);}
 const A=view.anchorsOf(q),o=view.opts,moults=!!e.moults?.length;
 if(moults&&A.valid)drawMoults(g,e,A,frame,'behind');
 o.sprite=view.spriteFor(q,load,g,frame,A,alpha);o.anchors=A;o.low=!!view.mobile;
 view.chars.draw(g,q,frame,alpha,o);
 A.x=x;A.y=y;A.valid=true;
 if(moults)drawMoults(g,e,A,frame,'front');
 const k=ease(clamp(1-e.formShift/POSSESSION.shift));
 const sc=.3+.7*k;
 g.globalAlpha=.35+.6*k;
 g.save();g.translate(x,-y);g.scale(sc,sc);g.translate(-x,y);
 drawAnchoriteForm(g,e,{x,y,dir,frame,S});
 g.restore();g.globalAlpha=1;
 g.globalCompositeOperation='lighter';g.strokeStyle=css(P.amberHot,.9*(1-k));g.lineWidth=.08;
 g.beginPath();g.arc(x,-(y+e.h*.8),.3+k*S*.5,0,TAU);g.stroke();g.globalCompositeOperation='source-over';
}
