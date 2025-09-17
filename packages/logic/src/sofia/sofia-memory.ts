/**
 * Sofia Memory Service
 * Enhanced memory capabilities for Sofia AI Assistant
 * Remembers conversations, user preferences, and provides contextual continuity
 */

import type { SofiaContext, SofiaMessage } from './sofia-types';

import { logger } from '@schwalbe/shared/lib/logger';
export interface ConversationMemory {
  importantContext: Record<string, any>;
  lastActions: string[];
  lastConversationDate: Date;
  lastConversationId: string;
  lastTopic: string;
  unfinishedTasks: string[];
}

export interface SofiaMemoryState {
  conversations: ConversationMemory[];
  lastInteractionDate: Date | null;
  learningNotes: string[];
  userPreferences: Record<string, any>;
}

export class SofiaMemoryService {
  private ___userId: string;
  private storageKey: string;
  private memoryState: SofiaMemoryState;

  constructor(userId: string) {
    this.___userId = userId;
    this.storageKey = `sofia_memory_${userId}`;
    this.memoryState = this.loadMemory();
  }

  /**
   * Load memory from localStorage
   */
  private loadMemory(): SofiaMemoryState {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        if (parsed.lastInteractionDate) {
          parsed.lastInteractionDate = new Date(parsed.lastInteractionDate);
        }
        if (parsed.conversations) {
          parsed.conversations = parsed.conversations.map((conv: any) => ({
            ...conv,
            lastConversationDate: new Date(conv.lastConversationDate),
          }));
        }
        return parsed;
      }
    } catch (error) {
      logger.error('Failed to load Sofia memory:', error);
    }

    return {
      conversations: [],
      userPreferences: {},
      learningNotes: [],
      lastInteractionDate: null,
    };
  }

  /**
   * Save memory to localStorage
   */
  private saveMemory(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.memoryState));
    } catch (error) {
      logger.error('Failed to save Sofia memory:', error);
    }
  }

  /**
   * Remember a conversation
   */
  rememberConversation(
    messages: SofiaMessage[],
    topic?: string,
    unfinishedTasks?: string[]
  ): void {
    if (messages.length === 0) return;

    const lastUserMessages = messages
      .filter(m => m.role === 'user')
      .slice(-3)
      .map(m => m.content);

    const lastActions = messages
      .filter(m => m.actions && m.actions.length > 0)
      .flatMap(m => m.actions?.map(a => a.text) || [])
      .slice(-5);

    const memory: ConversationMemory = {
      lastConversationId: crypto.randomUUID(),
      lastConversationDate: new Date(),
      lastTopic: topic || this.extractTopic(messages),
      lastActions,
      unfinishedTasks: unfinishedTasks || [],
      importantContext: {
        messageCount: messages.length,
        lastUserQuery: lastUserMessages[lastUserMessages.length - 1] || '',
        documentsMentioned: this.extractDocumentReferences(messages),
      },
    };

    // Keep only last 10 conversations
    this.memoryState.conversations = [
      memory,
      ...this.memoryState.conversations.slice(0, 9),
    ];

    this.memoryState.lastInteractionDate = new Date();
    this.saveMemory();
  }

  /**
   * Get a welcome back message based on memory
   */
  getWelcomeBackMessage(context: SofiaContext): string {
    const lastConversation = this.memoryState.conversations[0];
    const lastInteraction = this.memoryState.lastInteractionDate;

    if (!lastConversation || !lastInteraction) {
      return `Hello ${context.userName || 'there'}! I'm here to help you protect what matters most. What would you like to work on today?`;
    }

    const hoursSinceLastInteraction =
      (Date.now() - lastInteraction.getTime()) / (1000 * 60 * 60);

    // Different messages based on time elapsed
    if (hoursSinceLastInteraction < 1) {
      // Less than an hour ago
      return `Welcome back, ${context.userName || 'there'}! We were just discussing ${lastConversation.lastTopic}. Would you like to continue where we left off?`;
    } else if (hoursSinceLastInteraction < 24) {
      // Same day
      return `Good to see you again, ${context.userName || 'there'}! Earlier today we talked about ${lastConversation.lastTopic}. How can I help you now?`;
    } else if (hoursSinceLastInteraction < 168) {
      // Within a week
      const daysAgo = Math.floor(hoursSinceLastInteraction / 24);
      return `Hello ${context.userName || 'there'}! It's been ${daysAgo} day${daysAgo > 1 ? 's' : ''} since we last spoke about ${lastConversation.lastTopic}. What would you like to focus on today?`;
    } else {
      // More than a week
      return `Welcome back, ${context.userName || 'there'}! It's been a while since our last conversation. I see you've made progress with ${context.documentCount} documents secured. How can I assist you today?`;
    }
  }

  /**
   * Check if there are unfinished tasks from last conversation
   */
  getUnfinishedTasks(): string[] {
    const lastConversation = this.memoryState.conversations[0];
    return lastConversation?.unfinishedTasks || [];
  }

  /**
   * Add a learning note about the user
   */
  addLearningNote(note: string): void {
    this.memoryState.learningNotes = [
      note,
      ...this.memoryState.learningNotes.slice(0, 49), // Keep last 50 notes
    ];
    this.saveMemory();
  }

  /**
   * Update user preferences
   */
  updateUserPreference(key: string, value: any): void {
    this.memoryState.userPreferences[key] = value;
    this.saveMemory();
  }

  /**
   * Get user preference
   */
  getUserPreference(key: string): any {
    return this.memoryState.userPreferences[key];
  }

  /**
   * Extract topic from messages
   */
  private extractTopic(messages: SofiaMessage[]): string {
    const lastUserMessages = messages.filter(m => m.role === 'user').slice(-3);

    if (lastUserMessages.length === 0) {
      return 'general assistance';
    }

    const lastMessage =
      lastUserMessages[lastUserMessages.length - 1].content.toLowerCase();

    // Topic detection based on keywords
    if (lastMessage.includes('document') || lastMessage.includes('upload')) {
      return 'document management';
    } else if (
      lastMessage.includes('guardian') ||
      lastMessage.includes('trust')
    ) {
      return 'guardian setup';
    } else if (lastMessage.includes('will') || lastMessage.includes('legacy')) {
      return 'legacy planning';
    } else if (
      lastMessage.includes('security') ||
      lastMessage.includes('privacy')
    ) {
      return 'security and privacy';
    } else if (lastMessage.includes('help') || lastMessage.includes('how')) {
      return 'getting help';
    } else {
      return 'your family protection';
    }
  }

  /**
   * Extract document references from conversation
   */
  private extractDocumentReferences(messages: SofiaMessage[]): string[] {
    const documentKeywords = [
      'passport',
      'insurance',
      'will',
      'birth certificate',
      'marriage certificate',
      'bank',
      'medical',
      'property',
      'tax',
      'contract',
      'deed',
      'title',
    ];

    const references: Set<string> = new Set();

    messages.forEach(msg => {
      const content = msg.content.toLowerCase();
      documentKeywords.forEach(keyword => {
        if (content.includes(keyword)) {
          references.add(keyword);
        }
      });
    });

    return Array.from(references);
  }

  /**
   * Get conversation insights
   */
  getConversationInsights(): {
    commonTopics: string[];
    frequentActions: string[];
    lastInteraction: Date | null;
    totalConversations: number;
  } {
    const topics = this.memoryState.conversations.map(c => c.lastTopic);
    const topicCounts = topics.reduce(
      (acc, topic) => {
        acc[topic] = (acc[topic] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const commonTopics = Object.entries(topicCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([topic]) => topic);

    const allActions = this.memoryState.conversations.flatMap(
      c => c.lastActions
    );
    const actionCounts = allActions.reduce(
      (acc, action) => {
        acc[action] = (acc[action] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const frequentActions = Object.entries(actionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([action]) => action);

    return {
      totalConversations: this.memoryState.conversations.length,
      commonTopics,
      lastInteraction: this.memoryState.lastInteractionDate,
      frequentActions,
    };
  }

  /**
   * Clear all memory (for privacy/reset)
   */
  clearMemory(): void {
    this.memoryState = {
      conversations: [],
      userPreferences: {},
      learningNotes: [],
      lastInteractionDate: null,
    };
    localStorage.removeItem(this.storageKey);
  }
}

// Singleton instance manager
const memoryInstances: Map<string, SofiaMemoryService> = new Map();

export function getSofiaMemory(userId: string): SofiaMemoryService {
  if (!memoryInstances.has(userId)) {
    memoryInstances.set(userId, new SofiaMemoryService(userId));
  }
  return memoryInstances.get(userId)!;
}