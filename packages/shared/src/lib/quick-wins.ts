/**
 * Quick Wins Orchestration System
 * Tracks user progress and suggests optimal next actions
 */

// Import types locally - in real app these would be from a shared types package
export interface UserContext {
  documentsCount: number
  timeInApp: number
  lastActivity: Date
  completedTasks: string[]
  lifeSituation?: 'single' | 'married' | 'parent' | 'retired'
  currentTask?: string
}

export interface QuickWinOpportunity {
  type: 'first_document' | 'milestone_achievement' | 'category_completion'
  message: string
  nextSuggestion: string
}

export interface LegalMilestone {
  type: 'will_ready' | 'insurance_needed' | 'guardian_setup'
  readinessScore: number
  message: string
  missingElements: string[]
}

export interface ProgressMetrics {
  documentsCount: number
  categoriesCompleted: string[]
  milestonesAchieved: string[]
  timeInApp: number
  lastActiveDate: Date
  engagementScore: number // 0-100
}

export interface UserAchievement {
  id: string
  type: 'document_milestone' | 'category_completion' | 'legal_milestone' | 'engagement' | 'time_based'
  title: string
  description: string
  unlockedAt: Date
  celebrationShown: boolean
  rewardType?: 'badge' | 'feature_unlock' | 'celebration_message'
}

export interface NextAction {
  id: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'document_upload' | 'categorization' | 'legal_prep' | 'family_setup' | 'security'
  title: string
  description: string
  estimatedTime: number // minutes
  requiredData?: string[]
  unlockConditions?: string[]
}

export class QuickWinsOrchestrator {
  private userProgress: Map<string, ProgressMetrics> = new Map()
  private achievements: Map<string, UserAchievement[]> = new Map()

  // Track user progress and detect opportunities
  public analyzeUserProgress(userId: string, context: UserContext): {
    quickWins: QuickWinOpportunity[]
    nextActions: NextAction[]
    achievements: UserAchievement[]
    engagementTrends: 'increasing' | 'stable' | 'declining'
  } {
    const currentProgress = this.updateProgress(userId, context)

    const quickWins = this.detectQuickWinOpportunities(context)
    const nextActions = this.generateNextActions(context, currentProgress)
    const newAchievements = this.checkForNewAchievements(userId, context, currentProgress)
    const engagementTrends = this.analyzeEngagementTrends(userId, currentProgress)

    return {
      quickWins,
      nextActions,
      achievements: newAchievements,
      engagementTrends
    }
  }

  private updateProgress(userId: string, context: UserContext): ProgressMetrics {
    const existing = this.userProgress.get(userId)
    const now = new Date()

    const progress: ProgressMetrics = {
      documentsCount: context.documentsCount,
      categoriesCompleted: this.identifyCompletedCategories(context),
      milestonesAchieved: context.completedTasks,
      timeInApp: context.timeInApp,
      lastActiveDate: now,
      engagementScore: this.calculateEngagementScore(context, existing)
    }

    this.userProgress.set(userId, progress)
    return progress
  }

  private identifyCompletedCategories(context: UserContext): string[] {
    const categories = ['personal_info', 'financial_documents', 'housing_documents', 'health_documents', 'legal_documents']
    return categories.filter(cat => context.completedTasks.includes(cat))
  }

  private calculateEngagementScore(context: UserContext, previous?: ProgressMetrics): number {
    let score = 0

    // Document upload engagement (0-40 points)
    score += Math.min(40, context.documentsCount * 4)

    // Time spent engagement (0-30 points)
    const hoursSpent = context.timeInApp / (1000 * 60 * 60)
    score += Math.min(30, hoursSpent * 10)

    // Task completion engagement (0-20 points)
    score += Math.min(20, context.completedTasks.length * 3)

    // Consistency bonus (0-10 points)
    if (previous && Date.now() - previous.lastActiveDate.getTime() < 7 * 24 * 60 * 60 * 1000) {
      score += 10
    }

    return Math.min(100, score)
  }

  private detectQuickWinOpportunities(context: UserContext): QuickWinOpportunity[] {
    const opportunities: QuickWinOpportunity[] = []

    // First document opportunity
    if (context.documentsCount === 0) {
      opportunities.push({
        type: 'first_document',
        message: 'Skúsme spoločne nahrať váš prvý dokument. Môže to byť čokoľvek - občiansky preukaz, poisťovka, alebo dokonca fotka obľúbenej knihy.',
        nextSuggestion: 'Kliknite na "Pridať dokument" a začneme!'
      })
    }

    // Milestone achievements
    const milestones = [1, 5, 10, 20, 50, 100]
    if (milestones.includes(context.documentsCount)) {
      opportunities.push({
        type: 'milestone_achievement',
        message: `Úžasné! Dosiahli ste ${context.documentsCount} zabezpečených dokumentov. To je skutočný pokrok!`,
        nextSuggestion: this.generateMilestoneNextSuggestion(context.documentsCount)
      })
    }

    // Category completion
    const completedCategories = this.identifyCompletedCategories(context)
    if (completedCategories.length > 0) {
      const lastCompleted = completedCategories[completedCategories.length - 1]
      opportunities.push({
        type: 'category_completion',
        message: `Fantastické! Kategória "${this.getCategoryDisplayName(lastCompleted)}" je teraz dobre zabezpečená.`,
        nextSuggestion: this.suggestNextCategory(completedCategories)
      })
    }

    return opportunities
  }

  private generateNextActions(context: UserContext, progress: ProgressMetrics): NextAction[] {
    const actions: NextAction[] = []

    // Immediate actions based on current state
    if (context.documentsCount === 0) {
      actions.push({
        id: 'first_upload',
        priority: 'high',
        category: 'document_upload',
        title: 'Nahrať prvý dokument',
        description: 'Začnite s akýmkoľvek dokumentom - občiansky preukaz, rodný list, alebo fotka',
        estimatedTime: 5
      })
    }

    if (context.documentsCount > 0 && context.documentsCount < 5) {
      actions.push({
        id: 'build_momentum',
        priority: 'medium',
        category: 'document_upload',
        title: 'Pridať ďalšie dokumenty',
        description: 'Pokračujte v budovaní vašej kolekcie. Každý dokument má význam.',
        estimatedTime: 10
      })
    }

    // Legal readiness actions
    if (this.isReadyForLegalDocuments(context)) {
      actions.push({
        id: 'will_preparation',
        priority: 'high',
        category: 'legal_prep',
        title: 'Príprava závetu',
        description: 'Máte dostatok informácií na vytvorenie základného závetu',
        estimatedTime: 30,
        requiredData: ['personal_info', 'assets', 'family_info']
      })
    }

    // Security actions
    if (context.documentsCount >= 5 && !context.completedTasks.includes('guardians_setup')) {
      actions.push({
        id: 'setup_guardians',
        priority: 'medium',
        category: 'family_setup',
        title: 'Nastaviť strážcov',
        description: 'Určte dôveryhodné osoby, ktoré budú mať prístup k vášmu odkazu',
        estimatedTime: 15
      })
    }

    // Sort by priority
    return actions.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  private checkForNewAchievements(userId: string, context: UserContext, progress: ProgressMetrics): UserAchievement[] {
    const existingAchievements = this.achievements.get(userId) || []
    const newAchievements: UserAchievement[] = []

    // Document milestones
    const documentMilestones = [1, 5, 10, 20, 50, 100]
    for (const milestone of documentMilestones) {
      if (context.documentsCount >= milestone &&
          !existingAchievements.some(a => a.id === `docs_${milestone}`)) {
        newAchievements.push({
          id: `docs_${milestone}`,
          type: 'document_milestone',
          title: `${milestone} dokumentov`,
          description: `Zabezpečili ste ${milestone} dokumentov vo vašom odkaze`,
          unlockedAt: new Date(),
          celebrationShown: false,
          rewardType: milestone >= 50 ? 'feature_unlock' : 'badge'
        })
      }
    }

    // Category completions
    const categories = ['personal_info', 'financial_documents', 'housing_documents', 'health_documents']
    for (const category of categories) {
      if (context.completedTasks.includes(category.task) &&
          !existingAchievements.some(a => a.id === `category_${category.task}`)) {
        newAchievements.push({
          id: `category_${category.task}`,
          type: 'category_completion',
          title: `Kategória ${category.name}`,
          description: `Dokončili ste kategóriu ${category.name}`,
          unlockedAt: new Date(),
          celebrationShown: false,
          rewardType: 'badge'
        })
      }
    }

    // Engagement achievements
    if (progress.engagementScore >= 75 &&
        !existingAchievements.some(a => a.id === 'high_engagement')) {
      newAchievements.push({
        id: 'high_engagement',
        type: 'engagement',
        title: 'Aktívny používateľ',
        description: 'Dosahujete vysokú mieru zapojenia do budovania odkazu',
        unlockedAt: new Date(),
        celebrationShown: false,
        rewardType: 'feature_unlock'
      })
    }

    // Update stored achievements
    const allAchievements = [...existingAchievements, ...newAchievements]
    this.achievements.set(userId, allAchievements)

    return newAchievements
  }

  private analyzeEngagementTrends(userId: string, current: ProgressMetrics): 'increasing' | 'stable' | 'declining' {
    // Simple trend analysis - in real app would look at historical data
    if (current.engagementScore >= 70) return 'increasing'
    if (current.engagementScore >= 40) return 'stable'
    return 'declining'
  }

  private isReadyForLegalDocuments(context: UserContext): boolean {
    const required = ['personal_info', 'assets', 'family_info']
    return required.every(req => context.completedTasks.includes(req))
  }

  private getCategoryDisplayName(category: string): string {
    const names: Record<string, string> = {
      'personal_info': 'Osobné údaje',
      'financial_documents': 'Financie',
      'housing_documents': 'Bývanie',
      'health_documents': 'Zdravie',
      'legal_documents': 'Právne dokumenty'
    }
    return names[category] || category
  }

  private generateMilestoneNextSuggestion(count: number): string {
    if (count === 1) return 'Skúsme pridať ešte jeden dokument. Každý ďalší robí váš odkaz silnejším.'
    if (count === 5) return 'Máte už pekný základ! Možno by ste chceli dokončiť nejakú kategóriu?'
    if (count === 10) return 'Skvelý pokrok! Možno je čas zamyslieť sa nad právnymi dokumentmi?'
    if (count >= 20) return 'Váš odkaz je už veľmi bohatý. Zvážte nastavenie strážcov pre vašich blízkych.'
    return 'Fantastická práca! Pokračujte v tom, čo robíte.'
  }

  private suggestNextCategory(completed: string[]): string {
    const all = ['personal_info', 'financial_documents', 'housing_documents', 'health_documents', 'legal_documents']
    const remaining = all.filter(cat => !completed.includes(cat))

    if (remaining.length === 0) return 'Máte dokončené všetky základné kategórie!'

    const next = remaining[0]
    if (next) {
      return `Možno by sme mohli pokračovať s kategóriou ${this.getCategoryDisplayName(next)}?`
    }
    return 'Skvelé! Pokračujme v budovaní vášho odkazu.'
  }

  // Public methods for UI integration
  public getProgressSummary(userId: string): ProgressMetrics | null {
    return this.userProgress.get(userId) || null
  }

  public getAchievements(userId: string): UserAchievement[] {
    return this.achievements.get(userId) || []
  }

  public markCelebrationShown(userId: string, achievementId: string): void {
    const achievements = this.achievements.get(userId) || []
    const achievement = achievements.find(a => a.id === achievementId)
    if (achievement) {
      achievement.celebrationShown = true
      this.achievements.set(userId, achievements)
    }
  }

  // Integration with Sofia personality
  public generateSofiaMotivationalMessage(context: UserContext, trend: 'increasing' | 'stable' | 'declining'): string {
    if (trend === 'declining') {
      return "Vidím, že ste sa dlhšie neprihlásili. Váš odkaz na vás čaká v bezpečí. Chcete pokračovať tam, kde ste skončili?"
    }

    if (trend === 'increasing') {
      return "Milujem vašu energiu! Váš pokrok je naozaj inšpirujúci. Pokračujme v budovaní vášho odkazu."
    }

    return "Robíte to skvelé tempom. Každý krok má význam a váš odkaz sa krásne rozvíja."
  }
}

// Singleton instance for app-wide usage
export const quickWinsOrchestrator = new QuickWinsOrchestrator()