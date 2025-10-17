/**
 * LabCanvas - Visual Renderer
 * Displays agents and lab environment
 * Subscribes to StateManager for updates
 */

import { useEffect, useRef } from 'react';
import { StateManager, GameState } from '@/systems/StateManager';

export const LabCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 400;

    let currentState = StateManager.getState();

    // Subscribe to state updates
    const unsubscribe = StateManager.subscribe((state) => {
      currentState = state;
    });

    // Animation loop
    const animate = () => {
      // Clear canvas
      ctx.fillStyle = '#1a0f2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      drawGrid(ctx, canvas.width, canvas.height);

      // Draw agents
      currentState.agents.forEach(agent => {
        drawAgent(ctx, agent);
      });

      // Draw active action indicator
      if (currentState.activeAction) {
        drawActionIndicator(ctx, currentState.activeAction, canvas.width, canvas.height);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      unsubscribe();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="relative rounded-lg overflow-hidden border border-primary/30 glow-cyan">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
};

// Helper drawing functions
function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.1)';
  ctx.lineWidth = 1;

  // Vertical lines
  for (let x = 0; x < width; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Horizontal lines
  for (let y = 0; y < height; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function drawAgent(ctx: CanvasRenderingContext2D, agent: any): void {
  // Get color based on state
  let color: string;
  switch (agent.state) {
    case 'working':
      color = '#A855F7'; // Purple
      break;
    case 'moving':
      color = '#06B6D4'; // Cyan
      break;
    case 'pacing':
      color = '#EC4899'; // Pink
      break;
    default:
      color = '#06B6D4';
  }

  // Draw outer glow (softer, larger)
  ctx.shadowBlur = 20;
  ctx.shadowColor = color;

  // Draw agent body with smooth edges
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(agent.x, agent.y, 8, 0, Math.PI * 2);
  ctx.fill();

  // Add inner highlight for depth
  const gradient = ctx.createRadialGradient(agent.x - 2, agent.y - 2, 0, agent.x, agent.y, 8);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(agent.x, agent.y, 8, 0, Math.PI * 2);
  ctx.fill();

  // Reset shadow
  ctx.shadowBlur = 0;

  // Draw smooth direction indicator with trail effect
  const dx = agent.targetX - agent.x;
  const dy = agent.targetY - agent.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance > 5) {
    const dirX = (dx / distance) * 20;
    const dirY = (dy / distance) * 20;
    
    // Draw trail with gradient
    const trailGradient = ctx.createLinearGradient(
      agent.x, agent.y,
      agent.x + dirX, agent.y + dirY
    );
    trailGradient.addColorStop(0, color);
    trailGradient.addColorStop(1, `${color}00`); // Transparent
    
    ctx.strokeStyle = trailGradient;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(agent.x, agent.y);
    ctx.lineTo(agent.x + dirX, agent.y + dirY);
    ctx.stroke();
  }
}

function drawActionIndicator(
  ctx: CanvasRenderingContext2D,
  action: any,
  width: number,
  height: number
): void {
  const progress = 1 - (action.timeRemaining / action.totalTime);
  
  // Draw progress bar
  const barWidth = 200;
  const barHeight = 20;
  const barX = (width - barWidth) / 2;
  const barY = height - 40;

  // Background
  ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
  ctx.fillRect(barX, barY, barWidth, barHeight);

  // Progress fill
  ctx.fillStyle = '#06B6D4';
  ctx.fillRect(barX, barY, barWidth * progress, barHeight);

  // Border
  ctx.strokeStyle = '#06B6D4';
  ctx.lineWidth = 2;
  ctx.strokeRect(barX, barY, barWidth, barHeight);

  // Text
  ctx.fillStyle = '#06B6D4';
  ctx.font = '12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(
    `${action.name} (${action.timeRemaining}s)`,
    width / 2,
    barY - 10
  );
}
