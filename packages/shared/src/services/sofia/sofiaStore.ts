// Sofia Store - State management for Sofia AI interactions
// Provides centralized state for messages, context, and UI state

import type { SofiaContext, SofiaMessage } from '@schwalbe/logic';

import { logger } from '../../lib/logger';
interface SofiaStore {
  // Chat state
  messages: SofiaMessage[];
  isTyping: boolean;
  isVisible: boolean;
  // User context for Sofia
  context: null | SofiaContext;

  // Actions
  addMessage: (message: SofiaMessage) => void;
  setMessages: (messages: SofiaMessage[]) => void;
  updateMessages: (
    updateFn: (messages: SofiaMessage[]) => SofiaMessage[]
  ) => void;
  clearMessages: () => void;
  setTyping: (typing: boolean) => void;
  toggleVisibility: () => void;
  showSofia: () => void;
  hideSofia: () => void;
  setContext: (context: SofiaContext) => void;
  updateContext: (context: Partial<SofiaContext>) => void;

  // Helper getters
  getLastUserMessage: () => SofiaMessage | undefined;
  getMessageCount: () => number;
}

// Simple in-memory store implementation
// Can be replaced with Zustand, Redux, or other state management solutions
class SimpleSofiaStore implements SofiaStore {
  private state: {
    messages: SofiaMessage[];
    isTyping: boolean;
    isVisible: boolean;
    context: null | SofiaContext;
  };

  private subscribers: Set<() => void>;

  constructor() {
    this.state = {
      messages: [],
      isTyping: false,
      isVisible: false,
      context: null,
    };
    this.subscribers = new Set();

    // Load persisted state if available
    this.loadPersistedState();
  }

  private loadPersistedState() {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('sofia-store');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.state = {
          ...this.state,
          messages: parsed.messages || [],
          context: parsed.context || null,
        };
      }
    } catch (error) {
      logger.error('Failed to load Sofia store state:', error);
    }
  }

  private persistState() {
    if (typeof window === 'undefined') return;

    try {
      const stateToStore = {
        messages: this.state.messages,
        context: this.state.context,
      };
      localStorage.setItem('sofia-store', JSON.stringify(stateToStore));
    } catch (error) {
      logger.error('Failed to persist Sofia store state:', error);
    }
  }

  private notify() {
    this.subscribers.forEach(callback => callback());
  }

  private setState(updater: (state: typeof this.state) => Partial<typeof this.state>) {
    this.state = { ...this.state, ...updater(this.state) };
    this.persistState();
    this.notify();
  }

  // Public API
  get messages() { return this.state.messages; }
  get isTyping() { return this.state.isTyping; }
  get isVisible() { return this.state.isVisible; }
  get context() { return this.state.context; }

  addMessage = (message: SofiaMessage) => {
    this.setState(state => ({
      messages: [...state.messages, message],
    }));
  };

  setMessages = (messages: SofiaMessage[]) => {
    this.setState(() => ({ messages }));
  };

  updateMessages = (updateFn: (messages: SofiaMessage[]) => SofiaMessage[]) => {
    this.setState(state => ({
      messages: updateFn(state.messages),
    }));
  };

  clearMessages = () => {
    this.setState(() => ({ messages: [] }));
  };

  setTyping = (typing: boolean) => {
    this.setState(() => ({ isTyping: typing }));
  };

  toggleVisibility = () => {
    this.setState(state => ({ isVisible: !state.isVisible }));
  };

  showSofia = () => {
    this.setState(() => ({ isVisible: true }));
  };

  hideSofia = () => {
    this.setState(() => ({ isVisible: false }));
  };

  setContext = (context: SofiaContext) => {
    this.setState(() => ({ context }));
  };

  updateContext = (newContext: Partial<SofiaContext>) => {
    this.setState(state => ({
      context: state.context
        ? { ...state.context, ...newContext }
        : (newContext as SofiaContext),
    }));
  };

  getLastUserMessage = () => {
    const userMessages = this.state.messages.filter(msg => msg.role === 'user');
    return userMessages[userMessages.length - 1];
  };

  getMessageCount = () => {
    return this.state.messages.length;
  };

  // Subscription methods for React integration
  subscribe = (callback: () => void) => {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  };
}

// Global store instance
export const sofiaStore = new SimpleSofiaStore();

// React hooks for store integration
export function useSofiaStore<T>(selector?: (store: SofiaStore) => T): SofiaStore | T {
  const forceUpdate = useForceUpdate();

  React.useEffect(() => {
    return sofiaStore.subscribe(forceUpdate);
  }, [forceUpdate]);

  if (selector) {
    return selector(sofiaStore);
  }

  return sofiaStore;
}

// Utility hook for getting current user context
export function useUserContext() {
  const context = useSofiaStore(state => state.context);
  const updateContext = useSofiaStore(state => state.updateContext);

  return { context, updateContext };
}

// Simple force update hook for React integration
function useForceUpdate() {
  const [, setTick] = React.useState(0);
  const update = React.useCallback(() => {
    setTick(tick => tick + 1);
  }, []);
  return update;
}

// Import React for hooks - this should be provided by the consuming application
declare const React: any;