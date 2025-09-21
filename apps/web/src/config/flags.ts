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