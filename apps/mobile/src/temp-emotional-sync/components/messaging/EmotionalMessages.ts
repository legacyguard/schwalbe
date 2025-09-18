/**
 * Emotional Messages System
 * Based on mobile-sync-proposal.md specifications
 */

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';
export type UploadType = 'first' | 'milestone' | 'regular';
export type AchievementType = 'firstDocument' | 'fiveDocuments' | 'tenDocuments' | 'circleComplete';
export type EmptyStateType = 'documents' | 'guardians' | 'photos';

export interface EmotionalMessage {
  title?: string;
  message: string;
  emoji?: string;
  action?: {
    text: string;
    route?: string;
  };
}

export class EmotionalMessages {
  // Time-based welcome messages
  static getWelcomeMessage(timeOfDay: TimeOfDay, userName?: string): EmotionalMessage {
    const name = userName || 'Guardian';

    const messages = {
      morning: {
        message: `Good morning, ${name}! Your family is a little safer today because of you.`,
        emoji: '🌅',
      },
      afternoon: {
        message: `Every step you take today, ${name}, protects your family's tomorrow.`,
        emoji: '☀️',
      },
      evening: {
        message: `Rest easy, ${name}. You've built a fortress of protection today.`,
        emoji: '🌙',
      },
      night: {
        message: `Good night, ${name}. Your vigilance keeps your loved ones safe while they sleep.`,
        emoji: '⭐',
      },
    };

    return messages[timeOfDay];
  }

  // Document upload success messages
  static getUploadSuccessMessage(uploadType: UploadType, documentCount?: number): EmotionalMessage {
    switch (uploadType) {
      case 'first':
        return {
          title: 'First Seed Planted',
          message: '🌱 Your first seed of protection is planted. Your legacy garden begins!',
          action: {
            text: 'Add Another Document',
            route: '/(tabs)/documents',
          },
        };

      case 'milestone':
        return {
          title: 'Milestone Reached',
          message: `🌟 Another milestone unlocked! Your protection network grows stronger with ${documentCount} documents.`,
          action: {
            text: 'View Progress',
            route: '/(tabs)/protection',
          },
        };

      case 'regular':
      default:
        return {
          title: 'Protection Enhanced',
          message: '✨ Another layer of security added. Your family is better protected.',
        };
    }
  }

  // Achievement messages
  static getAchievementMessage(achievementType: AchievementType): EmotionalMessage {
    const achievements = {
      firstDocument: {
        title: 'Foundation Stone',
        message: 'You\'ve taken the first step in protecting your family\'s future.',
        emoji: '🏗️',
      },
      fiveDocuments: {
        title: 'Growing Strong',
        message: 'Your protection network is taking root.',
        emoji: '🌱',
      },
      tenDocuments: {
        title: 'Legacy Builder',
        message: 'You\'re creating a monument of care for your family.',
        emoji: '🏛️',
      },
      circleComplete: {
        title: 'Circle of Trust Complete',
        message: 'Your guardians stand ready. Your family will never be alone.',
        emoji: '🛡️',
      },
    };

    return achievements[achievementType];
  }

  // Empty state messages with emotional support
  static getEmptyStateMessage(stateType: EmptyStateType): EmotionalMessage {
    const messages = {
      documents: {
        title: 'Your Protection Vault Awaits',
        message: 'Your protection vault awaits its first guardian. Let\'s start with something simple - perhaps your ID or insurance policy?',
        action: {
          text: 'Add First Document',
          route: '/(tabs)/documents',
        },
        emoji: '📁',
      },
      guardians: {
        title: 'Form Your Circle of Trust',
        message: 'Your Circle of Trust is ready to be formed. Who would you trust to protect your family when you can\'t?',
        action: {
          text: 'Add Guardian',
          route: '/(tabs)/protection',
        },
        emoji: '👥',
      },
      photos: {
        title: 'Preserve Your Memories',
        message: 'Every photo tells a story of love. Let\'s preserve these precious moments for your family\'s future.',
        action: {
          text: 'Add Photos',
          route: '/(tabs)/documents',
        },
        emoji: '📸',
      },
    };

    return messages[stateType];
  }

  // Progress encouragement messages
  static getProgressMessage(progressPercentage: number): EmotionalMessage {
    if (progressPercentage >= 90) {
      return {
        title: 'Nearly Complete',
        message: '🎯 You\'re almost there! Your family\'s protection is nearly complete.',
        emoji: '🎯',
      };
    } else if (progressPercentage >= 75) {
      return {
        title: 'Home Stretch',
        message: '🏆 You\'re in the home stretch! Your family\'s future is becoming more secure with every step.',
        emoji: '🏆',
      };
    } else if (progressPercentage >= 50) {
      return {
        title: 'Halfway There',
        message: '🌟 Halfway to comprehensive protection! Your dedication shows real love for your family.',
        emoji: '🌟',
      };
    } else if (progressPercentage >= 25) {
      return {
        title: 'Growing Garden',
        message: '🌱 Look at that - your protection garden is sprouting! You\'re building something beautiful for your family.',
        emoji: '🌱',
      };
    } else {
      return {
        title: 'Journey Begins',
        message: '🚀 Every journey starts with a single step. You\'ve begun building your family\'s fortress.',
        emoji: '🚀',
      };
    }
  }

  // Error support messages
  static getErrorSupportMessage(errorContext?: string): EmotionalMessage {
    const messages = {
      upload_failed: {
        title: 'We\'ll Try Again Together',
        message: 'Don\'t worry - even the strongest foundations face setbacks. Let\'s try a different approach together.',
        action: {
          text: 'Try Again',
        },
        emoji: '🤝',
      },
      network_error: {
        title: 'Connection Hiccup',
        message: 'Looks like there\'s a connection issue. Your dedication to protect your family doesn\'t go unnoticed.',
        action: {
          text: 'Retry',
        },
        emoji: '📶',
      },
      general: {
        title: 'We\'re Here to Help',
        message: 'Sometimes things don\'t go as planned, but your commitment to your family\'s protection is what matters most.',
        action: {
          text: 'Continue',
        },
        emoji: '💙',
      },
    };

    return messages[errorContext as keyof typeof messages] || messages.general;
  }

  // Helper to get current time of day
  static getCurrentTimeOfDay(): TimeOfDay {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }

  // Helper to determine upload type based on count
  static getUploadType(documentCount: number): UploadType {
    if (documentCount === 1) return 'first';
    if (documentCount % 5 === 0) return 'milestone';
    return 'regular';
  }
}