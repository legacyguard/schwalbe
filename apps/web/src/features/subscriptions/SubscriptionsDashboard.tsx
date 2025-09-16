import React from 'react'
import { subscriptionService, type UserSubscription, type SubscriptionPreferences } from '@schwalbe/shared/services/subscription.service'

export function SubscriptionsDashboard() {
  const [sub, setSub] = React.useState<UserSubscription | null>(null)
  const [prefs, setPrefs] = React.useState<SubscriptionPreferences | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    setError(null)
    try {
      const [s, p] = await Promise.all([
        subscriptionService.getCurrentSubscription(),
        subscriptionService.getPreferences(),
      ])
      setSub(s)
      setPrefs(p)
    } catch {
      setError('Failed to load subscription data')
    }
  }, [])

  React.useEffect(() => { load() }, [load])

  const onSavePrefs = async () => {
    if (!prefs) return
    setSaving(true)
    setError(null)
    try {
      const ok = await subscriptionService.updatePreferences({
        days_before_primary: prefs.days_before_primary,
        days_before_secondary: prefs.days_before_secondary,
        channels: prefs.channels as any,
      })
      if (ok) {
        // Trigger DB-side upsert of reminders via an innocuous update to user_subscriptions to refresh schedules
        // Not strictly necessary if prefs trigger exists; we rely on the DB trigger on subscription updates
      }
    } catch {
      setError('Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  const fmtMoney = (cents?: number | null, currency?: string | null) => {
    if (cents == null || currency == null) return '—'
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(cents / 100)
    } catch {
      return `${(cents / 100).toFixed(2)} ${currency}`
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 text-white">
      <h1 className="text-2xl font-semibold mb-4">Subscriptions</h1>

      {error ? <div className="text-red-400 mb-3">{error}</div> : null}

      <section className="mb-6 border border-slate-700 rounded p-4">
        <h2 className="text-xl font-medium mb-2">Current plan</h2>
        {sub ? (
          <div className="space-y-1 text-slate-200">
            <div>Plan: <span className="font-semibold capitalize">{sub.plan}</span></div>
            <div>Status: <span className="font-semibold">{sub.status}</span></div>
            <div>Billing cycle: <span className="font-semibold">{sub.billing_cycle}</span></div>
            <div>Price: <span className="font-semibold">{fmtMoney(sub.price_amount_cents, sub.price_currency)}</span></div>
            <div>Auto renew: <span className="font-semibold">{sub.auto_renew ? 'Yes' : 'No'}</span></div>
            <div>Renewal date: <span className="font-semibold">{sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : '—'}</span></div>
            {sub.renew_url ? (
              <div><a className="text-sky-300 underline" href={sub.renew_url} target="_blank" rel="noreferrer">Manage subscription</a></div>
            ) : null}
            <div className="mt-3">
              <a className="inline-flex items-center px-3 py-1 rounded bg-sky-600 text-white hover:bg-sky-500" href="/account/billing">
                Open Billing Portal
              </a>
            </div>
          </div>
        ) : (
          <div>No subscription found.</div>
        )}
      </section>

      <section className="mb-6 border border-slate-700 rounded p-4">
        <h2 className="text-xl font-medium mb-2">Renewal reminders</h2>
        {prefs ? (
          <div className="space-y-3">
            <div className="flex gap-4 items-center">
              <label className="w-48">Primary reminder (days)</label>
              <input
                className="bg-slate-800 border border-slate-600 rounded px-2 py-1 w-24"
                type="number"
                min={0}
                max={365}
                value={prefs.days_before_primary}
                onChange={(e) => setPrefs({ ...prefs, days_before_primary: Number(e.target.value) })}
              />
            </div>
            <div className="flex gap-4 items-center">
              <label className="w-48">Secondary reminder (days)</label>
              <input
                className="bg-slate-800 border border-slate-600 rounded px-2 py-1 w-24"
                type="number"
                min={0}
                max={365}
                value={prefs.days_before_secondary}
                onChange={(e) => setPrefs({ ...prefs, days_before_secondary: Number(e.target.value) })}
              />
            </div>
            <div className="flex gap-4 items-center">
              <label className="w-48">Channels</label>
              <div className="flex gap-3">
                {['email','in_app'].map(ch => (
                  <label key={ch} className="flex items-center gap-2 text-slate-200">
                    <input
                      type="checkbox"
                      checked={prefs.channels.includes(ch as any)}
                      onChange={(e) => {
                        const set = new Set(prefs.channels)
                        if (e.target.checked) set.add(ch as any)
                        else set.delete(ch as any)
                        setPrefs({ ...prefs, channels: Array.from(set) as any })
                      }}
                    />
                    {ch}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <button
                className="bg-sky-600 hover:bg-sky-500 px-3 py-1 rounded disabled:opacity-50"
                disabled={saving}
                onClick={onSavePrefs}
              >Save preferences</button>
            </div>
          </div>
        ) : (
          <div>Loading preferences…</div>
        )}
      </section>
    </div>
  )
}