
/**
 * Sofia Proactive Intervention Service
 * Detects user behavior patterns and offers timely, contextual help
 */

import type { SofiaContext } from './sofia-types';
import { getSofiaMemory } from './sofia-memory';

export interface ProactiveIntervention {
  actions?: Array<{
    action: string;
    icon?: string;
    text: string;
  }>;
  displayAfterMs: number;
  id: string;
  message: string;
  priority: 'high' | 'low' | 'medium';
  trigger: string;
  type:
    | 'idle_help'
    | 'milestone_encouragement'
    | 'return_greeting'
    | 'stuck_detection'
    | 'task_completion';
}

export interface UserActivityState {
  clickEvents: number;
  currentPage: string;
  formInteractions: number;
  idleTime: number;
  lastAction: null | string;
  lastActionTime: Date | null;
  mouseMovements: number;
  scrollEvents: number;
  timeOnPage: number;
}

export class SofiaProactiveService {
  private userId: string;
  private activityState: UserActivityState;
  private interventionQueue: ProactiveIntervention[] = [];
  private shownInterventions: Set<string> = new Set();
  private idleTimer: null | number = null;
  private activityTrackers: Map<string, () => void> = new Map();
  private ___interventionCallback?: (intervention: ProactiveIntervention) => void;

  constructor(userId: string) {
    this.userId = userId;
    this.activityState = this.initializeActivityState();
    this.loadShownInterventions();
  }

  private initializeActivityState(): UserActivityState {
    return {
      currentPage: '',
      timeOnPage: 0,
      lastAction: null,
      lastActionTime: null,
      idleTime: 0,
      mouseMovements: 0,
      scrollEvents: 0,
      clickEvents: 0,
      formInteractions: 0,
    };
  }

  /**
   * Start monitoring user activity on a page
   */
  startMonitoring(
    page: string,
    callback?: (intervention: ProactiveIntervention) => void
  ): void {
    this.stopMonitoring(); // Clean up any existing monitoring

    this.___interventionCallback = callback;
    this.activityState = {
      ...this.initializeActivityState(),
      currentPage: page,
    };

    // Start idle detection
    this.resetIdleTimer();

    // Track mouse movements
    const handleMouseMove = () => {
      this.activityState.mouseMovements++;
      this.resetIdleTimer();
    };

    // Track scroll events
    const handleScroll = () => {
      this.activityState.scrollEvents++;
      this.resetIdleTimer();
    };

    // Track click events
    const handleClick = () => {
      this.activityState.clickEvents++;
      this.activityState.lastAction = 'click';
      this.activityState.lastActionTime = new Date();
      this.resetIdleTimer();
    };

    // Track form interactions
    const handleFormInteraction = () => {
      this.activityState.formInteractions++;
      this.activityState.lastAction = 'form_interaction';
      this.activityState.lastActionTime = new Date();
      this.resetIdleTimer();
    };

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('scroll', handleScroll);
    document.addEventListener('click', handleClick);
    document.addEventListener('input', handleFormInteraction);
    document.addEventListener('change', handleFormInteraction);

    // Store cleanup functions
    this.activityTrackers.set('mousemove', () =>
      document.removeEventListener('mousemove', handleMouseMove)
    );
    this.activityTrackers.set('scroll', () =>
      document.removeEventListener('scroll', handleScroll)
    );
    this.activityTrackers.set('click', () =>
      document.removeEventListener('click', handleClick)
    );
    this.activityTrackers.set('input', () =>
      document.removeEventListener('input', handleFormInteraction)
    );
    this.activityTrackers.set('change', () =>
      document.removeEventListener('change', handleFormInteraction)
    );

    // Track time on page
    const startTime = Date.now();
    const timeTracker = setInterval(() => {
      this.activityState.timeOnPage = Date.now() - startTime;
      this.checkForInterventions();
    }, 1000); // Check every second

    this.activityTrackers.set('timeTracker', () => clearInterval(timeTracker));
  }

  /**
   * Stop monitoring user activity
   */
  stopMonitoring(): void {
    // Clean up all event listeners
    this.activityTrackers.forEach(cleanup => cleanup());
    this.activityTrackers.clear();

    // Clear idle timer
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }

  /**
   * Get current activity state
   */
  getCurrentActivity(): UserActivityState {
    return { ...this.activityState };
  }

  /**
   * Reset idle timer
   */
  private resetIdleTimer(): void {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
    }

    this.activityState.idleTime = 0;

    this.idleTimer = setTimeout(() => {
      this.activityState.idleTime = 180000; // 3 minutes idle
      this.checkForIdleIntervention();
    }, 180000); // 3 minutes
  }

  /**
   * Check if any interventions should be triggered
   */
  private checkForInterventions(): void {
    const { currentPage, timeOnPage, formInteractions, scrollEvents } =
      this.activityState;

    // Check for stuck on will generator (specific scenario from requirements)
    if (
      currentPage === 'will-generator' &&
      timeOnPage > 180000 &&
      formInteractions === 0
    ) {
      this.queueIntervention({
        id: 'will_generator_help',
        type: 'stuck_detection',
        trigger: 'idle_on_will_generator',
        message:
          "I notice you've been looking at the will generator for a while. Creating a will can feel overwhelming, but I'm here to help. Would you like me to explain any of the terms or guide you through the first step?",
        actions: [
          {
            text: 'Explain the terms',
            action: 'explain_will_terms',
            icon: 'help',
          },
          {
            text: 'Guide me step by step',
            action: 'start_will_wizard',
            icon: 'compass',
          },
          { text: "I'm just reading", action: 'dismiss', icon: 'x' },
        ],
        priority: 'medium',
        displayAfterMs: 0,
      });
    }

    // Check for exploration without action on vault page
    if (
      currentPage === 'vault' &&
      timeOnPage > 120000 &&
      scrollEvents > 5 &&
      formInteractions === 0
    ) {
      this.queueIntervention({
        id: 'vault_exploration_help',
        type: 'idle_help',
        trigger: 'exploring_vault',
        message:
          "I see you're exploring your document vault. Would you like to add a new document or learn about organizing your files?",
        actions: [
          { text: 'Add a document', action: 'open_upload', icon: 'upload' },
          {
            text: 'Learn about categories',
            action: 'explain_categories',
            icon: 'info',
          },
          { text: 'Continue browsing', action: 'dismiss', icon: 'x' },
        ],
        priority: 'low',
        displayAfterMs: 2000,
      });
    }

    // Check for first-time user on dashboard
    if (
      currentPage === 'dashboard' &&
      timeOnPage > 60000 &&
      timeOnPage < 90000
    ) {
      const memory = getSofiaMemory(this.userId);
      const insights = memory.getConversationInsights();

      if (insights.totalConversations === 0) {
        this.queueIntervention({
          id: 'first_time_dashboard_help',
          type: 'idle_help',
          trigger: 'new_user_dashboard',
          message:
            "Welcome! I'm Sofia, your digital guide. I'm here to help you protect your family's future. Would you like a quick tour of what you can do here?",
          actions: [
            { text: 'Show me around', action: 'start_tour', icon: 'map' },
            {
              text: 'Tell me about security',
              action: 'explain_security',
              icon: 'shield',
            },
            { text: 'Let me explore', action: 'dismiss', icon: 'x' },
          ],
          priority: 'high',
          displayAfterMs: 1000,
        });
      }
    }
  }

  /**
   * Check for idle intervention
   */
  private checkForIdleIntervention(): void {
    const { currentPage, formInteractions } = this.activityState;

    // Only intervene if user was actively working on something
    if (formInteractions > 0) {
      this.queueIntervention({
        id: `idle_${currentPage}_${Date.now()}`,
        type: 'idle_help',
        trigger: 'extended_idle',
        message:
          "You've been away for a moment. Would you like me to save your progress or help you continue?",
        actions: [
          { text: 'Save my progress', action: 'save_progress', icon: 'save' },
          { text: 'Continue working', action: 'dismiss', icon: 'arrow-right' },
        ],
        priority: 'medium',
        displayAfterMs: 0,
      });
    }
  }

  /**
   * Queue an intervention
   */
  private queueIntervention(intervention: ProactiveIntervention): void {
    // Don't show the same intervention twice in a session
    if (this.shownInterventions.has(intervention.id)) {
      return;
    }

    // Don't queue duplicate interventions
    if (this.interventionQueue.some(i => i.id === intervention.id)) {
      return;
    }

    this.interventionQueue.push(intervention);
    this.interventionQueue.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Get the next intervention to show
   */
  getNextIntervention(): null | ProactiveIntervention {
    const intervention = this.interventionQueue.shift();
    if (intervention) {
      this.shownInterventions.add(intervention.id);
      this.saveShownInterventions();
    }
    return intervention || null;
  }

  /**
   * Check if there are pending interventions
   */
  hasPendingInterventions(): boolean {
    return this.interventionQueue.length > 0;
  }

  /**
   * Create a return greeting intervention
   */
  createReturnGreeting(context: SofiaContext): null | ProactiveIntervention {
    const memory = getSofiaMemory(this.userId);
    const lastInteraction = memory.getConversationInsights().lastInteraction;

    if (!lastInteraction) {
      return null;
    }

    const hoursSinceLastInteraction =
      (Date.now() - lastInteraction.getTime()) / (1000 * 60 * 60);

    // Only show return greeting if it's been at least 2 hours
    if (hoursSinceLastInteraction < 2) {
      return null;
    }

    const unfinishedTasks = memory.getUnfinishedTasks();
    const welcomeMessage = memory.getWelcomeBackMessage(context);

    const actions = [];
    if (unfinishedTasks.length > 0) {
      actions.push({
        text: 'Continue where I left off',
        action: 'resume_tasks',
        icon: 'play',
      });
    }
    actions.push(
      {
        text: 'What should I do next?',
        action: 'suggest_next',
        icon: 'compass',
      },
      { text: 'Just browsing', action: 'dismiss', icon: 'x' }
    );

    return {
      id: `return_greeting_${Date.now()}`,
      type: 'return_greeting',
      trigger: 'user_return',
      message: welcomeMessage,
      actions,
      priority: 'high',
      displayAfterMs: 2000,
    };
  }

  /**
   * Mark an intervention as completed
   */
  markInterventionCompleted(interventionId: string, action: string): void {
    // Log the interaction for learning
    const memory = getSofiaMemory(this.userId);
    memory.addLearningNote(
      `User responded to ${interventionId} with action: ${action}`
    );
  }

  /**
   * Load shown interventions from storage
   */
  private loadShownInterventions(): void {
    try {
      const stored = sessionStorage.getItem(
        `sofia_shown_interventions_${this.userId}`
      );
      if (stored) {
        this.shownInterventions = new Set(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load shown interventions:', error);
    }
  }

  /**
   * Save shown interventions to storage
   */
  private saveShownInterventions(): void {
    try {
      sessionStorage.setItem(
        `sofia_shown_interventions_${this.userId}`,
        JSON.stringify(Array.from(this.shownInterventions))
      );
    } catch (error) {
      console.error('Failed to save shown interventions:', error);
    }
  }

  /**
   * Clear intervention history (for new session)
   */
  clearInterventionHistory(): void {
    this.shownInterventions.clear();
    sessionStorage.removeItem(`sofia_shown_interventions_${this.userId}`);
  }

  /**
   * Get activity insights
   */
  getActivityInsights(): UserActivityState {
    return { ...this.activityState };
  }
}

// Singleton instance manager
const proactiveInstances: Map<string, SofiaProactiveService> = new Map();

export function getSofiaProactive(userId: string): SofiaProactiveService {
  if (!proactiveInstances.has(userId)) {
    proactiveInstances.set(userId, new SofiaProactiveService(userId));
  }
  return proactiveInstances.get(userId) || new SofiaProactiveService(userId);
}
