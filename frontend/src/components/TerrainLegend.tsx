import React from 'react';

export const TerrainLegend: React.FC = () => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/90 border border-slate-800/90 rounded-xl text-xs font-mono text-slate-300">
      <div className="flex items-center gap-1.5">
        <span className="w-3.5 h-3.5 rounded bg-slate-900 border border-slate-700" />
        <span>Normal (Cost 1)</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-3.5 h-3.5 rounded bg-amber-950 border border-amber-800 text-amber-300" />
        <span>Rough (Cost 3)</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-3.5 h-3.5 rounded bg-orange-950 border border-orange-800 text-orange-300" />
        <span>Difficult (Cost 7)</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-3.5 h-3.5 rounded bg-red-950 border border-red-800 text-red-300" />
        <span>High Risk (Cost 15)</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-3.5 h-3.5 rounded bg-purple-950 border border-purple-800 text-purple-300" />
        <span>Restricted (Cost ∞)</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-3.5 h-3.5 rounded bg-slate-950 border border-slate-700" />
        <span>Obstacle (Cost ∞)</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-3.5 h-3.5 rounded bg-sky-500/40 border border-sky-400" />
        <span>Initial Path</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-3.5 h-3.5 rounded bg-amber-500/40 border border-amber-400" />
        <span>Replanned Path</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-3.5 h-3.5 rounded bg-red-600 border border-red-400 animate-pulse" />
        <span>Dynamic Obstacle</span>
      </div>
    </div>
  );
};
