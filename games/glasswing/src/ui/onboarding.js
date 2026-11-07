import {t} from './i18n.js';
import {keyLabel} from './control-help.js';
import {PAD} from '../data/controls.js';
import {HEAD_ROOMS} from '../data/hub.js';

// In-context lessons for a first-time hunter: one short card at a time, raised by what is on screen
// (an ivory telegraph, an amber opening, a cyan strike, a full Mask Ember) or, in the first area (the Hub's Head), by
// the next basic verb not yet used. The coach only READS the run state: it never touches input,
// never pauses, never writes the simulation (tests/onboarding.test.mjs checks the digest).
// Completion lives in localStorage; Backspace / the pad's View button / the Skip chip skip them all.
export const LESSONS=['move','jump','attack','dodge','parry','amber','cyan','possess'];
export const BASIC=['move','jump','attack','dodge'];
// Contextual lessons, most urgent first.
const CONTEXT=['cyan','parry','amber','possess'];
const CORE=['move','jump','attack','dodge','parry','amber'];
export const STORE_KEY='glasswing.coach.v1';
export const COACH={
 minShow:66,     // a card stays at least this many frames (unless its verb is done)
 linger:150,     // a contextual card outlives its cue so it can be read
 doneShow:54,    // the tick-and-word acknowledgement
 nagLimit:1500,  // a basic card shown this long without the verb rests...
 rest:900,       // ...for this long before it comes back
 moveTiles:2,    // distance that counts as "moved"
 near:7,         // tiles: cues farther away than this do not teach
 tries:{cyan:3,parry:6,amber:4,possess:3} // showings per run of a contextual card the hunter has not taken up
};

// Mirrors render2d/characters.js parryable(): the renderer draws the ring ivory or cyan from this.
export const parryable=e=>!(e.unparryable||e.unblockable||e.parryable===false);
const hostile=(p,o)=>o.team!==p.team;
const near=(p,o,d=COACH.near)=>Math.abs(o.x-p.x)<d&&Math.abs((o.y||0)-(p.y||0))<d;
export function parryCue(s,p){
 for(const e of s.enemies)if(!e.dead&&hostile(p,e)&&e.ai==='telegraph'&&parryable(e)&&near(p,e))return e;
 for(const o of s.projectiles)if(o.active&&hostile(p,o)&&o.ivory&&near(p,o))return o;
 return null;
}
export function cyanThreat(s,p){
 // A wild tell or strike drawn cyan, or a boss act flagged unparryable (the Chrysalis flail, the Old Glasswing's cyan moves).
 const acting=e=>e.ai==='telegraph'||e.ai==='attack'||!!(e.boss&&(e.act||e.action));
 for(const e of s.enemies)if(!e.dead&&hostile(p,e)&&acting(e)&&!parryable(e)&&near(p,e,COACH.near+2))return e;
 for(const o of s.projectiles)if(o.active&&hostile(p,o)&&o.unparryable&&near(p,o))return o;
 return null;
}
export function amberTarget(s,p){
 for(const e of s.enemies)if(!e.dead&&hostile(p,e)&&(e.vulnerable||e.open>0)&&near(p,e,COACH.near+3))return e;
 return null;
}
// A hunter with no mask yet (the Gullet: forms is []) has nothing to take: Mend spends the same Ember there.
export const emberFull=(s,p)=>!!(p.forms?.length&&!p.form&&!p.formShift&&p.ember>=p.emberMax&&!(p.formCd>0));

const memoryStore={value:null,get(){return this.value;},set(v){this.value=v;}};
export const browserStore={
 get(){try{return globalThis.localStorage?.getItem(STORE_KEY)??null;}catch{return null;}},
 set(v){try{globalThis.localStorage?.setItem(STORE_KEY,v);}catch{}}
};

export class Coach{
 constructor(store=memoryStore){this.store=store;this.load();this.run=null;this.view=null;this.device='keys';}
 load(){
  let data=null;try{data=JSON.parse(this.store.get()||'null');}catch{}
  this.done=new Set(Array.isArray(data?.done)?data.done.filter(id=>LESSONS.includes(id)):[]);
  this.skipped=data?.skipped===true;
 }
 persist(){this.store.set(JSON.stringify({v:1,done:[...this.done],skipped:this.skipped}));}
 learned(id){return this.skipped||this.done.has(id);}
 // Lessons still worth offering (the menus use it to show Skip or Replay).
 pending(){return this.skipped?[]:LESSONS.filter(id=>!this.done.has(id));}
 skip(){this.skipped=true;this.persist();if(this.run)this.run.card=null;}
 reset(){this.done.clear();this.skipped=false;this.persist();this.run=null;}
 finish(id,frame){
  if(this.done.has(id))return;
  this.done.add(id);this.persist();
  // The tick-and-word beat only answers a card the hunter saw; verbs used unprompted are learned silently.
  const r=this.run;
  if(r&&(r.card?.id===id||frame-(r.seen[id]??-1e9)<COACH.linger+COACH.minShow))r.ack={id,until:frame+COACH.doneShow};
  if(r?.card?.id===id)r.card=null;
  // The six combat verbs learned: one closing line after the last tick.
  if(!this.skipped&&CORE.every(c=>this.done.has(c))&&CORE.includes(id))this.closing=t('coachComplete');
 }
 eligible(s){
  const p=s?.players?.[0];
  // The Hall of Masks is for hunters who already took a mask: no lessons there, contextual ones included.
  return !!p&&s.phase==='playing'&&s.config.mode==='solo'&&!p.dead&&!p.showcase&&!s.config.customLevel&&!s.config.hall&&!s.hall;
 }
 // One observation of the live run (call it at any rate; 10 Hz is plenty). Returns what to show:
 // {id, ack:false} for a lesson card, {id, ack:true} for the brief "done" beat, or null.
 step(s){
  if(!this.eligible(s)){if(this.run&&this.run.state!==s)this.run=null;return null;}
  const p=s.players[0],now=s.frame;
  if(this.run?.state!==s)this.run={state:s,x0:p.x,wasGround:!!p.grounded,card:null,seen:{},tries:{},rest:{},amber:new Map(),cyan:null,ack:null};
  const r=this.run;
  // Learning by doing: any use of a verb counts, whether or not its card was up.
  if(Math.abs(p.x-r.x0)>=COACH.moveTiles)this.finish('move',now);
  if(p.grounded)r.wasGround=true;else if(r.wasGround&&p.vy>0)this.finish('jump',now);
  if(p.move)this.finish('attack',now);
  if(p.dodge>0)this.finish('dodge',now);
  if(p.parryFlash>0)this.finish('parry',now);
  if(p.formShift>0&&!s.config.hall)this.finish('possess',now); // the 20f transformation (a Trial puts the mask on by itself)
  // Amber: an opening (wild stun or boss seam) that loses health while it glows.
  for(const e of s.enemies){
   const lit=!e.dead&&(e.vulnerable||e.open>0);
   if(lit){if(!r.amber.has(e))r.amber.set(e,e.hp);else if(e.hp<r.amber.get(e))this.finish('amber',now);}
   else if(r.amber.has(e)){if(e.dead||e.hp<r.amber.get(e))this.finish('amber',now);r.amber.delete(e);}
  }
  // Cyan: taught by dodging while it is near, or by letting it pass without a hit.
  const cyan=cyanThreat(s,p);
  if(cyan){if(!r.cyan)r.cyan={mask:p.mask,since:now};if(p.dodge>0)this.finish('cyan',now);}
  else if(r.cyan&&now-r.cyan.since>20){if(p.mask>=r.cyan.mask&&r.card?.id==='cyan')this.finish('cyan',now);r.cyan=null;}
  if(this.skipped)return null;
  if(r.ack&&now<r.ack.until)return {id:r.ack.id,ack:true};
  r.ack=null;
  if(this.closing){this.toast=this.closing;this.closing=null;}
  // The current card keeps its minimum time; a more urgent cue may still replace it.
  const cues={cyan:!!cyan,parry:!!parryCue(s,p),amber:!!amberTarget(s,p),possess:emberFull(s,p)&&!s.hall&&!s.config.hall};
  // A new contextual card is offered only a few times per run: an unused verb is not nagged about.
  let want=null;
  for(const id of CONTEXT)if(cues[id]&&!this.learned(id)&&(r.tries[id]||0)<COACH.tries[id]){want=id;break;}
  const card=r.card;
  if(card&&this.learned(card.id))r.card=null;
  if(r.card){
   // What is on screen now outranks a basic verb, and cyan outranks every other cue.
   const contextual=CONTEXT.includes(r.card.id);
   const urgent=want&&want!==r.card.id&&(!contextual||CONTEXT.indexOf(want)<CONTEXT.indexOf(r.card.id));
   if(contextual&&cues[r.card.id])r.card.last=now;
   const expired=contextual?now-r.card.last>COACH.linger:now-r.card.at>COACH.nagLimit;
   if(urgent||(expired&&now-r.card.at>=COACH.minShow)){
    if(!contextual&&expired)r.rest[r.card.id]=now+COACH.rest;
    r.card=null;
   }
  }
  if(!r.card){
   let id=want;
   // Basic verbs: first area of a solo run (in the Hub: the Head's rooms), never in the Hall or a boss fight, one rested
   // card at a time.
   if(!id&&(s.world?HEAD_ROOMS.includes(s.world.room)&&!s.world.fight:s.area===0)&&!s.hall&&!s.config.hall&&!s.bossStarted)id=BASIC.find(b=>!this.learned(b)&&!(r.rest[b]>now))||null;
   if(id){r.card={id,at:now,last:now};if(CONTEXT.includes(id))r.tries[id]=(r.tries[id]||0)+1;}
  }
  if(r.card)r.seen[r.card.id]=now;
  return r.card?{id:r.card.id,ack:false}:null;
 }
 // Key caps for an action on the current device.
 glyphs(id,maps){
  const solo=maps.solo,key=a=>keyLabel(solo[a][0]);
  const pad=a=>{const b=PAD.buttons.find(([,act])=>act===a)?.[0];return ['A','B','X','Y','LB','RB','LT','RT',t('padView'),'Menu'][b]??'';};
  const touch={move:[t('touchPadMove')],jump:[t('touchJump')],attack:[t('touchAttack'),t('touchSword')],dodge:[t('touchDodge')],parry:[t('touchHoldGuard')],amber:[t('touchAttack')],cyan:[t('touchDodge')],possess:[t('touchMask')]};
  if(this.device==='touch')return touch[id];
  const via=this.device==='pad'?pad:key;
  return {move:this.device==='pad'?[t('padStick')]:[key('left'),key('right')],jump:[via('jump')],attack:[via('attack'),via('sword')],dodge:[via('dodge')],
   parry:[via('block')],amber:[via('attack')],cyan:[via('dodge')],possess:[via('possess')]}[id];
 }
 skipLabel(maps){
  if(this.device==='touch')return t('coachSkipTouch');
  return t('coachSkip',{key:this.device==='pad'?t('padView'):keyLabel('Backspace')});
 }
 // Card markup (no input inside except the skip chip; the card itself lets every pointer through).
 cardHTML(view,maps){
  const {id,ack}=view;
  const caps=this.glyphs(id,maps).map(k=>`<span class="key">${k}</span>`).join('');
  const word=ack?t(id==='parry'?'coachParried':'coachGood'):t('coach_'+id);
  // The strike line names the two buttons of the device in use (touch has its own wording: its caps are words).
  const [attack,sword]=this.glyphs('attack',maps);
  const line=ack?'':t('coach_'+id+'Line'+(id==='attack'&&this.device==='touch'?'Touch':''),{attack,sword});
  return `<div class="coach-keys">${ack?'<span class="coach-tick" aria-hidden="true"></span>':caps}</div><div class="coach-text"><small>${t('coachEyebrow')}</small><strong>${word}</strong>${line?`<span>${line}</span>`:''}</div>`+
   (ack?'':`<span class="coach-skip" role="button">${this.skipLabel(maps)}</span>`);
 }
}

export const coach=new Coach(browserStore);

// Browser glue: which device the hunter is using, the skip inputs, and the card in #ui.
let attached=false,padSkip=false;const padActive=new Map(); // pad index -> last button/axis signature
// Backspace skips only while a lesson card (with its chip) is on screen in play: pressing it to leave
// Pause, or binding it in Options, must never throw the lessons away (coach.view outlives the card).
const cardShown=doc=>!!doc?.querySelector?.('#ui>#coach .coach-skip');
function attach(win){
 if(attached||!win?.addEventListener)return;attached=true;
 win.addEventListener('keydown',e=>{coach.device='keys';
  if(e.code==='Backspace'&&coach.view&&!e.repeat&&!coach.boundBackspace&&cardShown(win.document)&&!e.target?.matches?.('input,select,textarea')){e.preventDefault();coach.skip();coach.toast=t('coachSkipped');}
 },true);
 win.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')coach.device='touch';},true);
}
// Called by main.js at 10 Hz while the screen is 'playing'.
export function updateCoach(s,{root,input,touch=null,replaying=false,win=globalThis.window}={}){
 attach(win);
 const maps=input.maps;
 // A new run starts with the device the menus were driven with (Screens records it on <html>).
 const menuDevice=root?.ownerDocument?.documentElement?.dataset?.input;
 if(coach.seededFor!==s){coach.seededFor=s;if(['keys','pad','touch'].includes(menuDevice))coach.device=menuDevice;}
 coach.boundBackspace=Object.values(maps).some(m=>Object.values(m).some(codes=>codes.includes('Backspace')));
 // A pad in use (any button or a pushed stick) switches the glyphs; the View button skips.
 for(const pad of input.pads||[]){
  // Only a change counts: a pad whose triggers rest at -1 (non-standard mapping) or a drifting stick
  // must not pin pad glyphs while the hunter plays on the keyboard.
  const sig=(pad.buttons||[]).map(b=>b?.pressed?1:0).join('')+'|'+(pad.axes||[]).map(a=>a>.5?1:a<-.5?2:0).join('');
  const id=pad.index??0,prev=padActive.get(id);padActive.set(id,sig);
  if(prev!==undefined&&prev!==sig&&/1|2/.test(sig))coach.device='pad';
  const view=!!pad.buttons?.[8]?.pressed;
  if(view&&!padSkip&&coach.view){coach.skip();coach.toast=t('coachSkipped');}
  padSkip=view;
 }
 if(touch?.active&&coach.device==='keys'&&!(input.keys?.size))coach.device='touch';
 coach.live=!replaying&&!input.multi&&coach.eligible(s);
 const view=coach.live?coach.step(s):null;
 coach.view=view&&!view.ack?view:null;
 render(root,view,maps);
}
function render(root,view,maps){
 if(!root?.querySelector)return;
 let card=root.querySelector('#coach');
 const doc=root.ownerDocument;
 const toast=coach.toast;
 if(!view&&!toast){if(card)card.remove();doc?.body?.classList.remove('coach-on');return;}
 if(!card){
  card=doc.createElement('div');card.id='coach';card.setAttribute('role','status');card.setAttribute('aria-live','polite');root.append(card);
  card.addEventListener('click',e=>{if(e.target.closest('.coach-skip')){coach.skip();coach.toast=t('coachSkipped');}});
 }
 const key=toast?'toast:'+toast:(view.ack?'ack:':'card:')+view.id+':'+coach.device;
 if(card.dataset.key!==key){
  card.dataset.key=key;
  card.className='coach '+(toast?'coach-toast':'coach-'+view.id+(view.ack?' coach-ack':''));
  card.innerHTML=toast?`<div class="coach-text"><strong>${toast}</strong></div>`:coach.cardHTML(view,maps);
  if(toast){clearTimeout(coach.toastTimer);coach.toastTimer=setTimeout(()=>{coach.toast=null;},2600);}
 }
 doc?.body?.classList.toggle('coach-on',!toast);
}
