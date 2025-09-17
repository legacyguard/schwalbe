import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LegalLayout } from '@/features/legal/LegalLayout';

export async function generateMetadata({ params: { locale } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'legal.cookies' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export default function CookiesPage() {
  return (
    <LegalLayout title="Cookies Policy">
      <div>
        <p>This policy explains how we use cookies and similar technologies to improve your experience on LegacyGuard.</p>

        <h2>What Are Cookies</h2>
        <p>Cookies are small text files placed on your device to store data that can be recalled by a web server in the domain that placed the cookie.</p>

        <h2>How We Use Cookies</h2>
        <p>We use cookies for:</p>
        <ul>
          <li>Essential functionality (authentication, preferences)</li>
          <li>Performance and analytics</li>
          <li>Security (fraud prevention, CSRF protection)</li>
        </ul>

        <h2>Cookie Types</h2>
        <h3>Essential Cookies</h3>
        <p>Required for basic functionality. Cannot be disabled.</p>
        
        <h3>Performance Cookies</h3>
        <p>Help us understand how visitors interact with our website. Can be disabled.</p>
        
        <h3>Security Cookies</h3>
        <p>Protect your data and account.</p>

        <h2>Cookie Control</h2>
        <p>You can control cookies through:</p>
        <ul>
          <li>Browser settings</li>
          <li>Our cookie preferences center</li>
          <li>Third-party opt-out tools</li>
        </ul>

        <h2>Updates</h2>
        <p>We may update this policy. Changes will be posted here.</p>

        <h2>Questions</h2>
        <p>For questions about our cookie usage, contact privacy@legacyguard.com</p>
      </div>
    </LegalLayout>
  );
}