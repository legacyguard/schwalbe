# Stripe Setup Automation Guide

## Overview

This guide covers the automated Stripe setup process for the schwalbe project. The setup is fully automated through shell scripts that handle product creation, pricing configuration, webhook setup, and secret management.

## Quick Start

```bash
# 1. Run main setup (creates products, prices, sets secrets)
./setup-stripe.sh

# 2. Setup webhook (creates webhook endpoint, sets webhook secret)  
./setup-webhook.sh

# 3. View summary
./stripe-setup-summary.sh
```

## Prerequisites

Before running the setup scripts, ensure you have:

### Required Tools
- **Stripe CLI**: `brew install stripe/stripe-cli/stripe`
- **Supabase CLI**: `brew install supabase`  
- **jq**: `brew install jq`

### Authentication Required
```bash
# Login to Stripe (test mode)
stripe login

# Login to Supabase
supabase login
```

### Verify Prerequisites
```bash
# Check Stripe CLI is authenticated
stripe config --list

# Check Supabase access
supabase projects list
```

## Script Details

### 1. setup-stripe.sh

**Purpose**: Main setup script that creates Stripe products, prices, and basic configuration.

**What it does**:
1. ✅ Validates Stripe and Supabase CLI authentication
2. ✅ Creates Basic Plan product in Stripe
3. ✅ Creates Pro Plan product in Stripe  
4. ✅ Creates pricing for both plans in CZK and EUR currencies
5. ✅ Extracts Stripe secret key from CLI config
6. ✅ Sets `STRIPE_SECRET_KEY` in Supabase secrets
7. ✅ Provides instructions for webhook setup

**Pricing Created**:
- **Basic Plan CZK**: 299.00 CZK/month
- **Basic Plan EUR**: 12.90 EUR/month
- **Pro Plan CZK**: 799.00 CZK/month
- **Pro Plan EUR**: 34.90 EUR/month

**Output Example**:
```
🔧 Setting up Stripe integration for schwalbe...
✅ Stripe CLI ready
🛍️  Creating Stripe products and prices...
✅ Basic product created: prod_T49cwadzLjb9yN
✅ Pro product created: prod_T49cUpVgCBCiW8
✅ Basic CZK price created: price_1S81J7Fjl1oRWeU6JUreGpMu
✅ Basic EUR price created: price_1S81J8Fjl1oRWeU6sxBsU9yL
✅ Pro CZK price created: price_1S81J9Fjl1oRWeU6lSyWpU8S
✅ Pro EUR price created: price_1S81JAFjl1oRWeU6JNQNNAoK
✅ Found Stripe secret key
✅ Supabase CLI ready
🎉 Setup complete!
```

### 2. setup-webhook.sh

**Purpose**: Creates Stripe webhook endpoint and configures webhook secret.

**What it does**:
1. ✅ Creates webhook endpoint in Stripe pointing to Supabase function
2. ✅ Configures all required webhook events
3. ✅ Extracts webhook signing secret
4. ✅ Sets `STRIPE_WEBHOOK_SECRET` in Supabase secrets

**Webhook Configuration**:
- **URL**: `https://rnmqtqaegqpbpytqawpg.supabase.co/functions/v1/stripe-webhook`
- **Events**: 
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated` 
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

**Output Example**:
```
🪝 Setting up Stripe webhook for schwalbe...
✅ Webhook endpoint created
✅ Got webhook secret  
✅ Webhook secret set in Supabase
🎉 Webhook setup complete!
```

### 3. stripe-setup-summary.sh

**Purpose**: Displays comprehensive summary of the completed setup.

**What it shows**:
- ✅ All created Stripe products and price IDs
- ✅ Configured secrets in Supabase
- ✅ Webhook endpoint details
- ✅ Deployed function status
- 🔗 Useful dashboard links
- 🧪 Testing instructions
- 💡 Next steps for production

## Generated Resources

### Stripe Products & Prices

After setup completion, you'll have these resources in your Stripe account:

```
Basic Plan (prod_T49cwadzLjb9yN)
├── CZK Price: price_1S81J7Fjl1oRWeU6JUreGpMu (299.00 CZK/month)
└── EUR Price: price_1S81J8Fjl1oRWeU6sxBsU9yL (12.90 EUR/month)

Pro Plan (prod_T49cUpVgCBCiW8)  
├── CZK Price: price_1S81J9Fjl1oRWeU6lSyWpU8S (799.00 CZK/month)
└── EUR Price: price_1S81JAFjl1oRWeU6JNQNNAoK (34.90 EUR/month)
```

### Supabase Configuration

The following secrets will be set in your Supabase project:

```
STRIPE_SECRET_KEY=sk_test_51RxUMeFjl1oRWeU6HrGpLbFDN...
STRIPE_WEBHOOK_SECRET=whsec_0SWmK6AN1jLrmsqHAN2huyQkw0TahTFM
```

### Webhook Endpoint

Created webhook endpoint:
```
URL: https://rnmqtqaegqpbpytqawpg.supabase.co/functions/v1/stripe-webhook
ID: we_1S81KUFjl1oRWeU6seGem5Cs
Status: enabled
```

## Verification Steps

After running the setup scripts, verify everything is working:

### 1. Check Stripe Dashboard
- Visit [Stripe Products](https://dashboard.stripe.com/products)
- Verify Basic and Pro plans exist
- Check [Webhooks](https://dashboard.stripe.com/webhooks) for endpoint

### 2. Check Supabase Secrets
```bash
supabase secrets list --project-ref rnmqtqaegqpbpytqawpg
```

Should show:
```
NAME                  | DIGEST
STRIPE_SECRET_KEY     | 939dbce50f4ee...
STRIPE_WEBHOOK_SECRET | c49d924165890...
```

### 3. Test Function Deployment
```bash
# Redeploy functions to pick up new secrets
supabase functions deploy stripe-checkout --project-ref rnmqtqaegqpbpytqawpg
supabase functions deploy stripe-webhook --project-ref rnmqtqaegqpbpytqawpg
```

### 4. Test Checkout Function
```bash
curl -X POST "https://rnmqtqaegqpbpytqawpg.supabase.co/functions/v1/stripe-checkout" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"plan":"basic"}'
```

Should return checkout URL:
```json
{"url":"https://checkout.stripe.com/c/pay/cs_test_..."}
```

## Troubleshooting Setup Issues

### Common Setup Problems

#### 1. Stripe CLI Not Authenticated
```bash
# Error: "Please login to Stripe CLI first"
# Solution:
stripe login
```

#### 2. Supabase Project Not Found  
```bash
# Error: "supabase projects list failed"
# Solution:
supabase login
```

#### 3. Permission Denied on Scripts
```bash
# Error: "Permission denied"
# Solution:
chmod +x setup-stripe.sh setup-webhook.sh stripe-setup-summary.sh
```

#### 4. jq Command Not Found
```bash
# Error: "jq: command not found"  
# Solution:
brew install jq
```

#### 5. Webhook Creation Failed
```bash
# Error: "Invalid enabled_events"
# Solution: The script handles this automatically by using multiple --enabled-events flags
```

### Verify Dependencies

```bash
# Check all required tools
which stripe && echo "✅ Stripe CLI installed" || echo "❌ Stripe CLI missing"
which supabase && echo "✅ Supabase CLI installed" || echo "❌ Supabase CLI missing"  
which jq && echo "✅ jq installed" || echo "❌ jq missing"

# Check authentication status
stripe config --list | grep "test_mode_api_key" && echo "✅ Stripe authenticated" || echo "❌ Stripe not authenticated"
supabase projects list >/dev/null 2>&1 && echo "✅ Supabase authenticated" || echo "❌ Supabase not authenticated"
```

## Re-running Setup

If you need to run setup again:

### Clean Existing Resources (Optional)
```bash
# List and delete products if needed
stripe products list
stripe products update PRODUCT_ID --active=false

# List and delete webhook endpoints if needed  
stripe webhook_endpoints list
stripe webhook_endpoints delete WEBHOOK_ID
```

### Re-run Scripts
The scripts are designed to be idempotent, but Stripe will create duplicate resources if you run them multiple times. Consider cleaning up first or modifying the scripts to check for existing resources.

## Production Setup

When ready for production:

### 1. Switch to Live Mode
```bash
stripe login --live
```

### 2. Update Project Reference
Edit scripts to use production Supabase project:
```bash
# Change project-ref in scripts
--project-ref YOUR_PRODUCTION_PROJECT_ID
```

### 3. Update Webhook URL
Edit webhook URL in scripts for production domain:
```bash
--url="https://YOUR_PRODUCTION_DOMAIN.supabase.co/functions/v1/stripe-webhook"
```

### 4. Run Setup
```bash
./setup-stripe.sh
./setup-webhook.sh  
./stripe-setup-summary.sh
```

## Script Customization

### Modifying Pricing
To change pricing amounts, edit `setup-stripe.sh`:

```bash
# Current Basic plan pricing
--unit-amount=29900  # 299.00 CZK
--unit-amount=1290   # 12.90 EUR

# Current Pro plan pricing  
--unit-amount=79900  # 799.00 CZK
--unit-amount=3490   # 34.90 EUR
```

### Adding More Plans
To add additional plans, extend the script:

```bash
# Add after Pro plan creation
echo "Creating Enterprise plan product..."
ENTERPRISE_PRODUCT=$(stripe products create \
  --name="Enterprise Plan" \
  --description="Full-featured plan for businesses" | jq -r '.id')
```

### Different Currencies
To support additional currencies, add more price creation commands:

```bash
# Add USD pricing
stripe prices create \
  --product="$BASIC_PRODUCT" \
  --unit-amount=1490 \
  --currency=usd \
  --recurring.interval=month
```

---

## Support

If you encounter issues with the setup scripts:

1. Run the verification steps above
2. Check the troubleshooting section
3. Review script output for specific error messages  
4. Consult the main [Stripe Integration Documentation](./stripe-integration.md)

The automation scripts save significant time and reduce setup errors compared to manual configuration. They create a production-ready Stripe integration with proper security and monitoring configured.