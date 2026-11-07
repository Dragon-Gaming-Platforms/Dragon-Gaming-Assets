// Rules v5 hero tech (src/game/hero5.js): the Winged glaive chain, aerial skims, a pogo for every form,
// buffered dash-cancels and a jump buffered through the dash. Frames at 60 Hz, distances in tiles.
// Rules 1-4 never read this file's numbers: every use sits behind rules5(s).
export const rules5=s=>s.config.rulesVersion>=5;

// Same frame rectangle builder as moves.js (feet-relative, x forward, w reach), plus v5 fields:
// link: the frame from which a queued press starts the next chain move; mult: damage multiplier;
// center: the box is centred on the body (hits both sides; its x is -w/2, so x+w is the reach each side); launch: lifts a wild monster; pogo: bounces.
const move=(startup,active,total,stat,w,y,h,knock=.5,stop=3,extra={})=>({startup,active,total,stat,...extra,
 frames:Array.from({length:total},(_,i)=>i>=startup&&i<startup+active?{x:extra.center?-w/2:.15,y,w,h,damage:1,knock,stop}:null)});

// Winged (skimmer) glaive chain on the sword button: cut, back-cut, then the Moth Wheel, a spinning
// finisher that hits both sides for x1.5. 2+2+3 in 42 frames when linked = 10 per second (the rules-4 Winged
// sword was 2 in 20 = 6); the Brute's punch chain is 9 in 51 = 10.6 with shorter reach and 5 masks to the Winged's 4.
export const MOVES5={
 glaive1:move(4,4,14,'sword',2.1,.35,.85,.45,4,{link:10}),
 glaive2:move(4,4,14,'sword',2.1,.25,1,.45,4,{link:10}),
 glaive3:move(6,6,22,'sword',4.4,.1,1.5,1,9,{center:true,mult:1.5,launch:.18}),
 // In the air: a skimming cut whose hits hold the Winged aloft (HERO5.skims per airtime).
 airglaive:move(3,5,14,'sword',2,-.6,1.9,.45,4),
 // Every form: a downward strike that bounces off enemies, bosses and enemy shots (Hollow Knight's pogo).
 pogo:move(3,12,18,'sword',1.1,-.95,1.35,.1,5,{center:true,pogo:true})
};
// The atlas clips that draw the v5 moves (renderer only).
export const CLIP5={glaive1:'sword',glaive2:'punch2',glaive3:'punch3',airglaive:'sword',pogo:'downsword'};
export const GLAIVE_NEXT={glaive1:'glaive2',glaive2:'glaive3'};

export const HERO5={
 // A dodge press is kept this many ticks while the dash cools down or the hero is stunned.
 dashBuffer:8,
 // Dash-cancel: out of a move that landed, once its active frames are over, the dash cools down faster.
 cancelCd:30,
 // A jump pressed in the last frames of a dash fires the tick it ends.
 dashJump:8,
 // Chain window: the next glaive cut follows within this many ticks of the last one ending.
 chainWindow:20,
 // Aerial skim: each air hit lifts at least this fast, then hangs (falls no faster than a glide) for
 // skimHang ticks; at most skims times before landing.
 skimLift:.18,skimHang:14,skims:3,
 // Pogo: bounce speed (the v4 downsword is .52), and the shot-pogo's untouchable ticks.
 pogoSpeed:.56,hazardInv:6,
 // Damage per kind and stat (multiplies KINDS): the Winged's jab and kick were 1 and 2.
 kind:{skimmer:{punch:2,kick:1.5}}
};
