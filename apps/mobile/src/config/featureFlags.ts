/**
 * Feature Flags Configuration
 * Controls which emotional sync features are enabled
 */

export interface FeatureFlags {
  emotionalSync: boolean;
  sofiaFirefly: boolean;
  emotionalMessages: boolean;
  achievements: boolean;
  hapticFeedback: boolean;
  dailyCheckIn: boolean;
  familyPhotos: boolean;
  emotionalOnboarding: boolean;
}

// Get feature flag value from environment with fallback
const getFeatureFlag = (key: string, defaultValue: boolean = false): boolean => {
  const envValue = process.env[`EXPO_PUBLIC_${key.toUpperCase()}`];
  if (envValue === undefined) return defaultValue;
  return envValue === '1' || envValue.toLowerCase() === 'true';
};

export const featureFlags: FeatureFlags = {
  // Master switch for all emotional sync features
  emotionalSync: getFeatureFlag('EMOTIONAL_SYNC_ENABLED', false),

  // Individual feature toggles
  sofiaFirefly: getFeatureFlag('SOFIA_FIREFLY_ENABLED', false),
  emotionalMessages: getFeatureFlag('EMOTIONAL_MESSAGES_ENABLED', false),
  achievements: getFeatureFlag('ACHIEVEMENTS_ENABLED', false),
  hapticFeedback: getFeatureFlag('HAPTIC_FEEDBACK_ENABLED', true),
  dailyCheckIn: getFeatureFlag('DAILY_CHECKIN_ENABLED', false),
  familyPhotos: getFeatureFlag('FAMILY_PHOTOS_ENABLED', false),
  emotionalOnboarding: getFeatureFlag('EMOTIONAL_ONBOARDING_ENABLED', false),
};

// Helper to check if emotional sync is enabled
export const isEmotionalSyncEnabled = (): boolean => {
  return featureFlags.emotionalSync;
};

// Helper to check individual features (requires master flag to be on)
export const isFeatureEnabled = (feature: keyof Omit<FeatureFlags, 'emotionalSync'>): boolean => {
  return featureFlags.emotionalSync && featureFlags[feature];
};

// Development helper to override flags (useful for testing)
export const overrideFeatureFlags = (overrides: Partial<FeatureFlags>): void => {
  if (__DEV__) {
    Object.assign(featureFlags, overrides);
  }
};