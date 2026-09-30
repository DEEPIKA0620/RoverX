import time
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from terrain import TerrainType, GridConfig
from cost_map import NavigationMode, build_cost_matrix
from astar import run_astar
from replanning import replan_route
from simulation import create_demo_scenario, create_random_scenario
from metrics import calculate_terrain_safety, calculate_risk_exposure

app = FastAPI(
    title="ROVERX Path Planning API",
    description="Adaptive Autonomous Rover Path Planning & Dynamic Replanning API Engine",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas for API Requests
class PlanRequest(BaseModel):
    rows: int = 20
    cols: int = 20
    start: List[int] # [row, col]
    destination: List[int] # [row, col]
    mode: NavigationMode = NavigationMode.BALANCED
    grid: List[List[Dict[str, Any]]]

class ReplanRequest(BaseModel):
    rows: int = 20
    cols: int = 20
    current_position: List[int] # [row, col]
    destination: List[int] # [row, col]
    mode: NavigationMode = NavigationMode.BALANCED
    grid: List[List[Dict[str, Any]]]

class ObstacleAddRequest(BaseModel):
    grid: List[List[Dict[str, Any]]]
    obstacle_position: List[int] # [row, col]
    is_dynamic: bool = True

class SafetyRequest(BaseModel):
    rows: int = 20
    cols: int = 20
    grid: List[List[Dict[str, Any]]]

@app.get("/")
def read_root():
    return {
        "system": "ROVERX Autonomous Path Planning Engine",
        "status": "ONLINE",
        "algorithm": "Weighted A*",
        "replanning_support": True
    }

@app.get("/api/demo")
def get_demo_scenario():
    """Returns predefined deterministic 20x20 scenario for hackathon judges."""
    return create_demo_scenario()

@app.get("/api/random")
def get_random_scenario(rows: int = 20, cols: int = 20):
    """Generates a random terrain map with safe pathways."""
    return create_random_scenario(rows, cols)

@app.post("/api/plan")
def calculate_plan(req: PlanRequest):
    """
    Calculates initial path using weighted A* pathfinding.
    """
    cost_matrix = build_cost_matrix(req.rows, req.cols, req.grid, req.mode)
    start_tuple = (req.start[0], req.start[1])
    dest_tuple = (req.destination[0], req.destination[1])

    res = run_astar(start_tuple, dest_tuple, cost_matrix, req.rows, req.cols)
    if res.get("success"):
        res["risk_level"] = calculate_risk_exposure(res["path"], req.grid)
    return res

@app.post("/api/replan")
def calculate_replan(req: ReplanRequest):
    """
    Triggers dynamic route replanning starting from rover's CURRENT position.
    """
    curr_tuple = (req.current_position[0], req.current_position[1])
    dest_tuple = (req.destination[0], req.destination[1])

    res = replan_route(curr_tuple, dest_tuple, req.grid, req.rows, req.cols, req.mode)
    if res.get("success"):
        res["risk_level"] = calculate_risk_exposure(res["path"], req.grid)
    return res

@app.post("/api/obstacles")
def add_obstacle(req: ObstacleAddRequest):
    """
    Adds a static or dynamic obstacle to the grid.
    """
    r, c = req.obstacle_position[0], req.obstacle_position[1]
    updated_grid = req.grid

    if 0 <= r < len(updated_grid) and 0 <= c < len(updated_grid[0]):
        cell = updated_grid[r][c]
        if req.is_dynamic:
            cell["is_dynamic_obstacle"] = True
        else:
            cell["is_obstacle"] = True

    return {
        "success": True,
        "obstacle_position": [r, c],
        "is_dynamic": req.is_dynamic,
        "grid": updated_grid
    }

@app.post("/api/metrics/safety")
def get_safety_metrics(req: SafetyRequest):
    """
    Calculates count of Safe, Risky, and Blocked cells.
    """
    return calculate_terrain_safety(req.grid, req.rows, req.cols)
