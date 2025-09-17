
// src/pages/SecurityDeepDivePage.tsx

import { LegalPageLayout } from '@/components/layout/LegalPageLayout';

export const SecurityDeepDivePage = () => {
  return (
    <LegalPageLayout
      title='Security Deep Dive'
      description='A detailed, transparent overview of the security architecture and principles that protect your data in LegacyGuard.'
    >
      <p className='lead'>
        Trust is the cornerstone of LegacyGuard. We believe that true peace of
        mind comes from understanding not just what we do, but how we do it.
        This document provides a transparent, in-depth look at the security
        architecture and principles that safeguard your most sensitive
        information.
      </p>

      <h2 id='encryption'>1. Data Encryption: Our Zero-Knowledge Promise</h2>
      <p>
        Our entire system is built on a Zero-Knowledge architecture. This isn't
        a marketing term; it's a cryptographic guarantee.
      </p>
      <ul>
        <li>
          <strong>Client-Side, End-to-End Encryption:</strong> When you upload a
          document or save a sensitive note, it is encrypted directly on your
          device (your computer or phone) using the robust TweetNaCl.js library
          (a JavaScript port of the renowned NaCl library).
        </li>
        <li>
          <strong>Your Key, Your Data:</strong> The encryption key is derived
          from your password and is known only to you. It is never transmitted
          to our servers. This means the data we store on our servers is
          unreadable ciphertext, and we have no technical means to decrypt it.
        </li>
        <li>
          <strong>Data in Transit:</strong> All communication between your
          device and our servers is protected by industry-standard TLS 1.3
          encryption.
        </li>
      </ul>

      <h2 id='authentication'>2. Authentication & Access Control</h2>
      <p>
        Your account's security is paramount. We partner with industry leader
        Clerk to manage authentication with the highest standards.
      </p>
      <ul>
        <li>
          <strong>Multi-Factor Authentication (MFA):</strong> We strongly
          encourage and support robust MFA options, including authenticator apps
          (TOTP), biometrics (Passkeys, Face ID, Touch ID), and hardware
          security keys (like YubiKey).
        </li>
        <li>
          <strong>Session Management:</strong> Clerk provides enterprise-grade
          protection against session hijacking, token theft, and other common
          attack vectors.
        </li>
        <li>
          <strong>Role-Based Access Control (RBAC):</strong> Within the app,
          access to sensitive information (e.g., by Guardians) is governed by
          granular, explicit permissions that you control.
        </li>
      </ul>

      <h2 id='infrastructure'>3. Infrastructure & Network Security</h2>
      <p>
        We use world-class, GDPR-compliant infrastructure providers to ensure
        your encrypted data is stored safely.
      </p>
      <ul>
        <li>
          <strong>Secure Cloud Storage:</strong> Your encrypted files are stored
          in Supabase Storage, which is built on top of enterprise-grade cloud
          solutions. All data is stored within EU data centers.
        </li>
        <li>
          <strong>Secure Database:</strong> Your metadata is stored in a
          Supabase PostgreSQL database, protected by Row Level Security (RLS).
          RLS ensures that even if a database query were to go wrong, it is
          architecturally impossible for one user to access another user's data.
        </li>
        <li>
          <strong>Serverless Architecture:</strong> We leverage Vercel's
          serverless platform, which reduces the attack surface area compared to
          traditional server management.
        </li>
      </ul>

      <h2 id='audit'>4. Audit & Verification: The Unbreakable Seal</h2>
      <p>
        For ultimate peace of mind, critical actions within your account are
        recorded in a secure audit trail. Unlike a simple log file, our audit
        trail is designed for integrity.
      </p>
      <ul>
        <li>
          <strong>Immutable Logs:</strong> We use database triggers and
          protected schemas to create an audit log that is append-only. Once a
          record of an action (e.g., a document was shared, a Guardian accessed
          information) is written, it cannot be altered or deleted, not even by
          system administrators.
        </li>
        <li>
          <strong>Verifiable History:</strong> This provides a verifiable,
          chronological history of all important events, which is crucial for
          transparency and accountability.
        </li>
      </ul>

      <h2 id='your-role'>5. Your Role in Security</h2>
      <p>
        Security is a shared responsibility. We provide the fortress; you hold
        the keys. We urge you to:
      </p>
      <ul>
        <li>Use a strong, unique password for your LegacyGuard account.</li>
        <li>Enable Multi-Factor Authentication.</li>
        <li>Keep your account recovery codes in a safe, offline location.</li>
      </ul>

      <h2 id='reporting'>6. Reporting a Vulnerability</h2>
      <p>
        We are committed to working with security researchers to keep our
        platform safe. If you believe you have found a security vulnerability in
        our service, please contact us directly at{' '}
        <a href='mailto:security@legacyguard.com'>security@legacyguard.com</a>.
        We appreciate your help in protecting our community.
      </p>
    </LegalPageLayout>
  );
};

export default SecurityDeepDivePage;
