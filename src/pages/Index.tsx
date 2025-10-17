/**
 * Main Page - AI Research Lab Simulation
 * Autonomous idle game with T-C-Q decision engine
 */

import { useEffect, useState } from 'react';
import { SimulationEngine } from '@/systems/SimulationEngine';
import { LabCanvas } from '@/components/LabCanvas';
import { StatsPanel } from '@/components/StatsPanel';
import { Button } from '@/components/ui/button';
import { PlayIcon, PauseIcon, RotateCcwIcon } from 'lucide-react';

const Index = () => {
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    // Auto-start simulation on mount
    SimulationEngine.start();
    setIsRunning(true);

    return () => {
      SimulationEngine.stop();
    };
  }, []);

  const handleToggleSimulation = () => {
    if (isRunning) {
      SimulationEngine.stop();
      setIsRunning(false);
    } else {
      SimulationEngine.start();
      setIsRunning(true);
    }
  };

  const handleReset = () => {
    SimulationEngine.reset();
    SimulationEngine.start();
    setIsRunning(true);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-neon-cyan mb-2 tracking-wider glow-pulse">
              AI RESEARCH LAB
            </h1>
            <p className="text-muted-foreground">
              Autonomous simulation powered by T-C-Q decision engine
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleToggleSimulation}
              variant="outline"
              size="lg"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              {isRunning ? (
                <>
                  <PauseIcon className="mr-2 h-4 w-4" />
                  Pause
                </>
              ) : (
                <>
                  <PlayIcon className="mr-2 h-4 w-4" />
                  Resume
                </>
              )}
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              size="lg"
              className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
            >
              <RotateCcwIcon className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lab Visualization */}
        <div className="lg:col-span-2">
          <LabCanvas />
          
          {/* Info Panel */}
          <div className="mt-4 p-4 bg-lab-panel border border-primary/30 rounded-lg">
            <h3 className="text-sm font-bold text-neon-purple mb-2">AGENT STATES</h3>
            <div className="flex gap-6 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#06B6D4]" style={{ boxShadow: '0 0 10px #06B6D4' }} />
                <span className="text-muted-foreground">Moving</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#A855F7]" style={{ boxShadow: '0 0 10px #A855F7' }} />
                <span className="text-muted-foreground">Working</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#EC4899]" style={{ boxShadow: '0 0 10px #EC4899' }} />
                <span className="text-muted-foreground">Pacing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Panel */}
        <div className="lg:col-span-1">
          <StatsPanel />
        </div>
      </div>

      {/* System Architecture Info */}
      <footer className="mt-8 p-4 bg-lab-panel border border-primary/30 rounded-lg">
        <h3 className="text-sm font-bold text-neon-cyan mb-2">SYSTEM ARCHITECTURE</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          This autonomous simulation implements a fully decoupled system architecture with T-C-Q decision logic,
          Eisenhower Matrix prioritization, and continuous agent animation. All systems are isolated: StateManager
          (data), ResourceConverter (calculations), AI_Prioritizer (decisions), Agent_Mover (animation), and
          SimulationEngine (orchestration). No player input required - watch the AI manage its own research lab!
        </p>
      </footer>
    </div>
  );
};

export default Index;
