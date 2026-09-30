import random
from typing import List, Dict, Any, Tuple

def create_empty_grid(rows: int = 20, cols: int = 20) -> List[List[Dict]]:
    grid = []
    for r in range(rows):
        row = []
        for c in range(cols):
            row.append({
                "row": r,
                "col": c,
                "terrain": "normal",
                "is_obstacle": False,
                "is_dynamic_obstacle": False
            })
        grid.append(row)
    return grid

def create_demo_scenario() -> Dict[str, Any]:
    """
    Creates a deterministic 20x20 scenario showcasing terrain variations,
    static obstacles, and optimal start/destination coordinates.
    """
    rows, cols = 20, 20
    grid = create_empty_grid(rows, cols)

    # 1. Add Rough terrain zone (middle left to center)
    for r in range(5, 12):
        for c in range(4, 10):
            grid[r][c]["terrain"] = "rough"

    # 2. Add Difficult terrain zone (center to right)
    for r in range(8, 15):
        for c in range(11, 16):
            grid[r][c]["terrain"] = "difficult"

    # 3. Add High Risk zone (diagonal corridor)
    for r in range(12, 17):
        for c in range(6, 11):
            grid[r][c]["terrain"] = "high_risk"

    # 4. Add Static Obstacle wall (forces pathing around obstacles)
    obstacle_cells = [
        (4, 8), (5, 8), (6, 8), (7, 8),
        (10, 5), (10, 6), (10, 7),
        (14, 12), (14, 13), (14, 14), (14, 15)
    ]
    for r, c in obstacle_cells:
        grid[r][c]["is_obstacle"] = True

    return {
        "rows": rows,
        "cols": cols,
        "start": [2, 2],
        "destination": [18, 18],
        "mode": "balanced",
        "grid": grid
    }

def create_random_scenario(rows: int = 20, cols: int = 20) -> Dict[str, Any]:
    """
    Generates a varied terrain grid ensuring a valid path can normally be found.
    """
    grid = create_empty_grid(rows, cols)
    start = [2, 2]
    dest = [rows - 3, cols - 3]

    for r in range(rows):
        for c in range(cols):
            if [r, c] == start or [r, c] == dest:
                continue

            rnd = random.random()
            if rnd < 0.12:
                grid[r][c]["is_obstacle"] = True
            elif rnd < 0.25:
                grid[r][c]["terrain"] = "rough"
            elif rnd < 0.35:
                grid[r][c]["terrain"] = "difficult"
            elif rnd < 0.42:
                grid[r][c]["terrain"] = "high_risk"

    return {
        "rows": rows,
        "cols": cols,
        "start": start,
        "destination": dest,
        "mode": "balanced",
        "grid": grid
    }
