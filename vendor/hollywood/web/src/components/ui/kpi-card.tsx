
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon, type IconName } from '@/components/ui/icon-library';
import { cn } from '@/lib/utils';

export type TrendType = 'down' | 'neutral' | 'up';
export type ChangeType = 'negative' | 'neutral' | 'positive';

export interface KPICardProps {
  change?: string;
  changeType?: ChangeType;
  className?: string;
  showTrend?: boolean;
  title: string;
  trendPosition?: 'bottom' | 'top';
  trendType?: TrendType;
  value: string;
}

const getTrendIcon = (trendType: TrendType): IconName => {
  switch (trendType) {
    case 'up':
      return 'trendingUp';
    case 'down':
      return 'trendingDown';
    case 'neutral':
    default:
      return 'arrowRight';
  }
};

const getChangeColor = (changeType: ChangeType): string => {
  switch (changeType) {
    case 'positive':
      return 'bg-status-success text-status-success-foreground';
    case 'negative':
      return 'bg-status-error text-status-error-foreground';
    case 'neutral':
    default:
      return 'bg-status-warning text-status-warning-foreground';
  }
};

export function KPICard({
  title,
  value,
  change,
  changeType = 'neutral',
  trendType = 'neutral',
  trendPosition = 'top',
  className,
  showTrend = true,
}: KPICardProps) {
  return (
    <Card className={cn('border border-card-border p-4 relative', className)}>
      <div className='flex flex-col gap-2'>
        <dt className='text-sm font-medium text-muted-foreground'>{title}</dt>
        <dd className='text-2xl font-semibold text-foreground'>{value}</dd>
      </div>

      {showTrend && change && (
        <Badge
          variant='secondary'
          className={cn(
            'absolute right-4 text-xs font-medium',
            getChangeColor(changeType),
            {
              'top-4': trendPosition === 'top',
              'bottom-4': trendPosition === 'bottom',
            }
          )}
        >
          <Icon name={getTrendIcon(trendType)} className='w-3 h-3 mr-1' />
          {change}
        </Badge>
      )}
    </Card>
  );
}

export default KPICard;
