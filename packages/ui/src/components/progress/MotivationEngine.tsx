'use client'

import React, { ReactNode, useEffect, useState, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart,
  Sparkles,
  TrendingUp,
  Users,
  Target,
  Calendar,
  Zap,
  Award,
  MessageCircle,
  Timer,
  Star,
  Gift,
  Flame,
  ChevronRight
} from 'lucide-react'
import { useProgress } from './ProgressTrackingEngine'
import { useSuggestions } from './SmartSuggestionEngine'

// Motivation types
export interface MotivationalMessage {
  id: string
  type: 'encouragement' | 'celebration' | 'gentle_push' | 'milestone' | 'streak' | 'social_proof'
  message: string
  sofiaEmotion: 'happy' | 'proud' | 'encouraging' | 'celebrating' | 'calm'
  trigger: string
  priority: 'low' | 'medium' | 'high'
  expiresAt?: Date
  actions?: Array<{
    label: string
    action: () => void
    style: 'primary' | 'secondary'
  }>
}

export interface EngagementMetrics {
  sessionDuration: number
  documentsUploadedToday: number
  streakDays: number
  lastEngagementTime: Date
  weeklyGoalProgress: number
  motivationLevel: 'low' | 'medium' | 'high'
  preferredMotivationStyle: 'gentle' | 'enthusiastic' | 'achievement_focused'
}

export interface SocialProofData {
  totalUsersHelped: number
  documentsSecuredToday: number
  averageUserProgress: number
  successStories: Array<{
    message: string
    achievement: string
    timeToComplete: string
  }>
}

// Motivation context
interface MotivationContextType {
  messages: MotivationalMessage[]
  metrics: EngagementMetrics
  socialProof: SocialProofData
  updateMetrics: (update: Partial<EngagementMetrics>) => void
  dismissMessage: (messageId: string) => void
  triggerCelebration: (achievement: string) => void
  getMotivationalBoost: () => void
}

const MotivationContext = createContext<MotivationContextType | null>(null)

export function useMotivation() {
  const context = useContext(MotivationContext)
  if (!context) {
    throw new Error('useMotivation must be used within a MotivationProvider')
  }
  return context
}

// Default social proof data
const defaultSocialProof: SocialProofData = {
  totalUsersHelped: 12847,
  documentsSecuredToday: 342,
  averageUserProgress: 68,
  successStories: [
    {
      message: "Vďaka Sofii som si konečne zorganizoval všetky dokumenty. Cítim sa oveľa pokojnejšie.",
      achievement: "Dokončil všetky kategórie",
      timeToComplete: "3 týždne"
    },
    {
      message: "Po prvýkrát v živote viem, kde mám všetky dôležité papiere. Sofia je úžasná!",
      achievement: "50+ dokumentov nahraných",
      timeToComplete: "1 mesiac"
    },
    {
      message: "Digitálny trezor mi pomohol pri riešení dedičstva. Som vďačná za túto službu.",
      achievement: "Právne dokumenty kompletné",
      timeToComplete: "2 týždne"
    }
  ]
}

// Motivational message generators
const messageGenerators = {
  welcome: (metrics: EngagementMetrics) => ({
    id: 'welcome_back',
    type: 'encouragement' as const,
    message: 'Vitajte späť! Som tu pre vás a pokračujeme v budovaní vašej bezpečnej budúcnosti.',
    sofiaEmotion: 'happy' as const,
    trigger: 'session_start',
    priority: 'medium' as const
  }),

  firstDocument: () => ({
    id: 'first_document_celebration',
    type: 'celebration' as const,
    message: 'Fantastické! Vaš prvý dokument je v bezpečí. Toto je začiatok niečoho krásneho! ✨',
    sofiaEmotion: 'celebrating' as const,
    trigger: 'first_upload',
    priority: 'high' as const
  }),

  streakEncouragement: (days: number) => ({
    id: 'streak_encouragement',
    type: 'streak' as const,
    message: `Úžasné! ${days} dní za sebou sa staráte o svoju budúcnosť. Som na vás nesmierne hrdá! 🔥`,
    sofiaEmotion: 'proud' as const,
    trigger: 'streak_milestone',
    priority: 'high' as const
  }),

  gentlePush: (hours: number) => ({
    id: 'gentle_push',
    type: 'gentle_push' as const,
    message: `Už ${hours} hodín sme sa nevideli. Čo keby sme pridali jeden malý dokument? Každý krok sa počíta. 💙`,
    sofiaEmotion: 'encouraging' as const,
    trigger: 'inactivity',
    priority: 'low' as const
  }),

  socialProof: (data: SocialProofData) => ({
    id: 'social_proof',
    type: 'social_proof' as const,
    message: `Už ${data.totalUsersHelped.toLocaleString()} ľudí našlo pokoj duše vďaka digitálnemu trezoru. Pridajte sa k nim! 🌟`,
    sofiaEmotion: 'encouraging' as const,
    trigger: 'social_motivation',
    priority: 'medium' as const
  }),

  weeklyGoal: (progress: number) => ({
    id: 'weekly_goal',
    type: 'encouragement' as const,
    message: progress >= 100
      ? 'Splnili ste týždenný cieľ! Ste neuveriteľní! 🎉'
      : `Týždenný cieľ: ${progress}% splnený. Pokračujte, už je to blízko! 💪`,
    sofiaEmotion: progress >= 100 ? 'celebrating' as const : 'encouraging' as const,
    trigger: 'weekly_progress',
    priority: 'medium' as const
  })
}

// Motivation provider
interface MotivationProviderProps {
  children: ReactNode
  initialMetrics?: Partial<EngagementMetrics>
}

export function MotivationProvider({
  children,
  initialMetrics = {}
}: MotivationProviderProps) {
  const [messages, setMessages] = useState<MotivationalMessage[]>([])
  const [metrics, setMetrics] = useState<EngagementMetrics>({
    sessionDuration: 0,
    documentsUploadedToday: 0,
    streakDays: 1,
    lastEngagementTime: new Date(),
    weeklyGoalProgress: 0,
    motivationLevel: 'medium',
    preferredMotivationStyle: 'gentle',
    ...initialMetrics
  })
  const [socialProof] = useState<SocialProofData>(defaultSocialProof)

  const { stats } = useProgress()

  // Session duration tracking
  useEffect(() => {
    const startTime = Date.now()
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        sessionDuration: Math.floor((Date.now() - startTime) / 1000 / 60)
      }))
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  // Generate motivational messages based on context
  useEffect(() => {
    const newMessages: MotivationalMessage[] = []

    // Welcome message for new sessions
    if (metrics.sessionDuration === 0) {
      newMessages.push(messageGenerators.welcome(metrics))
    }

    // Streak encouragement
    if (metrics.streakDays > 0 && metrics.streakDays % 7 === 0) {
      newMessages.push(messageGenerators.streakEncouragement(metrics.streakDays))
    }

    // Weekly goal progress
    if (metrics.weeklyGoalProgress > 0) {
      newMessages.push(messageGenerators.weeklyGoal(metrics.weeklyGoalProgress))
    }

    // Social proof motivation
    if (Math.random() < 0.3) { // 30% chance to show social proof
      newMessages.push(messageGenerators.socialProof(socialProof))
    }

    // Gentle push for inactivity
    const hoursSinceLastActivity = (Date.now() - metrics.lastEngagementTime.getTime()) / (1000 * 60 * 60)
    if (hoursSinceLastActivity > 24 && metrics.motivationLevel !== 'high') {
      newMessages.push(messageGenerators.gentlePush(Math.floor(hoursSinceLastActivity)))
    }

    setMessages(prev => {
      // Remove duplicates and expired messages
      const validMessages = prev.filter(msg =>
        !msg.expiresAt || msg.expiresAt > new Date()
      )

      // Add new messages if not already present
      newMessages.forEach(newMsg => {
        if (!validMessages.find(msg => msg.id === newMsg.id)) {
          validMessages.push(newMsg)
        }
      })

      return validMessages.slice(-5) // Keep only latest 5 messages
    })
  }, [metrics, socialProof, stats])

  const updateMetrics = (update: Partial<EngagementMetrics>) => {
    setMetrics(prev => ({ ...prev, ...update }))
  }

  const dismissMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId))
  }

  const triggerCelebration = (achievement: string) => {
    const celebrationMessage: MotivationalMessage = {
      id: `celebration_${Date.now()}`,
      type: 'celebration',
      message: `🎉 ${achievement} 🎉`,
      sofiaEmotion: 'celebrating',
      trigger: 'achievement',
      priority: 'high',
      expiresAt: new Date(Date.now() + 10000) // 10 seconds
    }

    setMessages(prev => [celebrationMessage, ...prev])
  }

  const getMotivationalBoost = () => {
    const boostMessages = [
      'Ste na správnej ceste! Každý dokument vás priblíži k pokoju duše. 💫',
      'Vaša budúcnosť je v bezpečných rukách. Pokračujte v skvelej práci! 🌟',
      'Som hrdá na váš pokrok. Spolu vytvárame niečo krásne! ✨',
      'Každý krok sa počíta. Ste silnejší, ako si myslíte! 💪',
      'Vaša pozornosť k detailom je obdivuhodná. Pokračujte! 👏'
    ]

    const randomMessage = boostMessages[Math.floor(Math.random() * boostMessages.length)]

    const boostMsg: MotivationalMessage = {
      id: `boost_${Date.now()}`,
      type: 'encouragement',
      message: randomMessage,
      sofiaEmotion: 'encouraging',
      trigger: 'manual_boost',
      priority: 'medium',
      expiresAt: new Date(Date.now() + 15000) // 15 seconds
    }

    setMessages(prev => [boostMsg, ...prev])
  }

  return (
    <MotivationContext.Provider
      value={{
        messages,
        metrics,
        socialProof,
        updateMetrics,
        dismissMessage,
        triggerCelebration,
        getMotivationalBoost
      }}
    >
      {children}
    </MotivationContext.Provider>
  )
}

// Motivational message component
interface MotivationalMessageProps {
  message: MotivationalMessage
  onDismiss?: (messageId: string) => void
  className?: string
}

export function MotivationalMessageCard({
  message,
  onDismiss,
  className = ''
}: MotivationalMessageProps) {
  const emotionColors = {
    happy: 'from-blue-50 to-cyan-50 border-blue-200',
    proud: 'from-purple-50 to-pink-50 border-purple-200',
    encouraging: 'from-green-50 to-emerald-50 border-green-200',
    celebrating: 'from-yellow-50 to-orange-50 border-yellow-200',
    calm: 'from-gray-50 to-slate-50 border-gray-200'
  }

  const emotionIcons = {
    happy: Heart,
    proud: Star,
    encouraging: TrendingUp,
    celebrating: Sparkles,
    calm: MessageCircle
  }

  const IconComponent = emotionIcons[message.sofiaEmotion]

  return (
    <motion.div
      className={`bg-gradient-to-r ${emotionColors[message.sofiaEmotion]} border rounded-xl p-4 ${className}`}
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start space-x-3">
        {/* Sofia icon */}
        <motion.div
          className="flex-shrink-0"
          animate={message.sofiaEmotion === 'celebrating' ? {
            rotate: [0, 5, -5, 0],
            scale: [1, 1.1, 1]
          } : {}}
          transition={{
            duration: 2,
            repeat: message.sofiaEmotion === 'celebrating' ? Infinity : 0
          }}
        >
          <div className={`p-2 rounded-full ${
            message.sofiaEmotion === 'happy' ? 'bg-blue-100' :
            message.sofiaEmotion === 'proud' ? 'bg-purple-100' :
            message.sofiaEmotion === 'encouraging' ? 'bg-green-100' :
            message.sofiaEmotion === 'celebrating' ? 'bg-yellow-100' :
            'bg-gray-100'
          }`}>
            <IconComponent className={`w-5 h-5 ${
              message.sofiaEmotion === 'happy' ? 'text-blue-600' :
              message.sofiaEmotion === 'proud' ? 'text-purple-600' :
              message.sofiaEmotion === 'encouraging' ? 'text-green-600' :
              message.sofiaEmotion === 'celebrating' ? 'text-yellow-600' :
              'text-gray-600'
            }`} />
          </div>
        </motion.div>

        {/* Message content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">Sofia</p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {message.message}
              </p>
            </div>

            {onDismiss && (
              <button
                onClick={() => onDismiss(message.id)}
                className="ml-2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-white/50 transition-colors"
                aria-label="Dismiss message"
              >
                ×
              </button>
            )}
          </div>

          {/* Action buttons */}
          {message.actions && message.actions.length > 0 && (
            <div className="flex space-x-2 mt-3">
              {message.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    action.style === 'primary'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Engagement metrics dashboard
interface EngagementDashboardProps {
  className?: string
}

export function EngagementDashboard({ className = '' }: EngagementDashboardProps) {
  const { metrics, socialProof, getMotivationalBoost } = useMotivation()

  const metricsData = [
    {
      label: 'Čas v aplikácii',
      value: `${metrics.sessionDuration} min`,
      icon: Timer,
      color: 'blue'
    },
    {
      label: 'Dni za sebou',
      value: metrics.streakDays,
      icon: Flame,
      color: 'orange'
    },
    {
      label: 'Týždenný cieľ',
      value: `${metrics.weeklyGoalProgress}%`,
      icon: Target,
      color: 'green'
    },
    {
      label: 'Motivácia',
      value: metrics.motivationLevel === 'high' ? 'Vysoká' :
             metrics.motivationLevel === 'medium' ? 'Stredná' : 'Nízka',
      icon: TrendingUp,
      color: metrics.motivationLevel === 'high' ? 'green' :
             metrics.motivationLevel === 'medium' ? 'yellow' : 'red'
    }
  ]

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Metrics grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metricsData.map((metric, index) => {
          const IconComponent = metric.icon
          return (
            <motion.div
              key={metric.label}
              className="bg-white rounded-lg border border-gray-200 p-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full bg-${metric.color}-100 mb-2`}>
                <IconComponent className={`w-5 h-5 text-${metric.color}-600`} />
              </div>
              <div className="text-lg font-bold text-gray-900">
                {metric.value}
              </div>
              <div className="text-xs text-gray-500">
                {metric.label}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Social proof section */}
      <motion.div
        className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-indigo-600" />
          Nie ste sami
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {socialProof.totalUsersHelped.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">ľudí našlo pokoj</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {socialProof.documentsSecuredToday}
            </div>
            <div className="text-sm text-gray-600">dokumentov dnes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {socialProof.averageUserProgress}%
            </div>
            <div className="text-sm text-gray-600">priemerný pokrok</div>
          </div>
        </div>

        {/* Success story */}
        {socialProof.successStories.length > 0 && (
          <div className="bg-white/70 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Star className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-gray-700 italic mb-2">
                  "{socialProof.successStories[0].message}"
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{socialProof.successStories[0].achievement}</span>
                  <span>{socialProof.successStories[0].timeToComplete}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Motivation boost button */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <button
          onClick={getMotivationalBoost}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
        >
          <Sparkles className="w-5 h-5" />
          <span>Potrebujem motiváciu!</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  )
}

// Message feed component
interface MotivationalFeedProps {
  limit?: number
  className?: string
}

export function MotivationalFeed({
  limit = 3,
  className = ''
}: MotivationalFeedProps) {
  const { messages, dismissMessage } = useMotivation()

  const displayMessages = messages
    .sort((a, b) => {
      // Sort by priority, then by type
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
    .slice(0, limit)

  return (
    <div className={`space-y-3 ${className}`}>
      <AnimatePresence>
        {displayMessages.map((message) => (
          <MotivationalMessageCard
            key={message.id}
            message={message}
            onDismiss={dismissMessage}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

export default {
  MotivationProvider,
  useMotivation,
  MotivationalMessageCard,
  EngagementDashboard,
  MotivationalFeed
}