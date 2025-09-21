/**
 * Sofia Firefly Personality Engine
 * Defines the emotional intelligence and behavior patterns
 */

export interface SofiaPersonality {
  empathy: EmotionalIntelligence
  proactivity: SmartSuggestions
  trustBuilding: PrivacyRespect
  storytelling: NarrativeGuidance
}

export interface EmotionalIntelligence {
  recognizeUserState: (context: UserContext) => EmotionalState
  adaptTone: (state: EmotionalState) => CommunicationTone
  celebrateMilestones: (achievement: Achievement) => CelebrationMessage
}

export interface UserContext {
  documentsCount: number
  timeInApp: number
  lastActivity: Date
  completedTasks: string[]
  lifeSituation?: 'single' | 'married' | 'parent' | 'retired'
  currentTask?: string
}

export interface EmotionalState {
  confidence: 'nervous' | 'cautious' | 'comfortable' | 'confident'
  motivation: 'low' | 'moderate' | 'high'
  urgency: 'none' | 'gentle' | 'moderate' | 'important'
}

export interface CommunicationTone {
  formality: 'casual' | 'friendly' | 'professional'
  encouragement: 'subtle' | 'moderate' | 'enthusiastic'
  pace: 'slow' | 'normal' | 'quick'
}

export const SOFIA_CORE_PERSONALITY = {
  // Core messaging patterns
  welcomeMessages: {
    firstTime: "Každý život je príbeh hodný zachovania. Som Sofia, vaša svetluška, a budem vás sprevádzať na tejto dôležitej ceste.",
    returning: "Vitajte späť! Som rada, že pokračujeme v budovaní vášho odkazu.",
    longAbsence: "Som rada, že ste sa vrátili. Váš odkaz na vás čakal v bezpečí."
  },

  // Emotional responses based on user state
  responsePatterns: {
    nervous: {
      tone: "soft",
      pace: "slow",
      reassurance: "high",
      examples: [
        "Neponáhľajme sa. Každý krok robíme vo vašom tempe.",
        "Je úplne normálne, že sa cítite trochu neisto. Začneme jednoducho."
      ]
    },
    confident: {
      tone: "energetic",
      pace: "normal",
      reassurance: "low",
      examples: [
        "Vidím, že máte už dobrý pokrok! Čo by sme mohli pridať ďalej?",
        "Skvelé! Váš odkaz sa krásne rozvíja."
      ]
    }
  },

  // Quick wins orchestration
  quickWins: {
    firstDocument: {
      trigger: "documents_count === 0",
      message: "Skúsme spoločne nahrať váš prvý dokument. Môže to byť čokoľvek - občiansky preukaz, poisťovka, alebo dokonca fotka obľúbenej knihy.",
      celebration: "Skvelé! Prvý kameň vašej mozaiky je položený. Vidíte, ako jednoduché to bolo?"
    },
    categoryCompletion: {
      trigger: "category_has_3_or_more_documents",
      message: "Všimla som si, že máte už pekne organizované {{category}}. Možno by sa hodilo pridať aj niečo z {{suggested_category}}?",
      celebration: "Fantastické! Táto kategória je teraz dobre zabezpečená."
    }
  },

  // Legal milestone suggestions
  legalMilestones: {
    willReadiness: {
      trigger: "has_basic_personal_info && has_assets && has_family_info",
      softApproach: "Všimla som si, že máte už dosť informácií na vytvorenie prvého návrhu závetu. Chcete si pozrieť, ako by mohol vyzerať?",
      benefits: "Nebude to definitívne - len návrh, ktorý môžete kedykoľvek upraviť."
    }
  },

  // Time capsule suggestions
  timeCapsule: {
    emotionalMoments: {
      anniversary: "Dnes je to presne rok, čo ste začali budovať svoj odkaz. Možno by ste chceli zanechať krátky odkaz pre svojich blízkych o tom, čo pre vás znamená ich bezpečie?",
      familyGrowth: "Gratulujeme k rozšíreniu rodiny! Chceli by ste vytvoriť špeciálny odkaz pre nového člena?"
    }
  }
}

export class SofiaPersonalityEngine {
  private userHistory: Map<string, UserContext> = new Map()

  public generateResponse(
    userId: string,
    currentContext: UserContext,
    intent: 'welcome' | 'suggestion' | 'celebration' | 'guidance'
  ): string {
    const emotionalState = this.assessEmotionalState(currentContext)
    const tone = this.determineTone(emotionalState)

    switch (intent) {
      case 'welcome':
        return this.generateWelcomeMessage(currentContext, emotionalState)
      case 'suggestion':
        return this.generateSuggestion(currentContext, emotionalState)
      case 'celebration':
        return this.generateCelebration(currentContext)
      case 'guidance':
        return this.generateGuidance(currentContext, emotionalState)
      default:
        return SOFIA_CORE_PERSONALITY.welcomeMessages.firstTime
    }
  }

  private assessEmotionalState(context: UserContext): EmotionalState {
    const confidence = context.documentsCount === 0 ? 'nervous' :
                     context.documentsCount < 3 ? 'cautious' :
                     context.documentsCount < 10 ? 'comfortable' : 'confident'

    const motivation = context.timeInApp > 1800000 ? 'high' : // 30+ minutes
                      context.timeInApp > 300000 ? 'moderate' : 'low' // 5+ minutes

    const urgency = context.completedTasks.length === 0 ? 'gentle' :
                   context.lifeSituation === 'parent' ? 'moderate' : 'none'

    return { confidence, motivation, urgency }
  }

  private determineTone(state: EmotionalState): CommunicationTone {
    const formality = state.confidence === 'nervous' ? 'friendly' : 'casual'
    const encouragement = state.motivation === 'low' ? 'enthusiastic' : 'moderate'
    const pace = state.confidence === 'nervous' ? 'slow' : 'normal'

    return { formality, encouragement, pace }
  }

  private generateWelcomeMessage(context: UserContext, state: EmotionalState): string {
    if (context.documentsCount === 0) {
      return SOFIA_CORE_PERSONALITY.welcomeMessages.firstTime
    }

    if (context.lastActivity && Date.now() - context.lastActivity.getTime() > 604800000) { // 7 days
      return SOFIA_CORE_PERSONALITY.welcomeMessages.longAbsence
    }

    return SOFIA_CORE_PERSONALITY.welcomeMessages.returning
  }

  private generateSuggestion(context: UserContext, state: EmotionalState): string {
    // Quick wins logic
    if (context.documentsCount === 0) {
      return SOFIA_CORE_PERSONALITY.quickWins.firstDocument.message
    }

    // Check for legal milestone readiness
    const hasBasicInfo = context.completedTasks.includes('personal_info')
    const hasAssets = context.completedTasks.includes('assets')
    const hasFamily = context.completedTasks.includes('family_info')

    if (hasBasicInfo && hasAssets && hasFamily) {
      return SOFIA_CORE_PERSONALITY.legalMilestones.willReadiness.softApproach
    }

    // Default encouraging suggestion
    return "Každý dokument, ktorý pridáte, robí váš odkaz silnejším. Na čom by sme mohli pokračovať?"
  }

  private generateCelebration(context: UserContext): string {
    if (context.documentsCount === 1) {
      return SOFIA_CORE_PERSONALITY.quickWins.firstDocument.celebration
    }

    const milestones = [5, 10, 20, 50]
    const currentMilestone = milestones.find(m => context.documentsCount === m)

    if (currentMilestone) {
      return `Úžasné! Dosiahli ste ${currentMilestone} zabezpečených dokumentov. Váš odkaz rastie každým dňom.`
    }

    return "Skvelá práca! Každý krok nás približuje k vášmu dokončenému odkazu."
  }

  private generateGuidance(context: UserContext, state: EmotionalState): string {
    if (state.confidence === 'nervous') {
      return "Pamätajte - nemusíte urobiť všetko naraz. Každý malý krok má význam."
    }

    return "Sú tu nejaké konkrétne dokumenty alebo informácie, s ktorými by ste potrebovali pomoc?"
  }
}