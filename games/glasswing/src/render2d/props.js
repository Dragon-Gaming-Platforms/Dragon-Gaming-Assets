import {surface,seeded,glow} from './surface.js';
import {css,P} from './color.js';
import {bone,crack} from './parts.js';
import {feather,crystal} from './parallax.js';
import {tileAt} from './tiles.js';

const TAU=Math.PI*2;
// Level pieces, checkpoints, the exit and wave locks. Painted pieces are cached per zoom bucket.
const PAINT={
 altar:{box:[-.9,-1.9,.9,.05],paint(g){
  bone(g,g=>{g.beginPath();g.moveTo(-.75,0);g.lineTo(-.6,-.55);g.lineTo(.6,-.55);g.lineTo(.75,0);g.closePath();},[-.75,-.55,.75,0]);
  bone(g,g=>{g.beginPath();g.moveTo(-.4,-.55);g.quadraticCurveTo(-.55,-1.1,-.3,-1.45);g.lineTo(-.18,-1.3);g.quadraticCurveTo(-.3,-.95,-.2,-.55);g.closePath();},[-.55,-1.45,-.18,-.55]);
  bone(g,g=>{g.beginPath();g.moveTo(.4,-.55);g.quadraticCurveTo(.55,-1.1,.3,-1.45);g.lineTo(.18,-1.3);g.quadraticCurveTo(.3,-.95,.2,-.55);g.closePath();},[.18,-1.45,.55,-.55]);
  g.fillStyle=P.crimson;g.beginPath();g.moveTo(-.5,-.5);g.lineTo(.5,-.5);g.lineTo(.42,-.18);g.lineTo(.2,-.3);g.lineTo(0,-.12);g.lineTo(-.2,-.3);g.lineTo(-.42,-.18);g.closePath();g.fill();g.strokeStyle=P.outline;g.lineWidth=.03;g.stroke();
  crack(g,[0,-.48,0,-.2],P.amber,.03);crack(g,[-.12,-.38,.12,-.38],P.amber,.025);
 }},
 tree:{box:[-1.6,-6.2,1.6,.05],paint(g){
  // A giant fallen feather planted like a tree.
  feather(g,0,0,6,(.04),1.2,'#1f1424','#4a3456');
 }},
 fern:{box:[-.7,-1.1,.7,.05],paint(g){const r=seeded('fern');for(let i=0;i<5;i++)feather(g,(r()-.5)*.4,0,.6+r()*.4,(r()-.5)*1.4,.12,'#2a1a30','#6a4a78');}},
 mushroom:{box:[-.7,-1.2,.7,.05],paint(g){crystal(g,0,0,.8,seeded('glass'),true);}},
 stone:{box:[-.6,-.9,.6,.05],paint(g){bone(g,g=>{g.beginPath();g.moveTo(-.5,0);g.quadraticCurveTo(-.55,-.6,-.1,-.75);g.quadraticCurveTo(.45,-.7,.5,0);g.closePath();},[-.5,-.75,.5,0],{dark:true});}}
};
const kindOf=name=>name==='altar'?'altar':name.startsWith('tree')?'tree':name==='fern'?'fern':name==='mushroom'?'mushroom':'stone';

export class Props{
 constructor(){this.cache=new Map();this.ppt=0;}
 part(kind,ppt){
  if(ppt!==this.ppt){this.ppt=ppt;this.cache.clear();}
  let p=this.cache.get(kind);if(p!==undefined)return p;
  const s=PAINT[kind],[x0,y0,x1,y1]=s.box,res=Math.min(ppt,kind==='tree'?64:160),c=surface((x1-x0)*res,(y1-y0)*res),g=c?.getContext('2d');
  p=g?(g.setTransform(res,0,0,res,-x0*res,-y0*res),s.paint(g),{c,x:x0,y:y0,w:x1-x0,h:y1-y0}):null;
  this.cache.set(kind,p);return p;
 }
 // Pieces behind the play field (z < 0 trees stay further back and dimmer).
 draw(g,state,level,frame,ppt){
  if(!level)return;
  for(const pc of level.pieces||[]){
   const kind=kindOf(pc.piece),p=this.part(kind,ppt);if(!p)continue;
   const s=(pc.scale||1)*(kind==='tree'&&(pc.z??-1)<-2?.8:1);
   g.save();g.translate(pc.x,-pc.y);g.scale(pc.flip?-s:s,s);if(kind==='tree'&&(pc.z??-1)<-2)g.globalAlpha=.6;
   g.drawImage(p.c,p.x,p.y,p.w,p.h);g.restore();g.globalAlpha=1;
   if(kind==='altar'){
    // The stolen heart-light burns above every altar.
    const f=1+.08*Math.sin(frame*.2)+.04*Math.sin(frame*.53),sp=glow(P.amber);
    g.globalCompositeOperation='lighter';
    if(sp){g.globalAlpha=.8;g.drawImage(sp,pc.x-1.1*f,-pc.y-1.95-1.1*f,2.2*f,2.2*f);g.globalAlpha=1;}
    g.fillStyle=P.amberHot;g.beginPath();g.moveTo(pc.x,-pc.y-1.15);g.quadraticCurveTo(pc.x+.2*f,-pc.y-1.55,pc.x,-pc.y-2.05*f);g.quadraticCurveTo(pc.x-.2*f,-pc.y-1.55,pc.x,-pc.y-1.15);g.fill();
    g.globalCompositeOperation='source-over';
   }
  }
  // Checkpoint totems: a crimson tribe banner on a bone pole, lit amber once reached.
  const cps=level.checkpoints||[];
  for(let i=1;i<cps.length;i++){
   const x=cps[i]+.5,y=surfaceY(level,Math.floor(x)),lit=(state.checkpoint??0)>=cps[i];
   g.fillStyle=P.boneShade;g.fillRect(x-.04,-y-1.6,.08,1.6);g.strokeStyle=P.outline;g.lineWidth=.03;g.strokeRect(x-.04,-y-1.6,.08,1.6);
   const sw=Math.sin(frame*.05+i)*.08;
   g.fillStyle=lit?P.crimson:P.crimsonDeep;g.beginPath();g.moveTo(x+.04,-y-1.55);g.lineTo(x+.5+sw,-y-1.45);g.lineTo(x+.42+sw,-y-1.1);g.lineTo(x+.5+sw*1.4,-y-.85);g.lineTo(x+.04,-y-.95);g.closePath();g.fill();g.stroke();
   if(lit){const sp=glow(P.amber);if(sp){g.globalCompositeOperation='lighter';g.globalAlpha=.6;g.drawImage(sp,x-.35,-y-1.95,.7,.7);g.globalAlpha=1;g.globalCompositeOperation='source-over';}}
   g.fillStyle=lit?P.amberHot:P.boneDark;g.beginPath();g.arc(x,-y-1.62,.07,0,TAU);g.fill();
  }
  // Exit: an archway of two tusks with an amber veil.
  if(!level.boss&&Number.isFinite(level.end)&&!String(level.id).startsWith('arena')){
   const x=level.end,y=surfaceY(level,Math.floor(x));
   for(const s of [-1,1])bone(g,g=>{g.beginPath();g.moveTo(x+s*.9,-y);g.quadraticCurveTo(x+s*1.1,-y-2,x+s*.15,-y-2.8);g.quadraticCurveTo(x+s*.75,-y-1.8,x+s*.6,-y);g.closePath();},[x-1.1,-y-2.8,x+1.1,-y]);
   g.globalCompositeOperation='lighter';const v=g.createLinearGradient(0,-y-2.6,0,-y);v.addColorStop(0,css(P.amber,0));v.addColorStop(1,css(P.amber,.18+.06*Math.sin(frame*.07)));g.fillStyle=v;g.fillRect(x-.6,-y-2.6,1.2,2.6);g.globalCompositeOperation='source-over';
  }
 }
 // Wave locks: cold glass veils at both edges of the fight.
 locks(g,state,frame){
  const l=state.lock;if(!l)return;
  g.globalCompositeOperation='lighter';
  for(const x of [l.left,l.right]){
   const v=g.createLinearGradient(x-.3,0,x+.3,0);v.addColorStop(0,css(P.cyan,0));v.addColorStop(.5,css(P.cyan,.22+.08*Math.sin(frame*.1)));v.addColorStop(1,css(P.cyan,0));
   g.fillStyle=v;g.fillRect(x-.3,-9,.6,8);
   g.strokeStyle=css(P.cyanHot,.35);g.lineWidth=.02;g.beginPath();for(let y=1;y<9;y+=.5){g.moveTo(x-.1,-y);g.lineTo(x+.1,-y-.25);}g.stroke();
  }
  g.globalCompositeOperation='source-over';
 }
 // Soft contact shadow on the supporting surface below an entity.
 shadow(g,level,x,y,w){
  let s=null;for(let ty=Math.min(Math.floor(y),20);ty>=Math.floor(y)-5;ty--){const t=tileAt(level,Math.floor(x),ty);if(t===1||t===2||t===4||t===3){s=ty+1;break;}}
  if(s===null)return;
  const h=Math.max(0,y-s),k=Math.max(0,1-h/4);if(k<=0)return;
  if(!this.sh){const c=surface(64,32),g2=c?.getContext('2d');if(g2){const v=g2.createRadialGradient(32,16,0,32,16,32);v.addColorStop(0,'rgba(0,0,0,.6)');v.addColorStop(1,'rgba(0,0,0,0)');g2.setTransform(1,0,0,.5,0,8);g2.fillStyle=v;g2.fillRect(0,0,64,64);}this.sh=c||null;}
  if(!this.sh)return;
  g.globalAlpha=k;g.drawImage(this.sh,x-w*k,-s-.12,w*2*k,.3);g.globalAlpha=1;
 }
}
export function surfaceY(level,x){for(let y=Math.min((level.grid?.length||1)-1,12);y>=0;y--){const t=tileAt(level,x,y);if(t===1||t===4)return y+1;}return 1;}
