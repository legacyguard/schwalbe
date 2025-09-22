'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import {
  MessageCircle,
  X,
  Send,
  Mic,
  MicOff,
  ChevronDown,
  ChevronUp,
  Minimize2,
  Maximize2
} from 'lucide-react'
import { EnhancedFirefly } from '../animations/EnhancedFirefly'
import { TouchFriendlyButton } from './MobileFirstLayout'

interface MobileSofiaProps {
  isVisible?: boolean
  onToggle?: () => void
  onSendMessage?: (message: string) => void
  onVoiceInput?: (isRecording: boolean) => void
  messages?: Array<{
    id: string
    type: 'user' | 'sofia'
    content: string
    timestamp: Date
    emotion?: 'happy' | 'encouraging' | 'celebrating' | 'concerned'
  }>
  isTyping?: boolean
  className?: string
}

type MobileSofiaState = 'minimized' | 'floating' | 'chat' | 'fullscreen'

export function MobileSofia({
  isVisible = true,
  onToggle,
  onSendMessage,
  onVoiceInput,
  messages = [],
  isTyping = false,
  className = ''
}: MobileSofiaProps) {
  const [state, setState] = useState<MobileSofiaState>('floating')
  const [inputMessage, setInputMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [position, setPosition] = useState({ x: 20, y: 100 })
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0, top: 0, bottom: 0 })

  const containerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Update drag constraints based on screen size
  useEffect(() => {
    const updateConstraints = () => {
      const screenWidth = window.innerWidth
      const screenHeight = window.innerHeight
      const elementWidth = 60 // Sofia floating size
      const elementHeight = 60

      setDragConstraints({
        left: 0,
        right: screenWidth - elementWidth,
        top: 0,
        bottom: screenHeight - elementHeight - 100 // Account for bottom nav
      })
    }

    updateConstraints()
    window.addEventListener('resize', updateConstraints)
    return () => window.removeEventListener('resize', updateConstraints)
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && (state === 'chat' || state === 'fullscreen')) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, state])

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      onSendMessage?.(inputMessage.trim())
      setInputMessage('')
    }
  }

  const handleVoiceToggle = () => {
    const newRecording = !isRecording
    setIsRecording(newRecording)
    onVoiceInput?.(newRecording)
  }

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { point } = info
    setPosition({ x: point.x - 30, y: point.y - 30 }) // Center the element
  }

  // Mobile-specific gesture to expand Sofia
  const handleTap = () => {
    if (state === 'floating') {
      setState('chat')
    }
  }

  const handleDoubleTap = () => {
    if (state === 'chat') {
      setState('fullscreen')
    } else if (state === 'fullscreen') {
      setState('chat')
    }
  }

  if (!isVisible) return null

  return (
    <div className={`fixed inset-0 pointer-events-none z-50 ${className}`}>
      {/* Floating Sofia Button */}
      <AnimatePresence>
        {state === 'floating' && (
          <motion.div
            ref={containerRef}
            className="absolute pointer-events-auto"
            drag
            dragConstraints={dragConstraints}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            initial={{ x: position.x, y: position.y }}
            animate={{ x: position.x, y: position.y }}
            exit={{ scale: 0, opacity: 0 }}
            whileDrag={{ scale: 1.1 }}
            style={{ touchAction: 'none' }}
          >
            <motion.div
              className="relative"
              onTap={handleTap}
              whileTap={{ scale: 0.95 }}
            >
              {/* Sofia Firefly */}
              <div className="w-16 h-16 flex items-center justify-center">
                <EnhancedFirefly
                  isVisible={true}
                  size="large"
                  celebrateEvent={false}
                  followMouse={false}
                />
              </div>

              {/* Message indicator */}
              {messages.length > 0 && (
                <motion.div
                  className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                >
                  {messages.filter(m => m.type === 'sofia').length}
                </motion.div>
              )}

              {/* Touch hint for new users */}
              <motion.div
                className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2, delay: 1, repeat: 2 }}
              >
                Ťuknite pre rozhovor
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Interface */}
      <AnimatePresence>
        {(state === 'chat' || state === 'fullscreen') && (
          <motion.div
            className={`fixed pointer-events-auto bg-white shadow-2xl rounded-t-2xl ${
              state === 'fullscreen' ? 'inset-0' : 'bottom-0 left-0 right-0 max-h-[70vh]'
            }`}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 relative">
                  <EnhancedFirefly
                    isVisible={true}
                    size="medium"
                    celebrateEvent={false}
                    followMouse={false}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Sofia</h3>
                  <p className="text-sm text-gray-600">Váš osobný sprievodca</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {state === 'chat' && (
                  <TouchFriendlyButton
                    onClick={() => setState('fullscreen')}
                    variant="ghost"
                    size="small"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </TouchFriendlyButton>
                )}

                {state === 'fullscreen' && (
                  <TouchFriendlyButton
                    onClick={() => setState('chat')}
                    variant="ghost"
                    size="small"
                  >
                    <Minimize2 className="w-4 h-4" />
                  </TouchFriendlyButton>
                )}

                <TouchFriendlyButton
                  onClick={() => setState('floating')}
                  variant="ghost"
                  size="small"
                >
                  <X className="w-4 h-4" />
                </TouchFriendlyButton>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 relative">
                    <EnhancedFirefly
                      isVisible={true}
                      size="large"
                      celebrateEvent={false}
                      followMouse={false}
                    />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Ahoj! Som Sofia ✨
                  </h4>
                  <p className="text-gray-600 max-w-sm mx-auto">
                    Som tu, aby som vám pomohla s organizovaním dôležitých dokumentov a vytvorením pokojného digitálnego trezoru.
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <motion.div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.type === 'sofia' && (
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-4 h-4 relative">
                            <EnhancedFirefly
                              isVisible={true}
                              size="small"
                              celebrateEvent={message.emotion === 'celebrating'}
                              followMouse={false}
                            />
                          </div>
                          <span className="text-xs text-gray-500 font-medium">Sofia</span>
                        </div>
                      )}
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.type === 'user' ? 'text-blue-200' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString('sk-SK', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  className="flex justify-start"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="bg-gray-100 p-3 rounded-2xl">
                    <div className="flex space-x-1">
                      {[1, 2, 3].map((dot) => (
                        <motion.div
                          key={dot}
                          className="w-2 h-2 bg-gray-400 rounded-full"
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: dot * 0.2
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-end space-x-3">
                {/* Voice Input Button */}
                <TouchFriendlyButton
                  onClick={handleVoiceToggle}
                  variant={isRecording ? 'primary' : 'ghost'}
                  size="medium"
                  className={`flex-shrink-0 ${isRecording ? 'bg-red-500 hover:bg-red-600' : ''}`}
                >
                  {isRecording ? (
                    <MicOff className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </TouchFriendlyButton>

                {/* Text Input */}
                <div className="flex-1 relative">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Napíšte správu Sofii..."
                    className="w-full p-3 pr-12 border border-gray-300 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-32"
                    rows={1}
                    style={{ minHeight: '48px' }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                  />

                  {/* Send Button */}
                  <TouchFriendlyButton
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    variant="primary"
                    size="small"
                    className="absolute right-2 bottom-2 min-h-[36px] px-3"
                  >
                    <Send className="w-4 h-4" />
                  </TouchFriendlyButton>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 mt-3">
                {[
                  'Pomôcť s dokumentmi',
                  'Stav pokroku',
                  'Navrhnúť kategórie',
                  'Vysvetliť funkcie'
                ].map((action) => (
                  <TouchFriendlyButton
                    key={action}
                    onClick={() => {
                      setInputMessage(action)
                      handleSendMessage()
                    }}
                    variant="ghost"
                    size="small"
                    className="text-xs"
                  >
                    {action}
                  </TouchFriendlyButton>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimized Indicator */}
      <AnimatePresence>
        {state === 'minimized' && (
          <motion.button
            onClick={() => setState('floating')}
            className="fixed bottom-4 right-4 w-14 h-14 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full shadow-lg pointer-events-auto flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

// Mobile-optimized quick actions component
interface MobileQuickActionsProps {
  actions: Array<{
    id: string
    label: string
    icon: React.ComponentType<{ className?: string }>
    onClick: () => void
    badge?: number
  }>
  className?: string
}

export function MobileQuickActions({
  actions,
  className = ''
}: MobileQuickActionsProps) {
  return (
    <div className={`grid grid-cols-2 gap-3 ${className}`}>
      {actions.map((action) => {
        const IconComponent = action.icon

        return (
          <TouchFriendlyButton
            key={action.id}
            onClick={action.onClick}
            variant="ghost"
            size="large"
            className="flex flex-col items-center space-y-2 p-4 h-auto relative"
          >
            <div className="relative">
              <IconComponent className="w-8 h-8 text-gray-600" />
              {action.badge && action.badge > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {action.badge > 99 ? '99+' : action.badge}
                </span>
              )}
            </div>
            <span className="text-sm font-medium text-gray-700 text-center">
              {action.label}
            </span>
          </TouchFriendlyButton>
        )
      })}
    </div>
  )
}

export default {
  MobileSofia,
  MobileQuickActions
}