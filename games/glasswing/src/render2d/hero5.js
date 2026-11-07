import {MOVES} from '../data/moves.js';
import {UPGRADE_VALUES as U} from '../data/upgrades.js';
import {css,P} from './color.js';

const TAU=Math.PI*2;
// Rules-v5 hero tech cues, drawn additively over the hero (the sim only names the move; this reads its frame).
// Every shape traces the move's hitbox, because the atlas drawings (sword, punch2, punch3) stop well short of it:
// the glaive cuts and the air cut sweep a crescent out to the box's far edge and across its height, the Moth Wheel
// rings the box on both sides, and the pogo spike fills the box under the feet.
// Slash sweeps, as angles on the front half (-90 = top, 90 = bottom): the cut comes down, the back-cut comes up.
const SLASH={glaive1:[-70,70],glaive2:[70,-70],airglaive:[-85,85]};
const LAYERS=[[.3,P.amber,.28],[.12,P.amberHot,.6],[.035,'#ffffff',.85]];
// The hitbox a cue traces (frame rectangle of the first active frame, plus Longer Needle's reach as attackTick adds it).
export function cueBox(e){
 const m=e.move&&MOVES[e.move];if(!m)return null;
 const b=m.frames[m.startup],reach=b.w+(e.upgrades?.includes('longerNeedle')?U.longerNeedle:0);
 return {x:m.center?-reach/2:b.x,y:b.y,w:reach,h:b.h};
}
export function hero5Cue(g,e,x,y){
 const m=e.move&&MOVES[e.move];
 if(!m||e.dead)return;
 const f=e.moveFrame,end=m.startup+m.active,box=cueBox(e);
 const k=Math.min(1,Math.max(0,(f-m.startup+2)/(m.active+2))),fade=f<end?1:Math.max(0,1-(f-end)/4);
 const cy=-(y+box.y+box.h/2),ry=box.h/2,dir=e.facing<0?-1:1;
 if(e.move==='glaive3'&&f>=m.startup-2&&f<end+4){
  const r=box.w/2,a0=-Math.PI*.5,a1=a0+dir*TAU*k;
  for(const [w,c,al] of LAYERS){
   g.strokeStyle=css(c,al*fade);g.lineWidth=w;g.beginPath();g.ellipse(x,cy,r,ry,0,Math.min(a0,a1),Math.max(a0,a1));g.stroke();
  }
 }else if(SLASH[e.move]&&f>=m.startup-1&&f<end+4){
  // A flat crescent from the hunter out to the far edge of the box (x + w forward), as tall as the box.
  const [from,to]=SLASH[e.move],a0=from*Math.PI/180,a1=(from+(to-from)*k)*Math.PI/180,rx=box.x+box.w;
  g.save();g.translate(x,cy);g.scale(dir,1);
  for(const [w,c,al] of LAYERS){
   g.strokeStyle=css(c,al*fade);g.lineWidth=w;g.beginPath();g.ellipse(0,0,rx,ry,0,Math.min(a0,a1),Math.max(a0,a1));g.stroke();
  }
  g.restore();
 }else if(e.move==='pogo'&&f>=m.startup&&f<end){
  const top=-(y+box.y+box.h),bot=-(y+box.y);
  for(const [w,c,al] of [[.22,P.amber,.3],[.07,P.amberHot,.8]]){
   g.strokeStyle=css(c,al);g.lineWidth=w;g.beginPath();g.moveTo(x-box.w*.3,top+.3);g.lineTo(x,bot);g.lineTo(x+box.w*.3,top+.3);g.stroke();
  }
 }
}
