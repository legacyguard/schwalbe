import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { config } from '@/lib/env';

// Complex estate planning concepts and their visual metaphors
export interface VisualMetaphorConcept {
  id: string;
  name: string;
  description: string;
  category: 'protection' | 'legacy' | 'family' | 'security' | 'time' | 'transition' | 'continuity' | 'preparation';
  complexity: 'simple' | 'moderate' | 'complex' | 'advanced';
  emotionalWeight: 'light' | 'moderate' | 'heavy' | 'profound';
  visualStyle: 'literal' | 'abstract' | 'symbolic' | 'metaphorical' | 'poetic';
}

export interface VisualMetaphorProps {
  concept: VisualMetaphorConcept;
  children?: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  animation?: 'subtle' | 'expressive' | 'dramatic' | 'contemplative' | 'reassuring' | 'celebratory';
  theme?: 'light' | 'dark' | 'warm' | 'cool' | 'neutral' | 'vibrant' | 'serene' | 'elegant';
  variant?: 'static' | 'interactive' | 'animated' | 'responsive' | 'adaptive';
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  onConceptReveal?: (concept: VisualMetaphorConcept) => void;
  onAnimationComplete?: (concept: VisualMetaphorConcept) => void;
  onInteraction?: (concept: VisualMetaphorConcept, interaction: string) => void;
}

interface MetaphorElement {
  id: string;
  type: 'shape' | 'line' | 'particle' | 'gradient' | 'text' | 'symbol';
  paths?: string[];
  position: { x: number; y: number };
  scale: number;
  rotation: number;
  opacity: number;
  color: string;
  animation: string;
  timing: number;
  duration: number;
}

interface MetaphorScene {
  id: string;
  name: string;
  elements: MetaphorElement[];
  background: string;
  atmosphere: 'calm' | 'contemplative' | 'protective' | 'warm' | 'elegant' | 'timeless' | 'serene';
  transitions: string[];
  interactions: string[];
}

const VisualMetaphors: React.FC<VisualMetaphorProps> = ({
  concept,
  children,
  size = 'md',
  animation = 'contemplative',
  theme = 'elegant',
  variant = 'animated',
  className = '',
  style = {},
  disabled = false,
  onConceptReveal,
  onAnimationComplete,
  onInteraction,
}) => {
  const [currentScene, setCurrentScene] = useState<MetaphorScene | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [interactionState, setInteractionState] = useState('idle');
  const [metaphorElements, setMetaphorElements] = useState<MetaphorElement[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Comprehensive concept-to-metaphor mapping system
  const conceptMetaphors: Record<string, MetaphorScene> = {
    // Protection & Security Concepts
    'family-protection': {
      id: 'family-protection',
      name: 'Family Protection',
      elements: [
        {
          id: 'shield-core',
          type: 'shape',
          paths: ['M12 1l9 4v6c0 5.55-3.84 10.74-9 12-5.16-1.26-9-6.45-9-12V5l9-4z'],
          position: { x: 50, y: 50 },
          scale: 1,
          rotation: 0,
          opacity: 0.9,
          color: '#059669',
          animation: 'protective-pulse',
          timing: 0,
          duration: 3000,
        },
        {
          id: 'family-silhouettes',
          type: 'shape',
          paths: [
            'M17 20c0 1.66-4 3-9 3s-9-1.34-9-3',
            'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
            'M20 10V7a2 2 0 0 0-2-2h-2',
            'M4 10V7a2 2 0 0 1 2-2h2'
          ],
          position: { x: 50, y: 65 },
          scale: 0.8,
          rotation: 0,
          opacity: 0.7,
          color: '#ec4899',
          animation: 'gentle-breathing',
          timing: 500,
          duration: 4000,
        },
        {
          id: 'protection-rays',
          type: 'line',
          paths: ['M12 1v22', 'M1 12h22', 'M6 6l12 12', 'M18 6L6 18'],
          position: { x: 50, y: 50 },
          scale: 1,
          rotation: 0,
          opacity: 0.4,
          color: '#10b981',
          animation: 'radiating-pulse',
          timing: 1000,
          duration: 2000,
        },
      ],
      background: 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
      atmosphere: 'protective',
      transitions: ['fade-in', 'expand', 'solidify'],
      interactions: ['hover-glow', 'click-reinforce', 'focus-protect'],
    },

    // Legacy & Continuity Concepts
    'legacy-continuity': {
      id: 'legacy-continuity',
      name: 'Legacy Continuity',
      elements: [
        {
          id: 'eternal-flame',
          type: 'shape',
          paths: ['M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'],
          position: { x: 50, y: 30 },
          scale: 1.2,
          rotation: 0,
          opacity: 0.8,
          color: '#fbbf24',
          animation: 'eternal-flame',
          timing: 0,
          duration: 5000,
        },
        {
          id: 'generations-line',
          type: 'line',
          paths: ['M20 50L50 50L80 50', 'M35 40L50 50L65 60', 'M25 60L50 50L75 40'],
          position: { x: 50, y: 60 },
          scale: 1,
          rotation: 0,
          opacity: 0.6,
          color: '#8b5cf6',
          animation: 'flowing-line',
          timing: 800,
          duration: 3000,
        },
        {
          id: 'time-capsule',
          type: 'shape',
          paths: ['M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z'],
          position: { x: 80, y: 70 },
          scale: 0.6,
          rotation: 0,
          opacity: 0.7,
          color: '#6b7280',
          animation: 'time-capsule-glow',
          timing: 1500,
          duration: 4000,
        },
        {
          id: 'legacy-particles',
          type: 'particle',
          position: { x: 50, y: 50 },
          scale: 1,
          rotation: 0,
          opacity: 0.5,
          color: '#fbbf24',
          animation: 'floating-particles',
          timing: 2000,
          duration: 6000,
        },
      ],
      background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
      atmosphere: 'timeless',
      transitions: ['materialize', 'illuminate', 'transcend'],
      interactions: ['hover-illuminate', 'click-amplify', 'focus-eternalize'],
    },

    // Time & Transition Concepts
    'time-transition': {
      id: 'time-transition',
      name: 'Time Transition',
      elements: [
        {
          id: 'hourglass',
          type: 'shape',
          paths: [
            'M12 2v6l4 4-4 4v6',
            'M6 8h12a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2z',
            'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'
          ],
          position: { x: 50, y: 40 },
          scale: 1,
          rotation: 0,
          opacity: 0.8,
          color: '#f59e0b',
          animation: 'hourglass-flow',
          timing: 0,
          duration: 8000,
        },
        {
          id: 'timeline',
          type: 'line',
          paths: ['M10 60L90 60', 'M20 55L20 65', 'M40 55L40 65', 'M60 55L60 65', 'M80 55L80 65'],
          position: { x: 50, y: 70 },
          scale: 1,
          rotation: 0,
          opacity: 0.6,
          color: '#6b7280',
          animation: 'timeline-progress',
          timing: 1000,
          duration: 5000,
        },
        {
          id: 'transition-portal',
          type: 'shape',
          paths: ['M50 20A30 30 0 0 1 50 80A30 30 0 0 1 50 20'],
          position: { x: 50, y: 50 },
          scale: 0.8,
          rotation: 0,
          opacity: 0.4,
          color: '#8b5cf6',
          animation: 'portal-pulse',
          timing: 2000,
          duration: 4000,
        },
      ],
      background: 'radial-gradient(ellipse at 50% 50%, rgba(245, 158, 11, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)',
      atmosphere: 'contemplative',
      transitions: ['flow', 'transform', 'bridge'],
      interactions: ['hover-accelerate', 'click-transition', 'focus-contemplate'],
    },

    // Family & Connection Concepts
    'family-bonds': {
      id: 'family-bonds',
      name: 'Family Bonds',
      elements: [
        {
          id: 'family-tree',
          type: 'line',
          paths: [
            'M50 20L30 40L50 40L70 40',
            'M30 40L20 60L40 60',
            'M70 40L80 60L60 60',
            'M50 40L50 80'
          ],
          position: { x: 50, y: 50 },
          scale: 1,
          rotation: 0,
          opacity: 0.8,
          color: '#10b981',
          animation: 'tree-growth',
          timing: 0,
          duration: 3000,
        },
        {
          id: 'heart-connections',
          type: 'shape',
          paths: ['M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z'],
          position: { x: 50, y: 35 },
          scale: 0.8,
          rotation: 0,
          opacity: 0.7,
          color: '#ec4899',
          animation: 'heartbeat',
          timing: 500,
          duration: 2000,
        },
        {
          id: 'bond-threads',
          type: 'line',
          paths: ['M20 60Q30 50 40 60T60 60', 'M40 70Q50 60 60 70T80 70'],
          position: { x: 50, y: 65 },
          scale: 1,
          rotation: 0,
          opacity: 0.5,
          color: '#f59e0b',
          animation: 'weaving-bonds',
          timing: 1000,
          duration: 4000,
        },
      ],
      background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
      atmosphere: 'warm',
      transitions: ['connect', 'strengthen', 'nurture'],
      interactions: ['hover-warm', 'click-strengthen', 'focus-appreciate'],
    },

    // Security & Trust Concepts
    'digital-security': {
      id: 'digital-security',
      name: 'Digital Security',
      elements: [
        {
          id: 'lock-mechanism',
          type: 'shape',
          paths: [
            'M18 8h-1V6a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2zM8 8V6a4 4 0 0 1 8 0v2z',
            'M12 14v2'
          ],
          position: { x: 50, y: 45 },
          scale: 1,
          rotation: 0,
          opacity: 0.9,
          color: '#374151',
          animation: 'lock-secure',
          timing: 0,
          duration: 2000,
        },
        {
          id: 'encryption-layers',
          type: 'shape',
          paths: ['M50 25A25 25 0 0 1 50 75A25 25 0 0 1 50 25', 'M50 30A20 20 0 0 1 50 70A20 20 0 0 1 50 30', 'M50 35A15 15 0 0 1 50 65A15 15 0 0 1 50 35'],
          position: { x: 50, y: 50 },
          scale: 0.8,
          rotation: 0,
          opacity: 0.6,
          color: '#6366f1',
          animation: 'encryption-spin',
          timing: 800,
          duration: 3000,
        },
        {
          id: 'security-grid',
          type: 'line',
          paths: [
            'M20 20L80 20M20 30L80 30M20 40L80 40',
            'M20 20L20 80M30 20L30 80M40 20L40 80',
            'M25 25L35 35M35 25L25 35M45 25L55 35M55 25L45 35'
          ],
          position: { x: 50, y: 70 },
          scale: 1,
          rotation: 0,
          opacity: 0.4,
          color: '#059669',
          animation: 'grid-security',
          timing: 1500,
          duration: 2500,
        },
      ],
      background: 'conic-gradient(from 0deg at 50% 50%, rgba(55, 65, 81, 0.1) 0deg, rgba(99, 102, 241, 0.1) 120deg, rgba(5, 150, 105, 0.1) 240deg, rgba(55, 65, 81, 0.1) 360deg)',
      atmosphere: 'protective',
      transitions: ['encrypt', 'secure', 'fortify'],
      interactions: ['hover-scan', 'click-verify', 'focus-authenticate'],
    },

    // Preparation & Planning Concepts
    'preparation-journey': {
      id: 'preparation-journey',
      name: 'Preparation Journey',
      elements: [
        {
          id: 'pathway',
          type: 'line',
          paths: ['M10 50Q30 30 50 50T90 50', 'M25 45L25 55', 'M45 45L45 55', 'M65 45L65 55', 'M85 45L85 55'],
          position: { x: 50, y: 50 },
          scale: 1,
          rotation: 0,
          opacity: 0.8,
          color: '#3b82f6',
          animation: 'path-progression',
          timing: 0,
          duration: 4000,
        },
        {
          id: 'milestones',
          type: 'shape',
          paths: ['M25 45A5 5 0 0 1 25 55A5 5 0 0 1 25 45', 'M45 45A5 5 0 0 1 45 55A5 5 0 0 1 45 45', 'M65 45A5 5 0 0 1 65 55A5 5 0 0 1 65 45'],
          position: { x: 50, y: 50 },
          scale: 1,
          rotation: 0,
          opacity: 0.7,
          color: '#10b981',
          animation: 'milestone-achievement',
          timing: 1000,
          duration: 3000,
        },
        {
          id: 'compass',
          type: 'shape',
          paths: ['M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', 'M12 8v8'],
          position: { x: 20, y: 30 },
          scale: 0.6,
          rotation: 0,
          opacity: 0.6,
          color: '#f59e0b',
          animation: 'compass-guidance',
          timing: 2000,
          duration: 5000,
        },
      ],
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
      atmosphere: 'contemplative',
      transitions: ['guide', 'progress', 'achieve'],
      interactions: ['hover-navigate', 'click-advance', 'focus-plan'],
    },

    // Transition & Change Concepts
    'smooth-transition': {
      id: 'smooth-transition',
      name: 'Smooth Transition',
      elements: [
        {
          id: 'bridge',
          type: 'line',
          paths: ['M10 50Q50 30 90 50', 'M20 45L20 55', 'M40 45L40 55', 'M60 45L60 55', 'M80 45L80 55'],
          position: { x: 50, y: 50 },
          scale: 1,
          rotation: 0,
          opacity: 0.8,
          color: '#8b5cf6',
          animation: 'bridge-flow',
          timing: 0,
          duration: 6000,
        },
        {
          id: 'transformation',
          type: 'shape',
          paths: ['M30 40L50 30L70 40L50 50Z', 'M50 30L50 50'],
          position: { x: 50, y: 40 },
          scale: 1,
          rotation: 0,
          opacity: 0.7,
          color: '#ec4899',
          animation: 'transformation-morph',
          timing: 1500,
          duration: 4000,
        },
        {
          id: 'flow-particles',
          type: 'particle',
          position: { x: 50, y: 50 },
          scale: 1,
          rotation: 0,
          opacity: 0.5,
          color: '#06b6d4',
          animation: 'flow-particles',
          timing: 1000,
          duration: 5000,
        },
      ],
      background: 'radial-gradient(ellipse at 50% 50%, rgba(139, 92, 246, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
      atmosphere: 'calm',
      transitions: ['bridge', 'transform', 'flow'],
      interactions: ['hover-smooth', 'click-transition', 'focus-harmonize'],
    },

    // Peace of Mind Concept
    'peace-of-mind': {
      id: 'peace-of-mind',
      name: 'Peace of Mind',
      elements: [
        {
          id: 'serenity-ripple',
          type: 'shape',
          paths: ['M50 50A20 20 0 0 1 50 50A20 20 0 0 1 50 50', 'M50 50A15 15 0 0 1 50 50A15 15 0 0 1 50 50', 'M50 50A10 10 0 0 1 50 50A10 10 0 0 1 50 50'],
          position: { x: 50, y: 50 },
          scale: 1,
          rotation: 0,
          opacity: 0.3,
          color: '#10b981',
          animation: 'serenity-ripple',
          timing: 0,
          duration: 4000,
        },
        {
          id: 'balance-scale',
          type: 'shape',
          paths: ['M12 2v6l4 4-4 4v6', 'M12 12h20', 'M20 2v22', 'M8 8h24'],
          position: { x: 50, y: 45 },
          scale: 0.8,
          rotation: 0,
          opacity: 0.8,
          color: '#059669',
          animation: 'balance-perfect',
          timing: 800,
          duration: 3000,
        },
        {
          id: 'mindful-particles',
          type: 'particle',
          position: { x: 50, y: 50 },
          scale: 1,
          rotation: 0,
          opacity: 0.4,
          color: '#d1fae5',
          animation: 'mindful-float',
          timing: 1500,
          duration: 6000,
        },
      ],
      background: 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.08) 0%, rgba(209, 250, 229, 0.04) 100%)',
      atmosphere: 'serene',
      transitions: ['calm', 'balance', 'accept'],
      interactions: ['hover-calm', 'click-center', 'focus-breathe'],
    },
  };

  // Get current metaphor scene
  const getCurrentScene = useCallback(() => {
    return conceptMetaphors[concept.id] || conceptMetaphors['family-protection'];
  }, [concept.id]);

  // Initialize metaphor scene
  const initializeScene = useCallback(() => {
    const scene = getCurrentScene();
    if (!scene) return;

    setCurrentScene(scene);
    setMetaphorElements(scene.elements);

    if (variant === 'animated' && !shouldReduceMotion) {
      setIsRevealing(true);
      onConceptReveal?.(concept);

      // Staggered element reveal
      scene.elements.forEach((element, index) => {
        setTimeout(() => {
          setMetaphorElements(prev =>
            prev.map(el =>
              el.id === element.id
                ? { ...el, opacity: el.opacity }
                : el
            )
          );
        }, element.timing);
      });

      // Complete animation sequence
      setTimeout(() => {
        setIsRevealing(false);
        onAnimationComplete?.(concept);
      }, Math.max(...scene.elements.map(el => el.timing + el.duration)));
    }
  }, [getCurrentScene, concept, variant, shouldReduceMotion, onConceptReveal, onAnimationComplete]);

  // Animation configurations
  const animationConfigs = {
    'protective-pulse': {
      scale: [1, 1.05, 1],
      opacity: [0.9, 1, 0.9],
      transition: { duration: 3, ease: 'easeInOut', repeat: Infinity },
    },
    'gentle-breathing': {
      scale: [1, 1.02, 1],
      opacity: [0.7, 0.8, 0.7],
      transition: { duration: 4, ease: 'easeInOut', repeat: Infinity },
    },
    'radiating-pulse': {
      scale: [1, 1.2, 1],
      opacity: [0.4, 0.7, 0.4],
      transition: { duration: 2, ease: 'easeOut', repeat: Infinity },
    },
    'eternal-flame': {
      scale: [1.2, 1.25, 1.2],
      rotate: [0, 2, -2, 0],
      transition: { duration: 5, ease: 'easeInOut', repeat: Infinity },
    },
    'flowing-line': {
      pathLength: [0, 1],
      opacity: [0.6, 0.8, 0.6],
      transition: { duration: 3, ease: 'easeInOut', repeat: Infinity },
    },
    'time-capsule-glow': {
      scale: [0.6, 0.65, 0.6],
      opacity: [0.7, 0.9, 0.7],
      transition: { duration: 4, ease: 'easeInOut', repeat: Infinity },
    },
    'floating-particles': {
      x: [0, 10, -10, 0],
      y: [0, -5, 5, 0],
      opacity: [0.5, 0.8, 0.5],
      transition: { duration: 6, ease: 'easeInOut', repeat: Infinity },
    },
    'hourglass-flow': {
      rotate: [0, 180],
      transition: { duration: 8, ease: 'easeInOut' },
    },
    'timeline-progress': {
      pathLength: [0, 1],
      opacity: [0.6, 0.9, 0.6],
      transition: { duration: 5, ease: 'easeInOut', repeat: Infinity },
    },
    'portal-pulse': {
      scale: [0.8, 1, 0.8],
      opacity: [0.4, 0.7, 0.4],
      transition: { duration: 4, ease: 'easeInOut', repeat: Infinity },
    },
    'tree-growth': {
      pathLength: [0, 1],
      scale: [0.8, 1, 1],
      transition: { duration: 3, ease: 'easeOut' },
    },
    'heartbeat': {
      scale: [1, 1.1, 1],
      transition: { duration: 2, ease: 'easeInOut', repeat: Infinity },
    },
    'weaving-bonds': {
      pathLength: [0, 1],
      opacity: [0.5, 0.8, 0.5],
      transition: { duration: 4, ease: 'easeInOut', repeat: Infinity },
    },
    'lock-secure': {
      scale: [1, 1.02, 1],
      transition: { duration: 2, ease: 'easeInOut', repeat: Infinity },
    },
    'encryption-spin': {
      rotate: 360,
      transition: { duration: 3, ease: 'linear', repeat: Infinity },
    },
    'grid-security': {
      opacity: [0.4, 0.7, 0.4],
      transition: { duration: 2.5, ease: 'easeInOut', repeat: Infinity },
    },
    'path-progression': {
      pathLength: [0, 1],
      opacity: [0.8, 1, 0.8],
      transition: { duration: 4, ease: 'easeInOut', repeat: Infinity },
    },
    'milestone-achievement': {
      scale: [1, 1.2, 1],
      opacity: [0.7, 1, 0.7],
      transition: { duration: 3, ease: 'easeOut', repeat: Infinity },
    },
    'compass-guidance': {
      rotate: [0, 360],
      transition: { duration: 5, ease: 'linear', repeat: Infinity },
    },
    'bridge-flow': {
      pathLength: [0, 1],
      opacity: [0.8, 1, 0.8],
      transition: { duration: 6, ease: 'easeInOut', repeat: Infinity },
    },
    'transformation-morph': {
      scale: [1, 1.1, 0.9, 1],
      rotate: [0, 5, -5, 0],
      transition: { duration: 4, ease: 'easeInOut' },
    },
    'flow-particles': {
      x: [0, 15, -15, 0],
      y: [0, -8, 8, 0],
      opacity: [0.5, 0.8, 0.5],
      transition: { duration: 5, ease: 'easeInOut', repeat: Infinity },
    },
    'serenity-ripple': {
      scale: [1, 1.5, 2],
      opacity: [0.3, 0.1, 0],
      transition: { duration: 4, ease: 'easeOut', repeat: Infinity },
    },
    'balance-perfect': {
      rotate: [0, 1, -1, 0],
      transition: { duration: 3, ease: 'easeInOut', repeat: Infinity },
    },
    'mindful-float': {
      y: [0, -3, 0],
      opacity: [0.4, 0.6, 0.4],
      transition: { duration: 6, ease: 'easeInOut', repeat: Infinity },
    },
  };

  // Size configurations
  const sizeConfigs = {
    xs: { width: 48, height: 48 },
    sm: { width: 64, height: 64 },
    md: { width: 96, height: 96 },
    lg: { width: 128, height: 128 },
    xl: { width: 160, height: 160 },
    hero: { width: 240, height: 240 },
  };

  const currentSize = sizeConfigs[size];

  // Initialize scene on mount and concept change
  useEffect(() => {
    initializeScene();
  }, [initializeScene]);

  // Handle interactions
  const handleInteraction = useCallback((interactionType: string) => {
    if (disabled) return;

    setInteractionState(interactionType);
    onInteraction?.(concept, interactionType);

    // Reset interaction state after animation
    setTimeout(() => {
      setInteractionState('idle');
    }, 1000);
  }, [disabled, concept, onInteraction]);

  const handleMouseEnter = () => handleInteraction('hover');
  const handleMouseLeave = () => handleInteraction('idle');
  const handleClick = () => handleInteraction('click');
  const handleFocus = () => handleInteraction('focus');

  if (!currentScene) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`visual-metaphor ${className} ${isRevealing ? 'revealing' : ''} ${interactionState}`}
      style={{
        width: currentSize.width,
        height: currentSize.height,
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: currentScene.background,
        borderRadius: '12px',
        overflow: 'hidden',
        ...style,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onFocus={handleFocus}
    >
      {/* Metaphor elements */}
      <svg
        width={currentSize.width}
        height={currentSize.height}
        viewBox="0 0 100 100"
        style={{ position: 'absolute', inset: 0 }}
      >
        <defs>
          {/* Gradients for visual depth */}
          <radialGradient id="metaphor-glow" cx="50%" cy="50%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
            <stop offset="70%" stopColor="currentColor" stopOpacity="0.1" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="metaphor-shine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.3" />
            <stop offset="50%" stopColor="white" stopOpacity="0.1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        {metaphorElements.map((element) => (
          <motion.g
            key={element.id}
            initial={{ opacity: 0 }}
            animate={shouldReduceMotion ? { opacity: element.opacity } : {
              opacity: element.opacity,
              ...animationConfigs[element.animation as keyof typeof animationConfigs],
            }}
            style={{
              transformOrigin: 'center',
              transform: `translate(${element.position.x - 50}px, ${element.position.y - 50}px) scale(${element.scale}) rotate(${element.rotation}deg)`,
            }}
          >
            {element.type === 'shape' && element.paths?.map((path, index) => (
              <motion.path
                key={index}
                d={path}
                fill={element.type === 'shape' ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="0.5"
                opacity={element.opacity}
                style={{ color: element.color }}
              />
            ))}

            {element.type === 'line' && element.paths?.map((path, index) => (
              <motion.path
                key={index}
                d={path}
                fill="none"
                stroke="currentColor"
                strokeWidth="0.3"
                opacity={element.opacity}
                style={{ color: element.color }}
              />
            ))}

            {element.type === 'particle' && (
              <motion.circle
                cx={element.position.x}
                cy={element.position.y}
                r="1"
                fill="currentColor"
                opacity={element.opacity}
                style={{ color: element.color }}
              />
            )}
          </motion.g>
        ))}
      </svg>

      {/* Atmospheric effects */}
      <AnimatePresence>
        {!shouldReduceMotion && (isRevealing || interactionState !== 'idle') && (
          <motion.div
            className="atmospheric-effects"
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background: `radial-gradient(circle at 50% 50%, ${currentScene.atmosphere === 'protective' ? 'rgba(16, 185, 129, 0.05)' : currentScene.atmosphere === 'warm' ? 'rgba(236, 72, 153, 0.05)' : currentScene.atmosphere === 'contemplative' ? 'rgba(139, 92, 246, 0.05)' : 'rgba(59, 130, 246, 0.05)'} 0%, transparent 70%)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Subtle particle effects */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                style={{
                  position: 'absolute',
                  width: '2px',
                  height: '2px',
                  borderRadius: '50%',
                  background: 'currentColor',
                  left: `${20 + i * 15}%`,
                  top: `${30 + (i % 2) * 40}%`,
                  opacity: 0.3,
                }}
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Concept label (development only) */}
      {config.isDev && (
        <div className="absolute -bottom-6 left-0 text-xs bg-black bg-opacity-50 text-white px-2 py-1 rounded">
          {concept.name} • {currentScene.atmosphere} • {animation}
        </div>
      )}
    </div>
  );
};

// Preset visual metaphor components for easy usage
export const FamilyProtectionMetaphor: React.FC<Omit<VisualMetaphorProps, 'concept'>> = (props) => (
  <VisualMetaphors
    {...props}
    concept={{
      id: 'family-protection',
      name: 'Family Protection',
      description: 'Visual representation of family protection and security',
      category: 'protection',
      complexity: 'moderate',
      emotionalWeight: 'moderate',
      visualStyle: 'symbolic',
    }}
  />
);

export const LegacyContinuityMetaphor: React.FC<Omit<VisualMetaphorProps, 'concept'>> = (props) => (
  <VisualMetaphors
    {...props}
    concept={{
      id: 'legacy-continuity',
      name: 'Legacy Continuity',
      description: 'Metaphorical representation of legacy and continuity through time',
      category: 'legacy',
      complexity: 'complex',
      emotionalWeight: 'profound',
      visualStyle: 'metaphorical',
    }}
  />
);

export const TimeTransitionMetaphor: React.FC<Omit<VisualMetaphorProps, 'concept'>> = (props) => (
  <VisualMetaphors
    {...props}
    concept={{
      id: 'time-transition',
      name: 'Time Transition',
      description: 'Visual metaphor for the passage of time and smooth transitions',
      category: 'time',
      complexity: 'moderate',
      emotionalWeight: 'moderate',
      visualStyle: 'abstract',
    }}
  />
);

export const FamilyBondsMetaphor: React.FC<Omit<VisualMetaphorProps, 'concept'>> = (props) => (
  <VisualMetaphors
    {...props}
    concept={{
      id: 'family-bonds',
      name: 'Family Bonds',
      description: 'Warm representation of family connections and relationships',
      category: 'family',
      complexity: 'simple',
      emotionalWeight: 'moderate',
      visualStyle: 'literal',
    }}
  />
);

export const DigitalSecurityMetaphor: React.FC<Omit<VisualMetaphorProps, 'concept'>> = (props) => (
  <VisualMetaphors
    {...props}
    concept={{
      id: 'digital-security',
      name: 'Digital Security',
      description: 'Technical representation of digital protection and encryption',
      category: 'security',
      complexity: 'complex',
      emotionalWeight: 'light',
      visualStyle: 'symbolic',
    }}
  />
);

export const PreparationJourneyMetaphor: React.FC<Omit<VisualMetaphorProps, 'concept'>> = (props) => (
  <VisualMetaphors
    {...props}
    concept={{
      id: 'preparation-journey',
      name: 'Preparation Journey',
      description: 'Guiding metaphor for the preparation and planning process',
      category: 'preparation',
      complexity: 'moderate',
      emotionalWeight: 'light',
      visualStyle: 'metaphorical',
    }}
  />
);

export const PeaceOfMindMetaphor: React.FC<Omit<VisualMetaphorProps, 'concept'>> = (props) => (
  <VisualMetaphors
    {...props}
    concept={{
      id: 'peace-of-mind',
      name: 'Peace of Mind',
      description: 'Serene representation of tranquility and mental peace',
      category: 'transition',
      complexity: 'simple',
      emotionalWeight: 'light',
      visualStyle: 'poetic',
    }}
  />
);

export default VisualMetaphors;