import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route } from 'react-router-dom';
import { Billing } from './Billing';
import { BillingDetails } from './BillingDetails';
import { DeleteAccount } from './DeleteAccount';
import { ExportData } from './ExportData';
export function AccountRoutes() {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/billing", element: _jsx(Billing, {}) }), _jsx(Route, { path: "/billing/details", element: _jsx(BillingDetails, {}) }), _jsx(Route, { path: "/delete", element: _jsx(DeleteAccount, {}) }), _jsx(Route, { path: "/export", element: _jsx(ExportData, {}) })] }));
}
