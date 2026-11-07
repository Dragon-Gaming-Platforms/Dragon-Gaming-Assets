// Rules-v4 moults: five body slots, two branches each. A second pick of the same branch deepens it ('<id>-deep').
// Ids are the render contract read by src/render2d/overlays.js.
export const SLOTS=['horns','back','arms','legs','sigil'];
export const MOULTS={
 'horns-ram':'horns','horns-lantern':'horns',
 'back-rook':'back','back-bone':'back',
 'arms-hook':'arms','arms-ember':'arms',
 'legs-talon':'legs','tail-root':'legs',
 'sigil-kiln':'sigil','sigil-patient':'sigil'
};
export const MOULT_IDS=Object.keys(MOULTS);
export const AFFINITY={
 brawler:['horns-ram','back-bone','arms-ember','tail-root','sigil-kiln'],
 skimmer:['back-rook','arms-hook','legs-talon','horns-lantern','sigil-patient'],
 spark:['horns-lantern','arms-ember','back-rook','sigil-kiln','sigil-patient']
};
// [normal, deep]. Raw damage bonuses (lantern, heavy fists) share one +30% cap.
export const MV={
 damageCap:.3,
 gore:[2,3],goreStun:[0,24],
 lantern:[.1,.15],lanternRange:[2,3.5],
 rookJumps:[1,1],rookInv:[8,14],rookCooldown:[1,.75],
 boneCost:[.7,.5],boneKnock:[1,0],
 hookSlide:[.06,.02],hookPush:[1.1,1.4],hookFrames:10,
 emberEvery:[3,2],emberDamage:[2,3],emberSpeed:.2,emberRange:6,
 talonJump:[1.15,1.28],talonPogo:[1.2,1.35],
 rootDamage:[2,3],rootRadius:[1.6,2.3],rootKnock:[.4,0],rootFall:-.3,rootStun:[0,30],
 kiln:[3.5,4],patientKills:[8,5]
};
export const XP={wild:2,elite:5,base:8,step:2,draftDelay:24,cards:3};
export const xpNext=level=>XP.base+XP.step*(level-1);
