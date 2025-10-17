/**
 * Action Definition Registry
 * Immutable list of all available actions in the simulation
 * Used by AI_Prioritizer for decision making
 */

export interface ActionDefinition {
  id: string;
  name: string;
  description: string;
  
  // Resource Requirements & Rewards
  cost: { money: number; fame: number };
  reward: { money: number; fame: number };
  
  // Time & Efficiency
  timeRequired: number; // in seconds
  efficiencyScore: number; // base efficiency (1-10)
  
  // T-C-Q Metrics
  impactTime: number; // Time metric (1-10, lower is faster)
  impactCost: number; // Cost metric (1-10, lower is cheaper)
  impactQuality: number; // Quality metric (1-10, higher is better)
  
  // Decision Context
  category: 'research' | 'publication' | 'networking' | 'maintenance';
  priority: 'crisis' | 'growth' | 'optimization';
}

/**
 * ACTION_DEFINITIONS: The complete registry of all actions
 * This is the exclusive data source for the AI decision engine
 */
export const ACTION_DEFINITIONS: ActionDefinition[] = [
  // CRISIS ACTIONS (High Fame Impact)
  {
    id: 'emergency_patch',
    name: 'Emergency System Patch',
    description: 'Quick fix to restore reputation',
    cost: { money: 20, fame: 0 },
    reward: { money: 0, fame: 40 },
    timeRequired: 5,
    efficiencyScore: 7,
    impactTime: 2, // Very fast
    impactCost: 3, // Low cost
    impactQuality: 8, // High quality for fame
    category: 'maintenance',
    priority: 'crisis'
  },
  {
    id: 'viral_paper',
    name: 'Publish Viral Research Paper',
    description: 'Quick publication for immediate recognition',
    cost: { money: 50, fame: 0 },
    reward: { money: 20, fame: 60 },
    timeRequired: 8,
    efficiencyScore: 8,
    impactTime: 4,
    impactCost: 5,
    impactQuality: 9,
    category: 'publication',
    priority: 'crisis'
  },
  
  // GROWTH ACTIONS (Balanced Development)
  {
    id: 'deep_research',
    name: 'Deep Research Project',
    description: 'Comprehensive study with long-term benefits',
    cost: { money: 100, fame: 0 },
    reward: { money: 200, fame: 30 },
    timeRequired: 15,
    efficiencyScore: 9,
    impactTime: 7, // Slower
    impactCost: 8, // Expensive
    impactQuality: 10, // Highest quality
    category: 'research',
    priority: 'growth'
  },
  {
    id: 'conference_networking',
    name: 'Attend AI Conference',
    description: 'Build connections and reputation',
    cost: { money: 80, fame: 0 },
    reward: { money: 50, fame: 50 },
    timeRequired: 10,
    efficiencyScore: 7,
    impactTime: 5,
    impactCost: 6,
    impactQuality: 7,
    category: 'networking',
    priority: 'growth'
  },
  
  // OPTIMIZATION ACTIONS (High Money Impact)
  {
    id: 'grant_application',
    name: 'Submit Grant Applications',
    description: 'Secure funding for research',
    cost: { money: 30, fame: 10 },
    reward: { money: 300, fame: 10 },
    timeRequired: 12,
    efficiencyScore: 10,
    impactTime: 6,
    impactCost: 4,
    impactQuality: 6,
    category: 'research',
    priority: 'optimization'
  },
  {
    id: 'consulting_work',
    name: 'AI Consulting Project',
    description: 'Quick money from applied work',
    cost: { money: 0, fame: 5 },
    reward: { money: 150, fame: 5 },
    timeRequired: 6,
    efficiencyScore: 8,
    impactTime: 3,
    impactCost: 2, // Very low cost
    impactQuality: 4,
    category: 'research',
    priority: 'optimization'
  },
  
  // MAINTENANCE ACTIONS (System Health)
  {
    id: 'lab_upgrade',
    name: 'Upgrade Lab Equipment',
    description: 'Improve future efficiency',
    cost: { money: 200, fame: 0 },
    reward: { money: 0, fame: 20 },
    timeRequired: 10,
    efficiencyScore: 6,
    impactTime: 5,
    impactCost: 9, // Very expensive
    impactQuality: 5,
    category: 'maintenance',
    priority: 'optimization'
  },
  {
    id: 'team_training',
    name: 'Agent Training Session',
    description: 'Improve team capabilities',
    cost: { money: 50, fame: 0 },
    reward: { money: 0, fame: 30 },
    timeRequired: 7,
    efficiencyScore: 6,
    impactTime: 4,
    impactCost: 5,
    impactQuality: 6,
    category: 'maintenance',
    priority: 'growth'
  }
];

/**
 * Get action by ID
 */
export function getActionById(id: string): ActionDefinition | undefined {
  return ACTION_DEFINITIONS.find(action => action.id === id);
}

/**
 * Get all actions in a category
 */
export function getActionsByCategory(category: ActionDefinition['category']): ActionDefinition[] {
  return ACTION_DEFINITIONS.filter(action => action.category === category);
}

/**
 * Get all actions with a specific priority
 */
export function getActionsByPriority(priority: ActionDefinition['priority']): ActionDefinition[] {
  return ACTION_DEFINITIONS.filter(action => action.priority === priority);
}
