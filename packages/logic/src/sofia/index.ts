// Sofia AI Core Logic Package
// Export all Sofia AI components for use across the Schwalbe ecosystem

// Core Sofia AI functionality
export { sofiaAI, createSofiaMessage, getStoredConversation, saveConversation } from './sofia-ai';
export type { SofiaMessage, ActionButton, SofiaContext } from './sofia-ai';

// Sofia Types and Configuration
export type {
  ActionCategory,
  ActionCost,
  PersonalityMode,
  CommunicationStyle,
  InteractionPattern,
  PersonalityAnalysis,
  SofiaPersonality,
  AdaptiveMessageConfig,
  SofiaResponse,
  SofiaCommand,
  CommandResult,
} from './sofia-types';

export {
  COMMON_ACTIONS,
  getContextualActions,
  createDefaultPersonality,
  shouldUseEmpathetic,
  shouldUsePragmatic,
  getPersonalityDisplayName,
} from './sofia-types';

// Sofia Personality Management
export { AdaptivePersonalityManager } from './sofia-personality';

// Sofia Memory Service
export { SofiaMemoryService, getSofiaMemory } from './sofia-memory';
export type { ConversationMemory, SofiaMemoryState } from './sofia-memory';

// Sofia Proactive Service
export { SofiaProactiveService, getSofiaProactive } from './sofia-proactive';
export type { ProactiveIntervention, UserActivityState } from './sofia-proactive';

// Text Management
export { TextManager, textManager, getText, analyzeUserInput } from './text-manager';
export type { CommunicationStyle as TextCommunicationStyle, TextKey, TextVariant, TextConfig } from './text-manager';