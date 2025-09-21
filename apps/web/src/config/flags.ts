// Centralized feature flags for the Vite app
// These use VITE_* env vars which are exposed to the client

function parseFlag(val: string | undefined): boolean {
  return /^(1|true|yes|on)$/i.test((val || '').trim());
}

export function isAssistantEnabled(): boolean {
  return parseFlag(import.meta.env.VITE_ENABLE_ASSISTANT);
}

export function isOnboardingEnabled(): boolean {
  return parseFlag(import.meta.env.VITE_ENABLE_ONBOARDING);
}

export function isLandingEnabled(): boolean {
  // Enable landing page by default for production deployment
  return parseFlag(import.meta.env.VITE_ENABLE_LANDING) || true;
}

export function isFeatureEnabled(feature: string): boolean {
  // Generic feature flag function - can be extended to check specific features
  switch (feature) {
    case 'sofiaFirefly':
      return parseFlag(import.meta.env.VITE_ENABLE_SOFIA_FIREFLY) || true;
    case 'emotionalMessages':
      return parseFlag(import.meta.env.VITE_ENABLE_EMOTIONAL_MESSAGES) || true;
    case 'achievements':
      return parseFlag(import.meta.env.VITE_ENABLE_ACHIEVEMENTS) || true;
    default:
      return true; // Enable features by default in development
  }
}