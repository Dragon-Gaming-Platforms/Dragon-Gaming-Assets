// Rules-v5 possession form: THE CROWNED BLOOM, the mask of Cordycea, Who Wears the Dead (BOSS-DESIGN boss 3b,
// possessionForm). The Brute overgrown: fungal antlers from the crested mask, a spine-mane of stalks, amber gills under
// the arms, crimson cloth spotted with fungus. Its four verbs are the boss's own: the garden grows, and it grows for you.
// Frames at 60 Hz, distances in tiles (y up), damage at the hero scale (Brute punch 3; its punch combo is 9 per 51f,
// about 10.6 DPS; the needle reaches 1.95 tiles). Each move: input, kind, cooldown (frames), damage, box (feet-relative,
// x forward). This file never imports forms.js: forms.js and forms5.js read BLOOM from here.
export const BLOOM_ID='crowned-bloom';
export const BLOOM={
 // Collision 1.5 x 3.0 tiles (inside the 1.5 x 3.2 limit); drawn 2.3x the hero's height, the antlers overflow above.
 w:1.5,h:3,visual:2.3,speed:5.4,jump:2.5,jumps:2,glide:0,
 moves:{
  // (1) SOW, the boss's rule turned into your verb (attack): a fungal claw rake that flings spores. Each spore lands on
  // the floor under one of the nearest enemies ahead (up to `seeds`, `range` tiles), swells for `delay` frames (the
  // 30f of the design) and erupts as an amber stalk that strikes and launches; the stalk then stands as a BOUNCE CAP
  // (terrain you build: land on it to spring up, hold Down to drop through) for `cap.life` frames. One spore at a time
  // per enemy, creeping under the mat after it (`track` tiles a frame); at most `max` stalks and spores stand at once
  // (the oldest rots first). A tap rakes 5 per 18f (16.7 DPS); with its stalk every 36f on the same target, about
  // 25 DPS: 2.4x the Brute combo, at 4 tiles (2x the needle) and stalks out to 8.
  sow:{input:'attack',kind:'rake',cooldown:0,damage:5,box:{x0:-.4,x1:4,y0:0,y1:2.8},startup:4,active:5,total:18,knock:.6,stop:4,
   seeds:2,range:8,behind:1.5,delay:30,max:4,track:.12,
   stalk:{damage:5,w:1.3,h:2.8,erupt:10,launch:.26,stun:20,knock:.4},cap:{life:240,w:1.8,bounce:3.4,rot:40}},
  // (2) BLOOM PILLAR, its signature (sword): the ground swells under you and a great stalk erupts, carrying you up
  // `height` tiles and striking everything in its column and above your head (heavy upward damage, minor enemies
  // launched). Its cap stays as a ledge to stand on for `hold` frames: the only form that lifts itself to a crown.
  // It always grows from the level's floor (found within `scan` tiles), so it never stacks on its own ledges; over a
  // pit a short `air`-tile stalk only strikes.
  pillar:{input:'sword',kind:'lift',cooldown:50,damage:12,box:{x0:-1.3,x1:1.3,y0:0,y1:1.8},
   swell:8,grow:14,height:4,air:1.6,scan:10,hold:150,w:2.2,launch:.42,stun:30,knock:.5,stop:8},
  // (3) SPORE NOVA, crowd and zone control (blast or possess): spores gather in the gills, then an amber burst rings out
  // to `radius` tiles and strikes everything around you once; minor enemies are stunned and thrown clear.
  nova:{input:'blast',kind:'burst',cooldown:90,damage:7,box:{r:4.5},startup:8,active:10,total:28,stun:40,knock:1.2,stop:6},
  // (4) MYCELIAL CALL, defence and mobility (dodge): sink into the mat (untouchable for sink + tunnel, 24f per 75f),
  // run under it for `tunnel` frames, stopping at a ledge's brink (called in the air, it first dives to the mat, not
  // untouchable, and gives up after `dive` frames over a pit), and surface ahead; two amber risen husks claw up out of the
  // fallen (minor enemies you killed, else where you went in and came out) and fight beside you for `life` frames.
  // They never draw an enemy's aim: no decoy.
  call:{input:'dodge',kind:'burrow',cooldown:75,damage:4,box:{x0:-1.4,x1:1.4,y0:0,y1:2.4},
   sink:8,tunnel:16,speed:.32,rise:10,knock:.8,stop:4,dive:40,diveSpeed:-.5,
   husk:{count:2,life:240,reach:1.9,see:7,speed:.07,tell:10,every:30,damage:3,w:.9,h:2.2,corpse:10}}
 }
};
