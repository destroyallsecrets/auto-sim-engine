/**
 * AI_Prioritizer - Core Decision Loop
 * Implements T-C-Q scoring and Eisenhower Matrix logic
 * Fully transparent decision making with detailed logging
 */

import { GameState } from './StateManager';
import { ActionDefinition, ACTION_DEFINITIONS } from './ActionDefinitions';
import { ResourceConverter } from './ResourceConverter';

interface DecisionMetrics {
  actionId: string;
  tScore: number; // Time score (lower is better)
  cScore: number; // Cost score (lower is better)
  qScore: number; // Quality score (higher is better)
  tcqScore: number; // Combined T-C-Q score
  urgency: 'critical' | 'high' | 'medium' | 'low';
  importance: 'critical' | 'high' | 'medium' | 'low';
  eisenhowerQuadrant: 1 | 2 | 3 | 4;
  finalScore: number;
}

class AI_PrioritizerClass {
  private readonly CRISIS_THRESHOLD = 30; // Fame below this triggers crisis mode
  private readonly WEALTH_THRESHOLD = 500; // Money above this enables expensive actions

  /**
   * Main decision function - determines next action based on current state
   */
  determineNextAction(state: GameState): ActionDefinition | null {
    console.log('\n=== AI DECISION CYCLE START ===');
    console.log('Current State:', {
      money: state.money,
      fame: state.fame,
      totalTicks: state.totalTicks
    });

    // Filter affordable actions
    const affordableActions = ACTION_DEFINITIONS.filter(action =>
      ResourceConverter.canAffordAction(state, action)
    );

    if (affordableActions.length === 0) {
      console.log('❌ No affordable actions available');
      return null;
    }

    console.log(`✓ ${affordableActions.length} affordable actions found`);

    // Analyze state context
    const context = this.analyzeContext(state);
    console.log('Context Analysis:', context);

    // Calculate metrics for each action
    const actionMetrics = affordableActions.map(action =>
      this.calculateActionMetrics(action, state, context)
    );

    // Sort by final score
    actionMetrics.sort((a, b) => b.finalScore - a.finalScore);

    // Log top 3 candidates
    console.log('\n--- Top 3 Candidates ---');
    actionMetrics.slice(0, 3).forEach((metric, index) => {
      const action = ACTION_DEFINITIONS.find(a => a.id === metric.actionId)!;
      console.log(`${index + 1}. ${action.name}`);
      console.log(`   T-C-Q: ${metric.tcqScore.toFixed(2)} | Final: ${metric.finalScore.toFixed(2)}`);
      console.log(`   Quadrant: ${metric.eisenhowerQuadrant} (${metric.urgency}/${metric.importance})`);
    });

    // Select best action
    const selectedMetric = actionMetrics[0];
    const selectedAction = ACTION_DEFINITIONS.find(a => a.id === selectedMetric.actionId)!;

    console.log(`\n✓ DECISION: ${selectedAction.name}`);
    console.log('=== AI DECISION CYCLE END ===\n');

    return selectedAction;
  }

  /**
   * Analyze current game state context
   */
  private analyzeContext(state: GameState): {
    isCrisis: boolean;
    isWealthy: boolean;
    phase: 'crisis' | 'growth' | 'optimization';
  } {
    const isCrisis = state.fame < this.CRISIS_THRESHOLD;
    const isWealthy = state.money > this.WEALTH_THRESHOLD;

    let phase: 'crisis' | 'growth' | 'optimization';
    if (isCrisis) {
      phase = 'crisis';
    } else if (isWealthy) {
      phase = 'optimization';
    } else {
      phase = 'growth';
    }

    return { isCrisis, isWealthy, phase };
  }

  /**
   * Calculate T-C-Q metrics for an action
   */
  private calculateActionMetrics(
    action: ActionDefinition,
    state: GameState,
    context: { isCrisis: boolean; isWealthy: boolean; phase: string }
  ): DecisionMetrics {
    // T-C-Q Base Scores (normalized 0-10)
    const tScore = action.impactTime; // Lower is better (faster)
    const cScore = action.impactCost; // Lower is better (cheaper)
    const qScore = action.impactQuality; // Higher is better

    // Combined T-C-Q Score
    // Formula: Quality / (Time + Cost)
    const tcqScore = qScore / (tScore + cScore);

    // Urgency Assessment
    let urgency: 'critical' | 'high' | 'medium' | 'low';
    if (context.isCrisis && action.priority === 'crisis') {
      urgency = 'critical';
    } else if (action.priority === 'crisis') {
      urgency = 'high';
    } else if (action.timeRequired < 8) {
      urgency = 'medium';
    } else {
      urgency = 'low';
    }

    // Importance Assessment
    let importance: 'critical' | 'high' | 'medium' | 'low';
    if (context.isCrisis) {
      importance = action.reward.fame > 30 ? 'critical' : 'high';
    } else if (action.efficiencyScore >= 9) {
      importance = 'high';
    } else if (action.efficiencyScore >= 7) {
      importance = 'medium';
    } else {
      importance = 'low';
    }

    // Eisenhower Matrix Quadrant
    const eisenhowerQuadrant = this.getEisenhowerQuadrant(urgency, importance);

    // Final Score Calculation
    let finalScore = tcqScore;

    // Quadrant multipliers
    if (eisenhowerQuadrant === 1) finalScore *= 3; // Do First
    else if (eisenhowerQuadrant === 2) finalScore *= 2; // Schedule
    else if (eisenhowerQuadrant === 3) finalScore *= 1; // Delegate
    else finalScore *= 0.5; // Eliminate

    // Phase bonuses
    if (context.phase === action.priority) {
      finalScore *= 1.5;
    }

    return {
      actionId: action.id,
      tScore,
      cScore,
      qScore,
      tcqScore,
      urgency,
      importance,
      eisenhowerQuadrant,
      finalScore
    };
  }

  /**
   * Determine Eisenhower Matrix quadrant
   * Quadrant 1: Urgent + Important (Do First)
   * Quadrant 2: Not Urgent + Important (Schedule)
   * Quadrant 3: Urgent + Not Important (Delegate)
   * Quadrant 4: Not Urgent + Not Important (Eliminate)
   */
  private getEisenhowerQuadrant(
    urgency: 'critical' | 'high' | 'medium' | 'low',
    importance: 'critical' | 'high' | 'medium' | 'low'
  ): 1 | 2 | 3 | 4 {
    const isUrgent = urgency === 'critical' || urgency === 'high';
    const isImportant = importance === 'critical' || importance === 'high';

    if (isUrgent && isImportant) return 1;
    if (!isUrgent && isImportant) return 2;
    if (isUrgent && !isImportant) return 3;
    return 4;
  }
}

export const AI_Prioritizer = new AI_PrioritizerClass();
