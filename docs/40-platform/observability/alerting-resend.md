# Alerting (Resend)

Scope
- Use Resend email for critical alerts. No Sentry.

Triggers (examples)
- auth.failed_logins_spike (threshold within 5 min)
- rls.denied_requests_spike
- billing.webhook_error_rate_high
- stripe.charge_failed
- storage.upload_error_rate_high

Email content fields
- service: auth | billing | storage | edge
- severity: critical
- metric: name + window + value
- env: production | staging
- link: “Runbook URL” + relevant dashboard

Implementation notes
- Edge Functions or API routes evaluate counters and thresholds
- On breach, send email via Resend (RESEND_API_KEY)
- Batch alerts to avoid floods (1 alert per metric per window)

Pseudocode (Node)
```ts
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY!)
await resend.emails.send({
  from: 'alerts@your-domain.tld',
  to: ['oncall@your-domain.tld'],
  subject: `[CRITICAL][auth] failed_logins_spike`,
  html: '<p>See runbook: https://...</p>'
})
```
