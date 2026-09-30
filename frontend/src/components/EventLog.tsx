import React, { useEffect, useRef } from 'react';
import { Terminal, ShieldAlert, CheckCircle2, Info, AlertTriangle, Zap } from 'lucide-react';
import type { EventLogItem } from '../types/simulator';

interface EventLogProps {
  logs: EventLogItem[];
  onClearLogs?: () => void;
}

export const EventLog: React.FC<EventLogProps> = ({ logs, onClearLogs }) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getLogIcon = (type: EventLogItem['type']) => {
    switch (type) {
      case 'danger':
        return <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" />;
      case 'replan':
        return <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-spin" />;
      case 'success':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      default:
        return <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
    }
  };

  return (
    <div className="flex flex-col h-64 p-4 bg-slate-900/90 border border-slate-800/90 rounded-2xl shadow-xl text-slate-200">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
            Telemetry & Event Log
          </h3>
        </div>
        {onClearLogs && (
          <button
            type="button"
            onClick={onClearLogs}
            className="text-[10px] font-mono text-slate-400 hover:text-slate-200 transition-colors"
          >
            Clear Log
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 font-mono text-xs font-mono">
        {logs.length === 0 ? (
          <div className="text-slate-500 text-center py-6 text-xs italic">
            No telemetry events recorded yet.
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={`flex items-start gap-2 p-1.5 rounded-lg border text-[11px] leading-snug transition-all ${
                log.type === 'danger'
                  ? 'bg-red-950/40 border-red-900/50 text-red-300'
                  : log.type === 'replan'
                  ? 'bg-amber-950/40 border-amber-900/50 text-amber-300'
                  : log.type === 'success'
                  ? 'bg-emerald-950/30 border-emerald-900/40 text-emerald-300'
                  : 'bg-slate-950/50 border-slate-800/60 text-slate-300'
              }`}
            >
              <span className="text-slate-500 text-[10px] shrink-0 font-medium">
                {log.timestamp}
              </span>
              {getLogIcon(log.type)}
              <span className="flex-1">{log.message}</span>
            </div>
          ))
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};
