/**
 * Light Landing Page
 * Clean, earth-toned design after dawn animation
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue } from 'framer-motion';
import { ArrowRight, Shield, Heart, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SofiaChat } from '../sofia/SofiaChat';
import { LegacyGuardLogo } from '../LegacyGuardLogo';
import { SecurityPromiseSection } from './SecurityPromiseSection';
import { PricingSection } from './PricingSection';
import { MetaTags } from './MetaTags';
import { DawnAnimation } from './DawnAnimation';
import { useNavigate } from 'react-router-dom';

import { sendAnalytics } from '@/lib/analytics';

export default function LightLandingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showSofia, setShowSofia] = useState(false);
  const [sofiaMessage, setSofiaMessage] = useState('');
  const [showDawnAnimation, setShowDawnAnimation] = useState(true);
  const [showSofiaChat, setShowSofiaChat] = useState(false);
  const [sofiaPosition, setSofiaPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  useEffect(() => {
    sendAnalytics('premium_landing_view');
  }, []);

  const handleDawnAnimationComplete = () => {
    setShowDawnAnimation(false);
    setShowSofia(true);
    setSofiaMessage(t('landing:hero.sofiaWelcome'));
  };

  const handleStartJourney = () => {
    sendAnalytics('premium_landing_start_journey');
    window.location.href = '/auth/signup';
  };

  const handleLearnMore = () => {
    sendAnalytics('premium_landing_learn_more');
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleGetStarted = () => {
    sendAnalytics('landing_get_started');
    navigate('/auth/signup');
  };

  const handleSignIn = () => {
    sendAnalytics('landing_sign_in');
    navigate('/auth/signin');
  };

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Animated background elements for liquid glass effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      <MetaTags />

      {/* Dawn Animation Overlay */}
      {showDawnAnimation && (
        <DawnAnimation onAnimationComplete={handleDawnAnimationComplete} />
      )}


      {/* Show light content only after dawn animation */}
      {!showDawnAnimation && (
        <div className="relative z-30">
          {/* Light Hero section */}
          <section className="flex items-center justify-center px-6 py-24 pb-16">
            <div className="max-w-4xl mx-auto text-center space-y-8">

              {/* Main title */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="space-y-4"
              >
                <h1 className="text-6xl sm:text-8xl font-bold text-stone-800 leading-tight" dangerouslySetInnerHTML={{ __html: t('landing:hero.title') }}>
                </h1>
                <h2 className="text-3xl sm:text-4xl font-semibold text-stone-600">
                  {t('landing:hero.subtitle')}
                </h2>
              </motion.div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed"
              >
                {t('landing:hero.description')}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="flex flex-col sm:flex-row justify-center gap-4 mt-12"
              >
                <button
                  onClick={handleStartJourney}
                  className="group relative px-10 py-4 bg-amber-800 hover:bg-amber-700 text-white text-lg font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {t('landing:hero.ctaStartJourney')}
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>

                <button
                  onClick={handleLearnMore}
                  className="px-10 py-4 bg-transparent hover:bg-amber-100/20 text-amber-800 text-lg font-semibold rounded-2xl transition-all duration-300 border border-amber-600"
                >
                  {t('landing:hero.ctaLearnMore')}
                </button>
              </motion.div>

              {/* Sofia firefly - simple yellow dot */}
              <AnimatePresence>
                {showSofia && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute top-16 right-16 md:right-32 lg:right-1/4"
                  >
                    <motion.div
                      className="w-12 h-12 rounded-full cursor-pointer bg-white/20 backdrop-blur-xl border border-white/30 shadow-xl"
                      animate={{
                        boxShadow: [
                          '0 0 20px rgba(139, 92, 246, 0.4)',
                          '0 0 30px rgba(139, 92, 246, 0.6)',
                          '0 0 20px rgba(139, 92, 246, 0.4)'
                        ],
                        y: [0, -10, 0]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      onClick={() => {
                        setShowSofiaChat(true);
                      }}
                      whileHover={{ scale: 1.2, backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-400/60 to-blue-400/60 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-white/80"></div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* Light Features section */}
          <section id="features" className="pt-8 pb-24 px-6 relative bg-white/10 backdrop-blur-md">
            <div className="max-w-6xl mx-auto">

              {/* Section header */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl font-bold text-stone-800 mb-4">
                  {t('landing:features.title')}
                </h2>
                <p className="text-xl text-stone-600 max-w-2xl mx-auto">
                  {t('landing:features.subtitle')}
                </p>
              </motion.div>

              {/* Feature cards - light theme */}
              <div className="grid gap-8 md:grid-cols-3">
                {[
                  {
                    icon: Heart,
                    title: t('landing:features.act1.title'),
                    subtitle: t('landing:features.act1.subtitle'),
                    description: t('landing:features.act1.description'),
                  },
                  {
                    icon: Shield,
                    title: t('landing:features.act2.title'),
                    subtitle: t('landing:features.act2.subtitle'),
                    description: t('landing:features.act2.description'),
                  },
                  {
                    icon: Sparkles,
                    title: t('landing:features.act3.title'),
                    subtitle: t('landing:features.act3.subtitle'),
                    description: t('landing:features.act3.description'),
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.2 }}
                    viewport={{ once: true }}
                    className="group relative"
                  >
                    <div className="h-full p-8 rounded-3xl transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-xl hover:bg-white/30 hover:border-white/40">
                      {/* Icon */}
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                        style={{ backgroundColor: '#6B8E23' }}
                      >
                        <feature.icon size={28} style={{ color: '#90EE90' }} />
                      </div>

                      {/* Content */}
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xl font-bold text-stone-800 mb-1">
                            {feature.title}
                          </h3>
                          <p className="text-sm text-stone-500 font-medium">
                            {feature.subtitle}
                          </p>
                        </div>

                        <p className="text-stone-600 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Security Promise Section */}
          <SecurityPromiseSection />

          {/* Pricing Section */}
          <PricingSection />
        </div>
      )}

      {/* Sofia Chat System */}
      <SofiaChat
        isOpen={showSofiaChat}
        onClose={() => setShowSofiaChat(false)}
        position={sofiaPosition}
        initialMessage="Welcome! I'm Sofia, your AI guide. I can help you understand LegacyGuard, explain our security features, guide you through getting started, or answer any questions about protecting your digital legacy. What would you like to know?"
      />
    </div>
  );
}