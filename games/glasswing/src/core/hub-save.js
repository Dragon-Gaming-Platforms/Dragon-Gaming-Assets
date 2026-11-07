// The Hub campaign's own save slot (localStorage glasswing.hub.v1): the replay of its running segment. Hours of
// progress must never ride on storage.current alone, which any Hall or classic run replaces and every result clears.
// Older builds never read this key, and a slot that fails validateReplay is ignored, never the whole save.
import {record,validateReplay} from './replay.js';

export const HUB_SAVE_KEY='glasswing.hub.v1';
export function loadCampaign(){
 try{const raw=localStorage.getItem(HUB_SAVE_KEY);return raw?validateReplay(JSON.parse(raw)):null;}
 catch{return null;}
}
export function writeCampaign(replay){
 try{localStorage.setItem(HUB_SAVE_KEY,JSON.stringify(replay));return true;}
 catch{return false;}
}
// Same rule as captureCurrent: only a live, unwatched campaign segment that has not ended yet.
export function captureCampaign(state,active,replaying){
 if(active&&!replaying&&state.world&&!state.players[0].showcase&&state.phase!=='result')writeCampaign(record(state));
}
