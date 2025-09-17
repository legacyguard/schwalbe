'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/icon-library';
import { Button } from '@/components/ui/button';

interface PricingFeature {
  icon: string;
  color: string;
  highlightGradient: string;
  hoverGradient: string;
}

export function PricingSection() {
  const t = useTranslations('ui/landing-page');
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];

  const handlePlanSelect = (planId: string) => {
    router.push(`/${locale}/sign-up?plan=${planId}`);
  };

  const features: PricingFeature[] = [
    {
      icon: 'shield',
      color: 'text-green-400',
      highlightGradient: 'from-green-500/20 to-emerald-500/20',
      hoverGradient: 'from-green-500/10 to-emerald-500/10',
    },
    {
      icon: 'bell',
      color: 'text-blue-400',
      highlightGradient: 'from-blue-500/20 to-indigo-500/20',
      hoverGradient: 'from-blue-500/10 to-indigo-500/10',
    },
    {
      icon: 'users',
      color: 'text-purple-400',
      highlightGradient: 'from-purple-500/20 to-violet-500/20',
      hoverGradient: 'from-purple-500/10 to-violet-500/10',
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-slate-800 to-slate-900">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              {t('pricing.title')}
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              {t('pricing.subtitle')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {['starter', 'professional', 'family'].map((plan, index) => (
              <motion.div
                key={plan}
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="bg-slate-900/80 backdrop-blur border border-slate-700 rounded-lg p-8 h-full">
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <div
                      className={`w-16 h-16 mb-6 relative mx-auto rounded-lg overflow-hidden`}
                    >
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${features[index].highlightGradient}`}
                      />
                      <div
                        className={`relative w-full h-full flex items-center justify-center ${features[index].color}`}
                      >
                        <Icon
                          name={features[index].icon}
                          className="w-8 h-8"
                        />
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2">
                      {t(`pricing.plans.${plan}.name`)}
                    </h3>
                    <div className="text-4xl font-bold text-white mb-4">
                      {t(`pricing.plans.${plan}.price`)}
                      <span className="text-lg text-slate-400">
                        {t(`pricing.plans.${plan}.period`)}
                      </span>
                    </div>
                    <p className="text-slate-300">
                      {t(`pricing.plans.${plan}.description`)}
                    </p>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-4 mb-8">
                    {[1, 2, 3, 4].map((featureIndex) => {
                      const featureKey = `pricing.plans.${plan}.features.${featureIndex}`;
                      return (
                        <li key={featureIndex} className="flex items-start gap-3">
                          <Icon
                            name="check"
                            className={`w-5 h-5 mt-0.5 ${features[index].color}`}
                          />
                          <span className="text-slate-300">
                            {t(featureKey)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handlePlanSelect(plan)}
                    className={`w-full bg-gradient-to-r ${features[index].highlightGradient} hover:${features[index].hoverGradient} border border-slate-700 text-white py-3 rounded-lg transition-all duration-300`}
                  >
                    {t('pricing.plans.cta')}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Trust Indicators */}
          <motion.div
            className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-slate-400"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true }}
          >
            {['guarantee', 'support', 'security', 'cancel'].map((indicator) => (
              <div key={indicator} className="flex items-center gap-2">
                <Icon
                  name="check-circle"
                  className="w-5 h-5 text-emerald-400"
                />
                <span>{t(`pricing.trust.${indicator}`)}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}