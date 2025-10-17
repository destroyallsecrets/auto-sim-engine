/**
 * StatsPanel - Real-time KPI Display
 * Shows money, fame, and current action
 */

import { useEffect, useState } from 'react';
import { StateManager, GameState } from '@/systems/StateManager';
import { Card } from '@/components/ui/card';

export const StatsPanel = () => {
  const [state, setState] = useState<GameState>(StateManager.getState());

  useEffect(() => {
    const unsubscribe = StateManager.subscribe(setState);
    return unsubscribe;
  }, []);

  const uptimeSeconds = Math.floor((Date.now() - state.startTime) / 1000);
  const uptimeMinutes = Math.floor(uptimeSeconds / 60);
  const uptimeHours = Math.floor(uptimeMinutes / 60);

  return (
    <div className="space-y-4">
      {/* Resource Stats */}
      <Card className="p-4 bg-lab-panel border-primary/30">
        <h2 className="text-lg font-bold text-neon-cyan mb-3 tracking-wider">RESOURCES</h2>
        <div className="space-y-2">
          <StatRow
            label="Research Points"
            value={Math.round(state.money)}
            color="text-neon-cyan"
            glow
          />
          <StatRow
            label="Reputation"
            value={Math.round(state.fame)}
            color="text-neon-purple"
            glow
          />
        </div>
      </Card>

      {/* System Stats */}
      <Card className="p-4 bg-lab-panel border-primary/30">
        <h2 className="text-lg font-bold text-neon-pink mb-3 tracking-wider">SYSTEM</h2>
        <div className="space-y-2">
          <StatRow
            label="Active Agents"
            value={state.agents.length}
            color="text-foreground"
          />
          <StatRow
            label="Simulation Ticks"
            value={state.totalTicks}
            color="text-foreground"
          />
          <StatRow
            label="Uptime"
            value={
              uptimeHours > 0
                ? `${uptimeHours}h ${uptimeMinutes % 60}m`
                : `${uptimeMinutes}m ${uptimeSeconds % 60}s`
            }
            color="text-foreground"
          />
        </div>
      </Card>

      {/* Current Action */}
      <Card className="p-4 bg-lab-panel border-primary/30">
        <h2 className="text-lg font-bold text-neon-cyan mb-3 tracking-wider">CURRENT ACTION</h2>
        {state.activeAction ? (
          <div className="space-y-2">
            <div className="text-sm text-neon-purple font-semibold">
              {state.activeAction.name}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-1000 ease-linear glow-pulse"
                  style={{
                    width: `${
                      ((state.activeAction.totalTime - state.activeAction.timeRemaining) /
                        state.activeAction.totalTime) *
                      100
                    }%`
                  }}
                />
              </div>
              <span className="text-xs text-muted-foreground min-w-[40px]">
                {state.activeAction.timeRemaining}s
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Reward: +{state.activeAction.reward.money} RP, +{state.activeAction.reward.fame} Rep
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground italic">
            Analyzing priorities...
          </div>
        )}
      </Card>

      {/* Recent Actions */}
      <Card className="p-4 bg-lab-panel border-primary/30">
        <h2 className="text-lg font-bold text-neon-pink mb-3 tracking-wider">ACTION LOG</h2>
        <div className="space-y-1 max-h-[200px] overflow-y-auto">
          {state.actionHistory.slice(-5).reverse().map((action, index) => (
            <div
              key={`${action.timestamp}-${index}`}
              className="text-xs text-muted-foreground flex items-center gap-2"
            >
              <span className="text-green-500">✓</span>
              <span className="flex-1">{action.name}</span>
              <span className="text-[10px] opacity-50">
                {new Date(action.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
          {state.actionHistory.length === 0 && (
            <div className="text-xs text-muted-foreground italic">
              No actions completed yet
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

interface StatRowProps {
  label: string;
  value: string | number;
  color?: string;
  glow?: boolean;
}

const StatRow = ({ label, value, color = 'text-foreground', glow }: StatRowProps) => (
  <div className="flex justify-between items-center">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className={`text-lg font-bold ${color} ${glow ? 'animate-float' : ''}`}>
      {value}
    </span>
  </div>
);
