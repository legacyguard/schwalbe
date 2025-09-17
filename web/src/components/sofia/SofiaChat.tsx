
import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Icon } from '@/components/ui/icon-library';
import { useSofiaStore } from '@/stores/sofiaStore';
import { useAuth } from '@clerk/clerk-react';
import ReactMarkdown from 'react-markdown';
import { createSofiaMessage, sofiaAI, type SofiaMessage } from '@/lib/sofia-ai';
import { analyzeUserInput, textManager } from '@/lib/text-manager';
import {
  defaultUserPreferences,
  type UserPreferences,
} from '@/types/user-preferences';

interface SofiaChatProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
  variant?: 'embedded' | 'floating' | 'fullscreen';
}

const SofiaChat: React.FC<SofiaChatProps> = ({
  isOpen = false,
  onClose,
  className = '',
  variant = 'floating',
}) => {
  const { userId } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(
    defaultUserPreferences
  );
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { messages, isTyping, context, addMessage, setTyping } =
    useSofiaStore();

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
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isTyping]);

  // Initialize with welcome message if no messages exist
  useEffect(() => {
    if (messages.length === 0 && context && isOpen && userId) {
      const initializeWelcome = async () => {
        try {
          const helpText = await sofiaAI.getContextualHelp(
            'dashboard',
            context
          );
          const welcomeMessage = createSofiaMessage('assistant', helpText);
          addMessage(welcomeMessage);
        } catch (error) {
          console.error('Failed to get contextual help:', error);

          // Use adaptive welcome message based on user's communication preference
          const isReturningUser =
            context.documentCount > 0 || context.guardianCount > 0;
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
          addMessage(fallbackMessage);
        }
      };
      initializeWelcome();
    }
  }, [
    isOpen,
    messages.length,
    context,
    addMessage,
    userId,
    userPreferences.communication.style,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || !context || !userId || isSubmitting) return;

    const userMessage = createSofiaMessage('user', inputValue.trim());
    addMessage(userMessage);

    // Analyze user input for communication style detection (if auto-detection is enabled)
    if (userPreferences.communication.autoDetection && userId) {
      analyzeUserInput(inputValue.trim(), userId);
    }

    setInputValue('');
    setIsSubmitting(true);
    setTyping(true);

    try {
      // Get AI response
      const response = await sofiaAI.generateResponse(
        userMessage.content,
        context,
        messages
      );

      // Simulate typing delay for better UX
      setTimeout(
        () => {
          const sofiaMessage = createSofiaMessage('assistant', response);
          addMessage(sofiaMessage);
          setTyping(false);
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
      addMessage(errorMessage);
      setTyping(false);
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
        <div className='w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0'>
          <Icon name="bot" className='w-4 h-4 text-primary' />
        </div>
      )}

      <div
        className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}
      >
        <div
          className={`p-3 rounded-lg ${
            message.role === 'user'
              ? 'bg-primary text-primary-foreground ml-auto'
              : 'bg-muted text-muted-foreground'
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
          className={`text-xs text-muted-foreground mt-1 ${
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
        <div className='w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0'>
          <Icon
            name="user"
            className='w-4 h-4 text-secondary-foreground'
          />
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
      <div className='w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0'>
        <Icon name="bot" className='w-4 h-4 text-primary' />
      </div>
      <div className='bg-muted p-3 rounded-lg'>
        <div className='flex gap-1'>
          <div className='w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce' />
          <div
            className='w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce'
            style={{ animationDelay: '0.1s' }}
          />
          <div
            className='w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce'
            style={{ animationDelay: '0.2s' }}
          />
        </div>
      </div>
    </motion.div>
  );

  if (!context) {
    return null; // Don't render if no context is available
  }

  const chatContent = (
    <div className='flex flex-col h-full'>
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center'>
            <Icon name="bot" className='w-5 h-5 text-primary' />
          </div>
          <div>
            <h3 className='font-semibold'>Sofia</h3>
            <p className='text-sm text-muted-foreground'>
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
            <Icon name="x" className='w-4 h-4' />
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className='flex-1 p-4'>
        <div className='space-y-4'>
          {messages.map(renderMessage)}
          <AnimatePresence>
            {isTyping && renderTypingIndicator()}
          </AnimatePresence>
        </div>
      </ScrollArea>

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
              <Icon name="loader-2" className='w-4 h-4 animate-spin' />
            ) : (
              <Icon name="send" className='w-4 h-4' />
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
            className='fixed inset-0 bg-background/80 backdrop-blur-sm z-50'
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
