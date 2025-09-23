import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface DawnAnimationProps {
  onAnimationComplete: () => void;
}

export function DawnAnimation({ onAnimationComplete }: DawnAnimationProps) {
  const { t } = useTranslation();
  const [stage, setStage] = useState<'darkness' | 'firefly' | 'transformation' | 'dawn'>('darkness');

  useEffect(() => {
    const timers = [
      // Stage 1: Show title in darkness (0-2s)
      setTimeout(() => setStage('firefly'), 2000),
      // Stage 2: Firefly arrives (2-4s)
      setTimeout(() => setStage('transformation'), 4000),
      // Stage 3: Light spreads (4-6s)
      setTimeout(() => {
        setStage('dawn');
        onAnimationComplete();
      }, 6000),
    ];

    return () => timers.forEach(timer => clearTimeout(timer));
  }, [onAnimationComplete]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dark Background Layer */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at center, #0f1729 0%, #0a0a1a 50%, #000000 100%)
          `
        }}
        animate={{
          opacity: stage === 'dawn' ? 0 : 1
        }}
        transition={{ duration: 0.5, delay: stage === 'dawn' ? 0.5 : 0 }}
      >
        {/* Animated Stars */}
        <div className="absolute inset-0">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.2, 0.8, 0.2],
                scale: [0.5, 1.2, 0.5]
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>

        {/* Main Title */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.h1
            className="text-6xl sm:text-8xl font-bold text-center leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{
              opacity: 1,
              y: 0,
              color: stage === 'dawn' ? '#2d3748' : '#ffffff'
            }}
            transition={{
              opacity: { duration: 1, delay: 0.5 },
              y: { duration: 1, delay: 0.5 },
              color: { duration: 1, delay: stage === 'dawn' ? 0 : 0 }
            }}
          >
            Your Legacy is a Story
            <motion.span
              className="inline-block"
              animate={{
                scale: stage === 'firefly' || stage === 'transformation' ? [1, 1.5, 1] : 1
              }}
              transition={{ duration: 0.5, delay: stage === 'firefly' ? 0.5 : 0 }}
            >
              .
            </motion.span>
          </motion.h1>
        </div>

        {/* Sofia Firefly */}
        <AnimatePresence>
          {(stage === 'firefly' || stage === 'transformation' || stage === 'dawn') && (
            <motion.div
              className="absolute"
              initial={{
                x: -100,
                y: window.innerHeight / 2,
                opacity: 0
              }}
              animate={{
                x: window.innerWidth / 2 - 25,
                y: window.innerHeight / 2 - 50,
                opacity: 1
              }}
              transition={{
                duration: 1.5,
                ease: "easeInOut",
                x: { type: "spring", stiffness: 50 },
                y: { type: "spring", stiffness: 50 }
              }}
            >
              {/* Sofia Firefly SVG */}
              <motion.div
                className="relative"
                animate={{
                  scale: stage === 'transformation' ? [1, 1.2, 1] : 1
                }}
                transition={{
                  duration: 0.3,
                  repeat: stage === 'transformation' ? 3 : 0
                }}
              >
                <motion.div
                  className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-300 to-yellow-400"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(251, 191, 36, 0.6)',
                      '0 0 40px rgba(251, 191, 36, 0.8)',
                      '0 0 20px rgba(251, 191, 36, 0.6)'
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                {/* Sparkle Trail */}
                <motion.div
                  className="absolute -inset-4"
                  animate={{
                    rotate: 360
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  {Array.from({ length: 6 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-amber-200 rounded-full"
                      style={{
                        left: `${20 + Math.cos((i * 60) * Math.PI / 180) * 20}px`,
                        top: `${20 + Math.sin((i * 60) * Math.PI / 180) * 20}px`,
                      }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0]
                      }}
                      transition={{
                        duration: 1,
                        delay: i * 0.1,
                        repeat: Infinity
                      }}
                    />
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Light Background Layer */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(135deg,
              #f7fafc 0%,
              #edf2f7 25%,
              #e2e8f0 50%,
              #cbd5e0 100%
            )
          `
        }}
        initial={{
          clipPath: 'circle(0% at 50% 50%)'
        }}
        animate={{
          clipPath: stage === 'transformation' || stage === 'dawn'
            ? 'circle(150% at 50% 50%)'
            : 'circle(0% at 50% 50%)'
        }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          delay: stage === 'transformation' ? 0.5 : 0
        }}
      >
        {/* Content that appears after transformation */}
        <AnimatePresence>
          {stage === 'dawn' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center max-w-4xl mx-auto px-6">
                <motion.h1
                  className="text-6xl sm:text-8xl font-bold text-slate-800 mb-6 leading-tight"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                >
                  Your Legacy is a Story
                </motion.h1>

                <motion.h2
                  className="text-3xl sm:text-4xl font-semibold text-slate-600 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 1 }}
                >
                  Let's Make it a Legend
                </motion.h2>

                <motion.p
                  className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 1.5 }}
                >
                  Begin your journey with Sofia, your personal guide. Transform uncertainty
                  into peace of mind as you build a garden of protection for those you love.
                </motion.p>

                <motion.button
                  className="px-10 py-4 bg-slate-800 text-white text-lg font-semibold rounded-2xl hover:bg-slate-700 transition-colors shadow-lg hover:shadow-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 2 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t('landing:hero.ctaStartJourney')}
                </motion.button>
              </div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}