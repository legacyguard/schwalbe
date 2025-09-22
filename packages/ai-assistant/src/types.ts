export type AssistantState = { history: { role: 'user' | 'assistant'; content: string; actions?: ActionButton[] }[] };

export interface ActionButton {
  id: string;
  text: string;
  icon: string;
  category: 'ui_action' | 'ai_query' | 'navigation';
  cost: 'free' | 'low_cost' | 'high_cost';
  payload?: Record<string, unknown>;
}

export interface SofiaContext {
  documentCount: number;
  guardianCount: number;
  completionPercentage: number;
  familyStatus: 'single' | 'couple' | 'family' | 'extended';
  hasWill: boolean;
  lastActivity: string;
  userPersona?: 'starter' | 'planner' | 'guardian';
}
