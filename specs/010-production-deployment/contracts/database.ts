// Production Deployment System - Database Contracts
// Based on Hollywood implementation with Schwalbe adaptations

// Database Schema Definitions
export interface DatabaseSchema {
  deployments: DeploymentTable;
  environments: EnvironmentTable;
  monitoring: {
    alerts: AlertTable;
    metrics: MetricTable;
    health_checks: HealthCheckTable;
  };
  security: {
    scans: SecurityScanTable;
    findings: SecurityFindingTable;
  };
  ci_cd: {
    pipelines: PipelineTable;
    stages: PipelineStageTable;
  };
}

// Main Deployments Table Schema
export interface DeploymentTable {
  id: string; // UUID PRIMARY KEY DEFAULT gen_random_uuid()
  environment: 'development' | 'staging' | 'production'; // environment_type NOT NULL
  status: 'pending' | 'building' | 'deploying' | 'success' | 'failed' | 'rolled_back'; // deployment_status DEFAULT 'pending'
  version: string; // TEXT NOT NULL
  commit_sha: string; // TEXT NOT NULL
  build_time?: number; // INTEGER (milliseconds)
  deploy_time?: number; // INTEGER (milliseconds)
  created_at: string; // TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  completed_at?: string; // TIMESTAMP WITH TIME ZONE
  triggered_by: string; // TEXT NOT NULL
  logs_url?: string; // TEXT
  artifacts_url?: string; // TEXT
  error_message?: string; // TEXT
  rollback_from?: string; // UUID REFERENCES deployments(id)
}

// Environment Configuration Table
export interface EnvironmentTable {
  name: 'development' | 'staging' | 'production'; // TEXT PRIMARY KEY
  domain: string; // TEXT NOT NULL
  config: Record<string, any>; // JSONB NOT NULL
  secrets: Record<string, string>; // JSONB (encrypted)
  features: Record<string, boolean>; // JSONB DEFAULT '{}'
  limits: Record<string, number>; // JSONB DEFAULT '{}'
  created_at: string; // TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  updated_at: string; // TIMESTAMP WITH TIME ZONE DEFAULT NOW()
}

// Monitoring Tables
export interface AlertTable {
  id: string; // UUID PRIMARY KEY DEFAULT gen_random_uuid()
  type: string; // TEXT NOT NULL
  severity: 'low' | 'medium' | 'high' | 'critical'; // alert_severity NOT NULL
  title: string; // TEXT NOT NULL
  message: string; // TEXT NOT NULL
  environment: 'development' | 'staging' | 'production'; // environment_type NOT NULL
  resolved: boolean; // BOOLEAN DEFAULT false
  resolved_at?: string; // TIMESTAMP WITH TIME ZONE
  resolved_by?: string; // TEXT
  created_at: string; // TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  updated_at: string; // TIMESTAMP WITH TIME ZONE DEFAULT NOW()
}

export interface MetricTable {
  id: string; // UUID PRIMARY KEY DEFAULT gen_random_uuid()
  name: string; // TEXT NOT NULL
  value: number; // NUMERIC NOT NULL
  timestamp: string; // TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  environment: 'development' | 'staging' | 'production'; // environment_type NOT NULL
  tags: Record<string, string>; // JSONB DEFAULT '{}'
}

export interface HealthCheckTable {
  id: string; // UUID PRIMARY KEY DEFAULT gen_random_uuid()
  service: string; // TEXT NOT NULL
  status: 'healthy' | 'degraded' | 'unhealthy'; // health_status NOT NULL
  response_time_ms?: number; // INTEGER
  error_message?: string; // TEXT
  last_checked: string; // TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  environment: 'development' | 'staging' | 'production'; // environment_type NOT NULL
}

// Security Tables
export interface SecurityScanTable {
  id: string; // UUID PRIMARY KEY DEFAULT gen_random_uuid()
  type: 'dependency' | 'sast' | 'container' | 'iac'; // security_scan_type NOT NULL
  environment: 'development' | 'staging' | 'production'; // environment_type NOT NULL
  status: 'pending' | 'running' | 'completed' | 'failed'; // scan_status DEFAULT 'pending'
  started_at: string; // TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  completed_at?: string; // TIMESTAMP WITH TIME ZONE
  summary: Record<string, any>; // JSONB
  error_message?: string; // TEXT
}

export interface SecurityFindingTable {
  id: string; // UUID PRIMARY KEY DEFAULT gen_random_uuid()
  scan_id: string; // UUID NOT NULL REFERENCES security_scans(id) ON DELETE CASCADE
  severity: 'low' | 'medium' | 'high' | 'critical'; // alert_severity NOT NULL
  title: string; // TEXT NOT NULL
  description: string; // TEXT NOT NULL
  location?: string; // TEXT
  cwe_id?: string; // TEXT
  remediation?: string; // TEXT
  resolved: boolean; // BOOLEAN DEFAULT false
  resolved_at?: string; // TIMESTAMP WITH TIME ZONE
  created_at: string; // TIMESTAMP WITH TIME ZONE DEFAULT NOW()
}

// CI/CD Tables
export interface PipelineTable {
  id: string; // UUID PRIMARY KEY DEFAULT gen_random_uuid()
  name: string; // TEXT NOT NULL
  status: 'idle' | 'running' | 'success' | 'failed' | 'cancelled'; // pipeline_status DEFAULT 'idle'
  created_at: string; // TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  completed_at?: string; // TIMESTAMP WITH TIME ZONE
  triggered_by: string; // TEXT NOT NULL
  commit_sha: string; // TEXT NOT NULL
  environment: 'development' | 'staging' | 'production'; // environment_type NOT NULL
}

export interface PipelineStageTable {
  id: string; // UUID PRIMARY KEY DEFAULT gen_random_uuid()
  pipeline_id: string; // UUID NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE
  name: string; // TEXT NOT NULL
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped'; // stage_status DEFAULT 'pending'
  started_at?: string; // TIMESTAMP WITH TIME ZONE
  completed_at?: string; // TIMESTAMP WITH TIME ZONE
  duration_ms?: number; // INTEGER
  logs?: string[]; // TEXT[]
  order_index: number; // INTEGER NOT NULL
}

// Row Level Security Policies
export interface RLSPolicies {
  deployments: {
    // Users can view deployments for environments they have access to
    user_view_deployments: {
      table: 'deployments';
      command: 'SELECT';
      using: 'true'; // Environment-based access control in application logic
    };

    // Only authorized users can create deployments
    user_create_deployments: {
      table: 'deployments';
      command: 'INSERT';
      check: 'true'; // Authorization handled in application logic
    };

    // Users can update deployments they created
    user_update_deployments: {
      table: 'deployments';
      command: 'UPDATE';
using: 'app.current_external_id() = triggered_by';
    };
  };

  monitoring: {
    // Users can view monitoring data for accessible environments
    user_view_monitoring: {
      table: 'alerts, metrics, health_checks';
      command: 'SELECT';
      using: 'true'; // Environment-based filtering in application logic
    };

    // Only system can create monitoring data
    system_create_monitoring: {
      table: 'alerts, metrics, health_checks';
      command: 'INSERT';
      check: 'true'; // System-only operations
    };
  };

  security: {
    // Users can view security scans and findings for accessible environments
    user_view_security: {
      table: 'security_scans, security_findings';
      command: 'SELECT';
      using: 'true'; // Environment-based access control
    };

    // Only security system can create scan data
    system_create_security: {
      table: 'security_scans, security_findings';
      command: 'INSERT';
      check: 'true'; // System-only operations
    };
  };

  ci_cd: {
    // Users can view pipeline data for accessible environments
    user_view_pipelines: {
      table: 'pipelines, pipeline_stages';
      command: 'SELECT';
      using: 'true'; // Environment-based filtering
    };

    // CI/CD system can create and update pipeline data
    system_manage_pipelines: {
      table: 'pipelines, pipeline_stages';
      command: 'ALL';
      check: 'true'; // System-only operations
    };
  };
}

// Database Functions
export interface DatabaseFunctions {
  // Deployment management
  create_deployment: {
    name: 'create_deployment';
    parameters: {
      environment: 'development' | 'staging' | 'production';
      version: string;
      commit_sha: string;
      triggered_by: string;
    };
    returns: {
      id: string;
      environment: string;
      status: string;
      version: string;
      commit_sha: string;
      created_at: string;
    };
    sql: `
      INSERT INTO deployments (environment, version, commit_sha, triggered_by)
      VALUES ($1, $2, $3, $4)
      RETURNING id, environment, status, version, commit_sha, created_at;
    `;
  };

  // Get deployments by environment
  get_deployments_by_environment: {
    name: 'get_deployments_by_environment';
    parameters: {
      environment: 'development' | 'staging' | 'production';
      limit?: number;
    };
    returns: {
      id: string;
      status: string;
      version: string;
      created_at: string;
      completed_at?: string;
    }[];
    sql: `
      SELECT id, status, version, created_at, completed_at
      FROM deployments
      WHERE environment = $1
      ORDER BY created_at DESC
      LIMIT COALESCE($2, 50);
    `;
  };

  // Update deployment status
  update_deployment_status: {
    name: 'update_deployment_status';
    parameters: {
      deployment_id: string;
      status: 'pending' | 'building' | 'deploying' | 'success' | 'failed' | 'rolled_back';
      error_message?: string;
    };
    returns: boolean;
    sql: `
      UPDATE deployments
      SET
        status = $2,
        completed_at = CASE WHEN $2 IN ('success', 'failed', 'rolled_back') THEN NOW() ELSE completed_at END,
        error_message = COALESCE($3, error_message),
        updated_at = NOW()
      WHERE id = $1
      RETURNING true;
    `;
  };

  // Monitoring functions
  record_metric: {
    name: 'record_metric';
    parameters: {
      name: string;
      value: number;
      environment: 'development' | 'staging' | 'production';
      tags?: Record<string, string>;
    };
    returns: string;
    sql: `
      INSERT INTO metrics (name, value, environment, tags)
      VALUES ($1, $2, $3, COALESCE($4, '{}'))
      RETURNING id;
    `;
  };

  // Get active alerts
  get_active_alerts: {
    name: 'get_active_alerts';
    parameters: {
      environment?: 'development' | 'staging' | 'production';
    };
    returns: {
      id: string;
      type: string;
      severity: string;
      title: string;
      message: string;
      created_at: string;
    }[];
    sql: `
      SELECT id, type, severity, title, message, created_at
      FROM alerts
      WHERE resolved = false
        AND (environment = $1 OR $1 IS NULL)
      ORDER BY created_at DESC;
    `;
  };

  // Security functions
  create_security_scan: {
    name: 'create_security_scan';
    parameters: {
      type: 'dependency' | 'sast' | 'container' | 'iac';
      environment: 'development' | 'staging' | 'production';
    };
    returns: string;
    sql: `
      INSERT INTO security_scans (type, environment)
      VALUES ($1, $2)
      RETURNING id;
    `;
  };

  // Get security scan results
  get_security_scan_results: {
    name: 'get_security_scan_results';
    parameters: { scan_id: string; };
    returns: {
      id: string;
      severity: string;
      title: string;
      description: string;
      remediation?: string;
    }[];
    sql: `
      SELECT id, severity, title, description, remediation
      FROM security_findings
      WHERE scan_id = $1
      ORDER BY severity DESC, created_at DESC;
    `;
  };
}

// Indexes for Performance
export interface DatabaseIndexes {
  deployments: {
    // Primary key index (automatically created)
    primary_key: 'deployments_pkey ON deployments(id)';

    // Environment and status indexes
    environment_status: 'idx_deployments_environment_status ON deployments(environment, status)';
    created_at: 'idx_deployments_created_at ON deployments(created_at DESC)';
    commit_sha: 'idx_deployments_commit_sha ON deployments(commit_sha)';

    // Triggered by index for user queries
    triggered_by: 'idx_deployments_triggered_by ON deployments(triggered_by)';
  };

  monitoring: {
    // Metrics indexes
    metrics_name_timestamp: 'idx_metrics_name_timestamp ON metrics(name, timestamp DESC)';
    metrics_environment: 'idx_metrics_environment ON metrics(environment, timestamp DESC)';

    // Alerts indexes
    alerts_environment_severity: 'idx_alerts_environment_severity ON alerts(environment, severity, resolved)';
    alerts_created_at: 'idx_alerts_created_at ON alerts(created_at DESC)';

    // Health checks indexes
    health_checks_service: 'idx_health_checks_service ON health_checks(service, last_checked DESC)';
  };

  security: {
    // Security scans indexes
    scans_environment_status: 'idx_security_scans_environment_status ON security_scans(environment, status)';
    scans_started_at: 'idx_security_scans_started_at ON security_scans(started_at DESC)';

    // Security findings indexes
    findings_scan_severity: 'idx_security_findings_scan_severity ON security_findings(scan_id, severity)';
    findings_created_at: 'idx_security_findings_created_at ON security_findings(created_at DESC)';
  };

  ci_cd: {
    // Pipeline indexes
    pipelines_environment_status: 'idx_pipelines_environment_status ON pipelines(environment, status)';
    pipelines_created_at: 'idx_pipelines_created_at ON pipelines(created_at DESC)';

    // Pipeline stages indexes
    stages_pipeline_order: 'idx_pipeline_stages_pipeline_order ON pipeline_stages(pipeline_id, order_index)';
    stages_status: 'idx_pipeline_stages_status ON pipeline_stages(status, started_at DESC)';
  };
}

// Migration Scripts
export interface MigrationScripts {
  create_deployments_table: {
    version: '20250101000000';
    name: 'create_deployments_table';
    up: `
      CREATE TYPE environment_type AS ENUM ('development', 'staging', 'production');
      CREATE TYPE deployment_status AS ENUM ('pending', 'building', 'deploying', 'success', 'failed', 'rolled_back');
      CREATE TYPE alert_severity AS ENUM ('low', 'medium', 'high', 'critical');
      CREATE TYPE health_status AS ENUM ('healthy', 'degraded', 'unhealthy');
      CREATE TYPE security_scan_type AS ENUM ('dependency', 'sast', 'container', 'iac');
      CREATE TYPE scan_status AS ENUM ('pending', 'running', 'completed', 'failed');
      CREATE TYPE pipeline_status AS ENUM ('idle', 'running', 'success', 'failed', 'cancelled');
      CREATE TYPE stage_status AS ENUM ('pending', 'running', 'success', 'failed', 'skipped');

      CREATE TABLE deployments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        environment environment_type NOT NULL,
        status deployment_status DEFAULT 'pending',
        version TEXT NOT NULL,
        commit_sha TEXT NOT NULL,
        build_time INTEGER,
        deploy_time INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE,
        triggered_by TEXT NOT NULL,
        logs_url TEXT,
        artifacts_url TEXT,
        error_message TEXT,
        rollback_from UUID REFERENCES deployments(id)
      );

      -- Add indexes
      CREATE INDEX idx_deployments_environment_status ON deployments(environment, status);
      CREATE INDEX idx_deployments_created_at ON deployments(created_at DESC);
      CREATE INDEX idx_deployments_commit_sha ON deployments(commit_sha);
      CREATE INDEX idx_deployments_triggered_by ON deployments(triggered_by);

      -- Add RLS
      ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;
    `;
    down: `
      DROP TABLE IF EXISTS deployments CASCADE;
      DROP TYPE IF EXISTS environment_type;
      DROP TYPE IF EXISTS deployment_status;
      DROP TYPE IF EXISTS alert_severity;
      DROP TYPE IF EXISTS health_status;
      DROP TYPE IF EXISTS security_scan_type;
      DROP TYPE IF EXISTS scan_status;
      DROP TYPE IF EXISTS pipeline_status;
      DROP TYPE IF EXISTS stage_status;
    `;
  };

  create_monitoring_tables: {
    version: '20250102000000';
    name: 'create_monitoring_tables';
    up: `
      CREATE TABLE alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type TEXT NOT NULL,
        severity alert_severity NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        environment environment_type NOT NULL,
        resolved BOOLEAN DEFAULT false,
        resolved_at TIMESTAMP WITH TIME ZONE,
        resolved_by TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE metrics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        value NUMERIC NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        environment environment_type NOT NULL,
        tags JSONB DEFAULT '{}'
      );

      CREATE TABLE health_checks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        service TEXT NOT NULL,
        status health_status NOT NULL,
        response_time_ms INTEGER,
        error_message TEXT,
        last_checked TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        environment environment_type NOT NULL
      );

      -- Add indexes
      CREATE INDEX idx_alerts_environment_severity ON alerts(environment, severity, resolved);
      CREATE INDEX idx_alerts_created_at ON alerts(created_at DESC);
      CREATE INDEX idx_metrics_name_timestamp ON metrics(name, timestamp DESC);
      CREATE INDEX idx_metrics_environment ON metrics(environment, timestamp DESC);
      CREATE INDEX idx_health_checks_service ON health_checks(service, last_checked DESC);

      -- Add RLS
      ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
      ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
      ALTER TABLE health_checks ENABLE ROW LEVEL SECURITY;
    `;
    down: `
      DROP TABLE IF EXISTS alerts CASCADE;
      DROP TABLE IF EXISTS metrics CASCADE;
      DROP TABLE IF EXISTS health_checks CASCADE;
    `;
  };
}

// Type Definitions for Custom PostgreSQL Types
export interface CustomTypes {
  environment_type: 'development' | 'staging' | 'production';
  deployment_status: 'pending' | 'building' | 'deploying' | 'success' | 'failed' | 'rolled_back';
  alert_severity: 'low' | 'medium' | 'high' | 'critical';
  health_status: 'healthy' | 'degraded' | 'unhealthy';
  security_scan_type: 'dependency' | 'sast' | 'container' | 'iac';
  scan_status: 'pending' | 'running' | 'completed' | 'failed';
  pipeline_status: 'idle' | 'running' | 'success' | 'failed' | 'cancelled';
  stage_status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
}

// Query Builders for Complex Operations
export interface QueryBuilders {
  // Get deployments with filtering
  getDeployments: (filters?: {
    environment?: string;
    status?: string[];
    limit?: number;
    offset?: number;
  }) => string;

  // Get monitoring dashboard data
  getMonitoringDashboard: (environment: string, timeframe: string) => string;

  // Get security scan summary
  getSecuritySummary: (environment: string, days: number) => string;
}

// Implementation of query builders
export const queryBuilders: QueryBuilders = {
  getDeployments: (filters = {}) => {
    let sql = `
      SELECT * FROM deployments
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.environment) {
      sql += ` AND environment = $${paramIndex}`;
      params.push(filters.environment);
      paramIndex++;
    }

    if (filters.status?.length) {
      sql += ` AND status = ANY($${paramIndex})`;
      params.push(filters.status);
      paramIndex++;
    }

    sql += ` ORDER BY created_at DESC`;

    if (filters.limit) {
      sql += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
      paramIndex++;
    }

    if (filters.offset) {
      sql += ` OFFSET $${paramIndex}`;
      params.push(filters.offset);
    }

    return sql;
  },

  getMonitoringDashboard: (environment, timeframe) => `
    WITH recent_metrics AS (
      SELECT
        name,
        AVG(value) as avg_value,
        MAX(value) as max_value,
        MIN(value) as min_value,
        COUNT(*) as count
      FROM metrics
      WHERE environment = $1
        AND timestamp >= NOW() - INTERVAL '${timeframe}'
      GROUP BY name
    ),
    active_alerts AS (
      SELECT COUNT(*) as alert_count
      FROM alerts
      WHERE environment = $1
        AND resolved = false
    ),
    health_summary AS (
      SELECT
        service,
        status,
        response_time_ms,
        last_checked
      FROM health_checks
      WHERE environment = $1
      ORDER BY last_checked DESC
    )
    SELECT
      (SELECT alert_count FROM active_alerts) as active_alerts,
      (SELECT json_agg(row_to_json(recent_metrics)) FROM recent_metrics) as metrics,
      (SELECT json_agg(row_to_json(health_summary)) FROM health_summary) as health_checks
  `,

  getSecuritySummary: (environment, days) => `
    SELECT
      type,
      COUNT(*) as total_scans,
      AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) as avg_duration_seconds,
      SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_scans,
      MAX(completed_at) as last_scan_date
    FROM security_scans
    WHERE environment = $1
      AND started_at >= NOW() - INTERVAL '${days} days'
    GROUP BY type
    ORDER BY type
  `,
};