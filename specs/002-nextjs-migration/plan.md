# Plan: Next.js Migration Implementation

## Phase 1: Next.js Setup (Week 1)

### **1.1 Next.js Installation (`apps/web-next`)**

- Install Next.js 14+ with required dependencies
- Configure package.json scripts for development and build
- Set up basic project structure and folder organization
- Initialize TypeScript configuration with strict mode
- Configure ESLint and Prettier for code quality
- Establish commit hooks for code quality enforcement

### **1.2 App Router Configuration (`apps/web-next`)**

- Scaffold Next.js App Router app in apps/web-next (do not extend Vite app)
- Create app directory structure with file-based routing
- Set up root layout component with providers
- Configure nested layouts for different sections
- Implement basic page components and routing
- Set up development server with hot reload

### **1.3 Governance and CI Setup**

- spec-kit: keep and evolve as an internal governance system (do not delete)
- Add spec-kit generated artifacts to .gitignore (keep source in repo)
- Linear: define projects for phases; enforce PR → Linear linkage
- CI: typecheck + lint + build on PR; required status checks
- Exclude apps/web (Vite) from CI typecheck/build; keep only for reference
- Gate: main branch protected; CI passing

### **1.4 Development Environment Setup**

- Configure environment variables and configuration files
- Set up development tooling and debugging
- Implement basic error boundaries and loading states
- Configure build optimization and performance settings
- Set up version control and branching strategy

## Phase 2: Migration Planning (Week 2)

### **2.1 Migration Strategy Development**

- Analyze existing Vite application structure and components
- Identify migration scope and dependencies
- Create component mapping and compatibility analysis
- Develop phased migration approach with rollback plans
- Define success criteria and acceptance tests

### **2.2 Component Analysis and Mapping**

- Audit existing UI components for SSR compatibility
- Map React Router patterns to Next.js App Router
- Identify state management migration requirements
- Analyze data fetching patterns and API integration
- Create component migration priority matrix

### **2.3 Testing Strategy Definition**

- Define unit testing approach for Next.js components
- Set up integration testing for SSR functionality
- Configure end-to-end testing scenarios
- Implement performance testing and benchmarking
- Create testing utilities and mock data

## Phase 3: Component Migration (Week 3)

### **3.1 Core Component Migration (`apps/web-next`)**

- Migrate reusable UI components to Next.js patterns
- Convert class components to functional components
- Update component props and TypeScript interfaces
- Implement SSR-safe component patterns
- Configure component testing with SSR scenarios

### **3.2 Page and Routing Migration**

- Convert page components to App Router structure
- Update dynamic routing and parameter handling
- Implement nested layouts and route groups
- Configure route-based code splitting
- Set up navigation and link components

### **3.3 State Management Migration**

- Migrate Redux/Context state to Next.js patterns
- Implement server state management for SSR
- Configure client-side state persistence
- Set up state synchronization between server and client
- Implement error boundaries and recovery patterns

## Phase 4: SSR/RSC Implementation (Week 4)

### **4.1 Server Components Architecture**

- Implement server component data fetching patterns
- Create server-side data validation and transformation
- Set up streaming and suspense boundaries
- Configure error handling for server components
- Implement server component caching strategies

### **4.2 Client/Server Boundaries**

- Define proper client/server component boundaries
- Implement client components for interactivity
- Set up server actions for form handling
- Configure real-time data synchronization
- Implement progressive enhancement patterns

### **4.3 Data Fetching Optimization**

- Implement optimized data fetching with caching
- Configure ISR (Incremental Static Regeneration)
- Set up streaming responses for better UX
- Implement data prefetching and preloading
- Configure error handling and fallback patterns

## Phase 5: Performance Optimization (Week 5)

### **5.1 Build and Bundle Optimization**

- Configure code splitting and dynamic imports
- Implement bundle analysis and size optimization
- Set up tree shaking and dead code elimination
- Configure compression and minification
- Implement asset optimization and CDN integration

### **5.2 Image and Asset Optimization**

- Implement Next.js Image component for all images
- Configure automatic image optimization and WebP conversion
- Set up responsive image loading and lazy loading
- Implement proper alt text and accessibility
- Configure image CDN and caching strategies

### **5.3 Performance Monitoring and Caching**

- Implement Core Web Vitals monitoring
- Set up performance budgets and alerting
- Configure multiple caching layers (browser, CDN, server)
- Implement performance regression testing
- Set up performance analytics and reporting

## Goals

- Complete migration from Vite to Next.js 14+ framework with App Router architecture
- Scaffold Next.js App Router app in apps/web-next (do not extend Vite app)
- Exclude apps/web (Vite) from CI typecheck/build; keep only for reference until removal
- Establish TS config, eslint, prettier, commit hooks for development workflow
- spec-kit: keep and evolve as an internal governance system (do not delete)
- Linear: define projects for phases; enforce PR → Linear linkage
- CI: typecheck + lint + build on PR; required status checks
- Implement Next.js App Router with file-based routing and nested layouts
- Enable Server-Side Rendering and React Server Components for optimal performance
- Configure and deploy Supabase Edge Functions with proper TypeScript support
- Achieve seamless integration with Vercel deployment platform
- Gate: main branch protected; CI passing

## Acceptance Signals

- Next.js application successfully deployed to Vercel
- All existing functionality migrated with SSR compatibility
- Performance benchmarks met (Lighthouse scores >90)
- Core Web Vitals within target ranges
- TypeScript strict mode compliance achieved
- Component library fully compatible with Next.js
- Edge functions deployed and monitored
- User experience maintained or improved

## Linked docs

- `research.md`: Next.js migration research and technology evaluation
- `data-model.md`: Data structures and application state
- `quickstart.md`: Setup instructions and test scenarios
