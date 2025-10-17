/**
 * Agent_Mover - Autonomous Movement System
 * Manages pixel coordinates and animation state
 * Enforces Continuous Action Guardrail (no static states)
 */

import { Agent } from './StateManager';

class Agent_MoverClass {
  private readonly BOUNDS = {
    minX: 50,
    maxX: 750,
    minY: 50,
    maxY: 350
  };

  /**
   * Update all agents' positions (called every frame)
   * Enforces Continuous Action Guardrail
   */
  updateAgents(agents: Agent[]): Agent[] {
    return agents.map(agent => this.updateSingleAgent(agent));
  }

  /**
   * Update a single agent's position and state
   * Uses smooth interpolation for natural movement
   */
  private updateSingleAgent(agent: Agent): Agent {
    const dx = agent.targetX - agent.x;
    const dy = agent.targetY - agent.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Agent reached target - assign new random target
    if (distance < 3) {
      return {
        ...agent,
        x: agent.targetX,
        y: agent.targetY,
        targetX: this.randomX(),
        targetY: this.randomY(),
        state: this.getNextState(agent.state)
      };
    }

    // Smooth easing - slower when close to target, faster when far
    const easingFactor = Math.min(distance / 100, 1); // Normalize distance
    const smoothSpeed = agent.speed * (0.5 + easingFactor * 1.5); // Variable speed
    
    // Interpolated movement with easing
    const moveX = (dx / distance) * smoothSpeed;
    const moveY = (dy / distance) * smoothSpeed;

    return {
      ...agent,
      x: agent.x + moveX,
      y: agent.y + moveY,
      state: 'moving' // Continuous Action Guardrail: always in motion
    };
  }

  /**
   * Set agent targets based on action state
   */
  setAgentTargetsForAction(agents: Agent[], hasActiveAction: boolean): Agent[] {
    if (hasActiveAction) {
      // When working, agents move to work stations (center area)
      return agents.map((agent, index) => ({
        ...agent,
        targetX: 300 + (index * 100),
        targetY: 200,
        state: 'working'
      }));
    } else {
      // When idle, agents pace around randomly
      return agents.map(agent => ({
        ...agent,
        targetX: this.randomX(),
        targetY: this.randomY(),
        state: 'pacing'
      }));
    }
  }

  /**
   * Cycle through states to prevent static appearance
   */
  private getNextState(currentState: Agent['state']): Agent['state'] {
    const states: Agent['state'][] = ['pacing', 'working', 'moving'];
    const currentIndex = states.indexOf(currentState);
    return states[(currentIndex + 1) % states.length];
  }

  /**
   * Generate random X coordinate within bounds
   */
  private randomX(): number {
    return this.BOUNDS.minX + Math.random() * (this.BOUNDS.maxX - this.BOUNDS.minX);
  }

  /**
   * Generate random Y coordinate within bounds
   */
  private randomY(): number {
    return this.BOUNDS.minY + Math.random() * (this.BOUNDS.maxY - this.BOUNDS.minY);
  }

  /**
   * Continuous Action Guardrail Verification
   * Returns true if any agent is in static state (should never happen)
   */
  verifyNoStaticAgents(agents: Agent[]): boolean {
    const staticAgents = agents.filter(agent => {
      const dx = agent.targetX - agent.x;
      const dy = agent.targetY - agent.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < 1 && agent.state !== 'moving';
    });

    if (staticAgents.length > 0) {
      console.warn('⚠️ GUARDRAIL VIOLATION: Static agents detected!', staticAgents);
      return false;
    }

    return true;
  }
}

export const Agent_Mover = new Agent_MoverClass();
