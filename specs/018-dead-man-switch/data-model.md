# Data Model: Dead Man Switch

This document defines the schema conventions for the DMS module, including table names, foreign keys, token storage, and policy boundaries.

## Core Entities (conceptual)

- FamilyShieldSettings(id, userId, inactivityPeriodMonths, requiredGuardiansForActivation, isEnabled, lastActivityCheck, shieldStatus, createdAt, updatedAt)
- EmergencyDetectionRule(id, userId, ruleName, description, ruleType, isEnabled, triggerConditions, responseActions, priority, lastTriggeredAt, triggerCount, createdAt, updatedAt)
- UserHealthCheck(id, userId, checkType, status, scheduledAt, respondedAt, responseMethod, metadata, createdAt)
- Guardian(id, userId, email, name, phone?, isActive, canTriggerEmergency, createdAt)
- GuardianNotification(id, guardianId, userId, notificationType, title, message, actionRequired, actionUrl, verificationToken, priority, deliveryMethod, sentAt, readAt, respondedAt, expiresAt, deliveryError, attemptedAt, deliveryStatus, createdAt)
- SurvivorAccessRequest(id, userId, accessToken, requesterEmail, requesterName, relationship, purpose, requestedAccessTypes, status, reviewedBy, reviewedAt, reviewNotes, expiresAt, ipAddress, userAgent, createdAt)
- EmergencyAccessAudit(id, userId, accessorType, accessorId, accessType, resourceType, resourceId, action, success, ipAddress, userAgent, metadata, createdAt)

## Proposed Tables (snake_case)

- family_shield_settings
  - id uuid primary key default gen_random_uuid()
  - user_id uuid not null references auth.users(id) on delete cascade
  - inactivity_period_months int not null default 6
  - required_guardians_for_activation int not null default 2
  - is_enabled boolean not null default false
  - last_activity_check timestamptz
  - shield_status text check (shield_status in ('inactive','armed','active')) default 'inactive'
  - created_at timestamptz not null default now()
  - updated_at timestamptz not null default now()

- emergency_detection_rules
  - id uuid pk default gen_random_uuid()
  - user_id uuid not null references auth.users(id) on delete cascade
  - rule_name text not null
  - description text
  - rule_type text not null
  - is_enabled boolean not null default true
  - trigger_conditions jsonb not null default '{}'::jsonb
  - response_actions jsonb not null default '{}'::jsonb
  - priority int not null default 10
  - last_triggered_at timestamptz
  - trigger_count int not null default 0
  - created_at timestamptz not null default now()
  - updated_at timestamptz not null default now()

- user_health_checks
  - id uuid pk default gen_random_uuid()
  - user_id uuid not null references auth.users(id) on delete cascade
  - check_type text not null
  - status text not null
  - scheduled_at timestamptz
  - responded_at timestamptz
  - response_method text
  - metadata jsonb not null default '{}'::jsonb
  - created_at timestamptz not null default now()

- guardians
  - id uuid pk default gen_random_uuid()
  - user_id uuid not null references auth.users(id) on delete cascade
  - email text not null
  - name text
  - phone text
  - is_active boolean not null default false
  - can_trigger_emergency boolean not null default false
  - created_at timestamptz not null default now()
  - unique (user_id, email)

- guardian_notifications
  - id uuid pk default gen_random_uuid()
  - guardian_id uuid not null references guardians(id) on delete cascade
  - user_id uuid not null references auth.users(id) on delete cascade
  - notification_type text not null
  - title text
  - message text
  - action_required boolean not null default false
  - action_url text
  - verification_token_hash text  -- never store raw token
  - priority int not null default 10
  - delivery_method text not null default 'email'
  - sent_at timestamptz
  - read_at timestamptz
  - responded_at timestamptz
  - expires_at timestamptz
  - delivery_error text
  - attempted_at timestamptz
  - delivery_status text
  - created_at timestamptz not null default now()

- survivor_access_requests
  - id uuid pk default gen_random_uuid()
  - user_id uuid not null references auth.users(id) on delete cascade
  - access_token_hash text not null  -- never store raw token
  - requester_email text not null
  - requester_name text
  - relationship text
  - purpose text
  - requested_access_types text[] not null default '{}'
  - status text not null default 'pending'
  - reviewed_by uuid
  - reviewed_at timestamptz
  - review_notes text
  - expires_at timestamptz not null
  - ip_address inet
  - user_agent text
  - created_at timestamptz not null default now()

- emergency_access_audit
  - id uuid pk default gen_random_uuid()
  - user_id uuid not null references auth.users(id) on delete cascade
  - accessor_type text not null  -- 'guardian' | 'system' | 'user'
  - accessor_id uuid
  - access_type text not null
  - resource_type text not null
  - resource_id uuid
  - action text not null
  - success boolean not null
  - ip_address inet
  - user_agent text
  - metadata jsonb not null default '{}'::jsonb
  - created_at timestamptz not null default now()

## Relations

- User 1—1 family_shield_settings
- User 1—N emergency_detection_rules
- User 1—N user_health_checks
- User 1—N guardians
- Guardian 1—N guardian_notifications
- User 1—N survivor_access_requests
- User 1—N emergency_access_audit

## Indexing & Performance

- Composite indexes on (status, sent_at|created_at) for sweepers.
- Partial indexes for pending/active records.
- GIN on JSONB payloads where applicable.
- Consider BRIN for large append-only audit tables.

## RLS Policies (overview)

- Enable RLS on every table.
- Owner-only read/write on user-owned tables (match `auth.uid()` to `user_id`).
- Guardian visibility only where necessary (via joins proving guardian membership and active status).
- Audit tables are append-only for non-admin roles; restrict update/delete.

## Token Tables (optional split)

If preferred, keep hashed tokens in dedicated tables for clarity and lifecycle management:
- verification_tokens (invite/verification flows)
- access_tokens (scoped, time-limited emergency access)

Both tables should store only hashes, include `expires_at`, `used_at`, and be cleaned by scheduled jobs.
