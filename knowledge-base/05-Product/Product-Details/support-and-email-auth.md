# Support & Email Authentication

This document describes the Support page, how support is linked in emails, and the steps to set up and verify SPF, DKIM, and DMARC for the sender domain using Resend.

## Support page

- Route: /support (redirects to a localized page)
- Localized pages:
  - /support.en — Support (English)
  - /support.cs — Podpora (Czech)
  - /support.sk — Podpora (Slovak)
- Header and footer include links to Support.
- FAQ block is included as a stub and can link to a knowledge base in the future.

## Transactional emails: support + legal links

All outgoing transactional emails now automatically include a footer with:
- Support email: support@documentsafe.app
- Support page: https://legacyguard.app/support.en
- Legal links: Terms and Privacy

This is injected by the email function before sending so it applies to every email, regardless of the template.

## SPF/DKIM/DMARC setup (Resend)

Goal: ensure recipients see Authentication-Results showing pass for SPF, DKIM, and DMARC.

1) Add and verify your domain in Resend
- In the Resend dashboard, go to Sending Domains and add the domain used in the From header (e.g., documentsafe.app).
- Resend will provide DNS records to add at your DNS provider:
  - SPF: TXT record at your root (or subdomain) including Resend, e.g. `v=spf1 include:resend.com ~all`
    - If you already have SPF, merge includes (only ONE SPF record total) like: `v=spf1 include:resend.com include:_spf.google.com ~all`
  - DKIM: CNAME records pointing to Resend (usually two or more selectors, e.g., `resend._domainkey` → `dkim.resend.com`-style targets). Use exactly what the dashboard shows.
  - Return-Path/Bounce (optional but recommended): CNAME for bounces if provided by Resend.
  - DMARC: TXT record at _dmarc.yourdomain with a policy, e.g. `v=DMARC1; p=none; rua=mailto:dmarc-reports@yourdomain; pct=100`
    - Start with p=none for monitoring; later consider `p=quarantine` or `p=reject` once you are confident.

2) Wait for DNS to propagate
- Resend dashboard will show verification status. Propagation can take from minutes up to 24–48 hours.

3) Send a test email
- Use your staging environment to send any transactional email (e.g., welcome or trial warning) to a mailbox you control.

4) Verify Authentication-Results headers
- In the recipient mailbox, view original/raw headers and look for Authentication-Results (examples):
  - `spf=pass` with smtp.mailfrom (or envelope-from) matching your domain.
  - `dkim=pass` for a selector (s=) on your domain.
  - `dmarc=pass` with alignment for header From at your domain.

5) Troubleshooting
- SPF: Ensure you have only one SPF TXT record and that it includes `include:resend.com` and ends with `~all` or `-all`.
- DKIM: Make sure the CNAME hostnames and targets exactly match Resend’s instructions (no extra domain suffixes).
- DMARC: Confirm the TXT record is at `_dmarc.yourdomain` and the value starts with `v=DMARC1;`.

Notes
- Do not include or store any secrets in the repository. All sensitive keys remain in environment variables.
- The From address defaults to: `Document Safe <noreply@documentsafe.app>`.
- Support email is `support@documentsafe.app`.