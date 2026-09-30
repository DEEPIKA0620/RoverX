from typing import List, Dict, Any
from terrain import TerrainType

def calculate_terrain_safety(grid_data: List[List[Dict]], rows: int, cols: int) -> Dict[str, int]:
    """
    Categorizes all cells into Safe, Risky, and Blocked counts.
    - Safe: NORMAL (Cost 1)
    - Risky: ROUGH (3), DIFFICULT (7), HIGH_RISK (15)
    - Blocked: RESTRICTED (∞), OBSTACLE (∞), or is_obstacle=True
    """
    safe = 0
    risky = 0
    blocked = 0

    for r in range(rows):
        for c in range(cols):
            cell = grid_data[r][c]
            t = cell.get('terrain', 'normal')
            is_b = cell.get('is_obstacle', False) or cell.get('is_dynamic_obstacle', False)

            if is_b or t in ('restricted', 'obstacle'):
                blocked += 1
            elif t in ('rough', 'difficult', 'high_risk'):
                risky += 1
            else:
                safe += 1

    return {
        "safe_cells": safe,
        "risky_cells": risky,
        "blocked_cells": blocked,
        "total_cells": rows * cols
    }

def calculate_risk_exposure(path: List[List[int]], grid_data: List[List[Dict]]) -> str:
    """
    Calculates overall route risk level (LOW, MEDIUM, HIGH) based on average cell cost.
    """
    if not path or len(path) <= 1:
        return "LOW"

    total_weight = 0.0
    for r, c in path:
        cell = grid_data[r][c]
        t = cell.get('terrain', 'normal')
        if t == 'rough':
            total_weight += 3.0
        elif t == 'difficult':
            total_weight += 7.0
        elif t == 'high_risk':
            total_weight += 15.0
        else:
            total_weight += 1.0

    avg_cost = total_weight / len(path)
    if avg_cost > 5.0:
        return "HIGH"
    elif avg_cost > 2.0:
        return "MEDIUM"
    else:
        return "LOW"
