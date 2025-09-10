import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '../Button';
import { Input } from '../Input';
import { Card } from '../Card';
import ReactMarkdown from 'react-markdown';
import { createSofiaMessage, sofiaAI, type SofiaMessage, textManager, analyzeUserInput } from '@schwalbe/logic';

interface SofiaUser {
  id: string;
  name?: string;
}

interface SofiaContext {
  userId: string;
  userName?: string;
  documentCount: number;
  guardianCount: number;
  completionPercentage: number;
  familyStatus: 'business' | 'family' | 'parent_care' | 'partner' | 'single';
  language: string;
  recentActivity: string[];
  milestoneProgress?: {
    categoriesWithDocuments?: string[];
    hasExpiryTracking?: boolean;
    nextMilestone?: string;
    totalMilestones: number;
    unlockedCount: number;
  };
}

interface UserPreferences {
  communication: {
    style: 'default' | 'empathetic' | 'pragmatic';
    autoDetection: boolean;
  };
}

const defaultUserPreferences: UserPreferences = {
  communication: {
    style: 'default',
    autoDetection: true,
  },
};

interface SofiaStore {
  messages: SofiaMessage[];
  isTyping: boolean;
  context: SofiaContext | null;
  addMessage: (message: SofiaMessage) => void;
  setTyping: (typing: boolean) => void;
}

interface SofiaChatProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
  variant?: 'embedded' | 'floating' | 'fullscreen';
  user?: SofiaUser;
  context?: SofiaContext;
  sofiaStore?: SofiaStore;
}

const SofiaChat: React.FC<SofiaChatProps> = ({
  isOpen = false,
  onClose,
  className = '',
  variant = 'floating',
  user,
  context,
  sofiaStore,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(
    defaultUserPreferences
  );
  const [messages, setMessages] = useState<SofiaMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const userId = user?.id;

  // Fallback store implementation if not provided
  const store: SofiaStore = sofiaStore || {
    messages,
    isTyping,
    context,
    addMessage: (message) => setMessages(prev => [...prev, message]),
    setTyping: (typing) => setIsTyping(typing),
  };

  // Load user preferences for communication style
  useEffect(() => {
    if (userId) {
      const savedPrefs = localStorage.getItem(`preferences_${userId}`);
      if (savedPrefs) {
        try {
          setUserPreferences(JSON.parse(savedPrefs));
        } catch (error) {
          console.error('Error loading user preferences:', error);
        }
      }
    }
  }, [userId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      ) || scrollAreaRef.current;
      
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [store.messages, store.isTyping]);

  // Initialize with welcome message if no messages exist
  useEffect(() => {
    if (store.messages.length === 0 && store.context && isOpen && userId) {
      const initializeWelcome = async () => {
        try {
          const helpText = await sofiaAI.getContextualHelp(
            'dashboard',
            store.context!
          );
          const welcomeMessage = createSofiaMessage('assistant', helpText);
          store.addMessage(welcomeMessage);
        } catch (error) {
          console.error('Failed to get contextual help:', error);

          // Use adaptive welcome message based on user's communication preference
          const isReturningUser =
            store.context!.documentCount > 0 || store.context!.guardianCount > 0;
          const welcomeKey = isReturningUser
            ? 'sofia_greeting_returning_user'
            : 'sofia_welcome';
          const adaptiveWelcome = textManager.getText(
            welcomeKey,
            userPreferences.communication.style,
            userId
          );

          const fallbackMessage = createSofiaMessage(
            'assistant',
            adaptiveWelcome
          );
          store.addMessage(fallbackMessage);
        }
      };
      initializeWelcome();
    }
  }, [
    isOpen,
    store.messages.length,
    store.context,
    userId,
    userPreferences.communication.style,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || !store.context || !userId || isSubmitting) return;

    const userMessage = createSofiaMessage('user', inputValue.trim());
    store.addMessage(userMessage);

    // Analyze user input for communication style detection (if auto-detection is enabled)
    if (userPreferences.communication.autoDetection && userId) {
      analyzeUserInput(inputValue.trim(), userId);
    }

    setInputValue('');
    setIsSubmitting(true);
    store.setTyping(true);

    try {
      // Get AI response
      const response = await sofiaAI.generateResponse(
        userMessage.content,
        store.context,
        store.messages
      );

      // Simulate typing delay for better UX
      setTimeout(
        () => {
          const sofiaMessage = createSofiaMessage('assistant', response);
          store.addMessage(sofiaMessage);
          store.setTyping(false);
          setIsSubmitting(false);
        },
        1000 + Math.random() * 1000
      ); // 1-2 second delay
    } catch (error) {
      console.error('Error getting Sofia response:', error);

      // Use adaptive error message
      const adaptiveError = textManager.getText(
        'system_maintenance',
        userPreferences.communication.style,
        userId
      );
      const errorMessage = createSofiaMessage('assistant', adaptiveError);
      store.addMessage(errorMessage);
      store.setTyping(false);
      setIsSubmitting(false);
    }
  };

  const renderMessage = (message: SofiaMessage) => (
    <motion.div
      key={message.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 mb-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      {message.role === 'assistant' && (
        <div className='w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0'>
          <span className='text-blue-600 dark:text-blue-400 text-sm font-bold'>S</span>
        </div>
      )}

      <div
        className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}
      >
        <div
          className={`p-3 rounded-lg ${
            message.role === 'user'
              ? 'bg-blue-500 text-white ml-auto'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
          }`}
        >
          {message.role === 'assistant' ? (
            <div className='prose prose-sm dark:prose-invert max-w-none'>
              <ReactMarkdown
                allowedElements={[
                  'p',
                  'strong',
                  'em',
                  'ul',
                  'ol',
                  'li',
                  'code',
                  'pre',
                  'blockquote',
                  'h3',
                  'h4',
                  'h5',
                  'h6',
                ]}
                skipHtml
              >
                {message.content}
              </ReactMarkdown>
            </div>
          ) : (
            <p className='text-sm'>{message.content}</p>
          )}
        </div>
        <div
          className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${
            message.role === 'user' ? 'text-right' : 'text-left'
          }`}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>

      {message.role === 'user' && (
        <div className='w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0'>
          <span className='text-gray-600 dark:text-gray-300 text-sm font-bold'>U</span>
        </div>
      )}
    </motion.div>
  );

  const renderTypingIndicator = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className='flex gap-3 mb-4'
    >
      <div className='w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0'>
        <span className='text-blue-600 dark:text-blue-400 text-sm font-bold'>S</span>
      </div>
      <div className='bg-gray-100 dark:bg-gray-700 p-3 rounded-lg'>
        <div className='flex gap-1'>
          <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce' />
          <div
            className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
            style={{ animationDelay: '0.1s' }}
          />
          <div
            className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
            style={{ animationDelay: '0.2s' }}
          />
        </div>
      </div>
    </motion.div>
  );

  if (!store.context) {
    return null; // Don't render if no context is available
  }

  const chatContent = (
    <div className='flex flex-col h-full'>
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900 flex items-center justify-center'>
            <span className='text-blue-600 dark:text-blue-400 font-bold'>S</span>
          </div>
          <div>
            <h3 className='font-semibold'>Sofia</h3>
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              {userPreferences.communication.style === 'empathetic'
                ? 'Your Caring Guide'
                : userPreferences.communication.style === 'pragmatic'
                  ? 'Your Digital Assistant'
                  : 'Your Family Guardian'}
            </p>
          </div>
        </div>

        {onClose && (
          <Button
            variant='ghost'
            size='sm'
            onClick={onClose}
            className='h-8 w-8 p-0'
          >
            ✕
          </Button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollAreaRef} className='flex-1 p-4 overflow-y-auto'>
        <div className='space-y-4'>
          {store.messages.map(renderMessage)}
          <AnimatePresence>
            {store.isTyping && renderTypingIndicator()}
          </AnimatePresence>
        </div>
      </div>

      {/* Input */}
      <div className='p-4 border-t'>
        <form onSubmit={handleSubmit} className='flex gap-2'>
          <Input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder='Ask Sofia anything...'
            disabled={isSubmitting}
            className='flex-1'
          />
          <Button
            type='submit'
            disabled={!inputValue.trim() || isSubmitting}
            size='sm'
          >
            {isSubmitting ? (
              <span className='animate-spin'>⟳</span>
            ) : (
              '→'
            )}
          </Button>
        </form>
      </div>
    </div>
  );

  // Render based on variant
  if (variant === 'embedded') {
    return <Card className={`h-[600px] ${className}`}>{chatContent}</Card>;
  }

  if (variant === 'fullscreen') {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50'
          >
            <div className='container mx-auto h-full max-w-4xl p-4'>
              <Card className='h-full'>{chatContent}</Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Default floating variant
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`fixed bottom-4 right-4 w-96 h-[500px] z-50 ${className}`}
        >
          <Card className='h-full shadow-lg'>{chatContent}</Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SofiaChat;