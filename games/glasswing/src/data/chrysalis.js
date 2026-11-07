// Rules-v4 Old Glasswing, the Unborn Chrysalis (BOSS-DESIGN boss 1): a cocoon on a live fixed-point pendulum in the
// Gullet. Angles in millidegrees, angular speed in millidegrees per frame, distances in tiles, HP at the hero scale.
export const CHRYSALIS={
 hp:180,coopHP:1.4,door:41,arenaLeft:40.6,right:60,
 // The Gullet: 16 rows, ledges (one-way) at mid height on both walls; P2 drops the left one to a broken lower ledge.
 rows:16,ledges:[{x0:41,x1:44,row:3},{x0:57,x1:60,row:3}],broken:{x0:41,x1:43,row:2},
 anchor:[50.3,14],cord:10,gravity:70,
 // Apex angles per rung: rest, one shove, the ledge (two shoves; the seam can face out), the wall (over-pumped).
 rungs:[14000,20000,26100,52000],ledgeRung:2,wallRung:3,decay:4,
 shell:{w:3.2,h:5.4},creature:{w:2.2,h:4.2},reach:1.4,
 // A shove counts only while the shell's centre is this close to the bottom; the lip flashes from flash tiles out.
 bottom:1.6,flash:3.2,
 intro:150,entrance:40,
 cap:.1,chip:.25,chipCap:.01,chipWindow:300,amber:2,
 openGap:720,clapGap:600,apexOpen:[60,56,40],crack:56,clapOpen:40,dodgeLate:12,
 thresholds:[.66,.33],transition:150,desperation:720,despDamage:2,contact:1,
 tells:[[28,36],[20,26],[14,20],[12,16]],neutral:[[24,40],[20,34],[16,28],[12,18]],
 antiRange:{distance:6.5,frames:180},antiTurtle:90,
 moves:{
  gum:{globs:3,spread:1.6,flight:30,gravity:.02,radius:.3,strand:1.4,life:240,slow:.45},
  wall:{warn:24,falls:4,third:6.5,shock:2.2},
  reel:{lift:30,sway:36,fall:16,bounce:18,settle:24,top:13,shadow:.08},
  corkscrew:{low:1.5,high:3.7,gap:1.4,length:3,life:180},
  flail:{active:8,radius:2.8,after:14}
 },
 patterns:[
  [{id:'spit',m:['gum'],w:3},{id:'strike',m:['wall'],w:2},{id:'reel',m:['reel'],w:2},{id:'spit2',m:['gum','gum'],w:2},{id:'spitreel',m:['gum','reel'],w:2},{id:'wait',m:[],w:2}],
  [{id:'cork',m:['corkscrew'],w:3},{id:'spitcork',m:['gum','corkscrew'],w:2},{id:'strike',m:['wall','gum'],w:2},{id:'reelcork',m:['reel','corkscrew'],w:2},{id:'spit2',m:['gum','gum','reel'],w:1},{id:'wait',m:[],w:1}],
  [{id:'flail',m:['flail'],w:3},{id:'flail2',m:['flail','flail'],w:2},{id:'wait',m:[],w:2}],
  [{id:'frenzy',m:['flail','flail','flail'],w:3},{id:'flail',m:['flail'],w:1}]
 ],
 // Rules v5 only (src/game/chrysalis.js chrysalisFair): a Wing Flail's burst starts at least this long after the last
 // one's (the 48f dodge cooldown plus a 14f reaction), so the dodge that cleared the first can clear the next.
 // Its tell is at least flailTell frames (P3, desperation): the 14-20f of the P3 tier left a hunter already inside
 // its reach no time to react and time a dodge (tests: a cloned-run search found 2% of P3 flails unavoidable).
 // camp: a hunter farther than dist tiles from the cord's line for frames (P3, desperation) is answered by a Wall
 // Strike on that wall (beyond it neither the unborn's arc nor its flail reach; the desperation was waited out there).
 fair5:{flailSpacing:62,flailTell:[[22,28],[18,22]],camp:{dist:5.2,frames:[150,60]}},
 debris:{y:10.5,speed:-.3,radius:.32},
 wave:{speed:.17,range:16,y:1.12,radius:.24}
};
