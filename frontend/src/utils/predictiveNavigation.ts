import type { CellData, NavigationMode, RouteResult, TerrainType } from '../types/simulator';
import { runFrontendAStar } from './astar';

export interface LookAheadScanResult {
  hasHazard: boolean;
  hazardCell: [number, number] | null;
  hazardType: TerrainType | 'dynamic_obstacle' | null;
  hazardDistance: number;
  reason: string;
  upcomingCells: [number, number][];
}

/**
 * Computes all grid cells currently covered by the rover's virtual sensor region.
 * Creates a forward sensing window around the rover and its upcoming path within range.
 */
export function getSensorCoverageCells(
  roverPos: [number, number],
  activePath: [number, number][],
  pathIndex: number,
  sensorRange: number,
  rows: number,
  cols: number
): Set<string> {
  const covered = new Set<string>();
  // 1. Always include immediate forward path cells up to sensorRange
  const lookAheadPath = activePath.slice(pathIndex + 1, pathIndex + 1 + sensorRange);
  for (const [r, c] of lookAheadPath) {
    if (r >= 0 && r < rows && c >= 0 && c < cols) {
      covered.add(`${r},${c}`);
      // Include 1-cell adjacent sensing halo along the immediate path
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            covered.add(`${nr},${nc}`);
          }
        }
      }
    }
  }

  // 2. Also cover forward sensing radius around rover based on current heading
  const [rR, rC] = roverPos;
  let dRow = 0;
  let dCol = 1; // default forward direction
  if (lookAheadPath.length > 0) {
    dRow = Math.sign(lookAheadPath[0][0] - rR);
    dCol = Math.sign(lookAheadPath[0][1] - rC);
  }

  for (let step = 1; step <= sensorRange; step++) {
    const fR = rR + dRow * step;
    const fC = rC + dCol * step;
    for (let spread = -1; spread <= 1; spread++) {
      const nr = fR + (dCol !== 0 ? spread : 0);
      const nc = fC + (dRow !== 0 ? spread : 0);
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        covered.add(`${nr},${nc}`);
      }
    }
  }

  return covered;
}

/**
 * Scans ahead along the current active path up to sensorRange cells.
 * Evaluates upcoming terrain risks and blocked nodes deterministically.
 */
export function scanAhead(
  _roverPos: [number, number],
  activePath: [number, number][],
  pathIndex: number,
  sensorRange: number,
  grid: CellData[][],
  navigationMode: NavigationMode
): LookAheadScanResult {
  const upcomingCells: [number, number][] = activePath.slice(
    pathIndex + 1,
    pathIndex + 1 + sensorRange
  );

  if (upcomingCells.length === 0) {
    return {
      hasHazard: false,
      hazardCell: null,
      hazardType: null,
      hazardDistance: 0,
      reason: 'Destination in reach',
      upcomingCells: [],
    };
  }

  // Check upcoming path cells in forward order
  for (let i = 0; i < upcomingCells.length; i++) {
    const [r, c] = upcomingCells[i];
    const cell = grid[r]?.[c];
    if (!cell) continue;

    const distance = i + 1;

    // 1. Dynamic Obstacle or Static Obstacle
    if (cell.isDynamicObstacle) {
      return {
        hasHazard: true,
        hazardCell: [r, c],
        hazardType: 'dynamic_obstacle',
        hazardDistance: distance,
        reason: `Dynamic obstacle detected ${distance} cell${distance > 1 ? 's' : ''} ahead at (${r}, ${c})`,
        upcomingCells,
      };
    }

    if (cell.isObstacle || cell.terrain === 'obstacle') {
      return {
        hasHazard: true,
        hazardCell: [r, c],
        hazardType: 'obstacle',
        hazardDistance: distance,
        reason: `Obstacle detected ${distance} cell${distance > 1 ? 's' : ''} ahead at (${r}, ${c})`,
        upcomingCells,
      };
    }

    // 2. Restricted zone
    if (cell.terrain === 'restricted') {
      return {
        hasHazard: true,
        hazardCell: [r, c],
        hazardType: 'restricted',
        hazardDistance: distance,
        reason: `Restricted zone detected ${distance} cell${distance > 1 ? 's' : ''} ahead at (${r}, ${c})`,
        upcomingCells,
      };
    }

    // 3. High-risk terrain (prioritized in Safest mode or if within close range)
    if (cell.terrain === 'high_risk' && (navigationMode === 'safest' || distance <= 2)) {
      return {
        hasHazard: true,
        hazardCell: [r, c],
        hazardType: 'high_risk',
        hazardDistance: distance,
        reason: `High-risk terrain hazard predicted ${distance} cell${distance > 1 ? 's' : ''} ahead at (${r}, ${c})`,
        upcomingCells,
      };
    }
  }

  return {
    hasHazard: false,
    hazardCell: null,
    hazardType: null,
    hazardDistance: 0,
    reason: 'Upcoming route is clear and safe',
    upcomingCells,
  };
}

/**
 * Runs A* from the current rover position to the destination,
 * ensuring the predicted hazard cell is avoided proactively.
 */
export function findProactiveAlternativeRoute(
  currentPos: [number, number],
  destination: [number, number],
  grid: CellData[][],
  navigationMode: NavigationMode,
  hazardCell?: [number, number] | null
): RouteResult {
  const rows = grid.length;
  const cols = grid[0].length;

  // Clone grid and temporarily ensure the hazard cell is treated as impassable
  const tempGrid: CellData[][] = grid.map((row) =>
    row.map((cell) => ({
      ...cell,
    }))
  );

  if (hazardCell) {
    const [hR, hC] = hazardCell;
    if (hR >= 0 && hR < rows && hC >= 0 && hC < cols) {
      tempGrid[hR][hC].isObstacle = true;
    }
  }

  return runFrontendAStar(currentPos, destination, tempGrid, navigationMode);
}
