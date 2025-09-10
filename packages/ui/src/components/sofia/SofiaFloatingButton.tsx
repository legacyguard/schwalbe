import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '../Button';
import { sofiaAI } from '@schwalbe/logic';

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

interface SofiaStore {
  context: SofiaContext | null;
  getMessageCount?: () => number;
}

interface SofiaFloatingButtonProps {
  isChatOpen: boolean;
  onToggleChat: () => void;
  context?: SofiaContext;
  sofiaStore?: SofiaStore;
  onSuggestion?: (suggestion: string) => void;
}

const SofiaFloatingButton: React.FC<SofiaFloatingButtonProps> = ({
  onToggleChat,
  isChatOpen,
  context,
  sofiaStore,
  onSuggestion,
}) => {
  const [hasNewSuggestion, setHasNewSuggestion] = useState(false);
  const [lastSuggestionTime, setLastSuggestionTime] = useState<number>(0);

  const store = sofiaStore || { context, getMessageCount: () => 0 };
  const currentContext = store.context || context;

  // Check for proactive suggestions every 30 seconds
  useEffect(() => {
    if (!currentContext) return;

    const checkForSuggestions = async () => {
      const now = Date.now();

      // Don't suggest too frequently (minimum 5 minutes between suggestions)
      if (now - lastSuggestionTime < 5 * 60 * 1000) return;

      const suggestion = await sofiaAI.generateProactiveSuggestion(currentContext);

      if (suggestion && !isChatOpen) {
        setHasNewSuggestion(true);
        setLastSuggestionTime(now);

        // Notify parent component about the suggestion
        onSuggestion?.(suggestion);
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
  }, [currentContext, isChatOpen, lastSuggestionTime, onSuggestion]);

  // Clear new suggestion indicator when chat is opened
  useEffect(() => {
    if (isChatOpen && hasNewSuggestion) {
      setHasNewSuggestion(false);
    }
  }, [isChatOpen, hasNewSuggestion]);

  const messageCount = store.getMessageCount?.() || 0;

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
                ? 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
                : 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
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
                ✕
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
                <span className='text-lg font-bold'>S</span>

                {/* Notification indicator */}
                <AnimatePresence>
                  {hasNewSuggestion && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className='absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800'
                    >
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className='w-full h-full bg-green-500 rounded-full'
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
        {!isChatOpen && messageCount === 0 && currentContext && (
          <motion.div
            initial={{ opacity: 0, x: 20, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 20, y: 10 }}
            transition={{ delay: 2 }}
            className='absolute bottom-16 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3 shadow-lg max-w-xs'
          >
            <div className='flex items-start gap-2'>
              <span className='text-yellow-500 flex-shrink-0 mt-0.5'>✨</span>
              <div>
                <p className='text-sm font-medium'>Hi! I'm Sofia</p>
                <p className='text-xs text-gray-500 dark:text-gray-400'>
                  I'm here to help you protect your family. Click to chat!
                </p>
              </div>
            </div>

            {/* Arrow pointing to button */}
            <div className='absolute -bottom-2 right-6 w-4 h-4 bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-600 rotate-45' />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SofiaFloatingButton;