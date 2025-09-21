import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { FadeIn } from '@/components/motion/FadeIn';
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
import { ANIMATION_TIMING } from '@/design/tokens';

interface AIProcessingAnimationProps {
  context: 'box-to-key' | 'key-to-prepare';
  userData?: {
    boxItems?: string;
    trustedName?: string;
    lifeSituation?: string;
  };
  onComplete: () => void;
  duration?: number; // in milliseconds
}

export default function AIProcessingAnimation({
  context,
  userData = {},
  onComplete,
  duration = ANIMATION_TIMING.processing
}: AIProcessingAnimationProps) {
  const [processingStage, setProcessingStage] = useState(0);
  const [isProcessing, setIsProcessing] = useState(true);
  const [insights, setInsights] = useState<string[]>([]);

  // Initialize Sofia personality for processing context
  const { personality, adaptToContext, learnFromInteraction } = useSofiaPersonality(
    PersonalityPresets.processing
  );

  const processingStages = {
    'box-to-key': [
      'Analyzing your precious memories...',
      'Understanding what matters most to you...',
      'Processing emotional connections...',
      'Generating personalized insights...',
      'Preparing your trust foundation...'
    ],
    'key-to-prepare': [
      'Reviewing your trust relationships...',
      'Analyzing security implications...',
      'Processing access permissions...',
      'Generating protection strategies...',
      'Finalizing your safety plan...'
    ]
  };

  const contextualMessages = {
    'box-to-key': {
      analyzing: "I'm carefully examining each word you've shared with me...",
      insights: "I can see the love and care in your choices...",
      completion: "Your foundation of trust is now ready..."
    },
    'key-to-prepare': {
      analyzing: "I'm processing the trust you've placed in this person...",
      insights: "This relationship will be the cornerstone of your protection...",
      completion: "Your personalized protection plan is complete..."
    }
  };

  useEffect(() => {
    const stages = processingStages[context];
    let currentStage = 0;

    const stageInterval = setInterval(() => {
      if (currentStage < stages.length - 1) {
        setProcessingStage(currentStage);
        currentStage++;
      } else {
        clearInterval(stageInterval);
        setIsProcessing(false);

        // Generate contextual insights based on user data
        const newInsights = generateInsights(context, userData);
        setInsights(newInsights);

        // Complete after a short delay
        setTimeout(() => {
          onComplete();
        }, 1500);
      }
    }, ANIMATION_TIMING.processing / stages.length);

    return () => clearInterval(stageInterval);
  }, [context, userData, duration, onComplete]);

  const generateInsights = (context: string, data: any): string[] => {
    const insights: string[] = [];

    if (context === 'box-to-key') {
      if (data.boxItems) {
        const itemCount = data.boxItems.split(/[\s,]+/).filter((word: string) => word.length > 2).length;
        insights.push(`Found ${itemCount} meaningful items in your box of certainty`);
      }
      insights.push('Your values show deep care for your loved ones');
      insights.push('Trust foundation analysis complete');
    } else if (context === 'key-to-prepare') {
      if (data.trustedName) {
        insights.push(`Trust relationship with ${data.trustedName} validated`);
      }
      insights.push('Emergency access protocols configured');
      insights.push('Protection timeline established');
    }

    return insights;
  };

  const getCurrentMessage = () => {
    const stages = processingStages[context];
    return stages[processingStage] || stages[stages.length - 1];
  };

  const getContextualMessage = () => {
    const messages = contextualMessages[context];
    if (processingStage < 2) return messages.analyzing;
    if (processingStage < 4) return messages.insights;
    return messages.completion;
  };

  return (
    <PersonalityAwareAnimation personality={personality} context="processing">
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden'>
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary/20 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                opacity: 0
              }}
              animate={{
                y: [null, Math.random() * window.innerHeight],
                opacity: [0, 0.5, 0]
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                delay: Math.random() * 5
              }}
            />
          ))}
        </div>

        <FadeIn duration={0.5}>
          <Card className='w-full max-w-2xl border-primary/20 shadow-2xl bg-background/95 backdrop-blur-sm'>
            <CardContent className="p-8">
              {/* Sofia AI Avatar */}
              <motion.div
                className="flex justify-center mb-8"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <motion.div
                  className='relative w-24 h-24 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center shadow-lg'
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(59, 130, 246, 0.3)',
                      '0 0 40px rgba(59, 130, 246, 0.5)',
                      '0 0 20px rgba(59, 130, 246, 0.3)',
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                >
                  <motion.span
                    className='text-3xl'
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                  >
                    🤔
                  </motion.span>

                  {/* Thinking bubbles */}
                  <motion.div
                    className="absolute -top-2 -right-2 w-4 h-4 bg-primary/60 rounded-full"
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: 0
                    }}
                  />
                  <motion.div
                    className="absolute -top-1 -right-3 w-3 h-3 bg-primary/40 rounded-full"
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: 0.5
                    }}
                  />
                  <motion.div
                    className="absolute -top-3 -right-1 w-2 h-2 bg-primary/50 rounded-full"
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: 1
                    }}
                  />
                </motion.div>
              </motion.div>

              {/* Processing Message */}
              <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <h2 className='text-2xl font-heading bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4'>
                  Sofia is Processing
                </h2>

                <AnimatePresence mode="wait">
                  <motion.p
                    key={processingStage}
                    className='text-muted-foreground text-lg'
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {getCurrentMessage()}
                  </motion.p>
                </AnimatePresence>

                <motion.p
                  className='text-sm text-primary/80 mt-3 italic'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                >
                  {getContextualMessage()}
                </motion.p>
              </motion.div>

              {/* Progress Indicators */}
              <div className="mb-8">
                <div className="flex justify-center space-x-2 mb-4">
                  {processingStages[context].map((_, index) => (
                    <motion.div
                      key={index}
                      className={`w-3 h-3 rounded-full ${
                        index <= processingStage ? 'bg-primary' : 'bg-primary/20'
                      }`}
                      animate={{
                        scale: index === processingStage ? [1, 1.2, 1] : 1,
                        opacity: index <= processingStage ? 1 : 0.3
                      }}
                      transition={{
                        scale: { duration: 0.6, repeat: index === processingStage ? Infinity : 0 },
                        opacity: { duration: 0.3 }
                      }}
                    />
                  ))}
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-primary/10 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{
                      width: isProcessing
                        ? `${((processingStage + 1) / processingStages[context].length) * 100}%`
                        : '100%'
                    }}
                    transition={{
                      duration: ANIMATION_TIMING.processing / 1000,
                      ease: "easeInOut"
                    }}
                  />
                </div>
              </div>

              {/* Processing Visualization */}
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-6">
                  <div className="flex items-center justify-center space-x-4">
                    {/* Animated data nodes */}
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="relative"
                        animate={{
                          y: [0, -10, 0],
                          opacity: [0.3, 1, 0.3]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.2
                        }}
                      >
                        <div className="w-4 h-4 bg-primary/60 rounded-full" />
                        <motion.div
                          className="absolute inset-0 bg-primary/30 rounded-full"
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 0, 0.5]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.2
                          }}
                        />
                      </motion.div>
                    ))}
                  </div>

                  <motion.p
                    className="text-center text-sm text-primary/80 mt-4"
                    animate={{
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity
                    }}
                  >
                    Analyzing patterns and generating insights...
                  </motion.p>
                </div>
              </motion.div>

              {/* Generated Insights */}
              <AnimatePresence>
                {!isProcessing && insights.length > 0 && (
                  <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <h3 className='text-lg font-semibold text-center mb-4 text-primary'>
                      ✨ Insights Generated
                    </h3>
                    <div className="space-y-2">
                      {insights.map((insight, index) => (
                        <motion.div
                          key={index}
                          className="bg-green-500/10 border border-green-500/20 rounded-lg p-3"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.2, duration: 0.4 }}
                        >
                          <p className='text-sm text-green-600 flex items-center gap-2'>
                            <motion.span
                              animate={{ rotate: [0, 360] }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                              ✓
                            </motion.span>
                            {insight}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Completion Message */}
              <AnimatePresence>
                {!isProcessing && (
                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <motion.div
                      className='bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 rounded-xl px-6 py-4 inline-block'
                      animate={{
                        boxShadow: [
                          '0 0 20px rgba(59, 130, 246, 0.2)',
                          '0 0 30px rgba(59, 130, 246, 0.3)',
                          '0 0 20px rgba(59, 130, 246, 0.2)',
                        ]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                    >
                      <p className='text-primary font-medium'>
                        ✨ Processing complete! Your personalized plan is ready.
                      </p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Floating Sofia Firefly */}
        <LiquidMotion.ScaleIn delay={1}>
          <motion.div
            className='fixed bottom-6 right-6 z-50'
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6, type: "spring" }}
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
                <span className='text-primary-foreground text-lg'>⚡</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </LiquidMotion.ScaleIn>
      </div>
    </PersonalityAwareAnimation>
  );
}