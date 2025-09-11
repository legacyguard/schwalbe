// Animation Types for Schwalbe
// Type definitions for firefly animations, personality modes, and interaction patterns

import type { ReactNode } from 'react';

// Personality and Communication Types
export type PersonalityMode = 'adaptive' | 'empathetic' | 'pragmatic';
export type CommunicationStyle = 'balanced' | 'empathetic' | 'pragmatic';

// Firefly Event Types
export type FireflyEventType =
  | 'achievement_unlocked'
  | 'challenge_started'
  | 'document_upload'
  | 'emergency_activated'
  | 'guardian_added'
  | 'milestone'
  | 'time_capsule_created'
  | 'will_completed'
  | null;

// Firefly State Management
export interface FireflyState {
  celebrateEvent?: FireflyEventType;
  interactionCount: number;
  isVisible: boolean;
  mode?: CommunicationStyle;
  targetElement?: string;
}

export interface FireflyContextValue {
  celebrate: (event: FireflyEventType, duration?: number) => void;
  guideToElement: (selector: string, duration?: number) => void;
  hideFirefly: () => void;
  isCelebrating: boolean;
  isGuidingToTarget: boolean;
  onInteraction: () => void;
  setMode: (mode: CommunicationStyle) => void;
  showFirefly: () => void;
  state: FireflyState;
}

export interface FireflyProviderProps {
  autoShow?: boolean;
  children: ReactNode;
  initialMode?: CommunicationStyle;
}

// Firefly Animation Props
export interface FireflyPosition {
  x: number;
  y: number;
}

export interface TrailPoint extends FireflyPosition {
  id: string;
  timestamp: number;
}

export interface EnhancedFireflyProps {
  celebrateEvent?: FireflyEventType;
  customMessage?: string;
  followMouse?: boolean;
  isVisible?: boolean;
  onInteraction?: () => void;
  size?: 'large' | 'medium' | 'small';
  targetElement?: string;
}

export interface SofiaFireflyProps {
  celebrateEvent?: 'document_upload' | 'guardian_added' | 'milestone' | null;
  isVisible?: boolean;
  mode?: CommunicationStyle;
  onInteraction?: () => void;
  targetElement?: string; // CSS selector for element to guide to
}

// Animation Configuration Types
export interface AnimationConfig {
  delay: number;
  duration: number;
  ease: any; // Easing from framer-motion
  stagger?: number;
}

export interface AdaptiveAnimationConfig {
  balanced: AnimationConfig;
  empathetic: AnimationConfig;
  pragmatic: AnimationConfig;
}

// Loading Animation Types
export type LoadingAnimationType =
  | 'bounce'
  | 'dots'
  | 'firefly'
  | 'heartbeat'
  | 'progress'
  | 'pulse'
  | 'skeleton'
  | 'spinner'
  | 'typewriter'
  | 'wave';

export interface LoadingAnimationProps {
  className?: string;
  color?: string;
  duration?: number;
  personalityAdapt?: boolean;
  size?: 'lg' | 'md' | 'sm' | 'xl';
  text?: string;
  type?: LoadingAnimationType;
}

// Interactive Animation Types
export interface InteractionPattern {
  action: string;
  context: string;
  duration: number;
  responseTime: number;
  timestamp: Date;
}

export interface PersonalityAnalysis {
  analysisFactors: {
    actionTypes: string[]; // Direct actions vs exploratory actions
    helpSeekingBehavior: boolean; // Frequent help suggests empathetic preference
    responseSpeed: number; // Fast responses suggest pragmatic preference
    sessionDuration: number; // Long sessions suggest empathetic preference
  };
  confidence: number; // 0-100
  detectedStyle: CommunicationStyle;
  lastAnalyzed: Date;
}

// Milestone Animation Types
export interface MilestoneData {
  category: 'completion' | 'document' | 'family' | 'guardian' | 'security';
  description: string;
  icon: 'award' | 'crown' | 'gift' | 'heart' | 'shield' | 'star' | 'trophy';
  id: string;
  significance: 'major' | 'minor' | 'ultimate';
  title: string;
}

export interface MilestoneCelebrationProps {
  autoHide?: boolean;
  duration?: number;
  isVisible: boolean;
  milestone: MilestoneData;
  onComplete?: () => void;
}

// Animation Component Props
export interface AnimationComponentProps {
  children?: ReactNode;
  className?: string;
  personalityMode?: PersonalityMode;
  shouldReduceMotion?: boolean;
}

// Micro Animation Types
export type MicroAnimationType =
  | 'bounce'
  | 'glow'
  | 'lift'
  | 'pulse'
  | 'ripple'
  | 'shake'
  | 'tilt'
  | 'wobble';

export interface MicroAnimationProps {
  children: ReactNode;
  className?: string;
  color?: string;
  delay?: number;
  disabled?: boolean;
  duration?: number;
  intensity?: 'high' | 'low' | 'medium';
  isActive?: boolean;
  trigger?: 'click' | 'hover' | 'always';
  type?: MicroAnimationType;
}

// Event Detail Types
export interface MilestoneEventDetail {
  milestone: {
    id: string;
    title: string;
    description: string;
  };
  userId?: string;
}

export interface DocumentEventDetail {
  documentId?: string;
  userId?: string;
}

export interface GuardianEventDetail {
  guardianId?: string;
  userId?: string;
}

// Animation Performance Types
export interface AnimationPerformanceConfig {
  duration: number;
  stagger: number;
}

// Mouse Tracking Types
export interface MouseTrackingConfig {
  enabled: boolean;
  followDelay: number;
  sensitivity: number;
  smoothing: number;
}

// Physics Animation Types
export interface PhysicsConfig {
  damping: number;
  mass: number;
  stiffness: number;
}

export interface ParticleConfig {
  count: number;
  lifetime: number;
  size: number;
  speed: number;
}