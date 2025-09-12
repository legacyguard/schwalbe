/**
 * Onboarding Tooltips System
 * Interactive guided tour for new features with smart positioning and progressive disclosure
 */
import React from 'react';
interface TooltipStep {
    action?: {
        callback?: () => void;
        text: string;
        type: 'click' | 'focus' | 'hover';
    };
    content: string;
    delay?: number;
    highlight?: boolean;
    id: string;
    position?: 'auto' | 'bottom' | 'left' | 'right' | 'top';
    showSkip?: boolean;
    targetSelector: string;
    title: string;
}
interface OnboardingFlow {
    description: string;
    id: string;
    name: string;
    steps: TooltipStep[];
    trigger: 'auto' | 'feature-first-use' | 'manual';
    version: string;
}
interface OnboardingTooltipsProps {
    currentFlowId?: string;
    flows: OnboardingFlow[];
    onComplete?: (flowId: string) => void;
    onSkip?: (flowId: string, stepIndex: number) => void;
    userId: string;
}
export declare const OnboardingTooltips: React.FC<OnboardingTooltipsProps>;
export declare const defaultOnboardingFlows: OnboardingFlow[];
export declare function useOnboarding(userId: string): {
    activeFlowId: string | null;
    startFlow: (flowId: string) => void;
    hasCompletedFlow: (flowId: string, version: string) => any;
    resetFlow: (flowId: string) => void;
    handleComplete: (flowId: string) => void;
    handleSkip: (flowId: string, stepIndex: number) => void;
};
export {};
//# sourceMappingURL=OnboardingTooltips.d.ts.map