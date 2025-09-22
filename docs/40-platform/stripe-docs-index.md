# Stripe Integration Documentation

This directory contains comprehensive documentation for the Stripe billing integration implemented in the schwalbe project.

## 📚 Documentation Index

### 📋 [Stripe Integration Overview](./stripe-integration.md)
**Main documentation file covering the complete integration.**

- Architecture overview and component relationships
- Complete setup process (automated and manual)
- Component descriptions and implementation details
- Testing strategies and monitoring
- Production deployment guide
- Troubleshooting and maintenance

### 🤖 [Setup Automation Guide](./stripe-setup-guide.md) 
**Detailed guide for the automated setup scripts.**

- Quick start commands
- Prerequisites and authentication
- Script-by-script breakdown
- Verification steps and troubleshooting
- Production deployment modifications
- Script customization options

### 🔌 [API Documentation](./stripe-api.md)
**Technical API reference for developers.**

- Supabase Edge Functions specifications
- Subscription Service API
- Database schema and relationships  
- Frontend integration patterns
- Error handling and security
- Rate limiting and usage controls

## 🚀 Quick Start

Get up and running in 3 commands:

```bash
# 1. Setup Stripe products, prices, and secrets
./setup-stripe.sh

# 2. Create webhook endpoint and configure secrets  
./setup-webhook.sh

# 3. View comprehensive setup summary
./stripe-setup-summary.sh
```

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend UI   │───▶│ stripe-checkout │───▶│ Stripe Checkout │
│   (Pricing)     │    │   Function      │    │   Session       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Supabase DB   │◀───│ stripe-webhook  │◀───│ Stripe Webhook  │
│ (Subscriptions) │    │   Function      │    │    Events       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐
│ Feature Gating  │
│  (OCR, Share,   │
│    Export)      │
└─────────────────┘
```

## 📦 What's Included

### ✅ **Complete Integration**
- Automated Stripe product and pricing setup
- Webhook endpoint creation and configuration  
- Supabase Edge Functions for checkout and webhook handling
- Database schema with subscription and usage tracking
- Feature gating service with entitlement checking
- Frontend pricing UI with direct checkout integration

### 🔧 **Automation Scripts**
- `setup-stripe.sh` - Creates products, prices, sets secrets
- `setup-webhook.sh` - Configures webhook endpoint
- `stripe-setup-summary.sh` - Shows setup status and testing info

### 📊 **Monitoring & Testing**
- Comprehensive error handling and logging
- Test card support and webhook simulation
- Usage tracking and limit enforcement
- Production deployment checklist

## 🎯 Key Features

### 💰 **Subscription Plans**
- **Free Plan**: Basic access, no premium features
- **Basic Plan**: OCR processing, document sharing (299 CZK / 12.90 EUR)
- **Pro Plan**: All features including export (799 CZK / 34.90 EUR)

### 🌍 **Multi-Currency Support**
- Automatic currency detection based on domain (.cz = CZK, others = EUR)
- Localized pricing display
- Currency-specific Stripe price configuration

### 🔒 **Security & Compliance**
- Webhook signature verification
- Row Level Security (RLS) on all user data
- No sensitive payment data stored locally
- Stripe-compliant PCI DSS handling

### 📈 **Usage Tracking**
- Real-time usage monitoring per feature
- Automatic limit enforcement
- Billing period usage resets
- Overage protection

## 🛠️ Technical Stack

- **Payment Processing**: Stripe Checkout & Subscriptions
- **Backend**: Supabase Edge Functions (Deno)
- **Database**: PostgreSQL with RLS
- **Frontend**: React/TypeScript 
- **Authentication**: Clerk
- **CLI Tools**: Stripe CLI, Supabase CLI

## 📋 Setup Requirements

### Prerequisites
```bash
# Install required tools
brew install stripe/stripe-cli/stripe
brew install supabase
brew install jq

# Authenticate
stripe login
supabase login
```

### Environment
- Stripe account (test mode for development)
- Supabase project with database access
- Domain configuration for currency detection

## 🧪 Testing

### Test Cards
- **Success**: `4242424242424242`
- **Decline**: `4000000000000002`
- **Insufficient**: `4000000000009995`

### Test Flow
1. Visit staging app pricing page
2. Click upgrade button → redirects to Stripe Checkout
3. Complete payment with test card
4. Webhook processes payment → updates subscription
5. Features unlock automatically

## 📈 Current Setup Status

After running the automation scripts, you have:

### 🏪 **Stripe Resources Created**
- Basic Plan Product (`prod_T49cwadzLjb9yN`)
- Pro Plan Product (`prod_T49cUpVgCBCiW8`)  
- 4 Price configurations (CZK/EUR for each plan)
- Webhook endpoint (`we_1S81KUFjl1oRWeU6seGem5Cs`)

### 🔐 **Secrets Configured**
- `STRIPE_SECRET_KEY` in Supabase Functions
- `STRIPE_WEBHOOK_SECRET` in Supabase Functions

### 🚀 **Functions Deployed**
- `stripe-checkout` - Creates checkout sessions
- `stripe-webhook` - Processes webhook events

## 🔍 Monitoring & Debugging

### 📊 **Dashboard Links**
- [Stripe Dashboard](https://dashboard.stripe.com)
- [Stripe Webhooks](https://dashboard.stripe.com/webhooks)  
- [Supabase Functions](https://supabase.com/dashboard/project/rnmqtqaegqpbpytqawpg/functions)

### 🔍 **Debug Commands**
```bash
# Check function logs
supabase functions log stripe-webhook --project-ref rnmqtqaegqpbpytqawpg

# Verify secrets
supabase secrets list --project-ref rnmqtqaegqpbpytqawpg

# Test webhook
stripe trigger checkout.session.completed
```

## 🚀 Production Deployment

When ready for production:

1. **Switch to Live Mode**: `stripe login --live`
2. **Update Project IDs**: Modify scripts for production Supabase project
3. **Update Webhook URLs**: Change to production domain
4. **Run Setup**: Execute automation scripts in production
5. **Test End-to-End**: Verify complete user journey

## 📞 Support

### 🐛 **Issues & Troubleshooting**
1. Check the [troubleshooting section](./stripe-integration.md#troubleshooting)
2. Review function logs in Supabase dashboard
3. Check Stripe dashboard for webhook/payment issues
4. Verify all secrets are properly set

### 📚 **Additional Resources**
- [Stripe API Documentation](https://stripe.com/docs/api)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)

### 🎯 **Next Steps**
- Test the complete user flow from signup to feature access
- Monitor webhook processing and error rates
- Plan for production deployment and live testing
- Consider adding analytics and conversion tracking

---

**🎉 Your Stripe integration is fully documented, automated, and ready for production deployment!**

The comprehensive documentation, automation scripts, and monitoring setup provide everything needed to maintain and scale your subscription billing system.