
import React, { useEffect, useState } from 'react';
import { Check, Crown, Loader2, Shield, Star, X } from 'lucide-react';
import { type SubscriptionLimits, subscriptionService } from '@hollywood/shared';

interface PricingPlanProps {
  billingCycle: 'month' | 'year';
  currentPlan?: string;
  isLoading?: boolean;
  onSubscribe: (plan: string) => void;
  plan: SubscriptionLimits;
}

const PricingPlan: React.FC<PricingPlanProps> = ({
  plan,
  currentPlan,
  billingCycle,
  onSubscribe,
  isLoading,
}) => {
  const isCurrentPlan = currentPlan === plan.plan;
  const isPremium = plan.plan === 'premium';
  const isFamily = plan.plan === 'family';
  const isEssential = plan.plan === 'essential';

  const getPlanIcon = () => {
    if (isPremium) return <Crown className='w-6 h-6' />;
    if (isFamily) return <Star className='w-6 h-6' />;
    if (isEssential) return <Shield className='w-6 h-6' />;
    return null;
  };

  const getPlanPrice = () => {
    const prices: Record<string, { month: number; year: number }> = {
      free: { month: 0, year: 0 },
      essential: { month: 9.99, year: 99.99 },
      family: { month: 19.99, year: 199.99 },
      premium: { month: 39.99, year: 399.99 },
    };
    return prices[plan.plan]?.[billingCycle] || 0;
  };

  const formatLimit = (limit: null | number) => {
    return limit === null ? 'Unlimited' : limit.toLocaleString();
  };

  const formatStorage = (mb: null | number) => {
    if (mb === null) return 'Unlimited';
    if (mb < 1024) return `${mb} MB`;
    return `${(mb / 1024).toFixed(0)} GB`;
  };

  return (
    <div
      className={`relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-2 transition-all ${
        isCurrentPlan
          ? 'border-blue-500 scale-105'
          : isPremium
            ? 'border-purple-200 dark:border-purple-800'
            : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      {isPremium && (
        <div className='absolute -top-4 left-1/2 transform -translate-x-1/2'>
          <span className='bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold'>
            MOST POPULAR
          </span>
        </div>
      )}

      <div className='flex items-center justify-between mb-4'>
        <div>
          <h3 className='text-2xl font-bold capitalize flex items-center gap-2'>
            {getPlanIcon()}
            {plan.plan}
          </h3>
          {isCurrentPlan && (
            <span className='text-sm text-blue-600 dark:text-blue-400'>
              Current Plan
            </span>
          )}
        </div>
        <div className='text-right'>
          <div className='text-3xl font-bold'>${getPlanPrice()}</div>
          <div className='text-sm text-gray-500'>per {billingCycle}</div>
        </div>
      </div>

      <div className='space-y-3 mb-6'>
        <div className='flex items-center gap-2'>
          <Check className='w-5 h-5 text-green-500 flex-shrink-0' />
          <span>{formatLimit(plan.max_documents)} documents</span>
        </div>
        <div className='flex items-center gap-2'>
          <Check className='w-5 h-5 text-green-500 flex-shrink-0' />
          <span>{formatStorage(plan.max_storage_mb)} storage</span>
        </div>
        <div className='flex items-center gap-2'>
          <Check className='w-5 h-5 text-green-500 flex-shrink-0' />
          <span>{formatLimit(plan.max_time_capsules)} time capsules</span>
        </div>
        <div className='flex items-center gap-2'>
          <Check className='w-5 h-5 text-green-500 flex-shrink-0' />
          <span>{formatLimit(plan.max_scans_per_month)} scans/month</span>
        </div>
        {plan.max_family_members > 1 && (
          <div className='flex items-center gap-2'>
            <Check className='w-5 h-5 text-green-500 flex-shrink-0' />
            <span>Up to {plan.max_family_members} family members</span>
          </div>
        )}
        <div className='flex items-center gap-2'>
          {plan.offline_access ? (
            <Check className='w-5 h-5 text-green-500 flex-shrink-0' />
          ) : (
            <X className='w-5 h-5 text-gray-400 flex-shrink-0' />
          )}
          <span className={!plan.offline_access ? 'text-gray-400' : ''}>
            Offline access
          </span>
        </div>
        <div className='flex items-center gap-2'>
          {plan.ai_features ? (
            <Check className='w-5 h-5 text-green-500 flex-shrink-0' />
          ) : (
            <X className='w-5 h-5 text-gray-400 flex-shrink-0' />
          )}
          <span className={!plan.ai_features ? 'text-gray-400' : ''}>
            AI features
          </span>
        </div>
        <div className='flex items-center gap-2'>
          {plan.advanced_search ? (
            <Check className='w-5 h-5 text-green-500 flex-shrink-0' />
          ) : (
            <X className='w-5 h-5 text-gray-400 flex-shrink-0' />
          )}
          <span className={!plan.advanced_search ? 'text-gray-400' : ''}>
            Advanced search
          </span>
        </div>
        <div className='flex items-center gap-2'>
          {plan.priority_support ? (
            <Check className='w-5 h-5 text-green-500 flex-shrink-0' />
          ) : (
            <X className='w-5 h-5 text-gray-400 flex-shrink-0' />
          )}
          <span className={!plan.priority_support ? 'text-gray-400' : ''}>
            Priority support
          </span>
        </div>
      </div>

      <button
        onClick={() => onSubscribe(plan.plan)}
        disabled={isCurrentPlan || isLoading || plan.plan === 'free'}
        className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
          isCurrentPlan
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
            : plan.plan === 'free'
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
              : isPremium
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className='w-5 h-5 animate-spin' />
            Processing...
          </>
        ) : isCurrentPlan ? (
          'Current Plan'
        ) : plan.plan === 'free' ? (
          'Free Forever'
        ) : (
          `Upgrade to ${plan.plan}`
        )}
      </button>
    </div>
  );
};

export const PricingPlans: React.FC = () => {
  // const { user } = useAuth();
  const user = null;
  const [plans, setPlans] = useState<SubscriptionLimits[]>([]);
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [billingCycle, setBillingCycle] = useState<'month' | 'year'>('month');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadPlansAndSubscription();
  }, []);

  const loadPlansAndSubscription = async () => {
    try {
      const [allPlans, subscription] = await Promise.all([
        subscriptionService.getAllPlans(),
        subscriptionService.getCurrentSubscription(),
      ]);

      setPlans(allPlans);
      if (subscription) {
        setCurrentPlan(subscription.plan);
        setBillingCycle(subscription.billing_cycle as 'month' | 'year');
      }
    } catch (error) {
      console.error('Error loading plans:', error);
      // toast.error('Failed to load pricing plans');
      console.error('Failed to load pricing plans');
    }
  };

  const handleSubscribe = async (planName: string) => {
    if (!user) {
      // toast.error('Please sign in to subscribe');
      console.error('Please sign in to subscribe');
      return;
    }

    setIsLoading(true);
    try {
      // Map plan names to Stripe price IDs
      const priceIds: Record<string, { month: string; year: string }> = {
        essential: {
          month: 'price_1S2AU9Fjl1oRWeU60ajoUhTz',
          year: 'price_1S2AU9Fjl1oRWeU6Crewzj5D',
        },
        family: {
          month: 'price_1S2AUAFjl1oRWeU6RGjCZX6S',
          year: 'price_1S2AUAFjl1oRWeU63cvXIf9o',
        },
        premium: {
          month: 'price_1S2AUAFjl1oRWeU64RKuOu7B',
          year: 'price_1S2AUBFjl1oRWeU6587z8bLh',
        },
      };

      const priceId = priceIds[planName]?.[billingCycle];
      if (!priceId) {
        throw new Error('Invalid plan selection');
      }

      // const { url } = await stripeService.createCheckoutSession(
      //   priceId,
      //   window.location.origin + '/subscription/success',
      //   window.location.origin + '/subscription/cancel'
      // );
      const url = null;

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      // toast.error('Failed to start checkout process');
      console.error('Failed to start checkout process');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='max-w-7xl mx-auto px-4 py-12'>
      <div className='text-center mb-8'>
        <h2 className='text-3xl font-bold mb-4'>Choose Your Plan</h2>
        <p className='text-gray-600 dark:text-gray-400 mb-6'>
          Secure your documents with the plan that fits your needs
        </p>

        <div className='inline-flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1'>
          <button
            onClick={() => setBillingCycle('month')}
            className={`px-6 py-2 rounded-md transition-colors ${
              billingCycle === 'month'
                ? 'bg-white dark:bg-gray-700 shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('year')}
            className={`px-6 py-2 rounded-md transition-colors ${
              billingCycle === 'year'
                ? 'bg-white dark:bg-gray-700 shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Yearly
            <span className='ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded-full'>
              Save 17%
            </span>
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {plans.map(plan => (
          <PricingPlan
            key={plan.plan}
            plan={plan}
            currentPlan={currentPlan}
            billingCycle={billingCycle}
            onSubscribe={handleSubscribe}
            isLoading={isLoading}
          />
        ))}
      </div>

      <div className='mt-12 text-center text-sm text-gray-600 dark:text-gray-400'>
        <p>
          All plans include 256-bit encryption, automatic backups, and 24/7
          support
        </p>
        <p className='mt-2'>Cancel or change your plan anytime</p>
      </div>
    </div>
  );
};
