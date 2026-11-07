// The Rendering Nave's wax family (BOSS-DESIGN hub map: one enemy family per spoke). Frames at 60 Hz, distances in tiles,
// damage in masks. Every move that hurts names its tell; parry:true = ivory ring (parryable), false = cyan (dodge or leave).
// box: the strike rectangle in front of the body (x forward offset of its centre, w width, y feet-relative bottom, h height).
export const NAVE={
 // A hunched tallow corpse with a wick for a head. Unlit it shuffles; once it notices you it lights (30f, harmless) and
 // stays lit: faster, a two-beat swipe up close, a cyan flare lunge from mid range. The lunge burns the wick down to an
 // amber ember: its recovery is the punish window (exposed, x1.5).
 'wick-bearer':{
  family:'nave',body:{w:.8,h:1.6},hp:12,notice:8,counter:{hits:2,move:'flare'},dormant:.012,speed:.042,spacing:1.05,poise:2,stagger:18,
  ignite:30,gap:[16,34],
  moves:{
   swipe:{tell:22,active:8,after:28,parry:true,step:.035,box:{x:.75,w:1.3,y:.15,h:1.35},range:1.7},
   swipe2:{tell:18,active:8,after:30,parry:true,step:.035,box:{x:.8,w:1.4,y:.15,h:1.35},range:1.9},
   flare:{tell:20,active:10,after:30,parry:false,radius:1.5,height:1.2},
   lunge:{tell:26,active:14,after:44,parry:false,speed:.24,box:{x:.35,w:1.1,y:.1,h:1.4},range:[2.6,5.5],exposed:44}
  },
  chain:.35
 },
 // A wax pot on stilted legs that kites you and lobs molten wax. The blob is cyan in flight (dodge it) and marks its landing
 // spot for its whole flight; it sets for 14f (harmless), hardens into a brief cyan crust (64f), then crumbles. Up close it
 // tips the pot (an ivory, parryable spill). Any hit during a lob's tell cancels it (poise 1).
 'drip-censer':{
  family:'nave',body:{w:.9,h:1.4},hp:9,counter:{hits:2,move:'spill'},notice:10,speed:.022,retreat:3.5,approach:7.5,poise:1,stagger:16,gap:[30,52],
  moves:{
   lob:{tell:30,parry:false,count:1,spread:0,range:[2.4,11]},
   volley:{tell:36,parry:false,count:3,spread:2.4,range:[4,11],every:3},
   spill:{tell:24,active:10,after:30,parry:true,box:{x:.75,w:1.4,y:0,h:1.1},range:2.2}
  },
  blob:{flight:40,gravity:.02,radius:.3,lift:1.25,set:14,hard:64,crumble:20,half:.6,height:.4}
 }
};
