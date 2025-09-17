import { notFound } from "next/navigation";
import { isHollywoodLandingEnabled } from "../../../config/flags";

export default function HollywoodLandingV2Page({
  params,
}: {
  params: { locale: string };
}) {
  if (!isHollywoodLandingEnabled()) {
    notFound();
  }

  return (
    <main className="min-h-screen text-slate-100">
      <section className="container mx-auto px-4 pt-28 pb-16">
        <h1 className="text-4xl font-semibold mb-4">Hollywood Landing (v2)</h1>
        <p className="text-slate-300 mb-8">
          Temporary placeholder under feature flag. Your existing Topbar renders from the layout.
        </p>
        <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-6">
          <ul className="list-disc pl-5 space-y-2 text-slate-300">
            <li>
              Replace this section with the animated landing from vendor/hollywood when ready.
            </li>
            <li>
              To enable this route, set NEXT_PUBLIC_ENABLE_HOLLYWOOD_LANDING=true and visit
              <code className="ml-1">/{params.locale}/landing-v2</code>.
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
