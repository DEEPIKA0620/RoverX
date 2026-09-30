import React, { useState } from 'react';
import type { CellData, MissionStatusState, AutonomousMode } from '../types/simulator';
import { Rover } from './Rover';
import { filterPathForReveal } from '../utils/pathReveal';

interface TerrainGridProps {
  grid: CellData[][];
  rows: number;
  cols: number;
  startPos: [number, number];
  destPos: [number, number];
  roverPos: [number, number];
  initialPath: [number, number][];
  replannedPath: [number, number][];
  onCellClick: (row: number, col: number) => void;
  status: MissionStatusState;
  pathRevealIndex?: number;
  navPaused?: boolean;
  onRunDemoMode: () => void;
  autonomousMode?: AutonomousMode;
  sensorRange?: number;
  sensorCells?: Set<string>;
}

export const TerrainGrid: React.FC<TerrainGridProps> = ({
  grid,
  rows,
  cols,
  startPos,
  destPos,
  roverPos,
  initialPath,
  replannedPath,
  onCellClick,
  status,
  pathRevealIndex = -1,
  navPaused = false,
  onRunDemoMode,
  autonomousMode = 'predictive',
  sensorCells,
}) => {
  const [isMouseDown, setIsMouseDown] = useState(false);

  const revealedInitial = filterPathForReveal(initialPath, pathRevealIndex);
  const initialPathSet = new Set(revealedInitial.map(([r, c]) => `${r},${c}`));
  const replannedPathSet = new Set(replannedPath.map(([r, c]) => `${r},${c}`));

  const roverReplanning = status === 'REPLANNING' || status === 'OBSTACLE_DETECTED' || status === 'HAZARD_PREDICTED';

  const getCellClassName = (cell: CellData): string => {
    const isStart = cell.row === startPos[0] && cell.col === startPos[1];
    const isDest = cell.row === destPos[0] && cell.col === destPos[1];
    const isRover = cell.row === roverPos[0] && cell.col === roverPos[1];
    const key = `${cell.row},${cell.col}`;
    const isInInitialPath = initialPathSet.has(key);
    const isInReplannedPath = replannedPathSet.has(key);
    const isSensorCell = autonomousMode === 'predictive' && sensorCells?.has(key) && !isRover;
    const sensorEffect = isSensorCell ? 'ring-1 ring-inset ring-sky-400 bg-sky-50/50' : '';

    if (cell.isDynamicObstacle) {
      return `bg-red-200 border-red-400 z-20 ${sensorEffect}`;
    }

    if (cell.isObstacle || cell.terrain === 'obstacle') {
      return `bg-gray-600 border-gray-700 ${isSensorCell ? 'ring-1 ring-sky-300' : ''}`;
    }

    if (isRover) {
      return 'bg-rover-light border-navy-deep z-30 ring-2 ring-navy-deep/30';
    }

    if (isStart && !isRover) {
      return `bg-emerald-50 border-emerald-400 ${sensorEffect}`;
    }

    if (isDest && !isRover) {
      return `bg-green-100 border-green-500 z-10 ${sensorEffect}`;
    }

    if (isInReplannedPath && !isRover) {
      return `bg-orange-100 border-orange-300 z-10 ${sensorEffect}`;
    }

    if (isInInitialPath && !isInReplannedPath) {
      return `bg-blue-100 border-blue-300 ${sensorEffect}`;
    }

    let base = 'bg-white border-border hover:bg-gray-50';
    switch (cell.terrain) {
      case 'rough':
        base = 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100';
        break;
      case 'difficult':
        base = 'bg-orange-50 border-orange-200 hover:bg-orange-100';
        break;
      case 'high_risk':
        base = 'bg-red-50 border-red-200 hover:bg-red-100';
        break;
      case 'restricted':
        base = 'bg-purple-50 border-purple-200';
        break;
      default:
        base = isSensorCell ? 'bg-sky-50/60 border-sky-200' : 'bg-white border-border hover:bg-gray-50';
        break;
    }

    return `${base} ${sensorEffect}`;
  };

  const getCellLabel = (cell: CellData) => {
    const isDest = cell.row === destPos[0] && cell.col === destPos[1];
    const isRover = cell.row === roverPos[0] && cell.col === roverPos[1];

    if (cell.isDynamicObstacle) {
      return <span className="text-xs font-bold text-danger">!</span>;
    }

    if (isRover) {
      return <Rover paused={navPaused} replanning={roverReplanning && !navPaused} />;
    }

    if (isDest) {
      return <span className="text-green-700 font-bold text-xs">◆</span>;
    }

    if (status === 'COMPLETED' && isDest) {
      return <span className="text-success text-sm">✓</span>;
    }

    if (cell.isObstacle || cell.terrain === 'obstacle') {
      return <span className="text-white text-[10px]">■</span>;
    }

    return null;
  };

  const cellSize = cols <= 20 ? 'w-[1.65rem] h-[1.65rem] sm:w-7 sm:h-7 md:w-8 md:h-8' : 'w-6 h-6 sm:w-7 sm:h-7';

  return (
    <div className="card p-4 flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="card-title text-base">Terrain Simulator</h2>
          <p className="text-sm text-text-secondary mt-0.5">
            {rows} × {cols} Grid
          </p>
        </div>
        <button type="button" onClick={onRunDemoMode} className="px-3 py-1.5 text-xs btn-demo shrink-0">
          ▶ DEMO MODE
        </button>
      </div>

      <div className="flex justify-center overflow-auto py-2">
        <div
          className="inline-grid gap-px p-2 bg-surface-muted border border-border rounded"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          onMouseLeave={() => setIsMouseDown(false)}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                type="button"
                className={`${cellSize} border flex items-center justify-center transition-colors ${getCellClassName(cell)}`}
                onClick={() => onCellClick(r, c)}
                onMouseDown={() => {
                  setIsMouseDown(true);
                  onCellClick(r, c);
                }}
                onMouseEnter={() => {
                  if (isMouseDown) onCellClick(r, c);
                }}
                onMouseUp={() => setIsMouseDown(false)}
                aria-label={`Cell ${r}, ${c}`}
              >
                {getCellLabel(cell)}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[11px] text-text-secondary justify-center">
        <span>● Rover</span>
        <span>◆ Destination</span>
        <span className="text-blue-600">━━ Planned path</span>
        <span className="text-orange-600">━━ Replanned path</span>
        <span>■ Obstacle</span>
        <span className="text-red-600">■ High risk terrain</span>
      </div>
    </div>
  );
};
