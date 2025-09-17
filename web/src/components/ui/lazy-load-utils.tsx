
import React, { type ComponentType, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Higher-order component for lazy loading
export function withLazyLoading<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: {
    delay?: number;
    fallback?: React.ReactNode;
    priority?: 'high' | 'low' | 'medium';
    rootMargin?: string;
    threshold?: number;
  } = {}
) {
  return React.forwardRef<any, P>((props, ref) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
      if (!containerRef.current) return;

      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setIsVisible(true);
              const actualDelay =
                options.priority === 'high' ? 0 : options.delay || 0;
              setTimeout(() => {
                setIsLoaded(true);
              }, actualDelay);
              observer.disconnect();
            }
          });
        },
        {
          threshold: options.threshold || 0.1,
          rootMargin: options.rootMargin || '50px',
        }
      );

      observerRef.current = observer;
      observer.observe(containerRef.current);

      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      };
    }, [
      options.threshold,
      options.rootMargin,
      options.delay,
      options.priority,
    ]);

    // Priority-based immediate loading
    useEffect(() => {
      if (options.priority === 'high') {
        setIsVisible(true);
        setIsLoaded(true);
      }
    }, [options.priority]);

    if (!isVisible) {
      return (
        <div ref={containerRef} className='lazy-load-container'>
          {options.fallback || (
            <div className='lazy-load-fallback'>Loading...</div>
          )}
        </div>
      );
    }

    if (!isLoaded) {
      return (
        <div className='lazy-load-container'>
          <AnimatePresence mode='wait'>
            <motion.div
              key='fallback'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className='lazy-load-fallback'
            >
              {options.fallback || <div>Loading...</div>}
            </motion.div>
          </AnimatePresence>
        </div>
      );
    }

    return (
      <div ref={containerRef}>
        <WrappedComponent {...(props as any)} ref={ref} />
      </div>
    );
  });
}

// Hook for lazy loading logic
export const useLazyLoading = (
  options: {
    delay?: number;
    priority?: 'high' | 'low' | 'medium';
    rootMargin?: string;
    threshold?: number;
  } = {}
) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            const actualDelay =
              options.priority === 'high' ? 0 : options.delay || 0;
            setTimeout(() => {
              setIsLoaded(true);
            }, actualDelay);
            observer.disconnect();
          }
        });
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '50px',
      }
    );

    observerRef.current = observer;
    observer.observe(containerRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [options.threshold, options.rootMargin, options.delay, options.priority]);

  // Priority-based immediate loading
  useEffect(() => {
    if (options.priority === 'high') {
      setIsVisible(true);
      setIsLoaded(true);
    }
  }, [options.priority]);

  return {
    isVisible,
    isLoaded,
    containerRef,
  };
};
