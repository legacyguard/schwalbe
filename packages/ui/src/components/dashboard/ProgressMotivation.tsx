/**
 * Progress & Motivation Elements
 * Dashboard motivation and progress tracking components
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Target,
  TrendingUp,
  Calendar,
  Zap,
  Star,
  Heart,
  Trophy,
  Gift,
  Clock,
  ChevronRight,
  CheckCircle,
  Circle,
  Sparkles,
  Award,
  Users,
  FileText,
  Shield
} from 'lucide-react'
import { cn } from '../../lib/utils'

export interface ProgressData {
  documentsCount: number
  categoriesCompleted: number
  totalCategories: number
  guardiansSet: number
  willProgress: number
  overallCompletion: number
  streak: number
  lastActivity: Date
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  unlockedAt: Date
  category: 'documents' | 'milestones' | 'engagement' | 'protection'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export interface SuggestedAction {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  priority: 'low' | 'medium' | 'high' | 'urgent'
  estimatedTime: number
  category: string
  motivationalMessage: string
}

interface ProgressMotivationProps {
  progress: ProgressData
  achievements: Achievement[]
  suggestedActions: SuggestedAction[]
  onActionClick: (actionId: string) => void
  onAchievementClick: (achievementId: string) => void
  userName?: string
  className?: string
}

export function ProgressMotivation({
  progress,
  achievements,
  suggestedActions,
  onActionClick,
  onAchievementClick,
  userName = "Milý používateľ",
  className
}: ProgressMotivationProps) {
  const [currentMotivation, setCurrentMotivation] = useState(0)
  const [showNewAchievement, setShowNewAchievement] = useState<Achievement | null>(null)

  const motivationalMessages = [
    `${userName}, každý dokument má svoju hodnotu a príbeh! 📚`,
    `Výborne! Váš digitálny odkaz rastie každým dňom. 🌱`,
    `Ste na správnej ceste k zabezpečeniu svojho odkazu. ✨`,
    `Každý krok vás približuje k pokoju mysle. 🕊️`,
    `Váša rodina ocení túto starostlivosť o budúcnosť. ❤️`
  ]

  // Rotate motivational messages
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMotivation(prev => (prev + 1) % motivationalMessages.length)
    }, 8000)

    return () => clearInterval(interval)
  }, [])

  // Check for new achievements
  useEffect(() => {
    const recentAchievement = achievements.find(
      achievement => Date.now() - achievement.unlockedAt.getTime() < 10000 // Last 10 seconds
    )

    if (recentAchievement && !showNewAchievement) {
      setShowNewAchievement(recentAchievement)
      setTimeout(() => setShowNewAchievement(null), 5000)
    }
  }, [achievements, showNewAchievement])

  const getProgressMessage = () => {
    if (progress.overallCompletion < 20) {
      return "Začínate svoju cestu"
    } else if (progress.overallCompletion < 50) {
      return "Máte dobrý pokrok"
    } else if (progress.overallCompletion < 80) {
      return "Skvelé tempo!"
    } else {
      return "Takmer dokončené!"
    }
  }

  const getStreakMessage = () => {
    if (progress.streak === 0) return "Začnite svoju sériu"
    if (progress.streak === 1) return "1 deň aktivity"
    if (progress.streak < 7) return `${progress.streak} dní v rade`
    return `${progress.streak} dní - úžasná séria! 🔥`
  }

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600'
      case 'rare': return 'from-blue-400 to-blue-600'
      case 'epic': return 'from-purple-400 to-purple-600'
      case 'legendary': return 'from-yellow-400 to-orange-600'
    }
  }

  const getPriorityColor = (priority: SuggestedAction['priority']) => {
    switch (priority) {
      case 'low': return 'border-gray-300 bg-gray-50'
      case 'medium': return 'border-blue-300 bg-blue-50'
      case 'high': return 'border-orange-300 bg-orange-50'
      case 'urgent': return 'border-red-300 bg-red-50'
    }
  }

  const getPriorityIcon = (priority: SuggestedAction['priority']) => {
    switch (priority) {
      case 'low': return <Circle className="w-4 h-4" />
      case 'medium': return <Target className="w-4 h-4" />
      case 'high': return <Zap className="w-4 h-4" />
      case 'urgent': return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* New Achievement Notification */}
      <AnimatePresence>
        {showNewAchievement && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-4 right-4 z-50 bg-white rounded-2xl shadow-2xl border-2 border-yellow-200 p-6 max-w-sm"
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center",
                getRarityColor(showNewAchievement.rarity)
              )}>
                <div className="text-white">
                  {showNewAchievement.icon}
                </div>
              </div>

              <div className="flex-1">
                <h4 className="font-bold text-gray-900 mb-1">
                  Nový úspech! 🎉
                </h4>
                <p className="text-sm text-gray-700 font-medium">
                  {showNewAchievement.title}
                </p>
                <p className="text-xs text-gray-500">
                  {showNewAchievement.description}
                </p>
              </div>
            </div>

            {/* Celebration particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`
                  }}
                  animate={{
                    y: [0, -30, 0],
                    opacity: [1, 0.5, 0],
                    scale: [0, 1, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: Math.random() * 2
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8" />
            <span className="text-2xl font-bold">
              {Math.round(progress.overallCompletion)}%
            </span>
          </div>

          <h3 className="font-semibold mb-1">Celkový pokrok</h3>
          <p className="text-blue-100 text-sm">
            {getProgressMessage()}
          </p>

          <div className="mt-4 w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white/80 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress.overallCompletion}%` }}
              transition={{ duration: 1, delay: 0.2 }}
            />
          </div>
        </motion.div>

        {/* Documents Count */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-8 h-8 text-green-500" />
            <span className="text-2xl font-bold text-gray-900">
              {progress.documentsCount}
            </span>
          </div>

          <h3 className="font-semibold text-gray-900 mb-1">Dokumenty</h3>
          <p className="text-gray-600 text-sm">
            Zabezpečené súbory
          </p>

          <div className="mt-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm text-gray-600">
              {progress.categoriesCompleted}/{progress.totalCategories} kategórií
            </span>
          </div>
        </motion.div>

        {/* Guardians */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-purple-500" />
            <span className="text-2xl font-bold text-gray-900">
              {progress.guardiansSet}
            </span>
          </div>

          <h3 className="font-semibold text-gray-900 mb-1">Strážcovia</h3>
          <p className="text-gray-600 text-sm">
            Dôveryhodné osoby
          </p>

          <div className="mt-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-gray-600">
              Ochrana nastavená
            </span>
          </div>
        </motion.div>

        {/* Activity Streak */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8" />
            <span className="text-2xl font-bold">
              {progress.streak}
            </span>
          </div>

          <h3 className="font-semibold mb-1">Séria dní</h3>
          <p className="text-orange-100 text-sm">
            {getStreakMessage()}
          </p>

          {progress.streak > 0 && (
            <motion.div
              className="mt-4 flex items-center gap-1"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {Array.from({ length: Math.min(progress.streak, 7) }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="w-2 h-2 bg-white/80 rounded-full"
                />
              ))}
              {progress.streak > 7 && (
                <span className="text-white/80 text-xs ml-1">+{progress.streak - 7}</span>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Motivational Message */}
      <motion.div
        key={currentMotivation}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 border border-pink-200"
      >
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white"
          >
            <Heart className="w-6 h-6" />
          </motion.div>

          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentMotivation}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-lg font-medium text-gray-900 leading-relaxed"
              >
                {motivationalMessages[currentMotivation]}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="flex gap-1">
            {motivationalMessages.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  index === currentMotivation ? "bg-purple-400" : "bg-gray-300"
                )}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Suggested Actions */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-500" />
            Navrhované akcie
          </h3>

          <span className="text-sm text-gray-500">
            {suggestedActions.length} úloh
          </span>
        </div>

        <div className="space-y-3">
          {suggestedActions.slice(0, 5).map((action, index) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onActionClick(action.id)}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-[1.02]",
                getPriorityColor(action.priority)
              )}
            >
              <div className={cn(
                "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
                action.priority === 'urgent' ? "text-red-600" :
                action.priority === 'high' ? "text-orange-600" :
                action.priority === 'medium' ? "text-blue-600" : "text-gray-600"
              )}>
                {action.icon}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900">
                    {action.title}
                  </h4>
                  {getPriorityIcon(action.priority)}
                </div>

                <p className="text-sm text-gray-600 mb-2">
                  {action.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    ~{action.estimatedTime} minút
                  </span>

                  <p className="text-xs text-gray-700 italic">
                    {action.motivationalMessage}
                  </p>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-gray-400" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Achievements */}
      {achievements.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              Nedávne úspechy
            </h3>

            <span className="text-sm text-gray-500">
              {achievements.length} odznakov
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.slice(0, 6).map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onAchievementClick(achievement.id)}
                className="relative p-4 rounded-xl border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 cursor-pointer transition-all duration-200 hover:scale-105 group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white",
                    getRarityColor(achievement.rarity)
                  )}>
                    {achievement.icon}
                  </div>

                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">
                      {achievement.title}
                    </h4>
                    <p className="text-xs text-gray-600">
                      {achievement.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-white capitalize",
                    achievement.rarity === 'legendary' ? "bg-gradient-to-r from-yellow-400 to-orange-500" :
                    achievement.rarity === 'epic' ? "bg-gradient-to-r from-purple-400 to-purple-600" :
                    achievement.rarity === 'rare' ? "bg-gradient-to-r from-blue-400 to-blue-600" :
                    "bg-gradient-to-r from-gray-400 to-gray-600"
                  )}>
                    {achievement.rarity}
                  </span>

                  <span className="text-gray-500">
                    {achievement.unlockedAt.toLocaleDateString()}
                  </span>
                </div>

                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}