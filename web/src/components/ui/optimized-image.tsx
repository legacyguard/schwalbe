
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  alt: string;
  className?: string;
  decoding?: 'async' | 'auto' | 'sync';
  fallbackSrc?: string;
  height?: number;
  loading?: 'eager' | 'lazy';
  onError?: () => void;
  onLoad?: () => void;
  placeholder?: 'blur' | 'color' | 'none';
  placeholderColor?: string;
  priority?: boolean; // Whether to preload this image
  sizes?: string; // Responsive image sizes
  src: string;
  width?: number;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  placeholder: _placeholder = 'color',
  placeholderColor = 'hsl(var(--muted))',
  sizes = '100vw',
  onLoad,
  onError,
  fallbackSrc,
  loading = 'lazy',
  decoding = 'async',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before the image comes into view
        threshold: 0.1,
      }
    );

    observerRef.current = observer;
    observer.observe(imgRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [priority]);

  // Handle image load
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  // Handle image error
  const handleError = useCallback(() => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
    } else {
      setHasError(true);
      onError?.();
    }
  }, [fallbackSrc, currentSrc, onError]);

  // Preload critical images
  useEffect(() => {
    if (priority && src) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);

      return () => {
    return undefined;
        document.head.removeChild(link);
      };
    }
  }, [priority, src]);

  // Generate responsive srcSet for modern formats
  // const __generateSrcSet = useCallback((imageSrc: string) => { // Unused
  // if (!imageSrc.includes('.webp') && !imageSrc.includes('.avif')) {
  // return undefined; // Only generate srcSet for modern formats
  // }
  //
  // const baseUrl = imageSrc.split('.')[0];
  // const extension = imageSrc.split('.').pop();
  //
  // return [
  // `${baseUrl}-300w.${extension} 300w`,
  // `${baseUrl}-600w.${extension} 600w`,
  // `${baseUrl}-900w.${extension} 900w`,
  // `${baseUrl}-1200w.${extension} 1200w`,
  // ].join(', ');
  // }, []); // Unused

  // Convert image to WebP if supported
  // const __getOptimizedSrc = useCallback((imageSrc: string) => { // Unused
  // if (typeof window !== 'undefined' && 'createImageBitmap' in window) {
      // Check if WebP is supported
  // const canvas = document.createElement('canvas');
  // const ctx = canvas.getContext('2d');
  // if (ctx) {
        // Try to create a WebP image
  // const img = new Image();
  // img.onload = () => {
  // canvas.width = img.width;
  // canvas.height = img.height;
  // ctx.drawImage(img, 0, 0);
  //
          // Convert to WebP if possible
  // try {
  // canvas.toBlob(
  // blob => {
  // if (blob) {
  // const webpUrl = URL.createObjectURL(blob);
  // setCurrentSrc(webpUrl);
  // }
  // },
  // 'image/webp',
  // 0.8
  // );
  // } catch (error) {
  // console.warn('WebP conversion failed:', error);
  // }
  // };
  // img.src = imageSrc;
  // }
  // }
  // return imageSrc;
  // }, []); // Unused

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (currentSrc.startsWith('blob:')) {
        URL.revokeObjectURL(currentSrc);
      }
    };
  }, [currentSrc]);

  if (hasError && !fallbackSrc) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground',
          className
        )}
        style={{ width, height }}
      >
        <span className='text-sm'>Image failed to load</span>
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Placeholder */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className='absolute inset-0'
            style={{
              backgroundColor: placeholderColor,
              width,
              height,
            }}
          />
        )}
      </AnimatePresence>

      {/* Actual Image */}
      {isInView && (
        <motion.img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          loading={loading}
          decoding={decoding}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          style={{
            width: width ? `${width}px` : '100%',
            height: height ? `${height}px` : 'auto',
          }}
        />
      )}

      {/* Loading skeleton for non-priority images */}
      {!priority && !isLoaded && (
        <div
          className='absolute inset-0 bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse'
          style={{
            width,
            height,
          }}
        />
      )}
    </div>
  );
};

// Export a simpler version for basic use cases
export const LazyImage: React.FC<
  Omit<OptimizedImageProps, 'placeholder' | 'priority'>
> = props => <OptimizedImage {...props} priority={false} placeholder='color' />;

// Export a priority version for above-the-fold images
export const PriorityImage: React.FC<
  Omit<OptimizedImageProps, 'loading' | 'priority'>
> = props => <OptimizedImage {...props} priority={true} loading='eager' />;
