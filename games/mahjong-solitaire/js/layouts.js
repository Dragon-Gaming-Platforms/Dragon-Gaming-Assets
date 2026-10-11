/**
 * Board layouts.
 *
 * A slot is {x, y, z} in *cell* units, where one tile covers 1x1 cell. Halves
 * are legal and are what gives mahjong layouts their characteristic overhangs,
 * so the engine works in half-cells internally (see engine.js).
 *
 * Every layout holds exactly 144 slots — one full mahjong set — and every slot
 * above z=0 rests on tiles below it, so nothing floats.
 */

/** A solid w x h block of slots with its top-left corner at (x, y). */
function block(x, y, w, h, z) {
  const out = [];
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) out.push({ x: x + i, y: y + j, z });
  }
  return out;
}

/** One horizontal run, from x0 to x1 inclusive. */
function run(y, x0, x1, z) {
  const out = [];
  for (let x = x0; x <= x1; x++) out.push({ x, y, z });
  return out;
}

/** Runs given as [y, x0, x1] triples on a single layer. */
function runs(z, spec) {
  return spec.flatMap(([y, x0, x1]) => run(y, x0, x1, z));
}

/* ------------------------------------------------------------------- turtle */

// The classic Shanghai / Taipei turtle: an 87-tile shell with a four-step
// ziggurat on its back and the traditional three outriggers on the middle row.
const turtle = [
  ...runs(0, [
    [0, 1, 12], [1, 3, 10], [2, 2, 11], [3, 1, 12],
    [4, 1, 12], [5, 2, 11], [6, 3, 10], [7, 1, 12],
  ]),
  { x: -1, y: 3.5, z: 0 },
  { x: 13, y: 3.5, z: 0 },
  { x: 14, y: 3.5, z: 0 },
  ...block(3, 1, 6, 6, 1),
  ...block(4, 2, 4, 4, 2),
  ...block(5, 3, 2, 2, 3),
  { x: 5.5, y: 3.5, z: 4 },
];

/* ------------------------------------------------------------------ pyramid */

// Five stepped layers, each inset half a cell on every side.
const pyramid = [
  ...block(0, 0, 9, 6, 0),
  ...block(0.5, 0.5, 8, 5, 1),
  ...block(1, 1, 7, 4, 2),
  ...block(1.5, 1.5, 6, 3, 3),
  ...block(2.5, 2.5, 4, 1, 4),
];

/* ---------------------------------------------------------------- butterfly */

const butterfly = [
  ...runs(0, [
    [0, 2, 5], [0, 10, 13],
    [1, 1, 6], [1, 9, 14],
    [2, 0, 6], [2, 9, 15],
    [3, 0, 15],
    [4, 0, 15],
    [5, 0, 6], [5, 9, 15],
    [6, 1, 6], [6, 9, 14],
    [7, 2, 5], [7, 10, 13],
  ]),
  ...runs(1, [
    [1.5, 2, 5], [1.5, 10, 13],
    [2.5, 2, 5], [2.5, 10, 13],
    [3.5, 2, 5], [3.5, 10, 13],
    [4.5, 2, 5], [4.5, 10, 13],
  ]),
  ...runs(2, [
    [2.5, 3, 5], [2.5, 10, 12],
    [3.5, 3, 5], [3.5, 10, 12],
  ]),
];

/* ----------------------------------------------------------------- terraces */

// Three free-standing beds, each a five-wide plot under a three-wide terrace.
// Every run has two open ends from the first move, which is what makes this the
// forgiving board — a blind player clears it about four times in five.
const terraces = [
  ...[0, 1, 2, 3, 4, 5].flatMap((y) => runs(0, [[y, 0, 4], [y, 6, 10], [y, 12, 16]])),
  ...[0, 1, 2, 3, 4, 5].flatMap((y) => runs(1, [[y, 1, 3], [y, 7, 9], [y, 13, 15]])),
];

/* ------------------------------------------------------------------- spider */

// Long rows and only one raised strip, so very few tiles are open at any moment.
// Guaranteed solvable, but it punishes a careless order more than anything else here.
const spider = [
  ...runs(0, [
    [0, 2, 15], [1, 0, 17], [2, 0, 17], [3, 2, 15],
    [4, 2, 15], [5, 0, 17], [6, 0, 17], [7, 2, 15],
  ]),
  ...runs(1, [[2.5, 5, 12], [4.5, 5, 12]]),
];

/* ----------------------------------------------------------------- fortress */

// A solid 12x8 keep under three shrinking storeys. The base only opens from its
// edges, so it stays tight to the very end.
const fortress = [
  ...block(0, 0, 12, 8, 0),
  ...block(2, 2, 8, 4, 1),
  ...block(4, 2.5, 4, 3, 2),
  ...block(5, 3, 2, 2, 3),
];

/* -------------------------------------------------------------------- index */

export const LAYOUTS = [
  {
    id: 'turtle',
    name: 'Turtle',
    difficulty: 'Classic',
    blurb: 'The original Shanghai board: an 87-tile shell under a four-step spine.',
    slots: turtle,
  },
  {
    id: 'terraces',
    name: 'Terraces',
    difficulty: 'Gentle',
    blurb: 'Three separate beds with open ends everywhere. The kindest board here.',
    slots: terraces,
  },
  {
    id: 'butterfly',
    name: 'Butterfly',
    difficulty: 'Easy',
    blurb: 'Two wings around a narrow body, stacked three deep at the centre.',
    slots: butterfly,
  },
  {
    id: 'fortress',
    name: 'Fortress',
    difficulty: 'Medium',
    blurb: 'A solid twelve-by-eight keep that opens only from its outside walls.',
    slots: fortress,
  },
  {
    id: 'pyramid',
    name: 'Pyramid',
    difficulty: 'Hard',
    blurb: 'Five stepped storeys. Only the rim of the base is open to begin with.',
    slots: pyramid,
  },
  {
    id: 'spider',
    name: 'Spider',
    difficulty: 'Expert',
    blurb: 'Long, flat, unforgiving rows. Few tiles are ever open at once.',
    slots: spider,
  },
];

export function getLayout(id) {
  return LAYOUTS.find((l) => l.id === id) || LAYOUTS[0];
}
