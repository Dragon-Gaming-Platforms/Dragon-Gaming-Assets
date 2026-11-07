// The Hub with Spokes UI: room names and door prompts in the play hint, the map screen (a Metroid-style grid of the
// rooms visited, known doors dashed, the hunter's marker), the route choice on the select screen, the mask-taken card
// and the pause menu's extra buttons. Reads simulation state only.
import {t,language} from './i18n.js';
import {keyLabel,tutorialHelp} from './control-help.js';
import {moveKeys,moveNames} from './hall.js';
import {liveBoss,bossName as liveBossName} from './boss-tips.js';
import EN from '../i18n/parts/hub.en.js';
import FR from '../i18n/parts/hub.fr.js';
import {HUB,HUB_BOSSES,HEAD_ROOMS as HEAD} from '../data/hub.js';
import {HUB_ROOMS,roomLevel} from '../data/hub-rooms.js';

export function ht(key,params={}){
 let value=(language==='fr'?FR:EN)[key];
 if(value===undefined)return t(key,params);
 for(const [k,v] of Object.entries(params))value=value.replaceAll(`{${k}}`,v);
 return value;
}
const bossName=id=>ht('hubBoss-'+id);
export const roomName=id=>ht('room-'+id);

// What the play hint says in a hub room: the room, a door's prompt or why it stays shut, the Amber Thread's use.
// The Head teaches the controls as the classic route's first areas do (tutorial1-4); a worn form lists its moves.
// coached: an onboarding card is up (src/ui/onboarding.js), so the room's control line waits (one prompt at a time).
// touch: the phone layout (no move list). In a fight a worn form's moves are only named on one line, never over the tells.
export function hubHint(s,maps,{coached=false,touch=false}={}){
 const w=s.world;if(!w)return '';
 const keys=maps.solo,down=keyLabel(keys.down[0]),p=s.players[0],H=s.level.hub;
 const moves=!p.form||touch?'':w.fight?moveNames(p.form,keys):t(p.form+'Moves',moveKeys(keys));
 // In a fight the hint names the boss exactly as its bar does (the HUD's label of the live boss): the Gullet's door is
 // 'chrysalis' but the fight is chrysalis5, so the door's name is only the fallback between attempts.
 if(w.fight){const e=liveBoss(s);return [e?liveBossName(e):bossName(w.fight),moves].filter(Boolean).join(' · ');}
 const parts=[roomName(w.room)];
 if(w.msg){
  const d=H.doors.find(x=>x.id===w.msg.door);
  parts.push(w.msg.state==='coming'?(d?.boss?ht('hubComing',{boss:bossName(d.boss)}):ht('hubHeartComing')):lockText(d?.gate||''));
  return parts.join(' · ');
 }
 let near=null,i=-1;
 H.doors.forEach((d,j)=>{if(d.kind!=='edge'&&Math.abs(p.x-d.x)<1.2&&Math.abs(p.y-d.y)<1.5){near=d;i=j;}});
 if(near){
  const st=w.doors[i];
  if(st==='locked')parts.push(lockText(near.gate));
  else if(st==='coming')parts.push(near.boss?ht('hubComing',{boss:bossName(near.boss)}):ht('hubHeartComing'));
  else parts.push(ht(near.kind==='boss'?'hubFace':near.kind==='lift'?'hubLiftUse':near.kind==='hall'?'hubHallUse':'hubEnter',{down,boss:near.boss?bossName(near.boss):''}));
 }else if(H.bench&&Math.abs(p.x-H.bench.x)<1.5&&Math.abs(p.y-H.bench.y)<1.5)parts.push(ht('hubRest',{down}));
 else if(moves)parts.push(moves);
 else if(H.knots.length&&w.echoes.includes('thread'))parts.push(ht('hubThread',{block:keyLabel(keys.block[0])}));
 else if(HEAD.includes(w.room)&&!coached)parts.push(tutorialHelp(HEAD.indexOf(w.room),{multi:false,maps}));
 return parts.join(' · ');
}
function lockText(gate){
 const first=String(gate).split('+').find(Boolean)||'';
 const [kind,value]=first.split(':');
 if(kind==='echo')return ht('hubNeedEcho',{echo:String(gate).split('+').map(g=>ht('echo-'+g.split(':')[1])).join(' + ')});
 if(kind==='boss')return ht('hubNeedBoss',{boss:bossName(value)});
 return ht('hubNeedMasks');
}

// The map: every visited room filled in its spoke's colour, known but uncrossed rooms dashed, the current room
// outlined in amber with the hunter's marker at his place in it.
const SPOKE_COLOR={head:'#7a4a3a',nave:'#5a3a62',render:'#8a7a64',mere:'#5a6a8a',drum:'#8a6a30',garden:'#2a6a60',well:'#6a2a34'};
export function mapHTML(s){
 const w=s.world,visited=w?.visited||[],cell=26,pad=1;
 const known=new Set(visited);
 for(const id of visited)for(const d of roomLevel(id).hub.doors)if(d.to)known.add(d.to.split(':')[0]);
 const rooms=HUB_ROOMS.filter(l=>known.has(l.hub.room));
 if(!rooms.length)return `<p>${ht('hubNone')}</p>`;
 let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;
 for(const l of HUB_ROOMS){const [x,y,mw,mh]=l.map;x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x+mw);y1=Math.max(y1,y+mh);}
 const W=(x1-x0+pad*2)*cell,H=(y1-y0+pad*2)*cell,X=x=>(x-x0+pad)*cell,Y=y=>(y-y0+pad)*cell;
 let body='';
 for(const l of rooms){
  const [x,y,mw,mh]=l.map,id=l.hub.room,seen=visited.includes(id),here=w.room===id||w.fight&&w.bench.room===id;
  body+=`<rect x="${X(x)+2}" y="${Y(y)+2}" width="${mw*cell-4}" height="${mh*cell-4}" rx="3" fill="${seen?SPOKE_COLOR[l.spoke]:'none'}" stroke="${here?'#ffab3d':seen?'#ece0c6':'#8a7a90'}" stroke-width="${here?3:1.5}"${seen?'':' stroke-dasharray="4 3"'}><title>${seen?roomName(id):'?'}</title></rect>`;
  if(seen&&l.hub.bench)body+=`<rect x="${X(x)+6}" y="${Y(y)+mh*cell-10}" width="8" height="4" fill="#8f1c2c"/>`;
  if(seen&&l.hub.doors.some(d=>d.kind==='boss'))body+=`<circle cx="${X(x)+mw*cell-9}" cy="${Y(y)+9}" r="4" fill="${w.cleared.includes(l.hub.doors.find(d=>d.kind==='boss').boss)?'#ffab3d':'#62f0ff'}"/>`;
  if(here&&!w.fight){
   const p=s.players[0],px=X(x)+2+(mw*cell-4)*Math.max(0,Math.min(1,p.x/l.width)),py=Y(y)+2+(mh*cell-4)*Math.max(0,Math.min(1,1-p.y/l.grid.length));
   body+=`<circle cx="${px}" cy="${py}" r="5" fill="#ffd98a" stroke="#120a12" stroke-width="2"><title>${ht('hubYouAreHere')}</title></circle>`;
  }
 }
 const echoes=(w.echoes||[]).map(e=>ht('echo-'+e)).join(', ')||ht('hubNone');
 return `<svg class="hub-map" viewBox="0 0 ${W} ${H}" width="100%" style="max-height:60vh;background:#0b0710;border-radius:8px" role="img" aria-label="${ht('hubMap')}">${body}</svg>`+
  `<p><strong>${roomName(w.fight?w.bench.room:w.room)}</strong> · ${ht('spoke-'+(roomLevel(w.fight?w.bench.room:w.room)?.spoke||'head'))}</p>`+
  `<p>${ht('hubEchoes')}: ${echoes} · ${ht('hubRooms',{n:visited.length,total:HUB_ROOMS.length})} · ${ht('hubDeaths',{n:w.deaths||0})}</p><small>${ht('hubLegend')}</small>`;
}
export function mapScreenHTML(s){
 return `<section class="panel"><h2>${ht('hubMap')}</h2>${mapHTML(s)}<div class="buttons"><button data-action="back">${t('back')}</button></div></section>`;
}
// The route on the solo select screen: the Hub is the default for new campaigns, the classic route stays one click away.
// A saved campaign is only replaced by a new Hub start, and the select screen says so.
export function routeHTML(saved=false){
 return `<label>${ht('hubRoute')}<select id="route"><option value="hub">${ht('hubRouteHub')}</option><option value="classic">${ht('hubRouteClassic')}</option></select>${saved?`<small>${ht('hubReplaces')}</small>`:''}</label>`;
}
// The HUD's progress line in a campaign (no lives there): the Mask Wall.
export function hubProgress(s){return ht('hubWall',{n:s.world.cleared.length,total:Object.keys(HUB_BOSSES).length});}
// The card after a boss of the hub falls: its mask, its Echo, and the vein-lift back to the Nave.
export function takenHTML(next){
 const k=next.taken;
 // The mask that fills the Wall says so: the end of this build's hunt, with the Heart Door ahead.
 const full=!k.again&&(next.config?.campaign?.cleared?.length||0)>=Object.keys(HUB_BOSSES).length;
 return `<section class="panel"><div class="eyebrow">${ht('spoke-'+HUB_BOSSES[k.boss].spoke)}</div><h2>${ht(k.again?'hubTakenAgain':k.mask?'hubTaken':'hubTakenWall',{boss:bossName(k.boss)})}</h2>`+
  // A mask that is a form: its name and what it does (it is worn from the Mask Ember from now on).
  (k.mask&&!k.again?`<p><strong>${t(k.mask)}</strong> · ${t(k.mask+'Desc')}</p>`:'')+
  (k.echo&&!k.again?`<p>${ht('hubEchoGained',{echo:ht('echo-'+k.echo)})}</p>`:'')+(full?`<p>${ht('hubWallFull')}</p>`:'')+
  `<div class="buttons"><button class="primary" data-action="lift">${ht('hubLiftRide')}</button><button data-action="home">${t('home')}</button></div></section>`;
}
// Extra pause-menu buttons in a campaign: the map, and (in a hub fight) the way back to the bench.
export function pauseHTML(s){
 if(!s.world)return '';
 return `<button data-action="map">${ht('hubMap')}</button>`+(s.world.fight?`<button data-action="retreat">${ht('hubRetreat')}</button>`:'');
}
export const savedText=()=>ht('hubSaved');
export {HUB};
