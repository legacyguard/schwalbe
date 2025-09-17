import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTranslation } from 'react-i18next';
import { useWizard, stepsOrder } from '../state/WizardContext';
import { Progress } from './progress/Progress';
import { Button } from '@/components/ui/button';
import { useCompliance } from '../hooks/useCompliance';
import { ComplianceBanner } from './compliance/ComplianceBanner';
export function WizardLayout({ children }) {
    const { t } = useTranslation('will/wizard');
    const { currentStep, goBack, goNext, saveDraft } = useWizard();
    const index = stepsOrder.indexOf(currentStep);
    const canBack = index > 0;
    const canNext = index < stepsOrder.length - 1;
    const compliance = useCompliance();
    return (_jsxs("div", { className: "mx-auto max-w-3xl text-white p-4", children: [_jsxs("header", { className: "mb-6", children: [_jsx("h1", { className: "text-2xl font-semibold", children: t('title') }), _jsx(Progress, { currentIndex: index, labels: stepsOrder.map((k) => t(`steps.${k}`)), statuses: stepsOrder.map((step) => ({
                            errors: compliance.stepIssues[step]?.errors.length ?? 0,
                            warnings: compliance.stepIssues[step]?.warnings.length ?? 0,
                        })) }), _jsx(ComplianceBanner, { compliance: compliance })] }), _jsx("section", { className: "bg-slate-800 rounded-lg border border-slate-700 p-4", "aria-live": "polite", children: children }), _jsxs("footer", { className: "mt-6 flex items-center gap-2 justify-between", children: [_jsx("div", { className: "flex items-center gap-2", children: _jsx(Button, { variant: "secondary", onClick: () => void saveDraft(), "aria-label": "Save draft", children: t('actions.save') }) }), _jsxs("div", { className: "flex items-center gap-2", children: [canBack && (_jsx(Button, { variant: "outline", onClick: goBack, "aria-label": "Go back", children: t('actions.back') })), canNext && (_jsx(Button, { onClick: goNext, "aria-label": "Go next", children: t('actions.next') }))] })] })] }));
}
