# Data Model: Billing (Stripe Integration)

## Overview

This document defines the database schema, TypeScript types, and data relationships for the Stripe billing integration. The schema is based on the Hollywood migration `20240101000000_create_subscription_tables.sql` with enhancements for Clerk compatibility and additional security features.

## Core Tables

### user_subscriptions

Primary table for storing user subscription information and Stripe integration data.

```sql
CREATE TABLE public.user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'essential', 'family', 'premium')),
  status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'past_due', 'cancelled', 'trialing')),
  billing_cycle TEXT DEFAULT 'month' CHECK (billing_cycle IN ('month', 'year')),
  started_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);
```

**Key Fields:**

- `user_id`: References Clerk auth.users table
- `stripe_customer_id`: Stripe customer identifier
- `stripe_subscription_id`: Stripe subscription identifier (unique)
- `plan`: Subscription plan type
- `status`: Current subscription status
- `billing_cycle`: Monthly or yearly billing

### user_usage

Tracks user resource usage against subscription limits.

```sql
CREATE TABLE public.user_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_count INTEGER DEFAULT 0,
  storage_used_mb DECIMAL(10, 2) DEFAULT 0,
  time_capsule_count INTEGER DEFAULT 0,
  scans_this_month INTEGER DEFAULT 0,
  offline_document_count INTEGER DEFAULT 0,
  last_reset_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);
```

**Usage Metrics:**

- `document_count`: Number of documents stored
- `storage_used_mb`: Storage space used in MB
- `time_capsule_count`: Number of time capsules created
- `scans_this_month`: OCR scans performed this month
- `offline_document_count`: Documents available offline

### subscription_limits

Defines the limits and features for each subscription plan.

```sql
CREATE TABLE public.subscription_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan TEXT UNIQUE NOT NULL CHECK (plan IN ('free', 'essential', 'family', 'premium')),
  max_documents INTEGER,
  max_storage_mb INTEGER,
  max_time_capsules INTEGER,
  max_scans_per_month INTEGER,
  max_family_members INTEGER DEFAULT 1,
  offline_access BOOLEAN DEFAULT FALSE,
  ai_features BOOLEAN DEFAULT FALSE,
  advanced_search BOOLEAN DEFAULT FALSE,
  priority_support BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Plan Features:**

- **free**: Basic features, limited resources
- **essential**: Core features, moderate limits
- **family**: Family collaboration, higher limits
- **premium**: All features, unlimited resources

## Default Plan Limits

```sql
INSERT INTO public.subscription_limits (
  plan, max_documents, max_storage_mb, max_time_capsules,
  max_scans_per_month, max_family_members, offline_access,
  ai_features, advanced_search, priority_support
) VALUES
('free', 100, 500, 1, 10, 1, FALSE, FALSE, FALSE, FALSE),
('essential', 1000, 5120, 5, 100, 1, TRUE, FALSE, TRUE, FALSE),
('family', 5000, 20480, 20, 500, 5, TRUE, TRUE, TRUE, FALSE),
('premium', NULL, NULL, NULL, NULL, 10, TRUE, TRUE, TRUE, TRUE);
```

## Database Functions

### check_usage_limit

Validates if a user can perform an action based on their current usage and plan limits.

```sql
CREATE OR REPLACE FUNCTION public.check_usage_limit(
  p_user_id UUID,
  p_limit_type TEXT,
  p_increment INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan TEXT;
  v_current_usage INTEGER;
  v_max_limit INTEGER;
BEGIN
  -- Get user's current plan
  SELECT plan INTO v_plan
  FROM public.user_subscriptions
  WHERE user_id = p_user_id AND status = 'active';

  IF v_plan IS NULL THEN
    v_plan := 'free';
  END IF;

  -- Get current usage and limit based on type
  CASE p_limit_type
    WHEN 'documents' THEN
      SELECT document_count INTO v_current_usage FROM public.user_usage WHERE user_id = p_user_id;
      SELECT max_documents INTO v_max_limit FROM public.subscription_limits WHERE plan = v_plan;
    WHEN 'storage' THEN
      SELECT storage_used_mb INTO v_current_usage FROM public.user_usage WHERE user_id = p_user_id;
      SELECT max_storage_mb INTO v_max_limit FROM public.subscription_limits WHERE plan = v_plan;
    WHEN 'time_capsules' THEN
      SELECT time_capsule_count INTO v_current_usage FROM public.user_usage WHERE user_id = p_user_id;
      SELECT max_time_capsules INTO v_max_limit FROM public.subscription_limits WHERE plan = v_plan;
    WHEN 'scans' THEN
      SELECT scans_this_month INTO v_current_usage FROM public.user_usage WHERE user_id = p_user_id;
      SELECT max_scans_per_month INTO v_max_limit FROM public.subscription_limits WHERE plan = v_plan;
    ELSE
      RETURN FALSE;
  END CASE;

  -- NULL means unlimited
  IF v_max_limit IS NULL THEN
    RETURN TRUE;
  END IF;

  -- Check if adding increment would exceed limit
  RETURN (v_current_usage + p_increment) <= v_max_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### increment_usage

Increments usage counters and validates against limits.

```sql
CREATE OR REPLACE FUNCTION public.increment_usage(
  p_user_id UUID,
  p_usage_type TEXT,
  p_amount INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if increment is allowed
  IF NOT public.check_usage_limit(p_user_id, p_usage_type, p_amount) THEN
    RETURN FALSE;
  END IF;

  -- Increment the appropriate counter
  CASE p_usage_type
    WHEN 'documents' THEN
      UPDATE public.user_usage
      SET document_count = document_count + p_amount,
          updated_at = NOW()
      WHERE user_id = p_user_id;
    WHEN 'storage' THEN
      UPDATE public.user_usage
      SET storage_used_mb = storage_used_mb + p_amount,
          updated_at = NOW()
      WHERE user_id = p_user_id;
    WHEN 'time_capsules' THEN
      UPDATE public.user_usage
      SET time_capsule_count = time_capsule_count + p_amount,
          updated_at = NOW()
      WHERE user_id = p_user_id;
    WHEN 'scans' THEN
      UPDATE public.user_usage
      SET scans_this_month = scans_this_month + p_amount,
          updated_at = NOW()
      WHERE user_id = p_user_id;
    ELSE
      RETURN FALSE;
  END CASE;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### reset_monthly_usage

Resets monthly usage counters (scans_this_month).

```sql
CREATE OR REPLACE FUNCTION public.reset_monthly_usage()
RETURNS void AS $$
BEGIN
  UPDATE public.user_usage
  SET scans_this_month = 0,
      last_reset_date = NOW(),
      updated_at = NOW()
  WHERE DATE_TRUNC('month', last_reset_date) < DATE_TRUNC('month', NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### handle_new_user

Automatically creates subscription and usage records for new users.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default subscription record
  INSERT INTO public.user_subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active');

  -- Create default usage record
  INSERT INTO public.user_usage (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Row Level Security (RLS) Policies

### user_subscriptions Policies

```sql
-- Users can view own subscription
CREATE POLICY "Users can view own subscription" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can manage all subscriptions
CREATE POLICY "Service role can manage all subscriptions" ON public.user_subscriptions
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');
```

### user_usage Policies

```sql
-- Users can view own usage
CREATE POLICY "Users can view own usage" ON public.user_usage
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can manage all usage
CREATE POLICY "Service role can manage all usage" ON public.user_usage
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');
```

### subscription_limits Policies

```sql
-- Anyone can view subscription limits (read-only)
CREATE POLICY "Anyone can view subscription limits" ON public.subscription_limits
  FOR SELECT USING (TRUE);
```

## TypeScript Types

### Database Types (Generated)

```typescript
export type SubscriptionPlan = 'essential' | 'family' | 'free' | 'premium';

export type SubscriptionStatus =
  | 'active'
  | 'cancelled'
  | 'inactive'
  | 'past_due'
  | 'trialing';

export type BillingCycle = 'month' | 'year';

export interface Database {
  public: {
    Tables: {
      user_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          plan: SubscriptionPlan;
          status: SubscriptionStatus;
          billing_cycle: BillingCycle;
          started_at: string | null;
          expires_at: string | null;
          cancelled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          plan?: SubscriptionPlan;
          status?: SubscriptionStatus;
          billing_cycle?: BillingCycle;
          started_at?: string | null;
          expires_at?: string | null;
          cancelled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          plan?: SubscriptionPlan;
          status?: SubscriptionStatus;
          billing_cycle?: BillingCycle;
          started_at?: string | null;
          expires_at?: string | null;
          cancelled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_usage: {
        Row: {
          id: string;
          user_id: string;
          document_count: number;
          storage_used_mb: number;
          time_capsule_count: number;
          scans_this_month: number;
          offline_document_count: number;
          last_reset_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          document_count?: number;
          storage_used_mb?: number;
          time_capsule_count?: number;
          scans_this_month?: number;
          offline_document_count?: number;
          last_reset_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          document_count?: number;
          storage_used_mb?: number;
          time_capsule_count?: number;
          scans_this_month?: number;
          offline_document_count?: number;
          last_reset_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscription_limits: {
        Row: {
          id: string;
          plan: SubscriptionPlan;
          max_documents: number | null;
          max_storage_mb: number | null;
          max_time_capsules: number | null;
          max_scans_per_month: number | null;
          max_family_members: number;
          offline_access: boolean;
          ai_features: boolean;
          advanced_search: boolean;
          priority_support: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          plan: SubscriptionPlan;
          max_documents?: number | null;
          max_storage_mb?: number | null;
          max_time_capsules?: number | null;
          max_scans_per_month?: number | null;
          max_family_members?: number;
          offline_access?: boolean;
          ai_features?: boolean;
          advanced_search?: boolean;
          priority_support?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          plan?: SubscriptionPlan;
          max_documents?: number | null;
          max_storage_mb?: number | null;
          max_time_capsules?: number | null;
          max_scans_per_month?: number | null;
          max_family_members?: number;
          offline_access?: boolean;
          ai_features?: boolean;
          advanced_search?: boolean;
          priority_support?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Functions: {
      check_usage_limit: {
        Args: {
          p_user_id: string;
          p_limit_type: string;
          p_increment?: number;
        };
        Returns: boolean;
      };
      increment_usage: {
        Args: {
          p_user_id: string;
          p_usage_type: string;
          p_amount?: number;
        };
        Returns: boolean;
      };
      reset_monthly_usage: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
    };
  };
}
```

### Service Layer Types

```typescript
export interface UserSubscription {
  billing_cycle: BillingCycle;
  cancelled_at?: string;
  created_at: string;
  expires_at?: string;
  id: string;
  plan: SubscriptionPlan;
  started_at?: string;
  status: SubscriptionStatus;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  updated_at: string;
  user_id: string;
}

export interface UserUsage {
  created_at: string;
  document_count: number;
  id: string;
  last_reset_date: string;
  offline_document_count: number;
  scans_this_month: number;
  storage_used_mb: number;
  time_capsule_count: number;
  updated_at: string;
  user_id: string;
}

export interface SubscriptionLimits {
  advanced_search: boolean;
  ai_features: boolean;
  max_documents: number | null;
  max_family_members: number;
  max_scans_per_month: number | null;
  max_storage_mb: number | null;
  max_time_capsules: number | null;
  offline_access: boolean;
  plan: SubscriptionPlan;
  priority_support: boolean;
}

export type UsageType = 'documents' | 'scans' | 'storage' | 'time_capsules';
```

## Indexes and Performance

### Core Indexes

```sql
-- User subscriptions indexes
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_stripe_customer_id ON public.user_subscriptions(stripe_customer_id);
CREATE INDEX idx_user_subscriptions_stripe_subscription_id ON public.user_subscriptions(stripe_subscription_id);
CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions(status);

-- User usage indexes
CREATE INDEX idx_user_usage_user_id ON public.user_usage(user_id);

-- Subscription limits indexes (plan is already unique)
```

### Performance Considerations

- **Partitioning**: Consider partitioning user_subscriptions by created_at for large datasets
- **Archiving**: Implement archiving strategy for cancelled subscriptions after retention period
- **Caching**: Cache subscription_limits in application layer (rarely changes)
- **Monitoring**: Set up monitoring for usage limit check performance

## Data Relationships

```text
auth.users (Clerk)
    │
    ├── user_subscriptions (1:1)
    │   ├── References subscription_limits (N:1)
    │   └── Referenced by stripe webhooks
    │
    └── user_usage (1:1)
        └── Updated by application features
```

## Migration Strategy

### From Hollywood Schema

1. **Data Export**: Export existing subscription data from Hollywood
2. **Schema Migration**: Apply new migration with enhanced fields
3. **Data Transformation**: Transform and import subscription data
4. **Validation**: Verify data integrity and relationships
5. **Rollback Plan**: Maintain ability to rollback if issues arise

### Data Validation

- Ensure all user_id references exist in Clerk auth.users
- Validate Stripe customer/subscription IDs format
- Check usage counts against plan limits
- Verify RLS policies are correctly applied

## Monitoring and Alerting

### Key Metrics to Monitor

- **Usage Limit Violations**: Track attempts to exceed limits
- **Subscription State Changes**: Monitor status transitions
- **Database Performance**: Query performance for usage checks
- **Stripe Webhook Failures**: Track failed webhook processing

### Alert Conditions

- High rate of usage limit violations
- Subscription state inconsistencies
- Database query timeouts
- Webhook processing failures

## Backup and Recovery

### Backup Strategy

- **Daily Backups**: Full database backups including billing data
- **Point-in-Time Recovery**: Enable PITR for critical billing data
- **Cross-Region Replication**: Replicate to secondary region for disaster recovery

### Recovery Procedures

- **Data Corruption**: Restore from backup with minimal data loss
- **Stripe Sync Issues**: Manual synchronization procedures
- **Usage Inconsistencies**: Automated reconciliation scripts

## Security Considerations

### Data Protection

- **Encryption**: All sensitive billing data encrypted at rest
- **Access Control**: RLS policies enforced for all operations
- **Audit Logging**: Complete audit trail for billing changes
- **PII Handling**: Minimize PII storage, comply with GDPR/CCPA

### API Security

- **Webhook Validation**: HMAC signature verification
- **Rate Limiting**: Prevent abuse of billing endpoints
- **Input Validation**: Strict validation of all billing inputs
- **Error Handling**: Secure error messages without data leakage
