/**
 * Scéna 1: Sofia Introduction with Firefly Animation
 * First scene of "Cesta Strážcu Spomienok" onboarding
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Heart, Star, ArrowRight } from 'lucide-react'
import { cn } from '@schwalbe/shared'

interface SofiaIntroductionSceneProps {
  onComplete: () => void
  className?: string
}

export function SofiaIntroductionScene({
  onComplete,
  className
}: SofiaIntroductionSceneProps) {
  const [currentPhase, setCurrentPhase] = useState<'arrival' | 'introduction' | 'promise' | 'ready'>('arrival')
  const [showFireflies, setShowFireflies] = useState(false)
  const [showSofia, setShowSofia] = useState(false)

  // Orchestrate the scene phases
  useEffect(() => {
    const timeline = [
      { phase: 'arrival', delay: 500 },
      { phase: 'introduction', delay: 3000 },
      { phase: 'promise', delay: 6000 },
      { phase: 'ready', delay: 9000 }
    ]

    const timers = timeline.map(({ phase, delay }) =>
      setTimeout(() => {
        setCurrentPhase(phase as typeof currentPhase)
        if (phase === 'arrival') setShowFireflies(true)
        if (phase === 'introduction') setShowSofia(true)
      }, delay)
    )

    return () => timers.forEach(clearTimeout)
  }, [])

  const generateFireflies = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 2
    }))
  }

  const fireflies = generateFireflies(12)

  const messages = {
    arrival: "",
    introduction: "Ahoj, som Sofia. Vaša svetluška na tejto dôležitej ceste.",
    promise: "Budem vás sprevádzať a pomôžem vám bezpečne uchovať vaše najcennejšie spomienky.",
    ready: "Ste pripravení začať budovať váš digitálny odkaz?"
  }

  const handleContinue = () => {
    if (currentPhase === 'ready') {
      onComplete()
    } else {
      // Skip to ready phase if user wants to continue
      setCurrentPhase('ready')
    }
  }

  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden flex items-center justify-center",
      className
    )}>
      {/* Background stars */}
      <div className="absolute inset-0">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      {/* Floating fireflies */}
      <AnimatePresence>
        {showFireflies && fireflies.map((firefly) => (
          <motion.div
            key={firefly.id}
            className="absolute w-3 h-3 rounded-full bg-amber-400 shadow-lg"
            style={{
              left: `${firefly.x}%`,
              top: `${firefly.y}%`,
              boxShadow: '0 0 20px rgba(251, 191, 36, 0.8), 0 0 40px rgba(251, 191, 36, 0.4)'
            }}
            initial={{
              opacity: 0,
              scale: 0,
              x: 0,
              y: 0
            }}
            animate={{
              opacity: [0, 1, 0.7, 1, 0.4, 1],
              scale: [0, 1, 0.8, 1.2, 0.9, 1],
              x: [0, 30, -20, 40, -10, 20],
              y: [0, -25, 15, -30, 10, -15]
            }}
            transition={{
              duration: firefly.duration,
              delay: firefly.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {/* Inner glow */}
            <div className="absolute inset-0 rounded-full bg-yellow-200 animate-pulse" />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Main Sofia character */}
      <div className="relative z-10 text-center max-w-2xl mx-auto px-6">
        <AnimatePresence mode="wait">
          {showSofia && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1, type: "spring" }}
              className="mb-8"
            >
              {/* Sofia's main firefly representation */}
              <motion.div
                className="relative mx-auto w-32 h-32 mb-6"
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {/* Outer glow */}
                <div className="absolute inset-0 rounded-full bg-amber-400 opacity-30 animate-pulse scale-110" />

                {/* Main firefly body */}
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-orange-400 shadow-2xl">
                  <div className="absolute inset-2 rounded-full bg-yellow-200 opacity-60" />

                  {/* Sparkle effects */}
                  <motion.div
                    className="absolute top-2 right-2 text-white"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>

                  <motion.div
                    className="absolute bottom-3 left-3 text-white"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Star className="w-3 h-3" />
                  </motion.div>
                </div>

                {/* Wings */}
                <motion.div
                  className="absolute -left-2 top-1/2 -translate-y-1/2"
                  animate={{
                    rotate: [0, 15, -15, 0],
                    opacity: [0.6, 0.9, 0.6]
                  }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <div className="w-8 h-12 bg-white/30 rounded-full transform -rotate-12" />
                </motion.div>

                <motion.div
                  className="absolute -right-2 top-1/2 -translate-y-1/2"
                  animate={{
                    rotate: [0, -15, 15, 0],
                    opacity: [0.6, 0.9, 0.6]
                  }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                >
                  <div className="w-8 h-12 bg-white/30 rounded-full transform rotate-12" />
                </motion.div>
              </motion.div>

              {/* Sofia's name */}
              <motion.h1
                className="text-4xl font-bold text-white mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Sofia Firefly
              </motion.h1>

              <motion.p
                className="text-amber-200 text-lg mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                Vaša svetluška a sprievodca odkazom
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message area */}
        <div className="min-h-[120px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {messages[currentPhase] && (
              <motion.div
                key={currentPhase}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8 }}
                className="text-center"
              >
                <p className="text-xl text-white leading-relaxed mb-6 max-w-lg">
                  {messages[currentPhase]}
                </p>

                {currentPhase === 'ready' && (
                  <motion.button
                    onClick={handleContinue}
                    className="group bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1, type: "spring" }}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="flex items-center gap-3">
                      <Heart className="w-5 h-5 group-hover:text-red-200 transition-colors" />
                      <span>Áno, začnime!</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Skip option for phases before ready */}
        {currentPhase !== 'ready' && (
          <motion.button
            onClick={handleContinue}
            className="absolute bottom-8 right-8 text-white/60 hover:text-white text-sm underline transition-colors"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            Preskočiť animáciu
          </motion.button>
        )}
      </div>

      {/* Floating particles for ambiance */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-blue-300 rounded-full opacity-40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              y: [0, -100, -200, -300],
              opacity: [0, 0.6, 0.3, 0],
              scale: [0, 1, 0.5, 0]
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 8
            }}
          />
        ))}
      </div>
    </div>
  )
}

// Helper component for use in onboarding flow
export function SofiaIntroductionStep() {
  return {
    id: 'sofia-introduction',
    title: 'Stretnutie so Sofiou',
    description: 'Spoznajte vašu digitálnu sprievodkyňu',
    component: SofiaIntroductionScene,
    estimatedTime: 30, // seconds
    canSkip: true,
    isAnimated: true
  }
}