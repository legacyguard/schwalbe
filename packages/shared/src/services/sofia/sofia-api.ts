// Sofia API Handler - Secure OpenAI Communication via Supabase Edge Function
// This uses the secure server-side Edge Function to protect API keys

import type { SofiaContext, SofiaMessage } from '@schwalbe/logic';

interface SofiaAPIRequest {
  context: SofiaContext;
  conversationHistory?: SofiaMessage[];
  prompt: string;
  requestType: 'knowledge_lookup' | 'premium_generation' | 'simple_query';
}

interface SofiaAPIResponse {
  cost: 'free' | 'low_cost' | 'premium';
  error?: string;
  response?: string;
  success: boolean;
  tokensUsed?: number;
}

class SofiaAPI {
  private supabaseUrl: string;
  private supabaseKey: string;
  private initialized = false;

  constructor() {
    this.supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || '';
    this.supabaseKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

    this.initialized = !!(this.supabaseUrl && this.supabaseKey);

    if (this.initialized) {
      // console.log('[Sofia API] Initialized with Supabase Edge Function');
    } else {
      console.warn(
        '[Sofia API] Supabase credentials not found. Using mock responses only.'
      );
    }
  }

  /**
   * Process simple queries (Category 2: Low cost)
   * Used for knowledge base searches and simple Q&A
   */
  async processSimpleQuery(
    request: SofiaAPIRequest
  ): Promise<SofiaAPIResponse> {
    if (!this.initialized) {
      return this.getMockResponse(request);
    }

    try {
      const response = await fetch(
        `${this.supabaseUrl}/functions/v1/sofia-ai-guided`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.supabaseKey}`,
          },
          body: JSON.stringify({
            action: 'simple_query',
            data: {
              prompt: request.prompt,
              context: request.context,
              conversationHistory: request.conversationHistory,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();

      return {
        success: true,
        response: result.response,
        tokensUsed: result.tokensUsed || 0,
        cost: 'low_cost',
      };
    } catch (error) {
      console.error('[Sofia API] Error in simple query:', error);
      return this.getMockResponse(request);
    }
  }

  /**
   * Process premium AI features (Category 3: High cost)
   * Used for creative content generation like letters, summaries
   */
  async processPremiumGeneration(
    request: SofiaAPIRequest
  ): Promise<SofiaAPIResponse> {
    if (!this.initialized) {
      return {
        success: false,
        error: 'Premium features require server configuration.',
        cost: 'premium',
      };
    }

    try {
      const response = await fetch(
        `${this.supabaseUrl}/functions/v1/sofia-ai-guided`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.supabaseKey}`,
          },
          body: JSON.stringify({
            action: 'premium_generation',
            data: {
              prompt: request.prompt,
              context: request.context,
              conversationHistory: request.conversationHistory,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();

      return {
        success: true,
        response: result.response,
        tokensUsed: result.tokensUsed || 0,
        cost: 'premium',
      };
    } catch (error) {
      console.error('[Sofia API] Error in premium generation:', error);
      return {
        success: false,
        error:
          'I apologize, there was an error generating premium content.',
        cost: 'premium',
      };
    }
  }

  /**
   * Generate system prompts based on context and request type
   */
  private ___generateSystemPrompt(
    context: SofiaContext,
    type: 'premium' | 'simple'
  ): string {
    const basePrompt = `You are Sofia, a warm, intelligent AI assistant for Schwalbe - a secure family protection platform. You help users organize their digital lives, protect their families, and create meaningful legacies.

PERSONALITY:
- Warm, empathetic, and supportive
- Professional but friendly tone
- Focus on care, protection, and love (not fear or death)
- Use the user's name when available: ${context.userName || 'there'}
- Be encouraging about progress and gentle with guidance

USER CONTEXT:
- Name: ${context.userName || 'Not provided'}
- Documents: ${context.documentCount}
- Guardians: ${context.guardianCount}
- Completion: ${context.completionPercentage}%
- Family: ${context.familyStatus}
- Language: ${context.language}
- Recent activity: ${context.recentActivity.join(', ') || 'No recent activity'}

RESPONSE STYLE:
- Keep responses conversational and concise
- Use encouraging language
- Provide specific, actionable advice
- Remember: You're helping someone protect what they love most`;

    if (type === 'simple') {
      return (
        basePrompt +
        `

SIMPLE QUERY MODE:
- Provide brief, direct answers (max 2-3 sentences)
- Focus on being helpful and informative
- Suggest relevant next steps when appropriate`
      );
    }

    return (
      basePrompt +
      `

PREMIUM MODE:
- Take time to craft thoughtful, personalized responses
- Use creative and emotional language when appropriate
- Consider the user's family context deeply
- Create meaningful, heartfelt content`
    );
  }

  /**
   * Mock responses for when OpenAI is not available
   */
  private getMockResponse(request: SofiaAPIRequest): SofiaAPIResponse {
    const mockResponses = {
      simple_query: [
        "That's an interesting question. Based on your information, I would recommend first completing the upload of your basic documents.",
        'I understand your situation. Given your progress, you might consider adding another guardian.',
        'Your question is important. With your current setup, I would suggest focusing on securing your documents.',
      ],
      premium_generation: [
        'Unfortunately, premium features require connection to AI services. Please try again later.',
        'To generate personal messages, we need to configure AI services. For now, you can write your own messages.',
      ],
      knowledge_lookup: [
        'Looking up information based on your query. Here are some relevant insights.',
        'Based on the knowledge base, I found some relevant information for your situation.',
      ],
    };

    const responses =
      mockResponses[request.requestType] || mockResponses.simple_query;
    const randomResponse =
      responses[Math.floor(Math.random() * responses.length)];

    return {
      success: true,
      response: randomResponse,
      tokensUsed: 0,
      cost:
        request.requestType === 'premium_generation' ? 'premium' : 'low_cost',
    };
  }

  /**
   * Check if API is available
   */
  isAvailable(): boolean {
    return this.initialized;
  }

  /**
   * Get API status
   */
  getStatus(): { available: boolean; hasSupabaseConfig: boolean } {
    return {
      available: this.initialized,
      hasSupabaseConfig: !!(this.supabaseUrl && this.supabaseKey),
    };
  }
}

// Export singleton instance
export const sofiaAPI = new SofiaAPI();

// Utility function to create API requests
export function createSofiaAPIRequest(
  prompt: string,
  context: SofiaContext,
  requestType: SofiaAPIRequest['requestType'] = 'simple_query',
  conversationHistory?: SofiaMessage[]
): SofiaAPIRequest {
  return {
    prompt,
    context,
    requestType,
    conversationHistory,
  };
}

// Export types
export type { SofiaAPIRequest, SofiaAPIResponse };