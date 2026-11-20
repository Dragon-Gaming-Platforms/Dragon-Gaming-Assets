/* Chinese Checkers. Original code, MIT; see LICENSE. */
/* Chinese Checkers: rules, computer opponent and controller. Original code, MIT; see LICENSE. */
const DIRS = [[1,-1,0],[1,0,-1],[0,1,-1],[-1,1,0],[-1,0,1],[0,-1,1]];
const k3 = (x, y, z) => x + ',' + y + ',' + z;
const parse = k => k.split(',').map(Number);
const rot = c => [-c[2], -c[0], -c[1]];
const neg = c => [-c[0], -c[1], -c[2]];
const dist = (a, b) => Math.max(Math.abs(a[0]-b[0]), Math.abs(a[1]-b[1]), Math.abs(a[2]-b[2]));
const MARBLES = 10;

// one star tip (10 holes, apex at x = 8)
const tipA = [];
for (let x = 5; x <= 8; x++) for (let y = -4; y <= -4 + (8 - x); y++) tipA.push([x, y, -x - y]);
const tipB = tipA.map(neg);
const TIPS = {
  A: tipA,
  B: tipB,
};
// the star: centre hexagon of radius 4 plus six tips
const ALL = new Set();
for (let x = -4; x <= 4; x++) for (let y = -4; y <= 4; y++) { const z = -x - y; if (Math.abs(z) <= 4) ALL.add(k3(x, y, z)); }
for (const t of [tipA, tipB, tipA.map(rot), tipB.map(rot), tipA.map(c => rot(rot(c))), tipB.map(c => rot(rot(c)))]) for (const c of t) ALL.add(k3(...c));
const HOME = { A: new Set(TIPS.A.map(c => k3(...c))), B: new Set(TIPS.B.map(c => k3(...c))) };
const GOAL = { A: HOME.B, B: HOME.A };
const APEX = { A: neg([8, -4, -4]), B: [8, -4, -4] };
// the goal apex for A is the far tip apex (x = -8), for B it is x = +8

function initialBoard() {
  const b = {};
  for (const k of HOME.A) b[k] = 'A';
  for (const k of HOME.B) b[k] = 'B';
  return b;
}

function legalMoves(board, side) {
  const out = [];
  for (const k of Object.keys(board)) {
    if (board[k] !== side) continue;
    const start = parse(k);
    const occ = new Set(Object.keys(board));
    occ.delete(k);
    const ends = new Set();
    for (const d of DIRS) {
      const nk = k3(start[0]+d[0], start[1]+d[1], start[2]+d[2]);
      if (ALL.has(nk) && !occ.has(nk)) ends.add(nk);
    }
    const visited = new Set([k]);
    const stack = [start];
    while (stack.length) {
      const c = stack.pop();
      for (const d of DIRS) {
        const ok = k3(c[0]+d[0], c[1]+d[1], c[2]+d[2]);
        const L = [c[0]+2*d[0], c[1]+2*d[1], c[2]+2*d[2]];
        const lk = k3(...L);
        if (!occ.has(ok) || !ALL.has(lk) || occ.has(lk) || visited.has(lk)) continue;
        visited.add(lk); ends.add(lk); stack.push(L);
      }
    }
    for (const e of ends) out.push({ from: k, to: e });
  }
  return out;
}

function applyMove(board, m) {
  const nb = { ...board };
  const side = nb[m.from];
  delete nb[m.from];
  nb[m.to] = side;
  return nb;
}

function countIn(board, side, set) {
  let n = 0;
  for (const k of Object.keys(board)) if (board[k] === side && set.has(k)) n++;
  return n;
}
const hasWon = (board, side) => countIn(board, side, GOAL[side]) === MARBLES;

function progress(board, side) {
  let s = 0;
  for (const k of Object.keys(board)) if (board[k] === side) s += dist(parse(k), APEX[side]);
  return s;
}
// higher is better for `side`
const score = (board, side) => {
  const opp = side === 'A' ? 'B' : 'A';
  return progress(board, opp) - progress(board, side);
};

// level: 'easy' | 'medium' | 'hard'; rng returns [0,1)
function chooseMove(board, side, level, rng = Math.random) {
  const moves = legalMoves(board, side);
  if (!moves.length) return null;
  for (const m of moves) if (hasWon(applyMove(board, m), side)) return m;
  const opp = side === 'A' ? 'B' : 'A';
  let best = null, bestVal = -Infinity;
  for (const m of moves) {
    const nb = applyMove(board, m);
    let val;
    if (level === 'hard') {
      const replies = legalMoves(nb, opp);
      if (!replies.length) val = score(nb, side);
      else {
        val = Infinity;
        for (const r of replies) {
          const nb2 = applyMove(nb, r);
          const v = hasWon(nb2, opp) ? -1e9 : score(nb2, side);
          if (v < val) val = v;
        }
      }
    } else if (level === 'easy') {
      val = score(nb, side) + rng() * 4;
    } else {
      val = score(nb, side);
    }
    if (val > bestVal) { bestVal = val; best = m; }
  }
  return best;
}

const LOGIC = { DIRS, ALL, HOME, GOAL, APEX, MARBLES, k3, parse, initialBoard, legalMoves, applyMove, hasWon, progress, score, chooseMove, countIn };
if (typeof window !== 'undefined') window.ChineseCheckersLogic = LOGIC;
if (typeof document === 'undefined') { /* Node test harness: logic only */ }
else {
// ---------- controller ----------
const $ = s => document.querySelector(s);
const SVGNS = 'http://www.w3.org/2000/svg';
const S = 15, SQ3 = Math.sqrt(3);
const px = c => S * SQ3 * (c[0] + c[2] / 2);
const py = c => S * 1.5 * c[2];
const NAME = { A: 'Red', B: 'Blue' };
let state, sel = null, mode = 'computer', level = 'medium', busy = false;
const PLY_LIMIT = 300;

function fresh() {
  state = { board: initialBoard(), turn: 'A', ply: 0, winner: null, history: [], last: null };
  sel = null; busy = false;
  render(); msg('Red moves first. Select a red marble, then a highlighted hole.');
  if (isComputer(state.turn)) schedule();
}
const isComputer = side => mode === 'computer' && side === 'B';
function msg(t) { $('#message').textContent = t; }

function sideMoves(side) { return legalMoves(state.board, side); }
function targetsFor(k) {
  if (!k) return new Set();
  return new Set(sideMoves(state.turn).filter(m => m.from === k).map(m => m.to));
}

function finish(side) {
  state.winner = side;
  msg(NAME[side] + ' wins! All ten marbles reached the opposite star point.');
  sel = null; busy = false; render();
}

function commit(m) {
  busy = false;
  state.history.push({ board: state.board, turn: state.turn, last: state.last, ply: state.ply });
  state.board = applyMove(state.board, m);
  state.last = m;
  state.ply++;
  sel = null;
  if (hasWon(state.board, state.turn)) return finish(state.turn);
  if (state.ply >= PLY_LIMIT) { state.winner = 'draw'; msg('Draw: move limit reached.'); busy = false; render(); return; }
  const next = state.turn === 'A' ? 'B' : 'A';
  state.turn = next;
  render();
  if (!sideMoves(next).length) { msg(NAME[next] + ' has no legal move and passes.'); state.turn = next === 'A' ? 'B' : 'A'; render(); }
  if (isComputer(state.turn)) schedule();
  else msg(NAME[state.turn] + ' to move. Select a marble, then a highlighted hole.');
}

function schedule() {
  busy = true; msg('Blue (computer) is thinking…');
  setTimeout(() => {
    if (state.winner) return;
    const m = chooseMove(state.board, 'B', level);
    if (!m) { busy = false; state.turn = 'A'; render(); msg('Blue has no legal move and passes. Red to move.'); return; }
    commit(m);
  }, 250);
}

function clickCell(k) {
  if (state.winner || busy) return;
  if (state.board[k] === state.turn && !isComputer(state.turn)) {
    sel = sel === k ? null : k;
    render();
    msg(sel ? 'Choose a highlighted hole.' : NAME[state.turn] + ' to move. Select a marble, then a highlighted hole.');
    return;
  }
  if (sel) {
    const m = sideMoves(state.turn).find(x => x.from === sel && x.to === k);
    if (m) { commit(m); return; }
  }
  msg('That hole is not reachable from the selected marble.');
}

function undo() {
  if (busy || !state.history.length) return;
  // step back to the last position where the human is to move
  do {
    const h = state.history.pop();
    state.board = h.board; state.turn = h.turn; state.last = h.last; state.ply = h.ply;
  } while (isComputer(state.turn) && state.history.length);
  state.winner = null; sel = null;
  render(); msg('Undid last move.');
}

function render() {
  const svg = $('#svg'); svg.innerHTML = '';
  const targets = targetsFor(sel);
  const lastSet = new Set(state.last ? [state.last.from, state.last.to] : []);
  for (const k of ALL) {
    const c = parse(k);
    const x = px(c), y = py(c);
    const g = document.createElementNS(SVGNS, 'g');
    g.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')');
    const hole = document.createElementNS(SVGNS, 'circle');
    hole.setAttribute('r', '6'); hole.setAttribute('class', 'hole' + (lastSet.has(k) ? ' last' : ''));
    g.appendChild(hole);
    const owner = state.board[k];
    if (owner) {
      const m = document.createElementNS(SVGNS, 'circle');
      m.setAttribute('r', '5.6'); m.setAttribute('class', 'marble ' + (owner === 'A' ? 'red' : 'blue'));
      g.appendChild(m);
    }
    if (sel === k) { const s = document.createElementNS(SVGNS, 'circle'); s.setAttribute('r', '8'); s.setAttribute('class', 'selected'); g.appendChild(s); }
    if (targets.has(k)) { const t = document.createElementNS(SVGNS, 'circle'); t.setAttribute('r', '3.2'); t.setAttribute('class', 'target'); g.appendChild(t); }
    const hit = document.createElementNS(SVGNS, 'circle');
    hit.setAttribute('r', '9'); hit.setAttribute('class', 'hit'); hit.setAttribute('data-k', k); hit.setAttribute('tabindex', '0');
    hit.setAttribute('role', 'button');
    hit.setAttribute('aria-label', (owner ? NAME[owner] + ' marble' : 'Empty hole') + ' at ' + c.join(', ') + (targets.has(k) ? ', reachable' : ''));
    g.appendChild(hit);
    svg.appendChild(g);
  }
  const turnText = state.winner ? (state.winner === 'draw' ? 'Draw' : NAME[state.winner] + ' won') : NAME[state.turn] + (isComputer(state.turn) ? ' (computer)' : '') + ' to move';
  $('#turn').textContent = turnText;
  const inA = countIn(state.board, 'A', GOAL.A), inB = countIn(state.board, 'B', GOAL.B);
  $('#score').textContent = 'Red in goal ' + inA + '/' + MARBLES + ' · Blue in goal ' + inB + '/' + MARBLES + ' · Move ' + state.ply;
  $('#undo').disabled = !state.history.length || busy;
}

{
  const svg = $('#svg');
  svg.addEventListener('click', e => { const h = e.target.closest && e.target.closest('.hit'); if (h) clickCell(h.dataset.k); });
  svg.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const h = e.target.closest && e.target.closest('.hit'); if (!h) return;
    e.preventDefault(); clickCell(h.dataset.k);
  });
}
$('#new').onclick = fresh;
$('#undo').onclick = undo;
$('#clear').onclick = () => { sel = null; render(); msg('Selection cleared.'); };
$('#mode').onchange = e => { mode = e.target.value; fresh(); };
$('#level').onchange = e => { level = e.target.value; };
fresh();
}
