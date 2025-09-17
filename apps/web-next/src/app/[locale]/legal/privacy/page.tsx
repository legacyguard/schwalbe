import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LegalLayout } from '@/features/legal/LegalLayout';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'legal.privacy' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy">
      <div>
        <p>At LegacyGuard, we take your privacy seriously. This policy explains how we collect, use, and protect your data.</p>
        
        <h2>Data Collection</h2>
        <p>We collect only the data necessary to provide our services:</p>
        <ul>
          <li>Account information (email, name)</li>
          <li>Content you choose to store</li>
          <li>Usage data for service improvement</li>
        </ul>

        <h2>Data Storage</h2>
        <p>Your data is encrypted in transit and at rest. We use industry-standard security measures to protect your information. Our data centers are located in the EU.</p>

        <h2>Data Usage</h2>
        <p>Your data is used only for:</p>
        <ul>
          <li>Providing and improving our services</li>
          <li>Communicating with you about your account</li>
          <li>Legal compliance</li>
        </ul>

        <h2>Data Sharing</h2>
        <p>We never sell your data. We share data only:</p>
        <ul>
          <li>With service providers necessary for operations</li>
          <li>When required by law</li>
          <li>With your explicit consent</li>
        </ul>

        <h2>Your Rights</h2>
        <p>Under GDPR and other privacy laws, you have rights to:</p>
        <ul>
          <li>Access your data</li>
          <li>Correct inaccurate data</li>
          <li>Delete your data</li>
          <li>Object to data processing</li>
          <li>Export your data</li>
        </ul>

        <h2>Contact</h2>
        <p>For privacy questions or to exercise your rights, contact us at privacy@legacyguard.com</p>

        <h2>Updates</h2>
        <p>We may update this policy. Changes will be communicated and may require your acknowledgment.</p>
      </div>
    </LegalLayout>
  );
}