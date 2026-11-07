import {NAVE} from './nave.js';
import {MERE} from './mere.js';
import {HINDWING} from './hindwing.js';

// The spoke bestiary (BOSS-DESIGN hub map: each spoke has its own enemy family). Levels reference these type ids in
// their waves exactly like the wild kinds ('brawler', 'skimmer', 'spark'); a flock entry may carry count (1-8).
// None of these ids appears in any shipped level, the Mask Trial or a boss summon, so every existing config is unchanged.
export const MONSTERS={...NAVE,...MERE,...HINDWING};
export const MONSTER_KINDS=Object.keys(MONSTERS);
export const isMonster=kind=>Object.hasOwn(MONSTERS,kind);

// Shared rules. minTell: no strike of these families lands with less warning (Glass shortens tells down to it).
// glassTell: Glass tier tell scale; Pilgrim uses TIERS.easy.tell. exposed: damage taken while an amber weak point shows.
export const MON={
 minTell:18,glassTell:.88,exposed:1.5,clank:3,heavy:['punch3','kick','divekick','downsword','pogo','glaive3'],
 aimHeight:.6,flockMax:8,hiddenY:-.2,
 // A hunter standing on a ledge out of reach above (dy tiles up, within dx) for wait frames is answered: light bodies
 // hop up to it (crouch frames, then a jump that clears the ledge by lift, at most max tiles), the diver rises under it,
 // the husk vents upward. Nothing waits a perched hunter out.
 perch:{dy:1.5,dx:3,wait:45,crouch:16,lift:.7,max:4.5,speed:.14},
 // XP and drops follow the wild rules (wild 2, elite 5); flock members after the first are minions (no XP, no drop).
 xpElite:['husk-sovereign']
};

// Spoke table for the hub: spoke id -> its family's kinds, its mid-boss and the boss behind its door. The bosses are
// built by their own packages (selected by config.boss); only the Gullet's Chrysalis exists today.
export const SPOKES={
 gullet:{family:'head',kinds:['brawler','skimmer','spark'],elite:null,boss:'chrysalis'},
 nave:{family:'nave',kinds:['wick-bearer','drip-censer'],elite:null,boss:'tallowgrave'},
 mere:{family:'mere',kinds:['mirror-skater','scale-diver'],elite:null,boss:'antiphon'},
 drum:{family:'hindwing',kinds:['sporeling','cordyceps-husk'],elite:'husk-sovereign',boss:'anchorite'},
 garden:{family:'hindwing',kinds:['sporeling','cordyceps-husk'],elite:'husk-sovereign',boss:'cordycea'}
};

// Test arenas, one per family plus the mid-boss room (config.monsters). Three locked waves each, as the campaign does.
export const MONSTER_ARENAS=['nave','mere','hindwing','sovereign'];
const ARENA={
 nave:{theme:'skull',waves:[
  [{kind:'wick-bearer',x:13},{kind:'wick-bearer',x:15}],
  [{kind:'drip-censer',x:26},{kind:'wick-bearer',x:24}],
  [{kind:'drip-censer',x:37},{kind:'drip-censer',x:34},{kind:'wick-bearer',x:35}]
 ]},
 // Each wave adds pressure: the last one of every family mixes its kinds so a body attack overlaps a zone or a flock.
 mere:{theme:'canopy',waves:[
  [{kind:'mirror-skater',x:14}],
  [{kind:'scale-diver',x:25},{kind:'mirror-skater',x:26}],
  [{kind:'mirror-skater',x:37},{kind:'scale-diver',x:34},{kind:'mirror-skater',x:31}]
 ]},
 hindwing:{theme:'hollow',waves:[
  [{kind:'sporeling',x:13,y:3,count:5}],
  [{kind:'cordyceps-husk',x:25},{kind:'sporeling',x:23,y:3,count:3}],
  [{kind:'cordyceps-husk',x:36},{kind:'cordyceps-husk',x:31},{kind:'sporeling',x:34,y:3,count:4}]
 ]},
 sovereign:{theme:'hollow',room:true,waves:[[{kind:'husk-sovereign',x:13}]]}
};
// One-way ledges (tile 2) give the hunter air over the floor fights; walls close both ends.
export function monsterArena(id){
 const a=ARENA[id],w=a.room?18:44,rows=12,grid=Array.from({length:rows},(_,y)=>Array.from({length:w},(_,x)=>y===0||x<(a.room?2:1)||x>=w-(a.room?2:1)?1:0));
 const ledges=a.room?[[4,7],[11,14]]:[[9,12],[20,23],[31,34]];
 for(const [x0,x1] of ledges)for(let x=x0;x<x1;x++)grid[3][x]=2;
 const triggers=a.room?[6]:[6,18,30];
 return {
  id:'monsters-'+id,width:w,grid,start:{x:4,y:1},end:a.room?14:40,checkpoints:a.room?[4]:[4,17,29],theme:a.theme,monsters:true,
  waves:a.waves.map((enemies,i)=>({trigger:triggers[i],enemies:enemies.map(e=>({y:1,...e}))}))
 };
}
