// Rules-v4 Tallowgrave, the Renderer (BOSS-DESIGN boss 2a) in the Rendering Nave: solid shadow from a light you can move.
// Frames at 60 Hz, distances in tiles (floor top at y 1), HP at the hero scale (80 light claws at Brute punch 3).
export const TALLOW={
 hp:240,coopHP:1.4,door:41,arenaLeft:40.6,right:60,rows:12,mid:50.3,
 intro:150,entrance:40,
 cap:.1,chip:.25,chipCap:.01,chipWindow:300,amber:2,stunAmber:1,riposte:1.5,orb:.5,
 // Openings: big windows (jam, gutter) at least 12 s apart; small parry stuns at most every 10 s; the P3 flare 8 s apart.
 openGap:720,smallGap:600,jam:60,stun:[30,36],gutter:60,flare:34,flareGap:480,flareSteps:3,idleOpen:.4,
 thresholds:[.66,.33],transition:150,desperation:720,despDamage:2,contact:1,contactGrace:45,despOpen:240,
 // The kill plays out: dead at once (credit, no more threats), the run ends `dying` frames later, once it has melted.
 dying:100,
 tells:[[28,34],[20,26],[14,20],[12,16]],neutral:[[22,36],[18,30],[14,24],[10,16]],
 // The light: near (8x shadows, huge and slow), mid (5x), far (3x, small and fast). Shadows never strike under 20f.
 light:{k:[8,5,3],tells:[[34,38],[26,30],[20,22]],prefer:1,hold:180,y:6.4,reach:1.7},minShadow:20,
 antiRange:{distance:7.5,frames:180},antiTurtle:90,walk:.045,walkMax:40,
 // Hurtboxes: the in-plane body is ivory wax; the wick-heart (amber) only while open; behind the veil it is out of reach.
 body:{w:2.4,h:6},heart:{w:2.6,y0:.8,y1:3.4},core:{w:1.4,h:3.2,race:2},parked:40,
 columns:[43.4,48,52.6,57.2],column:{w:.9,h:4.6,min:.7,max:2.2,slope:.35,near:1.3},
 moves:{
  palm:{hand:.75,top:9,active:6,track:10,wall:2},
  rake:{fingers:5,pitch:4.7,speed:[.12,.15,.18],width:[1.1,.9,.7],h:1.1},
  tear:{reach:5.5,length:7.5,out:6,hold:12,back:10,lanes:[1.45,2.15],r:.3},
  pour:{warn:30,stream:16,pool:180,hard:300,half:1.2,slow:.5,y:9.6},
  grasp:{creep:40,band:3.4,lead:3.2,drift:.02,active:6},
  snuff:{active:6,relight:20,len:6.5,min:2.2},
  // Spear Sweep: low (jump), high (stay down) cyan cuts, then the ivory thrust ender (parry it).
  sweep:{active:8,after:12,low:{x0:-.6,x1:4.4,y0:0,y1:1.2},high:{x0:-.6,x1:4.6,y0:1.95,y1:4.4},thrust:{x0:0,x1:5.2,y0:.3,y1:1.7},step:.04,lunge:.09},
  pulse:{active:6},
  stride:{steps:3,frames:20,speed:.055,trail:240,half:.7,slow:.5},
  race:{speed:.3,after:36,crouch:20}
 },
 // Weighted chains per tier; open: a pattern that ends in a parryable move (preferred once an opening is due).
 patterns:[
  [{id:'palm',m:['palm'],w:3},{id:'rake',m:['rake'],w:2},{id:'tear',m:['tear'],w:3,open:1},{id:'palmtear',m:['palm','tear'],w:2,open:1},
   {id:'rakepalm',m:['rake','palm'],w:2},{id:'pour',m:['pour','tear'],w:2,open:1},{id:'tear2',m:['tear','tear'],w:1,open:1}],
  [{id:'grasp',m:['grasp'],w:3},{id:'snuff',m:['snuff','sweep'],w:2,open:1},{id:'sweep',m:['sweep'],w:3,open:1},{id:'graspsweep',m:['grasp','sweep'],w:2,open:1},
   {id:'pour',m:['pour','grasp'],w:1},{id:'snuff2',m:['snuff'],w:1}],
  [{id:'pulse',m:['pulse'],w:2},{id:'stride',m:['stride'],w:3},{id:'sweep',m:['sweep'],w:2,open:1},{id:'pulsesweep',m:['pulse','sweep'],w:2,open:1},
   {id:'stridepulse',m:['stride','pulse'],w:2}],
  [{id:'race',m:['race','pulse'],w:3},{id:'race2',m:['race','race'],w:2},{id:'thrust',m:['sweep'],w:2},{id:'pulse',m:['pulse','race'],w:2}]
 ],
 // Sweep chains by tier (index into the sweep strike list); the ender is always the ivory thrust.
 chains:[[['thrust']],[['low','thrust'],['high','thrust'],['low','high','thrust']],[['low','high','thrust'],['high','low','thrust'],['low','thrust']],[['thrust'],['low','thrust']]],
 falls:{warn:26,y:10.4,speed:-.3,radius:.32,lanes:[-3,0,3]},
 wave:{speed:.17,range:16,y:1.12,radius:.24}
};
