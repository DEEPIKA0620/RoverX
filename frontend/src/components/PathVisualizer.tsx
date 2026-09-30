import React from 'react';
import type { NavigationMode } from '../types/simulator';

interface PathVisualizerProps {
  visible: boolean;
  distance: number;
  steps: number;
  terrainCost: number;
  planningTimeMs: number;
  navigationMode: NavigationMode;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  pathRevealPercent: number;
}

/** Route analysis banner shown after A* planning (with gradual reveal progress). */
export const PathVisualizer: React.FC<PathVisualizerProps> = ({
  visible,
  distance,
  steps,
  terrainCost,
  planningTimeMs,
  navigationMode,
  riskLevel,
  pathRevealPercent,
}) => {
  if (!visible) return null;

  return (
    <div className="w-full p-4 rounded-xl bg-sky-950/50 border border-sky-700/60 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <span className="text-sm font-mono font-black text-sky-200 tracking-wide">PATH FOUND</span>
        <span className="text-[10px] font-mono uppercase text-sky-400/80">
          Revealing route… {pathRevealPercent}%
        </span>
      </div>
      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mb-3 border border-slate-800">
        <div
          className="h-full bg-sky-500 transition-all duration-150"
          style={{ width: `${pathRevealPercent}%` }}
        />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        <div>
          <span className="text-slate-500 block">Distance</span>
          <span className="text-sky-300 font-bold">{distance} cells</span>
        </div>
        <div>
          <span className="text-slate-500 block">Steps</span>
          <span className="text-sky-300 font-bold">{steps}</span>
        </div>
        <div>
          <span className="text-slate-500 block">Terrain Cost</span>
          <span className="text-amber-300 font-bold">{terrainCost}</span>
        </div>
        <div>
          <span className="text-slate-500 block">Planning Time</span>
          <span className="text-cyan-300 font-bold">{planningTimeMs} ms</span>
        </div>
      </div>
      <div className="mt-3 pt-2 border-t border-sky-900/80 flex flex-wrap gap-3 text-[10px] font-mono uppercase">
        <span className="text-slate-400">
          Mode: <span className="text-sky-300">{navigationMode}</span>
        </span>
        <span className="text-slate-400">
          Risk: <span className="text-amber-300">{riskLevel}</span>
        </span>
      </div>
    </div>
  );
};

/** Returns path cells that should be drawn based on reveal animation index. */
export function filterPathForReveal(
  path: [number, number][],
  revealIndex: number
): [number, number][] {
  if (path.length === 0 || revealIndex < 0) return [];
  const end = Math.min(path.length, revealIndex + 1);
  return path.slice(0, end);
}
