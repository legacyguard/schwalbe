import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { isAssistantEnabled } from '@/config/flags';
import dynamic from 'next/dynamic';

const AssistantPanel = dynamic(() => import('@/components/assistant/AssistantPanel'), { ssr: false });

export default async function AssistantPage({ params }: { params: { locale: string } }) {
  if (!isAssistantEnabled()) notFound();
  const t = await getTranslations({ locale: params.locale, namespace: 'assistant' });
  return (
    <main className="min-h-screen text-slate-100 container mx-auto px-4 pt-28 pb-16">
      <h1 className="text-3xl font-semibold mb-3">{t('title', { default: 'Assistant' })}</h1>
      <p className="text-slate-300 mb-8">{t('subtitle', { default: 'Ask questions and get guidance.' })}</p>
      <AssistantPanel />
    </main>
  );
}