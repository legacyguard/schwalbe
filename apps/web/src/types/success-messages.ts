/**
 * Shared types for personalized success messaging system
 * Extracted to prevent circular dependencies
 */

export interface UserAchievement {
  id: string;
  type: 'milestone' | 'completion' | 'streak' | 'discovery' | 'collaboration' | 'protection_boost';
  title: string;
  description: string;
  significance: 'minor' | 'moderate' | 'major' | 'transformational';
  category: 'will_creation' | 'document_organization' | 'family_protection' | 'goal_achievement' | 'personal_growth';
  timestamp: number;
  context: {
    actionType: string;
    completionPercentage?: number;
    timeSpent?: number;
    collaboratorsInvolved?: string[];
    difficultyLevel?: 'easy' | 'medium' | 'hard';
  };
}

export interface PersonalizedSuccessMessage {
  id: string;
  content: string;
  tone: 'warm' | 'celebratory' | 'encouraging' | 'grateful' | 'proud' | 'supportive';
  culturalAdaptation: {
    locale: string;
    culturalNorms: string[];
    adaptations: string[];
  };
  personalization: {
    userName?: string;
    achievementContext: string;
    previousAchievements: string[];
    familyContext?: string;
    personalGoals?: string[];
  };
  accessibility: {
    screenReaderText: string;
    highContrastMode: boolean;
    reducedMotion: boolean;
    voiceNarration?: string;
  };
  followUpActions: SuccessFollowUpAction[];
  estimatedResonance: number; // 0-1 prediction
}

export interface SuccessFollowUpAction {
  id: string;
  label: string;
  type: 'continue_journey' | 'share_achievement' | 'explore_feature' | 'invite_family' | 'upgrade_plan';
  priority: 'primary' | 'secondary' | 'tertiary';
  accessibility: {
    ariaLabel: string;
    keyboardShortcut?: string;
  };
}

export interface SuccessMessageAnalytics {
  messageId: string;
  displayDuration: number;
  userEngagement: {
    clicked: boolean;
    shared: boolean;
    dismissed: boolean;
    followUpActionsTaken: string[];
  };
  emotionalResponse: 'positive' | 'neutral' | 'negative' | 'unknown';
  accessibilityUsage: {
    screenReader: boolean;
    keyboardNavigation: boolean;
    highContrast: boolean;
    voiceActivation: boolean;
  };
  contextEffectiveness: number; // 0-1 scale
}