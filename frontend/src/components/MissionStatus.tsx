import React from 'react';
import type { CellData, MissionStatusState, TerrainType } from '../types/simulator';

interface MissionStatusProps {
  status: MissionStatusState;
  roverPos: [number, number];
  destPos: [number, number];
  progressPercent: number;
  stepsTravelled: number;
  stepsPlanned: number;
  grid: CellData[][];
}

function terrainLabel(type: TerrainType): string {
  return type.replace('_', ' ').toUpperCase();
}

export const MissionStatus: React.FC<MissionStatusProps> = ({
  status,
  roverPos,
  destPos,
  progressPercent,
  stepsTravelled,
  stepsPlanned,
  grid,
}) => {
  const cell = grid[roverPos[0]]?.[roverPos[1]];
  const currentTerrain = cell ? terrainLabel(cell.terrain) : 'UNKNOWN';

  const statusLine =
    status === 'NAVIGATING'
      ? 'NAVIGATING'
      : status === 'REPLANNING'
        ? 'REPLANNING'
        : status === 'OBSTACLE_DETECTED'
          ? 'OBSTACLE DETECTED'
          : status === 'COMPLETED'
            ? 'COMPLETED'
            : status === 'FAILED'
              ? 'FAILED'
              : status === 'PLANNING'
                ? 'PLANNING'
                : status === 'ROUTE_FOUND'
                  ? 'ROUTE READY'
                  : 'READY';

  return (
    <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-xl text-slate-200">
      <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3">
        Live Mission Status
      </h2>
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`w-2 h-2 rounded-full ${
            status === 'NAVIGATING' ? 'bg-sky-400 animate-pulse' : 'bg-emerald-400'
          }`}
        />
        <span className="text-sm font-mono font-bold text-cyan-300">{statusLine}</span>
      </div>
      <dl className="space-y-2 text-xs font-mono">
        <div className="flex justify-between">
          <dt className="text-slate-500">Current Position</dt>
          <dd className="text-slate-200">
            ({roverPos[0]}, {roverPos[1]})
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Destination</dt>
          <dd className="text-slate-200">
            ({destPos[0]}, {destPos[1]})
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Progress</dt>
          <dd className="text-cyan-300 font-bold">{progressPercent}%</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Steps</dt>
          <dd className="text-slate-200">
            {stepsTravelled} / {stepsPlanned || '—'}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Current Terrain</dt>
          <dd className="text-amber-300">{currentTerrain}</dd>
        </div>
      </dl>
    </div>
  );
};
