# Emergency Access System - Quick Start Guide

## Overview

This guide provides quick start instructions for implementing and testing the Emergency Access System, including user flows, testing scenarios, and development setup.

## Prerequisites

### Development Environment

- Node.js 18+ and npm
- Supabase CLI and local development environment
- Access to Hollywood codebase for reference
- TypeScript and ESLint configured

### Database Setup

```sql
-- Run these migrations in order:
1. 20250825161000_create_protocol_settings.sql
2. 20250825162000_create_emergency_activation_log.sql
3. 20250826090000_create_emergency_tables.sql
4. 20250829120000_create_emergency_access_tokens.sql
5. 20250823220000_create_guardians_table.sql
6. 20250825160000_enhance_guardians_permissions.sql
```

### Environment Variables

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Emergency System
SITE_URL=https://your-app.com
EMERGENCY_TOKEN_EXPIRY_DAYS=30
INACTIVITY_CHECK_INTERVAL_MINUTES=60

# Security
ENCRYPTION_KEY=your_256_bit_key
JWT_SECRET=your_jwt_secret
```

Notes:

- The Supabase service role key must be used only in server-side contexts (e.g., Edge Functions); never expose it to the browser.
- Use your deployment platform's secret manager for production (see 010-production-deployment).
- Do not log Authorization or token headers.

## Security & RLS verification

- Confirm all emergency tables have RLS enabled and policies in place.
- Verify hashed token storage (no raw tokens in DB).
- Validate single-use token and expiry behavior.
- Ensure structured logs in Edge Functions include a correlation ID; simulate a critical error and confirm a Resend email alert; no Sentry.

## Testing Scenarios

### 1) Emergency Setup - configure emergency protocols

**Objective:** Set up emergency access system with protocols and triggers

**Steps:**

1. Configure emergency activation protocols
2. Set up inactivity detection thresholds
3. Define staged access control levels
4. Configure document release permissions
5. Set up guardian verification processes

**Validation:**

- Emergency protocols are properly configured
- Inactivity thresholds are set correctly
- Access stages are defined with appropriate permissions
- Document categories are mapped to access levels
- Guardian verification workflows are established

### 2) Inactivity Detection - test monitoring system

**Objective:** Verify inactivity detection and monitoring functionality

**Steps:**

1. Simulate user inactivity by stopping system access
2. Monitor inactivity detection algorithms
3. Verify threshold calculations and triggers
4. Test notification generation and delivery
5. Validate guardian alert mechanisms

**Validation:**

- Inactivity is detected accurately
- Threshold calculations are correct
- Notifications are generated and delivered
- Guardian alerts are triggered appropriately
- System responds to activity resumption

### 3) Access Staging - test staged access

**Objective:** Validate staged access control functionality

**Steps:**

1. Trigger emergency access activation
2. Test initial access stage permissions
3. Verify stage progression mechanisms
4. Test time-based access restrictions
5. Validate permission inheritance rules

**Validation:**

- Access stages are enforced correctly
- Permission levels work as expected
- Time restrictions are applied properly
- Stage progression functions correctly
- Access revocation works when required

### 4) Document Release - test document access

**Objective:** Verify document release and access functionality

**Steps:**

1. Upload test documents with different categories
2. Trigger emergency access for guardian
3. Test document visibility based on permissions
4. Verify document download mechanisms
5. Test document access logging and audit

**Validation:**

- Documents are categorized correctly
- Permission-based access works properly
- Download mechanisms are secure and functional
- Access is logged for audit purposes
- Document integrity is maintained

### 5) Guardian Verification - test guardian auth

**Objective:** Validate guardian verification and authentication

**Steps:**

1. Set up guardian accounts and permissions
2. Test guardian invitation and registration
3. Verify multi-step authentication processes
4. Test guardian identity verification
5. Validate guardian access management

**Validation:**

- Guardian invitations are sent and received
- Authentication processes work correctly
- Identity verification is thorough and secure
- Access management functions properly
- Guardian permissions are enforced

### 6) Emergency Simulation - test full emergency flow

**Objective:** Execute complete emergency scenario from start to finish

**Steps:**

1. Set up test user with guardians and documents
2. Simulate emergency trigger conditions
3. Execute full emergency activation sequence
4. Test guardian access and document retrieval
5. Verify audit trail and system recovery

**Validation:**

- Emergency activation completes successfully
- All system components work together
- Guardian access is granted and functional
- Documents are accessible as expected
- Complete audit trail is maintained

### 7) False Activation - test false positive handling

**Objective:** Verify system handles false emergency activations correctly

**Steps:**

1. Trigger emergency activation incorrectly
2. Test false positive detection mechanisms
3. Verify deactivation and cleanup processes
4. Test user notification of false activation
5. Validate system recovery and normalization

**Validation:**

- False activations are detected and handled
- System recovers gracefully from false triggers
- Users are notified appropriately
- No permanent damage to access controls
- Audit trail reflects the false activation

### 8) Access Abuse - test security measures

**Objective:** Test security controls against access abuse attempts

**Steps:**

1. Attempt unauthorized access to emergency system
2. Test rate limiting and abuse detection
3. Verify access control enforcement
4. Test security monitoring and alerting
5. Validate incident response procedures

**Validation:**

- Unauthorized access attempts are blocked
- Rate limiting prevents abuse
- Security monitoring detects suspicious activity
- Incident response is triggered appropriately
- System remains secure under attack

### 9) Performance Test - test system performance

**Objective:** Validate system performance under various loads

**Steps:**

1. Set up performance testing environment
2. Execute load tests with multiple concurrent users
3. Test emergency activation under high load
4. Monitor system response times and throughput
5. Validate performance degradation handling

**Validation:**

- System handles expected user load
- Response times remain within acceptable limits
- Emergency activations work under load
- Performance monitoring is effective
- System scales appropriately

### 10) End-to-End Test - complete emergency workflow

**Objective:** Execute comprehensive end-to-end emergency workflow test

**Steps:**

1. Set up complete test environment with users, guardians, documents
2. Execute full emergency scenario from trigger to resolution
3. Test all system components and integrations
4. Verify data consistency and audit completeness
5. Validate system state after emergency resolution

**Validation:**

- Complete workflow executes successfully
- All system components integrate properly
- Data remains consistent throughout
- Audit trail is complete and accurate
- System returns to normal state after resolution

### 2. Guardian Verification Flow

#### Scenario: Guardian receives emergency notification and accesses documents

**Steps:**

1. Guardian receives email with access link and verification code
2. Guardian clicks link and enters verification code
3. System validates token and permissions via `verify-emergency-access`
4. Guardian sees available documents and emergency contacts
5. Guardian can download documents via `download-emergency-document`
6. All access is logged for audit trail

**Testing Commands:**

```bash
# Verify emergency access token
curl -X POST https://your-app.com/api/emergency/verify-access \
  -H "Content-Type: application/json" \
  -d '{
    "token": "test-token-123",
    "verification_code": "123456"
  }'

# Download emergency document
curl -X POST https://your-app.com/api/emergency/download-document \
  -H "Content-Type: application/json" \
  -d '{
    "token": "test-token-123",
    "document_id": "doc-456",
    "verification_code": "123456"
  }'
```

### 3. Manual Emergency Activation Flow

#### Scenario: Family member manually triggers emergency access

**Steps:**

1. Authorized guardian accesses admin panel
2. Selects "Activate Family Shield" option
3. Chooses activation reason and personality mode
4. System generates secure tokens for all designated guardians
5. Guardians receive notifications with access credentials
6. Emergency access portal becomes available immediately

**Testing Commands:**

```bash
# Activate Family Shield manually
curl -X POST https://your-app.com/api/emergency/activate-shield \
  -H "Authorization: Bearer user-token" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "current-user-id",
    "guardian_id": "target-guardian-id",
    "activation_reason": "emergency",
    "personality_mode": "empathetic",
    "custom_message": "Urgent family matter requires immediate attention"
  }'
```

## Development Setup

### 1. Project Structure

```text
packages/logic/src/emergency/
├── EmergencyAccessService.ts
├── GuardianVerificationService.ts
├── InactivityDetectionService.ts
├── DocumentReleaseService.ts
├── AuditLoggingService.ts
└── NotificationService.ts

supabase/functions/
├── verify-emergency-access/
├── activate-family-shield/
├── check-inactivity/
├── protocol-inactivity-checker/
└── download-emergency-document/
```

### 2. Service Implementation

```typescript
// EmergencyAccessService.ts
export class EmergencyAccessService {
  async verifyAccess(token: string, verificationCode?: string) {
    // Implementation here
  }

  async activateShield(userId: string, guardianId: string, reason: string) {
    // Implementation here
  }

  async checkInactivity() {
    // Implementation here
  }

  async downloadDocument(token: string, documentId: string) {
    // Implementation here
  }
}
```

### 3. Database Integration

```typescript
// Emergency Repository
export class EmergencyRepository {
  async createAccessToken(data: TokenCreationData) {
    const { data: token, error } = await supabase
      .from('emergency_access_tokens')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return token;
  }

  async validateToken(token: string) {
    const { data, error } = await supabase
      .from('emergency_access_tokens')
      .select('*')
      .eq('token', token)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    return data;
  }
}
```

## Unit Testing

### Unit Tests

```typescript
describe('EmergencyAccessService', () => {
  it('should verify valid emergency access token', async () => {
    const service = new EmergencyAccessService();
    const result = await service.verifyAccess('valid-token', '123456');

    expect(result.success).toBe(true);
    expect(result.data.documents).toBeDefined();
  });

  it('should reject expired tokens', async () => {
    const service = new EmergencyAccessService();
    await expect(
      service.verifyAccess('expired-token')
    ).rejects.toThrow('Token expired');
  });
});
```

### Integration Tests

```typescript
describe('Emergency Activation Flow', () => {
  it('should complete full emergency activation workflow', async () => {
    // 1. Create test user and guardian
    const user = await createTestUser();
    const guardian = await createTestGuardian(user.id);

    // 2. Activate Family Shield
    const activation = await emergencyService.activateShield(
      user.id,
      guardian.id,
      'emergency'
    );

    // 3. Verify token creation
    expect(activation.token).toBeDefined();
    expect(activation.verificationCode).toBeDefined();

    // 4. Verify access with token
    const access = await emergencyService.verifyAccess(
      activation.token,
      activation.verificationCode
    );

    expect(access.success).toBe(true);
  });
});
```

### End-to-End Tests

```typescript
describe('Emergency Portal E2E', () => {
  it('should allow guardian to access emergency documents', async () => {
    // Setup test data
    const { user, guardian, token } = await setupEmergencyScenario();

    // Navigate to emergency portal
    await page.goto(`/emergency-access/${token.token}`);

    // Enter verification code
    await page.fill('[data-testid="verification-code"]', token.verificationCode);
    await page.click('[data-testid="verify-button"]');

    // Verify access to documents
    await expect(page.locator('[data-testid="document-list"]')).toBeVisible();

    // Download a document
    await page.click('[data-testid="download-button"]');

    // Verify audit log entry
    const auditLog = await getLatestAuditLog(user.id);
    expect(auditLog.access_type).toBe('document_download');
  });
});
```

## API Testing with Postman

### Emergency Access Verification

```json
{
  "info": {
    "name": "Emergency Access API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Verify Emergency Access",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"token\": \"{{emergency_token}}\", \"verification_code\": \"{{verification_code}}\"}"
        },
        "url": {
          "raw": "{{base_url}}/api/emergency/verify-access",
          "host": ["{{base_url}}"],
          "path": ["api", "emergency", "verify-access"]
        }
      }
    }
  ]
}
```

## Monitoring & Debugging

### Key Metrics to Monitor

- Emergency activation success rate
- Token verification response time
- Document download success rate
- Guardian notification delivery rate
- Audit log completeness

### Debug Commands

```bash
# Check emergency token status
supabase db inspect emergency_access_tokens --filter "is_active=true"

# View recent audit logs
supabase db inspect emergency_access_logs --filter "created_at > now() - interval '1 hour'"

# Monitor inactivity checks
supabase logs functions check-inactivity --since 1h
```

### Common Issues & Solutions

#### Token Validation Issues

```typescript
// Debug token validation
const tokenData = await supabase
  .from('emergency_access_tokens')
  .select('*')
  .eq('token', token)
  .single();

console.log('Token debug:', {
  token,
  found: !!tokenData,
  isActive: tokenData?.is_active,
  expiresAt: tokenData?.expires_at,
  now: new Date().toISOString()
});
```

#### Database Connection Issues

```typescript
// Test database connectivity
const { data, error } = await supabase
  .from('emergency_access_tokens')
  .select('count(*)')
  .single();

if (error) {
  console.error('Database connection error:', error);
  throw new Error('Database connectivity test failed');
}
```

## Deployment Checklist

### Pre-Deployment

- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] SSL certificates valid
- [ ] CDN configured for document delivery
- [ ] Monitoring alerts set up

### Deployment Steps

1. Deploy Edge Functions to Supabase
2. Update API endpoints in frontend
3. Configure notification templates
4. Set up monitoring dashboards
5. Run smoke tests in staging

### Post-Deployment

- [ ] Verify emergency activation works
- [ ] Test document download functionality
- [ ] Confirm audit logging is working
- [ ] Validate notification delivery
- [ ] Monitor error rates and performance

## Support & Troubleshooting

### Emergency Contacts

- **Technical Support**: <tech-support@legacyguard.com>
- **Security Issues**: <security@legacyguard.com>
- **Legal Compliance**: <legal@legacyguard.com>

### Documentation Links

- [API Documentation](./contracts/)
- [Database Schema](./data-model.md)
- [Implementation Plan](./plan.md)
- [Hollywood Reference](/Users/luborfedak/Documents/Github/hollywood)

### Getting Help

1. Check the troubleshooting guide in this document
2. Review audit logs for error details
3. Contact technical support with specific error messages
4. Include relevant token IDs and timestamps in support requests

## Next Steps

1. **Complete Development Setup**: Follow the development setup instructions above
2. **Run Test Scenarios**: Execute the provided testing commands and scenarios
3. **Implement Monitoring**: Set up the monitoring and alerting systems
4. **User Acceptance Testing**: Conduct UAT with representative users
5. **Production Deployment**: Follow the deployment checklist for go-live

This quick start guide provides the essential information needed to begin implementing and testing the Emergency Access System. For detailed technical specifications, refer to the other documents in this specification package.
