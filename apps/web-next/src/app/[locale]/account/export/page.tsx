import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ExportData } from '@/features/account/ExportData';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'account.export' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export default function ExportDataPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ExportData />
    </div>
  );
}