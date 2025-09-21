import React, { useEffect, useRef, useState, createContext, useContext } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

interface ContextualColorThemesProps {
  children: React.ReactNode;
  theme?: 'harmony' | 'contrast' | 'complementary' | 'analogous' | 'triadic' | 'monochrome';
  emotionalTone?: 'calm' | 'energetic' | 'professional' | 'friendly' | 'urgent' | 'celebratory' | 'melancholic' | 'confident';
  userState?: 'focused' | 'distracted' | 'tired' | 'excited' | 'anxious' | 'confident' | 'stressed' | 'relaxed';
  adaptive?: boolean;
  transitionDuration?: number;
  className?: string;
  style?: React.CSSProperties;
  onThemeChange?: (theme: ColorTheme) => void;
}

interface ColorTheme {
  name: string;
  primary: ColorPalette;
  secondary: ColorPalette;
  accent: ColorPalette;
  neutral: ColorPalette;
  semantic: SemanticColors;
  emotionalTone: string;
  userState: string;
  theme: string;
}

interface ColorPalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

interface SemanticColors {
  success: ColorPalette;
  warning: ColorPalette;
  error: ColorPalette;
  info: ColorPalette;
}

interface ThemeTransition {
  from: ColorTheme;
  to: ColorTheme;
  progress: number;
  duration: number;
}

// Theme context for global state management
const ThemeContext = createContext<{
  currentTheme: ColorTheme | null;
  setTheme: (theme: ColorTheme) => void;
  transitionTheme: (to: ColorTheme, duration?: number) => void;
  themes: Record<string, ColorTheme>;
}>({
  currentTheme: null,
  setTheme: () => {},
  transitionTheme: () => {},
  themes: {},
});

export const useThemeContext = () => useContext(ThemeContext);

const ContextualColorThemes: React.FC<ContextualColorThemesProps> = ({
  children,
  theme = 'harmony',
  emotionalTone = 'calm',
  userState = 'focused',
  adaptive = true,
  transitionDuration = 1000,
  className = '',
  style = {},
  onThemeChange,
}) => {
  const [currentTheme, setCurrentTheme] = useState<ColorTheme | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionProgress, setTransitionProgress] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const shouldReduceMotion = useReducedMotion();

  // Base color palettes for different themes
  const basePalettes: Record<string, ColorPalette> = {
    harmony: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    contrast: {
      50: '#fafafa',
      100: '#f4f4f5',
      200: '#e4e4e7',
      300: '#d4d4d8',
      400: '#a1a1aa',
      500: '#71717a',
      600: '#52525b',
      700: '#3f3f46',
      800: '#27272a',
      900: '#18181b',
    },
    complementary: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    analogous: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    triadic: {
      50: '#fdf4ff',
      100: '#fae8ff',
      200: '#f5d0fe',
      300: '#f0abfc',
      400: '#e879f9',
      500: '#d946ef',
      600: '#c026d3',
      700: '#a21caf',
      800: '#86198f',
      900: '#701a75',
    },
    monochrome: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },
  };

  // Emotional tone adjustments
  const emotionalAdjustments: Record<string, Partial<ColorPalette>> = {
    calm: {
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
    },
    energetic: {
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
    },
    professional: {
      500: '#374151',
      600: '#1f2937',
      700: '#111827',
    },
    friendly: {
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
    },
    urgent: {
      500: '#dc2626',
      600: '#b91c1c',
      700: '#991b1b',
    },
    celebratory: {
      500: '#a855f7',
      600: '#9333ea',
      700: '#7c3aed',
    },
    melancholic: {
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
    },
    confident: {
      500: '#1d4ed8',
      600: '#1e40af',
      700: '#1d4ed8',
    },
  };

  // User state adjustments
  const userStateAdjustments: Record<string, Partial<ColorPalette>> = {
    focused: {
      500: '#0ea5e9',
      600: '#0284c7',
    },
    distracted: {
      500: '#22c55e',
      600: '#16a34a',
    },
    tired: {
      500: '#9ca3af',
      600: '#6b7280',
    },
    excited: {
      500: '#ef4444',
      600: '#dc2626',
    },
    anxious: {
      500: '#f59e0b',
      600: '#d97706',
    },
    confident: {
      500: '#1d4ed8',
      600: '#1e40af',
    },
    stressed: {
      500: '#dc2626',
      600: '#b91c1c',
    },
    relaxed: {
      500: '#10b981',
      600: '#059669',
    },
  };

  // Semantic color palettes
  const semanticPalettes: Record<string, ColorPalette> = {
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    info: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
  };

  // Generate contextual color theme
  const generateContextualTheme = (): ColorTheme => {
    const basePalette = basePalettes[theme] ?? basePalettes.harmony;
    const emotionalAdjustment = emotionalAdjustments[emotionalTone];
    const userStateAdjustment = userStateAdjustments[userState];

    // Ensure basePalette is defined
    if (!basePalette) {
      throw new Error(`Invalid theme: ${theme}`);
    }

    // Create primary palette with adjustments
    const primaryPalette: ColorPalette = {
      50: basePalette[50],
      100: basePalette[100],
      200: basePalette[200],
      300: basePalette[300],
      400: basePalette[400],
      500: (emotionalAdjustment as any)?.[500] || (userStateAdjustment as any)?.[500] || basePalette[500],
      600: (emotionalAdjustment as any)?.[600] || (userStateAdjustment as any)?.[600] || basePalette[600],
      700: (emotionalAdjustment as any)?.[700] || (userStateAdjustment as any)?.[700] || basePalette[700],
      800: basePalette[800],
      900: basePalette[900],
    };

    // Generate secondary palette based on theme rules
    const secondaryPalette = generateSecondaryPalette(primaryPalette, theme);
    const accentPalette = generateAccentPalette(primaryPalette, theme);
    const neutralPalette = generateNeutralPalette(primaryPalette);

    return {
      name: `${theme}-${emotionalTone}-${userState}`,
      primary: primaryPalette,
      secondary: secondaryPalette,
      accent: accentPalette,
      neutral: neutralPalette,
      semantic: {
        success: semanticPalettes.success!,
        warning: semanticPalettes.warning!,
        error: semanticPalettes.error!,
        info: semanticPalettes.info!,
      },
      emotionalTone,
      userState,
      theme,
    };
  };

  // Generate secondary palette based on theme rules
  const generateSecondaryPalette = (primary: ColorPalette, themeType: string): ColorPalette => {
    const base = basePalettes[themeType === 'contrast' ? 'harmony' : 'analogous'] ?? basePalettes.harmony;

    // Ensure base is defined
    if (!base) {
      throw new Error(`Invalid theme type for secondary palette: ${themeType}`);
    }

    return {
      50: base[50],
      100: base[100],
      200: base[200],
      300: base[300],
      400: base[400],
      500: base[500],
      600: base[600],
      700: base[700],
      800: base[800],
      900: base[900],
    };
  };

  // Generate accent palette based on theme rules
  const generateAccentPalette = (primary: ColorPalette, themeType: string): ColorPalette => {
    const base = basePalettes[themeType === 'monochrome' ? 'harmony' : 'triadic'] ?? basePalettes.harmony;

    // Ensure base is defined
    if (!base) {
      throw new Error(`Invalid theme type for accent palette: ${themeType}`);
    }

    return {
      50: base[50],
      100: base[100],
      200: base[200],
      300: base[300],
      400: base[400],
      500: base[500],
      600: base[600],
      700: base[700],
      800: base[800],
      900: base[900],
    };
  };

  // Generate neutral palette
  const generateNeutralPalette = (primary: ColorPalette): ColorPalette => {
    const neutralPalette = basePalettes.monochrome ?? basePalettes.harmony;
    
    // Ensure neutralPalette is defined
    if (!neutralPalette) {
      throw new Error('Failed to generate neutral palette');
    }
    
    return neutralPalette;
  };

  // Smooth theme transition
  const transitionTheme = (to: ColorTheme, duration = transitionDuration) => {
    if (!currentTheme || shouldReduceMotion) {
      setCurrentTheme(to);
      onThemeChange?.(to);
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

      // Interpolate between themes
      const interpolatedTheme = interpolateThemes(currentTheme, to, easedProgress);

      setCurrentTheme(interpolatedTheme);
      setTransitionProgress(easedProgress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsTransitioning(false);
        onThemeChange?.(to);
      }
    };

    requestAnimationFrame(animate);
  };

  // Interpolate between two themes
  const interpolateThemes = (from: ColorTheme, to: ColorTheme, factor: number): ColorTheme => {
    return {
      name: `${from.name}-${to.name}`,
      primary: interpolatePalette(from.primary, to.primary, factor),
      secondary: interpolatePalette(from.secondary, to.secondary, factor),
      accent: interpolatePalette(from.accent, to.accent, factor),
      neutral: interpolatePalette(from.neutral, to.neutral, factor),
      semantic: {
        success: interpolatePalette(from.semantic.success, to.semantic.success, factor),
        warning: interpolatePalette(from.semantic.warning, to.semantic.warning, factor),
        error: interpolatePalette(from.semantic.error, to.semantic.error, factor),
        info: interpolatePalette(from.semantic.info, to.semantic.info, factor),
      },
      emotionalTone: factor > 0.5 ? to.emotionalTone : from.emotionalTone,
      userState: factor > 0.5 ? to.userState : from.userState,
      theme: factor > 0.5 ? to.theme : from.theme,
    };
  };

  // Interpolate between two color palettes
  const interpolatePalette = (from: ColorPalette, to: ColorPalette, factor: number): ColorPalette => {
    return {
      50: interpolateColor(from[50], to[50], factor),
      100: interpolateColor(from[100], to[100], factor),
      200: interpolateColor(from[200], to[200], factor),
      300: interpolateColor(from[300], to[300], factor),
      400: interpolateColor(from[400], to[400], factor),
      500: interpolateColor(from[500], to[500], factor),
      600: interpolateColor(from[600], to[600], factor),
      700: interpolateColor(from[700], to[700], factor),
      800: interpolateColor(from[800], to[800], factor),
      900: interpolateColor(from[900], to[900], factor),
    };
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

  // Initialize theme
  useEffect(() => {
    const theme = generateContextualTheme();
    setCurrentTheme(theme);
    onThemeChange?.(theme);
  }, [theme, emotionalTone, userState]);

  // Dynamic styles based on current theme
  const dynamicStyles: React.CSSProperties = {
    transition: shouldReduceMotion ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    ...style,
  };

  // Generate CSS custom properties
  const generateCSSProperties = () => {
    if (!currentTheme) return '';

    const { primary, secondary, accent, neutral, semantic } = currentTheme;

    return `
      .contextual-theme {
        --color-primary-50: ${primary[50]};
        --color-primary-100: ${primary[100]};
        --color-primary-200: ${primary[200]};
        --color-primary-300: ${primary[300]};
        --color-primary-400: ${primary[400]};
        --color-primary-500: ${primary[500]};
        --color-primary-600: ${primary[600]};
        --color-primary-700: ${primary[700]};
        --color-primary-800: ${primary[800]};
        --color-primary-900: ${primary[900]};

        --color-secondary-50: ${secondary[50]};
        --color-secondary-100: ${secondary[100]};
        --color-secondary-200: ${secondary[200]};
        --color-secondary-300: ${secondary[300]};
        --color-secondary-400: ${secondary[400]};
        --color-secondary-500: ${secondary[500]};
        --color-secondary-600: ${secondary[600]};
        --color-secondary-700: ${secondary[700]};
        --color-secondary-800: ${secondary[800]};
        --color-secondary-900: ${secondary[900]};

        --color-accent-50: ${accent[50]};
        --color-accent-100: ${accent[100]};
        --color-accent-200: ${accent[200]};
        --color-accent-300: ${accent[300]};
        --color-accent-400: ${accent[400]};
        --color-accent-500: ${accent[500]};
        --color-accent-600: ${accent[600]};
        --color-accent-700: ${accent[700]};
        --color-accent-800: ${accent[800]};
        --color-accent-900: ${accent[900]};

        --color-neutral-50: ${neutral[50]};
        --color-neutral-100: ${neutral[100]};
        --color-neutral-200: ${neutral[200]};
        --color-neutral-300: ${neutral[300]};
        --color-neutral-400: ${neutral[400]};
        --color-neutral-500: ${neutral[500]};
        --color-neutral-600: ${neutral[600]};
        --color-neutral-700: ${neutral[700]};
        --color-neutral-800: ${neutral[800]};
        --color-neutral-900: ${neutral[900]};

        --color-success-50: ${semantic.success[50]};
        --color-success-100: ${semantic.success[100]};
        --color-success-200: ${semantic.success[200]};
        --color-success-300: ${semantic.success[300]};
        --color-success-400: ${semantic.success[400]};
        --color-success-500: ${semantic.success[500]};
        --color-success-600: ${semantic.success[600]};
        --color-success-700: ${semantic.success[700]};
        --color-success-800: ${semantic.success[800]};
        --color-success-900: ${semantic.success[900]};

        --color-warning-50: ${semantic.warning[50]};
        --color-warning-100: ${semantic.warning[100]};
        --color-warning-200: ${semantic.warning[200]};
        --color-warning-300: ${semantic.warning[300]};
        --color-warning-400: ${semantic.warning[400]};
        --color-warning-500: ${semantic.warning[500]};
        --color-warning-600: ${semantic.warning[600]};
        --color-warning-700: ${semantic.warning[700]};
        --color-warning-800: ${semantic.warning[800]};
        --color-warning-900: ${semantic.warning[900]};

        --color-error-50: ${semantic.error[50]};
        --color-error-100: ${semantic.error[100]};
        --color-error-200: ${semantic.error[200]};
        --color-error-300: ${semantic.error[300]};
        --color-error-400: ${semantic.error[400]};
        --color-error-500: ${semantic.error[500]};
        --color-error-600: ${semantic.error[600]};
        --color-error-700: ${semantic.error[700]};
        --color-error-800: ${semantic.error[800]};
        --color-error-900: ${semantic.error[900]};

        --color-info-50: ${semantic.info[50]};
        --color-info-100: ${semantic.info[100]};
        --color-info-200: ${semantic.info[200]};
        --color-info-300: ${semantic.info[300]};
        --color-info-400: ${semantic.info[400]};
        --color-info-500: ${semantic.info[500]};
        --color-info-600: ${semantic.info[600]};
        --color-info-700: ${semantic.info[700]};
        --color-info-800: ${semantic.info[800]};
        --color-info-900: ${semantic.info[900]};
      }

      .contextual-theme .text-primary { color: var(--color-primary-500); }
      .contextual-theme .text-secondary { color: var(--color-secondary-500); }
      .contextual-theme .text-accent { color: var(--color-accent-500); }
      .contextual-theme .bg-primary { background-color: var(--color-primary-500); }
      .contextual-theme .bg-secondary { background-color: var(--color-secondary-500); }
      .contextual-theme .bg-accent { background-color: var(--color-accent-500); }
      .contextual-theme .border-primary { border-color: var(--color-primary-200); }
      .contextual-theme .border-secondary { border-color: var(--color-secondary-200); }
      .contextual-theme .border-accent { border-color: var(--color-accent-200); }
    `;
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: generateCSSProperties() }} />
      <div
        ref={containerRef}
        className={`contextual-theme ${className}`}
        style={dynamicStyles}
        data-theme={theme}
        data-emotional-tone={emotionalTone}
        data-user-state={userState}
        data-transitioning={isTransitioning}
      >
        {children}

        {/* Transition progress indicator */}
        {isTransitioning && !shouldReduceMotion && (
          <motion.div
            className="fixed top-0 left-0 h-1 bg-gradient-to-r from-primary-500 to-accent-500 z-50"
            style={{ width: `${transitionProgress * 100}%` }}
            transition={{ duration: 0.1 }}
          />
        )}

        {/* Theme preview for debugging */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 right-4 p-4 bg-neutral-50 rounded-lg shadow-lg opacity-75">
            <div className="text-xs text-neutral-700 space-y-2">
              <div className="font-semibold">Current Theme</div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-primary-500"></div>
                <span>Primary</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-secondary-500"></div>
                <span>Secondary</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-accent-500"></div>
                <span>Accent</span>
              </div>
              <div className="text-xs text-neutral-500 mt-2">
                {theme} • {emotionalTone} • {userState}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// Preset theme components for easy usage
export const HarmonyTheme: React.FC<Omit<ContextualColorThemesProps, 'theme'>> = (props) => (
  <ContextualColorThemes {...props} theme="harmony" />
);

export const ProfessionalTheme: React.FC<Omit<ContextualColorThemesProps, 'theme' | 'emotionalTone'>> = (props) => (
  <ContextualColorThemes {...props} theme="contrast" emotionalTone="professional" />
);

export const EnergeticTheme: React.FC<Omit<ContextualColorThemesProps, 'theme' | 'emotionalTone'>> = (props) => (
  <ContextualColorThemes {...props} theme="complementary" emotionalTone="energetic" />
);

export const CalmTheme: React.FC<Omit<ContextualColorThemesProps, 'theme' | 'emotionalTone'>> = (props) => (
  <ContextualColorThemes {...props} theme="analogous" emotionalTone="calm" />
);

export const CelebratoryTheme: React.FC<Omit<ContextualColorThemesProps, 'theme' | 'emotionalTone'>> = (props) => (
  <ContextualColorThemes {...props} theme="triadic" emotionalTone="celebratory" />
);

export default ContextualColorThemes;