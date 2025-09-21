
/**
 * Supplementary interface definitions for Phase 9-12 implementation
 * This file contains missing interfaces referenced by the new services
 */

// Common interfaces used across multiple services
export interface ValidationRule {
  message: string;
  rule: string;
  severity: 'critical' | 'high' | 'low' | 'medium';
}

export interface FilingRequirement {
  authority: string;
  deadline: string;
  frequency: string;
  mandatory: boolean;
}

export interface RetentionPolicy {
  action: 'archive' | 'delete' | 'review';
  legalBasis?: string;
  period: string;
}

export interface DocumentVersion {
  changes: string[];
  createdAt: string;
  createdBy: string;
  version: string;
}

// Business succession planning interfaces
export interface BusinessGovernance {
  boardOfDirectors: BoardMember[];
  bylaws: ByLaws;
  committees: Committee[];
  meetingRequirements: MeetingRequirement[];
  officers: Officer[];
  operatingAgreements: OperatingAgreement[];
  votingAgreements: VotingAgreement[];
}

export interface BoardMember {
  id: string;
  name: string;
  position: string;
  responsibilities: string[];
  term: string;
}

export interface Officer {
  id: string;
  name: string;
  responsibilities: string[];
  signatureAuthority: boolean;
  title: string;
}

export interface Committee {
  charter: string;
  id: string;
  members: string[];
  name: string;
  purpose: string;
}

export interface VotingAgreement {
  effectiveDate: string;
  id: string;
  parties: string[];
  restrictions: string[];
  terms: string[];
}

export interface OperatingAgreement {
  amendments: string[];
  effectiveDate: string;
  id: string;
  terms: string[];
  type: string;
}

export interface ByLaws {
  amendments: string[];
  lastUpdated: string;
  sections: string[];
}

export interface MeetingRequirement {
  frequency: string;
  notice: string;
  quorum: number;
  type: 'annual' | 'quarterly' | 'special';
}

export interface Encumbrance {
  amount?: number;
  creditor?: string;
  description: string;
  type: string;
}

export interface PersonalGuarantee {
  amount: number;
  guarantor: string;
  terms: string[];
}

export interface KeyRelationship {
  importance: 'critical' | 'high' | 'low' | 'medium';
  party: string;
  type: string;
}

export interface CompensationPackage {
  baseSalary: number;
  benefits: string[];
  bonus: number;
  equity: number;
}

export interface RetentionStrategy {
  cost: number;
  description: string;
  effectiveness: number;
  type: string;
}

export interface SuccessorCandidate {
  name: string;
  qualifications: string[];
  readiness: number;
  trainingNeeds: string[];
}

export interface DocumentationStatus {
  contactsShared: boolean;
  knowledgeTransferred: boolean;
  processesDocumented: boolean;
  systemsAccess: boolean;
}

// Additional interfaces for other services...
export interface AccelerationTrigger {
  event: string;
  percentage: number;
}

export interface PaymentTerms {
  amount: number;
  interest?: number;
  schedule: string;
}

export interface ResourceRequirement {
  cost?: number;
  description: string;
  type: string;
}

export interface SuccessionTimeline {
  criticalDates: string[];
  implementationPhase: string;
  milestones: string[];
  planningPhase: string;
  transitionPhase: string;
}

export interface BusinessValuation {
  appraiser?: string;
  assetValues: AssetValuation[];
  assumptions: string[];
  businessId: string;
  discounts: DiscountFactor[];
  enterpriseValue: number;
  equityValue: number;
  id: string;
  method: string;
  multiples: IndustryMultiple[];
  nextValuation: string;
  sensitivity: SensitivityAnalysis;
  validity: string;
  valuationDate: string;
}

export interface AssetValuation {
  assetId: string;
  currency: string;
  method: string;
  value: number;
}

export interface DiscountFactor {
  rate: number;
  reason: string;
  type: string;
}

export interface IndustryMultiple {
  metric: string;
  multiple: number;
}

export interface SensitivityAnalysis {
  scenarios: {
    name: string;
    probability: number;
    value: number;
  }[];
  variables: string[];
}

export interface TaxStrategy {
  currency: string;
  elections: string[];
  objectives: string[];
  planning: string[];
  projectedLiability: number;
  structures: string[];
}

export interface FinancingStrategy {
  contingencies: string[];
  currency: string;
  fundingSources: string[];
  paymentStructure: string[];
  totalFinancingNeeded: number;
}

export interface TransitionPlan {
  keyActivities: string[];
  phases: string[];
  retentionStrategies: string[];
  stakeholderCommunication: string[];
  trainingPrograms: string[];
}

// API Ecosystem interfaces
export interface JSONSchema {
  [key: string]: unknown;
  properties?: Record<string, unknown>;
  required?: string[];
  type: string;
}

export interface CachingConfiguration {
  enabled: boolean;
  headers: string[];
  strategy: string;
  ttl: number;
}

export interface EndpointMonitoring {
  alerting: {
    enabled: boolean;
    thresholds: Record<string, number>;
  };
  enabled: boolean;
  logging: {
    includePayload: boolean;
    level: string;
    retention: string;
  };
  metrics: string[];
}

export interface EndpointDocumentation {
  description: string;
  errors: unknown[];
  examples: unknown[];
  notes: string[];
  summary: string;
}

// Team Collaboration interfaces
export interface UserInfo {
  avatar: string;
  email: string;
  id: string;
  name: string;
  organization: string;
  title: string;
}

export interface AvailabilitySchedule {
  breaks: unknown[];
  timezone: string;
  vacations: unknown[];
  workingHours: {
    day: string;
    end: string;
    start: string;
  }[];
}

export interface ContributionStats {
  commentsAdded: number;
  documentsShared: number;
  hoursContributed: number;
  lastContribution: string;
  meetingsOrganized: number;
  reviewsCompleted: number;
  tasksCompleted: number;
}

export interface CollaborationMetrics {
  averageResponseTime: number;
  documentShares: number;
  meetingAttendance: number;
  taskCompletion: number;
}

export interface ProductivityMetrics {
  decisionsReached: number;
  documentsReviewed: number;
  meetingsHeld: number;
  tasksCompleted: number;
}

export interface EngagementMetrics {
  activeMembers: number;
  commentsAdded: number;
  hoursSpent: number;
  messagesSent: number;
}

// White Label Solution interfaces
export interface CustomFeatureSpecification {
  configuration: Record<string, unknown>;
  description: string;
  name: string;
  type: 'integration' | 'report' | 'ui_component' | 'workflow';
}

export interface DeploymentConfiguration {
  environment: 'development' | 'production' | 'staging';
  region: string;
}

export interface Deployment {
  backup: unknown;
  configuration: unknown;
  createdAt: string;
  endpoints: string[];
  environment: string;
  id: string;
  infrastructure: unknown;
  monitoring: unknown;
  partnerId: string;
  region: string;
  security: unknown;
  status: string;
  type: string;
  updatedAt: string;
}

export interface RevenueSharingSetup {
  configuration: unknown;
  createdAt: string;
  partnerId: string;
  payoutSchedule: unknown;
  reportingSystem: unknown;
  status: string;
  trackingSystem: unknown;
}

export interface IntegrationSettings {
  apis: {
    allowedEndpoints: string[];
    authentication: string;
    customEndpoints: unknown[];
    enabled: boolean;
    rateLimiting: unknown[];
    version: string;
  };
  customIntegrations: unknown[];
  dataSync: {
    enabled: boolean;
    mappings: unknown[];
    schedule: string;
  };
  sso: {
    configuration: Record<string, unknown>;
    enabled: boolean;
    groupMapping: unknown[];
    provider: string;
    userMapping: unknown[];
  };
  thirdPartyIntegrations: unknown[];
  webhooks: {
    authentication: Record<string, unknown>;
    enabled: boolean;
    endpoints: unknown[];
    retryPolicy: Record<string, unknown>;
  };
}

// Additional generic interfaces
export interface TimeRange {
  end: string;
  start: string;
}

export interface ReadinessScore {
  categories: Record<string, number>;
  overall: number;
}

export interface GapAnalysis {
  category: string;
  currentState: string;
  desiredState: string;
  effort: string;
  gap: string;
  priority: string;
}

export interface Recommendation {
  category: string;
  currency: string;
  description: string;
  estimatedCost: number;
  id: string;
  priority: string;
  resources: string[];
  timeline: string;
  title: string;
}

export interface ImplementationMilestone {
  dependencies: string[];
  description: string;
  id: string;
  name: string;
  responsible: string;
  status: string;
  targetDate: string;
}

export interface RiskAssessment {
  category: string;
  description: string;
  id: string;
  impact: string;
  mitigation: string[];
  owner: string;
  probability: string;
  reviewDate: string;
  severity: string;
}

export interface FinancialProjection {
  assumptions: string[];
  projections: {
    expenses: number[];
    netIncome: number[];
    revenue: number[];
  };
  scenario: string;
  timeframe: string;
}

export interface ReviewSchedule {
  agenda: string[];
  frequency: string;
  nextReview: string;
  participants: string[];
}

// Export all interfaces
export * from './phase9-12-interfaces';
