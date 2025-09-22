'use client'

import React, { ReactNode, useEffect, useState, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Award,
  Crown,
  Star,
  Trophy,
  Medal,
  Shield,
  Heart,
  Zap,
  Target,
  Calendar,
  Users,
  BookOpen,
  Lock,
  Unlock,
  Gift,
  Sparkles,
  CheckCircle
} from 'lucide-react'
import { useProgress } from './ProgressTrackingEngine'
import { useMotivation } from './MotivationEngine'

// Achievement types
export interface Achievement {
  id: string
  title: string
  description: string
  category: 'progress' | 'engagement' | 'milestones' | 'special' | 'social' | 'time'
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
  icon: React.ComponentType<{ className?: string }>
  requirements: {
    type: 'document_count' | 'category_completion' | 'streak_days' | 'session_time' | 'special_action'
    target: number
    description: string
  }[]
  rewards: {
    type: 'badge' | 'feature_unlock' | 'customization' | 'content'
    name: string
    description: string
    value?: any
  }[]
  unlocked: boolean
  unlockedAt?: Date
  progress: number
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  sofiaMessage: string
  celebrationLevel: 'small' | 'medium' | 'large' | 'epic'
  prerequisites?: string[] // Other achievement IDs required
  hidden?: boolean // Hidden until unlocked or prerequisites met
}

export interface AchievementNotification {
  id: string
  achievement: Achievement
  isVisible: boolean
  timestamp: Date
}

// Achievement context
interface AchievementContextType {
  achievements: Achievement[]
  notifications: AchievementNotification[]
  unlockedCount: number
  totalCount: number
  completionPercentage: number
  checkAchievements: () => void
  dismissNotification: (notificationId: string) => void
  getAchievementsByCategory: (category: string) => Achievement[]
  getNextAchievements: () => Achievement[]
}

const AchievementContext = createContext<AchievementContextType | null>(null)

export function useAchievements() {
  const context = useContext(AchievementContext)
  if (!context) {
    throw new Error('useAchievements must be used within an AchievementProvider')
  }
  return context
}

// Default achievements configuration
const defaultAchievements: Achievement[] = [
  // Progress achievements
  {
    id: 'first_step',
    title: 'Prvé kroky',
    description: 'Nahrajte svoj prvý dokument',
    category: 'progress',
    tier: 'bronze',
    icon: Star,
    requirements: [
      { type: 'document_count', target: 1, description: 'Nahrať 1 dokument' }
    ],
    rewards: [
      { type: 'badge', name: 'Začiatočník', description: 'Vaša cesta sa začína' }
    ],
    unlocked: false,
    progress: 0,
    rarity: 'common',
    sofiaMessage: 'Úžasne! Váš prvý dokument je v bezpečí. Som na vás hrdá! ✨',
    celebrationLevel: 'medium'
  },
  {
    id: 'collector',
    title: 'Zberateľ',
    description: 'Nahrajte 10 dokumentov',
    category: 'progress',
    tier: 'silver',
    icon: BookOpen,
    requirements: [
      { type: 'document_count', target: 10, description: 'Nahrať 10 dokumentov' }
    ],
    rewards: [
      { type: 'feature_unlock', name: 'Pokročilé kategórie', description: 'Prístup k špeciálnym kategóriám' }
    ],
    unlocked: false,
    progress: 0,
    rarity: 'uncommon',
    sofiaMessage: 'Wow! Váš trezor začína vyzerať impozantne. Ste na správnej ceste! 🏆',
    celebrationLevel: 'large',
    prerequisites: ['first_step']
  },
  {
    id: 'completionist',
    title: 'Kompletista',
    description: 'Dokončite všetky základné kategórie',
    category: 'progress',
    tier: 'gold',
    icon: Crown,
    requirements: [
      { type: 'category_completion', target: 6, description: 'Dokončiť všetky kategórie' }
    ],
    rewards: [
      { type: 'feature_unlock', name: 'Časové kapsuly', description: 'Vytvárajte správy pre budúcnosť' },
      { type: 'customization', name: 'Zlatá téma', description: 'Exkluzívne farebné schémy' }
    ],
    unlocked: false,
    progress: 0,
    rarity: 'rare',
    sofiaMessage: 'Neuveriteľné! Ste skutočný majster organizácie. Vaša budúcnosť je v perfektných rukách! 👑',
    celebrationLevel: 'epic',
    prerequisites: ['collector']
  },

  // Engagement achievements
  {
    id: 'dedicated',
    title: 'Oddaný',
    description: 'Buďte aktívni 7 dní za sebou',
    category: 'engagement',
    tier: 'silver',
    icon: Calendar,
    requirements: [
      { type: 'streak_days', target: 7, description: '7 dní aktivity za sebou' }
    ],
    rewards: [
      { type: 'badge', name: 'Vytrvalý', description: 'Máte skvelé návyky!' }
    ],
    unlocked: false,
    progress: 0,
    rarity: 'uncommon',
    sofiaMessage: 'Fantastické! Vytvárate si zdravé návyky. Kontinuita je kľúč k úspechu! 🔥',
    celebrationLevel: 'large'
  },
  {
    id: 'marathon',
    title: 'Maratónec',
    description: 'Buďte aktívni 30 dní za sebou',
    category: 'engagement',
    tier: 'gold',
    icon: Trophy,
    requirements: [
      { type: 'streak_days', target: 30, description: '30 dní aktivity za sebou' }
    ],
    rewards: [
      { type: 'feature_unlock', name: 'Štatistiky Pro', description: 'Detailné analýzy vášho pokroku' },
      { type: 'badge', name: 'Legendárny', description: 'Neuvereiteľná vytrvalosť' }
    ],
    unlocked: false,
    progress: 0,
    rarity: 'epic',
    sofiaMessage: 'Som bez slov! 30 dní za sebou! Ste skutočný inšpiráciou pre ostatných! 🌟',
    celebrationLevel: 'epic',
    prerequisites: ['dedicated']
  },

  // Special achievements
  {
    id: 'family_protector',
    title: 'Ochránca rodiny',
    description: 'Nahrajte všetky rodinné dokumenty',
    category: 'special',
    tier: 'gold',
    icon: Heart,
    requirements: [
      { type: 'special_action', target: 1, description: 'Kompletná kategória Rodina' }
    ],
    rewards: [
      { type: 'content', name: 'Rodinný sprievodca', description: 'Špeciálne tipy pre ochranu rodiny' }
    ],
    unlocked: false,
    progress: 0,
    rarity: 'rare',
    sofiaMessage: 'Vaša rodina má najlepšieho strážcu! Vaša starostlivosť je obdivuhodná. 💖',
    celebrationLevel: 'large'
  },
  {
    id: 'legal_eagle',
    title: 'Právny expert',
    description: 'Nahrajte všetky právne dokumenty',
    category: 'special',
    tier: 'platinum',
    icon: Shield,
    requirements: [
      { type: 'special_action', target: 1, description: 'Kompletná kategória Právne' }
    ],
    rewards: [
      { type: 'feature_unlock', name: 'Automatické testamenty', description: 'AI asistent pre právne dokumenty' }
    ],
    unlocked: false,
    progress: 0,
    rarity: 'epic',
    sofiaMessage: 'Úžasné! Vaše právne záležitosti sú v perfektnom poriadku. Cítim váš pokoj! ⚖️',
    celebrationLevel: 'epic'
  },

  // Time-based achievements
  {
    id: 'early_bird',
    title: 'Ranné vtáča',
    description: 'Nahrajte dokument pred 9:00 ráno',
    category: 'time',
    tier: 'bronze',
    icon: Target,
    requirements: [
      { type: 'special_action', target: 1, description: 'Aktivita pred 9:00' }
    ],
    rewards: [
      { type: 'badge', name: 'Ranný bojovník', description: 'Začínate deň produktívne!' }
    ],
    unlocked: false,
    progress: 0,
    rarity: 'uncommon',
    sofiaMessage: 'Wow! Ráno je najlepší čas na produktívnu prácu. Obdivujem vašu disciplínu! 🌅',
    celebrationLevel: 'small'
  },

  // Hidden legendary achievement
  {
    id: 'digital_sage',
    title: 'Digitálny mudrc',
    description: 'Dosiahnite dokonalú organizáciu',
    category: 'special',
    tier: 'diamond',
    icon: Sparkles,
    requirements: [
      { type: 'document_count', target: 50, description: 'Nahrať 50+ dokumentov' },
      { type: 'category_completion', target: 6, description: 'Všetky kategórie' },
      { type: 'streak_days', target: 30, description: '30 dní aktivity' }
    ],
    rewards: [
      { type: 'customization', name: 'Diamantový status', description: 'Exkluzívne privilégiá' },
      { type: 'feature_unlock', name: 'Sofia Premium', description: 'Rozšírené AI funkcie' }
    ],
    unlocked: false,
    progress: 0,
    rarity: 'legendary',
    sofiaMessage: 'Som ohromená! Dosiahli ste dokonalosť. Ste inšpiráciou pre všetkých! 💎',
    celebrationLevel: 'epic',
    prerequisites: ['completionist', 'marathon'],
    hidden: true
  }
]

// Achievement provider
interface AchievementProviderProps {
  children: ReactNode
}

export function AchievementProvider({ children }: AchievementProviderProps) {
  const [achievements, setAchievements] = useState<Achievement[]>(defaultAchievements)
  const [notifications, setNotifications] = useState<AchievementNotification[]>([])

  const { stats } = useProgress()
  const { metrics, triggerCelebration } = useMotivation()

  // Calculate progress for each achievement
  const updateAchievementProgress = () => {
    setAchievements(prev => prev.map(achievement => {
      if (achievement.unlocked) return achievement

      let totalProgress = 0
      let completedRequirements = 0

      achievement.requirements.forEach(req => {
        let currentValue = 0

        switch (req.type) {
          case 'document_count':
            currentValue = stats.totalDocuments
            break
          case 'category_completion':
            currentValue = stats.completedCategories
            break
          case 'streak_days':
            currentValue = stats.streakDays
            break
          case 'session_time':
            currentValue = metrics.sessionDuration
            break
          // special_action requirements are handled separately
        }

        const reqProgress = Math.min(currentValue / req.target, 1)
        totalProgress += reqProgress

        if (reqProgress >= 1) {
          completedRequirements++
        }
      })

      const overallProgress = totalProgress / achievement.requirements.length
      const shouldUnlock = completedRequirements === achievement.requirements.length

      // Check prerequisites
      if (shouldUnlock && achievement.prerequisites) {
        const prerequisitesMet = achievement.prerequisites.every(prereqId =>
          prev.find(a => a.id === prereqId)?.unlocked
        )
        if (!prerequisitesMet) {
          return { ...achievement, progress: Math.round(overallProgress * 100) }
        }
      }

      if (shouldUnlock && !achievement.unlocked) {
        // Trigger unlock
        const unlockedAchievement = {
          ...achievement,
          unlocked: true,
          unlockedAt: new Date(),
          progress: 100
        }

        // Create notification
        const notification: AchievementNotification = {
          id: `notification-${achievement.id}`,
          achievement: unlockedAchievement,
          isVisible: true,
          timestamp: new Date()
        }

        setNotifications(prevNotifications => [notification, ...prevNotifications])
        triggerCelebration(`Achievement unlocked: ${achievement.title}!`)

        return unlockedAchievement
      }

      return {
        ...achievement,
        progress: Math.round(overallProgress * 100)
      }
    }))
  }

  // Check achievements when stats or metrics change
  useEffect(() => {
    updateAchievementProgress()
  }, [stats, metrics])

  const checkAchievements = () => {
    updateAchievementProgress()
  }

  const dismissNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    )
  }

  const getAchievementsByCategory = (category: string) => {
    return achievements.filter(achievement => achievement.category === category)
  }

  const getNextAchievements = () => {
    return achievements
      .filter(achievement => !achievement.unlocked && !achievement.hidden)
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 3)
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const visibleCount = achievements.filter(a => !a.hidden || a.unlocked).length
  const completionPercentage = Math.round((unlockedCount / visibleCount) * 100)

  return (
    <AchievementContext.Provider
      value={{
        achievements,
        notifications,
        unlockedCount,
        totalCount: visibleCount,
        completionPercentage,
        checkAchievements,
        dismissNotification,
        getAchievementsByCategory,
        getNextAchievements
      }}
    >
      {children}
    </AchievementContext.Provider>
  )
}

// Achievement unlock notification
interface AchievementUnlockNotificationProps {
  notification: AchievementNotification
  onDismiss: (notificationId: string) => void
}

export function AchievementUnlockNotification({
  notification,
  onDismiss
}: AchievementUnlockNotificationProps) {
  const { achievement } = notification
  const IconComponent = achievement.icon

  const tierColors = {
    bronze: 'from-amber-600 to-amber-700',
    silver: 'from-gray-400 to-gray-500',
    gold: 'from-yellow-400 to-yellow-500',
    platinum: 'from-purple-400 to-purple-500',
    diamond: 'from-blue-400 to-cyan-400'
  }

  const rarityGlow = {
    common: 'shadow-gray-500/50',
    uncommon: 'shadow-green-500/50',
    rare: 'shadow-blue-500/50',
    epic: 'shadow-purple-500/50',
    legendary: 'shadow-yellow-500/50'
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={`bg-white rounded-2xl shadow-2xl ${rarityGlow[achievement.rarity]} max-w-md w-full overflow-hidden`}
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 25
        }}
      >
        {/* Header with celebration particles */}
        <div className={`bg-gradient-to-r ${tierColors[achievement.tier]} p-6 text-white text-center relative overflow-hidden`}>
          {/* Animated background particles */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/30 rounded-full"
              initial={{
                x: Math.random() * 300,
                y: Math.random() * 100,
                scale: 0
              }}
              animate={{
                y: [null, -20, -40],
                x: [null, Math.random() * 40 - 20],
                scale: [0, 1, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 2,
                delay: i * 0.1,
                repeat: Infinity,
                repeatDelay: 1
              }}
            />
          ))}

          <motion.h2
            className="text-2xl font-bold mb-2"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🎉 Achievement Unlocked! 🎉
          </motion.h2>
          <p className="text-white/90">Congratulations on your progress!</p>
        </div>

        {/* Achievement details */}
        <div className="p-6">
          <div className="text-center mb-6">
            <motion.div
              className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r ${tierColors[achievement.tier]} text-white mb-4 shadow-lg`}
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <IconComponent className="w-10 h-10" />
            </motion.div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {achievement.title}
            </h3>
            <p className="text-gray-600 mb-4">
              {achievement.description}
            </p>

            {/* Rarity badge */}
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
              achievement.rarity === 'common' ? 'bg-gray-200 text-gray-800' :
              achievement.rarity === 'uncommon' ? 'bg-green-200 text-green-800' :
              achievement.rarity === 'rare' ? 'bg-blue-200 text-blue-800' :
              achievement.rarity === 'epic' ? 'bg-purple-200 text-purple-800' :
              'bg-gradient-to-r from-yellow-200 to-orange-200 text-orange-800'
            }`}>
              {achievement.rarity}
            </span>
          </div>

          {/* Sofia message */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Sparkles className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-purple-900 mb-1">Sofia says:</p>
                <p className="text-sm text-purple-700 italic">
                  {achievement.sofiaMessage}
                </p>
              </div>
            </div>
          </div>

          {/* Rewards */}
          {achievement.rewards.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Gift className="w-4 h-4 mr-2" />
                Rewards
              </h4>
              <div className="space-y-2">
                {achievement.rewards.map((reward, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">{reward.name}</p>
                      <p className="text-sm text-green-700">{reward.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Close button */}
          <button
            onClick={() => onDismiss(notification.id)}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
          >
            Continue Journey
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Achievement gallery
interface AchievementGalleryProps {
  category?: string
  showProgress?: boolean
  className?: string
}

export function AchievementGallery({
  category,
  showProgress = true,
  className = ''
}: AchievementGalleryProps) {
  const { achievements, getAchievementsByCategory } = useAchievements()

  const displayAchievements = category
    ? getAchievementsByCategory(category)
    : achievements.filter(a => !a.hidden || a.unlocked)

  const tierColors = {
    bronze: 'border-amber-300 bg-amber-50',
    silver: 'border-gray-300 bg-gray-50',
    gold: 'border-yellow-300 bg-yellow-50',
    platinum: 'border-purple-300 bg-purple-50',
    diamond: 'border-blue-300 bg-blue-50'
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {displayAchievements.map((achievement, index) => {
        const IconComponent = achievement.icon
        const isLocked = !achievement.unlocked

        return (
          <motion.div
            key={achievement.id}
            className={`relative border-2 rounded-xl p-4 transition-all ${
              isLocked
                ? 'border-gray-200 bg-gray-50 opacity-60'
                : tierColors[achievement.tier]
            } ${isLocked ? '' : 'hover:shadow-lg'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={isLocked ? {} : { scale: 1.02 }}
          >
            {/* Lock overlay for locked achievements */}
            {isLocked && (
              <div className="absolute top-2 right-2">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
            )}

            <div className="text-center">
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-3 ${
                isLocked
                  ? 'bg-gray-200'
                  : `bg-gradient-to-r ${
                      achievement.tier === 'bronze' ? 'from-amber-400 to-amber-500' :
                      achievement.tier === 'silver' ? 'from-gray-400 to-gray-500' :
                      achievement.tier === 'gold' ? 'from-yellow-400 to-yellow-500' :
                      achievement.tier === 'platinum' ? 'from-purple-400 to-purple-500' :
                      'from-blue-400 to-cyan-400'
                    }`
              }`}>
                <IconComponent className={`w-8 h-8 ${isLocked ? 'text-gray-400' : 'text-white'}`} />
              </div>

              {/* Title and description */}
              <h3 className={`font-bold mb-2 ${isLocked ? 'text-gray-500' : 'text-gray-900'}`}>
                {achievement.title}
              </h3>
              <p className={`text-sm mb-3 ${isLocked ? 'text-gray-400' : 'text-gray-600'}`}>
                {achievement.description}
              </p>

              {/* Progress bar */}
              {showProgress && !achievement.unlocked && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{achievement.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-blue-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${achievement.progress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              )}

              {/* Completion date */}
              {achievement.unlocked && achievement.unlockedAt && (
                <div className="text-xs text-green-600 font-medium">
                  Unlocked {achievement.unlockedAt.toLocaleDateString('sk-SK')}
                </div>
              )}

              {/* Tier badge */}
              <div className="mt-2">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold uppercase ${
                  achievement.tier === 'bronze' ? 'bg-amber-200 text-amber-800' :
                  achievement.tier === 'silver' ? 'bg-gray-200 text-gray-800' :
                  achievement.tier === 'gold' ? 'bg-yellow-200 text-yellow-800' :
                  achievement.tier === 'platinum' ? 'bg-purple-200 text-purple-800' :
                  'bg-blue-200 text-blue-800'
                }`}>
                  {achievement.tier}
                </span>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// Achievement notifications container
export function AchievementNotifications() {
  const { notifications, dismissNotification } = useAchievements()

  return (
    <AnimatePresence>
      {notifications.map((notification) => (
        <AchievementUnlockNotification
          key={notification.id}
          notification={notification}
          onDismiss={dismissNotification}
        />
      ))}
    </AnimatePresence>
  )
}

export default {
  AchievementProvider,
  useAchievements,
  AchievementUnlockNotification,
  AchievementGallery,
  AchievementNotifications
}