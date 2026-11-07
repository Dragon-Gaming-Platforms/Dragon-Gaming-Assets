import {t,language} from './i18n.js';
import en from '../i18n/parts/m0-hud.en.js';
import fr from '../i18n/parts/m0-hud.fr.js';
import {CHRYSALIS as C} from '../data/chrysalis.js';
import {BOSS4} from '../data/boss4.js';

// M0-A strings: read from the m0-hud fragment first, so they work before and after M0-INT merges the
// fragments into the dictionaries; any other key falls through to t().
export function say(key,params={}){
 let value=(language==='fr'?fr:en)[key];
 if(value===undefined)return t(key,params);
 for(const [k,v] of Object.entries(params))value=value.replaceAll(`{${k}}`,v);
 return value;
}
// A label that may not exist yet (a form or boss added by a later package) never throws in the HUD.
export function label(key,fallback=key){try{return t(key);}catch{return fallback;}}

// The live v4 boss (the Chrysalis, the M3 Old Glasswing or any later boss with v4:true), or null.
export function liveBoss(s){
 // Cordycea's risen husks are boss entities too: the crown is the boss shown.
 for(const e of s.enemies)if(e.boss&&e.v4&&!e.dead&&!e.risen)return e;
 return null;
}

// A v4 boss's id (also its label key and the '<id>Cry' of its card): the Chrysalis, or a spoke boss's e.name / e.card / e.bossName / e.bossId (each package named it its own way);
// null for the M3 Old Glasswing.
export const bossId=e=>e?(e.chrysalis?'chrysalis':e.name||e.card||e.bossName||e.bossId||null):null;
export const bossName=e=>label(bossId(e)||'boss');
// The hint line's area name for a spoke boss arena built from the Nest (its key, or the spoke's name; else the level's).
export const arenaKey=L=>L.arena||(L.gullet5?'gullet5Arena':L.mere?'spoke-mere':L.drum?'spoke-drum':L.garden?'spoke-garden':L.well?'spoke-well':L.id);
// How many phases the boss has (one more than its thresholds; both v4 bosses have 3).
export const bossPhases=e=>bossThresholds(e).length+1;
// HP shares where the boss changes phase (both v4 bosses split at two thirds and one third).
export const bossThresholds=e=>e.thresholds||(e.chrysalis?C.thresholds:BOSS4.thresholds);

// The spoke bosses' lessons (src/i18n/parts/boss-tips.*.js): the move in progress (e.act.id) or a state (e.ai) picks
// 'bossTip<Boss><Lesson>'; rest is the lesson between moves. Its live hint is the 'bossHint...' twin.
const SPOKE_TIPS={
 tallowgrave:{moves:{palm:'Palm',rake:'Rake',tear:'Tear',pour:'Pour',grasp:'Grasp',snuff:'Snuff',sweep:'Sweep',pulse:'Pulse',stride:'Stride',race:'Race'},rest:'Shadow'},
 antiphon:{moves:{hands:'Hands',hymn:'Hymn',grasp:'Grasp',fan:'Fan',lunge:'Lunge',hold:'Hold'},rest:'Mirror'},
 anchorite:{moves:{lash:'Lash',ribs:'Ribs',drop:'Drop',pour:'Pour'},ai:{warn:'Turn',turn:'Turn',land:'Turn'},rest:'Bulb'},
 cordycea:{moves:{lash:'Lash',snare:'Snare',bloom:'Bloom',puff:'Puff',volley:'Volley',rain:'Rain'},ai:{inhale:'Breath'},rest:'Corpse'},
 exuvial:{moves:{hook:'Hook',gore:'Gore',burst:'Burst',rake:'Rake',sweep:'Sweep',sigil:'Sigil',slam:'Slam',storm:'Storm'},ai:{cocoon:'Cocoon'},rest:'Graft'}
};
const cap=id=>id[0].toUpperCase()+id.slice(1);
function spokeTip(e,id){
 const T=SPOKE_TIPS[id],B='bossTip'+cap(id);
 if(e.glass)return B+'Glass';
 if(e.ai==='transition')return 'bossTipShift';
 // Tallowgrave's P1 openings (the jammed wrist) stay behind the veil in its fight state: e.open is the opening.
 if(e.ai==='open'||e.tallow&&e.open>0)return 'bossTipAmber';
 return B+(T.ai?.[e.ai]||T.moves[e.act?.id]||T.rest);
}
export const SPOKE_TIP_KEYS=Object.entries(SPOKE_TIPS).flatMap(([id,T])=>[...new Set(['Glass',T.rest,...Object.values(T.moves),...Object.values(T.ai||{})])].map(x=>'bossTip'+cap(id)+x));

// The lesson the boss's state teaches, as a fragment key. Read-only on the entity.
export function bossTipKey(e){
 if(!e)return null;
 const id=bossId(e);
 if(id&&Object.hasOwn(SPOKE_TIPS,id))return spokeTip(e,id);
 if(e.chrysalis){
  if(e.glass)return 'bossTipGlass';
  if(e.ai==='transition')return 'bossTipShift';
  if(e.ai==='open')return 'bossTipOpen';
  if(e.ai==='reel'||e.act?.id==='reel')return 'bossTipReel';
  const id=e.act?.id;
  if(id==='wall'||e.rung>=C.wallRung||e.falls?.length)return 'bossTipWall';
  if(id==='corkscrew'||e.wires?.length)return 'bossTipCork';
  if(id==='flail')return 'bossTipFlail';
  if(id==='gum'||e.strands?.length)return 'bossTipGum';
  if(e.rung===C.ledgeRung)return 'bossTipLedge';
  return 'bossTipSwing';
 }
 // The M3 Old Glasswing: the move it was making (e.action), else its last chain's last move.
 if(e.glass)return 'bossTipGlassM3';
 if(e.ai==='transition')return 'bossTipShift';
 if(e.ai==='open')return 'bossTipOpen';
 const move=e.action||e.pattern?.m?.[Math.min(e.step||0,(e.pattern.m.length||1)-1)];
 const keys={sweep:'bossTipSweep',slam:'bossTipSlam',barrage:'bossTipBarrage',rush:'bossTipRush',lunge:'bossTipLunge',summon:'bossTipSummon'};
 return keys[move]||'bossTipChain';
}

// The live hint's key: the short twin (bossHint*) of the lesson the boss's state teaches.
export function bossHintKey(e){
 if(!e||e.ai==='enter'||e.ai==='spent'||e.ai==='dying')return null;
 if(e.ai==='open'||e.tallow&&e.open>0)return 'bossHintOpen';
 // Between the M3 boss's chains the lesson is the opening it gives for a clean dodge.
 if(!bossId(e)&&!e.glass&&(e.ai==='neutral'||e.ai==='recover'))return 'bossHintChain';
 return bossTipKey(e).replace('bossTip','bossHint');
}

// The hint line is read mid-fight: a hint stays up at least HINT_HOLD frames (a new one only replaces it after that),
// except "Open! Strike now", which shows at once while the opening lasts. Kept per state here, never on the state.
export const HINT_HOLD=150;
const held=new WeakMap();
// A short hint for the hint line while a v4 boss is alive (M0-INT calls it from main.js), else null.
export function bossHint(s){
 const key=bossHintKey(liveBoss(s)),h=held.get(s),frame=s.frame||0;
 if(!key){held.delete(s);return null;}
 if(!h||key==='bossHintOpen'||h.key==='bossHintOpen'||h.key===key||frame-h.since>=HINT_HOLD||frame<h.since){
  if(h?.key!==key)held.set(s,{key,since:frame});
 }
 return say(held.get(s).key);
}
