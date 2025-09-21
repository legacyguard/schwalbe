
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe('sk_test_51RxUMeFjl1oRWeU6boLX0xTnSSIzYdt9jcUQWUJx6FKsNX5uCqH55cqgjpYn0zayR5Y07T0XpePIM9N39CR7llo500XBtXellm', {
  apiVersion: '2023-10-16',
})

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// This is your Stripe webhook secret - you'll get this from Stripe Dashboard
const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || 'whsec_test_secret'

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  
  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  try {
    const body = await req.text()
    const event = stripe.webhooks.constructEvent(body, signature, endpointSecret)

    console.log(`Processing webhook event: ${event.type}`)

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object)
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    })
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`)
    return new Response(
      JSON.stringify({ error: `Webhook Error: ${err.message}` }),
      { status: 400 }
    )
  }
})

async function handleCheckoutCompleted(session: any) {
  const userId = session.metadata?.user_id
  const customerId = session.customer
  const subscriptionId = session.subscription

  if (!userId) {
    console.error('No user_id in session metadata')
    return
  }

  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const priceId = subscription.items.data[0].price.id
  
  // Map price ID to plan name
  const plan = getPlanFromPriceId(priceId)

  // Update user subscription in database
  await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      plan: plan,
      status: 'active',
      billing_cycle: subscription.items.data[0].price.recurring?.interval || 'month',
      started_at: new Date(subscription.current_period_start * 1000).toISOString(),
      expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString()
    })

  // Reset usage limits for new billing period
  await supabase
    .from('user_usage')
    .upsert({
      user_id: userId,
      document_count: 0,
      storage_used_mb: 0,
      time_capsule_count: 0,
      scans_this_month: 0,
      offline_document_count: 0,
      last_reset_date: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })

  console.log(`Subscription created for user ${userId}: ${plan}`)
}

async function handleSubscriptionUpdate(subscription: any) {
  const userId = subscription.metadata?.user_id
  
  if (!userId) {
    console.error('No user_id in subscription metadata')
    return
  }

  const priceId = subscription.items.data[0].price.id
  const plan = getPlanFromPriceId(priceId)

  await supabase
    .from('user_subscriptions')
    .update({
      plan: plan,
      status: subscription.status,
      billing_cycle: subscription.items.data[0].price.recurring?.interval || 'month',
      expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id)

  console.log(`Subscription updated for user ${userId}: ${plan}`)
}

async function handleSubscriptionDeleted(subscription: any) {
  const userId = subscription.metadata?.user_id
  
  if (!userId) {
    console.error('No user_id in subscription metadata')
    return
  }

  // Downgrade to free plan
  await supabase
    .from('user_subscriptions')
    .update({
      plan: 'free',
      status: 'cancelled',
      stripe_subscription_id: null,
      expires_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id)

  console.log(`Subscription cancelled for user ${userId}`)
}

async function handlePaymentSucceeded(invoice: any) {
  const subscriptionId = invoice.subscription
  const customerId = invoice.customer

  // Update subscription status
  await supabase
    .from('user_subscriptions')
    .update({
      status: 'active',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscriptionId)

  console.log(`Payment succeeded for subscription ${subscriptionId}`)
}

async function handlePaymentFailed(invoice: any) {
  const subscriptionId = invoice.subscription
  const customerId = invoice.customer

  // Update subscription status
  await supabase
    .from('user_subscriptions')
    .update({
      status: 'past_due',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscriptionId)

  // TODO: Send email notification to user about failed payment

  console.log(`Payment failed for subscription ${subscriptionId}`)
}

function getPlanFromPriceId(priceId: string): string {
  // Map your Stripe Price IDs to plan names
  const priceMap: Record<string, string> = {
    'price_1S2AU9Fjl1oRWeU60ajoUhTz': 'essential', // essential monthly
    'price_1S2AU9Fjl1oRWeU6Crewzj5D': 'essential', // essential yearly
    'price_1S2AUAFjl1oRWeU6RGjCZX6S': 'family',    // family monthly
    'price_1S2AUAFjl1oRWeU63cvXIf9o': 'family',    // family yearly
    'price_1S2AUAFjl1oRWeU64RKuOu7B': 'premium',   // premium monthly
    'price_1S2AUBFjl1oRWeU6587z8bLh': 'premium',   // premium yearly
  }
  
  return priceMap[priceId] || 'free'
}
