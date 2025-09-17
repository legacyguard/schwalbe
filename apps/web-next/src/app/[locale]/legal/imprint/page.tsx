import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LegalLayout } from '@/features/legal/LegalLayout';

export async function generateMetadata({ params: { locale } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'legal.imprint' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export default function ImprintPage() {
  return (
    <LegalLayout title="Imprint">
      <div>
        <h2>Company Information</h2>
        <p>LegacyGuard s.r.o.</p>
        <p>Registered in the Commercial Register maintained by the Municipal Court in Prague</p>
        <p>File number: C 123456</p>
        <p>ID: 12345678</p>
        <p>VAT ID: CZ12345678</p>

        <h2>Registered Office</h2>
        <p>Prague, Czech Republic</p>
        <p>Contact: info@legacyguard.com</p>

        <h2>Statutory Representatives</h2>
        <p>Executive Director: Ľubor Fedák</p>

        <h2>Supervisory Authority</h2>
        <p>Registered under the Czech Trade Licensing Act</p>
        <p>Trade Register Office in Prague</p>

        <h2>Bank Account Information</h2>
        <p>IBAN: CZ00 0000 0000 0000 0000 0000</p>
        <p>BIC: BANKCZPP</p>

        <h2>Technical Provider</h2>
        <p>Hosted by Vercel Inc.</p>
        <p>440 N Barranca Ave #4133</p>
        <p>Covina, CA 91723</p>
        <p>United States</p>
      </div>
    </LegalLayout>
  );
}