/**
 * SimulationEngine - Main Orchestrator
 * Manages tick loop and coordinates all systems
 * Enforces Chronological Order Guardrail
 */

import { StateManager, ActionInstance } from './StateManager';
import { ResourceConverter } from './ResourceConverter';
import { AI_Prioritizer } from './AI_Prioritizer';
import { Agent_Mover } from './Agent_Mover';
import { getActionById } from './ActionDefinitions';

class SimulationEngineClass {
  private readonly TICK_INTERVAL = 1000; // 1 second per tick
  private tickTimer: number | null = null;
  private isRunning = false;

  /**
   * Start the simulation loop
   */
  start(): void {
    if (this.isRunning) {
      console.warn('Simulation already running');
      return;
    }

    console.log('🚀 Simulation Engine Started');
    this.isRunning = true;
    this.scheduleNextTick();
  }

  /**
   * Stop the simulation loop
   */
  stop(): void {
    if (this.tickTimer) {
      clearTimeout(this.tickTimer);
      this.tickTimer = null;
    }
    this.isRunning = false;
    console.log('⏸️ Simulation Engine Stopped');
  }

  /**
   * Schedule next tick
   */
  private scheduleNextTick(): void {
    this.tickTimer = window.setTimeout(() => {
      this.tick();
      if (this.isRunning) {
        this.scheduleNextTick();
      }
    }, this.TICK_INTERVAL);
  }

  /**
   * Main tick function - Chronological Order Guardrail enforced
   */
  private tick(): void {
    const state = StateManager.getState();
    
    console.log(`\n⏰ TICK ${state.totalTicks + 1}`);

    // 1. Apply Passive Income (Resource Update)
    const passiveResources = ResourceConverter.applyPassiveIncome(state);
    StateManager.updateState({
      money: passiveResources.money,
      fame: passiveResources.fame
    });

    // 2. Update Active Action Progress
    if (state.activeAction) {
      const updatedAction = this.updateActionProgress(state.activeAction);
      
      if (updatedAction.timeRemaining <= 0) {
        // 3a. Action Complete - Apply Rewards
        this.completeAction(state.activeAction);
      } else {
        // 3b. Action Continues
        StateManager.updateState({
          activeAction: updatedAction
        });
      }
    } else {
      // 4. No Active Action - AI Decision Trigger
      this.startNewAction();
    }

    // 5. Update Agent Movement
    const currentState = StateManager.getState();
    const updatedAgents = Agent_Mover.updateAgents(currentState.agents);
    
    // Verify Continuous Action Guardrail
    Agent_Mover.verifyNoStaticAgents(updatedAgents);
    
    StateManager.updateState({
      agents: updatedAgents,
      totalTicks: currentState.totalTicks + 1
    });
  }

  /**
   * Update action progress
   */
  private updateActionProgress(action: ActionInstance): ActionInstance {
    return {
      ...action,
      timeRemaining: action.timeRemaining - 1
    };
  }

  /**
   * Complete an action and apply rewards
   */
  private completeAction(action: ActionInstance): void {
    const state = StateManager.getState();
    
    console.log(`✅ ACTION COMPLETE: ${action.name}`);
    console.log(`   Rewards: +${action.reward.money} money, +${action.reward.fame} fame`);

    // Apply rewards
    StateManager.updateState({
      money: state.money + action.reward.money,
      fame: state.fame + action.reward.fame,
      activeAction: null,
      actionHistory: [
        ...state.actionHistory,
        {
          actionId: action.actionId,
          name: action.name,
          timestamp: Date.now(),
          success: true
        }
      ]
    });

    // Reset agent targets to pacing mode
    const updatedAgents = Agent_Mover.setAgentTargetsForAction(state.agents, false);
    StateManager.updateState({ agents: updatedAgents });
  }

  /**
   * Start a new action based on AI decision
   */
  private startNewAction(): void {
    const state = StateManager.getState();
    
    // AI Decision
    const selectedAction = AI_Prioritizer.determineNextAction(state);
    
    if (!selectedAction) {
      console.log('⏳ Waiting for resources...');
      return;
    }

    // Deduct costs
    const updatedResources = ResourceConverter.applyActionCost(state, selectedAction);
    
    // Create action instance
    const actionInstance: ActionInstance = {
      actionId: selectedAction.id,
      name: selectedAction.name,
      timeRemaining: selectedAction.timeRequired,
      totalTime: selectedAction.timeRequired,
      reward: selectedAction.reward
    };

    console.log(`▶️ STARTING ACTION: ${selectedAction.name}`);
    console.log(`   Cost: -${selectedAction.cost.money} money, -${selectedAction.cost.fame} fame`);
    console.log(`   Duration: ${selectedAction.timeRequired}s`);

    StateManager.updateState({
      money: updatedResources.money,
      fame: updatedResources.fame,
      activeAction: actionInstance
    });

    // Set agent targets to working mode
    const updatedAgents = Agent_Mover.setAgentTargetsForAction(state.agents, true);
    StateManager.updateState({ agents: updatedAgents });
  }

  /**
   * Reset simulation to initial state
   */
  reset(): void {
    this.stop();
    StateManager.reset();
    console.log('🔄 Simulation Reset');
  }
}

export const SimulationEngine = new SimulationEngineClass();
