
import React from 'react';
import { useTheme } from '@tamagui/core';
import { useColorScheme } from 'react-native';

/**
 * Hook for dark mode aware colors and utilities
 */
export const useDarkMode = (): {
  isDark: boolean;
  colors: any;
  semantic: any;
  getColor: (lightColor: string, darkColor: string) => string;
  getStyle: <T extends Record<string, unknown>>(lightStyle: T, darkStyle: T) => T;
  theme: any;
} => {
  const theme = useTheme();
  const systemColorScheme = useColorScheme();

  // Check if we're in dark mode
  const isDark =
    theme.background?.get() === theme.backgroundDark?.get() ||
    systemColorScheme === 'dark';

  // Helper functions for conditional styling
  const getColor = (lightColor: string, darkColor: string) => {
    return isDark ? darkColor : lightColor;
  };

  const getStyle = <T extends Record<string, unknown>>(
    lightStyle: T,
    darkStyle: T
  ): T => {
    return isDark ? darkStyle : lightStyle;
  };

  // Common color mappings for dark mode
  const colors = {
    text: {
      primary: isDark ? theme.gray1?.val : theme.gray10?.val,
      secondary: isDark ? theme.gray3?.val : theme.gray7?.val,
      muted: isDark ? theme.gray5?.val : theme.gray6?.val,
      inverse: isDark ? theme.gray10?.val : theme.gray1?.val,
    },
    background: {
      primary: isDark ? theme.backgroundDark?.val : theme.background?.val,
      secondary: isDark ? theme.backgroundDarkSecondary?.val : theme.gray2?.val,
      elevated: isDark ? theme.gray9?.val : theme.background?.val,
      overlay: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)',
    },
    border: {
      default: isDark ? theme.gray8?.val : theme.gray3?.val,
      light: isDark ? theme.gray9?.val : theme.gray2?.val,
      strong: isDark ? theme.gray7?.val : theme.gray4?.val,
    },
    status: {
      success: isDark ? theme.primaryGreenLight?.val : theme.primaryGreen?.val,
      error: isDark ? '#ef4444' : theme.error?.val,
      warning: isDark ? theme.accentGoldLight?.val : theme.accentGold?.val,
      info: isDark ? theme.primaryBlueLight?.val : theme.primaryBlue?.val,
    },
    shadow: {
      color: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.1)',
      elevation: isDark ? 8 : 4,
    },
  };

  // Semantic color tokens
  const semantic = {
    cardBackground: colors.background.elevated,
    cardBorder: colors.border.light,
    inputBackground: isDark ? theme.gray9?.val : theme.background?.val,
    inputBorder: colors.border.default,
    buttonPrimaryBg: theme.primaryBlue?.val,
    buttonPrimaryText: '#ffffff',
    buttonSecondaryBg: isDark ? theme.gray8?.val : theme.gray2?.val,
    buttonSecondaryText: colors.text.primary,
    dividerColor: colors.border.light,
    iconColor: colors.text.secondary,
    linkColor: theme.primaryBlue?.val,
    overlayBackground: colors.background.overlay,
  };

  return {
    isDark,
    colors,
    semantic,
    getColor,
    getStyle,
    theme,
  };
};

// Export helper HOC for dark mode aware components
export const withDarkMode = <P extends object>(
  Component: React.ComponentType<P & { isDark: boolean }>
) => {
  return (props: P) => {
    const { isDark } = useDarkMode();
    return <Component {...props} isDark={isDark} />;
  };
};
