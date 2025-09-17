import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { RemindersDashboard } from '@/features/reminders/RemindersDashboard';

export async function generateMetadata({ params: { locale } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'reminders' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export default function RemindersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <RemindersDashboard />
    </div>
  );
}