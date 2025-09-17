import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LegalLayout } from '@/features/legal/LegalLayout';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'legal.terms' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service">
      <div>
        <p>Welcome to LegacyGuard. By using our services, you agree to these Terms of Service. Please read them carefully.</p>
        <h2>Use of Service</h2>
        <p>You agree to use the service lawfully and responsibly. Do not misuse the platform or attempt to interfere with its operation.</p>
        <h2>Accounts</h2>
        <p>You are responsible for maintaining the confidentiality of your account and for all activities under your account.</p>
        <h2>Content</h2>
        <p>You retain ownership of your content. By uploading, you grant us the rights necessary to operate the service (storage, processing, and display to you and authorized recipients).</p>
        <h2>Privacy</h2>
        <p>Our Privacy Policy explains how we handle your data. By using the service, you agree to it.</p>
        <h2>Liability</h2>
        <p>The service is provided "as is" without warranties. To the maximum extent permitted by law, we are not liable for indirect or consequential damages.</p>
        <h2>Changes</h2>
        <p>We may update these Terms. Significant changes will be communicated and require your acceptance.</p>
        <h2>Subscription Cancellation & Refunds</h2>
        <p>Unless otherwise stated, cancellations take effect at the end of the current billing period. Immediate cancellation (with access ending right away) may be available depending on your configuration; Stripe's default proration applies where relevant. Refunds are not provided except where required by law.</p>
      </div>
    </LegalLayout>
  );
}