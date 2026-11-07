import {clamp,ease,TAU} from './monster-kit.js';
import {drawWickBearer,drawDripCenser,drawWax} from './nave.js';
import {drawMirrorSkater,drawScaleDiver} from './mere.js';
import {drawSporeling,drawHusk,drawBar,drawShocks} from './hindwing.js';
import {VISUALS as V} from '../data/visuals.js';

// The spoke families' procedural bodies (src/game/enemies/monsters.js). The renderer only reads simulation state:
// e.ai / e.act / e.aiTimer / e.aiFrames give every pose and cue, so a tell on screen is exactly the sim's tell.
// Stride (tiles per gait cycle) drives the legs from distance travelled, so feet never skate.
const STRIDE={'wick-bearer':.9,'drip-censer':.8,'mirror-skater':1.4,'scale-diver':.7,'cordyceps-husk':1.1,'husk-sovereign':1.8};

export function drawMonster(g,state,e,frame,alpha){
 const x=e.px+(e.x-e.px)*alpha,y=e.py+(e.y-e.py)*alpha,dir=e.facing<0?-1:1;
 const k=e.aiFrames>0?clamp(1-e.aiTimer/e.aiFrames):0,fl=e.flash>0&&!e.dead,ph=x/(STRIDE[e.kind]||1)*TAU*dir;
 const fade=e.dead?clamp(1-(frame-e.defeatedFrame)/V.defeatedLife):e.wait>0?clamp(1-e.wait/24,.15,1):1;
 g.save();g.globalAlpha=fade;g.translate(x,-y);g.scale(dir,1);
 // The perch hop: squash through the crouch, stretch in the air (around the feet; the hitbox never changes).
 if(e.ai==='hop'&&!e.dead){if(e.aiTimer>0){const c=ease(k);g.scale(1+.16*c,1-.24*c);}else g.scale(.92,1.12);}
 switch(e.kind){
  case 'wick-bearer':drawWickBearer(g,e,frame,k,ph,fl);break;
  case 'drip-censer':drawDripCenser(g,e,frame,k,ph,fl);break;
  case 'mirror-skater':drawMirrorSkater(g,e,frame,k,ph,fl);break;
  case 'scale-diver':drawScaleDiver(g,e,frame,k,ph,fl);break;
  case 'sporeling':drawSporeling(g,e,frame,k,fl);break;
  default:drawHusk(g,e,frame,k,ph,fl,e.kind==='husk-sovereign');
 }
 g.restore();g.globalAlpha=1;g.globalCompositeOperation='source-over';
 if(e.kind==='husk-sovereign'&&!e.dead)drawBar(g,e,x,y);
}
// Hazards in s.mon: wax crusts under the bodies (back), blobs and floor shocks over them (front).
export function drawMonsterWorld(g,state,frame,alpha,layer){
 const m=state.mon;if(!m)return;
 drawWax(g,m,frame,alpha,layer);
 if(layer!=='back')drawShocks(g,m,frame,alpha);
 g.globalAlpha=1;g.globalCompositeOperation='source-over';
}
