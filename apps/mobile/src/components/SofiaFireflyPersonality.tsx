import { useState, useEffect, useCallback, useMemo } from 'react';

export interface PersonalityState {
  mode: 'empathetic' | 'pragmatic' | 'celebratory' | 'comforting';
  confidence: number; // 0-1, how confident we are in this personality
  context: 'idle' | 'guiding' | 'celebrating' | 'helping' | 'waiting';
  mood: 'neutral' | 'happy' | 'encouraging' | 'calm' | 'excited';
}

export interface PersonalityConfig {
  adaptability: number; // 0-1, how quickly personality adapts
  contextSensitivity: number; // 0-1, how much context affects behavior
  userPreference: 'auto' | 'empathetic' | 'pragmatic' | 'celebratory' | 'comforting';
}

export interface InteractionHistory {
  timestamp: number;
  type: 'tap' | 'longPress' | 'drag' | 'ignore';
  duration: number;
  context: string;
}

const DEFAULT_CONFIG: PersonalityConfig = {
  adaptability: 0.7,
  contextSensitivity: 0.8,
  userPreference: 'auto',
};

export const useSofiaPersonality = (
  initialPersonality: PersonalityState,
  config: PersonalityConfig = DEFAULT_CONFIG
) => {
  const [personality, setPersonality] = useState<PersonalityState>(initialPersonality);
  const [interactionHistory, setInteractionHistory] = useState<InteractionHistory[]>([]);

  // Context-based personality adaptation
  const adaptToContext = useCallback((context: PersonalityState['context']) => {
    const contextPersonalityMap: Record<PersonalityState['context'], Partial<PersonalityState>> = {
      idle: { mode: 'empathetic', mood: 'calm', confidence: 0.8 },
      guiding: { mode: 'pragmatic', mood: 'encouraging', confidence: 0.9 },
      celebrating: { mode: 'celebratory', mood: 'excited', confidence: 1.0 },
      helping: { mode: 'empathetic', mood: 'encouraging', confidence: 0.9 },
      waiting: { mode: 'comforting', mood: 'calm', confidence: 0.7 },
    };

    const contextAdaptation = contextPersonalityMap[context] || contextPersonalityMap.idle;

    setPersonality(prev => ({
      ...prev,
      context,
      ...contextAdaptation,
      confidence: Math.min(1, prev.confidence + (config.contextSensitivity * 0.1)),
    }));
  }, [config.contextSensitivity]);

  // User interaction-based learning
  const learnFromInteraction = useCallback((interaction: Omit<InteractionHistory, 'timestamp'>) => {
    const newInteraction: InteractionHistory = {
      ...interaction,
      timestamp: Date.now(),
    };

    setInteractionHistory(prev => {
      const updated = [newInteraction, ...prev].slice(0, 50); // Keep last 50 interactions

      // Analyze interaction patterns
      const recentInteractions = updated.slice(0, 10);
      const avgDuration = recentInteractions.reduce((sum, i) => sum + i.duration, 0) / recentInteractions.length;

      // Adapt personality based on interaction patterns
      let newMode: PersonalityState['mode'] = personality.mode;
      let newMood: PersonalityState['mood'] = personality.mood;

      if (avgDuration > 2000) {
        // Long interactions suggest user wants more guidance
        newMode = 'empathetic';
        newMood = 'encouraging';
      } else if (avgDuration < 500) {
        // Quick interactions suggest user wants efficiency
        newMode = 'pragmatic';
        newMood = 'neutral';
      }

      // Update personality if confidence is high enough
      if (personality.confidence > 0.6) {
        setPersonality(prev => ({
          ...prev,
          mode: newMode,
          mood: newMood,
          confidence: Math.min(1, prev.confidence + (config.adaptability * 0.05)),
        }));
      }

      return updated;
    });
  }, [personality.mode, personality.mood, personality.confidence, config.adaptability]);

  // Get contextual message based on personality and context
  const getContextualMessage = useCallback((baseMessage: string): string => {
    const { mode, mood, context } = personality;

    const messageTemplates: Record<string, Record<PersonalityState['mode'], string>> = {
      idle: {
        empathetic: `${baseMessage} I'm here whenever you need me.`,
        pragmatic: `${baseMessage} Ready to help.`,
        celebratory: `${baseMessage} Let's make today amazing!`,
        comforting: `${baseMessage} Take your time, I'm here.`,
      },
      guiding: {
        empathetic: `${baseMessage} I'll guide you through this step by step.`,
        pragmatic: `${baseMessage} Here's what you need to do:`,
        celebratory: `${baseMessage} You're doing great! Keep going!`,
        comforting: `${baseMessage} I'm here to help you navigate this.`,
      },
      celebrating: {
        empathetic: `Wonderful! ${baseMessage}`,
        pragmatic: `Excellent work! ${baseMessage}`,
        celebratory: `🎉 Amazing! ${baseMessage}`,
        comforting: `Beautiful! ${baseMessage}`,
      },
      helping: {
        empathetic: `${baseMessage} I'm here to support you.`,
        pragmatic: `${baseMessage} Here's how I can help:`,
        celebratory: `${baseMessage} Let's tackle this together!`,
        comforting: `${baseMessage} I'm right here with you.`,
      },
      waiting: {
        empathetic: `${baseMessage} No rush, I'm here when you're ready.`,
        pragmatic: `${baseMessage} Take your time.`,
        celebratory: `${baseMessage} I'm excited to help when you are!`,
        comforting: `${baseMessage} I'm here, patiently waiting.`,
      },
    };

    const contextMessages = messageTemplates[context] || messageTemplates.idle;
    return (contextMessages && contextMessages[mode]) || baseMessage;
  }, [personality]);

  // Personality insights for analytics
  const getPersonalityInsights = useCallback(() => {
    const totalInteractions = interactionHistory.length;
    const avgInteractionDuration = interactionHistory.length > 0
      ? interactionHistory.reduce((sum, i) => sum + i.duration, 0) / totalInteractions
      : 0;

    const contextDistribution = interactionHistory.reduce((acc, interaction) => {
      acc[interaction.context] = (acc[interaction.context] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalInteractions,
      avgInteractionDuration,
      contextDistribution,
      dominantContext: Object.entries(contextDistribution).sort(([,a], [,b]) => b - a)[0]?.[0],
      personalityStability: personality.confidence,
      adaptationRate: config.adaptability,
    };
  }, [interactionHistory, personality.confidence, config.adaptability]);

  // Reset personality to default
  const resetPersonality = useCallback(() => {
    setPersonality(initialPersonality);
    setInteractionHistory([]);
  }, [initialPersonality]);

  return {
    personality,
    interactionHistory,
    adaptToContext,
    learnFromInteraction,
    getContextualMessage,
    getPersonalityInsights,
    resetPersonality,
  };
};

// Personality presets for different user types
export const PersonalityPresets = {
  newUser: {
    mode: 'empathetic' as const,
    confidence: 0.5,
    context: 'guiding' as const,
    mood: 'encouraging' as const,
  },
  experiencedUser: {
    mode: 'pragmatic' as const,
    confidence: 0.8,
    context: 'idle' as const,
    mood: 'neutral' as const,
  },
  celebratoryUser: {
    mode: 'celebratory' as const,
    confidence: 0.9,
    context: 'celebrating' as const,
    mood: 'excited' as const,
  },
  anxiousUser: {
    mode: 'comforting' as const,
    confidence: 0.7,
    context: 'waiting' as const,
    mood: 'calm' as const,
  },
};

export default useSofiaPersonality;