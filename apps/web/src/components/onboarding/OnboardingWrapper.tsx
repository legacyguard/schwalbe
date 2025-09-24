import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@schwalbe/shared';

import Onboarding from '@/pages/onboarding/Onboarding';
import { features } from '@/lib/env';

interface OnboardingWrapperProps {
  children: React.ReactNode;
}

const STORAGE_KEY = 'legacyguard.onboardingCompleted';

export function OnboardingWrapper({ children }: OnboardingWrapperProps) {
  const location = useLocation();
  const { user, isLoading } = useAuthStore();

  const [showOnboarding, setShowOnboarding] = React.useState(false);

  // Onboarding is disabled - always return false
  React.useEffect(() => {
    setShowOnboarding(false);
  }, [location.pathname, user]);

  const handleComplete = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setShowOnboarding(false);
  };

  // Don't show onboarding while auth is loading
  if (isLoading) {
    return <>{children}</>;
  }

  if (showOnboarding) {
    return <Onboarding onComplete={handleComplete} />;
  }

  return <>{children}</>;
}
