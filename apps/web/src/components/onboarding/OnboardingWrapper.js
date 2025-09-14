import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Onboarding from '@/pages/onboarding/Onboarding';
export function OnboardingWrapper({ children }) {
    const [user, setUser] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
    useEffect(() => {
        let mounted = true;
        supabase.auth.getUser().then(({ data }) => {
            if (!mounted)
                return;
            setUser(data.user);
            setIsLoaded(true);
        });
        return () => {
            mounted = false;
        };
    }, []);
    useEffect(() => {
        if (!isLoaded || !user) {
            return;
        }
        // Check if user has completed onboarding
        const hasCompletedOnboarding = (user?.user_metadata)?.onboardingCompleted;
        if (hasCompletedOnboarding) {
            setShowOnboarding(false);
            setIsCheckingOnboarding(false);
            return;
        }
        // Check if this is a new user (created within the last 2 minutes)
        const createdAt = new Date((user?.created_at) || new Date());
        const now = new Date();
        const timeDifference = now.getTime() - createdAt.getTime();
        const isNewUser = timeDifference < 2 * 60 * 1000; // 2 minutes
        if (isNewUser) {
            setShowOnboarding(true);
        }
        setIsCheckingOnboarding(false);
    }, [isLoaded, user]);
    const handleOnboardingComplete = async () => {
        if (!user)
            return;
        try {
            // Mark onboarding as completed in user metadata
            const updated = {
                ...(user?.user_metadata || {}),
                onboardingCompleted: true,
                onboardingCompletedAt: new Date().toISOString(),
            };
            await supabase.auth.updateUser({ data: updated });
            setShowOnboarding(false);
        }
        catch (error) {
            console.error('Failed to update onboarding status: ', error);
            // Even if metadata update fails, don't show onboarding again this session
            setShowOnboarding(false);
        }
    };
    // Show loading state while checking onboarding status
    if (isCheckingOnboarding) {
        return (_jsx("div", { className: 'min-h-screen flex items-center justify-center bg-background', children: _jsxs("div", { className: 'text-center', children: [_jsx("div", { className: 'w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4' }), _jsx("p", { className: 'text-muted-foreground', children: "Preparing your experience..." })] }) }));
    }
    // Show onboarding for new users
    if (showOnboarding) {
        return _jsx(OnboardingWithCompletion, { onComplete: handleOnboardingComplete });
    }
    // Show normal app content
    return _jsx(_Fragment, { children: children });
}
// Wrapper component that passes the completion handler to the onboarding flow
function OnboardingWithCompletion({ onComplete }) {
    return _jsx(Onboarding, { onComplete: onComplete });
}
