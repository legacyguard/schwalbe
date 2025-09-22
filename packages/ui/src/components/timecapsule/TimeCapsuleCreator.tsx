'use client'

import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTimeCapsuleStore } from '../../stores/useTimeCapsuleStore'
import { useSofiaStore } from '../../stores/useSofiaStore'

export interface TimeCapsuleMessage {
  id: string
  title: string
  type: 'text' | 'photo' | 'video' | 'audio' | 'mixed'
  content: {
    text?: string
    media?: MediaItem[]
    voiceNote?: string
  }
  recipients: Recipient[]
  deliveryConditions: DeliveryCondition[]
  createdAt: Date
  scheduledFor?: Date
  isPrivate: boolean
  emotionalTone: 'loving' | 'encouraging' | 'celebratory' | 'reflective' | 'instructional'
  category: 'family' | 'children' | 'spouse' | 'friends' | 'professional' | 'personal'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'draft' | 'scheduled' | 'sent' | 'failed'
}

export interface MediaItem {
  id: string
  type: 'photo' | 'video' | 'audio'
  url: string
  thumbnail?: string
  duration?: number
  size: number
  filename: string
  caption?: string
}

export interface Recipient {
  id: string
  name: string
  email: string
  phone?: string
  relationship: string
  preferredDelivery: 'email' | 'sms' | 'app' | 'postal'
  backupContact?: string
}

export interface DeliveryCondition {
  id: string
  type: 'date' | 'event' | 'milestone' | 'emergency' | 'anniversary'
  trigger: string
  description: string
  isActive: boolean
  metadata?: Record<string, any>
}

const TimeCapsuleCreator: React.FC = () => {
  const {
    currentMessage,
    isCreating,
    createMessage,
    updateMessage,
    saveMessage,
    addRecipient,
    addDeliveryCondition,
    uploadMedia
  } = useTimeCapsuleStore()

  const { addMessage: addSofiaMessage, isVisible, getSuggestion } = useSofiaStore()

  const [activeStep, setActiveStep] = useState<'content' | 'recipients' | 'delivery' | 'review'>('content')
  const [showGuidance, setShowGuidance] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize new message
  const initializeMessage = () => {
    const newMessage: Partial<TimeCapsuleMessage> = {
      title: '',
      type: 'text',
      content: { text: '' },
      recipients: [],
      deliveryConditions: [],
      createdAt: new Date(),
      isPrivate: false,
      emotionalTone: 'loving',
      category: 'family',
      priority: 'medium',
      status: 'draft'
    }
    updateMessage(newMessage)
  }

  React.useEffect(() => {
    if (!currentMessage) {
      initializeMessage()
    }
  }, [])

  React.useEffect(() => {
    if (activeStep === 'content' && showGuidance && isVisible) {
      getSofiaGuidanceForStep('content')
    }
  }, [activeStep, showGuidance])

  const getSofiaGuidanceForStep = async (step: string) => {
    if (!isVisible) return

    const guidance = await getSuggestion('timecapsule_guidance', {
      step,
      messageType: currentMessage?.type,
      emotionalTone: currentMessage?.emotionalTone,
      category: currentMessage?.category
    })

    if (guidance) {
      addSofiaMessage({
        id: `timecapsule-guidance-${Date.now()}`,
        type: 'suggestion',
        content: guidance,
        timestamp: new Date(),
        priority: 'medium'
      })
    }
  }

  const handleContentChange = (field: string, value: any) => {
    if (!currentMessage) return

    updateMessage({
      ...currentMessage,
      content: {
        ...currentMessage.content,
        [field]: value
      }
    })
  }

  const handleFileUpload = async (files: FileList, type: 'photo' | 'video') => {
    if (!files.length || !currentMessage) return

    try {
      const uploadPromises = Array.from(files).map(file => uploadMedia(file, type))
      const mediaItems = await Promise.all(uploadPromises)

      const updatedMedia = [
        ...(currentMessage.content?.media || []),
        ...mediaItems
      ]

      updateMessage({
        ...currentMessage,
        content: {
          ...currentMessage.content,
          media: updatedMedia
        },
        type: updatedMedia.length > 0 ? 'mixed' : currentMessage.type
      })

      if (isVisible) {
        addSofiaMessage({
          id: `media-upload-${Date.now()}`,
          type: 'success',
          content: `Úžasne! Pridala som ${mediaItems.length} ${type === 'photo' ? 'fotografií' : 'videí'} do tvojej časovej kapsuly. Tie spomienky budú pre príjemcov veľmi cenné! 📸✨`,
          timestamp: new Date(),
          priority: 'medium'
        })
      }
    } catch (error) {
      console.error('Media upload error:', error)
    }
  }

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)

      const chunks: Blob[] = []
      mediaRecorderRef.current.ondataavailable = (event) => {
        chunks.push(event.data)
      }

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' })
        const audioFile = new File([audioBlob], `voice-note-${Date.now()}.wav`, { type: 'audio/wav' })

        try {
          const mediaItem = await uploadMedia(audioFile, 'audio')

          updateMessage({
            ...currentMessage!,
            content: {
              ...currentMessage!.content,
              media: [...(currentMessage!.content?.media || []), mediaItem]
            },
            type: 'mixed'
          })

          if (isVisible) {
            addSofiaMessage({
              id: `voice-recorded-${Date.now()}`,
              type: 'success',
              content: 'Krásne! Hlasová správa je pridaná do kapsuly. Tvoj hlas bude pre príjemcov najcennejším darom. 🎤💙',
              timestamp: new Date(),
              priority: 'medium'
            })
          }
        } catch (error) {
          console.error('Voice recording upload error:', error)
        }
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      setRecordingDuration(0)

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1)
      }, 1000)

    } catch (error) {
      console.error('Voice recording error:', error)
    }
  }

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream?.getTracks().forEach(track => track.stop())
      setIsRecording(false)

      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
        recordingTimerRef.current = null
      }
    }
  }

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleNext = () => {
    const steps = ['content', 'recipients', 'delivery', 'review']
    const currentIndex = steps.indexOf(activeStep)
    if (currentIndex < steps.length - 1) {
      setActiveStep(steps[currentIndex + 1] as any)
    }
  }

  const handlePrevious = () => {
    const steps = ['content', 'recipients', 'delivery', 'review']
    const currentIndex = steps.indexOf(activeStep)
    if (currentIndex > 0) {
      setActiveStep(steps[currentIndex - 1] as any)
    }
  }

  const getStepIcon = (step: string) => {
    const icons = {
      content: '✍️',
      recipients: '👥',
      delivery: '📅',
      review: '👁️'
    }
    return icons[step as keyof typeof icons] || '📝'
  }

  const getEmotionalToneIcon = (tone: string) => {
    const icons = {
      loving: '💕',
      encouraging: '💪',
      celebratory: '🎉',
      reflective: '🤔',
      instructional: '📚'
    }
    return icons[tone as keyof typeof icons] || '💝'
  }

  if (!currentMessage) {
    return (
      <div className="timecapsule-creator p-6">
        <div className="text-center py-8">
          <motion.div
            className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-gray-600">Pripravujem tvorbu časovej kapsuly...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="timecapsule-creator max-w-4xl mx-auto p-6">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Vytvor časovú kapsulu</h1>
        <p className="text-gray-600">
          Vytvor významnú správu, ktorá bude doručená v správnom čase správnym ľuďom.
        </p>
      </motion.div>

      {/* Progress Steps */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="flex items-center justify-center space-x-8">
          {['content', 'recipients', 'delivery', 'review'].map((step, index) => {
            const isActive = step === activeStep
            const isCompleted = ['content', 'recipients', 'delivery', 'review'].indexOf(activeStep) > index

            return (
              <div key={step} className="flex items-center">
                <motion.div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold transition-all ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-lg'
                      : isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isCompleted ? '✓' : getStepIcon(step)}
                </motion.div>
                <span className={`ml-2 font-medium ${
                  isActive ? 'text-purple-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {step === 'content' && 'Obsah'}
                  {step === 'recipients' && 'Príjemcovia'}
                  {step === 'delivery' && 'Doručenie'}
                  {step === 'review' && 'Kontrola'}
                </span>
                {index < 3 && (
                  <div className={`w-8 h-0.5 mx-4 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Content Step */}
      <AnimatePresence mode="wait">
        {activeStep === 'content' && (
          <motion.div
            key="content"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Message Title */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Názov správy</h3>
              <input
                type="text"
                value={currentMessage.title}
                onChange={(e) => updateMessage({ ...currentMessage, title: e.target.value })}
                placeholder="Názov tvojej časovej kapsuly..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Message Type and Tone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Typ správy</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { type: 'text', icon: '📝', label: 'Text' },
                    { type: 'photo', icon: '📸', label: 'Foto' },
                    { type: 'video', icon: '🎥', label: 'Video' },
                    { type: 'mixed', icon: '🎭', label: 'Zmiešané' }
                  ].map((option) => (
                    <button
                      key={option.type}
                      onClick={() => updateMessage({ ...currentMessage, type: option.type as any })}
                      className={`p-3 rounded-lg border-2 transition-all text-center ${
                        currentMessage.type === option.type
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{option.icon}</div>
                      <div className="text-sm font-medium">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Emocionálny tón</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { tone: 'loving', icon: '💕', label: 'Láskavý' },
                    { tone: 'encouraging', icon: '💪', label: 'Povzbudzujúci' },
                    { tone: 'celebratory', icon: '🎉', label: 'Oslavný' },
                    { tone: 'reflective', icon: '🤔', label: 'Zamyslený' }
                  ].map((option) => (
                    <button
                      key={option.tone}
                      onClick={() => updateMessage({ ...currentMessage, emotionalTone: option.tone as any })}
                      className={`p-3 rounded-lg border-2 transition-all text-center ${
                        currentMessage.emotionalTone === option.tone
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{option.icon}</div>
                      <div className="text-sm font-medium">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Message Content */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Obsah správy</h3>

              {/* Text Area */}
              <div className="mb-6">
                <textarea
                  value={currentMessage.content?.text || ''}
                  onChange={(e) => handleContentChange('text', e.target.value)}
                  placeholder="Napíš svoju správu pre budúcnosť..."
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Media Upload */}
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  {/* Photo Upload */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <span>📸</span>
                    <span>Pridať fotky</span>
                  </button>

                  {/* Video Upload */}
                  <button
                    onClick={() => videoInputRef.current?.click()}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <span>🎥</span>
                    <span>Pridať video</span>
                  </button>

                  {/* Voice Recording */}
                  <button
                    onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      isRecording
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                    }`}
                  >
                    <span>{isRecording ? '⏹️' : '🎤'}</span>
                    <span>{isRecording ? `Zastaviť (${formatRecordingTime(recordingDuration)})` : 'Nahraj hlas'}</span>
                  </button>
                </div>

                {/* Media Preview */}
                {currentMessage.content?.media && currentMessage.content.media.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {currentMessage.content.media.map((media) => (
                      <div key={media.id} className="relative group">
                        {media.type === 'photo' && (
                          <img
                            src={media.url}
                            alt={media.filename}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                        )}
                        {media.type === 'video' && (
                          <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">🎥</span>
                          </div>
                        )}
                        {media.type === 'audio' && (
                          <div className="w-full h-24 bg-purple-100 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">🎤</span>
                          </div>
                        )}
                        <button
                          onClick={() => {
                            const updatedMedia = currentMessage.content?.media?.filter(m => m.id !== media.id) || []
                            updateMessage({
                              ...currentMessage,
                              content: {
                                ...currentMessage.content,
                                media: updatedMedia
                              }
                            })
                          }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Hidden File Inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'photo')}
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'video')}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <motion.div
        className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <button
          onClick={handlePrevious}
          disabled={activeStep === 'content'}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ← Späť
        </button>

        <div className="flex space-x-3">
          <button
            onClick={() => saveMessage(currentMessage)}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Uložiť koncept
          </button>

          <button
            onClick={handleNext}
            disabled={activeStep === 'review'}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Pokračovať →
          </button>
        </div>
      </motion.div>

      {/* Sofia Guidance */}
      {showGuidance && (
        <motion.div
          className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">✨</span>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-2">Sofia radí</h4>
              <p className="text-gray-700">
                Časové kapsuly sú jedným z najvzácnejších darov, ktoré môžeš zanechať.
                Píš z lásky a úprimnosti - každé slovo bude pre príjemcov drahocenné.
                Pridaj osobné spomienky, fotky a možno aj hlasovú správu. Tvoj hlas bude
                najkrajším darom pre budúcnosť! 💝
              </p>
              <button
                onClick={() => setShowGuidance(false)}
                className="mt-3 text-sm text-purple-600 hover:text-purple-700"
              >
                Skryť rady
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default TimeCapsuleCreator