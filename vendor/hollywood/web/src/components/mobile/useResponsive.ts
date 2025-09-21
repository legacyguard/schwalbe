import { useEffect, useState } from 'react';

/**
 * Hook for responsive utilities
 */
export function useResponsive() {
  const [screenSize, setScreenSize] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setScreenSize({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        width,
        height,
      });
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);

    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  return screenSize;
}

/**
 * Hook for device capabilities
 */
export function useDeviceCapabilities() {
  const [capabilities, setCapabilities] = useState({
    hasTouchScreen: false,
    hasHoverSupport: false,
    hasMotionSupport: false,
    hasGeolocation: false,
    hasCamera: false,
    hasNotifications: false,
    isOnline: true,
    connection: {
      type: 'unknown',
      effectiveType: 'unknown',
      downlink: 0,
      rtt: 0,
    },
  });

  useEffect(() => {
    const updateCapabilities = () => {
      // Touch screen detection
      const hasTouchScreen =
        'ontouchstart' in window || navigator.maxTouchPoints > 0;

      // Hover support detection
      const hasHoverSupport = window.matchMedia('(hover: hover)').matches;

      // Motion support detection
      const hasMotionSupport = 'DeviceMotionEvent' in window;

      // Geolocation support
      const hasGeolocation = 'geolocation' in navigator;

      // Camera support
      const hasCamera =
        'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;

      // Notifications support
      const hasNotifications = 'Notification' in window;

      // Network connection info
      const connection =
        (navigator as any).connection ||
        (navigator as any).mozConnection ||
        (navigator as any).webkitConnection;
      const connectionInfo = connection
        ? {
            type: connection.type || 'unknown',
            effectiveType: connection.effectiveType || 'unknown',
            downlink: connection.downlink || 0,
            rtt: connection.rtt || 0,
          }
        : {
            type: 'unknown',
            effectiveType: 'unknown',
            downlink: 0,
            rtt: 0,
          };

      setCapabilities({
        hasTouchScreen,
        hasHoverSupport,
        hasMotionSupport,
        hasGeolocation,
        hasCamera,
        hasNotifications,
        isOnline: navigator.onLine,
        connection: connectionInfo,
      });
    };

    updateCapabilities();

    // Listen for network changes
    window.addEventListener('online', updateCapabilities);
    window.addEventListener('offline', updateCapabilities);

    // Listen for connection changes
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updateCapabilities);
    }

    return () => {
      window.removeEventListener('online', updateCapabilities);
      window.removeEventListener('offline', updateCapabilities);
      if (connection) {
        connection.removeEventListener('change', updateCapabilities);
      }
    };
  }, []);

  return capabilities;
}

/**
 * Safe Area utilities for devices with notches/home indicators
 */
export function useSafeArea() {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  useEffect(() => {
    const updateSafeArea = () => {
      const computedStyle = getComputedStyle(document.documentElement);

      setSafeArea({
        top: parseInt(
          computedStyle.getPropertyValue('--safe-area-inset-top') || '0'
        ),
        right: parseInt(
          computedStyle.getPropertyValue('--safe-area-inset-right') || '0'
        ),
        bottom: parseInt(
          computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0'
        ),
        left: parseInt(
          computedStyle.getPropertyValue('--safe-area-inset-left') || '0'
        ),
      });
    };

    updateSafeArea();
    window.addEventListener('orientationchange', updateSafeArea);
    window.addEventListener('resize', updateSafeArea);

    return () => {
      window.removeEventListener('orientationchange', updateSafeArea);
      window.removeEventListener('resize', updateSafeArea);
    };
  }, []);

  return safeArea;
}

/**
 * Orientation utilities
 */
export function useOrientation() {
  const [orientation, setOrientation] = useState({
    angle: 0,
    isPortrait: true,
    isLandscape: false,
  });

  useEffect(() => {
    const updateOrientation = () => {
      const angle =
        (screen as any).orientation?.angle || window.orientation || 0;
      const isPortrait = window.innerHeight > window.innerWidth;

      setOrientation({
        angle,
        isPortrait,
        isLandscape: !isPortrait,
      });
    };

    updateOrientation();
    window.addEventListener('orientationchange', updateOrientation);
    window.addEventListener('resize', updateOrientation);

    return () => {
      window.removeEventListener('orientationchange', updateOrientation);
      window.removeEventListener('resize', updateOrientation);
    };
  }, []);

  return orientation;
}
