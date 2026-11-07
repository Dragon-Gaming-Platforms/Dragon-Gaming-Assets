import {surface,seeded} from './surface.js';
import {css,mix,P} from './color.js';

// Procedural body parts in design units (tiles, y down, pivot at the joint, limbs point down).
// Each part is painted once per look/zoom bucket into an offscreen canvas.
const TAU=Math.PI*2;

export const LOOKS={
 brawler:{kind:'brawler',hip:.8,thigh:.43,shin:.42,torso:.6,headR:.4,head:[.2,.04],arm:[.44,.5],bulk:1.3,hunch:.28,wing:.8,stride:.3,weapon:'claws'},
 skimmer:{kind:'skimmer',hip:.6,thigh:.32,shin:.31,torso:.42,headR:.29,head:[.06,-.08],arm:[.3,.32],bulk:.72,hunch:.1,wing:1.3,stride:.26,weapon:'glaive'},
 spark:{kind:'spark',hip:.7,thigh:.37,shin:.36,torso:.47,headR:.29,head:[.05,-.08],arm:[.34,.36],bulk:.78,wing:.85,stride:.28,weapon:'bow'}
};
export function lookFor(kind,wild){const base=LOOKS[kind]||LOOKS.brawler;return wild?(base.wildLook||(base.wildLook={...base,wild:true,id:'wild-'+base.kind})):(base.id||(base.id=base.kind),base);}

const furCols=look=>look.wild?['#615a78','#2e2a3a','#110f1a']:[P.furLight,P.fur,P.furDeep];
export function fur(g,path,box,look,rnd,u=1){
 const [x0,y0,x1,y1]=box,c=furCols(look),v=g.createLinearGradient(x0,y0,x1,y1);
 v.addColorStop(0,c[0]);v.addColorStop(.45,c[1]);v.addColorStop(1,c[2]);
 g.fillStyle=v;path(g);g.fill();
 g.save();path(g);g.clip();
 const s=.12*u;
 for(let y=y0,row=0;y<y1;y+=s*.75,row++)for(let x=x0+(row%2)*s*.5;x<x1;x+=s){
  g.fillStyle=css(rnd()<.5?c[0]:c[2],.2);
  g.beginPath();g.moveTo(x-s*.4,y);g.lineTo(x,y+s*1.5);g.lineTo(x+s*.4,y);g.quadraticCurveTo(x,y+s*.6,x-s*.4,y);g.fill();
 }
 g.translate(.025*u,.03*u);g.strokeStyle=css(look.wild?'#a7a1c4':P.furRim,.5);g.lineWidth=.05*u;path(g);g.stroke();
 g.restore();
 g.strokeStyle=P.outline;g.lineWidth=.03*u;g.lineJoin='round';path(g);g.stroke();
}
// Ragged feather tips along the trailing side of a limb.
export function fringe(g,L,w,look,n=4){g.fillStyle=look.wild?'#2a2638':P.fur;g.strokeStyle=P.outline;g.lineWidth=.015;for(let i=0;i<n;i++){const y=L*(.15+i*.8/n),l=w*(.9+.3*(i%2));g.beginPath();g.moveTo(-w*.6,y);g.lineTo(-w-l*.5,y+l);g.lineTo(-w*.2,y+l*.5);g.closePath();g.fill();g.stroke();}}
export function bone(g,path,box,{dark=false,u=1}={}){
 const [x0,y0,x1,y1]=box,v=g.createLinearGradient(x0,y0,x1,y1);
 v.addColorStop(0,dark?P.boneShade:P.boneRim);v.addColorStop(.35,dark?mix(P.bone,P.boneDark,.4):P.bone);v.addColorStop(1,dark?P.boneDark:P.boneShade);
 g.fillStyle=v;path(g);g.fill();
 g.save();path(g);g.clip();
 g.translate(-.02*u,-.025*u);g.strokeStyle=css(P.boneDark,.55);g.lineWidth=.04*u;path(g);g.stroke();
 g.translate(.045*u,.05*u);g.strokeStyle=css(P.boneRim,.7);g.lineWidth=.025*u;path(g);g.stroke();
 g.restore();
 g.strokeStyle=P.outline;g.lineWidth=.028*u;g.lineJoin='round';path(g);g.stroke();
}
// Molten crack: dark seam with an amber (hero) or cyan (wild) core.
export function crack(g,pts,col=P.amber,w=.02){
 g.lineCap='round';g.lineJoin='round';
 for(const [lw,c] of [[w*2.2,css(P.outline,.8)],[w,col],[w*.4,col===P.cyan?P.cyanHot:P.amberHot]]){
  g.strokeStyle=c;g.lineWidth=lw;g.beginPath();g.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)g.lineTo(pts[i],pts[i+1]);g.stroke();
 }
}
const capsule=(L,w0,w1,bulge=1.15)=>g=>{g.beginPath();g.moveTo(-w0,0);g.bezierCurveTo(-w0*bulge,L*.4,-w1*bulge,L*.75,-w1,L);g.arc(0,L,w1,Math.PI,0,true);g.bezierCurveTo(w1*bulge,L*.75,w0*bulge,L*.4,w0,0);g.arc(0,0,w0,0,Math.PI,true);g.closePath();};

// ---- painters: each returns [x0,y0,x1,y1] box and paints when g is given ----
const P_=look=>{
 const k=look.bulk,T=look.torso,wild=look.wild,accent=wild?P.cyan:P.amber;
 const L1=look.arm[0],L2=look.arm[1],T1=look.thigh,T2=look.shin,R=look.headR,W=look.wing;
 return {
  torso:{box:[-.48*k,-T-.34,.5*k,.14],paint(g,r){
   const path=g=>{g.beginPath();g.moveTo(-.16*k,.06);g.bezierCurveTo(-.24*k,-.3*T,-.36*k,-.7*T,-.3*k,-T-.06);g.quadraticCurveTo(-.05*k,-T-.18,.2*k,-T-.08);g.bezierCurveTo(.4*k,-.85*T,.36*k,-.45*T,.2*k,-.15*T);g.quadraticCurveTo(.2*k,.05,.12*k,.08);g.closePath();};
   // Spiky feather mantle along the back and shoulders.
   g.fillStyle=wild?'#1c1928':P.furDeep;
   for(let i=0;i<7;i++){const a=-2.2+i*.32,bx=-.18*k+Math.cos(a)*.24*k,by=-T*.82+Math.sin(a)*.22*k;g.beginPath();g.moveTo(bx-.06,by);g.lineTo(bx+Math.cos(a)*.22*k-.05,by+Math.sin(a)*.16*k+.06);g.lineTo(bx+.06,by+.02);g.fill();}
   fur(g,path,[-.36*k,-T-.18,.4*k,.08],look,r);
   // Feather ruff over the shoulders.
   for(let i=0;i<12;i++){const a=Math.PI*(1.0+i*.088),cx=.0,cy=-T+.03,l=(.2+.07*(i%3))*k;g.fillStyle=i%2?(wild?'#3a3550':P.fur):(wild?'#1c1928':P.furDeep);g.strokeStyle=css(P.outline,.7);g.lineWidth=.014;g.beginPath();g.moveTo(cx+Math.cos(a-.2)*.12*k,cy+Math.sin(a-.2)*.09*k);g.lineTo(cx+Math.cos(a)*l,cy+Math.sin(a)*l*.75+.07*k);g.lineTo(cx+Math.cos(a+.2)*.12*k,cy+Math.sin(a+.2)*.09*k);g.closePath();g.fill();g.stroke();}
   if(!wild){
    // Dark chest hide with the circle-and-cross sigil.
    g.fillStyle=css('#2a1830',.85);g.beginPath();g.ellipse(.12*k,-.66*T,.15*k,.22*T,.15,0,TAU);g.fill();
    const cx=.13*k,cy=-.68*T,s=.11*Math.sqrt(k);
    crack(g,[cx,cy-s*1.6,cx,cy+s*1.9],P.amber,.022);crack(g,[cx-s*1.3,cy-s*.4,cx-s*.3,cy,cx+s*.3,cy,cx+s*1.3,cy-s*.4],P.amber,.018);
    g.strokeStyle=P.amber;g.lineWidth=.02;g.beginPath();g.arc(cx,cy,s*.45,0,TAU);g.stroke();
    crack(g,[-.1*k,-.3*T,-.02*k,-.4*T,-.05*k,-.52*T],P.amber,.012);
    // Bone belt with a ring buckle.
    bone(g,g=>{g.beginPath();g.moveTo(-.2*k,-.02);g.lineTo(.22*k,-.06);g.lineTo(.22*k,.04);g.lineTo(-.2*k,.08);g.closePath();},[-.2*k,-.06,.22*k,.08]);
    bone(g,g=>{g.beginPath();g.arc(.16*k,0,.055,0,TAU);g.arc(.16*k,0,.025,0,TAU,true);},[.1*k,-.06,.22*k,.06]);
    if(look.kind==='spark'){g.fillStyle=P.crimson;g.beginPath();g.ellipse(.05*k,-T+.02,.2*k,.08,-.2,0,TAU);g.fill();g.strokeStyle=P.outline;g.lineWidth=.025;g.stroke();g.strokeStyle=css(P.crimsonLight,.6);g.beginPath();g.moveTo(-.1*k,-T+.02);g.quadraticCurveTo(.05*k,-T+.06,.2*k,-T);g.stroke();}
   }
   if(wild){
    crack(g,[.05*k,-.8*T,.12*k,-.62*T,.08*k,-.45*T,.15*k,-.3*T],P.cyan,.014);
    for(let i=0;i<3;i++)bone(g,g=>{g.beginPath();g.ellipse(.15*k,-.45*T-i*.15*T,.12*k,.035,.2,0,TAU);},[.03*k,-.5*T-i*.15*T,.27*k,-.4*T-i*.15*T],{dark:true});
   }
  }},
  // Glass-mode overlay: the amber cracks blaze through the whole torso.
  blaze:{box:[-.42*k,-T-.22,.48*k,.14],paint(g,r){
   for(let i=0;i<6;i++){const pts=[];let x=(r()-.5)*.5*k,y=-T*(.1+r()*.8);for(let j=0;j<5;j++){pts.push(x,y);x+=(r()-.5)*.16*k;y+=(r()-.6)*.14;}crack(g,pts,P.amber,.022);}
  }},
  head:{box:[-1.6*R,-2.35*R,1.6*R,.75*R],paint(g,r,v){
   g.scale(R,R);
   const glass=v==='glass',lvl=+(v||'0')||0;
   // Feather mane behind the skull.
   g.fillStyle=wild?'#1c1928':P.furDeep;
   for(let i=0;i<9;i++){const a=Math.PI*(.55+i*.11),l=.75+r()*.35;g.beginPath();g.moveTo(Math.cos(a)*.3,-.35+Math.sin(a)*.3);g.lineTo(Math.cos(a)*l-.1,-.35+Math.sin(a)*l*.9);g.lineTo(Math.cos(a+.2)*.35,-.35+Math.sin(a+.2)*.35);g.fill();}
   if(wild){
    // Moth skull: rounded bone plate, deep sockets and plumed antennae.
    for(const [s,dk] of [[-1,true],[1,false]]){g.save();g.scale(s,1);g.strokeStyle=dk?'#4a4458':'#8a83a4';g.lineWidth=.06;g.beginPath();g.moveTo(.1,-.7);g.quadraticCurveTo(.5,-1.6,1.1,-1.75);g.stroke();
     for(let i=1;i<9;i++){const t=i/9,x=.1+(1-Math.pow(1-t,2))*1,y=-.7-t*1.05;g.lineWidth=.03;g.beginPath();g.moveTo(x,y);g.lineTo(x+.12,y+.2);g.moveTo(x,y);g.lineTo(x-.15,y-.08);g.stroke();}g.restore();}
    const half=v==='elite';
    bone(g,g=>{g.beginPath();g.moveTo(0,-.95);g.bezierCurveTo(.6,-.95,.7,-.2,.4,.25);g.quadraticCurveTo(.15,.55,0,.45);g.quadraticCurveTo(-.25,.4,-.5,.1);g.bezierCurveTo(-.7,-.3,-.5,-.95,0,-.95);g.closePath();},[-.6,-1,.7,.5],{dark:true});
    for(const [ex,s] of [[.28,.17],[-.18,.13]]){g.fillStyle='#05040a';g.beginPath();g.ellipse(ex,-.35,s,s*.8,0,0,TAU);g.fill();g.fillStyle=P.cyan;g.beginPath();g.ellipse(ex+.02,-.35,s*.45,s*.32,0,0,TAU);g.fill();g.fillStyle=P.cyanHot;g.beginPath();g.arc(ex+.03,-.36,s*.15,0,TAU);g.fill();}
    crack(g,[.05,-.9,.1,-.65,0,-.5],P.cyan,.03);
    if(half){bone(g,g=>{g.beginPath();g.moveTo(.05,-1.25);g.lineTo(.62,-.75);g.lineTo(.55,-.05);g.lineTo(.3,.4);g.lineTo(.1,-.1);g.closePath();},[0,-1.3,.65,.45]);
     g.fillStyle='#05040a';g.beginPath();g.moveTo(.18,-.42);g.lineTo(.5,-.5);g.lineTo(.42,-.3);g.closePath();g.fill();g.fillStyle=P.cyan;g.beginPath();g.moveTo(.24,-.42);g.lineTo(.46,-.47);g.lineTo(.41,-.36);g.closePath();g.fill();crack(g,[.35,-1,.4,-.7,.3,-.55],P.cyan,.03);}
    return;
   }
   const horn=(s,dark)=>{g.save();g.scale(s,1);bone(g,g=>{g.beginPath();g.moveTo(.15,-.68);g.bezierCurveTo(1.2,-.85,1.6,-1.65,.95,-2.3);g.bezierCurveTo(1.18,-1.6,.95,-1.08,.3,-1.0);g.closePath();},[.15,-2.3,1.5,-.68],{dark});
    if(!(glass&&s<0))crack(g,[.7,-1.05,.98,-1.3,1.02,-1.6,1.12,-1.75],P.amber,.04);crack(g,[1.0,-1.32,1.18,-1.36],P.amber,.03);g.restore();};
   if(!glass){horn(-1,true);horn(1,false);}else{horn(1,false);g.save();g.scale(-1,1);bone(g,g=>{g.beginPath();g.moveTo(.18,-.72);g.lineTo(.6,-.95);g.lineTo(.5,-1.18);g.lineTo(.38,-1.0);g.lineTo(.3,-.98);g.closePath();},[.15,-1.2,.65,-.7],{dark:true});g.restore();}
   if(glass){
    // Shattered mask: the dark feathered skull blazes through a broken rim.
    g.fillStyle='#160b18';g.beginPath();g.moveTo(0,-.95);g.bezierCurveTo(.55,-.9,.6,-.25,.35,.2);g.quadraticCurveTo(.12,.5,-.05,.35);g.bezierCurveTo(-.5,.1,-.55,-.85,0,-.95);g.fill();g.strokeStyle=P.outline;g.lineWidth=.05;g.stroke();
    bone(g,g=>{g.beginPath();g.moveTo(-.48,-.7);g.lineTo(-.15,-1.02);g.lineTo(-.05,-.8);g.lineTo(-.22,-.55);g.lineTo(-.12,-.3);g.lineTo(-.4,-.05);g.lineTo(-.52,-.4);g.closePath();},[-.55,-1.05,-.05,0]);
    for(const [ex,s] of [[.28,.2],[-.06,.15]]){g.fillStyle=P.amberDeep;g.beginPath();g.ellipse(ex,-.38,s,s*.6,-.3,0,TAU);g.fill();g.fillStyle=P.amberHot;g.beginPath();g.ellipse(ex,-.38,s*.6,s*.32,-.3,0,TAU);g.fill();}
    crack(g,[.1,-.8,.25,-.6,.2,-.1,.3,.1],P.amber,.04);
    return;
   }
   // Crested ivory skull mask with a trident ridge and eye slits.
   bone(g,g=>{g.beginPath();g.moveTo(.05,-1.25);g.bezierCurveTo(.3,-1.05,.62,-.85,.6,-.45);g.bezierCurveTo(.58,-.1,.42,.15,.2,.62);g.quadraticCurveTo(.05,.2,-.08,.08);g.bezierCurveTo(-.4,-.15,-.52,-.5,-.42,-.78);g.quadraticCurveTo(-.2,-1,.05,-1.25);g.closePath();},[-.5,-1.25,.62,.62]);
   bone(g,g=>{g.beginPath();g.moveTo(.06,-1.45);g.lineTo(.16,-1.05);g.lineTo(.3,-1.12);g.lineTo(.18,-.82);g.lineTo(.12,-.48);g.lineTo(.0,-.82);g.lineTo(-.14,-1.1);g.lineTo(-.02,-1.05);g.closePath();},[-.14,-1.45,.3,-.48]);
   for(const [x,y,w,s] of [[.3,-.4,.24,1],[-.16,-.42,.17,-1]]){g.fillStyle='#120708';g.beginPath();g.moveTo(x-w*.5*s,y-.07);g.lineTo(x+w*.5*s,y-.13);g.lineTo(x+w*.3*s,y+.05);g.closePath();g.fill();g.fillStyle=P.amber;g.beginPath();g.moveTo(x-w*.32*s,y-.06);g.lineTo(x+w*.4*s,y-.11);g.lineTo(x+w*.24*s,y+.02);g.closePath();g.fill();g.fillStyle=P.amberHot;g.beginPath();g.arc(x+w*.08*s,y-.06,.035,0,TAU);g.fill();}
   const sets=[[.42,-.85,.32,-.65,.38,-.52],[-.3,-.7,-.2,-.55,-.28,-.35,-.18,-.2],[.2,.1,.32,-.1,.46,-.12,.5,-.25]];
   g.lineCap='round';
   for(let i=0;i<lvl&&i<3;i++){g.strokeStyle='#2a1c14';g.lineWidth=.05;const s=sets[i];g.beginPath();g.moveTo(s[0],s[1]);for(let j=2;j<s.length;j+=2)g.lineTo(s[j],s[j+1]);g.stroke();g.strokeStyle=css(P.amberDeep,.8);g.lineWidth=.018;g.stroke();}
  }},
  pauldron:{box:[-.24*k,-.2*k,.26*k,.24*k],paint(g){g.scale(.62,.62);bone(g,g=>{g.beginPath();g.moveTo(-.18*k,.12*k);g.quadraticCurveTo(-.2*k,-.12*k,0,-.14*k);g.lineTo(.08*k,-.2*k);g.lineTo(.1*k,-.1*k);g.quadraticCurveTo(.24*k,-.04*k,.2*k,.14*k);g.quadraticCurveTo(0,.06*k,-.18*k,.12*k);g.closePath();},[-.2*k,-.2*k,.24*k,.14*k]);if(!wild)crack(g,[-.05*k,-.08*k,.05*k,0,.02*k,.08*k],P.amber,.014);}},
  upper:{box:[-.24*k,-.14*k,.16*k,L1+.18*k],paint(g,r){fringe(g,L1,.06*k,look);fur(g,capsule(L1,.07*k,.055*k),[-.13*k,-.11*k,.13*k,L1+.09*k],look,r);}},
  fore:{box:[-.2*k,-.12*k,.24*k,L2+.24*k],paint(g,r){
   const kn=look.kind==='brawler';
   fur(g,capsule(L2,.06*k,kn?.085*k:.05*k),[-.11*k,-.09*k,.11*k,L2+.1*k],look,r);
   // Bracer and claws.
   bone(g,g=>{g.beginPath();g.moveTo(-.075*k,L2*.3);g.lineTo(.085*k,L2*.26);g.lineTo(.095*k,L2*.6);g.lineTo(-.08*k,L2*.64);g.closePath();},[-.08*k,L2*.26,.095*k,L2*.64]);
   if(kn)bone(g,g=>{g.beginPath();g.moveTo(.11*k,L2*.3);g.lineTo(.22*k,L2*.4);g.lineTo(.12*k,L2*.5);g.closePath();},[.1*k,L2*.3,.22*k,L2*.5]);
   g.fillStyle=accent;g.beginPath();g.moveTo(0,L2*.36);g.lineTo(.03*k,L2*.45);g.lineTo(0,L2*.54);g.lineTo(-.03*k,L2*.45);g.closePath();g.fill();
   g.fillStyle=wild?'#1c1928':P.furDeep;g.beginPath();g.ellipse(0,L2+.02,.1*k,.08*k,0,0,TAU);g.fill();
   for(let i=0;i<3;i++){const x=(-.06+i*.06)*k;bone(g,g=>{g.beginPath();g.moveTo(x-.025*k,L2+.04);g.quadraticCurveTo(x+.06*k,L2+.12*k,x+.07*k,L2+.2*k);g.quadraticCurveTo(x+.01*k,L2+.12*k,x+.025*k,L2+.04);g.closePath();},[x-.03*k,L2,x+.08*k,L2+.2*k]);}
  }},
  thigh:{box:[-.26*k,-.12*k,.16*k,T1+.18*k],paint(g,r){fringe(g,T1,.075*k,look,3);fur(g,capsule(T1,.09*k,.06*k),[-.13*k,-.11*k,.13*k,T1+.08*k],look,r);}},
  shin:{box:[-.14*k,-.12*k,.3*k,T2+.08],paint(g,r){
   fur(g,capsule(T2,.06*k,.045*k),[-.08*k,-.06*k,.08*k,T2+.05*k],look,r);
   bone(g,g=>{g.beginPath();g.moveTo(.02*k,-.04*k);g.lineTo(.12*k,-.09*k);g.lineTo(.06*k,.08*k);g.lineTo(.055*k,T2*.55);g.lineTo(-.01*k,T2*.4);g.closePath();},[-.01*k,-.09*k,.12*k,T2*.55]);
   g.fillStyle=wild?'#1c1928':P.furDeep;g.beginPath();g.ellipse(.04*k,T2,.1*k,.05,0,0,TAU);g.fill();
   for(let i=0;i<3;i++){const x=(-.02+i*.07)*k;bone(g,g=>{g.beginPath();g.moveTo(x,T2-.02);g.quadraticCurveTo(x+.08*k,T2-.01,x+.12*k,T2+.05);g.quadraticCurveTo(x+.06*k,T2+.04,x,T2+.04);g.closePath();},[x,T2-.02,x+.12*k,T2+.05]);}
  }},
  wing:{box:[-.5*W,-.08,.16*W,1.08*W],paint(g,r){
   const tip=wild?'#45405e':mix(P.crimsonDeep,P.crimson,.25),root=wild?'#24202f':P.furDeep;
   // One cohesive fan: a bone spar on the leading edge and scalloped feather tips behind it.
   const tips=[[.05,1.02],[-.12,.96],[-.26,.86],[-.37,.72],[-.42,.56],[-.38,.4],[-.28,.25],[-.14,.12]].map(([x,y])=>[x*W,y*W]);
   const path=g=>{g.beginPath();g.moveTo(.02*W,0);g.quadraticCurveTo(.12*W,.5*W,tips[0][0],tips[0][1]);
    for(let i=1;i<tips.length;i++){const [px,py]=tips[i-1],[x,y]=tips[i];g.quadraticCurveTo((px+x)/2*.82,(py+y)/2*.9,x,y);}g.lineTo(-.02*W,.02*W);g.closePath();};
   const v=g.createLinearGradient(0,0,-.2*W,W);v.addColorStop(0,root);v.addColorStop(.45,wild?'#2e2a3a':P.fur);v.addColorStop(1,tip);g.fillStyle=v;path(g);g.fill();
   g.save();path(g);g.clip();
   for(let i=0;i<tips.length;i++){const [x,y]=tips[i];g.strokeStyle=css(P.outline,.55);g.lineWidth=.014;g.beginPath();g.moveTo(.03*W,.05*W+i*.03*W);g.quadraticCurveTo(x*.5,y*.5+.05*W,x,y);g.stroke();g.strokeStyle=css(wild?'#8f88b0':P.furRim,.22);g.lineWidth=.02;g.beginPath();g.moveTo(.04*W,.07*W+i*.03*W);g.quadraticCurveTo(x*.5+.02*W,y*.5+.06*W,x+.02*W,y-.03*W);g.stroke();}
   if(wild){g.fillStyle='#0a0910';g.beginPath();g.arc(-.17*W,.55*W,.075*W,0,TAU);g.fill();g.strokeStyle=P.cyan;g.lineWidth=.022*W;g.stroke();g.fillStyle=P.cyanHot;g.beginPath();g.arc(-.16*W,.54*W,.022*W,0,TAU);g.fill();}
   g.restore();
   g.strokeStyle=P.outline;g.lineWidth=.03;g.lineJoin='round';path(g);g.stroke();
   bone(g,g=>{g.beginPath();g.moveTo(-.03,0);g.quadraticCurveTo(.1*W,.5*W,.05*W,1.03*W);g.quadraticCurveTo(.16*W,.55*W,.06,-.02);g.closePath();},[-.03,0,.13*W,1.03*W]);
   for(const t of [.3,.55,.78])bone(g,g=>{g.beginPath();g.moveTo(.08*W,t*W-.03);g.lineTo(.17*W,t*W+.01*W);g.lineTo(.08*W,t*W+.04);g.closePath();},[.07*W,t*W-.03,.17*W,t*W+.05]);
   if(!wild)crack(g,[.05*W,.15*W,.07*W,.4*W,.065*W,.7*W],P.amber,.014);
  }},
  glaive:{box:[-.12,-1.05,.2,.5],paint(g){
   bone(g,g=>{g.beginPath();g.rect(-.025,-.6,.05,1.05);},[-.03,-.6,.03,.45],{dark:true});
   g.fillStyle=P.crimson;g.fillRect(-.035,-.08,.07,.14);
   bone(g,g=>{g.beginPath();g.moveTo(-.03,-.58);g.quadraticCurveTo(-.11,-.78,-.01,-1.05);g.quadraticCurveTo(.16,-.8,.09,-.55);g.lineTo(.15,-.5);g.lineTo(.03,-.5);g.closePath();},[-.11,-1.05,.16,-.5]);
   crack(g,[.02,-.95,.03,-.8,.02,-.62],P.amber,.016);g.strokeStyle=P.amber;g.lineWidth=.014;g.beginPath();g.arc(.03,-.75,.03,0,TAU);g.stroke();
   bone(g,g=>{g.beginPath();g.moveTo(-.03,.42);g.lineTo(0,.52);g.lineTo(.03,.42);g.closePath();},[-.03,.42,.03,.52]);
  }},
  bow:{box:[-.12,-.62,.32,.62],paint(g){g.scale(.8,.8);
   bone(g,g=>{g.beginPath();g.moveTo(-.02,-.58);g.bezierCurveTo(.3,-.4,.28,.4,-.02,.58);g.bezierCurveTo(.2,.35,.2,-.35,-.02,-.58);g.closePath();},[-.02,-.58,.28,.58]);
   for(const s of [-1,1])bone(g,g=>{g.beginPath();g.moveTo(.18,s*.3);g.lineTo(.3,s*.36);g.lineTo(.2,s*.4);g.closePath();},[.18,-.4,.3,.4]);
   crack(g,[.15,-.4,.2,-.2,.19,0,.21,.2,.15,.4],P.amber,.014);
   g.fillStyle=P.crimson;g.fillRect(.08,-.06,.08,.12);
  }},
  quiver:{box:[-.1,-.42,.12,.32],paint(g){
   g.fillStyle='#3b2a26';g.beginPath();g.moveTo(-.07,-.2);g.lineTo(.07,-.22);g.lineTo(.06,.3);g.lineTo(-.06,.3);g.closePath();g.fill();g.strokeStyle=P.outline;g.lineWidth=.025;g.stroke();
   for(let i=0;i<3;i++){const x=-.04+i*.04;g.strokeStyle='#1a1014';g.lineWidth=.02;g.beginPath();g.moveTo(x,-.2);g.lineTo(x+.02,-.36);g.stroke();g.fillStyle=P.amber;g.beginPath();g.moveTo(x+.02,-.42);g.lineTo(x+.045,-.34);g.lineTo(x,-.35);g.closePath();g.fill();}
  }}
 };
};

// ---- Old Glasswing: four-winged moth matriarch. Units: 1 = entity height. ----
const BOSS_PARTS={
 fore:{box:[-.04,-.05,.62,1.18],paint(g){
  // Forewing: glass panes framed by dark veins and an ivory leading edge.
  const path=g=>{g.beginPath();g.moveTo(0,0);g.bezierCurveTo(.15,.25,.5,.75,.55,1.12);g.bezierCurveTo(.4,1.15,.2,.95,.08,.75);g.bezierCurveTo(.05,.55,-.02,.3,0,0);g.closePath();};
  g.fillStyle=css('#0d2a36',.55);path(g);g.fill();
  g.save();path(g);g.clip();
  const v=g.createLinearGradient(0,0,.5,1.1);v.addColorStop(0,css(P.cyan,.08));v.addColorStop(1,css(P.cyanHot,.35));g.fillStyle=v;g.fillRect(-.1,-.1,.8,1.3);
  g.strokeStyle='#120a14';g.lineWidth=.016;
  for(let i=0;i<6;i++){g.beginPath();g.moveTo(.02,.05);g.quadraticCurveTo(.1+i*.04,.5,.15+i*.08,1.15);g.stroke();}
  for(let i=0;i<5;i++){g.beginPath();g.moveTo(0,.25+i*.18);g.quadraticCurveTo(.25,.3+i*.2,.6,.35+i*.2);g.stroke();}
  g.fillStyle='#24142a';g.beginPath();g.moveTo(.6,.9);g.bezierCurveTo(.45,1.0,.3,.95,.1,.78);g.lineTo(.08,1.2);g.lineTo(.7,1.2);g.closePath();g.fill();
  g.fillStyle=css(P.bone,.9);for(let i=0;i<6;i++){g.beginPath();g.arc(.16+i*.07,.92+i*.035,.012,0,TAU);g.fill();}
  g.restore();
  g.strokeStyle=P.outline;g.lineWidth=.02;path(g);g.stroke();
  bone(g,g=>{g.beginPath();g.moveTo(-.02,0);g.bezierCurveTo(.16,.24,.5,.74,.56,1.12);g.bezierCurveTo(.46,.74,.14,.26,.03,-.02);g.closePath();},[-.02,-.02,.56,1.12],{u:.25});
  crack(g,[.2,.32,.3,.48,.36,.6],P.cyan,.008);
 }},
 hind:{box:[-.04,-.05,.5,.85],paint(g){
  const path=g=>{g.beginPath();g.moveTo(0,0);g.bezierCurveTo(.3,.08,.5,.35,.42,.6);g.quadraticCurveTo(.38,.72,.3,.82);g.quadraticCurveTo(.25,.66,.18,.62);g.bezierCurveTo(.05,.5,-.02,.3,0,0);g.closePath();};
  g.fillStyle=css('#102a36',.6);path(g);g.fill();
  g.save();path(g);g.clip();
  g.fillStyle=css(P.cyan,.16);g.fillRect(-.1,-.1,.7,1);
  g.strokeStyle='#120a14';g.lineWidth=.014;for(let i=0;i<5;i++){g.beginPath();g.moveTo(.02,.02);g.quadraticCurveTo(.15+i*.05,.3,.12+i*.08,.75);g.stroke();}
  g.fillStyle='#24142a';g.beginPath();g.moveTo(.45,.4);g.quadraticCurveTo(.3,.55,.15,.58);g.lineTo(.3,.9);g.lineTo(.55,.6);g.closePath();g.fill();
  // An amber-ringed eyespot: the stolen heart-light it guards.
  g.fillStyle='#08060a';g.beginPath();g.arc(.27,.42,.06,0,TAU);g.fill();g.strokeStyle=P.cyan;g.lineWidth=.014;g.stroke();g.fillStyle=P.cyanHot;g.beginPath();g.arc(.28,.41,.018,0,TAU);g.fill();
  g.restore();
  g.strokeStyle=P.outline;g.lineWidth=.018;path(g);g.stroke();
 }},
 body:{box:[-.3,-.62,.2,.04],paint(g,r){
  // Segmented abdomen under a furred thorax.
  fur(g,g=>{g.beginPath();g.ellipse(-.06,-.28,.15,.27,.35,0,TAU);},[-.24,-.56,.12,0],{wild:true},r,.25);
  g.strokeStyle=css('#0a0810',.85);g.lineWidth=.008;
  for(let i=1;i<5;i++){g.beginPath();g.moveTo(-.22+i*.035,-.5+i*.1);g.quadraticCurveTo(-.08+i*.03,-.44+i*.1,.06+i*.012,-.54+i*.1);g.stroke();}
 }},
 thorax:{box:[-.3,-.92,.3,-.3],paint(g,r){
  fur(g,g=>{g.beginPath();g.ellipse(.0,-.6,.2,.26,0,0,TAU);},[-.2,-.86,.2,-.34],{wild:true},r,.25);
  g.fillStyle='#e7dcc4';for(let i=0;i<11;i++){const a=Math.PI*(.9+i*.12);g.beginPath();g.moveTo(Math.cos(a)*.12,-.74+Math.sin(a)*.08);g.lineTo(Math.cos(a)*.28,-.74+Math.sin(a)*.17);g.lineTo(Math.cos(a+.12)*.12,-.74+Math.sin(a+.12)*.08);g.fill();}
   }},
 mask:{box:[-.38,-.62,.38,.26],paint(g,r,v){
  const glass=v==='glass',lvl=+(v||'0')||0;
  // Plumed antennae.
  for(const s of [-1,1]){g.save();g.scale(s,1);g.strokeStyle='#5a5470';g.lineWidth=.014;g.beginPath();g.moveTo(.06,-.22);g.quadraticCurveTo(.15,-.55,.36,-.6);g.stroke();for(let i=1;i<10;i++){const t=i/10,x=.06+t*.3,y=-.22-Math.sin(t*1.4)*.38;g.lineWidth=.008;g.beginPath();g.moveTo(x,y);g.lineTo(x+.03,y+.06);g.moveTo(x,y);g.lineTo(x-.04,y-.02);g.stroke();}g.restore();}
  if(glass){
   g.fillStyle='#0c0710';g.beginPath();g.ellipse(0,-.02,.2,.24,0,0,TAU);g.fill();
   bone(g,g=>{g.beginPath();g.moveTo(-.24,-.2);g.lineTo(-.05,-.28);g.lineTo(-.1,-.1);g.lineTo(-.02,.05);g.lineTo(-.15,.2);g.lineTo(-.26,0);g.closePath();},[-.26,-.28,-.02,.2],{u:.25});
   for(const [x,y] of [[.08,-.06],[.14,.04],[-.02,-.08]]){g.fillStyle=P.cyan;g.beginPath();g.arc(x,y,.028,0,TAU);g.fill();g.fillStyle=P.cyanHot;g.beginPath();g.arc(x,y,.012,0,TAU);g.fill();}
   return;
  }
  bone(g,g=>{g.beginPath();g.moveTo(0,-.32);g.bezierCurveTo(.26,-.3,.32,-.05,.24,.12);g.quadraticCurveTo(.12,.24,0,.25);g.quadraticCurveTo(-.12,.24,-.24,.12);g.bezierCurveTo(-.32,-.05,-.26,-.3,0,-.32);g.closePath();},[-.3,-.32,.3,.25],{u:.25});
  bone(g,g=>{g.beginPath();g.moveTo(0,-.42);g.lineTo(.05,-.28);g.lineTo(.02,-.05);g.lineTo(-.02,-.05);g.lineTo(-.05,-.28);g.closePath();},[-.05,-.42,.05,-.05],{u:.25});
  for(const s of [-1,1]){g.fillStyle='#071016';g.beginPath();g.moveTo(s*.04,-.06);g.lineTo(s*.2,-.12);g.lineTo(s*.17,0);g.closePath();g.fill();g.fillStyle=P.cyan;g.beginPath();g.moveTo(s*.07,-.06);g.lineTo(s*.18,-.1);g.lineTo(s*.16,-.03);g.closePath();g.fill();}
  const sets=[[-.02,-.3,.06,-.18,.03,-.1],[.18,-.22,.12,-.1,.2,.02,.14,.12],[-.2,-.15,-.12,-.02,-.18,.1],[.05,.08,0,.2]];
  g.lineCap='round';for(let i=0;i<Math.min(4,lvl+1);i++){const s=sets[i];g.strokeStyle='#14222a';g.lineWidth=.012;g.beginPath();g.moveTo(s[0],s[1]);for(let j=2;j<s.length;j+=2)g.lineTo(s[j],s[j+1]);g.stroke();g.strokeStyle=css(P.cyan,.8);g.lineWidth=.004;g.stroke();}
 }},
 leg:{box:[-.03,-.02,.03,.36],paint(g){bone(g,g=>{g.beginPath();g.moveTo(-.015,0);g.lineTo(.015,0);g.lineTo(.008,.34);g.lineTo(-.008,.34);g.closePath();},[-.015,0,.015,.34],{dark:true,u:.25});}}
};

// ---- part cache ----
export class Parts{
 constructor(){this.map=new Map();this.ppt=0;this.max=0;}
 reset(ppt){if(ppt!==this.ppt){this.ppt=ppt;this.map.clear();}}
 // scale: tiles per design unit. variant: crack level / glass / elite; tone: n (normal), d (back side), w (hit flash).
 get(look,name,scale=1,variant='',toneKey='n'){
  // Nested lookup: a cached part (every limb, every frame) builds no key string.
  const lk=look.id||look;let a=this.map.get(lk);if(!a)this.map.set(lk,a=Object.create(null));
  const b=a[name]||(a[name]=Object.create(null)),v=b[variant]||(b[variant]=Object.create(null)),slot=v[toneKey]||(v[toneKey]=new Map());
  let p=slot.get(scale);if(p!==undefined)return p;
  if(toneKey!=='n'){
   const base=this.get(look,name,scale,variant,'n');
   // a: amber, the possession form (the boss's light becomes the player's).
   p=base&&{...base,c:tinted(base.c,toneKey==='w'?'#ffffff':toneKey==='a'?'rgba(255,150,40,.42)':'rgba(8,4,14,.42)',toneKey==='w')};
  }else{
   const spec=look==='boss'?BOSS_PARTS[name]:(look.painters||(look.painters=P_(look)))[name];
   if(!spec){slot.set(scale,null);return null;}
   const [x0,y0,x1,y1]=spec.box,res=Math.min(this.ppt*scale,520),c=surface((x1-x0)*res,(y1-y0)*res),g=c?.getContext('2d');
   if(!g){slot.set(scale,null);return null;}
   g.setTransform(res,0,0,res,-x0*res,-y0*res);
   try{spec.paint(g,seeded(name+variant),variant);}catch{}
   p={c,x:x0,y:y0,w:x1-x0,h:y1-y0};
  }
  slot.set(scale,p);return p;
 }
}
function tinted(src,color,silhouette){
 const c=surface(src.width,src.height),g=c?.getContext('2d');if(!g)return src;
 g.drawImage(src,0,0);g.globalCompositeOperation='source-atop';g.fillStyle=color;g.fillRect(0,0,src.width,src.height);
 if(!silhouette){g.globalCompositeOperation='source-over';}
 return c;
}
