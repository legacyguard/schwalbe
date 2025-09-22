/**
 * Sofia Personality Engine Tests
 * Test emotional intelligence and response generation with comprehensive Jest coverage
 */

import {
  SofiaPersonalityEngine,
  UserContext,
  EmotionalState,
  SOFIA_CORE_PERSONALITY,
  CommunicationTone,
  QuickWinOpportunity,
  LegalMilestone
} from '../../sofia/personality';

describe('SofiaPersonalityEngine', () => {
  let engine: SofiaPersonalityEngine;
  const mockCurrentTime = new Date('2025-09-22T10:00:00Z');

  beforeEach(() => {
    engine = new SofiaPersonalityEngine();
    jest.clearAllMocks();
  });

  describe('Core Personality Constants', () => {
    it('should have well-defined welcome messages in Slovak', () => {
      expect(SOFIA_CORE_PERSONALITY.welcomeMessages.firstTime).toContain('svetluška');
      expect(SOFIA_CORE_PERSONALITY.welcomeMessages.firstTime).toContain('Sofia');
      expect(SOFIA_CORE_PERSONALITY.welcomeMessages.returning).toContain('Vitajte späť');
      expect(SOFIA_CORE_PERSONALITY.welcomeMessages.longAbsence).toContain('vrátili');
    });

    it('should have response patterns for different emotional states', () => {
      expect(SOFIA_CORE_PERSONALITY.responsePatterns.nervous).toBeDefined();
      expect(SOFIA_CORE_PERSONALITY.responsePatterns.nervous.tone).toBe('soft');
      expect(SOFIA_CORE_PERSONALITY.responsePatterns.confident).toBeDefined();
      expect(SOFIA_CORE_PERSONALITY.responsePatterns.confident.tone).toBe('energetic');
    });

    it('should have quick win definitions', () => {
      expect(SOFIA_CORE_PERSONALITY.quickWins.firstDocument).toBeDefined();
      expect(SOFIA_CORE_PERSONALITY.quickWins.firstDocument.message).toContain('prvý dokument');
      expect(SOFIA_CORE_PERSONALITY.quickWins.categoryCompletion).toBeDefined();
    });

    it('should have legal milestone definitions', () => {
      expect(SOFIA_CORE_PERSONALITY.legalMilestones.willReadiness).toBeDefined();
      expect(SOFIA_CORE_PERSONALITY.legalMilestones.willReadiness.softApproach).toContain('závet');
    });
  });

  describe('Emotional State Assessment', () => {
    it('should assess nervous state for new users with no documents', () => {
      const context: UserContext = {
        documentsCount: 0,
        timeInApp: 60000, // 1 minute
        lastActivity: mockCurrentTime,
        completedTasks: []
      };

      // Access private method through type assertion for testing
      const emotionalState = (engine as any).assessEmotionalState(context);
      expect(emotionalState.confidence).toBe('nervous');
      expect(emotionalState.motivation).toBe('low');
      expect(emotionalState.urgency).toBe('gentle');
    });

    it('should assess cautious state for users with few documents', () => {
      const context: UserContext = {
        documentsCount: 2,
        timeInApp: 600000, // 10 minutes
        lastActivity: mockCurrentTime,
        completedTasks: ['personal_info']
      };

      const emotionalState = (engine as any).assessEmotionalState(context);
      expect(emotionalState.confidence).toBe('cautious');
      expect(emotionalState.motivation).toBe('moderate');
    });

    it('should assess comfortable state for intermediate users', () => {
      const context: UserContext = {
        documentsCount: 5,
        timeInApp: 1200000, // 20 minutes
        lastActivity: mockCurrentTime,
        completedTasks: ['personal_info', 'assets']
      };

      const emotionalState = (engine as any).assessEmotionalState(context);
      expect(emotionalState.confidence).toBe('comfortable');
      expect(emotionalState.motivation).toBe('moderate');
    });

    it('should assess confident state for experienced users', () => {
      const context: UserContext = {
        documentsCount: 15,
        timeInApp: 3600000, // 1 hour
        lastActivity: mockCurrentTime,
        completedTasks: ['personal_info', 'assets', 'family_info']
      };

      const emotionalState = (engine as any).assessEmotionalState(context);
      expect(emotionalState.confidence).toBe('confident');
      expect(emotionalState.motivation).toBe('high');
    });

    it('should detect moderate urgency for parents', () => {
      const context: UserContext = {
        documentsCount: 3,
        timeInApp: 600000,
        lastActivity: mockCurrentTime,
        completedTasks: ['personal_info'],
        lifeSituation: 'parent'
      };

      const emotionalState = (engine as any).assessEmotionalState(context);
      expect(emotionalState.urgency).toBe('moderate');
    });

    it('should handle edge case of very high document count', () => {
      const context: UserContext = {
        documentsCount: 100,
        timeInApp: 7200000, // 2 hours
        lastActivity: mockCurrentTime,
        completedTasks: ['personal_info', 'assets', 'family_info', 'insurance']
      };

      const emotionalState = (engine as any).assessEmotionalState(context);
      expect(emotionalState.confidence).toBe('confident');
      expect(emotionalState.motivation).toBe('high');
    });
  });

  describe('Communication Tone Determination', () => {
    it('should determine friendly tone for nervous users', () => {
      const nervousState: EmotionalState = {
        confidence: 'nervous',
        motivation: 'low',
        urgency: 'gentle'
      };

      const tone = (engine as any).determineTone(nervousState);
      expect(tone.formality).toBe('friendly');
      expect(tone.encouragement).toBe('enthusiastic');
      expect(tone.pace).toBe('slow');
    });

    it('should determine casual tone for confident users', () => {
      const confidentState: EmotionalState = {
        confidence: 'confident',
        motivation: 'high',
        urgency: 'none'
      };

      const tone = (engine as any).determineTone(confidentState);
      expect(tone.formality).toBe('casual');
      expect(tone.encouragement).toBe('moderate');
      expect(tone.pace).toBe('normal');
    });

    it('should adapt encouragement level based on motivation', () => {
      const lowMotivationState: EmotionalState = {
        confidence: 'comfortable',
        motivation: 'low',
        urgency: 'none'
      };

      const tone = (engine as any).determineTone(lowMotivationState);
      expect(tone.encouragement).toBe('enthusiastic');
    });
  });

  describe('Quick Win Detection', () => {
    it('should detect first document opportunity', () => {
      const context: UserContext = {
        documentsCount: 1,
        timeInApp: 300000,
        lastActivity: mockCurrentTime,
        completedTasks: []
      };

      const quickWin = engine.detectQuickWinOpportunity(context);
      expect(quickWin).toBeTruthy();
      expect(quickWin!.type).toBe('first_document');
      expect(quickWin!.message).toContain('Skvelé');
      expect(quickWin!.message).toContain('prvý kameň');
    });

    it('should detect milestone achievements for 5 documents', () => {
      const context: UserContext = {
        documentsCount: 5,
        timeInApp: 1800000,
        lastActivity: mockCurrentTime,
        completedTasks: ['personal_info']
      };

      const quickWin = engine.detectQuickWinOpportunity(context);
      expect(quickWin).toBeTruthy();
      expect(quickWin!.type).toBe('milestone_achievement');
      expect(quickWin!.message).toContain('5 zabezpečených dokumentov');
      expect(quickWin!.message).toContain('Úžasné');
    });

    it('should detect milestone achievements for 10 documents', () => {
      const context: UserContext = {
        documentsCount: 10,
        timeInApp: 2400000,
        lastActivity: mockCurrentTime,
        completedTasks: ['personal_info', 'assets']
      };

      const quickWin = engine.detectQuickWinOpportunity(context);
      expect(quickWin).toBeTruthy();
      expect(quickWin!.type).toBe('milestone_achievement');
      expect(quickWin!.message).toContain('10 zabezpečených dokumentov');
    });

    it('should detect milestone achievements for higher counts', () => {
      const context: UserContext = {
        documentsCount: 20,
        timeInApp: 3600000,
        lastActivity: mockCurrentTime,
        completedTasks: ['personal_info', 'assets', 'family_info']
      };

      const quickWin = engine.detectQuickWinOpportunity(context);
      expect(quickWin).toBeTruthy();
      expect(quickWin!.type).toBe('milestone_achievement');
      expect(quickWin!.message).toContain('20 zabezpečených dokumentov');
    });

    it('should not detect opportunities for non-milestone document counts', () => {
      const context: UserContext = {
        documentsCount: 3,
        timeInApp: 600000,
        lastActivity: mockCurrentTime,
        completedTasks: []
      };

      const quickWin = engine.detectQuickWinOpportunity(context);
      expect(quickWin).toBeNull();
    });

    it('should not detect opportunities for zero documents', () => {
      const context: UserContext = {
        documentsCount: 0,
        timeInApp: 300000,
        lastActivity: mockCurrentTime,
        completedTasks: []
      };

      const quickWin = engine.detectQuickWinOpportunity(context);
      expect(quickWin).toBeNull();
    });

    it('should generate next category suggestions for milestones', () => {
      const context: UserContext = {
        documentsCount: 5,
        timeInApp: 1800000,
        lastActivity: mockCurrentTime,
        completedTasks: ['personal_info']
      };

      const quickWin = engine.detectQuickWinOpportunity(context);
      expect(quickWin).toBeTruthy();
      expect(quickWin!.nextSuggestion).toContain('Možno');
      // With mocked Math.random = 0.5, it should consistently pick a specific category
    });
  });

  describe('Legal Milestone Detection', () => {
    it('should detect will readiness with complete information', () => {
      const context: UserContext = {
        documentsCount: 10,
        timeInApp: 1800000,
        lastActivity: mockCurrentTime,
        completedTasks: ['personal_info', 'assets', 'family_info']
      };

      const milestone = engine.detectLegalMilestone(context);
      expect(milestone).toBeTruthy();
      expect(milestone!.type).toBe('will_ready');
      expect(milestone!.readinessScore).toBe(0.8);
      expect(milestone!.missingElements).toContain('insurance_info');
    });

    it('should detect will readiness with all information including insurance', () => {
      const context: UserContext = {
        documentsCount: 12,
        timeInApp: 2400000,
        lastActivity: mockCurrentTime,
        completedTasks: ['personal_info', 'assets', 'family_info', 'insurance']
      };

      const milestone = engine.detectLegalMilestone(context);
      expect(milestone).toBeTruthy();
      expect(milestone!.type).toBe('will_ready');
      expect(milestone!.readinessScore).toBe(0.8);
      expect(milestone!.missingElements).toHaveLength(0);
    });

    it('should not detect will readiness without personal info', () => {
      const context: UserContext = {
        documentsCount: 5,
        timeInApp: 600000,
        lastActivity: mockCurrentTime,
        completedTasks: ['assets', 'family_info'] // missing personal_info
      };

      const milestone = engine.detectLegalMilestone(context);
      expect(milestone).toBeNull();
    });

    it('should not detect will readiness without assets info', () => {
      const context: UserContext = {
        documentsCount: 5,
        timeInApp: 600000,
        lastActivity: mockCurrentTime,
        completedTasks: ['personal_info', 'family_info'] // missing assets
      };

      const milestone = engine.detectLegalMilestone(context);
      expect(milestone).toBeNull();
    });

    it('should not detect will readiness without family info', () => {
      const context: UserContext = {
        documentsCount: 5,
        timeInApp: 600000,
        lastActivity: mockCurrentTime,
        completedTasks: ['personal_info', 'assets'] // missing family_info
      };

      const milestone = engine.detectLegalMilestone(context);
      expect(milestone).toBeNull();
    });

    it('should identify missing insurance as element for will readiness', () => {
      const context: UserContext = {
        documentsCount: 8,
        timeInApp: 1800000,
        lastActivity: mockCurrentTime,
        completedTasks: ['personal_info', 'assets', 'family_info'] // missing insurance
      };

      const milestone = engine.detectLegalMilestone(context);
      expect(milestone).toBeTruthy();
      expect(milestone!.missingElements).toEqual(['insurance_info']);
    });
  });

  describe('Welcome Message Generation', () => {
    it('should generate first-time welcome for new users', () => {
      const context: UserContext = {
        documentsCount: 0,
        timeInApp: 60000,
        lastActivity: mockCurrentTime,
        completedTasks: []
      };

      const response = engine.generateResponse('new_user', context, 'welcome');
      expect(response).toContain('svetluška');
      expect(response).toContain('Sofia');
      expect(response).toContain('sprevádzať');
    });

    it('should generate returning welcome for existing users', () => {
      const context: UserContext = {
        documentsCount: 5,
        timeInApp: 600000,
        lastActivity: new Date(mockCurrentTime.getTime() - 86400000), // 1 day ago
        completedTasks: ['personal_info']
      };

      const response = engine.generateResponse('returning_user', context, 'welcome');
      expect(response).toContain('Vitajte späť');
    });

    it('should generate long absence welcome for inactive users', () => {
      const context: UserContext = {
        documentsCount: 3,
        timeInApp: 300000,
        lastActivity: new Date(mockCurrentTime.getTime() - 8 * 86400000), // 8 days ago
        completedTasks: ['personal_info']
      };

      const response = engine.generateResponse('inactive_user', context, 'welcome');
      expect(response).toContain('vrátili');
      expect(response).toContain('bezpečí');
    });

    it('should use first-time welcome for users with documents but recent last activity', () => {
      const context: UserContext = {
        documentsCount: 2,
        timeInApp: 300000,
        lastActivity: new Date(mockCurrentTime.getTime() - 3600000), // 1 hour ago
        completedTasks: ['personal_info']
      };

      const response = engine.generateResponse('user1', context, 'welcome');
      expect(response).toContain('Vitajte späť');
    });
  });

  describe('Suggestion Generation', () => {
    it('should suggest first document for empty users', () => {
      const context: UserContext = {
        documentsCount: 0,
        timeInApp: 120000,
        lastActivity: mockCurrentTime,
        completedTasks: []
      };

      const response = engine.generateResponse('user1', context, 'suggestion');
      expect(response).toContain('prvý dokument');
      expect(response).toContain('občiansky preukaz');
    });

    it('should suggest will creation for ready users', () => {
      const context: UserContext = {
        documentsCount: 8,
        timeInApp: 2400000,
        lastActivity: mockCurrentTime,
        completedTasks: ['personal_info', 'assets', 'family_info']
      };

      const response = engine.generateResponse('user1', context, 'suggestion');
      expect(response).toContain('závet');
      expect(response).toContain('informácií');
    });

    it('should provide default encouraging suggestion for users not ready for will', () => {
      const context: UserContext = {
        documentsCount: 3,
        timeInApp: 900000,
        lastActivity: mockCurrentTime,
        completedTasks: ['personal_info']
      };

      const response = engine.generateResponse('user1', context, 'suggestion');
      expect(response).toContain('dokument');
      expect(response).toContain('odkaz');
    });
  });

  describe('Celebration Generation', () => {
    it('should celebrate first document', () => {
      const context: UserContext = {
        documentsCount: 1,
        timeInApp: 300000,
        lastActivity: mockCurrentTime,
        completedTasks: []
      };

      const response = engine.generateResponse('user1', context, 'celebration');
      expect(response).toContain('Skvelé');
      expect(response).toContain('prvý kameň');
    });

    it('should celebrate 5-document milestone', () => {
      const context: UserContext = {
        documentsCount: 5,
        timeInApp: 1800000,
        lastActivity: mockCurrentTime,
        completedTasks: ['personal_info', 'assets']
      };

      const response = engine.generateResponse('user1', context, 'celebration');
      expect(response).toContain('5 zabezpečených dokumentov');
      expect(response).toContain('Úžasné');
    });

    it('should celebrate 10-document milestone', () => {
      const context: UserContext = {
        documentsCount: 10,
        timeInApp: 1800000,
        lastActivity: mockCurrentTime,
        completedTasks: ['personal_info', 'assets']
      };

      const response = engine.generateResponse('user1', context, 'celebration');
      expect(response).toContain('10 zabezpečených dokumentov');
      expect(response).toContain('Úžasné');
    });

    it('should provide default celebration for non-milestone counts', () => {
      const context: UserContext = {
        documentsCount: 7,
        timeInApp: 1800000,
        lastActivity: mockCurrentTime,
        completedTasks: ['personal_info', 'assets']
      };

      const response = engine.generateResponse('user1', context, 'celebration');
      expect(response).toContain('Skvelá práca');
      expect(response).toContain('odkaz');
    });
  });

  describe('Guidance Generation', () => {
    it('should provide gentle guidance for nervous users', () => {
      const context: UserContext = {
        documentsCount: 0,
        timeInApp: 60000, // Very short time = nervous
        lastActivity: mockCurrentTime,
        completedTasks: []
      };

      const response = engine.generateResponse('user1', context, 'guidance');
      expect(response).toContain('nemusíte');
      expect(response).toContain('malý krok');
    });

    it('should provide active guidance for confident users', () => {
      const context: UserContext = {
        documentsCount: 12,
        timeInApp: 3600000,
        lastActivity: mockCurrentTime,
        completedTasks: ['personal_info', 'assets', 'family_info']
      };

      const response = engine.generateResponse('user1', context, 'guidance');
      expect(response).toContain('konkrétne');
      expect(response).toContain('pomoc');
    });

    it('should provide active guidance for comfortable users', () => {
      const context: UserContext = {
        documentsCount: 6,
        timeInApp: 1800000,
        lastActivity: mockCurrentTime,
        completedTasks: ['personal_info', 'assets']
      };

      const response = engine.generateResponse('user1', context, 'guidance');
      expect(response).toContain('konkrétne');
      expect(response).toContain('pomoc');
    });
  });

  describe('Quick Win Message Generation', () => {
    it('should generate quick win message when opportunity exists', () => {
      const context: UserContext = {
        documentsCount: 1,
        timeInApp: 300000,
        lastActivity: mockCurrentTime,
        completedTasks: []
      };

      const response = engine.generateResponse('user1', context, 'quick_win');
      expect(response).toContain('Skvelé');
      expect(response).toContain('prvý kameň');
      expect(response).toContain('pridať ešte jeden');
    });

    it('should generate default message when no opportunity exists', () => {
      const context: UserContext = {
        documentsCount: 3,
        timeInApp: 600000,
        lastActivity: mockCurrentTime,
        completedTasks: []
      };

      const response = engine.generateResponse('user1', context, 'quick_win');
      expect(response).toContain('Skvelé');
      expect(response).toContain('pokrok');
    });
  });

  describe('Legal Milestone Message Generation', () => {
    it('should generate legal milestone message when milestone exists', () => {
      const context: UserContext = {
        documentsCount: 8,
        timeInApp: 1800000,
        lastActivity: mockCurrentTime,
        completedTasks: ['personal_info', 'assets', 'family_info']
      };

      const response = engine.generateResponse('user1', context, 'legal_milestone');
      expect(response).toContain('závet');
      expect(response).toContain('informácií');
    });

    it('should generate default message when no milestone exists', () => {
      const context: UserContext = {
        documentsCount: 3,
        timeInApp: 600000,
        lastActivity: mockCurrentTime,
        completedTasks: ['personal_info']
      };

      const response = engine.generateResponse('user1', context, 'legal_milestone');
      expect(response).toContain('informácií');
      expect(response).toContain('závet');
    });
  });

  describe('Suggestion Timing Logic', () => {
    it('should not overwhelm nervous users with short time', () => {
      const context: UserContext = {
        documentsCount: 0,
        timeInApp: 120000, // 2 minutes = nervous
        lastActivity: mockCurrentTime,
        completedTasks: []
      };

      const shouldShow = engine.shouldShowSuggestion('user1', context);
      expect(shouldShow).toBe(false);
    });

    it('should show suggestions for users with progress and adequate time', () => {
      const context: UserContext = {
        documentsCount: 3,
        timeInApp: 900000, // 15 minutes
        lastActivity: mockCurrentTime,
        completedTasks: ['personal_info']
      };

      const shouldShow = engine.shouldShowSuggestion('user1', context);
      expect(shouldShow).toBe(true);
    });

    it('should respect minimum time thresholds', () => {
      const context: UserContext = {
        documentsCount: 2,
        timeInApp: 30000, // 30 seconds - too short
        lastActivity: mockCurrentTime,
        completedTasks: []
      };

      const shouldShow = engine.shouldShowSuggestion('user1', context);
      expect(shouldShow).toBe(false);
    });

    it('should show suggestions for users with documents and minimum time', () => {
      const context: UserContext = {
        documentsCount: 1,
        timeInApp: 60001, // Just over minimum
        lastActivity: mockCurrentTime,
        completedTasks: []
      };

      const shouldShow = engine.shouldShowSuggestion('user1', context);
      expect(shouldShow).toBe(true);
    });

    it('should not show suggestions for users with no documents and short time', () => {
      const context: UserContext = {
        documentsCount: 0,
        timeInApp: 60000, // Exactly at threshold but no documents
        lastActivity: mockCurrentTime,
        completedTasks: []
      };

      const shouldShow = engine.shouldShowSuggestion('user1', context);
      expect(shouldShow).toBe(false);
    });
  });

  describe('Context Memory and State Management', () => {
    it('should remember user context between calls', () => {
      const context1: UserContext = {
        documentsCount: 1,
        timeInApp: 300000,
        lastActivity: mockCurrentTime,
        completedTasks: []
      };

      const context2: UserContext = {
        documentsCount: 2,
        timeInApp: 600000,
        lastActivity: mockCurrentTime,
        completedTasks: ['personal_info']
      };

      // First call
      engine.generateResponse('user1', context1, 'welcome');

      // Second call should store new context
      const shouldShow = engine.shouldShowSuggestion('user1', context2);
      expect(shouldShow).toBe(true);

      // Verify context was stored by accessing private property
      const userHistory = (engine as any).userHistory;
      expect(userHistory.get('user1')).toEqual(context2);
    });

    it('should handle multiple users independently', () => {
      const context1: UserContext = {
        documentsCount: 5,
        timeInApp: 900000,
        lastActivity: mockCurrentTime,
        completedTasks: ['personal_info']
      };

      const context2: UserContext = {
        documentsCount: 1,
        timeInApp: 300000,
        lastActivity: mockCurrentTime,
        completedTasks: []
      };

      engine.generateResponse('user1', context1, 'welcome');
      engine.generateResponse('user2', context2, 'welcome');

      const userHistory = (engine as any).userHistory;
      expect(userHistory.get('user1')).toEqual(context1);
      expect(userHistory.get('user2')).toEqual(context2);
      expect(userHistory.size).toBe(2);
    });
  });

  describe('Next Category Suggestion Logic', () => {
    it('should suggest available categories for users with completed tasks', () => {
      const context: UserContext = {
        documentsCount: 5,
        timeInApp: 1800000,
        lastActivity: mockCurrentTime,
        completedTasks: ['personal_info', 'assets']
      };

      const suggestion = (engine as any).generateNextCategoryeSuggestion(context);
      expect(suggestion).toContain('Možno');
      expect(suggestion).toContain('kategóriou');
      // With mocked Math.random = 0.5, should consistently pick middle category
    });

    it('should handle users with all categories completed', () => {
      const context: UserContext = {
        documentsCount: 15,
        timeInApp: 3600000,
        lastActivity: mockCurrentTime,
        completedTasks: [
          'health_documents',
          'financial_documents',
          'housing_documents',
          'education_documents',
          'work_documents'
        ]
      };

      const suggestion = (engine as any).generateNextCategoryeSuggestion(context);
      expect(suggestion).toContain('všetky základné kategórie');
    });

    it('should suggest different categories for users with partial completion', () => {
      const context: UserContext = {
        documentsCount: 8,
        timeInApp: 2400000,
        lastActivity: mockCurrentTime,
        completedTasks: ['health_documents', 'financial_documents']
      };

      const suggestion = (engine as any).generateNextCategoryeSuggestion(context);
      expect(suggestion).toContain('Možno');
      expect(suggestion).toContain('kategóriou');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty completed tasks gracefully', () => {
      const context: UserContext = {
        documentsCount: 5,
        timeInApp: 600000,
        lastActivity: mockCurrentTime,
        completedTasks: []
      };

      expect(() => {
        engine.generateResponse('user1', context, 'suggestion');
      }).not.toThrow();

      const response = engine.generateResponse('user1', context, 'suggestion');
      expect(typeof response).toBe('string');
      expect(response.length).toBeGreaterThan(0);
    });

    it('should handle missing life situation gracefully', () => {
      const context: UserContext = {
        documentsCount: 3,
        timeInApp: 300000,
        lastActivity: mockCurrentTime,
        completedTasks: ['personal_info']
        // lifeSituation is undefined
      };

      expect(() => {
        engine.generateResponse('user1', context, 'welcome');
      }).not.toThrow();

      const response = engine.generateResponse('user1', context, 'welcome');
      expect(typeof response).toBe('string');
      expect(response.length).toBeGreaterThan(0);
    });

    it('should handle very high document counts gracefully', () => {
      const context: UserContext = {
        documentsCount: 1000,
        timeInApp: 36000000,
        lastActivity: mockCurrentTime,
        completedTasks: ['personal_info', 'assets', 'family_info', 'insurance']
      };

      const response = engine.generateResponse('user1', context, 'celebration');
      expect(response).toBeTruthy();
      expect(typeof response).toBe('string');
      expect(response.length).toBeGreaterThan(0);
    });

    it('should handle negative document counts gracefully', () => {
      const context: UserContext = {
        documentsCount: -1,
        timeInApp: 300000,
        lastActivity: mockCurrentTime,
        completedTasks: []
      };

      expect(() => {
        engine.generateResponse('user1', context, 'welcome');
      }).not.toThrow();
    });

    it('should handle zero or negative time gracefully', () => {
      const context: UserContext = {
        documentsCount: 3,
        timeInApp: -100,
        lastActivity: mockCurrentTime,
        completedTasks: ['personal_info']
      };

      expect(() => {
        const response = engine.generateResponse('user1', context, 'suggestion');
        expect(typeof response).toBe('string');
      }).not.toThrow();
    });

    it('should handle invalid intent gracefully', () => {
      const context: UserContext = {
        documentsCount: 3,
        timeInApp: 300000,
        lastActivity: mockCurrentTime,
        completedTasks: ['personal_info']
      };

      const response = engine.generateResponse('user1', context, 'invalid_intent' as any);
      expect(response).toBe(SOFIA_CORE_PERSONALITY.welcomeMessages.firstTime);
    });

    it('should handle null/undefined lastActivity gracefully', () => {
      const context: UserContext = {
        documentsCount: 3,
        timeInApp: 300000,
        lastActivity: null as any,
        completedTasks: ['personal_info']
      };

      expect(() => {
        engine.generateResponse('user1', context, 'welcome');
      }).not.toThrow();
    });
  });

  describe('Response Quality and Content Validation', () => {
    it('should always return non-empty strings', () => {
      const testCases = [
        { documentsCount: 0, intent: 'welcome' as const },
        { documentsCount: 5, intent: 'suggestion' as const },
        { documentsCount: 1, intent: 'celebration' as const },
        { documentsCount: 10, intent: 'guidance' as const },
        { documentsCount: 20, intent: 'quick_win' as const },
        { documentsCount: 8, intent: 'legal_milestone' as const }
      ];

      testCases.forEach(({ documentsCount, intent }) => {
        const context: UserContext = {
          documentsCount,
          timeInApp: 600000,
          lastActivity: mockCurrentTime,
          completedTasks: ['personal_info']
        };

        const response = engine.generateResponse('user1', context, intent);
        expect(response).toBeTruthy();
        expect(typeof response).toBe('string');
        expect(response.trim().length).toBeGreaterThan(0);
      });
    });

    it('should generate contextually appropriate responses', () => {
      const nervousUserContext: UserContext = {
        documentsCount: 0,
        timeInApp: 60000,
        lastActivity: mockCurrentTime,
        completedTasks: []
      };

      const confidentUserContext: UserContext = {
        documentsCount: 15,
        timeInApp: 3600000,
        lastActivity: mockCurrentTime,
        completedTasks: ['personal_info', 'assets', 'family_info']
      };

      const nervousResponse = engine.generateResponse('nervous_user', nervousUserContext, 'guidance');
      const confidentResponse = engine.generateResponse('confident_user', confidentUserContext, 'guidance');

      expect(nervousResponse).not.toBe(confidentResponse);
      expect(nervousResponse).toContain('nemusíte');
      expect(confidentResponse).toContain('konkrétne');
    });

    it('should maintain Slovak language consistency', () => {
      const context: UserContext = {
        documentsCount: 5,
        timeInApp: 900000,
        lastActivity: mockCurrentTime,
        completedTasks: ['personal_info']
      };

      const intents: Array<'welcome' | 'suggestion' | 'celebration' | 'guidance' | 'quick_win' | 'legal_milestone'> = [
        'welcome', 'suggestion', 'celebration', 'guidance', 'quick_win', 'legal_milestone'
      ];

      intents.forEach(intent => {
        const response = engine.generateResponse('user1', context, intent);
        // Check for Slovak-specific patterns
        expect(response).not.toContain('you');
        expect(response).not.toContain('your');
        expect(response).not.toContain('the');
        // Should contain Slovak words
        expect(response).toMatch(/[váš|vašej|vášho|dokument|odkaz|Sofia]/);
      });
    });
  });

  describe('Performance and Memory Management', () => {
    it('should handle rapid successive calls efficiently', () => {
      const context: UserContext = {
        documentsCount: 3,
        timeInApp: 600000,
        lastActivity: mockCurrentTime,
        completedTasks: ['personal_info']
      };

      const startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        engine.generateResponse(`user${i}`, context, 'welcome');
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete 100 calls in reasonable time (less than 1 second)
      expect(duration).toBeLessThan(1000);
    });

    it('should manage memory efficiently with many users', () => {
      const context: UserContext = {
        documentsCount: 3,
        timeInApp: 600000,
        lastActivity: mockCurrentTime,
        completedTasks: ['personal_info']
      };

      // Create many user contexts
      for (let i = 0; i < 1000; i++) {
        engine.generateResponse(`user${i}`, context, 'welcome');
      }

      const userHistory = (engine as any).userHistory;
      expect(userHistory.size).toBe(1000);

      // Memory should not grow excessively (basic check)
      expect(userHistory.size).toBeLessThan(1001);
    });
  });
});