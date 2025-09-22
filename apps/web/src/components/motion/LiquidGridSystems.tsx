import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { config } from '@/lib/env';

// Grid system types for different adaptive behaviors
export interface LiquidGridConfig {
  id: string;
  name: string;
  description: string;
  category: 'content' | 'navigation' | 'dashboard' | 'gallery' | 'cards' | 'list' | 'masonry' | 'magazine';
  adaptability: 'static' | 'responsive' | 'adaptive' | 'intelligent' | 'contextual' | 'emotional';
  flowBehavior: 'linear' | 'organic' | 'magnetic' | 'wave' | 'cascade' | 'spiral' | 'cluster' | 'scatter';
  density: 'sparse' | 'normal' | 'dense' | 'compact' | 'fluid';
  interaction: 'passive' | 'reactive' | 'proactive' | 'predictive' | 'emotional';
  animations?: string[];
}

export interface GridItem {
  id: string;
  content: React.ReactNode;
  priority: 'low' | 'medium' | 'high' | 'critical';
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  aspectRatio?: 'square' | 'portrait' | 'landscape' | 'wide' | 'auto';
  importance: 'background' | 'supporting' | 'featured' | 'hero';
  emotionalWeight: 'light' | 'moderate' | 'heavy' | 'profound';
  metadata?: Record<string, any>;
}

export interface LiquidGridSystemsProps {
  config: LiquidGridConfig;
  items: GridItem[];
  children?: React.ReactNode;
  columns?: number | 'auto' | 'responsive';
  rows?: number | 'auto' | 'responsive';
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'fluid';
  alignment?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  distribution?: 'packed' | 'spaced' | 'equal' | 'proportional' | 'weighted';
  animation?: 'subtle' | 'smooth' | 'liquid' | 'elastic' | 'magnetic' | 'organic';
  theme?: 'light' | 'dark' | 'colorful' | 'monochrome' | 'pastel' | 'vibrant' | 'elegant';
  variant?: 'static' | 'interactive' | 'adaptive' | 'intelligent' | 'emotional';
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  onItemResize?: (itemId: string, newSize: string) => void;
  onLayoutChange?: (layout: string, reason: string) => void;
  onItemFocus?: (itemId: string, item: GridItem) => void;
  onGridFlow?: (flowDirection: string, items: GridItem[]) => void;
}

interface GridCell {
  id: string;
  itemId: string;
  position: { x: number; y: number; width: number; height: number };
  targetPosition: { x: number; y: number; width: number; height: number };
  state: 'stable' | 'transitioning' | 'emphasized' | 'minimized' | 'hidden';
  connections: string[];
  flow: 'inbound' | 'outbound' | 'bidirectional' | 'none';
}

interface GridLayout {
  id: string;
  cells: GridCell[];
  dimensions: { width: number; height: number; columns: number; rows: number };
  flow: { direction: string; speed: number; pattern: string };
  adaptation: { trigger: string; response: string; timing: number };
  animations: string[];
  interactions: string[];
}

const LiquidGridSystems: React.FC<LiquidGridSystemsProps> = ({
  config,
  items,
  children,
  columns = 'responsive',
  rows = 'auto',
  gap = 'md',
  alignment = 'start',
  distribution = 'packed',
  animation = 'liquid',
  theme = 'elegant',
  variant = 'adaptive',
  className = '',
  style = {},
  disabled = false,
  onItemResize,
  onLayoutChange,
  onItemFocus,
  onGridFlow,
}) => {
  const [currentLayout, setCurrentLayout] = useState<GridLayout | null>(null);
  const [gridCells, setGridCells] = useState<GridCell[]>([]);
  const [isAdapting, setIsAdapting] = useState(false);
  const [flowDirection, setFlowDirection] = useState('none');
  const [activeConnections, setActiveConnections] = useState<Set<string>>(new Set());

  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Comprehensive grid configuration system
  const gridConfigs: Record<string, GridLayout> = {
    // Content Grid Systems
    'content-responsive': {
      id: 'content-responsive',
      cells: [],
      dimensions: { width: 100, height: 100, columns: 12, rows: 0 },
      flow: { direction: 'cascade', speed: 0.8, pattern: 'organic' },
      adaptation: { trigger: 'content-change', response: 'reflow', timing: 300 },
      animations: ['liquid-flow', 'content-shift', 'priority-scale'],
      interactions: ['hover-expand', 'focus-emphasize', 'drag-reorder'],
    },

    'dashboard-intelligent': {
      id: 'dashboard-intelligent',
      cells: [],
      dimensions: { width: 100, height: 100, columns: 8, rows: 6 },
      flow: { direction: 'magnetic', speed: 1.2, pattern: 'cluster' },
      adaptation: { trigger: 'user-behavior', response: 'reorganize', timing: 500 },
      animations: ['magnetic-pull', 'priority-glow', 'connection-pulse'],
      interactions: ['hover-preview', 'click-drilldown', 'focus-highlight'],
    },

    'gallery-adaptive': {
      id: 'gallery-adaptive',
      cells: [],
      dimensions: { width: 100, height: 100, columns: 0, rows: 0 },
      flow: { direction: 'wave', speed: 0.6, pattern: 'scatter' },
      adaptation: { trigger: 'viewport-resize', response: 'rebalance', timing: 200 },
      animations: ['wave-flow', 'masonry-shift', 'aspect-adapt'],
      interactions: ['hover-magnify', 'click-fullscreen', 'focus-navigate'],
    },

    'navigation-contextual': {
      id: 'navigation-contextual',
      cells: [],
      dimensions: { width: 100, height: 100, columns: 6, rows: 2 },
      flow: { direction: 'linear', speed: 1.0, pattern: 'cascade' },
      adaptation: { trigger: 'user-intent', response: 'reprioritize', timing: 150 },
      animations: ['navigation-flow', 'intent-glow', 'priority-shift'],
      interactions: ['hover-illuminate', 'click-activate', 'focus-navigate'],
    },

    'cards-emotional': {
      id: 'cards-emotional',
      cells: [],
      dimensions: { width: 100, height: 100, columns: 4, rows: 0 },
      flow: { direction: 'organic', speed: 0.7, pattern: 'cluster' },
      adaptation: { trigger: 'emotional-state', response: 'rebalance', timing: 400 },
      animations: ['emotional-pulse', 'connection-warmth', 'importance-breathing'],
      interactions: ['hover-empathize', 'click-connect', 'focus-support'],
    },

    'list-predictive': {
      id: 'list-predictive',
      cells: [],
      dimensions: { width: 100, height: 100, columns: 2, rows: 0 },
      flow: { direction: 'cascade', speed: 0.9, pattern: 'linear' },
      adaptation: { trigger: 'user-pattern', response: 'reorder', timing: 250 },
      animations: ['predictive-flow', 'relevance-glow', 'priority-scale'],
      interactions: ['hover-preview', 'click-advance', 'focus-accelerate'],
    },

    'masonry-fluid': {
      id: 'masonry-fluid',
      cells: [],
      dimensions: { width: 100, height: 100, columns: 0, rows: 0 },
      flow: { direction: 'wave', speed: 0.5, pattern: 'organic' },
      adaptation: { trigger: 'content-density', response: 'reflow', timing: 300 },
      animations: ['masonry-flow', 'density-adapt', 'aspect-preserve'],
      interactions: ['hover-lift', 'click-expand', 'focus-reveal'],
    },

    'magazine-editorial': {
      id: 'magazine-editorial',
      cells: [],
      dimensions: { width: 100, height: 100, columns: 6, rows: 0 },
      flow: { direction: 'spiral', speed: 0.8, pattern: 'organic' },
      adaptation: { trigger: 'reading-pattern', response: 'recompose', timing: 350 },
      animations: ['editorial-flow', 'reading-guide', 'emphasis-breathe'],
      interactions: ['hover-illuminate', 'click-immerse', 'focus-narrate'],
    },
  };

  // Get current grid configuration
  const getCurrentConfig = useCallback(() => {
    return gridConfigs[config.id] || gridConfigs['content-responsive'];
  }, [config.id]);

  // Calculate responsive grid dimensions
  const calculateGridDimensions = useCallback((containerWidth: number, containerHeight: number) => {
    const baseConfig = getCurrentConfig();
    let calculatedColumns = columns;
    let calculatedRows = rows;

    if (columns === 'responsive' || columns === 'auto') {
      if (containerWidth < 640) calculatedColumns = 2;
      else if (containerWidth < 768) calculatedColumns = 3;
      else if (containerWidth < 1024) calculatedColumns = 4;
      else if (containerWidth < 1280) calculatedColumns = 6;
      else calculatedColumns = 8;
    }

    if (rows === 'auto' || rows === 'responsive') {
      calculatedRows = Math.ceil(items.length / (calculatedColumns as number));
    }

    return {
      columns: calculatedColumns as number,
      rows: calculatedRows as number,
      cellWidth: containerWidth / (calculatedColumns as number),
      cellHeight: containerHeight / (calculatedRows as number),
    };
  }, [columns, rows, items.length, getCurrentConfig]);

  // Generate grid cells based on items and configuration
  const generateGridCells = useCallback(() => {
    const baseConfig = getCurrentConfig();
    const cells: GridCell[] = [];

    items.forEach((item, index) => {
      const priority = item.priority === 'critical' ? 4 : item.priority === 'high' ? 3 : item.priority === 'medium' ? 2 : 1;
      const importance = item.importance === 'hero' ? 4 : item.importance === 'featured' ? 3 : item.importance === 'supporting' ? 2 : 1;

      // Calculate position based on flow behavior
      let position = { x: 0, y: 0, width: 1, height: 1 };
      let targetPosition = { x: 0, y: 0, width: 1, height: 1 };

      switch (config.flowBehavior) {
        case 'linear':
          position = { x: index % 4, y: Math.floor(index / 4), width: 1, height: 1 };
          targetPosition = position;
          break;
        case 'organic':
          position = {
            x: (index * 1.618) % 4,
            y: (index * 0.618) % 3,
            width: 1 + (priority * 0.2),
            height: 1 + (importance * 0.2)
          };
          targetPosition = position;
          break;
        case 'magnetic':
          position = { x: 2, y: 2, width: 1, height: 1 };
          targetPosition = {
            x: 2 + (priority - 2) * 0.5,
            y: 2 + (importance - 2) * 0.5,
            width: 1 + (priority * 0.3),
            height: 1 + (importance * 0.3)
          };
          break;
        case 'wave':
          position = {
            x: index % 4,
            y: Math.floor(index / 4) + Math.sin(index * 0.5) * 0.5,
            width: 1,
            height: 1
          };
          targetPosition = position;
          break;
        case 'cascade':
          position = { x: index % 3, y: index * 0.5, width: 1, height: 1 };
          targetPosition = position;
          break;
        case 'spiral':
          const angle = index * 0.5;
          const radius = index * 0.3;
          position = {
            x: 2 + Math.cos(angle) * radius,
            y: 2 + Math.sin(angle) * radius,
            width: 1,
            height: 1
          };
          targetPosition = position;
          break;
        case 'cluster':
          position = {
            x: 2 + (Math.random() - 0.5) * 2,
            y: 2 + (Math.random() - 0.5) * 2,
            width: 1 + (priority * 0.2),
            height: 1 + (importance * 0.2)
          };
          targetPosition = position;
          break;
        case 'scatter':
          position = {
            x: Math.random() * 4,
            y: Math.random() * 3,
            width: 1,
            height: 1
          };
          targetPosition = position;
          break;
      }

      cells.push({
        id: `cell-${index}`,
        itemId: item.id,
        position,
        targetPosition,
        state: 'stable',
        connections: item.metadata?.connections || [],
        flow: 'none',
      });
    });

    return cells;
  }, [items, config.flowBehavior, getCurrentConfig]);

  // Initialize grid layout
  const initializeGrid = useCallback(() => {
    const baseConfig = getCurrentConfig();
    const cells = generateGridCells();

    setCurrentLayout({
      ...baseConfig,
      id: baseConfig?.id || 'default-grid',
      dimensions: baseConfig?.dimensions || { width: 100, height: 100, columns: 4, rows: 0 },
      flow: baseConfig?.flow || { direction: 'linear', speed: 1.0, pattern: 'organic' },
      adaptation: baseConfig?.adaptation || { trigger: 'content-change', response: 'reflow', timing: 300 },
      animations: baseConfig?.animations || ['liquid-flow'],
      interactions: baseConfig?.interactions || ['hover-expand'],
      cells,
    });

    setGridCells(cells);

    if (variant === 'adaptive' && !shouldReduceMotion) {
      setIsAdapting(true);
      onLayoutChange?.(baseConfig?.id || 'default-grid', 'initialization');

      // Staggered cell appearance
      cells.forEach((_, index) => {
        setTimeout(() => {
          setGridCells(prev =>
            prev.map(cell =>
              cell.id === `cell-${index}`
                ? { ...cell, state: 'stable' }
                : cell
            )
          );
        }, index * 50);
      });

      // Complete adaptation
      setTimeout(() => {
        setIsAdapting(false);
        onGridFlow?.('complete', items);
      }, cells.length * 50 + 200);
    }
  }, [getCurrentConfig, generateGridCells, variant, shouldReduceMotion, items, onLayoutChange, onGridFlow]);

  // Handle item interactions
  const handleItemInteraction = useCallback((itemId: string, interactionType: 'hover' | 'click' | 'focus') => {
    if (disabled) return;

    const item = items.find(i => i.id === itemId);
    if (!item) return;

    if (interactionType === 'click') {
      onItemFocus?.(itemId, item);
      setActiveConnections(new Set(item.metadata?.connections || []));
    } else if (interactionType === 'hover') {
      setFlowDirection('outbound');
    } else if (interactionType === 'focus') {
      setFlowDirection('inbound');
    }
  }, [disabled, items, onItemFocus]);

  // Animation configurations
  const animationConfigs = {
    'liquid-flow': {
      x: [0, 5, -5, 0],
      y: [0, -2, 2, 0],
      transition: { duration: 4, ease: 'easeInOut', repeat: Infinity },
    },
    'content-shift': {
      scale: [1, 1.02, 1],
      transition: { duration: 3, ease: 'easeInOut', repeat: Infinity },
    },
    'priority-scale': {
      scale: [1, 1.1, 1],
      opacity: [0.8, 1, 0.8],
      transition: { duration: 2, ease: 'easeInOut', repeat: Infinity },
    },
    'magnetic-pull': {
      scale: [1, 1.05, 1],
      transition: { duration: 2, ease: 'easeInOut', repeat: Infinity },
    },
    'priority-glow': {
      filter: [
        'drop-shadow(0 0 5px rgba(59, 130, 246, 0.5))',
        'drop-shadow(0 0 15px rgba(59, 130, 246, 0.8))',
        'drop-shadow(0 0 5px rgba(59, 130, 246, 0.5))',
      ],
      transition: { duration: 3, ease: 'easeInOut', repeat: Infinity },
    },
    'connection-pulse': {
      strokeWidth: [1, 3, 1],
      opacity: [0.5, 0.8, 0.5],
      transition: { duration: 2, ease: 'easeInOut', repeat: Infinity },
    },
    'wave-flow': {
      x: [0, 10, -10, 0],
      y: [0, -5, 5, 0],
      transition: { duration: 5, ease: 'easeInOut', repeat: Infinity },
    },
    'masonry-shift': {
      y: [0, -3, 0],
      transition: { duration: 4, ease: 'easeInOut', repeat: Infinity },
    },
    'aspect-adapt': {
      scale: [1, 1.02, 1],
      transition: { duration: 3, ease: 'easeInOut', repeat: Infinity },
    },
    'navigation-flow': {
      x: [0, 2, 0],
      transition: { duration: 2, ease: 'easeInOut', repeat: Infinity },
    },
    'intent-glow': {
      filter: [
        'drop-shadow(0 0 8px rgba(139, 92, 246, 0.6))',
        'drop-shadow(0 0 18px rgba(139, 92, 246, 0.9))',
        'drop-shadow(0 0 8px rgba(139, 92, 246, 0.6))',
      ],
      transition: { duration: 2, ease: 'easeInOut', repeat: Infinity },
    },
    'priority-shift': {
      scale: [1, 1.05, 1],
      transition: { duration: 1.5, ease: 'easeOut', repeat: Infinity },
    },
    'emotional-pulse': {
      scale: [1, 1.03, 1],
      opacity: [0.9, 1, 0.9],
      transition: { duration: 3, ease: 'easeInOut', repeat: Infinity },
    },
    'connection-warmth': {
      filter: [
        'drop-shadow(0 0 5px rgba(236, 72, 153, 0.4))',
        'drop-shadow(0 0 12px rgba(236, 72, 153, 0.7))',
        'drop-shadow(0 0 5px rgba(236, 72, 153, 0.4))',
      ],
      transition: { duration: 4, ease: 'easeInOut', repeat: Infinity },
    },
    'importance-breathing': {
      scale: [1, 1.02, 1],
      transition: { duration: 5, ease: 'easeInOut', repeat: Infinity },
    },
    'predictive-flow': {
      x: [0, 1, 0],
      opacity: [0.8, 1, 0.8],
      transition: { duration: 2, ease: 'easeInOut', repeat: Infinity },
    },
    'relevance-glow': {
      filter: [
        'drop-shadow(0 0 6px rgba(16, 185, 129, 0.5))',
        'drop-shadow(0 0 14px rgba(16, 185, 129, 0.8))',
        'drop-shadow(0 0 6px rgba(16, 185, 129, 0.5))',
      ],
      transition: { duration: 2.5, ease: 'easeInOut', repeat: Infinity },
    },
    'masonry-flow': {
      y: [0, -2, 0],
      transition: { duration: 6, ease: 'easeInOut', repeat: Infinity },
    },
    'density-adapt': {
      scale: [1, 1.01, 1],
      transition: { duration: 4, ease: 'easeInOut', repeat: Infinity },
    },
    'aspect-preserve': {
      scale: [1, 1.005, 1],
      transition: { duration: 8, ease: 'easeInOut', repeat: Infinity },
    },
    'editorial-flow': {
      x: [0, 3, 0],
      transition: { duration: 7, ease: 'easeInOut', repeat: Infinity },
    },
    'reading-guide': {
      opacity: [0.7, 1, 0.7],
      transition: { duration: 3, ease: 'easeInOut', repeat: Infinity },
    },
    'emphasis-breathe': {
      scale: [1, 1.02, 1],
      transition: { duration: 6, ease: 'easeInOut', repeat: Infinity },
    },
  };

  // Gap configurations
  const gapConfigs = {
    none: { x: 0, y: 0 },
    xs: { x: 4, y: 4 },
    sm: { x: 8, y: 8 },
    md: { x: 16, y: 16 },
    lg: { x: 24, y: 24 },
    xl: { x: 32, y: 32 },
    fluid: { x: 16, y: 16 }, // Will be calculated dynamically
  };

  const currentGap = gapConfigs[gap];

  // Initialize grid on mount and config change
  useEffect(() => {
    initializeGrid();
  }, [initializeGrid]);

  if (!currentLayout) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`liquid-grid-system ${className} ${isAdapting ? 'adapting' : ''} ${flowDirection}`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns === 'responsive' ? 'auto-fit' : columns}, minmax(200px, 1fr))`,
        gridTemplateRows: `repeat(${rows === 'auto' ? 'auto' : rows}, minmax(100px, 1fr))`,
        gap: `${currentGap.y}px ${currentGap.x}px`,
        alignItems: alignment,
        justifyContent: distribution === 'packed' ? 'start' : distribution === 'spaced' ? 'space-between' : 'center',
        width: '100%',
        height: '100%',
        position: 'relative',
        ...style,
      }}
    >
      {/* Grid cells */}
      {gridCells.map((cell, index) => {
        const item = items.find(i => i.id === cell.itemId);
        if (!item) return null;

        const isConnected = activeConnections.has(item.id);
        const isActive = flowDirection !== 'none';

        return (
          <motion.div
            key={cell.id}
            style={{
              gridColumn: `span ${Math.ceil(cell.position.width)}`,
              gridRow: `span ${Math.ceil(cell.position.height)}`,
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${theme === 'elegant' ? 'rgba(139, 92, 246, 0.1)' : theme === 'colorful' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(107, 114, 128, 0.05)'} 0%, transparent 100%)`,
              border: `1px solid ${isConnected ? 'rgba(59, 130, 246, 0.3)' : 'rgba(107, 114, 128, 0.1)'}`,
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: 1,
              ...(!shouldReduceMotion && animationConfigs[config.animations?.[0] as keyof typeof animationConfigs]),
            }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            onClick={() => handleItemInteraction(item.id, 'click')}
            onMouseEnter={() => handleItemInteraction(item.id, 'hover')}
            onFocus={() => handleItemInteraction(item.id, 'focus')}
            whileHover={shouldReduceMotion ? {} : {
              scale: 1.02,
              transition: { duration: 0.2 },
            }}
            whileTap={shouldReduceMotion ? {} : {
              scale: 0.98,
              transition: { duration: 0.1 },
            }}
          >
            {/* Item content */}
            <div
              style={{
                padding: '16px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {item.content}

              {/* Priority indicator */}
              {item.priority === 'high' || item.priority === 'critical' ? (
                <motion.div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: item.priority === 'critical' ? '#dc2626' : '#f59e0b',
                    border: '2px solid white',
                    boxShadow: '0 0 4px rgba(0, 0, 0, 0.2)',
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              ) : null}

              {/* Connection indicator */}
              {isConnected && (
                <motion.div
                  style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '8px',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#3b82f6',
                    border: '2px solid white',
                    boxShadow: '0 0 6px rgba(59, 130, 246, 0.5)',
                  }}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.6, 1, 0.6],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}
            </div>

            {/* Hover overlay */}
            <motion.div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                opacity: 0,
                pointerEvents: 'none',
              }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          </motion.div>
        );
      })}

      {/* Flow indicators */}
      <AnimatePresence>
        {!shouldReduceMotion && flowDirection !== 'none' && (
          <motion.div
            className="grid-flow-indicators"
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Flow particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                style={{
                  position: 'absolute',
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: 'rgba(59, 130, 246, 0.6)',
                  left: `${20 + i * 15}%`,
                  top: `${30 + (i % 2) * 40}%`,
                }}
                animate={{
                  x: flowDirection === 'outbound' ? [0, 20, 0] : [0, -20, 0],
                  y: [0, -10, 0],
                  opacity: [0.6, 1, 0.6],
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

      {/* Development info */}
      {config.isDev && (
        <div className="absolute -bottom-8 left-0 text-xs bg-black bg-opacity-50 text-white px-2 py-1 rounded">
          {config.name} • {config.flowBehavior} • {items.length} items
        </div>
      )}
    </div>
  );
};

// Preset liquid grid components for easy usage
export const ContentResponsiveGrid: React.FC<Omit<LiquidGridSystemsProps, 'config'>> = (props) => (
  <LiquidGridSystems
    {...props}
    config={{
      id: 'content-responsive',
      name: 'Content Responsive Grid',
      description: 'Responsive grid that adapts to content changes',
      category: 'content',
      adaptability: 'responsive',
      flowBehavior: 'organic',
      density: 'normal',
      interaction: 'reactive',
    }}
  />
);

export const DashboardIntelligentGrid: React.FC<Omit<LiquidGridSystemsProps, 'config'>> = (props) => (
  <LiquidGridSystems
    {...props}
    config={{
      id: 'dashboard-intelligent',
      name: 'Dashboard Intelligent Grid',
      description: 'Intelligent grid for dashboard layouts',
      category: 'dashboard',
      adaptability: 'intelligent',
      flowBehavior: 'magnetic',
      density: 'dense',
      interaction: 'proactive',
    }}
  />
);

export const GalleryAdaptiveGrid: React.FC<Omit<LiquidGridSystemsProps, 'config'>> = (props) => (
  <LiquidGridSystems
    {...props}
    config={{
      id: 'gallery-adaptive',
      name: 'Gallery Adaptive Grid',
      description: 'Adaptive grid for gallery and image layouts',
      category: 'gallery',
      adaptability: 'adaptive',
      flowBehavior: 'wave',
      density: 'sparse',
      interaction: 'reactive',
    }}
  />
);

export const NavigationContextualGrid: React.FC<Omit<LiquidGridSystemsProps, 'config'>> = (props) => (
  <LiquidGridSystems
    {...props}
    config={{
      id: 'navigation-contextual',
      name: 'Navigation Contextual Grid',
      description: 'Contextual grid for navigation elements',
      category: 'navigation',
      adaptability: 'contextual',
      flowBehavior: 'linear',
      density: 'compact',
      interaction: 'predictive',
    }}
  />
);

export const CardsEmotionalGrid: React.FC<Omit<LiquidGridSystemsProps, 'config'>> = (props) => (
  <LiquidGridSystems
    {...props}
    config={{
      id: 'cards-emotional',
      name: 'Cards Emotional Grid',
      description: 'Emotional grid for card-based layouts',
      category: 'cards',
      adaptability: 'emotional',
      flowBehavior: 'organic',
      density: 'normal',
      interaction: 'emotional',
    }}
  />
);

export default LiquidGridSystems;