/**
 * ZenLITS - Main Application Logic
 * Interactive UI, responsive touch/drag painting, real-time tetromino shape detection,
 * deductive hints, undo/reset, and local persistence.
 */

document.addEventListener('DOMContentLoaded', () => {
  const audio = new ZenAudio();

  // DOM Elements
  const gridEl = document.getElementById('grid');
  const levelPackEl = document.getElementById('levelPack');
  const levelTitleEl = document.getElementById('levelTitle');
  const levelSizeEl = document.getElementById('levelSize');
  const shadedCountEl = document.getElementById('shadedCount');
  const statusBadgeEl = document.getElementById('statusBadge');
  const statusIconEl = document.getElementById('statusIcon');
  const statusTextEl = document.getElementById('statusText');

  // Controls
  const toolCycleBtn = document.getElementById('toolCycle');
  const toolShadedBtn = document.getElementById('toolShaded');
  const toolDotBtn = document.getElementById('toolDot');
  const btnUndo = document.getElementById('btnUndo');
  const btnHint = document.getElementById('btnHint');
  const btnReset = document.getElementById('btnReset');
  const btnNext = document.getElementById('btnNext');
  const btnLevels = document.getElementById('btnLevels');
  const btnRules = document.getElementById('btnRules');
  const btnAudio = document.getElementById('btnAudio');
  const btnTheme = document.getElementById('btnTheme');

  // Modals
  const modalLevels = document.getElementById('modalLevels');
  const modalRules = document.getElementById('modalRules');
  const modalVictory = document.getElementById('modalVictory');
  const btnCloseLevels = document.getElementById('btnCloseLevels');
  const btnCloseRules = document.getElementById('btnCloseRules');
  const btnVictoryNext = document.getElementById('btnVictoryNext');
  const packTabsEl = document.getElementById('packTabs');
  const levelGridEl = document.getElementById('levelGrid');

  // App State
  let currentLevelIdx = parseInt(gameStorage.getItem('dragon-gaming.lits.level_idx') || '0', 10);
  if (isNaN(currentLevelIdx) || currentLevelIdx < 0 || currentLevelIdx >= LEVELS.length) {
    currentLevelIdx = 0;
  }

  let currentTool = 'cycle'; // 'cycle' | 'shaded' | 'dot'
  let isPointerDown = false;
  let dragTargetState = null;
  let historyStack = [];
  let boardState = []; // rows x cols array of 0 (empty), 1 (shaded), 2 (dot)
  let cellElements = [];
  let isCompleted = false;
  let victoryTimer = null;

  // Sound Button Label
  function updateAudioBtn() {
    btnAudio.textContent = audio.isMuted() ? '🔇' : '🔊';
  }
  updateAudioBtn();

  btnAudio.addEventListener('click', () => {
    const muted = audio.toggleMute();
    updateAudioBtn();
  });

  // Theme Management
  const savedTheme = gameStorage.getItem('dragon-gaming.lits.theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  btnTheme.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    gameStorage.setItem('dragon-gaming.lits.theme', next);
  });

  // Tool Selector
  function setTool(tool) {
    currentTool = tool;
    toolCycleBtn.classList.toggle('active', tool === 'cycle');
    toolShadedBtn.classList.toggle('active', tool === 'shaded');
    toolDotBtn.classList.toggle('active', tool === 'dot');
  }

  toolCycleBtn.addEventListener('click', () => setTool('cycle'));
  toolShadedBtn.addEventListener('click', () => setTool('shaded'));
  toolDotBtn.addEventListener('click', () => setTool('dot'));

  // Account for body padding (24px) and the board's border/padding (24px).
  function sizeBoard(level) {
    const available = Math.min(document.documentElement.clientWidth - 48, 440);
    const size = Math.max(20, Math.min(52, Math.floor(available / level.cols)));
    document.documentElement.style.setProperty('--cell-size', `${size}px`);
  }
  window.addEventListener('resize', () => sizeBoard(LEVELS[currentLevelIdx]));

  // Load Level
  function loadLevel(idx) {
    if (idx < 0 || idx >= LEVELS.length) return;
    clearTimeout(victoryTimer);
    modalVictory.classList.remove('active');
    currentLevelIdx = idx;
    gameStorage.setItem('dragon-gaming.lits.level_idx', String(currentLevelIdx));
    isCompleted = false;
    historyStack = [];

    const level = LEVELS[currentLevelIdx];
    levelPackEl.textContent = level.pack;
    levelTitleEl.textContent = level.name;
    levelSizeEl.textContent = `${level.rows}×${level.cols}`;

    sizeBoard(level);

    // Initialize board state
    boardState = Array.from({ length: level.rows }, () => Array(level.cols).fill(CELL_STATE.EMPTY));

    // Try restoring saved state for this level
    const savedBoard = gameStorage.getItem(`dragon-gaming.lits.board_${level.id}`);
    if (savedBoard) {
      try {
        const parsed = JSON.parse(savedBoard);
        if (Array.isArray(parsed) && parsed.length === level.rows && parsed.every(row => Array.isArray(row) && row.length === level.cols && row.every(cell => [0, 1, 2].includes(cell)))) {
          boardState = parsed;
        }
      } catch (e) {}
    }

    renderGrid(level);
    validateAndUpdateUI();
  }

  // Render Grid
  function renderGrid(level) {
    gridEl.innerHTML = '';
    gridEl.style.gridTemplateColumns = `repeat(${level.cols}, var(--cell-size))`;
    gridEl.style.gridTemplateRows = `repeat(${level.rows}, var(--cell-size))`;

    // Map cell (r, c) to room ID
    const cellToRoom = Array.from({ length: level.rows }, () => Array(level.cols).fill(-1));
    level.rooms.forEach((rm, rIdx) => {
      rm.cells.forEach(([r, c]) => {
        cellToRoom[r][c] = rIdx;
      });
    });

    cellElements = Array.from({ length: level.rows }, () => Array(level.cols).fill(null));

    // Identify top-left cell of each room to place Room Badge
    const roomBadgeCell = Array(level.rooms.length).fill(null);
    level.rooms.forEach((rm, rIdx) => {
      const sorted = [...rm.cells].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
      roomBadgeCell[rIdx] = sorted[0];
    });

    for (let r = 0; r < level.rows; r++) {
      for (let c = 0; c < level.cols; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = r;
        cell.dataset.col = c;

        const myRoom = cellToRoom[r][c];

        // Border walls vs interior lattice lines
        // Top
        if (r === 0 || cellToRoom[r - 1][c] !== myRoom) cell.classList.add('cell-wall-top');
        else cell.classList.add('cell-border-top');

        // Bottom
        if (r === level.rows - 1 || cellToRoom[r + 1][c] !== myRoom) cell.classList.add('cell-wall-bottom');
        else cell.classList.add('cell-border-bottom');

        // Left
        if (c === 0 || cellToRoom[r][c - 1] !== myRoom) cell.classList.add('cell-wall-left');
        else cell.classList.add('cell-border-left');

        // Right
        if (c === level.cols - 1 || cellToRoom[r][c + 1] !== myRoom) cell.classList.add('cell-wall-right');
        else cell.classList.add('cell-border-right');

        // Room badge placeholder if top-left cell of chamber
        if (roomBadgeCell[myRoom] && roomBadgeCell[myRoom][0] === r && roomBadgeCell[myRoom][1] === c) {
          const badge = document.createElement('span');
          badge.className = 'room-badge';
          badge.id = `room-badge-${myRoom}`;
          badge.textContent = '';
          cell.appendChild(badge);
        }

        cellElements[r][c] = cell;
        gridEl.appendChild(cell);
      }
    }

    updateBoardDOM();
  }

  // Update Board DOM from boardState
  function updateBoardDOM() {
    const level = LEVELS[currentLevelIdx];
    for (let r = 0; r < level.rows; r++) {
      for (let c = 0; c < level.cols; c++) {
        const cell = cellElements[r][c];
        if (!cell) continue;

        // Clean existing contents (except badge)
        const badge = cell.querySelector('.room-badge');
        cell.innerHTML = '';
        if (badge) cell.appendChild(badge);

        const st = boardState[r][c];
        if (st === CELL_STATE.SHADED) {
          const block = document.createElement('div');
          block.className = 'timber-block';
          cell.appendChild(block);
        } else if (st === CELL_STATE.DOT) {
          const dot = document.createElement('div');
          dot.className = 'dot-marker';
          cell.appendChild(dot);
        }
      }
    }
  }

  // Cell Interaction
  function applyCellAction(r, c) {
    if (isCompleted) return;
    const curState = boardState[r][c];
    let nextState = curState;

    if (currentTool === 'cycle') {
      if (curState === CELL_STATE.EMPTY) nextState = CELL_STATE.SHADED;
      else if (curState === CELL_STATE.SHADED) nextState = CELL_STATE.DOT;
      else nextState = CELL_STATE.EMPTY;
    } else if (currentTool === 'shaded') {
      nextState = curState === CELL_STATE.SHADED ? CELL_STATE.EMPTY : CELL_STATE.SHADED;
    } else if (currentTool === 'dot') {
      nextState = curState === CELL_STATE.DOT ? CELL_STATE.EMPTY : CELL_STATE.DOT;
    }

    if (nextState !== curState) {
      saveHistory();
      boardState[r][c] = nextState;
      saveBoardState();
      updateBoardDOM();
      validateAndUpdateUI();

      if (nextState === CELL_STATE.SHADED) audio.playChisel();
      else if (nextState === CELL_STATE.DOT) audio.playDot();
      else audio.playUndo();
    }
    dragTargetState = nextState;
  }

  function applyDragAction(r, c) {
    if (isCompleted || dragTargetState === null) return;
    if (boardState[r][c] !== dragTargetState) {
      saveHistory();
      boardState[r][c] = dragTargetState;
      saveBoardState();
      updateBoardDOM();
      validateAndUpdateUI();

      if (dragTargetState === CELL_STATE.SHADED) audio.playChisel();
      else if (dragTargetState === CELL_STATE.DOT) audio.playDot();
    }
  }

  // Pointer / Touch Handling
  gridEl.addEventListener('pointerdown', (e) => {
    audio.ensureContext();
    const cell = e.target.closest('.cell');
    if (!cell) return;
    isPointerDown = true;
    const r = parseInt(cell.dataset.row, 10);
    const c = parseInt(cell.dataset.col, 10);
    applyCellAction(r, c);
  });

  window.addEventListener('pointermove', (e) => {
    if (!isPointerDown) return;
    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (!target) return;
    const cell = target.closest('.cell');
    if (cell && gridEl.contains(cell)) {
      const r = parseInt(cell.dataset.row, 10);
      const c = parseInt(cell.dataset.col, 10);
      applyDragAction(r, c);
    }
  });

  window.addEventListener('pointerup', () => {
    isPointerDown = false;
    dragTargetState = null;
  });

  window.addEventListener('pointercancel', () => {
    isPointerDown = false;
    dragTargetState = null;
  });

  // History & Undo
  function saveHistory() {
    const clone = boardState.map(row => [...row]);
    historyStack.push(clone);
    if (historyStack.length > 50) historyStack.shift();
  }

  btnUndo.addEventListener('click', () => {
    if (isCompleted || historyStack.length === 0) return;
    boardState = historyStack.pop();
    saveBoardState();
    updateBoardDOM();
    validateAndUpdateUI();
    audio.playUndo();
  });

  btnReset.addEventListener('click', () => {
    if (isCompleted) return;
    saveHistory();
    const level = LEVELS[currentLevelIdx];
    boardState = Array.from({ length: level.rows }, () => Array(level.cols).fill(CELL_STATE.EMPTY));
    saveBoardState();
    updateBoardDOM();
    validateAndUpdateUI();
    audio.playUndo();
  });

  btnNext.addEventListener('click', () => {
    if (currentLevelIdx < LEVELS.length - 1) {
      loadLevel(currentLevelIdx + 1);
    }
  });

  // Save board state in local storage
  function saveBoardState() {
    const level = LEVELS[currentLevelIdx];
    gameStorage.setItem(`dragon-gaming.lits.board_${level.id}`, JSON.stringify(boardState));
  }

  // Hint Engine
  btnHint.addEventListener('click', () => {
    if (isCompleted) return;
    audio.ensureContext();
    const level = LEVELS[currentLevelIdx];
    const hint = getHint(boardState, level.rows, level.cols, level.rooms, level.solution);

    // Clear prior hints
    document.querySelectorAll('.cell.hint-highlight').forEach(el => el.classList.remove('hint-highlight'));

    if (hint) {
      const cell = cellElements[hint.row][hint.col];
      if (cell) {
        cell.classList.add('hint-highlight');
        setTimeout(() => cell.classList.remove('hint-highlight'), 3500);
      }
      statusBadgeEl.className = 'status-badge valid';
      statusIconEl.textContent = '💡';
      statusTextEl.textContent = hint.message;
      audio.playChime();
    } else {
      statusBadgeEl.className = 'status-badge normal';
      statusIconEl.textContent = '✨';
      statusTextEl.textContent = 'Chambers are aligned. Continue carefully.';
    }
  });

  // Validation & UI Update
  function validateAndUpdateUI() {
    const level = LEVELS[currentLevelIdx];
    const res = validateBoard(boardState, level.rows, level.cols, level.rooms);

    shadedCountEl.textContent = `${res.totalShaded} / ${res.expectedShaded}`;

    // Clear violation styling
    document.querySelectorAll('.cell.violation-2x2').forEach(el => el.classList.remove('violation-2x2'));
    document.querySelectorAll('.cell.violation-touch').forEach(el => el.classList.remove('violation-touch'));

    // Highlight 2x2 violations
    if (res.violations2x2.length > 0) {
      res.violations2x2.forEach(([r, c]) => {
        for (const [dr, dc] of [[0, 0], [0, 1], [1, 0], [1, 1]]) {
          cellElements[r + dr][c + dc].classList.add('violation-2x2');
        }
      });
      statusBadgeEl.className = 'status-badge error';
      statusIconEl.textContent = '⚠️';
      statusTextEl.textContent = '2×2 solid blocks are prohibited. Mark floor dots.';
      return;
    }

    // Highlight identical touching violations
    if (res.identicalTouches.length > 0) {
      res.identicalTouches.forEach(v => {
        cellElements[v.r1][v.c1].classList.add('violation-touch');
        cellElements[v.r2][v.c2].classList.add('violation-touch');
      });
      const t = res.identicalTouches[0].type;
      statusBadgeEl.className = 'status-badge error';
      statusIconEl.textContent = '⚠️';
      statusTextEl.textContent = `Adjacent rooms cannot share identical ${t} tetrominoes.`;
      return;
    }

    // Update chamber badges with detected tetromino type (L, I, T, S)
    res.roomStatus.forEach(rms => {
      const badge = document.getElementById(`room-badge-${rms.id}`);
      if (badge) {
        if (rms.type) {
          badge.textContent = rms.type;
          badge.className = 'room-badge valid-shape';
        } else if (rms.shadedCount === 4) {
          badge.textContent = '?';
          badge.className = 'room-badge invalid-shape';
        } else {
          badge.textContent = '';
          badge.className = 'room-badge';
        }
      }
    });

    // Check connectivity warning when shaded count reaches expected
    if (res.totalShaded === res.expectedShaded && !res.isConnected) {
      statusBadgeEl.className = 'status-badge error';
      statusIconEl.textContent = '⚠️';
      statusTextEl.textContent = 'All shaded timber blocks must connect in a single orthogonal group.';
      return;
    }

    // Normal progress
    if (!res.isComplete) {
      statusBadgeEl.className = 'status-badge normal';
      statusIconEl.textContent = '🌸';
      statusTextEl.textContent = `${res.totalShaded} / ${res.expectedShaded} timber blocks placed.`;
      return;
    }

    // Level Complete!
    if (!isCompleted) {
      isCompleted = true;
      audio.playVictory();
      markLevelCompleted(level.id);

      statusBadgeEl.className = 'status-badge valid';
      statusIconEl.textContent = '🔔';
      statusTextEl.textContent = 'Temple fully harmonized! Perfect architectural joinery.';

      victoryTimer = setTimeout(() => {
        if (isCompleted && LEVELS[currentLevelIdx].id === level.id) modalVictory.classList.add('active');
      }, 600);
    }
  }

  function markLevelCompleted(id) {
    const key = `dragon-gaming.lits.completed_${id}`;
    gameStorage.setItem(key, 'true');
  }

  function isLevelCompleted(id) {
    return gameStorage.getItem(`dragon-gaming.lits.completed_${id}`) === 'true';
  }

  // Modals & Navigation
  btnRules.addEventListener('click', () => modalRules.classList.add('active'));
  btnCloseRules.addEventListener('click', () => modalRules.classList.remove('active'));

  btnVictoryNext.addEventListener('click', () => {
    modalVictory.classList.remove('active');
    if (currentLevelIdx < LEVELS.length - 1) {
      loadLevel(currentLevelIdx + 1);
    }
  });

  // Level Selection Modal
  const PACK_NAMES = [
    'Engawa • Novice',
    'Shoji • Apprentice',
    'Tatami • Journeyman',
    'Tokonoma • Artisan',
    'Daitokuji • Master'
  ];

  let selectedPackIdx = 0;

  function renderLevelSelect() {
    packTabsEl.innerHTML = '';
    PACK_NAMES.forEach((name, pIdx) => {
      const tab = document.createElement('button');
      tab.className = `pack-tab ${pIdx === selectedPackIdx ? 'active' : ''}`;
      tab.textContent = name;
      tab.addEventListener('click', () => {
        selectedPackIdx = pIdx;
        renderLevelSelect();
      });
      packTabsEl.appendChild(tab);
    });

    levelGridEl.innerHTML = '';
    const packLevels = LEVELS.filter(l => l.pack === PACK_NAMES[selectedPackIdx]);
    packLevels.forEach(lvl => {
      const tile = document.createElement('div');
      const lvlIdx = LEVELS.indexOf(lvl);
      tile.className = 'level-tile';
      if (isLevelCompleted(lvl.id)) tile.classList.add('completed');
      if (lvlIdx === currentLevelIdx) tile.classList.add('current');

      tile.textContent = lvl.id;
      tile.title = lvl.name;

      tile.addEventListener('click', () => {
        modalLevels.classList.remove('active');
        loadLevel(lvlIdx);
      });
      levelGridEl.appendChild(tile);
    });
  }

  btnLevels.addEventListener('click', () => {
    selectedPackIdx = Math.floor(currentLevelIdx / 10);
    renderLevelSelect();
    modalLevels.classList.add('active');
  });

  btnCloseLevels.addEventListener('click', () => modalLevels.classList.remove('active'));

  // Close modals on clicking overlay background
  [modalLevels, modalRules, modalVictory].forEach(mod => {
    mod.addEventListener('click', (e) => {
      if (e.target === mod) mod.classList.remove('active');
    });
  });

  // Start initial level
  loadLevel(currentLevelIdx);
});
