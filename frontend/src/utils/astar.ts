import type { CellData, NavigationMode, RouteResult, TerrainType } from '../types/simulator';

export const TERRAIN_BASE_COSTS: Record<TerrainType, number> = {
  normal: 1.0,
  rough: 3.0,
  difficult: 7.0,
  high_risk: 15.0,
  restricted: Infinity,
  obstacle: Infinity,
};

export function getEffectiveCellCost(cell: CellData, mode: NavigationMode): number {
  if (cell.isObstacle || cell.isDynamicObstacle || cell.terrain === 'restricted' || cell.terrain === 'obstacle') {
    return Infinity;
  }

  const baseCost = TERRAIN_BASE_COSTS[cell.terrain] ?? 1.0;

  if (mode === 'fastest') {
    return 1.0 + (baseCost - 1.0) * 0.2;
  } else if (mode === 'safest') {
    return baseCost > 1.0 ? baseCost * 2.5 : baseCost;
  } else {
    return baseCost;
  }
}

export function manhattanDistance(r1: number, c1: number, r2: number, c2: number): number {
  return Math.abs(r1 - r2) + Math.abs(c1 - c2);
}

export function runFrontendAStar(
  start: [number, number],
  destination: [number, number],
  grid: CellData[][],
  mode: NavigationMode = 'balanced'
): RouteResult {
  const startTime = performance.now();
  const rows = grid.length;
  const cols = grid[0].length;

  const [sRow, sCol] = start;
  const [dRow, dCol] = destination;

  if (sRow < 0 || sRow >= rows || sCol < 0 || sCol >= cols) {
    return { success: false, path: [], distance: 0, steps: 0, terrainCost: 0, planningTimeMs: 0, error: 'Start position out of bounds' };
  }
  if (dRow < 0 || dRow >= rows || dCol < 0 || dCol >= cols) {
    return { success: false, path: [], distance: 0, steps: 0, terrainCost: 0, planningTimeMs: 0, error: 'Destination position out of bounds' };
  }

  if (getEffectiveCellCost(grid[sRow][sCol], mode) === Infinity) {
    return { success: false, path: [], distance: 0, steps: 0, terrainCost: 0, planningTimeMs: 0, error: 'Start cell is blocked' };
  }
  if (getEffectiveCellCost(grid[dRow][dCol], mode) === Infinity) {
    return { success: false, path: [], distance: 0, steps: 0, terrainCost: 0, planningTimeMs: 0, error: 'Destination cell is blocked' };
  }

  if (sRow === dRow && sCol === dCol) {
    const elapsed = performance.now() - startTime;
    return {
      success: true,
      path: [[sRow, sCol]],
      distance: 0,
      steps: 1,
      terrainCost: 0,
      nodesExplored: 1,
      planningTimeMs: Number(elapsed.toFixed(2)),
      riskLevel: 'LOW',
    };
  }

  // Priority Queue / Open set representation using simple sorted array or min-heap
  interface PQNode {
    row: number;
    col: number;
    g: number;
    f: number;
  }

  const openSet: PQNode[] = [];
  const gScore: Record<string, number> = {};
  const cameFrom: Record<string, [number, number]> = {};

  const startKey = `${sRow},${sCol}`;
  gScore[startKey] = 0;
  const initialH = manhattanDistance(sRow, sCol, dRow, dCol);
  openSet.push({ row: sRow, col: sCol, g: 0, f: initialH });

  let nodesExplored = 0;
  let found = false;

  const directions = [
    [-1, 0], // Up
    [1, 0],  // Down
    [0, -1], // Left
    [0, 1],  // Right
  ];

  while (openSet.length > 0) {
    // Sort to extract lowest f-score
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift()!;
    nodesExplored++;

    if (current.row === dRow && current.col === dCol) {
      found = true;
      break;
    }

    const currentKey = `${current.row},${current.col}`;
    if (current.g > (gScore[currentKey] ?? Infinity)) {
      continue;
    }

    for (const [dr, dc] of directions) {
      const nr = current.row + dr;
      const nc = current.col + dc;

      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        const cellCost = getEffectiveCellCost(grid[nr][nc], mode);
        if (cellCost === Infinity) continue;

        const tentativeG = current.g + cellCost;
        const neighborKey = `${nr},${nc}`;

        if (tentativeG < (gScore[neighborKey] ?? Infinity)) {
          cameFrom[neighborKey] = [current.row, current.col];
          gScore[neighborKey] = tentativeG;
          const h = manhattanDistance(nr, nc, dRow, dCol);
          openSet.push({ row: nr, col: nc, g: tentativeG, f: tentativeG + h });
        }
      }
    }
  }

  const elapsed = performance.now() - startTime;

  if (!found) {
    return {
      success: false,
      path: [],
      distance: 0,
      steps: 0,
      terrainCost: 0,
      nodesExplored,
      planningTimeMs: Number(elapsed.toFixed(2)),
      error: 'The current terrain configuration does not provide a reachable path.',
    };
  }

  // Reconstruct path
  const path: [number, number][] = [];
  let curr: [number, number] | undefined = [dRow, dCol];

  while (curr) {
    path.push(curr);
    const key: string = `${curr[0]},${curr[1]}`;
    const prev: [number, number] | undefined = cameFrom[key];
    curr = prev;
  }
  path.reverse();

  // Calculate terrain cost (sum of base terrain cost for traversed cells)
  let totalTerrainCost = 0;
  for (let i = 1; i < path.length; i++) {
    const [r, c] = path[i];
    totalTerrainCost += TERRAIN_BASE_COSTS[grid[r][c].terrain] ?? 1.0;
  }

  const avgCost = totalTerrainCost / (path.length || 1);
  const riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = avgCost > 5 ? 'HIGH' : avgCost > 2 ? 'MEDIUM' : 'LOW';

  return {
    success: true,
    path,
    distance: path.length - 1,
    steps: path.length,
    terrainCost: Number(totalTerrainCost.toFixed(2)),
    nodesExplored,
    planningTimeMs: Number(elapsed.toFixed(2)),
    riskLevel,
  };
}

export function calculateTerrainSafety(grid: CellData[][]): {
  safe: number;
  risky: number;
  blocked: number;
  total: number;
} {
  let safe = 0;
  let risky = 0;
  let blocked = 0;
  let total = 0;

  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      total++;
      const cell = grid[r][c];
      if (cell.isObstacle || cell.isDynamicObstacle || cell.terrain === 'restricted' || cell.terrain === 'obstacle') {
        blocked++;
      } else if (cell.terrain === 'rough' || cell.terrain === 'difficult' || cell.terrain === 'high_risk') {
        risky++;
      } else {
        safe++;
      }
    }
  }

  return { safe, risky, blocked, total };
}

