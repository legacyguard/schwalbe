
import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon-library';
import { useSofiaStore } from '@/stores/sofiaStore';
import { sofiaAI } from '@/lib/sofia-ai';
import { toast } from 'sonner';

interface SofiaFloatingButtonProps {
  isChatOpen: boolean;
  onToggleChat: () => void;
}

const SofiaFloatingButton: React.FC<SofiaFloatingButtonProps> = ({
  onToggleChat,
  isChatOpen,
}) => {
  const { context, messages: _messages, getMessageCount } = useSofiaStore();
  const [hasNewSuggestion, setHasNewSuggestion] = useState(false);
  const [lastSuggestionTime, setLastSuggestionTime] = useState<number>(0);

  // Check for proactive suggestions every 30 seconds
  useEffect(() => {
    if (!context) return;

    const checkForSuggestions = async () => {
      const now = Date.now();

      // Don't suggest too frequently (minimum 5 minutes between suggestions)
      if (now - lastSuggestionTime < 5 * 60 * 1000) return;

      const suggestion = await sofiaAI.generateProactiveSuggestion(context);

      if (suggestion && !isChatOpen) {
        setHasNewSuggestion(true);
        setLastSuggestionTime(now);

        // Show subtle toast notification
        toast.info('Sofia has a suggestion for you', {
          duration: 3000,
          action: {
            label: 'View',
            onClick: onToggleChat,
          },
        });
      }
    };

    // Initial check
    const timeout = setTimeout(checkForSuggestions, 5000); // Wait 5 seconds after component mount

    // Then check periodically
    const interval = setInterval(checkForSuggestions, 30 * 1000); // Every 30 seconds

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [context, isChatOpen, lastSuggestionTime, onToggleChat]);

  // Clear new suggestion indicator when chat is opened
  useEffect(() => {
    if (isChatOpen && hasNewSuggestion) {
      setHasNewSuggestion(false);
    }
  }, [isChatOpen, hasNewSuggestion]);

  // const __unreadCount = messages.filter( // Unused
  // msg =>
  // msg.role === 'assistant' &&
  // msg.timestamp.getTime() > (lastSuggestionTime || 0)
  // ).length; // Unused

  return (
    <div className='fixed bottom-6 right-6 z-40'>
      <motion.div
        initial={false}
        animate={{ scale: hasNewSuggestion ? [1, 1.05, 1] : 1 }}
        transition={{
          duration: 0.6,
          repeat: hasNewSuggestion ? Infinity : 0,
          repeatDelay: 2,
        }}
      >
        <Button
          onClick={onToggleChat}
          className={`
            h-14 w-14 rounded-full shadow-lg transition-all duration-300
            ${
              isChatOpen
                ? 'bg-muted hover:bg-muted-hover'
                : 'bg-gradient-to-br from-primary to-primary-hover hover:from-primary-hover hover:to-primary'
            }
          `}
          size='icon'
        >
          <AnimatePresence mode='wait'>
            {isChatOpen ? (
              <motion.div
                key='close'
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Icon name="close" className='w-6 h-6' />
              </motion.div>
            ) : (
              <motion.div
                key='sofia'
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className='relative'
              >
                <Icon name="bot" className='w-6 h-6' />

                {/* Notification indicator */}
                <AnimatePresence>
                  {hasNewSuggestion && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className='absolute -top-1 -right-1 w-4 h-4 bg-status-success rounded-full border-2 border-background'
                    >
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className='w-full h-full bg-status-success rounded-full'
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>

      {/* Floating hint for new users */}
      <AnimatePresence>
        {!isChatOpen && getMessageCount() === 0 && context && (
          <motion.div
            initial={{ opacity: 0, x: 20, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 20, y: 10 }}
            transition={{ delay: 2 }}
            className='absolute bottom-16 right-0 bg-card border border-border rounded-lg p-3 shadow-lg max-w-xs'
          >
            <div className='flex items-start gap-2'>
              <Icon
                name="sparkles"
                className='w-4 h-4 text-primary flex-shrink-0 mt-0.5'
              />
              <div>
                <p className='text-sm font-medium'>Hi! I'm Sofia</p>
                <p className='text-xs text-muted-foreground'>
                  I'm here to help you protect your family. Click to chat!
                </p>
              </div>
            </div>

            {/* Arrow pointing to button */}
            <div className='absolute -bottom-2 right-6 w-4 h-4 bg-card border-r border-b border-border rotate-45' />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SofiaFloatingButton;
