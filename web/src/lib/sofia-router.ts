
import {
  type ActionButton,
  type ActionCategory,
  type CommandResult,
  getContextualActions,
  type SofiaCommand,
  type SofiaContext,
} from './sofia-types';
import { sofiaKnowledgeBase } from './sofia-knowledge-base';
import { createSofiaAPIRequest, sofiaAPI } from './sofia-api';

// Sofia Command Router - The Brain of Sofia
// Decides how to handle each user command without expensive AI calls when possible

export class SofiaRouter {
  private static instance: SofiaRouter;

  private constructor() {}

  static getInstance(): SofiaRouter {
    if (!SofiaRouter.instance) {
      SofiaRouter.instance = new SofiaRouter();
    }
    return SofiaRouter.instance;
  }

  /**
   * Main command processing function
   * Routes commands to appropriate handlers based on category and cost optimization
   */
  async processCommand(command: SofiaCommand): Promise<CommandResult> {
    const { command: commandText, category, context } = command;

    // console.log(
    //   `[Sofia Router] Processing command: ${commandText}, category: ${category}`
    // );

    try {
      // Category 1: Free predefined actions (80% of interactions)
      if (category === 'navigation') {
        return this.handleNavigationCommand(commandText, context);
      }

      if (category === 'ui_action') {
        return this.handleUIActionCommand(commandText, context);
      }

      // Category 2: Knowledge base queries (low cost)
      if (category === 'ai_query' && commandText.startsWith('faq_')) {
        return this.handleKnowledgeBaseQuery(commandText, context);
      }

      if (commandText === 'suggest_next_step') {
        return this.handleNextStepSuggestion(context);
      }

      // Category 3: Premium AI features (high cost)
      if (category === 'premium_feature') {
        return this.handlePremiumFeature(commandText, context);
      }

      // Fallback: Try to parse free-form text input
      return this.handleFreeFormInput(commandText, context);
    } catch (error) {
      console.error('[Sofia Router] Error processing command:', error);
      return {
        type: 'error',
        payload: {
          message: 'I apologize, an error occurred. Please try again.',
          actions: getContextualActions(context),
        },
        cost: 'free',
      };
    }
  }

  /**
   * Handle navigation commands (FREE)
   */
  private handleNavigationCommand(
    command: string,
    _context: SofiaContext
  ): CommandResult {
    const navigationMap: Record<string, string> = {
      navigate_vault: '/vault',
      navigate_guardians: '/guardians',
      navigate_legacy: '/legacy',
      navigate_dashboard: '/',
    };

    const route = navigationMap[command];
    if (!route) {
      return {
        type: 'error',
        payload: { message: 'Unknown navigation action.' },
        cost: 'free',
      };
    }

    return {
      type: 'navigation',
      payload: { route },
      cost: 'free',
      requiresFollowup: true,
      followupActions: [
        {
          id: 'back_to_sofia',
          text: '↩️ Back to Sofia',
          icon: 'bot',
          category: 'ui_action',
          cost: 'free',
          payload: { action: 'show_sofia' },
        },
      ],
    };
  }

  /**
   * Handle UI action commands (FREE)
   */
  private handleUIActionCommand(
    command: string,
    context: SofiaContext
  ): CommandResult {
    switch (command) {
      case 'trigger_upload':
        return {
          type: 'ui_action',
          payload: {
            action: 'open_uploader',
            message: `Great, ${context.userName || ''}! Let's add a new document. What would you like to upload?`,
          },
          cost: 'free',
        };

      case 'show_progress':
        return {
          type: 'ui_action',
          payload: {
            action: 'show_progress_modal',
            data: {
              completionPercentage: context.completionPercentage,
              documentCount: context.documentCount,
              guardianCount: context.guardianCount,
              nextSteps: this.generateNextSteps(context),
            },
          },
          cost: 'free',
        };

      case 'show_sofia':
        return {
          type: 'response',
          payload: {
            message: this.generateWelcomeMessage(context),
            actions: getContextualActions(context),
          },
          cost: 'free',
        };

      default:
        return {
          type: 'error',
          payload: { message: 'Unknown UI action.' },
          cost: 'free',
        };
    }
  }

  /**
   * Handle knowledge base queries (LOW COST)
   */
  private handleKnowledgeBaseQuery(
    command: string,
    context: SofiaContext
  ): CommandResult {
    const answer = sofiaKnowledgeBase.getById(command);

    if (!answer) {
      return {
        type: 'error',
        payload: {
          message:
            "I apologize, I don't have a prepared answer for this question.",
          actions: getContextualActions(context),
        },
        cost: 'free',
      };
    }

    return {
      type: 'response',
      payload: {
        message: answer.content,
        actions: answer.followupActions || getContextualActions(context),
      },
      cost: 'low_cost',
    };
  }

  /**
   * Generate next step suggestions (LOW COST - rule-based)
   */
  private handleNextStepSuggestion(context: SofiaContext): CommandResult {
    const suggestions = this.generateNextSteps(context);
    const primarySuggestion = suggestions[0];

    const message = `Based on your progress (${context.completionPercentage}%) I recommend: ${primarySuggestion.description}`;

    const actions: ActionButton[] = suggestions.map(suggestion => ({
      id: suggestion.actionId,
      text: suggestion.title,
      icon: suggestion.icon,
      category: suggestion.category as ActionCategory,
      cost: 'free' as const,
      payload: suggestion.payload,
    }));

    return {
      type: 'response',
      payload: { message, actions },
      cost: 'low_cost',
    };
  }

  /**
   * Handle premium AI features (HIGH COST)
   */
  private async handlePremiumFeature(
    command: string,
    context: SofiaContext
  ): Promise<CommandResult> {
    const prompts: Record<string, string> = {
      generate_legacy_letter: `Help me write a personal message for my family. I want to leave words of love and encouragement for my loved ones.`,
      generate_financial_summary: `Create a summary of my finances and assets that will help my family in need. Include practical steps and important contacts.`,
    };

    const prompt = prompts[command];
    if (!prompt) {
      return {
        type: 'error',
        payload: { message: 'Unknown premium feature.' },
        cost: 'premium',
      };
    }

    try {
      // Call AI API for premium generation
      const apiRequest = createSofiaAPIRequest(
        prompt,
        context,
        'premium_generation'
      );
      const apiResponse = await sofiaAPI.processPremiumGeneration(apiRequest);

      if (apiResponse.success && apiResponse.response) {
        return {
          type: 'response',
          payload: {
            message: apiResponse.response,
            actions: getContextualActions(context),
          },
          cost: 'premium',
        };
      } else {
        return {
          type: 'response',
          payload: {
            message:
              apiResponse.error ||
              'Unfortunately, premium features are currently unavailable. Please try again later.',
            actions: [
              {
                id: 'retry_premium',
                text: '🔄 Try again',
                icon: 'sparkles',
                category: 'premium_feature',
                cost: 'premium',
                payload: { command },
              },
            ],
          },
          cost: 'premium',
        };
      }
    } catch (error) {
      console.error('[Sofia Router] Premium feature error:', error);
      return {
        type: 'text_response',
        payload:
          'I apologize, there was an error processing your premium request. Please check your connection and try again.',
        cost: 'premium',
      };
    }
  }

  /**
   * Handle free-form text input (try to parse and route)
   */
  private async handleFreeFormInput(
    input: string,
    context: SofiaContext
  ): Promise<CommandResult> {
    const lowerInput = input.toLowerCase();

    // Simple keyword matching for common requests (FREE)
    if (
      lowerInput.includes('document') ||
      lowerInput.includes('upload') ||
      lowerInput.includes('add')
    ) {
      return this.handleUIActionCommand('trigger_upload', context);
    }

    if (
      lowerInput.includes('vault') ||
      lowerInput.includes('documents') ||
      lowerInput.includes('storage')
    ) {
      return this.handleNavigationCommand('navigate_vault', context);
    }

    if (
      lowerInput.includes('guardian') ||
      lowerInput.includes('protector') ||
      lowerInput.includes('trusted')
    ) {
      return this.handleNavigationCommand('navigate_guardians', context);
    }

    if (
      lowerInput.includes('legacy') ||
      lowerInput.includes('will') ||
      lowerInput.includes('testament')
    ) {
      return this.handleNavigationCommand('navigate_legacy', context);
    }

    if (
      lowerInput.includes('help') ||
      lowerInput.includes('what') ||
      lowerInput.includes('how')
    ) {
      return this.handleNextStepSuggestion(context);
    }

    // Security/FAQ keywords (LOW COST)
    if (
      lowerInput.includes('security') ||
      lowerInput.includes('encryption') ||
      lowerInput.includes('safe')
    ) {
      return this.handleKnowledgeBaseQuery('faq_security', context);
    }

    // Try AI-powered interpretation for complex questions (LOW COST)
    if (input.length > 10 && input.includes('?')) {
      try {
        const apiRequest = createSofiaAPIRequest(
          `Interpret this user question and provide a helpful response: "${input}"`,
          context,
          'simple_query'
        );
        const apiResponse = await sofiaAPI.processSimpleQuery(apiRequest);

        if (apiResponse.success && apiResponse.response) {
          return {
            type: 'response',
            payload: {
              message: apiResponse.response,
              actions: getContextualActions(context),
            },
            cost: 'low_cost',
          };
        }
      } catch (error) {
        console.warn('[Sofia Router] AI interpretation failed:', error);
        return {
          type: 'text_response',
          payload:
            "I apologize, I'm having trouble understanding your question right now. Please try again or use one of the suggested options.",
          cost: 'free',
        };
      }
    }

    // Fallback: offer helpful actions
    return {
      type: 'response',
      payload: {
        message: `Hmm, I'm not sure how I can help you with that. Try one of these options:`,
        actions: getContextualActions(context),
      },
      cost: 'free',
    };
  }

  /**
   * Generate contextual next steps
   */
  private generateNextSteps(context: SofiaContext) {
    const steps = [];

    if (context.documentCount < 3) {
      steps.push({
        title: '📄 Add basic documents',
        description: 'Upload your ID, passport, and insurance card',
        actionId: 'trigger_upload',
        icon: 'upload',
        category: 'ui_action',
        payload: { action: 'open_uploader' },
      });
    }

    if (context.documentCount >= 3 && context.guardianCount === 0) {
      steps.push({
        title: '👥 Add first guardian',
        description:
          'Identify a trusted person who will help your family in emergencies',
        actionId: 'navigate_guardians',
        icon: 'guardians',
        category: 'navigation',
        payload: { route: '/guardians' },
      });
    }

    if (context.completionPercentage > 50) {
      steps.push({
        title: '📜 Create will',
        description: 'Secure your family by creating a basic will',
        actionId: 'navigate_legacy',
        icon: 'legacy',
        category: 'navigation',
        payload: { route: '/legacy' },
      });
    }

    // Always have a fallback suggestion
    if (steps.length === 0) {
      steps.push({
        title: '🔍 Explore options',
        description: "Let's see what else you can improve",
        actionId: 'show_progress',
        icon: 'info',
        category: 'ui_action',
        payload: { action: 'show_progress_modal' },
      });
    }

    return steps;
  }

  /**
   * Generate personalized welcome message
   */
  private generateWelcomeMessage(context: SofiaContext): string {
    const {
      userName,
      completionPercentage,
      documentCount,
      guardianCount: _guardianCount,
    } = context;
    const greeting = this.getTimeBasedGreeting();
    const name = userName || 'tam';

    if (completionPercentage < 20) {
      return `${greeting}, ${name}! Welcome to LegacyGuard. I am Sofia and I am here to help you protect your family. Let's get started!`;
    }

    if (completionPercentage < 60) {
      return `${greeting}, ${name}! I see you've already secured ${documentCount} documents. Great work! How can I help you today?`;
    }

    return `${greeting}, ${name}! You already have ${completionPercentage}% complete - that's fantastic! Your family is increasingly protected.`;
  }

  private getTimeBasedGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }
}

// Export singleton instance
export const sofiaRouter = SofiaRouter.getInstance();
