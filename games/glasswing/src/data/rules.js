import {KINDS} from './kinds.js';
// Rules 1-3 replay the Arcade game unchanged. Rules 4 adds tiers, XP, moults and the reworked Old Glasswing.
// Rules 5 adds the hero tech of src/data/hero5.js (Winged glaive chain, pogo, buffered dash-cancel); v4 stays as recorded.
export const RULES_VERSIONS=[1,2,3,4,5],CURRENT_RULES=5;
export const rules4=s=>s.config.rulesVersion>=4;
// Rules-v4 tiers reuse the stored difficulty keys: easy = Pilgrim (assist), normal = Hunter (default), hard = Glass.
// mask is the Brute's count; other kinds keep their ratio to the Brute's 6. tell scales boss tells.
export const TIERS={
 easy:{id:'pilgrim',mask:7,parry:10,tell:1.2,hp:1,tight:0},
 normal:{id:'hunter',mask:5,parry:9,tell:1,hp:1,tight:0},
 hard:{id:'glassTier',mask:4,parry:8,tell:1,hp:1.15,tight:1}
};
export const V4={invincible:40,parryInv:6,damage:1};
export const tierMask=(kind,difficulty)=>Math.ceil(KINDS[kind].mask*TIERS[difficulty].mask/KINDS.brawler.mask);
