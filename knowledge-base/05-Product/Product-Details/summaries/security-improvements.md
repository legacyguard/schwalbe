# Security Improvements (Summary for Schwalbe)

Purpose
- Strengthen security posture with practical, low-friction practices and clear incident playbooks.

Guidelines to adopt
- Never commit secrets; use Vercel env UI; separate dev/staging/prod; validate variables at build; add pre-commit checks; proper .gitignore. Evidence: /Users/luborfedak/Documents/Github/hollywood/docs/SECURITY_GUIDELINES.md:18-31,33-60,61-87,89-121,140-153
- Rotate API keys regularly and after incidents; follow a safe rotation sequence and verify before revoking old keys. Evidence: SECURITY_GUIDELINES.md:123-139

Emergency procedure (playbook)
- Immediate actions: pause deployments and workflows, back up repo, sign in to providers. Evidence: /Users/luborfedak/Documents/Github/hollywood/docs/SECURITY_EMERGENCY_PROCEDURE.md:20-50,52-58
- Analyze compromised keys and prioritize critical ones (service role, secret keys, webhooks). Evidence: SECURITY_EMERGENCY_PROCEDURE.md:62-76
- Prepare env templates, local .env.local (gitignored), and rotation scripts; rotate per provider; clean git history if needed; add reminders. Evidence: SECURITY_EMERGENCY_PROCEDURE.md:86-140,151-516,520-581,585-621,625-685,687-698,700-732

Improvements implemented (AI & keys)
- Move OpenAI calls to Supabase Edge Functions; remove openai from client; secure envs; add CORS; reduce bundle size; add graceful fallbacks and logging. Evidence: /Users/luborfedak/Documents/Github/hollywood/docs/SECURITY_IMPROVEMENTS.md:8-28,34-60,62-75,92-108,108-119,120-139,156-168

CI/CD and secrets hardening
- Fix secrets scoping in GitHub Actions; correct environment names; stable Vercel deploy args; conditional optional services. Evidence: /Users/luborfedak/Documents/Github/hollywood/docs/SECURITY_FIXES.md:11-27,28-47

Rotation plan
- ACTIVE/NEXT pattern for safe rotation; per-provider steps; monthly reminders and schedules. Evidence: /Users/luborfedak/Documents/Github/hollywood/docs/SECURITY_KEY_ROTATION_PLAN.md:6-16,22-55,56-99,100-106

Schwalbe adaptations
- Centralize logs in Supabase (Edge Functions + DB) and use Resend for critical alerts (no Sentry), per project rules.
- Keep all documentation and code comments in English; ensure emergency scripts and docs follow that rule when adopted.

