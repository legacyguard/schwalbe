'use client'

import React, { ReactNode, useEffect, useState, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  Calendar,
  Bell,
  BellOff,
  Sunrise,
  Sunset,
  Moon,
  Coffee,
  AlertCircle,
  CheckCircle,
  X,
  Settings,
  Zap,
  Heart,
  Target,
  Sparkles
} from 'lucide-react'

// Reminder types
export interface TimeBasedReminder {
  id: string
  type: 'gentle_nudge' | 'milestone_check' | 'seasonal' | 'habit_building' | 'celebration'
  title: string
  message: string
  sofiaMessage: string
  icon: React.ComponentType<{ className?: string }>
  priority: 'low' | 'medium' | 'high'
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'seasonal'
  scheduledFor: Date
  triggeredAt?: Date
  dismissedAt?: Date
  userResponse?: 'dismissed' | 'snoozed' | 'completed' | 'disabled'
  snoozeUntil?: Date
  context: {
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
    dayOfWeek: number
    isWeekend: boolean
    season: 'spring' | 'summer' | 'autumn' | 'winter'
  }
  conditions?: {
    minimumInactivityHours?: number
    requiredProgress?: number
    onlyIfNotBusy?: boolean
  }
  actions?: Array<{
    label: string
    action: () => void
    style: 'primary' | 'secondary'
  }>
}

export interface NotificationSettings {
  enabled: boolean
  quietHours: {
    enabled: boolean
    start: string // "22:00"
    end: string   // "08:00"
  }
  frequencies: {
    gentleNudges: boolean
    milestoneChecks: boolean
    habitBuilding: boolean
    celebrations: boolean
  }
  preferredTimes: {
    morning: boolean
    afternoon: boolean
    evening: boolean
  }
  maxPerDay: number
  respectDoNotDisturb: boolean
}

// Reminder context
interface ReminderContextType {
  reminders: TimeBasedReminder[]
  settings: NotificationSettings
  activeReminder: TimeBasedReminder | null
  updateSettings: (update: Partial<NotificationSettings>) => void
  dismissReminder: (reminderId: string) => void
  snoozeReminder: (reminderId: string, duration: number) => void
  completeReminder: (reminderId: string) => void
  scheduleCustomReminder: (reminder: Omit<TimeBasedReminder, 'id' | 'scheduledFor'>) => void
}

const ReminderContext = createContext<ReminderContextType | null>(null)

export function useReminders() {
  const context = useContext(ReminderContext)
  if (!context) {
    throw new Error('useReminders must be used within a ReminderProvider')
  }
  return context
}

// Default notification settings
const defaultSettings: NotificationSettings = {
  enabled: true,
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '08:00'
  },
  frequencies: {
    gentleNudges: true,
    milestoneChecks: true,
    habitBuilding: true,
    celebrations: true
  },
  preferredTimes: {
    morning: true,
    afternoon: true,
    evening: false
  },
  maxPerDay: 3,
  respectDoNotDisturb: true
}

// Helper functions
const getCurrentContext = () => {
  const now = new Date()
  const hour = now.getHours()
  const dayOfWeek = now.getDay()
  const month = now.getMonth()

  return {
    timeOfDay: hour < 12 ? 'morning' as const :
              hour < 17 ? 'afternoon' as const :
              hour < 21 ? 'evening' as const : 'night' as const,
    dayOfWeek,
    isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    season: month >= 2 && month <= 4 ? 'spring' as const :
            month >= 5 && month <= 7 ? 'summer' as const :
            month >= 8 && month <= 10 ? 'autumn' as const : 'winter' as const
  }
}

const isInQuietHours = (settings: NotificationSettings): boolean => {
  if (!settings.quietHours.enabled) return false

  const now = new Date()
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

  const { start, end } = settings.quietHours

  if (start > end) {
    // Quiet hours span midnight (e.g., 22:00 to 08:00)
    return currentTime >= start || currentTime <= end
  } else {
    // Quiet hours within same day
    return currentTime >= start && currentTime <= end
  }
}

// Reminder generators
const reminderGenerators = {
  gentleReturn: (inactiveHours: number): Omit<TimeBasedReminder, 'id' | 'scheduledFor'> => ({
    type: 'gentle_nudge',
    title: 'Vitajte späť!',
    message: `Už ${Math.floor(inactiveHours)} hodín sme sa nevideli. Čo keby sme pokračovali v starostlivosti o vašu budúcnosť?`,
    sofiaMessage: 'Chýbali ste mi! Pokračujme tam, kde sme skončili. Každý malý krok sa počíta. 💙',
    icon: Heart,
    priority: 'low',
    frequency: 'once',
    context: getCurrentContext(),
    conditions: {
      minimumInactivityHours: 24,
      onlyIfNotBusy: true
    },
    actions: [
      {
        label: 'Pokračovať',
        action: () => window.location.href = '/dashboard',
        style: 'primary'
      },
      {
        label: 'Neskôr',
        action: () => {},
        style: 'secondary'
      }
    ]
  }),

  morningMotivation: (): Omit<TimeBasedReminder, 'id' | 'scheduledFor'> => ({
    type: 'habit_building',
    title: 'Dobré ráno!',
    message: 'Začnite deň produktívne. Čo keby sme dnes pridali jeden dokument?',
    sofiaMessage: 'Dobré ráno! Ranné hodiny sú perfektné na produktívnu prácu. Spolu to dokážeme! ☀️',
    icon: Sunrise,
    priority: 'medium',
    frequency: 'daily',
    context: getCurrentContext(),
    conditions: {
      onlyIfNotBusy: true
    },
    actions: [
      {
        label: 'Nahrať dokument',
        action: () => window.location.href = '/upload',
        style: 'primary'
      }
    ]
  }),

  weeklyReview: (): Omit<TimeBasedReminder, 'id' | 'scheduledFor'> => ({
    type: 'milestone_check',
    title: 'Týždenné zhrnutie',
    message: 'Pozrime sa na váš pokrok z tohto týždňa a naplánujme ďalšie kroky.',
    sofiaMessage: 'Čas na malé oslavy! Pozrime sa spoločne na to, čo sme dokázali tento týždeň. 📊',
    icon: Target,
    priority: 'medium',
    frequency: 'weekly',
    context: getCurrentContext(),
    actions: [
      {
        label: 'Zobraziť pokrok',
        action: () => window.location.href = '/progress',
        style: 'primary'
      }
    ]
  }),

  celebrationReminder: (achievement: string): Omit<TimeBasedReminder, 'id' | 'scheduledFor'> => ({
    type: 'celebration',
    title: 'Čas na oslavu! 🎉',
    message: `Dosiahli ste ${achievement}! Ste úžasní!`,
    sofiaMessage: `Som na vás tak hrdá! ${achievement} je fantastický úspech. Zaslúžite si oslavu! ✨`,
    icon: Sparkles,
    priority: 'high',
    frequency: 'once',
    context: getCurrentContext(),
    actions: [
      {
        label: 'Oslavovať',
        action: () => {},
        style: 'primary'
      }
    ]
  }),

  seasonalReminder: (season: string): Omit<TimeBasedReminder, 'id' | 'scheduledFor'> => ({
    type: 'seasonal',
    title: `${season} organizácia`,
    message: `Nové ročné obdobie je perfektný čas na aktualizáciu dokumentov.`,
    sofiaMessage: `Ach, ${season}! Moja obľúbená sezóna na organizovanie. Aktualizujme spoločne dokumenty! 🍂`,
    icon: Calendar,
    priority: 'medium',
    frequency: 'seasonal',
    context: getCurrentContext(),
    actions: [
      {
        label: 'Aktualizovať',
        action: () => window.location.href = '/documents',
        style: 'primary'
      }
    ]
  })
}

// Reminder provider
interface ReminderProviderProps {
  children: ReactNode
  initialSettings?: Partial<NotificationSettings>
}

export function ReminderProvider({
  children,
  initialSettings = {}
}: ReminderProviderProps) {
  const [reminders, setReminders] = useState<TimeBasedReminder[]>([])
  const [settings, setSettings] = useState<NotificationSettings>({
    ...defaultSettings,
    ...initialSettings
  })
  const [activeReminder, setActiveReminder] = useState<TimeBasedReminder | null>(null)

  // Schedule automatic reminders
  useEffect(() => {
    if (!settings.enabled) return

    const scheduleReminders = () => {
      const now = new Date()
      const context = getCurrentContext()

      // Morning motivation (if enabled)
      if (settings.frequencies.habitBuilding && settings.preferredTimes.morning) {
        const morningTime = new Date()
        morningTime.setHours(9, 0, 0, 0)
        if (morningTime > now) {
          const reminder = {
            ...reminderGenerators.morningMotivation(),
            id: `morning-${now.getTime()}`,
            scheduledFor: morningTime
          }
          setReminders(prev => [...prev, reminder])
        }
      }

      // Weekly review (Sundays at 6 PM)
      if (settings.frequencies.milestoneChecks && context.dayOfWeek === 0) {
        const weeklyTime = new Date()
        weeklyTime.setHours(18, 0, 0, 0)
        if (weeklyTime > now) {
          const reminder = {
            ...reminderGenerators.weeklyReview(),
            id: `weekly-${now.getTime()}`,
            scheduledFor: weeklyTime
          }
          setReminders(prev => [...prev, reminder])
        }
      }
    }

    scheduleReminders()

    // Set up daily scheduler
    const dailyScheduler = setInterval(scheduleReminders, 24 * 60 * 60 * 1000)

    return () => clearInterval(dailyScheduler)
  }, [settings])

  // Check for due reminders
  useEffect(() => {
    const checkReminders = () => {
      if (!settings.enabled || isInQuietHours(settings)) return

      const now = new Date()
      const todayCount = reminders.filter(r =>
        r.triggeredAt &&
        r.triggeredAt.toDateString() === now.toDateString()
      ).length

      if (todayCount >= settings.maxPerDay) return

      const dueReminder = reminders.find(reminder =>
        !reminder.triggeredAt &&
        !reminder.dismissedAt &&
        (!reminder.snoozeUntil || reminder.snoozeUntil <= now) &&
        reminder.scheduledFor <= now
      )

      if (dueReminder) {
        setActiveReminder(dueReminder)
        setReminders(prev => prev.map(r =>
          r.id === dueReminder.id
            ? { ...r, triggeredAt: now }
            : r
        ))
      }
    }

    const interval = setInterval(checkReminders, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [reminders, settings])

  const updateSettings = (update: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...update }))
  }

  const dismissReminder = (reminderId: string) => {
    setReminders(prev => prev.map(r =>
      r.id === reminderId
        ? { ...r, dismissedAt: new Date(), userResponse: 'dismissed' }
        : r
    ))
    setActiveReminder(null)
  }

  const snoozeReminder = (reminderId: string, duration: number) => {
    const snoozeUntil = new Date(Date.now() + duration)
    setReminders(prev => prev.map(r =>
      r.id === reminderId
        ? { ...r, snoozeUntil, userResponse: 'snoozed' }
        : r
    ))
    setActiveReminder(null)
  }

  const completeReminder = (reminderId: string) => {
    setReminders(prev => prev.map(r =>
      r.id === reminderId
        ? { ...r, userResponse: 'completed' }
        : r
    ))
    setActiveReminder(null)
  }

  const scheduleCustomReminder = (reminder: Omit<TimeBasedReminder, 'id' | 'scheduledFor'>) => {
    const newReminder: TimeBasedReminder = {
      ...reminder,
      id: `custom-${Date.now()}`,
      scheduledFor: new Date()
    }
    setReminders(prev => [...prev, newReminder])
  }

  return (
    <ReminderContext.Provider
      value={{
        reminders,
        settings,
        activeReminder,
        updateSettings,
        dismissReminder,
        snoozeReminder,
        completeReminder,
        scheduleCustomReminder
      }}
    >
      {children}
    </ReminderContext.Provider>
  )
}

// Reminder notification component
interface ReminderNotificationProps {
  reminder: TimeBasedReminder
  onDismiss: (reminderId: string) => void
  onSnooze: (reminderId: string, duration: number) => void
  onComplete: (reminderId: string) => void
}

export function ReminderNotification({
  reminder,
  onDismiss,
  onSnooze,
  onComplete
}: ReminderNotificationProps) {
  const IconComponent = reminder.icon

  const priorityStyles = {
    low: 'border-blue-200 bg-blue-50',
    medium: 'border-orange-200 bg-orange-50',
    high: 'border-red-200 bg-red-50'
  }

  const timeOfDayColors = {
    morning: 'from-yellow-50 to-orange-50',
    afternoon: 'from-blue-50 to-cyan-50',
    evening: 'from-purple-50 to-pink-50',
    night: 'from-indigo-50 to-gray-50'
  }

  return (
    <motion.div
      className="fixed bottom-4 right-4 max-w-sm z-50"
      initial={{ opacity: 0, x: 300, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.9 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25
      }}
    >
      <div className={`
        border-2 rounded-xl shadow-2xl overflow-hidden
        ${priorityStyles[reminder.priority]}
      `}>
        {/* Header with time context */}
        <div className={`bg-gradient-to-r ${timeOfDayColors[reminder.context.timeOfDay]} p-4 border-b`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <IconComponent className="w-5 h-5 text-gray-700" />
              <span className="font-medium text-gray-900">{reminder.title}</span>
            </div>
            <button
              onClick={() => onDismiss(reminder.id)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-white/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-sm text-gray-700 mb-3">
            {reminder.message}
          </p>

          {/* Sofia message */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 mb-4">
            <div className="flex items-start space-x-2">
              <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-purple-700 italic">
                {reminder.sofiaMessage}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            {reminder.actions && reminder.actions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  action.action()
                  onComplete(reminder.id)
                }}
                className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  action.style === 'primary'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {action.label}
              </button>
            ))}

            {/* Snooze options */}
            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => onSnooze(reminder.id, 15 * 60 * 1000)} // 15 minutes
                className="flex-1 px-3 py-1 text-xs text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                15 min
              </button>
              <button
                onClick={() => onSnooze(reminder.id, 60 * 60 * 1000)} // 1 hour
                className="flex-1 px-3 py-1 text-xs text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                1 hod
              </button>
              <button
                onClick={() => onSnooze(reminder.id, 24 * 60 * 60 * 1000)} // 1 day
                className="flex-1 px-3 py-1 text-xs text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                1 deň
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Notification settings panel
interface NotificationSettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationSettingsPanel({
  isOpen,
  onClose
}: NotificationSettingsPanelProps) {
  const { settings, updateSettings } = useReminders()

  const handleSettingChange = (key: keyof NotificationSettings, value: any) => {
    updateSettings({ [key]: value })
  }

  const handleNestedSettingChange = (
    parentKey: keyof NotificationSettings,
    nestedKey: string,
    value: any
  ) => {
    updateSettings({
      [parentKey]: {
        ...(settings[parentKey] as any),
        [nestedKey]: value
      }
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              className="relative bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <Settings className="w-6 h-6 mr-2" />
                    Notification Settings
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-white/50 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Settings */}
              <div className="p-6 space-y-6">
                {/* Main toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Enable Notifications</h3>
                    <p className="text-sm text-gray-600">Receive gentle reminders from Sofia</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('enabled', !settings.enabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.enabled ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {settings.enabled && (
                  <>
                    {/* Quiet hours */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Quiet Hours</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Enable quiet hours</span>
                          <button
                            onClick={() => handleNestedSettingChange('quietHours', 'enabled', !settings.quietHours.enabled)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                              settings.quietHours.enabled ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                settings.quietHours.enabled ? 'translate-x-5' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        {settings.quietHours.enabled && (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">From</label>
                              <input
                                type="time"
                                value={settings.quietHours.start}
                                onChange={(e) => handleNestedSettingChange('quietHours', 'start', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">To</label>
                              <input
                                type="time"
                                value={settings.quietHours.end}
                                onChange={(e) => handleNestedSettingChange('quietHours', 'end', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Notification types */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Notification Types</h3>
                      <div className="space-y-2">
                        {Object.entries(settings.frequencies).map(([key, enabled]) => (
                          <div key={key} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                            </span>
                            <button
                              onClick={() => handleNestedSettingChange('frequencies', key, !enabled)}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                enabled ? 'bg-blue-600' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                  enabled ? 'translate-x-5' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Daily limit */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Daily Limit</h3>
                      <div className="flex items-center space-x-3">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={settings.maxPerDay}
                          onChange={(e) => handleSettingChange('maxPerDay', parseInt(e.target.value))}
                          className="flex-1"
                        />
                        <span className="text-sm font-medium text-gray-700 w-8">
                          {settings.maxPerDay}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Maximum notifications per day
                      </p>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Active reminder display
export function ActiveReminderDisplay() {
  const { activeReminder, dismissReminder, snoozeReminder, completeReminder } = useReminders()

  return (
    <AnimatePresence>
      {activeReminder && (
        <ReminderNotification
          reminder={activeReminder}
          onDismiss={dismissReminder}
          onSnooze={snoozeReminder}
          onComplete={completeReminder}
        />
      )}
    </AnimatePresence>
  )
}

export default {
  ReminderProvider,
  useReminders,
  ReminderNotification,
  NotificationSettingsPanel,
  ActiveReminderDisplay
}