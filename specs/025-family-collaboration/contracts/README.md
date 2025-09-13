# Family Collaboration System - API Contracts

This directory contains the detailed contracts and interfaces for the Family Collaboration System components.

## Contract Overview

Contracts define the interfaces, types, and data structures used across the Family Collaboration System. They ensure type safety, API consistency, and clear component boundaries.

## Directory Structure

```text
contracts/
├── README.md                           # This file
├── family-management-api.yaml          # Family management API contracts
├── guardian-system-api.yaml            # Guardian system API contracts
├── emergency-protocol-api.yaml         # Emergency protocol API contracts
├── notification-system-api.yaml        # Notification system API contracts
├── audit-logging-api.yaml              # Audit logging API contracts
├── hollywood-functions/                # Phase 9 Hollywood function ports
│   ├── verify-emergency-access.contract.ts
│   ├── activate-family-shield.contract.ts
│   ├── protocol-inactivity-checker.contract.ts
│   ├── check-inactivity.contract.ts
│   └── download-emergency-document.contract.ts
├── family-service.contract.ts          # Family service interfaces
├── invitation-service.contract.ts      # Invitation management contracts
├── emergency-access.contract.ts        # Emergency access protocols
├── permission-engine.contract.ts       # Access control contracts
├── audit-logger.contract.ts           # Audit logging interfaces
├── notification-service.contract.ts    # Communication contracts
└── database-contracts.md              # Database schema contracts
```

## Phase 9 Hollywood Function Contracts

### Ported Functions from Hollywood

The following Supabase Edge Functions are ported from Hollywood as part of Phase 9 — Family Shield and Emergency Access:

#### verify-emergency-access

```typescript
export interface VerifyEmergencyAccessContract {
  functionName: 'verify-emergency-access';
  input: {
    token: string;
    requesterId: string;
    ownerId: string;
    verificationCode?: string;
  };
  output: {
    verified: boolean;
    accessGranted: boolean;
    tokenValid: boolean;
    emergencyLevel: 'low' | 'medium' | 'high';
    expiresAt: string;
  };
}
```

#### activate-family-shield

```typescript
export interface ActivateFamilyShieldContract {
  functionName: 'activate-family-shield';
  input: {
    ownerId: string;
    requesterId: string;
    emergencyLevel: 'low' | 'medium' | 'high';
    requestedDocuments: string[];
  };
  output: {
    shieldActivated: boolean;
    accessToken: string;
    grantedPermissions: string[];
    auditLogId: string;
    expiresAt: string;
  };
}
```

#### protocol-inactivity-checker

```typescript
export interface ProtocolInactivityCheckerContract {
  functionName: 'protocol-inactivity-checker';
  input: {
    ownerId: string;
    checkInterval: number; // minutes
    emergencyContacts: string[];
  };
  output: {
    inactivityDetected: boolean;
    lastActivity: string;
    emergencyTriggered: boolean;
    notificationsSent: string[];
    protocolActivated: boolean;
  };
}
```

#### check-inactivity

```typescript
export interface CheckInactivityContract {
  functionName: 'check-inactivity';
  input: {
    userId: string;
    thresholdHours: number;
    emergencyContacts: string[];
  };
  output: {
    isInactive: boolean;
    lastActivity: string;
    hoursSinceActivity: number;
    emergencyContactsNotified: boolean;
    protocolTriggered: boolean;
  };
}
```

#### download-emergency-document

```typescript
export interface DownloadEmergencyDocumentContract {
  functionName: 'download-emergency-document';
  input: {
    documentId: string;
    requesterId: string;
    emergencyToken: string;
    accessReason: string;
  };
  output: {
    downloadUrl: string;
    accessLogged: boolean;
    documentEncrypted: boolean;
    expiresAt: string;
    auditEntryId: string;
  };
}
```

## Contract Categories

### Service Contracts

Define the interfaces for core business services:

- **FamilyService**: Family member management operations
- **InvitationService**: Invitation lifecycle management
- **EmergencyAccessService**: Crisis access protocols
- **PermissionEngine**: Access control and authorization

### Data Contracts

Define data structures and validation rules:

- **FamilyMember**: User profile and relationship data
- **FamilyInvitation**: Invitation workflow data
- **EmergencyAccessRequest**: Crisis access request structure
- **AuditEvent**: Security and activity logging

### External Integration Contracts

Define external system interfaces:

- **NotificationService**: Email and messaging interfaces
- **DocumentSharing**: File sharing with family members
- **SofiaIntegration**: AI assistance interfaces

## Usage Guidelines

### Implementing Contracts

```typescript
// Correct implementation following contract
export class FamilyServiceImpl implements FamilyServiceContract {
  async getFamilyMembers(userId: string): Promise<FamilyMember[]> {
    // Implementation must match contract signature
    return this.repository.findByOwnerId(userId);
  }
}
```

### Contract Evolution

1. **Backward Compatibility**: New contract versions must maintain backward compatibility
2. **Deprecation Process**: Deprecated contracts must be clearly marked with sunset dates
3. **Migration Path**: Provide clear migration guides for contract changes
4. **Versioning**: Use semantic versioning for contract updates

### Testing Contracts

```typescript
// Contract compliance testing
describe('FamilyService Contract', () => {
  it('should implement all required methods', () => {
    const service = new FamilyServiceImpl();

    // Test that all contract methods exist
    expect(typeof service.getFamilyMembers).toBe('function');
    expect(typeof service.addFamilyMember).toBe('function');
  });

  it('should return contract-compliant data structures', async () => {
    const members = await service.getFamilyMembers('user-123');

    // Validate return type matches contract
    members.forEach(member => {
      expect(member).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        email: expect.any(String),
        role: expect.stringMatching(/^(admin|collaborator|viewer|emergency_contact)$/)
      });
    });
  });
});
```

## Key Contracts

### Family Service Contract

```typescript
export interface FamilyServiceContract {
  // Family member management
  getFamilyMembers(userId: string): Promise<FamilyMember[]>;
  addFamilyMember(userId: string, member: FamilyMemberInput): Promise<FamilyMember>;
  updateFamilyMember(memberId: string, updates: FamilyMemberUpdate): Promise<FamilyMember>;
  removeFamilyMember(memberId: string): Promise<void>;

  // Family statistics
  getFamilyStats(userId: string): Promise<FamilyStats>;
  getFamilyProtectionStatus(userId: string): Promise<FamilyProtectionStatus>;
}
```

### Invitation Service Contract

```typescript
export interface InvitationServiceContract {
  // Invitation lifecycle
  createInvitation(invitation: InvitationInput): Promise<FamilyInvitation>;
  acceptInvitation(token: string, userId: string): Promise<FamilyMember>;
  declineInvitation(token: string, reason?: string): Promise<void>;
  cancelInvitation(invitationId: string): Promise<void>;

  // Invitation queries
  getPendingInvitations(userId: string): Promise<FamilyInvitation[]>;
  getInvitationByToken(token: string): Promise<FamilyInvitation | null>;
  resendInvitation(invitationId: string): Promise<void>;
}
```

### Emergency Access Contract

```typescript
export interface EmergencyAccessContract {
  // Emergency request management
  requestEmergencyAccess(request: EmergencyRequestInput): Promise<EmergencyAccessRequest>;
  approveEmergencyAccess(requestId: string, approverId: string): Promise<EmergencyAccessGrant>;
  denyEmergencyAccess(requestId: string, reason: string): Promise<void>;

  // Access verification
  verifyEmergencyAccess(token: string, verificationCode: string): Promise<AccessToken>;
  validateEmergencyToken(token: string): Promise<boolean>;

  // Access management
  revokeEmergencyAccess(tokenId: string): Promise<void>;
  getEmergencyAccessHistory(userId: string): Promise<EmergencyAccessRequest[]>;
}
```

## Data Validation Contracts

### Input Validation

```typescript
export interface ValidationContract<T> {
  validate(input: unknown): ValidationResult<T>;
  sanitize(input: T): T;
  getValidationRules(): ValidationRule[];
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

export interface ValidationRule {
  field: string;
  rule: string;
  message: string;
  params?: Record<string, any>;
}
```

### Business Rule Validation

```typescript
export interface BusinessRuleContract {
  validateFamilyMemberAddition(
    ownerId: string,
    memberData: FamilyMemberInput
  ): Promise<BusinessRuleValidation>;

  validateEmergencyAccessRequest(
    requesterId: string,
    ownerId: string,
    reason: string
  ): Promise<BusinessRuleValidation>;

  validatePermissionChange(
    actorId: string,
    targetId: string,
    newPermissions: PermissionSet
  ): Promise<BusinessRuleValidation>;
}
```

## Error Handling Contracts

### Service Error Contract

```typescript
export interface ServiceErrorContract {
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, any>;
  readonly requestId?: string;
  readonly timestamp: Date;
  readonly stack?: string;
}

export class FamilyServiceError extends Error implements ServiceErrorContract {
  constructor(
    code: FamilyErrorCode,
    message: string,
    details?: Record<string, any>
  ) {
    super(message);
    this.code = code;
    this.details = details;
    this.timestamp = new Date();
  }
}
```

## Integration Contracts

### External Service Contracts

```typescript
export interface EmailServiceContract {
  sendInvitationEmail(invitation: FamilyInvitation): Promise<EmailResult>;
  sendEmergencyNotification(request: EmergencyAccessRequest): Promise<EmailResult>;
  sendAccessGrantedNotification(grant: EmergencyAccessGrant): Promise<EmailResult>;
}

export interface AuditServiceContract {
  logEvent(event: AuditEvent): Promise<string>;
  getAuditTrail(userId: string, filters: AuditFilters): Promise<AuditEvent[]>;
  getSecurityReport(timeRange: DateRange): Promise<SecurityReport>;
}
```

## Contract Testing Strategy

### Contract Compliance Testing

1. **Interface Implementation Testing**: Ensure all contract methods are implemented
2. **Type Safety Testing**: Validate TypeScript types match contract definitions
3. **Behavioral Testing**: Test that implementations behave as specified
4. **Performance Contract Testing**: Validate performance requirements are met

### Automated Contract Validation

```typescript
// Automated contract validation
export class ContractValidator {
  static validateImplementation<T>(
    implementation: T,
    contract: ContractDefinition
  ): ValidationResult {
    const missingMethods = contract.methods.filter(
      method => typeof (implementation as any)[method.name] !== 'function'
    );

    const invalidSignatures = contract.methods.filter(method => {
      const implMethod = (implementation as any)[method.name];
      return !this.validateMethodSignature(implMethod, method.signature);
    });

    return {
      success: missingMethods.length === 0 && invalidSignatures.length === 0,
      errors: [
        ...missingMethods.map(m => `Missing method: ${m.name}`),
        ...invalidSignatures.map(m => `Invalid signature: ${m.name}`)
      ]
    };
  }
}
```

## Version Control and Evolution

### Contract Versioning Strategy

- **Major Version**: Breaking changes to contracts
- **Minor Version**: New optional methods or fields
- **Patch Version**: Bug fixes and documentation updates

### Deprecation Process

```typescript
export interface DeprecatedContract {
  readonly deprecated: true;
  readonly deprecatedAt: Date;
  readonly sunsetAt: Date;
  readonly replacementContract?: string;
  readonly migrationGuide: string;
}
```

## Monitoring and Compliance

### Contract Usage Monitoring

```typescript
export interface ContractMetrics {
  contractId: string;
  implementationCount: number;
  usageCount: number;
  errorRate: number;
  performanceMetrics: PerformanceMetric[];
  complianceScore: number;
}
```

### Compliance Reporting

```typescript
export interface ContractComplianceReport {
  contractId: string;
  compliantImplementations: number;
  nonCompliantImplementations: number;
  compliancePercentage: number;
  issues: ContractIssue[];
  recommendations: string[];
}
```

## API Contracts Documentation

### Family Management API (`family-management-api.yaml`)

**Base URL**: `/api/family`

**Core Endpoints**:

- `GET /api/family/members` - Retrieve family members
- `POST /api/family/members` - Add new family member
- `PUT /api/family/members/{id}` - Update family member
- `DELETE /api/family/members/{id}` - Remove family member
- `GET /api/family/tree` - Get family relationship tree
- `GET /api/family/stats` - Get family statistics

**Authentication**: Bearer token required
**Rate Limit**: 100 requests per minute

### Guardian System API (`guardian-system-api.yaml`)

**Base URL**: `/api/guardian`

**Core Endpoints**:

- `POST /api/guardian/invite` - Send guardian invitation
- `GET /api/guardian/invitations` - List pending invitations
- `POST /api/guardian/invitations/{id}/accept` - Accept invitation
- `POST /api/guardian/invitations/{id}/decline` - Decline invitation
- `PUT /api/guardian/roles/{memberId}` - Update member role
- `GET /api/guardian/verification/{token}` - Verify invitation token

**Authentication**: Bearer token required
**Rate Limit**: 50 requests per minute

### Emergency Protocol API (`emergency-protocol-api.yaml`)

**Base URL**: `/api/emergency`

**Core Endpoints**:

- `POST /api/emergency/request` - Request emergency access
- `GET /api/emergency/requests` - List emergency requests
- `POST /api/emergency/requests/{id}/approve` - Approve emergency request
- `POST /api/emergency/requests/{id}/deny` - Deny emergency request
- `POST /api/emergency/verify` - Verify emergency access
- `DELETE /api/emergency/access/{tokenId}` - Revoke emergency access

**Authentication**: Bearer token required
**Rate Limit**: 20 requests per minute (strict limits for security)

### Notification System API (`notification-system-api.yaml`)

**Base URL**: `/api/notifications`

**Core Endpoints**:

- `POST /api/notifications/send` - Send notification
- `GET /api/notifications` - List user notifications
- `PUT /api/notifications/{id}/read` - Mark notification as read
- `DELETE /api/notifications/{id}` - Delete notification
- `GET /api/notifications/preferences` - Get notification preferences
- `PUT /api/notifications/preferences` - Update notification preferences

**Authentication**: Bearer token required
**Rate Limit**: 200 requests per minute

### Audit Logging API (`audit-logging-api.yaml`)

**Base URL**: `/api/audit`

**Core Endpoints**:

- `GET /api/audit/events` - Retrieve audit events
- `GET /api/audit/events/{id}` - Get specific audit event
- `POST /api/audit/export` - Export audit log
- `GET /api/audit/summary` - Get audit summary
- `GET /api/audit/search` - Search audit events

**Authentication**: Bearer token required (admin only)
**Rate Limit**: 100 requests per minute

## API Contract Standards

### Request/Response Format

```typescript
// Standard API Response
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    pagination?: PaginationInfo;
    rateLimit?: RateLimitInfo;
    requestId: string;
    timestamp: string;
  };
}

// Pagination Info
interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Rate Limit Info
interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: string;
}
```

### Error Codes

- `VALIDATION_ERROR` (400): Invalid request data
- `AUTHENTICATION_ERROR` (401): Authentication required
- `AUTHORIZATION_ERROR` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error

### Authentication

```typescript
// Bearer Token Authentication
Authorization: Bearer <jwt_token>

// Token Claims
interface AuthToken {
  sub: string;        // User ID
  exp: number;        // Expiration
  iat: number;        // Issued at
  family_role: string; // Family role
  permissions: string[]; // Granted permissions
}
```

### Versioning

- API versioning via URL path: `/api/v1/family/members`
- Backward compatibility maintained for 2 major versions
- Deprecation warnings sent 3 months before removal
- Breaking changes require major version bump

This contracts directory provides the foundation for reliable, type-safe, and maintainable implementation of the Family Collaboration System.
