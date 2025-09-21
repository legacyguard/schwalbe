import { UserContext, ContextService, KnowledgeBaseEntry } from '../types/index';

export class SimpleContextService implements ContextService {
  private contexts = new Map<string, UserContext>();

  async getUserContext(sessionId: string): Promise<UserContext> {
    return this.contexts.get(sessionId) || {
      sessionId,
      onboardingCompleted: false,
      completedMilestones: [],
      preferences: {}
    };
  }

  async updateUserContext(sessionId: string, updates: Partial<UserContext>): Promise<void> {
    const existing = await this.getUserContext(sessionId);
    this.contexts.set(sessionId, { ...existing, ...updates });
  }

  async getRelevantKnowledge(query: string, context: UserContext): Promise<KnowledgeBaseEntry[]> {
    // Simple keyword-based matching for now
    const knowledgeBase: KnowledgeBaseEntry[] = [
      {
        id: 'will_basics',
        category: 'planning',
        question: 'What is a will?',
        answer: 'A will is a legal document that specifies how your assets should be distributed after your death.',
        keywords: ['will', 'testament', 'legal', 'document', 'basics'],
        relatedMilestones: ['create_will']
      },
      {
        id: 'executor_role',
        category: 'guardians',
        question: 'What does an executor do?',
        answer: 'An executor manages your estate, pays debts, and distributes assets according to your will.',
        keywords: ['executor', 'estate', 'manage', 'responsibilities'],
        relatedMilestones: ['create_will']
      },
      {
        id: 'guardians_importance',
        category: 'guardians',
        question: 'Why are guardians important?',
        answer: 'Guardians care for minor children if both parents pass away. Choose someone trustworthy and capable.',
        keywords: ['guardians', 'children', 'minor', 'care', 'trustworthy'],
        relatedMilestones: ['designate_guardians']
      },
      {
        id: 'asset_inventory',
        category: 'planning',
        question: 'What assets should I include?',
        answer: 'Include bank accounts, investments, property, vehicles, and personal belongings in your asset inventory.',
        keywords: ['assets', 'inventory', 'property', 'accounts', 'investments'],
        relatedMilestones: ['inventory_assets']
      }
    ];

    const queryLower = query.toLowerCase();
    const relevant = knowledgeBase.filter(entry =>
      entry.keywords.some(keyword => queryLower.includes(keyword)) ||
      entry.question.toLowerCase().includes(queryLower)
    );

    // Prioritize based on user context
    if (context.persona?.familyStatus === 'family') {
      relevant.sort((a, b) => {
        const aHasGuardians = a.relatedMilestones?.includes('designate_guardians');
        const bHasGuardians = b.relatedMilestones?.includes('designate_guardians');
        if (aHasGuardians && !bHasGuardians) return -1;
        if (!aHasGuardians && bHasGuardians) return 1;
        return 0;
      });
    }

    return relevant.slice(0, 3); // Return top 3 matches
  }
}

export const contextService = new SimpleContextService();