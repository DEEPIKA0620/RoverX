"""
ROVERX — Predictive Look-Ahead Navigation Module
Rule-based virtual forward sensing and proactive hazard avoidance.
"""
from typing import List, Tuple, Dict, Any, Optional

def scan_ahead(
    rover_pos: Tuple[int, int],
    active_path: List[List[int]],
    path_index: int,
    sensor_range: int,
    grid: List[List[Dict[str, Any]]]
) -> Dict[str, Any]:
    """
    Inspects upcoming cells along the rover's active path within sensor_range.
    Classifies risk deterministically without ML or external AI APIs.
    """
    upcoming_cells = active_path[path_index + 1 : path_index + 1 + sensor_range]

    if not upcoming_cells:
        return {
            "has_hazard": False,
            "hazard_cell": None,
            "hazard_type": None,
            "hazard_distance": 0,
            "reason": "Destination in reach"
        }

    for idx, (r, c) in enumerate(upcoming_cells):
        distance = idx + 1
        cell = grid[r][c]

        is_dynamic = cell.get("is_dynamic_obstacle", False)
        is_obstacle = cell.get("is_obstacle", False)
        terrain = cell.get("terrain", "normal")

        if is_dynamic:
            return {
                "has_hazard": True,
                "hazard_cell": [r, c],
                "hazard_type": "dynamic_obstacle",
                "hazard_distance": distance,
                "reason": f"Dynamic obstacle detected {distance} cells ahead at ({r}, {c})"
            }

        if is_obstacle or terrain == "obstacle":
            return {
                "has_hazard": True,
                "hazard_cell": [r, c],
                "hazard_type": "obstacle",
                "hazard_distance": distance,
                "reason": f"Obstacle detected {distance} cells ahead at ({r}, {c})"
            }

        if terrain == "restricted":
            return {
                "has_hazard": True,
                "hazard_cell": [r, c],
                "hazard_type": "restricted",
                "hazard_distance": distance,
                "reason": f"Restricted zone detected {distance} cells ahead at ({r}, {c})"
            }

        if terrain == "high_risk" and distance <= 2:
            return {
                "has_hazard": True,
                "hazard_cell": [r, c],
                "hazard_type": "high_risk",
                "hazard_distance": distance,
                "reason": f"High risk terrain predicted {distance} cells ahead at ({r}, {c})"
            }

    return {
        "has_hazard": False,
        "hazard_cell": None,
        "hazard_type": None,
        "hazard_distance": 0,
        "reason": "Upcoming route is clear"
    }
