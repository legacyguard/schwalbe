// Auth + RLS Baseline: Security Contracts
// Defines the interfaces and contracts for security operations

/**
 * Security context interface
 * Represents the current security context
 */
export interface SecurityContext {
  /** Current user ID */
  userId?: string;
  /** User roles */
  roles: string[];
  /** User permissions */
  permissions: string[];
  /** Session ID */
  sessionId?: string;
  /** IP address */
  ipAddress?: string;
  /** User agent */
  userAgent?: string;
  /** Security level */
  level: SecurityLevel;
}

/**
 * Security level enumeration
 */
export enum SecurityLevel {
  PUBLIC = 'public',
  AUTHENTICATED = 'authenticated',
  VERIFIED = 'verified',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

/**
 * Security policy interface
 * Defines security policies and rules
 */
export interface SecurityPolicy {
  /** Policy name */
  name: string;
  /** Policy description */
  description: string;
  /** Security level required */
  level: SecurityLevel;
  /** Required permissions */
  permissions: string[];
  /** Resource pattern */
  resource: string;
  /** Action pattern */
  action: string;
  /** Policy conditions */
  conditions?: SecurityCondition[];
}

/**
 * Security condition interface
 */
export interface SecurityCondition {
  /** Condition type */
  type: 'user' | 'role' | 'permission' | 'ip' | 'time' | 'custom';
  /** Condition operator */
  operator: 'eq' | 'ne' | 'in' | 'nin' | 'gt' | 'lt' | 'gte' | 'lte' | 'regex' | 'func';
  /** Condition value */
  value: any;
  /** Condition field */
  field?: string;
}

/**
 * Access control decision
 */
export enum AccessDecision {
  ALLOW = 'allow',
  DENY = 'deny',
  ABSTAIN = 'abstain',
}

/**
 * Access control result interface
 */
export interface AccessControlResult {
  /** Access decision */
  decision: AccessDecision;
  /** Decision reason */
  reason?: string;
  /** Applicable policies */
  policies: string[];
  /** Security context */
  context: SecurityContext;
}

/**
 * Security audit event interface
 */
export interface SecurityEvent {
  /** Event ID */
  id: string;
  /** Event type */
  type: SecurityEventType;
  /** Event severity */
  severity: SecurityEventSeverity;
  /** User ID associated with event */
  userId?: string;
  /** Session ID */
  sessionId?: string;
  /** Resource affected */
  resource?: string;
  /** Action performed */
  action?: string;
  /** Event timestamp */
  timestamp: Date;
  /** IP address */
  ipAddress?: string;
  /** User agent */
  userAgent?: string;
  /** Event details */
  details: Record<string, any>;
  /** Risk score */
  riskScore?: number;
}

/**
 * Security event types
 */
export enum SecurityEventType {
  // Authentication events
  AUTH_SUCCESS = 'auth_success',
  AUTH_FAILURE = 'auth_failure',
  AUTH_LOGOUT = 'auth_logout',
  AUTH_SESSION_EXPIRED = 'auth_session_expired',

  // Authorization events
  ACCESS_DENIED = 'access_denied',
  ACCESS_GRANTED = 'access_granted',
  PERMISSION_CHANGE = 'permission_change',

  // Security violations
  BRUTE_FORCE_DETECTED = 'brute_force_detected',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  POLICY_VIOLATION = 'policy_violation',

  // Data protection
  DATA_ACCESS = 'data_access',
  DATA_MODIFICATION = 'data_modification',
  SENSITIVE_DATA_ACCESS = 'sensitive_data_access',

  // System security
  SECURITY_CONFIG_CHANGE = 'security_config_change',
  ENCRYPTION_KEY_ROTATION = 'encryption_key_rotation',
  BACKUP_CREATED = 'backup_created',
}

/**
 * Security event severity levels
 */
export enum SecurityEventSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Security service interface
 * Defines the contract for security operations
 */
export interface SecurityService {
  /** Evaluate access control */
  evaluateAccess(
    context: SecurityContext,
    resource: string,
    action: string
  ): Promise<AccessControlResult>;

  /** Check user permissions */
  hasPermission(
    userId: string,
    permission: string,
    resource?: string
  ): Promise<boolean>;

  /** Check user role */
  hasRole(userId: string, role: string): Promise<boolean>;

  /** Get user security context */
  getSecurityContext(userId: string): Promise<SecurityContext>;

  /** Log security event */
  logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): Promise<void>;

  /** Get security events */
  getSecurityEvents(options?: {
    userId?: string;
    type?: SecurityEventType;
    severity?: SecurityEventSeverity;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<SecurityEvent[]>;

  /** Validate security policies */
  validatePolicies(): Promise<{
    valid: boolean;
    violations: string[];
    recommendations: string[];
  }>;

  /** Perform security health check */
  healthCheck(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    metrics: Record<string, any>;
  }>;
}

/**
 * Encryption service interface
 */
export interface EncryptionService {
  /** Encrypt data */
  encrypt(data: string | Buffer, keyId?: string): Promise<{
    encrypted: string;
    keyId: string;
    algorithm: string;
  }>;

  /** Decrypt data */
  decrypt(encryptedData: string, keyId: string): Promise<string | Buffer>;

  /** Generate encryption key */
  generateKey(options?: {
    algorithm?: string;
    keySize?: number;
    purpose?: string;
  }): Promise<{
    keyId: string;
    publicKey?: string;
    privateKey?: string;
  }>;

  /** Rotate encryption keys */
  rotateKeys(keyId: string): Promise<{
    newKeyId: string;
    migrationComplete: boolean;
  }>;

  /** Get key information */
  getKeyInfo(keyId: string): Promise<{
    keyId: string;
    algorithm: string;
    createdAt: Date;
    expiresAt?: Date;
    status: 'active' | 'rotated' | 'expired';
  }>;
}

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  /** Rate limit key */
  key: string;
  /** Time window in seconds */
  window: number;
  /** Maximum requests per window */
  maxRequests: number;
  /** Block duration in seconds */
  blockDuration?: number;
}

/**
 * Rate limiting result
 */
export interface RateLimitResult {
  /** Whether request is allowed */
  allowed: boolean;
  /** Remaining requests in current window */
  remaining: number;
  /** Reset time for current window */
  resetTime: Date;
  /** Whether user is currently blocked */
  blocked: boolean;
  /** Block expiry time */
  blockExpiresAt?: Date;
}

/**
 * Rate limiting service interface
 */
export interface RateLimitService {
  /** Check rate limit */
  checkLimit(
    identifier: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult>;

  /** Reset rate limit for identifier */
  resetLimit(identifier: string, key: string): Promise<void>;

  /** Get rate limit status */
  getStatus(identifier: string, key: string): Promise<RateLimitResult | null>;

  /** Configure rate limits */
  configureLimits(configs: RateLimitConfig[]): Promise<void>;
}

/**
 * Security headers configuration
 */
export interface SecurityHeadersConfig {
  /** Content Security Policy */
  csp?: {
    defaultSrc: string[];
    scriptSrc: string[];
    styleSrc: string[];
    imgSrc: string[];
    connectSrc: string[];
    fontSrc: string[];
    objectSrc: string[];
    mediaSrc: string[];
    frameSrc: string[];
  };
  /** HTTP Strict Transport Security */
  hsts?: {
    maxAge: number;
    includeSubDomains: boolean;
    preload: boolean;
  };
  /** X-Frame-Options */
  frameOptions?: 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM';
  /** X-Content-Type-Options */
  contentTypeOptions?: 'nosniff';
  /** Referrer-Policy */
  referrerPolicy?: string;
  /** Permissions-Policy */
  permissionsPolicy?: Record<string, string[]>;
}

/**
 * Security middleware configuration
 */
export interface SecurityMiddlewareConfig {
  /** Rate limiting enabled */
  rateLimiting: boolean;
  /** Security headers enabled */
  securityHeaders: boolean;
  /** CSRF protection enabled */
  csrfProtection: boolean;
  /** XSS protection enabled */
  xssProtection: boolean;
  /** HTTPS enforcement */
  httpsEnforcement: boolean;
  /** Security headers config */
  headers: SecurityHeadersConfig;
  /** Rate limit configs */
  rateLimits: RateLimitConfig[];
}

/**
 * Security audit result
 */
export interface SecurityAuditResult {
  /** Audit timestamp */
  timestamp: Date;
  /** Overall security score */
  score: number;
  /** Critical issues found */
  criticalIssues: string[];
  /** High priority issues */
  highIssues: string[];
  /** Medium priority issues */
  mediumIssues: string[];
  /** Low priority issues */
  lowIssues: string[];
  /** Recommendations */
  recommendations: string[];
  /** Compliance status */
  compliance: {
    gdpr: boolean;
    sox: boolean;
    pci: boolean;
    hipaa: boolean;
  };
}

/**
 * Security monitoring service interface
 */
export interface SecurityMonitoringService {
  /** Log security event */
  logEvent(event: SecurityEvent): Promise<void>;

  /** Get security metrics */
  getMetrics(options?: {
    startDate?: Date;
    endDate?: Date;
    eventTypes?: SecurityEventType[];
    severities?: SecurityEventSeverity[];
  }): Promise<{
    totalEvents: number;
    eventsByType: Record<SecurityEventType, number>;
    eventsBySeverity: Record<SecurityEventSeverity, number>;
    topResources: Array<{ resource: string; count: number }>;
    topUsers: Array<{ userId: string; count: number }>;
    riskScore: number;
  }>;

  /** Perform security audit */
  performAudit(): Promise<SecurityAuditResult>;

  /** Get security alerts */
  getAlerts(options?: {
    acknowledged?: boolean;
    severity?: SecurityEventSeverity;
    limit?: number;
  }): Promise<Array<SecurityEvent & { acknowledged: boolean; acknowledgedAt?: Date; acknowledgedBy?: string }>>;

  /** Acknowledge security alert */
  acknowledgeAlert(alertId: string, userId: string): Promise<void>;
}