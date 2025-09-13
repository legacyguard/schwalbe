# Email Resend - Data Model

## Core Email Entities

### EmailConfig

- `id: string` - Unique identifier
- `serviceProvider: 'resend'` - Email service provider
- `apiKey: string` - Encrypted API key
- `fromEmail: string` - Default from email address
- `fromName: string` - Default from name
- `replyToEmail: string` - Default reply-to email
- `webhookUrl: string` - Webhook URL for delivery events
- `webhookSecret: string` - Webhook verification secret
- `rateLimit: number` - Emails per minute limit
- `isActive: boolean` - Configuration active status
- `createdAt: timestamp` - Creation time
- `updatedAt: timestamp` - Last update time

### EmailTemplate

- `id: string` - Unique identifier
- `name: string` - Template name
- `subject: string` - Email subject template
- `htmlContent: string` - HTML email content
- `textContent: string` - Plain text content
- `variables: string[]` - Available template variables
- `category: 'welcome' | 'notification' | 'alert' | 'transactional'` - Template category
- `language: string` - Template language (default: 'en')
- `isActive: boolean` - Template active status
- `version: number` - Template version
- `createdAt: timestamp` - Creation time
- `updatedAt: timestamp` - Last update time

### EmailDelivery

- `id: string` - Unique identifier
- `messageId: string` - Resend message ID
- `templateId: string` - Associated template ID
- `toEmail: string` - Recipient email address
- `toName: string` - Recipient name
- `fromEmail: string` - Sender email address
- `subject: string` - Email subject
- `status: 'queued' | 'sent' | 'delivered' | 'bounced' | 'complained' | 'failed'` - Delivery status
- `sentAt: timestamp` - Send timestamp
- `deliveredAt: timestamp` - Delivery timestamp
- `bouncedAt: timestamp` - Bounce timestamp
- `errorMessage: string` - Error details
- `retryCount: number` - Number of retry attempts
- `userId: string` - Associated user ID
- `metadata: object` - Additional delivery metadata
- `createdAt: timestamp` - Creation time
- `updatedAt: timestamp` - Last update time

### NotificationRule

- `id: string` - Unique identifier
- `name: string` - Rule name
- `eventType: string` - Trigger event type
- `templateId: string` - Associated email template
- `conditions: object` - Rule trigger conditions
- `schedule: object` - Notification schedule
- `priority: 'low' | 'medium' | 'high'` - Notification priority
- `isActive: boolean` - Rule active status
- `createdAt: timestamp` - Creation time
- `updatedAt: timestamp` - Last update time

### UserPreference

- `id: string` - Unique identifier
- `userId: string` - Associated user ID
- `emailNotifications: boolean` - Global email notifications enabled
- `marketingEmails: boolean` - Marketing emails opt-in
- `transactionalEmails: boolean` - Transactional emails enabled
- `frequency: 'immediate' | 'daily' | 'weekly'` - Notification frequency
- `categories: string[]` - Enabled notification categories
- `quietHours: object` - Quiet hours configuration
- `timezone: string` - User timezone
- `createdAt: timestamp` - Creation time
- `updatedAt: timestamp` - Last update time

### EmailLog

- `id: string` - Unique identifier
- `deliveryId: string` - Associated delivery ID
- `eventType: 'sent' | 'delivered' | 'bounced' | 'complained' | 'opened' | 'clicked'` - Log event type
- `timestamp: timestamp` - Event timestamp
- `details: object` - Event-specific details
- `ipAddress: string` - Client IP address
- `userAgent: string` - Client user agent
- `metadata: object` - Additional log metadata

## Relations

- EmailConfig 1—N EmailDelivery (one config, many deliveries)
- EmailTemplate 1—N EmailDelivery (one template, many deliveries)
- EmailTemplate 1—N NotificationRule (one template, many rules)
- NotificationRule 1—N EmailDelivery (one rule, many deliveries)
- UserPreference 1—1 User (one preference per user)
- UserPreference 1—N EmailDelivery (one preference, many deliveries)
- EmailDelivery 1—N EmailLog (one delivery, many log events)

## Database Schema Extensions

### email_configs table

```sql
CREATE TABLE email_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_provider TEXT NOT NULL DEFAULT 'resend',
  api_key TEXT NOT NULL, -- encrypted
  from_email TEXT NOT NULL,
  from_name TEXT,
  reply_to_email TEXT,
  webhook_url TEXT,
  webhook_secret TEXT,
  rate_limit INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### email_templates table

```sql
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT,
  text_content TEXT,
  variables TEXT[] DEFAULT '{}',
  category TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### email_deliveries table

```sql
CREATE TABLE email_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id TEXT,
  template_id UUID REFERENCES email_templates(id),
  to_email TEXT NOT NULL,
  to_name TEXT,
  from_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  user_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### notification_rules table

```sql
CREATE TABLE notification_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  template_id UUID REFERENCES email_templates(id),
  conditions JSONB DEFAULT '{}',
  schedule JSONB DEFAULT '{}',
  priority TEXT DEFAULT 'medium',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### user_email_preferences table

```sql
CREATE TABLE user_email_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  email_notifications BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT false,
  transactional_emails BOOLEAN DEFAULT true,
  frequency TEXT DEFAULT 'immediate',
  categories TEXT[] DEFAULT '{}',
  quiet_hours JSONB DEFAULT '{}',
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### email_logs table

```sql
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id UUID REFERENCES email_deliveries(id),
  event_type TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'
);
