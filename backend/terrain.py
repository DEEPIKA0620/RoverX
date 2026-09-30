from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field

class TerrainType(str, Enum):
    NORMAL = "normal"
    ROUGH = "rough"
    DIFFICULT = "difficult"
    HIGH_RISK = "high_risk"
    RESTRICTED = "restricted"
    OBSTACLE = "obstacle"

# Cost Mapping
TERRAIN_COSTS = {
    TerrainType.NORMAL: 1.0,
    TerrainType.ROUGH: 3.0,
    TerrainType.DIFFICULT: 7.0,
    TerrainType.HIGH_RISK: 15.0,
    TerrainType.RESTRICTED: float('inf'),
    TerrainType.OBSTACLE: float('inf'),
}

class Cell(BaseModel):
    row: int
    col: int
    terrain: TerrainType = TerrainType.NORMAL
    is_obstacle: bool = False
    is_dynamic_obstacle: bool = False

class GridConfig(BaseModel):
    rows: int = 20
    cols: int = 20
