import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TopBar } from './TopBar';
import { InAppReminderBanner } from '@/features/reminders/components/InAppReminderBanner';
import { CookieBanner } from '@/components/legal/CookieBanner';
import { Footer } from '@/components/layout/Footer';
import { DunningBanner } from '@/features/billing/DunningBanner';
// Lightweight wrapper to host the global TopBar.
// Usage can be adopted incrementally on pages without changing routing.
export function AppShell({ children }) {
    return (_jsxs("div", { className: "min-h-screen bg-slate-900 flex flex-col", children: [_jsx(TopBar, {}), _jsx(DunningBanner, {}), _jsx("main", { className: "pt-20 flex-1", children: children }), _jsx(Footer, {}), _jsx(InAppReminderBanner, {}), _jsx(CookieBanner, {})] }));
}
