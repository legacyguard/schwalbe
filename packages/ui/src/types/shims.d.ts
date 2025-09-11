declare module '@schwalbe/shared/types/animations' {
  export type PersonalityMode = 'calm' | 'energetic' | 'focused' | string;
  export type Easing = any;
  export interface LoadingAnimationProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    [key: string]: any;
  }
  export interface EnhancedFireflyProps {
    size?: 'small' | 'medium' | 'large';
    [key: string]: any;
  }
  export interface FireflyConfig { [key: string]: any }
  export interface AnimationConfig { [key: string]: any }
}

declare module '@schwalbe/shared/types/milestones' {
  export interface EnhancedMilestone { icon?: string; [key: string]: any }
}

declare module '@schwalbe/logic' {
  export type FamilyInvitation = any;
  export type FamilyRole = any;
  export const RELATIONSHIP_LABELS: any;
  export type RelationshipType = any;
  export const FAMILY_PLANS: any;
  export type FamilyPlan = any;

  export type SofiaMessage = any;
  export type SofiaContext = any;
  export const sofiaAI: any;
  export function createSofiaMessage(...args: any[]): any;
  export const analyzeUserInput: any;
  export class TextManager {}
  export class AdaptivePersonalityManager {}
}

declare module 'react-i18next' {
  export function useTranslation(ns?: any): any;
}

declare module 'react-markdown' {
  const ReactMarkdown: any;
  export default ReactMarkdown;
}
