'use client'

import React, { useState, useEffect, ReactNode } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Heart,
  Sparkles,
  Zap,
  Shield,
  Target,
  Smile,
  Frown,
  Meh
} from 'lucide-react'
import { useAdaptiveAnimation } from './InteractiveAnimations'

export type EmotionalState = 'success' | 'error' | 'warning' | 'info'
export type EmotionIntensity = 'subtle' | 'normal' | 'intense'
export type SofiaEmotion = 'happy' | 'proud' | 'concerned' | 'encouraging' | 'celebrating' | 'sympathetic'

interface EmotionalStateProps {
  state: EmotionalState
  emotion?: SofiaEmotion
  intensity?: EmotionIntensity
  title: string
  message: string
  children?: ReactNode
  duration?: number
  onDismiss?: () => void
  showSofia?: boolean
  actions?: Array<{
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary'
  }>
  className?: string
}

// Sofia's emotional responses for each state
const sofiaEmotions = {
  success: {
    happy: {
      icon: Heart,
      message: "Som tak šťastná za váš úspech! ✨",
      color: "text-pink-500",
      bgColor: "bg-pink-50"
    },
    proud: {
      icon: Sparkles,
      message: "Som na vás nesmierne hrdá! 🌟",
      color: "text-purple-500",
      bgColor: "bg-purple-50"
    },
    celebrating: {
      icon: Zap,
      message: "Hurá! Oslavujme tento moment! 🎉",
      color: "text-yellow-500",
      bgColor: "bg-yellow-50"
    }
  },
  error: {
    concerned: {
      icon: Shield,
      message: "Nebojte sa, postaráme sa o to spolu 💙",
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    sympathetic: {
      icon: Heart,
      message: "Rozumiem vašej frustrácii, skúsime to znovu 🤗",
      color: "text-purple-500",
      bgColor: "bg-purple-50"
    },
    encouraging: {
      icon: Target,
      message: "Každá chyba nás posúva vpred! 💪",
      color: "text-green-500",
      bgColor: "bg-green-50"
    }
  },
  warning: {
    concerned: {
      icon: AlertCircle,
      message: "Upozorňujem vás s láskou a starostlivosťou ⚠️",
      color: "text-orange-500",
      bgColor: "bg-orange-50"
    },
    encouraging: {
      icon: Sparkles,
      message: "Máte na to, len buďte opatrní ✨",
      color: "text-amber-500",
      bgColor: "bg-amber-50"
    }
  },
  info: {
    happy: {
      icon: Info,
      message: "Mám pre vás užitočnú informáciu! 📝",
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    encouraging: {
      icon: Sparkles,
      message: "Toto vám určite pomôže na ceste! ✨",
      color: "text-indigo-500",
      bgColor: "bg-indigo-50"
    }
  }
}

// State configurations
const stateConfig = {
  success: {
    icon: CheckCircle,
    primaryColor: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    accentColor: "text-green-500"
  },
  error: {
    icon: XCircle,
    primaryColor: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    accentColor: "text-red-500"
  },
  warning: {
    icon: AlertCircle,
    primaryColor: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    accentColor: "text-yellow-500"
  },
  info: {
    icon: Info,
    primaryColor: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    accentColor: "text-blue-500"
  }
}

export function EmotionalStateNotification({
  state,
  emotion = 'happy',
  intensity = 'normal',
  title,
  message,
  children,
  duration = 0,
  onDismiss,
  showSofia = true,
  actions = [],
  className = ''
}: EmotionalStateProps) {
  const { personalityMode, shouldReduceMotion } = useAdaptiveAnimation()
  const [isVisible, setIsVisible] = useState(true)

  // Auto-dismiss functionality
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => onDismiss?.(), 300)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onDismiss])

  const config = stateConfig[state]
  const sofiaConfig = showSofia ? sofiaEmotions[state][emotion] : null

  // Animation variants based on intensity and personality
  const containerVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.9,
      y: intensity === 'intense' ? 50 : 30
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: personalityMode === 'empathetic' ? 300 : 400,
        damping: personalityMode === 'empathetic' ? 25 : 30,
        duration: intensity === 'intense' ? 0.8 : 0.5
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: -20,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  }

  const iconVariants: Variants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 20,
        delay: 0.2
      }
    }
  }

  const pulseVariants: Variants = {
    pulse: shouldReduceMotion ? {} : {
      scale: intensity === 'intense' ? [1, 1.1, 1] : [1, 1.05, 1],
      transition: {
        duration: personalityMode === 'empathetic' ? 2 : 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  // Celebration particles for success states
  const createCelebrationParticles = () => {
    if (state !== 'success' || intensity === 'subtle' || shouldReduceMotion) return null

    return [...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full"
        initial={{
          x: 0,
          y: 0,
          scale: 0,
          opacity: 0
        }}
        animate={{
          x: (Math.cos((i * 45) * Math.PI / 180)) * 60,
          y: (Math.sin((i * 45) * Math.PI / 180)) * 60,
          scale: [0, 1, 0],
          opacity: [0, 1, 0]
        }}
        transition={{
          duration: 2,
          delay: i * 0.1,
          ease: "easeOut"
        }}
      />
    ))
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        className={`relative overflow-hidden rounded-lg border ${config.borderColor} ${config.bgColor} p-6 shadow-lg ${className}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Background wave effect for empathetic personality */}
        {personalityMode === 'empathetic' && !shouldReduceMotion && (
          <motion.div
            className="absolute inset-0 opacity-30"
            animate={{
              background: [
                'linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)',
                'linear-gradient(45deg, transparent, rgba(255,255,255,0.2), transparent)',
                'linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)'
              ]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}

        <div className="relative z-10 flex items-start space-x-4">
          {/* Main State Icon */}
          <motion.div
            className="relative flex-shrink-0"
            variants={iconVariants}
          >
            <motion.div
              className={`flex items-center justify-center w-12 h-12 rounded-full ${config.bgColor} ${config.primaryColor}`}
              variants={pulseVariants}
              animate="pulse"
            >
              <config.icon className="w-6 h-6" />
            </motion.div>

            {/* Celebration particles */}
            {createCelebrationParticles()}
          </motion.div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <motion.h3
              className={`text-lg font-semibold ${config.primaryColor} mb-1`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              {title}
            </motion.h3>

            <motion.p
              className="text-gray-700 mb-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              {message}
            </motion.p>

            {children && (
              <motion.div
                className="mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                {children}
              </motion.div>
            )}

            {/* Sofia's Emotional Response */}
            {sofiaConfig && (
              <motion.div
                className={`flex items-center space-x-2 p-3 rounded-lg ${sofiaConfig.bgColor} mb-4`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <motion.div
                  animate={shouldReduceMotion ? {} : {
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <sofiaConfig.icon className={`w-5 h-5 ${sofiaConfig.color}`} />
                </motion.div>
                <span className={`text-sm font-medium ${sofiaConfig.color}`}>
                  Sofia: {sofiaConfig.message}
                </span>
              </motion.div>
            )}

            {/* Actions */}
            {actions.length > 0 && (
              <motion.div
                className="flex space-x-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.4 }}
              >
                {actions.map((action, index) => (
                  <motion.button
                    key={index}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      action.variant === 'primary'
                        ? `bg-gradient-to-r ${
                            state === 'success' ? 'from-green-500 to-green-600' :
                            state === 'error' ? 'from-red-500 to-red-600' :
                            state === 'warning' ? 'from-yellow-500 to-yellow-600' :
                            'from-blue-500 to-blue-600'
                          } text-white shadow-md hover:shadow-lg`
                        : `${config.bgColor} ${config.primaryColor} hover:bg-opacity-80`
                    }`}
                    onClick={action.onClick}
                    whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                  >
                    {action.label}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Dismiss Button */}
          {onDismiss && (
            <motion.button
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => {
                setIsVisible(false)
                setTimeout(() => onDismiss(), 300)
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.3 }}
              whileHover={shouldReduceMotion ? {} : { scale: 1.1 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.9 }}
            >
              <XCircle className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// Specialized components for common use cases
interface ToastProps {
  type: EmotionalState
  message: string
  isVisible: boolean
  onDismiss: () => void
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

export function EmotionalToast({
  type,
  message,
  isVisible,
  onDismiss,
  position = 'top-right'
}: ToastProps) {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed z-50 ${positionClasses[position]}`}
          initial={{ opacity: 0, x: position.includes('right') ? 100 : -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: position.includes('right') ? 100 : -100 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <EmotionalStateNotification
            state={type}
            title={type.charAt(0).toUpperCase() + type.slice(1)}
            message={message}
            onDismiss={onDismiss}
            duration={4000}
            intensity="subtle"
            className="max-w-sm"
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Inline state indicators
interface InlineStateProps {
  state: EmotionalState
  text: string
  showIcon?: boolean
  className?: string
}

export function InlineEmotionalState({
  state,
  text,
  showIcon = true,
  className = ''
}: InlineStateProps) {
  const { shouldReduceMotion } = useAdaptiveAnimation()
  const config = stateConfig[state]

  return (
    <motion.div
      className={`inline-flex items-center space-x-2 ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {showIcon && (
        <motion.div
          animate={shouldReduceMotion ? {} : {
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <config.icon className={`w-4 h-4 ${config.accentColor}`} />
        </motion.div>
      )}
      <span className={`text-sm font-medium ${config.primaryColor}`}>
        {text}
      </span>
    </motion.div>
  )
}

export default {
  EmotionalStateNotification,
  EmotionalToast,
  InlineEmotionalState
}