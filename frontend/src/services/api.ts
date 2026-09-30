import type { CellData, NavigationMode, RouteResult } from '../types/simulator';
import { runFrontendAStar } from '../utils/astar';

const API_BASE_URL = 'http://localhost:8000/api';

export async function planRouteApi(
  start: [number, number],
  destination: [number, number],
  grid: CellData[][],
  mode: NavigationMode = 'balanced'
): Promise<RouteResult> {
  const rows = grid.length;
  const cols = grid[0].length;

  try {
    const response = await fetch(`${API_BASE_URL}/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rows,
        cols,
        start,
        destination,
        mode,
        grid: grid.map((row) =>
          row.map((cell) => ({
            row: cell.row,
            col: cell.col,
            terrain: cell.terrain,
            is_obstacle: cell.isObstacle,
            is_dynamic_obstacle: cell.isDynamicObstacle ?? false,
          }))
        ),
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        return {
          success: true,
          path: data.path,
          distance: data.distance,
          steps: data.steps,
          terrainCost: data.terrain_cost,
          nodesExplored: data.nodes_explored,
          planningTimeMs: data.planning_time_ms,
          riskLevel: data.risk_level ?? 'LOW',
        };
      } else {
        return {
          success: false,
          path: [],
          distance: 0,
          steps: 0,
          terrainCost: 0,
          planningTimeMs: data.planning_time_ms ?? 0,
          error: data.error || 'Path planning failed',
        };
      }
    }
  } catch (err) {
    console.warn('Backend API unavailable, executing frontend embedded pathfinding fallback engine.', err);
  }

  // Fallback to embedded A* engine
  return runFrontendAStar(start, destination, grid, mode);
}

export async function replanRouteApi(
  currentPosition: [number, number],
  destination: [number, number],
  grid: CellData[][],
  mode: NavigationMode = 'balanced'
): Promise<RouteResult> {
  const rows = grid.length;
  const cols = grid[0].length;

  try {
    const response = await fetch(`${API_BASE_URL}/replan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rows,
        cols,
        current_position: currentPosition,
        destination,
        mode,
        grid: grid.map((row) =>
          row.map((cell) => ({
            row: cell.row,
            col: cell.col,
            terrain: cell.terrain,
            is_obstacle: cell.isObstacle,
            is_dynamic_obstacle: cell.isDynamicObstacle ?? false,
          }))
        ),
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        return {
          success: true,
          path: data.path,
          distance: data.distance,
          steps: data.steps,
          terrainCost: data.terrain_cost,
          nodesExplored: data.nodes_explored,
          planningTimeMs: data.planning_time_ms ?? 0,
          replanningTimeMs: data.replanning_time_ms ?? 0,
          riskLevel: data.risk_level ?? 'LOW',
        };
      } else {
        return {
          success: false,
          path: [],
          distance: 0,
          steps: 0,
          terrainCost: 0,
          planningTimeMs: 0,
          replanningTimeMs: data.replanning_time_ms ?? 0,
          error: data.error || 'Replanning failed',
        };
      }
    }
  } catch (err) {
    console.warn('Backend API unavailable, executing frontend embedded replanning fallback engine.');
  }

  // Fallback to embedded A* engine
  const startTime = performance.now();
  const res = runFrontendAStar(currentPosition, destination, grid, mode);
  const replanMs = performance.now() - startTime;
  res.replanningTimeMs = Number(replanMs.toFixed(2));
  return res;
}
