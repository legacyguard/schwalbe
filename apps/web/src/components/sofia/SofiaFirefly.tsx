/**
 * Sofia Animated Firefly Component
 * Premium liquid glass design with Apple-style animations
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageCircle } from 'lucide-react';

interface SofiaFireflyProps {
  isActive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showDialog?: boolean;
  message?: string;
  onInteraction?: () => void;
  className?: string;
  position?: { x: number; y: number };
  autofly?: boolean;
}

export function SofiaFirefly({
  isActive = true,
  size = 'md',
  showDialog = false,
  message,
  onInteraction,
  className = '',
  position,
  autofly = true
}: SofiaFireflyProps) {
  const [isGlowing, setIsGlowing] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(showDialog);
  const containerRef = useRef<HTMLDivElement>(null);

  // Size configurations
  const sizeConfig = {
    sm: { core: 8, glow: 16, trail: 12 },
    md: { core: 12, glow: 24, trail: 18 },
    lg: { core: 16, glow: 32, trail: 24 }
  };

  const config = sizeConfig[size];

  // Breathing glow effect
  useEffect(() => {
    if (!isActive) return;

    const glowInterval = setInterval(() => {
      setIsGlowing(prev => !prev);
    }, 2000 + Math.random() * 1000);

    return () => clearInterval(glowInterval);
  }, [isActive]);

  // Auto-dialog timing
  useEffect(() => {
    if (showDialog && message) {
      setDialogVisible(true);
      const timer = setTimeout(() => setDialogVisible(false), 5000);
      return () => clearTimeout(timer);
    }
    return undefined; // Explicit return for when condition is not met
  }, [showDialog, message]);

  // Floating animation variants
  const floatingVariants = {
    animate: {
      y: [0, -8, 0],
      x: [0, 4, -4, 0],
      transition: {
        duration: 4 + Math.random() * 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Trail particles animation
  const trailVariants = {
    animate: {
      scale: [0.8, 1.2, 0.8],
      opacity: [0.6, 0.3, 0.6],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Glow animation
  const glowVariants = {
    rest: {
      scale: 1,
      opacity: 0.6,
    },
    active: {
      scale: 1.3,
      opacity: 0.9,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={position ? {
        position: 'absolute',
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)'
      } : {}}
    >
      {/* Sofia Firefly */}
      <motion.div
        variants={autofly ? floatingVariants : {}}
        animate={isActive ? "animate" : ""}
        className="relative cursor-pointer"
        onClick={onInteraction}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Outer glow ring */}
        <motion.div
          variants={glowVariants}
          animate={isGlowing ? "active" : "rest"}
          className="absolute inset-0 rounded-full"
          style={{
            width: config.glow,
            height: config.glow,
            background: `
              radial-gradient(circle at center,
                rgba(99, 102, 241, 0.4) 0%,
                rgba(139, 92, 246, 0.3) 30%,
                rgba(168, 85, 247, 0.2) 60%,
                transparent 100%
              )
            `,
            filter: 'blur(4px)',
            transform: 'translate(-50%, -50%)',
            left: '50%',
            top: '50%'
          }}
        />

        {/* Middle glow */}
        <motion.div
          variants={glowVariants}
          animate={isGlowing ? "active" : "rest"}
          className="absolute inset-0 rounded-full"
          style={{
            width: config.glow * 0.7,
            height: config.glow * 0.7,
            background: `
              radial-gradient(circle at center,
                rgba(99, 102, 241, 0.6) 0%,
                rgba(139, 92, 246, 0.4) 50%,
                transparent 100%
              )
            `,
            filter: 'blur(2px)',
            transform: 'translate(-50%, -50%)',
            left: '50%',
            top: '50%'
          }}
        />

        {/* Core firefly body */}
        <motion.div
          className="relative z-10 rounded-full flex items-center justify-center"
          style={{
            width: config.core,
            height: config.core,
            background: `
              linear-gradient(135deg,
                rgba(99, 102, 241, 0.95) 0%,
                rgba(139, 92, 246, 0.9) 50%,
                rgba(168, 85, 247, 0.85) 100%
              )
            `,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: `
              0 0 ${config.core}px rgba(99, 102, 241, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.2)
            `
          }}
          whileHover={{
            boxShadow: `
              0 0 ${config.core * 1.5}px rgba(99, 102, 241, 0.5),
              inset 0 1px 0 rgba(255, 255, 255, 0.3)
            `
          }}
        >
          <Sparkles
            size={config.core * 0.5}
            className="text-white drop-shadow-sm"
          />
        </motion.div>

        {/* Trailing particles */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            variants={trailVariants}
            animate="animate"
            className="absolute rounded-full"
            style={{
              width: config.trail * (0.3 + i * 0.1),
              height: config.trail * (0.3 + i * 0.1),
              background: `
                radial-gradient(circle,
                  rgba(139, 92, 246, ${0.4 - i * 0.1}) 0%,
                  transparent 70%
                )
              `,
              left: '50%',
              top: '50%',
              transform: `translate(${-50 + (i + 1) * 8}%, ${-50 + (i + 1) * 6}%)`,
              animationDelay: `${i * 0.2}s`
            }}
          />
        ))}
      </motion.div>

      {/* Dialog bubble */}
      <AnimatePresence>
        {dialogVisible && message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="absolute bottom-full mb-4 left-1/2 transform -translate-x-1/2 min-w-max max-w-xs z-20"
          >
            {/* Speech bubble */}
            <div
              className="relative px-4 py-3 rounded-2xl text-sm font-medium text-white shadow-2xl"
              style={{
                background: `
                  linear-gradient(135deg,
                    rgba(15, 23, 42, 0.95) 0%,
                    rgba(30, 41, 59, 0.9) 100%
                  )
                `,
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: `
                  0 20px 40px rgba(0, 0, 0, 0.3),
                  inset 0 1px 0 rgba(255, 255, 255, 0.1)
                `
              }}
            >
              {message}

              {/* Speech bubble tail */}
              <div
                className="absolute top-full left-1/2 transform -translate-x-1/2"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderTop: '8px solid rgba(15, 23, 42, 0.95)'
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interaction hint */}
      {onInteraction && (
        <motion.div
          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1 }}
        >
          <MessageCircle size={16} className="text-slate-400" />
        </motion.div>
      )}
    </div>
  );
}

// Preset configurations for common use cases
export const SofiaFireflyPresets = {
  welcome: {
    size: 'lg' as const,
    message: "Welcome! I'm Sofia, your guide on this journey.",
    autofly: true
  },

  guide: {
    size: 'md' as const,
    message: "Let me help you with the next step.",
    autofly: false
  },

  celebration: {
    size: 'lg' as const,
    message: "Wonderful! You've completed another milestone.",
    autofly: true
  },

  ambient: {
    size: 'sm' as const,
    showDialog: false,
    autofly: true
  }
};