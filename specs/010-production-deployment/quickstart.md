# Production Deployment - Testing Scenarios

This document provides comprehensive testing scenarios for validating the Production Deployment system functionality.

## 1) Environment Setup - Configure production environment

### Objective (Scenario 1)

Verify that the production environment is properly configured and accessible.

### Prerequisites (Scenario 1)

- Vercel account with production project
- Supabase production database
- Domain configuration (legacyguard.cz)
- SSL certificates

### Test Steps (Scenario 1)

#### 1.1 Environment Configuration

```bash
# Verify required environment variables are set (without printing values)
for var in VERCEL_TOKEN SUPABASE_URL SUPABASE_SERVICE_ROLE_KEY RESEND_API_KEY; do
  if [ -n "${!var:-}" ]; then
    echo "$var is set"
  else
    echo "$var is missing"
  fi
done

# Check Vercel project configuration
vercel env ls
```

#### 1.2 Domain Configuration

```bash
# Verify domain setup
curl -I https://legacyguard.cz
curl -I https://api.legacyguard.cz

# Check SSL certificate
openssl s_client -connect legacyguard.cz:443 -servername legacyguard.cz
```

#### 1.3 Database Connection

```bash
# Test database connectivity
psql $DATABASE_URL -c "SELECT version();"

# Verify Supabase connection
curl -H "apikey: $SUPABASE_ANON_KEY" $SUPABASE_URL/rest/v1/
```

### Expected Results (Scenario 1)

- [ ] Environment variables properly configured
- [ ] Domain resolves correctly
- [ ] SSL certificate valid
- [ ] Database connection successful
- [ ] Supabase API accessible

### Success Criteria (Scenario 1)

- All environment variables present and valid
- HTTPS working with valid certificate
- Database queries execute successfully
- API endpoints respond correctly

## 2) Deployment Testing - Test deployment process

### Objective (Scenario 2)

Validate the automated deployment pipeline and rollback procedures.

### Prerequisites (Scenario 2)

- GitHub repository with deployment workflows
- Vercel project configured
- Test deployment branch

### Test Steps (Scenario 2)

#### 2.1 Manual Deployment Trigger

```bash
# Trigger deployment via GitHub Actions
gh workflow run deploy.yml -f environment=staging

# Monitor deployment progress
gh run list --workflow=deploy.yml
```

#### 2.2 Automated Deployment

```bash
# Create test commit
git checkout -b test-deployment
echo "Test deployment" > test.txt
git add test.txt
git commit -m "Test deployment"
git push origin test-deployment

# Monitor deployment
vercel deployments
```

#### 2.3 Deployment Verification

```bash
# Check deployment status
vercel ls

# Verify application functionality
curl https://staging.legacyguard.cz
curl https://staging.legacyguard.cz/api/health
```

### Expected Results (Scenario 2)

- [ ] Deployment triggered successfully
- [ ] Build process completes without errors
- [ ] Application deployed to correct environment
- [ ] Health checks pass
- [ ] Application functions correctly

### Success Criteria (Scenario 2)

- Deployment completes within 10 minutes
- No build errors or warnings
- Application loads and functions properly
- Health endpoints return success

## 3) Monitoring Testing - Test monitoring system

Observability Baseline Checklist
- [ ] Structured logs emitted with correlationId; PII redacted (see docs/observability/baseline.md)
- [ ] Critical alert routes via Resend validated in staging
- [ ] No Sentry references; dashboards available for error rates, latency, throughput

### Objective (Scenario 3)

Verify that monitoring and alerting systems are working correctly.

### Prerequisites (Scenario 3)

- Monitoring tools configured
- Alert channels set up
- Test environment with monitoring enabled

### Test Steps (Scenario 3)

#### 3.1 Monitoring Dashboard

```bash
# Access monitoring dashboard
open https://app.supabase.com/project/monitoring

# Verify metrics collection
curl https://api.legacyguard.cz/api/metrics
```

#### 3.2 Alert Testing

```bash
# Simulate error condition
curl -X POST https://api.legacyguard.cz/api/test-error

# Check alert notifications
# Verify email alerts received
# Verify Slack/webhook notifications
```

#### 3.3 Performance Monitoring

```bash
# Run performance test
npm run test:performance

# Check performance metrics
curl https://api.legacyguard.cz/api/performance
```

### Expected Results (Scenario 3)

- [ ] Monitoring dashboard accessible
- [ ] Metrics being collected
- [ ] Alerts triggered correctly
- [ ] Notifications sent to configured channels
- [ ] Performance data recorded

### Success Criteria (Scenario 3)

- All monitoring dashboards load
- Metrics update in real-time
- Alerts fire within 1 minute of trigger
- Notifications delivered successfully

## 4) Security Testing - Test security measures

### Objective (Scenario 4)

Validate security hardening measures and vulnerability scanning.

### Prerequisites (Scenario 4)

- Security scanning tools configured
- CSP headers implemented
- SSL/TLS properly configured

### Test Steps (Scenario 4)

#### 4.1 Security Headers

```bash
# Check security headers
curl -I https://legacyguard.cz

# Verify CSP headers
curl -s https://legacyguard.cz | grep -i "content-security-policy"
```

#### 4.2 SSL/TLS Testing

```bash
# Test SSL configuration
openssl s_client -connect legacyguard.cz:443

# Check certificate validity
echo | openssl s_client -connect legacyguard.cz:443 2>/dev/null | openssl x509 -noout -dates
```

#### 4.3 Vulnerability Scanning

```bash
# Run security scan
npm audit --audit-level high

# Check for vulnerabilities
npm audit --json | jq '.metadata.vulnerabilities'
```

### Expected Results (Scenario 4)

- [ ] Security headers present and correct
- [ ] SSL certificate valid and properly configured
- [ ] No high/critical vulnerabilities found
- [ ] CSP policies enforced

### Success Criteria (Scenario 4)

- All security headers implemented
- SSL Labs rating A or A+
- Zero critical vulnerabilities
- CSP violations blocked

## 5) Performance Testing - Test performance optimization

### Objective (Scenario 5)

Verify performance optimizations and benchmarks are met.

### Prerequisites (Scenario 5)

- Performance monitoring configured
- Lighthouse CI set up
- Load testing tools ready

### Test Steps (Scenario 5)

#### 5.1 Lighthouse Performance

```bash
# Run Lighthouse audit
npx lighthouse https://legacyguard.cz --output json --output-path ./lighthouse-results.json

# Check performance score
cat lighthouse-results.json | jq '.categories.performance.score'
```

#### 5.2 Load Testing

```bash
# Run load test
npx k6 run load-test.js

# Check results
cat load-test-results.json
```

#### 5.3 Core Web Vitals

```bash
# Test Core Web Vitals
curl https://api.legacyguard.cz/api/vitals

# Verify thresholds
curl https://api.legacyguard.cz/api/vitals | jq '.lcp < 2500 and .fid < 100 and .cls < 0.1'
```

### Expected Results (Scenario 5)

- [ ] Lighthouse performance score > 90
- [ ] Load test handles expected traffic
- [ ] Core Web Vitals within thresholds
- [ ] No performance regressions

### Success Criteria (Scenario 5)

- Performance score meets or exceeds 90
- Load test passes without errors
- Core Web Vitals all green
- Response times within SLA

## 6) Rollback Testing - Test rollback procedures

### Objective (Scenario 6)

Verify rollback procedures work correctly in case of deployment issues.

### Prerequisites (Scenario 6)

- Multiple deployment versions available
- Rollback procedures documented
- Test environment for rollback testing

### Test Steps (Scenario 6)

#### 6.1 Failed Deployment Simulation

```bash
# Deploy broken version
git tag broken-deployment
git push origin broken-deployment

# Monitor deployment failure
vercel deployments
```

#### 6.2 Rollback Execution

```bash
# Execute rollback
vercel rollback

# Verify rollback success
curl https://legacyguard.cz/api/health
```

#### 6.3 Rollback Verification

```bash
# Check application functionality
curl https://legacyguard.cz

# Verify data integrity
curl https://api.legacyguard.cz/api/data-integrity
```

### Expected Results (Scenario 6)

- [ ] Failed deployment detected
- [ ] Rollback initiated automatically
- [ ] Previous version restored
- [ ] Application functions correctly
- [ ] Data integrity maintained

### Success Criteria (Scenario 6)

- Rollback completes within 5 minutes
- Application fully functional after rollback
- No data loss during rollback
- Users unaffected by rollback process

## 7) Alert Testing - Test alerting system

### Objective (Scenario 7)

Validate alerting mechanisms and notification channels.

### Prerequisites (Scenario 7)

- Alert system configured
- Notification channels set up
- Test scenarios prepared

### Test Steps (Scenario 7)

#### 7.1 Alert Trigger Testing

```bash
# Trigger test alerts
curl -X POST https://api.legacyguard.cz/api/test-alerts

# Verify alert generation
curl https://api.legacyguard.cz/api/alerts
```

#### 7.2 Notification Testing

```bash
# Test email notifications
curl -X POST https://api.legacyguard.cz/api/test-email

# Test webhook notifications
curl -X POST https://api.legacyguard.cz/api/test-webhook
```

#### 7.3 Alert Resolution

```bash
# Resolve test alerts
curl -X PUT https://api.legacyguard.cz/api/alerts/{id}/resolve

# Verify resolution
curl https://api.legacyguard.cz/api/alerts/{id}
```

### Expected Results (Scenario 7)

- [ ] Alerts triggered correctly
- [ ] Notifications sent to all channels
- [ ] Alert resolution working
- [ ] No false positives

### Success Criteria (Scenario 7)

- All alert types trigger correctly
- Notifications delivered within 1 minute
- Alert resolution updates status
- Alert history maintained

## 8) Load Testing - Test system under load

### Objective (Scenario 8)

Verify system performance and stability under load.

### Prerequisites (Scenario 8)

- Load testing tools configured
- Performance baselines established
- Test environment scaled appropriately

### Test Steps (Scenario 8)

#### 8.1 Baseline Load Test

```bash
# Run baseline load test
npx k6 run baseline-test.js

# Record baseline metrics
curl https://api.legacyguard.cz/api/metrics > baseline.json
```

#### 8.2 Peak Load Test

```bash
# Run peak load test
npx k6 run peak-load-test.js

# Monitor system resources
curl https://api.legacyguard.cz/api/system-resources
```

#### 8.3 Stress Test

```bash
# Run stress test
npx k6 run stress-test.js

# Check error rates
curl https://api.legacyguard.cz/api/error-rates
```

### Expected Results (Scenario 8)

- [ ] Baseline performance established
- [ ] Peak load handled gracefully
- [ ] System remains stable under stress
- [ ] Error rates within acceptable limits

### Success Criteria (Scenario 8)

- Response times degrade gracefully under load
- No system crashes during testing
- Error rate remains below 1%
- Recovery time within 5 minutes

## 9) Security Scanning - Test vulnerability scanning

### Objective (Scenario 9)

Validate automated vulnerability scanning and remediation.

### Prerequisites (Scenario 9)

- Security scanning tools configured
- Vulnerability database updated
- Remediation procedures documented

### Test Steps (Scenario 9)

#### 9.1 Dependency Scanning

```bash
# Run dependency scan
npm audit

# Check for vulnerabilities
npm audit --json | jq '.vulnerabilities'
```

#### 9.2 Code Security Scanning

```bash
# Run SAST scan
npx eslint --ext .ts,.tsx src/ --format json > sast-results.json

# Check results
cat sast-results.json | jq '.length'
```

#### 9.3 Container Scanning

```bash
# Build and scan container
docker build -t test-image .
docker scan test-image
```

### Expected Results (Scenario 9)

- [ ] Dependency scan completes
- [ ] Code security issues identified
- [ ] Container vulnerabilities detected
- [ ] Remediation recommendations provided

### Success Criteria (Scenario 9)

- All scans complete successfully
- Critical vulnerabilities addressed
- Remediation plan created
- Security posture improved

## 10) End-to-End Test - Complete production deployment

### Objective (Scenario 10)

Perform complete end-to-end testing of production deployment process.

### Prerequisites (Scenario 10)

- All systems configured
- Test data prepared
- Monitoring systems active

### Test Steps (Scenario 10)

#### 10.1 Full Deployment Cycle

```bash
# Create feature branch
git checkout -b e2e-test
echo "E2E test feature" > e2e-test.txt
git add e2e-test.txt
git commit -m "E2E test deployment"
git push origin e2e-test

# Create pull request
gh pr create --title "E2E Test Deployment" --body "Testing complete deployment cycle"
```

#### 10.2 Deployment Monitoring

```bash
# Monitor deployment progress
gh pr checks

# Check deployment status
vercel deployments
```

#### 10.3 Post-Deployment Validation

```bash
# Test application functionality
curl https://legacyguard.cz
curl https://api.legacyguard.cz/api/health

# Verify monitoring
curl https://api.legacyguard.cz/api/metrics

# Check security
curl -I https://legacyguard.cz
```

#### 10.4 Rollback Testing

```bash
# Test rollback procedure
vercel rollback

# Verify rollback success
curl https://legacyguard.cz/api/health
```

### Expected Results (Scenario 10)

- [ ] Full deployment cycle completes
- [ ] Application functions correctly
- [ ] Monitoring data collected
- [ ] Security measures active
- [ ] Rollback works properly

### Success Criteria (Scenario 10)

- Complete deployment cycle successful
- All systems operational
- Monitoring and alerting working
- Security measures enforced
- Rollback procedure functional

## Test Automation

### CI/CD Integration

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run E2E tests
        run: npm run test:e2e
```

### Automated Test Scripts

```bash
# test-deployment.sh
#!/bin/bash
echo "Running deployment tests..."

# Environment setup test
npm run test:environment

# Deployment process test
npm run test:deployment

# Monitoring test
npm run test:monitoring

# Security test
npm run test:security

echo "All deployment tests passed!"
```

## Test Data Management

### Test Data Setup

```sql
-- Create test data for deployment testing
INSERT INTO test_users (email, role) VALUES
('test@example.com', 'admin'),
('user@example.com', 'user');

INSERT INTO test_deployments (environment, status, version) VALUES
('staging', 'success', '1.0.0'),
('production', 'success', '1.0.0');
```

### Test Data Cleanup

```sql
-- Clean up test data after testing
DELETE FROM test_users WHERE email LIKE 'test%';
DELETE FROM test_deployments WHERE created_at < NOW() - INTERVAL '1 day';
```

## Performance Benchmarks

### Response Time Benchmarks

- API endpoints: <500ms
- Page loads: <2s
- Database queries: <100ms
- File uploads: <30s

### Throughput Benchmarks

- API requests: 1000 req/min
- Concurrent users: 100
- Database connections: 50
- File storage: 10 GB/day

### Error Rate Benchmarks

- API errors: <1%
- Page errors: <0.1%
- Database errors: <0.01%
- Deployment failures: <5%

## Monitoring and Reporting

### Test Results Dashboard

```bash
# Generate test report
npm run test:report

# View test results
open test-results/index.html
```

### Automated Reporting

```bash
# Send test results to stakeholders
npm run test:notify

# Archive test results
npm run test:archive
```

## Troubleshooting

### Common Test Failures

#### Environment Setup Issues

```bash
# Check required environment variables are set (without printing values)
for var in VERCEL_TOKEN SUPABASE_URL SUPABASE_ANON_KEY CLERK_SECRET_KEY; do
  if [ -n "${!var:-}" ]; then
    echo "$var is set"
  else
    echo "$var is missing"
  fi
done

# Verify network connectivity
curl -I https://api.vercel.com
curl -I https://supabase.co
```

#### Deployment Failures

```bash
# Check deployment logs
vercel logs

# Verify build configuration
cat vercel.json

# Check GitHub Actions logs
gh run view --log
```

#### Monitoring Issues

```bash
# Check monitoring configuration
curl https://api.legacyguard.cz/api/health

# Verify alert configuration
curl https://api.legacyguard.cz/api/alerts/config
```

### Debug Commands

```bash
# Enable debug logging
export DEBUG=*
npm run test:debug

# Run tests with verbose output
npm run test:verbose

# Generate detailed test report
npm run test:report -- --verbose
```

## Success Metrics

### Test Coverage Metrics

- Unit test coverage: >90%
- Integration test coverage: >85%
- E2E test coverage: >80%
- Performance test coverage: >75%

### Quality Metrics

- Test success rate: >95%
- Mean time to detect failures: <5 minutes
- Mean time to resolve issues: <30 minutes
- Deployment success rate: >98%

### Efficiency Metrics

- Test execution time: <30 minutes
- Test setup time: <10 minutes
- Test maintenance effort: <20% of development time
- Automated test percentage: >80%
