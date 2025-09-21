import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

// Dynamic spacing configuration interface
export interface DynamicSpacingConfig {
  id: string;
  name: string;
  description: string;
  category: 'content' | 'navigation' | 'dashboard' | 'gallery' | 'cards' | 'list' | 'form' | 'modal';
  adaptability: 'static' | 'responsive' | 'adaptive' | 'intelligent' | 'contextual' | 'emotional';
  density: 'sparse' | 'normal' | 'dense' | 'compact' | 'fluid' | 'breathing';
  context: 'calm' | 'focused' | 'energetic' | 'minimal' | 'expressive' | 'elegant';
  emotionalTone: 'neutral' | 'warm' | 'cool' | 'playful' | 'professional' | 'empathetic';
  userState?: 'stressed' | 'relaxed' | 'focused' | 'casual' | 'professional';
  contentDensity?: 'low' | 'medium' | 'high' | 'overflowing';
  screenSize?: 'mobile' | 'tablet' | 'desktop' | 'wide';
  accessibility?: {
    reducedMotion?: boolean;
    highContrast?: boolean;
    largeText?: boolean;
    cognitiveLoad?: 'low' | 'medium' | 'high';
  };
}

export interface SpacingValue {
  top: number;
  right: number;
  bottom: number;
  left: number;
  gap?: number;
  padding?: number;
  margin?: number;
}

export interface DynamicSpacingProps {
  config: DynamicSpacingConfig;
  children: React.ReactNode;
  baseSpacing?: Partial<SpacingValue>;
  responsive?: boolean;
  adaptive?: boolean;
  emotional?: boolean;
  accessibility?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onSpacingChange?: (spacing: SpacingValue, reason: string) => void;
  onEmotionalContext?: (context: string, intensity: number) => void;
}

// Spacing calculation engine
export class SpacingEngine {
  static calculateOptimalSpacing(
    config: DynamicSpacingConfig,
    containerWidth: number,
    containerHeight: number,
    contentCount: number,
    userPreferences?: any
  ): SpacingValue {
    // Base calculations
    let baseUnit = 16; // Base spacing unit (1rem)

    // Adjust base unit based on screen size
    if (containerWidth < 640) baseUnit = 12; // Mobile
    else if (containerWidth < 768) baseUnit = 14; // Small tablet
    else if (containerWidth < 1024) baseUnit = 16; // Tablet
    else if (containerWidth < 1280) baseUnit = 18; // Desktop
    else baseUnit = 20; // Wide screen

    // Content density adjustments
    const densityMultiplier = this.getDensityMultiplier(config.density, contentCount);
    const contextMultiplier = this.getContextMultiplier(config.context);
    const emotionalMultiplier = this.getEmotionalMultiplier(config.emotionalTone, config.userState);

    // Calculate spacing values
    const spacing: SpacingValue = {
      top: Math.round(baseUnit * densityMultiplier * contextMultiplier * emotionalMultiplier),
      right: Math.round(baseUnit * densityMultiplier * contextMultiplier * emotionalMultiplier),
      bottom: Math.round(baseUnit * densityMultiplier * contextMultiplier * emotionalMultiplier),
      left: Math.round(baseUnit * densityMultiplier * contextMultiplier * emotionalMultiplier),
    };

    // Add responsive gaps
    if (config.category === 'gallery' || config.category === 'cards') {
      spacing.gap = Math.round(baseUnit * 0.75 * densityMultiplier);
    } else if (config.category === 'list') {
      spacing.gap = Math.round(baseUnit * 0.5 * densityMultiplier);
    } else {
      spacing.gap = Math.round(baseUnit * densityMultiplier);
    }

    // Add padding for containers
    if (config.category === 'content' || config.category === 'dashboard') {
      spacing.padding = Math.round(baseUnit * 1.5 * densityMultiplier);
    }

    // Add margin for modal/form contexts
    if (config.category === 'modal' || config.category === 'form') {
      spacing.margin = Math.round(baseUnit * 2 * densityMultiplier);
    }

    return spacing;
  }

  private static getDensityMultiplier(density: string, contentCount: number): number {
    const baseMultipliers = {
      sparse: 1.5,
      normal: 1.0,
      dense: 0.75,
      compact: 0.5,
      fluid: 1.2,
      breathing: 1.8,
    };

    const baseMultiplier = baseMultipliers[density as keyof typeof baseMultipliers] || 1.0;

    // Adjust based on content count
    if (contentCount > 10) return baseMultiplier * 0.8;
    if (contentCount > 5) return baseMultiplier * 0.9;
    if (contentCount < 3) return baseMultiplier * 1.2;

    return baseMultiplier;
  }

  private static getContextMultiplier(context: string): number {
    const contextMultipliers = {
      calm: 1.2,
      focused: 0.9,
      energetic: 1.1,
      minimal: 0.7,
      expressive: 1.3,
      elegant: 1.0,
    };

    return contextMultipliers[context as keyof typeof contextMultipliers] || 1.0;
  }

  private static getEmotionalMultiplier(emotionalTone: string, userState?: string): number {
    const emotionalMultipliers = {
      neutral: 1.0,
      warm: 1.1,
      cool: 0.95,
      playful: 1.15,
      professional: 0.9,
      empathetic: 1.2,
    };

    const baseMultiplier = emotionalMultipliers[emotionalTone as keyof typeof emotionalMultipliers] || 1.0;

    // Adjust based on user state
    if (userState === 'stressed') return baseMultiplier * 1.3; // More space when stressed
    if (userState === 'relaxed') return baseMultiplier * 0.9; // Less space when relaxed
    if (userState === 'focused') return baseMultiplier * 0.85; // Compact when focused

    return baseMultiplier;
  }
}

const DynamicSpacing: React.FC<DynamicSpacingProps> = ({
  config,
  children,
  baseSpacing = {},
  responsive = true,
  adaptive = true,
  emotional = true,
  accessibility = true,
  className = '',
  style = {},
  onSpacingChange,
  onEmotionalContext,
}) => {
  const [currentSpacing, setCurrentSpacing] = useState<SpacingValue>({
    top: 16,
    right: 16,
    bottom: 16,
    left: 16,
    gap: 16,
    padding: 0,
    margin: 0,
    ...baseSpacing,
  });

  const [isAdapting, setIsAdapting] = useState(false);
  const [emotionalIntensity, setEmotionalIntensity] = useState(1.0);

  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Calculate optimal spacing based on context
  const calculateSpacing = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const contentCount = React.Children.count(children);

    // Get user preferences from localStorage or context
    const userPreferences = {
      reducedMotion: shouldReduceMotion,
      highContrast: window.matchMedia('(prefers-contrast: high)').matches,
      largeText: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    };

    const optimalSpacing = SpacingEngine.calculateOptimalSpacing(
      config,
      rect.width,
      rect.height,
      contentCount,
      userPreferences
    );

    setCurrentSpacing(prevSpacing => {
      const hasChanged = JSON.stringify(prevSpacing) !== JSON.stringify(optimalSpacing);

      if (hasChanged) {
        setIsAdapting(true);

        // Notify parent of spacing change
        onSpacingChange?.(optimalSpacing, 'context-adaptation');

        // Calculate emotional context
        if (emotional && onEmotionalContext) {
          const intensity = emotionalIntensity;
          const context = config.emotionalTone === 'empathetic' ? 'supportive' :
                         config.emotionalTone === 'warm' ? 'comfortable' :
                         config.emotionalTone === 'professional' ? 'focused' : 'neutral';
          onEmotionalContext(context, intensity);
        }

        // Reset adaptation state after animation
        setTimeout(() => {
          setIsAdapting(false);
        }, 300);
      }

      return optimalSpacing;
    });
  }, [config, children, shouldReduceMotion, emotional, onSpacingChange, onEmotionalContext, emotionalIntensity]);

  // Handle responsive updates
  useEffect(() => {
    const handleResize = () => {
      if (responsive) {
        calculateSpacing();
      }
    };

    const handleEmotionalChange = () => {
      if (emotional) {
        // Simulate emotional state changes based on user interaction patterns
        const newIntensity = Math.min(1.5, emotionalIntensity + 0.1);
        setEmotionalIntensity(newIntensity);
      }
    };

    // Initial calculation
    calculateSpacing();

    // Set up event listeners
    window.addEventListener('resize', handleResize);
    document.addEventListener('focusin', handleEmotionalChange);
    document.addEventListener('click', handleEmotionalChange);

    // Periodic emotional context updates
    const emotionalInterval = setInterval(() => {
      if (emotional) {
        setEmotionalIntensity(prev => {
          // Gradual return to baseline
          return Math.max(1.0, prev - 0.05);
        });
      }
    }, 5000);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('focusin', handleEmotionalChange);
      document.removeEventListener('click', handleEmotionalChange);
      clearInterval(emotionalInterval);
    };
  }, [calculateSpacing, responsive, emotional]);

  // Accessibility considerations
  const accessibilityStyles = {
    ...(accessibility && shouldReduceMotion && {
      transition: 'none',
      animation: 'none',
    }),
    ...(accessibility && config.accessibility?.highContrast && {
      border: '2px solid currentColor',
    }),
  };

  return (
    <motion.div
      ref={containerRef}
      className={`dynamic-spacing-container ${className} ${isAdapting ? 'adapting' : ''}`}
      style={{
        paddingTop: `${currentSpacing.top}px`,
        paddingRight: `${currentSpacing.right}px`,
        paddingBottom: `${currentSpacing.bottom}px`,
        paddingLeft: `${currentSpacing.left}px`,
        gap: currentSpacing.gap ? `${currentSpacing.gap}px` : undefined,
        margin: currentSpacing.margin ? `${currentSpacing.margin}px` : undefined,
        transition: shouldReduceMotion ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        ...accessibilityStyles,
        ...style,
      }}
      animate={isAdapting ? {
        scale: [1, 1.02, 1],
        opacity: [1, 0.9, 1],
      } : {}}
      transition={{
        duration: 0.3,
        ease: 'easeInOut',
      }}
    >
      {/* Spacing visualization (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div
          className="absolute -top-6 left-0 text-xs bg-black bg-opacity-50 text-white px-2 py-1 rounded"
          style={{ fontSize: '10px' }}
        >
          {config.name} • {config.density} • {currentSpacing.top}px spacing
        </div>
      )}

      {/* Emotional context indicator */}
      {emotional && emotionalIntensity > 1.1 && (
        <motion.div
          className="absolute top-2 right-2 w-2 h-2 rounded-full"
          style={{
            background: config.emotionalTone === 'warm' ? '#f59e0b' :
                       config.emotionalTone === 'cool' ? '#3b82f6' :
                       config.emotionalTone === 'empathetic' ? '#ec4899' : '#10b981',
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {children}
    </motion.div>
  );
};

// Preset spacing configurations
export const ContentSpacing: React.FC<Omit<DynamicSpacingProps, 'config'>> = (props) => (
  <DynamicSpacing
    {...props}
    config={{
      id: 'content-spacing',
      name: 'Content Spacing',
      description: 'Optimal spacing for content areas',
      category: 'content',
      adaptability: 'adaptive',
      density: 'normal',
      context: 'elegant',
      emotionalTone: 'neutral',
    }}
  />
);

export const NavigationSpacing: React.FC<Omit<DynamicSpacingProps, 'config'>> = (props) => (
  <DynamicSpacing
    {...props}
    config={{
      id: 'navigation-spacing',
      name: 'Navigation Spacing',
      description: 'Compact spacing for navigation elements',
      category: 'navigation',
      adaptability: 'responsive',
      density: 'compact',
      context: 'focused',
      emotionalTone: 'professional',
    }}
  />
);

export const GallerySpacing: React.FC<Omit<DynamicSpacingProps, 'config'>> = (props) => (
  <DynamicSpacing
    {...props}
    config={{
      id: 'gallery-spacing',
      name: 'Gallery Spacing',
      description: 'Breathing room for gallery layouts',
      category: 'gallery',
      adaptability: 'emotional',
      density: 'breathing',
      context: 'expressive',
      emotionalTone: 'playful',
    }}
  />
);

export const CardSpacing: React.FC<Omit<DynamicSpacingProps, 'config'>> = (props) => (
  <DynamicSpacing
    {...props}
    config={{
      id: 'card-spacing',
      name: 'Card Spacing',
      description: 'Comfortable spacing for card layouts',
      category: 'cards',
      adaptability: 'contextual',
      density: 'normal',
      context: 'elegant',
      emotionalTone: 'empathetic',
    }}
  />
);

export const FormSpacing: React.FC<Omit<DynamicSpacingProps, 'config'>> = (props) => (
  <DynamicSpacing
    {...props}
    config={{
      id: 'form-spacing',
      name: 'Form Spacing',
      description: 'Clear spacing for form elements',
      category: 'form',
      adaptability: 'intelligent',
      density: 'fluid',
      context: 'focused',
      emotionalTone: 'professional',
    }}
  />
);

export const ModalSpacing: React.FC<Omit<DynamicSpacingProps, 'config'>> = (props) => (
  <DynamicSpacing
    {...props}
    config={{
      id: 'modal-spacing',
      name: 'Modal Spacing',
      description: 'Generous spacing for modal dialogs',
      category: 'modal',
      adaptability: 'emotional',
      density: 'sparse',
      context: 'calm',
      emotionalTone: 'empathetic',
    }}
  />
);

export default DynamicSpacing;