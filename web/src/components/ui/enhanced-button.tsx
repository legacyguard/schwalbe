
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MicroAnimation } from '@/components/animations/MicroInteractionSystem';
import {
  Icon,
  type IconMap,
  type IconName,
} from '@/components/ui/icon-library';
import { useTranslation } from '@/i18n/useTranslation';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        // Personality-aware variants
        empathetic:
          'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg hover:shadow-xl',
        pragmatic:
          'bg-gray-800 text-white border border-gray-600 shadow hover:bg-gray-700',
        adaptive:
          'bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg hover:shadow-xl',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        xl: 'h-12 rounded-lg px-10 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

// Enhanced button state management
interface ButtonState {
  errorText?: string | undefined;
  isError: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  loadingText?: string | undefined;
  successText?: string | undefined;
}

export interface EnhancedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  // Enhanced animation props
  animationType?: 'button-press' | 'hover-glow' | 'hover-lift' | 'tap-bounce';
  asChild?: boolean;
  error?: boolean;
  errorIcon?: keyof typeof IconMap;
  errorText?: string;
  // Icon props
  leftIcon?: keyof typeof IconMap | undefined;
  // Loading and state props
  loading?: boolean;
  loadingIcon?: keyof typeof IconMap;
  loadingText?: string;
  personalityAdapt?: boolean;
  rightIcon?: keyof typeof IconMap | undefined;
  rippleEffect?: boolean;
  // Animation props
  staggerDelay?: number;
  success?: boolean;
  successIcon?: keyof typeof IconMap;
  successText?: string;
}

/**
 * EnhancedButton component with advanced features:
 * - React.memo optimization for performance
 * - Personality-aware styling and animations
 * - Loading, success, and error states
 * - Ripple effects and micro-animations
 * - Icon support with animated transitions
 */
const EnhancedButton = React.memo(
  React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
    (
      {
        className,
        variant,
        size,
        asChild = false,
        animationType = 'button-press',
        personalityAdapt = true,
        loading = false,
        success = false,
        error = false,
        loadingText,
        successText,
        errorText,
        leftIcon,
        rightIcon,
        loadingIcon = 'loader',
        successIcon = 'check',
        errorIcon = 'alert-circle',
        staggerDelay = 0,
        rippleEffect = false,
        children,
        disabled,
        onClick,
        ...props
      },
      ref
    ) => {
      // TODO: Re-enable when Sofia personality system is available
      // const { personality } = useSofia()
      const personality = { mode: 'default' as 'adaptive' | 'default' | 'empathetic' | 'pragmatic' };
      const [ripples, setRipples] = React.useState<
        Array<{ id: number; x: number; y: number }>
      >([]);
      const buttonRef = React.useRef<HTMLButtonElement>(null);

      // Auto-adapt variant based on personality if enabled
      const adaptedVariant = personalityAdapt
        ? variant === 'default'
          ? personality.mode
          : variant
        : variant;

      // Handle button states
      const currentState: ButtonState = {
        isLoading: loading,
        isSuccess: success && !loading,
        isError: error && !loading,
        loadingText: loadingText || undefined,
        successText: successText || undefined,
        errorText: errorText || undefined,
      };

      // Get current display content
      const getCurrentContent = () => {
        if (currentState.isLoading && loadingText) return loadingText;
        if (currentState.isSuccess && successText) return successText;
        if (currentState.isError && errorText) return errorText;
        return children;
      };

      // Get current icon
      const getCurrentIcon = () => {
        if (currentState.isLoading) return loadingIcon;
        if (currentState.isSuccess) return successIcon;
        if (currentState.isError) return errorIcon;
        return null;
      };

      // Handle ripple effect
      const handleRippleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (rippleEffect && buttonRef.current) {
          const rect = buttonRef.current.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;

          const newRipple = {
            id: Date.now() + Math.random(),
            x,
            y,
          };

          setRipples(prev => [...prev, newRipple]);

          // Remove ripple after animation
          setTimeout(() => {
            setRipples(prev => prev.filter(r => r.id !== newRipple.id));
          }, 600);
        }

        if (onClick && !disabled && !loading) {
          onClick(event);
        }
      };

      // Personality-specific animation configurations
      const getPersonalityAnimation = () => {
        if (!personalityAdapt) return animationType;

        switch (personality.mode) {
          case 'empathetic':
            return 'hover-glow';
          case 'pragmatic':
            return 'tap-bounce';
          case 'adaptive':
            return 'hover-lift';
          default:
            return animationType;
        }
      };

      const Comp = asChild ? Slot : 'button';
      const isDisabled = disabled || loading;

      return (
        <MicroAnimation
          type={getPersonalityAnimation()}
          delay={staggerDelay}
          disabled={isDisabled}
          className='inline-block'
        >
          <Comp
            className={cn(
              buttonVariants({ variant: adaptedVariant as any, size, className })
            )}
            ref={ref || buttonRef}
            disabled={isDisabled}
            onClick={handleRippleClick}
            {...props}
          >
            <div className='relative flex items-center justify-center gap-2 overflow-hidden'>
              {/* Ripple effects */}
              {rippleEffect && (
                <div className='absolute inset-0 overflow-hidden rounded-inherit'>
                  <AnimatePresence>
                    {ripples.map(ripple => (
                      <motion.div
                        key={ripple.id}
                        className='absolute bg-white opacity-30 rounded-full pointer-events-none'
                        style={{
                          left: ripple.x - 10,
                          top: ripple.y - 10,
                          width: 20,
                          height: 20,
                        }}
                        initial={{ scale: 0, opacity: 0.6 }}
                        animate={{
                          scale: 4,
                          opacity: 0,
                          transition: { duration: 0.6, ease: 'easeOut' },
                        }}
                        exit={{ opacity: 0 }}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Left icon */}
              <AnimatePresence mode='wait'>
                {leftIcon && !getCurrentIcon() && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Icon name={leftIcon} className='w-4 h-4' />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* State icon (loading, success, error) */}
              <AnimatePresence mode='wait'>
                {getCurrentIcon() && (
                  <motion.div
                    key={getCurrentIcon()}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      rotate: currentState.isLoading ? 360 : 0,
                    }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{
                      duration: 0.3,
                      rotate: {
                        duration: currentState.isLoading ? 1 : 0.3,
                        repeat: currentState.isLoading ? Infinity : 0,
                        ease: 'linear',
                      },
                    }}
                  >
                    <Icon
                      name={getCurrentIcon()!}
                      className={cn(
                        'w-4 h-4',
                        currentState.isLoading && 'animate-spin'
                      )}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Button text content */}
              <AnimatePresence mode='wait'>
                <motion.span
                  key={String(getCurrentContent())}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className='flex items-center justify-center'
                >
                  {getCurrentContent()}
                </motion.span>
              </AnimatePresence>

              {/* Right icon */}
              <AnimatePresence mode='wait'>
                {rightIcon && !getCurrentIcon() && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Icon name={rightIcon} className='w-4 h-4' />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Comp>
        </MicroAnimation>
      );
  }
));

EnhancedButton.displayName = 'EnhancedButton';

// Specialized button components
export const LoadingButton = React.forwardRef<
  HTMLButtonElement,
  Omit<EnhancedButtonProps, 'loading' | 'loadingText'> & {
    isLoading: boolean;
    loadingText?: string;
  }
>(({ isLoading, loadingText, ...props }, ref) => {
  const { t } = useTranslation();
  return (
    <EnhancedButton
      ref={ref}
      loading={isLoading}
      loadingText={loadingText || t('ui.enhancedButton.loading')}
      {...props}
    />
  );
});

LoadingButton.displayName = 'LoadingButton';

export const PersonalityButton = React.forwardRef<
  HTMLButtonElement,
  Omit<EnhancedButtonProps, 'personalityAdapt'>
>((props, ref) => (
  <EnhancedButton
    ref={ref}
    personalityAdapt={true}
    rippleEffect={true}
    {...props}
  />
));

PersonalityButton.displayName = 'PersonalityButton';

export const ActionButton = React.forwardRef<
  HTMLButtonElement,
  EnhancedButtonProps & {
    action?: 'add' | 'cancel' | 'delete' | 'edit' | 'save' | 'submit';
  }
>(({ action, leftIcon, ...props }, ref) => {
  const getActionIcon = (action?: string): IconName | undefined => {
    switch (action) {
      case 'save':
        return 'check'; // save icon not in IconMap, using check
      case 'delete':
        return 'trash';
      case 'edit':
        return 'pencil';
      case 'add':
        return 'plus';
      case 'cancel':
        return 'x';
      case 'submit':
        return 'check';
      default:
        return leftIcon;
    }
  };

  return (
    <EnhancedButton
      ref={ref}
      leftIcon={leftIcon || getActionIcon(action)}
      personalityAdapt={true}
      rippleEffect={true}
      {...props}
    />
  );
});

ActionButton.displayName = 'ActionButton';

export { buttonVariants, EnhancedButton };
// export type { EnhancedButtonProps }
