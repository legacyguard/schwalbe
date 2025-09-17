import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useWizard } from '../state/WizardContext';
import { useTranslation } from 'react-i18next';
import { useEngineDraft } from '../hooks/useEngineValidation';
export function StepReview() {
    const { toEngineInput } = useWizard();
    const { t } = useTranslation('will/wizard');
    const input = toEngineInput();
    const draft = useEngineDraft(input);
    return (_jsxs("div", { className: "grid gap-4", children: [!draft.validation.isValid && (_jsxs("div", { className: "bg-red-900/30 border border-red-700 rounded p-3", children: [_jsx("h3", { className: "font-semibold mb-2", children: t('review.validationErrors') }), _jsx("ul", { className: "list-disc pl-6", children: draft.validation.errors.map((e) => (_jsx("li", { className: "text-red-200", children: e.message }, e.code))) })] })), draft.validation.warnings.length > 0 && (_jsxs("div", { className: "bg-yellow-900/30 border border-yellow-700 rounded p-3", children: [_jsx("h3", { className: "font-semibold mb-2", children: t('review.validationWarnings') }), _jsx("ul", { className: "list-disc pl-6", children: draft.validation.warnings.map((w, i) => (_jsx("li", { className: "text-yellow-200", children: w.message }, w.code + i))) })] })), _jsxs("div", { className: "bg-slate-900 border border-slate-700 rounded p-3", children: [_jsx("h3", { className: "font-semibold mb-2", children: t('review.previewTitle') }), _jsx("article", { className: "prose prose-invert max-w-none whitespace-pre-wrap", children: draft.content })] })] }));
}
