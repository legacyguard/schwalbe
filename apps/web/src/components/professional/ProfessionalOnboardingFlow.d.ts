/**
 * Professional Reviewer Onboarding Flow
 * Multi-step onboarding process for attorneys and legal professionals
 */
import type { ProfessionalOnboarding } from '@schwalbe/types/professional';
interface ProfessionalOnboardingFlowProps {
    className?: string;
    onCancel?: () => void;
    onComplete: (data: Omit<ProfessionalOnboarding, 'created_at' | 'id' | 'status' | 'updated_at'>) => void;
}
export declare function ProfessionalOnboardingFlow({ onComplete, onCancel, className, }: ProfessionalOnboardingFlowProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ProfessionalOnboardingFlow.d.ts.map