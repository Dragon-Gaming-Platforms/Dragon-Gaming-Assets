/**
 * The 144-tile mahjong set, and the SVG artwork for every face.
 *
 * A tile's `kind` is what the matching rule compares: two tiles pair when their
 * kinds are equal. Flowers all share the kind `flower` and seasons `season`, so
 * any flower matches any other flower — the one place mahjong solitaire departs
 * from "identical faces only".
 */

/** Suit ordering used for the deck and for the tile browser in the rules panel. */
export const SUITS = ['dots', 'bamboo', 'chars', 'wind', 'dragon', 'flower', 'season'];

const WINDS = [
  { id: 'east', glyph: '東', index: 'E', label: 'East Wind' },
  { id: 'south', glyph: '南', index: 'S', label: 'South Wind' },
  { id: 'west', glyph: '西', index: 'W', label: 'West Wind' },
  { id: 'north', glyph: '北', index: 'N', label: 'North Wind' },
];

const DRAGONS = [
  { id: 'red', glyph: '中', index: 'R', label: 'Red Dragon' },
  { id: 'green', glyph: '發', index: 'G', label: 'Green Dragon' },
  { id: 'white', glyph: '', index: 'W', label: 'White Dragon' },
];

const FLOWERS = [
  { id: 'plum', glyph: '梅', index: '1', label: 'Plum' },
  { id: 'orchid', glyph: '蘭', index: '2', label: 'Orchid' },
  { id: 'chrys', glyph: '菊', index: '3', label: 'Chrysanthemum' },
  { id: 'bamboo', glyph: '竹', index: '4', label: 'Bamboo' },
];

const SEASONS = [
  { id: 'spring', glyph: '春', index: '1', label: 'Spring' },
  { id: 'summer', glyph: '夏', index: '2', label: 'Summer' },
  { id: 'autumn', glyph: '秋', index: '3', label: 'Autumn' },
  { id: 'winter', glyph: '冬', index: '4', label: 'Winter' },
];

const CHAR_NUMERALS = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];

/**
 * Build the deck: 144 tiles as {face, kind, copies} descriptors.
 *
 * `face` identifies the artwork, `kind` identifies what it matches. They differ
 * only for flowers and seasons, which are four distinct pictures sharing one kind.
 */
export function buildDeck() {
  const deck = [];
  const push = (face, kind, copies, label, suit) => {
    for (let i = 0; i < copies; i++) deck.push({ face, kind, label, suit });
  };

  for (let n = 1; n <= 9; n++) {
    push(`dots-${n}`, `dots-${n}`, 4, `${n} of Circles`, 'dots');
    push(`bamboo-${n}`, `bamboo-${n}`, 4, `${n} of Bamboo`, 'bamboo');
    push(`chars-${n}`, `chars-${n}`, 4, `${n} of Characters`, 'chars');
  }
  for (const w of WINDS) push(`wind-${w.id}`, `wind-${w.id}`, 4, w.label, 'wind');
  for (const d of DRAGONS) push(`dragon-${d.id}`, `dragon-${d.id}`, 4, d.label, 'dragon');
  for (const f of FLOWERS) push(`flower-${f.id}`, 'flower', 1, `${f.label} (Flower)`, 'flower');
  for (const s of SEASONS) push(`season-${s.id}`, 'season', 1, `${s.label} (Season)`, 'season');

  return deck;
}

/* ------------------------------------------------------------------ artwork */

const W = 60;
const H = 80;

const INK = 'var(--face-ink)';
const RED = 'var(--face-red)';
const GREEN = 'var(--face-green)';
const BLUE = 'var(--face-blue)';

const CJK = "'Hiragino Sans','Hiragino Kaku Gothic ProN','Noto Sans CJK SC','Noto Sans SC','Microsoft YaHei','PingFang SC','Source Han Sans SC','WenQuanYi Micro Hei',sans-serif";

/** A small corner index, so every tile stays readable without CJK fonts installed. */
function corner(text, color = INK) {
  return `<text x="5" y="12" font-size="11" font-weight="700" fill="${color}"
    font-family="var(--face-font)" text-anchor="start">${text}</text>`;
}

function glyph(ch, y, size, color) {
  if (!ch) return '';
  return `<text x="${W / 2}" y="${y}" font-size="${size}" fill="${color}"
    font-family="${CJK}" text-anchor="middle" dominant-baseline="central">${ch}</text>`;
}

/* --- circles / dots ------------------------------------------------------- */

function dot(cx, cy, r, ring, fill) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${ring}" stroke-width="${r * 0.32}"/>`;
}

/** Grid layouts for the 1..9 dot tiles, as rows of columns. */
const DOT_ROWS = {
  1: [[0]],
  2: [[0], [0]],
  3: 'diag3',
  4: [[-1, 1], [-1, 1]],
  5: [[-1, 1], [0], [-1, 1]],
  6: [[-1, 1], [-1, 1], [-1, 1]],
  7: 'seven',
  8: [[-1, 1], [-1, 1], [-1, 1], [-1, 1]],
  9: [[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]],
};

function dotsFace(n) {
  const parts = [corner(String(n), BLUE)];
  const cx = W / 2;
  const cy = H / 2 + 3;

  if (n === 1) {
    parts.push(dot(cx, cy, 15, RED, 'var(--face-bg)'));
    parts.push(dot(cx, cy, 7, BLUE, 'var(--face-bg)'));
    return parts.join('');
  }

  const colour = (i) => (i % 3 === 0 ? BLUE : i % 3 === 1 ? RED : GREEN);

  if (DOT_ROWS[n] === 'diag3') {
    const pts = [[cx - 13, cy - 16], [cx, cy], [cx + 13, cy + 16]];
    pts.forEach(([x, y], i) => parts.push(dot(x, y, 8, colour(i), 'var(--face-bg)')));
    return parts.join('');
  }

  if (DOT_ROWS[n] === 'seven') {
    const top = [[cx - 13, cy - 22], [cx, cy - 15], [cx + 13, cy - 8]];
    top.forEach(([x, y], i) => parts.push(dot(x, y, 7, GREEN, 'var(--face-bg)')));
    const quad = [[-1, 1], [-1, 1]];
    quad.forEach((row, r) => row.forEach((c) => {
      parts.push(dot(cx + c * 11, cy + 6 + r * 16, 7, RED, 'var(--face-bg)'));
    }));
    return parts.join('');
  }

  const rows = DOT_ROWS[n];
  const rowGap = Math.min(17, 52 / rows.length);
  const top = cy - ((rows.length - 1) * rowGap) / 2;
  let i = 0;
  rows.forEach((row, r) => {
    row.forEach((c) => {
      const r0 = rows.length >= 4 || row.length >= 3 ? 6.5 : 8;
      parts.push(dot(cx + c * 12, top + r * rowGap, r0, colour(i++), 'var(--face-bg)'));
    });
  });
  return parts.join('');
}

/* --- bamboo --------------------------------------------------------------- */

function stick(cx, cy, h, colour) {
  const w = 6;
  return `<g>
    <rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="3" fill="${colour}"/>
    <rect x="${cx - w / 2 - 1.6}" y="${cy - 1.2}" width="${w + 3.2}" height="2.4" rx="1.2" fill="${colour}"/>
  </g>`;
}

/** The one bamboo tile that is a picture, not a count: the sparrow on the 1. */
function sparrow() {
  const cx = W / 2;
  const cy = H / 2 + 4;
  return `<g>
    <path d="M${cx - 2} ${cy + 16} C ${cx - 14} ${cy + 8}, ${cx - 15} ${cy - 8}, ${cx - 3} ${cy - 12}
             C ${cx + 8} ${cy - 16}, ${cx + 15} ${cy - 6}, ${cx + 10} ${cy + 4}
             C ${cx + 6} ${cy + 12}, ${cx + 3} ${cy + 15}, ${cx - 2} ${cy + 16} Z"
          fill="${GREEN}"/>
    <path d="M${cx - 3} ${cy - 11} C ${cx + 6} ${cy - 14}, ${cx + 12} ${cy - 6}, ${cx + 7} ${cy + 1}
             C ${cx + 2} ${cy + 6}, ${cx - 4} ${cy + 2}, ${cx - 3} ${cy - 11} Z"
          fill="${RED}"/>
    <circle cx="${cx + 3}" cy="${cy - 8}" r="1.8" fill="var(--face-bg)"/>
    <path d="M${cx - 2} ${cy + 16} L ${cx - 9} ${cy + 22} M${cx - 2} ${cy + 16} L ${cx + 5} ${cy + 22}"
          stroke="${INK}" stroke-width="1.6" stroke-linecap="round" fill="none"/>
  </g>`;
}

const BAMBOO_ROWS = {
  2: [[0], [0]],
  3: [[0], [-1, 1]],
  4: [[-1, 1], [-1, 1]],
  5: [[-1, 1], [0], [-1, 1]],
  6: [[-1, 0, 1], [-1, 0, 1]],
  7: [[0], [-1, 0, 1], [-1, 0, 1]],
  8: [[-1.5, -0.5, 0.5, 1.5], [-1.5, -0.5, 0.5, 1.5]],
  9: [[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]],
};

function bambooFace(n) {
  const parts = [corner(String(n), GREEN)];
  if (n === 1) {
    parts.push(sparrow());
    return parts.join('');
  }
  const rows = BAMBOO_ROWS[n];
  const cx = W / 2;
  const cy = H / 2 + 3;
  const rowGap = rows.length === 2 ? 24 : 19;
  const top = cy - ((rows.length - 1) * rowGap) / 2;
  const h = rows.length === 2 ? 20 : 16;
  rows.forEach((row, r) => {
    row.forEach((c) => {
      // Traditional red accents: the centre of the 5, the crown of the 7,
      // and the middle column of the 9.
      const red =
        (n === 5 && r === 1) ||
        (n === 7 && r === 0) ||
        (n === 9 && c === 0);
      const span = row.length >= 4 ? 11 : 13;
      parts.push(stick(cx + c * span, top + r * rowGap, h, red ? RED : GREEN));
    });
  });
  return parts.join('');
}

/* --- characters ----------------------------------------------------------- */

function charsFace(n) {
  return [
    corner(String(n), INK),
    glyph(CHAR_NUMERALS[n - 1], 30, 26, INK),
    glyph('萬', 58, 24, RED),
  ].join('');
}

/* --- honours, flowers, seasons -------------------------------------------- */

function windFace(w) {
  return [corner(w.index, BLUE), glyph(w.glyph, H / 2 + 4, 40, BLUE)].join('');
}

function dragonFace(d) {
  if (d.id === 'white') {
    // The white dragon is a blank frame, not an empty tile.
    return [
      corner('W', BLUE),
      `<rect x="13" y="20" width="34" height="44" rx="3" fill="none"
         stroke="${BLUE}" stroke-width="2.5"/>`,
      `<rect x="18" y="25" width="24" height="34" rx="2" fill="none"
         stroke="${BLUE}" stroke-width="1" opacity="0.5"/>`,
    ].join('');
  }
  const colour = d.id === 'red' ? RED : GREEN;
  return [corner(d.index, colour), glyph(d.glyph, H / 2 + 4, 38, colour)].join('');
}

function petal(cx, cy, r, colour) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${colour}" opacity="0.85"/>`;
}

function flowerFace(f) {
  const cx = W / 2;
  const cy = H / 2 + 8;
  const colour = { plum: RED, orchid: BLUE, chrys: 'var(--face-gold)', bamboo: GREEN }[f.id];
  const petals = [0, 1, 2, 3, 4]
    .map((i) => {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      return petal(cx + Math.cos(a) * 11, cy + Math.sin(a) * 11, 7, colour);
    })
    .join('');
  return [
    corner(f.index, colour),
    `<text x="${W - 5}" y="12" font-size="9" font-weight="700" fill="${colour}"
       font-family="var(--face-font)" text-anchor="end">F</text>`,
    petals,
    `<circle cx="${cx}" cy="${cy}" r="5" fill="var(--face-gold)"/>`,
    glyph(f.glyph, 22, 15, colour),
  ].join('');
}

function seasonFace(s) {
  const cx = W / 2;
  const cy = H / 2 + 10;
  const colour = { spring: GREEN, summer: RED, autumn: 'var(--face-gold)', winter: BLUE }[s.id];
  const art = {
    // A sprout, a sun, a falling leaf, a snowflake.
    spring: `<path d="M${cx} ${cy + 12} V ${cy - 6}" stroke="${colour}" stroke-width="2.5" stroke-linecap="round"/>
             <path d="M${cx} ${cy - 1} C ${cx - 12} ${cy - 3}, ${cx - 12} ${cy - 14}, ${cx - 1} ${cy - 10} Z" fill="${colour}"/>
             <path d="M${cx} ${cy - 5} C ${cx + 12} ${cy - 7}, ${cx + 12} ${cy - 18}, ${cx + 1} ${cy - 14} Z" fill="${colour}"/>`,
    summer: `<circle cx="${cx}" cy="${cy}" r="8" fill="${colour}"/>` +
      [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const a = (i / 8) * Math.PI * 2;
        return `<path d="M${cx + Math.cos(a) * 11} ${cy + Math.sin(a) * 11} L ${cx + Math.cos(a) * 16} ${cy + Math.sin(a) * 16}"
          stroke="${colour}" stroke-width="2.4" stroke-linecap="round"/>`;
      }).join(''),
    autumn: `<path d="M${cx} ${cy + 13} C ${cx - 4} ${cy + 4}, ${cx - 14} ${cy + 2}, ${cx - 11} ${cy - 8}
                       C ${cx - 8} ${cy - 17}, ${cx + 8} ${cy - 16}, ${cx + 11} ${cy - 6}
                       C ${cx + 13} ${cy + 3}, ${cx + 4} ${cy + 4}, ${cx} ${cy + 13} Z" fill="${colour}"/>
             <path d="M${cx} ${cy + 13} V ${cy - 10}" stroke="var(--face-bg)" stroke-width="1.4"/>`,
    winter: [0, 1, 2].map((i) => {
      const a = (i / 3) * Math.PI;
      const dx = Math.cos(a) * 15;
      const dy = Math.sin(a) * 15;
      return `<path d="M${cx - dx} ${cy - dy} L ${cx + dx} ${cy + dy}"
        stroke="${colour}" stroke-width="2.4" stroke-linecap="round"/>`;
    }).join(''),
  }[s.id];
  return [
    corner(s.index, colour),
    `<text x="${W - 5}" y="12" font-size="9" font-weight="700" fill="${colour}"
       font-family="var(--face-font)" text-anchor="end">S</text>`,
    art,
    glyph(s.glyph, 22, 15, colour),
  ].join('');
}

/* ------------------------------------------------------------------ lookup */

const FACE_ART = (() => {
  const art = {};
  for (let n = 1; n <= 9; n++) {
    art[`dots-${n}`] = dotsFace(n);
    art[`bamboo-${n}`] = bambooFace(n);
    art[`chars-${n}`] = charsFace(n);
  }
  for (const w of WINDS) art[`wind-${w.id}`] = windFace(w);
  for (const d of DRAGONS) art[`dragon-${d.id}`] = dragonFace(d);
  for (const f of FLOWERS) art[`flower-${f.id}`] = flowerFace(f);
  for (const s of SEASONS) art[`season-${s.id}`] = seasonFace(s);
  return art;
})();

/** The `<svg>` markup for one tile face. */
export function faceSvg(face) {
  const art = FACE_ART[face];
  if (!art) throw new Error(`unknown tile face: ${face}`);
  return `<svg class="tile-face" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true" focusable="false">${art}</svg>`;
}

export const FACES = Object.keys(FACE_ART);
