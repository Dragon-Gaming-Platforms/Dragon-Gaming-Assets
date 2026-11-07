import {MOVES} from '../data/moves.js';
import {ENEMIES} from '../data/enemies.js';
import {BOSS} from '../data/boss.js';
import {BOSS4} from '../data/boss4.js';
import {F} from '../data/feel.js';
import {VISUALS as V} from '../data/visuals.js';
import {glow} from './surface.js';
import {css,mix,P,tone} from './color.js';
import {Parts,lookFor} from './parts.js';
import {FORMS,POSSESSION,ECHOES,formVisual} from '../data/forms.js';
import {CLIP5} from '../data/hero5.js';
import {hero5Cue} from './hero5.js';
import {tileAt} from './tiles.js';

const TAU=Math.PI*2;
const clamp=(v,a=0,b=1)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,ease=t=>t*t*(3-2*t);

// Clip name and progress exactly as the simulation exposes them: frame data stays authoritative.
export function clipOf(e,frame=0){
 let name=e.dead?'beaten':e.clip||'idle',progress=null,move=e.move,moveFrame=e.moveFrame;
 // Hero clip names the sim leaves stale for a tick: a move's name on the tick it ends (it holds the move's last
 // drawing: the next tick's clip, often a chained move, takes over), 'jump'/'glide' set by movement() before
 // physics lands the body, and the first ticks of a held blast (a tap fires a blast).
 if(!e.dead&&!move&&e.team!==2&&!e.form){
  if(name==='charge'&&e.charge>0){if(e.charge<CHARGE_SHOW)name=e.grounded?(e.glass?'glassidle':'idle'):'jump';}
  else if(MOVES[name]){move=name;moveFrame=MOVES[name].total-1;}
  else if((name==='jump'||name==='glide')&&e.grounded)name=e.glass?'glassidle':'idle';
 }
 if(name==='jump'&&e.jumps>1&&e.vy>0)name='doublejump';
 if(!e.dead&&move&&MOVES[move]){
  const M=MOVES[move];name=CLIP5[move]||move;progress=moveFrame/M.total;
  // A charged release fires with the shot pose ('charge' in the sheet is the hold loop), from the aim
  // drawing (the hold is already wound up) to the recoil on the shot frame.
  if(move==='charge'){name='blast';progress=Math.max(moveFrame,M.startup-1)/M.total;}
  // A dive kick that reached the floor stands up (dodge stand-up drawings) instead of flying along the ground.
  if(move==='divekick'&&e.grounded&&e.team!==2&&!e.form){
   let l=LANDED.get(e);if(!l||l.id!==e.attackId)LANDED.set(e,l={id:e.attackId,p:progress});
   name='dodge';progress=lerp(DODGE.roll[1],1,clamp((progress-l.p)/Math.max(.01,1-l.p)));
  }
 }
 // Rules-v4 possession form: its four moves reuse the boss clips (the storm is the barrage).
 else if(!e.dead&&e.form&&e.formMove&&FORMS[e.form]){
  const m=FORMS[e.form].moves[e.formMove],tell=e.formFrame<m.startup;
  name=tell?'telegraph':e.formMove==='storm'?'barrage':e.formMove;progress=tell?e.formFrame/m.startup:clamp((e.formFrame-m.startup)/Math.max(1,m.total-m.startup));
 }
 // Wild kinds: the sim renames e.clip one tick after the AI state changes, so the clip follows e.ai.
 const w=!e.dead&&!e.move&&e.team===2&&!e.boss?wildState(e):null;
 if(w)name=e.ai==='telegraph'||e.ai==='attack'?e.ai:e.ai==='recover'?'idle':name==='idle'?'idle':'move';
 if(!e.dead&&e.team===2&&(e.ai==='telegraph'||e.ai==='attack')){
  const d=e.boss?BOSS:ENEMIES[e.kind]||ENEMIES.brawler;
  // Rules-v4 bosses expose the length of their current tell or strike.
  const frames=e.aiFrames||(e.ai==='attack'?d.active:e.charging?d.chargeTelegraph:d.telegraph);
  // A tell or strike resumed after a stun replays all its drawings over the ticks it has left.
  progress=w?.resumeAi===e.ai?clamp(1-e.aiTimer/w.resumeT):clamp(1-e.aiTimer/frames);
 }
 if(!e.dead&&!e.move&&e.stun>0&&e.team===2&&!(e.boss&&e.glass)){name='hit';if(w)progress=stagger(w.stunLen-e.stun);}
 if(e.boss&&e.glass&&e.stun>0)name='maskbreak';
 if(e.dead)return {name,progress};
 const sp=Math.abs(e.vx||0),still=name==='idle'||name==='glassidle';
 // Feet follow the ground (sprites.js odometer): whenever a body travels on its feet it shows a
 // locomotion clip driven by distance, never a planted pose sliding along.
 if(e.team===2){
  // A hit that pushes without stunning: recoil instead of walking forward while sliding back.
  if(e.knockFrames>0&&e.knockback&&!e.boss&&(name==='move'||still)){name='hit';progress=clamp(1-e.knockFrames/F.knockFrames);}
  // Walked off a ledge: a flailing fall instead of walking on air (two airborne ticks, so a spawn or a step down never flashes it).
  else if(!e.boss&&e.kind!=='skimmer'&&!e.grounded&&(e.vy||0)<WILD.fall&&(name==='move'||still)){name='hit';progress=clamp((WILD.fall-e.vy)/WILD.fallSpan);}
  else if(!e.boss&&still&&e.grounded&&sp>STEP.enemy)name='move';
  // The Old Glasswing walks in neutral (walk; sheets without one fall back to rush) and charges on its gallop.
  else if(e.boss&&still&&sp>STEP.enemy)name='walk';
  else if(e.boss&&name==='rush'&&e.ai==='attack'){name='gallop';progress=null;}
  // The Rise opens on drawing 3: drawings 0-2 thrust low and forward while the sim lifts the body (art re-key pending).
  else if(e.boss&&name==='lunge'&&progress!==null)progress=LUNGE_FROM+(1-LUNGE_FROM)*progress;
 }else if(e.form){
  // A finished form move leaves its clip name behind for a tick: stand or walk instead of replaying a mid-swing drawing.
  if(!e.formMove&&FORM_STRIKES.has(name)){name=e.grounded&&sp>STEP.form?'walk':'idle';progress=null;}
  if(name==='run'||(name==='idle'||name==='glassidle')&&e.grounded&&sp>STEP.form)name='walk';
  else if(name==='rush'&&e.formMove==='rush'&&progress!==null&&e.formFrame>=FORMS[e.form].moves.rush.startup){name='gallop';progress=null;}
 }else if(!e.move){
  // Hero clips the sim only names: drive their drawings from state so they never restart mid-air
  // or stop before their last drawing.
  if(move);// the held last drawing of a move that just ended
  else if(name==='dodge'&&e.dodge>=0)progress=lerp(DODGE.roll[0],DODGE.roll[1],clamp(1-e.dodge/F.dodgeFrames));
  else if(name==='jump'){const vy=e.vy||0;progress=vy>0?lerp(.15,.6,1-clamp(vy/AIR.rise)):.6+.4*clamp(-vy/AIR.fall);}
  else if(e.grounded&&sp>STEP.hero&&(still||name==='charge')){
   // Out of a dodge the roll stands up while momentum bleeds off; otherwise the feet keep stepping to a stop.
   const since=(e.upgrades?.includes('dashCooldown')?F.dodgeFast:F.dodgeCooldown)-F.dodgeFrames-(e.dodgeCd||0);
   if(still&&since>=0&&since<DODGE.settle){name='dodge';progress=lerp(DODGE.roll[1],1,clamp(1-sp/(F.dodgeDistance/F.dodgeFrames)));}
   else name='run';
  }
  if(e.knockFrames>0&&e.inv>0&&name!=='block'&&name!=='dodge'){name='hit';progress=clamp(1-e.knockFrames/F.knockFrames);}
 }
 return {name,progress};
}
// Speeds (tiles/tick) above which a grounded body is drawn stepping; the dodge clip's roll drawings
// (12: crouch 0-1, roll 2-7, stand 8-11) and how long after a dodge the stand-up replaces stepping.
const STEP={hero:.02,enemy:.01,form:.035};
const DODGE={roll:[2/12,8/12],settle:14};
// Held-blast ticks before the charge crouch shows (a tap is a blast); dive-kick landing progress per entity.
const CHARGE_SHOW=6,LANDED=new WeakMap();
// Jump drawings from vertical speed (tiles/tick): a crouch only at takeoff, stretched while rising,
// tucked over the apex, open while falling.
const AIR={rise:.55,fall:.3};
const LUNGE_FROM=3/15,FORM_STRIKES=new Set(['sweep','slam','rush','barrage','lunge','telegraph']);
// A beaten boss collapses on its 'beaten' clip (24 drawings at 30 fps = 48 ticks) before it rises and fades.
export const COLLAPSE=48;

// Possessed-form sheet poses (render only, the sprite path; the procedural body keeps clipOf's names).
// FORM_KEY: share of each strike clip that is wind-up, so the sheet's own wind-up plays during the move's startup and
// its first strike drawing lands on the first active frame (sweep 4/18, slam 4/18, storm 2/18).
// The sheets have no jump: the air uses the gallop's flight drawings (push-off 10, tuck 14-16, reach 21), feet on y.
// The walk keeps its own drawings at every speed: the gallop at walking speed would play at half its authored tempo
// with 0.7 s of feet off the ground per stride (a floating slow-motion bound). A faster gait needs a lope clip (art).
const FORM_KEY={sweep:4/18,slam:4/18,barrage:2/18},FORM_AIR={rise:.35,fall:.3},LAND=[22,23,0,1];
export function formPose(e,name,progress,frame,m){
 const air=!e.grounded&&!e.dead;
 if(m.f!==frame){if(m.air&&!air)m.landAt=frame;m.air=air;m.f=frame;}
 const mv=e.formMove&&FORMS[e.form]?.moves[e.formMove];
 if(mv){
  if(e.formMove==='rush')return pose2('gallop',null,false);
  const clip=e.formMove==='storm'?'barrage':e.formMove,key=FORM_KEY[clip]??.25,fr=e.formFrame;
  return pose2(clip,fr<mv.startup?key*fr/mv.startup:key+(1-key)*clamp((fr-mv.startup)/Math.max(1,mv.total-mv.startup)),false);
 }
 if(air){
  const vy=e.vy||0;let i;
  if(name==='glide')i=15+Math.round(Math.sin(frame*.12));
  else i=vy>0?Math.round(lerp(13,10,clamp(vy/FORM_AIR.rise))):Math.round(lerp(15,21,clamp(-vy/FORM_AIR.fall)));
  return pose2('gallop',(i+.5)/24,true);
 }
 const t=frame-(m.landAt??-99);
 if(t>=0&&t<LAND.length)return pose2('gallop',(LAND[t]+.5)/24,true);
 return pose2(name,progress,false);
}
const P2={name:'',progress:null,lift:false};
function pose2(name,progress,lift){P2.name=name;P2.progress=progress;P2.lift=lift;return P2;}

// Wild bodies (render only). Stun: the 6 hit drawings play over `recoil` ticks, then a reeling loop of hit
// drawings (`reel`, `reelTicks` each) with a sway about the feet. Death: white for the kill ticks only, the
// painted collapse plays on the ground (`hold` ticks at full opacity), then fades by VISUALS.defeatedLife;
// a body killed in the air drops under gravity until its drawing rests on the surface. Charged lunge: a pounce
// of `pounce` tiles landing on the claw slam (attack progress `land`). Push during a tell or strike: a skid tilt.
// Ledge: a tilt over the edge from `lead` tiles ahead of the centre (at most `tipRate` rad per tick), then a
// tumble that grows with the fall speed (`tumble` rad per tile/tick, so it holds during hit-stop).
// Crowd: same-kind bodies closer than `crowd` tiles are drawn apart, the spread changing by `crowdRate` tiles per tick.
const WILD={recoil:10,reel:[3,2,1,2],reelTicks:6,hitN:6,sway:.06,hold:30,pounce:.45,land:.55,skid:.12,
 lead:.15,teeter:.35,teeterSpan:.5,tipRate:.06,tumble:1.1,tumbleMax:1.1,fall:-.1,fallSpan:.3,dust:'#b7aab2',crowd:.3,crowdRate:.02};
const WILDS=new WeakMap();
// Remembers when a stun started (its length varies by source) and the tell or strike it interrupted.
function wildState(e){
 let w=WILDS.get(e);if(!w){w={stunLen:0,stunLast:0,resumeAi:'',resumeT:0};WILDS.set(e,w);}
 const st=e.stun||0;
 if(st>0){if(st>w.stunLast)w.stunLen=st;w.stunLast=st;w.resumeAi='';}
 else if(w.stunLast>0){w.stunLast=0;if((e.ai==='telegraph'||e.ai==='attack')&&e.aiTimer>0){w.resumeAi=e.ai;w.resumeT=e.aiTimer;}}
 if(w.resumeAi&&e.ai!==w.resumeAi)w.resumeAi='';
 return w;
}
// Hit drawing for a stun `k` ticks old: the recoil, then the reeling loop.
function stagger(k){
 if(k<WILD.recoil)return clamp(k/WILD.recoil,0,.999);
 const R=WILD.reel;return (R[Math.floor((k-WILD.recoil)/WILD.reelTicks)%R.length]+.5)/WILD.hitN;
}
const solidTop=t=>t===1||t===2||t===3||t===4;
// Top of the highest walkable tile at or below y in column x (as props.shadow), or null over a pit.
function supportAt(level,x,y){
 const c=Math.floor(x);for(let ty=Math.min(Math.floor(y+.01),20);ty>=Math.floor(y)-12;ty--)if(solidTop(tileAt(level,c,ty)))return ty+1;
 return null;
}
// Edge a grounded body stands past: the drawing's lead point (ahead of the centre) is over a gap while the
// next column toward the body still holds it. Returns the edge x (the tip pivot), or null.
function ledgeOf(level,e,x){
 const ty=Math.round(e.y)-1;if(Math.abs(e.y-ty-1)>.02)return null;
 const sup=c=>solidTop(tileAt(level,c,ty)),px=x+(e.facing<0?-1:1)*WILD.lead,c=Math.floor(px);
 if(sup(c))return null;
 const l=sup(c-1),r=sup(c+1);
 return l&&r?(x<c+.5?c:c+1):l?c:r?c+1:null;
}
export const parryable=e=>!(e.unparryable||e.unblockable||e.parryable===false);

const fwd=(a,l)=>[Math.sin(a)*l,Math.cos(a)*l];
function ik(hx,hy,fx,fy,a,b){
 const dx=fx-hx,dy=fy-hy,d=clamp(Math.hypot(dx,dy),Math.abs(a-b)+1e-3,a+b-1e-3),th=Math.atan2(dx,dy);
 const A=Math.acos(clamp((a*a+d*d-b*b)/(2*a*d),-1,1)),Bc=Math.acos(clamp((b*b+d*d-a*a)/(2*b*d),-1,1));
 return [th+A,th-Bc];
}

// Pose: forward-positive angles, 0 = limb pointing down. Reused scratch record.
const J={};
function pose(e,look,frame,clip,p,mem){
 const t=frame+e.id*37,L=look,sp=Math.abs(e.vx||0);
 J.rot=0;J.dy=0;J.lean=.06;J.tilt=0;J.crouch=0;J.aF=[.25,.55];J.aB=[-.2,.15];J.feet=1;J.fF=[.12,0];J.fB=[-.12,0];J.legF=null;J.legB=null;
 J.wing=.2;J.flap=0;J.weapon=0;J.trail=null;J.charge=0;J.sway=Math.sin(t*.06)*.12-(e.vx||0)*1.5;J.draw=0;
 const breathe=Math.sin(t*.05);
 const phase=(s,a)=>p===null?0:p<s?-ease(p/s):p<a?1:1-ease((p-a)/(1-a));
 const mv=MOVES[clip],s=mv?mv.startup/mv.total:.3,a=mv?(mv.startup+mv.active)/mv.total:.6;
 const air=!e.grounded&&!e.dead;
 switch(clip){
  case 'run':case 'move':{
   const ph=t*(.16+sp*1.2);J.fF=[L.stride*Math.sin(ph)+.06,Math.max(0,Math.cos(ph))*-.16];J.fB=[L.stride*Math.sin(ph+Math.PI)-.06,Math.max(0,Math.cos(ph+Math.PI))*-.16];
   J.dy=-Math.abs(Math.cos(ph))*.035;J.lean=.2;J.aF=[-Math.sin(ph)*.6+.2,-Math.sin(ph)*.6+.9];J.aB=[Math.sin(ph)*.6,Math.sin(ph)*.6+.7];J.wing=.25;J.flap=Math.sin(ph*2)*.05;break;
  }
  case 'jump':case 'doublejump':case 'glide':{
   J.feet=0;const up=(e.vy||0)>0;
   J.legF=up?[1.1,-.2]:[.4,.1];J.legB=up?[.3,-.8]:[-.2,-.5];
   J.aF=up?[2.4,2.9]:[1.6,1.9];J.aB=up?[-.8,-.3]:[-1.2,-1];J.lean=up?-.05:.15;
   J.wing=clip==='glide'?1.35:clip==='doublejump'?1.1:up?.5:.75;J.flap=clip==='glide'?Math.sin(t*.25)*.05:clip==='doublejump'?Math.sin(t*.6)*.45:Math.sin(t*.3)*.1;
   if(clip==='glide'){J.lean=.55;J.legF=[-.3,-.6];J.legB=[-.6,-.9];J.aF=[1.2,1.6];J.aB=[-1,-.8];}
   break;
  }
  case 'dodge':J.lean=.7;J.crouch=.18;J.wing=.05;J.aF=[-1,-.6];J.aB=[-1.3,-1];J.fF=[.35,0];J.fB=[-.35,0];J.rot=.12;break;
  case 'block':J.crouch=.1;J.lean=.12;J.aF=[1.25,2.9];J.aB=[1,2.6];J.fF=[.22,0];J.fB=[-.2,0];J.wing=.55;break;
  case 'hit':J.lean=-.35;J.tilt=-.3;J.aF=[-.9,-.4];J.aB=[-1.3,-.9];J.crouch=.06;J.wing=.6;J.flap=Math.sin(t*.9)*.2;break;
  case 'beaten':
   if(e.team===2){J.crouch=.25;J.lean=1.0;J.tilt=.6;J.aF=[.3,.4];J.aB=[0,.2];J.wing=.1;}
   else{J.rot=-1.32;J.dy=-.15;J.lean=0;J.aF=[1.4,1.6];J.aB=[2.2,2.5];J.feet=0;J.legF=[.5,.2];J.legB=[.2,0];J.wing=.15;J.tilt=-.3;}
   break;
  case 'punch1':case 'punch2':case 'punch3':{
   const x=phase(s,a),big=clip==='punch3',back=clip==='punch2';
   const arm=x<0?[-.7*-x,.2+1.6*-x]:[lerp(.25,big?2:1.5,x),lerp(.55,big?2.4:1.55,x)];
   if(back){J.aB=arm;J.aF=[.2-x*.5,1.4];}else J.aF=arm;
   J.lean=.08+x*.22;J.fF=[.22+Math.max(0,x)*.1,0];J.fB=[-.22,0];J.crouch=.06;J.tilt=x*.1;
   if(x>0&&p>=s&&p<a)J.trail={kind:'jab',arm:back?'B':'F',a:arm[0],r:.55};break;
  }
  case 'kick':case 'divekick':{
   const x=phase(s,a);J.feet=0;
   if(clip==='kick'){J.legF=[lerp(.3,1.55,clamp(x)),lerp(-.4,1.45,clamp(x))];J.legB=[-.1,-.1];J.lean=-.15*clamp(x)+.05;J.aF=[-.4,.2];J.aB=[.6,1.2];J.dy=-.0;
    if(e.grounded){J.feet=2;J.fB=[-.12,0];}}
   else{J.rot=.55;J.legF=[lerp(.5,.9,clamp(x)),lerp(-.6,.9,clamp(x))];J.legB=[-.3,-1];J.aF=[-.6,-.3];J.aB=[-1,-.6];J.wing=.9;}
   if(x>0&&p>=s&&p<a)J.trail={kind:'kick'};break;
  }
  case 'sword':case 'downsword':{
   const x=phase(s,a);
   if(clip==='sword'){
    const sweep=p<s?lerp(.6,3.1,ease(p/s)):p<a?lerp(3.1,.45,ease((p-s)/(a-s))):lerp(.45,.3,(p-a)/(1-a));
    J.aF=[sweep,sweep+.35];J.lean=p<s?-.1:.3;J.fF=[.28,0];J.fB=[-.25,0];J.crouch=.08;J.weapon=Math.PI;
    if(p>=s&&p<a)J.trail={kind:'arc',from:3.1,to:sweep,r:L.arm[0]+L.arm[1]+(L.weapon==='claws'?.2:.55)};
   }else{
    J.feet=0;J.legF=[.9,-.3];J.legB=[.5,-.6];J.lean=.35;J.aF=[lerp(1.5,-.15,clamp(x)),lerp(1.8,-.1,clamp(x))];J.weapon=.0;J.wing=.8;
    if(p>=s&&p<a)J.trail={kind:'down',r:L.arm[0]+L.arm[1]+.5};
   }
   if(L.weapon==='claws')J.weapon=0;break;
  }
  case 'blast':case 'charge':{
   const x=phase(s,a);J.aF=[1.5,1.55];J.lean=.08-(x>0?x*.12:0);J.fF=[.2,0];J.fB=[-.22,0];
   if(L.weapon==='bow'){J.aB=[1.45,x<0?.2:1.4];J.draw=x<0?-x:0;J.weapon=1.57;}else J.aB=[-.3,.2];
   J.charge=clip==='charge'?1:.4*clamp(1-Math.abs(x));break;
  }
  case 'telegraph':{
   const w=p===null?.5:ease(p);J.lean=-.25*w;J.crouch=.12*w;J.aF=[-.9*w,-.2*w+.4];J.aB=[-1.2*w,-.5];J.tilt=-.15*w;J.wing=.3+.7*w;J.flap=Math.sin(t*.8)*.08*w;
   if(e.kind==='skimmer'&&e.team===2){J.wing=1.2;J.flap=Math.sin(t*.9)*.3;}break;
  }
  case 'attack':{
   const x=p===null?1:clamp(p*2);J.lean=.45;J.aF=[lerp(-.9,1.7,x),lerp(-.4,1.8,x)];J.aB=[lerp(-1,.9,x),1.3];J.fF=[.35,0];J.fB=[-.3,0];J.wing=.9;
   if(e.kind==='skimmer'){J.rot=.6;J.wing=.3;}J.trail=e.kind==='spark'?null:{kind:'claw',r:L.arm[0]+L.arm[1]+.15};break;
  }
  case 'glassidle':J.crouch=.12;J.lean=.28;J.aF=[.6,1.1];J.aB=[.2,.6];J.fF=[.24,0];J.fB=[-.2,0];J.wing=.6+.1*breathe;J.flap=Math.sin(t*.12)*.05;break;
  default:J.dy=breathe*.012;J.aF=[.35+breathe*.04,.95];J.aB=[-.15-breathe*.03,.2];J.wing=.22+breathe*.03;
 }
 if(e.team===2&&e.kind==='skimmer'&&!e.dead){J.feet=0;J.legF=J.legF||[.3,.1];J.legB=J.legB||[.1,-.1];if(clip!=='attack'&&clip!=='telegraph'){J.wing=Math.max(J.wing,.9);J.flap=Math.sin(t*.55)*.35;}}
 if(air&&J.feet&&!e.dead){J.feet=0;J.legF=[.4,.1];J.legB=[-.2,-.5];}
 if(e.charge>0&&!e.move){J.charge=clamp(e.charge/F.charge);}
 if(!e.dead)J.lean+=L.hunch||0;
 return J;
}

const ivory=P.ivory;
export class Characters{
 constructor(){this.parts=new Parts();this.mem=new WeakMap();this.drawn=0;
  // Set by the View each frame: the level (support lookups), the effects pool (dust), the crowd spread.
  this.level=null;this.fx=null;this.crowded=new Map();this.tilt={a:0,x:0,y:0,dy:0};this.rest={y:0,cap:0,floor:null};}
 reset(ppt){this.parts.reset(ppt);}
 // Wild monsters never collide with each other: living bodies of one kind within WILD.crowd tiles are drawn
 // spread apart (by id, so the offset stays continuous when they pass each other). Render only; hitboxes are unchanged.
 crowd(list,frame,alpha){
  const C=this.crowded,sep=WILD.crowd,gone=e=>e.team!==2||e.boss||e.dead;C.clear();
  for(let i=0;i<list.length;i++){const a=list[i];if(gone(a))continue;const ax=a.px+(a.x-a.px)*alpha;
   for(let j=i+1;j<list.length;j++){const b=list[j];if(gone(b)||b.kind!==a.kind)continue;
    const dx=b.px+(b.x-b.px)*alpha-ax,near=clamp((.6-Math.abs(b.y-a.y))/.2);if(Math.abs(dx)>=sep||!near)continue;
    const s=(sep-Math.abs(dx))/2*near*(a.id<b.id?1:-1);C.set(a,(C.get(a)||0)-s);C.set(b,(C.get(b)||0)+s);}}
 }
 // The drawn spread eases toward the crowd target per tick (no sideways skid of a planted pose when a body
 // walks past), starts at its target, and freezes on a corpse.
 spread(e,m,frame,alpha){
  const t=this.crowded.get(e)||0;
  if(m.cr===undefined){m.cr=m.cr0=t;m.crAt=frame;}
  else if(!e.dead&&m.crAt!==frame){m.crAt=frame;m.cr0=m.cr;m.cr+=clamp(t-m.cr,-WILD.crowdRate,WILD.crowdRate);}
  return e.dead?m.cr:lerp(m.cr0,m.cr,alpha);
 }
 // A wild body killed in the air drops under gravity; the sprite callback stops it where its drawing rests on
 // the surface (floor + the drawing's depth below the pivot, never above where it died).
 // A body killed mid-pounce starts its drop from its drawn lift.
 fallen(e,x,since,alpha,lift=0){
  const R=this.rest,y0=e.y+lift,k=Math.max(0,since-1+alpha),s=this.level?supportAt(this.level,x,y0):y0;
  R.cap=y0;R.floor=s;R.y=y0+(e.vy||0)*k-.5*F.gravity*k*k;
  if(s!==null)R.y=Math.max(R.y,Math.min(y0,s));
  return R;
 }
 dust(x,y){this.fx?.burst(x,y+.06,WILD.dust,this.fx.cap<150?4:8,.05,24,.07,false,.001);}
 // Render-only motion the wild sheets lack: pounce, skid, reeling stun, ledge teeter and tumble.
 // Returns a rotation about (x, y) in world tiles and a lift; the hitbox never moves.
 wildMotion(e,x,y,frame,alpha,name,progress,dir,m){
  const T=this.tilt,tick=m.wildTick!==frame;m.wildTick=frame;T.a=0;T.x=x;T.y=y;T.dy=0;
  // Charged lunge: airborne over the travel, landing on the claw slam (attack drawings 8-9).
  if(name==='attack'&&e.charging&&e.kind==='brawler'){
   const k=clamp(clamp((progress??0)-(1-alpha)/ENEMIES.brawler.active)/WILD.land);T.dy=WILD.pounce*Math.sin(Math.PI*k);
   if(!m.pounce){m.pounce=1;this.dust(x,y);}else if(m.pounce===1&&k>=1){m.pounce=2;this.dust(x+dir*.5,y);}
   // The sim carries the lunge on after the slam: the claws rake dust while the planted pose slides.
   else if(m.pounce>=2&&tick&&Math.abs(e.vx||0)>STEP.enemy&&++m.pounce%2)this.dust(x+dir*.5,y);
   m.lift=k<1?T.dy:0;m.liftV=0;
  }else{
   // Stunned (a parry) out of the pounce: the body drops from where it was drawn instead of snapping down.
   m.pounce=0;
   if(m.lift>0){if(tick){m.liftV=(m.liftV||0)+F.gravity;m.lift=Math.max(0,m.lift-m.liftV);}T.dy=m.lift;}
  }
  // Shoved during a tell or strike (drawings kept by design): the body skids, leaning with the push.
  if(e.knockFrames>0&&(name==='telegraph'||name==='attack')){
   const s=Math.sign(e.knockback||0);T.a=s*WILD.skid*ease(clamp(e.knockFrames/F.knockFrames));
   if(e.knockFrames>(m.knock||0))this.dust(x+s*.25,y);
  }
  m.knock=e.knockFrames;
  // Stunned: after the recoil the body reels, swaying about its feet, and settles before the stun ends.
  if(name==='hit'&&e.stun>0){
   const w=WILDS.get(e),k=w?w.stunLen-e.stun-WILD.recoil:0;
   if(k>0)T.a=dir*WILD.sway*Math.sin(k*TAU/(WILD.reel.length*WILD.reelTicks))*clamp(k/8)*clamp(e.stun/8);
  }
  if(e.kind==='skimmer'||!this.level||T.a||T.dy)return T;
  // At a ledge the body tips over the edge, then tumbles while it falls (continuing from the tip).
  const edge=e.grounded&&(name==='move'||name==='idle')?ledgeOf(this.level,e,x):null;
  if(tick)m.tip0=m.tip||0;
  if(edge!==null){
   // Eased in from the previous tick's angle, so a body that spawns or lands past the edge tips over in a few ticks.
   const over=x+dir*WILD.lead-edge,r=WILD.tipRate,a=Math.sign(over)*WILD.teeter*ease(clamp(Math.abs(over)/WILD.teeterSpan));
   T.a=clamp(a,m.tip0-r,m.tip0+r);T.x=edge;m.tip=m.tipBase=T.a;m.tipOff=edge-x;
  }else if(!e.grounded&&!e.stun&&(m.tipBase!==undefined||(e.vy||0)<WILD.fall)){
   // Any fall (also one begun mid-strike, with no teeter first) tumbles toward the travel.
   const b=m.tipBase||0,s=Math.sign(b)||Math.sign(e.vx||0)||dir;
   T.a=s*Math.min(WILD.tumbleMax,Math.abs(b)+WILD.tumble*Math.max(0,WILD.fall-(e.vy||0)));T.x=x+(m.tipOff||0);m.tip=T.a;
  }else if(e.grounded){
   // Landed after a tumble, or walked back from the edge: settle upright about the feet.
   m.tipBase=undefined;
   if(m.tip){if(tick){m.tip*=.5;m.tipOff=0;if(Math.abs(m.tip)<.01)m.tip=0;}T.a=m.tip;}
  }
  return T;
 }
 memo(e,frame){let m=this.mem.get(e);if(!m){m={glassAt:-999,wasGlass:!!e.glass,flash:0,parry:0,dead:!!e.dead,age:0};this.mem.set(e,m);}
  if(e.glass&&!m.wasGlass)m.glassAt=frame;m.wasGlass=!!e.glass;return m;}
 // Shared per-entity cues drawn under or over any body (procedural or sprite).
 telegraph(g,e,x,y,frame,p){
  const cx=x,cy=y+e.h*.55,big=e.boss?2.2:1,par=parryable(e),col=par?ivory:P.cyan;
  const r=(1.5-.9*ease(p))*e.h*.7+.2*big,al=.25+.6*ease(p);
  g.globalCompositeOperation='lighter';
  g.strokeStyle=css(col,al);g.lineWidth=(.05+.06*p)*big;g.beginPath();g.arc(cx,-cy,r,0,TAU);g.stroke();
  if(p>.8&&Math.floor(frame/V.telegraphBlink)%2){g.strokeStyle=css(col,.9);g.lineWidth=.025*big;g.beginPath();g.arc(cx,-cy,r*1.12,0,TAU);g.stroke();}
  const sp=glow(par?'#fff6e4':P.cyan);if(sp){g.globalAlpha=al*.5;const s=r*1.4;g.drawImage(sp,cx-s,-cy-s,s*2,s*2);g.globalAlpha=1;}
  // Boss attacks also preview their shape.
  if(e.boss&&e.action){
   g.fillStyle=css(col,.08+.12*p);g.strokeStyle=css(col,.35*p);g.lineWidth=.04;const f=e.facing||1;
   // Rules v4: the sweep previews its whole box (a wedge left jumpers inside it uncovered) and the slam both waves.
   if(e.v4&&e.action==='sweep'){const m=BOSS4.moves.sweep;g.fillRect(f>0?x+m.x0:x-m.x1,-(y+m.y1),m.x1-m.x0,m.y1-m.y0);}
   else if(e.v4&&e.action==='slam'){const m=BOSS4.moves.slam;g.fillRect(x-m.waveRange,-(m.waveY+m.waveRadius),m.waveRange*2,m.waveRadius*2);g.fillRect(x+m.x0,-(y+m.y1),m.x1-m.x0,m.y1-m.y0);}
   else if(e.action==='slam'){g.fillRect(Math.min(x,x+f*12),-1.25,12,.25);}
   else if(e.action==='sweep'){g.beginPath();g.moveTo(x,-1.2);g.arc(x,-1.2,5,f>0?-.5:Math.PI-.05,f>0?.05:Math.PI+.5);g.closePath();g.fill();}
   else if(e.action==='barrage'){for(let i=0;i<3;i++)g.fillRect(Math.min(x,x+f*10),-(1.4+i*.6)-.06,10,.12);}
   else if(e.action==='rush'||e.action==='lunge'){g.beginPath();g.moveTo(x+f*2,-2.2);g.lineTo(x+f*6,-1.4);g.lineTo(x+f*2,-.6);g.closePath();g.fill();}
  }
  g.globalCompositeOperation='source-over';
 }
 // Procedural body. Returns head/hand/back/chest/tail anchors (world) for overlays.
 // anim: the animation clock (stands still through hit-stop); age: animation ticks since a defeat.
 draw(g,e,frame,alpha,{sprite=null,anchors=null,low=false,anim=frame,age=frame-e.defeatedFrame,shift=null}={}){
  const m=this.memo(e,frame),wild=e.team===2&&!e.boss,since=age;
  const x=e.px+(e.x-e.px)*alpha+(wild?this.spread(e,m,frame,alpha):0);let y=e.py+(e.y-e.py)*alpha,fade=1,rest=null;
  const {name,progress}=clipOf(e,frame),dir=e.facing<0?-1:1;
  // The kill flashes white for its own ticks only (the sim never clears flash on the dead).
  const scale=(e.showcase?V.showcaseScale:1),flash=e.flash>0&&!(e.dead&&e.team===2&&since>=F.flash);
  if(e.dead&&wild){rest=this.fallen(e,x,since,alpha,m.lift||0);y=rest.y;fade=1-ease(clamp((since-WILD.hold)/(V.defeatedLife-WILD.hold)));}
  // A boss holds still on its collapse before it rises and fades.
  else if(e.dead&&e.team===2){const gone=Math.max(0,since-(e.boss?COLLAPSE:0));y+=gone*V.defeatedRise;fade=clamp(1-gone/V.defeatedLife);}
  if(e.ai==='telegraph'&&name==='telegraph'&&!e.dead&&progress!==null)this.telegraph(g,e,x,y,frame,progress);
  const T=wild&&!e.dead?this.wildMotion(e,x,y,frame,alpha,name,progress,dir,m):null;
  if(T){y+=T.dy;if(T.a){g.save();g.translate(T.x,-T.y);g.rotate(T.a);g.translate(-T.x,T.y);}}
  // The 20f transformation with the form's sheet: the hero fades out over the second half while the painted form grows.
  const shifting=e.formShift>0&&!e.form&&e.formNext,sk=shifting?clamp(1-(e.formShift-alpha)/POSSESSION.shift):0;
  g.globalAlpha=fade*(shifting&&shift?1-ease(clamp((sk-.5)/.5)):1);
  if(sprite){sprite(x,y,dir,scale,name,progress,flash,rest);}
  else if(e.boss||e.form)this.boss(g,e,x,y,dir,frame,name,progress,flash,anchors,0,anim);
  else this.hero(g,e,x,y,dir,scale,frame,name,progress,flash,m,anchors,low,anim);
  if(T?.a)g.restore();
  g.globalAlpha=fade;
  if(shifting&&shift)shift(x,y,dir,sk);
  // The 20f transformation without a form sheet: the hero mask cracks while the amber boss body grows around it.
  else if(shifting){
   const k=ease(clamp(1-e.formShift/POSSESSION.shift)),vis=FORMS[e.formNext]?formVisual(e.formNext,e.kind):e.h*2;
   g.globalAlpha=fade*(.35+.6*k);this.boss(g,e,x,y,dir,frame,'telegraph',k,false,null,vis*(.3+.7*k));
   g.globalCompositeOperation='lighter';g.strokeStyle=css(P.amberHot,.9*(1-k));g.lineWidth=.08;g.beginPath();g.arc(x,-(y+e.h*.8),.3+k*vis*.5,0,TAU);g.stroke();g.globalCompositeOperation='source-over';
  }
  g.globalAlpha=1;
  this.cues(g,e,x,y,frame,m);
 }
 hero(g,e,x,y,dir,S,frame,clip,p,flash,m,A,low,T=frame){
  const wild=e.team===2,look=lookFor(e.kind,wild),Pt=this.parts,L=look;
  const J=pose(e,look,T,clip,p,m);
  const crack=wild?'':e.formShift>0?(e.formShift>POSSESSION.shift/2?'3':'glass'):e.glass?'glass':String(Math.min(3,Math.max(0,Math.ceil((1-e.mask/Math.max(1,e.maxMask))*3))));
  const headV=wild?(e.eliteHits>0&&!e.glass?'elite':''):crack,tk=flash?'w':'n',bk=flash?'w':'d';
  g.save();g.translate(x,-y);g.scale(dir*S,S);
  if(J.rot){g.translate(0,-L.hip*.6);g.rotate(J.rot);g.translate(0,L.hip*.6);}
  const hipY=-L.hip+J.crouch+J.dy,hx=0;
  const chest=[hx+Math.sin(J.lean)*L.torso,hipY-Math.cos(J.lean)*L.torso];
  const rot=(v,a)=>[v[0]*Math.cos(a)-v[1]*Math.sin(a),v[0]*Math.sin(a)+v[1]*Math.cos(a)];
  const at=(v)=>{const r=rot(v,J.lean);return [chest[0]+r[0],chest[1]+r[1]];};
  const shF=at([.1*L.bulk,.06]),shB=at([-.14*L.bulk,.04]),head=at(L.head),wingRoot=at([-.16*L.bulk,.1]);
  const part=(name,px,py,ang,v='',t=tk,sc=1)=>{const q=Pt.get(look,name,S>1.5?2:1,v,t);if(!q)return;g.save();g.translate(px,py);if(ang)g.rotate(ang);if(sc!==1)g.scale(sc,sc);g.drawImage(q.c,q.x,q.y,q.w,q.h);g.restore();};
  // Wings: far pair darker, then near pair, all behind the body.
  const spread=J.wing,fl=J.flap;
  for(const [off,dark] of [[.22,true],[0,false]]){
   const base=L.kind==='skimmer'&&!wild?.7:0;part('wing',wingRoot[0]-.02,wingRoot[1]-off*.2,1.0+base+spread*1.3+fl+off,'',dark?bk:tk);
   part('wing',wingRoot[0]-.04,wingRoot[1]+.06-off*.2,.55+base*.6+spread*1.0-fl*.6+off*.5,'',dark?bk:tk,.8);
  }
  // Spark's crimson cape behind the body.
  if(L.kind==='spark'&&!wild)this.cloth(g,shB[0]-.05,shB[1]-.02,.18,L.hip+L.torso*.6,J.sway*1.6-.5-(e.vx||0)*2,flash?'#ffffff':P.crimson,true);
  const leg=(hip,foot,fk,t)=>{
   let a1,a2;
   if(fk){a1=fk[0];a2=fk[0]+fk[1];}else [a1,a2]=ik(hip[0],hip[1],foot[0],foot[1],L.thigh,L.shin);
   const kn=fwd(a1,L.thigh);part('thigh',hip[0],hip[1],-a1,'',t);part('shin',hip[0]+kn[0],hip[1]+kn[1],-a2,'',t);
  };
  const arm=(sh,a,t,front)=>{
   const el=fwd(a[0],L.arm[0]);part('upper',sh[0],sh[1],-a[0],'',t);part('fore',sh[0]+el[0],sh[1]+el[1],-a[1],'',t);
   const hand=fwd(a[1],L.arm[1]);return [sh[0]+el[0]+hand[0],sh[1]+el[1]+hand[1]];
  };
  const hipF=[hx+.05,hipY],hipB=[hx-.07,hipY];
  const ground=J.feet?0:null;
  leg(hipB,[J.fB[0],J.fB[1]+(ground??0)],J.feet===1||J.feet===2?null:J.legB,bk);
  const handB=arm(shB,J.aB,bk,false);
  if(L.weapon==='bow'&&!wild)part('quiver',at([-.2*L.bulk,.2])[0],at([-.2*L.bulk,.2])[1],J.lean-.5,'',tk);
  part('torso',hx,hipY,J.lean,'',tk);
  if(e.glass&&!wild&&!flash){g.globalCompositeOperation='lighter';g.globalAlpha*=.6+.4*Math.sin(frame*.3);part('torso',hx,hipY,J.lean,'','n');part('blaze',hx,hipY,J.lean,'','n');g.globalAlpha=1;g.globalCompositeOperation='source-over';}
  if(!wild)this.cloth(g,hx+.14*L.bulk,hipY+.02,.11*L.bulk,L.hip*.8,J.sway,flash?'#ffffff':P.crimson,false);
  leg(hipF,[J.fF[0],J.fF[1]],J.feet===1?null:J.legF,tk);
  part('head',head[0],head[1],J.lean*.4+J.tilt,headV,tk);
  if(L.kind==='brawler'||wild&&L.kind==='brawler')part('pauldron',shB[0]+.02,shB[1]+.02,J.lean,'',bk);
  const handF=arm(shF,J.aF,tk,true);
  if(L.weapon==='glaive'&&!wild)part('glaive',handF[0],handF[1],-J.aF[1]+J.weapon,'',tk);
  if(L.weapon==='bow'&&!wild){
   const bowA=-J.aF[1]+Math.PI/2;part('bow',handF[0],handF[1],bowA,'',tk);
   // Glowing string, pulled back while drawing.
   const c=Math.cos(bowA),s=Math.sin(bowA),tip=(u,v)=>[handF[0]+u*c-v*s,handF[1]+u*s+v*c],t1=tip(-.02,-.46),t2=tip(-.02,.46),pull=tip(-.02-J.draw*.35-J.charge*.1,0);
   g.strokeStyle=css(P.amberHot,.9);g.lineWidth=.018;g.beginPath();g.moveTo(t1[0],t1[1]);g.lineTo(pull[0],pull[1]);g.lineTo(t2[0],t2[1]);g.stroke();
  }
  if(L.kind==='brawler')part('pauldron',shF[0],shF[1],J.lean,'',tk);
  // Emissive layer: eyes, sigil and power, additive.
  g.globalCompositeOperation='lighter';
  const eyeCol=wild?P.cyan:tone(e.eye||P.amber),eyeFlash=e.ai==='telegraph'&&Math.floor(frame/V.telegraphBlink)%2;
  const eg=glow(eyeFlash?'#ffffff':eyeCol);
  if(eg){const hr=L.headR,ec=at([L.head[0]+.22*hr,L.head[1]-.4*hr]),s=(e.glass?1.1:.6)*hr;g.globalAlpha=e.glass?.95:.8;g.drawImage(eg,ec[0]-s,ec[1]-s,s*2,s*2);}
  if(!wild){const sg=glow(P.amber);if(sg){const c=at([.13*L.bulk-0,L.torso*.32]),s=(e.glass?.75:.32)*L.bulk;g.globalAlpha=e.glass?.7+.3*Math.sin(frame*.3):.45;g.drawImage(sg,c[0]-s,c[1]-s,s*2,s*2);}}
  if(J.charge>0||L.kind==='spark'&&!wild){const cg=glow(wild?P.cyan:P.amber),r=(.12+.35*J.charge)*(1+.1*Math.sin(frame*.5));if(cg){g.globalAlpha=.9;g.drawImage(cg,handF[0]-r,handF[1]-r,r*2,r*2);}}
  if(e.vulnerable&&wild){const vg=glow(P.amber);if(vg){const c=at([0,L.torso*.4]),r=.45+.1*Math.sin(frame*.4);g.globalAlpha=.8;g.drawImage(vg,c[0]-r,c[1]-r,r*2,r*2);}}
  g.globalAlpha=1;
  if(J.trail)this.trail(g,J,shF,handF,L,wild,frame);
  g.globalCompositeOperation='source-over';
  // Mask shards fly off on the frame the mask breaks.
  const age=frame-m.glassAt;
  if(e.glass&&age>=0&&age<V.shardLife){
   g.fillStyle=P.bone;g.strokeStyle=P.outline;g.lineWidth=.015;
   for(let i=1;i<=8;i++){const sx=head[0]+Math.cos(i)*age*V.shardSpeed*3,sy=head[1]-Math.sin(i)*age*V.shardSpeed*3+age*age*V.shardGravity*3,r=.05+.02*(i%3);
    g.save();g.translate(sx,sy);g.rotate(age*V.shardSpin*i);g.beginPath();g.moveTo(-r,0);g.lineTo(0,-r*1.4);g.lineTo(r,r*.3);g.closePath();g.fill();g.stroke();g.restore();}
  }
  if(A){
   const w=(v)=>[x+dir*S*v[0],y-S*v[1]];
   A.head=w([head[0],head[1]-L.headR*1.1]);A.back=w(wingRoot);A.hand=w(handF);A.chest=w(at([.1*L.bulk,L.torso*.3]));A.tail=w([hx-.18*L.bulk,hipY+.05]);A.scale=S*(L.bulk*.6+.4);A.dir=dir;A.headR=L.headR*S;A.legs=w([.04,J.feet?-.04:-L.hip*.3]);
  }
  g.restore();
 }
 cloth(g,x,y,w,len,sway,color,cape){
  const n=5;g.fillStyle=color;g.beginPath();g.moveTo(x-w,y);
  for(let i=1;i<=n;i++){const t=i/n,sx=x-w*(1-t*.3)+Math.sin(sway+t*2)*t*len*.25+(cape?sway*t*len*.3:0);g.lineTo(sx,y+t*len);}
  for(let i=n;i>=1;i--){const t=i/n,sx=x+w*(1-t*.3)+Math.sin(sway+t*2)*t*len*.25+(cape?sway*t*len*.3:0)+(i===n?-w*.5:0);g.lineTo(sx,y+t*len-(i%2?.06:0));}
  g.lineTo(x+w,y);g.closePath();g.fill();
  g.strokeStyle=P.outline;g.lineWidth=.025;g.stroke();
  if(color!=='#ffffff'){g.strokeStyle=css(P.crimsonDeep,.9);g.lineWidth=.05;g.beginPath();g.moveTo(x-w*.3,y+.04);g.lineTo(x-w*.2+Math.sin(sway+1.6)*len*.15,y+len*.8);g.stroke();
   if(!cape){g.strokeStyle=css(P.bone,.75);g.lineWidth=.018;const cy=y+len*.38,cx=x+Math.sin(sway+.8)*len*.08;g.beginPath();g.moveTo(cx,cy-.1);g.lineTo(cx,cy+.12);g.moveTo(cx-.06,cy-.06);g.quadraticCurveTo(cx,cy+.04,cx+.06,cy-.06);g.stroke();}}
 }
 trail(g,J,sh,hand,L,wild,frame){
  const col=wild?P.cyan:P.amber,hot=wild?P.cyanHot:P.amberHot,tr=J.trail;
  if(tr.kind==='arc'){
   // Crescent slash following the swing, the shape of the sword hitbox.
   const a0=-tr.from+Math.PI/2,a1=-J.aF[0]+Math.PI/2,r=tr.r;
   for(const [w,c,al] of [[.22,col,.35],[.1,hot,.7],[.035,'#ffffff',.9]]){g.strokeStyle=css(c,al);g.lineWidth=w;g.beginPath();g.arc(sh[0],sh[1],r,Math.min(a0,a1),Math.max(a0,a1));g.stroke();}
  }else if(tr.kind==='down'){
   for(const [w,c,al] of [[.24,col,.35],[.08,hot,.8]]){g.strokeStyle=css(c,al);g.lineWidth=w;g.beginPath();g.moveTo(hand[0]-.25,hand[1]-.1);g.quadraticCurveTo(hand[0],hand[1]+.9,hand[0]+.25,hand[1]-.1);g.stroke();}
  }else{
   const sp=glow(col);if(sp){const r=tr.kind==='kick'?.45:.35;g.globalAlpha=.7;g.drawImage(sp,hand[0]-r,hand[1]-r,r*2,r*2);g.globalAlpha=1;}
   g.strokeStyle=css(hot,.6);g.lineWidth=.06;g.beginPath();g.moveTo(hand[0]-.5,hand[1]);g.lineTo(hand[0]+.05,hand[1]);g.stroke();
  }
 }
 cues(g,e,x,y,frame,m){
  g.globalCompositeOperation='lighter';
  // Rules v5: glaive crescents, the Moth Wheel ring and the pogo spike, traced on their hitboxes (src/render2d/hero5.js).
  if(CLIP5[e.move])hero5Cue(g,e,x,y);
  if(e.parryFlash>0){const k=e.parryFlash/F.parryStop,r=e.h*(1.4-.6*k);g.strokeStyle=css(ivory,.9*k);g.lineWidth=.12*k;g.beginPath();g.arc(x,-(y+e.h*.6),r,0,TAU);g.stroke();const s=glow('#fff6e4');if(s){g.globalAlpha=.6*k;g.drawImage(s,x-r,-(y+e.h*.6)-r,r*2,r*2);g.globalAlpha=1;}}
  // Rules-v4 Mask Ember full: an amber halo over the hunter. The Echo's extra flap: an amber wing burst.
  if(e.emberMax&&!e.dead&&!e.form&&!e.formShift&&e.ember>=e.emberMax){
   const r=.3+.05*Math.sin(frame*.15),cy=y+e.h+.45,sp=glow(P.amber);
   g.strokeStyle=css(P.amber,.85);g.lineWidth=.05;g.beginPath();g.arc(x,-cy,r,0,TAU);g.stroke();
   if(sp){g.globalAlpha=.5+.25*Math.sin(frame*.15);g.drawImage(sp,x-r*2,-cy-r*2,r*4,r*4);g.globalAlpha=1;}
  }
  if(e.echoFlash>0){
   const k=1-e.echoFlash/ECHOES['old-glasswing'].flash,a=1-k,cy=y+e.h*.62;
   for(const side of [-1,1])for(const [len,ang] of [[1.1,.45],[.8,1.25]]){
    g.save();g.translate(x,-cy);g.scale(side,1);g.rotate(-ang-k*.5);g.fillStyle=css(P.amber,.5*a);
    g.beginPath();g.ellipse(len*(.5+k*.3),0,len*(.5+k*.4),.14+.1*k,0,0,TAU);g.fill();g.restore();
   }
   g.strokeStyle=css(P.amberHot,.8*a);g.lineWidth=.06*a+.01;g.beginPath();g.arc(x,-cy,.4+k*1.2,0,TAU);g.stroke();
  }
  if(e.dead&&e.team!==2&&e.revive>0){const k=e.revive/F.revive;g.strokeStyle=css(P.amber,.9);g.lineWidth=.07;g.beginPath();g.arc(x,-(y+.5),.6,-Math.PI/2,-Math.PI/2+TAU*k);g.stroke();}
  g.globalCompositeOperation='source-over';
 }
 // Rules-v4 opening: an amber seam splits the body (the only place that takes full damage).
 seam(g,e,by,t){
  const k=Math.min(1,e.open/12),pulse=.85+.15*Math.sin(t*.4);
  g.globalCompositeOperation='lighter';
  const hg=glow(P.amber);if(hg){const r=(.32+.06*Math.sin(t*.3))*(e.revealed?1.35:1);g.globalAlpha=.85*k;g.drawImage(hg,-.1-r,-.42+by-r,r*2,r*2);}
  g.strokeStyle=css(P.amberHot,.95*k*pulse);g.lineWidth=.035;g.beginPath();g.moveTo(-.05,-.62+by);g.lineTo(-.12,-.48+by);g.lineTo(-.04,-.36+by);g.lineTo(-.13,-.22+by);g.stroke();
  if(e.revealed){g.strokeStyle=css(P.amber,.6*k);g.lineWidth=.02;g.beginPath();g.arc(-.08,-.42+by,.26+.03*Math.sin(t*.2),0,TAU);g.stroke();}
  g.globalAlpha=1;g.globalCompositeOperation='source-over';
 }
 // Old Glasswing (and the possession form): four glass wings, ivory mask, cyan light.
 // S0: drawn height override (the transformation). A player in a form gets the amber tone and the hero's mask as a crown.
 boss(g,e,x,y,dir,frame,clip,p,flash,A,S0=0,T=frame){
  const player=e.team!==2,S=S0||(player&&FORMS[e.form]?formVisual(e.form,e.kind):e.h),Pt=this.parts,tk=flash?'w':player?'a':'n',far=flash?'w':player?'a':'d',t=T+e.id*13;
  const crack=e.glass?'glass':String(Math.min(3,Math.max(0,(e.phase||1)-1+(e.mask<e.maxMask*.75?1:0))));
  let lift=Math.sin(t*.04)*.02,spread=.15+.04*Math.sin(t*.05),lean=0,hd=0;
  if(clip==='telegraph'){const w=ease(p??.5);spread=.15+.5*w;lift-=.03*w;lean=-.12*w;hd=-.1*w;}
  else if(clip==='slam'){const w=clamp((p??0)*3);spread=lerp(.7,-.25,w);lift=lerp(-.06,.03,w);lean=.2*w;}
  else if(clip==='sweep'){spread=lerp(.8,-.1,clamp((p??0)*2));lean=.25;}
  else if(clip==='barrage'){spread=.9+Math.sin(t*.8)*.06;lift=-.03;}
  else if(clip==='summon'){spread=.75+Math.sin(t*1.2)*.12;lift=-.05;hd=-.15;}
  else if(clip==='rush'||clip==='lunge'){spread=-.25;lean=.45;lift=0;}
  else if(clip==='maskbreak'||clip==='hit'){spread=.45+Math.sin(t*.9)*.1;lean=-.25;hd=-.3;}
  else if(clip==='beaten'){spread=-.4;lean=.9;lift=.04;}
  else if(e.glass){spread=.35+Math.sin(t*.2)*.08;lean=.15;}
  g.save();g.translate(x,-y);g.scale(dir*S,S);
  const part=(n,px,py,a,v='',sc=1,tt=tk)=>{const q=Pt.get('boss',n,S,v,tt);if(!q)return;g.save();g.translate(px,py);if(a)g.rotate(a);if(sc!==1)g.scale(sc,sc);g.drawImage(q.c,q.x,q.y,q.w,q.h);g.restore();};
  const by=lift,root=[-.05,-.68+by];
  // Far wings, legs, body, near wings, mask.
  part('fore',root[0]-.02,root[1]-.02,-(Math.PI*.95+spread*1.1),'',1.15,far);
  part('hind',root[0]-.02,root[1]+.06,-(Math.PI*.55+spread*.7),'',.95,far);
  const legs=(near)=>{for(let i=0;i<3;i++){const hip=[-.08+i*.08+(near?.03:0),-.42+by],foot=[-.32+i*.26+(near?.04:0)+Math.sin(t*.05+i*2+(near?1:0))*.015,0],[a1,a2]=ik(hip[0],hip[1],foot[0],foot[1],.26,.34),kn=fwd(a1,.26);part('leg',hip[0],hip[1],-a1,'',.78,near?tk:far);part('leg',hip[0]+kn[0],hip[1]+kn[1],-a2,'',1,near?tk:far);}};
  legs(false);
  part('body',-.06,by-.1,lean*.5-.15,'',.9);
  if(e.glass){g.globalCompositeOperation='lighter';const hg=glow(P.amber);if(hg){const r=.22+.04*Math.sin(t*.25);g.globalAlpha=.9;g.drawImage(hg,-.12-r,-.32+by-r,r*2,r*2);}g.globalAlpha=1;g.globalCompositeOperation='source-over';}
  part('thorax',0,by,lean*.3);
  if(e.open>0&&!player)this.seam(g,e,by,t);
  legs(true);
  part('fore',root[0],root[1],-(Math.PI*.82+spread*1.25),'',1.25);
  part('hind',root[0],root[1]+.08,-(Math.PI*.42+spread*.8),'',1.15);
  const head=[.2+lean*.15,-.8+by+hd*.1];
  part('mask',head[0],head[1],lean*.4+hd,crack,.58);
  // The hunter's crested crescent-horned mask, worn as a crown on the form.
  if(player){
   const hv=e.glass?'glass':String(Math.min(3,Math.max(0,Math.ceil((1-e.mask/Math.max(1,e.maxMask))*3)))),q=Pt.get(lookFor(e.kind||'brawler',false),'head',2,hv,flash?'w':'n'),k=1.6/S;
   if(q){g.save();g.translate(head[0]+.02,head[1]-.2);g.rotate(lean*.3+hd*.5);g.scale(k,k);g.drawImage(q.c,q.x,q.y,q.w,q.h);g.restore();}
  }
  g.globalCompositeOperation='lighter';
  const ec=glow(player?tone(e.eye||P.amber):e.ai==='telegraph'&&Math.floor(frame/V.telegraphBlink)%2?'#ffffff':P.cyan);
  if(ec){const r=.06+(e.glass?.04:0);g.globalAlpha=.85;g.drawImage(ec,head[0]-r*1.3,head[1]-.03-r,r*2.6,r*2);}
  const wg=glow(player?P.amber:P.cyan);if(wg){g.globalAlpha=(player?.3:.16)+.06*Math.sin(t*.07);g.drawImage(wg,-.9,-1.4+by,1.6,1.2);}
  g.globalAlpha=1;g.globalCompositeOperation='source-over';
  if(A){A.head=[x+dir*S*head[0],y-S*(head[1]-.3)];A.back=[x+dir*S*root[0],y-S*root[1]];A.hand=[x+dir*S*.2,y-S*.5];A.chest=[x+dir*S*.0,y-S*.6];A.tail=[x-dir*S*.2,y-S*.15];A.legs=[x+dir*S*.05,y+S*.02];A.scale=S*.5;A.dir=dir;A.headR=S*.2;}
  g.restore();
 }
}
