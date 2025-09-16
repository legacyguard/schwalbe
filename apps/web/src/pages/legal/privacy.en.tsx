import React from 'react'
import { LegalLayout } from './LegalLayout'

export default function PrivacyEN() {
  return (
    <LegalLayout lang="en" title="Privacy Policy">
      <p>Your privacy matters. We collect only what is necessary to provide the service. We do not sell personal data.</p>
      <h2>Data We Collect</h2>
      <p>Account identifiers, documents you upload, settings, and operational logs (no PII in logs).</p>
      <h2>How We Use Data</h2>
      <p>To provide, maintain, and improve the service, including security and legal compliance.</p>
      <h2>Storage & Security</h2>
      <p>We use industry-standard security and encryption. Access is protected by strict policies.</p>
      <h2>Data Retention & Deletion</h2>
      <p>You may permanently delete your account at any time from Account → Delete. This is irreversible and removes your documents, assets, reminders, shares, and profile. Minimal operational logs may be retained without personal identifiers for security and compliance.</p>
      <h2>Data Export</h2>
      <p>You can download a JSON export of your key entities from Account → Export. For safety, export requests are rate-limited and require you to be signed in.</p>
      <h2>Logging & Privacy Hygiene</h2>
      <p>We avoid storing PII in logs. Secrets and tokens are redacted. Error alerts are rate-limited and exclude sensitive values.</p>
      <h2>Your Rights</h2>
      <p>You can access, update, export, or delete your data where applicable.</p>
      <h2>Contact</h2>
      <p>For privacy inquiries, contact support@legacyguard.app.</p>
      <h2>Billing Policy Reference</h2>
      <p>For information on subscription cancellation, grace periods, trials, and refunds, see the Terms of Service (Subscription Cancellation & Refunds section). We avoid logging payment details and use Stripe defaults for proration.</p>
    </LegalLayout>
  )
}
