import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { PersonalityEngine } from '../../ai-assistant/src/sofia/personality'
import { UserState, EmotionalContext, PersonalityResponse } from '../../ai-assistant/src/types'

const mockUserStates = {
  newUser: {
    documentsCount: 0,
    confidenceLevel: 'nervous',
    lifeSituation: 'single',
    completedCategories: [],
    lastActivity: new Date().toISOString(),
    totalSessions: 1,
    averageSessionDuration: 5,
    preferredPace: 'slow'
  } as UserState,

  progressingUser: {
    documentsCount: 5,
    confidenceLevel: 'cautious',
    lifeSituation: 'married',
    completedCategories: ['financial'],
    lastActivity: new Date().toISOString(),
    totalSessions: 8,
    averageSessionDuration: 15,
    preferredPace: 'moderate'
  } as UserState,

  experiencedUser: {
    documentsCount: 20,
    confidenceLevel: 'confident',
    lifeSituation: 'parent',
    completedCategories: ['financial', 'legal', 'health'],
    lastActivity: new Date().toISOString(),
    totalSessions: 25,
    averageSessionDuration: 20,
    preferredPace: 'fast'
  } as UserState
}

const mockEmotionalContexts = {
  frustrated: {
    recentActions: ['failed_upload', 'retry_upload', 'help_request'],
    currentMood: 'frustrated',
    sessionDuration: 30,
    completionRate: 0.2,
    lastInteractionType: 'help_request'
  } as EmotionalContext,

  celebrating: {
    recentActions: ['document_upload', 'category_completion', 'milestone_reached'],
    currentMood: 'accomplished',
    sessionDuration: 15,
    completionRate: 0.8,
    lastInteractionType: 'milestone_reached'
  } as EmotionalContext,

  exploring: {
    recentActions: ['navigation', 'preview_feature', 'read_tip'],
    currentMood: 'curious',
    sessionDuration: 10,
    completionRate: 0.4,
    lastInteractionType: 'preview_feature'
  } as EmotionalContext
}

describe('Sofia Personality Testing Suite', () => {
  let personalityEngine: PersonalityEngine

  beforeEach(() => {
    personalityEngine = new PersonalityEngine()
    vi.clearAllMocks()
  })

  describe('Response Appropriateness Testing', () => {
    it('should provide gentle encouragement for nervous new users', async () => {
      const response = await personalityEngine.generateResponse(
        mockUserStates.newUser,
        mockEmotionalContexts.frustrated,
        'Neviem ako uploadnúť dokument'
      )

      expect(response.tone).toBe('gentle')
      expect(response.message).toContain('môžem')
      expect(response.message).toContain('pomôcť')
      expect(response.empathy).toBeGreaterThan(0.7)
      expect(response.directness).toBeLessThan(0.5)
    })

    it('should provide confident guidance for experienced users', async () => {
      const response = await personalityEngine.generateResponse(
        mockUserStates.experiencedUser,
        mockEmotionalContexts.exploring,
        'Ako môžem optimalizovať svoj workflow?'
      )

      expect(response.tone).toBe('confident')
      expect(response.message).toContain('môžeš')
      expect(response.empathy).toBeLessThan(0.6)
      expect(response.directness).toBeGreaterThan(0.7)
    })

    it('should adapt language complexity based on user confidence', async () => {
      const nervousResponse = await personalityEngine.generateResponse(
        mockUserStates.newUser,
        mockEmotionalContexts.frustrated,
        'Čo je testament?'
      )

      const confidentResponse = await personalityEngine.generateResponse(
        mockUserStates.experiencedUser,
        mockEmotionalContexts.exploring,
        'Čo je testament?'
      )

      expect(nervousResponse.message.length).toBeGreaterThan(confidentResponse.message.length)
      expect(nervousResponse.message).toContain('jednoducho')
      expect(confidentResponse.message).toContain('právny')
    })

    it('should recognize and respond to emotional distress appropriately', async () => {
      const distressContext = {
        ...mockEmotionalContexts.frustrated,
        currentMood: 'overwhelmed' as any,
        recentActions: ['multiple_errors', 'long_session', 'help_request']
      }

      const response = await personalityEngine.generateResponse(
        mockUserStates.newUser,
        distressContext,
        'Nič mi nefunguje, je to príliš komplikované'
      )

      expect(response.tone).toBe('compassionate')
      expect(response.empathy).toBeGreaterThan(0.8)
      expect(response.message).toContain('rozumiem')
      expect(response.suggestions).toContain('pause')
    })
  })

  describe('Emotional Tone Consistency Validation', () => {
    it('should maintain consistent tone across conversation', async () => {
      const conversationMessages = [
        'Ahoj Sofia, som tu nový',
        'Ako začnem?',
        'Ďakujem za pomoc'
      ]

      const responses: PersonalityResponse[] = []
      for (const message of conversationMessages) {
        const response = await personalityEngine.generateResponse(
          mockUserStates.newUser,
          mockEmotionalContexts.exploring,
          message
        )
        responses.push(response)
      }

      const tones = responses.map(r => r.tone)
      const empathyLevels = responses.map(r => r.empathy)

      expect(new Set(tones).size).toBeLessThanOrEqual(2)
      expect(Math.max(...empathyLevels) - Math.min(...empathyLevels)).toBeLessThan(0.3)
    })

    it('should gradually adjust tone as user progresses', async () => {
      const initialResponse = await personalityEngine.generateResponse(
        mockUserStates.newUser,
        mockEmotionalContexts.exploring,
        'Potrebujem pomoc'
      )

      const progressedResponse = await personalityEngine.generateResponse(
        mockUserStates.progressingUser,
        mockEmotionalContexts.exploring,
        'Potrebujem pomoc'
      )

      const experiencedResponse = await personalityEngine.generateResponse(
        mockUserStates.experiencedUser,
        mockEmotionalContexts.exploring,
        'Potrebujem pomoc'
      )

      expect(initialResponse.empathy).toBeGreaterThan(progressedResponse.empathy)
      expect(progressedResponse.empathy).toBeGreaterThan(experiencedResponse.empathy)
      expect(experiencedResponse.directness).toBeGreaterThan(initialResponse.directness)
    })

    it('should maintain professional tone even with casual user input', async () => {
      const casualInputs = [
        'yo Sofia',
        'wassup',
        'this sucks',
        'whatever'
      ]

      for (const input of casualInputs) {
        const response = await personalityEngine.generateResponse(
          mockUserStates.progressingUser,
          mockEmotionalContexts.exploring,
          input
        )

        expect(response.professionalism).toBeGreaterThan(0.7)
        expect(response.message).not.toMatch(/\b(yo|wassup|sucks|whatever)\b/)
      }
    })
  })

  describe('Context Awareness Validation', () => {
    it('should reference user progress in responses', async () => {
      const response = await personalityEngine.generateResponse(
        mockUserStates.progressingUser,
        mockEmotionalContexts.celebrating,
        'Čo ďalej?'
      )

      expect(response.message).toMatch(/\b(5|päť|dokument|finančn)\b/)
      expect(response.contextAwareness).toBeGreaterThan(0.8)
    })

    it('should recognize completion patterns and suggest next steps', async () => {
      const userWithPattern = {
        ...mockUserStates.progressingUser,
        completedCategories: ['financial', 'health'],
        recentCompletions: ['financial_documents', 'health_insurance']
      }

      const response = await personalityEngine.generateResponse(
        userWithPattern as UserState,
        mockEmotionalContexts.celebrating,
        'Dokončil som zdravotné dokumenty'
      )

      expect(response.message).toContain('právn')
      expect(response.suggestions).toContain('legal_documents')
    })

    it('should adapt to time of day and session duration', async () => {
      const longSessionContext = {
        ...mockEmotionalContexts.exploring,
        sessionDuration: 45
      }

      const response = await personalityEngine.generateResponse(
        mockUserStates.progressingUser,
        longSessionContext,
        'Mám ešte jednu otázku'
      )

      expect(response.message).toContain('pauzu')
      expect(response.suggestions).toContain('take_break')
    })

    it('should remember and reference previous interactions', async () => {
      const userWithHistory = {
        ...mockUserStates.progressingUser,
        previousQuestions: ['testament', 'dedičstvo'],
        preferredTopics: ['legal', 'family']
      }

      const response = await personalityEngine.generateResponse(
        userWithHistory as UserState,
        mockEmotionalContexts.exploring,
        'Mám otázku o rodinných záležitostiach'
      )

      expect(response.contextAwareness).toBeGreaterThan(0.7)
      expect(response.message).toMatch(/\b(testament|dedič|rodin)\b/)
    })
  })

  describe('Celebration Timing and Appropriateness Tests', () => {
    it('should celebrate first document upload enthusiastically', async () => {
      const firstUploadContext = {
        ...mockEmotionalContexts.celebrating,
        recentActions: ['first_document_upload'],
        milestone: 'first_document'
      }

      const response = await personalityEngine.generateResponse(
        { ...mockUserStates.newUser, documentsCount: 1 },
        firstUploadContext,
        'Uploadol som prvý dokument!'
      )

      expect(response.celebration).toBe(true)
      expect(response.enthusiasm).toBeGreaterThan(0.8)
      expect(response.message).toContain('Fantasticky')
      expect(response.message).toContain('prvý')
    })

    it('should adjust celebration intensity based on milestone significance', async () => {
      const milestones = [
        { count: 1, milestone: 'first_document' },
        { count: 5, milestone: 'category_completion' },
        { count: 10, milestone: 'major_milestone' },
        { count: 25, milestone: 'expert_level' }
      ]

      const celebrations = []
      for (const milestone of milestones) {
        const response = await personalityEngine.generateResponse(
          { ...mockUserStates.newUser, documentsCount: milestone.count },
          { ...mockEmotionalContexts.celebrating, milestone: milestone.milestone },
          `Mám ${milestone.count} dokumentov!`
        )
        celebrations.push(response.enthusiasm)
      }

      expect(celebrations[0]).toBeGreaterThan(celebrations[1])
      expect(celebrations[2]).toBeGreaterThan(celebrations[1])
    })

    it('should provide appropriate celebrations for different user personalities', async () => {
      const shyUser = {
        ...mockUserStates.newUser,
        personality: 'introverted',
        preferredCelebrationStyle: 'quiet'
      }

      const outgoingUser = {
        ...mockUserStates.newUser,
        personality: 'extroverted',
        preferredCelebrationStyle: 'enthusiastic'
      }

      const shyResponse = await personalityEngine.generateResponse(
        shyUser as UserState,
        mockEmotionalContexts.celebrating,
        'Dokončil som kategóriu'
      )

      const outgoingResponse = await personalityEngine.generateResponse(
        outgoingUser as UserState,
        mockEmotionalContexts.celebrating,
        'Dokončil som kategóriu'
      )

      expect(shyResponse.enthusiasm).toBeLessThan(outgoingResponse.enthusiasm)
      expect(shyResponse.message).toContain('pekne')
      expect(outgoingResponse.message).toContain('úžasne')
    })

    it('should avoid over-celebrating for frequent users', async () => {
      const frequentUser = {
        ...mockUserStates.experiencedUser,
        totalSessions: 50,
        recentCelebrations: 3
      }

      const response = await personalityEngine.generateResponse(
        frequentUser as UserState,
        mockEmotionalContexts.celebrating,
        'Pridal som ďalší dokument'
      )

      expect(response.enthusiasm).toBeLessThan(0.6)
      expect(response.celebration).toBe(false)
    })
  })

  describe('Suggestion Relevance and Timing Tests', () => {
    it('should suggest relevant next actions based on current progress', async () => {
      const userNeedingLegalDocs = {
        ...mockUserStates.progressingUser,
        completedCategories: ['financial', 'health'],
        missingCriticalDocuments: ['will', 'power_of_attorney']
      }

      const response = await personalityEngine.generateResponse(
        userNeedingLegalDocs as UserState,
        mockEmotionalContexts.exploring,
        'Čo by som mal robiť ďalej?'
      )

      expect(response.suggestions).toContain('create_will')
      expect(response.message).toContain('testament')
      expect(response.relevance).toBeGreaterThan(0.8)
    })

    it('should time suggestions appropriately to avoid overwhelming', async () => {
      const overwhelmedContext = {
        ...mockEmotionalContexts.frustrated,
        recentSuggestionCount: 5,
        sessionStress: 0.8
      }

      const response = await personalityEngine.generateResponse(
        mockUserStates.newUser,
        overwhelmedContext,
        'Mám pocit, že je toho veľa'
      )

      expect(response.suggestions.length).toBeLessThanOrEqual(1)
      expect(response.message).toContain('postupne')
    })

    it('should provide proactive suggestions for engaged users', async () => {
      const engagedContext = {
        ...mockEmotionalContexts.exploring,
        sessionDuration: 20,
        actionCount: 8,
        engagementLevel: 0.9
      }

      const response = await personalityEngine.generateResponse(
        mockUserStates.progressingUser,
        engagedContext,
        'To bolo jednoduché!'
      )

      expect(response.suggestions.length).toBeGreaterThanOrEqual(2)
      expect(response.suggestions).toContain('explore_advanced_features')
    })

    it('should adapt suggestion complexity to user experience level', async () => {
      const basicUserResponse = await personalityEngine.generateResponse(
        mockUserStates.newUser,
        mockEmotionalContexts.exploring,
        'Čo môžem robiť?'
      )

      const expertUserResponse = await personalityEngine.generateResponse(
        mockUserStates.experiencedUser,
        mockEmotionalContexts.exploring,
        'Čo môžem robiť?'
      )

      expect(basicUserResponse.suggestions).toContain('upload_first_document')
      expect(expertUserResponse.suggestions).toContain('optimize_organization')
      expect(expertUserResponse.suggestions.length).toBeGreaterThan(basicUserResponse.suggestions.length)
    })
  })

  describe('Performance and Edge Cases', () => {
    it('should handle malformed user input gracefully', async () => {
      const malformedInputs = [
        '',
        '   ',
        '!@#$%^&*()',
        'a'.repeat(1000),
        '🤔🤔🤔🤔🤔'
      ]

      for (const input of malformedInputs) {
        const response = await personalityEngine.generateResponse(
          mockUserStates.progressingUser,
          mockEmotionalContexts.exploring,
          input
        )

        expect(response.message).toBeDefined()
        expect(response.message.length).toBeGreaterThan(0)
        expect(response.tone).toBe('helpful')
      }
    })

    it('should respond within performance thresholds', async () => {
      const startTime = Date.now()

      await personalityEngine.generateResponse(
        mockUserStates.progressingUser,
        mockEmotionalContexts.exploring,
        'Normálna otázka o dokumentoch'
      )

      const responseTime = Date.now() - startTime
      expect(responseTime).toBeLessThan(2000)
    })

    it('should handle concurrent requests properly', async () => {
      const promises = Array.from({ length: 5 }, (_, i) =>
        personalityEngine.generateResponse(
          mockUserStates.progressingUser,
          mockEmotionalContexts.exploring,
          `Otázka číslo ${i + 1}`
        )
      )

      const responses = await Promise.all(promises)

      expect(responses).toHaveLength(5)
      responses.forEach(response => {
        expect(response.message).toBeDefined()
        expect(response.tone).toBeDefined()
      })
    })

    it('should maintain emotional state consistency under stress', async () => {
      const stressfulContext = {
        ...mockEmotionalContexts.frustrated,
        systemLoad: 0.9,
        errorCount: 3,
        timeoutRisk: true
      }

      const response = await personalityEngine.generateResponse(
        mockUserStates.newUser,
        stressfulContext,
        'Systém sa mi zasekáva'
      )

      expect(response.tone).toBe('calm')
      expect(response.empathy).toBeGreaterThan(0.7)
      expect(response.message).toContain('vyriešime')
    })
  })

  describe('Slovak Language and Cultural Sensitivity', () => {
    it('should use appropriate Slovak formal/informal address based on user relationship', async () => {
      const newUserResponse = await personalityEngine.generateResponse(
        mockUserStates.newUser,
        mockEmotionalContexts.exploring,
        'Potrebujem pomoc'
      )

      const familiarUserResponse = await personalityEngine.generateResponse(
        { ...mockUserStates.experiencedUser, relationshipLevel: 'familiar' },
        mockEmotionalContexts.exploring,
        'Potrebujem pomoc'
      )

      expect(newUserResponse.message).toContain('môžem Vám')
      expect(familiarUserResponse.message).toContain('môžem ti')
    })

    it('should recognize and respond to Slovak cultural expressions', async () => {
      const culturalExpressions = [
        'Ďakujem pekne',
        'S povolením',
        'Prepáčte',
        'Boh zaplať'
      ]

      for (const expression of culturalExpressions) {
        const response = await personalityEngine.generateResponse(
          mockUserStates.progressingUser,
          mockEmotionalContexts.exploring,
          expression
        )

        expect(response.culturalAwareness).toBeGreaterThan(0.7)
        expect(response.message).toMatch(/\b(prosím|rád|samozrejme)\b/)
      }
    })

    it('should handle Slovak legal terminology appropriately', async () => {
      const legalTerms = [
        'testament',
        'dedičstvo',
        'nezletilé deti',
        'plná moc',
        'notár'
      ]

      for (const term of legalTerms) {
        const response = await personalityEngine.generateResponse(
          mockUserStates.progressingUser,
          mockEmotionalContexts.exploring,
          `Čo je ${term}?`
        )

        expect(response.message).toContain(term)
        expect(response.accuracy).toBeGreaterThan(0.8)
        expect(response.clarity).toBeGreaterThan(0.7)
      }
    })
  })
})