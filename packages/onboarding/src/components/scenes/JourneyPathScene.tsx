/**
 * Scéna 4: Peaceful Journey Path Visualization
 * Fourth and final scene of "Cesta Strážcu Spomienok" onboarding
 */

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { MapPin, TreePine, Home, Heart, Star, Mountain, Flower, ArrowRight, Compass } from 'lucide-react'
import { cn } from '@schwalbe/shared'

interface JourneyPathSceneProps {
  userName: string
  personalizedKey: any
  onComplete: (journeyData: JourneyData) => void
  className?: string
}

interface JourneyData {
  pathChosen: string
  milestones: string[]
  commitment: 'immediate' | 'gradual' | 'comprehensive'
  startingPoint: string
}

interface PathMilestone {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  position: { x: number; y: number }
  unlocked: boolean
  type: 'start' | 'document' | 'protection' | 'legacy' | 'destination'
}

export function JourneyPathScene({
  userName,
  personalizedKey,
  onComplete,
  className
}: JourneyPathSceneProps) {
  const [currentPhase, setCurrentPhase] = useState<'introduction' | 'pathReveal' | 'milestones' | 'commitment' | 'departure'>('introduction')
  const [selectedCommitment, setSelectedCommitment] = useState<'immediate' | 'gradual' | 'comprehensive'>('gradual')
  const [revealedMilestones, setRevealedMilestones] = useState<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  const pathProgress = useTransform(scrollYProgress, [0, 1], [0, 100])

  // Journey milestones
  const milestones: PathMilestone[] = [
    {
      id: 'start',
      title: 'Začiatok cesty',
      description: 'Tu ste teraz - pripravení začať',
      icon: <Home className="w-6 h-6" />,
      position: { x: 10, y: 80 },
      unlocked: true,
      type: 'start'
    },
    {
      id: 'first_documents',
      title: 'Prvé dokumenty',
      description: 'Nahranie najdôležitejších dokumentov',
      icon: <Star className="w-6 h-6" />,
      position: { x: 25, y: 65 },
      unlocked: false,
      type: 'document'
    },
    {
      id: 'family_circle',
      title: 'Rodinný kruh',
      description: 'Nastavenie strážcov a blízkych osôb',
      icon: <Heart className="w-6 h-6" />,
      position: { x: 45, y: 50 },
      unlocked: false,
      type: 'protection'
    },
    {
      id: 'legal_foundation',
      title: 'Právny základ',
      description: 'Vytvorenie základného závetu',
      icon: <Mountain className="w-6 h-6" />,
      position: { x: 65, y: 35 },
      unlocked: false,
      type: 'legacy'
    },
    {
      id: 'complete_legacy',
      title: 'Kompletný odkaz',
      description: 'Váš odkaz je kompletný a zabezpečený',
      icon: <TreePine className="w-6 h-6" />,
      position: { x: 85, y: 20 },
      unlocked: false,
      type: 'destination'
    }
  ]

  // Auto-progression
  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    if (currentPhase === 'introduction') {
      timers.push(setTimeout(() => setCurrentPhase('pathReveal'), 3000))
    } else if (currentPhase === 'pathReveal') {
      timers.push(setTimeout(() => setCurrentPhase('milestones'), 2000))
    } else if (currentPhase === 'milestones') {
      // Reveal milestones progressively
      milestones.forEach((_, index) => {
        timers.push(setTimeout(() => {
          setRevealedMilestones(index + 1)
        }, index * 800))
      })

      timers.push(setTimeout(() => setCurrentPhase('commitment'), milestones.length * 800 + 2000))
    }

    return () => timers.forEach(clearTimeout)
  }, [currentPhase])

  const commitmentOptions = {
    immediate: {
      title: 'Okamžitý štart',
      description: 'Začnem hneď s najdôležitejšími dokumentmi',
      timeframe: '5-10 minút',
      color: 'from-green-400 to-emerald-500',
      intensity: 'high'
    },
    gradual: {
      title: 'Postupné budovanie',
      description: 'Budem pridávať dokumenty svojím tempom',
      timeframe: 'Niekoľko dní',
      color: 'from-blue-400 to-indigo-500',
      intensity: 'medium'
    },
    comprehensive: {
      title: 'Kompletný prístup',
      description: 'Chcem vybudovať úplný a detailný odkaz',
      timeframe: 'Niekoľko týždňov',
      color: 'from-purple-400 to-pink-500',
      intensity: 'comprehensive'
    }
  }

  const handleCommitmentSelect = (commitment: typeof selectedCommitment) => {
    setSelectedCommitment(commitment)
    setTimeout(() => setCurrentPhase('departure'), 500)
  }

  const handleComplete = () => {
    const journeyData: JourneyData = {
      pathChosen: 'guardian_path',
      milestones: milestones.map(m => m.id),
      commitment: selectedCommitment,
      startingPoint: new Date().toISOString()
    }
    onComplete(journeyData)
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "min-h-screen bg-gradient-to-b from-green-900 via-forest-800 to-emerald-900 relative overflow-hidden",
        className
      )}
    >
      {/* Peaceful nature background */}
      <div className="absolute inset-0">
        {/* Floating leaves */}
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-green-400/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${12 + Math.random() * 8}px`
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 8
            }}
          >
            🍃
          </motion.div>
        ))}

        {/* Gentle light rays */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-yellow-200/20 via-transparent to-transparent transform rotate-12" />
        <div className="absolute top-0 left-3/4 w-px h-full bg-gradient-to-b from-yellow-200/15 via-transparent to-transparent transform -rotate-12" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait">
          {/* Introduction Phase */}
          {currentPhase === 'introduction' && (
            <motion.div
              key="introduction"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center max-w-2xl"
            >
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="mb-8"
              >
                <Compass className="w-20 h-20 mx-auto text-emerald-400" />
              </motion.div>

              <h2 className="text-3xl font-bold text-white mb-6">
                Cesta Strážcu Spomienok
              </h2>

              <p className="text-lg text-green-100 leading-relaxed">
                {userName}, teraz vám ukážem cestu, ktorou prejdeme spolu.
                Každý krok na tejto ceste má svoj význam a krásu.
              </p>
            </motion.div>
          )}

          {/* Path Reveal Phase */}
          {currentPhase === 'pathReveal' && (
            <motion.div
              key="pathReveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-4xl"
            >
              <div className="relative h-96">
                {/* Winding path */}
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 400 300"
                  preserveAspectRatio="none"
                >
                  <motion.path
                    d="M 40 240 Q 100 200 180 150 Q 260 100 340 60"
                    stroke="url(#pathGradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 3, ease: "easeInOut" }}
                  />

                  <defs>
                    <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="50%" stopColor="#059669" />
                      <stop offset="100%" stopColor="#047857" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Path glow effect */}
                <motion.div
                  className="absolute inset-0 opacity-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  transition={{ delay: 1.5 }}
                >
                  <div className="absolute top-1/2 left-0 w-full h-2 bg-gradient-to-r from-emerald-400/40 via-green-500/40 to-emerald-600/40 transform -translate-y-1/2 rounded-full blur-lg" />
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2 }}
                className="text-center mt-8"
              >
                <h3 className="text-2xl font-semibold text-white mb-4">
                  Vaša jedinečná cesta
                </h3>
                <p className="text-green-100">
                  Každá cesta začína prvým krokom...
                </p>
              </motion.div>
            </motion.div>
          )}

          {/* Milestones Phase */}
          {currentPhase === 'milestones' && (
            <motion.div
              key="milestones"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-5xl"
            >
              <div className="relative h-[500px]">
                {/* Background path */}
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 10 80 Q 25 65 45 50 Q 65 35 85 20"
                    stroke="#10B981"
                    strokeWidth="0.5"
                    fill="none"
                    strokeDasharray="2,2"
                    className="opacity-60"
                  />
                </svg>

                {/* Milestones */}
                {milestones.map((milestone, index) => (
                  <AnimatePresence key={milestone.id}>
                    {index < revealedMilestones && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          type: "spring",
                          duration: 0.6,
                          delay: 0.2
                        }}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                        style={{
                          left: `${milestone.position.x}%`,
                          top: `${milestone.position.y}%`
                        }}
                      >
                        {/* Milestone circle */}
                        <div className={cn(
                          "w-16 h-16 rounded-full border-4 flex items-center justify-center relative transition-all duration-300",
                          milestone.type === 'start' && "bg-green-500 border-green-300 shadow-green-500/50",
                          milestone.type === 'document' && "bg-blue-500 border-blue-300 shadow-blue-500/50",
                          milestone.type === 'protection' && "bg-purple-500 border-purple-300 shadow-purple-500/50",
                          milestone.type === 'legacy' && "bg-orange-500 border-orange-300 shadow-orange-500/50",
                          milestone.type === 'destination' && "bg-emerald-500 border-emerald-300 shadow-emerald-500/50",
                          "shadow-lg group-hover:scale-110"
                        )}>
                          <div className="text-white">
                            {milestone.icon}
                          </div>

                          {/* Pulse effect for active milestone */}
                          {milestone.type === 'start' && (
                            <motion.div
                              className="absolute inset-0 rounded-full border-4 border-green-300"
                              animate={{
                                scale: [1, 1.5, 1],
                                opacity: [1, 0, 1]
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity
                              }}
                            />
                          )}
                        </div>

                        {/* Milestone info tooltip */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm rounded-lg px-4 py-3 text-center min-w-48 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <h4 className="text-white font-semibold text-sm mb-1">
                            {milestone.title}
                          </h4>
                          <p className="text-gray-300 text-xs leading-relaxed">
                            {milestone.description}
                          </p>
                        </motion.div>

                        {/* Connecting line to next milestone */}
                        {index < milestones.length - 1 && index < revealedMilestones - 1 && (
                          <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.8, duration: 0.6 }}
                            className="absolute top-1/2 left-full w-20 h-0.5 bg-gradient-to-r from-emerald-400 to-transparent origin-left"
                            style={{
                              transform: `translateY(-50%) rotate(${
                                Math.atan2(
                                  milestones[index + 1].position.y - milestone.position.y,
                                  milestones[index + 1].position.x - milestone.position.x
                                ) * 180 / Math.PI
                              }deg)`
                            }}
                          />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 3 }}
                className="text-center mt-8"
              >
                <h3 className="text-2xl font-semibold text-white mb-4">
                  Míľniky vašej cesty
                </h3>
                <p className="text-green-100 max-w-2xl mx-auto">
                  Každý míľnik predstavuje dôležitý krok v budovaní vášho odkazu.
                  Nepotrebujete ich dokončiť všetky naraz - postupujte svojím tempom.
                </p>
              </motion.div>
            </motion.div>
          )}

          {/* Commitment Phase */}
          {currentPhase === 'commitment' && (
            <motion.div
              key="commitment"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center max-w-4xl w-full"
            >
              <Flower className="w-16 h-16 mx-auto text-pink-400 mb-6" />

              <h2 className="text-2xl font-bold text-white mb-4">
                Aké je vaše tempo cesty?
              </h2>

              <p className="text-green-100 mb-8 max-w-2xl mx-auto">
                Vyberte si prístup, ktorý vám najviac vyhovuje.
                Vždy môžete zmeniť tempo neskôr.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(commitmentOptions).map(([key, option]) => (
                  <motion.button
                    key={key}
                    onClick={() => handleCommitmentSelect(key as typeof selectedCommitment)}
                    className={cn(
                      "relative p-6 rounded-2xl border-2 transition-all duration-300 text-left",
                      selectedCommitment === key
                        ? "border-white bg-white/10 scale-105"
                        : "border-gray-600 bg-gray-800/30 hover:border-gray-400 hover:bg-gray-700/30"
                    )}
                    whileHover={{ scale: selectedCommitment === key ? 1.05 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center mb-4",
                      option.color
                    )}>
                      <Star className="w-6 h-6 text-white" />
                    </div>

                    <h3 className="text-lg font-semibold text-white mb-2">
                      {option.title}
                    </h3>

                    <p className="text-sm text-gray-300 mb-3">
                      {option.description}
                    </p>

                    <div className="text-xs text-gray-400">
                      Čas: {option.timeframe}
                    </div>

                    {selectedCommitment === key && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="absolute top-3 right-3"
                      >
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <Heart className="w-3 h-3 text-white" />
                        </div>
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Departure Phase */}
          {currentPhase === 'departure' && (
            <motion.div
              key="departure"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center max-w-2xl"
            >
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="mb-8"
              >
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-2xl">
                  <MapPin className="w-12 h-12 text-white" />
                </div>
              </motion.div>

              <h2 className="text-3xl font-bold text-white mb-6">
                Cesta sa začína! 🌟
              </h2>

              <p className="text-lg text-green-100 mb-8 leading-relaxed">
                Výborne, {userName}! Vybrali ste si <strong>{commitmentOptions[selectedCommitment].title.toLowerCase()}</strong>.
                Sofia bude pri vás na každom kroku a pomôže vám vybudovať krásny digitálny odkaz.
              </p>

              <motion.button
                onClick={handleComplete}
                className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white px-10 py-4 rounded-full font-semibold text-lg shadow-xl transition-all duration-300"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5" />
                  <span>Začať moju cestu</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress indicator */}
      <div className="absolute top-4 left-4">
        <div className="flex items-center gap-2 text-white/60 text-sm">
          <span>Krok 4 z 4</span>
          <div className="w-20 h-1 bg-white/20 rounded-full">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-400 to-green-400 rounded-full"
              initial={{ width: '75%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper component for use in onboarding flow
export function JourneyPathStep() {
  return {
    id: 'journey-path',
    title: 'Cesta Strážcu Spomienok',
    description: 'Spoznajte svoju cestu k digitálnemu odkazu',
    component: JourneyPathScene,
    estimatedTime: 90, // seconds
    canSkip: false, // Final important step
    isAnimated: true,
    isCompletionStep: true
  }
}