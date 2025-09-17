import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { reminderService } from '@schwalbe/shared';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
export function RemindersDashboard() {
    const [items, setItems] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const navigate = useNavigate();
    const load = React.useCallback(async () => {
        setLoading(true);
        try {
            const data = await reminderService.list();
            setItems(data);
        }
        catch (e) {
            console.error(e);
            toast({ title: 'Failed to load reminders' });
        }
        finally {
            setLoading(false);
        }
    }, []);
    React.useEffect(() => { load(); }, [load]);
    return (_jsxs("div", { className: "max-w-3xl mx-auto p-6 text-white", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "Backup Reminders" }), _jsx(Button, { onClick: () => navigate('/reminders/new'), children: "New reminder" })] }), loading ? (_jsx("p", { children: "Loading\u2026" })) : items.length === 0 ? (_jsx("p", { children: "No reminders yet." })) : (_jsx("ul", { className: "space-y-2", children: items.map(r => (_jsx("li", { className: "border border-slate-700 rounded p-3", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: r.title }), r.description ? (_jsx("div", { className: "text-sm text-slate-300", children: r.description })) : null, _jsxs("div", { className: "text-xs text-slate-400 mt-1", children: ["Next: ", r.next_execution_at || r.scheduled_at, " \u2022 Channels: ", Array.isArray(r.channels) ? r.channels.join(', ') : ''] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: () => navigate(`/reminders/${r.id}/edit`), children: "Edit" }), _jsx(Button, { onClick: async () => { await reminderService.snooze(r.id, 60); toast({ title: 'Snoozed for 60 minutes' }); load(); }, children: "Snooze 1h" })] })] }) }, r.id))) }))] }));
}
