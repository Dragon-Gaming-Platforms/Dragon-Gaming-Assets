import {RENDERER} from './form-tallowgrave.js';
import {ANCHORITE_FORM} from './form-anchorite.js';
import {BLOOM} from './crowned-bloom.js';
import {EXUVIAL_FORM} from './form-exuvial.js';
// Rules-v5 possession forms (M1-D). The CHRYSALIS HUSK: the Brute sealed in the Unborn Chrysalis's ivory shell, with
// four of the boss's own verbs (BOSS-DESIGN boss 1, possessionForm). Frames at 60 Hz, distances in tiles, damage at the
// hero scale (Brute punch 3; its punch combo is 9 per 51f, about 10.6 DPS; the needle reaches 1.95 tiles).
// Each move: input (the button that starts it), kind, cooldown (frames), damage, box (feet-relative, x forward).
// This file never imports forms.js: forms.js reads HUSK from here (FORM_IDS order is owned there).
import {ANTIPHON_FORM} from './antiphon-form.js';
export const HUSK={
 // Collision 1.5 x 3.0 tiles (inside the 1.5 x 3.2 limit); drawn 2.2x the hero's height. Heavy: slower, one air jump.
 w:1.5,h:3,visual:2.2,speed:5.2,jump:2.4,jumps:2,glide:0,
 moves:{
  // PENDULUM LARIAT (attack, hold): wind up to 40f, release a full spin of the shell on its cord that strikes both sides.
  // A tap is the 6-damage spin (2x the Brute punch): 6 per 18f = 20 DPS (1.9x the Brute combo), 4 tiles each way (2x the
  // needle). A full wind adds 10 damage and carries the hunter forward at up to .16 tiles/frame. The spinning ring swats
 // enemy shots out of the air (not cyan ones). The shell takes half damage: 3 plates hold six 1-mask hits.
  lariat:{input:'attack',kind:'spin',cooldown:0,damage:6,box:{x0:-4,x1:4,y0:0,y1:2.6},
   startup:3,active:9,total:18,wind:40,windDamage:10,windSpeed:.6,carry:.16,knock:.9,stop:4},
  // WALL STRIKE (sword): leap and slam. A shock runs along the floor both ways and debris drops on enemies near you.
  wall:{input:'sword',kind:'leap',cooldown:30,damage:10,box:{x0:-2.6,x1:2.6,y0:-.3,y1:1.6},
   leap:.36,rise:10,drift:.1,plunge:-.6,fall:90,recover:14,knock:1,stop:6,launch:.22,stun:24,
   shock:{damage:4,speed:.26,range:9,h:.9,radius:.3},debris:{damage:4,range:7,height:5,speed:-.32,radius:.4,count:4}},
  // GUM SPIT (blast or possess): an amber glob. It roots minor enemies for 60f (e.rootT); on bosskit bosses it slows them
  // by 30% for 2 s (e.slowT, e.slow); on the v4 Chrysalis (and the M3 Old Glasswing) it only deals damage.
  gum:{input:'blast',kind:'shot',cooldown:50,damage:4,box:{r:.32,y:.62},startup:6,total:20,speed:.3,range:11,
   root:60,slow:.3,slowFrames:120},
  // SHELL SHUT (dodge, hold): the shell closes for up to 45f and blocks EVERY hit, cyan included; then an automatic
  // counter-shove both ways (+4 damage per blocked hit, up to 3). 180f cooldown from the counter.
  shut:{input:'dodge',kind:'guard',cooldown:180,damage:8,box:{x0:-2.4,x1:2.4,y0:0,y1:2.8},
   hold:45,min:10,counter:6,total:20,bonus:4,bonusMax:3,knock:1.4,stun:30,stop:6,quiet:8}
 }
};
// v5 forms by id (possession.js dispatches to src/game/possession5.js when the worn form is listed here).
export const FORMS5={'chrysalis-husk':HUSK,'tallowgrave-form':RENDERER,'antiphon-form':ANTIPHON_FORM,'anchorite-form':ANCHORITE_FORM,'crowned-bloom':BLOOM,'exuvial-form':EXUVIAL_FORM};
// The gate: rules v5, or (until M1-A lands rules v5) a rules-4 run with the config key husk:true.
export const huskRules=config=>config.rulesVersion>=5||config.rulesVersion>=4&&config.husk===true;
