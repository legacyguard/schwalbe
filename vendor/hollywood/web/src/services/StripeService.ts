
/**
 * Stripe Payment Service for Web Application
 * Handles subscription management and payment processing
 */

import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { supabase } from '@/integrations/supabase/client';

// Initialize Stripe
const STRIPE_PUBLISHABLE_KEY =
  'pk_test_51RxUMeFjl1oRWeU6A9rKrirRWWBPXBjASe0rmT36UdyZ63MsFbWe1WaWdIkQpaoLc1dkhywr4d1htlmvOnjKIsa300ZlWOPgvf';
let stripePromise: Promise<null | Stripe>;

export interface PricingPlan {
  currency: string;
  features: string[];
  id: string;
  interval: 'month' | 'year';
  name: 'essential' | 'family' | 'free' | 'premium';
  price: number;
  stripePriceId: string;
}

// Stripe Price IDs (you'll need to create these in Stripe Dashboard)
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'free',
    price: 0,
    currency: 'EUR',
    interval: 'month',
    stripePriceId: '',
    features: [
      '10 documents',
      '100MB storage',
      '5 scans per month',
      'Basic support',
    ],
  },
  {
    id: 'essential_monthly',
    name: 'essential',
    price: 9.99,
    currency: 'EUR',
    interval: 'month',
    stripePriceId: 'price_essential_monthly', // Replace with actual Stripe Price ID
    features: [
      '100 documents',
      '1GB storage',
      '50 scans per month',
      'Advanced OCR',
      'Email support',
    ],
  },
  {
    id: 'essential_yearly',
    name: 'essential',
    price: 99.99,
    currency: 'EUR',
    interval: 'year',
    stripePriceId: 'price_essential_yearly', // Replace with actual Stripe Price ID
    features: [
      '100 documents',
      '1GB storage',
      '50 scans per month',
      'Advanced OCR',
      'Email support',
      '2 months free',
    ],
  },
  {
    id: 'family_monthly',
    name: 'family',
    price: 19.99,
    currency: 'EUR',
    interval: 'month',
    stripePriceId: 'price_family_monthly', // Replace with actual Stripe Price ID
    features: [
      '500 documents',
      '5GB storage',
      '200 scans per month',
      'Family sharing',
      'Will generator',
      'Priority support',
    ],
  },
  {
    id: 'family_yearly',
    name: 'family',
    price: 199.99,
    currency: 'EUR',
    interval: 'year',
    stripePriceId: 'price_family_yearly', // Replace with actual Stripe Price ID
    features: [
      '500 documents',
      '5GB storage',
      '200 scans per month',
      'Family sharing',
      'Will generator',
      'Priority support',
      '2 months free',
    ],
  },
  {
    id: 'premium_monthly',
    name: 'premium',
    price: 39.99,
    currency: 'EUR',
    interval: 'month',
    stripePriceId: 'price_premium_monthly', // Replace with actual Stripe Price ID
    features: [
      'Unlimited documents',
      'Unlimited storage',
      'Unlimited scans',
      'API access',
      'White-label options',
      'Dedicated support',
    ],
  },
  {
    id: 'premium_yearly',
    name: 'premium',
    price: 399.99,
    currency: 'EUR',
    interval: 'year',
    stripePriceId: 'price_premium_yearly', // Replace with actual Stripe Price ID
    features: [
      'Unlimited documents',
      'Unlimited storage',
      'Unlimited scans',
      'API access',
      'White-label options',
      'Dedicated support',
      '2 months free',
    ],
  },
];

export class StripeService {
  private static instance: StripeService;

  private constructor() {}

  static getInstance(): StripeService {
    if (!StripeService.instance) {
      StripeService.instance = new StripeService();
    }
    return StripeService.instance;
  }

  /**
   * Get Stripe instance
   */
  async getStripe(): Promise<null | Stripe> {
    if (!stripePromise) {
      stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
    }
    return stripePromise;
  }

  /**
   * Create checkout session for subscription
   */
  async createCheckoutSession(
    priceId: string,
    userId: string,
    successUrl: string,
    cancelUrl: string,
    feature?: string
  ): Promise<null | { sessionId: string; url: string }> {
    try {
      const { data, error } = await supabase.functions.invoke(
        'create-checkout-session',
        {
          body: {
            priceId,
            userId,
            successUrl,
            cancelUrl,
            metadata: {
              userId,
              feature: feature || 'general_upgrade',
            },
          },
        }
      );

      if (error) {
        console.error('Error creating checkout session:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return null;
    }
  }

  /**
   * Redirect to Stripe Checkout
   */
  async redirectToCheckout(sessionId: string): Promise<void> {
    const stripe = await this.getStripe();
    if (!stripe) {
      console.error('Stripe not loaded');
      return;
    }

    const { error } = await stripe.redirectToCheckout({ sessionId });
    if (error) {
      console.error('Error redirecting to checkout:', error);
    }
  }

  /**
   * Create subscription upgrade flow
   */
  async upgradeSubscription(planId: string, feature?: string): Promise<void> {
    const plan = PRICING_PLANS.find(p => p.id === planId);
    if (!plan || !plan.stripePriceId) {
      console.error('Invalid plan selected');
      return;
    }

    const user = await this.getCurrentUser();
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    const successUrl = `${window.location.origin}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${window.location.origin}/upgrade/cancel`;

    const session = await this.createCheckoutSession(
      plan.stripePriceId,
      user.id,
      successUrl,
      cancelUrl,
      feature
    );

    if (session) {
      await this.redirectToCheckout(session.sessionId);
    }
  }

  /**
   * Create customer portal session
   */
  async createPortalSession(returnUrl: string): Promise<null | string> {
    try {
      const { data, error } = await supabase.functions.invoke(
        'create-portal-session',
        {
          body: { returnUrl },
        }
      );

      if (error) {
        console.error('Error creating portal session:', error);
        return null;
      }

      return data.url;
    } catch (error) {
      console.error('Error creating portal session:', error);
      return null;
    }
  }

  /**
   * Manage subscription (opens Stripe Customer Portal)
   */
  async manageSubscription(): Promise<void> {
    const returnUrl = window.location.href;
    const portalUrl = await this.createPortalSession(returnUrl);

    if (portalUrl) {
      window.location.href = portalUrl;
    }
  }

  /**
   * Get current user subscription status
   */
  async getSubscriptionStatus(): Promise<null | {
    expiresAt?: string;
    plan: string;
    status: string;
  }> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        return { plan: 'free', status: 'active' };
      }

      return {
        plan: data.plan,
        status: data.status || 'active',
        expiresAt: (data as any).expires_at || data.current_period_end,
      };
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      return null;
    }
  }

  /**
   * Handle successful payment
   */
  async handlePaymentSuccess(sessionId: string): Promise<void> {
    // Verify the session with backend
    const { data, error } = await supabase.functions.invoke(
      'verify-checkout-session',
      {
        body: { sessionId },
      }
    );

    if (error) {
      console.error('Error verifying session:', error);
      return;
    }

    // Update local state
    if (data.success) {
      // Trigger UI update
      window.dispatchEvent(
        new CustomEvent('subscription-updated', {
          detail: { plan: data.plan },
        })
      );

      // Show success message
      this.showSuccessNotification(data.plan);
    }
  }

  /**
   * Get current user
   */
  private async getCurrentUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  }

  /**
   * Show success notification
   */
  private showSuccessNotification(plan: string) {
    const event = new CustomEvent('sofia-message', {
      detail: {
        message: `Congratulations! You've successfully upgraded to the ${plan} plan. All premium features are now unlocked!`,
        type: 'success',
        personality: 'adaptive',
      },
    });
    window.dispatchEvent(event);
  }

  /**
   * Check if user has access to a feature
   */
  async hasFeatureAccess(feature: string): Promise<boolean> {
    const subscription = await this.getSubscriptionStatus();
    if (!subscription) return false;

    const featureRequirements: Record<string, string[]> = {
      advanced_ocr: ['essential', 'family', 'premium'],
      family_sharing: ['family', 'premium'],
      will_generator: ['family', 'premium'],
      unlimited_storage: ['premium'],
      api_access: ['premium'],
    };

    const requiredPlans = featureRequirements[feature];
    if (!requiredPlans) return true; // Feature doesn't require special plan

    return requiredPlans.includes(subscription.plan);
  }

  /**
   * Get recommended plan for a feature
   */
  getRecommendedPlan(feature: string): null | PricingPlan {
    const featureToPlans: Record<string, string> = {
      advanced_ocr: 'essential',
      family_sharing: 'family',
      will_generator: 'family',
      unlimited_storage: 'premium',
      api_access: 'premium',
    };

    const recommendedPlanName = featureToPlans[feature];
    if (!recommendedPlanName) return null;

    // Return monthly plan by default
    return (
      PRICING_PLANS.find(
        p => p.name === recommendedPlanName && p.interval === 'month'
      ) || null
    );
  }
}
