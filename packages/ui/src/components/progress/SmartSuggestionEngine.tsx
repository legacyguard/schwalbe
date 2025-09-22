'use client'

import React, { ReactNode, useEffect, useState, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Lightbulb,
  FileText,
  Home,
  Heart,
  Car,
  Briefcase,
  Shield,
  Calendar,
  TrendingUp,
  Clock,
  ArrowRight,
  X,
  Star,
  Sparkles
} from 'lucide-react'
import { useProgress } from './ProgressTrackingEngine'

// Suggestion types
export interface SmartSuggestion {
  id: string
  type: 'document' | 'category' | 'action' | 'milestone' | 'seasonal'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  title: string
  description: string
  reason: string
  sofiaMessage: string
  icon: React.ComponentType<{ className?: string }>
  category?: string
  estimatedTime?: number
  difficulty: 'easy' | 'medium' | 'hard'
  completionReward?: string
  actionUrl?: string
  dismissible: boolean
  expiresAt?: Date
  triggers: string[]
  contextualData?: Record<string, any>
}

export interface UserContext {
  lifeStage: 'young_adult' | 'family' | 'established' | 'pre_retirement' | 'retirement'
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed'
  hasChildren: boolean
  homeOwner: boolean
  employmentStatus: 'employed' | 'self_employed' | 'unemployed' | 'retired'
  recentLifeEvents: string[]
  documentGaps: string[]
  lastActivityDays: number
  preferredPace: 'slow' | 'moderate' | 'fast'
}

export interface SuggestionRule {
  id: string
  name: string
  condition: (context: UserContext, stats: any) => boolean
  generateSuggestion: (context: UserContext, stats: any) => SmartSuggestion
  weight: number
}

// Smart suggestion context
interface SuggestionContextType {
  suggestions: SmartSuggestion[]
  userContext: UserContext
  updateContext: (update: Partial<UserContext>) => void
  dismissSuggestion: (suggestionId: string) => void
  completeSuggestion: (suggestionId: string) => void
  refreshSuggestions: () => void
}

const SuggestionContext = createContext<SuggestionContextType | null>(null)

export function useSuggestions() {
  const context = useContext(SuggestionContext)
  if (!context) {
    throw new Error('useSuggestions must be used within a SuggestionProvider')
  }
  return context
}

// Default user context
const defaultUserContext: UserContext = {
  lifeStage: 'young_adult',
  maritalStatus: 'single',
  hasChildren: false,
  homeOwner: false,
  employmentStatus: 'employed',
  recentLifeEvents: [],
  documentGaps: ['identity', 'financial', 'legal'],
  lastActivityDays: 0,
  preferredPace: 'moderate'
}

// Suggestion rules engine
const suggestionRules: SuggestionRule[] = [
  // First document suggestion
  {
    id: 'first_document',
    name: 'First Document Upload',
    condition: (context, stats) => stats.totalDocuments === 0,
    weight: 100,
    generateSuggestion: (context, stats) => ({
      id: 'upload_first_document',
      type: 'document',
      priority: 'high',
      title: 'Nahrajte svoj prvý dokument',
      description: 'Začnite svoju cestu k pokoju duše nahratím osobného dokladu',
      reason: 'Každá cesta začína prvým krokom',
      sofiaMessage: 'Ahoj! Som Sofia a som tu pre vás. Začnime spolu nahratím vašej prvej dôležitej spomienky. ✨',
      icon: FileText,
      estimatedTime: 2,
      difficulty: 'easy',
      completionReward: 'Odomknite badge "Prvé kroky"',
      dismissible: false,
      triggers: ['onboarding_complete', 'dashboard_visit']
    })
  },

  // Identity documents gap
  {
    id: 'identity_documents',
    name: 'Identity Documents Missing',
    condition: (context, stats) => context.documentGaps.includes('identity'),
    weight: 90,
    generateSuggestion: (context, stats) => ({
      id: 'complete_identity_docs',
      type: 'category',
      priority: 'high',
      title: 'Osobné doklady',
      description: 'Nahrajte občiansky preukaz, pas a ďalšie identifikačné dokumenty',
      reason: 'Základné dokumenty sú najdôležitejšie pre bezpečnosť',
      sofiaMessage: 'Osobné doklady sú základom vašej digitálnej identity. Postarajme sa o ne spolu! 🛡️',
      icon: Shield,
      category: 'identity',
      estimatedTime: 5,
      difficulty: 'easy',
      completionReward: 'Zvýšenie bezpečnosti o 25%',
      dismissible: true,
      triggers: ['identity_gap_detected']
    })
  },

  // Home ownership suggestions
  {
    id: 'home_documents',
    name: 'Home Owner Documents',
    condition: (context, stats) => context.homeOwner && context.documentGaps.includes('property'),
    weight: 85,
    generateSuggestion: (context, stats) => ({
      id: 'home_ownership_docs',
      type: 'category',
      priority: 'medium',
      title: 'Dokumenty k nehnuteľnosti',
      description: 'Nahrajte kúpnu zmluvu, výpis z listu vlastníctva a poistné zmluvy',
      reason: 'Nehnuteľnosť je často najväčšia investícia',
      sofiaMessage: 'Váš domov je vaše kráľovstvo! Chráňme všetky dokumenty k nemu. 🏠',
      icon: Home,
      category: 'property',
      estimatedTime: 10,
      difficulty: 'medium',
      completionReward: 'Kompletná ochrana nehnuteľnosti',
      dismissible: true,
      triggers: ['home_owner_detected']
    })
  },

  // Family documents for married with children
  {
    id: 'family_documents',
    name: 'Family Documents',
    condition: (context, stats) => context.maritalStatus === 'married' && context.hasChildren,
    weight: 80,
    generateSuggestion: (context, stats) => ({
      id: 'family_docs_complete',
      type: 'category',
      priority: 'medium',
      title: 'Rodinné dokumenty',
      description: 'Nahrajte sobášny list, rodné listy detí a rodinné poistky',
      reason: 'Ochrana rodiny je priorita',
      sofiaMessage: 'Vaša rodina je vaše najväčšie bohatstvo. Ochráňme ju spoločne! 👨‍👩‍👧‍👦',
      icon: Heart,
      category: 'family',
      estimatedTime: 15,
      difficulty: 'medium',
      completionReward: 'Kompletná ochrana rodiny',
      dismissible: true,
      triggers: ['family_status_detected']
    })
  },

  // Inactivity reminder
  {
    id: 'inactivity_reminder',
    name: 'Inactivity Reminder',
    condition: (context, stats) => context.lastActivityDays >= 7,
    weight: 60,
    generateSuggestion: (context, stats) => ({
      id: 'return_gentle_reminder',
      type: 'action',
      priority: 'low',
      title: 'Vitajte späť!',
      description: 'Pokračujme v budovaní vašej bezpečnej budúcnosti',
      reason: 'Dlhšie ste neboli aktívni',
      sofiaMessage: 'Chýbali ste mi! Pokračujme tam, kde sme skončili. Každý malý krok sa počíta. 💙',
      icon: Calendar,
      estimatedTime: 5,
      difficulty: 'easy',
      dismissible: true,
      triggers: ['user_return'],
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
    })
  },

  // Seasonal reminders
  {
    id: 'tax_season',
    name: 'Tax Season Reminder',
    condition: (context, stats) => {
      const now = new Date()
      return now.getMonth() >= 0 && now.getMonth() <= 2 // January-March
    },
    weight: 70,
    generateSuggestion: (context, stats) => ({
      id: 'tax_documents_reminder',
      type: 'seasonal',
      priority: 'medium',
      title: 'Daňové dokumenty',
      description: 'Pripravte si dokumenty pre daňové priznanie',
      reason: 'Blíži sa koniec daňového obdobia',
      sofiaMessage: 'Marec je tu! Pripravme sa na dane s pokojom v duši. Mám pre vás checklist! 📋',
      icon: Briefcase,
      category: 'financial',
      estimatedTime: 20,
      difficulty: 'medium',
      dismissible: true,
      triggers: ['seasonal_tax_period'],
      expiresAt: new Date(new Date().getFullYear(), 2, 31) // End of March
    })
  },

  // Achievement milestone suggestion
  {
    id: 'milestone_push',
    name: 'Milestone Push',
    condition: (context, stats) => {
      const nextMilestone = stats.nextMilestone
      return nextMilestone && (nextMilestone.target - nextMilestone.current) <= 2
    },
    weight: 75,
    generateSuggestion: (context, stats) => ({
      id: 'milestone_push_suggestion',
      type: 'milestone',
      priority: 'medium',
      title: 'Blízko k cieľu!',
      description: `Iba ${stats.nextMilestone.target - stats.nextMilestone.current} krokov do ďalšieho úspechu`,
      reason: 'Ste blízko k ďalšiemu milestone',
      sofiaMessage: 'Cítim váš úspech! Ešte pár krokov a dosiahne ste ďalší míľnik. Dokážete to! 🌟',
      icon: TrendingUp,
      estimatedTime: 10,
      difficulty: 'easy',
      completionReward: stats.nextMilestone.reward?.name,
      dismissible: true,
      triggers: ['milestone_proximity']
    })
  }
]

// Suggestion provider
interface SuggestionProviderProps {
  children: ReactNode
  initialContext?: Partial<UserContext>
}

export function SuggestionProvider({
  children,
  initialContext = {}
}: SuggestionProviderProps) {
  const [userContext, setUserContext] = useState<UserContext>({
    ...defaultUserContext,
    ...initialContext
  })
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([])
  const { stats, milestones } = useProgress()

  // Generate suggestions based on rules
  const generateSuggestions = () => {
    const newSuggestions: SmartSuggestion[] = []

    // Add next milestone info to stats for rules
    const nextMilestone = milestones.find(m => !m.unlocked)
    const enhancedStats = { ...stats, nextMilestone }

    suggestionRules
      .filter(rule => rule.condition(userContext, enhancedStats))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5) // Limit to top 5 suggestions
      .forEach(rule => {
        const suggestion = rule.generateSuggestion(userContext, enhancedStats)
        newSuggestions.push(suggestion)
      })

    setSuggestions(newSuggestions)
  }

  // Update user context
  const updateContext = (update: Partial<UserContext>) => {
    setUserContext(prev => ({ ...prev, ...update }))
  }

  // Dismiss suggestion
  const dismissSuggestion = (suggestionId: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId))
  }

  // Complete suggestion
  const completeSuggestion = (suggestionId: string) => {
    const suggestion = suggestions.find(s => s.id === suggestionId)
    if (suggestion) {
      // Trigger completion event
      document.dispatchEvent(new CustomEvent('suggestionCompleted', {
        detail: suggestion
      }))

      dismissSuggestion(suggestionId)
    }
  }

  // Regenerate suggestions when context or stats change
  useEffect(() => {
    generateSuggestions()
  }, [userContext, stats, milestones])

  // Clean expired suggestions
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      setSuggestions(prev =>
        prev.filter(s => !s.expiresAt || s.expiresAt > now)
      )
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])

  return (
    <SuggestionContext.Provider
      value={{
        suggestions,
        userContext,
        updateContext,
        dismissSuggestion,
        completeSuggestion,
        refreshSuggestions: generateSuggestions
      }}
    >
      {children}
    </SuggestionContext.Provider>
  )
}

// Suggestion card component
interface SuggestionCardProps {
  suggestion: SmartSuggestion
  onDismiss?: (suggestionId: string) => void
  onComplete?: (suggestionId: string) => void
  className?: string
}

export function SuggestionCard({
  suggestion,
  onDismiss,
  onComplete,
  className = ''
}: SuggestionCardProps) {
  const IconComponent = suggestion.icon

  const priorityStyles = {
    low: 'border-gray-200 bg-gray-50',
    medium: 'border-blue-200 bg-blue-50',
    high: 'border-orange-200 bg-orange-50',
    urgent: 'border-red-200 bg-red-50'
  }

  const difficultyColors = {
    easy: 'text-green-600 bg-green-100',
    medium: 'text-yellow-600 bg-yellow-100',
    hard: 'text-red-600 bg-red-100'
  }

  return (
    <motion.div
      className={`relative border rounded-xl p-4 ${priorityStyles[suggestion.priority]} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Dismiss button */}
      {suggestion.dismissible && onDismiss && (
        <button
          onClick={() => onDismiss(suggestion.id)}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-white/50 transition-colors"
          aria-label="Dismiss suggestion"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <div className="flex items-start space-x-4">
        {/* Icon */}
        <div className={`p-3 rounded-full ${
          suggestion.priority === 'high' ? 'bg-orange-100' :
          suggestion.priority === 'urgent' ? 'bg-red-100' :
          'bg-blue-100'
        }`}>
          <IconComponent className={`w-6 h-6 ${
            suggestion.priority === 'high' ? 'text-orange-600' :
            suggestion.priority === 'urgent' ? 'text-red-600' :
            'text-blue-600'
          }`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <h4 className="font-semibold text-gray-900">{suggestion.title}</h4>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${difficultyColors[suggestion.difficulty]}`}>
              {suggestion.difficulty === 'easy' ? 'Ľahké' :
               suggestion.difficulty === 'medium' ? 'Stredné' : 'Náročné'}
            </span>
          </div>

          <p className="text-sm text-gray-700 mb-2">{suggestion.description}</p>

          {/* Sofia message */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 mb-3">
            <div className="flex items-start space-x-2">
              <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-purple-700 italic">
                {suggestion.sofiaMessage}
              </p>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <div className="flex items-center space-x-4">
              {suggestion.estimatedTime && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{suggestion.estimatedTime} min</span>
                </div>
              )}
              <div>Dôvod: {suggestion.reason}</div>
            </div>

            {suggestion.expiresAt && (
              <div className="text-orange-600">
                Platné do {suggestion.expiresAt.toLocaleDateString('sk-SK')}
              </div>
            )}
          </div>

          {/* Reward */}
          {suggestion.completionReward && (
            <div className="flex items-center space-x-1 text-xs text-green-600 mb-3">
              <Star className="w-3 h-3" />
              <span>Odmena: {suggestion.completionReward}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-2">
            <button
              onClick={() => onComplete?.(suggestion.id)}
              className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <span>Začať</span>
              <ArrowRight className="w-3 h-3" />
            </button>

            {suggestion.actionUrl && (
              <a
                href={suggestion.actionUrl}
                className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Viac info
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Suggestion feed component
interface SuggestionFeedProps {
  limit?: number
  showEmptyState?: boolean
  className?: string
}

export function SuggestionFeed({
  limit,
  showEmptyState = true,
  className = ''
}: SuggestionFeedProps) {
  const { suggestions, dismissSuggestion, completeSuggestion } = useSuggestions()

  const displaySuggestions = limit ? suggestions.slice(0, limit) : suggestions

  if (displaySuggestions.length === 0 && !showEmptyState) {
    return null
  }

  return (
    <div className={className}>
      <AnimatePresence>
        {displaySuggestions.length === 0 ? (
          showEmptyState && (
            <motion.div
              className="text-center py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Skvelá práca!
              </h3>
              <p className="text-gray-600">
                Momentálne nemáme žiadne nové návrhy. Sofia vás bude kontaktovať, keď bude mať niečo nové.
              </p>
            </motion.div>
          )
        ) : (
          <div className="space-y-4">
            {displaySuggestions.map((suggestion) => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                onDismiss={dismissSuggestion}
                onComplete={completeSuggestion}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default {
  SuggestionProvider,
  useSuggestions,
  SuggestionCard,
  SuggestionFeed
}