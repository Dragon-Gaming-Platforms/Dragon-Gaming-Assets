// Tuning constants, species table and upgrade tracks.
// Every designer knob lives here; no DOM, no canvas, no WebGL.
//
// World units are metres. The water surface is y = 0 and down is -y, so a
// "depth" in this file is a positive number of metres below the surface.

export const DAY_LENGTH = 150;        // seconds for a full day/night cycle
export const NIGHT_FROM = 0.58;       // fraction of the cycle where night starts
export const NIGHT_TO = 0.94;         // ...and ends

export const TIERS = {
  junk:      { rank: -1, label: 'Junk',      color: '#8b8f96' },
  common:    { rank: 0,  label: 'Common',    color: '#9fe6a0' },
  uncommon:  { rank: 1,  label: 'Uncommon',  color: '#6ec1ff' },
  rare:      { rank: 2,  label: 'Rare',      color: '#c79bff' },
  treasure:  { rank: 2,  label: 'Treasure',  color: '#ffd166' },
  legendary: { rank: 3,  label: 'Legendary', color: '#ff9f45' },
};

// band: [min, max] depth in metres where the species can be hooked.
// weight: relative spawn weight inside its band.
// len: [min, max] centimetres. value: coins for an average specimen.
// dodge: 0..1, how hard it fights in the reeling minigame.
// night: true = only after dark, false = only in daylight, undefined = any time.
//
// `skin` is albedo, not a flat fill. Every one of these is read through ambient
// + wrapped N.L + depth fog, each of which multiplies it down, so the dark end
// is lifted well above what the same species would be painted in a 2D scene.
// Nothing here goes below roughly #3a4658, or it turns to mud at 60 metres.
export const SPECIES = [
  { id: 'anchovy',   name: 'Anchovy',      tier: 'common',    band: [0, 17],   weight: 30, len: [6, 14],    value: 5,   dodge: 0.22, speed: 3.4, shape: 'fish',
    skin: ['#7fb8cc', '#eaf7fb'], body: { height: 0.30, width: 0.16, snout: 0.16, tail: 0.55 } },
  { id: 'sardine',   name: 'Sardine',      tier: 'common',    band: [0, 19],   weight: 26, len: [10, 22],   value: 8,   dodge: 0.28, speed: 3.8, shape: 'fish',
    skin: ['#98adc2', '#f2f7fc'], body: { height: 0.28, width: 0.15, snout: 0.18, tail: 0.58 } },
  { id: 'perch',     name: 'River Perch',  tier: 'common',    band: [0, 21],   weight: 20, len: [14, 32],   value: 13,  dodge: 0.32, speed: 3.0, shape: 'fish',
    skin: ['#87b563', '#e0edc2'], body: { height: 0.40, width: 0.19, snout: 0.20, tail: 0.52 } },
  { id: 'mackerel',  name: 'Mackerel',     tier: 'uncommon',  band: [4, 26],   weight: 13, len: [25, 48],   value: 24,  dodge: 0.42, speed: 4.6, shape: 'fish',
    skin: ['#5b8db8', '#d3ecf7'], body: { height: 0.30, width: 0.17, snout: 0.22, tail: 0.62 } },
  { id: 'can',       name: 'Rusty Can',    tier: 'junk',      band: [0, 26],   weight: 10, len: [10, 14],   value: 2,   dodge: 0.10, speed: 0,   shape: 'can',
    skin: ['#b0764c', '#dcbb95'] },
  { id: 'kelp',      name: 'Tangled Kelp', tier: 'junk',      band: [0, 32],   weight: 9,  len: [40, 90],   value: 3,   dodge: 0.14, speed: 0.4, shape: 'kelp',
    skin: ['#5f8f4c', '#8cc471'] },

  { id: 'bass',      name: 'Sea Bass',     tier: 'common',    band: [14, 36],  weight: 22, len: [30, 62],   value: 30,  dodge: 0.40, speed: 4.0, shape: 'fish',
    skin: ['#7e93a8', '#dbe6f0'], body: { height: 0.36, width: 0.19, snout: 0.22, tail: 0.55 } },
  { id: 'snapper',   name: 'Red Snapper',  tier: 'common',    band: [16, 38],  weight: 16, len: [28, 58],   value: 36,  dodge: 0.44, speed: 4.2, shape: 'fish',
    skin: ['#d05f4a', '#f6b9a4'], body: { height: 0.42, width: 0.20, snout: 0.19, tail: 0.50 } },
  { id: 'squid',     name: 'Reef Squid',   tier: 'uncommon',  band: [18, 42],  weight: 14, len: [20, 52],   value: 42,  dodge: 0.55, speed: 3.6, shape: 'squid',
    skin: ['#bf7aa8', '#f6d2e6'] },
  { id: 'puffer',    name: 'Pufferfish',   tier: 'uncommon',  band: [15, 40],  weight: 10, len: [15, 34],   value: 48,  dodge: 0.60, speed: 2.2, shape: 'puffer',
    skin: ['#dcbc6a', '#f9ecb6'] },
  { id: 'jelly',     name: 'Moon Jelly',   tier: 'uncommon',  band: [12, 40],  weight: 12, len: [18, 44],   value: 40,  dodge: 0.20, speed: 1.4, shape: 'jelly', night: true,
    skin: ['#aec3ff', '#eef2ff'], glow: '#9fb8ff' },
  { id: 'boot',      name: 'Old Boot',     tier: 'junk',      band: [14, 46],  weight: 8,  len: [26, 34],   value: 4,   dodge: 0.12, speed: 0,   shape: 'boot',
    skin: ['#6a5546', '#96806c'] },

  { id: 'tuna',      name: 'Bluefin Tuna', tier: 'rare',      band: [32, 58],  weight: 10, len: [60, 150],  value: 95,  dodge: 0.52, speed: 6.2, shape: 'fish',
    skin: ['#4d78a1', '#c2dcee'], body: { height: 0.32, width: 0.20, snout: 0.24, tail: 0.66 } },
  { id: 'swordfish', name: 'Swordfish',    tier: 'rare',      band: [34, 62],  weight: 7,  len: [90, 210],  value: 140, dodge: 0.66, speed: 7.0, shape: 'bill',
    skin: ['#4a6485', '#c3d2e4'], body: { height: 0.26, width: 0.16, snout: 0.26, tail: 0.70 } },
  { id: 'manta',     name: 'Manta Ray',    tier: 'rare',      band: [30, 60],  weight: 6,  len: [110, 260], value: 165, dodge: 0.36, speed: 2.6, shape: 'manta',
    skin: ['#4a5871', '#b3c3d8'] },
  { id: 'lantern',   name: 'Lanternfish',  tier: 'uncommon',  band: [30, 64],  weight: 12, len: [8, 20],    value: 58,  dodge: 0.70, speed: 4.4, shape: 'fish', night: true,
    skin: ['#46607c', '#8ef0de'], body: { height: 0.34, width: 0.18, snout: 0.18, tail: 0.56 }, glow: '#7de3d1' },
  { id: 'chest',     name: 'Sunken Chest', tier: 'treasure',  band: [30, 72],  weight: 3,  len: [50, 70],   value: 220, dodge: 0.30, speed: 0,   shape: 'chest',
    skin: ['#9a6535', '#e8c283'], glow: '#ffd98a' },

  { id: 'gulper',    name: 'Gulper Eel',   tier: 'rare',      band: [52, 78],  weight: 7,  len: [40, 130],  value: 210, dodge: 0.60, speed: 3.0, shape: 'eel',
    skin: ['#465470', '#8ea3c4'] },
  { id: 'angler',    name: 'Anglerfish',   tier: 'rare',      band: [54, 80],  weight: 9,  len: [20, 55],   value: 245, dodge: 0.74, speed: 2.4, shape: 'angler',
    skin: ['#54446b', '#d3b6ff'], glow: '#c9a6ff' },
  { id: 'kraken',    name: 'Giant Squid',  tier: 'legendary', band: [58, 82],  weight: 4,  len: [200, 520], value: 430, dodge: 0.70, speed: 4.0, shape: 'squid',
    skin: ['#8f4570', '#f0a8c8'] },
  { id: 'coelacanth',name: 'Coelacanth',   tier: 'legendary', band: [60, 82],  weight: 3,  len: [100, 205], value: 560, dodge: 0.62, speed: 2.8, shape: 'fish',
    skin: ['#5c8570', '#b6e6cc'], body: { height: 0.38, width: 0.23, snout: 0.22, tail: 0.48 } },
  { id: 'koi',       name: 'Golden Koi',   tier: 'legendary', band: [56, 82],  weight: 2,  len: [30, 78],   value: 820, dodge: 0.80, speed: 5.2, shape: 'fish', night: true,
    skin: ['#e0a72c', '#fff0bc'], body: { height: 0.36, width: 0.20, snout: 0.18, tail: 0.60 }, glow: '#ffe9a3' },
];

export const SPECIES_BY_ID = Object.fromEntries(SPECIES.map((s) => [s.id, s]));

// Four upgrade tracks, five levels each. price[0] is unused (you start at level 0).
export const UPGRADES = [
  {
    id: 'rod', name: 'Rod', icon: '🎣',
    blurb: 'A longer rod keeps a wider stretch of line under control.',
    levels: ['Bamboo Pole', 'Fibreglass Rod', 'Carbon Rod', 'Tournament Rod', 'Leviathan Rod'],
    price: [0, 130, 360, 850, 1900],
    effect: (lv) => `control bar ${[92, 106, 122, 140, 160][lv]}px`,
  },
  {
    id: 'line', name: 'Line', icon: '🧵',
    blurb: 'More line on the spool means you can fish deeper water.',
    levels: ['Cotton Line', 'Nylon Line', 'Braided Line', 'Deepwater Line', 'Abyssal Line'],
    price: [0, 160, 430, 1050, 2400],
    effect: (lv) => `reach ${[23, 36, 50, 66, 82][lv]} m`,
  },
  {
    id: 'reel', name: 'Reel', icon: '⚙️',
    blurb: 'A geared reel gains line faster while the fish is on target.',
    levels: ['Hand Crank', 'Spin Reel', 'Baitcaster', 'Drag Reel', 'Deep Winch'],
    price: [0, 140, 380, 900, 2050],
    effect: (lv) => `+${Math.round(([0.30, 0.35, 0.41, 0.48, 0.57][lv] / 0.30 - 1) * 100)}% reel-in`,
  },
  {
    id: 'bait', name: 'Bait', icon: '🪱',
    blurb: 'Better bait draws bites faster, and tempts rarer fish.',
    levels: ['Breadcrumbs', 'Earthworms', 'Live Shrimp', 'Squid Strips', 'Glowing Lure'],
    price: [0, 190, 500, 1200, 2700],
    effect: (lv) => `rarity x${[1, 1.3, 1.6, 2, 2.5][lv].toFixed(1)}`,
  },
];

export const STATS = {
  barHeight: [92, 106, 122, 140, 160],    // rod, in HUD pixels
  maxDepth:  [23, 36, 50, 66, 82],        // line, in metres
  reelRate:  [0.30, 0.35, 0.41, 0.48, 0.57], // reel: progress per second on target
  rarity:    [1, 1.3, 1.6, 2, 2.5],       // bait
  biteSpeed: [1, 1.12, 1.26, 1.42, 1.6],  // bait also speeds bites up
};

// How hard each tier pulls back on the reel. Bigger = longer fight.
export const TOUGHNESS = {
  junk: 0.5, common: 1.0, uncommon: 1.3, rare: 1.8, treasure: 1.25, legendary: 2.4,
};

export const REEL = {
  trackH: 320,          // pixels of the tension track
  gravity: 980,         // bar falls at this rate
  lift: 2050,           // upward acceleration while holding
  damping: 0.90,        // velocity retained per frame-equivalent on release
  drain: 0.30,          // progress lost per second off target
  escapeGrace: 0.9,     // seconds at empty before the fish is gone
  graceRecover: 0.55,   // that meter only drains back this fast, so repeated
                        // dips accumulate instead of resetting for free
  maxFight: 45,         // hard cap: past this the line snaps
};

export const CAST = {
  chargeRate: 1.35,     // power meter fills this fast (0..1 per second)
  minPower: 0.12,
  sinkSpeed: 11,        // metres per second the hook descends
  steer: 7.5,           // metres per second of lateral control
  biteWindow: 1.15,     // seconds to strike once a fish bites
  minRange: 7,          // metres out from the boat at minimum power
  maxRange: 30,         // ...and at full power
  minSeabed: 12,        // seabed depth under the closest cast, shallow
                        // enough that a starting line still touches bottom
  maxSeabed: 84,        // ...and under the furthest
};

// The slab of water fish are simulated in, relative to the hook. It is sized
// to the camera: at 10 m back with a 60-degree lens you see about 12 m across,
// so a wider slab just puts most of the shoal outside the frame.
export const WORLD = {
  halfWidth: 13,        // metres either side of the line, along x
  halfDepthZ: 7.5,      // metres in front of and behind the line, along z
  boat: { x: 0, z: 0 },
  rodTip: { x: 1.25, y: 2.15, z: 0.1 },
};
