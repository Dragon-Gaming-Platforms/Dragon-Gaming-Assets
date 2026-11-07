// The Hub with Spokes (BOSS-DESIGN 'Hub map'): the Head intro, the Gullet's boss, the Thorax Nave and its spokes.
// Behind config.campaign (rules 4); classic and Hall configs never reach it. Frames at 60 Hz, distances in tiles.
export const HUB={
 // Doors: an edge exit fires within edge tiles of the room's side while pushing out; an arch on a Down press.
 edge:.95,edgeRise:3,arch:.9,archRise:.7,
 // A fall into a chasm costs a mask and returns to the last solid footing; a segment is cut at a door past this.
 // Past cap without a door (a long stay in one room) the segment ends where the hunter stands, at the nearest door's
 // spot, so a saved replay never reaches validateReplay's 100-minute limit.
 fall:-1.5,fallDamage:1,segment:60*60*30,cap:60*60*60,fade:14,message:150,
 // Amber Thread (the Chrysalis's Echo): hold guard in the air near an amber knot. The same integer pendulum as the
 // boss: millidegrees, milli-tiles, gravity in milli-tiles per frame squared. Release at the bottom to slingshot.
 thread:{reach:6500,min:1800,gravity:55,hand:.8,pump:30,pumpZone:30000,maxAngle:110000,maxSpeed:9000,carry:24,hop:.18,cooldown:8}
};
// Echoes (permanent traversal keys) and the boss that grants each.
export const ECHO_IDS=['thread','wick','undertow','turnstone','bloom','shed'];
// The small table the boss packages plug into: boss id -> spoke, door room, Echo, mask (a FORM_IDS id once its form exists),
// and the fight's door placement (the Hall Rematch arena, hallLevels + this x). A boss runs as soon as validConfig
// accepts config.boss:'<id>'; until then its door reads 'coming'.
export const HUB_BOSSES={
 // The Chrysalis's mask in the Hub is the Chrysalis Husk form (rules v5, src/data/forms5.js); classic runs keep the
 // M4 old-glasswing mask. Every spoke boss's mask is its rules-v5 possession form (a FORM_IDS id): its fall lights its
 // Mask Wall niche (render2d/hub.js reads world.cleared) and hubNext hands the form over (config.masks of the next
 // segment, worn from the Mask Ember). A mask id outside FORM_IDS would light the niche only (hubNext reports mask:null).
 // `config`: the config.boss the fight runs (the finished Chrysalis, 'chrysalis5'); the door, saves and records keep the
 // hub id. Older hub saves that fight with config.boss 'chrysalis' stay valid and replay the M5 Chrysalis as recorded.
 chrysalis:{spoke:'head',room:'gullet-gate',echo:'thread',mask:'chrysalis-husk',door:44,config:'chrysalis5'},
 tallowgrave:{spoke:'render',room:'render-gate',echo:'wick',mask:'tallowgrave-form',door:44},
 antiphon:{spoke:'mere',room:'mere-gate',echo:'undertow',mask:'antiphon-form',door:44},
 anchorite:{spoke:'drum',room:'drum-gate',echo:'turnstone',mask:'anchorite-form',door:44},
 cordycea:{spoke:'garden',room:'garden-gate',echo:'bloom',mask:'crowned-bloom',door:44},
 exuvial:{spoke:'well',room:'well-gate',echo:'shed',mask:'exuvial-form',door:44}
};
// campaign.monsters: each spoke's enemy family (src/data/monsters.js SPOKES) in the hub's foe roles. A room's wild
// brawler, skimmer and spark become these kinds; an elite becomes the family's mid-boss; a flock spawns `flock` motes.
// The Proboscis Well has no family yet and keeps the wild kinds.
export const SPOKE_BEASTS={
 render:{brawler:'wick-bearer',skimmer:'drip-censer',spark:'drip-censer'},
 mere:{brawler:'scale-diver',skimmer:'mirror-skater',spark:'mirror-skater'},
 drum:{brawler:'cordyceps-husk',skimmer:'sporeling',spark:'sporeling',elite:'husk-sovereign',flock:3},
 garden:{brawler:'cordyceps-husk',skimmer:'sporeling',spark:'sporeling',elite:'husk-sovereign',flock:3}
};
// The Mask Wall's six niches, left to right (the Heir has none: its door opens when all six are lit).
// The Head: the campaign's first rooms, where the controls are taught (the onboarding coach, then the room hints).
export const HEAD_ROOMS=['head-1','head-2','head-3','gullet-gate'];
// The config.boss a hub boss id fights as (its own id unless the table names another).
export const hubBossConfig=id=>HUB_BOSSES[id]?.config||id;
export const NICHES=['tallowgrave','anchorite','chrysalis','exuvial','cordycea','antiphon'];
export const SPOKES=['head','nave','render','mere','drum','garden','well'];
