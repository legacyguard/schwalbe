import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Billing } from '@/features/account/Billing';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'account.billing' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export default function BillingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Billing />
    </div>
  );
}