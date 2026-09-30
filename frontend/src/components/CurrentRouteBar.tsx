import React from 'react';
import type { MissionStatusState, NavigationMode } from '../types/simulator';

interface CurrentRouteBarProps {
  distance: number;
  terrainCost: number;
  navigationMode: NavigationMode;
  status: MissionStatusState;
}

function statusLabel(status: MissionStatusState): string {
  switch (status) {
    case 'NAVIGATING':
      return 'Navigating';
    case 'REPLANNING':
    case 'OBSTACLE_DETECTED':
      return 'Replanning';
    case 'COMPLETED':
      return 'Completed';
    case 'ROUTE_FOUND':
      return 'Route ready';
    case 'PLANNING':
      return 'Planning';
    case 'FAILED':
      return 'No route';
    default:
      return 'Ready';
  }
}

export const CurrentRouteBar: React.FC<CurrentRouteBarProps> = ({
  distance,
  terrainCost,
  navigationMode,
  status,
}) => (
  <div className="card px-4 py-3">
    <h3 className="card-title mb-2">Current Route</h3>
    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
      <span>
        <span className="text-text-secondary">Distance: </span>
        <span className="font-medium">{distance} cells</span>
      </span>
      <span>
        <span className="text-text-secondary">Terrain Cost: </span>
        <span className="font-medium">{terrainCost}</span>
      </span>
      <span>
        <span className="text-text-secondary">Mode: </span>
        <span className="font-medium capitalize">{navigationMode}</span>
      </span>
      <span>
        <span className="text-text-secondary">Status: </span>
        <span className="font-medium">{statusLabel(status)}</span>
      </span>
    </div>
  </div>
);
