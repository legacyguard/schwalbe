import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { DeleteAccount } from '@/features/account/DeleteAccount';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'account.delete' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export default function DeleteAccountPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <DeleteAccount />
    </div>
  );
}