import {emitSound} from '../core/sound.js';
import {B,edge} from '../core/input.js';
import {F,energyMax} from '../data/feel.js';
import {MOVES} from '../data/moves.js';
import {KINDS} from '../data/kinds.js';
import {HERO5 as H,GLAIVE_NEXT} from '../data/hero5.js';
import {startMove,emit} from '../core/combat.js';
import {depth,mv} from './moults.js';
import {UPGRADE_VALUES as U} from '../data/upgrades.js';

// Rules v5 hero tech. Every function here runs only when rules5(s); v5 fields (dashBuffer, glaive,
// queued, skims, pogoed) are created on first use, so rules 1-4 states never carry them.

// Before any early return of playerTick: keep a dodge press for a few ticks (dash still cooling,
// stunned, guarding), and a jump pressed in the last frames of a dash.
export function bufferPresses(e,input){
 if(edge(input,e.prev,B.dodge))e.dashBuffer=H.dashBuffer;
 else if(e.dashBuffer>0)e.dashBuffer--;
 if(e.dodge>0&&e.dodge<=H.dashJump&&edge(input,e.prev,B.jump))e.jumpBuffer=H.dashJump;
}
export const dashPressed=e=>e.dashBuffer>0;
// The dash starts: a cancel out of a move that already landed, past its active frames, cools down faster.
export function dashStart(s,e){
 e.dashBuffer=0;
 const m=e.move&&MOVES[e.move];
 if(m&&e.hitIds.length&&e.moveFrame>=m.startup+m.active){
  e.dodgeCd=Math.min(e.dodgeCd,H.cancelCd);emit(s,e.x,e.y+e.h*.5,0xffb347,6);
 }
 e.queued=0;e.glaive=0;
}

// The v5 move choice (replaces the v4 block in playerTick): the Winged's glaive chain and air skims,
// a pogo for every form on down + sword in the air, punches, kicks and blasts as before.
export function heroMoves(s,e,input){
 const sword=edge(input,e.prev,B.sword),attack=edge(input,e.prev,B.attack);
 // physics() takes gravity off vy before it moves, so holding vy at gravity - glideFall makes the next step fall
 // exactly at glide speed (clamping at -glideFall would fall 2.6x faster than a glide).
 if(e.grounded){e.skims=0;e.hang=0;}
 else if(e.hang>0){e.hang--;e.vy=Math.max(e.vy,F.gravity-F.glideFall);}
 if(e.comboTimer===0&&!e.move)e.glaive=0;
 // A press during a chain cut is queued; the next cut starts at the link frame.
 const next=e.move&&GLAIVE_NEXT[e.move];
 // A queued press only links a running chain cut: a cut cut short (a hit, a guard, Mend, a verb) drops it, so no
 // glaive fires by itself once the hunter is free again.
 if(!next)e.queued=0;
 if(next&&sword)e.queued=1;
 if(next&&e.queued&&e.moveFrame>=MOVES[e.move].link){
  e.queued=0;e.glaive++;e.comboTimer=H.chainWindow;startMove(e,next);return;
 }
 if(e.move?.startsWith('punch')&&sword&&e.moveFrame>=MOVES[e.move].startup+MOVES[e.move].active)e.move=null;
 if(e.move)return;
 if(sword||e.queued){
  e.queued=0;
  if(!e.grounded&&input&B.down)startMove(e,'pogo');
  else if(e.kind!=='skimmer')startMove(e,'sword');
  else if(!e.grounded)startMove(e,'airglaive');
  else{
   e.glaive=e.glaive>0&&e.glaive<3&&e.comboTimer>0?e.glaive+1:1;e.comboTimer=H.chainWindow;
   startMove(e,'glaive'+e.glaive);
  }
 }else if(attack){
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

// Damage multiplier of a v5 move for this kind (KINDS stays the rules 1-4 table).
export const damage5=(e,m)=>(m.mult||1)*(H.kind[e.kind]?.[m.stat]||1);

// A landed v5 hit: pogo bounces refresh the air jumps, the glide and the dash and end the strike so
// pogos chain; the Winged's air cuts hold it aloft; the Moth Wheel shakes the screen.
export function landed5(s,e,m,target){
 if(m.pogo)bounce(s,e,m);
 else if(e.move==='airglaive'&&(e.skims||0)<H.skims){e.skims=(e.skims||0)+1;e.vy=Math.max(e.vy,H.skimLift);e.hang=H.skimHang;}
 else if(e.move==='glaive3'){s.shake=Math.max(s.shake,F.shakeFrames*2);emit(s,target.x,target.y+target.h*.5,0xffb347,10);}
}
function bounce(s,e,m){
 if(e.pogoed===e.attackId)return;
 e.pogoed=e.attackId;
 e.vy=H.pogoSpeed;
 // Pogo Master: higher pogo and +1 energy per bounce, as on the rules-4 downsword.
 if(e.upgrades.includes('pogoMaster')){e.vy*=U.pogoSpeed;e.energy=Math.min(energyMax(e),e.energy+U.pogoEnergy);}
 if(e.moults&&depth(e,'legs-talon'))e.vy*=mv(e,'legs-talon','talonPogo');
 // A full glide, as on landing (glide counts ticks: 1 would give back a single frame of it).
 e.jumps=Math.min(e.jumps,1);e.glide=Math.max(e.glide,KINDS[e.kind].glide+(e.upgrades.includes('longGlide')?U.longGlide:0));e.dodgeCd=0;e.skims=0;
 e.moveFrame=Math.max(e.moveFrame,m.total-1);
 emitSound(s,'pogo');emit(s,e.x,e.y-.2,0xffb347,6);
}
// Pogo off enemy shots, floor waves and falling debris: a bounce and a few untouchable ticks; the shot flies on.
export function pogoHazards(s,e,m,box){
 if(e.pogoed===e.attackId)return;
 for(const p of s.projectiles){
  if(!p.active||p.team===e.team||p.owner===e.id)continue;
  if(Math.abs(p.x-box.x)>box.w/2+p.radius||p.y+p.radius<box.y||p.y-p.radius>box.y+box.h)continue;
  bounce(s,e,m);e.inv=Math.max(e.inv,H.hazardInv);emit(s,p.x,p.y,0xcfe9f2,6);return;
 }
}
