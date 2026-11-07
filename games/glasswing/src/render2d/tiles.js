import {surface,seeded,glow} from './surface.js';
import {css,mix,P} from './color.js';
import {feather,crystal} from './parallax.js';

// Tiles are painted once per block and zoom bucket. A block paints every neighbouring tile
// clipped to its own rectangle, so overhanging details join seamlessly across blocks.
const B=6,MAX_BLOCKS=48,BUCKETS=[16,24,32,48,64,96,128,160],DEPTH=-4;
const TAU=Math.PI*2;
const solidT=t=>t===1||t===4;

export function tileAt(level,x,y){
 if(!level?.grid)return 0;
 if(y<0)return solidT(level.grid[0]?.[x])?1:0;
 return level.grid[y]?.[x]||0;
}

function cap(g,x,y,t,r){
 // Lip of the exposed surface: ash, feather moss, bone or skull plate, with a soft underside.
 const th=.14,top=-y-1,edge=i=>top+th*(.7+.3*Math.sin((x+i/6)*4.1+r));
 g.fillStyle=t.top;g.beginPath();g.moveTo(x,top-.015);for(let i=0;i<=6;i++)g.lineTo(x+i/6,edge(i));g.lineTo(x+1,top-.015);g.closePath();g.fill();
 g.fillStyle=css(t.topShade,.8);g.beginPath();for(let i=0;i<=6;i++)g.lineTo(x+i/6,edge(i));for(let i=6;i>=0;i--)g.lineTo(x+i/6,edge(i)+.05);g.closePath();g.fill();
 g.strokeStyle=css(P.boneRim,.5);g.lineWidth=.022;g.beginPath();g.moveTo(x,top+.018);g.lineTo(x+1,top+.018);g.stroke();
}
function topDetail(g,x,y,t,rnd){
 const sx=x+.15+rnd()*.7;
 if(t.id==='canopy'){for(let i=0;i<2;i++)feather(g,x+rnd(),-y-1+.06,.25+rnd()*.3,(rnd()-.5)*1.2,.06,mix(t.top,'#000000',.2),css('#9a7aa8',.4));}
 else if(t.id==='hand'){
  if(rnd()<.5){g.fillStyle=css(P.bone,.9);g.beginPath();g.moveTo(sx-.05,-y-1+.04);g.lineTo(sx+.02,-y-1-.18-rnd()*.15);g.lineTo(sx+.07,-y-1+.04);g.fill();}
  g.fillStyle=css('#9a8a80',.7);g.beginPath();g.ellipse(x+rnd(),-y-1+.03,.18+rnd()*.15,.05,0,Math.PI,TAU);g.fill();
 }else if(t.id==='hollow'){if(rnd()<.3)crystal(g,sx,-y-1+.05,.22,rnd,true);}
 else if(rnd()<.6){g.strokeStyle=css(P.amber,.85);g.lineWidth=.02;g.beginPath();g.moveTo(sx,-y-1+.04);g.lineTo(sx+.08,-y-1+.16);g.lineTo(sx+.02,-y-1+.3);g.stroke();}
}
function body(g,x,y,t,depth,rnd){
 const v=g.createLinearGradient(0,-y-1,0,-y);
 const c0=mix(t.stone,t.stoneDark,Math.min(1,depth/2.5)),c1=mix(t.stone,t.stoneDark,Math.min(1,(depth+1)/2.5));
 v.addColorStop(0,c0);v.addColorStop(1,c1);g.fillStyle=v;g.fillRect(x-.002,-y-1-.002,1.004,1.004);
 if(depth>3)return;
 // Bone plates and fibres give the slab a carved, organic grain.
 for(let i=0;i<2;i++){
  const px=x+rnd()*.8,py=-y-1+rnd()*.8,w=.25+rnd()*.35,h=.12+rnd()*.12;
  g.fillStyle=css(mix(t.stone,t.topShade,.35),.35*(1-depth/3));g.beginPath();g.ellipse(px+w/2,py+h/2,w/2,h/2,(rnd()-.5)*.4,0,TAU);g.fill();
  g.strokeStyle=css(t.stoneDark,.6);g.lineWidth=.015;g.stroke();
 }
 g.strokeStyle=css(t.stoneDark,.55);g.lineWidth=.018;g.beginPath();
 const cx=x+rnd(),cy=-y-1+rnd()*.5;g.moveTo(cx,cy);g.lineTo(cx+(rnd()-.5)*.3,cy+.25);g.lineTo(cx+(rnd()-.5)*.4,cy+.5);g.stroke();
}
function edges(g,x,y,level){
 g.strokeStyle=P.outline;g.lineWidth=.05;g.beginPath();
 const up=tileAt(level,x,y+1),l=tileAt(level,x-1,y),r=tileAt(level,x+1,y),dn=tileAt(level,x,y-1);
 if(!solidT(up)&&up!==3){g.moveTo(x,-y-1);g.lineTo(x+1,-y-1);}
 if(!solidT(l)){g.moveTo(x,-y-1);g.lineTo(x,-y);}
 if(!solidT(r)){g.moveTo(x+1,-y-1);g.lineTo(x+1,-y);}
 if(!solidT(dn)&&y>0){g.moveTo(x,-y);g.lineTo(x+1,-y);}
 g.stroke();
 g.strokeStyle=css(P.boneRim,.12);g.lineWidth=.03;g.beginPath();
 if(!solidT(l)){g.moveTo(x+.04,-y-1);g.lineTo(x+.04,-y);}
 g.stroke();
}
function platform(g,x,y,t,level,rnd){
 const l=tileAt(level,x-1,y)===2,r=tileAt(level,x+1,y)===2,top=-y-1,th=.2;
 const wood=t.id==='canopy'?'#2b1f2e':t.id==='hollow'?'#bdb09a':t.id==='skull'?'#e8dbbd':'#d2c3a3';
 const shade=t.id==='canopy'?'#140c16':mix(wood,'#000000',.45);
 // Hanging fibres under ribs and branches.
 g.strokeStyle=css(t.id==='hollow'?'#4a3a5c':'#2a1a26',.7);g.lineWidth=.018;
 for(let i=0;i<3;i++){const fx=x+rnd(),fl=.15+rnd()*.35;g.beginPath();g.moveTo(fx,top+th*.8);g.quadraticCurveTo(fx+.04,top+fl*.6,fx-.02,top+th+fl);g.stroke();}
 const sag=Math.sin(x*1.7)*.02;
 const v=g.createLinearGradient(0,top,0,top+th);v.addColorStop(0,wood);v.addColorStop(1,shade);
 g.fillStyle=v;g.beginPath();g.moveTo(x-(l?.01:0),top+sag);g.lineTo(x+1+(r?.01:0),top-sag);g.lineTo(x+1+(r?.01:0),top+th*(r?1:.7)-sag);g.quadraticCurveTo(x+.5,top+th*1.15,x-(l?.01:0),top+th*(l?1:.7)+sag);g.closePath();g.fill();
 g.strokeStyle=P.outline;g.lineWidth=.04;g.beginPath();g.moveTo(x,top+sag);g.lineTo(x+1,top-sag);g.moveTo(x,top+th+sag);g.quadraticCurveTo(x+.5,top+th*1.15,x+1,top+th-sag);g.stroke();
 g.strokeStyle=css(P.boneRim,t.id==='canopy'?.18:.5);g.lineWidth=.02;g.beginPath();g.moveTo(x,top+.03+sag);g.lineTo(x+1,top+.03-sag);g.stroke();
 if(t.id==='canopy'){for(let i=0;i<3;i++)feather(g,x+rnd(),top+th*.5,.2+rnd()*.2,Math.PI*.5+(rnd()-.5)*.8+(rnd()<.5?Math.PI:0),.05,'#2a1830','#5a3a66');}
 for(const [end,ex] of [[!l,x],[!r,x+1]])if(end){
  // Knobbed joint at the end of each rib, finger bone or branch.
  g.fillStyle=wood;g.beginPath();g.ellipse(ex,top+th*.45,.1,.15,0,0,TAU);g.fill();g.strokeStyle=P.outline;g.lineWidth=.035;g.stroke();
 }
}
function slope(g,x,y,t){
 g.fillStyle=mix(t.stone,t.stoneDark,.3);g.beginPath();g.moveTo(x,-y);g.lineTo(x+1,-y-1);g.lineTo(x+1,-y);g.closePath();g.fill();
 g.strokeStyle=t.top;g.lineWidth=.12;g.beginPath();g.moveTo(x,-y-.04);g.lineTo(x+1,-y-1.04);g.stroke();
 g.strokeStyle=P.outline;g.lineWidth=.04;g.beginPath();g.moveTo(x,-y);g.lineTo(x+1,-y-1);g.stroke();
}
function breakable(g,x,y,t,rnd){
 const v=g.createLinearGradient(x,-y-1,x+1,-y);v.addColorStop(0,mix(t.top,t.stone,.35));v.addColorStop(1,mix(t.stone,t.stoneDark,.4));
 g.fillStyle=v;g.fillRect(x+.03,-y-.97,.94,.94);
 g.strokeStyle=P.outline;g.lineWidth=.05;g.strokeRect(x+.03,-y-.97,.94,.94);
 // Amber seams mark a weak point.
 const seam=()=>{g.beginPath();let px=x+.2+rnd()*.6,py=-y-.97;g.moveTo(px,py);for(let i=0;i<4;i++){px+=(rnd()-.5)*.35;py+=.24;g.lineTo(Math.max(x+.08,Math.min(x+.92,px)),py);}};
 const r0=rnd();
 for(const [w,c] of [[.09,css(P.amberDeep,.55)],[.035,P.amber],[.012,P.amberHot]]){g.strokeStyle=c;g.lineWidth=w;const s=seeded(r0*1e9);const keep=rnd;rnd=s;seam();g.stroke();rnd=keep;}
}
function hazard(g,x,y,rnd){crystal(g,x+.5,-y-.02,.55,rnd,true);}
function abyss(g,x,y){
 const v=g.createLinearGradient(0,-1,0,.8);v.addColorStop(0,'rgba(3,2,5,0)');v.addColorStop(1,'rgba(3,2,5,.97)');
 g.fillStyle=v;g.fillRect(x-.002,-1,1.004,-DEPTH+1);
}

export class Tiles{
 constructor(){this.level=null;this.theme=null;this.blocks=new Map();this.ppt=0;this.glows=[];this.cap=160;}
 setLevel(level,theme){this.level=level;this.theme=theme;this.blocks.clear();this.scan();}
 // Breakable walls change the grid in place; repaint only the blocks whose tiles changed.
 refresh(){for(const [id,b] of this.blocks)if(b.key!==this.key(b.bx,b.by))this.blocks.delete(id);this.scan();}
 scan(){
  this.glows.length=0;const L=this.level;if(!L?.grid)return;
  for(let y=0;y<L.grid.length;y++)for(let x=0;x<(L.width||0);x++){const t=L.grid[y][x];if(t===4||t===5)this.glows.push({x:x+.5,y:y+(t===5?.25:.5),t});}
 }
 key(bx,by){
  let k='';const L=this.level;
  for(let y=by*B-2;y<(by+1)*B+2;y++)for(let x=bx*B-1;x<(bx+1)*B+1;x++)k+=tileAt(L,x,y);
  return k;
 }
 paint(bx,by,ppt){
  const L=this.level,t=this.theme,key=this.key(bx,by);
  if(!/[1-5]/.test(key)&&by>=0)return {key,bx,by,c:null};
  const c=surface(B*ppt,B*ppt),g=c?.getContext('2d');
  if(!g)return {key,bx,by,c:null};
  const x0=bx*B,top=(by+1)*B;
  g.setTransform(ppt,0,0,ppt,-x0*ppt,top*ppt);
  g.beginPath();g.rect(x0,-top,B,B);g.clip();
  const ys=[],xs=[];for(let y=by*B-1;y<(by+1)*B+1;y++)ys.push(y);for(let x=x0-1;x<x0+B+1;x++)xs.push(x);
  const W=L.width||0;
  for(const y of ys)for(const x of xs){
   if(x<0||x>=W)continue;
   const tt=tileAt(L,x,y),rnd=seeded(x*7919+y*104729+1);
   if(y<1&&y>=DEPTH&&!solidT(tileAt(L,x,0))&&tileAt(L,x,y)===0&&y===0)abyss(g,x,y);
   if(y<DEPTH)continue;
   if(solidT(tt)||tt===3){
    if(tt===3){slope(g,x,y,t);continue;}
    if(tt===4){breakable(g,x,y,t,rnd);continue;}
    let depth=0;for(let d=1;d<4&&solidT(tileAt(L,x,y+d));d++)depth++;
    body(g,x,y,t,depth+(y<0?-y:0)*.0,rnd);
   }
  }
  for(const y of ys)for(const x of xs){
   if(x<0||x>=W||y<DEPTH)continue;
   const tt=tileAt(L,x,y),rnd=seeded(x*31+y*977+5);
   if(tt===1){edges(g,x,y,L);if(!solidT(tileAt(L,x,y+1))&&tileAt(L,x,y+1)!==3){cap(g,x,y,t,x*.37);topDetail(g,x,y,t,rnd);}}
  }
  for(const y of ys)for(const x of xs){
   if(x<0||x>=W)continue;const tt=tileAt(L,x,y),rnd=seeded(x*131+y*71+9);
   if(tt===2)platform(g,x,y,t,L,rnd);else if(tt===5)hazard(g,x,y,rnd);
  }
  // Dark base below the ground keeps the slab heavy.
  if(by<0){const v=g.createLinearGradient(0,0,0,-DEPTH);v.addColorStop(0,'rgba(5,3,7,0)');v.addColorStop(1,'rgba(5,3,7,.95)');g.fillStyle=v;g.fillRect(x0,0,B,-DEPTH);}
  return {key,bx,by,c};
 }
 // Hysteresis: a co-op zoom easing across a bucket edge keeps the cached blocks instead of repainting
 // the whole view each time (every block, character part and prop is cached per bucket).
 bucket(k){
  const cur=this.ppt;if(cur&&cur<=this.cap&&(cur>=k*.95||cur===this.cap)&&cur<=k*1.6)return cur;
  let p=BUCKETS[BUCKETS.length-1];for(const b of BUCKETS)if(b>=k*.95){p=b;break;}return Math.min(p,this.cap);
 }
 draw(g,cam,k){
  const L=this.level;if(!L?.grid)return;
  const ppt=this.bucket(k);if(ppt!==this.ppt){this.ppt=ppt;this.blocks.clear();}
  const x0=Math.floor((cam.x-cam.w/2)/B),x1=Math.floor((cam.x+cam.w/2)/B),y0=Math.floor((cam.y-cam.h/2)/B),y1=Math.floor((cam.y+cam.h/2)/B);
  const maxB=Math.ceil((L.width||0)/B);
  for(let by=Math.max(-1,y0);by<=Math.min(y1,Math.ceil(L.grid.length/B));by++)for(let bx=Math.max(0,x0);bx<=Math.min(x1,maxB);bx++){
   const id=bx+':'+by;let b=this.blocks.get(id);
   if(!b){b=this.paint(bx,by,ppt);this.blocks.set(id,b);}
   if(b.c)g.drawImage(b.c,bx*B,-(by+1)*B,B+.004,B+.004);
  }
  // Bound memory on long or wide levels: forget painted blocks well outside the view.
  if(this.blocks.size>MAX_BLOCKS)for(const [id,b] of this.blocks)if(b.bx<x0-2||b.bx>x1+2||b.by<y0-2||b.by>y1+2)this.blocks.delete(id);
  // Pit edges below the visible slab fade into the void.
  if(cam.y-cam.h/2<DEPTH){g.fillStyle='#050307';g.fillRect(cam.x-cam.w,-DEPTH,cam.w*2,cam.h);}
 }
 // Per-frame pulses on weak points (amber) and glass growths (cyan).
 drawGlows(g,frame,low){
  g.globalCompositeOperation='lighter';
  for(const o of this.glows){
   const amber=o.t===4,s=(amber?1.5:1.9)*(1+.12*Math.sin(frame*.05+o.x));
   const sp=glow(amber?P.amber:P.cyan);if(!sp)continue;
   g.globalAlpha=amber?.45:.38;g.drawImage(sp,o.x-s/2,-o.y-s/2,s,s);
  }
  g.globalAlpha=1;g.globalCompositeOperation='source-over';
 }
}
