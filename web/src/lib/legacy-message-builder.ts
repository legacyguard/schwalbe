
// Emotional Guidance & Legacy Message System
// Provides emotional support and legacy message creation during will preparation

// import type { WillData } from '@/components/legacy/WillWizard';

export interface LegacyMessage {
  content: string;
  createdAt: Date;
  emotionalTone:
    | 'celebratory'
    | 'encouraging'
    | 'loving'
    | 'reflective'
    | 'wise';
  id: string;
  isEncrypted: boolean;
  lastModified: Date;
  mediaUrls?: string[];
  metadata: {
    attachmentCount: number;
    duration?: number; // for audio/video in seconds
    wordCount?: number; // for text messages
  };
  occasion: MessageOccasion;
  privacy: 'family_shared' | 'private' | 'public';
  recipientName: string;
  recipientRelationship: string;
  scheduledDelivery?: {
    deliveryInstructions: string;
    triggerType: 'age' | 'anniversary' | 'date' | 'milestone';
    triggerValue: string;
  };
  title: string;
  type: 'audio' | 'photo_album' | 'text' | 'video';
}

export interface MemoryPrompt {
  category:
    | 'achievements'
    | 'advice'
    | 'childhood'
    | 'family_history'
    | 'relationships'
    | 'values';
  context: string;
  emotionalWeight: 'deep' | 'light' | 'medium';
  id: string;
  question: string;
  relationship?: string; // The relationship this prompt is about
  suggestedRecipients: string[];
  timeToReflect: number; // estimated minutes
}

export interface TimeCapsule {
  accessControls: {
    allowsEarlyAccess: boolean;
    familyViewingRules: string;
    requiresPassword: boolean;
  };
  createdAt: Date;
  description: string;
  id: string;
  lastModified: Date;
  messages: string[]; // LegacyMessage IDs
  name: string;
  recipients: string[];
  releaseConditions: {
    backupConditions?: string[];
    executorInstructions: string;
    primaryCondition: 'date' | 'death' | 'milestone';
  };
  releaseDate: Date;
  status: 'delivered' | 'draft' | 'scheduled' | 'sealed';
}

export type MessageOccasion =
  | 'achievement'
  | 'anniversary'
  | 'birthday'
  | 'difficult_time'
  | 'family_history'
  | 'first_child'
  | 'general_love'
  | 'graduation'
  | 'holiday'
  | 'life_wisdom'
  | 'milestone_birthday'
  | 'wedding';

export interface EmotionalGuidanceSession {
  completedAt?: Date;
  id: string;
  insights: string[];
  prompts: MemoryPrompt[];
  recommendedMessages: Array<{
    confidence: number;
    occasion: MessageOccasion;
    recipient: string;
    suggestedContent: string;
  }>;
  responses: Array<{
    emotionalRating: number; // 1-10 scale
    promptId: string;
    response: string;
    timeSpent: number; // minutes
  }>;
  sessionType:
    | 'future_visioning'
    | 'memory_sharing'
    | 'reflection'
    | 'value_expression';
}

// Memory prompts for different categories and relationships
const MEMORY_PROMPTS: Record<string, MemoryPrompt[]> = {
  children: [
    {
      id: 'child_proud_moment',
      category: 'achievements',
      question:
        'What moment with your child made you most proud, and what did it teach you about them?',
      context:
        'Reflecting on special moments helps create meaningful messages for future milestones',
      suggestedRecipients: ['child'],
      emotionalWeight: 'medium',
      timeToReflect: 5,
    },
    {
      id: 'child_advice',
      category: 'advice',
      question:
        "What's the most important life lesson you want to share with your child?",
      context: 'Your wisdom and experience are precious gifts to pass on',
      suggestedRecipients: ['child'],
      emotionalWeight: 'deep',
      timeToReflect: 10,
    },
    {
      id: 'child_dreams',
      category: 'values',
      question: "What are your hopes and dreams for your child's future?",
      context: 'Sharing your vision can inspire and guide them through life',
      suggestedRecipients: ['child'],
      emotionalWeight: 'deep',
      timeToReflect: 8,
    },
    {
      id: 'child_wedding_day',
      category: 'relationships',
      question: 'What would you want to tell your child on their wedding day?',
      context: "A message for one of life's most important milestones",
      suggestedRecipients: ['child'],
      emotionalWeight: 'deep',
      timeToReflect: 7,
    },
  ],
  spouse: [
    {
      id: 'spouse_love_story',
      category: 'relationships',
      question: 'How would you describe your love story to future generations?',
      context:
        'Preserving your love story helps family understand their heritage',
      suggestedRecipients: ['spouse', 'children'],
      emotionalWeight: 'deep',
      timeToReflect: 10,
    },
    {
      id: 'spouse_gratitude',
      category: 'relationships',
      question:
        'What are you most grateful for in your relationship with your spouse?',
      context:
        'Expressing gratitude deepens connection and creates lasting memories',
      suggestedRecipients: ['spouse'],
      emotionalWeight: 'medium',
      timeToReflect: 6,
    },
    {
      id: 'spouse_partnership',
      category: 'values',
      question:
        'What made your partnership strong, and how can this help your children?',
      context:
        'Relationship wisdom is one of the most valuable inheritances you can leave',
      suggestedRecipients: ['spouse', 'children'],
      emotionalWeight: 'medium',
      timeToReflect: 8,
    },
  ],
  family: [
    {
      id: 'family_traditions',
      category: 'family_history',
      question:
        'What family traditions are most important to preserve and why?',
      context: 'Family traditions connect generations and create lasting bonds',
      suggestedRecipients: ['children', 'grandchildren'],
      emotionalWeight: 'medium',
      timeToReflect: 6,
    },
    {
      id: 'family_values',
      category: 'values',
      question: 'What values define our family, and how did they develop?',
      context:
        'Understanding family values helps future generations make good choices',
      suggestedRecipients: ['children', 'grandchildren'],
      emotionalWeight: 'deep',
      timeToReflect: 10,
    },
    {
      id: 'ancestors_wisdom',
      category: 'family_history',
      question:
        'What wisdom from your parents or grandparents do you want to pass on?',
      context:
        'Ancestral wisdom creates a bridge between past and future generations',
      suggestedRecipients: ['children', 'grandchildren'],
      emotionalWeight: 'deep',
      timeToReflect: 8,
    },
  ],
};

// Message templates for different occasions
const MESSAGE_TEMPLATES: Record<
  MessageOccasion,
  Array<{
    context: string;
    template: string;
    tone: LegacyMessage['emotionalTone'];
  }>
> = {
  birthday: [
    {
      template:
        "My dearest {name}, on your birthday I want you to know how much joy you've brought to my life. {personal_memory} As you celebrate another year, remember that you are capable of amazing things. {life_advice}",
      tone: 'loving',
      context: 'General birthday message focusing on love and encouragement',
    },
    {
      template:
        "Happy birthday, {name}! {milestone_reflection} I'm so proud of the person you've become. {hopes_for_future}",
      tone: 'celebratory',
      context: 'Milestone birthday focusing on achievements and future',
    },
  ],
  wedding: [
    {
      template:
        'My dear {name}, as you begin this new chapter with {spouse}, I want to share some thoughts about love and marriage. {marriage_advice} Remember that {relationship_wisdom}. May your love grow stronger with each passing year.',
      tone: 'wise',
      context: 'Wedding day message with marriage wisdom',
    },
    {
      template:
        'What a beautiful day this is! {name}, watching you find your soulmate fills my heart with happiness. {love_story_connection} Wishing you both a lifetime of love, laughter, and beautiful memories.',
      tone: 'celebratory',
      context: 'Joyful wedding celebration message',
    },
  ],
  graduation: [
    {
      template:
        'Congratulations, {name}! Your graduation represents years of hard work and dedication. {proud_moment} As you step into the next phase of your life, remember that learning never stops. {life_advice}',
      tone: 'encouraging',
      context: 'Graduation message emphasizing achievement and future growth',
    },
  ],
  first_child: [
    {
      template:
        "Welcome to parenthood, {name}! Becoming a parent is one of life's greatest adventures. {parenting_reflection} Trust your instincts, be patient with yourself, and remember that love is the most important thing you can give your child.",
      tone: 'wise',
      context: 'New parent support and wisdom',
    },
  ],
  difficult_time: [
    {
      template:
        "My dear {name}, I know you're going through a challenging time right now. {acknowledgment} Remember that you are stronger than you know, and this difficult period will pass. {encouragement} I believe in you completely.",
      tone: 'encouraging',
      context: 'Support message for difficult times',
    },
  ],
  general_love: [
    {
      template:
        'I want you to know how much you mean to me, {name}. {specific_qualities} You have brought so much {positive_impact} to my life and to our family. Never forget how deeply you are loved.',
      tone: 'loving',
      context: 'General expression of love and appreciation',
    },
  ],
  life_wisdom: [
    {
      template:
        "Dear {name}, I want to share some wisdom I've learned over the years. {life_lesson} Remember that {core_value}. Life is precious, so {encouragement_to_live_fully}.",
      tone: 'wise',
      context: 'General life wisdom and guidance',
    },
  ],
  family_history: [
    {
      template:
        'I want to tell you about {family_member_or_event}, {name}. {historical_context} This is part of your heritage and helps explain {family_trait_or_value}. {connection_to_present}',
      tone: 'reflective',
      context: 'Sharing family history and heritage',
    },
  ],
  anniversary: [
    {
      template:
        'Happy anniversary, {name}! {anniversary_reflection} Your commitment to love continues to inspire me. {wishes_for_future}',
      tone: 'celebratory',
      context: 'Anniversary celebration and relationship appreciation',
    },
  ],
  achievement: [
    {
      template:
        'Congratulations, {name}! {achievement_details} I am so proud of your hard work and dedication. {encouragement_for_future}',
      tone: 'encouraging',
      context: 'Celebrating personal or professional achievements',
    },
  ],
  milestone_birthday: [
    {
      template:
        'My dear {name}, this milestone birthday marks {milestone_significance}. {reflection_on_journey} As you enter this new decade, {hopes_and_dreams}',
      tone: 'reflective',
      context: 'Special milestone birthdays (30th, 40th, 50th, etc.)',
    },
  ],
  holiday: [
    {
      template:
        'During this special {holiday_name}, {name}, I want you to know {holiday_sentiment}. {memory_or_tradition} May this season bring you {holiday_wishes}',
      tone: 'loving',
      context: 'Holiday greetings and seasonal messages',
    },
  ],
};

export class LegacyMessageBuilder {
  /**
   * Create personalized messages based on relationships and occasions
   */
  createPersonalizedMessages(
    relationships: Array<{ name: string; relationship: string }>,
    occasions: MessageOccasion[]
  ): LegacyMessage[] {
    const messages: LegacyMessage[] = [];

    relationships.forEach(person => {
      occasions.forEach(occasion => {
        const templates = MESSAGE_TEMPLATES[occasion] || [];
        if (templates.length > 0) {
          const template = templates[0]; // Use first template for now

          const message: LegacyMessage = {
            id: `msg_${Date.now()}_${person.name.replace(/\s+/g, '_')}`,
            type: 'text',
            title: `${occasion.replace('_', ' ')} message for ${person.name}`,
            recipientName: person.name,
            recipientRelationship: person.relationship,
            occasion,
            content: this.populateTemplate(
              template.template,
              person.name,
              person.relationship
            ),
            emotionalTone: template.tone,
            privacy: 'private',
            createdAt: new Date(),
            lastModified: new Date(),
            isEncrypted: false,
            metadata: {
              wordCount: template.template.split(' ').length,
              attachmentCount: 0,
            },
          };

          messages.push(message);
        }
      });
    });

    return messages;
  }

  /**
   * Generate memory prompts based on family structure
   */
  generateMemoryPrompts(
    family: Array<{ name: string; relationship: string }>
  ): MemoryPrompt[] {
    const prompts: MemoryPrompt[] = [];

    const hasChildren = family.some(f =>
      ['child', 'son', 'daughter'].includes(f.relationship.toLowerCase())
    );
    const hasSpouse = family.some(f =>
      ['spouse', 'husband', 'wife', 'partner'].includes(
        f.relationship.toLowerCase()
      )
    );

    // Add child-specific prompts
    if (hasChildren) {
      prompts.push(
        ...MEMORY_PROMPTS.children.map(p => ({ ...p, relationship: 'child' }))
      );
    }

    // Add spouse-specific prompts
    if (hasSpouse) {
      prompts.push(
        ...MEMORY_PROMPTS.spouse.map(p => ({ ...p, relationship: 'spouse' }))
      );
    }

    // Add general family prompts
    prompts.push(
      ...MEMORY_PROMPTS.family.map(p => ({ ...p, relationship: 'family' }))
    );

    // Randomize order and limit to reasonable number
    return this.shuffleArray(prompts).slice(0, 8);
  }

  /**
   * Build digital time capsule with delayed delivery
   */
  buildDigitalTimeCapsule(
    messages: LegacyMessage[],
    releaseDate: Date
  ): TimeCapsule {
    const timeCapsule: TimeCapsule = {
      id: `capsule_${Date.now()}`,
      name: `Time Capsule - ${releaseDate.getFullYear()}`,
      description: `A collection of messages to be delivered on ${releaseDate.toLocaleDateString()}`,
      messages: messages.map(m => m.id),
      recipients: [...new Set(messages.map(m => m.recipientName))],
      releaseDate,
      releaseConditions: {
        primaryCondition: 'date',
        executorInstructions:
          'Deliver all messages to designated recipients on the specified date',
      },
      accessControls: {
        requiresPassword: false,
        allowsEarlyAccess: false,
        familyViewingRules: 'Individual messages are private to each recipient',
      },
      status: 'draft',
      createdAt: new Date(),
      lastModified: new Date(),
    };

    return timeCapsule;
  }

  /**
   * Create guided emotional reflection session
   */
  createGuidanceSession(
    sessionType: EmotionalGuidanceSession['sessionType'],
    family: Array<{ name: string; relationship: string }>
  ): EmotionalGuidanceSession {
    const prompts = this.generateMemoryPrompts(family);

    return {
      id: `session_${Date.now()}`,
      sessionType,
      prompts: prompts.slice(0, 5), // Limit to 5 prompts per session
      responses: [],
      insights: [],
      recommendedMessages: [],
    };
  }

  /**
   * Generate message suggestions based on user responses
   */
  generateMessageSuggestions(session: EmotionalGuidanceSession): Array<{
    confidence: number;
    occasion: MessageOccasion;
    recipient: string;
    suggestedContent: string;
  }> {
    const suggestions: Array<{
      confidence: number;
      occasion: MessageOccasion;
      recipient: string;
      suggestedContent: string;
    }> = [];

    session.responses.forEach(response => {
      const prompt = session.prompts.find(p => p.id === response.promptId);
      if (!prompt) return;

      prompt.suggestedRecipients.forEach(recipient => {
        // Generate context-aware suggestions based on response
        let occasion: MessageOccasion = 'general_love';
        let confidence = 0.7;

        // Determine occasion based on prompt category and content
        if (prompt.category === 'advice') {
          occasion = 'life_wisdom';
          confidence = 0.9;
        } else if (prompt.category === 'achievements') {
          occasion = 'graduation';
          confidence = 0.8;
        } else if (
          prompt.category === 'relationships' &&
          recipient === 'spouse'
        ) {
          occasion = 'anniversary';
          confidence = 0.85;
        }

        suggestions.push({
          recipient,
          occasion,
          suggestedContent: this.generateContentFromResponse(
            response.response,
            occasion,
            recipient
          ),
          confidence,
        });
      });
    });

    // Sort by confidence and remove duplicates
    return suggestions
      .sort((a, b) => b?.confidence - a?.confidence)
      .filter(
        (suggestion, index, arr) =>
          index ===
          arr.findIndex(
            s =>
              s.recipient === suggestion.recipient &&
              s.occasion === suggestion.occasion
          )
      )
      .slice(0, 5);
  }

  /**
   * Create memory prompts for family relationships
   */
  createMemoryPrompts(relationships: string[]): MemoryPrompt[] {
    const prompts: MemoryPrompt[] = [];

    relationships.forEach(relationship => {
      if (relationship === 'child') {
        prompts.push({
          id: `child_${Date.now()}_${Math.random()}`,
          category: 'relationships',
          question: `What's your fondest memory of ${relationship}?`,
          context: 'Reflecting on special moments with your child',
          suggestedRecipients: [relationship],
          emotionalWeight: 'deep',
          timeToReflect: 10,
        });
      } else if (relationship === 'spouse') {
        prompts.push({
          id: `spouse_${Date.now()}_${Math.random()}`,
          category: 'relationships',
          question: `What makes your relationship with ${relationship} special?`,
          context: 'Celebrating your partnership and love',
          suggestedRecipients: [relationship],
          emotionalWeight: 'deep',
          timeToReflect: 15,
        });
      }
    });

    return prompts;
  }

  /**
   * Create legacy messages for different occasions
   */
  createLegacyMessages(
    recipients: string[],
    occasions: MessageOccasion[]
  ): LegacyMessage[] {
    const messages: LegacyMessage[] = [];

    recipients.forEach(recipient => {
      occasions.forEach(occasion => {
        messages.push({
          id: `legacy_${Date.now()}_${Math.random()}`,
          type: 'text',
          title: `Message for ${recipient} on ${occasion}`,
          recipientName: recipient,
          recipientRelationship: 'family',
          occasion,
          content: `This is a legacy message for ${recipient} on the occasion of ${occasion}.`,
          emotionalTone: 'loving',
          privacy: 'family_shared',
          createdAt: new Date(),
          lastModified: new Date(),
          isEncrypted: false,
          metadata: {
            wordCount: 20,
            attachmentCount: 0,
          },
        });
      });
    });

    return messages;
  }

  /**
   * Create time capsules with scheduled delivery
   */
  createTimeCapsules(
    name: string,
    messages: string[],
    recipients: string[],
    releaseDate: Date
  ): TimeCapsule[] {
    return [
      {
        id: `timecapsule_${Date.now()}_${Math.random()}`,
        name,
        description: `Time capsule for ${recipients.join(', ')}`,
        messages,
        recipients,
        releaseDate,
        releaseConditions: {
          primaryCondition: 'date',
          executorInstructions: 'Release on specified date',
        },
        accessControls: {
          requiresPassword: false,
          allowsEarlyAccess: false,
          familyViewingRules: 'Family only',
        },
        status: 'draft',
        createdAt: new Date(),
        lastModified: new Date(),
      },
    ];
  }

  /**
   * Provide emotional support during will creation
   */
  provideEmotionalSupport(stage: string):
    | undefined
    | {
        guidanceCards: Array<{ content: string; title: string; type: string }>;
        stage: string;
        supportMessage: string;
      } {
    return this.getEmotionalSupport(stage);
  }

  /**
   * Get emotional support guidance based on will creation stage
   */
  getEmotionalSupport(stage: string):
    | undefined
    | {
        guidanceCards: Array<{ content: string; title: string; type: string }>;
        stage: string;
        supportMessage: string;
      } {
    const support = {
      starting: {
        stage: 'starting',
        supportMessage:
          "Taking this step shows how much you care about your family's future. You're doing something wonderful for them.",
        guidanceCards: [
          {
            title: 'Encouragement',
            content: "You're doing something wonderful for them.",
            type: 'encouragement',
          },
          {
            title: 'Normalizing',
            content:
              "It's completely normal to feel emotional when thinking about these important matters.",
            type: 'normalizing',
          },
          {
            title: 'Practical Tip',
            content: 'Consider this as writing a love letter to your family.',
            type: 'practical',
          },
        ],
      },
      beneficiaries: {
        stage: 'beneficiaries',
        supportMessage:
          "Deciding who inherits your life's work is a profound act of love and responsibility.",
        guidanceCards: [
          {
            title: 'Encouragement',
            content: 'This is a profound act of love and responsibility.',
            type: 'encouragement',
          },
          {
            title: 'Normalizing',
            content:
              'These decisions can feel overwhelming. Remember, you can always revisit and update your choices.',
            type: 'normalizing',
          },
          {
            title: 'Practical Tip',
            content:
              "Think about each person's needs and circumstances, not just equal percentages.",
            type: 'practical',
          },
        ],
      },
      assets: {
        stage: 'assets',
        supportMessage:
          "You've built something meaningful in your life - now you're ensuring it continues to benefit those you love.",
        guidanceCards: [
          {
            title: 'Encouragement',
            content: "You've built something meaningful in your life.",
            type: 'encouragement',
          },
          {
            title: 'Normalizing',
            content:
              "It's natural to feel attached to possessions that hold memories.",
            type: 'normalizing',
          },
          {
            title: 'Practical Tip',
            content:
              'Consider not just monetary value, but emotional significance when distributing personal items.',
            type: 'practical',
          },
        ],
      },
      asset_distribution: {
        stage: 'asset_distribution',
        supportMessage:
          "You've built something meaningful in your life - now you're ensuring it continues to benefit those you love.",
        guidanceCards: [
          {
            title: 'Encouragement',
            content: "You've built something meaningful in your life.",
            type: 'encouragement',
          },
          {
            title: 'Normalizing',
            content:
              "It's natural to feel attached to possessions that hold memories.",
            type: 'normalizing',
          },
          {
            title: 'Practical Tip',
            content:
              'Consider not just monetary value, but emotional significance when distributing personal items.',
            type: 'practical',
          },
        ],
      },
      final_wishes: {
        stage: 'final_wishes',
        supportMessage:
          'Sharing your final wishes is a gift of clarity to your family during a difficult time.',
        guidanceCards: [
          {
            title: 'Encouragement',
            content:
              'Sharing your final wishes is a gift of clarity to your family.',
            type: 'encouragement',
          },
          {
            title: 'Normalizing',
            content:
              'Thinking about end-of-life preferences can be difficult, but it shows tremendous thoughtfulness.',
            type: 'normalizing',
          },
          {
            title: 'Practical Tip',
            content:
              "Include not just practical instructions, but also messages about how you'd like to be remembered.",
            type: 'practical',
          },
        ],
      },
      completing: {
        stage: 'completing',
        supportMessage:
          "You've just completed one of the most caring acts possible - protecting and providing for your loved ones.",
        guidanceCards: [
          {
            title: 'Encouragement',
            content:
              "You've just completed one of the most caring acts possible.",
            type: 'encouragement',
          },
          {
            title: 'Normalizing',
            content:
              'You might feel relieved, emotional, or both. All of these feelings are completely normal.',
            type: 'normalizing',
          },
          {
            title: 'Practical Tip',
            content:
              "Share with your family that you've completed your will so they know you've taken care of them.",
            type: 'practical',
          },
        ],
      },
    };

    return support[stage as keyof typeof support];
  }

  // Private helper methods
  private populateTemplate(
    template: string,
    name: string,
    relationship: string
  ): string {
    return template
      .replace('{name}', name)
      .replace('{relationship}', relationship)
      .replace(
        '{personal_memory}',
        '[Add a specific memory about ' + name + ']'
      )
      .replace(
        '{life_advice}',
        '[Share your most important advice for ' + name + ']'
      )
      .replace(
        '{hopes_for_future}',
        '[Express your hopes for ' + name + "'s future]"
      )
      .replace(
        '{marriage_advice}',
        '[Share wisdom about marriage and relationships]'
      )
      .replace('{relationship_wisdom}', '[Add specific relationship advice]')
      .replace(
        '{love_story_connection}',
        '[Connect to your own love story or relationship experience]'
      )
      .replace(
        '{proud_moment}',
        '[Mention a specific moment when you felt proud of ' + name + ']'
      )
      .replace(
        '{parenting_reflection}',
        '[Share thoughts about becoming a parent]'
      )
      .replace('{acknowledgment}', '[Acknowledge their specific challenge]')
      .replace(
        '{encouragement}',
        '[Provide specific encouragement based on their situation]'
      )
      .replace(
        '{specific_qualities}',
        '[Mention specific qualities you admire in ' + name + ']'
      )
      .replace(
        '{positive_impact}',
        '[Describe how ' + name + ' has positively impacted your life]'
      )
      .replace('{life_lesson}', '[Share an important life lesson]')
      .replace('{core_value}', '[Express a core family value]')
      .replace(
        '{encouragement_to_live_fully}',
        '[Encourage them to live life fully]'
      )
      .replace(
        '{family_member_or_event}',
        '[Reference specific family member or historical event]'
      )
      .replace('{historical_context}', '[Provide historical context]')
      .replace(
        '{family_trait_or_value}',
        '[Connect to current family traits or values]'
      )
      .replace(
        '{connection_to_present}',
        '[Connect historical information to present day]'
      );
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private generateContentFromResponse(
    response: string,
    occasion: MessageOccasion,
    recipient: string
  ): string {
    // This would use AI/NLP to generate personalized content based on the user's response
    // For now, return a template-based suggestion
    const templates = MESSAGE_TEMPLATES[occasion];
    if (templates && templates.length > 0) {
      return this.populateTemplate(
        templates[0].template,
        recipient,
        'family member'
      );
    }

    return `Based on your reflection about "${response.substring(0, 50)}...", here's a personalized message for ${recipient}.`;
  }
}

// Export singleton instance
export const legacyMessageBuilder = new LegacyMessageBuilder();
