/**
 * Progressive Unlock Animations
 * Pillar and feature unlock animations for emotional impact
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Lock,
  Unlock,
  Key,
  Sparkles,
  Star,
  Crown,
  Gift,
  Heart,
  Shield,
  Zap,
  Award,
  Gem,
  Magic,
  Sun,
  Moon,
  Rainbow
} from 'lucide-react'
import { cn } from '../../lib/utils'

export interface UnlockEvent {
  id: string
  type: 'pillar' | 'feature' | 'achievement' | 'milestone'
  title: string
  description: string
  icon: React.ReactNode
  color: string
  gradient: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  triggerCondition: string
  celebrationMessage: string
  rewards?: UnlockReward[]
}

export interface UnlockReward {
  id: string
  type: 'feature' | 'customization' | 'content' | 'access'
  title: string
  description: string
  icon: React.ReactNode
}

interface UnlockAnimationsProps {
  unlockEvent: UnlockEvent | null
  onUnlockComplete: (eventId: string) => void
  onSkip?: () => void
  className?: string
}

export function UnlockAnimations({
  unlockEvent,
  onUnlockComplete,
  onSkip,
  className
}: UnlockAnimationsProps) {
  const [animationPhase, setAnimationPhase] = useState<'lock' | 'unlock' | 'reveal' | 'celebration'>('lock')
  const [showRewards, setShowRewards] = useState(false)

  useEffect(() => {
    if (!unlockEvent) return

    const phases = [
      { phase: 'lock', delay: 0 },
      { phase: 'unlock', delay: 1500 },
      { phase: 'reveal', delay: 3000 },
      { phase: 'celebration', delay: 4500 }
    ]

    const timers = phases.map(({ phase, delay }) =>
      setTimeout(() => {
        setAnimationPhase(phase as any)
        if (phase === 'celebration') {
          setShowRewards(true)
        }
      }, delay)
    )

    // Auto-complete after celebration
    const completeTimer = setTimeout(() => {
      onUnlockComplete(unlockEvent.id)
    }, 8000)

    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(completeTimer)
    }
  }, [unlockEvent, onUnlockComplete])

  if (!unlockEvent) return null

  const getRarityEffects = (rarity: UnlockEvent['rarity']) => {
    switch (rarity) {
      case 'legendary':
        return {
          particles: 50,
          colors: ['#FFD700', '#FFA500', '#FF6B35', '#FF1744'],
          glowIntensity: 0.8,
          sparkleSize: 'large'
        }
      case 'epic':
        return {
          particles: 30,
          colors: ['#9C27B0', '#673AB7', '#3F51B5'],
          glowIntensity: 0.6,
          sparkleSize: 'medium'
        }
      case 'rare':
        return {
          particles: 20,
          colors: ['#2196F3', '#03A9F4', '#00BCD4'],
          glowIntensity: 0.4,
          sparkleSize: 'medium'
        }
      case 'common':
        return {
          particles: 10,
          colors: ['#9E9E9E', '#607D8B'],
          glowIntensity: 0.2,
          sparkleSize: 'small'
        }
    }
  }

  const rarityEffects = getRarityEffects(unlockEvent.rarity)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center",
        className
      )}
    >
      <div className="relative w-full max-w-2xl mx-auto px-6">
        {/* Skip button */}
        {onSkip && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            onClick={onSkip}
            className="absolute top-4 right-4 text-white/60 hover:text-white text-sm underline transition-colors z-10"
          >
            Preskočiť animáciu
          </motion.button>
        )}

        {/* Background magical effects */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating particles */}
          {Array.from({ length: rarityEffects.particles }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: rarityEffects.colors[i % rarityEffects.colors.length],
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
              animate={{
                y: [0, -50, -100],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3
              }}
            />
          ))}

          {/* Magical rays */}
          {animationPhase !== 'lock' && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: rarityEffects.glowIntensity, scale: 1 }}
              className="absolute inset-0 bg-gradient-radial from-white/10 via-transparent to-transparent"
            />
          )}
        </div>

        {/* Main unlock content */}
        <div className="relative text-center">
          <AnimatePresence mode="wait">
            {/* Lock Phase */}
            {animationPhase === 'lock' && (
              <motion.div
                key="lock"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                className="space-y-8"
              >
                <motion.div
                  animate={{
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-32 h-32 mx-auto bg-gray-600 rounded-full flex items-center justify-center relative"
                >
                  <Lock className="w-16 h-16 text-white" />

                  {/* Chains around lock */}
                  <div className="absolute inset-0 border-4 border-gray-400 rounded-full opacity-60" />
                  <div className="absolute inset-2 border-2 border-gray-500 rounded-full opacity-40" />
                </motion.div>

                <div>
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Odomykanie novej možnosti...
                  </h2>
                  <p className="text-lg text-gray-300">
                    {unlockEvent.triggerCondition}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Unlock Phase */}
            {animationPhase === 'unlock' && (
              <motion.div
                key="unlock"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                className="space-y-8"
              >
                <motion.div
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1 }}
                  className="relative w-32 h-32 mx-auto"
                >
                  {/* Key animation */}
                  <motion.div
                    initial={{ x: -100, rotate: -45 }}
                    animate={{ x: 0, rotate: 0 }}
                    transition={{ duration: 1, type: "spring" }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Key className="w-16 h-16 text-yellow-400" />
                  </motion.div>

                  {/* Lock breaking */}
                  <motion.div
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0, scale: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="absolute inset-0 bg-gray-600 rounded-full flex items-center justify-center"
                  >
                    <Lock className="w-16 h-16 text-white" />
                  </motion.div>

                  {/* Unlock sparkles */}
                  {Array.from({ length: 8 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.7 + i * 0.1 }}
                      className="absolute text-yellow-400"
                      style={{
                        left: `${50 + Math.cos(i * 45 * Math.PI / 180) * 60}%`,
                        top: `${50 + Math.sin(i * 45 * Math.PI / 180) * 60}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                  ))}
                </motion.div>

                <div>
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Odomknuté! 🎉
                  </h2>
                  <p className="text-lg text-gray-300">
                    Prístup udelený...
                  </p>
                </div>
              </motion.div>
            )}

            {/* Reveal Phase */}
            {animationPhase === 'reveal' && (
              <motion.div
                key="reveal"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 1, type: "spring" }}
                  className={cn(
                    "w-32 h-32 mx-auto rounded-full flex items-center justify-center relative",
                    unlockEvent.gradient
                  )}
                >
                  <div className="text-white text-4xl">
                    {unlockEvent.icon}
                  </div>

                  {/* Glow effect */}
                  <motion.div
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 0.8, 0.5]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-white/20"
                  />
                </motion.div>

                <div>
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-bold text-white mb-4"
                  >
                    {unlockEvent.title}
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl text-gray-300 leading-relaxed max-w-lg mx-auto"
                  >
                    {unlockEvent.description}
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className={cn(
                      "inline-block mt-4 px-4 py-2 rounded-full text-sm font-medium",
                      unlockEvent.rarity === 'legendary' ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white" :
                      unlockEvent.rarity === 'epic' ? "bg-gradient-to-r from-purple-400 to-purple-600 text-white" :
                      unlockEvent.rarity === 'rare' ? "bg-gradient-to-r from-blue-400 to-blue-600 text-white" :
                      "bg-gradient-to-r from-gray-400 to-gray-600 text-white"
                    )}
                  >
                    {unlockEvent.rarity.toUpperCase()} UNLOCK
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Celebration Phase */}
            {animationPhase === 'celebration' && (
              <motion.div
                key="celebration"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={cn(
                    "w-40 h-40 mx-auto rounded-full flex items-center justify-center relative",
                    unlockEvent.gradient
                  )}
                >
                  <div className="text-white text-5xl">
                    {unlockEvent.icon}
                  </div>

                  {/* Crown for legendary */}
                  {unlockEvent.rarity === 'legendary' && (
                    <motion.div
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: -40, opacity: 1 }}
                      className="absolute top-0 left-1/2 transform -translate-x-1/2"
                    >
                      <Crown className="w-8 h-8 text-yellow-400" />
                    </motion.div>
                  )}

                  {/* Multiple glow layers */}
                  <motion.div
                    animate={{
                      scale: [1, 1.4, 1],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-white/30"
                  />

                  <motion.div
                    animate={{
                      scale: [1, 1.6, 1],
                      opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                    className="absolute inset-0 rounded-full bg-white/20"
                  />
                </motion.div>

                <div>
                  <h2 className="text-4xl font-bold text-white mb-4">
                    {unlockEvent.celebrationMessage}
                  </h2>

                  <p className="text-xl text-gray-300 mb-8 max-w-lg mx-auto">
                    Gratulujem! Dosiahli ste dôležitý míľnik na vašej ceste.
                  </p>

                  {/* Rewards */}
                  <AnimatePresence>
                    {showRewards && unlockEvent.rewards && unlockEvent.rewards.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-center gap-2">
                          <Gift className="w-5 h-5" />
                          Nové možnosti
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                          {unlockEvent.rewards.map((reward, index) => (
                            <motion.div
                              key={reward.id}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.2 }}
                              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                            >
                              <div className="flex items-center gap-3 mb-2">
                                <div className="text-yellow-400">
                                  {reward.icon}
                                </div>
                                <h4 className="font-semibold text-white text-sm">
                                  {reward.title}
                                </h4>
                              </div>
                              <p className="text-xs text-gray-300">
                                {reward.description}
                              </p>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    onClick={() => onUnlockComplete(unlockEvent.id)}
                    className="mt-8 bg-white text-gray-900 px-8 py-4 rounded-full font-semibold text-lg shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105"
                  >
                    Pokračovať
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Confetti effect for celebration */}
        {animationPhase === 'celebration' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 50 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3"
                style={{
                  backgroundColor: rarityEffects.colors[i % rarityEffects.colors.length],
                  left: `${Math.random() * 100}%`,
                  top: '-10%'
                }}
                animate={{
                  y: [0, window.innerHeight + 100],
                  x: [(Math.random() - 0.5) * 200],
                  rotate: [0, 360, 720],
                  opacity: [1, 1, 0]
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 3
                }}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Predefined unlock events for common scenarios
export const createPillarUnlockEvent = (pillarId: 'zajtra' | 'navzdy'): UnlockEvent => {
  if (pillarId === 'zajtra') {
    return {
      id: 'unlock_zajtra',
      type: 'pillar',
      title: 'ZAJTRA Odomknuté',
      description: 'Teraz môžete plánovať ochranu svojej budúcnosti a nastaviť strážcov svojho odkazu.',
      icon: <Shield className="w-full h-full" />,
      color: 'bg-green-500',
      gradient: 'bg-gradient-to-br from-green-500 via-emerald-600 to-green-600',
      rarity: 'rare',
      triggerCondition: 'Nahráli ste svoje prvé dokumenty',
      celebrationMessage: 'Budúcnosť je teraz vo vašich rukách!',
      rewards: [
        {
          id: 'guardians_setup',
          type: 'feature',
          title: 'Nastavenie strážcov',
          description: 'Určte dôveryhodné osoby pre prístup k odkazu',
          icon: <Shield className="w-4 h-4" />
        },
        {
          id: 'emergency_plans',
          type: 'feature',
          title: 'Núdzové plány',
          description: 'Vytvorte plány pre neočakávané situácie',
          icon: <Zap className="w-4 h-4" />
        }
      ]
    }
  } else {
    return {
      id: 'unlock_navzdy',
      type: 'pillar',
      title: 'NAVŽDY Odomknuté',
      description: 'Váš odkaz môže teraz pretrvať večne. Vytvorte závety, časové kapsuly a hodnoty pre budúce generácie.',
      icon: <Heart className="w-full h-full" />,
      color: 'bg-purple-500',
      gradient: 'bg-gradient-to-br from-purple-500 via-pink-600 to-purple-600',
      rarity: 'legendary',
      triggerCondition: 'Nastavili ste ochranu a strážcov',
      celebrationMessage: 'Váš odkaz bude žiť navždy!',
      rewards: [
        {
          id: 'will_creation',
          type: 'feature',
          title: 'Tvorba závetu',
          description: 'Vytvorte právne platný závet',
          icon: <Award className="w-4 h-4" />
        },
        {
          id: 'time_capsules',
          type: 'feature',
          title: 'Časové kapsuly',
          description: 'Správy pre budúce významné momenty',
          icon: <Gem className="w-4 h-4" />
        },
        {
          id: 'values_legacy',
          type: 'content',
          title: 'Odkaz hodnôt',
          description: 'Zapíšte svoju múdrosť pre potomkov',
          icon: <Star className="w-4 h-4" />
        }
      ]
    }
  }
}