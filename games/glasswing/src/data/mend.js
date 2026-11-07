// Mend (config.mend, rules 4 and later; BOSS-DESIGN 'Difficulty framework' 8 and 'Possession rules'): a Hollow
// Knight-like focus heal paid with Mask Ember. Frames at 60 Hz, ember in percent of the meter (src/data/forms.js EMBER).
// channel: frames held still before one mask mends (66f, about 1.1 s). cost: ember paid when the channel starts, and lost
// if it breaks: half the ring is one Mend, a full ring is two Mends or one form. pulses: channel frames of the three
// rising notes (the last one tells the heal is about to land). flash: frames of the mended burst. shove: tiles the body may
// be pushed before the channel breaks (a knockback, a teammate's leash, a respawn). chord: frames either key of the
// Down + Mask chord may lead the other (human chords are rarely on one frame): a Mask press that took no form still
// mends when Down follows within it, and on a one-way floor a Down press is held back that long (only while a Mend is
// affordable) so it does not drop the hunter through before Mask arrives.
export const MEND={channel:66,cost:50,heal:1,pulses:[0,22,44],flash:30,fail:18,broken:24,shove:.25,chord:4};
// Boss Mend punishes (BOSS-DESIGN 'Difficulty framework' 4), one row per boss id; a boss without a row ignores Mends.
// While a hunter mends, a boss in neutral cuts its wait to `gap` frames and its next pick is `patterns[tier]` (tier =
// phase - 1, 3 in desperation; null keeps the usual pick). The Chrysalis reels down on the mender in P1 (creak, lift,
// sway after them, drop: about 2 s, so one Mend lands but a chained one is caught unless the hunter breaks it and
// dodges the drop, which cracks the shell open), reels then strings tripwires in P2, and the unborn flails in P3.
// A reel that creaks over a mending hunter hunts them: its shadow sways `shadow` tiles a frame (0.08 otherwise) up to
// `reach` tiles from the anchor (6 otherwise), so the corners under the ledges are no safe place to mend.
export const MEND_REPLY={chrysalis:{gap:6,patterns:['reel','reelcork','flail',null],shadow:.3,reach:8}};
// Mend cues for the tone bank (src/ui/audio.js): three rising notes, the mended chime, a dull break and a dry fizzle.
// The full-ring cue of mend runs replaces the altar chime.
export const MEND_CUES=['mend1','mend2','mend3','mend','mend-break','mend-fail','ember-full'];
