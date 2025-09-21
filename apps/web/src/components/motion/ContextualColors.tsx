import React, { useEffect, useRef, useState, createContext, useContext } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

interface ContextualColorsProps {
  children: React.ReactNode;
  context?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  emotionalTone?: 'calm' | 'energetic' | 'professional' | 'friendly' | 'urgent' | 'celebratory';
  userState?: 'focused' | 'distracted' | 'tired' | 'excited' | 'anxious' | 'confident';
  adaptive?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onColorChange?: (colors: ColorPalette) => void;
}

interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  border: string;
  shadow: string;
}

interface ColorTheme {
  name: string;
  palette: ColorPalette;
  context: string;
  emotionalTone: string;
  userState: string;
}

interface ColorTransition {
  from: ColorPalette;
  to: ColorPalette;
  duration: number;
  easing: string;
}

// Color context for global state management
const ColorContext = createContext<{
  currentTheme: ColorTheme | null;
  setTheme: (theme: ColorTheme) => void;
  transitionColors: (from: ColorPalette, to: ColorPalette, duration?: number) => void;
}>({
  currentTheme: null,
  setTheme: () => {},
  transitionColors: () => {},
});

export const useColorContext = () => useContext(ColorContext);

const ContextualColors: React.FC<ContextualColorsProps> = ({
  children,
  context = 'primary',
  emotionalTone = 'calm',
  userState = 'focused',
  adaptive = true,
  className = '',
  style = {},
  onColorChange,
}) => {
  const [currentPalette, setCurrentPalette] = useState<ColorPalette | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionProgress, setTransitionProgress] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const shouldReduceMotion = useReducedMotion();

  // Base color palettes for different contexts
  const basePalettes: Record<string, ColorPalette> = {
    primary: {
      primary: '#667eea',
      secondary: '#764ba2',
      accent: '#f093fb',
      background: '#ffffff',
      surface: '#f8f9fa',
      text: '#2d3748',
      border: '#e2e8f0',
      shadow: 'rgba(102, 126, 234, 0.1)',
    },
    secondary: {
      primary: '#48bb78',
      secondary: '#38a169',
      accent: '#68d391',
      background: '#ffffff',
      surface: '#f0fff4',
      text: '#2f855a',
      border: '#c6f6d5',
      shadow: 'rgba(72, 187, 120, 0.1)',
    },
    success: {
      primary: '#48bb78',
      secondary: '#38a169',
      accent: '#68d391',
      background: '#ffffff',
      surface: '#f0fff4',
      text: '#2f855a',
      border: '#c6f6d5',
      shadow: 'rgba(72, 187, 120, 0.15)',
    },
    warning: {
      primary: '#ed8936',
      secondary: '#dd6b20',
      accent: '#f6ad55',
      background: '#ffffff',
      surface: '#fffaf0',
      text: '#9c4221',
      border: '#fbb6ce',
      shadow: 'rgba(237, 137, 54, 0.1)',
    },
    error: {
      primary: '#f56565',
      secondary: '#e53e3e',
      accent: '#fc8181',
      background: '#ffffff',
      surface: '#fed7d7',
      text: '#c53030',
      border: '#feb2b2',
      shadow: 'rgba(245, 101, 101, 0.1)',
    },
    info: {
      primary: '#4299e1',
      secondary: '#3182ce',
      accent: '#63b3ed',
      background: '#ffffff',
      surface: '#ebf8ff',
      text: '#2b6cb0',
      border: '#bee3f8',
      shadow: 'rgba(66, 153, 225, 0.1)',
    },
    neutral: {
      primary: '#718096',
      secondary: '#4a5568',
      accent: '#a0aec0',
      background: '#ffffff',
      surface: '#f7fafc',
      text: '#2d3748',
      border: '#e2e8f0',
      shadow: 'rgba(113, 128, 150, 0.05)',
    },
  };

  // Emotional tone adjustments
  const emotionalAdjustments: Record<string, Partial<ColorPalette>> = {
    calm: {
      primary: '#667eea',
      secondary: '#764ba2',
      accent: '#f093fb',
      shadow: 'rgba(102, 126, 234, 0.08)',
    },
    energetic: {
      primary: '#ff6b6b',
      secondary: '#4ecdc4',
      accent: '#45b7d1',
      shadow: 'rgba(255, 107, 107, 0.15)',
    },
    professional: {
      primary: '#2b6cb0',
      secondary: '#3182ce',
      accent: '#63b3ed',
      shadow: 'rgba(43, 108, 176, 0.1)',
    },
    friendly: {
      primary: '#38b2ac',
      secondary: '#81e6d9',
      accent: '#4fd1c7',
      shadow: 'rgba(56, 178, 172, 0.12)',
    },
    urgent: {
      primary: '#e53e3e',
      secondary: '#fc8181',
      accent: '#f56565',
      shadow: 'rgba(229, 62, 62, 0.15)',
    },
    celebratory: {
      primary: '#9f7aea',
      secondary: '#d53f8c',
      accent: '#ed64a6',
      shadow: 'rgba(159, 122, 234, 0.15)',
    },
  };

  // User state adjustments
  const userStateAdjustments: Record<string, Partial<ColorPalette>> = {
    focused: {
      primary: '#667eea',
      shadow: 'rgba(102, 126, 234, 0.1)',
    },
    distracted: {
      primary: '#48bb78',
      shadow: 'rgba(72, 187, 120, 0.12)',
    },
    tired: {
      primary: '#a0aec0',
      shadow: 'rgba(160, 174, 192, 0.08)',
    },
    excited: {
      primary: '#ff6b6b',
      shadow: 'rgba(255, 107, 107, 0.15)',
    },
    anxious: {
      primary: '#ed8936',
      shadow: 'rgba(237, 137, 54, 0.12)',
    },
    confident: {
      primary: '#9f7aea',
      shadow: 'rgba(159, 122, 234, 0.12)',
    },
  };

  // Generate contextual color palette
  const generateContextualPalette = (): ColorPalette => {
    const basePalette = (basePalettes[context] ?? basePalettes.primary) as ColorPalette;
    const emotionalAdjustment = emotionalAdjustments[emotionalTone];
    const userStateAdjustment = userStateAdjustments[userState];

    // Merge adjustments with base palette
    const contextualPalette: ColorPalette = {
      primary: (emotionalAdjustment as any)?.primary || (userStateAdjustment as any)?.primary || basePalette.primary,
      secondary: (emotionalAdjustment as any)?.secondary || (userStateAdjustment as any)?.secondary || basePalette.secondary,
      accent: (emotionalAdjustment as any)?.accent || (userStateAdjustment as any)?.accent || basePalette.accent,
      background: (emotionalAdjustment as any)?.background || (userStateAdjustment as any)?.background || basePalette.background,
      surface: (emotionalAdjustment as any)?.surface || (userStateAdjustment as any)?.surface || basePalette.surface,
      text: (emotionalAdjustment as any)?.text || (userStateAdjustment as any)?.text || basePalette.text,
      border: (emotionalAdjustment as any)?.border || (userStateAdjustment as any)?.border || basePalette.border,
      shadow: (emotionalAdjustment as any)?.shadow || (userStateAdjustment as any)?.shadow || basePalette.shadow,
    };

    return contextualPalette;
  };

  // Smooth color transition
  const transitionColors = (from: ColorPalette, to: ColorPalette, duration = 1000) => {
    if (shouldReduceMotion) {
      setCurrentPalette(to);
      return;
    }

    setIsTransitioning(true);
    setTransitionProgress(0);

    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth transition
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      // Interpolate colors
      const interpolatedPalette: ColorPalette = {
        primary: interpolateColor(from.primary, to.primary, easedProgress),
        secondary: interpolateColor(from.secondary, to.secondary, easedProgress),
        accent: interpolateColor(from.accent, to.accent, easedProgress),
        background: interpolateColor(from.background, to.background, easedProgress),
        surface: interpolateColor(from.surface, to.surface, easedProgress),
        text: interpolateColor(from.text, to.text, easedProgress),
        border: interpolateColor(from.border, to.border, easedProgress),
        shadow: from.shadow, // Keep shadow as is for now
      };

      setCurrentPalette(interpolatedPalette);
      setTransitionProgress(easedProgress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsTransitioning(false);
        onColorChange?.(to);
      }
    };

    requestAnimationFrame(animate);
  };

  // Color interpolation helper
  const interpolateColor = (color1: string, color2: string, factor: number): string => {
    const hex1 = color1.replace('#', '');
    const hex2 = color2.replace('#', '');

    const r1 = parseInt(hex1.substr(0, 2), 16);
    const g1 = parseInt(hex1.substr(2, 2), 16);
    const b1 = parseInt(hex1.substr(4, 2), 16);

    const r2 = parseInt(hex2.substr(0, 2), 16);
    const g2 = parseInt(hex2.substr(2, 2), 16);
    const b2 = parseInt(hex2.substr(4, 2), 16);

    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);

    return `rgb(${r}, ${g}, ${b})`;
  };

  // Initialize palette
  useEffect(() => {
    const palette = generateContextualPalette();
    setCurrentPalette(palette);
    onColorChange?.(palette);
  }, [context, emotionalTone, userState]);

  // Dynamic styles based on current palette
  const dynamicStyles: React.CSSProperties = {
    transition: shouldReduceMotion ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    ...style,
  };

  // CSS custom properties for the color system
  const colorCSS = `
    .contextual-colors {
      --color-primary: ${currentPalette?.primary || '#667eea'};
      --color-secondary: ${currentPalette?.secondary || '#764ba2'};
      --color-accent: ${currentPalette?.accent || '#f093fb'};
      --color-background: ${currentPalette?.background || '#ffffff'};
      --color-surface: ${currentPalette?.surface || '#f8f9fa'};
      --color-text: ${currentPalette?.text || '#2d3748'};
      --color-border: ${currentPalette?.border || '#e2e8f0'};
      --shadow-color: ${currentPalette?.shadow || 'rgba(102, 126, 234, 0.1)'};
    }

    .contextual-colors .text-primary { color: var(--color-primary); }
    .contextual-colors .text-secondary { color: var(--color-secondary); }
    .contextual-colors .text-accent { color: var(--color-accent); }
    .contextual-colors .bg-primary { background-color: var(--color-primary); }
    .contextual-colors .bg-secondary { background-color: var(--color-secondary); }
    .contextual-colors .bg-accent { background-color: var(--color-accent); }
    .contextual-colors .bg-surface { background-color: var(--color-surface); }
    .contextual-colors .border-color { border-color: var(--color-border); }
    .contextual-colors .shadow-custom { box-shadow: 0 4px 6px var(--shadow-color); }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: colorCSS }} />
      <div
        ref={containerRef}
        className={`contextual-colors ${className}`}
        style={dynamicStyles}
        data-context={context}
        data-emotional-tone={emotionalTone}
        data-user-state={userState}
        data-transitioning={isTransitioning}
      >
        {children}

        {/* Transition progress indicator */}
        {isTransitioning && !shouldReduceMotion && (
          <motion.div
            className="fixed top-0 left-0 h-1 bg-gradient-to-r from-primary to-accent z-50"
            style={{ width: `${transitionProgress * 100}%` }}
            transition={{ duration: 0.1 }}
          />
        )}

        {/* Color palette preview for debugging */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 right-4 p-4 bg-surface rounded-lg shadow-custom opacity-75">
            <div className="text-xs text-text space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span>Primary</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-secondary"></div>
                <span>Secondary</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent"></div>
                <span>Accent</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// Preset color themes for easy usage
export const CalmTheme: React.FC<Omit<ContextualColorsProps, 'emotionalTone'>> = (props) => (
  <ContextualColors {...props} emotionalTone="calm" />
);

export const EnergeticTheme: React.FC<Omit<ContextualColorsProps, 'emotionalTone'>> = (props) => (
  <ContextualColors {...props} emotionalTone="energetic" />
);

export const ProfessionalTheme: React.FC<Omit<ContextualColorsProps, 'emotionalTone'>> = (props) => (
  <ContextualColors {...props} emotionalTone="professional" />
);

export const SuccessTheme: React.FC<Omit<ContextualColorsProps, 'context'>> = (props) => (
  <ContextualColors {...props} context="success" />
);

export const WarningTheme: React.FC<Omit<ContextualColorsProps, 'context'>> = (props) => (
  <ContextualColors {...props} context="warning" />
);

export const ErrorTheme: React.FC<Omit<ContextualColorsProps, 'context'>> = (props) => (
  <ContextualColors {...props} context="error" />
);

export default ContextualColors;