import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { useWizard } from '../state/WizardContext';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
export function StepWitnesses() {
    const { state, setState, goNext } = useWizard();
    const { t } = useTranslation('will/wizard');
    const [touched, setTouched] = useState(false);
    const errors = useMemo(() => {
        const e = [];
        if (state.form === 'typed' && state.witnesses.length < 2) {
            e.push(t('errors.witnessCount'));
        }
        if (!state.signatures.testatorSigned) {
            e.push(t('errors.mustSign'));
        }
        if (state.form === 'typed' && !state.signatures.witnessesSigned) {
            e.push(t('errors.witnessesMustSign'));
        }
        return e;
    }, [state.form, state.signatures.testatorSigned, state.signatures.witnessesSigned, state.witnesses.length, t]);
    function addRow() {
        setState((s) => ({ ...s, witnesses: [...s.witnesses, { id: crypto.randomUUID(), fullName: '' }] }));
    }
    function removeRow(id) {
        setState((s) => ({ ...s, witnesses: s.witnesses.filter((w) => w.id !== id) }));
    }
    const hasErrors = errors.length > 0;
    return (_jsxs("form", { className: "grid gap-4", onSubmit: (e) => {
            e.preventDefault();
            if (!hasErrors)
                goNext();
        }, children: [_jsx("div", { className: "text-slate-300", children: t('hints.witnessHint') }), _jsxs("fieldset", { children: [_jsx("legend", { className: "mb-2", children: "Signatures" }), _jsxs("label", { className: "flex items-center gap-2 mb-2", children: [_jsx("input", { type: "checkbox", checked: !!state.signatures.testatorSigned, onChange: (e) => setState((s) => ({ ...s, signatures: { ...s.signatures, testatorSigned: e.target.checked } })) }), t('labels.testatorSigned')] }), state.form === 'typed' && (_jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", checked: !!state.signatures.witnessesSigned, onChange: (e) => setState((s) => ({ ...s, signatures: { ...s.signatures, witnessesSigned: e.target.checked } })) }), t('labels.witnessesSigned')] }))] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "font-medium", children: "Witnesses" }), _jsx(Button, { type: "button", onClick: addRow, "aria-label": "Add witness", children: "+ Add" })] }), _jsx("div", { className: "grid gap-3", children: state.witnesses.map((w, idx) => (_jsxs("div", { className: "grid md:grid-cols-2 gap-3 items-end", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: `w-name-${w.id}`, className: "block mb-1", children: t('labels.witnessName') }), _jsx(Input, { id: `w-name-${w.id}`, value: w.fullName, onChange: (e) => setState((s) => ({
                                        ...s,
                                        witnesses: s.witnesses.map((x) => (x.id === w.id ? { ...x, fullName: e.target.value } : x)),
                                    })) })] }), _jsx("div", { className: "md:col-span-2 flex justify-end", children: _jsx(Button, { type: "button", variant: "outline", onClick: () => removeRow(w.id), "aria-label": `Remove witness ${idx + 1}`, children: "Remove" }) })] }, w.id))) }), touched && hasErrors && (_jsx("ul", { className: "text-red-300 text-sm list-disc pl-6", children: errors.map((m) => (_jsx("li", { children: m }, m))) })), _jsx("div", { children: _jsx("button", { type: "submit", className: "bg-sky-600 hover:bg-sky-500 rounded px-4 py-2", onClick: () => setTouched(true), "aria-disabled": hasErrors, disabled: hasErrors, children: t('actions.next') }) })] }));
}
