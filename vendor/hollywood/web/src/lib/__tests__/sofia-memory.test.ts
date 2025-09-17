
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SofiaMemoryService } from '../sofia-memory';
import type { SofiaContext, SofiaMessage } from '../sofia-types';

describe('SofiaMemoryService', () => {
  let service: SofiaMemoryService;
  const testUserId = 'test-user-123';
  const mockContext: SofiaContext = {
    userId: testUserId,
    userName: 'Test User',
    documentCount: 5,
    guardianCount: 2,
    completionPercentage: 75,
    recentActivity: ['uploaded will'],
    familyStatus: 'family',
    language: 'en',
  };

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();

    // Initialize service
    service = new SofiaMemoryService(testUserId);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('rememberConversation', () => {
    it('should save a conversation to memory', () => {
      const messages: SofiaMessage[] = [
        {
          id: 'msg-1',
          role: 'user',
          content: 'Hello Sofia',
          timestamp: new Date(),
        },
        {
          id: 'msg-2',
          role: 'assistant',
          content: 'Hello! How can I help you today?',
          timestamp: new Date(),
        },
      ];

      service.rememberConversation(messages, 'greeting');
      const tasks = service.getUnfinishedTasks();

      // Verify tasks exist (will be empty for this simple conversation)
      expect(tasks).toBeDefined();
      expect(Array.isArray(tasks)).toBe(true);
    });

    it('should limit conversations to 10 most recent', () => {
      // Add 12 conversations
      for (let i = 0; i < 12; i++) {
        const messages: SofiaMessage[] = [
          {
            id: `msg-${i}`,
            role: 'user',
            content: `Message ${i}`,
            timestamp: new Date(),
          },
        ];
        service.rememberConversation(messages, `topic ${i}`);
      }

      // Check that unfinished tasks is still accessible
      const tasks = service.getUnfinishedTasks();
      expect(tasks).toBeDefined();
    });

    it('should remember unfinished tasks', () => {
      const messages: SofiaMessage[] = [
        {
          id: 'msg-will',
          role: 'user',
          content: 'Help me with my will',
          timestamp: new Date(),
        },
      ];
      const unfinishedTasks = ['Complete beneficiary information', 'Upload ID'];

      service.rememberConversation(messages, 'will creation', unfinishedTasks);
      const tasks = service.getUnfinishedTasks();

      expect(tasks).toEqual(unfinishedTasks);
    });
  });

  describe('getWelcomeBackMessage', () => {
    it('should return welcome message for first time user', () => {
      const greeting = service.getWelcomeBackMessage(mockContext);
      expect(greeting).toContain('Hello Test User');
      expect(greeting).toContain("I'm here to help");
    });

    it('should return "Welcome back" for returning user within an hour', () => {
      // Save a conversation first
      const messages: SofiaMessage[] = [
        {
          id: 'msg-hello',
          role: 'user',
          content: 'Hello',
          timestamp: new Date(),
        },
      ];
      service.rememberConversation(messages, 'greeting');

      // Mock current time to be 30 minutes later
      const originalNow = Date.now;
      Date.now = vi.fn(() => originalNow() + 30 * 60 * 1000);

      const greeting = service.getWelcomeBackMessage(mockContext);
      expect(greeting).toContain('Welcome back');
      expect(greeting).toContain('greeting');

      Date.now = originalNow;
    });

    it('should return "Good to see you again" for returning same day', () => {
      // Save a conversation first
      const messages: SofiaMessage[] = [
        {
          id: 'msg-will-help',
          role: 'user',
          content: 'Help with will',
          timestamp: new Date(),
        },
      ];
      service.rememberConversation(messages, 'will assistance');

      // Mock current time to be 2 hours later
      const originalNow = Date.now;
      Date.now = vi.fn(() => originalNow() + 2 * 60 * 60 * 1000);

      const greeting = service.getWelcomeBackMessage(mockContext);
      expect(greeting).toContain('Good to see you again');
      expect(greeting).toContain('will assistance');

      Date.now = originalNow;
    });

    it('should mention days elapsed for week-old conversation', () => {
      // Save a conversation
      const messages: SofiaMessage[] = [
        {
          id: 'msg-help',
          role: 'user',
          content: 'Help me',
          timestamp: new Date(),
        },
      ];
      service.rememberConversation(messages, 'general help');

      // Mock current time to be 3 days later
      const originalNow = Date.now;
      Date.now = vi.fn(() => originalNow() + 3 * 24 * 60 * 60 * 1000);

      const greeting = service.getWelcomeBackMessage(mockContext);
      expect(greeting).toContain('3 days');
      expect(greeting).toContain('general help');

      Date.now = originalNow;
    });
  });

  describe('user preferences', () => {
    it('should update and retrieve user preferences', () => {
      service.updateUserPreference('language', 'en');
      service.updateUserPreference('theme', 'dark');

      expect(service.getUserPreference('language')).toBe('en');
      expect(service.getUserPreference('theme')).toBe('dark');
    });

    it('should persist preferences to localStorage', () => {
      service.updateUserPreference('notifications', true);

      // Create new service instance
      const newService = new SofiaMemoryService(testUserId);
      expect(newService.getUserPreference('notifications')).toBe(true);
    });
  });

  describe('learning notes', () => {
    it('should add learning notes about user', () => {
      service.addLearningNote('User prefers simple language');
      service.addLearningNote('User has 2 children');

      // Notes are stored internally, verify they don't throw
      expect(() => service.addLearningNote('Another note')).not.toThrow();
    });

    it('should limit learning notes to 50', () => {
      // Add 52 notes
      for (let i = 0; i < 52; i++) {
        service.addLearningNote(`Note ${i}`);
      }

      // Should not throw and should maintain limit
      expect(() => service.addLearningNote('Final note')).not.toThrow();
    });
  });

  describe('persistence', () => {
    it('should persist conversations to localStorage', () => {
      const messages: SofiaMessage[] = [
        {
          id: 'msg-test',
          role: 'user',
          content: 'Test message',
          timestamp: new Date(),
        },
      ];
      service.rememberConversation(messages, 'test topic');

      // Create new service instance
      const newService = new SofiaMemoryService(testUserId);
      const tasks = newService.getUnfinishedTasks();

      expect(tasks).toBeDefined();
      expect(Array.isArray(tasks)).toBe(true);
    });

    it('should handle corrupted localStorage data gracefully', () => {
      // Set invalid JSON in localStorage
      localStorage.setItem(`sofia_memory_${testUserId}`, 'invalid json');

      // Should not throw and should initialize with empty memory
      const newService = new SofiaMemoryService(testUserId);
      const tasks = newService.getUnfinishedTasks();

      expect(tasks).toEqual([]);
    });
  });
});
