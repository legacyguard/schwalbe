/**
 * Optimized SOFIA Chat Component
 * Implements cost-optimized AI routing with action buttons and smart UX
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Send,
  Loader2,
  Sparkles,
  Zap,
  DollarSign,
  Clock,
  TrendingDown,
  MessageSquare,
  Home,
  FileText,
  Users,
  Shield,
  Settings,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  sofiaRouter,
  type RouterRequest,
  type RouterResponse,
  type SofiaAction,
} from '@/packages/shared/src/services/sofia/sofia-router';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'sofia';
  timestamp: Date;
  type?: 'free' | 'low_cost' | 'premium';
  cost?: number;
  confidence?: number;
  source?: string;
  actions?: SofiaAction[];
}

interface OptimizedSofiaChatProps {
  userId?: string;
  sessionId?: string;
  currentPage?: string;
  context?: any;
  showMetrics?: boolean;
  className?: string;
}

export function OptimizedSofiaChat({
  userId,
  sessionId,
  currentPage,
  context,
  showMetrics = true,
  className,
}: OptimizedSofiaChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Welcome message with smart suggestions
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      content: 'Hello! I\'m SOFIA, your AI assistant for family protection. I can help you organize documents, manage family data, and answer questions. Choose an action or ask me anything.',
      sender: 'sofia',
      timestamp: new Date(),
      type: 'free',
      cost: 0,
      confidence: 1,
      source: 'welcome',
      actions: getContextualActions(currentPage),
    };

    setMessages([welcomeMessage]);
  }, [currentPage]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Get contextual action suggestions based on current page
   */
  function getContextualActions(page?: string): SofiaAction[] {
    const baseActions: SofiaAction[] = [
      { type: 'navigate', label: 'Add Document', action: '/documents/add', icon: '📄' },
      { type: 'navigate', label: 'Invite Guardian', action: '/family/invite', icon: '👥' },
      { type: 'navigate', label: 'View Analytics', action: '/analytics', icon: '📊' },
      { type: 'help', label: 'FAQ', action: 'show_faq', icon: '❓' },
    ];

    // Add context-specific actions
    if (page?.includes('/documents')) {
      baseActions.unshift(
        { type: 'execute', label: 'Gmail Import', action: 'open_gmail_import', icon: '📧' },
        { type: 'execute', label: 'Scan Document', action: 'scan_document', icon: '📱' }
      );
    } else if (page?.includes('/family')) {
      baseActions.unshift(
        { type: 'execute', label: 'Family Tree', action: 'view_family_tree', icon: '🌳' },
        { type: 'navigate', label: 'Emergency Contacts', action: '/family/emergency', icon: '🚨' }
      );
    } else if (page?.includes('/analytics')) {
      baseActions.unshift(
        { type: 'execute', label: 'Export Report', action: 'export_report', icon: '📤' },
        { type: 'navigate', label: 'Protection Score', action: '/analytics/protection', icon: '🛡️' }
      );
    }

    return baseActions.slice(0, 6); // Limit to 6 actions
  }

  /**
   * Handle message submission with cost optimization
   */
  const handleSubmit = useCallback(async (message?: string) => {
    const messageToSend = message || inputValue.trim();
    if (!messageToSend || isLoading) return;

    setIsLoading(true);
    setInputValue('');
    setShowSuggestions(false);

    // Add user message
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      content: messageToSend,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Create router request
      const request: RouterRequest = {
        message: messageToSend,
        userId,
        sessionId,
        context: {
          currentPage,
          ...context,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'chat',
        },
      };

      // Route through cost optimizer
      const response = await sofiaRouter.route(request);

      // Add SOFIA response
      const sofiaMessage: ChatMessage = {
        id: `sofia_${Date.now()}`,
        content: response.content,
        sender: 'sofia',
        timestamp: new Date(),
        type: response.type,
        cost: response.cost,
        confidence: response.confidence,
        source: response.source,
        actions: response.actions,
      };

      setMessages(prev => [...prev, sofiaMessage]);

    } catch (error) {
      console.error('Chat error:', error);

      // Fallback message
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        content: 'I apologize, an error occurred. Please try again or use one of the default actions.',
        sender: 'sofia',
        timestamp: new Date(),
        type: 'free',
        cost: 0,
        confidence: 0.3,
        source: 'error',
        actions: getContextualActions(currentPage),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, userId, sessionId, currentPage, context]);

  /**
   * Handle action button click
   */
  const handleActionClick = useCallback(async (action: SofiaAction) => {
    switch (action.type) {
      case 'navigate':
        if (typeof window !== 'undefined') {
          window.location.href = action.action;
        }
        break;

      case 'execute':
        // Handle execute actions
        await handleExecuteAction(action);
        break;

      case 'form_fill':
        // Handle form filling
        await handleFormFill(action);
        break;

      case 'help':
        // Handle help actions
        await handleHelpAction(action);
        break;

      default:
        console.warn('Unknown action type:', action.type);
    }
  }, []);

  /**
   * Handle execute actions
   */
  const handleExecuteAction = useCallback(async (action: SofiaAction) => {
    const executionMap: Record<string, () => void> = {
      open_gmail_import: () => {
        // Trigger Gmail import dialog
        const event = new CustomEvent('open-gmail-import');
        window.dispatchEvent(event);
      },
      scan_document: () => {
        // Trigger document scanner
        const event = new CustomEvent('open-document-scanner');
        window.dispatchEvent(event);
      },
      view_family_tree: () => {
        // Show family tree modal
        const event = new CustomEvent('show-family-tree');
        window.dispatchEvent(event);
      },
      activate_emergency: () => {
        // Activate emergency protocol
        const event = new CustomEvent('activate-emergency-protocol');
        window.dispatchEvent(event);
      },
      show_emergency_contacts: () => {
        // Show emergency contacts
        const event = new CustomEvent('show-emergency-contacts');
        window.dispatchEvent(event);
      },
      export_report: () => {
        // Trigger report export
        const event = new CustomEvent('export-analytics-report');
        window.dispatchEvent(event);
      },
      show_upgrade_dialog: () => {
        // Show upgrade dialog
        const event = new CustomEvent('show-upgrade-dialog');
        window.dispatchEvent(event);
      },
    };

    const executor = executionMap[action.action];
    if (executor) {
      executor();

      // Add confirmation message
      const confirmationMessage: ChatMessage = {
        id: `confirm_${Date.now()}`,
        content: `✅ Action "${action.label}" has been executed.`,
        sender: 'sofia',
        timestamp: new Date(),
        type: 'free',
        cost: 0,
        confidence: 1,
        source: 'action_execution',
      };

      setMessages(prev => [...prev, confirmationMessage]);
    }
  }, []);

  /**
   * Handle form filling actions
   */
  const handleFormFill = useCallback(async (action: SofiaAction) => {
    // Implementation for form filling assistance
    console.log('Form fill action:', action);
  }, []);

  /**
   * Handle help actions
   */
  const handleHelpAction = useCallback(async (action: SofiaAction) => {
    if (action.action === 'show_faq') {
      const faqMessage = `Frequently Asked Questions:

1. **How do I add a document?**
   Click "Add Document" or use Gmail import.

2. **How do I invite a guardian?**
   Go to "Family Management" and click "Invite Member".

3. **Is my account secure?**
   Yes, we use state-of-the-art encryption and GDPR compliance.

4. **How much does it cost?**
   Basic plan is free, premium plans start from €9.99/month.

5. **What to do in an emergency?**
   Activate emergency protocol or contact 112.`;

      const faqResponse: ChatMessage = {
        id: `faq_${Date.now()}`,
        content: faqMessage,
        sender: 'sofia',
        timestamp: new Date(),
        type: 'free',
        cost: 0,
        confidence: 1,
        source: 'faq',
        actions: [
          { type: 'navigate', label: 'Complete Help', action: '/help', icon: '📚' },
          { type: 'navigate', label: 'Contact Support', action: '/contact', icon: '💬' }
        ]
      };

      setMessages(prev => [...prev, faqResponse]);
    }
  }, []);

  /**
   * Get cost indicator color
   */
  const getCostColor = (type?: string) => {
    switch (type) {
      case 'free': return 'text-green-600';
      case 'low_cost': return 'text-yellow-600';
      case 'premium': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  /**
   * Get cost indicator icon
   */
  const getCostIcon = (type?: string) => {
    switch (type) {
      case 'free': return <Zap className="h-3 w-3" />;
      case 'low_cost': return <Clock className="h-3 w-3" />;
      case 'premium': return <Sparkles className="h-3 w-3" />;
      default: return <MessageSquare className="h-3 w-3" />;
    }
  };

  return (
    <div className={`flex flex-col h-full max-w-4xl mx-auto ${className}`}>
      {/* Header with metrics */}
      {showMetrics && <ChatMetricsHeader />}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border shadow-sm'
                }`}
              >
                {/* Message content */}
                <div className="whitespace-pre-wrap">{message.content}</div>

                {/* Cost and confidence indicators for SOFIA messages */}
                {message.sender === 'sofia' && (
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <div className={`flex items-center gap-1 ${getCostColor(message.type)}`}>
                      {getCostIcon(message.type)}
                      <span>
                        {message.type === 'free' && 'Free'}
                        {message.type === 'low_cost' && 'Low Cost'}
                        {message.type === 'premium' && 'Premium'}
                      </span>
                    </div>
                    {message.confidence && (
                      <Badge variant="outline" className="text-xs">
                        {Math.round(message.confidence * 100)}% confidence
                      </Badge>
                    )}
                    {message.cost && message.cost > 0 && (
                      <span className="text-muted-foreground">
                        ~${message.cost.toFixed(3)}
                      </span>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                {message.actions && message.actions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {message.actions.map((action, index) => (
                      <Button
                        key={index}
                        size="sm"
                        variant="outline"
                        onClick={() => handleActionClick(action)}
                        className="text-xs h-8"
                      >
                        <span className="mr-1">{action.icon}</span>
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Timestamp */}
                <div className="text-xs text-muted-foreground mt-2">
                  {message.timestamp.toLocaleTimeString('sk-SK', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white border shadow-sm rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>SOFIA is thinking...</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick suggestions */}
      {showSuggestions && (
        <div className="p-4 border-t bg-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {getContextualActions(currentPage).slice(0, 6).map((action, index) => (
              <Button
                key={index}
                size="sm"
                variant="outline"
                onClick={() => handleActionClick(action)}
                className="justify-start text-xs h-8 bg-white"
              >
                <span className="mr-1">{action.icon}</span>
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me anything or use the buttons above..."
            className="flex-1 min-h-[44px] max-h-32 resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <Button
            onClick={() => handleSubmit()}
            disabled={!inputValue.trim() || isLoading}
            size="sm"
            className="h-11 px-4"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>
            <Zap className="h-3 w-3 inline mr-1" />
            Most responses are free thanks to intelligent optimization
          </span>
          <span className="flex items-center gap-1">
            <TrendingDown className="h-3 w-3" />
            AI costs optimized
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Chat metrics header component
 */
function ChatMetricsHeader() {
  const [metrics, setMetrics] = useState(sofiaRouter.getMetrics());

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(sofiaRouter.getMetrics());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="m-4 mb-0">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="font-medium">Costs optimized</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Free: {metrics.costDistribution.free}%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Low: {metrics.costDistribution.lowCost}%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Premium: {metrics.costDistribution.premium}%</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Cache hit: {Math.round(metrics.cacheHitRate * 100)}% |
            Total: ${metrics.totalCost.toFixed(3)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}