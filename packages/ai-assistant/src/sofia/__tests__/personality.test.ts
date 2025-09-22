/**
 * Sofia Personality Engine Tests
 * Test emotional intelligence and response generation
 */

// Mock vitest functions for now - in real implementation these would come from test framework
const describe = (name: string, fn: () => void) => fn()
const it = (name: string, fn: () => void) => fn()
const expect = (actual: any) => ({
  toBe: (expected: unknown) => {
    if (actual !== expected) throw new Error(`Expected ${expected}, got ${actual}`)
  },
  toContain: (expected: string) => {
    if (typeof actual !== 'string' || !actual.includes(expected)) throw new Error(`Expected to contain ${expected}`)
  },
  toBeTruthy: () => {
    if (!actual) throw new Error(`Expected truthy value`)
  },
  toBeNull: () => {
    if (actual !== null) throw new Error(`Expected null`)
  },
  not: {
    toThrow: () => {
      try {
        if (typeof actual === 'function') {
          actual()
        }
        // Function did not throw, which is what we expect
      } catch (e) {
        throw new Error(`Expected function not to throw`)
      }
    }
  }
})
const beforeEach = (fn: () => void) => fn()
import { SofiaPersonalityEngine, UserContext } from '../personality'

describe('SofiaPersonalityEngine', () => {
  let engine: SofiaPersonalityEngine

  beforeEach(() => {
    engine = new SofiaPersonalityEngine()
  })

  describe('Emotional State Assessment', () => {
    it('should assess nervous state for new users', () => {
      const context: UserContext = {
        documentsCount: 0,
        timeInApp: 60000, // 1 minute
        lastActivity: new Date(),
        completedTasks: []
      }

      const response = engine.generateResponse('user1', context, 'welcome')
      expect(response).toContain('Každý život je príbeh hodný zachovania')
    })

    it('should assess confident state for experienced users', () => {
      const context: UserContext = {
        documentsCount: 15,
        timeInApp: 3600000, // 1 hour
        lastActivity: new Date(),
        completedTasks: ['personal_info', 'assets', 'family_info']
      }

      const response = engine.generateResponse('user1', context, 'suggestion')
      expect(response).toContain('pokrok')
    })

    it('should detect cautious state for intermediate users', () => {
      const context: UserContext = {
        documentsCount: 2,
        timeInApp: 600000, // 10 minutes
        lastActivity: new Date(),
        completedTasks: ['personal_info']
      }

      const shouldShow = engine.shouldShowSuggestion('user1', context)
      expect(shouldShow).toBe(true)
    })
  })

  describe('Quick Win Detection', () => {
    it('should detect first document opportunity', () => {
      const context: UserContext = {
        documentsCount: 1,
        timeInApp: 300000,
        lastActivity: new Date(),
        completedTasks: []
      }

      const quickWin = engine.detectQuickWinOpportunity(context)
      expect(quickWin).toBeTruthy()
      expect(quickWin?.type).toBe('first_document')
      expect(quickWin?.message).toContain('Skvelé')
    })

    it('should detect milestone achievements', () => {
      const context: UserContext = {
        documentsCount: 5,
        timeInApp: 1800000,
        lastActivity: new Date(),
        completedTasks: ['personal_info']
      }

      const quickWin = engine.detectQuickWinOpportunity(context)
      expect(quickWin).toBeTruthy()
      expect(quickWin?.type).toBe('milestone_achievement')
      expect(quickWin?.message).toContain('5 zabezpečených dokumentov')
    })

    it('should not detect opportunities for no milestones', () => {
      const context: UserContext = {
        documentsCount: 3,
        timeInApp: 600000,
        lastActivity: new Date(),
        completedTasks: []
      }

      const quickWin = engine.detectQuickWinOpportunity(context)
      expect(quickWin).toBeNull()
    })
  })

  describe('Legal Milestone Detection', () => {
    it('should detect will readiness', () => {
      const context: UserContext = {
        documentsCount: 10,
        timeInApp: 1800000,
        lastActivity: new Date(),
        completedTasks: ['personal_info', 'assets', 'family_info']
      }

      const milestone = engine.detectLegalMilestone(context)
      expect(milestone).toBeTruthy()
      expect(milestone?.type).toBe('will_ready')
      expect(milestone?.readinessScore).toBe(0.8)
    })

    it('should not detect will readiness without required info', () => {
      const context: UserContext = {
        documentsCount: 5,
        timeInApp: 600000,
        lastActivity: new Date(),
        completedTasks: ['personal_info'] // missing assets and family
      }

      const milestone = engine.detectLegalMilestone(context)
      expect(milestone).toBeNull()
    })

    it('should identify missing elements for will readiness', () => {
      const context: UserContext = {
        documentsCount: 10,
        timeInApp: 1800000,
        lastActivity: new Date(),
        completedTasks: ['personal_info', 'assets', 'family_info'] // missing insurance
      }

      const milestone = engine.detectLegalMilestone(context)
      expect(milestone).toBeTruthy()
      expect(milestone?.missingElements).toContain('insurance_info')
    })
  })

  describe('Welcome Message Generation', () => {
    it('should generate first-time welcome for new users', () => {
      const context: UserContext = {
        documentsCount: 0,
        timeInApp: 60000,
        lastActivity: new Date(),
        completedTasks: []
      }

      const response = engine.generateResponse('new_user', context, 'welcome')
      expect(response).toContain('svetluška')
      expect(response).toContain('sprevádzať')
    })

    it('should generate returning welcome for existing users', () => {
      const context: UserContext = {
        documentsCount: 5,
        timeInApp: 600000,
        lastActivity: new Date(Date.now() - 86400000), // 1 day ago
        completedTasks: ['personal_info']
      }

      const response = engine.generateResponse('returning_user', context, 'welcome')
      expect(response).toContain('Vitajte späť')
    })

    it('should generate long absence welcome for inactive users', () => {
      const context: UserContext = {
        documentsCount: 3,
        timeInApp: 300000,
        lastActivity: new Date(Date.now() - 8 * 86400000), // 8 days ago
        completedTasks: ['personal_info']
      }

      const response = engine.generateResponse('inactive_user', context, 'welcome')
      expect(response).toContain('vrátili')
      expect(response).toContain('bezpečí')
    })
  })

  describe('Suggestion Generation', () => {
    it('should suggest first document for empty users', () => {
      const context: UserContext = {
        documentsCount: 0,
        timeInApp: 120000,
        lastActivity: new Date(),
        completedTasks: []
      }

      const response = engine.generateResponse('user1', context, 'suggestion')
      expect(response).toContain('prvý dokument')
      expect(response).toContain('občiansky preukaz')
    })

    it('should suggest will creation for ready users', () => {
      const context: UserContext = {
        documentsCount: 8,
        timeInApp: 2400000,
        lastActivity: new Date(),
        completedTasks: ['personal_info', 'assets', 'family_info']
      }

      const response = engine.generateResponse('user1', context, 'suggestion')
      expect(response).toContain('závet')
      expect(response).toContain('informácií')
    })
  })

  describe('Celebration Generation', () => {
    it('should celebrate first document', () => {
      const context: UserContext = {
        documentsCount: 1,
        timeInApp: 300000,
        lastActivity: new Date(),
        completedTasks: []
      }

      const response = engine.generateResponse('user1', context, 'celebration')
      expect(response).toContain('Skvelé')
      expect(response).toContain('prvý kameň')
    })

    it('should celebrate milestones', () => {
      const context: UserContext = {
        documentsCount: 10,
        timeInApp: 1800000,
        lastActivity: new Date(),
        completedTasks: ['personal_info', 'assets']
      }

      const response = engine.generateResponse('user1', context, 'celebration')
      expect(response).toContain('10 zabezpečených dokumentov')
      expect(response).toContain('Úžasné')
    })
  })

  describe('Guidance Generation', () => {
    it('should provide gentle guidance for nervous users', () => {
      const context: UserContext = {
        documentsCount: 0,
        timeInApp: 60000, // Very short time = nervous
        lastActivity: new Date(),
        completedTasks: []
      }

      const response = engine.generateResponse('user1', context, 'guidance')
      expect(response).toContain('nemusíte')
      expect(response).toContain('malý krok')
    })

    it('should provide active guidance for confident users', () => {
      const context: UserContext = {
        documentsCount: 12,
        timeInApp: 3600000,
        lastActivity: new Date(),
        completedTasks: ['personal_info', 'assets', 'family_info']
      }

      const response = engine.generateResponse('user1', context, 'guidance')
      expect(response).toContain('konkrétne')
      expect(response).toContain('pomoc')
    })
  })

  describe('Suggestion Timing', () => {
    it('should not overwhelm nervous users', () => {
      const context: UserContext = {
        documentsCount: 0,
        timeInApp: 120000, // 2 minutes = nervous
        lastActivity: new Date(),
        completedTasks: []
      }

      const shouldShow = engine.shouldShowSuggestion('user1', context)
      expect(shouldShow).toBe(false)
    })

    it('should show suggestions for users with progress', () => {
      const context: UserContext = {
        documentsCount: 3,
        timeInApp: 900000, // 15 minutes
        lastActivity: new Date(),
        completedTasks: ['personal_info']
      }

      const shouldShow = engine.shouldShowSuggestion('user1', context)
      expect(shouldShow).toBe(true)
    })

    it('should respect time thresholds', () => {
      const context: UserContext = {
        documentsCount: 2,
        timeInApp: 30000, // 30 seconds - too short
        lastActivity: new Date(),
        completedTasks: []
      }

      const shouldShow = engine.shouldShowSuggestion('user1', context)
      expect(shouldShow).toBe(false)
    })
  })

  describe('Context Memory', () => {
    it('should remember user context between calls', () => {
      const context1: UserContext = {
        documentsCount: 1,
        timeInApp: 300000,
        lastActivity: new Date(),
        completedTasks: []
      }

      const context2: UserContext = {
        documentsCount: 2,
        timeInApp: 600000,
        lastActivity: new Date(),
        completedTasks: ['personal_info']
      }

      // First call
      engine.generateResponse('user1', context1, 'welcome')

      // Second call should consider previous context
      const shouldShow = engine.shouldShowSuggestion('user1', context2)
      expect(shouldShow).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty completed tasks', () => {
      const context: UserContext = {
        documentsCount: 5,
        timeInApp: 600000,
        lastActivity: new Date(),
        completedTasks: []
      }

      expect(() => {
        engine.generateResponse('user1', context, 'suggestion')
      }).not.toThrow()
    })

    it('should handle missing life situation', () => {
      const context: UserContext = {
        documentsCount: 3,
        timeInApp: 300000,
        lastActivity: new Date(),
        completedTasks: ['personal_info']
        // lifeSituation is undefined
      }

      expect(() => {
        engine.generateResponse('user1', context, 'welcome')
      }).not.toThrow()
    })

    it('should handle very high document counts', () => {
      const context: UserContext = {
        documentsCount: 1000,
        timeInApp: 36000000,
        lastActivity: new Date(),
        completedTasks: ['personal_info', 'assets', 'family_info', 'insurance']
      }

      const response = engine.generateResponse('user1', context, 'celebration')
      expect(response).toBeTruthy()
      expect(typeof response).toBe('string')
    })
  })
})