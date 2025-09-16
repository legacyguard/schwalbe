import React, { useCallback, useMemo, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { MetaTags } from '@/components/common/MetaTags';
import { Button } from '@schwalbe/ui';
import { Card, CardContent } from '@schwalbe/ui';
import { Icon } from '@/components/ui/icon-library';
import { TopBar } from '@/components/layout/TopBar';
import { DunningBanner } from '@/features/billing/DunningBanner';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { SecurityPromiseSection } from '@/components/landing/SecurityPromiseSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { RedirectGuard } from '@/lib/utils/redirect-guard';

export function LandingPage() {
  const { t } = useTranslation('ui/landing-page');
  const navigate = useNavigate();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  React.useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setIsSignedIn(!!data.session);
      setIsLoaded(true);
    });
    return () => {
      mounted = false;
    };
  }, []);
  const [isFireflyOnButton, setIsFireflyOnButton] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const ctaButtonRef = useRef<HTMLButtonElement>(null);

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

  // Mouse tracking for firefly
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const fireflyX = useTransform(mouseX, value => value - 12); // Offset to center firefly
  const fireflyY = useTransform(mouseY, value => value - 12);

  // Redirect authenticated users to dashboard with onboarding check
  React.useEffect(() => {
    // Only redirect if Clerk has loaded and user is signed in
    // AND we're actually on the landing page (not already navigating)
    // AND we haven't hit a redirect loop
    if (
      isLoaded &&
      isSignedIn &&
      window.location.pathname === '/' &&
      RedirectGuard.canRedirect('/dashboard')
    ) {
      // Navigate to dashboard, OnboardingWrapper will handle onboarding check
      navigate('/dashboard', { replace: true });
    }
  }, [isLoaded, isSignedIn, navigate]);

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
    navigate('/sign-up');
  };


  const handleCTAHover = () => {
    setIsFireflyOnButton(true);
  };

  const handleCTALeave = () => {
    setIsFireflyOnButton(false);
  };

  return (
    <div className='min-h-screen bg-slate-900'>
      <MetaTags
        title={t('meta.title')}
        description={t('meta.description')}
        url={t('meta.url')}
      />

      {/* Navigation Header */}
      <TopBar />
      <DunningBanner />

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
        {/* Starry Background */}
        <div className='absolute inset-0'>
          {/* Stars */}
          {heroStars.map(star => (
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
                scale: [1, 1.2, 1],
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

        {/* Mountain Silhouettes */}
        <div className='absolute bottom-0 left-0 right-0'>
          <svg
            className='w-full h-64'
            viewBox='0 0 1200 256'
            preserveAspectRatio='none'
          >
            <path
              d='M0,256 L0,128 L200,180 L400,120 L600,160 L800,100 L1000,140 L1200,80 L1200,256 Z'
              fill='rgba(15, 23, 42, 0.8)'
            />
            <path
              d='M0,256 L0,160 L150,200 L350,140 L550,180 L750,120 L950,160 L1200,100 L1200,256 Z'
              fill='rgba(30, 41, 59, 0.6)'
            />
            <path
              d='M0,256 L0,200 L100,220 L300,180 L500,210 L700,160 L900,190 L1200,140 L1200,256 Z'
              fill='rgba(51, 65, 85, 0.4)'
            />
          </svg>
        </div>

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

      {/* Interactive 3-Act Story Section */}
      <section className='py-32 bg-slate-800'>
        <div className='container mx-auto px-4'>
          <motion.div
            className='text-center mb-16'
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className='text-5xl lg:text-6xl font-bold text-white mb-6'>
              {t('features.title')}
            </h2>
            <p className='text-xl text-slate-300 max-w-2xl mx-auto'>
              {t('features.subtitle')}
            </p>
          </motion.div>

          {/* Horizontal Scrolling Story Cards */}
          <div className='flex overflow-x-auto gap-8 pb-8 snap-x snap-mandatory'>
            {/* Act 1: Organize Your Present */}
            <motion.div
              className='flex-none w-96 bg-slate-900/60 rounded-2xl p-8 border border-slate-700 backdrop-blur-sm snap-start'
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className='relative h-48 mb-6 overflow-hidden rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/10'>
                {/* Premium Document Organization Illustration */}
                <div className='absolute inset-0 flex items-center justify-center'>
                  {/* Floating documents */}
                  <motion.div
                    className='absolute w-32 h-40 bg-white/90 rounded-lg shadow-xl -rotate-6 left-8 top-8'
                    initial={{ y: -100, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <div className='p-3'>
                      <div className='h-2 bg-slate-400 rounded w-3/4 mb-2'></div>
                      <div className='h-2 bg-slate-300 rounded w-1/2 mb-2'></div>
                      <div className='h-2 bg-slate-300 rounded w-5/6'></div>
                    </div>
                    <Icon
                      name="file-text"
                      className='absolute bottom-2 right-2 w-6 h-6 text-blue-400'
                    />
                  </motion.div>

                  <motion.div
                    className='absolute w-32 h-40 bg-white/80 rounded-lg shadow-lg rotate-3 right-8 top-6'
                    initial={{ y: -100, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <div className='p-3'>
                      <div className='h-2 bg-slate-400 rounded w-3/4 mb-2'></div>
                      <div className='h-2 bg-slate-300 rounded w-2/3 mb-2'></div>
                      <div className='h-2 bg-slate-300 rounded w-1/2'></div>
                    </div>
                    <Icon
                      name="shield"
                      className='absolute bottom-2 right-2 w-6 h-6 text-purple-400'
                    />
                  </motion.div>

                  {/* Central folder */}
                  <motion.div
                    className='relative z-10'
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: 0.6, duration: 0.5, type: 'spring' }}
                    viewport={{ once: true }}
                  >
                    <div className='w-24 h-20 bg-yellow-400 rounded-t-lg transform perspective-100'></div>
                    <div className='w-24 h-16 bg-yellow-500 rounded-b-lg shadow-2xl'>
                      <Icon
                        name="folder"
                        className='w-8 h-8 text-white mx-auto mt-4'
                      />
                    </div>
                    {/* Success checkmark */}
                    <motion.div
                      className='absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center'
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ delay: 1, duration: 0.3 }}
                      viewport={{ once: true }}
                    >
                      <Icon
                        name="check"
                        className='w-5 h-5 text-white'
                      />
                    </motion.div>
                  </motion.div>
                </div>
              </div>

              <h3 className='text-2xl font-bold text-white mb-4'>
                {t('features.act1.title')}
              </h3>
              <p className='text-slate-300 leading-relaxed'>
                {t('features.act1.description')}
              </p>
            </motion.div>

            {/* Act 2: Protect Your Family */}
            <motion.div
              className='flex-none w-96 bg-slate-900/60 rounded-2xl p-8 border border-slate-700 backdrop-blur-sm snap-start'
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className='relative h-48 mb-6 overflow-hidden rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-500/10'>
                {/* Premium Family Shield Illustration */}
                <div className='absolute inset-0 flex items-center justify-center'>
                  {/* Shield background */}
                  <motion.div
                    className='absolute w-40 h-44 bg-gradient-to-b from-emerald-500/30 to-emerald-600/20 rounded-t-3xl rounded-b-lg'
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6, type: 'spring' }}
                    viewport={{ once: true }}
                    style={{
                      clipPath:
                        'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                    }}
                  />

                  {/* Central family */}
                  <motion.div
                    className='relative z-10'
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <div className='w-20 h-20 bg-white/90 rounded-full shadow-xl flex items-center justify-center'>
                      <Icon
                        name="users"
                        className='w-10 h-10 text-emerald-600'
                      />
                    </div>

                    {/* Protection ring */}
                    <motion.div
                      className='absolute inset-0 border-4 border-emerald-400 rounded-full'
                      initial={{ scale: 1.5, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.8, duration: 0.5 }}
                      viewport={{ once: true }}
                    />
                  </motion.div>

                  {/* Guardian figures */}
                  {[
                    { x: -60, y: -20, delay: 0.9 },
                    { x: 60, y: -20, delay: 1.0 },
                    { x: -40, y: 40, delay: 1.1 },
                    { x: 40, y: 40, delay: 1.2 },
                  ].map((pos, i) => (
                    <motion.div
                      key={i}
                      className='absolute w-10 h-10 bg-emerald-400/80 rounded-full flex items-center justify-center shadow-lg'
                      style={{
                        left: `calc(50% + ${pos.x}px - 20px)`,
                        top: `calc(50% + ${pos.y}px - 20px)`,
                      }}
                      initial={{ scale: 0, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      transition={{ delay: pos.delay, duration: 0.3 }}
                      viewport={{ once: true }}
                    >
                      <Icon
                        name="user"
                        className='w-5 h-5 text-white'
                      />
                    </motion.div>
                  ))}

                  {/* Connection lines */}
                  <motion.svg
                    className='absolute inset-0 w-full h-full'
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 1.3, duration: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <motion.path
                      d='M 50 50 L 20 30 M 50 50 L 80 30 M 50 50 L 30 70 M 50 50 L 70 70'
                      stroke='rgba(52, 211, 153, 0.3)'
                      strokeWidth='2'
                      fill='none'
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      transition={{ delay: 1.4, duration: 0.8 }}
                      viewport={{ once: true }}
                    />
                  </motion.svg>
                </div>
              </div>

              <h3 className='text-2xl font-bold text-white mb-4'>
                {t('features.act2.title')}
              </h3>
              <p className='text-slate-300 leading-relaxed'>
                {t('features.act2.description')}
              </p>
            </motion.div>

            {/* Act 3: Define Your Legacy */}
            <motion.div
              className='flex-none w-96 bg-slate-900/60 rounded-2xl p-8 border border-slate-700 backdrop-blur-sm snap-start'
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className='relative h-48 mb-6 overflow-hidden rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/10'>
                {/* Legacy Garden animation */}
                <div className='absolute inset-0 flex items-end justify-center pb-8'>
                  {/* Ground */}
                  <div className='absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-green-800/40 to-transparent'></div>

                  {/* Growing tree */}
                  <motion.div
                    className='relative'
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    viewport={{ once: true }}
                  >
                    {/* Tree trunk */}
                    <motion.div
                      className='w-3 h-16 bg-amber-700 rounded-sm mx-auto'
                      initial={{ height: 0 }}
                      whileInView={{ height: 64 }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                      viewport={{ once: true }}
                    />

                    {/* Tree crown */}
                    <motion.div
                      className='w-12 h-12 bg-green-500 rounded-full absolute -top-6 left-1/2 transform -translate-x-1/2'
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ delay: 1.2, duration: 0.5 }}
                      viewport={{ once: true }}
                    />

                    {/* Legacy elements floating around */}
                    {['💌', '📜', '⏰'].map((emoji, i) => {
                      const angle = i * 120;
                      const radians = (angle * Math.PI) / 180;
                      const x = Math.cos(radians) * 40;
                      const y = Math.sin(radians) * 40;

                      return (
                        <motion.div
                          key={i}
                          className='absolute text-lg'
                          style={{
                            left: `calc(50% + ${x}px)`,
                            top: `calc(50% + ${y}px)`,
                          }}
                          initial={{ scale: 0, opacity: 0 }}
                          whileInView={{
                            scale: 1,
                            opacity: 1,
                            transition: { delay: 1.5 + i * 0.2, duration: 0.3 },
                          }}
                          viewport={{ once: true }}
                          animate={{ y: [0, -5, 0], rotate: [0, 5, -5, 0] }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.5,
                          }}
                        >
                          {emoji}
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </div>
              </div>

              <h3 className='text-2xl font-bold text-white mb-4'>
                {t('features.act3.title')}
              </h3>
              <p className='text-slate-300 leading-relaxed'>
                {t('features.act3.description')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className='py-20 bg-slate-800/90 backdrop-blur-sm'>
        <div className='container mx-auto px-4'>
          <motion.div
            className='text-center mb-16'
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className='text-4xl lg:text-5xl font-bold text-white mb-6'>
              {t('howItWorks.title')}
            </h2>
            <p className='text-xl text-slate-300 max-w-2xl mx-auto'>
              {t('howItWorks.subtitle')}
            </p>
          </motion.div>

          <div className='grid md:grid-cols-3 gap-8 max-w-6xl mx-auto'>
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className='text-center p-8 h-full bg-slate-900/50 border-slate-700 hover:bg-slate-800/50 hover:border-slate-600 transition-all duration-300 backdrop-blur-sm'>
                <CardContent className='space-y-4'>
                  <motion.div
                    className='w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto'
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon
                      name="vault"
                      className='w-10 h-10 text-yellow-400'
                    />
                  </motion.div>
                  <h3 className='text-2xl font-bold text-white'>
                    {t('howItWorks.steps.act1.title')}
                  </h3>
                  <p className='text-slate-300 leading-relaxed'>
                    {t('howItWorks.steps.act1.description')}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className='text-center p-8 h-full bg-slate-900/50 border-slate-700 hover:bg-slate-800/50 hover:border-slate-600 transition-all duration-300 backdrop-blur-sm'>
                <CardContent className='space-y-4'>
                  <motion.div
                    className='w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto'
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon
                      name="shield"
                      className='w-10 h-10 text-yellow-400'
                    />
                  </motion.div>
                  <h3 className='text-2xl font-bold text-white'>
                    {t('howItWorks.steps.act2.title')}
                  </h3>
                  <p className='text-slate-300 leading-relaxed'>
                    {t('howItWorks.steps.act2.description')}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Card className='text-center p-8 h-full bg-slate-900/50 border-slate-700 hover:bg-slate-800/50 hover:border-slate-600 transition-all duration-300 backdrop-blur-sm'>
                <CardContent className='space-y-4'>
                  <motion.div
                    className='w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto'
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon
                      name="legacy"
                      className='w-10 h-10 text-yellow-400'
                    />
                  </motion.div>
                  <h3 className='text-2xl font-bold text-white'>
                    {t('howItWorks.steps.act3.title')}
                  </h3>
                  <p className='text-slate-300 leading-relaxed'>
                    {t('howItWorks.steps.act3.description')}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Security Promise Section */}
      <SecurityPromiseSection />

      {/* Our Commitments Section */}
      <section className='py-32 bg-gradient-to-br from-slate-900 to-slate-800'>
        <div className='container mx-auto px-4'>
          <motion.div
            className='text-center mb-16'
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className='text-4xl lg:text-5xl font-bold text-white mb-6'>
              {t('values.title')}
            </h2>
            <p className='text-xl text-slate-300 max-w-2xl mx-auto'>
              {t('values.subtitle')}
            </p>
          </motion.div>

          <div className='grid md:grid-cols-2 gap-12 max-w-5xl mx-auto'>
            {[
              {
                title: 'Empathy by Design',
                description:
                  'We believe technology should be caring. Our platform is designed to support you emotionally, not just functionally.',
                icon: 'heart',
                visual: (
                  <motion.div
                    className='relative w-16 h-16 mx-auto mb-6'
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon
                      name="heart"
                      className='w-12 h-12 text-yellow-400 absolute top-2 left-2'
                    />
                    <motion.div
                      className='w-4 h-4 bg-yellow-300 rounded-full absolute top-1 right-1'
                      animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  </motion.div>
                ),
              },
              {
                title: 'Zero-Knowledge Security',
                description:
                  'Your privacy is sacred. We use end-to-end encryption, meaning not even we can access your sensitive data.',
                icon: 'shield-check',
                visual: (
                  <motion.div
                    className='relative w-16 h-16 mx-auto mb-6'
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className='w-12 h-12 border-2 border-yellow-400 rounded-lg absolute top-2 left-2'
                      animate={{
                        borderColor: ['#fbbf24', '#f59e0b', '#fbbf24'],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                    <Icon
                      name="key"
                      className='w-6 h-6 text-yellow-400 absolute top-5 left-5'
                    />
                  </motion.div>
                ),
              },
              {
                title: 'Effortless Automation',
                description:
                  'From AI-powered analysis to automated reminders, we do the heavy lifting so you can focus on what matters.',
                icon: 'sparkles',
                visual: (
                  <motion.div
                    className='relative w-16 h-16 mx-auto mb-6'
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon
                      name="sparkles"
                      className='w-12 h-12 text-yellow-400 absolute top-2 left-2'
                    />
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className='w-1 h-1 bg-yellow-300 rounded-full absolute'
                        style={{
                          left: `${20 + i * 8}px`,
                          top: `${15 + i * 4}px`,
                        }}
                        animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.3,
                          ease: 'easeInOut',
                        }}
                      />
                    ))}
                  </motion.div>
                ),
              },
              {
                title: 'A Living Legacy',
                description:
                  "This isn't a one-time task. It's a living, growing garden that evolves with you and your family's journey.",
                icon: 'book',
                visual: (
                  <motion.div
                    className='relative w-16 h-16 mx-auto mb-6'
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon
                      name="book-open"
                      className='w-12 h-12 text-yellow-400 absolute top-2 left-2'
                    />
                    <motion.div
                      className='absolute top-0 right-0 w-3 h-3 bg-yellow-300 rounded-full'
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  </motion.div>
                ),
              },
            ].map((commitment, index) => (
              <motion.div
                key={commitment.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className='text-center'
              >
                <Card className='p-8 h-full bg-slate-900/60 backdrop-blur border-slate-700 hover:bg-slate-800/60 hover:border-yellow-400/30 transition-all duration-500'>
                  <CardContent className='space-y-6'>
                    {commitment.visual}
                    <h3 className='text-2xl font-bold text-white'>
                      {commitment.title}
                    </h3>
                    <p className='text-slate-300 leading-relaxed text-lg'>
                      {commitment.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* Social Proof Section */}
      <section className='py-20 bg-slate-800 border-t border-slate-700'>
        <div className='container mx-auto px-4'>
          <motion.div
            className='text-center mb-12'
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className='text-3xl lg:text-4xl font-bold text-white mb-4'>
              {t('trust.title')}
            </h2>
            <p className='text-xl text-slate-300 max-w-3xl mx-auto'>
              {t('trust.subtitle')}
            </p>
          </motion.div>

          {/* Partner and Technology Logos */}
          <motion.div
            className='flex flex-wrap items-center justify-center gap-8 lg:gap-12 opacity-60 hover:opacity-80 transition-opacity duration-300'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 0.6, y: 0 }}
            whileHover={{ opacity: 0.8 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {/* Clerk - Authentication */}
            <div className='flex items-center gap-2 text-slate-400 hover:text-slate-300 transition-colors'>
              <div className='w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center'>
                <span className='text-white font-bold text-sm'>C</span>
              </div>
              <span className='text-sm font-medium'>{t('trust.poweredBy.clerk')}</span>
            </div>

            {/* Supabase - Database */}
            <div className='flex items-center gap-2 text-slate-400 hover:text-slate-300 transition-colors'>
              <div className='w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center'>
                <span className='text-white font-bold text-sm'>S</span>
              </div>
              <span className='text-sm font-medium'>{t('trust.poweredBy.supabase')}</span>
            </div>

            {/* Vercel - Hosting */}
            <div className='flex items-center gap-2 text-slate-400 hover:text-slate-300 transition-colors'>
              <div className='w-8 h-8 bg-gradient-to-br from-black to-slate-800 rounded-lg flex items-center justify-center border border-slate-600'>
                <span className='text-white font-bold text-sm'>▲</span>
              </div>
              <span className='text-sm font-medium'>{t('trust.poweredBy.vercel')}</span>
            </div>

            {/* Legal Partner */}
            <div className='flex items-center gap-2 text-slate-400 hover:text-slate-300 transition-colors'>
              <div className='w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center'>
                <span className='text-white font-bold text-sm'>⚖</span>
              </div>
              <span className='text-sm font-medium'>{t('trust.poweredBy.legal')}</span>
            </div>

            {/* GDPR Compliant */}
            <div className='flex items-center gap-2 text-slate-400 hover:text-slate-300 transition-colors'>
              <div className='w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center'>
                <span className='text-white font-bold text-xs'>🇪🇺</span>
              </div>
              <span className='text-sm font-medium'>{t('trust.poweredBy.gdpr')}</span>
            </div>
          </motion.div>

          {/* Additional Trust Indicators */}
          <motion.div
            className='mt-12 flex flex-wrap items-center justify-center gap-6 text-slate-500 text-sm'
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className='flex items-center gap-2'>
              <Icon
                name="shield-check"
                className='w-4 h-4 text-green-400'
              />
              <span>{t('trust.indicators.endToEndEncryption')}</span>
            </div>
            <div className='flex items-center gap-2'>
              <Icon name="check" className='w-4 h-4 text-green-400' />
              <span>{t('trust.indicators.zeroKnowledge')}</span>
            </div>
            <div className='flex items-center gap-2'>
              <Icon name="key" className='w-4 h-4 text-green-400' />
              <span>{t('trust.indicators.bankLevelSecurity')}</span>
            </div>
            <div className='flex items-center gap-2'>
              <Icon name="users" className='w-4 h-4 text-green-400' />
              <span>{t('trust.indicators.legalExpertConsultation')}</span>
            </div>
          </motion.div>
        </div>
      </section>

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

      {/* Footer - Now at the very end */}
      <footer className='py-12 bg-slate-950 text-white'>
        <div className='container mx-auto px-4'>
          <div className='grid md:grid-cols-4 gap-8'>
            <div className='col-span-1'>
              <div className='flex items-center gap-3 mb-4'>
                <LegacyGuardLogo />
                <span className='text-xl font-bold font-heading'>
                  LegacyGuard
                </span>
              </div>
              <p className='text-slate-400 text-sm'>
                {t('footer.tagline')}
              </p>
            </div>

            <div>
              <h4 className='font-semibold mb-3'>{t('footer.sections.product')}</h4>
              <ul className='space-y-2 text-sm'>
                <li>
                  <Link
                    to='/features'
                    className='text-slate-400 hover:text-yellow-400 transition-colors'
                  >
                    {t('footer.links.features')}
                  </Link>
                </li>
                <li>
                  <Link
                    to='/security'
                    className='text-slate-400 hover:text-yellow-400 transition-colors'
                  >
                    {t('footer.links.security')}
                  </Link>
                </li>
                <li>
                  <Link
                    to='/pricing'
                    className='text-slate-400 hover:text-yellow-400 transition-colors'
                  >
                    {t('footer.links.pricing')}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className='font-semibold mb-3'>{t('footer.sections.support')}</h4>
              <ul className='space-y-2 text-sm'>
                <li>
                  <Link
                    to='/help'
                    className='text-slate-400 hover:text-yellow-400 transition-colors'
                  >
                    {t('footer.links.helpCenter')}
                  </Link>
                </li>
                <li>
                  <Link
                    to='/contact'
                    className='text-slate-400 hover:text-yellow-400 transition-colors'
                  >
                    {t('footer.links.contactUs')}
                  </Link>
                </li>
                <li>
                  <Link
                    to='/guides'
                    className='text-slate-400 hover:text-yellow-400 transition-colors'
                  >
                    {t('footer.links.userGuides')}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className='font-semibold mb-3'>{t('footer.sections.legal')}</h4>
              <ul className='space-y-2 text-sm'>
                <li>
                  <Link
                    to='/privacy-policy'
                    className='text-slate-400 hover:text-yellow-400 transition-colors'
                  >
                    {t('footer.links.privacyPolicy')}
                  </Link>
                </li>
                <li>
                  <Link
                    to='/terms-of-service'
                    className='text-slate-400 hover:text-yellow-400 transition-colors'
                  >
                    {t('footer.links.termsOfService')}
                  </Link>
                </li>
                <li>
                  <Link
                    to='/security-policy'
                    className='text-slate-400 hover:text-yellow-400 transition-colors'
                  >
                    {t('footer.links.securityPolicy')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className='border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400'>
            <p>
              &copy; {new Date().getFullYear()} LegacyGuard. {t('footer.copyright')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}