// The Hub with Spokes as rooms in today's level schema (validateLevel), built here in code so no level JSON or
// LEVEL_IDS entry changes. Coordinates are y-up tiles: grid[0] is the floor slab, a standing hunter has y = row + 1.
// level.hub holds the room's doors, bench, Amber Thread knots, wild spawns and set dressing (read by the sim and the
// renderer); level.theme picks the palette (src/render2d/hub-themes.js); level.map is its cell on the map screen.
import {ECHO_IDS,HUB_BOSSES,hubBossConfig} from './hub.js';

function room(id,spoke,theme,width,height,map){
 const grid=Array.from({length:height},()=>Array(width).fill(0));
 const r={id,spoke,theme,width,height,map,grid,doors:[],knots:[],foes:[],decor:[],bench:null,start:null,
  fill(x0,x1,y0,y1,t){for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)if(grid[y]&&x>=0&&x<width)grid[y][x]=t;return r;},
  solid(x0,x1,y0,y1=y0){return r.fill(x0,x1,y0,y1,1);},
  plat(x0,x1,y){return r.fill(x0,x1,y,y,2);},
  clear(x0,x1,y0,y1=y0){return r.fill(x0,x1,y0,y1,0);},
  // kind: edge (walk out of the side), arch (Down), lift (Down; the vein-lift), boss (Down; starts the fight),
  // hall (Down; the Hall of Masks), sealed (never opens yet). gate: 'echo:<id>', 'boss:<id>' (cleared), 'masks:<n>'.
  door(id,x,y,def={}){r.doors.push({id,x,y,kind:'edge',...def});return r;},
  seat(x,y=1){r.bench={x,y};return r;},
  knot(x,y){r.knots.push({x,y});return r;},
  foe(kind,x,y=1,elite=false){r.foes.push({kind,x,y,elite});return r;},
  prop(kind,x,y,size=1){r.decor.push({kind,x,y,size});return r;},
  // Flip the room left-right (spokes west of the Nave are built eastward, then mirrored).
  mirror(){
   for(const row of grid)row.reverse();
   for(const list of [r.doors,r.knots,r.foes,r.decor])for(const o of list)o.x=width-o.x;
   if(r.bench)r.bench.x=width-r.bench.x;if(r.start)r.start.x=width-r.start.x;
   return r;
  }
 };
 return r;
}
// Edge doors sit on the side column; their side is read from x after any mirror.
function level(r){
 const doors=r.doors.map(d=>({...d,x:d.kind==='edge'?(d.x<r.width/2?.5:r.width-.5):d.x,side:d.kind==='edge'?(d.x<r.width/2?-1:1):0}));
 const at=r.start||doors[0];
 // boss:true only keeps the classic exit arch away (props.js); hub rooms never run the classic flow that reads it.
 return {id:'hub-'+r.id,width:r.width,grid:r.grid,start:{x:Math.max(1,Math.min(r.width-1,at.x)),y:at.y},end:r.width-1,
  checkpoints:[1],boss:true,pieces:[],secrets:[],theme:r.theme,spoke:r.spoke,map:r.map,
  hub:{room:r.id,doors,bench:r.bench,knots:r.knots,foes:r.foes,decor:r.decor}};
}
// A spoke's last room: bench, the boss door, and the one-way vein-lift back to the Nave once its boss has fallen.
function gate(id,spoke,theme,map,boss,{gate:bossGate,width=34}={}){
 const r=room(id,spoke,theme,width,10,map).solid(0,width-1,0).solid(0,width-1,9);
 r.solid(width-3,width-1,1,8).solid(width-9,width-9,6,8).solid(9,9,6,8);
 r.door('in',0,1).seat(6).door('lift',13,1,{kind:'lift',to:'nave:lift',gate:'boss:'+boss}).door('boss',width-6,1,{kind:'boss',boss,...(bossGate?{gate:bossGate}:{})});
 return r.prop('arch',width-6,1,1.2).prop('lift',13,1);
}

const rooms=[];
const add=r=>{rooms.push(r);return r;};

// THE HEAD: Mandible Steps, a short hostile intro with the first moults, then the Gullet's gate (boss 1).
add(room('head-1','head','head',48,12,[0,-3,3,1]).solid(0,47,0).solid(0,0,1,11).solid(0,47,11)
 .solid(12,16,1).solid(17,21,1,2).solid(22,26,1,3).plat(27,31,5).solid(32,35,1,2).solid(36,38,1)
 .foe('brawler',19.5,3).foe('brawler',40)
 .door('e',47,1,{to:'head-2:w'}).prop('tooth',14,2,1.2).prop('tooth',33,3,1).prop('rib',8,1,1.4)).start={x:3,y:1};
add(room('head-2','head','head',56,12,[3,-3,3,1]).solid(0,55,0).solid(0,55,11)
 .plat(10,15,3).plat(18,23,5).plat(26,31,3).solid(36,38,1,2).plat(42,47,4)
 .foe('skimmer',20,5).foe('spark',30).foe('brawler',45)
 .door('w',0,1,{to:'head-1:e'}).door('e',55,1,{to:'head-3:w'}).prop('tooth',37,3,1.1).prop('rib',24,1,1.6).prop('rib',50,1,1.2));
add(room('head-3','head','head',34,18,[6,-4,2,2]).solid(0,33,0).solid(0,33,17)
 .plat(5,10,3).plat(11,16,6).plat(17,22,9).plat(22,27,12).solid(27,33,12).solid(33,33,1,11)
 .foe('brawler',20,1,true).foe('skimmer',14,8)
 .door('w',0,1,{to:'head-2:e'}).door('e',33,13,{to:'gullet-gate:in'}).prop('rib',6,1,1.5).prop('tooth',30,13,1));
add(gate('gullet-gate','head','head',[8,-3,2,1],'chrysalis').prop('cord',26,9,1));
for(const r of rooms)if(r.id==='gullet-gate')r.doors.find(d=>d.id==='in').to='head-3:e';

// THE THORAX NAVE: rib vaults, the Mask Wall (six niches) over the Hall of Masks, the sealed Heart Door, a bench,
// the four wing-root doors (upper two across the Sternum Chasm: Amber Thread; lower two: Ember Wick and Undertow
// locks), the vein-lift up to the Gullet and the Proboscis Well's hatch (Turnstone and Spore Bloom).
{
 const n=add(room('nave','nave','nave',112,22,[0,0,10,3]).solid(0,111,0).solid(0,111,21)
  .solid(0,10,12).solid(101,111,12).plat(33,37,3).plat(37,41,6).plat(40,71,9).plat(70,74,6).plat(74,78,3));
 for(const [x,y] of [[35,17],[28,17.5],[21,17.5],[15,17]])n.knot(x,y).knot(112-x,y);
 n.door('w-low',0,1,{to:'drum-1:in',gate:'echo:wick'}).door('e-low',111,1,{to:'garden-1:in',gate:'echo:undertow'})
  .door('w-high',0,13,{to:'render-1:in',gate:'echo:thread'}).door('e-high',111,13,{to:'mere-1:in',gate:'echo:thread'})
  .door('lift',88,1,{kind:'lift',to:'gullet-gate:lift'}).door('hall',56,10,{kind:'hall'})
  .door('heart',56,1,{kind:'sealed',gate:'masks:6'}).door('well',66,1,{kind:'arch',to:'well-1:in',gate:'echo:turnstone+echo:bloom'})
  .seat(46);
 n.prop('maskwall',56.8,11,1).prop('heart',56,1,1).prop('hatch',66,1,1).prop('lift',88,1,1);
 for(const x of [6,22,30,82,90,106])n.prop('rib',x,1,2.4);
 n.prop('arch',3,13,1).prop('arch',109,13,1);
}

// FOREWING LEFT, the Rendering Nave (Tallowgrave): wax columns and candle-pews; built eastward, mirrored west.
add(room('render-1','render','render',50,12,[-3,0,3,1]).solid(0,49,0).solid(0,49,11)
 .solid(12,13,1,3).solid(24,25,1,2).solid(36,37,1,3).plat(15,22,4).plat(27,34,5)
 .foe('brawler',18).foe('spark',30).door('in',0,1,{to:'nave:w-high'}).door('out',49,1,{to:'render-2:in'})
 .prop('candle',8,1,1.2).prop('candle',20,1,.9).prop('candle',42,1,1.4).mirror());
add(room('render-2','render','render',46,14,[-6,0,3,1]).solid(0,45,0).solid(0,45,13)
 .solid(8,11,1).solid(12,15,1,2).solid(16,19,1,3).plat(20,25,6).solid(26,29,1,3).solid(30,33,1,2).solid(34,37,1)
 .foe('spark',14,3).foe('skimmer',23,7).foe('spark',32,3).door('in',0,1,{to:'render-1:out'}).door('out',45,1,{to:'render-3:in'})
 .prop('candle',4,1,1).prop('candle',22,1,1.6).prop('candle',41,1,1.1).mirror());
add(room('render-3','render','render',40,12,[-9,-1,2,2]).solid(0,39,0).solid(0,39,11)
 .plat(6,11,3).plat(14,19,5).plat(22,27,3).solid(30,31,1,2)
 .foe('brawler',20,1,true).foe('spark',34).door('in',0,1,{to:'render-2:out'}).door('out',39,1,{to:'render-gate:in'})
 .prop('candle',10,1,1.3).prop('candle',26,1,1).mirror());
add(gate('render-gate','render','render',[-11,-1,2,1],'tallowgrave').prop('candle',22,1,1.5).mirror()).doors.find(d=>d.id==='in').to='render-3:out';

// FOREWING RIGHT, the Scale Mere (the Drowned Antiphon): a causeway of scale-ice at the waterline.
add(room('mere-1','mere','mere',52,12,[10,0,3,1]).solid(0,51,0).solid(0,51,11)
 .plat(9,14,3).plat(17,22,3).plat(25,30,5).plat(33,38,3).solid(42,43,1,2)
 .foe('skimmer',18,4).foe('skimmer',34,4).foe('brawler',46).door('in',0,1,{to:'nave:e-high'}).door('out',51,1,{to:'mere-2:in'})
 .prop('scale',12,1,1).prop('scale',28,1,1.4).prop('scale',47,1,.9));
add(room('mere-2','mere','mere',44,14,[13,0,3,1]).solid(0,43,0).solid(0,43,13)
 .plat(6,10,3).plat(12,16,6).plat(18,24,9).plat(26,30,6).plat(32,36,3)
 .foe('skimmer',21,10).foe('spark',10).foe('spark',34).door('in',0,1,{to:'mere-1:out'}).door('out',43,1,{to:'mere-3:in'})
 .prop('scale',21,1,1.8).prop('scale',40,1,1));
add(room('mere-3','mere','mere',48,12,[16,-1,2,2]).solid(0,47,0).solid(0,47,11)
 .solid(10,12,1,2).plat(15,20,4).solid(24,26,1,3).plat(29,34,4).solid(38,40,1,2)
 .foe('skimmer',18,5).foe('brawler',32,1,true).door('in',0,1,{to:'mere-2:out'}).door('out',47,1,{to:'mere-gate:in'})
 .prop('scale',6,1,1.2).prop('scale',44,1,1.3));
add(gate('mere-gate','mere','mere',[18,-1,2,1],'antiphon').prop('scale',22,1,1.6)).doors.find(d=>d.id==='in').to='mere-3:out';

// HINDWING LEFT, the Reliquary Drum (the Hourglass Anchorite): in through the Lightless Spiracle (Ember Wick); the
// boss door waits behind a mirror-pool lock (Undertow). Bronze, bone and amber sand; mirrored west.
add(room('drum-1','drum','drum',44,12,[-3,2,3,1]).solid(0,43,0).solid(0,43,11)
 .solid(10,13,1).solid(14,17,1,2).plat(19,24,4).solid(26,29,1,2).solid(30,33,1)
 .foe('brawler',16,3).foe('brawler',31,2).door('in',0,1,{to:'nave:w-low'}).door('out',43,1,{to:'drum-2:in'})
 .prop('reliquary',6,1,1).prop('reliquary',38,1,1.2).mirror());
add(room('drum-2','drum','drum',48,12,[-6,2,3,1]).solid(0,47,0).solid(0,47,11)
 .plat(8,13,3).plat(16,21,5).plat(24,29,3).plat(32,37,5).solid(40,41,1,2)
 .foe('spark',18,6).foe('brawler',26).foe('skimmer',34,6).door('in',0,1,{to:'drum-1:out'}).door('out',47,1,{to:'drum-3:in'})
 .prop('reliquary',12,1,1.4).prop('reliquary',44,1,1).mirror());
add(room('drum-3','drum','drum',40,12,[-9,2,2,1]).solid(0,39,0).solid(0,39,11)
 .solid(8,10,1,2).plat(13,18,4).solid(21,23,1,3).plat(26,31,4)
 .foe('brawler',16,1,true).foe('spark',30).door('in',0,1,{to:'drum-2:out'}).door('out',39,1,{to:'drum-gate:in'})
 .prop('reliquary',34,1,1.3).mirror());
add(gate('drum-gate','drum','drum',[-11,2,2,1],'anchorite',{gate:'echo:undertow'}).prop('pool',27,1,1).mirror()).doors.find(d=>d.id==='in').to='drum-3:out';

// HINDWING RIGHT, the Mycelial Garden (Cordycea): in through the Flooded Vein (Undertow); its arena sits behind a
// fungal veil (Ember Wick). Cold cyan caps over dead moths.
add(room('garden-1','garden','garden',46,12,[10,2,3,1]).solid(0,45,0).solid(0,45,11)
 .plat(7,12,3).plat(15,20,5).plat(23,28,3).solid(32,34,1,2).plat(37,41,4)
 .foe('spark',18,6).foe('skimmer',26,4).foe('spark',40,5).door('in',0,1,{to:'nave:e-low'}).door('out',45,1,{to:'garden-2:in'})
 .prop('cap',10,1,1.2).prop('cap',30,1,1.6).prop('cap',43,1,.9));
add(room('garden-2','garden','garden',50,14,[13,2,3,1]).solid(0,49,0).solid(0,49,13)
 .solid(8,10,1,2).plat(12,17,5).plat(19,24,8).plat(26,31,5).solid(34,36,1,2).plat(39,44,4)
 .foe('skimmer',21,9).foe('brawler',28,1,true).foe('spark',42,5).door('in',0,1,{to:'garden-1:out'}).door('out',49,1,{to:'garden-gate:in'})
 .prop('cap',4,1,1.4).prop('cap',22,1,2).prop('cap',46,1,1.1));
add(gate('garden-gate','garden','garden',[16,2,2,1],'cordycea',{gate:'echo:wick'}).prop('veil',28,1,1).prop('cap',20,1,1.4)).doors.find(d=>d.id==='in').to='garden-2:out';

// THE MOULTING WELL (the Exuvial), under the Nave: down through the Proboscis Well's hatch.
add(room('well-1','well','well',30,20,[5,3,2,2]).solid(0,29,0).solid(0,29,19).solid(0,0,1,18)
 .solid(0,7,15).plat(9,14,12).plat(4,9,9).plat(11,16,6).plat(18,23,3)
 .foe('skimmer',14,8).foe('brawler',24).door('in',3,16,{kind:'arch',to:'nave:well'}).door('out',29,1,{to:'well-2:in'})
 .prop('cocoon',20,18,1.4).prop('cocoon',8,18,1).prop('hatch',3,16,1));
add(room('well-2','well','well',44,12,[7,4,3,1]).solid(0,43,0).solid(0,43,11)
 .plat(8,13,3).solid(16,18,1,2).plat(21,26,4).solid(30,32,1,2).plat(35,39,3)
 .foe('brawler',14,1,true).foe('skimmer',24,5).foe('spark',38).door('in',0,1,{to:'well-1:out'}).door('out',43,1,{to:'well-gate:in'})
 .prop('cocoon',10,10,1.2).prop('cocoon',28,10,1.6).prop('cocoon',40,10,1));
add(gate('well-gate','well','well',[10,4,2,1],'exuvial').prop('cocoon',22,8,1.8)).doors.find(d=>d.id==='in').to='well-2:out';

export const HUB_ROOMS=rooms.map(level);
export const ROOM_IDS=HUB_ROOMS.map(l=>l.hub.room);
export const roomLevel=id=>HUB_ROOMS.find(l=>l.hub.room===id)||null;
export const doorOf=(id,door)=>roomLevel(id)?.hub.doors.find(d=>d.id===door)||null;
// Where a campaign begins (THE HEAD) and where a vein-lift arrives (the Nave's lift).
export const HUB_START={room:'head-1',at:'start'},HUB_LIFT={room:'nave',at:'lift'};

// config.campaign: the snapshot a segment starts from (src/game/hub.js). Validated before any replay or save restores it.
const ids=(list,known,max)=>Array.isArray(list)&&list.length<=max&&list.every(id=>known.includes(id))&&new Set(list).size===list.length;
const spot=(r,at)=>ROOM_IDS.includes(r)&&(at==='start'||at==='bench'&&!!roomLevel(r).hub.bench||!!doorOf(r,at));
export function validCampaign(c,config){
 if(!c||typeof c!=='object'||Array.isArray(c)||c.v!==1||!(config.rulesVersion>=4)||config.mode!=='solo'||
  config.hall!==undefined||config.customLevel!==undefined||!spot(c.room,c.at)||!c.bench||!spot(c.bench.room,c.bench.at)||
  !ids(c.echoes,ECHO_IDS,ECHO_IDS.length)||!ids(c.cleared,Object.keys(HUB_BOSSES),8)||!ids(c.visited,ROOM_IDS,ROOM_IDS.length)||
  !Number.isInteger(c.level)||c.level<1||c.level>99||!Number.isInteger(c.xp)||c.xp<0||c.xp>999||
  !Number.isInteger(c.drafts)||c.drafts<0||c.drafts>20||!Number.isInteger(c.seg)||c.seg<0||c.seg>1e6||
  typeof c.base!=='string'||c.base.length>80||c.deaths!==undefined&&(!Number.isInteger(c.deaths)||c.deaths<0)||
  c.monsters!==undefined&&c.monsters!==true||c.tries!==undefined&&(c.fight===undefined||!Number.isInteger(c.tries)||c.tries<1||c.tries>1e6)||
  c.fight!==undefined&&(!Object.hasOwn(HUB_BOSSES,c.fight)||config.boss!==c.fight&&config.boss!==hubBossConfig(c.fight)))throw new Error('Invalid campaign');
 return c;
}
