'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { LegacyGuardLogo } from '@/components/shared/LegacyGuardLogo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon-library';
import { SecurityPromiseSection } from './SecurityPromiseSection';
import { PricingSection } from './PricingSection';

export function LandingPage() {
  const t = useTranslations('ui/landing-page');
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];

  const [isFireflyOnButton, setIsFireflyOnButton] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const ctaButtonRef = useRef<HTMLButtonElement>(null);

  // Mouse tracking for firefly
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const fireflyX = useTransform(mouseX, value => value - 12); // Offset to center firefly
  const fireflyY = useTransform(mouseY, value => value - 12);

  // Generate random values once and memoize them to prevent re-renders
  const heroStars = useMemo(
    () =>
      Array.from({ length: 50 }, (_, i) => ({
        id: i,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.8 + 0.2,
        x: Math.random() * 100,
        y: Math.random() * 100,
        animationDelay: Math.random() * 3,
        duration: 2 + Math.random() * 2,
      })),
    []
  );

  const finalStars = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.6 + 0.2,
        x: Math.random() * 100,
        y: Math.random() * 100,
        animationDelay: Math.random() * 3,
        duration: 3 + Math.random() * 2,
      })),
    []
  );

  const chaosIcons = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        icon: [
          '📄',
          '🔑',
          '%',
          '📋',
          '💾',
          '⚠️',
          '📅',
          '🔒',
          '📊',
          '💳',
          '📧',
          '🏠',
        ][i],
        randomDelay: Math.random() * 2,
        randomDuration: 3 + Math.random() * 2,
        randomX: Math.random() * 300,
        randomY: Math.random() * 300,
        randomRotate: Math.random() * 360,
      })),
    []
  );

  // Prevent animation triggers when scrolling to bottom
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;

      // Check if we're near the bottom (within 200px)
      if (scrollHeight - scrollTop - clientHeight < 200) {
        if (!hasScrolledToBottom) {
          setHasScrolledToBottom(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasScrolledToBottom]);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        mouseX.set(event.clientX - rect.left);
        mouseY.set(event.clientY - rect.top);
      }
    },
    [mouseX, mouseY]
  );

  const handleGetStarted = () => {
    router.push(`/${locale}/sign-up`);
  };

  const handleCTAHover = () => {
    setIsFireflyOnButton(true);
  };

  const handleCTALeave = () => {
    setIsFireflyOnButton(false);
  };

  return (
    <div className='min-h-screen bg-slate-900'>
      {/* Hero Section - Full Screen Night Scene */}
      <section
        ref={heroRef}
        className='relative min-h-screen flex items-center justify-center overflow-hidden cursor-none'
        onMouseMove={handleMouseMove}
        style={{
          background: `
            radial-gradient(circle at 20% 80%, rgba(6, 182, 212, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(139, 69, 19, 0.1) 0%, transparent 50%),
            linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)
          `,
        }}
      >
        {/* Interactive Sofia Firefly */}
        <motion.div
          className='fixed pointer-events-none z-40'
          style={{ x: fireflyX, y: fireflyY }}
        >
          {/* Firefly Glow */}
          <motion.div
            className='absolute inset-0 rounded-full'
            animate={{
              boxShadow: [
                '0 0 20px rgba(255, 255, 0, 0.4)',
                '0 0 30px rgba(255, 255, 0, 0.6)',
                '0 0 20px rgba(255, 255, 0, 0.4)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Firefly Body */}
          <motion.div
            className='w-6 h-6 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-full shadow-lg'
            animate={{ scale: [1, 1.1, 1] }}
            style={{ filter: 'brightness(1.3)' }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Wings */}
          <motion.div
            className='absolute -top-1 -left-1 w-3 h-3'
            animate={{ rotate: [0, 15, -15, 0], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 0.3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className='w-full h-full bg-gradient-to-br from-blue-200/60 to-purple-200/60 rounded-full blur-sm' />
          </motion.div>

          <motion.div
            className='absolute -top-1 -right-1 w-3 h-3'
            animate={{ rotate: [0, -15, 15, 0], opacity: [0.3, 0.7, 0.3] }}
            transition={{
              duration: 0.3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.15,
            }}
          >
            <div className='w-full h-full bg-gradient-to-br from-blue-200/60 to-purple-200/60 rounded-full blur-sm' />
          </motion.div>
        </motion.div>

        {/* Main Content */}
        <div className='relative z-30 text-center text-white max-w-4xl mx-auto px-4'>
          <motion.h1
            className='text-6xl lg:text-8xl font-bold mb-8 leading-tight'
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
          >
            {t('hero.title')}
            <br />
            <span className='text-yellow-400'>{t('hero.subtitle')}</span>
          </motion.h1>

          <motion.p
            className='text-xl lg:text-2xl text-slate-300 mb-16 max-w-3xl mx-auto leading-relaxed'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
          >
            {t('hero.description')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 1.5 }}
          >
            <Button
              ref={ctaButtonRef}
              size='lg'
              onClick={handleGetStarted}
              onMouseEnter={handleCTAHover}
              onMouseLeave={handleCTALeave}
              className='bg-yellow-500 hover:bg-yellow-400 text-slate-900 text-xl px-12 py-6 rounded-full shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300 font-semibold relative overflow-hidden'
            >
              <motion.div
                className='absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-300'
                initial={{ x: '-100%' }}
                whileHover={{ x: '0%' }}
                transition={{ duration: 0.3 }}
              />
              <span className='relative z-10'>{t('hero.cta.main')}</span>

              {/* Firefly Landing Spot */}
              {isFireflyOnButton && (
                <motion.div
                  className='absolute top-2 right-4 w-2 h-2 bg-yellow-300 rounded-full z-20'
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Problem & Promise Section */}
      <section className='py-32 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-700 overflow-hidden'>
        <div className='container mx-auto px-4'>
          <div className='grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto'>
            {/* Chaos Side */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className='relative h-96 flex flex-col justify-center'
            >
              <div className='absolute inset-0 overflow-hidden'>
                {/* Chaotic floating elements */}
                {chaosIcons.map(item => (
                  <motion.div
                    key={item.id}
                    className='absolute text-2xl opacity-60'
                    initial={{
                      x: item.randomX,
                      y: item.randomY,
                      rotate: item.randomRotate,
                    }}
                    animate={{
                      x: [
                        item.randomX,
                        item.randomX + 50,
                        item.randomX - 30,
                        item.randomX,
                      ],
                      y: [
                        item.randomY,
                        item.randomY - 40,
                        item.randomY + 20,
                        item.randomY,
                      ],
                      rotate: [0, 180, 360],
                      opacity: [0.6, 0.3, 0.6],
                    }}
                    transition={{
                      duration: item.randomDuration,
                      repeat: Infinity,
                      delay: item.randomDelay,
                      ease: 'easeInOut',
                    }}
                  >
                    {item.icon}
                  </motion.div>
                ))}
              </div>

              <div className='relative z-10'>
                <h3 className='text-4xl font-bold text-red-400 mb-6'>
                  {t('problem.title')}
                </h3>
                <p className='text-xl text-slate-300 leading-relaxed'>
                  {t('problem.description')}
                  <span className='text-red-300 font-medium'>
                    {' '}
                    {t('problem.highlight')}
                  </span>
                </p>
              </div>
            </motion.div>

            {/* Promise Side - Box of Certainty */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              viewport={{ once: true }}
              className='relative h-96 flex flex-col justify-center items-center'
            >
              {/* Box of Certainty */}
              <motion.div
                className='relative'
                whileInView={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, delay: 1.5 }}
                viewport={{ once: true }}
              >
                <div className='w-48 h-32 bg-gradient-to-br from-yellow-400/20 to-yellow-600/10 rounded-lg border-2 border-yellow-400/40 backdrop-blur-sm relative overflow-hidden'>
                  {/* Gentle glow effect */}
                  <motion.div
                    className='absolute inset-0 bg-yellow-400/10 rounded-lg'
                    animate={{ opacity: [0.1, 0.3, 0.1] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />

                  {/* Gift Package symbol */}
                  <motion.div
                    className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 2, duration: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <Icon
                      name="gift"
                      className='w-8 h-8 text-yellow-400'
                    />
                  </motion.div>
                </div>
              </motion.div>

              <div className='relative z-10 text-center mt-8'>
                <h3 className='text-4xl font-bold text-yellow-400 mb-6'>
                  {t('promise.title')}
                </h3>
                <p className='text-xl text-slate-300 leading-relaxed max-w-md'>
                  {t('promise.description')}
                  <span className='text-yellow-300 font-medium'>
                    {' '}
                    {t('promise.highlight')}
                  </span>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Security Promise Section */}
      <SecurityPromiseSection />

      {/* Pricing Section */}
      <PricingSection />

      {/* Final CTA Section - Return to Night */}
      {!hasScrolledToBottom ? (
        <section className='relative min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 to-slate-900 overflow-hidden'>
          {/* Starry background */}
          <div className='absolute inset-0'>
            {finalStars.map(star => (
              <motion.div
                key={star.id}
                className='absolute bg-white rounded-full'
                style={{
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  opacity: star.opacity,
                }}
                animate={{
                  opacity: [star.opacity, star.opacity * 0.3, star.opacity],
                }}
                transition={{
                  duration: star.duration,
                  repeat: Infinity,
                  delay: star.animationDelay,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>

          {/* Sofia Returns - Center Stage */}
          <motion.div
            className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.5 }}
            viewport={{ once: true }}
          >
            {/* Large Sofia Firefly */}
            <motion.div
              className='relative'
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* Glow effect */}
              <motion.div
                className='absolute inset-0 rounded-full w-16 h-16 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2'
                animate={{
                  boxShadow: [
                    '0 0 30px rgba(255, 255, 0, 0.4)',
                    '0 0 50px rgba(255, 255, 0, 0.6)',
                    '0 0 30px rgba(255, 255, 0, 0.4)',
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* Body */}
              <motion.div
                className='w-12 h-12 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-full shadow-2xl'
                animate={{ scale: [1, 1.1, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* Wings */}
              <motion.div
                className='absolute -top-2 -left-2 w-6 h-6'
                animate={{ rotate: [0, 15, -15, 0], opacity: [0.4, 0.8, 0.4] }}
                transition={{
                  duration: 0.4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <div className='w-full h-full bg-gradient-to-br from-blue-200/60 to-purple-200/60 rounded-full blur-sm' />
              </motion.div>

              <motion.div
                className='absolute -top-2 -right-2 w-6 h-6'
                animate={{ rotate: [0, -15, 15, 0], opacity: [0.4, 0.8, 0.4] }}
                transition={{
                  duration: 0.4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.2,
                }}
              >
                <div className='w-full h-full bg-gradient-to-br from-blue-200/60 to-purple-200/60 rounded-full blur-sm' />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Final Message */}
          <div className='relative z-10 text-center text-white max-w-2xl mx-auto px-4 mt-32'>
            <motion.h2
              className='text-5xl lg:text-6xl font-bold mb-8 leading-tight'
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1 }}
              viewport={{ once: true }}
            >
              {t('cta.final.title')}
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 1.5 }}
              viewport={{ once: true }}
            >
              <Button
                size='lg'
                onClick={handleGetStarted}
                className='bg-yellow-500 hover:bg-yellow-400 text-slate-900 text-xl px-16 py-8 rounded-full shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300 font-bold relative overflow-hidden group'
              >
                <motion.div
                  className='absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-300'
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <span className='relative z-10 group-hover:scale-105 transition-transform duration-200'>
                  {t('cta.final.button')}
                </span>
              </Button>
            </motion.div>
          </div>
        </section>
      ) : (
        /* Static version when scrolled to bottom */
        <section className='relative min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 to-slate-900 overflow-hidden'>
          <div className='absolute inset-0'>
            {finalStars.map(star => (
              <div
                key={star.id}
                className='absolute bg-white rounded-full'
                style={{
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  opacity: star.opacity * 0.5,
                }}
              />
            ))}
          </div>

          <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
            <div className='relative'>
              <div
                className='absolute inset-0 rounded-full w-16 h-16 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2'
                style={{ boxShadow: '0 0 40px rgba(255, 255, 0, 0.5)' }}
              />
              <div className='w-12 h-12 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-full shadow-2xl' />
            </div>
          </div>

          <div className='relative z-10 text-center text-white max-w-2xl mx-auto px-4 mt-32'>
            <h2 className='text-5xl lg:text-6xl font-bold mb-8 leading-tight'>
              {t('cta.final.title')}
            </h2>
            <Button
              size='lg'
              onClick={handleGetStarted}
              className='bg-yellow-500 hover:bg-yellow-400 text-slate-900 text-xl px-16 py-8 rounded-full shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300 font-bold relative overflow-hidden group'
            >
              <span className='relative z-10 group-hover:scale-105 transition-transform duration-200'>
                {t('cta.final.button')}
              </span>
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}