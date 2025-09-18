import { notFound } from "next/navigation";
import { isDashboardV2Enabled } from "@/config/flags.dashboard";
import { generatePlan, type Answer, type Plan } from "@schwalbe/onboarding";

export default function DashboardV2Page({ params }: { params: { locale: string } }) {
  if (!isDashboardV2Enabled()) notFound();

  // Placeholder: in future, load answers from storage or profile
  const answers: Answer[] = [
    { key: 'priority', value: 'safety' },
    { key: 'timeAvailable', value: '10m' },
  ];
  const plan = generatePlan(answers);

  return (
    <main className="min-h-screen text-slate-100 container mx-auto px-4 pt-28 pb-16">
      <h1 className="text-3xl font-semibold mb-2">Dashboard V2</h1>
      <p className="text-slate-300 mb-8">Personalized starting plan based on your intent.</p>

      <section className="rounded-lg border border-slate-700 bg-slate-900/40 p-6 mb-8">
        <h2 className="text-xl font-semibold mb-2">Next best action</h2>
        {plan.nextBestAction ? (
          <div className="rounded border border-slate-600 p-4 bg-slate-900/60">
            <div className="font-medium">{plan.nextBestAction.title}</div>
            <div className="text-slate-400 text-sm">{plan.nextBestAction.description} ({plan.nextBestAction.estimateMinutes} min)</div>
          </div>
        ) : (
          <div className="text-slate-400">You're all set for now.</div>
        )}
      </section>

      <section className="rounded-lg border border-slate-700 bg-slate-900/40 p-6">
        <h2 className="text-xl font-semibold mb-3">Your milestones</h2>
        <ul className="list-disc pl-5 space-y-2">
          {plan.milestones.map((m: Plan["milestones"][number]) => (
            <li key={m.id}>
              <span className="font-medium">{m.title}</span>
              <span className="text-slate-400"> — {m.description} ({m.estimateMinutes} min)</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
