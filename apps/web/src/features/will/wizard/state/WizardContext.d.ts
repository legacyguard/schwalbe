import React from 'react';
import type { JurisdictionCode, WillForm, WillInput } from '@schwalbe/logic/will/engine';
export type WizardStepKey = 'start' | 'testator' | 'beneficiaries' | 'executor' | 'witnesses' | 'review';
export interface BeneficiaryItem {
    id: string;
    name: string;
    relationship?: string;
}
export interface WitnessItem {
    id: string;
    fullName: string;
    isBeneficiary?: boolean;
}
export interface WizardState {
    jurisdiction: JurisdictionCode;
    language: 'en' | 'cs' | 'sk';
    form: WillForm;
    testator: {
        fullName: string;
        age?: number;
        address?: string;
    };
    beneficiaries: BeneficiaryItem[];
    executorName?: string;
    signatures: {
        testatorSigned: boolean;
        witnessesSigned?: boolean;
    };
    witnesses: WitnessItem[];
}
export declare const InitialWizardState: WizardState;
export declare const stepsOrder: WizardStepKey[];
interface WizardContextValue {
    state: WizardState;
    setState: React.Dispatch<React.SetStateAction<WizardState>>;
    sessionId: string;
    currentStep: WizardStepKey;
    goNext: () => void;
    goBack: () => void;
    goTo: (step: WizardStepKey) => void;
    saveDraft: (opts?: {
        toast?: (msg: string) => void;
    }) => Promise<void>;
    loadDraft: (sessionId?: string) => Promise<boolean>;
    toEngineInput: () => WillInput;
}
export declare function WizardProvider({ children }: {
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function useWizard(): WizardContextValue;
export {};
//# sourceMappingURL=WizardContext.d.ts.map