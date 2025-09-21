import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

interface SmartTooltipsProps {
  children: React.ReactNode;
  content: string | React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end' | 'auto';
  trigger?: 'hover' | 'click' | 'focus' | 'contextmenu';
  delay?: number;
  duration?: number;
  offset?: number;
  variant?: 'default' | 'info' | 'success' | 'warning' | 'error' | 'premium' | 'glass' | 'minimal';
  size?: 'small' | 'medium' | 'large' | 'auto';
  interactive?: boolean;
  followCursor?: boolean;
  showArrow?: boolean;
  arrowSize?: number;
  maxWidth?: number;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  onShow?: () => void;
  onHide?: () => void;
  onPositionChange?: (position: string) => void;
}

interface TooltipPosition {
  top: number;
  left: number;
  position: string;
  arrowTop?: number;
  arrowLeft?: number;
}

interface TooltipVariant {
  background: string;
  textColor: string;
  borderColor?: string;
  shadow: string;
  backdropFilter?: string;
}

const SmartTooltips: React.FC<SmartTooltipsProps> = ({
  children,
  content,
  position = 'auto',
  trigger = 'hover',
  delay = 300,
  duration = 200,
  offset = 8,
  variant = 'default',
  size = 'medium',
  interactive = false,
  followCursor = false,
  showArrow = true,
  arrowSize = 6,
  maxWidth = 280,
  className = '',
  style = {},
  disabled = false,
  onShow,
  onHide,
  onPositionChange,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({
    top: 0,
    left: 0,
    position: 'top',
  });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const shouldReduceMotion = useReducedMotion();

  // Variant configurations
  const variantConfigs: Record<string, TooltipVariant> = {
    default: {
      background: 'rgba(0, 0, 0, 0.9)',
      textColor: '#ffffff',
      shadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    },
    info: {
      background: 'rgba(59, 130, 246, 0.95)',
      textColor: '#ffffff',
      shadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
    },
    success: {
      background: 'rgba(34, 197, 94, 0.95)',
      textColor: '#ffffff',
      shadow: '0 4px 20px rgba(34, 197, 94, 0.4)',
    },
    warning: {
      background: 'rgba(245, 158, 11, 0.95)',
      textColor: '#ffffff',
      shadow: '0 4px 20px rgba(245, 158, 11, 0.4)',
    },
    error: {
      background: 'rgba(239, 68, 68, 0.95)',
      textColor: '#ffffff',
      shadow: '0 4px 20px rgba(239, 68, 68, 0.4)',
    },
    premium: {
      background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.95), rgba(59, 130, 246, 0.95))',
      textColor: '#ffffff',
      shadow: '0 8px 32px rgba(147, 51, 234, 0.4)',
    },
    glass: {
      background: 'rgba(255, 255, 255, 0.1)',
      textColor: '#ffffff',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      shadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      backdropFilter: 'blur(16px)',
    },
    minimal: {
      background: 'rgba(255, 255, 255, 0.95)',
      textColor: '#374151',
      borderColor: 'rgba(0, 0, 0, 0.1)',
      shadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
  };

  // Size configurations
  const sizeConfigs = {
    small: { padding: '6px 10px', fontSize: '12px', maxWidth: 200 },
    medium: { padding: '8px 12px', fontSize: '14px', maxWidth: 280 },
    large: { padding: '12px 16px', fontSize: '16px', maxWidth: 320 },
    auto: { padding: '8px 12px', fontSize: '14px', maxWidth: maxWidth },
  };

  const currentVariant = variantConfigs[variant] || variantConfigs.default;
  const currentSize = sizeConfigs[size];

  // Calculate optimal tooltip position
  const calculatePosition = useCallback((): TooltipPosition => {
    if (!triggerRef.current || !tooltipRef.current) {
      return { top: 0, left: 0, position: 'top' };
    }

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const positions = [
      'top',
      'bottom',
      'left',
      'right',
      'top-start',
      'top-end',
      'bottom-start',
      'bottom-end',
      'left-start',
      'left-end',
      'right-start',
      'right-end',
    ];

    let bestPosition = 'top';
    let bestScore = -Infinity;

    for (const pos of positions) {
      let top = 0;
      let left = 0;
      let arrowTop = 0;
      let arrowLeft = 0;

      switch (pos) {
        case 'top':
          top = triggerRect.top - tooltipRect.height - offset;
          left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
          arrowTop = tooltipRect.height - 1;
          arrowLeft = tooltipRect.width / 2 - arrowSize;
          break;
        case 'bottom':
          top = triggerRect.bottom + offset;
          left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
          arrowTop = -arrowSize + 1;
          arrowLeft = tooltipRect.width / 2 - arrowSize;
          break;
        case 'left':
          top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
          left = triggerRect.left - tooltipRect.width - offset;
          arrowTop = tooltipRect.height / 2 - arrowSize;
          arrowLeft = tooltipRect.width - 1;
          break;
        case 'right':
          top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
          left = triggerRect.right + offset;
          arrowTop = tooltipRect.height / 2 - arrowSize;
          arrowLeft = -arrowSize + 1;
          break;
        case 'top-start':
          top = triggerRect.top - tooltipRect.height - offset;
          left = triggerRect.left;
          arrowTop = tooltipRect.height - 1;
          arrowLeft = arrowSize * 2;
          break;
        case 'top-end':
          top = triggerRect.top - tooltipRect.height - offset;
          left = triggerRect.right - tooltipRect.width;
          arrowTop = tooltipRect.height - 1;
          arrowLeft = tooltipRect.width - arrowSize * 3;
          break;
        case 'bottom-start':
          top = triggerRect.bottom + offset;
          left = triggerRect.left;
          arrowTop = -arrowSize + 1;
          arrowLeft = arrowSize * 2;
          break;
        case 'bottom-end':
          top = triggerRect.bottom + offset;
          left = triggerRect.right - tooltipRect.width;
          arrowTop = -arrowSize + 1;
          arrowLeft = tooltipRect.width - arrowSize * 3;
          break;
        case 'left-start':
          top = triggerRect.top;
          left = triggerRect.left - tooltipRect.width - offset;
          arrowTop = arrowSize * 2;
          arrowLeft = tooltipRect.width - 1;
          break;
        case 'left-end':
          top = triggerRect.bottom - tooltipRect.height;
          left = triggerRect.left - tooltipRect.width - offset;
          arrowTop = tooltipRect.height - arrowSize * 3;
          arrowLeft = tooltipRect.width - 1;
          break;
        case 'right-start':
          top = triggerRect.top;
          left = triggerRect.right + offset;
          arrowTop = arrowSize * 2;
          arrowLeft = -arrowSize + 1;
          break;
        case 'right-end':
          top = triggerRect.bottom - tooltipRect.height;
          left = triggerRect.right + offset;
          arrowTop = tooltipRect.height - arrowSize * 3;
          arrowLeft = -arrowSize + 1;
          break;
      }

      // Check if position is within viewport bounds
      const isWithinViewport =
        top >= 0 &&
        left >= 0 &&
        top + tooltipRect.height <= viewportHeight &&
        left + tooltipRect.width <= viewportWidth;

      // Calculate score based on viewport fit and distance from preferred position
      let score = 0;
      if (isWithinViewport) score += 100;

      // Prefer positions that match the requested position
      if (position === 'auto' || pos === position) score += 50;

      // Prefer top and bottom over left and right
      if (pos.startsWith('top') || pos.startsWith('bottom')) score += 10;

      if (score > bestScore) {
        bestScore = score;
        bestPosition = pos;
      }
    }

    return {
      top: Math.max(8, Math.min(tooltipPosition.top, viewportHeight - tooltipRect.height - 8)),
      left: Math.max(8, Math.min(tooltipPosition.left, viewportWidth - tooltipRect.width - 8)),
      position: bestPosition,
    };
  }, [position, offset, arrowSize, tooltipPosition]);

  // Update tooltip position
  const updatePosition = useCallback(() => {
    if (!isVisible) return;

    const newPosition = calculatePosition();
    setTooltipPosition(newPosition);
    onPositionChange?.(newPosition.position);
  }, [isVisible, calculatePosition, onPositionChange]);

  // Show tooltip
  const showTooltip = useCallback(() => {
    if (disabled) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      onShow?.();
    }, delay);
  }, [disabled, delay, onShow]);

  // Hide tooltip
  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsVisible(false);
    onHide?.();
  }, [onHide]);

  // Mouse move handler for cursor following
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!followCursor || !isVisible) return;

    setMousePosition({ x: event.clientX, y: event.clientY });
    updatePosition();
  }, [followCursor, isVisible, updatePosition]);

  // Event handlers
  const handleMouseEnter = () => {
    if (trigger === 'hover') showTooltip();
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') hideTooltip();
  };

  const handleClick = () => {
    if (trigger === 'click') {
      if (isVisible) {
        hideTooltip();
      } else {
        showTooltip();
      }
    }
  };

  const handleFocus = () => {
    if (trigger === 'focus') showTooltip();
  };

  const handleBlur = () => {
    if (trigger === 'focus') hideTooltip();
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    if (trigger === 'contextmenu') {
      if (isVisible) {
        hideTooltip();
      } else {
        showTooltip();
      }
    }
  };

  // Setup event listeners
  useEffect(() => {
    const triggerElement = triggerRef.current;
    if (!triggerElement) return;

    if (followCursor) {
      document.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [followCursor, handleMouseMove]);

  // Update position on visibility change
  useEffect(() => {
    if (isVisible) {
      updatePosition();
    }
  }, [isVisible, updatePosition]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => updatePosition();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
    };
  }, [updatePosition]);

  const tooltipVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: shouldReduceMotion ? 0 : 10,
      transition: {
        duration: shouldReduceMotion ? 0 : duration / 1000,
        ease: 'easeOut',
      },
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : duration / 1000,
        ease: 'easeOut',
      },
    },
  };

  const arrowVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { delay: shouldReduceMotion ? 0 : 0.1 },
    },
  };

  return (
    <div
      ref={triggerRef}
      className={`smart-tooltip-trigger ${className}`}
      style={{ display: 'inline-block', ...style }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onContextMenu={handleContextMenu}
    >
      {children}

      <AnimatePresence>
        {isVisible && !disabled && (
          <motion.div
            ref={tooltipRef}
            className="smart-tooltip"
            style={{
              position: 'fixed',
              top: tooltipPosition.top,
              left: tooltipPosition.left,
              zIndex: 9999,
              pointerEvents: interactive ? 'auto' : 'none',
              maxWidth: currentSize.maxWidth,
            }}
            variants={tooltipVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div
              className="tooltip-content"
              style={{
                background: currentVariant?.background || 'rgba(0, 0, 0, 0.9)',
                color: currentVariant?.textColor || '#ffffff',
                padding: currentSize.padding,
                fontSize: currentSize.fontSize,
                borderRadius: '8px',
                border: currentVariant?.borderColor ? `1px solid ${currentVariant.borderColor}` : 'none',
                boxShadow: currentVariant?.shadow || '0 4px 20px rgba(0, 0, 0, 0.3)',
                backdropFilter: currentVariant?.backdropFilter,
                wordWrap: 'break-word',
                whiteSpace: 'pre-wrap',
              }}
            >
              {content}

              {/* Arrow */}
              {showArrow && (
                <motion.div
                  className="tooltip-arrow"
                  variants={arrowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  style={{
                    position: 'absolute',
                    width: 0,
                    height: 0,
                    border: `${arrowSize}px solid transparent`,
                    pointerEvents: 'none',
                  }}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Preset tooltip components for easy usage
export const InfoTooltip: React.FC<Omit<SmartTooltipsProps, 'variant'>> = (props) => (
  <SmartTooltips {...props} variant="info" />
);

export const SuccessTooltip: React.FC<Omit<SmartTooltipsProps, 'variant'>> = (props) => (
  <SmartTooltips {...props} variant="success" />
);

export const WarningTooltip: React.FC<Omit<SmartTooltipsProps, 'variant'>> = (props) => (
  <SmartTooltips {...props} variant="warning" />
);

export const ErrorTooltip: React.FC<Omit<SmartTooltipsProps, 'variant'>> = (props) => (
  <SmartTooltips {...props} variant="error" />
);

export const PremiumTooltip: React.FC<Omit<SmartTooltipsProps, 'variant'>> = (props) => (
  <SmartTooltips {...props} variant="premium" />
);

export const GlassTooltip: React.FC<Omit<SmartTooltipsProps, 'variant'>> = (props) => (
  <SmartTooltips {...props} variant="glass" />
);

export default SmartTooltips;