import {AUDIO} from '../data/audio.js?v=0.3.1';
import {emitSound} from '../core/sound.js';
import {B,edge} from '../core/input.js';
import {F} from '../data/feel.js';
import {KINDS} from '../data/kinds.js';
import {physics} from '../core/physics.js';
import {UPGRADE_VALUES as U} from '../data/upgrades.js';
import {MOVES} from '../data/moves.js';
import {startMove,attackTick,emit} from '../core/combat.js';
import {depth,mv,wallTick,dashTick,dashEnd,rootSlam} from './moults.js';
import {MV} from '../data/moults.js';
import {possessionTick} from './possession.js';
import {mendTick} from './mend.js';
import {ECHOES} from '../data/forms.js';
import {bufferPresses,dashPressed,dashStart,heroMoves} from './hero5.js';
import {verbTick} from './moults5.js';

const timers=['inv','stun','flash','parryFlash','dodgeCd','comboTimer','formCd','echoFlash'];
const dodgeMotion={gravity:false};
// Physics reads options synchronously and never retains this scratch object.
const motion={gravity:true,drop:false};

// k: the body's numbers (a kind, or a rules-v4 possession form). echo: an owned mask's extra flap (never in a form).
export function movement(e,input,level,k=KINDS[e.kind]){
 const echo=e.echo&&!e.form?e.echo:0,maxJumps=k.jumps+(e.upgrades.includes('thirdFlap')?U.thirdFlap:0)+(e.moults?mv(e,'back-rook','rookJumps'):0)+echo;
 const speed=k.speed/F.hz*(e.glass?F.glassSpeed:1)*(e.upgrades.includes('windRunner')?U.windRunner:1);
 const axis=Number(!!(input&B.right))-Number(!!(input&B.left));
 if(axis)e.facing=axis;
 e.vx=axis?Math.max(-speed,Math.min(speed,e.vx+axis*F.acceleration)):e.vx*F.friction;
 if(edge(input,e.prev,B.jump))e.jumpBuffer=F.jumpBuffer;
 else if(e.jumpBuffer)e.jumpBuffer--;
 if(e.grounded){e.jumps=0;e.glide=k.glide+(e.upgrades.includes('longGlide')?U.longGlide:0);}
 const jumpSpeed=Math.sqrt(2*F.gravity*(e.moults?k.jump*(mv(e,'legs-talon','talonJump')||1):k.jump))+F.gravity/2;
 // Rules v4 Hook Claws: a wall jump takes priority over an air jump.
 if(e.moults&&depth(e,'arms-hook')&&wallTick(e,axis,level,jumpSpeed));
 else if(e.jumpBuffer&&(e.grounded||e.coyote||e.jumps<maxJumps)){
  e.vy=jumpSpeed;
  e.jumps=e.grounded||e.coyote?1:e.jumps+1;
  e.coyote=0;e.jumpBuffer=0;e.grounded=false;e.clip=e.jumps>1?'doublejump':'jump';
  if(echo&&e.jumps>maxJumps-echo)e.echoFlash=ECHOES['old-glasswing'].flash;
 }
 if(!(input&B.jump)&&(e.prev&B.jump)&&e.vy>0)e.vy*=F.jumpCut;
 const gliding=!!(input&B.jump)&&e.vy<=0&&!e.grounded&&e.glide>0;
 if(gliding){e.vy=-F.glideFall;e.glide--;e.clip='glide';}
 else if(!e.grounded)e.clip='jump';
 else e.clip=axis?'run':e.glass?'glassidle':'idle';
 motion.gravity=!gliding;motion.drop=!!(input&B.down);
 physics(e,level,motion);
}

export function playerTick(s,e,input,targets,resolveAttacks=true){
 if(e.dead)return;
 for(const key of timers)if(e[key]>0)e[key]--;
 // Mend runs: Down + Mask channels a heal paid with Mask Ember (src/game/mend.js).
 if(e.mend!==undefined){input=mendTick(s,e,input);if(e.mend){e.prev=input;return;}}
 // Rules v5 (src/game/hero5.js): buffered dash and dash-jump presses survive stuns and guards.
 const v5=s.config.rulesVersion>=5;
 if(v5)bufferPresses(e,input);
 if(e.stun){physics(e,s.level);e.prev=input;return;}
 // Rules v4: mask owners can take a boss form (src/game/possession.js).
 if(e.forms&&possessionTick(s,e,input,targets))return;
 // moults5 verb moults (only players with `verbs`, created by config.moults5): claw, ram, leap, shell drop, spines.
 if(e.verbs&&verbTick(s,e,input,targets))return;

 const block=!!(input&B.block)&&e.grounded;
 if(block){
  if(!(e.prev&B.block))e.blockAge=0;else e.blockAge++;
  e.blocking=true;e.move=null;e.charge=0;e.vx*=F.friction;e.clip='block';
  physics(e,s.level);e.prev=input;return;
 }
 e.blocking=false;e.blockAge=F.blockInactiveAge;
 if((v5?dashPressed(e):edge(input,e.prev,B.dodge))&&e.dodgeCd===0){
  e.dodge=F.dodgeFrames;e.dodgeCd=e.upgrades.includes('dashCooldown')?F.dodgeFast:F.dodgeCooldown;
  if(e.moults){e.goreIds.length=0;e.dodgeCd=Math.round(e.dodgeCd*(mv(e,'back-rook','rookCooldown')||1));}
  if(v5)dashStart(s,e);
  e.move=null;e.charge=0;emitSound(s,'dodge');emit(s,e.x,e.y+.2,0xcfe9f2,5);
 }
 if(e.dodge){
  e.dodge--;e.vx=e.facing*F.dodgeDistance/F.dodgeFrames;e.vy=0;e.clip='dodge';
  if(e.moults){dashTick(s,e,targets);if(!e.dodge)dashEnd(s,e);}
  physics(e,s.level,dodgeMotion);e.prev=input;return;
 }

 const wasGrounded=e.grounded,oldJumps=e.jumps,fall=e.vy;
 movement(e,input,s.level);
 if(e.jumps>oldJumps){
  emitSound(s,e.jumps>1?'doublejump':'jump');emit(s,e.x,e.y,0xcfe9f2,4);
  // The Echo of Old Glasswing: an amber wing burst on the extra flap.
  if(e.echoFlash===ECHOES['old-glasswing'].flash)emit(s,e.x,e.y+e.h*.6,0xffb347,12);
 }
 else if(!wasGrounded&&e.grounded){
  emitSound(s,'land');emit(s,e.x,e.y,0xa9d68a,4);
  if(e.moults&&depth(e,'tail-root')&&fall<MV.rootFall&&input&B.down)rootSlam(s,e,targets);
 }

 if(e.grounded&&e.clip==='run'&&Math.abs(e.vx)>=AUDIO.stepSpeed&&s.frame%AUDIO.stepFrames===0)
  emitSound(s,Math.floor(s.frame/AUDIO.stepFrames)%2?'step1':'step2');

 if(v5)heroMoves(s,e,input);
 else{
 if(e.move?.startsWith('punch')&&edge(input,e.prev,B.sword)&&
    e.moveFrame>=MOVES[e.move].startup+MOVES[e.move].active)e.move=null;
 if(!e.move){
  if(edge(input,e.prev,B.sword))startMove(e,input&B.down&&!e.grounded?'downsword':'sword');
  else if(edge(input,e.prev,B.attack)){
   if(input&B.down||input&(B.left|B.right))startMove(e,e.grounded?'kick':'divekick');
   else{
    e.combo=e.comboTimer?(e.combo+1)%F.punchCombo:0;e.comboTimer=F.comboWindow;
    startMove(e,'punch'+(e.combo+1));
   }
  }else if(input&B.blast){e.charge++;e.clip='charge';}
  else if(e.charge){
   startMove(e,e.charge>=F.charge?'charge':'blast');e.charge=0;e.fired=false;
  }
 }
 }
 if(e.move){e.clip=e.move;if(resolveAttacks)attackTick(s,e,targets);}
 e.prev=input;
}
