# Production Rollback Procedures
**Schwalbe LegacyGuard Application**

## Overview

This document outlines the procedures for rolling back the Schwalbe LegacyGuard application from production in case of critical issues or failures during or after deployment.

## Rollback Triggers

### Immediate Rollback Required
1. **Application Completely Down**
   - Main application inaccessible
   - 500 errors on all endpoints
   - Database connection failure

2. **Critical Security Vulnerability**
   - Data breach detected
   - Authentication bypass
   - Unauthorized data access

3. **Data Integrity Issues**
   - Data corruption detected
   - Incorrect user data displayed
   - Document access violations

4. **Critical Functionality Failure**
   - User registration broken
   - Document upload failure
   - Payment processing issues (future)

### Rollback Consideration Required
1. **Performance Degradation > 50%**
   - Page load times > 5 seconds
   - API response times > 2 seconds
   - High error rates (> 5%)

2. **Feature Regression**
   - Core features not working
   - Sofia AI responses incorrect
   - OCR processing failures

3. **High User Impact**
   - Multiple user complaints
   - Support ticket surge
   - Negative user feedback

## Rollback Decision Matrix

| Severity | Impact | User Count | Decision | Response Time |
|----------|--------|------------|----------|---------------|
| Critical | High | Any | Immediate Rollback | < 15 minutes |
| High | High | > 50% | Immediate Rollback | < 30 minutes |
| High | Medium | > 25% | Consider Rollback | < 1 hour |
| Medium | High | > 75% | Consider Rollback | < 2 hours |
| Medium | Medium | > 50% | Monitor & Decide | < 4 hours |

## Rollback Procedures

### 1. Vercel Deployment Rollback

#### Quick Rollback (Recommended)
```bash
# 1. Access Vercel Dashboard or CLI
vercel --version

# 2. List recent deployments
vercel ls schwalbe-production

# 3. Rollback to previous stable deployment
vercel rollback schwalbe-production [deployment-url]

# 4. Verify rollback
curl -I https://app.schwalbe.sk/api/health
```

#### Alternative: Redeploy Previous Version
```bash
# 1. Checkout previous stable commit
git checkout [previous-stable-commit-hash]

# 2. Deploy to production
vercel --prod

# 3. Verify deployment
vercel ls schwalbe-production
```

### 2. Database Rollback

#### Schema Rollback
```sql
-- 1. Connect to production database
psql postgresql://[connection-string]

-- 2. Check current schema version
SELECT * FROM schema_migrations ORDER BY applied_at DESC LIMIT 5;

-- 3. Identify rollback target
-- If rolling back schema changes, execute rollback script

-- 4. Run rollback migration
\i /path/to/rollback-migration.sql

-- 5. Verify schema state
SELECT version FROM schema_migrations WHERE version = '[target-version]';
```

#### Data Restoration (if needed)
```sql
-- 1. Check available backups
SELECT * FROM pg_stat_archiver;

-- 2. Restore from point-in-time backup
-- (This requires coordination with Supabase support)

-- 3. Verify data integrity
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM documents;
```

### 3. Environment Variables Rollback

#### Revert Environment Variables
```bash
# 1. Access Vercel environment variables
vercel env ls

# 2. Update variables to previous values
vercel env add [VARIABLE_NAME] [previous-value] production

# 3. Redeploy to apply changes
vercel --prod

# 4. Verify environment
curl https://app.schwalbe.sk/api/config/check
```

### 4. DNS and Domain Rollback

#### Revert DNS Changes
```bash
# 1. Access DNS provider (Cloudflare)
# 2. Revert A/CNAME records to previous values
# 3. Clear DNS cache
dig +noall +answer app.schwalbe.sk

# 4. Verify domain resolution
nslookup app.schwalbe.sk
```

### 5. CDN and Cache Rollback

#### Clear CDN Cache
```bash
# 1. Purge Vercel Edge Cache
curl -X POST "https://api.vercel.com/v1/purge" \
  -H "Authorization: Bearer [vercel-token]" \
  -H "Content-Type: application/json" \
  -d '{"domains": ["app.schwalbe.sk"]}'

# 2. Clear browser caches (inform users)
# 3. Verify cache purge
curl -I https://app.schwalbe.sk/
```

## Step-by-Step Rollback Execution

### Phase 1: Immediate Response (0-15 minutes)

1. **Incident Detection and Alert**
   ```bash
   # Verify the issue
   curl -I https://app.schwalbe.sk/api/health
   curl -I https://app.schwalbe.sk/

   # Check monitoring dashboards
   # - Vercel Analytics
   # - Sentry error tracking
   # - UptimeRobot status
   ```

2. **Assemble Incident Response Team**
   - Notify on-call engineer
   - Alert development team lead
   - Inform product manager
   - Activate incident channel (#incident-response)

3. **Execute Quick Assessment**
   ```bash
   # Check recent deployments
   vercel ls schwalbe-production --limit 5

   # Review recent commits
   git log --oneline -10

   # Check error logs
   vercel logs schwalbe-production --limit 100
   ```

### Phase 2: Rollback Execution (15-30 minutes)

1. **Initiate Vercel Rollback**
   ```bash
   # Get previous stable deployment
   PREVIOUS_DEPLOYMENT=$(vercel ls schwalbe-production --limit 5 | grep SUCCESS | head -2 | tail -1 | awk '{print $1}')

   # Execute rollback
   vercel rollback schwalbe-production $PREVIOUS_DEPLOYMENT

   # Confirm rollback
   echo "Rolled back to: $PREVIOUS_DEPLOYMENT"
   ```

2. **Verify Application Status**
   ```bash
   # Wait for deployment to complete
   sleep 60

   # Test critical endpoints
   curl -f https://app.schwalbe.sk/api/health
   curl -f https://app.schwalbe.sk/api/auth/session
   curl -f https://app.schwalbe.sk/

   # Check error rates
   # Monitor Sentry dashboard for new errors
   ```

3. **Database Consistency Check**
   ```sql
   -- Verify database connectivity
   SELECT 1;

   -- Check for any schema issues
   SELECT schemaname, tablename
   FROM pg_tables
   WHERE schemaname = 'public';

   -- Verify critical data
   SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '1 hour';
   ```

### Phase 3: Validation and Monitoring (30-60 minutes)

1. **Functional Testing**
   ```bash
   # Test user registration
   curl -X POST https://app.schwalbe.sk/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "password": "Test123!"}'

   # Test document upload
   # Manual testing required through UI

   # Test Sofia AI
   curl -X POST https://app.schwalbe.sk/api/sofia/chat \
     -H "Authorization: Bearer [test-token]" \
     -d '{"message": "Hello Sofia"}'
   ```

2. **Performance Verification**
   ```bash
   # Check response times
   time curl -s https://app.schwalbe.sk/ > /dev/null
   time curl -s https://app.schwalbe.sk/api/health > /dev/null

   # Monitor server metrics
   # - CPU usage
   # - Memory usage
   # - Response times
   ```

3. **User Impact Assessment**
   - Check support channels for user reports
   - Monitor user activity levels
   - Review error rates and patterns
   - Assess data integrity

### Phase 4: Communication and Documentation (Ongoing)

1. **Internal Communication**
   ```markdown
   # Incident Response Update
   **Status**: Rollback Completed
   **Time**: [timestamp]
   **Action**: Rolled back to deployment [deployment-id]
   **Impact**: [describe impact]
   **Next Steps**: [investigation plan]
   ```

2. **User Communication** (if needed)
   ```markdown
   # Service Status Update
   We experienced a brief service interruption between [time] and [time].
   The issue has been resolved and all services are now fully operational.
   We apologize for any inconvenience.
   ```

3. **Incident Documentation**
   - Record timeline of events
   - Document root cause (when identified)
   - Note lessons learned
   - Update runbooks if needed

## Rollback Verification Checklist

### Application Health ✅
- [ ] Main website loads (https://app.schwalbe.sk)
- [ ] Health endpoint responds (200 OK)
- [ ] User authentication works
- [ ] Document upload functional
- [ ] Sofia AI responds correctly
- [ ] Database queries executing
- [ ] Email notifications working

### Performance Metrics ✅
- [ ] Page load time < 3 seconds
- [ ] API response time < 1 second
- [ ] Error rate < 1%
- [ ] No 5xx errors
- [ ] Database response time normal

### User Experience ✅
- [ ] Registration flow works
- [ ] Login process functional
- [ ] Dashboard loads correctly
- [ ] Document processing works
- [ ] No user data corruption
- [ ] All features accessible

## Post-Rollback Procedures

### Immediate Actions (0-4 hours)
1. **Root Cause Analysis**
   - Review logs and error messages
   - Identify what caused the failure
   - Document findings
   - Create bug report

2. **Fix Development**
   - Create hotfix branch
   - Implement necessary fixes
   - Conduct thorough testing
   - Prepare for re-deployment

3. **Monitoring Enhancement**
   - Review monitoring coverage
   - Add additional alerts if needed
   - Update health checks
   - Improve detection time

### Follow-up Actions (24-48 hours)
1. **Post-Incident Review**
   - Conduct team retrospective
   - Document lessons learned
   - Update procedures
   - Identify process improvements

2. **Prevention Measures**
   - Enhance testing procedures
   - Improve deployment process
   - Add additional safeguards
   - Update monitoring

3. **Communication**
   - Inform stakeholders of resolution
   - Share lessons learned
   - Update documentation
   - Plan communication for next deployment

## Emergency Contacts

### Technical Team
- **On-Call Engineer**: [phone] / [email]
- **Development Lead**: [phone] / [email]
- **DevOps Engineer**: [phone] / [email]
- **Database Administrator**: [phone] / [email]

### Business Team
- **Product Manager**: [phone] / [email]
- **Customer Support Lead**: [phone] / [email]
- **Business Stakeholder**: [phone] / [email]

### External Services
- **Vercel Support**: support@vercel.com
- **Supabase Support**: support@supabase.io
- **Domain Provider**: [contact info]

## Rollback Testing

### Quarterly Rollback Drills
1. **Scheduled Practice Rollbacks**
   - Test rollback procedures in staging
   - Measure response times
   - Identify improvement areas
   - Update documentation

2. **Team Training**
   - Train team members on procedures
   - Practice incident response
   - Update contact information
   - Review and improve processes

---

**Document Version**: 1.0
**Last Updated**: September 22, 2025
**Next Review**: December 22, 2025
**Owner**: DevOps Team