import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DeliveryStatus, TriggerEvent } from '../components/timecapsule/DeliveryEngine'
import type { TimeCapsuleMessage, DeliveryCondition } from '../components/timecapsule/TimeCapsuleCreator'

interface DeliveryStore {
  // State
  deliveryStatuses: DeliveryStatus[]
  triggerEvents: TriggerEvent[]
  isMonitoring: boolean
  monitoringInterval: NodeJS.Timeout | null
  lastCheck: Date | null

  // Actions
  startMonitoring: () => void
  stopMonitoring: () => void
  checkDeliveryConditions: () => Promise<void>
  processTriggeredMessage: (messageId: string, triggerReason: string) => Promise<void>
  updateDeliveryStatus: (messageId: string, updates: Partial<DeliveryStatus>) => Promise<void>

  // Trigger Events
  createTriggerEvent: (event: Omit<TriggerEvent, 'id'>) => string
  updateTriggerEvent: (eventId: string, updates: Partial<TriggerEvent>) => void
  deleteTriggerEvent: (eventId: string) => void
  triggerEvent: (eventId: string) => Promise<void>

  // Analytics
  getDeliveryStats: () => {
    pending: number
    triggered: number
    delivering: number
    delivered: number
    failed: number
  }

  // Delivery Methods
  sendEmail: (recipients: string[], subject: string, content: string, attachments?: any[]) => Promise<boolean>
  sendSMS: (recipients: string[], message: string) => Promise<boolean>
  sendAppNotification: (userIds: string[], title: string, content: string) => Promise<boolean>
  scheduleDelivery: (messageId: string, deliveryDate: Date) => Promise<void>
}

// Pre-defined trigger events
const defaultTriggerEvents: TriggerEvent[] = [
  {
    id: 'birthday-reminder',
    type: 'anniversary',
    name: 'Narodeniny',
    description: 'Spúšťa sa v deň narodenín príjemcu',
    isActive: true,
    metadata: {
      recurring: true,
      daysBefore: 0
    }
  },
  {
    id: 'wedding-anniversary',
    type: 'anniversary',
    name: 'Výročie svadby',
    description: 'Spúšťa sa vo výročie svadby',
    isActive: true,
    metadata: {
      recurring: true,
      daysBefore: 0
    }
  },
  {
    id: 'graduation-day',
    type: 'milestone',
    name: 'Promócie',
    description: 'Spúšťa sa v deň promócií',
    isActive: true,
    metadata: {
      recurring: false
    }
  },
  {
    id: 'new-year',
    type: 'event',
    name: 'Nový rok',
    description: 'Spúšťa sa 1. januára každý rok',
    isActive: true,
    metadata: {
      recurring: true,
      month: 1,
      day: 1
    }
  },
  {
    id: 'emergency-contact',
    type: 'emergency',
    name: 'Núdzový kontakt',
    description: 'Spúšťa sa pri aktivácii núdzového protokolu',
    isActive: true,
    metadata: {
      priority: 'urgent',
      immediateDelivery: true
    }
  }
]

export const useDeliveryStore = create<DeliveryStore>()(
  persist(
    (set, get) => ({
      // Initial state
      deliveryStatuses: [],
      triggerEvents: defaultTriggerEvents,
      isMonitoring: false,
      monitoringInterval: null,
      lastCheck: null,

      // Actions
      startMonitoring: () => {
        const { stopMonitoring } = get()
        stopMonitoring() // Clear any existing interval

        const interval = setInterval(async () => {
          await get().checkDeliveryConditions()
        }, 15 * 60 * 1000) // Check every 15 minutes

        set({
          isMonitoring: true,
          monitoringInterval: interval
        })

        // Immediate check
        get().checkDeliveryConditions()
      },

      stopMonitoring: () => {
        const { monitoringInterval } = get()
        if (monitoringInterval) {
          clearInterval(monitoringInterval)
        }

        set({
          isMonitoring: false,
          monitoringInterval: null
        })
      },

      checkDeliveryConditions: async () => {
        const { deliveryStatuses, triggerEvents } = get()
        const now = new Date()

        set({ lastCheck: now })

        // Check each pending delivery
        for (const status of deliveryStatuses.filter(s => s.status === 'pending')) {
          try {
            // Get the message and its delivery conditions
            // TODO: Fetch from TimeCapsuleStore
            const shouldTrigger = await evaluateDeliveryConditions(status.messageId, triggerEvents, now)

            if (shouldTrigger.triggered) {
              await get().processTriggeredMessage(status.messageId, shouldTrigger.reason || 'condition_met')
            } else {
              // Update next check time
              const nextCheck = new Date(now.getTime() + 15 * 60 * 1000) // Next check in 15 minutes
              await get().updateDeliveryStatus(status.messageId, {
                lastCheck: now,
                nextCheck
              })
            }
          } catch (error) {
            console.error(`Error checking delivery condition for message ${status.messageId}:`, error)
            await get().updateDeliveryStatus(status.messageId, {
              status: 'failed',
              errorMessage: `Chyba pri kontrole podmienok: ${error.message}`,
              lastCheck: now
            })
          }
        }
      },

      processTriggeredMessage: async (messageId, triggerReason) => {
        try {
          // Update status to triggered
          await get().updateDeliveryStatus(messageId, {
            status: 'triggered',
            triggerDate: new Date()
          })

          // Start delivery process
          await get().updateDeliveryStatus(messageId, {
            status: 'delivering'
          })

          // TODO: Get message details from TimeCapsuleStore
          // For now, simulate delivery process
          const success = await simulateDelivery(messageId)

          if (success) {
            await get().updateDeliveryStatus(messageId, {
              status: 'delivered',
              deliveryDate: new Date()
            })
          } else {
            await get().updateDeliveryStatus(messageId, {
              status: 'failed',
              errorMessage: 'Doručenie sa nepodarilo - skús znovu neskôr',
              attemptCount: (get().deliveryStatuses.find(s => s.messageId === messageId)?.attemptCount || 0) + 1
            })
          }
        } catch (error) {
          console.error('Error processing triggered message:', error)
          await get().updateDeliveryStatus(messageId, {
            status: 'failed',
            errorMessage: `Chyba pri doručovaní: ${error.message}`,
            attemptCount: (get().deliveryStatuses.find(s => s.messageId === messageId)?.attemptCount || 0) + 1
          })
        }
      },

      updateDeliveryStatus: async (messageId, updates) => {
        set((state) => ({
          deliveryStatuses: state.deliveryStatuses.map(status =>
            status.messageId === messageId
              ? { ...status, ...updates }
              : status
          )
        }))
      },

      // Trigger Events
      createTriggerEvent: (eventData) => {
        const newEvent: TriggerEvent = {
          ...eventData,
          id: `trigger-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }

        set((state) => ({
          triggerEvents: [...state.triggerEvents, newEvent]
        }))

        return newEvent.id
      },

      updateTriggerEvent: (eventId, updates) => {
        set((state) => ({
          triggerEvents: state.triggerEvents.map(event =>
            event.id === eventId ? { ...event, ...updates } : event
          )
        }))
      },

      deleteTriggerEvent: (eventId) => {
        set((state) => ({
          triggerEvents: state.triggerEvents.filter(event => event.id !== eventId)
        }))
      },

      triggerEvent: async (eventId) => {
        const { triggerEvents, deliveryStatuses } = get()
        const event = triggerEvents.find(e => e.id === eventId)
        if (!event) return

        // Update event last triggered
        get().updateTriggerEvent(eventId, {
          lastTriggered: new Date()
        })

        // Find all messages waiting for this event
        // TODO: This would require connecting with TimeCapsuleStore to find messages with matching conditions
        console.log(`Triggering event: ${event.name}`)
      },

      // Analytics
      getDeliveryStats: () => {
        const { deliveryStatuses } = get()
        return {
          pending: deliveryStatuses.filter(s => s.status === 'pending').length,
          triggered: deliveryStatuses.filter(s => s.status === 'triggered').length,
          delivering: deliveryStatuses.filter(s => s.status === 'delivering').length,
          delivered: deliveryStatuses.filter(s => s.status === 'delivered').length,
          failed: deliveryStatuses.filter(s => s.status === 'failed').length
        }
      },

      // Delivery Methods
      sendEmail: async (recipients, subject, content, attachments = []) => {
        try {
          // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
          console.log('Sending email:', { recipients, subject, content, attachments })

          // Simulate email sending
          await new Promise(resolve => setTimeout(resolve, 1000))

          return Math.random() > 0.1 // 90% success rate
        } catch (error) {
          console.error('Email sending error:', error)
          return false
        }
      },

      sendSMS: async (recipients, message) => {
        try {
          // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
          console.log('Sending SMS:', { recipients, message })

          // Simulate SMS sending
          await new Promise(resolve => setTimeout(resolve, 500))

          return Math.random() > 0.05 // 95% success rate
        } catch (error) {
          console.error('SMS sending error:', error)
          return false
        }
      },

      sendAppNotification: async (userIds, title, content) => {
        try {
          // TODO: Integrate with push notification service (Firebase, OneSignal, etc.)
          console.log('Sending app notification:', { userIds, title, content })

          // Simulate notification sending
          await new Promise(resolve => setTimeout(resolve, 300))

          return Math.random() > 0.02 // 98% success rate
        } catch (error) {
          console.error('Push notification error:', error)
          return false
        }
      },

      scheduleDelivery: async (messageId, deliveryDate) => {
        const now = new Date()
        const nextCheck = new Date(Math.min(deliveryDate.getTime(), now.getTime() + 15 * 60 * 1000))

        const newStatus: DeliveryStatus = {
          messageId,
          status: 'pending',
          lastCheck: now,
          nextCheck,
          attemptCount: 0
        }

        set((state) => ({
          deliveryStatuses: [...state.deliveryStatuses.filter(s => s.messageId !== messageId), newStatus]
        }))
      }
    }),
    {
      name: 'delivery-store',
      partialize: (state) => ({
        deliveryStatuses: state.deliveryStatuses,
        triggerEvents: state.triggerEvents,
        lastCheck: state.lastCheck
      })
    }
  )
)

// Helper functions
async function evaluateDeliveryConditions(
  messageId: string,
  triggerEvents: TriggerEvent[],
  currentDate: Date
): Promise<{ triggered: boolean; reason?: string }> {
  // TODO: Get message delivery conditions from TimeCapsuleStore
  // For now, simulate condition evaluation

  // Example conditions:
  // 1. Specific date/time
  // 2. Anniversary dates
  // 3. Milestone events
  // 4. Emergency triggers

  // Simulate random triggering for demo
  if (Math.random() < 0.001) { // Very low chance for demo
    return {
      triggered: true,
      reason: 'test_trigger'
    }
  }

  return { triggered: false }
}

async function simulateDelivery(messageId: string): Promise<boolean> {
  // Simulate delivery process with random success/failure
  await new Promise(resolve => setTimeout(resolve, 2000))

  return Math.random() > 0.1 // 90% success rate
}

// Condition evaluators for different trigger types
export const conditionEvaluators = {
  date: (condition: DeliveryCondition, currentDate: Date): boolean => {
    if (!condition.metadata?.targetDate) return false
    const targetDate = new Date(condition.metadata.targetDate)
    return currentDate >= targetDate
  },

  anniversary: (condition: DeliveryCondition, currentDate: Date): boolean => {
    if (!condition.metadata?.originalDate) return false
    const originalDate = new Date(condition.metadata.originalDate)

    // Check if today matches the anniversary (month and day)
    return (
      currentDate.getMonth() === originalDate.getMonth() &&
      currentDate.getDate() === originalDate.getDate()
    )
  },

  milestone: (condition: DeliveryCondition, currentDate: Date): boolean => {
    // TODO: Integrate with user progress/milestone tracking
    return condition.metadata?.achieved === true
  },

  emergency: (condition: DeliveryCondition, currentDate: Date): boolean => {
    // TODO: Integrate with emergency detection system
    return condition.metadata?.emergencyTriggered === true
  },

  event: (condition: DeliveryCondition, currentDate: Date): boolean => {
    // TODO: Integrate with calendar events or external event systems
    return condition.metadata?.eventOccurred === true
  }
}