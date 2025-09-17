import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useWizard } from '../state/WizardContext';
import { useTranslation } from 'react-i18next';
export function StepStart() {
    const { state, setState, goNext } = useWizard();
    const { t } = useTranslation('will/wizard');
    return (_jsxs("form", { className: "grid gap-4", onSubmit: (e) => {
            e.preventDefault();
            goNext();
        }, "aria-describedby": "start-hint", children: [_jsx("p", { id: "start-hint", className: "text-slate-300", children: t('hints.startInfo') }), _jsxs("div", { children: [_jsx("label", { htmlFor: "jurisdiction", className: "block mb-1", children: t('labels.jurisdiction') }), _jsxs("select", { id: "jurisdiction", className: "w-full bg-slate-900 border border-slate-600 rounded p-2", value: state.jurisdiction, onChange: (e) => setState((s) => ({ ...s, jurisdiction: e.target.value })), children: [_jsx("option", { value: "CZ", children: "Czech Republic (CZ)" }), _jsx("option", { value: "SK", children: "Slovakia (SK)" })] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "language", className: "block mb-1", children: t('labels.language') }), _jsxs("select", { id: "language", className: "w-full bg-slate-900 border border-slate-600 rounded p-2", value: state.language, onChange: (e) => setState((s) => ({ ...s, language: e.target.value })), children: [_jsx("option", { value: "en", children: "English" }), _jsx("option", { value: "cs", children: "Czech" }), _jsx("option", { value: "sk", children: "Slovak" })] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "form", className: "block mb-1", children: t('labels.form') }), _jsxs("select", { id: "form", className: "w-full bg-slate-900 border border-slate-600 rounded p-2", value: state.form, onChange: (e) => setState((s) => ({ ...s, form: e.target.value })), children: [_jsx("option", { value: "typed", children: "Typed" }), _jsx("option", { value: "holographic", children: "Holographic" })] })] }), _jsx("div", { children: _jsx("button", { type: "submit", className: "bg-sky-600 hover:bg-sky-500 rounded px-4 py-2", "aria-label": "Continue", children: t('actions.next') }) })] }));
}
