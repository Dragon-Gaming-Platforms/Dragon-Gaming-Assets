/**
 * ZenLITS - Japanese Tetromino Architecture Logic Engine (LITS / ＬＩＴＳ)
 * Pure JavaScript logic puzzle solver, validator, and hint engine.
 */

const TETRO_MAP = {
  // L (8 orientations: 4 rotations x 2 reflections)
  '0,0;1,0;2,0;2,1': 'L',
  '0,0;0,1;0,2;1,0': 'L',
  '0,0;0,1;1,1;2,1': 'L',
  '0,2;1,0;1,1;1,2': 'L',
  '0,1;1,1;2,0;2,1': 'L',
  '0,0;1,0;1,1;1,2': 'L',
  '0,0;0,1;1,0;2,0': 'L',
  '0,0;0,1;0,2;1,2': 'L',

  // I (2 orientations: vertical and horizontal)
  '0,0;1,0;2,0;3,0': 'I',
  '0,0;0,1;0,2;0,3': 'I',

  // T (4 orientations)
  '0,0;0,1;0,2;1,1': 'T',
  '0,1;1,0;1,1;2,1': 'T',
  '0,1;1,0;1,1;1,2': 'T',
  '0,0;1,0;1,1;2,0': 'T',

  // S (4 orientations: 2 for S, 2 for Z; both classified as S in LITS)
  '0,1;0,2;1,0;1,1': 'S',
  '0,0;1,0;1,1;2,1': 'S',
  '0,0;0,1;1,1;1,2': 'S',
  '0,1;1,0;1,1;2,0': 'S'
};

const CELL_STATE = {
  EMPTY: 0,
  SHADED: 1, // Tetromino block ●
  DOT: 2     // Unshaded confirmed ·
};

/**
 * Classify 4 cells into an L, I, T, or S tetromino.
 * Returns 'L' | 'I' | 'T' | 'S' or null if not a valid tetromino.
 */
function getTetrominoType(cells) {
  if (!Array.isArray(cells) || cells.length !== 4) return null;
  const minR = Math.min(...cells.map(p => p[0]));
  const minC = Math.min(...cells.map(p => p[1]));
  const norm = cells
    .map(([r, c]) => [r - minR, c - minC])
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const key = norm.map(([r, c]) => `${r},${c}`).join(';');
  return TETRO_MAP[key] || null;
}

/**
 * Find all valid 4-cell tetromino placements inside a room.
 */
function getValidRoomTetrominoes(roomCells) {
  const n = roomCells.length;
  if (n < 4) return [];
  const results = [];

  function combinations(start, chosen) {
    if (chosen.length === 4) {
      const type = getTetrominoType(chosen);
      if (type) {
        results.push({ cells: [...chosen], type });
      }
      return;
    }
    for (let i = start; i < n; i++) {
      chosen.push(roomCells[i]);
      combinations(i + 1, chosen);
      chosen.pop();
    }
  }

  combinations(0, []);
  return results;
}

/**
 * Validates the current board state.
 */
function validateBoard(grid, rows, cols, rooms) {
  const cellToRoom = Array.from({ length: rows }, () => Array(cols).fill(-1));
  rooms.forEach((rm, idx) => {
    rm.cells.forEach(([r, c]) => {
      cellToRoom[r][c] = idx;
    });
  });

  const roomStatus = [];
  const roomTetroType = Array(rooms.length).fill(null);
  let allRoomsValid = true;
  let totalShaded = 0;

  // 1. Check each room's shaded cells
  for (let idx = 0; idx < rooms.length; idx++) {
    const rm = rooms[idx];
    const shadedCells = rm.cells.filter(([r, c]) => grid[r][c] === CELL_STATE.SHADED);
    totalShaded += shadedCells.length;

    let type = null;
    let valid = false;
    const errors = [];

    if (shadedCells.length === 4) {
      type = getTetrominoType(shadedCells);
      if (type) {
        valid = true;
        roomTetroType[idx] = type;
      } else {
        errors.push('The 4 shaded cells do not form a valid L, I, T, or S tetromino.');
        allRoomsValid = false;
      }
    } else if (shadedCells.length > 4) {
      errors.push(`Chamber has ${shadedCells.length} shaded cells (exactly 4 required).`);
      allRoomsValid = false;
    } else {
      // Pending
      allRoomsValid = false;
    }

    roomStatus.push({
      id: idx,
      name: rm.name || `Chamber ${idx + 1}`,
      shadedCount: shadedCells.length,
      type,
      valid,
      errors
    });
  }

  // 2. Check 2x2 solid shaded blocks
  const violations2x2 = [];
  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols - 1; c++) {
      if (
        grid[r][c] === CELL_STATE.SHADED &&
        grid[r + 1][c] === CELL_STATE.SHADED &&
        grid[r][c + 1] === CELL_STATE.SHADED &&
        grid[r + 1][c + 1] === CELL_STATE.SHADED
      ) {
        violations2x2.push([r, c]);
      }
    }
  }

  // 3. Check identical tetrominoes touching orthogonally across rooms
  const identicalTouches = [];
  const DIRS = [[0, 1], [1, 0]];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== CELL_STATE.SHADED) continue;
      const rm1 = cellToRoom[r][c];
      const type1 = roomTetroType[rm1];
      if (!type1) continue;

      for (const [dr, dc] of DIRS) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < rows && nc < cols && grid[nr][nc] === CELL_STATE.SHADED) {
          const rm2 = cellToRoom[nr][nc];
          if (rm1 !== rm2) {
            const type2 = roomTetroType[rm2];
            if (type2 && type1 === type2) {
              identicalTouches.push({
                r1: r, c1: c, room1: rm1,
                r2: nr, c2: nc, room2: rm2,
                type: type1
              });
            }
          }
        }
      }
    }
  }

  // 4. Check global connectivity of all shaded cells
  let isConnected = true;
  let shadedConnectedCount = 0;
  if (totalShaded > 0) {
    let startR = -1, startC = -1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] === CELL_STATE.SHADED) {
          startR = r;
          startC = c;
          break;
        }
      }
      if (startR !== -1) break;
    }

    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    const queue = [[startR, startC]];
    visited[startR][startC] = true;
    shadedConnectedCount = 1;

    const ORTHO = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    while (queue.length > 0) {
      const [cr, cc] = queue.shift();
      for (const [dr, dc] of ORTHO) {
        const nr = cr + dr;
        const nc = cc + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          if (!visited[nr][nc] && grid[nr][nc] === CELL_STATE.SHADED) {
            visited[nr][nc] = true;
            shadedConnectedCount++;
            queue.push([nr, nc]);
          }
        }
      }
    }

    isConnected = (shadedConnectedCount === totalShaded);
  }

  const isComplete =
    allRoomsValid &&
    violations2x2.length === 0 &&
    identicalTouches.length === 0 &&
    totalShaded === rooms.length * 4 &&
    isConnected;

  return {
    isComplete,
    allRoomsValid,
    totalShaded,
    expectedShaded: rooms.length * 4,
    roomStatus,
    violations2x2,
    identicalTouches,
    isConnected,
    shadedConnectedCount
  };
}

/**
 * Solve a LITS puzzle and count all unique solutions.
 */
function solveLITS(rows, cols, rooms, maxSolutions = 2, timeLimitMs = 150) {
  const cellToRoom = Array.from({ length: rows }, () => Array(cols).fill(-1));
  rooms.forEach((rm, idx) => {
    rm.cells.forEach(([r, c]) => {
      cellToRoom[r][c] = idx;
    });
  });

  // Precompute valid tetrominoes for each room
  const roomOptions = rooms.map(rm => getValidRoomTetrominoes(rm.cells));

  // If any room cannot form any tetromino, no solution
  for (let i = 0; i < rooms.length; i++) {
    if (roomOptions[i].length === 0) {
      return { count: 0, solutions: [], timedOut: false };
    }
  }

  // Sort room processing order by Minimum Remaining Values (MRV)
  const roomOrder = Array.from({ length: rooms.length }, (_, i) => i)
    .sort((a, b) => roomOptions[a].length - roomOptions[b].length);

  const grid = Array.from({ length: rows }, () => Array(cols).fill(0));
  const assignedTetros = Array(rooms.length).fill(null);
  const solutions = [];
  const deadline = Date.now() + timeLimitMs;
  let timedOut = false;

  function canPlace(roomIdx, option) {
    const { cells, type } = option;

    // Check cells placement doesn't create 2x2 with already placed cells
    for (const [r, c] of cells) {
      grid[r][c] = 1;
    }

    let has2x2 = false;
    for (const [r, c] of cells) {
      for (const [dr, dc] of [[-1, -1], [-1, 0], [0, -1], [0, 0]]) {
        const tr = r + dr;
        const tc = c + dc;
        if (
          tr >= 0 && tr < rows - 1 &&
          tc >= 0 && tc < cols - 1 &&
          grid[tr][tc] === 1 &&
          grid[tr + 1][tc] === 1 &&
          grid[tr][tc + 1] === 1 &&
          grid[tr + 1][tc + 1] === 1
        ) {
          has2x2 = true;
          break;
        }
      }
      if (has2x2) break;
    }

    if (has2x2) {
      for (const [r, c] of cells) grid[r][c] = 0;
      return false;
    }

    // Check no identical tetromino touches orthogonally in adjacent rooms
    let touchesIdentical = false;
    const ORTHO = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [r, c] of cells) {
      for (const [dr, dc] of ORTHO) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 1) {
          const otherRm = cellToRoom[nr][nc];
          if (otherRm !== roomIdx && assignedTetros[otherRm] === type) {
            touchesIdentical = true;
            break;
          }
        }
      }
      if (touchesIdentical) break;
    }

    // Unplace
    for (const [r, c] of cells) grid[r][c] = 0;
    return !touchesIdentical;
  }

  let steps = 0;
  function search(orderIdx) {
    if (solutions.length >= maxSolutions) return;
    if ((++steps & 255) === 0 && Date.now() > deadline) {
      timedOut = true;
      return;
    }

    if (orderIdx === roomOrder.length) {
      // All rooms assigned, check global connectivity
      const totalShaded = rooms.length * 4;
      let startR = -1, startC = -1;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (grid[r][c] === 1) {
            startR = r;
            startC = c;
            break;
          }
        }
        if (startR !== -1) break;
      }

      if (startR === -1) return;

      const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
      const queue = [[startR, startC]];
      visited[startR][startC] = true;
      let connectedCount = 1;

      const ORTHO = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      while (queue.length > 0) {
        const [cr, cc] = queue.shift();
        for (const [dr, dc] of ORTHO) {
          const nr = cr + dr;
          const nc = cc + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 1 && !visited[nr][nc]) {
            visited[nr][nc] = true;
            connectedCount++;
            queue.push([nr, nc]);
          }
        }
      }

      if (connectedCount === totalShaded) {
        solutions.push(grid.map(row => [...row]));
      }
      return;
    }

    const roomIdx = roomOrder[orderIdx];
    const options = roomOptions[roomIdx];

    for (const option of options) {
      if (canPlace(roomIdx, option)) {
        for (const [r, c] of option.cells) grid[r][c] = 1;
        assignedTetros[roomIdx] = option.type;

        search(orderIdx + 1);

        for (const [r, c] of option.cells) grid[r][c] = 0;
        assignedTetros[roomIdx] = null;
        if (solutions.length >= maxSolutions || timedOut) return;
      }
    }
  }

  search(0);
  return {
    count: solutions.length,
    isUnique: !timedOut && solutions.length === 1,
    solutions,
    timedOut
  };
}

/**
 * Deductive hint generator for player guidance.
 */
function getHint(grid, rows, cols, rooms, solvedGrid) {
  // 1. Look for obvious 2x2 prevention (3 shaded cells in a 2x2)
  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols - 1; c++) {
      const quad = [
        [r, c], [r + 1, c], [r, c + 1], [r + 1, c + 1]
      ];
      const shaded = quad.filter(([qr, qc]) => grid[qr][qc] === CELL_STATE.SHADED);
      const empty = quad.filter(([qr, qc]) => grid[qr][qc] === CELL_STATE.EMPTY);

      if (shaded.length === 3 && empty.length === 1) {
        const [er, ec] = empty[0];
        return {
          row: er,
          col: ec,
          targetState: CELL_STATE.DOT,
          message: `To prevent a solid 2×2 block, cell (${er + 1}, ${ec + 1}) must remain unshaded.`
        };
      }
    }
  }

  // 2. Chamber capacity check: if remaining non-dot cells in a room equals 4 - current shaded
  for (let rmIdx = 0; rmIdx < rooms.length; rmIdx++) {
    const rm = rooms[rmIdx];
    const shaded = rm.cells.filter(([r, c]) => grid[r][c] === CELL_STATE.SHADED);
    const available = rm.cells.filter(([r, c]) => grid[r][c] !== CELL_STATE.DOT);
    const empty = rm.cells.filter(([r, c]) => grid[r][c] === CELL_STATE.EMPTY);

    if (shaded.length < 4 && available.length === 4 && empty.length > 0) {
      const [er, ec] = empty[0];
      return {
        row: er,
        col: ec,
        targetState: CELL_STATE.SHADED,
        message: `${rm.name || 'This chamber'} requires 4 shaded cells and only 4 candidate spots remain.`
      };
    }

    if (shaded.length === 4 && empty.length > 0) {
      const [er, ec] = empty[0];
      return {
        row: er,
        col: ec,
        targetState: CELL_STATE.DOT,
        message: `${rm.name || 'This chamber'} already has its 4-cell tetromino. Mark remaining open floor.`
      };
    }
  }

  // 3. Fallback to solution-guided hint
  if (solvedGrid) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] === CELL_STATE.EMPTY) {
          const target = solvedGrid[r][c] === 1 ? CELL_STATE.SHADED : CELL_STATE.DOT;
          return {
            row: r,
            col: c,
            targetState: target,
            message: target === CELL_STATE.SHADED
              ? `Cell (${r + 1}, ${c + 1}) is part of a harmonious tetromino shape.`
              : `Cell (${r + 1}, ${c + 1}) should remain unshaded floor.`
          };
        }
      }
    }
  }

  return null;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TETRO_MAP,
    CELL_STATE,
    getTetrominoType,
    getValidRoomTetrominoes,
    validateBoard,
    solveLITS,
    getHint
  };
}
