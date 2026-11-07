// Rules-v5 possession form: THE RENDERER, Tallowgrave's mask (BOSS-DESIGN boss 2a, possessionForm). The Brute in a mantle
// of rendered tallow, crowned with an AMBER wick-flame, a renderer's apron-robe of crimson cloth and an amber-burning
// wick-spear. Four of the boss's own verbs: the shadow rule (Shadow Cast), its signature (Tear-Through), its zone move
// (Wax Pour) and its defence (Snuff). Frames at 60 Hz, distances in tiles, damage at the hero scale (Brute punch 3; its
// punch combo is 9 per 51f, about 10.6 DPS; the needle reaches 1.95 tiles).
// Each move: input (the button that starts it), kind, cooldown (frames), damage, box (feet-relative, x forward).
// This file never imports forms.js or forms5.js: both read RENDERER from here.
export const RENDERER={
 // Collision 1.5 x 3.1 tiles (inside the 1.5 x 3.2 limit); drawn 2.2x the hero's height. Tall and long-legged: one air jump.
 w:1.5,h:3.1,visual:2.2,speed:5.6,jump:2.5,jumps:2,glide:0,
 moves:{
  // SHADOW CAST (attack): the boss's rule turned into the hunter's verb. Every claw swing projects an amber-edged shadow
  // from the wick-flame on the crown, along the floor band, that strikes whatever it covers from .3 to 6 tiles ahead (a
  // 1D x-interval, as the boss's own shadows; a wall stops it). A three-swing chain (left claw, right claw, the Palm):
  // 6+6+10 per 17+17+24f = 22.8 DPS (2.1x the Brute combo), 6 tiles of reach (3x the needle). In Snuff's dark: x1.5.
  cast:{input:'attack',kind:'shadow',cooldown:0,damage:6,box:{x0:.3,x1:6,y0:0,y1:3},startup:4,active:3,window:14,
   chain:[{damage:6,total:17,knock:.5,stop:4},{damage:6,total:17,knock:.5,stop:4},{damage:10,total:24,knock:1.1,stop:6}]},
  // TEAR-THROUGH (sword): the boss's signature. The wick-spear lunges 5 tiles ahead while the body drives 1.8 tiles in.
  // Its first 10f are PARRY ARMOUR: an ivory or plain strike (never a cyan one) that lands on them is parried, as the
  // hunter's own guard would (a boss is answered with its parry opening; a shot flies back amber).
  tear:{input:'sword',kind:'lunge',cooldown:45,damage:12,box:{x0:-.2,x1:5,y0:.3,y1:2.5},startup:8,active:6,total:30,
   armour:10,dash:.3,knock:1.2,stop:7,stun:30},
  // WAX POUR (blast or possess): molten tallow gushes 3.4 tiles ahead into a 3.6-tile pool on the floor below. For 90f it
  // roots the small monsters that stand in it (e.waxT, stun) and burns bosses once; then it cools into a wax bench 1.6
  // tiles high that the Renderer can stand on for 7 s (the form's unique capability: terrain making).
  wax:{input:'blast',kind:'pool',cooldown:120,damage:4,box:{x0:1.6,x1:5.2,y0:-6,y1:.8},startup:10,total:24,reach:3.4,drop:6,
   pool:{w:3.6,molten:90,life:420,y:1.6,band:.8},root:60},
  // SNUFF (dodge): the Renderer smothers the light. It sinks into its own shadow (12 invulnerable frames, as a dodge)
  // and 2 s of darkness fall 9 tiles around it: small monsters lose their target (their strikes stall) and every Shadow
  // Cast deals x1.5. Bosses keep their sight (BOSS-DESIGN: no aggro tricks on bosses).
  snuff:{input:'dodge',kind:'dark',cooldown:300,damage:0,box:{x0:-9,x1:9,y0:-4,y1:6},startup:6,total:18,inv:12,dark:120,
   blind:2,bonus:1.5,radius:9}
 }
};
// The Renderer's Echo, the Ember Wick, is the Hub's (src/game/hub.js world.echoes 'wick'); the form carries no passive.
export const RENDERER_ECHO={id:'ember-wick',ready:false};
