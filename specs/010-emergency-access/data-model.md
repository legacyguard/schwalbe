# Emergency Access System - Database Schema & API Contracts

## Data Model

### EmergencyProtocol Entity

**Fields:**

- id: UUID (Primary Key)
- user_id: UUID (Foreign Key to users)
- protocol_name: VARCHAR(100)
- activation_triggers: JSONB (trigger conditions)
- response_actions: JSONB (automated responses)
- is_active: BOOLEAN (default: true)
- priority_level: INTEGER (1-5 scale)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

**Relationships:**

- Belongs to User (user_id)
- Has many EmergencyLogs (audit trail)
- References AccessStages (permission levels)

### InactivityTrigger Entity

**Fields:**

- id: UUID (Primary Key)
- user_id: UUID (Foreign Key to users)
- threshold_days: INTEGER (inactivity period)
- grace_period_hours: INTEGER (warning period)
- last_activity_check: TIMESTAMP
- trigger_status: VARCHAR(20) ('active', 'triggered', 'resolved')
- notification_sent: BOOLEAN (default: false)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

**Relationships:**

- Belongs to User (user_id)
- Has many EmergencyLogs (trigger history)
- References EmergencyProtocol (protocol rules)

### AccessStage Entity

**Fields:**

- id: UUID (Primary Key)
- user_id: UUID (Foreign Key to users)
- stage_name: VARCHAR(50) ('initial', 'verified', 'full_access')
- permission_level: INTEGER (1-10 scale)
- time_limit_hours: INTEGER (access duration)
- allowed_document_types: TEXT[] (document categories)
- is_active: BOOLEAN (default: true)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

**Relationships:**

- Belongs to User (user_id)
- Has many DocumentReleases (access grants)
- References GuardianVerifications (approval chain)

### DocumentRelease Entity

**Fields:**

- id: UUID (Primary Key)
- user_id: UUID (Foreign Key to users)
- document_id: UUID (Foreign Key to documents)
- guardian_id: UUID (Foreign Key to guardians)
- access_stage_id: UUID (Foreign Key to access_stages)
- release_status: VARCHAR(20) ('pending', 'approved', 'denied', 'expired')
- download_url: TEXT (signed URL)
- expires_at: TIMESTAMP
- ip_address: INET (access origin)
- user_agent: TEXT (client info)
- created_at: TIMESTAMP

**Relationships:**

- Belongs to User (user_id)
- Belongs to Document (document_id)
- Belongs to Guardian (guardian_id)
- Belongs to AccessStage (access_stage_id)
- Has many EmergencyLogs (access history)

### GuardianVerification Entity

**Fields:**

- id: UUID (Primary Key)
- user_id: UUID (Foreign Key to users)
- guardian_id: UUID (Foreign Key to guardians)
- verification_method: VARCHAR(30) ('email', 'sms', 'document', 'in_person')
- verification_status: VARCHAR(20) ('pending', 'verified', 'failed', 'expired')
- verification_code: VARCHAR(10) (one-time code)
- verification_attempts: INTEGER (default: 0)
- max_attempts: INTEGER (default: 3)
- expires_at: TIMESTAMP
- verified_at: TIMESTAMP
- created_at: TIMESTAMP

**Relationships:**

- Belongs to User (user_id)
- Belongs to Guardian (guardian_id)
- Has many EmergencyLogs (verification history)
- References AccessStages (enables access)

### EmergencyLog Entity

**Fields:**

- id: UUID (Primary Key)
- user_id: UUID (Foreign Key to users)
- guardian_id: UUID (Foreign Key to guardians, nullable)
- action_type: VARCHAR(50) ('protocol_activation', 'access_granted', 'document_download', 'verification_attempt')
- action_details: JSONB (structured action data)
- ip_address: INET (action origin)
- user_agent: TEXT (client info)
- success: BOOLEAN (action outcome)
- error_message: TEXT (failure details)
- created_at: TIMESTAMP

**Relationships:**

- Belongs to User (user_id)
- Belongs to Guardian (guardian_id, optional)
- References EmergencyProtocol (protocol actions)
- References DocumentRelease (document access)
- References GuardianVerification (verification attempts)

## Entity Relationships

### Core Relationships

```mermaid
User (1) ──── (N) EmergencyProtocol
User (1) ──── (N) InactivityTrigger
User (1) ──── (N) AccessStage
User (1) ──── (N) DocumentRelease
User (1) ──── (N) GuardianVerification
User (1) ──── (N) EmergencyLog

Guardian (1) ──── (N) DocumentRelease
Guardian (1) ──── (N) GuardianVerification
Guardian (1) ──── (N) EmergencyLog

Document (1) ──── (N) DocumentRelease

EmergencyProtocol (1) ──── (N) EmergencyLog
AccessStage (1) ──── (N) DocumentRelease
GuardianVerification (1) ──── (N) EmergencyLog
```

### Business Logic Relationships

- EmergencyProtocol defines rules for InactivityTrigger activation
- AccessStage controls permissions for DocumentRelease
- GuardianVerification enables AccessStage progression
- EmergencyLog tracks all system activities for audit compliance

```sql
CREATE TABLE family_shield_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  inactivity_period_months INTEGER DEFAULT 6 CHECK (inactivity_period_months > 0),
  required_guardians_for_activation INTEGER DEFAULT 2 CHECK (required_guardians_for_activation > 0),
  is_shield_enabled BOOLEAN DEFAULT false,
  last_activity_check TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  shield_status VARCHAR(20) DEFAULT 'inactive' CHECK (shield_status IN ('inactive', 'pending_verification', 'active')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes:**

- `idx_shield_settings_user_id` on (user_id)
- `idx_shield_settings_status` on (shield_status)
- `idx_shield_settings_activity_check` on (last_activity_check) WHERE shield_status = 'inactive'

**RLS Policies:**

- Users can view/update their own settings
- Service role can manage all settings

#### guardians (Enhanced)

Extended guardian table with granular permissions for emergency access.

```sql
CREATE TABLE guardians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  relationship TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,

  -- Emergency access permissions
  can_access_health_docs BOOLEAN DEFAULT false,
  can_access_financial_docs BOOLEAN DEFAULT false,
  is_child_guardian BOOLEAN DEFAULT false,
  is_will_executor BOOLEAN DEFAULT false,
  can_trigger_emergency BOOLEAN DEFAULT false,
  emergency_contact_priority INTEGER DEFAULT 1,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Permission Hierarchy:**

- `can_access_health_docs`: Access to medical records, insurance, health directives
- `can_access_financial_docs`: Access to bank accounts, investments, financial planning
- `is_child_guardian`: Access to children's education, medical, and custody documents
- `is_will_executor`: Access to estate planning, will execution, legal documents
- `can_trigger_emergency`: Permission to manually activate Family Shield

#### emergency_access_tokens

Secure tokens for guardian access during emergency situations.

```sql
CREATE TABLE emergency_access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  guardian_id UUID NOT NULL REFERENCES guardians(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  verification_code VARCHAR(10),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  activation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  activation_reason VARCHAR(50) NOT NULL CHECK (activation_reason IN ('manual', 'inactivity', 'health_check', 'emergency')),
  permissions JSONB NOT NULL DEFAULT '{}',
  requires_verification BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  access_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### emergency_access_logs

Comprehensive audit trail for all emergency access activities.

```sql
CREATE TABLE emergency_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id UUID REFERENCES emergency_access_tokens(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  guardian_id UUID REFERENCES guardians(id) ON DELETE CASCADE,
  access_type VARCHAR(50) NOT NULL CHECK (access_type IN ('token_verification', 'document_download', 'manual_download', 'family_shield_activation')),
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### guardian_notifications

Notification system for emergency alerts and status updates.

```sql
CREATE TABLE guardian_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_id UUID NOT NULL REFERENCES guardians(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('activation_request', 'verification_needed', 'shield_activated', 'status_update')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_required BOOLEAN DEFAULT false,
  action_url TEXT,
  verification_token UUID,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  delivery_method VARCHAR(20) DEFAULT 'email' CHECK (delivery_method IN ('email', 'sms', 'push', 'all')),
  sent_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  responded_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  delivery_error TEXT,
  attempted_at TIMESTAMP WITH TIME ZONE,
  delivery_status VARCHAR(20) DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### user_health_checks

Activity monitoring and responsiveness tracking for inactivity detection.

```sql
CREATE TABLE user_health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  check_type VARCHAR(30) NOT NULL CHECK (check_type IN ('login', 'document_access', 'api_ping', 'manual_confirmation')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('responded', 'missed', 'pending')),
  scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  response_method VARCHAR(50),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### emergency_detection_rules

Configurable rules for detecting emergency situations.

```sql
CREATE TABLE emergency_detection_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rule_name VARCHAR(100) NOT NULL,
  description TEXT,
  rule_type VARCHAR(30) NOT NULL CHECK (rule_type IN ('inactivity', 'health_check', 'guardian_manual', 'suspicious_activity')),
  is_enabled BOOLEAN DEFAULT true,
  trigger_conditions JSONB NOT NULL DEFAULT '[]',
  response_actions JSONB NOT NULL DEFAULT '[]',
  priority INTEGER DEFAULT 1,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  trigger_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API Contracts

### Emergency Access Endpoints

#### POST /api/emergency/verify-access

Verify emergency access token and return accessible resources.

**Request:**

```typescript
{
  token: string;
  verification_code?: string;
}
```

**Response:**

```typescript
{
  data: {
    user_name: string;
    guardian_name: string;
    guardian_permissions: GuardianPermissions;
    activation_date: string;
    expires_at: string;
    survivor_manual: {
      html_content: string;
      entries_count: number;
      generated_at: string;
    };
    documents: Array<{
      id: string;
      title: string;
      type: string;
      category: string;
      created_at: string;
      encrypted_url?: string;
    }>;
    emergency_contacts: Array<{
      name: string;
      relationship: string;
      email: string;
      phone?: string;
      can_help_with: string[];
    }>;
  }
}
```

#### POST /api/emergency/activate-shield

Activate Family Shield for a user.

**Request:**

```typescript
{
  user_id: string;
  guardian_id: string;
  activation_reason: 'manual' | 'inactivity' | 'health_check' | 'emergency';
  personality_mode?: 'empathetic' | 'pragmatic' | 'adaptive';
  custom_message?: string;
}
```

**Response:**

```typescript
{
  success: boolean;
  data: {
    token_id: string;
    access_token: string;
    verification_code: string;
    expires_at: string;
    guardian_name: string;
    guardian_email: string;
    permissions: GuardianPermissions;
    message: string;
  }
}
```

#### POST /api/emergency/check-inactivity

Check for inactive users and trigger emergency protocols.

**Request:** (Service-only, no user input required)

**Response:**

```typescript
{
  success: boolean;
  checked: number;
  notificationsTriggered: number;
  results: Array<{
    userId: string;
    lastSignIn: string;
    daysSinceLastSignIn: number;
    inactivityPeriodMonths: number;
    shouldNotify: boolean;
    guardianEmails?: string[];
  }>;
}
```

#### POST /api/emergency/download-document

Download emergency document with access verification.

**Request:**

```typescript
{
  token: string;
  document_id: string;
  verification_code?: string;
}
```

**Response:**

```typescript
{
  success: boolean;
  data: {
    document_id: string;
    document_title: string;
    document_category: string;
    file_type: string;
    download_url: string;
    expires_in: number;
    access_logged: boolean;
  }
}
```

### Guardian Management Endpoints

#### GET /api/guardians

List user's guardians.

**Response:**

```typescript
{
  guardians: Array<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    relationship?: string;
    is_active: boolean;
    permissions: GuardianPermissions;
    emergency_contact_priority: number;
  }>;
}
```

#### POST /api/guardians

Invite new guardian.

**Request:**

```typescript
{
  name: string;
  email: string;
  phone?: string;
  relationship?: string;
  permissions: GuardianPermissions;
}
```

#### PUT /api/guardians/{id}

Update guardian permissions.

**Request:**

```typescript
{
  permissions: GuardianPermissions;
  is_active: boolean;
}
```

### Family Shield Settings Endpoints

#### GET /api/emergency/shield-settings

Get user's Family Shield settings.

**Response:**

```typescript
{
  settings: {
    id: string;
    inactivity_period_months: number;
    required_guardians_for_activation: number;
    is_shield_enabled: boolean;
    last_activity_check: string;
    shield_status: string;
  };
}
```

#### PUT /api/emergency/shield-settings

Update Family Shield settings.

**Request:**

```typescript
{
  inactivity_period_months: number;
  required_guardians_for_activation: number;
  is_shield_enabled: boolean;
}
```

### Type Definitions

#### GuardianPermissions

```typescript
interface GuardianPermissions {
  can_access_health_docs: boolean;
  can_access_financial_docs: boolean;
  is_child_guardian: boolean;
  is_will_executor: boolean;
}
```

#### EmergencyDetectionRule

```typescript
interface EmergencyDetectionRule {
  id: string;
  rule_name: string;
  description?: string;
  rule_type: 'inactivity' | 'health_check' | 'guardian_manual' | 'suspicious_activity';
  is_enabled: boolean;
  trigger_conditions: any[];
  response_actions: any[];
  priority: number;
  last_triggered_at?: string;
  trigger_count: number;
}
```

## Data Flow Diagrams

### Emergency Activation Flow

```text
1. Inactivity Detected → check-inactivity function
2. User Verification Email → protocol-inactivity-checker
3. Guardian Notification → activate-family-shield
4. Token Generation → emergency_access_tokens table
5. Access Verification → verify-emergency-access
6. Document Access → download-emergency-document
7. Audit Logging → emergency_access_logs table
```

### Guardian Invitation Flow

```text
1. Guardian Invitation → guardians table
2. Permission Assignment → guardian permissions
3. Notification Sent → guardian_notifications table
4. Verification Process → emergency_access_tokens
5. Access Granted → emergency_access_logs
```

## Security Considerations

### Authentication & Authorization

- All endpoints require valid authentication
- Emergency tokens have strict expiration policies
- Multi-step verification for sensitive operations
- IP address and user agent logging for audit

### Data Protection

- All sensitive data encrypted at rest
- PII data access logged and monitored
- Automatic cleanup of expired tokens and logs
- GDPR compliance for data retention policies

### Rate Limiting

- Emergency endpoints rate limited to prevent abuse
- Token generation limited per user per hour
- Document download limits to prevent data exfiltration

## Performance Optimization

### Database Indexes

- Composite indexes on frequently queried columns
- Partial indexes for status-based queries
- Foreign key indexes for referential integrity
- Time-based indexes for audit log queries

### Caching Strategy

- Token validation results cached for 5 minutes
- User permissions cached during emergency access
- Document metadata cached for quick access
- Audit log aggregation for reporting

### Query Optimization

- Efficient JOIN operations for complex queries
- Pagination for large result sets
- Background processing for heavy operations
- Connection pooling for database access
