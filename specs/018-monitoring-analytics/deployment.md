# Deployment and Configuration Guide: Monitoring & Analytics System

## Overview

This guide provides comprehensive instructions for deploying and configuring the monitoring and analytics system for Schwalbe. The system integrates seamlessly with existing infrastructure and provides real-time observability.

## Prerequisites

### Infrastructure Requirements

- **Supabase Project**: Database and Edge Functions hosting
- **Vercel Account**: Application deployment and hosting
- **Resend Account**: Email alerting and notifications
- **GitHub Repository**: Source code and CI/CD pipelines
- **Domain Configuration**: Custom domain for production deployment

### System Requirements

- **Node.js**: Version 18+ with TypeScript support
- **Database**: Supabase PostgreSQL with extensions
- **Storage**: Supabase Storage for monitoring data
- **Edge Runtime**: Supabase Edge Functions for serverless processing
- **CDN**: Vercel edge network for global distribution

### Access Requirements

- **Supabase Admin Access**: Database schema modifications and function deployment
- **Vercel Team Access**: Environment configuration and deployment management
- **Resend API Access**: Email template configuration and sending limits
- **GitHub Admin Access**: Repository settings and secret management

## Environment Setup

### 1. Supabase Project Configuration

Create a new Supabase project or use existing project:

```bash
# Initialize Supabase in project
supabase init

# Link to existing project
supabase link --project-ref your-project-ref

# Set up local development
supabase start
```

### 2. Environment Variables Configuration

Configure environment variables for all environments:

#### Development (.env.local)

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_local_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_local_service_role_key

# Monitoring Configuration
NEXT_PUBLIC_MONITORING_ENABLED=true
MONITORING_ENVIRONMENT=development
MONITORING_RETENTION_DAYS=30
MONITORING_SAMPLE_RATE=1.0

# Resend Configuration (Development)
RESEND_API_KEY=your_resend_dev_key

# Analytics Configuration
ANALYTICS_ENABLED=true
ANALYTICS_PRIVACY_MODE=development
```

#### Staging (.env.staging)

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_staging_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_staging_service_role_key

# Monitoring Configuration
NEXT_PUBLIC_MONITORING_ENABLED=true
MONITORING_ENVIRONMENT=staging
MONITORING_RETENTION_DAYS=60
MONITORING_SAMPLE_RATE=0.5

# Resend Configuration
RESEND_API_KEY=your_resend_staging_key

# Analytics Configuration
ANALYTICS_ENABLED=true
ANALYTICS_PRIVACY_MODE=staging
```

#### Production (.env.production)

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_prod_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_prod_service_role_key

# Monitoring Configuration
NEXT_PUBLIC_MONITORING_ENABLED=true
MONITORING_ENVIRONMENT=production
MONITORING_RETENTION_DAYS=90
MONITORING_SAMPLE_RATE=0.1

# Resend Configuration
RESEND_API_KEY=your_resend_prod_key

# Analytics Configuration
ANALYTICS_ENABLED=true
ANALYTICS_PRIVACY_MODE=production
```

### 3. Vercel Deployment Configuration

Configure Vercel project settings:

#### vercel.json

```json
{
  "functions": {
    "api/monitoring/*.ts": {
      "maxDuration": 30
    },
    "api/analytics/*.ts": {
      "maxDuration": 30
    },
    "api/performance/*.ts": {
      "maxDuration": 30
    },
    "api/errors/*.ts": {
      "maxDuration": 30
    },
    "api/dashboard/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ]
}
```

#### Vercel Environment Variables

Set environment variables in Vercel dashboard or CLI:

```bash
# Set production environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add RESEND_API_KEY production
vercel env add NEXT_PUBLIC_MONITORING_ENABLED production
vercel env add MONITORING_ENVIRONMENT production
```

## Database Deployment

### 1. Schema Migration

Deploy database migrations:

```bash
# Apply migrations to local database
supabase db push

# Apply migrations to remote database
supabase db push --include-all

# Reset database (development only)
supabase db reset
```

### 2. Row Level Security (RLS) Setup

Enable and configure RLS policies:

```sql
-- Enable RLS on monitoring tables
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_instances ENABLE ROW LEVEL SECURITY;

-- Apply RLS policies (see implementation guide for details)
-- [RLS policy SQL statements from implementation.md]
```

### 3. Database Indexes

Create performance indexes:

```sql
-- Analytics events indexes
CREATE INDEX CONCURRENTLY idx_analytics_events_user_created ON analytics_events(user_id, created_at);
CREATE INDEX CONCURRENTLY idx_analytics_events_type_created ON analytics_events(event_type, created_at);
CREATE INDEX CONCURRENTLY idx_analytics_events_session ON analytics_events(session_id);

-- Error logs indexes
CREATE INDEX CONCURRENTLY idx_error_logs_user_created ON error_logs(user_id, created_at);
CREATE INDEX CONCURRENTLY idx_error_logs_type_severity ON error_logs(error_type, severity);

-- Performance metrics indexes
CREATE INDEX CONCURRENTLY idx_performance_metrics_user_created ON performance_metrics(user_id, created_at);
CREATE INDEX CONCURRENTLY idx_performance_metrics_type ON performance_metrics(metric_type);
```

### 4. Data Retention Policies

Set up automated data cleanup:

```sql
-- Create retention policy function
CREATE OR REPLACE FUNCTION cleanup_monitoring_data()
RETURNS void AS $$
BEGIN
  -- Delete old analytics events (keep 90 days)
  DELETE FROM analytics_events
  WHERE created_at < NOW() - INTERVAL '90 days';

  -- Delete old error logs (keep 90 days)
  DELETE FROM error_logs
  WHERE created_at < NOW() - INTERVAL '90 days';

  -- Delete old performance metrics (keep 30 days)
  DELETE FROM performance_metrics
  WHERE created_at < NOW() - INTERVAL '30 days';

  -- Delete old system health records (keep 30 days)
  DELETE FROM system_health
  WHERE checked_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule daily cleanup
SELECT cron.schedule(
  'cleanup-monitoring-data',
  '0 2 * * *', -- Daily at 2 AM
  'SELECT cleanup_monitoring_data();'
);
```

## Supabase Edge Functions Deployment

### 1. Function Development

Create Edge Functions in `supabase/functions/`:

#### Alert Processor Function

```typescript
// supabase/functions/alert-processor/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'https://esm.sh/resend@3.2.0';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const resend = new Resend(Deno.env.get('RESEND_API_KEY')!);

export async function processAlert(alertData: any) {
  // Alert processing logic (see implementation guide)
}
```

#### Health Check Function

```typescript
// supabase/functions/health-check/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

export async function checkSystemHealth() {
  // Health check logic (see implementation guide)
}
```

### 2. Function Deployment

Deploy Edge Functions:

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy alert-processor

# List deployed functions
supabase functions list

# View function logs
supabase functions logs alert-processor
```

### 3. Function Configuration

Configure function settings:

```bash
# Set function environment variables
supabase secrets set RESEND_API_KEY=your_resend_key

# Set function configuration
supabase functions config alert-processor --set max_duration=30
```

## Application Deployment

### 1. Build Configuration

Configure build settings in `package.json`:

```json
{
  "scripts": {
    "build": "next build",
    "build:analyze": "ANALYZE=true next build",
    "typecheck": "tsc --noEmit",
    "lint": "eslint . --ext .ts,.tsx",
    "test": "jest",
    "test:monitoring": "jest --testPathPattern=monitoring"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.38.0",
    "@supabase/ssr": "^0.0.10",
    "resend": "^3.2.0",
    "zod": "^3.22.4",
    "date-fns": "^3.0.6"
  }
}
```

### 2. Vercel Deployment

Deploy application to Vercel:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link project
vercel link

# Deploy to production
vercel --prod

# Check deployment status
vercel ls
```

### 3. Build Optimization

Configure build optimizations:

```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@schwalbe/shared', '@schwalbe/ui'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Client-side optimizations
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};
```

## Monitoring Configuration

### 1. Alert Rules Setup

Configure initial alert rules:

```sql
-- Insert default alert rules
INSERT INTO alert_rules (
  name,
  description,
  condition_type,
  condition_config,
  severity,
  enabled,
  notification_channels
) VALUES
(
  'High Error Rate Alert',
  'Alert when error rate exceeds 5%',
  'threshold',
  '{"metric": "error_rate", "operator": ">", "value": 5}',
  'high',
  true,
  ARRAY['email']
),
(
  'Performance Degradation Alert',
  'Alert when API response time exceeds 5 seconds',
  'threshold',
  '{"metric": "api_response_time", "operator": ">", "value": 5000}',
  'medium',
  true,
  ARRAY['email']
);
```

### 2. Performance Budgets

Set up performance budgets:

```javascript
// packages/shared/src/config/performance-budgets.ts
export const PERFORMANCE_BUDGETS = {
  FCP: 1800, // 1.8 seconds
  LCP: 2500, // 2.5 seconds
  FID: 100,  // 100 milliseconds
  CLS: 0.1,  // 0.1 cumulative layout shift
  TTFB: 800, // 800 milliseconds
  bundleSize: 500 * 1024, // 500KB
};

export const MONITORING_CONFIG = {
  enabled: process.env.NEXT_PUBLIC_MONITORING_ENABLED === 'true',
  environment: process.env.MONITORING_ENVIRONMENT || 'development',
  retentionDays: parseInt(process.env.MONITORING_RETENTION_DAYS || '90'),
  sampleRate: parseFloat(process.env.MONITORING_SAMPLE_RATE || '1.0'),
};
```

### 3. Privacy Configuration

Configure privacy settings:

```javascript
// packages/shared/src/config/privacy.ts
export const PRIVACY_CONFIG = {
  analyticsEnabled: process.env.ANALYTICS_ENABLED === 'true',
  privacyMode: process.env.ANALYTICS_PRIVACY_MODE || 'production',
  dataRetentionDays: 90,
  anonymizeAfterDays: 30,
  allowedDomains: ['schwalbe.dev', 'app.schwalbe.dev'],
  consentRequired: true,
  gdprCompliant: true,
};
```

## CI/CD Pipeline Setup

### 1. GitHub Actions Configuration

Set up CI/CD pipeline:

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
cache: 'npm'

      - name: Install dependencies
run: npm ci

      - name: Type check
run: npm run typecheck

      - name: Lint
run: npm run lint

      - name: Test
run: npm test

      - name: Test monitoring
run: npm run test:monitoring

  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to staging
        run: |
          vercel --token ${{ secrets.VERCEL_TOKEN }} --yes
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-production:
    needs: deploy-staging
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: |
          vercel --token ${{ secrets.VERCEL_TOKEN }} --prod --yes
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

### 2. Health Checks

Configure deployment health checks:

```yaml
# .github/workflows/health-check.yml
name: Health Check
on:
  deployment_status

jobs:
  health-check:
    if: github.event.deployment_status.state == 'success'
    runs-on: ubuntu-latest
    steps:
      - name: Health check
        run: |
          curl -f https://api.schwalbe.dev/health || exit 1

      - name: Performance check
        run: |
          lighthouse https://app.schwalbe.dev --output json --output-path ./lighthouse-results.json
```

## Security Configuration

### 1. API Security

Configure API security headers:

```javascript
// next.config.js - Security headers
module.exports = {
  async headers() {
    return [
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  },
};
```

### 2. Data Encryption

Configure data encryption:

```typescript
// packages/shared/src/services/encryption.ts
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

export class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private key: Buffer;

  constructor() {
    this.key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
  }

  encrypt(text: string): string {
    const iv = randomBytes(16);
    const cipher = createCipheriv(this.algorithm, this.key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  decrypt(encryptedText: string): string {
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    const decipher = createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
```

### 3. Access Control

Configure access control:

```sql
-- Create monitoring admin role
CREATE ROLE monitoring_admin;

-- Grant permissions to monitoring admin
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO monitoring_admin;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO monitoring_admin;

-- Create monitoring user
CREATE USER monitoring_user WITH PASSWORD 'secure_password';
GRANT monitoring_admin TO monitoring_user;
```

## Monitoring and Maintenance

### 1. System Monitoring

Set up system monitoring:

```bash
# Install monitoring tools
npm install -g @supabase/cli vercel lighthouse

# Set up monitoring scripts
# scripts/monitor.sh
#!/bin/bash
echo "Running system health checks..."

# Database health
supabase db health

# Application health
curl -f https://api.schwalbe.dev/health

# Performance check
lighthouse https://app.schwalbe.dev --output json

echo "Health checks completed"
```

### 2. Backup Configuration

Configure backup strategy:

```bash
# scripts/backup.sh
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Database backup
supabase db dump > "backup_db_$TIMESTAMP.sql"

# Configuration backup
cp .env.production "backup_env_$TIMESTAMP"

# Upload to secure storage
# (Configure secure backup storage)

echo "Backup completed: $TIMESTAMP"
```

### 3. Log Management

Configure log management:

```bash
# scripts/logs.sh
#!/bin/bash

# View application logs
vercel logs --follow

# View Supabase function logs
supabase functions logs

# Export logs for analysis
supabase functions logs --function=alert-processor > logs_alert_processor.txt

echo "Log export completed"
```

## Troubleshooting

### Common Deployment Issues

#### Database Connection Issues

```bash
# Check database connectivity
supabase db health

# Reset database connection
supabase db reset

# Check environment variables
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY
```

#### Function Deployment Issues

```bash
# Check function status
supabase functions list

# Redeploy function
supabase functions deploy alert-processor --no-verify-jwt

# Check function logs
supabase functions logs alert-processor
```

#### Application Build Issues

```bash
# Clear build cache
rm -rf .next node_modules/.cache

# Reinstall dependencies
npm ci

# Check TypeScript errors
npm run typecheck

# Build with verbose output
DEBUG=* npm run build
```

### Performance Issues

#### High Memory Usage

```bash
# Monitor memory usage
node --expose-gc --max-old-space-size=4096

# Check for memory leaks
# Use Chrome DevTools Memory tab
# Monitor heap snapshots
```

#### Slow Response Times

```bash
# Profile application performance
lighthouse https://app.schwalbe.dev --output json

# Check database query performance
supabase db inspect

# Monitor API response times
curl -w "@curl-format.txt" -o /dev/null -s https://api.schwalbe.dev/health
```

### Monitoring Issues

#### Missing Metrics

```bash
# Check monitoring service status
curl https://api.schwalbe.dev/api/monitoring/health

# Verify environment variables
echo $NEXT_PUBLIC_MONITORING_ENABLED
echo $MONITORING_ENVIRONMENT

# Check browser console for errors
# Open DevTools > Console
```

#### Alert Not Triggering

```bash
# Check alert rules
supabase db inspect alert_rules

# Verify alert conditions
# Check monitoring service logs
supabase functions logs alert-processor

# Test alert manually
curl -X POST https://api.schwalbe.dev/api/monitoring/alerts \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Alert","message":"Test message","severity":"low"}'
```

## Scaling Considerations

### Horizontal Scaling

```bash
# Scale Supabase Edge Functions
supabase functions config alert-processor --set max_instances=10

# Scale Vercel functions
# Configure in vercel.json
{
  "functions": {
    "api/monitoring/*.ts": {
      "maxInstances": 10
    }
  }
}
```

### Database Scaling

```sql
-- Add read replicas for analytics queries
-- Configure connection pooling
-- Implement query optimization
-- Set up database indexing strategy
```

### Monitoring Scaling

```javascript
// Implement sampling for high-traffic scenarios
const monitoringService = new MonitoringService({
  sampleRate: process.env.MONITORING_SAMPLE_RATE || 0.1,
});

// Use batch processing for bulk operations
monitoringService.batchProcess(metrics, {
  batchSize: 100,
  flushInterval: 30000,
});
```

## Success Metrics

### Deployment Success Criteria

- [ ] Application deploys successfully to all environments
- [ ] Database migrations apply without errors
- [ ] Edge Functions deploy and are accessible
- [ ] Environment variables are properly configured
- [ ] Health checks pass in all environments
- [ ] Monitoring dashboard loads correctly
- [ ] Alert system sends test notifications

### Performance Benchmarks

- [ ] Application startup time < 3 seconds
- [ ] First Contentful Paint < 1.8 seconds
- [ ] API response time < 500ms (p95)
- [ ] Monitoring overhead < 5% of total performance
- [ ] Database query time < 100ms (p95)

### Monitoring Effectiveness

- [ ] 100% uptime monitoring coverage
- [ ] < 5 minute alert response time
- [ ] > 95% error tracking accuracy
- [ ] < 1% data loss in monitoring pipeline
- [ ] Real-time dashboard updates < 30 seconds

This deployment guide ensures a robust, scalable, and secure monitoring system that provides comprehensive observability for the Schwalbe platform.
