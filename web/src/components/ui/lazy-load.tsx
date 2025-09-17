
import React, {
  type ComponentType,
  Suspense,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LazyLoadProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // Artificial delay for staggered loading
  fallback?: React.ReactNode;
  onLoad?: () => void;
  priority?: 'high' | 'low' | 'medium';
  rootMargin?: string; // Root margin for intersection observer
  threshold?: number; // Intersection threshold (0-1)
}

interface LazyComponentProps {
  component: ComponentType<any>;
  delay?: number;
  fallback?: React.ReactNode;
  priority?: 'high' | 'low' | 'medium';
  props?: Record<string, any>;
  rootMargin?: string;
  threshold?: number;
}

// Lazy loading wrapper for regular content
export const LazyLoad: React.FC<LazyLoadProps> = ({
  children,
  threshold = 0.1,
  rootMargin = '50px',
  fallback,
  className,
  onLoad,
  delay = 0,
  priority = 'medium',
}) => {
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

            // Apply delay based on priority
            const actualDelay = priority === 'high' ? 0 : delay;

            setTimeout(() => {
              setIsLoaded(true);
              onLoad?.();
            }, actualDelay);

            observer.disconnect();
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observerRef.current = observer;
    observer.observe(containerRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold, rootMargin, onLoad, delay, priority]);

  // Priority-based immediate loading
  useEffect(() => {
    if (priority === 'high') {
      setIsVisible(true);
      setIsLoaded(true);
      onLoad?.();
    }
  }, [priority, onLoad]);

  return (
    <div ref={containerRef} className={cn('lazy-load-container', className)}>
      <AnimatePresence mode='wait'>
        {!isLoaded && fallback && (
          <motion.div
            key='fallback'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className='lazy-load-fallback'
          >
            {fallback}
          </motion.div>
        )}
      </AnimatePresence>

      {isVisible && (
        <motion.div
          key='content'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
          transition={{
            duration: 0.5,
            delay: priority === 'high' ? 0 : 0.1,
          }}
          className='lazy-load-content'
        >
          {children}
        </motion.div>
      )}
    </div>
  );
};

// Lazy loading wrapper for React components
export const LazyComponent: React.FC<LazyComponentProps> = ({
  component: Component,
  props = {},
  fallback,
  threshold = 0.1,
  rootMargin = '50px',
  delay = 0,
  priority = 'medium',
}) => {
  const [shouldLoad, setShouldLoad] = useState(priority === 'high');
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (priority === 'high' || !containerRef.current) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setShouldLoad(true);
            }, delay);
            observer.disconnect();
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observerRef.current = observer;
    observer.observe(containerRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold, rootMargin, delay, priority]);

  return (
    <div ref={containerRef} className='lazy-component-container'>
      {shouldLoad ? (
        <Suspense fallback={fallback}>
          <Component {...props} />
        </Suspense>
      ) : (
        fallback
      )}
    </div>
  );
};

// Higher-order component for lazy loading
export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  options: {
    delay?: number;
    fallback?: React.ReactNode;
    priority?: 'high' | 'low' | 'medium';
    rootMargin?: string;
    threshold?: number;
  } = {}
) {
  const WrappedComponent: React.FC<P> = props => (
    <LazyComponent component={Component} props={props} {...options} />
  );

  WrappedComponent.displayName = `withLazyLoading(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// Utility hook for lazy loading state
export const useLazyLoading = (
  threshold = 0.1,
  rootMargin = '50px',
  priority: 'high' | 'low' | 'medium' = 'medium'
) => {
  const [isVisible, setIsVisible] = useState(priority === 'high');
  const [isLoaded, setIsLoaded] = useState(priority === 'high');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority === 'high' || !containerRef.current) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            setTimeout(() => setIsLoaded(true), 100);
            observer.disconnect();
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [threshold, rootMargin, priority]);

  return {
    isVisible,
    isLoaded,
    containerRef,
  };
};

// Export default fallback component
export const DefaultLazyFallback: React.FC = () => (
  <div className='flex items-center justify-center p-8'>
    <div className='animate-pulse space-y-3'>
      <div className='h-4 bg-muted rounded w-3/4'></div>
      <div className='h-4 bg-muted rounded w-1/2'></div>
      <div className='h-4 bg-muted rounded w-5/6'></div>
    </div>
  </div>
);
