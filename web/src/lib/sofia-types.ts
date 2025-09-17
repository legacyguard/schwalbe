
// Enhanced Sofia AI Types for Guided Dialog System
// Extends the existing sofia-ai.ts with action-based interaction types

import type {
  SofiaContext as BaseSofiaContext,
  SofiaMessage as BaseSofiaMessage,
} from './sofia-ai';

export type ActionCategory =
  | 'ai_query'
  | 'navigation'
  | 'premium_feature'
  | 'ui_action';

export type ActionCost = 'free' | 'low_cost' | 'premium';

// Adaptive Personality System Types
export type PersonalityMode = 'adaptive' | 'empathetic' | 'pragmatic';

export type CommunicationStyle = 'balanced' | 'empathetic' | 'pragmatic';

export interface InteractionPattern {
  action: string;
  context: string;
  duration: number;
  responseTime: number;
  timestamp: Date;
}

export interface PersonalityAnalysis {
  analysisFactors: {
    actionTypes: string[]; // Direct actions vs exploratory actions
    helpSeekingBehavior: boolean; // Frequent help suggests empathetic preference
    responseSpeed: number; // Fast responses suggest pragmatic preference
    sessionDuration: number; // Long sessions suggest empathetic preference
  };
  confidence: number; // 0-100
  detectedStyle: CommunicationStyle;
  lastAnalyzed: Date;
}

export interface SofiaPersonality {
  analysis?: PersonalityAnalysis;
  confidence: number; // How confident Sofia is in style selection
  currentStyle: CommunicationStyle;
  mode: PersonalityMode;
  userPreferences: {
    adaptationEnabled: boolean;
    detectedStyle?: CommunicationStyle;
    lastInteractions: InteractionPattern[];
    manualOverride?: CommunicationStyle;
  };
}

export interface AdaptiveMessageConfig {
  empathetic: {
    celebration: string;
    greeting: string;
    guidance: string;
    support: string;
  };
  pragmatic: {
    celebration: string;
    greeting: string;
    guidance: string;
    support: string;
  };
}

export interface ActionButton {
  category: ActionCategory;
  cost: ActionCost;
  description?: string;
  icon?: string;
  id: string;
  payload?: unknown;
  requiresConfirmation?: boolean;
  text: string;
}

export interface SofiaResponse {
  actions?: ActionButton[];
  content: string;
  cost: ActionCost;
  id: string;
  responseType:
    | 'confirmation'
    | 'error'
    | 'information'
    | 'loading'
    | 'welcome';
  source: 'ai_generated' | 'knowledge_base' | 'predefined';
  timestamp: Date;
}

export interface SofiaCommand {
  category: ActionCategory;
  command: string;
  context: SofiaContext;
  id: string;
  parameters?: Record<string, any>;
  timestamp: Date;
}

// Extended context for guided interactions
export interface SofiaContext extends BaseSofiaContext {
  conversationHistory?: SofiaMessage[];
  currentPage?: string;
  lastInteraction?: Date;
  // Adaptive personality integration
  personality?: SofiaPersonality;
  userPreferences?: {
    expertMode?: boolean;
    preferredActions?: string[];
    skipIntros?: boolean;
  };
}

// Enhanced message type with actions support
export interface SofiaMessage extends BaseSofiaMessage {
  actions?: ActionButton[];
  adaptedContent?: {
    empathetic?: string;
    pragmatic?: string;
  };
  metadata?: {
    cost: ActionCost;
    processingTime?: number;
    source: SofiaResponse['source'];
  };
  // Adaptive personality context
  personalityStyle?: CommunicationStyle;
  responseType?: SofiaResponse['responseType'];
}

// Command processing result
export interface CommandResult {
  cost: ActionCost;
  followupActions?: ActionButton[];
  payload: unknown;
  requiresFollowup?: boolean;
  type: 'error' | 'navigation' | 'response' | 'text_response' | 'ui_action';
}

// Predefined action templates
export const COMMON_ACTIONS = {
  // Navigation actions (free)
  GO_TO_VAULT: {
    id: 'navigate_vault',
    text: '📁 Open my vault',
    icon: 'vault',
    category: 'navigation' as ActionCategory,
    cost: 'free' as ActionCost,
    payload: { route: '/vault' },
  },

  GO_TO_GUARDIANS: {
    id: 'navigate_guardians',
    text: '👥 Manage guardians',
    icon: 'guardians',
    category: 'navigation' as ActionCategory,
    cost: 'free' as ActionCost,
    payload: { route: '/guardians' },
  },

  GO_TO_LEGACY: {
    id: 'navigate_legacy',
    text: '🎁 Create will',
    icon: 'legacy',
    category: 'navigation' as ActionCategory,
    cost: 'free' as ActionCost,
    payload: { route: '/legacy' },
  },

  // UI actions (free)
  ADD_DOCUMENT: {
    id: 'trigger_upload',
    text: '➕ Add document',
    icon: 'upload',
    category: 'ui_action' as ActionCategory,
    cost: 'free' as ActionCost,
    payload: { action: 'open_uploader' },
  },

  VIEW_PROGRESS: {
    id: 'show_progress',
    text: '📊 View my progress',
    icon: 'info',
    category: 'ui_action' as ActionCategory,
    cost: 'free' as ActionCost,
    payload: { action: 'show_progress_modal' },
  },

  // Knowledge base queries (low cost)
  SECURITY_INFO: {
    id: 'faq_security',
    text: '🔒 How is my data protected?',
    icon: 'shield',
    category: 'ai_query' as ActionCategory,
    cost: 'low_cost' as ActionCost,
    payload: { topic: 'security' },
  },

  NEXT_STEP: {
    id: 'suggest_next_step',
    text: '💡 What should I do next?',
    icon: 'sparkles',
    category: 'ai_query' as ActionCategory,
    cost: 'low_cost' as ActionCost,
  },

  // Premium features
  GENERATE_LETTER: {
    id: 'generate_legacy_letter',
    text: '💌 Write personal message',
    icon: 'heart',
    category: 'premium_feature' as ActionCategory,
    cost: 'premium' as ActionCost,
    requiresConfirmation: true,
    description: 'AI helps create a personal message for your loved ones',
  },

  FINANCIAL_SUMMARY: {
    id: 'generate_financial_summary',
    text: '💰 Financial overview for family',
    icon: 'documents',
    category: 'premium_feature' as ActionCategory,
    cost: 'premium' as ActionCost,
    requiresConfirmation: true,
    description: 'AI creates a summary of your finances for emergencies',
  },
} as const;

// Context-based action suggestions
export function getContextualActions(context: SofiaContext): ActionButton[] {
  const actions: ActionButton[] = [];

  // Always show navigation options
  actions.push(COMMON_ACTIONS.GO_TO_VAULT);

  // Show based on progress
  if (context.documentCount < 5) {
    actions.push(COMMON_ACTIONS.ADD_DOCUMENT);
  }

  if (context.guardianCount === 0 && context.familyStatus !== 'single') {
    actions.push(COMMON_ACTIONS.GO_TO_GUARDIANS);
  }

  if (context.completionPercentage > 60) {
    actions.push(COMMON_ACTIONS.GO_TO_LEGACY);
  }

  // Always show help and next step
  actions.push(COMMON_ACTIONS.NEXT_STEP);
  actions.push(COMMON_ACTIONS.SECURITY_INFO);

  return actions.slice(0, 4); // Limit to 4 actions max
}

// Personality utility functions
export function createDefaultPersonality(): SofiaPersonality {
  return {
    mode: 'adaptive',
    currentStyle: 'balanced',
    confidence: 50,
    userPreferences: {
      lastInteractions: [],
      adaptationEnabled: true,
    },
  };
}

export function shouldUseEmpathetic(personality: SofiaPersonality): boolean {
  if (personality.userPreferences.manualOverride) {
    return personality.userPreferences.manualOverride === 'empathetic';
  }

  if (personality.mode === 'empathetic') {
    return true;
  }

  if (personality.mode === 'pragmatic') {
    return false;
  }

  // Adaptive mode: use detection or default to empathetic
  return (
    personality.userPreferences.detectedStyle === 'empathetic' ||
    personality.currentStyle === 'empathetic' ||
    (!personality.userPreferences.detectedStyle && personality.confidence < 70)
  );
}

export function shouldUsePragmatic(personality: SofiaPersonality): boolean {
  if (personality.userPreferences.manualOverride) {
    return personality.userPreferences.manualOverride === 'pragmatic';
  }

  if (personality.mode === 'pragmatic') {
    return true;
  }

  if (personality.mode === 'empathetic') {
    return false;
  }

  // Adaptive mode: use detection
  return (
    personality.userPreferences.detectedStyle === 'pragmatic' ||
    personality.currentStyle === 'pragmatic'
  );
}

export function getPersonalityDisplayName(mode: PersonalityMode): string {
  switch (mode) {
    case 'empathetic':
      return 'Warm & Supportive';
    case 'pragmatic':
      return 'Direct & Efficient';
    case 'adaptive':
      return 'Smart Adaptation';
    default:
      return 'Unknown';
  }
}
