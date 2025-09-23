/**
 * Light Landing Page
 * Clean, earth-toned design after dawn animation
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue } from 'framer-motion';
import { ArrowRight, Shield, Heart, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SofiaFirefly } from '../sofia/SofiaFirefly';
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
    <div ref={containerRef} className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-stone-50 via-amber-50 to-orange-50">
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
                <h1 className="text-6xl sm:text-8xl font-bold text-stone-800 leading-tight">
                  Your Legacy is a Story
                </h1>
                <h2 className="text-3xl sm:text-4xl font-semibold text-stone-600">
                  Let's Make it a Legend
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
                  className="group relative px-10 py-4 bg-stone-800 hover:bg-stone-700 text-white text-lg font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {t('landing:hero.ctaStartJourney')}
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>

                <button
                  onClick={handleLearnMore}
                  className="px-10 py-4 bg-stone-100 hover:bg-stone-200 text-stone-800 text-lg font-semibold rounded-2xl transition-all duration-300 border border-stone-300"
                >
                  {t('landing:hero.ctaLearnMore')}
                </button>
              </motion.div>

              {/* Sofia firefly - interactive version */}
              <AnimatePresence>
                {showSofia && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute top-20 right-20"
                  >
                    <SofiaFirefly
                      size="md"
                      showDialog={true}
                      message="Hi! I'm Sofia, your AI guide. Click me to explore the app!"
                      onInteraction={() => {
                        console.log('Sofia clicked - open chat system');
                      }}
                      autofly={true}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* Light Features section */}
          <section id="features" className="pt-8 pb-24 px-6 relative bg-stone-50/50">
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
                    color: 'from-pink-400 to-rose-300'
                  },
                  {
                    icon: Shield,
                    title: t('landing:features.act2.title'),
                    subtitle: t('landing:features.act2.subtitle'),
                    description: t('landing:features.act2.description'),
                    color: 'from-blue-400 to-cyan-300'
                  },
                  {
                    icon: Sparkles,
                    title: t('landing:features.act3.title'),
                    subtitle: t('landing:features.act3.subtitle'),
                    description: t('landing:features.act3.description'),
                    color: 'from-purple-400 to-violet-300'
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
                    <div className="h-full p-8 rounded-3xl transition-all duration-300 group-hover:scale-105 bg-white/70 backdrop-blur-sm border border-stone-200/50 shadow-lg">
                      {/* Icon */}
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                        style={{
                          background: `linear-gradient(135deg, ${feature.color.replace('from-', '').replace('to-', ', ')})`
                        }}
                      >
                        <feature.icon size={28} className="text-white" />
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
    </div>
  );
}