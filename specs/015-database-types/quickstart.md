# Database Types - Quick Start Guide

## Overview

This guide provides step-by-step testing scenarios for validating the database types implementation. Each scenario includes prerequisites, execution steps, and validation criteria.

## Prerequisites

### Environment Setup

```bash
# Ensure Supabase CLI is installed
supabase --version

# Verify database connection
supabase db reset

# Install dependencies
npm ci

# Generate initial types
npm run typegen
```

### Test Data Setup

```sql
-- Insert test user (replace with actual auth.users setup)
INSERT INTO auth.users (id, email) VALUES
  ('test-user-1', 'test@example.com');

-- Insert test subscription data
INSERT INTO user_subscriptions (user_id, plan, status) VALUES
  ('test-user-1', 'free', 'active');
```

## Testing Scenarios

### 1) Migration Setup Validation

**Objective**: Verify migration system initialization and basic functionality

**Prerequisites**:

- Clean database state
- Migration files in `supabase/migrations/`
- Supabase CLI configured

**Execution Steps**:

```bash
# 1. Reset database to clean state
supabase db reset

# 2. Apply migrations
supabase db push

# 3. Verify migration status
supabase migration list
```

**Validation Criteria**:

- [ ] All migrations applied successfully (no errors)
- [ ] Migration list shows all files as applied
- [ ] Database schema matches expected structure
- [ ] No orphaned migration records

**Expected Output**:

```text
Applied migration 20240101000000_create_subscription_tables.sql
Applied migration 20240102000000_create_monitoring_tables.sql
...
All migrations applied successfully
```

### 2) Type Generation Test

**Objective**: Validate TypeScript type generation from database schema

**Prerequisites**:

- Database schema deployed
- Type generation script configured
- packages/shared/types directory exists

**Execution Steps**:

```bash
# 1. Generate types from current schema
npm run typegen

# 2. Check generated files
ls packages/shared/src/types/

# 3. Validate TypeScript compilation
npm run typecheck
```

**Validation Criteria**:

- [ ] Type files generated in packages/shared/src/types/
- [ ] No TypeScript compilation errors
- [ ] Generated types match database schema
- [ ] Type imports work in application code

**Expected Output**:

```text
Generated types for 15 tables
Type check passed
No compilation errors
```

### 3) Schema Validation Test

**Objective**: Test schema validation rules and constraints

**Prerequisites**:

- Schema deployed with validation rules
- Test data inserted
- Validation scripts available

**Execution Steps**:

```sql
-- 1. Test constraint validation
INSERT INTO user_subscriptions (user_id, plan) VALUES
  ('test-user-1', 'invalid_plan');
-- Should fail with constraint error

-- 2. Test referential integrity
INSERT INTO documents (user_id, file_name, file_path)
VALUES ('nonexistent-user', 'test.pdf', '/test.pdf');
-- Should fail with foreign key error

-- 3. Test custom validation rules
SELECT * FROM validate_schema_integrity();
```

**Validation Criteria**:

- [ ] Constraint violations properly rejected
- [ ] Foreign key relationships enforced
- [ ] Custom validation rules executed
- [ ] Error messages are descriptive

**Expected Output**:

```text
ERROR: new row for relation "user_subscriptions" violates check constraint "user_subscriptions_plan_check"
ERROR: insert or update on table "documents" violates foreign key constraint
Schema validation: PASSED
```

### 4) Data Migration Test

**Objective**: Validate data migration and transformation procedures

**Prerequisites**:

- Source data available
- Migration scripts prepared
- Backup procedures in place

**Execution Steps**:

```bash
# 1. Create backup
pg_dump -h localhost -U postgres schwalbe > backup.sql

# 2. Run data migration
supabase db push --include-all

# 3. Validate data integrity
psql -h localhost -U postgres schwalbe -f validate_migration.sql
```

**Validation Criteria**:

- [ ] Migration completes without errors
- [ ] Data transformation preserves integrity
- [ ] Record counts match expectations
- [ ] Relationships maintained correctly

**Expected Output**:

```text
Migration completed successfully
Data integrity: PASSED
Record counts: Source=1000, Target=1000
Relationships: VALID
```

### 5) Type Validation Test

**Objective**: Test runtime and compile-time type validation

**Prerequisites**:

- Generated types available
- Test application code
- Type validation utilities

**Execution Steps**:

```typescript
// 1. Test compile-time validation
import { Database } from '@schwalbe/shared/types';

const user: Database['public']['Tables']['user_subscriptions']['Row'] = {
  id: 'test-id',
  user_id: 'user-id',
  plan: 'free', // Valid enum value
  status: 'active', // Valid enum value
  // ... other required fields
};

// 2. Test runtime validation
import { validateUserSubscription } from '@schwalbe/shared/validation';

const result = validateUserSubscription(user);
console.log('Validation result:', result);
```

**Validation Criteria**:

- [ ] TypeScript compilation succeeds
- [ ] Runtime validation passes for valid data
- [ ] Type errors caught for invalid data
- [ ] Validation errors are descriptive

**Expected Output**:

```text
Type check: PASSED
Runtime validation: PASSED
No type errors detected
```

### 6) Data Integrity Test

**Objective**: Validate data integrity constraints and monitoring

**Prerequisites**:

- Integrity check functions deployed
- Test data with known issues
- Monitoring system configured

**Execution Steps**:

```sql
-- 1. Run integrity checks
SELECT * FROM check_data_integrity();

-- 2. Test specific constraints
SELECT * FROM validate_user_subscriptions();
SELECT * FROM validate_document_references();

-- 3. Check monitoring dashboard
SELECT * FROM integrity_monitoring_summary();
```

**Validation Criteria**:

- [ ] All integrity checks pass
- [ ] Constraint violations detected
- [ ] Monitoring data collected
- [ ] Repair procedures available

**Expected Output**:

```text
Data integrity check: PASSED
All constraints validated
Monitoring: ACTIVE
Repair procedures: AVAILABLE
```

### 7) Migration Rollback Test

**Objective**: Test migration rollback procedures and recovery

**Prerequisites**:

- Migration system with rollback support
- Backup procedures tested
- Recovery scripts prepared

**Execution Steps**:

```bash
# 1. Apply test migration
supabase migration up

# 2. Verify migration applied
supabase migration list

# 3. Test rollback
supabase migration down

# 4. Verify rollback success
supabase migration list
```

**Validation Criteria**:

- [ ] Migration applies successfully
- [ ] Rollback executes without errors
- [ ] Data state restored correctly
- [ ] No data loss during rollback

**Expected Output**:

```text
Migration applied: test_migration.sql
Migration rolled back: test_migration.sql
Data integrity: MAINTAINED
Rollback: SUCCESSFUL
```

### 8) Performance Testing

**Objective**: Validate database performance under load

**Prerequisites**:

- Performance test data (1000+ records)
- Monitoring tools configured
- Baseline performance metrics

**Execution Steps**:

```bash
# 1. Run performance tests
npm run test:performance

# 2. Monitor query performance
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;

# 3. Check index usage
SELECT * FROM pg_stat_user_indexes ORDER BY idx_scan DESC;
```

**Validation Criteria**:

- [ ] Query performance within acceptable limits (<100ms average)
- [ ] Index usage optimized
- [ ] Memory usage stable
- [ ] No performance regressions

**Expected Output**:

```text
Performance test: PASSED
Average query time: 45ms
Index usage: OPTIMIZED
Memory usage: STABLE
```

### 9) Security Validation Test

**Objective**: Validate security policies and access controls

**Prerequisites**:

- RLS policies deployed
- Test users with different permissions
- Security audit tools

**Execution Steps**:

```sql
-- 1. Test RLS policies
SET LOCAL auth.jwt.claims TO '{"sub": "test-user-1"}';
SELECT * FROM user_subscriptions; -- Should return only user's data

-- 2. Test unauthorized access
SET LOCAL auth.jwt.claims TO '{"sub": "other-user"}';
SELECT * FROM user_subscriptions; -- Should return no data

-- 3. Test service role access
SET LOCAL auth.jwt.claims TO '{"role": "service_role"}';
SELECT COUNT(*) FROM user_subscriptions; -- Should return all records
```

**Validation Criteria**:

- [ ] RLS policies enforce data isolation
- [ ] Unauthorized access blocked
- [ ] Service role access works correctly
- [ ] No security policy bypasses

**Expected Output**:

```text
RLS validation: PASSED
Data isolation: ENFORCED
Security policies: ACTIVE
No bypasses detected
```

### 10) End-to-End Database Workflow Test

**Objective**: Validate complete database workflow from migration to application

**Prerequisites**:

- Full system deployed
- Test user accounts
- Application integration ready

**Execution Steps**:

```bash
# 1. Deploy fresh database
supabase db reset && supabase db push

# 2. Generate and publish types
npm run typegen && npm run build

# 3. Run application tests
npm run test:e2e

# 4. Validate production readiness
npm run test:production
```

**Validation Criteria**:

- [ ] Full deployment succeeds
- [ ] Type generation and publishing works
- [ ] End-to-end tests pass
- [ ] Production validation passes

**Expected Output**:

```text
Full deployment: SUCCESSFUL
Type generation: COMPLETED
E2E tests: PASSED
Production ready: CONFIRMED
```

## Troubleshooting Guide

### Common Issues

#### Migration Failures

```bash
# Check migration status
supabase migration list

# View migration logs
supabase migration log

# Manual rollback
supabase migration down --target <version>
```

#### Type Generation Errors

```bash
# Clear type cache
rm -rf packages/shared/src/types/generated/

# Regenerate types
npm run typegen

# Check for schema issues
supabase db diff
```

#### Schema Validation Failures

```sql
-- Check constraint violations
SELECT * FROM information_schema.constraint_column_usage;

-- Validate specific table
SELECT * FROM validate_table_constraints('user_subscriptions');

-- Repair data issues
SELECT * FROM repair_data_integrity();
```

#### Performance Issues

```sql
-- Analyze slow queries
EXPLAIN ANALYZE SELECT * FROM user_subscriptions WHERE user_id = $1;

-- Check index usage
SELECT * FROM pg_stat_user_indexes WHERE schemaname = 'public';

-- Optimize query
CREATE INDEX CONCURRENTLY idx_user_subscriptions_user_status
ON user_subscriptions(user_id, status);
```

## Success Metrics

### Test Coverage

- [ ] Unit tests: >90% coverage
- [ ] Integration tests: >85% coverage
- [ ] End-to-end tests: >80% coverage

### Performance Benchmarks

- [ ] Migration execution: <30 seconds
- [ ] Type generation: <10 seconds
- [ ] Query performance: <100ms average
- [ ] Memory usage: <500MB peak

### Quality Gates

- [ ] Zero critical security issues
- [ ] Zero data integrity violations
- [ ] Zero type safety errors
- [ ] 100% migration success rate

## Next Steps

After completing all testing scenarios:

1. **Deploy to Staging**: Run full test suite on staging environment
2. **Performance Monitoring**: Set up production monitoring and alerting
3. **Documentation Update**: Update operational documentation
4. **Team Training**: Train team on new database procedures
5. **Production Deployment**: Execute production deployment with rollback plan

## Support Resources

- **Migration Issues**: Check `supabase migration --help`
- **Type Generation**: Review `packages/shared/scripts/typegen.ts`
- **Schema Validation**: See `supabase/functions/validate-schema/`
- **Performance Tuning**: Reference `docs/database/performance.md`
