import React from 'react';

interface PersonalityAwareAnimationProps {
  children: React.ReactNode;
  personality: any;
  context?: string;
  className?: string;
  disabled?: boolean;
}

interface ContextAwareAnimationProps {
  children: React.ReactNode;
  personality: any;
  context?: string;
  className?: string;
  disabled?: boolean;
}

interface EmotionalAnimationProps {
  children: React.ReactNode;
  personality: any;
  emotion?: string;
  trigger?: string;
  className?: string;
  disabled?: boolean;
}

interface PersonalityHoverEffectProps {
  children: React.ReactNode;
  personality: any;
  className?: string;
  disabled?: boolean;
}

export function PersonalityAwareAnimation({ children, className = '' }: PersonalityAwareAnimationProps) {
  return <div className={className}>{children}</div>;
}

export function ContextAwareAnimation({ children, className = '' }: ContextAwareAnimationProps) {
  return <div className={className}>{children}</div>;
}

export function EmotionalAnimation({ children, className = '' }: EmotionalAnimationProps) {
  return <div className={className}>{children}</div>;
}

export function PersonalityHoverEffect({ children, className = '' }: PersonalityHoverEffectProps) {
  return <div className={className}>{children}</div>;
}

export const PersonalityAnimationUtils = {
  getPersonalityConfig: (personality: any) => ({}),
  getEmotionalConfig: (emotion: string) => ({}),
  blendPersonalityEmotion: (personality: any, emotion: string) => ({}),
  shouldUseGentleAnimations: (personality: any) => false,
  shouldUseEnergeticAnimations: (personality: any) => false,
};
