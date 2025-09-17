
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe('sk_test_51RxUMeFjl1oRWeU6boLX0xTnSSIzYdt9jcUQWUJx6FKsNX5uCqH55cqgjpYn0zayR5Y07T0XpePIM9N39CR7llo500XBtXellm', {
  apiVersion: '2023-10-16',
})

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req) => {
  try {
    // Parse request body
    const { priceId, userId, successUrl, cancelUrl, metadata } = await req.json()

    // Get or create Stripe customer
    const { data: userData, error: userError } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single()

    let customerId = userData?.stripe_customer_id

    if (!customerId) {
      // Get user email from auth
      const { data: authData, error: authError } = await supabase.auth.admin.getUserById(userId)
      
      if (authError) {
        throw new Error('Failed to get user data')
      }

      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: authData.user.email,
        metadata: {
          supabase_user_id: userId
        }
      })

      customerId = customer.id

      // Save customer ID to database
      await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: userId,
          stripe_customer_id: customerId,
          plan: 'free',
          created_at: new Date().toISOString()
        })
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        ...metadata,
        user_id: userId
      },
      subscription_data: {
        metadata: {
          user_id: userId
        }
      },
      billing_address_collection: 'auto',
      allow_promotion_codes: true,
      locale: 'auto',
    })

    return new Response(
      JSON.stringify({ 
        sessionId: session.id, 
        url: session.url 
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
