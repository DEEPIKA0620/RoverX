import React from 'react';
import {
  Activity,
  Clock,
  Compass,
  Zap,
  TrendingUp,
  ShieldCheck,
  RotateCw,
} from 'lucide-react';
import type { MissionMetricsData, MissionStatusState } from '../types/simulator';

interface MetricsPanelProps {
  metrics: MissionMetricsData;
  status: MissionStatusState;
  navigationMode: string;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export const MetricsPanel: React.FC<MetricsPanelProps> = ({
  metrics,
  status,
  navigationMode,
  riskLevel = 'LOW',
}) => {
  const getRiskBadge = () => {
    switch (riskLevel) {
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-red-950 text-red-300 border border-red-700">
            HIGH RISK
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-amber-950 text-amber-300 border border-amber-700">
            MEDIUM RISK
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
            LOW RISK
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-4 p-5 bg-slate-900/90 border border-slate-800/90 rounded-2xl shadow-xl text-slate-200">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
            Mission Analytics
          </h2>
        </div>
        {getRiskBadge()}
      </div>

      <div className="flex justify-between text-[10px] font-mono uppercase">
        <span className="text-slate-500">Status</span>
        <span className="text-cyan-300 font-bold">{status}</span>
      </div>
      <div className="flex justify-between text-[10px] font-mono uppercase -mt-2">
        <span className="text-slate-500">Nav mode</span>
        <span className="text-sky-300 font-bold">{navigationMode}</span>
      </div>

      {/* PROGRESS BAR */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-xs font-mono">
          <span className="text-slate-400">Mission Progress</span>
          <span className="font-bold text-cyan-400">{metrics.progressPercent}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-400 transition-all duration-300 rounded-full shadow-lg shadow-cyan-500/50"
            style={{ width: `${metrics.progressPercent}%` }}
          />
        </div>
      </div>

      {/* METRIC GRID */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col">
          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <Compass className="w-3 h-3 text-sky-400" />
            Distance Planned
          </span>
          <span className="text-lg font-mono font-black text-sky-300 mt-1">
            {metrics.plannedDistance} <span className="text-xs font-normal text-slate-500">cells</span>
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col">
          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            Distance Travelled
          </span>
          <span className="text-lg font-mono font-black text-emerald-300 mt-1">
            {metrics.actualDistance} <span className="text-xs font-normal text-slate-500">cells</span>
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col">
          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            Terrain Cost
          </span>
          <span className="text-lg font-mono font-black text-amber-300 mt-1">
            {metrics.terrainCost}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col">
          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <RotateCw className="w-3 h-3 text-purple-400" />
            Replans Triggered
          </span>
          <span className="text-lg font-mono font-black text-purple-300 mt-1">
            {metrics.replansCount}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col">
          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-cyan-400" />
            Planning Time
          </span>
          <span className="text-base font-mono font-bold text-cyan-300 mt-1">
            {metrics.planningTimeMs} <span className="text-xs font-normal text-slate-500">ms</span>
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col">
          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" />
            Replanning Time
          </span>
          <span className="text-base font-mono font-bold text-amber-300 mt-1">
            {metrics.replanningTimeMs} <span className="text-xs font-normal text-slate-500">ms</span>
          </span>
        </div>
      </div>

      {/* SAFETY ANALYSIS BREAKDOWN */}
      <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col gap-2">
        <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Environment Safety Analysis
        </span>
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
          <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/50">
            <div className="text-emerald-400 font-bold">{metrics.safetyBreakdown.safe}</div>
            <div className="text-[9px] text-slate-400">Safe Cells</div>
          </div>
          <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-800/50">
            <div className="text-amber-400 font-bold">{metrics.safetyBreakdown.risky}</div>
            <div className="text-[9px] text-slate-400">Risky Cells</div>
          </div>
          <div className="p-2 rounded-lg bg-red-950/40 border border-red-800/50">
            <div className="text-red-400 font-bold">{metrics.safetyBreakdown.blocked}</div>
            <div className="text-[9px] text-slate-400">Blocked</div>
          </div>
        </div>
      </div>
    </div>
  );
};
