
import React, { createContext, useContext, useState } from 'react';

interface FocusModeContextType {
  enterFocusMode: () => void;
  exitFocusMode: () => void;
  isFocusMode: boolean;
}

const FocusModeContext = createContext<FocusModeContextType | undefined>(
  undefined
);

export const useFocusMode = () => {
  const context = useContext(FocusModeContext);
  if (context === undefined) {
    throw new Error('useFocusMode must be used within a FocusModeProvider');
  }
  return context;
};

interface FocusModeProviderProps {
  children: React.ReactNode;
}

export const FocusModeProvider: React.FC<FocusModeProviderProps> = ({
  children,
}) => {
  const [isFocusMode, setIsFocusMode] = useState(false);

  const enterFocusMode = () => {
    setIsFocusMode(true);
    // Hide body overflow to prevent scrolling issues
    document.body.style.overflow = 'hidden';
    // Add focus mode class for potential global styling
    document.body.classList.add('focus-mode');
  };

  const exitFocusMode = () => {
    setIsFocusMode(false);
    // Restore body overflow
    document.body.style.overflow = '';
    // Remove focus mode class
    document.body.classList.remove('focus-mode');
  };

  const value = {
    isFocusMode,
    enterFocusMode,
    exitFocusMode,
  };

  return (
    <FocusModeContext.Provider value={value}>
      {children}
    </FocusModeContext.Provider>
  );
};
