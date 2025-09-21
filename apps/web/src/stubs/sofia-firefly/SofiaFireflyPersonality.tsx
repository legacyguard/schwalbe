import { useState, useCallback } from 'react';

export type PersonalityMode = 'empathetic' | 'pragmatic' | 'celebratory' | 'comforting' | 'nurturing' | 'confident';
export type ContextType = 'idle' | 'guiding' | 'celebrating' | 'helping' | 'waiting' | 'learning' | 'supporting' | 'encouraging' | 'trust' | 'processing' | 'analyzing' | 'synthesizing' | 'validating' | 'monitoring' | 'inviting' | 'consulting' | 'emergency' | 'onboarding';

export interface ComponentMemory {
  lastContext: ContextType;
  interactionCount: number;
  preferredPersonality: PersonalityMode;
  averageConfidence: number;
  lastSeen: Date;
  consistencyScore: number;
}

export interface UserPreferences {
  communicationStyle: 'empathetic' | 'pragmatic' | 'celebratory';
  responseSpeed: 'slow' | 'normal' | 'fast';
  emotionalIntensity: 'low' | 'medium' | 'high';
  detailLevel: 'brief' | 'normal' | 'detailed';
  formality: 'casual' | 'professional' | 'warm';
}

export interface PersonalityState {
  mode: PersonalityMode;
  confidence: number;
  context: ContextType;
  mood: 'neutral' | 'encouraging' | 'celebrating' | 'comforting';
  lastInteraction?: Date;
  interactionCount: number;
  componentMemory: Record<string, ComponentMemory>;
  globalPreferences: UserPreferences;
  consistencyScore: number;
  lastComponentContext?: string;
}

export interface InteractionHistory {
  type: 'click' | 'hover' | 'drag' | 'keyboard' | 'document_analysis' | 'document_search' | 'validation_started' | 'emergency_drill' | 'invitation_sent' | 'status_update' | 'consultation_booked' | 'conversation' | 'nlp_query';
  duration: number;
  context: ContextType;
  timestamp: Date;
}

export const useSofiaPersonality = (initialState: PersonalityState) => {
  const [personality, setPersonality] = useState<PersonalityState>(initialState);
  const [interactionHistory, setInteractionHistory] = useState<InteractionHistory[]>([]);

  const learnFromInteraction = useCallback((interaction: Omit<InteractionHistory, 'timestamp'>) => {
    const newInteraction: InteractionHistory = {
      ...interaction,
      timestamp: new Date(),
    };
    setInteractionHistory(prev => [...prev.slice(-9), newInteraction]);
  }, []);

  const getContextualMessage = useCallback((baseMessage: string) => {
    return baseMessage;
  }, []);

  const adaptToContext = useCallback((newContext: ContextType) => {
    setPersonality(prev => ({
      ...prev,
      context: newContext,
    }));
  }, []);

  const getPersonalityInsights = useCallback(() => {
    return {
      preferredContext: personality.context,
      confidence: personality.confidence,
      interactionCount: personality.interactionCount,
      mood: personality.mood,
      adaptationLevel: interactionHistory.length > 5 ? 'adapted' : 'learning',
      recentActivity: interactionHistory.slice(-3),
    };
  }, [personality, interactionHistory]);

  const resetPersonality = useCallback(() => {
    setPersonality(initialState);
    setInteractionHistory([]);
  }, [initialState]);

  return {
    personality,
    interactionHistory,
    learnFromInteraction,
    getContextualMessage,
    adaptToContext,
    getPersonalityInsights,
    resetPersonality,
  };
};

export const PersonalityPresets = {
  newUser: {
    mode: 'empathetic' as PersonalityMode,
    confidence: 0.6,
    context: 'guiding' as ContextType,
    mood: 'encouraging' as const,
    interactionCount: 0,
  },
  experiencedUser: {
    mode: 'pragmatic' as PersonalityMode,
    confidence: 0.9,
    context: 'idle' as ContextType,
    mood: 'neutral' as const,
    interactionCount: 10,
  },
  celebratingUser: {
    mode: 'celebratory' as PersonalityMode,
    confidence: 0.8,
    context: 'celebrating' as ContextType,
    mood: 'celebrating' as const,
    interactionCount: 5,
  },
  anxiousUser: {
    mode: 'comforting' as PersonalityMode,
    confidence: 0.7,
    context: 'helping' as ContextType,
    mood: 'comforting' as const,
    interactionCount: 3,
  },
  nurturingUser: {
    mode: 'nurturing' as PersonalityMode,
    confidence: 0.8,
    context: 'supporting' as ContextType,
    mood: 'comforting' as const,
    interactionCount: 6,
  },
  confidentUser: {
    mode: 'confident' as PersonalityMode,
    confidence: 0.9,
    context: 'encouraging' as ContextType,
    mood: 'encouraging' as const,
    interactionCount: 8,
  },
} as const;

export const shouldUseEmpathetic = (personality: PersonalityState): boolean => {
  return personality.mode === 'empathetic' || personality.confidence < 0.5;
};

export const shouldUsePragmatic = (personality: PersonalityState): boolean => {
  return personality.mode === 'pragmatic' && personality.confidence > 0.7;
};

export const shouldUseCelebratory = (personality: PersonalityState): boolean => {
  return personality.mode === 'celebratory' || personality.mood === 'celebrating';
};

export const shouldUseComforting = (personality: PersonalityState): boolean => {
  return personality.mode === 'comforting' || personality.mood === 'comforting';
};
