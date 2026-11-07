// Rules-v4 The Drowned Antiphon (BOSS-DESIGN boss 2b): a misted husk kneels on the Scale Mere; its reflection is the
// true six-armed choir-saint. Only the reflection shows which arms are real. Frames at 60 Hz, tiles, HP at the hero scale.
export const ANTIPHON={
 hp:240,coopHP:1.4,door:41,arenaLeft:40.6,right:60,mid:50.3,spawn:54.5,
 // The husk's robe is the hurtbox outside openings (ivory chip); its misted arms have none.
 husk:{w:2.4,h:4.6},limb:{w:2,h:1.8,y:.3},joint:{w:2.2,h:2.6},
 intro:150,entrance:40,
 cap:.1,chip:.25,chipCap:.01,chipWindow:300,amber:2,
 // Openings: ice-hole limb (small, 48f, 8 s apart), shattered veil and parried ender/hold joints (big, 70f, 12 s apart).
 smallGap:480,bigGap:720,limbOpen:48,veilOpen:70,jointOpen:70,stagger:20,
 // P2 -> P3: the transition frames at which the husk's two cyan hymns leave, each sung moves.sing.tell frames first
 // (the second once the world has turned back over, 64-112).
 thresholds:[.66,.33],transition:160,transSongs:[30,138],desperation:720,fuse:40,despDamage:2,contact:1,
 tells:[[28,34],[20,26],[14,20],[12,16]],neutral:[[22,36],[18,30],[14,24],[10,16]],minTell:12,
 antiRange:{distance:6.5,frames:180},antiTurtle:90,
 // Ice holes: a hunter's down-slam (downsword, divekick) cracks the scale-ice; a real limb striking within catch sticks.
 holes:{max:3,life:180,catch:1.2,space:1.3},
 moves:{
  // flood (rules 5): frames ahead a hands act looks for the P3 flood on the hunter's side (its longest tell + beats + strike).
  hands:{lanes:6,spacing:1.5,half:.62,top:3.4,active:6,beats:[12,12,10,8],after:16,real:[[2,3],[3,3],[3,4],[3,4]],flood:90},
  hymn:{speed:.16,radius:.3,top:1.5,every:3,start:.2,after:14},
  // The three hands follow the hunter until lock frames before the strike, then hold (time to step out of the real one).
  grasp:{offset:2.1,half:.55,top:3,active:8,after:18,lock:12},
  fan:{gap:2.6,near:2.4,top:2.8,active:8,after:20},
  lunge:{speed:.42,w:2.2,top:2.1,past:2.2,after:22},
  hold:{lift:24,half:.8,top:2.6,active:6,after:24,damage:2},
  ripple:{frames:120},
  sing:{tell:26,gap:[150,210]}
 },
 // P3: the waterline tilts every 6 s (at most 12 degrees: slope .2126); where it stands this far over the causeway it floods.
 tilt:{every:360,warn:60,ramp:50,hold:56,back:40,slope:.2126,flood:.55,lean:.15},
 shards:{warn:24,top:9.5,speed:.3,radius:.32},
 patterns:[
  [{id:'hands',m:['hands'],w:3},{id:'hymn',m:['hymn'],w:3},{id:'grasp',m:['grasp'],w:3},{id:'ripple',m:['ripple','hands'],w:2},
   {id:'handgrasp',m:['hands','grasp'],w:2},{id:'hymn2',m:['hymn','grasp'],w:1}],
  [{id:'fan',m:['fan'],w:3},{id:'hands',m:['hands'],w:2},{id:'hold',m:['hold'],w:2},{id:'grasphold',m:['grasp','hold'],w:2},
   {id:'handfan',m:['hands','fan'],w:2},{id:'hymn',m:['hymn','hands'],w:2},{id:'lunge',m:['lunge'],w:0,range:1}],
  [{id:'handfan',m:['hands','fan'],w:3},{id:'grasphold',m:['grasp','hold'],w:2},{id:'fanlunge',m:['fan','lunge'],w:2},
   {id:'hands2',m:['hands','hands'],w:2},{id:'hold',m:['hold','grasp'],w:2},{id:'ripple',m:['ripple','hands','fan'],w:1},{id:'lunge',m:['lunge','hands'],w:0,range:1}],
  [{id:'choir',m:['hands','lunge','hold'],w:3},{id:'fanhands',m:['fan','hands'],w:2},{id:'drown',m:['hold','hands','fan'],w:2}]
 ]
};
