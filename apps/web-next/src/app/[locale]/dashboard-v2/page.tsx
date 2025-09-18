import { notFound } from "next/navigation";
import { isDashboardV2Enabled } from "@/config/flags.dashboard";
import dynamic from "next/dynamic";
import { getTranslations } from "next-intl/server";

const DashboardV2Client = dynamic(() => import("@/components/dashboard/DashboardV2Client"), { ssr: false });

export default async function DashboardV2Page({ params }: { params: { locale: string } }) {
  if (!isDashboardV2Enabled()) notFound();
  const t = await getTranslations({ locale: params.locale, namespace: 'dashboard' });
  return (
    <main className="min-h-screen text-slate-100 container mx-auto px-4 pt-28 pb-16">
      <h1 className="text-3xl font-semibold mb-2">{t('title', { default: 'Your plan' })}</h1>
      <p className="text-slate-300 mb-8">{t('subtitle', { default: 'Personalized suggestions based on your intent.' })}</p>
      <DashboardV2Client />
    </main>
  );
}
