export interface UserEvent {
  id: string;
  timestamp: string;
  sessionId: string;
  anonymizedUserId: string;
  type: 'feature_used' | 'page_view' | 'error' | 'conversion' | 'engagement';
  category: string;
  action: string;
  label: string;
  privacyLevel: 'anonymous' | 'pseudonymous' | 'identified';
  metadata: Record<string, any>;
}

export interface AnalyticsState {
  userEvents: UserEvent[];
  usageMetrics: UsageMetrics;
  isTracking: boolean;
}

export interface AnalyticsActions {
  startTracking: () => void;
  stopTracking: () => void;
  trackEvent: (event: Omit<UserEvent, 'id' | 'timestamp' | 'sessionId' | 'anonymizedUserId'>) => void;
  analyzeUserBehavior: (timeRange: TimeRange) => Promise<BehaviorAnalysis>;
  getPrivacyReport: () => PrivacyReport;
}

export interface UsageMetrics {
  totalEvents: number;
  dailyActiveUsers: number;
  averageSessionDuration: number;
  featureUsage: Record<string, number>;
  errorRate: number;
  conversionRate: number;
}

export interface BehaviorAnalysis {
  patterns: UserPattern[];
  insights: Insight[];
  recommendations: Recommendation[];
}

export interface UserPattern {
  id: string;
  type: 'navigation' | 'feature_usage' | 'time_spent' | 'conversion_funnel';
  description: string;
  frequency: number;
  impact: 'high' | 'medium' | 'low';
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
}

export interface Recommendation {
  id: string;
  type: 'ui_improvement' | 'feature_enhancement' | 'performance' | 'user_experience';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: number;
}

export interface PrivacySettings {
  analyticsEnabled: boolean;
  dataRetentionDays: number;
  shareWithThirdParties: boolean;
  anonymizeData: boolean;
  collectSensitiveData: boolean;
}

export interface PrivacyReport {
  dataCollected: string[];
  retentionPeriod: number;
  thirdPartySharing: boolean;
  userRights: string[];
  contactInfo: string;
}

export type TimeRange = '1h' | '24h' | '7d' | '30d' | '90d';

export interface UserJourney {
  id: string;
  userId: string;
  startTime: string;
  endTime: string;
  steps: JourneyStep[];
  outcome: 'completed' | 'abandoned' | 'converted';
  goal: string;
}

export interface JourneyStep {
  id: string;
  timestamp: string;
  action: string;
  page: string;
  duration: number;
  metadata: Record<string, any>;
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  traffic: number;
  config: Record<string, any>;
  status: 'draft' | 'running' | 'paused' | 'completed';
  results?: ABTestResults;
}

export interface ABTestResults {
  conversionRate: number;
  confidence: number;
  winner: string | null;
  statistics: Record<string, number>;
}