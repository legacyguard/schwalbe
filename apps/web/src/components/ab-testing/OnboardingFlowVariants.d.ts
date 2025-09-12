/**
 * A/B Testing Onboarding Flow Variants
 * Tests different onboarding approaches for conversion optimization
 */
interface OnboardingFlowProps {
    className?: string;
    onComplete: (userData: Record<string, unknown>) => void;
    onSkip?: () => void;
    userId?: string;
}
export declare function ABTestOnboardingFlow({ onComplete, onSkip, userId, className, }: OnboardingFlowProps): import("react/jsx-runtime").JSX.Element;
export default ABTestOnboardingFlow;
//# sourceMappingURL=OnboardingFlowVariants.d.ts.map