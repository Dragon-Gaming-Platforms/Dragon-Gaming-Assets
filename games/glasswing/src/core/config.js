import {KINDS} from '../data/kinds.js';
import {EYES,DIFFICULTY} from '../data/feel.js';
import {validateLevel} from '../game/level.js';
import {RULES_VERSIONS} from '../data/rules.js';
import {MOULTS} from '../data/moults.js';
import {MOULTS5} from '../data/moults5.js';
import {FORM_IDS,HALL} from '../data/forms.js';
import {validCampaign} from '../data/hub-rooms.js';
import {MONSTER_ARENAS,isMonster} from '../data/monsters.js';
import {FORMS5,huskRules} from '../data/forms5.js';

export const MODES=['solo','coop','versus'];
export const ARENAS=['arena-clearing','arena-canopy','arena-hollow'];
// Rules v4 boss keys (config.boss): the Unborn Chrysalis, then each spoke boss in its own arena. Configs without the
// key fight the M3 Old Glasswing.
export const BOSS_IDS=['chrysalis','chrysalis5','tallowgrave','antiphon','anchorite','cordycea','exuvial'];

// Imported replays must be playable before replacing the current local save.
export function validConfig(config){
 if(!config||typeof config!=='object'||Array.isArray(config)||
  !Object.hasOwn(KINDS,config.kind)||!Object.hasOwn(DIFFICULTY,config.difficulty)||
  !MODES.includes(config.mode)||typeof config.seed!=='string'||config.seed.length>100||
  !EYES.includes(config.eye))throw new Error('Invalid configuration');
 if(config.mode!=='solo'&&(!Object.hasOwn(KINDS,config.kind2)||!EYES.includes(config.eye2)))
  throw new Error('Invalid second player');
 if(config.rulesVersion!==undefined&&!RULES_VERSIONS.includes(config.rulesVersion))
  throw new Error('Unsupported rules version');
 // moults5: verb moults (rules 4+, not versus). It also lets starting moults name the five verb branches.
 if(config.moults5!==undefined&&(config.moults5!==true||!(config.rulesVersion>=4)||config.mode==='versus'))throw new Error('Invalid verb moults');
 const table=config.moults5?MOULTS5:MOULTS;
 // Starting moults (the ?unlock=all preview) exist from rules 4: one known id per slot.
 if(config.moults!==undefined){
  const slots=Array.isArray(config.moults)&&config.rulesVersion>=4&&config.moults.length<=5&&
   config.moults.map(id=>typeof id==='string'&&Object.hasOwn(table,id.replace(/-deep$/,''))&&table[id.replace(/-deep$/,'')]);
  if(!slots||slots.some(slot=>!slot)||new Set(slots).size!==slots.length)throw new Error('Invalid moults');
 }
 // Rules-v4 possession: owned boss masks, and the Hall of Masks (a Mask Trial in an arena, or a boss Rematch).
 if(config.masks!==undefined&&(!(config.rulesVersion>=4)||config.mode==='versus'||!Array.isArray(config.masks)||
  config.masks.some(id=>!FORM_IDS.includes(id))||new Set(config.masks).size!==config.masks.length))throw new Error('Invalid masks');
 // M1-D: v5 forms (the Chrysalis Husk) need rules v5, or the pre-v5 gate husk:true on rules 4.
 if(config.husk!==undefined&&(config.husk!==true||!(config.rulesVersion>=4)||config.mode==='versus'))throw new Error('Invalid husk');
 if(config.masks?.some?.(id=>Object.hasOwn(FORMS5,id))&&!huskRules(config))throw new Error('Invalid masks');
 if(config.hall!==undefined&&(!(config.rulesVersion>=4)||config.mode!=='solo'||config.customLevel!==undefined||
  config.hall==='trial'&&(!config.masks?.includes(config.form)||!ARENAS.includes(config.arena))||
  config.hall==='rematch'&&!HALL.tiers.includes(config.difficulty)||!['trial','rematch'].includes(config.hall)))throw new Error('Invalid hall');
 if(config.form!==undefined&&config.hall!=='trial')throw new Error('Invalid form');
 // Rules v4: the Unborn Chrysalis replaces the M3 Old Glasswing (older v4 replays carry no boss key).
 if(config.boss!==undefined&&(!BOSS_IDS.includes(config.boss)||!(config.rulesVersion>=4)))throw new Error('Invalid boss');
 // Rules v4: a spoke family's test arena (src/data/monsters.js).
 if(config.monsters!==undefined&&(!MONSTER_ARENAS.includes(config.monsters)||!(config.rulesVersion>=4)||config.mode==='versus'||
  config.hall!==undefined||config.customLevel!==undefined||config.campaign!==undefined))throw new Error('Invalid monsters');
 if(config.introSeen!==undefined&&typeof config.introSeen!=='boolean')throw new Error('Invalid intro');
 // The Hub with Spokes: a campaign segment's snapshot (src/data/hub-rooms.js).
 if(config.campaign!==undefined)validCampaign(config.campaign,config);
 // Mend (src/game/mend.js): the Mask Ember heal, from rules 4 and never in versus. Configs without it are unchanged.
 if(config.mend!==undefined&&(config.mend!==true||!(config.rulesVersion>=4)||config.mode==='versus'))throw new Error('Invalid mend');
 // Rules v4: the fairness fixes (src/game/fair.js) are opt-in, so configs without the key keep every digest.
 if(config.fair!==undefined&&(config.fair!==true||!(config.rulesVersion>=4)))throw new Error('Invalid fair');
 if(config.mode==='versus'&&config.arena!==undefined&&!ARENAS.includes(config.arena))
  throw new Error('Invalid arena');
 if(config.customLevel!==undefined)validateLevel(config.customLevel);
 // Spoke monsters in an editor level: rules v4 and up, never in versus (rules 1-3 levels keep the wild kinds only).
 if(config.customLevel?.waves?.some(w=>w.enemies.some(e=>isMonster(e.kind)))&&(!(config.rulesVersion>=4)||config.mode==='versus'))
  throw new Error('Invalid monsters');
 return config;
}
