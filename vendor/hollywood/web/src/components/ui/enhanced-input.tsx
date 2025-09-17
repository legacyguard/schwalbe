
import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { MicroAnimation } from '@/components/animations/MicroInteractionSystem';
import { Icon, type IconMap } from '@/components/ui/icon-library';

const inputVariants = cva(
  'flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-input focus-visible:ring-1 focus-visible:ring-ring',
        success:
          'border-green-500 focus-visible:ring-1 focus-visible:ring-green-500',
        error: 'border-red-500 focus-visible:ring-1 focus-visible:ring-red-500',
        warning:
          'border-yellow-500 focus-visible:ring-1 focus-visible:ring-yellow-500',
      },
      size: {
        default: 'h-9 px-3 py-1',
        sm: 'h-8 px-2 py-1 text-xs',
        lg: 'h-11 px-4 py-2 text-base',
        xl: 'h-12 px-5 py-3 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

// Field state types
type FieldState =
  | 'error'
  | 'filled'
  | 'focused'
  | 'idle'
  | 'loading'
  | 'success'
  | 'warning';

export interface EnhancedInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  animateLabel?: boolean;
  animateOnError?: boolean;
  animateOnFocus?: boolean;
  error?: boolean | string;

  errorIcon?: keyof typeof IconMap;
  errorText?: string;
  glowEffect?: boolean;
  helpText?: string;
  // Enhanced label and help text
  label?: string;

  // Icon props
  leftIcon?: keyof typeof IconMap;
  loading?: boolean;
  loadingIcon?: keyof typeof IconMap;
  maxLength?: number;
  // Animation props
  personalityAdapt?: boolean;
  rightIcon?: keyof typeof IconMap;

  rippleEffect?: boolean;
  // Visual enhancements
  showCharacterCount?: boolean;
  // Stagger animation delay
  staggerDelay?: number;
  // Field state props
  state?: FieldState;
  success?: boolean;

  successIcon?: keyof typeof IconMap;
  successText?: string;
  warning?: boolean | string;
  warningIcon?: keyof typeof IconMap;

  warningText?: string;
}

const EnhancedInput = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
  (
    {
      className,
      type = 'text',
      variant,
      size,
      personalityAdapt = true,
      animateOnFocus = true,
      animateOnError = true,
      animateLabel = true,
      state: _state = 'idle',
      loading = false,
      success = false,
      error = false,
      warning = false,
      leftIcon,
      rightIcon,
      loadingIcon = 'loader',
      successIcon = 'check-circle',
      errorIcon = 'alert-circle',
      warningIcon = 'alert-triangle',
      label,
      helpText,
      successText,
      errorText,
      warningText,
      showCharacterCount = false,
      maxLength,
      rippleEffect = false,
      glowEffect = false,
      staggerDelay = 0,
      value,
      onFocus,
      onBlur,
      onChange,
      ...props
    },
    ref
  ) => {
    // TODO: Re-enable when Sofia personality system is available
    // const { personality } = useSofia()
    const personality = {
      mode: 'adaptive' as 'adaptive' | 'default' | 'empathetic' | 'pragmatic',
    };
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);
    const [ripples, setRipples] = React.useState<
      Array<{ id: number; x: number; y: number }>
    >([]);
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Determine current field state
    const currentState: FieldState = React.useMemo(() => {
      if (loading) return 'loading';
      if (error) return 'error';
      if (warning) return 'warning';
      if (success) return 'success';
      if (isFocused) return 'focused';
      if (hasValue) return 'filled';
      return 'idle';
    }, [loading, error, warning, success, isFocused, hasValue]);

    // Update hasValue when value changes
    React.useEffect(() => {
      setHasValue(Boolean(value && String(value).length > 0));
    }, [value]);

    // Determine variant based on state
    const currentVariant = React.useMemo(() => {
      if (error) return 'error';
      if (warning) return 'warning';
      if (success) return 'success';
      return variant || 'default';
    }, [error, warning, success, variant]);

    // Get current message text
    const getCurrentMessage = () => {
      if (error && (errorText || typeof error === 'string')) {
        return errorText || (typeof error === 'string' ? error : '');
      }
      if (warning && (warningText || typeof warning === 'string')) {
        return warningText || (typeof warning === 'string' ? warning : '');
      }
      if (success && successText) return successText;
      return helpText;
    };

    // Get current icon
    const getCurrentStateIcon = () => {
      if (loading) return loadingIcon;
      if (error) return errorIcon;
      if (warning) return warningIcon;
      if (success) return successIcon;
      return null;
    };

    // Handle focus events
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    // Handle change events
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(Boolean(e.target.value.length > 0));
      onChange?.(e);
    };

    // Handle ripple effect
    const handleRippleClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (rippleEffect && inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const newRipple = {
          id: Date.now() + Math.random(),
          x,
          y,
        };

        setRipples(prev => [...prev, newRipple]);

        setTimeout(() => {
          setRipples(prev => prev.filter(r => r.id !== newRipple.id));
        }, 600);
      }
    };

    // Get personality-specific animation type
    const getPersonalityAnimation = () => {
      if (!personalityAdapt) return 'focus-ring';

      switch (personality.mode) {
        case 'empathetic':
          return 'hover-glow';
        case 'pragmatic':
          return 'focus-ring';
        case 'adaptive':
          return 'fade-in-up';
        default:
          return 'focus-ring';
      }
    };

    // Character count
    const characterCount = value ? String(value).length : 0;

    return (
      <MicroAnimation
        type='fade-in-up'
        delay={staggerDelay}
        className='space-y-2'
      >
        {/* Label */}
        {label && (
          <MicroAnimation
            type={animateLabel ? 'slide-reveal' : 'fade-in-up'}
            delay={staggerDelay + 0.1}
          >
            <label
              className={cn(
                'block text-sm font-medium transition-colors duration-200',
                currentState === 'error' && 'text-red-600',
                currentState === 'warning' && 'text-yellow-600',
                currentState === 'success' && 'text-green-600',
                currentState === 'focused' &&
                  personalityAdapt && {
                    'text-pink-600': personality.mode === 'empathetic',
                    'text-gray-700': personality.mode === 'pragmatic',
                    'text-blue-600': personality.mode === 'adaptive',
                  }
              )}
            >
              {label}
            </label>
          </MicroAnimation>
        )}

        {/* Input container */}
        <div className='relative'>
          <MicroAnimation
            type={
              animateOnError && error
                ? 'error-shake'
                : getPersonalityAnimation()
            }
            disabled={!animateOnFocus && !error}
            className='relative'
          >
            <div
              className='relative overflow-hidden rounded-md'
              onClick={handleRippleClick}
            >
              {/* Ripple effects */}
              {rippleEffect && (
                <div className='absolute inset-0 overflow-hidden rounded-inherit'>
                  <AnimatePresence>
                    {ripples.map(ripple => (
                      <motion.div
                        key={ripple.id}
                        className='absolute bg-primary opacity-20 rounded-full pointer-events-none'
                        style={{
                          left: ripple.x - 10,
                          top: ripple.y - 10,
                          width: 20,
                          height: 20,
                        }}
                        initial={{ scale: 0, opacity: 0.3 }}
                        animate={{
                          scale: 3,
                          opacity: 0,
                          transition: { duration: 0.6, ease: 'easeOut' },
                        }}
                        exit={{ opacity: 0 }}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Glow effect */}
              {glowEffect && isFocused && (
                <motion.div
                  className='absolute inset-0 -m-1 bg-gradient-to-r from-primary/20 to-primary/20 rounded-lg blur-sm'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              )}

              {/* Left icon */}
              <AnimatePresence>
                {leftIcon && (
                  <motion.div
                    className='absolute left-3 top-1/2 transform -translate-y-1/2 z-10'
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Icon
                      name={leftIcon}
                      className='w-4 h-4 text-muted-foreground'
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input field */}
              <input
                type={type}
                className={cn(
                  inputVariants({ variant: currentVariant, size: size as any }),
                  leftIcon && 'pl-10',
                  (rightIcon || getCurrentStateIcon() || showCharacterCount) &&
                    'pr-10',
                  glowEffect && isFocused && 'ring-2 ring-primary/20',
                  className
                )}
                ref={ref || inputRef}
                value={value}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onChange={handleChange}
                maxLength={maxLength}
                {...props}
              />

              {/* Right side content */}
              <div className='absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1'>
                {/* Character count */}
                <AnimatePresence>
                  {showCharacterCount && maxLength && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className={cn(
                        'text-xs transition-colors',
                        characterCount > maxLength * 0.9 && 'text-yellow-500',
                        characterCount === maxLength && 'text-red-500'
                      )}
                    >
                      {characterCount}/{maxLength}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* State icon */}
                <AnimatePresence mode='wait'>
                  {getCurrentStateIcon() && (
                    <motion.div
                      key={getCurrentStateIcon()}
                      initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        rotate: 0,
                        ...(loading && { rotate: 360 }),
                      }}
                      exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
                      transition={{
                        duration: 0.3,
                        rotate: {
                          duration: loading ? 1 : 0.3,
                          repeat: loading ? Infinity : 0,
                          ease: 'linear',
                        },
                      }}
                    >
                      <Icon
                        name={getCurrentStateIcon()!}
                        className={cn(
                          'w-4 h-4',
                          currentState === 'error' && 'text-red-500',
                          currentState === 'warning' && 'text-yellow-500',
                          currentState === 'success' && 'text-green-500',
                          currentState === 'loading' &&
                            'text-primary animate-spin'
                        )}
                      />
                    </motion.div>
                  )}
                  {rightIcon && !getCurrentStateIcon() && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Icon
                        name={rightIcon}
                        className='w-4 h-4 text-muted-foreground'
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </MicroAnimation>
        </div>

        {/* Help/Error/Success text */}
        <AnimatePresence mode='wait'>
          {getCurrentMessage() && (
            <motion.p
              key={getCurrentMessage()}
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={cn(
                'text-sm transition-colors duration-200',
                currentState === 'error' && 'text-red-600',
                currentState === 'warning' && 'text-yellow-600',
                currentState === 'success' && 'text-green-600',
                !error && !warning && !success && 'text-muted-foreground'
              )}
            >
              {getCurrentMessage()}
            </motion.p>
          )}
        </AnimatePresence>
      </MicroAnimation>
    );
  }
);

EnhancedInput.displayName = 'EnhancedInput';

// Specialized input components
export const PersonalityInput = React.forwardRef<
  HTMLInputElement,
  Omit<EnhancedInputProps, 'personalityAdapt'>
>((props, ref) => (
  <EnhancedInput
    ref={ref}
    personalityAdapt={true}
    animateOnFocus={true}
    animateOnError={true}
    glowEffect={true}
    {...props}
  />
));

PersonalityInput.displayName = 'PersonalityInput';

export const ValidatedInput = React.forwardRef<
  HTMLInputElement,
  EnhancedInputProps & {
    validation?: (value: string) => { message?: string; valid: boolean };
  }
>(({ validation, onChange, ...props }, ref) => {
  const [validationState, setValidationState] = React.useState<{
    message?: string;
    valid: boolean;
  }>({ valid: true });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (validation) {
      const result = validation(value);
      setValidationState(result);
    }
    onChange?.(e);
  };

  return (
    <EnhancedInput
      ref={ref}
      error={!validationState.valid ? validationState.message || true : false}
      success={validationState.valid && Boolean(props.value)}
      onChange={handleChange}
      personalityAdapt={true}
      {...props}
    />
  );
});

ValidatedInput.displayName = 'ValidatedInput';

export { EnhancedInput, inputVariants };
export type { FieldState };
