'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDeliveryStore } from '../../stores/useDeliveryStore'
import { useSofiaStore } from '../../stores/useSofiaStore'
import type { TimeCapsuleMessage, DeliveryCondition } from './TimeCapsuleCreator'

export interface DeliveryStatus {
  messageId: string
  status: 'pending' | 'triggered' | 'delivering' | 'delivered' | 'failed' | 'cancelled'
  triggerDate?: Date
  deliveryDate?: Date
  lastCheck: Date
  nextCheck: Date
  attemptCount: number
  errorMessage?: string
}

export interface TriggerEvent {
  id: string
  type: 'date' | 'event' | 'milestone' | 'emergency' | 'anniversary'
  name: string
  description: string
  isActive: boolean
  metadata: Record<string, any>
  lastTriggered?: Date
}

const DeliveryEngine: React.FC = () => {
  const {
    deliveryStatuses,
    triggerEvents,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    checkDeliveryConditions,
    processTriggeredMessage,
    updateDeliveryStatus,
    createTriggerEvent,
    getDeliveryStats
  } = useDeliveryStore()

  const { addMessage, isVisible } = useSofiaStore()
  const [selectedStatus, setSelectedStatus] = useState<DeliveryStatus | null>(null)
  const [showTriggerModal, setShowTriggerModal] = useState(false)

  const stats = getDeliveryStats()

  useEffect(() => {
    // Auto-start monitoring when component mounts
    if (!isMonitoring) {
      startMonitoring()
    }

    return () => {
      // Keep monitoring running in background
    }
  }, [])

  const handleManualTrigger = async (messageId: string) => {
    try {
      await processTriggeredMessage(messageId, 'manual_trigger')

      if (isVisible) {
        addMessage({
          id: `manual-trigger-${Date.now()}`,
          type: 'success',
          content: 'Časová kapsula bola manuálne spustená a doručuje sa príjemcom! 🚀',
          timestamp: new Date(),
          priority: 'high'
        })
      }
    } catch (error) {
      console.error('Manual trigger error:', error)
    }
  }

  const handleRetryDelivery = async (messageId: string) => {
    try {
      await updateDeliveryStatus(messageId, { status: 'pending', attemptCount: 0 })
      await processTriggeredMessage(messageId, 'retry')

      if (isVisible) {
        addMessage({
          id: `retry-delivery-${Date.now()}`,
          type: 'info',
          content: 'Skúšam znovu doručiť časovú kapsulu. Sleduj stav doručenia! 🔄',
          timestamp: new Date(),
          priority: 'medium'
        })
      }
    } catch (error) {
      console.error('Retry delivery error:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: '⏳',
      triggered: '🎯',
      delivering: '🚀',
      delivered: '✅',
      failed: '❌',
      cancelled: '🚫'
    }
    return icons[status as keyof typeof icons] || '❓'
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      triggered: 'text-blue-600 bg-blue-50 border-blue-200',
      delivering: 'text-purple-600 bg-purple-50 border-purple-200',
      delivered: 'text-green-600 bg-green-50 border-green-200',
      failed: 'text-red-600 bg-red-50 border-red-200',
      cancelled: 'text-gray-600 bg-gray-50 border-gray-200'
    }
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-50 border-gray-200'
  }

  const getTriggerTypeIcon = (type: string) => {
    const icons = {
      date: '📅',
      event: '🎉',
      milestone: '🏆',
      emergency: '🚨',
      anniversary: '💝'
    }
    return icons[type as keyof typeof icons] || '📋'
  }

  return (
    <div className="delivery-engine max-w-6xl mx-auto p-6">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Doručovací systém</h1>
          <div className="flex items-center space-x-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isMonitoring ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {isMonitoring ? '🟢 Monitoruje' : '🔴 Zastavené'}
            </div>
            <button
              onClick={isMonitoring ? stopMonitoring : startMonitoring}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isMonitoring
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isMonitoring ? 'Zastaviť' : 'Spustiť'}
            </button>
          </div>
        </div>
        <p className="text-gray-600">
          Sledovanie a doručovanie časových kapsúl na základe definovaných podmienok.
        </p>
      </motion.div>

      {/* Statistics */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
            <div className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
          </div>
        ))}
      </motion.div>

      {/* Delivery Statuses */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Aktívne doručenia</h2>
          <button
            onClick={checkDeliveryConditions}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Skontrolovať podmienky
          </button>
        </div>

        <div className="space-y-4">
          {deliveryStatuses.map((status) => (
            <motion.div
              key={status.messageId}
              className="bg-white rounded-xl border border-gray-200 p-6"
              layout
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-lg">{getStatusIcon(status.status)}</span>
                    <h3 className="font-semibold text-gray-900">Správa ID: {status.messageId}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(status.status)}`}>
                      {status.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Posledná kontrola:</span>
                      <br />
                      {status.lastCheck.toLocaleString('sk-SK')}
                    </div>
                    <div>
                      <span className="font-medium">Ďalšia kontrola:</span>
                      <br />
                      {status.nextCheck.toLocaleString('sk-SK')}
                    </div>
                    <div>
                      <span className="font-medium">Pokusy:</span>
                      <br />
                      {status.attemptCount}/3
                    </div>
                  </div>

                  {status.triggerDate && (
                    <div className="mt-3 text-sm text-gray-600">
                      <span className="font-medium">Spustené:</span> {status.triggerDate.toLocaleString('sk-SK')}
                    </div>
                  )}

                  {status.deliveryDate && (
                    <div className="mt-3 text-sm text-green-600">
                      <span className="font-medium">Doručené:</span> {status.deliveryDate.toLocaleString('sk-SK')}
                    </div>
                  )}

                  {status.errorMessage && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">{status.errorMessage}</p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  {status.status === 'pending' && (
                    <button
                      onClick={() => handleManualTrigger(status.messageId)}
                      className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                    >
                      Spustiť teraz
                    </button>
                  )}

                  {status.status === 'failed' && (
                    <button
                      onClick={() => handleRetryDelivery(status.messageId)}
                      className="px-3 py-1 text-sm bg-orange-50 text-orange-700 rounded hover:bg-orange-100 transition-colors"
                    >
                      Skúsiť znovu
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedStatus(status)}
                    className="px-3 py-1 text-sm bg-gray-50 text-gray-700 rounded hover:bg-gray-100 transition-colors"
                  >
                    Detaily
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {deliveryStatuses.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">📭</div>
              <p>Momentálne nie sú žiadne aktívne doručenia</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Trigger Events */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Spúšťacie udalosti</h2>
          <button
            onClick={() => setShowTriggerModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Pridať udalosť
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {triggerEvents.map((event) => (
            <motion.div
              key={event.id}
              className={`p-4 rounded-xl border-2 ${
                event.isActive ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'
              }`}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getTriggerTypeIcon(event.type)}</span>
                  <h3 className="font-semibold text-gray-900">{event.name}</h3>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  event.isActive ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              </div>

              <p className="text-sm text-gray-600 mb-3">{event.description}</p>

              <div className="text-xs text-gray-500">
                Typ: {event.type}
                {event.lastTriggered && (
                  <>
                    <br />
                    Posledne: {event.lastTriggered.toLocaleDateString('sk-SK')}
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Status Detail Modal */}
      <AnimatePresence>
        {selectedStatus && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedStatus(null)}
          >
            <motion.div
              className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-auto p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Detaily doručenia
                </h3>
                <button
                  onClick={() => setSelectedStatus(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">ID správy</label>
                    <p className="text-gray-900">{selectedStatus.messageId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Stav</label>
                    <div className="flex items-center space-x-2">
                      <span>{getStatusIcon(selectedStatus.status)}</span>
                      <span className="capitalize">{selectedStatus.status}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Posledná kontrola</label>
                    <p className="text-gray-900">{selectedStatus.lastCheck.toLocaleString('sk-SK')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Ďalšia kontrola</label>
                    <p className="text-gray-900">{selectedStatus.nextCheck.toLocaleString('sk-SK')}</p>
                  </div>
                </div>

                {selectedStatus.triggerDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Dátum spustenia</label>
                    <p className="text-gray-900">{selectedStatus.triggerDate.toLocaleString('sk-SK')}</p>
                  </div>
                )}

                {selectedStatus.deliveryDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Dátum doručenia</label>
                    <p className="text-green-600">{selectedStatus.deliveryDate.toLocaleString('sk-SK')}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700">Počet pokusov</label>
                  <p className="text-gray-900">{selectedStatus.attemptCount} / 3</p>
                </div>

                {selectedStatus.errorMessage && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Chybová správa</label>
                    <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800">{selectedStatus.errorMessage}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedStatus(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Zavrieť
                </button>
                {selectedStatus.status === 'failed' && (
                  <button
                    onClick={() => {
                      handleRetryDelivery(selectedStatus.messageId)
                      setSelectedStatus(null)
                    }}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Skúsiť znovu
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sofia Insight */}
      {deliveryStatuses.length > 0 && (
        <motion.div
          className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">🔮</span>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-2">Sofia pozoruje</h4>
              <p className="text-gray-700">
                Momentálne monitorujem {stats.pending} časových kapsúl. Systém kontroluje podmienky každých 15 minút
                a automaticky doručuje správy, keď sa splnia zadané kritériá.
                {stats.failed > 0 && ` Mám ${stats.failed} neúspešných doručení - pozri si ich a skús znovu.`}
                Všetko funguje presne tak, ako má! 💫
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default DeliveryEngine