'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/icon-library';

export function SecurityPromiseSection() {
  const t = useTranslations('ui/landing-page');

  // The list of security features with their icons and animation props
  const securityFeatures = [
    {
      icon: 'lock',
      color: 'from-emerald-500 to-green-600',
      delay: 0.1,
      rotateDegree: -5,
    },
    {
      icon: 'shield',
      color: 'from-blue-500 to-indigo-600',
      delay: 0.2,
      rotateDegree: 5,
    },
    {
      icon: 'key',
      color: 'from-purple-500 to-violet-600',
      delay: 0.3,
      rotateDegree: -5,
    },
    {
      icon: 'server',
      color: 'from-red-500 to-rose-600',
      delay: 0.4,
      rotateDegree: 5,
    },
  ];

  return (
    <section className="py-24 bg-slate-800">
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
              {t('security.title')}
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              {t('security.subtitle')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {securityFeatures.map((feature, index) => (
              <motion.div
                key={feature.icon}
                className="relative"
                initial={{ opacity: 0, y: 20, rotate: feature.rotateDegree }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ duration: 0.6, delay: feature.delay }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, rotate: feature.rotateDegree / 2 }}
              >
                <div className="bg-slate-900/80 backdrop-blur border border-slate-700 rounded-lg p-6 h-full">
                  {/* Icon */}
                  <div className={`w-16 h-16 mb-6 relative mx-auto`}>
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-lg blur-lg opacity-20`}
                    />
                    <div
                      className={`relative w-full h-full bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center`}
                    >
                      <Icon
                        name={feature.icon}
                        className="w-8 h-8 text-white"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-white text-center mb-4">
                    {t(`security.features.${index}.title`)}
                  </h3>
                  <p className="text-slate-300 text-center leading-relaxed">
                    {t(`security.features.${index}.description`)}
                  </p>
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
            {['endToEndEncryption', 'bankLevelSecurity', 'zeroKnowledge', 'biometricAuth'].map(
              (indicator) => (
                <div key={indicator} className="flex items-center gap-2">
                  <Icon
                    name="check-circle"
                    className="w-5 h-5 text-emerald-400"
                  />
                  <span>{t(`security.indicators.${indicator}`)}</span>
                </div>
              )
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}