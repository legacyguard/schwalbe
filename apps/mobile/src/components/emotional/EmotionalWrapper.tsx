/**
 * Emotional Wrapper Component
 * Conditionally renders emotional sync features based on feature flags
 */

import React from 'react';
import { View } from 'react-native';
import { isEmotionalSyncEnabled, isFeatureEnabled } from '../../config/featureFlags';

// Lazy load emotional sync components only when needed
const MobileSofiaFirefly = React.lazy(() =>
  import('../../temp-emotional-sync/components/sofia-firefly').then(module => ({
    default: module.MobileSofiaFirefly
  }))
);

const EmotionalMessageCard = React.lazy(() =>
  import('../../temp-emotional-sync/components/messaging').then(module => ({
    default: module.EmotionalMessageCard
  }))
);

const AchievementCelebration = React.lazy(() =>
  import('../../temp-emotional-sync/components/achievements').then(module => ({
    default: module.AchievementCelebration
  }))
);

const DailyCheckIn = React.lazy(() =>
  import('../../temp-emotional-sync/components/personal').then(module => ({
    default: module.DailyCheckIn
  }))
);

export interface EmotionalWrapperProps {
  children: React.ReactNode;
  enableSofia?: boolean;
  enableMessages?: boolean;
  enableAchievements?: boolean;
  enableDailyCheckIn?: boolean;
}

export const EmotionalWrapper: React.FC<EmotionalWrapperProps> = React.memo(({
  children,
  enableSofia = false,
  enableMessages = false,
  enableAchievements = false,
  enableDailyCheckIn = false,
}) => {
  if (!isEmotionalSyncEnabled()) {
    return <>{children}</>;
  }

  return (
    <View style={{ flex: 1 }}>
      {children}

      {/* Sofia Firefly overlay */}
      {enableSofia && isFeatureEnabled('sofiaFirefly') && (
        <React.Suspense fallback={null}>
          <MobileSofiaFirefly isEnabled={true} />
        </React.Suspense>
      )}

      {/* Additional emotional overlays can be added here */}
    </View>
  );
});

// Conditional emotional message component
export interface ConditionalEmotionalMessageProps {
  message: {
    title?: string;
    message: string;
    emoji?: string;
    action?: {
      text: string;
      route?: string;
    };
  };
  variant?: 'default' | 'success' | 'comfort' | 'achievement';
  onDismiss?: () => void;
}

export const ConditionalEmotionalMessage: React.FC<ConditionalEmotionalMessageProps> = React.memo((props) => {
  if (!isFeatureEnabled('emotionalMessages')) {
    return null;
  }

  return (
    <React.Suspense fallback={null}>
      <EmotionalMessageCard {...props} />
    </React.Suspense>
  );
});

// Conditional achievement celebration
export interface ConditionalAchievementProps {
  achievement: {
    id: string;
    title: string;
    description: string;
    icon: string;
    shareText?: string;
    unlockedAt: Date;
  };
  onDismiss: () => void;
  visible: boolean;
}

export const ConditionalAchievement: React.FC<ConditionalAchievementProps> = React.memo((props) => {
  if (!isFeatureEnabled('achievements')) {
    return null;
  }

  return (
    <React.Suspense fallback={null}>
      <AchievementCelebration {...props} />
    </React.Suspense>
  );
});

// Conditional daily check-in
export interface ConditionalDailyCheckInProps {
  onComplete: (response: {
    mood: 'confident' | 'worried' | 'motivated' | 'overwhelmed' | 'neutral';
    protectionFeeling: number; // 1-10 scale
    priorityToday: string;
    notes?: string;
    timestamp: Date;
  }) => void;
  onDismiss?: () => void;
  userName?: string;
}

export const ConditionalDailyCheckIn: React.FC<ConditionalDailyCheckInProps> = React.memo((props) => {
  if (!isFeatureEnabled('dailyCheckIn')) {
    return null;
  }

  return (
    <React.Suspense fallback={null}>
      <DailyCheckIn {...props} />
    </React.Suspense>
  );
});