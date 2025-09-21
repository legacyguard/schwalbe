/**
 * Shared types for sophisticated focus handling systems
 * 
 * This file contains the core interfaces used by both the focus handling component
 * and the analytics system to avoid circular dependencies.
 */

export interface FocusInteractionContext {
  id: string;
  type: 'modal' | 'dropdown' | 'menu' | 'form' | 'navigation' | 'content' | 'widget' | 'overlay' | 'sidebar' | 'dialog';
  complexity: 'simple' | 'moderate' | 'complex' | 'expert';
  interactionPattern: 'sequential' | 'hierarchical' | 'networked' | 'dynamic' | 'adaptive';
  userIntent: 'navigation' | 'selection' | 'input' | 'confirmation' | 'exploration' | 'transaction';
  priority: 'low' | 'medium' | 'high' | 'critical';
  userExpertise: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  emotionalState: 'calm' | 'focused' | 'overwhelmed' | 'confused' | 'confident' | 'anxious';
  previousInteractions?: number;
  focusDuration?: number;
  userFrustration?: number; // 0-1 scale
}

export interface FocusStrategy {
  id: string;
  context: FocusInteractionContext;
  strategyType: 'auto' | 'manual' | 'guided' | 'predictive' | 'adaptive' | 'contextual';
  focusOrder: 'logical' | 'priority' | 'usage' | 'custom' | 'emotional';
  restorationMethod: 'immediate' | 'delayed' | 'contextual' | 'hierarchical' | 'memory';
  trappingLevel: 'none' | 'soft' | 'strict' | 'intelligent' | 'contextual';
  guidanceLevel: 'none' | 'minimal' | 'contextual' | 'comprehensive' | 'sofiaintegrated';
  performanceMode: 'standard' | 'optimized' | 'aggressive' | 'adaptive';
  accessibilityLevel: 'basic' | 'enhanced' | 'comprehensive' | 'expert';
  emotionalSupport: boolean;
  userControl: boolean;
  analyticsEnabled: boolean;
}

export interface FocusMemory {
  id: string;
  contextId: string;
  focusPath: string[];
  lastFocusedElement: string;
  focusDuration: number;
  userPreferences: Record<string, any>;
  interactionPatterns: Record<string, any>;
  emotionalContext: string;
  timestamp: number;
  success: boolean;
  frustration: number;
}
