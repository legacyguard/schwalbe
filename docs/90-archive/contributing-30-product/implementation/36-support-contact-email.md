# Phase 36 – Support, Contact & Email Posture (SPF/DKIM/DMARC)

Purpose
Provide clear support channels (EN/CZ/SK), surface contact across app and emails, and verify email domain posture.

Inputs
- SUPPORT: contact email(s), response window, simple FAQ/Help link
- EMAIL DOMAIN: verify SPF/DKIM/DMARC for Resend sender

Kickoff prompt (pre-filled)
```
SEATBELT: ON
MODE: IMPLEMENT
REPO: schwalbe
FEATURE: Support & contact + email posture (SPF/DKIM/DMARC)
CONTEXT:
- Email sending via supabase/functions/send-email/index.ts (Resend)
- Footer and header available for links
SCOPE:
- Add /support page with EN/CZ/SK content; link in header/footer
- Ensure all transactional emails include support contact + legal links
- Verify SPF/DKIM/DMARC for sender domain (Resend dashboard) and document steps
- Add simple FAQ block or link to knowledge base (stub)
NON_GOALS:
- Full help desk integration
ACCEPTANCE CRITERIA:
- Support page accessible and localized; headers show valid email auth; emails include contact and legal links
DELIVERABLES:
- Support page, footer/header link updates, email template updates, docs
CONSTRAINTS:
- UI English baseline; localize to CZ/SK; no secrets in docs
PERMISSIONS:
- edit code: yes; read-only cmds: yes; commit: ask
BRANCH: main
RISK TOLERANCE: low
CHECKS BEFORE DONE:
- Test email passes SPF/DKIM/DMARC; support page renders in EN/CZ/SK
```
