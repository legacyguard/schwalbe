// Feature flags for apps/web-next
// All code in English; user-facing copy goes into i18n JSONs.

function parseBoolean(value: string | undefined, defaultValue = false): boolean {
  if (value === undefined || value === null) return defaultValue;
  const v = value.trim();
  if (v === "") return defaultValue;
  return /^(1|true|yes|on)$/i.test(v);
}

export function isHollywoodLandingEnabled(): boolean {
  return parseBoolean(process.env.NEXT_PUBLIC_ENABLE_HOLLYWOOD_LANDING, false);
}

export function isOnboardingEnabled(): boolean {
  return parseBoolean(process.env.NEXT_PUBLIC_ENABLE_ONBOARDING, false);
}

export function isAssistantEnabled(): boolean {
  return parseBoolean(process.env.NEXT_PUBLIC_ENABLE_ASSISTANT, false);
}

export const flags = {
  hollywoodLandingEnabled: isHollywoodLandingEnabled,
  onboardingEnabled: isOnboardingEnabled,
  assistantEnabled: isAssistantEnabled,
};
