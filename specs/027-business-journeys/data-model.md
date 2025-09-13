# Data Model: Business Journeys - Customer Experience and Process Optimization

This document defines the complete data model for the Business Journeys system, including all entities, relationships, constraints, and business rules for customer journey mapping, business process automation, user experience flows, and conversion optimization.

## Core Entities

### CustomerJourney

Represents a complete customer journey with stages, touchpoints, and analytics.

```sql
CREATE TABLE customer_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  journey_type VARCHAR(50) NOT NULL CHECK (journey_type IN ('consumer', 'professional', 'partner')),
  current_stage VARCHAR(50) NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',

  -- Journey configuration
  persona_type VARCHAR(50),
  entry_point VARCHAR(100),
  target_outcome VARCHAR(100),

  -- Analytics
  completion_percentage DECIMAL(5,2) DEFAULT 0.0,
  time_spent_minutes INTEGER DEFAULT 0,
  touchpoint_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_customer_journeys_user_id ON customer_journeys(user_id);
CREATE INDEX idx_customer_journeys_type_stage ON customer_journeys(journey_type, current_stage);
CREATE INDEX idx_customer_journeys_active ON customer_journeys(is_active) WHERE is_active = true;
CREATE INDEX idx_customer_journeys_started ON customer_journeys(started_at);
```

### Touchpoint

Represents individual user interactions and touchpoints within journeys.

```sql
CREATE TABLE touchpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id UUID NOT NULL REFERENCES customer_journeys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Touchpoint details
  touchpoint_type VARCHAR(50) NOT NULL,
  touchpoint_name VARCHAR(100) NOT NULL,
  channel VARCHAR(50) NOT NULL CHECK (channel IN ('web', 'mobile', 'email', 'api', 'support')),

  -- Context
  page_url VARCHAR(500),
  feature_name VARCHAR(100),
  action_taken VARCHAR(100),

  -- Timing
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,

  -- Quality metrics
  success BOOLEAN,
  error_message TEXT,
  user_feedback_rating INTEGER CHECK (user_feedback_rating >= 1 AND user_feedback_rating <= 5),

  -- Analytics
  metadata JSONB DEFAULT '{}',
  performance_metrics JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_touchpoints_journey_id ON touchpoints(journey_id);
CREATE INDEX idx_touchpoints_user_id ON touchpoints(user_id);
CREATE INDEX idx_touchpoints_type ON touchpoints(touchpoint_type);
CREATE INDEX idx_touchpoints_channel ON touchpoints(channel);
CREATE INDEX idx_touchpoints_started ON touchpoints(started_at);
CREATE INDEX idx_touchpoints_success ON touchpoints(success);
```

### BusinessProcess

Represents automated business processes and workflows.

```sql
CREATE TABLE business_processes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_name VARCHAR(100) NOT NULL UNIQUE,
  process_type VARCHAR(50) NOT NULL CHECK (process_type IN ('onboarding', 'document_processing', 'professional_matching', 'billing', 'support', 'compliance')),

  -- Process configuration
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 10),
  max_execution_time_minutes INTEGER DEFAULT 60,

  -- Automation settings
  trigger_events JSONB DEFAULT '[]',
  automation_rules JSONB DEFAULT '{}',
  fallback_procedures JSONB DEFAULT '{}',

  -- Monitoring
  success_rate DECIMAL(5,2) DEFAULT 0.0,
  average_execution_time_seconds INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,

  -- Metadata
  description TEXT,
  owner_team VARCHAR(50),
  tags TEXT[],

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_business_processes_type ON business_processes(process_type);
CREATE INDEX idx_business_processes_active ON business_processes(is_active) WHERE is_active = true;
CREATE INDEX idx_business_processes_priority ON business_processes(priority);
```

### ProcessExecution

Tracks individual executions of business processes.

```sql
CREATE TABLE process_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id UUID NOT NULL REFERENCES business_processes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Execution details
  execution_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (execution_status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,

  -- Context
  trigger_event VARCHAR(100),
  input_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',

  -- Error handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,

  -- Monitoring
  performance_metrics JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_process_executions_process_id ON process_executions(process_id);
CREATE INDEX idx_process_executions_user_id ON process_executions(user_id);
CREATE INDEX idx_process_executions_status ON process_executions(execution_status);
CREATE INDEX idx_process_executions_started ON process_executions(started_at);
```

### ConversionFunnel

Represents conversion funnels with stages and metrics.

```sql
CREATE TABLE conversion_funnels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funnel_name VARCHAR(100) NOT NULL UNIQUE,
  funnel_type VARCHAR(50) NOT NULL CHECK (funnel_type IN ('awareness', 'consideration', 'purchase', 'retention', 'advocacy')),

  -- Funnel configuration
  stages JSONB NOT NULL, -- Array of stage objects with name, description, order
  is_active BOOLEAN DEFAULT true,

  -- Analytics
  total_visitors INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0.0,
  average_time_to_convert_days DECIMAL(6,2),

  -- A/B Testing
  experiment_id UUID,
  variant_name VARCHAR(50),

  -- Metadata
  description TEXT,
  target_audience VARCHAR(100),
  tags TEXT[],

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_conversion_funnels_type ON conversion_funnels(funnel_type);
CREATE INDEX idx_conversion_funnels_active ON conversion_funnels(is_active) WHERE is_active = true;
CREATE INDEX idx_conversion_funnels_experiment ON conversion_funnels(experiment_id);
```

### FunnelStage

Tracks individual stages within conversion funnels.

```sql
CREATE TABLE funnel_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funnel_id UUID NOT NULL REFERENCES conversion_funnels(id) ON DELETE CASCADE,

  -- Stage details
  stage_name VARCHAR(100) NOT NULL,
  stage_order INTEGER NOT NULL,
  stage_type VARCHAR(50) NOT NULL,

  -- Metrics
  visitors INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0.0,
  average_time_spent_seconds INTEGER DEFAULT 0,

  -- Drop-off analysis
  drop_off_count INTEGER DEFAULT 0,
  drop_off_rate DECIMAL(5,2) DEFAULT 0.0,

  -- A/B Testing
  experiment_id UUID,
  variant_name VARCHAR(50),

  -- Metadata
  description TEXT,
  success_criteria JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(funnel_id, stage_order)
);

-- Indexes
CREATE INDEX idx_funnel_stages_funnel_id ON funnel_stages(funnel_id);
CREATE INDEX idx_funnel_stages_order ON funnel_stages(funnel_id, stage_order);
CREATE INDEX idx_funnel_stages_experiment ON funnel_stages(experiment_id);
```

### UserExperience

Tracks user experience metrics and feedback.

```sql
CREATE TABLE user_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  journey_id UUID REFERENCES customer_journeys(id) ON DELETE SET NULL,

  -- Experience details
  experience_type VARCHAR(50) NOT NULL CHECK (experience_type IN ('flow', 'feature', 'interaction', 'onboarding', 'support')),
  feature_name VARCHAR(100),
  page_url VARCHAR(500),

  -- Metrics
  satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  ease_of_use_rating INTEGER CHECK (ease_of_use_rating >= 1 AND ease_of_use_rating <= 5),
  completion_success BOOLEAN,

  -- Feedback
  positive_feedback TEXT,
  negative_feedback TEXT,
  suggestions TEXT,

  -- Context
  device_type VARCHAR(50),
  browser_info VARCHAR(100),
  session_duration_seconds INTEGER,

  -- Analytics
  frustration_points JSONB DEFAULT '[]',
  success_moments JSONB DEFAULT '[]',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_user_experiences_user_id ON user_experiences(user_id);
CREATE INDEX idx_user_experiences_journey_id ON user_experiences(journey_id);
CREATE INDEX idx_user_experiences_type ON user_experiences(experience_type);
CREATE INDEX idx_user_experiences_rating ON user_experiences(satisfaction_rating);
CREATE INDEX idx_user_experiences_created ON user_experiences(created_at);
```

### JourneyAnalytics

Aggregated analytics data for journey performance.

```sql
CREATE TABLE journey_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  journey_type VARCHAR(50) NOT NULL,
  stage_name VARCHAR(100) NOT NULL,

  -- Aggregated metrics
  total_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 0.0,

  -- Time metrics
  average_completion_time_minutes DECIMAL(8,2) DEFAULT 0.0,
  median_completion_time_minutes DECIMAL(8,2) DEFAULT 0.0,

  -- Quality metrics
  satisfaction_score DECIMAL(3,2) DEFAULT 0.0,
  drop_off_rate DECIMAL(5,2) DEFAULT 0.0,

  -- Conversion metrics
  conversion_rate DECIMAL(5,2) DEFAULT 0.0,
  revenue_impact DECIMAL(10,2) DEFAULT 0.0,

  -- Segmentation
  user_segment VARCHAR(50),
  device_type VARCHAR(50),
  acquisition_channel VARCHAR(50),

  -- Experimentation
  experiment_id UUID,
  variant_name VARCHAR(50),

  -- Metadata
  data_quality_score DECIMAL(3,2) DEFAULT 1.0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(date, journey_type, stage_name, user_segment, experiment_id, variant_name)
);

-- Indexes
CREATE INDEX idx_journey_analytics_date ON journey_analytics(date);
CREATE INDEX idx_journey_analytics_type ON journey_analytics(journey_type);
CREATE INDEX idx_journey_analytics_stage ON journey_analytics(stage_name);
CREATE INDEX idx_journey_analytics_segment ON journey_analytics(user_segment);
CREATE INDEX idx_journey_analytics_experiment ON journey_analytics(experiment_id);
```

## Supporting Tables

### JourneyTemplates

Predefined journey templates for different user types.

```sql
CREATE TABLE journey_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name VARCHAR(100) NOT NULL UNIQUE,
  journey_type VARCHAR(50) NOT NULL,
  persona_type VARCHAR(50),

  -- Template configuration
  stages JSONB NOT NULL,
  touchpoints JSONB NOT NULL,
  success_criteria JSONB DEFAULT '{}',

  -- Usage tracking
  usage_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0.0,

  -- Metadata
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  version VARCHAR(20) DEFAULT '1.0',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### ExperimentConfigs

Configuration for A/B testing experiments.

```sql
CREATE TABLE experiment_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_name VARCHAR(100) NOT NULL UNIQUE,
  experiment_type VARCHAR(50) NOT NULL CHECK (experiment_type IN ('journey_flow', 'ui_variant', 'messaging', 'pricing', 'feature')),

  -- Experiment setup
  target_audience JSONB DEFAULT '{}',
  variants JSONB NOT NULL, -- Array of variant configurations
  traffic_allocation JSONB DEFAULT '{"control": 50, "variant_a": 50}',

  -- Timing
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'completed', 'cancelled')),

  -- Success metrics
  primary_metric VARCHAR(50),
  secondary_metrics JSONB DEFAULT '[]',
  minimum_sample_size INTEGER DEFAULT 1000,

  -- Results
  winner_variant VARCHAR(50),
  confidence_level DECIMAL(5,2),
  improvement_percentage DECIMAL(5,2),

  -- Metadata
  hypothesis TEXT,
  description TEXT,
  owner VARCHAR(100),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## TypeScript Interfaces

```typescript
interface CustomerJourney {
  id: string;
  userId: string;
  journeyType: 'consumer' | 'professional' | 'partner';
  currentStage: string;
  startedAt: Date;
  completedAt?: Date;
  isActive: boolean;
  metadata: Record<string, any>;
  personaType?: string;
  entryPoint?: string;
  targetOutcome?: string;
  completionPercentage: number;
  timeSpentMinutes: number;
  touchpointCount: number;
}

interface Touchpoint {
  id: string;
  journeyId: string;
  userId: string;
  touchpointType: string;
  touchpointName: string;
  channel: 'web' | 'mobile' | 'email' | 'api' | 'support';
  pageUrl?: string;
  featureName?: string;
  actionTaken?: string;
  startedAt: Date;
  completedAt?: Date;
  durationSeconds?: number;
  success?: boolean;
  errorMessage?: string;
  userFeedbackRating?: number;
  metadata: Record<string, any>;
  performanceMetrics: Record<string, any>;
}

interface BusinessProcess {
  id: string;
  processName: string;
  processType: 'onboarding' | 'document_processing' | 'professional_matching' | 'billing' | 'support' | 'compliance';
  isActive: boolean;
  priority: number;
  maxExecutionTimeMinutes: number;
  triggerEvents: string[];
  automationRules: Record<string, any>;
  fallbackProcedures: Record<string, any>;
  successRate: number;
  averageExecutionTimeSeconds: number;
  errorCount: number;
  description?: string;
  ownerTeam?: string;
  tags: string[];
}

interface ConversionFunnel {
  id: string;
  funnelName: string;
  funnelType: 'awareness' | 'consideration' | 'purchase' | 'retention' | 'advocacy';
  stages: FunnelStage[];
  isActive: boolean;
  totalVisitors: number;
  conversionRate: number;
  averageTimeToConvertDays?: number;
  experimentId?: string;
  variantName?: string;
  description?: string;
  targetAudience?: string;
  tags: string[];
}

interface UserExperience {
  id: string;
  userId: string;
  journeyId?: string;
  experienceType: 'flow' | 'feature' | 'interaction' | 'onboarding' | 'support';
  featureName?: string;
  pageUrl?: string;
  satisfactionRating?: number;
  easeOfUseRating?: number;
  completionSuccess?: boolean;
  positiveFeedback?: string;
  negativeFeedback?: string;
  suggestions?: string;
  deviceType?: string;
  browserInfo?: string;
  sessionDurationSeconds?: number;
  frustrationPoints: string[];
  successMoments: string[];
}

interface JourneyAnalytics {
  id: string;
  date: Date;
  journeyType: string;
  stageName: string;
  totalUsers: number;
  activeUsers: number;
  completionRate: number;
  averageCompletionTimeMinutes: number;
  medianCompletionTimeMinutes: number;
  satisfactionScore: number;
  dropOffRate: number;
  conversionRate: number;
  revenueImpact: number;
  userSegment?: string;
  deviceType?: string;
  acquisitionChannel?: string;
  experimentId?: string;
  variantName?: string;
  dataQualityScore: number;
}
```

## Data Flow and Relationships

### Journey Creation Flow

1. User initiates journey (registration, feature usage, etc.)
2. System creates `customer_journeys` record
3. Journey progresses through stages, creating `touchpoints`
4. User provides feedback via `user_experiences`
5. Analytics aggregated in `journey_analytics`

### Process Automation Flow

1. Business event triggers process via `business_processes`
2. System creates `process_executions` record
3. Process executes with monitoring and error handling
4. Results stored and metrics updated

### Conversion Tracking Flow

1. User enters funnel via `conversion_funnels`
2. Progress tracked through `funnel_stages`
3. A/B testing via `experiment_configs`
4. Analytics and optimization insights generated

## Security and Privacy

### Data Protection

- User journey data encrypted at rest
- PII minimized in analytics aggregations
- Consent-based tracking with clear opt-out
- Data retention policies enforced

### Access Control

- Journey data scoped to user ownership
- Analytics access restricted by role
- Process execution logs audited
- Experiment data isolated by user segments

## Performance Considerations

### Indexing Strategy

- Composite indexes for common query patterns
- Partial indexes for active records
- Time-based partitioning for analytics tables
- JSONB indexes for metadata queries

### Query Optimization

- Aggregated analytics pre-computed
- Real-time metrics cached
- Asynchronous processing for heavy computations
- Pagination for large result sets

## Migration Strategy

### Data Migration

- Existing user journey data imported
- Legacy analytics migrated to new schema
- Process execution history preserved
- Backward compatibility maintained

### Schema Evolution

- Zero-downtime migrations
- Backward-compatible changes
- Data validation and integrity checks
- Rollback procedures documented

This data model provides a comprehensive foundation for the Business Journeys system, supporting journey mapping, process automation, experience optimization, and conversion analytics while maintaining performance, security, and scalability.
