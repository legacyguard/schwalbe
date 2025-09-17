
// Sofia Adaptive Personality System - End-to-End Integration Tests
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AdaptivePersonalityManager } from '@/lib/sofia-personality';
import { textManager } from '@/lib/text-manager';
import type { InteractionPattern } from '@/lib/sofia-types';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Sofia Adaptive Personality System - E2E Integration', () => {
  let personalityManager: AdaptivePersonalityManager;
  const testUserId = 'e2e-test-user';

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    personalityManager = new AdaptivePersonalityManager(testUserId);
    textManager.registerPersonalityManager(testUserId, personalityManager);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Complete User Journey: New User → Adaptive Learning', () => {
    it('should handle new user with default adaptive behavior', () => {
      // New user starts with adaptive mode and balanced style
      const personality = personalityManager.getPersonality();

      expect(personality.mode).toBe('adaptive');
      expect(personality.currentStyle).toBe('balanced');
      expect(personality.confidence).toBeLessThan(70);
      expect(personality.userPreferences.adaptationEnabled).toBe(true);
    });

    it('should learn from empathetic user interactions', () => {
      // Simulate empathetic user behavior pattern
      const empathicInteractions: InteractionPattern[] = [
        {
          timestamp: new Date(),
          action: 'view_family_section',
          duration: 180000, // 3 minutes - long thoughtful sessions
          context: 'family_planning',
          responseTime: 12000, // 12 seconds - slow, careful responses
        },
        {
          timestamp: new Date(),
          action: 'read_help_content',
          duration: 240000, // 4 minutes
          context: 'guidance_seeking',
          responseTime: 8000,
        },
        {
          timestamp: new Date(),
          action: 'upload_family_photo',
          duration: 300000, // 5 minutes
          context: 'emotional_content',
          responseTime: 15000, // Very thoughtful
        },
        // Add more interactions to trigger analysis
        ...Array.from({ length: 8 }, (_, i) => ({
          timestamp: new Date(),
          action: `empathetic_action_${i}`,
          duration: 200000, // Long sessions
          context: 'family_focused',
          responseTime: 10000, // Thoughtful responses
        })),
      ];

      empathicInteractions.forEach(interaction => {
        personalityManager.recordInteraction(interaction);
      });

      const personality = personalityManager.getPersonality();

      // Should detect empathetic preference
      expect(
        personality.userPreferences.lastInteractions.length
      ).toBeGreaterThan(10);
      expect(personality.analysis).toBeDefined();

      if (personality.analysis) {
        expect(personality.analysis.detectedStyle).toBe('empathetic');
        expect(personality.analysis.confidence).toBeGreaterThan(70);
      }
    });

    it('should learn from pragmatic user interactions', () => {
      // Simulate pragmatic user behavior pattern
      const pragmaticInteractions: InteractionPattern[] = [
        {
          timestamp: new Date(),
          action: 'quick_document_upload',
          duration: 30000, // 30 seconds - efficient
          context: 'task_completion',
          responseTime: 2000, // Fast decisions
        },
        {
          timestamp: new Date(),
          action: 'skip_tutorial',
          duration: 5000,
          context: 'efficiency_focused',
          responseTime: 1000, // Very quick
        },
        {
          timestamp: new Date(),
          action: 'direct_settings_access',
          duration: 45000,
          context: 'configuration',
          responseTime: 3000, // Direct action
        },
        // Add more interactions to trigger analysis
        ...Array.from({ length: 8 }, (_, i) => ({
          timestamp: new Date(),
          action: `pragmatic_action_${i}`,
          duration: 60000, // Short, focused sessions
          context: 'task_oriented',
          responseTime: 2500, // Quick responses
        })),
      ];

      pragmaticInteractions.forEach(interaction => {
        personalityManager.recordInteraction(interaction);
      });

      const personality = personalityManager.getPersonality();

      // Should detect pragmatic preference
      expect(
        personality.userPreferences.lastInteractions.length
      ).toBeGreaterThan(10);
      expect(personality.analysis).toBeDefined();

      if (personality.analysis) {
        expect(personality.analysis.detectedStyle).toBe('pragmatic');
        expect(personality.analysis.confidence).toBeGreaterThan(70);
      }
    });
  });

  describe('Complete Text Adaptation Flow', () => {
    it('should provide personalized welcome messages based on learned behavior', () => {
      // Set empathetic preference
      personalityManager.setManualOverride('empathetic');

      const welcomeMessage = textManager.getText(
        'sofia_welcome',
        'default',
        testUserId
      );

      expect(welcomeMessage).toContain('gentle guide');
      expect(welcomeMessage).toContain('meaningful journey');
      expect(welcomeMessage).not.toContain('digital assistant');
    });

    it('should adapt milestone messages to user style', () => {
      // Set pragmatic preference
      personalityManager.setManualOverride('pragmatic');

      const milestoneMessage = textManager.getText(
        'milestone_first_document_uploaded',
        'default',
        testUserId
      );

      expect(milestoneMessage).toContain('encrypted and stored securely');
      expect(milestoneMessage).toContain('digital legacy system');
      expect(milestoneMessage).not.toContain('mosaic of certainty');
    });

    it('should handle mixed content appropriately', () => {
      // Balanced style should work for all content types
      personalityManager.setMode('adaptive');
      personalityManager.setManualOverride(undefined);

      const securityMessage = textManager.getText(
        'security_explanation',
        'default',
        testUserId
      );
      const errorMessage = textManager.getText(
        'upload_error',
        'default',
        testUserId
      );

      expect(securityMessage).toBeTruthy();
      expect(errorMessage).toBeTruthy();
      expect(typeof securityMessage).toBe('string');
      expect(typeof errorMessage).toBe('string');
    });
  });

  describe('Settings Integration Flow', () => {
    it('should support manual mode switching', () => {
      // Start with adaptive
      expect(personalityManager.getPersonality().mode).toBe('adaptive');

      // Switch to empathetic
      personalityManager.setMode('empathetic');
      expect(personalityManager.getPersonality().mode).toBe('empathetic');
      expect(personalityManager.getCurrentStyle()).toBe('empathetic');

      // Switch to pragmatic
      personalityManager.setMode('pragmatic');
      expect(personalityManager.getPersonality().mode).toBe('pragmatic');
      expect(personalityManager.getCurrentStyle()).toBe('pragmatic');

      // Back to adaptive
      personalityManager.setMode('adaptive');
      expect(personalityManager.getPersonality().mode).toBe('adaptive');
      expect(
        personalityManager.getPersonality().userPreferences.manualOverride
      ).toBeUndefined();
    });

    it('should handle manual overrides correctly', () => {
      personalityManager.setMode('adaptive');

      // Set manual override
      personalityManager.setManualOverride('empathetic');
      expect(personalityManager.getCurrentStyle()).toBe('empathetic');
      expect(personalityManager.getPersonality().confidence).toBe(100);

      // Clear manual override - should return to balanced/pragmatic default
      personalityManager.setManualOverride(undefined);
      const clearedStyle = personalityManager.getCurrentStyle();
      expect(
        clearedStyle === 'balanced' ||
          clearedStyle === 'pragmatic' ||
          clearedStyle === 'empathetic'
      ).toBe(true);
      expect(
        personalityManager.getPersonality().userPreferences.manualOverride
      ).toBeUndefined();
    });

    it('should provide accurate personality insights', () => {
      const insight = personalityManager.getPersonalityInsight();
      expect(insight).toContain('still learning');

      // Add some learning data
      personalityManager.recordInteraction({
        timestamp: new Date(),
        action: 'test_interaction',
        duration: 120000,
        context: 'test',
        responseTime: 5000,
      });

      const newInsight = personalityManager.getPersonalityInsight();
      expect(typeof newInsight).toBe('string');
      expect(newInsight.length).toBeGreaterThan(10);
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle large numbers of interactions efficiently', () => {
      const startTime = Date.now();

      // Record 100 interactions
      for (let i = 0; i < 100; i++) {
        personalityManager.recordInteraction({
          timestamp: new Date(),
          action: `performance_test_${i}`,
          duration: Math.random() * 300000,
          context: 'performance_test',
          responseTime: Math.random() * 10000,
        });
      }

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // Should process 100 interactions in under 100ms
      expect(processingTime).toBeLessThan(100);

      // Should still maintain only 50 interactions max
      const personality = personalityManager.getPersonality();
      expect(personality.userPreferences.lastInteractions.length).toBe(50);
    });

    it('should handle storage errors gracefully', () => {
      // Mock localStorage to throw errors
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      // Should not crash when saving personality data
      expect(() => {
        personalityManager.setMode('empathetic');
      }).not.toThrow();

      expect(() => {
        personalityManager.recordInteraction({
          timestamp: new Date(),
          action: 'storage_error_test',
          duration: 1000,
          context: 'error_handling',
          responseTime: 1000,
        });
      }).not.toThrow();
    });

    it('should handle corrupted storage data', () => {
      // Mock corrupted data
      localStorageMock.getItem.mockReturnValue('{"invalid": json}');

      // Should create new manager without crashing
      const corruptedManager = new AdaptivePersonalityManager('corrupted-user');
      const personality = corruptedManager.getPersonality();

      expect(personality.mode).toBe('adaptive');
      expect(personality.currentStyle).toBe('balanced');
    });
  });

  describe('Cross-System Integration', () => {
    it('should work correctly without text manager registration', () => {
      const standaloneUserId = 'standalone-user';
      const standaloneManager = new AdaptivePersonalityManager(
        standaloneUserId
      );

      // Should work independently
      standaloneManager.setMode('empathetic');
      expect(standaloneManager.getCurrentStyle()).toBe('empathetic');

      const adaptedMessage = standaloneManager.adaptMessage(
        'You need to upload your document.'
      );
      expect(adaptedMessage).toContain('You might want to upload');
    });

    it('should maintain consistency between systems', () => {
      // Set personality preference
      personalityManager.setManualOverride('pragmatic');

      // Text manager should reflect this
      const textStyle = textManager.getUserPreferredStyle(testUserId);
      expect(textStyle).toBe('pragmatic');

      // Text output should be consistent
      const message = textManager.getText(
        'sofia_welcome',
        'default',
        testUserId
      );
      expect(message).toContain('digital assistant');
    });

    it('should handle concurrent updates correctly', () => {
      // Simulate concurrent updates
      personalityManager.setMode('empathetic');
      personalityManager.recordInteraction({
        timestamp: new Date(),
        action: 'concurrent_test',
        duration: 5000,
        context: 'concurrency',
        responseTime: 1000,
      });
      personalityManager.setManualOverride('pragmatic');

      // Final state should be consistent
      const personality = personalityManager.getPersonality();
      expect(personality.userPreferences.manualOverride).toBe('pragmatic');
      expect(personalityManager.getCurrentStyle()).toBe('pragmatic');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty or null inputs gracefully', () => {
      expect(() => {
        textManager.analyzeUserInput('', testUserId);
      }).not.toThrow();

      expect(() => {
        personalityManager.adaptMessage('');
      }).not.toThrow();

      const result = personalityManager.adaptMessage('');
      expect(result).toBe('');
    });

    it('should handle missing text keys appropriately', () => {
      const result = textManager.getText(
        'nonexistent_key',
        'default',
        testUserId
      );
      expect(result).toContain('[Missing text: nonexistent_key]');
    });

    it('should provide fallbacks for all scenarios', () => {
      // Test with no personality manager
      textManager.registerPersonalityManager(testUserId, null as unknown);

      const result = textManager.getText(
        'sofia_welcome',
        'default',
        testUserId
      );
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });
  });
});
