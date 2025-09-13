# Sharing, Reminders, Analytics, and Sofia AI Expansion - Data Model

## Core Sharing System Entities

### SharingConfig

```sql
CREATE TABLE sharing_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  resource_type TEXT NOT NULL, -- 'document', 'will', 'vault', 'family'
  resource_id TEXT NOT NULL,
  share_url TEXT UNIQUE NOT NULL,
  permissions JSONB NOT NULL DEFAULT '{
    "read": true,
    "download": false,
    "comment": false,
    "share": false
  }',
  expires_at TIMESTAMP WITH TIME ZONE,
  max_access_count INTEGER,
  access_count INTEGER DEFAULT 0,
  password_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT NOT NULL,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Indexes
CREATE INDEX idx_sharing_config_user_id ON sharing_config(user_id);
CREATE INDEX idx_sharing_config_share_url ON sharing_config(share_url);
CREATE INDEX idx_sharing_config_expires_at ON sharing_config(expires_at);
CREATE INDEX idx_sharing_config_resource ON sharing_config(resource_type, resource_id);
```

### SharingLog

```sql
CREATE TABLE sharing_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sharing_config_id UUID NOT NULL REFERENCES sharing_config(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'created', 'accessed', 'expired', 'revoked'
  user_id TEXT, -- NULL for anonymous access
  ip_address INET,
  user_agent TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sharing_log_config_id ON sharing_log(sharing_config_id);
CREATE INDEX idx_sharing_log_created_at ON sharing_log(created_at DESC);
CREATE INDEX idx_sharing_log_action ON sharing_log(action);
```

## Reminder System Entities

### ReminderRule

```sql
CREATE TABLE reminder_rule (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  recurrence_rule TEXT, -- RRULE format
  recurrence_end_at TIMESTAMP WITH TIME ZONE,
  channels JSONB NOT NULL DEFAULT '["email"]',
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  next_execution_at TIMESTAMP WITH TIME ZONE,
  last_executed_at TIMESTAMP WITH TIME ZONE,
  execution_count INTEGER DEFAULT 0,
  max_executions INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_reminder_rule_user_id ON reminder_rule(user_id);
CREATE INDEX idx_reminder_rule_scheduled_at ON reminder_rule(scheduled_at);
CREATE INDEX idx_reminder_rule_next_execution ON reminder_rule(next_execution_at);
CREATE INDEX idx_reminder_rule_status ON reminder_rule(status);
```

### NotificationLog

```sql
CREATE TABLE notification_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reminder_rule_id UUID REFERENCES reminder_rule(id) ON DELETE CASCADE,
  channel TEXT NOT NULL, -- 'email', 'in_app', 'sms', 'push'
  recipient TEXT NOT NULL,
  status TEXT NOT NULL, -- 'sent', 'delivered', 'failed', 'bounced'
  provider_response JSONB,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- Indexes
CREATE INDEX idx_notification_log_reminder_id ON notification_log(reminder_rule_id);
CREATE INDEX idx_notification_log_status ON notification_log(status);
CREATE INDEX idx_notification_log_sent_at ON notification_log(sent_at DESC);
```

## Analytics System Entities

### AnalyticsEvent

```sql
CREATE TABLE analytics_event (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  session_id TEXT,
  event_type TEXT NOT NULL,
  event_category TEXT NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}',
  user_consent_given BOOLEAN DEFAULT false,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_analytics_event_user_id ON analytics_event(user_id);
CREATE INDEX idx_analytics_event_type ON analytics_event(event_type);
CREATE INDEX idx_analytics_event_category ON analytics_event(event_category);
CREATE INDEX idx_analytics_event_created_at ON analytics_event(created_at DESC);
CREATE INDEX idx_analytics_event_consent ON analytics_event(user_consent_given);
```

### AnalyticsDashboard

```sql
CREATE TABLE analytics_dashboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  dashboard_config JSONB NOT NULL DEFAULT '{}',
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_analytics_dashboard_user_id ON analytics_dashboard(user_id);
CREATE INDEX idx_analytics_dashboard_last_viewed ON analytics_dashboard(last_viewed_at DESC);
```

### UserAnalyticsPreferences

```sql
CREATE TABLE user_analytics_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  analytics_enabled BOOLEAN DEFAULT true,
  data_retention_days INTEGER DEFAULT 90,
  allowed_categories JSONB NOT NULL DEFAULT '["sharing", "reminder", "sofia", "document", "will", "vault", "family", "navigation", "engagement"]',
  consent_version TEXT NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_user_analytics_preferences_user_id ON user_analytics_preferences(user_id);
CREATE INDEX idx_user_analytics_preferences_enabled ON user_analytics_preferences(analytics_enabled);
```

## Sofia AI Expansion Entities

### SofiaAIConversation

```sql
CREATE TABLE sofia_ai_conversation (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  conversation_context JSONB NOT NULL DEFAULT '{}',
  personality_state JSONB NOT NULL DEFAULT '{}',
  task_history JSONB NOT NULL DEFAULT '[]',
  memory_items JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sofia_conversation_user_id ON sofia_ai_conversation(user_id);
CREATE INDEX idx_sofia_conversation_session_id ON sofia_ai_conversation(session_id);
CREATE INDEX idx_sofia_conversation_last_activity ON sofia_ai_conversation(last_activity_at DESC);
```

### SofiaAIMemory

```sql
CREATE TABLE sofia_ai_memory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  memory_type TEXT NOT NULL, -- 'preference', 'pattern', 'context', 'learning'
  memory_key TEXT NOT NULL,
  memory_value JSONB NOT NULL,
  confidence_score DECIMAL(3,2) DEFAULT 1.0,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_sofia_memory_user_id ON sofia_ai_memory(user_id);
CREATE INDEX idx_sofia_memory_type_key ON sofia_ai_memory(memory_type, memory_key);
CREATE INDEX idx_sofia_memory_expires_at ON sofia_ai_memory(expires_at);
```

### SofiaAIPersonality

```sql
CREATE TABLE sofia_ai_personality (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  mode TEXT DEFAULT 'adaptive' CHECK (mode IN ('adaptive', 'empathetic', 'pragmatic', 'professional')),
  empathy_level INTEGER DEFAULT 7 CHECK (empathy_level BETWEEN 1 AND 10),
  communication_style TEXT DEFAULT 'balanced' CHECK (communication_style IN ('formal', 'casual', 'balanced')),
  preferred_language TEXT DEFAULT 'en',
  cultural_context JSONB NOT NULL DEFAULT '{}',
  task_preferences JSONB NOT NULL DEFAULT '{}',
  adaptation_history JSONB NOT NULL DEFAULT '[]',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sofia_personality_user_id ON sofia_ai_personality(user_id);
CREATE INDEX idx_sofia_personality_mode ON sofia_ai_personality(mode);
```

## Row Level Security Policies

Note: RLS policies use `app.current_external_id()` as the identity source (Clerk external ID). Reference users via `public.user_auth(clerk_id)`. Avoid `auth.uid()` when using Clerk.

```sql
-- Enable RLS on all tables
ALTER TABLE sharing_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE sharing_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_rule ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_dashboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE sofia_ai_conversation ENABLE ROW LEVEL SECURITY;
ALTER TABLE sofia_ai_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE sofia_ai_personality ENABLE ROW LEVEL SECURITY;

-- Sharing policies
CREATE POLICY "Users can manage own sharing configs" ON sharing_config
  FOR ALL USING (app.current_external_id() = user_id);

CREATE POLICY "Users can view sharing logs for own shares" ON sharing_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sharing_config
      WHERE sharing_config.id = sharing_log.sharing_config_id
AND sharing_config.user_id = app.current_external_id()
    )
  );

-- Reminder policies
CREATE POLICY "Users can manage own reminders" ON reminder_rule
  FOR ALL USING (app.current_external_id() = user_id);

CREATE POLICY "Users can view own notification logs" ON notification_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM reminder_rule
      WHERE reminder_rule.id = notification_log.reminder_rule_id
AND reminder_rule.user_id = app.current_external_id()
    )
  );

-- Analytics policies (privacy-first)
CREATE POLICY "Users can view own analytics data" ON analytics_event
  FOR SELECT USING (app.current_external_id() = user_id);

CREATE POLICY "Users can manage own analytics preferences" ON user_analytics_preferences
  FOR ALL USING (app.current_external_id() = user_id);

-- Sofia AI policies
CREATE POLICY "Users can manage own Sofia conversations" ON sofia_ai_conversation
  FOR ALL USING (app.current_external_id() = user_id);

CREATE POLICY "Users can manage own Sofia memory" ON sofia_ai_memory
  FOR ALL USING (app.current_external_id() = user_id);

CREATE POLICY "Users can manage own Sofia personality" ON sofia_ai_personality
  FOR ALL USING (app.current_external_id() = user_id);
```

## Data Relationships

### Sharing System Relations

- **SharingConfig** 1:N **SharingLog** (one config, many log entries)
- **SharingConfig** N:1 **User** (many configs per user)

### Reminder System Relations

- **ReminderRule** 1:N **NotificationLog** (one rule, many notifications)
- **ReminderRule** N:1 **User** (many rules per user)

### Analytics System Relations

- **AnalyticsEvent** N:1 **User** (many events per user)
- **AnalyticsDashboard** 1:1 **User** (one dashboard per user)
- **UserAnalyticsPreferences** 1:1 **User** (one preference set per user)

### Sofia AI Relations

- **SofiaAIConversation** N:1 **User** (many conversations per user)
- **SofiaAIMemory** N:1 **User** (many memories per user)
- **SofiaAIPersonality** 1:1 **User** (one personality per user)

## Migration Scripts

### Initial Schema Creation

```sql
-- Create all tables with proper constraints and indexes
-- Enable RLS on all tables
-- Create all security policies
-- Set up initial data for testing
```

### Hollywood Data Migration

```sql
-- Migrate existing sharing configurations
-- Convert legacy reminder data to new format
-- Import analytics preferences from user settings
-- Migrate Sofia AI conversation history
-- Update all foreign key relationships
```

This comprehensive data model supports all Phase 12 requirements: secure public share links with audit logs and expiry, reminder scheduling via functions, privacy-first analytics, and enhanced Sofia AI with context awareness, empathy prompts, and task routing.
