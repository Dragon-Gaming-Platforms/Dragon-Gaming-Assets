// Rules-v4 possession (M4, BOSS-DESIGN 'Possession rules'). Beating a boss takes its mask: a possession form
// (a 10 s burst fed by the Mask Ember meter) and a permanent Echo. Frames at 60 Hz, distances in tiles, damage at
// the unchanged hero scale (Brute punch 3; its punch combo is 9 per 51f, about 10.6 DPS; needle reach 1.95 tiles).
import {KINDS} from './kinds.js';
import {HUSK} from './forms5.js';
import {RENDERER,RENDERER_ECHO} from './form-tallowgrave.js';
import {ANTIPHON_FORM} from './antiphon-form.js';
import {ANCHORITE_FORM,ANCHORITE_ECHO} from './form-anchorite.js';
import {BLOOM} from './crowned-bloom.js';
import {EXUVIAL_FORM} from './form-exuvial.js';
// Ids are only ever appended (old-glasswing stays index 0). v5 forms (FORMS5 in forms5.js) need rules v5.
export const FORM_IDS=['old-glasswing','chrysalis-husk','tallowgrave-form','antiphon-form','anchorite-form','crowned-bloom','exuvial-form'];
export const FORMS={
 'old-glasswing':{
  // Collision 1.4 x 2.4 tiles (inside the 1.5 x 3.2 limit); drawn 2.3x the hero's own height (Brute 3.9 tiles).
  w:1.4,h:2.4,visual:2.3,speed:6,jump:2.2,jumps:2,glide:150,
  // Exactly four moves, the boss's own attacks turned into player verbs.
  moves:{
   // Light (attack): Wing Sweep. 6 per 18f = 20 DPS (1.9x the Brute combo), 4.6 tiles of reach (2.4x the needle).
   sweep:{startup:5,active:5,total:18,damage:6,x0:-.5,x1:4.6,y0:0,y1:2.6,knock:.7,stop:4,step:.08},
   // Heavy (sword): Wing Slam. A body slam that launches minor enemies and sends amber floor waves both ways.
   slam:{startup:12,active:6,total:32,damage:10,x0:-2.6,x1:2.6,y0:-.3,y1:1.4,knock:.9,stop:6,plunge:-.45,launch:.22,stun:24,
    wave:{damage:4,speed:.24,range:9,radius:.3,y:.45}},
   // Movement (dodge): Moth Rush. 4.5 tiles through enemies, untouchable while it runs.
   rush:{startup:3,active:15,total:26,damage:5,speed:.3,cooldown:45,x0:-.6,x1:1.2,y0:0,y1:2.4,knock:1,stop:4},
   // Signature (blast or possess): Scale Storm. Three lanes of piercing amber scales. The form's unique capability:
   // its amber shots shatter enemy shots on contact, cyan (unparryable) ones included.
   storm:{startup:6,active:30,total:42,interval:5,damage:3,speed:.32,range:13,pierce:2,radius:.24,lanes:[.6,1.3,2],cooldown:90}
  }
 },
 // Rules v5 (M1-D): the Chrysalis Husk, four moves; its numbers and move descriptors live in forms5.js.
 'chrysalis-husk':HUSK,
 // Rules v5: the Renderer, Tallowgrave's mask (src/data/form-tallowgrave.js).
 'tallowgrave-form':RENDERER,
 // Rules v5: the Antiphon (the Drowned Antiphon's mask), four moves; its numbers live in antiphon-form.js.
 'antiphon-form':ANTIPHON_FORM,
 // Rules v5: The Anchorite, the Hourglass Anchorite's mask in the Hub (src/data/form-anchorite.js).
 'anchorite-form':ANCHORITE_FORM,
 // Cordycea's mask, the Crowned Bloom (rules v5): its numbers live in crowned-bloom.js.
 'crowned-bloom':BLOOM,
 // Rules v5: the Exuvial's form (src/data/form-exuvial.js).
 'exuvial-form':EXUVIAL_FORM
};
// The form's drawn height in tiles for a hunter of this kind.
export const formVisual=(id,kind)=>FORMS[id].visual*(KINDS[kind]?.height||KINDS.brawler.height);
// Echoes: permanent passives of an owned mask. Old Glasswing gives one extra mid-air flap.
// The Chrysalis Husk's Echo, the Amber Thread, lands in M2 (player.js keeps reading ECHOES['old-glasswing']).
export const ECHOES={'old-glasswing':{flaps:1,flash:14},'chrysalis-husk':{id:'amber-thread',ready:false},'tallowgrave-form':RENDERER_ECHO,'antiphon-form':{id:'undertow',ready:false},'anchorite-form':ANCHORITE_ECHO,'crowned-bloom':{id:'spore-bloom',ready:false},'exuvial-form':{id:'shed-skin',ready:false}};
// burst/shift/shellCost/cooldowns in frames; budget and chipCap are shares of the boss's max HP.
export const POSSESSION={burst:600,shift:20,shell:3,shellCost:120,shellInv:24,breakStun:40,cooldown:1200,trialCooldown:180,
 hold:18,pick:20,budget:.12,chipCap:.03};
// Mask Ember, in percent of the meter. outside: fill multiplier away from bosses; pilgrim: the assist tier's multiplier.
export const EMBER={max:100,parry:20,hit:4,cap:15,calm:10,calmFrames:900,drain:25,outside:2,pilgrim:1.5};
// Hall of Masks: Mask Trial waves (wild kinds, escalating) and Rematch.
export const HALL={firstDelay:60,gap:90,max:8,hpStep:.12,eliteFrom:3,elite:.1,eliteMax:.6,spacing:1.3,edge:2,skimmerY:3,
 fall:-1.5,repair:1,kinds:['brawler','skimmer','spark'],tiers:['normal','hard']};
