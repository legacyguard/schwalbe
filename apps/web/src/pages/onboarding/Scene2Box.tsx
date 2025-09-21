import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Force TypeScript to re-check imports
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/motion/FadeIn';
import Box3D from '@/components/onboarding/Box3D';
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

interface Scene2BoxProps {
  initialItems?: string;
  onBack: () => void;
  onNext: (items: string) => void;
  onSkip?: () => void;
}

export default function Scene2Box({
  initialItems = '',
  onBack,
  onNext,
  onSkip,
}: Scene2BoxProps) {
  const [items, setItems] = useState(initialItems);
  const [words, setWords] = useState<string[]>([]);
  const [isInteracting, setIsInteracting] = useState(false);
  const [boxScale, setBoxScale] = useState(1);

  // Initialize Sofia personality for interactive experience
  const { personality, adaptToContext, learnFromInteraction } = useSofiaPersonality(PersonalityPresets.newUser);

  useEffect(() => setItems(initialItems), [initialItems]);

  useEffect(() => {
    // Extract words from items for animation
    const newWords = items
      .split(/[\s,]+/)
      .filter(word => word.length > 2)
      .slice(0, 12); // Limit to 12 words for animation
    setWords(newWords);
  }, [items]);

  // Track user interactions for personality learning
  useEffect(() => {
    if (isInteracting) {
      learnFromInteraction({
        type: 'click',
        duration: 500,
        context: 'helping'
      });
      adaptToContext('helping');
    }
  }, [isInteracting, learnFromInteraction, adaptToContext]);

  // Handle pinch-to-zoom gesture
  useEffect(() => {
    const handleWheel = (e: Event) => {
      const wheelEvent = e as WheelEvent;
      if (wheelEvent.ctrlKey) {
        wheelEvent.preventDefault();
        const delta = wheelEvent.deltaY > 0 ? -0.1 : 0.1;
        setBoxScale(prev => Math.max(0.5, Math.min(2, prev + delta)));
        setIsInteracting(true);
      }
    };

    const boxElement = document.querySelector('[data-box-container]');
    if (boxElement) {
      boxElement.addEventListener('wheel', handleWheel as EventListener, { passive: false });
      return () => boxElement.removeEventListener('wheel', handleWheel as EventListener);
    }
    
    // Return undefined when no element is found (no cleanup needed)
    return undefined;
  }, []);

  // Reset scale on new content
  useEffect(() => {
    if (words.length === 0) {
      setBoxScale(1);
    }
  }, [words.length]);

  return (
    <PersonalityAwareAnimation personality={personality} context="helping">
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
                The Box of Certainty
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
                Imagine leaving a single box for your loved ones. What would you
                put inside so they know how much you cared?
              </p>
              <p className='text-sm text-muted-foreground/80 mb-4 italic'>
                ✨ This is about love, not logistics. Write from your heart.
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
                <Textarea
                  value={items}
                  onChange={e => setItems(e.target.value)}
                  className='min-h-32 text-base leading-relaxed border-primary/20 focus:border-primary/50 bg-background/50 focus:bg-background/70 transition-all duration-300 resize-none'
                  placeholder="Write anything: house keys, banking hint, letter for my daughter, grandpa's watch, photo from our wedding, recipe for mom's cookies..."
                  rows={6}
                />

                {/* Liquid border effect */}
                <motion.div
                  className="absolute inset-0 border-2 border-primary/30 rounded-md pointer-events-none"
                  animate={{
                    borderImageSource: [
                      'linear-gradient(45deg, transparent, rgba(59, 130, 246, 0.3), transparent)',
                      'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), transparent)',
                      'linear-gradient(135deg, transparent, rgba(59, 130, 246, 0.3), transparent)',
                      'linear-gradient(180deg, transparent, rgba(59, 130, 246, 0.4), transparent)',
                      'linear-gradient(225deg, transparent, rgba(59, 130, 246, 0.3), transparent)',
                      'linear-gradient(270deg, transparent, rgba(59, 130, 246, 0.5), transparent)',
                      'linear-gradient(315deg, transparent, rgba(59, 130, 246, 0.3), transparent)',
                      'linear-gradient(360deg, transparent, rgba(59, 130, 246, 0.4), transparent)',
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

            {/* Sofia guidance panel */}
            <div className="mt-4">
              {/* Lightweight Sofia panel for onboarding step 2 */}
              <OnboardingSofiaPanel step={2} boxItems={items} />
            </div>

            {/* 3D Box visualization with liquid effects and gesture interactions */}
            <LiquidMotion.ScaleIn delay={0.8}>
              <motion.div
                className="mb-6 relative cursor-grab active:cursor-grabbing"
                data-box-container
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                drag
                dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
                dragElastic={0.1}
                whileDrag={{ scale: 1.05, rotate: 2 }}
                onDragStart={() => setIsInteracting(true)}
              >
                <motion.div
                  animate={{
                    rotateY: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{ scale: boxScale }}
                >
                  <Box3D
                    items={words}
                    className="transition-all duration-500 hover:shadow-2xl"
                  />
                </motion.div>

                {/* Liquid glow effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 rounded-lg blur-xl"
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

                {/* Gesture hints */}
                <motion.div
                  className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-background/90 backdrop-blur-sm border border-primary/20 rounded-full px-3 py-1 text-xs text-primary"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: words.length > 0 ? 0.7 : 0, y: words.length > 0 ? 0 : -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="flex items-center gap-1">
                    <motion.span
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      👆
                    </motion.span>
                    Drag to explore
                  </span>
                </motion.div>

                {/* Pinch gesture hint */}
                <motion.div
                  className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-background/90 backdrop-blur-sm border border-primary/20 rounded-full px-3 py-1 text-xs text-primary"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: boxScale !== 1 ? 0.7 : 0, y: boxScale !== 1 ? 0 : 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="flex items-center gap-1">
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      🔍
                    </motion.span>
                    Pinch to zoom
                  </span>
                </motion.div>
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
                      onClick={() => setItems('')}
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
                      onClick={() => onNext(items)}
                      disabled={!items.trim()}
                      className='bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      <motion.span
                        animate={{ x: items.trim() ? [0, 2, 0] : 0 }}
                        transition={{ duration: 0.6, repeat: items.trim() ? Infinity : 0 }}
                      >
                        Continue →
                      </motion.span>
                    </Button>
                  </motion.div>
                </LiquidMotion.ScaleIn>
              </div>
            </motion.div>

            {/* Character count and encouragement */}
            <motion.div
              className='mt-4 text-center'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
            >
              <p className='text-xs text-muted-foreground/70'>
                {items.trim() ? `${items.trim().length} characters • ` : ''}
                Take your time, there's no rush
              </p>
            </motion.div>

            {/* Contextual Sofia guidance */}
            <LiquidMotion.ScaleIn delay={1.5}>
              <motion.div
                className='mt-6 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl px-4 py-3 max-w-lg mx-auto'
                animate={{
                  boxShadow: [
                    '0 0 15px rgba(59, 130, 246, 0.1)',
                    '0 0 25px rgba(59, 130, 246, 0.15)',
                    '0 0 15px rgba(59, 130, 246, 0.1)',
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
                    className='w-2 h-2 bg-primary rounded-full'
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <p className='text-primary text-sm font-medium'>
                    ✨ Sofia: "{items.trim()
                      ? `Beautiful! Every word you write becomes part of their story.`
                      : `Start with anything - a memory, a wish, a piece of advice...`}"
                  </p>
                </div>
              </motion.div>
            </LiquidMotion.ScaleIn>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Floating Sofia Firefly */}
      <LiquidMotion.ScaleIn delay={2}>
        <motion.div
          className='fixed bottom-6 right-6 z-50'
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.6, type: "spring" }}
          whileHover={{ scale: 1.1 }}
        >
          <motion.div
            className='bg-background/90 backdrop-blur-md border border-primary/20 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300'
            animate={{
              boxShadow: [
                '0 4px 20px rgba(59, 130, 246, 0.15)',
                '0 8px 30px rgba(59, 130, 246, 0.25)',
                '0 4px 20px rgba(59, 130, 246, 0.15)',
              ]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            <motion.div
              className='w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center'
              animate={{
                background: [
                  'linear-gradient(45deg, #3b82f6, #1d4ed8)',
                  'linear-gradient(90deg, #3b82f6, #2563eb)',
                  'linear-gradient(135deg, #3b82f6, #1e40af)',
                  'linear-gradient(180deg, #3b82f6, #1d4ed8)',
                  'linear-gradient(225deg, #3b82f6, #2563eb)',
                  'linear-gradient(270deg, #3b82f6, #1e40af)',
                  'linear-gradient(315deg, #3b82f6, #1d4ed8)',
                  'linear-gradient(360deg, #3b82f6, #2563eb)',
                ]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <span className='text-primary-foreground text-lg'>✨</span>
            </motion.div>

            {/* Sofia tooltip */}
            <motion.div
              className='absolute bottom-full right-0 mb-2 bg-background/95 backdrop-blur-sm border border-primary/20 rounded-lg px-3 py-2 text-sm text-primary max-w-xs'
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 0, y: 10, scale: 0.9 }}
              whileHover={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <p className='font-medium'>Sofia is here to help</p>
              <p className='text-xs text-muted-foreground mt-1'>
                {items.trim()
                  ? "Your words are creating something beautiful"
                  : "Start writing and I'll guide you through"
                }
              </p>
              <div className='absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-background/95'></div>
            </motion.div>
          </motion.div>
        </motion.div>
      </LiquidMotion.ScaleIn>
    </div>
  </PersonalityAwareAnimation>
);
}