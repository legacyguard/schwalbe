# Auth + RLS Baseline: Quick Start Guide

## Prerequisites

Before implementing the Auth + RLS Baseline, ensure you have:

- [ ] Node.js 18+ installed
- [ ] npm (use npm ci for installs; use npm install only when adding new deps)
- [ ] Supabase CLI installed
- [ ] Supabase project with Auth enabled
- [ ] Access to Schwalbe monorepo
- [ ] Basic understanding of Next.js App Router

## Environment Setup

### 1. Supabase Auth Setup

This quickstart is Supabase-first. Legacy Clerk setup has been removed. Ensure your Supabase project has Auth enabled and continue with the Supabase steps below.

### 2. Supabase Project Setup

### 3. Runtime Env Validation (apps/web-next/src/lib/env.ts)

Create a small runtime validator to ensure critical auth environment variables are present and valid.

```typescript
// apps/web-next/src/lib/env.ts
import { z } from 'zod'

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
})

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
})

export const env = {
  client: clientSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }),
  server: serverSchema.parse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }),
}
```

1. **Create Supabase Project**

   ```bash
   # Visit https://supabase.com and create a new project
   # Note the project URL and anon key
   ```

2. **Configure Environment Variables**

   ```bash
   # In apps/web-next/.env.local
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

   # In supabase/.env.local
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

3. **Initialize Supabase Locally (Optional)**

   ```bash
   cd supabase
   npx supabase start
   ```

## Implementation Steps

### Step 1: Install Dependencies

```bash
# From repo root, add dependencies to the web-next workspace
npm install -w apps/web-next @supabase/supabase-js @supabase/ssr zod

# For development (devDependency)
npm install -D -w apps/web-next @types/node
```

### Step 2: Configure Supabase helpers (SSR)

Add server-side Supabase client helpers if needed for protected routes and SSR.

```typescript
// apps/web-next/src/lib/supabase-server.ts
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export function getSupabaseServerClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}
```

### Step 3: Protect routes (server utils example)

```typescript
// apps/web-next/src/lib/require-user.ts
import { redirect } from 'next/navigation'
import { getSupabaseServerClient } from './supabase-server'

export async function requireUser() {
  const supabase = getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')
  return user
}
```

### Step 4: Set Up Supabase Client

#### apps/web-next/src/lib/supabase.ts

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export const supabase = createClient()
```

### Step 5: Create Authentication Components

#### apps/web-next/src/components/auth/SignInButton.tsx

```typescript
'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function SignInButton() {
  const supabase = createClientComponentClient()
  return (
    <button
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      onClick={async () => {
        await supabase.auth.signInWithOAuth({ provider: 'google' })
      }}
    >
      Sign In
    </button>
  )
}
```

#### apps/web-next/src/components/auth/UserMenu.tsx

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function UserMenu() {
  const supabase = createClientComponentClient()
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null))
  }, [])

  return (
    <div className="flex items-center gap-3">
      {email && <span className="text-sm text-gray-600">{email}</span>}
      <button
        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
        onClick={async () => {
          await supabase.auth.signOut()
          window.location.href = '/'
        }}
      >
        Sign Out
      </button>
    </div>
  )
}
```

### Step 6: Create Protected Pages

#### apps/web-next/src/app/dashboard/page.tsx

```typescript
import { requireUser } from '@/lib/require-user'

export default async function DashboardPage() {
  const user = await requireUser()

  return (
    <div>
      <h1>Welcome to your Dashboard!</h1>
      <p>Your user ID: {user.id}</p>
    </div>
  )
}
```

### Step 7: Run Database Migrations

```bash
# Apply migrations to Supabase
cd supabase
npx supabase db push

# Or for local development
npx supabase migration up
```

### Step 8: Create Profile Management

#### apps/web-next/src/app/api/profile/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && (error as any).code !== 'PGRST116') throw error

    return NextResponse.json({ profile: data })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        email: user.email,
        first_name: body.firstName,
        last_name: body.lastName,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ profile: data })
  } catch (error) {
    console.error('Error creating profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

## Testing Scenarios

### 1) Auth Setup - configure authentication system

- [ ] Confirm Supabase Auth configured with required providers
- [ ] Configure authentication providers and settings
- [ ] Test basic authentication flow
- [ ] Verify environment variables are properly set

### 2) RLS Testing - test RLS policies

- [ ] Test Row Level Security policies for all tables
- [ ] Verify user data isolation
- [ ] Test policy enforcement with different user contexts
- [ ] Validate RLS performance and security

### 3) Session Testing - test session management

- [ ] Test session creation and persistence
- [ ] Verify session validation and refresh
- [ ] Test session timeout and cleanup
- [ ] Validate concurrent session handling

### 4) Access Control Testing - test access control

- [ ] Test role-based access control system
- [ ] Verify permission inheritance
- [ ] Test access control rules enforcement
- [ ] Validate access control performance

### 5) Security Testing - test security measures

- [ ] Test security hardening measures
- [ ] Verify vulnerability scanning
- [ ] Test security monitoring and alerting
- [ ] Validate security audit logging

### 6) Role Testing - test role management

- [ ] Test user role assignment and management
- [ ] Verify role hierarchy and permissions
- [ ] Test role-based access control
- [ ] Validate role management security

### 7) Permission Testing - test permission system

- [ ] Test permission management system
- [ ] Verify permission validation
- [ ] Test permission inheritance rules
- [ ] Validate permission system performance

### 8) Token Testing - test token management

- [ ] Test JWT token generation and validation
- [ ] Verify token refresh mechanisms
- [ ] Test token expiration handling
- [ ] Validate token security measures

### 9) Vulnerability Testing - test vulnerability scanning

- [ ] Perform vulnerability scanning
- [ ] Test security vulnerability fixes
- [ ] Verify vulnerability remediation
- [ ] Validate security testing coverage

### 10) End-to-End Test - complete auth workflow

- [ ] Test complete authentication workflow
- [ ] Verify end-to-end user journey
- [ ] Test integration between all components
- [ ] Validate complete system functionality

**apps/web-next/src/**tests**/auth.test.ts**

```typescript
import { describe, it, expect, vi } from 'vitest'
import { createClient } from '@/lib/supabase'

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  currentUser: vi.fn(),
}))

describe('Authentication', () => {
  it('should create Supabase client', () => {
    const client = createClient()
    expect(client).toBeDefined()
  })
})
```

### 2. Integration Tests

**apps/web-next/src/**tests**/profile-api.test.ts**

```typescript
import { describe, it, expect } from 'vitest'
import { createClient } from '@/lib/supabase'

describe('Profile API', () => {
  it('should handle profile operations', async () => {
    const supabase = createClient()

    // Test profile creation
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        user_id: 'test-user-id',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
      })
      .select()
      .single()

    expect(error).toBeNull()
    expect(data).toBeDefined()
    expect(data?.user_id).toBe('test-user-id')
  })
})
```

### 3. E2E Tests

#### apps/web-next/e2e/auth.spec.ts

```typescript
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should sign in user', async ({ page }) => {
    await page.goto('/')

    // Click sign in button
    await page.click('text=Sign In')

    // Fill in credentials
    await page.fill('[name=email]', 'test@example.com')
    await page.fill('[name=password]', 'password')

    // Submit form
    await page.click('[type=submit]')

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
  })

  test('should protect dashboard route', async ({ page }) => {
    await page.goto('/dashboard')

    // Should redirect to sign in
    await expect(page).toHaveURL(/sign-in/)
  })
})
```

## Development Workflow

### Local Development

```bash
# Start Next.js development server
npm run dev -w apps/web-next

# Start Supabase locally (optional)
cd supabase
npx supabase start

# Run tests
npm run test
npm run test:e2e
```

### Testing Authentication

1. **Manual Testing**
   - Visit `http://localhost:3000`
   - Click "Sign In" button
   - Create a test account or use existing credentials
   - Verify redirect to dashboard
   - Test profile creation and updates

2. **API Testing**

   ```bash
   # Test profile API
   curl -X GET http://localhost:3000/api/profile \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

3. **Database Testing**

   ```bash
   # Check RLS policies
   psql "postgresql://postgres:password@localhost:54322/postgres"
   \c postgres

   -- Test profile access
   SELECT * FROM profiles LIMIT 5;
   ```

## Troubleshooting

### Common Issues

#### 1. Supabase Auth Not Working

```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
# For server-side
echo $SUPABASE_SERVICE_ROLE_KEY
```

#### 2. RLS Policies Blocking Access

```sql
-- Check current user context
SELECT auth.uid();

-- Test policy manually
SET LOCAL request.jwt.claims TO '{"sub": "user_123"}';
SELECT * FROM profiles WHERE user_id = 'user_123';
```

#### 3. Middleware Not Protecting Routes

```typescript
// Check middleware.ts configuration
// Ensure routes are correctly matched
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)', // This matches /dashboard, /dashboard/settings, etc.
])
```

#### 4. Supabase Connection Issues

```bash
# Test Supabase connection
curl https://your-project.supabase.co/rest/v1/ \
  -H "apikey: YOUR_ANON_KEY"

# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Debug Commands

```bash
# Check Supabase user in browser console
const { data: { user } } = await supabase.auth.getUser()
console.log(user)

# Test Supabase connection
const { data } = await supabase.from('profiles').select('*').limit(1)
console.log(data)

# Check JWT session
const { data: sessionData } = await supabase.auth.getSession()
console.log(sessionData.session)
```

## Deployment

### Vercel Deployment

1. **Connect Repository**

   ```bash
   # In Vercel dashboard, connect GitHub repository
   # Configure build settings for apps/web-next
   ```

2. **Environment Variables**

```bash
# Set in Vercel dashboard
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

3. **Deploy**

   ```bash
   # Automatic deployment on push to main
   # Or manual deploy from Vercel dashboard
   ```

### Supabase Deployment

```bash
# Deploy migrations
cd supabase
npx supabase db push

# Deploy edge functions
npx supabase functions deploy
```

## Security Verification Checklist (Supabase Auth)

- [ ] Identity: Supabase Auth (auth.uid()); no service-role on client
- [ ] RLS tests: follow docs/testing/rls-test-template.md (two-user tests per table)
- [ ] Token handling: hashed single-use tokens with expiry; never log raw tokens
- [ ] Observability: structured logs + Resend alerts (no Sentry); see docs/observability/baseline.md
- [ ] HTTPS enabled in production; security headers and CSP configured
- [ ] Rate limiting implemented for sensitive endpoints
- [ ] Audit logging active for auth and security events

## Performance Monitoring

### Key Metrics to Monitor

- Authentication success rate (>99%)
- Average response time (<500ms)
- Error rate (<1%)
- Session duration
- Database query performance
- RLS policy evaluation time

### Monitoring Setup

Use Supabase Edge Functions logs and Resend alerts for critical events. Track auth events client-side with your analytics tool as needed.

## Next Steps

After completing the Auth + RLS Baseline:

1. **Test thoroughly** - Run all test suites and manual testing
2. **Security audit** - Conduct security review and penetration testing
3. **Performance optimization** - Monitor and optimize authentication performance
4. **Documentation** - Update API docs and user guides
5. **Team training** - Ensure team understands authentication patterns
6. **Monitoring setup** - Configure production monitoring and alerting

## Support

For issues or questions:

- **Supabase Documentation**: <https://supabase.com/docs>
- **Next.js Auth**: <https://nextjs.org/docs/authentication>
- **Team Chat**: Ask in #auth channel
- **Issues**: Create GitHub issue with `auth` label
