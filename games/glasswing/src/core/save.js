import {DEFAULT_KEYS} from './input.js';
import {record,validateReplay} from './replay.js';
import {KINDS} from '../data/kinds.js';
import {DIFFICULTY} from '../data/feel.js';
import {MODES,ARENAS} from './config.js';
import {FORM_IDS,HALL} from '../data/forms.js';
import {REMATCH_IDS,legacy} from '../data/rematch.js';
export {validConfig} from './config.js';

export const defaultSettings={language:'en',music:.45,sound:.6,difficulty:'normal',maps:DEFAULT_KEYS,touch:'auto',numbers:true,shake:'full',cues:.8,heartbeat:true};

function validSettings(value){
 const settings={...defaultSettings};
 for(const key of Object.keys(settings))if(value?.[key]!==undefined)settings[key]=value[key];
 if(!['en','fr'].includes(settings.language))settings.language='en';
 for(const key of ['music','sound','cues'])settings[key]=Math.max(0,Math.min(1,Number(settings[key])||0));
 // A save from before the cue slider whose effects were muted stays silent: tells and the heartbeat start muted too.
 if(value?.cues===undefined&&value?.sound!==undefined&&settings.sound===0)settings.cues=0;
 settings.heartbeat=settings.heartbeat!==false;
 if(!Object.hasOwn(DIFFICULTY,settings.difficulty))settings.difficulty='normal';
 if(!['auto','on','off'].includes(settings.touch))settings.touch='auto';
 settings.numbers=settings.numbers!==false;if(!['full','reduced','off'].includes(settings.shake))settings.shake='full';
 const maps=structuredClone(DEFAULT_KEYS);
 for(const layout of Object.keys(maps))for(const action of Object.keys(maps[layout])){
  const codes=settings.maps?.[layout]?.[action];
  if(Array.isArray(codes)&&codes.length&&codes.length<=5&&
   codes.every(code=>typeof code==='string'&&/^[A-Za-z0-9]{1,24}$/.test(code)))
   maps[layout][action]=[...codes];
 }
 // An action the save predates (possess, rules v4) drops default keys the player already gave another action.
 for(const layout of Object.keys(maps))for(const action of Object.keys(maps[layout])){
  if(Array.isArray(settings.maps?.[layout]?.[action])||!settings.maps?.[layout])continue;
  const used=new Set(Object.entries(maps[layout]).flatMap(([a,codes])=>a===action?[]:codes));
  const free=maps[layout][action].filter(code=>!used.has(code));
  if(free.length)maps[layout][action]=free;
 }
 settings.maps=maps;
 return settings;
}

function validBests(value){
 const bests={};
 // Invalid optional records are discarded; they must not crash a later result screen.
 for(const mode of MODES)for(const kind of Object.keys(KINDS))for(const difficulty of Object.keys(DIFFICULTY)){
  const key=mode+'-'+kind+'-'+difficulty,entry=value?.[key];
  if(entry&&typeof entry.won==='boolean'&&Number.isFinite(entry.score)&&entry.score>=0&&
   Number.isFinite(entry.time)&&entry.time>=0)bests[key]={...entry};
 }
 return bests;
}

// Hall of Masks records, apart from the campaign bests: per fight, the best time and the fewest hits (a trial adds waves).
export const hallKeys=()=>[...FORM_IDS.flatMap(form=>ARENAS.map(arena=>'trial-'+form+'-'+arena)),...REMATCH_IDS.flatMap(boss=>HALL.tiers.map(tier=>'rematch-'+boss+'-'+tier))];
const count=v=>Number.isFinite(v)&&v>=0;
function validHall(value){
 const hall={};
 for(const key of hallKeys()){
  // A record from before per-boss keys ('rematch-<tier>') belongs to the boss those builds fought there.
  const old=key.startsWith('rematch-'+legacy+'-')?'rematch-'+key.slice(9+legacy.length):null;
  const entry=value?.[key]||(old?value?.[old]:undefined);
  if(entry&&count(entry.time)&&count(entry.hits)&&(entry.waves===undefined||count(entry.waves)))hall[key]={time:entry.time,hits:entry.hits,...(entry.waves!==undefined?{waves:entry.waves}:{})};
 }
 return hall;
}
// A trial keeps its best run (most waves, then fewest hits); a rematch keeps its best time and fewest hits separately.
export function hallBest(hall,key,run){
 const old=hall[key];
 if(run.waves!==undefined){
  if(old&&(run.waves<(old.waves||0)||run.waves===old.waves&&run.hits>=old.hits))return false;
  hall[key]={waves:run.waves,time:run.time,hits:run.hits};return true;
 }
 if(!old){hall[key]={time:run.time,hits:run.hits};return true;}
 const better=run.time<old.time||run.hits<old.hits;
 old.time=Math.min(old.time,run.time);old.hits=Math.min(old.hits,run.hits);
 return better;
}
// Save format 2 adds progress (the Glass tier unlock, owned boss masks) and Hall of Masks records. Version 1 saves migrate: any recorded win unlocks Glass.
export const SAVE_VERSION=2,SAVE_KEY='glasswing.v2',LEGACY_KEY='glasswing.v1';
export function validSave(data){
 if(!data||![1,2].includes(data.version))throw new Error('Invalid save');
 if(data.current!==undefined&&data.current!==null)validateReplay(data.current);
 const bests=validBests(data.bests);
 const glass=data.version===1?Object.values(bests).some(entry=>entry.won):data.progress?.glass===true;
 return {
  version:SAVE_VERSION,settings:validSettings(data.settings),current:data.current||null,
  bests,unlocked:['brawler','skimmer','spark'],
  progress:{glass,masks:FORM_IDS.filter(id=>data.version===2&&Array.isArray(data.progress?.masks)&&data.progress.masks.includes(id))},
  hall:validHall(data.hall)
 };
}
export function loadSave(){
 for(const key of [SAVE_KEY,LEGACY_KEY]){
  try{
   const raw=localStorage.getItem(key);
   // A run that can no longer be resumed (a replay past validateReplay's limits, say) costs that run only, never the
   // settings, masks and records saved beside it.
   if(raw){const data=JSON.parse(raw);try{return validSave(data);}catch(error){if(data?.current)return validSave({...data,current:null});throw error;}}
  }catch{}
 }
 return validSave({version:SAVE_VERSION});
}
// The legacy v1 entry is left untouched so an older build can still read its own save.
export function save(data){
 try{localStorage.setItem(SAVE_KEY,JSON.stringify(data));return true;}
 catch{return false;}
}
export function captureCurrent(storage,state,active,replaying){
 // The animated title and watched recordings must never overwrite the player's run.
 if(active&&!replaying&&!state.players[0].showcase&&state.phase!=='result')storage.current=record(state);
}
