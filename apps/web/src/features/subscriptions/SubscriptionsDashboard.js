import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { useTranslation } from 'react-i18next';
import { subscriptionService } from '@schwalbe/shared';
import { supabase } from '@/lib/supabase';
import { billingConfig, daysUntil, isTrialActive } from '@schwalbe/shared';
export function SubscriptionsDashboard() {
    const { t } = useTranslation('subscriptions');
    const [sub, setSub] = React.useState(null);
    const [prefs, setPrefs] = React.useState(null);
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [cancelOpen, setCancelOpen] = React.useState(false);
    const [cancelLoading, setCancelLoading] = React.useState(false);
    const [cancelMode, setCancelMode] = React.useState(billingConfig.cancellationPolicy);
    const load = React.useCallback(async () => {
        setError(null);
        try {
            const [s, p] = await Promise.all([
                subscriptionService.getCurrentSubscription(),
                subscriptionService.getPreferences(),
            ]);
            setSub(s);
            setPrefs(p);
        }
        catch {
            setError(t('errors.loadFailed'));
        }
    }, []);
    React.useEffect(() => { load(); }, [load]);
    const onSavePrefs = async () => {
        if (!prefs)
            return;
        setSaving(true);
        setError(null);
        try {
            await subscriptionService.updatePreferences({
                days_before_primary: prefs.days_before_primary,
                days_before_secondary: prefs.days_before_secondary,
                channels: prefs.channels,
            });
            // DB-side triggers handle schedule refresh; no local side effects required
        }
        catch {
            setError(t('errors.saveFailed'));
        }
        finally {
            setSaving(false);
        }
    };
    const fmtMoney = (cents, currency) => {
        if (cents == null || currency == null)
            return '—';
        try {
            return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(cents / 100);
        }
        catch {
            return `${(cents / 100).toFixed(2)} ${currency}`;
        }
    };
    return (_jsxs("div", { className: "max-w-3xl mx-auto p-6 text-white", children: [_jsx("h1", { className: "text-2xl font-semibold mb-4", children: t('title') }), error ? _jsx("div", { className: "text-red-400 mb-3", children: error }) : null, _jsxs("section", { className: "mb-6 border border-slate-700 rounded p-4", children: [_jsx("h2", { className: "text-xl font-medium mb-2", children: t('currentPlan') }), sub ? (_jsxs("div", { className: "space-y-2 mb-3", children: [isTrialActive(sub.status) && billingConfig.trialEnabled ? (_jsx("div", { className: "rounded border border-amber-400/40 bg-amber-500/10 p-3 text-amber-200", children: t('trialActive', {
                                    remaining: (() => {
                                        const d = daysUntil(sub.expires_at);
                                        return d !== null ? `${d} day${d === 1 ? '' : 's'}` : '';
                                    })()
                                }) })) : null, billingConfig.gracePeriodDays > 0 && sub?.status === 'cancelled' ? (_jsx("div", { className: "rounded border border-sky-400/40 bg-sky-500/10 p-3 text-sky-200", children: t('gracePeriod', {
                                    days: billingConfig.gracePeriodDays,
                                    s: billingConfig.gracePeriodDays === 1 ? '' : 's'
                                }) })) : null] })) : null, sub ? (_jsxs("div", { className: "space-y-1 text-slate-200", children: [_jsxs("div", { children: [t('plan'), ": ", _jsx("span", { className: "font-semibold capitalize", children: sub.plan })] }), _jsxs("div", { children: [t('status'), ": ", _jsx("span", { className: "font-semibold", children: sub.status })] }), _jsxs("div", { children: [t('billingCycle'), ": ", _jsx("span", { className: "font-semibold", children: sub.billing_cycle })] }), _jsxs("div", { children: [t('price'), ": ", _jsx("span", { className: "font-semibold", children: fmtMoney(sub.price_amount_cents, sub.price_currency) })] }), _jsxs("div", { children: [t('autoRenew'), ": ", _jsx("span", { className: "font-semibold", children: sub.auto_renew ? 'Yes' : 'No' })] }), _jsxs("div", { children: [t('renewalDate'), ": ", _jsx("span", { className: "font-semibold", children: sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : '—' })] }), sub.renew_url ? (_jsx("div", { children: _jsx("a", { className: "text-sky-300 underline", href: sub.renew_url, target: "_blank", rel: "noreferrer", children: t('manageSubscription') }) })) : null, _jsxs("div", { className: "mt-3 flex gap-3", children: [_jsx("a", { className: "inline-flex items-center px-3 py-1 rounded bg-sky-600 text-white hover:bg-sky-500", href: "/account/billing", children: t('openBillingPortal') }), sub?.status === 'active' || sub?.status === 'trialing' ? (_jsx("button", { className: "inline-flex items-center px-3 py-1 rounded bg-red-600 text-white hover:bg-red-500", onClick: () => setCancelOpen(true), children: t('cancelSubscription') })) : null] })] })) : (_jsx("div", { children: t('noSubscription') }))] }), cancelOpen ? (_jsx("div", { role: "dialog", "aria-modal": "true", className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4", children: _jsxs("div", { className: "w-full max-w-md rounded bg-slate-900 border border-slate-700 p-4 text-slate-200", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: t('confirmCancellation') }), _jsx("p", { className: "text-sm mb-4", children: billingConfig.cancellationPolicy === 'end_of_period'
                                ? t('cancelEndOfPeriod')
                                : t('cancelImmediate') }), billingConfig.cancellationPolicy === 'end_of_period' ? (_jsxs("label", { className: "flex items-center gap-2 text-sm mb-4", children: [_jsx("input", { type: "checkbox", checked: cancelMode === 'end_of_period', onChange: (e) => setCancelMode(e.target.checked ? 'end_of_period' : 'immediate') }), t('cancelAtEndOfPeriod')] })) : null, _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx("button", { className: "px-3 py-1 rounded bg-slate-700 hover:bg-slate-600", onClick: () => setCancelOpen(false), children: t('keepSubscription') }), _jsx("button", { className: "px-3 py-1 rounded bg-red-600 hover:bg-red-500 disabled:opacity-50", disabled: cancelLoading, onClick: async () => {
                                        setCancelLoading(true);
                                        try {
                                            const { error } = await supabase.functions.invoke('cancel-subscription', {
                                                body: { userId: (await supabase.auth.getUser()).data.user?.id, cancelAtPeriodEnd: cancelMode === 'end_of_period' },
                                            });
                                            if (error)
                                                throw error;
                                            // Reload subscription state
                                            await load();
                                            setCancelOpen(false);
                                        }
                                        catch {
                                            setError(t('errors.cancelFailed'));
                                        }
                                        finally {
                                            setCancelLoading(false);
                                        }
                                    }, children: cancelLoading ? t('cancelling') : t('confirmCancellationButton') })] })] }) })) : null, _jsxs("section", { className: "mb-6 border border-slate-700 rounded p-4", children: [_jsx("h2", { className: "text-xl font-medium mb-2", children: t('renewalReminders') }), prefs ? (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex gap-4 items-center", children: [_jsx("label", { className: "w-48", children: t('primaryReminder') }), _jsx("input", { className: "bg-slate-800 border border-slate-600 rounded px-2 py-1 w-24", type: "number", min: 0, max: 365, value: prefs.days_before_primary, onChange: (e) => setPrefs({ ...prefs, days_before_primary: Number(e.target.value) }) })] }), _jsxs("div", { className: "flex gap-4 items-center", children: [_jsx("label", { className: "w-48", children: t('secondaryReminder') }), _jsx("input", { className: "bg-slate-800 border border-slate-600 rounded px-2 py-1 w-24", type: "number", min: 0, max: 365, value: prefs.days_before_secondary, onChange: (e) => setPrefs({ ...prefs, days_before_secondary: Number(e.target.value) }) })] }), _jsxs("div", { className: "flex gap-4 items-center", children: [_jsx("label", { className: "w-48", children: t('channels') }), _jsx("div", { className: "flex gap-3", children: ['email', 'in_app'].map(ch => (_jsxs("label", { className: "flex items-center gap-2 text-slate-200", children: [_jsx("input", { type: "checkbox", checked: prefs.channels.includes(ch), onChange: (e) => {
                                                        const set = new Set(prefs.channels);
                                                        if (e.target.checked)
                                                            set.add(ch);
                                                        else
                                                            set.delete(ch);
                                                        setPrefs({ ...prefs, channels: Array.from(set) });
                                                    } }), ch] }, ch))) })] }), _jsx("div", { children: _jsx("button", { className: "bg-sky-600 hover:bg-sky-500 px-3 py-1 rounded disabled:opacity-50", disabled: saving, onClick: onSavePrefs, children: t('savePreferences') }) })] })) : (_jsx("div", { children: t('loadingPreferences') }))] })] }));
}
