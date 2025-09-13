# Family Shield Emergency - Technical Implementation Guide

## Architecture Overview

The Family Shield Emergency system is built as a comprehensive emergency access and monitoring platform that integrates with the existing Schwalbe architecture. It consists of four main layers:

1. **Presentation Layer**: React components for emergency UI
2. **Service Layer**: Business logic and emergency protocols
3. **Data Layer**: Database models and access patterns
4. **Integration Layer**: External service connections and APIs

## Core Components

### 1. Emergency Protocol Engine

#### EmergencyProtocolService (`@schwalbe/logic`)

```typescript
class EmergencyProtocolService {
  // Core protocol management
  async createProtocol(userId: string, config: ProtocolConfig): Promise<Protocol>
  async activateProtocol(protocolId: string, reason: ActivationReason): Promise<void>
  async deactivateProtocol(protocolId: string): Promise<void>

  // Guardian coordination
  async requestGuardianConfirmation(protocolId: string, guardianIds: string[]): Promise<void>
  async confirmGuardianActivation(protocolId: string, guardianId: string): Promise<void>

  // Access control
  async generateAccessToken(protocolId: string, guardianId: string): Promise<AccessToken>
  async validateAccessToken(token: string): Promise<TokenValidation>
}
```

#### Key Implementation Details

- **State Management**: Uses finite state machine for protocol states
- **Concurrency Control**: Optimistic locking for guardian confirmations
- **Audit Trail**: Comprehensive logging of all protocol changes
- **Error Handling**: Graceful failure with rollback capabilities

### 2. Inactivity Detection System

#### InactivityMonitor (`@schwalbe/logic`)

```typescript
class InactivityMonitor {
  // Monitoring configuration
  async configureMonitoring(userId: string, config: MonitoringConfig): Promise<void>
  async updateThreshold(userId: string, threshold: number): Promise<void>

  // Activity tracking
  async recordActivity(userId: string, activity: UserActivity): Promise<void>
  async getLastActivity(userId: string): Promise<Date>

  // Detection logic
  async checkInactivity(userId: string): Promise<InactivityStatus>
  async triggerWarning(userId: string): Promise<void>
  async escalateToGuardians(userId: string): Promise<void>
}
```

#### Implementation Features

- **Activity Sources**: Tracks login, document access, settings changes
- **Threshold Calculation**: Configurable periods with grace periods
- **Notification System**: Multi-channel alerts (email, SMS, push)
- **False Positive Prevention**: Activity pattern analysis

### 3. Guardian Management System

#### GuardianService (`@schwalbe/logic`)

```typescript
class GuardianService {
  // Guardian lifecycle
  async createGuardian(userId: string, data: GuardianCreate): Promise<Guardian>
  async updateGuardian(guardianId: string, data: GuardianUpdate): Promise<Guardian>
  async deactivateGuardian(guardianId: string): Promise<void>

  // Verification system
  async initiateVerification(guardianId: string): Promise<VerificationToken>
  async verifyGuardian(guardianId: string, token: string): Promise<boolean>

  // Permission management
  async updatePermissions(guardianId: string, permissions: GuardianPermissions): Promise<void>
  async validatePermissions(guardianId: string, action: string): Promise<boolean>
}
```

#### Security Features

- **Identity Verification**: Multi-step verification process
- **Permission Granularity**: Document-level access control
- **Audit Logging**: All permission changes tracked
- **Emergency Override**: Temporary permission escalation

### 4. Access Control Framework

#### AccessControlService (`@schwalbe/logic`)

```typescript
class AccessControlService {
  // Token management
  async generateEmergencyToken(userId: string, guardianId: string): Promise<AccessToken>
  async validateToken(token: string): Promise<TokenValidation>
  async revokeToken(tokenId: string): Promise<void>

  // Access staging
  async getAccessStage(tokenId: string): Promise<AccessStage>
  async advanceStage(tokenId: string, stage: AccessStage): Promise<void>

  // Document access
  async authorizeDocumentAccess(tokenId: string, documentId: string): Promise<boolean>
  async logDocumentAccess(tokenId: string, documentId: string): Promise<void>
}
```

#### Access Control Features

- **Staged Access**: Progressive access levels
- **Time Limits**: Automatic token expiration
- **Document Filtering**: Category-based access control
- **Audit Trail**: Complete access logging

## Database Schema

### Core Tables

```sql
-- Emergency protocols
CREATE TABLE emergency_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  protocol_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'inactive',
  activation_date TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  required_guardians INTEGER DEFAULT 2,
  inactivity_threshold_months INTEGER DEFAULT 6,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emergency access tokens
CREATE TABLE emergency_access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  guardian_id UUID NOT NULL REFERENCES guardians(id),
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  permissions JSONB NOT NULL DEFAULT '{}',
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inactivity monitoring
CREATE TABLE inactivity_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  last_activity_at TIMESTAMPTZ,
  inactivity_period_days INTEGER DEFAULT 0,
  threshold_days INTEGER DEFAULT 180,
  status VARCHAR(20) DEFAULT 'monitoring',
  warning_sent_at TIMESTAMPTZ,
  guardians_notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logging
CREATE TABLE emergency_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  guardian_id UUID REFERENCES guardians(id),
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  severity VARCHAR(20) DEFAULT 'info',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Indexes and Constraints

```sql
-- Performance indexes
CREATE INDEX idx_emergency_protocols_user_id ON emergency_protocols(user_id);
CREATE INDEX idx_emergency_protocols_status ON emergency_protocols(status);
CREATE INDEX idx_emergency_access_tokens_user_id ON emergency_access_tokens(user_id);
CREATE INDEX idx_emergency_access_tokens_expires_at ON emergency_access_tokens(expires_at);
CREATE INDEX idx_inactivity_triggers_user_id ON inactivity_triggers(user_id);
CREATE INDEX idx_inactivity_triggers_status ON inactivity_triggers(status);
CREATE INDEX idx_emergency_logs_user_id ON emergency_logs(user_id);
CREATE INDEX idx_emergency_logs_created_at ON emergency_logs(created_at);

-- Constraints
ALTER TABLE emergency_protocols ADD CONSTRAINT valid_protocol_type
  CHECK (protocol_type IN ('inactivity', 'manual', 'health_check'));

ALTER TABLE emergency_access_tokens ADD CONSTRAINT token_not_expired
  CHECK (expires_at > NOW());

ALTER TABLE inactivity_triggers ADD CONSTRAINT positive_threshold
  CHECK (threshold_days > 0);
```

## API Endpoints

### Emergency Protocol APIs

```typescript
// POST /api/emergency/protocols
// Create new emergency protocol
{
  "userId": "uuid",
  "protocolType": "inactivity",
  "config": {
    "inactivityThresholdMonths": 6,
    "requiredGuardians": 2
  }
}

// POST /api/emergency/protocols/{id}/activate
// Activate emergency protocol
{
  "reason": "inactivity_detected",
  "guardianIds": ["uuid1", "uuid2"]
}

// GET /api/emergency/tokens/{token}/validate
// Validate access token
// Returns: TokenValidation with permissions and user data
```

### Guardian Management APIs

```typescript
// POST /api/guardians
// Create new guardian
{
  "userId": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "relationship": "brother",
  "permissions": {
    "canTriggerEmergency": true,
    "canAccessHealthDocs": true,
    "canAccessFinancialDocs": false
  }
}

// POST /api/guardians/{id}/verify
// Verify guardian identity
{
  "verificationCode": "123456",
  "method": "email"
}

// PUT /api/guardians/{id}/permissions
// Update guardian permissions
{
  "canAccessHealthDocs": true,
  "canAccessFinancialDocs": true,
  "isChildGuardian": false
}
```

### Access Control APIs

```typescript
// POST /api/emergency/access/request
// Request emergency access
{
  "userId": "uuid",
  "guardianId": "uuid",
  "reason": "emergency_activation"
}

// GET /api/emergency/access/{token}/documents
// Get accessible documents
// Returns: Filtered list of documents based on permissions

// POST /api/emergency/access/{token}/documents/{id}/download
// Download specific document
// Returns: Secure download URL
```

## Security Implementation

### Authentication & Authorization

```typescript
// JWT token structure for emergency access
interface EmergencyToken {
  sub: string; // guardian ID
  userId: string; // protected user ID
  permissions: GuardianPermissions;
  stage: AccessStage;
  exp: number; // expiration timestamp
  iat: number; // issued at timestamp
}

// Multi-stage access control
enum AccessStage {
  VERIFICATION = 'verification',
  BASIC_ACCESS = 'basic_access',
  FULL_ACCESS = 'full_access',
  ADMIN_OVERRIDE = 'admin_override'
}
```

### Encryption & Data Protection

```typescript
// Document encryption service
class DocumentEncryptionService {
  async encryptDocument(documentId: string, guardianId: string): Promise<EncryptedDocument>
  async decryptDocument(encryptedDocument: EncryptedDocument, guardianId: string): Promise<Document>

  // Key management
  async generateGuardianKey(guardianId: string): Promise<CryptoKey>
  async rotateKeys(userId: string): Promise<void>
}

// Audit logging with encryption
class AuditLogger {
  async logEmergencyEvent(event: EmergencyEvent): Promise<void>
  async getAuditTrail(userId: string, dateRange: DateRange): Promise<AuditEntry[]>
}
```

## Integration Points

### Supabase Edge Functions

```typescript
// Emergency verification function
// supabase/functions/verify-emergency-access/index.ts
serve(async (req) => {
  const { token, verification_code } = await req.json()

  // Validate token and verification code
  const validation = await validateEmergencyToken(token, verification_code)

  // Log access attempt
  await logEmergencyAccess(token, validation)

  return new Response(JSON.stringify(validation))
})
```

### React Components

```typescript
// Emergency access page component
export default function EmergencyAccessPage() {
  const [token, setToken] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [accessData, setAccessData] = useState(null)

  const verifyAccess = async () => {
    const { data, error } = await supabase.functions.invoke('verify-emergency-access', {
      body: { token, verification_code: verificationCode }
    })

    if (!error) {
      setAccessData(data)
    }
  }

  // Render verification form or access interface
}
```

## Monitoring & Analytics

### Performance Monitoring

```typescript
// Performance tracking service
class PerformanceMonitor {
  async trackResponseTime(operation: string, duration: number): Promise<void>
  async trackError(operation: string, error: Error): Promise<void>
  async getMetrics(timeRange: TimeRange): Promise<PerformanceMetrics>
}

// Key metrics to monitor
interface PerformanceMetrics {
  averageResponseTime: number;
  errorRate: number;
  tokenGenerationTime: number;
  documentAccessTime: number;
  guardianNotificationTime: number;
}
```

### Security Monitoring

```typescript
// Security event monitoring
class SecurityMonitor {
  async logSecurityEvent(event: SecurityEvent): Promise<void>
  async detectAnomalies(userId: string): Promise<AnomalyDetection>
  async generateSecurityReport(timeRange: TimeRange): Promise<SecurityReport>
}

// Security events to monitor
enum SecurityEventType {
  INVALID_TOKEN = 'invalid_token',
  EXPIRED_TOKEN = 'expired_token',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  GUARDIAN_IMPERSONATION = 'guardian_impersonation'
}
```

## Testing Strategy

### Unit Testing

```typescript
// Emergency protocol service tests
describe('EmergencyProtocolService', () => {
  it('should create emergency protocol', async () => {
    const protocol = await service.createProtocol(userId, config)
    expect(protocol.status).toBe('inactive')
  })

  it('should activate protocol with guardian confirmation', async () => {
    await service.requestGuardianConfirmation(protocolId, guardianIds)
    await service.confirmGuardianActivation(protocolId, guardianId)

    const protocol = await service.getProtocol(protocolId)
    expect(protocol.status).toBe('active')
  })
})
```

### Integration Testing

```typescript
// End-to-end emergency flow test
describe('Emergency Access Flow', () => {
  it('should complete full emergency access workflow', async () => {
    // 1. Create emergency protocol
    const protocol = await createEmergencyProtocol(userId)

    // 2. Trigger emergency activation
    await activateEmergencyProtocol(protocol.id)

    // 3. Guardian verification
    const token = await verifyGuardianAccess(guardianId)

    // 4. Access emergency documents
    const documents = await accessEmergencyDocuments(token)

    // 5. Verify audit trail
    const auditTrail = await getAuditTrail(userId)
    expect(auditTrail).toContainEmergencyAccess(protocol.id)
  })
})
```

## Deployment & Migration

### Database Migration

```sql
-- Migration script for emergency system
BEGIN;

-- Create emergency tables
CREATE TABLE emergency_protocols (...);
CREATE TABLE emergency_access_tokens (...);
CREATE TABLE inactivity_triggers (...);
CREATE TABLE emergency_logs (...);

-- Create indexes
CREATE INDEX ...;

-- Migrate existing data from Hollywood
INSERT INTO emergency_protocols
SELECT * FROM migrate_hollywood_emergency_data();

-- Update RLS policies
ALTER TABLE emergency_protocols ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own emergency protocols" ON emergency_protocols
  FOR SELECT USING (auth.uid() = user_id);

COMMIT;
```

### Zero-Downtime Deployment

```typescript
// Blue-green deployment strategy
class EmergencyDeployment {
  async deployNewVersion(): Promise<void> {
    // 1. Deploy to staging environment
    await deployToStaging()

    // 2. Run comprehensive tests
    await runEmergencyTests()

    // 3. Gradual traffic shift
    await gradualTrafficShift()

    // 4. Monitor for issues
    await monitorDeployment()

    // 5. Complete migration or rollback
    if (await deploymentSuccessful()) {
      await completeMigration()
    } else {
      await rollbackDeployment()
    }
  }
}
```

This implementation guide provides the technical foundation for building a robust, secure, and scalable Family Shield Emergency system that integrates seamlessly with the existing Schwalbe platform.
