import { useMemo } from 'react';
import { useWizard } from '../state/WizardContext';
import { useEngineValidation } from './useEngineValidation';
const defaultPerStep = {
    start: { errors: [], warnings: [] },
    testator: { errors: [], warnings: [] },
    beneficiaries: { errors: [], warnings: [] },
    executor: { errors: [], warnings: [] },
    witnesses: { errors: [], warnings: [] },
    review: { errors: [], warnings: [] },
};
function mapCodeToStep(code) {
    // Map engine issue codes to steps for aggregation
    if (code.includes('JURISDICTION'))
        return 'start';
    if (code.includes('TESTATOR_AGE'))
        return 'testator';
    if (code.includes('BENEFICIARY'))
        return 'beneficiaries';
    if (code.includes('WITNESS'))
        return 'witnesses';
    if (code.includes('EXECUTOR'))
        return 'executor';
    return 'review';
}
function remediationFor(code) {
    // Actionable, English-only guidance
    switch (code) {
        case 'TESTATOR_AGE_TYPED_MIN_18':
            return 'Increase testator age to at least 18 or change form to Holographic.';
        case 'TESTATOR_AGE_HOLOGRAPHIC_MIN_15':
            return 'Increase testator age to at least 15 for a holographic will.';
        case 'WITNESS_COUNT_TOO_LOW':
            return 'Add the required number of witnesses for the selected form.';
        case 'WITNESS_CONFLICT_BENEFICIARY':
            return 'Remove beneficiaries from the list of witnesses or choose different witnesses.';
        case 'MISSING_TESTATOR_SIGNATURE':
            return 'Confirm that the testator will sign the will.';
        case 'MISSING_WITNESS_SIGNATURES':
            return 'Confirm that witnesses will sign the will for a typed form.';
        case 'CZ_JURISDICTION_MISMATCH':
        case 'SK_JURISDICTION_MISMATCH':
            return 'Select the correct jurisdiction for the validator.';
        default:
            return 'Review this item and update the related fields.';
    }
}
export function useCompliance() {
    const { toEngineInput } = useWizard();
    const input = toEngineInput();
    const validation = useEngineValidation(input);
    return useMemo(() => {
        const perStep = {
            ...defaultPerStep,
            start: { errors: [], warnings: [] },
            testator: { errors: [], warnings: [] },
            beneficiaries: { errors: [], warnings: [] },
            executor: { errors: [], warnings: [] },
            witnesses: { errors: [], warnings: [] },
            review: { errors: [], warnings: [] },
        };
        const items = [];
        for (const e of validation.errors) {
            const step = mapCodeToStep(e.code);
            const item = { code: e.code, message: e.message, severity: 'error', step, guidance: remediationFor(e.code) };
            perStep[step].errors.push(item);
            items.push(item);
        }
        for (const w of validation.warnings) {
            const step = mapCodeToStep(w.code);
            const item = { code: w.code, message: w.message, severity: 'warning', step, guidance: remediationFor(w.code) };
            perStep[step].warnings.push(item);
            items.push(item);
        }
        return {
            overall: {
                isValid: validation.isValid,
                errorCount: validation.errors.length,
                warningCount: validation.warnings.length,
            },
            items,
            stepIssues: perStep,
        };
    }, [validation]);
}
