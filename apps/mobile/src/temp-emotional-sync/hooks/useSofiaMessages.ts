/**
 * Sofia Messages Hook
 * Provides contextual, empathetic AI guidance based on user state and progress
 */

import { useState, useEffect, useCallback } from 'react';
import { EmotionalMessage, EmotionalMessages } from '../components/messaging';

export interface UserProgress {
  documentsCount: number;
  guardiansCount: number;
  completionPercentage: number;
  lastActivity?: Date;
  recentActions: string[];
}

export interface SofiaMessageContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  userProgress: UserProgress;
  currentScreen?: string;
  errorContext?: string;
  isFirstVisit?: boolean;
}

export interface SofiaMessagesState {
  currentMessage?: EmotionalMessage;
  messageHistory: EmotionalMessage[];
  isVisible: boolean;
  messageType: 'welcome' | 'progress' | 'support' | 'achievement' | 'guidance';
}

export const useSofiaMessages = () => {
  const [state, setState] = useState<SofiaMessagesState>({
    messageHistory: [],
    isVisible: false,
    messageType: 'welcome',
  });

  // Generate time-based empathy message
  const getTimeBasedMessage = useCallback((timeOfDay: string, userProgress: UserProgress): EmotionalMessage => {
    const progressPercentage = userProgress.completionPercentage;

    if (timeOfDay === 'morning' && progressPercentage < 20) {
      return {
        title: 'Good Morning, Guardian',
        message: "Good morning! I see you're just starting your protection journey. The first step is always the most meaningful - shall we begin together?",
        emoji: '🌅',
        action: {
          text: 'Start Today',
          route: '/(tabs)/documents',
        },
      };
    }

    if (timeOfDay === 'evening' && progressPercentage > 80) {
      return {
        title: 'Evening Reflection',
        message: "As the day winds down, look at what you've accomplished! Your family sleeps safer tonight because of your care today.",
        emoji: '🌙',
      };
    }

    if (timeOfDay === 'afternoon' && userProgress.documentsCount === 0) {
      return {
        title: 'Perfect Time to Start',
        message: "The afternoon sun reminds me - it's never too late to plant seeds of protection. Your future self will thank you.",
        emoji: '☀️',
        action: {
          text: 'Add First Document',
          route: '/(tabs)/documents',
        },
      };
    }

    return EmotionalMessages.getWelcomeMessage(timeOfDay as any);
  }, []);

  // Generate progress-based encouragement
  const getProgressMessage = useCallback((progress: UserProgress): EmotionalMessage => {
    const { completionPercentage, documentsCount, recentActions } = progress;

    if (completionPercentage === 25) {
      return {
        title: 'Growing Garden',
        message: '🌱 Look at that - your protection garden is sprouting! You\'re building something beautiful for your family.',
        action: {
          text: 'Continue Building',
          route: '/(tabs)/protection',
        },
      };
    }

    if (completionPercentage === 50) {
      return {
        title: 'Halfway Milestone',
        message: '🌟 Halfway to comprehensive protection! Your dedication shows real love for your family.',
        action: {
          text: 'See What\'s Next',
          route: '/(tabs)/home',
        },
      };
    }

    if (completionPercentage === 75) {
      return {
        title: 'Final Stretch',
        message: '🏆 You\'re in the home stretch! Your family\'s future is becoming more secure with every step.',
      };
    }

    if (documentsCount > 0 && recentActions.includes('document_upload')) {
      return {
        title: 'Wonderful Progress',
        message: `You've just added another layer of protection! ${documentsCount} documents are now safeguarding your family's future.`,
        emoji: '✨',
      };
    }

    return EmotionalMessages.getProgressMessage(completionPercentage);
  }, []);

  // Generate support message during difficulties
  const getSupportMessage = useCallback((context?: string): EmotionalMessage => {
    if (context === 'upload_failed') {
      return {
        title: 'We\'ll Try Together',
        message: 'Don\'t worry - even the strongest foundations face setbacks. Let\'s try a different approach together.',
        emoji: '🤝',
        action: {
          text: 'Try Again',
        },
      };
    }

    if (context === 'overwhelmed') {
      return {
        title: 'Take It Easy',
        message: 'I can see you\'re feeling overwhelmed. Remember, every family\'s protection journey is unique. Let\'s take it one gentle step at a time.',
        emoji: '💙',
        action: {
          text: 'Simplify',
          route: '/(tabs)/home',
        },
      };
    }

    if (context === 'no_progress') {
      return {
        title: 'Every Step Counts',
        message: 'Sometimes progress feels slow, but every small action you take is an act of love for your family. You\'re doing better than you think.',
        emoji: '💚',
      };
    }

    return EmotionalMessages.getErrorSupportMessage(context);
  }, []);

  // Generate guidance based on current screen and context
  const getGuidanceMessage = useCallback((screen: string, progress: UserProgress): EmotionalMessage | null => {
    if (screen === 'documents' && progress.documentsCount === 0) {
      return {
        message: 'Think of this as planting seeds in your family\'s garden of protection. Start with something close to your heart.',
        emoji: '🌱',
      };
    }

    if (screen === 'protection' && progress.guardiansCount === 0) {
      return {
        message: 'Your Circle of Trust will be your family\'s safety net. Choose people who care as much as you do.',
        emoji: '🛡️',
      };
    }

    if (screen === 'home' && progress.completionPercentage > 50) {
      return {
        message: 'Look how far you\'ve come! Your protection network is stronger than many families ever achieve.',
        emoji: '⭐',
      };
    }

    return null;
  }, []);

  // Show Sofia message based on context
  const showMessage = useCallback((context: SofiaMessageContext) => {
    let message: EmotionalMessage | null = null;
    let messageType: SofiaMessagesState['messageType'] = 'welcome';

    // Determine message type and content
    if (context.errorContext) {
      message = getSupportMessage(context.errorContext);
      messageType = 'support';
    } else if (context.isFirstVisit) {
      message = getTimeBasedMessage(context.timeOfDay, context.userProgress);
      messageType = 'welcome';
    } else if (context.userProgress.recentActions.length > 0) {
      message = getProgressMessage(context.userProgress);
      messageType = 'progress';
    } else if (context.currentScreen) {
      message = getGuidanceMessage(context.currentScreen, context.userProgress);
      messageType = 'guidance';
    } else {
      message = getTimeBasedMessage(context.timeOfDay, context.userProgress);
      messageType = 'welcome';
    }

    if (message) {
      setState(prev => ({
        ...prev,
        currentMessage: message!,
        messageHistory: [message!, ...prev.messageHistory.slice(0, 9)], // Keep last 10 messages
        isVisible: true,
        messageType,
      }));
    }
  }, [getTimeBasedMessage, getProgressMessage, getSupportMessage, getGuidanceMessage]);

  // Hide current message
  const hideMessage = useCallback(() => {
    setState(prev => ({
      ...prev,
      isVisible: false,
      currentMessage: undefined,
    }));
  }, []);

  // Check for milestone achievements
  const checkForAchievements = useCallback((progress: UserProgress) => {
    const { documentsCount, guardiansCount, completionPercentage } = progress;

    if (documentsCount === 1) {
      const message = EmotionalMessages.getAchievementMessage('firstDocument');
      setState(prev => ({
        ...prev,
        currentMessage: message,
        isVisible: true,
        messageType: 'achievement',
      }));
    } else if (documentsCount === 5) {
      const message = EmotionalMessages.getAchievementMessage('fiveDocuments');
      setState(prev => ({
        ...prev,
        currentMessage: message,
        isVisible: true,
        messageType: 'achievement',
      }));
    } else if (documentsCount === 10) {
      const message = EmotionalMessages.getAchievementMessage('tenDocuments');
      setState(prev => ({
        ...prev,
        currentMessage: message,
        isVisible: true,
        messageType: 'achievement',
      }));
    } else if (guardiansCount >= 3 && documentsCount >= 5) {
      const message = EmotionalMessages.getAchievementMessage('circleComplete');
      setState(prev => ({
        ...prev,
        currentMessage: message,
        isVisible: true,
        messageType: 'achievement',
      }));
    }
  }, []);

  return {
    ...state,
    showMessage,
    hideMessage,
    checkForAchievements,
    // Utility functions for external use
    getTimeBasedMessage,
    getProgressMessage,
    getSupportMessage,
    getGuidanceMessage,
  };
};