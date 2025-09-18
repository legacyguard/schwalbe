"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { generatePlan, type Answer, type Plan, type Milestone } from '@schwalbe/onboarding';

export default function AssistantPanel() {
  const search = useSearchParams();
  const locale = useLocale();
  const [intent, setIntent] = useState<string>('');
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const t = useTranslations('assistant');

  useEffect(() => {
    // Prefer query intent if provided
    const q = search?.get('intent');
    if (q && q.length > 0) {
      setIntent(q);
      // Seed plan from intent keywords
      try {
        const lowered = q.toLowerCase();
        const pri = lowered.includes('organize') || lowered.includes('document')
          ? 'organization'
          : lowered.includes('family') || lowered.includes('trusted')
            ? 'family'
            : 'safety';
        const plan = generatePlan([
          { key: 'priority', value: pri },
          { key: 'timeAvailable', value: '10m' },
        ] as Answer[]);
        setMilestones(plan.milestones || []);
      } catch { /* ignore */ }
      return;
    }
    // Derive from onboarding state if available
    try {
      const raw = localStorage.getItem('onb_state_en') || localStorage.getItem('onb_state_sk') || localStorage.getItem('onb_state_cs');
      let answers: Answer[] = [ { key: 'priority', value: 'safety' }, { key: 'timeAvailable', value: '10m' } ];
      if (raw) {
        const parsed = JSON.parse(raw);
        const pri = parsed?.boxItems ? 'organization' : parsed?.trustedName ? 'family' : 'safety';
        answers = [ { key: 'priority', value: pri }, { key: 'timeAvailable', value: '10m' } ];
      }
      const plan: Plan = generatePlan(answers);
      if (plan.nextBestAction?.title) setIntent(plan.nextBestAction.title);
      setMilestones(plan.milestones || []);
    } catch {
      // ignore
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Fire an analytics beacon when assistant opens
    try {
      const payload = {
        eventType: 'assistant_open',
        eventData: { intent: intent || undefined, locale },
      };
      if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        (navigator as any).sendBeacon('/api/analytics/events', blob);
      } else if (typeof fetch !== 'undefined') {
        fetch('/api/analytics/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), keepalive: true }).catch(() => {});
      }
    } catch {}
  }, [intent, locale]);

  const targetHref = (() => {
    const key = (intent || '').toLowerCase();
    if (key.includes('organize') || key.includes('document')) return `/${locale}/documents`;
    return `/${locale}/support`;
  })();

  const handleStart = () => {
    try {
      const payload = {
        eventType: 'assistant_start',
        eventData: { intent: intent || undefined, locale, target: targetHref },
      };
      if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        (navigator as any).sendBeacon('/api/analytics/events', blob);
      } else if (typeof fetch !== 'undefined') {
        fetch('/api/analytics/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), keepalive: true }).catch(() => {});
      }
    } catch {}
  };

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-6" data-testid="assistant-panel">
      <div className="text-slate-300 mb-4">
        {intent ? (
          <span>{t('readyWithIntent', { intent })}</span>
        ) : (
          <span>{t('ready')}</span>
        )}
      </div>
      <div>
        <a
          href={targetHref}
          onClick={handleStart}
          className="inline-flex rounded bg-primary text-white px-4 py-2"
          data-testid="assistant-cta-start"
        >
          {t('ctaStart', { default: 'Start now' })}
        </a>
      </div>
      {milestones?.length ? (
        <div className="mt-6">
          <div className="text-slate-200 font-medium mb-2">{t('suggestions', { default: 'Suggested next steps' })}</div>
          <ul className="space-y-2" data-testid="assistant-suggestions">
            {milestones.map((m) => {
              const title = m.title;
              const href = (() => {
                const key = (title || '').toLowerCase();
                if (key.includes('document') || key.includes('vault')) return `/${locale}/documents`;
                return `/${locale}/support`;
              })();
              return (
                <li key={m.id} className="flex items-center justify-between rounded border border-slate-700 p-3">
                  <div>
                    <div className="text-slate-100">{m.title}</div>
                    <div className="text-slate-400 text-sm">{m.description}</div>
                  </div>
                  <a className="text-sky-300 hover:text-sky-200" href={href}>Go</a>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
