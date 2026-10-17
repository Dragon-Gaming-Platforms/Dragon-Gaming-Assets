/* ============================================================
   hearts.js — game engine, AI, and UI controller
   ============================================================ */

// Seats, clockwise. Index 0 is the human ("south").
const SEATS = ['south', 'west', 'north', 'east'];
const OPP_NAMES = { west: 'Alex', north: 'Robin', east: 'Casey' };

// Passing direction rotates each hand: left, right, across, hold.
const PASS_DIRS = ['left', 'right', 'across', 'hold'];
const PASS_LABEL = { left: 'left', right: 'right', across: 'across', hold: 'keep (no pass)' };

const WIN_SCORE = 100;
const DIFFICULTIES = ['easy', 'normal', 'hard'];
const DIFF_LABEL = { easy: 'Easy', normal: 'Normal', hard: 'Hard' };

const game = {
  players: [],          // [{seat, name, hand:[], isHuman}]
  scores: [0, 0, 0, 0], // cumulative match scores by player index
  roundPoints: [0, 0, 0, 0],
  handNumber: 0,
  passDir: 'left',
  selectedPass: [],     // card ids the human selected to pass
  trick: [],            // [{player, card}]
  leader: 0,            // index of player who leads current trick
  turn: 0,              // whose turn
  heartsBroken: false,
  firstTrick: true,
  phase: 'idle',        // idle | passing | waiting | playing | between
  generation: 0,        // invalidates delayed actions when a new hand starts
  tricksPlayed: 0,
  difficulty: 'normal',
  // AI memory (reset each hand):
  playedCards: [],      // every card id played this hand
  seatVoid: [{}, {}, {}, {}], // seatVoid[p][suit] = true when player p is known void
  moonIntent: [false, false, false, false], // hard AI trying to shoot the moon
};

let dealing = false;    // true only during the initial deal render (drives deal animation)

/* ---------- Persistent match statistics ---------- */
const DEFAULT_STATS = { games: 0, wins: 0, moonsShot: 0, bestScore: null, hands: 0 };
let stats = Object.assign({}, DEFAULT_STATS);
function loadStats() {
  try {
    const s = JSON.parse(localStorage.getItem('hearts-stats'));
    if (s) stats = Object.assign({}, DEFAULT_STATS, s);
  } catch (e) { /* ignore */ }
}
function saveStats() {
  try { localStorage.setItem('hearts-stats', JSON.stringify(stats)); } catch (e) { /* ignore */ }
}
function resetStats() {
  stats = Object.assign({}, DEFAULT_STATS);
  saveStats();
}
function showStats() {
  const t = $('statsTable');
  const winRate = stats.games ? Math.round((stats.wins / stats.games) * 100) : 0;
  const best = stats.bestScore == null ? '—' : stats.bestScore;
  t.innerHTML =
    '<tr><th>Statistic</th><th>Value</th></tr>' +
    `<tr><td class="name-cell">Games played</td><td>${stats.games}</td></tr>` +
    `<tr><td class="name-cell">Games won</td><td>${stats.wins} (${winRate}%)</td></tr>` +
    `<tr><td class="name-cell">Moons shot</td><td>${stats.moonsShot}</td></tr>` +
    `<tr><td class="name-cell">Best winning score</td><td>${best}</td></tr>` +
    `<tr><td class="name-cell">Hands played</td><td>${stats.hands}</td></tr>`;
  $('statsModal').hidden = false;
}

/* ---------- DOM helpers ---------- */
const $ = (id) => document.getElementById(id);
const handEl = { south: null, west: null, north: null, east: null };
const nameEl = { south: null, west: null, north: null, east: null };
const trickEl = { south: null, west: null, north: null, east: null };

function seatIndex(seat) { return SEATS.indexOf(seat); }
function delay(ms) { return new Promise((r) => setTimeout(r, ms)); }
function afterHandDelay(ms, action) {
  const generation = game.generation;
  setTimeout(() => {
    if (generation === game.generation) action();
  }, ms);
}
function status(msg) { $('statusText').textContent = msg; }
function centerMsg(msg) { $('centerMsg').textContent = msg || ''; }

/* ---------- small card helpers ---------- */
function suitOf(c) { return parseCard(c).suit; }
function rankOf(c) { return rankValue(parseCard(c).rank); }
function rankName(c) { return parseCard(c).rank; }
function lowestCard(cards) { return cards.reduce((lo, c) => rankOf(c) < rankOf(lo) ? c : lo, cards[0]); }
function highestCard(cards) { return cards.reduce((hi, c) => rankOf(c) > rankOf(hi) ? c : hi, cards[0]); }
function randomOf(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

/* ============================================================
   Setup / new game
   ============================================================ */
function initRefs() {
  for (const s of SEATS) {
    handEl[s] = $('hand-' + s);
    nameEl[s] = $('name-' + s);
    trickEl[s] = $('trick-' + s);
  }
}

function loadDifficulty() {
  try {
    const saved = localStorage.getItem('hearts-difficulty');
    if (DIFFICULTIES.includes(saved)) return saved;
  } catch (e) { /* ignore */ }
  return 'normal';
}
function saveDifficulty(d) {
  try { localStorage.setItem('hearts-difficulty', d); } catch (e) { /* ignore */ }
}
function updateTitle() {
  $('titleText').textContent = 'Hearts — ' + DIFF_LABEL[game.difficulty];
}

function newMatch(playerName, difficulty) {
  if (DIFFICULTIES.includes(difficulty)) game.difficulty = difficulty;
  saveDifficulty(game.difficulty);
  updateTitle();

  game.players = SEATS.map((seat, i) => ({
    seat,
    name: i === 0 ? (playerName || 'You') : OPP_NAMES[seat],
    hand: [],
    isHuman: i === 0,
  }));
  // Update every nameplate (opponents included).
  for (let i = 0; i < 4; i++) nameEl[SEATS[i]].textContent = game.players[i].name;

  game.scores = [0, 0, 0, 0];
  game.handNumber = 0;
  startNewHand();
}

function startNewHand() {
  game.generation++;
  game.handNumber++;
  game.roundPoints = [0, 0, 0, 0];
  game.passDir = PASS_DIRS[(game.handNumber - 1) % 4];
  game.selectedPass = [];
  game.trick = [];
  game.heartsBroken = false;
  game.firstTrick = true;
  game.tricksPlayed = 0;
  game.playedCards = [];
  game.seatVoid = [{}, {}, {}, {}];
  game.moonIntent = [false, false, false, false];

  // Deal
  const deck = shuffle(buildDeck());
  for (let i = 0; i < 4; i++) game.players[i].hand = deck.slice(i * 13, i * 13 + 13).map(id => id);
  for (const p of game.players) sortHand(p.hand);

  clearTrickArea();

  // Set the phase BEFORE rendering so the player's cards get the correct
  // interaction state (playable during passing, etc.). `dealing` drives the
  // one-shot deal animation on this render only.
  dealing = true;
  if (game.passDir === 'hold') {
    game.phase = 'waiting';
    renderAllHands();
    dealing = false;
    status('No passing this hand. ' + directionText());
    afterHandDelay(550, beginPlay);
  } else {
    game.phase = 'passing';
    renderAllHands();
    dealing = false;
    status(`Select 3 cards to pass ${PASS_LABEL[game.passDir]}, then click "Pass Cards".`);
    centerMsg(`Pass ${PASS_LABEL[game.passDir]}`);
    const btn = $('passBtn');
    btn.hidden = false;
    btn.disabled = true;
    btn.textContent = 'Pass Cards';
  }
}

function directionText() {
  return `Hand ${game.handNumber}`;
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Sort by suit (C,D,S,H grouping like classic) then rank ascending.
const SUIT_ORDER = { C: 0, D: 1, S: 2, H: 3 };
function sortHand(hand) {
  hand.sort((a, b) => {
    const pa = parseCard(a), pb = parseCard(b);
    if (SUIT_ORDER[pa.suit] !== SUIT_ORDER[pb.suit]) return SUIT_ORDER[pa.suit] - SUIT_ORDER[pb.suit];
    return rankValue(pa.rank) - rankValue(pb.rank);
  });
}

/* ============================================================
   Rendering
   ============================================================ */
function renderAllHands() {
  renderPlayerHand();
  renderOpponentHand('west');
  renderOpponentHand('north');
  renderOpponentHand('east');
}

function renderPlayerHand() {
  const el = handEl.south;
  el.innerHTML = '';
  const hand = game.players[0].hand;
  hand.forEach((cardId, i) => {
    const c = makeCardEl(cardId);
    if (dealing) { c.classList.add('deal-anim'); c.style.animationDelay = (i * 24) + 'ms'; }
    if (game.phase === 'passing') {
      c.classList.add('playable');
      if (game.selectedPass.includes(cardId)) c.classList.add('pass-selected');
      c.addEventListener('click', () => togglePassSelect(cardId));
    } else if (game.phase === 'playing' && game.turn === 0) {
      const legal = legalMoves(0);
      if (legal.includes(cardId)) {
        c.classList.add('playable');
        c.addEventListener('click', () => humanPlay(cardId));
      } else {
        c.classList.add('disabled');
      }
    } else {
      c.classList.add('disabled');
    }
    el.appendChild(c);
  });
  fitFan(el, 0.62); // keep every card visible, whatever the screen width
}

function renderOpponentHand(seat) {
  const el = handEl[seat];
  el.innerHTML = '';
  const count = game.players[seatIndex(seat)].hand.length;
  for (let i = 0; i < count; i++) {
    const back = makeCardBack();
    if (dealing) { back.classList.add('deal-anim'); back.style.animationDelay = (i * 24) + 'ms'; }
    el.appendChild(back);
  }
  if (seat === 'north') fitFan(el, 0.5);
  else fitFanV(el, 0.28);
}

// Horizontal fan: set each card's negative left-margin so all `n` cards fit the
// table width. Uses layout width (offsetWidth), which ignores the deal animation's
// transient scale. Capped at `maxVisibleFrac` so wide screens don't over-spread.
function fitFan(el, maxVisibleFrac) {
  const cards = el.children;
  const n = cards.length;
  if (!n) return;
  const cardW = cards[0].offsetWidth || 1;
  const avail = $('table').clientWidth - 10;
  let step = (n === 1) ? cardW : Math.min(cardW * maxVisibleFrac, (avail - cardW) / (n - 1));
  if (step < 7) step = 7;
  const ml = Math.round(step - cardW) + 'px';
  for (let i = 0; i < n; i++) cards[i].style.marginLeft = (i === 0) ? '0px' : ml;
}

// Vertical fan (west / east) — same idea against the table height.
function fitFanV(el, maxVisibleFrac) {
  const cards = el.children;
  const n = cards.length;
  if (!n) return;
  const cardH = cards[0].offsetHeight || 1;
  const avail = $('table').clientHeight - 70; // leave room for the nameplate
  let step = (n === 1) ? cardH : Math.min(cardH * maxVisibleFrac, (avail - cardH) / (n - 1));
  if (step < 6) step = 6;
  const mt = Math.round(step - cardH) + 'px';
  for (let i = 0; i < n; i++) cards[i].style.marginTop = (i === 0) ? '0px' : mt;
}

function clearTrickArea() {
  for (const s of SEATS) trickEl[s].innerHTML = '';
  centerMsg('');
}

function setActiveSeat(idx) {
  for (const s of SEATS) nameEl[s].classList.remove('active');
  if (idx != null && idx >= 0) nameEl[SEATS[idx]].classList.add('active');
}

/* ============================================================
   Passing phase
   ============================================================ */
function togglePassSelect(cardId) {
  if (game.phase !== 'passing') return;
  const i = game.selectedPass.indexOf(cardId);
  if (i >= 0) {
    game.selectedPass.splice(i, 1);
  } else {
    if (game.selectedPass.length >= 3) return; // max 3
    game.selectedPass.push(cardId);
  }
  renderPlayerHand();
  const btn = $('passBtn');
  btn.disabled = game.selectedPass.length !== 3;
  status(`Selected ${game.selectedPass.length} of 3 cards to pass ${PASS_LABEL[game.passDir]}.`);
}

function passTargetIndex(fromIdx, dir) {
  // Seat order is clockwise. "left" = next clockwise seat.
  switch (dir) {
    case 'left':   return (fromIdx + 1) % 4;
    case 'right':  return (fromIdx + 3) % 4;
    case 'across': return (fromIdx + 2) % 4;
    default:       return fromIdx;
  }
}

function doPass() {
  if (game.selectedPass.length !== 3) return;

  // Gather each player's 3 cards to pass
  const passing = [];
  passing[0] = game.selectedPass.slice();
  for (let i = 1; i < 4; i++) passing[i] = aiChoosePass(i);

  // Remove from hands, then distribute
  const incoming = [[], [], [], []];
  for (let i = 0; i < 4; i++) {
    const target = passTargetIndex(i, game.passDir);
    for (const card of passing[i]) {
      const h = game.players[i].hand;
      h.splice(h.indexOf(card), 1);
      incoming[target].push(card);
    }
  }
  for (let i = 0; i < 4; i++) {
    game.players[i].hand.push(...incoming[i]);
    sortHand(game.players[i].hand);
  }

  game.selectedPass = [];
  $('passBtn').hidden = true;
  centerMsg('');
  game.phase = 'waiting';
  Sound.play('pass');

  // Briefly flag received cards in status
  status(`You received: ${incoming[0].map(prettyCard).join(', ')}`);
  renderAllHands();
  afterHandDelay(900, beginPlay);
}

function prettyCard(id) {
  const { rank, suit } = parseCard(id);
  return rank + SUIT_INFO[suit].glyph;
}

/* ============================================================
   Play phase
   ============================================================ */
function beginPlay() {
  game.phase = 'playing';
  // Player with 2 of Clubs leads
  let leader = 0;
  for (let i = 0; i < 4; i++) if (game.players[i].hand.includes('2C')) leader = i;
  game.leader = leader;
  game.turn = leader;
  game.trick = [];
  game.firstTrick = true;

  // Hard AI: decide whether each computer player will try to shoot the moon,
  // based on the strength of the hand it now holds.
  game.moonIntent = [false, false, false, false];
  if (game.difficulty === 'hard') {
    for (let i = 1; i < 4; i++) game.moonIntent[i] = evaluateMoon(i);
  }

  status(`${game.players[leader].name} leads with the 2${SUIT_INFO.C.glyph}.`);
  advanceTurn();
}

function currentLedSuit() {
  return game.trick.length ? parseCard(game.trick[0].card).suit : null;
}

function legalMoves(playerIdx) {
  const hand = game.players[playerIdx].hand;
  const led = currentLedSuit();

  // First trick, first card must be 2 of Clubs.
  if (game.firstTrick && game.trick.length === 0) {
    return hand.includes('2C') ? ['2C'] : hand.slice();
  }

  if (led) {
    const followers = hand.filter(c => parseCard(c).suit === led);
    if (followers.length) {
      // On first trick, cannot dump point cards even when following (unless forced).
      if (game.firstTrick) {
        const safe = followers.filter(c => !isPointCard(c));
        return safe.length ? safe : followers;
      }
      return followers;
    }
    // Void in led suit — can play anything, but no points on first trick if avoidable.
    if (game.firstTrick) {
      const safe = hand.filter(c => !isPointCard(c));
      return safe.length ? safe : hand.slice();
    }
    return hand.slice();
  }

  // Leading a trick.
  if (!game.heartsBroken) {
    const nonHearts = hand.filter(c => parseCard(c).suit !== 'H');
    if (nonHearts.length) return nonHearts;   // can't lead hearts until broken
  }
  return hand.slice();
}

function isPointCard(card) {
  const { suit } = parseCard(card);
  return suit === 'H' || card === 'QS';
}
function cardPoints(card) {
  const { suit } = parseCard(card);
  if (card === 'QS') return 13;
  if (suit === 'H') return 1;
  return 0;
}

async function advanceTurn() {
  setActiveSeat(game.turn);

  if (game.turn === 0) {
    // Human's turn — enable clickable cards.
    if (game.phase === 'playing') {
      renderPlayerHand();
      const legal = legalMoves(0);
      status(legal.length === 1
        ? `You must play ${prettyCard(legal[0])}.`
        : 'Your turn — click a card to play.');
    }
    return; // wait for click
  }

  // A new match can be started while an AI animation is pending.
  const generation = game.generation;
  const playerIdx = game.turn;
  await delay(650);
  if (generation !== game.generation || game.phase !== 'playing' || game.turn !== playerIdx) return;
  const card = aiChoosePlay(playerIdx);
  playCard(playerIdx, card);
}

function humanPlay(cardId) {
  // The last card leaves the turn on its player until the trick animation ends.
  // Ignore a second click during that window instead of playing a fifth card.
  if (game.phase !== 'playing' || game.turn !== 0 || game.trick.length >= 4) return;
  if (!legalMoves(0).includes(cardId)) return;
  playCard(0, cardId);
}

function playCard(playerIdx, cardId) {
  const p = game.players[playerIdx];
  const idx = p.hand.indexOf(cardId);
  if (idx < 0) return;

  // AI memory: record voids (player couldn't follow the led suit).
  const led = currentLedSuit();
  if (led && suitOf(cardId) !== led) game.seatVoid[playerIdx][led] = true;

  p.hand.splice(idx, 1);
  game.playedCards.push(cardId);
  Sound.play('card');

  if (suitOf(cardId) === 'H') game.heartsBroken = true;

  game.trick.push({ player: playerIdx, card: cardId });

  // Render the played card into the center slot for that seat (with entry animation).
  const slot = trickEl[p.seat];
  slot.innerHTML = '';
  const cardNode = makeCardEl(cardId);
  cardNode.classList.add('enter-' + p.seat);
  slot.appendChild(cardNode);

  // Update that player's hand display.
  if (playerIdx === 0) renderPlayerHand(); else renderOpponentHand(p.seat);

  centerMsg('');

  if (game.trick.length === 4) {
    game.phase = 'waiting';
    setActiveSeat(-1);
    afterHandDelay(850, resolveTrick);
  } else {
    game.turn = (game.turn + 1) % 4;
    advanceTurn();
  }
}

function resolveTrick() {
  const led = parseCard(game.trick[0].card).suit;
  let winner = game.trick[0];
  for (const play of game.trick) {
    const pc = parseCard(play.card);
    if (pc.suit === led && rankValue(pc.rank) > rankValue(parseCard(winner.card).rank)) {
      winner = play;
    }
  }
  const pts = game.trick.reduce((s, p) => s + cardPoints(p.card), 0);
  game.roundPoints[winner.player] += pts;

  if (pts > 0) {
    floatPoints(winner.player, pts);
    Sound.play('points');
    status(`${game.players[winner.player].name} takes the trick (+${pts}).`);
  } else {
    Sound.play('trick');
    status(`${game.players[winner.player].name} takes the trick.`);
  }

  game.firstTrick = false;
  game.tricksPlayed++;
  game.leader = winner.player;
  game.turn = winner.player;
  game.trick = [];

  afterHandDelay(700, () => {
    clearTrickArea();
    if (game.tricksPlayed === 13) {
      endHand();
    } else {
      game.phase = 'playing';
      advanceTurn();
    }
  });
}

function floatPoints(playerIdx, pts) {
  const seat = SEATS[playerIdx];
  const anchor = nameEl[seat];
  const rect = anchor.getBoundingClientRect();
  const el = document.createElement('div');
  el.className = 'points-float';
  el.textContent = '+' + pts;
  el.style.left = rect.left + rect.width / 2 + 'px';
  el.style.top = rect.top + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

/* ============================================================
   End of hand / scoring
   ============================================================ */
function endHand() {
  // Check for shooting the moon.
  let shooter = -1;
  for (let i = 0; i < 4; i++) if (game.roundPoints[i] === 26) shooter = i;

  const gained = [0, 0, 0, 0];
  if (shooter >= 0) {
    for (let i = 0; i < 4; i++) gained[i] = i === shooter ? 0 : 26;
  } else {
    for (let i = 0; i < 4; i++) gained[i] = game.roundPoints[i];
  }
  for (let i = 0; i < 4; i++) game.scores[i] += gained[i];

  game.phase = 'between';
  setActiveSeat(-1);

  let note;
  if (shooter >= 0) {
    note = `${game.players[shooter].name} shot the moon! Everyone else +26.`;
  } else {
    note = 'Hand complete.';
  }

  const gameOver = game.scores.some(s => s >= WIN_SCORE);

  // ---- Statistics ----
  stats.hands += 1;
  if (shooter === 0) stats.moonsShot += 1; // you shot the moon
  if (gameOver) {
    stats.games += 1;
    const minScore = Math.min(...game.scores);
    const youWon = game.scores[0] === minScore;
    if (youWon) {
      stats.wins += 1;
      if (stats.bestScore == null || game.scores[0] < stats.bestScore) stats.bestScore = game.scores[0];
    }
  }
  saveStats();

  // ---- Sound ----
  if (shooter >= 0) {
    Sound.play('moon');
  } else if (gameOver) {
    Sound.play(game.scores[0] === Math.min(...game.scores) ? 'win' : 'lose');
  }

  showScore(gained, note, gameOver);
}

/* ============================================================
   Scoreboard
   ============================================================ */
function showScore(gained, note, gameOver) {
  const table = $('scoreTable');
  const minScore = Math.min(...game.scores);

  let html = '<tr><th>Player</th><th>This hand</th><th>Total</th></tr>';
  for (let i = 0; i < 4; i++) {
    const isLeader = game.scores[i] === minScore;
    const cls = (i === 0 ? 'you-row ' : '') + (isLeader && gameOver ? 'leader' : '');
    html += `<tr class="${cls}">
      <td class="name-cell">${game.players[i].name}</td>
      <td>${gained ? '+' + gained[i] : '—'}</td>
      <td class="total-col">${game.scores[i]}</td>
    </tr>`;
  }
  table.innerHTML = html;

  const noteEl = $('scoreNote');
  const okBtn = $('scoreOk');
  if (gameOver) {
    const winnerIdx = game.scores.indexOf(minScore);
    const win = game.players[winnerIdx];
    noteEl.innerHTML = win.isHuman
      ? '<strong>🎉 You win with the lowest score!</strong>'
      : `<strong>${win.name} wins with the lowest score.</strong>`;
    okBtn.textContent = 'New Game';
    okBtn.dataset.action = 'newgame';
  } else {
    noteEl.textContent = note || '';
    okBtn.textContent = 'Next Hand';
    okBtn.dataset.action = 'next';
  }
  $('scoreModal').hidden = false;
}

/* ============================================================
   AI knowledge helpers
   ============================================================ */
function pointsTakenSoFar() {
  return game.roundPoints.reduce((a, b) => a + b, 0);
}
// True if some OTHER player currently holds every point taken so far (a moon threat).
function someoneShooting(mySeat) {
  const tot = pointsTakenSoFar();
  if (tot === 0) return false;
  for (let q = 0; q < 4; q++) {
    if (q !== mySeat && game.roundPoints[q] === tot) return true;
  }
  return false;
}
// Highest rank of `suit` that is neither in my hand nor already played — i.e. a card
// an opponent could still hold. Returns -1 if none outstanding.
function highestOutstanding(suit, playerIdx) {
  const mine = new Set(game.players[playerIdx].hand);
  const played = new Set(game.playedCards);
  let best = -1;
  for (const r of RANKS) {
    const id = r + suit;
    if (!mine.has(id) && !played.has(id)) best = Math.max(best, rankValue(r));
  }
  return best;
}
function currentWinningRank(led) {
  let winRank = -1;
  for (const p of game.trick) {
    const pc = parseCard(p.card);
    if (pc.suit === led) winRank = Math.max(winRank, rankValue(pc.rank));
  }
  return winRank;
}

/* ============================================================
   AI — shooting the moon (offense, hard only)
   ============================================================ */
// Rough strength score for taking every point card this hand.
function evaluateMoon(playerIdx) {
  const hand = game.players[playerIdx].hand;
  let s = 0;
  for (const c of hand) {
    const r = rankName(c), suit = suitOf(c);
    if (r === 'A') s += 3; else if (r === 'K') s += 2; else if (r === 'Q') s += 1;
    if (suit === 'H') { if (r === 'A') s += 2; else if (r === 'K') s += 1; }
  }
  const hearts = hand.filter(c => suitOf(c) === 'H').length;
  if (hearts >= 6) s += 3; else if (hearts >= 5) s += 1;
  if (hand.includes('QS')) s += 2;
  // Low cards will lose tricks — penalise them.
  s -= hand.filter(c => rankOf(c) <= 2).length; // 2s, 3s, 4s (rank values 0..2)
  return s >= 14;
}
// The moon is still on only while no OTHER player has taken any points.
function moonViable(playerIdx) {
  for (let q = 0; q < 4; q++) {
    if (q !== playerIdx && game.roundPoints[q] > 0) return false;
  }
  return true;
}
// Play to win every trick: lead sure winners high, follow to win, keep points.
function aiMoonPlay(playerIdx, legal, led) {
  if (!led) {
    const sureWinners = legal.filter(c => rankOf(c) > highestOutstanding(suitOf(c), playerIdx));
    return highestCard(sureWinners.length ? sureWinners : legal);
  }
  const followers = legal.filter(c => suitOf(c) === led);
  if (followers.length) {
    const winRank = currentWinningRank(led);
    const winners = followers.filter(c => rankOf(c) > winRank);
    if (winners.length) return highestCard(winners); // grab the trick
    return lowestCard(followers);                    // can't win — spend the smallest
  }
  // Void: can't win this trick, so keep our winners and point cards; pitch the lowest plain card.
  const nonPoint = legal.filter(c => !isPointCard(c));
  return lowestCard(nonPoint.length ? nonPoint : legal);
}

/* ============================================================
   AI — passing
   ============================================================ */
function aiChoosePass(playerIdx) {
  const hand = game.players[playerIdx].hand.slice();

  // Easy: pass three random cards.
  if (game.difficulty === 'easy') {
    return shuffle(hand).slice(0, 3);
  }

  // Normal / Hard: shed the most dangerous cards.
  const danger = (c) => {
    const { rank, suit } = parseCard(c);
    let score = rankValue(rank);
    if (c === 'QS') score += 40;
    if (suit === 'S' && (rank === 'A' || rank === 'K')) score += 25; // could be forced to eat the Queen
    if (suit === 'H') score += 8 + rankValue(rank);
    return score;
  };
  hand.sort((a, b) => danger(b) - danger(a));
  return hand.slice(0, 3);
}

/* ============================================================
   AI — playing
   ============================================================ */
function aiChoosePlay(playerIdx) {
  const legal = legalMoves(playerIdx);
  if (legal.length === 1) return legal[0];

  // Easy just plays a random legal card.
  if (game.difficulty === 'easy') return randomOf(legal);

  const led = currentLedSuit();
  const hard = game.difficulty === 'hard';

  // ---- Moon offense (hard AI committed to shooting the moon) ----
  if (hard && game.moonIntent[playerIdx]) {
    if (moonViable(playerIdx)) return aiMoonPlay(playerIdx, legal, led);
    game.moonIntent[playerIdx] = false; // someone else took points — abort, play normally
  }

  // ---- Leading a trick ----
  if (!led) {
    const nonPoint = legal.filter(c => !isPointCard(c));
    let pool = nonPoint.length ? nonPoint : legal;

    if (hard) {
      // Avoid leading spades while still holding the Queen (risk of being forced to play it).
      if (game.players[playerIdx].hand.includes('QS')) {
        const nonSpade = pool.filter(c => suitOf(c) !== 'S');
        if (nonSpade.length) pool = nonSpade;
      }
    }
    return lowestCard(pool); // lead low and safe
  }

  const followers = legal.filter(c => suitOf(c) === led);
  const trickPoints = game.trick.reduce((s, p) => s + cardPoints(p.card), 0);

  // ---- Following suit ----
  if (followers.length) {
    const winRank = currentWinningRank(led);
    const isLast = game.trick.length === 3;

    // Hard: if an opponent is threatening to shoot the moon and points are on the
    // table, grab the trick to break it if we can.
    if (hard && someoneShooting(playerIdx) && trickPoints > 0) {
      const winners = followers.filter(c => rankOf(c) > winRank);
      if (winners.length) return lowestCard(winners);
    }

    // Prefer not to volunteer our own Queen of Spades while following spades.
    let pool = followers;
    if (led === 'S' && pool.includes('QS') && pool.length > 1) {
      pool = pool.filter(c => c !== 'QS');
    }

    // Duck: play the highest card that still loses (shed a high card safely).
    const under = pool.filter(c => rankOf(c) < winRank);
    if (under.length) return highestCard(under);

    // Cannot duck.
    if (isLast && trickPoints === 0) return lowestCard(pool); // harmless to win; play low

    if (hard) {
      // If we're going to win regardless, dump our highest card in the suit.
      const sureWin = isLast || rankOf(lowestCard(pool)) > highestOutstanding(led, playerIdx);
      if (sureWin) return highestCard(pool);
    }
    return lowestCard(pool); // give later players a chance to overtake
  }

  // ---- Void in led suit: discard ----
  // Dump the Queen of Spades onto someone else's trick — the single best discard.
  if (legal.includes('QS')) return 'QS';

  if (hard) {
    // Shed high spades that could later be forced to capture the Queen.
    const highSpades = legal.filter(c => suitOf(c) === 'S' && (rankName(c) === 'A' || rankName(c) === 'K'));
    if (highSpades.length) return highestCard(highSpades);
    // Otherwise pitch the highest heart, then the highest card overall.
    const hearts = legal.filter(c => suitOf(c) === 'H');
    if (hearts.length) return highestCard(hearts);
    return highestCard(legal);
  }

  // Normal discard.
  const spadeHigh = legal.filter(c => { const p = parseCard(c); return p.suit === 'S' && (p.rank === 'A' || p.rank === 'K'); });
  if (spadeHigh.length) return spadeHigh[0];
  const hearts = legal.filter(c => suitOf(c) === 'H');
  if (hearts.length) return highestCard(hearts);
  return highestCard(legal);
}

/* ============================================================
   UI wiring
   ============================================================ */
function wireUI() {
  $('passBtn').addEventListener('click', doPass);

  $('scoreOk').addEventListener('click', () => {
    $('scoreModal').hidden = true;
    const action = $('scoreOk').dataset.action;
    if (action === 'newgame') {
      openNewGame();
    } else {
      startNewHand();
    }
  });
  $('scoreClose').addEventListener('click', () => { $('scoreModal').hidden = true; });

  $('menuGame').addEventListener('click', openNewGame);
  $('menuHelp').addEventListener('click', () => { $('helpModal').hidden = false; });

  $('menuStats').addEventListener('click', showStats);
  $('statsOk').addEventListener('click', () => { $('statsModal').hidden = true; });
  $('statsClose').addEventListener('click', () => { $('statsModal').hidden = true; });
  $('statsReset').addEventListener('click', () => { resetStats(); showStats(); });

  $('soundToggle').addEventListener('click', () => {
    Sound.toggle();
    updateSoundButton();
  });

  $('newGameOk').addEventListener('click', () => {
    const name = $('playerNameInput').value.trim() || 'You';
    const diffInput = document.querySelector('input[name="difficulty"]:checked');
    const diff = diffInput ? diffInput.value : 'normal';
    $('newGameModal').hidden = true;
    newMatch(name, diff);
  });
  $('newGameCancel').addEventListener('click', () => { $('newGameModal').hidden = true; });
  $('newGameClose').addEventListener('click', () => { $('newGameModal').hidden = true; });

  $('helpOk').addEventListener('click', () => { $('helpModal').hidden = true; });
  $('helpClose').addEventListener('click', () => { $('helpModal').hidden = true; });

  $('playerNameInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') $('newGameOk').click();
  });
}

function updateSoundButton() {
  const btn = $('soundToggle');
  btn.innerHTML = Sound.enabled ? '&#128266; Sound' : '&#128263; Muted';
}

function openNewGame() {
  $('newGameModal').hidden = false;
  const input = $('playerNameInput');
  if (game.players[0]) input.value = game.players[0].name;
  // Reflect the current/saved difficulty in the picker.
  const target = document.querySelector(`input[name="difficulty"][value="${game.difficulty}"]`);
  if (target) target.checked = true;
  input.focus();
  input.select();
}

/* ---------- Boot ---------- */
window.addEventListener('DOMContentLoaded', () => {
  initRefs();
  wireUI();
  Sound.load();
  updateSoundButton();
  loadStats();
  game.difficulty = loadDifficulty();
  updateTitle();
  // Start first game immediately with the saved/default difficulty.
  newMatch('You', game.difficulty);
});

// Re-fit the fans when the viewport changes (orientation / resize).
let resizeTimer = null;
window.addEventListener('resize', () => {
  if (!game.players.length) return;
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => renderAllHands(), 120);
});

// Expose internals for debugging / automated testing.
window.hearts = {
  game, startNewHand, showScore, newMatch,
  evaluateMoon, aiMoonPlay, aiChoosePlay,
  getStats: () => stats,
};
