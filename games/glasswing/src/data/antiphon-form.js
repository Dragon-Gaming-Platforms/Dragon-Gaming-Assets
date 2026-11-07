// Rules-v5 possession form (BOSS-DESIGN boss 2b, possessionForm): THE ANTIPHON. The Brute with six ivory arms, a
// scale-veil over its crested skull, drowned crimson robes and a halo turned from cyan to amber, its TRUE IMAGE drawn
// under its feet at all times. Frames at 60 Hz, distances in tiles, damage at the hero scale (Brute punch 3; its punch
// combo is 9 per 51f, about 10.6 DPS; the needle reaches 1.95 tiles). Same move descriptors as the Husk (forms5.js):
// input (the button that starts it), kind, cooldown (frames), damage, box (feet-relative, x forward).
// This file never imports forms.js or forms5.js: forms5.js lists it in FORMS5 (the v5 gate) and forms.js in FORMS.
export const ANTIPHON_FORM={
 // Collision 1.4 x 2.9 tiles (inside the 1.5 x 3.2 limit); drawn 2.1x the hero's height. Light on the water: two jumps.
 w:1.4,h:2.9,visual:2.1,speed:5.6,jump:2.3,jumps:2,glide:0,
 moves:{
  // (1) TRUE IMAGE (sword), the boss's rule turned into your verb: the mirror is the truth. Your reflection rises
  // through the floor ahead (0.6 to 6.2 tiles) and strikes up with its six arms. A reflection's hit PIERCES ARMOUR
  // (the form's one capability): on a boss's ivory, a struck boss takes damage as if its chip were 60% instead of 25%
  // (x2.4 before the boss's own chip, chip cap and the 12% burst budget). Minor enemies are launched and stunned.
  image:{input:'sword',kind:'mirror',cooldown:36,damage:8,box:{x0:.6,x1:6.2,y0:-.2,y1:3},
   startup:12,active:6,total:30,pierce:.6,armour:.25,launch:.24,stun:24,knock:.8,stop:6},
  // (2) SIX-ARM FLURRY (attack), the Six-Hand Antiphon now yours: six strikes in 40f, one per arm, 4.2 tiles ahead.
  // 6 x 3 per 46f = 23.5 DPS (2.2x the Brute combo), 4.2 tiles of reach (2.15x the needle). The sixth arm shoves.
  // While an arm strikes, the hands bat enemy shots out of the air inside the box (never cyan ones).
  flurry:{input:'attack',kind:'combo',cooldown:0,damage:3,box:{x0:-.4,x1:4.2,y0:0,y1:2.8},
   hits:[4,10,16,22,28,34],active:3,total:46,knock:.25,lastKnock:1,stop:2},
  // (3) HYMN WAVE (blast or possess), crowd and zone control: two ring waves run along the floor both ways. They stun
  // minor enemies for 50f and break guards (left vulnerable, as by a parry: armour cracks, the next hit lands x2); on a boss
  // they only deal damage.
  hymn:{input:'blast',kind:'wave',cooldown:70,damage:4,box:{r:.32,h:1.5},startup:8,total:22,speed:.28,range:10,stun:50},
  // (4) UNDERTOW GRASP (dodge), defence: you sink into your own reflection (untouchable for 14f) while an arm erupts
  // under the nearest enemy ahead, up to 8 tiles away, and pins it for 30f (minor enemies only; a boss takes the hit,
  // which is a reflection's hit and so pierces). The arm reaches up to its mark's head (a flier is caught in the air,
  // up to 6 tiles up). With no enemy in range it rises 3 tiles ahead. It cancels the Flurry.
  grasp:{input:'dodge',kind:'pin',cooldown:90,damage:5,box:{x0:-.7,x1:.7,y0:-.2,y1:2.8},
   range:8,miss:3,up:6,dive:14,rise:10,total:32,pin:30,knock:0,stop:4}
 }
};
