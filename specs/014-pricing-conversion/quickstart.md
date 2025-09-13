# Pricing & Conversion System - Quick Start Guide

## Overview

This guide provides step-by-step instructions for setting up and testing the Pricing & Conversion System for Schwalbe. It covers environment setup, Stripe configuration, database initialization, and end-to-end testing procedures.

## Prerequisites

### Required Dependencies

- **Node.js 18+** and **npm** (use npm ci for installs)
- **Supabase CLI** for database management
- **Stripe CLI** for webhook testing
- **Git** for version control
- **Docker** (optional) for local development

### Required Accounts

- **Stripe Account** (test and live modes)
- **Supabase Project** with admin access
- **Vercel Account** for deployment
- **GitHub Account** for repository access

### Required Specifications

- **001-reboot-foundation**: Monorepo structure
- **002-hollywood-migration**: Core packages and Stripe patterns
- **005-sofia-ai-system**: AI integration
- **006-document-vault**: Usage tracking
- **007-will-creation-system**: Premium features
- **008-family-collaboration**: Family plans
- **009-professional-network**: Professional pricing
- **010-emergency-access**: Emergency billing
- **011-mobile-app**: Mobile optimization
- **012-animations-microinteractions**: UI animations
- **013-time-capsule-legacy**: Premium features

## Environment Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-org/schwalbe.git
cd schwalbe

# Install dependencies
npm ci

# Build packages
npm run build
```

### 2. Environment Variables

Create environment files for each environment:

#### Development (.env.local)

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe Configuration (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Email Configuration
RESEND_API_KEY=re_...

# Google Translate API
GOOGLE_TRANSLATE_API_KEY=your_api_key

# Environment
NEXT_PUBLIC_IS_PRODUCTION=false
```

#### Staging (.env.staging)

```bash
# Use test Stripe keys for staging
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Staging Supabase
NEXT_PUBLIC_SUPABASE_URL=your_staging_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_staging_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_staging_service_role_key

# Other staging configurations...
NEXT_PUBLIC_IS_PRODUCTION=false
```

#### Production (.env.production)

```bash
# Use live Stripe keys for production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Production Supabase
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

# Other production configurations...
NEXT_PUBLIC_IS_PRODUCTION=true
```

### 3. Supabase Setup

#### Initialize Supabase Project

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Start local development
supabase start
```

#### Run Database Migrations

```bash
# Apply pricing system migrations
supabase db push

# Verify migrations
supabase db diff
```

#### Set Up RLS Policies

```bash
# Apply RLS policies
supabase db push --include-all

# Verify policies
supabase db diff --schema public
```

### 4. Stripe Configuration

#### Create Stripe Products and Prices

```bash
# Install Stripe CLI
npm install -g @stripe/stripe-cli

# Login to Stripe
stripe login

# Create products and prices
stripe products create --name "Free Plan" --description "Basic features for getting started"
stripe products create --name "Essential Plan" --description "Perfect for individuals and small families"
stripe products create --name "Family Plan" --description "Complete family protection and collaboration"
stripe products create --name "Premium Plan" --description "Advanced features for power users"
stripe products create --name "Enterprise Plan" --description "Custom solutions for organizations"

# Create monthly prices
stripe prices create --product prod_free --unit-amount 0 --currency usd --recurring interval=month
stripe prices create --product prod_essential --unit-amount 999 --currency usd --recurring interval=month
stripe prices create --product prod_family --unit-amount 1999 --currency usd --recurring interval=month
stripe prices create --product prod_premium --unit-amount 3999 --currency usd --recurring interval=month

# Create yearly prices
stripe prices create --product prod_essential --unit-amount 9999 --currency usd --recurring interval=year
stripe prices create --product prod_family --unit-amount 19999 --currency usd --recurring interval=year
stripe prices create --product prod_premium --unit-amount 39999 --currency usd --recurring interval=year
```

#### Set Up Webhooks

```bash
# Listen for webhooks locally
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Note the webhook signing secret for your .env file
```

#### Configure Webhook Endpoints

1. Go to Stripe Dashboard > Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `payment_method.attached`
   - `payment_method.detached`

## Database Initialization

### 1. Create Subscription Plans

```sql
-- Insert default subscription plans
INSERT INTO subscription_plans (name, display_name, description, price_monthly, price_yearly, features, limits, sort_order) VALUES
('free', 'Free', 'Basic features for getting started', 0, 0, 
 '{"documents": true, "family_members": true, "basic_ai": true, "mobile_app": true}',
 '{"max_documents": 10, "max_family_members": 2, "max_storage_mb": 100, "max_time_capsules": 0}',
 1),
('essential', 'Essential', 'Perfect for individuals and small families', 999, 9999,
 '{"documents": true, "family_members": true, "advanced_ai": true, "email_support": true, "advanced_search": true}',
 '{"max_documents": 100, "max_family_members": 5, "max_storage_mb": 1000, "max_time_capsules": 0}',
 2),
('family', 'Family', 'Complete family protection and collaboration', 1999, 19999,
 '{"documents": true, "family_members": true, "advanced_ai": true, "priority_support": true, "time_capsules": true, "will_generation": true}',
 '{"max_documents": 500, "max_family_members": 10, "max_storage_mb": 5000, "max_time_capsules": 5}',
 3),
('premium', 'Premium', 'Advanced features for power users', 3999, 39999,
 '{"documents": true, "family_members": true, "advanced_ai": true, "priority_support": true, "time_capsules": true, "will_generation": true, "professional_network": true, "white_label": true}',
 '{"max_documents": -1, "max_family_members": -1, "max_storage_mb": 50000, "max_time_capsules": -1}',
 4),
('enterprise', 'Enterprise', 'Custom solutions for organizations', 0, 0,
 '{"documents": true, "family_members": true, "advanced_ai": true, "dedicated_support": true, "time_capsules": true, "will_generation": true, "professional_network": true, "white_label": true, "custom_integrations": true, "advanced_analytics": true}',
 '{"max_documents": -1, "max_family_members": -1, "max_storage_mb": -1, "max_time_capsules": -1}',
 5);
```

### 2. Set Up Usage Tracking

```sql
-- Create usage tracking for existing users
INSERT INTO user_usage (user_id, document_count, storage_used_mb, time_capsule_count, ai_requests_this_month)
SELECT 
  id as user_id,
  0 as document_count,
  0 as storage_used_mb,
  0 as time_capsule_count,
  0 as ai_requests_this_month
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_usage);
```

### 3. Initialize Analytics Tables

```sql
-- Create initial analytics data
INSERT INTO subscription_analytics (date, plan_name, new_subscriptions, cancellations, upgrades, downgrades, revenue_cents, mrr_cents)
SELECT 
  CURRENT_DATE as date,
  sp.name as plan_name,
  0 as new_subscriptions,
  0 as cancellations,
  0 as upgrades,
  0 as downgrades,
  0 as revenue_cents,
  0 as mrr_cents
FROM subscription_plans sp;
```

## Development Server Setup

### 1. Start Development Server

```bash
# Start the development server
npm run dev

# The application will be available at http://localhost:3000
```

### 2. Start Supabase Local Development

```bash
# Start Supabase services
supabase start

# Start Edge Functions
supabase functions serve
```

### 3. Start Stripe Webhook Listener

```bash
# Listen for Stripe webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Testing Procedures

### 1. Unit Testing

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm test -- --testPathPattern=pricing
npm test -- --testPathPattern=subscription
npm test -- --testPathPattern=usage
```

### 2. Integration Testing

```bash
# Run integration tests
npm run test:integration

# Run end-to-end tests
npm run test:e2e

# Run specific integration tests
npm run test:integration -- --testNamePattern="pricing flow"
npm run test:integration -- --testNamePattern="subscription management"
```

### 3. Manual Testing

#### Test Pricing Page

1. Navigate to `/pricing`
2. Verify all pricing tiers display correctly
3. Test responsive design on mobile and desktop
4. Verify pricing psychology features (anchoring, decoy effect)
5. Test social proof and trust indicators
6. Verify call-to-action buttons work

#### Test Checkout Flow

1. Click "Get Started" on any pricing tier
2. Verify checkout page loads with correct pricing
3. Test form validation and error handling
4. Test payment method selection
5. Complete test payment with Stripe test cards
6. Verify subscription creation and confirmation

#### Test Subscription Management

1. Log in with test user account
2. Navigate to subscription management page
3. Test plan upgrade and downgrade flows
4. Test payment method management
5. Test subscription cancellation and reactivation
6. Verify billing history and invoice access

#### Test Usage Tracking

1. Create test documents to trigger usage limits
2. Verify usage dashboard displays correctly
3. Test usage limit warnings and enforcement
4. Test usage-based upgrade prompts
5. Verify usage analytics and reporting

### 4. A/B Testing

#### Create Test Experiment

```bash
# Create pricing experiment via API
curl -X POST http://localhost:3000/api/experiments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "pricing_test_1",
    "description": "Test different pricing displays",
    "variants": [
      {
        "name": "control",
        "trafficAllocation": 50,
        "pricingChanges": []
      },
      {
        "name": "test_variant",
        "trafficAllocation": 50,
        "pricingChanges": [
          {
            "planId": "family",
            "discountPercentage": 10
          }
        ]
      }
    ],
    "successMetrics": ["conversion_rate", "revenue"]
  }'
```

#### Test Experiment Assignment

1. Visit pricing page multiple times
2. Verify experiment assignment is consistent
3. Test variant rendering and switching
4. Verify conversion tracking works
5. Check experiment analytics dashboard

### 5. Mobile Testing

#### Test Mobile Payment

1. Open pricing page on mobile device
2. Test mobile-optimized layout and interactions
3. Test Apple Pay and Google Pay integration
4. Test mobile checkout flow
5. Verify mobile payment success rate

#### Test Mobile Performance

1. Test page load times on mobile
2. Test touch interactions and gestures
3. Test mobile-specific animations
4. Verify mobile accessibility features
5. Test mobile analytics tracking

## Deployment Procedures

### 1. Staging Deployment

```bash
# Deploy to staging
vercel --target staging

# Run staging tests
pnpm test:staging

# Verify staging environment
curl https://staging.schwalbe.app/api/health
```

### 2. Production Deployment

```bash
# Deploy to production
vercel --target production

# Run production smoke tests
npm run test:production

# Verify production environment
curl https://schwalbe.app/api/health
```

### 3. Database Migration

```bash
# Apply production migrations
supabase db push --project-ref your-production-ref

# Verify migration success
supabase db diff --project-ref your-production-ref
```

### 4. Stripe Production Setup

1. Switch to live mode in Stripe Dashboard
2. Create production products and prices
3. Configure production webhook endpoints
4. Test production payment processing
5. Verify webhook processing in production

## Monitoring and Alerting

### 1. Set Up Monitoring

```bash
# Install monitoring tools
npm install @vercel/analytics @vercel/speed-insights

# Configure monitoring
echo "NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id" >> .env.production
```

### 2. Set Up Alerts

```bash
# Configure Stripe webhook monitoring
stripe events list --limit 10

# Set up payment failure alerts
curl -X POST https://api.stripe.com/v1/webhook_endpoints \
  -H "Authorization: Bearer sk_live_..." \
  -d "url=https://schwalbe.app/api/webhooks/stripe" \
  -d "enabled_events[]=invoice.payment_failed"
```

### 3. Monitor Key Metrics

- **Conversion Rate**: >15% from pricing page to paid subscription
- **Payment Success Rate**: >98% successful payment processing
- **Page Load Time**: <3 seconds for pricing page
- **Mobile Conversion**: >12% mobile conversion rate
- **Webhook Processing**: <2 seconds for subscription events

## Troubleshooting

### Common Issues

#### Stripe Integration Issues

```bash
# Check Stripe webhook logs
stripe events list --limit 50

# Test webhook endpoint
curl -X POST http://localhost:3000/api/webhooks/stripe \
  -H "Stripe-Signature: t=1234567890,v1=signature" \
  -d '{"type": "customer.subscription.created", "data": {...}}'
```

#### Database Connection Issues

```bash
# Check Supabase connection
supabase status

# Test database connection
psql "postgresql://postgres:password@localhost:54322/postgres"
```

#### Payment Processing Issues

```bash
# Check Stripe logs
stripe logs tail

# Test payment intent creation
stripe payment_intents create --amount 2000 --currency usd
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=stripe,supabase,schwalbe:* npm run dev

# Enable Stripe debug mode
STRIPE_DEBUG=true npm run dev
```

### Performance Issues

```bash
# Profile application performance
npm run build && npm start

# Check bundle size
npm run analyze

# Test performance
npm run test:performance
```

## Security Checklist

### 1. Payment Security

- [ ] PCI DSS compliance verified
- [ ] Stripe webhook signature verification enabled
- [ ] Payment method data never stored locally
- [ ] HTTPS enforced for all payment endpoints
- [ ] Fraud detection and monitoring active

### 2. Data Protection

- [ ] RLS policies enforced on all tables
- [ ] Sensitive data encrypted at rest
- [ ] Audit logging for all payment operations
- [ ] Data retention policies implemented
- [ ] GDPR compliance verified

### 3. API Security

- [ ] Rate limiting implemented
- [ ] Input validation and sanitization
- [ ] Authentication required for all endpoints
- [ ] CORS properly configured
- [ ] Security headers implemented

## Support and Maintenance

### 1. Regular Maintenance

- **Daily**: Monitor payment success rates and webhook processing
- **Weekly**: Review conversion metrics and A/B testing results
- **Monthly**: Analyze subscription analytics and churn rates
- **Quarterly**: Security audit and compliance review

### 2. Backup Procedures

```bash
# Backup database
supabase db dump --project-ref your-project-ref > backup.sql

# Backup Stripe data
stripe events list --limit 1000 > stripe_events.json
```

### 3. Update Procedures

```bash
# Update dependencies
npm update

# Run tests after updates
npm test

# Deploy updates
vercel --target production
```

## Conclusion

This quick start guide provides comprehensive instructions for setting up and testing the Pricing & Conversion System for Schwalbe. Follow the procedures step-by-step to ensure a successful implementation and deployment.

For additional support or questions, refer to:

- **API Documentation**: `/docs/api/pricing-conversion.md`
- **Troubleshooting Guide**: `/docs/troubleshooting/pricing-conversion.md`
- **Security Guidelines**: `/docs/security/payment-processing.md`
- **Performance Optimization**: `/docs/performance/pricing-conversion.md`

Remember to test thoroughly in staging before deploying to production, and monitor key metrics continuously to ensure optimal performance and conversion rates.
