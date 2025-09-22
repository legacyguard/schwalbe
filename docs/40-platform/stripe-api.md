# Stripe Integration API Documentation

## Overview

This document describes the API endpoints and functions that make up the Stripe billing integration in the schwalbe project.

## Table of Contents

1. [Supabase Edge Functions](#supabase-edge-functions)
2. [Subscription Service](#subscription-service)  
3. [Database Schema](#database-schema)
4. [Frontend Integration](#frontend-integration)
5. [Error Handling](#error-handling)

## Supabase Edge Functions

### stripe-checkout Function

Creates Stripe checkout sessions for subscription purchases.

**Endpoint**: `POST /functions/v1/stripe-checkout`

**Headers**:
```http
Content-Type: application/json
Authorization: Bearer <anon_key>
```

**Request Body**:
```typescript
interface CheckoutRequest {
  plan: 'basic' | 'pro'
}
```

**Response**:
```typescript
interface CheckoutResponse {
  url: string  // Stripe checkout session URL
}
```

**Example Request**:
```bash
curl -X POST "https://rnmqtqaegqpbpytqawpg.supabase.co/functions/v1/stripe-checkout" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{"plan": "basic"}'
```

**Example Response**:
```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_test_a1B2c3D4..."
}
```

**Error Responses**:
```typescript
// Missing authentication
{
  "code": 401,
  "message": "Missing authorization header"
}

// Invalid plan
{
  "code": 400, 
  "message": "Invalid plan. Must be 'basic' or 'pro'"
}

// User not found
{
  "code": 404,
  "message": "User not found"
}

// Stripe error
{
  "code": 500,
  "message": "Failed to create checkout session"
}
```

**Implementation Details**:
- Detects currency based on `Referer` header domain (.cz = CZK, others = EUR)
- Creates or retrieves Stripe customer for user
- Uses dynamic pricing embedded in function code
- Sets up proper success/cancel URLs

---

### stripe-webhook Function

Handles Stripe webhook events and updates subscription data.

**Endpoint**: `POST /functions/v1/stripe-webhook`

**Headers**:
```http
Content-Type: application/json
stripe-signature: <webhook_signature>
Authorization: Bearer <service_role_key>
```

**Supported Events**:

#### checkout.session.completed
Updates user subscription when checkout is completed.

**Payload Processing**:
```typescript
const session = event.data.object as Stripe.Checkout.Session
const customerId = session.customer as string
const subscriptionId = session.subscription as string

// Creates/updates user_subscriptions record
await supabase
  .from('user_subscriptions')
  .upsert({
    user_id,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    plan_name: planName,
    status: 'active',
    current_period_end: new Date(subscription.current_period_end * 1000)
  })
```

#### customer.subscription.* events
Handles subscription lifecycle changes.

**Events**:
- `customer.subscription.created`
- `customer.subscription.updated` 
- `customer.subscription.deleted`

**Processing**:
```typescript
const subscription = event.data.object as Stripe.Subscription

await supabase
  .from('user_subscriptions')
  .update({
    status: subscription.status, // active, canceled, past_due, etc.
    current_period_end: new Date(subscription.current_period_end * 1000)
  })
  .eq('stripe_subscription_id', subscription.id)
```

#### invoice.payment_* events  
Handles payment success/failure and usage resets.

**Events**:
- `invoice.payment_succeeded` - Resets usage limits for new billing period
- `invoice.payment_failed` - Updates subscription status, sends alerts

**Usage Reset Logic**:
```typescript
// Reset usage counters on successful payment
await supabase
  .from('user_usage')
  .update({
    usage_count: 0,
    period_start: new Date(invoice.period_start * 1000),
    period_end: new Date(invoice.period_end * 1000)
  })
  .eq('user_id', userId)
```

**Webhook Response**:
```json
{ "received": true }
```

**Implementation Details**:
- Verifies webhook signature for security
- Implements idempotency to prevent duplicate processing
- Comprehensive error logging and alerting
- Automatic retry handling for failed database operations

---

## Subscription Service

Located: `/packages/shared/src/services/subscription.service.ts`

### getPlan(userId: string)

Gets the current subscription plan for a user.

**Parameters**:
- `userId: string` - User ID (from Clerk)

**Returns**:
```typescript
interface UserPlan {
  plan_name: 'free' | 'basic' | 'pro'
  status: 'active' | 'canceled' | 'past_due'
  current_period_end?: Date
}
```

**Example**:
```typescript
import { subscriptionService } from '@/services/subscription.service'

const plan = await subscriptionService.getPlan(userId)
console.log(plan.plan_name) // 'basic'
```

---

### hasEntitlement(feature: string, userId: string)

Checks if user has access to a specific feature.

**Parameters**:
- `feature: string` - Feature name ('ocr', 'share', 'export')
- `userId: string` - User ID

**Returns**: `Promise<boolean>`

**Feature Access Matrix**:
```typescript
const PLAN_FEATURES = {
  free: [],
  basic: ['ocr', 'share'],
  pro: ['ocr', 'share', 'export']
}
```

**Example**:
```typescript
const hasOCR = await subscriptionService.hasEntitlement('ocr', userId)
if (!hasOCR) {
  throw new Error('Upgrade required for OCR feature')
}
```

---

### getUsage(userId: string) 

Gets current usage statistics for a user.

**Returns**:
```typescript
interface UserUsage {
  feature_name: string
  usage_count: number
  limit: number
  period_start: Date
  period_end: Date
}[]
```

**Example**:
```typescript
const usage = await subscriptionService.getUsage(userId)
const ocrUsage = usage.find(u => u.feature_name === 'ocr')
console.log(`OCR: ${ocrUsage.usage_count}/${ocrUsage.limit}`)
```

---

### incrementUsage(userId: string, feature: string)

Increments usage counter for a feature.

**Parameters**:
- `userId: string` - User ID
- `feature: string` - Feature name

**Returns**: `Promise<void>`

**Example**:
```typescript
// Before processing OCR
await subscriptionService.incrementUsage(userId, 'ocr')
```

---

## Database Schema

### user_subscriptions

Stores user subscription information.

```sql
CREATE TABLE user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    status TEXT NOT NULL,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes**:
```sql
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_stripe_customer ON user_subscriptions(stripe_customer_id);
```

**RLS Policy**:
```sql
CREATE POLICY "Users can only access own subscriptions"
ON user_subscriptions FOR ALL
USING (app.current_external_id() = user_id);
```

---

### user_usage

Tracks feature usage per user.

```sql
CREATE TABLE user_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    feature_name TEXT NOT NULL,
    usage_count INTEGER DEFAULT 0,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Unique Constraint**:
```sql
ALTER TABLE user_usage 
ADD CONSTRAINT unique_user_feature_period 
UNIQUE (user_id, feature_name, period_start);
```

---

### subscription_limits

Defines usage limits per plan.

```sql
CREATE TABLE subscription_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_name TEXT NOT NULL,
    feature_name TEXT NOT NULL,
    limit_value INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Data**:
```sql
INSERT INTO subscription_limits (plan_name, feature_name, limit_value) VALUES
('free', 'ocr', 0),
('free', 'share', 0),
('free', 'export', 0),
('basic', 'ocr', 100),
('basic', 'share', 50),
('basic', 'export', 0),
('pro', 'ocr', 1000),
('pro', 'share', 500),
('pro', 'export', 100);
```

---

## Frontend Integration

### Pricing Section Component

Located: `/apps/web/src/components/landing/PricingSection.tsx`

**Checkout Handler**:
```typescript
const handleUpgrade = async (plan: 'basic' | 'pro') => {
  try {
    const response = await fetch('/functions/v1/stripe-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseClient.supabaseKey}`
      },
      body: JSON.stringify({ plan })
    })

    const { url } = await response.json()
    window.location.href = url
  } catch (error) {
    console.error('Checkout failed:', error)
  }
}
```

**Button Implementation**:
```tsx
<button 
  onClick={() => handleUpgrade('basic')}
  className="bg-blue-600 text-white px-6 py-3 rounded-lg"
>
  Upgrade to Basic
</button>
```

---

### Feature Gating

**Document Upload Component**:
```typescript
// apps/web/src/components/documents/DocumentUpload.tsx

const handleOCRUpload = async (file: File) => {
  // Check entitlement before processing
  const hasOCR = await subscriptionService.hasEntitlement('ocr', userId)
  
  if (!hasOCR) {
    setShowUpgradeModal(true)
    return
  }

  // Proceed with OCR processing
  await processDocumentOCR(file)
}
```

**Sharing Component**:
```typescript
const handleShare = async (documentId: string) => {
  const canShare = await subscriptionService.hasEntitlement('share', userId)
  
  if (!canShare) {
    throw new Error('Sharing requires Basic plan or higher')
  }
  
  await createShareLink(documentId)
}
```

---

## Error Handling

### Standard Error Responses

All endpoints return errors in this format:

```typescript
interface ErrorResponse {
  code: number
  message: string
  details?: any
}
```

### Common HTTP Status Codes

- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (missing/invalid auth)
- `402` - Payment Required (feature not available on plan)
- `404` - Not Found (user/resource not found)  
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error (unexpected error)

### Feature Gating Errors

When a feature is not available on the user's plan:

```typescript
{
  code: 402,
  message: "This feature requires a paid plan",
  details: {
    feature: "ocr",
    current_plan: "free",
    required_plans: ["basic", "pro"],
    upgrade_url: "/pricing"
  }
}
```

### Webhook Error Handling

Webhook function includes comprehensive error handling:

```typescript
try {
  // Process webhook event
  await processWebhookEvent(event)
  
  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
} catch (error) {
  console.error('Webhook processing failed:', error)
  
  // Send alert for critical errors
  if (isCriticalError(error)) {
    await sendAlert(`Webhook failed: ${error.message}`)
  }
  
  return new Response(
    JSON.stringify({ 
      error: 'Webhook processing failed',
      message: error.message 
    }), 
    { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
```

---

## Rate Limiting

### Usage Limits

Users are subject to usage limits based on their plan:

```typescript
const PLAN_LIMITS = {
  free: { ocr: 0, share: 0, export: 0 },
  basic: { ocr: 100, share: 50, export: 0 },
  pro: { ocr: 1000, share: 500, export: 100 }
}
```

### Limit Checking

Before processing any paid feature:

```typescript
const usage = await subscriptionService.getUsage(userId)
const ocrUsage = usage.find(u => u.feature_name === 'ocr')

if (ocrUsage.usage_count >= ocrUsage.limit) {
  throw new Error('Usage limit exceeded for this billing period')
}
```

---

## Security Considerations

### Webhook Signature Verification

All webhook payloads are verified using Stripe's signature:

```typescript
const signature = headers.get('stripe-signature')
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

try {
  const event = stripe.webhooks.constructEvent(
    body, 
    signature, 
    webhookSecret
  )
} catch (err) {
  return new Response('Webhook signature verification failed', {
    status: 401
  })
}
```

### Authentication

- All checkout requests require valid user authentication
- Webhook endpoints use service role key for database access
- User data is protected by Row Level Security (RLS)

### Data Privacy

- No sensitive payment information is stored in the database
- Only Stripe customer IDs and subscription IDs are retained
- All PII is handled by Stripe's secure infrastructure

---

## Testing

### Test Mode

All development uses Stripe test mode:
- Test secret keys: `sk_test_...`
- Test webhook secrets: `whsec_...` 
- Test cards: `4242424242424242`

### Test Scenarios

```bash
# Test checkout creation
curl -X POST "https://rnmqtqaegqpbpytqawpg.supabase.co/functions/v1/stripe-checkout" \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"plan": "basic"}'

# Test webhook processing  
stripe trigger checkout.session.completed

# Test feature gating
curl -X POST "https://your-app.com/api/documents/ocr" \
  -H "Authorization: Bearer $USER_TOKEN"
```

For more testing details, see the [Testing section](./stripe-integration.md#testing) in the main documentation.