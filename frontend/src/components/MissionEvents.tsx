import React from 'react';
import type { EventLogItem } from '../types/simulator';

interface MissionEventsProps {
  logs: EventLogItem[];
}

function simplifyMessage(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('hazard predicted') || m.includes('hazard detected')) return '🔍 Hazard predicted ahead';
  if (m.includes('proactive')) return '↻ Proactive route adjustment';
  if (m.includes('route calculated') || m.includes('route found')) return '✓ Route calculated';
  if (m.includes('navigation started') || m.includes('rover navigation started')) return '✓ Rover navigation started';
  if (m.includes('navigation continued') || m.includes('continued')) return '✓ Navigation continued';
  if (m.includes('dynamic obstacle') || m.includes('obstacle')) return '⚠ Dynamic obstacle detected';
  if (m.includes('reactive replan')) return '↻ Reactive replanning';
  if (m.includes('new route generated') || m.includes('new route')) return '✓ New route generated';
  if (m.includes('replanning')) return '↻ Route replanned';
  if (m.includes('mission complete') || m.includes('destination')) return '✓ Destination reached';
  if (m.includes('paused')) return '⏸ Mission paused';
  if (m.includes('resumed')) return '✓ Navigation resumed';
  if (m.includes('reset')) return 'Reset simulation';
  if (m.includes('demo')) return '▶ Demo mode started';
  if (m.includes('failed') || m.includes('no safe')) return '✖ No route available';
  return message.length > 52 ? `${message.slice(0, 52)}…` : message;
}

export const MissionEvents: React.FC<MissionEventsProps> = ({ logs }) => {
  const recent = logs.slice(-4).reverse();

  return (
    <div className="card p-4">
      <h3 className="card-title mb-2">Mission Events</h3>
      <ul className="space-y-1 text-sm text-text-secondary">
        {recent.length === 0 ? (
          <li>Ready to plan a route.</li>
        ) : (
          recent.map((log) => (
            <li key={log.id}>{simplifyMessage(log.message)}</li>
          ))
        )}
      </ul>
    </div>
  );
};
