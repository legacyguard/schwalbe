/**
 * Scéna 3: Personalized Key Graving Animation
 * Third scene of "Cesta Strážcu Spomienok" onboarding
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Key, Sparkles, Heart, User, ArrowRight, Check } from 'lucide-react'
import { cn } from '@schwalbe/shared'

interface KeyGravingSceneProps {
  userName?: string
  onComplete: (personalizedKey: PersonalizedKey) => void
  className?: string
}

interface PersonalizedKey {
  name: string
  keyId: string
  gravingStyle: 'elegant' | 'modern' | 'classic'
  personalTouch: string
  createdAt: Date
}

export function KeyGravingScene({
  userName = "Milý používateľ",
  onComplete,
  className
}: KeyGravingSceneProps) {
  const [currentPhase, setCurrentPhase] = useState<'introduction' | 'nameInput' | 'styleSelection' | 'graving' | 'completion'>('introduction')
  const [enteredName, setEnteredName] = useState(userName)
  const [selectedStyle, setSelectedStyle] = useState<'elegant' | 'modern' | 'classic'>('elegant')
  const [gravingProgress, setGravingProgress] = useState(0)
  const [showSparkles, setShowSparkles] = useState(false)

  // Auto-progress from introduction
  useEffect(() => {
    if (currentPhase === 'introduction') {
      const timer = setTimeout(() => setCurrentPhase('nameInput'), 3000)
      return () => clearTimeout(timer)
    }
  }, [currentPhase])

  // Graving animation
  useEffect(() => {
    if (currentPhase === 'graving') {
      setShowSparkles(true)
      const interval = setInterval(() => {
        setGravingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            setTimeout(() => setCurrentPhase('completion'), 1000)
            return 100
          }
          return prev + 2
        })
      }, 50)
      return () => clearInterval(interval)
    }
  }, [currentPhase])

  const keyStyles = {
    elegant: {
      name: 'Elegantný',
      description: 'Jemné línie s kvetinovou výzdobou',
      color: 'from-pink-400 to-purple-500',
      pattern: '✿ ❀ ✿'
    },
    modern: {
      name: 'Moderný',
      description: 'Čisté geometrické tvary',
      color: 'from-blue-400 to-cyan-500',
      pattern: '▸ ◆ ▸'
    },
    classic: {
      name: 'Klasický',
      description: 'Tradičná zdobená forma',
      color: 'from-amber-400 to-orange-500',
      pattern: '⚜ ❦ ⚜'
    }
  }

  const handleNameSubmit = () => {
    if (enteredName.trim()) {
      setCurrentPhase('styleSelection')
    }
  }

  const handleStyleSelect = (style: typeof selectedStyle) => {
    setSelectedStyle(style)
    setTimeout(() => setCurrentPhase('graving'), 500)
  }

  const handleComplete = () => {
    const personalizedKey: PersonalizedKey = {
      name: enteredName,
      keyId: `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      gravingStyle: selectedStyle,
      personalTouch: keyStyles[selectedStyle].pattern,
      createdAt: new Date()
    }
    onComplete(personalizedKey)
  }

  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-slate-800 via-gray-800 to-slate-900 relative flex items-center justify-center overflow-hidden",
      className
    )}>
      {/* Background workshop ambiance */}
      <div className="absolute inset-0">
        {/* Workshop sparkles */}
        {showSparkles && Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400 rounded-full"
            style={{
              left: `${30 + Math.random() * 40}%`,
              top: `${30 + Math.random() * 40}%`
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              x: [(Math.random() - 0.5) * 100],
              y: [(Math.random() - 0.5) * 100]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}

        {/* Warm workshop lighting */}
        <div className="absolute inset-0 bg-gradient-radial from-amber-500/10 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto px-6">
        <AnimatePresence mode="wait">
          {/* Introduction Phase */}
          {currentPhase === 'introduction' && (
            <motion.div
              key="introduction"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <motion.div
                className="mb-8"
                animate={{
                  rotateY: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Key className="w-24 h-24 mx-auto text-amber-400 mb-4" />
              </motion.div>

              <h2 className="text-3xl font-bold text-white mb-4">
                Vytvorenie vášho osobného kľúča
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                Každý strážca spomienok potrebuje jedinečný kľúč.
                Teraz si vytvoríme kľúč, ktorý bude patriť len vám.
              </p>
            </motion.div>
          )}

          {/* Name Input Phase */}
          {currentPhase === 'nameInput' && (
            <motion.div
              key="nameInput"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <User className="w-16 h-16 mx-auto text-blue-400 mb-6" />

              <h2 className="text-2xl font-bold text-white mb-4">
                Ako sa máme k vám oslovovať?
              </h2>

              <p className="text-gray-300 mb-8">
                Vaše meno bude vyryté na kľúči ako znak vlastníctva
              </p>

              <div className="max-w-md mx-auto">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="relative"
                >
                  <input
                    type="text"
                    value={enteredName}
                    onChange={(e) => setEnteredName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleNameSubmit()}
                    placeholder="Vaše meno alebo prezývka"
                    className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-full text-white placeholder-gray-400 text-center text-lg focus:outline-none focus:border-amber-400 focus:bg-white/15 transition-all"
                    autoFocus
                  />

                  <motion.button
                    onClick={handleNameSubmit}
                    disabled={!enteredName.trim()}
                    className="mt-6 bg-gradient-to-r from-amber-500 to-orange-500 disabled:from-gray-500 disabled:to-gray-600 text-white px-8 py-3 rounded-full font-semibold disabled:opacity-50 transition-all hover:scale-105"
                    whileHover={{ scale: enteredName.trim() ? 1.05 : 1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Pokračovať
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Style Selection Phase */}
          {currentPhase === 'styleSelection' && (
            <motion.div
              key="styleSelection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <Sparkles className="w-16 h-16 mx-auto text-purple-400 mb-6" />

              <h2 className="text-2xl font-bold text-white mb-4">
                Vyberte si štýl vášho kľúča
              </h2>

              <p className="text-gray-300 mb-8">
                Každý štýl má svoju jedinečnú krásu a osobnosť
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {Object.entries(keyStyles).map(([styleKey, style]) => (
                  <motion.button
                    key={styleKey}
                    onClick={() => handleStyleSelect(styleKey as typeof selectedStyle)}
                    className={cn(
                      "relative p-6 rounded-2xl border-2 transition-all duration-300 group",
                      selectedStyle === styleKey
                        ? "border-white bg-white/10"
                        : "border-gray-600 bg-gray-800/50 hover:border-gray-400 hover:bg-gray-700/50"
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Key preview */}
                    <div className={cn(
                      "w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br flex items-center justify-center",
                      style.color
                    )}>
                      <Key className="w-8 h-8 text-white" />
                    </div>

                    <h3 className="text-lg font-semibold text-white mb-2">
                      {style.name}
                    </h3>

                    <p className="text-sm text-gray-300 mb-3">
                      {style.description}
                    </p>

                    <div className="text-xl text-gray-300 tracking-wider">
                      {style.pattern}
                    </div>

                    {selectedStyle === styleKey && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-3 right-3"
                      >
                        <Check className="w-5 h-5 text-green-400" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Graving Phase */}
          {currentPhase === 'graving' && (
            <motion.div
              key="graving"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <motion.div
                className="mb-8"
                animate={{
                  rotate: [0, 2, -2, 0],
                  scale: [1, 1.02, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className={cn(
                  "w-32 h-32 mx-auto rounded-2xl bg-gradient-to-br flex items-center justify-center relative overflow-hidden",
                  keyStyles[selectedStyle].color
                )}>
                  {/* Key shape */}
                  <Key className="w-16 h-16 text-white z-10" />

                  {/* Graving progress overlay */}
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    style={{
                      clipPath: `inset(0 ${100 - gravingProgress}% 0 0)`
                    }}
                  />

                  {/* Graving sparks */}
                  {showSparkles && (
                    <div className="absolute inset-0">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                          style={{
                            left: `${20 + (gravingProgress / 100) * 60}%`,
                            top: `${30 + Math.random() * 40}%`
                          }}
                          animate={{
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0],
                            x: [0, (Math.random() - 0.5) * 20],
                            y: [0, (Math.random() - 0.5) * 20]
                          }}
                          transition={{
                            duration: 0.5,
                            repeat: Infinity,
                            delay: Math.random() * 0.5
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>

              <h2 className="text-2xl font-bold text-white mb-4">
                Vyrývame váš kľúč...
              </h2>

              <p className="text-gray-300 mb-6">
                {enteredName} • {keyStyles[selectedStyle].name} štýl
              </p>

              {/* Progress bar */}
              <div className="max-w-md mx-auto mb-4">
                <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className={cn(
                      "h-full bg-gradient-to-r",
                      keyStyles[selectedStyle].color
                    )}
                    style={{ width: `${gravingProgress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  {Math.round(gravingProgress)}% dokončené
                </p>
              </div>

              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-sm text-amber-400"
              >
                Umelecký proces v priebehu...
              </motion.div>
            </motion.div>
          )}

          {/* Completion Phase */}
          {currentPhase === 'completion' && (
            <motion.div
              key="completion"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <div className={cn(
                  "w-40 h-40 mx-auto rounded-3xl bg-gradient-to-br flex flex-col items-center justify-center relative shadow-2xl",
                  keyStyles[selectedStyle].color
                )}>
                  <Key className="w-20 h-20 text-white mb-2" />
                  <div className="text-white font-semibold text-sm">
                    {enteredName}
                  </div>
                  <div className="text-white/80 text-xs mt-1">
                    {keyStyles[selectedStyle].pattern}
                  </div>

                  {/* Glow effect */}
                  <div className="absolute -inset-2 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-3xl animate-pulse" />
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="text-3xl font-bold text-white mb-4">
                  Váš kľúč je pripravený! ✨
                </h2>

                <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                  Krásne! Teraz máte jedinečný kľúč s menom <span className="text-amber-400 font-semibold">{enteredName}</span>
                  {' '}v {keyStyles[selectedStyle].name.toLowerCase()} štýle.
                  Tento kľúč otvorí dvere k vášmu digitálnemu odkazu.
                </p>

                <motion.button
                  onClick={handleComplete}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-xl transition-all duration-300"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7, type: "spring" }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5" />
                    <span>Uložiť môj kľúč</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress indicator */}
      <div className="absolute top-4 left-4">
        <div className="flex items-center gap-2 text-white/60 text-sm">
          <span>Krok 3 z 4</span>
          <div className="w-20 h-1 bg-white/20 rounded-full">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
              initial={{ width: '50%' }}
              animate={{ width: '75%' }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper component for use in onboarding flow
export function KeyGravingStep() {
  return {
    id: 'key-graving',
    title: 'Osobný kľúč',
    description: 'Vytvorte si jedinečný kľúč k vášmu odkazu',
    component: KeyGravingScene,
    estimatedTime: 60, // seconds
    canSkip: false, // Important personalization moment
    isAnimated: true,
    collectsData: true
  }
}