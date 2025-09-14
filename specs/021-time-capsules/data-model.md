# Time Capsules Data Model

This document defines the database schema, API contracts, and data structures for the time capsule system in Schwalbe.

## Database Schema

### Conventions (required)

- Identity: Supabase Auth (auth.uid()).
- FKs: user_id uuid not null references auth.users(id) on delete cascade; apply consistently to all user-owned tables.
- Tokens: store only hashed values (e.g., token_hash); include expires_at and used_at; tokens are single-use; never log raw tokens.
- RLS: enable on all tables; owner-only default; minimal guardian access via joins; write positive/negative tests.
- Naming: snake_case; timestamps created_at and updated_at; use timestamptz.

### Core Entities

#### TimeCapsule Entity

Main entity storing time capsule metadata and delivery information.

**Fields:**

- `capsule_id`: Unique identifier for the time capsule
- `user_id`: Reference to the user who created the capsule
- `recipient_id`: Reference to the recipient (guardian)
- `recipient_name`: Name of the recipient
- `recipient_email`: Email address for delivery
- `delivery_condition`: Type of delivery trigger (date/emergency)
- `delivery_date`: Scheduled delivery date (if applicable)
- `message_title`: Title of the time capsule message
- `message_preview`: Short preview text
- `media_type`: Type of media (video/audio)
- `storage_path`: Path to encrypted media file
- `file_size_bytes`: Size of the media file
- `duration_seconds`: Duration of the media
- `thumbnail_path`: Path to thumbnail image
- `status`: Current status of the capsule
- `is_delivered`: Boolean indicating delivery status
- `delivered_at`: Timestamp of delivery
- `delivery_attempts`: Number of delivery attempts
- `access_token_hash`: Hash of opaque token for viewing (never store raw token)
- `access_used_at`: Timestamp when token was used
- `access_expires_at`: Token expiration date
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

#### VideoMessage Entity

Specialized entity for video message content.

**Fields:**

- `video_id`: Unique identifier for the video
- `capsule_id`: Reference to parent time capsule
- `file_path`: Path to video file
- `file_size`: Size in bytes
- `duration`: Duration in seconds
- `format`: Video format (WebM/MP4)
- `resolution`: Video resolution
- `bitrate`: Video bitrate
- `thumbnail_path`: Path to video thumbnail
- `transcription`: Optional text transcription
- `metadata`: Additional video metadata

#### DeliverySchedule Entity

Entity managing delivery scheduling and triggers.

**Fields:**

- `schedule_id`: Unique identifier for the schedule
- `capsule_id`: Reference to time capsule
- `trigger_type`: Type of trigger (date/emergency)
- `scheduled_date`: Date for delivery (if date-based)
- `emergency_trigger`: Emergency condition reference
- `status`: Schedule status
- `attempts`: Number of trigger attempts
- `last_attempt`: Timestamp of last attempt
- `next_attempt`: Timestamp of next attempt
- `created_at`: Creation timestamp

#### DeliveryTrigger Entity

Entity defining trigger conditions for delivery.

**Fields:**

- `trigger_id`: Unique identifier for the trigger
- `schedule_id`: Reference to delivery schedule
- `trigger_type`: Type of trigger condition
- `condition_value`: Value for condition evaluation
- `is_active`: Whether trigger is active
- `priority`: Priority level for processing
- `created_at`: Creation timestamp

#### LegacyContent Entity

Entity for legacy content management (Phase 2G).

**Fields:**

- `content_id`: Unique identifier for legacy content
- `capsule_id`: Reference to time capsule
- `version_number`: Version number for snapshots
- `content_type`: Type of legacy content
- `content_data`: JSON snapshot data
- `emotional_tags`: Emotional metadata tags
- `created_at`: Creation timestamp
- `is_active`: Whether this version is active

#### TimeCapsuleLog Entity

Entity for tracking capsule operations and analytics.

**Fields:**

- `log_id`: Unique identifier for the log entry
- `capsule_id`: Reference to time capsule
- `user_id`: Reference to user (if applicable)
- `action_type`: Type of action performed
- `action_details`: Details of the action
- `ip_address`: IP address of the action
- `user_agent`: User agent string
- `timestamp`: Timestamp of the action
- `metadata`: Additional metadata

## Relationships

### Entity Relationships

```text
TimeCapsule (1) ──── (1) VideoMessage
    │
    ├── (1) DeliverySchedule
    │       │
    │       └── (N) DeliveryTrigger
    │
    ├── (N) LegacyContent
    │
    └── (N) TimeCapsuleLog
```

### Foreign Key Constraints

- `TimeCapsule.recipient_id` → `Guardians.guardian_id`
- `VideoMessage.capsule_id` → `TimeCapsule.capsule_id`
- `DeliverySchedule.capsule_id` → `TimeCapsule.capsule_id`
- `DeliveryTrigger.schedule_id` → `DeliverySchedule.schedule_id`
- `LegacyContent.capsule_id` → `TimeCapsule.capsule_id`
- `TimeCapsuleLog.capsule_id` → `TimeCapsule.capsule_id`

## Data Flow

### Capsule Creation Flow

1. **User Input** → TimeCapsule entity creation
2. **Media Upload** → VideoMessage entity creation
3. **Schedule Setup** → DeliverySchedule entity creation
4. **Trigger Configuration** → DeliveryTrigger entities creation
5. **Legacy Snapshot** → LegacyContent entity creation
6. **Audit Logging** → TimeCapsuleLog entries creation

### Delivery Flow

1. **Trigger Evaluation** → DeliveryTrigger condition checking
2. **Schedule Activation** → DeliverySchedule status update
3. **Capsule Processing** → TimeCapsule status update
4. **Email Delivery** → External email service integration
5. **Access Token Generation** → TimeCapsule access token creation
6. **Audit Logging** → TimeCapsuleLog delivery tracking

### Legacy Management Flow

1. **Version Creation** → LegacyContent snapshot creation
2. **Emotional Tagging** → LegacyContent emotional metadata update
3. **Content Access** → LegacyContent version retrieval
4. **Audit Logging** → TimeCapsuleLog access tracking

## API Contracts

### REST API Endpoints

#### Capsule Management

```typescript
GET /api/time-capsules
- Query capsules by user
- Support filtering by status, date range
- Return paginated results

POST /api/time-capsules
- Create new time capsule
- Validate input data
- Return created capsule with ID

PUT /api/time-capsules/{id}
- Update capsule details
- Validate permissions
- Return updated capsule

DELETE /api/time-capsules/{id}
- Soft delete capsule
- Validate ownership
- Return deletion confirmation
```

#### Media Management

```typescript
POST /api/time-capsules/{id}/upload
- Handle media file upload
- Process video compression
- Generate thumbnails
- Return processing status

GET /api/time-capsules/{id}/media
- Retrieve media file
- Validate access permissions
- Stream encrypted content
```

#### Scheduling Management

```typescript
POST /api/time-capsules/{id}/schedule
- Configure delivery schedule
- Validate trigger conditions
- Return schedule confirmation

PUT /api/time-capsules/{id}/schedule
- Update delivery schedule
- Recalculate trigger conditions
- Return updated schedule

GET /api/time-capsules/{id}/schedule
- Retrieve schedule details
- Include trigger status
- Return schedule information
```

#### Legacy Management

```typescript
GET /api/time-capsules/{id}/versions
- List legacy content versions
- Support pagination
- Return version metadata

POST /api/time-capsules/{id}/versions
- Create new version snapshot
- Process emotional tagging
- Return version information

GET /api/time-capsules/{id}/versions/{version}
- Retrieve specific version
- Validate access permissions
- Return version data
```

## Security Considerations

### Data Protection

- **Encryption**: All media files encrypted at rest using client-side encryption
- **Access Control**: Row Level Security (RLS) policies for all entities
- **Token Security**: Time-limited access tokens for public viewing
- **Audit Logging**: Comprehensive logging of all operations

### Privacy Controls

- **Data Minimization**: Only collect necessary user data
- **Consent Management**: User permission for data processing
- **Retention Policies**: Configurable data retention periods
- **Anonymization**: Remove personal data from analytics

## Performance Optimization

### Database Indexes

```sql
-- Primary lookup indexes
CREATE INDEX idx_time_capsule_user ON time_capsule(user_id);
CREATE INDEX idx_time_capsule_status ON time_capsule(status);
CREATE INDEX idx_time_capsule_delivery ON time_capsule(delivery_date);

-- Foreign key indexes
CREATE INDEX idx_video_message_capsule ON video_message(capsule_id);
CREATE INDEX idx_delivery_schedule_capsule ON delivery_schedule(capsule_id);
CREATE INDEX idx_delivery_trigger_schedule ON delivery_trigger(schedule_id);
CREATE INDEX idx_legacy_content_capsule ON legacy_content(capsule_id);
CREATE INDEX idx_time_capsule_log_capsule ON time_capsule_log(capsule_id);

-- Composite indexes for common queries
CREATE INDEX idx_capsule_user_status ON time_capsule(user_id, status);
CREATE INDEX idx_schedule_trigger_status ON delivery_schedule(trigger_type, status);
```

### Query Optimization

- **Pagination**: Implement cursor-based pagination for large result sets
- **Caching**: Use Redis for frequently accessed capsule metadata
- **Read Replicas**: Distribute read queries across multiple database instances
- **Query Planning**: Optimize complex queries with proper join ordering

## Migration Strategy

### Hollywood Data Migration

**Source Tables:**

- `hollywood_time_capsules` → `time_capsule`
- `hollywood_videos` → `video_message`
- `hollywood_schedules` → `delivery_schedule`

**Migration Steps:**

1. Extract data from Hollywood database
2. Transform data to new schema format
3. Validate data integrity
4. Load data into Schwalbe database
5. Update foreign key relationships
6. Migrate media files to new storage
7. Update access tokens and permissions

### Data Validation

**Pre-migration Checks:**

- Verify data consistency in source database
- Check for orphaned records
- Validate media file existence
- Confirm user and guardian references

**Post-migration Validation:**

- Compare record counts between systems
- Verify data integrity with checksums
- Test media file accessibility
- Validate relationship constraints

## Monitoring & Analytics

### Key Metrics

- **Capsule Creation Rate**: Number of capsules created per day/week
- **Delivery Success Rate**: Percentage of successful deliveries
- **Media Processing Time**: Average time for video processing
- **Storage Utilization**: Amount of storage used by capsules
- **Access Patterns**: Frequency and timing of capsule access

### Alert Conditions

- Delivery failure rate > 5%
- Media processing time > 10 minutes
- Storage utilization > 80%
- Access token expiration issues
- Database query performance degradation

## Future Extensions

### Planned Enhancements

- **Multi-recipient Support**: Allow capsules to be sent to multiple recipients
- **Interactive Content**: Support for quizzes, polls, and interactive elements
- **Collaborative Creation**: Allow multiple users to contribute to a capsule
- **Advanced Scheduling**: Support for complex scheduling rules and conditions
- **Content Templates**: Pre-built templates for common capsule types

### Scalability Considerations

- **Database Sharding**: Split data across multiple database instances
- **CDN Integration**: Distribute media content globally
- **Queue Systems**: Implement message queues for background processing
- **Microservices**: Break down monolithic functions into smaller services
- **Caching Layers**: Add multiple levels of caching for performance
