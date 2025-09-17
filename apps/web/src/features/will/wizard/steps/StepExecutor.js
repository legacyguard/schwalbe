import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useWizard } from '../state/WizardContext';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
export function StepExecutor() {
    const { state, setState, goNext } = useWizard();
    const { t } = useTranslation('will/wizard');
    return (_jsxs("form", { className: "grid gap-4", onSubmit: (e) => {
            e.preventDefault();
            goNext();
        }, children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "executorName", className: "block mb-1", children: t('labels.executorName') }), _jsx(Input, { id: "executorName", value: state.executorName ?? '', onChange: (e) => setState((s) => ({ ...s, executorName: e.target.value })) })] }), _jsx("div", { children: _jsx("button", { type: "submit", className: "bg-sky-600 hover:bg-sky-500 rounded px-4 py-2", "aria-label": "Continue", children: t('actions.next') }) })] }));
}
