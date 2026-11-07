import {css,P,mix} from './color.js';
import {glow} from './surface.js';
import {spriteFrame,drawSprite,drawTint,socket} from './sprites.js';
import {drawMoults} from './overlays.js';
import {KINDS} from '../data/kinds.js';
import {MOVES} from '../data/moves.js';
import {formVisual,POSSESSION} from '../data/forms.js';
import {ANTIPHON_FORM} from '../data/antiphon-form.js';
import {manifest} from '../ui/assets.js';
import {VISUALS as V} from '../data/visuals.js';

// Rules-v5 possession look: THE ANTIPHON (BOSS-DESIGN boss 2b). The Brute rig (its sheet, or the procedural hero)
// drawn 2.1x with a light amber wash, wearing the choir-saint: four more ivory arms (six in all; the extra four are
// visual overflow), a veil of shed wing-scales hanging from the crested skull mask (horns and amber eyes stay out),
// drowned crimson robes, and the boss's cyan halo turned AMBER. Its TRUE IMAGE (the six-armed saint, upside down) is
// always drawn under its feet, as the Mere draws the boss's. Everything moving is driven by sim fields only (e.choir:
// the move, its frame, the Flurry's arm, the Grasp's mark and the Hymn's rings; enemies' pinUntil). 0 bytes of art.
// World units, y up (canvas y = -y). Small helpers are copied from render2d/antiphon.js rather than shared.
const TAU=Math.PI*2,ID='antiphon-form',M=ANTIPHON_FORM.moves;
const clamp=(v,a=0,b=1)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,ease=t=>t*t*(3-2*t),out=t=>1-(1-t)*(1-t)*(1-t);
const BRUTE=KINDS.brawler.height,MIST='#cfdbe4',SILVER='#c9d2dc',MIRROR=.42;
// Where the Flurry's six hands land (height above the feet, reach ahead): a fan from low to high and back.
const FLURRY=[[1.1,3.7],[2.1,4],[.6,3.5],[2.6,3.6],[1.5,4.1],[1.8,4.2]];

// Additive glow; it keeps (and scales by) the caller's alpha, so a faded layer stays faded.
function add(g,color,x,y,r,a){const sp=glow(color);if(!sp||a<=0)return;const a0=g.globalAlpha;g.globalCompositeOperation='lighter';g.globalAlpha=Math.min(1,a)*a0;g.drawImage(sp,x-r,-y-r,r*2,r*2);g.globalAlpha=a0;g.globalCompositeOperation='source-over';}
function taper(g,x0,y0,x1,y1,w0,w1){
 const a=Math.atan2(y1-y0,x1-x0),nx=-Math.sin(a),ny=Math.cos(a);
 g.beginPath();g.moveTo(x0+nx*w0,-(y0+ny*w0));g.lineTo(x1+nx*w1,-(y1+ny*w1));g.arc(x1,-y1,w1,-a+Math.PI/2,-a-Math.PI/2,true);
 g.lineTo(x0-nx*w0,-(y0-ny*w0));g.arc(x0,-y0,w0,-a-Math.PI/2,-a+Math.PI/2,true);g.closePath();
}
// Two-bone limb: the elbow bends toward side (+1 up, -1 down).
function elbow(sx,sy,hx,hy,l,side){
 const dx=hx-sx,dy=hy-sy,d=Math.max(.01,Math.min(2*l-.01,Math.hypot(dx,dy))),a=Math.atan2(dy,dx),b=Math.acos(clamp(d/(2*l),-1,1));
 const y1=sy+Math.sin(a+b)*l,y2=sy+Math.sin(a-b)*l,up=y1>=y2;
 return (side>0)===up?[sx+Math.cos(a+b)*l,y1]:[sx+Math.cos(a-b)*l,y2];
}
// One ivory arm of the saint, with the boss's joint stone turned amber. hot: 0..1 strike glow.
function arm(g,sx,sy,hx,hy,w,side,hot,flash,t,i){
 const l=Math.max(.5,Math.hypot(hx-sx,hy-sy)*.56),[ex,ey]=elbow(sx,sy,hx,hy,l,side);
 const gr=g.createLinearGradient(sx,-sy,hx,-hy);gr.addColorStop(0,P.boneShade);gr.addColorStop(.6,P.bone);gr.addColorStop(1,P.ivory);
 g.fillStyle=flash?P.ivory:gr;g.strokeStyle=css(P.outline,1);g.lineWidth=.04;
 taper(g,sx,sy,ex,ey,w,w*.8);g.fill();g.stroke();taper(g,ex,ey,hx,hy,w*.8,w*.5);g.fill();g.stroke();
 // A purple fur cuff at the shoulder: the Brute's own feather-fur under the bone.
 // A tuft of feather-fur, not a ball: three short strands fanned back over the joint, rim-lit.
 const ba=Math.atan2(hy-sy,hx-sx)+Math.PI;
 for(let k=-1;k<=1;k++){const fa=ba+k*.55,fx=sx+Math.cos(fa)*w*1.5,fy=sy+Math.sin(fa)*w*1.5;
  g.fillStyle=css(k?P.fur:P.furLight,1);taper(g,sx,sy,fx,fy,w*.62,w*.12);g.fill();}
 // The joint stone: amber now (cyan on the boss), brighter as the arm strikes.
 g.fillStyle=css(hot>0?P.amberHot:P.amber,1);g.beginPath();g.arc(ex,-ey,w*.62,0,TAU);g.fill();
 add(g,P.amber,ex,ey,.3+.3*hot,.35+.5*hot);
 // A bone bracer on the forearm.
 g.fillStyle=css(P.boneDark,.85);taper(g,lerp(ex,hx,.3),lerp(ey,hy,.3),lerp(ex,hx,.6),lerp(ey,hy,.6),w*.95,w*.8);g.fill();
 // The hand: a furred palm and four hooked ivory claws (the Brute's hands, the saint's long fingers).
 const a=Math.atan2(hy-ey,hx-ex);
 g.fillStyle=css(P.furLight,1);g.strokeStyle=css(P.outline,1);g.lineWidth=.03;g.beginPath();g.arc(hx,-hy,w*.8,0,TAU);g.fill();g.stroke();
 g.fillStyle=css(P.bone,1);g.strokeStyle=css(P.outline,1);g.lineWidth=.025;
 for(let f=-1.5;f<=1.5;f+=1){
  const fa=a+f*(.32+.12*Math.sin(t*.07+i)),fl=w*(3-.4*Math.abs(f)),bx=hx+Math.cos(fa)*w*.5,by=hy+Math.sin(fa)*w*.5,tx=hx+Math.cos(fa)*fl,ty=hy+Math.sin(fa)*fl;
  const nx=-Math.sin(fa)*w*.28,ny=Math.cos(fa)*w*.28,cx=tx-Math.sin(fa)*w*.5*side,cy=ty+Math.cos(fa)*w*.5*side;
  g.beginPath();g.moveTo(bx+nx,-(by+ny));g.quadraticCurveTo(cx,-cy,tx,-ty);g.lineTo(bx-nx,-(by-ny));g.closePath();g.fill();g.stroke();
 }
 if(hot>0){add(g,P.amber,hx,hy,.45+.6*hot,.4+.5*hot);}
}
// The halo: a ring of choir spokes behind the skull. c: 0 cyan (the boss's light) .. 1 amber (yours now).
function halo(g,x,y,r,c,t,pulse){
 const col=mix(P.cyan,P.amber,c),hot=mix(P.cyanHot,P.amberHot,c);
 add(g,col,x,y,r*2.1,.3+.35*pulse);
 g.globalCompositeOperation='lighter';
 g.strokeStyle=css(col,.9);g.lineWidth=.1;g.beginPath();g.arc(x,-y,r,0,TAU);g.stroke();
 g.strokeStyle=css(hot,.5);g.lineWidth=.035;g.beginPath();g.arc(x,-y,r*.78,0,TAU);g.stroke();
 for(let i=0;i<14;i++){const a=i/14*TAU+t*.006;g.strokeStyle=css(col,.55+.3*pulse);g.lineWidth=.045;g.beginPath();g.moveTo(x+Math.cos(a)*r*.84,-(y+Math.sin(a)*r*.84));g.lineTo(x+Math.cos(a)*r*(1.16+.12*pulse),-(y+Math.sin(a)*r*(1.16+.12*pulse)));g.stroke();}
 g.globalCompositeOperation='source-over';
}
// The veil of shed wing-scales, hanging from the mask's crest over the lower face (horns and eyes stay out).
function veil(g,x,y,dir,S,t,open){
 const w=S*.07,top=y-S*.015;
 for(let c=0;c<7;c++){
  const sx0=x+dir*S*.01+(c-3)*w*.32,len=3+(c%3===1?1:0),sway=Math.sin(t*.04+c*.9)*.025;
  for(let row=0;row<len;row++){
   const shim=.5+.5*Math.sin(t*.08+row*.9+c*1.7),fall=open*row*.08;
   const sx=sx0+sway*row+((c*7+row*3)%5-2)*.006,sy=top-row*S*.028-fall;
   g.fillStyle=css(mix(SILVER,P.ivory,shim*.6),.62+.25*((c+row)%2));
   g.beginPath();g.ellipse(sx,-sy,S*.011,S*.019,0,0,TAU);g.fill();
   if(shim>.93)add(g,'#ffffff',sx,sy,.1,.45);
  }
 }
}
// The drowned crimson robes: the tribe cloth worn as the choir-saint's robe, soaked dark at the hem, scales caught in it.
function robe(g,x,y,dir,S,t,sway,back){
 const top=y+S*.47,hem=y+S*.08,wt=S*.13,wb=S*.24;
 g.save();g.translate(x,0);g.scale(dir,1);
 const gr=g.createLinearGradient(0,-top,0,-hem);
 gr.addColorStop(0,back?P.crimsonDeep:P.crimson);gr.addColorStop(.65,back?P.crimsonDeep:mix(P.crimson,P.crimsonDeep,.5));gr.addColorStop(1,mix(P.crimsonDeep,'#07060f',.45));
 g.fillStyle=gr;g.strokeStyle=css(P.outline,1);g.lineWidth=.04;
 g.beginPath();g.moveTo(-wt,-top);g.quadraticCurveTo(-wb*1.05,-(top+hem)/2,-wb-sway*.4,-hem);
 for(let i=0;i<8;i++){const u=i/7,hx=lerp(-wb,wb,u)-sway*(.4-.3*u);g.lineTo(hx+.05,-(hem-.12-.07*Math.sin(i*2.1+t*.05)));g.lineTo(hx+.1,-hem);}
 g.quadraticCurveTo(wb*1.05,-(top+hem)/2,wt,-top);g.closePath();g.fill();g.stroke();
 if(!back){
  // Folds, a sash over the hip (its tail streams behind), drips and caught scales.
  g.strokeStyle=css(P.crimsonDeep,.7);g.lineWidth=.03;
  for(let i=-1;i<=1;i++){g.beginPath();g.moveTo(i*wt*.5,-(top-.1));g.quadraticCurveTo(i*wb*.5,-(top+hem)/2,i*wb*.8-sway*.2,-(hem+.05));g.stroke();}
  g.fillStyle=css(P.crimsonLight,.9);g.beginPath();g.moveTo(-wt*1.1,-(top+.02));g.lineTo(wt*1.1,-(top-.05));g.lineTo(wt*1.05,-(top-.2));g.lineTo(-wt*1.15,-(top-.14));g.closePath();g.fill();
  g.fillStyle=css(P.crimson,.95);g.beginPath();g.moveTo(-wt,-(top-.1));g.quadraticCurveTo(-wt-.35-sway,-(top-.4),-wt-.25-sway*1.4,-(top-.95+.05*Math.sin(t*.07)));g.lineTo(-wt-.1-sway,-(top-.9));g.quadraticCurveTo(-wt-.15,-(top-.4),-wt+.1,-(top-.12));g.closePath();g.fill();
  g.strokeStyle=css(MIST,.35);g.lineWidth=.02;
  for(let i=0;i<4;i++){const dx=lerp(-wb*.8,wb*.8,i/3),ph=(t*.02+i*.37)%1;g.beginPath();g.moveTo(dx,-(hem+.02));g.lineTo(dx,-(hem-.06-ph*.25));g.stroke();}
  for(let i=0;i<6;i++){const sx=lerp(-wb*.7,wb*.7,((i*37)%11)/10),sy=lerp(hem+.1,top-.15,((i*53)%7)/6),sh=.5+.5*Math.sin(t*.09+i*1.3);
   g.fillStyle=css(mix(SILVER,P.ivory,sh),.55+.35*sh);g.beginPath();g.ellipse(sx,-sy,.035,.055,.4,0,TAU);g.fill();}
 }
 g.restore();
}
// The four extra arms' rest poses and Flurry strikes: [shoulder dy (of S), shoulder dx (of S, + forward), back layer].
// The front pair grows from the robe's shoulders at the flanks, so the chest stays the Brute's.
const EXTRA=[[.7,-.1,true],[.66,.06,true],[.56,-.13,false],[.53,.15,false]];
function extraArms(g,p,h,x,y,dir,S,t,flash,layer){
 const move=h.move;
 for(let i=0;i<4;i++){
  const [dy,dx,back]=EXTRA[i];if(back!==(layer==='behind'))continue;
  const sx=x+dir*dx*S,sy=y+dy*S,up=i<2,side=i%2?1:-1,sw=Math.sin(t*.035+i*1.7)*.12;
  // Rest: the upper pair raised in a fan about the halo, the lower pair spread low (the saint's six-armed silhouette).
  let hx=x+dir*side*S*(up?.36:.42)+dir*sw*.5,hy=y+(up?S*1.02:S*.42)+sw,hot=0;
  if(move==='flurry'){
   const n=i+2,at=M.flurry.hits[n],k=h.f-at,A=M.flurry.active;
   if(k>=-3&&k<A+5){const q=k<0?ease(clamp((k+3)/3))*.3:k<A?out(clamp((k+1)/A)):1-ease(clamp((k-A)/5));
    hx=lerp(hx,x+dir*FLURRY[n][1],q);hy=lerp(hy,y+FLURRY[n][0],q);hot=k>=0&&k<A+2?1:0;}
   else{hx=lerp(hx,x+dir*S*.2,.25);}
  }else if(move==='image'){
   // The arms rise like the reflection's: palms up, then down as it strikes.
   const q=ease(clamp(h.f/M.image.startup));hy=lerp(hy,y+S*(up?1.1:.8),q);hx=lerp(hx,x+dir*S*(.3+.12*i),q);hot=h.f>=M.image.startup&&h.f<M.image.startup+M.image.active?1:0;
  }else if(move==='hymn'){
   const q=ease(clamp(h.f/M.hymn.startup));hy=lerp(hy,y+S*(up?1.12:.92),q);hx=lerp(hx,x+side*S*(up?.5:.62),q);hot=h.f>=M.hymn.startup&&h.f<M.hymn.startup+6?1:0;
  }else if(move==='grasp'){
   const q=ease(clamp(h.f/6));hy=lerp(hy,y+S*.15,q);hx=lerp(hx,x+dir*S*(.25+.06*i),q);
  }
  arm(g,sx,sy,hx,hy,S*.062,up?1:-1,hot,flash,t,i);
  if(hot&&move==='flurry'){
   // The strike streak: an amber blade of air from the shoulder to the hand.
   g.globalCompositeOperation='lighter';g.fillStyle=css(P.amber,.32);taper(g,sx,sy,hx,hy,.05,.16);g.fill();g.globalCompositeOperation='source-over';
  }
 }
}
// The Flurry's other two arms are the Brute's own: their punches get the same streak and hand flare.
function flurryStreaks(g,h,x,y,dir){
 if(h.move!=='flurry')return;
 for(const n of [0,1]){
  const k=h.f-M.flurry.hits[n];if(k<0||k>=M.flurry.active+3)continue;
  const q=1-k/(M.flurry.active+3),[hy,reach]=FLURRY[n],hx=x+dir*reach;
  g.globalCompositeOperation='lighter';g.fillStyle=css(P.amber,.4*q);taper(g,x+dir*.4,y+2,hx,y+hy,.05,.18*q+.04);g.fill();g.globalCompositeOperation='source-over';
  add(g,P.amberHot,hx,y+hy,.5+.4*q,.6*q);
 }
 // A ring of afterimages: every arm that already struck this Flurry leaves a fading amber arc at its mark.
 for(let n=0;n<6;n++){
  const k=h.f-M.flurry.hits[n];if(k<0||k>14)continue;
  const q=1-k/14,[hy,reach]=FLURRY[n];
  g.globalCompositeOperation='lighter';g.strokeStyle=css(P.amberHot,.7*q);g.lineWidth=.07*q+.02;
  g.beginPath();g.arc(x+dir*(reach-.4),-(y+hy),.55+.25*(1-q),dir>0?-.9:Math.PI-.9,dir>0?.9:Math.PI+.9);g.stroke();g.globalCompositeOperation='source-over';
 }
}

// drawAntiphonForm(ctx, p, A): the saint's parts around the drawn Brute rig. A: {x,y} feet (interpolated), dir, frame,
// layer ('behind' | 'front'; omitted draws both), S (drawn height in tiles), head ([x,y] of the mask, estimated if absent),
// c (halo colour, 0 cyan .. 1 amber; 1 when worn).
export function drawAntiphonForm(g,p,A={}){
 const h=p.choir||{},x=A.x??p.x,y=A.y??p.y,dir=A.dir??(p.facing<0?-1:1),t=A.frame??0,S=A.S||formVisual(ID,'brawler');
 const flash=p.flash>0,layer=A.layer,back=layer!=='front',front=layer!=='behind',head=A.head||[x+dir*S*.04,y+S*.93];
 const pulse=h.move==='hymn'?1-clamp(Math.abs(h.f-M.hymn.startup)/10):h.move==='image'?.5*clamp(h.f/M.image.startup):0;
 const sway=clamp((p.vx||0)*dir*4,-.3,.3);
 if(back){
  // Behind the crest, not the face: the sheet's head socket sits at the mask's muzzle, low and forward.
  halo(g,head[0]-dir*S*.14,head[1]+S*.2,S*.3,A.c??1,t,pulse);
  robe(g,x-dir*.05,y,dir,S,t,sway,true);
  extraArms(g,p,h,x,y,dir,S,t,flash,'behind');
 }
 if(!front)return;
 robe(g,x,y,dir,S,t,sway,false);
 extraArms(g,p,h,x,y,dir,S,t,flash,'front');
 veil(g,head[0],head[1],dir,S,t,h.move==='hymn'?pulse:0);
 flurryStreaks(g,h,x,y,dir);
}

// The TRUE IMAGE under the feet: the six-armed saint upside down in the mirror, aubergine and bone with an amber halo,
// at reflection strength. It shows the truth of every move (its arms strike when the Flurry does; it surges in True Image).
// y: the floor line under the hunter (the mirror), lift: the feet's height above it (a jump sinks the image as deep).
function trueImage(g,p,x,y,lift,dir,S,t,sink){
 const h=p.choir||{};
 // Mirrored about the floor line and foreshortened (the mere's surface seen at a low angle), so the whole saint shows;
 // clipped to the floor, so it never shows above the surface.
 g.save();g.beginPath();g.rect(x-S*3,-y,S*6,S*3);g.clip();
 g.translate(0,-y);g.scale(1,-MIRROR);g.translate(0,y);
 g.globalAlpha=.55;
 // The body: robe, chest, horned crest mask (the Brute's silhouette, the saint's colours).
 const by=y+lift+sink,gr=g.createLinearGradient(x-S*.25,0,x+S*.25,0);gr.addColorStop(0,P.furDeep);gr.addColorStop(.5,P.fur);gr.addColorStop(1,P.furDeep);
 g.fillStyle=gr;g.beginPath();g.moveTo(x-S*.22,-by);g.quadraticCurveTo(x-S*.2,-(by+S*.5),x-S*.12,-(by+S*.78));g.lineTo(x+S*.12,-(by+S*.78));g.quadraticCurveTo(x+S*.2,-(by+S*.5),x+S*.22,-by);g.closePath();g.fill();
 g.strokeStyle=css(SILVER,.8);g.lineWidth=.05;g.stroke();
 g.fillStyle=css(P.bone,1);g.beginPath();g.ellipse(x+dir*S*.03,-(by+S*.88),S*.075,S*.1,0,0,TAU);g.fill();
 g.strokeStyle=css(P.bone,1);g.lineWidth=S*.022;g.lineCap='round';
 for(const s of [-1,1]){g.beginPath();g.moveTo(x+s*S*.05,-(by+S*.95));g.quadraticCurveTo(x+s*S*.16,-(by+S*1.02),x+s*S*.12,-(by+S*1.12));g.stroke();}
 g.globalAlpha=.5;
 // Six arms, every one real.
 for(let i=0;i<6;i++){
  const side=i%2?1:-1,up=i<2?1:i<4?.6:.25,sx=x+side*S*.1,sy=by+S*(.6+.08*up);
  let hx=x+side*S*(.3+.12*(2-Math.floor(i/2))),hy=by+S*(.3+.75*up)+Math.sin(t*.04+i)*.1,hot=0;
  if(h.move==='flurry'){const k=h.f-M.flurry.hits[i];if(k>=0&&k<M.flurry.active+3){hx=x+dir*FLURRY[i][1];hy=by+FLURRY[i][0];hot=1;}}
  else if(h.move==='image'&&h.f>=M.image.startup*.5){const q=out(clamp((h.f-M.image.startup*.5)/(M.image.startup*.5)));hx=lerp(hx,x+dir*(M.image.box.x0+(i+.5)*(M.image.box.x1-M.image.box.x0)/6),q);hy=lerp(hy,by+.5,q);hot=q;}
  arm(g,sx,sy,hx,hy,S*.045,1,hot,false,t,i);
 }
 g.globalAlpha=1;
 halo(g,x-dir*S*.06,by+S*1,S*.26,1,t,h.move==='hymn'?1:0);
 add(g,P.amberHot,x+dir*S*.06,by+S*.88,.25,.5);
 g.restore();
 // The mirror's surface: a silver sheen and slow ripples along the floor line.
 g.globalCompositeOperation='lighter';
 for(let i=0;i<3;i++){const w=S*(.42+.16*i)+Math.sin(t*.05+i)*.08;g.strokeStyle=css(SILVER,.22-.05*i);g.lineWidth=.03;g.beginPath();g.ellipse(x,-(y-.08-i*.18),w,.05+.02*i,0,0,TAU);g.stroke();}
 g.globalCompositeOperation='source-over';
}

// World effects of a worn Antiphon: the Hymn's rings, the True Image rising, the Grasp's arm, enemies pinned.
export function drawAntiphonWorld(g,state,p,alpha=1,frame=0){
 const h=p.choir;if(!h)return;
 const frozen=state.hitStop>0||state.phase!=='playing',a=frozen?1:alpha,W=M.hymn,y0=p.py+(p.y-p.py)*alpha,x0=p.px+(p.x-p.px)*alpha,dir=p.facing<0?-1:1;
 for(const k of h.waves){
  const x=k.x-k.dir*W.speed*(1-a),fade=1-k.travel/W.range,r=W.box.h*.5;
  g.globalCompositeOperation='lighter';
  for(let j=0;j<3;j++){const bx=x-k.dir*j*.5;g.strokeStyle=css(j?P.amber:P.amberHot,(.95-.25*j)*fade);g.lineWidth=.13-.03*j;g.beginPath();g.ellipse(bx,-(k.y+r),r*.42,r,0,0,TAU);g.stroke();}
  add(g,P.amber,x,k.y+r,1.3,.65*fade);
  g.globalCompositeOperation='source-over';
 }
 if(h.move==='image'){
  // The reflection gathers under the floor ahead (startup: a widening amber shimmer), then its six arms break through.
  const m=M.image,b=m.box,fl=y0;
  if(h.f<m.startup){
   const q=h.f/m.startup;g.globalCompositeOperation='lighter';
   for(let i=0;i<6;i++){const cx=x0+dir*(b.x0+(i+.5)*(b.x1-b.x0)/6);g.strokeStyle=css(P.amber,.25+.55*q);g.lineWidth=.05;g.beginPath();g.ellipse(cx,-(fl+.02),.2+.35*q,.05+.04*q,0,0,TAU);g.stroke();add(g,P.amber,cx,fl,.3+.4*q,.3*q);}
   g.globalCompositeOperation='source-over';
  }else{
   const k=h.f-m.startup,rise=k<m.active?out(clamp((k+1)/m.active)):1-ease(clamp((k-m.active)/(m.total-m.startup-m.active)));
   for(let i=0;i<6;i++){
    const cx=x0+dir*(b.x0+(i+.5)*(b.x1-b.x0)/6),top=fl+(b.y1-.3)*rise*(.75+.25*Math.sin(i*2.3));
    arm(g,cx-dir*.15,fl-.4,cx+dir*.1,top,.18,1,k<m.active?1:.3,false,frame,i);
    g.globalCompositeOperation='lighter';g.fillStyle=css(P.amber,.18*rise);g.fillRect(cx-.35,-top,.7,top-fl);g.globalCompositeOperation='source-over';
   }
   g.globalCompositeOperation='lighter';g.strokeStyle=css(MIST,.5*rise);g.lineWidth=.04;
   g.beginPath();g.ellipse(x0+dir*(b.x0+b.x1)/2,-(fl+.03),(b.x1-b.x0)/2,.1,0,0,TAU);g.stroke();g.globalCompositeOperation='source-over';
  }
 }
 if(h.move==='grasp'){
  // The arm rises from the floor under its mark (h.gb), exactly the sim's strike box.
  const m=M.grasp,gx=h.gx,fl=h.gb??y0;
  if(h.f<m.dive){
   // The mark: a ripple closing on the target (the arm travels under the floor, in the reflection).
   const q=h.f/m.dive;g.globalCompositeOperation='lighter';g.strokeStyle=css(P.amber,.35+.5*q);g.lineWidth=.05;
   g.beginPath();g.ellipse(gx,-(fl+.02),.3+(1-q)*1.4,.06+(1-q)*.15,0,0,TAU);g.stroke();add(g,P.amber,gx,fl,.5,.3+.4*q);g.globalCompositeOperation='source-over';
  }else{
   // As tall as the sim's strike box: up to the mark's head (h.gy), a flier included.
   const k=h.f-m.dive,rise=k<4?out(clamp((k+1)/4)):1-ease(clamp((k-4)/(m.total-m.dive-4))),top=fl+(h.gy||m.box.y1)*rise;
   arm(g,gx+.3,fl-.6,gx,top,.22,1,k<6?1:.3,false,frame,9);
   g.globalCompositeOperation='lighter';g.strokeStyle=css(MIST,.6*rise);g.lineWidth=.05;g.beginPath();g.ellipse(gx,-(fl+.03),.8,.12,0,0,TAU);g.stroke();g.globalCompositeOperation='source-over';
  }
 }
 for(const e of state.enemies||[]){
  if(!(e.pinUntil>state.frame)||e.dead)continue;
  const k=clamp((e.pinUntil-state.frame)/M.grasp.pin),x=e.px+(e.x-e.px)*alpha,y=e.py+(e.y-e.py)*alpha;
  // Pinned: an ivory hand from the mirror closed round its legs, amber at the knuckles.
  g.strokeStyle=css(P.bone,.9*k+.1);g.lineWidth=.08;g.lineCap='round';
  for(let i=0;i<4;i++){const sx=x+(i-1.5)*e.w*.32;g.beginPath();g.moveTo(sx,-(y-.05));g.quadraticCurveTo(sx+(i<2?-.12:.12),-(y+e.h*.25),x+(i-1.5)*.05,-(y+e.h*(.35+.04*i)));g.stroke();}
  add(g,P.amber,x,y+e.h*.3,.6,.5*k);
 }
}

// Brute clips for the Antiphon's sim state (frame data stays authoritative): the Flurry cycles the three punches.
function clip(e){
 const h=e.choir||{};
 if(h.move==='flurry'){const n=Math.max(0,h.hit),at=M.flurry.hits[n],len=n<5?M.flurry.hits[n+1]-at:M.flurry.total-at;return [['punch1','punch2','punch3'][n%3],clamp((h.f-at)/len)];}
 if(h.move==='image')return ['block',null];
 if(h.move==='hymn')return ['blast',clamp(h.f/M.hymn.total)];
 if(h.move==='grasp')return h.f<M.grasp.dive?['dodge',clamp(h.f/M.grasp.dive)*.5]:['block',null];
 return [e.clip==='flurry'||e.clip==='image'||e.clip==='hymn'||e.clip==='grasp'?'idle':e.clip||'idle',null];
}
const proxies=new WeakMap();
// A render-only stand-in for the hunter: the Brute rig with no form (it inherits every live field of the player).
function proxyOf(e){let q=proxies.get(e);if(!q){q=Object.create(e);proxies.set(e,q);}return q;}
const SOCKETS=['head','back','hand','chest','tail','legs'],anchorsByHunter=new WeakMap(),heads=new WeakMap();
function moultsOf(e){let a=anchorsByHunter.get(e);if(!a){a={valid:false,scale:1,dir:1};anchorsByHunter.set(e,a);}return a;}
function guess(n,x,y,dir,S){
 const w=S*.4;
 return n==='head'?[x+dir*w*.1,y+S*.95]:n==='back'?[x-dir*w*.3,y+S*.72]:n==='hand'?[x+dir*w*.65,y+S*.5]:
  n==='chest'?[x+dir*w*.15,y+S*.62]:n==='legs'?[x+dir*w*.05,y+S*.03]:[x-dir*w*.45,y+S*.35];
}
// The floor line under (x, y): the top of the first solid, platform or slope tile below the feet; null over a pit.
function floorUnder(L,x,y){
 const c=Math.floor(x);if(!L?.grid)return null;
 for(let r=Math.min(L.grid.length-1,Math.floor(y+.01)-1);r>=0;r--){const t=L.grid[r]?.[c];if(t===1||t===2||t===3||t===4)return r+1;}
 return null;
}
// The Grasp's dive: the body sinks into its reflection, clipped at the floor line.
const sinkOf=h=>h.move!=='grasp'?0:h.f<M.grasp.dive?ease(clamp(h.f/(M.grasp.dive*.6))):1-ease(clamp((h.f-M.grasp.dive-4)/(M.grasp.total-M.grasp.dive-4)));
// The whole Antiphon for the View: world effects, the true image, behind layer, the amber Brute (sheet or procedural,
// 2.1x), front layer.
export function drawAntiphonFormEntity(view,g,state,e,frame,alpha,load=true){
 const x=e.px+(e.x-e.px)*alpha,y=e.py+(e.y-e.py)*alpha,dir=e.facing<0?-1:1,S=formVisual(ID,'brawler'),k=S/BRUTE;
 if(!e.form){drawShift(view,g,e,frame,alpha,load,x,y,dir,S);return;}
 drawAntiphonWorld(g,state,e,alpha,frame);
 // The mirror is the floor under the hunter: the true image and the Grasp's dive belong to it, not to the feet in the air.
 const fy=floorUnder(state.level,x,y),lift=fy===null?0:Math.max(0,y-fy),h=e.choir||{},sink=sinkOf(h)*S*.55*clamp(1-lift/1.2);
 // The true image stands under the feet whenever the hunter is on (or just above) the floor.
 if(fy!==null&&lift<S)trueImage(g,e,x,fy,lift,dir,S,frame,sink);
 // The hurt blink hides the body only; never during a move: the shape is the cue.
 if(e.inv&&!e.dead&&!h.move&&Math.floor(frame/V.blinkFrames)%2)return;
 g.save();
 if(sink>0){const top=fy??y;g.beginPath();g.rect(x-S*2,-(top+S*2.5),S*4,S*2.5);g.clip();g.translate(0,sink);}
 const MA=moultsOf(e),moults=!!e.moults?.length,A={x,y,dir,frame,S,layer:'behind',head:null};
 const entry=manifest.sprites?.brawler;
 if(load&&entry)view.atlas.load('brawler',entry);
 const atlas=view.atlas.get('brawler'),[name,progress]=clip(e),q=proxyOf(e),mv=MOVES[name];
 Object.assign(q,{form:null,formShift:0,formNext:null,kind:'brawler',emberMax:0,echoFlash:0,facing:dir,
  move:mv&&progress!==null?name:null,moveFrame:mv&&progress!==null?progress*mv.total*.999:0,clip:name});
 // The mask's place (the sheet's head socket, kept from the last drawn frame, relative to the feet) for the halo and
 // the veil; estimated on the procedural rig.
 const hd=heads.get(e);A.head=atlas&&hd&&hd[2]===dir?[x+hd[0],y+hd[1]]:guess('head',x,y,dir,S);
 drawAntiphonForm(g,e,A);
 if(moults&&MA.valid)drawMoults(g,e,MA,frame,'behind');
 if(atlas){
  q.h=e.h;q.w=e.w;
  const opts={sprite:(sx,sy,d,scale,n,pr,fl)=>{
   const f=spriteFrame(atlas,q,n,pr,frame,sx,k);
   drawSprite(g,atlas,f.frame,sx,sy,d,k,fl,1.4);
   // A light amber wash only: the Brute's purple fur and its mask must stay readable through it.
   if(!fl)drawTint(g,atlas,f.frame,sx,sy,d,k,.14);
   const hs=socket(atlas,f.frame,'head',sx,sy,d,k);if(hs){A.head=hs;heads.set(e,[hs[0]-sx,hs[1]-sy,d]);}
   if(moults)for(const n2 of SOCKETS)MA[n2]=socket(atlas,f.frame,n2,sx,sy,d,k)||guess(n2,sx,sy,d,S);
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
 A.layer='front';drawAntiphonForm(g,e,A);
 if(moults){MA.scale=k*.8;MA.valid=true;drawMoults(g,e,MA,frame,'front');}
 g.restore();
}
const shifting=new WeakMap();
// The 20f transformation: the hunter's own body (its mask cracking) while the six arms unfold around it and the halo
// lights, cyan first (the boss's light), then amber (yours).
function drawShift(view,g,e,frame,alpha,load,x,y,dir,S){
 let q=shifting.get(e);if(!q){q=Object.create(e);q.formNext=null;shifting.set(e,q);}
 const A=view.anchorsOf(q),o=view.opts,moults=!!e.moults?.length;
 if(moults&&A.valid)drawMoults(g,e,A,frame,'behind');
 o.sprite=view.spriteFor(q,load,g,frame,A,alpha);o.anchors=A;o.low=!!view.mobile;
 view.chars.draw(g,q,frame,alpha,o);
 A.x=x;A.y=y;A.valid=true;
 if(moults)drawMoults(g,e,A,frame,'front');
 const k=ease(clamp(1-e.formShift/POSSESSION.shift));
 g.globalAlpha=.3+.6*k;
 drawAntiphonForm(g,e,{x,y,dir,frame,S:S*(.35+.65*k),c:k});
 g.globalAlpha=1;
 g.globalCompositeOperation='lighter';g.strokeStyle=css(mix(P.cyanHot,P.amberHot,k),.9*(1-k));g.lineWidth=.08;
 g.beginPath();g.arc(x,-(y+e.h*.8),.3+k*S*.5,0,TAU);g.stroke();g.globalCompositeOperation='source-over';
}
// The look a future FORM_LOOKS registry can take: the Brute sheet, tinted amber, scaled from its authored height.
export const ANTIPHON_LOOK={draw:drawAntiphonForm,tint:'amber',sheetH:BRUTE,sheet:'brawler'};
