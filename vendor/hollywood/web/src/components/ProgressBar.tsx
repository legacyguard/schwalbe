
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  className?: string;
  label?: string;
  max?: number;
  showPercentage?: boolean;
  value: number;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  className,
  showPercentage = true,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercentage) && (
        <div className='flex justify-between items-center mb-2'>
          {label && (
            <span className='text-sm font-medium text-card-foreground'>
              {label}
            </span>
          )}
          {showPercentage && (
            <span className='text-sm text-muted-foreground'>
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div className='w-full bg-progress-bg rounded-full h-2 overflow-hidden'>
        <div
          className='h-full bg-progress-fill transition-all duration-500 ease-out rounded-full'
          style={{ width: `${percentage}}%` }}
        />
      </div>
    </div>
  );
}
