/**
 * Premium Night Landscape Landing Page
 * Apple-style liquid glass design with immersive animations
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Shield, Heart, Sparkles } from 'lucide-react';
import { SofiaFirefly } from '../sofia/SofiaFirefly';

import { sendAnalytics } from '@/lib/analytics';
import { PasswordWall } from '@/components/auth/PasswordWall';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
}

export default function PremiumLandingV3() {
  const [stars, setStars] = useState<Star[]>([]);
  const [showSofia, setShowSofia] = useState(false);
  const [sofiaMessage, setSofiaMessage] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  // Parallax transforms
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150]);
  const mountainsY = useTransform(scrollY, [0, 500], [0, 100]);
  const starsY = useTransform(scrollY, [0, 500], [0, 50]);

  // Generate stars
  useEffect(() => {
    const generateStars = () => {
      const newStars: Star[] = [];
      for (let i = 0; i < 100; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 80,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.8 + 0.2,
          twinkleSpeed: Math.random() * 3 + 2
        });
      }
      setStars(newStars);
    };

    generateStars();
    sendAnalytics('premium_landing_view');
  }, []);

  // Sofia entrance animation
  useEffect(() => {
    const sofiaTimer = setTimeout(() => {
      setShowSofia(true);
      setSofiaMessage('Welcome to your journey of protection and peace.');
    }, 2000);

    const messageTimer = setTimeout(() => {
      setSofiaMessage('Shall we begin building your legacy together?');
    }, 8000);

    return () => {
      clearTimeout(sofiaTimer);
      clearTimeout(messageTimer);
    };
  }, []);

  const handleStartJourney = () => {
    sendAnalytics('premium_landing_start_journey');
    window.location.href = '/auth/signup';
  };

  const handleLearnMore = () => {
    sendAnalytics('premium_landing_learn_more');
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <PasswordWall onAuthenticated={() => sendAnalytics('premium_landing_password_authenticated')}>
      <div ref={containerRef} className="relative min-h-screen overflow-x-hidden bg-slate-950">

        {/* Animated background layers */}
        <motion.div
          className="fixed inset-0 z-0"
          style={{ y: backgroundY }}
        >
          {/* Deep space gradient */}
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse at top, #1e1b4b 0%, #0f0a19 50%, #000000 100%),
                linear-gradient(180deg, #0c0a1f 0%, #1a1625 40%, #2d1b69 100%)
              `
            }}
          />

          {/* Aurora effect */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: `
                radial-gradient(ellipse 800px 400px at 30% 20%, #3b82f6 0%, transparent 50%),
                radial-gradient(ellipse 600px 300px at 70% 30%, #8b5cf6 0%, transparent 50%),
                radial-gradient(ellipse 400px 200px at 50% 40%, #06b6d4 0%, transparent 50%)
              `,
              filter: 'blur(100px)',
              animation: 'aurora 20s ease-in-out infinite'
            }}
          />
        </motion.div>

        {/* Twinkling stars */}
        <motion.div
          className="fixed inset-0 z-10"
          style={{ y: starsY }}
        >
          {stars.map((star) => (
            <motion.div
              key={star.id}
              className="absolute rounded-full bg-white"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: star.size,
                height: star.size
              }}
              animate={{
                opacity: [star.opacity * 0.3, star.opacity, star.opacity * 0.3],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                duration: star.twinkleSpeed,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>

        {/* Mountain silhouettes */}
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-20"
          style={{ y: mountainsY }}
        >
          <svg
            viewBox="0 0 1200 300"
            className="w-full h-auto"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient id="mountainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(15, 23, 42, 0.9)" />
                <stop offset="100%" stopColor="rgba(2, 6, 23, 1)" />
              </linearGradient>
            </defs>

            {/* Back mountains */}
            <path
              d="M0,300 L0,150 L300,100 L600,120 L900,80 L1200,110 L1200,300 Z"
              fill="rgba(15, 23, 42, 0.6)"
            />

            {/* Front mountains */}
            <path
              d="M0,300 L0,200 L200,150 L500,170 L800,140 L1200,160 L1200,300 Z"
              fill="url(#mountainGradient)"
            />
          </svg>
        </motion.div>

        {/* Main content */}
        <div className="relative z-30">
          {/* Hero section */}
          <section className="min-h-screen flex items-center justify-center px-6 py-24">
            <div className="max-w-4xl mx-auto text-center space-y-8">

              {/* Animated title */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="space-y-4"
              >
                <h1 className="text-5xl sm:text-7xl font-bold text-white leading-tight">
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="block bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"
                  >
                    Secure your legacy
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="block text-white"
                  >
                    in one trusted place
                  </motion.span>
                </h1>
              </motion.div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.8 }}
                className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed"
              >
                Begin your journey with Sofia, your personal guide. Transform uncertainty
                into peace of mind as you build a garden of protection for those you love.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="flex flex-col sm:flex-row justify-center gap-4 mt-12"
              >
                <button
                  onClick={handleStartJourney}
                  className="group relative px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-300 overflow-hidden"
                  style={{
                    background: `
                      linear-gradient(135deg,
                        rgba(59, 130, 246, 0.8) 0%,
                        rgba(147, 51, 234, 0.8) 100%
                      )
                    `,
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: `
                      0 8px 32px rgba(59, 130, 246, 0.3),
                      inset 0 1px 0 rgba(255, 255, 255, 0.2)
                    `
                  }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Start Your Journey
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </span>

                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity" />
                </button>

                <button
                  onClick={handleLearnMore}
                  className="px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-300"
                  style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: `
                      0 8px 32px rgba(0, 0, 0, 0.3),
                      inset 0 1px 0 rgba(255, 255, 255, 0.1)
                    `
                  }}
                >
                  Learn More
                </button>
              </motion.div>

              {/* Sofia firefly */}
              <AnimatePresence>
                {showSofia && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5, x: 100 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    className="absolute top-20 right-10"
                  >
                    <SofiaFirefly
                      size="lg"
                      message={sofiaMessage}
                      showDialog={true}
                      onInteraction={() => handleStartJourney()}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* Features section */}
          <section id="features" className="py-24 px-6 relative">
            <div className="max-w-6xl mx-auto">

              {/* Section header */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl font-bold text-white mb-4">
                  Your Path to Peace of Mind
                </h2>
                <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                  Three acts of your journey, each designed to transform uncertainty into confidence.
                </p>
              </motion.div>

              {/* Feature cards */}
              <div className="grid gap-8 md:grid-cols-3">
                {[
                  {
                    icon: Heart,
                    title: 'Act I: The Invitation',
                    subtitle: 'First 5 minutes',
                    description: 'Meet Sofia and discover the Box of Certainty. Transform curiosity into trust as you begin your journey.',
                    color: 'from-pink-500 to-rose-400'
                  },
                  {
                    icon: Shield,
                    title: 'Act II: Building Your Fortress',
                    subtitle: 'First week',
                    description: 'Create your Circle of Trust and watch your Garden of Legacy bloom with each protective step.',
                    color: 'from-blue-500 to-cyan-400'
                  },
                  {
                    icon: Sparkles,
                    title: 'Act III: Your Eternal Legacy',
                    subtitle: 'First month & beyond',
                    description: 'Record your voice for the future and complete the ritual of protection. Your legacy is secure.',
                    color: 'from-purple-500 to-violet-400'
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
                    <div
                      className="h-full p-8 rounded-3xl transition-all duration-300 group-hover:scale-105"
                      style={{
                        background: `
                          linear-gradient(135deg,
                            rgba(15, 23, 42, 0.8) 0%,
                            rgba(30, 41, 59, 0.6) 100%
                          )
                        `,
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: `
                          0 20px 40px rgba(0, 0, 0, 0.3),
                          inset 0 1px 0 rgba(255, 255, 255, 0.1)
                        `
                      }}
                    >
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
                          <h3 className="text-xl font-bold text-white mb-1">
                            {feature.title}
                          </h3>
                          <p className="text-sm text-slate-400 font-medium">
                            {feature.subtitle}
                          </p>
                        </div>

                        <p className="text-slate-300 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>

                      {/* Hover glow effect */}
                      <div
                        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                        style={{
                          background: `linear-gradient(135deg, ${feature.color.replace('from-', '').replace('to-', ', ')})`
                        }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* CSS for aurora animation */}
        <style>
          {`
            @keyframes aurora {
              0%, 100% {
                transform: translateX(-50px) translateY(-10px) scale(1);
                opacity: 0.3;
              }
              25% {
                transform: translateX(-30px) translateY(-15px) scale(1.1);
                opacity: 0.5;
              }
              50% {
                transform: translateX(-10px) translateY(-5px) scale(0.9);
                opacity: 0.3;
              }
              75% {
                transform: translateX(-40px) translateY(-20px) scale(1.05);
                opacity: 0.4;
              }
            }
          `}
        </style>
      </div>
    </PasswordWall>
  );
}