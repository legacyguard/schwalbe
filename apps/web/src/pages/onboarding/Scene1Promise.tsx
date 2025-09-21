import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { FadeIn } from '../../components/motion/FadeIn';
import { useTranslation } from 'react-i18next';
import {
  PersonalityAwareAnimation,
  ContextAwareAnimation,
  EmotionalAnimation,
  PersonalityHoverEffect,
  PersonalityAnimationUtils
} from '../../components/animations/PersonalityAwareAnimations';
import {
  useSofiaPersonality,
  PersonalityPresets
} from '../../components/sofia-firefly/SofiaFireflyPersonality';
import { SofiaFirefly } from '../../components/sofia-firefly/SofiaFirefly';
import { LiquidMotion } from '../../components/animations/LiquidMotion';

interface Scene1PromiseProps {
  onNext: () => void;
  onSkip?: () => void;
}

export default function Scene1Promise({ onNext, onSkip }: Scene1PromiseProps) {
  const { t } = useTranslation('ui/scene1-promise');
  const [isInteracting, setIsInteracting] = useState(false);

  // Initialize Sofia personality for new user
  const { personality, adaptToContext } = useSofiaPersonality(PersonalityPresets.newUser);

  const subtitle = useMemo(
    () => t('subtitle'),
    [t]
  );

  // Adapt context when user interacts
  useEffect(() => {
    if (isInteracting) {
      adaptToContext('guiding');
    }
  }, [isInteracting, adaptToContext]);

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden'>
      {/* Enhanced Sofia Firefly with liquid motion */}
      <LiquidMotion.ContextualMorph
        context="comforting"
        intensity="subtle"
        className="absolute top-20 right-20 z-20"
      >
        <SofiaFirefly
          size="medium"
          variant="floating"
          personality="empathetic"
          context="guiding"
          onTouch={() => setIsInteracting(true)}
          enableAdvancedAnimations={true}
          enableHaptics={true}
          glowIntensity={0.3}
          className="cursor-pointer"
        />
      </LiquidMotion.ContextualMorph>

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
            transition={{ delay: 2, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
          >
            {t('skipIntroduction')}
          </motion.button>
        </PersonalityHoverEffect>
      )}

      <PersonalityAwareAnimation personality={personality} context="guiding">
        <LiquidMotion.ContextualMorph context="comforting" intensity="subtle">
          <Card className='w-full max-w-2xl text-center border-primary/20 shadow-xl backdrop-blur-sm bg-background/95'>
          <CardHeader>
            <ContextAwareAnimation personality={personality} context="guiding">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                <CardTitle className='text-3xl font-heading bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent'>
                  {t('title')}
                  {personality.mode === 'celebratory' && (
                    <motion.span
                      className="inline-block ml-2"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      ✨
                    </motion.span>
                  )}
                  {personality.mode === 'empathetic' && (
                    <motion.span
                      className="inline-block ml-2"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      💝
                    </motion.span>
                  )}
                </CardTitle>
              </motion.div>
            </ContextAwareAnimation>
          </CardHeader>
          <CardContent>
            <ContextAwareAnimation personality={personality} context="guiding">
              <motion.p
                className='text-muted-foreground mb-8 text-lg leading-relaxed'
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                {subtitle}
              </motion.p>
            </ContextAwareAnimation>

            {/* Enhanced firefly animation scene with liquid design */}
            <LiquidMotion.ContextualMorph context="celebratory" intensity="subtle" className="mb-8">
              <EmotionalAnimation
                personality={personality}
                emotion="joy"
                trigger="load"
              >
                <motion.div
                  className='relative h-48 rounded-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-primary/30 overflow-hidden'
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9, duration: 0.8 }}
                >
              {/* Night sky background with breathing light effects */}
              <div className='absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-800 to-slate-700' />

              {/* Breathing light effect based on personality */}
              <motion.div
                className='absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10'
                animate={{
                  opacity: personality.mode === 'celebratory' ? [0.3, 0.6, 0.3] :
                           personality.mode === 'empathetic' ? [0.2, 0.4, 0.2] :
                           [0.1, 0.3, 0.1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* Stars */}
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className='absolute w-1 h-1 bg-white rounded-full opacity-60'
                  style={{
                    left: `${Math.random() * 100}}%`,
                    top: `${Math.random() * 60}%`,
                  }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 2 + Math.random() * 3,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}

              {/* Firefly with breathing light effects */}
              <motion.div
                className='absolute w-2 h-2 bg-yellow-300 rounded-full shadow-lg'
                style={{
                  boxShadow:
                    '0 0 10px #fde047, 0 0 20px #facc15, 0 0 30px #eab308',
                }}
                animate={{
                  x: [20, 280, 150, 200, 80, 20],
                  y: [100, 60, 120, 80, 140, 100],
                  opacity: [0.4, 1, 0.7, 1, 0.5, 0.4],
                  scale: personality.mode === 'celebratory' ? [1, 1.2, 0.9, 1.1, 1] :
                         personality.mode === 'empathetic' ? [1, 1.1, 1] :
                         [1, 1.05, 1],
                }}
                transition={{
                  duration: personality.mode === 'celebratory' ? 6 : 8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* Firefly trail */}
              <motion.div
                className='absolute w-1 h-1 bg-yellow-200/50 rounded-full'
                animate={{
                  x: [15, 275, 145, 195, 75, 15],
                  y: [105, 65, 125, 85, 145, 105],
                  opacity: [0, 0.3, 0.2, 0.3, 0.1, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.2,
                }}
              />

              {/* Gentle text overlay */}
              <div className='absolute inset-0 flex items-center justify-center'>
                <motion.p
                  className='text-white/70 text-sm font-medium tracking-wider'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2, duration: 1 }}
                >
                  {t('storyBegins')}
                </motion.p>
              </div>
            </motion.div>
            </EmotionalAnimation>
          </LiquidMotion.ContextualMorph>

            <PersonalityHoverEffect
              personality={personality}
              className="mt-8"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
              >
                <LiquidMotion.Morph variant="button-hover">
                  <Button
                    size='lg'
                    className='bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300'
                    onClick={() => {
                      setIsInteracting(true);
                      onNext();
                    }}
                  >
                    {t('startWriting')}
                  </Button>
                </LiquidMotion.Morph>
                <p className='text-xs text-muted-foreground mt-3 opacity-70'>
                  {t('footer')}
                </p>
              </motion.div>
            </PersonalityHoverEffect>

            {/* Contextual Sofia message */}
            <LiquidMotion.ScaleIn delay={2.5}>
              <motion.div
                className='mt-6 bg-primary/5 border border-primary/20 rounded-lg px-4 py-3 max-w-md mx-auto'
                animate={{
                  boxShadow: [
                    '0 0 10px rgba(59, 130, 246, 0.1)',
                    '0 0 20px rgba(59, 130, 246, 0.2)',
                    '0 0 10px rgba(59, 130, 246, 0.1)',
                  ]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <p className='text-primary text-sm font-medium text-center'>
                  ✨ Sofia: "Every great journey begins with a single, brave step"
                </p>
              </motion.div>
            </LiquidMotion.ScaleIn>
          </CardContent>
        </Card>
        </LiquidMotion.ContextualMorph>
      </PersonalityAwareAnimation>
    </div>
  );
}