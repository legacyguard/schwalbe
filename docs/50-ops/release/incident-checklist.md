# Incident Checklist

Immediate
- Acknowledge alert; assign incident commander
- Identify blast radius (auth, billing, storage, global vs region)

Stabilize
- Roll back deployment if app-level regression
- Disable affected feature via env flag if available

Investigate
- Correlate by req_id across logs
- Capture timeline and metrics

Communicate
- Update status page / internal channel every 15–30 minutes

Remediate
- Hotfix or configuration change
- Add/adjust alert thresholds if noisy or blind

Post-incident
- Blameless review: root cause, what went well, what to improve
- Track follow-ups with owners and deadlines
