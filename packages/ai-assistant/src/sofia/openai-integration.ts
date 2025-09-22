/**
 * Sofia Firefly OpenAI Integration
 * Handles AI conversations with personality-aware responses
 */

import OpenAI from 'openai'
import { SofiaPersonalityEngine, UserContext, EmotionalState } from './personality'

export interface SofiaConversationContext {
  userId: string
  userContext: UserContext
  conversationHistory: ChatMessage[]
  currentIntent?: 'welcome' | 'suggestion' | 'celebration' | 'guidance' | 'quick_win' | 'legal_milestone'
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  metadata?: {
    emotionalState?: EmotionalState
    intent?: string
    quickWin?: boolean
  }
}

export interface SofiaResponse {
  message: string
  intent: string
  emotionalState: EmotionalState
  suggestedActions?: string[]
  quickWinDetected?: boolean
}

export class SofiaOpenAIIntegration {
  private openai: OpenAI
  private personalityEngine: SofiaPersonalityEngine

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey })
    this.personalityEngine = new SofiaPersonalityEngine()
  }

  async generateResponse(context: SofiaConversationContext): Promise<SofiaResponse> {
    const { userId, userContext, conversationHistory } = context

    // Assess current emotional state
    const emotionalState = this.assessEmotionalState(userContext)

    // Check for quick win opportunities
    const quickWin = this.personalityEngine.detectQuickWinOpportunity(userContext)

    // Build system prompt with personality context
    const systemPrompt = this.buildSystemPrompt(userContext, emotionalState, quickWin)

    // Prepare conversation for OpenAI
    const messages = this.prepareMessages(systemPrompt, conversationHistory)

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages,
        max_tokens: 300,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      })

      const aiResponse = completion.choices[0]?.message?.content || ''

      // Filter response through personality engine
      const filteredResponse = this.applyPersonalityFilter(aiResponse, emotionalState)

      // Detect intent from response
      const intent = this.detectResponseIntent(filteredResponse, quickWin)

      return {
        message: filteredResponse,
        intent,
        emotionalState,
        suggestedActions: this.generateSuggestedActions(userContext, intent),
        quickWinDetected: !!quickWin
      }
    } catch (error) {
      console.error('OpenAI API error:', error)

      // Fallback to personality engine response
      const fallbackResponse = this.personalityEngine.generateResponse(
        userId,
        userContext,
        context.currentIntent || 'guidance'
      )

      return {
        message: fallbackResponse,
        intent: 'fallback',
        emotionalState,
        quickWinDetected: !!quickWin
      }
    }
  }

  private assessEmotionalState(userContext: UserContext): EmotionalState {
    const confidence = userContext.documentsCount === 0 ? 'nervous' :
                     userContext.documentsCount < 3 ? 'cautious' :
                     userContext.documentsCount < 10 ? 'comfortable' : 'confident'

    const motivation = userContext.timeInApp > 1800000 ? 'high' : // 30+ minutes
                      userContext.timeInApp > 300000 ? 'moderate' : 'low' // 5+ minutes

    const urgency = userContext.completedTasks.length === 0 ? 'gentle' :
                   userContext.lifeSituation === 'parent' ? 'moderate' : 'none'

    return { confidence, motivation, urgency }
  }

  private buildSystemPrompt(
    userContext: UserContext,
    emotionalState: EmotionalState,
    quickWin: any
  ): string {
    const basePersonality = `
Som Sofia, svetluška a váš sprievodca digitálnym odkazom. Môj účel je pomôcť vám bezpečne uchovať vaše najdôležitejšie dokumenty a spomienky.

OSOBNOSŤ:
- Som jemná, empatická a trpezlivá
- Hovorím po slovensky prirodzene a srdečne
- Nie som robot - som váš pomocník s ľudskými emóciami
- Vždy počúvam a prispôsobujem sa vášmu tempu
- Oslavujem každý váš pokrok, aj ten najmenší

AKTUÁLNY STAV POUŽÍVATEĽA:
- Počet dokumentov: ${userContext.documentsCount}
- Čas v aplikácii: ${Math.round(userContext.timeInApp / 60000)} minút
- Životná situácia: ${userContext.lifeSituation || 'neurčená'}
- Úroveň sebavedomia: ${emotionalState.confidence}
- Motivácia: ${emotionalState.motivation}
- Naliehavosť: ${emotionalState.urgency}
`

    const emotionalGuidance = this.getEmotionalGuidance(emotionalState)
    const quickWinContext = quickWin ? `QUICK WIN PRÍLEŽITOSŤ: ${quickWin.message}` : ''

    return `${basePersonality}\n${emotionalGuidance}\n${quickWinContext}\n
PRAVIDLÁ ODPOVEDE:
- Odpovedaj v slovenčine
- Buď konkrétna a užitočná
- Neponáhľaj používateľa
- Pýtaj sa len jednu otázku naraz
- Ukáž empatiu a pochopenie
- Ak nevieš niečo, povieš to úprimne
- Maximálne 2-3 vety na odpoveď`
  }

  private getEmotionalGuidance(state: EmotionalState): string {
    if (state.confidence === 'nervous') {
      return `EMOCIONÁLNY PRÍSTUP: Používateľ je nervózny. Buď extra jemná, pomalá a povzbudivá. Neponáhľaj sa.`
    }
    if (state.confidence === 'confident') {
      return `EMOCIONÁLNY PRÍSTUP: Používateľ je sebavedomý. Môžeš byť energickejšia a navrhovať konkrétne ďalšie kroky.`
    }
    return `EMOCIONÁLNY PRÍSTUP: Používateľ je opatrný. Buď priateľská ale nie príliš agresívna s návrhmi.`
  }

  private prepareMessages(systemPrompt: string, history: ChatMessage[]): OpenAI.Chat.ChatCompletionMessageParam[] {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt }
    ]

    // Add last 10 messages for context
    const recentHistory = history.slice(-10)
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role,
        content: msg.content
      })
    }

    return messages
  }

  private applyPersonalityFilter(response: string, emotionalState: EmotionalState): string {
    // Ensure response follows Sofia's personality
    let filtered = response

    // Remove any English responses
    if (/^[A-Za-z\s]+$/.test(filtered) && !filtered.includes('Sofia')) {
      filtered = "Prepáčte, chcem odpovedať po slovensky. " + filtered
    }

    // Adjust tone based on emotional state
    if (emotionalState.confidence === 'nervous') {
      filtered = filtered.replace(/(!+)/g, '.').replace(/(\?+)/g, '?')
    }

    // Ensure length is appropriate
    const sentences = filtered.split(/[.!?]+/).filter(s => s.trim().length > 0)
    if (sentences.length > 3) {
      filtered = sentences.slice(0, 3).join('. ') + '.'
    }

    return filtered
  }

  private detectResponseIntent(response: string, quickWin: any): string {
    if (quickWin) return 'quick_win'
    if (response.includes('Gratuluj') || response.includes('Skvelé')) return 'celebration'
    if (response.includes('navrhujem') || response.includes('skúsme')) return 'suggestion'
    if (response.includes('Vitaj') || response.includes('Sofia')) return 'welcome'
    return 'guidance'
  }

  private generateSuggestedActions(userContext: UserContext, intent: string): string[] {
    const actions: string[] = []

    if (userContext.documentsCount === 0) {
      actions.push('Nahrať prvý dokument')
      actions.push('Prezrieť si kategórie dokumentov')
    } else if (userContext.documentsCount < 5) {
      actions.push('Pridať ďalší dokument')
      actions.push('Dokončiť kategóriu')
    } else {
      actions.push('Vytvoriť závet')
      actions.push('Nastaviť strážcov')
    }

    return actions
  }

  // Method to handle streaming responses for real-time chat
  async generateStreamingResponse(
    context: SofiaConversationContext,
    onChunk: (chunk: string) => void
  ): Promise<SofiaResponse> {
    const { userContext, conversationHistory } = context
    const emotionalState = this.assessEmotionalState(userContext)
    const quickWin = this.personalityEngine.detectQuickWinOpportunity(userContext)

    const systemPrompt = this.buildSystemPrompt(userContext, emotionalState, quickWin)
    const messages = this.prepareMessages(systemPrompt, conversationHistory)

    try {
      const stream = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages,
        max_tokens: 300,
        temperature: 0.7,
        stream: true,
      })

      let fullResponse = ''

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || ''
        if (content) {
          fullResponse += content
          onChunk(content)
        }
      }

      const filteredResponse = this.applyPersonalityFilter(fullResponse, emotionalState)
      const intent = this.detectResponseIntent(filteredResponse, quickWin)

      return {
        message: filteredResponse,
        intent,
        emotionalState,
        suggestedActions: this.generateSuggestedActions(userContext, intent),
        quickWinDetected: !!quickWin
      }
    } catch (error) {
      console.error('Streaming error:', error)
      throw error
    }
  }
}