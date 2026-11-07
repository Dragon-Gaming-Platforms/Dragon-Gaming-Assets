// Rules-v4 Cordycea, Who Wears the Dead (BOSS-DESIGN boss 3b): a fungal crown hanging over the Mycelial Garden. It sows
// spores into fixed sockets that swell, erupt, stand as caps and rot; the hunter climbs that terrain to its gills.
// Frames at 60 Hz, distances in tiles (y up), HP at the hero scale (Brute punch 3: 270 = the framework's 90 light claws).
export const CORDYCEA={
 hp:270,coopHP:1.4,door:41,arenaLeft:40.6,right:60,cx:50.3,rows:14,
 // The crown: its cap base per phase (it lowers on a trunk, then grows down), the closed and the open (gill) boxes.
 crown:{w:6,h:4.2,base:[9.2,8.3,7.5],open:{w:7.2,drop:1.3},droop:4.6,recoil:5,spent:1,sway:.5},
 // Sockets: 8 floor stalks (cap row; the cap is a 2-tile one-way platform) and 4 wall brackets. F2/F5 are the inner high
 // caps under the crown's rim: a sow before a breath always grows one, so the gills can always be reached.
 sockets:[{x0:41,row:2},{x0:43,row:3},{x0:46,row:4,high:1},{x0:48,row:2},{x0:51,row:2},{x0:53,row:4,high:1},{x0:56,row:3},{x0:58,row:2},
  {x0:41,row:5,wall:-1},{x0:58,row:5,wall:1},{x0:41,row:8,wall:-1},{x0:58,row:8,wall:1}],
 swellMin:24,erupt:10,solid:[480,420,150],rot:50,sowCount:[[3,4],[3,4],[4,5],[4,5]],
 intro:150,entrance:40,
 cap:.09,chip:.25,chipCap:.01,chipWindow:300,amber:4.2,
 // Openings: the breathing gills after every 2 Spore Sows, a droop for a parried Corpse Slam (P1), a recoil for 3 risen
 // destroyed within 4 s (P3). Each kind keeps its own gap; any two openings stand at least `between` apart.
 breath:[84,76,66],inhale:24,breathGap:720,droop:60,droopGap:600,recoil:44,recoilGap:600,killWindow:240,kills:3,between:150,
 thresholds:[.66,.33],transition:150,desperation:720,despDamage:2,contact:1,dying:120,
 // Tells per tier; the last fruiting reads 14-16f (BOSS-DESIGN 3b).
 tells:[[28,36],[20,26],[14,20],[14,16]],neutral:[[24,40],[20,34],[16,28],[12,18]],
 antiRange:{distance:7,frames:180},antiTurtle:90,
 corpse:{w:1.5,h:4.2,speed:.032,reach:3,range:3.4,x0:.2,x1:3.1,y1:3.2,active:8,after:30,stun:40,gap:[50,80],rise:40},
 risen:{w:1.1,h:3,hp:6,speed:.045,reach:2.2,x0:.2,x1:2.3,y1:2.4,active:6,after:26,stun:30,gap:[40,70],rise:30,max:3},
 moves:{
  // The lash (the whole arena) and the puff (grown under the hunter's feet) are answered only on reaction (a timed jump, a
  // drop, a dodge out), so their tells never drop under minTell: a 14f human reaction plus the answer, even in P3 and the
  // last fruiting.
  lash:{active:6,lanes:[[1,1.6],[2.95,3.55]],minTell:20},
  snare:{swell:30,active:8,w:1.4,h:2.4},
  bloom:{speed:.14,w:.8,h:2.4,cap:.6},
  puff:{w:4.4,h:2.4,grow:40,life:170,minTell:16},
  volley:{count:3,speed:.17,radius:.26,every:8},
  rain:{warn:24,speed:-.28,radius:.3,y:12.5}
 },
 patterns:[
  [{id:'sow',m:['sow'],w:3},{id:'lash',m:['lash'],w:2},{id:'lash2',m:['lash','lash'],w:2},{id:'sowlash',m:['sow','lash'],w:2},{id:'wait',m:[],w:1}],
  [{id:'sow',m:['sow'],w:2},{id:'wall',m:['bloom'],w:3},{id:'puff',m:['puff'],w:2},{id:'sowpuff',m:['sow','puff'],w:2},{id:'lashwall',m:['lash','bloom'],w:2},{id:'lash2',m:['lash','lash'],w:1}],
  [{id:'sow',m:['sow'],w:3},{id:'lash2',m:['lash','lash'],w:2},{id:'sowpuff',m:['sow','puff'],w:2},{id:'wall',m:['bloom','lash'],w:2},{id:'puff',m:['puff'],w:1}],
  [{id:'frenzy',m:['lash','sow','lash'],w:3},{id:'rot',m:['sow','puff'],w:2},{id:'wall',m:['bloom','lash'],w:2}]
 ]
};
