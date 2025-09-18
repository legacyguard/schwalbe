"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { generatePlan, type Answer, type Plan } from '@schwalbe/onboarding';

export default function AssistantPanel() {
  const search = useSearchParams();
  const locale = useLocale();
  const [intent, setIntent] = useState<string>('');

  useEffect(() => {
    // Prefer query intent if provided
    const q = search?.get('intent');
    if (q && q.length > 0) {
      setIntent(q);
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

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-6" data-testid="assistant-panel">
      <div className="text-slate-300">
        {intent ? (
          <span>Assistant is getting ready to help with: <span className="text-white font-medium">{intent}</span></span>
        ) : (
          <span>Assistant is getting ready…</span>
        )}
      </div>
    </div>
  );
}
