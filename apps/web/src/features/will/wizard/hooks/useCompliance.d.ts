import { type WizardStepKey } from '../state/WizardContext';
export interface ComplianceItem {
    code: string;
    message: string;
    severity: 'error' | 'warning';
    step: WizardStepKey;
    guidance: string;
}
export interface StepIssues {
    errors: ComplianceItem[];
    warnings: ComplianceItem[];
}
export interface ComplianceResult {
    overall: {
        isValid: boolean;
        errorCount: number;
        warningCount: number;
    };
    items: ComplianceItem[];
    stepIssues: Record<WizardStepKey, StepIssues>;
}
export declare function useCompliance(): ComplianceResult;
//# sourceMappingURL=useCompliance.d.ts.map