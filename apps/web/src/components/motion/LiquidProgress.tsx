import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export type ProgressShape = 'circular' | 'linear' | 'pill' | 'wave' | 'spiral' | 'hexagon';

export type GradientType =
  | 'sunset'
  | 'ocean'
  | 'forest'
  | 'lavender'
  | 'fire'
  | 'aurora'
  | 'custom';

export type AnimationStyle = 'flow' | 'pulse' | 'breathe' | 'morph' | 'liquid';

interface GradientStop {
  offset: number;
  color: string;
  opacity?: number;
}

interface LiquidProgressProps {
  value: number; // 0-100
  maxValue?: number;
  shape?: ProgressShape;
  gradient?: GradientType | GradientStop[];
  animation?: AnimationStyle;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  thickness?: number;
  className?: string;
  showValue?: boolean;
  valueFormat?: 'percentage' | 'fraction' | 'raw';
  animated?: boolean;
  glowEffect?: boolean;
  liquidEffect?: boolean;
  onComplete?: () => void;
  onChange?: (value: number) => void;
}

const gradientPresets: Record<GradientType, GradientStop[]> = {
  sunset: [
    { offset: 0, color: '#ff6b6b' },
    { offset: 25, color: '#ffa726' },
    { offset: 50, color: '#ffeb3b' },
    { offset: 75, color: '#66bb6a' },
    { offset: 100, color: '#42a5f5' }
  ],
  ocean: [
    { offset: 0, color: '#e3f2fd' },
    { offset: 25, color: '#90caf9' },
    { offset: 50, color: '#42a5f5' },
    { offset: 75, color: '#1e88e5' },
    { offset: 100, color: '#0d47a1' }
  ],
  forest: [
    { offset: 0, color: '#e8f5e8' },
    { offset: 25, color: '#a5d6a7' },
    { offset: 50, color: '#66bb6a' },
    { offset: 75, color: '#388e3c' },
    { offset: 100, color: '#1b5e20' }
  ],
  lavender: [
    { offset: 0, color: '#f3e5f5' },
    { offset: 25, color: '#ce93d8' },
    { offset: 50, color: '#9c27b0' },
    { offset: 75, color: '#6a1b9a' },
    { offset: 100, color: '#4a148c' }
  ],
  fire: [
    { offset: 0, color: '#ffebee' },
    { offset: 25, color: '#ff7043' },
    { offset: 50, color: '#ff5722' },
    { offset: 75, color: '#d84315' },
    { offset: 100, color: '#bf360c' }
  ],
  aurora: [
    { offset: 0, color: '#f3e5f5' },
    { offset: 20, color: '#e1bee7' },
    { offset: 40, color: '#ce93d8' },
    { offset: 60, color: '#ba68c8' },
    { offset: 80, color: '#9c27b0' },
    { offset: 100, color: '#7b1fa2' }
  ],
  custom: [] // Custom gradients are provided by the user
};

const sizeConfig = {
  sm: { width: 40, height: 40, strokeWidth: 3 },
  md: { width: 80, height: 80, strokeWidth: 4 },
  lg: { width: 120, height: 120, strokeWidth: 6 },
  xl: { width: 160, height: 160, strokeWidth: 8 }
};

export const LiquidProgress: React.FC<LiquidProgressProps> = ({
  value,
  maxValue = 100,
  shape = 'circular',
  gradient = 'sunset',
  animation = 'flow',
  size = 'md',
  thickness = 4,
  className,
  showValue = false,
  valueFormat = 'percentage',
  animated = true,
  glowEffect = false,
  liquidEffect = false,
  onComplete,
  onChange,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const animationRef = useRef<number>();
  const progressRef = useRef<SVGSVGElement>(null);

  const config = sizeConfig[size];
  const normalizedValue = Math.min(Math.max(value, 0), maxValue);
  const percentage = (normalizedValue / maxValue) * 100;

  const gradientStops = Array.isArray(gradient) ? gradient : gradientPresets[gradient];

  // Animate value changes
  useEffect(() => {
    if (!animated) {
      setDisplayValue(percentage);
      return;
    }

    const startValue = displayValue;
    const endValue = percentage;
    const duration = 1000; // 1 second
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * easeProgress;

      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsComplete(endValue >= 100);
        onComplete?.();
      }
    };

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [percentage, animated, onComplete]);

  // Notify on value change
  useEffect(() => {
    onChange?.(normalizedValue);
  }, [normalizedValue, onChange]);

  const formatValue = (val: number) => {
    switch (valueFormat) {
      case 'percentage':
        return `${Math.round(val)}%`;
      case 'fraction':
        return `${Math.round(val)}/${maxValue}`;
      case 'raw':
        return Math.round(val).toString();
      default:
        return Math.round(val).toString();
    }
  };

  const getGradientId = () => `liquid-gradient-${Math.random().toString(36).substr(2, 9)}`;

  const renderCircularProgress = () => {
    const radius = (config.width - config.strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (displayValue / 100) * circumference;

    const gradientId = getGradientId();

    return (
      <div className="relative">
        <svg
          ref={progressRef}
          width={config.width}
          height={config.height}
          className={cn(
            'transform -rotate-90',
            glowEffect && 'filter drop-shadow-lg'
          )}
        >
          {/* Background circle */}
          <circle
            cx={config.width / 2}
            cy={config.height / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={config.strokeWidth}
            fill="none"
            className="text-gray-200"
          />

          {/* Progress circle with gradient */}
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              {gradientStops.map((stop, index) => (
                <stop
                  key={index}
                  offset={`${stop.offset}%`}
                  stopColor={stop.color}
                  stopOpacity={stop.opacity || 1}
                />
              ))}
            </linearGradient>
          </defs>

          <motion.circle
            cx={config.width / 2}
            cy={config.height / 2}
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeWidth={config.strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{
              duration: animated ? 1 : 0,
              ease: "easeInOut"
            }}
            className={cn(
              liquidEffect && 'animate-pulse'
            )}
          />

          {/* Liquid effect overlay */}
          {liquidEffect && (
            <motion.circle
              cx={config.width / 2}
              cy={config.height / 2}
              r={radius - config.strokeWidth / 2}
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth="1"
              opacity="0.3"
              animate={{
                pathLength: [0, displayValue / 100, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
        </svg>

        {/* Value display */}
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span
              className="text-sm font-semibold text-gray-700"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              {formatValue(displayValue)}
            </motion.span>
          </div>
        )}
      </div>
    );
  };

  const renderLinearProgress = () => {
    const gradientId = getGradientId();

    return (
      <div className="relative">
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full rounded-full relative"
            initial={{ width: 0 }}
            animate={{ width: `${displayValue}%` }}
            transition={{
              duration: animated ? 1 : 0,
              ease: "easeInOut"
            }}
          >
            {/* Gradient background */}
            <svg className="absolute inset-0 w-full h-full">
              <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                  {gradientStops.map((stop, index) => (
                    <stop
                      key={index}
                      offset={`${stop.offset}%`}
                      stopColor={stop.color}
                      stopOpacity={stop.opacity || 1}
                    />
                  ))}
                </linearGradient>
              </defs>
              <rect
                width="100%"
                height="100%"
                fill={`url(#${gradientId})`}
                className={cn(
                  'transition-all duration-300',
                  liquidEffect && 'animate-pulse'
                )}
              />
            </svg>

            {/* Liquid animation overlay */}
            {liquidEffect && (
              <motion.div
                className="absolute top-0 left-0 w-full h-full opacity-30"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  background: `linear-gradient(90deg, transparent, ${gradientStops[0]?.color}40, transparent)`,
                  backgroundSize: '200% 100%'
                }}
              />
            )}
          </motion.div>
        </div>

        {/* Value display */}
        {showValue && (
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500">Progress</span>
            <span className="text-xs font-medium text-gray-700">
              {formatValue(displayValue)}
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderPillProgress = () => {
    const gradientId = getGradientId();

    return (
      <div className="relative">
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div
              className="h-full rounded-full relative"
              initial={{ width: 0 }}
              animate={{ width: `${displayValue}%` }}
              transition={{
                duration: animated ? 1 : 0,
                ease: "easeInOut"
              }}
            >
              <svg className="absolute inset-0 w-full h-full">
                <defs>
                  <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                    {gradientStops.map((stop, index) => (
                      <stop
                        key={index}
                        offset={`${stop.offset}%`}
                        stopColor={stop.color}
                        stopOpacity={stop.opacity || 1}
                      />
                    ))}
                  </linearGradient>
                </defs>
                <rect
                  width="100%"
                  height="100%"
                  fill={`url(#${gradientId})`}
                  rx="6"
                  className={cn(
                    liquidEffect && 'animate-pulse'
                  )}
                />
              </svg>
            </motion.div>
          </div>

          {showValue && (
            <span className="text-sm font-medium text-gray-700 min-w-[3rem] text-right">
              {formatValue(displayValue)}
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderWaveProgress = () => {
    const gradientId = getGradientId();

    return (
      <div className="relative">
        <svg
          width={config.width}
          height={config.height}
          viewBox="0 0 100 100"
          className={cn(
            glowEffect && 'filter drop-shadow-lg'
          )}
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              {gradientStops.map((stop, index) => (
                <stop
                  key={index}
                  offset={`${stop.offset}%`}
                  stopColor={stop.color}
                  stopOpacity={stop.opacity || 1}
                />
              ))}
            </linearGradient>

            {/* Wave pattern */}
            <pattern id="wave-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <path
                d="M0,10 Q5,5 10,10 T20,10"
                stroke={`url(#${gradientId})`}
                strokeWidth="2"
                fill="none"
              />
            </pattern>
          </defs>

          {/* Background */}
          <rect width="100" height="100" fill="url(#wave-pattern)" opacity="0.1" />

          {/* Animated wave */}
          <motion.rect
            width={displayValue}
            height="100"
            fill={`url(#${gradientId})`}
            initial={{ width: 0 }}
            animate={{ width: displayValue }}
            transition={{
              duration: animated ? 1 : 0,
              ease: "easeInOut"
            }}
            className={cn(
              liquidEffect && 'animate-pulse'
            )}
          />

          {/* Floating particles */}
          {liquidEffect && (
            <>
              {[0, 1, 2].map((i) => (
                <motion.circle
                  key={i}
                  r="2"
                  fill={gradientStops[2]?.color || '#42a5f5'}
                  opacity="0.6"
                  animate={{
                    cy: [20, 80, 20],
                    cx: [10 + i * 30, 15 + i * 30, 10 + i * 30],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </>
          )}
        </svg>

        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-semibold text-white drop-shadow-lg">
              {formatValue(displayValue)}
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderProgress = () => {
    switch (shape) {
      case 'linear':
        return renderLinearProgress();
      case 'pill':
        return renderPillProgress();
      case 'wave':
        return renderWaveProgress();
      case 'circular':
      default:
        return renderCircularProgress();
    }
  };

  return (
    <div className={cn('liquid-progress', className)}>
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-2 -right-2 z-10"
          >
            <div className="bg-green-500 text-white rounded-full p-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {renderProgress()}
    </div>
  );
};

// Specialized progress components
export const CircularProgress: React.FC<Omit<LiquidProgressProps, 'shape'>> = (props) => (
  <LiquidProgress {...props} shape="circular" />
);

export const LinearProgress: React.FC<Omit<LiquidProgressProps, 'shape'>> = (props) => (
  <LiquidProgress {...props} shape="linear" />
);

export const WaveProgress: React.FC<Omit<LiquidProgressProps, 'shape'>> = (props) => (
  <LiquidProgress {...props} shape="wave" />
);

export const PillProgress: React.FC<Omit<LiquidProgressProps, 'shape'>> = (props) => (
  <LiquidProgress {...props} shape="pill" />
);