# Next.js Migration - Testing Strategy

## Testing Pyramid

### Unit Tests (Bottom Layer)

**Purpose**: Test individual functions and components in isolation

**Coverage Areas**:

- Utility functions
- Custom hooks
- Component logic
- API client functions
- Validation functions
- Business logic

**Tools**:

```typescript
// Jest + React Testing Library setup
import { render, screen, fireEvent } from '@testing-library/react'
import { jest } from '@jest/globals'

describe('UserProfile Component', () => {
  it('renders user information correctly', () => {
    const user = { name: 'John Doe', email: 'john@example.com' }
    render(<UserProfile user={user} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('calls onUpdate when save button is clicked', () => {
    const mockOnUpdate = jest.fn()
    render(<UserProfile user={user} onUpdate={mockOnUpdate} />)

    fireEvent.click(screen.getByText('Save'))
    expect(mockOnUpdate).toHaveBeenCalledWith(user)
  })
})
```

### Integration Tests (Middle Layer)

**Purpose**: Test component interactions and data flow

**Coverage Areas**:

- Component integration
- API integration
- Database operations
- Authentication flow
- Form submissions
- Navigation

**Tools**:

```typescript
// Integration test example
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createTestServer } from '@/test/utils'

describe('User Registration Flow', () => {
  const server = createTestServer()

  beforeEach(() => {
    server.listen()
  })

  afterEach(() => {
    server.resetHandlers()
    server.close()
  })

  it('completes registration successfully', async () => {
    const user = userEvent.setup()

    render(<RegistrationForm />, { wrapper: TestWrapper })

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Register' }))

    await waitFor(() => {
      expect(screen.getByText('Registration successful')).toBeInTheDocument()
    })
  })
})
```

### End-to-End Tests (Top Layer)

**Purpose**: Test complete user journeys and critical paths

**Coverage Areas**:

- User registration and login
- Dashboard interactions
- Data creation and management
- Navigation flows
- Error scenarios
- Performance validation

**Tools**:

```typescript
// Playwright E2E test
import { test, expect } from '@playwright/test'

test.describe('User Authentication', () => {
  test('should allow user to register and login', async ({ page }) => {
    // Navigate to registration page
    await page.goto('/register')

    // Fill registration form
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.fill('[name="confirmPassword"]', 'password123')
    await page.click('[type="submit"]')

    // Verify registration success
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('text=Welcome')).toBeVisible()

    // Test logout
    await page.click('[data-testid="logout-button"]')
    await expect(page).toHaveURL('/login')
  })
})
```

## Component Testing Strategy

### Server Component Testing

```typescript
// Server component test
import { render } from '@testing-library/react'
import { getUser } from '@/lib/auth'

// Mock the data fetching
jest.mock('@/lib/auth')
const mockGetUser = getUser as jest.MockedFunction<typeof getUser>

describe('UserDashboard', () => {
  it('renders user data correctly', async () => {
    const mockUser = { id: '1', name: 'John Doe' }
    mockGetUser.mockResolvedValue(mockUser)

    const component = await UserDashboard()
    const { container } = render(component)

    expect(container).toHaveTextContent('John Doe')
  })
})
```

### Client Component Testing

```typescript
// Client component test
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { UserForm } from '@/components/UserForm'

describe('UserForm', () => {
  it('submits form data correctly', async () => {
    const mockOnSubmit = jest.fn()
    render(<UserForm onSubmit={mockOnSubmit} />)

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'John Doe' }
    })
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'john@example.com' }
    })
    fireEvent.click(screen.getByText('Submit'))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com'
      })
    })
  })
})
```

## API Testing Strategy

### API Route Testing

```typescript
// API route test
import { NextRequest } from 'next/server'
import { GET } from '@/app/api/users/route'

describe('/api/users', () => {
  it('returns user list', async () => {
    const req = new NextRequest('http://localhost:3000/api/users')
    const response = await GET(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('users')
    expect(Array.isArray(data.users)).toBe(true)
  })
})
```

### API Integration Testing

```typescript
// API integration test
import { createClient } from '@supabase/supabase-js'
import { createTestClient } from '@/test/utils'

describe('Supabase Integration', () => {
  let client: any

  beforeEach(() => {
    client = createTestClient()
  })

  it('fetches user data correctly', async () => {
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('id', 'test-user-id')

    expect(error).toBeNull()
    expect(data).toHaveLength(1)
    expect(data[0].id).toBe('test-user-id')
  })
})
```

## Database Testing Strategy

### Unit Testing Database Functions

```typescript
// Database function test
import { getUserById } from '@/lib/database/users'
import { createTestDatabase } from '@/test/database'

describe('getUserById', () => {
  let db: any

  beforeEach(async () => {
    db = await createTestDatabase()
  })

  afterEach(async () => {
    await db.cleanup()
  })

  it('returns user data for valid ID', async () => {
    const userId = 'test-user-id'
    const user = await getUserById(db, userId)

    expect(user).toHaveProperty('id', userId)
    expect(user).toHaveProperty('email')
  })

  it('returns null for invalid ID', async () => {
    const user = await getUserById(db, 'invalid-id')
    expect(user).toBeNull()
  })
})
```

### Migration Testing

```typescript
// Migration test
import { migrateDatabase } from '@/lib/database/migrations'
import { createTestDatabase } from '@/test/database'

describe('Database Migrations', () => {
  let db: any

  beforeEach(async () => {
    db = await createTestDatabase()
  })

  it('applies migrations successfully', async () => {
    const result = await migrateDatabase(db)

    expect(result.success).toBe(true)
    expect(result.appliedMigrations).toHaveLength(5)
  })

  it('handles migration failures gracefully', async () => {
    // Simulate migration failure
    const mockDb = { ...db, exec: jest.fn().mockRejectedValue(new Error('Migration failed')) }

    const result = await migrateDatabase(mockDb)

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })
})
```

## Performance Testing Strategy

### Core Web Vitals Testing

```typescript
// Performance test
import { lighthouse } from '@/test/performance'

describe('Core Web Vitals', () => {
  it('meets performance standards', async () => {
    const results = await lighthouse('http://localhost:3000')

    expect(results.lighthouseResult.categories.performance.score).toBeGreaterThan(0.9)
    expect(results.lighthouseResult.categories.accessibility.score).toBeGreaterThan(0.9)
    expect(results.lighthouseResult.categories['best-practices'].score).toBeGreaterThan(0.9)
    expect(results.lighthouseResult.categories.seo.score).toBeGreaterThan(0.9)
  })
})
```

### Load Testing

```typescript
// Load test
import { artillery } from '@/test/load'

describe('Load Testing', () => {
  it('handles concurrent users', async () => {
    const config = {
      target: 'http://localhost:3000',
      phases: [
        { duration: 60, arrivalRate: 10 }, // 10 users per second for 1 minute
        { duration: 120, arrivalRate: 20 }, // 20 users per second for 2 minutes
      ],
      defaults: {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    }

    const results = await artillery.run(config)

    expect(results.report.summaries['http.response_time'].median).toBeLessThan(500)
    expect(results.report.summaries['http.response_time'].p95).toBeLessThan(1000)
  })
})
```

## Security Testing Strategy

### Authentication Testing

```typescript
// Authentication test
describe('Authentication Security', () => {
  it('prevents unauthorized access', async () => {
    const response = await fetch('/api/protected-route')

    expect(response.status).toBe(401)
  })

  it('validates JWT tokens', async () => {
    const invalidToken = 'invalid.jwt.token'
    const response = await fetch('/api/protected-route', {
      headers: {
        'Authorization': `Bearer ${invalidToken}`
      }
    })

    expect(response.status).toBe(401)
  })

  it('handles token expiration', async () => {
    const expiredToken = createExpiredToken()
    const response = await fetch('/api/protected-route', {
      headers: {
        'Authorization': `Bearer ${expiredToken}`
      }
    })

    expect(response.status).toBe(401)
  })
})
```

### Authorization Testing

```typescript
// Authorization test
describe('Authorization', () => {
  it('enforces role-based access', async () => {
    const userToken = await createUserToken('user')
    const adminToken = await createUserToken('admin')

    // User cannot access admin route
    const userResponse = await fetch('/api/admin/users', {
      headers: { 'Authorization': `Bearer ${userToken}` }
    })
    expect(userResponse.status).toBe(403)

    // Admin can access admin route
    const adminResponse = await fetch('/api/admin/users', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    })
    expect(adminResponse.status).toBe(200)
  })
})
```

## Test Environment Setup

### Test Database

```typescript
// Test database setup
import { createClient } from '@supabase/supabase-js'

export function createTestDatabase() {
  const client = createClient(
    process.env.SUPABASE_TEST_URL!,
    process.env.SUPABASE_TEST_ANON_KEY!
  )

  return {
    client,
    async setup() {
      // Create test tables and data
      await client.from('test_users').insert(testUserData)
    },
    async cleanup() {
      // Clean up test data
      await client.from('test_users').delete().neq('id', '')
    }
  }
}
```

### Test Utilities

```typescript
// Test utilities
export function createTestUser(overrides = {}) {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    ...overrides
  }
}

export function createTestRequest(overrides = {}) {
  return new NextRequest('http://localhost:3000/test', {
    method: 'GET',
    headers: {
      'content-type': 'application/json'
    },
    ...overrides
  })
}

export function renderWithProviders(component: React.ReactElement) {
  return render(component, {
    wrapper: ({ children }) => (
      <TestProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </TestProvider>
    )
  })
}
```

## CI/CD Testing Integration

### GitHub Actions Testing

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:e2e
      - run: npm run test:performance
```

### Test Coverage

```typescript
// Jest coverage configuration
module.exports = {
  collectCoverageFrom: [
    'apps/web-next/**/*.{ts,tsx}',
    'packages/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/*.config.{ts,js}',
    '!**/coverage/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  coverageReporters: ['text', 'lcov', 'html']
}
```

## Accessibility Testing

### Automated Accessibility Tests

```typescript
// Accessibility test
import { axe } from 'jest-axe'

describe('Accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<UserForm />)
    const results = await axe(container)

    expect(results.violations).toHaveLength(0)
  })
})
```

### Manual Accessibility Testing

- Keyboard navigation testing
- Screen reader compatibility
- Color contrast verification
- Focus management validation
- ARIA attributes verification

## Visual Regression Testing

### Visual Test Setup

```typescript
// Visual regression test
import { toMatchImageSnapshot } from 'jest-image-snapshot'

expect.extend({ toMatchImageSnapshot })

describe('Visual Regression', () => {
  it('matches previous screenshot', async () => {
    const page = await browser.newPage()
    await page.goto('http://localhost:3000')

    const screenshot = await page.screenshot()
    expect(screenshot).toMatchImageSnapshot()
  })
})
```

## Test Data Management

### Test Data Factory

```typescript
// Test data factory
export class TestDataFactory {
  static createUser(overrides = {}) {
    return {
      id: faker.datatype.uuid(),
      email: faker.internet.email(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      createdAt: faker.date.past(),
      ...overrides
    }
  }

  static createPost(userId: string, overrides = {}) {
    return {
      id: faker.datatype.uuid(),
      userId,
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraphs(),
      createdAt: faker.date.past(),
      ...overrides
    }
  }
}
```

### Test Database Seeding

```typescript
// Database seeding
export async function seedTestData(db: any) {
  const users = Array.from({ length: 10 }, () => TestDataFactory.createUser())
  const posts = users.flatMap(user =>
    Array.from({ length: 5 }, () => TestDataFactory.createPost(user.id))
  )

  await db.table('users').insert(users)
  await db.table('posts').insert(posts)

  return { users, posts }
}
```

This comprehensive testing strategy ensures the Next.js migration maintains high quality standards with thorough testing at all levels, from unit tests to end-to-end scenarios, covering functionality, performance, security, and accessibility.
