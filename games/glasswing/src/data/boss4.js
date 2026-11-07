// Rules-v4 Old Glasswing. Frames at 60 Hz, distances in tiles, HP at the unchanged hero damage scale
// (Brute punch 3). 180 = the framework's 60 light hits at 3 damage (7.5x the Arcade 24): x12 (288) made
// fights run far past the 90-180 s target: openings are capped at 10%, so length comes from openings, not raw HP.
export const BOSS4={
 hp:180,coopHP:1.4,door:41,arenaLeft:40.6,spawnX:55,spawnY:1,entrance:30,walk:.05,
 cap:.1,chip:.25,chipCap:.01,chipWindow:300,orb:.5,riposte:1.5,
 thresholds:[.66,.33],transition:120,roar:30,desperation:720,contact:1,despDamage:2,
 // Tell tiers: teach (P1 and any first appearance), test (P2), master (P3), desperation.
 tells:[[28,36],[20,26],[14,20],[12,16]],link:.62,minTell:12,
 neutral:[[20,34],[18,28],[16,24],[12,18]],
 open:[66,60,54],parryStun:[30,40],parryGap:360,recoil:16,reflectStagger:20,
 antiAir:{height:1.8,range:5.5},antiRange:{distance:7,frames:180},antiTurtle:90,
 moves:{
  sweep:{active:12,after:14,parry:true,damage:1,x0:-.4,x1:4.6,y0:0,y1:2.3,step:.05},
  slam:{active:10,after:20,damage:1,x0:-2.4,x1:2.4,y0:0,y1:.5,waveSpeed:.17,waveRange:16,waveY:1.12,waveRadius:.24},
  barrage:{active:30,after:16,damage:1,interval:6,speed:.15,lanes:[1.35,2,2.65],ivory:true},
  rush:{active:46,after:24,damage:2,speed:.26,x0:.5,x1:1.4,y0:0,y1:3.4},
  lunge:{active:18,after:22,damage:1,leap:.5,drift:.11,x0:-.6,x1:3,y0:1.9,y1:6.8},
  summon:{active:12,after:18,count:2,offset:3,spacing:2,y:3,delay:16}
 },
 // Weighted patterns per phase; open: a clean dodge of the whole chain earns a post-recovery opening.
 patterns:[
  [{id:'claw',m:['sweep','sweep'],w:4,open:1},{id:'quake',m:['slam'],w:3,open:1},{id:'clawquake',m:['sweep','slam'],w:3,open:1},
   {id:'volley',m:['barrage'],w:1,range:1},{id:'rise',m:['lunge'],w:0,air:1},{id:'stomp',m:['slam'],w:0,turtle:1}],
  [{id:'claw3',m:['sweep','sweep','sweep'],w:3,open:1},{id:'quakeclaw',m:['slam','sweep'],w:3,open:1},{id:'charge',m:['sweep','rush'],w:2,open:1},
   {id:'volley',m:['barrage','slam'],w:2},{id:'brood',m:['summon','barrage'],w:1,once:1},{id:'rise',m:['lunge','slam'],w:0,air:1},
   {id:'run',m:['rush'],w:0,range:1},{id:'stomp',m:['slam','sweep'],w:0,turtle:1}],
  [{id:'claw4',m:['sweep','sweep','slam','sweep'],w:3,open:1},{id:'storm',m:['barrage','rush'],w:2,open:1},{id:'charge2',m:['rush','sweep','rush'],w:2,open:1},
   {id:'quake2',m:['slam','slam','sweep'],w:3},{id:'rise',m:['lunge','sweep'],w:0,air:1},{id:'run',m:['barrage','rush'],w:0,range:1},
   {id:'stomp',m:['slam','lunge'],w:0,turtle:1}],
  [{id:'frenzy',m:['sweep','rush','sweep','slam','rush'],w:3},{id:'wings',m:['barrage','lunge','slam'],w:2},{id:'gnash',m:['slam','sweep','sweep','rush'],w:3},
   {id:'rise',m:['lunge','rush'],w:0,air:1}]
 ],
 debris:{every:14,warn:26,speed:-.22,y:9.2,radius:.3,spread:[-2,-1,0,1,2,3]}
};
