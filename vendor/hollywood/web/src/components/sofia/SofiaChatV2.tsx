
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Icon } from '@/components/ui/icon-library';
import { useSofiaStore } from '@/stores/sofiaStore';
import { useAuth } from '@clerk/clerk-react';
import ReactMarkdown from 'react-markdown';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n/useTranslation';

import { getSofiaMemory } from '@/lib/sofia-memory';
import {
  getSofiaProactive,
  type ProactiveIntervention,
} from '@/lib/sofia-proactive';

// New guided dialog imports
import { sofiaRouter } from '@/lib/sofia-router';
import {
  type ActionButton,
  type CommandResult,
  getContextualActions,
  type SofiaCommand,
  type SofiaMessage,
} from '@/lib/sofia-types';
import SofiaActionButtons from './SofiaActionButtons';

// Smart contextual suggestions based on current page
const getContextualSuggestions = (
  currentPage: string,
  t: (key: string) => string
): ActionButton[] => {
  const suggestions: Record<string, ActionButton[]> = {
    dashboard: [
      {
        id: 'suggest_next_step',
        text: t('sofia.suggestions.dashboard.suggestNextStep'),
        icon: 'arrowRight',
        category: 'ui_action',
        cost: 'free',
        payload: { action: 'show_progress' },
      },
      {
        id: 'faq_security',
        text: t('sofia.suggestions.dashboard.howSecureData'),
        icon: 'shield',
        category: 'ai_query',
        cost: 'low_cost',
      },
      {
        id: 'getting_started',
        text: t('sofia.suggestions.dashboard.gettingStarted'),
        icon: 'help',
        category: 'ai_query',
        cost: 'low_cost',
      },
    ],
    vault: [
      {
        id: 'trigger_upload',
        text: t('sofia.suggestions.vault.helpAddDocuments'),
        icon: 'upload',
        category: 'ui_action',
        cost: 'free',
        payload: { action: 'open_uploader' },
      },
      {
        id: 'faq_documents',
        text: t('sofia.suggestions.vault.whatDocumentsUpload'),
        icon: 'help',
        category: 'ai_query',
        cost: 'low_cost',
      },
      {
        id: 'upload_help',
        text: t('sofia.suggestions.vault.organizeFiles'),
        icon: 'info',
        category: 'ai_query',
        cost: 'low_cost',
      },
    ],
    guardians: [
      {
        id: 'add_guardian_help',
        text: t('sofia.suggestions.guardians.howAddGuardian'),
        icon: 'help',
        category: 'ai_query',
        cost: 'low_cost',
      },
      {
        id: 'faq_guardians',
        text: t('sofia.suggestions.guardians.whatAreGuardians'),
        icon: 'info',
        category: 'ai_query',
        cost: 'low_cost',
      },
      {
        id: 'navigate_vault',
        text: t('sofia.suggestions.guardians.showDocuments'),
        icon: 'vault',
        category: 'navigation',
        cost: 'free',
        payload: { route: '/vault' },
      },
    ],
    legacy: [
      {
        id: 'generate_legacy_letter',
        text: t('sofia.suggestions.legacy.writePersonalMessage'),
        icon: 'heart',
        category: 'premium_feature',
        cost: 'premium',
        requiresConfirmation: true,
        description: t('sofia.suggestions.legacy.createHeartfeltMessage'),
      },
      {
        id: 'faq_documents',
        text: t('sofia.suggestions.legacy.whatLegalDocuments'),
        icon: 'help',
        category: 'ai_query',
        cost: 'low_cost',
      },
      {
        id: 'navigate_vault',
        text: t('sofia.suggestions.legacy.reviewDocuments'),
        icon: 'vault',
        category: 'navigation',
        cost: 'free',
        payload: { route: '/vault' },
      },
    ],
  };

  const pageKey = currentPage in suggestions ? currentPage : 'dashboard';
  return suggestions[pageKey] as ActionButton[];
};

interface SofiaChatV2Props {
  className?: string;
  currentPage?: string;
  isOpen?: boolean;
  onClose?: () => void;
  pendingAction?: null | { sofiaResponse: string; userMessage: string };
  variant?: 'embedded' | 'floating' | 'fullscreen';
}

const SofiaChatV2: React.FC<SofiaChatV2Props> = ({
  isOpen = false,
  onClose,
  className = '',
  variant = 'floating',
  currentPage = 'dashboard',
  pendingAction = null,
}) => {
  const { t } = useTranslation();
  const { userId } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showProactiveIntervention, setShowProactiveIntervention] =
    useState(false);
  const [currentIntervention, setCurrentIntervention] =
    useState<null | ProactiveIntervention>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const memoryServiceRef = useRef<null | ReturnType<typeof getSofiaMemory>>(
    null
  );
  const proactiveServiceRef = useRef<null | ReturnType<
    typeof getSofiaProactive
  >>(null);

  const { messages, isTyping, context, addMessage, updateMessages, setTyping } =
    useSofiaStore();

  // Initialize memory and proactive services
  useEffect(() => {
    if (userId) {
      memoryServiceRef.current = getSofiaMemory(userId);
      proactiveServiceRef.current = getSofiaProactive(userId);

      // Start monitoring current page
      const currentRoutePage = location.pathname.split('/')[1] || 'dashboard';
      proactiveServiceRef.current.startMonitoring(currentRoutePage);

      return () => {
        // Clean up monitoring when component unmounts
        proactiveServiceRef.current?.stopMonitoring();
      };
    }
    return undefined;
  }, [userId, location.pathname]);

  // Save conversation to memory when closing
  useEffect(() => {
    return () => {
      if (!isOpen && messages.length > 0 && memoryServiceRef.current) {
        memoryServiceRef.current.rememberConversation(messages);
      }
    };
  }, [isOpen, messages]);

  // Check for proactive interventions
  useEffect(() => {
    if (isOpen && proactiveServiceRef.current && !currentIntervention) {
      const checkInterval = setInterval(() => {
        if (proactiveServiceRef.current?.hasPendingInterventions()) {
          const intervention =
            proactiveServiceRef.current.getNextIntervention();
          if (intervention) {
            setCurrentIntervention(intervention);
            setTimeout(() => {
              setShowProactiveIntervention(true);
            }, intervention.displayAfterMs);
          }
        }
      }, 5000); // Check every 5 seconds

      return () => clearInterval(checkInterval);
    }
    return undefined;
  }, [isOpen, currentIntervention]);

  // Move getDefaultWelcome to prevent dependency issues
  const getDefaultWelcome = useCallback((): string => {
    if (!context) return t('sofia.chat.welcome');

    // Check if we have conversation memory
    if (memoryServiceRef.current) {
      const welcomeMessage =
        memoryServiceRef.current.getWelcomeBackMessage(context);
      return welcomeMessage;
    }

    const name = context.userName || 'there';
    return `Hello, ${name}! I am Sofia and I am here to help you protect your family. How can I help you today?`;
  }, [context, t]);

  // Define initializeGuidedDialog early to prevent hoisting issues
  const initializeGuidedDialog = useCallback(async () => {
    if (!context || !userId) return;

    setIsProcessing(true);
    setTyping(true);

    try {
      // Create welcome command
      const welcomeCommand: SofiaCommand = {
        id: crypto.randomUUID(),
        command: 'show_sofia',
        category: 'ui_action',
        context,
        timestamp: new Date(),
      };

      // Process through router
      const result = await sofiaRouter.processCommand(welcomeCommand);

      // Simulate typing delay
      setTimeout(() => {
        const resolvedWelcomeActions: ActionButton[] =
          ((result.payload as { actions?: ActionButton[]; message?: string })
            ?.actions?.length ?? 0) > 0
            ? (result.payload as { actions?: ActionButton[]; message?: string })
                .actions!
            : getContextualSuggestions(currentPage, t);

        const welcomeMessage: SofiaMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content:
            (result.payload as { actions?: any[]; message?: string })
              ?.message || getDefaultWelcome(),
          timestamp: new Date(),
          actions: resolvedWelcomeActions,
          responseType: 'welcome',
          metadata: {
            cost: result.cost,
            source: 'predefined',
          },
        };

        addMessage(welcomeMessage);
        setTyping(false);
        setIsProcessing(false);
      }, 1000);
    } catch (error) {
      console.error('[Sofia] Error initializing dialog:', error);
      const errorMessage: SofiaMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: t('sofia.chat.errorFallback'),
        timestamp: new Date(),
        responseType: 'error',
        metadata: { cost: 'free', source: 'predefined' },
      };
      addMessage(errorMessage);
      setTyping(false);
      setIsProcessing(false);
    }
  }, [
    context,
    userId,
    addMessage,
    currentPage,
    getDefaultWelcome,
    setTyping,
    setIsProcessing,
  ]);

  // Handle pending actions from search
  useEffect(() => {
    if (pendingAction && isOpen) {
      // Add both messages immediately when Sofia opens with a pending action
      const userMessage: SofiaMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: pendingAction.userMessage,
        timestamp: new Date(),
        metadata: { cost: 'free', source: 'predefined' as any },
      };

      const sofiaMessage: SofiaMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: pendingAction.sofiaResponse,
        timestamp: new Date(),
        responseType: 'information' as any,
        metadata: { cost: 'free', source: 'predefined' as any },
      };

      addMessage(userMessage);

      // Add Sofia response after a short delay for natural feel
      setTimeout(() => {
        addMessage(sofiaMessage);
      }, 500);
    }
  }, [pendingAction, isOpen, addMessage]);

  // Auto-scroll to bottom when new messages arrive with smooth scrolling
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      );
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: 'smooth',
        });
      }
    }
  }, [messages, isTyping]);

  // Initialize with guided welcome message if no messages exist
  useEffect(() => {
    if (messages.length === 0 && context && isOpen) {
      // Check for return greeting first
      if (proactiveServiceRef.current && memoryServiceRef.current) {
        const returnGreeting =
          proactiveServiceRef.current.createReturnGreeting(context);
        if (returnGreeting) {
          setCurrentIntervention(returnGreeting);
          setTimeout(() => {
            setShowProactiveIntervention(true);
          }, returnGreeting.displayAfterMs);
          return;
        }
      }
      initializeGuidedDialog();
    }
  }, [isOpen, messages.length, context, initializeGuidedDialog]);

  const handleProactiveAction = async (action: string) => {
    if (!currentIntervention || !proactiveServiceRef.current) return;

    // Mark intervention as completed
    proactiveServiceRef.current.markInterventionCompleted(
      currentIntervention.id,
      action
    );

    // Hide the intervention
    setShowProactiveIntervention(false);
    setCurrentIntervention(null);

    // Handle the action
    if (action === 'dismiss') {
      return;
    }

    // Process the action through the normal flow
    const actionButton: ActionButton = {
      id: action,
      text:
        currentIntervention.actions?.find(a => a.action === action)?.text ||
        action,
      category: 'ui_action' as const,
      cost: 'free' as const,
    };

    await handleActionClick(actionButton);
  };

  const handleActionClick = async (action: ActionButton) => {
    if (!context || !userId) return;

    // Add user action as message
    const userMessage: SofiaMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: `🎯 ${action.text}`,
      timestamp: new Date(),
      metadata: { cost: 'free', source: 'predefined' },
    };

    // **FIX: Remove actions from the previous message to prevent multiple clicks**
    updateMessages(prevMessages =>
      prevMessages.map(({ actions: _omit, ...msg }) => ({ ...msg }))
    );

    // Add the user message
    addMessage(userMessage);

    // Show confirmation for premium actions
    if (action.requiresConfirmation) {
      const confirmed = await showConfirmation(action);
      if (!confirmed) {
        const cancelMessage: SofiaMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Understood, cancelled. What else can I help you with?',
          timestamp: new Date(),
          actions: getContextualActions(context),
          responseType: 'information',
          metadata: { cost: 'free', source: 'predefined' },
        };
        addMessage(cancelMessage);
        return;
      }
    }

    setIsProcessing(true);
    setTyping(true);

    try {
      // Create command
      const command: SofiaCommand = {
        id: crypto.randomUUID(),
        command: action.id,
        category: action.category,
        parameters: (action.payload as Record<string, unknown>) || {},
        context,
        timestamp: new Date(),
      };

      // Process through router
      const result = await sofiaRouter.processCommand(command);

      // Handle different result types
      await handleCommandResult(result, action);
    } catch (error) {
      console.error('[Sofia] Error processing action:', error);
      handleError('I apologize, an error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
      setTyping(false);
    }
  };

  const handleCommandResult = async (
    result: CommandResult,
    _action: ActionButton
  ) => {
    switch (result.type) {
      case 'navigation':
        // Navigate to route
        if ((result.payload as { route?: string })?.route) {
          navigate((result.payload as { route: string }).route);
          if (onClose) onClose(); // Close chat on navigation

          // Add confirmation message
          const navMessage: SofiaMessage = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: `Redirecting you to ${getRouteName((result.payload as { route: string }).route)}...`,
            timestamp: new Date(),
            responseType: 'confirmation',
            metadata: { cost: result.cost, source: 'predefined' },
          };
          addMessage(navMessage);
        }
        break;

      case 'ui_action':
        // Handle UI actions
        handleUIAction(
          result.payload as { action: string; data?: unknown; message?: string }
        );
        break;

      case 'response':
        // Add Sofia's response
        setTimeout(() => {
          const resolvedResponseActions: ActionButton[] =
            ((
              result.payload as any as {
                actions?: ActionButton[];
                message: string;
              }
            ).actions?.length ?? 0) > 0
              ? ((
                  result.payload as any as {
                    actions?: ActionButton[];
                    message: string;
                  }
                ).actions as ActionButton[])
              : context
                ? getContextualActions(context)
                : [];

          const responseMessage: SofiaMessage = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: (
              result.payload as any as { actions?: any[]; message: string }
            ).message,
            timestamp: new Date(),
            actions: resolvedResponseActions,
            responseType: 'information',
            metadata: { cost: result.cost, source: 'predefined' },
          };
          addMessage(responseMessage);
        }, 800);
        break;

      case 'error':
        handleError((result.payload as any as { message: string }).message);
        break;

      case 'text_response':
        // Handle simple text responses with actions
        setTimeout(() => {
          const responseMessage: SofiaMessage = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: result.payload as any as string,
            timestamp: new Date(),
            actions: context ? getContextualActions(context) : [],
            responseType: 'information',
            metadata: {
              cost: result.cost || 'low_cost',
              source: 'ai_generated',
            },
          };
          addMessage(responseMessage);
        }, 800);
        break;
    }
  };

  const handleUIAction = (payload: {
    action: string;
    data?: unknown;
    message?: string;
  }) => {
    switch (payload.action) {
      case 'open_uploader': {
        // Trigger document uploader
        const event = new CustomEvent('sofia:open_uploader', {
          detail: payload,
        });
        window.dispatchEvent(event);

        const uploaderMessage: SofiaMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: payload.message || 'Opening document uploader...',
          timestamp: new Date(),
          responseType: 'confirmation',
          metadata: { cost: 'free', source: 'predefined' },
        };
        addMessage(uploaderMessage);
        break;
      }

      case 'show_progress_modal': {
        // Show progress modal
        const progressEvent = new CustomEvent('sofia:show_progress', {
          detail: payload.data,
        });
        window.dispatchEvent(progressEvent);
        break;
      }

      default:
        console.warn('[Sofia] Unknown UI action:', payload.action);
    }
  };

  const handleTextInput = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || !context || !userId || isProcessing) return;

    const userMessage: SofiaMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
      metadata: { cost: 'free', source: 'predefined' },
    };
    addMessage(userMessage);
    setInputValue('');
    setIsProcessing(true);
    setTyping(true);

    try {
      // Create free-form command
      const command: SofiaCommand = {
        id: crypto.randomUUID(),
        command: userMessage.content,
        category: 'ai_query', // Will be routed appropriately
        context,
        timestamp: new Date(),
      };

      // Process through router
      const result = await sofiaRouter.processCommand(command);
      await handleCommandResult(result, {} as ActionButton);
    } catch (error) {
      console.error('[Sofia] Error processing text input:', error);
      handleError(
        "I apologize, I don't understand. Please try one of the suggested options."
      );
    } finally {
      setIsProcessing(false);
      setTyping(false);
    }
  };

  const handleError = (message: string) => {
    const errorMessage: SofiaMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: message,
      timestamp: new Date(),
      actions: context ? getContextualActions(context) : [],
      responseType: 'error',
      metadata: { cost: 'free', source: 'predefined' },
    };
    addMessage(errorMessage);
  };

  const showConfirmation = async (action: ActionButton): Promise<boolean> => {
    return new Promise(resolve => {
      const confirmMessage = `${action.text}\n\n${action.description}\n\nContinue?`;
      const confirmed = window.confirm(confirmMessage);
      resolve(confirmed);
    });
  };

  const getRouteName = (route: string): string => {
    const routeNames: Record<string, string> = {
      '/vault': 'your vault',
      '/guardians': 'guardian management',
      '/legacy': 'will creation',
      '/': 'dashboard',
    };
    return routeNames[route] || route;
  };

  const renderMessage = (message: SofiaMessage) => (
    <motion.div
      key={message.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 mb-6 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      {message.role === 'assistant' && (
        <div className='w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0'>
          <Icon name='bot' className='w-4 h-4 text-primary' />
        </div>
      )}

      <div
        className={`max-w-[85%] ${message.role === 'user' ? 'self-end' : 'self-start'}`}
      >
        <div
          className={`p-4 rounded-lg shadow-sm border ${
            message.role === 'user'
              ? 'bg-primary text-primary-foreground border-primary/20 rounded-br-sm'
              : 'bg-background text-foreground border-border rounded-bl-sm'
          }`}
        >
          {message.role === 'assistant' ? (
            <div className='prose prose-sm dark:prose-invert max-w-none [&>*:last-child]:mb-0 [&>*:first-child]:mt-0'>
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <p className='mb-2 last:mb-0'>{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className='mb-2 last:mb-0 pl-4'>{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className='mb-2 last:mb-0 pl-4'>{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className='mb-1 last:mb-0'>{children}</li>
                  ),
                  strong: ({ children }) => (
                    <strong className='font-semibold'>{children}</strong>
                  ),
                  em: ({ children }) => <em className='italic'>{children}</em>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          ) : (
            <p className='text-sm leading-relaxed'>{message.content}</p>
          )}
        </div>

        {/* Action Buttons for assistant messages */}
        {message.role === 'assistant' && message.actions && (
          <div className='mt-3'>
            <SofiaActionButtons
              actions={message.actions}
              onActionClick={handleActionClick}
              isDisabled={isProcessing}
            />
          </div>
        )}

        <div
          className={`text-xs text-muted-foreground mt-2 flex items-center gap-2 ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          <span>
            {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>

          {/* Cost/Source indicator */}
          {message.metadata && message.role === 'assistant' && (
            <span className='opacity-60'>
              {message.metadata.cost === 'premium' && '⭐'}
              {message.metadata.cost === 'low_cost' && '⚡'}
              {message.metadata.cost === 'free' && '🆓'}
            </span>
          )}
        </div>
      </div>

      {message.role === 'user' && (
        <div className='w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0'>
          <Icon name='user' className='w-4 h-4 text-primary' />
        </div>
      )}
    </motion.div>
  );

  const renderTypingIndicator = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className='flex gap-3 mb-6'
    >
      <div className='w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0'>
        <Icon name='bot' className='w-4 h-4 text-primary' />
      </div>
      <div className='bg-muted p-4 rounded-lg'>
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
      {/* Proactive Intervention Notification */}
      <AnimatePresence>
        {showProactiveIntervention && currentIntervention && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className='bg-primary/10 border-b border-primary/20 p-3'
          >
            <div className='flex items-start gap-2'>
              <Icon
                name='sparkles'
                className='w-4 h-4 text-primary mt-1 flex-shrink-0'
              />
              <div className='flex-1'>
                <p className='text-sm text-foreground mb-2'>
                  {currentIntervention.message}
                </p>
                {currentIntervention.actions && (
                  <div className='flex flex-wrap gap-2'>
                    {currentIntervention.actions.map(action => (
                      <Button
                        key={action.action}
                        size='sm'
                        variant={
                          action.action === 'dismiss' ? 'ghost' : 'secondary'
                        }
                        onClick={() => handleProactiveAction(action.action)}
                        className='text-xs'
                      >
                        {action.icon && (
                          <Icon
                            name={action.icon as 'sparkles'}
                            className='w-3 h-3 mr-1'
                          />
                        )}
                        {action.text}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center'>
            <Icon name='bot' className='w-5 h-5 text-primary' />
          </div>
          <div>
            <h3 className='font-semibold'>Sofia</h3>
            <p className='text-sm text-muted-foreground'>
              {(memoryServiceRef.current?.getConversationInsights()
                ?.totalConversations || 0) > 0
                ? 'Welcome back! I remember you.'
                : 'Your digital guide'}
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
            <Icon name='x' className='w-4 h-4' />
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

      {/* Input - simplified, actions are primary */}
      <div className='p-4 border-t bg-background'>
        <form onSubmit={handleTextInput} className='flex gap-2'>
          <Input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder='Or type your own question...'
            disabled={isProcessing}
            className='flex-1 text-sm'
          />
          <Button
            type='submit'
            disabled={!inputValue.trim() || isProcessing}
            size='sm'
            variant='outline'
          >
            {isProcessing ? (
              <Icon name='loader-2' className='w-4 h-4 animate-spin' />
            ) : (
              <Icon name='send' className='w-4 h-4' />
            )}
          </Button>
        </form>

        <p className='text-xs text-muted-foreground mt-2 text-center'>
          Tip: Use the buttons above for the fastest responses 🚀
        </p>
      </div>
    </div>
  );

  // Render variants
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
          className={`fixed bottom-4 right-4 w-96 h-[600px] z-50 ${className}`}
        >
          <Card className='h-full shadow-lg border-primary/20'>
            {chatContent}
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SofiaChatV2;
