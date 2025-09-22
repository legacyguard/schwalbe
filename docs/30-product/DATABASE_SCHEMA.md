# Database Schema Documentation

This document provides a comprehensive overview of the Schwalbe database schema, including all tables, their purposes, and relationships.

## Table of Contents

- [Core Tables](#core-tables)
- [Professional Review System](#professional-review-system)
- [Family & Legacy Management](#family--legacy-management)
- [Subscription & Billing](#subscription--billing)
- [Monitoring & Analytics](#monitoring--analytics)
- [Security & Access Control](#security--access-control)

## Core Tables

### User Profiles & Authentication

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `auth.users` | Supabase authentication users | `id`, `email`, `created_at` |
| `user_profiles` | Extended user profile information | `user_id`, `full_name`, `preferences` |
| `user_consents` | GDPR consent tracking | `user_id`, `consent_type`, `granted_at` |

### Documents & Assets

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `documents` | User document storage | `id`, `user_id`, `title`, `type`, `content` |
| `document_versions` | Version control for documents | `document_id`, `version`, `content` |
| `document_bundles` | Document collections | `id`, `user_id`, `name`, `documents` |
| `assets` | Financial asset tracking | `id`, `user_id`, `type`, `value`, `description` |

## Professional Review System

### Professional Network

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `professional_onboarding` | Professional application process | `user_id`, `credentials`, `verification_status` |
| `professional_reviewers` | Verified professional profiles | `id`, `name`, `credentials`, `specializations`, `rating` |
| `professional_specializations` | Available professional specializations | `name`, `description`, `category` |

### Review Process

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `review_requests` | User requests for document reviews | `user_id`, `document_id`, `review_type`, `status` |
| `document_reviews` | Professional document reviews | `document_id`, `reviewer_id`, `status`, `risk_level` |
| `review_results` | Detailed review findings | `review_id`, `score`, `findings`, `recommendations` |

### Consultations & Services

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `consultations` | Professional consultation bookings | `user_id`, `professional_id`, `scheduled_time`, `status` |

## Family & Legacy Management

### Wills & Estate Planning

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `wills` | User will documents | `user_id`, `content`, `status`, `trust_score` |
| `will_drafts` | Will drafting process | `user_id`, `content`, `version` |
| `will_auto_updates` | Automated will updates | `user_id`, `trigger_type`, `update_content` |

### Family Relationships

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `guardians` | Legal guardians and successors | `user_id`, `guardian_type`, `contact_info` |
| `family_members` | Family relationship tracking | `user_id`, `relationship`, `contact_info` |
| `family_impact_statements` | Family impact documentation | `user_id`, `statement` |

### Legacy Features

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `time_capsules` | Future message delivery | `user_id`, `delivery_date`, `content` |
| `survivor_manual_entries` | Instructions for survivors | `user_id`, `category`, `content` |
| `emergency_access_tokens` | Emergency access tokens | `user_id`, `token_hash`, `expires_at` |

## Subscription & Billing

### Subscription Management

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `subscriptions` | User subscription records | `user_id`, `stripe_subscription_id`, `status` |
| `subscription_plans` | Available subscription plans | `name`, `price`, `features` |
| `billing_details` | Billing information | `user_id`, `payment_method`, `billing_address` |

### Payment Processing

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `payment_history` | Payment transaction history | `user_id`, `amount`, `status`, `stripe_invoice_id` |
| `processed_webhooks` | Stripe webhook processing | `stripe_event_id`, `event_type`, `processed_at` |
| `webhook_metrics` | Webhook processing metrics | `event_type`, `success_count`, `error_count` |

## Monitoring & Analytics

### User Activity

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `user_activity_log` | User activity tracking | `user_id`, `action`, `timestamp` |
| `error_log` | Application error tracking | `user_id`, `error_message`, `stack_trace` |
| `hashed_search_index` | Search functionality | `user_id`, `search_hash`, `content_type` |

### Insights & Milestones

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `quick_insights` | AI-generated insights | `user_id`, `type`, `title`, `impact` |
| `legacy_milestones` | Achievement tracking | `user_id`, `type`, `completed_at` |
| `milestone_progress` | Milestone progress tracking | `user_id`, `progress_data` |
| `milestone_celebrations` | Milestone celebrations | `milestone_id`, `celebration_data` |

### Reminders & Notifications

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `reminders` | User reminders | `user_id`, `title`, `date`, `type` |
| `reminder_rules` | Reminder scheduling rules | `user_id`, `rule_type`, `conditions` |
| `notification_logs` | Notification delivery tracking | `type`, `recipient`, `status` |
| `failed_emails` | Failed email delivery tracking | `recipient`, `error_message` |

## Security & Access Control

### Access Control

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `sharing_links` | Document sharing links | `resource_id`, `permissions`, `expires_at` |
| `access_tokens` | API access tokens | `user_id`, `token_hash`, `permissions` |
| `gdpr_export_requests` | GDPR data export requests | `user_id`, `status`, `requested_at` |

### Emergency Access

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `emergency_activation_log` | Emergency access activation | `user_id`, `activation_type`, `activated_at` |
| `protocol_settings` | Emergency protocol settings | `user_id`, `protocol_type`, `settings` |

## Key Relationships

### User-Centric Relationships

```text
auth.users (1) ──── (many) documents
    │
    ├── (many) wills
    ├── (many) review_requests
    ├── (many) consultations
    ├── (many) reminders
    ├── (many) quick_insights
    └── (many) legacy_milestones
```

### Professional Network Relationships

```text
professional_onboarding (1) ──── (1) professional_reviewers
        │
        └── (many) review_requests ──── (many) document_reviews
                │
                └── (many) review_results
```

### Subscription Relationships

```text
subscriptions (1) ──── (many) payment_history
    │
    └── (many) processed_webhooks
```

## Row Level Security (RLS) Policies

Most tables implement Row Level Security with the following patterns:

- **User-owned data**: Users can only access their own records
- **Public professional data**: Verified professionals are visible to all users
- **Admin access**: Administrative functions for system management
- **Professional access**: Professionals can access assigned reviews and consultations

## Indexes

Critical indexes are created for:

- User ID lookups (`user_id` columns)
- Status-based queries (`status` columns)
- Time-based queries (`created_at`, `updated_at` columns)
- Foreign key relationships
- Full-text search indexes
- GIN indexes for JSON and array columns

## Migration Strategy

Database migrations follow semantic versioning:

- **Major versions**: Breaking schema changes
- **Minor versions**: New features and tables
- **Patch versions**: Bug fixes and optimizations

All migrations include:

- Proper rollback scripts
- Data migration strategies
- RLS policy updates
- Index optimizations

## Backup & Recovery

The system implements:

- **Automated backups**: Daily database snapshots
- **Point-in-time recovery**: WAL-based recovery
- **Cross-region replication**: Multi-region data redundancy
- **Encryption at rest**: All data encrypted using AES-256

## Performance Considerations

### Query Optimization

- **Connection pooling**: Supabase connection pooling
- **Query caching**: Redis-based query result caching
- **Index optimization**: Strategic indexes on frequently queried columns
- **Partitioning**: Time-based partitioning for large tables

### Monitoring

- **Query performance**: Slow query monitoring
- **Index usage**: Index effectiveness tracking
- **Cache hit rates**: Cache performance monitoring
- **Connection pooling**: Database connection monitoring

## Data Retention

| Data Type | Retention Period | Reason |
|-----------|------------------|--------|
| User activity logs | 2 years | Compliance and analytics |
| Error logs | 1 year | Debugging and monitoring |
| Payment history | 7 years | Financial compliance |
| GDPR export requests | 3 years | Legal compliance |
| Failed emails | 30 days | Operational cleanup |

## Compliance

The database schema ensures compliance with:

- **GDPR**: Data minimization, consent tracking, right to erasure
- **CCPA**: Data portability, deletion requests
- **SOX**: Financial data integrity and audit trails
- **HIPAA**: Protected health information handling (where applicable)
