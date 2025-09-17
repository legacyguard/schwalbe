
// src/components/landing/SecurityPromiseSection.tsx

import { useTranslation } from 'react-i18next';
import { BadgeCheck, KeyRound, ShieldCheck, Timer } from 'lucide-react';
import { Link } from 'react-router-dom';

const getFeatures = (t: any) => [
  {
    icon: <ShieldCheck className='h-10 w-10 text-yellow-400' />,
    title: t('features.0.title'),
    description: t('features.0.description'),
  },
  {
    icon: <KeyRound className='h-10 w-10 text-yellow-400' />,
    title: t('features.1.title'),
    description: t('features.1.description'),
  },
  {
    icon: <BadgeCheck className='h-10 w-10 text-yellow-400' />,
    title: t('features.2.title'),
    description: t('features.2.description'),
  },
  {
    icon: <Timer className='h-10 w-10 text-yellow-400' />,
    title: t('features.3.title'),
    description: t('features.3.description'),
  },
];

export const SecurityPromiseSection = () => {
  const { t } = useTranslation('landing/security-promise');
  const features = getFeatures(t);
  return (
    <section className='py-20 bg-slate-900/50'>
      <div className='container mx-auto px-6 text-center'>
        <h2 className='text-4xl font-bold text-white mb-4'>
          {t('title')}
        </h2>
        <p className='text-lg text-slate-300 mb-12 max-w-3xl mx-auto'>
          {t('subtitle')}
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {features.map((feature, index) => (
            <div
              key={index}
              className='bg-slate-800/60 p-8 rounded-lg shadow-md border border-slate-700 transform transition-transform duration-300 hover:scale-105 hover:shadow-xl'
            >
              <div className='mb-6 inline-block p-4 bg-yellow-400/10 rounded-full'>
                {feature.icon}
              </div>
              <h3 className='text-xl font-bold text-white mb-3'>
                {feature.title}
              </h3>
              <p className='text-slate-300'>{feature.description}</p>
            </div>
          ))}
        </div>

        <div className='mt-16'>
          <Link
            to='/security-deep-dive'
            className='text-slate-300 hover:text-yellow-400 transition-colors'
          >
            {t('learnMore.text')} {t('learnMore.arrow')}
          </Link>
        </div>
      </div>
    </section>
  );
};
