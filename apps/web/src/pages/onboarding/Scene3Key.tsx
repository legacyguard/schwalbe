import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/motion/FadeIn';
import Key3D from '@/components/onboarding/Key3D';
import {
  PersonalityAwareAnimation,
  ContextAwareAnimation,
  EmotionalAnimation,
  PersonalityHoverEffect,
  PersonalityAnimationUtils
} from '@/components/animations/PersonalityAwareAnimations';
import {
  useSofiaPersonality,
  PersonalityPresets
} from '@/components/sofia-firefly/SofiaFireflyPersonality';
import { LiquidMotion } from '@/components/animations/LiquidMotion';
import SofiaFirefly from '@/components/sofia-firefly/SofiaFirefly';
import OnboardingSofiaPanel from '@/components/onboarding/OnboardingSofiaPanel';

interface Scene3KeyProps {
  initialTrustedName?: string;
  onBack: () => void;
  onNext: (trustedName: string) => void;
  onSkip?: () => void;
}

export default function Scene3Key({
  initialTrustedName = '',
  onBack,
  onNext,
  onSkip,
}: Scene3KeyProps) {
  const [name, setName] = useState(initialTrustedName);
  const [isEngraving, setIsEngraving] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [displayedName, setDisplayedName] = useState('');
  const [currentCharIndex, setCurrentCharIndex] = useState(0);

  // Initialize Sofia personality for trust-building experience
  const { personality, adaptToContext, learnFromInteraction } = useSofiaPersonality(PersonalityPresets.trustBuilder);

  useEffect(() => setName(initialTrustedName), [initialTrustedName]);

  useEffect(() => {
    if (name.trim()) {
      setIsEngraving(true);
      const timer = setTimeout(() => setIsEngraving(false), 800);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [name]);

  // Character-by-character animation for trust-building
  useEffect(() => {
    if (name.length > displayedName.length) {
      const timer = setTimeout(() => {
        setDisplayedName(name.substring(0, currentCharIndex + 1));
        setCurrentCharIndex(prev => prev + 1);
      }, 100);
      return () => clearTimeout(timer);
    } else if (name.length < displayedName.length) {
      setDisplayedName(name);
      setCurrentCharIndex(name.length);
    }
    return undefined;
  }, [name, displayedName, currentCharIndex]);

  // Track user interactions for personality learning
  useEffect(() => {
    if (isInteracting) {
      learnFromInteraction({
        type: 'click',
        duration: 500,
        context: 'trust'
      });
      adaptToContext('trust');
    }
  }, [isInteracting, learnFromInteraction, adaptToContext]);

  return (
    <PersonalityAwareAnimation personality={personality} context="trust">
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 relative'>
        {/* Skip button in top right corner with personality-aware animation */}
        {onSkip && (
          <PersonalityHoverEffect personality={personality}>
            <motion.button
              onClick={() => {
                setIsInteracting(true);
                onSkip();
              }}
              className='absolute top-6 right-6 text-sm text-muted-foreground hover:text-foreground transition-colors z-10 bg-background/80 backdrop-blur px-3 py-1 rounded-full border border-border/50 hover:border-border'
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
            >
              Skip introduction
            </motion.button>
          </PersonalityHoverEffect>
        )}

      <FadeIn duration={0.8}>
        <Card className='w-full max-w-3xl border-primary/20 shadow-xl'>
          <CardHeader>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <CardTitle className='text-2xl font-heading bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent'>
                The Key of Trust
              </CardTitle>
            </motion.div>
          </CardHeader>
          <CardContent>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <p className='text-muted-foreground mb-6 text-lg leading-relaxed'>
                Who is the one person you would entrust with the key to this
                box? Enter only the name of someone you trust completely.
              </p>
              <p className='text-sm text-muted-foreground/80 mb-6 italic'>
                🔐 Choose someone who knows your heart and will honor your
                wishes.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <motion.div
                className="relative mb-6"
                whileFocus={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <Input
                  value={name}
                  onChange={e => {
                    setName(e.target.value);
                    setCurrentCharIndex(0);
                    setDisplayedName('');
                  }}
                  placeholder='e.g., Martina, John, Mom, Sarah...'
                  className='text-base h-12 border-primary/20 focus:border-primary/50 bg-background/50 focus:bg-background/70 transition-all duration-300'
                />

                {/* Character-by-character animation overlay */}
                {name !== displayedName && (
                  <motion.div
                    className="absolute inset-0 flex items-center px-3 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <span className="text-base text-green-600 font-medium">
                      {displayedName}
                      <motion.span
                        className="inline-block w-0.5 h-5 bg-green-600 ml-1"
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                    </span>
                  </motion.div>
                )}

                {/* Liquid border effect for trust-building */}
                <motion.div
                  className="absolute inset-0 border-2 border-primary/30 rounded-md pointer-events-none"
                  animate={{
                    borderImageSource: [
                      'linear-gradient(45deg, transparent, rgba(34, 197, 94, 0.3), transparent)',
                      'linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.5), transparent)',
                      'linear-gradient(135deg, transparent, rgba(34, 197, 94, 0.3), transparent)',
                      'linear-gradient(180deg, transparent, rgba(34, 197, 94, 0.4), transparent)',
                      'linear-gradient(225deg, transparent, rgba(34, 197, 94, 0.3), transparent)',
                      'linear-gradient(270deg, transparent, rgba(34, 197, 94, 0.5), transparent)',
                      'linear-gradient(315deg, transparent, rgba(34, 197, 94, 0.3), transparent)',
                      'linear-gradient(360deg, transparent, rgba(34, 197, 94, 0.4), transparent)',
                    ]
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              </motion.div>
            </motion.div>

            {/* 3D Key visualization with liquid effects */}
            <LiquidMotion.ScaleIn delay={0.8}>
              <motion.div
                className="mb-6 relative"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <Key3D
                  name={name}
                  className="transition-all duration-500 hover:shadow-2xl"
                />

                {/* Liquid glow effect for trust-building */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-green-500/20 via-transparent to-emerald-500/20 rounded-lg blur-xl"
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                {/* Engraving progress indicator */}
                {name.trim() && (
                  <motion.div
                    className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-background/90 backdrop-blur-sm border border-green-500/20 rounded-full px-3 py-1 text-xs text-green-600"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 0.8, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="flex items-center gap-1">
                      <motion.span
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        ⚡
                      </motion.span>
                      Engraving "{name}"...
                    </span>
                  </motion.div>
                )}
              </motion.div>
            </LiquidMotion.ScaleIn>

            <motion.div
              className='flex gap-3 justify-between'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
            >
              <LiquidMotion.ScaleIn delay={1.1}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant='outline'
                    onClick={onBack}
                    className='border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300'
                  >
                    ← Back
                  </Button>
                </motion.div>
              </LiquidMotion.ScaleIn>

              <div className='flex gap-3'>
                <LiquidMotion.ScaleIn delay={1.2}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant='outline'
                      onClick={() => setName('')}
                      className='border-muted hover:border-muted-foreground/40 hover:bg-muted/5 transition-all duration-300'
                    >
                      Clear
                    </Button>
                  </motion.div>
                </LiquidMotion.ScaleIn>

                <LiquidMotion.ScaleIn delay={1.3}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={() => onNext(name)}
                      disabled={!name.trim()}
                      className='bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      <motion.span
                        animate={{ x: name.trim() ? [0, 2, 0] : 0 }}
                        transition={{ duration: 0.6, repeat: name.trim() ? Infinity : 0 }}
                      >
                        Continue →
                      </motion.span>
                    </Button>
                  </motion.div>
                </LiquidMotion.ScaleIn>
              </div>
            </motion.div>

            {/* Validation message */}
            <motion.div
              className='mt-4 text-center'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
            >
              <p className='text-xs text-muted-foreground/70'>
                {name.trim()
                  ? `Key will be engraved for ${name}`
                  : 'Enter a name to engrave the key'}
              </p>
            </motion.div>

            {/* Trust-building celebration */}
            {name.trim() && (
              <LiquidMotion.ScaleIn delay={0.5}>
                <motion.div
                  className='mt-4 flex justify-center'
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  <motion.div
                    className='bg-gradient-to-r from-green-500/20 to-emerald-500/10 border border-green-500/30 rounded-full px-4 py-2'
                    animate={{
                      boxShadow: [
                        '0 0 20px rgba(34, 197, 94, 0.2)',
                        '0 0 30px rgba(34, 197, 94, 0.3)',
                        '0 0 20px rgba(34, 197, 94, 0.2)',
                      ]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  >
                    <span className='text-green-600 text-sm font-medium flex items-center gap-2'>
                      <motion.span
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        🔑
                      </motion.span>
                      Key entrusted to {name}
                    </span>
                  </motion.div>
                </motion.div>
              </LiquidMotion.ScaleIn>
            )}

            {/* Sofia guidance panel */}
            <div className="mt-4">
              <OnboardingSofiaPanel step={5} trustedName={name} />
            </div>

            {/* Contextual Sofia guidance */}
            <LiquidMotion.ScaleIn delay={1.5}>
              <motion.div
                className='mt-6 bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-xl px-4 py-3 max-w-lg mx-auto'
                animate={{
                  boxShadow: [
                    '0 0 15px rgba(34, 197, 94, 0.1)',
                    '0 0 25px rgba(34, 197, 94, 0.15)',
                    '0 0 15px rgba(34, 197, 94, 0.1)',
                  ]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <div className='flex items-center gap-3'>
                  <motion.div
                    className='w-2 h-2 bg-green-500 rounded-full'
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <p className='text-green-600 text-sm font-medium'>
                    ✨ Sofia: "{name.trim()
                      ? `Trust is the foundation of everything. ${name} will carry your wishes with honor.`
                      : `Choose someone who knows your heart - they'll be the guardian of your legacy.`}"
                  </p>
                </div>
              </motion.div>
            </LiquidMotion.ScaleIn>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
    </PersonalityAwareAnimation>
  );
}