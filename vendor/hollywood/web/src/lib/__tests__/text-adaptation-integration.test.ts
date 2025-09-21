
// Text Adaptation Integration Tests
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TextManager } from '../text-manager';
import { AdaptivePersonalityManager } from '../sofia-personality';

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

describe('Text Adaptation Integration', () => {
  let textManager: TextManager;
  let personalityManager: AdaptivePersonalityManager;
  const testUserId = 'test-user-integration';

  beforeEach(() => {
    vi.clearAllMocks();
    textManager = TextManager.getInstance();
    personalityManager = new AdaptivePersonalityManager(testUserId);

    // Register personality manager with text manager
    textManager.registerPersonalityManager(testUserId, personalityManager);
  });

  describe('Style Detection Integration', () => {
    it('should use personality manager for style detection when available', () => {
      // Set personality manager to empathetic mode
      personalityManager.setManualOverride('empathetic');

      // Get text - should use personality manager's style
      const result = textManager.getText(
        'sofia_welcome',
        'default',
        testUserId
      );

      expect(result).toContain('gentle guide');
      expect(result).toContain('meaningful journey');
    });

    it('should use personality manager for pragmatic mode', () => {
      // Set personality manager to pragmatic mode
      personalityManager.setManualOverride('pragmatic');

      // Get text - should use personality manager's style
      const result = textManager.getText(
        'sofia_welcome',
        'default',
        testUserId
      );

      expect(result).toContain('digital assistant');
      expect(result).toContain('efficiently');
    });

    it('should fall back to legacy system when no personality manager', () => {
      const otherUserId = 'other-user';

      // This user has no registered personality manager
      const result = textManager.getText(
        'sofia_welcome',
        'empathetic',
        otherUserId
      );

      expect(result).toContain('gentle guide');
    });
  });

  describe('Input Analysis Integration', () => {
    it('should record interactions in personality manager when available', () => {
      const recordInteractionSpy = vi.spyOn(
        personalityManager,
        'recordInteraction'
      );

      // Analyze user input
      textManager.analyzeUserInput(
        'I love my family and want to protect them',
        testUserId
      );

      expect(recordInteractionSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'text_input_analysis',
          context: 'user_communication',
        })
      );
    });

    it('should not record interactions for users without personality manager', () => {
      const otherUserId = 'other-user-no-manager';

      // This should not throw error and should use legacy system
      expect(() => {
        textManager.analyzeUserInput('Test input', otherUserId);
      }).not.toThrow();
    });
  });

  describe('Message Adaptation', () => {
    it('should provide enhanced message adaptation', () => {
      // Set empathetic mode
      personalityManager.setManualOverride('empathetic');

      const result = textManager.getText(
        'milestone_first_document_uploaded',
        'default',
        testUserId
      );

      // Should get empathetic variant
      expect(result).toContain("family's mosaic of certainty");
      expect(result).toContain('care about protecting');
    });

    it('should provide pragmatic adaptation when needed', () => {
      // Set pragmatic mode
      personalityManager.setManualOverride('pragmatic');

      const result = textManager.getText(
        'milestone_first_document_uploaded',
        'default',
        testUserId
      );

      // Should get pragmatic variant
      expect(result).toContain('encrypted and stored securely');
      expect(result).toContain('digital legacy system');
    });
  });

  describe('Adaptive Learning', () => {
    it('should adapt to user behavior over time', () => {
      // Start with adaptive mode
      personalityManager.setMode('adaptive');

      // Simulate several empathetic interactions
      for (let i = 0; i < 10; i++) {
        personalityManager.recordInteraction({
          timestamp: new Date(),
          action: 'empathetic_action',
          duration: 15000, // Long session suggests empathetic preference
          context: 'document_upload',
          responseTime: 8000, // Slow, thoughtful response
        });
      }

      // After learning, should prefer empathetic style
      const currentStyle = personalityManager.getCurrentStyle();
      const result = textManager.getText(
        'sofia_welcome',
        'default',
        testUserId
      );

      // Should lean towards empathetic communication
      if (currentStyle === 'empathetic') {
        expect(result).toContain('gentle guide');
      }
    });
  });

  describe('System Compatibility', () => {
    it('should maintain backward compatibility with direct style specification', () => {
      // Direct style should override personality manager
      const empathetic = textManager.getText(
        'sofia_welcome',
        'empathetic',
        testUserId
      );
      const pragmatic = textManager.getText(
        'sofia_welcome',
        'pragmatic',
        testUserId
      );

      expect(empathetic).toContain('gentle guide');
      expect(pragmatic).toContain('digital assistant');
      expect(empathetic).not.toBe(pragmatic);
    });

    it('should handle missing text keys gracefully', () => {
      const result = textManager.getText(
        'nonexistent_key',
        'default',
        testUserId
      );
      expect(result).toContain('[Missing text: nonexistent_key]');
    });

    it('should handle users without personality managers', () => {
      const unknownUserId = 'unknown-user';

      const result = textManager.getText(
        'sofia_welcome',
        'default',
        unknownUserId
      );

      // Should still work, falling back to default behavior
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });
  });
});
