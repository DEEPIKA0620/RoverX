import React from 'react';
import type {
  NavigationMode,
  AutonomousMode,
  ToolMode,
  TerrainType,
  MissionStatusState,
} from '../types/simulator';

interface MissionControlsProps {
  toolMode: ToolMode;
  setToolMode: (mode: ToolMode) => void;
  selectedTerrain: TerrainType;
  setSelectedTerrain: (t: TerrainType) => void;
  navigationMode: NavigationMode;
  setNavigationMode: (mode: NavigationMode) => void;
  autonomousMode: AutonomousMode;
  setAutonomousMode: (mode: AutonomousMode) => void;
  sensorRange: number;
  setSensorRange: (range: number) => void;
  onCalculateRoute: () => void;
  onStartMission: () => void;
  onPauseMission: () => void;
  onResumeMission: () => void;
  onSimulateDynamicObstacle: () => void;
  onResetSimulation: () => void;
  onGenerateRandomTerrain: () => void;
  onClearTerrain: () => void;
  onGenerateTerrain: () => void;
  status: MissionStatusState;
  navPaused: boolean;
  startPos: [number, number];
  destPos: [number, number];
  gridRows: number;
  gridCols: number;
  onGridRowsChange: (n: number) => void;
  onGridColsChange: (n: number) => void;
}

const TERRAIN_OPTIONS: { type: TerrainType; label: string; hint: string; dot: string }[] = [
  { type: 'normal', label: 'NORMAL', hint: '1', dot: 'bg-gray-100 border border-border' },
  { type: 'rough', label: 'ROUGH', hint: '3', dot: 'bg-yellow-100 border border-yellow-200' },
  { type: 'difficult', label: 'DIFFICULT', hint: '7', dot: 'bg-orange-100 border border-orange-200' },
  { type: 'high_risk', label: 'HIGH RISK', hint: '15', dot: 'bg-red-100 border border-red-200' },
  { type: 'obstacle', label: 'OBSTACLE', hint: 'Blocked', dot: 'bg-gray-600' },
  { type: 'restricted', label: 'RESTRICTED', hint: 'Blocked', dot: 'bg-purple-100 border border-purple-200' },
];

export const MissionControls: React.FC<MissionControlsProps> = ({
  toolMode,
  setToolMode,
  selectedTerrain,
  setSelectedTerrain,
  navigationMode,
  setNavigationMode,
  autonomousMode,
  setAutonomousMode,
  sensorRange,
  setSensorRange,
  onCalculateRoute,
  onStartMission,
  onPauseMission,
  onResumeMission,
  onSimulateDynamicObstacle,
  onResetSimulation,
  onGenerateRandomTerrain,
  onClearTerrain,
  onGenerateTerrain,
  status,
  navPaused,
  startPos,
  destPos,
  gridRows,
  gridCols,
  onGridRowsChange,
  onGridColsChange,
}) => {
  const isNavigating = status === 'NAVIGATING' || status === 'REPLANNING' || status === 'OBSTACLE_DETECTED';
  const canPause = status === 'NAVIGATING' && !navPaused;
  const canResume = navPaused && status === 'ROUTE_FOUND';

  return (
    <div className="card p-4 flex flex-col gap-4 h-full">
      <h2 className="card-title">Mission Setup</h2>

      <div className="space-y-2">
        <p className="text-sm text-text-secondary">
          Start: <span className="text-text font-medium">({startPos[0]}, {startPos[1]})</span>
        </p>
        <button
          type="button"
          onClick={() => setToolMode('start')}
          disabled={isNavigating}
          className={`w-full py-2.5 text-sm font-semibold rounded-md text-white transition-all duration-200 shadow-sm flex items-center justify-center gap-2 ${
            toolMode === 'start'
              ? 'bg-navy ring-2 ring-blue-400 ring-offset-2 ring-offset-white font-bold shadow-md'
              : 'bg-navy-deep hover:bg-navy'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {toolMode === 'start' && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />}
          SELECT START
        </button>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-text-secondary">
          Destination:{' '}
          <span className="text-text font-medium">({destPos[0]}, {destPos[1]})</span>
        </p>
        <button
          type="button"
          onClick={() => setToolMode('destination')}
          disabled={isNavigating}
          className={`w-full py-2.5 text-sm font-semibold rounded-md text-white transition-all duration-200 shadow-sm flex items-center justify-center gap-2 ${
            toolMode === 'destination'
              ? 'bg-navy ring-2 ring-blue-400 ring-offset-2 ring-offset-white font-bold shadow-md'
              : 'bg-navy-deep hover:bg-navy'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {toolMode === 'destination' && <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse shrink-0" />}
          SELECT DESTINATION
        </button>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-navy mb-2 uppercase tracking-wide">Navigation Strategy</h3>
        <div className="flex gap-1">
          {(['fastest', 'balanced', 'safest'] as NavigationMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              disabled={isNavigating}
              onClick={() => setNavigationMode(mode)}
              className={`flex-1 py-2 text-xs font-semibold uppercase rounded transition-all duration-200 ${
                navigationMode === mode
                  ? 'bg-navy-deep text-white shadow-sm'
                  : 'bg-surface-muted text-text-secondary border border-border hover:bg-gray-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Autonomous Navigation Mode Selection */}
      <div className="pt-2 border-t border-border">
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="text-xs font-semibold text-navy uppercase tracking-wide">
            Autonomous Navigation
          </h3>
          <span className="text-[10px] font-semibold text-rover-primary uppercase">
            {autonomousMode === 'predictive' ? 'Look-Ahead' : 'Reactive'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            disabled={isNavigating}
            onClick={() => setAutonomousMode('reactive')}
            className={`py-2 px-3 text-xs font-semibold uppercase rounded transition-all duration-200 ${
              autonomousMode === 'reactive'
                ? 'bg-navy-deep text-white shadow-sm ring-1 ring-navy-deep'
                : 'bg-surface-muted text-text-secondary border border-border hover:bg-gray-200'
            }`}
          >
            REACTIVE
          </button>
          <button
            type="button"
            disabled={isNavigating}
            onClick={() => setAutonomousMode('predictive')}
            className={`py-2 px-3 text-xs font-semibold uppercase rounded transition-all duration-200 ${
              autonomousMode === 'predictive'
                ? 'bg-navy-deep text-white shadow-sm ring-1 ring-navy-deep'
                : 'bg-surface-muted text-text-secondary border border-border hover:bg-gray-200'
            }`}
          >
            PREDICTIVE
          </button>
        </div>

        <p className="text-[11px] text-text-secondary mt-1.5 leading-snug">
          {autonomousMode === 'predictive'
            ? 'Scans ahead and avoids hazards before reaching them.'
            : 'Replans when the route becomes blocked.'}
        </p>

        {autonomousMode === 'predictive' && (
          <div className="mt-2.5 flex items-center justify-between gap-2 p-2 bg-slate-50 border border-border rounded-md">
            <div>
              <div className="text-[11px] font-semibold text-navy">Sensor Range</div>
              <div className="text-[10px] text-text-secondary">Look-ahead scanning depth</div>
            </div>
            <select
              value={sensorRange}
              disabled={isNavigating}
              onChange={(e) => setSensorRange(Number(e.target.value))}
              className="px-2.5 py-1 text-xs font-semibold rounded bg-white border border-border text-navy-deep shadow-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-navy-deep"
            >
              <option value={3}>3 cells</option>
              <option value={4}>4 cells</option>
              <option value={5}>5 cells</option>
              <option value={6}>6 cells</option>
            </select>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xs font-semibold text-navy mb-2 uppercase tracking-wide">Terrain</h3>
        <div className="flex flex-wrap gap-1">
          {TERRAIN_OPTIONS.map((t) => (
            <button
              key={t.type}
              type="button"
              disabled={isNavigating}
              onClick={() => {
                setSelectedTerrain(t.type);
                setToolMode(t.type === 'obstacle' ? 'obstacle' : 'terrain');
              }}
              className={`flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded border ${
                (toolMode === 'terrain' || toolMode === 'obstacle') && selectedTerrain === t.type
                  ? 'border-navy-deep bg-rover-light text-navy-deep'
                  : 'border-border bg-white text-text-secondary'
              }`}
            >
              <span className={`w-2 h-2 rounded-sm shrink-0 ${t.dot}`} />
              {t.label}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-text-secondary mt-1">Click or drag on the grid to paint terrain.</p>
      </div>

      <div className="flex flex-wrap gap-2 text-[11px] text-text-secondary">
        <label>
          Rows{' '}
          <input
            type="number"
            min={8}
            max={30}
            value={gridRows}
            disabled={isNavigating}
            onChange={(e) => onGridRowsChange(Number(e.target.value) || 20)}
            className="w-12 ml-1 px-1 py-0.5 border border-border rounded text-text"
          />
        </label>
        <label>
          Cols{' '}
          <input
            type="number"
            min={8}
            max={30}
            value={gridCols}
            disabled={isNavigating}
            onChange={(e) => onGridColsChange(Number(e.target.value) || 20)}
            className="w-12 ml-1 px-1 py-0.5 border border-border rounded text-text"
          />
        </label>
        <button
          type="button"
          disabled={isNavigating}
          onClick={onGenerateTerrain}
          className="px-2.5 py-1 text-[11px] font-semibold rounded bg-navy-deep hover:bg-navy text-white shadow-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          New grid
        </button>
        <button
          type="button"
          disabled={isNavigating}
          onClick={onGenerateRandomTerrain}
          className="px-2.5 py-1 text-[11px] font-semibold rounded bg-navy-deep hover:bg-navy text-white shadow-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Random
        </button>
        <button
          type="button"
          disabled={isNavigating}
          onClick={onClearTerrain}
          className="px-2.5 py-1 text-[11px] font-semibold rounded bg-navy-deep hover:bg-navy text-white shadow-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Clear
        </button>
      </div>

      <div className="space-y-2 pt-2 border-t border-border mt-auto">
        <button
          type="button"
          onClick={onCalculateRoute}
          disabled={isNavigating}
          className="w-full py-2.5 text-sm font-semibold rounded-md bg-navy-deep hover:bg-navy text-white shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          CALCULATE ROUTE
        </button>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={onStartMission}
            disabled={status === 'NAVIGATING' || status === 'COMPLETED'}
            className="py-2 text-xs font-semibold rounded-md bg-navy-deep hover:bg-navy text-white shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            START MISSION
          </button>
          <button
            type="button"
            onClick={onPauseMission}
            disabled={!canPause}
            className="py-2 text-xs font-semibold rounded-md bg-navy-deep hover:bg-navy text-white shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            PAUSE
          </button>
          <button
            type="button"
            onClick={onResumeMission}
            disabled={!canResume}
            className="py-2 text-xs font-semibold rounded-md bg-navy-deep hover:bg-navy text-white shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            RESUME
          </button>
        </div>
        <button
          type="button"
          onClick={onSimulateDynamicObstacle}
          disabled={status !== 'NAVIGATING'}
          className="w-full py-2.5 text-xs sm:text-sm font-semibold rounded-md bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
        >
          DYNAMIC OBSTACLE
        </button>
        <button
          type="button"
          onClick={onResetSimulation}
          className="w-full py-2 text-xs font-semibold rounded-md bg-navy-deep hover:bg-navy text-white shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          RESET
        </button>
      </div>
    </div>
  );
};
