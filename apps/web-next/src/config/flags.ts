// Centralized feature flags for the Next.js app
// These are safe to use in client components when using NEXT_PUBLIC_* env vars

function parseFlag(val: string | undefined): boolean {
  return /^(1|true|yes|on)$/i.test((val || '').trim());
}

export function isAssistantEnabled(): boolean {
  return parseFlag(process.env.NEXT_PUBLIC_ENABLE_ASSISTANT);
}

export function isOnboardingEnabled(): boolean {
  return parseFlag(process.env.NEXT_PUBLIC_ENABLE_ONBOARDING);
}

export function isHollywoodLandingEnabled(): boolean {
  return parseFlag(process.env.NEXT_PUBLIC_ENABLE_HOLLYWOOD_LANDING);
}