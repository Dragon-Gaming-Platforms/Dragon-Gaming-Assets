// Rules-v5 possession form of boss 4 (BOSS-DESIGN 'The Exuvial', possessionForm). THE EXUVIAL: a towering crimson
// chrysalis-hunter with four thread hook-arms, a stitched cocoon on its back and the crested skull mask cracked open like
// a cocoon; every Moult the hunter wears is shown at 2x. Frames at 60 Hz, distances in tiles, damage at the hero scale
// (Brute punch 3; its punch combo is 9 per 51f, about 10.6 DPS; the needle reaches 1.95 tiles).
// Each move: input (the button that starts it), kind, cooldown (frames), damage, box (feet-relative, x forward).
// The four roles (BOSS-DESIGN 'How moves are derived'): (1) the rule as your verb, GRAFT RAKE; (2) the signature attack,
// SHEDDING HOOK; (3) crowd control, BROOD; (4) defence and mobility, COCOON BURST. Unique capability: armour piercing
// (a hooked boss loses a plate: that spot takes full damage for 40f, inside the burst's 12% budget).
// Like forms5.js, this file never imports forms.js (forms.js reads EXUVIAL_FORM through forms5.js).
export const EXUVIAL_ID='exuvial-form';
export const EXUVIAL_FORM={
 // Collision 1.4 x 3.0 tiles (inside the 1.5 x 3.2 limit); drawn 2.4x the hero's height (hook-arms and cocoon overflow).
 w:1.4,h:3,visual:2.4,speed:5.8,jump:2.5,jumps:2,glide:0,
 moves:{
  // GRAFT RAKE (attack, chained): three hook-arm claws, the last one bigger. 6+6+9 per 54f = 23.3 DPS (2.2x the Brute
  // combo) before Moults, 4.2 tiles of reach (2.15x the needle). +10% damage per Moult worn, up to +50% (a whole build).
  // Each claw staggers a minor enemy (12f, the third launches it for 24f) and bats enemy shots (not cyan) out of the air.
  // A pressed attack during a claw queues the next one (buffer from the claw's first active frame to its end).
  rake:{input:'attack',kind:'combo',cooldown:0,damage:6,box:{x0:-.6,x1:4.2,y0:0,y1:2.8},
   hits:[{damage:6,startup:4,active:4,total:15,step:.06,stun:12},{damage:6,startup:4,active:4,total:15,step:.06,stun:12},
    {damage:9,startup:7,active:5,total:24,step:.12,launch:.2,stun:24}],
   perMoult:.1,moultMax:5,knock:.8,stop:5},
  // SHEDDING HOOK (sword): an amber hook flies 7 tiles at chest height. A minor enemy is reeled in, stunned, and its attack
  // is STOLEN for the rest of the burst (the Rake's third claw fires it). A boss loses an armour plate: for 40f the form's
  // hits on it deal full damage (at most 4% of its max HP per plate, inside the burst's 12% budget).
  hook:{input:'sword',kind:'hook',cooldown:60,damage:8,box:{r:.45,y:1.6},startup:10,speed:.75,range:7,back:1,recover:8,
   pull:1.6,stun:36,knock:.6,stop:6,plate:40,plateCap:.04,full:1},
  // BROOD (blast or possess): three skin-husks hatch from the cocoon and crawl to the nearest enemies (one each). They copy
  // every Rake claw at 50% (30% against bosses), never draw a boss's aggro (they are not targets) and crumble after 8 s.
  brood:{input:'blast',kind:'summon',cooldown:420,damage:.5,box:{x0:-.3,x1:1.8,y0:0,y1:1.4},count:3,life:480,startup:14,
   total:22,speed:.09,aggro:9,w:.7,h:1,boss:.3,minor:.5,spread:1},
  // COCOON BURST (dodge): the shed skin wraps the hunter for 30f (untouchable, steerable), then bursts in an amber blast
  // both ways that also shreds enemy shots (not cyan) inside it. 150f cooldown from the blast.
  cocoon:{input:'dodge',kind:'guard',cooldown:150,damage:12,box:{x0:-3.2,x1:3.2,y0:-.3,y1:3},wrap:30,total:46,drift:.1,
   knock:1.4,launch:.25,stun:30,stop:6}
 },
 // What a hooked minor enemy gives the Rake's third claw (by kind): a floor wave, a piercing dart, or a fan of sparks.
 stolen:{wave:{damage:5,speed:.3,range:8,h:.9,r:.35},dart:{damage:5,speed:.45,range:10,r:.25,y:1.4,pierce:2},
  spark:{damage:3,speed:.36,range:9,r:.22,lanes:[.7,1.5,2.3]}}
};
