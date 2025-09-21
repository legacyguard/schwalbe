import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

interface ResponsiveTypographyProps {
  children: React.ReactNode;
  importance?: 'low' | 'medium' | 'high' | 'critical';
  context?: 'heading' | 'body' | 'caption' | 'quote' | 'cta';
  adaptive?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onImportanceChange?: (importance: string) => void;
}

interface TypographyMetrics {
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  fontWeight: number;
  textTransform: string;
  animationDuration: number;
  animationDelay: number;
}

const ResponsiveTypography: React.FC<ResponsiveTypographyProps> = ({
  children,
  importance = 'medium',
  context = 'body',
  adaptive = true,
  className = '',
  style = {},
  onImportanceChange,
}) => {
  const [currentImportance, setCurrentImportance] = useState(importance);
  const [isVisible, setIsVisible] = useState(false);
  const [contentLength, setContentLength] = useState(0);
  const [readingTime, setReadingTime] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const controls = useAnimation();
  const shouldReduceMotion = useReducedMotion();

  // Calculate content metrics
  useEffect(() => {
    if (typeof children === 'string') {
      const length = children.length;
      const estimatedReadingTime = Math.max(1, Math.ceil(length / 200)); // Assume 200 chars per minute
      setContentLength(length);
      setReadingTime(estimatedReadingTime);

      // Auto-adjust importance based on content length and reading time
      if (adaptive) {
        let autoImportance: typeof importance = 'medium';
        if (length < 50) autoImportance = 'low';
        else if (length > 300 || estimatedReadingTime > 3) autoImportance = 'high';
        else if (length > 500 || estimatedReadingTime > 5) autoImportance = 'critical';

        setCurrentImportance(autoImportance);
        onImportanceChange?.(autoImportance);
      }
    }
  }, [children, adaptive, onImportanceChange]);

  // Trigger animations when in view
  useEffect(() => {
    if (isInView && !shouldReduceMotion) {
      setIsVisible(true);
      controls.start('visible');
    }
  }, [isInView, controls, shouldReduceMotion]);

  // Get responsive typography metrics based on importance and context
  const getTypographyMetrics = (): TypographyMetrics => {
    const baseMetrics: Record<string, TypographyMetrics> = {
      heading: {
        fontSize: 32,
        lineHeight: 1.2,
        letterSpacing: -0.5,
        fontWeight: 700,
        textTransform: 'none',
        animationDuration: 0.8,
        animationDelay: 0.1,
      },
      body: {
        fontSize: 16,
        lineHeight: 1.6,
        letterSpacing: 0.2,
        fontWeight: 400,
        textTransform: 'none',
        animationDuration: 0.6,
        animationDelay: 0.2,
      },
      caption: {
        fontSize: 12,
        lineHeight: 1.4,
        letterSpacing: 0.4,
        fontWeight: 500,
        textTransform: 'uppercase',
        animationDuration: 0.4,
        animationDelay: 0.3,
      },
      quote: {
        fontSize: 20,
        lineHeight: 1.5,
        letterSpacing: -0.2,
        fontWeight: 300,
        textTransform: 'none',
        animationDuration: 1.0,
        animationDelay: 0.4,
      },
      cta: {
        fontSize: 18,
        lineHeight: 1.3,
        letterSpacing: 0.3,
        fontWeight: 600,
        textTransform: 'none',
        animationDuration: 0.5,
        animationDelay: 0.1,
      },
    };

    const contextMetrics = baseMetrics[context] || baseMetrics.body;

    // Ensure contextMetrics is defined
    if (!contextMetrics) {
      throw new Error(`Invalid context: ${context}`);
    }

    // Adjust metrics based on importance
    const importanceMultipliers = {
      low: 0.8,
      medium: 1.0,
      high: 1.2,
      critical: 1.4,
    };

    const multiplier = importanceMultipliers[currentImportance];

    return {
      fontSize: contextMetrics.fontSize * multiplier,
      lineHeight: contextMetrics.lineHeight,
      letterSpacing: contextMetrics.letterSpacing,
      fontWeight: Math.min(900, contextMetrics.fontWeight + (currentImportance === 'critical' ? 200 : currentImportance === 'high' ? 100 : 0)),
      textTransform: contextMetrics.textTransform,
      animationDuration: contextMetrics.animationDuration * (shouldReduceMotion ? 0.1 : 1),
      animationDelay: contextMetrics.animationDelay,
    };
  };

  const metrics = getTypographyMetrics();

  // Animation variants
  const containerVariants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 20,
      scale: shouldReduceMotion ? 1 : 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: metrics.animationDuration,
        delay: metrics.animationDelay,
        ease: [0.25, 0.46, 0.45, 0.94], // Custom cubic-bezier for liquid feel
      },
    },
  };

  const textVariants = {
    hidden: {
      opacity: 0,
      filter: 'blur(10px)',
      transform: 'translateY(10px)',
    },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      transform: 'translateY(0px)',
      transition: {
        duration: metrics.animationDuration * 0.8,
        delay: metrics.animationDelay + 0.1,
        ease: 'easeOut',
      },
    },
  };

  // Dynamic styles based on importance and context
  const dynamicStyles: React.CSSProperties = {
    fontSize: `${metrics.fontSize}px`,
    lineHeight: metrics.lineHeight,
    letterSpacing: `${metrics.letterSpacing}px`,
    fontWeight: metrics.fontWeight,
    textTransform: metrics.textTransform as any,
    fontFamily: context === 'heading' ? 'var(--font-display, system-ui)' : 'var(--font-body, system-ui)',
    transition: shouldReduceMotion ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    ...style,
  };

  // Importance-based color classes
  const importanceClasses = {
    low: 'text-gray-600',
    medium: 'text-gray-900',
    high: 'text-blue-600',
    critical: 'text-purple-600',
  };

  return (
    <motion.div
      ref={containerRef}
      className={`responsive-typography ${importanceClasses[currentImportance]} ${className}`}
      style={dynamicStyles}
      variants={containerVariants}
      initial="hidden"
      animate={controls}
      data-importance={currentImportance}
      data-context={context}
      data-reading-time={readingTime}
    >
      <motion.div variants={textVariants}>
        {children}
      </motion.div>

      {/* Visual importance indicator */}
      {currentImportance === 'critical' && !shouldReduceMotion && (
        <motion.div
          className="absolute -left-2 top-0 w-1 bg-gradient-to-b from-purple-400 to-purple-600 rounded-full"
          initial={{ scaleY: 0, originY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{
            duration: 0.6,
            delay: metrics.animationDelay + 0.3,
            ease: 'easeOut',
          }}
          style={{
            height: `${metrics.fontSize * 1.2}px`,
          }}
        />
      )}

      {/* Reading time indicator for long content */}
      {readingTime > 2 && context === 'body' && (
        <motion.div
          className="text-xs text-gray-400 mt-1 opacity-0"
          animate={{ opacity: isVisible ? 0.6 : 0 }}
          transition={{ duration: 0.3, delay: 1 }}
        >
          {readingTime} min read
        </motion.div>
      )}
    </motion.div>
  );
};

export default ResponsiveTypography;