# Integration Testing Data Model

## TestSuite Entity

```typescript
interface TestSuite {
  id: string;
  name: string;
  description: string;
  type: 'e2e' | 'integration' | 'performance' | 'security' | 'accessibility';
  status: 'pending' | 'running' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  testCases: TestCase[];
}
```

## TestCase Entity

```typescript
interface TestCase {
  id: string;
  suiteId: string;
  name: string;
  description: string;
  steps: string[];
  expectedResult: string;
  actualResult?: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  duration?: number;
  errorMessage?: string;
  screenshots?: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

## TestResult Entity

```typescript
interface TestResult {
  id: string;
  testCaseId: string;
  suiteId: string;
  status: 'passed' | 'failed' | 'skipped' | 'error';
  duration: number;
  errorDetails?: {
    message: string;
    stackTrace?: string;
    screenshots?: string[];
    logs?: string[];
  };
  performanceMetrics?: PerformanceMetric[];
  securityFindings?: SecurityTest[];
  coverageData?: TestCoverage;
  executedAt: Date;
  executedBy: string;
  environment: string;
}
```

## PerformanceMetric Entity

```typescript
interface PerformanceMetric {
  id: string;
  testResultId: string;
  metricName: string;
  metricValue: number;
  unit: string;
  threshold?: number;
  status: 'pass' | 'fail' | 'warning';
  collectedAt: Date;
}
```

## SecurityTest Entity

```typescript
interface SecurityTest {
  id: string;
  testResultId: string;
  vulnerabilityType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
  remediation: string;
  status: 'open' | 'fixed' | 'accepted';
  discoveredAt: Date;
}
```

## TestCoverage Entity

```typescript
interface TestCoverage {
  id: string;
  testResultId: string;
  statements: number;
  branches: number;
  functions: number;
  lines: number;
  overall: number;
  files: CoverageFile[];
  collectedAt: Date;
}

interface CoverageFile {
  filename: string;
  statements: number;
  branches: number;
  functions: number;
  lines: number;
}
```

## Relations Between Entities

```text
TestSuite (1) ──── (many) TestCase
    │
    └─── (many) TestResult (through TestCase)

TestCase (1) ──── (many) TestResult

TestResult (1) ──── (many) PerformanceMetric
TestResult (1) ──── (many) SecurityTest
TestResult (1) ──── (1) TestCoverage
```

### Test User Profiles

```typescript
interface TestUser {
  id: string;
  email: string;
  password: string;
  role: 'user' | 'guardian' | 'professional' | 'admin';
  profile: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    phoneNumber?: string;
  };
  subscription?: {
    planId: string;
    status: 'active' | 'inactive' | 'cancelled';
    currentPeriodEnd: string;
  };
  emergencySettings?: {
    enabled: boolean;
    inactivityThreshold: number; // days
    guardians: string[]; // user IDs
  };
}

interface TestDataFactory {
  createUser(overrides?: Partial<TestUser>): Promise<TestUser>;
  createDocument(userId: string, type: DocumentType): Promise<Document>;
  createSubscription(userId: string, planId: string): Promise<Subscription>;
  createEmergencyAccess(userId: string, guardianIds: string[]): Promise<EmergencyAccess>;
}
```

### Test Document Structures

```typescript
interface TestDocument {
  id: string;
  userId: string;
  type: 'will' | 'vault' | 'time_capsule' | 'emergency';
  title: string;
  content: string;
  encryptedContent: string;
  metadata: {
    size: number;
    mimeType: string;
    checksum: string;
    createdAt: string;
    updatedAt: string;
  };
  permissions: {
    ownerId: string;
    guardians: string[];
    publicAccess: boolean;
    expiryDate?: string;
  };
}

interface DocumentTestFixture {
  generateWillDocument(user: TestUser): TestDocument;
  generateVaultDocument(user: TestUser, content: string): TestDocument;
  generateTimeCapsule(user: TestUser, deliveryDate: string): TestDocument;
  generateEmergencyDocument(user: TestUser): TestDocument;
}
```

## API Contract Testing

### Supabase Function Contracts

#### Authentication Functions

```typescript
// create-checkout-session
interface CreateCheckoutRequest {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  userId: string;
}

interface CreateCheckoutResponse {
  sessionId: string;
  url: string;
  expiresAt: number;
}

// Test Contract
interface CreateCheckoutTest {
  request: CreateCheckoutRequest;
  expectedResponse: CreateCheckoutResponse;
  expectedDatabaseState: {
    subscription_created: boolean;
    payment_intent_created: boolean;
  };
}
```

#### Document Management Functions

```typescript
// upload-document
interface UploadDocumentRequest {
  userId: string;
  fileName: string;
  fileContent: string; // base64
  encryptionKey: string;
  metadata: DocumentMetadata;
}

interface UploadDocumentResponse {
  documentId: string;
  uploadUrl: string;
  checksum: string;
}

// Test Contract
interface UploadDocumentTest {
  setup: {
    user: TestUser;
    encryptionKey: string;
  };
  request: UploadDocumentRequest;
  assertions: {
    response: UploadDocumentResponse;
    database: {
      document_record: boolean;
      storage_file: boolean;
      audit_log: boolean;
    };
    security: {
      encryption_valid: boolean;
      rls_enforced: boolean;
    };
  };
}
```

#### Emergency Access Functions

```typescript
// activate-emergency-access
interface ActivateEmergencyRequest {
  userId: string;
  triggerType: 'manual' | 'inactivity' | 'guardian';
  guardianId?: string;
  reason: string;
}

interface ActivateEmergencyResponse {
  accessToken: string;
  grantedPermissions: string[];
  expiresAt: string;
  auditId: string;
}

// Test Contract
interface EmergencyAccessTest {
  scenario: 'manual_activation' | 'inactivity_trigger' | 'guardian_request';
  setup: {
    user: TestUser;
    guardians: TestUser[];
    inactivityPeriod?: number;
  };
  request: ActivateEmergencyRequest;
  expectedResponse: ActivateEmergencyResponse;
  securityValidations: {
    permission_check: boolean;
    audit_logging: boolean;
    token_expiry: boolean;
  };
}
```

### Webhook Contracts

#### Stripe Webhook Testing

```typescript
interface StripeWebhookPayload {
  id: string;
  object: 'event';
  type: 'checkout.session.completed' | 'invoice.payment_succeeded' | 'customer.subscription.updated';
  data: {
    object: CheckoutSession | Invoice | Subscription;
  };
}

interface WebhookTestCase {
  eventType: string;
  payload: StripeWebhookPayload;
  expectedActions: {
    database_updates: string[];
    email_notifications: string[];
    user_notifications: string[];
  };
  securityChecks: {
    signature_valid: boolean;
    idempotency: boolean;
    rate_limiting: boolean;
  };
}
```

#### Email Service Integration

```typescript
interface EmailDeliveryTest {
  template: 'welcome' | 'subscription' | 'emergency' | 'document_shared';
  recipient: TestUser;
  variables: Record<string, string>;
  expectedDelivery: {
    provider: 'resend';
    status: 'delivered' | 'bounced' | 'complained';
    tracking: boolean;
  };
  contentValidation: {
    subject_present: boolean;
    body_rendered: boolean;
    links_functional: boolean;
  };
}
```

## Database Test Schemas

### Test Database Setup

```sql
-- Test database schema for integration testing
CREATE SCHEMA test;

-- Test user sessions table
CREATE TABLE test.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  session_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Test document fixtures
CREATE TABLE test.document_fixtures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  document_type TEXT NOT NULL,
  encrypted_content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Test audit log for security testing
CREATE TABLE test.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### RLS Policy Testing

```typescript
interface RLSTestCase {
  table: string;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  user: TestUser;
  data: Record<string, any>;
  expectedResult: 'allow' | 'deny';
  policyCheck: {
    rls_enabled: boolean;
    policy_applied: boolean;
    error_message?: string;
  };
}

const rlsTestSuite: RLSTestCase[] = [
  {
    table: 'documents',
    operation: 'SELECT',
    user: { role: 'user' },
    data: { user_id: 'user-1' },
    expectedResult: 'allow',
    policyCheck: { rls_enabled: true, policy_applied: true }
  },
  {
    table: 'documents',
    operation: 'SELECT',
    user: { role: 'user' },
    data: { user_id: 'user-2' },
    expectedResult: 'deny',
    policyCheck: { rls_enabled: true, policy_applied: true }
  }
];
```

## Performance Test Data

### Load Test Scenarios

```typescript
interface LoadTestScenario {
  name: string;
  description: string;
  vus: number; // virtual users
  duration: string; // '5m', '10m'
  endpoints: LoadTestEndpoint[];
  thresholds: {
    http_req_duration: string; // 'p(95)<500'
    http_req_failed: string;  // 'rate<0.1'
  };
}

interface LoadTestEndpoint {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  payload?: any;
  headers?: Record<string, string>;
  expectedStatus: number;
}

const loadTestScenarios: LoadTestScenario[] = [
  {
    name: 'user_authentication',
    description: 'Test authentication under load',
    vus: 100,
    duration: '5m',
    endpoints: [
      {
        url: '/api/auth/login',
        method: 'POST',
        payload: { email: 'test@example.com', password: 'password' },
        expectedStatus: 200
      }
    ],
    thresholds: {
      http_req_duration: 'p(95)<1000',
      http_req_failed: 'rate<0.05'
    }
  }
];
```

### Performance Benchmarks

```typescript
interface PerformanceBenchmark {
  metric: string;
  target: number;
  unit: 'ms' | 's' | 'fps' | 'MB';
  testType: 'lighthouse' | 'k6' | 'playwright';
  environment: 'development' | 'staging' | 'production';
}

const performanceBenchmarks: PerformanceBenchmark[] = [
  {
    metric: 'first_contentful_paint',
    target: 1500,
    unit: 'ms',
    testType: 'lighthouse',
    environment: 'production'
  },
  {
    metric: 'largest_contentful_paint',
    target: 2500,
    unit: 'ms',
    testType: 'lighthouse',
    environment: 'production'
  },
  {
    metric: 'api_response_time',
    target: 200,
    unit: 'ms',
    testType: 'k6',
    environment: 'staging'
  }
];
```

## Security Test Data

### Encryption Test Vectors

```typescript
interface EncryptionTestVector {
  algorithm: 'TweetNaCl' | 'WebCrypto';
  keySize: number;
  plaintext: string;
  ciphertext: string;
  key: string;
  nonce?: string;
  testCases: {
    encryption: boolean;
    decryption: boolean;
    key_derivation: boolean;
    integrity: boolean;
  };
}

const encryptionTestVectors: EncryptionTestVector[] = [
  {
    algorithm: 'TweetNaCl',
    keySize: 32,
    plaintext: 'Hello, World!',
    ciphertext: 'expected_encrypted_value',
    key: 'derived_key_from_passphrase',
    testCases: {
      encryption: true,
      decryption: true,
      key_derivation: true,
      integrity: true
    }
  }
];
```

### Security Vulnerability Tests

```typescript
interface SecurityTestCase {
  vulnerability: string;
  category: 'injection' | 'broken_auth' | 'xss' | 'access_control' | 'crypto';
  endpoint: string;
  payload: any;
  expectedResult: 'blocked' | 'allowed_but_logged' | 'exploited';
  mitigation: string;
}

const securityTestCases: SecurityTestCase[] = [
  {
    vulnerability: 'SQL Injection',
    category: 'injection',
    endpoint: '/api/documents/search',
    payload: { query: "'; DROP TABLE users; --" },
    expectedResult: 'blocked',
    mitigation: 'parameterized queries'
  },
  {
    vulnerability: 'XSS in document title',
    category: 'xss',
    endpoint: '/api/documents',
    payload: { title: '<script>alert("xss")</script>' },
    expectedResult: 'blocked',
    mitigation: 'input sanitization'
  }
];
```

## Accessibility Test Data

### WCAG Compliance Test Cases

```typescript
interface AccessibilityTestCase {
  rule: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  element: string;
  description: string;
  testSteps: string[];
  expectedResult: 'pass' | 'fail';
  remediation: string;
}

const accessibilityTestCases: AccessibilityTestCase[] = [
  {
    rule: 'color-contrast',
    impact: 'serious',
    element: 'button.primary',
    description: 'Primary button must have sufficient color contrast',
    testSteps: [
      'Navigate to login page',
      'Locate primary login button',
      'Check contrast ratio between text and background'
    ],
    expectedResult: 'pass',
    remediation: 'Adjust colors to meet WCAG AA contrast requirements'
  },
  {
    rule: 'keyboard-navigation',
    impact: 'critical',
    element: 'form.login',
    description: 'Login form must be keyboard accessible',
    testSteps: [
      'Tab to username field',
      'Tab to password field',
      'Tab to submit button',
      'Verify focus indicators are visible'
    ],
    expectedResult: 'pass',
    remediation: 'Add focus styles and ensure tab order'
  }
];
```

### Screen Reader Test Scenarios

```typescript
interface ScreenReaderTest {
  scenario: string;
  assistiveTechnology: 'NVDA' | 'JAWS' | 'VoiceOver' | 'TalkBack';
  platform: 'Windows' | 'macOS' | 'iOS' | 'Android';
  steps: string[];
  expectedAnnouncements: string[];
  successCriteria: string;
}

const screenReaderTests: ScreenReaderTest[] = [
  {
    scenario: 'document_upload',
    assistiveTechnology: 'NVDA',
    platform: 'Windows',
    steps: [
      'Navigate to vault page',
      'Activate upload button',
      'Select file from dialog',
      'Confirm upload'
    ],
    expectedAnnouncements: [
      'Upload button clicked',
      'File selected: document.pdf',
      'Upload progress: 50%',
      'Upload complete'
    ],
    successCriteria: 'All interactions announced clearly'
  }
];
```

## Test Result Schemas

### Test Execution Results

```typescript
interface TestResult {
  id: string;
  testSuite: string;
  testCase: string;
  status: 'passed' | 'failed' | 'skipped' | 'flaky';
  duration: number; // milliseconds
  error?: {
    message: string;
    stack?: string;
    screenshot?: string;
    video?: string;
  };
  metadata: {
    browser?: string;
    device?: string;
    environment: string;
    timestamp: string;
  };
  performance?: {
    metrics: Record<string, number>;
    thresholds: Record<string, number>;
  };
  accessibility?: {
    violations: AccessibilityViolation[];
    score: number;
  };
}

interface TestSuiteResult {
  suiteName: string;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  results: TestResult[];
  coverage?: {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  };
}
```

### Quality Gate Status

```typescript
interface QualityGate {
  name: string;
  status: 'passed' | 'failed' | 'pending';
  criteria: {
    metric: string;
    operator: '>' | '<' | '>=' | '<=' | '==';
    threshold: number;
    actual?: number;
  }[];
  blocking: boolean; // prevents deployment if failed
  lastUpdated: string;
}

const qualityGates: QualityGate[] = [
  {
    name: 'unit_test_coverage',
    status: 'pending',
    criteria: [
      {
        metric: 'coverage_percentage',
        operator: '>=',
        threshold: 85
      }
    ],
    blocking: true,
    lastUpdated: new Date().toISOString()
  },
  {
    name: 'accessibility_compliance',
    status: 'pending',
    criteria: [
      {
        metric: 'wcag_violations',
        operator: '==',
        threshold: 0
      }
    ],
    blocking: true,
    lastUpdated: new Date().toISOString()
  }
];
