# Family Shield Emergency - Data Model

## Core Emergency Entities

### EmergencyProtocol

- `id: string` - Unique identifier
- `user_id: string` - Associated user
- `protocol_type: 'inactivity' | 'manual' | 'health_check'` - Type of emergency protocol
- `status: 'active' | 'inactive' | 'pending' | 'expired'` - Current protocol status
- `activation_date: timestamp` - When protocol was activated
- `expires_at: timestamp` - When protocol expires
- `required_guardians: number` - Number of guardians needed for activation
- `inactivity_threshold_months: number` - Months of inactivity before activation
- `created_at: timestamp` - Creation time
- `updated_at: timestamp` - Last update time

### Guardian

- `id: string` - Unique identifier
- `user_id: string` - User who designated this guardian
- `name: string` - Guardian's full name
- `email: string` - Guardian's email address
- `phone: string` - Guardian's phone number (optional)
- `relationship: string` - Relationship to user
- `is_active: boolean` - Whether guardian is currently active
- `can_trigger_emergency: boolean` - Can trigger emergency protocols
- `can_access_health_docs: boolean` - Has access to health documents
- `can_access_financial_docs: boolean` - Has access to financial documents
- `is_child_guardian: boolean` - Designated as child guardian
- `is_will_executor: boolean` - Designated as will executor
- `emergency_contact_priority: number` - Priority for emergency contacts
- `verification_status: 'pending' | 'verified' | 'rejected'` - Verification status
- `created_at: timestamp` - Creation time
- `updated_at: timestamp` - Last update time

### EmergencyAccessToken

- `id: string` - Unique identifier
- `user_id: string` - User whose data is being accessed
- `guardian_id: string` - Guardian granted access
- `token: string` - Secure access token
- `expires_at: timestamp` - Token expiration time
- `permissions: GuardianPermissions` - Granted permissions
- `activation_reason: string` - Reason for access
- `is_used: boolean` - Whether token has been used
- `used_at: timestamp` - When token was used
- `created_at: timestamp` - Creation time

### InactivityTrigger

- `id: string` - Unique identifier
- `user_id: string` - User being monitored
- `last_activity_at: timestamp` - Last detected activity
- `inactivity_period_days: number` - Days of inactivity detected
- `threshold_days: number` - Inactivity threshold
- `status: 'monitoring' | 'warning_sent' | 'grace_period' | 'activated'` - Current status
- `warning_sent_at: timestamp` - When warning was sent
- `grace_period_ends_at: timestamp` - When grace period ends
- `guardians_notified_at: timestamp` - When guardians were notified
- `created_at: timestamp` - Creation time
- `updated_at: timestamp` - Last update time

### AccessStage

- `id: string` - Unique identifier
- `token_id: string` - Associated access token
- `stage_type: 'verification' | 'document_access' | 'full_access'` - Type of access stage
- `stage_number: number` - Stage sequence number
- `is_completed: boolean` - Whether stage is completed
- `completed_at: timestamp` - When stage was completed
- `required_actions: string[]` - Actions required for this stage
- `completed_actions: string[]` - Actions that have been completed
- `created_at: timestamp` - Creation time

### EmergencyLog

- `id: string` - Unique identifier
- `user_id: string` - User associated with emergency
- `guardian_id: string` - Guardian involved (optional)
- `event_type: string` - Type of emergency event
- `event_data: object` - Event-specific data
- `ip_address: string` - IP address of the event
- `user_agent: string` - User agent of the event
- `severity: 'low' | 'medium' | 'high' | 'critical'` - Event severity
- `created_at: timestamp` - Event timestamp

### FamilyShield

- `id: string` - Unique identifier
- `user_id: string` - User who owns the shield
- `is_enabled: boolean` - Whether family shield is enabled
- `inactivity_period_months: number` - Inactivity period in months
- `required_guardians_for_activation: number` - Guardians needed for activation
- `emergency_contacts: EmergencyContact[]` - Emergency contact information
- `survivor_manual_settings: SurvivorManualSettings` - Survivor manual configuration
- `notification_preferences: NotificationPreferences` - Notification settings
- `created_at: timestamp` - Creation time
- `updated_at: timestamp` - Last update time

## Supporting Entities

### GuardianPermissions

- `can_access_health_docs: boolean` - Health document access
- `can_access_financial_docs: boolean` - Financial document access
- `is_child_guardian: boolean` - Child guardianship
- `is_will_executor: boolean` - Will execution rights

### EmergencyContact

- `name: string` - Contact's full name
- `relationship: string` - Relationship to user
- `email: string` - Contact's email
- `phone: string` - Contact's phone (optional)
- `can_help_with: string[]` - Areas this contact can help with
- `priority: number` - Contact priority

### SurvivorManualSettings

- `include_emergency_contacts: boolean` - Include emergency contacts
- `include_guardian_info: boolean` - Include guardian information
- `include_document_list: boolean` - Include document inventory
- `include_instructions: boolean` - Include user instructions
- `custom_message: string` - Custom message from user

### NotificationPreferences

- `email_enabled: boolean` - Email notifications enabled
- `sms_enabled: boolean` - SMS notifications enabled
- `push_enabled: boolean` - Push notifications enabled
- `guardian_alerts: boolean` - Guardian alerts enabled
- `system_alerts: boolean` - System alerts enabled

## Analytics & Monitoring Entities

### EmergencyAnalytics

- `id: string` - Unique identifier
- `user_id: string` - Associated user
- `metric_type: string` - Type of metric
- `value: number` - Metric value
- `context: string` - Metric context
- `timestamp: timestamp` - Metric timestamp
- `metadata: object` - Additional metric data

### EmergencyPerformance

- `id: string` - Unique identifier
- `user_id: string` - Associated user
- `operation_type: string` - Type of operation
- `response_time_ms: number` - Response time in milliseconds
- `success: boolean` - Whether operation succeeded
- `error_message: string` - Error message if failed
- `timestamp: timestamp` - Performance measurement time

## Relations

- EmergencyProtocol 1—1 FamilyShield
- FamilyShield 1—N Guardian
- FamilyShield 1—N EmergencyAccessToken
- FamilyShield 1—N InactivityTrigger
- EmergencyAccessToken 1—N AccessStage
- FamilyShield 1—N EmergencyLog
- FamilyShield 1—N EmergencyAnalytics
- FamilyShield 1—N EmergencyPerformance
- Guardian 1—N EmergencyAccessToken
- Guardian 1—N EmergencyLog
