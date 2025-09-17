import React, { createContext, useContext, useEffect, useState } from 'react';

/**
 * Hook to check if mobile navigation should be displayed
 */
export function useMobileNavigation() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return { isMobile };
}

/**
 * Mobile Navigation Provider for global state management
 */
interface MobileNavContextType {
  hapticFeedback: boolean;
  notificationCount: number;
  setHapticFeedback: (enabled: boolean) => void;
  setNotificationCount: (count: number) => void;
}

const MobileNavContext = createContext<MobileNavContextType | undefined>(
  undefined
);

export function MobileNavProvider({ children }: { children: React.ReactNode }) {
  const [notificationCount, setNotificationCount] = useState(0);
  const [hapticFeedback, setHapticFeedback] = useState(true);

  const value = {
    notificationCount,
    setNotificationCount,
    hapticFeedback,
    setHapticFeedback,
  };

  return (
    <MobileNavContext.Provider value={value}>
      {children}
    </MobileNavContext.Provider>
  );
}

export function useMobileNavContext() {
  const context = useContext(MobileNavContext);
  if (context === undefined) {
    throw new Error(
      'useMobileNavContext must be used within a MobileNavProvider'
    );
  }
  return context;
}
