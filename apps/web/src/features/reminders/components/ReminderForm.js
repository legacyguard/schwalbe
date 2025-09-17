import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { reminderService } from '@schwalbe/shared';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
export function ReminderForm() {
    const navigate = useNavigate();
    const [title, setTitle] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [scheduledAt, setScheduledAt] = React.useState(() => new Date().toISOString().slice(0, 16)); // yyyy-MM-ddTHH:mm
    const [channels, setChannels] = React.useState(['email']);
    const [recurrence, setRecurrence] = React.useState(''); // e.g., FREQ=WEEKLY;INTERVAL=1
    const [saving, setSaving] = React.useState(false);
    const onSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const rule = {
                user_id: (await (await import('@schwalbe/shared')).supabase.auth.getUser()).data.user?.id,
                title,
                description,
                scheduled_at: new Date(scheduledAt).toISOString(),
                recurrence_rule: recurrence || null,
                channels: channels,
                status: 'active',
                priority: 'medium',
                next_execution_at: new Date(scheduledAt).toISOString(),
                last_executed_at: null,
                execution_count: 0,
                max_executions: null,
            };
            await reminderService.create(rule);
            toast({ title: 'Reminder created' });
            navigate('/reminders');
        }
        catch (e) {
            console.error(e);
            toast({ title: 'Failed to create reminder' });
        }
        finally {
            setSaving(false);
        }
    };
    return (_jsxs("div", { className: "max-w-xl mx-auto p-6 text-white", children: [_jsx("h1", { className: "text-2xl font-semibold mb-4", children: "New Reminder" }), _jsxs("form", { onSubmit: onSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm mb-1", children: "Title" }), _jsx("input", { value: title, onChange: e => setTitle(e.target.value), className: "w-full rounded bg-slate-800 border border-slate-700 p-2", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm mb-1", children: "Description" }), _jsx("textarea", { value: description, onChange: e => setDescription(e.target.value), className: "w-full rounded bg-slate-800 border border-slate-700 p-2", rows: 3 })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm mb-1", children: "Scheduled at" }), _jsx("input", { type: "datetime-local", value: scheduledAt, onChange: e => setScheduledAt(e.target.value), className: "w-full rounded bg-slate-800 border border-slate-700 p-2", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm mb-1", children: "Channels" }), _jsxs("div", { className: "flex gap-3", children: [_jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", checked: channels.includes('email'), onChange: e => setChannels(c => e.target.checked ? Array.from(new Set([...c, 'email'])) : c.filter(x => x !== 'email')) }), " Email"] }), _jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", checked: channels.includes('in_app'), onChange: e => setChannels(c => e.target.checked ? Array.from(new Set([...c, 'in_app'])) : c.filter(x => x !== 'in_app')) }), " In-app"] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm mb-1", children: "Recurrence (RRULE)" }), _jsx("input", { value: recurrence, placeholder: "e.g., FREQ=WEEKLY;INTERVAL=1", onChange: e => setRecurrence(e.target.value), className: "w-full rounded bg-slate-800 border border-slate-700 p-2" })] }), _jsxs("div", { className: "flex gap-3", children: [_jsx(Button, { type: "submit", disabled: saving, children: saving ? 'Saving…' : 'Create' }), _jsx(Button, { type: "button", onClick: () => navigate('/reminders'), children: "Cancel" })] })] })] }));
}
