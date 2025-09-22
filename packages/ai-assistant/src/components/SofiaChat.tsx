import React, { useState, useRef, useEffect } from 'react';
import { chatService, Action, ChatMessage } from '../index';

interface SofiaChatProps {
  sessionId: string;
  onAction?: (action: Action) => void;
  className?: string;
  t?: (key: string, defaultValue?: string) => string;
}

export function SofiaChat({ sessionId, onAction, className = '', t = (key, defaultValue) => defaultValue || key }: SofiaChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load conversation history on mount
    chatService.getConversationHistory(sessionId).then(setMessages);
  }, [sessionId]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    try {
      await chatService.sendMessage(userMessage, sessionId);
      const updatedHistory = await chatService.getConversationHistory(sessionId);
      setMessages(updatedHistory);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Add error message
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: t('chat.error', 'Sorry, I encountered an error. Please try again.'),
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleActionClick = (action: Action) => {
    onAction?.(action);
  };

  return (
    <div className={`flex flex-col h-full bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
            <span className="text-yellow-600 text-sm">🤖</span>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Sofia</h3>
            <p className="text-sm text-gray-500">
              {t('chat.status', 'Your legacy planning assistant')}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs text-gray-500">
            {t('chat.online', 'Online')}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👋</span>
            </div>
            <h4 className="font-medium mb-2">
              {t('chat.welcome.title', 'Hi! I\'m Sofia')}
            </h4>
            <p className="text-sm">
              {t('chat.welcome.message', 'I\'m here to help you with your legacy planning. What would you like to know?')}
            </p>
          </div>
        )}

        {messages.map(message => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              message.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}>
              <p className="text-sm">{message.content}</p>

              {/* Action buttons */}
              {message.metadata?.suggestedActions && message.metadata.suggestedActions.length > 0 && (
                <div className="mt-3 space-y-2">
                  {message.metadata.suggestedActions.map(action => (
                    <button
                      key={action.id}
                      onClick={() => handleActionClick(action)}
                      className="w-full text-left px-3 py-2 text-xs bg-white/10 hover:bg-white/20 rounded border border-white/20 transition-colors"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-500">
                  {t('chat.typing', 'Sofia is typing...')}
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('chat.placeholder', 'Ask Sofia anything about legacy planning...')}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {t('chat.send', 'Send')}
          </button>
        </div>
      </div>
    </div>
  );
}