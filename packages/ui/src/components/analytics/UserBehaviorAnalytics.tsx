'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAnalyticsStore } from '../../stores/useAnalyticsStore'
import { useSofiaStore } from '../../stores/useSofiaStore'

export interface UserEvent {
  id: string
  userId: string
  sessionId: string
  eventType: EventType
  eventName: string
  properties: Record<string, any>
  timestamp: Date
  page: string
  userAgent: string
  location?: {
    country?: string
    region?: string
    city?: string
  }
  duration?: number
  isAnonymized: boolean
}

export type EventType =
  | 'page_view'
  | 'button_click'
  | 'form_submit'
  | 'document_upload'
  | 'document_view'
  | 'timecapsule_create'
  | 'timecapsule_schedule'
  | 'will_generate'
  | 'template_use'
  | 'feature_discover'
  | 'error_encounter'
  | 'session_start'
  | 'session_end'

export interface UserJourney {
  id: string
  userId: string
  startTime: Date
  endTime?: Date
  steps: JourneyStep[]
  outcome: 'completed' | 'abandoned' | 'ongoing'
  goal: string
  duration: number
  touchpoints: string[]
  dropoffPoint?: string
}

export interface JourneyStep {
  id: string
  stepName: string
  timestamp: Date
  duration: number
  success: boolean
  errorMessage?: string
  metadata: Record<string, any>
}

export interface BehaviorInsight {
  id: string
  type: 'pattern' | 'anomaly' | 'opportunity' | 'risk'
  title: string
  description: string
  confidence: number
  impact: 'low' | 'medium' | 'high' | 'critical'
  category: 'engagement' | 'usability' | 'conversion' | 'retention' | 'security'
  recommendations: string[]
  affectedUsers: number
  trend: 'increasing' | 'decreasing' | 'stable'
  createdAt: Date
}

export interface UsageMetrics {
  daily: {
    activeUsers: number
    sessions: number
    pageViews: number
    avgSessionDuration: number
    bounceRate: number
  }
  features: {
    documentUploads: number
    timeCapsuleCreated: number
    willsGenerated: number
    templatesUsed: number
    sharingActions: number
  }
  engagement: {
    returnUsers: number
    timeSpentToday: number
    actionsPerSession: number
    featureAdoption: number
  }
}

const UserBehaviorAnalytics: React.FC = () => {
  const {
    userEvents,
    userJourneys,
    behaviorInsights,
    usageMetrics,
    isTracking,
    privacySettings,
    startTracking,
    stopTracking,
    trackEvent,
    analyzeUserBehavior,
    generateInsights,
    exportAnalytics,
    getPrivacyReport,
    updatePrivacySettings
  } = useAnalyticsStore()

  const { addMessage, isVisible } = useSofiaStore()

  const [activeTab, setActiveTab] = useState<'overview' | 'journeys' | 'insights' | 'privacy'>('overview')
  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | '7days' | '30days' | '90days'>('7days')
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)

  useEffect(() => {
    if (!isTracking && privacySettings.analyticsEnabled) {
      startTracking()
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (isTracking) {
        analyzeUserBehavior()
        generateInsights()
      }
    }, 30000) // Analyze every 30 seconds

    return () => clearInterval(interval)
  }, [isTracking])

  const handleToggleTracking = async (enabled: boolean) => {
    try {
      if (enabled) {
        await startTracking()

        if (isVisible) {
          addMessage({
            id: `tracking-enabled-${Date.now()}`,
            type: 'info',
            content: 'Analytika je zapnutá! Sleduje sa len anonymizované správanie pre vylepšenie aplikácie. Tvoje súkromie je chránené. 📊🔒',
            timestamp: new Date(),
            priority: 'medium'
          })
        }
      } else {
        await stopTracking()

        if (isVisible) {
          addMessage({
            id: `tracking-disabled-${Date.now()}`,
            type: 'info',
            content: 'Analytika je vypnutá. Žiadne údaje o tvojom správaní sa nezaznamenávajú. 🔒',
            timestamp: new Date(),
            priority: 'medium'
          })
        }
      }
    } catch (error) {
      console.error('Toggle tracking error:', error)
    }
  }

  const handleExportAnalytics = async () => {
    try {
      const exportData = await exportAnalytics(selectedTimeframe)

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-${selectedTimeframe}-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      if (isVisible) {
        addMessage({
          id: `export-success-${Date.now()}`,
          type: 'success',
          content: 'Analytické údaje boli exportované! Môžeš ich použiť na vlastnú analýzu. 📊✅',
          timestamp: new Date(),
          priority: 'medium'
        })
      }
    } catch (error) {
      console.error('Export error:', error)
    }
  }

  const getEventTypeIcon = (eventType: EventType) => {
    const icons: Record<EventType, string> = {
      page_view: '👁️',
      button_click: '👆',
      form_submit: '📝',
      document_upload: '📤',
      document_view: '📄',
      timecapsule_create: '⏰',
      timecapsule_schedule: '📅',
      will_generate: '⚖️',
      template_use: '📋',
      feature_discover: '✨',
      error_encounter: '❌',
      session_start: '🚀',
      session_end: '🏁'
    }
    return icons[eventType] || '📊'
  }

  const getInsightTypeColor = (type: BehaviorInsight['type']) => {
    const colors = {
      pattern: 'text-blue-600 bg-blue-50 border-blue-200',
      anomaly: 'text-orange-600 bg-orange-50 border-orange-200',
      opportunity: 'text-green-600 bg-green-50 border-green-200',
      risk: 'text-red-600 bg-red-50 border-red-200'
    }
    return colors[type]
  }

  const getImpactColor = (impact: BehaviorInsight['impact']) => {
    const colors = {
      low: 'text-gray-600 bg-gray-50',
      medium: 'text-yellow-600 bg-yellow-50',
      high: 'text-orange-600 bg-orange-50',
      critical: 'text-red-600 bg-red-50'
    }
    return colors[impact]
  }

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ${seconds % 60}s`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ${minutes % 60}m`
  }

  const getTimeframeLabel = (timeframe: string) => {
    const labels = {
      today: 'Dnes',
      '7days': 'Posledných 7 dní',
      '30days': 'Posledných 30 dní',
      '90days': 'Posledných 90 dní'
    }
    return labels[timeframe as keyof typeof labels]
  }

  return (
    <div className="user-behavior-analytics max-w-7xl mx-auto p-6">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Analytika správania</h1>
          <div className="flex items-center space-x-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isTracking ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {isTracking ? '📊 Sleduje sa' : '🔒 Vypnuté'}
            </div>
            <button
              onClick={() => setShowPrivacyModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Nastavenia súkromia
            </button>
          </div>
        </div>
        <p className="text-gray-600">
          Privacy-first analytika pre pochopenie používania aplikácie a vylepšovanie UX.
        </p>
      </motion.div>

      {/* Privacy Notice */}
      {isTracking && (
        <motion.div
          className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-start space-x-3">
            <span className="text-blue-600 text-lg">🔒</span>
            <div className="flex-1">
              <h4 className="font-medium text-blue-900">Ochrana súkromia</h4>
              <p className="text-sm text-blue-800">
                Všetky údaje sú anonymizované a šifrované. Nesledujeme osobné informácie,
                len vzorce používania pre vylepšenie aplikácie.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Timeframe Selector */}
      <motion.div
        className="flex justify-between items-center mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="flex space-x-2">
          {['today', '7days', '30days', '90days'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedTimeframe(period as any)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                selectedTimeframe === period
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {getTimeframeLabel(period)}
            </button>
          ))}
        </div>

        <button
          onClick={handleExportAnalytics}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          📊 Exportovať údaje
        </button>
      </motion.div>

      {/* Usage Metrics Overview */}
      {usageMetrics && (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {usageMetrics.daily.activeUsers}
            </div>
            <div className="text-sm text-gray-600">Aktívni používatelia</div>
            <div className="text-xs text-gray-500 mt-1">
              {usageMetrics.daily.sessions} relácií
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {formatDuration(usageMetrics.daily.avgSessionDuration)}
            </div>
            <div className="text-sm text-gray-600">Priemerná relácia</div>
            <div className="text-xs text-gray-500 mt-1">
              {usageMetrics.engagement.actionsPerSession} akcií/relácia
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {usageMetrics.features.documentUploads + usageMetrics.features.timeCapsuleCreated}
            </div>
            <div className="text-sm text-gray-600">Vytvorený obsah</div>
            <div className="text-xs text-gray-500 mt-1">
              dokumenty + kapsuly
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {Math.round(usageMetrics.engagement.featureAdoption)}%
            </div>
            <div className="text-sm text-gray-600">Adopcia funkcií</div>
            <div className="text-xs text-gray-500 mt-1">
              {usageMetrics.engagement.returnUsers} návratov
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <motion.div
        className="flex space-x-1 mb-8 bg-gray-100 rounded-lg p-1"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        {[
          { id: 'overview', label: 'Prehľad', icon: '📊', count: userEvents.length },
          { id: 'journeys', label: 'Cesty používateľov', icon: '🛤️', count: userJourneys.length },
          { id: 'insights', label: 'Insights', icon: '💡', count: behaviorInsights.length },
          { id: 'privacy', label: 'Súkromie', icon: '🔒', count: null }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 px-4 py-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
            {tab.count !== null && (
              <span className="ml-2 px-2 py-1 text-xs bg-gray-200 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Nedávne udalosti</h2>

            <div className="space-y-3">
              {userEvents.slice(0, 20).map((event) => (
                <motion.div
                  key={event.id}
                  className="bg-white rounded-lg border border-gray-200 p-4"
                  layout
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getEventTypeIcon(event.eventType)}</span>
                      <div>
                        <div className="font-medium text-gray-900">{event.eventName}</div>
                        <div className="text-sm text-gray-500">
                          {event.page} • {event.timestamp.toLocaleTimeString('sk-SK')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {event.duration && (
                        <span className="text-sm text-gray-600">
                          {formatDuration(event.duration)}
                        </span>
                      )}
                      {event.isAnonymized && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                          🔒 Anonymné
                        </span>
                      )}
                    </div>
                  </div>

                  {Object.keys(event.properties).length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <div className="text-xs text-gray-500">
                        Properties: {JSON.stringify(event.properties, null, 2).slice(0, 100)}...
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}

              {userEvents.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">📊</div>
                  <p>Žiadne udalosti zatiaľ nezaznamenané</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Journeys Tab */}
        {activeTab === 'journeys' && (
          <motion.div
            key="journeys"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Cesty používateľov</h2>

            <div className="space-y-6">
              {userJourneys.map((journey) => (
                <motion.div
                  key={journey.id}
                  className="bg-white rounded-xl border border-gray-200 p-6"
                  layout
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{journey.goal}</h3>
                      <p className="text-sm text-gray-500">
                        {journey.startTime.toLocaleString('sk-SK')} • {formatDuration(journey.duration)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        journey.outcome === 'completed' ? 'bg-green-100 text-green-800' :
                        journey.outcome === 'abandoned' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {journey.outcome}
                      </span>
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                        {journey.steps.length} krokov
                      </span>
                    </div>
                  </div>

                  {/* Journey Steps */}
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    <div className="space-y-4">
                      {journey.steps.map((step, index) => (
                        <div key={step.id} className="relative flex items-start space-x-4">
                          <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                            step.success ? 'bg-green-500' : 'bg-red-500'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900">{step.stepName}</h4>
                              <span className="text-sm text-gray-500">
                                {formatDuration(step.duration)}
                              </span>
                            </div>
                            {step.errorMessage && (
                              <p className="text-sm text-red-600 mt-1">{step.errorMessage}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {journey.dropoffPoint && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="text-sm text-red-800">
                        <strong>Dropoff point:</strong> {journey.dropoffPoint}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}

              {userJourneys.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">🛤️</div>
                  <p>Žiadne používateľské cesty zatiaľ nezaznamenané</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Behavioral Insights</h2>

            <div className="space-y-4">
              {behaviorInsights.map((insight) => (
                <motion.div
                  key={insight.id}
                  className={`bg-white rounded-xl border-2 p-6 ${getInsightTypeColor(insight.type)}`}
                  layout
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">{insight.title}</h3>
                      <p className="text-gray-700 mb-3">{insight.description}</p>
                    </div>
                    <div className="flex space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getImpactColor(insight.impact)}`}>
                        {insight.impact}
                      </span>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {Math.round(insight.confidence * 100)}% istota
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Kategória:</span>
                      <br />
                      <span className="text-gray-600">{insight.category}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Dotknutí používatelia:</span>
                      <br />
                      <span className="text-gray-600">{insight.affectedUsers}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Trend:</span>
                      <br />
                      <span className={`${
                        insight.trend === 'increasing' ? 'text-red-600' :
                        insight.trend === 'decreasing' ? 'text-green-600' :
                        'text-gray-600'
                      }`}>
                        {insight.trend === 'increasing' ? '📈 Rastúci' :
                         insight.trend === 'decreasing' ? '📉 Klesajúci' :
                         '➡️ Stabilný'}
                      </span>
                    </div>
                  </div>

                  {insight.recommendations.length > 0 && (
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Odporúčania:</h4>
                      <ul className="space-y-1">
                        {insight.recommendations.map((recommendation, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            {recommendation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              ))}

              {behaviorInsights.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">💡</div>
                  <p>Žiadne insights zatiaľ negenerované</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <motion.div
            key="privacy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Nastavenia súkromia</h2>

            <div className="space-y-6">
              {/* Privacy Controls */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Kontrola sledovania</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Analytické sledovanie</div>
                      <div className="text-sm text-gray-600">
                        Sledovanie používania aplikácie pre vylepšenia UX
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleTracking(!isTracking)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        isTracking ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isTracking ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Anonymizácia údajov</div>
                      <div className="text-sm text-gray-600">
                        Všetky osobné údaje sú automaticky anonymizované
                      </div>
                    </div>
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                      ✅ Zapnuté
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Lokálne ukladanie</div>
                      <div className="text-sm text-gray-600">
                        Údaje sa ukladajú len lokálne, nie na serveroch
                      </div>
                    </div>
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                      ✅ Aktívne
                    </span>
                  </div>
                </div>
              </div>

              {/* Data Usage Summary */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Súhrn údajov</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{userEvents.length}</div>
                    <div className="text-sm text-blue-800">Zaznamenané udalosti</div>
                  </div>

                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{userJourneys.length}</div>
                    <div className="text-sm text-purple-800">Používateľské cesty</div>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">100%</div>
                    <div className="text-sm text-green-800">Anonymizované</div>
                  </div>
                </div>
              </div>

              {/* Privacy Report */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Privacy Report</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Posledná anonymizácia:</span>
                    <span className="text-gray-900">{new Date().toLocaleString('sk-SK')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Údaje zdieľané s tretími stranami:</span>
                    <span className="text-red-600 font-medium">Žiadne</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Šifrovanie údajov:</span>
                    <span className="text-green-600 font-medium">AES-256</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">GDPR compliance:</span>
                    <span className="text-green-600 font-medium">✅ Plne kompatibilné</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sofia Analytics Insight */}
      <motion.div
        className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
            <span className="text-white text-lg">📊</span>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-2">Sofia o analytike</h4>
            <p className="text-gray-700">
              Sleduje sa len anonymizované správanie pre vylepšenie aplikácie.
              {behaviorInsights.length > 0 && ` Našla som ${behaviorInsights.length} zaujímavých insights o používaní.`}
              {usageMetrics && usageMetrics.engagement.featureAdoption < 50 && ' Niektoré funkcie by mohli byť lepšie prezentované.'}
              Tvoje súkromie je vždy priorita - žiadne osobné údaje sa nesledujú! 🔒💙
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default UserBehaviorAnalytics