import Stripe from 'stripe';

const stripe = new Stripe(
  'sk_test_51RxUMeFjl1oRWeU6boLX0xTnSSIzYdt9jcUQWUJx6FKsNX5uCqH55cqgjpYn0zayR5Y07T0XpePIM9N39CR7llo500XBtXellm'
);

console.log('🧪 Testing Stripe Integration...\n');

async function testStripeIntegration() {
  try {
    // 1. List products
    console.log('📦 Fetching products...');
    const products = await stripe.products.list({ limit: 10 });
    console.log(`Found ${products.data.length} products:`);
    products.data.forEach(product => {
      console.log(`  - ${product.name} (${product.id})`);
    });

    // 2. List prices
    console.log('\n💰 Fetching prices...');
    const prices = await stripe.prices.list({ limit: 10 });
    console.log(`Found ${prices.data.length} prices:`);

    const priceDetails = [];
    for (const price of prices.data) {
      const product = products.data.find(p => p.id === price.product);
      priceDetails.push({
        plan: product?.name || 'Unknown',
        amount: `$${(price.unit_amount / 100).toFixed(2)}`,
        interval: price.recurring?.interval || 'one-time',
        id: price.id,
        lookup_key: price.lookup_key,
      });
    }

    console.table(priceDetails);

    // 3. Test webhook endpoint
    console.log('\n🔔 Webhook endpoint details:');
    const webhooks = await stripe.webhookEndpoints.list({ limit: 10 });
    webhooks.data.forEach(webhook => {
      console.log(`  URL: ${webhook.url}`);
      console.log(`  Status: ${webhook.status}`);
      console.log(`  Events: ${webhook.enabled_events.join(', ')}`);
    });

    // 4. Create a test checkout session
    console.log('\n🛒 Creating test checkout session...');
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_1S2AU9Fjl1oRWeU60ajoUhTz', // Essential monthly
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: 'https://example.com/success',
      cancel_url: 'https://example.com/cancel',
      metadata: {
        user_id: 'test-user-123',
        test_mode: 'true',
      },
    });

    console.log('✅ Test checkout session created!');
    console.log(`   Session ID: ${session.id}`);
    console.log(`   Checkout URL: ${session.url}`);

    console.log('\n========================================');
    console.log('✨ Stripe integration test completed!');
    console.log('========================================\n');

    console.log('📋 Test Card Numbers for checkout:');
    console.log('   Success: 4242 4242 4242 4242');
    console.log('   Requires authentication: 4000 0025 0000 3155');
    console.log('   Decline: 4000 0000 0000 0002');
    console.log('\n💳 Use any future expiry date and any 3-digit CVC');
    console.log('\n🔗 Test checkout URL (copy and paste in browser):');
    console.log(session.url);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.raw) {
      console.error('Details:', error.raw);
    }
  }
}

testStripeIntegration();
