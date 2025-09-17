
import { Card } from '@/components/ui/card';
import { Icon, type IconName } from '@/components/ui/icon-library';
import { FadeIn } from '@/components/motion/FadeIn';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  change?: number;
  changeLabel?: string;
  className?: string;
  color?: 'danger' | 'info' | 'primary' | 'success' | 'warning';
  icon: IconName;
  loading?: boolean;
  onClick?: () => void;
  title: string;
  trend?: 'down' | 'neutral' | 'up';
  value: number | string;
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  trend = 'neutral',
  color = 'primary',
  loading = false,
  onClick,
  className,
}: MetricCardProps) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-green-500/10 text-green-600',
    warning: 'bg-yellow-500/10 text-yellow-600',
    danger: 'bg-red-500/10 text-red-600',
    info: 'bg-blue-500/10 text-blue-600',
  };

  const trendClasses = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600',
  };

  const gradientClasses = {
    primary: 'from-primary to-primary-hover',
    success: 'from-green-500 to-green-600',
    warning: 'from-yellow-500 to-yellow-600',
    danger: 'from-red-500 to-red-600',
    info: 'from-blue-500 to-blue-600',
  };

  return (
    <FadeIn duration={0.5}>
      <Card
        className={cn(
          'relative overflow-hidden transition-all duration-300',
          onClick && 'cursor-pointer hover:shadow-lg hover:-translate-y-1',
          className
        )}
        onClick={onClick}
      >
        <div className='p-6'>
          <div className='flex items-center justify-between'>
            <div className='flex-1'>
              <p className='text-sm font-medium text-muted-foreground'>
                {title}
              </p>

              {loading ? (
                <div className='mt-2 space-y-2'>
                  <div className='h-8 w-24 bg-muted animate-pulse rounded' />
                  <div className='h-4 w-16 bg-muted animate-pulse rounded' />
                </div>
              ) : (
                <>
                  <p className='text-2xl font-bold mt-2 text-card-foreground'>
                    {value}
                  </p>

                  {(change !== undefined || changeLabel) && (
                    <div
                      className={cn(
                        'flex items-center mt-2 text-sm',
                        trendClasses[trend]
                      )}
                    >
                      {trend !== 'neutral' && (
                        <Icon
                          name={
                            trend === 'up' ? 'trending-up' : 'trending-down'
                          }
                          className='w-4 h-4 mr-1'
                        />
                      )}
                      {change !== undefined && (
                        <span>
                          {change > 0 ? '+' : ''}
                          {change}%
                        </span>
                      )}
                      {changeLabel && (
                        <span className='ml-1'>{changeLabel}</span>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            <div
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center',
                colorClasses[color]
              )}
            >
              <Icon name={icon} className='w-6 h-6' />
            </div>
          </div>
        </div>

        {/* Decorative gradient bar */}
        <div
          className={cn(
            'absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r',
            gradientClasses[color]
          )}
        />
      </Card>
    </FadeIn>
  );
}

// Composite component for a grid of metrics
interface MetricsGridProps {
  className?: string;
  columns?: 2 | 3 | 4;
  metrics: Array<MetricCardProps>;
}

export function MetricsGrid({
  metrics,
  columns = 4,
  className,
}: MetricsGridProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4 md:gap-6', gridCols[columns], className)}>
      {metrics.map(metric => (
        <MetricCard key={`${metric.title}-${metric.value}`} {...metric} />
      ))}
    </div>
  );
}
