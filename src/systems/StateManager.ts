/**
 * StateManager - Context Retention System
 * Single source of truth for all simulation data
 * Enforces immutability and prevents deletion of core keys
 */

export interface GameState {
  // Core KPIs (Context Retention Guardrail)
  money: number;
  fame: number;
  
  // Agents
  agents: Agent[];
  
  // Action Management
  activeAction: ActionInstance | null;
  actionHistory: CompletedAction[];
  
  // Simulation Metadata
  totalTicks: number;
  startTime: number;
}

export interface Agent {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  state: 'pacing' | 'working' | 'moving';
  speed: number;
}

export interface ActionInstance {
  actionId: string;
  name: string;
  timeRemaining: number;
  totalTime: number;
  reward: { money: number; fame: number };
}

export interface CompletedAction {
  actionId: string;
  name: string;
  timestamp: number;
  success: boolean;
}

// Core keys that cannot be deleted (Context Retention Guardrail)
const CORE_KEYS: (keyof GameState)[] = ['money', 'fame', 'agents', 'activeAction', 'totalTicks'];

class StateManagerClass {
  private state: GameState;
  private listeners: Set<(state: GameState) => void>;
  private readonly STORAGE_KEY = 'lab_simulation_state';

  constructor() {
    this.listeners = new Set();
    this.state = this.loadState() || this.getInitialState();
  }

  private getInitialState(): GameState {
    return {
      money: 100,
      fame: 50,
      agents: [
        { id: 'agent-1', x: 100, y: 100, targetX: 100, targetY: 100, state: 'pacing', speed: 2 },
        { id: 'agent-2', x: 300, y: 150, targetX: 300, targetY: 150, state: 'pacing', speed: 2 },
        { id: 'agent-3', x: 500, y: 100, targetX: 500, targetY: 100, state: 'pacing', speed: 2 }
      ],
      activeAction: null,
      actionHistory: [],
      totalTicks: 0,
      startTime: Date.now()
    };
  }

  /**
   * Context Retention Guardrail: Validates that core keys are not being removed
   */
  private validateUpdate(updates: Partial<GameState>): boolean {
    for (const key of CORE_KEYS) {
      if (key in updates && updates[key] === undefined) {
        console.error(`[StateManager] BLOCKED: Attempted to delete core key "${key}"`);
        return false;
      }
    }
    return true;
  }

  /**
   * Update state with validation
   */
  updateState(updates: Partial<GameState>): boolean {
    if (!this.validateUpdate(updates)) {
      return false;
    }

    this.state = { ...this.state, ...updates };
    this.notifyListeners();
    this.saveState();
    return true;
  }

  /**
   * Get current state (read-only)
   */
  getState(): Readonly<GameState> {
    return { ...this.state };
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: GameState) => void): () => void {
    this.listeners.add(listener);
    // Return unsubscribe function
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const currentState = this.getState();
    this.listeners.forEach(listener => listener(currentState));
  }

  private saveState(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
    } catch (error) {
      console.error('[StateManager] Failed to save state:', error);
    }
  }

  private loadState(): GameState | null {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('[StateManager] Failed to load state:', error);
    }
    return null;
  }

  reset(): void {
    this.state = this.getInitialState();
    this.notifyListeners();
    this.saveState();
  }
}

export const StateManager = new StateManagerClass();
