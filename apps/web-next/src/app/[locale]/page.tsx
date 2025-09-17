import { useTranslations } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Metadata } from 'next';

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'landing-page' });
  
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export default function HomePage({ params: { locale } }: Props) {
  // Enable static rendering
  setRequestLocale(locale);
  
  const t = useTranslations('landing-page');

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            {t('hero.title')}
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
            {t('hero.subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors">
              {t('hero.cta.primary')}
            </button>
            <button className="border border-slate-600 hover:border-slate-500 text-white px-8 py-4 rounded-lg font-semibold transition-colors">
              {t('hero.cta.secondary')}
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-lg border border-slate-700">
              <h3 className="text-xl font-semibold text-white mb-3">
                {t('features.security.title')}
              </h3>
              <p className="text-slate-300">
                {t('features.security.description')}
              </p>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-lg border border-slate-700">
              <h3 className="text-xl font-semibold text-white mb-3">
                {t('features.family.title')}
              </h3>
              <p className="text-slate-300">
                {t('features.family.description')}
              </p>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-lg border border-slate-700">
              <h3 className="text-xl font-semibold text-white mb-3">
                {t('features.legal.title')}
              </h3>
              <p className="text-slate-300">
                {t('features.legal.description')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}