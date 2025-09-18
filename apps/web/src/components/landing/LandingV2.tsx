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
    <main className="min-h-screen bg-slate-900 text-slate-100">
      {/* Hero Section */}
      <section data-section="hero" className="px-6 py-20 bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            LegacyGuard
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Secure your family's future with intelligent document management and AI-powered guidance.
            Protect what matters most with peace of mind.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              aria-label="Get Started"
              className="inline-flex items-center px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 font-semibold transition-colors"
              onClick={() => sendAnalytics('landing_cta_click', { cta: 'hero' })}
            >
              Get Started Free
            </button>
            <button
              aria-label="Learn More"
              className="inline-flex items-center px-8 py-3 rounded-lg border border-slate-600 hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 font-semibold transition-colors"
              onClick={() => sendAnalytics('landing_cta_click', { cta: 'learn_more' })}
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section data-section="features" className="px-6 py-20 bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose LegacyGuard?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg bg-slate-800">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Military-Grade Security</h3>
              <p className="text-slate-300">AES-256 encryption and biometric authentication protect your sensitive documents.</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-slate-800">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">AI-Powered Guidance</h3>
              <p className="text-slate-300">Sofia, our AI assistant, provides personalized guidance throughout your journey.</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-slate-800">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌳</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Gamified Experience</h3>
              <p className="text-slate-300">Grow your legacy tree as you complete protection milestones and achievements.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section data-section="value" className="px-6 py-20 bg-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Protect Your Family's Future</h2>
          <p className="text-xl text-slate-300 mb-8">
            From wills and estate planning to emergency contacts and digital assets,
            LegacyGuard provides comprehensive protection with gentle, step-by-step guidance.
          </p>
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="p-4 rounded-lg bg-slate-700">
              <h4 className="font-semibold mb-2">📄 Document Management</h4>
              <p className="text-sm text-slate-300">Securely store and organize all important family documents</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-700">
              <h4 className="font-semibold mb-2">👥 Family Access Control</h4>
              <p className="text-sm text-slate-300">Manage who can access documents in emergencies</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-700">
              <h4 className="font-semibold mb-2">📱 Cross-Platform</h4>
              <p className="text-sm text-slate-300">Access your documents from web and mobile devices</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-700">
              <h4 className="font-semibold mb-2">🎯 Guided Workflows</h4>
              <p className="text-sm text-slate-300">Step-by-step guidance for complex legal processes</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section data-section="cta" className="px-6 py-20 bg-gradient-to-r from-blue-900 to-purple-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Secure Your Legacy?</h2>
          <p className="text-xl text-slate-300 mb-8">
            Join thousands of families who trust LegacyGuard to protect their most important documents.
          </p>
          <button
            aria-label="Start Free Trial"
            className="inline-flex items-center px-8 py-4 rounded-lg bg-white text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white font-semibold text-lg transition-colors"
            onClick={() => sendAnalytics('landing_cta_click', { cta: 'final' })}
          >
            Start Free Trial
          </button>
          <p className="text-sm text-slate-400 mt-4">No credit card required • 14-day free trial</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 bg-slate-900 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center text-slate-400">
          <p>&copy; 2024 LegacyGuard. Protecting families, preserving legacies.</p>
        </div>
      </footer>
    </main>
  );
}