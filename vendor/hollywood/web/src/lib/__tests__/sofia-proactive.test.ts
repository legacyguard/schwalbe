
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SofiaProactiveService } from '../sofia-proactive';

// Mock timers for testing
vi.useFakeTimers();

describe('SofiaProactiveService', () => {
  let service: SofiaProactiveService;
  const mockCallback = vi.fn();

  beforeEach(() => {
    // Clear sessionStorage and mocks
    sessionStorage.clear();
    vi.clearAllMocks();
    mockCallback.mockClear();

    // Initialize service with userId
    service = new SofiaProactiveService('test-user-id');
  });

  afterEach(() => {
    service.stopMonitoring();
    sessionStorage.clear();
  });

  describe('startMonitoring', () => {
    it('should start monitoring user activity', () => {
      service.startMonitoring('/vault', mockCallback);

      // Simulate user activity
      const mouseEvent = new MouseEvent('mousemove');
      document.dispatchEvent(mouseEvent);

      // Activity should be tracked
      expect(service.getCurrentActivity()).toBeDefined();
      expect(service.getCurrentActivity().mouseMovements).toBeGreaterThan(0);
    });

    it('should track different types of user activity', () => {
      service.startMonitoring('/dashboard', mockCallback);

      // Simulate various activities
      document.dispatchEvent(new MouseEvent('mousemove'));
      document.dispatchEvent(new MouseEvent('click'));
      document.dispatchEvent(new Event('scroll'));

      const activity = service.getCurrentActivity();
      expect(activity.mouseMovements).toBe(1);
      expect(activity.clickEvents).toBe(1);
      expect(activity.scrollEvents).toBe(1);
    });

    it('should stop previous monitoring when starting new one', () => {
      const firstCallback = vi.fn();
      const secondCallback = vi.fn();

      service.startMonitoring('/page1', firstCallback);
      service.startMonitoring('/page2', secondCallback);

      // Trigger intervention check
      vi.advanceTimersByTime(30000);

      // Only second callback should be active
      expect(firstCallback).not.toHaveBeenCalled();
    });
  });

  describe('stopMonitoring', () => {
    it('should stop all monitoring activities', () => {
      service.startMonitoring('/vault', mockCallback);
      service.stopMonitoring();

      // Simulate activity after stopping
      document.dispatchEvent(new MouseEvent('mousemove'));

      // Activity should not be tracked
      expect(service.getCurrentActivity().mouseMovements).toBe(0);
    });

    it('should clear monitoring interval', () => {
      service.startMonitoring('/vault', mockCallback);
      service.stopMonitoring();

      // Advance time - callback should not be triggered
      vi.advanceTimersByTime(60000);
      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('intervention triggers', () => {
    it('should trigger will generator help after 3 minutes of inactivity', () => {
      service.startMonitoring('/will-generator', mockCallback);

      // Advance time to 3 minutes
      vi.advanceTimersByTime(3 * 60 * 1000);

      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'help_prompt',
          title: expect.stringContaining('Need help'),
          page: '/will-generator',
        })
      );
    });

    it('should trigger vault help after 5 minutes of idle time', () => {
      service.startMonitoring('/vault', mockCallback);

      // Advance time to 5 minutes
      vi.advanceTimersByTime(5 * 60 * 1000);

      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'idle_help',
          title: expect.stringContaining('organize'),
          page: '/vault',
        })
      );
    });

    it('should trigger dashboard welcome for first-time users', () => {
      service.startMonitoring('/dashboard', mockCallback);

      // Check immediately (first visit)
      vi.advanceTimersByTime(30000);

      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'welcome',
          title: expect.stringContaining('Welcome'),
          page: '/dashboard',
        })
      );
    });

    it('should not trigger intervention if user is active', () => {
      service.startMonitoring('/will-generator', mockCallback);

      // Simulate activity every minute
      for (let i = 0; i < 5; i++) {
        vi.advanceTimersByTime(60000); // 1 minute
        document.dispatchEvent(new MouseEvent('mousemove'));
        document.dispatchEvent(new MouseEvent('click'));
      }

      // Should not trigger because user is active
      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('intervention persistence', () => {
    it('should not show same intervention twice in session', () => {
      service.startMonitoring('/will-generator', mockCallback);

      // Trigger intervention first time
      vi.advanceTimersByTime(3 * 60 * 1000);
      expect(mockCallback).toHaveBeenCalledTimes(1);

      // Reset and try again
      mockCallback.mockClear();
      service.stopMonitoring();
      service.startMonitoring('/will-generator', mockCallback);

      // Should not trigger again
      vi.advanceTimersByTime(3 * 60 * 1000);
      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should remember shown interventions in sessionStorage', () => {
      service.startMonitoring('/vault', mockCallback);

      // Trigger intervention
      vi.advanceTimersByTime(5 * 60 * 1000);

      const shownInterventions = JSON.parse(
        sessionStorage.getItem('sofia_shown_interventions') || '[]'
      );

      expect(shownInterventions).toContain('idle_help_/vault');
    });
  });

  describe('getCurrentActivity', () => {
    it('should return current activity metrics', () => {
      service.startMonitoring('/dashboard', mockCallback);

      // Simulate various activities
      document.dispatchEvent(new MouseEvent('mousemove'));
      document.dispatchEvent(new MouseEvent('click'));

      const input = document.createElement('input');
      input.dispatchEvent(new Event('input'));

      const activity = service.getCurrentActivity();

      expect(activity).toMatchObject({
        mouseMovements: 1,
        clickEvents: 1,
        scrollEvents: 0,
        formInteractions: 1,
        timeOnPage: expect.any(Number),
        currentPage: '/dashboard',
      });
    });

    it('should return empty activity when not monitoring', () => {
      const activity = service.getCurrentActivity();

      expect(activity).toMatchObject({
        mouseMovements: 0,
        clickEvents: 0,
        scrollEvents: 0,
        formInteractions: 0,
        timeOnPage: 0,
        currentPage: '',
      });
    });
  });

  describe('edge cases', () => {
    it('should handle rapid page changes', () => {
      service.startMonitoring('/page1', mockCallback);
      service.startMonitoring('/page2', mockCallback);
      service.startMonitoring('/page3', mockCallback);

      // Should not throw and should track latest page
      expect(service.getCurrentActivity().currentPage).toBe('/page3');
    });

    it('should handle callback errors gracefully', () => {
      const errorCallback = vi.fn(() => {
        throw new Error('Callback error');
      });

      service.startMonitoring('/vault', errorCallback);

      // Should not throw when triggering intervention
      expect(() => {
        vi.advanceTimersByTime(5 * 60 * 1000);
      }).not.toThrow();
    });

    it('should clean up event listeners on stop', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      service.startMonitoring('/dashboard', mockCallback);
      const listenerCount = addEventListenerSpy.mock.calls.length;

      service.stopMonitoring();
      const removeCount = removeEventListenerSpy.mock.calls.length;

      // Should remove all added listeners
      expect(removeCount).toBe(listenerCount);
    });
  });
});
