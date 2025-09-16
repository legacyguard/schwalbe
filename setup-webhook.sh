#!/bin/bash

echo "🪝 Setting up Stripe webhook for schwalbe..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create webhook endpoint
echo "Creating webhook endpoint..."
WEBHOOK_DATA=$(stripe webhook_endpoints create \
  --url="https://rnmqtqaegqpbpytqawpg.supabase.co/functions/v1/stripe-webhook" \
  --enabled-events="checkout.session.completed,customer.subscription.created,customer.subscription.updated,customer.subscription.deleted,invoice.payment_succeeded,invoice.payment_failed")

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to create webhook endpoint${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Webhook endpoint created${NC}"

# Extract webhook secret
WEBHOOK_SECRET=$(echo "$WEBHOOK_DATA" | jq -r '.secret')

if [ "$WEBHOOK_SECRET" = "null" ] || [ -z "$WEBHOOK_SECRET" ]; then
    echo -e "${RED}Failed to get webhook secret${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Got webhook secret${NC}"

# Set webhook secret in Supabase
echo "Setting STRIPE_WEBHOOK_SECRET in Supabase..."
supabase secrets set STRIPE_WEBHOOK_SECRET="$WEBHOOK_SECRET" --project-ref rnmqtqaegqpbpytqawpg

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to set webhook secret in Supabase${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Webhook secret set in Supabase${NC}"

echo ""
echo -e "${GREEN}🎉 Webhook setup complete!${NC}"
echo ""
echo "📋 Summary:"
echo "✅ Created webhook endpoint: https://rnmqtqaegqpbpytqawpg.supabase.co/functions/v1/stripe-webhook"
echo "✅ Set STRIPE_WEBHOOK_SECRET in Supabase"
echo ""
echo "💡 Your Stripe integration is now fully configured!"