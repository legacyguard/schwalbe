# Research: Stripe API Best Practices and Implementation

## Overview

This document contains research on Stripe API best practices, security considerations, and implementation patterns for the billing integration. Based on official Stripe documentation and industry standards.

## Webhook Best Practices

### Security & Validation

#### Signature Verification

**Best Practice**: Always verify webhook signatures using HMAC-SHA256 validation.

```typescript
import { createHmac } from 'crypto';

function verifyStripeSignature(payload: string, signature: string, secret: string): boolean {
  const elements = signature.split(',');
  const sigElements = elements.find(el => el.startsWith('t='))?.split('=')[1];
  const signatures = elements.filter(el => el.startsWith('v1=')).map(el => el.split('=')[1]);

  const expectedSignature = createHmac('sha256', secret)
    .update(`${sigElements}.${payload}`)
    .digest('hex');

  return signatures.some(sig => sig === expectedSignature);
}
```

**Key Points**:

- Use official Stripe libraries for signature verification
- Store webhook secrets securely (environment variables)
- Rotate secrets periodically (recommended every 90 days)
- Never log or expose webhook secrets

#### Replay Attack Prevention

**Best Practice**: Implement timestamp validation to prevent replay attacks.

```typescript
const TOLERANCE = 300; // 5 minutes in seconds

function isTimestampValid(timestamp: number): boolean {
  const now = Math.floor(Date.now() / 1000);
  return Math.abs(now - timestamp) <= TOLERANCE;
}
```

**Key Points**:

- Stripe includes timestamp in `Stripe-Signature` header
- Default tolerance is 5 minutes
- Use NTP for accurate server time synchronization
- Reject events with timestamps outside tolerance window

### Event Processing

#### Duplicate Event Handling

**Best Practice**: Implement idempotency to handle duplicate events.

```typescript
// Store processed event IDs
const processedEvents = new Set<string>();

async function processWebhookEvent(event: StripeEvent): Promise<void> {
  if (processedEvents.has(event.id)) {
    console.log(`Event ${event.id} already processed`);
    return;
  }

  // Process event
  await handleEvent(event);

  // Mark as processed
  processedEvents.add(event.id);
}
```

**Key Points**:

- Store event IDs in database or Redis
- Use combination of event ID and object ID for duplicate detection
- Implement cleanup mechanism for old event IDs

#### Asynchronous Processing

**Best Practice**: Process events asynchronously to handle spikes in volume.

```typescript
// Use a queue system (e.g., Bull, Redis Queue)
const webhookQueue = new Queue('stripe-webhooks', {
  redis: process.env.REDIS_URL
});

webhookQueue.process(async (job) => {
  const { event } = job.data;
  await processStripeEvent(event);
});

// In webhook handler
app.post('/webhooks/stripe', (req, res) => {
  const event = req.body;

  // Quick response
  res.status(200).send('OK');

  // Queue for processing
  webhookQueue.add({ event });
});
```

**Key Points**:

- Return 2xx response immediately (<5 seconds)
- Use message queues for scalability
- Handle subscription renewal spikes (beginning of month)
- Implement retry logic with exponential backoff

### Event Selection

#### Selective Event Listening

**Best Practice**: Only subscribe to required events to reduce server load.

**Recommended Events for Subscription Billing**:

```typescript
const REQUIRED_EVENTS = [
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
  'invoice.finalized'
];
```

**Key Points**:

- Avoid subscribing to all events
- Regularly review and update event subscriptions
- Use test webhooks to validate event handling

## Stripe API Best Practices

### Customer Management

#### Customer Creation Strategy

**Best Practice**: Create customers proactively with metadata.

```typescript
const customer = await stripe.customers.create({
  email: user.email,
  name: user.name,
  metadata: {
    supabase_user_id: user.id,
    registration_date: new Date().toISOString()
  }
});
```

**Key Points**:

- Store mapping between your user ID and Stripe customer ID
- Include relevant metadata for reconciliation
- Handle duplicate customer creation gracefully

### Subscription Management

#### State Machine Implementation

**Best Practice**: Implement comprehensive subscription state handling.

```typescript
enum SubscriptionStatus {
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELLED = 'cancelled',
  INCOMPLETE = 'incomplete',
  INCOMPLETE_EXPIRED = 'incomplete_expired',
  TRIALING = 'trialing',
  UNPAID = 'unpaid'
}

const STATUS_TRANSITIONS = {
  [SubscriptionStatus.ACTIVE]: [SubscriptionStatus.PAST_DUE, SubscriptionStatus.CANCELLED],
  [SubscriptionStatus.PAST_DUE]: [SubscriptionStatus.ACTIVE, SubscriptionStatus.CANCELLED],
  // ... define all valid transitions
};
```

**Key Points**:

- Validate state transitions
- Handle edge cases (prorations, plan changes)
- Maintain audit trail of all changes

#### Usage Tracking

**Best Practice**: Implement real-time usage validation.

```typescript
async function checkUsageLimit(userId: string, feature: string, increment = 1): Promise<boolean> {
  const usage = await getCurrentUsage(userId);
  const limits = await getSubscriptionLimits(userId);

  const currentUsage = usage[feature] || 0;
  const limit = limits[`max_${feature}`];

  // Unlimited plans have null limits
  if (limit === null) return true;

  return (currentUsage + increment) <= limit;
}
```

**Key Points**:

- Check limits before allowing actions
- Implement atomic usage increments
- Handle concurrent requests properly

### Error Handling

#### Comprehensive Error Handling

**Best Practice**: Handle all Stripe error types appropriately.

```typescript
try {
  const session = await stripe.checkout.sessions.create(params);
} catch (error) {
  switch (error.type) {
    case 'StripeCardError':
      // Card was declined
      handleCardError(error);
      break;
    case 'StripeRateLimitError':
      // Too many requests made to the API too quickly
      handleRateLimitError(error);
      break;
    case 'StripeInvalidRequestError':
      // Invalid parameters were supplied to Stripe's API
      handleInvalidRequestError(error);
      break;
    case 'StripeAPIError':
      // An error occurred internally with Stripe's API
      handleAPIError(error);
      break;
    case 'StripeConnectionError':
      // Some kind of error occurred during the HTTPS communication
      handleConnectionError(error);
      break;
    case 'StripeAuthenticationError':
      // You probably used an incorrect API key
      handleAuthenticationError(error);
      break;
    default:
      handleGenericError(error);
  }
}
```

**Key Points**:

- Different error types require different user messaging
- Implement retry logic for transient errors
- Log errors securely without exposing sensitive data

### Testing Strategies

#### Test Mode Best Practices

**Best Practice**: Use Stripe's test mode extensively.

**Test Cards**:

- `4242424242424242` - Successful payment
- `4000000000000002` - Declined card
- `4000000000009995` - Insufficient funds

**Test Webhook Events**:

```bash
# Use Stripe CLI to trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.created
stripe trigger invoice.payment_failed
```

**Key Points**:

- Test all edge cases and error scenarios
- Use different test cards for various scenarios
- Validate webhook handling with CLI

### Security Considerations

#### API Key Management

**Best Practice**: Secure API key storage and rotation.

```typescript
// Environment-based configuration
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
});

// Validate key format
if (!process.env.STRIPE_SECRET_KEY?.startsWith('sk_')) {
  throw new Error('Invalid Stripe secret key');
}
```

**Key Points**:

- Use environment variables for secrets
- Rotate keys regularly
- Use restricted keys when possible
- Monitor key usage

#### PCI Compliance

**Best Practice**: Minimize PCI scope by using Stripe Elements.

```typescript
// Use Stripe Elements for secure card collection
const elements = stripe.elements();
const cardElement = elements.create('card');
cardElement.mount('#card-element');
```

**Key Points**:

- Never store card details on your servers
- Use Stripe's hosted checkout when possible
- Implement proper error handling for declined cards

### Performance Optimization

#### Connection Pooling

**Best Practice**: Reuse Stripe client instances.

```typescript
// Singleton pattern for Stripe client
class StripeClient {
  private static instance: Stripe;

  static getInstance(): Stripe {
    if (!StripeClient.instance) {
      StripeClient.instance = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2023-10-16',
        maxNetworkRetries: 3,
        timeout: 10000,
      });
    }
    return StripeClient.instance;
  }
}
```

**Key Points**:

- Configure appropriate timeouts
- Implement retry logic
- Monitor API usage and limits

#### Caching Strategy

**Best Practice**: Cache frequently accessed Stripe data.

```typescript
// Cache subscription limits (rarely change)
const limitsCache = new Map<string, SubscriptionLimits>();

async function getCachedLimits(planId: string): Promise<SubscriptionLimits> {
  if (!limitsCache.has(planId)) {
    const limits = await fetchLimitsFromStripe(planId);
    limitsCache.set(planId, limits);

    // Expire cache after 1 hour
    setTimeout(() => limitsCache.delete(planId), 3600000);
  }

  return limitsCache.get(planId)!;
}
```

**Key Points**:

- Cache static data (products, plans)
- Implement cache invalidation
- Handle cache misses gracefully

## Integration Patterns

### Checkout Session Creation

**Best Practice**: Use Stripe Checkout for simplified integration.

```typescript
const session = await stripe.checkout.sessions.create({
  customer: customerId,
  payment_method_types: ['card'],
  line_items: [{
    price: priceId,
    quantity: 1,
  }],
  mode: 'subscription',
  success_url: `${process.env.APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.APP_URL}/cancel`,
  metadata: {
    user_id: userId,
  },
  subscription_data: {
    metadata: {
      user_id: userId,
    },
  },
});
```

**Key Points**:

- Include user ID in metadata for webhook processing
- Use success/cancel URLs for user experience
- Handle subscription metadata properly

### Webhook Event Processing

**Best Practice**: Implement event-driven architecture.

```typescript
const eventHandlers = {
  'checkout.session.completed': handleCheckoutCompleted,
  'customer.subscription.created': handleSubscriptionCreated,
  'customer.subscription.updated': handleSubscriptionUpdated,
  'customer.subscription.deleted': handleSubscriptionDeleted,
  'invoice.payment_succeeded': handlePaymentSucceeded,
  'invoice.payment_failed': handlePaymentFailed,
};

async function processWebhookEvent(event: StripeEvent): Promise<void> {
  const handler = eventHandlers[event.type];

  if (handler) {
    await handler(event.data.object);
  } else {
    console.log(`Unhandled event type: ${event.type}`);
  }
}
```

**Key Points**:

- Map events to specific handlers
- Implement comprehensive logging
- Handle unknown events gracefully

## Monitoring and Alerting

### Key Metrics to Monitor

- Webhook delivery success rate (>99.9%)
- Event processing latency (<5 seconds)
- API error rates (<0.1%)
- Subscription state consistency
- Usage limit violation attempts

### Alert Conditions

- Webhook signature verification failures
- High rate of duplicate events
- Database connection issues
- Stripe API rate limit hits
- Subscription state inconsistencies

## Migration Considerations

### From Hollywood to Schwalbe

1. **Data Migration**: Export existing subscription data
2. **Customer Reconciliation**: Match existing customers
3. **Webhook Endpoint Update**: Update webhook URLs
4. **Testing**: Extensive testing with production data
5. **Gradual Rollout**: Feature flags for gradual migration

### Rollback Strategy

- Maintain old webhook endpoints during transition
- Implement feature flags for easy rollback
- Keep old billing code for fallback
- Document rollback procedures

## Compliance and Legal

### GDPR Considerations

- Minimize personal data collection
- Implement right to erasure
- Provide data export functionality
- Document data retention policies

### PCI DSS Compliance

- Use Stripe's hosted forms
- Never store card data
- Implement proper access controls
- Regular security audits

## Conclusion

Following these best practices ensures:

- **Security**: Proper webhook validation and data protection
- **Reliability**: Robust error handling and retry logic
- **Scalability**: Asynchronous processing and performance optimization
- **Maintainability**: Clean code structure and comprehensive testing
- **Compliance**: PCI DSS and GDPR compliance

The implementation should prioritize security, reliability, and user experience while maintaining the flexibility to adapt to future Stripe API changes.
