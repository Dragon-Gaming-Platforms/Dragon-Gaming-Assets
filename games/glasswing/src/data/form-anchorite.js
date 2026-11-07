// Rules-v5 possession form: THE ANCHORITE (BOSS-DESIGN boss 3a, possessionForm). The Brute fused into a walking
// hourglass carapace, two huge foreleg-spears, an AMBER sand bulb on its back and crimson cloth worn as a hermit's hood.
// Frames at 60 Hz, distances in tiles, damage at the hero scale (Brute punch 3; its punch combo is 9 per 51f, about
// 10.6 DPS; the needle reaches 1.95 tiles). Each move: input (the button that starts it), kind, role (BOSS-DESIGN
// 'HOW MOVES ARE DERIVED': rule, signature, crowd, defence), cooldown (frames), damage, box (feet-relative, x forward).
// No time stop, no cyan block, no decoy: the cyan rule never stops applying while the room is yours to turn.
export const ANCHORITE_FORM={
 // Collision 1.5 x 3.0 tiles (inside the 1.5 x 3.2 limit); drawn 2.2x the hero's height. Heavy: slow, one air jump.
 // The carapace takes half damage (two 1-mask hits per plate, 3 plates: six hits), never flinches.
 w:1.5,h:3,visual:2.2,speed:5,jump:2.3,jumps:2,glide:0,
 moves:{
  // SAND LASH (attack; signature): the two foreleg-spears stab out 5 tiles one after the other (the boss's lash).
  // 4 + 4 per 22f = 21.8 DPS (2.06x the Brute combo), 5 tiles of reach (2.6x the needle). The body lunges up to
  // `step` a frame during the startup until a foe is already on the spears.
  lash:{input:'attack',kind:'lunge',role:'signature',cooldown:0,damage:4,box:{x0:-.9,x1:5,y0:.2,y1:3.2},
   startup:5,stabs:[5,10],active:3,total:22,step:.09,knock:.5,stop:3},
  // OVERTURN (sword; the boss's rule turned into your verb): the forelegs lift the floor and slam it over. Every minor
  // enemy within 8 tiles (flyers too) is turned upside down: it falls 'up' (at most `rise` tiles, never through a
  // ceiling), hangs, and crashes back where it stood after `flight` frames for the impact. The unique capability: a
  // room-scale overturn. On a boss it is a 20f footing stagger, once per burst.
  overturn:{input:'sword',kind:'slam',role:'rule',cooldown:90,damage:8,box:{x0:-3,x1:3,y0:-.3,y1:2.8},
   startup:14,active:4,total:34,radius:8,height:4,rise:3.2,flight:44,stun:70,impact:6,stagger:20,knock:.8,stop:6},
  // SAND-GRAVE (blast or possess; crowd/zone): sand pours from the bulb onto the floor ahead and sets into a grave
  // mound `x0..x1` tiles in front. When it sets it buries every minor enemy on it (a 60f stun, e.buryT); a bosskit
  // boss is slowed 30% for 2 s (e.slowT, e.slow); the v4 bosses only take the damage. The mound stays `life` frames,
  // and a minor enemy that walks onto it later is buried too (once). The mound follows the floor ahead: a pit or a
  // wall cuts it short, and with less than `min` tiles of floor ahead no mound forms.
  grave:{input:'blast',kind:'zone',role:'crowd',cooldown:110,damage:5,box:{x0:1,x1:5.5,y0:0,y1:1.6},
   startup:6,total:24,set:22,life:180,bury:60,slow:.3,slowFrames:120,min:1},
  // SAND POUR (dodge; defence and mobility): a sweeping amber beam out of the bulb's neck for 90f, from low in front
  // up past level. While it pours the carapace is braced: in the air you hang on the pour (gravity off, a slow
  // drift), and the stream swats enemy shots out of the air (not cyan ones: only the Chrysalis's Shell Shut stops
  // cyan). Each foe in the beam takes `damage` every `every` frames.
  pour:{input:'dodge',kind:'beam',role:'defence',cooldown:240,damage:2,box:{r:.36,y:3.1,back:.95,len:9},
   startup:8,frames:90,total:102,from:-50,to:28,every:8,drift:.045,knock:.2,stop:1}
 }
};
// The Anchorite form's Echo is TURNSTONE (the hub's Proboscis Well gate, src/data/hub.js).
export const ANCHORITE_ECHO={id:'turnstone',ready:false};
