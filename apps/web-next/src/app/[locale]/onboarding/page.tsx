import { notFound } from "next/navigation";
import { isOnboardingEnabled } from "@/config/flags";
import { generatePlan, type Answer, type Plan } from "@schwalbe/onboarding";
import { useTranslations } from "next-intl";

export default function OnboardingPage({ params }: { params: { locale: string } }) {
  if (!isOnboardingEnabled()) {
    notFound();
  }
  const t = useTranslations("onboarding");
  const answers: Answer[] = [
    { key: "priority", value: "safety" },
    { key: "timeAvailable", value: "10m" },
  ];
  const plan = generatePlan(answers);

  return (
    <main className="min-h-screen text-slate-100 container mx-auto px-4 pt-28 pb-16">
      <h1 className="text-3xl font-semibold mb-4">{t("title")}</h1>
      <p className="text-slate-300 mb-8">{t("subtitle")}</p>

      <section className="rounded-lg border border-slate-700 bg-slate-900/40 p-6 mb-8">
        <h2 className="text-xl font-semibold mb-2">{t("plan.heading")}</h2>
        <p className="text-slate-300 mb-4">{t("plan.description")}</p>
        <ul className="list-disc pl-5 space-y-2">
          {plan.milestones.map((m: Plan["milestones"][number]) => (
            <li key={m.id}>
              <span className="font-medium">{m.title}</span>
              <span className="text-slate-400"> — {m.description} ({m.estimateMinutes} min)</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex gap-3">
        <button className="inline-flex items-center justify-center rounded-lg bg-slate-700/70 hover:bg-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 text-white px-6 py-3 text-base font-semibold border border-slate-600">
          {t("cta.start")}
        </button>
        <button className="inline-flex items-center justify-center rounded-lg bg-slate-800/40 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 text-slate-100 px-6 py-3 text-base font-medium border border-slate-700">
          {t("cta.later")}
        </button>
      </section>
    </main>
  );
}
