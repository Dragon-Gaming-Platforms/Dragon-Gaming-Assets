import {say,liveBoss,bossTipKey,bossName,bossThresholds} from './boss-tips.js';
import {F} from '../data/feel.js';

// M0-A death card: a non-blocking overlay for about 2.5 s after a boss death (s.bossAttempts goes up). It shows how far
// the attempt got (the boss HP share reached, the phase), the attempt number, the best attempt this run and one lesson
// read from the boss's state at the death. The history lives here, keyed by the state object: the state is never written.
export const DEATH_CARD_FRAMES=Math.round(2.5*F.hz);
const memory=new WeakMap();
const score=a=>a.glass?-1:a.share;

function observe(s){
 const attempts=s.bossAttempts||0;
 let h=memory.get(s);
 // A state seen for the first time starts with no card, whatever attempt it is on (a resumed or replayed run).
 if(!h){h={seen:attempts,live:null,list:[],card:null};memory.set(s,h);}
 if(attempts>h.seen){
  if(h.live){h.list.push(h.live);h.card={entry:h.live,from:s.frame};}
  h.seen=attempts;h.live=null;
 }
 const e=liveBoss(s),prev=h.live;
 // Once the hunters are down (s.bossRetry) the attempt is frozen: the lesson is the one from the moment of the death.
 if(e&&!prev?.final){
  const share=e.glass?0:Math.max(0,Math.min(1,e.hp/e.maxMask));
  h.live={attempt:attempts+1,name:bossName(e),thresholds:bossThresholds(e),
   share:prev?Math.min(prev.share,share):share,phase:Math.max(prev?.phase||1,e.phase||1),glass:!!(e.glass||prev?.glass),
   tip:bossTipKey(e),final:!!s.bossRetry};
 }
 return h;
}

// Seconds the current card has been up, or -1 with no card (hud() resumes its fade from here after a repaint).
export function deathCardAge(s){
 const h=memory.get(s);
 if(!h?.card)return -1;
 const age=s.frame-h.card.from;
 return age>=0&&age<DEATH_CARD_FRAMES?age/F.hz:-1;
}

export function deathCard(s){
 const h=observe(s),card=h.card;
 if(!card||s.frame-card.from>=DEATH_CARD_FRAMES||s.frame<card.from)return '';
 const c=card.entry,pct=Math.round(c.share*100);
 // The best attempt this run: none to compare on the first death; a new best (ties go to the earlier attempt) says so.
 let best=h.list[0]||c;
 for(const a of h.list)if(score(a)<score(best))best=a;
 const first=h.list.length<2,record=!first&&best===c;
 const ticks=c.thresholds.map((x,i)=>`<i class="${c.phase>i+1||c.glass?'passed':''}" style="left:${x*100}%"></i>`).join('');
 const pips=Array.from({length:c.thresholds.length+1},(_,i)=>i+1).map(n=>`<i class="${n<=c.phase||c.glass?'on':''}"></i>`).join('');
 const bestLine=first?'':record?say('deathCardNewBest'):best.glass?say('deathCardBestGlass',{n:best.attempt}):say('deathCardBest',{n:best.attempt,pct:Math.round(best.share*100)});
 return `<div class="deathcard" role="status"><small>${say('deathCardTitle',{n:c.attempt})}</small>`+
  `<div class="dc-meter${c.glass?' glass':''}" role="meter" aria-label="${c.name}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><span style="width:${pct}%"></span>${ticks}</div>`+
  `<strong>${c.glass?say('deathCardGlass'):say('deathCardLeft',{pct})}</strong>`+
  `<div class="dc-phase"><span class="phase-pips">${pips}</span>${c.glass?say('bossDesperation'):say('bossPhase',{n:c.phase,total:c.thresholds.length+1})}</div>`+
  (bestLine?`<div class="dc-best${record?' record':''}">${bestLine}</div>`:'')+
  `<p class="dc-tip"><em>${say('deathCardLearned')}</em>${say(c.tip)}</p></div>`;
}
