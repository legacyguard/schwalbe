# Production Deployment - Data Model

This document defines the data model for the Production Deployment system, including entities, relationships, and database schema.

## Core Entities

### DeploymentConfig

Represents a deployment configuration and its execution state.

```typescript
interface DeploymentConfig {
  id: string; // UUID primary key
  environment: 'development' | 'staging' | 'production';
  version: string;
  commit_sha: string;
  status: 'pending' | 'building' | 'deploying' | 'success' | 'failed' | 'rolled_back';
  build_time?: number; // milliseconds
  deploy_time?: number; // milliseconds
  created_at: string;
  completed_at?: string;
  triggered_by: string;
  logs_url?: string;
  artifacts_url?: string;
  error_message?: string;
  rollback_from?: string; // Reference to original deployment
}
```

**Relationships:**

- Belongs to: Environment (many-to-one)
- Has many: DeploymentLogs (one-to-many)
- References: DeploymentConfig (self-referencing for rollbacks)

### Environment

Represents a deployment environment with its configuration.

```typescript
interface Environment {
  name: 'development' | 'staging' | 'production';
  domain: string;
  config: EnvironmentConfig;
  secrets: Record<string, string>; // Encrypted
  features: Record<string, boolean>;
  limits: EnvironmentLimits;
  created_at: string;
  updated_at: string;
}
```

**Relationships:**

- Has many: DeploymentConfig (one-to-many)
- Has many: MonitoringMetric (one-to-many)
- Has many: SecurityScan (one-to-many)

### MonitoringMetric

Represents monitoring metrics and performance data.

```typescript
interface MonitoringMetric {
  id: string; // UUID primary key
  name: string;
  value: number;
  timestamp: string;
  environment: 'development' | 'staging' | 'production';
  tags: Record<string, string>;
  source: string; // e.g., 'application', 'infrastructure', 'external'
}
```

**Relationships:**

- Belongs to: Environment (many-to-one)
- Part of: MetricSeries (logical grouping)

### SecurityScan

Represents security scan results and findings.

```typescript
interface SecurityScan {
  id: string; // UUID primary key
  type: 'dependency' | 'sast' | 'container' | 'iac';
  environment: 'development' | 'staging' | 'production';
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  summary: SecurityScanSummary;
  error_message?: string;
}
```

**Relationships:**

- Belongs to: Environment (many-to-one)
- Has many: SecurityFinding (one-to-many)

### SecurityFinding

Represents individual security findings from scans.

```typescript
interface SecurityFinding {
  id: string; // UUID primary key
  scan_id: string; // Foreign key to SecurityScan
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location?: string;
  cwe_id?: string;
  remediation?: string;
  resolved: boolean;
  resolved_at?: string;
  created_at: string;
}
```

**Relationships:**

- Belongs to: SecurityScan (many-to-one)

### PerformanceMetric

Represents performance measurement data.

```typescript
interface PerformanceMetric {
  id: string; // UUID primary key
  name: string;
  environment: 'development' | 'staging' | 'production';
  timestamp: string;
  value: number;
  unit: string;
  tags: Record<string, string>;
  benchmark?: number; // Expected baseline value
  threshold?: number; // Alert threshold
}
```

**Relationships:**

- Belongs to: Environment (many-to-one)
- Part of: PerformanceBenchmark (logical grouping)

### DeploymentLog

Represents deployment execution logs and audit trail.

```typescript
interface DeploymentLog {
  id: string; // UUID primary key
  deployment_id: string; // Foreign key to DeploymentConfig
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
  source: string; // e.g., 'build', 'deploy', 'verification'
  metadata?: Record<string, any>;
}
```

**Relationships:**

- Belongs to: DeploymentConfig (many-to-one)

## Supporting Types

### EnvironmentConfig

Configuration settings for an environment.

```typescript
interface EnvironmentConfig {
  database_url: string;
  redis_url?: string;
  supabase_url: string;
  supabase_anon_key: string;
  clerk_publishable_key: string;
  stripe_publishable_key: string;
  resend_api_key: string;
  google_translate_api_key?: string;
  sentry_dsn?: string;
  api_rate_limit: number;
  max_file_size_mb: number;
}
```

### EnvironmentLimits

Resource and operational limits for an environment.

```typescript
interface EnvironmentLimits {
  max_concurrent_users: number;
  api_rate_limit: number;
  storage_quota_gb: number;
  bandwidth_limit_gb: number;
  max_deployment_frequency: number; // per hour
}
```

### SecurityScanSummary

Summary statistics from a security scan.

```typescript
interface SecurityScanSummary {
  total_findings: number;
  critical_findings: number;
  high_findings: number;
  medium_findings: number;
  low_findings: number;
  scan_duration_ms: number;
  compliance_score?: number;
}
```

## Entity Relationships

### Core Relationships Diagram

```text
Environment (1) ──── (N) DeploymentConfig
    │
    ├── (N) MonitoringMetric
    ├── (N) SecurityScan
    │       │
    │       └── (N) SecurityFinding
    ├── (N) PerformanceMetric
    └── (N) DeploymentLog (via DeploymentConfig)
```

### Detailed Relationships

1. **Environment → DeploymentConfig**: One-to-many
   - An environment can have multiple deployments
   - Deployments are scoped to specific environments
   - Foreign key: `environment` field

2. **DeploymentConfig → DeploymentLog**: One-to-many
   - Each deployment generates multiple log entries
   - Logs are associated with specific deployment instances
   - Foreign key: `deployment_id`

3. **Environment → MonitoringMetric**: One-to-many
   - Metrics are collected per environment
   - Enables environment-specific monitoring
   - Foreign key: `environment`

4. **Environment → SecurityScan**: One-to-many
   - Security scans are performed per environment
   - Scan results are environment-specific
   - Foreign key: `environment`

5. **SecurityScan → SecurityFinding**: One-to-many
   - Each scan can produce multiple findings
   - Findings are grouped by scan instance
   - Foreign key: `scan_id`

6. **Environment → PerformanceMetric**: One-to-many
   - Performance data is tracked per environment
   - Enables environment-specific optimization
   - Foreign key: `environment`

## Database Schema

### Tables

```sql
-- Environments table
CREATE TABLE environments (
  name TEXT PRIMARY KEY,
  domain TEXT NOT NULL,
  config JSONB NOT NULL,
  secrets JSONB, -- Encrypted
  features JSONB DEFAULT '{}',
  limits JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deployment configurations table
CREATE TABLE deployment_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  environment TEXT NOT NULL REFERENCES environments(name),
  version TEXT NOT NULL,
  commit_sha TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'building', 'deploying', 'success', 'failed', 'rolled_back')),
  build_time INTEGER,
  deploy_time INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  triggered_by TEXT NOT NULL,
  logs_url TEXT,
  artifacts_url TEXT,
  error_message TEXT,
  rollback_from UUID REFERENCES deployment_configs(id)
);

-- Monitoring metrics table
CREATE TABLE monitoring_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  value NUMERIC NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  environment TEXT NOT NULL REFERENCES environments(name),
  tags JSONB DEFAULT '{}',
  source TEXT NOT NULL
);

-- Security scans table
CREATE TABLE security_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('dependency', 'sast', 'container', 'iac')),
  environment TEXT NOT NULL REFERENCES environments(name),
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  summary JSONB,
  error_message TEXT
);

-- Security findings table
CREATE TABLE security_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES security_scans(id) ON DELETE CASCADE,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  cwe_id TEXT,
  remediation TEXT,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance metrics table
CREATE TABLE performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  environment TEXT NOT NULL REFERENCES environments(name),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  tags JSONB DEFAULT '{}',
  benchmark NUMERIC,
  threshold NUMERIC
);

-- Deployment logs table
CREATE TABLE deployment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_id UUID NOT NULL REFERENCES deployment_configs(id) ON DELETE CASCADE,
  level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error')),
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source TEXT NOT NULL,
  metadata JSONB
);
```

### Indexes

```sql
-- Deployment configs indexes
CREATE INDEX idx_deployment_configs_environment_status ON deployment_configs(environment, status);
CREATE INDEX idx_deployment_configs_created_at ON deployment_configs(created_at DESC);
CREATE INDEX idx_deployment_configs_commit_sha ON deployment_configs(commit_sha);
CREATE INDEX idx_deployment_configs_triggered_by ON deployment_configs(triggered_by);

-- Monitoring metrics indexes
CREATE INDEX idx_monitoring_metrics_name_timestamp ON monitoring_metrics(name, timestamp DESC);
CREATE INDEX idx_monitoring_metrics_environment ON monitoring_metrics(environment, timestamp DESC);
CREATE INDEX idx_monitoring_metrics_source ON monitoring_metrics(source);

-- Security scans indexes
CREATE INDEX idx_security_scans_environment_status ON security_scans(environment, status);
CREATE INDEX idx_security_scans_started_at ON security_scans(started_at DESC);
CREATE INDEX idx_security_scans_type ON security_scans(type);

-- Security findings indexes
CREATE INDEX idx_security_findings_scan_severity ON security_findings(scan_id, severity);
CREATE INDEX idx_security_findings_created_at ON security_findings(created_at DESC);
CREATE INDEX idx_security_findings_resolved ON security_findings(resolved, severity);

-- Performance metrics indexes
CREATE INDEX idx_performance_metrics_name_timestamp ON performance_metrics(name, timestamp DESC);
CREATE INDEX idx_performance_metrics_environment ON performance_metrics(environment, timestamp DESC);

-- Deployment logs indexes
CREATE INDEX idx_deployment_logs_deployment_id ON deployment_logs(deployment_id);
CREATE INDEX idx_deployment_logs_timestamp ON deployment_logs(timestamp DESC);
CREATE INDEX idx_deployment_logs_level ON deployment_logs(level);
```

### Row Level Security

```sql
-- Enable RLS on all tables
ALTER TABLE environments ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployment_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployment_logs ENABLE ROW LEVEL SECURITY;

-- Environment access policies
CREATE POLICY "Users can view all environments" ON environments FOR SELECT USING (true);
CREATE POLICY "Admin users can manage environments" ON environments FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Deployment access policies
CREATE POLICY "Users can view deployments" ON deployment_configs FOR SELECT USING (true);
CREATE POLICY "Authorized users can create deployments" ON deployment_configs FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their deployments" ON deployment_configs FOR UPDATE USING (auth.uid()::text = triggered_by);

-- Monitoring access policies
CREATE POLICY "Users can view monitoring data" ON monitoring_metrics FOR SELECT USING (true);
CREATE POLICY "System can create monitoring data" ON monitoring_metrics FOR INSERT WITH CHECK (true);

-- Security access policies
CREATE POLICY "Users can view security scans" ON security_scans FOR SELECT USING (true);
CREATE POLICY "System can manage security scans" ON security_scans FOR ALL WITH CHECK (true);
CREATE POLICY "Users can view security findings" ON security_findings FOR SELECT USING (true);
CREATE POLICY "System can manage security findings" ON security_findings FOR ALL WITH CHECK (true);

-- Performance access policies
CREATE POLICY "Users can view performance metrics" ON performance_metrics FOR SELECT USING (true);
CREATE POLICY "System can create performance metrics" ON performance_metrics FOR INSERT WITH CHECK (true);

-- Deployment logs access policies
CREATE POLICY "Users can view deployment logs" ON deployment_logs FOR SELECT USING (true);
CREATE POLICY "System can create deployment logs" ON deployment_logs FOR INSERT WITH CHECK (true);
```

## Data Flow

### Deployment Flow

1. **Trigger**: User initiates deployment via API/UI
2. **Validation**: System validates deployment parameters
3. **Creation**: DeploymentConfig record created with 'pending' status
4. **Build**: CI/CD pipeline builds application
5. **Update**: DeploymentConfig status updated to 'building'
6. **Deploy**: Application deployed to target environment
7. **Update**: DeploymentConfig status updated to 'deploying'
8. **Verification**: Health checks and smoke tests performed
9. **Completion**: DeploymentConfig status updated to 'success' or 'failed'
10. **Logging**: All steps logged in DeploymentLog table

### Monitoring Flow

1. **Collection**: Metrics collected from various sources
2. **Storage**: Metrics stored in MonitoringMetric table
3. **Analysis**: Metrics analyzed for anomalies and trends
4. **Alerting**: Alerts generated based on configured thresholds
5. **Notification**: Stakeholders notified of issues
6. **Resolution**: Issues tracked and resolved
7. **Reporting**: Regular reports generated for stakeholders

### Security Flow

1. **Scheduling**: Security scans scheduled or triggered
2. **Execution**: Scans performed on code, dependencies, infrastructure
3. **Analysis**: Scan results analyzed for vulnerabilities
4. **Storage**: Findings stored in SecurityFinding table
5. **Prioritization**: Findings prioritized by severity and impact
6. **Remediation**: Vulnerabilities addressed and fixes implemented
7. **Verification**: Follow-up scans verify fixes
8. **Reporting**: Security reports generated for compliance

## Migration Strategy

### Initial Migration

```sql
-- Create custom types
CREATE TYPE environment_type AS ENUM ('development', 'staging', 'production');
CREATE TYPE deployment_status AS ENUM ('pending', 'building', 'deploying', 'success', 'failed', 'rolled_back');
CREATE TYPE alert_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE security_scan_type AS ENUM ('dependency', 'sast', 'container', 'iac');
CREATE TYPE scan_status AS ENUM ('pending', 'running', 'completed', 'failed');
CREATE TYPE log_level AS ENUM ('debug', 'info', 'warn', 'error');

-- Run table creation scripts above
-- Run index creation scripts above
-- Run RLS policy creation scripts above
```

### Data Seeding

```sql
-- Seed initial environments
INSERT INTO environments (name, domain, config, features, limits) VALUES
('development', 'dev.legacyguard.app', '{"database_url": "..."}', '{}', '{}'),
('staging', 'staging.legacyguard.app', '{"database_url": "..."}', '{}', '{}'),
('production', 'legacyguard.cz', '{"database_url": "..."}', '{}', '{}');
```

### Migration Rollback

```sql
-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS deployment_logs CASCADE;
DROP TABLE IF EXISTS performance_metrics CASCADE;
DROP TABLE IF EXISTS security_findings CASCADE;
DROP TABLE IF EXISTS security_scans CASCADE;
DROP TABLE IF EXISTS monitoring_metrics CASCADE;
DROP TABLE IF EXISTS deployment_configs CASCADE;
DROP TABLE IF EXISTS environments CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS log_level;
DROP TYPE IF EXISTS scan_status;
DROP TYPE IF EXISTS security_scan_type;
DROP TYPE IF EXISTS alert_severity;
DROP TYPE IF EXISTS deployment_status;
DROP TYPE IF EXISTS environment_type;
```

## Performance Considerations

### Indexing Strategy

- Composite indexes for common query patterns
- Partial indexes for status-based filtering
- Time-based indexes for temporal queries
- Foreign key indexes for referential integrity

### Partitioning Strategy

- Time-based partitioning for metrics and logs tables
- Hash partitioning for high-volume tables
- Range partitioning for historical data

### Caching Strategy

- Application-level caching for frequently accessed data
- Database query result caching
- CDN caching for static assets
- Redis caching for session and temporary data

### Monitoring Strategy

- Query performance monitoring
- Index usage analysis
- Table bloat monitoring
- Connection pool monitoring
- Replication lag monitoring (if applicable)

## Security Considerations

### Data Protection

- Encryption at rest for sensitive data
- Encryption in transit for all communications
- Secure key management for encryption keys
- Regular key rotation procedures

### Access Control

- Role-based access control (RBAC)
- Multi-factor authentication (MFA)
- Session management and timeout
- Audit logging for all access

### Compliance

- GDPR compliance for data handling
- SOC 2 compliance for security controls
- Regular security audits and penetration testing
- Incident response procedures

## Backup and Recovery

### Backup Strategy

- Daily full backups of all tables
- Hourly incremental backups for critical data
- Point-in-time recovery capability
- Cross-region backup replication

### Recovery Strategy

- Automated failover procedures
- Data restoration procedures
- Service restoration priorities
- Communication procedures during incidents

## Future Enhancements

### Planned Improvements

- Real-time metrics streaming
- Advanced anomaly detection
- Predictive scaling
- Automated remediation
- Multi-cloud deployment support

### Scalability Considerations

- Database sharding strategy
- Microservices architecture support
- Global CDN deployment
- Edge computing integration
