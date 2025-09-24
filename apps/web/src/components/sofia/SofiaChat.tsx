/**
 * Sofia Chat Component
 * Interactive chat interface for Sofia AI assistant
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Sparkles, MessageCircle, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Import Sofia system
import { sofiaAPI, createSofiaAPIRequest } from '@schwalbe/shared/services/sofia';
import type { SofiaMessage, SofiaContext } from '@schwalbe/logic';

interface SofiaChatProps {
  isOpen: boolean;
  onClose: () => void;
  position?: { x: number; y: number };
  initialMessage?: string;
}

export function SofiaChat({ isOpen, onClose, position, initialMessage }: SofiaChatProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<SofiaMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock user context for demo
  const mockContext: SofiaContext = {
    userId: 'demo-user',
    userName: 'Guest',
    documentCount: 3,
    guardianCount: 1,
    completionPercentage: 45,
    familyStatus: 'family',
    language: 'en',
    recentActivity: ['viewed_dashboard', 'uploaded_document'],
    currentPage: 'landing'
  };

  // Initialize conversation
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: SofiaMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: initialMessage || t('Hi! I\'m Sofia, your AI guide. I\'m here to help you understand LegacyGuard and guide you through protecting your digital legacy. What would you like to know?'),
        timestamp: new Date(),
        metadata: {
          cost: 'free',
          source: 'predefined'
        }
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, initialMessage, t, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: SofiaMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Create API request
      const request = createSofiaAPIRequest(
        userMessage.content,
        mockContext,
        'simple_query',
        messages
      );

      // Get Sofia response
      const response = await sofiaAPI.processSimpleQuery(request);

      const sofiaMessage: SofiaMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: response.response || 'I apologize, but I encountered an issue. Please try again.',
        timestamp: new Date(),
        metadata: {
          cost: response.cost,
          source: response.success ? 'ai_generated' : 'predefined'
        }
      };

      setMessages(prev => [...prev, sofiaMessage]);
    } catch (error) {
      console.error('Sofia chat error:', error);

      const errorMessage: SofiaMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble connecting right now. Let me help you with some common questions instead.',
        timestamp: new Date(),
        metadata: {
          cost: 'free',
          source: 'predefined'
        }
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickActions = [
    { text: 'What is LegacyGuard?', icon: HelpCircle },
    { text: 'How secure is my data?', icon: Sparkles },
    { text: 'How do I get started?', icon: MessageCircle },
    { text: 'What features are included?', icon: Sparkles }
  ];

  const handleQuickAction = (text: string) => {
    setInputValue(text);
    setTimeout(() => sendMessage(), 100);
  };

  console.log('SofiaChat render:', { isOpen, position });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed z-50"
        style={{
          left: position?.x ? Math.min(Math.max(position.x, 200), window.innerWidth - 200) : '50%',
          top: position?.y ? Math.max(position.y, 100) : '50%',
          transform: position ? 'translate(-50%, -100%)' : 'translate(-50%, -50%)'
        }}
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
          onClick={onClose}
        />

        {/* Chat Window */}
        <div className="bg-white/95 backdrop-blur-lg border border-stone-200/50 rounded-3xl shadow-2xl w-96 max-h-[500px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-stone-200/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-800">Sofia</h3>
                <p className="text-xs text-stone-500">Your AI Guide</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-stone-100 rounded-full transition-colors"
            >
              <X size={18} className="text-stone-600" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-80">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-stone-800 text-white'
                      : 'bg-stone-100 text-stone-800'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  {message.metadata?.cost === 'premium' && (
                    <div className="mt-2 text-xs opacity-70">
                      ✨ Premium response
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-stone-100 px-4 py-3 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length === 1 && !isTyping && (
            <div className="px-4 pb-2">
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action.text)}
                    className="flex items-center gap-2 px-3 py-2 bg-stone-50 hover:bg-stone-100 text-stone-600 text-xs rounded-full transition-colors"
                  >
                    <action.icon size={12} />
                    {action.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-stone-200/50">
            <div className="flex items-center gap-2 bg-stone-50 rounded-2xl px-4 py-3">
              <input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Sofia anything..."
                className="flex-1 bg-transparent text-stone-800 placeholder-stone-500 text-sm outline-none"
                disabled={isTyping}
              />
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="p-2 bg-stone-800 hover:bg-stone-700 disabled:bg-stone-300 text-white rounded-xl transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}