/**
 * Emergency Access Contract
 * Defines the interface for emergency access management and crisis protocols
 */

export interface EmergencyAccessContract {
  // Emergency request lifecycle
  requestEmergencyAccess(request: EmergencyRequestInput): Promise<EmergencyAccessRequest>;
  approveEmergencyAccess(requestId: string, approverId: string, approval: EmergencyApproval): Promise<EmergencyAccessGrant>;
  denyEmergencyAccess(requestId: string, approverId: string, denial: EmergencyDenial): Promise<void>;
  cancelEmergencyAccess(requestId: string, requesterId: string): Promise<void>;

  // Access verification and validation
  verifyEmergencyAccess(token: string, verificationData: VerificationInput): Promise<VerificationResult>;
  validateEmergencyToken(token: string): Promise<TokenValidation>;
  refreshEmergencyToken(tokenId: string): Promise<AccessToken>;

  // Access management
  grantTemporaryAccess(requestId: string, grant: AccessGrant): Promise<EmergencyAccessGrant>;
  revokeEmergencyAccess(tokenId: string, reason: RevocationReason): Promise<void>;
  extendEmergencyAccess(tokenId: string, extension: AccessExtension): Promise<EmergencyAccessGrant>;

  // Emergency access queries
  getEmergencyRequests(ownerId: string, filters?: EmergencyRequestFilters): Promise<EmergencyAccessRequest[]>;
  getEmergencyAccessHistory(userId: string, filters?: AccessHistoryFilters): Promise<EmergencyAccessEvent[]>;
  getActiveEmergencyAccess(ownerId: string): Promise<EmergencyAccessGrant[]>;

  // Emergency contact management
  getEmergencyContacts(ownerId: string): Promise<EmergencyContact[]>;
  updateEmergencyContacts(ownerId: string, contacts: EmergencyContactUpdate[]): Promise<EmergencyContact[]>;
  validateEmergencyContact(contactId: string): Promise<ContactValidation>;

  // Crisis protocol management
  activateCrisisProtocol(ownerId: string, protocol: CrisisProtocol): Promise<CrisisActivation>;
  deactivateCrisisProtocol(activationId: string): Promise<void>;
  getCrisisProtocolStatus(ownerId: string): Promise<CrisisStatus>;

  // Audit and compliance
  getEmergencyAuditLog(userId: string, timeRange: DateRange): Promise<EmergencyAuditEvent[]>;
  generateEmergencyReport(ownerId: string, reportType: EmergencyReportType): Promise<EmergencyReport>;
}

// Core data structures
export interface EmergencyAccessRequest {
  id: string;
  requesterId: string;
  ownerId: string;
  reason: string;
  emergencyLevel: EmergencyLevel;
  requestedDocuments: string[];
  requestedPermissions: EmergencyPermission[];
  verificationMethod: VerificationMethod;
  status: EmergencyRequestStatus;
  requestedAt: Date;
  expiresAt: Date;
  respondedAt?: Date;
  approverId?: string;
  approverName?: string;
  approverRelation?: string;
  responseMessage?: string;
  accessGrantedUntil?: Date;
  verificationToken?: string;
  verificationAttempts: number;
  maxVerificationAttempts: number;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmergencyRequestInput {
  ownerId: string;
  reason: string;
  emergencyLevel: EmergencyLevel;
  requestedDocuments?: string[];
  requestedPermissions?: EmergencyPermission[];
  verificationMethod?: VerificationMethod;
  expiresInHours?: number;
  metadata?: Record<string, any>;
}

export interface EmergencyApproval {
  accessDuration: number; // hours
  grantedPermissions: EmergencyPermission[];
  grantedDocuments: string[];
  approvalMessage?: string;
  conditions?: string[];
  monitoringEnabled: boolean;
}

export interface EmergencyDenial {
  reason: DenialReason;
  denialMessage?: string;
  alternativeActions?: string[];
  contactInformation?: ContactInfo;
}

export interface EmergencyAccessGrant {
  id: string;
  requestId: string;
  token: AccessToken;
  grantedPermissions: EmergencyPermission[];
  grantedDocuments: string[];
  grantedBy: string;
  grantedAt: Date;
  expiresAt: Date;
  conditions?: string[];
  monitoringEnabled: boolean;
  revocationReason?: RevocationReason;
  revokedAt?: Date;
  metadata: Record<string, any>;
}

export interface AccessToken {
  id: string;
  token: string;
  type: 'emergency_access';
  permissions: EmergencyPermission[];
  documentAccess: string[];
  issuedAt: Date;
  expiresAt: Date;
  issuer: string;
  subject: string;
  audience: string;
  scope: string[];
  metadata: Record<string, any>;
}

export interface VerificationInput {
  verificationCode?: string;
  biometricData?: BiometricData;
  locationData?: LocationData;
  deviceFingerprint?: string;
  additionalContext?: Record<string, any>;
}

export interface VerificationResult {
  success: boolean;
  token?: AccessToken;
  failureReason?: VerificationFailure;
  attemptsRemaining?: number;
  nextVerificationMethod?: VerificationMethod;
  securityAlerts?: SecurityAlert[];
}

export interface TokenValidation {
  valid: boolean;
  token?: AccessToken;
  expired: boolean;
  revoked: boolean;
  permissions: EmergencyPermission[];
  timeRemaining: number; // seconds
  warnings?: string[];
}

export interface AccessGrant {
  duration: number; // hours
  permissions: EmergencyPermission[];
  documents: string[];
  conditions?: string[];
  monitoringLevel: MonitoringLevel;
}

export interface AccessExtension {
  additionalHours: number;
  reason: string;
  approvedBy: string;
  newConditions?: string[];
}

export interface EmergencyRequestFilters {
  status?: EmergencyRequestStatus[];
  requesterId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  emergencyLevel?: EmergencyLevel[];
  limit?: number;
  offset?: number;
}

export interface AccessHistoryFilters {
  dateFrom?: Date;
  dateTo?: Date;
  action?: EmergencyAction[];
  limit?: number;
  offset?: number;
}

export interface EmergencyAccessEvent {
  id: string;
  userId: string;
  action: EmergencyAction;
  targetId: string;
  targetType: 'request' | 'grant' | 'token';
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  location?: LocationData;
  timestamp: Date;
  securityContext: SecurityContext;
}

// Emergency contact structures
export interface EmergencyContact {
  id: string;
  familyMemberId: string;
  priority: number;
  verificationStatus: ContactVerificationStatus;
  lastVerifiedAt?: Date;
  verificationMethod: VerificationMethod;
  contactMethods: ContactMethod[];
  availability: AvailabilitySchedule;
  languages: string[];
  specialInstructions?: string;
  trustLevel: TrustLevel;
  relationshipContext: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmergencyContactUpdate {
  familyMemberId: string;
  priority?: number;
  contactMethods?: ContactMethod[];
  availability?: AvailabilitySchedule;
  languages?: string[];
  specialInstructions?: string;
}

export interface ContactValidation {
  valid: boolean;
  contact: EmergencyContact;
  issues: ContactValidationIssue[];
  recommendations: string[];
  lastValidationDate: Date;
}

export interface ContactValidationIssue {
  type: 'unreachable' | 'outdated' | 'unverified' | 'capacity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  resolutionSteps: string[];
}

// Crisis protocol structures
export interface CrisisProtocol {
  id: string;
  name: string;
  description: string;
  triggerConditions: CrisisTrigger[];
  automaticActions: CrisisAction[];
  notificationTargets: NotificationTarget[];
  escalationProcedure: EscalationStep[];
  deactivationConditions: CrisisTrigger[];
  monitoringRequirements: MonitoringRequirement[];
  legalCompliance: LegalRequirement[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CrisisActivation {
  id: string;
  protocolId: string;
  ownerId: string;
  triggeredBy: string;
  triggerCondition: CrisisTrigger;
  activatedAt: Date;
  status: CrisisStatusType;
  activeActions: CrisisAction[];
  notificationsSent: NotificationRecord[];
  monitoringActive: boolean;
  deactivationReason?: string;
  deactivatedAt?: Date;
}

export interface CrisisStatus {
  activeProtocols: CrisisActivation[];
  availableProtocols: CrisisProtocol[];
  systemHealth: SystemHealth;
  lastCheck: Date;
}

// Audit and reporting structures
export interface EmergencyAuditEvent {
  id: string;
  userId: string;
  eventType: AuditEventType;
  resourceType: string;
  resourceId: string;
  action: string;
  details: Record<string, any>;
  severity: AuditSeverity;
  complianceFlags: ComplianceFlag[];
  timestamp: Date;
  actorContext: ActorContext;
}

export interface EmergencyReport {
  id: string;
  ownerId: string;
  reportType: EmergencyReportType;
  timeRange: DateRange;
  generatedAt: Date;
  summary: ReportSummary;
  details: ReportDetail[];
  recommendations: ReportRecommendation[];
  complianceStatus: ComplianceStatus;
}

export type ComplianceStatus = 'compliant' | 'non_compliant' | 'pending_review' | 'not_applicable';

export interface ReportSummary {
  totalRequests: number;
  approvedRequests: number;
  deniedRequests: number;
  activeAccess: number;
  averageResponseTime: number;
  securityIncidents: number;
  complianceViolations: number;
}

export interface ReportDetail {
  date: Date;
  requests: number;
  approvals: number;
  denials: number;
  averageProcessingTime: number;
  topReasons: ReasonCount[];
}

export interface ReportRecommendation {
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'security' | 'process' | 'training' | 'technical';
  title: string;
  description: string;
  impact: string;
  implementationEffort: 'low' | 'medium' | 'high';
  timeline: string;
}

// Supporting types and enums
export type EmergencyLevel = 'low' | 'medium' | 'high' | 'critical';

export type EmergencyRequestStatus = 'pending' | 'approved' | 'denied' | 'expired' | 'cancelled';

export type EmergencyPermission =
  | 'view_documents'
  | 'download_documents'
  | 'view_will'
  | 'contact_emergency_services'
  | 'manage_finances'
  | 'access_medical_info'
  | 'communicate_with_family';

export type VerificationMethod = 'email' | 'sms' | 'phone' | 'biometric' | 'hardware_token';

export type VerificationFailure =
  | 'invalid_code'
  | 'expired_token'
  | 'max_attempts_exceeded'
  | 'security_violation'
  | 'network_error';

export type DenialReason =
  | 'insufficient_information'
  | 'security_concern'
  | 'policy_violation'
  | 'contact_unavailable'
  | 'alternative_solution_available';

export type RevocationReason =
  | 'normal_expiration'
  | 'manual_revocation'
  | 'security_breach'
  | 'policy_violation'
  | 'emergency_resolved';

export type MonitoringLevel = 'none' | 'basic' | 'detailed' | 'comprehensive';

export type EmergencyAction =
  | 'request_created'
  | 'request_approved'
  | 'request_denied'
  | 'access_granted'
  | 'access_revoked'
  | 'token_verified'
  | 'contact_notified';

export type ContactVerificationStatus = 'unverified' | 'pending' | 'verified' | 'failed' | 'expired';

export type TrustLevel = 'low' | 'medium' | 'high' | 'maximum';

export type CrisisStatusType = 'active' | 'deactivating' | 'inactive';

export type AuditEventType = 'access' | 'modification' | 'security' | 'compliance';

export type AuditSeverity = 'low' | 'medium' | 'high' | 'critical';

export type EmergencyReportType = 'summary' | 'detailed' | 'compliance' | 'security';

export interface CrisisTrigger {
  type: 'time_inactive' | 'failed_login_attempts' | 'location_change' | 'unusual_activity';
  threshold: number;
  timeWindow?: number; // minutes
  conditions?: Record<string, any>;
}

export interface CrisisAction {
  type: 'notify_contacts' | 'grant_access' | 'activate_monitoring' | 'send_alert';
  priority: 'low' | 'medium' | 'high' | 'critical';
  parameters: Record<string, any>;
  timeout?: number; // minutes
}

export interface NotificationTarget {
  type: 'email' | 'sms' | 'phone' | 'push';
  recipientId: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  template: string;
}

export interface EscalationStep {
  delay: number; // minutes
  action: CrisisAction;
  conditions?: CrisisTrigger[];
}

export interface MonitoringRequirement {
  type: 'activity' | 'location' | 'device' | 'network';
  frequency: number; // minutes
  thresholds: Record<string, number>;
}

export interface LegalRequirement {
  jurisdiction: string;
  requirement: string;
  complianceDeadline?: Date;
  documentationRequired: string[];
}

export interface ContactMethod {
  type: 'email' | 'phone' | 'sms' | 'app';
  value: string;
  verified: boolean;
  priority: number;
}

export interface AvailabilitySchedule {
  timezone: string;
  availableHours: TimeRange[];
  unavailableDates: DateRange[];
  emergencyOverride: boolean;
}

export interface TimeRange {
  start: string; // HH:MM format
  end: string; // HH:MM format
  daysOfWeek: number[]; // 0-6, Sunday = 0
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface BiometricData {
  type: 'fingerprint' | 'face' | 'voice';
  data: string; // base64 encoded
  confidence: number;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
}

export interface SecurityAlert {
  type: 'suspicious_location' | 'unusual_timing' | 'device_mismatch';
  severity: 'low' | 'medium' | 'high';
  description: string;
  recommendedAction: string;
}

export interface SecurityContext {
  ipAddress: string;
  userAgent: string;
  location?: LocationData;
  deviceFingerprint: string;
  sessionId: string;
  riskScore: number;
}

export interface NotificationRecord {
  id: string;
  targetId: string;
  method: string;
  status: 'sent' | 'delivered' | 'failed';
  sentAt: Date;
  deliveredAt?: Date;
  failureReason?: string;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  checks: HealthCheck[];
  lastUpdated: Date;
}

export interface HealthCheck {
  component: string;
  status: 'pass' | 'fail' | 'warn';
  message?: string;
  responseTime?: number;
  lastChecked: Date;
}

export interface ComplianceFlag {
  type: 'gdpr' | 'hipaa' | 'sox' | 'custom';
  requirement: string;
  status: 'compliant' | 'non_compliant' | 'pending_review';
  details?: string;
}

export interface ActorContext {
  userId: string;
  role: string;
  department?: string;
  clearanceLevel: string;
  authenticationMethod: string;
}

export interface ReasonCount {
  reason: string;
  count: number;
  percentage: number;
}

export interface ContactInfo {
  name: string;
  phone?: string;
  email?: string;
  availableHours?: string;
}

// Contract implementation requirements
export interface EmergencyAccessImplementation extends EmergencyAccessContract {
  // Health monitoring
  getServiceHealth(): Promise<SystemHealth>;

  // Background job management
  queueEmergencyNotification(requestId: string): Promise<string>;
  getNotificationStatus(jobId: string): Promise<NotificationStatus>;

  // Security monitoring
  reportSecurityIncident(incident: SecurityIncident): Promise<void>;
  getSecurityAlerts(userId: string): Promise<SecurityAlert[]>;

  // Configuration management
  updateEmergencySettings(ownerId: string, settings: EmergencySettings): Promise<void>;
  getEmergencySettings(ownerId: string): Promise<EmergencySettings>;
}

export interface NotificationStatus {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: any;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SecurityIncident {
  type: 'unauthorized_access' | 'suspicious_activity' | 'policy_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedUsers: string[];
  evidence: Record<string, any>;
  recommendedActions: string[];
  reportedAt: Date;
}

export interface EmergencySettings {
  defaultAccessDuration: number;
  maxVerificationAttempts: number;
  allowedVerificationMethods: VerificationMethod[];
  automaticApprovalThreshold: EmergencyLevel[];
  notificationPreferences: NotificationPreference[];
  crisisProtocolEnabled: boolean;
  monitoringLevel: MonitoringLevel;
  complianceRequirements: ComplianceRequirement[];
}

export interface NotificationPreference {
  eventType: string;
  methods: ('email' | 'sms' | 'push')[];
  quietHours?: TimeRange;
}

export interface ComplianceRequirement {
  type: string;
  enabled: boolean;
  parameters: Record<string, any>;
}

// Type guards for validation
export const isValidEmergencyLevel = (level: string): level is EmergencyLevel => {
  return ['low', 'medium', 'high', 'critical'].includes(level);
};

export const isValidEmergencyRequestStatus = (status: string): status is EmergencyRequestStatus => {
  return ['pending', 'approved', 'denied', 'expired', 'cancelled'].includes(status);
};

export const isValidVerificationMethod = (method: string): method is VerificationMethod => {
  return ['email', 'sms', 'phone', 'biometric', 'hardware_token'].includes(method);
};

export const isValidEmergencyPermission = (permission: string): permission is EmergencyPermission => {
  return ['view_documents', 'download_documents', 'view_will', 'contact_emergency_services',
          'manage_finances', 'access_medical_info', 'communicate_with_family'].includes(permission);
};

// Utility functions
export const calculateEmergencyRiskScore = (request: EmergencyAccessRequest): number => {
  let score = 0;

  // Base score by emergency level
  const levelScores = { low: 10, medium: 25, high: 50, critical: 100 };
  score += levelScores[request.emergencyLevel];

  // Adjust for verification attempts
  if (request.verificationAttempts > 0) {
    score += request.verificationAttempts * 5;
  }

  // Adjust for time sensitivity
  const hoursSinceRequest = (Date.now() - request.requestedAt.getTime()) / (1000 * 60 * 60);
  if (hoursSinceRequest > 24) {
    score += 20; // Increased urgency over time
  }

  return Math.min(100, score);
};

export const validateEmergencyRequest = (request: EmergencyRequestInput): ValidationResult => {
  const errors: string[] = [];

  if (!request.reason || request.reason.trim().length < 10) {
    errors.push('Reason must be at least 10 characters long');
  }

  if (!isValidEmergencyLevel(request.emergencyLevel)) {
    errors.push('Invalid emergency level');
  }

  if (request.expiresInHours && (request.expiresInHours < 1 || request.expiresInHours > 168)) {
    errors.push('Expiration time must be between 1 and 168 hours');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}