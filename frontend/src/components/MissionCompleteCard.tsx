import React from 'react';
import type { MissionMetricsData } from '../types/simulator';

interface MissionCompleteCardProps {
  visible: boolean;
  metrics: MissionMetricsData;
  onRunAgain: () => void;
  onReset: () => void;
}

export const MissionCompleteCard: React.FC<MissionCompleteCardProps> = ({
  visible,
  metrics,
  onRunAgain,
  onReset,
}) => {
  if (!visible) return null;

  return (
    <div className="card p-6 text-center border-success/30 bg-green-50/50 shadow-md">
      <div className="flex items-center justify-center gap-2">
        <p className="text-xl font-bold text-success">✓ MISSION COMPLETED</p>
        <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded border border-emerald-300">
          SUCCESS
        </span>
      </div>
      <p className="text-sm text-text-secondary mt-1">
        Destination reached successfully with autonomous path planning.
      </p>

      {/* Grid of Key Mission Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5 p-3 bg-white/80 rounded-lg border border-border text-center text-xs">
        <div className="p-2 rounded bg-surface-muted border border-border/60">
          <div className="text-[10px] uppercase font-semibold text-text-secondary">Distance</div>
          <div className="text-sm font-bold text-navy mt-0.5">
            {metrics.actualDistance || metrics.plannedDistance} cells
          </div>
        </div>
        <div className="p-2 rounded bg-surface-muted border border-border/60">
          <div className="text-[10px] uppercase font-semibold text-text-secondary">Terrain Cost</div>
          <div className="text-sm font-bold text-navy mt-0.5">{metrics.terrainCost}</div>
        </div>
        <div className="p-2 rounded bg-sky-50 border border-sky-200">
          <div className="text-[10px] uppercase font-semibold text-sky-800">Predictive Avoidances</div>
          <div className="text-sm font-bold text-sky-700 mt-0.5">{metrics.predictiveAvoidances || 0}</div>
        </div>
        <div className="p-2 rounded bg-amber-50 border border-amber-200">
          <div className="text-[10px] uppercase font-semibold text-amber-800">Reactive Replans</div>
          <div className="text-sm font-bold text-amber-700 mt-0.5">{metrics.reactiveReplansCount || 0}</div>
        </div>
        <div className="p-2 rounded bg-indigo-50 border border-indigo-200 col-span-2 sm:col-span-1">
          <div className="text-[10px] uppercase font-semibold text-indigo-800">Total Replans</div>
          <div className="text-sm font-bold text-indigo-700 mt-0.5">{metrics.replansCount || 0}</div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mt-5">
        <button type="button" onClick={onRunAgain} className="px-5 py-2 text-sm btn-demo">
          RUN AGAIN
        </button>
        <button type="button" onClick={onReset} className="px-5 py-2 text-sm btn-secondary">
          RESET
        </button>
      </div>
    </div>
  );
};
