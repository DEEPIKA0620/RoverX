import React from 'react';
import type { MissionStatusState } from '../types/simulator';

interface HeaderProps {
  status: MissionStatusState;
}

function headerStatusLabel(status: MissionStatusState): string {
  if (status === 'COMPLETED') return 'COMPLETED';
  if (status === 'REPLANNING' || status === 'OBSTACLE_DETECTED') return 'REPLANNING';
  if (status === 'NAVIGATING') return 'NAVIGATING';
  return 'READY';
}

export const Header: React.FC<HeaderProps> = ({ status }) => {
  const label = headerStatusLabel(status);

  return (
    <header className="bg-navy text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">ROVERX</h1>
        <p className="text-sm text-white/80 mt-1 max-w-xl">
          Adaptive Autonomous Rover Path Planning &amp; Dynamic Replanning Simulator
        </p>
      </div>

      <div className="flex items-center gap-6 text-sm">
        <span className="text-white/70 font-medium">SIMULATION MODE</span>
        <span className="flex items-center gap-2 font-semibold">
          <span
            className={`w-2 h-2 rounded-full ${
              label === 'COMPLETED'
                ? 'bg-success'
                : label === 'REPLANNING'
                  ? 'bg-warning'
                  : label === 'NAVIGATING'
                    ? 'bg-rover-primary'
                    : 'bg-white'
            }`}
          />
          {label}
        </span>
      </div>
    </header>
  );
};
