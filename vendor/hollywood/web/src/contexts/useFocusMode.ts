
import { type Context, useContext } from 'react';

export interface FocusModeContextType {
  enterFocusMode: () => void;
  exitFocusMode: () => void;
  isFocusMode: boolean;
}

// This context is defined in FocusModeContext.tsx
declare const FocusModeContext: Context<FocusModeContextType | undefined>;

export const useFocusMode = () => {
  const context = useContext(FocusModeContext);
  if (context === undefined) {
    throw new Error('useFocusMode must be used within a FocusModeProvider');
  }
  return context;
};
