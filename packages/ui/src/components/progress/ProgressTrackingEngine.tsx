'use client'

import React, { ReactNode, useEffect, useState, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Target,
  TrendingUp,
  Award,
  Calendar,
  CheckCircle,
  Star,
  Gift,
  Heart,
  Zap,
  Crown
} from 'lucide-react'

// Progress tracking types
export interface Milestone {
  id: string
  type: 'document_count' | 'category_completion' | 'life_event' | 'time_based' | 'achievement'
  title: string
  description: string
  target: number
  current: number
  threshold?: number
  icon: React.ComponentType<{ className?: string }>
  color: string
  unlocked: boolean
  completedAt?: Date
  emotion: 'happy' | 'proud' | 'celebrating' | 'encouraging'
  sofiaMessage: string
  reward?: {
    type: 'badge' | 'feature' | 'content'
    name: string
    description: string
  }
}

export interface ProgressStats {
  totalDocuments: number
  completedCategories: number
  totalCategories: number
  daysActive: number
  streakDays: number
  achievementsUnlocked: number
  lastActivity: Date
  overallProgress: number
}

export interface LifeEvent {
  id: string
  type: 'marriage' | 'birth' | 'home_purchase' | 'retirement' | 'job_change'
  title: string
  date: Date
  triggeredMilestones: string[]
  suggestedDocuments: string[]
}

// Progress context
interface ProgressContextType {
  stats: ProgressStats
  milestones: Milestone[]
  lifeEvents: LifeEvent[]
  updateProgress: (update: Partial<ProgressStats>) => void
  triggerMilestone: (milestoneId: string) => void
  addLifeEvent: (event: LifeEvent) => void
}

const ProgressContext = createContext<ProgressContextType | null>(null)

export function useProgress() {
  const context = useContext(ProgressContext)
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider')
  }
  return context
}

// Default milestones configuration
const defaultMilestones: Milestone[] = [
  {
    id: 'first_document',
    type: 'document_count',
    title: 'Prvý dokument',
    description: 'Nahrajte svoj prvý dokument do digitálneho trezoru',
    target: 1,
    current: 0,
    icon: FileText,
    color: 'blue',
    unlocked: false,
    emotion: 'happy',
    sofiaMessage: 'Úžasne! Začali ste svoju cestu k pokoju duše. Som tu pre vás! ✨',
    reward: {
      type: 'badge',
      name: 'Prvé kroky',
      description: 'Začali ste digitalizovať svoje dokumenty'
    }
  },
  {
    id: 'five_documents',
    type: 'document_count',
    title: '5 dokumentov',
    description: 'Nahrajte 5 dokumentov a začnite budovať svoj trezor',
    target: 5,
    current: 0,
    icon: Target,
    color: 'green',
    unlocked: false,
    emotion: 'encouraging',
    sofiaMessage: 'Skvele pokračujete! Vidím, že berieme vašu budúcnosť vážne 🌟',
    reward: {
      type: 'feature',
      name: 'Pokročilé kategórie',
      description: 'Prístup k špecializovaným kategóriám dokumentov'
    }
  },
  {
    id: 'first_category',
    type: 'category_completion',
    title: 'Prvá kategória',
    description: 'Dokončite svoju prvú kategóriu dokumentov',
    target: 1,
    current: 0,
    icon: CheckCircle,
    color: 'purple',
    unlocked: false,
    emotion: 'proud',
    sofiaMessage: 'Som na vás tak hrdá! Jedna oblasť života je teraz v bezpečí 💜',
    reward: {
      type: 'badge',
      name: 'Organizovaný',
      description: 'Dokončili ste svoju prvú kategóriu'
    }
  },
  {
    id: 'week_streak',
    type: 'time_based',
    title: 'Týždenná aktivita',
    description: 'Buďte aktívni 7 dní za sebou',
    target: 7,
    current: 0,
    icon: Calendar,
    color: 'orange',
    unlocked: false,
    emotion: 'celebrating',
    sofiaMessage: 'Fantastické! Vytvárate si zdravý návyk starostlivosti o budúcnosť 🔥',
    reward: {
      type: 'feature',
      name: 'Denné tipy',
      description: 'Personalizované denné odporúčania od Sofie'
    }
  },
  {
    id: 'ten_documents',
    type: 'document_count',
    title: '10 dokumentov',
    description: 'Vytvorte solídny základ s 10 dokumentmi',
    target: 10,
    current: 0,
    icon: Award,
    color: 'indigo',
    unlocked: false,
    emotion: 'proud',
    sofiaMessage: 'Wow! Váš trezor začína vyzerať impozantne. Cítim vašu odhodlanosť! 👑',
    reward: {
      type: 'badge',
      name: 'Staviteľ trezoru',
      description: 'Vytvorili ste solídny základ dokumentov'
    }
  },
  {
    id: 'all_categories',
    type: 'category_completion',
    title: 'Všetky kategórie',
    description: 'Dokončite všetky základné kategórie',
    target: 6,
    current: 0,
    icon: Crown,
    color: 'yellow',
    unlocked: false,
    emotion: 'celebrating',
    sofiaMessage: 'Neuveriteľné! Ste skutočný majster organizácie. Vaša budúcnosť je v bezpečí! 🎉',
    reward: {
      type: 'feature',
      name: 'Pokročilé funkcie',
      description: 'Prístup k časovým kapsulám a pokročilým nástrojom'
    }
  }
]

// Progress provider component
interface ProgressProviderProps {
  children: ReactNode
  initialStats?: Partial<ProgressStats>
}

export function ProgressProvider({
  children,
  initialStats = {}
}: ProgressProviderProps) {
  const [stats, setStats] = useState<ProgressStats>({
    totalDocuments: 0,
    completedCategories: 0,
    totalCategories: 6,
    daysActive: 1,
    streakDays: 1,
    achievementsUnlocked: 0,
    lastActivity: new Date(),
    overallProgress: 0,
    ...initialStats
  })

  const [milestones, setMilestones] = useState<Milestone[]>(defaultMilestones)
  const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>([])

  // Update progress and check for milestone triggers
  const updateProgress = (update: Partial<ProgressStats>) => {
    setStats(prev => {
      const newStats = { ...prev, ...update }

      // Calculate overall progress
      const documentProgress = Math.min((newStats.totalDocuments / 20) * 100, 50)
      const categoryProgress = (newStats.completedCategories / newStats.totalCategories) * 30
      const streakProgress = Math.min((newStats.streakDays / 30) * 20, 20)

      newStats.overallProgress = Math.round(documentProgress + categoryProgress + streakProgress)

      return newStats
    })
  }

  // Check milestones when stats change
  useEffect(() => {
    setMilestones(prev => prev.map(milestone => {
      if (milestone.unlocked) return milestone

      let shouldUnlock = false
      let newCurrent = milestone.current

      switch (milestone.type) {
        case 'document_count':
          newCurrent = stats.totalDocuments
          shouldUnlock = stats.totalDocuments >= milestone.target
          break
        case 'category_completion':
          newCurrent = stats.completedCategories
          shouldUnlock = stats.completedCategories >= milestone.target
          break
        case 'time_based':
          newCurrent = stats.streakDays
          shouldUnlock = stats.streakDays >= milestone.target
          break
      }

      if (shouldUnlock && !milestone.unlocked) {
        // Trigger celebration
        setTimeout(() => {
          triggerMilestone(milestone.id)
        }, 500)
      }

      return {
        ...milestone,
        current: newCurrent,
        unlocked: shouldUnlock,
        completedAt: shouldUnlock && !milestone.unlocked ? new Date() : milestone.completedAt
      }
    }))
  }, [stats])

  const triggerMilestone = (milestoneId: string) => {
    const milestone = milestones.find(m => m.id === milestoneId)
    if (milestone) {
      // Trigger celebration animation and Sofia message
      document.dispatchEvent(new CustomEvent('milestoneUnlocked', {
        detail: milestone
      }))

      // Update achievements count
      updateProgress({
        achievementsUnlocked: stats.achievementsUnlocked + 1
      })
    }
  }

  const addLifeEvent = (event: LifeEvent) => {
    setLifeEvents(prev => [...prev, event])

    // Trigger related milestones
    event.triggeredMilestones.forEach(milestoneId => {
      triggerMilestone(milestoneId)
    })
  }

  return (
    <ProgressContext.Provider
      value={{
        stats,
        milestones,
        lifeEvents,
        updateProgress,
        triggerMilestone,
        addLifeEvent
      }}
    >
      {children}
    </ProgressContext.Provider>
  )
}

// Progress dashboard component
interface ProgressDashboardProps {
  className?: string
}

export function ProgressDashboard({ className = '' }: ProgressDashboardProps) {
  const { stats, milestones } = useProgress()

  const recentMilestones = milestones
    .filter(m => m.unlocked)
    .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0))
    .slice(0, 3)

  const nextMilestones = milestones
    .filter(m => !m.unlocked)
    .sort((a, b) => (a.target - a.current) - (b.target - b.current))
    .slice(0, 3)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall Progress */}
      <motion.div
        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Váš pokrok</h3>
            <p className="text-sm text-gray-600">Cesta k pokoju duše</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">
              {stats.overallProgress}%
            </div>
            <div className="text-sm text-gray-500">dokončené</div>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${stats.overallProgress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalDocuments}</div>
            <div className="text-xs text-gray-500">dokumentov</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{stats.completedCategories}</div>
            <div className="text-xs text-gray-500">kategórií</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{stats.streakDays}</div>
            <div className="text-xs text-gray-500">dní za sebou</div>
          </div>
        </div>
      </motion.div>

      {/* Recent Achievements */}
      {recentMilestones.length > 0 && (
        <motion.div
          className="bg-white rounded-xl border border-gray-200 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2 text-yellow-500" />
            Nedávne úspechy
          </h4>

          <div className="space-y-3">
            {recentMilestones.map((milestone, index) => {
              const IconComponent = milestone.icon
              return (
                <motion.div
                  key={milestone.id}
                  className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={`p-2 rounded-full bg-${milestone.color}-100`}>
                    <IconComponent className={`w-4 h-4 text-${milestone.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{milestone.title}</h5>
                    <p className="text-sm text-gray-600">{milestone.description}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {milestone.completedAt?.toLocaleDateString('sk-SK')}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Next Milestones */}
      <motion.div
        className="bg-white rounded-xl border border-gray-200 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-blue-500" />
          Ďalšie ciele
        </h4>

        <div className="space-y-4">
          {nextMilestones.map((milestone, index) => {
            const IconComponent = milestone.icon
            const progress = (milestone.current / milestone.target) * 100

            return (
              <motion.div
                key={milestone.id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full bg-${milestone.color}-100`}>
                      <IconComponent className={`w-4 h-4 text-${milestone.color}-600`} />
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">{milestone.title}</h5>
                      <p className="text-sm text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {milestone.current}/{milestone.target}
                    </div>
                    <div className="text-xs text-gray-500">{Math.round(progress)}%</div>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className={`bg-${milestone.color}-500 h-2 rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>

                {milestone.reward && (
                  <div className="mt-2 text-xs text-gray-500 flex items-center">
                    <Gift className="w-3 h-3 mr-1" />
                    Odmena: {milestone.reward.name}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}

// Quick stats component
interface QuickStatsProps {
  className?: string
  showLabels?: boolean
}

export function QuickStats({ className = '', showLabels = true }: QuickStatsProps) {
  const { stats } = useProgress()

  const statsData = [
    {
      label: 'Dokumenty',
      value: stats.totalDocuments,
      icon: FileText,
      color: 'blue'
    },
    {
      label: 'Kategórie',
      value: `${stats.completedCategories}/${stats.totalCategories}`,
      icon: Target,
      color: 'green'
    },
    {
      label: 'Dni za sebou',
      value: stats.streakDays,
      icon: Calendar,
      color: 'orange'
    },
    {
      label: 'Úspechy',
      value: stats.achievementsUnlocked,
      icon: Award,
      color: 'purple'
    }
  ]

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {statsData.map((stat, index) => {
        const IconComponent = stat.icon
        return (
          <motion.div
            key={stat.label}
            className="bg-white rounded-lg border border-gray-200 p-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full bg-${stat.color}-100 mb-2`}>
              <IconComponent className={`w-5 h-5 text-${stat.color}-600`} />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stat.value}
            </div>
            {showLabels && (
              <div className="text-xs text-gray-500">
                {stat.label}
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

export default {
  ProgressProvider,
  useProgress,
  ProgressDashboard,
  QuickStats
}