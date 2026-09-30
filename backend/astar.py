import heapq
import time
from typing import List, Tuple, Dict, Any, Optional
from cost_map import NavigationMode, build_cost_matrix

def manhattan_distance(p1: Tuple[int, int], p2: Tuple[int, int]) -> float:
    return abs(p1[0] - p2[0]) + abs(p1[1] - p2[1])

def run_astar(
    start: Tuple[int, int],
    destination: Tuple[int, int],
    cost_matrix: List[List[float]],
    rows: int,
    cols: int
) -> Dict[str, Any]:
    """
    Executes A* pathfinding on a weighted cost matrix.
    f(n) = g(n) + h(n)
    where g(n) is accumulated traversal cost from start,
    and h(n) is Manhattan distance to destination.
    """
    start_time = time.perf_counter()

    s_row, s_col = start
    d_row, d_col = destination

    # Edge cases
    if s_row < 0 or s_row >= rows or s_col < 0 or s_col >= cols:
        return {"success": False, "error": "Start position out of bounds"}
    if d_row < 0 or d_row >= rows or d_col < 0 or d_col >= cols:
        return {"success": False, "error": "Destination position out of bounds"}

    if cost_matrix[s_row][s_col] == float('inf'):
        return {"success": False, "error": "Start cell is blocked"}
    if cost_matrix[d_row][d_col] == float('inf'):
        return {"success": False, "error": "Destination cell is blocked"}

    if start == destination:
        elapsed_ms = (time.perf_counter() - start_time) * 1000.0
        return {
            "success": True,
            "path": [[s_row, s_col]],
            "distance": 0,
            "terrain_cost": 0.0,
            "steps": 1,
            "nodes_explored": 1,
            "planning_time_ms": round(elapsed_ms, 3)
        }

    # Open set priority queue entries: (f_score, g_score, (row, col))
    open_pq = []
    initial_h = manhattan_distance(start, destination)
    heapq.heappush(open_pq, (initial_h, 0.0, start))

    came_from: Dict[Tuple[int, int], Tuple[int, int]] = {}
    g_score: Dict[Tuple[int, int], float] = {start: 0.0}

    nodes_explored = 0
    found = False

    # 4-directional grid movement
    directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]

    while open_pq:
        f, current_g, current = heapq.heappop(open_pq)
        nodes_explored += 1

        if current == destination:
            found = True
            break

        # If we found a shorter path to current already, skip
        if current_g > g_score.get(current, float('inf')):
            continue

        r, c = current
        for dr, dc in directions:
            nr, nc = r + dr, c + dc

            if 0 <= nr < rows and 0 <= nc < cols:
                step_cost = cost_matrix[nr][nc]
                if step_cost == float('inf'):
                    continue

                tentative_g = current_g + step_cost

                neighbor = (nr, nc)
                if tentative_g < g_score.get(neighbor, float('inf')):
                    came_from[neighbor] = current
                    g_score[neighbor] = tentative_g
                    h = manhattan_distance(neighbor, destination)
                    heapq.heappush(open_pq, (tentative_g + h, tentative_g, neighbor))

    elapsed_ms = (time.perf_counter() - start_time) * 1000.0

    if not found:
        return {
            "success": False,
            "error": "No safe route available",
            "planning_time_ms": round(elapsed_ms, 3),
            "nodes_explored": nodes_explored
        }

    # Reconstruct path
    curr = destination
    path = []
    while curr in came_from:
        path.append([curr[0], curr[1]])
        curr = came_from[curr]
    path.append([start[0], start[1]])
    path.reverse()

    # Calculate actual path terrain cost (sum of costs of entered cells)
    path_terrain_cost = 0.0
    for idx in range(1, len(path)):
        r, c = path[idx]
        path_terrain_cost += cost_matrix[r][c]

    return {
        "success": True,
        "path": path,
        "distance": len(path) - 1, # number of step transitions
        "steps": len(path),
        "terrain_cost": round(path_terrain_cost, 2),
        "nodes_explored": nodes_explored,
        "planning_time_ms": round(elapsed_ms, 3)
    }
