
// Sofia Adaptive Personality Manager Tests
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdaptivePersonalityManager } from '../sofia-personality';
import type { InteractionPattern } from '../sofia-types';

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

describe('AdaptivePersonalityManager', () => {
  let manager: AdaptivePersonalityManager;
  const testUserId = 'test-user-123';

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new AdaptivePersonalityManager(testUserId);
  });

  describe('Initialization', () => {
    it('should create with default personality', () => {
      const personality = manager.getPersonality();
      expect(personality.mode).toBe('adaptive');
      expect(personality.currentStyle).toBe('balanced');
      expect(personality.userPreferences.adaptationEnabled).toBe(true);
    });

    it('should load from localStorage if available', () => {
      const storedPersonality = {
        mode: 'empathetic' as const,
        currentStyle: 'empathetic' as const,
        confidence: 80,
        userPreferences: {
          lastInteractions: [],
          adaptationEnabled: true,
          manualOverride: 'empathetic' as const,
        },
      };

      localStorageMock.getItem.mockReturnValue(
        JSON.stringify(storedPersonality)
      );
      const newManager = new AdaptivePersonalityManager('test-user-2');
      const personality = newManager.getPersonality();

      expect(personality.mode).toBe('empathetic');
      expect(personality.userPreferences.manualOverride).toBe('empathetic');
    });
  });

  describe('Mode Management', () => {
    it('should set personality mode correctly', () => {
      manager.setMode('pragmatic');
      const personality = manager.getPersonality();

      expect(personality.mode).toBe('pragmatic');
      expect(personality.currentStyle).toBe('pragmatic');
    });

    it('should reset manual override when switching to adaptive', () => {
      manager.setManualOverride('empathetic');
      manager.setMode('adaptive');

      const personality = manager.getPersonality();
      expect(personality.userPreferences.manualOverride).toBeUndefined();
    });

    it('should handle manual override correctly', () => {
      manager.setManualOverride('pragmatic');
      const personality = manager.getPersonality();

      expect(personality.userPreferences.manualOverride).toBe('pragmatic');
      expect(personality.currentStyle).toBe('pragmatic');
      expect(personality.confidence).toBe(100);
    });
  });

  describe('Interaction Tracking', () => {
    it('should record interactions', () => {
      const interaction: InteractionPattern = {
        timestamp: new Date(),
        action: 'test_action',
        duration: 5000,
        context: 'test',
        responseTime: 2000,
      };

      manager.recordInteraction(interaction);
      const personality = manager.getPersonality();

      expect(personality.userPreferences.lastInteractions).toHaveLength(1);
      expect(personality.userPreferences.lastInteractions[0]).toMatchObject({
        action: 'test_action',
        duration: 5000,
        responseTime: 2000,
      });
    });

    it('should limit interactions to 50', () => {
      // Add 60 interactions
      for (let i = 0; i < 60; i++) {
        const interaction: InteractionPattern = {
          timestamp: new Date(),
          action: `action_${i}`,
          duration: 1000,
          context: 'test',
          responseTime: 1000,
        };
        manager.recordInteraction(interaction);
      }

      const personality = manager.getPersonality();
      expect(personality.userPreferences.lastInteractions).toHaveLength(50);

      // Should keep the most recent ones
      expect(personality.userPreferences.lastInteractions[49].action).toBe(
        'action_59'
      );
    });
  });

  describe('Message Adaptation', () => {
    it('should return base message for balanced style', () => {
      const baseMessage = 'Please upload your document';
      const result = manager.adaptMessage(baseMessage);

      expect(result).toBe(baseMessage);
    });

    it('should adapt message for empathetic style', () => {
      manager.setManualOverride('empathetic');
      const baseMessage = 'You need to upload your document';
      const result = manager.adaptMessage(baseMessage);

      expect(result).toContain('You might want to upload');
    });

    it('should adapt message for pragmatic style', () => {
      manager.setManualOverride('pragmatic');
      const baseMessage =
        "I think you might want to consider uploading your document when you're ready.";
      const result = manager.adaptMessage(baseMessage);

      expect(result).toBe('You should uploading your document .');
    });

    it('should use adaptive config when provided', () => {
      manager.setManualOverride('empathetic');
      const messageConfig = {
        empathetic: {
          greeting: "Welcome back! It's wonderful to see you.",
          guidance: "I'd love to help you with this next step.",
          celebration: 'This is such a meaningful achievement!',
          support: "I'm here to support you through this.",
        },
        pragmatic: {
          greeting: 'Welcome back.',
          guidance: "Here's what you need to do.",
          celebration: 'Task completed.',
          support: 'Next steps available.',
        },
      };

      const result = manager.adaptMessage('Base message', messageConfig);
      expect(result).toBe("I'd love to help you with this next step.");
    });
  });

  describe('Utility Methods', () => {
    it('should return correct confidence level', () => {
      manager.updatePersonality({ confidence: 30 });
      expect(manager.getConfidenceLevel()).toBe('low');

      manager.updatePersonality({ confidence: 60 });
      expect(manager.getConfidenceLevel()).toBe('medium');

      manager.updatePersonality({ confidence: 80 });
      expect(manager.getConfidenceLevel()).toBe('high');
    });

    it('should determine when to show personality hint', () => {
      // Low confidence, few interactions - should not show
      manager.updatePersonality({ confidence: 50 });
      expect(manager.shouldShowPersonalityHint()).toBe(false);

      // Low confidence, many interactions - should show
      const interactions = Array.from({ length: 20 }, (_, i) => ({
        timestamp: new Date(),
        action: `action_${i}`,
        duration: 1000,
        context: 'test',
        responseTime: 1000,
      }));

      manager.updatePersonality({
        confidence: 50,
        userPreferences: {
          lastInteractions: interactions,
          adaptationEnabled: true,
        },
      });
      expect(manager.shouldShowPersonalityHint()).toBe(true);

      // Manual override set - should not show
      manager.setManualOverride('empathetic');
      expect(manager.shouldShowPersonalityHint()).toBe(false);
    });

    it('should provide personality insights', () => {
      const insight = manager.getPersonalityInsight();
      expect(insight).toContain('still learning');

      // Add analysis
      manager.updatePersonality({
        analysis: {
          detectedStyle: 'empathetic',
          confidence: 75,
          analysisFactors: {
            responseSpeed: 5000,
            actionTypes: ['help', 'info'],
            sessionDuration: 300000,
            helpSeekingBehavior: true,
          },
          lastAnalyzed: new Date(),
        },
      });

      const newInsight = manager.getPersonalityInsight();
      expect(newInsight).toContain('supportive, detailed guidance');
      expect(newInsight).toContain('75%');
    });
  });

  describe('Storage', () => {
    it('should save to localStorage when personality is updated', () => {
      manager.setMode('empathetic');

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        `sofia_personality_${testUserId}`,
        expect.stringContaining('"mode":"empathetic"')
      );
    });
  });
});
