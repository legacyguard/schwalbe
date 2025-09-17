/**
 * TextManager for Sofia AI Assistant
 * Manages personality modes and response generation based on user context
 * Supports three communication modes: balanced, empathetic, and pragmatic
 */

export type SofiaMode = 'balanced' | 'empathetic' | 'pragmatic';

export interface TextManagerResponse {
  animation?: 'dance' | 'flutter' | 'glow' | 'still';
  emotion: 'concerned' | 'encouraging' | 'happy' | 'neutral' | 'proud';
  suggestions?: string[];
  text: string;
}

export interface UserContext {
  documentsCreated?: number;
  lastActivity?: Date;
  milestones?: string[];
  mood?: 'neutral' | 'positive' | 'stressed';
  name?: string;
}

export class TextManager {
  private mode: SofiaMode = 'balanced';
  private responseHistory: TextManagerResponse[] = [];

  constructor(initialMode?: SofiaMode) {
    if (initialMode) {
      this.mode = initialMode;
    }
  }

  setMode(mode: SofiaMode): void {
    this.mode = mode;
  }

  getMode(): SofiaMode {
    return this.mode;
  }

  generateGreeting(context: UserContext): TextManagerResponse {
    const { name, documentsCreated = 0, lastActivity } = context;

    let text = '';
    let emotion: TextManagerResponse['emotion'] = 'happy';
    let animation: TextManagerResponse['animation'] = 'flutter';

    const daysSinceLastActivity = lastActivity
      ? Math.floor(
          (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
        )
      : null;

    switch (this.mode) {
      case 'empathetic':
        if (daysSinceLastActivity && daysSinceLastActivity > 7) {
          text = `Welcome back, ${name || 'dear friend'}! I've missed you. Your legacy garden has been waiting patiently for your return. 🌱`;
          emotion = 'concerned';
          animation = 'glow';
        } else {
          text = `Hello ${name || 'there'}! It's wonderful to see you. How are you feeling today? Your legacy deserves your best energy. ✨`;
          emotion = 'happy';
          animation = 'dance';
        }
        break;

      case 'pragmatic':
        text = `Welcome, ${name || 'User'}. You have ${documentsCreated} documents. Let's get to work on securing your legacy.`;
        emotion = 'neutral';
        animation = 'still';
        break;

      case 'balanced':
      default:
        text = `Welcome back, ${name || 'friend'}! Your legacy garden has ${documentsCreated} documents growing. Ready to plant something new today? 🌿`;
        emotion = 'encouraging';
        animation = 'flutter';
        break;
    }

    const response: TextManagerResponse = {
      text,
      emotion,
      animation,
      suggestions: this.generateSuggestions(context),
    };

    this.responseHistory.push(response);
    return response;
  }

  generateMilestoneMessage(
    milestone: string,
    context: UserContext
  ): TextManagerResponse {
    let text = '';
    let emotion: TextManagerResponse['emotion'] = 'proud';

    switch (this.mode) {
      case 'empathetic':
        text = `🎉 This is amazing, ${context.name || 'dear one'}! You've reached "${milestone}"! I'm so proud of how far you've come. Your loved ones will cherish this forever.`;
        break;

      case 'pragmatic':
        text = `Milestone achieved: "${milestone}". Excellent progress. Your legacy is ${Math.round(((context.documentsCreated || 0) / 10) * 100)}% more secure.`;
        emotion = 'neutral';
        break;

      case 'balanced':
      default:
        text = `🌟 Congratulations on reaching "${milestone}"! This is a significant step in securing your legacy. Well done!`;
        break;
    }

    return {
      text,
      emotion,
      animation: 'dance',
    };
  }

  generateEncouragement(_context: UserContext): TextManagerResponse {
    const encouragements = {
      empathetic: [
        'Remember, every document you create is a gift of love to those who matter most. 💝',
        'Your story is unique and precious. Take your time to tell it right. 🦋',
        'I believe in you! Your legacy will bring comfort and guidance to many. 🌸',
      ],
      pragmatic: [
        'Consistent progress yields the best results. Consider setting a weekly goal.',
        'Data shows that users who create 3+ documents are 80% more satisfied with their legacy planning.',
        'Time invested now saves 10x the effort for your beneficiaries later.',
      ],
      balanced: [
        "You're making great progress! Every step counts toward a complete legacy. 🌱",
        'Your dedication to this process is admirable. Keep going! ⭐',
        "Small steps lead to big achievements. You're doing wonderfully! 🎯",
      ],
    };

    const modeEncouragements = encouragements[this.mode];
    const text =
      modeEncouragements[Math.floor(Math.random() * modeEncouragements.length)] || '';

    return {
      text,
      emotion: 'encouraging',
      animation: 'glow',
    };
  }

  generateError(errorType: string): TextManagerResponse {
    let text = '';

    switch (this.mode) {
      case 'empathetic':
        text =
          "Oh dear, something went wrong. Don't worry, we'll figure this out together. 🤗";
        break;
      case 'pragmatic':
        text = `Error: ${errorType}. Please try again or contact support if the issue persists.`;
        break;
      case 'balanced':
      default:
        text =
          "Oops! Something didn't work as expected. Let's try that again. 🔄";
        break;
    }

    return {
      text,
      emotion: 'concerned',
      animation: 'still',
    };
  }

  private generateSuggestions(context: UserContext): string[] {
    const suggestions: string[] = [];

    if (!context.documentsCreated || context.documentsCreated === 0) {
      suggestions.push('Create your first will document');
      suggestions.push('Add emergency contacts');
    } else if (context.documentsCreated < 3) {
      suggestions.push('Add healthcare directives');
      suggestions.push('Document your digital assets');
    } else {
      suggestions.push('Review and update existing documents');
      suggestions.push('Share access with trusted contacts');
    }

    return suggestions;
  }

  getResponseHistory(): TextManagerResponse[] {
    return this.responseHistory;
  }

  clearHistory(): void {
    this.responseHistory = [];
  }
}

export const createTextManager = (mode?: SofiaMode) => new TextManager(mode);
