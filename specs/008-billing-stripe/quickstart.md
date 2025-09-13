# Quickstart: Stripe Billing Integration

## Overview

This guide provides step-by-step instructions for setting up and integrating Stripe billing into Schwalbe. Follow these steps to get a working billing system in development and production environments.

## Prerequisites

### Required Accounts

- **Stripe Account**: [Create a Stripe account](https://dashboard.stripe.com/register)
- **Supabase Project**: Development environment configured
- **Vercel Account**: For deployment (optional for local development)

### Development Environment

```bash
# Install dependencies
npm install stripe @supabase/supabase-js

# Environment variables
cp .env.example .env.local
```

## Step 1: Stripe Configuration

### 1.1 Get API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy your **Publishable key** and **Secret key**
3. For development, use test keys (they start with `pk_test_` and `sk_test_`)

### 1.2 Configure Environment Variables

Update your `.env.local` file:

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...  # Will be created in Step 2

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 1.3 Create Products and Prices

1. Go to [Products](https://dashboard.stripe.com/products) in Stripe Dashboard
2. Create products for each plan:

#### Free Plan

- Name: "Free Plan"
- No price (handled in application)

#### Essential Plan

- Name: "Essential Plan"
- Monthly Price: $9.99
- Yearly Price: $99.99

#### Family Plan

- Name: "Family Plan"
- Monthly Price: $19.99
- Yearly Price: $199.99

#### Premium Plan

- Name: "Premium Plan"
- Monthly Price: $39.99
- Yearly Price: $399.99

1. Note the Price IDs for each price (format: `price_1234567890`)

## Step 2: Webhook Configuration

### 2.1 Install Stripe CLI

```bash
# Install Stripe CLI (macOS)
brew install stripe/stripe-cli/stripe

# Login to your Stripe account
stripe login
```

### 2.2 Create Webhook Endpoint

```bash
# Forward webhooks to local development
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This will output your webhook endpoint secret. Copy it to your `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2.3 Configure Webhook Events

In Stripe Dashboard:

1. Go to [Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

## Step 3: Database Setup

### 3.1 Run Migrations

```bash
# Apply the subscription tables migration
supabase db push

# Or run manually in Supabase SQL Editor
# Copy contents of supabase/migrations/20240101000000_create_subscription_tables.sql
```

### 3.2 Verify Tables

Check that these tables were created:

- `user_subscriptions`
- `user_usage`
- `subscription_limits`

### 3.3 Seed Default Data

Run this SQL to seed plan limits:

```sql
INSERT INTO public.subscription_limits (plan, max_documents, max_storage_mb, max_time_capsules, max_scans_per_month, max_family_members, offline_access, ai_features, advanced_search, priority_support) VALUES
('free', 100, 500, 1, 10, 1, FALSE, FALSE, FALSE, FALSE),
('essential', 1000, 5120, 5, 100, 1, TRUE, FALSE, TRUE, FALSE),
('family', 5000, 20480, 20, 500, 5, TRUE, TRUE, TRUE, FALSE),
('premium', NULL, NULL, NULL, NULL, 10, TRUE, TRUE, TRUE, TRUE)
ON CONFLICT (plan) DO NOTHING;
```

## Step 4: Code Implementation

### 4.1 Install Dependencies

```bash
# In packages/shared
npm install stripe

# In apps/web-next
npm install @stripe/stripe-js
```

### 4.2 Create Stripe Service

Create `packages/shared/src/services/stripe.service.ts`:

```typescript
import Stripe from 'stripe';

export class StripeService {
  private stripe: Stripe;

  constructor(secretKey: string) {
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2023-10-16',
    });
  }

  async createCheckoutSession(params: {
    priceId: string;
    userId: string;
    successUrl: string;
    cancelUrl: string;
  }) {
    // Implementation from research.md
  }

  async createCustomer(email: string, name?: string) {
    // Implementation
  }
}

export const stripeService = new StripeService(process.env.STRIPE_SECRET_KEY!);
```

### 4.3 Create Subscription Service

Create `packages/shared/src/services/subscription.service.ts`:

```typescript
import { supabase } from '../supabase/client';

export class SubscriptionService {
  async getCurrentSubscription(userId: string) {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  async checkUsageLimit(userId: string, type: string, increment = 1) {
    const { data, error } = await supabase.rpc('check_usage_limit', {
      p_user_id: userId,
      p_limit_type: type,
      p_increment: increment,
    });

    if (error) throw error;
    return data;
  }
}

export const subscriptionService = new SubscriptionService();
```

### 4.4 Create Webhook Handler

Create `apps/web-next/src/app/api/webhooks/stripe/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripeService } from '@shared/services/stripe.service';
import { subscriptionService } from '@shared/services/subscription.service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      // Handle other events...
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  // Implementation from research.md
}
```

## Step 5: Frontend Integration

### 5.1 Install Stripe.js

```bash
npm install @stripe/stripe-js
```

### 5.2 Create Checkout Component

```typescript
'use client';

import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function CheckoutButton({ priceId }: { priceId: string }) {
  const handleClick = async () => {
    const stripe = await stripePromise;

    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId }),
    });

    const { sessionId } = await response.json();
    await stripe?.redirectToCheckout({ sessionId });
  };

  return (
    <button onClick={handleClick}>
      Subscribe Now
    </button>
  );
}
```

### 5.3 Create Pricing Page

```typescript
// pages/pricing.tsx
import { CheckoutButton } from '../components/CheckoutButton';

const plans = [
  { id: 'price_free', name: 'Free', price: 0 },
  { id: 'price_essential_monthly', name: 'Essential', price: 9.99 },
  // ... other plans
];

export default function Pricing() {
  return (
    <div>
      {plans.map(plan => (
        <div key={plan.id}>
          <h3>{plan.name}</h3>
          <p>${plan.price}/month</p>
          <CheckoutButton priceId={plan.id} />
        </div>
      ))}
    </div>
  );
}
```

## Step 6: Testing

### 6.1 Test Webhooks Locally

```bash
# Start your development server
npm run dev

# In another terminal, forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.created
```

### 6.2 Test Checkout Flow

1. Visit your pricing page
2. Click "Subscribe Now" on a paid plan
3. Use test card: `4242 4242 4242 4242`
4. Complete checkout
5. Verify webhook was received and processed

### 6.3 Test Usage Limits

```typescript
// Test usage limit checking
const canUpload = await subscriptionService.checkUsageLimit(userId, 'documents', 1);
if (!canUpload) {
  // Show upgrade prompt
}
```

## Step 7: Production Deployment

### 7.1 Environment Configuration

Update production environment variables:

```bash
# Use live Stripe keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...  # From production webhook

# Production Supabase
NEXT_PUBLIC_SUPABASE_URL=your_prod_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_prod_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_prod_service_role_key
```

### 7.2 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 7.3 Update Webhook URL

1. In Stripe Dashboard, update webhook URL to production domain
2. Copy new webhook secret to production environment
3. Test production webhooks

### 7.4 DNS Configuration

Ensure your domain supports HTTPS (required for webhooks):

- Use TLS 1.2 or 1.3
- Valid SSL certificate
- Accessible from Stripe's IP ranges

## Step 8: Monitoring & Maintenance

### 8.1 Set Up Monitoring

```typescript
// Log webhook events
console.log(`Processing webhook: ${event.type}`, {
  eventId: event.id,
  userId: event.data.object.metadata?.user_id,
});

// Monitor errors
if (error) {
  // Send to error tracking service
  // Update monitoring dashboard
}
```

### 8.2 Regular Maintenance

**Weekly:**

- Review webhook delivery logs
- Check for failed payments
- Monitor usage patterns

**Monthly:**

- Rotate webhook secrets
- Review subscription analytics
- Update Stripe API version if needed

**Quarterly:**

- Security audit of billing implementation
- Performance optimization review
- Compliance check (PCI DSS, GDPR)

## Troubleshooting

### Common Issues

**Webhook signature verification fails:**

- Check webhook secret is correct
- Ensure server time is synchronized
- Verify Stripe-Signature header is present

**Database connection errors:**

- Check Supabase credentials
- Verify RLS policies
- Ensure database is accessible

**Checkout session creation fails:**

- Verify price IDs are correct
- Check customer creation
- Validate success/cancel URLs

### Debug Commands

```bash
# Check webhook events
stripe events list --limit 10

# Test specific webhook event
stripe trigger customer.subscription.created

# View webhook endpoint details
stripe webhooks list
```

## Next Steps

1. **Implement Usage Tracking**: Add usage increment calls throughout the app
2. **Add Subscription Management**: Allow users to change plans and cancel
3. **Implement Dunning Management**: Handle failed payments gracefully
4. **Add Analytics**: Track conversion rates and subscription metrics
5. **Set Up Alerts**: Monitor for payment failures and unusual activity

## Support Resources

- [Stripe Documentation](https://docs.stripe.com/)
- [Stripe CLI Reference](https://docs.stripe.com/stripe-cli)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

For additional help, check the implementation details in the main specification document or contact the development team.
