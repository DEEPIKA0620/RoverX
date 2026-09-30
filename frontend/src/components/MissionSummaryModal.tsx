import React from 'react';
import { CheckCircle2, RotateCcw, Play, ShieldCheck } from 'lucide-react';
import type { MissionMetricsData } from '../types/simulator';

interface MissionSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunNewMission: () => void;
  metrics: MissionMetricsData;
  startPos: [number, number];
  destPos: [number, number];
  navigationMode: string;
}

export const MissionSummaryModal: React.FC<MissionSummaryModalProps> = ({
  isOpen,
  onClose,
  onRunNewMission,
  metrics,
  startPos,
  destPos,
  navigationMode,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl p-6 bg-slate-900 border-2 border-emerald-500/80 rounded-3xl shadow-2xl shadow-emerald-950 text-slate-100 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-950">
            <CheckCircle2 className="w-9 h-9 text-emerald-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black font-mono tracking-wider text-emerald-300">
                MISSION COMPLETE ✓
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700 rounded">
                SUCCESS
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              ROVERX Autonomous Path Planning & Dynamic Replanning Report
            </p>
          </div>
        </div>

        {/* Key Metrics Report Card */}
        <div className="grid grid-cols-2 gap-3 font-mono text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col">
            <span className="text-slate-400 text-[10px]">Start Coordinates</span>
            <span className="text-sm font-bold text-slate-200">
              ({startPos[0]}, {startPos[1]})
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col">
            <span className="text-slate-400 text-[10px]">Destination Coordinates</span>
            <span className="text-sm font-bold text-slate-200">
              ({destPos[0]}, {destPos[1]})
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col">
            <span className="text-slate-400 text-[10px]">Planned Distance</span>
            <span className="text-sm font-bold text-sky-400">
              {metrics.plannedDistance} cells
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col">
            <span className="text-slate-400 text-[10px]">Actual Travelled Distance</span>
            <span className="text-sm font-bold text-emerald-400">
              {metrics.actualDistance} cells
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col">
            <span className="text-slate-400 text-[10px]">Accumulated Terrain Cost</span>
            <span className="text-sm font-bold text-amber-400">
              {metrics.terrainCost}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col">
            <span className="text-slate-400 text-[10px]">Predictive Avoidances</span>
            <span className="text-sm font-bold text-sky-400">
              {metrics.predictiveAvoidances || 0}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col">
            <span className="text-slate-400 text-[10px]">Reactive Replans</span>
            <span className="text-sm font-bold text-amber-400">
              {metrics.reactiveReplansCount || 0}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col">
            <span className="text-slate-400 text-[10px]">Total Replans Triggered</span>
            <span className="text-sm font-bold text-purple-400">
              {metrics.replansCount || 0}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col">
            <span className="text-slate-400 text-[10px]">Initial Planning Time</span>
            <span className="text-sm font-bold text-cyan-400">
              {metrics.planningTimeMs} ms
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col">
            <span className="text-slate-400 text-[10px]">Replanning Time</span>
            <span className="text-sm font-bold text-amber-300">
              {metrics.replanningTimeMs} ms
            </span>
          </div>
        </div>

        {/* Strategy & Summary Banner */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
          <div>
            <span className="text-slate-400 text-[10px] block">Navigation Strategy</span>
            <span className="font-bold text-sky-300 uppercase">{navigationMode}</span>
          </div>
          <div className="text-right">
            <span className="text-emerald-400 font-bold block flex items-center gap-1 justify-end">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Dynamic Obstacle Avoided
            </span>
            <span className="text-[10px] text-slate-400">Rover reached target autonomously</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onRunNewMission}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-colors"
          >
            <Play className="w-4 h-4 text-emerald-200" />
            RUN NEW MISSION
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold text-xs tracking-wider flex items-center justify-center gap-2 border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            RESET SIMULATION
          </button>
        </div>
      </div>
    </div>
  );
};
