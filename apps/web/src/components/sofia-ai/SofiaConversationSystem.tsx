/**
 * Sofia AI Conversation System
 * Interactive AI assistant for family protection guidance and support
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LiquidMotion } from '@/components/animations/LiquidMotion';
import { PersonalityAwareAnimation } from '@/components/animations/PersonalityAwareAnimations';
import {
  useSofiaPersonality,
  PersonalityPresets
} from '@/components/sofia-firefly/SofiaFireflyPersonality';
import { sofiaAIService, ConversationMessage, ConversationContext } from '@/services/sofia-ai.service';

interface SofiaConversationSystemProps {
  context?: 'onboarding' | 'guiding' | 'analyzing' | 'supporting' | 'emergency';
  personality?: 'nurturing' | 'professional' | 'encouraging' | 'analytical';
  familyContext?: {
    familySize: number;
    primaryConcerns: string[];
    completionLevel: number;
    urgentTasks: string[];
  };
  onActionSuggested?: (action: string, data?: any) => void;
  onTopicChanged?: (topic: string) => void;
  initialMessage?: string;
}

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  category: 'family' | 'documents' | 'emergency' | 'guidance';
  action: string;
  data?: any;
}

const quickActions: QuickAction[] = [
  {
    id: 'family_tree',
    label: 'Show Family Tree',
    icon: '👨‍👩‍👧‍👦',
    category: 'family',
    action: 'navigate_to_family_tree'
  },
  {
    id: 'add_emergency_contact',
    label: 'Add Emergency Contact',
    icon: '🚨',
    category: 'emergency',
    action: 'add_emergency_contact'
  },
  {
    id: 'upload_document',
    label: 'Upload Document',
    icon: '📄',
    category: 'documents',
    action: 'upload_document'
  },
  {
    id: 'protection_score',
    label: 'Check Protection Score',
    icon: '🛡️',
    category: 'family',
    action: 'show_protection_score'
  },
  {
    id: 'guardian_setup',
    label: 'Setup Guardians',
    icon: '👤',
    category: 'family',
    action: 'setup_guardians'
  },
  {
    id: 'document_review',
    label: 'Review Documents',
    icon: '🔍',
    category: 'documents',
    action: 'review_documents'
  }
];

export default function SofiaConversationSystem({
  context = 'guiding',
  personality = 'nurturing',
  familyContext,
  onActionSuggested,
  onTopicChanged,
  initialMessage
}: SofiaConversationSystemProps) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [conversationContext, setConversationContext] = useState<ConversationContext | null>(null);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize Sofia personality
  const { personality: sofiaPersonality, adaptToContext, learnFromInteraction } = useSofiaPersonality(
    personality === 'nurturing' ? PersonalityPresets.nurturingUser :
    personality === 'professional' ? PersonalityPresets.professionalUser :
    personality === 'encouraging' ? PersonalityPresets.encouragingUser :
    PersonalityPresets.analyticalUser
  );

  useEffect(() => {
    adaptToContext(context);
    initializeConversation();
  }, [context, adaptToContext]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (initialMessage && messages.length === 1) {
      handleSendMessage(initialMessage);
    }
  }, [initialMessage]);

  const initializeConversation = async () => {
    const newSessionId = `session_${Date.now()}`;
    setSessionId(newSessionId);

    // Send welcome message
    const welcomeMessage: ConversationMessage = {
      id: `msg_${Date.now()}_sofia`,
      role: 'sofia',
      content: getWelcomeMessage(context, personality),
      timestamp: new Date(),
      metadata: {
        intent: 'welcome',
        sentiment: 'positive',
        actionable: true,
        followUpSuggestions: getInitialSuggestions(context)
      }
    };

    setMessages([welcomeMessage]);
  };

  const getWelcomeMessage = (ctx: string, pers: string): string => {
    const messages = {
      onboarding: {
        nurturing: "Welcome! I'm Sofia, your family protection guide. I'm here to help you create a comprehensive plan that keeps your loved ones safe and secure. Let's start by understanding your family's unique needs.",
        professional: "Hello! I'm Sofia, your AI assistant for family protection planning. I'll help you systematically build a robust protection framework for your family. What would you like to focus on first?",
        encouraging: "Hi there! I'm Sofia, and I'm excited to help you protect what matters most - your family! Together, we'll build an amazing protection plan that gives you complete peace of mind.",
        analytical: "Greetings. I'm Sofia, your AI-powered family protection analyst. I'll provide data-driven insights and systematic recommendations to optimize your family's security posture."
      },
      guiding: {
        nurturing: "I'm here whenever you need guidance with your family protection plan. Whether you have questions about documents, emergency contacts, or guardians, I'm ready to help with care and understanding.",
        professional: "I'm available to assist with any aspect of your family protection strategy. I can analyze your current setup, provide recommendations, and guide you through improvements.",
        encouraging: "Ready to make your family even more protected? I'm here to cheer you on and help you tackle any challenges! What can we accomplish together today?",
        analytical: "System ready for consultation. I can provide analysis, recommendations, and strategic guidance based on your current protection metrics and family configuration."
      }
    };

    return messages[ctx as keyof typeof messages]?.[pers as keyof typeof messages.onboarding] ||
           messages.guiding.nurturing;
  };

  const getInitialSuggestions = (ctx: string): string[] => {
    const suggestions = {
      onboarding: [
        'Tell me about your family',
        'What are your main concerns?',
        'Help me get started'
      ],
      guiding: [
        'Check my protection score',
        'Review my documents',
        'Add emergency contacts',
        'Setup guardians'
      ],
      analyzing: [
        'Analyze my documents',
        'Find missing information',
        'Check compliance'
      ],
      supporting: [
        'I need help with...',
        'Something went wrong',
        'Explain this feature'
      ]
    };

    return suggestions[ctx as keyof typeof suggestions] || suggestions.guiding;
  };

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || currentMessage.trim();
    if (!text) return;

    setCurrentMessage('');
    setIsTyping(true);

    // Add user message
    const userMessage: ConversationMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Get Sofia's response
      const response = await sofiaAIService.conversate(
        'current_user',
        text,
        {
          sessionId,
          context,
          personality,
          familyContext
        }
      );

      // Learn from interaction
      learnFromInteraction({
        type: 'conversation',
        duration: 1000,
        context: context
      });

      // Add Sofia's response with typing animation
      setTimeout(() => {
        setMessages(prev => [...prev, response]);
        setIsTyping(false);

        // Handle follow-up actions
        if (response.metadata?.followUpSuggestions) {
          setShowQuickActions(true);
        }

        // Notify parent of topic changes
        if (response.metadata?.entities) {
          const topics = response.metadata.entities
            .filter(entity => entity.type === 'topic')
            .map(entity => entity.value);
          topics.forEach(topic => onTopicChanged?.(topic));
        }
      }, 1500); // Simulate typing delay

    } catch (error) {
      console.error('Conversation error:', error);
      setIsTyping(false);

      // Add error message
      const errorMessage: ConversationMessage = {
        id: `msg_${Date.now()}_error`,
        role: 'sofia',
        content: "I apologize, but I'm having trouble processing your message right now. Please try again in a moment.",
        timestamp: new Date(),
        metadata: {
          intent: 'error',
          sentiment: 'neutral'
        }
      };

      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    setShowQuickActions(false);

    // Send action as message
    const actionMessage = `Help me with: ${action.label}`;
    handleSendMessage(actionMessage);

    // Notify parent component
    onActionSuggested?.(action.action, action.data);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredQuickActions = selectedCategory === 'all'
    ? quickActions
    : quickActions.filter(action => action.category === selectedCategory);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <PersonalityAwareAnimation personality={sofiaPersonality} context={context}>
      <motion.div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
          isMinimized ? 'w-16 h-16' : 'w-96 h-[32rem]'
        }`}
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className={`h-full shadow-2xl border-2 border-primary/20 ${
          isMinimized ? 'rounded-full' : 'rounded-xl'
        }`}>
          {isMinimized ? (
            <motion.div
              className="w-full h-full flex items-center justify-center cursor-pointer bg-gradient-to-br from-primary to-primary/80 rounded-full"
              onClick={() => setIsMinimized(false)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="text-2xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ✨
              </motion.div>
            </motion.div>
          ) : (
            <>
              {/* Header */}
              <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-t-xl p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <motion.div
                      className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      ✨
                    </motion.div>
                    <div>
                      <CardTitle className="text-sm font-medium">Sofia AI</CardTitle>
                      <p className="text-xs text-white/80 capitalize">
                        {context} • {personality}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-white/20 h-6 w-6 p-0"
                      onClick={() => setIsMinimized(true)}
                    >
                      <span className="text-xs">−</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 p-0 overflow-hidden">
                <div className="h-80 overflow-y-auto p-3 space-y-3">
                  <AnimatePresence>
                    {messages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] p-3 rounded-xl ${
                          message.role === 'user'
                            ? 'bg-primary text-white'
                            : 'bg-muted text-foreground'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          {message.metadata?.followUpSuggestions && message.role === 'sofia' && (
                            <div className="mt-2 space-y-1">
                              {message.metadata.followUpSuggestions.slice(0, 2).map((suggestion, idx) => (
                                <Button
                                  key={idx}
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-6 mr-1"
                                  onClick={() => handleSendMessage(suggestion)}
                                >
                                  {suggestion}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Typing indicator */}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-muted p-3 rounded-xl">
                        <div className="flex space-x-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 bg-muted-foreground rounded-full"
                              animate={{ scale: [1, 1.5, 1] }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions */}
                <AnimatePresence>
                  {showQuickActions && !isTyping && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t p-3"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-muted-foreground">Quick Actions:</span>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="text-xs border rounded px-2 py-1"
                        >
                          <option value="all">All</option>
                          <option value="family">Family</option>
                          <option value="documents">Documents</option>
                          <option value="emergency">Emergency</option>
                          <option value="guidance">Guidance</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {filteredQuickActions.slice(0, 4).map((action) => (
                          <motion.div
                            key={action.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full text-xs h-8 justify-start"
                              onClick={() => handleQuickAction(action)}
                            >
                              <span className="mr-1">{action.icon}</span>
                              {action.label}
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Input Area */}
                <div className="border-t p-3">
                  <div className="flex gap-2">
                    <Input
                      ref={inputRef}
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask Sofia anything..."
                      className="flex-1 text-sm"
                      disabled={isTyping}
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSendMessage()}
                      disabled={!currentMessage.trim() || isTyping}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <span className="text-sm">📤</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </motion.div>
    </PersonalityAwareAnimation>
  );
}