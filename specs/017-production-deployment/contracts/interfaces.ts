// Production Deployment System - Interface Contracts
// Based on Hollywood implementation with Schwalbe adaptations

export type EnvironmentType = 'development' | 'staging' | 'production';
export type DeploymentStatus = 'pending' | 'building' | 'deploying' | 'success' | 'failed' | 'rolled_back';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type SecurityScanType = 'dependency' | 'sast' | 'container' | 'iac';

// Core Deployment Entity
export interface Deployment {
  id: string;
  environment: EnvironmentType;
  status: DeploymentStatus;
  version: string;
  commit_sha: string;
  build_time?: number;
  deploy_time?: number;
  created_at: string;
  completed_at?: string;
  triggered_by: string;
  logs_url?: string;
  artifacts_url?: string;
}

// Environment Configuration
export interface Environment {
  name: EnvironmentType;
  domain: string;
  config: EnvironmentConfig;
  secrets: Record<string, string>;
  features: Record<string, boolean>;
  limits: EnvironmentLimits;
}

// Environment Configuration Details
export interface EnvironmentConfig {
  database_url: string;
  redis_url?: string;
  supabase_url: string;
  supabase_anon_key: string;
  clerk_publishable_key: string;
  stripe_publishable_key: string;
  resend_api_key: string;
  google_translate_api_key?: string;
  sentry_dsn?: string;
}

// Environment Limits
export interface EnvironmentLimits {
  max_concurrent_users: number;
  api_rate_limit: number;
  storage_quota_gb: number;
  bandwidth_limit_gb: number;
}

// API Request/Response Contracts
export interface CreateDeploymentRequest {
  environment: EnvironmentType;
  version?: string;
  commit_sha?: string;
  triggered_by: string;
  force?: boolean;
}

export interface UpdateDeploymentRequest
  extends Partial<CreateDeploymentRequest> {
  status?: DeploymentStatus;
  logs_url?: string;
  artifacts_url?: string;
}

// Monitoring and Alerting
export interface Alert {
  id: string;
  type: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  environment: EnvironmentType;
  resolved: boolean;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Metric {
  name: string;
  value: number;
  timestamp: string;
  environment: EnvironmentType;
  tags?: Record<string, string>;
}

export interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  response_time_ms?: number;
  error_message?: string;
  last_checked: string;
}

// Security Scanning
export interface SecurityScan {
  id: string;
  type: SecurityScanType;
  environment: EnvironmentType;
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  findings: SecurityFinding[];
  summary: SecurityScanSummary;
}

export interface SecurityFinding {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  location?: string;
  cwe_id?: string;
  remediation?: string;
}

export interface SecurityScanSummary {
  total_findings: number;
  critical_findings: number;
  high_findings: number;
  medium_findings: number;
  low_findings: number;
  scan_duration_ms: number;
}

// Performance Monitoring
export interface PerformanceMetric {
  name: string;
  environment: EnvironmentType;
  timestamp: string;
  value: number;
  unit: string;
  tags?: Record<string, string>;
}

export interface LighthouseResult {
  environment: EnvironmentType;
  url: string;
  timestamp: string;
  scores: {
    performance: number;
    accessibility: number;
    best_practices: number;
    seo: number;
    pwa: number;
  };
  metrics: {
    first_contentful_paint: number;
    largest_contentful_paint: number;
    first_input_delay: number;
    cumulative_layout_shift: number;
  };
}

// CI/CD Pipeline
export interface Pipeline {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'success' | 'failed' | 'cancelled';
  stages: PipelineStage[];
  created_at: string;
  completed_at?: string;
  triggered_by: string;
  commit_sha: string;
}

export interface PipelineStage {
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  started_at?: string;
  completed_at?: string;
  duration_ms?: number;
  logs?: string[];
}

// Build Artifacts
export interface BuildArtifact {
  id: string;
  deployment_id: string;
  name: string;
  type: string;
  size_bytes: number;
  url: string;
  created_at: string;
  expires_at?: string;
}

// Rollback Operations
export interface RollbackRequest {
  deployment_id: string;
  target_version: string;
  reason: string;
  triggered_by: string;
}

export interface RollbackResult {
  id: string;
  original_deployment_id: string;
  rollback_deployment_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  error_message?: string;
}

// Service Layer Contracts
export interface DeploymentService {
  // CRUD operations
  create(request: CreateDeploymentRequest): Promise<Deployment>;
  getById(id: string): Promise<Deployment | null>;
  getByEnvironment(environment: EnvironmentType, limit?: number): Promise<Deployment[]>;
  update(id: string, updates: UpdateDeploymentRequest): Promise<Deployment>;
  rollback(request: RollbackRequest): Promise<RollbackResult>;

  // Business logic
  triggerDeployment(request: CreateDeploymentRequest): Promise<Deployment>;
  getDeploymentStatus(id: string): Promise<DeploymentStatus>;
  getDeploymentLogs(id: string): Promise<string[]>;
  validateDeployment(id: string): Promise<boolean>;
}

export interface MonitoringService {
  // Health checks
  getHealthStatus(): Promise<HealthCheck[]>;
  performHealthCheck(service: string): Promise<HealthCheck>;

  // Metrics
  recordMetric(metric: Metric): Promise<void>;
  getMetrics(name: string, timeframe: string): Promise<Metric[]>;
  getPerformanceMetrics(environment: EnvironmentType): Promise<PerformanceMetric[]>;

  // Alerts
  createAlert(alert: Omit<Alert, 'id' | 'created_at' | 'updated_at'>): Promise<Alert>;
  getActiveAlerts(): Promise<Alert[]>;
  resolveAlert(id: string): Promise<void>;
}

export interface SecurityService {
  // Scanning
  startSecurityScan(type: SecurityScanType, environment: EnvironmentType): Promise<SecurityScan>;
  getSecurityScan(id: string): Promise<SecurityScan>;
  getSecurityScans(environment?: EnvironmentType): Promise<SecurityScan[]>;

  // Findings
  getSecurityFindings(scanId: string): Promise<SecurityFinding[]>;
  updateSecurityFinding(id: string, updates: Partial<SecurityFinding>): Promise<void>;

  // Compliance
  checkCompliance(environment: EnvironmentType): Promise<SecurityScanSummary>;
  generateSecurityReport(environment: EnvironmentType, timeframe: string): Promise<string>;
}

export interface PipelineService {
  // Pipeline management
  createPipeline(name: string, config: any): Promise<Pipeline>;
  getPipeline(id: string): Promise<Pipeline>;
  triggerPipeline(id: string, commitSha: string): Promise<Pipeline>;
  cancelPipeline(id: string): Promise<void>;

  // Stage management
  updatePipelineStage(pipelineId: string, stageName: string, status: string): Promise<void>;
  getPipelineLogs(pipelineId: string): Promise<string[]>;
}

// Component Props Contracts
export interface DeploymentDashboardProps {
  environment: EnvironmentType;
  deployments: Deployment[];
  onCreateDeployment: (request: CreateDeploymentRequest) => void;
  onRollback: (deploymentId: string) => void;
  loading?: boolean;
}

export interface MonitoringDashboardProps {
  environment: EnvironmentType;
  healthChecks: HealthCheck[];
  alerts: Alert[];
  metrics: Metric[];
  onRefresh: () => void;
  onResolveAlert: (alertId: string) => void;
}

export interface SecurityDashboardProps {
  environment: EnvironmentType;
  scans: SecurityScan[];
  findings: SecurityFinding[];
  onStartScan: (type: SecurityScanType) => void;
  onViewFindings: (scanId: string) => void;
}

// Constants and Configuration
export const DEPLOYMENT_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
export const HEALTH_CHECK_INTERVAL_MS = 60 * 1000; // 1 minute
export const METRICS_RETENTION_DAYS = 30;
export const ALERT_RESOLUTION_TIMEOUT_HOURS = 24;

export const ENVIRONMENT_CONFIGS: Record<EnvironmentType, Partial<EnvironmentConfig>> = {
  development: {
    // Development-specific defaults
  },
  staging: {
    // Staging-specific defaults
  },
  production: {
    // Production-specific defaults
  },
};

// Type Guards
export function isEnvironmentType(value: string): value is EnvironmentType {
  return ['development', 'staging', 'production'].includes(value);
}

export function isDeploymentStatus(value: string): value is DeploymentStatus {
  return ['pending', 'building', 'deploying', 'success', 'failed', 'rolled_back'].includes(value);
}

export function isAlertSeverity(value: string): value is AlertSeverity {
  return ['low', 'medium', 'high', 'critical'].includes(value);
}

// Utility Types
export type DeploymentFilter = {
  environment?: EnvironmentType;
  status?: DeploymentStatus[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  triggered_by?: string;
};

export type AlertFilter = {
  environment?: EnvironmentType;
  severity?: AlertSeverity[];
  resolved?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
};

export type MetricFilter = {
  name?: string;
  environment?: EnvironmentType;
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: Record<string, string>;
};

// Forward compatibility types
export interface DeploymentMetadata {
  tags?: string[];
  categories?: string[];
  priority?: 'low' | 'medium' | 'high';
  custom_fields?: Record<string, any>;
}

export interface BulkOperationRequest {
  deploymentIds: string[];
  operation: 'cancel' | 'retry' | 'archive';
}

// Re-export for convenience
// Environment type defined inline above