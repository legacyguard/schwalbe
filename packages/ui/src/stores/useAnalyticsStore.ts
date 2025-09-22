import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface UserEvent {
  id: string;
  type: 'page_view' | 'click' | 'form_submit' | 'document_upload' | 'sofia_interaction' | 'milestone_achieved' | 'feature_used';
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: Date;
  sessionId: string;
  userId?: string;
  anonymizedUserId: string;
  metadata: Record<string, any>;
  privacyLevel: 'anonymous' | 'pseudonymous' | 'identifiable';
}

export interface UserSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  pageViews: number;
  interactions: number;
  conversions: number;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  source: string;
  anonymizedUserId: string;
}

export interface FeatureUsage {
  feature: string;
  category: string;
  usageCount: number;
  uniqueUsers: number;
  avgTimeSpent: number;
  completionRate: number;
  lastUsed: Date;
  adoptionRate: number;
}

export interface UserJourney {
  id: string;
  anonymizedUserId: string;
  steps: {
    page: string;
    timestamp: Date;
    duration: number;
    action?: string;
  }[];
  conversionEvents: string[];
  dropoffPoint?: string;
  completed: boolean;
  goalAchieved: boolean;
}

export interface BehaviorInsight {
  id: string;
  type: 'pattern' | 'anomaly' | 'trend' | 'opportunity';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  confidence: number;
  data: Record<string, any>;
  recommendations: string[];
  createdAt: Date;
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  variants: {
    id: string;
    name: string;
    traffic: number;
    config: Record<string, any>;
  }[];
  targetMetric: string;
  startDate?: Date;
  endDate?: Date;
  results?: {
    variant: string;
    conversionRate: number;
    confidence: number;
    significance: number;
  }[];
}

export interface PrivacySettings {
  enableTracking: boolean;
  allowPersonalization: boolean;
  dataRetentionDays: number;
  anonymizationLevel: 'full' | 'partial' | 'minimal';
  shareWithThirdParties: boolean;
  cookieConsent: boolean;
  marketingConsent: boolean;
}

interface AnalyticsState {
  // Events & Sessions
  events: UserEvent[];
  sessions: UserSession[];
  currentSession: UserSession | null;

  // Analytics Data
  featureUsage: FeatureUsage[];
  userJourneys: UserJourney[];
  behaviorInsights: BehaviorInsight[];

  // A/B Testing
  abTests: ABTest[];
  userVariants: Record<string, string>;

  // Privacy & Settings
  privacySettings: PrivacySettings;
  isOptedOut: boolean;

  // Real-time Metrics
  realTimeMetrics: {
    activeUsers: number;
    pageViews: number;
    conversions: number;
    avgSessionDuration: number;
    bounceRate: number;
    topPages: { page: string; views: number; }[];
    topFeatures: { feature: string; usage: number; }[];
  };

  // Performance
  isLoading: boolean;
  lastSyncAt: Date | null;
  pendingEvents: UserEvent[];
}

interface AnalyticsActions {
  // Event Tracking
  trackEvent: (event: Omit<UserEvent, 'id' | 'timestamp' | 'sessionId' | 'anonymizedUserId'>) => void;
  trackPageView: (page: string, metadata?: Record<string, any>) => void;
  trackClick: (element: string, category: string, metadata?: Record<string, any>) => void;
  trackFormSubmit: (form: string, success: boolean, metadata?: Record<string, any>) => void;
  trackDocumentUpload: (type: string, size: number, metadata?: Record<string, any>) => void;
  trackSofiaInteraction: (type: string, satisfaction?: number, metadata?: Record<string, any>) => void;
  trackMilestone: (milestone: string, value?: number, metadata?: Record<string, any>) => void;
  trackFeatureUsage: (feature: string, category: string, timeSpent?: number, metadata?: Record<string, any>) => void;

  // Session Management
  startSession: (deviceType: 'mobile' | 'tablet' | 'desktop', source: string) => void;
  endSession: () => void;
  updateSession: (updates: Partial<UserSession>) => void;

  // User Journey
  addJourneyStep: (page: string, action?: string) => void;
  completeJourney: (goalAchieved: boolean) => void;
  trackDropoff: (page: string, reason?: string) => void;

  // Feature Analytics
  updateFeatureUsage: (feature: string, category: string) => void;
  calculateAdoptionRates: () => void;
  getTopFeatures: (limit?: number) => FeatureUsage[];

  // Insights
  generateInsights: () => void;
  addInsight: (insight: Omit<BehaviorInsight, 'id' | 'createdAt'>) => void;
  dismissInsight: (insightId: string) => void;

  // A/B Testing
  createABTest: (test: Omit<ABTest, 'id'>) => void;
  startABTest: (testId: string) => void;
  stopABTest: (testId: string) => void;
  getVariant: (testId: string) => string | null;
  recordConversion: (testId: string, variant: string) => void;

  // Privacy & GDPR
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => void;
  optOut: () => void;
  optIn: () => void;
  exportUserData: () => Promise<any>;
  deleteUserData: () => void;
  anonymizeUserData: () => void;

  // Real-time Metrics
  updateRealTimeMetrics: () => void;
  getActiveUsers: () => number;
  getConversionRate: (timeframe?: '1h' | '24h' | '7d' | '30d') => number;
  getBounceRate: (timeframe?: '1h' | '24h' | '7d' | '30d') => number;

  // Data Management
  syncWithServer: () => Promise<void>;
  clearOldData: (olderThanDays: number) => void;
  exportAnalytics: (format: 'json' | 'csv') => Promise<Blob>;
  importAnalytics: (data: any) => void;

  // Utilities
  generateAnonymizedUserId: () => string;
  generateSessionId: () => string;
  isTrackingEnabled: () => boolean;
  shouldTrackEvent: (event: UserEvent) => boolean;
}

const defaultPrivacySettings: PrivacySettings = {
  enableTracking: true,
  allowPersonalization: true,
  dataRetentionDays: 365,
  anonymizationLevel: 'partial',
  shareWithThirdParties: false,
  cookieConsent: false,
  marketingConsent: false,
};

const defaultRealTimeMetrics = {
  activeUsers: 0,
  pageViews: 0,
  conversions: 0,
  avgSessionDuration: 0,
  bounceRate: 0,
  topPages: [],
  topFeatures: [],
};

export const useAnalyticsStore = create<AnalyticsState & AnalyticsActions>()(
  persist(
    immer((set, get) => ({
      // Initial State
      events: [],
      sessions: [],
      currentSession: null,
      featureUsage: [],
      userJourneys: [],
      behaviorInsights: [],
      abTests: [],
      userVariants: {},
      privacySettings: defaultPrivacySettings,
      isOptedOut: false,
      realTimeMetrics: defaultRealTimeMetrics,
      isLoading: false,
      lastSyncAt: null,
      pendingEvents: [],

      // Event Tracking Actions
      trackEvent: (eventData) => {
        const state = get();
        if (!state.isTrackingEnabled()) return;

        const event: UserEvent = {
          ...eventData,
          id: crypto.randomUUID(),
          timestamp: new Date(),
          sessionId: state.currentSession?.id || state.generateSessionId(),
          anonymizedUserId: state.generateAnonymizedUserId(),
        };

        if (!state.shouldTrackEvent(event)) return;

        set((draft) => {
          draft.events.push(event);
          draft.pendingEvents.push(event);

          // Update current session
          if (draft.currentSession) {
            draft.currentSession.interactions++;
            if (event.type === 'page_view') {
              draft.currentSession.pageViews++;
            }
          }
        });

        // Update real-time metrics
        state.updateRealTimeMetrics();
      },

      trackPageView: (page, metadata = {}) => {
        get().trackEvent({
          type: 'page_view',
          category: 'navigation',
          action: 'view',
          label: page,
          metadata: { page, ...metadata },
          privacyLevel: 'anonymous',
        });
      },

      trackClick: (element, category, metadata = {}) => {
        get().trackEvent({
          type: 'click',
          category,
          action: 'click',
          label: element,
          metadata: { element, ...metadata },
          privacyLevel: 'anonymous',
        });
      },

      trackFormSubmit: (form, success, metadata = {}) => {
        get().trackEvent({
          type: 'form_submit',
          category: 'form',
          action: success ? 'submit_success' : 'submit_error',
          label: form,
          value: success ? 1 : 0,
          metadata: { form, success, ...metadata },
          privacyLevel: 'pseudonymous',
        });
      },

      trackDocumentUpload: (type, size, metadata = {}) => {
        get().trackEvent({
          type: 'document_upload',
          category: 'document',
          action: 'upload',
          label: type,
          value: size,
          metadata: { type, size, ...metadata },
          privacyLevel: 'pseudonymous',
        });
      },

      trackSofiaInteraction: (type, satisfaction, metadata = {}) => {
        get().trackEvent({
          type: 'sofia_interaction',
          category: 'ai',
          action: type,
          value: satisfaction,
          metadata: { type, satisfaction, ...metadata },
          privacyLevel: 'pseudonymous',
        });
      },

      trackMilestone: (milestone, value, metadata = {}) => {
        get().trackEvent({
          type: 'milestone_achieved',
          category: 'progress',
          action: 'achieve',
          label: milestone,
          value,
          metadata: { milestone, ...metadata },
          privacyLevel: 'pseudonymous',
        });
      },

      trackFeatureUsage: (feature, category, timeSpent, metadata = {}) => {
        get().trackEvent({
          type: 'feature_used',
          category,
          action: 'use',
          label: feature,
          value: timeSpent,
          metadata: { feature, timeSpent, ...metadata },
          privacyLevel: 'anonymous',
        });

        get().updateFeatureUsage(feature, category);
      },

      // Session Management
      startSession: (deviceType, source) => {
        const sessionId = get().generateSessionId();
        const session: UserSession = {
          id: sessionId,
          startTime: new Date(),
          pageViews: 0,
          interactions: 0,
          conversions: 0,
          deviceType,
          source,
          anonymizedUserId: get().generateAnonymizedUserId(),
        };

        set((draft) => {
          draft.currentSession = session;
          draft.sessions.push(session);
        });
      },

      endSession: () => {
        set((draft) => {
          if (draft.currentSession) {
            draft.currentSession.endTime = new Date();
            draft.currentSession.duration =
              draft.currentSession.endTime.getTime() - draft.currentSession.startTime.getTime();
          }
          draft.currentSession = null;
        });
      },

      updateSession: (updates) => {
        set((draft) => {
          if (draft.currentSession) {
            Object.assign(draft.currentSession, updates);
          }
        });
      },

      // User Journey
      addJourneyStep: (page, action) => {
        const state = get();
        const anonymizedUserId = state.generateAnonymizedUserId();

        set((draft) => {
          let journey = draft.userJourneys.find(j =>
            j.anonymizedUserId === anonymizedUserId && !j.completed
          );

          if (!journey) {
            journey = {
              id: crypto.randomUUID(),
              anonymizedUserId,
              steps: [],
              conversionEvents: [],
              completed: false,
              goalAchieved: false,
            };
            draft.userJourneys.push(journey);
          }

          journey.steps.push({
            page,
            timestamp: new Date(),
            duration: 0,
            action,
          });
        });
      },

      completeJourney: (goalAchieved) => {
        const anonymizedUserId = get().generateAnonymizedUserId();

        set((draft) => {
          const journey = draft.userJourneys.find(j =>
            j.anonymizedUserId === anonymizedUserId && !j.completed
          );

          if (journey) {
            journey.completed = true;
            journey.goalAchieved = goalAchieved;
          }
        });
      },

      trackDropoff: (page, reason) => {
        const anonymizedUserId = get().generateAnonymizedUserId();

        set((draft) => {
          const journey = draft.userJourneys.find(j =>
            j.anonymizedUserId === anonymizedUserId && !j.completed
          );

          if (journey) {
            journey.dropoffPoint = page;
            journey.completed = true;
            journey.goalAchieved = false;
          }
        });
      },

      // Feature Analytics
      updateFeatureUsage: (feature, category) => {
        set((draft) => {
          let usage = draft.featureUsage.find(f => f.feature === feature);

          if (!usage) {
            usage = {
              feature,
              category,
              usageCount: 0,
              uniqueUsers: 0,
              avgTimeSpent: 0,
              completionRate: 0,
              lastUsed: new Date(),
              adoptionRate: 0,
            };
            draft.featureUsage.push(usage);
          }

          usage.usageCount++;
          usage.lastUsed = new Date();
        });
      },

      calculateAdoptionRates: () => {
        const state = get();
        const totalUsers = new Set(state.events.map(e => e.anonymizedUserId)).size;

        set((draft) => {
          draft.featureUsage.forEach(usage => {
            const featureUsers = new Set(
              state.events
                .filter(e => e.label === usage.feature)
                .map(e => e.anonymizedUserId)
            ).size;

            usage.uniqueUsers = featureUsers;
            usage.adoptionRate = totalUsers > 0 ? (featureUsers / totalUsers) * 100 : 0;
          });
        });
      },

      getTopFeatures: (limit = 10) => {
        const { featureUsage } = get();
        return featureUsage
          .sort((a, b) => b.usageCount - a.usageCount)
          .slice(0, limit);
      },

      // Insights
      generateInsights: () => {
        const state = get();
        const insights: BehaviorInsight[] = [];

        // Analyze usage patterns
        const recentEvents = state.events.filter(e =>
          new Date(e.timestamp).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
        );

        // Drop-off analysis
        const incompleteJourneys = state.userJourneys.filter(j => !j.goalAchieved);
        if (incompleteJourneys.length > state.userJourneys.length * 0.7) {
          insights.push({
            id: crypto.randomUUID(),
            type: 'opportunity',
            title: 'Vysoká miera prerušenia',
            description: 'Viac ako 70% používateľov nedokončuje svoju cestu',
            impact: 'high',
            confidence: 0.85,
            data: { dropoffRate: incompleteJourneys.length / state.userJourneys.length },
            recommendations: [
              'Zjednodušiť proces onboardingu',
              'Pridať viac motivačných prvkov',
              'Skrátiť formuláre'
            ],
            createdAt: new Date(),
          });
        }

        // Feature adoption analysis
        const lowAdoptionFeatures = state.featureUsage.filter(f => f.adoptionRate < 20);
        if (lowAdoptionFeatures.length > 0) {
          insights.push({
            id: crypto.randomUUID(),
            type: 'opportunity',
            title: 'Nízka adopcia funkcií',
            description: `${lowAdoptionFeatures.length} funkcií má adopciu nižšiu ako 20%`,
            impact: 'medium',
            confidence: 0.75,
            data: { lowAdoptionFeatures: lowAdoptionFeatures.map(f => f.feature) },
            recommendations: [
              'Zlepšiť objaviteľnosť funkcií',
              'Pridať tutoriály',
              'Personalizovať odporúčania'
            ],
            createdAt: new Date(),
          });
        }

        set((draft) => {
          draft.behaviorInsights.push(...insights);
        });
      },

      addInsight: (insightData) => {
        const insight: BehaviorInsight = {
          ...insightData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
        };

        set((draft) => {
          draft.behaviorInsights.push(insight);
        });
      },

      dismissInsight: (insightId) => {
        set((draft) => {
          draft.behaviorInsights = draft.behaviorInsights.filter(i => i.id !== insightId);
        });
      },

      // A/B Testing
      createABTest: (testData) => {
        const test: ABTest = {
          ...testData,
          id: crypto.randomUUID(),
        };

        set((draft) => {
          draft.abTests.push(test);
        });
      },

      startABTest: (testId) => {
        set((draft) => {
          const test = draft.abTests.find(t => t.id === testId);
          if (test) {
            test.status = 'running';
            test.startDate = new Date();
          }
        });
      },

      stopABTest: (testId) => {
        set((draft) => {
          const test = draft.abTests.find(t => t.id === testId);
          if (test) {
            test.status = 'completed';
            test.endDate = new Date();
          }
        });
      },

      getVariant: (testId) => {
        const state = get();
        const test = state.abTests.find(t => t.id === testId && t.status === 'running');
        if (!test) return null;

        const userId = state.generateAnonymizedUserId();
        if (state.userVariants[testId]) {
          return state.userVariants[testId];
        }

        // Simple hash-based assignment
        const hash = userId.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0);

        const randomValue = Math.abs(hash) % 100;
        let cumulativeTraffic = 0;

        for (const variant of test.variants) {
          cumulativeTraffic += variant.traffic;
          if (randomValue < cumulativeTraffic) {
            set((draft) => {
              draft.userVariants[testId] = variant.id;
            });
            return variant.id;
          }
        }

        return test.variants[0]?.id || null;
      },

      recordConversion: (testId, variant) => {
        get().trackEvent({
          type: 'milestone_achieved',
          category: 'ab_test',
          action: 'conversion',
          label: testId,
          metadata: { testId, variant },
          privacyLevel: 'anonymous',
        });
      },

      // Privacy & GDPR
      updatePrivacySettings: (settings) => {
        set((draft) => {
          Object.assign(draft.privacySettings, settings);
        });
      },

      optOut: () => {
        set((draft) => {
          draft.isOptedOut = true;
          draft.privacySettings.enableTracking = false;
        });
      },

      optIn: () => {
        set((draft) => {
          draft.isOptedOut = false;
          draft.privacySettings.enableTracking = true;
        });
      },

      exportUserData: async () => {
        const state = get();
        const userData = {
          events: state.events,
          sessions: state.sessions,
          featureUsage: state.featureUsage,
          userJourneys: state.userJourneys,
          privacySettings: state.privacySettings,
          exportedAt: new Date(),
        };

        return userData;
      },

      deleteUserData: () => {
        set((draft) => {
          draft.events = [];
          draft.sessions = [];
          draft.currentSession = null;
          draft.featureUsage = [];
          draft.userJourneys = [];
          draft.behaviorInsights = [];
          draft.userVariants = {};
          draft.pendingEvents = [];
        });
      },

      anonymizeUserData: () => {
        set((draft) => {
          draft.events.forEach(event => {
            event.userId = undefined;
            event.anonymizedUserId = crypto.randomUUID();
            event.privacyLevel = 'anonymous';
          });

          draft.sessions.forEach(session => {
            session.anonymizedUserId = crypto.randomUUID();
          });

          draft.userJourneys.forEach(journey => {
            journey.anonymizedUserId = crypto.randomUUID();
          });
        });
      },

      // Real-time Metrics
      updateRealTimeMetrics: () => {
        const state = get();
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

        const recentEvents = state.events.filter(e =>
          new Date(e.timestamp) > oneHourAgo
        );

        const activeSessions = state.sessions.filter(s =>
          !s.endTime || new Date(s.endTime) > oneHourAgo
        );

        const pageViews = recentEvents.filter(e => e.type === 'page_view');
        const conversions = recentEvents.filter(e => e.type === 'milestone_achieved');

        const topPages = pageViews.reduce((acc, event) => {
          const page = event.metadata.page || event.label || 'unknown';
          acc[page] = (acc[page] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const topFeatures = recentEvents
          .filter(e => e.type === 'feature_used')
          .reduce((acc, event) => {
            const feature = event.label || 'unknown';
            acc[feature] = (acc[feature] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

        set((draft) => {
          draft.realTimeMetrics = {
            activeUsers: new Set(activeSessions.map(s => s.anonymizedUserId)).size,
            pageViews: pageViews.length,
            conversions: conversions.length,
            avgSessionDuration: activeSessions.length > 0
              ? activeSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / activeSessions.length
              : 0,
            bounceRate: activeSessions.length > 0
              ? (activeSessions.filter(s => s.pageViews <= 1).length / activeSessions.length) * 100
              : 0,
            topPages: Object.entries(topPages)
              .map(([page, views]) => ({ page, views }))
              .sort((a, b) => b.views - a.views)
              .slice(0, 10),
            topFeatures: Object.entries(topFeatures)
              .map(([feature, usage]) => ({ feature, usage }))
              .sort((a, b) => b.usage - a.usage)
              .slice(0, 10),
          };
        });
      },

      getActiveUsers: () => {
        return get().realTimeMetrics.activeUsers;
      },

      getConversionRate: (timeframe = '24h') => {
        const state = get();
        const timeframes = {
          '1h': 60 * 60 * 1000,
          '24h': 24 * 60 * 60 * 1000,
          '7d': 7 * 24 * 60 * 60 * 1000,
          '30d': 30 * 24 * 60 * 60 * 1000,
        };

        const cutoff = new Date(Date.now() - timeframes[timeframe]);
        const recentEvents = state.events.filter(e => new Date(e.timestamp) > cutoff);

        const conversions = recentEvents.filter(e => e.type === 'milestone_achieved').length;
        const sessions = recentEvents.filter(e => e.type === 'page_view').length;

        return sessions > 0 ? (conversions / sessions) * 100 : 0;
      },

      getBounceRate: (timeframe = '24h') => {
        const state = get();
        const timeframes = {
          '1h': 60 * 60 * 1000,
          '24h': 24 * 60 * 60 * 1000,
          '7d': 7 * 24 * 60 * 60 * 1000,
          '30d': 30 * 24 * 60 * 60 * 1000,
        };

        const cutoff = new Date(Date.now() - timeframes[timeframe]);
        const recentSessions = state.sessions.filter(s => new Date(s.startTime) > cutoff);

        const bouncedSessions = recentSessions.filter(s => s.pageViews <= 1).length;

        return recentSessions.length > 0 ? (bouncedSessions / recentSessions.length) * 100 : 0;
      },

      // Data Management
      syncWithServer: async () => {
        const state = get();
        if (state.pendingEvents.length === 0) return;

        set((draft) => {
          draft.isLoading = true;
        });

        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));

          set((draft) => {
            draft.pendingEvents = [];
            draft.lastSyncAt = new Date();
            draft.isLoading = false;
          });
        } catch (error) {
          set((draft) => {
            draft.isLoading = false;
          });
          throw error;
        }
      },

      clearOldData: (olderThanDays) => {
        const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);

        set((draft) => {
          draft.events = draft.events.filter(e => new Date(e.timestamp) > cutoff);
          draft.sessions = draft.sessions.filter(s => new Date(s.startTime) > cutoff);
          draft.userJourneys = draft.userJourneys.filter(j =>
            j.steps.some(step => new Date(step.timestamp) > cutoff)
          );
          draft.behaviorInsights = draft.behaviorInsights.filter(i =>
            new Date(i.createdAt) > cutoff
          );
        });
      },

      exportAnalytics: async (format) => {
        const state = get();
        const data = {
          events: state.events,
          sessions: state.sessions,
          featureUsage: state.featureUsage,
          userJourneys: state.userJourneys,
          behaviorInsights: state.behaviorInsights,
          realTimeMetrics: state.realTimeMetrics,
          exportedAt: new Date(),
        };

        if (format === 'json') {
          return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        } else {
          // Convert to CSV format
          const csv = [
            'timestamp,type,category,action,label,value,userId',
            ...state.events.map(e =>
              `${e.timestamp},${e.type},${e.category},${e.action},${e.label || ''},${e.value || ''},${e.anonymizedUserId}`
            )
          ].join('\n');

          return new Blob([csv], { type: 'text/csv' });
        }
      },

      importAnalytics: (data) => {
        set((draft) => {
          if (data.events) draft.events.push(...data.events);
          if (data.sessions) draft.sessions.push(...data.sessions);
          if (data.featureUsage) draft.featureUsage.push(...data.featureUsage);
          if (data.userJourneys) draft.userJourneys.push(...data.userJourneys);
          if (data.behaviorInsights) draft.behaviorInsights.push(...data.behaviorInsights);
        });
      },

      // Utilities
      generateAnonymizedUserId: () => {
        return `anon_${crypto.randomUUID().replace(/-/g, '').substring(0, 16)}`;
      },

      generateSessionId: () => {
        return `sess_${crypto.randomUUID().replace(/-/g, '').substring(0, 16)}`;
      },

      isTrackingEnabled: () => {
        const state = get();
        return !state.isOptedOut && state.privacySettings.enableTracking;
      },

      shouldTrackEvent: (event) => {
        const state = get();
        const settings = state.privacySettings;

        // Check privacy level
        if (settings.anonymizationLevel === 'full' && event.privacyLevel !== 'anonymous') {
          return false;
        }

        if (settings.anonymizationLevel === 'minimal' && event.privacyLevel === 'identifiable') {
          return false;
        }

        // Check consent
        if (event.category === 'marketing' && !settings.marketingConsent) {
          return false;
        }

        return true;
      },
    })),
    {
      name: 'analytics-store',
      partialize: (state) => ({
        events: state.events.slice(-1000), // Keep only last 1000 events
        sessions: state.sessions.slice(-100), // Keep only last 100 sessions
        featureUsage: state.featureUsage,
        userJourneys: state.userJourneys.slice(-50), // Keep only last 50 journeys
        behaviorInsights: state.behaviorInsights.slice(-20), // Keep only last 20 insights
        abTests: state.abTests,
        userVariants: state.userVariants,
        privacySettings: state.privacySettings,
        isOptedOut: state.isOptedOut,
      }),
    }
  )
);