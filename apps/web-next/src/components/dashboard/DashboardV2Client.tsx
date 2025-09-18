"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { generatePlan, type Answer, type Plan } from "@schwalbe/onboarding";
import { deriveAnswersFromLocalStorage } from "@/lib/onboarding";
import { isAssistantEnabled } from "@/config/flags";

export default function DashboardV2Client() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const locale = useLocale();
  const t = useTranslations('dashboard');

  useEffect(() => {
    try {
      const answers = deriveAnswersFromLocalStorage();
      setPlan(generatePlan(answers));
    } catch {
      setPlan(generatePlan([ { key: 'priority', value: 'safety' }, { key: 'timeAvailable', value: '10m' } ]));
    }
  }, []);

  if (!plan) return null;

  const intent = plan.nextBestAction?.title || undefined;
  const qs = intent ? `?intent=${encodeURIComponent(intent)}` : '';
  const assistantHref = isAssistantEnabled() ? `/${locale}/assistant${qs}` : undefined;

  const trackCtaClick = () => {
    try {
      const payload = {
        eventType: 'user_action',
        eventData: { action: 'click', category: 'dashboard_v2', label: 'cta_assistant', locale },
      };
      if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        (navigator as any).sendBeacon('/api/analytics/events', blob);
      } else if (typeof fetch !== 'undefined') {
        // fire-and-forget
        fetch('/api/analytics/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), keepalive: true }).catch(() => {});
      }
    } catch {}
  };

  return (
    <div>
      <section className="rounded-lg border border-slate-700 bg-slate-900/40 p-6 mb-8">
        <h2 className="text-xl font-semibold mb-2">{t('next')}</h2>
        {plan.nextBestAction ? (
          <div className="rounded border border-slate-600 p-4 bg-slate-900/60">
            <div className="font-medium">{plan.nextBestAction.title}</div>
            <div className="text-slate-400 text-sm">{plan.nextBestAction.description} ({plan.nextBestAction.estimateMinutes} min)</div>
            {assistantHref ? (
              <a
                href={assistantHref}
                className="inline-flex mt-3 rounded bg-primary text-white px-4 py-2"
                aria-label={t('cta')}
                data-testid="dashboard-v2-cta-assistant"
                onClick={trackCtaClick}
              >
                {t('cta')}
              </a>
            ) : (
              <button
                className="inline-flex mt-3 rounded bg-slate-700 text-white px-4 py-2 cursor-not-allowed opacity-60"
                aria-disabled
                title="Feature coming soon"
              >
                {t('cta')}
              </button>
            )}
          </div>
        ) : (
          <div className="text-slate-400">You're all set for now.</div>
        )}
      </section>

      <section className="rounded-lg border border-slate-700 bg-slate-900/40 p-6">
        <h2 className="text-xl font-semibold mb-3">{t('milestones')}</h2>
        <ul className="list-disc pl-5 space-y-2">
          {plan.milestones.map((m: import("@schwalbe/onboarding").Milestone) => (
            <li key={m.id}>
              <span className="font-medium">{m.title}</span>
              <span className="text-slate-400"> — {m.description} ({m.estimateMinutes} min)</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
