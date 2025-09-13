/**
 * Database Schema and Types for Pricing & Conversion System
 * 
 * This file contains TypeScript interfaces and types for all database tables,
 * functions, and operations related to the pricing and conversion system.
 */

// ============================================================================
// Database Table Types
// ============================================================================

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  billing_cycle: BillingCycle;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  stripe_price_id?: string;
  current_period_start: string;
  current_period_end: string;
  trial_start?: string;
  trial_end?: string;
  canceled_at?: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  price_monthly: number; // in cents
  price_yearly: number; // in cents
  stripe_price_id_monthly?: string;
  stripe_price_id_yearly?: string;
  features: PlanFeatures;
  limits: PlanLimits;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PlanFeatures {
  documents: boolean;
  family_members: boolean;
  basic_ai: boolean;
  advanced_ai: boolean;
  email_support: boolean;
  priority_support: boolean;
  dedicated_support: boolean;
  advanced_search: boolean;
  time_capsules: boolean;
  will_generation: boolean;
  professional_network: boolean;
  white_label: boolean;
  custom_integrations: boolean;
  advanced_analytics: boolean;
  mobile_app: boolean;
}

export interface PlanLimits {
  max_documents: number; // -1 for unlimited
  max_family_members: number; // -1 for unlimited
  max_storage_mb: number; // -1 for unlimited
  max_time_capsules: number; // -1 for unlimited
  max_ai_requests_per_month: number; // -1 for unlimited
}

export interface UserUsage {
  id: string;
  user_id: string;
  document_count: number;
  storage_used_mb: number;
  time_capsule_count: number;
  ai_requests_this_month: number;
  last_reset_date: string;
  created_at: string;
  updated_at: string;
}

export interface PricingExperiment {
  id: string;
  name: string;
  description?: string;
  status: ExperimentStatus;
  start_date?: string;
  end_date?: string;
  traffic_allocation: number; // percentage
  variants: ExperimentVariant[];
  success_metrics: string[];
  created_at: string;
  updated_at: string;
}

export interface ExperimentVariant {
  name: string;
  description?: string;
  traffic_allocation: number; // percentage
  pricing_changes: PricingChange[];
  ui_changes: UIChange[];
}

export interface PricingChange {
  plan_id: string;
  price_monthly?: number;
  price_yearly?: number;
  discount_percentage?: number;
  discount_amount?: number;
}

export interface UIChange {
  element: string;
  change_type: 'text' | 'color' | 'layout' | 'visibility';
  value: string;
}

export interface ExperimentAssignment {
  id: string;
  experiment_id: string;
  user_id: string;
  variant_name: string;
  assigned_at: string;
}

export interface ConversionEvent {
  id: string;
  user_id?: string;
  session_id?: string;
  event_type: ConversionEventType;
  event_data: Record<string, any>;
  experiment_id?: string;
  variant_name?: string;
  created_at: string;
}

export interface StripeWebhookEvent {
  id: string;
  stripe_event_id: string;
  event_type: string;
  processed: boolean;
  processing_error?: string;
  event_data: Record<string, any>;
  created_at: string;
  processed_at?: string;
}

export interface PaymentMethod {
  id: string;
  user_id: string;
  stripe_payment_method_id: string;
  type: 'card' | 'bank_account' | 'sepa_debit';
  brand?: string;
  last4?: string;
  exp_month?: number;
  exp_year?: number;
  is_default: boolean;
  created_at: string;
}

export interface SubscriptionAnalytics {
  id: string;
  date: string;
  plan_name: string;
  new_subscriptions: number;
  cancellations: number;
  upgrades: number;
  downgrades: number;
  revenue_cents: number;
  mrr_cents: number;
  created_at: string;
}

export interface ConversionFunnelAnalytics {
  id: string;
  date: string;
  funnel_step: FunnelStep;
  visitors: number;
  conversions: number;
  conversion_rate: number;
  experiment_id?: string;
  variant_name?: string;
  created_at: string;
}

// ============================================================================
// Enums and Union Types
// ============================================================================

export type SubscriptionStatus = 
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete'
  | 'incomplete_expired';

export type BillingCycle = 'month' | 'year';

export type ExperimentStatus = 
  | 'draft'
  | 'running'
  | 'paused'
  | 'completed'
  | 'cancelled';

export type ConversionEventType = 
  | 'page_view'
  | 'pricing_page_view'
  | 'plan_selected'
  | 'checkout_started'
  | 'payment_completed'
  | 'subscription_created'
  | 'subscription_canceled'
  | 'subscription_upgraded'
  | 'subscription_downgraded'
  | 'trial_started'
  | 'trial_converted'
  | 'trial_canceled';

export type FunnelStep = 
  | 'landing_page'
  | 'pricing_page'
  | 'plan_selection'
  | 'checkout_start'
  | 'payment_form'
  | 'payment_complete'
  | 'subscription_active';

export type UsageType = 
  | 'documents'
  | 'storage'
  | 'time_capsules'
  | 'ai_requests';

// ============================================================================
// Database Function Types
// ============================================================================

export interface CheckUsageLimitParams {
  p_user_id: string;
  p_limit_type: UsageType;
  p_increment: number;
}

export interface CheckUsageLimitResult {
  allowed: boolean;
  current_usage: number;
  limit: number;
  percentage: number;
}

export interface IncrementUsageParams {
  p_user_id: string;
  p_usage_type: UsageType;
  p_amount: number;
}

export interface IncrementUsageResult {
  success: boolean;
  new_usage: number;
  limit_reached: boolean;
}

export interface CreateSubscriptionParams {
  p_user_id: string;
  p_plan_id: string;
  p_billing_cycle: BillingCycle;
  p_stripe_customer_id?: string;
  p_stripe_subscription_id?: string;
  p_stripe_price_id?: string;
}

export interface CreateSubscriptionResult {
  subscription_id: string;
  success: boolean;
}

export interface CancelSubscriptionParams {
  p_user_id: string;
  p_cancel_at_period_end: boolean;
}

export interface CancelSubscriptionResult {
  success: boolean;
  canceled_at?: string;
}

export interface ResetMonthlyUsageResult {
  reset_count: number;
  success: boolean;
}

// ============================================================================
// Database Query Types
// ============================================================================

export interface SubscriptionQuery {
  user_id?: string;
  status?: SubscriptionStatus;
  plan_name?: string;
  billing_cycle?: BillingCycle;
  limit?: number;
  offset?: number;
  order_by?: 'created_at' | 'updated_at' | 'current_period_end';
  order_direction?: 'asc' | 'desc';
}

export interface UsageQuery {
  user_id?: string;
  usage_type?: UsageType;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export interface AnalyticsQuery {
  start_date: string;
  end_date: string;
  plan_name?: string;
  experiment_id?: string;
  group_by: 'day' | 'week' | 'month';
  limit?: number;
  offset?: number;
}

export interface ExperimentQuery {
  status?: ExperimentStatus;
  name?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

// ============================================================================
// Database Migration Types
// ============================================================================

export interface Migration {
  id: string;
  name: string;
  description?: string;
  sql: string;
  rollback_sql?: string;
  dependencies?: string[];
  created_at: string;
  applied_at?: string;
}

export interface MigrationResult {
  success: boolean;
  migration_id: string;
  applied_at: string;
  error?: string;
}

// ============================================================================
// Database Index Types
// ============================================================================

export interface DatabaseIndex {
  name: string;
  table: string;
  columns: string[];
  unique: boolean;
  partial?: string;
}

export interface IndexResult {
  success: boolean;
  index_name: string;
  created_at: string;
  error?: string;
}

// ============================================================================
// Database Constraint Types
// ============================================================================

export interface DatabaseConstraint {
  name: string;
  table: string;
  type: 'primary_key' | 'foreign_key' | 'unique' | 'check' | 'not_null';
  columns: string[];
  references?: {
    table: string;
    columns: string[];
  };
  check_condition?: string;
}

export interface ConstraintResult {
  success: boolean;
  constraint_name: string;
  created_at: string;
  error?: string;
}

// ============================================================================
// Database RLS Policy Types
// ============================================================================

export interface RLSPolicy {
  name: string;
  table: string;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL';
  using_expression: string;
  with_check_expression?: string;
  roles?: string[];
}

export interface PolicyResult {
  success: boolean;
  policy_name: string;
  created_at: string;
  error?: string;
}

// ============================================================================
// Database Trigger Types
// ============================================================================

export interface DatabaseTrigger {
  name: string;
  table: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE' | 'TRUNCATE';
  timing: 'BEFORE' | 'AFTER' | 'INSTEAD OF';
  function_name: string;
  condition?: string;
}

export interface TriggerResult {
  success: boolean;
  trigger_name: string;
  created_at: string;
  error?: string;
}

// ============================================================================
// Database View Types
// ============================================================================

export interface DatabaseView {
  name: string;
  definition: string;
  columns: string[];
  materialized: boolean;
}

export interface ViewResult {
  success: boolean;
  view_name: string;
  created_at: string;
  error?: string;
}

// ============================================================================
// Database Function Types
// ============================================================================

export interface DatabaseFunction {
  name: string;
  definition: string;
  parameters: FunctionParameter[];
  return_type: string;
  language: 'sql' | 'plpgsql' | 'javascript';
  security: 'DEFINER' | 'INVOKER';
  volatility: 'IMMUTABLE' | 'STABLE' | 'VOLATILE';
}

export interface FunctionParameter {
  name: string;
  type: string;
  mode: 'IN' | 'OUT' | 'INOUT' | 'VARIADIC';
  default_value?: string;
}

export interface FunctionResult {
  success: boolean;
  function_name: string;
  created_at: string;
  error?: string;
}

// ============================================================================
// Database Connection Types
// ============================================================================

export interface DatabaseConnection {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  pool_size: number;
  connection_timeout: number;
  idle_timeout: number;
}

export interface ConnectionResult {
  success: boolean;
  connection_id: string;
  connected_at: string;
  error?: string;
}

// ============================================================================
// Database Transaction Types
// ============================================================================

export interface DatabaseTransaction {
  id: string;
  started_at: string;
  committed_at?: string;
  rolled_back_at?: string;
  isolation_level: 'READ UNCOMMITTED' | 'READ COMMITTED' | 'REPEATABLE READ' | 'SERIALIZABLE';
}

export interface TransactionResult {
  success: boolean;
  transaction_id: string;
  committed_at?: string;
  rolled_back_at?: string;
  error?: string;
}

// ============================================================================
// Database Backup Types
// ============================================================================

export interface DatabaseBackup {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  size_bytes: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  backup_type: 'full' | 'incremental' | 'differential';
  tables: string[];
}

export interface BackupResult {
  success: boolean;
  backup_id: string;
  created_at: string;
  size_bytes: number;
  error?: string;
}

// ============================================================================
// Database Restore Types
// ============================================================================

export interface DatabaseRestore {
  id: string;
  backup_id: string;
  target_database: string;
  started_at: string;
  completed_at?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

export interface RestoreResult {
  success: boolean;
  restore_id: string;
  completed_at: string;
  error?: string;
}

// ============================================================================
// Database Performance Types
// ============================================================================

export interface QueryPerformance {
  query_id: string;
  query_text: string;
  execution_time_ms: number;
  rows_returned: number;
  rows_examined: number;
  index_used: boolean;
  created_at: string;
}

export interface PerformanceMetrics {
  average_execution_time: number;
  slowest_queries: QueryPerformance[];
  most_frequent_queries: QueryPerformance[];
  index_usage: Record<string, number>;
  table_sizes: Record<string, number>;
}

// ============================================================================
// Database Health Types
// ============================================================================

export interface DatabaseHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  connections: {
    active: number;
    idle: number;
    max: number;
  };
  performance: {
    average_query_time: number;
    slow_queries: number;
    cache_hit_ratio: number;
  };
  storage: {
    used_bytes: number;
    total_bytes: number;
    available_bytes: number;
  };
  last_checked: string;
}

// ============================================================================
// Database Error Types
// ============================================================================

export interface DatabaseError {
  code: string;
  message: string;
  detail?: string;
  hint?: string;
  position?: number;
  internal_position?: number;
  internal_query?: string;
  where?: string;
  schema_name?: string;
  table_name?: string;
  column_name?: string;
  data_type_name?: string;
  constraint_name?: string;
  file?: string;
  line?: number;
  routine?: string;
}

export interface ErrorResult {
  success: false;
  error: DatabaseError;
  timestamp: string;
}

// ============================================================================
// Utility Types
// ============================================================================

export type DatabaseOperation = 
  | 'SELECT'
  | 'INSERT'
  | 'UPDATE'
  | 'DELETE'
  | 'CREATE'
  | 'DROP'
  | 'ALTER'
  | 'TRUNCATE';

export type DatabaseObjectType = 
  | 'TABLE'
  | 'VIEW'
  | 'FUNCTION'
  | 'TRIGGER'
  | 'INDEX'
  | 'CONSTRAINT'
  | 'SEQUENCE'
  | 'TYPE';

export interface DatabaseObject {
  name: string;
  type: DatabaseObjectType;
  schema: string;
  created_at: string;
  modified_at: string;
  size_bytes?: number;
}

// ============================================================================
// Export all types
// ============================================================================

export * from './interfaces';
export * from './stripe-types';
