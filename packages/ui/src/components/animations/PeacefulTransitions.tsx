'use client'

import React, { ReactNode } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { useAdaptiveAnimation } from './InteractiveAnimations'

// Page transition variants with peaceful themes
const pageTransitionVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 20
  },
  enter: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94], // Peaceful easing
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    scale: 1.05,
    y: -20,
    transition: {
      duration: 0.4,
      ease: [0.76, 0, 0.24, 1]
    }
  }
}

// Gentle floating variants for Sofia's peaceful theme
const floatingVariants: Variants = {
  float: {
    y: [0, -8, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

// Breathing animation for calm elements
const breathingVariants: Variants = {
  breathe: {
    scale: [1, 1.02, 1],
    opacity: [0.8, 1, 0.8],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

// Gentle wave animation
const waveVariants: Variants = {
  wave: {
    background: [
      'linear-gradient(45deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1))',
      'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(16, 185, 129, 0.1))',
      'linear-gradient(45deg, rgba(16, 185, 129, 0.1), rgba(139, 92, 246, 0.1))'
    ],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: "linear"
    }
  }
}

interface PageTransitionProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function PeacefulPageTransition({
  children,
  className = '',
  delay = 0
}: PageTransitionProps) {
  const { shouldReduceMotion } = useAdaptiveAnimation()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      variants={pageTransitionVariants}
      initial="initial"
      animate="enter"
      exit="exit"
      style={{
        transformOrigin: 'center',
      }}
    >
      {children}
    </motion.div>
  )
}

interface FloatingElementProps {
  children: ReactNode
  className?: string
  intensity?: 'gentle' | 'normal' | 'strong'
  delay?: number
}

export function FloatingElement({
  children,
  className = '',
  intensity = 'normal',
  delay = 0
}: FloatingElementProps) {
  const { shouldReduceMotion, personalityMode } = useAdaptiveAnimation()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  const intensityConfig = {
    gentle: { y: [-2, -6, -2], duration: 4 },
    normal: { y: [0, -8, 0], duration: 3 },
    strong: { y: [0, -12, 0], duration: 2.5 }
  }

  const config = intensityConfig[intensity]

  const floatVariants: Variants = {
    float: {
      y: config.y,
      transition: {
        duration: personalityMode === 'empathetic' ? config.duration * 1.2 : config.duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay
      }
    }
  }

  return (
    <motion.div
      className={className}
      variants={floatVariants}
      animate="float"
    >
      {children}
    </motion.div>
  )
}

interface BreathingContainerProps {
  children: ReactNode
  className?: string
  isActive?: boolean
}

export function BreathingContainer({
  children,
  className = '',
  isActive = true
}: BreathingContainerProps) {
  const { shouldReduceMotion, personalityMode } = useAdaptiveAnimation()

  if (shouldReduceMotion || !isActive) {
    return <div className={className}>{children}</div>
  }

  const breatheVariants: Variants = {
    breathe: {
      scale: personalityMode === 'empathetic' ? [1, 1.03, 1] : [1, 1.02, 1],
      opacity: [0.9, 1, 0.9],
      transition: {
        duration: personalityMode === 'empathetic' ? 5 : 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  return (
    <motion.div
      className={className}
      variants={breatheVariants}
      animate="breathe"
    >
      {children}
    </motion.div>
  )
}

interface GentleWaveBackgroundProps {
  children: ReactNode
  className?: string
  colors?: string[]
}

export function GentleWaveBackground({
  children,
  className = '',
  colors = [
    'rgba(139, 92, 246, 0.05)',
    'rgba(59, 130, 246, 0.05)',
    'rgba(16, 185, 129, 0.05)'
  ]
}: GentleWaveBackgroundProps) {
  const { shouldReduceMotion, personalityMode } = useAdaptiveAnimation()

  const waveVariants: Variants = {
    wave: {
      background: [
        `linear-gradient(45deg, ${colors[0]}, ${colors[1]})`,
        `linear-gradient(45deg, ${colors[1]}, ${colors[2]})`,
        `linear-gradient(45deg, ${colors[2]}, ${colors[0]})`
      ],
      transition: {
        duration: personalityMode === 'empathetic' ? 12 : 8,
        repeat: Infinity,
        ease: "linear"
      }
    }
  }

  return (
    <motion.div
      className={`relative ${className}`}
      variants={shouldReduceMotion ? {} : waveVariants}
      animate={shouldReduceMotion ? undefined : "wave"}
    >
      {children}
    </motion.div>
  )
}

interface FadeSlideTransitionProps {
  children: ReactNode
  direction?: 'up' | 'down' | 'left' | 'right'
  className?: string
  delay?: number
}

export function FadeSlideTransition({
  children,
  direction = 'up',
  className = '',
  delay = 0
}: FadeSlideTransitionProps) {
  const { shouldReduceMotion } = useAdaptiveAnimation()

  const directionConfig = {
    up: { y: 30, x: 0 },
    down: { y: -30, x: 0 },
    left: { y: 0, x: 30 },
    right: { y: 0, x: -30 }
  }

  const initial = {
    opacity: 0,
    ...directionConfig[direction]
  }

  const animate = {
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
      delay
    }
  }

  if (shouldReduceMotion) {
    return (
      <motion.div
        className={className}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.1, delay }}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div
      className={className}
      initial={initial}
      animate={animate}
      whileInView={animate}
      viewport={{ once: true, margin: "0px 0px -100px 0px" }}
    >
      {children}
    </motion.div>
  )
}

interface StaggeredRevealProps {
  children: ReactNode[]
  className?: string
  staggerDelay?: number
}

export function StaggeredReveal({
  children,
  className = '',
  staggerDelay = 0.1
}: StaggeredRevealProps) {
  const { shouldReduceMotion } = useAdaptiveAnimation()

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : staggerDelay
      }
    }
  }

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  }

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {children.map((child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

interface MorphingShapeProps {
  className?: string
  shape?: 'circle' | 'square' | 'heart'
  color?: string
}

export function MorphingShape({
  className = '',
  shape = 'circle',
  color = 'rgba(139, 92, 246, 0.3)'
}: MorphingShapeProps) {
  const { shouldReduceMotion, personalityMode } = useAdaptiveAnimation()

  if (shouldReduceMotion) {
    return <div className={`w-8 h-8 rounded-full ${className}`} style={{ backgroundColor: color }} />
  }

  const shapeVariants: Variants = {
    morph: {
      borderRadius: shape === 'circle' ? '50%' : shape === 'square' ? '10%' : '50% 50% 50% 50% / 60% 60% 40% 40%',
      rotate: [0, 180, 360],
      scale: [1, 1.1, 1],
      transition: {
        duration: personalityMode === 'empathetic' ? 6 : 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  return (
    <motion.div
      className={`w-8 h-8 ${className}`}
      style={{ backgroundColor: color }}
      variants={shapeVariants}
      animate="morph"
    />
  )
}

interface ParallaxContainerProps {
  children: ReactNode
  className?: string
  speed?: number
}

export function ParallaxContainer({
  children,
  className = '',
  speed = 0.5
}: ParallaxContainerProps) {
  const { shouldReduceMotion } = useAdaptiveAnimation()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      style={{
        willChange: 'transform'
      }}
      whileInView={{
        y: [50, -50]
      }}
      viewport={{ once: false }}
      transition={{
        duration: 2,
        ease: "linear"
      }}
    >
      {children}
    </motion.div>
  )
}

export default {
  PeacefulPageTransition,
  FloatingElement,
  BreathingContainer,
  GentleWaveBackground,
  FadeSlideTransition,
  StaggeredReveal,
  MorphingShape,
  ParallaxContainer
}