import React from 'react';

interface RoverProps {
  paused?: boolean;
  replanning?: boolean;
}

export const Rover: React.FC<RoverProps> = ({ paused, replanning }) => {
  if (replanning) {
    return <span className="text-base leading-none" title="Replanning">↻</span>;
  }
  if (paused) {
    return <span className="text-sm leading-none" title="Paused">⏸</span>;
  }
  return (
    <span
      className="flex items-center justify-center w-6 h-6 rounded-full bg-navy-deep text-white text-xs"
      title="Rover"
    >
      🤖
    </span>
  );
};
