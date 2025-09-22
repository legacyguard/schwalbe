import React from 'react';
import Onboarding from '@/pages/onboarding/Onboarding';

interface OnboardingWrapperProps {
  children: React.ReactNode;
}

const STORAGE_KEY = 'legacyguard.onboardingCompleted';

export function OnboardingWrapper({ children }: OnboardingWrapperProps) {
  const [showOnboarding, setShowOnboarding] = React.useState(() => {
    return sessionStorage.getItem(STORAGE_KEY) !== 'true';
  });

  const handleComplete = () => {
    sessionStorage.setItem(STORAGE_KEY, 'true');
    setShowOnboarding(false);
  };

  if (showOnboarding) {
    return <Onboarding onComplete={handleComplete} />;
  }

  return <>{children}</>;
}
