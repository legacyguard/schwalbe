# Next.js Migration - Data Model

## Core Entities

### NextJSConfig Entity

```typescript
interface NextJSConfig {
  id: string
  appName: string
  version: string
  environment: 'development' | 'staging' | 'production'
  basePath?: string
  assetPrefix?: string
  trailingSlash: boolean
  poweredByHeader: boolean
  reactStrictMode: boolean
  swcMinify: boolean
  compiler: {
    removeConsole: boolean
    reactRemoveProperties: boolean
  }
  experimental: {
    appDir: boolean
    serverComponentsExternalPackages: string[]
  }
  images: {
    domains: string[]
    deviceSizes: number[]
    imageSizes: number[]
  }
  createdAt: Date
  updatedAt: Date
}
```

### AppRoute Entity

```typescript
interface AppRoute {
  id: string
  path: string
  filePath: string
  routeType: 'page' | 'layout' | 'loading' | 'error' | 'not-found'
  dynamicSegments: string[]
  middleware?: string
  metadata?: {
    title?: string
    description?: string
    keywords?: string[]
  }
  parentRouteId?: string
  childRoutes: string[]
  createdAt: Date
  updatedAt: Date
}
```

### ServerComponent Entity

```typescript
interface ServerComponent {
  id: string
  name: string
  filePath: string
  asyncOperations: string[]
  dataDependencies: string[]
  cacheStrategy?: 'force-cache' | 'no-store' | 'revalidate'
  revalidate?: number
  errorBoundary?: boolean
  loadingComponent?: string
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}
```

### ClientComponent Entity

```typescript
interface ClientComponent {
  id: string
  name: string
  filePath: string
  stateVariables: string[]
  eventHandlers: string[]
  sideEffects: string[]
  dependencies: string[]
  serverComponentId?: string
  createdAt: Date
  updatedAt: Date
}
```

### DataFetching Entity

```typescript
interface DataFetching {
  id: string
  operationName: string
  type: 'server-action' | 'api-route' | 'database-query' | 'external-api'
  endpoint?: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  parameters: Record<string, any>
  cacheConfig?: {
    revalidate?: number
    tags?: string[]
  }
  errorHandling: {
    retryCount: number
    fallbackData?: any
  }
  componentId: string
  createdAt: Date
  updatedAt: Date
}
```

### PerformanceMetric Entity

```typescript
interface PerformanceMetric {
  id: string
  routeId: string
  metricType: 'FCP' | 'LCP' | 'FID' | 'CLS' | 'TTFB'
  value: number
  unit: 'ms' | 'score'
  userAgent: string
  viewport: {
    width: number
    height: number
  }
  connectionType?: string
  timestamp: Date
}
```

## Entity Relationships

### NextJSConfig Relationships

```text
NextJSConfig (1) ──── (N) AppRoute
NextJSConfig (1) ──── (N) ServerComponent
NextJSConfig (1) ──── (N) ClientComponent
NextJSConfig (1) ──── (N) PerformanceMetric
```

### AppRoute Relationships

```text
AppRoute (1) ──── (N) ServerComponent
AppRoute (1) ──── (N) ClientComponent
AppRoute (1) ──── (N) DataFetching
AppRoute (1) ──── (N) PerformanceMetric
AppRoute (1) ──── (0..1) AppRoute (parent)
AppRoute (1) ──── (N) AppRoute (children)
```

### ServerComponent Relationships

```text
ServerComponent (1) ──── (N) DataFetching
ServerComponent (1) ──── (N) ClientComponent
ServerComponent (1) ──── (N) PerformanceMetric
```

### ClientComponent Relationships

```text
ClientComponent (1) ──── (N) DataFetching
ClientComponent (1) ──── (0..1) ServerComponent
```

### DataFetching Relationships

```text
DataFetching (1) ──── (1) ServerComponent | ClientComponent
```

### PerformanceMetric Relationships

```text
PerformanceMetric (1) ──── (1) AppRoute
PerformanceMetric (1) ──── (1) ServerComponent
```

## Data Flow Patterns

### Server-Side Data Flow

```typescript
// Server component data fetching pattern
interface ServerDataFlow {
  route: AppRoute
  serverComponent: ServerComponent
  dataFetching: DataFetching[]
  cacheStrategy: CacheStrategy
  errorHandling: ErrorHandling
}
```

### Client-Side Data Flow

```typescript
// Client component state management pattern
interface ClientDataFlow {
  clientComponent: ClientComponent
  stateVariables: StateVariable[]
  eventHandlers: EventHandler[]
  dataFetching: DataFetching[]
  sideEffects: SideEffect[]
}
```

### Hybrid Data Flow

```typescript
// Server + Client component interaction pattern
interface HybridDataFlow {
  serverComponent: ServerComponent
  clientComponent: ClientComponent
  serverToClientProps: Record<string, any>
  clientToServerActions: ServerAction[]
  sharedState: SharedState
}
```

## Configuration Management

### Environment Configuration

```typescript
interface EnvironmentConfig {
  nextjs: NextJSConfig
  supabase: {
    url: string
    anonKey: string
    serviceRoleKey: string
  }
  clerk: {
    publishableKey: string
    secretKey: string
  }
  vercel: {
    projectId: string
    teamId?: string
  }
}
```

### Build Configuration

```typescript
interface BuildConfig {
  nextjs: NextJSConfig
  typescript: {
    strict: boolean
    skipLibCheck: boolean
  }
  eslint: {
    extends: string[]
    rules: Record<string, any>
  }
  tailwind: {
    content: string[]
    theme: Record<string, any>
  }
}
```

## Migration Tracking

### Component Migration Status

```typescript
interface ComponentMigration {
  id: string
  componentName: string
  originalPath: string
  newPath: string
  migrationStatus: 'pending' | 'in-progress' | 'completed' | 'failed'
  migrationType: 'server' | 'client' | 'hybrid'
  dependencies: string[]
  issues: MigrationIssue[]
  createdAt: Date
  completedAt?: Date
}
```

### Route Migration Status

```typescript
interface RouteMigration {
  id: string
  originalRoute: string
  newRoute: string
  migrationStatus: 'pending' | 'in-progress' | 'completed' | 'failed'
  components: ComponentMigration[]
  dataFetching: DataFetching[]
  issues: MigrationIssue[]
  createdAt: Date
  completedAt?: Date
}
```

## Performance Monitoring

### Route Performance Metrics

```typescript
interface RoutePerformance {
  routeId: string
  averageLoadTime: number
  averageTTFB: number
  cacheHitRate: number
  errorRate: number
  coreWebVitals: {
    fcp: number
    lcp: number
    fid: number
    cls: number
  }
  timestamp: Date
}
```

### Component Performance Metrics

```typescript
interface ComponentPerformance {
  componentId: string
  renderTime: number
  reRenderCount: number
  memoryUsage: number
  bundleSize: number
  timestamp: Date
}
```

This data model provides a structured approach to managing the Next.js migration with clear entity relationships and data flow patterns.
