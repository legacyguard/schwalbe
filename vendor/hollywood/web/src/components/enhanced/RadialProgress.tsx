
import { cn } from '@/lib/utils';
import { FadeIn } from '@/components/motion/FadeIn';

interface RadialProgressProps {
  animate?: boolean;
  backgroundColor?: string;
  className?: string;
  color?: 'danger' | 'info' | 'primary' | 'success' | 'warning';
  label?: string;
  showValue?: boolean;
  size?: 'lg' | 'md' | 'sm' | 'xl';
  strokeWidth?: number;
  value: number; // 0-100
}

export function RadialProgress({
  value,
  size = 'md',
  strokeWidth,
  label,
  showValue = true,
  color = 'primary',
  backgroundColor = 'hsl(var(--muted))',
  className,
  animate = true,
}: RadialProgressProps) {
  // Ensure value is between 0 and 100
  const normalizedValue = Math.min(100, Math.max(0, value));

  // Size configurations
  const sizeConfig = {
    sm: {
      width: 60,
      height: 60,
      fontSize: 'text-xs',
      stroke: strokeWidth || 4,
    },
    md: {
      width: 100,
      height: 100,
      fontSize: 'text-sm',
      stroke: strokeWidth || 6,
    },
    lg: {
      width: 140,
      height: 140,
      fontSize: 'text-base',
      stroke: strokeWidth || 8,
    },
    xl: {
      width: 180,
      height: 180,
      fontSize: 'text-lg',
      stroke: strokeWidth || 10,
    },
  };

  const config = sizeConfig[size];
  const radius = (config.width - config.stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset =
    circumference - (normalizedValue / 100) * circumference;

  // Color configurations
  const colorClasses = {
    primary: 'stroke-primary',
    success: 'stroke-green-500',
    warning: 'stroke-yellow-500',
    danger: 'stroke-red-500',
    info: 'stroke-blue-500',
  };

  return (
    <FadeIn duration={0.5}>
      <div
        className={cn('relative inline-flex flex-col items-center', className)}
      >
        <div className='relative'>
          <svg
            width={config.width}
            height={config.height}
            className='transform -rotate-90'
          >
            {/* Background circle */}
            <circle
              cx={config.width / 2}
              cy={config.height / 2}
              r={radius}
              stroke={backgroundColor}
              strokeWidth={config.stroke}
              fill='none'
              className='opacity-20'
            />

            {/* Progress circle */}
            <circle
              cx={config.width / 2}
              cy={config.height / 2}
              r={radius}
              stroke='currentColor'
              strokeWidth={config.stroke}
              fill='none'
              strokeLinecap='round'
              className={cn(
                colorClasses[color],
                animate && 'transition-all duration-1000 ease-out'
              )}
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: animate ? strokeDashoffset : circumference,
              }}
            />
          </svg>

          {/* Center content */}
          <div className='absolute inset-0 flex flex-col items-center justify-center'>
            {showValue && (
              <span
                className={cn(
                  'font-bold text-card-foreground',
                  config.fontSize
                )}
              >
                {normalizedValue}%
              </span>
            )}
            {label && (
              <span
                className={cn(
                  'text-muted-foreground mt-1',
                  size === 'sm' ? 'text-[10px]' : 'text-xs'
                )}
              >
                {label}
              </span>
            )}
          </div>
        </div>
      </div>
    </FadeIn>
  );
}

// Linear progress bar variant
interface LinearProgressProps {
  animate?: boolean;
  className?: string;
  color?: 'danger' | 'info' | 'primary' | 'success' | 'warning';
  height?: 'lg' | 'md' | 'sm';
  label?: string;
  showValue?: boolean;
  value: number;
}

export function LinearProgress({
  value,
  label,
  showValue = true,
  color = 'primary',
  height = 'md',
  animate = true,
  className,
}: LinearProgressProps) {
  const normalizedValue = Math.min(100, Math.max(0, value));

  const heightClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const colorClasses = {
    primary: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <FadeIn duration={0.5}>
      <div className={cn('w-full', className)}>
        {(label || showValue) && (
          <div className='flex justify-between items-center mb-2'>
            {label && (
              <span className='text-sm font-medium text-card-foreground'>
                {label}
              </span>
            )}
            {showValue && (
              <span className='text-sm text-muted-foreground'>
                {normalizedValue}%
              </span>
            )}
          </div>
        )}

        <div
          className={cn(
            'w-full bg-muted rounded-full overflow-hidden',
            heightClasses[height]
          )}
        >
          <div
            className={cn(
              'h-full rounded-full transition-all duration-1000 ease-out',
              colorClasses[color]
            )}
            style={{
              width: animate ? `${normalizedValue}}%` : '0%',
              transition: animate ? 'width 1s ease-out' : 'none',
            }}
          />
        </div>
      </div>
    </FadeIn>
  );
}

// Progress group for multiple progress items
interface ProgressGroupProps {
  className?: string;
  items: Array<{
    color?: 'danger' | 'info' | 'primary' | 'success' | 'warning';
    label: string;
    value: number;
  }>;
  size?: 'lg' | 'md' | 'sm';
  type?: 'linear' | 'radial';
}

export function ProgressGroup({
  items,
  type = 'linear',
  size = 'md',
  className,
}: ProgressGroupProps) {
  return (
    <div
      className={cn(
        type === 'radial' ? 'flex flex-wrap gap-4' : 'space-y-4',
        className
      )}
    >
      {items.map((item, index) =>
        type === 'radial' ? (
          <RadialProgress
            key={index}
            value={item.value}
            label={item.label}
            color={item.color || 'primary'}
            size={size as 'lg' | 'md' | 'sm' | 'xl'}
          />
        ) : (
          <LinearProgress
            key={index}
            value={item.value}
            label={item.label}
            color={item.color || 'primary'}
            height={size as 'lg' | 'md' | 'sm'}
          />
        )
      )}
    </div>
  );
}
