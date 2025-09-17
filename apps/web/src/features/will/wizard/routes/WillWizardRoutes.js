import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Route, Routes, Navigate } from 'react-router-dom';
import { WizardProvider } from '../state/WizardContext';
import { StepStart } from '../steps/StepStart';
import { StepTestator } from '../steps/StepTestator';
import { StepBeneficiaries } from '../steps/StepBeneficiaries';
import { StepExecutor } from '../steps/StepExecutor';
import { StepWitnesses } from '../steps/StepWitnesses';
import { StepReview } from '../steps/StepReview';
import { WizardLayout } from '../components/WizardLayout';
export function WillWizardRoutes() {
    return (_jsx(WizardProvider, { children: _jsx(WizardLayout, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "start", element: _jsx(StepStart, {}) }), _jsx(Route, { path: "testator", element: _jsx(StepTestator, {}) }), _jsx(Route, { path: "beneficiaries", element: _jsx(StepBeneficiaries, {}) }), _jsx(Route, { path: "executor", element: _jsx(StepExecutor, {}) }), _jsx(Route, { path: "witnesses", element: _jsx(StepWitnesses, {}) }), _jsx(Route, { path: "review", element: _jsx(StepReview, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "start", replace: true }) })] }) }) }));
}
