import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

interface CustomSVGIconsProps {
  children?: React.ReactNode;
  iconType?: 'document' | 'will' | 'guardian' | 'family' | 'security' | 'legacy' | 'time-capsule' | 'emergency' | 'professional' | 'insights' | 'milestones' | 'assets' | 'reminders' | 'sharing' | 'notifications' | 'settings' | 'profile' | 'dashboard' | 'analytics' | 'reports' | 'custom';
  style?: 'minimal' | 'detailed' | 'premium' | 'hand-drawn' | 'geometric' | 'organic' | 'tech' | 'elegant' | 'playful' | 'professional';
  complexity?: 'simple' | 'moderate' | 'complex' | 'ultra-detailed';
  animation?: 'none' | 'subtle' | 'moderate' | 'elaborate' | 'dramatic';
  theme?: 'light' | 'dark' | 'colorful' | 'monochrome' | 'gradient' | 'pastel' | 'neon' | 'vintage' | 'modern';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  color?: string;
  strokeWidth?: number;
  fillOpacity?: number;
  className?: string;
  styleProps?: React.CSSProperties;
  interactive?: boolean;
  hoverable?: boolean;
  clickable?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  onHover?: () => void;
  onAnimationComplete?: () => void;
}

interface SVGIconData {
  name: string;
  paths: string[];
  viewBox: string;
  complexity: string;
  style: string;
  theme: string;
  colors: Record<string, string>;
  animations: string[];
  details: string[];
}

interface IconDetail {
  name: string;
  path: string;
  animation: string;
  color: string;
  opacity: number;
  strokeWidth: number;
}

const CustomSVGIcons: React.FC<CustomSVGIconsProps> = ({
  children,
  iconType = 'document',
  style = 'premium',
  complexity = 'complex',
  animation = 'moderate',
  theme = 'colorful',
  size = 'md',
  color = '#6b7280',
  strokeWidth = 2,
  fillOpacity = 0.1,
  className = '',
  styleProps = {},
  interactive = true,
  hoverable = true,
  clickable = false,
  disabled = false,
  onClick,
  onHover,
  onAnimationComplete,
}) => {
  const [currentAnimation, setCurrentAnimation] = useState(animation);
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Premium SVG icon definitions with complex details
  const iconDefinitions: Record<string, SVGIconData> = {
    document: {
      name: 'Document',
      viewBox: '0 0 100 100',
      complexity: 'complex',
      style: 'premium',
      theme: 'colorful',
      colors: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        accent: '#10b981',
        detail: '#f59e0b',
        background: '#f8fafc',
      },
      animations: ['subtle', 'moderate', 'elaborate'],
      paths: [
        // Main document body
        'M20 15 L20 85 L80 85 L80 35 L60 15 Z',
        // Document fold
        'M60 15 L60 35 L80 35',
        // Text lines
        'M25 25 L70 25',
        'M25 35 L65 35',
        'M25 45 L75 45',
        'M25 55 L60 55',
        // Decorative elements
        'M25 65 L45 65',
        'M50 65 L70 65',
        // Corner details
        'M75 20 Q80 20 80 25',
        'M75 80 Q80 80 80 75',
      ],
      details: [
        'corner-radius',
        'text-lines',
        'fold-shadow',
        'binding-holes',
        'watermark',
        'security-pattern',
        'gradient-fill',
        'texture-overlay',
      ],
    },
    will: {
      name: 'Last Will & Testament',
      viewBox: '0 0 120 100',
      complexity: 'ultra-detailed',
      style: 'elegant',
      theme: 'gradient',
      colors: {
        primary: '#7c3aed',
        secondary: '#ec4899',
        accent: '#f59e0b',
        detail: '#10b981',
        background: '#fef7ff',
      },
      animations: ['moderate', 'elaborate', 'dramatic'],
      paths: [
        // Ornate document frame
        'M15 10 L15 90 L105 90 L105 10 Z',
        'M20 15 L20 85 L100 85 L100 15 Z',
        // Decorative border corners
        'M15 10 L25 10 L25 20 L15 20 Z',
        'M95 10 L105 10 L105 20 L95 20 Z',
        'M15 80 L25 80 L25 90 L15 90 Z',
        'M95 80 L105 80 L105 90 L95 90 Z',
        // Legal seal placeholder
        'M85 25 Q90 25 90 30 Q90 35 85 35 Q80 35 80 30 Q80 25 85 25',
        // Signature line
        'M25 70 L75 70',
        'M75 72 L85 72',
        // Text sections
        'M25 40 L90 40',
        'M25 45 L85 45',
        'M25 50 L95 50',
        'M25 55 L80 55',
        'M25 60 L90 60',
        // Decorative flourishes
        'M30 20 Q35 15 40 20 Q45 15 50 20',
        'M70 20 Q75 15 80 20 Q85 15 90 20',
        // Witness sections
        'M25 75 L45 75',
        'M55 75 L75 75',
      ],
      details: [
        'ornate-border',
        'legal-seal',
        'signature-lines',
        'witness-sections',
        'notary-stamp',
        'watermark-seal',
        'parchment-texture',
        'gold-foil-accents',
        'embossed-border',
        'security-threads',
      ],
    },
    guardian: {
      name: 'Guardian',
      viewBox: '0 0 100 100',
      complexity: 'complex',
      style: 'professional',
      theme: 'monochrome',
      colors: {
        primary: '#1f2937',
        secondary: '#6b7280',
        accent: '#374151',
        detail: '#4b5563',
        background: '#ffffff',
      },
      animations: ['subtle', 'moderate', 'elaborate'],
      paths: [
        // Shield base
        'M50 10 L30 20 L30 50 Q30 70 50 90 Q70 70 70 50 L70 20 Z',
        // Inner shield details
        'M50 15 L35 25 L35 50 Q35 65 50 80 Q65 65 65 50 L65 25 Z',
        // Protection bands
        'M40 30 L60 30',
        'M40 40 L60 40',
        'M40 50 L60 50',
        // Central emblem
        'M50 35 Q52 35 52 37 Q52 39 50 39 Q48 39 48 37 Q48 35 50 35',
        // Guardian figure
        'M45 55 L55 55 L55 65 L50 70 L45 65 Z',
        'M47 57 L53 57 L53 60 L47 60 Z',
        // Protective elements
        'M35 25 Q40 20 45 25',
        'M55 25 Q60 20 65 25',
      ],
      details: [
        'shield-layers',
        'protection-bands',
        'guardian-figure',
        'security-pattern',
        'trust-seal',
        'authority-badge',
        'responsibility-lines',
        'commitment-symbol',
      ],
    },
    family: {
      name: 'Family Tree',
      viewBox: '0 0 120 100',
      complexity: 'ultra-detailed',
      style: 'organic',
      theme: 'pastel',
      colors: {
        primary: '#10b981',
        secondary: '#3b82f6',
        accent: '#ec4899',
        detail: '#f59e0b',
        background: '#f0fdf4',
      },
      animations: ['moderate', 'elaborate', 'dramatic'],
      paths: [
        // Family tree trunk
        'M60 80 L60 95',
        'M55 85 L65 85',
        // Main branches
        'M60 75 Q50 65 40 55',
        'M60 75 Q70 65 80 55',
        'M60 75 Q45 60 35 50',
        'M60 75 Q75 60 85 50',
        // Secondary branches
        'M40 55 Q35 45 30 35',
        'M40 55 Q45 45 50 35',
        'M80 55 Q75 45 70 35',
        'M80 55 Q85 45 90 35',
        // Family members (leaves/circles)
        'M30 35 Q32 35 32 37 Q32 39 30 39 Q28 39 28 37 Q28 35 30 35',
        'M50 35 Q52 35 52 37 Q52 39 50 39 Q48 39 48 37 Q48 35 50 35',
        'M70 35 Q72 35 72 37 Q72 39 70 39 Q68 39 68 37 Q68 35 70 35',
        'M90 35 Q92 35 92 37 Q92 39 90 39 Q88 39 88 37 Q88 35 90 35',
        'M35 50 Q37 50 37 52 Q37 54 35 54 Q33 54 33 52 Q33 50 35 50',
        'M85 50 Q87 50 87 52 Q87 54 85 54 Q83 54 83 52 Q83 50 85 50',
        // Connection lines
        'M30 37 L35 50',
        'M50 37 L40 55',
        'M70 37 L60 75',
        'M90 37 L85 50',
        'M35 52 L40 55',
        'M85 52 L80 55',
        // Roots
        'M60 95 Q55 98 50 95 Q45 98 40 95',
        'M60 95 Q65 98 70 95 Q75 98 80 95',
      ],
      details: [
        'branching-structure',
        'family-connections',
        'generational-layers',
        'growth-rings',
        'leaf-details',
        'root-system',
        'connection-lines',
        'heritage-patterns',
      ],
    },
    security: {
      name: 'Security & Protection',
      viewBox: '0 0 100 100',
      complexity: 'complex',
      style: 'tech',
      theme: 'neon',
      colors: {
        primary: '#00d9ff',
        secondary: '#8b5cf6',
        accent: '#10b981',
        detail: '#f59e0b',
        background: '#0f0f23',
      },
      animations: ['moderate', 'elaborate', 'dramatic'],
      paths: [
        // Main lock body
        'M50 25 Q50 20 45 20 L35 20 Q30 20 30 25 L30 45 Q30 50 35 50 L45 50 Q50 50 50 45 Z',
        // Lock shackle
        'M35 20 Q35 15 40 15 L60 15 Q65 15 65 20 L65 25',
        // Digital security pattern
        'M25 60 L75 60',
        'M25 65 L75 65',
        'M25 70 L75 70',
        // Circuit lines
        'M20 75 L30 75 L30 85 L40 85',
        'M60 75 L70 75 L70 85 L80 85',
        'M40 80 L60 80',
        // Security nodes
        'M25 60 Q27 60 27 62 Q27 64 25 64 Q23 64 23 62 Q23 60 25 60',
        'M75 60 Q77 60 77 62 Q77 64 75 64 Q73 64 73 62 Q73 60 75 60',
        'M25 70 Q27 70 27 72 Q27 74 25 74 Q23 74 23 72 Q23 70 25 70',
        'M75 70 Q77 70 77 72 Q77 74 75 74 Q73 74 73 72 Q73 70 75 70',
        // Encryption symbols
        'M45 35 Q47 35 47 37 Q47 39 45 39 Q43 39 43 37 Q43 35 45 35',
        'M50 35 Q52 35 52 37 Q52 39 50 39 Q48 39 48 37 Q48 35 50 35',
        'M55 35 Q57 35 57 37 Q57 39 55 39 Q53 39 53 37 Q53 35 55 35',
      ],
      details: [
        'digital-circuit',
        'security-nodes',
        'encryption-locks',
        'biometric-scan',
        'firewall-layers',
        'access-control',
        'monitoring-sensors',
        'alert-systems',
      ],
    },
    legacy: {
      name: 'Legacy & Heritage',
      viewBox: '0 0 120 100',
      complexity: 'ultra-detailed',
      style: 'elegant',
      theme: 'vintage',
      colors: {
        primary: '#92400e',
        secondary: '#d97706',
        accent: '#f59e0b',
        detail: '#a16207',
        background: '#fef3c7',
      },
      animations: ['moderate', 'elaborate', 'dramatic'],
      paths: [
        // Hourglass base
        'M60 10 Q60 5 55 5 L65 5 Q60 5 60 10',
        'M60 90 Q60 95 55 95 L65 95 Q60 95 60 90',
        // Hourglass chambers
        'M50 15 Q50 10 45 10 L75 10 Q70 10 70 15 L70 45 Q70 50 65 50 L55 50 Q50 50 50 45 Z',
        'M50 55 Q50 50 45 50 L75 50 Q70 50 70 55 L70 85 Q70 90 65 90 L55 90 Q50 90 50 85 Z',
        // Sand flow
        'M60 45 Q60 50 60 55',
        // Decorative frame
        'M40 5 L40 95 M80 5 L80 95',
        'M35 10 L85 10 M35 90 L85 90',
        // Ornate details
        'M30 20 Q25 20 25 25 Q25 30 30 30 Q35 30 35 25 Q35 20 30 20',
        'M85 20 Q90 20 90 25 Q90 30 85 30 Q80 30 80 25 Q80 20 85 20',
        'M30 80 Q25 80 25 75 Q25 70 30 70 Q35 70 35 75 Q35 80 30 80',
        'M85 80 Q90 80 90 75 Q90 70 85 70 Q80 70 80 75 Q80 80 85 80',
        // Time markers
        'M45 25 L50 25 M45 35 L50 35 M45 75 L50 75 M45 65 L50 65',
        'M70 25 L75 25 M70 35 L75 35 M70 75 L75 75 M70 65 L75 65',
        // Heritage symbols
        'M60 25 Q62 25 62 27 Q62 29 60 29 Q58 29 58 27 Q58 25 60 25',
        'M60 75 Q62 75 62 77 Q62 79 60 79 Q58 79 58 77 Q58 75 60 75',
      ],
      details: [
        'ornate-frame',
        'sand-animation',
        'time-markers',
        'heritage-symbols',
        'antique-texture',
        'golden-accents',
        'temporal-layers',
        'legacy-seals',
      ],
    },
  };

  // Get current icon definition
  const currentIcon = iconDefinitions[iconType] || iconDefinitions.document;

  // Animation configurations based on complexity
  const getAnimationConfig = useCallback(() => {
    const baseConfig = {
      duration: animation === 'subtle' ? 0.5 : animation === 'moderate' ? 1 : animation === 'elaborate' ? 1.5 : 2,
      ease: 'easeOut',
    };

    switch (currentAnimation) {
      case 'subtle':
        return {
          ...baseConfig,
          scale: [1, 1.05, 1],
          rotate: [0, 2, 0],
        };
      case 'moderate':
        return {
          ...baseConfig,
          scale: [1, 1.1, 1],
          rotate: [0, 5, 0],
          y: [0, -5, 0],
        };
      case 'elaborate':
        return {
          ...baseConfig,
          scale: [1, 1.15, 1],
          rotate: [0, 10, -5, 5, 0],
          y: [0, -10, 0],
          x: [0, 2, -2, 0],
        };
      case 'dramatic':
        return {
          ...baseConfig,
          scale: [1, 1.2, 0.9, 1.1, 1],
          rotate: [0, 15, -10, 10, 0],
          y: [0, -15, 5, 0],
          x: [0, 5, -5, 0],
        };
      default:
        return baseConfig;
    }
  }, [currentAnimation, animation]);

  // Handle interactions
  const handleMouseEnter = useCallback(() => {
    if (disabled || !hoverable) return;

    setIsHovered(true);
    onHover?.();

    if (interactive && !shouldReduceMotion) {
      setShowDetails(true);
      setCurrentAnimation('moderate');
    }
  }, [disabled, hoverable, interactive, shouldReduceMotion, onHover]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);

    if (interactive && !shouldReduceMotion) {
      setShowDetails(false);
      setCurrentAnimation(animation);
    }
  }, [interactive, shouldReduceMotion, animation]);

  const handleClick = useCallback(() => {
    if (disabled || !clickable) return;

    setIsAnimating(true);
    onClick?.();

    // Trigger dramatic animation on click
    if (!shouldReduceMotion) {
      setCurrentAnimation('dramatic');

      const timer = setTimeout(() => {
        setIsAnimating(false);
        setCurrentAnimation(animation);
        onAnimationComplete?.();
      }, 2000);

      return () => clearTimeout(timer);
    }

    // Return undefined for the case when shouldReduceMotion is true
    return undefined;
  }, [disabled, clickable, shouldReduceMotion, animation, onClick, onAnimationComplete]);

  // Size configurations
  const sizeConfigs = {
    xs: { width: 16, height: 16 },
    sm: { width: 24, height: 24 },
    md: { width: 32, height: 32 },
    lg: { width: 48, height: 48 },
    xl: { width: 64, height: 64 },
    custom: { width: 32, height: 32 },
  };

  const currentSize = sizeConfigs[size];

  // Get theme colors
  const getThemeColors = useCallback(() => {
    if (!currentIcon) return {
      primary: color,
      secondary: color,
      accent: color,
      detail: color,
      background: 'transparent',
    };

    const iconColors = currentIcon.colors;
    const baseColor = color;

    switch (theme) {
      case 'light':
        return {
          primary: '#1f2937',
          secondary: '#6b7280',
          accent: '#3b82f6',
          detail: '#10b981',
          background: '#ffffff',
        };
      case 'dark':
        return {
          primary: '#f9fafb',
          secondary: '#d1d5db',
          accent: '#60a5fa',
          detail: '#34d399',
          background: '#111827',
        };
      case 'colorful':
        return iconColors;
      case 'monochrome':
        return {
          primary: baseColor,
          secondary: baseColor,
          accent: baseColor,
          detail: baseColor,
          background: 'transparent',
        };
      case 'gradient':
        return {
          primary: `linear-gradient(135deg, ${iconColors.primary}, ${iconColors.secondary})`,
          secondary: iconColors.accent,
          accent: iconColors.detail,
          detail: iconColors.accent,
          background: iconColors.background,
        };
      case 'pastel':
        return {
          primary: '#a7f3d0',
          secondary: '#bfdbfe',
          accent: '#fbcfe8',
          detail: '#fef3c7',
          background: '#f0fdf4',
        };
      case 'neon':
        return {
          primary: '#00d9ff',
          secondary: '#8b5cf6',
          accent: '#10b981',
          detail: '#f59e0b',
          background: '#0f0f23',
        };
      case 'vintage':
        return {
          primary: '#92400e',
          secondary: '#d97706',
          accent: '#f59e0b',
          detail: '#a16207',
          background: '#fef3c7',
        };
      case 'modern':
        return {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          accent: '#ec4899',
          detail: '#10b981',
          background: '#f8fafc',
        };
      default:
        return iconColors;
    }
  }, [currentIcon, color, theme]);

  const themeColors = getThemeColors();
  const animationConfig = getAnimationConfig();

  return (
    <div
      ref={containerRef}
      className={`custom-svg-icon ${className} ${isHovered ? 'hovered' : ''} ${isAnimating ? 'animating' : ''}`}
      style={{
        display: 'inline-block',
        cursor: disabled ? 'not-allowed' : clickable ? 'pointer' : 'default',
        opacity: disabled ? 0.5 : 1,
        ...styleProps,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <motion.svg
        width={currentSize.width}
        height={currentSize.height}
        viewBox={currentIcon?.viewBox || '0 0 100 100'}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          color: themeColors.primary,
          filter: isHovered && !shouldReduceMotion ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))' : 'none',
        }}
        animate={shouldReduceMotion ? {} : animationConfig}
        whileHover={shouldReduceMotion || !hoverable ? {} : {
          scale: 1.1,
          rotate: 5,
          transition: { duration: 0.3, ease: 'easeOut' },
        }}
        whileTap={shouldReduceMotion || !clickable ? {} : {
          scale: 0.95,
          transition: { duration: 0.1 },
        }}
      >
        {/* Background layer */}
        <rect
          width="100%"
          height="100%"
          fill={themeColors.background}
          opacity={fillOpacity}
          rx="4"
        />

        {/* Main icon paths */}
        {(currentIcon?.paths || []).map((path, index) => (
          <motion.path
            key={index}
            d={path}
            fill={index % 3 === 0 ? themeColors.primary : 'none'}
            stroke={themeColors.secondary}
            strokeWidth={strokeWidth}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: 1,
              opacity: 1,
              transition: {
                delay: index * 0.1,
                duration: 0.8,
                ease: 'easeInOut',
              },
            }}
          />
        ))}

        {/* Detail elements */}
        <AnimatePresence>
          {showDetails && !shouldReduceMotion && (
            <g>
              {/* Decorative sparkles */}
              {[...Array(6)].map((_, i) => (
                <motion.circle
                  key={i}
                  cx={20 + i * 15}
                  cy={20 + (i % 2) * 10}
                  r="2"
                  fill={themeColors.accent}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                    transition: {
                      delay: i * 0.1,
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    },
                  }}
                />
              ))}

              {/* Glow effect */}
              <motion.rect
                x="2"
                y="2"
                width="96%"
                height="96%"
                fill="none"
                stroke={themeColors.accent}
                strokeWidth="1"
                opacity="0.3"
                rx="4"
                initial={{ pathLength: 0 }}
                animate={{
                  pathLength: 1,
                  transition: { duration: 1, ease: 'easeInOut' },
                }}
              />
            </g>
          )}
        </AnimatePresence>
      </motion.svg>

      {/* Development info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute -top-6 left-0 text-xs bg-black bg-opacity-50 text-white px-2 py-1 rounded">
          {iconType} • {style} • {complexity} • {theme}
        </div>
      )}
    </div>
  );
};

// Preset components for easy usage
export const DocumentIcon: React.FC<Omit<CustomSVGIconsProps, 'iconType'>> = (props) => (
  <CustomSVGIcons {...props} iconType="document" />
);

export const WillIcon: React.FC<Omit<CustomSVGIconsProps, 'iconType'>> = (props) => (
  <CustomSVGIcons {...props} iconType="will" />
);

export const GuardianIcon: React.FC<Omit<CustomSVGIconsProps, 'iconType'>> = (props) => (
  <CustomSVGIcons {...props} iconType="guardian" />
);

export const FamilyIcon: React.FC<Omit<CustomSVGIconsProps, 'iconType'>> = (props) => (
  <CustomSVGIcons {...props} iconType="family" />
);

export const SecurityIcon: React.FC<Omit<CustomSVGIconsProps, 'iconType'>> = (props) => (
  <CustomSVGIcons {...props} iconType="security" />
);

export const LegacyIcon: React.FC<Omit<CustomSVGIconsProps, 'iconType'>> = (props) => (
  <CustomSVGIcons {...props} iconType="legacy" />
);

export default CustomSVGIcons;