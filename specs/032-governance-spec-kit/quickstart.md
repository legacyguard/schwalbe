# Governance Spec Kit - Quick Start Guide

## Overview

This guide provides testing scenarios and quick start procedures for the Governance Spec Kit system. It includes step-by-step instructions for setting up, testing, and validating the governance system components.

## Prerequisites

### System Requirements

- Node.js 20.19.1+
- npm 10.8+
- Git 2.30+
- Linear account with API access
- GitHub repository with admin access

### Environment Setup

```bash
# Clone the repository
git clone https://github.com/your-org/schwalbe.git
cd schwalbe

# Install dependencies
npm ci

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration
```

## 1) Spec Kit Setup Testing

### Scenario: Configure Spec Kit System

**Objective:** Verify spec-kit governance system configuration and basic functionality.

**Steps:**

1. Navigate to specs directory
2. Create a new spec using the template
3. Configure governance rules
4. Validate spec structure

**Expected Results:**

- Spec created successfully
- Governance rules applied
- Validation passes without errors

**Test Commands:**

```bash
# Create new spec
./scripts/create-spec.sh 033-test-spec

# Validate spec structure
npm run validate-specs

# Check governance compliance
npm run governance-check
```

**Success Criteria:**

- [ ] Spec file created in correct location
- [ ] Governance rules validated
- [ ] No linting errors
- [ ] CI checks pass

## 2) Linear Integration Testing

### Scenario: Test Linear Project Synchronization

**Objective:** Verify Linear integration for project management and issue tracking.

**Steps:**

1. Configure Linear API credentials
2. Create test project in Linear
3. Sync project data
4. Verify issue tracking

**Expected Results:**

- Linear connection established
- Project data synchronized
- Issues tracked correctly

**Test Commands:**

```bash
# Test Linear connection
npm run test:linear-connection

# Sync test project
npm run sync:linear-project --project-id=TEST_001

# Validate issue tracking
npm run validate:linear-issues
```

**Success Criteria:**

- [ ] Linear API connection successful
- [ ] Project synchronization works
- [ ] Issue status updates correctly
- [ ] No synchronization errors

## 3) PR Template Testing

### Scenario: Validate PR Template System

**Objective:** Test PR template creation and validation functionality.

**Steps:**

1. Create PR template configuration
2. Generate PR from template
3. Validate PR content
4. Test template customization

**Expected Results:**

- PR template applied correctly
- Required fields populated
- Validation rules enforced

**Test Commands:**

```bash
# Create PR template
npm run create:pr-template --type=feature

# Validate template
npm run validate:pr-template

# Test PR generation
npm run test:pr-generation
```

**Success Criteria:**

- [ ] PR template created successfully
- [ ] All required fields present
- [ ] Validation rules working
- [ ] Template customization functional

## 4) Documentation Standards Testing

### Scenario: Test Documentation Validation

**Objective:** Verify documentation standards and validation system.

**Steps:**

1. Create documentation template
2. Generate sample documentation
3. Run validation checks
4. Test compliance reporting

**Expected Results:**

- Documentation standards applied
- Validation checks pass
- Compliance report generated

**Test Commands:**

```bash
# Create documentation template
npm run create:doc-template --type=api

# Validate documentation
npm run validate:documentation

# Generate compliance report
npm run report:doc-compliance
```

**Success Criteria:**

- [ ] Documentation template created
- [ ] Validation checks pass
- [ ] Compliance report accurate
- [ ] Standards properly enforced

## 5) Governance Compliance Testing

### Scenario: End-to-End Governance Validation

**Objective:** Test complete governance workflow from spec to deployment.

**Steps:**

1. Create spec with governance requirements
2. Generate Linear issue
3. Create PR with proper template
4. Validate governance compliance
5. Monitor governance metrics

**Expected Results:**

- Complete workflow functional
- Governance rules enforced
- Compliance metrics collected

**Test Commands:**

```bash
# Run end-to-end test
npm run test:e2e-governance

# Check compliance metrics
npm run metrics:governance

# Validate workflow completion
npm run validate:workflow-status
```

## 6) Security Verification Checklist

Use this checklist after initial setup and before enabling enforcement in CI.

### Identity & Access

- [ ] Supabase Auth configured; user identity available to governance services
- [ ] Least-privilege roles defined for governance operations
- [ ] External integrations (GitHub/Linear) use OAuth with securely stored tokens

### RLS Policies

- [ ] Owner-first policies enabled on all governance tables
- [ ] Positive tests: owner can read/update own records
- [ ] Negative tests: non-owner cannot read/update/delete others' records
- [ ] Admin role paths tested via dedicated role with audit logging

### Token & Secret Handling

- [ ] No raw tokens, API keys, or secrets logged anywhere
- [ ] Tokens stored hashed or in secure provider storage; rotation documented
- [ ] Expiry and single-use validation for ephemeral tokens (where applicable)

### Observability Baseline

- [ ] Structured logs emitted with correlation IDs
- [ ] Critical governance failures trigger Resend email alerts
- [ ] Supabase Edge Functions logs used for monitoring; no Sentry
- [ ] Dashboards show error rates, latency, and throughput for governance flows

**Success Criteria:**

- [ ] End-to-end workflow completes
- [ ] All governance checks pass
- [ ] Metrics collected correctly
- [ ] No compliance violations

## 6) Quality Gates Testing

### Scenario: Test Automated Quality Gates

**Objective:** Verify quality gate implementation and automation.

**Steps:**

1. Configure quality gate rules
2. Trigger automated checks
3. Review quality gate results
4. Test gate failure scenarios

**Expected Results:**

- Quality gates trigger correctly
- Automated checks run
- Results reported accurately

**Test Commands:**

```bash
# Configure quality gates
npm run config:quality-gates

# Run quality checks
npm run test:quality-gates

# Review gate results
npm run report:quality-gates
```

**Success Criteria:**

- [ ] Quality gates configured
- [ ] Automated checks execute
- [ ] Results properly reported
- [ ] Failure scenarios handled

## 7) Workflow Management Testing

### Scenario: Test Spec Workflow Management

**Objective:** Validate workflow state management and transitions.

**Steps:**

1. Create workflow configuration
2. Initialize workflow instance
3. Execute state transitions
4. Validate workflow completion

**Expected Results:**

- Workflow states managed correctly
- Transitions execute properly
- Workflow completes successfully

**Test Commands:**

```bash
# Create workflow config
npm run create:workflow-config

# Test workflow execution
npm run test:workflow-execution

# Validate state transitions
npm run validate:workflow-states
```

**Success Criteria:**

- [ ] Workflow configuration created
- [ ] State transitions work
- [ ] Workflow completion validated
- [ ] No state management errors

## 8) Compliance Validation Testing

### Scenario: Test Governance Compliance Validation

**Objective:** Verify compliance validation system functionality.

**Steps:**

1. Define compliance rules
2. Run compliance validation
3. Review validation results
4. Test compliance reporting

**Expected Results:**

- Compliance rules validated
- Validation results accurate
- Reporting system functional

**Test Commands:**

```bash
# Define compliance rules
npm run config:compliance-rules

# Run compliance validation
npm run test:compliance-validation

# Generate compliance report
npm run report:compliance
```

**Success Criteria:**

- [ ] Compliance rules defined
- [ ] Validation system works
- [ ] Reports generated correctly
- [ ] Compliance status accurate

## 9) Performance Testing

### Scenario: Test Governance System Performance

**Objective:** Validate system performance under load.

**Steps:**

1. Set up performance test environment
2. Execute performance tests
3. Analyze performance metrics
4. Optimize performance bottlenecks

**Expected Results:**

- Performance benchmarks met
- System handles load appropriately
- Performance metrics collected

**Test Commands:**

```bash
# Set up performance tests
npm run setup:performance-tests

# Run performance tests
npm run test:performance

# Analyze results
npm run analyze:performance
```

**Success Criteria:**

- [ ] Performance tests execute
- [ ] Benchmarks met or exceeded
- [ ] Metrics collected properly
- [ ] Bottlenecks identified

## 10) End-to-End Integration Testing

### Scenario: Complete Governance Workflow Test

**Objective:** Test full integration of all governance components.

**Steps:**

1. Set up complete test environment
2. Execute full governance workflow
3. Validate all system interactions
4. Review comprehensive test results

**Expected Results:**

- All components integrate properly
- Complete workflow successful
- All validations pass

**Test Commands:**

```bash
# Set up integration environment
npm run setup:integration-test

# Run full integration test
npm run test:integration-full

# Review comprehensive results
npm run report:integration-results
```

**Success Criteria:**

- [ ] Integration environment ready
- [ ] Full workflow completes
- [ ] All components interact correctly
- [ ] Comprehensive validation passes

## Troubleshooting

### Common Issues

#### Issue: Linear Connection Failed

**Symptoms:** Linear API connection errors
**Solution:**

```bash
# Check API credentials
npm run validate:linear-credentials

# Test API connectivity
npm run test:linear-api

# Reset connection
npm run reset:linear-connection
```

#### Issue: Spec Validation Errors

**Symptoms:** Spec files fail validation
**Solution:**

```bash
# Check spec format
npm run validate:spec-format

# Review validation rules
npm run show:validation-rules

# Fix validation errors
npm run fix:spec-validation
```

#### Issue: PR Template Not Applied

**Symptoms:** PR templates not working
**Solution:**

```bash
# Check template configuration
npm run validate:pr-templates

# Test template application
npm run test:pr-template-application

# Reset template system
npm run reset:pr-templates
```

### Performance Issues

#### Issue: Slow Governance Checks

**Symptoms:** Governance validation is slow
**Solution:**

```bash
# Check system resources
npm run monitor:resources

# Optimize validation queries
npm run optimize:validation-performance

# Enable caching
npm run enable:governance-cache
```

## Monitoring and Metrics

### Key Metrics to Monitor

- Governance compliance rate
- PR review time
- Spec validation time
- Linear sync success rate
- Documentation compliance rate

### Monitoring Commands

```bash
# View governance dashboard
npm run dashboard:governance

# Check system health
npm run health:governance

# Review performance metrics
npm run metrics:governance-performance
```

## Best Practices

### Testing Best Practices

1. Run tests in isolated environments
2. Use realistic test data
3. Test both positive and negative scenarios
4. Validate error handling
5. Monitor test performance

### Maintenance Best Practices

1. Keep test data current
2. Review and update test scenarios regularly
3. Monitor test reliability
4. Document test procedures
5. Automate repetitive testing tasks

## Support and Resources

### Documentation

- [Governance Spec Kit Documentation](./spec.md)
- [Implementation Plan](./plan.md)
- [Data Model](./data-model.md)

### Getting Help

- Check existing issues in the repository
- Review CI/CD logs for detailed error information
- Contact the development team for complex issues

### Contributing

- Report bugs with detailed reproduction steps
- Suggest improvements with specific use cases
- Submit pull requests following governance standards
