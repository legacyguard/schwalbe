import React from 'react';
import { useTranslation } from 'react-i18next';
import { sendAnalytics } from '@/lib/analytics';

export default function LandingV2() {
  const { t } = useTranslation('landingV2');

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

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 px-6 py-10">
      <section data-section="hero" className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">{t('heroTitle')}</h1>
        <p className="text-slate-300 mb-6">{t('heroSubtitle')}</p>
        <button
          aria-label={t('cta')}
          className="inline-flex items-center px-4 py-2 rounded bg-sky-600 hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400"
          onClick={() => sendAnalytics('landing_cta_click', { cta: 'hero' })}
        >
          {t('cta')}
        </button>
      </section>

      {/* Example additional section to validate section view beacons */}
      <section data-section="value" className="max-w-4xl mx-auto mt-24 text-center">
        <h2 className="text-2xl font-semibold mb-3">{t('valueTitle', { default: 'Why LegacyGuard?' })}</h2>
        <p className="text-slate-300">{t('valueCopy', { default: 'Clear steps, gentle guidance, and privacy-first protection.' })}</p>
      </section>
    </main>
  );
}