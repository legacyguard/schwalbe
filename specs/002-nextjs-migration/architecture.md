# Next.js Migration - System Architecture

## Application Architecture

### Monorepo Structure

```text
schwalbe/
├── apps/
│   ├── web-next/           # Next.js App Router application
│   │   ├── app/           # App Router directory
│   │   ├── components/    # React components
│   │   ├── lib/          # Utilities and configurations
│   │   ├── hooks/        # Custom React hooks
│   │   ├── types/        # TypeScript type definitions
│   │   └── styles/       # Global styles and Tailwind config
│   └── web/              # Frozen Vite application (reference only)
├── packages/
│   ├── shared/           # Shared utilities and services
│   │   ├── src/
│   │   │   ├── services/    # API clients and external services
│   │   │   ├── utils/       # Utility functions
│   │   │   ├── types/       # Shared type definitions
│   │   │   └── config/      # Configuration management
│   │   └── package.json
│   ├── ui/               # Design system and components
│   │   ├── src/
│   │   │   ├── components/  # Reusable UI components
│   │   │   ├── primitives/  # Basic UI primitives
│   │   │   ├── themes/      # Theme configurations
│   │   │   └── utils/       # UI utilities
│   │   └── package.json
│   └── logic/            # Business logic and domain models
│       ├── src/
│       │   ├── services/    # Domain services
│       │   ├── models/      # Domain models
│       │   ├── validation/  # Validation logic
│       │   └── workflows/   # Business workflows
│       └── package.json
├── supabase/
│   ├── migrations/       # Database migrations
│   ├── functions/        # Edge functions
│   ├── config/          # Supabase configuration
│   └── types/           # Generated database types
├── scripts/             # Build and deployment scripts
├── docs/               # Documentation
└── specs/              # Specification documents
```

## Next.js App Router Architecture

### Route Structure

```text
app/
├── layout.tsx              # Root layout with providers
├── page.tsx               # Home page
├── loading.tsx            # Global loading UI
├── error.tsx             # Global error boundary
├── not-found.tsx         # 404 page
├── dashboard/
│   ├── layout.tsx        # Dashboard layout
│   ├── page.tsx          # Dashboard page
│   ├── loading.tsx       # Dashboard loading
│   └── settings/
│       └── page.tsx      # Settings page
├── api/
│   ├── users/
│   │   └── route.ts      # Users API routes
│   └── auth/
│       └── callback/
│           └── route.ts  # Auth callback
└── (auth)/
    ├── login/
    │   └── page.tsx      # Login page
    └── signup/
        └── page.tsx      # Signup page
```

### Server and Client Components

#### Server Components

```typescript
// app/dashboard/page.tsx
import { getUser } from '@/lib/auth'
import { getDashboardData } from '@/lib/data'
import Dashboard from '@/components/Dashboard'

export default async function DashboardPage() {
  const user = await getUser()
  const data = await getDashboardData(user.id)

  return <Dashboard user={user} data={data} />
}
```

#### Client Components

```typescript
// components/Dashboard.tsx
'use client'

import { useState } from 'react'

export default function Dashboard({ user, initialData }: { user: { id: string; firstName?: string | null }, initialData: any }) {
  const [data, setData] = useState(initialData)
  return (
    <div>
      <h1>Welcome{user.firstName ? `, ${user.firstName}` : ''}</h1>
      {/* Interactive content */}
    </div>
  )
}
```

## Data Flow Architecture

### Server-Side Data Fetching

```typescript
// lib/data.ts
export async function getDashboardData(userId: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from('user_data')
    .select('*')
    .eq('user_id', userId)

  if (error) throw new Error(error.message)

  return data
}
```

### Client-Side Data Management

```typescript
// hooks/useDashboard.ts
import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function useDashboard() {
  const supabase = createClientComponentClient()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id
      if (uid) {
        const res = await fetch(`/api/dashboard?uid=${uid}`)
        setData(await res.json())
      }
      setLoading(false)
    })
  }, [])

  return { data, loading }
}
```

## Authentication & Header Architecture

### Global Header and Multi-domain Overview

- Marketing layout includes a right-aligned header actions bar: User, Country, Search, Support, Buy (see 033-landing-page/spec.md)
- Country selector supports multi-domain per country; MVP allows legacyguard.cz and legacyguard.sk only; future-ready for more domains
- Environment flag VITE_IS_PRODUCTION controls real redirects (production) vs Czech-language simulation modal (staging/local)
- Authentication uses Supabase Auth; sign-in modal or /sign-in route

### Middleware Implementation

```typescript
// middleware.ts (example)
import { NextResponse } from 'next/server'

export default function middleware() {
  // Add security headers or basic routing guards here as needed
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)']
}
```

### Protected Routes

```typescript
// app/dashboard/layout.tsx
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
  )
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) redirect('/sign-in')
  return <div>{children}</div>
}
```

## API Architecture

### Route Handlers

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getUser, createUser } from '@/lib/users'

export async function GET(request: NextRequest) {
  try {
    const users = await getUser()
    return NextResponse.json({ users })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const user = await createUser(body)
    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 400 }
    )
  }
}
```

### API Utilities

```typescript
// lib/api.ts
export class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  }
}
```

## Database Architecture

### Supabase Integration

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export function createServerSupabaseClient() {
  const cookieStore = cookies()

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}

export function createBrowserSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Database Schema

```sql
-- Core tables
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- external_id deprecated; rely on auth.users(id) for identity
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light',
  language TEXT DEFAULT 'en',
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## State Management

### Server State

```typescript
// Server state is handled through data fetching
// No client-side state management needed for server components
async function ServerComponent() {
  const data = await fetchData()
  return <ClientComponent initialData={data} />
}
```

### Client State

```typescript
// lib/store.ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface AppState {
  user: User | null
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  setUser: (user: User | null) => void
  setTheme: (theme: 'light' | 'dark') => void
  toggleSidebar: () => void
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        theme: 'light',
        sidebarOpen: false,
        setUser: (user) => set({ user }),
        setTheme: (theme) => set({ theme }),
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      }),
      {
        name: 'app-storage',
      }
    )
  )
)
```

## Performance Architecture

### Code Splitting

```typescript
// Automatic code splitting with dynamic imports
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <div>Loading...</div>,
  ssr: false, // Disable SSR for this component
})
```

### Image Optimization

```typescript
// Automatic image optimization
import Image from 'next/image'

export default function OptimizedImage() {
  return (
    <Image
      src="/hero.jpg"
      alt="Hero image"
      width={800}
      height={600}
      priority // Preload for above-the-fold images
      placeholder="blur" // Show blur placeholder
    />
  )
}
```

### Caching Strategy

```typescript
// ISR - Incremental Static Regeneration
export const revalidate = 60 // Revalidate every 60 seconds

// SSG - Static Site Generation
export async function generateStaticParams() {
  const posts = await getPosts()

  return posts.map((post) => ({
    id: post.id.toString(),
  }))
}
```

## Error Handling Architecture

### Error Boundaries

```typescript
// app/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```

### API Error Handling

```typescript
// lib/api-error.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    // Handle API errors
    console.error(`API Error ${error.status}: ${error.message}`)
  } else {
    // Handle unexpected errors
    console.error('Unexpected error:', error)
  }
}
```

## Deployment Architecture

### Vercel Configuration

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
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
```

### Environment Management

```typescript
// lib/config.ts
export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  },
  environment: process.env.NODE_ENV,
  isProduction: process.env.NODE_ENV === 'production',
}
```

This architecture provides a solid foundation for the Next.js migration, ensuring scalability, performance, and maintainability while leveraging modern React patterns and Next.js capabilities.
