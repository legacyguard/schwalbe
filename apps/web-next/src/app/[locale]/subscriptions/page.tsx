"use client";

import React from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { createClientComponentClient } from "@/lib/supabase-client";
import {
  subscriptionService,
  billingConfig,
  daysUntil,
  isTrialActive,
  type UserSubscription,
  type SubscriptionPreferences,
} from "@schwalbe/shared";

export default function SubscriptionsPage() {
  const t = useTranslations("subscriptions");
  const locale = useLocale();
  const supabase = React.useMemo(() => createClientComponentClient(), []);

  const [sub, setSub] = React.useState<UserSubscription | null>(null);
  const [prefs, setPrefs] = React.useState<SubscriptionPreferences | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [cancelLoading, setCancelLoading] = React.useState(false);
  const [cancelMode, setCancelMode] = React.useState<"end_of_period" | "immediate">(
    billingConfig.cancellationPolicy
  );

  const load = React.useCallback(async () => {
    setError(null);
    try {
      const [s, p] = await Promise.all([
        subscriptionService.getCurrentSubscription(),
        subscriptionService.getPreferences(),
      ]);
      setSub(s);
      setPrefs(p);
    } catch {
      setError(t("errors.loadFailed"));
    }
  }, [t]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const onSavePrefs = async () => {
    if (!prefs) return;
    setSaving(true);
    setError(null);
    try {
      await subscriptionService.updatePreferences({
        days_before_primary: prefs.days_before_primary,
        days_before_secondary: prefs.days_before_secondary,
        channels: prefs.channels,
      });
    } catch {
      setError(t("errors.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const onConfirmCancel = async () => {
    setCancelLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { error } = await supabase.functions.invoke("cancel-subscription", {
        body: {
          userId: user?.id,
          cancelAtPeriodEnd: cancelMode === "end_of_period",
        },
      });
      if (error) throw error;
      await load();
      setCancelOpen(false);
    } catch {
      setError(t("errors.cancelFailed"));
    } finally {
      setCancelLoading(false);
    }
  };

  const fmtMoney = (cents?: number | null, currency?: string | null) => {
    if (cents == null || currency == null) return "—";
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
      }).format((cents as number) / 100);
    } catch {
      return `${((cents as number) / 100).toFixed(2)} ${currency}`;
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 px-6 py-10">
      <section className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-semibold mb-4">{t("title")}</h1>
        {error ? <div className="text-red-400 mb-3">{error}</div> : null}

        <section className="mb-6 border border-slate-700 rounded p-4">
          <h2 className="text-xl font-medium mb-2">{t("currentPlan")}</h2>
          {sub ? (
            <div className="space-y-2 mb-3">
              {isTrialActive(sub.status) && billingConfig.trialEnabled ? (
                <div className="rounded border border-amber-400/40 bg-amber-500/10 p-3 text-amber-200">
                  {t("trialActive", {
                    remaining: (() => {
                      const d = daysUntil(sub.expires_at);
                      return d !== null ? `${d} day${d === 1 ? "" : "s"}` : "";
                    })(),
                  })}
                </div>
              ) : null}
              {billingConfig.gracePeriodDays > 0 && sub?.status === "cancelled" ? (
                <div className="rounded border border-sky-400/40 bg-sky-500/10 p-3 text-sky-200">
                  {t("gracePeriod", {
                    days: billingConfig.gracePeriodDays,
                    s: billingConfig.gracePeriodDays === 1 ? "" : "s",
                  })}
                </div>
              ) : null}
            </div>
          ) : null}

          {sub ? (
            <div className="space-y-1 text-slate-200">
              <div>
                {t("plan")}: <span className="font-semibold capitalize">{sub.plan}</span>
              </div>
              <div>
                {t("status")}: <span className="font-semibold">{sub.status}</span>
              </div>
              <div>
                {t("billingCycle")}: <span className="font-semibold">{sub.billing_cycle}</span>
              </div>
              <div>
                {t("price")}:
                <span className="font-semibold">{fmtMoney(sub.price_amount_cents, sub.price_currency)}</span>
              </div>
              <div>
                {t("autoRenew")}:
                <span className="font-semibold">{sub.auto_renew ? "Yes" : "No"}</span>
              </div>
              <div>
                {t("renewalDate")}:
                <span className="font-semibold">
                  {sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : "—"}
                </span>
              </div>
              {sub.renew_url ? (
                <div>
                  <a className="text-sky-300 underline" href={sub.renew_url} target="_blank" rel="noreferrer">
                    {t("manageSubscription")}
                  </a>
                </div>
              ) : null}
              <div className="mt-3 flex gap-3">
                <Link
                  className="inline-flex items-center px-3 py-1 rounded bg-sky-600 text-white hover:bg-sky-500"
                  href={`/${locale}/account/billing`}
                >
                  {t("openBillingPortal")}
                </Link>
                {sub?.status === "active" || sub?.status === "trialing" ? (
                  <button
                    className="inline-flex items-center px-3 py-1 rounded bg-red-600 text-white hover:bg-red-500"
                    onClick={() => setCancelOpen(true)}
                  >
                    {t("cancelSubscription")}
                  </button>
                ) : null}
              </div>
            </div>
          ) : (
            <div>{t("noSubscription")}</div>
          )}
        </section>

        {cancelOpen ? (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          >
            <div className="w-full max-w-md rounded bg-slate-900 border border-slate-700 p-4 text-slate-200">
              <h3 className="text-lg font-semibold mb-2">{t("confirmCancellation")}</h3>
              <p className="text-sm mb-4">
                {billingConfig.cancellationPolicy === "end_of_period"
                  ? t("cancelEndOfPeriod")
                  : t("cancelImmediate")}
              </p>
              {billingConfig.cancellationPolicy === "end_of_period" ? (
                <label className="flex items-center gap-2 text-sm mb-4">
                  <input
                    type="checkbox"
                    checked={cancelMode === "end_of_period"}
                    onChange={(e) => setCancelMode(e.target.checked ? "end_of_period" : "immediate")}
                  />
                  {t("cancelAtEndOfPeriod")}
                </label>
              ) : null}
              <div className="flex justify-end gap-2">
                <button className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600" onClick={() => setCancelOpen(false)}>
                  {t("keepSubscription")}
                </button>
                <button
                  className="px-3 py-1 rounded bg-red-600 hover:bg-red-500 disabled:opacity-50"
                  disabled={cancelLoading}
                  onClick={onConfirmCancel}
                >
                  {cancelLoading ? t("cancelling") : t("confirmCancellationButton")}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <section className="mb-6 border border-slate-700 rounded p-4">
          <h2 className="text-xl font-medium mb-2">{t("renewalReminders")}</h2>
          {prefs ? (
            <div className="space-y-3">
              <div className="flex gap-4 items-center">
                <label className="w-48">{t("primaryReminder")}</label>
                <input
                  className="bg-slate-800 border border-slate-600 rounded px-2 py-1 w-24"
                  type="number"
                  min={0}
                  max={365}
                  value={prefs.days_before_primary}
                  onChange={(e) =>
                    setPrefs({ ...prefs, days_before_primary: Number(e.target.value) })
                  }
                />
              </div>
              <div className="flex gap-4 items-center">
                <label className="w-48">{t("secondaryReminder")}</label>
                <input
                  className="bg-slate-800 border border-slate-600 rounded px-2 py-1 w-24"
                  type="number"
                  min={0}
                  max={365}
                  value={prefs.days_before_secondary}
                  onChange={(e) =>
                    setPrefs({ ...prefs, days_before_secondary: Number(e.target.value) })
                  }
                />
              </div>
              <div className="flex gap-4 items-center">
                <label className="w-48">{t("channels")}</label>
                <div className="flex gap-3">
                  {["email", "in_app"].map((ch) => (
                    <label key={ch} className="flex items-center gap-2 text-slate-200">
                      <input
                        type="checkbox"
                        checked={(prefs.channels as string[]).includes(ch)}
                        onChange={(e) => {
                          const set = new Set(prefs.channels as string[]);
                          if (e.target.checked) set.add(ch);
                          else set.delete(ch);
                          setPrefs({ ...prefs, channels: Array.from(set) as any });
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
                >
                  {t("savePreferences")}
                </button>
              </div>
            </div>
          ) : (
            <div>{t("loadingPreferences")}</div>
          )}
        </section>
      </section>
    </main>
  );
}
