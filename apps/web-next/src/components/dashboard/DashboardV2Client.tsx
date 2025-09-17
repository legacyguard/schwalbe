"use client";

import { useEffect, useMemo, useState } from "react";
import { generatePlan, type Answer, type Plan } from "@schwalbe/onboarding";

export default function DashboardV2Client() {
  const [plan, setPlan] = useState<Plan | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("onb_state_en") || localStorage.getItem("onb_state_sk") || localStorage.getItem("onb_state_cs");
      let answers: Answer[] = [ { key: 'priority', value: 'safety' }, { key: 'timeAvailable', value: '10m' } ];
      if (raw) {
        const parsed = JSON.parse(raw);
        // naive mapping: if boxItems present -> organization, if trustedName present -> family
        const pri = parsed?.boxItems ? 'organization' : parsed?.trustedName ? 'family' : 'safety';
        answers = [ { key: 'priority', value: pri }, { key: 'timeAvailable', value: '10m' } ];
      }
      setPlan(generatePlan(answers));
    } catch {
      setPlan(generatePlan([ { key: 'priority', value: 'safety' }, { key: 'timeAvailable', value: '10m' } ]));
    }
  }, []);

  if (!plan) return null;

  return (
    <div>
      <section className="rounded-lg border border-slate-700 bg-slate-900/40 p-6 mb-8">
        <h2 className="text-xl font-semibold mb-2">Next best action</h2>
        {plan.nextBestAction ? (
          <div className="rounded border border-slate-600 p-4 bg-slate-900/60">
            <div className="font-medium">{plan.nextBestAction.title}</div>
            <div className="text-slate-400 text-sm">{plan.nextBestAction.description} ({plan.nextBestAction.estimateMinutes} min)</div>
            <a href="#" className="inline-flex mt-3 rounded bg-primary text-white px-4 py-2">Go to action</a>
          </div>
        ) : (
          <div className="text-slate-400">You're all set for now.</div>
        )}
      </section>

      <section className="rounded-lg border border-slate-700 bg-slate-900/40 p-6">
        <h2 className="text-xl font-semibold mb-3">Your milestones</h2>
        <ul className="list-disc pl-5 space-y-2">
          {plan.milestones.map((m) => (
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
