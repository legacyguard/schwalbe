import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

// Asymmetric layout configuration interface
export interface AsymmetricLayoutConfig {
  id: string;
  name: string;
  description: string;
  category: 'hero' | 'feature' | 'testimonial' | 'gallery' | 'article' | 'dashboard' | 'form' | 'navigation';
  asymmetry: 'subtle' | 'moderate' | 'dramatic' | 'extreme' | 'organic' | 'geometric';
  visualInterest: 'minimal' | 'balanced' | 'dynamic' | 'chaotic' | 'artistic' | 'editorial';
  rhythm: 'regular' | 'varied' | 'syncopated' | 'flowing' | 'staccato' | 'legato';
  emphasis: 'distributed' | 'hierarchical' | 'focal' | 'narrative' | 'exploratory' | 'conversational';
  adaptation: 'static' | 'responsive' | 'adaptive' | 'intelligent' | 'contextual' | 'emotional';
  userIntent?: 'browsing' | 'searching' | 'reading' | 'creating' | 'analyzing' | 'collaborating';
  contentType?: 'text' | 'image' | 'video' | 'mixed' | 'interactive' | 'data';
  emotionalTone?: 'calm' | 'exciting' | 'professional' | 'friendly' | 'urgent' | 'contemplative';
}

export interface LayoutElement {
  id: string;
  content: React.ReactNode;
  priority: 'background' | 'supporting' | 'featured' | 'hero' | 'accent';
  size: 'compact' | 'normal' | 'prominent' | 'dominant' | 'subtle';
  position: 'edge' | 'center' | 'offset' | 'corner' | 'floating' | 'overlapping';
  behavior: 'static' | 'floating' | 'magnetic' | 'repulsive' | 'orbital' | 'flowing';
  interaction: 'passive' | 'hover' | 'click' | 'drag' | 'scroll' | 'gaze';
  emotionalWeight: 'light' | 'moderate' | 'heavy' | 'profound';
  metadata?: Record<string, any>;
}

export interface AsymmetricLayoutProps {
  config: AsymmetricLayoutConfig;
  elements: LayoutElement[];
  children?: React.ReactNode;
  containerWidth?: number;
  containerHeight?: number;
  responsive?: boolean;
  adaptive?: boolean;
  interactive?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onElementFocus?: (elementId: string, element: LayoutElement) => void;
  onLayoutShift?: (shift: LayoutShift, reason: string) => void;
  onVisualInterest?: (interest: number, elements: LayoutElement[]) => void;
}

export interface LayoutShift {
  type: 'rebalance' | 'refocus' | 'recompose' | 'redistribute' | 'harmonize';
  magnitude: number;
  duration: number;
  easing: string;
  affectedElements: string[];
}

export interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  scale?: number;
  zIndex?: number;
}

// Advanced layout calculation engine
export class AsymmetricLayoutEngine {
  static calculateOptimalLayout(
    config: AsymmetricLayoutConfig,
    containerWidth: number,
    containerHeight: number,
    elements: LayoutElement[]
  ): Map<string, Position> {
    const positions = new Map<string, Position>();

    // Base calculations
    const baseUnit = Math.min(containerWidth, containerHeight) / 12;
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;

    // Calculate asymmetry parameters
    const asymmetryParams = this.getAsymmetryParameters(config.asymmetry);
    const rhythmParams = this.getRhythmParameters(config.rhythm);
    const emphasisParams = this.getEmphasisParameters(config.emphasis);

    elements.forEach((element, index) => {
      let position = this.calculateElementPosition(
        element,
        index,
        elements.length,
        centerX,
        centerY,
        baseUnit,
        asymmetryParams,
        rhythmParams,
        emphasisParams,
        config,
        containerWidth,
        containerHeight
      );

      // Apply visual interest transformations
      position = this.applyVisualInterest(position, config.visualInterest, index);

      // Apply emotional tone adjustments
      if (config.emotionalTone) {
        position = this.applyEmotionalTone(position, config.emotionalTone, element.emotionalWeight);
      }

      positions.set(element.id, position);
    });

    return positions;
  }

  private static getAsymmetryParameters(asymmetry: string): { offset: number; variation: number; complexity: number } {
    const params = {
      subtle: { offset: 0.1, variation: 0.2, complexity: 1 },
      moderate: { offset: 0.2, variation: 0.4, complexity: 2 },
      dramatic: { offset: 0.3, variation: 0.6, complexity: 3 },
      extreme: { offset: 0.4, variation: 0.8, complexity: 4 },
      organic: { offset: 0.25, variation: 0.5, complexity: 2.5 },
      geometric: { offset: 0.15, variation: 0.3, complexity: 3 },
    };

    return params[asymmetry as keyof typeof params] || params.moderate;
  }

  private static getRhythmParameters(rhythm: string): { timing: number; spacing: number; flow: number } {
    const params = {
      regular: { timing: 1.0, spacing: 1.0, flow: 0.5 },
      varied: { timing: 1.2, spacing: 0.8, flow: 0.7 },
      syncopated: { timing: 1.5, spacing: 0.6, flow: 0.9 },
      flowing: { timing: 0.8, spacing: 1.3, flow: 0.3 },
      staccato: { timing: 0.6, spacing: 0.9, flow: 0.8 },
      legato: { timing: 1.8, spacing: 1.1, flow: 0.4 },
    };

    return params[rhythm as keyof typeof params] || params.regular;
  }

  private static getEmphasisParameters(emphasis: string): { hierarchy: number; focus: number; distribution: number } {
    const params = {
      distributed: { hierarchy: 0.5, focus: 0.3, distribution: 1.0 },
      hierarchical: { hierarchy: 1.0, focus: 0.7, distribution: 0.6 },
      focal: { hierarchy: 0.8, focus: 1.0, distribution: 0.4 },
      narrative: { hierarchy: 0.7, focus: 0.5, distribution: 0.8 },
      exploratory: { hierarchy: 0.4, focus: 0.6, distribution: 0.9 },
      conversational: { hierarchy: 0.6, focus: 0.4, distribution: 0.7 },
    };

    return params[emphasis as keyof typeof params] || params.distributed;
  }

  private static calculateElementPosition(
    element: LayoutElement,
    index: number,
    totalElements: number,
    centerX: number,
    centerY: number,
    baseUnit: number,
    asymmetry: any,
    rhythm: any,
    emphasis: any,
    config: AsymmetricLayoutConfig,
    containerWidth: number,
    containerHeight: number
  ): Position {
    // Base position calculations
    const angle = (index / totalElements) * Math.PI * 2;
    const radius = baseUnit * (2 + index * 0.5);
    const baseX = centerX + Math.cos(angle) * radius * asymmetry.offset;
    const baseY = centerY + Math.sin(angle) * radius * asymmetry.offset;

    // Apply priority-based positioning
    const priorityMultiplier = this.getPriorityMultiplier(element.priority);
    const sizeMultiplier = this.getSizeMultiplier(element.size);

    // Calculate final position with asymmetry
    const finalX = baseX + (Math.random() - 0.5) * baseUnit * asymmetry.variation * priorityMultiplier;
    const finalY = baseY + (Math.random() - 0.5) * baseUnit * asymmetry.variation * priorityMultiplier;

    // Calculate dimensions based on priority and size
    const baseWidth = baseUnit * 2 * sizeMultiplier;
    const baseHeight = baseUnit * 1.5 * sizeMultiplier;

    // Apply rhythm-based spacing
    const width = baseWidth * rhythm.spacing;
    const height = baseHeight * rhythm.spacing;

    // Add rotation for visual interest
    const rotation = (Math.random() - 0.5) * 10 * asymmetry.complexity;

    return {
      x: Math.max(0, Math.min(containerWidth - width, finalX - width / 2)),
      y: Math.max(0, Math.min(containerHeight - height, finalY - height / 2)),
      width,
      height,
      rotation,
      scale: 1.0,
      zIndex: index + 1,
    };
  }

  private static getPriorityMultiplier(priority: string): number {
    const multipliers = {
      background: 0.5,
      supporting: 0.8,
      featured: 1.2,
      hero: 1.5,
      accent: 1.0,
    };
    return multipliers[priority as keyof typeof multipliers] || 1.0;
  }

  private static getSizeMultiplier(size: string): number {
    const multipliers = {
      compact: 0.7,
      normal: 1.0,
      prominent: 1.3,
      dominant: 1.6,
      subtle: 0.8,
    };
    return multipliers[size as keyof typeof multipliers] || 1.0;
  }

  private static applyVisualInterest(position: Position, interest: string, index: number): Position {
    const interestEffects = {
      minimal: { scale: 1.0, rotation: 0, zIndex: 1 },
      balanced: { scale: 1.0 + (index % 3) * 0.1, rotation: (index % 2) * 5, zIndex: index + 1 },
      dynamic: { scale: 1.0 + Math.sin(index) * 0.2, rotation: Math.sin(index * 0.5) * 15, zIndex: index + 1 },
      chaotic: { scale: 0.8 + Math.random() * 0.4, rotation: (Math.random() - 0.5) * 30, zIndex: Math.floor(Math.random() * 10) + 1 },
      artistic: { scale: 1.0 + (index % 4) * 0.15, rotation: (index % 3 - 1) * 10, zIndex: index + 1 },
      editorial: { scale: 1.0 + (index % 2) * 0.2, rotation: 0, zIndex: index + 1 },
    };

    const effect = interestEffects[interest as keyof typeof interestEffects] || interestEffects.balanced;
    return {
      ...position,
      scale: position.scale! * effect.scale,
      rotation: position.rotation! + effect.rotation,
      zIndex: effect.zIndex,
    };
  }

  private static applyEmotionalTone(position: Position, tone: string, weight: string): Position {
    const toneEffects = {
      calm: { scale: 1.0, rotation: 0, zIndex: 1 },
      exciting: { scale: 1.1, rotation: 5, zIndex: 2 },
      professional: { scale: 0.95, rotation: 0, zIndex: 1 },
      friendly: { scale: 1.05, rotation: -3, zIndex: 1 },
      urgent: { scale: 1.15, rotation: 8, zIndex: 3 },
      contemplative: { scale: 0.9, rotation: 2, zIndex: 1 },
    };

    const weightMultipliers = {
      light: 0.7,
      moderate: 1.0,
      heavy: 1.3,
      profound: 1.6,
    };

    const effect = toneEffects[tone as keyof typeof toneEffects] || toneEffects.calm;
    const weightMultiplier = weightMultipliers[weight as keyof typeof weightMultipliers] || 1.0;

    return {
      ...position,
      scale: position.scale! * effect.scale * weightMultiplier,
      rotation: position.rotation! + effect.rotation,
      zIndex: effect.zIndex,
    };
  }
}

const AsymmetricLayouts: React.FC<AsymmetricLayoutProps> = ({
  config,
  elements,
  children,
  containerWidth = 800,
  containerHeight = 600,
  responsive = true,
  adaptive = true,
  interactive = true,
  className = '',
  style = {},
  onElementFocus,
  onLayoutShift,
  onVisualInterest,
}) => {
  const [positions, setPositions] = useState<Map<string, Position>>(new Map());
  const [isShifting, setIsShifting] = useState(false);
  const [visualInterest, setVisualInterest] = useState(0.5);

  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Calculate layout positions
  const calculateLayout = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();

    const newPositions = AsymmetricLayoutEngine.calculateOptimalLayout(
      config,
      rect.width,
      rect.height,
      elements
    );

    setPositions(prevPositions => {
      const hasChanged = JSON.stringify([...prevPositions.entries()]) !== JSON.stringify([...newPositions.entries()]);

      if (hasChanged) {
        setIsShifting(true);

        // Notify parent of layout shift
        const shift: LayoutShift = {
          type: 'rebalance',
          magnitude: 0.5,
          duration: 300,
          easing: 'easeInOut',
          affectedElements: elements.map(el => el.id),
        };
        onLayoutShift?.(shift, 'responsive-adaptation');

        // Calculate visual interest
        const interest = calculateVisualInterest(newPositions, elements);
        setVisualInterest(interest);
        onVisualInterest?.(interest, elements);

        // Reset shifting state after animation
        setTimeout(() => {
          setIsShifting(false);
        }, 300);
      }

      return newPositions;
    });
  }, [config, elements, onLayoutShift, onVisualInterest]);

  // Calculate visual interest score
  const calculateVisualInterest = (positions: Map<string, Position>, elements: LayoutElement[]): number => {
    let interest = 0;

    // Factor 1: Position variety
    const positionVariety = positions.size > 1 ? 1 - (1 / positions.size) : 0;
    interest += positionVariety * 0.3;

    // Factor 2: Size variation
    const sizes = Array.from(positions.values()).map(p => p.width * p.height);
    const sizeVariation = sizes.length > 1 ? calculateVariance(sizes) / Math.max(...sizes) : 0;
    interest += sizeVariation * 0.3;

    // Factor 3: Rotation variety
    const rotations = Array.from(positions.values()).map(p => Math.abs(p.rotation || 0));
    const rotationVariation = rotations.length > 1 ? calculateVariance(rotations) / 45 : 0;
    interest += rotationVariation * 0.2;

    // Factor 4: Element priority distribution
    const priorities = elements.map(el => el.priority === 'hero' ? 3 : el.priority === 'featured' ? 2 : 1);
    const priorityVariation = priorities.length > 1 ? calculateVariance(priorities) / 3 : 0;
    interest += priorityVariation * 0.2;

    return Math.min(1.0, Math.max(0.0, interest));
  };

  const calculateVariance = (values: number[]): number => {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  };

  // Handle element interactions
  const handleElementInteraction = useCallback((elementId: string, interactionType: 'hover' | 'click' | 'focus') => {
    if (!interactive) return;

    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    onElementFocus?.(elementId, element);

    if (interactionType === 'click' && adaptive) {
      // Trigger layout shift on interaction
      const shift: LayoutShift = {
        type: 'refocus',
        magnitude: 0.3,
        duration: 200,
        easing: 'easeOut',
        affectedElements: [elementId],
      };
      onLayoutShift?.(shift, 'user-interaction');
    }
  }, [elements, interactive, adaptive, onElementFocus, onLayoutShift]);

  // Responsive updates
  useEffect(() => {
    const handleResize = () => {
      if (responsive) {
        calculateLayout();
      }
    };

    // Initial calculation
    calculateLayout();

    // Set up event listeners
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [calculateLayout, responsive]);

  return (
    <div
      ref={containerRef}
      className={`asymmetric-layout-container ${className} ${isShifting ? 'shifting' : ''}`}
      style={{
        position: 'relative',
        width: containerWidth,
        height: containerHeight,
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Layout elements */}
      {elements.map((element, index) => {
        const position = positions.get(element.id);
        if (!position) return null;

        return (
          <motion.div
            key={element.id}
            className={`layout-element ${element.priority} ${element.position}`}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              transformOrigin: 'center',
            }}
            animate={{
              x: position.x,
              y: position.y,
              width: position.width,
              height: position.height,
              rotate: position.rotation,
              scale: position.scale,
            }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.5,
              ease: 'easeInOut',
              delay: index * 0.1,
            }}
            onClick={() => handleElementInteraction(element.id, 'click')}
            onMouseEnter={() => handleElementInteraction(element.id, 'hover')}
            onFocus={() => handleElementInteraction(element.id, 'focus')}
            whileHover={shouldReduceMotion ? {} : {
              scale: 1.05,
              rotate: position.rotation! + 5,
              transition: { duration: 0.2 },
            }}
            whileTap={shouldReduceMotion ? {} : {
              scale: 0.95,
              transition: { duration: 0.1 },
            }}
          >
            {/* Element content */}
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '12px',
                overflow: 'hidden',
                background: `linear-gradient(135deg,
                  ${element.priority === 'hero' ? 'rgba(139, 92, 246, 0.2)' :
                    element.priority === 'featured' ? 'rgba(59, 130, 246, 0.15)' :
                    'rgba(107, 114, 128, 0.1)'} 0%,
                  transparent 100%)`,
                border: `2px solid ${element.priority === 'hero' ? 'rgba(139, 92, 246, 0.3)' :
                  element.priority === 'featured' ? 'rgba(59, 130, 246, 0.2)' :
                  'rgba(107, 114, 128, 0.1)'}`,
                backdropFilter: 'blur(10px)',
              }}
            >
              {element.content}

              {/* Priority indicator */}
              {element.priority === 'hero' && (
                <motion.div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: '#8b5cf6',
                    border: '2px solid white',
                    boxShadow: '0 0 8px rgba(139, 92, 246, 0.5)',
                  }}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}
            </div>
          </motion.div>
        );
      })}

      {/* Visual interest indicator */}
      {visualInterest > 0.7 && (
        <motion.div
          style={{
            position: 'absolute',
            bottom: '16px',
            right: '16px',
            padding: '8px 12px',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            borderRadius: '20px',
            fontSize: '12px',
            backdropFilter: 'blur(10px)',
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
        >
          Visual Interest: {Math.round(visualInterest * 100)}%
        </motion.div>
      )}

      {/* Development info */}
      {process.env.NODE_ENV === 'development' && (
        <div
          className="absolute top-4 left-4 text-xs bg-black bg-opacity-50 text-white px-2 py-1 rounded"
          style={{ fontSize: '10px' }}
        >
          {config.name} • {config.asymmetry} • {elements.length} elements
        </div>
      )}

      {children}
    </div>
  );
};

// Preset asymmetric layout configurations
export const HeroAsymmetricLayout: React.FC<Omit<AsymmetricLayoutProps, 'config'>> = (props) => (
  <AsymmetricLayouts
    {...props}
    config={{
      id: 'hero-asymmetric',
      name: 'Hero Asymmetric Layout',
      description: 'Dramatic asymmetric layout for hero sections',
      category: 'hero',
      asymmetry: 'dramatic',
      visualInterest: 'dynamic',
      rhythm: 'flowing',
      emphasis: 'focal',
      adaptation: 'emotional',
      emotionalTone: 'exciting',
    }}
  />
);

export const FeatureAsymmetricLayout: React.FC<Omit<AsymmetricLayoutProps, 'config'>> = (props) => (
  <AsymmetricLayouts
    {...props}
    config={{
      id: 'feature-asymmetric',
      name: 'Feature Asymmetric Layout',
      description: 'Balanced asymmetric layout for feature showcases',
      category: 'feature',
      asymmetry: 'moderate',
      visualInterest: 'balanced',
      rhythm: 'varied',
      emphasis: 'hierarchical',
      adaptation: 'adaptive',
      emotionalTone: 'professional',
    }}
  />
);

export const GalleryAsymmetricLayout: React.FC<Omit<AsymmetricLayoutProps, 'config'>> = (props) => (
  <AsymmetricLayouts
    {...props}
    config={{
      id: 'gallery-asymmetric',
      name: 'Gallery Asymmetric Layout',
      description: 'Artistic asymmetric layout for image galleries',
      category: 'gallery',
      asymmetry: 'organic',
      visualInterest: 'artistic',
      rhythm: 'syncopated',
      emphasis: 'exploratory',
      adaptation: 'contextual',
      emotionalTone: 'contemplative',
    }}
  />
);

export const ArticleAsymmetricLayout: React.FC<Omit<AsymmetricLayoutProps, 'config'>> = (props) => (
  <AsymmetricLayouts
    {...props}
    config={{
      id: 'article-asymmetric',
      name: 'Article Asymmetric Layout',
      description: 'Narrative-driven asymmetric layout for articles',
      category: 'article',
      asymmetry: 'subtle',
      visualInterest: 'editorial',
      rhythm: 'legato',
      emphasis: 'narrative',
      adaptation: 'intelligent',
      emotionalTone: 'calm',
    }}
  />
);

export const DashboardAsymmetricLayout: React.FC<Omit<AsymmetricLayoutProps, 'config'>> = (props) => (
  <AsymmetricLayouts
    {...props}
    config={{
      id: 'dashboard-asymmetric',
      name: 'Dashboard Asymmetric Layout',
      description: 'Functional asymmetric layout for dashboards',
      category: 'dashboard',
      asymmetry: 'geometric',
      visualInterest: 'balanced',
      rhythm: 'regular',
      emphasis: 'distributed',
      adaptation: 'responsive',
      emotionalTone: 'professional',
    }}
  />
);

export default AsymmetricLayouts;