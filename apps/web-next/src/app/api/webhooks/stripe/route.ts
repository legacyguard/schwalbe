import { NextRequest, NextResponse } from 'next/server.js';
import Stripe from 'stripe';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { logger } from '@schwalbe/shared/lib/logger';

// Initialize Stripe (only if environment variables are available)
// Minimal Supabase database types used in this route
type Database = {
  public: {
    Tables: {
      processed_webhooks: {
        Row: {
          id: string;
          stripe_event_id: string;
          event_type: string;
          processed_at: string;
        };
        Insert: {
          stripe_event_id: string;
          event_type: string;
          processed_at: string;
        };
        Update: Partial<{
          stripe_event_id: string;
          event_type: string;
          processed_at: string;
        }>;
        Relationships: [];
      };
      user_profiles: {
        Row: {
          user_id: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          subscription_status: string | null;
          subscription_current_period_end: string | null;
          subscription_cancel_at_period_end: boolean | null;
          subscription_updated_at: string | null;
          payment_failed: boolean | null;
          payment_failed_at: string | null;
          payment_retry_count: number | null;
          stripe_customer_email: string | null;
          updated_at: string | null;
        };
        Insert: Partial<{
          user_id: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          subscription_status: string | null;
          subscription_current_period_end: string | null;
          subscription_cancel_at_period_end: boolean | null;
          subscription_updated_at: string | null;
          payment_failed: boolean | null;
          payment_failed_at: string | null;
          payment_retry_count: number | null;
          stripe_customer_email: string | null;
          updated_at: string | null;
        }>;
        Update: Partial<{
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          subscription_status: string | null;
          subscription_current_period_end: string | null;
          subscription_cancel_at_period_end: boolean | null;
          subscription_updated_at: string | null;
          payment_failed: boolean | null;
          payment_failed_at: string | null;
          payment_retry_count: number | null;
          stripe_customer_email: string | null;
          updated_at: string | null;
        }>;
        Relationships: [];
      };
      payment_history: {
        Row: {
          id: string;
          stripe_invoice_id: string | null;
          stripe_subscription_id: string;
          stripe_customer_id: string;
          amount: number;
          currency: string;
          status: string;
          paid_at: string | null;
          failed_at: string | null;
          attempt_count: number | null;
        };
        Insert: {
          stripe_invoice_id?: string | null;
          stripe_subscription_id: string;
          stripe_customer_id: string;
          amount: number;
          currency: string;
          status: string;
          paid_at?: string | null;
          failed_at?: string | null;
          attempt_count?: number | null;
        };
        Update: Partial<{
          stripe_invoice_id: string | null;
          stripe_subscription_id: string;
          stripe_customer_id: string;
          amount: number;
          currency: string;
          status: string;
          paid_at: string | null;
          failed_at: string | null;
          attempt_count: number | null;
        }>;
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};

let stripe: Stripe | null = null;
let supabaseAdmin: SupabaseClient<Database> | null = null;
let endpointSecret: string | null = null;

try {
  if (process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia' as any,
    });

    supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || null;
  }
} catch (error) {
  // Silently fail during build time
  console.warn('Stripe webhook initialization failed:', error);
}

export async function POST(request: NextRequest) {
  // Check if services are initialized
  if (!stripe || !supabaseAdmin || !endpointSecret) {
    logger.error('Stripe webhook services not initialized');
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }

  const s = stripe as Stripe;
  const sb = supabaseAdmin as SupabaseClient<Database>;

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    logger.warn('Stripe webhook called without signature');
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = s.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (err: any) {
    logger.error('Stripe webhook signature verification failed', {
      action: 'webhook_signature_verification',
      metadata: { error: err.message },
    });
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Check idempotency - prevent duplicate processing
  const { data: existingWebhook } = await sb
    .from('processed_webhooks')
    .select('id')
    .eq('stripe_event_id', event.id)
    .single();

  if (existingWebhook) {
    logger.info('Stripe webhook already processed', {
      action: 'webhook_duplicate',
      metadata: { eventId: event.id },
    });
    return NextResponse.json({ received: true, skipped: true });
  }

  try {
    // Record webhook as processed (idempotency key)
    await sb.from('processed_webhooks').insert({
      stripe_event_id: event.id,
      event_type: event.type,
      processed_at: new Date().toISOString(),
    });

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event, sb);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event, s, sb);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event, sb);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event, sb);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event, sb);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event, sb);
        break;

      case 'payment_method.attached':
        await handlePaymentMethodAttached(event, s);
        break;

      case 'customer.updated':
        await handleCustomerUpdated(event, sb);
        break;

      default:
        logger.info('Unhandled Stripe webhook event type', {
          action: 'webhook_unhandled',
          metadata: { eventType: event.type },
        });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    logger.error('Stripe webhook processing failed', {
      action: 'webhook_processing',
      metadata: {
        eventId: event.id,
        eventType: event.type,
        error: error.message,
      },
    });

    // Return 200 to prevent Stripe from retrying
    // Log the error for manual investigation
    return NextResponse.json({ received: true, error: 'Processing failed' });
  }
}

// Handler functions for different event types

async function handleCheckoutSessionCompleted(event: Stripe.Event, sb: SupabaseClient<Database>) {
  const session = event.data.object as Stripe.Checkout.Session;
  
  logger.info('Checkout session completed', {
    action: 'checkout_completed',
    userId: session.client_reference_id || undefined,
    metadata: {
      sessionId: session.id,
      customerId: session.customer,
      subscriptionId: session.subscription,
    },
  });

  // Update user subscription status
  if (session.client_reference_id && session.subscription) {
    await sb
      .from('user_profiles')
      .update({
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
        subscription_status: 'active',
        subscription_updated_at: new Date().toISOString(),
      })
      .eq('user_id', session.client_reference_id);
  }
}

async function handleSubscriptionCreated(event: Stripe.Event, s: Stripe, sb: SupabaseClient<Database>) {
  const subscription = event.data.object as Stripe.Subscription;
  
  logger.info('Subscription created', {
    action: 'subscription_created',
    metadata: {
      subscriptionId: subscription.id,
      customerId: subscription.customer,
      status: subscription.status,
    },
  });

  // Get customer to find user
  const customer = await s.customers.retrieve(subscription.customer as string);
  if ('deleted' in customer && customer.deleted) return;

  const userId = customer.metadata?.userId;
  if (!userId) {
    logger.warn('Subscription created without userId in customer metadata', {
      action: 'subscription_created_no_user',
      metadata: { customerId: subscription.customer },
    });
    return;
  }

  // Update user profile
  await sb
    .from('user_profiles')
    .update({
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      subscription_current_period_end: (subscription as any).current_period_end ? new Date((subscription as any).current_period_end * 1000).toISOString() : null,
      subscription_updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);
}

async function handleSubscriptionUpdated(event: Stripe.Event, sb: SupabaseClient<Database>) {
  const subscription = event.data.object as Stripe.Subscription;
  
  logger.info('Subscription updated', {
    action: 'subscription_updated',
    metadata: {
      subscriptionId: subscription.id,
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });

  // Update subscription status in database
  await sb
    .from('user_profiles')
    .update({
      subscription_status: subscription.status,
      subscription_current_period_end: (subscription as any).current_period_end ? new Date((subscription as any).current_period_end * 1000).toISOString() : null,
      subscription_cancel_at_period_end: subscription.cancel_at_period_end,
      subscription_updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);
}

async function handleSubscriptionDeleted(event: Stripe.Event, sb: SupabaseClient<Database>) {
  const subscription = event.data.object as Stripe.Subscription;
  
  logger.info('Subscription deleted', {
    action: 'subscription_deleted',
    metadata: {
      subscriptionId: subscription.id,
      customerId: subscription.customer,
    },
  });

  // Mark subscription as canceled in database
  await sb
    .from('user_profiles')
    .update({
      subscription_status: 'canceled',
      subscription_updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);
}

async function handleInvoicePaymentSucceeded(event: Stripe.Event, sb: SupabaseClient<Database>) {
  const invoice = event.data.object as Stripe.Invoice;
  
  logger.info('Invoice payment succeeded', {
    action: 'invoice_payment_succeeded',
    metadata: {
      invoiceId: invoice.id,
      customerId: invoice.customer,
      amountPaid: invoice.amount_paid,
    },
  });

  // Record successful payment
  if ((invoice as any).subscription) {
    await sb
      .from('payment_history')
      .insert({
        stripe_invoice_id: invoice.id,
        stripe_subscription_id: (invoice as any).subscription as string,
        stripe_customer_id: invoice.customer as string,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        status: 'succeeded',
        paid_at: new Date().toISOString(),
      });

    // Clear any payment failure flags
    await sb
      .from('user_profiles')
      .update({
        payment_failed: false,
        payment_failed_at: null,
      })
      .eq('stripe_subscription_id', (invoice as any).subscription);
  }
}

async function handleInvoicePaymentFailed(event: Stripe.Event, sb: SupabaseClient<Database>) {
  const invoice = event.data.object as Stripe.Invoice;
  
  logger.error('Invoice payment failed', {
    action: 'invoice_payment_failed',
    metadata: {
      invoiceId: invoice.id,
      customerId: invoice.customer,
      attemptCount: invoice.attempt_count,
    },
  });

  // Record failed payment
  if ((invoice as any).subscription) {
    await sb
      .from('payment_history')
      .insert({
        stripe_invoice_id: invoice.id,
        stripe_subscription_id: (invoice as any).subscription as string,
        stripe_customer_id: invoice.customer as string,
        amount: invoice.amount_due,
        currency: invoice.currency,
        status: 'failed',
        failed_at: new Date().toISOString(),
        attempt_count: invoice.attempt_count,
      });

    // Set payment failure flag
    await sb
      .from('user_profiles')
      .update({
        payment_failed: true,
        payment_failed_at: new Date().toISOString(),
        payment_retry_count: invoice.attempt_count,
      })
      .eq('stripe_subscription_id', (invoice as any).subscription);

    // TODO: Trigger dunning email via Resend
    // This will be implemented when Resend is configured
  }
}

async function handlePaymentMethodAttached(event: Stripe.Event, s: Stripe) {
  const paymentMethod = event.data.object as Stripe.PaymentMethod;
  
  logger.info('Payment method attached', {
    action: 'payment_method_attached',
    metadata: {
      paymentMethodId: paymentMethod.id,
      customerId: paymentMethod.customer,
      type: paymentMethod.type,
    },
  });

  // Update default payment method if needed
  if (paymentMethod.customer) {
    const customer = await s.customers.retrieve(paymentMethod.customer as string);
    if ('deleted' in customer && customer.deleted) return;

    // Set as default if no default exists
    if (!customer.invoice_settings.default_payment_method) {
      await s.customers.update(paymentMethod.customer as string, {
        invoice_settings: {
          default_payment_method: paymentMethod.id,
        },
      });
    }
  }
}

async function handleCustomerUpdated(event: Stripe.Event, sb: SupabaseClient<Database>) {
  const customer = event.data.object as Stripe.Customer;
  
  logger.info('Customer updated', {
    action: 'customer_updated',
    metadata: {
      customerId: customer.id,
      email: customer.email,
    },
  });

  // Update customer information in database
  const userId = customer.metadata?.userId;
  if (userId) {
    await sb
      .from('user_profiles')
      .update({
        stripe_customer_email: customer.email,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
  }
}

// Export config for Next.js
export const runtime = 'edge';
export const preferredRegion = 'auto';