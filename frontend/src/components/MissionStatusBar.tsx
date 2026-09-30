import React from 'react';
import type { MissionMetricsData, MissionStatusState } from '../types/simulator';

interface MissionStatusBarProps {
  metrics: MissionMetricsData;
  status: MissionStatusState;
}

function displayStatus(status: MissionStatusState): string {
  if (status === 'COMPLETED') return 'COMPLETED';
  if (status === 'NAVIGATING') return 'NAVIGATING';
  if (status === 'HAZARD_PREDICTED') return 'HAZARD PREDICTED';
  if (status === 'OBSTACLE_DETECTED') return 'OBSTACLE DETECTED';
  if (status === 'REPLANNING') return 'REPLANNING';
  if (status === 'FAILED') return 'FAILED';
  if (status === 'PLANNING') return 'PLANNING';
  if (status === 'ROUTE_FOUND') return 'ROUTE READY';
  return 'READY';
}

export const MissionStatusBar: React.FC<MissionStatusBarProps> = ({ metrics, status }) => {
  const cell = (label: string, value: string | number, highlight?: boolean) => (
    <div className={`min-w-0 ${highlight ? 'text-sky-900' : ''}`}>
      <div className="text-[10px] uppercase text-text-secondary font-semibold tracking-wide truncate">{label}</div>
      <div className={`text-sm font-semibold truncate ${highlight ? 'text-sky-700 font-bold' : 'text-text'}`}>
        {value}
      </div>
    </div>
  );

  return (
    <div className="card p-4">
      <h3 className="card-title mb-3">Mission Status</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-3 border-b border-border">
        {cell('Status', displayStatus(status))}
        {cell('Progress', `${metrics.progressPercent}%`)}
        {cell('Distance', `${metrics.actualDistance || metrics.plannedDistance} cells`)}
        {cell('Total Replans', metrics.replansCount)}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3">
        {cell('Steps', metrics.steps)}
        {cell('Terrain Cost', metrics.terrainCost)}
        {cell('Hazards Predicted', metrics.hazardsPredicted || 0, true)}
        {cell('Predictive Avoidances', metrics.predictiveAvoidances || 0, true)}
        {cell('Replan Time', `${metrics.replanningTimeMs} ms`)}
      </div>
    </div>
  );
};
