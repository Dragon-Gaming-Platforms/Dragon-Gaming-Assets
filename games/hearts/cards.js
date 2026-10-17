/* ============================================================
   cards.js — renders classic playing-card faces as SVG
   ============================================================ */

const SUITS = ['C', 'D', 'H', 'S'];               // Clubs, Diamonds, Hearts, Spades
const RANKS = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];

const SUIT_INFO = {
  C: { glyph: '♣', color: '#111111', name: 'Clubs' },
  D: { glyph: '♦', color: '#cc0000', name: 'Diamonds' },
  H: { glyph: '♥', color: '#cc0000', name: 'Hearts' },
  S: { glyph: '♠', color: '#111111', name: 'Spades' },
};

// Pip coordinate layouts (in a 100 x 140 viewBox, pip area roughly x:[20..80] y:[22..118]).
// Coordinates are fractions; y-flip is applied for the bottom half so pips point inward.
const COLS = { L: 30, C: 50, R: 70 };
const ROWS = { top: 26, upMid: 42, mid: 70, loMid: 98, bot: 114, quTop: 34, quBot: 106 };

// Each entry: [x, y, flip?]  (flip=true → pip rotated 180°)
const PIP_LAYOUTS = {
  '2':  [[COLS.C, ROWS.top], [COLS.C, ROWS.bot, true]],
  '3':  [[COLS.C, ROWS.top], [COLS.C, ROWS.mid], [COLS.C, ROWS.bot, true]],
  '4':  [[COLS.L, ROWS.top], [COLS.R, ROWS.top], [COLS.L, ROWS.bot, true], [COLS.R, ROWS.bot, true]],
  '5':  [[COLS.L, ROWS.top], [COLS.R, ROWS.top], [COLS.C, ROWS.mid],
         [COLS.L, ROWS.bot, true], [COLS.R, ROWS.bot, true]],
  '6':  [[COLS.L, ROWS.top], [COLS.R, ROWS.top], [COLS.L, ROWS.mid], [COLS.R, ROWS.mid],
         [COLS.L, ROWS.bot, true], [COLS.R, ROWS.bot, true]],
  '7':  [[COLS.L, ROWS.top], [COLS.R, ROWS.top], [COLS.C, 50],
         [COLS.L, ROWS.mid], [COLS.R, ROWS.mid],
         [COLS.L, ROWS.bot, true], [COLS.R, ROWS.bot, true]],
  '8':  [[COLS.L, ROWS.top], [COLS.R, ROWS.top], [COLS.C, 50],
         [COLS.L, ROWS.mid], [COLS.R, ROWS.mid], [COLS.C, 90, true],
         [COLS.L, ROWS.bot, true], [COLS.R, ROWS.bot, true]],
  '9':  [[COLS.L, ROWS.quTop], [COLS.R, ROWS.quTop], [COLS.L, 60], [COLS.R, 60],
         [COLS.C, 70],
         [COLS.L, 80, true], [COLS.R, 80, true], [COLS.L, ROWS.quBot, true], [COLS.R, ROWS.quBot, true]],
  '10': [[COLS.L, ROWS.quTop], [COLS.R, ROWS.quTop], [COLS.C, 46],
         [COLS.L, 58], [COLS.R, 58], [COLS.L, 82, true], [COLS.R, 82, true],
         [COLS.C, 94, true], [COLS.L, ROWS.quBot, true], [COLS.R, ROWS.quBot, true]],
};

// SVG path for a single suit pip, drawn centered at (0,0) at ~ 22 units tall.
function pipPath(suit) {
  switch (suit) {
    case 'H': // heart
      return 'M0,7 C-1,3 -5,0 -8,-3 C-11,-6 -10,-11 -6,-12 C-3,-13 -1,-11 0,-9 ' +
             'C1,-11 3,-13 6,-12 C10,-11 11,-6 8,-3 C5,0 1,3 0,7 Z';
    case 'D': // diamond
      return 'M0,-12 L9,0 L0,12 L-9,0 Z';
    case 'S': // spade
      return 'M0,-12 C0,-12 9,-3 9,3 C9,8 4,10 1,7 C1.5,10 2,12 4,13 L-4,13 ' +
             'C-2,12 -1.5,10 -1,7 C-4,10 -9,8 -9,3 C-9,-3 0,-12 0,-12 Z';
    case 'C': // club
      return 'M0,13 C-1,10 -1,9 1,7 C-2,9 -7,7 -7,2 C-7,-2 -3,-4 0,-2 ' +
             'C-2,-4 -3,-7 0,-10 C3,-7 2,-4 0,-2 C3,-4 7,-2 7,2 C7,7 2,9 -1,7 ' +
             'C1,9 1,10 0,13 Z';
  }
  return '';
}

function esc(s) { return String(s); }

/**
 * Build an SVG string for a card face.
 * @param {string} rank  one of RANKS
 * @param {string} suit  one of SUITS
 */
function cardSVG(rank, suit) {
  const info = SUIT_INFO[suit];
  const color = info.color;
  const glyph = info.glyph;
  const rankLabel = rank; // '10' shown as 10

  const corner = (x, y, rotate) => `
    <g transform="translate(${x},${y})${rotate ? ' rotate(180)' : ''}">
      <text x="0" y="0" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif"
            font-size="17" font-weight="bold" fill="${color}"
            dominant-baseline="middle">${esc(rankLabel)}</text>
      <text x="0" y="15" text-anchor="middle" font-size="14" fill="${color}"
            dominant-baseline="middle">${glyph}</text>
    </g>`;

  let body = '';

  if (PIP_LAYOUTS[rank]) {
    // Number card: draw pips
    const scale = 1.05;
    for (const [px, py, flip] of PIP_LAYOUTS[rank]) {
      body += `<g transform="translate(${px},${py}) scale(${scale}) ${flip ? 'rotate(180)' : ''}">
                 <path d="${pipPath(suit)}" fill="${color}" />
               </g>`;
    }
  } else if (rank === 'A') {
    // Ace: single large central pip
    body += `<g transform="translate(50,70) scale(2.6)">
               <path d="${pipPath(suit)}" fill="${color}" />
             </g>`;
  } else {
    // Face card: framed panel with big letter and suit
    const letter = rank;
    body += `
      <rect x="26" y="30" width="48" height="80" rx="4" fill="none"
            stroke="${color}" stroke-width="1.5" opacity="0.55" />
      <text x="50" y="66" text-anchor="middle" font-family="Georgia, serif"
            font-size="34" font-weight="bold" fill="${color}">${letter}</text>
      <g transform="translate(50,92) scale(1.7)">
        <path d="${pipPath(suit)}" fill="${color}" />
      </g>`;
  }

  return `
    <svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <rect x="0.5" y="0.5" width="99" height="139" rx="6" fill="#ffffff" stroke="#c9c9c9"/>
      ${corner(14, 20, false)}
      ${corner(86, 120, true)}
      ${body}
    </svg>`;
}

/** Create a DOM card element for a given "RS" id like "AS" or "10H". */
function makeCardEl(cardId) {
  const { rank, suit } = parseCard(cardId);
  const el = document.createElement('div');
  el.className = 'card';
  el.dataset.card = cardId;
  el.innerHTML = cardSVG(rank, suit);
  return el;
}

/** Create a face-down card back element. */
function makeCardBack() {
  const el = document.createElement('div');
  el.className = 'card-back';
  return el;
}

/** Parse a card id like "10H" or "AS" → {rank, suit}. */
function parseCard(id) {
  const suit = id.slice(-1);
  const rank = id.slice(0, -1);
  return { rank, suit };
}

/** Numeric strength of a rank for comparisons (2 lowest, A highest). */
function rankValue(rank) {
  return RANKS.indexOf(rank);
}

/** Full 52-card ordered deck of ids. */
function buildDeck() {
  const deck = [];
  for (const s of SUITS) for (const r of RANKS) deck.push(r + s);
  return deck;
}
