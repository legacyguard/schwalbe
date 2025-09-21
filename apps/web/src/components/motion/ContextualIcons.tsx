import React, { useEffect, useRef, useState, useCallback, useContext } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

// Context types for different scenarios
export interface UserContext {
  emotionalState?: 'calm' | 'anxious' | 'excited' | 'frustrated' | 'confident' | 'overwhelmed';
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  preference?: 'simple' | 'detailed' | 'visual' | 'textual';
  accessibility?: 'standard' | 'reduced-motion' | 'high-contrast' | 'screen-reader';
}

export interface IconContentContext {
  type?: 'document' | 'will' | 'guardian' | 'family' | 'security' | 'legacy' | 'emergency' | 'professional' | 'personal' | 'financial' | 'medical' | 'digital';
  status?: 'draft' | 'review' | 'complete' | 'pending' | 'approved' | 'rejected' | 'archived' | 'active' | 'inactive';
  importance?: 'low' | 'medium' | 'high' | 'critical';
  complexity?: 'simple' | 'moderate' | 'complex' | 'advanced';
  sensitivity?: 'public' | 'private' | 'confidential' | 'restricted';
}

export interface InteractionContext {
  action?: 'create' | 'edit' | 'delete' | 'share' | 'view' | 'download' | 'upload' | 'sign' | 'approve' | 'reject';
  stage?: 'initial' | 'in-progress' | 'review' | 'completion' | 'follow-up';
  feedback?: 'positive' | 'neutral' | 'negative' | 'celebration' | 'encouragement' | 'guidance';
  timing?: 'immediate' | 'delayed' | 'scheduled' | 'reminder';
}

export interface ContextualIconsProps {
  children?: React.ReactNode;
  baseIcon?: 'document' | 'will' | 'guardian' | 'family' | 'security' | 'legacy' | 'emergency' | 'user' | 'heart' | 'shield' | 'lock' | 'key' | 'check' | 'cross' | 'arrow' | 'star' | 'loading' | 'search' | 'menu' | 'plus' | 'edit' | 'trash' | 'share' | 'download' | 'upload' | 'eye' | 'settings' | 'notification' | 'calendar' | 'clock' | 'warning' | 'info' | 'success' | 'error';
  userContext?: UserContext;
  contentContext?: IconContentContext;
  interactionContext?: InteractionContext;
  animation?: 'subtle' | 'moderate' | 'expressive' | 'dramatic' | 'liquid' | 'elastic' | 'magnetic' | 'breathing';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  theme?: 'light' | 'dark' | 'auto' | 'colorful' | 'monochrome' | 'pastel' | 'vibrant';
  variant?: 'filled' | 'outlined' | 'minimal' | 'detailed' | 'gradient' | 'glass' | 'neon';
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  onContextChange?: (context: { user: UserContext; content: IconContentContext; interaction: InteractionContext }) => void;
  onIconChange?: (icon: string, reason: string) => void;
  onAnimationTrigger?: (animation: string, context: string) => void;
}

interface IconVariant {
  name: string;
  paths: string[];
  viewBox: string;
  animations: string[];
  colors: Record<string, string>;
  contextualVariants: Record<string, {
    paths?: string[];
    colors?: Record<string, string>;
    animations?: string[];
  }>;
}

interface ContextMapping {
  user: Record<string, any>;
  content: Record<string, any>;
  interaction: Record<string, any>;
}

const ContextualIcons: React.FC<ContextualIconsProps> = ({
  children,
  baseIcon = 'document',
  userContext = {},
  contentContext = {},
  interactionContext = {},
  animation = 'moderate',
  size = 'md',
  theme = 'auto',
  variant = 'outlined',
  className = '',
  style = {},
  disabled = false,
  onContextChange,
  onIconChange,
  onAnimationTrigger,
}) => {
  const [currentIcon, setCurrentIcon] = useState(baseIcon);
  const [currentVariant, setCurrentVariant] = useState(variant);
  const [isAnimating, setIsAnimating] = useState(false);
  const [contextualEffects, setContextualEffects] = useState<string[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Comprehensive icon variant configurations with contextual adaptations
  const iconVariants: Record<string, IconVariant> = {
    document: {
      name: 'Document',
      paths: ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6', 'M16 13H8', 'M16 17H8', 'M10 9H8'],
      viewBox: '0 0 24 24',
      animations: ['subtle', 'draw', 'reveal', 'liquid'],
      colors: {
        default: '#6b7280',
        active: '#3b82f6',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        confidential: '#dc2626',
        draft: '#6b7280',
        complete: '#10b981',
      },
      contextualVariants: {
        'content.type.will': {
          paths: ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6', 'M9 12l2 2 4-4', 'M8 16h8'],
          colors: { default: '#8b5cf6', active: '#a855f7' },
        },
        'content.status.draft': {
          colors: { default: '#6b7280', active: '#9ca3af' },
          animations: ['breathing', 'subtle'],
        },
        'content.status.complete': {
          colors: { default: '#10b981', active: '#059669' },
          animations: ['success', 'celebration'],
        },
        'user.emotionalState.anxious': {
          colors: { default: '#f59e0b', active: '#d97706' },
          animations: ['breathing', 'subtle'],
        },
        'interaction.action.sign': {
          colors: { default: '#3b82f6', active: '#2563eb' },
          animations: ['success', 'liquid'],
        },
      },
    },
    will: {
      name: 'Will',
      paths: ['M9 12l2 2 4-4', 'M21 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z', 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6'],
      viewBox: '0 0 24 24',
      animations: ['elegant', 'reveal', 'liquid', 'magnetic'],
      colors: {
        default: '#8b5cf6',
        active: '#a855f7',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        complete: '#059669',
        draft: '#a855f7',
      },
      contextualVariants: {
        'content.status.draft': {
          colors: { default: '#c084fc', active: '#a855f7' },
          animations: ['breathing', 'subtle'],
        },
        'content.status.complete': {
          colors: { default: '#10b981', active: '#059669' },
          animations: ['success', 'celebration'],
        },
        'user.emotionalState.confident': {
          colors: { default: '#059669', active: '#047857' },
          animations: ['elegant', 'magnetic'],
        },
        'interaction.feedback.celebration': {
          animations: ['celebration', 'liquid'],
        },
      },
    },
    guardian: {
      name: 'Guardian',
      paths: ['M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z', 'M18 16l-4-4', 'M6 16l4-4'],
      viewBox: '0 0 24 24',
      animations: ['protective', 'breathing', 'magnetic', 'liquid'],
      colors: {
        default: '#059669',
        active: '#047857',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        family: '#ec4899',
        emergency: '#dc2626',
      },
      contextualVariants: {
        'content.type.family': {
          colors: { default: '#ec4899', active: '#db2777' },
          animations: ['warm', 'breathing'],
        },
        'content.type.emergency': {
          colors: { default: '#dc2626', active: '#b91c1c' },
          animations: ['urgent', 'pulse'],
        },
        'user.emotionalState.anxious': {
          colors: { default: '#f59e0b', active: '#d97706' },
          animations: ['reassuring', 'breathing'],
        },
        'interaction.action.activate': {
          colors: { default: '#10b981', active: '#059669' },
          animations: ['success', 'magnetic'],
        },
      },
    },
    family: {
      name: 'Family',
      paths: ['M17 20c0 1.66-4 3-9 3s-9-1.34-9-3', 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z', 'M20 10V7a2 2 0 0 0-2-2h-2', 'M4 10V7a2 2 0 0 1 2-2h2'],
      viewBox: '0 0 24 24',
      animations: ['warm', 'breathing', 'liquid', 'magnetic'],
      colors: {
        default: '#ec4899',
        active: '#db2777',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        connected: '#8b5cf6',
        protective: '#059669',
      },
      contextualVariants: {
        'content.status.active': {
          colors: { default: '#ec4899', active: '#db2777' },
          animations: ['warm', 'breathing'],
        },
        'user.emotionalState.calm': {
          colors: { default: '#10b981', active: '#059669' },
          animations: ['peaceful', 'subtle'],
        },
        'interaction.feedback.positive': {
          animations: ['celebration', 'liquid'],
        },
      },
    },
    security: {
      name: 'Security',
      paths: ['M12 1l3 3v6l-3 3-3-3V4l3-3z', 'M12 12v9', 'M5 15h14', 'M9 11l6 6', 'M15 11l-6 6'],
      viewBox: '0 0 24 24',
      animations: ['protective', 'pulse', 'magnetic', 'liquid'],
      colors: {
        default: '#374151',
        active: '#1f2937',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        locked: '#6b7280',
        unlocked: '#10b981',
        critical: '#dc2626',
      },
      contextualVariants: {
        'content.sensitivity.confidential': {
          colors: { default: '#dc2626', active: '#b91c1c' },
          animations: ['urgent', 'pulse'],
        },
        'content.sensitivity.restricted': {
          colors: { default: '#7c2d12', active: '#92400e' },
          animations: ['protective', 'magnetic'],
        },
        'interaction.action.lock': {
          colors: { default: '#6b7280', active: '#374151' },
          animations: ['success', 'magnetic'],
        },
        'interaction.action.unlock': {
          colors: { default: '#10b981', active: '#059669' },
          animations: ['success', 'liquid'],
        },
      },
    },
    legacy: {
      name: 'Legacy',
      paths: ['M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', 'M12 7v10', 'M8 11l8 2', 'M16 11l-8 2'],
      viewBox: '0 0 24 24',
      animations: ['elegant', 'liquid', 'magnetic', 'celebration'],
      colors: {
        default: '#fbbf24',
        active: '#f59e0b',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        complete: '#059669',
        eternal: '#8b5cf6',
      },
      contextualVariants: {
        'content.status.complete': {
          colors: { default: '#059669', active: '#047857' },
          animations: ['celebration', 'liquid'],
        },
        'user.emotionalState.confident': {
          colors: { default: '#fbbf24', active: '#f59e0b' },
          animations: ['elegant', 'magnetic'],
        },
        'interaction.feedback.celebration': {
          animations: ['celebration', 'dramatic'],
        },
      },
    },
    emergency: {
      name: 'Emergency',
      paths: ['M12 9v3m0 3h.01', 'M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z', 'M8 12l2 2 4-4'],
      viewBox: '0 0 24 24',
      animations: ['urgent', 'pulse', 'magnetic', 'dramatic'],
      colors: {
        default: '#dc2626',
        active: '#b91c1c',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        activated: '#059669',
        alert: '#dc2626',
      },
      contextualVariants: {
        'content.status.active': {
          colors: { default: '#dc2626', active: '#b91c1c' },
          animations: ['urgent', 'pulse'],
        },
        'interaction.action.activate': {
          colors: { default: '#059669', active: '#047857' },
          animations: ['success', 'dramatic'],
        },
        'user.emotionalState.anxious': {
          colors: { default: '#f59e0b', active: '#d97706' },
          animations: ['reassuring', 'breathing'],
        },
      },
    },
    heart: {
      name: 'Heart',
      paths: ['M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z'],
      viewBox: '0 0 24 24',
      animations: ['warm', 'breathing', 'liquid', 'magnetic'],
      colors: {
        default: '#ef4444',
        active: '#dc2626',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        love: '#ec4899',
        care: '#059669',
      },
      contextualVariants: {
        'content.type.family': {
          colors: { default: '#ec4899', active: '#db2777' },
          animations: ['warm', 'breathing'],
        },
        'user.emotionalState.calm': {
          colors: { default: '#059669', active: '#047857' },
          animations: ['peaceful', 'subtle'],
        },
        'interaction.feedback.positive': {
          animations: ['celebration', 'liquid'],
        },
      },
    },
    shield: {
      name: 'Shield',
      paths: ['M12 1l9 4v6c0 5.55-3.84 10.74-9 12-5.16-1.26-9-6.45-9-12V5l9-4z'],
      viewBox: '0 0 24 24',
      animations: ['protective', 'magnetic', 'liquid', 'breathing'],
      colors: {
        default: '#374151',
        active: '#1f2937',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        protected: '#059669',
        vulnerable: '#f59e0b',
      },
      contextualVariants: {
        'content.sensitivity.confidential': {
          colors: { default: '#059669', active: '#047857' },
          animations: ['protective', 'magnetic'],
        },
        'content.sensitivity.restricted': {
          colors: { default: '#dc2626', active: '#b91c1c' },
          animations: ['urgent', 'pulse'],
        },
        'interaction.action.activate': {
          colors: { default: '#10b981', active: '#059669' },
          animations: ['success', 'magnetic'],
        },
      },
    },
    lock: {
      name: 'Lock',
      paths: ['M18 8h-1V6a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2zM8 8V6a4 4 0 0 1 8 0v2z', 'M12 14v2'],
      viewBox: '0 0 24 24',
      animations: ['protective', 'magnetic', 'liquid', 'subtle'],
      colors: {
        default: '#6b7280',
        active: '#374151',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        locked: '#6b7280',
        unlocked: '#10b981',
      },
      contextualVariants: {
        'interaction.action.lock': {
          colors: { default: '#6b7280', active: '#374151' },
          animations: ['success', 'magnetic'],
        },
        'interaction.action.unlock': {
          colors: { default: '#10b981', active: '#059669' },
          animations: ['success', 'liquid'],
        },
        'content.sensitivity.confidential': {
          colors: { default: '#dc2626', active: '#b91c1c' },
          animations: ['urgent', 'pulse'],
        },
      },
    },
  };

  // Context mapping system
  const contextMapping: ContextMapping = {
    user: {
      emotionalState: {
        calm: { animation: 'peaceful', variant: 'minimal' },
        anxious: { animation: 'reassuring', variant: 'outlined' },
        excited: { animation: 'celebration', variant: 'filled' },
        frustrated: { animation: 'subtle', variant: 'minimal' },
        confident: { animation: 'elegant', variant: 'detailed' },
        overwhelmed: { animation: 'breathing', variant: 'minimal' },
      },
      experienceLevel: {
        beginner: { animation: 'subtle', variant: 'minimal' },
        intermediate: { animation: 'moderate', variant: 'outlined' },
        advanced: { animation: 'expressive', variant: 'detailed' },
        expert: { animation: 'elegant', variant: 'gradient' },
      },
      urgency: {
        low: { animation: 'subtle', variant: 'minimal' },
        medium: { animation: 'moderate', variant: 'outlined' },
        high: { animation: 'expressive', variant: 'filled' },
        critical: { animation: 'dramatic', variant: 'neon' },
      },
      preference: {
        simple: { animation: 'subtle', variant: 'minimal' },
        detailed: { animation: 'moderate', variant: 'detailed' },
        visual: { animation: 'expressive', variant: 'gradient' },
        textual: { animation: 'subtle', variant: 'outlined' },
      },
      accessibility: {
        'reduced-motion': { animation: 'subtle', variant: 'minimal' },
        'high-contrast': { animation: 'moderate', variant: 'outlined' },
        'screen-reader': { animation: 'subtle', variant: 'minimal' },
      },
    },
    content: {
      type: {
        document: { icon: 'document', animation: 'subtle' },
        will: { icon: 'will', animation: 'elegant' },
        guardian: { icon: 'guardian', animation: 'protective' },
        family: { icon: 'family', animation: 'warm' },
        security: { icon: 'security', animation: 'protective' },
        legacy: { icon: 'legacy', animation: 'elegant' },
        emergency: { icon: 'emergency', animation: 'urgent' },
        professional: { icon: 'document', animation: 'professional' },
        personal: { icon: 'heart', animation: 'warm' },
        financial: { icon: 'document', animation: 'professional' },
        medical: { icon: 'heart', animation: 'protective' },
        digital: { icon: 'security', animation: 'protective' },
      },
      status: {
        draft: { animation: 'breathing', variant: 'minimal' },
        review: { animation: 'moderate', variant: 'outlined' },
        complete: { animation: 'success', variant: 'filled' },
        pending: { animation: 'pulse', variant: 'outlined' },
        approved: { animation: 'celebration', variant: 'gradient' },
        rejected: { animation: 'error', variant: 'outlined' },
        archived: { animation: 'subtle', variant: 'minimal' },
        active: { animation: 'magnetic', variant: 'filled' },
        inactive: { animation: 'subtle', variant: 'minimal' },
      },
      importance: {
        low: { animation: 'subtle', variant: 'minimal' },
        medium: { animation: 'moderate', variant: 'outlined' },
        high: { animation: 'expressive', variant: 'detailed' },
        critical: { animation: 'dramatic', variant: 'neon' },
      },
      complexity: {
        simple: { animation: 'subtle', variant: 'minimal' },
        moderate: { animation: 'moderate', variant: 'outlined' },
        complex: { animation: 'expressive', variant: 'detailed' },
        advanced: { animation: 'dramatic', variant: 'gradient' },
      },
      sensitivity: {
        public: { animation: 'subtle', variant: 'minimal' },
        private: { animation: 'moderate', variant: 'outlined' },
        confidential: { animation: 'protective', variant: 'filled' },
        restricted: { animation: 'urgent', variant: 'neon' },
      },
    },
    interaction: {
      action: {
        create: { animation: 'celebration', variant: 'filled' },
        edit: { animation: 'moderate', variant: 'outlined' },
        delete: { animation: 'error', variant: 'outlined' },
        share: { animation: 'liquid', variant: 'gradient' },
        view: { animation: 'subtle', variant: 'minimal' },
        download: { animation: 'success', variant: 'filled' },
        upload: { animation: 'liquid', variant: 'gradient' },
        sign: { animation: 'success', variant: 'detailed' },
        approve: { animation: 'celebration', variant: 'gradient' },
        reject: { animation: 'error', variant: 'outlined' },
      },
      stage: {
        initial: { animation: 'subtle', variant: 'minimal' },
        'in-progress': { animation: 'pulse', variant: 'outlined' },
        review: { animation: 'moderate', variant: 'outlined' },
        completion: { animation: 'celebration', variant: 'filled' },
        'follow-up': { animation: 'magnetic', variant: 'detailed' },
      },
      feedback: {
        positive: { animation: 'celebration', variant: 'gradient' },
        neutral: { animation: 'subtle', variant: 'minimal' },
        negative: { animation: 'error', variant: 'outlined' },
        celebration: { animation: 'celebration', variant: 'neon' },
        encouragement: { animation: 'magnetic', variant: 'detailed' },
        guidance: { animation: 'moderate', variant: 'outlined' },
      },
      timing: {
        immediate: { animation: 'dramatic', variant: 'neon' },
        delayed: { animation: 'pulse', variant: 'outlined' },
        scheduled: { animation: 'moderate', variant: 'outlined' },
        reminder: { animation: 'magnetic', variant: 'detailed' },
      },
    },
  };

  // Get current icon configuration
  const getCurrentIcon = useCallback(() => {
    return iconVariants[currentIcon] || iconVariants.document;
  }, [currentIcon]);

  // Determine contextual icon based on all contexts
  const determineContextualIcon = useCallback(() => {
    const currentIconConfig = getCurrentIcon();
    let bestIcon = currentIcon;
    let bestReason = 'default';
    let contextualEffects: string[] = [];

    // Check content type first (most specific)
    if (contentContext.type && contextMapping.content.type[contentContext.type]) {
      const contentTypeMapping = contextMapping.content.type[contentContext.type];
      if (contentTypeMapping.icon && contentTypeMapping.icon !== currentIcon) {
        bestIcon = contentTypeMapping.icon;
        bestReason = `content.type.${contentContext.type}`;
        contextualEffects.push('content-type-change');
      }
    }

    // Check interaction action (high priority)
    if (interactionContext.action && contextMapping.interaction.action[interactionContext.action]) {
      const actionMapping = contextMapping.interaction.action[interactionContext.action];
      if (actionMapping.icon && actionMapping.icon !== bestIcon) {
        bestIcon = actionMapping.icon;
        bestReason = `interaction.action.${interactionContext.action}`;
        contextualEffects.push('action-change');
      }
    }

    // Check user emotional state (influences animation)
    if (userContext.emotionalState && contextMapping.user.emotionalState[userContext.emotionalState]) {
      const emotionalMapping = contextMapping.user.emotionalState[userContext.emotionalState];
      contextualEffects.push(`emotional-${userContext.emotionalState}`);
    }

    // Check content status (important for state)
    if (contentContext.status && contextMapping.content.status[contentContext.status]) {
      const statusMapping = contextMapping.content.status[contentContext.status];
      contextualEffects.push(`status-${contentContext.status}`);
    }

    // Check urgency (affects intensity)
    if (userContext.urgency && contextMapping.user.urgency[userContext.urgency]) {
      const urgencyMapping = contextMapping.user.urgency[userContext.urgency];
      contextualEffects.push(`urgency-${userContext.urgency}`);
    }

    setContextualEffects(contextualEffects);

    if (bestIcon !== currentIcon) {
      setCurrentIcon(bestIcon);
      onIconChange?.(bestIcon, bestReason);
    }

    return { icon: bestIcon, reason: bestReason, effects: contextualEffects };
  }, [currentIcon, contentContext, interactionContext, userContext, getCurrentIcon, onIconChange]);

  // Determine contextual variant and animation
  const determineContextualVariant = useCallback(() => {
    let bestVariant = variant;
    let bestAnimation = animation;

    // User experience level affects complexity
    if (userContext.experienceLevel && contextMapping.user.experienceLevel[userContext.experienceLevel]) {
      const experienceMapping = contextMapping.user.experienceLevel[userContext.experienceLevel];
      bestVariant = experienceMapping.variant;
      bestAnimation = experienceMapping.animation;
    }

    // Content importance affects visual weight
    if (contentContext.importance && contextMapping.content.importance[contentContext.importance]) {
      const importanceMapping = contextMapping.content.importance[contentContext.importance];
      if (importanceMapping.variant && importanceMapping.variant !== bestVariant) {
        bestVariant = importanceMapping.variant;
      }
      if (importanceMapping.animation && importanceMapping.animation !== bestAnimation) {
        bestAnimation = importanceMapping.animation;
      }
    }

    // Interaction feedback affects animation style
    if (interactionContext.feedback && contextMapping.interaction.feedback[interactionContext.feedback]) {
      const feedbackMapping = contextMapping.interaction.feedback[interactionContext.feedback];
      if (feedbackMapping.animation && feedbackMapping.animation !== bestAnimation) {
        bestAnimation = feedbackMapping.animation;
      }
      if (feedbackMapping.variant && feedbackMapping.variant !== bestVariant) {
        bestVariant = feedbackMapping.variant;
      }
    }

    // Accessibility preferences override other settings
    if (userContext.accessibility && contextMapping.user.accessibility[userContext.accessibility]) {
      const accessibilityMapping = contextMapping.user.accessibility[userContext.accessibility];
      bestVariant = accessibilityMapping.variant;
      bestAnimation = accessibilityMapping.animation;
    }

    setCurrentVariant(bestVariant);
    return { variant: bestVariant, animation: bestAnimation };
  }, [variant, animation, userContext, contentContext, interactionContext]);

  // Get current color based on context
  const getCurrentColor = useCallback(() => {
    const currentIconConfig = getCurrentIcon();
    if (!currentIconConfig) return '#6b7280';

    const stateColors = currentIconConfig.colors;

    // Check for contextual color overrides
    const contextKey = determineContextualIcon().reason;
    const contextualVariant = currentIconConfig.contextualVariants[contextKey];

    if (contextualVariant?.colors) {
      return contextualVariant.colors.default || stateColors.default || '#6b7280';
    }

    // Default color logic
    if (contentContext.status === 'complete') return stateColors.success || stateColors.default;
    if (contentContext.status === 'draft') return stateColors.draft || stateColors.default;
    if (userContext.emotionalState === 'anxious') return stateColors.warning || stateColors.default;
    if (interactionContext.feedback === 'positive') return stateColors.success || stateColors.default;

    return stateColors.default || '#6b7280';
  }, [getCurrentIcon, contentContext, userContext, interactionContext, determineContextualIcon]);

  // Animation configurations
  const animationConfigs = {
    subtle: {
      scale: [1, 1.02, 1],
      transition: { duration: 0.3, ease: 'easeOut' },
    },
    moderate: {
      scale: [1, 1.05, 1],
      transition: { duration: 0.5, ease: 'easeOut' },
    },
    expressive: {
      scale: [1, 1.1, 1],
      rotate: [0, 2, -2, 0],
      transition: { duration: 0.7, ease: 'easeInOut' },
    },
    dramatic: {
      scale: [1, 1.2, 0.9, 1.1, 1],
      rotate: [0, 5, -5, 0],
      transition: { duration: 1, ease: 'easeInOut' },
    },
    liquid: {
      borderRadius: ['50%', '30%', '70%', '50%'],
      scale: [1, 1.05, 1],
      transition: { duration: 1.2, ease: 'easeInOut' },
    },
    elastic: {
      scale: [1, 1.15, 0.95, 1.05, 1],
      transition: { duration: 0.8, ease: 'easeOut', type: 'spring', stiffness: 200, damping: 10 },
    },
    magnetic: {
      scale: [1, 1.08, 1],
      transition: { duration: 0.4, ease: 'easeOut' },
    },
    breathing: {
      scale: [1, 1.03, 1],
      opacity: [1, 0.9, 1],
      transition: { duration: 2, ease: 'easeInOut', repeat: Infinity },
    },
    elegant: {
      scale: [1, 1.02, 1],
      transition: { duration: 0.6, ease: 'easeOut' },
    },
    protective: {
      scale: [1, 1.05, 1],
      transition: { duration: 0.8, ease: 'easeOut' },
    },
    warm: {
      scale: [1, 1.03, 1],
      transition: { duration: 1, ease: 'easeInOut' },
    },
    peaceful: {
      scale: [1, 1.01, 1],
      transition: { duration: 1.5, ease: 'easeInOut' },
    },
    reassuring: {
      scale: [1, 1.02, 1],
      transition: { duration: 1, ease: 'easeInOut' },
    },
    urgent: {
      scale: [1, 1.1, 1],
      transition: { duration: 0.3, ease: 'easeOut' },
    },
    professional: {
      scale: [1, 1.02, 1],
      transition: { duration: 0.4, ease: 'easeOut' },
    },
    celebration: {
      scale: [1, 1.15, 1],
      rotate: [0, 10, -10, 0],
      transition: { duration: 0.8, ease: 'easeInOut' },
    },
    success: {
      scale: [0, 1.1, 1],
      rotate: [180, 0],
      transition: { duration: 0.6, ease: 'easeOut' },
    },
    error: {
      scale: [1, 1.05, 1],
      rotate: [0, -3, 3, 0],
      transition: { duration: 0.5, ease: 'easeInOut' },
    },
    pulse: {
      scale: [1, 1.1, 1],
      opacity: [1, 0.8, 1],
      transition: { duration: 1, ease: 'easeInOut', repeat: Infinity },
    },
  };

  // Update context when props change
  useEffect(() => {
    const contextIcon = determineContextualIcon();
    const contextVariant = determineContextualVariant();

    onContextChange?.({
      user: userContext,
      content: contentContext,
      interaction: interactionContext,
    });

    onAnimationTrigger?.(contextVariant.animation, contextIcon.reason);
  }, [userContext, contentContext, interactionContext, determineContextualIcon, determineContextualVariant, onContextChange, onAnimationTrigger]);

  // Size configurations
  const sizeConfigs = {
    xs: { width: 12, height: 12 },
    sm: { width: 16, height: 16 },
    md: { width: 20, height: 20 },
    lg: { width: 24, height: 24 },
    xl: { width: 32, height: 32 },
    custom: { width: 24, height: 24 },
  };

  const currentSize = sizeConfigs[size];
  const currentIconConfig = getCurrentIcon();
  const currentAnimationConfig = animationConfigs[determineContextualVariant().animation];
  const currentColor = getCurrentColor();

  return (
    <div
      ref={containerRef}
      className={`contextual-icon ${className} ${isAnimating ? 'animating' : ''} ${contextualEffects.join(' ')}`}
      style={{
        display: 'inline-block',
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style,
      }}
    >
      <motion.svg
        width={currentSize.width}
        height={currentSize.height}
        viewBox={currentIconConfig?.viewBox || '0 0 24 24'}
        fill="none"
        stroke="currentColor"
        strokeWidth={currentVariant === 'filled' ? '0' : '2'}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: currentColor }}
        animate={shouldReduceMotion ? {} : currentAnimationConfig}
        whileHover={shouldReduceMotion ? {} : {
          scale: 1.05,
          transition: { duration: 0.2 },
        }}
        whileTap={shouldReduceMotion ? {} : {
          scale: 0.95,
          transition: { duration: 0.1 },
        }}
      >
        {(currentIconConfig?.paths || []).map((path, index) => (
          <motion.path
            key={index}
            d={path}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: 1,
              opacity: 1,
              transition: {
                delay: index * 0.1,
                duration: 0.5,
                ease: 'easeInOut',
              },
            }}
          />
        ))}
      </motion.svg>

      {/* Contextual effects */}
      <AnimatePresence>
        {!shouldReduceMotion && contextualEffects.length > 0 && (
          <motion.div
            className="contextual-effects"
            style={{
              position: 'absolute',
              inset: '-8px',
              pointerEvents: 'none',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Contextual glow effect */}
            {contextualEffects.includes('content-type-change') && (
              <motion.div
                style={{
                  position: 'absolute',
                  inset: '-4px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${currentColor}30 0%, transparent 70%)`,
                }}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}

            {/* Emotional state indicator */}
            {contextualEffects.some(effect => effect.startsWith('emotional-')) && (
              <motion.div
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: currentColor,
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}

            {/* Status indicator */}
            {contextualEffects.some(effect => effect.startsWith('status-')) && (
              <motion.div
                style={{
                  position: 'absolute',
                  bottom: '-2px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: currentColor,
                }}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Development context display */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute -top-8 left-0 text-xs bg-black bg-opacity-50 text-white px-2 py-1 rounded">
          {currentIcon} • {determineContextualVariant().animation} • {contextualEffects.join(',')}
        </div>
      )}
    </div>
  );
};

// Preset contextual icon components for easy usage
export const ContextualDocumentIcon: React.FC<Omit<ContextualIconsProps, 'baseIcon'>> = (props) => (
  <ContextualIcons {...props} baseIcon="document" />
);

export const ContextualWillIcon: React.FC<Omit<ContextualIconsProps, 'baseIcon'>> = (props) => (
  <ContextualIcons {...props} baseIcon="will" />
);

export const ContextualGuardianIcon: React.FC<Omit<ContextualIconsProps, 'baseIcon'>> = (props) => (
  <ContextualIcons {...props} baseIcon="guardian" />
);

export const ContextualFamilyIcon: React.FC<Omit<ContextualIconsProps, 'baseIcon'>> = (props) => (
  <ContextualIcons {...props} baseIcon="family" />
);

export const ContextualSecurityIcon: React.FC<Omit<ContextualIconsProps, 'baseIcon'>> = (props) => (
  <ContextualIcons {...props} baseIcon="security" />
);

export const ContextualLegacyIcon: React.FC<Omit<ContextualIconsProps, 'baseIcon'>> = (props) => (
  <ContextualIcons {...props} baseIcon="legacy" />
);

export const ContextualEmergencyIcon: React.FC<Omit<ContextualIconsProps, 'baseIcon'>> = (props) => (
  <ContextualIcons {...props} baseIcon="emergency" />
);

export default ContextualIcons;