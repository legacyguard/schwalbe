export const LEGAL_VERSIONS = {
  terms: '2025-09-16-v1',
  privacy: '2025-09-16-v1',
  cookies: '2025-09-16-v1',
} as const;

export type LegalDocKey = keyof typeof LEGAL_VERSIONS;

export function getConsentVersionTag() {
  // Combine versions into a single tag for cookie persistence
  const { terms, privacy, cookies } = LEGAL_VERSIONS;
  return `${terms}|${privacy}|${cookies}`;
}