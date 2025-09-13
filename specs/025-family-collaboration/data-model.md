# Family Collaboration - Data Model

## Overview

This document defines the complete data model for the Family Collaboration system, including all entities, relationships, constraints, and business rules.

## Core Entities

### FamilyMember

Represents an individual family member in the system.

**Attributes**:

- `id` (UUID, Primary Key): Unique identifier
- `family_owner_id` (UUID, Foreign Key): Reference to the family owner (auth.users)
- `user_id` (UUID, Foreign Key, Nullable): Reference to authenticated user if member has account
- `name` (TEXT): Full name of the family member
- `email` (TEXT): Email address for communications
- `role` (family_role ENUM): Role in the family (admin, collaborator, viewer, emergency_contact)
- `relationship` (relationship_type ENUM): Relationship to family owner
- `status` (member_status ENUM): Current status (active, pending, inactive, suspended)
- `permissions` (JSONB): Granular permissions for this member
- `phone` (TEXT, Nullable): Phone number for SMS communications
- `address` (JSONB, Nullable): Structured address information
- `emergency_contact` (BOOLEAN): Whether this member is designated as emergency contact
- `emergency_priority` (INTEGER, Nullable): Priority order for emergency notifications (1-10)
- `access_level` (TEXT, Nullable): Access level override
- `last_active_at` (TIMESTAMPTZ, Nullable): Last activity timestamp
- `joined_at` (TIMESTAMPTZ): When member was added to family
- `invited_at` (TIMESTAMPTZ): When invitation was sent
- `invited_by` (UUID): Who sent the invitation
- `preferences` (JSONB): User preferences and settings
- `metadata` (JSONB, Nullable): Additional metadata
- `created_at` (TIMESTAMPTZ): Record creation timestamp
- `updated_at` (TIMESTAMPTZ): Last update timestamp

**Constraints**:

- Name must be 1-100 characters
- Email must be valid format
- Emergency priority must be 1-10 if set
- Unique combination of family_owner_id and email
- Role must be one of defined enum values
- Relationship must be one of defined enum values

**Indexes**:

- Primary key on id
- Index on family_owner_id, is_active for active member queries
- Index on email for lookups
- Index on role for role-based queries
- Index on relationship for relationship queries
- Index on emergency_contact, emergency_priority for emergency queries
- Index on created_at for chronological ordering

### Guardian

Specialized view/projection of FamilyMember for guardian-specific operations.

**Note**: Guardian is not a separate table but a role-based projection of FamilyMember where role = 'emergency_contact' or specific guardian permissions are granted.

**Guardian-Specific Attributes** (stored in FamilyMember.permissions):

- `can_receive_emergency_alerts`: Permission to receive emergency notifications
- `emergency_response_priority`: Response priority level
- `verification_methods`: Array of allowed verification methods
- `emergency_access_scope`: Scope of emergency access granted
- `guardian_since`: Date when guardian role was granted
- `last_emergency_response`: Timestamp of last emergency response

### EmergencyProtocol

Defines emergency access protocols and activation rules.

**Attributes**:

- `id` (UUID, Primary Key): Unique identifier
- `family_owner_id` (UUID, Foreign Key): Reference to family owner
- `name` (TEXT): Protocol name for identification
- `description` (TEXT): Detailed description of the protocol
- `protocol_type` (emergency_protocol_type ENUM): Type of emergency protocol
- `activation_triggers` (JSONB): Conditions that trigger this protocol
- `automatic_actions` (JSONB): Actions to take when triggered
- `notification_targets` (JSONB): Who to notify and how
- `escalation_procedure` (JSONB): Escalation steps if no response
- `deactivation_conditions` (JSONB): When to deactivate the protocol
- `monitoring_requirements` (JSONB): Monitoring and logging requirements
- `legal_requirements` (JSONB): Legal compliance requirements
- `is_active` (BOOLEAN): Whether this protocol is currently active
- `priority` (INTEGER): Protocol priority (1-10, higher = more important)
- `created_by` (UUID): Who created this protocol
- `created_at` (TIMESTAMPTZ): Creation timestamp
- `updated_at` (TIMESTAMPTZ): Last update timestamp

**Constraints**:

- Name must be 1-100 characters
- Description must be 1-1000 characters
- Priority must be 1-10
- Activation triggers must be valid JSON schema
- At least one notification target required

### Notification

Represents notifications sent to family members.

**Attributes**:

- `id` (UUID, Primary Key): Unique identifier
- `family_owner_id` (UUID, Foreign Key): Reference to family owner
- `recipient_id` (UUID, Foreign Key): Reference to recipient family member
- `notification_type` (notification_type ENUM): Type of notification
- `title` (TEXT): Notification title
- `message` (TEXT): Notification content
- `priority` (notification_priority ENUM): Notification priority
- `delivery_methods` (TEXT[]): Array of delivery methods (email, sms, push, in_app)
- `status` (notification_status ENUM): Delivery status
- `scheduled_at` (TIMESTAMPTZ, Nullable): When to send the notification
- `sent_at` (TIMESTAMPTZ, Nullable): When notification was sent
- `delivered_at` (TIMESTAMPTZ, Nullable): When notification was delivered
- `read_at` (TIMESTAMPTZ, Nullable): When notification was read
- `metadata` (JSONB): Additional notification data
- `created_at` (TIMESTAMPTZ): Creation timestamp
- `updated_at` (TIMESTAMPTZ): Last update timestamp

**Constraints**:

- Title must be 1-200 characters
- Message must be 1-2000 characters
- At least one delivery method required
- Scheduled time must be in the future if set

### AuditLog

Comprehensive audit trail for all family collaboration activities.

**Attributes**:

- `id` (UUID, Primary Key): Unique identifier
- `family_owner_id` (UUID, Foreign Key): Reference to family owner
- `actor_id` (UUID, Foreign Key): Who performed the action
- `actor_name` (TEXT): Name of the actor for display
- `action_type` (audit_action_type ENUM): Type of action performed
- `target_type` (audit_target_type ENUM): Type of target affected
- `target_id` (UUID): ID of the affected target
- `details` (JSONB): Detailed information about the action
- `ip_address` (INET): IP address of the actor
- `user_agent` (TEXT): User agent string
- `location` (JSONB, Nullable): Geographic location data
- `session_id` (TEXT): Session identifier
- `risk_score` (INTEGER): Risk assessment score (0-100)
- `security_flags` (TEXT[]): Security-related flags
- `created_at` (TIMESTAMPTZ): Action timestamp

**Constraints**:

- Actor name must be 1-100 characters
- Risk score must be 0-100
- Details must contain valid action context

**Partitioning**: Monthly partitioning by created_at for performance.

### RoleAssignment

Tracks role assignments and changes over time.

**Attributes**:

- `id` (UUID, Primary Key): Unique identifier
- `family_member_id` (UUID, Foreign Key): Reference to family member
- `role` (family_role ENUM): Assigned role
- `assigned_by` (UUID, Foreign Key): Who assigned the role
- `assigned_at` (TIMESTAMPTZ): When role was assigned
- `reason` (TEXT, Nullable): Reason for role assignment
- `expires_at` (TIMESTAMPTZ, Nullable): When role expires
- `is_active` (BOOLEAN): Whether this assignment is currently active
- `metadata` (JSONB): Additional assignment data
- `created_at` (TIMESTAMPTZ): Creation timestamp
- `updated_at` (TIMESTAMPTZ): Last update timestamp

**Constraints**:

- Reason must be 1-500 characters if provided
- Expiration date must be in the future if set

## Supporting Entities

### FamilyInvitation

Manages invitation workflow for new family members.

**Attributes**:

- `id` (UUID, Primary Key): Unique identifier
- `sender_id` (UUID, Foreign Key): Who sent the invitation
- `family_member_id` (UUID, Foreign Key): Reference to family member record
- `email` (TEXT): Email address invited
- `token` (TEXT): Secure invitation token
- `status` (invitation_status ENUM): Invitation status
- `message` (TEXT): Personal invitation message
- `expires_at` (TIMESTAMPTZ): When invitation expires
- `accepted_at` (TIMESTAMPTZ, Nullable): When invitation was accepted
- `declined_at` (TIMESTAMPTZ, Nullable): When invitation was declined
- `accepted_by` (UUID, Nullable): Who accepted the invitation
- `declined_reason` (TEXT, Nullable): Reason for declining
- `created_at` (TIMESTAMPTZ): Creation timestamp
- `updated_at` (TIMESTAMPTZ): Last update timestamp

### EmergencyAccessRequest

Tracks emergency access requests and their lifecycle.

**Attributes**:

- `id` (UUID, Primary Key): Unique identifier
- `requester_id` (UUID, Foreign Key): Who requested emergency access
- `owner_id` (UUID, Foreign Key): Family owner whose data is requested
- `reason` (TEXT): Reason for emergency access request
- `emergency_level` (emergency_level ENUM): Severity of emergency
- `requested_documents` (UUID[]): Array of requested document IDs
- `requested_permissions` (TEXT[]): Array of requested permissions
- `verification_method` (verification_method ENUM): How to verify the request
- `status` (emergency_request_status ENUM): Request status
- `requested_at` (TIMESTAMPTZ): When request was made
- `expires_at` (TIMESTAMPTZ): When request expires
- `responded_at` (TIMESTAMPTZ, Nullable): When request was responded to
- `approver_id` (UUID, Nullable): Who approved/denied the request
- `approver_name` (TEXT, Nullable): Name of approver
- `approver_relation` (TEXT, Nullable): Relationship of approver to owner
- `response_message` (TEXT, Nullable): Approval/denial message
- `access_granted_until` (TIMESTAMPTZ, Nullable): When access expires
- `verification_token` (TEXT, Nullable): Token for verification
- `verification_attempts` (INTEGER): Number of verification attempts
- `max_verification_attempts` (INTEGER): Maximum allowed attempts
- `metadata` (JSONB): Additional request data
- `created_at` (TIMESTAMPTZ): Creation timestamp
- `updated_at` (TIMESTAMPTZ): Last update timestamp

### FamilyRelationship

Defines relationships between family members.

**Attributes**:

- `id` (UUID, Primary Key): Unique identifier
- `parent_member_id` (UUID, Foreign Key): Parent in the relationship
- `child_member_id` (UUID, Foreign Key): Child in the relationship
- `relationship_type` (relationship_type ENUM): Type of relationship
- `is_primary` (BOOLEAN): Whether this is the primary relationship
- `relationship_strength` (INTEGER, Nullable): Strength of relationship (1-10)
- `notes` (TEXT, Nullable): Additional relationship notes
- `verified_by` (UUID, Nullable): Who verified this relationship
- `verified_at` (TIMESTAMPTZ, Nullable): When relationship was verified
- `created_at` (TIMESTAMPTZ): Creation timestamp
- `updated_at` (TIMESTAMPTZ): Last update timestamp

## Enumerations

### family_role

```sql
CREATE TYPE family_role AS ENUM ('admin', 'collaborator', 'viewer', 'emergency_contact');
```

### relationship_type

```sql
CREATE TYPE relationship_type AS ENUM (
  'spouse', 'partner', 'child', 'parent', 'sibling', 'grandparent',
  'grandchild', 'aunt_uncle', 'cousin', 'friend', 'professional', 'other'
);
```

### member_status

```sql
CREATE TYPE member_status AS ENUM ('active', 'pending', 'inactive', 'suspended');
```

### emergency_protocol_type

```sql
CREATE TYPE emergency_protocol_type AS ENUM (
  'inactivity_alert', 'location_change', 'manual_trigger', 'health_emergency',
  'financial_emergency', 'legal_emergency', 'custom'
);
```

### notification_type

```sql
CREATE TYPE notification_type AS ENUM (
  'invitation', 'role_change', 'emergency_alert', 'document_shared',
  'permission_update', 'system_alert', 'reminder'
);
```

### notification_priority

```sql
CREATE TYPE notification_priority AS ENUM ('low', 'medium', 'high', 'critical');
```

### notification_status

```sql
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'delivered', 'read', 'failed');
```

### audit_action_type

```sql
CREATE TYPE audit_action_type AS ENUM (
  'member_added', 'member_updated', 'member_removed', 'member_activated',
  'invitation_sent', 'invitation_accepted', 'invitation_declined', 'invitation_expired',
  'role_assigned', 'role_revoked', 'permission_granted', 'permission_revoked',
  'emergency_requested', 'emergency_approved', 'emergency_denied', 'emergency_accessed',
  'document_shared', 'document_accessed', 'notification_sent'
);
```

### audit_target_type

```sql
CREATE TYPE audit_target_type AS ENUM (
  'family_member', 'invitation', 'role_assignment', 'permission',
  'emergency_request', 'document', 'notification'
);
```

## Entity Relationships

### Family Owner Relationships

```text
FamilyOwner (auth.users)
├── 1:N FamilyMember (family_owner_id)
├── 1:N FamilyInvitation (sender_id)
├── 1:N EmergencyProtocol (family_owner_id)
├── 1:N Notification (family_owner_id)
├── 1:N AuditLog (family_owner_id)
├── 1:N EmergencyAccessRequest (owner_id)
└── 1:N FamilyRelationship (parent_member_id)
```

### Family Member Relationships

```text
FamilyMember
├── N:1 FamilyOwner (family_owner_id)
├── 0:1 User (user_id)
├── 1:N FamilyInvitation (family_member_id)
├── 1:N RoleAssignment (family_member_id)
├── 1:N Notification (recipient_id)
├── N:N FamilyRelationship (parent_member_id, child_member_id)
└── 1:N AuditLog (actor_id)
```

### Emergency System Relationships

```text
EmergencyProtocol
├── 1:N EmergencyAccessRequest (protocol_id)
└── 1:N AuditLog (target_id)

EmergencyAccessRequest
├── N:1 EmergencyProtocol (protocol_id)
├── 1:N AuditLog (target_id)
└── 1:N Notification (related to request)
```

### Notification System Relationships

```text
Notification
├── N:1 FamilyMember (recipient_id)
├── N:1 FamilyOwner (family_owner_id)
└── 1:N AuditLog (target_id)
```

## Business Rules

### Family Member Rules

1. Each family owner can have maximum 50 active family members
2. Email addresses must be unique within a family
3. Emergency contacts must have valid phone numbers
4. Role changes must be logged with reason
5. Inactive members cannot access family resources

### Invitation Rules

1. Invitations expire after 7 days by default
2. Maximum 3 invitation resend attempts
3. Invitations cannot be sent to existing family members
4. Invitation tokens must be cryptographically secure

### Emergency Access Rules

1. Emergency requests expire after 24 hours
2. Maximum 3 verification attempts per request
3. Emergency access is time-limited (maximum 7 days)
4. All emergency actions must be logged

### Role Assignment Rules

1. Only family admins can assign roles
2. Role assignments can have expiration dates
3. Role changes require approval for sensitive roles
4. Previous role assignments are preserved for audit

### Audit Logging Rules

1. All security-relevant actions must be logged
2. Audit logs are immutable once created
3. Audit logs are retained for 7 years minimum
4. Audit log access is restricted to admins

## Data Integrity Constraints

### Referential Integrity

- All foreign key relationships must be maintained
- Cascade deletes only for non-critical relationships
- Soft deletes for audit preservation

### Domain Constraints

- Email format validation using regex
- Phone number format validation
- Date range validations for time-based fields
- Numeric range validations for priority fields

### Business Logic Constraints

- Prevent circular family relationships
- Ensure emergency contact availability
- Validate permission hierarchies
- Enforce role-based access rules

## Performance Considerations

### Indexing Strategy

- Composite indexes for common query patterns
- Partial indexes for active records
- JSONB indexes for metadata searches
- Time-based partitioning for audit logs

### Query Optimization

- Use database views for complex family tree queries
- Implement query result caching
- Optimize N+1 query problems
- Use database connection pooling

### Data Archival

- Archive old audit logs after 1 year
- Compress historical notification data
- Implement data retention policies
- Regular cleanup of expired records

## Security Considerations

### Row Level Security (RLS)

- Users can only access their own family data
- Emergency contacts have limited access scopes
- Audit logs are protected from modification
- Invitation tokens are securely generated

### Data Encryption

- Sensitive personal data is encrypted at rest
- Invitation tokens use strong cryptography
- Audit logs contain hashed sensitive data
- Emergency access uses temporary tokens

### Access Control

- Role-based permissions with inheritance
- Time-limited emergency access
- Granular permission management
- Audit trail for all access changes

This data model provides a comprehensive foundation for the Family Collaboration system with proper relationships, constraints, and security measures.
