import { UserContext, PersonalityConfig, SofiaResponse, KnowledgeBaseEntry, Action } from '../types/index';

export class SimplePersonalityService {
  private basePersonality: PersonalityConfig = {
    name: 'Sofia',
    tone: 'empathetic',
    empathy: 0.8,
    formality: 0.6,
    encouragement: 0.7,
    traits: ['empathetic', 'encouraging', 'knowledgeable', 'patient']
  };

  adaptPersonality(context: UserContext): PersonalityConfig {
    const personality = { ...this.basePersonality };

    // Adapt based on user context
    if (context.persona) {
      const { riskTolerance, digitalLiteracy, familyStatus } = context.persona;

      // Adjust formality based on digital literacy
      if (digitalLiteracy === 'beginner') {
        personality.formality = Math.max(0.3, personality.formality - 0.2);
        personality.traits.push('patient', 'clear');
      } else if (digitalLiteracy === 'advanced') {
        personality.formality = Math.min(0.9, personality.formality + 0.1);
      }

      // Adjust encouragement based on risk tolerance
      if (riskTolerance === 'low') {
        personality.encouragement = Math.min(0.9, personality.encouragement + 0.2);
        personality.traits.push('supportive');
      }

      // Adjust empathy based on family status
      if (familyStatus === 'family' || familyStatus === 'extended') {
        personality.empathy = Math.min(0.95, personality.empathy + 0.1);
        personality.traits.push('understanding');
      }
    }

    // Remove duplicates from traits
    personality.traits = Array.from(new Set(personality.traits));

    return personality;
  }

  async generateResponse(
    userMessage: string,
    context: UserContext,
    knowledge: KnowledgeBaseEntry[]
  ): Promise<SofiaResponse> {
    const personality = this.adaptPersonality(context);
    const message = userMessage.toLowerCase();

    let response = '';
    let actions: Action[] = [];
    let confidence = 0.8;

    // Greeting and introduction
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      response = this.getGreetingResponse(personality, context);
      confidence = 0.95;
    }
    // Help requests
    else if (message.includes('help') || message.includes('what can you do')) {
      response = this.getHelpResponse(personality, context);
      actions = this.getHelpActions(context);
      confidence = 0.9;
    }
    // Milestone-related questions
    else if (message.includes('will') || message.includes('guardians') || message.includes('assets')) {
      const relevantKnowledge = knowledge.find(k =>
        k.keywords.some(keyword => message.includes(keyword))
      );

      if (relevantKnowledge) {
        response = this.formatKnowledgeResponse(relevantKnowledge, personality);
        actions = this.getKnowledgeActions(relevantKnowledge, context);
        confidence = 0.85;
      } else {
        response = this.getFallbackResponse();
        confidence = 0.6;
      }
    }
    // Progress questions
    else if (message.includes('progress') || message.includes('status') || message.includes('done')) {
      response = this.getProgressResponse(context, personality);
      actions = this.getProgressActions();
      confidence = 0.9;
    }
    // Next steps
    else if (message.includes('next') || message.includes('what should i do')) {
      response = this.getNextStepsResponse(context, personality);
      actions = this.getNextStepsActions(context);
      confidence = 0.85;
    }
    // Default response
    else {
      response = this.getDefaultResponse();
      confidence = 0.7;
    }

    return {
      message: response,
      actions,
      personality,
      confidence,
      followUpQuestions: this.generateFollowUpQuestions(context)
    };
  }

  private getGreetingResponse(personality: PersonalityConfig, context: UserContext): string {
    const greetings = [
      `Hello! I'm ${personality.name}, your legacy planning companion. I'm here to guide you through creating a meaningful plan for your loved ones.`,
      `Hi there! I'm ${personality.name}, and I'm excited to help you with your legacy planning journey.`,
      `Welcome! I'm ${personality.name}, and I'm here to make legacy planning feel approachable and manageable.`
    ];

    let greeting = greetings[Math.floor(Math.random() * greetings.length)];

    if (context.onboardingCompleted) {
      greeting += " I see you've completed your initial assessment - that's wonderful! How can I assist you today?";
    } else {
      greeting += " Let's start by understanding your situation so I can provide personalized guidance.";
    }

    return greeting;
  }

  private getHelpResponse(_personality: PersonalityConfig, context: UserContext): string {
    return `I'm here to help you with every aspect of legacy planning. I can:

• Guide you through creating your will and legal documents
• Help you choose guardians for minor children
• Assist with inventorying your assets
• Provide information about estate planning best practices
• Answer questions about the process
• Track your progress and suggest next steps

${context.onboardingCompleted ? 'Since you\'ve completed your assessment, I can provide even more personalized guidance.' : 'To give you the most relevant help, I recommend starting with our quick assessment.'}`;
  }

  private getHelpActions(context: UserContext): Action[] {
    const actions: Action[] = [];

    if (!context.onboardingCompleted) {
      actions.push({
        id: 'start_onboarding',
        type: 'navigate',
        label: 'Take Assessment',
        payload: { route: '/onboarding' },
        priority: 'high'
      });
    }

    actions.push({
      id: 'view_progress',
      type: 'navigate',
      label: 'View My Progress',
      payload: { route: '/dashboard' },
      priority: 'medium'
    });

    return actions;
  }

  private formatKnowledgeResponse(knowledge: KnowledgeBaseEntry, personality: PersonalityConfig): string {
    let response = knowledge.answer;

    // Add personality-based framing
    if (personality.empathy > 0.7) {
      response = `I understand this can feel complex, but here's what you need to know: ${response}`;
    }

    if (personality.encouragement > 0.7) {
      response += " You're taking an important step by learning about this!";
    }

    return response;
  }

  private getKnowledgeActions(knowledge: KnowledgeBaseEntry, context: UserContext): Action[] {
    const actions: Action[] = [];

    if (knowledge.relatedMilestones && knowledge.relatedMilestones.length > 0) {
      const nextMilestone = knowledge.relatedMilestones.find(milestone =>
        !context.completedMilestones?.includes(milestone)
      );

      if (nextMilestone) {
        actions.push({
          id: `complete_${nextMilestone}`,
          type: 'complete_milestone',
          label: `Work on ${nextMilestone.replace('_', ' ')}`,
          payload: { milestoneId: nextMilestone },
          priority: 'high'
        });
      }
    }

    return actions;
  }

  private getProgressResponse(context: UserContext, personality: PersonalityConfig): string {
    if (!context.onboardingCompleted) {
      return "It looks like you haven't completed your initial assessment yet. That's the best place to start! Would you like me to guide you through it?";
    }

    const completedCount = context.completedMilestones?.length || 0;
    const encouragement = personality.encouragement > 0.7
      ? "You're making great progress!"
      : "You're on track.";

    return `${encouragement} You've completed ${completedCount} milestone${completedCount !== 1 ? 's' : ''}. Let's see what you should focus on next.`;
  }

  private getProgressActions(): Action[] {
    return [{
      id: 'view_detailed_progress',
      type: 'navigate',
      label: 'View Detailed Progress',
      payload: { route: '/dashboard' },
      priority: 'high'
    }];
  }

  private getNextStepsResponse(context: UserContext, personality: PersonalityConfig): string {
    if (!context.onboardingCompleted) {
      return "The best next step is to complete your personalized assessment. It'll only take about 15 minutes and will help me provide much better guidance.";
    }

    const encouragement = personality.encouragement > 0.7
      ? "You're doing great! "
      : "";

    return `${encouragement}Based on where you are in your journey, I recommend focusing on creating your will first. It's the foundation of your legacy plan.`;
  }

  private getNextStepsActions(context: UserContext): Action[] {
    const actions: Action[] = [];

    if (!context.onboardingCompleted) {
      actions.push({
        id: 'start_assessment',
        type: 'navigate',
        label: 'Start Assessment',
        payload: { route: '/onboarding' },
        priority: 'high'
      });
    } else {
      actions.push({
        id: 'create_will',
        type: 'complete_milestone',
        label: 'Create Your Will',
        payload: { milestoneId: 'create_will' },
        priority: 'high'
      });
    }

    return actions;
  }

  private getDefaultResponse(): string {
    const responses = [
      "I'd be happy to help you with that. Could you tell me a bit more about what you're looking for?",
      "That's an interesting question! Let me see how I can best assist you with your legacy planning.",
      "I'm here to support you through every step of your legacy planning journey. What specific aspect would you like to focus on?"
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  private getFallbackResponse(): string {
    return "I don't have specific information about that topic yet, but I'm learning more every day! For now, I recommend starting with the basics of will creation and asset inventory. Would you like me to guide you through those?";
  }

  private generateFollowUpQuestions(context: UserContext): string[] {
    const questions: string[] = [];

    if (!context.onboardingCompleted) {
      questions.push("Would you like to start your personalized assessment?");
    }

    if (!context.completedMilestones?.includes('create_will')) {
      questions.push("Have you thought about creating your will yet?");
    }

    if (context.persona?.familyStatus === 'family' && !context.completedMilestones?.includes('designate_guardians')) {
      questions.push("Have you considered who would care for your children if needed?");
    }

    return questions.slice(0, 2); // Return max 2 follow-up questions
  }
}

export const personalityService = new SimplePersonalityService();