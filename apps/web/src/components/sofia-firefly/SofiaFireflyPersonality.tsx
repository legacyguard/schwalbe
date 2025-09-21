import { useState, useCallback, useMemo, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';

export type PersonalityMode = 'empathetic' | 'pragmatic' | 'celebratory' | 'comforting' | 'nurturing' | 'confident';
export type ContextType = 'idle' | 'guiding' | 'celebrating' | 'helping' | 'waiting' | 'learning' | 'supporting' | 'encouraging' | 'trust' | 'processing' | 'analyzing' | 'synthesizing' | 'validating' | 'monitoring' | 'inviting' | 'consulting' | 'emergency' | 'onboarding';
export type CommunicationStyle = 'empathetic' | 'pragmatic' | 'celebratory';
export type EmotionalState = 'calm' | 'joyful' | 'supportive' | 'encouraging' | 'celebratory' | 'comforting' | 'confident' | 'nurturing';

// Cross-component memory and consistency types
export interface ComponentMemory {
  lastContext: ContextType;
  interactionCount: number;
  preferredPersonality: PersonalityMode;
  averageConfidence: number;
  lastSeen: Date;
  consistencyScore: number;
}

export interface UserPreferences {
  communicationStyle: CommunicationStyle;
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
  // Cross-component consistency
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

export interface PersonalityConfig {
  adaptationRate: number;
  confidenceThreshold: number;
  learningEnabled: boolean;
  consistencyWeight: number;
}

// Personality message templates
const messageTemplates: Record<ContextType, Partial<Record<PersonalityMode, string>>> = {
  idle: {
    empathetic: "I'm here whenever you need me ✨",
    pragmatic: "Ready when you are",
    celebratory: "Let's make some magic happen! 🎉",
    comforting: "Take your time, I'm here for you 🛋️",
    nurturing: "I'm here to support your journey 💝",
    confident: "I'm ready to assist you with confidence",
  },
  guiding: {
    empathetic: "I'm here to help you find your way",
    pragmatic: "Let me show you the next steps",
    celebratory: "Let's celebrate your progress together!",
    comforting: "I'll guide you gently through this",
    nurturing: "Let me nurture you through this process",
    confident: "I'll confidently guide you forward",
  },
  celebrating: {
    empathetic: "Your dedication inspires me! 🌟",
    pragmatic: "Excellent progress on your goals",
    celebratory: "Amazing! You're doing fantastic! 🎊",
    comforting: "I'm so proud of your achievements 💝",
    nurturing: "Your growth brings me such joy 💖",
    confident: "Outstanding achievement! You're excelling!",
  },
  helping: {
    empathetic: "Let me support you through this",
    pragmatic: "Here's how I can assist you",
    celebratory: "Let's tackle this challenge together!",
    comforting: "I'm here to help you feel secure",
    nurturing: "Let me care for you during this time",
    confident: "I can help you overcome this challenge",
  },
  waiting: {
    empathetic: "Take all the time you need",
    pragmatic: "I'll wait for your next action",
    celebratory: "The best things are worth waiting for! ✨",
    comforting: "No rush at all, I'm here when you're ready",
    nurturing: "Take the time you need to feel comfortable",
    confident: "I'm patiently waiting for your direction",
  },
  learning: {
    empathetic: "I'm learning how best to support you",
    pragmatic: "Adapting to your preferences",
    celebratory: "Growing together! 🌱",
    comforting: "I'm here as you explore and learn",
    nurturing: "I'm growing with you on this journey",
    confident: "I'm adapting to serve you better",
  },
  supporting: {
    empathetic: "I'm here to support your decisions",
    pragmatic: "Providing the support you need",
    celebratory: "Supporting your amazing progress! 🎯",
    comforting: "You have my full support and care",
    nurturing: "Supporting you with gentle care",
    confident: "I fully support your confident choices",
  },
  encouraging: {
    empathetic: "You can do this, I believe in you",
    pragmatic: "You're making great progress",
    celebratory: "You're absolutely crushing it! 💪",
    comforting: "I'm here to encourage you every step",
    nurturing: "You're doing wonderfully, keep going",
    confident: "You've got this! I'm confident in you",
  },
  trust: {
    empathetic: "Trust is the foundation of everything ✨",
    pragmatic: "Building trust through consistent actions",
    celebratory: "Trust creates beautiful connections! 💝",
    comforting: "I'm here to help you build trust safely",
    nurturing: "Trust grows with care and understanding",
    confident: "Trust is earned through reliability and honesty",
  },
  processing: {
    empathetic: "I'm carefully processing your information",
    pragmatic: "Analyzing data for optimal results",
    celebratory: "Processing complete! Let's see what we found! 🎉",
    comforting: "Take your time, I'm working through this carefully",
    nurturing: "I'm here with you as we process this together",
    confident: "Processing your data with precision and care",
  },
  analyzing: {
    empathetic: "I'm thoughtfully analyzing every detail",
    pragmatic: "Breaking down the information systematically",
    celebratory: "Great! I'm finding some wonderful insights! ✨",
    comforting: "I'm being thorough so you can feel confident",
    nurturing: "I'm carefully examining everything for you",
    confident: "My analysis will give you clear, actionable insights",
  },
  synthesizing: {
    empathetic: "I'm bringing together all the pieces for you",
    pragmatic: "Combining information into meaningful patterns",
    celebratory: "Beautiful connections are emerging! 🌟",
    comforting: "I'm creating something meaningful from all this",
    nurturing: "I'm weaving together your story with care",
    confident: "Synthesizing comprehensive insights for you",
  },
};

export const useSofiaPersonality = (initialState: PersonalityState) => {
  const [personality, setPersonality] = useState<PersonalityState>(initialState);
  const [interactionHistory, setInteractionHistory] = useState<InteractionHistory[]>([]);

  // Cross-component consistency integration
  const consistency = useCrossComponentConsistency();

  // Configuration for personality adaptation
  const config: PersonalityConfig = useMemo(() => ({
    adaptationRate: 0.1,
    confidenceThreshold: 0.7,
    learningEnabled: true,
    consistencyWeight: 0.3, // Weight given to consistency in adaptation decisions
  }), []);

  // Enhanced learning from user interactions with cross-component consistency
  const learnFromInteraction = useCallback((interaction: Omit<InteractionHistory, 'timestamp'>, componentId?: string) => {
    if (!config.learningEnabled) return;

    const newInteraction: InteractionHistory = {
      ...interaction,
      timestamp: new Date(),
    };

    setInteractionHistory(prev => [...prev.slice(-9), newInteraction]); // Keep last 10 interactions

    // Update cross-component memory if component ID provided
    if (componentId) {
      consistency.updateComponentMemory(componentId, interaction.context, personality.mode);
    }

    // Adapt personality based on interaction patterns with consistency consideration
    setPersonality(prev => {
      const newState = { ...prev };
      newState.lastInteraction = new Date();
      newState.interactionCount += 1;

      // Analyze interaction patterns
      const recentInteractions = [...interactionHistory, newInteraction].slice(-5);
      const avgDuration = recentInteractions.reduce((sum, i) => sum + i.duration, 0) / recentInteractions.length;

      // Adapt confidence based on interaction consistency
      if (avgDuration > 500) {
        newState.confidence = Math.min(1.0, newState.confidence + config.adaptationRate);
      } else {
        newState.confidence = Math.max(0.1, newState.confidence - config.adaptationRate * 0.5);
      }

      // Adapt mood based on context frequency with consistency weighting
      const contextFrequency = recentInteractions.reduce((freq, i) => {
        freq[i.context] = (freq[i.context] || 0) + 1;
        return freq;
      }, {} as Record<ContextType, number>);

      const mostFrequentContext = Object.entries(contextFrequency)
        .sort(([,a], [,b]) => b - a)[0]?.[0] as ContextType;

      // Consider consistency score when adapting mood
      const consistencyValidation = consistency.validateConsistency(newState);
      const consistencyWeight = consistencyValidation.score * config.consistencyWeight;

      if (mostFrequentContext === 'celebrating' && consistencyWeight > 0.5) {
        newState.mood = 'celebrating';
      } else if (mostFrequentContext === 'helping' && consistencyWeight > 0.4) {
        newState.mood = 'comforting';
      } else if (newState.confidence > config.confidenceThreshold && consistencyWeight > 0.6) {
        newState.mood = 'encouraging';
      }

      // Update consistency score in personality state
      newState.consistencyScore = consistencyValidation.score;

      return newState;
    });
  }, [interactionHistory, config, consistency, personality.mode]);

  // Get contextual message based on personality and context
  const getContextualMessage = useCallback((baseMessage: string) => {
    const contextMessages = messageTemplates[personality.context] || messageTemplates.idle;
    const personalityMessage = contextMessages[personality.mode];

    // Combine base message with personality message
    if (personalityMessage && personality.confidence > config.confidenceThreshold) {
      return personalityMessage;
    }

    return baseMessage;
  }, [personality, config.confidenceThreshold]);

  // Adapt to new context
  const adaptToContext = useCallback((newContext: ContextType) => {
    setPersonality(prev => ({
      ...prev,
      context: newContext,
      // Adjust confidence based on context familiarity
      confidence: newContext === prev.context
        ? Math.min(1.0, prev.confidence + config.adaptationRate * 0.5)
        : Math.max(0.3, prev.confidence - config.adaptationRate * 0.2),
    }));
  }, [config.adaptationRate]);

  // Get personality insights
  const getPersonalityInsights = useCallback(() => {
    const insights = {
      preferredContext: personality.context,
      confidence: personality.confidence,
      interactionCount: personality.interactionCount,
      mood: personality.mood,
      adaptationLevel: interactionHistory.length > 5 ? 'adapted' : 'learning',
      recentActivity: interactionHistory.slice(-3),
    };

    return insights;
  }, [personality, interactionHistory]);

  // Reset personality to initial state
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
    // Cross-component consistency features
    consistency,
    validateConsistency: consistency.validateConsistency,
    getCrossComponentInsights: consistency.getCrossComponentInsights,
    updateComponentMemory: consistency.updateComponentMemory,
  };
};

// Personality presets for different user types with cross-component consistency
export const PersonalityPresets = {
  newUser: {
    mode: 'empathetic' as PersonalityMode,
    confidence: 0.6,
    context: 'guiding' as ContextType,
    mood: 'encouraging' as const,
    interactionCount: 0,
    componentMemory: {},
    globalPreferences: {
      communicationStyle: 'empathetic',
      responseSpeed: 'normal',
      emotionalIntensity: 'medium',
      detailLevel: 'normal',
      formality: 'warm'
    },
    consistencyScore: 0.7,
  },
  experiencedUser: {
    mode: 'pragmatic' as PersonalityMode,
    confidence: 0.9,
    context: 'idle' as ContextType,
    mood: 'neutral' as const,
    interactionCount: 10,
    componentMemory: {},
    globalPreferences: {
      communicationStyle: 'pragmatic',
      responseSpeed: 'fast',
      emotionalIntensity: 'low',
      detailLevel: 'brief',
      formality: 'professional'
    },
    consistencyScore: 0.9,
  },
  celebratingUser: {
    mode: 'celebratory' as PersonalityMode,
    confidence: 0.8,
    context: 'celebrating' as ContextType,
    mood: 'celebrating' as const,
    interactionCount: 5,
    componentMemory: {},
    globalPreferences: {
      communicationStyle: 'celebratory',
      responseSpeed: 'normal',
      emotionalIntensity: 'high',
      detailLevel: 'normal',
      formality: 'casual'
    },
    consistencyScore: 0.8,
  },
  anxiousUser: {
    mode: 'comforting' as PersonalityMode,
    confidence: 0.7,
    context: 'helping' as ContextType,
    mood: 'comforting' as const,
    interactionCount: 3,
    componentMemory: {},
    globalPreferences: {
      communicationStyle: 'empathetic',
      responseSpeed: 'slow',
      emotionalIntensity: 'medium',
      detailLevel: 'detailed',
      formality: 'warm'
    },
    consistencyScore: 0.6,
  },
  nurturingUser: {
    mode: 'nurturing' as PersonalityMode,
    confidence: 0.8,
    context: 'supporting' as ContextType,
    mood: 'comforting' as const,
    interactionCount: 6,
    componentMemory: {},
    globalPreferences: {
      communicationStyle: 'empathetic',
      responseSpeed: 'normal',
      emotionalIntensity: 'high',
      detailLevel: 'detailed',
      formality: 'warm'
    },
    consistencyScore: 0.8,
  },
  confidentUser: {
    mode: 'confident' as PersonalityMode,
    confidence: 0.9,
    context: 'encouraging' as ContextType,
    mood: 'encouraging' as const,
    interactionCount: 8,
    componentMemory: {},
    globalPreferences: {
      communicationStyle: 'pragmatic',
      responseSpeed: 'fast',
      emotionalIntensity: 'medium',
      detailLevel: 'brief',
      formality: 'professional'
    },
    consistencyScore: 0.9,
  },
  trustBuilder: {
    mode: 'empathetic' as PersonalityMode,
    confidence: 0.7,
    context: 'trust' as ContextType,
    mood: 'encouraging' as const,
    interactionCount: 0,
    componentMemory: {},
    globalPreferences: {
      communicationStyle: 'empathetic',
      responseSpeed: 'normal',
      emotionalIntensity: 'medium',
      detailLevel: 'normal',
      formality: 'warm'
    },
    consistencyScore: 0.7,
  },
  analytical: {
    mode: 'pragmatic' as PersonalityMode,
    confidence: 0.9,
    context: 'analyzing' as ContextType,
    mood: 'neutral' as const,
    interactionCount: 0,
    componentMemory: {},
    globalPreferences: {
      communicationStyle: 'pragmatic',
      responseSpeed: 'fast',
      emotionalIntensity: 'low',
      detailLevel: 'detailed',
      formality: 'professional'
    },
    consistencyScore: 0.9,
  },
  processing: {
    mode: 'empathetic' as PersonalityMode,
    confidence: 0.8,
    context: 'processing' as ContextType,
    mood: 'encouraging' as const,
    interactionCount: 0,
    componentMemory: {},
    globalPreferences: {
      communicationStyle: 'empathetic',
      responseSpeed: 'normal',
      emotionalIntensity: 'medium',
      detailLevel: 'normal',
      formality: 'warm'
    },
    consistencyScore: 0.8,
  },
} as const;

// Utility functions for personality analysis
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

// Enhanced AI logic for cross-component consistency
export const useCrossComponentConsistency = () => {
  const [globalPersonalityState, setGlobalPersonalityState] = useState<PersonalityState | null>(null);

  // Update component memory when switching between components
  const updateComponentMemory = useCallback((componentId: string, context: ContextType, personality: PersonalityMode) => {
    setGlobalPersonalityState(prev => {
      if (!prev) return null;

      const newState = { ...prev };
      const componentMemory = newState.componentMemory[componentId] || {
        lastContext: context,
        interactionCount: 0,
        preferredPersonality: personality,
        averageConfidence: prev.confidence,
        lastSeen: new Date(),
        consistencyScore: 1.0
      };

      componentMemory.lastContext = context;
      componentMemory.interactionCount += 1;
      componentMemory.preferredPersonality = personality;
      componentMemory.averageConfidence = (componentMemory.averageConfidence + prev.confidence) / 2;
      componentMemory.lastSeen = new Date();

      // Calculate consistency score based on context alignment
      const contextAlignment = context === componentMemory.lastContext ? 1.0 : 0.7;
      const personalityAlignment = personality === componentMemory.preferredPersonality ? 1.0 : 0.8;
      componentMemory.consistencyScore = (contextAlignment + personalityAlignment) / 2;

      newState.componentMemory[componentId] = componentMemory;
      newState.consistencyScore = Object.values(newState.componentMemory)
        .reduce((sum, mem) => sum + mem.consistencyScore, 0) / Object.keys(newState.componentMemory).length;

      return newState;
    });
  }, []);

  // Get consistent personality for a specific component
  const getConsistentPersonality = useCallback((componentId: string, basePersonality: PersonalityState): PersonalityState => {
    if (!globalPersonalityState) {
      setGlobalPersonalityState(basePersonality);
      return basePersonality;
    }

    const componentMemory = globalPersonalityState.componentMemory[componentId];
    if (!componentMemory) {
      return basePersonality;
    }

    // Adapt personality based on component memory
    const adaptedPersonality: PersonalityState = {
      ...basePersonality,
      mode: componentMemory.preferredPersonality,
      confidence: Math.max(basePersonality.confidence, componentMemory.averageConfidence * 0.8),
      context: componentMemory.lastContext,
      consistencyScore: componentMemory.consistencyScore
    };

    return adaptedPersonality;
  }, [globalPersonalityState]);

  // Validate personality consistency across components
  const validateConsistency = useCallback((personality: PersonalityState): {
    isConsistent: boolean;
    score: number;
    recommendations: string[];
  } => {
    if (!globalPersonalityState) {
      return { isConsistent: true, score: 1.0, recommendations: [] };
    }

    const componentCount = Object.keys(globalPersonalityState.componentMemory).length;
    if (componentCount < 2) {
      return { isConsistent: true, score: 1.0, recommendations: [] };
    }

    const avgConsistency = globalPersonalityState.consistencyScore;
    const isConsistent = avgConsistency > 0.7;

    const recommendations: string[] = [];
    if (avgConsistency < 0.5) {
      recommendations.push("Consider maintaining consistent communication style across components");
    }
    if (avgConsistency < 0.6) {
      recommendations.push("Personality adaptation may be too rapid - slow down transitions");
    }

    return {
      isConsistent,
      score: avgConsistency,
      recommendations
    };
  }, [globalPersonalityState]);

  // Get personality insights across all components
  const getCrossComponentInsights = useCallback(() => {
    if (!globalPersonalityState) return null;

    const insights = {
      globalConsistency: globalPersonalityState.consistencyScore,
      componentCount: Object.keys(globalPersonalityState.componentMemory).length,
      mostConsistentComponent: Object.entries(globalPersonalityState.componentMemory)
        .sort(([,a], [,b]) => b.consistencyScore - a.consistencyScore)[0]?.[0],
      preferredContexts: Object.values(globalPersonalityState.componentMemory)
        .map(mem => mem.lastContext),
      averageConfidence: Object.values(globalPersonalityState.componentMemory)
        .reduce((sum, mem) => sum + mem.averageConfidence, 0) / Object.keys(globalPersonalityState.componentMemory).length,
      consistencyTrend: globalPersonalityState.consistencyScore > 0.8 ? 'excellent' :
                       globalPersonalityState.consistencyScore > 0.6 ? 'good' : 'needs-improvement'
    };

    return insights;
  }, [globalPersonalityState]);

  return {
    globalPersonalityState,
    updateComponentMemory,
    getConsistentPersonality,
    validateConsistency,
    getCrossComponentInsights,
  };
};