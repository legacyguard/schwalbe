import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

// Grid pattern types for different contexts
export interface IconGridPattern {
  id: string;
  name: string;
  description: string;
  category: 'estate' | 'family' | 'security' | 'documents' | 'timeline' | 'relationships' | 'protection' | 'legacy';
  complexity: 'simple' | 'moderate' | 'complex' | 'advanced';
  emotionalTone: 'calm' | 'warm' | 'protective' | 'elegant' | 'confident' | 'contemplative';
  visualStyle: 'grid' | 'cluster' | 'flow' | 'organic' | 'geometric' | 'radial' | 'spiral' | 'wave' | 'circular' | 'timeline' | 'force-directed';
  animations?: string[];
}

export interface IconGridItem {
  id: string;
  iconType: string;
  label: string;
  description?: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
  state: 'active' | 'inactive' | 'loading' | 'complete' | 'error' | 'warning' | 'disabled';
  position: { x: number; y: number };
  connections?: string[]; // IDs of connected items
  metadata?: Record<string, any>;
}

export interface InteractiveIconGridsProps {
  pattern: IconGridPattern;
  items: IconGridItem[];
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  animation?: 'subtle' | 'moderate' | 'expressive' | 'dramatic' | 'organic' | 'geometric' | 'flowing';
  theme?: 'light' | 'dark' | 'colorful' | 'monochrome' | 'pastel' | 'vibrant' | 'elegant' | 'minimal';
  variant?: 'static' | 'interactive' | 'responsive' | 'adaptive' | 'magnetic' | 'breathing';
  layout?: 'grid' | 'masonry' | 'circular' | 'organic' | 'force-directed' | 'timeline' | 'relationship';
  spacing?: 'tight' | 'normal' | 'loose' | 'adaptive';
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  onItemClick?: (item: IconGridItem, index: number) => void;
  onItemHover?: (item: IconGridItem, index: number) => void;
  onPatternChange?: (pattern: IconGridPattern) => void;
  onLayoutChange?: (layout: string) => void;
  onConnection?: (fromItem: IconGridItem, toItem: IconGridItem) => void;
}

interface GridLayout {
  type: string;
  positions: Array<{ x: number; y: number; scale: number; rotation: number }>;
  connections: Array<{ from: number; to: number; strength: number }>;
  animations: string[];
  interactions: string[];
}

interface PatternAnimation {
  name: string;
  duration: number;
  easing: string;
  properties: Record<string, any>;
}

const InteractiveIconGrids: React.FC<InteractiveIconGridsProps> = ({
  pattern,
  items,
  children,
  size = 'md',
  animation = 'moderate',
  theme = 'elegant',
  variant = 'interactive',
  layout = 'grid',
  spacing = 'normal',
  className = '',
  style = {},
  disabled = false,
  onItemClick,
  onItemHover,
  onPatternChange,
  onLayoutChange,
  onConnection,
}) => {
  const [currentLayout, setCurrentLayout] = useState<GridLayout | null>(null);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [connectedItems, setConnectedItems] = useState<Set<string>>(new Set());
  const [isAnimating, setIsAnimating] = useState(false);
  const [gridState, setGridState] = useState('idle');

  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Comprehensive pattern-to-layout mapping system
  const patternLayouts: Record<string, GridLayout> = {
    // Estate Planning Patterns
    'estate-documents': {
      type: 'grid',
      positions: [
        { x: 20, y: 20, scale: 1, rotation: 0 },
        { x: 50, y: 20, scale: 1, rotation: 0 },
        { x: 80, y: 20, scale: 1, rotation: 0 },
        { x: 20, y: 50, scale: 1, rotation: 0 },
        { x: 50, y: 50, scale: 1.2, rotation: 0 },
        { x: 80, y: 50, scale: 1, rotation: 0 },
        { x: 20, y: 80, scale: 1, rotation: 0 },
        { x: 50, y: 80, scale: 1, rotation: 0 },
        { x: 80, y: 80, scale: 1, rotation: 0 },
      ],
      connections: [
        { from: 4, to: 0, strength: 0.8 },
        { from: 4, to: 1, strength: 0.8 },
        { from: 4, to: 2, strength: 0.8 },
        { from: 4, to: 3, strength: 0.8 },
        { from: 4, to: 5, strength: 0.8 },
        { from: 4, to: 6, strength: 0.8 },
        { from: 4, to: 7, strength: 0.8 },
        { from: 4, to: 8, strength: 0.8 },
      ],
      animations: ['document-flow', 'importance-pulse', 'connection-glow'],
      interactions: ['hover-expand', 'click-activate', 'focus-connect'],
    },

    'family-relationships': {
      type: 'circular',
      positions: [
        { x: 50, y: 30, scale: 1.3, rotation: 0 }, // Central family member
        { x: 25, y: 50, scale: 1, rotation: -15 },
        { x: 75, y: 50, scale: 1, rotation: 15 },
        { x: 15, y: 75, scale: 0.9, rotation: -30 },
        { x: 50, y: 85, scale: 0.9, rotation: 0 },
        { x: 85, y: 75, scale: 0.9, rotation: 30 },
        { x: 35, y: 15, scale: 0.8, rotation: -45 },
        { x: 65, y: 15, scale: 0.8, rotation: 45 },
      ],
      connections: [
        { from: 0, to: 1, strength: 1 },
        { from: 0, to: 2, strength: 1 },
        { from: 0, to: 3, strength: 0.9 },
        { from: 0, to: 4, strength: 0.9 },
        { from: 0, to: 5, strength: 0.9 },
        { from: 0, to: 6, strength: 0.8 },
        { from: 0, to: 7, strength: 0.8 },
        { from: 1, to: 3, strength: 0.7 },
        { from: 2, to: 5, strength: 0.7 },
      ],
      animations: ['family-pulse', 'relationship-flow', 'bond-breathing'],
      interactions: ['hover-warm', 'click-connect', 'focus-strengthen'],
    },

    'security-layers': {
      type: 'organic',
      positions: [
        { x: 50, y: 50, scale: 1.4, rotation: 0 }, // Core security
        { x: 50, y: 50, scale: 1.2, rotation: 0 }, // Inner layer
        { x: 50, y: 50, scale: 1, rotation: 0 },   // Middle layer
        { x: 50, y: 50, scale: 0.8, rotation: 0 }, // Outer layer
        { x: 30, y: 30, scale: 0.6, rotation: 45 },
        { x: 70, y: 30, scale: 0.6, rotation: -45 },
        { x: 30, y: 70, scale: 0.6, rotation: -45 },
        { x: 70, y: 70, scale: 0.6, rotation: 45 },
      ],
      connections: [
        { from: 0, to: 1, strength: 1 },
        { from: 1, to: 2, strength: 1 },
        { from: 2, to: 3, strength: 1 },
        { from: 3, to: 4, strength: 0.8 },
        { from: 3, to: 5, strength: 0.8 },
        { from: 3, to: 6, strength: 0.8 },
        { from: 3, to: 7, strength: 0.8 },
      ],
      animations: ['security-pulse', 'layer-rotation', 'protection-glow'],
      interactions: ['hover-scan', 'click-verify', 'focus-fortify'],
    },

    'timeline-progression': {
      type: 'timeline',
      positions: [
        { x: 10, y: 50, scale: 0.8, rotation: 0 },
        { x: 25, y: 50, scale: 0.9, rotation: 0 },
        { x: 40, y: 50, scale: 1, rotation: 0 },
        { x: 55, y: 50, scale: 1.1, rotation: 0 },
        { x: 70, y: 50, scale: 1, rotation: 0 },
        { x: 85, y: 50, scale: 0.9, rotation: 0 },
      ],
      connections: [
        { from: 0, to: 1, strength: 0.9 },
        { from: 1, to: 2, strength: 0.9 },
        { from: 2, to: 3, strength: 1 },
        { from: 3, to: 4, strength: 0.9 },
        { from: 4, to: 5, strength: 0.9 },
      ],
      animations: ['timeline-flow', 'progress-pulse', 'milestone-glow'],
      interactions: ['hover-preview', 'click-advance', 'focus-navigate'],
    },

    'legacy-web': {
      type: 'force-directed',
      positions: [
        { x: 50, y: 40, scale: 1.3, rotation: 0 }, // Central legacy
        { x: 20, y: 20, scale: 0.9, rotation: -20 },
        { x: 80, y: 20, scale: 0.9, rotation: 20 },
        { x: 20, y: 60, scale: 0.8, rotation: -10 },
        { x: 80, y: 60, scale: 0.8, rotation: 10 },
        { x: 50, y: 10, scale: 0.7, rotation: 0 },
        { x: 50, y: 70, scale: 0.7, rotation: 0 },
        { x: 10, y: 40, scale: 0.6, rotation: -30 },
        { x: 90, y: 40, scale: 0.6, rotation: 30 },
      ],
      connections: [
        { from: 0, to: 1, strength: 0.8 },
        { from: 0, to: 2, strength: 0.8 },
        { from: 0, to: 3, strength: 0.7 },
        { from: 0, to: 4, strength: 0.7 },
        { from: 0, to: 5, strength: 0.6 },
        { from: 0, to: 6, strength: 0.6 },
        { from: 0, to: 7, strength: 0.5 },
        { from: 0, to: 8, strength: 0.5 },
        { from: 1, to: 2, strength: 0.4 },
        { from: 3, to: 4, strength: 0.4 },
      ],
      animations: ['legacy-web-flow', 'connection-pulse', 'heritage-glow'],
      interactions: ['hover-illuminate', 'click-explore', 'focus-preserve'],
    },

    'protection-shield': {
      type: 'radial',
      positions: [
        { x: 50, y: 50, scale: 1.5, rotation: 0 }, // Central protection
        { x: 50, y: 25, scale: 0.8, rotation: 0 },
        { x: 75, y: 35, scale: 0.8, rotation: 30 },
        { x: 85, y: 55, scale: 0.8, rotation: 60 },
        { x: 75, y: 75, scale: 0.8, rotation: 90 },
        { x: 50, y: 85, scale: 0.8, rotation: 120 },
        { x: 25, y: 75, scale: 0.8, rotation: 150 },
        { x: 15, y: 55, scale: 0.8, rotation: 180 },
        { x: 25, y: 35, scale: 0.8, rotation: 210 },
      ],
      connections: [
        { from: 0, to: 1, strength: 1 },
        { from: 0, to: 2, strength: 1 },
        { from: 0, to: 3, strength: 1 },
        { from: 0, to: 4, strength: 1 },
        { from: 0, to: 5, strength: 1 },
        { from: 0, to: 6, strength: 1 },
        { from: 0, to: 7, strength: 1 },
        { from: 0, to: 8, strength: 1 },
        { from: 1, to: 2, strength: 0.8 },
        { from: 2, to: 3, strength: 0.8 },
        { from: 3, to: 4, strength: 0.8 },
        { from: 4, to: 5, strength: 0.8 },
        { from: 5, to: 6, strength: 0.8 },
        { from: 6, to: 7, strength: 0.8 },
        { from: 7, to: 8, strength: 0.8 },
        { from: 8, to: 1, strength: 0.8 },
      ],
      animations: ['shield-formation', 'protection-pulse', 'layer-rotation'],
      interactions: ['hover-reinforce', 'click-fortify', 'focus-protect'],
    },

    'document-cluster': {
      type: 'cluster',
      positions: [
        { x: 45, y: 45, scale: 1.2, rotation: 0 }, // Main document
        { x: 30, y: 30, scale: 0.9, rotation: -10 },
        { x: 60, y: 25, scale: 0.8, rotation: 15 },
        { x: 70, y: 45, scale: 0.9, rotation: -5 },
        { x: 65, y: 65, scale: 0.8, rotation: 20 },
        { x: 45, y: 70, scale: 0.9, rotation: -15 },
        { x: 25, y: 65, scale: 0.8, rotation: 25 },
        { x: 20, y: 45, scale: 0.9, rotation: -20 },
      ],
      connections: [
        { from: 0, to: 1, strength: 0.9 },
        { from: 0, to: 2, strength: 0.8 },
        { from: 0, to: 3, strength: 0.9 },
        { from: 0, to: 4, strength: 0.8 },
        { from: 0, to: 5, strength: 0.9 },
        { from: 0, to: 6, strength: 0.8 },
        { from: 0, to: 7, strength: 0.9 },
        { from: 1, to: 7, strength: 0.6 },
        { from: 2, to: 3, strength: 0.6 },
        { from: 4, to: 5, strength: 0.6 },
        { from: 6, to: 7, strength: 0.6 },
      ],
      animations: ['document-cluster', 'importance-scale', 'connection-flow'],
      interactions: ['hover-organize', 'click-categorize', 'focus-prioritize'],
    },

    'preparation-flow': {
      type: 'flow',
      positions: [
        { x: 15, y: 50, scale: 0.9, rotation: 0 }, // Start
        { x: 30, y: 40, scale: 0.8, rotation: 5 },
        { x: 45, y: 35, scale: 1, rotation: 0 },
        { x: 60, y: 45, scale: 1.1, rotation: -5 },
        { x: 75, y: 55, scale: 0.9, rotation: 10 },
        { x: 90, y: 50, scale: 1.2, rotation: 0 }, // End
      ],
      connections: [
        { from: 0, to: 1, strength: 0.9 },
        { from: 1, to: 2, strength: 0.9 },
        { from: 2, to: 3, strength: 1 },
        { from: 3, to: 4, strength: 0.9 },
        { from: 4, to: 5, strength: 0.9 },
      ],
      animations: ['preparation-flow', 'progress-markers', 'guidance-glow'],
      interactions: ['hover-guide', 'click-advance', 'focus-validate'],
    },
  };

  // Get current layout configuration
  const getCurrentLayout = useCallback(() => {
    return patternLayouts[pattern.id] || patternLayouts['estate-documents'];
  }, [pattern.id]);

  // Initialize grid layout
  const initializeGrid = useCallback(() => {
    const layout = getCurrentLayout();
    if (!layout) return;

    setCurrentLayout(layout);

    if (variant === 'interactive' && !shouldReduceMotion) {
      setIsAnimating(true);
      onPatternChange?.(pattern);

      // Staggered item appearance
      items.forEach((_, index) => {
        setTimeout(() => {
          setGridState(`item-${index}-active`);
        }, index * 100);
      });

      // Complete initialization
      setTimeout(() => {
        setIsAnimating(false);
        onLayoutChange?.(layout.type);
      }, items.length * 100 + 500);
    }
  }, [getCurrentLayout, pattern, variant, shouldReduceMotion, items.length, onPatternChange, onLayoutChange]);

  // Handle item interactions
  const handleItemInteraction = useCallback((item: IconGridItem, index: number, interactionType: 'click' | 'hover' | 'focus') => {
    if (disabled) return;

    setActiveItem(item.id);

    if (interactionType === 'click') {
      onItemClick?.(item, index);
      setGridState('item-selected');

      // Trigger connection effects
      if (item.connections) {
        setConnectedItems(new Set(item.connections));
        onConnection?.(item, items.find(i => i.id === item.connections?.[0]) || item);
      }
    } else if (interactionType === 'hover') {
      setHoveredItem(item.id);
      onItemHover?.(item, index);
      setGridState('item-hovered');
    }
  }, [disabled, onItemClick, onItemHover, onConnection, items]);

  // Animation configurations
  const animationConfigs = {
    'document-flow': {
      x: [0, 5, -5, 0],
      y: [0, -3, 3, 0],
      transition: { duration: 4, ease: 'easeInOut', repeat: Infinity },
    },
    'importance-pulse': {
      scale: [1, 1.1, 1],
      opacity: [0.8, 1, 0.8],
      transition: { duration: 2, ease: 'easeInOut', repeat: Infinity },
    },
    'connection-glow': {
      filter: [
        'drop-shadow(0 0 5px rgba(59, 130, 246, 0.5))',
        'drop-shadow(0 0 15px rgba(59, 130, 246, 0.8))',
        'drop-shadow(0 0 5px rgba(59, 130, 246, 0.5))',
      ],
      transition: { duration: 3, ease: 'easeInOut', repeat: Infinity },
    },
    'family-pulse': {
      scale: [1, 1.05, 1],
      transition: { duration: 3, ease: 'easeInOut', repeat: Infinity },
    },
    'relationship-flow': {
      pathLength: [0, 1],
      opacity: [0.6, 0.9, 0.6],
      transition: { duration: 4, ease: 'easeInOut', repeat: Infinity },
    },
    'bond-breathing': {
      scale: [1, 1.03, 1],
      opacity: [0.8, 0.9, 0.8],
      transition: { duration: 5, ease: 'easeInOut', repeat: Infinity },
    },
    'security-pulse': {
      scale: [1, 1.02, 1],
      rotate: [0, 1, -1, 0],
      transition: { duration: 2, ease: 'easeInOut', repeat: Infinity },
    },
    'layer-rotation': {
      rotate: 360,
      transition: { duration: 20, ease: 'linear', repeat: Infinity },
    },
    'protection-glow': {
      filter: [
        'drop-shadow(0 0 8px rgba(16, 185, 129, 0.6))',
        'drop-shadow(0 0 20px rgba(16, 185, 129, 0.9))',
        'drop-shadow(0 0 8px rgba(16, 185, 129, 0.6))',
      ],
      transition: { duration: 2.5, ease: 'easeInOut', repeat: Infinity },
    },
    'timeline-flow': {
      pathLength: [0, 1],
      transition: { duration: 6, ease: 'easeInOut' },
    },
    'progress-pulse': {
      scale: [1, 1.15, 1],
      opacity: [0.7, 1, 0.7],
      transition: { duration: 1.5, ease: 'easeOut', repeat: Infinity },
    },
    'milestone-glow': {
      filter: [
        'drop-shadow(0 0 10px rgba(245, 158, 11, 0.7))',
        'drop-shadow(0 0 25px rgba(245, 158, 11, 1))',
        'drop-shadow(0 0 10px rgba(245, 158, 11, 0.7))',
      ],
      transition: { duration: 2, ease: 'easeInOut', repeat: Infinity },
    },
    'legacy-web-flow': {
      scale: [1, 1.02, 1],
      transition: { duration: 8, ease: 'easeInOut', repeat: Infinity },
    },
    'connection-pulse': {
      strokeWidth: [1, 3, 1],
      opacity: [0.5, 0.8, 0.5],
      transition: { duration: 3, ease: 'easeInOut', repeat: Infinity },
    },
    'heritage-glow': {
      filter: [
        'drop-shadow(0 0 5px rgba(139, 92, 246, 0.5))',
        'drop-shadow(0 0 15px rgba(139, 92, 246, 0.8))',
        'drop-shadow(0 0 5px rgba(139, 92, 246, 0.5))',
      ],
      transition: { duration: 4, ease: 'easeInOut', repeat: Infinity },
    },
    'shield-formation': {
      scale: [0.8, 1, 1.1, 1],
      transition: { duration: 1.5, ease: 'easeOut' },
    },
    'document-cluster': {
      x: [0, 2, -2, 0],
      y: [0, -1, 1, 0],
      transition: { duration: 6, ease: 'easeInOut', repeat: Infinity },
    },
    'importance-scale': {
      scale: [1, 1.1, 1],
      transition: { duration: 2, ease: 'easeInOut', repeat: Infinity },
    },
    'preparation-flow': {
      pathLength: [0, 1],
      opacity: [0.6, 1, 0.6],
      transition: { duration: 5, ease: 'easeInOut', repeat: Infinity },
    },
    'progress-markers': {
      scale: [1, 1.2, 1],
      opacity: [0.8, 1, 0.8],
      transition: { duration: 1.5, ease: 'easeOut', repeat: Infinity },
    },
    'guidance-glow': {
      filter: [
        'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))',
        'drop-shadow(0 0 18px rgba(59, 130, 246, 0.9))',
        'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))',
      ],
      transition: { duration: 3, ease: 'easeInOut', repeat: Infinity },
    },
  };

  // Size configurations
  const sizeConfigs = {
    sm: { width: 200, height: 200 },
    md: { width: 300, height: 300 },
    lg: { width: 400, height: 400 },
    xl: { width: 500, height: 500 },
    hero: { width: 600, height: 600 },
  };

  const currentSize = sizeConfigs[size];

  // Initialize grid on mount and pattern change
  useEffect(() => {
    initializeGrid();
  }, [initializeGrid]);

  if (!currentLayout) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`interactive-icon-grid ${className} ${isAnimating ? 'animating' : ''} ${gridState}`}
      style={{
        width: currentSize.width,
        height: currentSize.height,
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style,
      }}
    >
      {/* Grid background pattern */}
      <svg
        width={currentSize.width}
        height={currentSize.height}
        viewBox="0 0 100 100"
        style={{ position: 'absolute', inset: 0 }}
      >
        <defs>
          {/* Connection gradients */}
          <linearGradient id="connection-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.6)" />
            <stop offset="50%" stopColor="rgba(139, 92, 246, 0.8)" />
            <stop offset="100%" stopColor="rgba(16, 185, 129, 0.6)" />
          </linearGradient>

          {/* Grid pattern */}
          <pattern id="grid-pattern" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(107, 114, 128, 0.1)" strokeWidth="0.5"/>
          </pattern>
        </defs>

        {/* Background grid */}
        <rect width="100" height="100" fill="url(#grid-pattern)" opacity="0.3" />

        {/* Connection lines */}
        {currentLayout.connections.map((connection, index) => {
          const fromItem = items[connection.from];
          const toItem = items[connection.to];
          if (!fromItem || !toItem) return null;

          const fromPos = currentLayout.positions[connection.from];
          const toPos = currentLayout.positions[connection.to];

          if (!fromPos || !toPos) return null;

          return (
            <motion.line
              key={`connection-${index}`}
              x1={fromPos.x}
              y1={fromPos.y}
              x2={toPos.x}
              y2={toPos.y}
              stroke="url(#connection-gradient)"
              strokeWidth={connection.strength * 2}
              opacity={connectedItems.has(fromItem.id) || connectedItems.has(toItem.id) ? 0.8 : 0.3}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: index * 0.1 }}
            />
          );
        })}
      </svg>

      {/* Icon items */}
      {items.map((item, index) => {
        const position = currentLayout.positions[index];
        if (!position) return null;

        const isActive = activeItem === item.id;
        const isHovered = hoveredItem === item.id;
        const isConnected = connectedItems.has(item.id);

        return (
          <motion.div
            key={item.id}
            style={{
              position: 'absolute',
              left: `${position.x}%`,
              top: `${position.y}%`,
              transform: `translate(-50%, -50%) scale(${position.scale}) rotate(${position.rotation}deg)`,
              zIndex: isActive ? 10 : isHovered ? 5 : 1,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: isActive ? 1.2 : isHovered ? 1.1 : 1,
              opacity: 1,
              ...(!shouldReduceMotion && pattern.animations && animationConfigs[pattern.animations[0] as keyof typeof animationConfigs]),
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={() => handleItemInteraction(item, index, 'click')}
            onMouseEnter={() => handleItemInteraction(item, index, 'hover')}
            onFocus={() => handleItemInteraction(item, index, 'focus')}
          >
            {/* Icon representation */}
            <motion.div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${item.state === 'active' ? 'rgba(16, 185, 129, 0.9)' : item.state === 'complete' ? 'rgba(34, 197, 94, 0.9)' : item.state === 'error' ? 'rgba(239, 68, 68, 0.9)' : item.state === 'warning' ? 'rgba(245, 158, 11, 0.9)' : 'rgba(107, 114, 128, 0.8)'} 0%, transparent 70%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold',
                boxShadow: isActive ? '0 0 20px rgba(16, 185, 129, 0.5)' : isHovered ? '0 0 15px rgba(59, 130, 246, 0.4)' : '0 0 5px rgba(0, 0, 0, 0.1)',
              }}
              whileHover={shouldReduceMotion ? {} : { scale: 1.1 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
            >
              {item.iconType.charAt(0).toUpperCase()}
            </motion.div>

            {/* Item label */}
            <motion.div
              style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginTop: '8px',
                padding: '4px 8px',
                background: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                borderRadius: '4px',
                fontSize: '12px',
                whiteSpace: 'nowrap',
                opacity: isHovered || isActive ? 1 : 0,
                pointerEvents: 'none',
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: isHovered || isActive ? 1 : 0, y: isHovered || isActive ? 0 : -10 }}
              transition={{ duration: 0.2 }}
            >
              {item.label}
            </motion.div>

            {/* Importance indicator */}
            {item.importance === 'high' || item.importance === 'critical' ? (
              <motion.div
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: item.importance === 'critical' ? '#dc2626' : '#f59e0b',
                  border: '2px solid white',
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
          </motion.div>
        );
      })}

      {/* Atmospheric effects */}
      <AnimatePresence>
        {!shouldReduceMotion && (isAnimating || gridState !== 'idle') && (
          <motion.div
            className="grid-atmosphere"
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background: `radial-gradient(circle at 50% 50%, ${pattern.emotionalTone === 'protective' ? 'rgba(16, 185, 129, 0.05)' : pattern.emotionalTone === 'warm' ? 'rgba(236, 72, 153, 0.05)' : pattern.emotionalTone === 'elegant' ? 'rgba(139, 92, 246, 0.05)' : 'rgba(59, 130, 246, 0.05)'} 0%, transparent 70%)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Floating particles */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                style={{
                  position: 'absolute',
                  width: '3px',
                  height: '3px',
                  borderRadius: '50%',
                  background: 'currentColor',
                  left: `${15 + i * 10}%`,
                  top: `${20 + (i % 3) * 25}%`,
                  opacity: 0.4,
                }}
                animate={{
                  y: [0, -15, 0],
                  x: [0, 5, 0],
                  opacity: [0.4, 0.7, 0.4],
                }}
                transition={{
                  duration: 4 + i * 0.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.3,
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Development info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute -bottom-8 left-0 text-xs bg-black bg-opacity-50 text-white px-2 py-1 rounded">
          {pattern.name} • {currentLayout.type} • {items.length} items
        </div>
      )}
    </div>
  );
};

// Preset interactive grid components for easy usage
export const EstateDocumentsGrid: React.FC<Omit<InteractiveIconGridsProps, 'pattern'>> = (props) => (
  <InteractiveIconGrids
    {...props}
    pattern={{
      id: 'estate-documents',
      name: 'Estate Documents',
      description: 'Grid layout for estate planning documents',
      category: 'documents',
      complexity: 'moderate',
      emotionalTone: 'elegant',
      visualStyle: 'grid',
    }}
  />
);

export const FamilyRelationshipsGrid: React.FC<Omit<InteractiveIconGridsProps, 'pattern'>> = (props) => (
  <InteractiveIconGrids
    {...props}
    pattern={{
      id: 'family-relationships',
      name: 'Family Relationships',
      description: 'Circular layout representing family connections',
      category: 'family',
      complexity: 'moderate',
      emotionalTone: 'warm',
      visualStyle: 'circular',
    }}
  />
);

export const SecurityLayersGrid: React.FC<Omit<InteractiveIconGridsProps, 'pattern'>> = (props) => (
  <InteractiveIconGrids
    {...props}
    pattern={{
      id: 'security-layers',
      name: 'Security Layers',
      description: 'Layered security representation',
      category: 'security',
      complexity: 'complex',
      emotionalTone: 'protective',
      visualStyle: 'organic',
    }}
  />
);

export const TimelineProgressionGrid: React.FC<Omit<InteractiveIconGridsProps, 'pattern'>> = (props) => (
  <InteractiveIconGrids
    {...props}
    pattern={{
      id: 'timeline-progression',
      name: 'Timeline Progression',
      description: 'Linear timeline for planning progress',
      category: 'timeline',
      complexity: 'simple',
      emotionalTone: 'confident',
      visualStyle: 'timeline',
    }}
  />
);

export const LegacyWebGrid: React.FC<Omit<InteractiveIconGridsProps, 'pattern'>> = (props) => (
  <InteractiveIconGrids
    {...props}
    pattern={{
      id: 'legacy-web',
      name: 'Legacy Web',
      description: 'Complex web of legacy connections',
      category: 'legacy',
      complexity: 'advanced',
      emotionalTone: 'contemplative',
      visualStyle: 'force-directed',
    }}
  />
);

export const ProtectionShieldGrid: React.FC<Omit<InteractiveIconGridsProps, 'pattern'>> = (props) => (
  <InteractiveIconGrids
    {...props}
    pattern={{
      id: 'protection-shield',
      name: 'Protection Shield',
      description: 'Radial protection pattern',
      category: 'protection',
      complexity: 'moderate',
      emotionalTone: 'protective',
      visualStyle: 'radial',
    }}
  />
);

export default InteractiveIconGrids;