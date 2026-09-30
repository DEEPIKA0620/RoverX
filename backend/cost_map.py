from enum import Enum
from typing import List, Dict, Tuple
from terrain import TerrainType, TERRAIN_COSTS

class NavigationMode(str, Enum):
    FASTEST = "fastest"
    BALANCED = "balanced"
    SAFEST = "safest"

def get_effective_cost(terrain: TerrainType, is_blocked: bool, mode: NavigationMode) -> float:
    """
    Calculates the effective cell traversal cost based on terrain type, blocked state,
    and selected navigation strategy mode.
    """
    if is_blocked or terrain in (TerrainType.RESTRICTED, TerrainType.OBSTACLE):
        return float('inf')

    base_cost = TERRAIN_COSTS.get(terrain, 1.0)

    if mode == NavigationMode.FASTEST:
        # FASTEST: Distance priority, dampen high terrain penalties
        return 1.0 + (base_cost - 1.0) * 0.2
    elif mode == NavigationMode.SAFEST:
        # SAFEST: Strongly penalize risky terrain
        if base_cost > 1.0:
            return base_cost * 2.5
        return base_cost
    else: # BALANCED
        return base_cost

def build_cost_matrix(
    rows: int,
    cols: int,
    grid_data: List[List[Dict]],
    mode: NavigationMode = NavigationMode.BALANCED
) -> List[List[float]]:
    """
    Builds a 2D matrix of cell traversal costs.
    """
    matrix = []
    for r in range(rows):
        row_costs = []
        for c in range(cols):
            cell = grid_data[r][c]
            t_type = TerrainType(cell.get('terrain', 'normal'))
            blocked = cell.get('is_obstacle', False) or cell.get('is_dynamic_obstacle', False)
            cost = get_effective_cost(t_type, blocked, mode)
            row_costs.append(cost)
        matrix.append(row_costs)
    return matrix
