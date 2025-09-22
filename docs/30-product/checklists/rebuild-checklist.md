# Rebuild Checklist (Schwalbe)

Foundations
- [ ] Confirm Node version alignment across dev/CI/prod (target 20.19.1+)
- [ ] Verify React 19.1.1 compatibility; prepare downgrade plan to 18.3.1
- [ ] Configure Supabase project (URL/anon key) and Edge Functions
- [ ] Configure Clerk publishable key for auth
- [ ] Set VITE_IS_PRODUCTION appropriately per environment

Security & Encryption
- [ ] Initialize unified encryption service (TweetNaCl XSalsa20-Poly1305)
- [ ] Apply security headers and middleware baseline
- [ ] Rate limiting presets applied to critical routes

i18n & Domains
- [ ] Establish domain-driven namespace structure
- [ ] Apply country language rules (replacements/minimums)
- [ ] Implement environment-controlled domain redirect behavior

API & Data
- [ ] Align Documents/Will/Emergency flows with OpenAPI intent
- [ ] Define DB schema and migrations in Supabase (documents, shares, will, guardians)
- [ ] Implement error logging table and Resend alerting

Tooling & Deployment
- [ ] Type-check, tests, and build validation pipeline
- [ ] Vercel (or equivalent) environment configuration
- [ ] Health checks and rollback plan documented

References
- Use evidence sections in each doc to verify parity with Hollywood.

