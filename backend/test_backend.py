import sys
import os

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from simulation import create_demo_scenario, create_empty_grid
from cost_map import build_cost_matrix, NavigationMode
from astar import run_astar
from replanning import replan_route
from metrics import calculate_terrain_safety, calculate_risk_exposure

def test_demo_scenario_astar():
    print("Testing A* on Demo Scenario...")
    scenario = create_demo_scenario()
    rows = scenario["rows"]
    cols = scenario["cols"]
    grid = scenario["grid"]
    start = tuple(scenario["start"])
    dest = tuple(scenario["destination"])

    cost_matrix = build_cost_matrix(rows, cols, grid, NavigationMode.BALANCED)
    res = run_astar(start, dest, cost_matrix, rows, cols)

    assert res["success"] is True, f"A* failed: {res.get('error')}"
    assert len(res["path"]) > 0
    assert res["path"][0] == list(start)
    assert res["path"][-1] == list(dest)
    print(f"  ✓ Path found: {len(res['path'])} steps, distance: {res['distance']}, cost: {res['terrain_cost']}, time: {res['planning_time_ms']}ms")

def test_dynamic_replanning():
    print("Testing Dynamic Replanning...")
    scenario = create_demo_scenario()
    rows = scenario["rows"]
    cols = scenario["cols"]
    grid = scenario["grid"]
    start = tuple(scenario["start"])
    dest = tuple(scenario["destination"])

    # 1. Initial Plan
    cost_matrix = build_cost_matrix(rows, cols, grid, NavigationMode.BALANCED)
    initial_res = run_astar(start, dest, cost_matrix, rows, cols)
    initial_path = initial_res["path"]

    # Pick a cell on the initial path (index 5)
    obstacle_cell = initial_path[5]
    r, c = obstacle_cell[0], obstacle_cell[1]

    # Block cell dynamically
    grid[r][c]["is_dynamic_obstacle"] = True

    # Rover position at index 4 (1 step before obstacle)
    curr_pos = tuple(initial_path[4])

    # Replan from current position
    replan_res = replan_route(curr_pos, dest, grid, rows, cols, NavigationMode.BALANCED)

    assert replan_res["success"] is True, f"Replanning failed: {replan_res.get('error')}"
    assert replan_res["path"][0] == list(curr_pos)
    assert replan_res["path"][-1] == list(dest)
    assert [r, c] not in replan_res["path"], "Blocked cell appeared in replanned path!"
    print(f"  ✓ Replanned path found from current pos {curr_pos}: {len(replan_res['path'])} steps, time: {replan_res['replanning_time_ms']}ms")

def test_navigation_modes():
    print("Testing Navigation Modes (FASTEST, BALANCED, SAFEST)...")
    scenario = create_demo_scenario()
    rows, cols, grid = scenario["rows"], scenario["cols"], scenario["grid"]
    start, dest = tuple(scenario["start"]), tuple(scenario["destination"])

    c_fastest = build_cost_matrix(rows, cols, grid, NavigationMode.FASTEST)
    c_safest = build_cost_matrix(rows, cols, grid, NavigationMode.SAFEST)

    res_fast = run_astar(start, dest, c_fastest, rows, cols)
    res_safe = run_astar(start, dest, c_safest, rows, cols)

    assert res_fast["success"] and res_safe["success"]
    print(f"  ✓ FASTEST Cost: {res_fast['terrain_cost']} | SAFEST Cost: {res_safe['terrain_cost']}")

def test_safety_metrics():
    print("Testing Safety Metrics...")
    scenario = create_demo_scenario()
    metrics = calculate_terrain_safety(scenario["grid"], 20, 20)
    assert metrics["total_cells"] == 400
    print(f"  ✓ Safe: {metrics['safe_cells']}, Risky: {metrics['risky_cells']}, Blocked: {metrics['blocked_cells']}")

if __name__ == "__main__":
    print("\n--- ROVERX BACKEND ENGINE VERIFICATION ---")
    test_demo_scenario_astar()
    test_dynamic_replanning()
    test_navigation_modes()
    test_safety_metrics()
    print("--- ALL BACKEND TESTS PASSED SUCCESSFULLY! ---\n")
