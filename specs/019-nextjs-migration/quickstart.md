# Next.js Migration - Quick Start Guide

## Overview

This guide provides comprehensive test scenarios to validate the Next.js migration functionality. Each scenario includes setup instructions, step-by-step execution, expected outcomes, and validation criteria.

## Goals

- Validate Next.js 14+ App Router configuration and basic functionality
- Test SSR/RSC implementation with server components and data fetching
- Verify App Router file-based routing and nested layouts
- Confirm Vercel integration and performance optimization
- Ensure Phase 0 governance setup (spec-kit, Linear, CI) is functional
- Validate Hollywood system integration and cross-specification compatibility

## Prerequisites

### Environment Setup

1. **Next.js Application**: `apps/web-next` scaffolded with App Router
2. **TypeScript**: Strict mode configuration enabled
3. **Supabase**: Database and edge functions configured
4. **Clerk**: Authentication service integrated
5. **Vercel**: Deployment environment ready
6. **Test Data**: Sample content and user accounts

### Development Environment

```bash
# Install dependencies
cd apps/web-next
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 1) Next.js Setup - configure Next.js application

**Objective**: Validate Next.js 14+ App Router configuration and basic functionality, including Phase 0 governance setup

**Setup**:

1. Ensure `apps/web-next` is properly scaffolded (do not extend Vite app)
2. Verify TypeScript configuration with strict mode
3. Check ESLint and Prettier setup with commit hooks
4. Confirm Tailwind CSS integration
5. Validate spec-kit governance system
6. Check Linear project setup and PR linkage
7. Verify CI configuration excludes `apps/web` from builds

**Steps**:

1. Navigate to `apps/web-next` directory
2. Start development server: `npm run dev`
3. Visit `http://localhost:3000`
4. Verify basic page loads with App Router
5. Test hot reload by modifying a component
6. Check TypeScript compilation with strict mode
7. Validate ESLint rules and Prettier formatting
8. Test build process: `npm run build`
9. Verify spec-kit governance workflow
10. Check Linear project linkage for PRs
11. Confirm CI excludes `apps/web` from typecheck/build

**Expected Outcomes**:

- ✅ Development server starts successfully
- ✅ Basic page renders correctly with App Router
- ✅ Hot reload works for component changes
- ✅ TypeScript compilation passes with strict mode
- ✅ ESLint validation runs without errors
- ✅ Production build completes successfully
- ✅ spec-kit governance system functional
- ✅ Linear PR linkage enforced
- ✅ CI properly excludes `apps/web` from builds
- ✅ Main branch protection with CI gates active

**Validation**:

```bash
# Check build output
ls -la apps/web-next/.next

# Verify TypeScript strict mode
npx tsc --noEmit --project apps/web-next/tsconfig.json

# Check linting and commit hooks
npm run lint
npm run type-check

# Verify CI configuration
cat .github/workflows/ci.yml

# Check spec-kit setup
ls -la .spec-kit/
```

## 2) App Router Testing - test App Router functionality

**Objective**: Test Next.js App Router with file-based routing, nested layouts, and navigation patterns

**Setup**:

1. Create nested route structure in `app/` directory
2. Set up multiple layouts for different sections
3. Configure dynamic routes and route groups
4. Prepare navigation components and links
5. Set up loading and error boundaries

**Steps**:

1. Create nested route structure:

```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dashboard-layout">
      <nav>Dashboard Navigation</nav>
      {children}
    </div>
  )
}

// app/dashboard/page.tsx
export default function DashboardPage() {
  return <h1>Dashboard Home</h1>
}

// app/dashboard/settings/page.tsx
export default function SettingsPage() {
  return <h1>Dashboard Settings</h1>
}
```

1. Test file-based routing navigation
2. Verify nested layouts work correctly
3. Check dynamic route parameters
4. Test route groups and organization
5. Validate loading states and error boundaries
6. Test programmatic navigation

**Expected Outcomes**:

- ✅ File-based routing works correctly
- ✅ Nested layouts render properly
- ✅ Dynamic routes handle parameters
- ✅ Route groups organize routes logically
- ✅ Navigation components work seamlessly
- ✅ Loading and error states display appropriately
- ✅ Programmatic navigation functions

**Validation**:

```typescript
// Test App Router navigation
await page.goto('/dashboard')
await expect(page.locator('text=Dashboard Home')).toBeVisible()

await page.click('text=Settings')
await expect(page).toHaveURL('/dashboard/settings')
await expect(page.locator('text=Dashboard Settings')).toBeVisible()

// Verify layout persistence
await expect(page.locator('nav')).toContainText('Dashboard Navigation')
```

## 3) Component Migration - test component migration

**Objective**: Validate client component functionality and interactivity

**Setup**:

1. Create client component with state
2. Set up event handlers
3. Configure client-side routing
4. Prepare interaction tests

**Steps**:

1. Create client component:

```typescript
'use client'

function TestClientComponent() {
  const [count, setCount] = useState(0)

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  )
}
```

1. Test client-side interactivity
2. Verify state management
3. Check event handling
4. Test component re-rendering

**Expected Outcomes**:

- ✅ Client component hydrates correctly
- ✅ State updates work properly
- ✅ Event handlers function as expected
- ✅ Component re-renders on state changes
- ✅ No hydration mismatches

**Validation**:

```typescript
// Test client interactivity
await page.click('button')
await expect(page.locator('text=Count: 1')).toBeVisible()

// Check for hydration errors
const errors = []
page.on('pageerror', error => errors.push(error))
expect(errors).toHaveLength(0)
```

## 4) SSR/RSC Testing - test server components

**Objective**: Test React Server Components (RSC) and Server-Side Rendering (SSR) functionality with comprehensive data fetching patterns and performance optimization

**Setup**:

1. Create server components with multiple data fetching patterns
2. Set up client/server component boundaries with proper separation
3. Configure streaming, suspense, and ISR (Incremental Static Regeneration)
4. Prepare Supabase integration for server-side data with caching
5. Set up error boundaries and loading states for server components
6. Configure middleware for request handling and authentication

**Steps**:

1. Create comprehensive server component patterns:

```typescript
// app/server-test/page.tsx - Server component with ISR
export const revalidate = 3600 // Revalidate every hour

async function ServerTestPage() {
  // Multiple data fetching patterns
  const [userData, postsData, analyticsData] = await Promise.all([
    fetchUserData(),
    fetchPostsData(),
    fetchAnalyticsData()
  ])

  return (
    <div>
      <h1>Server Component Test</h1>
      <Suspense fallback={<UserSkeleton />}>
        <ServerDataDisplay data={userData} />
      </Suspense>
      <Suspense fallback={<PostsSkeleton />}>
        <PostsList posts={postsData} />
      </Suspense>
      <ClientInteractiveComponent />
    </div>
  )
}

// Server component with streaming
function ServerDataDisplay({ data }: { data: UserData }) {
  return (
    <div>
      <h2>Server-Rendered Data</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}

// Client component for interactivity
'use client'
function ClientInteractiveComponent() {
  const [count, setCount] = useState(0)
  const [optimisticCount, setOptimisticCount] = useOptimistic(count)

  const increment = async () => {
    setOptimisticCount(count + 1)
    await updateCounter(count + 1)
    setCount(count + 1)
  }

  return (
    <button onClick={increment}>
      Count: {optimisticCount}
    </button>
  )
}
```

1. Test server-side rendering performance and caching
2. Verify data fetching works with ISR and revalidation
3. Check client/server hydration process and boundaries
4. Test streaming and suspense with loading states
5. Validate error boundaries for server component failures
6. Test RSC with Supabase integration and real-time updates
7. Verify middleware integration with server components

**Expected Outcomes**:

- ✅ Server components render on server without client bundle impact
- ✅ Data fetching works correctly with ISR and caching strategies
- ✅ Client/server boundaries maintain proper separation and hydration
- ✅ Streaming and suspense improve perceived performance
- ✅ Error boundaries catch and handle server-side errors gracefully
- ✅ Supabase integration works seamlessly in server components
- ✅ Middleware properly handles authentication and routing
- ✅ Optimistic updates work with server state synchronization

**Validation**:

```typescript
// Test SSR functionality and performance
const response = await fetch('/server-test')
const html = await response.text()

// Check for server-rendered content
expect(html).toContain('Server-Rendered Data')
expect(html).toContain('Server Component Test')

// Verify streaming and suspense work
expect(html).toContain('ServerDataDisplay') // Should be streamed
expect(html).toContain('PostsList') // Should be streamed

// Test client interactivity with optimistic updates
await page.click('button')
await expect(page.locator('text=Count: 1')).toBeVisible()

// Verify ISR is working (check cache headers)
const headers = response.headers
expect(headers.get('x-nextjs-cache')).toBeDefined()

// Check for proper hydration without mismatches
const hydrationErrors = []
page.on('console', msg => {
  if (msg.text().includes('hydration') || msg.text().includes('mismatch')) {
    hydrationErrors.push(msg.text())
  }
})
expect(hydrationErrors).toHaveLength(0)

// Test error boundaries
await page.goto('/server-test?error=true')
await expect(page.locator('text=Something went wrong')).toBeVisible()
await page.click('text=Try again')
await expect(page.locator('text=Server Component Test')).toBeVisible()
```

## 5) Middleware & API Routes Testing - test Next.js middleware and API routes

**Objective**: Test Next.js middleware implementation and API routes functionality for authentication, routing, and serverless functions

**Setup**:

1. Configure Next.js middleware for authentication and routing
2. Set up API routes with proper TypeScript types
3. Implement middleware for internationalization and security headers
4. Configure API route handlers with error handling and validation
5. Set up middleware testing utilities and mock data

**Steps**:

1. Test middleware functionality:

```typescript
// middleware.ts
import { authMiddleware } from '@clerk/nextjs'
import { NextResponse } from 'next/server'

export default authMiddleware({
  publicRoutes: ['/', '/api/webhooks'],
  beforeAuth: (req) => {
    const res = NextResponse.next()

    // Add security headers
    res.headers.set('X-Frame-Options', 'DENY')
    res.headers.set('X-Content-Type-Options', 'nosniff')
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    return res
  },
  afterAuth: (auth, req) => {
    if (!auth.userId && !auth.isPublicRoute) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }
  }
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)']
}
```

1. Test API routes implementation:

```typescript
// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser(params.id)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const updatedUser = await updateUser(params.id, body)

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

1. Test middleware authentication and routing
2. Verify API route handlers and error responses
3. Check security headers and CORS configuration
4. Validate request/response transformation
5. Test rate limiting and request validation
6. Verify middleware performance impact

**Expected Outcomes**:

- ✅ Middleware properly handles authentication and redirects
- ✅ Security headers are correctly applied to responses
- ✅ API routes handle CRUD operations with proper status codes
- ✅ Error handling provides appropriate error responses
- ✅ Request validation works for API endpoints
- ✅ Rate limiting prevents abuse
- ✅ Middleware performance doesn't significantly impact response times
- ✅ TypeScript types are properly enforced for API contracts

**Validation**:

```typescript
// Test middleware authentication
await page.goto('/protected')
await expect(page).toHaveURL(/.*sign-in.*/)

// Test API routes
const createResponse = await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Test User', email: 'test@example.com' })
})
expect(createResponse.status).toBe(201)
const createdUser = await createResponse.json()
expect(createdUser).toHaveProperty('id')

// Test API route with path parameters
const getResponse = await fetch(`/api/users/${createdUser.id}`)
expect(getResponse.status).toBe(200)
const fetchedUser = await getResponse.json()
expect(fetchedUser.name).toBe('Test User')

// Test error handling
const errorResponse = await fetch('/api/users/invalid-id')
expect(errorResponse.status).toBe(404)
const errorData = await errorResponse.json()
expect(errorData).toHaveProperty('error')

// Test security headers
const response = await fetch('/api/users')
const headers = response.headers
expect(headers.get('x-frame-options')).toBe('DENY')
expect(headers.get('x-content-type-options')).toBe('nosniff')
expect(headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin')
```

## 6) Performance Testing - test performance optimization

**Objective**: Validate Next.js API routes and serverless functions

**Setup**:

1. Create API route handlers
2. Set up database integration
3. Configure error handling
4. Prepare API testing tools

**Steps**:

1. Create API route:

```typescript
// app/api/test/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const data = await fetchData()
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
```

1. Test API endpoint
2. Verify error handling
3. Check request/response formats
4. Test different HTTP methods

**Expected Outcomes**:

- ✅ API route responds correctly
- ✅ Error handling works properly
- ✅ Request parsing functions
- ✅ Response formatting correct
- ✅ HTTP status codes appropriate

**Validation**:

```typescript
// Test API endpoint
const response = await fetch('/api/test')
const data = await response.json()

expect(response.status).toBe(200)
expect(data).toHaveProperty('data')
```

## 6) Data Fetching Testing - test data fetching

**Objective**: Test Supabase integration with Next.js

**Setup**:

1. Configure Supabase client
2. Set up database schema
3. Create data fetching utilities
4. Prepare test database

**Steps**:

1. Test database connection:

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

1. Test data fetching
2. Verify real-time subscriptions
3. Check RLS policies
4. Test database mutations

**Expected Outcomes**:

- ✅ Database connection established
- ✅ Data fetching works correctly
- ✅ Real-time updates function
- ✅ RLS policies enforced
- ✅ Mutations complete successfully

**Validation**:

```sql
-- Test database queries
SELECT COUNT(*) FROM test_table;

-- Check RLS policies
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

## 7) Routing Testing - test routing functionality

**Objective**: Validate Core Web Vitals and performance optimizations

**Setup**:

1. Configure performance monitoring
2. Set up build optimizations
3. Prepare performance testing tools
4. Create performance budgets

**Steps**:

1. Test image optimization:

```typescript
import Image from 'next/image'

export default function OptimizedImage() {
  return (
    <Image
      src="/hero.jpg"
      alt="Hero"
      width={800}
      height={600}
      priority
    />
  )
}
```

1. Check bundle analysis
2. Verify code splitting
3. Test lazy loading
4. Monitor Core Web Vitals

**Expected Outcomes**:

- ✅ Images optimized automatically
- ✅ Bundle size within limits
- ✅ Code splitting working
- ✅ Lazy loading functional
- ✅ Core Web Vitals scores >90

**Validation**:

```bash
# Check bundle size
npx @next/bundle-analyzer

# Run Lighthouse
npx lighthouse http://localhost:3000 --output=json
```

## 8) Compatibility Testing - test compatibility

**Objective**: Test Vercel deployment and production functionality

**Setup**:

1. Configure Vercel project
2. Set up environment variables
3. Prepare deployment scripts
4. Create staging environment

**Steps**:

1. Deploy to Vercel:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

1. Test production build
2. Verify environment variables
3. Check domain configuration
4. Test production functionality

**Expected Outcomes**:

- ✅ Deployment completes successfully
- ✅ Production build works correctly
- ✅ Environment variables loaded
- ✅ Domain configured properly
- ✅ All features work in production

**Validation**:

```bash
# Check deployment status
vercel ls

# Test production URL
curl -I https://your-app.vercel.app
```

## 9) Vercel Integration - test Vercel deployment

**Objective**: Test complete Vercel deployment with Next.js optimization, performance monitoring, and production readiness

**Setup**:

1. Configure Vercel project with proper settings
2. Set up environment variables and secrets
3. Configure custom domains and SSL
4. Set up preview deployments and staging
5. Prepare performance monitoring and analytics
6. Configure build optimizations and caching

**Steps**:

1. Deploy to Vercel with optimization settings:

```javascript
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["fra1", "cdg1", "lhr1"],
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ]
}
```

1. Test production build deployment
2. Verify environment variables load correctly
3. Check custom domain configuration
4. Test preview deployment workflow
5. Validate performance optimizations
6. Monitor Core Web Vitals in production
7. Test edge function integration

**Expected Outcomes**:

- ✅ Vercel deployment completes successfully
- ✅ Production build optimized for performance
- ✅ Environment variables configured properly
- ✅ Custom domain and SSL working
- ✅ Preview deployments functional
- ✅ Core Web Vitals meet targets (LCP <2.5s, FID <100ms, CLS <0.1)
- ✅ Image optimization and caching active
- ✅ API routes and edge functions operational
- ✅ Performance monitoring and analytics active

**Validation**:

```bash
# Check Vercel deployment
vercel ls

# Test production URL
curl -I https://your-app.vercel.app

# Check Core Web Vitals
curl "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://your-app.vercel.app&strategy=mobile"

# Verify environment variables
vercel env ls

# Test API routes
curl https://your-app.vercel.app/api/health

# Check build optimization
vercel build --prod
```

## 10) End-to-End Test - complete Next.js migration

**Objective**: Complete end-to-end Next.js migration validation

**Setup**:

1. Full application migrated
2. All features implemented
3. Production deployment ready
4. Comprehensive test suite

**Steps**:

1. **Setup Phase**:
   - Scaffold Next.js application
   - Configure all services
   - Set up development environment

1. **Migration Phase**:
   - Migrate components to Next.js
   - Convert routing to App Router
   - Implement server components
   - Set up API routes

1. **Integration Phase**:
   - Integrate authentication
   - Connect database
   - Configure edge functions
   - Set up deployment

1. **Testing Phase**:
   - Run all test scenarios
   - Performance testing
   - Security validation
   - User acceptance testing

1. **Production Phase**:
   - Deploy to production
   - Monitor performance
   - Validate functionality
   - Collect feedback

**Expected Outcomes**:

- ✅ Complete migration successful
- ✅ All features functional
- ✅ Performance requirements met
- ✅ Security standards maintained
- ✅ User experience improved

**Validation**:

```typescript
// Comprehensive test suite
describe('Next.js Migration', () => {
  test('App Router works correctly', async () => {
    // Test routing, components, API routes
  })

  test('Performance meets requirements', async () => {
    // Test Core Web Vitals, bundle size, load times
  })

  test('Security standards maintained', async () => {
    // Test authentication, authorization, data protection
  })

  test('Production deployment successful', async () => {
    // Test deployment, monitoring, error handling
  })
})
```

## Test Automation

### Running Automated Tests

```bash
# Run all quickstart scenarios
npm run test:quickstart

# Run specific scenario
npm run test:scenario -- --scenario=app-router

# Run performance tests
npm run test:performance

# Generate test report
npm run test:report
```

### Test Data Management

```typescript
// Test utilities
export class MigrationTestUtils {
  static async setupTestEnvironment(): Promise<void> {
    // Set up test database
    // Configure test services
    // Create test data
  }

  static async validateMigration(): Promise<boolean> {
    // Check App Router functionality
    // Verify SSR working
    // Test client components
    // Validate API routes
    return true
  }
}
```

## Troubleshooting

### Common Issues

1. **Build Errors**: Check TypeScript configuration and dependencies
2. **SSR Issues**: Verify server component implementation
3. **Hydration Errors**: Check client/server component boundaries
4. **API Route Errors**: Validate request/response handling
5. **Performance Issues**: Review bundle analysis and optimizations

### Debug Commands

```bash
# Check Next.js configuration
cat apps/web-next/next.config.js

# View build output
ls -la apps/web-next/.next

# Check environment variables
vercel env ls

# Monitor performance
npx @next/bundle-analyzer
```

These test scenarios provide comprehensive validation of the Next.js migration, ensuring all features work correctly and performance requirements are met.

## Linked docs

- See `spec.md` for complete specification overview and goals
- See `plan.md` for detailed implementation phases and timeline
- See `research.md` for Next.js migration research and technology evaluation
- See `data-model.md` for data structures and application state
