// The Hindwing's sand-and-fungus family. Frames at 60 Hz, distances in tiles, damage in masks; parry:true = ivory ring.
export const HINDWING={
 // Spore motes that swirl round you in small flocks (one hit kills). At most two of a flock inflate at once (24f, cyan,
 // drifting in), then burst into a short spore puff around themselves. Popping one mid-tell is safe.
 sporeling:{
  family:'hindwing',body:{w:.5,h:.5},hp:1,notice:12,flying:true,orbit:[2.6,.7],height:1.5,ease:.05,max:.075,
  turn:900,tokens:2,gap:[40,90],count:[1,8],
  moves:{
   puff:{tell:24,active:10,after:40,parry:false,drift:.025,radius:1.05,range:3.2}
  }
 },
 // An armoured corpse ridden by cordyceps. Its ivory chitin clanks (no damage) until a parry or a heavy hit (combo ender,
 // kick, dive kick, pogo, charged blast, a form) cracks it open; the amber core then takes full damage and it hurries.
 // Stand next to it too long and it vents cyan spores (anti-turtle).
 'cordyceps-husk':{
  family:'hindwing',body:{w:1,h:1.8},hp:14,counter:{hits:3,move:'vent'},notice:8,speed:.016,broken:.03,poise:3,stagger:20,break:30,gap:[24,40],
  close:2.6,turtle:80,
  moves:{
   slam:{tell:30,broken:24,active:8,after:36,parry:true,box:{x:.6,w:1.6,y:0,h:2.2},range:1.8},
   vent:{tell:28,active:12,after:40,parry:false,radius:1.7,up:.8}
  }
 },
 // The Hindwing mid-boss: a bigger, faster husk with two phases. P1 armoured (slams, a cyan horn charge that sticks in a
 // wall, vents); a parry, two heavy hits or 55% HP blooms it open: a 60f roar (a cyan floor shock rolls out both ways at
 // 24f: jump it), then P2 with an exposed amber core, quicker tells, a triple slam, a spore ring and a sporeling brood.
 'husk-sovereign':{
  family:'hindwing',body:{w:1.5,h:2.9},hp:90,counter:{hits:4,move:'vent',p2:'bloom'},notice:14,speed:.024,bloomed:.045,stun:40,gap:[18,32],gap2:[12,24],
  heavy:2,bloomAt:.55,plate:.35,roar:60,shock:{at:24,speed:.16,height:.6,life:90},close:2.8,turtle:70,broodGap:720,glass:1.15,
  moves:{
   slam:{tell:26,active:8,after:30,parry:true,box:{x:1,w:2.4,y:0,h:3},range:2.4},
   slam2:{tell:20,active:8,after:34,parry:true,box:{x:1.1,w:2.6,y:0,h:3},range:2.6},
   charge:{tell:30,p2:24,active:60,after:40,parry:false,damage:2,speed:.2,max:9,box:{x:.5,w:1.7,y:0,h:2.8},range:[3.5,12],stuck:60},
   vent:{tell:28,active:12,after:36,parry:false,radius:2.2},
   triple:{tell:24,chain:[18,18],active:8,after:38,parry:true,box:{x:1.1,w:2.6,y:0,h:3},last:{x:1.3,w:3.2,y:0,h:3.2,damage:2},range:2.6},
   bloom:{tell:26,active:12,after:34,parry:false,radius:2.4,damage:2},
   brood:{tell:30,after:24,parry:false,count:3}
  }
 }
};
