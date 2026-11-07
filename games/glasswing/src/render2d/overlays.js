import {glow} from './surface.js';
import {css,P} from './color.js';
import {VMV,SHARD} from '../data/moults5.js';

// Rules-v4 moults: visible body additions anchored at sprite sockets or estimated body points.
// Ids are open-ended ('horns-ram', 'back-rook', ...): the prefix picks the slot, the rest picks the shape.
// A '-deep' suffix (a second pick of the same moult) draws it larger and brighter.
const TAU=Math.PI*2;
const hash=s=>{let h=2166136261;for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619);return (h>>>0)/4294967296;};
export function moultSlot(id){
 const s=String(id).toLowerCase();
 if(/^(horn|crown|antler|crest)/.test(s))return 'head';
 if(/^(back|wing|spine|mantle)/.test(s))return 'back';
 if(/^(claw|hand|arm|talon|fist)/.test(s))return /^talon/.test(s)?'legs':'hand';
 if(/^(leg|foot|feet)/.test(s))return 'legs';
 if(/^(tail|sting)/.test(s))return 'tail';
 return 'chest';
}
// Back and tail additions sit behind the body; the rest is drawn over it.
export const behind=slot=>slot==='back'||slot==='tail';

function boneStroke(g,draw,w,rim=P.boneRim){
 g.lineCap='round';g.lineJoin='round';
 g.strokeStyle=P.outline;g.lineWidth=w*1.5;g.beginPath();draw();g.stroke();
 g.strokeStyle=P.bone;g.lineWidth=w;g.beginPath();draw();g.stroke();
 g.strokeStyle=css(rim,.7);g.lineWidth=w*.3;g.beginPath();draw();g.stroke();
}
function ember(g,x,y,r,a=.8){
 const sp=glow(P.amber);if(!sp)return;
 g.globalCompositeOperation='lighter';g.globalAlpha=a;g.drawImage(sp,x-r,y-r,r*2,r*2);g.globalAlpha=1;g.globalCompositeOperation='source-over';
}
function crack(g,draw,w){g.strokeStyle=css(P.amberHot,.95);g.lineWidth=w;g.beginPath();draw();g.stroke();}
const shapes={
 head(g,id,a,s,frame,r,dir,deep){
  const [x,y]=a,ram=/ram|curl/.test(id),lantern=/lantern/.test(id),brow=/charge|brow/.test(id),k=deep?1.35:1;
  for(const side of [1,-1]){
   g.save();g.translate(x,-y);g.scale(side*s*k,s*k);
   if(brow){
    // Battering Brow (verb): a thick bone ram-boss over each brow, flattened at the front into a striking face.
    boneStroke(g,()=>{g.moveTo(.04,-.06);g.quadraticCurveTo(.26,-.26,.38,-.04);},.15);
    g.fillStyle=P.bone;g.strokeStyle=P.outline;g.lineWidth=.03;g.beginPath();g.ellipse(.38,-.02,.07,.1,.3,0,TAU);g.fill();g.stroke();
    for(let i=0;i<3;i++){g.strokeStyle=P.boneDark;g.lineWidth=.018;g.beginPath();g.moveTo(.12+i*.08,-.18+i*.03);g.lineTo(.16+i*.08,-.1+i*.03);g.stroke();}
    if(deep){crack(g,()=>{g.moveTo(.1,-.12);g.quadraticCurveTo(.24,-.22,.34,-.06);},.02);ember(g,.38,-.02,.2,.6);}
   }else if(ram){
    boneStroke(g,()=>{g.moveTo(.1,.05);g.bezierCurveTo(.55,-.2,.6,.35,.32,.38);g.bezierCurveTo(.12,.4,.12,.15,.3,.16);},.09);
    if(deep)crack(g,()=>{g.moveTo(.2,-.02);g.bezierCurveTo(.45,-.12,.5,.25,.33,.3);},.018);
   }else{
    // Crescent horns; Lantern Crescents carry an amber light at each tip.
    boneStroke(g,()=>{g.moveTo(.08,0);g.quadraticCurveTo(.3+r*.2,-.32,.2+r*.3,-.7-r*.2);},.08);
    if(lantern){
     const tx=.2+r*.3,ty=-.7-r*.2,pulse=1+.12*Math.sin(frame*.09+side);
     g.fillStyle=P.amberHot;g.beginPath();g.arc(tx,ty,.07*pulse,0,TAU);g.fill();
     ember(g,tx,ty,(deep?.42:.3)*pulse,deep?.95:.8);
    }
   }
   g.restore();
  }
 },
 back(g,id,a,s,frame,r,dir,deep){
  const [x,y]=a,beat=Math.sin(frame*.12+r*9)*.12,k=deep?1.3:1;
  g.save();g.translate(x,-y);g.scale(dir*s*k,s*k);
  if(/spine|glass/.test(id)){
   // Glass Spines (verb): a fan of clear glass shards with a bone root and an amber glint inside each.
   const n=deep?6:4;
   for(let i=0;i<n;i++){
    const t=-2.55+i*(1.1/(n-1))+beat*.25,l=(.7+((i*37)%5)*.05)*(i%2?.85:1),c=Math.cos(t),sn=Math.sin(t),w=.07;
    g.fillStyle='rgba(222,244,240,.42)';g.strokeStyle=P.boneRim;g.lineWidth=.018;
    g.beginPath();g.moveTo(-sn*w,c*w);g.lineTo(c*l,sn*l);g.lineTo(sn*w,-c*w);g.closePath();g.fill();g.stroke();
    g.strokeStyle=css(P.amberHot,.8);g.lineWidth=.012;g.beginPath();g.moveTo(c*l*.25,sn*l*.25);g.lineTo(c*l*.7,sn*l*.7);g.stroke();
   }
   g.fillStyle=P.bone;g.strokeStyle=P.outline;g.lineWidth=.025;g.beginPath();g.ellipse(0,0,.1,.07,0,0,TAU);g.fill();g.stroke();
   if(deep)ember(g,0,0,.28,.45);
  }else if(/bone|sail/.test(id)){
   // Bone Sail: a fan of ivory spines with a taut membrane.
   const n=deep?6:4,ang=i=>-2.5+i*(1.2/(n-1))+beat*.3;
   g.fillStyle=css(P.boneShade,.55);g.strokeStyle=P.outline;g.lineWidth=.025;g.beginPath();g.moveTo(0,0);
   for(let i=0;i<n;i++){const t=ang(i),l=.9-Math.abs(i-(n-1)/2)*.08;g.lineTo(Math.cos(t)*l,Math.sin(t)*l);}
   g.closePath();g.fill();g.stroke();
   for(let i=0;i<n;i++){const t=ang(i),l=.95-Math.abs(i-(n-1)/2)*.08;boneStroke(g,()=>{g.moveTo(0,0);g.lineTo(Math.cos(t)*l,Math.sin(t)*l);},.05);}
   if(deep)crack(g,()=>{g.moveTo(0,0);g.lineTo(Math.cos(ang(n>>1))*.7,Math.sin(ang(n>>1))*.7);},.02);
  }else{
   const rook=/rook|crow|raven/.test(id),blades=deep?3:2;
   for(let j=0;j<blades;j++){
    g.save();g.rotate(-2.1-j*.42+beat);
    g.fillStyle=rook?'#0c0a10':P.furDeep;g.strokeStyle=rook?css(P.furRim,.5):P.outline;g.lineWidth=.03;
    g.beginPath();g.moveTo(0,0);
    for(let i=0;i<=5;i++){const t=i/5;g.lineTo(-.12-t*.25,.15+t*.75);g.lineTo(-.02-t*.15,.2+t*.75);}
    g.lineTo(.06,.95);g.quadraticCurveTo(.1,.4,0,0);g.fill();g.stroke();
    boneStroke(g,()=>{g.moveTo(0,0);g.quadraticCurveTo(.1,.45,.05,.95);},.05);
    g.restore();
   }
  }
  g.restore();
 },
 hand(g,id,a,s,frame,r,dir,deep){
  const [x,y]=a,k=deep?1.3:1;g.save();g.translate(x,-y);g.scale(dir*s*k,s*k);
  if(/tether|grapple/.test(id)){
   // Tether Claw (verb): one big hooked claw and an amber cord coiled round the forearm.
   for(let i=0;i<(deep?4:3);i++){g.strokeStyle=P.outline;g.lineWidth=.05;g.beginPath();g.ellipse(-.1-i*.07,0,.035,.11,0,0,TAU);g.stroke();g.strokeStyle=P.amber;g.lineWidth=.028;g.beginPath();g.ellipse(-.1-i*.07,0,.035,.11,0,0,TAU);g.stroke();}
   boneStroke(g,()=>{g.moveTo(0,0);g.bezierCurveTo(.25,-.18,.5,-.05,.42,.14);g.lineTo(.32,.08);},.06);
   g.fillStyle=P.boneRim;g.beginPath();g.moveTo(.42,.14);g.lineTo(.47,.24);g.lineTo(.36,.15);g.closePath();g.fill();
   if(deep)ember(g,-.17,0,.22,.55);
  }else if(/ember|bracer/.test(id)){
   // Ember Bracers: bone cuffs with molten cracks and a drifting spark.
   for(let b=0;b<(deep?2:1);b++){
    const bx=-.12-b*.13;
    g.fillStyle=P.bone;g.strokeStyle=P.outline;g.lineWidth=.025;g.beginPath();g.ellipse(bx,0,.06,.13,0,0,TAU);g.fill();g.stroke();
    crack(g,()=>{g.moveTo(bx-.02,-.1);g.lineTo(bx+.02,0);g.lineTo(bx-.01,.1);},.02);
   }
   const t=frame*.05%1;ember(g,.1+t*.25,-.1-t*.3,(deep?.32:.22)*(1-t*.5));
   ember(g,-.12,0,deep?.3:.2,.6);
  }else{
   const hook=/hook/.test(id);
   for(let i=0;i<3;i++)boneStroke(g,()=>{
    g.moveTo(0,(i-1)*.07);
    if(hook)g.bezierCurveTo(.3,(i-1)*.1-.1,.48+r*.1,(i-1)*.12+.05,.36,(i-1)*.14+.16);
    else g.quadraticCurveTo(.25,(i-1)*.1-.05,.38+r*.1,(i-1)*.14+.08);
   },.045);
  }
  g.restore();
 },
 legs(g,id,a,s,frame,r,dir,deep){
  const [x,y]=a,k=deep?1.35:1;
  if(/cricket/.test(id)){
   // Cricket Legs (verb): one big folded spring leg at the hip, a fat furred thigh up to a knee above the hip and a
   // spurred bone shin back down to the heel (one leg reads as a spring; two read as a ladder).
   for(const [off,far] of [[-.04,0]]){
    g.save();g.translate(x+off*s,-y);g.scale(dir*s*k,s*k);g.lineJoin='round';g.lineCap='round';
    g.fillStyle=far?P.furDeep:P.furLight;g.strokeStyle=P.outline;g.lineWidth=.035;
    g.beginPath();g.moveTo(.02,-.5);g.quadraticCurveTo(-.06,-.98,-.36,-1.04);g.quadraticCurveTo(-.46,-.98,-.38,-.86);g.quadraticCurveTo(-.2,-.68,-.1,-.42);g.closePath();g.fill();g.stroke();
    g.strokeStyle=css(P.furRim,far?.35:.7);g.lineWidth=.018;g.beginPath();g.moveTo(-.02,-.62);g.quadraticCurveTo(-.08,-.92,-.32,-1);g.stroke();
    g.strokeStyle=far?css(P.boneShade,.8):P.bone;g.lineWidth=.02;g.beginPath();g.moveTo(-.04,-.55);g.quadraticCurveTo(-.12,-.88,-.33,-.97);g.stroke();
    boneStroke(g,()=>{g.moveTo(-.38,-.95);g.quadraticCurveTo(-.5,-.5,-.34,-.04);},.06,far?P.boneShade:P.boneRim);
    for(const t of [.4,.68])boneStroke(g,()=>{const px=-.44+.04*t,py=-.86+.8*t;g.moveTo(px,py);g.lineTo(px-.11,py+.06);},.024);
    g.fillStyle=far?P.boneShade:P.bone;g.strokeStyle=P.outline;g.lineWidth=.02;g.beginPath();g.arc(-.38,-.97,.065,0,TAU);g.fill();g.stroke();
    if(deep&&!far)crack(g,()=>{g.moveTo(-.02,-.56);g.quadraticCurveTo(-.1,-.86,-.3,-.95);},.022);
    g.restore();
   }
   return;
  }
  // Talon Legs: three bone talons spread at each foot.
  for(const off of [-.14,.14]){
   g.save();g.translate(x+off*s,-y);g.scale(dir*s*k,s*k);
   for(let i=0;i<3;i++)boneStroke(g,()=>{const t=(i-1)*.5;g.moveTo(0,-.05);g.quadraticCurveTo(Math.sin(t)*.18+.06,.02,Math.sin(t)*.26+.1,.06);},.04);
   boneStroke(g,()=>{g.moveTo(-.02,-.06);g.quadraticCurveTo(-.14,-.02,-.16,.05);},.035);
   if(deep)crack(g,()=>{g.moveTo(0,-.18);g.lineTo(.02,-.05);},.02);
   g.restore();
  }
 },
 tail(g,id,a,s,frame,r,dir,deep){
  const [x,y]=a,sw=Math.sin(frame*.07+r*5)*.15,k=deep?1.35:1;g.save();g.translate(x,-y);g.scale(dir*s*k,s*k);
  if(/root/.test(id)){
   // Root Tail: a twisted root that forks into tendrils, amber sap in the grain.
   const tip=[-.85,-.05+sw*.6];
   g.lineCap='round';
   g.strokeStyle=P.outline;g.lineWidth=.16;g.beginPath();g.moveTo(0,0);g.bezierCurveTo(-.3,.15+sw,-.55,-.2-sw,tip[0],tip[1]);g.stroke();
   g.strokeStyle=P.boneDark;g.lineWidth=.11;g.beginPath();g.moveTo(0,0);g.bezierCurveTo(-.3,.15+sw,-.55,-.2-sw,tip[0],tip[1]);g.stroke();
   for(let i=0;i<(deep?5:3);i++){const t=.35+i*.15,bx=-t,by=Math.sin(t*4+sw)*.08;boneStroke(g,()=>{g.moveTo(bx,by);g.quadraticCurveTo(bx-.12,by+.18,bx-.05-.1*i%.2,by+.3+i*.03);},.025,P.boneShade);}
   crack(g,()=>{g.moveTo(-.1,.02);g.bezierCurveTo(-.3,.1+sw,-.5,-.12-sw,-.7,-.04+sw*.5);},.022);
  }else{
   boneStroke(g,()=>{g.moveTo(0,0);g.bezierCurveTo(-.35,.1+sw,-.6,-.1-sw,-.8,-.35+sw);},.08);
   g.fillStyle=P.amber;g.beginPath();g.moveTo(-.8,-.35+sw);g.lineTo(-.95,-.5+sw);g.lineTo(-.78,-.48+sw);g.closePath();g.fill();
  }
  g.restore();
 },
 chest(g,id,a,s,frame,r,dir,deep){
  const [x,y]=a,k=deep?1.35:1,R=.42*s*k;
  g.save();g.translate(x,-y);
  if(/shell|plastron/.test(id)){
   // Shell Drop (verb): a domed bone plastron in three ridged bands over the sigil.
   const cy=R*.3,rx=R*.42,ry=R*.55;
   g.fillStyle=P.boneShade;g.strokeStyle=P.outline;g.lineWidth=.035*s;g.beginPath();g.ellipse(0,cy,rx,ry,0,0,TAU);g.fill();g.stroke();
   g.fillStyle=css(P.bone,.85);g.beginPath();g.ellipse(-rx*.18,cy-ry*.12,rx*.7,ry*.72,0,0,TAU);g.fill();
   for(let i=-1;i<=1;i++){g.strokeStyle=P.boneDark;g.lineWidth=.025*s;g.beginPath();g.moveTo(-rx*.85,cy+i*ry*.45);g.quadraticCurveTo(0,cy+i*ry*.45+ry*.18,rx*.85,cy+i*ry*.45);g.stroke();}
   if(deep){crack(g,()=>{g.moveTo(0,cy-ry*.8);g.lineTo(rx*.12,cy-ry*.1);g.lineTo(-rx*.08,cy+ry*.4);g.lineTo(rx*.05,cy+ry*.9);},.025*s);ember(g,0,cy,R*.8,.35);}
  }else if(/kiln/.test(id)){
   // Kiln Heart: a molten core with licking flames.
   const f=1+.1*Math.sin(frame*.2);
   g.fillStyle=P.amberDeep;g.strokeStyle=P.outline;g.lineWidth=.02*s;g.beginPath();g.arc(0,0,R*.38*f,0,TAU);g.fill();g.stroke();
   g.globalCompositeOperation='lighter';
   for(let i=0;i<(deep?7:5);i++){const t=i/(deep?7:5)*TAU+frame*.03,l=R*(.6+.25*Math.sin(frame*.3+i));g.fillStyle=css(i%2?P.amberHot:P.amber,.7);g.beginPath();g.moveTo(Math.cos(t-.25)*R*.3,Math.sin(t-.25)*R*.3);g.lineTo(Math.cos(t)*l,Math.sin(t)*l);g.lineTo(Math.cos(t+.25)*R*.3,Math.sin(t+.25)*R*.3);g.fill();}
   g.globalCompositeOperation='source-over';
   ember(g,0,0,R*(deep?1.6:1.2),.55);
  }else if(/patient/.test(id)){
   // Patient Bone: a bone ring of tally notches around the sigil.
   g.strokeStyle=P.outline;g.lineWidth=.07*s*k;g.beginPath();g.arc(0,0,R*.8,0,TAU);g.stroke();
   g.strokeStyle=P.bone;g.lineWidth=.045*s*k;g.beginPath();g.arc(0,0,R*.8,0,TAU);g.stroke();
   for(let i=0;i<8;i++){const t=i/8*TAU-frame*.004;g.strokeStyle=deep&&i%2?P.amberHot:P.boneDark;g.lineWidth=.025*s;g.beginPath();g.moveTo(Math.cos(t)*R*.68,Math.sin(t)*R*.68);g.lineTo(Math.cos(t)*R*.95,Math.sin(t)*R*.95);g.stroke();}
   if(deep)ember(g,0,0,R*.9,.35);
  }else{
   // Unknown sigils: a rotating glyph ring of amber sigils.
   const turn=frame*.01*(r<.5?1:-1);g.globalCompositeOperation='lighter';
   g.strokeStyle=css(P.amber,.55);g.lineWidth=.025*s;g.beginPath();g.arc(0,0,R,0,TAU);g.stroke();
   g.strokeStyle=css(P.amberHot,.85);g.lineWidth=.018*s;
   const n=5+Math.floor(r*4);
   for(let i=0;i<n;i++){const t=turn+i/n*TAU,cx=Math.cos(t)*R,cy=Math.sin(t)*R;g.beginPath();g.moveTo(cx-.04*s,cy);g.lineTo(cx+.04*s,cy);g.moveTo(cx,cy-.05*s);g.lineTo(cx,cy+.05*s);g.stroke();}
   const sp=glow(P.amber);if(sp){g.globalAlpha=.25;g.drawImage(sp,-R*1.4,-R*1.4,R*2.8,R*2.8);g.globalAlpha=1;}
   g.globalCompositeOperation='source-over';
  }
  g.restore();
 }
};
const legsAt=[0,0];
// anchors: {head,back,hand,chest,tail,legs?,scale,dir} in world tiles. No-op without moults.
export function drawMoults(g,e,anchors,frame,pass){
 const list=e?.moults;
 if(!Array.isArray(list)||!list.length||!anchors)return 0;
 let n=0;
 for(const raw of list){
  if(typeof raw!=='string')continue;
  const deep=raw.endsWith('-deep'),id=deep?raw.slice(0,-5):raw,slot=moultSlot(id);
  if((pass==='behind')!==behind(slot))continue;
  let a=anchors[slot];
  // Feet sit under the hips when the body does not report them.
  if(!a&&slot==='legs'&&anchors.tail){legsAt[0]=anchors.tail[0]+(anchors.dir||1)*.18*(anchors.scale||1);legsAt[1]=anchors.tail[1]-.62*(anchors.scale||1);a=legsAt;}
  if(!a)continue;
  try{shapes[slot](g,id,a,anchors.scale||1,frame,hash(id),anchors.dir||1,deep);n++;}catch{}
 }
 return n;
}

// moults5 verb states (render only; reads e.verbs, never writes it). A: the anchors just filled by the body draw.
// Returns the number of cues drawn. World coordinates, y up (drawn at -y).
const at=(A,n,e,fx,fy)=>A&&A[n]?A[n]:[e.x+(e.facing||1)*fx,e.y+fy];
function cord(g,x0,y0,x1,y1,a,slack=0){
 const mx=(x0+x1)/2,my=(y0+y1)/2-slack;
 g.lineCap='round';g.strokeStyle=css(P.outline,a*.8);g.lineWidth=.08;g.beginPath();g.moveTo(x0,-y0);g.quadraticCurveTo(mx,-my,x1,-y1);g.stroke();
 g.strokeStyle=css(P.amber,a);g.lineWidth=.045;g.beginPath();g.moveTo(x0,-y0);g.quadraticCurveTo(mx,-my,x1,-y1);g.stroke();
}
function hook(g,x,y,dir,s=1){
 g.save();g.translate(x,-y);g.scale(dir*s,s);
 boneStroke(g,()=>{g.moveTo(-.12,0);g.bezierCurveTo(.08,-.16,.24,-.02,.16,.14);},.06);
 boneStroke(g,()=>{g.moveTo(-.12,0);g.bezierCurveTo(.08,.12,.2,.2,.08,.26);},.045);
 g.restore();
}
export function drawVerbs(g,e,A,frame,alpha=1){
 const v=e?.verbs;if(!v||typeof v!=='object')return 0;
 let n=0;const dir=e.facing||1,list=Array.isArray(e.moults)?e.moults:[],h=e.h||1.7;
 const owns=id=>list.includes(id)||list.includes(id+'-deep'),deep=id=>list.includes(id+'-deep');
 const hand=at(A,'hand',e,.4,h*.6);
 // Tether Claw: the cord to the flying (slack) or biting (taut) claw, then the snap of a yank.
 if(v.mode==='claw'||v.mode==='zip'){
  const taut=v.mode==='zip';cord(g,hand[0],hand[1],v.cx,v.cy,1,taut?0:.25);hook(g,v.cx,v.cy,v.cvx<0?-1:1,1.1);
  if(taut)ember(g,v.cx,-v.cy,.35,.7);n++;
 }
 // The fling out of a pull: amber streaks trail the body while the carried speed lasts.
 if(v.fling>0){
  const k=v.fling/(VMV.tetherFlingFrames||12),back=-(Math.sign(e.knockback||0)||dir);
  for(let i=0;i<3;i++){const y=e.y+.35+i*h*.25,len=(.5+((frame+i*5)%7)*.07)*(.4+k);g.strokeStyle=css(i%2?P.boneRim:P.amber,.75*k);g.lineWidth=.04;g.beginPath();g.moveTo(e.x+back*.3,-y);g.lineTo(e.x+back*(.3+len),-y);g.stroke();}
  n++;
 }
 if(v.snap>0){const k=v.snap/8;cord(g,hand[0],hand[1],v.snapX+(hand[0]-v.snapX)*(1-k),v.snapY+(hand[1]-v.snapY)*(1-k),k);n++;}
 // Battering Brow: the head glows through the windup; the charge leaves amber speed lines.
 if(v.mode==='windup'||v.mode==='ram'){
  const head=at(A,'head',e,.2,h*.95),k=v.mode==='windup'?1-v.t/8:1;
  ember(g,head[0]+dir*.15,-head[1],.25+.35*k,.9);
  g.strokeStyle=css(P.amberHot,.9);g.lineWidth=.04;g.beginPath();g.arc(head[0]+dir*.15,-head[1],.18+.3*(1-k),0,TAU);g.stroke();
  if(v.mode==='ram')for(let i=0;i<4;i++){const y=e.y+.3+i*.38,len=.6+((frame+i*7)%9)*.08;g.strokeStyle=css(i%2?P.amber:P.boneRim,.7);g.lineWidth=.035;g.beginPath();g.moveTo(e.x-dir*.4,-y);g.lineTo(e.x-dir*(.4+len),-y);g.stroke();}
  n++;
 }
 // Shell Drop: the curled shell glows on the hang, streaks on the fall; the landing quake ring spreads.
 if(v.mode==='hang'||v.mode==='drop'){
  const c=at(A,'chest',e,.1,h*.6);ember(g,c[0],-c[1],v.mode==='hang'?.5:.4,.85);
  g.strokeStyle=css(P.boneRim,.9);g.lineWidth=.04;g.beginPath();g.arc(c[0],-c[1],.42,0,TAU);g.stroke();
  if(v.mode==='drop')for(let i=-1;i<=1;i++){g.strokeStyle=css(P.amber,.6);g.lineWidth=.04;g.beginPath();g.moveTo(e.x+i*.22,-(e.y+h));g.lineTo(e.x+i*.22,-(e.y+h+.9+((frame+i+3)%4)*.15));g.stroke();}
  n++;
 }
 if(v.ring>0){
  const k=1-v.ring/18,r=Math.max(.2,(v.ringR||2)*(.3+.7*k));
  g.strokeStyle=css(P.amberHot,.9*(1-k));g.lineWidth=.12*(1-k)+.03;g.beginPath();g.ellipse(v.ringX,-v.ringY-.05,r,r*.22,0,0,TAU);g.stroke();
  g.strokeStyle=css(P.amber,.5*(1-k));g.lineWidth=.05;g.beginPath();g.ellipse(v.ringX,-v.ringY-.05,r*.7,r*.16,0,0,TAU);g.stroke();n++;
 }
 // Glass Spines: the back flares when a parry fires the shards.
 if(v.flare>0){const b=at(A,'back',e,-.3,h*.72),k=v.flare/14;ember(g,b[0],-b[1],.4+.3*k,.9);g.strokeStyle=css(P.boneRim,k);g.lineWidth=.04;g.beginPath();g.arc(b[0],-b[1],.5*(1.2-k),0,TAU);g.stroke();n++;}
 // Cricket Legs: while guarding, a ring fills round the feet; full means the leap is ready (it pulses).
 if(owns('legs-cricket')&&e.blocking&&e.grounded){
  const need=VMV.brace[deep('legs-cricket')?1:0],k=Math.min(1,(e.blockAge||0)/need),y=-(e.y+.04);
  g.strokeStyle=css(P.outline,.6);g.lineWidth=.07;g.beginPath();g.ellipse(e.x,y,.6,.16,0,0,TAU);g.stroke();
  g.strokeStyle=css(k>=1?P.amberHot:P.amber,k>=1?.95:.75);g.lineWidth=.05;g.beginPath();g.ellipse(e.x,y,.6,.16,0,-Math.PI/2,-Math.PI/2+k*TAU);g.stroke();
  if(k>=1)ember(g,e.x,y-.25,.45*(1+.15*Math.sin(frame*.5)),.8);
  n++;
 }
 return n;
}
// Glass Spines: the shards (pooled projectiles of colour SHARD) drawn as glass splinters over their amber glow.
export function drawShards(g,state,alpha=1){
 let n=0;
 for(const p of state?.projectiles||[]){
  if(!p.active||p.color!==SHARD)continue;
  const x=p.x-p.vx*(1-alpha),y=p.y-(p.vy||0)*(1-alpha),dir=Math.sign(p.vx)||1,tilt=(p.vy||0)*dir*6;
  g.save();g.translate(x,-y);g.scale(dir,1);g.rotate(-tilt);
  g.fillStyle='rgba(232,246,242,.85)';g.strokeStyle=P.boneRim;g.lineWidth=.02;
  g.beginPath();g.moveTo(.26,0);g.lineTo(-.06,-.07);g.lineTo(-.22,0);g.lineTo(-.06,.06);g.closePath();g.fill();g.stroke();
  g.strokeStyle=css(P.amberHot,.9);g.lineWidth=.015;g.beginPath();g.moveTo(-.12,0);g.lineTo(.14,0);g.stroke();
  g.restore();n++;
 }
 return n;
}
