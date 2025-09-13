# Contracts: Dead Man Switch

## API Endpoints

- POST /api/guardians/invite
- POST /api/guardians/verify
- POST /api/emergency/activate
- POST /api/emergency/record-activity
- GET  /api/emergency/status

## Events

- emergency.rule.triggered
- emergency.notification.sent
- emergency.access.granted
- emergency.access.revoked

## Cron Jobs

- check-inactivity (6h)
- protocol-inactivity-checker (1h)

## Email Templates

- Guardian Invitation
- Activation Request
- Verification Needed
- Shield Activated
