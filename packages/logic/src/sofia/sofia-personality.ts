// Sofia Adaptive Personality Manager
// Handles personality detection, adaptation, and message personalization

import {
  type AdaptiveMessageConfig,
  type CommunicationStyle,
  createDefaultPersonality,
  type InteractionPattern,
  type PersonalityMode,
  type SofiaPersonality,
} from './sofia-types';

// Temporarily removed logger import to avoid circular dependency
// import { logger } from '@schwalbe/shared/lib/logger';

export class AdaptivePersonalityManager {
  private personality: SofiaPersonality;
  private storageKey: string;

  constructor(userId: string, initialPersonality?: SofiaPersonality) {
    this.storageKey = `sofia_personality_${userId}`;
    this.personality =
      initialPersonality ||
      this.loadFromStorage() ||
      createDefaultPersonality();
  }

  // Core personality management
  getPersonality(): SofiaPersonality {
    return { ...this.personality };
  }

  updatePersonality(updates: Partial<SofiaPersonality>): void {
    this.personality = { ...this.personality, ...updates };
    this.saveToStorage();
  }

  setMode(mode: PersonalityMode): void {
    this.personality.mode = mode;

    // Reset manual override when changing to adaptive mode
    if (mode === 'adaptive') {
      this.personality.userPreferences.manualOverride = undefined;
    } else {
      // Set current style to match mode
      this.personality.currentStyle =
        mode === 'empathetic' ? 'empathetic' : 'pragmatic';
    }

    this.saveToStorage();
  }

  setManualOverride(style: CommunicationStyle | undefined): void {
    this.personality.userPreferences.manualOverride = style;
    if (style) {
      this.personality.currentStyle = style;
      this.personality.confidence = 100; // Maximum confidence for manual override
    }
    this.saveToStorage();
  }

  enableAdaptation(enabled: boolean): void {
    this.personality.userPreferences.adaptationEnabled = enabled;
    this.saveToStorage();
  }

  // Interaction tracking
  recordInteraction(pattern: InteractionPattern): void {
    this.personality.userPreferences.lastInteractions.push(pattern);

    // Keep only last 50 interactions for performance
    if (this.personality.userPreferences.lastInteractions.length > 50) {
      this.personality.userPreferences.lastInteractions =
        this.personality.userPreferences.lastInteractions.slice(-50);
    }

    // Trigger analysis if we have enough data and adaptation is enabled
    if (
      this.personality.userPreferences.adaptationEnabled &&
      this.personality.userPreferences.lastInteractions.length >= 10
    ) {
      this.analyzePersonality();
    }

    this.saveToStorage();
  }

  // Personality analysis
  private analyzePersonality(): void {
    const interactions = this.personality.userPreferences.lastInteractions;
    if (interactions.length < 5) return;

    const recentInteractions = interactions.slice(-20); // Analyze last 20 interactions

    let empathicScore = 0;
    let pragmaticScore = 0;

    recentInteractions.forEach(interaction => {
      // Fast responses (< 3s) suggest pragmatic preference
      if (interaction.responseTime < 3000) {
        pragmaticScore += 1;
      } else if (interaction.responseTime > 10000) {
        // Slow, thoughtful responses suggest empathetic preference
        empathicScore += 1;
      }

      // Long sessions suggest empathetic preference
      if (interaction.duration > 300000) {
        // 5 minutes
        empathicScore += 2;
      } else if (interaction.duration < 60000) {
        // 1 minute
        pragmaticScore += 1;
      }

      // Specific action patterns
      if (
        interaction.action.includes('help') ||
        interaction.action.includes('info')
      ) {
        empathicScore += 1;
      }

      if (
        interaction.action.includes('direct') ||
        interaction.action.includes('skip')
      ) {
        pragmaticScore += 1;
      }
    });

    const totalScore = empathicScore + pragmaticScore;
    const empathicRatio = totalScore > 0 ? empathicScore / totalScore : 0.5;

    let detectedStyle: CommunicationStyle;
    let confidence: number;

    if (empathicRatio > 0.65) {
      detectedStyle = 'empathetic';
      confidence = Math.min(90, 50 + (empathicRatio - 0.5) * 80);
    } else if (empathicRatio < 0.35) {
      detectedStyle = 'pragmatic';
      confidence = Math.min(90, 50 + (0.5 - empathicRatio) * 80);
    } else {
      detectedStyle = 'balanced';
      confidence = 60;
    }

    // Update personality analysis
    this.personality.analysis = {
      detectedStyle,
      confidence,
      analysisFactors: {
        responseSpeed:
          recentInteractions.reduce((acc, i) => acc + i.responseTime, 0) /
          recentInteractions.length,
        actionTypes: [...new Set(recentInteractions.map(i => i.action))],
        sessionDuration:
          recentInteractions.reduce((acc, i) => acc + i.duration, 0) /
          recentInteractions.length,
        helpSeekingBehavior: recentInteractions.some(i =>
          i.action.includes('help')
        ),
      },
      lastAnalyzed: new Date(),
    };

    // Update current style and confidence if we don't have manual override
    if (
      !this.personality.userPreferences.manualOverride &&
      this.personality.mode === 'adaptive'
    ) {
      this.personality.userPreferences.detectedStyle = detectedStyle;
      this.personality.currentStyle = detectedStyle;
      this.personality.confidence = confidence;
    }
  }

  // Message adaptation
  getCurrentStyle(): CommunicationStyle {
    if (this.personality.userPreferences.manualOverride) {
      return this.personality.userPreferences.manualOverride;
    }
    return this.personality.currentStyle;
  }

  adaptMessage(
    baseMessage: string,
    messageConfig?: AdaptiveMessageConfig
  ): string {
    const currentStyle = this.getCurrentStyle();

    // If we have adaptive config, use it
    if (messageConfig) {
      switch (currentStyle) {
        case 'empathetic':
          return messageConfig.empathetic.guidance || baseMessage;
        case 'pragmatic':
          return messageConfig.pragmatic.guidance || baseMessage;
        case 'balanced':
        default:
          return baseMessage;
      }
    }

    // Otherwise, apply style modifications to base message
    return this.applyStyleToMessage(baseMessage, currentStyle);
  }

  private applyStyleToMessage(
    message: string,
    style: CommunicationStyle
  ): string {
    switch (style) {
      case 'empathetic':
        return this.makeMessageEmpathetic(message);
      case 'pragmatic':
        return this.makeMessagePragmatic(message);
      case 'balanced':
      default:
        return message;
    }
  }

  private makeMessageEmpathetic(message: string): string {
    // Add warmth and emotional context to messages
    const empathicPhrases = [
      'I understand this is important to you',
      'Taking care of your family is such a loving act',
      "You're doing something wonderful for your loved ones",
      "I'm here to support you through this",
    ];

    // Add supportive intro occasionally
    if (Math.random() < 0.3 && message.length > 50) {
      const intro =
        empathicPhrases[Math.floor(Math.random() * empathicPhrases.length)];
      return `${intro}. ${message}`;
    }

    return message
      .replace(/\bYou need to\b/g, 'You might want to')
      .replace(/\bYou should\b/g, "I'd suggest you")
      .replace(/\bDo this\b/g, "When you're ready, you can")
      .replace(/\bNext\b/g, 'Next step');
  }

  private makeMessagePragmatic(message: string): string {
    // Make messages more direct and action-oriented
    return message
      .replace(/\bI think you might want to consider\b/g, 'You should')
      .replace(/\bwhen you're ready,?\s*/gi, '')
      .replace(/\bperhaps\b/g, '')
      .replace(/\bmight\b/g, 'will')
      .replace(/\bcould\b/g, 'can')
      .replace(/\. This will help\b/g, '. This')
      .replace(/\s+/g, ' ') // Clean up multiple spaces
      .trim();
  }

  // Storage management
  private loadFromStorage(): null | SofiaPersonality {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        if (parsed.userPreferences?.lastInteractions) {
          parsed.userPreferences.lastInteractions =
            parsed.userPreferences.lastInteractions.map(
              (interaction: InteractionPattern) => ({
                ...interaction,
                timestamp: new Date(interaction.timestamp),
              })
            );
        }
        if (parsed.analysis?.lastAnalyzed) {
          parsed.analysis.lastAnalyzed = new Date(parsed.analysis.lastAnalyzed);
        }
        return parsed;
      }
    } catch (error) {
      console.error('Failed to load Sofia personality from storage:', error);
    }
    return null;
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.personality));
    } catch (error) {
      console.error('Failed to save Sofia personality to storage:', error);
    }
  }

  // Utility methods
  getConfidenceLevel(): 'high' | 'low' | 'medium' {
    if (this.personality.confidence < 40) return 'low';
    if (this.personality.confidence < 70) return 'medium';
    return 'high';
  }

  shouldShowPersonalityHint(): boolean {
    // Show hint if confidence is low and we have enough interactions
    return (
      this.personality.confidence < 60 &&
      this.personality.userPreferences.lastInteractions.length > 15 &&
      !this.personality.userPreferences.manualOverride
    );
  }

  getPersonalityInsight(): string {
    const analysis = this.personality.analysis;
    if (!analysis) {
      return "I'm still learning your communication preferences.";
    }

    const style = analysis.detectedStyle;
    const confidence = Math.round(analysis.confidence);

    switch (style) {
      case 'empathetic':
        return `Based on your interactions, you seem to prefer supportive, detailed guidance (${confidence}% confidence).`;
      case 'pragmatic':
        return `Based on your interactions, you seem to prefer direct, efficient communication (${confidence}% confidence).`;
      case 'balanced':
        return `You seem to appreciate both detailed guidance and efficient communication (${confidence}% confidence).`;
      default:
        return "I'm still analyzing your communication preferences.";
    }
  }
}

// Export utility functions from sofia-types
export {
  createDefaultPersonality,
  getPersonalityDisplayName,
  shouldUseEmpathetic,
  shouldUsePragmatic,
} from './sofia-types';