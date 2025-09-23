import React from 'react';
import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  featured?: boolean;
  ctaText: string;
}


export function PricingSection() {
  const { t } = useTranslation();

  const pricingPlans: PricingPlan[] = [
    {
      name: t('pricing.free.name'),
      price: t('pricing.free.price'),
      period: t('pricing.free.period'),
      description: t('pricing.free.description'),
      features: t('pricing.free.features', { returnObjects: true }) as string[],
      ctaText: t('pricing.free.cta')
    },
    {
      name: t('pricing.premium.name'),
      price: t('pricing.premium.price'),
      period: t('pricing.premium.period'),
      description: t('pricing.premium.description'),
      features: t('pricing.premium.features', { returnObjects: true }) as string[],
      featured: true,
      ctaText: t('pricing.premium.cta')
    },
    {
      name: t('pricing.family.name'),
      price: t('pricing.family.price'),
      period: t('pricing.family.period'),
      description: t('pricing.family.description'),
      features: t('pricing.family.features', { returnObjects: true }) as string[],
      ctaText: t('pricing.family.cta')
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-stone-800 mb-6">
            {t('pricing.title')}
          </h2>
          <p className="text-xl text-stone-600 max-w-3xl mx-auto">
            {t('pricing.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -8 }}
              className={`relative rounded-2xl p-8 backdrop-blur-sm border transition-all duration-300 shadow-lg ${
                plan.featured
                  ? 'bg-gradient-to-b from-amber-100/80 to-orange-100/80 border-amber-300/50 shadow-2xl shadow-amber-200/30'
                  : 'bg-white/70 border-stone-200/50 hover:border-amber-200/50'
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    {t('pricing.premium.featured')}
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-stone-800 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-stone-800">{plan.price}</span>
                  <span className="text-stone-600">/{plan.period}</span>
                </div>
                <p className="text-stone-600 text-sm">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-stone-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                  plan.featured
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl'
                    : 'bg-stone-800 text-white hover:bg-stone-700'
                }`}
              >
                {plan.ctaText}
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-stone-600 mb-4">
            {t('pricing.guarantee')}
          </p>
          <p className="text-sm text-stone-500">
            {t('pricing.terms')}
          </p>
        </motion.div>
      </div>
    </section>
  );
}