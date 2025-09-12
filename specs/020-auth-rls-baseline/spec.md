# Schwalbe: Auth + RLS Baseline (Clerk + Supabase)

- Implementation of Phase 2 — Auth + RLS Baseline from high-level-plan.md
- Clerk authentication integration with Supabase Row Level Security
- Session management, access control, and secure database policies
- Prerequisites: 001-reboot-foundation, 002-hollywood-migration completed

## Goals

### Core Authentication Implementation

- **Clerk Provider Integration**: Complete Clerk authentication setup in apps/web-next with provider, middleware, and session helpers
- **Supabase RLS Policies**: Port and implement Clerk-friendly RLS policies for all database tables and storage buckets
- **Session Management**: Implement secure session handling with JWT token management and automatic refresh
- **Access Control**: Establish role-based access control with proper permission inheritance and security boundaries

### Database Security Foundation

- **RLS Policy Implementation**: Create comprehensive Row Level Security policies ensuring users can only access their own data
- **Storage Security**: Implement secure file storage policies with user-based access control and encryption
- **Claims Mapping**: Verify proper JWT claims mapping between Clerk and Supabase auth.uid()
- **Audit Logging**: Establish comprehensive audit trails for authentication and access events

### Vertical Slice Implementation

- **Profile Table CRUD**: Implement complete Profile table with read/write operations behind RLS
- **Authentication Flow**: Build sign-in/sign-up/sign-out flows with proper error handling
- **Session Persistence**: Ensure sessions persist across browser refreshes and tabs
- **Security Testing**: Implement automated security validation and penetration testing

### Integration Requirements

- **Middleware Integration**: Configure Clerk middleware for route protection and session validation
- **Server Helpers**: Implement server-side session helpers for API routes and server components
- **Error Handling**: Comprehensive error handling for authentication failures and network issues
- **Performance Optimization**: Ensure authentication operations are performant and don't impact user experience

## Non-Goals (out of scope)

- Advanced authentication features (MFA, social logins beyond Google)
- Custom authentication UI (using Clerk's pre-built components)
- Third-party identity providers beyond Google OAuth
- Complex role hierarchies (basic user/admin roles only)
- Real-time session synchronization across devices
- Legacy authentication system migration (fresh Clerk implementation)

## Review & Acceptance

### Phase 2 Quality Gates (from high-level-plan.md)

- [ ] **Web Integration**: Clerk provider + middleware; server helpers for session working
- [ ] **Database Security**: Clerk-friendly RLS and storage policies implemented; claims mapping verified
- [ ] **Vertical Slice**: Profile table read/write behind RLS functional
- [ ] **Quality Assurance**: Local + preview auth works; RLS test suite green

### Technical Implementation Acceptance

- [ ] **Clerk Setup**: Complete Clerk application configuration with proper keys and settings
- [ ] **Provider Integration**: ClerkProvider properly configured in Next.js App Router
- [ ] **Middleware**: Route protection middleware implemented and tested
- [ ] **Session Management**: Secure session handling with automatic token refresh
- [ ] **RLS Policies**: All database tables have proper RLS policies implemented
- [ ] **Storage Policies**: Supabase Storage buckets secured with user-based policies
- [ ] **Profile CRUD**: Complete Profile table operations with proper security
- [ ] **Error Handling**: Comprehensive error handling for auth failures
- [ ] **Testing**: Automated test suite covering auth flows and RLS policies
- [ ] **Security Audit**: Security review completed with no critical vulnerabilities
- [ ] **Performance**: Authentication operations meet performance benchmarks
- [ ] **Documentation**: Complete API documentation and integration guides

### Integration Acceptance

- [ ] **Next.js Compatibility**: Full compatibility with Next.js 14+ App Router
- [ ] **Supabase Integration**: Seamless integration with existing Supabase setup
- [ ] **Type Safety**: Complete TypeScript integration with proper type definitions
- [ ] **Environment Config**: Proper environment variable validation and security
- [ ] **CI/CD Integration**: Automated testing and deployment validation
- [ ] **Monitoring**: Authentication events properly logged and monitored

## Dependencies

### Core Dependencies

- **001-reboot-foundation**: Monorepo structure, TypeScript configuration, CI/CD foundation
- **002-hollywood-migration**: Core packages migration, shared services, and UI components
- **019-nextjs-migration**: Next.js App Router setup and SSR/RSC foundation

### Supporting Dependencies

- **006-document-vault**: Storage security patterns and encryption integration
- **008-family-collaboration**: Guardian access control patterns
- **010-emergency-access**: Emergency access authentication flows
- **016-integration-testing**: Testing infrastructure for auth validation

## High-level Architecture

### Authentication Flow

```text
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Request  │───▶│  Clerk Middleware│───▶│  Protected Route │
│                 │    │                 │    │                 │
│ • Sign In/Up    │    │ • JWT Validation │    │ • Session Check  │
│ • API Access    │    │ • Route Guards   │    │ • User Context   │
│ • File Upload   │    │ • Redirect Logic │    │ • Permissions    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Supabase Client │───▶│   RLS Policies  │───▶│  Database Access │
│                 │    │                 │    │                 │
│ • JWT Injection │    │ • User Filtering │    │ • Secure Queries │
│ • Auto Refresh  │    │ • Table Policies │    │ • Audit Logging │
│ • Error Handling│    │ • Storage Access │    │ • Performance    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Components

1. **Clerk Provider**: Root-level authentication provider with session management
2. **Auth Middleware**: Route protection and session validation middleware
3. **Supabase Client**: Authenticated database client with JWT token injection
4. **RLS Policies**: Database-level security policies for data access control
5. **Storage Policies**: File storage security with user-based access control
6. **Profile Management**: User profile CRUD operations with security validation

### Security Architecture

- **JWT Token Flow**: Clerk JWT tokens automatically injected into Supabase requests
- **Row Level Security**: PostgreSQL RLS policies ensure data isolation
- **Storage Security**: User-scoped file access with encryption
- **Session Security**: Secure session management with automatic refresh
- **Audit Logging**: Comprehensive logging of authentication and access events

## Success Metrics

### User Experience Metrics

- **Authentication Success Rate**: >98% successful authentication attempts
- **Session Persistence**: >95% sessions maintained across browser refreshes
- **Error Recovery**: <2% users require support for auth issues
- **Performance**: <1 second authentication response time

### Technical Metrics

- **Security Incidents**: Zero authentication-related security breaches
- **RLS Policy Coverage**: 100% database tables protected by RLS
- **Test Coverage**: >90% authentication and security code coverage
- **Performance**: <100ms average authentication operation time

### Business Metrics

- **User Retention**: >85% monthly active users with secure authentication
- **Trust Score**: >4.5/5 user trust rating for data security
- **Compliance**: 100% audit compliance for authentication systems

## Risks & Mitigations

### Authentication Reliability

- **Clerk Service Outages**: Implement fallback authentication mechanisms and clear user communication
- **Token Expiration Issues**: Automatic token refresh with proper error handling and user re-authentication
- **Network Connectivity**: Offline authentication support and graceful degradation

### Security Vulnerabilities

- **JWT Token Exposure**: Secure token storage, HTTPS enforcement, and proper CORS configuration
- **RLS Policy Bypass**: Comprehensive policy testing, security audits, and access control validation
- **Session Hijacking**: Secure session management, proper logout handling, and device tracking

### Performance Impact

- **Authentication Overhead**: Optimize token validation, caching strategies, and database query performance
- **Session Management Load**: Efficient session storage and cleanup mechanisms
- **Middleware Performance**: Lightweight middleware implementation with minimal latency

### Integration Complexity

- **Next.js Compatibility**: Thorough testing of App Router integration and server component compatibility
- **Supabase Integration**: Proper JWT token injection and RLS policy synchronization
- **Type Safety**: Complete TypeScript integration with proper type definitions and validation

## References

- **High-level Plan**: `../../docs/high-level-plan.md` (Phase 2 — Auth + RLS Baseline)
- **Hollywood Auth Implementation**: `/Users/luborfedak/Documents/Github/hollywood` (Clerk + RLS patterns)
- **Clerk Documentation**: Official Clerk authentication and session management docs
- **Supabase RLS**: Row Level Security documentation and best practices
- **Next.js Auth**: Next.js authentication patterns and middleware implementation
- **JWT Security**: JSON Web Token security best practices and implementation
- **OAuth 2.0**: OAuth 2.0 specification and security considerations

## Cross-links

- See `../001-reboot-foundation/spec.md` for monorepo architecture and build system
- See `../002-hollywood-migration/spec.md` for core package migration and shared services
- See `../019-nextjs-migration/spec.md` for Next.js App Router setup and SSR foundation
- See `../006-document-vault/spec.md` for storage security patterns and integration
- See `../008-family-collaboration/spec.md` for guardian access control integration
- See `../010-emergency-access/spec.md` for emergency authentication flows
- See `../016-integration-testing/spec.md` for testing infrastructure and validation

## Linked design docs

- See `research.md` for technical architecture analysis and Hollywood implementation review
- See `data-model.md` for database schema, API contracts, and type definitions
- See `plan.md` for detailed implementation phases and quality gates
- See `tasks.md` for ordered development checklist and acceptance criteria
- See `quickstart.md` for authentication setup and testing guide
- See `contracts/` for interface definitions and type contracts