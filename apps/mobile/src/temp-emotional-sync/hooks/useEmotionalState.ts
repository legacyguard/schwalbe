/**
 * Emotional State Hook
 * Manages user's emotional journey and progress tracking
 */

import { useState, useEffect, useCallback } from 'react';
import { EmotionalMessages } from '../components/messaging';

export interface EmotionalState {
  currentMood: 'confident' | 'worried' | 'motivated' | 'overwhelmed' | 'accomplished' | 'neutral';
  progressLevel: 'beginner' | 'building' | 'advanced' | 'expert';
  lastInteraction: Date | null;
  engagementScore: number; // 0-100
  milestones: string[];
  preferences: {
    hapticEnabled: boolean;
    animationsEnabled: boolean;
    sofiaEnabled: boolean;
    celebrationsEnabled: boolean;
  };
}

export interface EmotionalAction {
  type: 'document_upload' | 'guardian_added' | 'milestone_reached' | 'error_encountered' | 'app_opened' | 'feature_used';
  context?: string;
  timestamp: Date;
  impact: 'positive' | 'negative' | 'neutral';
}

export const useEmotionalState = () => {
  const [state, setState] = useState<EmotionalState>({
    currentMood: 'neutral',
    progressLevel: 'beginner',
    lastInteraction: null,
    engagementScore: 0,
    milestones: [],
    preferences: {
      hapticEnabled: true,
      animationsEnabled: true,
      sofiaEnabled: true,
      celebrationsEnabled: true,
    },
  });

  const [actionHistory, setActionHistory] = useState<EmotionalAction[]>([]);

  // Track user action and update emotional state
  const trackAction = useCallback((action: Omit<EmotionalAction, 'timestamp'>) => {
    const fullAction: EmotionalAction = {
      ...action,
      timestamp: new Date(),
    };

    setActionHistory(prev => [fullAction, ...prev.slice(0, 49)]); // Keep last 50 actions

    setState(prev => {
      let newEngagementScore = prev.engagementScore;
      let newMood = prev.currentMood;
      let newProgressLevel = prev.progressLevel;
      const newMilestones = [...prev.milestones];

      // Update engagement score based on action impact
      switch (action.impact) {
        case 'positive':
          newEngagementScore = Math.min(100, newEngagementScore + 5);
          break;
        case 'negative':
          newEngagementScore = Math.max(0, newEngagementScore - 3);
          break;
        default:
          newEngagementScore = Math.min(100, newEngagementScore + 1);
      }

      // Update mood based on recent actions and engagement
      const recentPositiveActions = actionHistory
        .slice(0, 5)
        .filter(a => a.impact === 'positive').length;

      const recentNegativeActions = actionHistory
        .slice(0, 5)
        .filter(a => a.impact === 'negative').length;

      if (action.type === 'milestone_reached') {
        newMood = 'accomplished';
        newMilestones.push(action.context || 'milestone');
      } else if (action.type === 'error_encountered') {
        newMood = recentNegativeActions > 2 ? 'overwhelmed' : 'worried';
      } else if (recentPositiveActions >= 3) {
        newMood = 'confident';
      } else if (action.impact === 'positive') {
        newMood = 'motivated';
      }

      // Update progress level based on engagement and milestones
      if (newEngagementScore >= 80 && newMilestones.length >= 5) {
        newProgressLevel = 'expert';
      } else if (newEngagementScore >= 60 && newMilestones.length >= 3) {
        newProgressLevel = 'advanced';
      } else if (newEngagementScore >= 30 && newMilestones.length >= 1) {
        newProgressLevel = 'building';
      }

      return {
        ...prev,
        currentMood: newMood,
        progressLevel: newProgressLevel,
        lastInteraction: new Date(),
        engagementScore: newEngagementScore,
        milestones: newMilestones,
      };
    });
  }, [actionHistory]);

  // Get current emotional context for Sofia messages
  const getEmotionalContext = useCallback(() => {
    const timeOfDay = EmotionalMessages.getCurrentTimeOfDay();
    const recentActions = actionHistory.slice(0, 5).map(a => a.type);

    return {
      timeOfDay,
      mood: state.currentMood,
      progressLevel: state.progressLevel,
      engagementScore: state.engagementScore,
      recentActions,
      lastInteraction: state.lastInteraction,
    };
  }, [state, actionHistory]);

  // Get appropriate encouragement message based on current state
  const getEncouragementMessage = useCallback(() => {
    const { currentMood, progressLevel, engagementScore } = state;

    if (currentMood === 'overwhelmed') {
      return {
        message: "Take a deep breath. You're doing something wonderful for your family, and that's what matters most.",
        action: 'Take a break and come back when you\'re ready.',
      };
    }

    if (currentMood === 'worried' && engagementScore < 30) {
      return {
        message: "Every small step you take is an act of love. Don't worry about perfection - focus on progress.",
        action: 'Start with something simple today.',
      };
    }

    if (currentMood === 'accomplished') {
      return {
        message: "Look at what you've achieved! Your family is so fortunate to have someone who cares as much as you do.",
        action: 'Share your progress or celebrate this moment.',
      };
    }

    if (progressLevel === 'expert') {
      return {
        message: "You've become a true guardian expert. Your dedication is inspiring and your family's future is secure.",
        action: 'Consider helping others on their protection journey.',
      };
    }

    return {
      message: "You're making steady progress on this important journey. Every step brings more security to your family.",
      action: 'Keep building your protection network.',
    };
  }, [state]);

  // Update user preferences
  const updatePreferences = useCallback((newPreferences: Partial<EmotionalState['preferences']>) => {
    setState(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        ...newPreferences,
      },
    }));
  }, []);

  // Reset emotional state (for testing or user request)
  const resetEmotionalState = useCallback(() => {
    setState({
      currentMood: 'neutral',
      progressLevel: 'beginner',
      lastInteraction: null,
      engagementScore: 0,
      milestones: [],
      preferences: {
        hapticEnabled: true,
        animationsEnabled: true,
        sofiaEnabled: true,
        celebrationsEnabled: true,
      },
    });
    setActionHistory([]);
  }, []);

  // Calculate time since last interaction
  const getTimeSinceLastInteraction = useCallback(() => {
    if (!state.lastInteraction) return null;
    return Date.now() - state.lastInteraction.getTime();
  }, [state.lastInteraction]);

  // Check if user might need encouragement
  const needsEncouragement = useCallback(() => {
    const timeSince = getTimeSinceLastInteraction();
    const hasRecentNegativeActions = actionHistory
      .slice(0, 3)
      .some(a => a.impact === 'negative');

    return (
      state.currentMood === 'overwhelmed' ||
      state.currentMood === 'worried' ||
      (timeSince && timeSince > 24 * 60 * 60 * 1000) || // 24 hours
      (hasRecentNegativeActions && state.engagementScore < 40)
    );
  }, [state, actionHistory, getTimeSinceLastInteraction]);

  return {
    state,
    actionHistory: actionHistory.slice(0, 10), // Return only recent actions
    trackAction,
    getEmotionalContext,
    getEncouragementMessage,
    updatePreferences,
    resetEmotionalState,
    getTimeSinceLastInteraction,
    needsEncouragement,
  };
};