
/**
 * Quick Insights Engine Types
 * Interfaces for document analysis and value extraction
 */

export interface QuickInsight {
  actionable: boolean;
  actionText?: string;
  actionUrl?: string;
  createdAt: string;
  description: string;
  documentId?: string;
  familyImpact?: {
    affectedMembers: string[];
    emotionalBenefit: string;
    riskReduction: number; // percentage
  };
  id: string;
  impact: 'high' | 'low' | 'medium';
  metadata: {
    calculatedAt: string;
    category: string;
    confidence: number; // 0-1
    expiresAt?: string;
    tags: string[];
  };
  priority: 'important' | 'nice_to_have' | 'urgent';
  title: string;
  type:
    | 'completion_gap'
    | 'document_analysis'
    | 'family_impact'
    | 'protection_level'
    | 'time_saved'
    | 'urgent_action';
  updatedAt: string;
  userId: string;
  value?: string; // e.g., "2.5 hours saved", "85% protection level"
}

export interface InsightCalculation {
  familyImpact: {
    benefits: string[];
    members: number;
    scenarios: string[];
  };
  protectionLevel: {
    gaps: string[];
    percentage: number;
    strengths: string[];
  };
  timeSaved: {
    comparison: string;
    hours: number;
    tasks: string[];
  };
  urgencyScore: {
    factors: string[];
    score: number; // 0-100
    timeline: string;
  };
}

export interface DocumentAnalysis {
  documentId: string;
  documentType: string;
  extractedValue: {
    completenessPercentage: number;
    keyInfo: string[];
    missingInfo: string[];
    qualityScore: number;
  };
  insights: {
    immediate: QuickInsight[];
    potential: QuickInsight[];
  };
  recommendations: {
    action: string;
    impact: string;
    priority: 'high' | 'low' | 'medium';
    reason: string;
  }[];
}

export interface FamilyImpactStatement {
  affectedMembers: {
    impact: string;
    memberId: string;
    name: string;
    riskLevel: 'high' | 'low' | 'medium';
  }[];
  emotionalBenefits: string[];
  estimatedTimeSaved: number;
  generatedAt: string;
  impactDescription: string;
  overallProtectionLevel: number;
  protectionGaps: {
    area: string;
    recommendation: string;
    risk: string;
    urgency: 'future' | 'immediate' | 'near_term';
  }[];
  scenario: string;
  userId: string;
}

export interface InsightFilters {
  actionable?: boolean;
  documentIds?: string[];
  impact?: QuickInsight['impact'][];
  priority?: QuickInsight['priority'][];
  timeRange?: {
    end: string;
    start: string;
  };
  types?: QuickInsight['type'][];
}

export interface InsightAnalytics {
  actionableInsights: number;
  averageProtectionLevel: number;
  completedActions: number;
  topCategories: {
    averageImpact: string;
    category: string;
    count: number;
  }[];
  totalInsights: number;
  totalTimeSaved: number;
  trendData: {
    actionsCompleted: number;
    date: string;
    insightsGenerated: number;
    protectionLevel: number;
  }[];
}
