// The Unborn Chrysalis, finished (config.boss 'chrysalis5', BOSS-DESIGN boss 1 in full): a copy of the M5 Chrysalis data
// (src/data/chrysalis.js stays untouched for its digests) plus the three twisting rim lips, Shed Husks, the Half-Shell
// Clap with its delayed and double variants, Cord Lash and the clean-pump reward. Angles in millidegrees, angular speed
// in millidegrees per frame, distances in tiles, times in frames, HP at the hero scale.
export const CHRYSALIS5={
 hp:180,coopHP:1.4,door:41,arenaLeft:40.6,right:60,
 // The Gullet: 16 rows, ledges (one-way) at mid height on both walls; P2 drops the left one to a broken lower ledge.
 rows:16,ledges:[{x0:41,x1:44,row:3},{x0:57,x1:60,row:3}],broken:{x0:41,x1:43,row:2},
 anchor:[50.3,14],cord:10,gravity:70,
 // Apex angles per rung: rest, one shove, the ledge (the seam can face out), the wall (over-pumped).
 rungs:[14000,20000,26100,52000],ledgeRung:2,wallRung:3,decay:4,
 shell:{w:3.2,h:5.4},creature:{w:2.2,h:4.2},reach:1.4,
 // The lip cue shows from flash tiles out; the old M5 'bottom' rule is replaced by each lip's own window.
 flash:3.2,
 // The three rim lips. A shove counts only when the guard meets the shell inside the leading lip's window, in frames
 // from the bottom of the swing (negative: before it). Brow: at the bottom. Hook: early, on the side it comes from.
 // Tail: late, after it passed the bottom. P1 always leads with the brow; from P2 the shell twists a third of a turn at
 // every second apex: each lip leads one full swing (there and back), and is shown for the whole descent before its window.
 lips:[{id:'brow',lo:-24,hi:0},{id:'hook',lo:-46,hi:-16},{id:'tail',lo:-6,hi:22}],
 intro:150,entrance:40,
 cap:.1,chip:.25,chipCap:.01,chipWindow:300,amber:2,
 // A clean pump (every shove from rest with the swing, no damp, decay or hit between, no Wall Strike after) cuts the next
 // apex wait to cleanGap.
 openGap:720,cleanGap:480,clapGap:600,apexOpen:[60,56,44],crack:56,clapOpen:44,dodgeLate:12,
 // After an opening the body recoils this long before its swing can strike again (time to step out from under it).
 closeGrace:14,
 // rehang: frames a shell knocked to the floor by a phase change (a cracked Drop-Reel) takes to ease back onto its cord.
 thresholds:[.66,.33],transition:150,rehang:20,desperation:720,despDamage:2,contact:1,
 // Teach, test, master, then the Unfold attempt (14-16f).
 tells:[[28,36],[20,26],[14,20],[14,16]],neutral:[[24,40],[20,34],[16,28],[12,18]],
 antiRange:{distance:6.5,frames:180},antiTurtle:90,
 // Rules v5 (the Hub): a hunter farther than dist tiles from the cord's line for frames[tier] (P1, P2, P3, desperation)
 // is answered by a Wall Strike on that wall, so no wall, corner or ledge waits a phase or the desperation out.
 fair5:{camp:{dist:5.2,frames:[300,300,210,75]}},
 moves:{
  gum:{globs:3,spread:1.6,flight:30,gravity:.02,radius:.3,strand:1.4,life:240,slow:.45},
  wall:{warn:24,falls:4,third:6.5,shock:2.2},
  reel:{lift:30,sway:36,fall:16,bounce:18,settle:24,top:13,shadow:.08},
  corkscrew:{low:1.5,high:3.7,gap:1.4,length:3,life:180},
  flail:{active:6,radius:2.6,after:14},
  // Shed Husks: the shell peels during the tell, then sheds two empty cocoons at the next apex; they drop (harmless),
  // wobble where they land for settle frames, then roll down the slope of the swing, the second slower so they part. Ivory: jump them (1.2 tiles tall) or parry them apart.
  husks:{count:2,speed:.15,slow:.045,spread:.8,radius:.6,settle:12,life:170},
  // Half-Shell Clap: from the apex of its cord swing the unborn spreads the two shell halves (an ivory ring) and slams
  // them together. Delayed: the halves hold open 10-16f more (its own sound). Double: a second clap twin frames later.
  clap:{active:6,after:16,reach:2.3,below:.9,above:.7,delay:[10,16],twin:18,second:16},
  // Cord Lash: the stump whips along the floor from under the apex toward the middle (cyan gum tip: jump it).
  lash:{active:20,reach:7,height:1.15,tip:.55,after:14}
 },
 patterns:[
  [{id:'spit',m:['gum'],w:3},{id:'strike',m:['wall'],w:2},{id:'reel',m:['reel'],w:2},{id:'spit2',m:['gum','gum'],w:2},{id:'spitreel',m:['gum','reel'],w:2},{id:'wait',m:[],w:2}],
  [{id:'cork',m:['corkscrew'],w:3},{id:'husk',m:['husks'],w:3},{id:'spitcork',m:['gum','corkscrew'],w:2},{id:'strike',m:['wall','gum'],w:1},{id:'huskspit',m:['husks','gum'],w:1},{id:'reelcork',m:['reel','corkscrew'],w:2},{id:'wait',m:[],w:1}],
  [{id:'clap',m:['clap'],w:3},{id:'clapd',m:['clapd'],w:2},{id:'clap2',m:['clap2'],w:2},{id:'lash',m:['lash'],w:2},{id:'flail',m:['flail'],w:2},{id:'flaillash',m:['flail','lash'],w:1},{id:'wait',m:[],w:1}],
  [{id:'frenzy',m:['clap','flail','lash'],w:3},{id:'twin',m:['clap2','flail'],w:2},{id:'late',m:['lash','clapd'],w:2}]
 ],
 // A hunter channelling a Mend is punished (spit in P1-P2, the lash in P3), still with the full tell.
 mendReply:['gum','gum','lash','lash'],
 debris:{y:10.5,speed:-.3,radius:.32},
 wave:{speed:.17,range:16,y:1.12,radius:.24}
};
