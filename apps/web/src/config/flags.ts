// Centralized feature flags for the Vite app
// These use VITE_* env vars which are exposed to the client

import { features } from '@/lib/env';

export function isAssistantEnabled(): boolean {
  return features.assistant;
}

export function isOnboardingEnabled(): boolean {
  return features.onboarding;
}

export function isLandingEnabled(): boolean {
  return features.landing;
}

export function isFeatureEnabled(feature: string): boolean {
  // Generic feature flag function - can be extended to check specific features
  // In production, features default to disabled unless explicitly enabled
  switch (feature) {
    case 'sofiaFirefly':
      return features.sofiaFirefly;
    case 'emotionalMessages':
      return features.emotionalMessages;
    case 'achievements':
      return features.achievements;
    default:
      return false; // Disable unknown features by default for safety
  }
}