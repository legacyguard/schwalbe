import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, BadgeCheck, Timer } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SecurityFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
}


export function SecurityPromiseSection() {
  const { t } = useTranslation();

  const securityFeatures: SecurityFeature[] = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: t('security.bankLevel.title'),
      description: t('security.bankLevel.description')
    },
    {
      icon: <Lock className="h-8 w-8" />,
      title: t('security.zeroKnowledge.title'),
      description: t('security.zeroKnowledge.description')
    },
    {
      icon: <BadgeCheck className="h-8 w-8" />,
      title: t('security.soc2.title'),
      description: t('security.soc2.description')
    },
    {
      icon: <Timer className="h-8 w-8" />,
      title: t('security.monitoring.title'),
      description: t('security.monitoring.description')
    }
  ];

  return (
    <section className="py-24 bg-stone-100/50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-stone-800 mb-6">
            {t('security.title')}
          </h2>
          <p className="text-xl text-stone-600 max-w-3xl mx-auto">
            {t('security.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {securityFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/70 backdrop-blur-sm border border-stone-200/50 rounded-xl p-6 text-center group hover:border-amber-400/50 transition-all duration-300 shadow-lg"
            >
              <div className="text-amber-600 mb-4 flex justify-center group-hover:text-amber-500 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-stone-800 mb-3">
                {feature.title}
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <button className="text-amber-600 hover:text-amber-500 transition-colors underline decoration-dotted underline-offset-4">
            {t('security.learnMore')}
          </button>
        </motion.div>
      </div>
    </section>
  );
}