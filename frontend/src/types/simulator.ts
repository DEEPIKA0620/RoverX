export type TerrainType = 'normal' | 'rough' | 'difficult' | 'high_risk' | 'restricted' | 'obstacle';

export type NavigationMode = 'fastest' | 'balanced' | 'safest';

export type AutonomousMode = 'reactive' | 'predictive';

export type ToolMode = 'start' | 'destination' | 'terrain' | 'obstacle' | 'dynamic_obstacle';

export type MissionStatusState =
  | 'READY'
  | 'PLANNING'
  | 'ROUTE_FOUND'
  | 'NAVIGATING'
  | 'HAZARD_PREDICTED'
  | 'OBSTACLE_DETECTED'
  | 'REPLANNING'
  | 'COMPLETED'
  | 'FAILED';

export interface CellData {
  row: number;
  col: number;
  terrain: TerrainType;
  isObstacle: boolean;
  isDynamicObstacle?: boolean;
}

export interface RouteResult {
  success: boolean;
  path: [number, number][];
  distance: number;
  steps: number;
  terrainCost: number;
  nodesExplored?: number;
  planningTimeMs: number;
  replanningTimeMs?: number;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  error?: string;
}

export interface RoverState {
  position: [number, number];
  targetDestination: [number, number];
  currentPath: [number, number][];
  pathIndex: number;
  status: MissionStatusState;
}

export interface MissionMetricsData {
  plannedDistance: number;
  actualDistance: number;
  steps: number;
  terrainCost: number;
  planningTimeMs: number;
  replanningTimeMs: number;
  replansCount: number;
  predictiveAvoidances: number;
  hazardsPredicted: number;
  reactiveReplansCount: number;
  progressPercent: number;
  safetyBreakdown: {
    safe: number;
    risky: number;
    blocked: number;
    total: number;
  };
}

export interface EventLogItem {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'danger' | 'replan' | 'predictive';
}
