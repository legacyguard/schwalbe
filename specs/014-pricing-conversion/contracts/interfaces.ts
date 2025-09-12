/**
 * API Interfaces and Types for Pricing & Conversion System
 * 
 * This file contains TypeScript interfaces for API requests, responses,
 * service contracts, and event types used throughout the pricing system.
 */

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface CreateSubscriptionRequest {
  planId: string;
  billingCycle: BillingCycle;
  paymentMethodId?: string;
  trialDays?: number;
}

export interface CreateSubscriptionResponse {
  subscription: UserSubscription;
  checkoutUrl?: string;
  clientSecret?: string;
}

export interface UpdateSubscriptionRequest {
  planId?: string;
  billingCycle?: BillingCycle;
  prorationBehavior?: 'create_prorations' | 'none' | 'always_invoice';
}

export interface CreateCheckoutRequest {
  planId: string;
  billingCycle: BillingCycle;
  successUrl?: string;
  cancelUrl?: string;
  trialDays?: number;
}

export interface CreateCheckoutResponse {
  checkoutUrl: string;
  sessionId: string;
}

export interface AddPaymentMethodRequest {
  stripePaymentMethodId: string;
  isDefault?: boolean;
}

export interface CreateExperimentRequest {
  name: string;
  description?: string;
  variants: ExperimentVariant[];
  successMetrics: string[];
  trafficAllocation?: number;
}

export interface ExperimentAssignmentResponse {
  experimentId: string;
  variantName: string;
  isAssigned: boolean;
}

export interface ConversionFunnelResponse {
  steps: FunnelStepData[];
  totalVisitors: number;
  totalConversions: number;
  overallConversionRate: number;
}

export interface FunnelStepData {
  step: FunnelStep;
  visitors: number;
  conversions: number;
  conversionRate: number;
}

export interface RevenueAnalyticsResponse {
  analytics: SubscriptionAnalytics[];
  summary: {
    totalRevenue: number;
    totalMRR: number;
    newSubscriptions: number;
    cancellations: number;
  };
}

// ============================================================================
// Service Layer Interfaces
// ============================================================================

export interface SubscriptionService {
  getCurrentSubscription(): Promise<UserSubscription | null>;
  createSubscription(params: CreateSubscriptionRequest): Promise<CreateSubscriptionResponse>;
  updateSubscription(subscriptionId: string, params: UpdateSubscriptionRequest): Promise<UserSubscription>;
  cancelSubscription(subscriptionId: string, cancelAtPeriodEnd?: boolean): Promise<UserSubscription>;
  getSubscriptionHistory(userId: string): Promise<UserSubscription[]>;
  getSubscriptionById(subscriptionId: string): Promise<UserSubscription | null>;
}

export interface PricingService {
  getPlans(activeOnly?: boolean): Promise<SubscriptionPlan[]>;
  getPlanById(planId: string): Promise<SubscriptionPlan | null>;
  getPlanByName(planName: string): Promise<SubscriptionPlan | null>;
  comparePlans(planIds: string[]): Promise<PlanComparison>;
  calculatePricing(planId: string, billingCycle: BillingCycle, discounts?: PricingDiscount[]): Promise<PricingCalculation>;
  validatePlanAccess(userId: string, planId: string): Promise<boolean>;
}

export interface UsageService {
  getCurrentUsage(userId: string): Promise<UserUsage | null>;
  checkUsageLimit(userId: string, usageType: UsageType, increment?: number): Promise<UsageLimitCheck>;
  incrementUsage(userId: string, usageType: UsageType, amount?: number): Promise<boolean>;
  getUsagePercentage(userId: string, usageType: UsageType): Promise<number>;
  resetMonthlyUsage(): Promise<void>;
  getUsageHistory(userId: string, startDate?: string, endDate?: string): Promise<UsageHistory[]>;
}

export interface PaymentService {
  createCheckoutSession(params: CreateCheckoutRequest): Promise<CreateCheckoutResponse>;
  createPaymentIntent(amount: number, currency: string): Promise<PaymentIntent>;
  getPaymentMethods(userId: string): Promise<PaymentMethod[]>;
  addPaymentMethod(userId: string, params: AddPaymentMethodRequest): Promise<PaymentMethod>;
  removePaymentMethod(paymentMethodId: string): Promise<boolean>;
  setDefaultPaymentMethod(paymentMethodId: string): Promise<boolean>;
  processWebhook(payload: string, signature: string): Promise<void>;
}

export interface ExperimentService {
  createExperiment(params: CreateExperimentRequest): Promise<PricingExperiment>;
  getExperiment(experimentId: string): Promise<PricingExperiment | null>;
  getExperiments(status?: ExperimentStatus): Promise<PricingExperiment[]>;
  assignUserToExperiment(userId: string, experimentId: string): Promise<ExperimentAssignmentResponse>;
  getExperimentResults(experimentId: string): Promise<ExperimentResults>;
  updateExperiment(experimentId: string, updates: Partial<PricingExperiment>): Promise<PricingExperiment>;
  deleteExperiment(experimentId: string): Promise<boolean>;
}

export interface AnalyticsService {
  trackConversionEvent(event: ConversionEvent): Promise<void>;
  getConversionFunnel(startDate: string, endDate: string, experimentId?: string): Promise<ConversionFunnelResponse>;
  getRevenueAnalytics(startDate: string, endDate: string, planName?: string, groupBy?: string): Promise<RevenueAnalyticsResponse>;
  getUsageAnalytics(userId: string, startDate?: string, endDate?: string): Promise<UsageAnalytics>;
  getExperimentAnalytics(experimentId: string): Promise<ExperimentAnalytics>;
  generateReport(reportType: ReportType, params: ReportParams): Promise<Report>;
}

// ============================================================================
// Event Types
// ============================================================================

export interface ConversionEvent {
  userId?: string;
  sessionId?: string;
  eventType: ConversionEventType;
  eventData: Record<string, any>;
  experimentId?: string;
  variantName?: string;
  timestamp?: string;
}

export interface SubscriptionEvent {
  type: 'subscription_created' | 'subscription_updated' | 'subscription_canceled' | 'subscription_renewed';
  subscription: UserSubscription;
  previousSubscription?: UserSubscription;
  timestamp: string;
}

export interface PaymentEvent {
  type: 'payment_succeeded' | 'payment_failed' | 'payment_refunded';
  paymentIntent: PaymentIntent;
  subscription?: UserSubscription;
  timestamp: string;
}

export interface UsageEvent {
  type: 'usage_limit_reached' | 'usage_limit_warning' | 'usage_reset';
  userId: string;
  usageType: UsageType;
  currentUsage: number;
  limit: number;
  timestamp: string;
}

// ============================================================================
// Webhook Types
// ============================================================================

export interface StripeWebhookEvent {
  id: string;
  object: string;
  type: string;
  data: {
    object: any;
    previous_attributes?: any;
  };
  created: number;
  livemode: boolean;
  pending_webhooks: number;
  request: {
    id: string;
    idempotency_key?: string;
  };
}

export interface WebhookHandler {
  handle(event: StripeWebhookEvent): Promise<void>;
  canHandle(eventType: string): boolean;
}

// ============================================================================
// Analytics and Reporting Types
// ============================================================================

export interface UsageAnalytics {
  userId: string;
  planName: string;
  documentCount: number;
  storageUsedMb: number;
  timeCapsuleCount: number;
  aiRequestsThisMonth: number;
  usagePercentage: {
    documents: number;
    storage: number;
    timeCapsules: number;
    aiRequests: number;
  };
  lastActivity: string;
}

export interface ExperimentAnalytics {
  experimentId: string;
  name: string;
  status: ExperimentStatus;
  startDate: string;
  endDate?: string;
  variants: VariantAnalytics[];
  overallMetrics: {
    totalVisitors: number;
    totalConversions: number;
    conversionRate: number;
    confidence: number;
  };
  statisticalSignificance: boolean;
}

export interface VariantAnalytics {
  name: string;
  visitors: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  averageOrderValue: number;
}

export interface Report {
  id: string;
  type: ReportType;
  title: string;
  description?: string;
  data: any;
  generatedAt: string;
  generatedBy: string;
  parameters: ReportParams;
}

export interface ReportParams {
  startDate: string;
  endDate: string;
  planName?: string;
  experimentId?: string;
  groupBy?: 'day' | 'week' | 'month';
  format?: 'json' | 'csv' | 'pdf';
}

// ============================================================================
// Validation and Error Types
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

export interface APIError {
  code: string;
  message: string;
  details?: ValidationError[];
  timestamp: string;
  requestId?: string;
}

export interface ServiceError extends Error {
  code: string;
  statusCode: number;
  details?: any;
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface PricingConfig {
  plans: SubscriptionPlan[];
  features: PlanFeatures;
  limits: PlanLimits;
  discounts: PricingDiscount[];
  experiments: PricingExperiment[];
}

export interface PricingDiscount {
  id: string;
  name: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  applicablePlans: string[];
  startDate: string;
  endDate: string;
  maxUses?: number;
  usedCount: number;
  isActive: boolean;
}

export interface ExperimentConfig {
  enabled: boolean;
  defaultTrafficAllocation: number;
  minSampleSize: number;
  confidenceLevel: number;
  maxConcurrentExperiments: number;
}

export interface AnalyticsConfig {
  trackingEnabled: boolean;
  dataRetentionDays: number;
  anonymizeData: boolean;
  customEvents: string[];
  reportGeneration: {
    enabled: boolean;
    maxReportsPerUser: number;
    supportedFormats: string[];
  };
}

// ============================================================================
// Utility Types
// ============================================================================

export interface PaginationParams {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

export interface SearchParams {
  query?: string;
  filters?: Record<string, any>;
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  pagination?: PaginationParams;
}

export interface FilterOptions {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'like' | 'ilike';
  value: any;
}

// ============================================================================
// Cache Types
// ============================================================================

export interface CacheConfig {
  ttl: number; // time to live in seconds
  key: string;
  tags?: string[];
}

export interface CacheEntry<T> {
  key: string;
  value: T;
  expiresAt: number;
  tags: string[];
}

export interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  deleteByTag(tag: string): Promise<void>;
  clear(): Promise<void>;
}

// ============================================================================
// Logging Types
// ============================================================================

export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  userId?: string;
  requestId?: string;
  service?: string;
}

export interface Logger {
  debug(message: string, context?: Record<string, any>): void;
  info(message: string, context?: Record<string, any>): void;
  warn(message: string, context?: Record<string, any>): void;
  error(message: string, context?: Record<string, any>): void;
}

// ============================================================================
// Monitoring Types
// ============================================================================

export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    database: ServiceStatus;
    stripe: ServiceStatus;
    redis: ServiceStatus;
    email: ServiceStatus;
  };
  metrics: {
    responseTime: number;
    errorRate: number;
    throughput: number;
  };
}

export interface ServiceStatus {
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  lastChecked: string;
  error?: string;
}

export interface Metrics {
  name: string;
  value: number;
  timestamp: string;
  tags?: Record<string, string>;
}

// ============================================================================
// Import types from other files
// ============================================================================

import type {
  UserSubscription,
  SubscriptionPlan,
  PlanFeatures,
  PlanLimits,
  UserUsage,
  PricingExperiment,
  ExperimentVariant,
  PricingChange,
  UIChange,
  ConversionEvent,
  StripeWebhookEvent,
  PaymentMethod,
  SubscriptionAnalytics,
  ConversionFunnelAnalytics,
  SubscriptionStatus,
  BillingCycle,
  ExperimentStatus,
  ConversionEventType,
  FunnelStep,
  UsageType,
} from './database';

// ============================================================================
// Additional Types
// ============================================================================

export type ReportType = 
  | 'conversion_funnel'
  | 'revenue_analytics'
  | 'usage_analytics'
  | 'experiment_results'
  | 'subscription_metrics'
  | 'payment_analytics';

export interface PlanComparison {
  plans: SubscriptionPlan[];
  features: {
    [key: string]: {
      [planId: string]: boolean | number | string;
    };
  };
  pricing: {
    [planId: string]: {
      monthly: number;
      yearly: number;
      savings: number;
    };
  };
}

export interface PricingCalculation {
  planId: string;
  billingCycle: BillingCycle;
  basePrice: number;
  discounts: PricingDiscount[];
  finalPrice: number;
  savings: number;
  currency: string;
}

export interface UsageLimitCheck {
  allowed: boolean;
  currentUsage: number;
  limit: number;
  percentage: number;
  warningThreshold?: number;
}

export interface UsageHistory {
  date: string;
  usageType: UsageType;
  amount: number;
  limit: number;
  percentage: number;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
  clientSecret?: string;
  created: number;
}

export interface ExperimentResults {
  experimentId: string;
  name: string;
  status: ExperimentStatus;
  startDate: string;
  endDate?: string;
  variants: VariantResults[];
  statisticalSignificance: boolean;
  confidence: number;
  recommendation: 'continue' | 'stop' | 'extend';
}

export interface VariantResults {
  name: string;
  visitors: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  averageOrderValue: number;
  confidence: number;
  isWinner: boolean;
}
