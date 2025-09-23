/**
 * Milestone Celebration System
 * Premium liquid glass design with Apple-style celebration animations
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Heart, Shield, Sparkles, Check, Crown, Gift } from 'lucide-react';
import { SofiaFirefly } from '../sofia/SofiaFirefly';
import { Button } from '@/components/ui/button';

interface Milestone {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  type: 'foundation' | 'growth' | 'protection' | 'legacy' | 'mastery';
  reward?: string;
  nextAction?: {
    title: string;
    description: string;
    action: () => void;
  };
}

interface MilestoneCelebrationProps {
  milestone: Milestone;
  isVisible: boolean;
  onCelebrationComplete?: () => void;
  onContinue?: () => void;
  className?: string;
}

export function MilestoneCelebration({
  milestone,
  isVisible,
  onCelebrationComplete,
  onContinue,
  className = ''
}: MilestoneCelebrationProps) {
  const [celebrationPhase, setCelebrationPhase] = useState<'entrance' | 'celebration' | 'reward' | 'next'>('entrance');
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const phases = [
        { phase: 'entrance', delay: 0 },
        { phase: 'celebration', delay: 1000 },
        { phase: 'reward', delay: 3000 },
        { phase: 'next', delay: 5000 }
      ];

      phases.forEach(({ phase, delay }) => {
        setTimeout(() => {
          setCelebrationPhase(phase as any);
          if (phase === 'celebration') {
            setShowConfetti(true);
          }
        }, delay);
      });

      // Auto-complete celebration
      setTimeout(() => {
        onCelebrationComplete?.();
      }, 8000);
    }
  }, [isVisible, onCelebrationComplete]);

  const getMilestoneIcon = () => {
    switch (milestone.type) {
      case 'foundation': return Shield;
      case 'growth': return Star;
      case 'protection': return Heart;
      case 'legacy': return Crown;
      case 'mastery': return Trophy;
      default: return Sparkles;
    }
  };

  const getMilestoneColor = () => {
    switch (milestone.type) {
      case 'foundation': return 'from-blue-500 to-cyan-400';
      case 'growth': return 'from-green-500 to-emerald-400';
      case 'protection': return 'from-purple-500 to-violet-400';
      case 'legacy': return 'from-yellow-500 to-orange-400';
      case 'mastery': return 'from-pink-500 to-rose-400';
      default: return 'from-indigo-500 to-purple-400';
    }
  };

  const liquidGlassStyle = {
    background: `
      linear-gradient(135deg,
        rgba(15, 23, 42, 0.95) 0%,
        rgba(30, 41, 59, 0.9) 100%
      )
    `,
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: `
      0 25px 50px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.1)
    `
  };

  const MilestoneIcon = getMilestoneIcon();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-50 flex items-center justify-center p-6 ${className}`}
          style={{
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)'
          }}
        >
          {/* Confetti particles */}
          <AnimatePresence>
            {showConfetti && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(50)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      background: `hsl(${Math.random() * 360}, 70%, 60%)`,
                      left: `${Math.random() * 100}%`,
                      top: '-10px'
                    }}
                    initial={{ y: -10, rotate: 0, opacity: 1 }}
                    animate={{
                      y: window.innerHeight + 100,
                      rotate: Math.random() * 720,
                      opacity: 0,
                      x: (Math.random() - 0.5) * 200
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      delay: Math.random() * 1,
                      ease: "easeOut"
                    }}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* Main celebration card */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="relative w-full max-w-lg"
          >
            <div
              className="p-8 rounded-3xl text-center space-y-6"
              style={liquidGlassStyle}
            >

              {/* Milestone icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{
                  scale: celebrationPhase === 'entrance' ? 1 : celebrationPhase === 'celebration' ? 1.2 : 1,
                  rotate: 0
                }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                  delay: 0.2
                }}
                className="relative mx-auto"
              >
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center mx-auto relative"
                  style={{
                    background: `linear-gradient(135deg, ${getMilestoneColor()})`,
                    boxShadow: `
                      0 20px 40px rgba(0, 0, 0, 0.3),
                      0 0 60px rgba(59, 130, 246, 0.3)
                    `
                  }}
                >
                  <MilestoneIcon size={36} className="text-white" />
                </div>

                {/* Glow effect during celebration */}
                <AnimatePresence>
                  {celebrationPhase === 'celebration' && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 2, opacity: 0.4 }}
                      exit={{ scale: 3, opacity: 0 }}
                      transition={{ duration: 1 }}
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `linear-gradient(135deg, ${getMilestoneColor()})`,
                        filter: 'blur(20px)'
                      }}
                    />
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Achievement text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-2"
              >
                <motion.div
                  animate={celebrationPhase === 'celebration' ? {
                    scale: [1, 1.05, 1],
                    transition: { duration: 0.6 }
                  } : {}}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white"
                  style={{
                    background: `linear-gradient(135deg, ${getMilestoneColor()})`,
                    opacity: 0.9
                  }}
                >
                  <Check size={16} />
                  Milestone Unlocked
                </motion.div>

                <h2 className="text-3xl font-bold text-white">
                  {milestone.title}
                </h2>

                <p className="text-lg text-blue-300 font-medium">
                  {milestone.subtitle}
                </p>

                <p className="text-slate-300 leading-relaxed max-w-md mx-auto">
                  {milestone.description}
                </p>
              </motion.div>

              {/* Reward section */}
              <AnimatePresence>
                {celebrationPhase === 'reward' && milestone.reward && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-center gap-2 text-yellow-400">
                      <Gift size={20} />
                      <span className="font-medium">Reward Unlocked</span>
                    </div>

                    <div
                      className="p-4 rounded-2xl"
                      style={{
                        background: `
                          linear-gradient(135deg,
                            rgba(251, 191, 36, 0.1) 0%,
                            rgba(245, 158, 11, 0.05) 100%
                          )
                        `,
                        border: '1px solid rgba(251, 191, 36, 0.2)'
                      }}
                    >
                      <p className="text-yellow-200 font-medium">
                        {milestone.reward}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Next action */}
              <AnimatePresence>
                {celebrationPhase === 'next' && milestone.nextAction && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="space-y-4"
                  >
                    <div className="text-slate-300">
                      <p className="font-medium">Ready for your next step?</p>
                      <p className="text-sm text-slate-400">
                        {milestone.nextAction.description}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={milestone.nextAction.action}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-2xl"
                      >
                        {milestone.nextAction.title}
                      </Button>

                      <Button
                        onClick={onContinue}
                        variant="outline"
                        className="px-4 bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50 rounded-2xl"
                      >
                        Later
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Continue button for phases without next action */}
              <AnimatePresence>
                {celebrationPhase === 'next' && !milestone.nextAction && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                  >
                    <Button
                      onClick={onContinue}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-2xl"
                    >
                      Continue Your Journey
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sofia celebration */}
            <SofiaFirefly
              size="lg"
              position={{ x: 85, y: 15 }}
              message="Wonderful achievement! Your garden grows stronger."
              showDialog={celebrationPhase === 'celebration'}
              className="absolute"
            />
          </motion.div>

          {/* Sparkle effects */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${20 + (i % 4) * 20}%`,
                  top: `${20 + Math.floor(i / 4) * 20}%`
                }}
                animate={celebrationPhase === 'celebration' ? {
                  scale: [0, 1, 0],
                  rotate: [0, 180, 360],
                  opacity: [0, 1, 0]
                } : {}}
                transition={{
                  duration: 2,
                  delay: i * 0.1,
                  repeat: celebrationPhase === 'celebration' ? 2 : 0
                }}
              >
                <Sparkles
                  size={24}
                  className="text-yellow-400"
                  style={{
                    filter: 'drop-shadow(0 0 10px rgba(251, 191, 36, 0.5))'
                  }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Predefined milestone configurations
export const GuardianMilestones = {
  foundationStone: {
    id: 'foundation-stone',
    title: 'Foundation Stone',
    subtitle: 'Your first cornerstone of protection',
    description: 'You\'ve uploaded your first document! This is the beginning of your secure legacy vault.',
    type: 'foundation' as const,
    reward: 'Unlocked: Document organization with automatic categorization',
    nextAction: {
      title: 'Add a Guardian',
      description: 'Invite someone you trust to help protect your legacy',
      action: () => window.location.href = '/family/invite'
    }
  },

  firstGrowth: {
    id: 'first-growth',
    title: 'Circle of Trust',
    subtitle: 'Your support network begins',
    description: 'You\'ve added your first guardian! Your family protection network is taking shape.',
    type: 'growth' as const,
    reward: 'Unlocked: Emergency contact system and family dashboard',
    nextAction: {
      title: 'Create Your Will',
      description: 'Use our guided wizard to create your will',
      action: () => window.location.href = '/will/wizard'
    }
  },

  protectionLeaf: {
    id: 'protection-leaf',
    title: 'Will of Protection',
    subtitle: 'Your wishes are documented',
    description: 'Your will is complete! Your loved ones now know exactly what you want.',
    type: 'protection' as const,
    reward: 'Unlocked: Legal document review and Sofia\'s smart suggestions',
    nextAction: {
      title: 'Record a Message',
      description: 'Leave a personal message for your loved ones',
      action: () => window.location.href = '/time-capsule/new'
    }
  },

  legacyFruit: {
    id: 'legacy-fruit',
    title: 'Voice of Love',
    subtitle: 'Your message transcends time',
    description: 'You\'ve created your first time capsule! Your voice will comfort future generations.',
    type: 'legacy' as const,
    reward: 'Unlocked: Advanced time capsule features and scheduling',
    nextAction: {
      title: 'Review Your Garden',
      description: 'See how beautiful your legacy has become',
      action: () => window.location.href = '/dashboard'
    }
  },

  masterGardener: {
    id: 'master-gardener',
    title: 'Master Guardian',
    subtitle: 'Your legacy is complete',
    description: 'Congratulations! You\'ve built a comprehensive protection system. Your family is truly safe.',
    type: 'mastery' as const,
    reward: 'Unlocked: Annual reflection ritual and legacy insights'
  }
};

// Hook for triggering milestone celebrations
export function useMilestoneCelebration() {
  const [activeMilestone, setActiveMilestone] = useState<Milestone | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const celebrateMilestone = (milestoneId: keyof typeof GuardianMilestones) => {
    const milestone = GuardianMilestones[milestoneId];
    setActiveMilestone(milestone);
    setIsVisible(true);
  };

  const handleCelebrationComplete = () => {
    setIsVisible(false);
    setTimeout(() => setActiveMilestone(null), 500);
  };

  const handleContinue = () => {
    setIsVisible(false);
    setTimeout(() => setActiveMilestone(null), 500);
  };

  return {
    activeMilestone,
    isVisible,
    celebrateMilestone,
    handleCelebrationComplete,
    handleContinue
  };
}