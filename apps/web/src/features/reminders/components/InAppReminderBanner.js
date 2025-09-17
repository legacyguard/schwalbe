import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { reminderService } from '@schwalbe/shared';
import { X } from 'lucide-react';
export function InAppReminderBanner() {
    const [items, setItems] = React.useState([]);
    const load = React.useCallback(async () => {
        try {
            const data = await reminderService.fetchPendingInApp();
            setItems(data);
        }
        catch {
            // no-op
        }
    }, []);
    React.useEffect(() => { load(); }, [load]);
    if (items.length === 0)
        return null;
    return (_jsx("div", { className: "fixed bottom-4 right-4 z-50 space-y-2", children: items.map(i => {
            const title = i?.provider_response?.title || 'Reminder';
            const body = i?.provider_response?.body || 'You have a scheduled reminder. Open reminders to review.';
            return (_jsx("div", { className: "bg-slate-800 text-white border border-slate-700 rounded p-3 w-80 shadow-lg", children: _jsxs("div", { className: "flex items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsx("div", { className: "font-semibold", children: title }), _jsx("div", { className: "text-sm text-slate-300", children: body })] }), _jsx("button", { className: "text-slate-300 hover:text-white", "aria-label": "Dismiss", onClick: async () => {
                                await reminderService.markInAppDelivered(i.id);
                                setItems(prev => prev.filter(x => x.id !== i.id));
                            }, children: _jsx(X, { className: "w-4 h-4" }) })] }) }, i.id));
        }) }));
}
