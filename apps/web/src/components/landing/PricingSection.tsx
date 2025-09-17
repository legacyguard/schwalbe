import React from 'react';
import { logger } from '@schwalbe/shared/lib/logger';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Check, Shield, Star, Users } from 'lucide-react';
import { Button } from '@/stubs/ui';
import { cn } from '@/lib/utils';

interface PricingTier {
  badge?: string;
  cta: string;
  ctaAction: () => void;
  description: string;
  features: {
    description: string;
    title: string;
  }[];
  highlighted?: boolean;
  id: string;
  name: string;
  period?: string;
  price: string;
}

const PricingCard: React.FC<{ index: number; tier: PricingTier }> = ({
  tier,
  index,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      className={cn(
        'relative flex flex-col h-full p-8 rounded-2xl border transition-all duration-300',
        tier.highlighted
          ? 'bg-gradient-to-b from-yellow-500/5 to-transparent border-yellow-400/20 shadow-xl scale-105'
          : 'bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:border-yellow-400/20 hover:shadow-lg'
      )}
    >
      {tier.badge && (
        <div className='absolute -top-4 left-1/2 transform -translate-x-1/2'>
          <span className='inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-500 text-slate-900'>
            <Star className='w-3 h-3' />
            {tier.badge}
          </span>
        </div>
      )}

      <div className='mb-8'>
        <h3 className='text-2xl font-bold mb-2 text-white'>{tier.name}</h3>
        <div className='flex items-baseline mb-4'>
          <span className='text-4xl font-bold text-white'>{tier.price}</span>
          {tier.period && (
            <span className='text-slate-400 ml-2'>/ {tier.period}</span>
          )}
        </div>
        <p className='text-slate-300'>{tier.description}</p>
      </div>

      <div className='space-y-4 mb-8 flex-grow'>
        {tier.features.map((feature, idx) => (
          <div key={idx} className='flex gap-3'>
            <div className='flex-shrink-0 mt-1'>
              <Check className='w-5 h-5 text-yellow-400' />
            </div>
            <div>
              <div className='font-medium mb-1 text-white'>{feature.title}</div>
              <div className='text-sm text-slate-300'>
                {feature.description}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        onClick={tier.ctaAction}
        variant={tier.highlighted ? 'default' : 'outline'}
        className={cn(
          'w-full',
          tier.highlighted && 'bg-yellow-500 hover:bg-yellow-400 text-slate-900'
        )}
      >
        {tier.cta}
      </Button>
    </motion.div>
  );
};

export const PricingSection: React.FC = () => {
  const { t } = useTranslation('landing/pricing');

  async function startCheckout(plan: 'premium' | 'family' | 'essential') {
    // Require login for checkout
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/sign-up?plan=' + plan
        return
      }
      const origin = window.location.origin
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          plan,
          userId: user.id,
          successUrl: `${origin}/?checkout=success`,
          cancelUrl: `${origin}/?checkout=cancel`,
        },
      })
      if (error) throw error
      const url = (data as any)?.url as string | undefined
      if (url) {
        window.location.href = url
      }
    } catch {
      logger.error('Checkout failed')
      alert('Unable to start checkout. Please try again later.')
    }
  }

  const pricingTiers: PricingTier[] = [
    {
      id: 'free',
      name: t('tiers.free.name'),
      price: t('tiers.free.price'),
      description: t('tiers.free.description'),
      features: t('tiers.free.features', { returnObjects: true }) as { description: string; title: string; }[],
      cta: t('tiers.free.cta'),
      ctaAction: () => {
        window.location.href = '/sign-up'
      },
    },
    {
      id: 'premium',
      name: t('tiers.premium.name'),
      price: t('tiers.premium.price'),
      period: t('tiers.premium.period'),
      description: t('tiers.premium.description'),
      highlighted: true,
      badge: t('tiers.premium.badge'),
      features: t('tiers.premium.features', { returnObjects: true }) as { description: string; title: string; }[],
      cta: t('tiers.premium.cta'),
      ctaAction: () => startCheckout('premium'),
    },
    {
      id: 'family',
      name: t('tiers.family.name'),
      price: t('tiers.family.price'),
      period: t('tiers.family.period'),
      description: t('tiers.family.description'),
      features: t('tiers.family.features', { returnObjects: true }) as { description: string; title: string; }[],
      cta: t('tiers.family.cta'),
      ctaAction: () => startCheckout('family'),
    },
  ];

  return (
    <section className='relative py-24 px-6 lg:px-8 overflow-hidden'>
      {/* Background decoration */}
      <div className='absolute inset-0 -z-10'>
        <div className='absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-900' />
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-yellow-500/5 rounded-full blur-3xl' />
      </div>

      <div className='max-w-7xl mx-auto'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='text-center mb-16'
        >
          <h2 className='text-4xl md:text-5xl font-bold mb-4 text-white'>
            A Plan for Every Stage of Your Journey
          </h2>
          <p className='text-xl text-slate-300 max-w-3xl mx-auto'>
            Start for free with our mobile app, and upgrade when you're ready to
            build your complete legacy.
          </p>
        </motion.div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch'>
          {pricingTiers.map((tier, index) => (
            <PricingCard key={tier.id} tier={tier} index={index} />
          ))}
        </div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className='mt-16 flex flex-wrap justify-center items-center gap-8 text-sm text-slate-400'
        >
          <div className='flex items-center gap-2'>
            <Shield className='w-4 h-4' />
            <span>Bank-level encryption</span>
          </div>
          <div className='flex items-center gap-2'>
            <Users className='w-4 h-4' />
            <span>Trusted by 50,000+ families</span>
          </div>
          <div className='flex items-center gap-2'>
            <Check className='w-4 h-4' />
            <span>{t('policy.cancel_anytime', { defaultValue: 'Cancel anytime' })}</span>
          </div>
        </motion.div>

        {/* FAQ Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className='mt-12 text-center'
        >
          <p className='text-slate-400'>
            Have questions?{' '}
            <a href='#faq' className='text-yellow-400 hover:underline'>
              Check our FAQ
            </a>{' '}
            or{' '}
            <a href='#contact' className='text-yellow-400 hover:underline'>
              contact us
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
};