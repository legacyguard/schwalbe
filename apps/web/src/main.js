import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { WillWizardRoutes } from '@/features/will/wizard/routes/WillWizardRoutes';
import { AssetsRoutes } from '@/features/assets/routes/AssetsRoutes';
import { ShareViewer } from '@/features/sharing/viewer/ShareViewer';
import { RemindersRoutes } from '@/features/reminders/routes/RemindersRoutes';
import { DocumentRoutes } from '@/features/documents/routes/DocumentRoutes';
import { SubscriptionsRoutes } from '@/features/subscriptions/SubscriptionsRoutes';
import { AccountRoutes } from '@/features/account/AccountRoutes';
import { LegalRoutes } from '@/features/legal/routes/LegalRoutes';
import SupportEN from '@/pages/support/support.en';
import SupportCS from '@/pages/support/support.cs';
import SupportSK from '@/pages/support/support.sk';
import { SupportIndex } from '@/features/support/SupportIndex';
import '@/lib/i18n';
const rootEl = document.getElementById('root');
if (rootEl) {
    const root = ReactDOM.createRoot(rootEl);
    root.render(_jsx(React.StrictMode, { children: _jsx(BrowserRouter, { children: _jsx(AppShell, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/will/wizard/*", element: _jsx(WillWizardRoutes, {}) }), _jsx(Route, { path: "/assets/*", element: _jsx(AssetsRoutes, {}) }), _jsx(Route, { path: "/reminders/*", element: _jsx(RemindersRoutes, {}) }), _jsx(Route, { path: "/documents/*", element: _jsx(DocumentRoutes, {}) }), _jsx(Route, { path: "/share/:shareId", element: _jsx(ShareViewer, {}) }), _jsx(Route, { path: "/subscriptions/*", element: _jsx(SubscriptionsRoutes, {}) }), _jsx(Route, { path: "/account/*", element: _jsx(AccountRoutes, {}) }), _jsx(Route, { path: "/legal/*", element: _jsx(LegalRoutes, {}) }), _jsx(Route, { path: "/support", element: _jsx(SupportIndex, {}) }), _jsx(Route, { path: "/support.en", element: _jsx(SupportEN, {}) }), _jsx(Route, { path: "/support.cs", element: _jsx(SupportCS, {}) }), _jsx(Route, { path: "/support.sk", element: _jsx(SupportSK, {}) }), _jsx(Route, { path: "/", element: _jsxs("div", { className: "text-white p-6", children: [_jsx("h1", { className: "text-2xl font-semibold mb-4", children: "Schwalbe App" }), _jsx("p", { className: "mb-4", children: "Welcome. Use the links below to explore features." }), _jsxs("div", { className: "flex gap-4", children: [_jsx(Link, { "aria-label": "Start Will Wizard", className: "underline text-sky-300", to: "/will/wizard/start", children: "Start Will Wizard" }), _jsx(Link, { "aria-label": "Open Asset Dashboard", className: "underline text-emerald-300", to: "/assets", children: "Asset Dashboard" }), _jsx(Link, { "aria-label": "Open Documents", className: "underline text-indigo-300", to: "/documents", children: "Documents" }), _jsx(Link, { "aria-label": "Open Subscriptions", className: "underline text-pink-300", to: "/subscriptions", children: "Subscriptions" })] })] }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/assets", replace: true }) })] }) }) }) }));
}
