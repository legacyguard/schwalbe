# Pricing & Conversion System - Data Model

## Database Schema

### Core Subscription Tables

#### user_subscriptions

```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status subscription_status NOT NULL DEFAULT 'active',
  billing_cycle billing_cycle NOT NULL DEFAULT 'month',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions" ON user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);
```

#### subscription_plans

```sql
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  price_monthly INTEGER NOT NULL, -- in cents
  price_yearly INTEGER NOT NULL, -- in cents
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  features JSONB NOT NULL DEFAULT '{}',
  limits JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default plans
INSERT INTO subscription_plans (name, display_name, description, price_monthly, price_yearly, features, limits, sort_order) VALUES
('free', 'Free', 'Basic features for getting started', 0, 0, 
 '{"documents": true, "family_members": true, "basic_ai": true, "mobile_app": true}',
 '{"max_documents": 10, "max_family_members": 2, "max_storage_mb": 100, "max_time_capsules": 0}',
 1),
('essential', 'Essential', 'Perfect for individuals and small families', 999, 9999,
 '{"documents": true, "family_members": true, "advanced_ai": true, "email_support": true, "advanced_search": true}',
 '{"max_documents": 100, "max_family_members": 5, "max_storage_mb": 1000, "max_time_capsules": 0}',
 2),
('family', 'Family', 'Complete family protection and collaboration', 1999, 19999,
 '{"documents": true, "family_members": true, "advanced_ai": true, "priority_support": true, "time_capsules": true, "will_generation": true}',
 '{"max_documents": 500, "max_family_members": 10, "max_storage_mb": 5000, "max_time_capsules": 5}',
 3),
('premium', 'Premium', 'Advanced features for power users', 3999, 39999,
 '{"documents": true, "family_members": true, "advanced_ai": true, "priority_support": true, "time_capsules": true, "will_generation": true, "professional_network": true, "white_label": true}',
 '{"max_documents": -1, "max_family_members": -1, "max_storage_mb": 50000, "max_time_capsules": -1}',
 4),
('enterprise', 'Enterprise', 'Custom solutions for organizations', 0, 0,
 '{"documents": true, "family_members": true, "advanced_ai": true, "dedicated_support": true, "time_capsules": true, "will_generation": true, "professional_network": true, "white_label": true, "custom_integrations": true, "advanced_analytics": true}',
 '{"max_documents": -1, "max_family_members": -1, "max_storage_mb": -1, "max_time_capsules": -1}',
 5);
```

#### user_usage

```sql
CREATE TABLE user_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_count INTEGER DEFAULT 0,
  storage_used_mb INTEGER DEFAULT 0,
  time_capsule_count INTEGER DEFAULT 0,
  ai_requests_this_month INTEGER DEFAULT 0,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own usage" ON user_usage
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own usage" ON user_usage
  FOR UPDATE USING (auth.uid() = user_id);
```

### Pricing and Conversion Tables

#### pricing_experiments

```sql
CREATE TABLE pricing_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  status experiment_status DEFAULT 'draft',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  traffic_allocation DECIMAL(5,2) DEFAULT 100.0,
  variants JSONB NOT NULL DEFAULT '[]',
  success_metrics JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE experiment_status AS ENUM ('draft', 'running', 'paused', 'completed', 'cancelled');
```

#### experiment_assignments

```sql
CREATE TABLE experiment_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES pricing_experiments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  variant_name TEXT NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(experiment_id, user_id)
);

-- RLS Policy
ALTER TABLE experiment_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own assignments" ON experiment_assignments
  FOR SELECT USING (auth.uid() = user_id);
```

#### conversion_events

```sql
CREATE TABLE conversion_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  experiment_id UUID REFERENCES pricing_experiments(id),
  variant_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analytics
CREATE INDEX idx_conversion_events_user_id ON conversion_events(user_id);
CREATE INDEX idx_conversion_events_event_type ON conversion_events(event_type);
CREATE INDEX idx_conversion_events_created_at ON conversion_events(created_at);
CREATE INDEX idx_conversion_events_experiment ON conversion_events(experiment_id, variant_name);
```

### Stripe Integration Tables

#### stripe_webhook_events

```sql
CREATE TABLE stripe_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  processed BOOLEAN DEFAULT false,
  processing_error TEXT,
  event_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Index for webhook processing
CREATE INDEX idx_stripe_webhook_events_processed ON stripe_webhook_events(processed, created_at);
```

#### payment_methods

```sql
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_method_id TEXT NOT NULL,
  type TEXT NOT NULL, -- 'card', 'bank_account', etc.
  brand TEXT, -- 'visa', 'mastercard', etc.
  last4 TEXT,
  exp_month INTEGER,
  exp_year INTEGER,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own payment methods" ON payment_methods
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own payment methods" ON payment_methods
  FOR ALL USING (auth.uid() = user_id);
```

### Analytics and Reporting Tables

#### subscription_analytics

```sql
CREATE TABLE subscription_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  plan_name TEXT NOT NULL,
  new_subscriptions INTEGER DEFAULT 0,
  cancellations INTEGER DEFAULT 0,
  upgrades INTEGER DEFAULT 0,
  downgrades INTEGER DEFAULT 0,
  revenue_cents INTEGER DEFAULT 0,
  mrr_cents INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint for daily aggregation
CREATE UNIQUE INDEX idx_subscription_analytics_date_plan ON subscription_analytics(date, plan_name);
```

#### conversion_funnel_analytics

```sql
CREATE TABLE conversion_funnel_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  funnel_step TEXT NOT NULL,
  visitors INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0.0,
  experiment_id UUID REFERENCES pricing_experiments(id),
  variant_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for funnel analysis
CREATE INDEX idx_conversion_funnel_date_step ON conversion_funnel_analytics(date, funnel_step);
```

## TypeScript Interfaces

### Core Subscription Types

```typescript
// Subscription Plans
export interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  priceMonthly: number; // in cents
  priceYearly: number; // in cents
  stripePriceIdMonthly?: string;
  stripePriceIdYearly?: string;
  features: PlanFeatures;
  limits: PlanLimits;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlanFeatures {
  documents: boolean;
  familyMembers: boolean;
  basicAi: boolean;
  advancedAi: boolean;
  emailSupport: boolean;
  prioritySupport: boolean;
  dedicatedSupport: boolean;
  advancedSearch: boolean;
  timeCapsules: boolean;
  willGeneration: boolean;
  professionalNetwork: boolean;
  whiteLabel: boolean;
  customIntegrations: boolean;
  advancedAnalytics: boolean;
  mobileApp: boolean;
}

export interface PlanLimits {
  maxDocuments: number; // -1 for unlimited
  maxFamilyMembers: number; // -1 for unlimited
  maxStorageMb: number; // -1 for unlimited
  maxTimeCapsules: number; // -1 for unlimited
  maxAiRequestsPerMonth: number; // -1 for unlimited
}

// User Subscriptions
export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialStart?: string;
  trialEnd?: string;
  canceledAt?: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionStatus = 
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete'
  | 'incomplete_expired';

export type BillingCycle = 'month' | 'year';

// User Usage
export interface UserUsage {
  id: string;
  userId: string;
  documentCount: number;
  storageUsedMb: number;
  timeCapsuleCount: number;
  aiRequestsThisMonth: number;
  lastResetDate: string;
  createdAt: string;
  updatedAt: string;
}
```

### Pricing and Conversion Types

```typescript
// Pricing Experiments
export interface PricingExperiment {
  id: string;
  name: string;
  description: string;
  status: ExperimentStatus;
  startDate?: string;
  endDate?: string;
  trafficAllocation: number; // percentage
  variants: ExperimentVariant[];
  successMetrics: string[];
  createdAt: string;
  updatedAt: string;
}

export type ExperimentStatus = 
  | 'draft'
  | 'running'
  | 'paused'
  | 'completed'
  | 'cancelled';

export interface ExperimentVariant {
  name: string;
  description: string;
  trafficAllocation: number; // percentage
  pricingChanges: PricingChange[];
  uiChanges: UIChange[];
}

export interface PricingChange {
  planId: string;
  priceMonthly?: number;
  priceYearly?: number;
  discountPercentage?: number;
  discountAmount?: number;
}

export interface UIChange {
  element: string;
  changeType: 'text' | 'color' | 'layout' | 'visibility';
  value: string;
}

// Conversion Events
export interface ConversionEvent {
  id: string;
  userId?: string;
  sessionId?: string;
  eventType: ConversionEventType;
  eventData: Record<string, any>;
  experimentId?: string;
  variantName?: string;
  createdAt: string;
}

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

// Stripe Integration
export interface StripeWebhookEvent {
  id: string;
  stripeEventId: string;
  eventType: string;
  processed: boolean;
  processingError?: string;
  eventData: Record<string, any>;
  createdAt: string;
  processedAt?: string;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  stripePaymentMethodId: string;
  type: 'card' | 'bank_account' | 'sepa_debit';
  brand?: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
  isDefault: boolean;
  createdAt: string;
}
```

### Analytics Types

```typescript
// Subscription Analytics
export interface SubscriptionAnalytics {
  id: string;
  date: string;
  planName: string;
  newSubscriptions: number;
  cancellations: number;
  upgrades: number;
  downgrades: number;
  revenueCents: number;
  mrrCents: number;
  createdAt: string;
}

// Conversion Funnel Analytics
export interface ConversionFunnelAnalytics {
  id: string;
  date: string;
  funnelStep: FunnelStep;
  visitors: number;
  conversions: number;
  conversionRate: number;
  experimentId?: string;
  variantName?: string;
  createdAt: string;
}

export type FunnelStep = 
  | 'landing_page'
  | 'pricing_page'
  | 'plan_selection'
  | 'checkout_start'
  | 'payment_form'
  | 'payment_complete'
  | 'subscription_active';

// Usage Analytics
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
```

## Database Functions

### Usage Tracking Functions

```sql
-- Check if user can perform action based on limits
CREATE OR REPLACE FUNCTION check_usage_limit(
  p_user_id UUID,
  p_limit_type TEXT,
  p_increment INTEGER DEFAULT 1
) RETURNS BOOLEAN AS $$
DECLARE
  current_usage INTEGER;
  max_limit INTEGER;
  user_plan_id UUID;
BEGIN
  -- Get user's current plan
  SELECT plan_id INTO user_plan_id
  FROM user_subscriptions
  WHERE user_id = p_user_id AND status = 'active';
  
  IF user_plan_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Get current usage
  SELECT 
    CASE p_limit_type
      WHEN 'documents' THEN document_count
      WHEN 'storage' THEN storage_used_mb
      WHEN 'time_capsules' THEN time_capsule_count
      WHEN 'ai_requests' THEN ai_requests_this_month
      ELSE 0
    END
  INTO current_usage
  FROM user_usage
  WHERE user_id = p_user_id;
  
  -- Get plan limits
  SELECT 
    CASE p_limit_type
      WHEN 'documents' THEN (limits->>'max_documents')::INTEGER
      WHEN 'storage' THEN (limits->>'max_storage_mb')::INTEGER
      WHEN 'time_capsules' THEN (limits->>'max_time_capsules')::INTEGER
      WHEN 'ai_requests' THEN (limits->>'max_ai_requests_per_month')::INTEGER
      ELSE 0
    END
  INTO max_limit
  FROM subscription_plans
  WHERE id = user_plan_id;
  
  -- Check if adding increment would exceed limit
  IF max_limit = -1 THEN
    RETURN TRUE; -- Unlimited
  END IF;
  
  RETURN (current_usage + p_increment) <= max_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment usage counter
CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id UUID,
  p_usage_type TEXT,
  p_amount INTEGER DEFAULT 1
) RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user can perform action
  IF NOT check_usage_limit(p_user_id, p_usage_type, p_amount) THEN
    RETURN FALSE;
  END IF;
  
  -- Update usage
  UPDATE user_usage SET
    document_count = CASE WHEN p_usage_type = 'documents' THEN document_count + p_amount ELSE document_count END,
    storage_used_mb = CASE WHEN p_usage_type = 'storage' THEN storage_used_mb + p_amount ELSE storage_used_mb END,
    time_capsule_count = CASE WHEN p_usage_type = 'time_capsules' THEN time_capsule_count + p_amount ELSE time_capsule_count END,
    ai_requests_this_month = CASE WHEN p_usage_type = 'ai_requests' THEN ai_requests_this_month + p_amount ELSE ai_requests_this_month END,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reset monthly usage counters
CREATE OR REPLACE FUNCTION reset_monthly_usage() RETURNS VOID AS $$
BEGIN
  UPDATE user_usage SET
    ai_requests_this_month = 0,
    last_reset_date = CURRENT_DATE,
    updated_at = NOW()
  WHERE last_reset_date < DATE_TRUNC('month', CURRENT_DATE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Subscription Management Functions

```sql
-- Create subscription
CREATE OR REPLACE FUNCTION create_subscription(
  p_user_id UUID,
  p_plan_id UUID,
  p_billing_cycle billing_cycle,
  p_stripe_customer_id TEXT DEFAULT NULL,
  p_stripe_subscription_id TEXT DEFAULT NULL,
  p_stripe_price_id TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  subscription_id UUID;
  plan_record subscription_plans%ROWTYPE;
BEGIN
  -- Get plan details
  SELECT * INTO plan_record FROM subscription_plans WHERE id = p_plan_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Plan not found: %', p_plan_id;
  END IF;
  
  -- Calculate period dates
  DECLARE
    period_start TIMESTAMPTZ := NOW();
    period_end TIMESTAMPTZ := CASE p_billing_cycle
      WHEN 'month' THEN period_start + INTERVAL '1 month'
      WHEN 'year' THEN period_start + INTERVAL '1 year'
    END;
  BEGIN
    -- Create subscription
    INSERT INTO user_subscriptions (
      user_id, plan_id, billing_cycle, stripe_customer_id, 
      stripe_subscription_id, stripe_price_id, current_period_start, current_period_end
    ) VALUES (
      p_user_id, p_plan_id, p_billing_cycle, p_stripe_customer_id,
      p_stripe_subscription_id, p_stripe_price_id, period_start, period_end
    ) RETURNING id INTO subscription_id;
    
    -- Initialize usage tracking
    INSERT INTO user_usage (user_id) VALUES (p_user_id)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN subscription_id;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cancel subscription
CREATE OR REPLACE FUNCTION cancel_subscription(
  p_user_id UUID,
  p_cancel_at_period_end BOOLEAN DEFAULT TRUE
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE user_subscriptions SET
    canceled_at = CASE WHEN p_cancel_at_period_end THEN NULL ELSE NOW() END,
    cancel_at_period_end = p_cancel_at_period_end,
    updated_at = NOW()
  WHERE user_id = p_user_id AND status = 'active';
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## API Data Models

### REST API Request/Response Types

```typescript
// Subscription Management
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
  planId: string;
  billingCycle?: BillingCycle;
  prorationBehavior?: 'create_prorations' | 'none' | 'always_invoice';
}

// Pricing Experiments
export interface CreateExperimentRequest {
  name: string;
  description: string;
  variants: ExperimentVariant[];
  successMetrics: string[];
  trafficAllocation: number;
}

export interface ExperimentAssignmentResponse {
  experimentId: string;
  variantName: string;
  isAssigned: boolean;
}

// Analytics
export interface AnalyticsQuery {
  startDate: string;
  endDate: string;
  planName?: string;
  experimentId?: string;
  groupBy: 'day' | 'week' | 'month';
}

export interface ConversionFunnelResponse {
  steps: {
    step: FunnelStep;
    visitors: number;
    conversions: number;
    conversionRate: number;
  }[];
  totalVisitors: number;
  totalConversions: number;
  overallConversionRate: number;
}
```

This data model provides a comprehensive foundation for the pricing and conversion system, supporting subscription management, A/B testing, usage tracking, and analytics while maintaining security and performance.
