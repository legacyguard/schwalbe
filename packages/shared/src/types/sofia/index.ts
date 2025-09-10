// Sofia AI Types - Re-export from logic package
// This maintains compatibility and provides centralized type access

export type {
  // Core Sofia Types
  SofiaMessage,
  ActionButton,
  SofiaContext,
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
  
  // Memory Types
  ConversationMemory,
  SofiaMemoryState,
  
  // Text Manager Types
  TextCommunicationStyle,
  TextKey,
  TextVariant,
  TextConfig,
} from '@schwalbe/logic';