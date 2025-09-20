/**
 * @description Bridge utilities for sharing code between mobile and web platforms
 * Provides platform-specific implementations and common interfaces
 */

// Platform detection
export const Platform = {
  OS: typeof navigator !== 'undefined' && navigator.userAgent ? 'web' : 'native',
  isWeb: typeof window !== 'undefined',
  isMobile: typeof navigator !== 'undefined' && navigator.userAgent ? /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) : true,
};

// Storage abstraction
export interface Storage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export const createStorage = (): Storage => {
  if (Platform.isWeb) {
    return {
      getItem: async (key: string) => localStorage.getItem(key),
      setItem: async (key: string, value: string) => localStorage.setItem(key, value),
      removeItem: async (key: string) => localStorage.removeItem(key),
    };
  }

  // Mobile implementation would use AsyncStorage
  return {
    getItem: async () => null,
    setItem: async () => {},
    removeItem: async () => {},
  };
};

// Navigation abstraction
export interface Navigation {
  navigate(route: string, params?: Record<string, any>): void;
  goBack(): void;
  canGoBack(): boolean;
}

// Haptic feedback abstraction
export interface HapticFeedback {
  light(): Promise<void>;
  medium(): Promise<void>;
  heavy(): Promise<void>;
  selection(): Promise<void>;
}

export const createHapticFeedback = (): HapticFeedback => {
  if (Platform.isWeb) {
    // Web implementation using Vibration API if available
    const vibrate = (pattern: number[]) => {
      if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    };

    return {
      light: async () => vibrate([10]),
      medium: async () => vibrate([20]),
      heavy: async () => vibrate([30]),
      selection: async () => vibrate([5]),
    };
  }

  // Mobile implementation would use Expo Haptics
  return {
    light: async () => {},
    medium: async () => {},
    heavy: async () => {},
    selection: async () => {},
  };
};

// Shared validation utilities
export const validators = {
  email: (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  phone: (phone: string): boolean => /^\+?[\d\s-()]+$/.test(phone),
  required: (value: any): boolean => value !== null && value !== undefined && value !== '',
};

// Shared formatting utilities
export const formatters = {
  currency: (amount: number, currency = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  },

  date: (date: Date | string, locale = 'en-US'): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString(locale);
  },

  dateTime: (date: Date | string, locale = 'en-US'): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString(locale);
  },
};

// Shared error handling
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = {
  handle: (error: Error | AppError, context?: string): void => {
    if (Platform.isWeb) {
      console.error(`[${context || 'Unknown'}]:`, error);
    } else {
      // Mobile logging would use different service
      console.error(error);
    }
  },

  createNetworkError: (message: string): AppError =>
    new AppError(message, 'NETWORK_ERROR'),

  createValidationError: (field: string, message: string): AppError =>
    new AppError(message, 'VALIDATION_ERROR', { field }),
};