# Family Collaboration System - Architecture

## System Overview

The Family Collaboration System is built on a modular, secure architecture that enables collaborative legacy planning while maintaining strict access controls and audit capabilities. The system integrates with existing Schwalbe components to provide a seamless family protection experience.

## Core Architecture Principles

### 🔒 Security-First Design

- **Zero-Knowledge Architecture**: Sensitive family data is encrypted client-side
- **Role-Based Access Control**: Hierarchical permission system with inheritance
- **Audit Everything**: Complete activity logging for compliance and security
- **Emergency Access Protocols**: Time-limited, verified access for crisis situations

### 🏗️ Modular Component Design

- **Service Layer**: Business logic abstraction with clean interfaces
- **UI Components**: Reusable, accessible components with emotional design
- **Data Layer**: Type-safe database operations with RLS enforcement
- **Integration Layer**: Clean APIs for cross-system communication

### 📊 Scalable Data Architecture

- **Normalized Schema**: Efficient data relationships with referential integrity
- **Indexing Strategy**: Optimized queries for family tree traversals and activity logs
- **Migration Safety**: Backward-compatible schema evolution with data preservation

## Component Architecture

### Frontend Layer (packages/ui)

#### FamilyInvitationFlow Component

```typescript
// Multi-step invitation wizard with emotional messaging
interface FamilyInvitationFlowProps {
  userId: string;
  onComplete: (invitation: FamilyInvitation) => void;
  onCancel: () => void;
}

// Key Features:
- Relationship-based role recommendations
- Personalized emotional messaging
- Progress tracking with animations
- Form validation and error handling
```

#### FamilyViralGrowth Component

```typescript
// Family network visualization and growth incentives
interface FamilyViralGrowthProps {
  familyStats: FamilyStats;
  onInviteMember: () => void;
}

// Key Features:
- Interactive family tree visualization
- Protection score calculations
- Growth incentives and gamification
- Member contribution tracking
```

### Service Layer (packages/shared)

#### FamilyService Class

```typescript
class FamilyService {
  // Core family management operations
  async getFamilyMembers(userId: string): Promise<FamilyMember[]>
  async addFamilyMember(userId: string, memberData: FamilyMemberInput): Promise<FamilyMember>
  async sendInvitation(invitationData: InvitationInput): Promise<FamilyInvitation>

  // Emergency access management
  async requestEmergencyAccess(requestData: EmergencyRequest): Promise<EmergencyAccessRequest>
  async approveEmergencyAccess(requestId: string, approverId: string): Promise<boolean>

  // Analytics and reporting
  async getFamilyStats(userId: string): Promise<FamilyStats>
  async getFamilyProtectionStatus(userId: string): Promise<FamilyProtectionStatus>
}
```

#### Access Control Engine

```typescript
class AccessControlEngine {
  // Permission evaluation
  async evaluatePermissions(userId: string, resource: string, action: string): Promise<boolean>
  async getUserPermissions(userId: string, familyId: string): Promise<PermissionSet>

  // Emergency access validation
  async validateEmergencyAccess(request: EmergencyAccessRequest): Promise<ValidationResult>
  async grantTemporaryAccess(requestId: string, duration: number): Promise<AccessToken>
}
```

### Business Logic Layer (packages/logic)

#### Family Protection Calculator

```typescript
// Protection level calculations and recommendations
export function calculateProtectionMetrics(
  documents: MinimalDocument[],
  willData?: WillData,
  familyMembersCount: number = 0,
  emergencyContactsCount: number = 0
): ProtectionMetrics

export function getProtectionImprovements(
  metrics: ProtectionMetrics,
  documents: Document[],
  willData?: WillData
): ProtectionSuggestion[]
```

#### Family Types and Validation

```typescript
// Core type definitions with validation
export interface FamilyMember {
  id: string;
  familyOwnerId: string;
  userId: string | null;
  name: string;
  email: string;
  role: FamilyRole;
  relationship: RelationshipType;
  status: MemberStatus;
  permissions: Record<string, boolean>;
  emergencyContact: boolean;
  emergencyPriority?: number;
}

// Relationship and role validation
export const RELATIONSHIP_LABELS: Record<RelationshipType, string>
export const FAMILY_PLANS: Record<FamilyPlanType, FamilyPlan>
```

## Database Architecture

### Core Tables

#### family_members

```sql
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_owner_id UUID NOT NULL REFERENCES auth.users(id),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role family_role NOT NULL,
  relationship relationship_type NOT NULL,
  is_active BOOLEAN DEFAULT false,
  permissions JSONB DEFAULT '{}',
  phone TEXT,
  address JSONB,
  emergency_contact BOOLEAN DEFAULT false,
  emergency_priority INTEGER,
  access_level TEXT,
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(family_owner_id, email)
);

-- Row Level Security
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own family members" ON family_members
  FOR SELECT USING (auth.uid() = family_owner_id);
```

#### family_invitations

```sql
CREATE TABLE family_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  family_member_id UUID NOT NULL REFERENCES family_members(id),
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  status invitation_status DEFAULT 'pending',
  message TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(family_member_id)
);
```

#### emergency_access_requests

```sql
CREATE TABLE emergency_access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES auth.users(id),
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  reason TEXT NOT NULL,
  status emergency_request_status DEFAULT 'pending',
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  responded_at TIMESTAMPTZ,
  approver_name TEXT,
  approver_relation TEXT,
  access_granted_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
);
```

#### family_activity_log

```sql
CREATE TABLE family_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_owner_id UUID NOT NULL REFERENCES auth.users(id),
  actor_id UUID NOT NULL REFERENCES auth.users(id),
  actor_name TEXT NOT NULL,
  action_type activity_action_type NOT NULL,
  target_type activity_target_type NOT NULL,
  target_id UUID NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Partitioning for performance
  PARTITION BY RANGE (created_at)
);
```

### Supporting Tables

#### family_permissions

```sql
CREATE TABLE family_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_member_id UUID NOT NULL REFERENCES family_members(id),
  resource_type TEXT NOT NULL, -- 'document', 'will', 'vault', etc.
  resource_id UUID NOT NULL,
  permission_type TEXT NOT NULL, -- 'read', 'write', 'admin'
  granted_by UUID NOT NULL REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,

  UNIQUE(family_member_id, resource_type, resource_id)
);
```

#### family_relationships

```sql
CREATE TABLE family_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_member_id UUID NOT NULL REFERENCES family_members(id),
  child_member_id UUID NOT NULL REFERENCES family_members(id),
  relationship_type relationship_type NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(parent_member_id, child_member_id)
);
```

## API Architecture

### RESTful Endpoints

#### Family Management

```http
GET    /api/family/members           - List family members
POST   /api/family/members           - Add family member
PUT    /api/family/members/:id       - Update family member
DELETE /api/family/members/:id       - Remove family member

POST   /api/family/invite            - Send invitation
GET    /api/family/invitations       - List invitations
PUT    /api/family/invitations/:id   - Update invitation status
```

#### Emergency Access

```http
POST   /api/emergency/request        - Request emergency access
GET    /api/emergency/requests       - List access requests
PUT    /api/emergency/requests/:id   - Approve/deny request
POST   /api/emergency/verify         - Verify emergency access
```

#### Analytics & Reporting

```http
GET    /api/family/stats             - Family statistics
GET    /api/family/activity          - Activity log
GET    /api/family/protection        - Protection status
GET    /api/family/tree              - Family tree data
```

### GraphQL Integration (Future)

```graphql
type Query {
  familyMembers(ownerId: ID!): [FamilyMember!]!
  familyInvitations(ownerId: ID!): [FamilyInvitation!]!
  emergencyRequests(ownerId: ID!): [EmergencyAccessRequest!]!
  familyActivity(ownerId: ID!, limit: Int): [FamilyActivity!]!
  familyProtectionStatus(ownerId: ID!): FamilyProtectionStatus!
}

type Mutation {
  inviteFamilyMember(input: InviteFamilyMemberInput!): FamilyInvitation!
  updateFamilyMember(id: ID!, input: UpdateFamilyMemberInput!): FamilyMember!
  requestEmergencyAccess(input: EmergencyAccessRequestInput!): EmergencyAccessRequest!
  approveEmergencyAccess(requestId: ID!): EmergencyAccessRequest!
}
```

## Integration Architecture

### Document Vault Integration

```typescript
// Family member access to shared documents
interface DocumentSharingService {
  shareDocumentWithFamily(
    documentId: string,
    familyMemberIds: string[],
    permissions: DocumentPermission[]
  ): Promise<SharingResult>

  getFamilySharedDocuments(
    userId: string,
    familyMemberId?: string
  ): Promise<Document[]>
}
```

### Will Creation Integration

```typescript
// Automatic beneficiary invitations
interface WillIntegrationService {
  syncWillBeneficiaries(
    willId: string,
    ownerId: string
  ): Promise<SyncResult>

  inviteWillParticipants(
    willId: string,
    participantType: 'beneficiary' | 'executor' | 'witness'
  ): Promise<InvitationResult[]>
}
```

### Sofia AI Integration

```typescript
// AI-guided family invitation flows
interface SofiaFamilyIntegration {
  generateInvitationMessage(
    relationship: RelationshipType,
    context: FamilyContext
  ): Promise<string>

  suggestFamilyRoles(
    relationship: RelationshipType,
    familySize: number
  ): Promise<FamilyRole[]>

  analyzeFamilyCompleteness(
    members: FamilyMember[],
    documents: Document[]
  ): Promise<FamilyAnalysis>
}
```

## Security Architecture

### Authentication & Authorization

- **Clerk Integration**: User authentication with JWT tokens
- **Supabase RLS**: Row-level security on all database tables
- **Role-Based Access**: Hierarchical permission system
- **Token Management**: Secure invitation and access tokens

### Encryption Strategy

- **Client-Side Encryption**: Sensitive data encrypted before storage
- **Key Management**: Secure key generation and rotation
- **Zero-Knowledge**: Server never sees unencrypted family data
- **Storage Policies**: Supabase storage access controls

### Audit & Compliance

- **Activity Logging**: All family activities tracked
- **Access Monitoring**: Real-time security event detection
- **Compliance Reporting**: GDPR and privacy regulation compliance
- **Incident Response**: Automated alerts for security events

## Performance Architecture

### Database Optimization

- **Indexing Strategy**: Optimized indexes for common queries
- **Query Optimization**: Efficient family tree traversals
- **Partitioning**: Time-based partitioning for activity logs
- **Connection Pooling**: Efficient database connection management

### Caching Strategy

- **Redis Integration**: Session and permission caching
- **CDN Integration**: Static asset optimization
- **API Response Caching**: Frequently accessed family data
- **Edge Computing**: Vercel edge functions for global performance

### Monitoring & Observability

- **Application Metrics**: Response times and error rates
- **Database Metrics**: Query performance and connection health
- **User Analytics**: Family engagement and feature usage
- **Security Monitoring**: Access patterns and threat detection

## Deployment Architecture

### Environment Strategy

- **Development**: Local development with hot reload
- **Staging**: Preview deployments for testing
- **Production**: Optimized production deployment on Vercel

### CI/CD Pipeline

- **Automated Testing**: Unit, integration, and E2E tests
- **Security Scanning**: Automated security vulnerability detection
- **Performance Testing**: Load testing and performance benchmarks
- **Deployment Automation**: Automated deployment with rollback capabilities

### Scaling Strategy

- **Horizontal Scaling**: Stateless service design
- **Database Scaling**: Read replicas and connection optimization
- **CDN Integration**: Global content delivery
- **Edge Computing**: Geographic performance optimization

## Migration & Compatibility

### Hollywood Migration

- **Component Migration**: Existing family components ported to new architecture
- **Data Migration**: Family data migrated with validation
- **API Compatibility**: Backward compatibility during transition
- **Feature Parity**: All existing features maintained or enhanced

### Version Compatibility

- **Semantic Versioning**: Clear versioning for API changes
- **Deprecation Strategy**: Gradual feature deprecation with alternatives
- **Migration Tools**: Automated migration scripts and tools
- **Rollback Capability**: Safe rollback procedures for deployments
