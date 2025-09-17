# Release & QA Playbook

This document outlines the three mandatory QA gates that must pass before any production release.

## Overview

All releases must pass three automated QA gates:
1. **Accessibility & i18n Gate** - Ensures UI accessibility and language compliance
2. **Privacy & Security Gate** - Validates data protection and security measures  
3. **Alerts & Observability Gate** - Confirms monitoring and alerting systems work

## QA Gate 1: Accessibility & i18n

### Requirements
- Keyboard-only navigation smoke test passes
- Language menus have ≥4 languages per domain (as per i18n matrix)
- All critical UI flows are keyboard accessible
- Screen reader compatibility verified

### Automated Checks
- `npm run qa:accessibility` - Keyboard navigation tests
- `npm run qa:i18n-matrix` - Language compliance verification
- Lighthouse accessibility score ≥ 90

### Manual Verification
- [ ] Tab navigation works through main flows (login, document upload, billing)
- [ ] All interactive elements have proper focus indicators
- [ ] Modal dialogs trap focus correctly
- [ ] Skip links work for screen readers

## QA Gate 2: Privacy & Security

### Requirements
- RLS policies protect user data across all tables
- Hashed search functionality works without exposing plaintext
- No secrets leaked in logs or client code
- Password/PII handling follows security standards

### Automated Checks
- `npm run qa:security` - RLS smoke tests and security validation
- `npm run qa:secrets-scan` - Secret detection in codebase
- `npm run qa:privacy` - Data handling compliance

### Security Checklist
- [ ] RLS policies enforce user isolation
- [ ] Search indexing uses hashed tokens only
- [ ] Environment variables properly secured
- [ ] API endpoints validate authentication
- [ ] Password hashing uses bcrypt/secure methods

## QA Gate 3: Alerts & Observability

### Requirements
- Critical alerts triggered via `log-error` Edge Function
- Alert deduplication working via `alert_instances` table
- Monitoring covers key system health metrics
- Error logging captures issues without PII

### Automated Checks
- `npm run qa:alerts` - Alert system functionality test
- Database smoke test for `alert_rules` and `alert_instances`
- Log aggregation and metric collection verification

### Monitoring Checklist
- [ ] Critical error alerts trigger within 5 minutes
- [ ] Alert deduplication prevents spam
- [ ] System health metrics collected
- [ ] Error logs exclude sensitive data

## Staging Dry-Run Process

### Pre-Deployment
1. Run all automated QA gates: `npm run qa:all`
2. Verify CI pipeline green status
3. Check staging environment health
4. Review recent changes for risk assessment

### Deployment Steps
1. **Deploy to Staging**
   ```bash
   # Deploy to staging environment
   npm run deploy:staging
   ```

2. **Execute QA Gates**
   ```bash
   # Run comprehensive QA suite
   npm run qa:staging-full
   ```

3. **Manual Smoke Tests**
   - Login/authentication flow
   - Document upload and sharing
   - Billing and subscription management
   - Language switching functionality

4. **Performance Validation**
   - Page load times < 3 seconds
   - API response times < 500ms
   - Database query performance acceptable

### Rollback Procedure

If any QA gate fails:

1. **Immediate Rollback**
   ```bash
   npm run rollback:staging
   ```

2. **Incident Assessment**
   - Identify failing gate and specific issue
   - Determine impact scope (critical/major/minor)
   - Create hotfix branch if needed

3. **Fix and Re-test**
   - Apply fixes to hotfix branch
   - Re-run specific failing QA gate
   - Only proceed if all gates pass

## Production Deployment Checklist

Before production deployment, verify:

- [ ] All three QA gates pass in staging
- [ ] Staging dry-run completed successfully
- [ ] Database migrations tested and verified
- [ ] Rollback plan documented and tested
- [ ] Monitoring alerts configured
- [ ] Team notified of deployment window

## Post-Deployment Verification

After production deployment:

- [ ] Health check endpoints responding
- [ ] Critical user flows working
- [ ] Error rates within normal bounds
- [ ] Alert system active and responsive
- [ ] Performance metrics stable

## Emergency Procedures

### Critical Issue Response
1. **Immediate Actions**
   - Execute production rollback if user impact detected
   - Notify incident response team
   - Begin root cause analysis

2. **Communication**
   - Update status page if user-facing impact
   - Internal team notification via preferred channels
   - Stakeholder communication as needed

### Escalation Path
- **L1**: Development team lead
- **L2**: Technical product manager  
- **L3**: Engineering leadership

---

*Last updated: 2025-01-17*
*Next review: 2025-02-17*