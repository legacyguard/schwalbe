# Integration Testing Scenarios

## 1) Testing Setup - configure testing environment

Configure the complete testing environment for Schwalbe platform:

- Set up Node.js 18+ with npm (use npm ci for installs)
- Install Docker and Docker Compose for test databases
- Configure GitHub repository access and permissions
- Install Supabase CLI for database management
- Set up Playwright browsers for cross-browser testing
- Clone Schwalbe repository and install dependencies
- Configure environment variables for test environments
- Set up test database with Docker Compose
- Run database migrations and seed initial test data
- Verify all testing tools are properly installed and configured

## 2) End-to-End Testing - test complete workflows

Execute comprehensive end-to-end test scenarios:

- Test complete user registration and email verification flow
- Validate user login and authentication persistence
- Test document vault creation and initial document upload
- Verify will creation wizard with clause assembly
- Test family collaboration invitation and acceptance
- Validate emergency access activation workflow
- Test time capsule creation and scheduling
- Verify professional network consultation booking
- Test billing subscription creation and payment flow
- Validate Sofia AI guided conversations and responses

## 3) Integration Testing - test service integrations

Test all service-to-service integrations and API contracts:

- Validate Supabase function calls and responses
- Test Stripe webhook processing and payment handling
- Verify Resend email delivery and template rendering
- Test Google Translate API integration for i18n
- Validate Supabase Auth middleware
- Test Supabase RLS policy enforcement
- Verify external OCR and AI service integrations
- Test file upload and storage service interactions
- Validate audit logging across all services
- Test error handling and fallback mechanisms

## 4) Performance Testing - test system performance

Execute performance testing and benchmarking:

- Run Lighthouse CI for Core Web Vitals measurement
- Execute k6 load testing scenarios for concurrent users
- Test API response times under various loads
- Validate database query performance and optimization
- Test file upload/download speeds and limits
- Monitor memory usage and resource consumption
- Test animation performance and frame rates
- Validate bundle size and loading performance
- Test caching effectiveness and CDN performance
- Monitor performance regression over time

## 5) Security Testing - test security measures

Perform comprehensive security validation:

- Test client-side encryption implementation
- Validate zero-knowledge architecture compliance
- Test RLS policy enforcement across all tables
- Verify input sanitization and XSS prevention
- Test authentication and session security
- Validate file upload security and malware detection
- Check secure headers and CSP implementation
- Test rate limiting and DoS protection
- Validate audit logging and compliance tracking
- Perform dependency vulnerability scanning

## 6) Accessibility Testing - test accessibility compliance

Ensure WCAG 2.1 AA compliance across all interfaces:

- Test color contrast ratios for all UI elements
- Validate keyboard navigation and focus management
- Test screen reader compatibility and announcements
- Verify form labeling and error messaging
- Test touch target sizes for mobile interfaces
- Validate animation and motion sensitivity controls
- Test high contrast mode compatibility
- Verify ARIA attributes and semantic HTML
- Test assistive technology integration
- Validate accessibility regression prevention

## 7) Mobile Testing - ensure mobile testing coverage

Test mobile-specific functionality and responsiveness:

- Test iOS Safari and Chrome mobile compatibility
- Validate Android browser support and performance
- Test touch interactions and gesture handling
- Verify responsive design across device sizes
- Test mobile-specific UI components and layouts
- Validate camera and file picker integrations
- Test push notification delivery and handling
- Verify biometric authentication on mobile
- Test offline functionality and data synchronization
- Validate mobile performance and battery usage

## 8) API Testing - test API endpoints

Validate all API endpoints and contracts:

- Test Supabase Edge Function endpoints
- Validate REST API responses and error handling
- Test GraphQL queries and mutations
- Verify webhook endpoint processing
- Test authentication and authorization APIs
- Validate file upload and download APIs
- Test real-time subscription endpoints
- Verify rate limiting and throttling
- Test API versioning and backward compatibility
- Validate API documentation and OpenAPI specs

## 9) Load Testing - test system under load

Execute load testing scenarios for system resilience:

- Test user authentication under high concurrent load
- Validate document upload/download performance at scale
- Test emergency access activation during peak usage
- Verify database performance with multiple connections
- Test API rate limiting and queue management
- Validate caching effectiveness under load
- Test service auto-scaling and resource allocation
- Monitor error rates and failure patterns
- Test recovery mechanisms and failover scenarios
- Validate performance monitoring and alerting

## 10) End-to-End Test - complete testing workflow

Execute the complete testing workflow from setup to validation:

- Set up testing environment and infrastructure
- Run unit tests for code quality validation
- Execute integration tests for service validation
- Perform end-to-end tests for user journey validation
- Run performance tests for system benchmarking
- Execute security tests for vulnerability assessment
- Perform accessibility tests for compliance validation
- Run mobile tests for cross-platform validation
- Execute API tests for contract validation
- Perform load tests for scalability validation
- Generate comprehensive test reports and metrics
- Validate quality gates and deployment readiness
- Monitor post-deployment performance and stability

## Running Tests

### Quick Test Execution

#### Run All Tests

```bash
# Run complete test suite
npm run test:all

# Run with coverage
npm run test:coverage

# Run in CI mode (no watch)
npm run test:ci
```

#### Run Specific Test Types

```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# End-to-end tests only
npm run test:e2e

# Performance tests
npm run test:performance

# Security tests
npm run test:security

# Accessibility tests
npm run test:accessibility
```

### Development Workflow

#### Test-Driven Development

```bash
# Run tests in watch mode during development
npm run test:watch

# Run tests for specific package
npm run test -- --filter=@schwalbe/logic
# Or via workspace-scoped command
npm run test -w packages/logic

# Run tests with debugging
npm run test:debug
```

#### Pre-commit Testing

```bash
# Run pre-commit checks
npm run pre-commit

# Fix linting issues
npm run lint:fix

# Type check
npm run typecheck
```

## Test Configuration

### Environment Variables

```bash
# Test environment settings
TEST_ENV=development
TEST_BASE_URL=http://localhost:3000
TEST_TIMEOUT=30000

# Database settings
TEST_DATABASE_URL=postgresql://test:test@localhost:5433/schwalbe_test

# External services
TEST_STRIPE_SECRET_KEY=sk_test_...
TEST_RESEND_API_KEY=re_...
TEST_SUPABASE_SERVICE_ROLE_KEY=...

# Browser settings
TEST_BROWSERS=chromium,firefox,webkit
TEST_HEADLESS=true
```

### Playwright Configuration

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,

  use: {
    baseURL: process.env.TEST_BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
  ],
});
```

## Writing Tests

### Unit Test Example

```typescript
// packages/logic/src/services/willService.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { WillService } from './willService';
import { mockSupabaseClient } from '../../../test/mocks';

describe('WillService', () => {
  let service: WillService;
  let mockClient: any;

  beforeEach(() => {
    mockClient = mockSupabaseClient();
    service = new WillService(mockClient);
  });

  describe('createWill', () => {
    it('should create a will with valid data', async () => {
      const willData = {
        userId: 'user-123',
        title: 'My Will',
        clauses: [{ type: 'executor', content: 'John Doe' }],
      };

      mockClient.from.returns({
        insert: vi.fn().mockResolvedValue({ data: { id: 'will-123' } }),
      });

      const result = await service.createWill(willData);

      expect(result.id).toBe('will-123');
      expect(mockClient.from).toHaveBeenCalledWith('wills');
    });

    it('should throw error for invalid data', async () => {
      const invalidData = { userId: '', title: '' };

      await expect(service.createWill(invalidData)).rejects.toThrow(
        'Invalid will data'
      );
    });
  });
});
```

### Integration Test Example

```typescript
// tests/integration/api/documents.test.ts
import { test, expect } from '@playwright/test';
import { createTestUser, createTestDocument } from '../fixtures';
import { apiClient } from '../utils/apiClient';

test.describe('Document API', () => {
  let testUser: any;
  let authToken: string;

  test.beforeEach(async () => {
    testUser = await createTestUser();
    authToken = await apiClient.authenticate(testUser);
  });

  test('should upload document successfully', async () => {
    const documentData = {
      title: 'Test Document',
      content: 'This is a test document',
      type: 'vault',
    };

    const response = await apiClient.uploadDocument(documentData, authToken);

    expect(response.status).toBe(201);
    expect(response.data.documentId).toBeDefined();
    expect(response.data.checksum).toBeDefined();

    // Verify in database
    const dbDocument = await apiClient.getDocument(
      response.data.documentId,
      authToken
    );
    expect(dbDocument.data.title).toBe(documentData.title);
  });

  test('should enforce RLS on document access', async () => {
    const otherUser = await createTestUser();
    const otherUserDoc = await createTestDocument(otherUser.id);

    // Try to access other user's document
    const response = await apiClient.getDocument(otherUserDoc.id, authToken);

    expect(response.status).toBe(403);
    expect(response.data.error).toContain('access denied');
  });
});
```

### End-to-End Test Example

```typescript
// tests/e2e/vault.spec.ts
import { test, expect } from '@playwright/test';
import { createTestUser } from '../fixtures/userFixtures';
import { VaultPage } from '../pages/VaultPage';
import { LoginPage } from '../pages/LoginPage';

test.describe('Document Vault', () => {
  let testUser: any;

  test.beforeEach(async ({ page }) => {
    testUser = await createTestUser();
  });

  test('should upload and view document', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const vaultPage = new VaultPage(page);

    // Login
    await loginPage.goto();
    await loginPage.login(testUser.email, testUser.password);

    // Navigate to vault
    await vaultPage.goto();

    // Upload document
    await vaultPage.uploadDocument('test-document.pdf');

    // Verify upload success
    await expect(vaultPage.successMessage).toBeVisible();
    await expect(vaultPage.documentList).toContainText('test-document.pdf');

    // View document
    await vaultPage.viewDocument('test-document.pdf');
    await expect(vaultPage.documentViewer).toBeVisible();
  });

  test('should handle emergency access', async ({ page }) => {
    // Setup emergency scenario
    const guardian = await createTestUser();
    await testUser.addGuardian(guardian.id);

    // Simulate emergency activation
    await vaultPage.triggerEmergency(testUser.id);

    // Login as guardian
    await loginPage.login(guardian.email, guardian.password);

    // Access emergency documents
    await vaultPage.accessEmergencyDocuments(testUser.id);
    await expect(vaultPage.emergencyDocuments).toBeVisible();
  });
});
```

### Performance Test Example

```javascript
// tests/load/user-journey.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10, // 10 virtual users
  duration: '30s',

  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.1'], // Error rate should be below 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // User authentication
  const authResponse = http.post(`${BASE_URL}/api/auth/login`, {
    email: `user${__VU}@test.com`,
    password: 'password123',
  });

  check(authResponse, {
    'auth successful': (r) => r.status === 200,
    'has auth token': (r) => r.json('token') !== '',
  });

  const token = authResponse.json('token');

  // Document upload
  const uploadResponse = http.post(
    `${BASE_URL}/api/documents/upload`,
    {
      title: 'Performance Test Document',
      content: 'Test content for performance validation',
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  check(uploadResponse, {
    'upload successful': (r) => r.status === 201,
    'upload duration < 1000ms': (r) => r.timings.duration < 1000,
  });

  sleep(1); // Wait 1 second between iterations
}
```

## Debugging Tests

### Test Debugging Commands

```bash
# Run test with debug mode
npm run test:e2e -- --debug

# Run specific test file
npm run test:e2e -- tests/e2e/vault.spec.ts

# Run test with headed browser
HEADLESS=false npm run test:e2e

# Run test with slow motion
SLOWMO=1000 npm run test:e2e

# Generate test report
npm run test:e2e -- --reporter=html
```

### Common Debugging Techniques

#### Playwright Inspector

```bash
# Run test with inspector
PWDEBUG=1 npm run test:e2e
```

#### Visual Debugging

```typescript
// Add to test for debugging
await page.pause(); // Pauses execution for manual inspection

// Take screenshot for debugging
await page.screenshot({ path: 'debug-screenshot.png' });

// Log console messages
page.on('console', msg => console.log('PAGE LOG:', msg.text()));
```

#### API Debugging

```typescript
// Log all API requests
page.on('request', request => {
  console.log('Request:', request.url(), request.method());
});

page.on('response', response => {
  console.log('Response:', response.url(), response.status());
});
```

## Test Data Management

### Creating Test Fixtures

```typescript
// tests/fixtures/userFixtures.ts
export async function createTestUser(overrides = {}) {
  const userData = {
    email: `test-${Date.now()}@example.com`,
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
    ...overrides,
  };

  const response = await apiClient.createUser(userData);
  return response.data;
}

export async function createTestDocument(userId: string, overrides = {}) {
  const docData = {
    userId,
    title: 'Test Document',
    content: 'Test content',
    type: 'vault',
    ...overrides,
  };

  const response = await apiClient.createDocument(docData);
  return response.data;
}
```

### Database Seeding

```typescript
// scripts/seed-test-data.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.TEST_SUPABASE_URL!,
  process.env.TEST_SUPABASE_SERVICE_ROLE_KEY!
);

export async function seedTestData() {
  // Create test users
  const users = await Promise.all([
    supabase.auth.admin.createUser({
      email: 'test-user-1@example.com',
      password: 'password123',
      user_metadata: { firstName: 'Test', lastName: 'User 1' },
    }),
    // ... more users
  ]);

  // Create test documents
  for (const user of users) {
    await supabase.from('documents').insert({
      user_id: user.data.user.id,
      title: 'Test Document',
      encrypted_content: 'encrypted content',
      metadata: { type: 'vault' },
    });
  }

  console.log('Test data seeded successfully');
}
```

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
cache: 'npm'

      - name: Install dependencies
run: npm ci

      - name: Type check
run: npm run type-check

      - name: Lint
run: npm run lint

      - name: Unit tests
run: npm run test:unit

      - name: Integration tests
run: npm run test:integration

      - name: E2E tests
run: npm run test:e2e
        env:
          TEST_BASE_URL: http://localhost:3000

      - name: Performance tests
run: npm run test:performance

      - name: Security tests
run: npm run test:security

      - name: Accessibility tests
run: npm run test:accessibility

      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: |
            test-results/
            playwright-report/
            coverage/
```

## Troubleshooting

### Common Issues

#### Test Timeouts

```typescript
// Increase timeout for slow operations
test.setTimeout(60000); // 60 seconds

// Or per test
test('slow test', async ({ page }) => {
  test.setTimeout(120000);
  // ... test code
});
```

#### Flaky Tests

```typescript
// Add retry logic
test.describe.configure({ retries: 3 });

// Wait for elements properly
await page.waitForSelector('.document-list', { timeout: 10000 });

// Use more specific selectors
await page.locator('[data-testid="upload-button"]').click();
```

#### Database Connection Issues

```bash
# Reset test database
npm run db:reset:test

# Check database logs
docker logs test-db

# Verify connection
npm run db:ping:test
```

#### Browser Issues

```bash
# Clear browser cache
npx playwright install --force

# Update browsers
npx playwright install-deps

# Run with specific browser
npx playwright test --project=chromium
```

### Performance Optimization

#### Parallel Test Execution

```typescript
// playwright.config.ts
export default defineConfig({
  workers: process.env.CI ? 4 : 2, // Run tests in parallel
  fullyParallel: true, // Run tests in same file in parallel
});
```

#### Test Isolation

```typescript
// Use unique test data
const testEmail = `test-${Date.now()}@${Math.random()}.com`;

// Clean up after tests
test.afterEach(async () => {
  await cleanupTestData();
});
```

#### Selective Test Running

```bash
# Run only failed tests
npm run test:e2e -- --last-failed

# Run tests related to changed files
npm run test:e2e -- --grep="vault"

# Skip slow tests in development
npm run test:e2e -- --grep-invert="slow"
```

## Best Practices

### Test Organization

- Group related tests in describe blocks
- Use descriptive test names
- Keep tests independent and isolated
- Use page objects for UI interactions
- Mock external dependencies

### Test Data

- Use factories for test data creation
- Clean up test data after tests
- Avoid hard-coded test data
- Use realistic data for better coverage

### Assertions

- Use specific assertions over generic ones
- Test both positive and negative scenarios
- Verify side effects (database, external calls)
- Check error handling and edge cases

### Maintenance

- Keep tests up to date with code changes
- Regularly review and refactor tests
- Monitor test execution time and reliability
- Update test data when schema changes

## Resources

### Documentation

- [Playwright Documentation](https://playwright.dev/)
- [Jest Documentation](https://jestjs.io/)
- [k6 Documentation](https://k6.io/docs/)
- [Testing Library](https://testing-library.com/)

### Tools

- [Playwright Test Runner](https://playwright.dev/docs/test-runner)
- [Jest Matchers](https://jestjs.io/docs/expect)
- [k6 Load Testing](https://k6.io/docs/testing-guides/running-large-tests/)
- [axe-core Accessibility](https://github.com/dequelabs/axe-core)

### Community

- [Playwright Slack](https://playwright.dev/community/welcome)
- [Testing Library Discord](https://testing-library.com/discord)
- [k6 Community Forum](https://community.k6.io/)
