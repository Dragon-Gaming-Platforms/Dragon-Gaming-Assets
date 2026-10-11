/**
 * Board model and deal generation. No DOM in here — it runs unchanged in Node,
 * which is what the test suite leans on.
 *
 * Coordinates are kept in half-cells (`x2 = x * 2`) so that the half-step
 * overhangs real mahjong layouts use stay integer arithmetic. A tile is two
 * half-cells wide and two tall.
 */

import { buildDeck } from './tiles.js';

/* ---------------------------------------------------------------- randomness */

/** Deterministic PRNG (mulberry32) so a seed always reproduces its deal. */
export function makeRng(seed) {
  let a = typeof seed === 'number' ? seed >>> 0 : hashSeed(String(seed));
  return function rng() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** A short, shareable, typo-resistant seed string. */
export function randomSeed() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) {
    s += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return s;
}

function shuffle(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ------------------------------------------------------------------ geometry */

/**
 * Precompute, for each slot, which other slots can cover it and which sit
 * immediately to its left and right on the same layer. Everything the free-tile
 * test needs is then a scan over three short lists.
 */
export function buildGeometry(slots) {
  const n = slots.length;
  const pos = slots.map((s) => ({
    x2: Math.round(s.x * 2),
    y2: Math.round(s.y * 2),
    z: s.z,
    x: s.x,
    y: s.y,
  }));

  const above = Array.from({ length: n }, () => []);
  const left = Array.from({ length: n }, () => []);
  const right = Array.from({ length: n }, () => []);

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const a = pos[i];
      const b = pos[j];
      const yOverlap = Math.abs(b.y2 - a.y2) < 2;
      if (!yOverlap) continue;
      const xOverlap = Math.abs(b.x2 - a.x2) < 2;
      if (b.z > a.z) {
        if (xOverlap) above[i].push(j);
        continue;
      }
      if (b.z !== a.z) continue;
      // A same-layer neighbour blocks a side when its own two-half-cell span
      // reaches the edge in question.
      if (b.x2 < a.x2 && b.x2 > a.x2 - 4) left[i].push(j);
      else if (b.x2 > a.x2 && b.x2 < a.x2 + 4) right[i].push(j);
    }
  }

  return { n, pos, above, left, right };
}

/** True when slot `i` is uncovered and open on at least one side. */
export function isFreeSlot(geo, present, i) {
  if (!present[i]) return false;
  for (const j of geo.above[i]) if (present[j]) return false;
  let blockedLeft = false;
  for (const j of geo.left[i]) {
    if (present[j]) { blockedLeft = true; break; }
  }
  if (!blockedLeft) return true;
  for (const j of geo.right[i]) if (present[j]) return false;
  return true;
}

function freeSlots(geo, present) {
  const out = [];
  for (let i = 0; i < geo.n; i++) if (isFreeSlot(geo, present, i)) out.push(i);
  return out;
}

/** Every slot above the base must have something under it. Used by the tests. */
export function findFloatingSlots(slots) {
  const geo = buildGeometry(slots);
  const floating = [];
  for (let i = 0; i < geo.n; i++) {
    if (geo.pos[i].z === 0) continue;
    const a = geo.pos[i];
    const supported = geo.pos.some(
      (b, j) => j !== i && b.z < a.z && Math.abs(b.x2 - a.x2) < 2 && Math.abs(b.y2 - a.y2) < 2,
    );
    if (!supported) floating.push(i);
  }
  return floating;
}

/* -------------------------------------------------------------- deal making */

/**
 * Split a deck into matching pairs. Flowers pair with flowers and seasons with
 * seasons, so those two kinds are shuffled before pairing to vary which picture
 * meets which.
 */
function pairUp(deck, rng) {
  const byKind = new Map();
  for (const tile of deck) {
    if (!byKind.has(tile.kind)) byKind.set(tile.kind, []);
    byKind.get(tile.kind).push(tile);
  }
  const pairs = [];
  for (const group of byKind.values()) {
    if (group.length % 2 !== 0) throw new Error('tile kind with an odd count');
    shuffle(group, rng);
    for (let i = 0; i < group.length; i += 2) pairs.push([group[i], group[i + 1]]);
  }
  return shuffle(pairs, rng);
}

/**
 * Lay tiles out by *unbuilding* the board: repeatedly take two slots that are
 * free right now and hand them a matching pair. Replaying those removals in
 * order is a legal solution, so the deal cannot be unwinnable.
 *
 * Picking blindly can still paint the sampler into a corner — a layout can
 * reach a state with exactly one free slot left — so the caller retries with a
 * fresh stream when that happens.
 */
function tryDeal(geo, tiles, rng) {
  const present = new Uint8Array(geo.n).fill(1);
  const order = [];
  let remaining = geo.n;

  while (remaining > 0) {
    const free = freeSlots(geo, present);
    if (free.length < 2) return null;
    const a = free[Math.floor(rng() * free.length)];
    let b = a;
    while (b === a) b = free[Math.floor(rng() * free.length)];
    present[a] = 0;
    present[b] = 0;
    remaining -= 2;
    order.push([a, b]);
  }

  const placement = new Array(geo.n);
  order.forEach(([a, b], i) => {
    const [t1, t2] = tiles[i];
    placement[a] = t1;
    placement[b] = t2;
  });
  return { placement, solution: order };
}

const DEAL_ATTEMPTS = 60;

/**
 * Deal a solvable board. Returns the tile for every slot plus one known
 * solution, which is what the "unsolvable board" safety net and the tests use.
 */
export function dealBoard(slots, seed, deck = buildDeck()) {
  if (deck.length !== slots.length) {
    throw new Error(`layout has ${slots.length} slots but the deck has ${deck.length} tiles`);
  }
  const geo = buildGeometry(slots);
  for (let attempt = 0; attempt < DEAL_ATTEMPTS; attempt++) {
    const rng = makeRng(`${seed}#${attempt}`);
    const pairs = pairUp(deck.slice(), rng);
    const dealt = tryDeal(geo, pairs, rng);
    if (dealt) return { ...dealt, geo, attempts: attempt + 1 };
  }
  throw new Error(`could not deal a solvable board for seed ${seed}`);
}

/* -------------------------------------------------------------------- board */

export class Board {
  constructor(layout, seed) {
    this.layout = layout;
    this.seed = seed;
    const { placement, solution, geo } = dealBoard(layout.slots, seed);
    this.geo = geo;
    this.solution = solution;
    this.present = new Uint8Array(geo.n).fill(1);
    this.tiles = layout.slots.map((slot, i) => ({
      id: i,
      x: geo.pos[i].x,
      y: geo.pos[i].y,
      z: slot.z,
      face: placement[i].face,
      kind: placement[i].kind,
      label: placement[i].label,
    }));
    this.history = [];
  }

  get remaining() {
    let n = 0;
    for (let i = 0; i < this.geo.n; i++) n += this.present[i];
    return n;
  }

  get won() {
    return this.remaining === 0;
  }

  isFree(id) {
    return isFreeSlot(this.geo, this.present, id);
  }

  freeIds() {
    return freeSlots(this.geo, this.present);
  }

  matches(a, b) {
    return a !== b && this.tiles[a].kind === this.tiles[b].kind;
  }

  /** Every legal move right now, as [a, b] pairs with a < b. */
  availableMoves() {
    const free = this.freeIds();
    const moves = [];
    for (let i = 0; i < free.length; i++) {
      for (let j = i + 1; j < free.length; j++) {
        if (this.tiles[free[i]].kind === this.tiles[free[j]].kind) moves.push([free[i], free[j]]);
      }
    }
    return moves;
  }

  /** Distinct matchable kinds available — what the "pairs left" readout shows. */
  availablePairCount() {
    const free = this.freeIds();
    const byKind = new Map();
    for (const id of free) {
      const k = this.tiles[id].kind;
      byKind.set(k, (byKind.get(k) || 0) + 1);
    }
    let n = 0;
    for (const count of byKind.values()) n += Math.floor(count / 2);
    return n;
  }

  remove(a, b) {
    if (!this.isFree(a) || !this.isFree(b) || !this.matches(a, b)) return false;
    this.present[a] = 0;
    this.present[b] = 0;
    this.history.push([a, b]);
    return true;
  }

  undo() {
    const last = this.history.pop();
    if (!last) return null;
    this.present[last[0]] = 1;
    this.present[last[1]] = 1;
    return last;
  }

  /**
   * Whether the tiles still standing could be rearranged at all. Some endings
   * cannot: two tiles left with one sitting on the other have exactly one free
   * slot, and no deal over those two slots exists. The UI asks first so it can
   * stop offering a shuffle that is going to fail.
   */
  canReshuffle() {
    let free = 0;
    let present = 0;
    for (let i = 0; i < this.geo.n; i++) {
      if (!this.present[i]) continue;
      present++;
      if (this.isFree(i)) free++;
    }
    return present >= 2 && free >= 2;
  }

  /**
   * Redeal the tiles still on the board into the slots still on the board, so
   * that the rest of the game is solvable again. Returns false if no
   * arrangement was found, leaving the board untouched.
   */
  reshuffle(seed) {
    // Bail before spending sixty deal attempts on a board that has no room.
    if (!this.canReshuffle()) return false;
    const ids = [];
    for (let i = 0; i < this.geo.n; i++) if (this.present[i]) ids.push(i);

    const subSlots = ids.map((i) => ({ x: this.tiles[i].x, y: this.tiles[i].y, z: this.tiles[i].z }));
    const subDeck = ids.map((i) => ({
      face: this.tiles[i].face,
      kind: this.tiles[i].kind,
      label: this.tiles[i].label,
    }));
    let dealt;
    try {
      dealt = dealBoard(subSlots, seed, subDeck);
    } catch {
      return false;
    }
    ids.forEach((id, k) => {
      const t = dealt.placement[k];
      this.tiles[id].face = t.face;
      this.tiles[id].kind = t.kind;
      this.tiles[id].label = t.label;
    });
    // The old solution described the old arrangement; it no longer applies.
    this.solution = null;
    this.history = [];
    return true;
  }
}

/**
 * Play a board out taking a random legal move each time. Used by the tests to
 * measure how much room for error a layout leaves — a board a blind player
 * always clears is not a puzzle.
 */
export function randomPlaythrough(board, rng) {
  const present = Uint8Array.from(board.present);
  const geo = board.geo;
  let moves = 0;
  for (;;) {
    const free = freeSlots(geo, present);
    const options = [];
    for (let i = 0; i < free.length; i++) {
      for (let j = i + 1; j < free.length; j++) {
        if (board.tiles[free[i]].kind === board.tiles[free[j]].kind) options.push([free[i], free[j]]);
      }
    }
    if (!options.length) break;
    const [a, b] = options[Math.floor(rng() * options.length)];
    present[a] = 0;
    present[b] = 0;
    moves++;
  }
  let left = 0;
  for (let i = 0; i < geo.n; i++) left += present[i];
  return { cleared: left === 0, moves, left };
}
