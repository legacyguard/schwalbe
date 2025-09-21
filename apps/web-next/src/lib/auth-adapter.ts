// Minimal Auth Adapter (no-op) for onboarding integration
// Safe default: does not call external providers; stores a small marker in localStorage.

export type User = { id: string | null };

export interface AuthAdapter {
  getUser(): Promise<User>;
  setOnboardingCompleted(userId: string | null, at: Date): Promise<void>;
}

export const authAdapter: AuthAdapter = {
  async getUser(): Promise<User> {
    // No-op user (not signed in). Later, replace with real provider implementation.
    return { id: null };
  },
  async setOnboardingCompleted(userId: string | null, at: Date): Promise<void> {
    try {
      if (typeof window === 'undefined') return;
      const payload = { userId, at: at.toISOString() };
      localStorage.setItem('onb_completed_marker', JSON.stringify(payload));
    } catch {
      // ignore storage errors
    }
  },
};
