import time
from typing import List, Tuple, Dict, Any
from cost_map import NavigationMode, build_cost_matrix
from astar import run_astar

def replan_route(
    current_position: Tuple[int, int],
    destination: Tuple[int, int],
    grid_data: List[List[Dict]],
    rows: int,
    cols: int,
    mode: NavigationMode = NavigationMode.BALANCED
) -> Dict[str, Any]:
    """
    Triggers dynamic route replanning starting from the rover's CURRENT position.
    Updates cost map with new dynamic obstacles and computes a new route.
    """
    replan_start = time.perf_counter()

    # Rebuild cost matrix with new obstacle inputs
    cost_matrix = build_cost_matrix(rows, cols, grid_data, mode)

    # Run A* pathfinding from current position
    result = run_astar(current_position, destination, cost_matrix, rows, cols)

    replan_ms = (time.perf_counter() - replan_start) * 1000.0
    result["replanning_time_ms"] = round(replan_ms, 3)
    result["replan_start_position"] = list(current_position)

    return result
