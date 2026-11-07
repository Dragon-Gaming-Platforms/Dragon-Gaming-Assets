// Sound pass data (live side only): mix, impact weights, telegraph colours, stingers and per-boss music.
// Nothing here is imported by the simulation; changing it never changes a digest.

// Mix levels in [0,1]. Buses: sfx (settings.sound), cues (settings.cues: tells, stingers, heartbeat), music (settings.music).
export const MIX={
 master:.9,reverb:.32,impactDrive:2.2,voices:48,
 // Music ducks under big moments (sidechain feel) and muffles while paused or near death.
 // A sharp (non-soft) telegraph dips the score too, so the tell reads over a loud layer-4 score.
 duck:{hit:[.22,.36,.5,.68],parry:.7,stinger:.55,kill:1,tell:.3,recover:.35},
 muffle:{open:16000,pause:700,danger:1500},
 // A cue name heard again inside this window (seconds) is dropped: steps, swings and double contacts.
 repeat:{default:.045,'step1':.09,'step2':.09,'menu-move':.03,'enemy-telegraph':.06}
};

// Hit weight from the attacker's move (0 chip, 1 light, 2 heavy, 3 crushing).
export const MOVE_WEIGHT={punch1:1,punch2:1,punch3:2,kick:2,divekick:2,sword:2,downsword:1,blast:1};
export const WEIGHT={
 // A boss hit that removes at least this share of max HP counts one heavier; chip below `chip` is a bone tick.
 bossHeavy:.03,chip:.004,
 // Rules v1-3 wild enemies have 6 HP: a hit of 4+ is heavy.
 wildHeavy:4
};

// Telegraph colour grammar by ear: ivory = parryable (bright chime), cyan = unparryable (cold glass shriek).
export const TELL={
 ivory:{notes:[1318.5,1975.5],boss:[659.3],decay:.62,gain:.2},
 cyan:{notes:[2793,2960,4186],glide:1.08,decay:.48,gain:.15,tremolo:27},
 // The strike leaves the tell: an ivory 'shing' or a cyan crack, so the parry moment is audible too.
 release:{ivory:2637,cyan:1180}
};

// Named cues new bosses (or the renderer/UI) may emit; each has a patch in synth.js. A boss sim behind its own
// config key may emitSound() these names (new configs have new digests); old configs never emit them.
export const HOOK_CUES=[
 'tell-ivory','tell-cyan','tell-delayed','strike-ivory','strike-cyan',
 'boss-phase','boss-desperation','boss-opening','boss-break','boss-kill','enemy-kill',
 'tallowgrave-snuff','tallowgrave-ignite','antiphon-echo','antiphon-mirror',
 'anchorite-turn','anchorite-tick','cordycea-bloom','cordycea-wall','exuvial-hook','exuvial-shed'
];
// Cues that go to the readability bus (settings.cues) rather than the effects bus.
export const CUE_BUS=new Set(['enemy-telegraph','tell-ivory','tell-cyan','tell-delayed','strike-ivory','strike-cyan',
 'boss-phase','boss-desperation','boss-opening','boss-kill','heartbeat','boss-roar']);

// Heartbeat below one mask (or in Glass): beats per second.
export const HEART={rate:1.15,glassRate:1.6,gain:.55};

// Music. Scale degrees index `scale` (negative or past 7 wrap octaves); null is a rest. 16 steps per bar.
// Layers by intensity: 0 pad, 1 + bass pulse, 2 + drums, 3 + motif, 4 + storm (16th arp, cyan shimmer, double hats).
export const LAYERS=['pad','bass','drums','motif','storm'];
const AEOLIAN=[0,2,3,5,7,8,10],DORIAN=[0,2,3,5,7,9,10],PHRYGIAN=[0,1,3,5,7,8,10],HARMONIC=[0,2,3,5,7,8,11],
 LOCRIAN=[0,1,3,5,6,8,10],LYDIAN=[0,2,4,6,7,9,11],PHRYG_DOM=[0,1,4,5,7,8,10];
const _=null;
export const THEMES={
 title:{root:50,scale:DORIAN,bpm:64,prog:[0,3,5,4],pad:'triangle',lead:'sine',cutoff:1400,swing:0,
  motif:[4,_,_,_,2,_,_,_,3,_,1,_,0,_,_,_],bass:[0,_,_,_,_,_,_,_,0,_,_,_,_,_,_,_],kit:'soft'},
 forest:{root:45,scale:AEOLIAN,bpm:84,prog:[0,5,3,4],pad:'triangle',lead:'triangle',cutoff:1800,swing:.08,
  motif:[0,_,2,_,4,_,_,3,_,_,2,_,1,_,_,_],bass:[0,_,_,0,_,_,4,_,0,_,_,0,_,_,3,_],kit:'soft'},
 hollow:{root:40,scale:PHRYGIAN,bpm:78,prog:[0,1,0,6],pad:'sawtooth',lead:'triangle',cutoff:1100,swing:0,
  motif:[4,_,_,5,4,_,_,_,1,_,_,_,0,_,_,_],bass:[0,_,_,_,0,_,_,1,0,_,_,_,0,_,_,6],kit:'deep'},
 trial:{root:43,scale:AEOLIAN,bpm:120,prog:[0,5,6,4],pad:'sawtooth',lead:'square',cutoff:2400,swing:0,
  motif:[0,_,0,2,_,3,_,4,_,4,3,_,2,_,1,_],bass:[0,_,0,_,0,_,0,7,0,_,0,_,0,_,4,_],kit:'drive'},
 // The Imago / Old Glasswing (rules v4 with no boss key, and the v1-3 boss).
 imago:{root:45,scale:HARMONIC,bpm:104,prog:[0,5,3,4],pad:'sawtooth',lead:'square',cutoff:2600,swing:0,
  motif:[0,_,4,_,7,_,6,4,5,_,4,_,3,_,1,_],bass:[0,_,0,_,0,0,_,0,4,_,4,_,5,_,6,_],kit:'drive',stinger:[0,3,7,11]},
 // The Unborn Chrysalis: a lilting pendulum (swung), Phrygian, glassy.
 chrysalis:{root:38,scale:PHRYGIAN,bpm:88,prog:[0,1,6,0],pad:'triangle',lead:'triangle',cutoff:2100,swing:.33,
  motif:[7,_,_,8,7,_,4,_,_,5,4,_,1,_,0,_],bass:[0,_,_,_,_,_,0,_,4,_,_,_,_,_,1,_],kit:'pendulum',stinger:[0,1,7,10]},
 // The finished Chrysalis: the same pendulum, a little faster and darker, the swing deeper.
 chrysalis5:{root:37,scale:PHRYGIAN,bpm:92,prog:[0,1,6,0],pad:'triangle',lead:'triangle',cutoff:1900,swing:.36,
  motif:[7,_,_,8,7,_,4,_,_,5,4,_,1,_,0,_],bass:[0,_,_,_,_,_,0,_,4,_,_,_,_,_,1,_],kit:'pendulum',stinger:[0,1,7,10]},
 tallowgrave:{root:37,scale:LOCRIAN,bpm:70,prog:[0,4,1,0],pad:'square',lead:'sine',cutoff:900,swing:0,
  motif:[0,_,_,_,1,_,_,_,4,_,_,3,_,_,1,_],bass:[0,_,_,_,_,_,_,_,0,_,_,4,_,_,_,_],kit:'deep',stinger:[0,1,6,10]},
 antiphon:{root:42,scale:DORIAN,bpm:92,prog:[0,3,0,6],pad:'triangle',lead:'sine',cutoff:1900,swing:.12,echo:.42,
  motif:[4,_,3,_,2,_,_,_,_,_,_,_,2,_,3,4],bass:[0,_,_,_,0,_,_,_,3,_,_,_,6,_,_,_],kit:'soft',stinger:[0,2,7,9]},
 anchorite:{root:46,scale:LYDIAN,bpm:100,prog:[0,1,0,4],pad:'sawtooth',lead:'triangle',cutoff:2000,swing:0,clock:true,
  motif:[0,1,2,3,_,_,4,_,3,2,1,_,0,_,_,_],bass:[0,_,_,0,_,_,0,_,1,_,_,1,_,_,1,_],kit:'clock',stinger:[0,4,6,11]},
 cordycea:{root:43,scale:PHRYG_DOM,bpm:90,prog:[0,1,3,1],pad:'triangle',lead:'square',cutoff:1500,swing:.18,
  motif:[0,_,1,_,2,_,1,0,_,_,4,_,5,4,2,_],bass:[0,_,0,1,_,_,0,_,0,_,0,1,_,_,4,_],kit:'deep',stinger:[0,1,4,8]},
 exuvial:{root:35,scale:LOCRIAN,bpm:120,prog:[0,1,4,0],pad:'sawtooth',lead:'square',cutoff:2800,swing:0,
  motif:[0,0,_,1,0,_,4,_,3,_,1,_,0,_,6,_],bass:[0,0,_,0,0,_,1,_,0,0,_,0,4,_,1,_],kit:'drive',stinger:[0,1,6,7]},
 heir:{root:48,scale:HARMONIC,bpm:112,prog:[0,5,1,4],pad:'sawtooth',lead:'square',cutoff:3000,swing:0,
  motif:[7,_,6,_,4,_,7,_,8,_,7,_,6,4,3,_],bass:[0,_,0,7,0,_,0,_,5,_,5,7,4,_,4,_],kit:'drive',stinger:[0,3,6,11]}
};
// Drum kits: 16-step patterns per voice (1 = hit, .5 = ghost) at intensity 2; intensity 4 doubles the hats.
const k='kick',s='snare',h='hat';
export const KITS={
 soft:{[k]:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],[s]:[0,0,0,0,0,0,0,0,0,0,0,0,.6,0,0,0],[h]:[0,0,.4,0,0,0,.4,0,0,0,.4,0,0,0,.4,0]},
 deep:{[k]:[1,0,0,0,0,0,0,.5,1,0,0,0,0,0,0,0],[s]:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],[h]:[.3,0,.3,0,.3,0,.3,0,.3,0,.3,0,.3,0,.3,0]},
 drive:{[k]:[1,0,0,0,1,0,0,.5,1,0,.5,0,1,0,0,0],[s]:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,.5],[h]:[.5,0,.5,0,.5,0,.5,0,.5,0,.5,0,.5,0,.5,.3]},
 pendulum:{[k]:[1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0],[s]:[0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],[h]:[0,0,.4,0,.4,0,0,0,.4,0,.4,0,.4,0,0,0]},
 clock:{[k]:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],[s]:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],[h]:[.6,.3,.6,.3,.6,.3,.6,.3,.6,.3,.6,.3,.6,.3,.6,.3]}
};
// Music intensity: away from bosses by nearby threat; in a boss fight by phase (desperation = 4).
export const INTENSITY={near:14,crowd:3,boss:[2,2,3,4],desperation:4,fade:.9,themeFade:.7};
