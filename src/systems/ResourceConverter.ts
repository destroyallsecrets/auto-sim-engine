/**
 * ResourceConverter - Pure Logic System
 * Calculates resource costs, gains, and rates
 * No dependencies on rendering or time - static utility class
 */

import { GameState } from './StateManager';
import { ActionDefinition } from './ActionDefinitions';

class ResourceConverterClass {
  /**
   * Calculate passive income rate based on current state
   * Pure function: same input always produces same output
   */
  calculatePassiveIncome(state: GameState): number {
    // Base passive income
    let baseIncome = 5;
    
    // Fame multiplier (higher fame = more opportunities)
    const fameMultiplier = 1 + (state.fame / 100);
    
    // Agent count multiplier
    const agentMultiplier = 1 + (state.agents.length * 0.1);
    
    return baseIncome * fameMultiplier * agentMultiplier;
  }

  /**
   * Calculate passive fame decay
   * Fame naturally decays over time (need to maintain reputation)
   */
  calculateFameDecay(state: GameState): number {
    // Higher fame = faster decay (harder to maintain high reputation)
    if (state.fame > 100) return -2;
    if (state.fame > 80) return -1;
    if (state.fame > 50) return -0.5;
    return 0; // No decay at low fame
  }

  /**
   * Check if an action is affordable
   */
  canAffordAction(state: GameState, action: ActionDefinition): boolean {
    return (
      state.money >= action.cost.money &&
      state.fame >= action.cost.fame
    );
  }

  /**
   * Calculate net value of an action (reward - cost)
   */
  calculateNetValue(action: ActionDefinition): { money: number; fame: number } {
    return {
      money: action.reward.money - action.cost.money,
      fame: action.reward.fame - action.cost.fame
    };
  }

  /**
   * Calculate efficiency score (value per second)
   */
  calculateEfficiency(action: ActionDefinition): number {
    const netMoney = action.reward.money - action.cost.money;
    const netFame = action.reward.fame - action.cost.fame;
    
    // Weighted efficiency: money is worth 1, fame is worth 2
    const totalValue = netMoney + (netFame * 2);
    
    return totalValue / action.timeRequired;
  }

  /**
   * Apply passive income to state (called once per tick)
   */
  applyPassiveIncome(state: GameState): { money: number; fame: number } {
    const income = this.calculatePassiveIncome(state);
    const decay = this.calculateFameDecay(state);
    
    return {
      money: Math.round(state.money + income),
      fame: Math.max(0, Math.round(state.fame + decay))
    };
  }

  /**
   * Apply action cost to resources
   */
  applyActionCost(state: GameState, action: ActionDefinition): { money: number; fame: number } {
    return {
      money: state.money - action.cost.money,
      fame: state.fame - action.cost.fame
    };
  }

  /**
   * Apply action reward to resources
   */
  applyActionReward(state: GameState, action: ActionDefinition): { money: number; fame: number } {
    return {
      money: state.money + action.reward.money,
      fame: state.fame + action.reward.fame
    };
  }
}

export const ResourceConverter = new ResourceConverterClass();
