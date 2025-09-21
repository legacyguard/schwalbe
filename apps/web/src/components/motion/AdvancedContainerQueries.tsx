import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

// Advanced container query configuration interface
export interface ContainerQueryConfig {
  id: string;
  name: string;
  description: string;
  breakpoints: {
    xs: { minWidth?: number; maxWidth?: number; minHeight?: number; maxHeight?: number };
    sm: { minWidth?: number; maxWidth?: number; minHeight?: number; maxHeight?: number };
    md: { minWidth?: number; maxWidth?: number; minHeight?: number; maxHeight?: number };
    lg: { minWidth?: number; maxWidth?: number; minHeight?: number; maxHeight?: number };
    xl: { minWidth?: number; maxWidth?: number; minHeight?: number; maxHeight?: number };
    xxl: { minWidth?: number; maxWidth?: number; minHeight?: number; maxHeight?: number };
  };
  aspectRatios: {
    portrait: { minRatio?: number; maxRatio?: number };
    landscape: { minRatio?: number; maxRatio?: number };
    square: { minRatio?: number; maxRatio?: number };
    ultrawide: { minRatio?: number; maxRatio?: number };
  };
  orientation: 'portrait' | 'landscape' | 'square' | 'adaptive';
  density: 'compact' | 'normal' | 'spacious' | 'adaptive';
  interaction: 'touch' | 'mouse' | 'hybrid' | 'adaptive';
  complexity: 'simple' | 'moderate' | 'complex' | 'adaptive';
  adaptation: 'static' | 'reactive' | 'predictive' | 'intelligent';
}

export interface ContainerQueryProps {
  config: ContainerQueryConfig;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  enableTransitions?: boolean;
  enablePrediction?: boolean;
  enableAdaptation?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onQueryChange?: (query: ContainerQueryResult, config: ContainerQueryConfig) => void;
  onAdaptation?: (adaptation: ContainerAdaptation, reason: string) => void;
  onPrediction?: (prediction: ContainerPrediction, confidence: number) => void;
}

export interface ContainerQueryResult {
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  aspectRatio: 'portrait' | 'landscape' | 'square' | 'ultrawide';
  orientation: 'portrait' | 'landscape' | 'square';
  density: 'compact' | 'normal' | 'spacious';
  interaction: 'touch' | 'mouse' | 'hybrid';
  complexity: 'simple' | 'moderate' | 'complex';
  dimensions: { width: number; height: number };
  isOptimal: boolean;
  recommendations: string[];
  constraints: string[];
}

export interface ContainerAdaptation {
  type: 'resize' | 'reorder' | 'simplify' | 'enhance' | 'reposition' | 'transform';
  elements: string[];
  magnitude: number;
  duration: number;
  easing: string;
  reason: string;
}

export interface ContainerPrediction {
  nextBreakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  confidence: number;
  alternatives: Array<{ breakpoint: string; confidence: number }>;
  reasoning: string[];
  context: Record<string, any>;
}

// Advanced container query engine
export class AdvancedContainerQueryEngine {
  public static queryHistory: Map<string, ContainerQueryResult[]> = new Map();
  private static adaptationHistory: Map<string, ContainerAdaptation[]> = new Map();

  static analyzeContainer(
    container: HTMLElement,
    config: ContainerQueryConfig
  ): ContainerQueryResult {
    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const aspectRatio = width / height;

    // Determine breakpoint
    const breakpoint = this.determineBreakpoint(width, height, config);

    // Determine aspect ratio category
    const aspectRatioCategory = this.determineAspectRatio(aspectRatio, config);

    // Determine orientation
    const orientation = this.determineOrientation(width, height, config);

    // Determine density
    const density = this.determineDensity(width, height, config);

    // Determine interaction method
    const interaction = this.determineInteraction();

    // Determine complexity
    const complexity = this.determineComplexity(container, config);

    // Calculate if current dimensions are optimal
    const isOptimal = this.isOptimalDimensions(width, height, config);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      width, height, breakpoint, aspectRatioCategory, config
    );

    // Generate constraints
    const constraints = this.generateConstraints(
      width, height, breakpoint, aspectRatioCategory, config
    );

    const result: ContainerQueryResult = {
      breakpoint,
      aspectRatio: aspectRatioCategory,
      orientation,
      density,
      interaction,
      complexity,
      dimensions: { width, height },
      isOptimal,
      recommendations,
      constraints,
    };

    return result;
  }

  private static determineBreakpoint(
    width: number,
    height: number,
    config: ContainerQueryConfig
  ): 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' {
    const breakpoints = config.breakpoints;

    if (this.matchesBreakpoint(width, height, breakpoints.xs)) return 'xs';
    if (this.matchesBreakpoint(width, height, breakpoints.sm)) return 'sm';
    if (this.matchesBreakpoint(width, height, breakpoints.md)) return 'md';
    if (this.matchesBreakpoint(width, height, breakpoints.lg)) return 'lg';
    if (this.matchesBreakpoint(width, height, breakpoints.xl)) return 'xl';
    if (this.matchesBreakpoint(width, height, breakpoints.xxl)) return 'xxl';

    return 'md'; // fallback
  }

  private static matchesBreakpoint(
    width: number,
    height: number,
    breakpoint: { minWidth?: number; maxWidth?: number; minHeight?: number; maxHeight?: number }
  ): boolean {
    if (breakpoint.minWidth && width < breakpoint.minWidth) return false;
    if (breakpoint.maxWidth && width > breakpoint.maxWidth) return false;
    if (breakpoint.minHeight && height < breakpoint.minHeight) return false;
    if (breakpoint.maxHeight && height > breakpoint.maxHeight) return false;
    return true;
  }

  private static determineAspectRatio(
    aspectRatio: number,
    config: ContainerQueryConfig
  ): 'portrait' | 'landscape' | 'square' | 'ultrawide' {
    const ratios = config.aspectRatios;

    if (this.matchesAspectRatio(aspectRatio, ratios.portrait)) return 'portrait';
    if (this.matchesAspectRatio(aspectRatio, ratios.landscape)) return 'landscape';
    if (this.matchesAspectRatio(aspectRatio, ratios.square)) return 'square';
    if (this.matchesAspectRatio(aspectRatio, ratios.ultrawide)) return 'ultrawide';

    return aspectRatio > 1 ? 'landscape' : 'portrait';
  }

  private static matchesAspectRatio(
    aspectRatio: number,
    ratioConfig: { minRatio?: number; maxRatio?: number }
  ): boolean {
    if (ratioConfig.minRatio && aspectRatio < ratioConfig.minRatio) return false;
    if (ratioConfig.maxRatio && aspectRatio > ratioConfig.maxRatio) return false;
    return true;
  }

  private static determineOrientation(
    width: number,
    height: number,
    config: ContainerQueryConfig
  ): 'portrait' | 'landscape' | 'square' {
    if (Math.abs(width - height) < 50) return 'square';
    return width > height ? 'landscape' : 'portrait';
  }

  private static determineDensity(
    width: number,
    height: number,
    config: ContainerQueryConfig
  ): 'compact' | 'normal' | 'spacious' {
    const area = width * height;
    const density = area / 1000000; // pixels per megapixel

    if (density < 0.3) return 'compact';
    if (density > 0.7) return 'spacious';
    return 'normal';
  }

  private static determineInteraction(): 'touch' | 'mouse' | 'hybrid' {
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const hasMouse = window.matchMedia('(pointer: fine)').matches;

    if (hasTouch && hasMouse) return 'hybrid';
    if (hasTouch) return 'touch';
    return 'mouse';
  }

  private static determineComplexity(
    container: HTMLElement,
    config: ContainerQueryConfig
  ): 'simple' | 'moderate' | 'complex' {
    const childCount = container.children.length;
    const depth = this.getElementDepth(container);
    const complexityScore = childCount * 0.1 + depth * 0.2;

    if (complexityScore < 0.5) return 'simple';
    if (complexityScore > 1.0) return 'complex';
    return 'moderate';
  }

  private static getElementDepth(element: HTMLElement, depth = 0): number {
    const children = Array.from(element.children) as HTMLElement[];
    if (children.length === 0) return depth;

    const maxChildDepth = Math.max(
      ...children.map(child => this.getElementDepth(child, depth + 1))
    );
    return maxChildDepth;
  }

  private static isOptimalDimensions(
    width: number,
    height: number,
    config: ContainerQueryConfig
  ): boolean {
    const aspectRatio = width / height;
    const area = width * height;

    // Check if dimensions are within reasonable bounds
    const minArea = 10000; // 100x100
    const maxArea = 2000000; // ~1400x1400

    return area >= minArea && area <= maxArea && aspectRatio >= 0.3 && aspectRatio <= 3;
  }

  private static generateRecommendations(
    width: number,
    height: number,
    breakpoint: string,
    aspectRatio: string,
    config: ContainerQueryConfig
  ): string[] {
    const recommendations: string[] = [];

    if (width < 400) {
      recommendations.push('Consider increasing container width for better content layout');
    }

    if (aspectRatio === 'ultrawide') {
      recommendations.push('Ultrawide aspect ratio detected - optimize for horizontal content flow');
    }

    if (breakpoint === 'xs') {
      recommendations.push('Mobile breakpoint - prioritize essential content');
    }

    return recommendations;
  }

  private static generateConstraints(
    width: number,
    height: number,
    breakpoint: string,
    aspectRatio: string,
    config: ContainerQueryConfig
  ): string[] {
    const constraints: string[] = [];

    if (width < 320) {
      constraints.push('Minimum width constraint violated');
    }

    if (height < 240) {
      constraints.push('Minimum height constraint violated');
    }

    if (aspectRatio === 'portrait' && width > height * 2) {
      constraints.push('Extreme portrait aspect ratio may cause layout issues');
    }

    return constraints;
  }

  static generateAdaptations(
    currentQuery: ContainerQueryResult,
    previousQuery: ContainerQueryResult | undefined,
    config: ContainerQueryConfig
  ): ContainerAdaptation[] {
    const adaptations: ContainerAdaptation[] = [];

    // Breakpoint change adaptation
    if (previousQuery && currentQuery.breakpoint !== previousQuery.breakpoint) {
      adaptations.push({
        type: 'resize',
        elements: ['container'],
        magnitude: 0.3,
        duration: 400,
        easing: 'easeInOut',
        reason: 'breakpoint_change',
      });
    }

    // Orientation change adaptation
    if (previousQuery && currentQuery.orientation !== previousQuery.orientation) {
      adaptations.push({
        type: 'reorder',
        elements: ['content'],
        magnitude: 0.5,
        duration: 600,
        easing: 'easeInOut',
        reason: 'orientation_change',
      });
    }

    // Density adaptation
    if (currentQuery.density === 'compact') {
      adaptations.push({
        type: 'simplify',
        elements: ['secondary-content'],
        magnitude: 0.2,
        duration: 300,
        easing: 'easeOut',
        reason: 'space_optimization',
      });
    }

    return adaptations;
  }

  static predictNextQuery(
    queryHistory: ContainerQueryResult[],
    config: ContainerQueryConfig
  ): ContainerPrediction {
    if (queryHistory.length < 2) {
      return {
        nextBreakpoint: 'md',
        confidence: 0.5,
        alternatives: [
          { breakpoint: 'sm', confidence: 0.3 },
          { breakpoint: 'lg', confidence: 0.2 },
        ],
        reasoning: ['Insufficient history for prediction'],
        context: {},
      };
    }

    // Simple trend analysis
    const recent = queryHistory.slice(-3);
    const breakpoints = recent.map(q => q.breakpoint);
    const mostCommon = breakpoints.reduce((acc, curr) => {
      acc[curr] = (acc[curr] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sortedEntries = Object.entries(mostCommon)
      .sort(([,a], [,b]) => b - a);
    const predictedBreakpoint = (sortedEntries[0]?.[0] || 'md') as 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

    return {
      nextBreakpoint: predictedBreakpoint,
      confidence: 0.7,
      alternatives: [
        { breakpoint: 'md', confidence: 0.2 },
        { breakpoint: 'lg', confidence: 0.1 },
      ],
      reasoning: ['Based on recent breakpoint history', 'Stable usage pattern detected'],
      context: { historyLength: queryHistory.length },
    };
  }
}

const AdvancedContainerQueries: React.FC<ContainerQueryProps> = ({
  config,
  children,
  fallback,
  enableTransitions = true,
  enablePrediction = true,
  enableAdaptation = true,
  className = '',
  style = {},
  onQueryChange,
  onAdaptation,
  onPrediction,
}) => {
  const [currentQuery, setCurrentQuery] = useState<ContainerQueryResult | null>(null);
  const [previousQuery, setPreviousQuery] = useState<ContainerQueryResult | null>(null);
  const [adaptations, setAdaptations] = useState<ContainerAdaptation[]>([]);
  const [predictions, setPredictions] = useState<ContainerPrediction[]>([]);
  const [isAdapting, setIsAdapting] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Analyze container and generate query
  const analyzeContainer = useCallback(() => {
    if (!containerRef.current) return;

    const query = AdvancedContainerQueryEngine.analyzeContainer(containerRef.current, config);
    const previous = currentQuery;

    setPreviousQuery(currentQuery);
    setCurrentQuery(query);

    // Store in history
    const history = AdvancedContainerQueryEngine.queryHistory.get(config.id) || [];
    history.push(query);
    if (history.length > 10) history.shift(); // Keep last 10
    AdvancedContainerQueryEngine.queryHistory.set(config.id, history);

    // Notify parent
    onQueryChange?.(query, config);

    // Generate adaptations
    if (enableAdaptation && previous) {
      const newAdaptations = AdvancedContainerQueryEngine.generateAdaptations(
        query,
        previous,
        config
      );
      setAdaptations(newAdaptations);

      newAdaptations.forEach(adaptation => {
        onAdaptation?.(adaptation, adaptation.reason);
      });

      if (newAdaptations.length > 0) {
        setIsAdapting(true);
        setTimeout(() => setIsAdapting(false), 400);
      }
    }

    // Generate predictions
    if (enablePrediction && history.length > 1) {
      const prediction = AdvancedContainerQueryEngine.predictNextQuery(history, config);
      setPredictions([prediction]);
      onPrediction?.(prediction, prediction.confidence);
    }
  }, [config, currentQuery, enableAdaptation, enablePrediction, onQueryChange, onAdaptation, onPrediction]);

  // Set up resize observer and initial analysis
  useEffect(() => {
    const handleResize = () => {
      analyzeContainer();
    };

    // Initial analysis
    analyzeContainer();

    // Set up resize observer
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Set up orientation change listener
    const handleOrientationChange = () => {
      setTimeout(analyzeContainer, 100);
    };
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [analyzeContainer]);

  // Render appropriate content based on query
  const renderContent = () => {
    if (!currentQuery) {
      return fallback || <div>Loading container analysis...</div>;
    }

    // Apply responsive classes based on query
    const responsiveClasses = [
      `breakpoint-${currentQuery.breakpoint}`,
      `aspect-${currentQuery.aspectRatio}`,
      `orientation-${currentQuery.orientation}`,
      `density-${currentQuery.density}`,
      `interaction-${currentQuery.interaction}`,
      `complexity-${currentQuery.complexity}`,
      currentQuery.isOptimal ? 'optimal' : 'suboptimal',
    ].join(' ');

    return (
      <motion.div
        className={`advanced-container-queries ${responsiveClasses} ${className} ${isAdapting ? 'adapting' : ''}`}
        style={style}
        ref={containerRef}
        initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
        animate={shouldReduceMotion ? {} : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {/* Query information display */}
        {process.env.NODE_ENV === 'development' && (
          <div
            className="absolute top-2 left-2 text-xs bg-black bg-opacity-50 text-white px-2 py-1 rounded z-50"
            style={{ fontSize: '10px' }}
          >
            {currentQuery.breakpoint.toUpperCase()} • {currentQuery.aspectRatio} • {currentQuery.density}
          </div>
        )}

        {/* Adaptation indicators */}
        <AnimatePresence>
          {isAdapting && adaptations.length > 0 && (
            <motion.div
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                padding: '8px 12px',
                background: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                borderRadius: '20px',
                fontSize: '12px',
                backdropFilter: 'blur(10px)',
                zIndex: 40,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              Adapting: {adaptations[0]?.reason.replace(/_/g, ' ')}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content with responsive behavior */}
        <div
          className="container-content"
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: currentQuery.orientation === 'portrait' ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {children}
        </div>

        {/* Recommendations display */}
        {currentQuery.recommendations.length > 0 && (
          <div
            className="absolute bottom-2 left-2 text-xs bg-blue-500 bg-opacity-20 text-blue-100 px-2 py-1 rounded"
            style={{ fontSize: '10px', maxWidth: '200px' }}
          >
            💡 {currentQuery.recommendations[0]}
          </div>
        )}

        {/* Constraints warnings */}
        {currentQuery.constraints.length > 0 && (
          <div
            className="absolute bottom-2 right-2 text-xs bg-red-500 bg-opacity-20 text-red-100 px-2 py-1 rounded"
            style={{ fontSize: '10px', maxWidth: '200px' }}
          >
            ⚠️ {currentQuery.constraints[0]}
          </div>
        )}
      </motion.div>
    );
  };

  return renderContent();
};

// Preset container query configurations
export const MobileOptimizedContainer: React.FC<Omit<ContainerQueryProps, 'config'>> = (props) => (
  <AdvancedContainerQueries
    {...props}
    config={{
      id: 'mobile-optimized',
      name: 'Mobile Optimized Container',
      description: 'Container optimized for mobile devices with touch interactions',
      breakpoints: {
        xs: { maxWidth: 480 },
        sm: { minWidth: 481, maxWidth: 768 },
        md: { minWidth: 769, maxWidth: 1024 },
        lg: { minWidth: 1025, maxWidth: 1280 },
        xl: { minWidth: 1281, maxWidth: 1536 },
        xxl: { minWidth: 1537 },
      },
      aspectRatios: {
        portrait: { maxRatio: 0.8 },
        landscape: { minRatio: 1.2 },
        square: { minRatio: 0.9, maxRatio: 1.1 },
        ultrawide: { minRatio: 2.0 },
      },
      orientation: 'adaptive',
      density: 'compact',
      interaction: 'touch',
      complexity: 'simple',
      adaptation: 'reactive',
    }}
  />
);

export const DesktopOptimizedContainer: React.FC<Omit<ContainerQueryProps, 'config'>> = (props) => (
  <AdvancedContainerQueries
    {...props}
    config={{
      id: 'desktop-optimized',
      name: 'Desktop Optimized Container',
      description: 'Container optimized for desktop with mouse interactions',
      breakpoints: {
        xs: { maxWidth: 640 },
        sm: { minWidth: 641, maxWidth: 768 },
        md: { minWidth: 769, maxWidth: 1024 },
        lg: { minWidth: 1025, maxWidth: 1280 },
        xl: { minWidth: 1281, maxWidth: 1536 },
        xxl: { minWidth: 1537 },
      },
      aspectRatios: {
        portrait: { maxRatio: 0.75 },
        landscape: { minRatio: 1.33 },
        square: { minRatio: 0.9, maxRatio: 1.1 },
        ultrawide: { minRatio: 2.5 },
      },
      orientation: 'landscape',
      density: 'normal',
      interaction: 'mouse',
      complexity: 'moderate',
      adaptation: 'predictive',
    }}
  />
);

export const TabletOptimizedContainer: React.FC<Omit<ContainerQueryProps, 'config'>> = (props) => (
  <AdvancedContainerQueries
    {...props}
    config={{
      id: 'tablet-optimized',
      name: 'Tablet Optimized Container',
      description: 'Container optimized for tablet devices with hybrid interactions',
      breakpoints: {
        xs: { maxWidth: 640 },
        sm: { minWidth: 641, maxWidth: 768 },
        md: { minWidth: 769, maxWidth: 1024 },
        lg: { minWidth: 1025, maxWidth: 1280 },
        xl: { minWidth: 1281, maxWidth: 1536 },
        xxl: { minWidth: 1537 },
      },
      aspectRatios: {
        portrait: { maxRatio: 0.85 },
        landscape: { minRatio: 1.15 },
        square: { minRatio: 0.9, maxRatio: 1.1 },
        ultrawide: { minRatio: 1.8 },
      },
      orientation: 'adaptive',
      density: 'normal',
      interaction: 'hybrid',
      complexity: 'moderate',
      adaptation: 'intelligent',
    }}
  />
);

export default AdvancedContainerQueries;