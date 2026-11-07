import {css,mix,P} from './color.js';
import {glow} from './surface.js';
import {spriteFrame,drawSprite,drawTint,socket} from './sprites.js';
import {drawMoults} from './overlays.js';
import {KINDS} from '../data/kinds.js';
import {MOVES} from '../data/moves.js';
import {formVisual,POSSESSION} from '../data/forms.js';
import {BLOOM,BLOOM_ID} from '../data/crowned-bloom.js';
import {manifest} from '../ui/assets.js';
import {VISUALS as V} from '../data/visuals.js';

// Rules-v5 possession look: THE CROWNED BLOOM (Cordycea's mask). The Brute rig (its sheet, or the procedural hero) drawn
// 2.3x with a light amber wash, overgrown: huge branching fungal ANTLERS burst from the crested skull mask (the crown,
// the boss's signature piece), a gilled cap frill behind the mask like the crown's own, a spine-mane of fruiting
// stalks down the back, AMBER gills under the arms (the boss's cyan light is yours now), and the crimson tribe cloth
// worn as a mantle and sash spotted with pale fungus. The garden it grows (spores, stalks, caps, the pillar, the risen
// husks, the nova) is drawn from e.bloom only. 0 bytes of art. World units, y up (canvas y = -y).
export {BLOOM_ID};
const TAU=Math.PI*2,M=BLOOM.moves,SOW=M.sow,PL=M.pillar,N=M.nova,C=M.call,HK=C.husk;
const clamp=(v,a=0,b=1)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,ease=t=>t*t*(3-2*t);
const BRUTE=KINDS.brawler.height;
const add=g=>{g.globalCompositeOperation='lighter';},norm=g=>{g.globalCompositeOperation='source-over';};
function spot(g,color,x,y,r,a=1){const sp=glow(color);if(!sp||r<=0||a<=0)return;const o=g.globalAlpha;g.globalAlpha=o*Math.min(1,a);g.drawImage(sp,x-r,-y-r,r*2,r*2);g.globalAlpha=o;}
// The look a FORM_LOOKS registry can take: the Brute sheet, tinted amber, scaled from its authored height (sheetH).
export const BLOOM_LOOK={draw:drawBloom,tint:'amber',sheetH:BRUTE,sheet:'brawler'};

// Where the parts sit on the drawn body when the sheet does not report them (S: drawn height in tiles).
function guess(n,x,y,dir,S){
 const w=S*.4;
 return n==='head'?[x+dir*w*.1,y+S*.83]:n==='back'?[x-dir*w*.3,y+S*.68]:n==='hand'?[x+dir*w*.65,y+S*.5]:
  n==='chest'?[x+dir*w*.15,y+S*.6]:n==='legs'?[x+dir*w*.05,y+S*.03]:[x-dir*w*.45,y+S*.35];
}
const at=(A,n,x,y,dir,S)=>A?.[n]||guess(n,x,y,dir,S);

// One fungal antler: a branching stalk (bone over aubergine), each tip a small cap whose gills glow amber.
function branch(g,x,y,a,len,depth,w,t,k,tips){
 const sway=Math.sin(t*.035+depth*1.7+x)*.05;
 const x1=x+Math.cos(a+sway)*len,y1=y+Math.sin(a+sway)*len;
 g.strokeStyle=css(P.outline,1);g.lineWidth=w+.05;g.beginPath();g.moveTo(x,-y);g.quadraticCurveTo((x+x1)/2+Math.sin(a)*len*.12,-(y+y1)/2,x1,-y1);g.stroke();
 g.strokeStyle=css(depth>1?P.boneShade:P.bone,1);g.lineWidth=w;g.beginPath();g.moveTo(x,-y);g.quadraticCurveTo((x+x1)/2+Math.sin(a)*len*.12,-(y+y1)/2,x1,-y1);g.stroke();
 if(depth>0){
  branch(g,x1,y1,a+.48,len*.7,depth-1,w*.66,t,k,tips);
  branch(g,x1,y1,a-.42,len*.62,depth-1,w*.62,t,k,tips);
  // A mid-beam tine, as the crown's caps branch off its trunk.
  if(depth===2)branch(g,(x+x1)/2,(y+y1)/2,a-1.05,len*.42,0,w*.5,t,k,tips);
 }else tips.push(x1,y1,a);
}
function caps(g,tips,r,k,flash){
 for(let i=0;i<tips.length;i+=3){
  const x=tips[i],y=tips[i+1],a=tips[i+2]-Math.PI/2;
  g.save();g.translate(x,-y);g.rotate(-a);
  g.fillStyle=css(flash?P.ivory:P.bone,1);g.strokeStyle=css(P.outline,1);g.lineWidth=.03;
  g.beginPath();g.ellipse(0,0,r,r*.5,0,Math.PI,TAU);g.closePath();g.fill();g.stroke();
  g.strokeStyle=css(P.amberHot,.55+.4*k);g.lineWidth=.02;
  for(let j=-2;j<=2;j++){g.beginPath();g.moveTo(j*r*.3,0);g.lineTo(j*r*.38,r*.25);g.stroke();}
  g.restore();
  add(g);spot(g,P.amber,x,y,r*1.8,.35+.35*k);norm(g);
 }
}
function antler(g,hx,hy,dir,side,S,t,k,flash){
 const tips=[],far=side<0;
 // The beam rises from the mask's crest (never across its face), sweeps up and back, and forks: horns and a crown.
 const a=Math.PI/2+dir*(far?.62:.22);
 branch(g,hx-dir*S*(far?.1:.06),hy+S*.1,a,S*(far?.27:.31),3,S*(far?.042:.05),t,k,tips);
 caps(g,tips,S*.075,k,flash);
}
// The gilled cap frill behind the mask: a small copy of Cordycea's crown, its gills lit amber.
function frill(g,hx,hy,dir,size,t,k){
 g.save();g.translate(hx-dir*size*.16,-(hy+size*.2));g.scale(dir,1);g.rotate(-.35);
 g.fillStyle=css(mix(P.bone,P.boneShade,.4),1);g.strokeStyle=css(P.outline,1);g.lineWidth=.04;
 g.beginPath();g.ellipse(0,0,size*.42,size*.24,0,Math.PI,TAU);g.closePath();g.fill();g.stroke();
 g.strokeStyle=css(P.amberHot,.5+.4*k);g.lineWidth=.025;
 for(let i=-4;i<=4;i++){g.beginPath();g.moveTo(i*size*.08,0);g.lineTo(i*size*.1,size*.12);g.stroke();}
 g.restore();
 add(g);spot(g,P.amber,hx-dir*size*.08,hy+size*.02,size*.5,.3+.3*k);norm(g);
}
// The spine-mane: fruiting stalks down the back, leaning back, tallest at the shoulders.
function mane(g,bx,by,dir,S,t,k){
 for(let i=0;i<5;i++){
  const x=bx-dir*S*(.03+.06*i),y=by-S*(.03+.075*i),len=S*(.19-.024*i),a=Math.PI/2+dir*(.45+.16*i)+Math.sin(t*.04+i)*.05;
  const x1=x+Math.cos(a)*len,y1=y+Math.sin(a)*len;
  g.strokeStyle=css(P.boneShade,1);g.lineWidth=S*.022;g.lineCap='round';g.beginPath();g.moveTo(x,-y);g.quadraticCurveTo(x-dir*len*.25,-(y+len*.55),x1,-y1);g.stroke();
  g.save();g.translate(x1,-y1);g.rotate(-(a-Math.PI/2));
  g.fillStyle=css(P.bone,1);g.strokeStyle=css(P.outline,1);g.lineWidth=.03;
  g.beginPath();g.ellipse(0,0,S*.055,S*.03,0,Math.PI,TAU);g.closePath();g.fill();g.stroke();g.restore();
  add(g);spot(g,P.amber,x1,y1-S*.01,S*.05,.25+.3*k);norm(g);
 }
}
// The crimson tribe cloth as a mantle over the shoulders, its hem ragged, spotted with pale fungus and threaded with
// amber mycelium (the Brute's cloth, worn the way the garden wears the dead).
function mantle(g,bx,by,dir,S,t){
 const w=S*.26,h=S*.36,sw=Math.sin(t*.05)*S*.012;
 g.save();g.translate(bx,-by);g.scale(dir,1);g.rotate(-.3);
 const gr=g.createLinearGradient(0,-h*.2,0,h*.8);gr.addColorStop(0,P.crimsonLight);gr.addColorStop(.45,P.crimson);gr.addColorStop(1,P.crimsonDeep);
 g.fillStyle=gr;g.strokeStyle=css(P.crimsonDeep,1);g.lineWidth=.04;
 // Over the hump from the shoulder, down the back, a ragged hem.
 g.beginPath();g.moveTo(w*.35,-h*.02);g.quadraticCurveTo(-w*.05,-h*.32,-w*.62,-h*.08);
 g.quadraticCurveTo(-w*1.02+sw,h*.3,-w*.9+sw,h*.72);
 const hem=[[-.72,.62],[-.6,.8],[-.42,.64],[-.28,.84],[-.1,.66],[.05,.78],[.2,.58]];
 for(const [hx,hy] of hem)g.lineTo(w*hx+sw*(1-hy),h*hy);
 g.quadraticCurveTo(w*.42,h*.3,w*.35,-h*.02);g.closePath();g.fill();g.stroke();
 // Folds, amber mycelium threading the cloth, and pale caps fruiting from it.
 g.strokeStyle=css(P.crimsonDeep,.7);g.lineWidth=.035;
 for(const fx of [-.55,-.3,-.05]){g.beginPath();g.moveTo(w*fx,-h*.05);g.quadraticCurveTo(w*(fx-.08),h*.3,w*(fx-.04)+sw,h*.66);g.stroke();}
 g.strokeStyle=css(P.amber,.55);g.lineWidth=.018;
 g.beginPath();g.moveTo(-w*.6,h*.05);g.bezierCurveTo(-w*.3,h*.2,-w*.5,h*.4,-w*.15,h*.55);g.moveTo(-w*.2,-h*.1);g.quadraticCurveTo(-w*.05,h*.15,w*.12,h*.35);g.stroke();
 for(const [fx,fy,r] of [[-.45,.12,.07],[-.7,.45,.055],[-.2,.42,.06],[.12,.15,.045],[-.38,.68,.04]]){
  const cx=w*fx,cy=h*fy,R=S*r;
  g.strokeStyle=css(P.boneShade,1);g.lineWidth=R*.25;g.beginPath();g.moveTo(cx,cy+R*.2);g.lineTo(cx,cy-R*.35);g.stroke();
  g.fillStyle=css(P.bone,1);g.strokeStyle=css(P.outline,.8);g.lineWidth=.02;g.beginPath();g.ellipse(cx,cy-R*.35,R*.62,R*.34,0,Math.PI,TAU);g.closePath();g.fill();g.stroke();
  g.strokeStyle=css(P.amberHot,.7);g.lineWidth=.012;g.beginPath();g.moveTo(cx-R*.4,cy-R*.33);g.lineTo(cx+R*.4,cy-R*.33);g.stroke();
 }
 g.restore();
}
// The amber gills under the arm: a fan of lamellae that flares while the Spore Nova gathers.
function gills(g,cx,cy,dir,S,k,t){
 g.save();g.translate(cx,-cy);g.scale(dir,1);
 // A pale gill cap tucked under the arm, its lamellae lit amber.
 g.fillStyle=css(mix(P.bone,P.boneShade,.5),1);g.strokeStyle=css(P.outline,1);g.lineWidth=.03;
 g.beginPath();g.ellipse(0,0,S*.1,S*.05,-.25,Math.PI,TAU);g.closePath();g.fill();g.stroke();
 add(g);spot(g,P.amber,0,S*.02,S*(.14+.14*k),.55+.4*k);
 g.strokeStyle=css(P.amberHot,.6+.4*k);g.lineWidth=.03;
 for(let i=0;i<9;i++){const x=-S*.085+i*S*.021,d=S*(.045+.02*k)+Math.sin(t*.1+i)*.01;g.beginPath();g.moveTo(x,S*.005);g.lineTo(x+S*.004,d);g.stroke();}
 norm(g);g.restore();
}
// The crimson sash across the chest, a pale cap or two growing from it.
function sash(g,cx,cy,dir,S){
 g.save();g.translate(cx,-cy);g.scale(dir,1);
 g.fillStyle=css(P.crimson,.95);g.strokeStyle=css(P.crimsonDeep,1);g.lineWidth=.03;
 g.beginPath();g.moveTo(-S*.13,-S*.1);g.lineTo(-S*.07,-S*.13);g.lineTo(S*.11,S*.08);g.lineTo(S*.06,S*.11);g.closePath();g.fill();g.stroke();
 for(const [fx,fy] of [[-.06,-.07],[.05,.05]]){g.fillStyle=css(P.bone,1);g.beginPath();g.ellipse(S*fx,S*fy,S*.03,S*.018,0,Math.PI,TAU);g.fill();}
 g.restore();
}

// drawBloom(ctx, p, A): the overgrowth around the drawn Brute rig. A: {x,y} feet (interpolated), dir, frame, layer
// ('behind' | 'front'; omitted draws both), S (drawn height in tiles; formVisual by default), anchors (head, back,
// hand, chest as [x,y], from the sheet's sockets; estimated when absent).
export function drawBloom(g,p,A={}){
 const h=p.bloom||{},x=A.x??p.x,y=A.y??p.y,dir=A.dir??(p.facing<0?-1:1),t=A.frame??0,S=A.S||formVisual(BLOOM_ID,'brawler');
 const R=A.anchors,layer=A.layer,back=layer!=='front',front=layer!=='behind',flash=p.flash>0;
 const gather=h.move==='nova'&&h.f<N.startup?clamp(h.f/N.startup):0,burst=h.move==='nova'&&h.f>=N.startup?1-clamp((h.f-N.startup)/N.active):0;
 const k=clamp(.35+.25*Math.sin(t*.07)+gather+burst*.6+(h.move==='pillar'?.5:0));
 const [hx,hy]=at(R,'head',x,y,dir,S),[bx,by]=at(R,'back',x,y,dir,S),[cx,cy]=at(R,'chest',x,y,dir,S);
 if(back){
  frill(g,hx,hy,dir,S*.5,t,k);
  antler(g,hx,hy,dir,-1,S,t,k*.8,flash);
 }
 if(!front)return;
 // The crimson cloth draped over the hump as a mantle, the stalks of the mane bursting through it.
 mantle(g,bx-dir*S*.02,by-S*.04,dir,S,t);
 mane(g,bx,by,dir,S,t,k);
 antler(g,hx,hy,dir,1,S,t,k,flash);
 sash(g,cx-dir*S*.05,cy-S*.24,dir,S);
 gills(g,cx-dir*S*.1,cy-S*.14,dir,S,k,t);
 if(gather>0){
  // Spores drawn into the gills from all around: the Nova's tell.
  add(g);
  for(let i=0;i<10;i++){const a=i*TAU/10+t*.05,r=lerp(N.box.r*.8,.3,ease(gather));spot(g,P.amberHot,cx+Math.cos(a)*r,cy+Math.sin(a)*r*.7,.16,.7);}
  norm(g);
 }
 if(h.move==='sow'&&h.f>=SOW.startup-1&&h.f<SOW.startup+SOW.active+3){
  // The rake: an amber claw arc out to its reach, spores flung ahead.
  const q=clamp((h.f-SOW.startup+1)/(SOW.active+3)),b=SOW.box,r=b.x1*.9,yc=y+b.y1*.45;
  add(g);g.strokeStyle=css(P.amber,.85*(1-q*.6));g.lineWidth=.22*(1-q*.5);g.beginPath();
  const a0=dir>0?-2.1:Math.PI+2.1,a1=dir>0?lerp(-2.1,.5,ease(q)):lerp(Math.PI+2.1,Math.PI-.5,ease(q));
  g.arc(x,-yc,r*.6,Math.min(a0,a1),Math.max(a0,a1));g.stroke();
  g.strokeStyle=css(P.amberHot,.6*(1-q));g.lineWidth=.06;g.beginPath();g.arc(x,-yc,r*.6+.25,Math.min(a0,a1),Math.max(a0,a1));g.stroke();
  for(let i=0;i<5;i++)spot(g,P.amberHot,x+dir*(1+q*b.x1*.8+i*.35),yc+.4-q*1.2*(i%3)*.5,.13,.8*(1-q));
  norm(g);
 }
}

// The garden the Bloom grows: spores, stalks and caps, pillar ledges, the risen husks, the nova ring, the tunnel.
function stalkShape(g,x,base,top,w,col,edge){
 const hgt=top-base;if(hgt<=.02)return;
 g.fillStyle=col;g.beginPath();g.moveTo(x-w,-base);
 g.bezierCurveTo(x-w*.6,-(base+hgt*.5),x-w*.5,-(top-.2),x-w*.35,-top);g.lineTo(x+w*.35,-top);
 g.bezierCurveTo(x+w*.5,-(top-.2),x+w*.6,-(base+hgt*.5),x+w,-base);g.closePath();g.fill();
 if(edge){g.strokeStyle=edge;g.lineWidth=.05;g.stroke();}
}
function capShape(g,x,y,w,col,under,a=1){
 const o=g.globalAlpha;g.globalAlpha=o*a;
 g.fillStyle=col;g.beginPath();g.moveTo(x-w,-y+.02);g.bezierCurveTo(x-w*.9,-(y+.42),x+w*.9,-(y+.42),x+w,-y+.02);g.quadraticCurveTo(x,-(y-.28),x-w,-y+.02);g.fill();
 g.strokeStyle=css(P.outline,.8);g.lineWidth=.035;g.stroke();
 g.strokeStyle=under;g.lineWidth=.025;
 for(let i=-3;i<=3;i++){g.beginPath();g.moveTo(x+i*w*.12,-y+.05);g.lineTo(x+i*w*.2,-(y-.2));g.stroke();}
 g.fillStyle=css(P.boneRim,.55);g.beginPath();g.ellipse(x-w*.3,-(y+.26),w*.25,.06,-.15,0,TAU);g.fill();
 g.globalAlpha=o;
}
// A risen husk of the dead, raised amber: a hunched moth corpse with an ivory skull, a fruiting stalk, mycelium below.
function husk(g,a,frame){
 const rise=ease(clamp(a.f/18)),fade=clamp(a.life/30),f=a.dir,s=HK.h/3;
 const tell=a.tell>0?1-a.tell/HK.tell:0,strike=a.tell===0&&a.cd>HK.every-10?1-(a.cd-(HK.every-10))/10:0;
 g.save();g.globalAlpha=fade;g.translate(a.x,-a.y);g.scale(f*s,s);
 if(rise<1){g.beginPath();g.rect(-3,-5,6,5*rise+.02);g.clip();g.translate(0,(1-rise)*3.4);}
 g.strokeStyle=css(P.amber,.5);g.lineWidth=.03;
 for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(i*.28,0);g.quadraticCurveTo(i*.1,-.6,i*.05,-1.2);g.stroke();}
 add(g);spot(g,P.amber,0,1.6,1.7,.55);norm(g);
 g.fillStyle=css(mix(P.furLight,P.amberDeep,.3),1);g.fillRect(-.3,-.9,.14,.9);g.fillRect(.14,-.9,.14,.9);
 g.beginPath();g.moveTo(-.45,-.8);g.bezierCurveTo(-.7,-1.8,-.4,-2.6,.15,-2.8);g.bezierCurveTo(.6,-2.6,.65,-1.6,.4,-.8);g.closePath();g.fill();
 g.strokeStyle=css(P.amberHot,.9);g.lineWidth=.07;g.stroke();
 g.strokeStyle=css(P.amberHot,.8);g.lineWidth=.05;g.beginPath();g.moveTo(-.2,-1);g.lineTo(0,-1.8);g.lineTo(-.15,-2.4);g.stroke();
 g.fillStyle=css(mix(P.bone,P.amber,.35),.85);g.beginPath();g.moveTo(-.1,-2.5);g.lineTo(-1.05,-1.7);g.lineTo(-.85,-.9);g.lineTo(-.45,-1.2);g.closePath();g.fill();
 const hx=.3,hy=-2.95;
 g.fillStyle=css(P.bone,1);g.beginPath();g.ellipse(hx,hy,.3,.25,.2,0,TAU);g.fill();g.stroke();
 g.fillStyle=css(P.amberHot,1);g.beginPath();g.arc(hx+.12,hy-.02,.055,0,TAU);g.fill();
 g.strokeStyle=css(P.boneShade,1);g.lineWidth=.07;g.beginPath();g.moveTo(hx-.08,hy-.18);g.quadraticCurveTo(hx-.3,hy-.75,hx-.2+Math.sin(frame*.05+a.x)*.08,hy-1.1);g.stroke();
 g.fillStyle=css(P.bone,1);g.beginPath();g.ellipse(hx-.2+Math.sin(frame*.05+a.x)*.08,hy-1.12,.3,.14,0,Math.PI,TAU);g.fill();
 // Arms: raised in the tell, slammed forward on the strike.
 const ang=tell>0?lerp(.6,-2.4,tell):strike>0?lerp(-2.4,1.1,Math.min(1,strike*2)):.6,sx=.4,sy=-2.25;
 const ex=sx+Math.cos(ang)*.9,ey=sy+Math.sin(ang)*.9,cx=ex+Math.cos(ang+.3)*.8,cy=ey+Math.sin(ang+.3)*.8;
 g.strokeStyle=css(mix(P.furLight,P.amberDeep,.35),1);g.lineWidth=.2;g.beginPath();g.moveTo(sx,sy);g.lineTo(ex,ey);g.lineTo(cx,cy);g.stroke();
 g.strokeStyle=css(P.amberHot,1);g.lineWidth=.06;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+Math.cos(ang+.6)*.35,cy+Math.sin(ang+.6)*.35);g.moveTo(cx,cy);g.lineTo(cx+Math.cos(ang)*.4,cy+Math.sin(ang)*.4);g.stroke();
 g.restore();
 add(g);spot(g,P.amber,a.x+f*.35*s,a.y+2.9*s,.4,.45*fade*rise);
 if(strike>0&&strike<1){g.strokeStyle=css(P.amber,.8*(1-strike));g.lineWidth=.1;g.beginPath();g.arc(a.x,-(a.y+1.1),HK.reach*.8,f>0?-1.2:Math.PI-.3,f>0?.3:Math.PI+1.2);g.stroke();}
 norm(g);
}
export function drawBloomWorld(g,state,p,alpha=1,frame=0){
 const h=p.bloom;if(!h)return;
 const st=SOW.stalk,cw=SOW.cap.w/2;
 for(const k of h.stalks){
  const top=k.y+st.h;
  if(k.st===0){
   // The spore swells for 30f: an amber bulge, a ring tightening to the stalk's width, its column drawn faintly.
   const q=1-k.t/SOW.delay;
   g.fillStyle=css(mix(P.furDeep,P.amberDeep,.4*q),.95);g.beginPath();g.ellipse(k.x,-k.y,.3+.4*q,.08+.22*q,0,Math.PI,TAU);g.fill();
   add(g);spot(g,P.amber,k.x,k.y+.15,.5+.8*q,.3+.5*q);
   g.strokeStyle=css(P.amberHot,.3+.6*q);g.lineWidth=.04;g.beginPath();g.ellipse(k.x,-k.y,lerp(1.5,st.w/2,q),.26-.14*q,0,0,TAU);g.stroke();
   g.strokeStyle=css(P.amber,.06+.25*q);g.setLineDash?.([.2,.16]);g.beginPath();g.moveTo(k.x-st.w/2,-k.y);g.lineTo(k.x-st.w/2,-top);g.moveTo(k.x+st.w/2,-k.y);g.lineTo(k.x+st.w/2,-top);g.stroke();g.setLineDash?.([]);
   norm(g);
  }else if(k.st===1){
   const q=ease(1-k.t/st.erupt),tt=lerp(k.y,top,Math.min(1,q*1.4));
   add(g);g.fillStyle=css(P.amberHot,.38*(1-q*.5));g.fillRect(k.x-st.w/2,-top,st.w,st.h);norm(g);
   stalkShape(g,k.x,k.y,tt,.28,css(P.boneShade,1),css(P.amberHot,1));capShape(g,k.x,tt,lerp(.35,cw,q),css(P.bone,1),css(P.amber,.95));
   add(g);spot(g,P.amberHot,k.x,(k.y+top)/2,1.4,.75*(1-q*.5));spot(g,P.amber,k.x,tt,1.1,.7);norm(g);
  }else{
   const rot=k.st===3?1-k.t/SOW.cap.rot:0,blink=k.st===2&&k.t<60&&Math.floor(frame/5)%2;
   stalkShape(g,k.x+Math.sin(frame*.02+k.x)*.03*(1-rot),k.y,top-.05-rot*.5,.24,css(mix(P.boneShade,'#3a2e28',rot),1),null);
   capShape(g,k.x,top-rot*.5,cw-.1*rot,css(mix(P.bone,'#5a4a3a',rot),1),css(blink?P.ash:P.amber,.75*(1-rot)),blink?.6:1-rot*.6);
   if(!rot){add(g);spot(g,P.amber,k.x,top-.15,.7,.25+.08*Math.sin(frame*.06+k.x));norm(g);}
  }
 }
 for(const l of h.ledges){
  const rot=l.life<=0?clamp(-l.life/SOW.cap.rot):0,blink=l.life>0&&l.life<50&&Math.floor(frame/5)%2;
  stalkShape(g,l.x,l.base,l.top-.05-rot*.6,.55,css(mix(P.boneShade,'#3a2e28',rot),1),css(P.amber,.5*(1-rot)));
  // Gill-lines climbing the great stalk.
  g.strokeStyle=css(P.amber,.35*(1-rot));g.lineWidth=.03;
  for(let i=1;i<5;i++){const yy=lerp(l.base,l.top,i/5);g.beginPath();g.moveTo(l.x-.3,-yy);g.quadraticCurveTo(l.x,-(yy+.12),l.x+.3,-yy);g.stroke();}
  capShape(g,l.x,l.top-rot*.6,l.w/2,css(mix(P.bone,'#5a4a3a',rot),1),css(blink?P.ash:P.amberHot,.85*(1-rot)),blink?.6:1-rot*.6);
  if(!rot){add(g);spot(g,P.amber,l.x,l.top-.2,1.1,.3);norm(g);}
 }
 if(h.move==='pillar'){
  if(h.stage==='swell'){
   const q=clamp(h.f/PL.swell);
   g.fillStyle=css(mix(P.furDeep,P.amberDeep,.5*q),1);g.beginPath();g.ellipse(p.x,-p.y,.6+.6*q,.1+.3*q,0,Math.PI,TAU);g.fill();
   add(g);spot(g,P.amber,p.x,p.y+.2,1+q,.4+.5*q);g.strokeStyle=css(P.amberHot,.4+.5*q);g.lineWidth=.05;g.beginPath();g.ellipse(p.x,-p.y,lerp(2,PL.w/2,q),.3-.15*q,0,0,TAU);g.stroke();norm(g);
  }else if(!h.lift){
   // No lift (already above its reach, or over a pit): the stalk grows under the falling form to its own cap.
   const q=ease(clamp((h.f+alpha)/PL.grow)),y=lerp(h.base,h.top,q);
   add(g);g.fillStyle=css(P.amberHot,.22);g.fillRect(p.x-PL.w/2,-y,PL.w,y-h.base);norm(g);
   stalkShape(g,p.x,h.base,y,.6,css(P.boneShade,1),css(P.amberHot,1));capShape(g,p.x,y,PL.w/2*(.5+.5*q),css(P.bone,1),css(P.amberHot,1));
   add(g);spot(g,P.amber,p.x,(h.base+y)/2,1.4,.45);norm(g);
  }else{
   const y=p.py+(p.y-p.py)*(state.hitStop>0?1:alpha);
   add(g);g.fillStyle=css(P.amberHot,.3);g.fillRect(p.x-PL.w/2,-(y+p.h+PL.box.y1),PL.w,y+p.h+PL.box.y1-h.base);norm(g);
   stalkShape(g,p.x,h.base,y,.6,css(P.boneShade,1),css(P.amberHot,1));capShape(g,p.x,y,PL.w/2,css(P.bone,1),css(P.amberHot,1));
   add(g);spot(g,P.amberHot,p.x,y+p.h+.6,1.4,.6);spot(g,P.amber,p.x,(h.base+y)/2,1.6,.5);norm(g);
  }
 }
 if(h.move==='nova'&&h.f>=N.startup){
  const q=clamp((h.f-N.startup)/N.active),r=h.radius,cx=p.x,cy=p.y+p.h*.5;
  add(g);g.fillStyle=css(P.amber,.16*(1-q*.5));g.beginPath();g.arc(cx,-cy,r,0,TAU);g.fill();
  g.strokeStyle=css(P.amberHot,.9*(1-q*.4));g.lineWidth=.16;g.beginPath();g.arc(cx,-cy,r,0,TAU);g.stroke();
  g.strokeStyle=css(P.amber,.5);g.lineWidth=.05;g.beginPath();g.arc(cx,-cy,r*.75,0,TAU);g.stroke();
  for(let i=0;i<16;i++){const a=i*TAU/16+q;spot(g,P.amberHot,cx+Math.cos(a)*r,cy+Math.sin(a)*r,.2,.8);}
  norm(g);
 }
 if(h.move==='call'&&h.stage==='tunnel'){
  // The mound running under the mat, amber threads trailing back to where you sank.
  g.fillStyle=css(mix(P.furDeep,P.amberDeep,.3),1);g.beginPath();g.ellipse(p.x,-p.y,.8,.35,0,Math.PI,TAU);g.fill();
  add(g);spot(g,P.amber,p.x,p.y+.15,1,.6);g.strokeStyle=css(P.amber,.55);g.lineWidth=.04;
  for(let i=0;i<3;i++){g.beginPath();g.moveTo(h.from,-p.y-.02);g.quadraticCurveTo((h.from+p.x)/2,-(p.y+.1+.06*i),p.x,-(p.y+.05*i));g.stroke();}
  for(let i=0;i<4;i++)spot(g,P.amberHot,p.x-p.facing*(.4+i*.35),p.y+.1+((frame+i*7)%9)*.04,.12,.7);
  norm(g);
 }
 for(const a of h.husks)husk(g,a,frame);
}

// Brute clips for the Bloom's sim state, as the hero rig names them (frame data stays authoritative).
function clip(e){
 const h=e.bloom||{};
 if(h.move==='sow')return ['sword',clamp(h.f/SOW.total)];
 if(h.move==='pillar')return h.stage==='swell'?['charge',null]:['jump',null];
 if(h.move==='nova')return h.f<N.startup?['charge',null]:['blast',clamp((h.f-N.startup)/(N.total-N.startup))];
 if(h.move==='call')return h.stage==='rise'?['jump',null]:['block',null];
 if(e.clip==='bounce')return ['jump',null];
 return [/^(rake|pillar|nova|sink|tunnel|surface)/.test(e.clip||'')?'idle':e.clip||'idle',null];
}
const proxies=new WeakMap(),anchorsByHunter=new WeakMap();
function proxyOf(e){let q=proxies.get(e);if(!q){q=Object.create(e);proxies.set(e,q);}return q;}
const SOCKETS=['head','back','hand','chest','tail','legs'];
function anchorsOf(e){let a=anchorsByHunter.get(e);if(!a){a={valid:false,scale:1,dir:1};anchorsByHunter.set(e,a);}return a;}
// The whole Bloom for the View: the garden, the behind layer, the amber Brute (sheet or procedural, 2.3x), the front.
export function drawBloomEntity(view,g,state,e,frame,alpha,load=true){
 const x=e.px+(e.x-e.px)*alpha,y=e.py+(e.y-e.py)*alpha,dir=e.facing<0?-1:1,S=formVisual(BLOOM_ID,'brawler'),k=S/BRUTE;
 if(!e.form){drawShift(view,g,e,frame,alpha,load,x,y,dir,S);return;}
 drawBloomWorld(g,state,e,alpha,frame);
 const h=e.bloom||{};
 // Under the mat: only the mound (drawn with the garden) shows.
 if(h.move==='call'&&h.stage==='tunnel')return;
 // The hurt blink hides the body only; never during a move: the shape is the cue.
 if(e.inv&&!e.dead&&!h.move&&Math.floor(frame/V.blinkFrames)%2)return;
 const MA=anchorsOf(e),A={x,y,dir,frame,S,layer:'behind',anchors:MA.valid?MA:null};
 // Sinking (and surfacing), the body slides into the floor: clipped at the floor line.
 const sink=h.move==='call'?h.stage==='sink'?ease(clamp(h.f/C.sink)):h.stage==='rise'?1-ease(clamp(h.f/C.rise)):0:0;
 g.save();
 if(sink>0){g.beginPath();g.rect(x-S*1.5,-(y+S*2),S*3,S*2);g.clip();g.translate(0,sink*S*.9);}
 drawBloom(g,e,A);
 const moults=!!e.moults?.length;
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
   // A light amber wash only: the Brute's purple fur and crimson cloth must stay readable through it.
   if(!fl)drawTint(g,atlas,f.frame,sx,sy,d,k,.16);
   for(const n of SOCKETS)MA[n]=socket(atlas,f.frame,n,sx,sy,d,k)||guess(n,sx,sy,d,S);
   MA.dir=d;
  },anchors:null,low:!!view.mobile};
  view.chars.draw(g,q,frame,alpha,opts);
 }else{
  q.h=BRUTE;q.w=KINDS.brawler.width;
  g.save();g.translate(x,-y);g.scale(k,k);g.translate(-x,y);
  view.chars.draw(g,q,frame,alpha,{sprite:null,anchors:null,low:!!view.mobile});
  g.restore();
  for(const n of SOCKETS)MA[n]=guess(n,x,y,dir,S);
  MA.dir=dir;
 }
 MA.valid=true;MA.scale=k*.8;
 A.layer='front';A.anchors=MA;drawBloom(g,e,A);
 if(moults)drawMoults(g,e,MA,frame,'front');
 g.restore();
}
const shifting=new WeakMap();
// The 20f transformation: the hunter's own body (its mask cracking) while the antlers and the mane burst out of it.
function drawShift(view,g,e,frame,alpha,load,x,y,dir,S){
 let q=shifting.get(e);if(!q){q=Object.create(e);q.formNext=null;shifting.set(e,q);}
 const A=view.anchorsOf(q),o=view.opts,moults=!!e.moults?.length;
 if(moults&&A.valid)drawMoults(g,e,A,frame,'behind');
 o.sprite=view.spriteFor(q,load,g,frame,A,alpha);o.anchors=A;o.low=!!view.mobile;
 view.chars.draw(g,q,frame,alpha,o);
 A.x=x;A.y=y;A.valid=true;
 if(moults)drawMoults(g,e,A,frame,'front');
 const k=ease(clamp(1-e.formShift/POSSESSION.shift));
 g.globalAlpha=.35+.6*k;
 drawBloom(g,e,{x,y,dir,frame,S:S*(.3+.7*k)});
 g.globalAlpha=1;
 add(g);g.strokeStyle=css(P.amberHot,.9*(1-k));g.lineWidth=.08;
 g.beginPath();g.arc(x,-(y+e.h*.8),.3+k*S*.5,0,TAU);g.stroke();
 for(let i=0;i<8;i++){const a=i*TAU/8+frame*.05,r=(1-k)*2.2+.3;spot(g,P.amber,x+Math.cos(a)*r,y+e.h*.6+Math.sin(a)*r,.2,.7*(1-k));}
 norm(g);
}
