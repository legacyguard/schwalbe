// Feature flag parsing utilities for Next.js app
// All code in English; user-facing copy belongs in i18n JSONs.

function parseBoolean(value: string | undefined, defaultValue = false): boolean {
  if (value === undefined || value === null) return defaultValue;
  const v = value.trim();
  if (v === "") return defaultValue;
  return /^(1|true|yes|on)$/i.test(v);
}

/**
 * Returns whether the Hollywood landing (v2) is enabled.
 * Controlled by NEXT_PUBLIC_ENABLE_HOLLYWOOD_LANDING env var.
 * - Accepted truthy values: 1, true, yes, on (case-insensitive)
 * - Default: false
 */
export function isHollywoodLandingEnabled(): boolean {
  return parseBoolean(process.env.NEXT_PUBLIC_ENABLE_HOLLYWOOD_LANDING, false);
}

export const flags = {
  hollywoodLandingEnabled: isHollywoodLandingEnabled,
};
