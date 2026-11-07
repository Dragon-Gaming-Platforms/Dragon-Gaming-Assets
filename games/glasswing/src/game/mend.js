import {emitSound} from '../core/sound.js';
import {B,edge} from '../core/input.js';
import {physics,tile} from '../core/physics.js';
import {heal,emit} from '../core/combat.js';
import {F} from '../data/feel.js';
import {MEND as M,MEND_REPLY} from '../data/mend.js';
import {EMBER,POSSESSION as P} from '../data/forms.js';
import {gainEmber} from './possession.js';

// Mend (config.mend): hold Down + Mask on the ground to channel a heal paid with Mask Ember. The cost is paid when the
// channel starts; a hit, a shove, leaving the ground or any action press (jump, attack, sword, blast, dodge, guard) breaks
// it and the ember is lost, and the press that broke it acts on the same frame. It cannot start or run in a boss form.
// Only players of a config.mend run carry these fields, so every other config stays frame-identical.
// With several masks, the hold-to-open wheel steps with Left and Right instead of cycling on a timer.
const CANCEL=B.jump|B.attack|B.sword|B.blast|B.dodge|B.block;

export function initMend(p){
 Object.assign(p,{mend:0,mendLock:0,mendHits:p.hits||0,mendX:p.x,mendIn:0,mendAge:M.chord+1,mendDown:0,
  mendFlash:0,mendBreak:0,mendFail:0,mends:0,mendBreaks:0});
}
// A respawn rebuilds the hunter: no channel survives it.
export function resetMend(p){p.mend=0;p.mendLock=0;p.mendIn=0;p.mendAge=M.chord+1;p.mendDown=0;}
// Bosses read this for their Mend punish (BOSS-DESIGN 'Difficulty framework' 4).
export const mending=p=>p.mend>0;
// The boss's Mend reply (src/data/mend.js MEND_REPLY): the pattern id to pick now, or null (nobody mends, no row).
export function mendReply(s,boss,tier){
 const r=MEND_REPLY[boss];
 return r&&s.players.some(mending)?r.patterns[tier]||null:null;
}
// The neutral wait left while a hunter mends (unchanged otherwise).
export function mendGap(s,boss,gap){
 const r=MEND_REPLY[boss];
 return r&&gap>r.gap&&s.players.some(mending)?r.gap:gap;
}
// Everything but the ember and the missing mask; a held Down + Mask starts the channel as soon as this holds.
const ready=(s,e)=>!e.dead&&!e.form&&!e.formShift&&!e.stun&&!e.dodge&&!e.move&&!e.knockFrames&&e.grounded&&s.config.hall!=='trial';
export const canMend=(s,e)=>e.mend===0&&ready(s,e)&&e.mask<e.maxMask&&e.ember>=M.cost;
// Standing on a one-way tile, where a held Down drops the hunter through (src/core/physics.js).
function oneWay(level,e){
 const y=Math.floor(e.y-.05);
 for(let x=Math.floor(e.x-e.w/2);x<=Math.floor(e.x+e.w/2);x++)if(tile(level,x,y)===2)return true;
 return false;
}

function begin(s,e){
 e.ember-=M.cost;e.mend=0;e.mendHits=e.hits;e.mendX=e.x;
 e.move=null;e.charge=0;e.blocking=false;e.dodge=0;e.vx=0;
 emit(s,e.x,e.y+e.h*.75,0xffb347,6);
}
function breakMend(s,e,hit){
 e.mend=0;e.mendBreaks++;e.mendBreak=M.broken;
 // A broken channel never restarts by itself: Mask must be pressed again.
 e.mendLock=e.mendLock?2:0;
 if(hit){emit(s,e.x,e.y+e.h*.8,0x5c5650,10);emitSound(s,'mend-break');}
}
function finish(s,e){
 heal(e,M.heal);e.mends++;e.mend=0;e.mendFlash=M.flash;
 emit(s,e.x,e.y+e.h*.8,0xffb347,16);emit(s,e.x,e.y+e.h*.8,0xf1ece2,8);emitSound(s,'mend');
}
function channel(s,e){
 e.mend++;e.vx*=F.friction;e.clip='charge';
 physics(e,s.level);
 // The calm bonus keeps counting while the hunter mends (possessionTick does not run during the channel).
 if(++e.emberCalm>=EMBER.calmFrames){e.emberCalm=0;gainEmber(s,e,EMBER.calm);}
 const pulse=M.pulses.indexOf(e.mend-1);
 if(pulse>=0)emitSound(s,'mend'+(pulse+1));
 if(e.mend>=M.channel)finish(s,e);
}
// Called from playerTick before the stun check; returns the input left for the rest of the tick. While e.mend is
// above zero after this call the channel used up the frame.
export function mendTick(s,e,input){
 if(e.mendFlash>0)e.mendFlash--;
 if(e.mendBreak>0)e.mendBreak--;
 if(e.mendFail>0)e.mendFail--;
 const raw=input,held=!!(raw&B.possess),last=e.mendIn,act=edge(raw,last,CANCEL);
 // Frames since Mask went down (past the chord window once released).
 if(!held){e.mendLock=0;e.mendAge=M.chord+1;}
 else if(!(last&B.possess))e.mendAge=0;
 else if(e.mendAge<=M.chord)e.mendAge++;
 if(e.mend){
  if(e.hits!==e.mendHits||e.dead||e.stun||e.form||e.formShift||!e.grounded||Math.abs(e.x-e.mendX)>M.shove)breakMend(s,e,true);
  else if(!held||act)breakMend(s,e,false);
 }
 if(!e.form&&!e.formShift){
  // Down + Mask is the Mend chord, in either order within the chord window; the mask press it carries never reaches
  // the form or the wheel. Mask first: its press already reached possession and took no form, so the wheel's release
  // must not take one either.
  const press=held&&!e.mendLock&&!!(raw&B.down)&&(e.mendAge===0||edge(raw,last,B.down)&&e.mendAge<=M.chord);
  if(press){e.mendLock=1;if(e.mendAge>0){e.prev&=~B.possess;e.formHold=0;}}
  if(!e.mend&&e.mendLock===1&&raw&B.down&&!act){
   if(canMend(s,e)){begin(s,e);channel(s,e);}
   else if(press&&ready(s,e)){
    // Nothing to mend, or not enough ember: a dry fizzle says why nothing happened.
    e.mendFail=M.fail;emit(s,e.x,e.y+e.h*.85,0x5c5650,4);emitSound(s,'mend-fail');
   }
  }else if(e.mend)channel(s,e);
  // The transform wheel (several masks, Mask held past the hold time): Left and Right step the shown mask.
  if(!e.mendLock&&held&&last&B.possess&&e.forms?.length>1&&e.formHold>=P.hold){
   const n=e.forms.length,step=edge(raw,last,B.right)?1:edge(raw,last,B.left)?n-1:0;
   e.formPick=(e.formPick+step)%n;input&=~(B.left|B.right);
  }
 }else if(e.mend)breakMend(s,e,true);
 // Down first on a one-way floor while a Mend is affordable: Down waits out the chord window (unless another action
 // joins it) so the hunter is not dropped through before Mask arrives; held longer, it drops as usual.
 let wait=false;
 if(!e.mend&&!held&&raw&B.down&&!(raw&~(B.down|B.left|B.right))&&canMend(s,e)&&oneWay(s.level,e)){
  if(edge(raw,last,B.down))e.mendDown=1;else if(e.mendDown>0&&e.mendDown<M.chord)e.mendDown++;else e.mendDown=0;
  wait=e.mendDown>0;
 }else e.mendDown=0;
 if(wait)input&=~B.down;
 // While the chord is held, Down belongs to it (no drop through a one-way floor after a heal, a fizzle or a break)
 // unless an action press joins it.
 if(e.mendLock){input&=~B.possess;if(!act)input&=~B.down;}
 e.mendIn=raw;
 return input;
}
