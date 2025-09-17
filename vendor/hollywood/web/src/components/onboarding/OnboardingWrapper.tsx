
import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import Onboarding from '@/pages/onboarding/Onboarding';

interface OnboardingWrapperProps {
  children: React.ReactNode;
}

export function OnboardingWrapper({ children }: OnboardingWrapperProps) {
  const { user, isLoaded } = useUser();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

  useEffect(() => {
    if (!isLoaded || !user) {
      return;
    }

    // Check if user has completed onboarding
    const hasCompletedOnboarding = user.unsafeMetadata?.onboardingCompleted;

    if (hasCompletedOnboarding) {
      setShowOnboarding(false);
      setIsCheckingOnboarding(false);
      return;
    }

    // Check if this is a new user (created within the last 2 minutes)
    const createdAt = new Date(user.createdAt || new Date());
    const now = new Date();
    const timeDifference = now.getTime() - createdAt.getTime();
    const isNewUser = timeDifference < 2 * 60 * 1000; // 2 minutes

    if (isNewUser) {
      setShowOnboarding(true);
    }

    setIsCheckingOnboarding(false);
  }, [isLoaded, user]);

  const handleOnboardingComplete = async () => {
    if (!user) return;

    try {
      // Mark onboarding as completed in user metadata
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          onboardingCompleted: true,
          onboardingCompletedAt: new Date().toISOString(),
        },
      });

      setShowOnboarding(false);
    } catch (error) {
      console.error('Failed to update onboarding status: ', error);
      // Even if metadata update fails, don' as constt show onboarding again this session
      setShowOnboarding(false);
    }
  };

  // Show loading state while checking onboarding status
  if (isCheckingOnboarding) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-background'>
        <div className='text-center'>
          <div className='w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-muted-foreground'>Preparing your experience...</p>
        </div>
      </div>
    );
  }

  // Show onboarding for new users
  if (showOnboarding) {
    return <OnboardingWithCompletion onComplete={handleOnboardingComplete} />;
  }

  // Show normal app content
  return <>{children}</>;
}

// Wrapper component that passes the completion handler to the onboarding flow
function OnboardingWithCompletion({ onComplete }: { onComplete: () => void }) {
  return <Onboarding onComplete={onComplete} />;
}
