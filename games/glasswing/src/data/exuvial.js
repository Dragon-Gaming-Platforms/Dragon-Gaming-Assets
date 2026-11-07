// Rules-v4 The Exuvial (BOSS-DESIGN boss 4): a chrysalis-thing stitched from shed hunter skins, hanging head-down in
// the Moulting Well. Its Shedding Hook rips a body slot (your moult, or a wall skin's part when dodged) and grafts it:
// each graft is an amber weak point and a fixed move. Frames at 60 Hz, distances in tiles, HP at the hero scale.
export const EXUVIAL={
 hp:285,coopHP:1.4,door:41,arenaLeft:40.6,right:60,
 // The Well: 26 rows; P1 stands on the silk lid (row 12), P2 falls through cocoon pods, P3 is the bottom.
 rows:26,lid:{row:12,x0:40,x1:60},pods:[{x0:41,x1:46,row:8},{x0:54,x1:59,row:8},{x0:47,x1:53,row:4}],top:25,
 drop:{x:45,y:16,spacing:1.2},
 head:{w:2.4,h:3},hang:[2.4,2.4,2.3,2.2],sway:.045,minX:43.2,maxX:57.4,
 intro:150,entrance:40,
 cap:.1,chip:.25,chipCap:.01,chipWindow:300,amber:2.5,
 // Openings: a torn-back graft (60f, at least 12 s apart), a broken cocoon (90f), a parried Rake ender (35f, 10 s).
 openGap:720,parryGap:600,tearOpen:60,rakeOpen:35,cocoonOpen:90,stagger:30,
 tear:{hits:3,window:60},plant:[56,50,46,40],fly:20,
 // Parts it may hold at once, by phase (desperation keeps what it wears).
 holds:[1,2,3,3],cocoon:{tell:30,frames:480,hits:6,rain:150},
 thresholds:[.66,.33],transition:150,desperation:720,despDamage:2,contact:1,burnGrace:40,
 tells:[[28,36],[20,26],[14,20],[12,16]],neutral:[[24,38],[20,32],[16,26],[10,16]],minTell:12,
 // Extra tell frames for the moves you must walk out of (rings on the floor, the drops).
 extra:{sigil:10,slam:2,gore:2},
 antiRange:{distance:6.5,frames:180},antiTurtle:90,
 slots:['horns','back','arms','legs','sigil'],
 moves:{
  hook:{active:10,radius:.55,reach:10,retract:22,over:1.2},
  rain:{skins:2,max:[1,2,2,3],fall:36,spread:2.6,hp:3},
  slam:{rise:1.2,drop:12,w:2.4,rest:40,lift:22,wave:{speed:.16,range:8,radius:.24,y:.25}},
  gore:{drop:6,w:1.5,lift:22},
  // Wing Burst: the wings beat and shed a curtain of cyan scales in columns (gaps between them; P3 closes the middle).
  burst:{speed:.15,radius:.26,cols:[[-5,-3,-1,1,3,5],[-6,-4,-2,0,2,4,6]],drift:.012,lift:22},
  rake:{swipes:3,gap:12,ender:18,active:6,x0:.6,x1:3.6,h:1.9,drift:.03,lift:22},
  sweep:{active:36,h:.9,w:1.2,lift:22},
  sigil:{radius:.95,active:10,height:6,offset:3.9,lift:22},
  // Skin Storm: two curtains 30f apart (time to step from one gap to the next), then your sigil ring, which follows
  // you until the second curtain has passed the floor and only then locks (18f before its pillar).
  storm:{lift:24,volley:30,ring:56,lock:28}
 },
 // Weighted chains by tier; 'g' is one of its grafted moves, 'hook' needs a free hold.
 patterns:[
  [{id:'hook',m:['hook'],w:4},{id:'slam',m:['slam'],w:3},{id:'rain',m:['rain'],w:2},{id:'slamhook',m:['slam','hook'],w:2},{id:'graft',m:['g'],w:5},{id:'raingraft',m:['rain','g'],w:2},{id:'wait',m:[],w:1}],
  [{id:'hook',m:['hook'],w:3},{id:'graft',m:['g'],w:4},{id:'graft2',m:['g','g'],w:3},{id:'slamg',m:['slam','g'],w:2},{id:'hookslam',m:['hook','slam'],w:2},{id:'rain',m:['rain','g'],w:2},{id:'wait',m:[],w:1}],
  [{id:'hook',m:['hook'],w:3},{id:'graft',m:['g'],w:3},{id:'graft2',m:['g','g'],w:3},{id:'slamg',m:['slam','g'],w:2},{id:'hookg',m:['hook','g'],w:2},{id:'rain',m:['rain','slam'],w:1},{id:'storm',m:['storm'],w:4,chimera:true}],
  [{id:'frenzy',m:['g','g','g'],w:3},{id:'pair',m:['g','slam'],w:2},{id:'storm',m:['storm','g'],w:2}]
 ],
 // A part grafted from an empty slot (or a wall skin) is the Exuvial's own: drawn as a stitched crimson-skin version.
 own:{horns:'horns-ram',back:'back-bone',arms:'arms-hook',legs:'tail-root',sigil:'sigil-kiln'},
 debris:{y:24,speed:-.32,radius:.32,warn:30},
 wave:{speed:.16,range:9,radius:.24}
};
