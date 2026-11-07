// The Scale Mere's mirror family. Frames at 60 Hz, distances in tiles, damage in masks; parry:true = ivory ring.
export const MERE={
 // A silver water-strider that skates the scale-ice. It keeps its distance, crouches behind an ivory ring (24f) and
 // dashes across the floor past where you stood: parry it (it spins out, stunned), jump it (it is low) or dodge through.
 // Up close it answers with a rising ivory cut.
 'mirror-skater':{
  family:'mere',body:{w:1,h:.9},hp:9,counter:{hits:2,move:'cut'},notice:10,speed:.06,accel:.006,keep:[4,6.5],poise:2,stagger:16,gap:[24,44],
  moves:{
   skate:{tell:24,active:30,after:34,parry:true,speed:.3,over:2.5,max:8,box:{x:.2,w:1.2,y:0,h:.85},range:[2.2,8.5]},
   cut:{tell:18,active:6,after:26,parry:true,box:{x:.7,w:1.1,y:0,h:1.7},range:1.8}
  }
 },
 // A scaled fish-thing that sinks into the ice, swims under it toward you (a visible wake), stops, and while cyan ripples
 // ring the spot it locked (32f) it rises in an unparryable uppercut column. Beached afterwards, its amber gills are open
 // (exposed, x1.5). On the surface it slaps (ivory).
 'scale-diver':{
  family:'mere',body:{w:.9,h:1.3},hp:12,counter:{hits:3,move:'sink'},notice:9,speed:.025,poise:3,stagger:18,gap:[22,40],
  sink:18,swim:.07,swimMax:120,
  moves:{
   slap:{tell:22,active:8,after:30,parry:true,box:{x:.7,w:1.2,y:.1,h:1.2},range:1.5},
   rise:{tell:32,active:10,after:54,parry:false,box:{x:0,w:1.4,y:0,h:3.6},range:[2.5,9],leap:.32,exposed:54}
  }
 }
};
