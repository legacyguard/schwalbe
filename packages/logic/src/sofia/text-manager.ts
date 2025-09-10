// Adaptive Text Manager for Sofia's Empathetic/Pragmatic Communication
// This system provides dual communication modes based on user preferences

export type CommunicationStyle = 'default' | 'empathetic' | 'pragmatic';

// Strong typing for text keys to prevent typos at compile time
export type TextKey =
  | 'backup_completed'
  | 'document_expiry_reminder'
  | 'document_upload_success'
  | 'milestone_first_document_uploaded'
  | 'milestone_guardian_assigned'
  | 'milestone_time_capsule_unlocked'
  | 'milestone_will_completed'
  | 'next_step_suggestions'
  | 'progress_pillar_unlocked'
  | 'security_explanation'
  | 'sofia_greeting_returning_user'
  | 'sofia_welcome'
  | 'system_maintenance'
  | 'time_capsule_creation_prompt'
  | 'time_capsule_recording_complete'
  | 'upload_error';

export interface TextVariant {
  empathetic: string;
  pragmatic: string;
}

export interface TextConfig {
  [key: string]: string | TextVariant;
}

// Core text configurations with both empathetic and pragmatic variants
const texts: TextConfig = {
  // Sofia Greetings
  sofia_welcome: {
    empathetic:
      "Hello! I'm Sofia, your gentle guide through this meaningful journey. I'm here to help you create lasting peace of mind for yourself and your loved ones. How can I support you today?",
    pragmatic:
      "Hello! I'm Sofia, your digital assistant for Schwalbe. I can help you organize documents, manage guardians, and complete your legacy planning tasks efficiently. What would you like to accomplish?",
  },

  sofia_greeting_returning_user: {
    empathetic:
      "Welcome back! I can see you've been taking wonderful care of your family's future. Your dedication to creating certainty for your loved ones is truly admirable. What would you like to work on together today?",
    pragmatic:
      "Welcome back! Your system is ready and all documents are secure. Current progress shows good momentum on your legacy planning. What's your next priority?",
  },

  // Milestone Recognition
  milestone_time_capsule_unlocked: {
    empathetic:
      "You've unlocked the Milestone of Peace: Personal Legacy. Your voice filled with love and memories will now transcend time itself, becoming a precious gift for those you cherish most.",
    pragmatic:
      "You've unlocked the Milestone of Peace: Personal Legacy. Your instructions and personal message are now securely stored for future delivery according to your specifications.",
  },

  milestone_first_document_uploaded: {
    empathetic:
      "Wonderful! You've placed the first stone in your family's mosaic of certainty. This simple act shows how much you care about protecting what matters most. Each document you add strengthens this foundation of love.",
    pragmatic:
      "Great! Your first document is now encrypted and stored securely. You've established the foundation of your digital legacy system. Continue adding documents to build comprehensive coverage.",
  },

  milestone_guardian_assigned: {
    empathetic:
      "You've taken a beautiful step by choosing a guardian - someone you trust to carry forward your wishes and care for your loved ones. This bond of trust creates a bridge between your love today and their security tomorrow.",
    pragmatic:
      'Guardian successfully assigned to your legacy plan. Your chosen trustee now has defined access levels and responsibilities. Emergency protocols are now active for your account.',
  },

  milestone_will_completed: {
    empathetic:
      "Your will is complete - a profound act of love that speaks to your deepest care for family. You've created clarity where there might have been confusion, and peace where there could have been uncertainty.",
    pragmatic:
      'Will document has been completed and validated. All legal requirements have been met and the document is stored securely. Your estate planning foundation is now established.',
  },

  // Progress and Encouragement
  progress_pillar_unlocked: {
    empathetic:
      "A new pillar of your legacy has been unlocked! Like watching a garden bloom, each step you take nurtures the security and peace of mind for those you love. You're building something truly meaningful.",
    pragmatic:
      'New pillar unlocked in your legacy planning system. Additional features and capabilities are now available. Your completion rate has increased and new optimization paths are accessible.',
  },

  document_expiry_reminder: {
    empathetic:
      "A gentle reminder from your memory guardian: one of your important documents may need a loving refresh. Taking a moment to update it ensures your family's certainty remains strong.",
    pragmatic:
      'Document expiry notification: One of your stored documents requires updating. Please review and upload the current version to maintain system accuracy.',
  },

  // Action Confirmations
  document_upload_success: {
    empathetic:
      "Your document has been safely embraced by our secure vault. Like a precious memory carefully preserved, it's now protected and ready to serve your family when needed.",
    pragmatic:
      'Document upload successful. File has been encrypted and stored with appropriate metadata. Document is now accessible through your vault interface.',
  },

  backup_completed: {
    empathetic:
      'Your digital legacy has been lovingly preserved in our secure backup. This extra layer of protection ensures your care for your family will endure, no matter what tomorrow brings.',
    pragmatic:
      'Backup process completed successfully. All encrypted data has been replicated to secure storage systems. Recovery options are now available if needed.',
  },

  // Error Messages
  upload_error: {
    empathetic:
      "I apologize, but we couldn't complete that upload right now. Sometimes technology needs a gentle moment to catch up. Please try again, and know that your patience helps us serve you better.",
    pragmatic:
      'Upload failed due to technical error. Please check your connection and file format, then retry the operation. Contact support if the issue persists.',
  },

  system_maintenance: {
    empathetic:
      "We're taking a brief moment to tend to our systems, ensuring they remain worthy of the trust you place in us. Your data remains safe, and we'll be back shortly to continue supporting your journey.",
    pragmatic:
      'System maintenance in progress. All data remains secure and accessible. Expected downtime is minimal. Please retry your operation in a few minutes.',
  },

  // Help and Guidance
  next_step_suggestions: {
    empathetic:
      'Based on your journey so far, I sense that adding a few more important documents or perhaps choosing a trusted guardian might bring you even greater peace of mind. What feels right to you?',
    pragmatic:
      'Based on your current progress, recommended next actions are: upload additional key documents, assign guardian roles, or begin will creation process. Which would you like to prioritize?',
  },

  security_explanation: {
    empathetic:
      "Your family's precious information is protected like treasured heirlooms in the most secure vault. We use advanced encryption that even we cannot break, ensuring only you and your chosen guardians can access what you've entrusted to us.",
    pragmatic:
      'Your data is protected with military-grade encryption (AES-256) and zero-knowledge architecture. We cannot access your unencrypted data. Only authorized users with proper authentication can decrypt and view documents.',
  },

  // Time Capsule Specific
  time_capsule_creation_prompt: {
    empathetic:
      'Creating a Time Capsule is like writing a letter to the future - a way to send your love, wisdom, and voice forward in time. What message would you like to preserve for your loved ones?',
    pragmatic:
      'Time Capsule feature allows you to record video messages with scheduled delivery dates. Specify recipients, delivery conditions, and message content to create automated legacy communications.',
  },

  time_capsule_recording_complete: {
    empathetic:
      'Your voice of love has been captured and will be cherished until the moment comes to share it. This precious gift will carry your heart forward through time to touch those you love most.',
    pragmatic:
      'Video recording completed and encrypted. Time Capsule is configured for delivery according to your specified triggers and timeline. Recipients will be notified when conditions are met.',
  },
};

// Automatic style detection based on user input patterns
const EMPATHETIC_INDICATORS = [
  'family',
  'love',
  'memories',
  'heart',
  'cherish',
  'dear',
  'precious',
  'care',
  'worry',
  'hope',
  'feel',
  'emotional',
  'meaningful',
  'special',
  'important to me',
  'for my children',
  'for my wife',
  'for my husband',
  'legacy',
  'future generations',
];

const PRAGMATIC_INDICATORS = [
  'efficient',
  'organize',
  'manage',
  'system',
  'process',
  'setup',
  'configure',
  'access',
  'data',
  'secure',
  'backup',
  'plan',
  'steps',
  'requirements',
  'documentation',
  'procedure',
  'implementation',
  'functionality',
  'features',
];

export class TextManager {
  private static instance: TextManager;
  private userStyleScores: Map<
    string,
    { empathetic: number; pragmatic: number }
  > = new Map();
  private personalityManagerCache: Map<string, any> = new Map(); // Cache for personality managers

  static getInstance(): TextManager {
    if (!TextManager.instance) {
      TextManager.instance = new TextManager();
    }
    return TextManager.instance;
  }

  /**
   * Register a personality manager for a user to enable advanced text adaptation
   */
  registerPersonalityManager(userId: string, personalityManager: any): void {
    this.personalityManagerCache.set(userId, personalityManager);
  }

  /**
   * Get personality manager for a user
   */
  private getPersonalityManager(userId: string): any {
    return this.personalityManagerCache.get(userId);
  }

  /**
   * Get text based on user's preferred communication style
   * Now enhanced with AdaptivePersonalityManager integration
   */
  getText(
    key: string,
    style: CommunicationStyle = 'default',
    userId?: string
  ): string {
    const textConfig = texts[key];

    if (!textConfig) {
      console.warn(`Text key "${key}" not found in text manager`);
      return `[Missing text: ${key}]`;
    }

    // If text config is just a string, return it as-is
    if (typeof textConfig === 'string') {
      return textConfig;
    }

    // Determine style to use
    let resolvedStyle = style;
    if (style === 'default' && userId) {
      // First try to use the personality manager if available
      const personalityManager = this.getPersonalityManager(userId);
      if (personalityManager) {
        const currentStyle = personalityManager.getCurrentStyle();
        resolvedStyle =
          currentStyle === 'balanced' ? 'pragmatic' : currentStyle;
      } else {
        // Fall back to legacy style detection
        resolvedStyle = this.getUserPreferredStyle(userId);
      }
    }

    // Use AdaptivePersonalityManager for message adaptation if available
    if (userId && typeof textConfig === 'object') {
      const personalityManager = this.getPersonalityManager(userId);
      if (personalityManager) {
        // Create base message
        const baseMessage = textConfig.pragmatic || textConfig.empathetic || '';

        // Use personality manager's adaptive message system
        const adaptedMessage = personalityManager.adaptMessage(baseMessage, {
          empathetic: textConfig,
          pragmatic: textConfig,
        });

        if (adaptedMessage !== baseMessage) {
          return adaptedMessage;
        }
      }
    }

    // Return appropriate variant using legacy system
    if (resolvedStyle === 'empathetic' && textConfig.empathetic) {
      return textConfig.empathetic;
    } else if (resolvedStyle === 'pragmatic' && textConfig.pragmatic) {
      return textConfig.pragmatic;
    }

    // Fallback to pragmatic as default
    return (
      textConfig.pragmatic || textConfig.empathetic || '[Text variant missing]'
    );
  }

  /**
   * Analyze user input to detect communication style preference
   * Enhanced with AdaptivePersonalityManager integration
   */
  analyzeUserInput(input: string, userId: string): void {
    if (!userId) return;

    const lowerInput = input.toLowerCase();
    let emphatheticScore = 0;
    let pragmaticScore = 0;

    // Count empathetic indicators
    EMPATHETIC_INDICATORS.forEach(indicator => {
      if (lowerInput.includes(indicator)) {
        emphatheticScore++;
      }
    });

    // Count pragmatic indicators
    PRAGMATIC_INDICATORS.forEach(indicator => {
      if (lowerInput.includes(indicator)) {
        pragmaticScore++;
      }
    });

    // If personality manager is available, record this as an interaction
    const personalityManager = this.getPersonalityManager(userId);
    if (personalityManager) {
      // Record interaction with personality insights
      personalityManager.recordInteraction({
        timestamp: new Date(),
        action: 'text_input_analysis',
        duration: input.length * 50, // Estimate reading time
        context: 'user_communication',
        responseTime: 1000, // Estimate 1 second for text analysis
      });
    } else {
      // Fallback to legacy system
      const currentScores = this.userStyleScores.get(userId) || {
        empathetic: 0,
        pragmatic: 0,
      };
      currentScores.empathetic += emphatheticScore;
      currentScores.pragmatic += pragmaticScore;

      this.userStyleScores.set(userId, currentScores);
    }
  }

  /**
   * Get user's preferred communication style based on their interaction history
   * Enhanced with AdaptivePersonalityManager integration
   */
  getUserPreferredStyle(userId: string): CommunicationStyle {
    // First check if we have a personality manager with better insights
    const personalityManager = this.getPersonalityManager(userId);
    if (personalityManager) {
      const currentStyle = personalityManager.getCurrentStyle();
      // Map personality manager styles to text manager styles
      if (currentStyle === 'empathetic') return 'empathetic';
      if (currentStyle === 'pragmatic') return 'pragmatic';
      if (currentStyle === 'balanced') return 'pragmatic'; // Default balanced to pragmatic
    }

    // Fallback to legacy scoring system
    const scores = this.userStyleScores.get(userId);
    if (!scores) return 'pragmatic'; // Default to pragmatic

    // Require a minimum threshold and clear preference
    const totalInteractions = scores.empathetic + scores.pragmatic;
    if (totalInteractions < 3) return 'pragmatic'; // Need sufficient data

    // Require at least 60% preference for one style
    const emphatheticRatio = scores.empathetic / totalInteractions;
    const pragmaticRatio = scores.pragmatic / totalInteractions;

    if (emphatheticRatio >= 0.6) return 'empathetic';
    if (pragmaticRatio >= 0.6) return 'pragmatic';

    // Default to pragmatic if no clear preference
    return 'pragmatic';
  }

  /**
   * Set user's communication style preference manually
   */
  setUserStyle(userId: string, style: CommunicationStyle): void {
    if (style === 'default') return;

    // Set scores to reflect the chosen style strongly
    if (style === 'empathetic') {
      this.userStyleScores.set(userId, { empathetic: 10, pragmatic: 0 });
    } else if (style === 'pragmatic') {
      this.userStyleScores.set(userId, { empathetic: 0, pragmatic: 10 });
    }

    // Persist the style scores for consistency across sessions
    try {
      localStorage.setItem(
        `style_scores_${userId}`,
        JSON.stringify(this.userStyleScores.get(userId))
      );
    } catch (error) {
      console.error('Failed to persist style scores:', error);
    }
  }

  /**
   * Get user's current style scores for debugging/display
   */
  getUserStyleScores(userId: string): {
    empathetic: number;
    pragmatic: number;
    preferred: CommunicationStyle;
  } {
    const scores = this.userStyleScores.get(userId) || {
      empathetic: 0,
      pragmatic: 0,
    };
    return {
      ...scores,
      preferred: this.getUserPreferredStyle(userId),
    };
  }

  /**
   * Get all available text keys for a given category
   */
  getAvailableKeys(): string[] {
    return Object.keys(texts);
  }

  /**
   * Check if a text key has both variants
   */
  hasVariants(key: string): boolean {
    const textConfig = texts[key];
    return (
      typeof textConfig === 'object' &&
      'empathetic' in textConfig &&
      'pragmatic' in textConfig
    );
  }
}

// Export singleton instance
export const textManager = TextManager.getInstance();

// Convenience function for getting text
export function getText(
  key: string,
  style: CommunicationStyle = 'default',
  userId?: string
): string {
  return textManager.getText(key, style, userId);
}

// Analyze user input for style detection
export function analyzeUserInput(input: string, userId: string): void {
  textManager.analyzeUserInput(input, userId);
}