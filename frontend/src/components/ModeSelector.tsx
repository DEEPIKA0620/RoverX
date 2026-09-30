import React from 'react';
import { Radio } from 'lucide-react';
import type { NavigationMode } from '../types/simulator';

interface ModeSelectorProps {
  navigationMode: NavigationMode;
  setNavigationMode: (mode: NavigationMode) => void;
  disabled?: boolean;
}

const MODES: { id: NavigationMode; label: string; desc: string }[] = [
  { id: 'fastest', label: 'FASTEST', desc: 'Prioritizes shorter travel distance' },
  { id: 'balanced', label: 'BALANCED', desc: 'Balances distance and terrain cost' },
  { id: 'safest', label: 'SAFEST', desc: 'Strongly avoids risky terrain' },
];

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  navigationMode,
  setNavigationMode,
  disabled = false,
}) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
      <Radio className="w-3.5 h-3.5 text-sky-400" />
      Navigation Strategy
    </label>
    <div className="grid grid-cols-3 gap-2">
      {MODES.map((mode) => (
        <button
          key={mode.id}
          type="button"
          disabled={disabled}
          onClick={() => setNavigationMode(mode.id)}
          className={`py-2.5 px-2 text-xs font-mono font-bold rounded-xl border flex flex-col items-center justify-center transition-all disabled:opacity-50 ${
            navigationMode === mode.id
              ? 'bg-sky-950 border-sky-400 text-sky-300 shadow-lg shadow-sky-950 ring-1 ring-sky-400/40'
              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
          }`}
        >
          <span>{mode.label}</span>
          <span className="text-[9px] font-normal opacity-70 mt-0.5 text-center">{mode.desc}</span>
        </button>
      ))}
    </div>
  </div>
);
