
// Garden System - Complete legacy garden visualization system
// Phase 2A: Legacy Garden Core - Advanced tree visualization with personality adaptation

// Core garden components
import { LegacyGardenVisualization } from './LegacyGardenVisualization';
import { AdaptiveLegacyTree } from './AdaptiveLegacyTree';
import { GardenOrchestrator } from './GardenOrchestrator';

// Interactive enhancements
import {
  CelebrationFirefly,
  InteractiveGardenEnhancements,
  MilestoneGlow,
  SofiaFirefly,
  TreeLeaf,
} from './InteractiveGardenEnhancements';

// Garden hooks and utilities
import {
  type GardenProgressData,
  useGardenProgress,
} from '@/hooks/useGardenProgress';

// Re-export garden seed from animations
import { GardenSeed } from '@/components/animations/GardenSeed';

// Garden system types and interfaces
export interface GardenTheme {
  animations: {
    duration: number;
    intensity: number;
    reducedMotion: boolean;
  };
  colorScheme: {
    accent: string;
    background: string;
    primary: string;
    secondary: string;
  };
  mode: 'adaptive' | 'empathetic' | 'pragmatic';
}

export interface GardenMilestone {
  category: 'family' | 'foundation' | 'legacy' | 'protection';
  completed: boolean;
  completedAt?: Date;
  description: string;
  id: string;
  personalityReward?: {
    adaptive: string;
    empathetic: string;
    pragmatic: string;
  };
  title: string;
}

export interface GardenInteraction {
  data?: Record<string, unknown>;
  elementId: string;
  timestamp: Date;
  type: 'branch_click' | 'element_hover' | 'leaf_click' | 'milestone_complete';
}

// Garden configuration presets
export const GARDEN_PRESETS = {
  empathetic: {
    colorScheme: {
      primary: '#10b981', // emerald-500
      secondary: '#34d399', // emerald-400
      accent: '#f472b6', // pink-400
      background: '#f0fdf4', // green-50
    },
    animations: {
      duration: 0.8,
      intensity: 1.5,
      reducedMotion: false,
    },
    elements: {
      density: 1.4,
      organicness: 'high',
      emotionalFeedback: true,
    },
  },
  pragmatic: {
    colorScheme: {
      primary: '#2563eb', // blue-600
      secondary: '#3b82f6', // blue-500
      accent: '#6366f1', // indigo-500
      background: '#f8fafc', // slate-50
    },
    animations: {
      duration: 0.4,
      intensity: 0.6,
      reducedMotion: false,
    },
    elements: {
      density: 0.7,
      organicness: 'low',
      emotionalFeedback: false,
    },
  },
  adaptive: {
    colorScheme: {
      primary: '#7c3aed', // violet-600
      secondary: '#8b5cf6', // violet-500
      accent: '#ec4899', // pink-500
      background: '#faf5ff', // purple-50
    },
    animations: {
      duration: 0.6,
      intensity: 1.0,
      reducedMotion: false,
    },
    elements: {
      density: 1.0,
      organicness: 'medium',
      emotionalFeedback: true,
    },
  },
} as const;

// Garden utilities
export const GardenUtils = {
  /**
   * Calculate garden health based on user progress
   */
  calculateGardenHealth: (
    progress: GardenProgressData
  ): 'dormant' | 'flourishing' | 'growing' | 'thriving' => {
    if (progress.overallProgress >= 80) return 'flourishing';
    if (progress.overallProgress >= 50) return 'thriving';
    if (progress.overallProgress >= 20) return 'growing';
    return 'dormant';
  },

  /**
   * Get personality-specific messages
   */
  getPersonalityMessage: (
    mode: 'adaptive' | 'empathetic' | 'pragmatic',
    context: 'completion' | 'encouragement' | 'milestone' | 'welcome'
  ): string => {
    const messages = {
      empathetic: {
        welcome: 'Welcome to your garden of love and protection 💚',
        milestone: 'Beautiful! Another loving step for your family',
        encouragement: 'Your caring heart is creating something wonderful',
        completion: "Your legacy garden blooms with the love you've planted",
      },
      pragmatic: {
        welcome: 'Protection system initialized. Begin data input.',
        milestone: 'Milestone achieved. System efficiency improved.',
        encouragement: 'Consistent progress. Family protection strengthening.',
        completion: 'Full protection matrix operational. Mission complete.',
      },
      adaptive: {
        welcome: 'Your legacy journey begins here',
        milestone: 'Excellent progress! Another milestone reached',
        encouragement: "You're building something meaningful",
        completion: 'Your comprehensive legacy system is complete',
      },
    };

    return messages[mode][context];
  },

  /**
   * Generate garden recommendations based on personality and progress
   */
  generateRecommendations: (progress: GardenProgressData): string[] => {
    const recommendations: string[] = [];
    const mode = progress.personalityMode;

    if (progress.documentsCount < 3) {
      recommendations.push(
        mode === 'empathetic'
          ? 'Add more cherished documents to nurture your garden'
          : mode === 'pragmatic'
            ? 'Upload additional documents for system redundancy'
            : 'Continue adding important documents'
      );
    }

    if (progress.guardiansCount < 2) {
      recommendations.push(
        mode === 'empathetic'
          ? 'Invite another trusted friend to help protect your family'
          : mode === 'pragmatic'
            ? 'Assign backup guardian for failure redundancy'
            : 'Add another guardian to strengthen your network'
      );
    }

    if (progress.willProgress < 50) {
      recommendations.push(
        mode === 'empathetic'
          ? 'Continue writing your will - a loving gift to your family'
          : mode === 'pragmatic'
            ? 'Complete will documentation for legal compliance'
            : 'Make progress on your will to complete your legacy'
      );
    }

    return recommendations;
  },

  /**
   * Get garden element colors based on personality mode
   */
  getElementColors: (mode: 'adaptive' | 'empathetic' | 'pragmatic') => {
    return GARDEN_PRESETS[mode].colorScheme;
  },

  /**
   * Check if garden should show celebration
   */
  shouldCelebrate: (
    progress: GardenProgressData,
    lastCelebration?: number
  ): boolean => {
    const currentMilestones = progress.completedMilestones;
    const lastCount = lastCelebration || 0;
    return currentMilestones > lastCount && currentMilestones > 0;
  },
};

// Garden system information
export const GARDEN_SYSTEM_INFO = {
  version: '2.1.0',
  phase: '2B',
  name: 'Interactive Living Garden',
  description:
    'Advanced tree visualization system with continuous animations and Sofia personality adaptation',
  features: [
    'Adaptive Legacy Tree visualization',
    'Personality-aware garden elements',
    'Interactive milestone tracking',
    'Weather effects and ambiance',
    'Progress-based growth patterns',
    'Accessibility-compliant animations',
    'Mobile-responsive design',
    'Real-time data integration',
    'Continuous leaf movement animations',
    'Sofia firefly floating companion',
    'Milestone celebration effects',
    'Dynamic branch glow animations',
    'Firefly swarm celebrations',
    'Organic interaction patterns',
  ],
  components: [
    'LegacyGardenVisualization - Complete garden with weather and elements',
    'AdaptiveLegacyTree - Focused tree growth visualization',
    'GardenOrchestrator - Central management and view switching',
    'GardenSeed - Minimalist progress indicator',
    'useGardenProgress - Data hook with personality integration',
    'InteractiveGardenEnhancements - Continuous animations and celebrations',
    'TreeLeaf - Subtle leaf movement animation',
    'SofiaFirefly - Floating Sofia companion',
    'CelebrationFirefly - Milestone celebration effects',
    'MilestoneGlow - Achievement highlighting system',
  ],
} as const;

export {
  AdaptiveLegacyTree,
  CelebrationFirefly,
  GardenOrchestrator,
  type GardenProgressData,
  GardenSeed,
  InteractiveGardenEnhancements,
  LegacyGardenVisualization,
  MilestoneGlow,
  SofiaFirefly,
  TreeLeaf,
  useGardenProgress,
};

export default {
  LegacyGardenVisualization,
  AdaptiveLegacyTree,
  GardenOrchestrator,
  GardenSeed,
  useGardenProgress,
  GardenUtils,
  GARDEN_PRESETS,
  GARDEN_SYSTEM_INFO,
  InteractiveGardenEnhancements,
  TreeLeaf,
  SofiaFirefly,
  CelebrationFirefly,
  MilestoneGlow,
};
