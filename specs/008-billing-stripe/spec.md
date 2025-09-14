# Specification 008: Billing (Stripe Integration)

## Overview

This specification defines the complete Stripe billing integration for Schwalbe, including payment processing, subscription management, webhook handling, and security measures. The implementation will replace Hollywood's existing billing system with a clean, secure, and scalable solution.

## Goals

- **Secure Payment Processing**: Implement PCI-compliant payment handling via Stripe
- **Subscription Lifecycle Management**: Complete state machine for subscription creation, updates, and cancellations
- **Webhook Security**: Robust webhook validation and processing with proper error handling
- **Database Integration**: Seamless integration with Supabase RLS and user management
- **Monitoring & Analytics**: Comprehensive logging and error tracking for billing operations

## Key Components

### 1. Stripe Integration Layer

- **API Client**: Secure Stripe client configuration with environment-based secrets
- **Customer Management**: Automatic customer creation and management
- **Payment Methods**: Support for multiple payment methods (cards, bank accounts)
- **Subscription Management**: Full lifecycle management with plan changes and cancellations

### 2. Edge Functions

- **create-checkout-session**: Handles Stripe Checkout session creation
- **stripe-webhook**: Processes all Stripe webhook events securely
- **Security**: Webhook signature validation and replay attack prevention

### 3. Subscription State Machine

- **States**: free, active, past_due, cancelled, trialing
- **Transitions**: Automated state changes based on Stripe events
- **Usage Tracking**: Real-time usage monitoring against plan limits
- **Billing Cycles**: Support for monthly and yearly subscriptions

### 4. Database Schema

- **user_subscriptions**: Core subscription data with Stripe IDs
- **user_usage**: Usage tracking for limits enforcement
- **subscription_limits**: Plan definitions and feature flags
- **RLS Policies**: Secure access control for all billing data

## Dependencies

### Required Specs

- **[001-reboot-foundation](../001-reboot-foundation/)**: Base infrastructure and environment setup
- **[003-hollywood-migration](../003-hollywood-migration/)**: Migration framework and data porting
- **[020-auth-rls-baseline](../020-auth-rls-baseline/)**: Supabase Auth and RLS policies
- **[021-database-types](../021-database-types/)**: TypeScript types for database schema

### Related Specs

- **[031-sofia-ai-system](../031-sofia-ai-system/)**: AI features may require premium subscriptions
- **[006-document-vault](../006-document-vault/)**: Storage limits based on subscription plans
- **[007-will-creation-system](../007-will-creation-system/)**: Premium features for will generation
- **[008-family-collaboration](../008-family-collaboration/)**: Family member limits
- **[009-professional-network](../009-professional-network/)**: Professional features access
- **[010-emergency-access](../010-emergency-access/)**: Emergency features availability
- **[011-mobile-app](../011-mobile-app/)**: Mobile-specific billing considerations
- **[013-time-capsule-legacy](../013-time-capsule-legacy/)**: Time capsule limits
- **[014-pricing-conversion](../014-pricing-conversion/)**: Pricing strategy and conversion optimization
- **[015-business-journeys](../015-business-journeys/)**: Business feature access control

## Security Requirements

### Webhook Security

- **Signature Validation**: HMAC-SHA256 signature verification
- **Replay Protection**: Event deduplication and timestamp validation
- **Secret Rotation**: Automated webhook secret rotation
- **Error Handling**: Secure error responses without data leakage

### Data Protection

- **PCI Compliance**: No sensitive payment data stored locally
- **Encryption**: All billing data encrypted at rest
- **Access Control**: RLS policies for all billing-related tables
- **Audit Logging**: Complete audit trail for all billing operations

### Identity and RLS

- Use `auth.uid()` as the identity source (Supabase Auth user ID)
- Reference users via `auth.users(id)`
- Avoid `app.current_external_id()`; standardize all RLS on `auth.uid()`

## API Contracts

### Edge Functions

#### create-checkout-session

```typescript
POST /functions/v1/create-checkout-session
Content-Type: application/json

{
  "priceId": "price_1234567890",
  "userId": "uuid",
  "successUrl": "https://app.schwalbe.com/success",
  "cancelUrl": "https://app.schwalbe.com/cancel",
  "metadata": {
    "plan": "premium",
    "billing_cycle": "year"
  }
}

Response:
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/pay/cs_test_..."
}
```

#### stripe-webhook

```typescript
POST /functions/v1/stripe-webhook
Content-Type: application/json
Stripe-Signature: t=1234567890,v1=signature...

{
  "id": "evt_1234567890",
  "object": "event",
  "type": "checkout.session.completed",
  "data": { ... }
}

Response:
{
  "received": true
}
```

### Client SDK

#### Subscription Service

```typescript
interface SubscriptionService {
  getCurrentSubscription(): Promise<UserSubscription | null>
  getCurrentUsage(): Promise<UserUsage | null>
  checkUsageLimit(type: UsageType, increment?: number): Promise<boolean>
  incrementUsage(type: UsageType, amount?: number): Promise<boolean>
  hasFeatureAccess(feature: keyof SubscriptionLimits): Promise<boolean>
  getUsagePercentage(type: UsageType): Promise<number>
  needsUpgrade(requiredPlan: SubscriptionPlan): Promise<boolean>
}
```

## Implementation Phases

### Phase 4.1: Core Infrastructure

- Port create-checkout-session and stripe-webhook functions
- Implement basic subscription state machine
- Set up webhook security and validation

### Phase 4.2: Enhanced Features

- Usage tracking and limits enforcement
- Subscription plan management
- Payment method management

### Phase 4.3: Monitoring & Analytics

- Billing event logging
- Error tracking and alerting
- Performance monitoring

### Phase 4.4: Testing & Validation

- End-to-end checkout flow testing
- Webhook event processing validation
- Load testing for billing operations

## Success Metrics

- **Checkout Conversion**: >95% successful checkout sessions
- **Webhook Reliability**: <0.1% webhook processing failures
- **Security**: Zero security incidents related to billing
- **Performance**: <2s average response time for billing operations
- **Uptime**: 99.9% availability for billing services

## Risk Mitigation

- **Stripe Outages**: Implement retry logic and fallback mechanisms
- **Data Consistency**: Use database transactions for state changes
- **Rate Limiting**: Implement appropriate rate limits for billing operations
- **Monitoring**: Comprehensive logging and alerting for all billing events
- **Testing**: Extensive test coverage for all billing scenarios

## Migration Strategy

1. **Data Migration**: Port existing subscription data from Hollywood
2. **Function Deployment**: Deploy new edge functions alongside existing ones
3. **Gradual Rollout**: Enable new billing system for new users first
4. **Full Migration**: Complete migration with data validation
5. **Legacy Cleanup**: Remove old billing code after successful migration

## Testing Strategy

### Unit Tests

- Individual function testing for edge functions
- Service layer testing for subscription management
- Database operation testing with test fixtures

### Integration Tests

- End-to-end checkout flow testing
- Webhook event processing testing
- Database state transition testing

### E2E Tests

- Complete user journey from signup to billing
- Subscription lifecycle testing
- Error scenario testing

### Security Testing

- Webhook signature validation testing
- SQL injection prevention testing
- Access control testing

## Documentation Requirements

- **API Documentation**: Complete OpenAPI specification for all endpoints
- **Integration Guide**: Step-by-step integration instructions
- **Troubleshooting Guide**: Common issues and resolution steps
- **Security Guide**: Security best practices and compliance information
- **Migration Guide**: Detailed migration steps and rollback procedures
