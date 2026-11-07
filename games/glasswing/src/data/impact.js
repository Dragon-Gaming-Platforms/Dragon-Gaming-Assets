// Impact and juice (render and live feedback only: the simulation, replays and digests never see it).
// Times in real seconds unless named frames; sizes in tiles unless named px (logical 720p pixels).
export const IMPACT={
 on:true,
 slash:{on:true,sweep:3,linger:6,ry:1.25,thick:.42,alpha:.85,heavy:1.35,glass:1.5,points:16},
 sparks:{on:true,pool:180,streaks:9,shards:6,speed:.22,life:.32,freeze:.1,gravity:.006},
 star:{life:.09,size:.9,parry:1.1},
 white:{life:.15,peak:.85,boss:.55,freeze:.3},
 // Floating damage: Brute light hit = 10 (BOSS-DESIGN damage scale; the simulation keeps its own scale).
 numbers:{on:true,pool:24,scale:10/3,life:.7,rise:46,px:30,crit:44,chip:21,line:30,pop:.08,drift:14},
 // Screen shake: trauma (0-1) per hit weight, amplitude grows with trauma squared, camera offset only.
 shake:{on:true,max:.32,decay:2.4,kick:.12,kickDecay:22,freq:[31,47,59,71],reduced:.35,
  weight:{light:.22,heavy:.34,amber:.42,parry:.46,hurt:.5,kill:.3,form:.4,open:.45,stagger:.4,phase:.8,shatter:.9,felled:1}},
 rings:{pool:10},
 // Boss moments: slow motion (pace of the live clock), a radial flash, a shock ring, a short colour drain.
 moments:{
  // A BREAK or a STAGGER bites: a 60 ms freeze, then the clock eases back from half speed (the boss is open, so the
  // pause never eats a reaction window; replays and ticks are unchanged).
  open:{slow:.45,dur:.2,flash:0,ring:[3.2,.35],word:'impactBreak'},
  stagger:{slow:.45,dur:.18,flash:0,ring:[2.6,.3],word:'impactStagger'},
  phase:{slow:.3,dur:.65,flash:.5,ring:[14,.7],desat:0,word:null},
  shatter:{slow:.35,dur:.55,flash:.6,ring:[12,.6],desat:.45,word:'impactShatter'},
  felled:{slow:.18,dur:1.1,flash:.75,ring:[18,.9],desat:.65,word:'impactFelled'}
 },
 // top: the HUD band (share of the screen height: the hunter's box and the boss bar, on a phone a one-line HUD over it)
 // that BREAK words and damage numbers stay under; tall: a portrait phone, its boss bar under the hunter's box.
 words:{life:.9,px:64,pop:.1,top:.19,tall:.3},
 // Fairness guard: telegraphing bodies (inflated by their ring) stay readable under every overlay.
 guard:{alpha:.25,flash:.18,shake:.1,pad:1.4},
 colors:{chip:'#b7aab2',hit:'#fff6e4',crit:'#ffab3d',critHot:'#ffd98a',outline:'#120a12'}
};
