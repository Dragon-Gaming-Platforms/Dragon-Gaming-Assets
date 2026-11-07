import {MOULTS,MOULT_IDS,AFFINITY} from './moults.js';
// Verb moults (package moults5, roadmap M2 "verb moults"): five more branches, one per body slot, each a NEW VERB
// (a new thing you press), not a stat. Only runs whose config carries `moults5: true` (rules 4+, not versus) draft them;
// every other run, replay and digest is unchanged. A second pick deepens a verb ('<id>-deep') like any moult.
// Ids are the render contract read by src/render2d/overlays.js (the prefix picks the body slot).
export const VERBS={
 'horns-charge':'horns', // Battering Brow: Down + Dodge on the ground, a charging headbutt that strips armour
 'back-spines':'back',   // Glass Spines: a perfect parry fires glass shards at the attacker
 'arms-tether':'arms',   // Tether Claw: Block in the air throws a claw that pulls you to walls/ledges/big foes, or small foes to you
 'legs-cricket':'legs',  // Cricket Legs: hold Block until the legs glow, then Jump, a charged high jump
 'sigil-shell':'sigil'   // Shell Drop: Down + Dodge in the air, a plummet whose landing quake stuns and bounces you up
};
export const VERB_IDS=Object.keys(VERBS);
export const MOULTS5={...MOULTS,...VERBS};
export const MOULT5_IDS=MOULT_IDS.concat(VERB_IDS);
// Glass Spines shards are pooled projectiles of this colour (the renderer draws them as glass splinters).
export const SHARD='#E8F6F2';
// Each kind's affinity gains the two verbs that suit its body.
export const AFFINITY5={
 brawler:AFFINITY.brawler.concat(['horns-charge','sigil-shell']),
 skimmer:AFFINITY.skimmer.concat(['arms-tether','legs-cricket']),
 spark:AFFINITY.spark.concat(['back-spines','arms-tether'])
};
// [normal, deep]. Frames at 60 Hz, distances in tiles, speeds in tiles per frame. Boss damage still goes through the
// boss's own opening and chip caps (a verb never bypasses them); none of these raise the shared +30% damage bonus.
export const VMV={
 // Tether Claw: the claw flies up and ahead (down and ahead while holding Down) for `reach` frames.
 tetherCd:[40,30],tetherReach:[10,14],tetherSpeed:.5,tetherRise:.18,tetherHit:.35,
 tetherPull:[.4,.5],tetherZip:26,tetherHop:.36,tetherStop:.4,tetherLedge:.6,tetherLip:1,
 // Jump out of a pull through terrain: the pull's sideways speed carries on as a fling of up to this many tiles.
 tetherFling:2.4,tetherFlingFrames:12,
 yankDamage:[1,1],yankStun:[30,45],yankMax:6,yankFrames:8,
 // Battering Brow: a readable 8f head-down windup, then a charge with no i-frames that stops on the first foe.
 ramWindup:8,ramFrames:[16,20],ramSpeed:.3,ramDamage:[4,6],ramStun:[30,45],ramKnock:1.2,ramRecoil:.5,ramCd:[60,48],
 // Cricket Legs: Block held this long (the legs glow), then Jump. Jump speed x leap (height ~ leap^2: x1.96 / x2.4).
 brace:[18,10],leap:[1.4,1.55],
 // Shell Drop: a 6f hang, then a fall at `shellFall`; the landing quake hits in a radius and bounces you.
 shellHang:6,shellFall:.7,shellMax:120,shellRadius:[2.2,3],shellDamage:[3,4],shellStun:[40,60],shellBounce:[.5,.6],shellCd:[45,36],shellRing:18,
 // Glass Spines: shards per perfect parry, fanned by `spineSpread` vertical speed per step.
 spines:[3,5],spineDamage:[1.5,2],spineSpeed:.28,spineSpread:.03,spineRange:7,spinePierce:[0,1],spineCd:12,
 // Wild foes hit by a verb lose their current swing and wait this long before the next one.
 interrupt:24,
 // A verb in progress ends if the player's ticks pause longer than this (forms, drafts); hit-stops are shorter.
 stale:30
};
