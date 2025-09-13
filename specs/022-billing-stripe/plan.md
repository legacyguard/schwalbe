# Implementation Plan: Billing (Stripe Integration)

## Executive Summary

This plan outlines the phased implementation of Stripe billing integration for Schwalbe, replacing Hollywood's existing billing system with a secure, scalable, and maintainable solution. The implementation follows the high-level roadmap's Phase 4 requirements while ensuring compatibility with all dependent systems.

## Phase 4 Context

**Phase 4: Billing (Stripe)** from high-level-plan.md requires:

- Port edge functions: create-checkout-session, stripe-webhook
- Implement subscription state machine in shared services
- Gate: e2e checkout flow (test mode) + webhook handling + DB state transitions

**Timeline**: 2 weeks (aligned with high-level-plan.md Week 1-2 execution)

## Implementation Strategy

### Architecture Approach

- **Monorepo Integration**: Leverage existing packages/shared for Stripe services
- **Edge Functions**: Deploy to Supabase Edge Functions with TypeScript
- **Database**: Extend existing RLS policies and migration framework
- **Security First**: Implement webhook validation, secret management, and audit logging
- **Testing**: Comprehensive test coverage with e2e validation

### Key Principles

- **Zero Downtime**: Gradual rollout with fallback mechanisms
- **Security by Design**: PCI compliance and data protection
- **Observability**: Complete logging and monitoring integration
- **Scalability**: Handle high-volume billing operations
- **Maintainability**: Clean code with comprehensive documentation

## Detailed Implementation Plan

### Week 1: Core Infrastructure

#### Day 1-2: Environment Setup & Dependencies

**Tasks:**

- Configure Stripe test environment and API keys
- Set up webhook endpoints in Stripe Dashboard
- Update environment variables schema (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET)
- Install Stripe SDK dependencies in packages/shared
- Create Stripe configuration module with environment validation

**Deliverables:**

- Environment configuration documented
- Stripe SDK properly configured
- Webhook endpoints configured in Stripe

#### Day 3-4: Database Migration

**Tasks:**

- Port 20240101000000_create_subscription_tables.sql migration
- Update RLS policies for Clerk compatibility
- Create database types in packages/shared/types
- Implement migration validation scripts
- Set up subscription limits for all plans

**Deliverables:**

- Migration scripts ready for deployment
- Database schema documented
- RLS policies tested with Clerk

#### Day 5: Edge Functions - create-checkout-session

**Tasks:**

- Port create-checkout-session function from Hollywood
- Implement customer creation/management
- Add subscription metadata handling
- Implement error handling and logging
- Add TypeScript types and validation

**Deliverables:**

- Functional create-checkout-session edge function
- Customer management logic implemented
- Error handling and logging in place

### Week 2: Webhook Handling & State Machine

#### Day 6-7: Edge Functions - stripe-webhook

**Tasks:**

- Port stripe-webhook function from Hollywood
- Implement webhook signature validation
- Handle all subscription lifecycle events
- Implement database state transitions
- Add comprehensive error handling and logging

**Deliverables:**

- Complete webhook processing system
- All Stripe events handled
- Database state machine functional

#### Day 8-9: Subscription Service Implementation

**Tasks:**

- Implement subscription.service.ts in packages/shared
- Port usage tracking and limits checking
- Implement subscription state machine logic
- Add feature access control
- Create comprehensive TypeScript interfaces

**Deliverables:**

- Full subscription service implementation
- Usage tracking system
- Feature access control working

#### Day 10: Integration & Testing

**Tasks:**

- Integrate billing components with existing auth system
- Implement end-to-end checkout flow
- Test webhook processing with Stripe CLI
- Validate database state transitions
- Performance testing and optimization

**Deliverables:**

- Complete integration tested
- E2E checkout flow working
- Webhook processing validated

## Technical Implementation Details

### Edge Functions Architecture

#### create-checkout-session

```typescript
// Port from Hollywood with enhancements
- Customer creation/management
- Subscription metadata handling
- Error handling and logging
- TypeScript strict typing
- Environment-based configuration
```

#### stripe-webhook

```typescript
// Enhanced webhook processing
- HMAC signature validation
- Event deduplication
- Comprehensive event handling
- Database transaction management
- Error recovery mechanisms
```

### Subscription State Machine

#### States

- **free**: Default state for new users
- **active**: Successful payment, full access
- **past_due**: Payment failed, limited access
- **cancelled**: Subscription ended, access revoked
- **trialing**: Trial period active

#### Transitions

- free → active: Successful checkout completion
- active → past_due: Payment failure
- past_due → active: Payment recovery
- active → cancelled: User cancellation or payment failure
- Any state → free: Subscription expiration

### Database Schema

#### Core Tables

- **user_subscriptions**: Subscription data with Stripe IDs
- **user_usage**: Usage tracking for limits
- **subscription_limits**: Plan definitions and features

#### RLS Policies

- Users can only access their own subscription data
- Service role can manage all subscriptions
- Public read access to subscription limits

### Security Implementation

#### Webhook Security

- HMAC-SHA256 signature validation
- Timestamp validation (prevent replay attacks)
- Event deduplication using Stripe event IDs
- Secure error responses (no sensitive data leakage)

#### Data Protection

- No sensitive payment data stored locally
- All billing data encrypted at rest
- RLS policies enforced on all tables
- Audit logging for all billing operations

## Dependencies & Prerequisites

### Required Before Implementation

- ✅ Phase 1: Vercel + Supabase + Clerk infrastructure
- ✅ Phase 2: Auth + RLS baseline
- ✅ Phase 3: Database schema and types
- ✅ Hollywood billing functions identified and analyzed

### Integration Points

- **Auth System**: Clerk user management integration
- **Database**: Supabase RLS and migration system
- **Monitoring**: Error logging and alerting setup
- **Email**: Resend integration for billing notifications

## Risk Assessment & Mitigation

### High Risk Items

1. **Webhook Security**: Mitigated by HMAC validation and replay protection
2. **Data Consistency**: Mitigated by database transactions and error recovery
3. **Stripe API Changes**: Mitigated by version pinning and comprehensive testing
4. **Migration Complexity**: Mitigated by gradual rollout and rollback procedures

### Contingency Plans

- **Stripe Outage**: Implement retry logic and manual processing
- **Data Corruption**: Database backups and recovery procedures
- **Security Breach**: Immediate webhook secret rotation and audit review
- **Performance Issues**: Load testing and horizontal scaling

## Testing Strategy

### Unit Testing

- Edge function logic testing
- Subscription service method testing
- Database operation testing
- Error handling validation

### Integration Testing

- Webhook event processing
- Database state transitions
- Auth integration testing
- Email notification testing

### End-to-End Testing

- Complete checkout flow
- Subscription lifecycle testing
- Error scenario testing
- Performance testing

### Security Testing

- Webhook signature validation
- SQL injection prevention
- Access control validation
- Data encryption verification

## Deployment Strategy

### Environment Setup

1. **Development**: Stripe test mode, local Supabase
2. **Staging**: Stripe test mode, staging Supabase
3. **Production**: Stripe live mode, production Supabase

### Rollout Plan

1. **Phase 1**: Deploy to staging, test with Stripe CLI
2. **Phase 2**: Enable for beta users, monitor closely
3. **Phase 3**: Gradual rollout to all users
4. **Phase 4**: Full production deployment

### Monitoring & Alerting

- Stripe webhook delivery monitoring
- Database performance monitoring
- Error rate alerting
- Usage pattern analysis

## Success Criteria

### Functional Requirements

- ✅ Complete checkout flow working
- ✅ All webhook events processed correctly
- ✅ Database state transitions accurate
- ✅ Usage limits enforced properly
- ✅ Security measures implemented

### Non-Functional Requirements

- ✅ <2s response time for billing operations
- ✅ 99.9% uptime for billing services
- ✅ <0.1% webhook processing failures
- ✅ Zero security incidents

### Quality Gates

- ✅ All unit tests passing
- ✅ Integration tests successful
- ✅ E2E tests validated
- ✅ Security audit completed
- ✅ Performance benchmarks met

## Documentation & Handover

### Technical Documentation

- API specifications and contracts
- Database schema documentation
- Security implementation details
- Troubleshooting guides

### Operational Documentation

- Deployment procedures
- Monitoring and alerting setup
- Incident response procedures
- Maintenance and update procedures

### Team Handover

- Code walkthrough and architecture review
- Testing procedures and validation steps
- Monitoring dashboard setup
- Support and maintenance responsibilities

## Timeline Summary

### Week 1: Infrastructure & Setup

- Day 1-2: Environment setup and dependencies
- Day 3-4: Database migration and schema
- Day 5: create-checkout-session implementation

### Week 2: Webhooks & Integration

- Day 6-7: stripe-webhook implementation
- Day 8-9: Subscription service development
- Day 10: Integration testing and validation

**Total Duration**: 2 weeks
**Team Size**: 2-3 developers
**Risk Level**: Medium (well-established patterns)
**Complexity**: High (security and compliance requirements)
