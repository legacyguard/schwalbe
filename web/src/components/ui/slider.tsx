
import * as React from 'react';
// TODO: Re-enable when Radix UI slider is properly configured
// import * as SliderPrimitive from '@radix-ui/react-slider';

import { cn } from '@/lib/utils';

interface SliderProps extends React.HTMLAttributes<HTMLDivElement> {
  disabled?: boolean;
  max?: number;
  min?: number;
  onValueChange: (value: number[]) => void;
  step?: number;
  value: number[];
}

/**
 * Temporary slider component - needs proper Radix UI implementation
 * @deprecated This is a placeholder implementation
 */
const Slider = React.memo(
  React.forwardRef<HTMLDivElement, SliderProps>(
    ({ className, value, onValueChange, max = 100, min = 0, step = 1, disabled, ...props }, ref) => {
      const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (disabled) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const newValue = Math.round((percent * (max - min) + min) / step) * step;
        const clampedValue = Math.min(Math.max(newValue, min), max);

        // For now, just update the first value for simplicity
        const newValues = [...value];
        newValues[0] = clampedValue;
        onValueChange(newValues);
      };

      const getThumbPosition = (val: number) => {
        return ((val - min) / (max - min)) * 100;
      };

      return (
        <div
          ref={ref}
          className={cn(
            'relative flex w-full touch-none select-none items-center',
            disabled && 'opacity-50 pointer-events-none',
            className
          )}
          onMouseDown={handleMouseDown}
          {...props}
        >
          <div className='relative h-2 w-full grow overflow-hidden rounded-full bg-secondary'>
            <div
              className='absolute h-full bg-primary'
              style={{
                width: `${getThumbPosition(value[0] || min)}%`
              }}
            />
          </div>
          <div
            className='absolute block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
            style={{
              left: `calc(${getThumbPosition(value[0] || min)}% - 10px)`
            }}
          />
          {value.length > 1 && (
            <div
              className='absolute block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
              style={{
                left: `calc(${getThumbPosition(value[1])}% - 10px)`
              }}
            />
          )}
        </div>
      );
    }
  )
);
Slider.displayName = 'Slider';

export { Slider };
