/**
 * Shared types for high contrast adaptations and analytics
 * 
 * This file contains all shared interfaces and types used by both
 * HighContrastAdaptations and HighContrastAnalytics to avoid circular dependencies.
 */

// TypeScript interfaces for comprehensive type safety
export interface ContrastContext {
  id: string;
  type: 'text' | 'background' | 'border' | 'interactive' | 'decorative' | 'emphasis' | 'navigation' | 'content';
  priority: 'low' | 'medium' | 'high' | 'critical';
  userIntent: 'readability' | 'navigation' | 'interaction' | 'aesthetics' | 'accessibility' | 'comfort';
  contentComplexity: 'simple' | 'moderate' | 'complex' | 'dense';
  visualHierarchy: 'primary' | 'secondary' | 'tertiary' | 'background';
  userExpertise: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  emotionalState: 'calm' | 'focused' | 'overwhelmed' | 'tired' | 'confident' | 'anxious';
  previousContrast?: number;
  contrastDuration?: number;
  userFrustration?: number; // 0-1 scale
}

export interface ContrastAdaptation {
  id: string;
  context: ContrastContext;
  contrastRatio: number;
  colorScheme: 'light' | 'dark' | 'high-contrast' | 'inverted' | 'selective';
  enhancementType: 'global' | 'selective' | 'adaptive' | 'contextual' | 'emotional';
  visualStyle: 'elegant' | 'bold' | 'subtle' | 'dramatic' | 'minimal' | 'premium';
  borderEnhancement: 'none' | 'subtle' | 'prominent' | 'glow' | 'double' | 'animated';
  textEnhancement: 'none' | 'underline' | 'background' | 'border' | 'shadow' | 'halo';
  backgroundEnhancement: 'none' | 'pattern' | 'gradient' | 'texture' | 'subtle-color';
  animation: 'none' | 'fade' | 'glow' | 'pulse' | 'morph' | 'flow';
  duration: number;
  easing: string;
  accessibilityLabel: string;
  screenReaderMessage: string;
  reducedMotionAlternative: 'static' | 'minimal' | 'none';
}

export interface HighContrastEvent {
  id: string;
  timestamp: number;
  type: 'contrast_change' | 'adaptation_applied' | 'user_preference' | 'accessibility_guidance' | 'contrast_effectiveness' | 'emotional_correlation' | 'performance_impact' | 'compliance_check';
  context: ContrastContext;
  adaptation?: ContrastAdaptation;
  userId: string;
  sessionId: string;
  deviceInfo: {
    displayType: string;
    colorGamut: string;
    contrastSupport: string;
    accessibilityFeatures: string[];
    screenReaderActive: boolean;
    highContrastMode: boolean;
  };
  contrast: {
    originalRatio: number;
    adaptedRatio: number;
    enhancementType: string;
    visualStyle: string;
    adaptationTime: number;
  };
  accessibility: {
    wcagCompliance: 'A' | 'AA' | 'AAA' | 'none';
    contrastRatio: number;
    colorAccessibility: number;
    visualHierarchy: number;
    readabilityScore: number;
  };
  userExperience: {
    preferenceMatch: number;
    visualComfort: number;
    taskEfficiency: number;
    frustration: number;
    confidence: number;
    emotionalState: string;
  };
  performance: {
    adaptationTime: number;
    renderTime: number;
    memoryUsage: number;
    batteryImpact: number;
  };
  metadata?: Record<string, any>;
}

export interface HighContrastMetrics {
  totalAdaptations: number;
  averageContrastRatio: number;
  wcagComplianceRate: number;
  userPreferenceMatch: number;
  adaptationEffectiveness: number;
  visualComfortScore: number;
  taskEfficiencyGain: number;
  emotionalCorrelation: Record<string, number>;
  contextSpecificPerformance: Record<string, number>;
  enhancementTypeEffectiveness: Record<string, number>;
  improvementRecommendations: Array<{
    area: string;
    currentScore: number;
    potentialImprovement: number;
    priority: 'low' | 'medium' | 'high';
    action: string;
  }>;
}

export interface ContrastPatternAnalysis {
  userBehaviorPatterns: Record<string, {
    preferredContrastRatios: number[];
    enhancementPreferences: string[];
    contextSensitivity: number;
    emotionalAdaptation: Record<string, number>;
  }>;
  contextEffectiveness: Record<string, {
    optimalContrastRatios: number[];
    mostEffectiveEnhancements: string[];
    averageAdaptationTime: number;
    commonAccessibilityIssues: string[];
  }>;
  deviceCompatibility: Record<string, {
    contrastSupportScore: number;
    adaptationEffectiveness: number;
    commonProblems: string[];
    recommendedSolutions: string[];
  }>;
  accessibilityGaps: Array<{
    context: string;
    gap: string;
    impact: 'low' | 'medium' | 'high';
    affectedUsers: number;
    solution: string;
  }>;
}
