# Auth + RLS Baseline - Clerk Authentication and Supabase RLS

- Implementation of Phase 2 — Auth + RLS Baseline from high-level-plan.md
- Clerk authentication integration with Supabase Row Level Security
- Session management, access control, and secure database policies
- Prerequisites: 001-reboot-foundation, 003-hollywood-migration completed

## Goals

- **Clerk Authentication Integration**: Comprehensive user management with email/password, OAuth providers, and JWT token handling
- **Supabase RLS Policies & Enforcement**: Database-level security with claims mapping, policy validation, and data isolation
- **Session Management & Token Handling**: Secure session persistence, automatic token refresh, and concurrent session control
- **Access Control & Permission System**: Role-based access control with granular permissions and inheritance rules
- **Role Management & User Roles**: Hierarchical role system with assignment, expiration, and audit trails
- **Security Hardening & Vulnerability Scanning**: CSP, rate limiting, penetration testing, and automated security monitoring
- **Auth Testing & Validation**: Comprehensive E2E testing, RLS policy validation, and security testing automation
- **Auth Analytics & Monitoring**: Real-time auth metrics, performance tracking, and security event logging
- **Auth Performance Optimization**: Sub-second response times, caching strategies, and database query optimization
- **Auth Accessibility & Compliance**: WCAG 2.1 AA compliance, GDPR compliance, and international accessibility standards
- Port Hollywood auth system patterns and middleware implementation
- Vertical slice: "Profile" table read/write behind RLS policies

## Non-Goals (out of scope)

- Custom authentication UI components (use Clerk's built-in components)
- Complex role-based access control (RBAC) hierarchies beyond basic user/admin
- Enterprise single sign-on (SSO) integrations
- Multi-factor authentication (MFA) beyond Clerk's built-in options
- Real-time session synchronization across multiple devices

## Review & Acceptance

- [ ] Clerk authentication integration with Next.js App Router
- [ ] Supabase RLS policies implemented and tested for all tables
- [ ] Session management with secure token handling and refresh
- [ ] Access control system with role-based permissions
- [ ] Security hardening with vulnerability scanning completed
- [ ] Performance optimization for authentication operations
- [ ] Comprehensive testing including E2E authentication flows (17 tasks: T2000-T2016)
- [ ] Audit logging and security monitoring operational

## Dependencies

### Core Dependencies

- **001-reboot-foundation**: Monorepo structure, TypeScript configuration, CI/CD foundation
- **003-hollywood-migration**: Core packages migration, shared services, and UI components
- **002-nextjs-migration**: Next.js App Router setup and SSR/RSC foundation

### Supporting Dependencies

- **006-document-vault**: Storage security patterns and encryption integration
- **025-family-collaboration**: Guardian access control patterns
- **020-emergency-access**: Emergency access authentication flows
- **004-integration-testing**: Testing infrastructure for auth validation

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
- All RLS policies MUST use app.current_external_id() as the identity source for Clerk users. Avoid auth.uid() in policies when using Clerk, as it may not map to Clerk external IDs reliably.
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

- Authentication service outages → Implement fallback mechanisms and error recovery
- RLS policy bypass → Comprehensive policy testing and security audits
- Session hijacking → Secure session management and token validation
- Performance degradation → Optimize authentication operations and caching
- Integration complexity → Thorough testing of Clerk and Supabase compatibility
- Security vulnerabilities → Regular security audits and vulnerability scanning

## Hollywood Auth System Integration

**Key Components to Port:**

- Clerk provider configuration and middleware patterns
- Authentication state management and session handling
- User profile management with RLS policies
- Security hardening measures and audit logging
- Error handling and user feedback patterns

**Migration Assets:**

- Authentication middleware and route protection
- Session management utilities and helpers
- User profile CRUD operations with security
- Audit logging and security event tracking
- Error handling and recovery flows

## References

- Hollywood auth implementation (`/Users/luborfedak/Documents/Github/hollywood`)
- Clerk documentation and authentication patterns
- Supabase RLS documentation and security best practices
- Next.js authentication integration guides
- JWT security standards and token management
- Phase 2 requirements from high-level-plan.md

## Cross-links

- See ORDER.md for canonical mapping
- See 001-reboot-foundation/spec.md for monorepo foundation and governance
- See 003-hollywood-migration/spec.md for core packages and shared services
- See 031-sofia-ai-system/spec.md for AI-powered user guidance integration
- See 006-document-vault/spec.md for encrypted storage and key management
- See 023-will-creation-system/spec.md for legal document access control
- See 025-family-collaboration/spec.md for guardian network and permissions
- See 026-professional-network/spec.md for professional user authentication
- See 020-emergency-access/spec.md for crisis response and access protocols
- See 029-mobile-app/spec.md for cross-platform authentication
- See 013-animations-microinteractions/spec.md for authentication UI feedback
- See 022-time-capsule-legacy/spec.md for legacy content access security
- See 028-pricing-conversion/spec.md for subscription-based access control
- See 027-business-journeys/spec.md for user journey authentication flows
- See 004-integration-testing/spec.md for comprehensive auth testing
- See 010-production-deployment/spec.md for production security and monitoring
- See 011-monitoring-analytics/spec.md for authentication analytics and insights
- See 002-nextjs-migration/spec.md for Next.js App Router auth integration

## Linked design docs

- See `research.md` for technical analysis
- See `data-model.md` for data structures
- See `quickstart.md` for testing scenarios
