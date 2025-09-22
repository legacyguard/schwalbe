/**
 * Onboarding Progress Component
 * Emotional progress indicators with Slovak language
 */

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Star, Key, MapPin, CheckCircle, Circle, Sparkles } from 'lucide-react'
import { cn } from '@schwalbe/shared'

export interface OnboardingStep {
  id: string
  title: string
  description: string
  emotionalMessage: string
  icon: React.ReactNode
  estimatedTime: number // in seconds
  status: 'pending' | 'current' | 'completed'
  canSkip: boolean
}

interface OnboardingProgressProps {
  steps: OnboardingStep[]
  currentStepIndex: number
  totalTimeSpent: number
  userName?: string
  className?: string
  variant?: 'minimal' | 'detailed' | 'emotional'
}

export function OnboardingProgress({
  steps,
  currentStepIndex,
  totalTimeSpent,
  userName = "Milý používateľ",
  className,
  variant = 'emotional'
}: OnboardingProgressProps) {
  const completedSteps = steps.filter(step => step.status === 'completed').length
  const totalSteps = steps.length
  const progressPercentage = (completedSteps / totalSteps) * 100

  const getProgressMessage = () => {
    if (completedSteps === 0) {
      return `${userName}, vítame vás na začiatku vašej cesty! ✨`
    } else if (completedSteps === totalSteps) {
      return `Gratulujeme! Dokončili ste celú cestu. Váš odkaz je pripravený. 🎉`
    } else {
      const remaining = totalSteps - completedSteps
      return `Skvelé! Dokončili ste ${completedSteps} z ${totalSteps} krokov. Ešte ${remaining} krok${remaining === 1 ? '' : 'y'} do cieľa.`
    }
  }

  const getTimeMessage = () => {
    const minutes = Math.floor(totalTimeSpent / 60)
    const seconds = totalTimeSpent % 60

    if (minutes === 0) {
      return `${seconds} sekúnd`
    } else if (minutes === 1) {
      return `1 minúta a ${seconds} sekúnd`
    } else {
      return `${minutes} minút a ${seconds} sekúnd`
    }
  }

  const getStepIcon = (step: OnboardingStep, _index: number) => {
    if (step.status === 'completed') {
      return <CheckCircle className="w-5 h-5 text-green-400" />
    } else if (step.status === 'current') {
      return (
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {step.icon}
        </motion.div>
      )
    } else {
      return (
        <div className="text-gray-400">
          <Circle className="w-5 h-5" />
        </div>
      )
    }
  }

  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <div className="flex gap-2">
          {steps.map((step) => (
            <div
              key={step.id}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                step.status === 'completed' && "bg-green-400",
                step.status === 'current' && "bg-blue-400 scale-125",
                step.status === 'pending' && "bg-gray-600"
              )}
            />
          ))}
        </div>
        <span className="text-sm text-gray-400">
          {completedSteps}/{totalSteps}
        </span>
      </div>
    )
  }

  if (variant === 'detailed') {
    return (
      <div className={cn("bg-white/5 backdrop-blur-sm rounded-xl p-4", className)}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Pokrok cesty</h3>
          <span className="text-sm text-gray-300">{getTimeMessage()}</span>
        </div>

        <div className="space-y-3">
          {steps.map((step) => (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg transition-all duration-300",
                step.status === 'current' && "bg-white/10 border border-white/20",
                step.status === 'completed' && "opacity-75"
              )}
            >
              <div className="flex-shrink-0">
                {getStepIcon(step, 0)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={cn(
                    "text-sm font-medium",
                    step.status === 'completed' && "text-green-300",
                    step.status === 'current' && "text-white",
                    step.status === 'pending' && "text-gray-400"
                  )}>
                    {step.title}
                  </h4>
                  {step.canSkip && step.status === 'current' && (
                    <span className="text-xs text-gray-400">(možno preskočiť)</span>
                  )}
                </div>

                <p className="text-xs text-gray-300 line-clamp-1">
                  {step.description}
                </p>
              </div>

              <div className="text-xs text-gray-400">
                ~{Math.ceil(step.estimatedTime / 60)}min
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-300">Celkový pokrok</span>
            <span className="text-white font-medium">{Math.round(progressPercentage)}%</span>
          </div>

          <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
    )
  }

  // Default emotional variant
  return (
    <div className={cn("relative", className)}>
      {/* Main progress card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-lg rounded-2xl p-6 border border-white/10 shadow-2xl"
      >
        {/* Header with emotional message */}
        <div className="text-center mb-6">
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, 2, -2, 0]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="mb-3"
          >
            <Heart className="w-8 h-8 mx-auto text-pink-400" />
          </motion.div>

          <motion.p
            key={currentStepIndex} // Re-animate when step changes
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white font-medium text-lg leading-relaxed"
          >
            {getProgressMessage()}
          </motion.p>

          <p className="text-gray-300 text-sm mt-2">
            Strávili ste s nami {getTimeMessage()}
          </p>
        </div>

        {/* Visual step progress */}
        <div className="relative mb-6">
          {/* Progress bar background */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-700 rounded-full transform -translate-y-1/2" />

          {/* Animated progress bar */}
          <motion.div
            className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 rounded-full transform -translate-y-1/2"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />

          {/* Step indicators */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                className="relative"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Step circle */}
                <div className={cn(
                  "w-8 h-8 rounded-full border-2 flex items-center justify-center relative z-10 transition-all duration-300",
                  step.status === 'completed' && "bg-green-500 border-green-400 shadow-green-500/50",
                  step.status === 'current' && "bg-blue-500 border-blue-400 shadow-blue-500/50 scale-125",
                  step.status === 'pending' && "bg-gray-600 border-gray-500"
                )}>
                  {step.status === 'completed' ? (
                    <CheckCircle className="w-4 h-4 text-white" />
                  ) : step.status === 'current' ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-4 h-4 text-white" />
                    </motion.div>
                  ) : (
                    step.icon && React.cloneElement(step.icon as React.ReactElement, {
                      className: "w-4 h-4 text-gray-400"
                    })
                  )}
                </div>

                {/* Glow effect for current step */}
                {step.status === 'current' && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-blue-400 opacity-30"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 0.1, 0.3]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}

                {/* Step label */}
                <motion.div
                  className="absolute top-10 left-1/2 transform -translate-x-1/2 text-center min-w-20"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                >
                  <div className={cn(
                    "text-xs font-medium mb-1",
                    step.status === 'completed' && "text-green-300",
                    step.status === 'current' && "text-white",
                    step.status === 'pending' && "text-gray-400"
                  )}>
                    {step.title}
                  </div>

                  <div className="text-xs text-gray-500">
                    ~{Math.ceil(step.estimatedTime / 60)}min
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Current step emotional message */}
        <AnimatePresence mode="wait">
          {steps[currentStepIndex] && (
            <motion.div
              key={`emotion-${currentStepIndex}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-4 border border-blue-500/20"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-blue-300">
                  Aktuálny krok
                </span>
                <Star className="w-4 h-4 text-yellow-400" />
              </div>

              <p className="text-white text-sm leading-relaxed">
                {steps[currentStepIndex].emotionalMessage}
              </p>

              {steps[currentStepIndex].canSkip && (
                <p className="text-xs text-gray-400 mt-2">
                  Tento krok môžete preskočiť, ak chcete
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Completion celebration */}
        {completedSteps === totalSteps && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 text-center"
          >
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-4xl mb-2"
            >
              🎉
            </motion.div>

            <p className="text-emerald-300 font-semibold">
              Cesta strážcu spomienok je dokončená!
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Floating particles for ambiance */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/60 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>
    </div>
  )
}

// Preset step configurations for LegacyGuard onboarding
export const LEGACY_GUARD_STEPS: OnboardingStep[] = [
  {
    id: 'sofia-introduction',
    title: 'Stretnutie so Sofiou',
    description: 'Spoznajte vašu digitálnu sprievodkyňu',
    emotionalMessage: 'Sofia sa teší, že vás môže sprevádzať na tejto dôležitej ceste. Každý začiatok je krásny! ✨',
    icon: <Heart className="w-4 h-4" />,
    estimatedTime: 30,
    status: 'pending',
    canSkip: true
  },
  {
    id: 'trust-box',
    title: 'Box Dôvery',
    description: 'Spoznajte miesto, kde budú vaše spomienky v bezpečí',
    emotionalMessage: 'Dôvera je základom všetkého, čo robíme. Váš digitálny box je tak bezpečný ako skutočný trezor. 🔒',
    icon: <Star className="w-4 h-4" />,
    estimatedTime: 45,
    status: 'pending',
    canSkip: false
  },
  {
    id: 'key-graving',
    title: 'Osobný kľúč',
    description: 'Vytvorte si jedinečný kľúč k vášmu odkazu',
    emotionalMessage: 'Váš osobný kľúč bude jedinečný ako odtlačok prsta. Je to symbol toho, že tento odkaz je váš. 🗝️',
    icon: <Key className="w-4 h-4" />,
    estimatedTime: 60,
    status: 'pending',
    canSkip: false
  },
  {
    id: 'journey-path',
    title: 'Cesta Strážcu',
    description: 'Spoznajte svoju cestu k digitálnemu odkazu',
    emotionalMessage: 'Každá cesta má svoje míľniky. Ukazujeme vám cestu, ale tempo si určujete sami. 🛤️',
    icon: <MapPin className="w-4 h-4" />,
    estimatedTime: 90,
    status: 'pending',
    canSkip: false
  }
]