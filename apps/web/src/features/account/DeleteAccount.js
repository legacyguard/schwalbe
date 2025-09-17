import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
export function DeleteAccount() {
    const [confirmText, setConfirmText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const onDelete = async () => {
        setError(null);
        setSuccess(null);
        if (confirmText !== 'DELETE') {
            setError('Please type DELETE to confirm this irreversible action.');
            return;
        }
        setLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('delete-account', { body: { confirm: true } });
            if (error)
                throw error;
            const ok = data?.success;
            if (ok) {
                setSuccess('Your account has been deleted. You will be signed out now.');
                // Proactively sign out
                setTimeout(async () => {
                    await supabase.auth.signOut();
                    window.location.href = '/';
                }, 1500);
            }
            else {
                setError(data?.error || 'Failed to delete account');
            }
        }
        catch {
            setError('Failed to delete account');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "max-w-2xl mx-auto bg-slate-800 p-6 rounded", children: [_jsx("h2", { className: "text-xl font-semibold text-red-300 mb-2", children: "Delete account" }), _jsx("p", { className: "text-slate-300 mb-3", children: "This action is irreversible. All your data will be permanently deleted and your account disabled." }), _jsxs("p", { className: "text-slate-400 mb-4", children: ["To confirm, type ", _jsx("span", { className: "font-mono bg-slate-700 px-1 py-0.5 rounded", children: "DELETE" }), " below."] }), error ? _jsx("div", { className: "text-red-400 mb-3", children: error }) : null, success ? _jsx("div", { className: "text-emerald-400 mb-3", children: success }) : null, _jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("input", { "aria-label": "Type DELETE to confirm", value: confirmText, onChange: (e) => setConfirmText(e.target.value), className: "bg-slate-700 border border-slate-600 rounded px-3 py-2 flex-1", placeholder: "Type DELETE to confirm" }), _jsx("button", { onClick: onDelete, disabled: loading || confirmText !== 'DELETE', className: "bg-red-600 hover:bg-red-500 px-4 py-2 rounded disabled:opacity-50", children: loading ? 'Deleting…' : 'Delete my account' })] }), _jsx("p", { className: "text-slate-500 text-sm", children: "We will permanently remove your app data and disable your sign-in. Certain aggregate or anonymized logs may be retained without personal identifiers for security and compliance." })] }));
}
