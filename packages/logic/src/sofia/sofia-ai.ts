// Sofia AI Assistant - The heart of Schwalbe
// Provides intelligent, contextual guidance for users
// Now uses secure server-side API to protect OpenAI API keys

export interface SofiaMessage {
  // Enhanced properties for UI interactions
  actions?: ActionButton[];
  content: string;
  context?: {
    completionPercentage?: number;
    currentStep?: string;
    documentCount?: number;
    guardianCount?: number;
    userPreferences?: {
      familyStatus?:
        | 'business'
        | 'family'
        | 'parent_care'
        | 'partner'
        | 'single';
      language?: string;
    };
  };
  id: string;
  message?: string; // Additional message content for complex responses
  role: 'assistant' | 'user';
  route?: string;
  timestamp: Date;
}

// Action button interface for Sofia AI responses
export interface ActionButton {
  category: 'ai_query' | 'navigation' | 'premium_feature' | 'ui_action';
  cost: 'free' | 'low_cost' | 'premium';
  description?: string;
  icon?: string;
  id: string;
  payload?: any;
  requiresConfirmation?: boolean;
  text: string;
}

export interface SofiaContext {
  completionPercentage: number;
  documentCount: number;
  familyStatus: 'business' | 'family' | 'parent_care' | 'partner' | 'single';
  guardianCount: number;
  language: string;
  // Path of Serenity milestone data
  milestoneProgress?: {
    categoriesWithDocuments?: string[];
    hasExpiryTracking?: boolean;
    nextMilestone?: string;
    totalMilestones: number;
    unlockedCount: number;
  };
  recentActivity: string[];
  userId: string;
  userName?: string;
}

class SofiaAI {
  private supabaseUrl: string;
  private initialized = false;

  constructor() {
    this.supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || '';
    this.initialized = !!this.supabaseUrl;

    if (!this.initialized) {
      console.warn('Supabase URL not found. Sofia will use mock responses.');
    }
  }

  private getMockResponse(message: string, context: SofiaContext): string {
    const responses = {
      greeting: [
        `Hello ${context.userName || 'there'}! I'm Sofia, your digital family guardian. I see you've uploaded ${context.documentCount} documents - that's a great start! How can I help you protect your family today?`,
        `Welcome back! I noticed you're ${context.completionPercentage}% complete with your family protection plan. What would you like to work on next?`,
      ],
      documents: [
        "Excellent! Every document you upload is another layer of protection for your family. Based on what you have, I'd recommend adding your insurance policies next - they're often crucial in emergencies.",
        "I love seeing your progress! With your current documents, you're building a solid foundation. Have you considered adding contact information for your important service providers?",
      ],
      guardians: [
        'Setting up guardians shows such thoughtful care for your family. The people you trust will be able to help when it matters most. Would you like to add another guardian or set up specific access permissions?',
        "Your guardian network is growing - that's wonderful! Remember, each guardian you add makes your family's protection stronger.",
      ],
      general: [
        "I'm here to help you every step of the way. What's on your mind today?",
        `You're doing amazing work protecting your family, ${context.userName || 'there'}. How can I assist you further?`,
        "Every small step you take today makes a big difference for your family's future. What shall we focus on?",
      ],
    };

    // Simple keyword matching for mock responses
    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes('hello') ||
      lowerMessage.includes('hi') ||
      lowerMessage.includes('hey')
    ) {
      return responses.greeting[
        Math.floor(Math.random() * responses.greeting.length)
      ];
    }
    if (
      lowerMessage.includes('document') ||
      lowerMessage.includes('upload') ||
      lowerMessage.includes('file')
    ) {
      return responses.documents[
        Math.floor(Math.random() * responses.documents.length)
      ];
    }
    if (
      lowerMessage.includes('guardian') ||
      lowerMessage.includes('family') ||
      lowerMessage.includes('emergency')
    ) {
      return responses.guardians[
        Math.floor(Math.random() * responses.guardians.length)
      ];
    }

    return responses.general[
      Math.floor(Math.random() * responses.general.length)
    ];
  }

  async generateResponse(
    message: string,
    context: SofiaContext,
    conversationHistory: SofiaMessage[] = []
  ): Promise<string> {
    // If Supabase is not available, use mock responses
    if (!this.initialized || !this.supabaseUrl) {
      return this.getMockResponse(message, context);
    }

    try {
      // console.log(
      //   'Calling Sofia AI API:',
      //   `${this.supabaseUrl}/functions/v1/sofia-ai`
      // );

      // Call the secure server-side Sofia AI API
      const response = await fetch(
        `${this.supabaseUrl}/functions/v1/sofia-ai-guided`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env?.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            action: 'generate_response',
            data: {
              message,
              context,
              conversationHistory,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Sofia AI API error:', response.status, errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      return (
        result.response ||
        "I apologize, but I'm having trouble responding right now. Please try again."
      );
    } catch (error) {
      console.error('Error generating Sofia response:', error);
      // console.log('Falling back to mock response');
      return this.getMockResponse(message, context);
    }
  }

  // Generate proactive suggestions based on user context
  async generateProactiveSuggestion(
    context: SofiaContext
  ): Promise<null | string> {
    if (!this.initialized || !this.supabaseUrl) {
      return this.getMockProactiveSuggestion(context);
    }

    try {
      const response = await fetch(
        `${this.supabaseUrl}/functions/v1/sofia-ai-guided`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env?.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            action: 'generate_suggestion',
            data: { context },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      return result.suggestion;
    } catch (error) {
      console.error('Error generating proactive suggestion:', error);
      return this.getMockProactiveSuggestion(context);
    }
  }

  private getMockProactiveSuggestion(context: SofiaContext): null | string {
    const { documentCount, guardianCount, completionPercentage, familyStatus } =
      context;

    // Early stage suggestions
    if (documentCount === 0) {
      return "Ready to get started? I recommend uploading your ID document first - it's quick and helps establish your digital identity.";
    }

    if (documentCount >= 1 && documentCount < 5) {
      return `Great progress with ${documentCount} document${documentCount > 1 ? 's' : ''}! Next, I suggest adding your insurance documents - they're crucial for family protection.`;
    }

    // Guardian suggestions
    if (
      documentCount >= 5 &&
      guardianCount === 0 &&
      familyStatus !== 'single'
    ) {
      return "With your documents organized, it's time to set up your Circle of Trust. Adding guardians ensures your family can access what they need in emergencies.";
    }

    // Will creation suggestions
    if (
      documentCount >= 10 &&
      guardianCount >= 1 &&
      completionPercentage < 60
    ) {
      return "You've built a solid foundation! Ready to create your will? I'll guide you through a simple, 7-step process that focuses on protecting your loved ones.";
    }

    return null;
  }

  // Get contextual help based on current page/action
  async getContextualHelp(
    page: string,
    context: SofiaContext
  ): Promise<string> {
    if (!this.initialized || !this.supabaseUrl) {
      return this.getMockContextualHelp(page, context);
    }

    try {
      const response = await fetch(
        `${this.supabaseUrl}/functions/v1/sofia-ai-guided`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env?.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            action: 'get_contextual_help',
            data: { page, context },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      return result.help;
    } catch (error) {
      console.error('Error getting contextual help:', error);
      return this.getMockContextualHelp(page, context);
    }
  }

  private getMockContextualHelp(page: string, context: SofiaContext): string {
    const milestones = context.milestoneProgress;

    switch (page) {
      case 'onboarding':
        return `Welcome to Schwalbe, ${context.userName || 'there'}! I'm Sofia, and I'll be your guide. This journey is about creating peace of mind for you and protection for your family. Take your time - I'm here to help every step of the way.`;

      case 'vault':
        if (milestones && context.documentCount === 0) {
          return `Hello ${context.userName || 'there'}! I see you're ready to begin your Path of Peace. Your first milestone awaits - the Foundation Stone of Security. Upload your first important document and take that meaningful first step toward protecting your family.`;
        } else if (milestones && milestones.unlockedCount > 0) {
          return `Hello ${context.userName || 'there'}! Your Path of Peace looks wonderful - you've unlocked ${milestones.unlockedCount} milestone${milestones.unlockedCount > 1 ? 's' : ''} already! ${context.documentCount > 0 ? `You've secured ${context.documentCount} documents, which shows real dedication to your family's security.` : ''} What would you like to work on next?`;
        }
        return `Your Vault is where all your important documents live, safely encrypted. ${context.documentCount > 0 ? `You've already secured ${context.documentCount} documents - excellent work!` : 'Ready to add your first document?'} I can help you decide what to upload next.`;

      case 'guardians':
        if (
          milestones &&
          context.guardianCount === 0 &&
          context.documentCount > 0
        ) {
          return `Hello ${context.userName || 'there'}! You've made excellent progress on your Path of Peace. Now it's time to create your Circle of Trust - the people who can help your family when you can't. This is one of the most meaningful steps you can take.`;
        } else if (milestones && milestones.unlockedCount > 0) {
          return `Hello ${context.userName || 'there'}! Your Path of Peace shows ${milestones.unlockedCount} unlocked milestones - you're doing amazingly well! ${context.guardianCount > 0 ? `Your Circle of Trust with ${context.guardianCount} guardian${context.guardianCount > 1 ? 's' : ''} brings such peace of mind.` : 'Adding guardians is the next beautiful step in protecting your family.'} What would you like to focus on today?`;
        }
        return `Your Circle of Trust is about the people who matter most. ${context.guardianCount > 0 ? `You've trusted ${context.guardianCount} guardian${context.guardianCount > 1 ? 's' : ''} - that shows real care for your family.` : "Guardians are the people who can help your family when you can't."} Each person you add strengthens your family's protection.`;

      case 'legacy':
        if (milestones && milestones.unlockedCount >= 5) {
          return `Hello ${context.userName || 'there'}! With ${milestones.unlockedCount} milestones on your Path of Peace, you've built something truly meaningful. The Legacy section is where your love becomes eternal - creating messages and wishes that will guide your family long into the future.`;
        }
        return "Your Legacy section is where love becomes action - creating wills, recording messages, and sharing your wishes. This isn't about endings; it's about making sure your care continues.";

      default:
        if (milestones && milestones.unlockedCount === 0) {
          return `Hello ${context.userName || 'there'}! I'm here to help you begin your Path of Peace. Every journey starts with a single step, and yours will be the Foundation Stone of Security. Ready when you are - I'll guide you every step of the way.`;
        } else if (milestones && milestones.unlockedCount > 0) {
          return `Hello ${context.userName || 'there'}! Your Path of Peace is beautiful - ${milestones.unlockedCount} milestone${milestones.unlockedCount > 1 ? 's' : ''} unlocked! Each step you've taken brings deeper security and peace of mind to your family. What would you like to focus on today?`;
        }
        return `I'm here to help you protect what matters most. With ${context.completionPercentage}% of your family protection complete, you're already making a real difference. What would you like to work on today?`;
    }
  }
}

// Export singleton instance
export const sofiaAI = new SofiaAI();

// Utility functions for managing Sofia conversations
export function createSofiaMessage(
  role: 'assistant' | 'user',
  content: string,
  context?: SofiaMessage['context']
): SofiaMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    timestamp: new Date(),
    context,
  };
}

export function getStoredConversation(userId: string): SofiaMessage[] {
  try {
    const stored = localStorage.getItem(`sofia_conversation_${userId}`);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return parsed.map((msg: { timestamp: string }) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }));
  } catch (error) {
    console.error('Error loading Sofia conversation:', error);
    return [];
  }
}

export function saveConversation(userId: string, messages: SofiaMessage[]) {
  try {
    // Keep only last 50 messages to prevent storage bloat
    const messagesToSave = messages.slice(-50);
    localStorage.setItem(
      `sofia_conversation_${userId}`,
      JSON.stringify(messagesToSave)
    );
  } catch (error) {
    console.error('Error saving Sofia conversation:', error);
  }
}