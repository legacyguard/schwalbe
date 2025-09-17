import React from 'react';
import { TamaguiProvider as TamaguiProviderBase } from 'tamagui';
import { config as tamaguiConfig } from '../tamagui.config';
import {
  ThemeProvider as AppThemeProvider,
  useAppTheme,
} from '@/contexts/ThemeContext';

interface ProvidersProps {
  children: React.ReactNode;
}

// Inner component that uses the theme context
function TamaguiProviderInner({ children }: ProvidersProps) {
  const { actualTheme } = useAppTheme();

  return (
    <TamaguiProviderBase config={tamaguiConfig} defaultTheme={actualTheme}>
      {children}
    </TamaguiProviderBase>
  );
}

// Main provider that wraps both theme providers
export function TamaguiProvider({ children }: ProvidersProps) {
  return (
    <AppThemeProvider>
      <TamaguiProviderInner>{children}</TamaguiProviderInner>
    </AppThemeProvider>
  );
}
