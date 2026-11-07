import {surface,seeded} from './surface.js';
import {css,mix,P} from './color.js';

// Procedural backdrops, drawn once per area/size into horizontally periodic offscreen layers.
const TAU=Math.PI*2;
const LAYERS=[{f:.05},{f:.16},{f:.36}];

function periodic(w,x,span,fn){fn(x);if(x-span<0)fn(x+w);if(x+span>w)fn(x-w);}
function vgrad(g,h,stops){const v=g.createLinearGradient(0,0,0,h);for(const [o,c] of stops)v.addColorStop(o,c);return v;}

// Segmented, curled finger bone rising from the ash.
function finger(g,x,base,len,wid,curl,fill,rim){
 let a=-Math.PI/2+curl*.15,px=x,py=base;const pts=[];
 for(let i=0;i<4;i++){const l=len*[.36,.28,.22,.14][i],nx=px+Math.cos(a)*l,ny=py+Math.sin(a)*l;pts.push([px,py,nx,ny,wid*(1-i*.17)]);px=nx;py=ny;a+=curl*.42;}
 g.lineCap='round';
 for(const [x0,y0,x1,y1,w] of pts){
  g.strokeStyle=fill;g.lineWidth=w;g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke();
  g.fillStyle=fill;g.beginPath();g.ellipse(x0,y0,w*.62,w*.5,0,0,TAU);g.fill();
  g.strokeStyle=rim;g.lineWidth=Math.max(1,w*.08);g.beginPath();g.moveTo(x0-w*.32,y0);g.lineTo(x1-w*.3,y1);g.stroke();
 }
 const e=pts[3],ew=e[4];
 g.fillStyle=fill;g.beginPath();g.moveTo(e[2]-ew*.4,e[3]);g.quadraticCurveTo(e[2]+Math.cos(a)*ew*1.6,e[3]+Math.sin(a)*ew*1.6,e[2]+ew*.4,e[3]);g.fill();
}
// Feather frond: a quill with barbs, used as trees in the canopy and as tufts elsewhere.
export function feather(g,x,y,len,ang,wid,fill,vein){
 g.save();g.translate(x,y);g.rotate(ang);
 g.fillStyle=fill;g.beginPath();g.moveTo(0,0);
 const n=14;
 for(let i=0;i<=n;i++){const t=i/n,w=Math.sin(Math.PI*Math.pow(t,.8))*wid*(1+(i%2)*.25);g.lineTo(w,-t*len);}
 for(let i=n;i>=0;i--){const t=i/n,w=Math.sin(Math.PI*Math.pow(t,.8))*wid*(1+((i+1)%2)*.25);g.lineTo(-w*.85,-t*len);}
 g.closePath();g.fill();
 g.strokeStyle=vein;g.lineWidth=Math.max(1,wid*.08);g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(wid*.1,-len*.5,0,-len);g.stroke();
 g.lineWidth=Math.max(.5,wid*.03);
 for(let i=2;i<n;i++){const t=i/n,w=Math.sin(Math.PI*t)*wid*.9;g.beginPath();g.moveTo(0,-t*len);g.lineTo(w,-t*len-len*.05);g.moveTo(0,-t*len);g.lineTo(-w*.8,-t*len-len*.05);g.stroke();}
 g.restore();
}
function rib(g,cx,base,rx,ry,th,fill,rim){
 g.lineCap='round';g.strokeStyle=fill;g.lineWidth=th;g.beginPath();g.ellipse(cx,base,rx,ry,0,Math.PI*1.04,Math.PI*1.96);g.stroke();
 g.strokeStyle=rim;g.lineWidth=Math.max(1,th*.12);g.beginPath();g.ellipse(cx,base-th*.25,rx,ry,0,Math.PI*1.1,Math.PI*1.6);g.stroke();
}
export function crystal(g,x,y,s,rnd,glow){
 if(glow){const r=s*1.8,v=g.createRadialGradient(x,y-s*.4,0,x,y-s*.4,r);v.addColorStop(0,css(P.cyan,.3));v.addColorStop(1,css(P.cyan,0));g.fillStyle=v;g.fillRect(x-r,y-s*.4-r,r*2,r*2);}
 for(let i=0;i<4;i++){
  const a=(rnd()-.5)*1.1,l=s*(.5+rnd()),w=s*.17;
  g.save();g.translate(x+(rnd()-.5)*s*.6,y);g.rotate(a);
  const v=g.createLinearGradient(0,0,0,-l);v.addColorStop(0,css(P.cyanDeep,.95));v.addColorStop(1,css(P.cyanHot,.95));
  g.fillStyle=v;g.beginPath();g.moveTo(-w,0);g.lineTo(-w*.8,-l*.8);g.lineTo(0,-l);g.lineTo(w*.8,-l*.8);g.lineTo(w,0);g.closePath();g.fill();
  g.strokeStyle=css('#03161f',.85);g.lineWidth=Math.max(.5,w*.18);g.stroke();
  g.strokeStyle=css('#ffffff',.6);g.lineWidth=Math.max(.5,w*.12);g.beginPath();g.moveTo(-w*.3,-l*.1);g.lineTo(-w*.25,-l*.75);g.stroke();
  g.restore();
 }
}
function dunes(g,w,h,y0,amp,fill,rnd,count=5){
 g.fillStyle=fill;g.beginPath();g.moveTo(0,h);
 const ph=[];for(let i=0;i<count;i++)ph.push(rnd()*TAU);
 for(let x=0;x<=w+1;x+=w/96){let y=y0;for(let i=0;i<count;i++)y-=Math.sin(x/w*TAU*(i+1)+ph[i])*amp/(i+1);g.lineTo(x,y);}
 g.lineTo(w,h);g.closePath();g.fill();
}

const painters={
 hand:[
  (g,w,h,t,r)=>{ // the god's fallen hand on the horizon
   const base=h*.8;
   g.fillStyle=t.far;g.beginPath();g.ellipse(w*.5,base+h*.05,w*.36,h*.09,0,0,TAU);g.fill();
   for(let i=0;i<5;i++){const x=w*(.24+i*.11)+r()*w*.02;periodic(w,x,h*.5,X=>finger(g,X,base+h*.02,h*(.55+r()*.25)*(i===0?.7:1),h*(.055+r()*.02),(i===0?-1:1)*(.5+r()*.5),t.far,css(t.light,.12)));}
   for(let i=0;i<3;i++){const x=w*(.8+i*.08);periodic(w,x,h*.3,X=>finger(g,X,base+h*.05,h*(.2+r()*.15),h*.04,1.4+r(),t.far,css(t.light,.08)));}
   dunes(g,w,h,h*.8,h*.03,t.far,r,3);
  },
  (g,w,h,t,r)=>{
   dunes(g,w,h,h*.8,h*.06,t.mid,r);
   for(let i=0;i<9;i++){const x=r()*w,l=h*(.2+r()*.25),a=(r()-.5)*.9;periodic(w,x,h*.3,X=>feather(g,X,h*.86,l,a,h*.03,mix(t.mid,'#000000',.2),css(t.light,.12)));}
   for(let i=0;i<6;i++){const x=r()*w,l=h*(.18+r()*.12),c=1+r();periodic(w,x,h*.2,X=>finger(g,X,h*.9,l,h*.035,c,t.mid,css(t.light,.1)));}
  },
  (g,w,h,t,r)=>{
   dunes(g,w,h,h*.9,h*.05,t.near,r);
   for(let i=0;i<4;i++){const x=r()*w,l=h*(.38+r()*.2),c=.9+r()*.6;periodic(w,x,h*.35,X=>finger(g,X,h*1.02,l,h*.075,c,t.near,css(t.light,.08)));}
  }
 ],
 canopy:[
  (g,w,h,t,r)=>{
   for(let i=0;i<14;i++){const x=r()*w,y=h*(.95+r()*.1),l=h*(.7+r()*.4),a=(r()-.5)*.35,wd=h*(.06+r()*.03);periodic(w,x,h*.4,X=>feather(g,X,y,l,a,wd,t.far,css(t.light,.08)));}
   dunes(g,w,h,h*.86,h*.02,t.far,r,2);
  },
  (g,w,h,t,r)=>{
   for(let i=0;i<10;i++){const x=r()*w,l=h*(.55+r()*.35),a=(r()-.5)*.5,wd=h*(.07+r()*.03);periodic(w,x,h*.4,X=>feather(g,X,h*1.05,l,a,wd,t.mid,css(t.light,.1)));}
   for(let i=0;i<7;i++){const x=r()*w,l=h*(.25+r()*.25),a=Math.PI+(r()-.5)*.4;periodic(w,x,h*.3,X=>feather(g,X,-h*.05,l,a,h*.05,t.mid,css(t.light,.08)));}
  },
  (g,w,h,t,r)=>{
   for(let i=0;i<6;i++){const x=r()*w,l=h*(.5+r()*.3),a=(r()-.5)*.7,wd=h*(.1+r()*.04);periodic(w,x,h*.45,X=>feather(g,X,h*1.08,l,a,wd,t.near,css(t.light,.07)));}
  }
 ],
 hollow:[
  (g,w,h,t,r)=>{
   for(let i=0;i<7;i++){const x=w*i/7+r()*w*.05;periodic(w,x,w*.2,X=>rib(g,X,h*1.05,w*.11,h*.95,h*.035,t.far,css(P.cyan,.12)));}
   g.fillStyle=t.far;g.fillRect(0,h*.12,w,h*.03);
   for(let x=0;x<w;x+=w/40){g.beginPath();g.ellipse(x,h*.135,w/90,h*.03,0,0,TAU);g.fill();}
  },
  (g,w,h,t,r)=>{
   for(let i=0;i<5;i++){const x=r()*w;periodic(w,x,w*.18,X=>rib(g,X,h*1.1,w*.13,h*.9,h*.06,t.mid,css(P.cyan,.1)));}
   for(let i=0;i<8;i++){ // translucent membranes
    const x=r()*w,len=h*(.3+r()*.4),wd=w*(.03+r()*.04);
    periodic(w,x,wd*2,X=>{const v=g.createLinearGradient(0,0,0,len);v.addColorStop(0,css('#3a2a50',.6));v.addColorStop(1,css('#3a2a50',0));g.fillStyle=v;g.beginPath();g.moveTo(X-wd,0);g.quadraticCurveTo(X-wd*.6,len*.6,X,len);g.quadraticCurveTo(X+wd*.6,len*.6,X+wd,0);g.fill();});
   }
  },
  (g,w,h,t,r)=>{
   dunes(g,w,h,h*.9,h*.04,t.near,r);
   for(let i=0;i<9;i++){const x=r()*w,y=h*(.88+r()*.05),s=h*(.06+r()*.06);periodic(w,x,h*.15,X=>crystal(g,X,y,s,seeded(i*7+1),true));}
  }
 ],
 skull:[
  (g,w,h,t,r)=>{ // inner dome of the skull, light leaking through its cracks
   g.fillStyle=t.far;g.fillRect(0,0,w,h*.3);
   for(let i=0;i<5;i++){const cx=w*i/5+w*.1;periodic(w,cx,w*.3,X=>{g.beginPath();g.ellipse(X,h*.35,w*.24,h*.32,0,Math.PI,TAU);g.lineTo(X+w*.24,0);g.lineTo(X-w*.24,0);g.fill();});}
   g.lineCap='round';
   for(let i=0;i<9;i++){let x=r()*w,y=h*(.02+r()*.25);const pts=[[x,y]];for(let j=0;j<6;j++){x+=(r()-.5)*w*.05;y+=h*.035;pts.push([x,y]);}
    for(const [lw,c] of [[h*.03,css(t.light,.18)],[h*.008,css(P.amberHot,.9)]]){g.strokeStyle=c;g.lineWidth=lw;g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(const p of pts)g.lineTo(p[0],p[1]);g.stroke();}}
   dunes(g,w,h,h*.84,h*.03,t.far,r,3);
  },
  (g,w,h,t,r)=>{
   for(let i=0;i<8;i++){const x=r()*w,ht=h*(.3+r()*.35),wd=h*(.04+r()*.04);periodic(w,x,wd*2,X=>{g.fillStyle=t.mid;g.beginPath();g.moveTo(X-wd,h);g.quadraticCurveTo(X-wd*.4,h-ht*.6,X+wd*.2,h-ht);g.quadraticCurveTo(X+wd*.5,h-ht*.5,X+wd,h);g.fill();g.strokeStyle=css(t.light,.15);g.lineWidth=wd*.12;g.beginPath();g.moveTo(X-wd*.8,h-ht*.1);g.quadraticCurveTo(X-wd*.35,h-ht*.6,X+wd*.15,h-ht*.97);g.stroke();});}
   dunes(g,w,h,h*.86,h*.04,t.mid,r);
  },
  (g,w,h,t,r)=>{
   dunes(g,w,h,h*.92,h*.05,t.near,r);
   for(let i=0;i<5;i++){const x=r()*w,l=h*(.3+r()*.2),c=.4+r()*.5;periodic(w,x,h*.3,X=>finger(g,X,h*1.02,l,h*.06,c,t.near,css(t.light,.1)));}
  }
 ]
};
// Foreground silhouettes pass in front of the play field near the screen edges.
const front={
 hand:(g,w,h,t,r)=>{for(let i=0;i<6;i++){const x=r()*w,l=h*(.06+r()*.05),a=(r()-.5)*1.2;periodic(w,x,h*.2,X=>feather(g,X,h*1.03,l,a,h*.018,'#050305','#1a1012'));}},
 canopy:(g,w,h,t,r)=>{for(let i=0;i<6;i++){const x=r()*w,l=h*(.16+r()*.12),a=Math.PI+(r()-.5)*.6;periodic(w,x,h*.3,X=>feather(g,X,-h*.04,l,a,h*.05,'#020405','#0c1416'));}for(let i=0;i<5;i++){const x=r()*w,l=h*(.06+r()*.05),a=(r()-.5)*1.1;periodic(w,x,h*.2,X=>feather(g,X,h*1.03,l,a,h*.02,'#020405','#0c1416'));}},
 hollow:(g,w,h,t,r)=>{for(let i=0;i<5;i++){const x=r()*w,len=h*(.08+r()*.1),wd=h*.05;periodic(w,x,wd*2,X=>{g.fillStyle='#030409';g.beginPath();g.moveTo(X-wd,0);g.quadraticCurveTo(X,len*1.6,X+wd,0);g.fill();});}for(let i=0;i<4;i++){const x=r()*w;periodic(w,x,h*.1,X=>crystal(g,X,h*1.03,h*.06,seeded(i+40),false));}},
 skull:(g,w,h,t,r)=>{for(let i=0;i<5;i++){const x=r()*w,l=h*(.05+r()*.05);periodic(w,x,h*.2,X=>finger(g,X,h*1.06,l,h*.05,.3,'#070403','#1d120c'));}}
};

export class Parallax{
 constructor(){this.theme=null;this.size=0;this.layers=[];this.front=null;this.fog=null;this.shafts=null;this.motes=[];this.mobile=false;}
 setTheme(theme){if(this.theme!==theme){this.theme=theme;this.size=0;this.sky=null;}}
 build(h){
  const t=this.theme,ch=Math.round(Math.max(64,Math.min(h,this.mobile?540:900))),cw=Math.round(ch*2.4);this.size=h;
  this.layers=painters[t.id].map((paint,i)=>{
   const c=surface(cw,ch),g=c?.getContext('2d');if(!g)return null;
   paint(g,cw,ch,t,seeded(t.id+i));
   // Distance haze: far layers sink into the fog colour.
   g.globalCompositeOperation='source-atop';g.fillStyle=vgrad(g,ch,[[0,css(t.fog,0)],[t.horizon,css(t.fog,.38-i*.12)],[1,css(t.fog,.1)]]);g.fillRect(0,0,cw,ch);
   return c;
  });
  const f=surface(cw,ch),fg=f?.getContext('2d');if(fg)front[t.id](fg,cw,ch,t,seeded(t.id+'front'));this.front=fg?f:null;
  const fh=Math.round(ch*.4),fog=surface(cw,fh),gg=fog?.getContext('2d');
  if(gg){const r=seeded(t.id+'fog');for(let i=0;i<26;i++){const x=r()*cw,y=fh*(.3+r()*.4),rad=ch*(.08+r()*.12);periodic(cw,x,rad,X=>{const v=gg.createRadialGradient(X,y,0,X,y,rad);v.addColorStop(0,css(t.fog,.55));v.addColorStop(1,css(t.fog,0));gg.fillStyle=v;gg.fillRect(X-rad,y-rad,rad*2,rad*2);});}}
  this.fog=gg?fog:null;
  const sh=surface(cw,ch),sg=sh?.getContext('2d');
  if(sg){const r=seeded(t.id+'shafts');for(let i=0;i<7;i++){const x=r()*cw,wd=ch*(.04+r()*.1),sk=ch*.45;periodic(cw,x,wd+sk,X=>{const v=sg.createLinearGradient(0,0,0,ch);v.addColorStop(0,css(t.light,.9));v.addColorStop(.75,css(t.light,.12));v.addColorStop(1,css(t.light,0));sg.fillStyle=v;sg.beginPath();sg.moveTo(X,0);sg.lineTo(X+wd,0);sg.lineTo(X+wd+sk,ch);sg.lineTo(X+sk-wd*.5,ch);sg.closePath();sg.fill();});}}
  this.shafts=sg?sh:null;
  const r=seeded(t.id+'motes'),n=this.mobile?24:56;
  this.motes=Array.from({length:n},()=>({x:r(),y:r(),z:.55+r()*.7,s:.5+r(),p:r()*TAU,v:.4+r()*.6}));
 }
 tile(g,c,ox,oy,W,dh){
  if(!c)return;const dw=dh*c.width/c.height;let x=((ox%dw)+dw)%dw-dw;
  for(;x<W;x+=dw)g.drawImage(c,x,oy,dw+1,dh);
 }
 back(g,cam,W,H,frame){
  const t=this.theme;if(!t)return;
  if(this.size!==H)this.build(H);
  if(!this.sky||this.sky.h!==H)this.sky={h:H,v:vgrad(g,H,t.sky.map((c,i)=>[i/(t.sky.length-1),c]))};
  g.fillStyle=this.sky.v;g.fillRect(0,0,W,H);
  const u=H/10,dy=(cam.y-5)*u;
  // Light shafts sit between the sky and the far silhouettes.
  g.globalCompositeOperation='lighter';g.globalAlpha=t.lightAlpha*(.8+.2*Math.sin(frame*.01));
  this.tile(g,this.shafts,-cam.x*u*.08+Math.sin(frame*.003)*u,dy*.02-H*.05,W,H*1.1);
  g.globalCompositeOperation='source-over';g.globalAlpha=1;
  for(let i=0;i<this.layers.length;i++){
   const dh=H*(1.08+i*.04);
   this.tile(g,this.layers[i],-cam.x*u*LAYERS[i].f,H-dh+dy*LAYERS[i].f*1.6+H*.03*i,W,dh);
   if(i===0){g.globalAlpha=t.fogAlpha;this.tile(g,this.fog,-cam.x*u*.1-frame*.15,H*t.horizon-H*.25,W,H*.4);g.globalAlpha=1;}
  }
  g.globalAlpha=t.fogAlpha*.8;this.tile(g,this.fog,-cam.x*u*.45-frame*.3,H*.62+dy*.4,W,H*.42);g.globalAlpha=1;
 }
 // Drawn after the world: low fog, foreground silhouettes, motes and the vignette.
 over(g,cam,W,H,frame,glass=0,bare=false){
  const t=this.theme;if(!t)return;const u=H/10,dy=(cam.y-5)*u;
  g.globalAlpha=t.fogAlpha*.5;this.tile(g,this.fog,-cam.x*u*1.1-frame*.5,H*.8+dy*1.1,W,H*.34);g.globalAlpha=1;
  if(!bare)this.tile(g,this.front,-cam.x*u*1.35,dy*1.35-H*.02,W,H*1.04);
  this.drawMotes(g,cam,W,H,frame,u);
  if(!this.vig||this.vig.w!==W||this.vig.h!==H){const v=g.createRadialGradient(W/2,H*.48,Math.min(W,H)*.3,W/2,H*.5,Math.hypot(W,H)*.62);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(.7,'rgba(4,2,6,.32)');v.addColorStop(1,'rgba(2,1,3,.82)');this.vig={w:W,h:H,v};}
  g.fillStyle=this.vig.v;g.fillRect(0,0,W,H);
  if(glass>0){
   if(!this.ge||this.ge.w!==W||this.ge.h!==H){const v=g.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.hypot(W,H)*.6);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,css(P.amberDeep,.6));this.ge={w:W,h:H,v};}
   g.globalCompositeOperation='lighter';g.globalAlpha=Math.min(1,glass);g.fillStyle=this.ge.v;g.fillRect(0,0,W,H);g.globalAlpha=1;g.globalCompositeOperation='source-over';
  }
 }
 drawMotes(g,cam,W,H,frame,u){
  const t=this.theme,kind=t.motes,col=t.moteColor;
  if(kind!=='ash')g.globalCompositeOperation='lighter';
  const span=W+u*2;
  for(const m of this.motes){
   const drift=kind==='ash'?frame*.0006*m.v:kind==='scales'?frame*.0003*m.v:0;
   const rise=kind==='ash'||kind==='scales'?-frame*.0004*m.v:frame*.0005*m.v;
   let x=(m.x-drift)*span-cam.x*u*m.z+Math.sin(frame*.01*m.v+m.p)*u*.3;x=((x%span)+span)%span-u;
   const y=((m.y-rise)%1+1)%1*H*1.1-H*.05+(cam.y-5)*u*m.z*.3,s=u*.035*m.s*m.z;
   if(kind==='ash'){g.fillStyle=css(col,.5*m.z);g.save();g.translate(x,y);g.rotate(frame*.02*m.v+m.p);g.fillRect(-s,-s*.4,s*2,s*.8);g.restore();}
   else if(kind==='scales'){const fl=Math.abs(Math.sin(frame*.03*m.v+m.p));g.globalAlpha=.35*m.z;g.fillStyle=fl>.5?'#d9a6ff':col;g.beginPath();g.moveTo(x,y-s*1.4);g.lineTo(x+s*fl,y);g.lineTo(x,y+s*1.4);g.lineTo(x-s*fl,y);g.fill();g.globalAlpha=1;}
   else{const fl=kind==='embers'?.5+.5*Math.sin(frame*.15*m.v+m.p):.6+.4*Math.sin(frame*.05+m.p);g.globalAlpha=Math.max(0,.22*fl*m.z);g.fillStyle=col;g.beginPath();g.arc(x,y,s*2.6,0,TAU);g.fill();g.globalAlpha=Math.max(0,Math.min(1,.8*fl*m.z));g.beginPath();g.arc(x,y,s*.8,0,TAU);g.fill();g.globalAlpha=1;}
  }
  g.globalCompositeOperation='source-over';
 }
}
