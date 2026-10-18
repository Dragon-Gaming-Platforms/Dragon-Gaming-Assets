// 游戏列表（纯数据, 主页、游戏页、Worker 共用）。
//   sizes      Size预设 [宽, 高]
//   sizeRange  通过Puzzle code载入时允许的Size范围；fixed 表示只能用预设Size；square 表示必须是正方形
//   rules      规则说明（每条一句）

export const GAMES = [
  {
    id: 'akari',
    prefix: 'AK',
    name: 'Akari',
    en: 'Akari',
    intro: 'Illuminate every white cell without lighting another bulb.',
    rules: [
      'Place bulbs in white cells. Light travels horizontally and vertically until blocked by a wall or edge.',
      'All white cells must be lit; no bulb may illuminate another bulb.',
      'A numbered wall needs exactly that many orthogonally adjacent bulbs.',
    ],
    sizes: [[7, 7], [10, 10], [14, 14]],
    defaultSize: [7, 7],
    sizeRange: { min: 4, max: 20 },
  },
];

export function getGame(id) {
  return GAMES.find((g) => g.id === id) || null;
}

export function isValidSize(game, width, height) {
  if (game.sizes.some(([w, h]) => w === width && h === height)) return true;
  const r = game.sizeRange;
  if (r.fixed) return false;
  if (r.square && width !== height) return false;
  return width >= r.min && width <= r.max && height >= r.min && height <= r.max;
}

const LETTERS = { easy: 'E', medium: 'M', hard: 'H' };

/** Puzzle code：前缀-宽x高-Difficulty-种子, 例如 SD-9x9-M-123456 */
export function formatCode(gameId, { width, height, difficulty, seed }) {
  return `${getGame(gameId).prefix}-${width}x${height}-${LETTERS[difficulty]}-${seed}`;
}

/** 解析Puzzle code；省略前缀时视为 defaultGame。返回 { game, width, height, difficulty, seed } 或 { error }。 */
export function parseCode(text, defaultGame = null) {
  const m = /^\s*(?:([A-Za-z]{2})\s*-\s*)?(\d+)\s*[x×*]\s*(\d+)\s*-\s*([EMH])\s*-\s*(\d+)\s*$/i.exec(text || '');
  if (!m) return { error: 'Invalid code. Example: AK-7x7-M-123456' };
  const game = m[1] ? GAMES.find((g) => g.prefix === m[1].toUpperCase()) : getGame(defaultGame);
  if (!game) return { error: `Unknown game prefix: ${m[1]}` };
  const width = Number(m[2]);
  const height = Number(m[3]);
  const seed = Number(m[5]);
  if (!isValidSize(game, width, height)) return { error: `${game.name} does not support size ${width}×${height}` };
  if (!Number.isSafeInteger(seed) || seed <= 0) return { error: 'Invalid seed' };
  const letter = m[4].toUpperCase();
  const difficulty = Object.keys(LETTERS).find((d) => LETTERS[d] === letter);
  return { game: game.id, width, height, difficulty, seed };
}
