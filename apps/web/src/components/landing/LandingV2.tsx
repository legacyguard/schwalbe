import React from 'react';
import { useTranslation } from 'react-i18next';
import { sendAnalytics } from '@/lib/analytics';

export default function LandingV2() {
  const { t } = useTranslation('pages/landing');
  const { t: tButtons } = useTranslation('common/buttons');
  const { t: tNav } = useTranslation('common/navigation');

  React.useEffect(() => {
    sendAnalytics('landing_view');
  }, []);

  // Track section views via IntersectionObserver
  React.useEffect(() => {
    const sections = Array.from(document.querySelectorAll('[data-section]')) as HTMLElement[];
    if (!('IntersectionObserver' in window) || sections.length === 0) return;
    let timer: number | undefined;
    const seen = new Set<string>();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const id = (e.target as HTMLElement).dataset.section;
        if (!id) return;
        if (e.isIntersecting && !seen.has(id)) {
          seen.add(id);
          // Debounce beacons to avoid spamming
          window.clearTimeout(timer);
          timer = window.setTimeout(() => {
            sendAnalytics('landing_section_view', { id });
          }, 150);
        }
      });
    }, { rootMargin: '0px 0px -40% 0px', threshold: 0.2 });
    sections.forEach((el) => io.observe(el));
    return () => {
      try { io.disconnect(); } catch {}
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  // Reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Check if in demo mode
  const isDemoMode = !import.meta.env.VITE_SUPABASE_URL;

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100">
      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="bg-amber-600 text-amber-100 px-4 py-2 text-center text-sm animate-fade-in">
          {t('demo.banner')}
        </div>
      )}

      {/* Hero Section */}
      <section data-section="hero" className="px-6 py-20 bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent animate-fade-in">
            {t('hero.title')}
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto animate-slide-up">
            {t('hero.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <button
              aria-label={tButtons('getStarted')}
              className="btn-primary hover-lift animate-bounce-gentle"
              onClick={() => sendAnalytics('landing_cta_click', { cta: 'hero' })}
            >
              {t('hero.cta.main')}
            </button>
            <button
              aria-label={tButtons('learnMore')}
              className="btn-secondary hover-lift"
              onClick={() => sendAnalytics('landing_cta_click', { cta: 'learn_more' })}
            >
              {tButtons('learnMore')}
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section data-section="features" className="px-6 py-20 bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 animate-fade-in">{t('features.title')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card hover-lift animate-fade-in">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">{t('features.security.title')}</h3>
              <p className="text-slate-300">{t('features.security.description')}</p>
            </div>
            <div className="card hover-lift animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">{t('features.ai.title')}</h3>
              <p className="text-slate-300">{t('features.ai.description')}</p>
            </div>
            <div className="card hover-lift animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
                <span className="text-2xl">🌳</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">{t('features.legacy.title')}</h3>
              <p className="text-slate-300">{t('features.legacy.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section data-section="value" className="px-6 py-20 bg-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">{t('value.title')}</h2>
          <p className="text-xl text-slate-300 mb-8">
            {t('value.description')}
          </p>
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="p-4 rounded-lg bg-slate-700">
              <h4 className="font-semibold mb-2">📄 {t('value.features.documents.title')}</h4>
              <p className="text-sm text-slate-300">{t('value.features.documents.description')}</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-700">
              <h4 className="font-semibold mb-2">👥 {t('value.features.access.title')}</h4>
              <p className="text-sm text-slate-300">{t('value.features.access.description')}</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-700">
              <h4 className="font-semibold mb-2">📱 {t('value.features.platform.title')}</h4>
              <p className="text-sm text-slate-300">{t('value.features.platform.description')}</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-700">
              <h4 className="font-semibold mb-2">🎯 {t('value.features.guided.title')}</h4>
              <p className="text-sm text-slate-300">{t('value.features.guided.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section data-section="cta" className="px-6 py-20 bg-gradient-to-r from-blue-900 to-purple-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 animate-fade-in">{t('cta.title')}</h2>
          <p className="text-xl text-slate-300 mb-8 animate-slide-up">
            {t('cta.description')}
          </p>
          <button
            aria-label={t('cta.button')}
            className="inline-flex items-center px-8 py-4 rounded-lg bg-white text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white font-semibold text-lg transition-all duration-300 hover-lift animate-bounce-gentle"
            onClick={() => sendAnalytics('landing_cta_click', { cta: 'final' })}
          >
            {t('cta.button')}
          </button>
          <p className="text-sm text-slate-400 mt-4 animate-fade-in">{t('cta.disclaimer')}</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 bg-slate-900 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center text-slate-400">
          <p>{t('footer.copyright')}</p>
        </div>
      </footer>
    </main>
  );
}