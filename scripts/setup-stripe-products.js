import Stripe from 'stripe';
const stripe = new Stripe(
  'sk_test_51RxUMeFjl1oRWeU6boLX0xTnSSIzYdt9jcUQWUJx6FKsNX5uCqH55cqgjpYn0zayR5Y07T0XpePIM9N39CR7llo500XBtXellm'
);

async function setupStripeProducts() {
  console.log('🚀 Setting up Stripe test products and prices...\n');

  try {
    // Create products
    console.log('Creating products...');

    const essentialProduct = await stripe.products.create({
      name: 'Document Safe - Essential',
      description: 'Perfect for individuals who need reliable document storage',
      metadata: {
        plan: 'essential',
      },
    });
    console.log('✅ Created Essential product:', essentialProduct.id);

    const familyProduct = await stripe.products.create({
      name: 'Document Safe - Family',
      description: 'Ideal for families sharing important documents',
      metadata: {
        plan: 'family',
      },
    });
    console.log('✅ Created Family product:', familyProduct.id);

    const premiumProduct = await stripe.products.create({
      name: 'Document Safe - Premium',
      description: 'Ultimate protection with unlimited everything',
      metadata: {
        plan: 'premium',
      },
    });
    console.log('✅ Created Premium product:', premiumProduct.id);

    // Create prices
    console.log('\nCreating prices...');

    // Essential prices
    const essentialMonthly = await stripe.prices.create({
      product: essentialProduct.id,
      unit_amount: 999, // $9.99
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      lookup_key: 'price_essential_monthly',
      metadata: {
        plan: 'essential',
        billing_cycle: 'monthly',
      },
    });
    console.log('✅ Essential Monthly price:', essentialMonthly.id);

    const essentialYearly = await stripe.prices.create({
      product: essentialProduct.id,
      unit_amount: 9999, // $99.99
      currency: 'usd',
      recurring: {
        interval: 'year',
      },
      lookup_key: 'price_essential_yearly',
      metadata: {
        plan: 'essential',
        billing_cycle: 'yearly',
      },
    });
    console.log('✅ Essential Yearly price:', essentialYearly.id);

    // Family prices
    const familyMonthly = await stripe.prices.create({
      product: familyProduct.id,
      unit_amount: 1999, // $19.99
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      lookup_key: 'price_family_monthly',
      metadata: {
        plan: 'family',
        billing_cycle: 'monthly',
      },
    });
    console.log('✅ Family Monthly price:', familyMonthly.id);

    const familyYearly = await stripe.prices.create({
      product: familyProduct.id,
      unit_amount: 19999, // $199.99
      currency: 'usd',
      recurring: {
        interval: 'year',
      },
      lookup_key: 'price_family_yearly',
      metadata: {
        plan: 'family',
        billing_cycle: 'yearly',
      },
    });
    console.log('✅ Family Yearly price:', familyYearly.id);

    // Premium prices
    const premiumMonthly = await stripe.prices.create({
      product: premiumProduct.id,
      unit_amount: 3999, // $39.99
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      lookup_key: 'price_premium_monthly',
      metadata: {
        plan: 'premium',
        billing_cycle: 'monthly',
      },
    });
    console.log('✅ Premium Monthly price:', premiumMonthly.id);

    const premiumYearly = await stripe.prices.create({
      product: premiumProduct.id,
      unit_amount: 39999, // $399.99
      currency: 'usd',
      recurring: {
        interval: 'year',
      },
      lookup_key: 'price_premium_yearly',
      metadata: {
        plan: 'premium',
        billing_cycle: 'yearly',
      },
    });
    console.log('✅ Premium Yearly price:', premiumYearly.id);

    // Create webhook endpoint
    console.log('\nCreating webhook endpoint...');
    const webhook = await stripe.webhookEndpoints.create({
      url: 'https://lolnkpeipxwhhiukqboo.supabase.co/functions/v1/stripe-webhook',
      enabled_events: [
        'checkout.session.completed',
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'invoice.payment_succeeded',
        'invoice.payment_failed',
      ],
    });
    console.log('✅ Webhook endpoint created:', webhook.url);
    console.log('⚠️  IMPORTANT: Save this webhook secret for Supabase:');
    console.log('STRIPE_WEBHOOK_SECRET =', webhook.secret);

    // Print summary
    console.log('\n========================================');
    console.log('✨ Stripe setup completed successfully!');
    console.log('========================================\n');
    console.log('Price IDs created (using lookup keys):');
    console.log('  - price_essential_monthly');
    console.log('  - price_essential_yearly');
    console.log('  - price_family_monthly');
    console.log('  - price_family_yearly');
    console.log('  - price_premium_monthly');
    console.log('  - price_premium_yearly');
    console.log('\nWebhook endpoint:', webhook.url);
    console.log('\n⚠️  Next steps:');
    console.log('1. Add STRIPE_WEBHOOK_SECRET to Supabase Dashboard');
    console.log(
      '2. Test with Stripe test cards: https://stripe.com/docs/testing'
    );
    console.log('   - Success: 4242 4242 4242 4242');
    console.log('   - Decline: 4000 0000 0000 0002');

    // Update our Stripe service to use lookup keys instead of hardcoded price IDs
    console.log('\n📝 Updating Stripe service to use lookup keys...');

    return {
      webhookSecret: webhook.secret,
      priceIds: {
        essentialMonthly: essentialMonthly.id,
        essentialYearly: essentialYearly.id,
        familyMonthly: familyMonthly.id,
        familyYearly: familyYearly.id,
        premiumMonthly: premiumMonthly.id,
        premiumYearly: premiumYearly.id,
      },
    };
  } catch (error) {
    console.error('❌ Error setting up Stripe:', error.message);
    if (error.raw) {
      console.error('Details:', error.raw.message);
    }
    process.exit(1);
  }
}

// Run the setup
setupStripeProducts()
  .then(result => {
    console.log('\n✅ Setup complete!');
    console.log('\n📋 Configuration to save:');
    console.log(JSON.stringify(result, null, 2));
  })
  .catch(console.error);
