// Add dashboard feature flag parser
import { isAssistantEnabled, isHollywoodLandingEnabled, isOnboardingEnabled } from '@/config/flags';
export { isAssistantEnabled, isHollywoodLandingEnabled, isOnboardingEnabled } from '@/config/flags';

export function isDashboardV2Enabled(): boolean {
  return /^(1|true|yes|on)$/i.test((process.env.NEXT_PUBLIC_ENABLE_DASHBOARD_V2 || '').trim());
}

export const dashboardFlags = {
  dashboardV2: isDashboardV2Enabled,
  assistant: isAssistantEnabled,
  landing: isHollywoodLandingEnabled,
  onboarding: isOnboardingEnabled,
};
