import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TimeCapsuleMessage, MediaItem, Recipient, DeliveryCondition } from '../components/timecapsule/TimeCapsuleCreator'

interface TimeCapsuleStore {
  // State
  messages: TimeCapsuleMessage[]
  currentMessage: TimeCapsuleMessage | null
  recipients: Recipient[]
  isCreating: boolean
  isUploading: boolean
  uploadProgress: number

  // Actions
  createMessage: (type?: TimeCapsuleMessage['type']) => void
  updateMessage: (updates: Partial<TimeCapsuleMessage>) => void
  saveMessage: (message: TimeCapsuleMessage) => Promise<void>
  deleteMessage: (messageId: string) => Promise<void>

  // Recipients
  addRecipient: (recipient: Omit<Recipient, 'id'>) => string
  updateRecipient: (recipientId: string, updates: Partial<Recipient>) => void
  removeRecipient: (recipientId: string) => void

  // Delivery Conditions
  addDeliveryCondition: (condition: Omit<DeliveryCondition, 'id'>) => string
  updateDeliveryCondition: (conditionId: string, updates: Partial<DeliveryCondition>) => void
  removeDeliveryCondition: (conditionId: string) => void

  // Media
  uploadMedia: (file: File, type: 'photo' | 'video' | 'audio') => Promise<MediaItem>
  removeMedia: (mediaId: string) => void

  // Delivery
  scheduleMessage: (messageId: string) => Promise<void>
  sendMessage: (messageId: string) => Promise<void>

  // Search and Filter
  searchMessages: (query: string) => TimeCapsuleMessage[]
  filterMessagesByStatus: (status: TimeCapsuleMessage['status']) => TimeCapsuleMessage[]

  // Analytics
  getMessageStats: () => {
    total: number
    drafts: number
    scheduled: number
    sent: number
    failed: number
  }
}

export const useTimeCapsuleStore = create<TimeCapsuleStore>()(
  persist(
    (set, get) => ({
      // Initial state
      messages: [],
      currentMessage: null,
      recipients: [],
      isCreating: false,
      isUploading: false,
      uploadProgress: 0,

      // Actions
      createMessage: (type = 'text') => {
        const newMessage: TimeCapsuleMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: '',
          type,
          content: {
            text: '',
            media: []
          },
          recipients: [],
          deliveryConditions: [],
          createdAt: new Date(),
          isPrivate: false,
          emotionalTone: 'loving',
          category: 'family',
          priority: 'medium',
          status: 'draft'
        }

        set({
          currentMessage: newMessage,
          isCreating: true
        })
      },

      updateMessage: (updates) => {
        set((state) => ({
          currentMessage: state.currentMessage ? {
            ...state.currentMessage,
            ...updates
          } : null
        }))
      },

      saveMessage: async (message) => {
        try {
          // TODO: Save to Supabase
          console.log('Saving message:', message)

          set((state) => {
            const existingIndex = state.messages.findIndex(m => m.id === message.id)
            const updatedMessages = existingIndex >= 0
              ? state.messages.map(m => m.id === message.id ? message : m)
              : [...state.messages, message]

            return {
              messages: updatedMessages,
              currentMessage: message
            }
          })

          // Auto-save to localStorage via persist middleware
        } catch (error) {
          console.error('Error saving message:', error)
          throw error
        }
      },

      deleteMessage: async (messageId) => {
        try {
          // TODO: Delete from Supabase
          console.log('Deleting message:', messageId)

          set((state) => ({
            messages: state.messages.filter(m => m.id !== messageId),
            currentMessage: state.currentMessage?.id === messageId ? null : state.currentMessage
          }))
        } catch (error) {
          console.error('Error deleting message:', error)
          throw error
        }
      },

      // Recipients
      addRecipient: (recipientData) => {
        const newRecipient: Recipient = {
          ...recipientData,
          id: `recipient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }

        set((state) => ({
          recipients: [...state.recipients, newRecipient],
          currentMessage: state.currentMessage ? {
            ...state.currentMessage,
            recipients: [...state.currentMessage.recipients, newRecipient]
          } : null
        }))

        return newRecipient.id
      },

      updateRecipient: (recipientId, updates) => {
        set((state) => ({
          recipients: state.recipients.map(r =>
            r.id === recipientId ? { ...r, ...updates } : r
          ),
          currentMessage: state.currentMessage ? {
            ...state.currentMessage,
            recipients: state.currentMessage.recipients.map(r =>
              r.id === recipientId ? { ...r, ...updates } : r
            )
          } : null
        }))
      },

      removeRecipient: (recipientId) => {
        set((state) => ({
          recipients: state.recipients.filter(r => r.id !== recipientId),
          currentMessage: state.currentMessage ? {
            ...state.currentMessage,
            recipients: state.currentMessage.recipients.filter(r => r.id !== recipientId)
          } : null
        }))
      },

      // Delivery Conditions
      addDeliveryCondition: (conditionData) => {
        const newCondition: DeliveryCondition = {
          ...conditionData,
          id: `condition-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }

        set((state) => ({
          currentMessage: state.currentMessage ? {
            ...state.currentMessage,
            deliveryConditions: [...state.currentMessage.deliveryConditions, newCondition]
          } : null
        }))

        return newCondition.id
      },

      updateDeliveryCondition: (conditionId, updates) => {
        set((state) => ({
          currentMessage: state.currentMessage ? {
            ...state.currentMessage,
            deliveryConditions: state.currentMessage.deliveryConditions.map(c =>
              c.id === conditionId ? { ...c, ...updates } : c
            )
          } : null
        }))
      },

      removeDeliveryCondition: (conditionId) => {
        set((state) => ({
          currentMessage: state.currentMessage ? {
            ...state.currentMessage,
            deliveryConditions: state.currentMessage.deliveryConditions.filter(c => c.id !== conditionId)
          } : null
        }))
      },

      // Media
      uploadMedia: async (file, type) => {
        set({ isUploading: true, uploadProgress: 0 })

        try {
          // Simulate upload progress
          const progressInterval = setInterval(() => {
            set((state) => ({
              uploadProgress: Math.min(state.uploadProgress + 10, 90)
            }))
          }, 100)

          // TODO: Upload to Supabase Storage
          // For now, create object URL for preview
          const url = URL.createObjectURL(file)

          // Generate thumbnail for videos
          let thumbnail: string | undefined
          if (type === 'video') {
            thumbnail = await generateVideoThumbnail(file)
          }

          // Get duration for audio/video
          let duration: number | undefined
          if (type === 'video' || type === 'audio') {
            duration = await getMediaDuration(file)
          }

          clearInterval(progressInterval)

          const mediaItem: MediaItem = {
            id: `media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type,
            url,
            thumbnail,
            duration,
            size: file.size,
            filename: file.name
          }

          set({
            isUploading: false,
            uploadProgress: 100
          })

          // Reset progress after short delay
          setTimeout(() => {
            set({ uploadProgress: 0 })
          }, 1000)

          return mediaItem
        } catch (error) {
          console.error('Media upload error:', error)
          set({ isUploading: false, uploadProgress: 0 })
          throw error
        }
      },

      removeMedia: (mediaId) => {
        set((state) => ({
          currentMessage: state.currentMessage ? {
            ...state.currentMessage,
            content: {
              ...state.currentMessage.content,
              media: state.currentMessage.content.media?.filter(m => m.id !== mediaId) || []
            }
          } : null
        }))
      },

      // Delivery
      scheduleMessage: async (messageId) => {
        try {
          // TODO: Schedule in Supabase with cron job
          console.log('Scheduling message:', messageId)

          set((state) => ({
            messages: state.messages.map(m =>
              m.id === messageId ? { ...m, status: 'scheduled' } : m
            )
          }))
        } catch (error) {
          console.error('Error scheduling message:', error)
          throw error
        }
      },

      sendMessage: async (messageId) => {
        try {
          // TODO: Send message via email/SMS/app notification
          console.log('Sending message:', messageId)

          set((state) => ({
            messages: state.messages.map(m =>
              m.id === messageId ? { ...m, status: 'sent' } : m
            )
          }))
        } catch (error) {
          console.error('Error sending message:', error)
          set((state) => ({
            messages: state.messages.map(m =>
              m.id === messageId ? { ...m, status: 'failed' } : m
            )
          }))
          throw error
        }
      },

      // Search and Filter
      searchMessages: (query) => {
        const { messages } = get()
        return messages.filter(message =>
          message.title.toLowerCase().includes(query.toLowerCase()) ||
          message.content.text?.toLowerCase().includes(query.toLowerCase()) ||
          message.recipients.some(r => r.name.toLowerCase().includes(query.toLowerCase()))
        )
      },

      filterMessagesByStatus: (status) => {
        return get().messages.filter(m => m.status === status)
      },

      // Analytics
      getMessageStats: () => {
        const { messages } = get()
        return {
          total: messages.length,
          drafts: messages.filter(m => m.status === 'draft').length,
          scheduled: messages.filter(m => m.status === 'scheduled').length,
          sent: messages.filter(m => m.status === 'sent').length,
          failed: messages.filter(m => m.status === 'failed').length
        }
      }
    }),
    {
      name: 'timecapsule-store',
      partialize: (state) => ({
        messages: state.messages,
        recipients: state.recipients
      })
    }
  )
)

// Helper functions
async function generateVideoThumbnail(file: File): Promise<string> {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      video.currentTime = 1 // Get frame at 1 second
    }

    video.onseeked = () => {
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        const thumbnail = canvas.toDataURL('image/jpeg', 0.8)
        resolve(thumbnail)
      }
    }

    video.src = URL.createObjectURL(file)
  })
}

async function getMediaDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const element = file.type.startsWith('video/')
      ? document.createElement('video')
      : document.createElement('audio')

    element.onloadedmetadata = () => {
      resolve(element.duration)
    }

    element.src = URL.createObjectURL(file)
  })
}