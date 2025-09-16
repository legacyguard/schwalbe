#!/bin/bash

echo "🔧 Setting up Stripe integration for schwalbe..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if logged in to Stripe
echo "📋 Checking Stripe CLI login status..."
if ! stripe --version > /dev/null 2>&1; then
    echo -e "${RED}Error: Stripe CLI not found${NC}"
    exit 1
fi

# Check if logged into Stripe
if ! stripe config --list | grep -q "test_mode_api_key\|live_mode_api_key" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Please login to Stripe CLI first:${NC}"
    echo "stripe login"
    exit 1
fi

echo -e "${GREEN}✅ Stripe CLI ready${NC}"

# Create products and prices
echo "🛍️  Creating Stripe products and prices..."

# Create Basic plan product
echo "Creating Basic plan product..."
BASIC_PRODUCT=$(stripe products create \
  --name="Basic Plan" \
  --description="Essential features for personal use" | jq -r '.id')

if [ "$BASIC_PRODUCT" = "null" ] || [ -z "$BASIC_PRODUCT" ]; then
    echo -e "${RED}Failed to create Basic product${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Basic product created: $BASIC_PRODUCT${NC}"

# Create Pro plan product
echo "Creating Pro plan product..."
PRO_PRODUCT=$(stripe products create \
  --name="Pro Plan" \
  --description="Advanced features for power users" | jq -r '.id')

if [ "$PRO_PRODUCT" = "null" ] || [ -z "$PRO_PRODUCT" ]; then
    echo -e "${RED}Failed to create Pro product${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Pro product created: $PRO_PRODUCT${NC}"

# Create prices for Basic plan (CZK)
echo "Creating Basic plan price (CZK)..."
BASIC_PRICE_CZK=$(stripe prices create \
  --product="$BASIC_PRODUCT" \
  --unit-amount=29900 \
  --currency=czk \
  --recurring.interval=month | jq -r '.id')

echo -e "${GREEN}✅ Basic CZK price created: $BASIC_PRICE_CZK${NC}"

# Create prices for Basic plan (EUR)
echo "Creating Basic plan price (EUR)..."
BASIC_PRICE_EUR=$(stripe prices create \
  --product="$BASIC_PRODUCT" \
  --unit-amount=1290 \
  --currency=eur \
  --recurring.interval=month | jq -r '.id')

echo -e "${GREEN}✅ Basic EUR price created: $BASIC_PRICE_EUR${NC}"

# Create prices for Pro plan (CZK)
echo "Creating Pro plan price (CZK)..."
PRO_PRICE_CZK=$(stripe prices create \
  --product="$PRO_PRODUCT" \
  --unit-amount=79900 \
  --currency=czk \
  --recurring.interval=month | jq -r '.id')

echo -e "${GREEN}✅ Pro CZK price created: $PRO_PRICE_CZK${NC}"

# Create prices for Pro plan (EUR)
echo "Creating Pro plan price (EUR)..."
PRO_PRICE_EUR=$(stripe prices create \
  --product="$PRO_PRODUCT" \
  --unit-amount=3490 \
  --currency=eur \
  --recurring.interval=month | jq -r '.id')

echo -e "${GREEN}✅ Pro EUR price created: $PRO_PRICE_EUR${NC}"

# Get webhook secret
echo "🔐 Setting up webhook endpoint..."
echo -e "${YELLOW}Please set up your webhook endpoint in Stripe Dashboard:${NC}"
echo "1. Go to https://dashboard.stripe.com/webhooks"
echo "2. Click 'Add endpoint'"
echo "3. Use URL: https://rnmqtqaegqpbpytqawpg.supabase.co/functions/v1/stripe-webhook"
echo "4. Select these events:"
echo "   - checkout.session.completed"
echo "   - customer.subscription.created"
echo "   - customer.subscription.updated" 
echo "   - customer.subscription.deleted"
echo "   - invoice.payment_succeeded"
echo "   - invoice.payment_failed"
echo ""
echo -e "${YELLOW}After creating the webhook, copy the signing secret (whsec_...) and run:${NC}"
echo "export STRIPE_WEBHOOK_SECRET='whsec_your_webhook_secret_here'"

# Get Stripe secret key
echo ""
echo "🔑 Getting Stripe secret key..."
STRIPE_SECRET_KEY=$(stripe config --list | grep "test_mode_api_key" | cut -d'=' -f2 | xargs | sed "s/'//g")

if [ -z "$STRIPE_SECRET_KEY" ]; then
    echo -e "${RED}Could not get Stripe secret key${NC}"
    echo "Please run: stripe login"
    exit 1
fi

echo -e "${GREEN}✅ Found Stripe secret key${NC}"

# Check if logged into Supabase
echo "📋 Checking Supabase CLI login status..."
if ! supabase projects list > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Please login to Supabase CLI first:${NC}"
    echo "supabase login"
    exit 1
fi

echo -e "${GREEN}✅ Supabase CLI ready${NC}"

# Set Supabase secrets
echo "🔐 Setting Supabase function secrets..."

echo "Setting STRIPE_SECRET_KEY..."
echo "$STRIPE_SECRET_KEY" | supabase secrets set STRIPE_SECRET_KEY --project-ref $(supabase projects list --output json | jq -r '.[] | select(.name == "schwalbe") | .id')

echo ""
echo -e "${GREEN}🎉 Setup complete!${NC}"
echo ""
echo "📋 Summary:"
echo "✅ Created Stripe products and prices"
echo "✅ Set STRIPE_SECRET_KEY in Supabase"
echo ""
echo "🚨 Important: You still need to:"
echo "1. Set up webhook endpoint in Stripe Dashboard (see instructions above)"
echo "2. Set STRIPE_WEBHOOK_SECRET in Supabase after creating webhook"
echo ""
echo "Price IDs created:"
echo "Basic CZK: $BASIC_PRICE_CZK"
echo "Basic EUR: $BASIC_PRICE_EUR" 
echo "Pro CZK: $PRO_PRICE_CZK"
echo "Pro EUR: $PRO_PRICE_EUR"
echo ""
echo "💡 You can save these to update your stripe-checkout function later if needed."