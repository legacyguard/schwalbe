
/**
 * Session Management System
 * Handles session timeouts, refresh tokens, and activity tracking
 */

// import { useAuth } from '@clerk/clerk-react';

export interface SessionConfig {
  extendOnActivity: boolean;
  maxIdleTime: number; // milliseconds
  refreshInterval: number; // milliseconds
  warningTime: number; // milliseconds before timeout
}

export interface SessionState {
  isActive: boolean;
  lastActivity: number;
  showWarning: boolean;
  willExpireAt: number;
}

class SessionManager {
  private config: SessionConfig;
  private state: SessionState;
  private timers: {
    idle?: number;
    refresh?: number;
    warning?: number;
  } = {};
  private listeners: Set<(state: SessionState) => void> = new Set();
  private activityEvents = [
    'mousedown',
    'mousemove',
    'keypress',
    'scroll',
    'touchstart',
    'click',
  ];

  constructor(config?: Partial<SessionConfig>) {
    this.config = {
      maxIdleTime: 30 * 60 * 1000, // 30 minutes
      warningTime: 5 * 60 * 1000, // 5 minutes warning
      refreshInterval: 10 * 60 * 1000, // 10 minutes
      extendOnActivity: true,
      ...config,
    };

    this.state = {
      lastActivity: Date.now(),
      isActive: true,
      willExpireAt: Date.now() + this.config.maxIdleTime,
      showWarning: false,
    };

    this.initialize();
  }

  private initialize(): void {
    // Set up activity listeners
    if (typeof window !== 'undefined') {
      this.activityEvents.forEach(event => {
        window.addEventListener(event, this.handleActivity, { passive: true });
      });

      // Set up visibility change listener
      document.addEventListener(
        'visibilitychange',
        this.handleVisibilityChange
      );

      // Start monitoring
      this.startMonitoring();
    }
  }

  private handleActivity = (): void => {
    if (!this.config.extendOnActivity) return;

    const now = Date.now();
    const timeSinceLastActivity = now - this.state.lastActivity;

    // Only update if significant time has passed (1 second)
    if (timeSinceLastActivity > 1000) {
      this.updateActivity();
    }
  };

  private handleVisibilityChange = (): void => {
    if (document.hidden) {
      // Page is hidden, pause refresh
      this.pauseRefresh();
    } else {
      // Page is visible, resume refresh and check session
      this.resumeRefresh();
      this.checkSession();
    }
  };

  private updateActivity(): void {
    const now = Date.now();
    this.state.lastActivity = now;
    this.state.willExpireAt = now + this.config.maxIdleTime;
    this.state.showWarning = false;
    this.state.isActive = true;

    // Reset timers
    this.resetTimers();
    this.startMonitoring();

    // Notify listeners
    this.notifyListeners();
  }

  private startMonitoring(): void {
    // Clear existing timers
    this.resetTimers();

    // Set warning timer
    const timeUntilWarning = this.config.maxIdleTime - this.config.warningTime;
    this.timers.warning = setTimeout(() => {
      this.showSessionWarning();
    }, timeUntilWarning);

    // Set expiration timer
    this.timers.idle = setTimeout(() => {
      this.expireSession();
    }, this.config.maxIdleTime);

    // Set refresh timer
    this.timers.refresh = setInterval(() => {
      this.refreshSession();
    }, this.config.refreshInterval);
  }

  private resetTimers(): void {
    if (this.timers.idle) {
      clearTimeout(this.timers.idle);
    }
    if (this.timers.warning) {
      clearTimeout(this.timers.warning);
    }
    if (this.timers.refresh) {
      clearInterval(this.timers.refresh);
    }
  }

  private showSessionWarning(): void {
    this.state.showWarning = true;
    this.notifyListeners();
  }

  private async expireSession(): Promise<void> {
    this.state.isActive = false;
    this.state.showWarning = false;
    this.resetTimers();
    this.notifyListeners();

    // Log out user
    if (typeof window !== 'undefined') {
      try {
        // Redirect to login (sign out will be handled by the auth system)
        window.location.href = '/sign-in?reason=session_expired';
      } catch (error) {
        console.error('Failed to sign out:', error);
      }
    }
  }

  private async refreshSession(): Promise<void> {
    if (!this.state.isActive) return;

    try {
      // Refresh authentication token
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to refresh session');
      }

      // Update last activity
      this.state.lastActivity = Date.now();
      this.notifyListeners();
    } catch (error) {
      console.error('Session refresh failed:', error);
      // If refresh fails, show warning
      this.showSessionWarning();
    }
  }

  private pauseRefresh(): void {
    if (this.timers.refresh) {
      clearInterval(this.timers.refresh);
    }
  }

  private resumeRefresh(): void {
    this.timers.refresh = setInterval(() => {
      this.refreshSession();
    }, this.config.refreshInterval);
  }

  private checkSession(): void {
    const now = Date.now();
    const timeSinceLastActivity = now - this.state.lastActivity;

    if (timeSinceLastActivity > this.config.maxIdleTime) {
      // Session has expired while page was hidden
      this.expireSession();
    } else if (
      timeSinceLastActivity >
      this.config.maxIdleTime - this.config.warningTime
    ) {
      // Should show warning
      this.showSessionWarning();
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      listener({ ...this.state });
    });
  }

  // Public methods

  public extendSession(): void {
    this.updateActivity();
  }

  public getState(): SessionState {
    return { ...this.state };
  }

  public subscribe(listener: (state: SessionState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public updateConfig(config: Partial<SessionConfig>): void {
    this.config = { ...this.config, ...config };
    this.resetTimers();
    this.startMonitoring();
  }

  public destroy(): void {
    // Remove event listeners
    if (typeof window !== 'undefined') {
      this.activityEvents.forEach(event => {
        window.removeEventListener(event, this.handleActivity);
      });
      document.removeEventListener(
        'visibilitychange',
        this.handleVisibilityChange
      );
    }

    // Clear timers
    this.resetTimers();

    // Clear listeners
    this.listeners.clear();
  }

  // Security methods

  public async verifySession(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        credentials: 'include',
      });

      return response.ok;
    } catch (error) {
      console.error('Session verification failed:', error);
      return false;
    }
  }

  public getTimeUntilExpiry(): number {
    return Math.max(0, this.state.willExpireAt - Date.now());
  }

  public getIdleTime(): number {
    return Date.now() - this.state.lastActivity;
  }

  public isSessionValid(): boolean {
    return this.state.isActive && this.getIdleTime() < this.config.maxIdleTime;
  }
}

// Create singleton instance
let sessionManagerInstance: null | SessionManager = null;

export function getSessionManager(
  config?: Partial<SessionConfig>
): SessionManager {
  if (!sessionManagerInstance) {
    sessionManagerInstance = new SessionManager(config);
  }
  return sessionManagerInstance;
}

export function destroySessionManager(): void {
  if (sessionManagerInstance) {
    sessionManagerInstance.destroy();
    sessionManagerInstance = null;
  }
}

// React hook for session management
export function useSessionManager() {
  const [state, setState] = React.useState<SessionState>(() => {
    const manager = getSessionManager();
    return manager.getState();
  });

  React.useEffect(() => {
    const manager = getSessionManager();
    const unsubscribe = manager.subscribe(setState);
    return unsubscribe;
  }, []);

  return {
    ...state,
    extendSession: () => getSessionManager().extendSession(),
    timeUntilExpiry: getSessionManager().getTimeUntilExpiry(),
    idleTime: getSessionManager().getIdleTime(),
    isValid: getSessionManager().isSessionValid(),
  };
}

import React from 'react';
