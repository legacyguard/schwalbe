# Next.js Migration - Research Analysis

## Product scope: Next.js migration system

### Migration Objectives

- Complete transition from Vite-based React application to Next.js 14+ framework
- Implement modern React patterns with App Router architecture
- Enable Server-Side Rendering (SSR) and React Server Components (RSC)
- Deploy Supabase Edge Functions for global performance
- Maintain all existing functionality while improving performance

### Scope Boundaries

- Focus on `apps/web-next` as the primary application
- Freeze `apps/web` (Vite) for reference only
- Include only security/hygiene updates for frozen Vite app
- Exclude mobile application development
- Exclude custom server implementations

### Success Criteria

- Migration completion with all features functional
- Performance improvement over Vite baseline
- Vercel integration complete and operational
- All existing functionality preserved
- TypeScript strict mode compliance achieved

## Goals

- Research and evaluate Next.js 14+ App Router architecture for migration from Vite
- Analyze Hollywood codebase for existing Next.js implementations and patterns
- Identify App Router and SSR/RSC dependencies across specifications 001-018
- Evaluate performance optimization opportunities with Vercel integration
- Assess migration complexity and identify reusable components from Hollywood

## Technical architecture: Next.js framework, App Router

### App Router Architecture Deep Dive

#### File-Based Routing System

```typescript
// app/dashboard/layout.tsx - Nested layout with shared UI
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <main>{children}</main>
    </div>
  )
}

// app/dashboard/analytics/page.tsx - Page component
export default function AnalyticsPage() {
  return <AnalyticsDashboard />
}

// app/dashboard/settings/[tab]/page.tsx - Dynamic route
export default function SettingsTabPage({
  params,
}: {
  params: { tab: string }
}) {
  return <SettingsTab tab={params.tab} />
}
```

#### Route Groups and Organization

```typescript
// app/(auth)/login/page.tsx - Route group for auth pages
// app/(auth)/register/page.tsx
// app/(dashboard)/analytics/page.tsx - Route group for dashboard
// app/(dashboard)/settings/page.tsx

// app/(marketing)/page.tsx - Route group for marketing pages
// app/(marketing)/pricing/page.tsx
```

#### Parallel Routes for Complex Layouts

```typescript
// app/dashboard/@sidebar/page.tsx - Parallel route for sidebar
// app/dashboard/@content/page.tsx - Parallel route for main content
// app/dashboard/layout.tsx - Combines parallel routes
```

### Server Components and Data Fetching Patterns

#### Server Component Implementation

```typescript
// Server component - runs on server, no client bundle
async function UserProfile({ userId }: { userId: string }) {
  // Direct database access
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { posts: true }
  })

  return (
    <div>
      <UserHeader user={user} />
      <PostList posts={user.posts} />
    </div>
  )
}

// Client component - interactive functionality
'use client'
function UserHeader({ user }: { user: User }) {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div>
      {isEditing ? (
        <UserEditForm user={user} onSave={() => setIsEditing(false)} />
      ) : (
        <UserDisplay user={user} onEdit={() => setIsEditing(true)} />
      )}
    </div>
  )
}
```

#### Data Fetching Strategies

**Server-Side Data Fetching:**

```typescript
// app/users/[id]/page.tsx
async function UserPage({ params }: { params: { id: string } }) {
  const user = await fetchUser(params.id)

  if (!user) {
    notFound()
  }

  return <UserProfile user={user} />
}
```

**Incremental Static Regeneration (ISR):**

```typescript
// app/blog/[slug]/page.tsx
export const revalidate = 3600 // Revalidate every hour

async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await fetchBlogPost(params.slug)

  return <BlogPostContent post={post} />
}
```

**Streaming and Suspense:**

```typescript
// app/dashboard/page.tsx
async function DashboardPage() {
  return (
    <div>
      <Suspense fallback={<StatsSkeleton />}>
        <StatsCards />
      </Suspense>
      <Suspense fallback={<ChartSkeleton />}>
        <AnalyticsChart />
      </Suspense>
    </div>
  )
}
```

### Middleware and API Routes Implementation

#### Next.js Middleware

```typescript
// middleware.ts
// Middleware example updated to use NextResponse; see spec for Supabase Auth patterns
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default authMiddleware({
  publicRoutes: ['/', '/api/webhooks'],
  beforeAuth: (req) => {
    // Custom middleware logic
    const res = NextResponse.next()

    // Add security headers
    res.headers.set('X-Frame-Options', 'DENY')
    res.headers.set('X-Content-Type-Options', 'nosniff')

    return res
  },
  afterAuth: (auth, req) => {
    // Post-authentication logic
    if (!auth.userId && !auth.isPublicRoute) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }
  }
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)']
}
```

#### API Routes Implementation

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

### Performance Optimization Strategies

#### Image Optimization

```typescript
// Automatic optimization with Next.js Image component
import Image from 'next/image'

export default function OptimizedImage() {
  return (
    <Image
      src="/hero-image.jpg"
      alt="Hero image"
      width={1200}
      height={600}
      priority // Above the fold
      placeholder="blur" // Blur placeholder
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  )
}
```

#### Bundle Analysis and Code Splitting

```typescript
// Dynamic imports for code splitting
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('../components/HeavyComponent'), {
  loading: () => <div>Loading...</div>,
  ssr: false // Client-side only
})

// Route-based code splitting
const AdminPanel = dynamic(() => import('../components/AdminPanel'), {
  loading: () => <div>Loading admin panel...</div>
})
```

#### Caching Strategies

```typescript
// Static generation with revalidation
export const revalidate = 3600 // 1 hour

// Cache control headers
export async function generateMetadata({ params }: Props) {
  return {
    title: 'Page Title',
    other: {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    }
  }
}
```

### Next.js Best Practices Implementation

#### Error Boundaries

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

#### Loading States

```typescript
// app/loading.tsx
export default function Loading() {
  return (
    <div className="loading-container">
      <div className="spinner" />
      <p>Loading...</p>
    </div>
  )
}
```

#### SEO and Metadata

```typescript
// app/blog/[slug]/page.tsx
import type { Metadata, ResolvingMetadata } from 'next'

type Props = {
  params: { slug: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const post = await fetchBlogPost(params.slug)

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  }
}
```

### Migration Strategy and Component Patterns

#### Component Migration Strategy

```typescript
// Before: Vite component
function UserCard({ user }) {
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    fetchUser(user.id).then(setUserData).finally(() => setIsLoading(false))
  }, [user.id])

  if (isLoading) return <div>Loading...</div>
  return <div>{userData.name}</div>
}

// After: Next.js server component
async function UserCard({ userId }: { userId: string }) {
  const userData = await fetchUser(userId)

  return <div>{userData.name}</div>
}

// After: Next.js client component (when interactivity needed)
'use client'
function UserCard({ user }: { user: User }) {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div>
      {user.name}
      <button onClick={() => setIsEditing(true)}>Edit</button>
      {isEditing && <EditForm user={user} onClose={() => setIsEditing(false)} />}
    </div>
  )
}
```

#### Data Fetching Migration Patterns

```typescript
// Pattern 1: Server Component with Direct Database Access
async function Dashboard() {
  const stats = await db.stats.findMany()
  return <StatsDisplay stats={stats} />
}

// Pattern 2: Client Component with API Routes
'use client'
function UserForm() {
  const handleSubmit = async (data: FormData) => {
    const response = await fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(data)
    })
    // Handle response
  }
  return <form onSubmit={handleSubmit}>...</form>
}

// Pattern 3: SWR for Client-Side Data Fetching
import useSWR from 'swr'

function UserProfile({ userId }: { userId: string }) {
  const { data, error } = useSWR(`/api/users/${userId}`, fetcher)

  if (error) return <div>Failed to load</div>
  if (!data) return <div>Loading...</div>

  return <div>{data.name}</div>
}
```

### App Router Architecture

```typescript
// File-based routing structure
app/
├── layout.tsx              // Root layout with providers
├── page.tsx               // Home page (server component)
├── globals.css            // Global styles
├── loading.tsx            // Loading UI
├── error.tsx              // Error boundaries
├── dashboard/
│   ├── layout.tsx         // Nested layout
│   ├── page.tsx           // Dashboard page
│   └── settings/
│       └── page.tsx       // Settings page
└── api/
    └── users/
        └── route.ts       // API routes
```

### Server Components Implementation

```typescript
// Server Component (no client bundle)
async function UserProfile({ userId }: { userId: string }) {
  const user = await db.user.findUnique({ where: { id: userId } })

  return (
    <div>
      <h1>{user.name}</h1>
      <ClientComponent user={user} />
    </div>
  )
}

// Client Component (interactive)
'use client'
function ClientComponent({ user }: { user: User }) {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

### SSR/RSC Dependencies and Integration

**App Router Dependencies:**

- **001-reboot-foundation**: Core infrastructure and TypeScript setup
- **002-hollywood-migration**: Migration patterns and Hollywood codebase analysis
- **005-sofia-ai-system**: AI integration and context-aware guidance
- **006-document-vault**: Secure document handling with SSR compatibility
- **007-will-creation-system**: Legal document generation with server components
- **008-family-collaboration**: Family collaboration features with real-time updates
- **016-integration-testing**: Testing infrastructure for SSR functionality
- **017-production-deployment**: Deployment requirements for Next.js applications

**SSR/RSC Integration Points:**

- **Supabase Edge Functions**: Serverless functions for data fetching
- **Supabase Auth**: Server-side session management
- **Stripe Integration**: Server-side payment processing
- **Resend Email**: Server-side email delivery
- **Database Queries**: Server-side data fetching with RLS

### Edge Runtime Integration

```typescript
// Supabase Edge Function
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

### Hollywood Next.js System Analysis

**Existing Next.js Patterns in Hollywood:**

- **App Router Structure**: File-based routing with nested layouts
- **Server Components**: Data fetching patterns and SSR implementation
- **Edge Functions**: Supabase edge functions for serverless operations
- **Middleware**: Request interception for authentication and redirects
- **API Routes**: RESTful endpoints for client-server communication

**Migration Opportunities:**

- **Reusable Components**: Form components, layout components, UI primitives
- **Business Logic**: Validation logic, data transformation utilities
- **Styling System**: Design tokens, component variants from Hollywood
- **API Patterns**: Request/response handling, error management
- **Authentication Flow**: Supabase Auth integration patterns and middleware

**Hollywood System Dependencies:**

- **Supabase Integration**: Database queries, real-time subscriptions, storage
- **Supabase Auth**: User management, session handling, middleware
- **Stripe Billing**: Payment processing, webhook handling, subscription management
- **Resend Email**: Email templates, delivery tracking, bounce handling
- **Edge Functions**: Serverless operations, background processing, scheduled tasks

## Linked docs

- See `spec.md` for complete specification overview and goals
- See `plan.md` for detailed implementation phases and timeline
- See `data-model.md` for data structures and application state
- See `quickstart.md` for setup instructions and test scenarios

## User experience: migration user experience

### Performance Improvements

- **Faster Initial Load**: SSR reduces time-to-first-contentful-paint
- **Progressive Loading**: Streaming SSR improves perceived performance
- **Optimized Images**: Automatic WebP conversion and responsive loading
- **Reduced Bundle Size**: Code splitting and tree shaking

### Developer Experience

- **Hot Reload**: Fast refresh for instant development feedback
- **Type Safety**: Full TypeScript integration with strict mode
- **Better Tooling**: Enhanced VS Code support and debugging
- **Modern Patterns**: Server components and App Router conventions

### Migration Impact

- **Seamless Transition**: Maintain existing user workflows
- **Enhanced Performance**: Improved loading times and responsiveness
- **Better Reliability**: Server-side rendering reduces client-side errors
- **Future-Proof**: Modern React patterns for long-term maintainability

## Performance: Next.js performance optimization

### Core Web Vitals Optimization

- **Largest Contentful Paint (LCP)**: <2.5 seconds target
- **First Input Delay (FID)**: <100ms target
- **Cumulative Layout Shift (CLS)**: <0.1 target

### Bundle Optimization

- **Initial Bundle Size**: Target <200KB JavaScript
- **Code Splitting**: Route-based and component-based splitting
- **Tree Shaking**: Automatic removal of unused code
- **Dynamic Imports**: Lazy loading for non-critical components

### Performance Caching Strategies

- **Static Generation**: Pre-render pages at build time
- **Incremental Static Regeneration**: Update pages without full rebuild
- **Client-side Caching**: Browser caching for API responses
- **CDN Caching**: Edge caching for global distribution

### Performance Monitoring

```typescript
// Web Vitals tracking
import { NextWebVitalsMetric } from 'next/app'

export function reportWebVitals(metric: NextWebVitalsMetric) {
  // Send to analytics service
  console.log(metric)
}
```

## Security: Next.js security measures

### Built-in Security Features

- **Content Security Policy (CSP)**: Automatic CSP header generation
- **Security Headers**: XSS protection and secure headers
- **CSRF Protection**: Built-in CSRF tokens for forms
- **Secure Cookies**: HttpOnly and secure cookie configuration

### Authentication Security

```typescript
// Middleware for route protection
// Middleware example updated to use NextResponse; see spec for Supabase Auth patterns

export default authMiddleware({
  publicRoutes: ['/'],
  ignoredRoutes: ['/api/webhooks']
})
```

### Data Protection

- **Row Level Security (RLS)**: Database-level access control
- **API Route Protection**: Secure API endpoints with authentication
- **Input Validation**: Server-side validation for all inputs
- **Error Handling**: Secure error responses without data leakage

### Edge Runtime Security

- **Isolated Execution**: Functions run in isolated environments
- **Access Control**: Function-level permissions and restrictions
- **Audit Logging**: Comprehensive logging for security events
- **Rate Limiting**: Built-in rate limiting for API protection

## Accessibility: Next.js accessibility

### Semantic HTML

- **Server Components**: Generate semantic HTML on the server
- **ARIA Support**: Proper ARIA attributes and roles
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: WCAG 2.1 AA compliance

### Performance Accessibility

- **Fast Loading**: Reduced loading times benefit all users
- **Progressive Enhancement**: Core functionality works without JavaScript
- **Reduced Motion**: Respect user's motion preferences
- **High Contrast**: Support for high contrast mode

### Development Tools

- **ESLint Accessibility**: Automated accessibility linting
- **TypeScript**: Type safety for accessibility props
- **Testing**: Automated accessibility testing in CI/CD
- **Documentation**: Accessibility guidelines and best practices

## Analytics: migration analytics and insights

### Performance Analytics

- **Core Web Vitals**: Track LCP, FID, CLS metrics
- **User Experience**: Monitor user interactions and flows
- **Error Tracking**: Capture and analyze application errors
- **Conversion Tracking**: Monitor user journey completion

### Migration Analytics

- **Migration Progress**: Track component and feature migration status
- **Performance Comparison**: Compare Vite vs Next.js performance
- **User Impact**: Monitor user experience during migration
- **Error Analysis**: Track migration-related issues and resolutions

### Business Analytics

- **Usage Patterns**: Analyze how users interact with migrated features
- **Performance Impact**: Measure business impact of performance improvements
- **Conversion Rates**: Track impact on user conversion and retention
- **Cost Analysis**: Monitor infrastructure and development costs

## Future enhancements: Next.js feature updates

### Advanced App Router Features

- **Parallel Routes**: Multiple pages in the same layout
- **Intercepting Routes**: Modal routes that intercept navigation
- **Route Groups**: Organize routes without affecting URL structure
- **Loading UI**: Automatic loading states for route transitions

### Performance Enhancements

- **Partial Prerendering**: Combine static and dynamic content
- **Optimistic Updates**: Immediate UI updates with background sync
- **Background Revalidation**: Update data without user interaction
- **Advanced Caching**: Service worker integration and offline support

### Integration Opportunities

- **Next.js Commerce**: E-commerce functionality integration
- **Next.js Analytics**: Advanced analytics and A/B testing
- **Next.js CMS**: Content management system integration
- **Third-party Services**: Enhanced integration with external APIs

### Scalability Improvements

- **Edge Computing**: Deploy to more edge locations
- **Database Optimization**: Advanced query optimization and caching
- **CDN Integration**: Custom CDN configuration for specific regions
- **Microservices**: Decompose into smaller, focused services

This research provides comprehensive analysis of the Next.js migration, covering all aspects from technical architecture to user experience, performance, security, accessibility, analytics, and future enhancements.
