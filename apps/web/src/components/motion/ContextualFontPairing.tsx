import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

export type FontPairing =
  | 'elegant-serif'
  | 'modern-sans'
  | 'playful-display'
  | 'technical-mono'
  | 'friendly-rounded'
  | 'luxury-contrast'
  | 'minimal-clean'
  | 'creative-expressive'
  | 'professional-corporate'
  | 'artistic-handwritten';

export type ContentTone =
  | 'formal'
  | 'casual'
  | 'friendly'
  | 'professional'
  | 'playful'
  | 'elegant'
  | 'technical'
  | 'creative'
  | 'luxurious'
  | 'minimal';

export type FontWeight = 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';

export type FontStyle = 'normal' | 'italic' | 'oblique';

interface FontPair {
  heading: {
    family: string;
    weight: FontWeight;
    style: FontStyle;
    size: string;
    lineHeight: number;
    letterSpacing: string;
  };
  body: {
    family: string;
    weight: FontWeight;
    style: FontStyle;
    size: string;
    lineHeight: number;
    letterSpacing: string;
  };
  accent?: {
    family: string;
    weight: FontWeight;
    style: FontStyle;
    size: string;
    lineHeight: number;
    letterSpacing: string;
  };
}

interface ContextualFontPairingProps {
  children: React.ReactNode;
  pairing?: FontPairing;
  tone?: ContentTone;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  animate?: boolean;
  transition?: 'smooth' | 'elastic' | 'bouncy' | 'gentle';
  onPairingChange?: (pairing: FontPair) => void;
}

const fontPairings: Record<FontPairing, FontPair> = {
  'elegant-serif': {
    heading: {
      family: 'Playfair Display, serif',
      weight: 'bold',
      style: 'normal',
      size: '2.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em'
    },
    body: {
      family: 'Source Serif Pro, serif',
      weight: 'normal',
      style: 'normal',
      size: '1rem',
      lineHeight: 1.6,
      letterSpacing: '0.01em'
    },
    accent: {
      family: 'Crimson Text, serif',
      weight: 'medium',
      style: 'italic',
      size: '1.125rem',
      lineHeight: 1.4,
      letterSpacing: '0.02em'
    }
  },
  'modern-sans': {
    heading: {
      family: 'Inter, sans-serif',
      weight: 'extrabold',
      style: 'normal',
      size: '2.25rem',
      lineHeight: 1.1,
      letterSpacing: '-0.03em'
    },
    body: {
      family: 'Inter, sans-serif',
      weight: 'normal',
      style: 'normal',
      size: '1rem',
      lineHeight: 1.6,
      letterSpacing: '-0.01em'
    },
    accent: {
      family: 'Inter, sans-serif',
      weight: 'medium',
      style: 'normal',
      size: '1.125rem',
      lineHeight: 1.5,
      letterSpacing: '-0.01em'
    }
  },
  'playful-display': {
    heading: {
      family: 'Fredoka One, cursive',
      weight: 'bold',
      style: 'normal',
      size: '2.75rem',
      lineHeight: 1.1,
      letterSpacing: '-0.01em'
    },
    body: {
      family: 'Nunito, sans-serif',
      weight: 'normal',
      style: 'normal',
      size: '1rem',
      lineHeight: 1.6,
      letterSpacing: '0.01em'
    },
    accent: {
      family: 'Caveat, cursive',
      weight: 'normal',
      style: 'normal',
      size: '1.25rem',
      lineHeight: 1.4,
      letterSpacing: '0.02em'
    }
  },
  'technical-mono': {
    heading: {
      family: 'JetBrains Mono, monospace',
      weight: 'bold',
      style: 'normal',
      size: '2rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em'
    },
    body: {
      family: 'JetBrains Mono, monospace',
      weight: 'normal',
      style: 'normal',
      size: '1rem',
      lineHeight: 1.6,
      letterSpacing: '0.02em'
    },
    accent: {
      family: 'Fira Code, monospace',
      weight: 'medium',
      style: 'normal',
      size: '1rem',
      lineHeight: 1.5,
      letterSpacing: '0.02em'
    }
  },
  'friendly-rounded': {
    heading: {
      family: 'Poppins, sans-serif',
      weight: 'bold',
      style: 'normal',
      size: '2.5rem',
      lineHeight: 1.1,
      letterSpacing: '-0.02em'
    },
    body: {
      family: 'Poppins, sans-serif',
      weight: 'normal',
      style: 'normal',
      size: '1rem',
      lineHeight: 1.6,
      letterSpacing: '0.01em'
    },
    accent: {
      family: 'Poppins, sans-serif',
      weight: 'medium',
      style: 'normal',
      size: '1.125rem',
      lineHeight: 1.5,
      letterSpacing: '0.01em'
    }
  },
  'luxury-contrast': {
    heading: {
      family: 'Didot, serif',
      weight: 'bold',
      style: 'normal',
      size: '3rem',
      lineHeight: 1.1,
      letterSpacing: '-0.03em'
    },
    body: {
      family: 'Garamond, serif',
      weight: 'normal',
      style: 'normal',
      size: '1.125rem',
      lineHeight: 1.7,
      letterSpacing: '0.01em'
    },
    accent: {
      family: 'Bodoni, serif',
      weight: 'medium',
      style: 'italic',
      size: '1.25rem',
      lineHeight: 1.4,
      letterSpacing: '0.02em'
    }
  },
  'minimal-clean': {
    heading: {
      family: 'Helvetica Neue, sans-serif',
      weight: 'light',
      style: 'normal',
      size: '2.25rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em'
    },
    body: {
      family: 'Helvetica Neue, sans-serif',
      weight: 'normal',
      style: 'normal',
      size: '1rem',
      lineHeight: 1.6,
      letterSpacing: '0.01em'
    },
    accent: {
      family: 'Helvetica Neue, sans-serif',
      weight: 'medium',
      style: 'normal',
      size: '1rem',
      lineHeight: 1.5,
      letterSpacing: '0.01em'
    }
  },
  'creative-expressive': {
    heading: {
      family: 'Abril Fatface, serif',
      weight: 'bold',
      style: 'normal',
      size: '2.75rem',
      lineHeight: 1.1,
      letterSpacing: '-0.02em'
    },
    body: {
      family: 'Open Sans, sans-serif',
      weight: 'normal',
      style: 'normal',
      size: '1rem',
      lineHeight: 1.6,
      letterSpacing: '0.01em'
    },
    accent: {
      family: 'Dancing Script, cursive',
      weight: 'normal',
      style: 'normal',
      size: '1.25rem',
      lineHeight: 1.4,
      letterSpacing: '0.02em'
    }
  },
  'professional-corporate': {
    heading: {
      family: 'Roboto, sans-serif',
      weight: 'bold',
      style: 'normal',
      size: '2.25rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em'
    },
    body: {
      family: 'Roboto, sans-serif',
      weight: 'normal',
      style: 'normal',
      size: '1rem',
      lineHeight: 1.6,
      letterSpacing: '0.01em'
    },
    accent: {
      family: 'Roboto, sans-serif',
      weight: 'medium',
      style: 'normal',
      size: '1.125rem',
      lineHeight: 1.5,
      letterSpacing: '0.01em'
    }
  },
  'artistic-handwritten': {
    heading: {
      family: 'Great Vibes, cursive',
      weight: 'normal',
      style: 'normal',
      size: '2.5rem',
      lineHeight: 1.2,
      letterSpacing: '0.02em'
    },
    body: {
      family: 'Lora, serif',
      weight: 'normal',
      style: 'normal',
      size: '1rem',
      lineHeight: 1.6,
      letterSpacing: '0.01em'
    },
    accent: {
      family: 'Pacifico, cursive',
      weight: 'normal',
      style: 'normal',
      size: '1.25rem',
      lineHeight: 1.4,
      letterSpacing: '0.02em'
    }
  }
};

const toneToPairing: Record<ContentTone, FontPairing> = {
  formal: 'elegant-serif',
  casual: 'friendly-rounded',
  friendly: 'friendly-rounded',
  professional: 'professional-corporate',
  playful: 'playful-display',
  elegant: 'luxury-contrast',
  technical: 'technical-mono',
  creative: 'creative-expressive',
  luxurious: 'luxury-contrast',
  minimal: 'minimal-clean'
};

export const ContextualFontPairing: React.FC<ContextualFontPairingProps> = ({
  children,
  pairing,
  tone = 'casual',
  className,
  as: Component = 'div',
  animate = true,
  transition = 'smooth',
  onPairingChange,
}) => {
  const [currentPairing, setCurrentPairing] = useState<FontPair>(
    fontPairings[pairing || toneToPairing[tone]]
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  // Update pairing when tone or pairing prop changes
  useEffect(() => {
    const newPairing = fontPairings[pairing || toneToPairing[tone]];
    if (JSON.stringify(newPairing) !== JSON.stringify(currentPairing)) {
      setIsTransitioning(true);
      setCurrentPairing(newPairing);
      onPairingChange?.(newPairing);

      // Reset transition state after animation
      const timer = setTimeout(() => setIsTransitioning(false), 500);
      return () => clearTimeout(timer);
    }
  }, [pairing, tone, currentPairing, onPairingChange]);

  const getTransitionVariants = () => {
    switch (transition) {
      case 'elastic':
        return {
          scale: [0.9, 1.1, 1],
          opacity: [0.8, 1, 1],
          transition: {
            duration: 0.6,
            ease: "easeOut",
            type: "spring",
            stiffness: 200,
            damping: 15
          }
        };
      case 'bouncy':
        return {
          scale: [0.8, 1.2, 0.9, 1.05, 1],
          opacity: [0.5, 1, 1, 1, 1],
          transition: {
            duration: 0.8,
            ease: "easeOut",
            times: [0, 0.3, 0.6, 0.8, 1]
          }
        };
      case 'gentle':
        return {
          opacity: [0.7, 1],
          y: [10, 0],
          transition: {
            duration: 0.4,
            ease: "easeOut"
          }
        };
      default: // smooth
        return {
          opacity: [0.8, 1],
          scale: [0.98, 1],
          transition: {
            duration: 0.3,
            ease: "easeOut"
          }
        };
    }
  };

  const renderContent = () => {
    return (
      <motion.div
        ref={ref}
        className={className}
        animate={animate && isInView ? controls : {}}
        style={{
          fontFamily: currentPairing.body.family,
          fontWeight: currentPairing.body.weight,
          fontStyle: currentPairing.body.style,
          fontSize: currentPairing.body.size,
          lineHeight: currentPairing.body.lineHeight,
          letterSpacing: currentPairing.body.letterSpacing,
          transition: isTransitioning ? 'all 0.3s ease-in-out' : undefined
        }}
      >
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            // Apply heading styles to h1-h6 elements
            if (child.type && typeof child.type === 'string' && child.type.match(/^h[1-6]$/)) {
              return React.cloneElement(child, {
                style: {
                  ...child.props.style,
                  fontFamily: currentPairing.heading.family,
                  fontWeight: currentPairing.heading.weight,
                  fontStyle: currentPairing.heading.style,
                  fontSize: currentPairing.heading.size,
                  lineHeight: currentPairing.heading.lineHeight,
                  letterSpacing: currentPairing.heading.letterSpacing,
                }
              });
            }
            // Apply accent styles to em, strong, or mark elements
            if (child.type === 'em' || child.type === 'strong' || child.type === 'mark') {
              return React.cloneElement(child, {
                style: {
                  ...child.props.style,
                  fontFamily: currentPairing.accent?.family || currentPairing.body.family,
                  fontWeight: currentPairing.accent?.weight || currentPairing.body.weight,
                  fontStyle: currentPairing.accent?.style || currentPairing.body.style,
                  fontSize: currentPairing.accent?.size || currentPairing.body.size,
                  lineHeight: currentPairing.accent?.lineHeight || currentPairing.body.lineHeight,
                  letterSpacing: currentPairing.accent?.letterSpacing || currentPairing.body.letterSpacing,
                }
              });
            }
          }
          return child;
        })}
      </motion.div>
    );
  };

  return (
    <Component className={cn('contextual-font-pairing', className)}>
      <div style={{ position: 'relative' }}>
        {renderContent()}

        {/* Font loading indicator */}
        <motion.div
          className="absolute -top-2 -right-2 text-xs text-gray-400 opacity-0"
          animate={{
            opacity: isTransitioning ? [0, 1, 0] : 0
          }}
          transition={{ duration: 0.5 }}
        >
          Loading fonts...
        </motion.div>
      </div>
    </Component>
  );
};

// Specialized font pairing components
export const ElegantFontPairing: React.FC<Omit<ContextualFontPairingProps, 'pairing'>> = (props) => (
  <ContextualFontPairing {...props} pairing="elegant-serif" />
);

export const ModernFontPairing: React.FC<Omit<ContextualFontPairingProps, 'pairing'>> = (props) => (
  <ContextualFontPairing {...props} pairing="modern-sans" />
);

export const PlayfulFontPairing: React.FC<Omit<ContextualFontPairingProps, 'pairing'>> = (props) => (
  <ContextualFontPairing {...props} pairing="playful-display" />
);

export const TechnicalFontPairing: React.FC<Omit<ContextualFontPairingProps, 'pairing'>> = (props) => (
  <ContextualFontPairing {...props} pairing="technical-mono" />
);

export const ProfessionalFontPairing: React.FC<Omit<ContextualFontPairingProps, 'pairing'>> = (props) => (
  <ContextualFontPairing {...props} pairing="professional-corporate" />
);

export const LuxuryFontPairing: React.FC<Omit<ContextualFontPairingProps, 'pairing'>> = (props) => (
  <ContextualFontPairing {...props} pairing="luxury-contrast" />
);

export const MinimalFontPairing: React.FC<Omit<ContextualFontPairingProps, 'pairing'>> = (props) => (
  <ContextualFontPairing {...props} pairing="minimal-clean" />
);

export const CreativeFontPairing: React.FC<Omit<ContextualFontPairingProps, 'pairing'>> = (props) => (
  <ContextualFontPairing {...props} pairing="creative-expressive" />
);

// Tone-based components
export const FormalFontPairing: React.FC<Omit<ContextualFontPairingProps, 'tone'>> = (props) => (
  <ContextualFontPairing {...props} tone="formal" />
);

export const FriendlyFontPairing: React.FC<Omit<ContextualFontPairingProps, 'tone'>> = (props) => (
  <ContextualFontPairing {...props} tone="friendly" />
);

export const CreativeToneFontPairing: React.FC<Omit<ContextualFontPairingProps, 'tone'>> = (props) => (
  <ContextualFontPairing {...props} tone="creative" />
);

export const ElegantToneFontPairing: React.FC<Omit<ContextualFontPairingProps, 'tone'>> = (props) => (
  <ContextualFontPairing {...props} tone="elegant" />
);