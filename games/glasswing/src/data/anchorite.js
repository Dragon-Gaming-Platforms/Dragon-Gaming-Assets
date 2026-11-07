// Rules-v4 The Hourglass Anchorite (BOSS-DESIGN boss 3a): a hermit-tick fused to the axle of a giant hourglass in the
// Reliquary Drum, a square room it turns over whenever its bulb runs empty. Frames at 60 Hz, distances in tiles,
// angles in millidegrees, HP at the hero scale (Brute punch 3: 270 = the framework's 90 light claws).
export const ANCHORITE={
 hp:270,coopHP:1.4,
 // The drum: a 14-tile square over the Nest's boss end (left wall x 46, door rows 1-3 open until the hunter is in);
 // the level widens to 74 so the view can centre it. Local cells (u,v)=(x-46,y); a quarter turn maps (u,v) to (13-v,u).
 x0:46,n:14,width:74,door:[1,3],checkpoint:49,ledges:[{u0:2,u1:4,v:4},{u0:9,u1:11,v:9}],
 hub:[53,7],body:{w:3.4,h:4.4,y:4.6},axle:{w:1.8,h:2},
 intro:150,entrance:40,
 cap:.1,jamCap:.03,chip:.25,chipCap:.01,chipWindow:300,amber:2.5,
 // Sand in the upper bulb (frames to the next turn) by phase, then desperation's fixed quarter-turn sequence
 // (the shattered bulb snaps the room despOpen frames in, before its first lash).
 period:[900,780,600,150],turn:24,land:40,despTurns:[1,1,3,2,3,1,1,3],despOpen:20,
 // After a turn survived unhit and clear of the burying side, the lower bulb comes down to the floor.
 opening:{from:20,to:170,bulb:[70,70,44],gap:600,side:1.4,reach:2.7,w:2.6,h:2.8},
 jam:{frames:40,max:2,gap:180,w:2,h:2.6},
 bury:{frames:240,life:360,shove:.36},
 sink:{frames:40,w:1.8},
 conveyor:{speed:.02,every:[360,480],warn:24},
 bedMax:1,
 thresholds:[.66,.33],transition:60,desperation:720,despDamage:2,
 tells:[[28,36],[20,26],[14,20],[14,16]],neutral:[[26,40],[20,34],[16,28],[12,18]],
 antiRange:{distance:5.5,frames:180},antiTurtle:90,formTurn:90,
 moves:{
  lash:{hit:4,active:3,hold:14,after:10,w:1.1,h:2.8,lock:.45},
  ribs:{count:[3,4,4,4],gap:[[44,60],[36,52],[30,44],[30,40]],speed:.15,w:.5,h:1},
  drop:{count:[2,3,3,3],spread:2.4,g:.025,max:.55,size:1.1,stagger:6},
  pour:{from:80000,speed:2400,width:.32,neck:1.8}
 },
 patterns:[
  [{id:'lash',m:['lash'],w:3},{id:'lash2',m:['lash','lash'],w:2},{id:'ribs',m:['ribs'],w:3},{id:'drop',m:['drop'],w:2},{id:'ribslash',m:['ribs','lash'],w:2},{id:'droplash',m:['drop','lash'],w:2},{id:'wait',m:[],w:1}],
  [{id:'lash2',m:['lash','lash'],w:2},{id:'pour',m:['pour'],w:3},{id:'ribs',m:['ribs'],w:2},{id:'ribspour',m:['ribs','pour'],w:2},{id:'droplash',m:['drop','lash'],w:2},{id:'lashpour',m:['lash','pour'],w:2},{id:'wait',m:[],w:1}],
  [{id:'lash3',m:['lash','lash','lash'],w:2},{id:'ribslash',m:['ribs','lash'],w:2},{id:'pour',m:['pour'],w:2},{id:'droppour',m:['drop','pour'],w:2},{id:'ribsdrop',m:['ribs','drop'],w:2},{id:'lash2',m:['lash','lash'],w:2}],
  [{id:'lash2',m:['lash','lash'],w:3},{id:'lash',m:['lash'],w:2}]
 ]
};
