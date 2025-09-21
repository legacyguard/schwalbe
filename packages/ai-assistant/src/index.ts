import { contextService } from './services/contextService';
import { personalityService } from './services/personalityService';

export { contextService, personalityService };

// Re-export types
export type {
  UserContext,
  ChatMessage,
  Action,
  KnowledgeBaseEntry,
  PersonalityConfig,
  SofiaResponse,
  ContextService,
  PersonalityService,
  ChatService
} from './types/index';

// Simple chat service implementation
export class SimpleChatService {
  private conversations = new Map<string, import('./types/index').ChatMessage[]>();

  async sendMessage(message: string, sessionId: string): Promise<import('./types/index').ChatMessage> {
    const context = await contextService.getUserContext(sessionId);
    const knowledge = await contextService.getRelevantKnowledge(message, context);
    const response = await personalityService.generateResponse(message, context, knowledge);

    const userMessage: import('./types/index').ChatMessage = {
      id: `msg_${Date.now()}_${Math.random()}`,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    const assistantMessage: import('./types/index').ChatMessage = {
      id: `msg_${Date.now()}_${Math.random()}`,
      role: 'assistant',
      content: response.message,
      timestamp: new Date().toISOString(),
      metadata: {
        suggestedActions: response.actions
      }
    };

    // Store conversation
    const conversation = this.conversations.get(sessionId) || [];
    conversation.push(userMessage, assistantMessage);
    this.conversations.set(sessionId, conversation);

    return assistantMessage;
  }

  async getConversationHistory(sessionId: string, limit = 50): Promise<import('./types/index').ChatMessage[]> {
    const conversation = this.conversations.get(sessionId) || [];
    return conversation.slice(-limit);
  }

  async clearConversation(sessionId: string): Promise<void> {
    this.conversations.delete(sessionId);
  }
}

export const chatService = new SimpleChatService();
