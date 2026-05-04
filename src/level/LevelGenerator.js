import { SeededRandom } from './SeededRandom.js';
import {
  TILE, COLS, LEVEL_ROWS,
  WALL_TILE, PLATFORM_TILE, SPIKE_TILE, FINISH_TILE,
} from '../constants.js';

/**
 * Generates a level from a numeric seed.
 * Returns grid data, platform list, start/finish positions, and bot waypoints.
 */
export function generateLevel(seedNum) {
  const rng = new SeededRandom(seedNum);
  const grid = Array.from({ length: LEVEL_ROWS }, () => new Array(COLS).fill(0));

  // --- 1. Walls ---
  for (let row = 0; row < LEVEL_ROWS; row++) {
    grid[row][0] = WALL_TILE;
    grid[row][COLS - 1] = WALL_TILE;
  }

  // --- 2. Floor (start area, rows 76-79) ---
  const floorRow = LEVEL_ROWS - 1;
  for (let col = 1; col < COLS - 1; col++) {
    grid[floorRow][col] = PLATFORM_TILE;
  }

  // --- 3. Finish area (rows 2-3) ---
  const finishRow = 3;
  const finishPlatStart = 4;
  const finishPlatEnd = COLS - 4;
  for (let col = finishPlatStart; col < finishPlatEnd; col++) {
    grid[finishRow][col] = PLATFORM_TILE;
  }
  const finishCol = Math.floor(COLS / 2);
  grid[finishRow - 1][finishCol] = FINISH_TILE;
  grid[finishRow - 1][finishCol - 1] = FINISH_TILE;
  grid[finishRow - 1][finishCol + 1] = FINISH_TILE;

  // --- 4. Generate main path platforms ---
  const platforms = [];
  const playableLeft = 1;
  const playableRight = COLS - 2;

  // Start tracking from floor
  let curY = floorRow;
  let curX = Math.floor(COLS / 2);

  // Jump constraints (in tiles)
  const maxJumpH = 3;   // max tiles upward player can reach
  const maxJumpW = 5;   // max tiles horizontal during jump

  while (curY > finishRow + 2) {
    // Go up 2-3 tiles
    const dy = rng.int(2, maxJumpH);
    const nextY = Math.max(finishRow + 1, curY - dy);

    // Move horizontally
    const maxDx = Math.min(maxJumpW - 1, playableRight - curX, curX - playableLeft);
    const dx = rng.int(-Math.min(maxJumpW - 1, curX - playableLeft), Math.min(maxJumpW - 1, playableRight - curX));
    let nextX = curX + dx;
    nextX = Math.max(playableLeft + 1, Math.min(playableRight - 1, nextX));

    // Platform width 2-5
    const width = rng.int(2, 5);
    const halfW = Math.floor(width / 2);
    let startCol = nextX - halfW;
    startCol = Math.max(playableLeft, Math.min(playableRight - width + 1, startCol));
    const endCol = startCol + width;

    // Place platform in grid
    for (let c = startCol; c < endCol && c < playableRight + 1; c++) {
      grid[nextY][c] = PLATFORM_TILE;
    }

    platforms.push({
      row: nextY,
      col: startCol,
      width: Math.min(width, playableRight + 1 - startCol),
      centerX: startCol + Math.floor(width / 2),
      isMain: true,
    });

    curY = nextY;
    curX = startCol + Math.floor(width / 2);
  }

  // --- 5. Side platforms (decoration + alternative routes) ---
  const sidePlatforms = [];
  for (let i = 0; i < platforms.length - 1; i++) {
    if (rng.chance(0.45)) {
      const p1 = platforms[i];
      const p2 = platforms[i + 1];
      const betweenRow = Math.round((p1.row + p2.row) / 2);

      // Place on opposite side of main path
      let sideX;
      const midX = Math.floor(COLS / 2);
      if (p1.centerX > midX) {
        sideX = rng.int(playableLeft + 1, midX - 1);
      } else {
        sideX = rng.int(midX + 1, playableRight - 2);
      }

      const sideW = rng.int(2, 3);
      const sCol = Math.max(playableLeft, Math.min(playableRight - sideW + 1, sideX));

      let overlap = false;
      for (let c = sCol; c < sCol + sideW; c++) {
        if (grid[betweenRow][c] !== 0) { overlap = true; break; }
      }

      if (!overlap) {
        for (let c = sCol; c < sCol + sideW; c++) {
          grid[betweenRow][c] = PLATFORM_TILE;
        }
        sidePlatforms.push({
          row: betweenRow, col: sCol, width: sideW,
          centerX: sCol + Math.floor(sideW / 2), isMain: false,
        });
      }
    }
  }

  // --- 6. Hazards (spikes) ---
  const spikes = [];
  for (const p of platforms) {
    if (rng.chance(0.25) && p.width >= 3) {
      // Place spike on one tile of the platform
      const spikeCol = rng.int(p.col, p.col + p.width - 1);
      const spikeRow = p.row - 1; // spike sits on top of platform (danger zone)
      if (spikeRow > 0 && grid[spikeRow][spikeCol] === 0) {
        grid[spikeRow][spikeCol] = SPIKE_TILE;
        spikes.push({ row: spikeRow, col: spikeCol });
      }
    }
  }

  // Place some floor spikes in gaps
  for (let i = 0; i < platforms.length - 1; i++) {
    if (rng.chance(0.2)) {
      const gapRow = platforms[i].row;
      const gapCol = rng.int(playableLeft + 1, playableRight - 1);
      if (grid[gapRow][gapCol] === 0 && grid[gapRow + 1] && grid[gapRow + 1][gapCol] === 0) {
        // Don't place spikes floating in air, only on solid ground
      }
    }
  }

  // --- 7. Build bot waypoints (follow main path only) ---
  // Sort main platforms bottom-to-top so bot climbs in order
  const mainPlatsSorted = [...platforms].filter(p => p.isMain).sort((a, b) => b.row - a.row);
  const botPath = mainPlatsSorted.map((p) => ({
    x: (p.col + p.width / 2) * TILE + TILE / 2,
    y: p.row * TILE - 2, // stand ON the platform surface
  }));

  // Add finish platform, then finish tile waypoints
  botPath.push({
    x: Math.floor(COLS / 2) * TILE + TILE / 2,
    y: finishRow * TILE - 2,
  });
  botPath.push({
    x: finishCol * TILE + TILE / 2,
    y: (finishRow - 1) * TILE,
  });

  // --- 8. Start and finish positions ---
  const startPos = {
    x: Math.floor(COLS / 2) * TILE,
    y: (floorRow - 1) * TILE,
  };

  const finishPos = {
    x: finishCol * TILE + TILE / 2,
    y: (finishRow - 1) * TILE,
  };

  return {
    grid,
    platforms: [...platforms, ...sidePlatforms],
    spikes,
    startPos,
    finishPos,
    botPath,
    finishRow,
    floorRow,
  };
}

/**
 * Quick validation: check if the main path has enough platforms
 * and reasonable spacing.
 */
export function validateLevel(levelData) {
  if (levelData.platforms.length < 8) return false;
  const mainPlatforms = levelData.platforms.filter((p) => p.isMain);
  if (mainPlatforms.length < 5) return false;

  // Check that consecutive main platforms are within jump range
  const sorted = [...mainPlatforms].sort((a, b) => b.row - a.row);
  for (let i = 0; i < sorted.length - 1; i++) {
    const dy = sorted[i].row - sorted[i + 1].row;
    if (dy > 4) return false; // too far to jump
  }

  return true;
}
