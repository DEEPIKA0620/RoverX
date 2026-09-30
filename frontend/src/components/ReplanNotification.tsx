import React from 'react';
import type { MissionStatusState } from '../types/simulator';

interface ReplanNotificationProps {
  status: MissionStatusState;
  replanPhase: 'idle' | 'updating' | 'replanning' | 'found';
  predictivePhase?: 'idle' | 'predicted' | 'replanning' | 'updated';
  predictiveReason?: string;
}

export const ReplanNotification: React.FC<ReplanNotificationProps> = ({
  status,
  replanPhase,
  predictivePhase = 'idle',
  predictiveReason,
}) => {
  // 1. Predictive Look-Ahead Notifications
  if (predictivePhase === 'predicted' || status === 'HAZARD_PREDICTED') {
    return (
      <div className="card px-4 py-3 border-l-4 border-l-amber-500 bg-amber-50 text-sm text-text">
        <p className="font-semibold text-amber-800 flex items-center gap-1.5">
          <span>🔍</span> HAZARD PREDICTED
        </p>
        <p className="text-text-secondary mt-0.5">
          {predictiveReason || 'Upcoming route contains a blocked/high-risk region. Finding a safer route...'}
        </p>
      </div>
    );
  }

  if (predictivePhase === 'replanning') {
    return (
      <div className="card px-4 py-3 border-l-4 border-l-rover-primary bg-blue-50 text-sm text-text">
        <p className="font-semibold text-rover-primary flex items-center gap-1.5">
          <span>↻</span> PROACTIVE REPLANNING
        </p>
        <p className="text-text-secondary mt-0.5">
          Proactively recalculating alternative route from current position...
        </p>
      </div>
    );
  }

  if (predictivePhase === 'updated') {
    return (
      <div className="card px-4 py-3 border-l-4 border-l-success bg-green-50 text-sm text-text">
        <p className="font-semibold text-success flex items-center gap-1.5">
          <span>✓</span> ROUTE UPDATED
        </p>
        <p className="text-text-secondary mt-0.5">Continuing navigation.</p>
      </div>
    );
  }

  // 2. Reactive Obstacle Notifications
  if (status === 'OBSTACLE_DETECTED') {
    return (
      <div className="card px-4 py-3 border-l-4 border-l-danger bg-red-50 text-sm text-text">
        <p className="font-semibold text-danger flex items-center gap-1.5">
          <span>⚠</span> OBSTACLE DETECTED
        </p>
        <p className="text-text-secondary mt-0.5">Current route blocked. Rover stopped.</p>
      </div>
    );
  }

  if (replanPhase === 'updating' || replanPhase === 'replanning' || status === 'REPLANNING') {
    return (
      <div className="card px-4 py-3 border-l-4 border-l-warning bg-orange-50 text-sm text-text">
        <p className="font-semibold text-warning">↻ Recalculating route from current rover position…</p>
      </div>
    );
  }

  if (replanPhase === 'found') {
    return (
      <div className="card px-4 py-3 border-l-4 border-l-success bg-green-50 text-sm text-text">
        <p className="font-semibold text-success">✓ NEW ROUTE FOUND — Navigation resumed.</p>
      </div>
    );
  }

  return null;
};
