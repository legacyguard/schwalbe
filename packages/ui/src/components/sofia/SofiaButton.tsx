/**
 * Sofia Firefly Floating Button Component
 * Main entry point for Sofia AI assistant
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Sparkles, Heart, Lightbulb } from 'lucide-react'
import { SofiaChat } from './SofiaChat'
import { cn } from '../../lib/utils'

interface SofiaButtonProps {
  className?: string
  showNotification?: boolean
  notificationCount?: number
  disabled?: boolean
}

export function SofiaButton({
  className,
  showNotification = false,
  notificationCount = 0,
  disabled = false
}: SofiaButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isGlowing, setIsGlowing] = useState(false)
  const [showPulse, setShowPulse] = useState(false)

  // Gentle pulsing animation for attention
  useEffect(() => {
    if (showNotification) {
      setShowPulse(true)
      const timer = setTimeout(() => setShowPulse(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [showNotification])

  // Random gentle glow effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isOpen && Math.random() > 0.7) {
        setIsGlowing(true)
        setTimeout(() => setIsGlowing(false), 2000)
      }
    }, 8000)

    return () => clearInterval(interval)
  }, [isOpen])

  const handleClick = () => {
    if (disabled) return
    setIsOpen(!isOpen)
    setShowPulse(false)
  }

  return (
    <>
      {/* Sofia Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <SofiaChat
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Floating Sofia Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Pulse rings for notifications */}
        <AnimatePresence>
          {showPulse && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-amber-400"
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeOut", repeat: 2 }}
            />
          )}
        </AnimatePresence>

        {/* Main Sofia Button */}
        <motion.button
          onClick={handleClick}
          disabled={disabled}
          className={cn(
            "relative w-16 h-16 rounded-full shadow-lg transition-all duration-300",
            "bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500",
            "hover:from-amber-300 hover:via-orange-300 hover:to-amber-400",
            "hover:shadow-xl hover:scale-105",
            "focus:outline-none focus:ring-4 focus:ring-amber-300/50",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            isGlowing && "shadow-amber-400/50 shadow-2xl",
            className
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            boxShadow: isGlowing
              ? "0 0 20px rgba(251, 191, 36, 0.6), 0 0 40px rgba(251, 191, 36, 0.3)"
              : "0 10px 25px rgba(0, 0, 0, 0.2)"
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Firefly light effect */}
          <motion.div
            className="absolute inset-2 rounded-full bg-white/20"
            animate={{
              opacity: isGlowing ? [0.3, 0.7, 0.3] : 0.3,
            }}
            transition={{
              duration: 2,
              repeat: isGlowing ? Infinity : 0,
              ease: "easeInOut"
            }}
          />

          {/* Sofia Icon - changes based on state */}
          <div className="relative z-10 flex items-center justify-center w-full h-full">
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: 180, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -180, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <MessageCircle className="w-7 h-7 text-white" />
                </motion.div>
              ) : showNotification ? (
                <motion.div
                  key="notification"
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 45 }}
                  transition={{ duration: 0.3, type: "spring" }}
                >
                  <Lightbulb className="w-7 h-7 text-white" />
                </motion.div>
              ) : (
                <motion.div
                  key="default"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.3, type: "spring" }}
                >
                  <Sparkles className="w-7 h-7 text-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Notification badge */}
          <AnimatePresence>
            {notificationCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg"
              >
                {notificationCount > 9 ? '9+' : notificationCount}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Floating particles effect */}
        <AnimatePresence>
          {isGlowing && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-amber-300 rounded-full"
                  initial={{
                    x: 32,
                    y: 32,
                    opacity: 0
                  }}
                  animate={{
                    x: [32, 32 + (Math.random() - 0.5) * 60],
                    y: [32, 32 + (Math.random() - 0.5) * 60],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.5,
                    ease: "easeOut"
                  }}
                />
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Tooltip */}
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg whitespace-nowrap pointer-events-none"
              style={{ display: 'none' }} // Hidden by default, shown on hover via CSS
            >
              Ahoj, som Sofia!
              <span className="inline-block ml-1">✨</span>
              <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CSS for hover tooltip */}
      <style jsx>{`
        .group:hover .tooltip {
          display: block !important;
        }
      `}</style>
    </>
  )
}

// Quick access to show Sofia with specific intent
export function showSofia(intent: 'welcome' | 'celebration' | 'suggestion' | 'help' = 'help') {
  // This would integrate with your state management
  // For now, just trigger the button visibility
  const event = new CustomEvent('sofia:show', { detail: { intent } })
  window.dispatchEvent(event)
}

// Sofia status indicator for other components
export function SofiaStatusIndicator({
  isActive,
  lastActivity,
  className
}: {
  isActive: boolean
  lastActivity?: Date
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-2 text-sm text-slate-600", className)}>
      <motion.div
        className={cn(
          "w-2 h-2 rounded-full",
          isActive ? "bg-green-400" : "bg-slate-300"
        )}
        animate={isActive ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <span>
        Sofia {isActive ? 'je online' : 'offline'}
        {lastActivity && !isActive && (
          <span className="text-slate-400 ml-1">
            • posledná aktivita {lastActivity.toLocaleTimeString()}
          </span>
        )}
      </span>
    </div>
  )
}