# Emotional Core MVP - Data Model

## Overview

The Emotional Core MVP data model captures user emotional states, engagement patterns, and conversion metrics to enable personalized emotional experiences and continuous optimization. The model supports anonymous emotional tracking while maintaining privacy compliance.

## Core Entities

### EmotionalConfig Entity

**Purpose**: Stores configuration settings for emotional design system and user preferences.

**Fields**:

- `id` (UUID, Primary Key): Unique configuration identifier
- `user_id` (UUID, Foreign Key): Reference to authenticated user (nullable for anonymous)
- `theme` (JSONB): Emotional color palette and design preferences
- `motion_preferences` (JSONB): Animation and motion sensitivity settings
- `language` (TEXT): Preferred emotional language style
- `notification_settings` (JSONB): Emotional milestone notification preferences
- `privacy_level` (TEXT): Data sharing and tracking consent level
- `created_at` (TIMESTAMPTZ): Configuration creation timestamp
- `updated_at` (TIMESTAMPTZ): Last configuration update timestamp

**Indexes**:

- `idx_emotional_config_user_id` on `user_id`
- `idx_emotional_config_updated_at` on `updated_at`

**Constraints**:

- `privacy_level` must be one of: 'anonymous', 'basic', 'detailed', 'full'
- `theme` must contain valid color palette structure
- `motion_preferences` must include accessibility settings

### UserEmotion Entity

**Purpose**: Tracks user emotional states throughout their journey for personalization and optimization.

**Fields**:

- `id` (UUID, Primary Key): Unique emotional state record identifier
- `user_id` (UUID, Foreign Key): Reference to authenticated user (nullable for anonymous)
- `session_id` (TEXT): Browser session identifier for anonymous tracking
- `phase` (TEXT): Current onboarding/emotional phase
- `anxiety_level` (INTEGER): Self-reported anxiety (1-5 scale)
- `confidence_level` (INTEGER): Self-reported confidence (1-5 scale)
- `engagement_score` (DECIMAL): Calculated engagement intensity (0-1)
- `emotional_context` (TEXT): Current emotional context or trigger
- `interaction_type` (TEXT): Type of interaction that prompted measurement
- `metadata` (JSONB): Additional emotional context data
- `timestamp` (TIMESTAMPTZ): Emotional state measurement timestamp

**Indexes**:

- `idx_user_emotion_user_id_timestamp` on `user_id`, `timestamp`
- `idx_user_emotion_session_id_timestamp` on `session_id`, `timestamp`
- `idx_user_emotion_phase` on `phase`

**Constraints**:

- `anxiety_level` must be between 1 and 5
- `confidence_level` must be between 1 and 5
- `engagement_score` must be between 0 and 1
- `phase` must be one of: 'landing', 'sofia_intro', 'onboarding_start', 'act1', 'act2', 'act3', 'completion'

### EngagementMetric Entity

**Purpose**: Captures detailed engagement metrics for emotional design elements and user interactions.

**Fields**:

- `id` (UUID, Primary Key): Unique engagement metric record identifier
- `user_id` (UUID, Foreign Key): Reference to authenticated user (nullable for anonymous)
- `session_id` (TEXT): Browser session identifier for anonymous tracking
- `component_id` (TEXT): Identifier of the emotional component
- `interaction_type` (TEXT): Type of user interaction
- `duration` (INTEGER): Interaction duration in milliseconds
- `emotional_impact` (DECIMAL): Estimated emotional impact score (0-1)
- `completion_rate` (DECIMAL): Component interaction completion rate (0-1)
- `accessibility_used` (BOOLEAN): Whether accessibility features were used
- `device_info` (JSONB): Device and browser information
- `timestamp` (TIMESTAMPTZ): Engagement measurement timestamp

**Indexes**:

- `idx_engagement_metric_user_id_timestamp` on `user_id`, `timestamp`
- `idx_engagement_metric_component_id` on `component_id`
- `idx_engagement_metric_interaction_type` on `interaction_type`

**Constraints**:

- `emotional_impact` must be between 0 and 1
- `completion_rate` must be between 0 and 1
- `interaction_type` must be one of: 'view', 'hover', 'click', 'scroll', 'animation_complete', 'celebration_viewed'

### ConversionFunnel Entity

**Purpose**: Tracks user progression through emotional conversion funnel with bottleneck identification.

**Fields**:

- `id` (UUID, Primary Key): Unique funnel record identifier
- `user_id` (UUID, Foreign Key): Reference to authenticated user (nullable for anonymous)
- `session_id` (TEXT): Browser session identifier for anonymous tracking
- `funnel_step` (TEXT): Current position in conversion funnel
- `previous_step` (TEXT): Previous funnel step for flow analysis
- `time_in_step` (INTEGER): Time spent in current step (milliseconds)
- `emotional_state_entry` (INTEGER): Anxiety level when entering step (1-5)
- `emotional_state_exit` (INTEGER): Anxiety level when exiting step (1-5)
- `conversion_probability` (DECIMAL): Predicted conversion likelihood (0-1)
- `ab_test_variant` (TEXT): A/B test variant identifier
- `metadata` (JSONB): Additional funnel context data
- `timestamp` (TIMESTAMPTZ): Funnel step timestamp

**Indexes**:

- `idx_conversion_funnel_user_id_timestamp` on `user_id`, `timestamp`
- `idx_conversion_funnel_funnel_step` on `funnel_step`
- `idx_conversion_funnel_ab_test_variant` on `ab_test_variant`

**Constraints**:

- `emotional_state_entry` must be between 1 and 5
- `emotional_state_exit` must be between 1 and 5
- `conversion_probability` must be between 0 and 1
- `funnel_step` must be one of: 'landing_view', 'sofia_interaction', 'onboarding_start', 'act1_complete', 'act2_complete', 'act3_complete', 'final_conversion'

### UserJourney Entity

**Purpose**: Comprehensive tracking of user emotional journey with pattern recognition and personalization.

**Fields**:

- `id` (UUID, Primary Key): Unique journey record identifier
- `user_id` (UUID, Foreign Key): Reference to authenticated user (nullable for anonymous)
- `session_id` (TEXT): Browser session identifier for anonymous tracking
- `journey_start` (TIMESTAMPTZ): Journey initiation timestamp
- `journey_end` (TIMESTAMPTZ): Journey completion timestamp (nullable)
- `total_duration` (INTEGER): Total journey duration in milliseconds
- `emotional_arc` (JSONB): Emotional state progression throughout journey
- `engagement_pattern` (JSONB): User engagement pattern analysis
- `conversion_path` (JSONB): Detailed conversion funnel progression
- `personalization_profile` (JSONB): Derived user emotional preferences
- `completion_status` (TEXT): Journey completion state
- `feedback_rating` (INTEGER): User satisfaction rating (1-5, nullable)
- `feedback_comments` (TEXT): User qualitative feedback

**Indexes**:

- `idx_user_journey_user_id_start` on `user_id`, `journey_start`
- `idx_user_journey_completion_status` on `completion_status`
- `idx_user_journey_journey_start` on `journey_start`

**Constraints**:

- `completion_status` must be one of: 'in_progress', 'completed', 'abandoned', 'error'
- `feedback_rating` must be between 1 and 5 when provided
- `emotional_arc` must contain valid emotional progression data structure

### EmotionalImpact Entity

**Purpose**: Aggregated emotional impact measurements for system optimization and reporting.

**Fields**:

- `id` (UUID, Primary Key): Unique impact measurement identifier
- `user_id` (UUID, Foreign Key): Reference to authenticated user (nullable for anonymous)
- `session_id` (TEXT): Browser session identifier for anonymous tracking
- `measurement_type` (TEXT): Type of emotional impact measurement
- `baseline_value` (DECIMAL): Pre-intervention emotional state value
- `post_value` (DECIMAL): Post-intervention emotional state value
- `impact_score` (DECIMAL): Calculated emotional impact score (-1 to 1)
- `confidence_level` (DECIMAL): Statistical confidence in measurement (0-1)
- `intervention_type` (TEXT): Type of emotional intervention applied
- `context_data` (JSONB): Additional measurement context
- `measurement_date` (DATE): Date of impact measurement
- `timestamp` (TIMESTAMPTZ): Measurement timestamp

**Indexes**:

- `idx_emotional_impact_user_id_date` on `user_id`, `measurement_date`
- `idx_emotional_impact_measurement_type` on `measurement_type`
- `idx_emotional_impact_intervention_type` on `intervention_type`

**Constraints**:

- `impact_score` must be between -1 and 1
- `confidence_level` must be between 0 and 1
- `measurement_type` must be one of: 'anxiety_reduction', 'engagement_increase', 'satisfaction_improvement', 'conversion_optimization'
- `intervention_type` must be one of: 'night_sky_design', 'sofia_presence', 'onboarding_flow', 'celebration_system', 'personalization'

## Entity Relationships

### User-Centric Relationships

```text
User (auth.users)
├── 1:1 EmotionalConfig (user_id)
├── 1:M UserEmotion (user_id)
├── 1:M EngagementMetric (user_id)
├── 1:M ConversionFunnel (user_id)
├── 1:M UserJourney (user_id)
└── 1:M EmotionalImpact (user_id)
```

### Session-Based Anonymous Tracking

```text
Session (anonymous)
├── 1:M UserEmotion (session_id)
├── 1:M EngagementMetric (session_id)
├── 1:M ConversionFunnel (session_id)
├── 1:M UserJourney (session_id)
└── 1:M EmotionalImpact (session_id)
```

### Analytical Relationships

```text
EmotionalConfig
└── influences → UserJourney.personalization_profile

UserEmotion
├── feeds → EmotionalImpact.baseline_value/post_value
└── influences → ConversionFunnel.emotional_state_*

EngagementMetric
├── contributes → UserJourney.engagement_pattern
└── influences → EmotionalImpact.intervention_effectiveness

ConversionFunnel
├── builds → UserJourney.conversion_path
└── feeds → EmotionalImpact.conversion_optimization

UserJourney
├── aggregates → EmotionalImpact.pattern_analysis
└── generates → EmotionalConfig.personalization_updates

EmotionalImpact
└── drives → EmotionalConfig.optimization_recommendations
```

## Data Flow Architecture

### Ingestion Pipeline

1. **Real-time Collection**: Client-side emotional state and engagement tracking
2. **Privacy Filtering**: Anonymous session-based collection for non-authenticated users
3. **Validation Layer**: Data quality and privacy compliance validation
4. **Storage Layer**: Partitioned storage with retention policies

### Processing Pipeline

1. **Aggregation Layer**: Real-time metrics aggregation and alerting
2. **Analysis Layer**: Pattern recognition and personalization profile generation
3. **Optimization Layer**: A/B testing results and recommendation generation
4. **Reporting Layer**: Stakeholder dashboards and automated insights

### Privacy & Compliance

### Data Retention Policies

- **Anonymous Session Data**: 90 days retention for optimization
- **Authenticated User Data**: 2 years retention for personalization
- **Aggregated Analytics**: Indefinite retention for system improvement
- **Raw Emotional Data**: 30 days retention with automatic anonymization

### Privacy Controls

- **Consent Management**: Granular opt-in/opt-out for emotional tracking
- **Data Minimization**: Only essential emotional data collected
- **Anonymization**: Automatic anonymization of sensitive emotional patterns
- **Access Controls**: Role-based access to emotional data and analytics

### Compliance Requirements

- **GDPR**: Right to erasure, data portability, privacy by design
- **CCPA**: Opt-out mechanisms, data sharing transparency
- **Accessibility**: WCAG 2.1 AA compliance for emotional interfaces
- **Security**: End-to-end encryption for sensitive emotional data

## Performance Considerations

### Indexing Strategy

- **Time-based Partitioning**: All timestamped tables partitioned by date
- **Composite Indexes**: Optimized for common query patterns
- **Partial Indexes**: Efficient filtering for active user data
- **GIN Indexes**: Fast JSONB querying for complex emotional data

### Query Optimization

- **Materialized Views**: Pre-computed emotional analytics
- **Caching Strategy**: Redis caching for frequent emotional queries
- **Batch Processing**: Asynchronous processing for heavy emotional analysis
- **Read Replicas**: Separate read workloads for analytics queries

### Scalability Design

- **Horizontal Scaling**: Stateless emotional processing services
- **Event-Driven Architecture**: Asynchronous emotional event processing
- **Micro-batch Processing**: Efficient handling of emotional data streams
- **Global Distribution**: CDN-based emotional content delivery

This data model provides the foundation for capturing, analyzing, and optimizing the emotional user experience while maintaining strict privacy and performance standards.
