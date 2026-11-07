// The ear: reads simulation state (never writes it) once per rendered frame and turns what changed into sound
// events: weighted impacts, telegraph colours and their release, openings, boss phase stingers, desperation,
// kills, the low-health heartbeat and the music's theme and intensity.
// Generic conventions cover any boss that follows them (boss:true, phase, glass, ai 'telegraph'|'open',
// act.stage 'tell', unparryable); registerTellReader() lets a boss with its own tell state plug in by key.
import {MOVE_WEIGHT,WEIGHT,INTENSITY,THEMES} from './sonic.js';
import {MONSTERS} from '../data/monsters.js';

const parryable=e=>!(e.unparryable||e.unblockable||e.parryable===false);
const INTERRUPT=new Set(['stagger','open','transition','spent','idle','enter','recover','neutral']);
const readers=new Map();
// fn(e,s) -> {key:string,parry:boolean}|null for "telling now", or undefined to use the generic reader.
export function registerTellReader(bossKey,fn){readers.set(bossKey,fn);}
// The spoke bosses give each strike its colour in the hit itself (hurt's unparryable option), not on e.unparryable, so
// their tells read the colour from the move, by the same rule the strike uses. Ivory = parry it, cyan = get out.
const told=e=>e.act?.stage==='tell';
registerTellReader('tallowgrave',e=>told(e)?{key:'a:'+e.act.id+(e.act.sub?':'+e.act.sub:''),parry:e.act.id==='tear'||e.act.id==='sweep'&&e.act.sub==='thrust'}:undefined);
registerTellReader('antiphon',e=>{
 const a=e.act;
 if(told(e))return {key:'a:'+a.id,parry:a.id==='hold'||a.id==='hymn'&&!!a.ivory||a.id==='hands'&&!!a.arms?.some(x=>x.real&&x.ivory)};
 // The sung Hymn (no act): its waves carry the song's colour.
 if(e.song)return {key:'song',parry:!!e.song.ivory};
 return undefined;
});
// The Hourglass Anchorite: the drum's turn warning is cyan; of its moves only the Sand Lash is parried.
registerTellReader('anchorite',e=>e.ai==='warn'?{key:'warn',parry:false}:told(e)?{key:'a:'+e.act.id,parry:e.act.id==='lash'}:undefined);
// Cordycea and the dead it wears never strike ivory.
registerTellReader('cordycea',e=>told(e)?{key:'a:'+e.act.id,parry:false}:undefined);
// The Exuvial's Rake: every swipe has its own wind-up (the first one follows the tell without a gap).
registerTellReader('exuvial',e=>e.act?.id==='rake'&&(e.act.stage==='tell'||e.act.stage==='wind')?{key:'a:rake:'+(e.act.stage==='tell'?0:e.act.n),parry:!e.unparryable}:undefined);
// The finished Chrysalis: a delayed clap holds its tell (the release sounds when the halves really close).
registerTellReader('chrysalis5',e=>e.act?.stage==='hold'?{key:'a:'+e.act.id,parry:!e.unparryable}:undefined);
// Lesser bodies a boss raises (Cordycea's risen dead) are threats with tells, but never the boss: no phase, no crescendo.
export const lesser=e=>!!(e?.risen||e?.minion);
export function bossKey(s,e){
 const key=s?.config?.boss;
 if(key&&THEMES[key])return key;
 return e?.chrysalis?'chrysalis':e?.chrysalis5?'chrysalis5':'imago';
}
export function tellOf(e,s){
 if(!e||e.dead)return null;
 if(e.boss){const fn=readers.get(bossKey(s,e));if(fn){const r=fn(e,s);if(r!==undefined)return r;}}
 // A spoke monster's colour is its move's (data parry:true = ivory), as its strike lands it (monster-kit land).
 if(e.ai==='telegraph')return {key:'t:'+(e.action||e.kind||''),parry:e.beast&&MONSTERS[e.kind]?.moves?.[e.act]?!!MONSTERS[e.kind].moves[e.act].parry:parryable(e)};
 if(e.act&&e.act.stage==='tell')return {key:'a:'+e.act.id,parry:!e.unparryable};
 if(e.ai==='reel'&&e.reel?.stage==='creak')return {key:'reel',parry:false};
 // The Chrysalis's shove cue: the ivory lip flash (a pump cue, not a strike).
 if(e.lip)return {key:'lip'+e.lip,parry:true,soft:true};
 return null;
}
export function createEar(){return {state:null,frame:-1,ents:new WeakMap()};}

// A boss dying through a hold (Cordycea's bloom) counts as down from the killing blow: the crescendo lands on the hit.
function snapshot(e,s){
 const t=tellOf(e,s);
 return {hp:e.hp,flash:e.flash||0,elite:e.eliteHits||0,dead:!!e.dead||!!e.boss&&!lesser(e)&&e.ai==='dying',phase:e.phase||0,glass:!!e.glass,
  ai:e.ai,open:e.ai==='open',riposte:!!e.riposte,tell:t?.key||null,parry:!!t?.parry,falls:e.falls?.length||0};
}
const lead=s=>{for(const p of s.players||[])if(!p.dead)return p;return s.players?.[0]||null;};
function attacker(s,e){
 let best=null,d=Infinity;
 for(const p of s.players||[])if(!p.dead&&p.team!==2){const k=Math.abs(p.x-e.x)-(p.move||p.form?100:0);if(k<d){d=k;best=p;}}
 return best;
}
// Hit weight (0 chip .. 3 crushing) from the move, the target and the context.
export function weigh({move,form,glass,boss,share=0,damage=0,amber,riposte,kill}){
 let w=form?3:MOVE_WEIGHT[move]??1;
 if(glass)w++;
 if(boss){
  if(amber)w=Math.max(w,2);
  if(share>=WEIGHT.bossHeavy)w++;
  if(riposte)w=3;
 }else if(damage>=WEIGHT.wildHeavy)w++;
 if(kill)w++;
 return Math.max(0,Math.min(3,w));
}

// Returns {events:[{cue,...opts}], theme, intensity, danger, phase, colour}. The first look at a state only primes memory.
// phase and colour ('ivory'|'cyan', from the live boss's unparryable flag) give context to sim cues the ear cannot place.
export function listen(ear,s,{title=false}={}){
 const out={events:[],theme:'title',intensity:0,danger:0,phase:0,colour:null};
 const fresh=ear.state!==s||(s.frame??0)<ear.frame;
 if(fresh){ear.state=s;ear.ents=new WeakMap();}
 ear.frame=s.frame??0;
 const me=lead(s),pan=x=>me?Math.max(-.85,Math.min(.85,(x-me.x)/10)):0;
 let boss=null;
 for(const e of s.enemies||[]){
  if(e.boss&&!lesser(e)&&(!boss||!e.dead))boss=e;
  const m=ear.ents.get(e),now=snapshot(e,s);ear.ents.set(e,now);
  if(!m||fresh||title)continue;
  const kill=now.dead&&!m.dead,ev=out.events,p=pan(e.x);
  const dropped=Math.max(0,(m.hp??0)-(now.hp??0)),shield=now.elite<m.elite,flashed=now.flash>m.flash;
  const by=attacker(s,e),ctx={move:by?.move,form:by?.form,glass:!!by?.glass&&!by?.form};
  if(e.boss&&!lesser(e)){
   const theme=bossKey(s,e),rise=now.phase>m.phase&&!kill,desp=now.glass&&!m.glass&&!kill;
   if(kill){ev.push({cue:'impact',weight:3,amber:true,pan:p,boss:true});ev.push({cue:'boss-kill',theme,boss:true});}
   else if(desp||rise){
    // The blow that crosses a threshold lands crushing, then the stinger.
    if(dropped>1e-9)ev.push({cue:'impact',weight:3,pan:p,boss:true});
    ev.push(desp?{cue:e.v4?'boss-desperation':'boss-break',theme,pan:p,boss:true}:{cue:'boss-phase',phase:now.phase,theme,boss:true});
   }
   if(now.open&&!m.open&&!kill)ev.push({cue:'boss-opening',pan:p,boss:true});
   // Clank states (entrance, transition, Glass) already sound their 'block'.
   const clank=m.ai==='enter'||m.ai==='transition'||m.glass;
   if(!kill&&!desp&&!rise&&(dropped>1e-9||flashed)&&!(clank&&dropped<=1e-9)){
    const amber=m.open||now.open,share=e.maxMask?dropped/e.maxMask:0;
    if(!amber&&share<WEIGHT.chip)ev.push({cue:'impact',chip:true,weight:0,pan:p,boss:true});
    else ev.push({cue:'impact',weight:weigh({...ctx,boss:true,share,amber,riposte:m.riposte&&!now.riposte&&amber}),amber,pan:p,boss:true});
   }
  }else if(e.team===2){
   if(kill){
    const w=weigh({...ctx,damage:dropped,kill:true});
    ev.push({cue:'impact',weight:w,pan:p});ev.push({cue:'enemy-kill',weight:e.elite?3:w,pan:p});
   }else if(dropped>1e-9||shield||flashed)ev.push({cue:'impact',weight:weigh({...ctx,damage:dropped}),shield:shield&&!dropped,pan:p});
  }
  // Debris warnings (wall strike dust, transition rubble) are unparryable: they shriek cyan as they are set.
  if(now.falls>m.falls&&!now.dead)out.events.push({cue:'tell-cyan',boss:!!e.boss,pan:p,tell:'falls'});
  // Telegraph colours: a rising tell sounds its colour; the strike leaving it sounds its release.
  if(now.tell&&now.tell!==m.tell)out.events.push({cue:now.parry?'tell-ivory':'tell-cyan',boss:!!e.boss,soft:now.tell.startsWith('lip'),pan:p,tell:now.tell});
  else if(!now.tell&&m.tell&&!now.dead&&!m.tell.startsWith('lip')&&m.tell!=='reel'&&!INTERRUPT.has(e.ai))
   out.events.push({cue:m.parry?'strike-ivory':'strike-cyan',boss:!!e.boss,pan:p});
 }
 // Heartbeat: a local hunter one mask from Glass, or in Glass (not while wearing a boss form).
 if(!title&&s.phase==='playing')for(const p of (s.players||[]).slice(0,2))if(!p.dead&&!p.form&&p.team!==2){
  const level=p.glass?2:p.maxMask>1&&p.mask<=1?1:0;out.danger=Math.max(out.danger,level);
 }
 // Music: the boss's theme by phase (desperation peaks), else the area by nearby threat.
 if(title)return out;
 if(boss){
  out.theme=bossKey(s,boss);out.phase=boss.phase||1;if(!boss.dead)out.colour=parryable(boss)?'ivory':'cyan';
  out.intensity=boss.dead?0:boss.ai==='enter'?1:boss.glass?INTENSITY.desperation:INTENSITY.boss[Math.max(1,Math.min(3,boss.phase||1))];
 }else{
  out.theme=s.config?.hall==='trial'?'trial':(s.area??0)<2?'forest':'hollow';
  let n=0;
  for(const e of s.enemies||[])if(!e.dead&&e.team===2&&(s.players||[]).some(p=>!p.dead&&Math.abs(p.x-e.x)<INTENSITY.near))n++;
  out.intensity=n===0?0:n>=INTENSITY.crowd?2:1;
  if(s.config?.hall==='trial')out.intensity=Math.max(1,out.intensity);
  // Versus: two hunters, no wild threat to count; the duel runs on the trial score with drums.
  if(s.config?.mode==='versus'){out.theme='trial';out.intensity=2;}
 }
 if(s.phase==='result')out.intensity=0;
 return out;
}
