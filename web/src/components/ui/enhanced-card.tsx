
import * as React from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
} from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { MicroAnimation } from '@/components/animations/MicroInteractionSystem';
import { Icon, type IconMap } from '@/components/ui/icon-library';

const cardVariants = cva(
  'rounded-xl border bg-card text-card-foreground shadow transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'border-border',
        elevated: 'shadow-lg hover:shadow-xl',
        outlined: 'border-2 border-border',
        ghost: 'border-transparent shadow-none',
        // Personality variants
        empathetic:
          'border-pink-200 bg-gradient-to-br from-pink-50 to-purple-50',
        pragmatic: 'border-gray-300 bg-gray-50',
        adaptive: 'border-blue-200 bg-gradient-to-br from-blue-50 to-green-50',
      },
      size: {
        sm: 'p-3',
        default: 'p-4',
        lg: 'p-6',
        xl: 'p-8',
      },
      interactive: {
        none: '',
        hover: 'hover:shadow-md cursor-default',
        clickable: 'hover:shadow-md cursor-pointer active:scale-[0.98]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      interactive: 'none',
    },
  }
);

// Card interaction types
export type CardInteractionType =
  | 'bounce'
  | 'flip'
  | 'glow'
  | 'lift'
  | 'morphing'
  | 'pulse'
  | 'scale'
  | 'shake'
  | 'slide'
  | 'tilt';

export interface EnhancedCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  animationDuration?: number;
  // Animation props
  animationType?: CardInteractionType;
  backgroundPattern?: boolean;
  borderGradient?: boolean;

  clickEffect?: boolean;
  collapsible?: boolean;
  description?: string;
  disabled?: boolean;
  // Layout props
  expandable?: boolean;

  expanded?: boolean;
  // Visual props
  glowColor?: string;
  highlighted?: boolean;
  hoverEffect?: boolean;

  // Interaction props
  href?: string;
  icon?: keyof typeof IconMap;
  image?: string;
  // State props
  loading?: boolean;

  onClick?: () => void;
  onDoubleClick?: () => void;
  onHover?: (isHovered: boolean) => void;

  personalityAdapt?: boolean;
  selected?: boolean;
  // Animation timing
  staggerDelay?: number;

  subtitle?: string;
  // Content props
  title?: string;
}

const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  (
    {
      className,
      variant,
      size,
      interactive: _interactive,
      animationType = 'lift',
      personalityAdapt = true,
      hoverEffect = true,
      clickEffect = true,
      title,
      subtitle,
      description,
      icon,
      image,
      loading = false,
      disabled = false,
      selected = false,
      highlighted = false,
      href,
      onClick,
      onDoubleClick,
      onHover,
      glowColor,
      borderGradient = false,
      backgroundPattern = false,
      expandable: _expandable = false,
      collapsible: _collapsible = false,
      expanded: _expanded = false,
      staggerDelay = 0,
      animationDuration = 0.3,
      children,
      ...props
    },
    ref
  ) => {
    // TODO: Re-enable when Sofia personality system is available
    // const { personality } = useSofia()
    const personality = {
      mode: 'adaptive' as 'adaptive' | 'default' | 'empathetic' | 'pragmatic',
    };
  const [isHovered, setIsHovered] = React.useState(false);
    const cardRef = React.useRef<HTMLDivElement>(null);

    // Motion values for advanced interactions
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rotateX = useTransform(mouseY, [-100, 100], [5, -5]);
    const rotateY = useTransform(mouseX, [-100, 100], [-5, 5]);

    // Auto-adapt variant based on personality
    const adaptedVariant =
      personalityAdapt && variant === 'default' ? personality.mode : variant;

    // Get personality-specific animation
    const getPersonalityAnimation = (): CardInteractionType => {
      if (!personalityAdapt) return animationType;

      switch (personality.mode) {
        case 'empathetic':
          return 'glow';
        case 'pragmatic':
          return 'lift';
        case 'adaptive':
          return 'tilt';
        default:
          return animationType;
      }
    };

    const currentAnimation = getPersonalityAnimation();

    // Handle mouse movement for tilt effects
    const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
      if (currentAnimation !== 'tilt' || disabled) return;

      const rect = cardRef.current?.getBoundingClientRect();
      if (!rect) return;

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      mouseX.set(event.clientX - centerX);
      mouseY.set(event.clientY - centerY);
    };

    // Handle hover state
    const handleHover = (hovered: boolean) => {
      setIsHovered(hovered);
      onHover?.(hovered);

      if (!hovered && currentAnimation === 'tilt') {
        mouseX.set(0);
        mouseY.set(0);
      }
    };

    // Get animation variants
    const getCardVariants = () => {
      const baseVariants = {
        initial: {
          scale: 1,
          rotateX: 0,
          rotateY: 0,
          z: 0,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        },
        hover: {},
        pressed: {},
        disabled: {
          opacity: 0.6,
          scale: 1,
          transition: { duration: 0.2 },
        },
      };

      switch (currentAnimation) {
        case 'lift':
          return {
            ...baseVariants,
            hover: {
              y: -8,
              scale: 1.02,
              boxShadow:
                '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              transition: { duration: animationDuration, ease: 'easeOut' },
            },
            pressed: {
              y: -4,
              scale: 0.98,
              transition: { duration: 0.1 },
            },
          };

        case 'tilt':
          return {
            ...baseVariants,
            hover: {
              rotateX,
              rotateY,
              scale: 1.05,
              z: 50,
              transition: { duration: 0.1 },
            },
          };

        case 'glow':
          return {
            ...baseVariants,
            hover: {
              scale: 1.03,
              boxShadow: `0 0 20px ${glowColor || 'rgba(var(--primary), 0.3)'}`,
              transition: { duration: animationDuration },
            },
          };

        case 'scale':
          return {
            ...baseVariants,
            hover: {
              scale: 1.05,
              transition: { duration: animationDuration, ease: 'easeOut' },
            },
            pressed: {
              scale: 0.95,
              transition: { duration: 0.1 },
            },
          };

        case 'flip':
          return {
            ...baseVariants,
            hover: {
              rotateY: 10,
              scale: 1.02,
              transition: { duration: animationDuration },
            },
          };

        case 'bounce':
          return {
            ...baseVariants,
            hover: {
              y: [0, -10, 0],
              transition: {
                duration: animationDuration * 2,
                ease: 'easeOut',
              },
            },
          };

        case 'pulse':
          return {
            ...baseVariants,
            hover: {
              scale: [1, 1.05, 1],
              transition: {
                duration: animationDuration * 2,
                repeat: Infinity,
              },
            },
          };

        default:
          return baseVariants;
      }
    };

    // Determine if card should be interactive
    const isInteractive = Boolean(onClick || href) && !disabled;
    const interactiveLevel = isInteractive
      ? 'clickable'
      : hoverEffect
        ? 'hover'
        : 'none';

    const CardComponent = href ? motion.a : motion.div;
    const cardVariantProps = href ? { href } : {};

    return (
      <MicroAnimation
        type='fade-in-up'
        delay={staggerDelay}
        className='inline-block w-full'
      >
        <CardComponent
          ref={(ref as any) || cardRef}
          className={cn(
            cardVariants({
              variant: adaptedVariant,
              size,
              interactive: interactiveLevel,
            }),
            selected && 'ring-2 ring-primary ring-offset-2',
            highlighted && 'ring-2 ring-yellow-400 ring-offset-2',
            borderGradient && 'border-gradient-to-r from-primary to-secondary',
            className
          )}
          variants={getCardVariants() as any}
          initial='initial'
          animate={disabled ? 'disabled' : 'initial'}
          whileHover={!disabled && hoverEffect ? 'hover' : undefined}
          whileTap={!disabled && clickEffect ? 'pressed' : undefined}
          onMouseMove={handleMouseMove as any}
          onHoverStart={() => handleHover(true)}
          onHoverEnd={() => handleHover(false)}
          // Note: onTapStart removed as it was unused
          onClick={!disabled ? onClick : undefined}
          onDoubleClick={!disabled ? onDoubleClick : undefined}
          style={{
            perspective: 1000,
            transformStyle: 'preserve-3d',
          }}
          {...cardVariantProps}
          {...(props as any)}
        >
          {/* Background pattern */}
          {backgroundPattern && (
            <div className='absolute inset-0 opacity-5 rounded-inherit'>
              <div className='w-full h-full bg-gradient-to-br from-primary/20 via-transparent to-secondary/20' />
            </div>
          )}

          {/* Loading overlay */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className='absolute inset-0 bg-background/80 rounded-inherit flex items-center justify-center'
              >
                <Icon name='loader' className='w-6 h-6 animate-spin' />
              </motion.div>
            )}
          </AnimatePresence>

          <div className='relative'>
            {/* Header section */}
            {(title || subtitle || icon || image) && (
              <motion.div
                className='flex items-start space-x-4 mb-4'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: staggerDelay + 0.1 }}
              >
                {/* Icon or Image */}
                {(icon || image) && (
                  <motion.div
                    className='flex-shrink-0'
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {image ? (
                      <img
                        src={image}
                        alt=''
                        className='w-12 h-12 rounded-lg object-cover'
                      />
                    ) : icon ? (
                      <div
                        className={cn(
                          'w-12 h-12 rounded-lg flex items-center justify-center',
                          personalityAdapt && {
                            'bg-pink-100 text-pink-600':
                              personality.mode === 'empathetic',
                            'bg-gray-100 text-gray-600':
                              personality.mode === 'pragmatic',
                            'bg-blue-100 text-blue-600':
                              personality.mode === 'adaptive',
                          }
                        )}
                      >
                        <Icon name={icon} className='w-6 h-6' />
                      </div>
                    ) : null}
                  </motion.div>
                )}

                {/* Title and subtitle */}
                {(title || subtitle) && (
                  <div className='flex-1 min-w-0'>
                    {title && (
                      <motion.h3
                        className='text-lg font-semibold text-card-foreground truncate'
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: staggerDelay + 0.15 }}
                      >
                        {title}
                      </motion.h3>
                    )}
                    {subtitle && (
                      <motion.p
                        className='text-sm text-muted-foreground truncate'
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: staggerDelay + 0.2 }}
                      >
                        {subtitle}
                      </motion.p>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* Description */}
            {description && (
              <motion.p
                className='text-sm text-muted-foreground mb-4'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: staggerDelay + 0.25 }}
              >
                {description}
              </motion.p>
            )}

            {/* Main content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: staggerDelay + 0.3 }}
            >
              {children}
            </motion.div>
          </div>

          {/* Interaction indicator */}
          {isInteractive && (
            <motion.div
              className='absolute top-3 right-3 opacity-0 group-hover:opacity-100'
              initial={{ scale: 0 }}
              animate={{ scale: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <Icon
                name={href ? 'external-link' : ('arrow-right' as any)}
                className='w-4 h-4 text-muted-foreground'
              />
            </motion.div>
          )}
        </CardComponent>
      </MicroAnimation>
    );
  }
);

EnhancedCard.displayName = 'EnhancedCard';

// Specialized card components
export const PersonalityCard = React.forwardRef<
  HTMLDivElement,
  Omit<EnhancedCardProps, 'personalityAdapt'>
>((props, ref) => (
  <EnhancedCard
    ref={ref}
    personalityAdapt={true}
    hoverEffect={true}
    clickEffect={true}
    borderGradient={true}
    {...props}
  />
));

PersonalityCard.displayName = 'PersonalityCard';

export const InteractiveCard = React.forwardRef<
  HTMLDivElement,
  EnhancedCardProps
>((props, ref) => (
  <EnhancedCard
    ref={ref}
    animationType='lift'
    hoverEffect={true}
    clickEffect={true}
    personalityAdapt={true}
    {...props}
  />
));

InteractiveCard.displayName = 'InteractiveCard';

export const ContentCard = React.forwardRef<
  HTMLDivElement,
  EnhancedCardProps & {
    footer?: React.ReactNode;
    headerAction?: React.ReactNode;
  }
>(({ headerAction, footer, children, ...props }, ref) => (
  <EnhancedCard ref={ref} {...props}>
    {headerAction && (
      <div className='flex justify-end mb-4'>{headerAction}</div>
    )}
    {children}
    {footer && <div className='mt-4 pt-4 border-t border-border'>{footer}</div>}
  </EnhancedCard>
));

ContentCard.displayName = 'ContentCard';

export { cardVariants, EnhancedCard };
// export type { EnhancedCardProps, CardInteractionType };
